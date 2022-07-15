import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { confirmWith, confirmBy } from "dropdown/ScheduleDropdown.js";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import { postData, handleChangeChkboxInput, handleChangeSelectDatepicker, handleAddShareholder, handleRemoveShareholder, handleShareholderNameChange, toastMessageShow, handleChange, googleAddressFill, calculateGst } from "service/common.js";
import jQuery from "jquery";
import moment from "moment";
import { connect } from "react-redux";
import _ from "lodash";
import AdressComponent from "./AdressComponent";
import ShiftRequirementCheckbox from "./ShiftRequirementCheckbox";
import LineItemAssignComponent from "./LineItemAssignComponent";
import StartEndTimeComponent from "./StartEndTimeComponent";
import { onChange, getRosterShiftOption, setRosterList, updatePlanLineItemFund } from './../actions/CreateRosterAction';
import { SHIFT_MAX_DURATION_HOURS } from 'config.js';
import { getTimeDifferInHours } from './CommonFunction.js';

const getOptionsMember = (e, otherData) => {
  if (!e) {
    return Promise.resolve({ options: [] });
  }
  let extraParm = Object.assign({}, otherData);
  
  extraParm['selectedLineItemList'] = Object.values(extraParm.selected_line_item_id_with_data);
  
  return postData('schedule/ScheduleRoster/get_manual_member_look_up_for_create_roster', { search: e, extraParm: extraParm }).then((result) => {
    if (result.status) {
      return { options: result.data };
    }
  });
}

class CreateShift extends Component {
    constructor(props) {
        super(props);
        this.active = this.props.active;

        this.state = {
            week: [{ value: 0, label: 1 }, { value: 1, label: 2 }, { value: 2, label: 3 }, { value: 3, label: 4 }],
            active_week: 0,
            loading: false,
            is_save: false,
            booking_list: false,
            completeAddress: [{ address: "", suburb: "", state: "", postal: "" }],
            preferred_member_ary: [{ name: "" }],
            stateList: [],
            autocompleteData: [],
            bookingList: [],
            confirm_with: 1,
            confirm_by: 1,
            allocate_pre_member: 2,
            autofill_shift: 2,
            push_to_app: 2,
            booking_method: 1,
            time_of_days: [{}],
            lineItemList: [],
            assistance: [],
            mobility: [],
            selected_line_item_id_with_data: {},
            funding_type: 1,
            booked_by: 2,
            participantAutoAddress: [],
        };

        this.shift_cost = 0;
        this.lineItemComRef = React.createRef();
        this.roster_det = {}
    }

    fetchDataLineItem = (statusClear) => {
        if (this.refs.lineItemComRef) {

            var status = this.refs.lineItemComRef.getWrappedInstance().checkRequiredParamterForGetLineItem();
            let dataSelected = Object.assign({}, this.state.selected_line_item_id_with_data);

            if (statusClear == true) {
                dataSelected = {};
            }

            if (status) {
                this.setState({ selected_line_item_id_with_data: dataSelected, userId: this.props.participantId, ...this.props.props.location.state, start_date: this.props.start_date, end_date: this.props.end_date, is_default: this.props.is_default}, () => {
                    postData("schedule/ScheduleRoster/get_participant_specific_plan_line_item", this.state).then(result => {
                        if (result.status) {
                            let linItmeData = result.data.lineItemList;
                            let newSelectedLineItem={};
                            linItmeData = linItmeData.length > 0 ? linItmeData.map((val, index) => {
                                if (this.state.selected_line_item_id_with_data[val.line_itemId]) {
                                    val["checked"] = true;
                                    newSelectedLineItem[val.line_itemId] = val;
                                } else {
                                    val["checked"] = false;
                                }
                                return val;
                            }) : linItmeData;
                            result.data["lineItemList"] = linItmeData;
                            this.setState(result.data,()=>{
                                this.setState({selected_line_item_id_with_data:newSelectedLineItem});
                            });
                            if (result.data.its_public_holiday && !this.state.public_holiday_warning_show_done) {
                                toastMessageShow("You are booking a shift on public holiday.", "i");
                                this.setState({ public_holiday_warning_show_done: true });
                            }
                        }
                    });
                });
            } else {
                this.setState({ selected_line_item_id_with_data: dataSelected });
            }
        }
    };

    componentDidMount() {
        let time_of_days = JSON.parse(JSON.stringify(this.props.time_of_days));
        let assistance = JSON.parse(JSON.stringify(this.props.assistance));
        let mobility = JSON.parse(JSON.stringify(this.props.mobility));

        this.setState({ time_of_days: time_of_days, assistance: assistance, mobility: mobility });
        this.openInEditModeShift();
        
    }

    checkDateTimeAlreadyExist = () => {
        var List = this.props.rosterList;
        var status1 = false, status2 = false, status3 = false, status4 = false;
        
        List[this.roster_det.main_index][this.roster_det.day].map((val, id) => {
            if (!status1 && !status2 && !status3 && !status4 && val.start_time && val.end_time && this.roster_det.index !== id) {
                status1 = moment(this.state.start_time).isBetween(moment(val.start_time), moment(val.end_time, null, '[]'));
                status2 = moment(this.state.end_time).isBetween(moment(val.start_time), moment(val.end_time), null, '[]');
                status3 = moment(val.start_time).isBetween(moment(this.state.start_time), moment(this.state.end_time), null, '[]');
                status4 = moment(val.end_time).isBetween(moment(this.state.start_time), moment(this.state.end_time), null, '[]');
            }
        });

        if (!status1 && !status2 && !status3 && !status4) {
            return true;
        } else {
            return false;
        }
    }

    onChange = e => {
        var state = {};
        state[e.target.name] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        this.setState(state);
    };

    selectChange = (value, key) => {
        var state = {};
        state[key] = value;
        this.setState(state);
    };

    selectTime = (value, key) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            if (this.state.start_time && this.state.end_time) {
                let start_time = parseInt(moment(this.state.start_time).format("H"));
                let end_time = parseInt(moment(this.state.end_time).format("H"));
                let List = [...this.state.time_of_days];

                let Lists = List.map((val, index) => {
                    if (val.key_name !== 'transferred' && val.key_name !== 'eco') {
                        val.checked = false;
                    }
                    return val;
                });

                if ((start_time >= 0 && start_time <= 6) || (end_time >= 0 && end_time <= 6)) {
                    let Lists = List.map((val, index) => {
                        if (val.key_name === 's_o') {
                            val.checked = true;
                        }
                        return val;
                    });
                } if ((start_time >= 6 && start_time <= 20) || (end_time >= 6 && end_time <= 20) || (start_time <= 6 && end_time >= 20)) {
                    let Lists = List.map((val, index) => {
                        if (val.key_name === 'daytime') {
                            val.checked = true;
                        }
                        return val;
                    });
                } if ((start_time >= 20 && start_time <= 24) || (end_time >= 20 && end_time <= 24)) {
                    let Lists = List.map((val, index) => {
                        if (val.key_name === 'evening') {
                            val.checked = true;
                        }
                        return val;
                    });
                }
                this.setState({ time_of_days: [...Lists] });
                this.fetchDataLineItem(false);
            }
        });
    }

    handleAddShareholder = (e, tagType, object_array) => {
        handleAddShareholder(this, e, tagType, object_array);
    };

    handleRemoveShareholder = (e, idx, tagType) => {
        handleRemoveShareholder(this, e, idx, tagType);
    };

    handleShareholderNameChange = (idx, fieldName, value) => {
        handleShareholderNameChange(this, "completeAddress", idx, fieldName, value);
        if (fieldName == "state") {
            this.fetchDataLineItem();
            this.setState({ public_holiday_warning_show_done: false });
        }
    };

    setcheckbox = (idx, checked, tagType) => {
        let List = [...this.state[tagType]];
        let state = {};

        if (!List[idx].checked || List[idx].checked == undefined) {
            if (List[idx].key_name == "a_o") {
                var ind = List.findIndex(x => x.key_name == "s_o");
                List[ind].checked = false
            }
            if (List[idx].key_name == "s_o") {
                var ind = List.findIndex(x => x.key_name == "a_o");
                List[ind].checked = false
            }
            List[idx].checked = true;
        } else {
            List[idx].checked = false;
        }

        state[tagType] = List;

        this.setState(state, () => {
            if (tagType == "time_of_days") {
                this.fetchDataLineItem(true);

                if (_.toLower(List[idx]['key_name']) == "transferred") {
                    let addressData = [...this.state.completeAddress];
                    if (List[idx].checked == false) {
                        addressData = _.take(addressData);
                        this.setState({ completeAddress: addressData });
                    }
                }
            }

            if (tagType == "lineItemList") {
                let selectedList = Object.assign({}, this.state.selected_line_item_id_with_data);
                if (selectedList[List[idx]["line_itemId"]]) {
                    delete selectedList[List[idx]["line_itemId"]];
                } else {
                    selectedList[List[idx]["line_itemId"]] = List[idx];
                }
                this.setState({ selected_line_item_id_with_data: selectedList });
            }
        });
    };

    removeSelectedLineItem = id => {
        let selectedList = Object.assign({}, this.state.selected_line_item_id_with_data);
        let listData = [...this.state.lineItemList];
        if (selectedList[id]) {
            delete selectedList[id];
            let ind = _.findIndex(listData, { line_itemId: id });
            if (ind > -1 && listData[ind]["checked"]) {
                listData[ind]["checked"] = false;
            }
        }

        this.setState({
            selected_line_item_id_with_data: selectedList,
            lineItemList: listData
        });
    };

    checkListItem = () => {
        let listData = [...this.state.lineItemList];
        let listDataloop = listData.map((val, index) => {
            if (this.state.selected_line_item_id_with_data[val.line_itemId] && !val.checked) {
                val.checked = true;
            } else if (!this.state.selected_line_item_id_with_data[val.line_itemId] && val.checked) {
                val.checked = false;
            }
        });

        this.setState({ lineItemList: listDataloop });
    };

    handleCreateShift = (e, shift_status) => {
        if (e) e.preventDefault();

        var validator = jQuery("#create_shift_form").validate({ ignore: [] });

        if (jQuery("#create_shift_form").valid()) {
            var difference = getTimeDifferInHours(this.state.start_time, this.state.end_time);
            if (difference > SHIFT_MAX_DURATION_HOURS) {
                toastMessageShow("Shift duration can maximum " + SHIFT_MAX_DURATION_HOURS + " hours.", "e");
                return false;
            } else if (difference < 0) {
                toastMessageShow("Please check start date time and end date time.", "e");
                return false;
            }

            var select_line_item = false;
            if (this.state.lineItemList.length === 0) {
                toastMessageShow("We are unable to add shift because user don't have line item for criteria.", "e");
                return false;
            } else {
                this.state.lineItemList.map((val, index) => {
                    if (val.checked) {
                        select_line_item = true;
                    }
                })
            }

            if (!select_line_item) {
                toastMessageShow("Please select line item to add shift in roster.", "e");
                return false;
            }

            var already_exist = this.checkDateTimeAlreadyExist();

            if (!already_exist) {
                toastMessageShow("Selected start and end time overide your previous selected time on this day.", "e");
                return false;
            }

            var in_funding = true;
            var List = JSON.parse(JSON.stringify(this.props.rosterList));
            let plan_line_item = JSON.parse(JSON.stringify(this.props.plan_line_item));
            var qty = getTimeDifferInHours(this.state.start_time, this.state.end_time);
            var selected_line_item_id_with_data = {...this.state.selected_line_item_id_with_data};
            
            if(List[this.roster_det.main_index][this.roster_det.day][this.roster_det.index]['is_active']){
                let shift_details = List[this.roster_det.main_index][this.roster_det.day][this.roster_det.index];
                if (Object.keys(shift_details.selected_line_item_id_with_data).length > 0) {
                    Object.keys(shift_details.selected_line_item_id_with_data).map((val, index) => {

                        if(shift_details.selected_line_item_id_with_data[val]['existing_shift']){
                            var shift_item_cost = shift_details.selected_line_item_id_with_data[val]["existing_shift_used_amount"];
                            List[this.roster_det.main_index][this.roster_det.day][this.roster_det.index]['selected_line_item_id_with_data'][val]['existing_shift'] = false;
                        }else{
                            var shift_item_cost = shift_details.selected_line_item_id_with_data[val]["will_use_fund"];
                        }
                        let plan_line_itemId = shift_details.selected_line_item_id_with_data[val]["plan_line_itemId"]

                        let have_fund = parseFloat(plan_line_item[plan_line_itemId]['have_fund']);
                        let current_used = parseFloat(plan_line_item[plan_line_itemId]['current_used']);

                        let new_have_fund = (have_fund + shift_item_cost);
                        let new_current_used = (current_used - shift_item_cost);

                        plan_line_item[plan_line_itemId]['have_fund'] = new_have_fund;
                        plan_line_item[plan_line_itemId]['current_used'] = new_current_used;
                    });
                }
            }
            
            if (Object.keys(selected_line_item_id_with_data).length > 0) {
                Object.keys(selected_line_item_id_with_data).map((val, index) => {

                    var shift_item_cost = selected_line_item_id_with_data[val]["cost"] * qty;
                    shift_item_cost += calculateGst(shift_item_cost);
                    
                    var plan_line_itemId = selected_line_item_id_with_data[val]["plan_line_itemId"];

                    selected_line_item_id_with_data[val]["will_use_fund"] = shift_item_cost;
                    
                    var have_fund = parseFloat(plan_line_item[plan_line_itemId]['have_fund']);
                    var current_used = parseFloat(plan_line_item[plan_line_itemId]['current_used']);

                    have_fund = (have_fund - shift_item_cost);
                    current_used = (current_used + shift_item_cost);
                    plan_line_item[plan_line_itemId]['have_fund'] = have_fund;
                    plan_line_item[plan_line_itemId]['current_used'] = current_used;

                    if (have_fund < 0) {
                        in_funding = false;
                    }
                });
            }
           
            this.setState({selected_line_item_id_with_data: selected_line_item_id_with_data}, () => {
              
                var updated_shift = false;
                if(List[this.roster_det.main_index][this.roster_det.day][this.roster_det.index]['roster_shiftId']){
                    updated_shift = true;
                }

                List[this.roster_det.main_index][this.roster_det.day][this.roster_det.index] = { is_active: true, ...this.state, in_funding: in_funding, updated_shift: updated_shift };
                List[this.roster_det.main_index][this.roster_det.day][++this.roster_det.index] = { is_active: false };
                
                if(in_funding){
                    this.props.updatePlanLineItemFund(plan_line_item);
                }
                 
                this.props.setRosterList(List);
                this.setState({ redirect_roster: true });
            })
        } else {
            validator.focusInvalid();
        }
    };

    selectConfirmWith = (val, key) => {
        var state = {};
        state[key] = val;
        this.setState(state);

        var blankDetails = {
            confirm_userId: "",  
            firstname: "",
            lastname: "",
            phone: "",
            email: "",
            disable_confirmer: false
        };
        this.selectConfirmerShift(blankDetails);
    };

    googleAddressFill = (idx, main_state_key, state_key, place) => {
        googleAddressFill(this, idx, main_state_key, state_key, place, this.props.stateList).then(res => {
            if (res.status) {
                this.fetchDataLineItem(true);
            }
        });
    };

    selectConfirmerShift = value => {
        var state = {};
        state["confirmPerson"] = value;
        state["confirm_userId"] = value.value;
        state["disable_confirmer"] = value.firstname ? true : false;
        state["confirm_with_f_name"] = value.firstname;
        state["confirm_with_l_name"] = value.lastname;
        state["confirm_with_mobile"] = value.phone;
        state["confirm_with_email"] = value.email;
        state["confirm_by"] = 1;
        this.setState(state);
    };

    handleChangeProps = (e, state_key, type) => {
        if (type == "selectBox") {
            let callData = handleChangeSelectDatepicker(this, e, state_key);

        } else if (type == "inputBox") {
            handleChangeChkboxInput(this, e);
        } else if (type == "filterTable") {
            this.fetchDataLineItem(false);
        }
    };

    handleChangePropsParticipaintAddress = (e, index) => {
        let participant_address = Object.assign({}, this.props.participant_address);

        let addressData = _.find(participant_address, { value: e });
        let addressDataOption = {};
        if (e > 0) {
            addressDataOption['selected_pre_filled_address'] = e;
            addressDataOption['street'] = addressData.street;
            addressDataOption['suburb'] = addressData.suburb;
            addressDataOption['state'] = addressData.state;
            addressDataOption['postal'] = addressData.postal;
        } else {
            addressDataOption = { selected_pre_filled_address: "", address: "", suburb: "", state: "", postal: "" };
        }
        let completeAddressData = [...this.state.completeAddress];
        completeAddressData[index] = addressDataOption;
        this.setState({ completeAddress: completeAddressData }, () => {
            this.fetchDataLineItem(true);
        });
    };

    selectParticipantAddressListOption = (index) => {

        let selectedfromOption = _.map(_.values(this.state.selectedParticipantAutoAddress), 'id');
        let selectOption = _.map(this.state.participantAutoAddress, row => {
            return { ...row, disabled: _.includes(selectedfromOption, row.value) ? true : false };
        });
        return selectOption;
    };

    makeCopyOptionOShift = (week) => {
        var rosterList = JSON.parse(JSON.stringify(this.props.rosterList));
        var autofillShiftOption = [];

        var i = 0;

        Object.keys(rosterList[week]).forEach((key) => {
            var temp = [];
            rosterList[week][key].map((val, index) => {
                if (val.is_active) {
                    temp[index] = {label: moment(val.start_time).format("HH:mm") + " - " + moment(val.end_time).format("HH:mm"), value: { index: index, day: key, main_index: week }};
                }
            });

            if (temp.length > 0) {
                autofillShiftOption[i] = {label: this.props.week_mapping[key], options: temp};
                i++;
            }

        })
        return autofillShiftOption;
    }
    
    openInEditModeShift = () => {
        let value = this.props.props.location.state;
        var List = JSON.parse(JSON.stringify(this.props.rosterList));
            if(List[value.main_index][value.day][value.index]['is_active']){
            var shift_data = {...List[value.main_index][value.day][value.index], ...this.roster_det};

            this.setState(shift_data, () => {
                if(this.state.lineItemList.length === 0){
                    this.fetchDataLineItem(false);
                }
            });
        }
    }

    copyShiftToCurrentSlab = (value) => {
        var List = JSON.parse(JSON.stringify(this.props.rosterList));
        var shift_data = {...List[value.main_index][value.day][value.index], ...this.roster_det, roster_shiftId: undefined, preferred_member_ary : [{ name: "" }]};
        
        this.setState(shift_data, () => {
            this.fetchDataLineItem(false);
//            if(this.state.lineItemList.length === 0){
//                
//            }
        });
    }

    render() {
        var disabled_assign_preferred_member = true;
        if (this.state.preferred_member_ary.length > 0) {
            disabled_assign_preferred_member = this.state.preferred_member_ary[0]["name"] ? false : true;
        }

        var qty = getTimeDifferInHours(this.state.start_time, this.state.end_time);
        var shift_cost = 0;
        if (Object.keys(this.state.selected_line_item_id_with_data).length > 0) {
            Object.keys(this.state.selected_line_item_id_with_data).map(
                (val, index) => {
                    shift_cost += this.state.selected_line_item_id_with_data[val]["cost"] * qty;
                }
            );
        }

        this.shift_cost = shift_cost;
        let confirmWithCall = confirmWith(0);

        this.roster_det = this.props.props.location.state;

        if (!this.roster_det.day || (this.roster_det.index === undefined) || (this.roster_det.main_index === undefined) || !this.props.participantId) {
            return <Redirect to={"/admin/schedule/create_roster"} />;
        }
        
        if (this.state.redirect_roster) {
            let pathname = (this.props.rosterId)? "/admin/schedule/roster_details/"+this.props.rosterId : "/admin/schedule/create_roster";
            return <Redirect to={{ pathname: pathname, state: {come_from_add_shift: true}}} />;
        }

        return (
            <React.Fragment>
                <React.Fragment>
                    <form id="create_shift_form" method="post">
                        <div className="row  _Common_back_a">
                            <div className="col-lg-12 col-sm-12">
                                <a className="d-inline-flex" onClick={() => this.setState({redirect_roster: true})}>
                                    <div className="icon icon-back-arrow back_arrow"></div>
                                </a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-sm-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>

                        <div className="row _Common_He_a">
                            <div className="col-lg-12 col-sm-12">
                                <h1 className={"color"}>Add Shift To Roster:</h1>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 col-sm-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>

                        <React.Fragment>
                            <div className="row">
                                <div className="col-lg-12 col-md-12 mt-5">
                                    <div className="pAY_heading_01 by-1">
                                        <div className="tXT_01"> Select Pre-fill Data:</div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-5 px-5 py-5">
                                    <div className="f-14 color">
                                        To save time you have the option of copying information
                                        from another shift in this roster. Use the filters on the right
                                        to select a shift and the date from that shift will populate the form below.
                                    </div>
                                </div>
                                <div className="col-lg-7 px-5 py-5">
                                    <div className="row mb-4">
                                        <div className="col-lg-12">
                                            <label className="label_2_1_1 f-bold">The Shift to copy is in</label>
                                            <div className="">
                                                {this.state.week.map((val, index) => (
                                                    <button key={index+1} onClick={(e) => { e.preventDefault(); this.setState({ active_week: val.value }) }} disabled={this.props.rosterList[val.value] ? false : true}
                                                        className={"button_set0 w-20 mr-3" + (this.state.active_week == val.value ? " active" : "")}>Week {val.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-4">
                                            <label className="label_2_1_1 f-bold">Shift to duplicate:</label>
                                            <span className="required">
                                                <div className="sLT_gray left left-aRRow week_shifts_show_select">
                                                    <Select
                                                        name="booked_by"
                                                        required={true}
                                                        simpleValue={true}
                                                        searchable={false}
                                                        clearable={false}
                                                        value={this.state.copied_shift || ""}
                                                        onChange={this.copyShiftToCurrentSlab}
                                                        options={this.makeCopyOptionOShift(this.state.active_week)}
                                                        placeholder="Week "
                                                    />
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>

                        <React.Fragment>
                            <div className="pAY_heading_01 by-1">
                                <div className="tXT_01"> Shift Details</div>
                            </div>

                            <StartEndTimeComponent
                                {...this.state}
                                onChange={this.onChange}
                                selectTime={this.selectTime}
                                setcheckbox={this.setcheckbox}
                            />

                            <AdressComponent
                                {...this.state}
                                handleShareholderNameChange={this.handleShareholderNameChange}
                                selectParticipantAddressListOption={this.selectParticipantAddressListOption}
                                handleChangePropsParticipaintAddress={this.handleChangePropsParticipaintAddress}
                                handleAddShareholder={this.handleAddShareholder}
                                handleRemoveShareholder={this.handleRemoveShareholder}
                                googleAddressFill={this.googleAddressFill}
                            />
                        </React.Fragment>

                        <React.Fragment>
                            <div className="row">
                                <div className="col-lg-12 col-md-12 mt-5">
                                    <div className="pAY_heading_01 by-1">
                                        <div className="tXT_01">Shift Requirements</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row P_25_TB">
                                <React.Fragment>
                                    <ShiftRequirementCheckbox
                                        checkBoxArray={this.state.mobility}
                                        setcheckbox={this.setcheckbox}
                                        stateName={"mobility"}
                                        title="Mobility Requirement"
                                    />
                                    <ShiftRequirementCheckbox
                                        checkBoxArray={this.state.assistance}
                                        setcheckbox={this.setcheckbox}
                                        stateName={"assistance"}
                                        title="Assistance Requirement"
                                    />
                                </React.Fragment>
                            </div>

                            <LineItemAssignComponent
                                {...this.state}
                                lineItemList={this.state.lineItemList}
                                fetchDataLineItem={this.fetchDataLineItem}
                                ref="lineItemComRef"
                                setcheckbox={this.setcheckbox}
                                removeSelectedLineItem={this.removeSelectedLineItem}
                                handleChangeProps={this.handleChangeProps}
                            />
                        </React.Fragment>

                        <div className="row">
                            <div className="col-lg-12 col-md-12 mt-5">
                                <div className="pAY_heading_01 by-1">
                                    <div className="tXT_01"> Confirmation Details:</div>
                                </div>
                            </div>
                        </div>
                        <div className="row P_25_TB">
                            <div className="w-20-lg col-lg-2  col-md-3 col-xs-12">
                                <label className="label_2_1_1 f-bold">Confirm With:</label>
                                <span className="required">
                                    <Select
                                        name="confirm_with"
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        value={this.state.confirm_with}
                                        onChange={e => this.selectConfirmWith(e, "confirm_with")}
                                        options={confirmWithCall}
                                        placeholder="Please select"
                                    />
                                </span>
                            </div>

                            {this.state.confirm_with == 1 ?
                                <div className="w-20-lg col-lg-2 col-md-3 col-xs-12">
                                    <label className="label_2_1_1 f-bold">Booker List</label>
                                    <span className="required">
                                        <Select
                                            required={true}
                                            searchable={false}
                                            clearable={false}
                                            value={this.state.confirmPerson}
                                            onChange={e => this.selectConfirmerShift(e, "confirmPerson")}
                                            options={this.props.booker_list}
                                            placeholder="Please select"
                                        />
                                    </span>
                                </div> : ""
                            }
                        </div>

                        <div className="row P_25_b">
                            <div className="w-20-lg col-lg-2 col-md-3  col-xs-12">
                                <label className="label_2_1_1 f-bold">First Name:</label>
                                <span className="required">
                                    <input
                                        placeholder="First"
                                        type="text"
                                        name="confirm_with_f_name"
                                        data-rule-required="true"
                                        disabled={this.state.disable_confirmer}
                                        value={this.state.confirm_with_f_name || ""}
                                        onChange={e => handleChangeChkboxInput(this, e)}
                                    />
                                </span>
                            </div>
                            <div className="w-20-lg col-lg-2 col-md-3 col-xs-12">
                                <label className="label_2_1_1 f-bold">Last Name</label>
                                <span className="required">
                                    <input
                                        placeholder="Last"
                                        type="text"
                                        name="confirm_with_l_name"
                                        data-rule-required="true"
                                        disabled={this.state.disable_confirmer}
                                        value={this.state.confirm_with_l_name || ""}
                                        onChange={e => handleChangeChkboxInput(this, e)}
                                    />
                                </span>
                            </div>
                            <div className="w-20-lg col-lg-2 col-md-3 col-xs-12">
                                <label className="label_2_1_1 f-bold">Mobile:</label>
                                <span className="required">
                                    <input
                                        placeholder="0000 000 000"
                                        type="text"
                                        name="confirm_with_mobile"
                                        data-rule-required="true"
                                        disabled={this.state.disable_confirmer}
                                        value={this.state.confirm_with_mobile || ""}
                                        onChange={e => handleChangeChkboxInput(this, e)}
                                        data-rule-phonenumber
                                    />
                                </span>
                            </div>
                            <div className="w-20-lg col-lg-2 col-md-3 col-xs-12">
                                <label className="label_2_1_1 f-bold">Email:</label>
                                <span className="required">
                                    <input
                                        placeholder="example@example.com.au"
                                        type="text"
                                        name="confirm_with_email"
                                        data-rule-required="true"
                                        disabled={this.state.disable_confirmer}
                                        value={this.state.confirm_with_email || ""}
                                        onChange={e => handleChangeChkboxInput(this, e)}
                                    />
                                </span>
                            </div>

                            <div className="w-20-lg col-lg-2 col-md-3 col-xs-12">
                                <label className="label_2_1_1 f-bold">Confirm By:</label>
                                <span className="required">
                                    <Select
                                        name="confirm_by"
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        value={this.state.confirm_by || 1}
                                        onChange={e => handleChangeSelectDatepicker(this, e, "confirm_by")}
                                        options={confirmBy(0)}
                                        placeholder="Please select"
                                    />
                                </span>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 col-md-12 mt-5">
                                <div className="pAY_heading_01 by-1">
                                    <div className="tXT_01"> Misc:</div>
                                </div>
                            </div>
                        </div>

                        <div className="row P_25_T">
                            <div className="w-40-lg col-lg-5  col-md-5 col-xs-12">
                                {this.state.preferred_member_ary.map((value, idx) => (
                                    <div key={idx}>
                                        <label className="label_2_1_1 f-bold">Site Preferred Member:</label>
                                        <div className="search_icons_right modify_select">
                                            <Select.Async
                                                cache={false}
                                                name="form-field-name"
                                                value={value.name}
                                                loadOptions={e => getOptionsMember(e, {...this.state, start_date: this.props.start_date, end_date: this.props.end_date, is_default: this.props.is_default})}
                                                placeholder="Search"
                                                onChange={e => handleShareholderNameChange(this, "preferred_member_ary", idx, "name", e)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="Time_line_lables d-flex justify-content-between flex-wrap mb-4 pt-4">
                                    <label className="label_2_1_1">Allocate Pref Member(s):</label>
                                    <div className="d-inline-flex">
                                        <div className="label_2_1_2">
                                            <label className="radio_F1 c_black mb-0">
                                                <input
                                                    type="radio"
                                                    disabled={this.state.push_to_app == 1 || this.state.autofill_shift == 1 || disabled_assign_preferred_member ? true : false}
                                                    name="allocate_pre_member"
                                                    onChange={e => handleChange(this, e)}
                                                    checked={this.state.allocate_pre_member == 1 ? true : false}
                                                    value="1"
                                                />
                                                <span className="checkround"></span>
                                                <span className="txtcheck ">Yes</span>
                                            </label>
                                        </div>
                                        <div className="label_2_1_3">
                                            <label className="radio_F1 c_black mb-0">
                                                <input
                                                    type="radio"
                                                    name="price_control"
                                                    disabled={this.state.push_to_app == 1 || this.state.autofill_shift == 1 || disabled_assign_preferred_member ? true : false}
                                                    name="allocate_pre_member"
                                                    onChange={e => handleChange(this, e)}
                                                    checked={this.state.allocate_pre_member == 2 ? true : false}
                                                    value="2"
                                                />
                                                <span className="checkround"></span>
                                                <span className="txtcheck ">No</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="Time_line_lables d-flex justify-content-between flex-wrap mb-4">
                                    <label className="label_2_1_1">Autofill Shift </label>
                                    <div className="d-inline-flex">
                                        <div className="label_2_1_2">
                                            <label className="radio_F1  c_black mb-0">
                                                <input
                                                    type="radio"
                                                    name="autofill_shift"
                                                    disabled={this.state.push_to_app == 1 || this.state.allocate_pre_member == 1 ? true : false}
                                                    required={true}
                                                    name="autofill_shift"
                                                    onChange={e => handleChange(this, e)}
                                                    checked={this.state.autofill_shift == 1 ? true : false}
                                                    value="1"
                                                />
                                                <span className="checkround"></span>
                                                <span className="txtcheck ">Yes</span>
                                            </label>
                                        </div>
                                        <div className="label_2_1_3">
                                            <label className="radio_F1  c_black mb-0">
                                                <input
                                                    type="radio"
                                                    disabled={this.state.push_to_app == 1 || this.state.allocate_pre_member == 1 ? true : false}
                                                    required={true}
                                                    name="autofill_shift"
                                                    onChange={e => handleChange(this, e)}
                                                    checked={this.state.autofill_shift == 2 ? true : false}
                                                    value="2"
                                                />
                                                <span className="checkround"></span>
                                                <span className="txtcheck ">No</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="Time_line_lables d-flex justify-content-between flex-wrap mb-4">
                                    <label className="label_2_1_1">Push to App:</label>
                                    <div className="d-inline-flex">
                                        <div className="label_2_1_2">
                                            <label className="radio_F1  c_black mb-0">
                                                <input
                                                    type="radio"
                                                    disabled={this.state.allocate_pre_member == 1 || this.state.autofill_shift == 1 ? true : false}
                                                    required={true}
                                                    name="push_to_app"
                                                    onChange={e => handleChange(this, e)}
                                                    checked={this.state.push_to_app == 1 ? true : false}
                                                    value="1"
                                                />
                                                <span className="checkround"></span>
                                                <span className="txtcheck ">Yes</span>
                                            </label>
                                        </div>
                                        <div className="label_2_1_3">
                                            <label className="radio_F1  c_black mb-0">
                                                <input
                                                    type="radio"
                                                    disabled={this.state.allocate_pre_member == 1 || this.state.autofill_shift == 1 ? true : false}
                                                    required={true}
                                                    name="push_to_app"
                                                    onChange={e => handleChange(this, e)}
                                                    checked={this.state.push_to_app == 2 ? true : false}
                                                    value="2"
                                                />
                                                <span className="checkround"></span>
                                                <span className="txtcheck ">No</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-40-lg  col-lg-4 col-md-4  col-xs-12 col-lg-offset-1">
                                <label className="label_2_1_1 f-bold">Shift Notes:</label>
                                <textarea
                                    className="notes_txt_area textarea-max-size w-100"
                                    name="shift_note"
                                    required={true}
                                    maxLength={500}
                                    value={this.state.shift_note || ""}
                                    onChange={e => handleChange(this, e)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 col-md-12 mt-5">
                                <div className="pAY_heading_01 by-1">
                                    <div className="tXT_01"> Quote or Create:</div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xs-12">
                                <div className="AUD  P_25_TB bb-1">
                                    <h3 className="mb-2">Shift Value</h3>
                                    <label className="mb-0">
                                        ${this.shift_cost} <small>(AUD)</small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="row after_before_remove P_25_T d-flex flex-wrap justify-content-end">
                            <div className="w-20-lg col-lg-3 col-md-3 col-xs-12">
                                <div className="button_set0 text-center w-100" onClick={() => this.setState({redirect_roster: true})}>Cancel</div>
                            </div>
                            <div className="w-20-lg col-lg-3 col-md-3 col-xs-12">

                                <div className="but_submit text-center" onClick={e => this.handleCreateShift(e, 1)}>{this.state.roster_shiftId? "Update": "Add"} shift to roster</div>
                            </div>
                        </div>
                    </form>
                </React.Fragment>
            </React.Fragment>
        );
    }
}


const mapStateToProps = state => ({
    stateList: state.CreateRosterReducer.stateList,
    time_of_days: state.CreateRosterReducer.time_of_days,
    participant_address: state.CreateRosterReducer.participant_address,
    assistance: state.CreateRosterReducer.assistance,
    booker_list: state.CreateRosterReducer.booker_list,
    mobility: state.CreateRosterReducer.mobility,
    booker_list: state.CreateRosterReducer.booker_list,
    participantId: state.CreateRosterReducer.participant.value,
    rosterList: state.CreateRosterReducer.rosterList,
    week_mapping: state.CreateRosterReducer.week_mapping,
    plan_line_item: state.CreateRosterReducer.plan_line_item,
    rosterId: state.CreateRosterReducer.rosterId,
    start_date: state.CreateRosterReducer.start_date,
    end_date: state.CreateRosterReducer.end_date,
    is_default: state.CreateRosterReducer.is_default,
});

const mapDispatchtoProps = dispach => {
    return {
        getRosterShiftOption: (key, value) => dispach(getRosterShiftOption()),
        setRosterList: (data) => dispach(setRosterList(data)),
        updatePlanLineItemFund: (data) => dispach(updatePlanLineItemFund(data)),
    };
};

export default connect(mapStateToProps, mapDispatchtoProps)(CreateShift);
