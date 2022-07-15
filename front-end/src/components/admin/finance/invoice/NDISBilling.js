import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "service/Pagination.js";
import { connect } from 'react-redux'
import { downloadFile, postData, reFreashReactTable, currencyFormatUpdate } from 'service/common.js';
import createClass from 'create-react-class';
import _ from 'lodash';
import { colorCodeInvoiceStatus, iconFinanceShift, defaultSpaceInTable } from 'service/custom_value_data.js';
import { requestInvoiceData as requestData } from '../action/FinanceAction.js';
import { InvoiceListFilterStatusDropdown } from 'dropdown/FinanceDropdown.js';
import { ROUTER_PATH, PAGINATION_SHOW, BASE_URL, CURRENCY_SYMBOL } from 'config.js';
import moment from 'moment';


class NDISBilling extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeCol: '',
            filter_by: 'all',
            invoiceList: [],
            fundType: 1,
            filtered: { fundType: 1 }

        }
        this.reactTable = React.createRef();
    }

    fetchInvoiceList = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            1
        ).then(res => {
            this.setState({
                invoiceList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    submitSearch = (e, key, value, checkTextBoxValue) => {
        if (e)
            e.preventDefault();




        var state = {};
        state[key] = value;

        this.setState(state, () => {
            if (checkTextBoxValue != undefined && checkTextBoxValue) {
                if ((this.state.search && this.state.search.length > 0) || (value == this.state.filter_by && this.state.filter_by == 'all' && key == 'filter_by')) {
                    this.filterListing();
                }
            } else {
                this.filterListing();
            }
        })
    }

    filterListing = () => {
        let req = { search: this.state.search, filter_by: this.state.filter_by, start_date: this.state.start_date, end_date: this.state.end_date, fundType: this.state.fundType };
        this.setState({ filtered: req })
    }

    submitExport = () => {
        //alert('dsad');
        let Request = { filtered: this.state.filtered };
        postData('finance/FinanceInvoice/ndis_export_csv', Request).then((result) => {
            if (result.status) {
                downloadFile(BASE_URL + 'mediaDownload/' + result.filename);// 'mediaDownload/1573795509_line__item_report.csv');
            }
        })

    }


    render() {
        const dataTable = [
            { task: 'Task 1', duedate: '10/10/2025', assign: 'Tanner Linsley', },
            { task: 'Task 1', duedate: '10/10/2025', assign: 'Tanner Linsley', },
            {
                task: 'Task 1', duedate: '10/10/2025', assign: 'Tanner Linsley',
            },]

        const columns = [
            {
                accessor: "invoice_number",
                id: "invoice_number",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Invoice Number</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                id: "description",
                accessor: "description",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Description</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                id: "invoice_for",
                accessor: "invoice_for",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Invoice For</div>
                    </div>
                ,
                className:'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span className={(props.original.invoice_for_booked !='' && iconFinanceShift.hasOwnProperty(_.toLower(props.original.invoice_for_booked)) ? iconFinanceShift[_.toLower(props.original.invoice_for_booked)] :'') +' '+ ((props.original.booked_gender !='' ? props.original.booked_gender :''))}>
                    <i className="icon"></i>
                    <div>{defaultSpaceInTable(props.value)}</div>
                </span>
            },
            {
                id: "addressto",
                accessor: "addressto",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Addressed To</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                id: "amount",
                accessor: "amount",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Amount</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(currencyFormatUpdate(props.value, CURRENCY_SYMBOL))}</span>
            },
            /* {
                id: "fund_type",
                accessor: "fund_type",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Fund Type</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            }, */
            {
                id: "invoice_date",
                accessor: "invoice_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Date of Invoice</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },

            {
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                accessor: 'invoice_status',
                id: 'invoice_status',
                width: 180,
                resizable: false,
                headerStyle: { border: "0px solid #fff" },
                expander: true,
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Status</div>
                    </div>,
                Expander: (props) =>
                    <div className="expander_bind">
                         <div className="d-flex w-100 justify-content-center align-item-center">
                        <span className={'short_buttons_01 '+(colorCodeInvoiceStatus[_.toLower(props.original.invoice_status)]? colorCodeInvoiceStatus[_.toLower(props.original.invoice_status)]:'')}>{props.original.invoice_status}</span>
                        </div>

                        {/* props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i> */}
                    </div>,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }

            }

        ]
        var selectOpt = [
            { value: 'all', label: 'All' },
            { value: 'invoice_number', label: 'Invoice Number' },
            { value: 'description', label: 'Description' },
            { value: 'invoice_for', label: 'Invoice For' },
            { value: 'addressto', label: 'Addressed To' },
            { value: 'amount', label: 'Amount' },
            { value: 'fund_type', label: 'Fund Type' },
            { value: 'invoice_date', label: 'Date of Invoice' },
            { value: 'invoice_status', label: 'Status' }
        ];



        /* const columns = [
            {
                id: "invoicenumber",
                accessor: "invoicenumber",
                headerClassName: 'Th_class_d1 header_cnter_tabl checkbox_header',
                className: 'Tb_class_d1 Tb_class_d2',
                // Cell: (props) => {
                //     return (
                //         <span>
                //             <label className="Cus_Check_1">
                //                 <input type="checkbox" /><div className="chk_Labs_1"></div>
                //             </label>
                //             <div>{props.value}</div>
                //         </span>
                //     );
                // },
                Header: x => {
                    return (
                        <div className="Tb_class_d1 Tb_class_d2">
                            <span >
                                <label className="Cus_Check_1">
                                    <input type="checkbox" /><div className="chk_Labs_1"></div>
                                </label>
                                <div>Invoice Number</div>
                            </span>
                        </div>
                    );

                },
                resizable: false,
                width: 230
            },
            {
                id: "description",
                accessor: "description",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Description</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                id: "invoicefor",
                accessor: "invoicefor",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Invoice For</div>
                    </div>
                ,
                className: 'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span>
                    <i className="icon icon-userm1-ie"></i>
                    <i className="icon icon-userf1-ie"></i>
                    <div>{props.value}</div>
                </span>

            },

            {
                id: "addressedto",
                accessor: "addressedto",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Addressed To</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                // Header: "Fund Type",
                id: "amount",
                accessor: "amount",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Amount</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                // Header: "Date Of Last Issue",
                id: "dateofinvoice",
                accessor: "dateofinvoice",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Date Of Invoice</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },

            {
                id: "status",
                // accessor: "status",
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                width: 160,
                resizable: false,
                headerStyle: { border: "0px solid #fff" },
                expander: true,
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Status</div>
                    </div>,
                Expander: (props) =>
                    <div className="expander_bind">
                         <div className="d-flex w-100 justify-content-center align-item-center">
                        <span className="short_buttons_01 btn_color_archive">Error</span>
                        {/* <span className="short_buttons_01 btn_color_assigned" >Assigned</span>
                            <span className="short_buttons_01 btn_color_avaiable">Assigned</span>
                            <span className="short_buttons_01 btn_color_ihcyf">Assigned</span>
                            <span className="short_buttons_01 btn_color_offline">Assigned</span>
                        
                            <span className="short_buttons_01 btn_color_unavailable">Assigned</span>
                        <span className="short_buttons_01">Assigned</span> * /}
                        </div>

                        {props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                    </div>,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }

            }

        ] */


        var selectOpt = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];

        function logChange(val) {
            //console.log("Selected: " + val);
        }


        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">


                        <div className=" py-4">
                            <span className="back_arrow">
                                <a href={ROUTER_PATH + "admin/finance/NdisInvoices"}><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-9">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>
                                {/* <div className="col-lg-3 d-flex align-self-center">
                                    <a className="C_NeW_BtN w-100"><span>Create New CSV</span><i className="icon icon icon-add-icons"></i></a>
                                </div> */}
                            </div>
                        </div>

                        <div className="bb-1 mb-4">
                            <div className="row sort_row1-- after_before_remove">
                                <div className="col-lg-6 col-md-8 col-sm-8 ">
                                    <form method="post" onSubmit={this.submitSearch}>
                                        <div className="search_bar right srchInp_sm actionSrch_st">
                                            <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                            <i className="icon icon-search2-ie" onClick={this.filterListing}></i>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-4 ">
                                    <div className="sLT_gray left left-aRRow">
                                        <Select
                                            simpleValue={true}
                                            name="form-field-name"
                                            value={this.state.filter_by}
                                            options={InvoiceListFilterStatusDropdown(false)}
                                            onChange={(value) => this.submitSearch('', 'filter_by', value, true)}
                                            clearable={false}
                                            searchable={false}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-4 ">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="Fil_ter_ToDo">
                                                <label>From</label>
                                                <span  className={'cust_date_picker'}>
                                                    <DatePicker
                                                        selected={this.state.start_date}
                                                        isClearable={true}
                                                        onChange={(value) => this.submitSearch('', 'start_date', value)}
                                                        placeholderText="00/00/0000"
                                                        dateFormat="dd-MM-yyyy"
                                                        autoComplete={'off'}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="Fil_ter_ToDo">
                                                <label>To</label>
                                                <span  className={'cust_date_picker right_0_date_piker'}>
                                                    <DatePicker
                                                        selected={this.state.end_date}
                                                        onChange={(value) => this.submitSearch('', 'end_date', value)}
                                                        placeholderText="00/00/0000"
                                                        isClearable={true}
                                                        dateFormat="dd-MM-yyyy"
                                                        autoComplete={'off'}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                <div className="row">

                    <div className="col-lg-12 NDIS-Billing_tBL">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                            {/* <ReactTable
                                data={ndiserror}
                                columns={columns}
                                PaginationComponent={Pagination}
                                noDataText="No Record Found"
                                // onPageSizeChange={this.onPageSizeChange}
                                minRows={2}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={true}
                                className="-striped -highlight"
                                noDataText="No duplicate applicant found"
                                SubComponent={(props) =>
                                    <div className="tBL_Sub">
                                        <div className="tBL_des">Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                     when an unknown printer took a galley of type and scrambled it to make a</div>
                                        <a className="short_buttons_01 pull-right">View Task</a>
                                    </div>}
                            /> */}

                            <ReactTable
                                filtered={this.state.filtered}
                                manual
                                onFetchData={this.fetchInvoiceList}
                                data={this.state.invoiceList}
                                columns={columns}
                                PaginationComponent={Pagination}
                                noDataText="No Record Found"
                                minRows={2}
                                defaultPageSize={10}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={this.state.invoiceList.length > PAGINATION_SHOW ? true : false}
                                className="-striped -highlight"
                                noDataText="No record found"
                                collapseOnDataChange={false}
                                ref={this.reactTable}
                                SubComponent={(props) =>
                                    <div className="tBL_Sub">
                                        <div className="tBL_des">
                                            {(props.original.invoice_shift_notes) ? <div className="f-14 mb-3"><span className="color f-bold pr-2">Invoice Shift Notes:</span>{props.original.invoice_shift_notes}</div> : ''}
                                            {(props.original.line_item_notes) ? <div className="f-14 mb-3"><span className="color f-bold pr-2">Invoice Shift Notes:</span>{props.original.line_item_notes}</div> : ''}
                                            {(props.original.manual_invoice_notes) ? <div className="f-14 mb-3"><span className="color f-bold pr-2">Invoice Shift Notes:</span>{props.original.manual_invoice_notes}</div> : ''}
                                        </div>
                                        {/* <Link to={"/admin/finance/invoice/view/"+props.original.id} className="short_buttons_01 pull-right ml-2">View</Link> */}
                                        {/* <span onClick={()=>reSendInvoiceEmail(this,props.original.id)} className="short_buttons_01 pull-right ml-2">Resend Email</span>
                                        {(props.original.fund_type!=null && props.original.fund_type!=undefined && props.original.fund_type!='' &&!_.includes(_.toLower(props.original.fund_type),['ndis']) && props.original.status==0)? <span onClick={()=>this.openInvoiceStatusModal(props.original.invoice_status,props.original.id)} className="short_buttons_01 pull-right ml-2">Update Status</span>:<React.Fragment/>} */}
                                    </div>}
                            />

                        </div>
                        {<div className="d-flex justify-content-between mt-3 pull-right">
                            {/* <a className="btn B_tn" href="#">Mark Selected As Complete</a> */}
                            <button className="btn B_tn mr-3" onClick={this.submitExport}>Export All to CSV</button>
                            <a className="btn B_tn" href={ROUTER_PATH + 'admin/finance/import_ndis_status'}>Import NDIS Status</a>
                        </div>}
                    </div>

                </div>


            </React.Fragment >
        );
    }

}
const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(NDISBilling);