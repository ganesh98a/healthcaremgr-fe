import React, { Component } from "react";
import Select from "react-select-plus";
import { PAGINATION_SHOW } from '../../../config.js';
import "react-select-plus/dist/react-select-plus.css";
import moment from "moment";
import { PanelGroup, Panel } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import SuccessPopUp from "./SuccessPopup";
import { connect } from "react-redux";
import RecruitmentPage from "components/admin/recruitment/RecruitmentPage";
import { checkLoginWithReturnTrueFalse, getPermission, postData, handleChangeChkboxInput } from 'service/common.js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { jobOpeningStatus } from '../../../dropdown/JobDropdown.js';
import { ToastContainer, toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js'
import QuickPreviewModal from './QuickPreviewModal';
import Pagination from "../../../service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';

const requestData = (pageSize, page, sorted, filtered) => {
  return new Promise((resolve, reject) => {
    var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
    postData('recruitment/Recruitment_job/get_all_jobs', Request).then((result) => {
      if (result.status) {

        let filteredData = result.data;
        const res = {
          rows: filteredData,
          pages: (result.count),
          all_count: result.all_count,
          total_duration: result.total_duration
        };
        resolve(res);
      }
    });
  });
};

class JobOpening extends Component {
  constructor() {
    super();
    this.state = {
      successPop: false,
      quickModal: false,
      jobListing: [],
      JobData: [],
      filter_by: 3,
      srch_value: ''
    };

    this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
  }

  fetchData = (state, instance) => {
    this.setState({ loading: true });
    requestData(
      state.pageSize,
      state.page,
      state.sorted,
      state.filtered
    ).then(res => {
      this.setState({
        jobListing: res.rows,
        all_count: res.all_count,
        pages: res.pages,
        loading: false,
      });
    })
  }

  searchData = (e) => {
    e.preventDefault();
    var requestData = { srch_value: this.state.srch_value, filter_by: (this.state.filtered) ? this.state.filtered.filter_by : 3 };
    this.setState({ filtered: requestData });
  }

  viewJob = (e, jobId) => {
    e.preventDefault();
    postData('recruitment/recruitment_job/get_job_detail', { jobId: jobId }).then((result) => {
      if (result.status) {
        this.setState({ JobData: result.data }, () => {
          this.setState({ quickModal: true });
        })
      }
    });
  }

  componentDidMount() {
    document.title = 'Job opening'; 
  }

  render() {

    return (
      <React.Fragment>

        <section>         
          {/* row ends */}

          <div className="row">
            <div className="col-lg-12 col-md-12 main_heading_cmn-">
              <h1>{this.props.showPageTitle}

                {(this.permission.access_recruitment_admin) ?

                  <Link to="./create_job">
                    <button className="btn hdng_btn cmn-btn1 icn_btn12">
                      Create New Job
                       <i className="icon icon-add-icons hdng_btIc"></i>
                    </button>
                  </Link>
                  : ''}

              </h1>
            </div>
          </div>
          {/* row ends */}

          <div className="row action_cont_row">
            <div className="col-lg-12 col-sm-12">
              <div className="tab-content">

                <div className="tasks_comp">
                  <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-7 col-md-7 col-sm-8 no_pd_l">
                      <div className="search_bar right srchInp_sm actionSrch_st">
                        <form autoComplete="off" onSubmit={this.searchData} method="post">
                          <input
                            name="srch_value"
                            type="text"
                            className="srch-inp"
                            placeholder="Search.."
                            onChange={(e) => handleChangeChkboxInput(this, e)}
                          />
                          <i className="icon icon-search2-ie" />
                        </form>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                      <div className="filter_flx">
                        <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                          <Select
                            name="filter_by"
                            simpleValue={true}
                            searchable={false}
                            clearable={false}
                            placeholder="Filter by: Job status"
                            options={jobOpeningStatus()}
                            onChange={(e) => this.setState({ filtered: { filter_by: e } })}
                            value={(this.state.filtered) ? this.state.filtered.filter_by : 3}
                          />

                        </div>
                      </div>
                    </div>
                  </div>
                  {/* row ends */}

                  <div className="row">
                    <div className="col-sm-12 no-pad Req-Job-Opening_tBL">
                      <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                        <ReactTable
                          columns={[
                            {
                              accessor: "position",
                              headerClassName: '_align_c__ header_cnter_tabl',
                              Header: () =>
                                <div>
                                  <div className="ellipsis_line1__">Title</div>
                                </div>
                              ,
                              className: '_align_c__',
                              Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                            },
                            { /* Header: "Applicants:", */
                              accessor: "applicant_cnt",
                              headerClassName: '_align_c__ header_cnter_tabl',
                              Header: () =>
                                <div>
                                  <div className="ellipsis_line1__">Applications</div>
                                </div>
                              ,
                              className: '_align_c__',
                              Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                            },

                            {
                              accessor: "created",
                              headerClassName: '_align_c__ header_cnter_tabl',
                              Header: () =>
                                <div>
                                  <div className="ellipsis_line1__">Job Created</div>
                                </div>
                              ,
                              className: '_align_c__',
                              Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                            },
                            {
                              accessor: "owner_name",
                              headerClassName: '_align_c__ header_cnter_tabl',
                              Header: () =>
                                <div>
                                  <div className="ellipsis_line1__">Owner</div>
                                </div>
                              ,
                              className: '_align_c__',
                              Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                            },

                            {
                              accessor: "job_status",
                              headerClassName: '_align_c__ header_cnter_tabl',
                              Header: () =>
                                <div>
                                  <div className="ellipsis_line1__">Status</div>
                                </div>
                              ,
                              className: '_align_c__',
                              Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                            },
                            {
                              expander: true,
                              Header: () => <strong />,
                              width: 45,
                              headerStyle: { border: "0px solid #fff" },
                              className: '_align_c__',
                              Expander: ({ isExpanded, ...rest }) => (
                                <div className="expander_bind">
                                  {isExpanded ? (
                                    <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }} />
                                  ) : (
                                      <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }} />
                                    )}
                                </div>
                              ),
                              style: {
                                cursor: "pointer",
                                fontSize: 25,
                                padding: "0",
                                textAlign: "center",
                                userSelect: "none"
                              }
                            }
                          ]}
                          manual
                          pages={this.state.pages}
                          loading={this.state.loading}
                          noDataText="No Record Found"
                          defaultPageSize={10}
                          data={this.state.jobListing}
                          minRows={2}
                          showPagination={this.state.jobListing.length > PAGINATION_SHOW ? true : false}
                          onFetchData={this.fetchData}
                          defaultFiltered={{ filter_by: 3, srch_value: '' }}
                          filtered={this.state.filtered}
                          PaginationComponent={Pagination}
                          previousText={<span className="icon icon-arrow-left privious"></span>}
                          nextText={<span className="icon icon-arrow-right next"></span>}
                          collapseOnDataChange={false}
                          className="-striped -highlight"
                          SubComponent={(props) => (
                            <div className="tBL_Sub applicant_info1 openingInfo clr_2">
                              <div className="jobMain_dets__ ">
                                <div className="row d-flex">
                                  <div className="col-md-4 bor-r-b">
                                    <ul className="jobMaindets_ul">
                                      <li className="mb-4">
                                        <b>Job Category:</b> {(props.original.job_category) ? props.original.job_category : ''}
                                      </li>
                                      <li className="">
                                        <b>Employment Type:</b> {(props.original.employment_type) ? props.original.employment_type : ''}
                                      </li>
                                    </ul>

                                    <div className="d-flex aplis_tsBts mt-5 align-items-center">
                                      {(props.original.applicant_cnt) > 0 ?
                                        <div><Link className="btn cmn-btn1 eye-btn" to={'/admin/recruitment/applications/' + props.original.id}>View Applications</Link></div>
                                        :
                                        <div><a className="btn cmn-btn1 eye-btn" disabled>View Applications</a></div>
                                      }
                                    </div>

                                  </div>
                                  <div className="col-md-8 pl-3">
                                    <p><b>Job URL:</b></p>
                                    <div className="row">
                                      <div className="col-lg-12 col-sm-12">
                                        <div className="d-flex">
                                        <div className="copy_btn">
                                          <input type="text" className="csForm_control " value={(props.original.website_url) ? props.original.website_url : ''} readOnly={true} />
                                          <CopyToClipboard text={(props.original.website_url) ? props.original.website_url : ''}
                                            onCopy={() => toast.success(<ToastUndo message={"Copied!!."} showType={'s'} />, {
                                              position: toast.POSITION.TOP_CENTER,
                                              hideProgressBar: true
                                            })}><span><i className="HCM-ie ie-clipboard"></i></span>
                                          </CopyToClipboard>
                                        </div>
                                        <a className="btn cmn-btn1 eye-btn vw_live ml-2 " onClick={() => window.open((props.original.website_url) ? props.original.website_url : '', "_blank")}>View Live Ad</a>
                                          </div>
                                      </div>

                                      
                                    </div>

                                  </div>
                                </div>
                              </div>

                              <div className="jobMain_foot__">
                                <div className="row">

                                  <div className="col-md-12 col-sm-12">
                                    <ul className="subTasks_Action__">
                                      <li>
                                        <span className="sbTsk_li"> {/*<a onClick={(e) => this.viewJob(e, props.original.id)}><small>View</small></a>*/}
                                          {(this.permission.access_recruitment_admin) ?
                                            <Link to={'/admin/recruitment/job_opening/create_job/' + props.original.id + '/E'} ><small>View/Edit Job</small></Link>
                                            : ''}
                                        </span>
                                      </li>
                                      <li>
                                        {(this.permission.access_recruitment_admin) ?
                                          <span className="sbTsk_li">
                                            <a href={'/admin/recruitment/job_opening/create_job/' + props.original.id + '/D'} className="decSpan" style={{ marginLeft: '0' }}><small>Duplicate Job</small></a>
                                          </span>
                                          : ''}
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  role="tabpanel"
                  className={
                    this.props.showTypePage == "interviews"
                      ? "tab-pane active"
                      : "tab-pane"
                  }
                  id="job_interview"
                >
                  Coming Soon
            </div>
              </div>
            </div>
          </div>
          {/* row ends */}
        </section>

        {(this.state.quickModal) ? <QuickPreviewModal showModal={this.state.quickModal} closeModal={() => this.setState({ quickModal: false })} parentState={this.state.JobData} {...this.state.JobData} /> : ''}

        <SuccessPopUp
          show={this.state.successPop}
          close={() => {
            this.setState({ successPop: false });
          }}
        >
          Your new Job has been Created and Posted
          </SuccessPopUp>
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => ({
  showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
  showTypePage: state.RecruitmentReducer.activePage.pageType
});

const mapDispatchtoProps = dispach => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchtoProps
)(JobOpening);
