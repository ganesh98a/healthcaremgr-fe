import React, { Component } from 'react';

import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import DashboardAdmin from './pages/dashboard/Participantadmin';
import NewParticipant from './pages/Participants/CreateParticipant/CreateParticipant';
import DashboardUser from './pages/dashboard/ParticipantUser';
import ParticipantDetails from './pages/Participants/ParticipantDetails';
import ProspectiveParticipants from './pages/Participants/ProspectiveParticipants';
import RejectedParticipants from './pages/Participants/RejectedParticipants';
import Participantability from './pages/Participants/Participantability';
import Reporting from './pages/Reporting/Reporting';
import Schedules from './pages/Schedules/Schedules';
// import FundingDetails from './pages/Participants/ProspectiveParticipantFunding';
// import Shifts from '../../admin/crm/Shifts';
import Tasks from './pages/Schedules/Tasks/Tasks';
import LocationAnalytics from './pages/Reporting/LocationAnalytics';
import UserMangement from './pages/Usermanagement/UserMangement';
// import Departments from './pages/oldPages/Departments';
import StaffDetails from './pages/Usermanagement/StaffDetails';
import ProspectiveParticipantFunding from './pages/Participants/ProspectiveParticipantFunding';
// import CRMDashboard from '../../admin/crm/Dashboard';
import ServiceAnalytics from './pages/Reporting/ServiceAnalytics';
import { setFooterColor } from '../../admin/notification/actions/NotificationAction.js';
import Sidebar from '../Sidebar';
import { checkItsNotLoggedIn, getPermission, checkLoginModule, pinHtml, postData } from 'service/common.js';
import { connect } from 'react-redux'
import { crmJson, crmLinkHideShowSubmenus } from 'menujson/crm_menu_json';
import { setSubmenuShow } from 'components/admin/actions/SidebarAction';
import Createshift from './pages/Participants/Createshift';
import Editshift from './pages/Participants/Editshift';
import CreateOpportunity from './pages/opportunity/CreateOpportunity';
import ListingOpportunity from './pages/opportunity/ListingOpportunity';
import ViewOpportunity from './pages/opportunity/ViewOpportunity';
// import CreateContact from './pages/contact/CreateContact';
import ViewContact from './pages/contact/View/ViewContact';
import ListContact from './pages/contact/ListContact';
import ImportCsvContact from './pages/contact/ImportCsvContact';
import ImportCsvOrganistaion from './pages/account/ImportCsvOrganistaion';
import ListingNeedAssessment from './pages/needassessment/ListingNeedAssessment';
import ViewNeedAssessment from './pages/needassessment/ViewNeedAssessment';

// import CreateAccount from './pages/account/CreateAccount';
import ListAccount from './pages/account/ListAccount';
import ListChildOrg from './pages/account/ListChildOrg';
import ListChildSites from './pages/account/ListChildSites';
import ListChildContacts from './pages/account/ListChildContacts';
import ListChildAccounts from './pages/contact/View/ListChildAccounts';
import ViewAccount from './pages/account/ViewAccount';
import ListRiskAssessment from './pages/RiskAssessment/ListRiskAssessment';
import RiskAssessmentDetails from './pages/RiskAssessment/RiskAssessmentDetails';
import ListTask from './pages/Task/ListTask';
import ViewTask from './pages/Task/View/ViewTask';

import 'react-table/react-table.css';
import 'react-select-plus/dist/react-select-plus.css';
import ServiceAgreementDoc from './pages/ServiceAgreementDoc/ServiceAgreementDoc.js';
import { ParticipantIntakeMenu } from '../GlobalMenu.jsx';
import { css } from '../../../service/common.js';
import Leads from './pages/sales/Leads'

import '../../../symbols.svg'

import "../scss/sales_force_css.scss";
import OpportunityDetails from './pages/opportunity/OpportunityDetails.jsx';
import LeadDetails from './pages/sales/LeadDetails.jsx'
import ServiceAgreements from './pages/ServiceAgreementDoc/ServiceAgreements.jsx';
import ServiceAgreementDetails from './pages/ServiceAgreementDoc/ServiceAgreementDetails.jsx';
import AccountMembersList from './pages/account/AccountMembersList.jsx';

const menuJson = () => {
  let menu = crmJson;
  return menu;
}
let cssLoaded = false;

class AppCrm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pinModalOpen: false,
      permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),
      subMenuShowStatus: true,
      menus: menuJson(),
      replaceData: { ':id': (props.participaintDetails.hasOwnProperty('id') ? props.participaintDetails.id:0),':staffId':(props.staffDetails.hasOwnProperty('id') ? props.staffDetails.id:0) },
      permission_redirect: false,
      showMobNav: false
    }
    checkItsNotLoggedIn();

  }

  componentWillUnmount() {
    this.props.setFooterColor('');
  }

  componentDidMount() {
    this.permissionRediect();
    this.props.setSubmenuShow(1);
    this.props.setFooterColor('Crm');
    if (cssLoaded === false) {
      cssLoaded = true;
    }
    setTimeout(() => { this.setState({ loadState: false }) }, 1000)
  }

  permissionRediect = () => {
    return postData('crm/CrmStaff/get_user_access_permission', { permission: this.state.permissions }).then((json) => {
      if (!json.status) {
        //console.log(!json.status)
        this.setState({ permission_redirect: true })
      }
    });
  }

  getObjectValue(obj) {
    let objectDataReturn = {};
    let menuState = obj.state.menus;
    let datasubmenu = crmLinkHideShowSubmenus;
    var i;
    if (!this.state.permissions.access_crm_admin) {
      for (var i = menuState.length - 1; i >= 0; i--) {
        if (menuState[i].id === 'crm_user' || menuState[i].id === 'crm_reports' || menuState[i].id === 'crm_admin_dashboard') {
          menuState.splice(i, 1);
        }
      }
    } else {
      for (var i = menuState.length - 1; i >= 0; i--) {
        if (menuState[i].id === 'crm_user_dashboard') {
          menuState.splice(i, 1);
        }
      }
    }

    for (i in datasubmenu) {
      let objdata = menuState.find(x => x.id == i);
      let objIndex = menuState.indexOf(objdata);
      objectDataReturn[i + 'Index'] = objIndex;
      for (var z in datasubmenu[i]) {
        let objIndexSubmenu = '';
        let objIndexSubmenuIndex = "-1";
        let objIndexSubSubmenuLinkHide = "-1";
        if (objIndex > -1) {
          objIndexSubmenu = menuState[objIndex]['submenus'].find(x => x.id == z);
          objIndexSubmenuIndex = menuState[objIndex]['submenus'].indexOf(objIndexSubmenu);
          //console.log(objIndexSubmenuIndex);
          if (objIndexSubmenuIndex > -1) {
            let objIndexSubSubmenu = menuState[objIndex]['submenus'][objIndexSubmenuIndex]['subSubMenu'].find(x => x.id == datasubmenu[i][z]);
            objIndexSubSubmenuLinkHide = menuState[objIndex]['submenus'][objIndexSubmenuIndex]['subSubMenu'].indexOf(objIndexSubSubmenu);
          }
        }
        objectDataReturn[z + 'Index'] = objIndexSubmenuIndex;
        objectDataReturn[z + 'LinkHide'] = objIndexSubSubmenuLinkHide;

      }
    }
    return objectDataReturn;
  }

  allSubSubMenuLinkHide(menuStateData, dataIndex) {
    let datasubmenu = crmLinkHideShowSubmenus;
    for (var i in datasubmenu) {
      for (var z in datasubmenu[i]) {
        if (dataIndex[i + 'Index'] > -1 && dataIndex[z + 'Index'] > -1 && dataIndex[z + 'LinkHide'] > -1) {
          menuStateData[dataIndex[i + 'Index']]['submenus'][dataIndex[z + 'Index']]['subSubMenu'][dataIndex[z + 'LinkHide']]['linkOnlyHide'] = true;
        }
      }
    }

    return menuStateData;
  }

  showSubSubMenuLinkSpecific(menuStateData, dataIndex, submenuIndex, nameData) {
    let datasubmenu = crmLinkHideShowSubmenus;
    for (var i in datasubmenu) {
      for (var z in datasubmenu[i]) {
        if (dataIndex[i + 'Index'] > -1 && dataIndex[z + 'Index'] > -1 && dataIndex[z + 'LinkHide'] > -1 && submenuIndex == z) {
          menuStateData[dataIndex[i + 'Index']]['submenus'][dataIndex[z + 'Index']]['subSubMenu'][dataIndex[z + 'LinkHide']]['linkOnlyHide'] = false;
          menuStateData[dataIndex[i + 'Index']]['submenus'][dataIndex[z + 'Index']]['subSubMenu'][dataIndex[z + 'LinkHide']]['name'] = nameData;
        }
      }
    }

    return menuStateData;
  }


  componentWillReceiveProps(nextProps) {

    let linkShowParticipant = ['participant_details', 'participant_ability', 'participant_shift', 'prospective_participant_funding'];
    if (this.props.participaintDetails.id != nextProps.participaintDetails.id || this.props.staffDetails.id != nextProps.staffDetails.id) {

      let dataIndex = this.getObjectValue(this);
      this.setState({ replaceData: { ':id': nextProps.participaintDetails.id, ':staffId': nextProps.staffDetails.id } }, () => {
        let menuState = this.state.menus;
        menuState = this.allSubSubMenuLinkHide(menuState, dataIndex)

        let objMatchCond = nextProps.participaintDetails.booking_status == 5 ? 'crm_participant_details1' : 'crm_participant_details';
        let obj = menuState.find(x => x.id === objMatchCond);
        let objIndex = menuState.indexOf(obj);
        if (nextProps.participaintDetails.booking_status == 5) {
          let obj = menuState.find(x => x.id === 'crm_participant_details');
          let objIndex = menuState.indexOf(obj);
          menuState[objIndex]['linkShow'] = false;
        }
        else {
          let obj = menuState.find(x => x.id === 'crm_participant_details1');
          let objIndex = menuState.indexOf(obj);
          menuState[objIndex]['linkShow'] = false;
        }
        if (objIndex > -1 && nextProps.getSidebarMenuShow.subMenuShow) {
          if (linkShowParticipant.indexOf(nextProps.showTypePage) > -1) {
            menuState[objIndex]['linkShow'] = true;
            menuState[objIndex]['name'] = nextProps.participaintDetails.FullName;
          } else if (nextProps.showTypePage == 'user_staff_members_details') {
            menuState = this.showSubSubMenuLinkSpecific(menuState, dataIndex, 'staff_member', 'Staff Details -' + nextProps.staffDetails.id)
          } else {
            menuState[objIndex]['linkShow'] = false;
          }
        }

        this.setState({ menus: menuState });
      });
    }

    if (this.props.showTypePage != nextProps.showTypePage) {
      let menuState = this.state.menus;
      let dataIndex = this.getObjectValue(this);
      menuState = this.allSubSubMenuLinkHide(menuState, dataIndex)

      let objMatchCond = nextProps.participaintDetails.booking_status == 5 ? 'crm_participant_details1' : 'crm_participant_details';
      let obj = menuState.find(x => x.id === objMatchCond);
      let objIndex = menuState.indexOf(obj);
      if (nextProps.participaintDetails.booking_status == 5) {
        let obj = menuState.find(x => x.id === 'crm_participant_details');
        let objIndex = menuState.indexOf(obj);
        if (objIndex > -1) {
          menuState[objIndex]['linkShow'] = false;
        }        
      }
      else {
        let obj = menuState.find(x => x.id === 'crm_participant_details1');
        let objIndex = menuState.indexOf(obj);
        if (objIndex > -1) {
          menuState[objIndex]['linkShow'] = false;
        }
      }
      if (objIndex > -1 && nextProps.getSidebarMenuShow.subMenuShow) {
        if (linkShowParticipant.indexOf(nextProps.showTypePage) > -1) {
          menuState[objIndex]['linkShow'] = true;
          menuState[objIndex]['name'] = nextProps.participaintDetails.FullName;
        } else if (nextProps.showTypePage == 'user_staff_members_details') {
          menuState = this.showSubSubMenuLinkSpecific(menuState, dataIndex, 'staff_member', 'Staff Details -' + nextProps.staffDetails.id)
        }
        else {
          menuState[objIndex]['linkShow'] = false;
        }
      }
      this.setState({ menus: menuState });
    }

  }

  toggleNavbar = (key = null) => {

    if (key == 'openMenu') {
        this.setState({
            showMobNav: true
        })
    } else {
        this.setState({
            showMobNav: false
        })
    }

}

  /**
   * Renders participant intake module submenus
   */
    renderParticipantIntakeMenu() {
        return (
            <ParticipantIntakeMenu>
                <Sidebar
                    heading={'Participant Intake'}
                    menus={this.state.menus}
                    subMenuShowStatus={this.state.subMenuShowStatus}
                    replacePropsData={this.state.replaceData}
                    renderMenusOnly
                />
            </ParticipantIntakeMenu>
        )
    }

  render() {
    const styles = css({
      asideSect__: {
        background: 'none',
        paddingLeft: 'initial',
      }
    })

    if (this.state.permission_redirect)
      return <Redirect to={ROUTER_PATH + 'admin/no_access'} />;
    return (

      <React.Fragment>
        <img src={'/assets/icons/utility-sprite/svg/symbols.svg'} style={{ display: 'none' }}/>

      <section className={'asideSect__ Crm ' + (this.state.showMobNav ? 'open_left_menu' : '')} style={styles.asideSect__}>
        { this.renderParticipantIntakeMenu() }
          <div className={this.state.loadState ? 'Rloader' : ''}></div>
          <div className="container-fluid fixed_size">
            <div className="row justify-content-center d-flex">

              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">



                <Switch>
                  {  // <Route exact path={ROUTER_PATH + 'admin/crm/dashboard'} render={(props) => <Dashboard props={props} />} />
                  }
                  <Route exact path={ROUTER_PATH + 'admin/crm/participantadmin'} render={(props) => <DashboardAdmin props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/createParticipant'} render={(props) => <NewParticipant props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/participantuser'} render={(props) => <DashboardUser props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/editProspectiveParticipant/:id'} render={(props) => <NewParticipant props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/participantdetails/:id'} render={(props) => <ParticipantDetails props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/prospectiveparticipants'} render={(props) => <ProspectiveParticipants props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/rejectedparticipants'} render={(props) => <RejectedParticipants props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/participantability/:id'} render={(props) => <Participantability props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/reporting'} render={(props) => <Reporting props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/schedules'} render={(props) => <Schedules props={props} />} />
                  {/* <Route exact path={ROUTER_PATH + 'admin/crm/fundingdetails/:id'} render={(props) => <FundingDetails props={props} />} /> */}
                  <Route exact path={ROUTER_PATH + 'admin/crm/tasks'} render={(props) => <Tasks props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/tasks/:id'} render={(props) => <Tasks props={props} />} />
                  {// <Route exact path={ROUTER_PATH + 'admin/crm/shifts/:id'} render={(props) => <Shifts props={props} />} />
                  }  <Route exact path={ROUTER_PATH + 'admin/crm/locationanalytics'} render={(props) => <LocationAnalytics props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/usermangement'} render={(props) => <UserMangement props={props} />} />
                  {/* <Route exact path={ROUTER_PATH + 'admin/crm/departments'} render={(props) => <Departments props={props} />} /> */}
                  <Route exact path={ROUTER_PATH + 'admin/crm/staffdetails/:id'} render={(props) => <StaffDetails props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/serviceanalytics'} render={(props) => <ServiceAnalytics props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/fundingdetails/:id'} render={(props) => <ProspectiveParticipantFunding props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/shifts/:id'} render={(props) => <Createshift props={props} />} />

                  <Route exact path={ROUTER_PATH + 'admin/crm/serviceagreements'} render={(props) => <ServiceAgreements props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/serviceagreements/:id'} render={(props) => <ServiceAgreementDetails props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/service_agreement_doc'} render={(props) => <ServiceAgreementDoc props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/shiftdetails/:id'} render={(props) => <Editshift props={props} />} />

                  <Route exact path={ROUTER_PATH + 'admin/crm/leads'} render={(props) => <Leads props={props}/>} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/leads/:id'} render={(props) => <LeadDetails props={props}/>} />

                  <Route exact path={ROUTER_PATH + 'admin/crm/opportunity/create'} render={(props) => <CreateOpportunity props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/opportunity/listing'} render={(props) => <ListingOpportunity props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/opportunity/:id'} render={(props) => <OpportunityDetails props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/opportunity/detail/:id'} render={(props) => <ViewOpportunity {...props} />} />
                  {/* <Route exact path={ROUTER_PATH + 'admin/crm/contact/create'} render={(props) => <CreateContact props={props} />} /> */}
                  <Route exact path={ROUTER_PATH + 'admin/crm/contact/details/:id'} render={(props) => <ViewContact {...props} key={props.match.params.id} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/contact/listing'} render={(props) => <ListContact props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/contacts/import'} render={(props) => <ImportCsvContact props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/needassessment/listing'} render={(props) => <ListingNeedAssessment props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/needassessment/:id'} render={(props) => <ViewNeedAssessment {...props} />} />

                 
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/listing'} render={(props) => <ListAccount props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/listing/hierarchy/:id'} render={(props) => <ListChildOrg {...props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/contact/related-listing/:type/:id'} render={(props) => <ListChildContacts {...props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/related-listing/:is_site/:id'} render={(props) => <ListChildAccounts {...props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/listing/sitehierarchy/:id'} render={(props) => <ListChildSites {...props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/importorginsation'} render={(props) => <ImportCsvOrganistaion props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/details/:id'} render={(props) => <ViewAccount {...props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/organisation/support_worker/:id'} render={(props) => <AccountMembersList {...props} key={props.match.params.id} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/riskassessment/listing'} render={(props) => <ListRiskAssessment props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/riskassessment/details/:id'} render={(props) => <RiskAssessmentDetails props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/task/listing'} render={(props) => <ListTask props={props} />} />
                  <Route exact path={ROUTER_PATH + 'admin/crm/task/details/:id'} render={(props) => <ViewTask {...props} key={props.match.params.id} />} />


                </Switch>
              </div>

            </div>
          </div>
        
      </section>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  getSidebarMenuShow: state.sidebarData,
  showTypePage: state.DepartmentReducer.activePage.pageType,
  participaintDetails: state.DepartmentReducer.participaint_details,
  staffDetails: state.DepartmentReducer.staff_details,

})

const mapDispatchtoProps = (dispach) => {
  return {
    setFooterColor: (result) => dispach(setFooterColor(result)),
    setSubmenuShow: (result) => dispach(setSubmenuShow(result))
  }
}

const AppCrmData = connect(mapStateToProps, mapDispatchtoProps)(AppCrm)
export { AppCrmData as AppCrm };
