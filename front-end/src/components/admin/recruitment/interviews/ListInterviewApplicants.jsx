import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { reFreashReactTable, css, postData, toastMessageShow } from 'service/common.js';
import { groupBookingStatusList, flag_style, unsucessful_style } from '../../oncallui-react-framework/services/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import jQuery from 'jquery';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import {
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger,
    Input,
    InputIcon,
    ButtonGroup,
    Checkbox
} from '@salesforce/design-system-react';
import { MS_TENANTID } from '../../../../config.js';
import CreateApplicantModel from './CreateApplicantModel.jsx';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../scss/components/admin/item/item.scss';
import '../../scss/components/admin/member/member.scss';
import { getApplicantListByInterviewId } from '../actions/RecruitmentInterviewAction.js';
import _ from 'lodash';
import ArchiveModal from '../../oncallui-react-framework/view/Modal/ArchiveModal';
import ApplicantBulkUpdateStatus from './ApplicantBulkUpdateStatus.jsx';
import SelectionMSTable from '../../oncallui-react-framework/view/SelectionMSTable';
import { addApplicants, getApplicantsColumns } from '../RecruitmentCommon';
import CreateCabCertificate from '../applicants/application_header_action/CreateCabCertificate';
import { CustomModal } from '../../oncallui-react-framework/index.js';
import Row from '../../oncallui-react-framework/grid/Row';
import Col50 from '../../oncallui-react-framework/grid/Col50';
import SelectList from "../../oncallui-react-framework/input/SelectList";
import { getEmailTemplateOption, getGroupBookingEmailContent } from '../../../admin/recruitment/actions/RecruitmentAction.js';
import CreateEmployerContract from '../applicants/application_header_action/CreateEmployerContract';
import { MsalProvider } from "@azure/msal-react";
import {UpdateMeetingInvite} from '../../../admin/recruitment/azure_graph_ms_invite/MsUpdateCommon';
import { GetInvitedEventStatus } from '../../../admin/recruitment/azure_graph_ms_invite/MsEventStatusCommon';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";
import GBCancelInvite from './GBCancelInvite';
const msalInstance = new PublicClientApplication(msalConfig);


const determineListingControlColumns = () => {
    return [
        { label: 'Cancel Invite', value: '3',disabled: 'false' },
        { label: 'Generate CAB', value: '1', disabled: 'false' },
        { label: 'Employment contract', value: '2', disabled: 'false' },
    ];
}

/**
 * Class: ListInterviewApplicants
 */
class ListInterviewApplicants extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'id': true,
            'applicant_name': true,
            'email': true,
            'application_id': true,
            'job_name': true,
            'attendee_response': true,
            'applicant_meeting_status': true,
            'invited_on': true,
            'action': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            applicantList: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateApplicant: false,
            interview_id: this.props.props.match.params.id,
            row_selections: [],
            selected_row: [],
            showSubject: false,
            selected_template: '',
            openEmploymentContract: false,
            group_booking_email_template: '',
            group_booking_email_subject:'',
            ms_template: '',
            meeting_options: '',
            showAddApplicantModal: false,
            selected_header_check_box: false,
            send_status_update: false,
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchData = (state) => {
        this.setState({ loading: true });
        getApplicantListByInterviewId(
            this.state.interview_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                applicantList: res.rows,
                applicant_count: res.count,
                pages: res.pages,
                loading: false,
                row_selections: [],
                selected_row: [],
                header_checkbox: false
            });
        });
    }

    /**
     * Get the list based on filter value
     * @param {str} key
     * @param {str} value
     */
    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    get_ms_url_template=()=>{
        postData("recruitment/RecruitmentInterview/get_ms_url_template", {}).then((res) => {
            if (res.status) {
                this.setState({
                    ms_template: (res.data) ? res.data.template : ''
                })
            }
        });
    }

    /**
     * get the interview details by id
     */
    getInterviewById = (interview_id) => {
        postData("recruitment/RecruitmentInterview/get_interview_by_id", { interview_id: interview_id }).then((res) => {
            if (res.status) {
                this.setState(res.data,()=>{
                    if (res.data.meeting_link != '' && res.data.meeting_link !=null && res.data.ms_event_org_id !=null) {
                        let url = res.data.meeting_link
                        url = url.replace("https://teams.microsoft.com/l/meetup-join/", '');
                        url = url.split('/');

                        let org_id = res.data.ms_event_org_id
                        org_id = org_id.replace("https://graph.microsoft.com/v1.0/$metadata#users('", '');
                        org_id = org_id.replace("')/events/$entity", '');

                        let meeting_options = 'https://teams.microsoft.com/meetingOptions/?organizerId=' + org_id + '&tenantId=' + MS_TENANTID + '&threadId=' + url[0] + '&messageId=0&language=en-US';
                        this.setState({ meeting_options: meeting_options });
                    }
                    this.listHeaderOptions();
                });
                this.setState({ unsuccessful_reason_option : res.unsuccessful_reason_option, unsuccessful_reason :  res.unsuccessful_reason, showMsEventStatus: true })
                let email_key = res.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation';
                this.getGroupBookingEmailHtmlFormat(email_key);
                if (res.data.archive == 1) {
                    let displayed_columns = [...this.state.displayed_columns];
                    let id_index = displayed_columns.findIndex((value) => value == 'id');
                    displayed_columns.splice(id_index, 1);
                    this.setState({ displayed_columns })
                }
                
            }
        });
    }

    /*
    * get group booking template and replace the date and location
    */
    getGroupBookingEmailHtmlFormat = (email_key) => {
        this.setState({ loading: true });
        getGroupBookingEmailContent(email_key).then(res => {
            if(res){
                this.setState({
                    group_booking_email_template:  res.template_content,   
                    group_booking_email_subject: res.subject,       
                    loading: false      
                },()=>{
                    this.setState({showAddApplicantModal : true})
                });
            }
        });
    }


    /**
     * Get the list based on Search value
     * @param {object} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * Set the data for fetching the list
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re, showApplicantArchiveModal: false });
    }

    /**
     * Open create applicant modal
     */
    showModal = (selected_data) => {
        if (selected_data) {
            let selected_applicant = [{
                id: selected_data.applicant_id,
                label: selected_data.applicant_name,
                subTitle: selected_data.subTitle,
                type: "contact",
            }]
            this.setState({
                openCreateApplicant: true, selected_applicant: selected_applicant, selected_data: selected_data, selected_applicant_name : selected_data.applicant_name
            });
        } else {
            this.setState({ openCreateApplicant: true, selected_applicant: [], selected_data: '', selected_applicant_name : selected_data.applicant_name });
        }

    }

    showAddApplicantsModal = () => {
        let email_key = this.state.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation'
        this.getGroupBookingEmailHtmlFormat(email_key);
        if(this.state.showAddApplicantModal){
            this.setState({ openAddApplicants: true });
        }
    }

    /**
     * Close the modal when user save the applicant and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({
            openCreateApplicant: false, showApplicantBulkUpdateStatus: false, selected_applicant: [],
            selected_data: '', selected_row: [], row_selections: [], header_checkbox: false, openCreateCabCertificate: false, openEmploymentContract: false,
            showApplicantArchiveModal: false, showApplicantCancelModal: false, selected_header_check_box: false
        });
        if (status) {
            reFreashReactTable(this, 'fetchData');
            this.getInterviewById(this.state.interview_id);
        }
    }

    refreshList(state) {
        reFreashReactTable(this, 'fetchData');
    }

    validate_group_booking = () => {
        let isDisabled = true;
        if (this.state.interview_stage_status < 3 && this.state.interview_time_status == 'Scheduled') {
            if (this.state.max_applicant) {
                if (this.state.applicantList && (this.state.applicantList.length < parseInt(this.state.max_applicant))) {
                    isDisabled = false;
                }
            } else {
                isDisabled = false;
            }
        }
        return isDisabled;
    }
    /**
    * when status change is requested
    */

    markMeetingResult = (status, selected_data) => {
        if (selected_data.interview_meeting_status != '0') {
            toastMessageShow("Status once marked cannot be reverted", "e");
            return false;
        }
        if (this.state.selected_template == "") {
            toastMessageShow("Please choose all mandatory fields", "e");
            return false;
        }
        // 1- Successful 2- Unsuccessful
        var req = {
            id: selected_data.id,
            interview_meeting_status: status,
            applicant_id: selected_data.applicant_id,
            application_id: selected_data.application_id,
            interview_id: selected_data.interview_id,
            email_status_update: this.state.send_status_update,
            selected_template: this.state.selected_template
        }
        postData('recruitment/RecruitmentInterview/update_applicant_interview_status', req).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, 'fetchData');
                this.setState({selected_template: '', send_status_update: false});
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ showSendEmailModal: false, send_status_update: false });
        });

    }

    showResultAction = (selected_data) => {
        let list = groupBookingStatusList();
        list.forEach(interview => {
            if(selected_data.application_process_status !='8' && selected_data.flag_status !='2'){
                if ((interview.value == 6 && this.state.interview_stage_status > 1) || (interview.value == 5 && selected_data.interview_meeting_status != "2") || ((interview.value < 4 && this.state.interview_stage_status != 3) && this.state.interview_stage_status > 1)) {
                    interview['disabled'] = false;
                } else if ((interview.value == 4 || interview.value == 5 || interview.value == 7) && selected_data.interview_meeting_status == "0") {
                    interview['disabled'] = false;
                }
            }else{
                if(interview.value == 2 ){
                    interview['disabled'] = false;
                }
            }
            
        });
        return list;
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');
        this.getInterviewById(this.state.interview_id);
        this.getEmailTemplate();
        this.get_ms_url_template();
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
    * get the list of email template
    */
    getEmailTemplate = () => {
        this.setState({ loading: true });
        getEmailTemplateOption().then(res => {
            this.setState({
                email_template: res,
                showSubject: true,
                loading: false,
            });
        });
    }

    getTemplateName = () => {
        let template_subject = '';
        this.state.email_template.map((col) => {
            if (col.value == this.state.selected_template) {
                template_subject = col.subject;
            }
        });
        return template_subject;
    }

    onSelect = (value, key) => {
        this.setState({ [key]: value });
    }

    resendInvite = () => {
        if (this.state.selected_row.length == 0) {
            toastMessageShow("Please choose applicant", "e");
            return false;
        }
        var req = { applicants: this.state.selected_row, interview_id: this.state.interview_id, owner: this.state.owner, interview_type: this.state.interview_type }
        this.setState({ resetLoading: true });
        postData('recruitment/RecruitmentInterview/resend_invite_to_applicants', req).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, 'fetchData');
                this.setState({ selected_row: [], row_selections: [], header_checkbox: false })
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ resetLoading: false });
        });
    }

    emptyTheSeletedRow =()=>{
        this.setState({selected_row:[] , row_selections: [], header_checkbox: false, selected_header_check_box: false})
    }

    //Bulk update status
    updateStatus = () => {

        let selected_row = this.state.selected_row;
        if (selected_row == 0) {
            toastMessageShow("Please choose applicant", "e");
            return false;
        }

        let show_modal = [];
        selected_row.forEach((selected) => {
            if (selected.interview_meeting_status != '0') {
                show_modal.push('true');
            }
        })
        if (show_modal.length > 0) {
            toastMessageShow("Status once marked cannot be reverted", "e");
            return false;
        } else {
            this.setState({ showApplicantBulkUpdateStatus: true, selected_id: this.state.interview_id, selected_applicant: selected_row });
        }


    }

    /**
    * Open Cab certificate Generated modal
    */
    showCabCertificateModal(selected_row, val) {
        if (selected_row == 'multi_select' && this.state.selected_row.length == 0) {
            toastMessageShow("Please choose applicant", "e");
            return false;
        } else if (selected_row == 'multi_select' && this.state.selected_row.length > 15) {
            toastMessageShow("Please choose maximum 15 applicant", "e");
            return false;
        }

        let checkSuccessApplicant = this.state.selected_row.find(o => o.interview_meeting_status !== '1');
        if (checkSuccessApplicant) {
            toastMessageShow("Please choose successful applicant only", "e");
            return false;
        } 

        if (selected_row == 'multi_select') {           
            if (val == 1) {
                this.setState({ openCreateCabCertificate: true, applicants: this.state.selected_row, interview_id: this.state.interview_id, owner: this.state.owner });
            } else {                
                this.setState({ openEmploymentContract: true, applicants: this.state.selected_row, interview_id: this.state.interview_id, owner: this.state.owner });
            }
        } else {
            let applicants = [{
                applicant_id: selected_row.original.applicant_id,
                application_id: selected_row.original.application_id,
                applicant_email: selected_row.original.email
            }];

            this.setState({ selected_row: [] }, () => {
                this.setState({ openCreateCabCertificate: true, applicants: applicants });
            });
        }
    }


     /**
    * Open Cab certificate Generated modal
    */
      showCancelInviteModal() {
            if(!this.state.selected_header_check_box){
                this.setState({ showApplicantCancelModal: false });
                toastMessageShow('Please select all applicant','e');
            }else{
                this.setState({ showApplicantCancelModal: true });
            }
        
    }

    listHeaderOptions = () => {
        let header_options = determineListingControlColumns();
        header_options.map((col) => {
            if (this.state.archive == 1 && col.value!=2) {
                col.disabled = true;
            }
            if((this.state.ms_event_status == 1 && col.value==3) && (this.state.interview_stage_status==4 || this.state.event_id==null)){
                col.disabled = true;
            }
        })
        return header_options;
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewForm = e => {
            e.preventDefault()
            this.showAddApplicantsModal();
        }
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <ButtonGroup variant="list" id="button-group-page-header-actions"  >
                        <Button label="New" id="form-type-new-btn" className={`slds-button slds-button_neutral`} disabled={this.validate_group_booking() || this.state.archive == 1 ? true : false} onClick={(e) => handleOnClickNewForm(e)} />
                        <Button label="Update Status" id="update_status" disabled={this.state.interview_time_status == 'Expired' || parseInt(this.state.interview_stage_status) < 2 ? true : false || this.state.archive == 1 ? true : false} title={`Update Status`} onClick={() => this.updateStatus()} />                        
                        {this.state.ms_event_status !=1 && this.state.interview_time_status!='Expired'? <MsalProvider instance={msalInstance}> <UpdateMeetingInvite
                            {...this.state}
                            {...this.props}
                            page_name={'from_view_all'}
                            emptyTheSeletedRow={this.emptyTheSeletedRow}
                            label_name={'Resend Invite'}
                        />
                        </MsalProvider> : <Button label="Resend Invite" disabled={true} id="update_status" title={`Resend Invite`} />}
                        <Dropdown
                            id="header_drop_down"
                            assistiveText={{ icon: 'More Options' }}
                            iconCategory="utility"
                            iconName="down"
                            align="right"
                            iconSize="x-medium"
                            iconVariant="border-filled"
                            onSelect={(e) => {
                                //call the cab certificate / tranfer application
                                if(e.value ==3){
                                    this.showCancelInviteModal()
                                }else{
                                    this.showCabCertificateModal('multi_select', e.value)
                                }
                                
                            }}
                            width="xx-small"
                            options={this.listHeaderOptions()}
                        />

                    </ButtonGroup>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Render search input applicant
     */
    renderSearchForm() {
        return (
            <form
                autoComplete="off"
                onSubmit={(e) => this.submitSearch(e)}
                method="post"
                className="slds-col_padded"
                style={{ display: 'block' }}
            >
                <Input
                    iconLeft={
                        <InputIcon
                            assistiveText={{
                                icon: 'Search',
                            }}
                            name="search"
                            category="utility"
                        />
                    }
                    onChange={(e) => this.setState({ search: e.target.value })}
                    id="form-search-1"
                    placeholder="Search Applicants"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let applicantStatusFilter = [
            { value: 'all', label: 'All' },
        ];
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={applicantStatusFilter}
                onSelect={value => this.filterChange('filter_status', value.value)}
                length={null}
            >
                <DropdownTrigger title={`Filter by status`}>
                    <Button
                        assistiveText={{ icon: 'Filter' }}
                        iconCategory="utility"
                        iconName="filterList"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Handle the selected columns visible or not
     */
    handleOnSelectColumnSelectorItem = option => {
        const value = option.value

        let cols = [...this.state.displayed_columns]
        if (cols.indexOf(value) >= 0) {
            cols = cols.filter(col => col !== value)
        } else {
            cols = [...this.state.displayed_columns, value]
        }

        this.setState({ displayed_columns: cols })
    }

    /**
     * Open archive applicant modal
     */
    showApplicantArchiveModal(applicant_id, e) {
        let applicant_action = e.value == 7 ? 'cancel' : 'delete';
        this.setState({ showApplicantArchiveModal: true, archive_applicant_id: applicant_id,  applicant_action: applicant_action});
    }
    /**
     * Close archive applicant modal
     */
    closeApplicantArchiveModal = () => {
        this.setState({ showApplicantArchiveModal: false, archive_applicant_id: '' })
        this.setTableParams();
    }

    /**
     * when checkboxes are clicked inside the data table
     */
    handleMultiCheckbox = (e, checkid, selected_data) => {
        let tempArr = [...this.state.row_selections];
        let rowtemp = [...this.state.selected_row];
        if (checkid == undefined) {
            this.setState({selected_header_check_box: e.target.checked});
            this.state.applicantList.map((row) => {

                var index = tempArr.indexOf(row.id);
                if (e.target.checked == true) {
                    this.setState({ header_checkbox: true });
                    if (index == -1 && (row.flagged_status != '2' && row.application_process_status !='8' && row.interview_meeting_status !='2')) {
                        tempArr.push(row.id);
                        rowtemp.push({
                            interview_applicant_id: row.id, applicant_id: row.applicant_id, application_id: row.application_id,
                            interview_meeting_status: row.interview_meeting_status, applicant_email: row.email, applicant_name: row.applicant_name,
                            job_id: row.job_id
                        })
                    }
                }
                else if (index > -1) {
                    this.setState({ header_checkbox: false });
                    tempArr.splice(index, 1);
                    rowtemp.splice(index, 1);
                }
            });
        }
        else {
            var index = tempArr.indexOf(checkid);
            if (e.target.checked == true) {
                if (index == -1) {
                    tempArr.push(checkid);
                    rowtemp.push({
                        interview_applicant_id: checkid, applicant_id: selected_data.applicant_id,
                        application_id: selected_data.application_id, interview_meeting_status: selected_data.interview_meeting_status, applicant_email: selected_data.email,
                        applicant_name: selected_data.applicant_name,job_id: selected_data.job_id
                    })
                }
            }
            else if (index > -1) {
                this.setState({ header_checkbox: false , selected_header_check_box: e.target.checked});
                tempArr.splice(index, 1);
                rowtemp.splice(index, 1);
            }
        }
        this.setState({ row_selections: tempArr, selected_row: rowtemp });
        if (tempArr.length == this.state.applicantList.length) {
            this.setState({ header_checkbox: true, selected_header_check_box: true });
        }
    }

    /**
     * Render table column dropdown
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {

        const mapColumnsToOptions = columns.map(col => ({
            value: 'id' in col ? col.id : col.accessor,
            label: col._label,
        }))

        return (
            <Dropdown
                align="right"
                checkmark
                multiple
                assistiveText={{ icon: 'More' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={mapColumnsToOptions}
                value={this.state.default_displayed_columns}
                onSelect={this.handleOnSelectColumnSelectorItem}
            >
                <DropdownTrigger>
                    <Button
                        title={`Show/hide columns`}
                        assistiveText={{ icon: 'Show/hide columns' }}
                        iconCategory="utility"
                        iconName="table"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Render page header
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    {this.renderEventStatus()}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderSearchForm()}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderColumnSelector({ columns })}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderStatusFilters()}
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    closeApplicantModal = (status)=>{
        if(status){
            this.setState({openAddApplicants : false});
            this.refreshList(this.state)
        }
    }

    /**
     * Render modals
     * - Create Form
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateApplicant && (
                        <CreateApplicantModel
                            interview_id={this.state.interview_id}
                            selected_applicant={this.state.selected_applicant}
                            selected_data={this.state.selected_data}
                            showModal={this.state.openCreateApplicant}
                            selectedApplicantName={this.state.selected_applicant_name}
                            closeModal={this.closeModal}
                            headingTxt="Edit Applicant"
                            {...this.props}
                        />)
                }
                {
                    this.state.openAddApplicants && (
                        <SelectionMSTable
                            listing_api="recruitment/GroupBooking/get_applicants_for_group_booking"
                            submitSelection={(selection) => addApplicants(this, selection, (state) => this.refreshList(state))}
                            openAddItems={true}
                            heading="Add Applicants"
                            setModal={status => this.setState({ openAddApplicants: status })}
                            columns={getApplicantsColumns()}
                            sortColumn="FullName"
                            loading={this.state.loading}
                            modalFooter={
                                <div style={{ float: "left" }}>
                                    <Checkbox
                                        assistiveText={{
                                            label: 'Notify all the selected applicants via email',
                                        }}
                                        id="email_applicants"
                                        labels={{
                                            label: 'Notify all the selected applicants via email',
                                        }}
                                        checked={this.state.email_applicants ? true : false}
                                        name="email_applicants"
                                        onChange={(e) => {
                                            this.setState({ email_applicants: e.target.checked });
                                        }}
                                    />
                                </div>
                            }
                            limit={this.state.max_applicant ? this.state.max_applicant - this.state.applicantList.length : 99999}
                            events={{
                                "onMaximumSelection": (e, selection) => {
                                    e.preventDefault();
                                    toastMessageShow(`Attendees count cannot exceed ${this.state.max_applicant}`, "e");
                                }
                            }}
                            closeApplicantModal={this.closeApplicantModal}
                            {...this.state}
                            {...this.props}
                            group_booking_email_template= { this.state.group_booking_email_template}   
                            group_booking_email_subject= {this.state.group_booking_email_subject}
                        />
                    )
                }
                {
                    this.state.openCreateCabCertificate &&
                    <CreateCabCertificate
                        application_list={this.state.applicants}
                        group_booking_applicant={true}
                        isBulkApplication={true}
                        showModal={this.state.openCreateCabCertificate}
                        closeModal={this.closeModal}
                        {...this.state}
                        {...this.props}
                    />
                }
                {this.state.openEmploymentContract &&
                    <CreateEmployerContract
                        application_list={this.state.applicants}
                        isBulkApplication={true}
                        group_booking_applicant={true}
                        showModal={this.state.openEmploymentContract}
                        closeModal={this.closeModal}
                        from_group_booking_page={true}
                        {...this.state}
                        {...this.props}
                    />
                }
                {this.state.showSendEmailModal && <CustomModal
                    title="Choose template for Update Status"
                    ok_button="Yes"
                    showModal={this.state.showSendEmailModal}
                    setModal={(status) => this.closeEmailModal(status)}
                    onClickOkButton={(e) => this.markMeetingResult(this.state.status_value, this.state.status_data)}
                    size="small"
                    style={{ overFlowY: "hidden" }}
                    loading={this.state.loading}
                >
                    <label className="slds-form-element__label" htmlFor="select-01">Do you wish to notify the applicant about the status update via email?</label>
                    <Row>
                        <Col50>
                            <SelectList
                                label="Select Email Template"
                                name="selected_template"
                                required={true}
                                options={this.state.email_template}
                                value={this.state.selected_template}
                                onChange={(value) => this.onSelect(value, 'selected_template')}
                            />
                        </Col50>
                    </Row>
                    {this.state.showSubject && <div className="row py-2">
                        <div className="w-50-lg col-lg-4 col-sm-6 ">
                            <div className="w-100 slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">Subject of the selected template</label>
                                <input type="text"
                                    name="interview_duration"
                                    disabled={true}
                                    placeholder="Do not send"
                                    value={this.getTemplateName() || ''}
                                    data-rule-maxlength="6"
                                    className="slds-input" />
                            </div>
                        </div>
                    </div>}
                    <Checkbox
                        assistiveText={{
                            label: 'Send status update to the applicant via email',
                        }}
                        id="send_status_update"
                        labels={{
                            label: 'Send status update to the applicant via email',
                        }}
                        checked={this.state.send_status_update}
                        name="send_status_update"
                        onChange={(e) => this.setState({ send_status_update: e.target.checked })}
                    />
                </CustomModal>}
            </React.Fragment>
        )
    }

    /**
     * 
     * update the applicant event status
     */

    renderEventStatus=()=>{
        return(            
            this.state.applicantList.length !=0 && this.state.showMsEventStatus &&  <MsalProvider instance={msalInstance}> 
                <GetInvitedEventStatus
                 {...this.state}
                 {...this.props}
                 page_name={'from_view_all'}
                 closeModal={this.closeModal}
             />            
             </MsalProvider> 
         )
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "id",
                id: 'id',
                Header: () => (
                    <div className="slds-checkbox">
                        <input type="checkbox" name="header_checkbox" id="header_checkbox" onChange={(e) => {this.handleMultiCheckbox(e); this.setState({selected_header_check_box : e.target.checked }) }} checked={this.state.header_checkbox} />
                        <label className="slds-checkbox__label" htmlFor="header_checkbox">
                            <span className="slds-checkbox_faux"></span>
                        </label>
                    </div>
                ),
                sortable: false,
                resizable: false,
                width: '1.5rem',
                Cell: props => {
                    var checkid = props.value;
                    var check_index = this.state.row_selections.indexOf(checkid);
                    var checked = (check_index == -1) ? false : true;
                    return (
                        <div className="slds-checkbox">
                            <input type="checkbox" name={checkid} id=
                                {checkid} disabled={this.props.archived || props.original.application_process_status=='8' || props.original.interview_meeting_status=='2'} onChange={(e) => {this.handleMultiCheckbox(e, checkid, props.original);}} checked={checked} />
                            <label className="slds-checkbox__label" htmlFor={checkid}>
                                <span className="slds-checkbox_faux"></span>
                            </label>
                        </div>
                    )
                }
            },
            {
                _label: '',
                accessor: "id",
                id: 'id',                
                sortable: false,
                resizable: false,
                width:'1.5rem',
                Cell: props => {   
                    if(props.original.flag_status=='2'){
                        return (
                            <span style={flag_style()} title="Applicant is flagged"></span>    
                        )
                    }else if(props.original.application_process_status=='8'){
                        return (
                        <span style={unsucessful_style()} title="Application is unsuccessful"></span>    
                        );
                    }else{
                        return(<span style={{width: '9px',
                        height: '9px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        display: 'inline-block'}}></span>);
                    }
                   
                },
            },
            {
                _label: 'Applicant',
                accessor: "applicant_name",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'memlink' + props.original.applicant_id} to={ROUTER_PATH + 'admin/recruitment/applicant/' + props.original.applicant_id}
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Application Id',
                accessor: "application_id",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'memlink' + props.original.applicant_id} to={ROUTER_PATH + 'admin/recruitment/application_details/' + props.original.applicant_id + '/' + props.original.application_id}
                    className="vcenter default-underlined slds-truncate"
                    style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Email',
                accessor: "email",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },           
            {
                _label: 'Job',
                accessor: "job_name",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },            
            {
                _label: 'Invited on',
                accessor: "invited_on",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{props.value ? defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm")) : props.value}</span>,
            },
            {
                _label: 'RSVP',
                accessor: "attendee_response",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },            
            {
                _label: 'Result',
                accessor: "applicant_meeting_status",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Action',
                accessor: "action",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: (props) =>
                    <Dropdown                    
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        disabled={this.state.archive == 1 || this.state.ms_event_status == 1 ? true : false}
                        onSelect={(e) => {
                            if (e.value == 4) {
                                this.showModal(props.original);
                            } else if (e.value == 5 || e.value == 7) {
                                this.showApplicantArchiveModal(props.original.id, e)
                            }
                            else if (e.value == 6) {
                                this.showCabCertificateModal(props)
                            } else {
                                if (this.state.interview_stage_status > 1) {
                                    this.setState({ showSendEmailModal: true, status_value: e.value, status_data: props.original });
                                }
                            }
                        }}
                        width="xx-small"
                        className={'slds-more-action-dropdown'}
                        options={this.showResultAction(props.original)}
                    />,
            },
        ]
    }

    closeEmailModal(status) {
        this.setState({ showSendEmailModal: status, selected_template: '', send_status_update: false });
    }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user archive applicant
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        var interview_id = _.get(this.props, 'props.match.params.id');
        const trail = [
            <Link to={ROUTER_PATH + `admin/recruitment/interview`} className="reset" style={{ color: '#0070d2' }}>
                {'Group Booking'}
            </Link>,
            <Link to={ROUTER_PATH + `admin/recruitment/interview_details/${interview_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.title}
            </Link>
        ];
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={
                                <Icon
                                    assistiveText={{
                                        label: 'Applicants',
                                    }}
                                    category="utility"
                                    name="resource_capacity"
                                    style={{
                                        fill: '#769ed9',
                                    }}
                                    title="Applicants"
                                />
                            }
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title={"Applicants"}
                            trail={trail}
                            label={<span />}
                            truncate
                            variant="object-home"
                        />
                        <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchData}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.applicantList}
                            defaultPageSize={9999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                        />
                        {this.state.showApplicantArchiveModalDelete && <ArchiveModal
                            id={this.state.archive_applicant_id}
                            msg={'Applicant'}
                            content={'Are you sure you want to archive this applicant?'}
                            confirm_button={'Archive Applicant'}
                            api_url={'recruitment/RecruitmentInterview/archive_applicant_interview'}
                            close_archive_modal={this.showApplicantArchiveModalDelete}
                            on_success={() => this.setTableParams()}

                        />}

                        {this.state.showApplicantArchiveModal && <GBCancelInvite
                            applicantList={this.state.applicantList}
                            showModal={this.state.showApplicantArchiveModal}
                            closeModal={this.closeApplicantArchiveModal}
                            is_organizer={false}
                            applicant_archive = {this.state.applicant_action == 'cancel' ? 0 : 1}
                            {...this.state}
                            {...this.props}
                        />}

                        {this.state.showApplicantCancelModal && <GBCancelInvite
                            applicantList={this.state.applicants}
                            showModal={this.state.showApplicantCancelModal}
                            closeModal={this.closeModal}
                            is_organizer={true}
                            page_name={'from_view_all'}
                            {...this.state}
                            {...this.props}
                        />}

                        {this.state.showApplicantBulkUpdateStatus && <ApplicantBulkUpdateStatus
                            interview_id={this.state.selected_id}
                            selected_applicant={this.state.selected_applicant}
                            showModal={this.state.showApplicantBulkUpdateStatus}
                            closeModal={this.closeModal}
                            headingTxt="New Form"
                            interview_stage_status={this.state.interview_stage_status}
                            {...this.props}
                        />}
                    </IconSettings>
                </div>
                {this.renderModals()}                
            </React.Fragment>
        )


    }


}
// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
// Get the page title and type from reducer
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListInterviewApplicants);
