import React from 'react'
import { ARF } from "../services/ARF";

const Form = React.forwardRef(
    (props, ref) => {
        return (
            <form id={ARF.uniqid(props)} autoComplete="off" className="slds_form" ref={ref} style={{ paddingBottom: props.paddingBottom || 100, display: 'block' }}>
            {
                props.children
            }
        </form>
        )
    }
)
export default Form;