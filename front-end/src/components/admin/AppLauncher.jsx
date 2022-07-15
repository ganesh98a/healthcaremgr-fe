import React from 'react';
import _ from 'lodash'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom';
import { getPermission, checkLoginModule, pinHtml,checkPin } from 'service/common.js';
import { DashboardPageTitle } from 'menujson/pagetitle_json';
import { ROUTER_PATH } from 'config.js';
import { css, } from '../../../src/service/common'
import './scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import './scss/components/admin/salesforce/lightning/app-lanucher.scss';
import { SLDSGlobalMenuDropDown, SLDSGlobalMenuItemDropDown } from './salesforce/lightning/SLDSGlobalMenuDropDown.jsx';
import PinModal from './PinModal';

import {
  AppLauncher,
  AppLauncherLink,
  AppLauncherTile,
  AppLauncherExpandableSection,
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  GlobalNavigationBarLink,
  GlobalNavigationBarDropdown,
  Button,
  Search,
  Icon,
  IconSettings
} from '@salesforce/design-system-react';
import { data } from 'jquery';

class AppLauncherMenu extends React.Component {
	static displayName = 'AppLauncher';

	state = {
    search: '',
    appLauncher: false,
    permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),
	};

	onSearch = (event) => {
		this.setState({ search: event.target.value });
  };

  /**
   * Render tiles section with permission
   */
  renderTilesSection = () => {
    let sectionTile = [];

    if (this.state.permissions.access_admin) {
      sectionTile.push(
        <AppLauncherTile
          iconText="A"
          search={this.state.search}
          title="Admin"
          assistiveText={{dragIconText:''}}
          iconBackgroundColor="darkorange"
          href={ROUTER_PATH + 'admin/user/dashboard'}
          onClick={(val) => {
            this.check_previous_menu();
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/user/dashboard';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/user/dashboard', module: 'admin' }, true);
          }}
        />
      );
    }
    if (this.state.permissions.access_finance) {
      sectionTile.push(
        <AppLauncherTile
          iconText="F"
          search={this.state.search}
          title="Finance"
          assistiveText={{dragIconText:''}}
          iconBackgroundColor="#464765"
          href={ROUTER_PATH + 'admin/finance/timesheets'}
          onClick={(val) => {
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/finance/timesheets';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/finance/timesheets', module: 'finance' }, true);
          }}
        />
      );
    }
    if (this.state.permissions.access_schedule) {
      sectionTile.push(
        <AppLauncherTile
          iconText="S"
          search={this.state.search}
          title="Schedule"
          assistiveText={{dragIconText:''}}
          iconBackgroundColor="#e07196"
          href={ROUTER_PATH + 'admin/schedule/list'}
          onClick={(val) => {
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/schedule/list';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/schedule/list', module: 'schedule' }, true);
          }}
        />
      );
    }
    if (this.state.permissions.access_fms) {
      sectionTile.push(
        <AppLauncherTile
          iconText="F"
          search={this.state.search}
          title="FMS"
          assistiveText={{dragIconText:''}}
          iconBackgroundColor="#d32f2f"
          href={ROUTER_PATH + 'admin/fms/dashboard/new/cases'}
          onClick={(val) => {
            this.check_previous_menu();
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/fms/dashboard/new/cases';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/fms/dashboard/new/cases', module: 'fms' }, true);
          }}
        />
      );
    }

    if (this.state.permissions.access_recruitment) {
      sectionTile.push(
        <AppLauncherTile
          iconText="R"
          search={this.state.search}
          title="Recruitment"
          assistiveText={{dragIconText:''}}
          iconBackgroundColor="#05adee"
          href={ROUTER_PATH + 'admin/recruitment/applications'}
          onClick={(val) => {
            this.setState({ appLauncher: false });
             window.location = ROUTER_PATH + 'admin/recruitment/applications';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/recruitment/applications', module: 'recruitment' }, true);
          }}
        />
      );
    }

    if (this.state.permissions.access_crm) {
      sectionTile.push(
        <AppLauncherTile
          iconBackgroundColor="#992bff"
          iconText="I"
          search={this.state.search}
          title="Intake"
          href={ROUTER_PATH + 'admin/crm/leads'}
          onClick={(val) => {
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/crm/leads';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/crm/leads', module: 'crm' }, true);
          }}
        />
      );
    }

    if (this.state.permissions.access_imail) {
      sectionTile.push(
        <AppLauncherTile
          iconBackgroundColor="#006dcc"
          iconText="I"
          search={this.state.search}
          title="Imail"
          href={ROUTER_PATH + 'admin/imail/dashboard'}
          onClick={(val) => {
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/imail/dashboard';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/imail/dashboard', module: 'imail' }, true);
          }}
        />
      );
    }

    if (this.state.permissions.access_member) {
      sectionTile.push(
        <AppLauncherTile
          iconBackgroundColor="#ff7043"
          iconText="S"
          search={this.state.search}
          title="Support Workers"
          href={ROUTER_PATH + 'admin/support_worker/list'}
          onClick={(val) => {
            this.setState({ appLauncher: false });
            window.location = ROUTER_PATH + 'admin/support_worker/list';
            this.props.redirectTo({ path: ROUTER_PATH + 'admin/support_worker/list', module: 'member' }, true);
          }}
        />
      );
    }


      // sectionTile.push(
      //   <AppLauncherTile
      //     iconBackgroundColor="#333"
      //     iconText="H"
      //     search={this.state.search}
      //     title="Help"
      //     href={ROUTER_PATH + 'admin/help/dashboard'}
      //     onClick={(val) => {
      //       this.setState({ appLauncher: false });
      //       window.location = ROUTER_PATH + 'admin/help/dashboard';
      //       this.props.redirectTo({ path: ROUTER_PATH + 'admin/help/dashboard', module: 'help' }, true);
      //     }}
      //   />
      // );

    return sectionTile;
  }

  check_previous_menu() {
    let current_menu = sessionStorage.getItem('global_menu');
    
    if (!checkPin()) {
      sessionStorage.setItem('previous_menu',current_menu);
    } 
  }

  /**
   * Set Redirect to path
   * @param {obj} val
   */
  redirectTo = (val) => {
    this.setState({ redirectTo: val.path });
  }

  /**
   * Render menus
   */
  renderMenus = () => {
    // if undefined or empty return null
    if (!this.props.menus) {
      return <React.Fragment />;
    }
    if (!this.props.menus.menus) {
      return <React.Fragment />;
    }
    // global menu
    var global_menu = sessionStorage.getItem("global_menu");
    global_menu = JSON.parse(global_menu);

    // global - item menu
    var global_item_menu = sessionStorage.getItem("global_item_menu");
    global_item_menu = JSON.parse(global_item_menu);
    const styles= css({
      borderRight: {
        borderRight: '0px !important'
      }
    });
	
	let menuLink = [];

    return this.props.menus.menus && this.props.menus.menus.map((datas, i) => {
      var pathArray = window.location.pathname.split('/');
      var module = '';
      var active = "";

      //Don't count duplicate tab (based on its path)
	  if(menuLink.indexOf(datas.path) == -1) {
          menuLink.push(datas.path);
	  } else {
		  return <React.Fragment />
	  }
	  
      if (pathArray && pathArray[2]) {
        module = pathArray[2];
      }
      if (window.location.href.includes("participant/dashboard")) {
        module = 'participant/dashboard';
      }
      if(window.location.pathname == datas.path || (datas.path2 && module !== 'item' && window.location.pathname.startsWith(datas.path2)) || (datas.path3 && module !== 'item' && window.location.pathname.startsWith(datas.path3)) || (datas.path2 && module == 'item' && !datas.on_close && window.location.pathname.startsWith(datas.path2)) || (datas.path3 && module == 'item' && !datas.on_close && window.location.pathname.startsWith(datas.path3))){
        active = "slds-is-active slds-is-active-"+this.props.bordersetColor;
      }

      if(datas.dropDown === true && (window.location.pathname == datas.path || module === datas.id)){
        active = "slds-is-active-"+this.props.bordersetColor;
      }

      /**
       * Return null when (To chech the item menu only)
       * menu group_by == item && global_menu.itemMenu == undefined || global_item_menu.menus[datas.id] == false
       */
      if (datas.group_by === 'item' && (!global_menu || !global_menu.itemMenu || (global_item_menu.menus[datas.id] === false || !global_item_menu.menus[datas.id]))) {
        return <React.Fragment />
      }

      /**
       * if dropDown is true and id is not equal to item then load SLDSGlobalMenuDropDown
       */
      if (datas.dropDown === true && datas.id != 'item') {
        return (
          <SLDSGlobalMenuDropDown
            datas={datas}
            active={active}
            className={'cus-slds_dropdown_menu '}
            assistiveText={{ icon: 'expand' }}
            label={datas.name}
            id={datas.id+"-link"}
            href={datas.path}
            menu={datas}
            submenus={datas.submenus ? datas.submenus : []}
            {...this.props}
          />
        )
      }

      /**
       * if Dropdown is ture and id is equal to items then load SLDSGlobalMenuItemDropDown
       */
      if (datas.dropDown === true && datas.id === 'item') {
        return (
          <SLDSGlobalMenuItemDropDown
            datas={datas}
            active={active}
            className={'cus-slds_dropdown_menu '}
            assistiveText={{ icon: 'expand' }}
            label={datas.name}
            id={datas.id+"-link"}
            href={datas.path}
            menu={datas}
            submenus={datas.submenus ? datas.submenus : []}
            onClose={this.props.hideItemMenu}
            {...this.props}
          />
        )
      }

      /**
       * render menu with close icon
       */
      if (datas && datas.on_close) {
          //if organisation menu is already there then avoid opening a new menu
        if (datas.id === "organisation" && global_item_menu.menus[datas.id] === true && global_menu.currentMenu !== "crm" ) {
            return <React.Fragment />
        }
        if(datas.on_close === true && (window.location.pathname == datas.path || module === datas.id || (datas.path2 && window.location.pathname.startsWith(datas.path2)))){
          active = "slds-is-active-"+this.props.bordersetColor;
        }
        return (
            <li class={"slds-context-bar__item "+active} style={styles.borderRight} role="presentation">
              <a href={datas.path} class="slds-context-bar__label-action" role="tab" title="Home" aria-selected="true" tabindex="0" aria-controls="context-tab-panel-1" id="context-tab-id-1">
                <span class="slds-truncate" title="Home">{datas.name}</span>
              </a>
              <div class="slds-context-bar__icon-action slds-col_bump-left slds-p-left_none">
                <button class="slds-button slds-button_icon slds-button_icon-current-color slds-button_icon-container slds-button_icon-x-small addEventList" tabindex="0" title={"Close "+datas.label} onClick={() => this.props.hideItemMenu(datas)}>
                    <Icon
                      assistiveText={{ label: 'Close' }}
                      category="utility"
                      name="close"
                      size="x-small"
                    />
                  <span class="slds-assistive-text">Close {datas.label}</span>
                </button>
              </div>
            </li>
        )
      }

      return (
        <GlobalNavigationBarLink
          className={active}
          label={datas.name}
          id={datas.id+"-link"}
          href={datas.path}
        />
      )
    })
  }

  /**
   * Render Items menu
   * @param {object} props.itemsMenu
   */
  renderItemsMenu = () => {
    if (!this.props.itemsMenu && !this.props.itemsMenu.menus) {
      return <React.Fragment />;
    }
    var itemMenus = this.props.itemsMenu.menus;
    // if (!itemMenus[0]) {
    //   return <React.Fragment />;
    // }
    // var itemSubMenus = itemMenus[0];
    return itemMenus.map((menu, i) => {
      return (
        <AppLauncherLink
          className={'reset'}
          search={this.state.search}
          href={ROUTER_PATH + menu.path}
          onClick={(val) => {
            this.setState({ appLauncher: false });
            window.location = menu.path;
            this.props.redirectTo(menu, '', false);
          }}
        >
          {menu.label}
        </AppLauncherLink>
      )
    });
  }

	render() {
    const styles= css({
      hr: {
        borderTop: '1px solid #dddbda',
        margin: '2rem 0',
        width: '100%'
      }
    });
		return (
			<IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
				<GlobalNavigationBar className={'cus-slds-bar-col-'+this.props.bordersetColor}>
					<GlobalNavigationBarRegion region="primary">
						<AppLauncher
              isOpen={this.state.appLauncher}
              triggerOnClick={()=>this.setState({ appLauncher: true })}
              onClose={()=>this.setState({ appLauncher: false })}
              id={'cus-slds-border'}
							triggerName={this.props.menus && this.props.menus.label}
              modalClassName={"slds-modal_medium cus-app-launcher"}
              ariaHideApp={false}
						>
              <AppLauncherExpandableSection title="All Apps" className={'cus-exp-font'}>
                {this.renderTilesSection()}
              </AppLauncherExpandableSection>
							<hr style={styles.hr}/>
							<AppLauncherExpandableSection title="All Items" className={'cus-exp-font cus-slds-ul-flex-content'}>
                {this.renderItemsMenu()}
							</AppLauncherExpandableSection>
						</AppLauncher>
					</GlobalNavigationBarRegion>
          <GlobalNavigationBarRegion region="secondary" navigation >
            {this.renderMenus()}
					</GlobalNavigationBarRegion>
				</GlobalNavigationBar>
			</IconSettings>
		);
	}
}

const defaultProps = {
  /**
   * @type {object}
   */
  menus: {},

  /**
   * @type {array}
   */
  itemsMenu: {},

  /**
   * @type {string}
   */
  bordersetColor: '',

  /**
   * @type {(e: React.MouseEvent<HTMLButtonElement>) => void}
   */
  redirectTo: undefined,

  /**
   * @type {(e: React.MouseEvent<HTMLButtonElement>) => void}
   */
  hideItemMenu: undefined,

  /**
   * @type {(e: React.MouseEvent<HTMLButtonElement>) => void}
   */
  onClose: undefined,

}

AppLauncherMenu.defaultProps = defaultProps;

const mapStateToProps = state => ({
  permissions: state.Permission.AllPermission,
})

export default connect(mapStateToProps)(AppLauncherMenu)