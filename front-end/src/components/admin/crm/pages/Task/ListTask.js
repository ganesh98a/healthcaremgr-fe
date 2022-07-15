import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, checkLoginWithReturnTrueFalse, getPermission } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import { 
    PageHeaderControl, 
    Button, 
    Dropdown, 
    DropdownTrigger,
} from '@salesforce/design-system-react';
import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
const queryString = require('query-string');

const selectApplicationsFilterOptions = [
    { field: "task_name", label: "Task Name", value: "Task Name", order: "1" },
    { field: "due_date", label: "Due Date", value: "Due Date", order: "2" },
    { field: "name", label: "Name", value: "Name", order: "3" },
    { field: "assign_to", label: "Assign To", value: "Assign To", order: "4" },   
    { field: "task_status", label: "Status", value: "Status", order: "5" },
    { field: "created_date", label: "Created Date", value: "Created Date", order: "6" },
    { field: "related_to", label: "Related To", value: "Related To", order: "7" },
    { field: "created_at", label: "Created At", value: "Created At", order: "8" }    
]

/**
 * RequestData get the list of task
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Task/get_task_list', Request).then((result) => {
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
 * Class: ListTask
 */
class ListTask extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            'task_name': true,
            'due_date': true,
            'name': true,
            'assign_to': true,
            'task_status': true,
            'created_date': true,
            'related_to': true,
            'created_at': true,
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
            taskList: [],
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
                taskList: res.rows,
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
        this.setState({ filtered: search_re });
    }
    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Task Name',
                accessor: "task_name",
                id: 'task_name',
                CustomUrl: [{ url: ROUTER_PATH + 'admin/crm/task/details/PARAM1/' },
                { param: ['id'] }, { property: 'target=_blank' }]
            },
            {
                _label: 'Name',
                accessor: "name",
                id: 'name',
                multipleCustomUrl : 'task_related_name',               
            },            
            
            {
                _label: 'Related To',
                accessor: "related_to",
                id: 'related_to',
                multipleCustomUrl : 'task_related_type',
            },            
            {
                _label: 'Due Date',
                accessor: "due_date",
                id: 'due_date',
                CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: 'Assigned To',
                accessor: "assign_to",
                id: 'assign_to',
            }, 
            {
                _label: 'Status',
                accessor: "task_status",
                id: 'task_status',
            },             
        ]
    }

    handleOnRenderActions() {        
        return (
            <React.Fragment>
                <PageHeaderControl>
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
            backgroundColor: '#4bc076',
            fill: '#ffffff',
        }

        return (
            <React.Fragment>
                <div className="ListContact slds td_height_settings" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="Tasks"
                        header_icon="task"
                        icon_style={icon_style}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectApplicationsFilterOptions
                        }
                        list_api_url="sales/Task/get_task_list"
                        related_type="tasks"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="Task"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}
                        sortColumnLabel="Task"
                        sortColumn="id"
                        selection={this.state.selection}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshTable}
                        disable_list_view={true}
                        is_header_info={false}
                        is_list_view_control={false}
                        get_default_pinned_data={false}
                        show_filter_icon = {false}
                    />
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListTask);
