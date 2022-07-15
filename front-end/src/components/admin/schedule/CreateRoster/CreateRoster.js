import React, { Component } from 'react';

import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import jQuery from "jquery";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastUndo } from 'service/ToastUndo.js'

import moment from 'moment'
import Modal from 'react-bootstrap/lib/Modal';
import DatePicker from 'react-datepicker';
import { changeTimeZone, handleDateChangeRaw, checkItsNotLoggedIn, postData, handleRemoveShareholder, getOptionsSiteName, getOptionsParticipant, toastMessageShow, calculateGst } from 'service/common.js';
import { Link, Redirect } from 'react-router-dom';

import 'react-block-ui/style.css';
import BlockUi from 'react-block-ui';
import { connect } from 'react-redux'
import { setRosterDetails } from './../actions/ScheduleAction';
import { onChange, getRosterShiftOption, getRosterRequirementsForParticipant, setRosterList, updatePlanLineItemFund, getRosterDetails, updateRemovedRosterShiftId, resetRoster, removeShift } from './../actions/CreateRosterAction';
import SchedulePage from './../SchedulePage';
import { ROUTER_PATH } from 'config.js';
import SimpleBar from "simplebar-react";
import OverlapShiftsPopUp from "./OverlapShiftsPopUp";
import { getTimeDifferInHours } from './CommonFunction.js';

const WeekData = {
    Mon: [{ is_active: false }],
    Tue: [{ is_active: false }],
    Wed: [{ is_active: false }],
    Thu: [{ is_active: false }],
    Fri: [{ is_active: false }],
    Sat: [{ is_active: false }],
    Sun: [{ is_active: false }]
}



class CreateRoster extends Component {
    constructor(props) {
        super(props);

        this.state = {
            booked_by: 2,
            modal_collapse_shift: false,
            collapseSelect: 2,
            collapse_shift: [],
            rosterId: false,
//            is_redirect: true
        }

    }

    onChangeParticipant = (value) => {
        this.props.getRosterRequirementsForParticipant({ participantId: value.value });
        this.props.onChange('participant', value);
    }

    componentDidMount() {
        if(!this.props.location.state || !this.props.match.params.id || !this.props.data_loaded){
            if ((this.props.match.params.id && !this.props.location.state) || (!this.props.data_loaded && this.props.match.params.id)) {
                this.props.resetRoster();
                this.setState({ rosterId: this.props.match.params.id}, () => {
                    this.props.getRosterDetails({rosterId: this.state.rosterId});
                })
            } else if(!this.props.location.state){
                this.props.resetRoster();
                this.props.getRosterShiftOption();
            }
        }else{
            this.props.resetRoster();
            this.props.getRosterShiftOption();
        }
    }

    handleAddShareholder = (e, stateName, object_array) => {
        var state = {};
        var temp = object_array
        var list = this.props.rosterList;

        state = list.concat(this.reInitializeObject(WeekData));

        this.props.setRosterList(state);
    }

    handleRemoveShareholder = (e, index, stateName) => {
        e.preventDefault();

        var state = {};
        var List = this.props.rosterList;
        state = List.filter((s, sidx) => index !== sidx);

        this.props.setRosterList(state);
    }

    removeShift = (index, main_index, day) => {
        this.props.removeShift([{shift_index: index, week_index: main_index, day: day}]);
    }

    reInitializeObject = (object_array) => {
        var state = {}
        Object.keys(object_array).forEach(function (key) {
            state[key] = [{ is_active: false }];
        });
        return state;
    }

    selectChange = (value, fieldName) => {
        var state = {};
        state[fieldName] = value;
        this.setState(state)

    }

    checkValidDay = (e) => {
        e.preventDefault()
        jQuery('#saving_roster').validate();
        if (jQuery('#saving_roster').valid()) {
            var status = false;
            var List = this.props.rosterList
            List.map((mutipleShift, index) => {
                Object.keys(mutipleShift).forEach(function (key, index) {
                    mutipleShift[key].map((shift, shiftIndex) => {
                        if (shift.is_active) {
                            if (!status) {
                                status = true;
                            }
                        }
                    })
                })
            })

            toast.dismiss();
            if (status) {
                this.check_shift_collapse();
            } else {
                toastMessageShow('Please select at least one day', "e");
            }
        }
    }

    checkboxResolveCollapse = (id, value, selectAll, old, oldIndex) => {
        var List = this.state.collapse_shift;

        // if want to select all
        if (selectAll) {
            List.map((shift, id) => {
                List[id]['status'] = value;
                var NewOld = (value == 2) ? false : true
                if (List[id].is_collapse) {
                    List[id]['old'].map((temp, tId) => {
                        List[id]['old'][tId]['active'] = NewOld;
                    })
                }
            })
            this.setState({ collapseSelect: value })
        } else if (old == 'old') {
            if (List[id]['old'][oldIndex]['active']) {

                List[id]['old'][oldIndex]['active'] = false;
                var totl = false;

                List[id]['old'].map((temp, tId) => {
                    if (List[id]['old'][tId]['active'])
                        totl = true
                })

                if (!totl)
                    List[id]['status'] = 2;


            } else {
                List[id]['status'] = false;
                List[id]['old'][oldIndex]['active'] = true;
            }

            this.setState({ collapseSelect: false })
        } else {
            List[id]['old'].map((temp, tId) => {
                List[id]['old'][tId]['active'] = false;
            })
            List[id]['status'] = value;
        }

        this.setState({ collapse_shift: [...List] });
    }

    check_shift_collapse = () => {
        this.setState({ loading: true })
        let request = { rosterId : this.props.rosterId, is_default: this.props.is_default, rosterList: this.props.rosterList, userId: this.props.participant.value, start_date: this.props.start_date, end_date: this.props.end_date, title: this.props.title, will_remove_roster_shiftId: this.props.will_remove_roster_shiftId }
        postData('schedule/ScheduleRoster/check_shift_collapse', request).then((result) => {
            if (result.status) {
                this.setState({ collapse_shift: result.data }, () => {
                    if (result.count > 0 && this.props.is_default == 2) {
                        this.setState({ modal_collapse_shift: true })
                        this.setState({ loading: false });
                    } else {
                        this.saveRoster();
                    }
                })
            } else {
                this.setState({ loading: false });
                toastMessageShow(result.error, "e");
            }
        });
    }

    saveRoster = (validate) => {
        this.setState({ loading: true })
        let request = { rosterId : this.props.rosterId, is_default: this.props.is_default, rosterList: this.props.rosterList, userId: this.props.participant.value, start_date: this.props.start_date, end_date: this.props.end_date, title: this.props.title, collapse_shift: this.state.collapse_shift, will_remove_roster_shiftId: this.props.will_remove_roster_shiftId }
        postData('schedule/ScheduleRoster/create_roster', request).then((result) => {
            if (result.status) {
                
                toastMessageShow('Roster save successfully', "s");
                this.setState({ is_redirect: true, loading: false })
                this.setState({ modal_collapse_shift: false })
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false })
            }
        });

    }

    handlePendingRequest = (status) => {
        var request = { status: status, rosterId: this.state.rosterId }
        postData('schedule/ScheduleDashboard/approve_and_deny_roster', request).then((result) => {
            if (result.status) {
                this.getRosterDetails();
                toastMessageShow(result.message, "e");
            }
        });
    }

    render() {
        let schedulePageTitle = this.props.update_disabled ? 'roster_details' : 'roster_details_new';
        var rosterId = this.props.match.params.id
        console.log(this.props.plan_line_item)
        return (
            <React.Fragment>
                {this.state.is_redirect ? <Redirect to="/admin/schedule/active_roster" /> : ''}
                <SchedulePage pageTypeParms={schedulePageTitle} />
                <BlockUi tag="div" blocking={this.state.loading}>
                    <React.Fragment>
                        <form id="saving_roster" method="post">
                            <div className="row  _Common_back_a">
                                <div className="col-lg-12 col-md-12"><a onClick={() => this.props.history.goBack()} ><span className="icon icon-back-arrow back_arrow"></span></a></div>
                            </div>
                            <div className="row"><div className="col-lg-12 col-md-12"><div className="bor_T"></div></div></div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 P_15_TB">
                                    <h1 className={"color"}>{this.props.rosterId? "Roster ID - "+ this.props.rosterId: "Create New Roster:"}</h1>
                                </div>
                                <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 py-5">
                                    <div className="row">
                                        <div className="col-lg-3 col-md-3 col-xs-12"  >
                                            <label className="f-bold color">Participant:</label>
                                            {rosterId? 
                                            <div>{this.props.participant.label}</div> :
                                            <span className="required">
                                                <div className="search_icons_right modify_select">
                                                    <Select.Async
                                                        required={true}
                                                        className="default_validation"
                                                        name="form-field-name"
                                                        value={this.props.participant}
                                                        loadOptions={(e) => getOptionsParticipant(e)}
                                                        onChange={(e) => this.onChangeParticipant(e)}
                                                        placeholder="Search Participant"
                                                        clearable={false}
                                                        cache={false}
                                                    />
                                                </div>
                                            </span>}
                                        </div>

                                        <div className="col-lg-2 col-md-2 col-xs-12">
                                            <label className="f-bold color">Roster Type: </label>
                                            {rosterId? <div> {((this.props.is_default == 1)? "Other": "Default")} </div>: 
                                            <span>
                                                <Select
                                                    simpleValue={true}
                                                    name="booker_id"
                                                    searchable={false}
                                                    clearable={false}
                                                    value={this.props.is_default}
                                                    onChange={e => { this.props.onChange('is_default', e); if (e == 2) { this.props.onChange('title', ""); this.props.onChange('end_date', "") } }}
                                                    options={[{ label: 'Other', value: 1 }, { label: 'Default', value: 2 }]}
                                                    placeholder="Please select"
                                                />
                                            </span>}
                                        </div>

                                        <div className="w-20-lg col-lg-2 col-md-3 col-xs-12">
                                            <label className="f-bold color">Roster Title: </label>
                                            {rosterId? <div>{this.props.title || "Default"}</div>: 
                                            <span>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    required={true}
                                                    name="title"
                                                    disabled={this.props.is_default == 2 ? true : false}
                                                    value={this.props.title || ''}
                                                    onChange={(e) => this.props.onChange('title', e.target.value)}
                                                />
                                            </span>}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-xs-12">
                                            <label className="f-bold color">Start Date: </label>
                                            {rosterId? <div>{moment(this.props.start_date).format("DD/MM/YYYY")}</div>:
                                            <span className="cust_date_picker">
                                                <DatePicker autoComplete={'off'} onChangeRaw={handleDateChangeRaw} required={true} dateFormat="dd-MM-yyyy" 
                                                    maxDate={(this.props.end_date) ? moment(this.props.end_date) : moment(this.props.end_date).add(3, 'M')}
                                                    minDate={moment()} className="text-center"
                                                    selected={this.props.start_date ? moment(this.props.start_date) : null} name="start_date"
                                                    onChange={(e) => this.props.onChange('start_date', e)}
                                                />
                                            </span>}
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-xs-12">
                                            <label className="f-bold color">End Date: </label>
                                            {rosterId? <div>{this.props.is_default == 1? moment(this.props.end_date).format("DD/MM/YYYY"): 'N/A'}</div>:
                                            <span className="cust_date_picker right_0_date_piker">
                                                <DatePicker autoComplete={'off'} onChangeRaw={handleDateChangeRaw} required={true} dateFormat="dd-MM-yyyy" className="text-center"
                                                    selected={this.props.end_date ? moment(this.props.end_date) : null}
                                                    name="end_date" 
                                                    minDate={(this.props.start_date) ? moment(this.props.start_date).add(7,  'days') : moment().add(7, 'days')}
                                                    onChange={(e) => this.props.onChange('end_date', e)}
                                                    disabled={this.props.is_default == 2 ? true : false}
                                                    maxDate={this.props.start_date ? moment(this.props.start_date).add(1, 'M') : moment().add(4, 'M')}
                                                />
                                            </span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 P_15_TB d-flex flex-wrap">
                                    <span className={"f-bold"}>Funding Status:</span>
                                    <ul className="legend_ulBC small tag_funding_info">
                                        <li><span className="leg_ic clr_green"></span>Inside Funding</li>
                                        <li><span className="leg_ic clr_red"></span>Outside Funding</li>
                                    </ul>
                                </div>
                                <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                            </div>

                            <div className="row mt-5">
                                <div className="col-lg-12 creRosterTable_parent">
                                    {this.props.rosterList.map((weekList, index) => (
                                        <div className="creRosterTable" key={index + 1}>
                                         
                                            <div className="creRosterTable_td_1">
                                                <SingleDay title={"Monday"} day="Mon" removeShift={this.removeShift} index={index} weekList={weekList['Mon']} />
                                                <SingleDay title={"Tuesday"} day="Tue" removeShift={this.removeShift} index={index} weekList={weekList['Tue']} />
                                                <SingleDay title={"Wednesday"} day="Wed" removeShift={this.removeShift} index={index} weekList={weekList['Wed']} />
                                                <SingleDay title={"Thursday"} day="Thu" removeShift={this.removeShift} index={index} weekList={weekList['Thu']} />
                                                <SingleDay title={"Friday"} day="Fri" removeShift={this.removeShift} index={index} weekList={weekList['Fri']} />
                                                <SingleDay title={"Saturday"} day="Sat" removeShift={this.removeShift} index={index} weekList={weekList['Sat']} />
                                                <SingleDay title={"Sunday"} day="Sun" removeShift={this.removeShift} index={index} weekList={weekList['Sun']} />
                                            </div>

                                            {(this.props.update_disabled) ? "" : <div className="creRosterTable_td_2">
                                                {(index) > 0 ? 
                                                <React.Fragment>
                                                    <div className="text-right">
                                                    <span className="button_plus__" onClick={(e) => this.handleRemoveShareholder(e, index, 'rosterList')}>
                                                        <i className="icon icon-decrease-icon Add-2-2" ></i>
                                                    </span>
                                                    <Link className="button_plus__ mt-2" title={'Copy'} to={{ pathname: "/admin/schedule/copy_shifts_to_roster", state: { current_week:  index} }} ><i className="HCM-ie ie-clipboard Add-2-2"></i></Link>
                                                    </div>
                                                </React.Fragment>
                                                : 
                                                (this.props.rosterList.length >= 4) ? '' : 
                                                <span className="button_plus__" onClick={(e) => this.handleAddShareholder(e, 'rosterList', weekList)}>
                                                    <i className="icon icon-add-icons Add-2-1" ></i>
                                                </span>}</div>}
                                        </div>
                                    ))}
                                    <div className="text-center mt-3">
                                        <i className="icon icon-history2-ie color f-19 mx-3 cursor-pointer"></i>
                                        <i className="icon icon-notes2-ie color f-18 mx-3 cursor-pointer"></i>
                                    </div>
                                </div>
                            </div>

                            <OverlapShiftsPopUp modal_show={this.state.modal_collapse_shift} collapse_shift={this.state.collapse_shift} checkboxResolveCollapse={this.checkboxResolveCollapse}
                                collapseSelect={this.state.collapseSelect} saveRoster={this.saveRoster} selectChange={this.selectChange} loading={this.state.loading} />


                            <div className="row mt-5 d-flex justify-content-center">
                                {this.props.update_disabled ? '' : <div className=" col-lg-2">
                                    <button disabled={this.props.update_disabled} className="but_submit" onClick={(e) => this.checkValidDay(e)}>Save Roster</button>
                                </div>}
                                {this.state.status == 2 ? <button type="button" onClick={() => this.handlePendingRequest(4)} className="but_submit">Decline Request</button> : ''}
                                {this.state.status == 2 ? <button type="button" onClick={() => this.handlePendingRequest(1)} className="but_submit">Approve Request</button> : ''}
                            </div>
                        </form>
                    </React.Fragment>
                </BlockUi>
            </React.Fragment>
        );
    }
}
const mapStateToProps = state => ({
    showTypePage: state.MemberReducer.activePage.pageType,
    ...state.CreateRosterReducer,
})

const mapDispatchtoProps = (dispach) => {
    return {
        setRosterDetails: (result) => dispach(setRosterDetails(result)),
        onChange: (key, value) => dispach(onChange(key, value)),
        getRosterShiftOption: () => dispach(getRosterShiftOption()),
        getRosterRequirementsForParticipant: (request) => dispach(getRosterRequirementsForParticipant(request)),
        setRosterList: (data) => dispach(setRosterList(data)),
        updatePlanLineItemFund: (data) => dispach(updatePlanLineItemFund(data)),
        getRosterDetails: (data) => dispach(getRosterDetails(data)),
        updateRemovedRosterShiftId: (roster_shiftId) => dispach(updateRemovedRosterShiftId(roster_shiftId)),
        resetRoster: () => dispach(resetRoster()),
        removeShift: (shift_data) => dispach(removeShift(shift_data)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateRoster);

class SingleDayComponent extends React.Component {

    render() {
        var current_disable = true;
        if(!this.props.rosterId && this.props.participantId && this.props.start_date && ((this.props.is_default == 1 && this.props.end_date) || (this.props.is_default == 2))){
            current_disable = false
        }
        
        return (
            <div className="child_calcTable">
                <div className="child_calcHeader">
                    <span>{this.props.title}</span>
                    <i></i>
                </div>
                <div className="child_calcBody">
                    <SimpleBar
                        style={{
                            minHeight: "100px",
                            maxHeight: "100px",
                            overflowX: "hidden",
                            paddingLeft: "7px",
                            paddingRight: "7px"
                        }}
                        forceVisible={false}
                    >
                        {this.props.weekList.map((val, index) => {
                            let pathname = "/admin/schedule/add_shift_in_roster"+ ((val.roster_shiftId)? "/"+val.roster_shiftId: '');
                            return <div key={index + 1} >
                                {(val.is_active) ?
                                        <div className={"rosterShiftTr_1 " + ((val.some_item_expire)? "line_item_expire": ((val.in_funding ? "inside_funding" : "outside_funding")))}>
                                            {this.props.update_disabled ?
                                                <a>{moment(val.start_time).format("HH:mm")} : {moment(val.end_time).format("HH:mm")}</a> : 
                                                <React.Fragment>     
                                                    <Link disabled={current_disable} to={{ pathname: pathname, state: { index, main_index: this.props.index, day: this.props.day } }} >
                                                        {moment(val.start_time).format("HH:mm")} : {moment(val.end_time).format("HH:mm")}
                                                    </Link>
                                                    <i onClick={() => this.props.removeShift(index, this.props.index, this.props.day)} className="icon icon-close"></i>
                                                </React.Fragment>}   
                                        </div> :
                                        <div className="rosterShiftTr_2">
                                            {this.props.update_disabled ? "" :<Link disabled={current_disable} to={{ pathname: pathname, state: { index, main_index: this.props.index, day: this.props.day } }} >
                                                <i className="icon icon-add2-ie"></i> 
                                            </Link>}
                                        </div>
                                    }
                                </div>
                            })}
                    </SimpleBar>
                </div>
            </div>
        )
    }
}

const mapStateToProps1 = state => ({
    participantId: state.CreateRosterReducer.participant.value,
    is_default: state.CreateRosterReducer.is_default,
    start_date: state.CreateRosterReducer.start_date,
    end_date: state.CreateRosterReducer.end_date,
    update_disabled: state.CreateRosterReducer.update_disabled,
})

const mapDispatchtoProps1 = (dispach) => {
    return {

    }
}

const SingleDay = connect(mapStateToProps1, mapDispatchtoProps1)(SingleDayComponent);