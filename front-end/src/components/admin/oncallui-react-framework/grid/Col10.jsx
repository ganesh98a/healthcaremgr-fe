import React from 'react'
import Text from '../input/Text'
import {Lookup} from '../input/Lookup'
import { ARF } from '../services/ARF';

const Col10 = function (props) {
    let _this = {
        input: props.input || false,
        lookup: props.lookup || false,
        id: ARF.uniqid(props, 'col')
    };
    return (
        <div style={props.style} id={_this.id} className={`col-lg-1 col-sm-1 ${props.class ? props.class : ''}`}>
            {_this.input && <Text onChange={(e) => _this.input.onChange(e)} {..._this.input} />}
            {_this.lookup && <Lookup value={_this.lookup.value} onChange={(e) => _this.lookup.onChange(e)} {..._this.lookup} loadOptions={(e) => _this.lookup.loadOptions(e)} />}
            {props.children}
        </div>
    )
}

export default Col10;