import React from 'react'
import { ARF, validate } from '../services/ARF';
import FormElement from './FormElement'
import Label from './Label';
import 'service/jquery.validate.js';
/**
 * 
 * @param {object} props 
 *  wrapperClass | type | name | placeholder | label | maxLength | required{true,false} | value | className
 */
const Text = function (props) {
    let _this = {
        wrapperClass: props.wrapperClass || "slds-form-element__control",
        type: props.type || "text",
        name: props.name || "name",
        placeholder: props.placeholder || props.label,
        label: props.label || props.name,
        maxLength: props.maxLength || "250",
        required: props.required,
        value: props.value,
        className: props.className || "slds-input"

    };
    let error = props.errorText || props.warningText || false;
    let validations = props.validate || {};
    let value = props.value || '';
    return (
        <FormElement errorText={error || props.hasError}>
            <Label text={_this.label} required={_this.required} />
            <div className={_this.wrapperClass}>
                <input id={ARF.uniqid(props)} type={_this.type}
                    name={_this.name}
                    placeholder={_this.placeholder}
                    onChange={(e) => props.onChange && props.onChange(e)}
                    onClick={(e) => props.onClick && props.onClick(e)}
                    value={value}
                    maxLength={_this.maxLength}
                    className={_this.className}
                    required={_this.required}
                    disabled={props.disabled || false}
                    onBlur={e => {
                                    e.preventDefault();
                                    if (typeof props.onBlur === "function") {
                                        let errors = validate(_this.label, value, validations);
                                        props.onBlur(errors);
                                    }
                                }
                            }
                    {...validations}
                />
            </div>
            {
                error && <Label errorText={props.errorText} warningText={props.warningText} text={error} />
            }
        </FormElement>
    )
}

export default Text