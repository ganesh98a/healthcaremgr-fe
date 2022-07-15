import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, currencyFormatUpdate, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Button, 
    Dropdown, 
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import { showArchiveLineItemModal, openAddEditLineItemModal } from '../FinanceCommon';


/**
 * RequestData get the list of timesheet line_items
 */
const requestData = (timesheet_id, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { timesheet_id: timesheet_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceDashboard/get_timesheet_line_items_list', Request).then((result) => {
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
 * Class: ListTimesheetLineItems
 */
class ListTimesheetLineItems extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'line_item_label': true,
            'units': true,
            'unit_rate': true,
            'total_cost': true,
            'actions': true
        }
    }

    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);
        
        var displayed_columns = ''
        var timesheet_id = '';
        if(props.match && props.match.params.id > 0) {
            timesheet_id = props.match.params.id;
            displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        
        // Initialize state
        this.state = {
            timesheet_id: timesheet_id,
            timesheet_line_item_id: '',
            shift_id: '',
            timesheet: '',
            filter_status: 'all',
            openCreateModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns]
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }
   
    /**
     * Call the requestData
     */
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.state.timesheet_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                line_item_skillsList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * Get the list based on Search value
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
        this.setState({ filtered: search_re });
    }

    /**
     * fetching the timesheet details if the timesheet_id is passed
     */
    get_timesheet_details = (id) => {
        postData('finance/FinanceDashboard/get_timesheet_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Close the modal when user saves the line items and refresh the table
     */
    closeCreateModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.setTableParams();
            this.get_timesheet_details(this.state.timesheet_id);
        }
    }

    /**
     * Open add/edit line items modal
     */
    showModal() {
        this.setState({ openCreateModal: true});
    }

    /**
     * Open archive line item modal
     */
    showArchiveModal(line_item_id) {
        showArchiveLineItemModal(line_item_id, this.state.timesheet_id, this.setTableParams, this.get_timesheet_details);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        if(this.state.timesheet_id) {
            this.get_timesheet_details(this.state.timesheet_id);
        }
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="Edit" onClick={e => this.showModal()} disabled={this.state.status >= 2 ? true : false} />
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * Render search input form
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
                    id="LineItem-skills-search-1"
                    placeholder="Search Line Items"
                />
            </form>
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
     * Render table column dropdown
     */
    renderColumnSelector({ columns = [] }) {
        columns = columns.filter(col => (col.accessor != "actions"));
        const mapColumnsToOptions = columns.map(col => {
            return ({ 
                value: 'id' in col ? col.id : col.accessor,
                label: col._label,
            })
        })

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
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    { this.renderSearchForm() }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Table columns
     */
    determineColumns() {
        return [
            {
                _label: 'Item',
                accessor: "line_item_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Units',
                accessor: "units",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Rate',
                accessor: "unit_rate",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{currencyFormatUpdate(props.value, '$')}</span>
            },
            {
                _label: 'Total',
                accessor: "total_cost",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{currencyFormatUpdate(props.value, '$')}</span>
            },
            {
                _label: '',
                accessor: "actions",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => <Dropdown
                assistiveText={{ icon: 'More Options' }}
                iconCategory="utility"
                iconName="down"
                align="right"
                iconSize="x-small"
                id={'actions' + props.original.member_id}
                iconVariant="border-filled"
                onSelect={(e) => {
                    this.showArchiveModal(props.original.id)
                }}
                width="xx-small"
                disabled={this.state.status >= 2 ? true : false}
                options={[
                    { label: 'Delete', value: '2' },
                ]}
            />
            
            }
        ]
    }

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();
        const trail = [
            <Link id={'listing-link'} to={ROUTER_PATH + `admin/finance/timesheets`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Timesheets</Link>,
            <Link id={'detail-link'} to={ROUTER_PATH + `admin/finance/timesheet/details/` + this.state.timesheet_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.timesheet_no}</Link>,
        ];

        return (
            <React.Fragment>
            <PageHeader
                trail={trail}
                onRenderActions={this.handleOnRenderActions}
                onRenderControls={this.handleOnRenderControls({ columns })}
                title="Line Items"
                label=" "
                truncate
                variant="related-list"
            />           
            </React.Fragment>
        )
    }
    
    /**
     * Render the display content
     */
    render() {
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        {this.renderHeader()}
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
                            data={this.state.line_item_skillsList}
                            defaultPageSize={9999}
                            minRows={1}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}                                     
                        />
                        {openAddEditLineItemModal(this.state.timesheet_id, this.state.shift_id, this.state.openCreateModal, this.closeCreateModal)}
                    </IconSettings>
                    <div className="timesheet-list-total-amount">Total Amount : {currencyFormatUpdate(this.state.amount, '$')} </div>
                </div>
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

const mapDispatchtoProps = (dispach) => { return { } }

export default connect(mapStateToProps, mapDispatchtoProps)(ListTimesheetLineItems);