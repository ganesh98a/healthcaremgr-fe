import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, currencyFormatUpdate, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import moment from 'moment';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {
    Button,
    Icon,
    Card,
} from '@salesforce/design-system-react';

/**
 * Class: InvoiceShifts
 */
class InvoiceShifts extends Component {
    
    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            invoice_id: this.props.invoice_id ? this.props.invoice_id : '',
            invoice_shift_id: '',
            invoice_shifts: [],
            invoice_shifts_count: 0,
            pageSize: 6,
            page: 0,
            sorted: [],
            filtered: []
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * fetching the invoice shifts
     */
    get_invoice_shifts_list = () => {
        var Request = { invoice_id: this.state.invoice_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('finance/FinanceDashboard/get_invoice_shifts_list', Request).then((result) => {
            if (result.status) {
                this.setState({invoice_shifts: result.data, invoice_shifts_count: result.count});
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
            this.get_invoice_shifts_list();
        }
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
            }
        ]
    }

    /**
     * Render the invoice shifts table
     */
    renderTable() {
        var invoice_id = this.props.invoice_id;
        const displayedColumns = this.determineColumns();

        if (this.state.invoice_shifts_count == 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => false}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                filtered={this.state.filtered}
                columns={displayedColumns}
                data={this.state.invoice_shifts}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={true} 
                style={{border:'none'}}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.invoice_shifts_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="custom-card-footer">
                <Link to={ROUTER_PATH + `admin/finance/invoice/shifts/${this.state.invoice_id}`} className="slds-align_absolute-center default-underlined" id="view-all-shifts" title="View all invoice shifts" style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <Card
                headerActions={''}
                heading={"Shifts ("+ this.state.invoice_shifts_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" size="small" name="date_input" />}
                bodyClassName="body-no-padding"
                >
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
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
export default connect(mapStateToProps, mapDispatchtoProps)(InvoiceShifts);