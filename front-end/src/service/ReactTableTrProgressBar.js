import React, { Component } from 'react';

var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

function _objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
        if (keys.indexOf(i) >= 0)
            continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i))
            continue;
        target[i] = obj[i];
    }
    return target;
}

export const TrComponent = (_ref3) => {

    var children = _ref3.children,
            className = _ref3.className,
            rest = _objectWithoutProperties(_ref3, ['children', 'className']);



    return (<React.Fragment ><div className={"rt-tr "+className} role="row" {...rest}>{children}</div>
        <div className="progressInline" style={{width: _ref3.progress_count + '%'}}></div>
    </React.Fragment>);

        /* return React.createElement(
         'div',
         _extends({ className: classnames('rt-tr new class', className), role: 'row', style: ("color", 'red')}, rest),
         children
         ) */
    }


export const getTrProps = (props, rowInfo) => {
        var progress_count = 0;

        if (rowInfo) {
            progress_count = rowInfo.original.progress_count;
        }
        return{
            'progress_count': progress_count,
        }
    }
