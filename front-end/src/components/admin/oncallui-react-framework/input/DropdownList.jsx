import React from 'react';
import { Dropdown, Tooltip } from '@salesforce/design-system-react';

const DropdownList = function (props) {
    return (
        <div style={{ marginTop: "0px", border: "none" }} className="px-0 py-0 mt-2 d-inline-block attach_bn">
            <Tooltip content={props.tooltip || ""}>
                <div style={{
                    height: "30px",
                    margin: "auto",
                    textAlign: "center",
                    padding: "10px 3px 3px 3px"
                }} className="d-inline-block">

                    <Dropdown
                        assistiveText={{ icon: props.assistiveText || 'More Options' }}
                        iconCategory={props.iconCategory || "utility"}
                        iconName={props.iconName || "standard"}
                        iconVariant={props.iconVariant || "transparent"}
                        onSelect={(value) => {
                            props.onSelect && props.onSelect(value);
                        }}
                        options={props.options || []}
                    />
                </div>
            </Tooltip>
        </div>
    )
}

export default DropdownList;