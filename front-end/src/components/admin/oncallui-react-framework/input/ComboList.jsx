import { Combobox } from '@salesforce/design-system-react';
import React from 'react'
import { validate } from '../services/ARF';
import FormElement from './FormElement';
import Label from './Label';

const ComboList = function (props) {
    let error = props.errorText || props.warningText;
    return (
        <FormElement errorText={error}>
            <Combobox
                id={props.id}
                classNameContainer="combox_box-to-cus-contact"
                events={{
                    onChange: (event, { value }) => {
                        if (props.events) {
                            props.events.onChange(event, value);
                        }
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        if (props.events) {
                            props.events.onRequestRemoveSelectedOption(event, data);
                        }
                    },
                    onBlur: (event, data) => {
                        if (props.events) {
                            let errors = validate(props.labels.label, props.selection, props.validate)
                            props.events.onBlur(event, data, errors);
                        }
                    },
                    onSubmit: (event, { value }) => {
                        if (props.events) {
                            props.events.onSubmit(event, { value });
                        }
                    },
                    onSelect: (event, data) => {
                        if (props.events) {
                            props.events.onSelect(event, data);
                        }
                    },
                }}
                labels={props.labels}
                menuItemVisibleLength={5}
                options={props.options
                }
                selection={props.selection}
                value={props.value}
                optionsAddItem={props.optionsAddItem}
                required={props.required}
                name={props.name}
                disabled={props.disabled}
                variant={props.variant}
            />
            {
                error && <Label errorText={props.errorText} warningText={props.warningText} text={error} />
            }
        </FormElement>
    )
}

export default ComboList;