import { Timepicker, IconSettings } from '@salesforce/design-system-react';
import React from 'react'
import { ARF } from '../services/ARF';
import FormElement from './FormElement'
import Label from './Label'
import classNames from "classnames";
/**
 * @example
 *  <TimeSelect name="" id="" label="" value={} formatter={(date) => { date && date.toLocaleTimeString(navigator.language, { hour: '2-digit',minute: '2-digit',}) || null}} onDateChange={(date, inputStr) => {}} />
 */
const TimeSelect = function (props) {
    let error = props.errorText || props.warningText || false;
    let classes = classNames("slds-form-element__control timepickerselected", props.className || [])
    return (
        <FormElement errorText={error}>
            <div className={classes} onBlur={(e) => props.onBlur(e)}>
                <Timepicker
                    label={props.label}
                    stepInMinutes={10}
                    required={props.required || false}
                    name={props.name}
                    id={props.id}
                    menuPosition="relative"
                    strValue={props.strValue}
                    formatter={date => { return props.formatter(date) }}
                    onDateChange={(date, inputStr) => { props.onDateChange(date, inputStr) }}
                />
            </div>
            {
                error && <Label errorText={props.errorText} warningText={props.warningText} text={error} />
            }
        </FormElement>
    )
}

export default TimeSelect