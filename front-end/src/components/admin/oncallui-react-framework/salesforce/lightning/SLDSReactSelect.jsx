import React from 'react'

import _ from 'lodash'
import classNames from 'classnames'
import Select, { Async } from 'react-select-plus'

import { SLDSIcon } from './SLDS'

import '../scss/components/admin/salesforce/lightning/SLDSReactSelect.scss'

const SearchIcon = () => (
    <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right" style={{ marginTop: -6 }}>
        <SLDSIcon icon="search" className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true"/>
    </span>
)

const ArrowIcon = () => (
    <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right" style={{ marginTop: -6 }}>
        <SLDSIcon icon="down" className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true" />
    </span>
)

/**
 * @param {import('react-select').ReactSelectProps} props 
 */
const InputRenderer = (props, isAsync = false, hasValue = false) => inputRendererProps => {
    
    return (
        <span className={`slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right`}>
            <input {...inputRendererProps} name={props.name || ''} id={props.id || ''} autocomplete='off' className={[`slds-input`, inputRendererProps.className].filter(Boolean).join(' ')} disabled={props.disabled}/>
            {
                (() => {
                    if (isAsync) {
                        return !hasValue && <SearchIcon />
                    }

                    return !props.clearable && <ArrowIcon />

                    // return !hasValue && (isAsync || props.searchable ? <SearchIcon /> : <ArrowIcon />)
                })()
            }
            
        </span>
    )
}

const ClearRenderer = hasValue => props => {
    if (!hasValue) {
        return null
    }
    return (
        <button type="button" className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" title="Clear the text input" style={{ marginTop: -1 }}>
            <SLDSIcon icon="clear" className="slds-button__icon" aria-hidden="true"/>
            <span className="slds-assistive-text">Clear the text input</span>
        </button>

        
    )
}

const OptionRenderer = props => {
    return (
        <div aria-selected={props.selected} aria-disabled={props.disabled} className="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-has-focus" role="option">
            <span className="slds-media__figure slds-listbox__option-icon">{props.icon ? props.icon : ``}</span>
            <span className="slds-media__body">
                <span className="slds-truncate" title={props.title}>{props.label}</span>
            </span>
        </div>
    )
}


/**
 * 
 * @param {import('react-select').ReactSelectProps} props 
 */
const SLDSReactSelect = props => {
    
    // if you pass an object to react-select-plus, 
    // it treats it a non empty value even if value attribute is blank
    let val = props.value
    if (typeof props.value === "object") {
        val = _.get(props.value, 'value', false)
    } 

    let hasValue = false
    if ([0, '0', null, false, undefined, ''].indexOf(val) < 0) {
        hasValue = true
    }


    return (
        <Select
            // simpleValue={true}
            {...props}
            arrowRenderer={null}
            searchable={!!props.searchable}
            clearRenderer={ClearRenderer(hasValue)}
            optionRenderer={OptionRenderer}
            inputRenderer={InputRenderer(props, false, hasValue)}
            optionClassName={classNames(`slds-listbox__item`, props.optionClassName)}
            className={classNames(props.className, 'SLDSReactSelect', !hasValue && 'has-no-value')}
        />
    )
}

/**
 * 
 * @param {import('react-select').ReactAsyncSelectProps} props 
 */
SLDSReactSelect.Async = props => {

    // if you pass an object to react-select-plus, 
    // it treats it a non empty value even if value attribute is blank
    let val = props.value
    if (typeof props.value === "object") {
        val = _.get(props.value, 'value', false)
    } 

    let hasValue = false
    if ([0, '0', null, false, undefined, ''].indexOf(val) < 0) {
        hasValue = true
    }

    return (
        <Async
            // simpleValue={true}
            {...props}
            arrowRenderer={null}
            searchable={true}
            clearRenderer={ClearRenderer(hasValue)}
            optionRenderer={OptionRenderer}
            inputRenderer={InputRenderer(props, true, hasValue)}
            optionClassName={classNames(`slds-listbox__item`, props.optionClassName)}
            className={classNames(props.className, 'SLDSReactSelect', !hasValue && 'has-no-value')}
        />
    )
}


export default SLDSReactSelect