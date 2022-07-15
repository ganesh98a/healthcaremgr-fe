import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, checkLoginWithReturnTrueFalse, getPermission } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import {
    PageHeaderControl,
    Button,
    Dropdown,
    DropdownTrigger,
} from '@salesforce/design-system-react';
import CreateRoleModel from './CreateRoleModel';
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
const queryString = require('query-string');

const selectApplicationsFilterOptions = [
    { field: "name", label: "Role Name", value: "Role Name", order: "1" },
    { field: "description", label: "Description", value: "Description", order: "2" },
    { field: "start_date", label: "Start Date", value: "Start Date", order: "3" },
    { field: "end_date", label: "End Date", value: "End Date", order: "4" }    
]

/**
 * RequestData get the list of role
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('item/MemberRole/get_role_list', Request).then((result) => {
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

/**
 * Class: ListRole
 */
class ListRole extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "name": true,
            "description": true,
            "start_date": true,
            "end_date": true,
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
            roleList: [],
            filter_status: 'all',
            openCreateModal: false,    
            refreshTable: false,
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]), 
                 
        }
        
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
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
                roleList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }   

    /**
     * mounting all the components
     */
    componentDidMount() {
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
        this.setState({ selection: data.selection });
    };

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filters: this.state.selectedfilval };
        console.log(search_re);
        this.setState({ filtered: search_re });
    }

    /**
     * Open create role modal
     */
     showModal = () => {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user save the role and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, roleId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.setTableParams();
            this.refreshListView();
        }
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Role Name',
                accessor: "name",
                id: 'name',
                CustomUrl: [{ url: ROUTER_PATH + 'admin/item/role/details/PARAM1/' },
                { param: ['role_id'] }, { property: 'target=_blank' }]
            },
            {
                _label: 'Description',
                accessor: "description",
                id: 'description'               
            },            
            
            {
                _label: 'Start Date',
                accessor: "start_date",
                id: 'start_date',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },            
            {
                _label: 'End Date',
                accessor: "end_date",
                id: 'end_date',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            }
        ]
    }

    handleOnRenderActions() {
        const handleOnClickNewRole = e => {
            e.preventDefault()
            this.showModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={handleOnClickNewRole} />
                </PageHeaderControl>
            </React.Fragment>
        )
    }    
    refreshListView() {
        this.setState({ refreshTable: !this.state.refreshTable, selection: [] }, () => { this.fetchData(this.state) })
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

    /**
     * Render filter dropdown of status
     */
     renderStatusFilters() {
        let roleStatusFilter = [
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
                options={roleStatusFilter}
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
     * Render Modal
     * - Owner Change
     */
    renderModal = () => {
        return (
            <React.Fragment>
            {
                this.state.openCreateModal && (
                    <CreateRoleModel
                        showModal = {this.state.openCreateModal}
                        closeModal = {this.closeModal}
                        headingTxt = "Create Role"
                    />
                )
            }
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
            backgroundColor: '#ba93a3',
            fill: '#ffffff',
        }

        return (
            <React.Fragment>
                <div className="ListContact slds td_height_settings" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="Role"
                        header_icon="portal_roles"
                        icon_style={icon_style}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectApplicationsFilterOptions
                        }
                        list_api_url="item/MemberRole/get_role_list"
                        related_type="roles"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="Role"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}
                        // selectRows="checkbox"
                        sortColumnLabel="Role Id"
                        sortColumn="role_id"
                        selection={this.state.selection}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshTable}
                        disable_list_view={true}
                        is_header_info={false}
                        is_list_view_control={false}
                        get_default_pinned_data={false}
                        show_filter_icon = {false}
                        default_status_filter={this.renderStatusFilters()}
                    />
                    {this.renderModal()}
                </div>
            </React.Fragment>
        );
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

const mapDispatchtoProps = (dispach) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListRole);
