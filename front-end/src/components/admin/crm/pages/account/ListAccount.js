import React, { Component } from 'react';
import jQuery from 'jquery'
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { get_list_view_related_type } from '../../../../../service/common_filter.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import moment from "moment";
import { showArchiveAccountModal, openAddEditAccountModal } from './AccountCommon';

import {PageHeaderControl, Dropdown} from '@salesforce/design-system-react';

import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import ListView from '../../../oncallui-react-framework/view/ListView/ListView.jsx'

const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Account/get_account_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count)
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0
                };
                resolve(res);
            }
        });
    });
};

const selectOrganisationFilterOptions = [  
    { value: "Organisation ID", label: "Organisation ID", field:"org_code"},
    { value: "Organisation Name", label: "Organisation Name", field:"name"},
    { value: "Primary Contact", label: "Primary Contact", field:"primary_contact_name"},
    { value: "Status", label: "Status" , field:"o.status"},
    { value: "Created Date", label: "Created Date" , field:"created"},
    { value: "Created By", label: "Created By" , field:"created_by"},
]
class ListAccount extends Component {

    static defaultProps = {
        displayed_columns: {
            org_code: true,
            name: true,
            status: true,
            created: true,
            actions: true,
            primary_contact_name: true,
            created_by: true
        }
    }


    constructor(props) {
        sessionStorage.removeItem('filterarray');
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])

        this.state = {
            searchVal: '',
            filterVal: '',
            contactList: [],
            filter_status: 'all',

            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openViewModal: false,
            selectfilteroptions: selectOrganisationFilterOptions,
            showselectedfilters: false,
            showselectfilters: false,
            selectfiltercreatedbyoptions: [],
            selectedfilval: [],
            default_filter_logic: '1 AND 2',
            filter_logic: '',
            list_control_option: [
                { label: 'LIST VIEW CONTROLS', type: 'header' },
                { label: 'All Organisations', value: 'all' },
            ],
            filter_title: 'All Organisations',
            filter_list_id: '',
            showFilter: false,
            checkdefault: 'all',
            filter_related_type: '',//ListViewRelatedType.organisation,
            filter_error_msg: '',
            is_any_data_pinned: false,
            pinned_id: "0",
            filter_list_length: '0',
            is_own_list: false,
            user_view_by: '1',
            list_control_data: [],
            showFilterOption: false
        }

        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
    * To get list view controls by related type
    * * @param {*} related_type
    */
    get_list_view_related_type = (filter_related_type) => {
        this.props.get_list_view_controls_by_related_type(filter_related_type).then(() => {
            get_list_view_related_type(this, this.props.list_view_control_by_related_type, 'Organisations');
        }).catch((error) => {
            console.log(error);
        })
    }

    showselectedfilters = (type) => {
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }
    /**
     * To close the filter option modal
     */
    closeFilter = () => {
        this.setState({ showselectedfilters: false });
    }
    handleChangeSelectFilterValue = (key, value) => {
        if (key == 'filter_logic' && value == '') {
            this.setState({ default_filter_logic: '' })
        }
        this.setState({ [key]: value, filter_error_msg: '' }, () => {

        })
    }
    
    fetchData = (state) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                contactList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re });
    }

    /**
     * Open create account or archive account modal
     */
    showModal = (item, action) => {
        if(action == 'edit') {
            this.setState({ openCreateModal: true, edit_account_id: item.id });
        }
        else {
            showArchiveAccountModal(item.id, null, this);
        }
    }

    /**
     * Close the modal when user saves the account and refresh the table
     */
    closeAddEditAccountModal = (status) => {
        this.setState({openCreateModal: false, edit_account_id: null});

        if(status){
            this.refreshListView();
        }
    }

    determineColumns() {
        return [
            {
                _label: 'Organisation ID',
                accessor: "org_code",
                id: 'org_code'
            },
            {
                _label: 'Organisation Name',
                accessor: "name",
                id: 'name',
                CustomUrl: [{url : ROUTER_PATH + 'admin/crm/organisation/details/PARAM1/'},
                    {custom_value: 'name'},
                    {param : ['id']},
                ]
            },
            {
                _label: 'Primary Contact',
                accessor: "primary_contact_name",
                id: "primary_contact_name"
            },
            {
                _label: 'Status',
                accessor: "status",
                id: 'status'
            },
            {
                _label: 'Created date',
                accessor: "created",
                id: 'created',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
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
                        key: 'edit'
                    },
                    {
                        id: 1,
                        label: 'Delete',
                        value: '2',
                        key: 'delete'
                    },
                ]
            }
        ];
    }

    onRenderActions() {        
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={'/admin/crm/organisation/importorginsation'} className={`slds-button slds-button_neutral`} >
                        <span>Import CSV File</span>&nbsp;<i className="icon icon icon-download2-ie"></i> </Link>
                    <Link
                        to={'#'}
                        className={`slds-button slds-button_neutral`}
                        onClick ={()=>this.setState({openCreateModal: true})} 
                    >
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    redirectToListing() {
        this.setState({refreshListView: !this.state.refreshListView})
    }
    
    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }
    
    render() {
        return (
           
            <React.Fragment>
                <DataTableListView
                    page_name="Organisations"
                    displayed_columns={this.props.displayed_columns}
                    filter_options={
                        selectOrganisationFilterOptions
                    }
                    list_api_url="sales/Account/get_account_list"
                    filter_api_url='sales/Account/get_account_list'
                    related_type="organisation"
                    filter_status="all"
                    default_filter_logic="1 AND 2"
                    list_control_option={this.state.list_control_option}
                    filter_title="All Organisations"
                    show_filter={false}
                    check_default="all"
                    is_any_data_pinned={false}
                    determine_columns={() => this.determineColumns()}
                    on_render_actions={() => this.onRenderActions()}
                    ref={this.reactTable}
                    refresh={this.state.refreshListView}
                    is_any_action={this.state.is_any_action}
                    showModal={this.showModal}
                    show_filter_icon={true}
                />
                {this.state.openCreateModal && openAddEditAccountModal(this.state.edit_account_id, false, null, null, this.state.openCreateModal, this.closeAddEditAccountModal, 0)}
            </React.Fragment>
        )
    }

}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
    list_view_control: state.ListViewControlActivityReducer.list_view_control,
    activity_loading: state.ListViewControlActivityReducer.activity_loading,
    list_view_control_by_related_type: state.ListViewControlActivityReducer.list_view_control_by_related_type,
    list_view_control_by_id: state.ListViewControlActivityReducer.list_view_control_by_id,
})

const mapDispatchtoProps = (dispatch) => {
    return {  }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListAccount);