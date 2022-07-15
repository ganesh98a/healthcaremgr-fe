import React from "react";
import { Dropdown } from '@salesforce/design-system-react'
/**
 * 
 * @param {*} _props 
 * @param {*} switcher A callback to handle dynalic display of action menu when rendering a cell
 */
const ActionColumn = (_props, switcher) => ({
    _label: 'Action',
    accessor: "action",
    id: "action",
    Header: () => <div style={{ width: '1.5rem' }}></div>,
    width: '1.5rem',
    Cell: props => {
        let options = switcher && _props.options.map(option => switcher(option, props)) || _props.options;
        return (<Dropdown
            assistiveText={{ icon: 'More Options' }}
            iconCategory="utility"
            iconName="down"
            align="right"
            iconSize="x-small"
            iconVariant="border-filled"
            onSelect={(e) => _props.onSelect(e, props.original.id) || (() => { return false })}
            width="xx-small"
            options={options}
        />)
},
    sortable:false
})
export default ActionColumn;