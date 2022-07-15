import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import "react-table/react-table.css";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import { checkItsNotLoggedIn, postData, getPermission } from "../../../../../service/common.js";
import { ROUTER_PATH } from "../../../../../config.js";
import { connect } from "react-redux";
import CrmPage from "../../CrmPage";
import { CounterShowOnBox } from "service/CounterShowOnBox.js";
import LatestUpdates from "./LatestUpdates";
import DueTasks from "./DueTasks";
// import ParticipantDetails from '../Participants/ParticipantDetails.js/index.js';
import LatestActions from "./LatestActions";

class ProspectiveParticipantStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            crmparticipantCount: 0,
            view_type: "month",
            grapheachdata: ""
        };
    }

    componentWillMount() {
        this.crmParticipantAjax();
    }

    crmParticipantStatusBy = type => {
        this.setState({ view_type: type }, function () {
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
                    data: [this.state.grapheachdata.successful, this.state.grapheachdata.processing, this.state.grapheachdata.rejected],
                    backgroundColor: ["#be77ff", "#7c00ef", "#5300a7"],
                    borderWidth: 0
                }
            ]
        };
        return (
            <React.Fragment>
                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <div className="status_box1">
                        <h4 className="hdng">Participant Status:</h4>
                        <div className="row">
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

                {/* <li className="radi_2" style={{ marginRight: '0px' }}>
          <h2 className="text-center  cl_black">Participant Status:</h2>
          <div className="row  pb-3 align-self-center w-100 mx-auto Graph_flex">
            <div className="text-center align-self-center col-lg-5 col-md-5 col-xs-4">
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

class ProspectiveParticipantVsMember extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            view_type: "month"
        };
    }

    componentDidMount() {
        this.crmParticipantAjax();
    }

    crmParticipantStatusBy = type => {
        this.setState({ view_type: type }, function () {
            this.crmParticipantAjax();
        });
    };

    crmParticipantAjax = () => {
        postData("crm/Dashboard/crm_participant_member", this.state).then(result => {
            if (result.status) {
                this.setState({ count: result.count });
            } else {
                this.setState({ error: result.error });
            }
        });
    };

    render() {
        const BarGraphdata = {
            labels: ["Participants", "Members", "In progress"],
            datasets: [
                {
                    data: [this.state.count.participant, this.state.count.member, this.state.count.processing],
                    backgroundColor: ["#be77ff", "#7c00ef", "#5300a0"]
                }
            ]
        };
        const data = {
            labels: ["Participant Other", "Participant New"],
            datasets: [
                {
                    data: [this.state.all_participant_count - this.state.participantCount, this.state.participantCount],
                    backgroundColor: ["#7c00ef", "#5300a0"],
                    hoverBackgroundColor: ["#7c00ef", "#5300a0"]
                }
            ]
        };
        return (
            <li className="radi_2">
                <h2 className="text-center  cl_black">Participants vs Members available:</h2>
                <div className="col-md-5 pr-0">
                    <Bar
                        data={BarGraphdata}
                        width={120}
                        legend={""}
                        options={{
                            maintainAspectRatio: false
                        }}
                    />
                </div>
                <div className="col-md-7 text-left mt-3">
                    <div className="chart_txt_1">
                        <b>Participants:</b> {this.state.count.participant}
                    </div>
                    <div className="chart_txt_2">
                        <b>Members:</b> {this.state.count.member}
                    </div>
                    <div className="chart_txt_3">
                        <b>In Progress:</b> {this.state.count.processing}
                    </div>
                    <div className="chart_txt_4">
                        <div className="mt-5">
                            <b>View by:</b>
                        </div>
                        <span onClick={() => this.crmParticipantStatusBy("week")} className={this.state.view_type == "week" ? "active" : ""}>
                            Week
            </span>
                        <span onClick={() => this.crmParticipantStatusBy("month")} className={this.state.view_type == "month" ? "active" : ""}>
                            Month{" "}
                        </span>
                        <span onClick={() => this.crmParticipantStatusBy("year")} className={this.state.view_type == "year" ? "active" : ""}>
                            {" "}
                            Year
            </span>
                    </div>
                </div>
            </li>
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
        this.setState({ view_type: type }, function () {
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
                        <h4 className="hdng">Prospective Participants:</h4>
                        <div className="row">
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
        <h2 className="text-center cl_black">Prospective Participants:</h2>
        <div className="row  pb-3 align-self-center w-100 mx-auto Graph_flex">
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

class Participantadmin extends Component {
    constructor(props, context) {
        super(props, context);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            filterVal: "",
            key: 1,
            showModal_PE: false,
            permissions: getPermission() == undefined ? [] : JSON.parse(getPermission())
        };
    }

    handleSelect(key) {
        this.setState({ key });
    }
    showModal_PE = id => {
        let state = {};
        state[id] = true;

        this.setState(state);
    };
    closeModal_PE = id => {
        let state = {};
        state[id] = false;

        this.setState(state);
    };

    updateSelect = e => {
        this.setState({ filterVal: e });
    };

    render() {
        if (!this.state.permissions.access_crm_admin) {
            return <Redirect to="/admin/no_access" />;
        }
        return (
            <div>
                <CrmPage pageTypeParms={"crm_dashboard"} />
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="py-4 bb-1">
                                <a className="back_arrow d-inline-block" href={ROUTER_PATH + "admin/dashboard"}>
                                    <span className="icon icon-back1-ie"></span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="row _Common_He_a">
                        <div className="col-lg-9 col-md-9 col-xs-12">
                            <h1 className="my-0 color">Participant Intake</h1>
                        </div>
                        <div className="col-lg-3 col-md-3 col-xs-12 mt-xs-3">
                            <Link className="Plus_button" to={ROUTER_PATH + "admin/crm/createParticipant"}>
                                <i className="icon icon-add-icons create_add_but"></i>
                                <span>Create New Participant</span>
                            </Link>
                        </div>
                    </div>
                    <div className="row ">
                        <div className="col-lg-12">
                            <div className="bt-1"></div>
                        </div>
                    </div>

                    <div className="row status_row-- pt-3 after_before_remove justify-content-center">
                        <ProspectiveParticipantCount />
                        <ProspectiveParticipantStatus />
                    </div>
                    <div className="bt-1 mt-3"></div>

                    {/*<div className="row">
            <div className="col-lg-12">
              <ul className="landing_graph landing_graph_item_2 mt-5">
                <ProspectiveParticipantCount />
                <ProspectiveParticipantStatus />
               // <ProspectiveParticipantVsMember/>
              </ul>
              <div className="bt-1 mt-5"></div>
            </div>
          </div>*/}

                    {/* 2. Start Tab Concept Start */}
                    <div className="row">
                        <ul className="nav nav-tabs Category_tap Nav_ui__ col-lg-12 col-sm-12 P_20_TB">
                            <li className="col-lg-4 col-sm-4 ">
                                <Link to={ROUTER_PATH + "admin/crm/participantuser"}>My View</Link>
                            </li>
                            <li className="col-lg-4 col-sm-4 active">
                                <a href="#1a" data-toggle="tab">
                                    Participant Intake Department View
                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="tab-content clearfix">
                        <div className="tab-pane active" id="1a">
                            <div className="row">
                                <div className="col-lg-5 col-md-5 mycol-xl-5">
                                    <LatestActions />
                                </div>
                                <div className="col-lg-5 col-md-4 mycol-xl-4">
                                    <DueTasks />
                                </div>
                                <div className="col-lg-2 col-md-3 mycol-xl-3">
                                    <LatestUpdates props={this.props} />
                                </div>
                            </div>
                        </div>
                        <div className="tab-pane" id="2a">
                            <div className="row"></div>
                        </div>
                    </div>

                    {/* Start Tab Concept End */}
                </div>
            </div>
        );
    }
}

class Filterdiv extends React.Component {
    constructor(props) {
        super(props);
        this.state = { filterVal: "" };
    }
    render() {
        var options = [
            { value: "one", label: "One" },
            { value: "two", label: "Two" }
        ];
        return (
            <div className="row pt-5 mb-5">
                <div className="col-lg-6 col-lg-offset-1 col-md-6">
                    <div className="big-search l-search">
                        <input type="text" />
                        <button>
                            <span className="icon icon-search1-ie"></span>
                        </button>
                    </div>
                </div>
                <div className="col-lg-2 col-md-3">
                    <div className="s-def1">
                        <Select
                            name="view_by_status"
                            options={options}
                            required={true}
                            simpleValue={true}
                            searchable={false}
                            clearable={false}
                            placeholder="Filter by: Unread"
                            onChange={e => this.setState({ filterVal: e })}
                            value={this.state.filterVal}
                            className={"custom_select"}
                        />
                    </div>
                </div>
                <div className="col-lg-2 col-md-3">
                    <div className="s-def1">
                        <Select
                            name="view_by_status"
                            options={options}
                            required={true}
                            simpleValue={true}
                            searchable={false}
                            clearable={false}
                            placeholder="Filter by: Unread"
                            onChange={e => this.setState({ filterVal: e })}
                            value={this.state.filterVal}
                            className={"custom_select"}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType
    };
};
const mapDispatchtoProps = dispach => {
    return {};
};
export default connect(mapStateToProps, mapDispatchtoProps)(Participantadmin);
