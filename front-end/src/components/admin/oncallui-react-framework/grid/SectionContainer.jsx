import React from 'react'
import {ARF} from "../services/ARF";

const SectionContainer = function(props) {
    return (
        <section id={ARF.uniqid} className="manage_top" >
            <div id={ARF.uniqid} className="container-fluid">
            {
                props.children
            }
            </div>
        </section>
    )
}
export default SectionContainer;