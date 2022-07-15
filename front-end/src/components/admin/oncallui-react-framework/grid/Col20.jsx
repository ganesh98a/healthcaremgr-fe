import React from 'react'
import { ARF } from '../services/ARF';

const Col20 = function (props) {
    let _this = {
        input: props.input || false,
        lookup: props.lookup || false,
        id: ARF.uniqid(props, 'col')
    };
    return (
        <div style={props.style} id={_this.id} className="col-lg-2 col-sm-2">
            {props.children}
        </div>
    )
}

export default Col20;