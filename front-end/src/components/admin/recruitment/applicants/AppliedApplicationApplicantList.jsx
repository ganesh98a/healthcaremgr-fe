import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, checkLoginWithReturnTrueFalse, getPermission, css, toastMessageShow } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { onlineAssementTemplate} from '../actions/RecruitmentApplicantAction';

import {
    Checkbox,
    IconSettings,
    ButtonGroup,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DataTableRowActions
} from '@salesforce/design-system-react'
import DataTableListQuickFilter from '../../oncallui-react-framework/view/ListView/DataTableListQuickFilter.jsx'
import { getDataListById } from '../../actions/CommonAction.js';

import OwnerChangeModal from './OwnerChangeModal.jsx';
import CreateCabCertificate from './application_header_action/CreateCabCertificate.jsx';
import CreateMemberModal from './application_header_action/CreateMemberModal.jsx';
import CreateEmployerContract from './application_header_action/CreateEmployerContract.jsx';
import StageUpdateModal from './StageUpdateModal.jsx';
import AssessmentInitiateModel from './application_header_action/AssessmentInitiateModel.jsx';
import EmailSetup from '../wizard/EmailSetup';
import SendSMSPopOver from './application_header_action/SendSMSPopOver';
import { OAStatus } from '../../oncallui-react-framework/view/ListView/list_view_control_json';

const queryString = require('query-string');

const determineListingControlColumns = () => {
    return [
        { label: 'Change Owner', value: '4' , disabled: 'false'},
        { label: 'CAB Certificate', value: '1' , disabled: 'false'},
        { label: 'Employment Contract', value: '2' , disabled: 'false'},
        { label: 'Create Support Worker', value: '3' , disabled: 'false'},   
    ]; 
}

const requestData = (application_id, pageSize, page, sorted, filtered, quick_filter) => {

    /**
     * to get the main list from back-end
     */
    return new Promise((resolve) => {
        var Request = { application_id: application_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, quick_filter: quick_filter };
        postData('recruitment/RecruitmentApplicant/get_applications_by_id', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

const requestDataJob = (job_id) => {
    /**
     * to get the main list from back-end
     */
    return new Promise((resolve) => {
        var Request = { jobId: job_id };
        postData('recruitment/recruitment_job/get_job_detail', Request).then((result) => {
            let data = result.data;
            const res = {
                jobs_data: data
            };
            resolve(res);
        });

    });
};


class ApplicationsApplicantList extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "id": true,
            "fullname": true,
            "job_position": true,
            "recruiter": true,
            "created": true,
            "stage": true,
            "status_label": true,
            "process_status_label": true,
            "applied_through": true,
            "referred_by": true,
            "viewed_date": true,
            "viewed_by": true,
            "oa_status": true,
            "action": true
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props
     */
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            filterVal: '',
            end_date: null,
            start_date: null,
            applicantList: [],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            flageModel: false,
            filter_val: '',
            recruiter_val: '',
            job_position_option: [],
            stage_option: [{label:'All',value:0}],
            recruiter_option: [{label:'All',value:0}],
            status_option: [{label: 'All', value:0}],
            showselectedfilters: false,
            showselectfilters: false,
            filter_applicant: '',
            filter_recruitor: '',
            filter_stage: '',
            filter_status_new: false,
            filter_status_screening: false,
            filter_status_interviews: false,
            filter_status_reference: false,
            filter_status_douments: false,
            filter_status_cab: false,
            filter_status_inprogress: false,
            filter_status_hired: false,
            filter_status_unsuccessful: false,
            job_title: '',
            sessionFilter: {
                filter_applicant: false,
                filter_recruitor: '',
                filter_stage: '',
                filter_status_new: false,
                filter_status_screening: false,
                filter_status_interviews: false,
                filter_status_reference: false,
                filter_status_douments: false,
                filter_status_cab: false,
                filter_status_inprogress: false,
                filter_status_hired: false,
                filter_status_unsuccessful: false,
            },
            request_data: { 
                application_id: this.props.props.match.params.id, 
                application_status: (this.props.props.match.params.application_status != undefined) ? 1 : ''
            },
            selection: [],
            refreshTable: true,
            openOwnerChangeModal: false,
            openCreateCabCertificate: false,
            openCreateMember: false,
            openEmployerContract: false,
            checkedItem: 0,
            isFilter: false,
            isValidItemsSelected:false,
            containsInvalidSelections:false,
            oa_status_selected_list:[]
        }
        
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * showing the filter options selection panel
     */
    showselectfilters = () => {
        this.setState({ showselectfilters: true });
    }

    /**
     * hiding the filter options selection panel
     */
    hideselectfilters = () => {
        this.setState({
            showselectfilters: false,
            select_filter_field: '',
            select_filter_operator: '',
            select_filter_value: ''
        });
    }

    /**
     * showing the panel of selected filters
     */
    showselectedfilters = (type) => {
        this.setState({ showselectfilters : false,showselectedfilters: !type });
    }

    /**
     * handling the change event in selection of filter fields
     */
    handleChangeSelectFilterValue = (key, value,oa_status_val=null) => {
        this.setState({ [key]: value });
        if(oa_status_val != null){
            if(value){
                let oa_status_selected_list = this.state.oa_status_selected_list;
                oa_status_selected_list.push(oa_status_val);
                this.setState({oa_status_selected_list});
            }else{
                let oa_status_selected_list = this.state.oa_status_selected_list;
                let index = oa_status_selected_list.indexOf(oa_status_val);
                oa_status_selected_list.splice(index,1);
                this.setState({oa_status_selected_list});
            }
        }

        // check if certain filter fields are selected, then making operator fields pre-set
        if(key == "select_filter_field" && (value == "stage" || value == "recruiter" || value == "status_label")) {
            this.setState({ 'select_filter_operator': 'equals' });
        }
    }

    /**
     * handling the submission of main filtered panel
     */
    sendFilterSubmit = (type) => {
        this.setState({ showselectedfilters: false,showselectfilters: false});
        let getsessdatas = JSON.parse(sessionStorage.getItem("filterarray"));
        if(type == "reset"){

            getsessdatas =  sessionStorage.removeItem('filterarray');

        }
        getsessdatas && getsessdatas.sort(function (x, y) {
            return x.selected_field_sort - y.selected_field_sort;
        });

        this.setTableParams();
    }

    /**
     * when selected filters are reset using a link
     */
    resetFilters = () => {
        this.state.selectedfilval = [];
        this.state.showselectedfilters = false;
        this.state.showselectfilters = false;
        this.sendFilterSubmit("reset");
    }

    /**
     * handling the submission of filter selection panel
     */
    selectFilterOnSubmit = (e) => {
        this.setState({ selection: [], refreshTable: true, page:0, isFilter: true}, () => {    
            e.preventDefault();
            jQuery("#select_filter_form").validate({});
                if (jQuery("#select_filter_form").valid()) {
                    this.showselectedfiltersModal(false, false);
                    this.fetchData(this.state);
                    this.setState({
                        sessionFilter: {
                            filter_applicant: this.state.filter_applicant,
                            filter_recruitor: this.state.filter_recruitor,
                            filter_stage: this.state.filter_stage,
                            filter_status_new: this.state.filter_status_new,
                            filter_status_screening: this.state.filter_status_screening,
                            filter_status_interviews: this.state.filter_status_interviews,
                            filter_status_reference: this.state.filter_status_reference,
                            filter_status_douments: this.state.filter_status_douments,
                            filter_status_cab: this.state.filter_status_cab,
                            filter_status_inprogress: this.state.filter_status_inprogress,
                            filter_status_hired: this.state.filter_status_hired,
                            filter_status_unsuccessful: this.state.filter_status_unsuccessful,
                            refreshTable: true,
                            request_data: this.state,
                        }
                    });
                } });
     
        
    }

    /**
     * to fetch the filtered data by setting required props and calling the request data function
     */
    fetchData = (state) => {
        this.setState({ loading: true });
        var application_id = this.props.props.match.params.id;
        var quick_filter = {};
        quick_filter["applicant"] = this.state.filter_applicant;
        quick_filter["recruitor"] = this.state.filter_recruitor;
        quick_filter["status"] = [];
        quick_filter["oa_statuses"] = this.state.oa_status_selected_list;
        var status = [];
        if (this.state.filter_status_new == true) {
            status.push(0);
        }
        if (this.state.filter_status_screening == true) {
            status.push(1);
        }
        if (this.state.filter_status_interviews == true) {
            status.push(2);
        }
        if (this.state.filter_status_documents == true) {
            status.push(3);
        }
        if (this.state.filter_status_reference == true) {
            status.push(4);
        }
        if (this.state.filter_status_inprogress == true) {
            status.push(5);
        }
        if (this.state.filter_status_cab == true) {
            status.push(6);
        }        
        if (this.state.filter_status_hired == true) {
            status.push(7);
        }
        if (this.state.filter_status_unsuccessful == true) {
            status.push(8);
        }
        quick_filter["status"] = status;
        var Request = {
            application_id: application_id,
            page: state.page,
            filtered: state.filtered,
            quick_filter: quick_filter,
            pageSize: this.props.pageSize,
        };

        var list_reset = false;
        if (state.page === 0) {
            list_reset = true;
        }
        
       this.props.getApplicationListByIdProps('recruitment/RecruitmentApplicant/get_applications_by_id', Request, true, list_reset);
        this.setState({ loading: false, request_data: Request, isFilter: false  });
    }

    /**
     * Get jobs details by id
     * @param {int} job_id
     */
    get_job_details = (job_id) => {
        requestDataJob(job_id
        ).then(res => {
            var jobs_data = res.jobs_data;
           /*  this.setState({
                job_title: jobs_data.parentState.title || '',
                job_category: jobs_data.parentState.category || '',
            }); */
        });
    }

    /**
     * fetching the stages of application process
     */
    get_application_stages = () => {
        // stage_option
        postData('recruitment/RecruitmentApplicant/get_all_recruitment_stages', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ stage_option: data });
            }
        });
    }

    /**
     * fetching the statuses of application
     */
    get_application_statuses = () => {
        // status_option
        postData('recruitment/RecruitmentApplicant/get_application_statuses', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ status_option: data });
            }
        });
    }

    /**
     * fetching the list of recruiters
     */
    get_application_recruiters = () => {
        // recruiter_option
        postData('recruitment/RecruitmentApplicant/get_application_recruiters', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ recruiter_option: data });
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        var job_id = this.props.props.match.params.id;
        this.get_job_details(job_id);
        this.get_application_stages();
        this.get_application_recruiters();
        this.get_application_statuses();
        this.getAssementTemplate();
        
        if(this.props.props.match.params.application_status != undefined){
            this.setState({ filter_status_new: true });
        }

    }    

    /**
     * hanlding quick search submission
     * @param {*} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search,  filters: this.state.selectedfilval};
        this.setState({ filtered: search_re });
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Application Id',
                accessor: "id",
                id: 'id',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/application_details/PARAM1/PARAM2/'},
                 {param: ['applicant_id','id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Applicant',
                accessor: "FullName",
                id: 'fullname',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/applicant/PARAM1/'},
                 {param: ['applicant_id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Application Status',
                accessor: "process_status_label",
                id: 'process_status_label',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Online Assessment Status',
                accessor: "oa_status",
                id: 'oa_status',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/applicant_assessment/PARAM1/PARAM2/'},
                 {param: ['application_id','assessment_id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Owner',
                accessor: "recruiter_name",
                id: 'recruiter',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/staff_details/PARAM1/'},
                {param : ['recruiter']}]
            },
            {
                _label: 'Applied through',
                accessor: "applied_through",
                id: 'applied_through'
            },
            {
                _label: 'Referred By',
                accessor: "referred_by",
                id: 'referred_by',
            },
            {
                _label: 'Last Viewed Date',
                accessor: "viewed_date",
                id: 'viewed_date',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Last Viewed By',
                accessor: "viewed_by",
                id: 'viewed_by'
            },
            {
                _label: 'Date Applied',
                accessor: "created",
                id: 'created',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Action',
                accessor: "action",
                className: "slds-tbl-card-td slds-tbl-card-td-dd",
                sortable: false,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell:
                <DataTableRowActions
                    label={'Action'}
                    header={'Action'}
                    options={[]}
                    disabled={true}
                    dropdown={<Dropdown length="7" />}
                />
            }
        ]
    }

    /**
     * Close filter modal
     */
    showselectedfiltersModal = (value, reset) => {
        if (reset === true) {
            var sessionFilter = this.state.sessionFilter;
            this.setState({
                filter_applicant: sessionFilter.filter_applicant,
                filter_recruitor: sessionFilter.filter_recruitor,
                filter_stage: sessionFilter.filter_stage,
                filter_status_new: sessionFilter.filter_status_new,
                filter_status_screening: sessionFilter.filter_status_screening,
                filter_status_interviews: sessionFilter.filter_status_interviews,
                filter_status_reference: sessionFilter.filter_status_reference,
                filter_status_douments: sessionFilter.filter_status_douments,
                filter_status_cab: sessionFilter.filter_status_cab,
                filter_status_inprogress: sessionFilter.filter_status_inprogress,
                filter_status_hired: sessionFilter.filter_status_hired,
                filter_status_unsuccessful: sessionFilter.filter_status_unsuccessful,
            });
        }
        this.setState({
            showselectedfilters: value
        });
    }

    /**
     * prepating the filter selection panel (secondary)
     */
    showSelectFilterPanel() {
        let checkbox_status = [
            { label: 'New', value: 'new'},
            { label: 'Screening', value: 'screening'},
            { label: 'Interviews', value: 'interviews'},
            { label: 'In progress', value: 'inprogress'},
            { label: 'CAB', value: 'cab'},           
            { label: 'Hired', value: 'hired'},
            { label: 'UnSuccessful', value: 'unsuccessful'}
        ];
        let oa_status = OAStatus;
        return (
            this.state.showselectedfilters &&
            <PageHeaderControl>
                <div style={{ height: '455px', top: '90px', right: '14px', position: 'absolute', 'zIndex': '999' }}>
                    {/* List Filtering */}
                    <div class="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
                        <div class="slds-panel__header">
                            <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Quick Filter</h2>
                            <button  onClick={() => this.showselectedfiltersModal(false, true)} class="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Filter">
                                <Icon
                                    assistiveText={{ label: 'Close' }}
                                    category="utility"
                                    name="close"
                                    size="xx-small"
                                />
                                <span class="slds-assistive-text">Quick Filters</span>
                            </button>
                        </div>
                        <div class="slds-panel__body">
                            <div class="slds-filters">
                                <form id="select_filter_form" autoComplete="off" className="slds_form">
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">Applicant</h3>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            class="slds-input"
                                            name="filter_applicant"
                                            id="filter_applicant"
                                            placeholder="Enter Value"
                                            onChange={(e) => this.handleChangeSelectFilterValue('filter_applicant', e.target.value)}
                                            value={this.state.filter_applicant || ''}
                                        />
                                    </div>
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">Status</h3>
                                    <div className="slds-form-element__control">
                                        <ul className="slds-p-top_xx-small">
                                            {checkbox_status.map((item) =>
                                                <li>
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: item.label,
                                                        }}
                                                        checked={this.state['filter_status_'+item.value]}
                                                        id={'filter_status_'+item.value}
                                                        labels={{
                                                            label: item.label,
                                                        }}
                                                        onChange={() => {
                                                            this.handleChangeSelectFilterValue('filter_status_'+item.value, !this.state['filter_status_'+item.value]);
                                                        }}
                                                    />
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">OA Status</h3>
                                    <div className="slds-form-element__control">
                                        <ul className="slds-p-top_xx-small">
                                            {oa_status.map((item) =>
                                                <li>
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: item.label,
                                                        }}
                                                        checked={this.state['filter_oa_status_'+item.value]}
                                                        id={'filter_oa_status_'+item.value}
                                                        labels={{
                                                            label: item.label,
                                                        }}
                                                        onChange={() => {
                                                            this.handleChangeSelectFilterValue('filter_oa_status_'+item.value, !this.state['filter_oa_status_'+item.value],item.value);
                                                        }}
                                                    />
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">Owner</h3>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            class="slds-input"
                                            name="filter_recruitor"
                                            id="filter_recruitor"
                                            placeholder="Enter Value"
                                            onChange={(e) => this.handleChangeSelectFilterValue('filter_recruitor', e.target.value)}
                                            value={this.state.filter_recruitor || ''}
                                        />
                                    </div>
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small"></h3>
                                </form>
                            </div>
                        </div>
                        <div class="slds-popover__footer">
                            <div class="slds-text-align_right">
                                <button id="filter_cancel" class="slds-button slds-button_neutral" type="button" onClick={() => this.showselectedfiltersModal(false, true)}>Cancel</button>
                                <button disabled={this.state.loading} id="filter_apply"  class="slds-button slds-button_brand" type="button" onClick={this.selectFilterOnSubmit}>Apply</button></div>
                        </div>
                    </div>
                    {/* List Filtering */}
                </div>
            </PageHeaderControl>
        )
    }

    handleOnRenderActions() {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                <AssessmentInitiateModel                        
                        onClick={(e) => this.showHeaderActionModal('send_oa')}
                        containsInvalidApplications={this.state.containsInvalidSelections}
                        selection={this.state.selected_application}
                        isJobDetailsPage={false}
                        jobId={this.state.request_data.application_id}
                        selectedApplications={this.state.selection}
                        templateList={this.props.assessment_templates}
                        job_category={this.state.job_category}
                        oa_error_msg={this.state.oa_error_msg}
                        resetSelection={this.resetSelection}
                    />                    
                    <SendSMSPopOver
                        onClick={(e) => this.showHeaderActionModal('send_sms')}
                        isJobDetailsPage={true}
                        selection={this.state.selection}
                        jobId={this.props.props.match.params.id || 0}
                    />
                    <Button label="Update Status" id="create_member" title={`Update Status`} onClick={() => this.showHeaderActionModal('update_stage')} />
                    
                    <Dropdown
                        id="header_drop_down"
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-medium"
                        iconVariant="border-filled"
                        onSelect={(e) => {
                            //call the cab certificate / employment contract   
                            this.showHeaderActionModal(e.value);
                        }}
                        width="xx-small"                        
                        options={determineListingControlColumns()}
                    />
                </ButtonGroup>
            </PageHeaderControl>
        );
    }
    /**
     * toggling the copy shifts modal
     */
     toggleUpdateStageModal = (status) => {
        this.setState({ openStageUpdateModal: !this.state.openStageUpdateModal});
        if(status) {
            this.setTableParams();
            this.refreshListView();
        }
    }

    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable,selection:[], checkedItem: 0},()=>{this.fetchData(this.state)})
    }

    /**
     *  for change owner
     */
     get_applicant_list = (val) => {
        if(this.state.selection.length <= 0) {
            toastMessageShow("Please select at least one applicant", "e");
            return false;
        }
        if(this.state.selection.length > 15) {
            toastMessageShow("Please select maximum 15 applications", "e");
            return false;
        }
        switch(val) {
            case 1:
                this.toggleChangeOwnerModal();
                break;
            case 2:
                this.toggleUpdateStageModal(false);
                break;
            default:
                this.toggleChangeOwnerModal();
                break;
        }
    }

    /**
     * Open create cab certificate or transfer application
     */
     showHeaderActionModal = (header_action) => {
        let selected_application = [];
        if(this.state.selection.length <= 0) {
            toastMessageShow("Please select at least one applicant", "e");
            return false;
        }
        if(this.state.selection.length > 15) {
            toastMessageShow("Please select maximum 15 applications", "e");
            return false;
        }
        if(header_action==1){            
            this.state.selection.forEach((item:any)=> {
                let obj = {
                    applicant_id: item.applicant_id,
                    application_id: item.application_id,
                    applicant_email: item.email,
                }
                selected_application.push(obj);
            })        
            this.setState({ 
                openCreateCabCertificate: true,
                selected_application: selected_application
            });
        } else if(header_action==2){
            if(this.state.selection.length > 6) {
                toastMessageShow("Please select maximum 6 applications", "e");
                return false;
            }
            this.state.selection.forEach((item:any)=> {
                let obj = {
                    applicant_id: item.applicant_id,
                    application_id: item.application_id,
                    contractId: '', 
                    task_applicant_id: ''
                }
                selected_application.push(obj);
            })
            this.setState({ 
                openEmployerContract: true,
                selected_application: selected_application
            });
        }else if(header_action == 3){
            let show_modal = [];
            this.state.selection.forEach((selected)=> {     
                if(selected.hired_as_member=='Yes') {
                    show_modal.push('true');                   
                }         
                let obj = {
                    applicant_id: selected.applicant_id,
                    application_id: selected.application_id,
                    application_process_status: selected.application_process_status
                }
                selected_application.push(obj);
            }) 
            if(show_modal.length==0){
                this.setState({ 
                    openCreateMember: true,
                    selected_application: selected_application
                });
            }else{
                toastMessageShow("Please select an applicant/applicants that are not already converted to a member", "e");
                return false;
            }           
        }else if (header_action == 4) {
            this.toggleChangeOwnerModal(false);
        }else if (header_action === 'update_stage') {
            let show_msg = [];
            this.state.selection.forEach((selected) => {
                if (parseInt(selected.flagged_status) == 2) {
                    show_msg.push('true');
                }
            });
            if (show_msg.length != 0) {
                toastMessageShow("Unselect 'Flagged' applicants", "e");
                return false;
            } else {
                this.toggleUpdateStageModal(false);
            }
           
        }else if (header_action === 'send_oa' || header_action === 'send_sms') {
            return true;
        }
    }

    /**
     * Render Modal
     * - Owner Change
     * - update stage
     * - cab certificate
     * - employment contract
     * - member modal
     */
     renderModal = () => {
        return (
            <>
            {
                this.state.openOwnerChangeModal && 
                    <OwnerChangeModal
                        selection={this.state.selection}
                        closeModal={this.toggleChangeOwnerModal.bind(this)}
                        openModal={this.state.openOwnerChangeModal}
                    />
            }
            {
                this.state.openStageUpdateModal && 
                    <StageUpdateModal
                        selection={this.state.selection}
                        closeModal={this.toggleUpdateStageModal.bind(this)}
                        openModal={this.state.openStageUpdateModal}

                    />
            }
            {
                this.state.openCreateCabCertificate && (
                    <CreateCabCertificate        
                        application_list = {this.state.selected_application}
                        isBulkApplication = {true}
                        showModal = {this.state.openCreateCabCertificate}
                        closeModal = {()=>this.closeHeaderActionModal(true)}
                        {...this.props}
                    />
                )                
            }
            {
                this.state.openEmployerContract && (
                    <CreateEmployerContract        
                        application_list = {this.state.selected_application}
                        showModal = {this.state.openEmployerContract}
                        closeModal = {()=>this.closeEmployerContractModel(true)}
                        {...this.props}
                    />
                )
            }

            {
                this.state.openCreateMember && (
                    <CreateMemberModal     
                        is_bulk_update = {true}   
                        selection={this.state.selected_application}
                        isBulkApplication = {true}
                        openModal = {this.state.openCreateMember}
                        closeModal = {()=>this.closeHeaderActionModal(true)}
                        {...this.props}
                    />
                )
            }
            </>
        );
    }

    /**
     * toggling the copy shifts modal
     */
     toggleChangeOwnerModal = (status) => {
        this.setState({ openOwnerChangeModal: !this.state.openOwnerChangeModal});
        if(status) {
            this.setTableParams();
            toastMessageShow("Updated successfully", "s");
            this.refreshListView();
        }
    }

    /**
     * Close the modal when user save the applicant and refresh the table
     * Get the Unique reference id
     */
     closeHeaderActionModal = (status) => {
        this.setState({ openCreateCabCertificate: false, openCreateMember: false, openModalSendSMS: false});
        
        if (status) {
            this.refreshListView();
        }
    }

    closeEmployerContractModel = (status) => {
        this.setState({ openEmployerContract: false});
        if (status === true) {
            this.setState({ selection: [], checkedItem: 0 });
        }
    }
     /**
     * Get Online Assessment Template
     * @param {int} job_id
     */
      getAssementTemplate = () => {
        var req = { job_id: this.props.props.match.params.id }
        this.props.getOnlineAssementTemplate(req);
    }

    /**
     * Check box handle change
     * @param {obj} event 
     * @param {array} data 
     */
    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: data.selection, checkedItem: selection_count, containsInvalidSelections: false },()=>{
            const validApplications = this.state.selection.find(value=>{

                if(value.application_process_status<8 && value.oa_status !='In progress'){
                    return value
                }
            })
            this.setState({isValidItemsSelected:validApplications?true:false})           

            let show_modal = [];
            this.state.selection.forEach((selected)=> {     
                if(selected.application_process_status==8){
                    show_modal.push(selected.application_process_status);
                }else if(selected.oa_status == 'In progress'){
                    show_modal.push('2');
                }
                
            })
            if(show_modal.includes('8') && show_modal.includes('2')){
                this.setState({oa_error_msg : "Unselect 'Unsuccessful' applicants and 'In progress' assessment to initiate Online Assessment", containsInvalidSelections: true})
            }else if(show_modal.includes('8')){
                this.setState({oa_error_msg : "Unselect 'Unsuccessful' applicants to initiate Online Assessment", containsInvalidSelections: true})
            }else if(show_modal.includes('2')){
                this.setState({oa_error_msg : "Unselect 'In progress' assessment to initiate Online Assessment", containsInvalidSelections: true})
            }            
        });
	};

    /**
     * Reset selection List
     */
     resetSelection = (status) =>{
        this.setState({ selection:[] }); 
        if (status) {
            this.refreshListView();
        }
    }
    
    /**
     * rendering components
     */
    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.determineColumns();
        let request_data = this.state.request_data;

        const trail = [
            <Link to={ROUTER_PATH + `admin/recruitment/job_opening/jobs`} className="reset slds-truncate" style={{ color: '#0070d2' }} id="job-list">Jobs</Link>,
            <Link to={ROUTER_PATH + `admin/recruitment/job_opening/jobs`} className="slds-truncate reset" style={{ color: '#0070d2' }} id="job-details">{this.state.job_title}</Link>,
		];
        let pageComponentValue = {
            variant: 'related-list',
            title: 'Job Applications',
            trail: trail,
            icon: {
                title: 'Job Applications',
                category: 'standard',
                name: 'employee_job',
                backgroundColor: '#51a2e0',
                fill: '#ffffff'
            },
            inputSearch: {
                search: true,
                placeholder: 'Search Applicants',
                id: 'list_applicant_input_search'
            },
            columns: {
                columns: true,
                list: columns,
            },
            filter: {
                quick_filter: true,
                btnAction: this.showselectedfilters.bind(this),
                modalShowState: this.state.showselectedfilters,
                filterComponent: this.showSelectFilterPanel.bind(this)
            }
        };
        return (
            <React.Fragment>
            <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <DataTableListQuickFilter
                        ref='child'
                        page_header={false}
                        pageSize={20}
                        pageComponentValue={pageComponentValue}
                        pageHeaderComponent={''}
                        pageTableColumns={columns}
                        header_icon="file"
                        displayed_columns={this.state.displayed_columns}
                        default_displayed_columns={this.state.default_displayed_columns}
                        list_api_url="recruitment/RecruitmentApplicant/get_applications_by_id"
                        request_data={request_data}
                        related_type="application"
                        filter_status="all"
                        determine_columns={this.determineColumns}
                        refresh={this.state.refreshTable}
                        sortColumnLabel="Date Applied"
                        sortColumn="created"
                        on_render_actions={() => this.handleOnRenderActions()}
                        selectRows="checkbox"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        info={true}
                        checkedItem={this.state.checkedItem}
                        isFilterPage = {this.state.isFilter}
                    />
                    {this.renderModal()}
                </IconSettings>
            </div>
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}

const mapStateToProps = state => ({
    showPageTitle: 'ApplicationsApplicantList',
    showTypePage: state.RecruitmentReducer.activePage.pageType,
    dataTableValues: state.CommonReducer.dataTableValues,
    pageSize: state.CommonReducer.dataTableValues.pageSize || 0,
    items: state.CommonReducer.dataTableValues.items || [],
    prevItems: state.CommonReducer.dataTableValues.prevItems || [],
    pages: state.CommonReducer.dataTableValues.pages || 0,
    totalItem: state.CommonReducer.dataTableValues.totalItem || 0,
    hasMore: state.CommonReducer.dataTableValues.hasMore || 0,
    currentPage : state.CommonReducer.dataTableValues.currentPage  || 0,
    assessment_templates: state.RecruitmentApplicantReducer.OAtemplateList
})

const mapDispatchtoProps = (dispatch) => {
    return {
        getApplicationListByIdProps: (api_url, request, clear_all) => dispatch(getDataListById(api_url, request, clear_all)),
        getOnlineAssementTemplate: (request) => dispatch(onlineAssementTemplate(request)),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(ApplicationsApplicantList);