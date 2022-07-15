import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'

import { css } from '../../../../service/common'
import {
    Icon,
    Button,
    GlobalNavigationBarDropdown,
    IconSettings
  } from '@salesforce/design-system-react';

/**
 * Global Menu bar - Dropdown
 * @param {object} props
 * @param {object} [props.datas]
 * @param {array} [props.menus]
 * @param {string} [props.className]
 * @param {string} [props.href]
 * @param {string} [props.label]
 * @param {string} [props.id]
 */
const SLDSGlobalMenuDropDown = React.forwardRef(
    
    /**
     * @typedef {typeof defaultProps} Props
     * @param {React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & Props} props 
     * @param {React.Ref<HTMLFormElement>} ref
     */
    (props, ref) => {

    let { menu, submenus, id, href, label, className, active } = props;
    return (
        <li class={"slds-context-bar__item "+active} role="presentation">
            <GlobalNavigationBarDropdown
                className={className}
                assistiveText={{ icon: 'expand' }}
                label={label}
                id={id}
                href={href}
                options={menu.submenus ? menu.submenus : []}
                onSelect={(val) => props.redirectTo(val)}
            />
        </li>
    )
});

/**
 * Global Menu bar - Dropdown with close icon for Item
 * @param {object} props
 * @param {object} [props.datas]
 * @param {array} [props.menus]
 * @param {string} [props.className]
 * @param {string} [props.href]
 * @param {string} [props.label]
 * @param {string} [props.id]
 */
const SLDSGlobalMenuItemDropDown = React.forwardRef(
    
    /**
     * @typedef {typeof defaultProps} Props
     * @param {React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & Props} props 
     * @param {React.Ref<HTMLFormElement>} ref
     */
    (props, ref) => {

    let { menu, submenus, id, href, label, className, active } = props;
    return (
        <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
            <li class={"slds-context-bar__item "+active} role="presentation">
                <GlobalNavigationBarDropdown
                    className={className}
                    assistiveText={{ icon: 'expand' }}
                    label={label}
                    id={id}
                    href={href}
                    options={menu.submenus ? menu.submenus : []}
                    onSelect={(val) => props.redirectTo(val)}
                />
                <div class="slds-context-bar__icon-action slds-col_bump-left slds-p-left_none">
                    <button class="slds-button slds-button_icon slds-button_icon-current-color slds-button_icon-container slds-button_icon-x-small" tabindex="-1" title={"Close "+label} onClick={() => props.onClose()}>
                        <Icon
                            assistiveText={{ label: 'Close' }}
                            category="utility"
                            name="close"
                            size="x-small"
                        />
                        <span class="slds-assistive-text">Close {label}</span>
                    </button>
                </div>
            </li>
        </IconSettings>
    )
});

const defaultProps = {
    /**
     * @type {object}
     */
    menu: {},

    /**
     * @type {array}
     */
    submenus: [],

    /**
     * @type {string}
     */
    id: 'menu-link',

    /**
     * @type {string}
     */
    label: 'Menu',

    /**
     * @type {string}
     */
    className: 'cus-slds_dropdown_menu',
}

SLDSGlobalMenuDropDown.defaultProps = defaultProps;
export { SLDSGlobalMenuDropDown, SLDSGlobalMenuItemDropDown };