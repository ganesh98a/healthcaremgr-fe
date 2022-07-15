import { Icon, InputIcon } from '@salesforce/design-system-react';
import React from 'react';

export default function ListBoxItem(props) {
    return (
        <li onClick={e => props.onClick(e) || (() => { return false })} key={props.key || ""} role="presentation" class="slds-listbox__item">
            <div style={props.selected && { backgroundColor: "#f3f2f2" } || {}} class="slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline" aria-selected="false" draggable="true" role="option" tabindex={props.tabindex || 0}>
                <span class="slds-media__body">
                    <span class="slds-truncate" title="Option 1">{props.item.label}</span>
                    {props.clearable && <InputIcon
                        assistiveText={{
                            icon: 'Clear',
                        }}
                        name="clear"
                        category="utility"
                        onClick={(e) => {
                            props.onClear(e, props.item)
                        }}
                        style={{ margin: "auto 5px" }}
                    />}
                </span>

            </div>
        </li>
    );
}
