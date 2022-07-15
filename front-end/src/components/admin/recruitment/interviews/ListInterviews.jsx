import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, checkLoginWithReturnTrueFalse, getPermission, css, toastMessageShow, queryOptionData } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import jQuery from 'jquery';
import {
    Checkbox,
    IconSettings,
    PageHeaderControl,Dropdown,ButtonGroup,
    Button,DataTableColumn} from '@salesforce/design-system-react'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import CreateInterviewModal from './CreateInterviewModal.jsx';
import ArchiveModal  from '../../oncallui-react-framework/view/Modal/ArchiveModal';
import InviteApplicantModal from './InviteApplicantModel.jsx';

const queryString = require('query-string');

const selectApplicationsFilterOptions = [
    { field: "title", label: "Title", value: "Title", order: "1" },
    { field: "interview_start_datetime", label: "Start Date", value: "Start Date", order: "2" },
    { field: "interview_end_datetime", label: "End Date", value: "End Date", order: "3" },
    { field: "interview_type", label: "About", value: "About", order: "4" },
    { field: "interview_stage_status", label: "Status", value: "Status", order: "5" },
    { field: "attendees", label: "Attendees", value: "Attendees", order: "6" },
    { field: "max_applicant", label: "Max Applicant", value: "Max Applicant", order: "7" },
    { field: "location", label: "Location", value: "Location", order: "8" },
    { field: "owner_name", label: "Owner", value: "Owner", order: "9" },
    { field: "meeting_link", label: "Invite", value: "Invite", order: "10" },
    
]

const requestData = (pageSize, page, sorted, filtered) => {

    /**
     * to get the main list from back-end
     */
    return new Promise((resolve) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentInterview/get_interviews', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};
class ListInterviews extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "title": true,
            "interview_start_datetime": true,
            "interview_end_datetime": true,
            "location": true,
            "interview_type": true,
            "owner_name": true,
            "status":true,
            "attendees": true,
            "meeting_link": true, 
            'interview_stage_status_label':true,           
            "created": true,
            "actions": true,
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
            selection: [],
            refreshTable: true,
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            flageModel: false,
            filter_val: '',
            recruiter_val: '',
            job_position_option: [],
            stage_option: [{ label: 'All', value: 0 }],
            recruiter_option: [{ label: 'All', value: 0 }],
            status_option: [{ label: 'All', value: 0 }],
            showselectedfilters: false,
            showselectfilters: false,
            selectfilteroptions: selectApplicationsFilterOptions,
            selectfilteroperatoroptions: [
                { value: "equals", label: "Equals to", symbol: "=" },
                { value: "not_equal", label: "Not equal to", symbol: "!=" },
                { value: "less_than", label: "Less than", symbol: "<" },
                { value: "less_than_equal", label: "Less than equal to", symbol: "<=" },
                { value: "greater_than", label: "Greater than", symbol: ">" },
                { value: "greater_than_equal", label: "Greater than equal to", symbol: ">=" },
                { value: "contains", label: "Contains", symbol: "%.%" },
                { value: "not_contain", label: "Does not contain", symbol: "!%.%" },
                { value: "starts_with", label: "Starts with", symbol: "%" }
            ],
            openOwnerChangeModal: false,
            location_options: [],
            owner_names: [],
            row_selections: [],
            bulk_archive:false,
            archive_content:'',
            created_interview_id: '',
            created_max_applicant_limit: '',
            created_interview_type: '',
            openAddApplicants: false,
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
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }

    /**
     * hiding the panel of selected filters
     */
    removeSelectedFilters = (key) => {
        var allEntries = JSON.parse(sessionStorage.getItem("filterarray"));
        delete allEntries[key];
        let cleanArray = allEntries.filter(function () { return true });
        sessionStorage.setItem('filterarray', JSON.stringify(cleanArray));
        this.setState({ selectedfilval: JSON.parse(sessionStorage.getItem("filterarray")) }, () => {
            if (this.state.selectedfilval.length == 0) {
                this.resetFilters();
            }
        });
    }

    /**
     * handling the change event in selection of filter fields
     */
    handleChangeSelectFilterValue = (key, value) => {
        this.setState({ [key]: value });

        // check if certain filter fields are selected, then making operator fields pre-set
        if (key == "select_filter_field" && (value == "stage" || value == "recruiter" || value == "status_label")) {
            this.setState({ 'select_filter_operator': 'equals' });
        }
    }

    /**
     * handling the submission of main filtered panel
     */
    sendFilterSubmit = (type) => {
        this.setState({ showselectedfilters: false, showselectfilters: false });
        let getsessdatas = JSON.parse(sessionStorage.getItem("filterarray"));
        if (type == "reset") {

            getsessdatas = sessionStorage.removeItem('filterarray');

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
     * to fetch the filtered data by setting required props and calling the request data function
     */
    fetchData = (state) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                applicantList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }
    /**
     * fetching the recruitment location
     */
    get_recruitment_location = () => {
        postData("recruitment/RecruitmentInterview/get_all_recruitment_location", {}).then((res) => {
                this.setState({location_options : res});
        });
    }

    /**
     * get the interview types
     */
    get_all_recruitment_interview_type = () => {
        postData("recruitment/RecruitmentInterview/get_all_interview_type", {}).then((res) => {
            if (res.status) {
                this.setState(res)
            }
        });
    }
    /**
     * get the interview types
     */
    get_recruitment_name = () => {
        postData("recruitment/RecruitmentTaskAction/get_recruiter_listing_for_create_task", {}).then((res) => {
            this.setState({owner_names : res});
        });
    }

    /**
     * get the interview details by id
     * @param {array} item
     * @param {int} interview_id
     */
     get_interview_detail_by_id = (item, interview_id) => {
        postData("recruitment/RecruitmentInterview/get_interview_detail_by_id", { interview_id: interview_id}).then((res) => {
            if (res.status) {
                let interview_detail = res.data;
                this.setState({
                    openAddApplicants: true,
                    created_interview_id: item.interview_id || '',
                    created_max_applicant_limit: item.max_applicant || '',
                    location: item.location || '',
                    interview_start_date: interview_detail.interview_start_date || '',
                    interview_end_date: interview_detail.interview_end_date || '',
                    interview_start_time: interview_detail.interview_start_time || '',
                    interview_end_time: interview_detail.interview_end_time || '',
                    interview_type: interview_detail.interview_type || '',
                    interview_type_id: interview_detail.interview_type_id || '',
                    group_booking_email_subject: interview_detail.subject || '',
                    group_booking_email_template: interview_detail.template_content || '',
                    ms_template: ''
                });
            } else {
                return '';
            }
        });
    }

    /**
     * mounting all the components
     */
    componentWillMount() {
        this.get_all_recruitment_interview_type();
        this.get_recruitment_location();
        this.get_recruitment_name();
      
    }
   /*
     * method runs after the component output has been rendered to the DOM
     */
   componentDidMount() {       
    jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
  
}

componentWillUnmount() {
    jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
}

    /**
     * hanlding quick search submission
     * @param {*} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    handleChanged = (event, data) => {
		//this.setState({ selection: data.selection });
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: dataSelection, checkedItem: selection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filters: this.state.selectedfilval };
        this.setState({ filtered: search_re });
    }
    /*
    * Open create interview modal
    */
   showModal = (selected, action) => {
       if(action == 'edit' || action == 'create'){
        this.setState({ openCreateInterview: true, selected_id : selected.interview_id, interview_stage_status : selected.interview_stage_status, modal_action : action, attendees_count: selected.attendees_count });
       }
       if(action == 'delete'){
        this.setState({showInterviewArchiveModal :  true, archive_interview_id : selected.interview_id});
       }
         
   }
   
   handleArchiveType(value)
   {
     if(value==1&&this.state.row_selections.length > 0)
     {
        let is_content_change=this.state.row_selections.length > 1 ?'records?':'record?';
        let archive_content= 'Are you sure you want to archive the selected '+ is_content_change;
        this.setState({showInterviewArchiveModal :true,bulk_archive:true,archive_content});
     }else if(value==2){
        this.props.props.history.push(ROUTER_PATH + `admin/recruitment/interview/archived`)
     }
   }
   
   /**
    * Close the modal when user save the interview and refresh the table
    * Get the Unique reference id
    */
   closeModal = (status, data) => {
       this.setState({openCreateInterview: false});
        if(status){
            this.refreshListView();
            if (data.interview_id) {
                this.setState({
                    openAddApplicants: this.state.modal_action !='edit' ? true : false,
                    created_interview_id: data.interview_id || '',
                    created_max_applicant_limit: data.max_applicant || '',
                    interview_start_date: data.interview_start_date || '',
                    interview_end_date: data.interview_end_date || '',
                    interview_start_time: data.interview_start_time || '',
                    interview_end_time: data.interview_end_time || '',
                    location: data.location || '',
                    interview_type: data.interview_type || '',
                    interview_type_id: data.interview_type_id || '',
                    group_booking_email_subject: data.group_booking_email_subject || '',
                    group_booking_email_template: data.group_booking_email_template || '',
                    owner_name: data.owner && data.owner.label ?  data.owner.label : '',
                    owner_email: data.owner && data.owner.email ?  data.owner.email : '',
                    owner: data.owner && data.owner.value ?  data.owner.value : '',
                });
            }
        }
   }

   /**
    * Set applicant modal close / open
    * @param {bool} status 
    */
    setModalApplicants = (status) => {
        this.setState({ openAddApplicants: status })
    }

   /**
     * Close archive interview modal
     */
    closeInterviewArchiveModal= (status_type) =>{
        this.setState({showInterviewArchiveModal :  false, archive_interview_id : '',bulk_archive:false})
        if(status_type=='success')
        {
            this.refreshListView();
            this.resetSelection();
        }
      
    }

    /**
     * Add Attendees
     * @param {array} item 
     */
    callSetAddAttendees = (item) => {
        this.get_interview_detail_by_id(item, item.interview_id);
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Title',
                accessor: "title",
                id: 'title',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/interview_details/PARAM1'},
                {param: ['interview_id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Start Date',
                accessor: "interview_start_datetime",
                id: 'interview_start_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'End Date',
                accessor: "interview_end_datetime",
                id: 'interview_end_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'About',
                accessor: "interview_type",
                id: 'interview_type',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            
            {
                _label: 'Status',
                accessor: "interview_stage_status_label",
                id: 'interview_stage_status_label',
            },
            {
                _label: 'Attendees',
                accessor: "attendees",
                id: 'attendees',
            },
            {
                _label: 'Location',
                accessor: "location",
                id: 'location'
            },
            {
                _label: 'Owner',
                accessor: "owner_name",
                id: 'owner_name',
            },
            {
                _label: 'Invite',
                accessor: "meeting_link",
                id: 'meeting_link',
            },            
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '50px',
                actionList : [
                    {
                        id: 0,
                        label: 'Edit',
                        value: '1',
                        key: 'edit',
                    },
                    {
                        id: 1,
                        label: 'Delete',
                        value: '2',
                        key: 'delete',
                    },
                ]
             }
        ]
    }

    /**
     * prepating the panel of selected filters (primary)
     */
    showSelectedFilterPanel() {
        return (
            this.state.showselectedfilters &&
            <PageHeaderControl>
                <div style={{ top: '90px', right: '14px', position: 'absolute', 'zIndex': '1' }}>
                    <div class="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
                        <div class="slds-panel__header">
                            <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Filter</h2>
                        </div>
                        <div class="slds-panel__body">
                            <div class="slds-filters">
                                <div className="slds-form-element__control">
                                    <Button label="Cancel" onClick={() => this.sendFilterSubmit("search")} />
                                    {this.state.selectedfilval &&
                                        <Button style={{ float: 'right' }} disabled={this.state.loading} label="Save" variant="brand"
                                            onClick={() => this.sendFilterSubmit("search")}
                                        />
                                    }
                                </div>

                                {this.state.selectedfilval &&
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">Matching following filters:</h3>
                                }
                                {!this.state.selectedfilval &&
                                    <br></br>
                                }
                                <ol class="slds-list_vertical slds-list_vertical-space">
                                    {
                                        this.state.selectedfilval && this.state.selectedfilval.map((value, idx) => (
                                            value !== null &&
                                            (<li class="slds-item slds-hint-parent">
                                                <div style={{ background: 'lightgoldenrodyellow' }} class="slds-filters__item slds-grid slds-grid_vertical-align-center">
                                                    <button class="slds-button_reset slds-grow slds-has-blur-focus">
                                                        <span class="slds-assistive-text">Edit filter:</span>
                                                        <span class="slds-show slds-text-body_small">{value.select_filter_field_label}</span>
                                                        <span class="slds-show">{value.select_filter_operator_label} "{value.select_filter_value_label}"</span>
                                                    </button>
                                                    <span class="slds-button_reset slds-grow slds-has-blur-focus">
                                                        <span onClick={() => this.removeSelectedFilters(idx)} style={{ float: 'right', cursor: 'pointer' }} class="slds-show slds-text-body_small">x</span>
                                                    </span>
                                                </div>
                                            </li>
                                            )
                                        ))
                                    }
                                </ol>
                                <div class="slds-filters__footer slds-grid slds-shrink-none">
                                    <button class="slds-button_reset slds-text-link" onClick={this.showselectfilters}>Add Filter</button>
                                    <button class="slds-button_reset slds-text-link slds-col_bump-left" onClick={this.resetFilters}>Remove All</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Filtering */}
                </div>
            </PageHeaderControl>
        )
    }

    handleOnRenderActions() {
        return (
            <React.Fragment>
                <PageHeaderControl>
                   
                  {/*  {
                    this.state.row_selections.length<1?(<Button>
                    <Link to={ROUTER_PATH + `admin/recruitment/interview/archived`} className="reset" style={{ color: '#0070d2' }}>
                    {'Archive List'}
                    </Link>
                    </Button> ):
                    (<Button label="Archive" disabled={false} onClick={() => this.showModal('', 'archive')} />)
                   } */}
                   <Button label="New" disabled={false} onClick={() => this.showModal('', 'create')} />
                   <ButtonGroup variant="list" id="button-group-page-header-actions">
					<Button label="Archive List" variant="neutral" />
					<Dropdown
						assistiveText={{
							icon: 'More Options',
						}}
						buttonVariant="icon"
						iconCategory="utility"
						iconName="down"
						iconVariant="border-filled"
						id="page-header-related-list-archive-dropdown"
						openOn="click"
						align="right"
                        onSelect={value => this.handleArchiveType(value.value)}
						options={[
							{
								label: 'Archive Selected',
								value: '1',
                                disabled: this.state.row_selections.length<1?true:false
							},
							{
								label: 'View Archived List',
								value: '2',
                               
                            }
							
						]}
                        onClick={this}
					/>
                 </ButtonGroup>
               
                </PageHeaderControl>
            </React.Fragment>
        )
    }
    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable,selection:[]},()=>{this.fetchData(this.state)})       
    }

    /**
     * Render Modal
     * - Create Inteview Modal
     */
    renderModal = () => {
        return (
            <>
                {
                    this.state.openCreateInterview &&
                    <CreateInterviewModal
                        interview_id={this.state.selected_id}
                        attendees_count={this.state.attendees_count}
                        showModal={this.state.openCreateInterview}
                        closeModal={this.closeModal}
                        interview_stage_status={this.state.interview_stage_status}
                        {...this.props}
                    />
                }
                {this.state.showInterviewArchiveModal && <ArchiveModal
                                id = {this.state.archive_interview_id}
                                bulk_archive_id={this.state.row_selections}
                                msg={'Group Booking'}
                                content ={this.state.archive_content}
                                header_title={'Archive Group Booking'}
                                confirm_button={'Yes'}
                                cancel={"No"}
                                bulk_archive={this.state.bulk_archive}
                                api_url = {'recruitment/RecruitmentInterview/archive_interview'}
                                close_archive_modal = {()=>this.closeInterviewArchiveModal('cancel')}
                                on_success={()=> this.closeInterviewArchiveModal('success')}

                /> }
                {
                    this.state.openAddApplicants && (
                        <InviteApplicantModal
                            setModalApplicants={this.setModalApplicants}
                            openAddApplicants={this.state.openAddApplicants}
                            interview_id={this.state.created_interview_id}
                            interview_type={this.state.created_interview_type}
                            max_applicant={this.state.created_max_applicant_limit}
                            page_from={'list_interviews'}
                            refreshListView={()=>this.refreshListView()}
                            {...this.state}
                        />
                    )
                }
            </>
        );
    }

     /**
     * when checkboxes are clicked inside the data table
     */
      handleCheckboxSelect = (e) => {
        let data = this.state.selection;
        let tempArr = [];
        for (let i = 0; i < data.length; i++) {
            tempArr.push(data[i].interview_id);
        }
        this.setState({row_selections: tempArr});
    }

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection: [], row_selections: [] ,checkedItem:0});
    }
    /**
     * rendering components
     */
    render() {
        this.defualtFilter = queryString.parse(window.location.search);

        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const icon_style = {
            backgroundColor: '#5ebfcd',
            fill: '#ffffff',
        }

        return (
            <React.Fragment>
                <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="Group Booking"
                        header_icon="people"
                        icon_style={icon_style}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={selectApplicationsFilterOptions}
                        select_filter_type_options={this.state.interview_types}
                        select_filter_location_options={this.state.location_options}
                        select_filter_owner_name_options={this.state.owner_names}
                        list_api_url="recruitment/RecruitmentInterview/get_interviews"
                        related_type="interviews"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Group Booking"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}
                        selectRows="checkbox"
                        sortColumnLabel="Group Booking Id"
                        sortColumn="interview_id"
                        selection={this.state.selection}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshTable}
                        showModal={this.showModal}
                        customFunc={this.callSetAddAttendees}
                        checkedItem={this.state.checkedItem}
                    />
                    {this.renderModal()}
                </div>
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'ListInterviews',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListInterviews);