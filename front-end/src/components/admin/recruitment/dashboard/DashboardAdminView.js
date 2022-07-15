import React, { Component } from "react";
//import Select from 'react-select-plus';
import "react-select-plus/dist/react-select-plus.css";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Link } from "react-router-dom";
import { ROUTER_PATH } from "config.js";
//import Pagination from "../../../../service/Pagination.js";
import { connect } from "react-redux";
//import RecruitmentPage from 'components/admin/recruitment/RecruitmentPage';
import ScrollArea from "react-scrollbar";
import { getRecruiterAdminActionNotification, recruiterAdminActionNotificationDismissAndView } from "../actions/RecruitmentAction.js";
import { urlNotification,  defaultSpaceInTable} from 'service/custom_value_data.js';
import classNames from "classnames";


const CustomTbodyComponent = props => (
  <div {...props} className={classNames("rt-tbody", props.className || [])}>
      <div className=" cstmSCroll1">
          <ScrollArea
              speed={0.8}
              className="stats_update_list"
              contentClassName="content"
              horizontal={false}
              style={{ paddingRight: "15px",  paddingLeft: "15px", height: '620px', minHeight: '620px' }}
          >{props.children}</ScrollArea>
      </div>
  </div>
);


class DashboardAdminView extends Component {
  constructor() {
    super();
    this.state = {
      actionable_notification: []
    };
  }
  componentWillMount() {
    this.props.getRecruiterAdminActionNotification();
  }

  dissmisAndViewNotification(id, type, mode) {
    let reqData = {};
    reqData['type'] = type;
    reqData['id'] = id;
    if (type == 1) {
      let urlMode = (urlNotification[mode]) ? urlNotification[mode] : '';
      reqData['url'] = ROUTER_PATH + 'admin/recruitment/dashboard/' + urlMode;
    }
    this.props.recruiterAdminActionNotificationDismissAndView(reqData);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.recruiter_admin_actionable_notification.fetchRecord && this.props.recruiter_admin_actionable_notification.fetchRecord) {
      this.setState({actionable_notification: nextProps.recruiter_admin_actionable_notification.data});
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="row ">
          <div className="col-lg-5 col-md-5 mycol-xl-5">
              <div className="Req-Dashboard_tBL">
            <div className="PD_Al_div1">
              <div className="PD_Al_h_txt pt-3 lt_heads">Latest Action</div>
                <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">

                  <ReactTable
                    data={this.props.latest_action}
                    columns={[
                      {
                        // Header: "Recruiter",
                        accessor: "recruiter",
                        headerClassName: '_align_c__ header_cnter_tabl',
                        Header: () =>
                          <div>
                            <div className="ellipsis_line__"><b>Staff</b></div>
                          </div>,
                        className: '_align_c__',
                        Cell: props =>
                          <div className="ellipsis_line__">
                         {defaultSpaceInTable(props.value)}
                          </div>
                      },
                      {
                        // Header: "Task ",
                        accessor: "task",
                        headerClassName: '_align_c__ header_cnter_tabl',
                        Header: () =>
                          <div>
                            <div className="ellipsis_line__"><b>Task</b></div>
                          </div>,
                        className: '_align_c__',
                        Cell: props =>
                          <div className="ellipsis_line__">
                            {defaultSpaceInTable(props.value)}
                          </div>
                      },
                      {
                        // Header: "Status",
                        accessor: "task_status",
                        headerClassName: '_align_c__ header_cnter_tabl',
                        Header: () =>
                          <div>
                            <div className="ellipsis_line__"><b>Action</b></div>
                          </div>,
                        className: '_align_c__',
                        Cell: props =>
                          <div className="ellipsis_line__">
                            {defaultSpaceInTable(props.value)}
                          </div>
                      },
                      {
                        // Header: "Date",
                        accessor: "date",
                        headerClassName: '_align_c__ header_cnter_tabl',
                        Header: () =>
                          <div>
                            <div className="ellipsis_line__"><b>Date</b></div>
                          </div>,
                        className: '_align_c__',
                        Cell: props =>
                          <div className="ellipsis_line__">
                            {defaultSpaceInTable(props.value)}
                          </div>,
                        width: 110
                      },
                      {
                        Header: "",
                        headerStyle: { border: "0px solid #000" },
                        className: '_align_c__',
                        maxWidth: 35,
                        Cell: row => (
                          <span className="PD_Al_icon">
                            <a
                              onClick={() =>
                                this.props.editShowTask(row.original.id)
                              }
                            >
                              <i className="icon icon-view2-ie LA_i1"></i>
                            </a>{" "}
                          </span>
                        )
                      }
                    ]}
                    defaultPageSize={11}
                    // pageSize={this.props.latest_action.length}
                    showPagination={false}
                    sortable={false}
                    TbodyComponent={CustomTbodyComponent}
                    className="-striped -highlight"
                  />
                </div>
              
              <Link to={ROUTER_PATH + "admin/recruitment/action/task"}>
                <button className="btn cmn-btn1 btn-block vw_btn w-100">
                  View All
                </button>
              </Link>
            </div>
          </div>
          </div>

          <div className="col-lg-5 col-md-4 mycol-xl-4">
            <div className="Req-Dashboard_tBL">
            <div className="PD_Al_div1">
              <div className="PD_Al_h_txt pt-3 lt_heads">Due Tasks</div>
                <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">
                <ReactTable
                  data={this.props.due_task}
                  columns={[
                    {
                      // Header: "Recruiter",
                      accessor: "recruiter",
                      headerClassName: '_align_c__ header_cnter_tabl',
                      Header: () =>
                        <div>
                          <div className="ellipsis_line__"><b>Staff</b></div>
                        </div>,
                      className: '_align_c__',
                      Cell: props =>
                        <div className="ellipsis_line__">
                          {defaultSpaceInTable(props.value)}
                        </div>,
                    },
                    {
                      // Header: "Applicant ",
                      accessor: "applicant",
                      headerClassName: '_align_c__ header_cnter_tabl',
                      Header: () =>
                        <div>
                          <div className="ellipsis_line__"><b>Applicant</b></div>
                        </div>,
                      className: '_align_c__',
                      Cell: props =>
                        <div className="ellipsis_line__">
                         {defaultSpaceInTable(props.value)}
                        </div>,
                    },
                    {
                      // Header: "Task",
                      accessor: "task",
                      headerClassName: '_align_c__ header_cnter_tabl',
                      Header: () =>
                        <div>
                          <div className="ellipsis_line__"><b>Task</b></div>
                        </div>,
                      className: '_align_c__',
                      Cell: props =>
                        <div className="ellipsis_line__">
                          {defaultSpaceInTable(props.value)}
                        </div>,
                    },
                    {
                      // Header: "Status",
                      accessor: "task_status",
                      headerClassName: '_align_c__ header_cnter_tabl',
                        Header: () =>
                          <div>
                            <div className="ellipsis_line__"><b>Action</b></div>
                          </div>,
                        className: '_align_c__',
                        Cell: props =>
                          <div className="ellipsis_line__">
                             {defaultSpaceInTable(props.value)}
                          </div>,
                      maxWidth: 120
                    },
                    {
                      // Header: "Date",
                      accessor: "date",
                      headerClassName: '_align_c__ header_cnter_tabl',
                      Header: () =>
                        <div>
                          <div className="ellipsis_line__"><b>Date</b></div>
                        </div>,
                      className: '_align_c__',
                      Cell: props =>
                        <div className="ellipsis_line__">
                          {defaultSpaceInTable(props.value)}
                        </div>,
                      maxWidth: 120
                    },
                    {
                      Header: "",
                      headerStyle: { border: "0px solid #000" },
                      maxWidth: 35,
                      Cell: row => (
                        <span className="PD_Al_icon">
                          <a
                            onClick={() =>
                              this.props.editShowTask(row.original.id)
                            }
                          >
                            <i className="icon icon-view2-ie LA_i1"></i>
                          </a>{" "}
                        </span>
                      )
                    }
                  ]}
                  defaultPageSize={11}
                  // pageSize={this.props.due_task.length}
                  showPagination={false}
                  sortable={false}
                  TbodyComponent={CustomTbodyComponent}
                  className="-striped -highlight"
                />
              </div>
            
              <Link to={ROUTER_PATH + "admin/recruitment/action/task"}>
                <button className="btn cmn-btn1 btn-block vw_btn">
                  View All
                </button>
              </Link>
            </div>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 mycol-xl-3">
            <div className="PD_Al_div1">
              <div className="PD_Al_h_txt pt-3 lt_heads">
                Latest Status Updates
              </div>
              <div className="re-table re_tab_D mn_hg">
                <div className=" cstmSCroll1">
                  <ScrollArea
                    speed={0.8}
                    className="stats_update_list"
                    contentClassName="content"
                    horizontal={false}
                    style={{ paddingRight: "13px", paddingleft: "13px" }}
                  >
                    {this.state.actionable_notification.length > 0 ? (
                      this.state.actionable_notification.map((row, index) => {
                        return (
                          <React.Fragment key={index}>
                            <div className="stats_ups">
                              <div className="sts_dtie">
                                <div>{row.title}</div>
                                <span>{row.notification_date}</span>
                              </div>
                              <div className="sts_bdy">
                                <div className="">
                                  <h6 className="sts_co">
                                    <strong>Applicant: </strong>
                                    {row.recruitment_applicant}
                                  </h6>
                                  <h6 className="pb-2">
                                    <strong>{row.recruiter_name}</strong>
                                  </h6>
                                  <h6 className="pb-2">{row.title}</h6>
                                </div>
                                <div className="sts_footer">
                                  <ul className="subTasks_Action__">
                                    <li>
                                      <span className="sbTsk_li" onClick={() => { this.dissmisAndViewNotification(row.id, 2, row.mode) }}>Dismiss</span>
                                    </li>
                                    <li>
                                      <span className="sbTsk_li" onClick={() => { this.dissmisAndViewNotification(row.id, 1, row.mode) }}>View</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                        <React.Fragment />
                      )}
                  </ScrollArea>
                </div>
              </div>
              {/* <Link to={'#'}><button className="btn cmn-btn1 btn-block vw_btn">View All</button></Link> */}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
  showTypePage: state.RecruitmentReducer.activePage.pageType,
  recruiter_admin_actionable_notification:
    state.RecruitmentReducer.recruiter_admin_actionable_notification
});

const mapDispatchtoProps = dispatch => {
  return {
    getRecruiterAdminActionNotification: () =>
      dispatch(getRecruiterAdminActionNotification()),
    recruiterAdminActionNotificationDismissAndView: (request) =>
      dispatch(recruiterAdminActionNotificationDismissAndView(request))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchtoProps
)(DashboardAdminView);
