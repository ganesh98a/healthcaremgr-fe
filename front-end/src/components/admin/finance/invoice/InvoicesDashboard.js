import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "service/Pagination.js";
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import CustomChartBar from '../common/CommonBarChart';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { postData, selectFilterOptions, toastMessageShow, archiveALL, reFreashReactTable, currencyFormatUpdate, downloadFile /*,handleShareholderNameChange*/ } from 'service/common.js';
import PropTypes from 'prop-types';
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import _ from 'lodash';
import { colorCodeInvoiceStatus, iconFinanceShift, defaultSpaceInTable, graphViewType, iconFinanceShiftByTypeValue } from 'service/custom_value_data.js';
import { reSendInvoiceEmail, updateInvoiceStatus, requestInvoiceData as requestData } from '../action/FinanceAction.js';
import UpdateInvoiceStatusModal from './UpdateInvoiceStatusModal.js';
import { InvoiceListFilterStatusDropdown } from 'dropdown/FinanceDropdown.js';
import { PAGINATION_SHOW, CURRENCY_SYMBOL, BASE_URL } from 'config.js';

const getOptionParticipantOrganization = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData('finance/FinanceInvoice/get_participant_organization_name', { search: e }).then((res) => {
        if (res.status) {
            return { options: res.data };
        }
    });
}

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {
        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>
                <div className="Select_Search_Type_">
                    <div className="text_set">{this.props.children}</div>
                    <span className={"Default_icon " + (this.props.option.type != '' && iconFinanceShiftByTypeValue.hasOwnProperty(_.toLower(this.props.option.type)) ? iconFinanceShiftByTypeValue[_.toLower(this.props.option.type)] : '') + ' ' + ((this.props.option.booked_gender != '' ? this.props.option.booked_gender : ''))}><i className="icon"></i></span>
                </div>
            </div>
        );
    }
});

//
const graphModeTypeData = ['invoice_income', 'loss_credit_note'/* ,'loss_of_refund' */];
class InvoicesDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.init = {
            invoiceStatus: '',
            invoicePreStatus: '',
            invoiceId: ''
        };
        let intGrphData = {};
        _.forEach(graphModeTypeData, function (el, index) {
            intGrphData[el + '_loading'] = false;
            intGrphData[el + '_data'] = [];
            intGrphData[el + '_type'] = 'week';
        });
        this.state = {
            activeCol: '',
            filter_by: 'all',
            invoiceList: [],
            invoiceStatusModel: false,
            graphType: graphViewType,
            details: {
                invoiceStatus: '',
                invoicePreStatus: '',
                invoiceId: ''
            },
            ...intGrphData
        }
        this.reactTable = React.createRef();
    }

    searchOnChange = (e) => {
        this.setState({ selectedUserType: e.type, selectedUserId: e.value });
    }

    fetchInvoiceList = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            0
        ).then(res => {
            this.setState({
                invoiceList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    getGraphResult = (graphModeType, graphType) => {
        this.setState({ [graphModeType + '_type']: graphType }, () => {
            this.fetchGraphData(graphModeType, graphType);
        })
    }

    fetchGraphData = (graphModeType, graphType) => {
        let modeType = _.includes(graphModeTypeData, graphModeType) ? graphModeType : '';
        let viewType = _.includes(_.map(this.state.graphType, 'name'), graphType) ? graphType : 'week';
        if (modeType == '') {
            toastMessageShow('Invalid Request.', 'e');
        } else {
            this.setState({ [modeType + '_loading']: true }, () => {
                let requestData = {
                    mode: modeType,
                    type: viewType
                };
                postData('finance/FinanceInvoice/get_dashboard_graph_count', requestData).then((result) => {
                    if (result.status) {
                        this.setState({ [modeType + '_data']: result.data });
                    } else {
                        //this.setState({chartData:dummyData});
                    }
                    this.setState({ [modeType + '_loading']: false });
                });
            });
        }
    }

    componentWillMount() {
        this.fetchGraphData(graphModeTypeData[0], this.state[graphModeTypeData[0] + '_type']);
        this.fetchGraphData(graphModeTypeData[1], this.state[graphModeTypeData[1] + '_type']);
        //this.fetchGraphData(graphModeTypeData[2],this.state[graphModeTypeData[2]+'_type']);
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
        let req = { search: this.state.search, filter_by: this.state.filter_by, start_date: this.state.start_date, end_date: this.state.end_date };
        this.setState({ filtered: req })
    }

    openInvoiceStatusModal = (status, invoiceId) => {
        let statusLowercase = _.toLower(status);
        this.setState({ invoiceStatusModel: true, details: { ...this.state.details, invoiceStatus: statusLowercase, invoicePreStatus: statusLowercase, invoiceId: invoiceId } });
    }

    closeUpdateStatusModel = (status) => {
        this.setState({ invoiceStatusModel: false, details: this.init }, () => { if (status == true) { reFreashReactTable(this, 'fetchInvoiceList'); } });
    }

    updateStatusData = (status) => {
        this.setState({ details: { ...this.state.details, invoiceStatus: status } }, () => console.log('asas', this.state))
    }

    updateInvoiceStatus = (status, invoiceId) => {
        updateInvoiceStatus(this, { invoiceId: invoiceId, status: status, invoicePreStatus: this.state.details.invoicePreStatus });
    }
    
    exportCSV = () => {
        var ReactOption = this.reactTable.current.state;
        var state = {sorted: ReactOption.sorted, filtered: ReactOption.filtered };
        postData('finance/FinanceInvoice/export_invoice_to_csv', state).then((result) => {
            if (result.status) {
                downloadFile(BASE_URL + 'mediaDownload/' + result.filename);// 'mediaDownload/1573795509_line__item_report.csv');
            } else {
                 
            }
        });
    }


    render() {

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
                className: 'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span className={(props.original.invoice_for_booked != '' && iconFinanceShift.hasOwnProperty(_.toLower(props.original.invoice_for_booked)) ? iconFinanceShift[_.toLower(props.original.invoice_for_booked)] : '') + ' ' + ((props.original.booked_gender != '' ? props.original.booked_gender : ''))}>
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
                        <div className="ellipsis_line__">Amount (Incl GST)</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(currencyFormatUpdate(props.value, CURRENCY_SYMBOL))}</span>
            },
            {
                id: "fund_type",
                accessor: "fund_type",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Fund Type</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
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
                            <span className={'short_buttons_01 ' + (colorCodeInvoiceStatus[_.toLower(props.original.invoice_status)] ? colorCodeInvoiceStatus[_.toLower(props.original.invoice_status)] : '')}>{props.original.invoice_status}</span>
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

        ]

        const invoiceIncomeData = {
            labels: ['', '', ''],
            datasets: [{
                data: this.state[graphModeTypeData[0] + '_data'],
                backgroundColor: ['#464765 ', '#707188', '#c1c1c9'],

            }],
        };
        const lossCreditNotesData = {
            labels: ['', '', ''],
            datasets: [{
                data: this.state[graphModeTypeData[1] + '_data'],
                backgroundColor: ['#464765 ', '#707188', '#c1c1c9'],

            }],
        };
        /* const lossOfRefundData = {
            labels: ['', '', ''],
            datasets: [{
                data: this.state[graphModeTypeData[2]+'_data'],
                backgroundColor: ['#464765 ', '#707188', '#c1c1c9'],

            }],
        }; */

        const lablechart = [
            { label: 'Total', extarClass: 'drk-color4', extraStyle: { color: '#464765' } },
            { label: 'Participant', extarClass: 'drk-color2', extraStyle: { color: '#707188' } },
            { label: 'Org', extarClass: 'drk-color3', extraStyle: { color: '#c1c1c9' } },
        ];


        const NavLinkchartIncomeQueries = graphViewType.length > 0 ? graphViewType.map((row, index) => {
            return { label: _.capitalize(row.name), clickEvent: () => this.getGraphResult(graphModeTypeData[0], _.toLower(row.name)), class: this.state[graphModeTypeData[0] + '_type'] == _.toLower(row.name) ? 'active' : '' };
        }) : [];

        const NavLinkchartLossCreditQueries = graphViewType.length > 0 ? graphViewType.map((row, index) => {
            return { label: _.capitalize(row.name), clickEvent: () => this.getGraphResult(graphModeTypeData[1], _.toLower(row.name)), class: this.state[graphModeTypeData[1] + '_type'] == _.toLower(row.name) ? 'active' : '' };
        }) : [];

        /*  const NavLinkchartLossRefundQueries= graphViewType.length>0? graphViewType.map((row,index)=>{
             return {label:_.capitalize(row.name),clickEvent:()=>this.getGraphResult(graphModeTypeData[2],_.toLower(row.name)),class:this.state[graphModeTypeData[2]+'_type'] == _.toLower(row.name) ? 'active' : ''};
         }):[]; */

        function logChange(val) {
            //console.log("Selected: " + val);
        }
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">
                        {this.state.selectedUserId ?
                            <Redirect to={'/admin/finance/CreateManualInvoice/' + this.state.selectedUserType + '/' + this.state.selectedUserId} /> : ''}

                        <div className=" py-4">
                            <span className="back_arrow">
                                {/* <a href="/admin/crm/participantadmin"><span className="icon icon-back1-ie"></span></a> */}
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">

                                <div className="col-lg-6 align-self-center">
                                    <div className="h-h1 color ">{this.props.showPageTitle}</div>
                                </div>

                                <div className="col-lg-3 d-flex align-self-center">
                                    <a className="C_NeW_BtN w-100" onClick={this.exportCSV}><span>Export to CSV</span><i className="icon icon icon-download2-ie"></i></a>
                                </div>

                                <div className="col-lg-3">
                                    <div className="modify_select align-self-center ">
                                        {!this.state.createQuoteEnable ?
                                            <a onClick={() => this.setState({ createQuoteEnable: true })} className="C_NeW_BtN w-100">
                                                <span>Create Manual Invoice</span><i className="icon icon icon-add-icons"></i>
                                            </a> :
                                            <div className="modify_select align-self-center w-100">
                                                <Select.Async
                                                    cache={false}
                                                    newOptionCreator={({ label: '', labelKey: '', valueKey: '' })}
                                                    name="form-field-name"
                                                    ignoreCase={true}
                                                    matchProp={'any'}
                                                    clearable={false}
                                                    value={this.state.finance}
                                                    filterOptions={selectFilterOptions}
                                                    loadOptions={(e) => getOptionParticipantOrganization(e)}
                                                    placeholder='Search'
                                                    onChange={(e) => this.searchOnChange(e)}
                                                    required={true}
                                                    optionComponent={GravatarOption}
                                                /></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="row" style={{ paddingTop: '15px' }}>
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <CustomChartBar barTitle={'Income From Invoices'} barData={invoiceIncomeData} labelShowData={lablechart} navbarShowData={NavLinkchartIncomeQueries} />
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <CustomChartBar barTitle={'Loss From Credit Notes'} barData={lossCreditNotesData} labelShowData={lablechart} navbarShowData={NavLinkchartLossCreditQueries} />
                    </div>
                    {/*  <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <CustomChartBar barTitle={'Loss From Refunds'} barData={lossOfRefundData} labelShowData={lablechart} navbarShowData={NavLinkchartLossRefundQueries}/> 
                    </div> */}
                </div>


                <div className="by-1 mb-4">
                    <div className="row sort_row1-- after_before_remove">
                        <div className="col-lg-4 col-md-4 col-sm-4 ">
                            <form method="post" onSubmit={this.submitSearch}>
                                <div className="search_bar right srchInp_sm actionSrch_st">
                                    <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                    <i className="icon icon-search2-ie" onClick={this.filterListing}></i>
                                </div>
                            </form>

                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-3 ">
                            <div className="sLT_gray left left-aRRow">
                                <Select
                                    simpleValue={true}
                                    name="form-field-name"
                                    value={this.state.filter_by}
                                    options={InvoiceListFilterStatusDropdown(true)}
                                    onChange={(value) => this.submitSearch('', 'filter_by', value, true)}
                                    clearable={false}
                                    searchable={false}
                                />
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-5 ">
                            <div className="row">
                                <div className="col-sm-6">
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
                                <div className="col-sm-6">
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

                <div className="row">

                    <div className="col-lg-12  Invoic-Das_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
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
                                            {(props.original.invoice_shift_notes) ? <span><p>Invoice Shift Notes:</p>{props.original.invoice_shift_notes}</span> : ''}
                                            {(props.original.line_item_notes) ? <span><p>Invoice Shift Notes:</p>{props.original.line_item_notes}</span> : ''}
                                            {(props.original.manual_invoice_notes) ? <span><p>Invoice Shift Notes:</p>{props.original.manual_invoice_notes}</span> : ''}
                                        </div>
                                        <Link to={"/admin/finance/invoice/view/" + props.original.id} className="short_buttons_01 pull-right ml-2">View</Link>
                                        <span onClick={() => reSendInvoiceEmail(this, props.original.id)} className="short_buttons_01 pull-right ml-2">Resend Email</span>
                                        {(props.original.fund_type == null && props.original.status == 0) || ((props.original.fund_type != null && props.original.fund_type != undefined && props.original.fund_type != '' && !_.includes(_.toLower(props.original.fund_type), ['ndis']) && props.original.status == 0)) ? <span onClick={() => this.openInvoiceStatusModal(props.original.invoice_status, props.original.id)} className="short_buttons_01 pull-right ml-2">Update Status</span> : <React.Fragment />}
                                    </div>}
                            />
                        </div>
                        {/* <div className="d-flex justify-content-between mt-3">
                            <a className="btn B_tn" href="#">Mark Selected As Complete</a>
                            <a className="btn B_tn" href="#">View all Taks</a>
                        </div> */}
                    </div>
                </div>

                {/*<div className="row">
                    <div className="col-lg-3 pull-right">
                    <a className="C_NeW_BtN w-100"><span>Approved Selected</span><i className="icon icon icon-check"></i></a>
                    </div>
                </div>*/}
                {this.state.invoiceStatusModel ? <UpdateInvoiceStatusModal show={this.state.invoiceStatusModel} close={this.closeUpdateStatusModel} updateStatusData={this.updateStatusData} details={this.state.details} updateInvoiceStatus={this.updateInvoiceStatus} /> : <React.Fragment />}
            </React.Fragment >
        );
    }
}


const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispatch) => {
    return {
    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(InvoicesDashboard);