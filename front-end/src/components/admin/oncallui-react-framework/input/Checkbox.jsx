import React from 'react';

const Checkbox = (props) => {
    let checked = props.value? "checked" : false;
    return (
        <div class="slds-form-element" style={{...props.style}}>
            <div class="slds-form-element__control">
                <div class="slds-checkbox">
                    <input type="checkbox" name={props.name} id={props.id || ""} value={props.value} checked={checked} onClick={e => props.onClick(e)} disabled={props.disabled || false} />
                    {props.label && <label class="slds-checkbox__label slds-form-element__label" for={props.id || ""}>
                        <span class="slds-checkbox_faux"></span>
                        <span class="slds-form-element__label">{props.label}</span>
                    </label>}
                </div>
            </div>
        </div>
    )
}

export default Checkbox;