import React from 'react'
import Text from '../input/Text'
import {Lookup} from '../input/Lookup'
import { ARF } from '../services/ARF';
import { Textarea } from '@salesforce/design-system-react';
import classNames from 'classnames';

const Col = function (props) {
    let _this = {
        input: props.input || false,
        lookup: props.lookup || false,
        id: ARF.uniqid(props, 'col'),
        classes: classNames("col-lg-12 col-sm-12", props.className)
    };
    return (
        <div style={props.style || {}} id={_this.id} className={props.className || "col-lg-12 col-sm-12"}>
            {_this.input && <Text onChange={(e) => _this.input.onChange(e)} {..._this.input} />}
            {_this.lookup && <Lookup value={_this.lookup.value} onChange={(e) => _this.lookup.onChange(e)} {..._this.lookup} loadOptions={(e) => _this.lookup.loadOptions(e)} />}
            {props.textarea && <Textarea {...props.textarea} />}
            {props.children}
        </div>
    )
}

export default Col;