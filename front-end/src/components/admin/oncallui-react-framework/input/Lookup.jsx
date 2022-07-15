import React from 'react'
import  SLDSReactSelect from '../salesforce/lightning/SLDSReactSelect';
import FormElement from './FormElement'
import Label from './Label'
import { ARF, validate } from '../services/ARF';
/**
 * @example <Lookup label="" id="" value={} required={false} loadOptions={e => {}} onChange={e => {}} />
 */
export const Lookup = function (props) {
    let _this = {
        label: props.label || props.name, 
        required: props.required,
        value: props.value,
        lookup: props.lookup,
        placeholder: props.placeholder || "Please Search"
    };
    let error = props.errorText || props.warningText || false;
    let validations = props.validate || {};
    return (
            <FormElement errorText={error}>
                <Label {..._this} />
                <div id={ARF.uniqid(props)} className={_this.wrapperClass}>
                    <SLDSReactSelect.Async 
                        name={props.name || false}
                        id={props.id || ""}
                        required={_this.required} 
                        placeholder={_this.placeholder} 
                        value={props.value} 
                        onChange={(e) => props.onChange(e)} 
                        loadOptions = {(e) => props.loadOptions(e)}     
                        clearable={props.clearable || false} 
                        disabled={props.disabled || false} 
                        cache={props.cache || false}
                        optionComponent={props.optionComponent}
                        onBlur={e => {
                                    e.preventDefault();
                                    if (typeof props.onBlur === "function") {
                                        let errors = validate(_this.label, _this.value.value, validations);
                                        props.onBlur(errors);
                                    }
                        }}
                        {...validations}
                    />
                </div>
                {
                    error && <Label errorText={props.errorText} warningText={props.warningText} text={error} />
                }
            </FormElement>
    )
}