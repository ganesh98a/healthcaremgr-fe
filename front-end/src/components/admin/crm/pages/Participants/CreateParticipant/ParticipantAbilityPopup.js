import React from "react";
import Select from "react-select-plus";
import {
    AssistanceCheckbox,
    MobilityCheckbox,
    LanguageCheckbox,
    CognitiveLevel,
    communicationDropdown,
    ethnicityDropdown2,
    religiousDropdown2
} from "../../../../../../dropdown/CrmDropdown.js";
import ScrollArea from "react-scrollbar";

export const ParticipantAbilityPopup = props => {
    // let othermobilityOpts = props.optsState.mobilityOpts.find(element => element.label == 'Other');
    //console.log(props);
    return (
        <React.Fragment>
            <form id="partcipant_ability">
                <div className="row">
                    <div className="col-md-12 py-4 title_sub_modal">
                        Participant Ability
          </div>
                </div>
                <div className="row mx-0 my-4">
                    <div className="w-20-lg col-md-3">
                        <label className="title_input pl-0">
                            Participant Cognitive Level:
            </label>
                        <div className="required">
                            <div className="s-def1 s1">
                                <Select
                                    id="cognitive_level"
                                    name="cognitive_level"
                                    options={props.optsState.cognitive_level}
                                    required={true}
                                    simpleValue={true}
                                    searchable={true}
                                    clearable={false}
                                    placeholder="Please Select"
                                    onChange={e =>
                                        props.updateSelect(
                                            e,
                                            "cognitive_level",
                                            "participantAbility"
                                        )
                                    }
                                    value={props.sts.cognitive_level}
                                    className={"custom_select default_validation"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-20-lg col-md-3">
                        <label className="title_input pl-0">Communication:</label>
                        <div className="required">
                            <div className="s-def1 s1">
                                <Select
                                    id="communication"
                                    name="communication"
                                    options={props.optsState.communicationOpts}
                                    required={true}
                                    simpleValue={true}
                                    searchable={true}
                                    clearable={false}
                                    placeholder="Please Select"
                                    onChange={e =>
                                        props.updateSelect(e, "communication", "participantAbility")
                                    }
                                    value={props.sts.communication}
                                    className={"custom_select default_validation"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-40-lg col-md-6">
                        <label className="title_input pl-0">
                            Hearing impaired interpreter required ?
            </label>
                        <div className="row pl-5">
                            <div className="col-md-3">
                                <label className="radio_F1">
                                    Yes
                  <input
                                        type="radio"
                                        name="hearing_interpreter"
                                        value={1}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.hearing_interpreter == 1 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row pl-5">
                            <div className="col-md-3">
                                <label className="radio_F1">
                                    No
                  <input
                                        type="radio"
                                        name="hearing_interpreter"
                                        value={0}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.hearing_interpreter == 0 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="w-30-lg col-md-4">
                        <label className="title_input pl-0">
                            Participant Mobility Requirements:{" "}
                        </label>
                        <label
                            htmlFor="require_mobility"
                            className="error CheckieError"
                            style={{ display: "block", width: "100%", marginBottom: "0px" }}
                        ></label>
                        <span className="required">
                        <div className="custom_scroll_set__">
                            <div className=" cstmSCroll1 CrmScroll">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    enableInfiniteScroll={true}
                                    style={{
                                        padding: "0",
                                        height: "auto",
                                        maxHeight: "118px",
                                        minHeight: "118px"
                                    }}
                                >
                                    <div className="row">
                                        <span>
                                            {props.optsState.mobilityOpts !== undefined &&
                                                props.optsState.mobilityOpts.length > 0
                                                ? props.optsState.mobilityOpts.map((val, i) => (
                                                    <span key={i}>
                                                        <div className="col-md-12 mb-2">
                                                            <label className="c-custom-checkbox CH_010">
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox1"
                                                                    id={val.value}
                                                                    name="require_mobility"
                                                                    value={val.value}
                                                                    checked={
                                                                        props.sts.require_mobility !== undefined
                                                                            ? props.sts.require_mobility.indexOf(
                                                                                val.value
                                                                            ) !== -1
                                                                                ? true
                                                                                : false
                                                                            : false
                                                                    }
                                                                    onChange={e =>
                                                                        props.checkboxHandler(
                                                                            e,
                                                                            "participantAbility"
                                                                        )
                                                                    }
                                                                    data-rule-required="true"
                                                                    data-msg-required="Participant ability Mobility is required"
                                                                />
                                                                <i className="c-custom-checkbox__img"></i>
                                                                <div>{val.label}</div>
                                                            </label>
                                                        </div>
                                                    </span>
                                                ))
                                                : null}
                                        </span>
                                    </div>
                                    <div className="">
                                        <span>
                                            {props.sts.require_mobility !== undefined &&
                                                props.sts.require_mobility.length > 0
                                                ? props.sts.require_mobility.map((val, i) => {
                                                    if (
                                                        props.optsState.mobilityOpts !== undefined &&
                                                        props.optsState.mobilityOpts.length > 0
                                                    ) {
                                                        var other = props.optsState.mobilityOpts.find(
                                                            element => element.value == val
                                                        );

                                                        if (
                                                            other !== undefined &&
                                                            other.hasOwnProperty("label") &&
                                                            other.label == "Other"
                                                        ) {
                                                            return (
                                                                <div className="pr-3" key={i}>
                                                                    <textarea
                                                                        className="default-input"
                                                                        name="require_mobility_other"
                                                                        onChange={e =>
                                                                            props.handleChanges(
                                                                                e,
                                                                                "participantAbility"
                                                                            )
                                                                        }
                                                                        value={
                                                                            props.sts.require_mobility_other
                                                                                ? props.sts.require_mobility_other
                                                                                : ""
                                                                        }
                                                                    ></textarea>
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                })
                                                : null}
                                        </span>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                        </span>
                    </div>
                    <div className="w-40-lg col-md-6">
                        <label className="title_input pl-0">
                            Participant Assistance Requirements:{" "}
                        </label>
                        <label
                            htmlFor="require_assistance"
                            className="error CheckieError"
                            style={{ display: "block", width: "100%", marginBottom: "0px" }}
                        ></label>
                           <span className="required">
                        <div className="custom_scroll_set__">
                            <div className=" cstmSCroll1 CrmScroll">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    enableInfiniteScroll={true}
                                    style={{
                                        padding: "0",
                                        height: "auto",
                                        maxHeight: "118px",
                                        minHeight: "118px"
                                    }}
                                >
                                    <div className="row">
                                        <span>
                                            <div className="col-md-12 mb-2">
                                                {props.optsState.assistanceOpts !== undefined &&
                                                    props.optsState.assistanceOpts.length > 0
                                                    ? props.optsState.assistanceOpts.map((val, i) => (
                                                        <span key={i}>
                                                            <div className="col-md-6 mb-2">
                                                                <label className="c-custom-checkbox CH_010">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="checkbox1"
                                                                        id={val.value}
                                                                        name="require_assistance"
                                                                        value={val.value}
                                                                        checked={
                                                                            props.sts.require_assistance !==
                                                                                undefined
                                                                                ? props.sts.require_assistance.indexOf(
                                                                                    val.value
                                                                                ) !== -1
                                                                                    ? true
                                                                                    : false
                                                                                : false
                                                                        }
                                                                        onChange={e =>
                                                                            props.checkboxHandler(
                                                                                e,
                                                                                "participantAbility"
                                                                            )
                                                                        }
                                                                        data-rule-required="true"
                                                                        data-msg-required="Participant ability Assistance is required"
                                                                    />
                                                                    <i className="c-custom-checkbox__img"></i>
                                                                    <div>{val.label}</div>
                                                                </label>
                                                            </div>
                                                        </span>
                                                    ))
                                                    : null}

                                                {props.sts.require_assistance !== undefined &&
                                                    props.sts.require_assistance.length > 0
                                                    ? props.sts.require_assistance.map((val, i) => {
                                                        if (
                                                            props.optsState.assistanceOpts !== undefined &&
                                                            props.optsState.assistanceOpts.length > 0
                                                        ) {
                                                            let other = props.optsState.assistanceOpts.find(
                                                                element => element.value == val
                                                            );
                                                            if (
                                                                other !== undefined &&
                                                                other.hasOwnProperty("label") &&
                                                                other.label == "Other"
                                                            ) {
                                                                return (
                                                                    <div className="pr-3" key={i}>
                                                                        <textarea
                                                                            className="default-input"
                                                                            name="require_assistance_other"
                                                                            onChange={e =>
                                                                                props.handleChanges(
                                                                                    e,
                                                                                    "participantAbility"
                                                                                )
                                                                            }
                                                                            value={
                                                                                props.sts.require_assistance_other
                                                                                    ? props.sts.require_assistance_other
                                                                                    : ""
                                                                            }
                                                                        ></textarea>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                    })
                                                    : null}
                                            </div>
                                        </span>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                        </span>
                    </div>
                </div>

                <div className="row mx-0 py-4">
                    <div className="w-20-lg col-md-3">
                        <label className="title_input pl-0">
                            Is the participant of
              <br /> culturally and linguistically
              <br /> diverse background?:{" "}
                        </label>
                        <div className="row pl-5">
                            <div className="col-md-6">
                                <label className="radio_F1">
                                    Yes
                  <input
                                        type="radio"
                                        name="linguistic_diverse"
                                        value={1}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.linguistic_diverse == 1 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row pl-5">
                            <div className="col-md-6">
                                <label className="radio_F1">
                                    No
                  <input
                                        type="radio"
                                        name="linguistic_diverse"
                                        value={0}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.linguistic_diverse == 0 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="w-20-lg col-md-3">
                        <label className="title_input pl-0 my-4">
                            Language interpreter required ?
            </label>
                        <div className="row pl-5">
                            <div className="col-md-6">
                                <label className="radio_F1">
                                    Yes
                  <input
                                        type="radio"
                                        name="language_interpreter"
                                        value={1}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.language_interpreter == 1 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row pl-5">
                            <div className="col-md-6">
                                <label className="radio_F1">
                                    No
                  <input
                                        type="radio"
                                        name="language_interpreter"
                                        value={0}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.language_interpreter == 0 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {props.sts.language_interpreter == 1 ? (
                        <div className="w-40-lg col-md-6">
                            <label className="title_input pl-0">
                                Participant Language Spoken:{" "}
                            </label>
                            <label
                                htmlFor="languages_spoken"
                                className="error CheckieError"
                                style={{ display: "block", width: "100%", marginBottom: "0px" }}
                            ></label>
                            <div className="custom_scroll_set__ ">
                                <div className=" cstmSCroll1 CrmScroll">
                                    <ScrollArea
                                        speed={0.8}
                                        className="stats_update_list"
                                        contentClassName="content"
                                        horizontal={false}
                                        enableInfiniteScroll={true}
                                        style={{
                                            padding: "0",
                                            height: "auto",
                                            maxHeight: "118px",
                                            minHeight: "118px"
                                        }}
                                    >
                                        <div className="row">
                                            <span>
                                                {props.optsState.languagesOpts !== undefined &&
                                                    props.optsState.languagesOpts.length > 0
                                                    ? props.optsState.languagesOpts.map((val, i) => (
                                                        <span key={i}>
                                                            <div className="col-md-6 mb-2">
                                                                <label className="c-custom-checkbox CH_010">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="checkbox1"
                                                                        id={val.value}
                                                                        name="languages_spoken"
                                                                        value={val.value}
                                                                        checked={
                                                                            props.sts.languages_spoken !== undefined
                                                                                ? props.sts.languages_spoken.indexOf(
                                                                                    val.value
                                                                                ) !== -1
                                                                                    ? true
                                                                                    : false
                                                                                : false
                                                                        }
                                                                        onChange={e =>
                                                                            props.checkboxHandler(
                                                                                e,
                                                                                "participantAbility"
                                                                            )
                                                                        }
                                                                        required={
                                                                            props.sts.language_interpreter == 1
                                                                                ? true
                                                                                : false
                                                                        }
                                                                        data-msg-required="ethnicity is required"
                                                                    />
                                                                    <i className="c-custom-checkbox__img"></i>
                                                                    <div>{val.label}</div>
                                                                </label>
                                                            </div>
                                                        </span>
                                                    ))
                                                    : null}
                                            </span>
                                            {props.sts.languages_spoken !== undefined &&
                                                props.sts.languages_spoken.length > 0
                                                ? props.sts.languages_spoken.map((val, i) => {
                                                    if (
                                                        props.optsState.languagesOpts !== undefined &&
                                                        props.optsState.languagesOpts.length > 0
                                                    ) {
                                                        let other = props.optsState.languagesOpts.find(
                                                            element => element.value == val
                                                        );
                                                        if (
                                                            other !== undefined &&
                                                            other.hasOwnProperty("label") &&
                                                            other.label == "Other"
                                                        ) {
                                                            return (
                                                                <div className="pr-4 col-sm-12" key={i}>
                                                                    <textarea
                                                                        className="default-input"
                                                                        name="languages_spoken_other"
                                                                        onChange={e =>
                                                                            props.handleChanges(
                                                                                e,
                                                                                "participantAbility"
                                                                            )
                                                                        }
                                                                        value={
                                                                            props.sts.languages_spoken_other
                                                                                ? props.sts.languages_spoken_other
                                                                                : ""
                                                                        }
                                                                    ></textarea>
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                })
                                                : null}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    ) : (
                            <React.Fragment />
                        )}
                </div>

                {/* <div className="row bt-1 pt-5 pb-5">
                    <h3>Carers (Members) NOT to Book</h3>


                    <div className="row mt-5">

                        <div className="col-md-2 w-30-lg">
                            <div >
                                <span className={'btn-1'} style={{ 'width': '100px' }}>Male</span>
                                <div className="mt-2">
                                    <label className="c-custom-checkbox CH_010">
                                        <div className="pr-3">Select All Options for Male</div>
                                        <input
                                            type="checkbox"
                                            className="checkbox1"
                                            id={'carer_male'}
                                            name="carer_male"
                                            checked={props.sts.carer_male !== undefined ?
                                                props.sts.carer_male == 1 ? true : false
                                                : false
                                            }
                                            onChange={(e) => props.carerCheckHandler(e, 'participantAbility')}
                                        />
                                        <i className="c-custom-checkbox__img"></i>

                                    </label></div>
                            </div>
                        </div>
                        <div className="col-md-5 w-30-lg">
                            <label className="title_input pl-0">Ethnicity: </label>
                            <label htmlFor="carer_male_ethnicity" className="error CheckieError"
                                style={{ display: "block", width: "100%", marginBottom: '0px' }} ></label>
                            <div className="custom_scroll_set__ required">
                                <div className=" cstmSCroll1 CrmScroll">

                                    <ScrollArea
                                        speed={0.8}
                                        className="stats_update_list"
                                        contentClassName="content"
                                        horizontal={false}
                                        enableInfiniteScroll={true}
                                        style={{ padding: "0", height: 'auto', maxHeight: '118px', minHeight: '118px' }}
                                    >
                                        <div className="row">
                                            <span>

                                                <div className="col-md-12 mb-2">

                                                    {
                                                        props.optsState.ethnicityOpts !== undefined && props.optsState.ethnicityOpts.length > 0 ?
                                                            props.optsState.ethnicityOpts.map((val, i) => (
                                                                <span key={i}>
                                                                    <div className="col-md-6 mb-2">
                                                                        <label className="c-custom-checkbox CH_010">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox1"
                                                                                id={val.value}
                                                                                name="carer_male_ethnicity"
                                                                                value={val.value}
                                                                                checked={
                                                                                    props.sts.carer_male_ethnicity !== undefined ?
                                                                                        props.sts.carer_male_ethnicity.indexOf(val.value) !== -1 ? true : false
                                                                                        : false
                                                                                }
                                                                                onChange={(e) => props.checkboxHandler(e, 'participantAbility')}
                                                                                data-rule-required="true"
                                                                                data-msg-required="ethnicity is required"
                                                                                disabled={props.sts.carer_male !==undefined ?
                                                                                    props.sts.carer_male == 1 ? true:false
                                                                                    :false}
                                                                            />
                                                                            <i className="c-custom-checkbox__img"></i>
                                                                            <div>{val.label}</div>
                                                                        </label>
                                                                    </div>
                                                                </span>
                                                            )) : null
                                                    }


                                                </div>

                                            </span>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5 w-30-lg">
                            <label className="title_input pl-0">Religious Beliefs: </label>
                            <label htmlFor="carer_male_religious_beliefs" className="error CheckieError" style={{ display: "block", width: "100%", marginBottom: '0px' }} ></label>
                            <div className="custom_scroll_set__ required">
                                <div className=" cstmSCroll1 CrmScroll">

                                    <ScrollArea
                                        speed={0.8}
                                        className="stats_update_list"
                                        contentClassName="content"
                                        horizontal={false}
                                        enableInfiniteScroll={true}
                                        style={{ padding: "0", height: 'auto', maxHeight: '118px', minHeight: '118px' }}
                                    >
                                        <div className="row">
                                            <span>

                                                <div className="col-md-12 mb-2">

                                                    {
                                                        props.optsState.religious_beliefs_opts !== undefined && props.optsState.religious_beliefs_opts.length > 0 ?
                                                            props.optsState.religious_beliefs_opts.map((val, i) => (
                                                                <span key={i}>
                                                                    <div className="col-md-6 mb-2">
                                                                        <label className="c-custom-checkbox CH_010">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox1"
                                                                                id={val.value}
                                                                                name="carer_male_religious_beliefs"
                                                                                value={val.value}
                                                                                checked={
                                                                                    props.sts.carer_male_religious_beliefs !== undefined ?
                                                                                        props.sts.carer_male_religious_beliefs.indexOf(val.value) !== -1 ? true : false
                                                                                        : false
                                                                                }
                                                                                onChange={(e) => props.checkboxHandler(e, 'participantAbility')}
                                                                                data-rule-required="true"
                                                                                data-msg-required="religious beliefs is required"
                                                                                disabled={props.sts.carer_male !==undefined ?
                                                                                    props.sts.carer_male == 1 ? true:false
                                                                                    :false}
                                                                            />
                                                                            <i className="c-custom-checkbox__img"></i>
                                                                            <div>{val.label}</div>
                                                                        </label>
                                                                    </div>
                                                                </span>
                                                            )) : null
                                                    }



                                                </div>

                                            </span>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5">

                        <div className="col-md-2 w-30-lg">
                            <div >
                                <span className={'btn-1'} style={{ 'width': '100px' }}>Female</span>
                                <div className="mt-2">
                                    <label className="c-custom-checkbox CH_010">
                                        <div className="pr-3">Select All Options for Female</div>
                                        <input
                                            type="checkbox"
                                            className="checkbox1"
                                            id={'carer_female'}
                                            name="carer_female"
                                            checked={props.sts.carer_female !== undefined ?
                                                props.sts.carer_female == 1 ? true : false
                                                : false
                                            }
                                            onChange={(e) => props.carerCheckHandler(e, 'participantAbility')}
                                        />
                                        <i className="c-custom-checkbox__img"></i>

                                    </label></div>
                            </div>
                        </div>
                        <div className="col-md-5 w-30-lg">
                            <label className="title_input pl-0">Ethnicity: </label>
                            <label htmlFor="carer_female_ethnicity" className="error CheckieError"
                                style={{ display: "block", width: "100%", marginBottom: '0px' }} ></label>
                            <div className="custom_scroll_set__ required">
                                <div className=" cstmSCroll1 CrmScroll">

                                    <ScrollArea
                                        speed={0.8}
                                        className="stats_update_list"
                                        contentClassName="content"
                                        horizontal={false}
                                        enableInfiniteScroll={true}
                                        style={{ padding: "0", height: 'auto', maxHeight: '118px', minHeight: '118px' }}
                                    >
                                        <div className="row">
                                            <span>

                                                <div className="col-md-12 mb-2">

                                                    {
                                                        props.optsState.ethnicityOpts !== undefined && props.optsState.ethnicityOpts.length > 0 ?
                                                            props.optsState.ethnicityOpts.map((val, i) => (
                                                                <span key={i}>
                                                                    <div className="col-md-6 mb-2">
                                                                        <label className="c-custom-checkbox CH_010">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox1"
                                                                                id={val.value}
                                                                                name="carer_female_ethnicity"
                                                                                value={val.value}
                                                                                checked={
                                                                                    props.sts.carer_female_ethnicity !== undefined ?
                                                                                        props.sts.carer_female_ethnicity.indexOf(val.value) !== -1 ? true : false
                                                                                        : false
                                                                                }
                                                                                onChange={(e) => props.checkboxHandler(e, 'participantAbility')}
                                                                                data-rule-required="true"
                                                                                data-msg-required="ethnicity is required"
                                                                                disabled={props.sts.carer_female !==undefined ?
                                                                                    props.sts.carer_female == 1 ? true:false
                                                                                    :false}
                                                                            />
                                                                            <i className="c-custom-checkbox__img"></i>
                                                                            <div>{val.label}</div>
                                                                        </label>
                                                                    </div>
                                                                </span>
                                                            )) : null
                                                    }


                                                </div>

                                            </span>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5 w-30-lg">
                            <label className="title_input pl-0">Religious Beliefs: </label>
                            <label htmlFor="carer_female_religious_beliefs" className="error CheckieError" style={{ display: "block", width: "100%", marginBottom: '0px' }} ></label>
                            <div className="custom_scroll_set__ required">
                                <div className=" cstmSCroll1 CrmScroll ">

                                    <ScrollArea
                                        speed={0.8}
                                        className="stats_update_list"
                                        contentClassName="content"
                                        horizontal={false}
                                        enableInfiniteScroll={true}
                                        style={{ padding: "0", height: 'auto', maxHeight: '118px', minHeight: '118px' }}
                                    >
                                        <div className="row">
                                            <span>

                                                <div className="col-md-12 mb-2">

                                                    {
                                                        props.optsState.religious_beliefs_opts !== undefined && props.optsState.religious_beliefs_opts.length > 0 ?
                                                            props.optsState.religious_beliefs_opts.map((val, i) => (
                                                                <span key={i}>
                                                                    <div className="col-md-6 mb-2">
                                                                        <label className="c-custom-checkbox CH_010">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox1"
                                                                                id={val.value}
                                                                                name="carer_female_religious_beliefs"
                                                                                value={val.value}
                                                                                checked={
                                                                                    props.sts.carer_female_religious_beliefs !== undefined ?
                                                                                        props.sts.carer_female_religious_beliefs.indexOf(val.value) !== -1 ? true : false
                                                                                        : false
                                                                                }
                                                                                disabled={props.sts.carer_female !==undefined ?
                                                                                    props.sts.carer_female == 1 ? true:false
                                                                                    :false}
                                                                                onChange={(e) => props.checkboxHandler(e, 'participantAbility')}
                                                                                data-rule-required="true"
                                                                                data-msg-required="religious beliefs is required"
                                                                            />
                                                                            <i className="c-custom-checkbox__img"></i>
                                                                            <div>{val.label}</div>
                                                                        </label>
                                                                    </div>
                                                                </span>
                                                            )) : null
                                                    }



                                                </div>

                                            </span>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>


                 */}

                <div className="row bt-1 pt-5">
                    <h3>Carers (Members) NOT to Book</h3>

                    <div className="w-30-lg col-md-6 mt-5">
                        <label className="title_input pl-0">Gender: </label>
                        <div className="row pl-5">
                            <div className="col-md-6">
                                <label className="radio_F1">
                                    Male
                  <input
                                        type="radio"
                                        name="carers_gender"
                                        value={1}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.carers_gender == 1 ? true : false}
                                        required={true}
                                        data-msg-required="Carers gender is required"
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row pl-5">
                            <div className="col-md-6">
                                <label className="radio_F1">
                                    Female
                  <input
                                        type="radio"
                                        name="carers_gender"
                                        value={2}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.carers_gender == 2 ? true : false}
                                        required={true}
                                        data-msg-required="Carers gender is required"
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                {/* row ends */}

                <div className="row pt-5 pb-5">
                    <div className="w-30-lg col-md-6 mt-2">
                        <label className="title_input pl-0">Ethnicity: </label>
                        <label
                            htmlFor="ethnicity"
                            className="error CheckieError"
                            style={{ display: "block", width: "100%", marginBottom: "0px" }}
                        ></label>
                        <div className="custom_scroll_set__">
                            <div className=" cstmSCroll1 CrmScroll">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    enableInfiniteScroll={true}
                                    style={{
                                        padding: "0",
                                        height: "auto",
                                        maxHeight: "118px",
                                        minHeight: "118px"
                                    }}
                                >
                                    <div className="row">
                                        <span>
                                            <div className="col-md-12 mb-2">
                                                {props.optsState.ethnicityOpts !== undefined &&
                                                    props.optsState.ethnicityOpts.length > 0
                                                    ? props.optsState.ethnicityOpts.map((val, i) => (
                                                        <span key={i}>
                                                            <div className="col-md-6 mb-2">
                                                                <label className="c-custom-checkbox CH_010">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="checkbox1"
                                                                        id={"ethnicity_" + val.value}
                                                                        name="ethnicity"
                                                                        value={val.value}
                                                                        checked={
                                                                            props.sts.ethnicity !== undefined
                                                                                ? props.sts.ethnicity.indexOf(
                                                                                    val.value
                                                                                ) !== -1
                                                                                    ? true
                                                                                    : false
                                                                                : false
                                                                        }
                                                                        onChange={e =>
                                                                            props.checkboxHandler(
                                                                                e,
                                                                                "participantAbility"
                                                                            )
                                                                        }
                                                                        required={true}
                                                                        data-msg-required="Ethnicity is required"
                                                                    />
                                                                    <i className="c-custom-checkbox__img"></i>
                                                                    <div>{val.label}</div>
                                                                </label>
                                                            </div>
                                                        </span>
                                                    ))
                                                    : null}
                                            </div>
                                        </span>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>

                    <div className="w-30-lg col-md-6 mt-2">
                        <label className="title_input pl-0">Religious Beliefs: </label>
                        <label
                            htmlFor="religious_beliefs"
                            className="error CheckieError"
                            style={{ display: "block", width: "100%", marginBottom: "0px" }}
                        ></label>
                        <div className="custom_scroll_set__">
                            <div className=" cstmSCroll1 CrmScroll">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    enableInfiniteScroll={true}
                                    style={{
                                        padding: "0",
                                        height: "auto",
                                        maxHeight: "118px",
                                        minHeight: "118px"
                                    }}
                                >
                                    <div className="row">
                                        <span>
                                            <div className="col-md-12 mb-2">
                                                {props.optsState.religious_beliefs_opts !== undefined &&
                                                    props.optsState.religious_beliefs_opts.length > 0
                                                    ? props.optsState.religious_beliefs_opts.map(
                                                        (val, i) => (
                                                            <span key={i}>
                                                                <div className="col-md-6 mb-2">
                                                                    <label className="c-custom-checkbox CH_010">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox1"
                                                                            id={"religious_beliefs_" + val.value}
                                                                            name="religious_beliefs"
                                                                            value={val.value}
                                                                            checked={
                                                                                props.sts.religious_beliefs !==
                                                                                    undefined
                                                                                    ? props.sts.religious_beliefs.indexOf(
                                                                                        val.value
                                                                                    ) !== -1
                                                                                        ? true
                                                                                        : false
                                                                                    : false
                                                                            }
                                                                            onChange={e =>
                                                                                props.checkboxHandler(
                                                                                    e,
                                                                                    "participantAbility"
                                                                                )
                                                                            }
                                                                            required={true}
                                                                            data-msg-required="Religious Beliefs is required"
                                                                        />
                                                                        <i className="c-custom-checkbox__img"></i>
                                                                        <div>{val.label}</div>
                                                                    </label>
                                                                </div>
                                                            </span>
                                                        )
                                                    )
                                                    : null}
                                            </div>
                                        </span>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row bt-1 pt-5">
                    <h3>Participant Disability</h3>
                    <div className="w-60-lg col-md-8 mt-5">
                        <label className="title_input pl-0">
                            Fomal Diagnosis (Primary):{" "}
                        </label>
                        <span className="required"></span>
                        <div className="w-100">
                            <textarea
                                className="int_textarea w-100 textarea-max-size"
                                data-msg-required="Participant Fomal Diagnosis (Primary) is required"
                                name="primary_fomal_diagnosis_desc"
                                onChange={e => props.handleChanges(e, "participantAbility")}
                                data-rule-required="true"
                                value={
                                    props.sts.primary_fomal_diagnosis_desc
                                        ? props.sts.primary_fomal_diagnosis_desc
                                        : ""
                                }
                                maxLength="255"
                            ></textarea>
                        </div>
                    </div>
                    <div className="w-60-lg col-md-8  mt-5">
                        <label className="title_input pl-0">
                            Fomal Diagnosis (Secondary):{" "}
                        </label>
                        <div className="w-100">
                            <textarea
                                className="int_textarea w-100 textarea-max-size"
                                name="secondary_fomal_diagnosis_desc"
                                onChange={e => props.handleChanges(e, "participantAbility")}
                                value={
                                    props.sts.secondary_fomal_diagnosis_desc
                                        ? props.sts.secondary_fomal_diagnosis_desc
                                        : ""
                                }
                                maxLength="255"
                            ></textarea>
                        </div>
                    </div>
                    <div className="w-60-lg col-md-8  mt-5">
                        <label className="title_input pl-0">
                            Other Relevant confirmation
            </label>
                        <div className="w-100">
                            <textarea
                                className="int_textarea w-100 textarea-max-size"
                                name="other_relevant_conformation"
                                onChange={e => props.handleChanges(e, "participantAbility")}
                                value={
                                    props.sts.other_relevant_conformation
                                        ? props.sts.other_relevant_conformation
                                        : ""
                                }
                                maxLength="255"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="row py-5">
                    {/* <div className="col-md-6">
            <h3>Relevant Attachments:</h3>
            <div className="row d-flex flex-wrap align-items-center">
                <div className="col-md-8">
                    <ul className="file_down quali_width P_15_TB">
                        <li className="w-50 br_das">
                            <div className="text-right file_D1"><i className="icon icon-close3-ie color"></i></div>
                            <div className="path_file mt-0 mb-4"><b>Hearing Imparement</b></div>
                            <span className="icon icon-file-icons d-block"></span>
                            <div className="path_file">lgHearingHearing2.png</div>
                        </li>
                        <li className="w-50 br_das">
                        <div className="text-right file_D1"><i className="icon icon-close3-ie color"></i></div>
                            <div className="path_file mt-0 mb-4"><b>Formal Diagnosis Doc</b></div>
                            <span className="icon icon-file-icons d-block"></span>
                            <div className="path_file">lgHlgHearing2earing2.png</div>
                        </li>
                    </ul>
                </div>
                    <div className="col-md-4">
                        <a className="v-c-btn1">
                            <span>Browser</span> <i className="icon icon-export1-ie"></i>
                        </a>
                    </div>

                </div>
            </div> */}
                    <div className="w-40-lg col-md-6">
                        <label className="title_input pl-0">
                            Are there any legal issues that may affect services? (eg.
              apprehended violence order):{" "}
                        </label>
                        <div className="row pl-5">
                            <div className="col-md-3">
                                <label className="radio_F1">
                                    Yes
                  <input
                                        type="radio"
                                        name="legal_issues"
                                        value={1}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.legal_issues == 1 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row pl-5">
                            <div className="col-md-3">
                                <label className="radio_F1">
                                    No
                  <input
                                        type="radio"
                                        name="legal_issues"
                                        value={0}
                                        onChange={e => props.handleChanges(e, "participantAbility")}
                                        checked={props.sts.legal_issues == 0 ? true : false}
                                    />
                                    <span className="checkround"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row d-flex justify-content-end">
                    <div className="w-20-lg col-md-3">
                        <a className="btn-1" onClick={props.submitParticipantAbility}>
                            {" "}
                            {props.participant_id != undefined && props.participant_id != ""
                                ? "Save And Update Participant"
                                : "Save And Continue"}
                        </a>
                    </div>
                </div>
            </form>
        </React.Fragment>
    );
};
