import jQuery from "jquery";
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

import { connect } from 'react-redux'

import { postData, logout, getFullName, getPermission, css, loginCms, getLoginToken } from 'service/common.js';

import { setNotificationToggel, setNotificationAlert, setNotificationImailAlert, setToggleInfographicSidebar, dismissNotificationAlert, markAllAsRead, updateNotificationAsReaded } from './notification/actions/NotificationAction.js';

import WebsocketUserConnectionHandleData from './externl_component/WebsocketUserConnectionHandleData'
import Icon from '@salesforce/design-system-react/lib/components/icon';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Combobox from '@salesforce/design-system-react/lib/components/combobox';
import Spinner from '@salesforce/design-system-react/lib/components/spinner';
import Dropdown from '@salesforce/design-system-react/lib/components/menu-dropdown';
import GlobalHeader from '@salesforce/design-system-react/lib/components/global-header';
import GlobalHeaderFavorites from '@salesforce/design-system-react/lib/components/global-header/favorites';
import GlobalHeaderHelp from '@salesforce/design-system-react/lib/components/global-header/help';
import GlobalHeaderNotifications from '@salesforce/design-system-react/lib/components/global-header/notifications';
import GlobalHeaderButton from '@salesforce/design-system-react/lib/components/global-header/button';
import GlobalHeaderDropdown from '@salesforce/design-system-react/lib/components/global-header/dropdown';
import GlobalHeaderProfile from '@salesforce/design-system-react/lib/components/global-header/profile';
import GlobalHeaderSearch from '@salesforce/design-system-react/lib/components/global-header/search';
import GlobalHeaderSetup from '@salesforce/design-system-react/lib/components/global-header/setup';
import GlobalHeaderTask from '@salesforce/design-system-react/lib/components/global-header/task';
import Popover from '@salesforce/design-system-react/lib/components/popover';
import AppLauncher from './AppLauncher.jsx';
import { homeMenusJson, adminMenusJson, salesMenusJson, recruitMenusJson, imailMenusJson, itemMenuJson, financeMenusJson, participaintmenuJson, schedulemenuJson, fmsmenuJson, orgmenuJson, membersmenuJson, helmenuJson } from '../../../src/menujson/global_nav_menus_json';
import moment from 'moment-timezone';
import { ROUTER_PATH } from '../../config.js';
import './Script.jsx';
import UserAvatar from "./oncallui-react-framework/view/UserAvatar.jsx";
import CustomModal from "./oncallui-react-framework/view/CustomModal.jsx";
import { toastMessageShow } from "./oncallui-react-framework/services/common.js";
import { Avatar } from '@salesforce/design-system-react';
import DefaultPic from "./oncallui-react-framework/object/DefaultPic.js";
import { IconSettings as IconSettingsAvatar } from '@salesforce/design-system-react';

const globalSearch = (input) => {
    if (input) {
        if (input.length <= 2 && isNaN(input)) {
            return Promise.resolve({ options: [] });
        }

        var request = { search: input };
        return postData('common/Common/get_global_search_option', request).then((result) => {
            return { options: result.data };
        });
    } else {
        return Promise.resolve({ options: [] });
    }
}

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permission: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),
            notifications: [
                {
                    action: 'mentioned you',
                    avatar: 'avatar2',
                    comment:
                        '@jrogers Could I please have a review on my presentation deck',
                    id: 1,
                    name: 'Val Handerly',
                    timePosted: '10 hours ago',
                    unread: true,
                }
            ],
            showApplauncher: false,
            menus: [],
            brdersetColor: "",
            NotificationData: this.props.NotificationData,
            prevNotificationData: "",
            redirectTo: '',
            IsAllRead: this.props.IsAllRead,
            page: 0,
            pageSize: 5,
            notificationFeedEnd: false,
            isLoading: false,
            avatar: localStorage.getItem("ocs_avatar") || ""
        }
    }

    searchOnChange = (value, site_lookup) => {
        var state = {};
        //value.url
        window.location = value.url;
    }

    componentDidMount() {
        this.menuJson();
        this.notificationAlert();
        if (this.state.permission.access_imail) this.imailNotification();

    }

    componentWillMount() {


    }

    componentWillReceiveProps(nextProps) {
        var routeChanged = nextProps.location !== this.props.paths
        if (routeChanged) {
            this.menuJson();
        }
    }
    imailNotification() {
        postData('admin/notification/get_imail_notification', {}).then((result) => {
            if (result.data) {
                this.props.imailnotificationalert(result.data);
            }
        });
    }

    handleScroll = (event) => {
        if (this.state.notificationFeedEnd == true || this.state.isLoading == true) {
            return false;
        }
        const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
        if (scrollHeight - Math.round(scrollTop) === clientHeight) {
            this.notificationAlert();
        }
    };

    notificationAlert() {
        postData('admin/notification/get_notification_without_imail_alert', { pageSize: this.state.pageSize, page: this.state.page, admin_login: true }).then((result) => {
            if (result.data) {
                this.props.notificationalert(result);
                //Stop the scroll once notification is ended
                if ((this.props.NotificationData).length == 0) {
                    this.setState({ notificationFeedEnd: true, isLoading: false })
                    return false;
                }
                else if ((this.state.NotificationData).length > 0) {
                    let myarr = this.state.prevNotificationData;
                    this.props.NotificationData.forEach(function (item) {
                        myarr.push(item);
                    });

                    this.setState({ NotificationData: this.state.prevNotificationData, isLoading: true }, () => {

                        this.setState({ prevNotificationData: this.state.prevNotificationData, page: this.state.page + 1, isLoading: false });
                    });
                } else {
                    this.setState({
                        NotificationData: this.props.NotificationData, page: this.state.page + 1,
                        prevNotificationData: this.props.NotificationData
                    });
                }

            }
        });
    }

    imailCount = () => {
        var count = this.props.external_imail_count + this.props.internal_imail_count;
        if (count > 0)
            return <i>{count}</i>;
    }
    closeModal = () => {
        this.setState({ showApplauncher: false })
    }

    /** 
     * Determine the module menu based on url
     *  - crm, recruitment, imail
     *
     * - Logic for items
     * Get the itemMenu is true or false using localstorage variable - global_menu
     * if itemMenu is true then get the current module menu (currentMenu) and merge the item menu with currentMenu
     */
    menuJson = () => {
        var pathArray = window.location.pathname.split('/');
        var module = '';
        if (pathArray && pathArray[2]) {
            module = pathArray[2];
        }
        let menu = homeMenusJson;
        let color = "";
        let col_name = "admin";
        // get local storage value of global_menu
        var global_menu = sessionStorage.getItem("global_menu");
        global_menu = JSON.parse(global_menu);
        if (global_menu && global_menu.currentMenu != '') {
            // Determine the current module menu
            switch (global_menu.currentMenu) {
                
                case "admin":
                case "settings":
                case "user":
                    menu = adminMenusJson;
                    col_name = "admin";
                    break;
                case "crm":
                    menu = salesMenusJson;
                    col_name = "crm";
                    break;
                case "recruitment":
                    menu = recruitMenusJson;
                    col_name = "recruitment";
                    break;
                case "imail":
                    menu = imailMenusJson;
                    col_name = "imail";
                    break;
                case "finance":
                    menu = financeMenusJson;
                    col_name = "finance";
                    break;
                case "participant":
                    menu = participaintmenuJson;
                    col_name = "participant";
                    break;
                case "schedule":
                    menu = schedulemenuJson;
                    col_name = "schedule";
                    break;
                case "fms":
                    menu = fmsmenuJson;
                    col_name = "fms";
                    break;
                case "organisation":
                case "house":
                    menu = orgmenuJson;
                    col_name = "organisation";
                    break;
                case "member":
                    menu = membersmenuJson;
                    col_name = "member";
                    break;
                case "support_worker":
                    menu = membersmenuJson;
                    col_name = "member";
                    break;  
                case "help":
                    menu = helmenuJson;
                    col_name = "member";
                    break;
                default:
                    menu = homeMenusJson;
                    col_name = "admin";
                    break;
            }

        } else if (!global_menu && getLoginToken()) {
            var itemUrlSplit = window.location.pathname.split('/');
            if (module === 'item' || (module === 'crm' && (itemUrlSplit[3] === 'contact' || itemUrlSplit[3] === 'organisation'))) {
                if (itemUrlSplit[3]) {
                    let menus = { menus: { [itemUrlSplit[3]]: true } };
                    sessionStorage.setItem('global_item_menu', JSON.stringify(menus));
                }
            }
            var itemsMenu = sessionStorage.getItem('global_item_menu');
            module = module === 'support_worker' ? 'member' : module === 'item' ? 'dashboard' : module;

            var setGlobalMenu = { currentMenu: module };
            if (itemsMenu) {
                setGlobalMenu.itemMenu = true;
            }
            sessionStorage.setItem('global_menu', JSON.stringify(setGlobalMenu));
            switch (module) {
                case "admin":
                case "settings":
                case "user":
                    menu = adminMenusJson;
                    col_name = "admin";
                    break;
                case "crm":
                    menu = salesMenusJson;
                    col_name = "crm";
                    break;
                case "recruitment":
                    menu = recruitMenusJson;
                    col_name = "recruitment";
                    break;
                case "imail":
                    menu = imailMenusJson;
                    col_name = "imail";
                    break;
                case "finance":
                    menu = financeMenusJson;
                    col_name = "finance";
                    break;
                case "participant":
                    menu = participaintmenuJson;
                    col_name = "participant";
                    break;
                case "schedule":
                    menu = schedulemenuJson;
                    col_name = "schedule";
                    break;
                case "fms":
                    menu = fmsmenuJson;
                    col_name = "fms";
                    break;
                case "organisation":
                case "house":
                    menu = orgmenuJson;
                    col_name = "organisation";
                    break;
                case "member":
                    menu = membersmenuJson;
                    col_name = "member";
                    break;
                case "help":
                    menu = helmenuJson;
                    col_name = "member";
                    break;
                case "item":
                    break;
                default:
                    menu = homeMenusJson;
                    col_name = "admin";
                    break;
            }

        } else {
            menu = homeMenusJson;
            col_name = "admin";
        }
        var submenu = menu.menus || [];
        var itemMenus = itemMenuJson.menus || [];
        // find index of items menu
        var find_index = submenu.findIndex((value) => value.group_by === 'item');
        // if index is -1 and global_menu.itemMenu is true then current module menu and item menu is merged
        if (find_index < 0 && global_menu && global_menu.itemMenu === true) {
            submenu = [...submenu, ...itemMenus];
            menu.menus = submenu;
        }
        this.setState({ menus: menu, brdersetColor: col_name });
    }

    editProfilePic(e) {
        e.preventDefault();
        this.setState({ openEditProfilePic: true });
    }

    renderProfileContent = () => {
        return <><div class="slds-theme_shade slds-p-left_small">Options</div>
            <div id="header-profile-custom-popover-content">
                <div className="slds-m-horizontal_small slds-p-vertical_x-small">
                    <div className="slds-tile slds-tile_board slds-m-horizontal_small">
                        <div className="slds-tile__detail">
                            <ul>
                                <li><a href="javascript:void(0)" onClick={() => logout()}>Log Out</a></li>
                                <li><Link to="/admin/update_pin">Update Pin</Link></li>
                                <li><Link to="/admin/update_password">Update Password</Link></li>
                                <li><Link onClick={e => this.editProfilePic(e)} to="#">Manage Profile Pic</Link></li>
                                <li><Link to="/admin/update_password_recovery_email">Update Password Recovery Email</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }

    handleOnCloseAddModal = () => {
        this.setState({ showApplauncher: false })
    }

    /**
     * Render notitfication
     * @param {array} NotificationData
     */
    renderHeaderNotificationsContent = (NotificationData) => {
        let notificationArr = [];
        let log_type = [
            '',
            'opportunity',
            'lead',
            'file',
            'opportunity',
            'service_contract',
            'file',
            'task',
            'email',
            'log-a-call',
            'event',
        ];
        let log_type_name = [
            '',
            'Opportuntiy',
            'Lead',
            'Service Agreement',
            'Need Assessment',
            'Risk Assessment',
            'Service Agreement Contract',
            'Task',
            'Email',
            'Call',
            'Event',
        ];
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            },
            headTitle: {
                fontWeight: 'inherit',
                fontSize: '1rem'
            },
            para: {
                lineHeight: '1rem',
                fontSize: '.825rem'
            },
            notification: {
                position: "absolute",
                top: "calc(100% + -17px)",
                right: "0px",
            }

        });
        return (
            <React.Fragment>
                {
                    NotificationData.length === 0 ?
                        <div class="view-all-div">
                            <span className="slds-truncate"><a style={styles.hyperlink} className="reset" title="View all notification" href={"/admin/notification"}>Open Notification</a></span>
                        </div>
                        : ''
                }
                {
                    NotificationData.length > 0 ?

                        <section aria-describedby="dialog-body-id-8" aria-labelledby="dialog-heading-id-8" className="slds-popover slds-popover_large slds-nubbin_top-right absolute-positioned" role="dialog" style={styles.notification}>
                            <a href={"#"} className="slds-float_right all_read"
                                onClick={() => this.markAllNotificationAsRead()}
                            >Mark all as read</a>
                            <header className="slds-popover__header">
                                <h2 className="slds-text-heading_small" id="dialog-heading-id-8">Notifications</h2>
                            </header>
                            <div className="slds-popover__body slds-p-around_none" id="dialog-body-id-8">
                                <ul onScroll={this.handleScroll}>
                                    {
                                        NotificationData.map((item, index) => (
                                            <li className={`slds-global-header__notification ${this.props.IsAllRead === false ? item.unread === "1" ? 'slds-global-header__notification_unread' : '' : ''}`}>
                                                <button class="slds-button slds-button_icon slds-button_icon-container slds-notification__close" title={"Dismiss - " + item.title + " notification"} onClick={() => this.dismissNotification(item.id, index)}>
                                                    <svg aria-hidden="true" class="slds-button__icon">
                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close">
                                                        </use>
                                                    </svg>
                                                    <span class="slds-assistive-text">Dismiss {item.title}</span>
                                                </button>

                                                <div className="slds-media slds-has-flexi-truncate slds-p-around_x-small">
                                                    <div className="slds-media__figure">
                                                        <span className="slds-avatar slds-avatar_small">
                                                            <Icon
                                                                assistiveText={{ label: 'Account' }}
                                                                category="standard"
                                                                name="avatar"
                                                                size="small"
                                                            />
                                                        </span>
                                                    </div>
                                                    <div className="slds-media__body">
                                                        <div className="slds-grid slds-grid_align-spread">
                                                            <a href={"javascript:void(0);"}
                                                                className="slds-text-link_reset slds-has-flexi-truncate"
                                                                onClick={() => this.notificationRedirect(item, index,
                                                                    Number(item.entity_type) === 6 ? ROUTER_PATH + "admin/crm/serviceagreements/" + item.redirect_url_id :
                                                                        Number(item.entity_type) === 7 ? ROUTER_PATH + "admin/recruitment/application_quiz/detail/" + item.entity_id : ""
                                                                )}
                                                            >
                                                                <h3 className="slds-truncate" title={item.title}>
                                                                    <strong>{item.title}</strong>
                                                                </h3>
                                                                <p className="slds-truncate" title={item.shortdescription}>{item.shortdescription}</p>
                                                                <p className="slds-m-top_x-small slds-text-color_weak">{moment(item.created).fromNow()}
                                                                    <abbr className="slds-text-link slds-m-horizontal_xxx-small" title="unread">{item.unread === "1" ? "●" : ""}</abbr>
                                                                </p>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    }
                                    <li>
                                        <div style={{
                                            position: 'relative', height: '5rem', display:
                                                this.state.isLoading ? 'block' : 'none'
                                        }}>
                                            <Spinner
                                                size="small"
                                                variant="base"
                                                assistiveText={{ label: 'Main Frame Loading...' }}

                                            />
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </section>
                        :
                        ''
                }
            </React.Fragment>
        );
    };

    /**
     * Dismiss Notification
     * @param {*} index
     * @param {*} index
     */
    dismissNotification = (id, index) => {
        this.props.onClickDismissNotification({ notification_id: id, index: index });
        this.setState({ NotificationData: this.props.NotificationData })
    }

    notificationRedirect = (item, index, url) => {
        //Redirect directly if notification already read by user
        if (item.unread === "0") {
            window.location = url;
            return false;
        }
        this.props.notificationRedirect({ notification_id: item.id, index: index, url: url });
    }
    markAllNotificationAsRead = () => {

        this.props.onClickMarkAllAsRead();
        this.setState({ NotificationData: this.props.NotificationData })
    }

    /**
     * Set Redirect to path
     * @param {obj} val
     * @param {bool} appNav - used to update the localstorage global_menu variable
     */
    redirectTo = (val, appNav, redirect) => {
        this.setState({ redirectTo: val.path }, () => {
            // Get the url & split with / to get the module name
            var pathArray = window.location.pathname.split('/');
            if (pathArray && pathArray[2] && !appNav) {
                var module = pathArray[2] || '';
                var data = {};
                module = module === 'support_worker' ? 'member' : module;
                data['menu'] = module;
                data['submenu'] = pathArray[3] || '';
                data['module'] = module;
                data['nav_module'] = 'item';
                data['nav_menu'] = val.id || '';
                // update props if module not equal to item
                if (pathArray[3] === "organisation") {
                    var global_menu = sessionStorage.getItem("global_menu");
                    global_menu = JSON.parse(global_menu);
                    if (global_menu.currentMenu) {
                        data['menu'] = global_menu.currentMenu;
                    }
                }
                this.props.onUpdateMenu('SET_CURRENT_MENU', data);
            } else {
                var data = {};
                data['module'] = val.module || '';
                this.props.onUpdateMenu('SET_CURRENT_APP', data);
            }
            // redirect to corresponding path
            if (redirect === true) {
                var linkToClick = document.getElementById('linkRedirect');
                linkToClick.click();
            }
        });
    }

    /**
     * Hide Items menu
     * @param {obj} val
     *  - set itemMenu false in localstorage variable
     *  - remove the items menu from menu state
     *  - redirect to the menu of first index in state
     */
    hideItemMenu = (val) => {
        console.log('date');
        // Get the url & split with / to get the module name
        var pathArray = window.location.pathname.split('/');
        if (pathArray && pathArray[2]) {
            var module = pathArray[2] || '';
            var data = [];
            data['menu'] = module;
            data['submenu'] = pathArray[3] || '';
            data['module'] = module;
            data['nav_module'] = 'item';
            data['nav_menu'] = val.id;
            // update props if module not equal to item
            this.props.onHideItemMenu('HIDE_ITEM_MENU', data);
        }
        var menus = this.state.menus;
        var submenus = menus.menus || [];
        var redirect_url = submenus && submenus[0] ? submenus[0]['path'] : '/admin';
        redirect_url = redirect_url;
        // find index of items menu
        var find_index = submenus.findIndex((value) => value.id === 'item');
        // if index is greater than -1 then splice the row from menu using find_index
        if (find_index > -1) {
            submenus.splice(find_index, 1);
            menus.menus = submenus;
        }
        this.setState({
            redirectTo: redirect_url,
            menus: menus
        }, () => {
            // redirect to corresponding path
            var linkToClick = document.getElementById('linkRedirect');
            linkToClick.click();
        });

    }

    render() {
        let NotificationData = this.state.NotificationData;

        return (
            <React.Fragment>
                <Link id="linkRedirect" ref={ref => this.linkRedirect = ref} to={this.state.redirectTo} />
                <div className="overlay"></div>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <GlobalHeader logoSrc={process.env.PUBLIC_URL + "/assets/images/admin/ocs_logo.svg"}>
                        <GlobalHeaderSearch
                            combobox={
                                <Combobox
                                    assistiveText={{ label: 'Search' }}
                                    events={{
                                        onSelect: () => {
                                            console.log('>>> onSelect');
                                        },
                                    }}
                                    id="header-search-input"
                                    labels={{ placeholder: 'Search Health Care Manager' }}
                                    options={[
                                        { id: 'email', label: 'Email' },
                                        { id: 'mobile', label: 'Mobile' },
                                    ]}
                                />
                            }
                        />
                        {/* <GlobalHeaderButton>
                            <button to="#" class="slds-button slds-button_icon slds-button_icon-x-small" title="Help" onClick={() => loginCms('content-list')}>
                                    <Icon
                                        category="utility"
                                        name={"help"}
                                        size="x-small"
                                    />
                            </button>
                        </GlobalHeaderButton> */}

                        <GlobalHeaderNotifications
                            notificationCount={this.props.NotificationCount}
                            popover={
                                <Popover
                                    id={this.props.NotificationCount === 0 ? "cus-header-notifications-readed" : "cus-header-notifications"}
                                    ariaLabelledby="header-notifications-custom-popover-content"
                                    body={this.renderHeaderNotificationsContent(NotificationData)}
                                />
                            }
                        />
                        <GlobalHeaderProfile
                            popover={
                                <Popover
                                    body={this.renderProfileContent()}
                                    id="header-profile-popover"
                                />
                            }
                            userName={getFullName()}
                            avatar={
                                <Avatar
                                    assistiveText={{ icon: 'Avatar image' }}
                                    imgSrc={this.state.avatar || DefaultPic}
                                    imgAlt="Profile Pic"
                                    size="medium"
                                    title={false}
                                />
                            }
                        />
                    </GlobalHeader>
                    <AppLauncher
                        menus={this.state.menus}
                        bordersetColor={this.state.brdersetColor}
                        redirectTo={this.redirectTo.bind(this)}
                        hideItemMenu={this.hideItemMenu.bind(this)}
                        itemsMenu={itemMenuJson}
                    />
                    {
                        this.state.openEditProfilePic &&
                        <CustomModal
                            id="open-update-profile-pic"
                            title="Manage Profile Picture"
                            ok_button="Submit"
                            onClickOkButton={(e) => this.updateAvatar(e)}
                            showModal={this.state.openEditProfilePic}
                            setModal={(status) => this.closeEditModal(status)}
                            size="small"
                            style={{ overFlowY: "hidden" }}
                            loading={this.state.loading}
                        >
                            <div id="create_update_user">
                                <UserAvatar style={{ paddingTop: "15px" }} avatar={this.state.avatar || ""} onUpdateAvatar={data => this.setState({ avatar: data })} />
                            </div>
                        </CustomModal>
                    }
                </IconSettings>

            </React.Fragment>
        );
    }

    closeEditModal(status) {
        this.setState({ openEditProfilePic: false });
    }

    updateAvatar(e) {
        e.preventDefault();
        this.setState({ loading: true });
        postData('admin/Dashboard/update_profile_pic', this.state).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                localStorage.setItem("ocs_avatar", this.state.avatar);
                this.setState({ openEditProfilePic: false });
            } else {
                toastMessageShow("Something went wrong", "e");
            }
        });
    }
}

const mapStateToProps = state => ({
    paths: window.location.pathname,
    LeftMenuOpen: state.NotificationReducer.LeftMenuOpen,
    RightMenuOpen: state.NotificationReducer.RightMenuOpen,
    NotificationType: state.NotificationReducer.NotificationType,
    NotificationCount: state.NotificationReducer.NotificationCount,
    IsAllRead: state.NotificationReducer.IsAllRead,
    NotificationData: state.NotificationReducer.NotificationData,
    external_imail_count: state.NotificationReducer.external_imail_count,
    internal_imail_count: state.NotificationReducer.internal_imail_count,
    currentMenu: state.GlobalMenuReducer.currentMenu,
})

const mapDispatchtoProps = (dispach) => {
    return {
        notificationtoggle: (object) => dispach(setNotificationToggel(object)),
        notificationalert: (object) => dispach(setNotificationAlert(object)),
        imailnotificationalert: (object) => dispach(setNotificationImailAlert(object)),
        onToggleInfographicSidebar: (object) => dispach(setToggleInfographicSidebar(object)),
        onClickDismissNotification: (index) => dispach(dismissNotificationAlert(index)),
        onClickMarkAllAsRead: (index) => dispach(markAllAsRead(index)),
        notificationRedirect: (index) => dispach(updateNotificationAsReaded(index)),

        onUpdateMenu: (type, data) => dispach({ type: type, payload: data }),
        onHideItemMenu: (type, data) => dispach({ type: type, payload: data })
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Header);