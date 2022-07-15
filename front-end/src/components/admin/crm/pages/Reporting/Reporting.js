import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { ROUTER_PATH } from "../../../../../config.js";
import { checkItsNotLoggedIn, postData, getPermission, handleChangeSelectDatepicker } from "../../../../../service/common.js";
import { CounterShowOnBox } from "service/CounterShowOnBox.js";
import { connect } from "react-redux";
import Chart from "react-google-charts";
import CrmPage from "../../CrmPage";
import { leftFunnel } from "../../../../../dropdown/CrmDropdown.js";
import { GenderAnalysisChart } from "service/GenderAnalysisChart.js";
import { FunnelAnalysisChart } from "service/FunnelAnalysisChart.js";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import moment from "moment";
import { array } from "prop-types";

class ProspectiveParticipantStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      crmparticipantCount: 0,
      view_type: "month",
      grapheachdata: {}
    };
  }
  componentDidMount() {
    this.crmParticipantAjax();
  }
  crmParticipantStatusBy = type => {
    this.setState({ view_type: type }, function() {
      this.crmParticipantAjax();
    });
  };

  crmParticipantAjax = () => {
    postData("crm/Dashboard/crm_participant_status", this.state).then(result => {
      if (result.status) {
        this.setState({ crmparticipantCount: result.participant_count });
        this.setState({ grapheachdata: result.grapheachdata });
      } else {
        this.setState({ error: result.error });
      }
    });
  };

  render() {
    const Graphdata = {
      labels: ["Successful", "Processing", "Rejected"],
      datasets: [
        {
          data: [
            this.state.grapheachdata.successful ? this.state.grapheachdata.successful : 0,
            this.state.grapheachdata.processing ? this.state.grapheachdata.processing : 0,
            this.state.grapheachdata.rejected ? this.state.grapheachdata.rejected : 0
          ],
          backgroundColor: ["#be77ff", "#7c00ef", "#5300a7"],
          borderWidth: 0
        }
      ]
    };
    return (
      <React.Fragment>
        <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12">
          <div className="status_box1">
            <div className="row">
              <h4 className="hdng">Participant Status:</h4>
              <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                <div className="mb-3">
                  <Doughnut data={Graphdata} height={210} className="myDoughnut" legend={{ display: false }} />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                <ul className="status_det_list">
                  <li className="chart_txt_1">
                    <b>Successful:</b> {this.state.grapheachdata.successful}
                  </li>
                  <li className="chart_txt_2">
                    <b>Processing:</b> {this.state.grapheachdata.processing}
                  </li>
                  <li className="chart_txt_3">
                    <b>Rejected:</b> {this.state.grapheachdata.rejected}
                  </li>
                </ul>
                <div className="viewBy_dc text-center">
                  <h5>View By:</h5>
                  <ul>
                    <li onClick={() => this.crmParticipantStatusBy("week")} className={this.state.view_type == "week" ? "active" : ""}>
                      Week
                    </li>
                    <li onClick={() => this.crmParticipantStatusBy("month")} className={this.state.view_type == "month" ? "active" : ""}>
                      Month
                    </li>
                    <li onClick={() => this.crmParticipantStatusBy("year")} className={this.state.view_type == "year" ? "active" : ""}>
                      Year
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <li className="radi_2">
                    <h2 className="text-center cl_black">Participant Status:</h2>
                    <div className="row  pb-3 align-self-center w-100 mx-auto Graph_flex">
                        <div className="text-center col-md-5 col-xs-12">
                            <div className="myChart12 mx-auto" >
                                <Doughnut data={Graphdata} height={250} className="myDoughnut" legend={null} />
                            </div>
                        </div>
                        <div className="col-md-4 col-xs-12 text-center d-inline-flex align-self-center">
                            <div className="myLegend mx-auto">
                                <div className="chart_txt_1"><b>Successful:</b> {this.state.grapheachdata.successful}</div>
                                <div className="chart_txt_2"><b>Processing:</b> {this.state.grapheachdata.processing}</div>
                                <div className="chart_txt_3"><b>Rejected:</b> {this.state.grapheachdata.rejected}</div>
                            </div>
                        </div>
                        <div className="W_M_Y_box P_15_T col-md-3 col-xs-12 pb-3 d-inline-flex align-self-center">
                            <div className="vw_bx12 mx-auto">
                                <h5><b>View by:</b></h5>
                                <span onClick={() => this.crmParticipantStatusBy('week')} className={this.state.view_type == 'week' ? 'color' : ''}>Week</span><br />
                                <span onClick={() => this.crmParticipantStatusBy('month')} className={this.state.view_type == 'month' ? 'color' : ''}>Month </span><br />
                                <span onClick={() => this.crmParticipantStatusBy('year')} className={this.state.view_type == 'year' ? 'color' : ''}> Year</span><br />
                            </div>
                        </div>
                    </div>
                </li> */}
      </React.Fragment>
    );
  }
}

class ProspectiveParticipantCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      crmparticipantCount: 0,
      view_type: "month",
      all_crmparticipant_count: ""
    };
  }

  componentDidMount() {
    this.crmParticipantAjax();
  }

  crmParticipantCountBy = type => {
    this.setState({ view_type: type }, function() {
      this.crmParticipantAjax();
    });
  };
  //
  crmParticipantAjax = () => {
    postData("crm/Dashboard/crm_participant_count", this.state).then(result => {
      if (result.status) {
        this.setState({ crmparticipantCount: result.crm_participant_count });
        this.setState({ all_crmparticipant_count: result.all_crmparticipant_count });
      } else {
        this.setState({ error: result.error });
      }
    });
  };

  render() {
    return (
      <React.Fragment>
        <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12">
          <div className="status_box1">
            <div className="row">
              <h4 className="hdng">Onboarded Participants:</h4>
              <div className="col-lg-12 col-md-12 col-sm-12 colJ-1">
                <CounterShowOnBox counterTitle={this.state.crmparticipantCount} classNameAdd="" mode="recruitment" />
                <div className="duly_vw">
                  <div className="viewBy_dc text-center">
                    <h5>View By:</h5>
                    <ul>
                      <li onClick={() => this.crmParticipantCountBy("week")} className={this.state.view_type == "week" ? "active" : ""}>
                        Week
                      </li>
                      <li onClick={() => this.crmParticipantCountBy("month")} className={this.state.view_type == "month" ? "active" : ""}>
                        Month{" "}
                      </li>
                      <li onClick={() => this.crmParticipantCountBy("year")} className={this.state.view_type == "year" ? "active" : ""}>
                        Year{" "}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <li className="radi_2">
                        <h2 className="text-center cl_black">Onboarded Participants:</h2>
                        <div className="row pb-3 align-self-center w-100 mx-auto Graph_flex">
                            <div className="col-md-8 col-xs-12 d-inline-flex align-self-center justify-content-center mb-3">
                                <CounterShowOnBox counterTitle={this.state.crmparticipantCount} classNameAdd="" />
                            </div>
                            <div className="W_M_Y_box  col-md-4 col-xs-12 d-inline-flex align-self-center">
                                <div className="vw_bx12 mx-auto">
                                    <h5><b>View by:</b></h5>
                                    <span onClick={() => this.crmParticipantCountBy('week')} className={this.state.view_type == 'week' ? 'color' : ''}>Week</span><br />
                                    <span onClick={() => this.crmParticipantCountBy('month')} className={this.state.view_type == 'month' ? 'color' : ''}>Month </span><br />
                                    <span onClick={() => this.crmParticipantCountBy('year')} className={this.state.view_type == 'year' ? 'color' : ''}> Year</span>
                                </div>
                            </div>
                        </div>
                    </li> */}
      </React.Fragment>
    );
  }
}

class Reporting extends Component {
  constructor(props, context) {
    super(props, context);
    checkItsNotLoggedIn(ROUTER_PATH);
    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      key: 1,
      filterVal: "",
      intakeVolumeLeft: {},
      intakeVolumeRight: {},
      permissions: getPermission() == undefined ? [] : JSON.parse(getPermission()),
      intakeVolumePercentage: [],
      allData: {},
      allRightData: {}
    };
  }

  crmParticipantBar = () => {
    postData("crm/CrmReporting/crm_participant_bar_status", this.state).then(result => {
      if (result.status) {
        this.setState({ renderBarStatus: result.data });
      }
    });
  };

  crmParticipantIntakeVolumeLeft = intakeData => {
    postData("crm/CrmReporting/crm_participant_intake_volume_left", intakeData).then(result => {
      if (result.status) {
        this.setState({ intakeVolumeLeft: result.data });
      }
    });
  };

  crmParticipantIntakeVolumeRight = intakeData => {
    postData("crm/CrmReporting/crm_participant_intake_volume_right", intakeData).then(result => {
      if (result.status) {
        this.setState({ intakeVolumeRight: result.data });
      }
    });
  };

  crmParticipantIntakeVolumePercentageLeft = parcentData => {
    postData("crm/CrmReporting/crm_participant_intake_volume_percentage_left", parcentData).then(result => {
      if (result.status) {
        let newvar = result.data;
        let allDatas = {};
        Object.keys(newvar).map(function(i, j) {
          switch (i) {
            case "1":
              allDatas["contact_success"] = newvar[i].success;
              allDatas["contact_reject"] = newvar[i].reject;
              break;
            case "4":
              allDatas["intake_success_2_1"] = newvar[i].success;
              allDatas["intake_reject_2_1"] = newvar[i].reject;
              break;
            case "5":
              allDatas["intake_success_2_2"] = newvar[i].success;
              allDatas["intake_reject_2_2"] = newvar[i].reject;
              break;
            case "6":
              allDatas["intake_success_2_3"] = newvar[i].success;
              allDatas["intake_reject_2_3"] = newvar[i].reject;
              break;
            case "7":
              allDatas["intake_success_2_4"] = newvar[i].success;
              allDatas["intake_reject_2_4"] = newvar[i].reject;
              break;
            case "8":
              allDatas["plandeligation_success_3_1"] = newvar[i].success;
              allDatas["plandeligation_reject_3_1"] = newvar[i].reject;
              break;
            case "9":
              allDatas["plandeligation_success_3_2"] = newvar[i].success;
              allDatas["plandeligation_reject_3_2"] = newvar[i].reject;
              break;
            case "10":
              allDatas["plandeligation_success_3_3"] = newvar[i].success;
              allDatas["plandeligation_reject_3_3"] = newvar[i].reject;
              break;
            case "11":
              allDatas["plandeligation_success_3_4"] = newvar[i].success;
              allDatas["plandeligation_reject_3_4"] = newvar[i].reject;
              break;
          }
        });
        this.setState({ allData: allDatas });
      }
    });
  };

  crmParticipantIntakeVolumePercentageRight = parcentData => {
    postData("crm/CrmReporting/crm_participant_intake_volume_percentage_right", parcentData).then(result => {
      if (result.status) {
        let rightvar = result.data;
        let allRightDatas = {};
        Object.keys(rightvar).map(function(i, j) {
          switch (i) {
            case "1":
              allRightDatas["contact_success"] = rightvar[i].success;
              allRightDatas["contact_reject"] = rightvar[i].reject;
              break;
            case "4":
              allRightDatas["intake_success_2_1"] = rightvar[i].success;
              allRightDatas["intake_reject_2_1"] = rightvar[i].reject;
              break;
            case "5":
              allRightDatas["intake_success_2_2"] = rightvar[i].success;
              allRightDatas["intake_reject_2_2"] = rightvar[i].reject;
              break;
            case "6":
              allRightDatas["intake_success_2_3"] = rightvar[i].success;
              allRightDatas["intake_reject_2_3"] = rightvar[i].reject;
              break;
            case "7":
              allRightDatas["intake_success_2_4"] = rightvar[i].success;
              allRightDatas["intake_reject_2_4"] = rightvar[i].reject;
              break;
            case "8":
              allRightDatas["plandeligation_success_3_1"] = rightvar[i].success;
              allRightDatas["plandeligation_reject_3_1"] = rightvar[i].reject;
              break;
            case "9":
              allRightDatas["plandeligation_success_3_2"] = rightvar[i].success;
              allRightDatas["plandeligation_reject_3_2"] = rightvar[i].reject;
              break;
            case "10":
              allRightDatas["plandeligation_success_3_3"] = rightvar[i].success;
              allRightDatas["plandeligation_reject_3_3"] = rightvar[i].reject;
              break;
            case "11":
              allRightDatas["plandeligation_success_3_4"] = rightvar[i].success;
              allRightDatas["plandeligation_reject_3_4"] = rightvar[i].reject;
              break;
          }
        });
        this.setState({ allRightData: allRightDatas });
      }
    });
  };
  selectChangeLeft = (selectedOption, fieldname) => {
    var state = {};
    state[fieldname] = selectedOption;
    state[fieldname + "_error"] = false;

    this.crmParticipantIntakeVolumeLeft(state);
    this.crmParticipantIntakeVolumePercentageLeft(state);
    this.rightDropdownFunnel(state[fieldname].value);
    this.setState(state);
  };
  selectChangeRight = (selectedOption, fieldname) => {
    var state = this.state;
    state[fieldname] = selectedOption;
    state[fieldname + "_error"] = false;

    this.crmParticipantIntakeVolumeRight(state);
    this.crmParticipantIntakeVolumePercentageRight(state);
    // this.rightDropdownFunnel(state[fieldname].value);
    this.setState(state);
  };
  componentWillMount() {
    this.crmParticipantBar();
    // this.crmParticipantIntakeVolume();
    // this.crmParticipantIntakeVolumePercentage();
  }

  rightDropdownFunnel = leftFunnelData => {
    const year = new Date().getFullYear();
    const months = moment.months();
    const data = { months: months, value: leftFunnelData };
    postData("crm/CrmReporting/crm_participant_intake_right_funnel", data).then(result => {
      if (result.status) {
        this.setState({ options: result.data });
      }
    });
    // const years = Array.from(new Array(10), (val, index) => year - index);
    // console.log(year, months, years);
    // var options = [];
    // var option = {};
    // let m = 1;
    // Object.keys(years).map(function(i, j) {
    //   if (leftFunnelData == 3) {
    //     option = { value: years[i], label: years[i] };
    //     options.push(option);
    //   }
    //   if (leftFunnelData == 2) {
    //     for (var k = 0; k < 12; k++) {
    //       k = k + 2;
    //       option = { value: k + m, label: months[k - 2] + "," + months[k - 1] + "," + months[k] + "," + years[i] };
    //       options.push(option);
    //     }
    //   }
    //   if (leftFunnelData == 1) {
    //     for (var k = 0; k < 12; k++) {
    //       option = { value: k + m, label: months[k] + "," + years[i] };
    //       options.push(option);
    //     }
    //   }
    // });
    // this.setState({ options });
  };
  handleSelect(key) {
    this.setState({ key });
  }
  funnelListLeftData() {
    let funnelLeftData = [
      {
        lost_per: this.state.allData.contact_reject,
        success_per: this.state.allData.contact_success,
        label_status: true,
        label_data: { title: "Contact", start: this.state.intakeVolumeLeft.contact_start, complete: this.state.intakeVolumeLeft.contact_complete },
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#7e85d3", col2: "#7e85d3" }
      },
      {
        lost_per: this.state.allData.intake_reject_2_1,
        success_per: this.state.allData.intake_success_2_1,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#c2e0ce", col2: "#c2e0ce" }
      },
      {
        lost_per: this.state.allData.intake_reject_2_2,
        success_per: this.state.allData.intake_success_2_2,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#9bd6b2", col2: "#9bd6b2" }
      },
      {
        lost_per: this.state.allData.intake_reject_2_3,
        success_per: this.state.allData.intake_success_2_3,
        label_status: true,
        label_data: { title: "Intake", start: this.state.intakeVolumeLeft.intake_start, complete: this.state.intakeVolumeLeft.intake_complete },
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#72ca95", col2: "#72ca95" }
      },
      {
        lost_per: this.state.allData.intake_reject_2_4,
        success_per: this.state.allData.intake_success_2_4,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#51c07e", col2: "#51c07e" }
      },
      {
        lost_per: this.state.allData.plandeligation_reject_3_1,
        success_per: this.state.allData.plandeligation_success_3_1,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#c798f4", col2: "#d6bbf0" }
      },
      {
        lost_per: this.state.allData.plandeligation_reject_3_2,
        success_per: this.state.allData.plandeligation_success_3_2,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#ae5bfa", col2: "#c798f4" }
      },
      {
        lost_per: this.state.allData.plandeligation_reject_3_3,
        success_per: this.state.allData.plandeligation_success_3_3,
        label_status: true,
        label_data: { title: "Plan Delegation", start: this.state.intakeVolumeLeft.plandeligation_start, complete: this.state.intakeVolumeLeft.plandeligation_complete },
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#c798f4", col2: "#c798f4" }
      },
      {
        lost_per: this.state.allData.plandeligation_reject_3_4,
        success_per: this.state.allData.plandeligation_success_3_4,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#6401c0", col2: "#6401c0" }
      }
    ];

    return funnelLeftData;
  }
  funnelListRightData() {
    let funnelRightData = [
      {
        lost_per: this.state.allRightData.contact_reject,
        success_per: this.state.allRightData.contact_success,
        label_status: true,
        label_data: { title: "Contact", start: this.state.intakeVolumeRight.contact_start, complete: this.state.intakeVolumeRight.contact_complete },
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#7e85d3", col2: "#7e85d3" }
      },
      {
        lost_per: this.state.allRightData.intake_reject_2_1,
        success_per: this.state.allRightData.intake_success_2_1,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#c2e0ce", col2: "#c2e0ce" }
      },
      {
        lost_per: this.state.allRightData.intake_reject_2_2,
        success_per: this.state.allRightData.intake_success_2_2,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#9bd6b2", col2: "#9bd6b2" }
      },
      {
        lost_per: this.state.allRightData.intake_reject_2_3,
        success_per: this.state.allRightData.intake_success_2_3,
        label_status: true,
        label_data: { title: "Intake", start: this.state.intakeVolumeRight.intake_start, complete: this.state.intakeVolumeRight.intake_complete },
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#72ca95", col2: "#72ca95" }
      },
      {
        lost_per: this.state.allRightData.intake_reject_2_4,
        success_per: this.state.allRightData.intake_success_2_4,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#51c07e", col2: "#51c07e" }
      },
      {
        lost_per: this.state.allRightData.plandeligation_reject_3_1,
        success_per: this.state.allRightData.plandeligation_success_3_1,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#c798f4", col2: "#d6bbf0" }
      },
      {
        lost_per: this.state.allRightData.plandeligation_reject_3_2,
        success_per: this.state.allRightData.plandeligation_success_3_2,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#ae5bfa", col2: "#c798f4" }
      },
      {
        lost_per: this.state.allRightData.plandeligation_reject_3_3,
        success_per: this.state.allRightData.plandeligation_success_3_3,
        label_status: true,
        label_data: { title: "Plan Delegation", start: this.state.intakeVolumeRight.plandeligation_start, complete: this.state.intakeVolumeRight.plandeligation_complete },
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#c798f4", col2: "#c798f4" }
      },
      {
        lost_per: this.state.allRightData.plandeligation_reject_3_4,
        success_per: this.state.allRightData.plandeligation_success_3_4,
        label_status: false,
        itemStyle: { color: "red" },
        itemGridentColor: { col1: "#6401c0", col2: "#6401c0" }
      }
    ];

    return funnelRightData;
  }

  render() {
    let barGraphdata = this.state.renderBarStatus;
    if (!this.state.permissions.access_crm_admin) {
      return <Redirect to="/admin/no_access" />;
    }
    var options = [
      { value: "one", label: "One" },
      { value: "two", label: "Two" }
    ];
    const Applicantdata = {
      labels: ["Successful", "Processing", "Rejected"],
      datasets: [
        {
          data: ["250", "333", "250"],
          backgroundColor: ["#ed97fa", "#b968c7", "#702f75"]
        }
      ]
    };
    const Participantsavailable = {
      labels: ["", "", ""],
      datasets: [
        {
          data: ["250", "333", "250"],
          backgroundColor: ["#ed97fa", "#b968c7", "#702f75"]
        }
      ]
    };
    var options = [
      { value: "7", label: "July,2019" },
      { value: "6", label: "June,2019" }
    ];

    return (
      <React.Fragment>
        <div className="container-fluid">
          <CrmPage pageTypeParms={"report_onbording_analytics"} />
          <div className="row">
            <div className="col-lg-12">
              <div className="py-4">
                <Link className="back_arrow d-inline-block" to={ROUTER_PATH + "admin/crm/participantadmin"}>
                  <span className="icon icon-back1-ie"></span>
                </Link>
              </div>
            </div>
          </div>

          <div className="d-flex by-1 py-4">
            <div className="h-h1 color">{this.props.showPageTitle}</div>
          </div>

          {/* <div className="row mt-5">
                    <div className="col-lg-12">
                        <div className="row d-flex">
                            <div className="col-md-12">
                                <div className="search_bar right srchInp_sm actionSrch_st">
                                    <input type="text" className="srch-inp" placeholder="Search.." name="srch_box" />
                                    <i className="icon icon-search2-ie"></i>
                                </div>
                            </div>
                        </div>
                    </div> */}

          <div className="row status_row-- pt-3 after_before_remove justify-content-center">
            <ProspectiveParticipantCount />
            <ProspectiveParticipantStatus />
          </div>
          <div className="bt-1 mt-3"></div>

          {/* <ul className="landing_graph landing_graph_item_2 mt-5">
                        <ProspectiveParticipantCount />
                        <ProspectiveParticipantStatus />
                    </ul> */}

          <div className="row pt-5">
            <div className="col-lg-12">
              <h3 className="mb-4">Participant Status by Month</h3>
              <div className="report_chart_box">
                <Chart
                  height={"340px"}
                  chartType="Bar"
                  loader={<div>Loading Chart</div>}
                  data={barGraphdata}
                  options={{
                    colors: ["#6401c0", "#982afe", "#d6bbf0"],
                    legend: { position: "none" },
                    chart: {
                      title: "",
                      subtitle: ""
                    },
                    backgroundColor: "red",
                    bars: "vertical"
                  }}
                  rootProps={{ "data-testid": "3" }}
                />
                <div className="w-100">
                  <div className="Funnel_helper pull-right">
                    <div className="Funnel_tl Pro_Not_act_1">
                      <i></i> <span>Not Accepted</span>
                    </div>
                    <div className="Funnel_tl Pro_Pen_1">
                      <i></i> <span>Pending </span>
                    </div>
                    <div className="Funnel_tl Pro_Suc_a3">
                      <i></i> <span>Successful</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row pt-5">
            <div className="col-lg-12">
              <h3 className="mb-4">Intake volume</h3>

              <div className="Funnel_main_div">
                <div className="mr-2">
                  <div className="row">
                    <div className="col-md-7  pull-right pr-5 pb-3">
                      <Select
                        options={leftFunnel(0)}
                        cache={false}
                        clearable={false}
                        searchable={false}
                        name="left_drop_down"
                        value={this.state["left_drop_down"]}
                        placeholder="Select"
                        onChange={e => this.selectChangeLeft(e, "left_drop_down")}
                        className="custom_select"
                      />
                    </div>
                  </div>
                  <FunnelAnalysisChart funnelData={this.funnelListLeftData()} funnelPosition={"left"} />
                </div>
                <div className="ml-2">
                  <div className="row">
                    <div className="col-md-7 pull-left pl-5 pb-3">
                      <Select
                        name="right_drop_down"
                        value="one"
                        options={this.state.options}
                        cache={false}
                        clearable={false}
                        searchable={false}
                        name="right_drop_down"
                        value={this.state["right_drop_down"]}
                        placeholder="Select"
                        onChange={e => this.selectChangeRight(e, "right_drop_down")}
                        className="custom_select"
                      />
                    </div>
                  </div>
                  <FunnelAnalysisChart funnelData={this.funnelListRightData()} funnelPosition={"right"} />
                </div>
              </div>

              <div className="Funnel_bottom">
                <div className="Funnel_helper">
                  <div className="Funnel_tl Funnel_lost w-100">
                    <i></i> <span>Percentage lost at stage</span>
                  </div>
                  <div className="Funnel_tl Funnel_Sucess  w-100">
                    <i></i> <span>Percentage Successful at stage</span>
                  </div>
                </div>
                <div className="Funnel_helper">
                  <div className="Funnel_tl Funnel_stage_1">
                    <i></i> <span>Stage 1</span>
                  </div>
                  <div className="Funnel_tl Funnel_stage_2">
                    <i></i> <span>Stage 2</span>
                  </div>
                  <div className="Funnel_tl Funnel_stage_3">
                    <i></i> <span>Stage 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const MsgGraph = props => {
  return (
    <div className="DG_a1 V4_DG2__ mt-5">
      <div className="row DG_aa">
        <GenderAnalysisChart
          genderData={[
            { title: "U18", data: { male: 50, female: 60 } },
            { title: "18-25", data: { male: 250, female: 562 } },
            { title: "25-35", data: { male: 630, female: 260 } },
            { title: "35-45", data: { male: 5, female: 360 } },
            { title: "45-60", data: { male: 400, female: 360 } },
            { title: "60+", data: { male: 45, female: 600 } }
          ]}
        />
        <div className="col-md-8 DG-aa-2">
          <h4 className="mb-3"> Area Demographic Analysis:</h4>
          <div className="DG-aa-2a">Hot spots of Victoria, ONCALL Managed Participants.</div>
          <div className="row mt-5">
            <div className="col-md-8 px-5"></div>
            <div className="col-md-4 DG-aa-3">
              Top 5 Hot Spots for VIC:
              <div className="DG-aa-3a">
                <span className="DG-aa-3b">
                  <span>1</span>
                </span>
                <div className="DG-aa-3c">
                  <span>Melbourne (City)</span>- 147 Participants
                </div>
              </div>
              <div className="DG-aa-3a">
                <span className="DG-aa-3b">
                  <span>2</span>
                </span>
                <div className="DG-aa-3c">
                  {" "}
                  <span>Geelong (City)</span>
                  -41 Participants
                </div>
              </div>
              <div className="DG-aa-3a">
                <span className="DG-aa-3b">
                  <span>3</span>
                </span>
                <div className="DG-aa-3c">
                  {" "}
                  <span>Apollo Bay (Area)</span>
                  -23 Participants
                </div>
              </div>
              <div className="DG-aa-3a">
                <span className="DG-aa-3b">
                  <span>4</span>
                </span>
                <div className="DG-aa-3c">
                  {" "}
                  <span>Mildura (Area)</span>
                  -23 Participants
                </div>
              </div>
              <div className="DG-aa-3a">
                <span className="DG-aa-3b">
                  <span>5</span>
                </span>
                <div className="DG-aa-3c">
                  {" "}
                  <span>Sale (Area)</span>
                  -8 Participants
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType
  };
};

export default connect(mapStateToProps)(Reporting);
