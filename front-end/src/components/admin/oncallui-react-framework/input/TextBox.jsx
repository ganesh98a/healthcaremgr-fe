import React from 'react'
import { ARF } from '../services/ARF';
import {Input, InputIcon} from '@salesforce/design-system-react';

const TextBox = function (props) {
    let _this = {
        wrapperClass: props.wrapperClass || "arf-input",
        type: props.type || "text",
        name: props.name || "name",
        placeholder: props.placeholder || props.label,
        label: props.label || props.name,
        maxLength: props.maxLength || "250",
        required: props.required,
        value: props.value,
        className: props.className || "",
        readOnly: props.readOnly || false

    };
    let rightIcon  = false;
    if (props.iconRight && props.iconRight === "search") {
        rightIcon = (
                <InputIcon
                    assistiveText={{
                        icon: 'Search',
                    }}
                    name="search"
                    category="utility"
                />
        )
    }
    let style = {border: "1px solid #dddbda"};
    if (_this.readOnly) {
        style["backgroundColor"] = "white";
    }
    return (
        <Input id={ARF.uniqid(props)} type={_this.type}
            name={_this.name}
            placeholder={_this.placeholder}
            onChange={(e) => props.onChange(e) || undefined}
            onClick={(e) => typeof props.onClick === "function" && props.onClick(e)}
            value={props.value || ''}
            maxLength={_this.maxLength}
            className={_this.className}
            required={_this.required}
            iconRight={
                rightIcon
            }
            readOnly={_this.readOnly}
            styleInput={style}
        />
    )
}

export default TextBox