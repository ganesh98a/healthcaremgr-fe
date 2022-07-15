import React, { Component } from 'react';
import ReactTable from 'react-table';
import { postData, reFreashReactTable, archiveALL, handleChangeChkboxInput, toastMessageShow,handleDateChangeRaw } from 'service/common.js';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "../../../../service/Pagination.js";
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { CURRENCY_SYMBOL } from 'config.js';
import moment from 'moment-timezone';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('finance/FinancePayrate/get_payrate_list', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count),
                all_count: result.all_count,
            };
            resolve(res);
        });
    });
};

class PayratesDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeCol: '',
            payRateData: [],
            filter_by: '',
            search_key: 'default',
            filtered: []
        }
        this.reactTable = React.createRef();
    }

    fetchPayRateList = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
        ).then(res => {
            this.setState({
                payRateData: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    archive(payRateId) {
        archiveALL({ id: payRateId }, 'Are you sure you would like to Archive this pay rate? Selecting \'Yes’\ will set the end date of the pay rate to the next day?', 'finance/FinancePayrate/archive_payrate').then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchPayRateList');
            } else {
                toastMessageShow(result.msg, 'w')
            }
        })
    }

    searchData = (e) => {
        e.preventDefault();
        var requestData = { srch_box: this.state.srch_box, search_key: this.state.search_key };
        this.setState({ filtered: requestData }, () => {/*  console.log(this.state.filtered) */ });
    }

    render() {

        const columns = [
            {
                accessor: "category",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Category</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                accessor: "payrate_name",
                //sortable: false,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Rate Name</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                accessor: "hourlyrate",
                headerClassName: '_align_c__ header_cnter_tabl',
                sortable: false,
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Hourly Rate</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{(props.original.payrateDetail.length > 0) ? CURRENCY_SYMBOL + props.original.payrateDetail[0]['dollar_value'] : ''}</span>
            },
            {
                accessor: "start_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Start Date</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                accessor: "end_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">End Date</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },

            {
                //accessor: "status",
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
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
                            <span className={props.original.color_class}>
                                {props.original.status_title}
                            </span>
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

        var selectOpt = [
            { value: 'default', label: 'Default' },
            { value: 'rate_name', label: 'Rate Name' },
            { value: 'hourly_rate', label: 'Hourly Rate Pay' },
            /*{ value: 'start_date', label: 'Start Date' },
            { value: 'end_date', label: 'End Date' },*/
            { value: 'status', label: 'Status (Active/Inactive/Archived)' },
            { value: 'category', label: 'Category' },
            { value: 'type', label: 'Type (Full Time, Part Time, Casual)' },
        ];

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">
                        <div className=" py-4">
                            <span className="back_arrow">
                                <a onClick={this.props.history.goBack}><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>

                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-9">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>
                                <div className="col-lg-3 d-flex align-self-center">
                                    <Link to='./create_payrate' className="C_NeW_BtN w-100"><span>Create New Payrate</span><i className="icon icon icon-add-icons"></i></Link>
                                </div>
                            </div>
                        </div>

                        <div className="bb-1 mb-4">
                            <div className="row sort_row1-- after_before_remove">
                                <div className="col-lg-6 col-md-8 col-sm-8 ">
                                    <form id="srch_" autoComplete="off" onSubmit={this.searchData} method="post">
                                        <div className="search_bar right srchInp_sm actionSrch_st">
                                            <input type="text" className="srch-inp" placeholder="Search.." name="srch_box" onChange={(e) => handleChangeChkboxInput(this, e)} /><i className="icon icon-search2-ie" onClick={this.searchData}></i>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-4 ">
                                    <div className="sLT_gray left left-aRRow">

                                        <Select
                                            name="form-field-name"
                                            value={this.state.search_key}
                                            simpleValue={true}
                                            options={selectOpt}
                                            onChange={(e) => this.setState({ search_key: e })}
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
                                                        onChange={(e) => {
                                                            var requestData = { srch_box: this.state.srch_box, search_key: this.state.search_key, start_date: e, end_date: this.state.filtered.end_date };
                                                            this.setState({ filtered: requestData });
                                                        }}
                                                        placeholderText="00/00/0000"
                                                        selected={this.state.filtered.start_date}
                                                        autoComplete={'off'}
                                                        onChangeRaw={handleDateChangeRaw}
                                                        maxDate={(this.state.filtered.end_date) ? moment(this.state.filtered.end_date) : null} 
                                                        dateFormat="dd-MM-yyyy"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="Fil_ter_ToDo">
                                                <label>To</label>
                                                <span  className={'cust_date_picker right_0_date_piker'}>
                                                    <DatePicker
                                                        onChange={(e) => {
                                                            var requestData = { srch_box: this.state.srch_box, search_key: this.state.search_key, end_date: e, start_date: this.state.filtered.start_date };
                                                            this.setState({ filtered: requestData });
                                                        }}
                                                        placeholderText="00/00/0000"
                                                        selected={this.state.filtered.end_date}
                                                        autoComplete={'off'}
                                                        onChangeRaw={handleDateChangeRaw} 
                                                        minDate={(this.state.filtered.start_date) ? moment(this.state.filtered.start_date) : null}
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

                    <div className="col-lg-12  Payr-Das_Table ">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                manual
                                filtered={this.state.filtered}
                                defaultPageSize={10}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                PaginationComponent={Pagination}
                                minRows={1}
                                data={this.state.payRateData}
                                onFetchData={this.fetchPayRateList}
                                columns={columns}
                                noDataText="No Record Found"
                                ref={this.reactTable}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={true}
                                className="-striped -highlight"
                                noDataText="No Payrate found"
                                SubComponent={(props) =>
                                    <div className="tBL_Sub">

                                        <div className="row d-flex">
                                            <div className="col-md-3 text-center">
                                                <h4><b>{props.original.title}</b></h4>
                                            </div>
                                            <div className="col-md-4">
                                                <ul className="L-I-P_list">
                                                    {(props.original.payrateDetail).length > 0 ?
                                                        props.original.payrateDetail.map((value, idx) => (
                                                            <li className="w-100" key={idx}>
                                                                <span className="text-center"><b>{value.name}</b></span>
                                                                <span className="align-self-center text-center">${value.dollar_value}</span>
                                                            </li>
                                                        )) :
                                                        ''
                                                    }
                                                </ul>
                                            </div>
                                            <div className="col-md-5 align-self-end text-right">

                                            {(props.original.is_edit && props.original.is_edit == 1) ?
                                                <span>
                                                    <Link to={'/admin/finance/edit_payrate/' + props.original.id} className="short_buttons_01 mr-2">Edit</Link>
                                                    {(props.original.archive && props.original.archive == 1) ?
                                                    <a className="short_buttons_01" onClick={(e) => this.archive(props.original.id)}>Archive</a>:''}
                                                </span>
                                            : ''}

                                                
                                            </div>
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
export default connect(mapStateToProps, mapDispatchtoProps)(PayratesDashboard);