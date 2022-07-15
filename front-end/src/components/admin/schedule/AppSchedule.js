import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';

import { ROUTER_PATH, BASE_URL } from 'config.js';
import { checkItsNotLoggedIn, getPermission, postData, checkLoginWithReturnTrueFalse } from 'service/common.js';

import PageNotFound from '../../admin/PageNotFound';
import { connect } from 'react-redux'
import ScheduleList from './ScheduleList';
import ScheduleDetails from './ScheduleDetails';
import CreateRoster from '../../admin/schedule/CreateRoster/CreateRoster';
import AddShiftInRoster from '../../admin/schedule/CreateRoster/AddShiftInRoster';
import ActiveRoster from '../../admin/schedule/ActiveRoster';
import NewRequestRoster from '../../admin/schedule/NewRequestRoster';
import ArchivedDublicateRoster from '../../admin/schedule/ArchivedDublicateRoster';
import { setFooterColor } from '../../admin/notification/actions/NotificationAction.js';
import Sidebar from '../Sidebar';
import { scheduleJson, scheduleLinkHideShowSubmenus } from 'menujson/schedule_menu_json';
import { setSubmenuShow } from 'components/admin/actions/SidebarAction';
import CopyShiftsToRoster from '../../admin/schedule/CreateRoster/CopyShiftsToRoster'
import { SchedulesMenu as ScheduleNavMenu } from '../GlobalMenu'
import { css } from '../../../service/common';
import ScheduleMembersList from './ScheduleMembersList';
import ShiftSkillsList from './ShiftSkillsList';
import RosterList from './Roster/RosterList.jsx';
import RosterDetails from './Roster/RosterDetails.jsx';
import ActivityNotesList from '../../admin/Activity/ActivityNotesList.jsx';
import RosterShiftList from './Roster/shift/ShiftList.jsx';

const menuJson = () => {
    let menu = scheduleJson;
    return menu;
}
const permissionRediect = <Redirect to={ROUTER_PATH + 'admin/no_access'} />;



class AppSchedule extends React.Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.permission = (getPermission() == undefined) ? [] : JSON.parse(getPermission());
        this.state = {
            itLogIn: checkLoginWithReturnTrueFalse(),
            subMenuShowStatus: true,
            menus: menuJson(),
            replaceData: { ':id': 0 },
            showMobNav:false
        }
        this.props.setFooterColor('Schedule_Module');
    }

    componentWillUnmount() {
        this.props.setFooterColor('');
    }
    componentDidMount() {
        this.props.setSubmenuShow(1);
    }

    getObjectValue(obj) {
        let objectDataReturn = {};
        let menuState = obj.state.menus;

        let datasubmenu = scheduleLinkHideShowSubmenus;
        var i;
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
    allLinkHide(menuStateData, dataIndex) {
        let datasubmenu = scheduleLinkHideShowSubmenus;
        for (var i in datasubmenu) {
            for (var z in datasubmenu[i]) {
                if (dataIndex[i + 'Index'] > -1 && dataIndex[z + 'Index'] > -1 && dataIndex[z + 'LinkHide'] > -1) {
                    menuStateData[dataIndex[i + 'Index']]['submenus'][dataIndex[z + 'Index']]['subSubMenu'][dataIndex[z + 'LinkHide']]['linkOnlyHide'] = true;
                }
            }
        }

        return menuStateData;
    }

    showLinkSpecific(menuStateData, dataIndex, submenuIndex, nameData) {
        let datasubmenu = scheduleLinkHideShowSubmenus;
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
        if (nextProps.showTypePage != this.props.showTypePage && nextProps.showTypePage != 'schedule_details' && nextProps.showTypePage != 'roster_details') {
            let menuState = this.state.menus;
            let dataIndex = this.getObjectValue(this);
            menuState = this.allLinkHide(menuState, dataIndex);
            this.setState({ menus: menuState });
        }
        if ((this.props.scheduleShiftData.id != nextProps.scheduleShiftData.id) || (this.props.scheduleRosterData.id != nextProps.scheduleRosterData.id) || (nextProps.showTypePage != this.props.showTypePage && (nextProps.showTypePage == 'schedule_details' || nextProps.showTypePage == 'roster_details'))) {
            this.setState({ replaceData: { ':id': nextProps.scheduleShiftData.id, ':rosterId': nextProps.scheduleRosterData.id } }, () => {
                let menuState = this.state.menus;
                let dataIndex = this.getObjectValue(this);
                menuState = this.allLinkHide(menuState, dataIndex);
                if (nextProps.showTypePage == 'schedule_details') {
                    if (nextProps.scheduleShiftData.status != undefined && nextProps.scheduleShiftData.status == '1') {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'unfilled', 'Shift Id -' + nextProps.scheduleShiftData.id);
                    }
                    if (nextProps.scheduleShiftData.status != undefined && (nextProps.scheduleShiftData.status == '2' || nextProps.scheduleShiftData.status == '3')) {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'unconfirmed', 'Shift Id -' + nextProps.scheduleShiftData.id);
                    }
                    if (nextProps.scheduleShiftData.status != undefined && (nextProps.scheduleShiftData.status == '4' || nextProps.scheduleShiftData.status == '5')) {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'rejected', 'Shift Id -' + nextProps.scheduleShiftData.id);
                    }
                    if (nextProps.scheduleShiftData.status != undefined && nextProps.scheduleShiftData.status == '7') {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'filled', 'Shift Id -' + nextProps.scheduleShiftData.id);
                    }
                }
                if (nextProps.showTypePage == 'roster_details') {
                    if (nextProps.scheduleRosterData.status != undefined && nextProps.scheduleRosterData.status == '1') {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'active_roster', 'Roster Id -' + nextProps.scheduleRosterData.id);
                    }

                    if (nextProps.scheduleRosterData.status != undefined && nextProps.scheduleRosterData.status == '2') {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'new_roster', 'Roster Id -' + nextProps.scheduleRosterData.id);
                    }

                    if (nextProps.scheduleRosterData.status != undefined && nextProps.scheduleRosterData.status == '5') {
                        menuState = this.showLinkSpecific(menuState, dataIndex, 'archived_roster', 'Roster Id -' + nextProps.scheduleRosterData.id);
                    }

                }

                this.setState({ menus: menuState });
            });
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
     * Renders submenus of schedule module on the left sidebar.
     * Submenus will only show when browsing this module
     */
    renderScheduleModuleMenus() {
        return (
            <ScheduleNavMenu>
               <Sidebar
                    heading={'Schedules'}
                    menus={this.state.menus}
                    subMenuShowStatus={this.state.subMenuShowStatus}
                    replacePropsData={this.state.replaceData}
                    renderMenusOnly
                /> 
            </ScheduleNavMenu>
        )
    }


    render() {
        const styles = css({
            asideSect__: {
                paddingLeft: 'initial',
            }
        })

        return (
            <React.Fragment>
            <section className={'asideSect__ manage_top  Schedule_Module ' +  (this.state.showMobNav ? 'open_left_menu' : '')} style={styles.asideSect__}>
                { this.renderScheduleModuleMenus() }
                <link rel="stylesheet" href={'/assets/css/data_table.css'} />
                <div className="container-fluid fixed_size">
                    <div className="row justify-content-center d-flex">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                            <Switch>
                                <Route exact path={ROUTER_PATH + 'admin/schedule/roster/list'} render={(props) => this.permission.access_schedule ? <RosterList props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/roster/:id'} render={(props) => this.permission.access_schedule ? <RosterDetails {...props} key={props.match.params.id} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/list'} render={(props) => this.permission.access_schedule ? <ScheduleList props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/details/:id'} render={(props) => this.permission.access_schedule ? <ScheduleDetails props={props} /> : permissionRediect} />

                                <Route exact path={ROUTER_PATH + 'admin/schedule/support_worker/:id'} render={(props) => this.permission.access_schedule ? <ScheduleMembersList {...props} key={props.match.params.id} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/create_roster'} render={(props) => this.permission.access_schedule ? <CreateRoster {...props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/add_shift_in_roster'} render={(props) => this.permission.access_schedule ? <AddShiftInRoster props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/add_shift_in_roster/:roster_shiftId'} render={(props) => this.permission.access_schedule ? <AddShiftInRoster props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/active_roster/:page?'} render={(props) => this.permission.access_schedule ? <ActiveRoster props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/new_request'} render={(props) => this.permission.access_schedule ? <NewRequestRoster props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/archived_roster/:page?'} render={(props) => this.permission.access_schedule ? <ArchivedDublicateRoster props={props} /> : permissionRediect} />
                                <Route exact path={ROUTER_PATH + 'admin/schedule/roster_details/:id'} render={(props) => this.permission.access_schedule ? <CreateRoster {...props} /> : permissionRediect} />
                               
                                <Route exact path={ROUTER_PATH + 'admin/schedule/copy_shifts_to_roster'} render={(props) => this.permission.access_schedule ? <CopyShiftsToRoster {...props} /> : permissionRediect} />

                                <Route exact path={ROUTER_PATH + 'admin/schedule/skills/:id(\\d+)'} render={(props) => this.permission.access_schedule ? <ShiftSkillsList {...props} key={props.match.params.id} /> : permissionRediect} />
                                
                                <Route exact path={ROUTER_PATH + 'admin/schedule/notes/:id'} render={(props) => this.permission.access_schedule ? <ActivityNotesList props={props} /> : permissionRediect} />

                                <Route exact path={ROUTER_PATH + 'admin/schedule/roster/shift/:id'} render={(props) => this.permission.access_schedule ? <RosterShiftList {...props} key={props.match.params.id} /> : permissionRediect} />

                                <Route path='/admin/schedule/' component={PageNotFound} />
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
    scheduleShiftData: state.ScheduleDetailsData.shfit_details,
    scheduleRosterData: state.ScheduleDetailsData.roster_details,
    showTypePage: state.ScheduleDetailsData.activePage.pageType
})

const mapDispatchtoProps = (dispatch) => {
    return {
        setFooterColor: (result) => dispatch(setFooterColor(result)),
        setSubmenuShow: (result) => dispatch(setSubmenuShow(result))
    }
};

const AppScheduleData = connect(mapStateToProps, mapDispatchtoProps)(AppSchedule)
export { AppScheduleData as AppSchedule };
