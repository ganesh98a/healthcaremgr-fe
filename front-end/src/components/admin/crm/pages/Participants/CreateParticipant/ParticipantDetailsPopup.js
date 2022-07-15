import React from "react";
import Select from "react-select-plus";
import DatePicker from "react-datepicker";
import moment from "moment";
import Autocomplete from "react-google-autocomplete";
import ReactGoogleAutocomplete from "../../../../externl_component/ReactGoogleAutocomplete";
import { preferredContact } from "../../../../../../dropdown/CrmDropdown.js";
import { postData, getOptionsSuburb } from "service/common.js";
import ScrollArea from "react-scrollbar";
import BlockUi from 'react-block-ui';



export const ParticipantDetailsPopup = props => {
    return (
        <BlockUi tag="div" blocking={props.loading_participant_popup}>
            <React.Fragment>
                <form id="partcipant_details">
                    <div className="row">
                        <div className="col-md-12 py-4 title_sub_modal">
                            Participant Details
          </div>
                    </div>

                    <div className="row">
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">NDIS Number: </label>
                            <div className="required">
                                <input
                                    name="ndisno"
                                    type="text"
                                    className="default-input"
                                    data-rule-required="true"
                                    data-rule-maxlength="9"
                                    data-rule-minlength="9"
                                    maxLength="9"
                                    data-msg-required="NDIS No is required"
                                    data-msg-number="Please enter valid NDIS No"
                                    onChange={e => props.handleNdis(e, "participantDetails")}
                                    value={props.sts.ndisno || ""}
                                    disabled={!props.sts.crm_participant_id ? false : true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">First Name: </label>
                            <div className="required">
                                <input
                                    type="text"
                                    name="firstname"
                                    data-msg-required="Participant firstname is required"
                                    className="default-input"
                                    data-rule-required="true"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.firstname || ""}
                                />
                            </div>
                        </div>
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">Last Name: </label>
                            <div className="required">
                                <input
                                    type="text"
                                    name="lastname"
                                    className="default-input"
                                    data-msg-required="Participant lastname is required"
                                    data-rule-required="true"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.lastname || ""}
                                />
                            </div>
                        </div>

                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">Preferred First Name: </label>
                            <div className="">
                                <input
                                    type="text"
                                    name="preferredfirstname"
                                    className="default-input"
                                    data-msg-required="Participant Preferred firstname is required"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.preferredfirstname || ""}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">Email: </label>
                            <div className="required">
                                <input
                                    type="text"
                                    name="email"
                                    className="default-input"
                                    data-rule-required="true"
                                    data-msg-required="Participant Email is required"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.email || ""}
                                    maxLength="64"
                                />
                            </div>
                        </div>
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">Phone Number: </label>
                            <div className="required">
                                <input
                                    type="text"
                                    name="phonenumber"
                                    className="default-input"
                                    data-rule-required="true"
                                    data-msg-required="Participant Phone Number is required"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.phonenumber || ""}
                                />
                            </div>
                        </div>
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">Date of Birth: </label>
                            <div className="required">
                                <DatePicker
                                    autoComplete={"off"}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={110}
                                    dateFormat="dd-MM-yyyy"
                                    required={true}
                                    data-placement={"bottom"}
                                    maxDate={moment()}
                                    name="Dob"
                                    onChange={e =>
                                        props.updateSelect(e, "Dob", "participantDetails")
                                    }
                                    className="text-center px-0"
                                    placeholderText="DD/MM/YYYY"
                                    selected={
                                        props.sts.Dob
                                    }
                                    data-msg-required="Participant DOB is required"
                                    customInput={
                                        <input data-msg-required="Participant DOB is required" />
                                    }
                                    disabled={!props.sts.crm_participant_id ? false : true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-30-lg col-md-6 mb-4">
                            <label className="title_input">Street Address: </label>
                            <div className="required">
                                <ReactGoogleAutocomplete
                                    className="add_input mb-1"
                                    key={1}
                                    required={true}
                                    data-msg-required="Participant address is required"
                                    name="Address"
                                    onPlaceSelected={place =>
                                        props.googleAddress(
                                            "Address",
                                            "street",
                                            place,
                                            "personalAddress",
                                            "participantDetails"
                                        )
                                    }
                                    types={["address"]}
                                    value={props.sts.Address || ""}
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    componentRestrictions={{ country: "au" }}
                                />
                            </div>
                        </div>
                        <div className="w-10-lg col-md-2 mb-4">
                            <label className="title_input">State</label>
                            <div className="required">
                                <div className="s-def1">
                                    <Select
                                        id="state"
                                        options={props.optsState.suburbState}
                                        required={true}
                                        simpleValue={true}
                                        inputProps={{ readOnly: true }}
                                        searchable={true}
                                        clearable={false}
                                        placeholder="Please Select"
                                        onChange={e => {
                                            props.updateSelect(e, "state", "participantDetails");
                                        }}
                                        value={props.sts.state || ""}
                                        className={"custom_select default_validation"}
                                        name="state"
                                        ref={props.selectStateClose}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-10-lg col-md-2 mb-4">
                            <label className="title_input">Suburb</label>
                            <div className="required">
                                <div className="s-def1">
                                    {/* <Select.Async
                                    searchable={false}
                                    clearable={false}
                                    value={props.sts.city}
                                    cache={false}
                                    id="city"
                                    inputProps={{ readOnly: true }}
                                    disabled={true}
                                    loadOptions={(val) => getOptionsSuburb(val, props.sts.state)}
                                    onChange={(e) => { props.updateSelect(e, 'city', 'participantDetails') }}
                                    placeholder="Please Select" /> */}
                                    <input
                                        type="text"
                                        name="city"
                                        className="default-input"
                                        value={props.sts.city || ""}
                                        data-rule-required="true"
                                        data-msg-required="Participant suburb is required"
                                        onChange={e => props.handleChanges(e, "participantDetails")}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-10-lg col-md-2 mb-4">
                            <label className="title_input">Post code</label>
                            <div className="required">
                                <input
                                    type="text"
                                    name="postcode"
                                    className="default-input"
                                    value={props.sts.postcode || ""}
                                    maxLength="4"
                                    data-rule-required="true"
                                    data-rule-number="true"
                                    data-rule-postcodecheck="true"
                                    data-msg-required="Participant Postcode is required"
                                    data-msg-number="Please enter valid postcode"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                // onChange={(e) => props.handleChanges(e, 'participantDetails')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-30-lg col-md-6 mb-4">
                            <label className="title_input">Medicare No: </label>
                            <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                <input
                                    type="text"
                                    name="medicare"
                                    // data-rule-required="true"
                                    // data-msg-required="Medicare no. is required"
                                    data-rule-number={true}
                                    className="default-input"
                                    maxLength="10"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.medicare || ""}
                                />
                            </div>
                        </div>

                        <div className="w-30-lg col-md-6 mb-4">
                            <label className="title_input">CRN </label>
                            <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                <input
                                    type="text"
                                    name="crn"
                                    // data-rule-required="true"
                                    // data-msg-required="CRN no. is required"
                                    data-rule-number={true}
                                    className="default-input"
                                    maxLength="6"
                                    onChange={e => props.handleChanges(e, "participantDetails")}
                                    value={props.sts.crn || ""}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-30-lg col-md-6 mb-4">
                            <label className="title_input">Preferred Contact: </label>
                            <div className="required">
                                <div className="s-def1">
                                    <Select
                                        id="preferred_contact"
                                        options={preferredContact()}
                                        required={true}
                                        simpleValue={true}
                                        searchable={true}
                                        clearable={false}
                                        placeholder="Please Select"
                                        onChange={e => {
                                            props.updateSelect(
                                                e,
                                                "preferred_contact",
                                                "participantDetails"
                                            );
                                        }}
                                        value={props.sts.preferred_contact}
                                        className={"custom_select default_validation"}
                                        name="preferred_contact"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* <div className="w-30-lg col-md-6 mb-4">
            <label className="title_input">Primary Contact </label>
            <div className="required">
              <div className="s-def1">
                <Select
                  name="primary_contact"
                  options={primaryContact()}
                  required={true} simpleValue={true}
                  searchable={false} clearable={false} placeholder="Please Select"
                  onChange={(e) => props.updateSelect(e, 'primary_contact', 'participantDetails')}
                  value={props.sts.primary_contact}
                  className={'custom_select default_validation'}
                  inputRenderer={() => <input type="text" className="define_input" name={"primary_contact"}
                    data-msg-required="Primary Contact is required" value={props.sts.primary_contact}
                    data-rule-required={true} />}
                />

              </div>
            </div>
          </div> */}
                    </div>

                    <div className="row">
                        <div className="col-md-12 py-4 title_sub_modal">Next of Kin</div>
                    </div>

                    {props.sts.kin_details.map((kin, i) => {
                        return (
                            <React.Fragment key={i}>
                                <div className="row">
                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">First Name: </label>
                                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                            <input
                                                type="text"
                                                name={"first_name_" + i}
                                                className="default-input"
                                                value={kin.first_name || ""}
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "first_name",
                                                        "participantDetails",
                                                        "kin_details",
                                                        i
                                                    )
                                                }
                                            /> {/*data-msg-required="First Name. is required"
                                            data-rule-required="true"*/}
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Last Name: </label>
                                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                            <input
                                                type="text"
                                                name={"last_name_" + i}
                                                data-msg-required="Last Name. is required"
                                                className="default-input"
                                                value={kin.last_name || ""}
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "last_name",
                                                        "participantDetails",
                                                        "kin_details",
                                                        i
                                                    )
                                                }
                                            /> {/*data-rule-required="true"*/}
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Relation</label>
                                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                            <div className="s-def1">
                                                <Select
                                                    id="kin_relation"
                                                    name={"relation_" + i}
                                                    options={props.optsState.relationOpts}
                                                    simpleValue={true}
                                                    searchable={true}
                                                    clearable={false}
                                                    placeholder="Please Select"
                                                    onChange={e =>
                                                        props.updateArrSelect(
                                                            e,
                                                            "relation",
                                                            "participantDetails",
                                                            "kin_details",
                                                            i
                                                        )
                                                    }
                                                    value={kin.relation}
                                                    className={"custom_select default_validation"}
                                                /> {/*required={true}*/}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row d-flex flex-wrap">
                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Phone: </label>
                                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                            <input
                                                type="text"
                                                name={"phone_" + i}
                                                data-msg-required="Phone is required"
                                                className="default-input"
                                                value={kin.phone || ""}
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "phone",
                                                        "participantDetails",
                                                        "kin_details",
                                                        i
                                                    )
                                                }
                                                data-rule-phonenumber="true"
                                            /> {/*data-rule-required="true"*/}
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Email: </label>
                                        <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                            <input
                                                type="text"
                                                name={"email_" + i}
                                                className="default-input"
                                                value={kin.email || ""}
                                                maxLength="64"
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "email",
                                                        "participantDetails",
                                                        "kin_details",
                                                        i
                                                    )
                                                }
                                                data-rule-email="true"
                                            /> {/*data-msg-required="Email is required"
                                            data-rule-required="true"*/}
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4 align-self-end d-inline-flex">
                                        {props.sts.kin_details.length !== 1 ? (
                                            <span
                                                className="button_plus__ ml-2"
                                                onClick={e =>
                                                    props.rowDeleteHandler(
                                                        e,
                                                        "participantDetails",
                                                        "kin_details",
                                                        i
                                                    )
                                                }
                                            >
                                                <i className="icon icon-decrease-icon Add-2-2"></i>
                                            </span>
                                        ) : null}

                                        {props.sts.kin_details.length == i + 1 ? (
                                            props.sts.kin_details.length !== 3 ? (
                                                <span
                                                    className="button_plus__ ml-2"
                                                    onClick={e =>
                                                        props.rowAddHandler(
                                                            e,
                                                            "participantDetails",
                                                            "kin_details"
                                                        )
                                                    }
                                                >
                                                    <i className="icon icon-add-icons  Add-2-1"></i>
                                                </span>
                                            ) : null
                                        ) : null}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                    <div className="row">
                        <div className="col-md-12 py-4 title_sub_modal">Booker Details</div>
                    </div>

                    {props.sts.booker_details.map((booker, i) => {
                        return (
                            <React.Fragment key={i}>
                                <div className="row">
                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">First Name: </label>
                                        <div className="required">
                                            <input
                                                type="text"
                                                name={"first_name_b_" + i}
                                                data-msg-required="First Name. is required"
                                                className="default-input"
                                                data-rule-required="true"
                                                value={booker.first_name || ""}
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "first_name",
                                                        "participantDetails",
                                                        "booker_details",
                                                        i
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Last Name: </label>
                                        <div className="required">
                                            <input
                                                type="text"
                                                name={"last_name_b_" + i}
                                                data-msg-required="Last Name. is required"
                                                className="default-input"
                                                data-rule-required="true"
                                                value={booker.last_name || ""}
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "last_name",
                                                        "participantDetails",
                                                        "booker_details",
                                                        i
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Relation</label>
                                        <div className="required">
                                            <div className="s-def1">
                                                <Select
                                                    name={"relation_b_" + i}
                                                    id="booker_relation"
                                                    options={props.optsState.relationOpts}
                                                    required={true}
                                                    simpleValue={true}
                                                    searchable={true}
                                                    clearable={false}
                                                    placeholder="Please Select"
                                                    onChange={e =>
                                                        props.updateArrSelect(
                                                            e,
                                                            "relation",
                                                            "participantDetails",
                                                            "booker_details",
                                                            i
                                                        )
                                                    }
                                                    value={booker.relation}
                                                    className={"custom_select default_validation"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row d-flex flex-wrap">
                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Phone: </label>
                                        <div className="required">
                                            <input
                                                type="text"
                                                name={"phone_b_" + i}
                                                data-msg-required="Phone is required"
                                                className="default-input"
                                                data-rule-required="true"
                                                value={booker.phone || ""}
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "phone",
                                                        "participantDetails",
                                                        "booker_details",
                                                        i
                                                    )
                                                }
                                                data-rule-phonenumber="true"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4">
                                        <label className="title_input">Email: </label>
                                        <div className="required">
                                            <input
                                                type="text"
                                                name={"email_b_" + i}
                                                data-msg-required="Email is required"
                                                className="default-input"
                                                data-rule-required="true"
                                                value={booker.email || ""}
                                                maxLength="64"
                                                onChange={e =>
                                                    props.arrInputHandler(
                                                        e,
                                                        "email",
                                                        "participantDetails",
                                                        "booker_details",
                                                        i
                                                    )
                                                }
                                                data-rule-email="true"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-20-lg col-md-3 mb-4 align-self-end d-inline-flex">
                                        {props.sts.booker_details.length !== 1 ? (
                                            <span
                                                className="button_plus__ ml-2"
                                                onClick={e =>
                                                    props.rowDeleteHandler(
                                                        e,
                                                        "participantDetails",
                                                        "booker_details",
                                                        i
                                                    )
                                                }
                                            >
                                                <i className="icon icon-decrease-icon Add-2-2"></i>
                                            </span>
                                        ) : null}
                                        {props.sts.booker_details.length == i + 1 ? (
                                            props.sts.booker_details.length !== 3 ? (
                                                <span
                                                    className="button_plus__ ml-2"
                                                    onClick={e =>
                                                        props.rowAddHandler(
                                                            e,
                                                            "participantDetails",
                                                            "booker_details"
                                                        )
                                                    }
                                                >
                                                    <i className="icon icon-add-icons  Add-2-1"></i>
                                                </span>
                                            ) : null
                                        ) : null}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    <div className="row">
                        <div className="col-md-12 py-4 title_sub_modal">
                            Participant Living Situation
          </div>
                    </div>
                    <div className="row">
                        <div className="w-20-lg col-md-3 mb-4">
                            <label className="title_input">Marital Status</label>
                            <div className="">{/*<div className="required"> for PIMSD-22 remove the required field */}
                                <div className="s-def1">
                                    <Select
                                        id="maritalstatus"
                                        name="maritalstatus"
                                        options={props.optsState.marital_status}
                                        simpleValue={true}
                                        searchable={true}
                                        clearable={false}
                                        placeholder="Please Select"
                                        onChange={e =>
                                            props.updateSelect(e, "martialstatus", "participantDetails")
                                        }
                                        value={props.sts.martialstatus}
                                        className={"custom_select default_validation"}
                                    /> {/*required={true}*/}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-40-lg col-md-6 mb-4">
                            <label className="title_input">Living Situation</label>
                            <div className="required">
                                <div className="s-def1">
                                    <Select
                                        id="livingsituation"
                                        name="livingsituation"
                                        options={props.optsState.living_situation}
                                        required={true}
                                        simpleValue={true}
                                        searchable={true}
                                        clearable={false}
                                        placeholder="Please Select"
                                        onChange={e =>
                                            props.updateSelect(
                                                e,
                                                "livingsituation",
                                                "participantDetails"
                                            )
                                        }
                                        value={props.sts.livingsituation}
                                        className={"custom_select default_validation"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-5 pl-3">
                        <div className="w-20-lg col-md-3">
                            <label className="title_input t_input-01__ pl-0 ">
                                Is the participant of Aboriginal or Torres Strait Islander descent?{" "}
                            </label>
                            <div className="row required">
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        Yes
                                    <input
                                            type="radio"
                                            name="aboriginal_tsi"
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            value={1}
                                            checked={props.sts.aboriginal_tsi == 1 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        No
                                    <input
                                            type="radio"
                                            name="aboriginal_tsi"
                                            value={0}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.aboriginal_tsi == 0 ? true : false}
                                        />
                                        <span className="checkround ml-2" defaultChecked></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-5 pl-3 bb-1">
                        <div className="w-20-lg col-md-3">
                            <label className="title_input t_input-01__ pl-0">Gender </label>
                            {//  {!props.sts.crm_participant_id ? (
                            }
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        Male
                    <input
                                            type="radio"
                                            name="gender"
                                            value={1}
                                            onChange={e =>
                                                props.handleChanges(e, "participantDetails")
                                            }
                                            checked={props.sts.gender == 1 ? true : false}
                                            required={true}
                                            data-msg-required="Participant gender is required"
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        Female
                    <input
                                            type="radio"
                                            name="gender"
                                            value={2}
                                            onChange={e =>
                                                props.handleChanges(e, "participantDetails")
                                            }
                                            checked={props.sts.gender == 2 ? true : false}
                                            required={true}
                                            data-msg-required="Participant gender is required"
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                            </div>
                            {    // ) : (
                                //         <div className="row">
                                //             <div className="col-md-6">
                                //                 {props.sts.gender == 1 ? "Male" : "Female"}
                                //             </div>
                                //         </div>
                                //     )}
                            }
                        </div>
                        <div className="w-20-lg col-md-3">
                            <label className="title_input t_input-01__ pl-0">
                                Does the participant have a current behavioural support plan?{" "}
                            </label>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        Yes
                  <input
                                            type="radio"
                                            name="current_behavioural"
                                            value={1}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.current_behavioural == 1 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        No
                  <input
                                            type="radio"
                                            name="current_behavioural"
                                            value={0}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.current_behavioural == 0 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {props.sts.current_behavioural == 1 ? (
                            <div className="row">
                                <div className="col-md-9 col-lg-12">
                                    <label className="title_input t_input-01__ pl-0 w-25 mb-3">
                                        <b>New Behavioural Support Plan Doc</b>
                                    </label>
                                    <div className="cstmSCroll1">
                                        <ScrollArea
                                            speed={0.8}
                                            className="stats_update_list"
                                            contentClassName="content"
                                            horizontal={false}
                                            style={{
                                                paddingRight: "15px",
                                                height: "auto",
                                                maxHeight: "315px"
                                            }}
                                        >
                                            <div className="row attch_row">
                                                {props.sts.hearing_file.length > 0 ? (
                                                    props.sts.hearing_file.map((val, index) => (
                                                        <div className="col-sm-2 col-xs-3" key={index}>
                                                            <div className="attach_item">
                                                                {/*index == 0 ? <h5><b>Hearing Imparement</b></h5> : <h5><b>Hearing Imparement</b></h5>*/}
                                                                <i className="icon icon-document3-ie "></i>
                                                                <p>{val.name}</p>
                                                                <span
                                                                    className="icon icon-close3-ie color cursor-pointer"
                                                                    title={"Delete"}
                                                                    onClick={() =>
                                                                        props.deletefiles(
                                                                            "behaviouraldoc",
                                                                            "participantDetails",
                                                                            index
                                                                        )
                                                                    }
                                                                ></span>
                                                                <span
                                                                    className="icon icon-view3-ie color cursor-pointer f-18 mt-2 mx-2"
                                                                    title={"View"}
                                                                    onClick={() => props.viewDocument(val.name)}
                                                                ></span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                        <React.Fragment />
                                                    )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="row mt-3">
                                        <div className="w-20-lg col-md-3 mb-4">
                                            <label className="btn-file">
                                                <div className="v-c-btn1 n2">
                                                    <span>Upload File</span>
                                                    <i
                                                        className="icon icon-if-ic-file-upload-48px-352345"
                                                        aria-hidden="true"
                                                    ></i>
                                                </div>
                                                <input
                                                    className="p-hidden"
                                                    value={props.sts.hearing_file_selected || ""}
                                                    type="file"
                                                    name="hearing_file"
                                                    multiple
                                                    onChange={e =>
                                                        props.handleChanges(e, "participantDetails")
                                                    }
                                                />
                                            </label>
                                            {
                                                // <label className="btn-file">
                                                //   <div className="v-c-btn1 n2"><span>Browse</span><i className="icon " aria-hidden="true"></i></div>
                                                //   <input className="p-hidden" type="file" />
                                                // </label>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                                ""
                            )}
                    </div>

                    <div className="row mb-5">
                        <div className="w-20-lg col-md-3">
                            <label className="title_input t_input-01__ pl-0">
                                Does the participant have any other relevent plans?{" "}
                            </label>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        Yes
                  <input
                                            type="radio"
                                            name="other_relevent_plans"
                                            value={1}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.other_relevent_plans == 1 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                <div className="col-md-6">
                                    <label className="radio_F1 justify-content-center">
                                        No
                  <input
                                            type="radio"
                                            name="other_relevent_plans"
                                            value={0}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.other_relevent_plans == 0 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12 py-4 title_sub_modal">
                            Participant NDIS Plan:
          </div>
                    </div>

                    <div className="row pl-3">
                        <div className="w-20-lg col-md-3">
                            <label className="title_input t_input-01__ pl-0">
                                How is the Participant Plan Managed?{" "}
                            </label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="w-80-lg col-md-9 pl-5">
                            <div className="row my-3">
                                <div className="w-20-lg col-md-3">
                                    <label className="radio_F1">
                                        Self Managed
                  <input
                                            type="radio"
                                            name="plan_management"
                                            value={1}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.plan_management == 1 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                <div className="w-40-lg col-md-6 col-md-offset-1"></div>
                            </div>

                            <div className="row my-3">
                                <div className="w-20-lg col-md-3">
                                    <label className="radio_F1">
                                        Portal Managed
                  <input
                                            type="radio"
                                            name="plan_management"
                                            value={2}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.plan_management == 2 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                <div className="w-40-lg col-md-6 col-md-offset-1"></div>
                            </div>

                            <div className="row my-3">
                                <div className="w-20-lg col-md-3">
                                    <label className="radio_F1">
                                        Using a Plan Management Provider
                  <input
                                            type="radio"
                                            name="plan_management"
                                            value={3}
                                            onChange={e => props.handleChanges(e, "participantDetails")}
                                            checked={props.sts.plan_management == 3 ? true : false}
                                        />
                                        <span className="checkround ml-2"></span>
                                    </label>
                                </div>
                                {props.sts.plan_management == 3 ? (
                                    <div className="w-40-lg col-md-6 col-md-offset-1">
                                        <div className="row">
                                            <div className="col-md-12 mb-4">
                                                <label className="title_input">
                                                    Please provide the name of the Plan Management Provider:{" "}
                                                </label>
                                                <div className="required">
                                                    <input
                                                        type="text"
                                                        name="provide_plan"
                                                        data-msg-required="Participant name of the Participant plan Management Provider is required"
                                                        className="default-input"
                                                        onChange={e =>
                                                            props.handleChanges(e, "participantDetails")
                                                        }
                                                        value={props.sts.provide_plan}
                                                        data-rule-required={
                                                            props.sts.plan_management == 3 ? "true" : "false"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-4">
                                                <label className="title_input">
                                                    Please Provide the Plan Manager's Email Address:{" "}
                                                </label>
                                                <div className="required">
                                                    <input
                                                        type="text"
                                                        name="provide_email"
                                                        className="default-input"
                                                        data-msg-required="Participant plan Manager Email is required"
                                                        onChange={e =>
                                                            props.handleChanges(e, "participantDetails")
                                                        }
                                                        value={props.sts.provide_email}
                                                        data-rule-required={
                                                            props.sts.plan_management == 3 ? "true" : "false"
                                                        }
                                                        data-rule-email="true"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-4">
                                                <label className="title_input">
                                                    Please Provide the Plan Managements Address:{" "}
                                                </label>
                                                <div className="required">
                                                    {
                                                        // <input type="text" name="provide_address" className="default-input" data-msg-required="Participant plan Managements Address is required" onChange={(e) => props.handleChanges(e, 'participantDetails')} value={props.sts.provide_address} data-rule-required={(props.sts.plan_management) == 3 ? "true" : "false"} />
                                                    }
                                                    <ReactGoogleAutocomplete
                                                        className="add_input mb-1"
                                                        key={1}
                                                        required={true}
                                                        data-msg-required="Participant plan Managements Address is required"
                                                        name="provide_address"
                                                        onPlaceSelected={place =>
                                                            props.googleAddress(
                                                                "Address",
                                                                "street",
                                                                place,
                                                                "mgmtAddress",
                                                                "participantDetails"
                                                            )
                                                        }
                                                        types={["address"]}
                                                        value={props.sts.provide_address || ""}
                                                        onChange={e =>
                                                            props.handleChanges(e, "participantDetails")
                                                        }
                                                        componentRestrictions={{ country: "au" }}
                                                        data-rule-required={
                                                            props.sts.plan_management == 3 ? "true" : "false"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-4">
                                                <label className="title_input">State</label>
                                                <div className="required">
                                                    <div className="s-def1">
                                                        <Select
                                                            id="provide_state"
                                                            name="provide_state"
                                                            options={props.optsState.suburbState}
                                                            required={true}
                                                            simpleValue={true}
                                                            searchable={true}
                                                            clearable={false}
                                                            placeholder="Please Select"
                                                            onChange={e =>
                                                                props.updateSelect(
                                                                    e,
                                                                    "provide_state",
                                                                    "participantDetails"
                                                                )
                                                            }
                                                            value={props.sts.provide_state}
                                                            className={"custom_select default_validation"}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-4">
                                                <label className="title_input">Post code</label>
                                                <div className="required">
                                                    <input
                                                        type="text"
                                                        name="provide_postcode"
                                                        data-msg-required="Participant plan Managements post code is required"
                                                        value={props.sts.provide_postcode}
                                                        className="default-input"
                                                        onChange={e =>
                                                            props.handleChanges(e, "participantDetails")
                                                        }
                                                        data-rule-required={
                                                            props.sts.plan_management == 3 ? "true" : "false"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                        ""
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12 bt-1 pt-5">
                            <label className="title_input t_input-01__ pl-0 w-100 mb-0">
                                <b>Attach NDIS plan (or relevant section of plan)</b>
                            </label>
                            {/* <ul className="file_down quali_width  w-100">
                        <li className="w-20 px-2">
                          <div className="path_file mt-0 mb-4"><b>Hearing Imparement</b></div>
                          <span className="icon icon-file-icons d-block"></span>
                          <div className="path_file _pf_"><span>{props.sts.ndis_file_name}</span>  <div className=""><i className="icon icon-close3-ie color" onClick={()=>props.deletefiles('ndisdoc')}></i></div></div>
                        </li>
                      </ul> */}

                            <div className="cstmSCroll1">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    style={{
                                        paddingRight: "15px",
                                        height: "auto",
                                        maxHeight: "315px"
                                    }}
                                >
                                    <div className="row attch_row">
                                        {props.sts.ndis_file !== undefined ? (
                                            props.sts.ndis_file.length > 0 ? (
                                                props.sts.ndis_file.map((val, index) => (
                                                    <div className="col-sm-2 col-xs-3" key={index}>
                                                        <div className="attach_item">
                                                            {/*<h5><b>Hearing Imparement</b></h5>*/}
                                                            <i className="icon icon-document3-ie "></i>
                                                            <p>{val.name}</p>
                                                            <span
                                                                className="icon icon-close3-ie color cursor-pointer"
                                                                title={"Delete"}
                                                                onClick={() =>
                                                                    props.deletefiles(
                                                                        "ndisdoc",
                                                                        "participantDetails",
                                                                        index
                                                                    )
                                                                }
                                                            ></span>
                                                            <span
                                                                className="icon icon-view3-ie color cursor-pointer f-18 mt-2 mx-2"
                                                                title={"View"}
                                                                onClick={() => props.viewPlanDocument(val.name)}
                                                            ></span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                    <React.Fragment />
                                                )
                                        ) : null}
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="w-20 px-2">
                                <label className="btn-file">
                                    <div className="v-c-btn1 n2">
                                        <span>Upload File</span>
                                        <i
                                            className="icon icon-if-ic-file-upload-48px-352345"
                                            aria-hidden="true"
                                        ></i>
                                    </div>
                                    <input
                                        className="p-hidden"
                                        type="file"
                                        value={props.sts.ndis_file_selected || ""}
                                        name="ndis_file"
                                        multiple
                                        onChange={e => props.handleChanges(e, "participantDetails")}
                                        disabled={props.optsState.ndis_file_disabled}
                                    // accept={'image/gif, image/jpeg'}
                                    />
                                </label>
                                {
                                    // <label className="btn-file">
                                    //   <div className="v-c-btn1 n2"><span>Browse</span><i className="icon " aria-hidden="true" ></i></div>
                                    //   <input className="p-hidden" type="file" />
                                    // </label>
                                }
                            </div>

                            {/* <input
              type="file"
              onChange={(e) => props.fileUploadHandler(e)}
              name="ndis_file"
              accept={'.jpg, .jpeg, .png, .doc,.docx, .pdf'}
            /> */}
                        </div>
                    </div>

                    <div className="row d-flex justify-content-end">
                        <div className="w-20-lg col-md-3">
                            <a className="btn-1" onClick={props.submitParticipantDetail}>
                                Save And Continue
            </a>
                        </div>
                    </div>
                </form>
            </React.Fragment>
        </BlockUi>
    );
};
