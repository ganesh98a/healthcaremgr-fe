import React, { Component } from "react";
import jQuery from "jquery";
import moment from "moment-timezone";
import axios from "axios";
import { ROUTER_PATH, BASE_URL, LOGIN_DIFFERENCE, PIN_DATA, REGULAR_EXPRESSION_FOR_NUMBERS } from "config.js";
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
    localStorage.removeItem("ms_username");
    localStorage.removeItem("ms_name");
    localStorage.removeItem("ms_token");
    sessionStorage.removeItem("global_menu");
    sessionStorage.removeItem("global_item_menu");
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
            body: JSON.stringify({ request_data }) })
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
                if (error.name === "AbortError") {

                } else {
                    toastMessageShow("API ERROR", "e");
                    resolve({ status: false, error: "API ERROR" });
                }
            });

        if (obj) {
            obj.setState({ requestedMethod: controller })
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
                        style={{ fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif` }}
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
                                            <path d={`M14.6 11.9l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.3-.7-.3-1 0L12.6 10c-.1.2-.4.2-.6 0L6 3.9c-.3-.3-.7-.3-1 0l-1 .9c-.3.3-.3.7 0 1l6.1 6.1c.1.1.1.4 0 .6L4 18.6c-.3.3-.3.7 0 1l.9.9c.3.3.7.3 1 0l6.1-6c.2-.2.5-.2.6 0l6.1 6c.3.3.7.3 1 0l.9-.9c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z`} />
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
                        style={{ fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif` }}
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
                                            <path d={`M14.6 11.9l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.3-.7-.3-1 0L12.6 10c-.1.2-.4.2-.6 0L6 3.9c-.3-.3-.7-.3-1 0l-1 .9c-.3.3-.3.7 0 1l6.1 6.1c.1.1.1.4 0 .6L4 18.6c-.3.3-.3.7 0 1l.9.9c.3.3.7.3 1 0l6.1-6c.2-.2.5-.2.6 0l6.1 6c.3.3.7.3 1 0l.9-.9c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z`} />
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

export function getOptionsSiteName(e) {
    return queryOptionData(e, "schedule/ScheduleDashboard/get_site_name", { query: e });
}

export function getOptionsMember(e, memberArray) {
    return queryOptionData(e, "common/Common/get_member_name", { query: e });
}

export function getOptionsOrg(e, memberArray) {
    return queryOptionData(e, "common/Common/get_org_name", { query: e });
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

export function reFreshReactTable(obj, fetchDataMethod) {
    var state = { filtered: {filter_status: "all"},page: 0, pageSize: 99999,sorted: [] };
     var ReactOption = obj.reactTable.current.state;

    if(obj.reactTable.current){
        state = { pageSize: ReactOption.pageSize, page: ReactOption.page, sorted: ReactOption.sorted, filtered: ReactOption.filtered };
        if (obj.filter_list) {
            state.filter_list = obj.filter_list;
        }
    }
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
export function handleChangeSFLDSDatePicker_old(event, data, InputName, obj) {
    obj.setState({ InputName: data.date }, () => { console.log(obj.state) });
};

export function handleChangeSFLDSDatePicker_(event, data, InputName, obj) {
    return new Promise((resolve, reject) => {
        var state = {};
        state[InputName] = data.date;
        obj.setState(state, () => {
            resolve({ status: true });
        });
    });
}

export function handleChangeSFLDSDatePicker(event, data, InputName, obj) {
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
export function comboboxFilterAndLimit(inputValue, limit, options, selection) {
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

export function requestData(apiUrl, pageSize = 99999, page = 0, sorted = {}, filtered = {}) {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData(apiUrl, Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count)
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0
                };
                resolve(res);
            }

        });

    });
};

export function postRequest(apiUrl, data = {}, pageSize = 99999, page = 0, sorted = {}, filtered = {}) {

    return new Promise((resolve, reject) => {
        // request json
        let Request = { ...data, pageSize, page, sorted, filtered };
        postData(apiUrl, Request).then((result) => {
            if (result.status) {
                let filteredData = result.data || [];
                const res = {
                    rows: filteredData,
                    pages: (result.count)
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0
                };
                resolve(res);
            }

        });

    });
};

export function apiRequest(api = { url: "", params: {} }, pageSize = 99999, page = 0, sorted = {}, filtered = {}) {
    let pagination = {};
    if (pageSize) {
        pagination = { pageSize, page, sorted, filtered };
    }
    return new Promise((resolve, reject) => {
        // request json
        let { url, params } = api;
        let request = { ...params, ...pagination };
        postData(url, request).then((result) => {
            if (result.data) {
                if (result.status) {
                    let filteredData = result.data || [];
                    const res = {
                        rows: filteredData,
                        pages: (result.count),
                        status: result.status
                    };
                    resolve(res);
                } else {
                    const res = {
                        rows: [],
                        pages: 0,
                        status: result.status
                    };
                    resolve(res);
                }
            } else {
                resolve(result);
            }
        });

    });
};

// validation for allow number only
export function onlyNumberAllowWithRange(obj, e , range){
    const re = /^[0-9\b]+$/;
     // if value is not blank, then test the regex
     if ((e.target.value === '' || re.test(e.target.value)) && e.target.value <= range) {
        var state = {};
        state[e.target.name] = e.target.value
        obj.setState(state)
     }
 }
// Applicant result status
export const groupBookingStatusList = () => {
    return [
        { label: 'Successful', value: '1', disabled: true },
        { label: 'Unsuccessful', value: '2', disabled: true },
        { label: 'Did not show', value: '3', disabled: true },
        { label: 'Generate CAB', value: '6', disabled: true },
        // { label: 'Edit', value: '4', disabled: true },
        { label: 'Cancel', value: '7', disabled: true },
        { label: 'Delete', value: '5' , disabled: true },
        
    ];
}
// return the related type url
export const getRelatedTypeReturnUrl = (related_type, related_to , applicant_id) => {
    var related_to_url = '';
    switch (related_type) {
        case '1':
            related_to_url = "/admin/crm/opportunity/" + related_to;
            break;
        case '2':
            related_to_url = "/admin/crm/leads/" + related_to;
            break;
        case '3':
            related_to_url = "/admin/crm/serviceagreements/" + related_to;
            break;
        case '4':
            related_to_url = "/admin/crm/needassessment/" + related_to;
            break;
        case '5':
            related_to_url = "/admin/crm/riskassessment/details/" + related_to;
            break;
        case '6':
            related_to_url = "/admin/schedule/details/" + related_to;
            break;
        case '7':
            related_to_url = "/admin/finance/timesheet/details/" + related_to;
            break;
        case '8':
            related_to_url = "/admin/recruitment/application_details/" + applicant_id + "/" + related_to;
            break;
        case '9':
            related_to_url = "/admin/recruitment/interview_details/" + related_to;
            break;
        case '10':
            related_to_url = "/admin/finance/invoice/details/" + related_to;
            break;
        default:
            related_to_url = "#"
            break;
    }
    return related_to_url;

}

// return the related type
export const getRelatedType = (page_name) => {
    var related_type = '';
    switch (page_name) {
        case 'contact':
            related_type = "1";
            break;
        case 'organisation':
            related_type = "2";
            break;
        case 'opportunity':
            related_type = "3";
            break;
        case 'lead':
            related_type = "4";
            break;
        case 'service':
            related_type = "5";
            break;
        case 'shift':
            related_type = "6";
            break;
        case 'timesheet':
            related_type = "7";
            break;
        case 'application':
            related_type = "8";
            break;
        case 'interview':
            related_type = "9";
            break;
        case 'invoice':
            related_type = "10";
            break;
        default:
            break;
    }
    return related_type;

}


// return initiator details
export const getFeedBackInitiatorDetails = (data) => {
    let initiator_details = '';
    switch (data.initCatOption) {
        case 'init_member_of_public':
            initiator_details = data.initFirstName +' '+ data.initLasttName;
            break;
        case 'init_hcm_general':
            initiator_details = data.initFirstName +' '+ data.initLasttName;
            break;
        case 'init_hcm_participant':
            initiator_details = data.initOnCallParticipant ? data.initOnCallParticipant.label : '';
            break;
        case 'init_hcm_organisation':
            initiator_details = data.initOnCallOrganisation ? data.initOnCallOrganisation.label : '';
            break;
        case 'init_hcm_site':
            initiator_details = data.initOnCallSiteName ? data.initOnCallSiteName.label : '';
            break;
        case 'init_hcm_member':
            initiator_details = data.initOnCallMember ? data.initOnCallMember.label : '';
            break;
        default:
            initiator_details = "";
            break;
    }
    
    return initiator_details;

}


// return the against details
export const getFeedBackAgainstDetails = (data) => {
    
    let against_details = '';

    switch (data.agCatOption) {
        case 'aga_hcm_general':
            against_details = data.agFirstName +' '+ data.agLastName;
            break;
        case 'aga_hcm_participant':
            against_details = data.agOnCallParticipant ? data.agOnCallParticipant.label : '';
            break;
        case 'aga_hcm_organisation':
            against_details = data.agOnCallOrganisation ? data.agOnCallOrganisation.label : '';
            break;
        case 'aga_hcm_site':
            against_details = data.agOnCallSiteName ? data.agOnCallSiteName.label : '';
            break;
        case 'aga_hcm_member':
            against_details = data.agOnCallMember ? data.agOnCallMember.label : '';
            break;              
        default:
            against_details = "";
            break;
    }
    
    return against_details;

}

// return the allowed file type
export const allowedFileTypeForNeedAssessment = () => {
    
    return [
        '.doc',
        '.docx',
        '.pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
        'image/jpg',
        'image/jpeg',
        'image/png'
      ];   

}

// return the allowed file extension
export const allowedFileExtensionForNeedAssessment = () => {
    
    return [
        'jpg',
        'jpeg',
        'png',     
        'doc',
        'docx',
        'pdf', 
      ];
}
export const getAddressForViewPage = (address, unit_number) =>{    
    let address_unit_number = address;
    if(address && unit_number){
        address = address == 0 ? 'N/A' : address
        address_unit_number =  unit_number +', '+ address;
    }else if(!address && unit_number){
        address_unit_number =  unit_number;
    }else if(!address && !unit_number){
        address_unit_number = "N/A" ;
    }
    return address_unit_number;

}

// get calculated age by date
export const getAgeByDateOfBirth = (dateYmdHis) => {
    var ageVal = '';
    var dob = moment(dateYmdHis).format('YYYYMMDD');
    var year = Number(dob.substr(0, 4));
    var month = Number(dob.substr(4, 2)) - 1;
    var day = Number(dob.substr(6, 2));
    var today = new Date();
    ageVal = today.getFullYear() - year;
    if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
        ageVal--;
    }
    return ageVal;
}

/***
 * fetch the AM or PM
 */
 export const get_am_pm_value = (hr, mins, amorpm) => {
    if (hr == 0) {
        hr = '12:' + mins + " " + amorpm;
    } else if (hr < 10) {
        hr = '0' + hr + ':' + mins + " " + amorpm;
    } else {
        hr = hr + ':' + mins + " " + amorpm;
    }
    return hr;
}
/***
 * Get the default start time with 1hr incremented
 */
 export const get_start_hour_time = (added_hr, mins) => {
    let start_or_end_hr = '06:00 AM'
    if (added_hr > 12 && added_hr != 24) {
        start_or_end_hr = added_hr - 12;
        start_or_end_hr = get_am_pm_value(start_or_end_hr, mins, 'PM');
    } else if (added_hr < 12 && added_hr != 12) {
        start_or_end_hr = added_hr;
        start_or_end_hr = get_am_pm_value(start_or_end_hr, mins, 'AM');
    } else if (added_hr == 12) {
        start_or_end_hr = added_hr;
        start_or_end_hr = get_am_pm_value(start_or_end_hr, mins, 'PM');
    } else {
        start_or_end_hr = 12;
        start_or_end_hr = get_am_pm_value(start_or_end_hr, mins, 'AM');
    }
    return start_or_end_hr;
}

/***
 * Get the default end time with 1hr incremented with start time
 */
 export const get_end_time = (hrs, mins) => {
    let hr = '';
    let hrminutes = '';
    if (parseInt(hrs) == 12) {
        hr = parseInt(hrs - 11);
        hrminutes = '0' + hr + ':' + mins;
        if (hr > 11) {
            hrminutes = hrminutes.replace("AM", "PM");
        }
    } else {
        hr = parseInt(hrs) + 1;
        if (hr < 10) {
            hrminutes = '0' + hr + ':' + mins;
            if (hr > 11) {
                hrminutes = hrminutes.replace("AM", "PM");
            }
        } else {
            hrminutes = hr + ':' + mins;
            if (hr > 11) {
                if (hrminutes.includes('AM')) {
                    hrminutes = hrminutes.replace("AM", "PM");
                } else {
                    hrminutes = hrminutes.replace("PM", "AM");
                }
            }
        }
    }
    return hrminutes;
}
// set the style for GB applicants
export const flag_style = () => {

    return {
        width: '9px',
        height: '9px',
        background: '#E2522F',
        borderRadius: '50%',
        display: 'inline-block'
    }
}

export const unsucessful_style = () => {

    return {
        width: '9px',
        height: '9px',
        background: '#FFC600',
        borderRadius: '50%',
        display: 'inline-block'
    }
}
// fetch visa catory list for docs
export const getVisaCategory = () => {
    return new Promise((resolve, reject) => {
        postData("item/Document/get_all_visa_category", {}).then(result => {
            if (result) {
                resolve(result);
            }
        });
    });
}
//fetch visa type by visa category
export const getVisaTypeByCategory = (visa_category) => {
    return new Promise((resolve, reject) => {
        postData("item/Document/get_all_visa_type_by_visa_category", {visa_category: visa_category}).then(result => {
            if (result) {
                resolve(result);
            }
        });
    });
}