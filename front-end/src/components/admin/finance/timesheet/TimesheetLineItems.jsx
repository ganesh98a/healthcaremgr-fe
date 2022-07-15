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
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {
    Button,
    Icon,
    Card,
    Dropdown
} from '@salesforce/design-system-react';
import { showArchiveLineItemModal, openAddEditLineItemModal } from '../FinanceCommon';

/**
 * Class: TimesheetLineItems
 */
class TimesheetLineItems extends Component {
    
    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            timesheet_id: this.props.timesheet_id ? this.props.timesheet_id : '',
            shift_id: this.props.shift_id ? this.props.shift_id : '',
            timesheet_line_item_id: '',
            timesheet_line_items: [],
            timesheet_line_items_count: 0,
            openCreateModal: false,
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
     * fetching the timesheet line items
     */
    get_timesheet_line_items_list = () => {
        var Request = { timesheet_id: this.state.timesheet_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('finance/FinanceDashboard/get_timesheet_line_items_list', Request).then((result) => {
            if (result.status) {
                this.setState({timesheet_line_items: result.data, timesheet_line_items_count: result.count});
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
            this.get_timesheet_line_items_list();
            this.props.get_timesheet_details(this.props.timesheet_id);
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
        showArchiveLineItemModal(line_item_id, this.props.timesheet_id, this.get_timesheet_line_items_list, this.props.get_timesheet_details);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        if(this.state.timesheet_id) {
            this.get_timesheet_line_items_list();
        }
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
                disabled={this.props.status >= 2 ? true : false}
                options={[
                    { label: 'Delete', value: '2' },
                ]}
            />
            
            }
        ]
    }

    /**
     * Render the timesheet line_items table
     */
    renderTable() {
        var timesheet_id = this.props.timesheet_id;
        const displayedColumns = this.determineColumns();

        if (this.state.timesheet_line_items_count == 0) {
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
                data={this.state.timesheet_line_items}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={false} 
                style={{border:'none'}}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.timesheet_line_items_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="custom-card-footer">                 
                <Link to={ROUTER_PATH + `admin/finance/timesheet/line_items/${this.state.timesheet_id}`} className="slds-align_absolute-center default-underlined" id="view-all-line_items" title="View all timesheet line_items" style={{ color: '#0070d2' }}>View all</Link>
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
                headerActions={
                <Button label="Edit" onClick={e => this.showModal()} disabled={this.props.status >= 2 ? true : false} />}
                heading={"Line Items ("+ this.state.timesheet_line_items_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" size="small" name="work_order_item" />}
                bodyClassName="body-no-padding"
                >
                <span className="timesheet-total-amount">Total Amount : {this.props.total_amount} </span>             
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
                {openAddEditLineItemModal(this.state.timesheet_id, this.props.shift_id, this.state.openCreateModal, this.closeCreateModal)}
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
export default connect(mapStateToProps, mapDispatchtoProps)(TimesheetLineItems);