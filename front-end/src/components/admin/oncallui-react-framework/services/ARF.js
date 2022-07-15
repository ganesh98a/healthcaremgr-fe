import React from 'react';
import { postData } from '../services/common'

export const ARF = {
    uniqid(args, tagname = '') {
        let auto_id = "arf-" + tagname + Math.random();
        return (typeof args === 'string') ? args : args.id || auto_id;
    },
    ucfirst: str => str.charAt(0).toUpperCase() + str.slice(1),
    isEqual: (val1, val2) => {
        if (typeof val1 === "object") {
            val1 = JSON.stringify(val1);
        }
        if (typeof val2 === "object") {
            val2 = JSON.stringify(val2);
        }
        return val1 === val2;
    }
}

export function fetchApi(apiUrl, params) {
    return new Promise((resolve, reject) => {
        postData(apiUrl, { params }).then(result => {
            if (result.status) {
                resolve(result.data);
            }
        })
            .catch(error => {
                reject(error);
            });
    });
}

export function setStateChild(parent = "", child = {}, obj = {}) {
    let cur_val = obj.state[parent];
    let new_val = { ...cur_val, ...child };
    obj.setState({ [parent]: { ...new_val } });
}

export function getStateChild(parent, child, obj) {
    return obj.state[parent] && obj.state[parent][child] || "";
}

/**
 * get upload file limit
 */
export const getUploadFileLimit = () => {
    return new Promise((resolve) => {
        let cache = sessionStorage.getItem("max_upload_file_limit");
        let error = false;
        if (cache && cache.length) {
            try {
                let data = JSON.parse(cache);
                resolve(data);
            } catch (e) {
                error = true;
            }

        } else {
            error = true;
        }
        if (error) {
            postData("common/Common/max_upload_file_limit").then(result => {
                if (result.status) {
                    let raData = result.data;
                    const res = {
                        data: raData,
                    };
                    sessionStorage.setItem("max_upload_file_limit", JSON.stringify(res));
                    resolve(res);
                } else {
                    const res = {
                        data: [],
                    };
                    resolve(res);
                }
            });
        }
    });
}

/**
 * validate the uploaded file
 */
export const validateUploadedFile = (file, allowExtentsion = [], state = {}) => {
    let validation = { error: true, message: "Invalid file" };
    if (file) {
        var ext = file.name.replace(/^.*\./, '');
        ext = ext.toLowerCase();
        let file_size_bytes = file.size;
        let uploaded_total_bytes = state.uploaded_total_bytes || 0;
        uploaded_total_bytes = uploaded_total_bytes + file_size_bytes;

        if (allowExtentsion.includes(ext)) {
            if (file_size_bytes > state.max_total_bytes) {
                validation.message = getUploadError(2, allowExtentsion, state);
            } else {
                validation = { error: false, message: "File is valid", uploaded_total_bytes, ext };
            }
        } else {
            validation.message = getUploadError(1, allowExtentsion, state);
        }
    }
    return validation;
}

export const getUploadError = (errorCode, allowExtentsion = [], state = {}) => {
    let error = "Invalid file";
    switch (errorCode) {
        case 1:
            if (allowExtentsion && allowExtentsion.length) {
                error = "Sorry we are only supported - " + allowExtentsion.join(", ");
            }
            break;
        case 2:
            error = "Maximum file upload size exceed. Allowed size limit is - " + state.max_upload + " MB only";
            break;
        case 3:
            error = "Maximum file upload size exceed. Total allowed size limit is - " + state.upload_mb + " MB only";
            break;
        case 4:
            error = "Post Content limit exceed. Allowed size limit is - " + state.max_post + " MB only";
        default:
            break;
    }
    return error;
}

export const validatePostSize = (formData, state) => {
    let formdata_size = 0;
    let validation = { error: true, message: "Invalid file" };
    var res = Array.from(formData.entries(), ([key, prop]) => (
        {
            "ContentLength":
                typeof prop === "string"
                    ? formdata_size = formdata_size + prop.length
                    : formdata_size = formdata_size + prop.size
        }));
    /**
        * calcutlate the post content limit
        * ex
        * this.state.byte = 1048576
        * this.state.max_post = 10
        * max_post = 10 * 1048576 = 10485760
        *
    */
    let post_limit = state.byte * state.max_post;
    if (formdata_size > post_limit) {
        validation.message = getUploadError(4, [], state);
    } else {
        validation = { error: false, message: "Valid post size" };
    }

    return validation;
}

export function validate_required(value) {
    if (typeof value === "object") {
        value = JSON.stringify(value);
        if (value === "{}") {
            value = "";
        }
    }
    return value && value.length > 0;
}

export function validate_phone(value) {
   return /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/.test(value);
}

export function validate_email(value) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value));
}
/**
 * 
 * @param {*} name label of field
 * @param {*} rule rule to be validated
 * @param {*} value value of field
 * @param {*} ruleValue value part of the rule e.g. {data-validation-maxlength:6}
 * @returns error message or true
 */
export const applyValidation = (name, rule, value, ruleValue = true) => {
    let validations = {
        "data-validation-required": !validate_required(value) && name + " is required" || true,
        "data-validation-phonenumber": !validate_phone(value) && "Please enter a valid " + name || true,
        "data-validation-email": !validate_email(value) && "Please enter a valid " + name + " address" || true,
        "data-validation-maxlength": value && value.length <= ruleValue && "Please enter a value up to " + ruleValue + " characters" || true
    }
    return validations[rule];
}
/**
 * 
 * @param {React.ref} formRef 
 * @returns Object errors or false
 */
export const validateForm = formRef => {
    let errors = {};
    Object.entries(formRef.current).map(entry => {
        let ele = entry[1];
        let attrs = ele.attributes;
        let name = ele.name;
        if (attrs && attrs.getNamedItem("name")) {
            if (!ele.validationMessage) {
                let req = attrs.getNamedItem("required");
                if (req && !ele.value) {
                    errors[ele.name] = "Please fill out this field";
                    return;
                }
                let phone = attrs.getNamedItem("data-validation-phonenumber");
                if (phone && !validate_phone(ele.value)) {
                    errors[ele.name] = "Please enter a valid phone number";
                    return;
                }
                let email = attrs.getNamedItem("data-validation-email");
                if (email && !validate_email(ele.value)) {
                    errors[ele.name] = "Please enter a valid email address";
                    return;
                }
            }
            if (ele.name && ele.validationMessage) {
                errors[ele.name] = ele.validationMessage;
            } else if (ele.id && ele.validationMessage) {
                errors[ele.id] = ele.validationMessage;
            }
        }        
    })
    if (JSON.stringify(errors) === "{}") {
        errors = false;
    }
    return errors;
};

export const validate = (name, value, validations) => {
    let errors = [];
    Object.keys(validations).map(key => {
        let ruleValue = validations[key];
        let validation = applyValidation(name, key, value, ruleValue);
        if (validation !== true) {
            errors.push(validation);
        }        
    });
    return errors;
}