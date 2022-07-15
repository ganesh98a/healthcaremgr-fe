import React from 'react'
import Text from '../input/Text'
import {Lookup} from '../input/Lookup'
import { ARF } from '../services/ARF';
/**
 * 
 * @param {object} props 
 *  wrapperClass | type | name | placeholder | label | maxLength | required{true,false} | value | className
 */
const Col50 = function (props) {
    let _this = {
        input: props.input || false,
        lookup: props.lookup || false,
        id: ARF.uniqid(props, 'col'),
        style: props.style && {...props.style} || {}
    };
    return (
        <div id={_this.id} style={{..._this.style}} className="col-lg-6 col-sm-6">
            {_this.input && <Text onChange={(e) => _this.input.onChange(e)} {..._this.input} />}
            {_this.lookup && <Lookup value={_this.lookup.value} onChange={(e) => _this.lookup.onChange(e)} {..._this.lookup} loadOptions={(e) => _this.lookup.loadOptions(e)} />}
            {props.children}
        </div>
    )
}

export default Col50;