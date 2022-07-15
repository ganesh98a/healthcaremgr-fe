import React, { Component } from "react";
import jQuery from "jquery";
import moment from "moment-timezone";
import axios from "axios";
import { ROUTER_PATH, BASE_URL, LOGIN_DIFFERENCE, PIN_DATA, REGULAR_EXPRESSION_FOR_NUMBERS, CMS_URL } from "config.js";
import { confirmAlert, createElementReconfirm } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import _ from "lodash";
import "./jquery.validate.js";
import "./custom_script.js";
import { NavLink } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastUndo } from "service/ToastUndo.js";

import { INVOICE_GST } from "./OcsConstant.js";
import { orgStatsSquareBox } from "./CustomContentLoader.js";
import escapeRegExp from 'lodash.escaperegexp';

import { Base64 } from 'js-base64';
//check user login or not
export function checkItsLoggedIn() {
    if (getLoginToken()) {
        window.location = ROUTER_PATH + "admin/dashboard";
    }
}

export function checkItsNotLoggedIn() {
    check_loginTime();

    if (!getLoginToken()) {
        window.location = ROUTER_PATH;
    }
}

export function checkItsJson(text) {
    try {
        JSON.parse(text);
    } catch (e) {
        return false;
    }
    return true;
}

export function checkLoginWithReturnTrueFalse() {
    if (!getLoginToken()) {
        return false;
    } else {
        return true;
    }
}

export function checkPin(typeData = "") {
    let pinTypeData = getPinToken();
    let pinData = PIN_DATA;
    //console.log(pinData);
    let type = typeData != "" && pinData.hasOwnProperty(typeData) ? pinData[typeData] : "";
    pinTypeData = pinTypeData != null && pinTypeData != undefined && pinTypeData != "" ? JSON.parse(pinTypeData) : {};
    if (type != "" && pinTypeData.hasOwnProperty(type) && pinTypeData[type] != "") {
        return true;
    } else {
        return false;
    }
}

export function setRemeber(data) {
    var d = new Date();
    var cookieDays = 7;
    d.setTime(d.getTime() + cookieDays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();

    setCookie("adminUsername", data.username, cookieDays);
    setCookie("adminPassword", data.password, cookieDays);
}

export function getRemeber() {
    var username = getCookie("adminUsername");
    var password = getCookie("adminPassword");
    var data = { username: username != undefined ? username : "", password: password != undefined ? password : "" };
    return data;
}

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function getLoginToken() {
    return localStorage.getItem("ocs_token603560");
}

export function setLoginToken(token) {
    localStorage.setItem("ocs_token603560", token);
}

export function getFullName() {
    return localStorage.getItem("user_name");
}

export function setFullName(full_name) {
    localStorage.setItem("user_name", full_name);
}

export function removeLogoutRequiredItem() {
    localStorage.removeItem("ocs_token603560");
    localStorage.removeItem("ocs_pin_token");
    localStorage.removeItem("dateTime");
    localStorage.removeItem("permission");
    localStorage.removeItem("user_name");
    sessionStorage.removeItem("global_menu");
    sessionStorage.removeItem("global_item_menu");
    localStorage.removeItem("uid");
    sessionStorage.removeItem("previous_menu");
}

export function logout() {
    var ss = postData("admin/Login/logout", getLoginToken(ROUTER_PATH));
    removeLogoutRequiredItem();
    if (typeof ss == "object" && ss.hasOwnProperty("status")) {
        window.location = ROUTER_PATH;
    } else {
        setTimeout(function () {
            window.location = ROUTER_PATH;
        }, 300);
    }
}

export function getPinToken() {
    return localStorage.getItem("ocs_pin_token");
}

export function getAllPinToken() {
    return localStorage.getItem("ocs_pin_token");
}

/*
 * check login time if time
 * is more then given
 * time than it will
 * logout diectally
 *
 */
export function getLoginTIme() {
    return localStorage.getItem("dateTime");
}

export function setLoginTIme(token) {
    localStorage.setItem("dateTime", token);
}

export function check_loginTime() {
    var DATE_TIME = getLoginTIme();
    var server = moment(DATE_TIME);

    var currentDateTime = moment();

    const diff = currentDateTime.diff(server);
    const diffDuration = moment.duration(diff);

    if (diffDuration.days() > 0) {
        logout();
    } else if (diffDuration.hours() > 0) {
        logout();
    } else if (diffDuration.minutes() > LOGIN_DIFFERENCE) {
        logout();
    }
}

/*
 *
 */

export function setPinToken(token) {
    return new Promise((resolve, reject) => {
        localStorage.setItem("ocs_pin_token", token);
        setTimeout(() => {
            resolve({ status: true });
        }, 100);
    });
}

export function destroyPinToken(typeData) {
    if (typeof typeData == undefined || typeData == "") {
        localStorage.removeItem("ocs_pin_token");
        window.location = "/admin/dashboard";
    } else {
        let pinTypeData = getPinToken();
        let pinData = PIN_DATA;
        let type = typeData != "" && pinData.hasOwnProperty(typeData) ? pinData[typeData] : "";
        if (type == "") {
            let pinDataValue = _.invert(pinData);
            let typeKey = typeData != "" && pinDataValue.hasOwnProperty(typeData) ? pinDataValue[typeData] : "";
            type = typeKey != "" ? pinData[typeKey] : "";
        }
        pinTypeData = pinTypeData != null && pinTypeData != undefined && pinTypeData != "" ? JSON.parse(pinTypeData) : {};
        if (type != "" && pinTypeData.hasOwnProperty(type)) {
            delete pinTypeData[type];
            setPinToken(JSON.stringify(pinTypeData));
        }
        let urlRedirect = type == "3" && pinTypeData.hasOwnProperty("1") ? "/admin/fms/dashboard/new/case_ongoing" : "/admin/dashboard";
        window.location = urlRedirect;
    }
}

export function getPermission() {
    var AES = require("crypto-js/aes");
    var SHA256 = require("crypto-js/sha256");
    var CryptoJS = require("crypto-js");
    var ciphertext = localStorage.getItem("permission");
    // Decrypt

    try {
        var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), "secret key 123");
        var plaintext = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        var plaintext = undefined;
    }
    return plaintext;
}

export function setPermission(permission) {
    var AES = require("crypto-js/aes");
    var SHA256 = require("crypto-js/sha256");
    var CryptoJS = require("crypto-js");
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(permission), "secret key 123");
    localStorage.setItem("permission", ciphertext);
}

export function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

export function postDataDownload(url, data, filePath) {
    var request_data = { pin: "", token: getLoginToken(), data: data };
    return new Promise((resolve, reject) => {
        fetch(BASE_URL + url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ request_data })
        })
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                // the filename you want
                a.download = filePath;
                document.body.appendChild(a);
                if (blob.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    a.click();
                } else {
                    window.open(url, "_blank");
                }
                window.URL.revokeObjectURL(url);
                resolve({ status: true });
            })
            .catch(() => resolve({ status: false, error: "API ERROR" }));
    });
}
export function postDataDownloadZip(url, data, filePath) {
    var request_data = { pin: "", data: data };
    return new Promise((resolve, reject) => {
        fetch(BASE_URL + url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ request_data })
        })
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.target = "_blank";
                //the filename you want
                a.download = filePath;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                resolve({ status: true });
            })
            .catch(() => resolve({ status: false, error: "API ERROR" }));
    });
}


export function getHeaders() {
    var headers_data = {};
    if (getLoginToken() !== null) {
        headers_data['Authorization'] = 'Bearer ' + getLoginToken();
    }
    return headers_data;
}

export function postData(url, data, obj) {
    var request_data = { pin: getPinToken(), data: data };
    return new Promise((resolve, reject) => {

        const controller = new AbortController();
        const { signal } = controller;

        // request_data["signal"] = signal;

        fetch(BASE_URL + url, {
            signal, 
            method: "POST", 
            headers: getHeaders(),
            body: JSON.stringify({ request_data})})
            .then(response => response.json())
            .then(responseJson => {
                if (url == "admin/Login/logout") {
                    resolve(responseJson);
                    return true;
                }

                // if same account open on another location
                if (responseJson.another_location_opened) {
                    LogoutAccountOpenedAnotherLocation();
                }

                // if jwt token status true mean token not verified
                if (responseJson.token_status) {
                    logout();
                }

                // if token is verified then update date client side time
                if (responseJson.status) {
                    setLoginTIme(moment());
                }

                // if pin status true mean pin token not verified
                if (responseJson.pin_status) {
                    let type = responseJson.hasOwnProperty("pin_type") ? responseJson.pin_type : "";
                    destroyPinToken(type);
                }

                // if ip status true mean ip address change of current user
                if (responseJson.ip_address_status) {
                    logout();
                }

                // if server status true mean request not came at over server
                if (responseJson.server_status) {
                    logout();
                }

                // if permission status true mean not have permission to access this
                if (responseJson.permission_status) {
                    window.location = "/admin/no_access";
                }

                if (!responseJson.another_location_opened) {
                    resolve(responseJson);
                }
            })
            .catch(error => {
                if(error.name === "AbortError" || error.name == 'TypeError') {

                }else{
                    toastMessageShow("API ERROR", "e");
                    resolve({ status: false, error: "API ERROR" });
                }
            });

            if (obj){
                obj.setState({requestedMethod: controller})
            }

    });
}

// arhive anything form table
export function LogoutAccountOpenedAnotherLocation() {
    var msg = <span>This account is opened at another location, you are being logged off.</span>;

    return new Promise((resolve, reject) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                removeLogoutRequiredItem();
                return (
                    <div className="custom-ui">
                        <div className="confi_header_div">
                            <h3>System message</h3>
                        </div>
                        <p>{msg}</p>
                        <div className="confi_but_div">
                            <a href="/" className="Confirm_btn_Conf">
                                {" "}
                                Ok
              </a>
                        </div>
                    </div>
                );
            }
        });
    });
}

//
export function postImageData(url, data, obj) {
    data.append("pin", getPinToken());

    return new Promise((resolve, reject) => {
        axios
        .post(BASE_URL + url, data, {  headers: getHeaders() }, {
                onUploadProgress: progressEvent => {
                    var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (obj != undefined && obj != null && typeof obj == "object" /* && obj.hasOwnProperty('progress') */) {
                        obj.setState({ progress: percentCompleted });
                    }
                }
            })
            .then(response => {
                response = response.data;

                // if jwt token status true mean token not verified
                if (response.token_status) {
                    logout();
                }

                // if token is verified then update date client side time
                if (response.status) {
                    setLoginTIme(moment());
                }

                // if pin status true mean pin token not verified
                if (response.pin_status) {
                    //destroyPinToken();
                    let type = response.hasOwnProperty("pin_type") ? response.pin_type : "";
                    destroyPinToken(type);
                }

                // if ip status true mean ip address change of current user
                if (response.ip_address_status) {
                    logout();
                }

                // if server status true mean request not came at over server
                if (response.server_status) {
                    logout();
                }

                // if permission status true mean not have permission to access this
                if (response.permission_status) {
                    window.location = "/admin/no_access";
                }

                resolve(response);
            })
            .catch(error => {
                reject(error);
                console.error(error);
            });
    });
}

export function IsValidJson() {
    return true;
}

export function checkPinVerified(type) {
    if (!checkPin(type)) {
        destroyPinToken(type);
    }
}

class ArchiveConfirmComponent extends Component {

    static defaultProps = {
        className: 'Confirm_btn_Conf'
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    clickFunction = () => {
        this.setState({ loading: true });
        postData(this.props.url, this.props.data).then(result => {
            this.props.onClosef(this.props.onClosed, result);
        });
    };
    componentWillUnmount() {
        this.setState({ loading: false });
    }

    render() {
        return (
            <button disabled={this.state.loading} className={this.props.className} onClick={() => this.clickFunction()}>
                {this.props.confirm}
            </button>
        );
    }
}

// arhive anything form table
export const archiveALL = (data, msg, url, extraParams) => {
    if (msg) {
        msg = msg;
    } else {
        msg = (
            <span>
                Are you sure you want to archive this item? <br /> Once archived, this action can not be undone.
            </span>
        );
    }

    var confirm = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("confirm") ? extraParams["confirm"] : "Confirm";
    var cancel = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("cancel") ? extraParams["cancel"] : "Cancel";
    var heading_title = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("heading_title") ? extraParams["heading_title"] : "Confirmation";
    let extraClasses = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("content_body_class") ? extraParams["content_body_class"] : "";
    let buttonPositionChanges =
        extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("button_position_change") ? extraParams["button_position_change"] : false;

    return new Promise((resolve, reject) => {
        let loading = false;

        const closeCust = (onClose, res) => {
            resolve(res);
            onClose();
        };

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className={"custom-ui " + extraClasses}>
                        <div className="confi_header_div">
                            <h3>{heading_title}</h3>
                            <span
                                className="icon icon-cross-icons"
                                onClick={() => {
                                    onClose();
                                    resolve({ status: false });
                                }}
                            ></span>
                        </div>
                        <p>{msg}</p>
                        <div className="confi_but_div">
                            {buttonPositionChanges ? (
                                <React.Fragment>
                                    <button
                                        disabled={loading}
                                        className="Cancel_btn_Conf"
                                        onClick={() => {
                                            onClose();
                                            resolve({ status: false });
                                            loading = false;
                                        }}
                                    >
                                        {" "}
                                        {cancel}
                                    </button>
                                    <ArchiveConfirmComponent onClosef={closeCust} confirm={confirm} url={url} data={data} onClosed={onClose} />
                                </React.Fragment>
                            ) : (
                                    <React.Fragment>
                                        <ArchiveConfirmComponent onClosef={closeCust} confirm={confirm} url={url} data={data} onClosed={onClose} />
                                        <button
                                            disabled={loading}
                                            className="Cancel_btn_Conf"
                                            onClick={() => {
                                                onClose();
                                                resolve({ status: false });
                                                loading = false;
                                            }}
                                        >
                                            {" "}
                                            {cancel}
                                        </button>
                                    </React.Fragment>
                                )}
                        </div>
                    </div>
                );
            }
        });
    });
};

// arhive anything form table
export const ConfirmationPopUp = (msg, extraParams) => {
    if (msg) {
        msg = msg;
    } else {
        msg = (
            <span>
                Are you sure you want to archive this item? <br /> Once archived, this action can not be undone.
            </span>
        );
    }

    var confirm = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("confirm") ? extraParams["confirm"] : "Confirm";
    var cancel = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("cancel") ? extraParams["cancel"] : "Cancel";
    var heading_title = extraParams != null && extraParams != undefined && typeof extraParams == "object" && extraParams.hasOwnProperty("heading_title") ? extraParams["heading_title"] : "Confirmation";

    return new Promise((resolve, reject) => {
        let loading = false;

        const closeCust = (onClose, res) => {
            resolve(res);
            onClose();
        };

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="custom-ui">
                        <div className="confi_header_div">
                            <h3>{heading_title}</h3>
                            <span
                                className="icon icon-cross-icons"
                                onClick={() => {
                                    onClose();
                                    resolve({ status: false });
                                }}
                            ></span>
                        </div>
                        <p>{msg}</p>
                        <div className="confi_but_div">
                            <button
                                className="Confirm_btn_Conf"
                                onClick={() => {
                                    onClose();
                                    resolve({ status: true });
                                    loading = false;
                                }}
                            >
                                {confirm}
                            </button>
                            <button
                                disabled={loading}
                                className="Cancel_btn_Conf"
                                onClick={() => {
                                    onClose();
                                    resolve({ status: false });
                                    loading = false;
                                }}
                            >
                                {" "}
                                {cancel}
                            </button>
                        </div>
                    </div>
                );
            }
        });
    });
};


/**
 *
 * @param {Record<string, any>} data The data that will be posted via `postData` utility function
 * @param {string|number|JSX.Element} [msg] Confirmation message. You can use JSX.
 * @param {string} [url] The url that will be posted via `postData` utility function
 * @param {object} [extraParams] Additional options
 * @param {string|number|JSX.Element} [extraParams.confirm] Label for 'confirm' button
 * @param {string|number|JSX.Element} [extraParams.cancel] Label for 'Cancel' button
 * @param {string|number|JSX.Element} [extraParams.heading_title] Heading title
 * @param {string} [extraParams.content_body_class] Classname that will be appended to <body> element when the confirmation modal opens
 * @return {Promise<{[key: string]: any, status?: boolean, error?: string, msg?: string, data?: any}>}
 */
export const AjaxConfirm = (
    data,
    msg = <span>Are you sure you want to do this action?</span>,
    url = null,
    extraParams = {}) => {

    const options = {
        confirm: 'Confirm',
        cancel: 'Cancel',
        heading_title: 'Confirmation',
        content_body_class: '',
        // button_position_change: false, // This is not supported
        ...extraParams,
    }

    return new Promise((resolve, reject) => {
        let loading = false;

        const handleOnSuccess = (onClose, res) => {
            resolve(res);
            onClose();
        };

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <section
                        role="dialog"
                        tabindex="-1"
                        aria-labelledby="ConfirmModalHeading"
                        aria-modal="true"
                        aria-describedby="modal-content-id-1"
                        className={[`slds-modal slds-fade-in-open`, options.content_body_class].filter(Boolean).join(' ')}
                        style={{ fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif`}}
                    >
                        <div className={`slds-modal__container`}>
                            <div className="slds-modal__header">
                                <button
                                    className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"
                                    title="Close" onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    <svg className={`slds-button__icon slds-button__icon_large`} aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d={`M14.6 11.9l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.3-.7-.3-1 0L12.6 10c-.1.2-.4.2-.6 0L6 3.9c-.3-.3-.7-.3-1 0l-1 .9c-.3.3-.3.7 0 1l6.1 6.1c.1.1.1.4 0 .6L4 18.6c-.3.3-.3.7 0 1l.9.9c.3.3.7.3 1 0l6.1-6c.2-.2.5-.2.6 0l6.1 6c.3.3.7.3 1 0l.9-.9c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z`}/>
                                        </svg>
                                    </svg>
                                    <span className="slds-assistive-text">Close</span>
                                </button>
                                <h2 id="ConfirmModalHeading" className="slds-modal__title slds-hyphenate">{options.heading_title}</h2>
                            </div>
                            <div className="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                                {msg}
                            </div>
                            <div className="slds-modal__footer">
                                <button
                                    type={`button`}
                                    className="slds-button slds-button_neutral"
                                    disabled={loading}
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                        loading = false;
                                    }}
                                >
                                    {options.cancel}
                                </button>
                                <ArchiveConfirmComponent
                                    onClosef={handleOnSuccess}
                                    confirm={options.confirm}
                                    url={url}
                                    data={data}
                                    onClosed={onClose}
                                    className={`slds-button slds-button_brand`}
                                />
                            </div>
                        </div>
                    </section>
                );
            }
        });
    });
};

/**
 *
 * @param {string|number|JSX.Element} [msg] Confirmation message. You can use JSX.
 * @param {object} [extraParams] Additional options
 * @param {string|number|JSX.Element} [extraParams.confirm] Label for 'confirm' button
 * @param {string|number|JSX.Element} [extraParams.cancel] Label for 'Cancel' button
 * @param {string|number|JSX.Element} [extraParams.heading_title] Heading title
 * @param {string} [extraParams.content_body_class] Classname that will be appended to <body> element when the confirmation modal opens
 * @return {Promise<{status: boolean}>}
 */
export const Confirm = (
    msg = <span>Are you sure you want to do this action?</span>,
    extraParams = {}) => {

    const options = {
        confirm: 'Confirm',
        cancel: 'Cancel',
        heading_title: 'Confirmation',
        content_body_class: '',
        // button_position_change: false, // This is not supported
        ...extraParams,
    }

    return new Promise((resolve, reject) => {
        let loading = false;

        const handleOnSuccess = (onClose, res) => {
            resolve(res);
            onClose();
        };

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <section
                        role="dialog"
                        tabindex="-1"
                        aria-labelledby="ConfirmModalHeading"
                        aria-modal="true"
                        aria-describedby="modal-content-id-1"
                        className={[`slds-modal slds-fade-in-open`, options.content_body_class].filter(Boolean).join(' ')}
                        style={{ fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif`}}
                    >
                        <div className={`slds-modal__container`}>
                            <div className="slds-modal__header">
                                <button
                                    className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"
                                    title="Close" onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    <svg className={`slds-button__icon slds-button__icon_large`} aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d={`M14.6 11.9l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.3-.7-.3-1 0L12.6 10c-.1.2-.4.2-.6 0L6 3.9c-.3-.3-.7-.3-1 0l-1 .9c-.3.3-.3.7 0 1l6.1 6.1c.1.1.1.4 0 .6L4 18.6c-.3.3-.3.7 0 1l.9.9c.3.3.7.3 1 0l6.1-6c.2-.2.5-.2.6 0l6.1 6c.3.3.7.3 1 0l.9-.9c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z`}/>
                                        </svg>
                                    </svg>
                                    <span className="slds-assistive-text">Close</span>
                                </button>
                                <h2 id="ConfirmModalHeading" className="slds-modal__title slds-hyphenate">{options.heading_title}</h2>
                            </div>
                            <div className="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                                {msg}
                            </div>
                            <div className="slds-modal__footer">
                                <button
                                    disabled={loading}
                                    className="slds-button slds-button_neutral"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                        loading = false;
                                    }}
                                >
                                    {options.cancel}
                                </button>
                                <button
                                    className="slds-button slds-button_brand"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: true });
                                        loading = false;
                                    }}
                                >
                                    {options.confirm}
                                </button>
                            </div>
                        </div>
                    </section>
                );
            }
        });
    });
};

/**
 *
 * @param {string|number|JSX.Element} [msg] Info message. You can use JSX.
 * @param {object} [extraParams] Additional options
 * @param {string|number|JSX.Element} [extraParams.cancel] Label for 'Close' button
 * @param {string|number|JSX.Element} [extraParams.heading_title] Heading title
 * @param {string} [extraParams.content_body_class] Classname that will be appended to <body> element when the confirmation modal opens
 * @return {Promise<{status: boolean}>}
 */
 export const Info = (
    msg = <span>Are you sure you want to do this action?</span>,
    extraParams = {}) => {

    const options = {
        confirm: 'Confirm',
        cancel: 'Close',
        heading_title: 'Info',
        content_body_class: '',
        // button_position_change: false, // This is not supported
        ...extraParams,
    }

    return new Promise((resolve, reject) => {
        let loading = false;

        const handleOnSuccess = (onClose, res) => {
            resolve(res);
            onClose();
        };

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <section
                        role="dialog"
                        tabindex="-1"
                        aria-labelledby="ConfirmModalHeading"
                        aria-modal="true"
                        aria-describedby="modal-content-id-1"
                        className={[`slds-modal slds-fade-in-open`, options.content_body_class].filter(Boolean).join(' ')}
                        style={{ fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif`}}
                    >
                        <div className={`slds-modal__container`}>
                            <div className="slds-modal__header">
                                <button
                                    className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"
                                    title="Close" onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    <svg className={`slds-button__icon slds-button__icon_large`} aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d={`M14.6 11.9l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.3-.7-.3-1 0L12.6 10c-.1.2-.4.2-.6 0L6 3.9c-.3-.3-.7-.3-1 0l-1 .9c-.3.3-.3.7 0 1l6.1 6.1c.1.1.1.4 0 .6L4 18.6c-.3.3-.3.7 0 1l.9.9c.3.3.7.3 1 0l6.1-6c.2-.2.5-.2.6 0l6.1 6c.3.3.7.3 1 0l.9-.9c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z`}/>
                                        </svg>
                                    </svg>
                                    <span className="slds-assistive-text">Close</span>
                                </button>
                                <h2 id="ConfirmModalHeading" className="slds-modal__title slds-hyphenate">{options.heading_title}</h2>
                            </div>
                            <div className="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                                {msg}
                            </div>
                            <div className="slds-modal__footer">
                                <button
                                    disabled={loading}
                                    className="slds-button slds-button_neutral"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                        loading = false;
                                    }}
                                >
                                    {options.cancel}
                                </button>
                            </div>
                        </div>
                    </section>
                );
            }
        });
    });
};

//
export function handleShareholderNameChangeState(obj, stateName, index, fieldName, value, e) {
    if (e) {
        e.preventDefault();
    }

    if (stateName == 'addresses') {
        if (fieldName == "postal" && (value != "" || obj.state.addresses[0].street != "" || obj.state.addresses[0].state != "" || obj.state.addresses[0].city != null))
            obj.setState({ is_any_address_provided: true });
        else if (fieldName == "state" && (value != "" || obj.state.addresses[0].street != "" || obj.state.addresses[0].postal != "" || obj.state.addresses[0].city != null))
            obj.setState({ is_any_address_provided: true });
        else
            obj.setState({ is_any_address_provided: false });
    }

    return new Promise((resolve, reject) => {
        if (e != undefined && e.target.pattern) {
            const re = eval(e.target.pattern);
            if (e.target.value != "" && !re.test(e.target.value)) {
                resolve({ status: false });
                return;
            }
        }
        var state = {};
        var List = obj.state[stateName];
        List[index][fieldName] = value;
        state[stateName] = Object.assign([], List);
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function handleShareholderNameChange(obj, stateName, index, fieldName, value, e) {
    if (e) {
        e.preventDefault();
    }
    return new Promise((resolve, reject) => {
        if (e != undefined && e.target.pattern) {
            const re = eval(e.target.pattern);
            if (e.target.value != "" && !re.test(e.target.value)) {
                resolve({ status: false });
                return;
            }
        }
        var state = {};
        var List = obj.state[stateName];
        List[index][fieldName] = value;
        state[stateName] = Object.assign([], List);
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

/**
 * removes the lock of passed object type and unique id of that object from db for editing
 */
export async function remove_access_lock(object_type, object_id) {
    var data = {
        object_type: object_type,
        object_id: object_id
    };
    await postData("common/Common/remove_access_lock", data);
}

/**
 * takes the lock of object & object id if not taken otherwise returns false
 */
export function get_take_access_lock(object_type, object_id, check_only = false) {
    return new Promise(async (resolve, reject) => {
        var data = {
            object_type: object_type,
            object_id: object_id,
            check_only: check_only
        };
        postData("common/Common/get_take_access_lock", data).then(postret => {
            resolve({ status: postret.status, error: postret.error });
        })
    });
}

/**
 * fetches the active shift durations both scheduled and actual based on shift and break timings
 */
export async function calculate_shift_duration(cat, state, break_rows, key, val) {
    var final_req;
    if(cat == 2) {
        final_req = {
            actual_start_date: state.actual_start_date,
            actual_end_date: state.actual_end_date,
            actual_start_time: state.actual_start_time,
            actual_end_time: state.actual_end_time,
            actual_rows: state.actual_rows,
            break_cat:cat
        };

        if(key && val) {
            final_req[key] = val;
        }
    }
    else {
        final_req = {

            scheduled_start_date: state.scheduled_start_date,
            scheduled_end_date: state.scheduled_end_date,
            scheduled_start_time: state.scheduled_start_time,
            scheduled_end_time: state.scheduled_end_time,
            scheduled_rows: state.scheduled_rows,
            break_cat:cat
        };
        if(key && val) {
            final_req[key] = val;
        }
    }

    if(final_req.scheduled_start_date && final_req.scheduled_end_date && final_req.scheduled_start_time && final_req.scheduled_end_time && cat == 1) {
        final_req['scheduled_start_date'] = moment(final_req['scheduled_start_date']).format('YYYY-MM-DD');
        final_req['scheduled_end_date'] = moment(final_req['scheduled_end_date']).format('YYYY-MM-DD');
        let calculate_scheduled_shift_duration = localStorage.getItem('calculate_scheduled_shift_duration');
        if (calculate_scheduled_shift_duration && calculate_scheduled_shift_duration === JSON.stringify(final_req)) {
            return JSON.parse(localStorage.getItem('calculated_scheduled_shift_duration'));
        } else {
            const { status, data} = await postData("schedule/ScheduleDashboard/calculate_shift_duration", final_req);
            if(status) {
                localStorage.setItem('calculate_scheduled_shift_duration', JSON.stringify(final_req));
                localStorage.setItem('calculated_scheduled_shift_duration', JSON.stringify(data));
                return data;
            }
        }
    }
    else if(final_req.actual_start_date && final_req.actual_end_date && final_req.actual_start_time && final_req.actual_end_time && cat == 2) {
        final_req['actual_start_date'] = moment(final_req['actual_start_date']).format('YYYY-MM-DD');
        final_req['actual_end_date'] = moment(final_req['actual_end_date']).format('YYYY-MM-DD');
        let calculate_actual_shift_duration = localStorage.getItem('calculate_actual_shift_duration');
        if (calculate_actual_shift_duration && calculate_actual_shift_duration === JSON.stringify(final_req)) {
            return JSON.parse(localStorage.getItem('calculated_actual_shift_duration'));
        } else {
            const { status, data} = await postData("schedule/ScheduleDashboard/calculate_shift_duration", final_req);
            if(status) {
                localStorage.setItem('calculate_actual_shift_duration', JSON.stringify(final_req));
                localStorage.setItem('calculated_actual_shift_duration', JSON.stringify(data));
                return data;
            }
        }
    }
    return '';
}

export async function handleShareholderNameChangeShift(obj, stateName, index, fieldName, value, e) {
    if (e) {
        e.preventDefault();
    }
    return new Promise(async (resolve, reject) => {
        if (e != undefined && e.target.pattern) {
            const re = eval(e.target.pattern);
            if (e.target.value != "" && !re.test(e.target.value)) {
                resolve({ status: false });
                return;
            }
        }
        var state = {};
        var List = obj.state[stateName];
        const actrows = obj.state[stateName];
        let breaks = obj.state['break_types'];
        var durlabel = "duration_disabled";
        var timelabel = "timing_disabled";
        var rows_cat = (stateName == 'scheduled_rows') ? 1 : 2;
        List[index][fieldName] = value;
        if(fieldName == "break_start_time" || fieldName == "break_end_time"){
            if(value) {
                List[index][durlabel] = true;
            }
            else if(List[index]['break_start_time'] == '' && List[index]['break_end_time'] == '') {
                let findSleepBreakUpd = breaks.find(x => x.key_name === 'sleepover');
                let findInSleepBreakUpd = breaks.find(x => x.key_name === 'interrupted_sleepover');
                let sleepValueUpd = '';
                if (findSleepBreakUpd && findSleepBreakUpd.value) {
                    sleepValueUpd = findSleepBreakUpd.value;
                }
    
                let inSleepValueUp = '';
                if (findInSleepBreakUpd && findInSleepBreakUpd.value) {
                    inSleepValueUp = findInSleepBreakUpd.value;
                }

                let breakTypeVal = List[index]['break_type'] || '';
                if (Number(breakTypeVal) === Number(sleepValueUpd) || Number(breakTypeVal) === Number(inSleepValueUp)) {
                    List[index][durlabel] = true;
                } else {
                    List[index][durlabel] = false;
                }
                List[index]['break_duration'] = '';
            }

            if(List[index]['break_start_time'] != '' && List[index]['break_end_time'] != '') {
                let start_time_temp = List[index]['break_start_time'];
                let end_time_temp = List[index]['break_end_time'];

                var isStartValid = /^(((0[1-9])|(1[0-2])):([0-5])(0|5)\s(A|P)M)?$/.test(start_time_temp);
                var isStartValidAlt = /^((0[1-9]):([0-5])(0|5)\s(A|P)M)?$/.test(start_time_temp);

                if (isStartValid === true || isStartValidAlt === true) {
                    let start_split = start_time_temp.split(':');
                    let start_min_split = start_split[1].split(' ');
                    let start_hr_temp = start_split[0];
                    let start_min_temp = start_min_split[0];
                    let start_for_temp = start_min_split[1];
                    let start_hrminutes = String(start_hr_temp).padStart(2, '0') + ':' + String(start_min_temp).padEnd(2, '0') + ' '+ start_for_temp;
                    List[index]['break_start_time'] = start_hrminutes;
                }

                var isEndValid = /^(((0[1-9])|(1[0-2])):([0-5])(0|5)\s(A|P)M)?$/.test(end_time_temp);
                var isEndValidAlt = /^((0[1-9]):([0-5])(0|5)\s(A|P)M)?$/.test(end_time_temp);
                if (isEndValid === true || isEndValidAlt == true) {
                    let end_split = end_time_temp.split(':');
                    let end_min_split = end_split[1].split(' ');
                    let end_hr_temp = end_split[0];
                    let end_min_temp = end_min_split[0];
                    let end_for_temp = end_min_split[1];
                    let end_hrminutes = String(end_hr_temp).padStart(2, '0') + ':' + String(end_min_temp).padEnd(2, '0') + ' ' + end_for_temp;
                    List[index]['break_end_time'] = end_hrminutes;
                }

                var req = {
                    break_start_time: List[index]['break_start_time'],
                    break_end_time: List[index]['break_end_time']
                };
                const { status, data1, data2} = await postData("schedule/ScheduleDashboard/calculate_break_duration", req);
                if (data1 && data1 != '') {
                    List[index]["duration_int"] = data1;
                }
                if (data2 && data2 != '') {
                    List[index]["break_duration"] = data2;
                }
            }
        }
        else if(fieldName == "break_duration") {
            if(value) {
                List[index][timelabel] = true;
            }
            else {
                List[index][timelabel] = false;
            }
        }

        var shift_duration = await calculate_shift_duration(rows_cat, obj.state, List);
        if(rows_cat == 1) {
            state['scheduled_duration'] = shift_duration;
        }
        else {
            state['actual_duration'] = shift_duration;
        }

        // if(stateName == 'scheduled_rows' && fieldName == 'break_type'){
        //     var List2 = obj.state['actual_rows'];
        //     List2[index][fieldName] = value;
        //     state['actual_rows'] = Object.assign([], List2);
        // }

        if( fieldName == 'break_type' && stateName === 'actual_rows' )
        {
            // s/o 
            let findSleepBreak = breaks.find(x => x.key_name === 'sleepover');
            let findInSleepBreak = breaks.find(x => x.key_name === 'interrupted_sleepover');
            let sleepValue = '';
            if (findSleepBreak && findSleepBreak.value) {
                sleepValue = findSleepBreak.value;
            }

            let inSleepValue = '';
            if (findInSleepBreak && findInSleepBreak.value) {
                inSleepValue = findInSleepBreak.value;
            }

            let break_type = actrows[index].break_type;
            let inSleepBreakIdx = actrows.findIndex(x => Number(x.break_type) === Number(inSleepValue));

            // if (Number(break_type) === Number(sleepValue) && inSleepBreakIdx > -1 ) {
            //     toastMessageShow("Delete Interrupted S/O timing before change S/O break", "e");
            //     return false;
            // }
        }

        state[stateName] = Object.assign([], List);
        
        obj.setState(state, () => {
            resolve({ status: true });
        });
        //Pull the line items and active duration calculation on actual break druation change
        if(stateName == 'actual_rows' && fieldName == 'break_duration')
        {
            obj.calcActiveDuration(2, 'actual_break_rows')
        }

        //Pull the line items and active duration calculation on actual break druation change
        if( fieldName == 'break_type')
        {
            let section = stateName === 'scheduled_rows' ? 'scheduled' : 'actual';
            obj.updateBreakOption(section, index);
        }
    });
}

export function handleAddShareholder(obj, e, stateName, object_array) {
    e.preventDefault();
    return new Promise((resolve, reject) => {
        var state = {};
        var temp = object_array;
        var list = obj.state[stateName];

        state[stateName] = list.concat([reInitializeObject(temp)]);
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function reInitializeObject__ob(object_array) {
    var state = {};
    Object.keys(object_array).forEach(function (key) {
        state[key] = "";
    });

    return state;
}

export function reInitializeObject(object_array) {
    var state = {};
    Object.keys(object_array).forEach(function (key) {
        if (Array.isArray(object_array[key])) {
            if (object_array[key].length > 0) {
                var temp_depth = reInitializeObject__ob(object_array[key][0]);
            }
            state[key] = [temp_depth];
        } else {
            state[key] = "";
        }
    });

    return state;
}

export function handleRemoveShareholder(obj, e, index, stateName) {
    if (e) e.preventDefault();

    return new Promise((resolve, reject) => {
        var state = {};
        var List = obj.state[stateName];

        state[stateName] = List.filter((s, sidx) => index !== sidx);
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function handleCheckboxValue(obj, stateName, index, fieldName) {
    return new Promise((resolve, reject) => {
        var List = obj.state[stateName];
        var state = {};

        if (List[index][fieldName] == undefined || List[index][fieldName] == false) {
            List[index][fieldName] = true;
        } else {
            List[index][fieldName] = false;
        }
        state[stateName] = List;
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function handleChange(Obj, e) {
    if (e != undefined && e.target.pattern) {
        const re = eval(e.target.pattern);
        if (e.target.value != "" && !re.test(e.target.value)) {
            return;
        }
    }

    var state = {};
    state[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    Obj.setState(state);
}

//Function helps to restrict to typing more than 2 decimal values after decimal points.
export function handleDecimalChange(Obj, e) {

    if (e != undefined || e.target.value != "") {
        var t = e.target.value;
        e.target.value = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)) : t;

    }

    handleChange(Obj, e);

}
/*used for checkbox,input field,*/
export function handleChangeChkboxInput(Obj, e) {
    if (e) {
        e.preventDefault();
    }

    return new Promise((resolve, reject) => {
        if (e != undefined && e.target.pattern) {
            const re = eval(e.target.pattern);
            if (e.target.value != "" && !re.test(e.target.value)) {
                resolve({ status: false });
                return;
            }
        }

        var state = {};
        state[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        Obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function handleChangeSelectDatepicker(Obj, selectedOption, fieldname) {
    return new Promise((resolve, reject) => {
        var state = {};
        state[fieldname] = selectedOption;

        if (Obj.state[fieldname + "_error"]) {
            state[fieldname + "_error"] = false;
        }

        if (fieldname == "state") {
            state["city"] = {};
            state["postal"] = "";
        }
        Obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function calendarColorCode(givenKey) {
    var myArray = [
        { value: "7", label: "#89e0a9" }, //confirmed light green
        { value: "6", label: "#00a551" }, //Completed light green
        { value: "2", label: "#e0da8c" }, //unconfirmed yellow
        { value: "5", label: "#ff7a7b" }, //cancelled
        { value: "1", label: "#a3b5c7" } //unfilled
    ];
    if (givenKey == 0) {
        return myArray;
    } else {
        var index = myArray.findIndex(x => x.value == givenKey);
        return myArray[index].label;
    }
}

export function getOptionsSuburb(input, state) {
    return queryOptionData(input, "common/Common/get_suburb", { query: input, state: state }, 3);
}

export function getOptionsParticipant(input) {
    return queryOptionData(input, "schedule/ScheduleDashboard/get_participant_name", { query: input });
}

export function getOptionsParticipantMaster(input) {
    return queryOptionData(input, "schedule/ScheduleDashboard/get_participant_master_name", { query: input });
}
export function getOptionsSiteName(e) {
    return queryOptionData(e, "schedule/ScheduleDashboard/get_site_name", { query: e });
}

export function getOptionsIsSiteName(e) {
    return queryOptionData(e, "schedule/ScheduleDashboard/get_is_site_name", { query: e });
}

export function getOptionsMember(e, memberArray) {
    return queryOptionData(e, "common/Common/get_member_name", { query: e });
}

export function getOptionsOrg(e, memberArray) {
    return queryOptionData(e, "common/Common/get_org_name", { query: e });
}

export function getOptionsIsOrg(e, memberArray) {
    return queryOptionData(e, "common/Common/get_is_org_name", { query: e });
}

export function getOptionsAdmin(e, selected_user) {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("common/Common/get_admin_name", { search: e, selected_user: selected_user }).then(json => {
        return { options: json };
    });
}

export function getAdminTeamDepartment(e) {
    if (!e) {
        return Promise.resolve({ options: [] });
    }
    return postData("common/Common/get_admin_team_department", { search: e }).then(json => {
        return { options: json };
    });
}

export function getOptionsParticipantMember(e, previous) {
    if (!e || e.length < 3) {
        return Promise.resolve({ options: [] });
    }

    return postData("common/Common/get_user_for_compose_mail", { search: e, previous: previous }).then(json => {
        return { options: json };
    });
}

export function getTimeAgoMessage(DATE_TIME) {
    var messageTime = moment(DATE_TIME);

    var currentDateTime = moment();

    const diff = currentDateTime.diff(messageTime);
    const diffDuration = moment.duration(diff);

    if (diffDuration.days() > 0) {
        return diffDuration.days() + " Days.";
    } else if (diffDuration.hours() > 0) {
        return diffDuration.hours() + " hr.";
    } else if (diffDuration.minutes() > 0) {
        return diffDuration.minutes() + " Min.";
    } else {
        return "Just now";
    }
}

export function reFreashReactTable(obj, fetchDataMethod) {
    var ReactOption = obj.reactTable.current.state;
    var state = { pageSize: ReactOption.pageSize, page: ReactOption.page, sorted: ReactOption.sorted, filtered: ReactOption.filtered };
    obj[fetchDataMethod](state);
}

export function handleDateChangeRaw(e) {
    e.preventDefault();
}

export function changeTimeZone(dateTIme, FORMATE, returnType) {
    if (dateTIme) {
        if (!FORMATE) {
            FORMATE = "DD/MM/YYYY";
        }

        //                var temp = moment.utc(dateTIme);
        ////    console.log(moment(dateTIme, 'YYYY-MM-DD').format());
        //                var local = temp.local().format(FORMATE);

        var local = moment(dateTIme).format(FORMATE);

        if (returnType == true) {
            local = moment(local);
        }

        return local;
    }
}

export function getStateList() {
    return new Promise((resolve, reject) => {
        postData("common/common/get_state", {}).then(result => {
            if (result.status) {
                resolve(result.data);
            }
        });
    });
}

export function getFmscasePrimaryCategory() {
    return new Promise((resolve, reject) => {
        postData("common/common/get_case_primary_cat", {}).then(result => {
            if (result.status) {
                resolve(result.data);
            }
        });
    });
}

export const selectFilterOptions = (options, filterValue, excludeOptions, props) => {
    if (excludeOptions)
        excludeOptions = excludeOptions.map(function (i) {
            return i[props.valueKey];
        });

    return options.filter(function (option) {
        if (excludeOptions && excludeOptions.indexOf(option[props.valueKey]) > -1) return false;
        if (props.filterOption) return props.filterOption.call(undefined, option, filterValue);
        if (!filterValue) return true;

        var value = option[props.valueKey];
        var label = option[props.labelKey];

        if (!value && !label) {
            return false;
        }

        var valueTest = value ? String(value) : null;
        var labelTest = label ? String(label) : null;

        return props.matchPos === "start" ? valueTest : valueTest;
    });
};

/*export function checkLoginModule (obj,moduleType,returnUrlIfLogin)
 {
 if(checkPin())
 {
 window.location.href=returnUrlIfLogin;
 }
 else
 {
 if(moduleType == 'fms')
 obj.setState({pinModalOpen:true,moduleHed:'FMS Module',color:'Red_fms'})
 else if(moduleType == 'admin')
 obj.setState({pinModalOpen:true,moduleHed:'Admin Module',color:'Blue'})
 }
 }*/

export function checkLoginModule(obj, moduleType, returnUrldefine) {
    let urlDefault = { fms: "/admin/fms/dashboard/new/case_ongoing", admin: "/admin/user/dashboard", incident: "admin/fms/dashboard/incidents/incident_ongoing" };
    let url = "";
    url =
        returnUrldefine != undefined && typeof returnUrldefine == "string" && returnUrldefine.trim() != ""
            ? returnUrldefine.trim()
            : urlDefault.hasOwnProperty(moduleType)
                ? urlDefault[moduleType]
                : "/admin/dashboard";

    if (checkPin(moduleType)) {
        //move to desired llocation
        if (moduleType == "fms") {
            window.location.href = url;
        } else if (moduleType == "admin") {
            window.location.href = url;
        } else if (moduleType == "incident") {
            window.location.href = url;
        }
    } else {
        if (moduleType == "fms") {
            obj.setState({ pinModalOpen: true, moduleHed: "FMS Module", color: "Red_fms", pinType: 1, returnUrl: url });
        } else if (moduleType == "admin") {
            obj.setState({ pinModalOpen: true, moduleHed: "Admin Module", color: "Blue", pinType: 2, returnUrl: url });
        } else if (moduleType == "incident") {
            obj.setState({ pinModalOpen: true, moduleHed: "Incident Module", color: "Red_fms", pinType: 3, returnUrl: url });
        }
    }
}

export const Aux = props => props.children;

export function getOptionsCrmParticipant(input, staff_id = "") {
    return queryOptionData(input, "crm/CrmTask/get_participant_name", { query: input, staff_id: staff_id });
}

export function getOptionsCrmMembers(input, staff_id = "") {
    if (!input) {
        return Promise.resolve({ options: [] });
    }
    return fetch(BASE_URL + "crm/CrmStaff/get_staff_name?query=" + input + '&staffId=' + staff_id)
        .then(response => {
            return response.json();
        })
        .then(json => {
            return { options: json };
        });
}

export function getOptionsallUsers(input) {
    if (!input) {
        return Promise.resolve({ options: [] });
    }
    return fetch(BASE_URL + "crm/CrmStaff/get_all_users?query=" + input)
        .then(response => {
            return response.json();
        })
        .then(json => {
            return { options: json };
        });
}

export function queryOptionData(e, urlData, requestData, checkLengthData = 0, requestDataNotStringfy = 0) {
    if (!e || e.length < parseInt(checkLengthData)) {
        let blankData = Promise.resolve({ options: [] });
        return blankData.then(res => {
            return res;
        });
    }

    var Request = parseInt(requestDataNotStringfy) == 1 ? requestData : JSON.stringify(requestData);
    return postData(urlData, Request).then(response => {
        return { options: response };
    });
}

export function queryOptionDataAddNewEntity(e, urlData, requestData, checkLengthData = 0, requestDataNotStringfy = 0) {
    if (!e || e.length < parseInt(checkLengthData)) {
        let blankData = Promise.resolve({ options: [] });
        return blankData.then(res => {
            return res;
        });
    }

    var Request = parseInt(requestDataNotStringfy) == 1 ? requestData : JSON.stringify(requestData);
    return postData(urlData, Request).then(response => {
        return { options: response };
    });
}

export function pinHtml(obj, moduleType, pageshow, redirectUrl, labelShow) {
    let lableFirstLatter = "";
    let lable = "";
    let pagesTitleShow = false;
    let pagesTitleIcon = true;
    let iconColor = "a-colr";
    if (pageshow != undefined && pageshow != "" && pageshow == "dashboard") {
        pagesTitleShow = true;
    }

    if (pageshow != undefined && pageshow != "" && pageshow == "menu") {
        pagesTitleIcon = false;
    }
    let defaultUrl = ROUTER_PATH;
    if (moduleType == "fms") {
        lableFirstLatter = "F";
        lable = "FMS";
        iconColor = "f-colr";
        defaultUrl = ROUTER_PATH + "admin/fms/dashboard/new/case_ongoing";
    } else if (moduleType == "admin") {
        lableFirstLatter = "A";
        lable = "Admin";
        iconColor = "a-colr";
        defaultUrl = ROUTER_PATH + "admin/user/dashboard";
    } else if (moduleType == "incident") {
        lableFirstLatter = "I";
        lable = "Incident";
        iconColor = "f-colr";
        defaultUrl = ROUTER_PATH + "admin/fms/dashboard/incidents/incident_ongoing";
    }

    if (redirectUrl != undefined && redirectUrl != "" && pageshow == "menu") {
        defaultUrl = redirectUrl;
    }
    if (labelShow != undefined && labelShow != "" && pageshow == "menu") {
        lable = labelShow;
    }

    const htlmlLable = pagesTitleShow ? <p>{lable}</p> : <React.Fragment />;
    const htlmlIcon = pagesTitleIcon ? <span className={"add_access " + iconColor}>{lableFirstLatter}</span> : <React.Fragment>{lable}</React.Fragment>;

    if (!checkPin(moduleType)) {
        if (moduleType == "incident") {
            return (
                <React.Fragment>
                    <a onClick={() => checkLoginModule(obj, moduleType, defaultUrl)}>
                        {htlmlIcon}
                        {htlmlLable}
                    </a>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <NavLink to={defaultUrl}>
                        {htlmlIcon}
                        {htlmlLable}
                    </NavLink>
                </React.Fragment>
            );
        }
    } else {
        return (
            <React.Fragment>
                <NavLink to={defaultUrl}>
                    {htlmlIcon}
                    {htlmlLable}
                </NavLink>
            </React.Fragment>
        );
    }
}

export const getOptionsRecruiterList = (e, staff_id) => {
    if (!e || e.length < 3) {
        return Promise.resolve({ options: [] });
    }
    return queryOptionData(e, "recruitment/RecruitmentUserManagement/get_recruiter_name", { query: e, staff_id: staff_id });
};

export const googleAddressFill = (obj, index, stateKey, fieldtkey, fieldValue, stateList) => {
    return new Promise((resolve, reject) => {
        if (fieldtkey == "street") {
            var componentForm = { street_number: "short_name", route: "long_name", locality: "long_name", administrative_area_level_1: "short_name", postal_code: "short_name" };
            var addess_key = obj.state[stateKey][index];
            var street_number = "";

            if (Array.isArray(fieldValue.address_components)) {
                for (var i = 0; i < fieldValue.address_components.length; i++) {
                    var addressType = fieldValue.address_components[i].types[0];

                    if (componentForm[addressType]) {
                        var val = fieldValue.address_components[i][componentForm[addressType]];

                        if (addressType === "route") {
                            addess_key["street"] = street_number ? street_number + " " + val : val;
                        } else if (addressType === "street_number") {
                            street_number = val;
                        } else if (addressType === "locality") {
                            addess_key["city"] = addess_key["suburb"] = val;
                        } else if (addressType === "administrative_area_level_1") {
                            if (stateList) {
                                var t_index = stateList.findIndex(x => x.label == val);
                                addess_key["state"] = stateList[t_index].value;
                            } else {
                                var t_index = obj.state.stateList.findIndex(x => x.label == val);
                                addess_key["state"] = obj.state.stateList[t_index].value;
                            }
                        } else if (addressType === "postal_code") {
                            addess_key["postal"] = addess_key["postal_code"] = val;
                        }
                    }
                }
            }
            var List = obj.state[stateKey];
            List[index] = addess_key;
            var state = {};
            state[stateKey] = List;
            obj.setState(state, () => {
                resolve({ status: true });
            });
        }
    });
};

export const googleAddressFillOnState = (obj, fieldValue, statesList) => {
    var componentForm = { street_number: "short_name", route: "long_name", locality: "long_name", administrative_area_level_1: "short_name", postal_code: "short_name" };
    var state = {};

    if (Array.isArray(fieldValue.address_components)) {
        for (var i = 0; i < fieldValue.address_components.length; i++) {
            var addressType = fieldValue.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = fieldValue.address_components[i][componentForm[addressType]];

                if (addressType === "route") {
                    state["street"] = (state["street"] ? state["street"] : "") + " " + val;
                } else if (addressType === "street_number") {
                    state["street"] = val;
                } else if (addressType === "locality") {
                    state["suburb"] = val;
                } else if (addressType === "administrative_area_level_1") {
                    if (statesList) {
                        var t_index = statesList.findIndex(x => x.label == val);
                        state["state"] = statesList[t_index].value;
                    } else {
                        var t_index = obj.state.states.findIndex(x => x.label == val);
                        state["state"] = obj.state.states[t_index].value;
                    }
                } else if (addressType === "postal_code") {
                    state["postcode"] = val;
                }
            }
        }
    }

    obj.setState(state);
};

/**
 * @param {string} msg
 * @param {'s'|'e'|'w'|'i'} type
 * @param {{close?: Function, open?: Function}} callbackOption
 */
export const toastMessageShow = (msg, type, callbackOption) => {
    if (msg) {
        if (msg == undefined || (typeof msg == "string" && msg == "")) {
            return false;
        }
        toast.dismiss();
        let options = {
            position: toast.POSITION.TOP_CENTER,
            hideProgressBar: true
        };
        if (callbackOption != undefined && typeof callbackOption == "object" && callbackOption != null) {
            if (callbackOption.hasOwnProperty("close")) {
                options["onClose"] = callbackOption.close;
            }
            if (callbackOption.hasOwnProperty("open")) {
                options["onOpen"] = callbackOption.open;
            }
        }
        if (type == "s") {
            toast.success(<ToastUndo message={msg} showType={type} />, options);
        } else if (type == "e") {
            toast.error(<ToastUndo message={msg} showType={type} />, options);
        } else if (type == "w") {
            toast.warn(<ToastUndo message={msg} showType={type} />, options);
        } else if (type == "i") {
            toast.info(<ToastUndo message={msg} showType={type} />, options);
        } else {
            toast.error(<ToastUndo message={msg} showType={type} />, options);
        }
    }
};

export const onKeyPressPrevent = event => {
    if (event.which === 13) {
        event.preventDefault();
    }
};

const getHostName = url => {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === "string" && match[2].length > 0) {
        return match[2];
    } else {
        return null;
    }
};

export const downloadFile = (fileURL, filename) => {
    var Request = {};

    if (!window.ActiveXObject) {
        var save1 = document.createElement("a");
        save1.href = BASE_URL + "mediaShowView?tc=" + getLoginToken() + "&rd=" + encodeURIComponent(btoa(fileURL));
        save1.target = "_blank";
        var fileName = fileURL.substring(fileURL.lastIndexOf("/") + 1);
        save1.download = filename || fileName;
        if (navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search("Chrome") < 0) {
            document.location = save1.href;
        } else {
            var evt = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: false
            });
            save1.dispatchEvent(evt);
            window.webkitURL.revokeObjectURL(save1.href);
        }

        /*  setTimeout(function(){

             var save = document.createElement('a');
             save.href = fileURL;
             save.target = '_blank';
             var fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1);
             save.download = filename || fileName;
             if (navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search("Chrome") < 0) {
                 document.location = save.href;

                 // window event not working here
             } else {
                 var evt = new MouseEvent('click', {
                     'view': window,
                     'bubbles': true,
                     'cancelable': false
                 });
                 save.dispatchEvent(evt);
                 (window.URL || window.webkitURL).revokeObjectURL(save.href);

                 setTimeout(function(){ window.close();}, 3000);
             }}, 5); */
    }

    // for IE < 11
    else if (!!window.ActiveXObject && document.execCommand) {
        var _window = window.open(BASE_URL + "mediaShowView?tc=" + getLoginToken() + "&rd=" + encodeURIComponent(btoa(fileURL)), "_blank");
        _window.document.close();
        _window.document.execCommand("SaveAs", true, filename || fileURL);
        _window.close();
    }
};

export const onlyNumberAllow = (obj, e) => {
    const re = /^[0-9\b]+$/;
    // if value is not blank, then test the regex
    if (e.target.value === "" || re.test(e.target.value)) {
        var state = {};
        state[e.target.name] = e.target.value;
        obj.setState(state);
    }
};

export const currencyFormatUpdate = (num, currencySymbol) => {
    return currencySymbol + (num != undefined ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : num);
};

export function googeAddressHandler(index, stateKey, fieldtkey, fieldValue, obj) {
    var state = {};
    var tempField = {};
    var List = obj.state[stateKey];
    List[index][fieldtkey] = fieldValue;

    if (fieldtkey == "state") {
        List[index]["city"] = {};
        List[index]["postal"] = "";
        List[index]["state_error"] = false;
    }

    if (fieldtkey == "city" && fieldValue) {
        List[index][fieldtkey] = fieldValue.value;
        List[index]["postal"] = fieldValue.postcode;
    }

    state[stateKey] = List;
    obj.setState(state, () => { });
}

export function calculateGst(amount) {
    var gst = 0;
    if (amount > 0) {
        gst = (amount * INVOICE_GST) / 100;
    }
    return gst;
}

export function getOptionsHouseName(e) {
    return queryOptionData(e, "schedule/ScheduleDashboard/get_house_name", { query: e });
}

export function getShiftTimerColor(given_date) {
    var date1 = new Date(moment());
    var date2 = new Date(moment(given_date));

    var Difference_In_Time = date2.getTime() - date1.getTime();
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    if (Difference_In_Days <= 3) {
        var class_name = "day_lessthan_3_color";
    } else if (Difference_In_Days > 3 && Difference_In_Days <= 7) {
        var class_name = "day_greater_3_lessthan_7_color";
    } else if (Difference_In_Days > 7) {
        var class_name = "day_greater_7_color";
    }

    return class_name;
}

/*handle date from lightningdesignsystem*/
export function handleChangeSFLDSDatePicker_old  (event, data,InputName,obj) {
    obj.setState({ InputName: data.date },()=>{ console.log(obj.state)});
};

export function handleChangeSFLDSDatePicker_(event, data,InputName,obj) {
    return new Promise((resolve, reject) => {
        var state = {};
        state[InputName] = data.date;
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function handleChangeSFLDSDatePicker(event, data,InputName,obj) {
    return new Promise((resolve, reject) => {
        var state = {};
        state[InputName] = data.date;

        state[InputName + '_error'] = false;
        state[InputName] = data.date;

        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

/**
 * This is just to make strongly typed inline styling.
 * Only supports 1 level of styling
 *
 * @template K
 * @param {Record<keyof K, Partial<CSSStyleDeclaration>>} s
 * @return {Record<keyof K, Partial<CSSStyleDeclaration>>}
 */
export const css = s => s


/**
 * Formats the number to *n* number of decimals
 *
 * @param {number} number
 * @param {number} decimalPlaces
 */
export function formatNum(number, decimalPlaces) {
    return (Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces))
}

/*
*Function copy from lightningdesignsystem comboxbox
*
**/
export function comboboxFilterAndLimit ( inputValue, limit, options, selection ) {
    const inputValueRegExp = new RegExp(escapeRegExp(inputValue), 'ig');
    // eslint-disable-next-line fp/no-mutating-methods
    return options
        .filter((option) => {
            const searchTermFound = option.label
                ? option.label.match(inputValueRegExp)
                : false;
            const isSeparator = option.type === 'separator';
            const notAlreadySelected = !selection.some((sel) => sel.id === option.id);

            return (
                (!inputValue || isSeparator || searchTermFound) && notAlreadySelected
            );
        })
        .splice(0, limit);
}

export function handlePasswordChangeProgress(obj, value) {

    var lowerCaseRegex = /[a-z]/;
    var upperCaseRegex = /[A-Z]/;
    var numberRegex = /[0-9]/;
    var specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;


    if (value.length >= 8) {
        obj.setState({ valueForChar: 100, iconForChar: true })
    } else {
        obj.setState({ valueForChar: 0, iconForChar: false })
    }

    if (numberRegex.test(value) && lowerCaseRegex.test(value) && upperCaseRegex.test(value)) {
        obj.setState({ alphaNumeric: 100, iconForAlphaNumeric: true });
    } else {
        obj.setState({ alphaNumeric: 0, iconForAlphaNumeric: false });
    }

    if (specialCharRegex.test(value)) {
        obj.setState({ specialChar: 100, iconForSpecialChar: true })
    } else {
        obj.setState({ specialChar: 0, iconForSpecialChar: false })
    }
}

//CMS Login function
export function loginCms(redirect) {
    var win = window.open(CMS_URL, '_blank');
    win.document.write('<h3 align="center">Redirecting to CMS Portal...</h3>');

    postData("cms/cms/cmsAuthenticate", []).then((result) => {

        if(result.message === 'Username is Required!' || result.status === false) {
            toastMessageShow(result.message, "e");
            win.close();
        } else if (result.status === true && result.uname !== undefined) {
            redirect = redirect ? redirect : 'content-list';
            win.location.href = CMS_URL + 'hcmlogin/'  + Base64.encode(redirect) + '/' + result.uname;

        }
    });

}

export function logoutCms() {

    postData("cms/cms/cmsLogout",{'name' : getFullName()});

}

export function setUId(uid) {
    localStorage.setItem("uid", uid);
}
/**
 * fetches the active shift durations both scheduled and actual based on shift and break timings
 */
export async function calculate_interview_duration(state, key, val) {
    var final_req = {
        interview_start_date: state.interview_start_date,
        interview_end_date: state.interview_end_date,
        interview_start_time: state.interview_start_time,
        interview_end_time: state.interview_end_time,
    };
    if (key && val) {
        final_req[key] = val;
    }

    if (final_req.interview_start_date && final_req.interview_end_date && final_req.interview_start_time && final_req.interview_end_time) {
        final_req['interview_start_date'] = moment(final_req['interview_start_date']).format('YYYY-MM-DD');
        final_req['interview_end_date'] = moment(final_req['interview_end_date']).format('YYYY-MM-DD');
        const { status, data } = await postData("recruitment/RecruitmentInterview/calculate_interview_duration", final_req);
        if (status) {
            return data;
        }
    }
    return '';
}
export function wordWrap(text, count) {
    if(!text || text == undefined || !count || count == undefined){
        return;
    }
    return (text.split(' ').length > count) ? text.split(" ").splice(0, count).join(" ")  +  "..." : text;

}

export function setAvatar(avatar) {
    localStorage.setItem("ocs_avatar", avatar);
}