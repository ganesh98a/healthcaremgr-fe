import React from "react";

export function toggleRow() {

}

const RadioColumn = (props) => {
    return ({
        _label: 'ID',
        accessor: "id",
        id: 'id',
        Header: () => (
            <div className="slds-radio">
                &nbsp;&nbsp;&nbsp;
            </div>
        ),
        width: '1.5rem',
        Cell: original => {
            let checked = (props.value == original.value)? true:false;
            return (
                <div className="slds-radio">
                    <input value={original.value} type="radio" name={props.name} id={`radio_${original.value}`} onClick={(e) => props.onClick && props.onClick(e, original.value)} checked={checked} />
                    <label className="slds-radio__label" htmlFor={`radio_${original.value}`}>
            <span className="slds-radio_faux">{console.log(original.value + ':' +checked)}</span>
                    </label>
                </div>
            )
        }
    }
    )
}

export default RadioColumn;