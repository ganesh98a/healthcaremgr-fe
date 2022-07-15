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
import moment from 'moment';
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


/**
 * RequestData get the list of invoice shifts
 */
const requestData = (invoice_id, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { invoice_id: invoice_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceDashboard/get_invoice_shifts_list', Request).then((result) => {
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
 * Class: ListInvoiceShifts
 */
class ListInvoiceShifts extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'shift_no': true,
            'account_fullname': true,
            'member_fullname': true,
            'actual_start_date': true,
            'actual_time': true,
            'actual_duration': true,
            'timesheet_no': true,
            'timesheet_amount': true
        }
    }

    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);
        
        var displayed_columns = ''
        var invoice_id = '';
        if(props.match && props.match.params.id > 0) {
            invoice_id = props.match.params.id;
            displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        
        // Initialize state
        this.state = {
            invoice_id: invoice_id,
            invoice_shift_id: '',
            invoice: '',
            filter_status: 'all',
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
            this.state.invoice_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                shift_skillsList: res.rows,
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
     * fetching the invoice details if the invoice_id is passed
     */
    get_invoice_details = (id) => {
        postData('finance/FinanceDashboard/get_invoice_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        if(this.state.invoice_id) {
            this.get_invoice_details(this.state.invoice_id);
        }
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" />
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
                    id="Shift-skills-search-1"
                    placeholder="Search Shifts"
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
                _label: 'Shift',
                accessor: "shift_no",
                id: 'shift_no',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link to={ROUTER_PATH + 'admin/schedule/details/' + props.original.id} className="vcenter default-underlined slds-truncate"
                    style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Member',
                accessor: "member_fullname",
                id: 'member_fullname',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link to={ROUTER_PATH + 'admin/support_worker/details/' + props.original.member_id} className="vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }}>{props.value}</Link>
            },
            {
                _label: 'Start date',
                accessor: "actual_start_date",
                id: 'actual_start_date',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Time',
                accessor: "actual_time",
                id: 'actual_time',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Duration',
                accessor: "actual_duration",
                id: 'actual_duration',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Timesheet',
                accessor: "timesheet_no",
                id: 'timesheet_no',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <Link to={ROUTER_PATH + 'admin/finance/timesheet/details/' + props.original.timesheet_id} className="vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }}>{props.value}</Link>
            },
            {
                _label: 'Timesheet Amount',
                accessor: "timesheet_amount",
                id: 'timesheet_amount',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{currencyFormatUpdate(props.value, '$')}</span>
            }
        ]
    }

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();
        const trail = [
            <Link id={'listing-link'} to={ROUTER_PATH + `admin/finance/invoices`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Invoices</Link>,
            <Link id={'detail-link'} to={ROUTER_PATH + `admin/finance/invoice/details/` + this.state.invoice_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.invoice_no}</Link>,
        ];

        return (
            <React.Fragment>
            <PageHeader
                trail={trail}
                onRenderActions={this.handleOnRenderActions}
                onRenderControls={this.handleOnRenderControls({ columns })}
                title="Shifts"
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
                            data={this.state.shift_skillsList}
                            defaultPageSize={9999}
                            minRows={1}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}                                     
                        />
                    </IconSettings>
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListInvoiceShifts);