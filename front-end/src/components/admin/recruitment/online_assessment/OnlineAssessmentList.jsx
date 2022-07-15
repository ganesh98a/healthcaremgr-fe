import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link,Redirect } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css,AjaxConfirm,toastMessageShow} from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import jQuery from 'jquery';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import { PageHeaderControl } from '@salesforce/design-system-react'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import {DELETE, EDIT, STATUS_CHANGE} from './OaConstants.js';
import ViewTemplate from '../online_assessment/ViewTemplate';
import { save_viewed_log } from '../../../admin/actions/CommonAction.js';

const queryString = require('query-string');

const requestData = (pageSize, page, sorted, filtered) => {

    /**
     * to get the main list from back-end
     */
    return new Promise((resolve) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/OnlineAssessment/get_online_assessments', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};
class OnlineAssessmentList extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "title": true,
            "job_type": true,
            "status": true,
            "created_by": true,                   
            "created": true,
            "actions": true,
            "viewed_date": true,
            "viewed_by": true,
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props
     */
    constructor(props) {
        super(props);
        this.state = {            
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            filter_val: '',
            statusList: [               
                {label: 'All', type: 'status', value: 'all' },
                {label: 'Active', type: 'status', value: 1 },
                {label: 'Inactive', type: 'status', value: 2},
                {label: 'Residential Youth Workers (CYF)', type: 'job_type', value: 3},
                {label: 'Disability Support Workers', type: 'job_type', value: 4},
                {label: 'Oncall Job Ready', type: 'job_type', value: 5}
            ],
            status_filter_value: 'all',
            refreshListView: true,
            redirect:null      
        }       
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
     * handling the delete of oa template
     */
    handleDeleteOATemplate=(template_info)=>{
            const msg = `Are you sure to delete ${template_info.title}?`
            const confirmButton = `Yes`
            const id = template_info.id
            AjaxConfirm({ id }, msg, `recruitment/Recruitment_oa_template/archive_existing_template`, { confirm: confirmButton, heading_title: `Archive OA template` }).then(result => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    this.refreshListView();
                } else {
                    if (result.error) {
                        toastMessageShow(result.error, "e");
                    }
                    return false;
                }
            })
         
    }
     /**
     * handling the change of oa template status
     */
    handleChangeOATemplateStatus=(template_info,status)=>{
        const msg = `Are you sure to change the status as Inactive for ${template_info.title}?`
        const confirmButton = `Yes`
        const id = template_info.id
        /**
         * passing status code from frontend 1- means Active ,2- means Inactive
         */
        AjaxConfirm({ id ,status}, msg, `recruitment/Recruitment_oa_template/change_oa_template_status`, { confirm: confirmButton, heading_title: `InActive OA template` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.refreshListView();
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
                return false;
            }
        })
     
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
    * delete, edit,status change action handler
    */
    actionHandler = (selected, action) => {
       if(action == EDIT){
        this.setState({redirect:ROUTER_PATH +  `admin/recruitment/oa_template/update/` + selected.id});
       }
       else if(action == DELETE){
         this.handleDeleteOATemplate(selected);
       }
       else if(action == STATUS_CHANGE)
       {
         //2- means Inactive Status
         if(selected.status!== "Inactive")
         {
            this.handleChangeOATemplateStatus(selected,2);
         }
      }
   }
   
    handleOnSelectFilterSelector = (option)=>
    {
        this.setState({status_filter_value: option })
    }
    

    openViewModal = (item) => {
        this.getTemplateData(item.id);
    }
    
    closeModal = () => {
        this.setState({isViewOpen: false});
        this.refreshListView();
    }

    /**
     * retrieving the template
     */
     getTemplateData(oa_template_id) {
        this.api_request("recruitment/Recruitment_oa_template/get_oa_template", { id: oa_template_id }, false);
    }

     /**
     * common method to handle API request
     */
      api_request = (url, reqData, route_to = false) => {
        this.setState({ loading: true }, () => {
            postData(url, reqData).then((result) => {
                if (result.status) {
                   
                    this.setState({ loading: false, title: result.data.assessment_template.title,isViewOpen: !this.state.isViewOpen, viewData: result.data.question_answers_list}, () => {
                        //Render Template in Modal
                        this.renderViewModal();
                        //Store lastviewed
                        save_viewed_log({ entity_type: 'online_assessment', entity_id: result.data.assessment_template.id });                        
                    });
                    
                }
            });
        });
    };

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'OA Template',
                accessor: "title",
                id: 'title'               
            },
            {
                _label: 'Job Sub Category',
                accessor: "job_type",
                id: 'job_type',
            },
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
            },
            {
                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            
            {
                _label: 'Last viewed On',
                accessor: "viewed_date",
                id: 'viewed_date',
                Header: ({ column }) => <div className="slds-truncate">{'column._label'}</div>,
                Cell: props => <span className="vcenter slds-truncate">-</span>
            },
            {
                _label: 'Last viewed By',
                accessor: "viewed_by",
                id: 'viewed_by',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">-</span>
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
                    {
                        id: 2,
                        label: 'Mark as inactive',
                        value: '3',
                        key: 'status_change',
                    },
                ]
             }
        ]
    }
    
    handleOnRenderActions() {
        const dropdown_style = {
            width: '250px'
        }
        return (
            <React.Fragment>
                <PageHeaderControl>
                <span> 
                    <SLDSReactSelect
                        simpleValue={true}
                        className="SLDS_custom_Select default_validation slds-select status_type"
                        options={this.state.statusList}
                        onChange={this.handleOnSelectFilterSelector}
                        value={this.state.status_filter_value}                        
                        clearable={false}
                        searchable={false}
                        placeholder="Please Select"
                        required={false}
                        name="status" 
                        id={'status_type'}
                        style={dropdown_style}                       
                    />
                </span>
                   
                   <Link id="btn-new" to={ROUTER_PATH + `admin/recruitment/oa_template/create`} className={`slds-button slds-button_neutral`}>
                   {'New'}
                    </Link>
                       
               
                </PageHeaderControl>
            </React.Fragment>
        )
    }
    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView},()=>{this.fetchData(this.state)})       
    }

    
    renderViewModal() {
        return (
            <React.Fragment>
                <ViewTemplate size={'medium'} isOpen={this.state.isViewOpen} heading={false} data={this.state.viewData} dismissOnClickOutside = {false} close={() => this.closeModal()}                
                OAtitle = {this.state.title}                
                />
            </React.Fragment>
        );
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

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <React.Fragment>
                <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="Online Assessment Template"
                        header_icon="people"
                        icon_style={icon_style}
                        displayed_columns={this.props.displayed_columns}                        
                        list_api_url="recruitment/OnlineAssessment/get_online_assessments"
                        related_type="online_assessment"                        
                        filter_title="All Online Assessment Template"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}                        
                        sortColumnLabel="Created"
                        sortColumn="created_at"                        
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshListView}                        
                        get_default_pinned_data={false}
                        is_list_view_control={false}
                        status_filter_value={this.state.status_filter_value}
                        show_filter_icon={false}
                        listToOpenModal={true}
                        opencloseModal={this.openViewModal}
                        showModal={this.actionHandler}
                    />
                   {this.state.isViewOpen && this.renderViewModal()}
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

export default connect(mapStateToProps, mapDispatchtoProps)(OnlineAssessmentList);