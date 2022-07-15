import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';
import "../src/components/admin/scss/main-style.scss";
import 'simplebar/dist/simplebar.min.css';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loadable from 'react-loadable';
import {BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL } from './config.js';
import { checkItsNotLoggedIn, checkLoginWithReturnTrueFalse } from 'service/common.js';
import { setNotificationToggel } from './components/admin/notification/actions/NotificationAction.js';
import { osName} from 'react-device-detect';

import PermissionError from './components/admin/PermissionError';
import PageNotFound from './components/admin/PageNotFound';
import Login from './components/admin/Login';
import Forgot_password from './components/admin/Forgot_password';
import GeneratePassword from './components/admin/PasswordAndPin';
import Reset_password from './components/admin/Reset_password';
import ForgotResetPin from './components/admin/ForgotResetPin';
import {Loading} from './components/admin/externl_component/Loading';

import OnlineAssessment from './components/admin/OnlineAssessment';

import UpdatePassword from './components/admin/UpdatePassword';
import UpdateRestrictedAreaPIN from './components/admin/UpdateRestrictedAreaPIN';
import UpdatePasswordRecoveryEmail from './components/admin/UpdatePasswordRecoveryEmail';
import VerifyEmailConfirmation from './components/admin/VerifyEmailConfirmation';
import SettingsApi from './components/admin/SettingsApi'
import VerifyTaskConfirmationByEmail from './components/admin/recruitment/action_task/VerifyTaskConfirmationByEmail';

import AdminDashboard from './components/admin/AdminDashboard';
import moment from 'moment-timezone';

import {getPermission} from './service/common';
import LeftMenu from './components/admin/LeftMenu';
import RightMenu from './components/admin/RightMenu';
import ErrorBoundary from 'service/ErrorBoundary';

import "react-datepicker/dist/react-datepicker.css";


/* Organisation component */
import OrganisationDashboard from './components/admin/organisation/OrganisationDashboard';
import OrganisationCreate from './components/admin/organisation/OrganisationCreate';
import OrganisationViewInvoice from './components/admin/organisation/OrganisationViewInvoice';

/* Notification component */
import ListNotification from './components/admin/notification/ListNotification';

/* member component*/
// import Member from './components/admin/member/Member';

import AppHelpDesk from './components/admin/help_desk/AppHelpdesk';
import AppItem from './components/admin/item/AppItem.jsx';

import Header from './components/admin/Header';
import Footer from './components/admin/Footer';
import GlobalMenu from './components/admin/GlobalMenu';
import $ from 'jquery'
import HelpDashboard from './components/admin/help/HelpDashboard';
import ImportCMSContent from './components/admin/help/ImportCMSContent';
import CommonDocumentDownload from "./components/admin/CommonDocumentDownload";

/*
 *  Admin Dashboard import
 */
const AppUser = Loadable({
    loader: () => import('./components/admin/user/AppUser').then(object => object.AppUser),
    loading: Loading
});

/*
 * participant
 */
const AppParticipant = Loadable({
    loader: () => import('./components/admin/participant/AppParticipant').then(object => object.AppParticipant),
    loading: Loading
});


/*
 *   Schedule module
 */
const AppSchedule = Loadable({
    loader: () => import('./components/admin/schedule/AppSchedule').then(object => object.AppSchedule),
    loading: Loading
});

/*
 *
 * Mail module
 */
const AppImail = Loadable({
    loader: () => import('./components/admin/imail/AppImail').then(object => object.AppImail),
    loading: Loading
});

/*
* FMS module
*/
const AppFms = Loadable({
    loader: () => import('./components/admin/fms/AppFms').then(object => object.AppFms),
    loading: Loading
});

/*
* Crm module
*/
const AppCrm = Loadable({
    loader: () => import('./components/admin/crm/AppCrm').then(object => object.AppCrm),
    loading: Loading
});


/*
 *  Organizaion module
 */
const AppOrganisation = Loadable({
    loader: () => import('./components/admin/organisation/AppOrganisation').then(object => object.AppOrganisation),
    loading: Loading
});

/*
 *  house module
 */
const AppHouse = Loadable({
    loader: () => import('./components/admin/house/AppHouse').then(object => object.AppHouse),
    loading: Loading
});

/*
 *  member module
 */
const AppMember = Loadable({
    loader: () => import('./components/admin/member/AppMember').then(object => object.AppMember),
    loading: Loading
});

/*
* Recruitment module
*/
const AppRecruitment = Loadable({
    loader: () => import('./components/admin/recruitment/AppRecruitment').then(object => object.AppRecruitment),
    loading: Loading,
    // delay: 30000
});

/*
* Finance module
*/
const AppFinance = Loadable({
    loader: () => import('./components/admin/finance/AppFinance').then(object => object.AppFinance),
    loading: Loading,
    // delay: 30000
});

/*
 *  User Help import
 */
const AppHelp = Loadable({
    loader: () => import('./components/admin/help/AppHelp').then(object => object.AppHelp),
    loading: Loading
});
/*
 * App item
 */
// const AppItem = Loadable({
//     loader: () => import('./components/admin/item/AppItem').then(object => object.AppItem),
//     loading: Loading
// });

moment.tz.setDefault('Australia/Melbourne');

class App extends Component {
    constructor(props) {
          super(props);

          this.permission = (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? [] : JSON.parse(getPermission())):[];
          this.state = {
              isLeftInnerSidebarOpen: false,

          }
    }

    permissionRediect = () => {
        if(!checkLoginWithReturnTrueFalse()){
             return <Redirect to={ROUTER_PATH} />;
        }else{
            return <Redirect to={ROUTER_PATH+'admin/no_access'} />;
        }
        checkItsNotLoggedIn();
    }

    renderMobileToggleMenu() {
        return (
            <div id='SidebarTogglerParent'>
                <span id="PushMenuCloseOverlay" onClick={() => this.setState({ isLeftInnerSidebarOpen: false })}></span>
                <button
                    type="button"
                    className="btn"
                    onClick={() => this.setState(p => ({ isLeftInnerSidebarOpen: !p.isLeftInnerSidebarOpen }))}
                >
                    <i className="icon icon-menu"></i>
                </button>
            </div>
        )
    }


    renderPushMenu() {
        const { AllPermission } = this.props

        return (
            <div id="GlobalMenuParent" class="hidemenuleft">
                <GlobalMenu permissions={AllPermission} />
            </div>
        )
    }

    render() {
        var myStyle = '';
        if(osName !=='Windows'){
            myStyle = {fontFamily: "Helvetica Neue"};
            // myStyle = {fontFamily: 'cursive'};
        }
        else {
            myStyle = {fontFamily: "Helvetica LT Std-1"};
        }

        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        const { isLeftInnerSidebarOpen } = this.state
        const isLoggedIn = checkLoginWithReturnTrueFalse()
        let checkstr = window.location.href;
        let  showHeader = checkstr.includes('reset_password') || checkstr.includes('generate_password') ? false: true;
        const pageContentWrapperClassName = [isLeftInnerSidebarOpen && `open`, isLoggedIn ? `is-logged-in` : `is-guest`].filter(Boolean).join(' ')

        return (
                <ErrorBoundary>
                <div id="wrapper" data-color="#00a7ee" style={myStyle} className={((this.props.RightMenuOpen ? "toggled_new" : '' ) + (this.props.LeftMenuOpen ? "toggled" : ''))} >
                    <div className="overlay_bg" onClick={() => this.props.sideBarclose({LeftMenuOpen: false, RightMenuOpen: false})}></div>

                        <Router >
                            <React.Fragment>
                            {(checkLoginWithReturnTrueFalse() && this.props.showHeaderFooter && showHeader)?
                                <React.Fragment>
                                <input type="hidden" id="checkLoginStikcy" value={isLoggedIn} />

                                     <div id="navbarheader" class="topnavbar"><Header/>

                                     </div>

                                    <LeftMenu />
                                    <RightMenu />
                                </React.Fragment>:''
                            }


                            <div id="page-content-wrapper" className={pageContentWrapperClassName}>
                                { this.renderMobileToggleMenu() }
                                <div id="page-content-wrapper-inner">
                                    { isLoggedIn && this.props.showHeaderFooter && this.renderPushMenu() }
                                    <Switch>
                                        <Route exact path={'/'} render={() => <Login auth={this.props} />}  />
                                        <Route exact path={'/something_went_wrong'} render={() => <ErrorBoundary />}  />
                                        <Route exact path={ROUTER_PATH+'forgot_password'}  component={Forgot_password} />
                                        <Route exact path={ROUTER_PATH+'generate_password/:id/:token/:dateTime'}  component={GeneratePassword} />
                                        <Route exact path={ROUTER_PATH+'forgot_reset_pin/:id/:token/:dateTime'}  component={ForgotResetPin} />
                                        <Route path={ROUTER_PATH+'reset_password/:id/:token/:dateTime/:type/:uuid_user_type'} component={Reset_password}  />
                                        <Route exact path={'/admin/update_password'} render={(props) =>  checkLoginWithReturnTrueFalse() ? <UpdatePassword props={props} /> : this.permissionRediect()} />
                                        <Route exact path={'/admin/update_pin'} render={(props) => (this.permission.access_admin  || this.permission.access_fms) ? <UpdateRestrictedAreaPIN props={props} />: this.permissionRediect() } />
                                        <Route exact path={'/admin/update_password_recovery_email'} render={(props) =>  checkLoginWithReturnTrueFalse() ? <UpdatePasswordRecoveryEmail props={props} /> : this.permissionRediect()} />
                                        <Route exact path={'/admin/settings/api'} render={(props) =>  checkLoginWithReturnTrueFalse() ? <SettingsApi props={props} /> : this.permissionRediect()} />
                                        <Route exact path={'/admin/verify_email_update/:token'} component={VerifyEmailConfirmation} />

                                        <Route path={ROUTER_PATH+'admin/dashboard'}  render={(props ) => checkLoginWithReturnTrueFalse() ? <AdminDashboard props={props} />: this.permissionRediect()} />

                                        <Route exact path={ROUTER_PATH+'admin/notification'}  component={ListNotification} />

                                        /* admin user
                                        <Route path={ROUTER_PATH+'admin/user'} render={(props ) => this.permission.access_admin ? <AppUser props={props} /> : this.permissionRediect() }  />
                                        */
                                        <Route exact path={ROUTER_PATH+'onlineassessment/:uuid'}  component={OnlineAssessment} />
                                        /* participant section */
                                        <Route path={ROUTER_PATH+'admin/participant'} render={(props) => this.permission.access_participant ? <AppParticipant props={props} /> : this.permissionRediect() }    />
                                        /* end participant section */

                                        /*Member section Route Path*/
                                        <Route path={ROUTER_PATH+'admin/support_worker'} render={(props) => this.permission.access_member ? <AppMember props={props} /> : this.permissionRediect()}   />
                                        /* end Member */

                                        /* schdeule */
                                        <Route  path={ROUTER_PATH+'admin/schedule'} render={(props) => this.permission.access_schedule ? <AppSchedule props={props} /> : this.permissionRediect() } />
                                        /* end schedule */

                                        /* mail */
                                        <Route  path={ROUTER_PATH+'admin/imail'} render={(props) => this.permission.access_imail ? <AppImail props={props} /> : this.permissionRediect() } />
                                        /* end mail */

                                        /* Crm start */
                                        <Route path={ROUTER_PATH+'admin/crm'} render={(props) => this.permission.access_crm ? <AppCrm props={props} /> :(this.permission.access_crm_admin)? <AppCrm props={props}/>:this.permissionRediect()  }  />
                                        /* Crm end */

                                        /* FMS */
                                        <Route  path={ROUTER_PATH+'admin/fms'} render={(props) => this.permission.access_fms ? <AppFms props={props} /> : this.permissionRediect() } />
                                        /* end Fms */

                                        /* Organisation */
                                        {/* <Route exact path={ROUTER_PATH+'admin/organisation/createOrganisation'} render={(props) => this.permission.create_organization ?<OrganisationCreate props={props} /> : this.permissionRediect() } />  */}
                                        {/* <Route exact path={ROUTER_PATH+'admin/organisation/dashboard'} render={(props) => this.permission.access_organization ? <OrganisationDashboard props={props} /> : this.permissionRediect() } /> */}
                                        <Route exact path={ROUTER_PATH+'admin/organisation/createOrganisation'} render={(props) => this.permission.create_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/dashboard'} render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect() } />

                                        <Route exact path={ROUTER_PATH+'admin/organisation/overview/:id'}  render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()}   />
                                        <Route path={ROUTER_PATH+'admin/organisation/suborg/:id'}  render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()}   />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/sites/:id'}  render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()}   />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/contacts/:id'}  render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()}   />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/fms/:id'}  render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()}   />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/billing/:id'}  render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()}   />
                                        <Route exact path={ROUTER_PATH + 'admin/organisation/pending_request'} render={(props) => this.permission.access_organization ? <AppOrganisation props={props} /> : this.permissionRediect()} />

                                        <Route exact path={ROUTER_PATH + 'admin/organisation/view_invoice/:invoiceId'} render={(props) => this.permission.access_organization ? <OrganisationViewInvoice {...props} /> : this.permissionRediect()} />



                                        <Route exact path={ROUTER_PATH+'admin/organisation/overview/:id/:subOrgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/contacts/:id/:subOrgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/fms/:id/:subOrgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/sites/:id/:subOrgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />

                                        <Route exact path={ROUTER_PATH+'admin/organisation/site_about/:houseId/:orgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/site_contact/:houseId/:orgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/site_billing/:houseId/:orgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/site_docs/:houseId/:orgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        <Route exact path={ROUTER_PATH+'admin/organisation/site_fms/:houseId/:orgId'} render={(props) => this.permission.access_organization ?<AppOrganisation props={props} /> : this.permissionRediect() } />
                                        /* end Organisation */

                                        /*Recruitment*/
                                         <Route path={ROUTER_PATH+'admin/recruitment'} render={(props) => this.permission.access_recruitment ? <AppRecruitment props={props} /> : this.permissionRediect()}  />
                                         <Route exact path={'/task_confirmation/:token/:action(c|a)'} component={VerifyTaskConfirmationByEmail} />
                                        /*End Recruitment*/

                                        /*Finance*/
                                        <Route path={ROUTER_PATH+'admin/Finance'} render={(props) => this.permission.access_finance ? <AppFinance props={props} /> : this.permissionRediect()}  />
                                        /*Finance*/

                                        /*house start*/
                                        <Route path={ROUTER_PATH+'admin/house'} render={(props) => this.permission.access_organization ? <AppHouse props={props} /> : this.permissionRediect()}  />
                                        /*house end*/


                                        /*help_desk */
                                        <Route path={ROUTER_PATH+'admin/helpdesk'} render={(props) => <AppHelpDesk props={props} />}  />

                                        /* App Item start */
                                        <Route path={ROUTER_PATH+'admin/item'} render={(props) => <AppItem props={props} /> }  />
                                        /* App Item end */

                                        /* App Item start */
                                        <Route path={ROUTER_PATH+'admin/help/dashboard'} render={(props) => <HelpDashboard props={props} />} />
                                        <Route path={ROUTER_PATH+'admin/help/contentimport'} render={(props) => <ImportCMSContent props={props} />}  />
                                        /* App Item end */

                                        <Route path={COMMON_DOC_DOWNLOAD_URL +':module_id/'} render={(props) => <CommonDocumentDownload props={props} />}  />

                                        <Route path={'/admin/no_access'} component={PermissionError} />
                                        <Route path='*' component={PageNotFound}  />                                        
                                    </Switch>
                                </div>
                            </div>

                            {(checkLoginWithReturnTrueFalse())?
                                <Footer />:''
                            }
                            </React.Fragment>
                        </Router>
                        <ToastContainer />

                </div>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => ({
    RightMenuOpen : state.NotificationReducer.RightMenuOpen,
    LeftMenuOpen : state.NotificationReducer.LeftMenuOpen,
    NotificationType:state.NotificationReducer.NotificationType,
    showHeaderFooter : state.Permission.showHeaderFooter,
    AllPermission: state.Permission.AllPermission,
})

const mapDispatchtoProps = (dispach) => ({
    sideBarclose: (object) => dispach(setNotificationToggel(object)),
})

 //fixed header and side bar

 document.addEventListener('DOMContentLoaded', function() {
    var checkLogin = $('#checkLoginStikcy').val();
    if (window.location.href.indexOf("admin") > -1) {
    var div = $('#navbarheader');
    if(div.length == 0) {
        return;
    }
    var start = $(div).offset().top; //top header
    $.event.add(window, "scroll", function () {
        var p = $(window).scrollTop();
        $(div).css('position', ((p) > start) ? 'fixed' : 'static');
        $(div).css('top', ((p) > start) ? '0px' : '');
        $(div).css('background', ((p) > start) ? '#FFFFFF' : '');
        $(div).css('z-index', ((p) > start) ? '9' : '');
        $(div).css('width', ((p) > start) ? '100%' : '');
    });
}
});

export default connect(mapStateToProps, mapDispatchtoProps)(App);
