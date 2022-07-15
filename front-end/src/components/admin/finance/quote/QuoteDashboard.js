import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "service/Pagination.js";

import CustomChartBar from './../common/CommonBarChart';
import { BrowserRouter as Router, Link, Redirect } from "react-router-dom";
import { connect } from 'react-redux'
import { postData, toastMessageShow, selectFilterOptions, archiveALL, reFreashReactTable } from 'service/common.js';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ROUTER_PATH, PAGINATION_SHOW } from 'config.js';
import { colorCodeInvoiceStatus,  defaultSpaceInTable, graphViewType, iconFinanceShiftByTypeValue } from 'service/custom_value_data.js';
import _ from 'lodash';

const getOptionParticipantOrganization = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData('finance/FinanceQuoteManagement/get_participant_organization_name', { search: e }).then((res) => {
        if (res.status) {
            return { options: res.data };
        }
    });
}

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {

        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceQuoteManagement/get_quote_listing', Request).then((result) => {
            if (result.status) {
                const res = { rows: result.data, pages: (result.count) };
                resolve(res);
            }
        });
    });
};

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

                {(this.props.option.type == 2 || this.props.option.type == 4) ?
                    <div className="Select_Search_Type_">
                        <div className="text_set">{this.props.children}</div>
                        {/*<span className={"Default_icon " + ((this.props.option.type == 2) ? "Participant_icon" : "Org_icon")}>*/}
                        <span className={(this.props.option.type !='' && iconFinanceShiftByTypeValue.hasOwnProperty(_.toLower(this.props.option.type)) ? iconFinanceShiftByTypeValue[_.toLower(this.props.option.type)] :'')}>
                        <i className="icon"></i></span>
                    </div> :

                    <div className="Select_Search_Type_ mt-5">
                        <div className="text_set">Create New Enquiry</div>
                        <span className="Default_icon"><i className="icon icon icon-add2-ie"></i></span>
                    </div>}
            </div>
        );
    }
});

class QuoteDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            quoteList: [],
            filtered: [],
            filter_by: 'all',
            genrated_quote: { labels: ['Total', 'Participant', 'Organisation'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#464765 ', '#707188', '#c1c1c9'] }] },
            accepted_quote: { labels: ['Total', 'Participant', 'Organisation'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#464765 ', '#707188', '#c1c1c9'] }] },
            average_time: { labels: ['Total', 'Participant', 'Organisation'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#464765 ', '#707188', '#c1c1c9'] }] },
            dashboard_active_keys: { genrated_quote: 'week', accepted_quote: 'week', average_time: 'week' }
        }

        this.reactTable = React.createRef();
    }

    searchOnChange = (e) => {
        this.setState({ selectedUserType: e.type, selectedUserId: e.value });
    }

    fetchData = (state) => {

        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                quoteList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    getQuoteStatus = (status) => {
        switch (status) {
            case '1':
                return <span className="short_buttons_01 btn_color_unavailable" >Sent</span>
                break;
            case '2':
                return <span className="short_buttons_01 btn_color_avaiable" >Sent & Read</span>
                break;
            case '3':
                return <span className="short_buttons_01 btn_color_avaiable" >Accepted</span>
                break;
            case '4':
                return <span className="short_buttons_01 btn_color_archive" >Not Accepted</span>
                break;
            case '5':
                return <span className="short_buttons_01 btn_color_ndis" >Draft</span>
                break;
            case '6':
                return <span className="short_buttons_01 btn_color_ihcyf" >Error Sending</span>
                break;
            default:
                return <span className="short_buttons_01 btn_color_assigned" >Archived</span>
        }
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

    acceptRejectQuote = (quoteId, action) => {
        var Request = { quoteId: quoteId, action: action }

        archiveALL(Request, "Are you sure want to " + action + " this quote?", 'finance/FinanceQuoteManagement/accept_or_reject_quote').then((result) => {
            if (result.status) {
                var mess = ((action == "accept") ? "accepted" : ((action == "archive")? "archived": "Rejected"));
                toastMessageShow("Quote "+mess+" successfully", "s")
                reFreashReactTable(this, 'fetchData');
                 this.getQuoteDashboardGraph({ type: 'all', duration_type: 'week' });
            }
        });
    }

    resendQuoteMail = (quoteId) => {
        archiveALL({ quoteId: quoteId }, "Are you sure want to resend mail?", 'finance/FinanceQuoteManagement/resend_quote_mail').then((result) => {
            if (result.status) {
                toastMessageShow("Mail send successfully.", "s")
                reFreashReactTable(this, 'fetchData');
            }
        });
    }

    componentDidMount() {
        this.getQuoteDashboardGraph({ type: 'all', duration_type: 'week' });
    }

    getQuoteDashboardGraph = (req) => {
        return postData('finance/FinanceQuoteManagement/get_quote_dashboard_graph', req).then((res) => {
            if (res.status) {
                var dashboard_active_keys = this.state.dashboard_active_keys;
                var activeState = {}
                if (res.data.genrated_quote) {
                    activeState['genrated_quote'] = req.duration_type;
                    this.setState({ genrated_quote: { labels: ['Total', 'Participant', 'Organisation'], datasets: [{ data: res.data.genrated_quote, backgroundColor: ['#464765 ', '#707188', '#c1c1c9'] }] } });
                }
                if (res.data.accepted_quote) {
                    activeState['accepted_quote'] = req.duration_type;
                    this.setState({ accepted_quote: { labels: ['Total', 'Participant', 'Organisation'], datasets: [{ data: res.data.accepted_quote, backgroundColor: ['#464765 ', '#707188', '#c1c1c9'] }] } });
                }
                if (res.data.average_time) {
                    activeState['average_time'] = req.duration_type;
                    this.setState({ average_time: { labels: ['Total', 'Participant', 'Organisation'], datasets: [{ data: res.data.average_time, backgroundColor: ['#464765 ', '#707188', '#c1c1c9'] }] } });
                }
                var x = { ...dashboard_active_keys, ...activeState }
                this.setState({ dashboard_active_keys: x })
            }
        });
    }

    NavLinkchart = (specific_key) => {
        return [{ label: 'Week', class: (this.state.dashboard_active_keys[specific_key] == 'week' ? "active" : ""), clickEvent: () => this.getQuoteDashboardGraph({ type: specific_key, duration_type: "week" }) },
        { label: 'Month', class: (this.state.dashboard_active_keys[specific_key] == 'month' ? "active" : ""), clickEvent: () => this.getQuoteDashboardGraph({ type: specific_key, duration_type: "month" }) },
        { label: 'Year', class: (this.state.dashboard_active_keys[specific_key] == 'year' ? "active" : ""), clickEvent: () => this.getQuoteDashboardGraph({ type: specific_key, duration_type: "year" }) },
        ]
    }

    render() {

        var selectOpt = [
            { value: 'all', label: 'All' },
            { value: 'quote_number', label: 'Quote Number' },
            { value: 'quote_for', label: 'Quote For' },
            { value: 'amount', label: 'Amount' },
            { value: 'funding_type', label: 'Funding Type' },
            { value: 'created_by', label: 'Quote By' },
            { value: 'quote_note', label: 'Quote Note' },
            { value: 'status_name', label: 'Status'},
        ];

        const columns = [{
            accessor: "quote_number",
            headerClassName: 'Th_class_d1 header_cnter_tabl checkbox_header',
            className: 'Tb_class_d1 Tb_class_d2',
            Cell: (props) => <span>{props.value}</span>,
            Header: x => <div><div className="ellipsis_line__">Quote Number</div></div>,
            resizable: false, width: 230
        },
        {
            accessor: "user_type",
            headerClassName: 'Th_class_d1 header_cnter_tabl',
            Header: x => <div><div className="ellipsis_line__">Quote For</div></div>,
            className: 'Tb_class_d1 Tb_class_d2 ',
            Cell: props =>  <span className={(props.value !='' && iconFinanceShiftByTypeValue.hasOwnProperty(_.toLower(props.value)) ? iconFinanceShiftByTypeValue[_.toLower(props.value)] :'')+' '+ ((props.original.booked_gender !='' ? props.original.booked_gender :''))}><i className="icon"></i>
                <div>{props.original.quote_for}</div>
            </span>
        },
        {
            accessor: "amount",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () => <div><div className="ellipsis_line__">Amount</div></div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            accessor: "funding_type",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () => <div><div className="ellipsis_line__">Funding Type</div></div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            accessor: "quote_date",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Quote Date</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{moment(props.value).format('DD/MM/YYYY')}</span>
        },
        {
            accessor: "created_by",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Quoted By</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            headerClassName: '_align_c__ header_cnter_tabl',
            className: '_align_c__',
            width: 160,
            resizable: false,
            headerStyle: { border: "0px solid #fff" },
            expander: true,
            Header: () => <div><div className="ellipsis_line__">Status</div></div>,
            Expander: (props) =>
                <div className="expander_bind">
                    <div className="d-flex w-100 justify-content-center align-item-center">
                        {this.getQuoteStatus(props.original.status)}
                    </div>

                    {props.isExpanded
                        ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                        : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                </div>,
            style: { cursor: "pointer", fontSize: 25, padding: "0", textAlign: "center", userSelect: "none" }

        }
        ]

        const lablechart = [
            { label: 'Total', extarClass: 'drk-color4' },
            { label: 'Participant', extarClass: 'drk-color2' },
            { label: 'Org', extarClass: 'drk-color3' },
        ];

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">
                        {this.state.selectedUserId ?
                            <Redirect to={'/admin/finance/quote/create/' + this.state.selectedUserType + '/' + this.state.selectedUserId} /> : ''}
                        <div className=" py-4">
                            <span className="back_arrow">
                                <a href=""></a>
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">

                                <div className="col-lg-6 align-self-center">
                                    <div className="h-h1 color ">{this.props.showPageTitle}</div>
                                </div>
                                <div className="col-lg-3 d-flex align-self-center">

                                </div>
                                <div className="col-lg-3 d-flex align-self-center">
                                    {!this.state.createQuoteEnable ?
                                        <a onClick={() => this.setState({ createQuoteEnable: true })} className="C_NeW_BtN w-100">
                                            <span>Create New Quote</span><i className="icon icon icon-add-icons"></i>
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



                <div className="row" style={{ paddingTop: '15px' }}>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <CustomChartBar barTitle={'Amount of Quotes Generated'} barData={this.state.genrated_quote} labelShowData={lablechart} navbarShowData={this.NavLinkchart('genrated_quote')} />
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <CustomChartBar barTitle={'Quote Acceptance'} barData={this.state.accepted_quote} labelShowData={lablechart} navbarShowData={this.NavLinkchart('accepted_quote')} />
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <CustomChartBar barTitle={'Average Time to Accept Quote'} barData={this.state.average_time} labelShowData={lablechart} navbarShowData={this.NavLinkchart('average_time')} />
                    </div>
                </div>


                <div className="by-1 mb-4">
                    <div className="row sort_row1-- after_before_remove">
                        <div className="col-lg-6 col-md-8 col-sm-4 ">
                            <form method="post" onSubmit={this.submitSearch}>
                                <div className="search_bar right srchInp_sm actionSrch_st">
                                    <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                    <i onClick={this.submitSearch} className="icon icon-search2-ie"></i>
                                </div>
                            </form>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-3 ">
                            <div className="sLT_gray left left-aRRow">
                                <Select
                                    simpleValue={true}
                                    name="form-field-name"
                                    value={this.state.filter_by}
                                    options={selectOpt}
                                    onChange={(value) => this.submitSearch('', 'filter_by', value, true)}
                                    clearable={false}
                                    searchable={false}
                                />
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-5">
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

                    <div className="col-lg-12 Quot-Home_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                showPagination={this.state.quoteList.length > PAGINATION_SHOW ? true : false}
                                ref={this.reactTable}
                                columns={columns}
                                manual
                                data={this.state.quoteList}
                                filtered={this.state.filtered}
                                pages={this.state.pages}
                                previousText={<span className="icon icon-arrow-left privious" ></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                noDataText="No quote found"
                                defaultPageSize={10}
                                className="-striped -highlight"
                                minRows={2}
                                collapseOnDataChange={false}
                                SubComponent={(props) =>
                                    <div className="tBL_Sub">
                                        <div className="tBL_des">{props.original.quote_note}</div>
                                        <Link to={"/admin/finance/quote/edit/" + props.original.id} disabled={props.original.status == 8 || props.original.status == 4 || props.original.status == 3 ? true : false} className="short_buttons_01 pull-right btn_color_assigned ml-2">Edit</Link>
                                        <button disabled={props.original.status == 1 || props.original.status == 5 || props.original.status == 6 || props.original.status == 4 ? false : true} onClick={() => this.acceptRejectQuote(props.original.id, "archive")} className="short_buttons_01 pull-right btn_color_archive  ml-2">Archive</button>
                                        <button disabled={props.original.status == 1 || props.original.status == 3 || props.original.status == 5 || props.original.status == 6 ? false : true} onClick={() => this.resendQuoteMail(props.original.id)} className="short_buttons_01 pull-right btn_color_unavailable  ml-2">{props.original.status == 5 ? "Send" : "Resend"}</button>
                                        <button disabled={props.original.status == 1 ? false : true} onClick={() => this.acceptRejectQuote(props.original.id, "accept")} className="short_buttons_01 pull-right  btn_color_avaiable ml-2">Accept</button>
                                        <button disabled={props.original.status == 1 ? false : true} onClick={() => this.acceptRejectQuote(props.original.id, "reject")} className="short_buttons_01 pull-right  ml-2">Reject</button>
                                        <Link to={"/admin/finance/quote/view/" + props.original.id} className="short_buttons_01 pull-right btn_color_assigned ml-2">View</Link>
                                    </div>}
                            />
                        </div>
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


export default connect(mapStateToProps, mapDispatchtoProps)(QuoteDashboard);