import React from "react";
import Select from "react-select-plus";
import jQuery from "jquery";
import "../../../../../../service/jquery.validate.js";
import { ROUTER_PATH, BASE_URL } from "../../../../../../config.js";
import {
    postData,
    getOptionsSuburb,
    handleAddShareholder
} from "../../../../../../service/common.js";
import DatePicker from "react-datepicker";
import moment from "moment";
import {
    listViewSitesOption,
    relationDropdown,
    sitCategoryListDropdown,
    ocDepartmentDropdown,
    getAboriginalOrTSI,
    LivingSituationOption
} from "../../../../../../dropdown/CrmDropdown.js";

export const RefererData = props => {
    return (
        <React.Fragment>
            <form id="referral_details">
                <div className="row">
                    <div className="col-md-12 py-4 title_sub_modal">Referer Details</div>
                </div>
                <div className="row">
                    <div className="w-20-lg col-md-3 mb-4">
                        <label className="title_input">First name: </label>
                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                            <input
                                name="first_name"
                                type="text"
                                className="default-input"
                                onChange={e => props.handleChanges(e, "refererDetails")}
                                maxLength="30"
                                value={props.sts.first_name || ""}
                            /> {/*data-msg-required="Referer first name is required"
                            data-rule-required="true"*/}
                        </div>
                    </div>
                    <div className="w-20-lg col-md-3 mb-4">
                        <label className="title_input">Last Name: </label>
                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                            <input
                                name="last_name"
                                type="text"
                                onChange={e => props.handleChanges(e, "refererDetails")}
                                className="default-input"
                                value={props.sts.last_name || ""}
                            /> {/*data-rule-required="true"
                            data-msg-required="Referer last name is required"*/}
                        </div>
                    </div>
                    <div className="w-20-lg col-md-3 mb-4">
                        <label className="title_input">Organisation: </label>
                        <div className="">
                            <input
                                name="organisation"
                                type="text"
                                className="default-input"
                                onChange={e => props.handleChanges(e, "refererDetails")}
                                value={props.sts.organisation || ""}
                            />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="w-20-lg col-md-3 mb-4">
                        <label className="title_input">Email: </label>
                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                            <input
                                name="remail"
                                type="text"
                                className="default-input"
                                data-rule-email="true"
                                onChange={e => props.handleChanges(e, "refererDetails")}
                                value={props.sts.remail || ""}
                                maxLength="64"
                            /> {/*data-rule-required="true"
                            data-msg-required="Referer email is required"*/}
                        </div>
                    </div>
                    <div className="w-20-lg col-md-3 mb-4">
                        <label className="title_input">Phone Number: </label>
                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                            <input
                                name="phone_number"
                                type="text"
                                className="default-input"
                                data-rule-phonenumber
                                onChange={e => props.handleChanges(e, "refererDetails")}
                                value={props.sts.phone_number || ""}
                            /> {/*data-rule-required="true"
                            data-msg-required="Referer phone is required"*/}
                        </div>
                    </div>
                    <div className="w-20-lg col-md-3 mb-4">
                        <label className="title_input">Relationship to Participant: </label>
                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                            <div className="s-def1">
                                <Select
                                    id="relation"
                                    name="relation"
                                    options={props.optsState.relations_participant}
                                    simpleValue={true}
                                    searchable={true}
                                    clearable={false}
                                    onChange={e =>
                                        props.updateSelect(e, "relation", "refererDetails")
                                    }
                                    value={props.sts.relation}
                                    className={"custom_select default_validation"}
                                /> {/*required={true}*/}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-end">
                    <div className="w-20-lg col-md-3">
                        <a className="btn-1" onClick={props.submitReferDetail}>
                            Save And Continue
                        </a>
                    </div>
                </div>
            </form>
        </React.Fragment>
    );
};
