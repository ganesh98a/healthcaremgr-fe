import React, { Component } from 'react';
import Select from 'react-select-plus';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import { postData, reFreashReactTable, archiveALL } from 'service/common.js';
import moment from "moment";
import Pagination from "service/Pagination.js";
import {ROUTER_PATH} from 'config.js';
import {defaultSpaceInTable} from 'service/custom_value_data.js';
import { connect } from 'react-redux'
import AvatarIcon from '../../oncallui-react-framework/view/AvatarIcon';


const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {

        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentApplicant/get_requirement_flaged_applicants', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

class FlaggedApplicants extends Component {

    constructor() {
        super();
        this.state = {
            InterviewType: '',
            filter_val: 'pending',
            
        }
        this.reactTable = React.createRef();
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

    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            var search_re = { search: this.state.search, filter_val: this.state.filter_val };
            this.setState({ filtered: search_re });
        });
    }

    submitSearch = (e) => {
        e.preventDefault();
        var search_re = { search: this.state.search, filter_val: this.state.filter_val };
        this.setState({ filtered: search_re });
    }
    
    dontFlag = (applicant_id,flagged_status) => {
        let msg = flagged_status==2 ? 'Are you sure you want to Unflag this applicant?':'Are you sure you want to deny this request?';
        archiveALL({applicant_id: applicant_id}, msg, 'recruitment/RecruitmentApplicant/dont_flag_applicant').then((req) => {
            if(req.status){
                 reFreashReactTable(this, 'fetchData');
            }
        })
    }
    
    flagApplicant = (applicant_id, uuid) => {
       archiveALL({applicant_id: applicant_id, uuid: uuid}, 'Are you sure you want to flag this applicant?', 'recruitment/RecruitmentApplicant/flag_applicant_approve').then((req) => {
            if(req.status){
                 reFreashReactTable(this, 'fetchData');
            }
       })
    }

    render() {
        var filter_option = [{ label: 'All', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'New', value: 'new' }, { label: 'Flagged', value: 'flagged' }];

        var columns = [
            { /* Header: "Name:", */ accessor: "FullName", minWidth: 80,
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
              <div>
                <div className="ellipsis_line1__">Name</div>
              </div>
            ,
            className: '_align_c__',
            Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
         },
            { /* Header: "Recruiter:", */ accessor: "recruiter_name",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
              <div>
                <div className="ellipsis_line1__">Staff</div>
              </div>
            ,
            className: '_align_c__', 
            Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
        },
            {
                /* Header: "Job Position:", */ accessor: "job_position",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                  <div>
                    <div className="ellipsis_line1__">Job Position</div>
                  </div>
                ,
                className: '_align_c__',
                Cell: (props) => (<div className="text-center text_ellip">{defaultSpaceInTable(props.value)}</div>)
            },
            { /* Header: "Date Applied:", */ accessor: "date_applide",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
              <div>
                <div className="ellipsis_line1__">Date Applied</div>
              </div>
            ,
            className: '_align_c__',
             Cell: (props) => moment(props.value).format('DD/MM/YYYY') },
            {
                /* Header: "Flag Status:", */ accessor: "status", minWidth: 100,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                  <div>
                    <div className="ellipsis_line1__">Flag Status:</div>
                  </div>
                ,
                className: '_align_c__',
                Cell: (props) => (
                    <div>
                        {(props.original.flagged_status == '3' ?
                            <span className="slots_sp clr_purple">New</span>
                            :
                            props.original.flagged_status == '2' ?
                                <span className="slots_sp clr_red">Flagged</span>
                                : <span className="slots_sp clr_yellow">Pending</span>
                        )
                        }

                    </div>
                )
            },
            {
                expander: true,
                Header: () => <strong></strong>,
                width: 55,
                headerStyle: { border: "0px solid #fff" },
                className: '_align_c__',
                Expander: ({ isExpanded, ...rest }) =>
                    <div >
                        {isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{fontSize:'13px'}}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{fontSize:'13px'}}></i>}
                    </div>,
                style: {
                    cursor: "pointer",
                    // fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }
            }

        ];

        var options = [];

        return (
            <React.Fragment>

                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1> {this.props.showPageTitle}</h1>
                    </div>
                </div>
                {/* row ends */}

                <div className="row sort_row1-- after_before_remove">

                    <div className="col-lg-9 col-md-8 col-sm-8 no_pd_l">
                        <form onSubmit={(e) => this.submitSearch(e)} method="post">
                            <div className="search_bar right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                <i className="icon icon-search2-ie"></i>
                            </div>
                        </form>
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                        <div className="filter_flx">

                            <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
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
                {/* row ends */}


                <div className="row mt-5">
                    <div className="col-sm-12 no_pd_l Req-Flaged-applicant_tBL">
                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                ref={this.reactTable}
                                manual="true"
                                loading={this.state.loading}
                                pages={this.state.pages}
                                onFetchData={this.fetchData}
                                filtered={this.state.filtered}
                                defaultFiltered={{ filter_val: 'pending'}}
                                columns={columns}
                                data={this.state.applicantList}
                                defaultPageSize={10}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No Record Found"
                                collapseOnDataChange={false}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                className="-striped -highlight"

                                SubComponent={(props) =>
                                    <FlaggedApplicantExpander {...props.original} dontFlag={this.dontFlag} flagApplicant={this.flagApplicant} />
                                }
                            />

                        </div>
                        <ul className="legend_ulBC small">
                            <li><span className="leg_ic clr_red"></span>Flagged</li>
                            <li><span className="leg_ic clr_yellow"></span>Pending</li>
                            <li><span className="leg_ic clr_purple"></span>New</li>
                        </ul>

                    </div>

                </div>
                {/* row ends */}


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

export default connect(mapStateToProps, mapDispatchtoProps)(FlaggedApplicants);

class FlaggedApplicantExpander extends Component {
    state = {

    }

    render() {
        return (
            <div className='tBL_Sub applicant_info1 fl_aplis'>

                <div className="row bor_l_cols">
                    <div className="col-lg-3 col-md-4 col-sm-12">
                        <h4 className="mb-m-2 flg_ap_hd"><strong>{this.props.FullName}</strong>&nbsp;{this.props.appId}</h4>
                        <div>
                            <div style={{width: "80%", float: "left"}}>
                                <h5 className="mb-m-1"><strong>Phone : </strong>{this.props.phone}</h5>
                                <h5 className="mb-m-1"><strong>Email : </strong><span className="brk_all">{this.props.email}</span></h5>
                            </div>
                            <div>
                                <AvatarIcon size="large" assistiveText="" avatar={this.props.avatar} category="standard" name="user" />
                            </div>
                        </div>
                        <Link to={ROUTER_PATH+'admin/recruitment/applicant/' + this.props.id} ><button className="btn cmn-btn1 eye-btn mt-1">Applicant Information</button></Link>

                    </div>
                    {/* col-lg-3 ends */}
                    <div className="col-lg-2 col-md-2 col-sm-12">
                        <h5 className="mb-m-1"><strong>Job Applications </strong></h5>
                        <ul className="appli_ul_14">
                            {this.props.job_application.map((val, i) => (
                                <li key={i}>{i + 1}.&nbsp; {val.title}</li>

                            ))}
                        </ul>
                    </div>
                    {/* col-lg-2 ends */}
                    <div className="col-lg-3 col-md-3 col-sm-12">
                        <h5 className="mb-m-1"><strong>Reason for Flag: </strong></h5>
                        <div className="mt-m-2">{this.props.reason_title}</div>
                        <div className="mt-m-2">
                            <a href={'#'} className="under_l_tx pd-r-10" onClick={() => this.props.dontFlag(this.props.id,this.props.flagged_status)}>Don't Flag</a>
                            {this.props.flagged_status == 2 ? '' : <a href={'#'}><span className="slots_sp clr_red cursor-pointer" onClick={() => this.props.flagApplicant(this.props.id, this.props.uuid)}>Flag Applicant</span></a>}
                        </div>
                    </div>
                    {/* col-lg-2 ends */}

                    <div className="col-lg-4 col-md-3 col-sm-12">
                        <h5 className="mb-m-1"><strong>Relevant Notes: </strong></h5>
                        <div className="mt-m-2">
                            {(this.props.reason_note.length > 200) ?
                                <div>
                                    <span >
                                        {(!this.state.showComp) ?
                                            this.props.reason_note.substring(0, 200) + ' [...]'
                                            :
                                            this.props.reason_note
                                        }

                                    </span>

                                    <span className="vwMore_sp" onClick={() => { this.setState({ showComp: !this.state.showComp }) }}>
                                        View {(!this.state.showComp) ? 'More' : 'Less'}
                                    </span>
                                </div>
                                :
                                this.props.reason_note
                            }

                        </div>

                    </div>
                    {/* col-lg-2 ends */}

                </div>
            </div>
        );
    }
}