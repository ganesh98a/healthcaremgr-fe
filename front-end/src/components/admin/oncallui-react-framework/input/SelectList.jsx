import React from 'react'
import { ARF } from '../services/ARF';
import FormElement from './FormElement'
import Label from './Label'
import SLDSReactSelect from "../salesforce/lightning/SLDSReactSelect";

const SelectList = function (props) {
    let _this = {
        options: props.options || [],
        wrapperClass: props.wrapperClass || "slds-form-element__control",
        name: props.name || "name",
        label: props.label || props.name,
        required: props.required || false,
        value: props.value || '',
        onChange: (value) => props.onChange(value),
        clearable: props.clearable || false,
        searchable: props.searchable || false
    };
    let error = props.errorText || props.warningText;
    return (
        <FormElement errorText={error}>
            <Label text={_this.label} required={_this.required} />
            <div className={_this.wrapperClass}>
                <SLDSReactSelect
                    id={props.id || props.name}
                    disabled={props.disabled || false}
                    simpleValue={props.simpleValue || true}
                    className="custom_select default_validation"
                    options={_this.options}
                    onChange={(value) => _this.onChange(value)}
                    value={_this.value}
                    clearable={_this.clearable}
                    searchable={_this.searchable}
                    placeholder="Please Select"
                    name={_this.name}
                    autofill="off"
                    required={_this.required}
                />
            </div>
            {
                error && <Label errorText={props.errorText} warningText={props.warningText} text={error} />
            }
        </FormElement>
    )
}

export default SelectList