import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { ProgressBar } from 'react-bootstrap';
import { postData, reFreashReactTable, archiveALL, checkLoginWithReturnTrueFalse, getPermission, handleChangeChkboxInput } from 'service/common.js';
import { connect } from 'react-redux'
import RecruitmentPage from 'components/admin/recruitment/RecruitmentPage';
import FlagApplicantModal from './FlagApplicantModal';
import Pagination from "service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import { TrComponent, getTrProps } from 'service/ReactTableTrProgressBar'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
const queryString = require('query-string');

/**
 * Fetching applicants data
 * @param {*} pageSize 
 * @param {*} page 
 * @param {*} sorted 
 * @param {*} filtered 
 */
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentApplicant/get_applicants', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};


/**
 * main class of Applicants
 */
class Applicants extends Component {

    /**
     * constructor
     */
    constructor() {
        super();
        this.state = {
            searchVal: '',
            filterVal: '',
            end_date: null,
            start_date: null,
            applicantList: [],
            flageModel: false,
            filter_val: 100,
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();
    }

    /**
     * fetches data from back-end
     */
    fetchData = (state, instance) => {
        
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

    /**
     * empty for now
     */
    componentDidMount() {
        
    }

    /**
     * when filter value changes
     */
    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    /**
     * when quick search is submitted
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * When modal of flagging applicant closes
     */
    closeFlagModal = (status) => {
        if (status) {
            reFreashReactTable(this, 'fetchData');
        }
        this.setState({ flageModel: false })
    }

    /**
     * When modal of flagging applicant opens up
     */
    openFlagModal = (applicant_id) => {
        this.setState({ flageModel: true, applicant_id: applicant_id })
    }

    /**
     * To archive an applicant
     */
    archiveApplicant = (applicant_id) => {
        archiveALL({ applicant_id: applicant_id }, 'Are you sure want to archive this applicant', "recruitment/RecruitmentApplicant/archive_applicant").then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchData');
            }
        });
    }

    /**
     * setting the listing table parameters
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_val: this.state.filter_val, start_date: this.state.start_date, end_date: this.state.end_date, ...this.defualtFilter };
        this.setState({ filtered: search_re });
    }

    /**
     * main render function
     */
    render() {
        this.defualtFilter = queryString.parse(window.location.search);

        var filter_option = [
            { value: '1', label: 'In progress', title: 'Displays applicants with at least 1 active application' },
            // Completed status will fetch both 2 and 3 (HCM-1438)
            { value: '4', label: 'Completed', title: 'Displays applicants with at least 1 rejected/completed application' },
            { value: '100', label: 'All', title: 'Displays all applicants' },
            // { value: '2', label: 'Rejected Applicants' },
        ];

        var columns = [
            {
                accessor: "appId",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">App ID</div>
                    </div>
                ,
                className: '_align_l__',
                Cell: props => {
                    /*if(props.original.flagged_status == "1") {
                        return <span title='Apllicant flag status is pending'><span style={{ width: 9 + 'px', height: 9 + 'px', backgroundColor: 'orange', position: 'absolute', left: 0 + 'px', display: 'inline-block', borderRadius: 50 + '%' }}> </span>{defaultSpaceInTable(props.value)}</span>
                    } /*else */if(props.original.flagged_status == "2") {
                        return <span title='Apllicant is flagged'><span style={{ width: 9 + 'px', height: 9 + 'px', backgroundColor: 'red', position: 'absolute', left: 0 + 'px', display: 'inline-block', borderRadius: 50 + '%' }}> </span>{defaultSpaceInTable(props.value)}</span>
                    } else {
                        return <span>{defaultSpaceInTable(props.value)}</span>
                    }
                }
            },
            {
                // Header: "Name:",
                accessor: "FullName",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Name</div>
                    </div>
                ,
                className: '_align_l__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: "email",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Email</div>
                    </div>
                ,
                className: '_align_l__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: "phone",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Phone</div>
                    </div>
                ,
                className: '_align_r__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: "created",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Date Created</div>
                    </div>
                ,
                className: '_align_r__',
                Cell: props => <span>{moment(props.value).format('DD/MM/YYYY HH:mm')}</span>
            },
            {
                accessor: "id",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Action</div>
                    </div>
                ,
                className: '_align_l__',
                Cell: props => <ul className="noborder_ul tsk_center2">
                    <li><span className="sbTsk_li2" onClick={() => this.archiveApplicant(props.value)}><i className="icon icon-trash-o f-21"></i></span></li>
                    <li><span className="sbTsk_li2" onClick={() => this.openFlagModal(props.value)}><i className="icon icon-flag2-ie f-21"></i></span></li>
                    <li><span className="sbTsk_li2"><Link to={ROUTER_PATH + 'admin/recruitment/applicant/' + props.value}><i className="icon icon icon-view1-ie f-21"></i></Link></span></li></ul>
            }
        ];

        return (
            <React.Fragment>
                
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>

                <div className="row action_cont_row">

                    <div className="col-lg-12 col-md-12">

                        <div className="tasks_comp">
                            <div className="row sort_row1-- after_before_remove">
                                <div className="col-lg-4 no_pd_l noPd_R_ipd">
                                    <form autoComplete="off" onSubmit={(e) => this.submitSearch(e)} method="post">
                                        <div className="search_bar right  srchInp_sm actionSrch_st">
                                            <input type="text" className="srch-inp" placeholder="Applicant specific Search Bar.."
                                                onChange={(e) => this.setState({ search: e.target.value })}
                                                value={this.state.search} />
                                            <i className="icon icon-search2-ie" onClick={(e) => this.submitSearch(e)}></i>
                                        </div>
                                    </form>
                                </div>

                                <div className="col-lg-8 no_pd_r">
                                    <div className='row sort_row1-- after_before_remove' style={{ marginTop: '0px', marginBottom: '0px' }}>
                                        <div className="col-lg-4 pr-xs-0">
                                            <div className="Fil_ter_ToDo">
                                                <label>From:</label>
                                                <span className={'cust_date_picker'}>
                                                    <DatePicker
                                                        selected={this.state.start_date}
                                                        isClearable={true}
                                                        onChange={(value) => this.filterChange('start_date', value)}
                                                        placeholderText="00/00/0000"
                                                        dateFormat="dd/MM/yyyy"
                                                        autoComplete={'off'}
                                                    />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-lg-4 pr-xs-0">
                                            <div className="Fil_ter_ToDo">
                                                <label>To:</label>
                                                <span className={'cust_date_picker'}>
                                                    <DatePicker
                                                        selected={this.state.end_date}
                                                        isClearable={true}
                                                        onChange={(value) => this.filterChange('end_date', value)}
                                                        placeholderText="00/00/0000"
                                                        dateFormat="dd/MM/yyyy"
                                                        autoComplete={'off'}
                                                    />
                                                </span>
                                            </div>
                                        </div>

                                        <div className='col-md-4 col-sm-2 pr-xs-0'>
                                            <div className="filter_flx lab_vrt">
                                                <label>Filter by:</label>
                                                <div className="filter_fields__ cmn_select_dv gr_slctB ">
                                                    <Select name="view_by_status"
                                                        simpleValue={true}
                                                        searchable={false}
                                                        placeholder="Filter by: Unread"
                                                        clearable={false}
                                                        options={filter_option}
                                                        onChange={(e) => this.filterChange('filter_val', e)}
                                                        value={this.state.filter_val}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>

                            <div className="row Req-Applicant_tBL">
                                <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                    {/* <div className="data_table_cmn dataTab_accrdn_cmn aplcnt_table hdng_cmn2 table_progress"> */}

                                    <ReactTable
                                        TrComponent={TrComponent}
                                        getTrProps={getTrProps}
                                        PaginationComponent={Pagination}
                                        ref={this.reactTable}
                                        manual="true"
                                        loading={this.state.loading}
                                        pages={this.state.pages}
                                        onFetchData={this.fetchData}
                                        filtered={this.state.filtered}
                                        defaultFiltered={{ ...this.defualtFilter, filter_val: 100 }}
                                        columns={columns}
                                        data={this.state.applicantList}
                                        defaultPageSize={10}
                                        minRows={1}
                                        onPageSizeChange={this.onPageSizeChange}
                                        noDataText="No Record Found"
                                        collapseOnDataChange={true}
                                        className="-striped -highlight"
                                        previousText={<span className="icon icon-arrow-left privious"></span>}
                                        nextText={<span className="icon icon-arrow-right next"></span>}
                                        openFlagModal={this.openFlagModal}
                                        archiveApplicant={this.archiveApplicant}
                                        permission={this.permission}
                                    />

                                </div>

                            </div>


                            {/* row ends */}
                        </div>
                        {/* tasks_comp ends */}
                    </div>
                    {/* col-sm-10 ends */}
                </div>
                {/* row ends */}

                {this.state.flageModel ? <FlagApplicantModal applicant_id={this.state.applicant_id} showModal={this.state.flageModel} closeModal={this.closeFlagModal} /> : ''}
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
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


