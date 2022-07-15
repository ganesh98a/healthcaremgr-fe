import React, { Component } from 'react';
import ReactResponsiveSelect from 'react-responsive-select';


const multiSelectOptionMarkup = (text) => (
    <div>
        <span className="rrs_select"> {text}</span>
        <span className="checkbox">
            <i className="icon icon-star2-ie"></i>
        </span>

    </div>
);

const caretIcon = (
    <i className="icon icon-edit1-ie"></i>
);


class ReactStarSelect extends Component {

    constructor() {
        super();
        this.state = {


        }
    }


    render() {


        const options2 = [
            { text: 'Select Allocations:', optHeader: true },
            {
                value: 'Alfa',
                text: 'Alfa',
                markup: multiSelectOptionMarkup('Alfa'),
            },
            {
                value: 'fiat',
                text: 'Fiat',
                markup: multiSelectOptionMarkup('Fiat'),
            },
            {
                value: 'ferrari',
                text: 'Ferrari',
                markup: multiSelectOptionMarkup('Ferrari'),
            },
            {
                value: 'mercedes',
                text: 'Mercedes',
                markup: multiSelectOptionMarkup('Mercedes'),
            },
            {
                value: 'tesla',
                text: 'Tesla',
                markup: multiSelectOptionMarkup('Tesla'),
            },
            {
                value: 'volvo',
                text: 'Volvo',
                markup: multiSelectOptionMarkup('Volvo'),
            },
            {
                value: 'zonda',
                text: 'Zonda',
                markup: multiSelectOptionMarkup('Zonda'),
            },
        ]

        const selectedVals = ['Alfa','ferrari'];



        return (
            <div className="mb-3 Cust_Sel_2 cmn_select_dv">
                <ReactResponsiveSelect
                    multiselect
                    name="make6"
                    options={options2}
                    onSubmit={() => { /* console.log("Handle form submit here") */ }}
                    noSelectionLabel="Please select"
                    caretIcon={caretIcon}
                    // onChange={(newValue) => { console.log(newValue) }}
                    selectedValues={selectedVals}
                />
            </div>
        );
    }
}

export default ReactStarSelect;