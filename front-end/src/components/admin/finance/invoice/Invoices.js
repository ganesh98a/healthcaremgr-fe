import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, css, toastMessageShow, AjaxConfirm } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon} from '@salesforce/design-system-react'
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import { openAddEditInvoiceModal } from '../FinanceCommon';
const queryString = require('query-string');

/**
 * to get the main list from back-end
 */
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceDashboard/get_invoices_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    total_count: result.total_count
                };
                resolve(res);
            }
        });
    });
};

const invoice_filter_options = [  
    { value: "Invoice No", label: "Invoice No", field:"invoice_no"},
    { value: "Account", label: "Account", field:"account_label"},
    { value: "Contact", label: "Contact", field:"contact_fullname"},
    { value: "Status", label: "Status" , field:"status_label"},
    { value: "Invoice Type", label: "Invoice Type" , field:"invoice_type_label"},
    { value: "Amount", label: "Amount" , field:"amount"},
    { value: "Invoice Date", label: "Invoice Date" , field:"invoice_created_date"},
    { value: "Shift Start Date", label: "Shift Start Date" , field:"shift_start_date"},
    { value: "Shift End Date", label: "Shift End Date" , field:"shift_end_date"},
]

class Invoices extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "invoice_type_label": true,
            "account_label": true,
            "invoice_no": true,
            "contact_fullname": true,
            "amount": true,
            "status_label": true,
            "invoice_created_date": true,
            "shift_start_date": true,
            "shift_end_date": true,
            "actions": true
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            openCreateModal: false,
            invoice_id: '',
            searchVal: '',
            filterVal: '',
            invoices_list: [],
            row_selections: [],
            status_options: [],
            list_control_option: [
                { label: 'LIST VIEW CONTROLS', type: 'header' },
                { label: 'All Invoices', value: 'all' },
            ],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * changing the state when checkboxes are ticked/unticked
     */
    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
        var newselection = [];
        for (let i = 0; i < selection_count; i++) {
            if(dataSelection[i].status == 1 || dataSelection[i].status == 0) {
                newselection.push(dataSelection[i]);
            }
        }
        var newselection_count = newselection.count;

		this.setState({ selection: newselection, checkedItem: newselection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};

    /**
     * Bulk emailing invoices to selected ones
     */
    bulkEmail = () => {
        if (this.state.row_selections.length == 0) {
            toastMessageShow("Please select at least one invoice", "e");
            return false;
        }
        var total_selected = this.state.row_selections.length;
        var label = total_selected > 0 ? " invoices" : " invoice";
        var confirm_msg = 'Are you sure want to email selected ' + total_selected + label + '?';
        var req = { ids: this.state.row_selections};

        AjaxConfirm(req, confirm_msg, `finance/FinanceDashboard/send_invoice_mail`, { confirm: "Email Invoice" }).then(result => {
            if (result.status) {
                this.setState({row_selections: [], selection: [], checkedItem: 0});
                this.refreshListView();
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        })
    }

    /**
     * when status change is requested
     */
    updateInvoiceStatus = () => {
        if (this.state.row_selections.length == 0) {
            toastMessageShow("Please select at least one invoice", "e");
            return false;
        }

        var req = { ids: this.state.row_selections, status: 2};
        postData('finance/FinanceDashboard/bulk_update_invoice_status', req).then((result) => {
            if (result.status) {
                this.setState({row_selections: [], selection: [], checkedItem: 0});
                this.refreshListView();
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * when checkboxes are clicked inside the data table
     */
    handleCheckboxSelect = (e) => {
        let data = this.state.selection;
        let tempArr = [];
        for (let i = 0; i < data.length; i++) {
            tempArr.push(data[i].id);
        }
        this.setState({row_selections: tempArr});
    }

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection:[], row_selections:[] });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_invoice_statuses();
    }

    /**
     * fetching the invoice statuses
     */
    get_invoice_statuses = () => {
		postData("finance/FinanceDashboard/get_invoice_statuses", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_options: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * Open create invoice modal
     */
    showModal = (item, action) => {
        this.setState({ openCreateModal: true, invoice_id: (action == 'edit') ? item.id : '' });
    }

    /**
     * Close the modal when user saves the invoice
     */
    closeAddEditInvoiceModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.refreshListView();
        }
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={() => this.showModal()} />
                    <ButtonGroup variant="list" id="button-group-page-header-actions">
                        <Button label="Email Invoice" onClick={(e) => { this.bulkEmail() }} />
                        <Dropdown
                            assistiveText={{ icon: 'More Options' }}
                            iconCategory="utility"
                            iconName="down"
                            align="right"
                            iconSize="x-medium"
                            iconVariant="border-filled"
                            onSelect={(e) => {
                                this.updateInvoiceStatus()
                            }}
                            width="xx-small"
                            options={[
                                { label: 'Mark Invoice Paid', value: '1' }
                            ]}
                        />
                    </ButtonGroup>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * refreshing the list view
     */
    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Invoice',
                accessor: "invoice_no",
                id: 'invoice_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/finance/invoice/details/PARAM1/'},
                    {custom_value: 'invoice_no'},
                    {param : ['id']},
                ],
                width: '12%'
            },
            {
                _label: 'Account',
                accessor: "account_label",
                id: 'account_label',
                CustomUrl: [{url : ROUTER_PATH + 'admin/item/participant/details/PARAM1/'},
                {param : ['account_id']}],
                width: '23%'
            },
            {
                _label: 'Contact',
                accessor: "contact_fullname",
                id: 'contact_fullname',
                CustomUrl: [{url : ROUTER_PATH + 'admin/crm/contact/details/PARAM1/'},
                    {custom_value: 'contact_id'},
                    {param : ['contact_id']},
                ],
                width: '13%'
            },
            {
                _label: 'Invoice Type',
                accessor: "invoice_type_label",
                id: 'invoice_type_label',
                width: '10%'
            },
            {
                _label: 'Amount',
                accessor: "amount",
                id: 'amount',
                width: '8%'
            },
            {
                _label: 'Status',
                accessor: "status_label",
                id: 'status_label',
                width: '8%'
            },
            {
                _label: 'Invoice Date',
                accessor: "invoice_created_date",
                id: 'invoice_created_date',
                width: '10%'
            },
            {
                _label: 'Shift Start Date',
                accessor: "shift_start_date",
                id: 'shift_start_date',
                width: '10%'
            },
            {
                _label: 'Shift Start Date',
                accessor: "shift_end_date",
                id: 'shift_end_date',
                width: '10%'
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '5%',
                actionList : [
                    {
                        id: 0,
                        label: 'Edit',
                        value: '0',
                        key: 'edit'
                    },
                ]
            }
        ]
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

        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0);

        return (
            <React.Fragment>
            <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <DataTableListView
                        page_name="Invoices"
                        header_icon="record"
                        icon_style={{display:'inherit'}}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            invoice_filter_options
                        }
                        list_api_url="finance/FinanceDashboard/get_invoices_list"
                        filter_api_url='finance/FinanceDashboard/get_invoices_list'
                        related_type="invoices"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        list_control_option={this.state.list_control_option}
                        filter_title="All Invoices"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={() => this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        custom_filter_status_option={this.state.status_options}
                        selectRows="checkbox"
                        sortColumnLabel="ID"
                        sortColumn="id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}

                        showModal={this.showModal}
                    />
                </IconSettings>
                {openAddEditInvoiceModal(this.state.invoice_id, this.state.openCreateModal, this.closeAddEditInvoiceModal, undefined)}
            </div>
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'Invoice',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Invoices);