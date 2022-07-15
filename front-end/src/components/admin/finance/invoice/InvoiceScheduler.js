import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "service/Pagination.js";
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { colorCodeFinanceShift, iconFinanceShift } from 'service/custom_value_data.js';
import { ROUTER_PATH, PAGINATION_SHOW } from 'config.js';
import { postData, archiveALL, reFreashReactTable } from 'service/common.js';
import _ from 'lodash';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {

        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceInvoice/invoice_scheduler_list', Request).then((result) => {
            if (result.status) {
                const res = { rows: result.data, pages: (result.count) };
                resolve(res);
            }
        });
    });
};


class InvoiceScheduler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            staffList: [],
            filter_by: 'all',
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
                staffList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    submitSearch = (e, key, value,checkTextBoxValue) => {
        if(e)
        e.preventDefault();

        

        
        var state = {};
        state[key] = value;
        
        this.setState(state, () => {
            if(checkTextBoxValue!=undefined && checkTextBoxValue){
                if((this.state.search && this.state.search.length>0) || (value== this.state.filter_by && this.state.filter_by=='all' && key=='filter_by') ){
                    this.filterListing();
                }
            }else{
                this.filterListing();
            }
        })
    }

    filterListing =()=>{
        let req = {search: this.state.search, filter_by: this.state.filter_by, start_date:this.state.start_date, end_date: this.state.end_date};
            this.setState({filtered: req})
    }

    render() {
        var selectOpt = [
            { value: 'all', label: 'All' },
            { value: 'invoice_for_name', label: 'Name' },
            { value: 'booked_from', label: 'Org Type' },
           // { value: 'invoice_fund_type', label: 'Fund Type' },
            { value: 'invoice_schedule', label: 'Invoice Schedule' },
            { value: 'last_invoice_date', label: 'Last Invoice Sent' }
        ];
        
        const columns = [

            {
                id: "invoice_for_name",
                accessor: "invoice_for_name",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Name</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span className={(props.original.booked_from !='' && iconFinanceShift.hasOwnProperty(_.toLower(props.original.booked_from)) ? iconFinanceShift[_.toLower(props.original.booked_from)] :'') +' '+ ((props.original.booked_gender !='' ? props.original.booked_gender :''))}>
                        <i className="icon"></i>
                        <div><Link to={{
                    state: {
                        inf: props.original.booked_for,
                        ptype: props.original.booked_from,
                        booked_by: props.original.invoice_booked,
                    },
                    pathname:
                      ROUTER_PATH +
                      "admin/finance/invoiceschedulerhistory"
                  }}>
                   {/* {props.value} */}
                   {props.value}</Link></div>
                    </span>
                //Cell: props => <span>{props.value}</span>
            },

            {
                id: "booked_from",
                accessor: "booked_from",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Org Type</div>
                    </div>
                ,
                className: 'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span>
                    {/* <i className="icon icon-userm1-ie"></i>
                    <i className="icon icon-userf1-ie"></i> */}
                    <div>{_.capitalize(props.value)}</div>
                </span>

            },
            /* {
                id: "invoice_fund_type",
                accessor: "invoice_fund_type",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Fund Type</div>
                    </div>
                ,
                className: 'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span>
                    <div>{props.value}</div>
                </span>

            }, */
            {
                id: "invoice_schedule",
                accessor: "invoice_schedule",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Invoice Schedule</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                // Header: "Fund Type",
                id: "last_invoice_date",
                accessor: "last_invoice_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Last Invoice Sent</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            }

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
                            <a href={ROUTER_PATH+"admin/finance/InvoicesDashboard"}><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-9">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>
                                {/* <div className="col-lg-3 d-flex align-self-center">
                                    <Link to='./CreateInvoiceNewScheduler' className="C_NeW_BtN w-100"><span>Create New Scheduler</span><i className="icon icon icon-add-icons"></i></Link>
                                </div> */}
                            </div>
                        </div>

                        <div className="bb-1 mb-4">
                            <div className="row sort_row1-- after_before_remove">
                                <div className="col-lg-6 col-md-8 col-sm-8 col-xs-12">
                                <form method="post" onSubmit={this.submitSearch}>
                                    <div className="search_bar right srchInp_sm actionSrch_st">
                                        <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({search: e.target.value})} value={this.state.search} />
                                        <i className="icon icon-search2-ie" onClick={this.filterListing}></i>
                                    </div>
                                </form>
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-4 col-xs-12 mt-xs-3">
                                    <div className="sLT_gray left left-aRRow">
                                    <Select
                                        simpleValue={true}
                                        name="form-field-name"
                                        value={this.state.filter_by}
                                        options={selectOpt}
                                        onChange={(value) => this.submitSearch('', 'filter_by', value,true)}
                                        clearable={false}
                                        searchable={false}
                                    />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-4 col-xs-12 my-xs-3">
                                    <div className="row">
                                        <div className="col-xs-6">
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
                                        <div className="col-xs-6">
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

                    <div className="col-lg-12 Invoic-Scheduler_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                        <ReactTable
                                /* data={ShiftQueries}
                                columns={columns}
                                PaginationComponent={Pagination}
                                noDataText="No Record Found"
                                // onPageSizeChange={this.onPageSizeChange}
                                minRows={2}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={true}
                                className="-striped -highlight"
                                noDataText="No duplicate applicant found" */

                                PaginationComponent={Pagination}
                                showPagination={this.state.staffList.length > PAGINATION_SHOW ? true : false}
                                ref={this.reactTable}
                                columns={columns}
                                manual
                                data={this.state.staffList}
                                filtered={this.state.filtered}
                                defaultFilter={this.state.filtered}
                                pages={this.state.pages}
                                previousText={<span className="icon icon-arrow-left privious" ></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                noDataText="No Invoice Scheduler found"
                                defaultPageSize={10}
                                className="-striped -highlight"
                                minRows={2}
                    
                            />
                        </div>
                        {/* <div className="d-flex justify-content-between mt-3">
                            <a className="btn B_tn" href="#">Mark Selected As Complete</a>
                            <a className="btn B_tn" href="#">View all Taks</a>
                        </div> */}
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


export default connect(mapStateToProps, mapDispatchtoProps)(InvoiceScheduler);