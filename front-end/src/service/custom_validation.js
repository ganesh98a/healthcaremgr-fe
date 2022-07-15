import validator from 'validator';
import React, { Component } from 'react';

export const required = (value) => {
    if (!value.toString().trim().length) {
        return <div className={'tooltip fade top in select-validation-error'} role="tooltip">
        <div className="tooltip-arrow"></div><div className="tooltip-inner">This field is required.</div></div>
    }
};

export const email = (value) => {
    if (!validator.isEmail(value)) {
        return `${value} is not a valid email.`
    }
};