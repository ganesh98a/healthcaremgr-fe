import React from 'react'
import { ARF } from '../services/ARF';
import FormElement from './FormElement'
import Label from './Label'
/**
 * 
 * @param {object} props 
 *  wrapperClass | type | name | placeholder | label | maxLength | required{true,false} | value | className
 */
const Search = function (props) {
    let _this = {
        wrapperClass: props.wrapperClass || "slds-form-element__control",
        type: props.type || "text",
        name: props.name || "name",
        placeholder: props.placeholder || props.label,
        label: props.label || props.name,
        maxLength: props.maxLength || "250",
        value: props.value,
        className: props.className || "slds-input"

    };
    return (
        <FormElement>
            <Label text={_this.label} required={_this.required} />
            <div className={_this.wrapperClass}>
                <input id={ARF.uniqid(props)} type={_this.type}
                    name={_this.name}
                    placeholder={_this.placeholder}
                    onChange={(e) => props.handleChange(e)}
                    value={props.value || ''}
                    maxLength={_this.maxLength}
                    className={_this.className}
                    required={_this.required}
                />
            </div>
        </FormElement>
    )
}

export default Search