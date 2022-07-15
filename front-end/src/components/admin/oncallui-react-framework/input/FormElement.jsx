import React from 'react'
import { ARF } from "../services/ARF";
import classNames from "classnames";

const FormElement = function(props) {
    let classes = classNames({"slds-form-element":true, "slds-has-error": !!props.errorText})
    return (
        <div id={ARF.uniqid(props)} className={classes} >
            {props.children}
        </div>
    )
}

export default FormElement