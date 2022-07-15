import React from "react";
import { defaultSpaceInTable } from '../services/custom_value_data';

const IDColumn = {
    _label: 'ID',
    accessor: "id",
    Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
    Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
}

export default IDColumn;