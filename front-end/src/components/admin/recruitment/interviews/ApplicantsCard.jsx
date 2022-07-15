import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import moment from 'moment';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, reFreashReactTable, postData, toastMessageShow, } from 'service/common.js';
import { groupBookingStatusList, flag_style, unsucessful_style} from '../../oncallui-react-framework/services/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import SelectionMSTable from '../../oncallui-react-framework/view/SelectionMSTable';
import CreateApplicantModel from './CreateApplicantModel';
import CreateCabCertificate from '../applicants/application_header_action/CreateCabCertificate';
import Row from '../../oncallui-react-framework/grid/Row';
import Col50 from '../../oncallui-react-framework/grid/Col50';
import SelectList from "../../oncallui-react-framework/input/SelectList";
import { getEmailTemplateOption, getGroupBookingEmailContent } from '../../../admin/recruitment/actions/RecruitmentAction.js';
import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
    Checkbox,
    ButtonGroup
} from '@salesforce/design-system-react';
import { getApplicantListByInterviewId } from '../actions/RecruitmentInterviewAction.js';
import '../../scss/components/admin/item/item.scss';
import ArchiveModal from '../../oncallui-react-framework/view/Modal/ArchiveModal';
import { CustomModal } from '../../oncallui-react-framework/index.js';
import { connect } from 'react-redux'

import {addApplicants, getApplicantsColumns} from '../RecruitmentCommon';
import GBCancelInvite from './GBCancelInvite';
import {GetInvitedEventStatus} from '../../../admin/recruitment/azure_graph_ms_invite/MsEventStatusCommon';
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";
const msalInstance = new PublicClientApplication(msalConfig);

class ApplicantsCard extends Component {

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            openCreateApplicant: false,
            openAddApplicants: false,
            pageSize: 6,
            page: 0,
            validStatus: 1,
            applicant_count: 0,
            filtered: '',
            sorted: '',
            interview_id: this.props.interview_id,
            interview_type: this.props.interview_type,
            row_selections: [],
            selected_row: [],
            openCreateCabCertificate: this.props.openCreateCabCertificate || false,
            showSubject: false,
            selected_template: '',
            group_booking_email_template: '',
            group_booking_email_subject:'',   
            applicantList:[],
            showAddApplicantModal: false,       
            selected_header_check_box: false ,
            send_status_update: false,
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    componentDidMount(){
        let email_key = this.props.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation'
        this.getGroupBookingEmailHtmlFormat(email_key);        
    }
    // fetch the applicant list via reference data
    callApplicantData(){
        this.fetchApplicantsData(this.state);
        this.getEmailTemplate();
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

    getTemplateName = () =>{
        let template_subject = '';
        this.state.email_template.map((col)=>{
            if(col.value == this.state.selected_template){
                template_subject = col.subject;
            }
        });
        return template_subject;
    }

    onSelect = (value, key) => {
        this.setState({ [key]: value });
    }

    getSeletedApplicants(){
        return this.state.selected_row;
    }
    // Empty the selected row if the user do any other action
    emptyTheSeletedRow =()=>{
        this.setState({selected_row:[] , row_selections: [], header_checkbox: false, selected_header_check_box: false})
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchApplicantsData = (state) => {
        this.setState({ loading: true });
        getApplicantListByInterviewId(
            this.state.interview_id,
            this.state.pageSize,
            this.state.page,
            this.state.sorted,
            this.state.filtered
        ).then(res => {
            this.setState({
                applicantList: res.rows,
                applicant_count: res.count,
                pages: res.pages,
                loading: false,
                showApplicantArchiveModal: false,
                selected_row:[],
                row_selections: [],
                header_checkbox: false
            });
        });
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
        let email_key = this.props.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation'
        this.getGroupBookingEmailHtmlFormat(email_key);
        if(this.state.showAddApplicantModal){
            this.setState({ openAddApplicants: true });
        }
       
    }    

    /**
     * Open archive applicant modal
     */
    showApplicantArchiveModal(applicant_id, e) {
        let applicant_action = e.value == 7 ? 'cancel' : 'delete';
        this.setState({ showApplicantArchiveModal: true, archive_applicant_id: applicant_id,  applicant_action: applicant_action });
    }

     /**
     * Open Cab certificate Generated modal
     */
    showCabCertificateModal(selected_row) {

        let applicants = [{applicant_id : selected_row.value.applicant_id,
            application_id : selected_row.value.application_id,
            applicant_email : selected_row.value.email }];

        this.setState({selected_row:[]} , () => {
            this.setState({ openCreateCabCertificate: true, applicants: applicants});
        });
    }
    /**
     * Close archive applicant modal
     */
    closeApplicantArchiveModal = () => {
        this.setState({ showApplicantArchiveModal: false, archive_applicant_id: '' })
        reFreashReactTable(this, 'fetchApplicantsData');
        this.props.get_interview_by_id();
        this.props.listHeaderOptions();
        this.props.set_recipient_refresh(true);
    }

    /**
     * Close the modal when user save the applicant and refresh the table
     * Get the Unique reference id
     */
     closeHeaderActionModal = (status) => {
        this.setState({ openCreateCabCertificate: false, selection : []});

        if (status) {
            reFreashReactTable(this, 'fetchApplicantsData');
        }
    }

     /**
     * when status change is requested
     */

    markMeetingResult = (status , selected_data) => {
        if(selected_data.interview_meeting_status!='0'){
            toastMessageShow("Status once marked cannot be reverted", "e");
            return false;
        }
        if(this.state.selected_template==""){
            toastMessageShow("Please choose all mandatory fields", "e");
            return false;
        }
        // 1- Successful 2- Unsuccessful 3- did not show
        var req = { id: selected_data.id,
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
                reFreashReactTable(this, 'fetchApplicantsData');
                this.setState({selected_template: '', send_status_update: false});
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({showSendEmailModal: false, send_status_update: false});
        });

    }

    showResultAction = (selected_data) => {
        let list = groupBookingStatusList();
        if(!this.props.archived)
        {
            list.forEach(interview => {   
                if (selected_data.application_process_status != '8' && selected_data.flag_status != '2') {
                    if ((interview.value == 6 && this.props.interview_stage_status > 1 && selected_data.applicant_meeting_status == "Successful" ) || (interview.value == 5 && selected_data.interview_meeting_status != "2") || ((interview.value < 4 && this.props.interview_stage_status != 3) && this.props.interview_stage_status > 1)) {
                        interview['disabled'] = false;
                    } else if ((interview.value == 4 || interview.value == 5 || interview.value == 7) && selected_data.interview_meeting_status == "0") {
                        interview['disabled'] = false;
                    }
                } else {
                    if (interview.value == 2) {
                        interview['disabled'] = false;
                    }
                }
    
            });
        }
        return list;
    }
    /**
     * when checkboxes are clicked inside the data table
     */
     handleMultiCheckbox = (e, checkid,selected_data) => {
        let tempArr = [...this.state.row_selections];
        let rowtemp = [...this.state.selected_row];
        if(checkid == undefined) {
            this.setState({selected_header_check_box: e.target.checked});
            this.state.applicantList.map((row) => {
                var index = tempArr.indexOf(row.id);
                if(e.target.checked == true) {
                    this.setState({header_checkbox: true});                    
                    if(index == -1 && (row.flagged_status != '2' && row.application_process_status !='8' && row.interview_meeting_status !='2')) {
                        tempArr.push(row.id);
                        rowtemp.push({interview_applicant_id:row.id, applicant_id:row.applicant_id,
                            application_id:row.application_id, interview_meeting_status: row.interview_meeting_status, applicant_email: row.email, applicant_name: row.applicant_name,
                            job_id: row.job_id})
                    }
                }
                else if (index > -1) {
                    this.setState({header_checkbox: false});
                    tempArr.splice(index, 1);
                    rowtemp.splice(index, 1);
                }
            });
        }
        else {
            var index = tempArr.indexOf(checkid);
            if(e.target.checked == true) {
                if(index == -1) {
                    tempArr.push(checkid);
                    rowtemp.push({interview_applicant_id:checkid, applicant_id: selected_data.applicant_id, application_id: selected_data.application_id,
                            interview_meeting_status: selected_data.interview_meeting_status, applicant_email: selected_data.email, applicant_name: selected_data.applicant_name, 
                            job_id: selected_data.job_id})
                }
            }
            else if (index > -1) {
                this.setState({header_checkbox: false, selected_header_check_box: e.target.checked});
                tempArr.splice(index, 1);
                rowtemp.splice(index, 1);
            }
        }
        this.setState({row_selections: tempArr, selected_row:rowtemp});
        if(tempArr.length == this.state.applicantList.length) {
            this.setState({header_checkbox: true, selected_header_check_box: true });
        }
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
                        <input type="checkbox" name="header_checkbox" disabled={this.props.archived || this.props.application_process_status=='8' || this.props.interview_meeting_status=='2'} id="header_checkbox" onChange={(e) => this.handleMultiCheckbox(e)} checked={this.state.header_checkbox} />
                        <label className="slds-checkbox__label" htmlFor="header_checkbox">
                            <span className="slds-checkbox_faux"></span>
                        </label>
                    </div>
                    ),
                sortable: false,
                resizable: false,
                width:'1.5rem',
                Cell: props => {
                    var checkid = props.value;
                    var check_index = this.state.row_selections.indexOf(checkid);
                    var checked = (check_index == -1) ? false : true;
                    return (
                    <div  className="slds-checkbox">
                        <input type="checkbox" name={checkid} disabled={this.props.archived || props.original.application_process_status=='8' || props.original.interview_meeting_status=='2'}  id=
                        {checkid} onChange={(e) => this.handleMultiCheckbox(e, checkid,props.original)} checked={checked}/>
                        <label className="slds-checkbox__label" htmlFor={checkid}>
                            <span className="slds-checkbox_faux" ></span>
                        </label>
                    </div>
                    )
                },
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
                _label: 'Email',
                accessor: "email",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
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
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
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
                accessor: "",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: (props) =>
                    <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        disabled={this.props.archived || this.props.ms_event_status == 1 ? true : false}
                        onSelect={(e) => {
                            if (e.value == 4) {
                                this.showModal(props.original);
                            } else if(e.value == 5 || e.value == 7){
                                this.showApplicantArchiveModal(props.original.id, e)
                            }else if(e.value == 6){
                                this.showCabCertificateModal(props)
                            }
                            else{
                                if(this.props.interview_stage_status > 1){
                                    this.setState({showSendEmailModal: true, status_value: e.value, status_data: props.original});                                    
                                }                                
                            }
                        }}
                        className={'slds-more-action-dropdown'}
                        options={
                            this.showResultAction(props.original)}
                    />,
            },
        ]
    }

    /**
     * Render form table if count greater than 0
     */
    renderTable() {
        if (Number(this.state.applicant_count) === 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.applicantList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                onFetchData={this.fetchApplicantsData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
            />            
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (Number(this.state.applicant_count) === 0) {
            return <React.Fragment />
        }

        return (
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/recruitment/interview_details/applicant_list/${this.state.interview_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
    }

    /**
     * Close the modal when user save the form and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({ openCreateApplicant: false, openCreateCabCertificate: false,selected_applicant: [], selected_data: '', selected_row: [] });
        if (status) {            
            this.props.set_recipient_refresh(true);
            if (Number(this.state.applicant_count) === 0) {
                this.fetchApplicantsData(this.state);
            } else {
                reFreashReactTable(this, 'fetchApplicantsData');
            }
        }
    }

    validate_group_booking = () => {
        let isDisabled = true;
        if (!this.props.archived && this.props.interview_stage_status < 3 && this.props.interview_time_status == 'Scheduled') {
            if (this.props.max_applicant) {
                if (this.state.applicantList && (this.state.applicantList.length < parseInt(this.props.max_applicant))) {
                    isDisabled = false;
                }
            } else {
                isDisabled = false;
            }
        }
        return isDisabled;
    }

    closeApplicantModal = (status)=>{
        if(status){
            this.setState({openAddApplicants : false});
            this.fetchApplicantsData();
            this.props.get_interview_by_id();
            this.props.listHeaderOptions();
        }
    }

    /**
     * Refresh Activity component sms recipient
     */
    refreshPropsList = () => {
        this.props.set_recipient_refresh(true);
    }

    /**
     * Render modals
     * - Create Form
     *
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                     this.state.openCreateApplicant && (<CreateApplicantModel
                        interview_id={this.state.interview_id}
                        selected_applicant={this.state.selected_applicant}
                        selected_data={this.state.selected_data}
                        showModal={this.state.openCreateApplicant}
                        closeModal={this.closeModal}
                        headingTxt="Edit Applicant"
                        selectedApplicantName={this.state.selected_applicant_name}
                        {...this.props}
                    />
                     )
                }
                {
                    this.state.openAddApplicants && (
                        <SelectionMSTable
                            listing_api="recruitment/GroupBooking/get_applicants_for_group_booking"
                            submitSelection={(selection) =>{ 
                                this.props.set_recipient_refresh(true);
                                addApplicants(this, selection, this.fetchApplicantsData, this.state)
                            }}
                            openAddItems={true}
                            heading={'Group Booking - Invite Attendees'}
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
                            cancel_button={'Later'}
                            ok_button={'Send Invites'}
                            ListSearchPageTitle={'by applicant name, applicant id or job'}
                            limit={this.props.max_applicant? this.props.max_applicant - this.state.applicantList.length : 99999}
                            events={{
                                "onMaximumSelection": (e, selection) => {
                                    e.preventDefault();
                                    toastMessageShow(`Attendees count cannot exceed ${this.props.max_applicant}`, "e");
                                }
                            }}
                            closeApplicantModal={this.closeApplicantModal}
                            {...this.state} {...this.props}
                            group_booking_email_template= { this.state.group_booking_email_template}   
                            group_booking_email_subject= {this.state.group_booking_email_subject}
                            
                        />
                    )
                }
                {this.state.showApplicantArchiveModalDelete && <ArchiveModal
                    id={this.state.archive_applicant_id}
                    msg={'Applicant'}
                    content={'Are you sure you want to archive this applicant ?'}
                    confirm_button={'Archive Applicant'}
                    api_url={'recruitment/RecruitmentInterview/archive_applicant_interview'}
                    close_archive_modal={this.showApplicantArchiveModalDelete}
                    on_success={() => this.closeApplicantArchiveModal()}

                />}

                {this.state.showApplicantArchiveModal && <GBCancelInvite
                    application_list={this.state.applicants}
                    showModal={this.state.showApplicantArchiveModal}
                    closeModal={this.closeApplicantArchiveModal}
                    is_organizer={false}
                    applicant_archive = {this.state.applicant_action == 'cancel' ? '0' : '1'}
                    {...this.state}
                    {...this.props}
                />}

                 {
                    this.state.openCreateCabCertificate &&
                        <CreateCabCertificate
                            application_list = {this.state.applicants}
                            isBulkApplication = {true}
                            group_booking_applicant = {true}
                            showModal = {this.state.openCreateCabCertificate}
                            closeModal = {this.closeModal}
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
                                label="Email Template"
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
                                <label className="slds-form-element__label" htmlFor="select-01">Subject</label>
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

    closeEmailModal(status) {
        this.setState({showSendEmailModal: status, selected_template: '', send_status_update: false});
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={
                            [<MsalProvider instance={msalInstance}> <GetInvitedEventStatus
                                {...this.state}
                                {...this.props}
                                applicantRef={this.applicantListRef}
                                page_name={'from_details'}
                                closeModal={this.closeModal}
                            />
                            </MsalProvider>,
                            <Button id="add_interview_applicant" iconPosition='right' disabled={this.validate_group_booking()} label="New" onClick={() => this.showAddApplicantsModal()} />
                            ]}
                        heading={Number(this.state.applicant_count) > 6 ? "Applicants (6+)" : "Applicants (" + this.state.applicant_count + ")"}
                        className="slds-card-bor"
                        icon={<Icon category="utility" name="resource_capacity" size="small" style={{ fill: '#769ed9' }} />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                    {this.renderModals()}
                </IconSettings>
            </React.Fragment>
        );
    }

}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}

const mapStateToProps = state => ({
    sms_recipient_refresh: state.RecruitmentReducer.recruit_refresh.sms_recipient,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        set_recipient_refresh: (request) => dispatch({ type: 'SET_SMS_RECIPIENT', condition: request }),
    }
};

export default connect(mapStateToProps, mapDispatchtoProps, null, { withRef: true })(ApplicantsCard);
