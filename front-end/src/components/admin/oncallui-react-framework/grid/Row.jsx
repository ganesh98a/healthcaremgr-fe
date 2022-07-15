import React from 'react'
import {ARF} from "../services/ARF";

const Row = function(props) {
    let ps = props.style || {};
    const style = props.border && {
        border: "1px solid #dddbda",
        padding: "10px",
        ...ps
    }
    
    return (
        <div style={style} id={ARF.uniqid} className="row py-2">
            {
                props.children
            }
        </div>
    )
}
export default Row;