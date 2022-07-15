import React from 'react'
import PropTypes from 'prop-types';
import { ARF } from "../services/ARF";
import FormElement from './FormElement';
import Label from './Label';

const RadioList = function (props) {
    let _this = {
        name: props.name || '',
        required: props.required || false,
        label: props.label || '',
        id: ARF.uniqid(props, 'label'),
        onChange: props.onChange || (() => {return true}),
        checked: props.checked || false,
        options: props.options || [],
        inline: props.inline || false
    }
    return (
        <FormElement>
            <Label text={_this.label} required={_this.required} />
            <FormElement>
            {
                _this.options.map((option) => {
                    return (
                            <span className={`slds-radio ${_this.inline && "slds-float_left"}`}>
                                <input type="radio" id={option.id} value={option.value} name={_this.name} onChange={(e) => _this.onChange(e)} checked={props.value === option.value} disabled={props.disabled || option.disabled || false} />
                                <label className="slds-radio__label" htmlFor={option.id}>
                                    <span className="slds-radio_faux"></span>
                                    <span className="slds-form-element__label">{option.label}</span>
                                </label>
                            </span>
                        )
                })
            }
            </FormElement>
        </FormElement>
    )
}

export default RadioList