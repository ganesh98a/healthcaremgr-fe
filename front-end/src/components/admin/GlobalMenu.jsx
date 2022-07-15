import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import _ from 'lodash'

import { ROUTER_PATH } from 'config.js';
import { css } from '../../service/common'
import { DashboardPageTitle } from 'menujson/pagetitle_json';

import '../admin/scss/components/admin/GlobalMenu.scss'


/**
 * Renders the top-level menus
 *
 * @param {{
 * to: string,
 * title?: string,
 * text?: string | JSX.Element,
 * children?: React.ReactNode
 * className?: string,
 * }} param0
 */
export const ModuleMenu = ({ to, title, text, children, className }) => {
    const [open, setOpen] = useState(false)

    const styles = css({
        root: {
            color: 'white',
        },
        linkParent: {
            paddingLeft: 15,
        },
        link: {
            // color: 'white',
            display: 'block',
            alignItems: 'center',
            padding: '10px 15px 10px 15px',
            marginLeft: -15,
        },
        text: {

        },
        caretBtn: {
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
        },
        caret: {
            transform: open ? `rotate(90deg)` : undefined
        }
    })

    return (
        <li style={styles.root} className={className}>
            <div style={styles.linkParent}>
                <Link title={title} to={to} style={styles.link}>
                    <span style={styles.text}>{text}</span>
                </Link>
            </div>
            {typeof children === "function" ? children({ open: true}) : children}
        </li>
    )
}


/**
 * Renders recruitment module submenus via React Portal
 * @param {React.Props} param
 */
export function RecruitmentMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_RECRUITMENT_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders admin module submenus via React Portal
 * @param {React.Props} param
 */
export function AdminMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_ADMIN_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders participant intake (aka CRM) module submenus via React Portal
 * @param {React.Props} param
 */
export function ParticipantIntakeMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_PARTICIPANT_INTAKE_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders finance module submenus via React Portal
 * @param {React.Props} param
 */
export function FinanceMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_FINANCE_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders participant module submenus via React Portal
 * @param {React.Props} param
 */
export function ParticipantMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_PARTICIPANT_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders orgs and houses module submenus via React Portal
 * @param {React.Props} param
 */
export function OrganisationMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_ORGANISATION_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders feedback management system module submenus via React Portal
 * @param {React.Props} param
 */
export function FMSMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_FMS_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders IMail module submenus via React Portal
 * @param {React.Props} param
 */
export function IMailMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_IMAIL_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders members module submenus via React Portal
 * @param {React.Props} param
 */
export function MembersMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_MEMBERS_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders schedules module submenus via React Portal
 * @param {React.Props} param
 */
export function SchedulesMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_SCHEDULES_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders helpdesk module submenus via React Portals.
 * @param {React.Props} param
 */
export function HelpdeskMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_HELPDESK_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders helpdesk module submenus via React Portals.
 * @param {React.Props} param
 */
export function ItemMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_ITEM_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}

/**
 * Renders helpdesk module submenus via React Portals.
 * @param {React.Props} param
 */
export function HelpMenu({ children }) {
    const el = document.getElementById(GlobalMenu.MODULE_Help_ELEMENT_ID)
    return el ? ReactDOM.createPortal(children, el) : null
}



/**
 * @typedef {ReturnType<typeof mapStateToProps>} Props
 *
 * Component to contain all links to portals and their submenus.
 *
 * Modules are marked as active, it is determined from initial substring of `window.location.pathname`.
 * Active modules will be colorized.
 *
 * NOTE:
 * Why do we use React portals in this component? Why cant we make the submenus available globally.
 *
 * Because each modules navigation menu is only available to the current opened module.
 * In other words, it is not available globally.
 *
 * To make module submenu globally available it will require massive amounts of code-refactoring.
 * So the solution for now is to use React portal.
 *
 * The caveat of using react portals is you cannot view other modules submenus
 * while browsing other modules.
 *
 * It is still recommended to make module navigation available globally
 * to solve the caveat mentioned.
 *
 * @todo When you are ready to spent large amount of time making the submenus
 * available globally, then do so. You may use the 'App.js' state, or you may
 * use Redux or use Context API to store all menus.
 *
 * @extends {React.Component<Props>}
 */
class GlobalMenu extends React.Component {

    // These are html ID attributes of ul element that will portalize module submenus

    static MODULE_RECRUITMENT_ELEMENT_ID = 'RecruitmentModuleSubmenus'
    static MODULE_ADMIN_ELEMENT_ID = 'AdminModuleSubmenus'
    static MODULE_PARTICIPANT_INTAKE_ELEMENT_ID = 'ParticipantIntakeModuleSubmenus'
    static MODULE_FINANCE_ELEMENT_ID = 'FinanceModuleSubmenus'
    static MODULE_PARTICIPANT_ELEMENT_ID = 'ParticipantModuleSubmenus'
    static MODULE_ORGANISATION_ELEMENT_ID = 'OrganisationModuleSubmenus'
    static MODULE_IMAIL_ELEMENT_ID = 'IMailModuleSubmenus'
    static MODULE_FMS_ELEMENT_ID = 'FMSModuleSubmenus'
    static MODULE_MEMBERS_ELEMENT_ID = 'MembersModuleSubmenus'
    static MODULE_SCHEDULES_ELEMENT_ID = 'SchedulesModuleSubmenus'
    static MODULE_HELPDESK_ELEMENT_ID = 'HelpdeskModuleSubmenus'
    static MODULE_ITEM_ELEMENT_ID = 'ITEMModuleSubmenus'
    static MODULE_HELP_ELEMENT_ID = 'HelpModuleSubmenus'

    /**
     * Render submenus of participant module
     */
    renderParticipantModuleMenus() {
        if (!this.props.permissions.access_participant) {
            return null
        }

        const isActive = !!_.startsWith(this.props.pathname, '/admin/participant')

        return (
            <ModuleMenu
                title={DashboardPageTitle.participants_app}
                to={ROUTER_PATH+'admin/participant/dashboard'}
                text={`Participants`}
                className={[`module-menu module-menu-participant`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_PARTICIPANT_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Render submenus of organisation and houses module
     * Note: For houses, the 'App' component you want is located in 'AppHouse.js'
     */
    renderOrganisationModuleMenus() {
        if (!this.props.permissions.access_organization) {
            return null
        }

        let isActive = !!_.startsWith(this.props.pathname, '/admin/organisation')
        isActive = isActive || !!_.startsWith(this.props.pathname, '/admin/house')

        return (
            <ModuleMenu
                title={DashboardPageTitle.organisation_app}
                to={ROUTER_PATH+'admin/organisation/dashboard'}
                text={`Organisation`}
                className={[`module-menu module-menu-organisation`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_ORGANISATION_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of FMS module
     */
    renderFMSModuleSubmenus() {
        if (!this.props.permissions.access_fms) {
            return null
        }

        let isActive = !!_.startsWith(this.props.pathname, '/admin/fms')

        return (
            <ModuleMenu
                title={DashboardPageTitle.fms_app}
                to={ROUTER_PATH+'admin/fms/dashboard/new/case_ongoing'}
                text={`FMS`}
                className={[`module-menu module-menu-fms`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_FMS_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of IMail module
     */
    renderIMailModuleMenus() {
        if (!this.props.permissions.access_imail) {
            return null
        }

        let isActive = !!_.startsWith(this.props.pathname, '/admin/imail')

        return (
            <ModuleMenu
                title={DashboardPageTitle.imail_app}
                to={ROUTER_PATH+'admin/imail/dashboard'}
                text={`I-Mail`}
                className={[`module-menu module-menu-imail`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_IMAIL_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of members module
     */
    renderMembersModuleMenus() {
        if (!this.props.permissions.access_member) {
            return null
        }

        let isActive = !!_.startsWith(this.props.pathname, '/admin/support_worker')

        return (
            <ModuleMenu
                title={DashboardPageTitle.member_app}
                to={ROUTER_PATH+'admin/support_worker/list'}
                text={`Members`}
                className={[`module-menu module-menu-members`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_MEMBERS_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of schedule module
     */
    renderScheduleModuleSubmenus() {
        if (!this.props.permissions.access_schedule) {
            return null
        }

        let isActive = !!_.startsWith(this.props.pathname, '/admin/schedule')

        return (
            <ModuleMenu
                title={DashboardPageTitle.schedule_app}
                to={ROUTER_PATH+'admin/schedule/list'}
                text={`Schedule`}
                className={[`module-menu module-menu-schedule`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_SCHEDULES_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of participant intake (aka CRM) module
     */
    renderParticipantIntakeModuleMenus() {
        const isActive = !!_.startsWith(this.props.pathname, '/admin/crm/')

        if (this.props.permissions.access_crm_admin) {
            return (
                <ModuleMenu
                    title={DashboardPageTitle.crm_admin_app}
                    to={ROUTER_PATH+'admin/crm/participantadmin'}
                    text={`Participant Intake`}
                    className={[`module-menu module-menu-participant-intake`, isActive && 'active'].filter(Boolean).join(' ')}
                >
                    {({ open }) => (<ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_PARTICIPANT_INTAKE_ELEMENT_ID}></ul>)}
                </ModuleMenu>
            )
        }

        return this.props.permissions.access_crm && (
            <ModuleMenu
                to={ROUTER_PATH+'admin/crm/participantuser'}
                text={`CRM`}
                className={[`module-menu module-menu-participant-intake`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (<ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_PARTICIPANT_INTAKE_ELEMENT_ID}></ul>)}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of FMS module
     */
    renderRecruitmentModuleMenus() {
        if (!this.props.permissions.access_recruitment) {
            return null
        }

        const isActive = !!_.startsWith(this.props.pathname, '/admin/recruitment/')

        return (
            <ModuleMenu
                title={DashboardPageTitle.recruitment_app}
                to={ROUTER_PATH+'admin/recruitment/applications'}
                text={`Recruitment`}
                className={[`module-menu module-menu-recruit`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (<ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_RECRUITMENT_ELEMENT_ID}></ul>)}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of admin module
     */
    renderAdminModuleMenus() {
        if (!this.props.permissions.access_admin) {
            return null
        }

        const isActive = !!_.startsWith(this.props.pathname, '/admin/user/')

        return (
            <ModuleMenu
                title={DashboardPageTitle.admin_app}
                to={ROUTER_PATH + "admin/user/dashboard"}
                text={`Admin`}
                className={[`module-menu module-menu-admin`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (<ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_ADMIN_ELEMENT_ID}></ul>)}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of finance module
     */
    renderFinanceModuleMenus() {
        if (!this.props.permissions.access_finance) {
            return null
        }

        const isActive = !!_.startsWith(this.props.pathname, '/admin/finance')

        return (
            <ModuleMenu
                title={DashboardPageTitle.finance_app}
                to={ROUTER_PATH + "admin/finance/dashboard"}
                text={`Finance`}
                className={[`module-menu module-menu-finance`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_FINANCE_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of helpdesk module
     */
    renderHelpdeskModuleMenus() {
        const isActive = !!_.startsWith(this.props.pathname, '/admin/helpdesk')

        return (
            <ModuleMenu
                title={DashboardPageTitle.help_app}
                to={ROUTER_PATH+'admin/helpdesk/enquiries'}
                text={`Helpdesk`}
                className={[`module-menu module-menu-helpdesk`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_HELPDESK_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }

    /**
     * Renders menu and submenus of help module
     */
    renderHelpModuleMenus() {
        if (!this.props.permissions.access_admin) {
            return null
        }

        let isActive = !!_.startsWith(this.props.pathname, '/admin/help/dashboard')

        return (
            <ModuleMenu
                title={'Help'}
                to={ROUTER_PATH+'admin/help/dashboard'}
                text={`Help`}
                className={[`module-menu module-menu-help`, isActive && 'active'].filter(Boolean).join(' ')}
            >
                {({ open }) => (
                    <ul style={{ display: open === false ? 'none' : undefined }} id={GlobalMenu.MODULE_HELP_ELEMENT_ID}></ul>
                )}
            </ModuleMenu>
        )
    }


    render() {
        return (
            <nav id="GlobalMenu" className="theme-light">
                <ul>
                    { this.renderAdminModuleMenus() }
                    { this.renderParticipantIntakeModuleMenus() }
                    { this.renderRecruitmentModuleMenus() }
                    { this.renderFinanceModuleMenus() }
                    { this.renderParticipantModuleMenus() }
                    { this.renderScheduleModuleSubmenus() }
                    { this.renderMembersModuleMenus() }
                    { this.renderFMSModuleSubmenus() }
                    { this.renderIMailModuleMenus() }
                    { this.renderOrganisationModuleMenus() }
                    { this.renderHelpModuleMenus() }
                    {
                        // Helpdesk menu not yet ready for prime time!
                        // this.renderHelpdeskModuleMenus()
                    }

                </ul>
            </nav>
        )
    }
}

// This forces this component to recompute the pathname
// Don't retrieve the path within any of GlobalMenu methods or else the component
// will not add 'active' class to top-level menus when browsing other modules
const mapStateToProps = state => {
    const { pathname } = window.location

    return {
        pathname
    }
}

export default connect(mapStateToProps)(GlobalMenu)