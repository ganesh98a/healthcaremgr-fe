import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import PinModal from './PinModal';
import { checkLoginModule, pinHtml } from 'service/common.js';
import { OCS_HEAD_TITLE } from 'service/OcsConstant.js';

class Sidebar extends Component {


    constructor(props) {
        super(props);
        this.state = {
            drop1: false,
            drop2: false
        }
    }
    clikEvnetDatao = (title) => {
        document.title = OCS_HEAD_TITLE + '-' + title;
    }
    makeNavLinkTag = (menu, typeDatatag) => {
        // allow/disallow asking for pin when one of 
        // submenus that requires a pin was clicked
        // this doesn't work atm so let's prefix it with `UNSTABLE_`
        const UNSTABLE_REQUEST_PIN_ON_SUBMENUS = false

        let classData = {};
        let path = menu.hasOwnProperty('path') && menu.path != '' ? menu.path : '#';
        let linkOnlyHide = menu.hasOwnProperty('linkOnlyHide') && menu.linkOnlyHide ? true : false;
        let pathstructure = menu.hasOwnProperty('pathstructure') && menu.pathstructure != '' ? menu.pathstructure : '';
        let type = menu.hasOwnProperty('type') && menu.type != '' ? menu.type : 0;

        if (UNSTABLE_REQUEST_PIN_ON_SUBMENUS && type == 3) {
            let menuName = menu.hasOwnProperty('name') && menu.name != '' ? menu.name : '';
            let moduelName = menu.hasOwnProperty('moduelname') && menu.moduelname != '' ? menu.moduelname : 'fms';
            var re = new RegExp(Object.keys(this.props.replacePropsData).join("|"), "gi");
            pathstructure = pathstructure.replace(re, (matched) => {
                return this.props.replacePropsData[matched];
            });
            path = pathstructure;
            return pinHtml(this, moduelName, 'menu', pathstructure, menuName);
        }
        if (pathstructure != '' && type == 1) {
            var re = new RegExp(Object.keys(this.props.replacePropsData).join("|"), "gi");
            pathstructure = pathstructure.replace(re, (matched) => {
                return this.props.replacePropsData[matched];
            });
            path = pathstructure;
        }
        if (menu.hasOwnProperty('className')) {
            classData = { className: menu.className }
        }

        if (linkOnlyHide) {
            return <React.Fragment />;
        }
        if (typeDatatag == 'menu') {
            return <NavLink exact to={path} {...classData} onClick={() => this.clikEvnetDatao(menu.name)}><span><strong>{menu.name}</strong></span></NavLink>
        } else {
            return <NavLink exact to={path} {...classData} onClick={() => this.clikEvnetDatao(menu.name)}>{menu.name}</NavLink>
        }
    }

    closeModal = () => {
        this.setState({ pinModalOpen: false })
    }

    hideShowNavDropDown = (actionName, sts) => {
        this.setState({ [actionName]: !sts })
    }

    /**
     * Render submenus based on provided props menu
     */
    renderMenus() {
        return this.props.menus.map((menu, i) => {

            let list = '';
            if (menu.hasOwnProperty('linkShow') && !menu.linkShow) {
                return list;
            }

            if ((menu.hasOwnProperty('submenus') && menu.submenus.length == 0) || !this.props.subMenuShowStatus || !menu.hasOwnProperty('submenus')) {
                let classNameData = menu.hasOwnProperty('classNameMainMenu') ?  menu.classNameMainMenu : '';
                list = <li key={i} className={classNameData}>{this.makeNavLinkTag(menu, 'menu')}</li>
            }
            else {

                let sts = this.state[menu.name + '_action'] == undefined ? true : this.state[menu.name + '_action'];
                let actionName = menu.name + '_action';
                let classNameData = menu.hasOwnProperty('className') ? 'dropdownMenu ' + menu.className : 'dropdownMenu';

                list = <li key={'menu_' + i} className={classNameData} >
                    <div className={'drpHdng' + ' ' + (sts ? 'open' : '')} >
                        {this.makeNavLinkTag(menu, 'menu')}
                            <i className='icon icon-arrow-right' onClick={() => this.hideShowNavDropDown(actionName, sts)}></i>
                    </div>
                    <ul>
                        {!menu.closeMenus ?
                            menu.submenus.map((submenu, i) => {
                                return (
                                    <li key={'submenu_' + i}>{this.makeNavLinkTag(submenu, 'submenu')}

                                        {
                                            (submenu.subSubMenu && !submenu.closeMenus) ? <ul className='Sub_in_sub'>

                                                {
                                                    submenu.subSubMenu.map((subSubmenu, i) => {
                                                        return (
                                                            <li key={'subsubmenu_' + i}>{this.makeNavLinkTag(subSubmenu, 'subsubmenu')}</li>
                                                        )
                                                    })
                                                }
                                            </ul> : null
                                        }
                                    </li>
                                )
                            }) : ''}

                    </ul>
                </li>
            }
            return (list)
        })
    }

    /**
     * Render PIN modal
     */
    renderPinModal() {
        return (
            <PinModal
                color={this.state.color}
                moduleHed={this.state.moduleHed}
                pinType={this.state.pinType}
                modal_show={this.state.pinModalOpen}
                returnUrl={this.state.returnUrl}
                closeModal={this.closeModal}
            />
        )
    }


    render() {
        const { renderMenusOnly } = this.props
        if (renderMenusOnly) {
            return this.renderMenus()
        }

        return (
            <aside className={'main_sidebar__'}>
                <div className='sideHead1__'>
                    {this.props.heading}
                </div>

                <ul className='sideNavies__'>
                    { this.renderMenus() }
                </ul>

                { this.renderPinModal() }
            </aside>
        );
    }
}
Sidebar.defaultProps = {
    replaceData: { ':id': 0 }
}
export default Sidebar;
