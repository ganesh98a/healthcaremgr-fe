import React from "react";
import { defaultSpaceInTable } from '../services/custom_value_data';
import { Link } from 'react-router-dom';
import { DATE_FORMAT } from '../constants';
import moment from 'moment';

const TableColumns = (_props) => {
    let cols = [];
    if (typeof _props === 'object') {
        cols = _props.map(col => {
            if (col.label && col.accessor) {
                const style= {
                    style : "width:96px"
                }
                
                return (
                    {
                        _label: col.label,
                        accessor: col.accessor,
                        id: col.id || col.accessor,
                        Header: ({ data, column }) => <div style={style} className="slds-truncate">{column._label}</div>,
                        Cell: props => {
                            let value = typeof col.format === 'function' ? col.format(props.value) : col.format === 'date' ? moment(props.value).format(DATE_FORMAT) : props.value;
                            if (col.options) {
                                let option = col.options.filter(val => val.value === value);
                                value = option.length && option[0].label;
                            }
                            let col_style = {};
                            if (col.style) {
                                col_style = {...col.style};
                            }
                            return (
                                <span title={col.title || ''} style={{...col_style}} onClick={(e) => col.onClick && col.onClick(e, props.original.id, props.value)} className="slds-truncate">
                                    {!col.link && defaultSpaceInTable(value)}
                                    {col.link && <Link to={`${col.link}${props.original.id}`} className="default-underlined" style={{ color: '#0070d2' }}>
                                        {defaultSpaceInTable(value)}
                                    </Link>}
                                </span>
                            )
                        }
                    }
                )
            }
            return col;
        });
    }
    return cols;
}
export default TableColumns;