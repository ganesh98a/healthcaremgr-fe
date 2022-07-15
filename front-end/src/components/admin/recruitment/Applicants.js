import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { ProgressBar } from 'react-bootstrap';
import { checkItsNotLoggedIn, postData } from '../../../service/common.js';
import { connect } from 'react-redux'
import RecruitmentPage from 'components/admin/recruitment/RecruitmentPage';
import FlagApplicantModal from './applicants/FlagApplicantModal';
import { ROUTER_PATH} from 'config.js';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {

        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('recruitment/RecruitmentApplicant/get_requirement_applicants', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

class Applicants extends Component {

    constructor() {
        super();
        this.state = {
            searchVal: '',
            filterVal: '',
            applicantList: [],
            flagallicantpopup: false,
        }
    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                applicantList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }



    render() {

        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two', clearableValue: false }
        ];

        var columns = [
            { Header: "Name:", accessor: "FullName" },
            { Header: "Application ID:", accessor: "id", Cell: props => <span>APP-{props.value}</span> },
            { Header: "Position Application:", accessor: "position" },
            { Header: "Date Applied:", accessor: "date_applide", Cell: props => <span>{moment(props.value).format('DD/MM/YYYY')}</span> },
            { Header: "Status:", accessor: "status" },
            { Header: "Last Updated:", accessor: "lastupdate", Cell: props => <span>{moment(props.value).format('DD/MM/YYYY')}</span> },
            {
                expander: true,
                Header: () => <strong></strong>,
                width: 55,
                headerStyle: { border: "0px solid #fff" },
                Expander: ({ isExpanded, ...rest }) =>
                    <div className="rec-table-icon">
                        {isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1"></i>
                            : <i className="icon icon-arrow-right icn_ar1"></i>}
                    </div>,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }
            }
        ];

        return (
            <React.Fragment>
                
                {/* row ends */}

                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>
                {/* row ends */}

                
                {/* row ends */}


                <div className="row action_cont_row">

                    <div className="col-lg-12 col-md-12">

                        <div className="tasks_comp">

                            <div className="row sort_row1--">
                                <div className="col-lg-6 col-md-6 col-sm-12 no_pd_l noPd_R_ipd">
                                    <div className="search_bar left srchInp_sm actionSrch_st">
                                        <input type="text" className="srch-inp" placeholder="Applicant specific Search Bar.." />
                                        <i className="icon icon-search2-ie"></i>
                                    </div>
                                </div>

                                <div className="col-lg-6 col-md-6 col-sm-12 no_pd_r">
                                    <div className='row'>
                                        <div className='col-md-6 col-sm-6'>
                                            <div className="filter_flx lab_vrt">
                                                <label>Filter by:</label>
                                                <div className="filter_fields__ cmn_select_dv">
                                                    <Select name="view_by_status"
                                                        simpleValue={true}
                                                        searchable={false}
                                                        placeholder="Filter by: Unread"
                                                        options={options}
                                                        onChange={(e) => this.setState({ filterVal: e })}
                                                        value={this.state.filterVal}

                                                    />
                                                </div>

                                            </div>
                                        </div>
                                        <div className='col-md-6 col-sm-6'>
                                            <div className="filter_flx lab_vrt">
                                                <label>Show:</label>
                                                <div className="filter_fields__ cmn_select_dv">
                                                    <Select name="view_by_status"
                                                        simpleValue={true}
                                                        searchable={false}
                                                        placeholder="All Applicant"
                                                        options={options}
                                                        onChange={(e) => this.setState({ filterVal: e })}
                                                        value={this.state.filterVal}
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                            {/* row ends */}


                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="data_table_cmn dataTab_accrdn_cmn aplcnt_table hdng_cmn2 table_progress">

                                        <ReactTable
                                            manual="true"
                                            loading={this.state.loading}
                                            onFetchData={this.fetchData}
                                            filtered={this.props.filtered}
                                            columns={columns}
                                            data={this.state.applicantList}
                                            defaultPageSize={10}
                                            minRows={2}
                                            showPagination={false}
                                            onPageSizeChange={this.onPageSizeChange}
                                            noDataText="No Record Found"
                                            SubComponent={(props) => <ApplicantExpander {...props} openFlagModal={()=>this.setState({flagallicantpopup:true})} />}
                                        />

                                    </div>

                                </div>

                            </div>
                            {/* row ends */}
                        </div>
                        {/* tasks_comp ends */}
                    </div>
                    {/* col-sm-10 ends */}
                </div>
                {/* row ends */}
                <FlagApplicantModal showModal={this.state.flagallicantpopup} closeModal={() => this.setState({ flagallicantpopup: false })} />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Applicants);

class ApplicantExpander extends Component {



    render() {
        const now = 60;
        return (
            <div className='applicant_info1'>
                <div className='row bor_l_cols bor_top pt-3 bor_bot_b1 pb-3'>
                    <div className='col-sm-4'>
                        <p><b>Susan McSmith</b>(APP-10844)</p>
                        <div className='applis_dets1'>
                            <p>Phone: <b>0487999222</b></p>
                            <p>Email: <b>susan.mcsmith@gmail.com</b></p>
                        </div>
                        <p>Assigned to: <b>Sope Lorem</b></p>
                    </div>

                    <div className='col-sm-3  cntsDv'>
                    <p><b>Pending:</b></p>
                   <div>Phone Interview</div>
                    </div>

                    <div className='col-sm-5  cntsDv'>
                        <p><b>Seek Questions :</b></p>
                        <div className="Seek_Q_ul">
                            <div className="Seek_Q_li">
                                <span><i className="icon icon-cross-icons"></i></span>
                                <div>From Wikipedia, the free encyclopedia</div>
                            </div>
                            <div className="Seek_Q_li">
                                <span><i className="icon icon-accept-approve1-ie"></i></span>
                                <div>From Wikipedia, the free encyclopedia</div>
                            </div>
                            <div className="Seek_Q_li">
                                <span><i className="icon icon-accept-approve1-ie"></i></span>
                                <div>From Wikipedia, the free encyclopedia</div>
                            </div>
                            <div className="Seek_Q_li">
                                <span><i className="icon icon-accept-approve1-ie"></i></span>
                                <div>From Wikipedia, the free encyclopedia</div>
                            </div>
                            <div className="Seek_Q_li">
                                <span><i className="icon icon-accept-approve1-ie"></i></span>
                                <div>From Wikipedia, the free encyclopedia</div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* row ends */}
                 <div className='row'>
                     <div className="col-md-12 ">
                         <div className="applicant_info_footer_1">
                        <div className='no_pd_l'>
                            <Link to='./applicants/ApplicantInfo'>
                                <button className="btn cmn-btn1 apli_btn__ eye-btn">View Applicant Information</button>
                            </Link>

                        </div>
                        <div className='no_pd_r'>
                            <ul className="subTasks_Action__">
                                {/* <li><span className="sbTsk_li">Shortlist Applicant</span></li>
                                <li><span className="sbTsk_li">Position Analytics</span></li> */}
                                <li><span className="sbTsk_li">Archive Applicant</span></li>
                                <li><span className="sbTsk_li" onClick={this.props.openFlagModal}>Flag Applicant</span></li>
                            </ul>
                        </div>
                        </div>
                        </div>
                    </div>
                    {/* row ends */}

                <ProgressBar now={now} label={'Application Progress: ' + `${now}% ` + 'Complete'} />
               

            </div>
        )
    }
}


