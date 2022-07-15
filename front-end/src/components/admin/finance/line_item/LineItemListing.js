import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "service/Pagination.js";
import moment from "moment";
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { postData, archiveALL, reFreashReactTable, toastMessageShow, downloadFile } from 'service/common.js';
import { PAGINATION_SHOW, BASE_URL } from 'config.js';
import { LineItemListingFilterStatusDropdown, LineItemListingFilterExportStatusDropdown } from 'dropdown/FinanceDropdown.js';

import CreateNewLineItem from './CreateNewLineItem.js';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {

        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceLineItem/get_finance_line_item_listing', Request).then((result) => {
            if (result.status) {
                const res = { rows: result.data, pages: (result.count) };
                resolve(res);
            }
        });
    });
};

class LineItemListing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lineItems: [],
            filter_by_status: 'all',
            filter_by_state: 'all',
            filter_by_funding_type: 'all',
            search: '',
        }

        this.reactTable = React.createRef();
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
                lineItems: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    submitSearch = (e, key, value) => {
        if (e)
            e.preventDefault();

        var state = {};
        state[key] = value;

        this.setState(state, () => {
            var req = { search: this.state.search, filter_by_state: this.state.filter_by_state, filter_by_status: this.state.filter_by_status, filter_by_funding_type: this.state.filter_by_funding_type, start_date: this.state.start_date, end_date: this.state.end_date };
            this.setState({ filtered: req })
        })
    }
    submitExport = (e, key, value) => {
        if (e)
            e.preventDefault();

        var state = {};
        state[key] = value;
        this.setState(state)
        var Request = { exportType: value };
        postData('finance/FinanceImportExportLineItem/get_csv_line_item', Request).then((result) => {
            if (result.status) {
                downloadFile(BASE_URL + 'mediaDownload/' + result.filename);// 'mediaDownload/1573795509_line__item_report.csv');
            }
        })

    }
    //   this, value, 'filter_export_status')
    getFilterOption = () => {
        postData('finance/FinanceLineItem/get_finance_line_item_listing_filter_option', {}).then((result) => {
            if (result.status) {
                var res = result.data;

                this.setState({ funding_type_option: [{ label: 'All Funding type', value: 'all' }, ...res.funding_type_option] });
                this.setState({ state_option: [{ label: 'All States', value: 'all' }, ...res.state_option] });
            }
        });
    }

    componentDidMount() {
        this.getFilterOption();
    }

    archiveLineItem = (lineItemId) => {
        var extraParams = [];
        extraParams['confirm_button_position'] = 'right';

        extraParams['confirm'] = 'Yes';
        extraParams['cancel'] = 'No';
        extraParams['heading_title'] = 'Archive Line Item';

        var status = 0;
        var msg = "Are you sure you would like to Archive this line item? Selecting 'Yes' will set the end date of the line item to the next day?"


        var req = { lineItemId: lineItemId };
        archiveALL(req, msg, 'finance/FinanceLineItem/archive_line_item', extraParams).then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchData');
                toastMessageShow('Archive successfully', 's');
            } else {
                toastMessageShow(result.error, 'e');
            }
        });
    }

    parseLineItemUnit(val) {
        for (const prop in CreateNewLineItem.EUnitTypes) {
            const item = CreateNewLineItem.EUnitTypes[prop]
            if (item.value == val) 
                return item.label;
        }           

        return '';
    }

    render() {
        const columns = [
            {
                accessor: "category_ref",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () => <div><div className="ellipsis_line__">Category Ref</div></div>,
                className: '_align_c__',
                Cell: props => <span><div><div className="ellipsis_line__" style={{whiteSpace: "pre-wrap"}}>{props.value ? props.value : ' '}</div></div></span>
            },
            {
                accessor: "line_item_number",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () => <div><div className="ellipsis_line__">Line Item Number</div></div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                accessor: "line_item_name",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () => <div><div className="ellipsis_line__">Line Item Name</div></div>,
                className: '_align_c__',
                Cell: props => <span><div><div className="ellipsis_line__">{props.value}</div></div></span>
            },
            {
                accessor: "start_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () => <div><div className="ellipsis_line__">Start Date</div> </div>,
                className: '_align_c__',
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{(value)}</span>
                    )
                }
            },
            {
                accessor: "end_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () => <div><div className="ellipsis_line__">End Date</div></div>,
                className: '_align_c__',
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{(value)}</span>
                    )
                }
            },
            {
                accessor: "upper_price_limit",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () => <div><div className="ellipsis_line__">Upper Price Limit (National Non Remote)</div></div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                accessor: "funding_type",
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                width: 160,
                resizable: false,
                headerStyle: { border: "0px solid #fff" },
                expander: true,
                Header: () => <div><div className="ellipsis_line__">Funding Type</div></div>,
                Expander: (props) =>
                    <div className="expander_bind">
                        <div className="d-flex w-100 justify-content-center align-item-center">
                            <span className="">{props.original.funding_type}</span>
                        </div>
                        {props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                    </div>,
                style: {
                    cursor: "pointer",
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }

            }

        ]

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">

                        <div className=" py-4">
                            <span className="back_arrow invisible">
                                <a href="/admin/crm/participantadmin"><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>

                        <div className="by-1">
                            <div className="row d-flex flex-wrap  py-4">
                                <div className="col-lg-6 col-md-3 col-xs-12">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>

                                <div className="col-lg-2 col-md-3 col-sm-4 col-xs-12 pt-xs-3 d-flex align-self-center ">
                                    <div className="sLT_gray left left-aRRow w-100">

                                        {!this.state.createLineItemEnable ?
                                            <a onClick={() => this.setState({ createLineItemEnable: true })} className="C_NeW_BtN w-100">
                                                <span>Export CSV File</span><i className="icon icon icon-download2-ie"></i>
                                            </a> :
                                            <div className="modify_select align-self-center w-100">
                                                <Select name="form-field-name"
                                                    simpleValue={true}
                                                    options={LineItemListingFilterExportStatusDropdown()}
                                                    value={this.state.filter_export_status || ''}
                                                    //onChange={(value) => handleChangeSelectDatepicker(this, value, 'filter_export_status')}
                                                    //onChange={(e) => this.submitExport(e, value, 'filter_export_status')}
                                                    onChange={(value) => this.submitExport('', 'filter_export_status', value)}
                                                    clearable={false}
                                                    searchable={false}
                                                /></div>}
                                    </div></div>

                                <div className="col-lg-2 col-md-3  col-sm-4 col-xs-12 pt-xs-3 d-flex align-self-center">
                                    <Link to={'/admin/finance/line_item/import'} className="C_NeW_BtN w-100"><span>Import CSV File</span><i className="icon icon icon-download2-ie"></i></Link>
                                </div>
                                <div className="col-lg-2 col-md-3 col-sm-4 col-xs-12 pt-xs-3 d-flex align-self-center">
                                    <Link to={'/admin/finance/line_item/create'} className="C_NeW_BtN w-100"><span>Add New Line Item</span><i className="icon icon icon-add-icons"></i></Link>
                                </div>
                            </div>
                        </div>

                        <div className="bb-1 mb-4">
                            <div className="row sort_row1-- after_before_remove">
                                <div className="col-lg-4 col-md-4 col-sm-4 ">
                                    <form method="post" onSubmit={this.submitSearch}>
                                        <div className="search_bar right srchInp_sm actionSrch_st">
                                            <input type="text" name="search" onChange={(e) => this.setState({ search: e.target.value })} className="srch-inp" placeholder="Search.." value={this.state.search} />
                                            <i onClick={this.submitSearch} className="icon icon-search2-ie"></i>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-lg-3 col-md-3 col-sm-5 pt-xs-3">
                                    <div className="sLT_gray left left-aRRow">
                                        <Select name="form-field-name"
                                            simpleValue={true}
                                            value={this.state.filter_by_funding_type}
                                            options={this.state.funding_type_option}
                                            onChange={(value) => this.submitSearch('', 'filter_by_funding_type', value)}
                                            clearable={false}
                                            searchable={false}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-3 col-sm-5 pt-xs-3">
                                    <div className="sLT_gray left left-aRRow">
                                        <Select name="form-field-name"
                                            simpleValue={true}
                                            value={this.state.filter_by_state}
                                            options={this.state.state_option}
                                            onChange={(value) => this.submitSearch('', 'filter_by_state', value)}
                                            clearable={false}
                                            searchable={false}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-3 col-sm-5 pt-xs-3">
                                    <div className="sLT_gray left left-aRRow">
                                        <Select name="form-field-name"
                                            simpleValue={true}
                                            value={this.state.filter_by_status}
                                            options={LineItemListingFilterStatusDropdown()}
                                            onChange={(value) => this.submitSearch('', 'filter_by_status', value)}
                                            clearable={false}
                                            searchable={false}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-5 pt-xs-3">
                                    <div className="row">
                                        <div className="col-xs-6 pr-0">
                                            <div className="Fil_ter_ToDo">
                                                <label>From</label>
                                                <span className={'cust_date_picker'}>
                                                    <DatePicker
                                                        autoComplete={'off'}
                                                        isClearable={true}
                                                        selected={this.state.start_date}
                                                        onChange={(value) => this.submitSearch('', 'start_date', value)}
                                                        placeholderText="00/00/0000"
                                                        dateFormat="dd-MM-yyyy"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-xs-6">
                                            <div className="Fil_ter_ToDo">
                                                <label>To</label>
                                                <span className={'cust_date_picker right_0_date_piker'}>
                                                    <DatePicker
                                                        autoComplete={'off'}
                                                        selected={this.state.end_date}
                                                        onChange={(value) => this.submitSearch('', 'end_date', value)}
                                                        placeholderText="00/00/0000"
                                                        isClearable={true}
                                                        dateFormat="dd-MM-yyyy"
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
                    <div className=""></div>
                </div>


                <div className="row">
                    <div className="col-lg-12 L-I-P_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                showPagination={this.state.lineItems.length > PAGINATION_SHOW ? true : false}
                                ref={this.reactTable}
                                columns={columns}
                                manual
                                data={this.state.lineItems}
                                filtered={this.state.filtered}
                                defaultFilter={this.state.filtered}
                                pages={this.state.pages}
                                previousText={<span className="icon icon-arrow-left privious" ></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                noDataText="No Line Items found"
                                defaultPageSize={10}
                                className="-striped -highlight"

                                minRows={2}
                                collapseOnDataChange={false}
                                SubComponent={(props) =>
                                    <div className="tBL_Sub">
                                        <div className="tBL_des">{props.original.description}</div>
                                        <div className="row">
                                            <div className="col-lg-5">
                                                <ul className="L-I-P_list">
                                                    <LineItmeSubComponent  width={'210px'} SubComLabel={'Support Registration Group: '}>{props.original.support_registration_group}</LineItmeSubComponent>
                                                    <LineItmeSubComponent  width={'210px'} SubComLabel={'Support Category: '}>{props.original.support_category}</LineItmeSubComponent>
                                                    <LineItmeSubComponent  width={'210px'} SubComLabel={'Support Outcome Domain: '}>{props.original.support_outcome_domain}</LineItmeSubComponent>
                                                </ul>
                                            </div>
                                            <div className="col-lg-3">
                                                <ul className="L-I-P_list">
                                                    <LineItmeSubComponent  width={'110px'} SubComLabel={'Ratio: '}> {props.original.member_ratio}: {props.original.participant_ratio}</LineItmeSubComponent>
                                                    <LineItmeSubComponent  width={'110px'} SubComLabel={'Price Controlled: '}>{props.original.price_control == 1 ? "Yes" : "No"}</LineItmeSubComponent>
                                                    <LineItmeSubComponent  width={'110px'} SubComLabel={'Unit: '}>{ this.parseLineItemUnit(props.original.units) }</LineItmeSubComponent>
                                                    <LineItmeSubComponent  width={'110px'} SubComLabel={'Status: '}> {props.original.status == 1 ? "Active" : (props.original.status == 2 ? "Inactive" : "Archived")}</LineItmeSubComponent>
                                                </ul>
                                            </div>
                                            <div className="col-lg-4">
                                                <ul className="L-I-P_list">
                                                    <LineItmeSubComponent width={'150px'} SubComLabel={'Schedule Constraints: '}>{props.original.schedule_constraint == 1 ? "Yes" : "No"}</LineItmeSubComponent>
                                                    <LineItmeSubComponent width={'150px'} SubComLabel={'National Remote: '}>${props.original.national_price_limit}</LineItmeSubComponent>
                                                    <LineItmeSubComponent width={'150px'} SubComLabel={'National Very Remote: '}>${props.original.national_very_price_limit}</LineItmeSubComponent>
                                                    <LineItmeSubComponent width={'150px'} SubComLabel={'ONCALL provided: '}>{props.original.oncall_provided == 1 ? "Yes" : "No"}</LineItmeSubComponent>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 text-right">
                                                {props.original.status != 3 ? <Link className="short_buttons_01 mr-3" to={"/admin/finance/line_item/edit/" + props.original.id}>Edit</Link> : ''}
                                                {props.original.status == 1 ? <a className="short_buttons_01" onClick={() => this.archiveLineItem(props.original.id)}>Archive</a> : ''} </div>
                                        </div>
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


export default connect(mapStateToProps, mapDispatchtoProps)(LineItemListing);



const LineItmeSubComponent = (props) => {
    return (
        <li className="w-100">
            <span className="text-right" style={{minWidth:props.width}}>
                <b className="pr-1">{props.SubComLabel} </b>
            </span><span className="align-self-start">
                {props.children}
            </span>
        </li>
    )
}