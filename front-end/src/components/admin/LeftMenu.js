import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { logout, postData, checkLoginWithReturnTrueFalse, getFullName, setPermission,checkLoginModule, pinHtml, check_loginTime } from 'service/common.js';
import { connect } from 'react-redux'
import PinModal from './PinModal';
import { setPermissions } from '../../actions/PermissionAction';
import {DashboardPageTitle} from 'menujson/pagetitle_json';
import {ROUTER_PATH} from 'config.js';
import GlobalMenu from './GlobalMenu';
import { css } from '../../service/common';
import './scss/components/admin/LeftMenu.scss'

class LeftMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expandMenu: true,
        }
    }

    closeModal=()=>
    {
        this.setState({pinModalOpen:false})
    }

    DisplayCurrentTime = (type) => {
        var date = new Date();
        if (type == 'time') {
            var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
            var am_pm = date.getHours() >= 12 ? "pm" : "am";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
            var time = hours + ":" + minutes + " " + am_pm;
            return time;
        } else {
            var date = new Date().getDate();
            var month = new Date().getMonth() + 1;
            var year = new Date().getFullYear();

            var dateCUrrent = date + '/' + month + '/' + year;
            return dateCUrrent;
        }
    }

    logout = () => {
        logout();
    }

    componentDidMount() {
        setInterval(() => {
            check_loginTime();
            this.setState({
                curDate: this.DisplayCurrentTime('date'),
                curTime: this.DisplayCurrentTime('time')
            })
        }, 10000)
    }

    expandMenu = (e, type) => {
        var state = {}
        if (this.state[type]) {
            state[type] = false;
        } else {
            state[type] = true;
        }
        this.setState(state);
    }

    /**
     * Renders the top level menus and submenus.
     * This menu is NOT collapsible
     */
    renderMenu() {
        return <GlobalMenu {...this.props}/>
    }

    /**
     * Old way of rendering colorful module circles.
     */
    renderMenuOld() {
        return (
            <div className="nav_apps text-left">
                {this.props.permissions.access_organization ? <div><Link title={DashboardPageTitle.organisation_app} to={ROUTER_PATH+'admin/organisation/dashboard'}><span className="add_access o-colr">O</span></Link></div> : ''}
                {this.props.permissions.access_fms ? <div><Link title={DashboardPageTitle.fms_app} to={ROUTER_PATH+'admin/fms/dashboard/new/case_ongoing'}><span className="add_access f-colr">F</span></Link></div> : ''}
                {this.props.permissions.access_imail ? <div><Link title={DashboardPageTitle.imail_app} to={ROUTER_PATH+'admin/imail/dashboard'}><span className="add_access i-colr">I</span></Link></div> : ''}
                {this.props.permissions.access_member ? <div><Link title={DashboardPageTitle.member_app} to={ROUTER_PATH+'admin/support_worker/dashboard'}><span className="add_access m-colr">M</span></Link></div> : ''}
                {this.props.permissions.access_schedule ? <div><Link title={DashboardPageTitle.schedule_app} to={ROUTER_PATH+'admin/schedule/unfilled/unfilled'}><span className="add_access s-colr">S</span></Link></div> : ''}
                {this.props.permissions.access_admin ? <div title={DashboardPageTitle.admin_app}>{pinHtml(this,'admin','leftmenu')}</div> : ''}
                {this.props.permissions.access_crm_admin ? <div><Link title={DashboardPageTitle.crm_admin_app} to={ROUTER_PATH+'admin/crm/participantadmin'}><span className="add_access c-colr">P</span></Link></div> : (this.props.permissions.access_crm)?<div><Link to={ROUTER_PATH+'admin/crm/participantuser'}><span className="add_access c-colr">C</span></Link></div>:''}
                {this.props.permissions.access_recruitment ? <div><Link title={DashboardPageTitle.recruitment_app} to={ROUTER_PATH+'admin/recruitment/applications'}><span className="add_access r-colr">R</span></Link></div> : ''}
                {this.props.permissions.access_finance ?<div><Link title={DashboardPageTitle.finance_app} to={ROUTER_PATH+'admin/finance/dashboard'}><span className="add_access finance-colr">F</span></Link></div> : ''}
                {/* <div><Link title={DashboardPageTitle.finance_app} to={ROUTER_PATH+'admin/helpdesk/enquiries'}><span className="add_access helpdesk-colr">H</span></Link></div> */}
            </div>
        )
    }

    /**
     * Render 'Your apps' section containing old menus. 
     * This menu is collapsible
     */
    renderYourApps() {
        return (
            <>
                <button className={'collapsible ' + ((this.state.expandMenu) ? 'active_side_toggle collapsed_me' : '')} onClick={(e) => this.expandMenu(e, 'expandMenu')}>Your Apps</button>
                <div className={'side_dropdown ' + ((this.state.expandMenu) ? 'mx-height' : '')}>
                    { this.renderMenuOld() }
                </div>
            </>
        )
    }

    /**
     * Render 'settings' menus
     */
    renderYourSettings() {
        return (
            <>
                <button className={'collapsible ' + ((this.state.setting) ? 'active_side_toggle collapsed_me' : '')} onClick={(e) => this.expandMenu(e, 'setting')}>Your Settings</button>
                <div className={'side_dropdown ' + ((this.state.setting) ? 'mx-height' : '')}>
                    <ul className="your_setting_list">
                        <li><Link to="/admin/update_password">Update Your Password</Link></li>
                        {(this.props.permissions.access_admin || this.props.permissions.access_fms) ? <li><Link to="/admin/update_pin">Update your Restricted Area PIN</Link></li> : ''}
                        <li><Link to="/admin/update_password_recovery_email">Update Password Recovery Email</Link></li>
                        {
                            this.props.permissions.access_admin && (
                                <li title={`Update configurations used by HCM to connect to external service providers.`}>
                                    <Link to="/admin/settings/api">Update API settings</Link>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </>
        )
    }


    render() {
        const styles = css({
            leftMenuContent: {
                marginTop: 53,
                paddingBottom: 0,
                height: "calc(100% - 53px)",
            },
            scrollAreaParent: {
                height: 'calc(100vh - 118px)', // 53px top, 65px bottom
            },
            scrollArea: {
                height: '100%',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch', // ios momentum scroll
            },
        })

        return (
            <React.Fragment>
            <div className="navbar-my navbar-inverse-my navbar-fixed-top" id="sidebar-wrapper" role="navigation">
                <h3 className="active_user"><Link to="/admin/dashboard">{getFullName()}</Link></h3>
                <div className="left_menu_content left_men_content_2v" style={styles.leftMenuContent}>
                    <div className="cstmSCroll1 FScroll" style={styles.scrollAreaParent}> 
                        <div className="FScroll-inner" style={styles.scrollArea}>
                            {/* { this.renderYourApps() } */}
                            { this.renderYourSettings() }
                        </div>
                    </div>
                </div>

                <h3 className="active_user_new">
                    <div className="row">
                        <div className="col-xs-6">
                            <span className="w-100 d-block">{this.state.curTime}</span>
                            <span className="w-100 d-block">{this.state.curDate}</span>
                        </div>
                        <div className="col-xs-6 text-right">
                            <span className="w-100 d-block">
                                <button onClick={this.logout} className="default_but_remove"><i onClick={this.logout} className="icon icon-back-arrow"></i>Logout</button>
                            </span>
                        </div>
                    </div>
                </h3>

            </div>

                <PinModal
                    color={this.state.color}
                    moduleHed={this.state.moduleHed}
                    pinType={this.state.pinType}
                    modal_show={this.state.pinModalOpen}
                    returnUrl={this.state.returnUrl}
                    closeModal={this.closeModal}
                />
            </React.Fragment>

        )
    }
}

const mapStateToProps = state => ({
    permissions: state.Permission.AllPermission,
})

const mapDispatchtoProps = (dispach) => {
    return {
        setPermissionRole: (permission) => dispach(setPermissions(permission)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(LeftMenu)
