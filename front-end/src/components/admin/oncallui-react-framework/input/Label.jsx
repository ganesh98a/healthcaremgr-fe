import React from 'react'
import PropTypes from 'prop-types';
import {ARF} from "../services/ARF";
import classNames from "classnames";
import { Icon } from '@salesforce/design-system-react';
/**
 * Provide label for input field - import Label from '@oncallui/react-framework/input/Label'
 */
const Label = function(props) {
    let _this = {
        required: props.required || false,
        text: props.text || props.label || props.name || '',
        id: ARF.uniqid(props, 'label'),
        class: props.className || ""
    }
    let classes = classNames({"slds-form-element__label": true, "slds-form-element__help": !!props.errorText})
    classes += " " + _this.class;
    let iswarn = props.errorText || props.warningText;
    let color = props.errorText && "error" || "warning";
    let style = props.errorText && {color: "red"};
    return (   
        (_this.text || props.children) &&
        (<label style={{...props.style, ...style} || ""} id={_this.id} className={classes} >
            {iswarn && 
            <span style={{paddingRight:"2px"}}>
                <Icon
                    assistiveText={{ lable: 'Warning' }}
                    category="utility"
                    colorVariant={color}
                    name="warning"
                    size="x-small"
                />
                </span>
            }
            {_this.required && <abbr className="slds-required" title="required">* </abbr>}
            {_this.text}
            {props.children}
        </label>) || ""
    )
}
Label.propTypes = {
    /**
     * Set to "true" if filed is required, default is optional
     */
    required: PropTypes.bool
}
export default Label