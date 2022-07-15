import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Tabs, Tab, ProgressBar } from 'react-bootstrap';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, getPermission } from '../../../../../service/common.js';
import { ROUTER_PATH } from '../../../../../config.js';
import { allLatestUpdate } from '../../actions/DashboardAction.js';
import { CounterShowOnBox } from 'service/CounterShowOnBox.js';
import { connect } from 'react-redux';
import CrmPage from '../../CrmPage';
import ScrollArea from "react-scrollbar";
import classNames from "classnames";

const CustomTbodyComponent = props => (
  <div {...props} className={classNames("rt-tbody", props.className || [])}>
    <div className=" cstmSCroll1">
      <ScrollArea
        speed={0.8}
        className="stats_update_list"
        contentClassName="content"
        horizontal={false}
        style={{ paddingRight: "15px", paddingLeft: "15px", height: '620px', minHeight: '620px' }}
      >{props.children}</ScrollArea>
    </div>
  </div>
);



class ProspectiveParticipantStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      crmparticipantCount: 0,
      view_type: 'month',
      grapheachdata: '',
    };

  }

  componentDidMount() {
    this.crmParticipantAjax();
  }

  crmParticipantStatusBy = (type) => {
    this.setState({ view_type: type }, function () {
      this.crmParticipantAjax();
    });
  }

  crmParticipantAjax = () => {
    postData('crm/Dashboard/crm_participant_status', this.state).then((result) => {
      if (result.status) {
        this.setState({ crmparticipantCount: result.participant_count });
        this.setState({ grapheachdata: result.grapheachdata });

      } else {
        this.setState({ error: result.error });
      }
    });
  }


  render() {
    const Graphdata = {
      labels: ['Successful', 'Processing', 'Rejected'],
      datasets: [{
        data: [this.state.grapheachdata.successful, this.state.grapheachdata.processing, this.state.grapheachdata.rejected],
        backgroundColor: ['#be77ff', '#7c00ef', '#5300a7'],
        borderWidth: 0
      }],
    };
    return (
      <React.Fragment>
        <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12">
          <div className="status_box1">
              <h4 className="hdng">Participant Status:</h4>
            <div className="row">
              <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                <div className='mb-3'>
                  <Doughnut data={Graphdata} height={210} className="myDoughnut" legend={{ display: false }} />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                <ul className="status_det_list">
                  <li className="chart_txt_1"><b>Successful:</b> {this.state.grapheachdata.successful}</li>
                  <li className="chart_txt_2"><b>Processing:</b> {this.state.grapheachdata.processing}</li>
                  <li className="chart_txt_3"><b>Rejected:</b> {this.state.grapheachdata.rejected}</li>
                </ul>
                <div className="viewBy_dc text-center">
                  <h5>View By:</h5>
                  <ul>
                    <li onClick={() => this.crmParticipantStatusBy('week')} className={(this.state.view_type == 'week') ? 'active' : ''}>Week</li>
                    <li onClick={() => this.crmParticipantStatusBy('month')} className={(this.state.view_type == 'month') ? 'active' : ''}>Month</li>
                    <li onClick={() => this.crmParticipantStatusBy('year')} className={(this.state.view_type == 'year') ? 'active' : ''}>Year</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <li className="radi_2">
        <h2 className="text-center  cl_black">Participant Status:</h2>
        <div className="row  pb-3 align-self-center w-100 mx-auto Graph_flex">
          <div className="text-center align-self-center col-lg-5 col-md-5 col-xs-4">
            <div className="myChart12 mx-auto" >
              <Doughnut data={Graphdata} height={250} className="myDoughnut" legend={""} />
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
            <span onClick={() => this.crmParticipantStatusBy('week')} className={this.state.view_type == 'week' ? 'color' : ''}>Week</span><br/>
            <span onClick={() => this.crmParticipantStatusBy('month')} className={this.state.view_type == 'month' ? 'color' : ''}>Month </span><br/>
            <span onClick={() => this.crmParticipantStatusBy('year')} className={this.state.view_type == 'year' ? 'color' : ''}> Year</span><br/>
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
      view_type: 'month',
      all_crmparticipant_count: '',
    };

  }

  componentDidMount() {
    this.crmParticipantAjax();
  }

  crmParticipantCountBy = (type) => {
    this.setState({ view_type: type }, function () {
      this.crmParticipantAjax();
    });
  }
  //
  crmParticipantAjax = () => {
    postData('crm/Dashboard/crm_participant_count', this.state).then((result) => {
      if (result.status) {
        this.setState({ crmparticipantCount: result.crm_participant_count });
        this.setState({ all_crmparticipant_count: result.all_crmparticipant_count });

      } else {
        this.setState({ error: result.error });
      }
    });
  }

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
                      <li onClick={() => this.crmParticipantCountBy('week')} className={(this.state.view_type == 'week') ? 'active' : ''}>Week</li>
                      <li onClick={() => this.crmParticipantCountBy('month')} className={(this.state.view_type == 'month') ? 'active' : ''}>Month </li>
                      <li onClick={() => this.crmParticipantCountBy('year')} className={(this.state.view_type == 'year') ? 'active' : ''}>Year </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <li className="radi_2">
        <h2 className="text-center  cl_black">Prospective Participants:</h2>
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



class Participantadmin extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {
      filterVal: '', key: 1,
      permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),
    };

  }

  handleSelect(key) {
    this.setState({ key });
  }


  render() {
    var options = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' }
    ];
    const Participantsavailable = {
      labels: ['', '', ''],
      datasets: [{
        data: ['250', '333', '250'],
        backgroundColor: ['#be77ff', '#7c00ef', '#5300a0'],

      }],

    };
    return (
      <div>
        <CrmPage pageTypeParms={'crm_dashboard'} />
        <div className="container-fluid">


          <div className="row">
            <div className="col-lg-12">
              <div className="py-4 bb-1">
                <a className="back_arrow d-inline-block" href={ROUTER_PATH + 'admin/dashboard'}>
                  <span className="icon icon-back1-ie"></span></a>
              </div>
            </div>
          </div>

          <div className="row _Common_He_a">
            <div className="col-lg-9 col-xs-9"><h1 className="my-0 color"> Participant Intake Dashboard ({(this.state.permissions.access_crm_admin) ? 'Admin' : 'User'})</h1></div>
            <div className="col-lg-3 col-xs-3">
              <Link className="Plus_button" to={ROUTER_PATH + 'admin/crm/createParticipant'}>
                <i className="icon icon-add-icons create_add_but"></i><span>Create New Participant</span></Link>
            </div>
          </div>
          <div className="row "><div className="col-lg-12"><div className="bt-1"></div></div></div>

          <div className="row status_row-- pt-3 after_before_remove justify-content-center">
            <ProspectiveParticipantCount />
            <ProspectiveParticipantStatus />
          </div>
          <div className="bt-1 mt-3"></div>

          {/*
          <div className="row">
            <div className="col-lg-12">
            <ul className="landing_graph landing_graph_item_2 mt-5">
                <ProspectiveParticipantCount />
                <ProspectiveParticipantStatus />
              </ul>
              <div className="bt-1 mt-5"></div>
            </div>
          </div> */}

          {/* 2. Start Tab Concept Start */}
          {(this.state.permissions.access_crm_admin) ?
            <div>
              <div className="row">
                <ul className="nav nav-tabs Category_tap Nav_ui__ col-lg-12 col-sm-12 P_20_TB">
                  <li className="col-lg-4 col-sm-4 active"><a href="#1a" data-toggle="tab">My View</a>
                  </li>
                  <li className="col-lg-4 col-sm-4 ">
                    <Link to={ROUTER_PATH + 'admin/crm/participantadmin'} >Participant Intake Department View</Link>
                  </li>
                </ul>
              </div>
            </div>
            : ''}
          {/* <div className="row">
            <div className="col-lg-10 col-lg-offset-1 px-0">
              <div className="tabs_1">
                <ul>
                  <li><Link to={ROUTER_PATH + 'admin/crm/prospectiveparticipants'}>Prospective Participants</Link></li>
                  <li><Link to={ROUTER_PATH + 'admin/crm/schedules'}>Schedules</Link></li>
                </ul>
              </div>
              <div className="col-md-12"> <div className=" bt-1"></div></div>
            </div>
          </div> */}


          <div className="row">
            <div className="col-lg-6 col-md-6">
              <LatestActions />
            </div>
            <div className="col-lg-6 col-md-6">
              <DueTasks />
            </div>
          </div>

        </div>
      </div>

    );
  }
}


class LatestActions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCol: '',
      data: []
    }
  }
  crmParticipantLatestAction = () => {
    postData('crm/Dashboard/crm_latest_action', this.state).then((result) => {
      if (result.status) {
        this.setState({ data: result.data.data });

      } else {
        this.setState({ error: result.error });
      }
    });
  }
  componentWillMount() {
    this.crmParticipantLatestAction();
  }
  render() {
    return (
      <div className="Req-Dashboard_tBL">
        <div className="PD_Al_div1">
          <div className="PD_Al_h_txt pt-3 lt_heads">New assigned Participants</div>
          <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">
            <ReactTable
              data={this.state.data}
              columns={[
                {
                  Header: "Participant Name", accessor: "FullName",
                  headerClassName: 'hdrCls', className: (this.state.activeCol === 'name') ? 'borderCellCls' : 'T_align_m1'
                },
                {
                  Header: "Intake Type", accessor: "stage_name",
                  headerClassName: 'hdrCls', className: (this.state.activeCol === 'overdueaction') ? 'borderCellCls' : 'T_align_m1'
                },
                {
                  Header: "Intake Date", accessor: "duedate",
                  headerClassName: 'hdrCls', className: (this.state.activeCol === 'date') ? 'borderCellCls' : 'T_align_m1',
                  maxWidth: 120,
                },
                {
                  Header: "", headerStyle: { border: '0px solid #000' },
                  maxWidth: 55,
                  Cell: row => (<span className="PD_Al_icon justify-content-center">
                    <Link to={ROUTER_PATH + 'admin/crm/participantdetails/' + row.original.id} title="View" >
                      <i className="icon icon-view2-ie LA_i1"></i>
                    </Link>
                  </span>)
                },
              ]}
              defaultPageSize={11}
              showPagination={false}
              sortable={false}
              TbodyComponent={CustomTbodyComponent}
              className="-striped -highlight"
            />
          </div>
          <Link className="btn-1 w-100" to={ROUTER_PATH + 'admin/crm/prospectiveparticipants'}>View All</Link>
        </div>
      </div>
    )
  }
}

class DueTasks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCol: '',
      data: [],
    }
  }
  crmParticipantDueTask = () => {
    postData('crm/Dashboard/crm_task_list_user', this.state).then((result) => {
      if (result.status) {
        this.setState({ data: result.data.data });

      } else {
        this.setState({ error: result.error });
      }
    });
  }
  componentWillMount() {
    this.crmParticipantDueTask();
  }
  render() {
    return (
      <div className="Req-Dashboard_tBL">
        <div className="PD_Al_div1">
          <div className="PD_Al_h_txt pt-3 lt_heads">Due Tasks: (Next 5 days)</div>
          <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">
            <ReactTable
              data={this.state.data}
              columns={[
                {
                  Header: "Task Name", accessor: "taskname",
                  headerClassName: 'hdrCls', className: (this.state.activeCol === 'name') ? 'borderCellCls' : 'T_align_m1'
                },
                {
                  Header: "Participant", accessor: "fullname",
                  headerClassName: 'hdrCls', className: (this.state.activeCol === 'status') ? 'borderCellCls' : 'T_align_m1'
                },
                {
                  Header: "Due Date", accessor: "duedate",
                  headerClassName: 'hdrCls', className: (this.state.activeCol === 'date') ? 'borderCellCls' : 'T_align_m1',
                  maxWidth: 120,
                },
                {
                  Header: "", headerStyle: { border: '0px solid #000' },
                  maxWidth: 55,
                  Cell: row => (<span className="PD_Al_icon justify-content-center"><Link to={ROUTER_PATH + 'admin/crm/tasks/' + row.original.task_id} title='View'><a><i className="icon icon-view2-ie LA_i1"></i></a></Link>
                  </span>)
                },
              ]}
              defaultPageSize={11}
              showPagination={false}
              sortable={false}
              TbodyComponent={CustomTbodyComponent}
              className="-striped -highlight"
            />
          </div>
          <Link className="btn-1 w-100" to={ROUTER_PATH + 'admin/crm/tasks'}>View All</Link>
        </div>
      </div>
    )
  }
}







const mapStateToProps = state => {
  return {
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,

  }
};
const mapDispatchtoProps = (dispach) => {
  return {
    allLatestUpdate: () => dispach(allLatestUpdate()),
  }
}
export default connect(mapStateToProps, mapDispatchtoProps)(Participantadmin);
