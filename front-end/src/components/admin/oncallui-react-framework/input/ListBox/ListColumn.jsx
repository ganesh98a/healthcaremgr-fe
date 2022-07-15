import React from 'react';
import ListBoxItem from './ListBoxItem';
import Loading from '../../view/Loading';

export default function ListColumn(props) {
    return (
        <div class="slds-dueling-list__column">
            <span class="slds-form-element__label" id="label-7">{props.heading || ""}</span>
            <div class="slds-dueling-list__options">
                {
                    props.loading && <Loading /> ||

                    <ul aria-describedby="option-drag-label" aria-labelledby="label-7" aria-multiselectable="true" class="slds-listbox slds-listbox_vertical" role="listbox">
                        {
                            props.options.map((item, index) => {
                                return (
                                    <ListBoxItem onClear={(e, item) => props.onClear(e, item)} clearable={props.clearable} selected={JSON.stringify(props.selected) === JSON.stringify(item)} onClick={(e) => props.onItemSelected(e, item)} key={index} item={item} />
                                )
                            })
                        }
                    </ul>
                }
            </div>
        </div>
    )
}