import { Textarea as TA } from '@salesforce/design-system-react';
import React from 'react'
import { ARF } from '../services/ARF';
import FormElement from './FormElement'
import Label from './Label'
/**
 * 
 */
const TextArea = function (props) {
    let error = props.errorText || props.warningText || false;
    return (
        <FormElement errorText={error}>
            <Label text={props.label} required={props.required || false} />
            <div className={props.wrapperClass || ""}>
                <TA
					id={props.id || props.name}
                    required={props.required || false}
                    className="slds-textarea"
                    name={props.name}
                    placeholder={props.placeholder}
                    onChange={(e) => {
                        props.onChange(e)
                    }}
                    value={props.value}
				/>
            </div>
            {
                error && <Label errorText={props.errorText} warningText={props.warningText} text={error} />
            }
        </FormElement>
    )
}

export default TextArea