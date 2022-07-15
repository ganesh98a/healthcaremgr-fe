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
import { changeTimeZone, handleDateChangeRaw, checkItsNotLoggedIn, postData, handleRemoveShareholder, getOptionsSiteName, getOptionsParticipant } from '../../../service/common.js';
import { Link, Redirect } from 'react-router-dom';

import 'react-block-ui/style.css';
import BlockUi from 'react-block-ui';
import { connect } from 'react-redux'
import { setRosterDetails } from './actions/ScheduleAction';
import SchedulePage from './SchedulePage';
import { ROUTER_PATH } from 'config.js';



const WeekData = {
    Mon: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }],
    Tue: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }],
    Wed: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }],
    Thu: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }],
    Fri: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }],
    Sat: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }],
    Sun: [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }]
}



class CreateRoster extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            rosterList: [WeekData],
            start_time: '',
            end_time: '',
            modal_par_info: false,
            booked_by: 2,
            modal_collapse_shift: false,
            collapseSelect: 2,
            collapse_shift: [],
            rosterId: false,
            update_disabled: true
        }

    }

    getRosterDetails = (e) => {
        var requestData = { rosterId: this.state.rosterId };
        postData('schedule/ScheduleListing/get_roster_details', requestData).then((result) => {
            if (result.status) {
                var tempAry = result.data;
                this.props.setRosterDetails(tempAry);
                this.setState(tempAry);
            } else {
                this.setState({ error: result.error });
            }
            this.setState({ loading: false });
        });

    }

    componentDidMount() {
        if (this.props.props.match.params.id) {
            this.setState({ rosterId: this.props.props.match.params.id, update_disabled: true }, () => {
                this.getRosterDetails();
            })
        } else {
            this.setState({ modal_par_info: true, update_disabled: false, rosterList: [this.reInitializeObject(WeekData)] },()=>{
                this.props.setRosterDetails({id:''});
            });
        }
    }

    addRoster = (shiftIndex, index, day) => {
        if (!this.state.update_disabled) {
            var List = this.state.rosterList

            if (List[index][day][shiftIndex]['is_active']) {
                List[index][day][shiftIndex] = { is_active: false };
            } else {
                this.setState({ modal_show: true }, () => {
                    this.setState({ start_time: null, end_time: null, index: index, day: day, shiftIndex: shiftIndex })

                })
            }
            this.setState({ rosterList: List })
        }
    }

    saveDateTime = (shiftIndex, index, day) => {
        jQuery('#saving_time').validate();

        if (jQuery('#saving_time').valid()) {
            var List = this.state.rosterList
            var status1 = false, status2 = false, status3 = false, status4 = false

            List[index][day].map((val, id) => {
                if (!status1 && !status2 && !status3 && !status4 && val.start_time && val.end_time) {
                    status1 = moment(this.state.start_time).isBetween(moment(val.start_time), moment(val.end_time, null, '[]'))
                    status2 = moment(this.state.end_time).isBetween(moment(val.start_time), moment(val.end_time), null, '[]')
                    status3 = moment(val.start_time).isBetween(moment(this.state.start_time), moment(this.state.end_time), null, '[]')
                    status4 = moment(val.end_time).isBetween(moment(this.state.start_time), moment(this.state.end_time), null, '[]')
                }
            })

            toast.dismiss();
            if (!status1 && !status2 && !status3 && !status4) {
                List[index][day][shiftIndex]['is_active'] = true
                List[index][day][shiftIndex]['start_time'] = this.state.start_time
                List[index][day][shiftIndex]['end_time'] = this.state.end_time
                this.setState({ rosterList: List })
                this.closeModal();
            } else {
                toast.error(<ToastUndo message={"Selected start and end time overide your previous selected time on this day"} showType={'e'} />, {
                // toast.error("Selected start and end time overide your previous selected time on this day", {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
        }
    }

    handleAddShareholder = (e, stateName, object_array) => {
        var state = {};
        var temp = object_array
        var list = this.state[stateName];

        state[stateName] = list.concat(this.reInitializeObject(WeekData));
        this.setState(state);
    }

    closeModal = () => {
        this.setState({ modal_show: false })
    }

    reInitializeObject = (object_array) => {
        var state = {}
        Object.keys(object_array).forEach(function (key) {
            state[key] = [{ is_active: false }, { is_active: false }, { is_active: false }, { is_active: false }];
        });
        return state;
    }

    selectChange = (value, fieldName) => {
        var state = {};
        state[fieldName] = value;
        this.setState(state)

    }

    saveAndFinish = () => {
        this.setState({ modal_show_type: false, modal_start_end_date: true })
        if (!this.state.rosterId) {
            this.setState({ start_date: '', end_time: '' })
        }
    }

    checkValidDay = () => {
        var status = false;
        var List = this.state.rosterList
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
            this.setState({ modal_show_type: true })
        } else {
            toast.error(<ToastUndo message={'Please select at least one day'} showType={'e'} />, {
            // toast.error('Please select at least one day', {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }
    }

    check_shift_collapse = () => {
        jQuery('#saving_roster').validate();
        toast.dismiss();
        this.setState({ loading: true });
        if (jQuery('#saving_roster').valid()) {
            postData('schedule/ScheduleDashboard/check_shift_collapse', this.state).then((result) => {
                if (result.status) {
                    this.setState({ collapse_shift: result.data }, () => {
                        if (result.count > 0 && this.state.is_default == 2) {
                            this.setState({ modal_collapse_shift: true })
                            this.setState({ loading: false });
                        } else {
                            this.saveRoster();
                        }
                        this.setState({ modal_start_end_date: false });
                    })
                } else {
                    this.setState({ loading: false });
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            });
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

        this.setState({ collapse_shift: List });
    }

    saveRoster = (validate) => {
        this.setState({ loading: true })
        postData('schedule/ScheduleDashboard/create_roster', this.state).then((result) => {
            if (result.status) {
                toast.success(<ToastUndo message={'Roster create successfully'} showType={'s'} />, {
                // toast.success('Roster create successfully', {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                this.setState({ is_redirect: true, loading: false })
                this.setState({ modal_collapse_shift: false })
            } else {
                toast.error(<ToastUndo message={'Please select at least one day'} showType={'e'} />, {
                // toast.error('Please select at least one day', {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                this.setState({ loading: false })
            }
        });

    }

    handlePendingRequest = (status) => {
        var request = { status: status, rosterId: this.state.rosterId }
        postData('schedule/ScheduleDashboard/approve_and_deny_roster', request).then((result) => {
            if (result.status) {
                this.getRosterDetails();
                toast.success(<ToastUndo message={result.message} showType={'s'} />, {
                // toast.success(result.message, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
        });
    }

    render() {
        let schedulePageTitle = this.state.update_disabled ? 'roster_details':'roster_details_new';

        return (
            <React.Fragment>
                <SchedulePage pageTypeParms={schedulePageTitle}/>
                <BlockUi tag="div" blocking={this.state.loading}>
                   <React.Fragment>
                        {this.state.is_redirect ? <Redirect to='/admin/schedule/active_roster' /> : ''}
                      
                           
                            <div className="row  _Common_back_a">
                                <div className="col-lg-12 col-md-12"><a onClick={() => this.props.props.history.goBack()} ><span className="icon icon-back-arrow back_arrow"></span></a></div>
                            </div>
                            <div className="row"><div className="col-lg-12 col-md-12"><div className="bor_T"></div></div></div>


                            <div className="row">

                                <div className="col-lg-12 col-md-12 P_15_TB text-center">
                                    <h1 className="color">Roster ID <span> - {this.state.id || 'N/A'}</span></h1>
                                    <ul className="user_info P_15_T">
                                        <li>Start Date: <span>{changeTimeZone(this.state.start_date, 'DD/MM/YYYY') || 'N/A'}</span></li>
                                        <li>Participant: <span>{this.state.participantName || 'N/A'}</span></li>
                                        <li>End Date <span>{this.state.end_date ? moment(this.state.end_date).format('DD/MM/YYYY') : 'N/A'}</span></li>
                                        <li>Title: <span> {this.state.title || 'N/A'}</span></li>
                                    </ul>
                                </div>
                                <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 py-4">
                                    <div className="key_color_calendar">
                                        <ul>
                                            <li><span className="key_heading">Key:</span></li>
                                            <li className="inside_funding pl-4"><small></small><span>inside Funding</span></li>
                                            <li className="outside_funding pl-3"><small></small><span>Outside Funding</span></li>
                                            <li className="inside_funding_count pl-5"><small></small><span>1:1</span></li>
                                            <li className="defaout_funding pl-3"><small></small><span>2:1</span></li>
                                            <li className="black_funcing pl-3"><small></small><span>3:1</span></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                            </div>

                            <div className="row mt-5 d-flex justify-content-center">
                                <div className="col-lg-9 col-md-12">
                                    <div className="row">
                                        <div id="calendar-wrap" className="calendar-wrap">


                                            <div className="left_side hidden_date">
                                                <img src="/assets/images/Schedules/calendar_left.svg" />
                                            </div>
                                            <div className="center_box">
                                                <div className="row P_15_b">
                                                    <div className="col-md-4"></div>
                                                    <div className="col-md-4 text-center"><h1 className="month_name">{this.state.update_disabled ? (this.state.title ? this.state.title : 'Default') : 'Blank'} Roster</h1></div>
                                                    <div className="col-md-2 col-md-offset-2">

                                                    </div>
                                                </div>
                                                <table id="calendar" className="calendar_table">
                                                    <tbody>{this.state.rosterList.map((weekList, index) => (
                                                        <tr className="days" key={index + 1}>
                                                            <SingleDay day="Mon" addRoster={this.addRoster} index={index} weekList={weekList['Mon']} />
                                                            <SingleDay day="Tue" addRoster={this.addRoster} index={index} weekList={weekList['Tue']} />
                                                            <SingleDay day="Wed" addRoster={this.addRoster} index={index} weekList={weekList['Wed']} />
                                                            <SingleDay day="Thu" addRoster={this.addRoster} index={index} weekList={weekList['Thu']} />
                                                            <SingleDay day="Fri" addRoster={this.addRoster} index={index} weekList={weekList['Fri']} />
                                                            <SingleDay day="Sat" addRoster={this.addRoster} index={index} weekList={weekList['Sat']} />
                                                            <SingleDay day="Sun" addRoster={this.addRoster} index={index} weekList={weekList['Sun']} />

                                                            {(this.state.update_disabled) ? "" : <td className="roster_border_td">{(index) > 0 ? <span className="button_plus__" onClick={(e) => handleRemoveShareholder(this, e, index, 'rosterList')}>
                                                                    <i className="icon icon-decrease-icon Add-2-2" ></i>
                                                                </span> : (this.state.rosterList.length >= 4) ? '' :<span className="button_plus__" onClick={(e) => this.handleAddShareholder(e, 'rosterList', weekList)}>
                                                                <i className="icon icon-add-icons Add-2-1" ></i>
                                                            </span>}</td>}
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                                
                                                

                                                <div className="row">
                                                    <div className="col-md-12 P_15_T text-center">
                                                        {/*<button className="default_but_remove"><i className="icon icon-invoice invoice_button"></i></button>*/}
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="right_side hidden_date">
                                                <img src="/assets/images/Schedules/calendar_right.svg" />
                                            </div>
                                        </div>



                                        <div className="col-sm-6 col-sm-offset-3 mt-4">
                                            <div className="row">
                                                <div className="col-md-12 text-center">
                                                    {this.state.update_disabled ? '' :
                                                        <button disabled={this.state.update_disabled} className="but_submit w-50" onClick={() => this.checkValidDay()}>Save New Roster</button>}

                                                </div>
                                                <div className="col-md-12">
                                                    <div className="row">
                                                        <div className="col-sm-6">{this.state.status == 2 ? <button type="button" onClick={() => this.handlePendingRequest(4)} className="but_submit">Decline Request</button> : ''}</div>
                                                        <div className="col-sm-6">{this.state.status == 2 ? <button type="button" onClick={() => this.handlePendingRequest(1)} className="but_submit">Approve Request</button> : ''}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <OverlapShifts modal_show={this.state.modal_collapse_shift} collapse_shift={this.state.collapse_shift} checkboxResolveCollapse={this.checkboxResolveCollapse}
                                            collapseSelect={this.state.collapseSelect} saveRoster={this.saveRoster} selectChange={this.selectChange} loading={this.state.loading} />

                                        <ParticipantInformation modal_show={this.state.modal_par_info} selectChange={this.selectChange}
                                            booked_by={this.state.booked_by} site={this.state.site} participant={this.state.participant} />

                                        <StartEndTimeModal modal_show={this.state.modal_show} selectChange={this.selectChange} start_time={this.state.start_time}
                                            end_time={this.state.end_time} index={this.state.index} day={this.state.day} saveDateTime={this.saveDateTime}
                                            closeModal={this.closeModal} loading={this.state.loading} shiftIndex={this.state.shiftIndex} />

                                        <SavingChanges update_disabled={this.state.update_disabled} modal_show={this.state.modal_show_type} saving_type={this.state.is_default} selectChange={this.selectChange} saveAndFinish={this.saveAndFinish} loading={this.state.loading} />

                                        <StartAndEndDateOfRoster modal_show={this.state.modal_start_end_date} is_default={this.state.is_default}
                                            selectChange={this.selectChange} start_date={this.state.start_date} title={this.state.title}
                                            end_date={this.state.end_date} check_shift_collapse={this.check_shift_collapse} />
                                    </div>
                                </div>
                            </div>

                       
                     </React.Fragment>
                </BlockUi>
                </React.Fragment>
        );
    }
}
const mapStateToProps = state => ({
    showTypePage: state.MemberReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {
        setRosterDetails:(result) => dispach(setRosterDetails(result))
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateRoster);

class SingleDay extends React.Component {
    render() {
        return <td className="day">
            <table>
                <tbody>
                    <tr>
                        <th><span className="weekdays">{this.props.day}</span></th>
                        <th><span className="hidden_date"></span></th>
                    </tr>
                    {this.props.weekList.map((val, index) => (
                        <tr title={val.is_active ? "Start at: " + moment(val.start_time).format('hh:mm A') + " End time: " + moment(val.end_time).format('hh:mm A') : ""} key={index + 1} className={((val.is_active) ? 'outside_funding_number odd' : '')} onClick={() => this.props.addRoster(index, this.props.index, this.props.day)}><td colSpan="2"></td></tr>
                    ))}

                </tbody>
            </table>
        </td>;
    }
}

class StartEndTimeModal extends React.Component {
    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>
                <div className="dis_cell">
                    <div className="text text-left by-1 Popup_h_er_1">
                    <span>Select start and end time of this day</span>
                    <a onClick={this.props.closeModal} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Please set a start and an end time for this day.</h4>

                    <div className="row P_15_T">
                        <div className="col-md-5">
                            <form id="saving_time">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Start:</label>
                                        <span className="required">
                                            <DatePicker autoComplete={'off'} onChangeRaw={handleDateChangeRaw} required={true} maxTime={(this.props.end_time) ? moment(this.props.end_time) : moment().hours(23).minutes(59)}
                                                minTime={moment().hours(0).minutes(0)} className="text-center"
                                                selected={this.props.start_time ? moment(this.props.start_time) : null} name="start_time" onChange={(e) => this.props.selectChange(e, 'start_time')}
                                                showTimeSelect showTimeSelectOnly scrollableTimeDropdown timeIntervals={15} dateFormat="LT" />

                                        </span>
                                    </div>
                                    <div className="col-md-6">
                                        <label>End:</label>
                                        <span className="required">
                                            <DatePicker autoComplete={'off'}  onChangeRaw={handleDateChangeRaw} required={true} className="text-center" selected={this.props.end_time ? moment(this.props.end_time) : null}
                                                name="end_time" minTime={(this.props.start_time) ? moment(this.props.start_time) : moment().hours(0).minutes(0)}
                                                maxTime={moment(this.props.start_time, 'DD-MM-YYYY').hours(23).minutes(59)} onChange={(e) => this.props.selectChange(e, 'end_time')}
                                                showTimeSelect showTimeSelectOnly scrollableTimeDropdown timeIntervals={15} dateFormat="LT" />
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col-md-2">
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-7"></div>
                        <div className="col-md-5 P_15_T">
                            <button disabled={this.props.loading} className="but_submit" onClick={() => this.props.saveDateTime(this.props.shiftIndex, this.props.index, this.props.day)}>Save & Continue</button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        </div>;
    }
}

class SavingChanges extends React.Component {
    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B Schedule_Module"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>
                <div className="dis_cell">
                    <div className="text text-left by-1 Popup_h_er_1"><span>Saving new Roster</span>
                    <a onClick={() => this.props.selectChange(false, 'modal_show_type')} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Would you like to set this as the DEFAULT roster for this Participant?</h4>
                    <div className="row P_15_T">
                        <div className="col-md-5">
                            <Select clearable={false} className="custom_select" simpleValue={true} searchable={false} value={this.props.saving_type} onChange={(e) => this.props.selectChange(e, 'is_default')}
                                options={[{ label: 'No', value: 1 }, { label: 'Yes', value: 2 }]} placeholder="Please Select" />
                        </div>
                        <div className="col-md-2">
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-7"></div>
                        <div className="col-md-5 P_15_T">
                            <button onClick={this.props.saveAndFinish} className="but_submit">Finish & Save</button>
                        </div>
                    </div>

                </div>
            </Modal.Body>
        </Modal>
        </div>;
    }
}

class StartAndEndDateOfRoster extends React.Component {
    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B Schedule_Module"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>
                <div className="dis_cell">
                    <div className="text text-left by-1 Popup_h_er_1"><span>Saving New Roster</span>
                    <a onClick={() => this.props.selectChange(false, 'modal_start_end_date')} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Please set a start {(this.props.is_default == 1) ? 'and an end date' : ''} for this roster.</h4>

                    <div className="row P_15_T">
                        <div className="col-md-5">
                            <form id="saving_roster">
                                <div className="row">
                                    {(this.props.is_default == 1) ?
                                        <div className="col-md-6">
                                            <label>Title</label>
                                            <span className="required">
                                                <input type="text" required={1} name="start_date" value={this.props.title || ''} onChange={(e) => this.props.selectChange(e.target.value, 'title')} />
                                            </span>
                                        </div> : ''}
                                    <div className="col-md-6">
                                        <label>Start:</label>
                                        <span className="required">
                                            <DatePicker autoComplete={'off'} onChangeRaw={handleDateChangeRaw} required={true} dateFormat="DD/MM/YYYY" maxDate={(this.props.end_date) ? moment(this.props.end_date) : null}
                                                minDate={moment()} className="text-center"
                                                selected={this.props.start_date ? moment(this.props.start_date) : null} name="start_date"
                                                onChange={(e) => this.props.selectChange(e, 'start_date')}
                                            />
                                        </span>
                                    </div>
                                    {(this.props.is_default == 1) ?
                                        <div className="col-md-6">
                                            <label>End:</label>
                                            <span className="required">
                                                <DatePicker autoComplete={'off'} onChangeRaw={handleDateChangeRaw} required={true} dateFormat="DD/MM/YYYY" className="text-center"
                                                    selected={this.props.end_date ? moment(this.props.end_date) : null}
                                                    name="end_date" minDate={(this.props.start_date) ? moment(this.props.start_date) : moment()}
                                                    onChange={(e) => this.props.selectChange(e, 'end_date')}
                                                />
                                            </span>
                                        </div> : ''}
                                </div>
                            </form>
                        </div>

                        <div className="col-md-2">
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-7"></div>
                        <div className="col-md-5 P_15_T">
                            <button className="but_submit" onClick={() => this.props.check_shift_collapse(true)}>Save & Continue</button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        </div>;
    }
}

class ParticipantInformation extends React.Component {

    checkValidName = (event) => {
        event.preventDefault();

        jQuery('#participantInformation').validate({ ignore: [] });
        if (jQuery('#participantInformation').valid()) {
            this.props.selectChange(false, "modal_par_info")
        }
    }

    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B Schedule_Module"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>

                <div className="dis_cell">
                    <form id="participantInformation">
                        <div className="text text-left by-1 Popup_h_er_1"><span>Information</span>
                    <Link to={ROUTER_PATH+'admin/schedule/active_roster'} className="close_i"><i className="icon icon-cross-icons"></i></Link>
                        </div>
                       

                        <div className="row P_15_T">
                        <div className="col-md-12"><div className="label_2_1_1">Please select participant name.</div></div>
                            <div className="col-md-5">
                            <span className="required">
                                <div className="modify_select">
                                    {this.props.booked_by == 2 ?
                                        <Select.Async required={true}
                                            className="default_validation"
                                            name="form-field-name"
                                            value={this.props.participant}
                                            loadOptions={(e) => getOptionsParticipant(e)}
                                            onChange={(e) => this.props.selectChange(e, 'participant')}
                                            placeholder="Search Participant"
                                            clearable={false}
                                            cache={false}
                                        /> : <Select.Async required={true}
                                            className="default_validation"
                                            name="form-field-name"
                                            value={this.props.site}
                                            cache={false}
                                            loadOptions={(e) => getOptionsSiteName(e)}
                                            onChange={(e) => this.props.selectChange(e, 'site')}
                                            placeholder="Search Site"
                                        />}
                                </div>
                                </span>
                            </div>

                            <div className="col-md-2">
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-7"></div>
                            <div className="col-md-5 P_15_T">
                                <button className="but_submit" onClick={(e) => this.checkValidName(e)}>Save & Continue</button>
                            </div>
                        </div>
                    </form>
                </div>

            </Modal.Body>
        </Modal></div>;
    }
}

class OverlapShifts extends React.Component {

    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B Schedule_Module big_modal"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>

                <div className="dis_cell collaspe_roster save_new_roster_model">
                    <div className="text text-left by-1 Popup_h_er_1"><span>Saving New Roster</span>
                    <a onClick={() => this.props.selectChange(false, 'modal_collapse_shift')} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Please select the shifts to keep or discard from this Participants current <br />DEFAULT roster. </h4>
                    <small><i>*Please note, any shifts you discard will automatically be cancelled. </i></small>

                    <div className="d-flex P_15_T">
                        <div className="col border_dotted_right">
                            <div className="d-flex"><h3 className="w-100 text-center py-4 by-1">Previous Shifts:</h3></div>
                        </div>

                        <div className="col">
                            <div className="d-flex"><h3 className="w-100 text-center py-4 by-1">New Shifts:</h3></div>
                        </div>
                    </div>

                    <div className="d-flex">
                        <div className="col border_dotted_right">
                            <div className="d-flex make_header  pr-3 bb-1">
                                <div className="col-1 py-3 px-3 color font_w_4 br-1">
                                    <span>
                                        <input type="checkbox" className="checkbox_flex" name="" checked={this.props.collapseSelect == 1 ? true : false} onChange={() => this.props.checkboxResolveCollapse('', 1, true)} />
                                        <label htmlFor="zw" style={{marginBottom:'0'}}><span onClick={() => this.props.checkboxResolveCollapse('', 1, true)} className="mx-0"></span></label>
                                    </span>
                                </div>
                                <div className="col-3 py-3 px-3 color font_w_4 br-1">Date:</div>
                                <div className="col-2 py-3 px-3 color font_w_4 br-1">Start:</div>
                                <div className="col-2 py-3 px-3 color font_w_4 br-1">Duration:</div>
                                <div className="col-2 py-3 px-3 color font_w_4 br-1">End:</div>
                                <div className="col-3 py-3 px-3 color font_w_4">Status</div>
                            </div>
                        </div>

                        <div className="col">
                            <div className="d-flex make_header  pl-3 bb-1">
                                <div className="col-1 py-3 px-3 color font_w_4 br-1">
                                    <span>
                                        <input type="checkbox" className="checkbox_flex" name="" checked={this.props.collapseSelect == 2 ? true : false} onChange={() => this.props.checkboxResolveCollapse('', 2, true)} />
                                        <label htmlFor="z" style={{marginBottom:'0'}}><span onClick={() => this.props.checkboxResolveCollapse('', 2, true)} className="mx-0"></span></label>
                                    </span>
                                </div>
                                <div className="col-3 py-3 px-3 color font_w_4 br-1">Date:</div>
                                <div className="col-2 py-3 px-3 color font_w_4 br-1">Start:</div>
                                <div className="col-2 py-3 px-3 color font_w_4 br-1">Duration:</div>
                                <div className="col-2 py-3 px-3 color font_w_4 br-1">End:</div>
                                <div className="col-3 py-3 px-3 color font_w_4">Status</div>
                            </div>

                        </div>
                    </div>

                    {this.props.collapse_shift.map((shift, id) => (
                        (shift.is_collapse) ?
                            <div key={id + 1} className="d-flex save_new_roster_table_">


                                <div className="col pdd-b border_dotted_right align-self-center">
                                    {shift.old.map((oldShift, index) => (
                                        <div className="d-flex make_up radi_1 mt-3 mr-3">
                                            <div className="col-1 py-2 px-3 br-1">
                                                <span>
                                                    <input type="checkbox" className="checkbox_flex" name="" checked={(oldShift.active) ? true : false} onChange={() => this.props.checkboxResolveCollapse(id, 1, false, 'old', index)} />
                                                    <label for="a" style={{marginBottom:'0'}}><span className="mx-0" onClick={() => this.props.checkboxResolveCollapse(id, 1, false, 'old', index)} ></span></label>
                                                </span>
                                            </div>
                                            <div className="col-3 py-2 px-3 br-1">{changeTimeZone(oldShift.shift_date)}</div>
                                            <div className="col-2 py-2 px-3 br-1">{changeTimeZone(oldShift.start_time, "LT")}</div>
                                            <div className="col-2 py-2 px-3 br-1">{oldShift.duration}</div>
                                            <div className="col-2 py-2 px-3 br-1">{changeTimeZone(oldShift.end_time, "LT")}</div>
                                            <div className="col-2 py-2 px-3">{oldShift.status}</div>
                                        </div>
                                    ))}
                                </div>


                                <div className="col pdd-b align-self-center">
                                    <div className="d-flex make_up radi_1 mt-3 ml-3">
                                        <div className="col-1 py-2 px-3 br-1">
                                            <span>
                                                <input type="checkbox" className="checkbox_flex" checked={(shift.status == 2) ? true : false} name="" onChange={() => this.props.checkboxResolveCollapse(id, 2)} />
                                                <label htmlFor="g" style={{marginBottom:'0'}}><span onClick={() => this.props.checkboxResolveCollapse(id, 2)} className="mx-0"></span></label>
                                            </span>
                                        </div>
                                        <div className="col-3 py-2 px-3 br-1">{changeTimeZone(shift.new.shift_date)}</div>
                                        <div className="col-2 py-2 px-3 br-1">{changeTimeZone(shift.new.start_time, "LT")}</div>
                                        <div className="col-2 py-2 px-3 br-1">{shift.new.duration}</div>
                                        <div className="col-2 py-2 px-3 br-1">{changeTimeZone(shift.new.end_time, "LT")}</div>
                                        <div className="col-2 py-2 px-3">{shift.new.status}</div>
                                    </div>

                                </div>
                            </div> : ''
                    ))}

                    <div className="row">
                        <div className="col-md-2 col-md-offset-5 P_15_T">
                            {this.props.loading ? <span>Please wait...</span> : ''}
                            <button disabled={this.props.loading} className="but_submit" onClick={this.props.saveRoster}>Save & Continue</button>
                        </div>
                    </div>

                </div>


            </Modal.Body>
        </Modal>
        </div>;
    }
}
