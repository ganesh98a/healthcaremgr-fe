import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'

import { css } from '../../../../service/common'
import { SLDSIcon } from './SLDS'
import { Button } from '@salesforce/design-system-react'

/**
 * 
 * @param {object} props
 * @param {string | React.ReactNode} props.title
 * @param {string} [props.link]
 * @param {string | string[] | Record<string, boolean>} [props.className]
 * @param {string} [props.assistiveText]
 * @param {string} [props.icon]
 * @param {string} [props.id]
 * @param {boolean} [props.selected]
 * @param {string} [props.description]
 */
export const SLDSPathItem = ({ 
    title,
    link = undefined,
    className = '',
    onClick= () => {},
    assistiveText = undefined,
    icon = 'check',
    id = undefined,
    selected = true,
    description = undefined,
    
}) => {
    const styles = css({
        root: { 
            borderTopLeftRadius: '0 rem',
            borderBottomLeftRadius: '0 rem',
        }
    })

    const linkClassNames = classNames("SLDSPathItem slds-path__item", className)

    const handleClickLink = e => {
        e.preventDefault()
    }

    return (
        <li className={linkClassNames} role="presentation" style={styles.root} onClick={onClick}>
            <a aria-selected={selected} className="slds-path__link" href={link} id={id} role="option" tabIndex="0" title={description}>
                <span className="slds-path__stage">
                    {
                        icon && (
                            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                <SLDSIcon icon={icon}/>
                            </svg>
                        )
                    }
                    { assistiveText && <span className="slds-assistive-text">{assistiveText}</span> }
                </span>
                <span className="slds-path__title">{title}</span>
            </a>
        </li>
    )
}


/**
 * 
 * @param {object} props
 * @param {string} [props.stage]
 * @param {string} [props.buttonText]
 * @param {boolean} [props.disabled]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClickShowMore]
 */
export const SLDSPathAction = ({     
    buttonText = `Mark Status as Complete`, 
    onClick=undefined,
    disabled=false,
    onClickShowMore=undefined,
    path=path,
    currentPath = path.find(item => {
        if (item.className.includes("slds-is-current")) {
            return item;
        }
    })
}) => {
    let stage = currentPath;
    if(!currentPath) {        
        stage = path.find(item => {
            if (item.className.includes("slds-is-active")) {
                return item;
            }
    });
}
    return (
        <div className="slds-grid slds-path__action">
            <span className="slds-path__stage-name">Stage: {(stage)?stage.title:''}</span>
            <Button
                type="button"
                iconCategory="utility"
                iconName="check"
                iconPosition="left"
                variant="brand"
                label={buttonText}
                onClick={onClick}
                disabled={disabled}
                className={[`slds-path__mark-complete`]}
            />
            {/* <Button 
                label
                type="button"
                className={[`slds-path__trigger-coaching-content`]}
                aria-expanded="false"
                onClick={onClickShowMore}
            /> */}
        </div>
    )
}


/**
 * 
 * @param {object} props
 * @param {boolean} [props.hasCoaching]
 * @param {any} [props.actionProps]
 * @param {string} [props.className]
 * @param {any[]} [props.path]
 */
export const SLDSPath = props => {
    const { actionProps, hasCoaching, className, path } = props
    const pathClassNames = classNames('SLDSPath', 'slds-path', hasCoaching && 'slds-path_has-coaching', className)

    return (
        <div className={pathClassNames}>
            <div className="slds-grid slds-path__track">
                <div className="slds-grid slds-path__scroller-container">
                    <div className="slds-path__scroller" role="application">
                        <div className="slds-path__scroller_inner">
                            <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">
                                {
                                    path.map((p, i) => {
                                        return (
                                            <SLDSPathItem key={i} {...p} />
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                {
                    actionProps && (
                        <SLDSPathAction {...actionProps} path={path} />
                    )
                }
            </div>
        </div>
    )
}