import React, { Component } from 'react';
import "react-placeholder/lib/reactPlaceholder.css";
import Modal from 'react-bootstrap/lib/Modal';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { handleDateChangeRaw, postData, changeTimeZone } from '../../../../../service/common.js';
import { cancelShiftMethod, cancelShiftWhoOption } from '../../../../../dropdown/ScheduleDropdown.js';
import Select, { Async } from 'react-select-plus';
import { toast } from 'react-toastify';
import jQuery from "jquery";
import { ToastUndo } from 'service/ToastUndo.js'






class Editshift extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            location: [],
            shift_participant: [],
            confirmation_details: [],
            shift_caller: [],

        }
    }
    getShiftDetails = (ShiftId) => {
        this.setState({ loading: true })
        postData('crm/CrmParticipant/get_shift_details', { id: ShiftId }).then((result) => {
            if (result.status) {
                var details = result.data
                this.setState(details);
                this.setState({ loading: false });
            }
        });

    }

    componentDidMount() {
        this.getShiftDetails(this.props.props.match.params.id);
    }
    closeModel = (type, mode) => {
        var state = {};
        state['modal_show_' + type] = false;
        this.setState(state);
        if (mode) {
            this.getShiftDetails(this.props.props.match.params.id);
        }
    }
    render() {
        return (
          <React.Fragment>

                <div className="row  _Common_back_a">
                    <div className="col-lg-12 col-md-12">
                        <a className="d-inline-flex" href={this.props.props.location.state}>
                            <div className="icon icon-back-arrow back_arrow"></div>
                        </a>
                    </div>
                </div>

                <div className="row"><div className="col-lg-12 col-md-12"><div className="bor_T"></div></div></div>

                <div className="row">
                    <div className="col-lg-12 col-sm-12 P_15_TB text-center">
                        <h1 className="color">Shift ID<span> - {this.state.id}</span></h1>
                        {// <ul className="user_info P_15_T">
                            //     <li>Date: <span>27/06/2019</span></li>
                            //     <li> Participant: <span><span>'Sandeep'  Tiwari</span></span></li>
                            //     <li> Start: <span>3:15 PM</span></li>
                            //     <li> Duration: <span>5:45 hrs</span></li>
                            //     <li> End: <span>9:00 PM</span></li>
                            // </ul>
                        }
                        <ul className="user_info P_15_T">
                            <li>Date: <span>{changeTimeZone(this.state.shift_date)}</span></li>
                            <li> Participant: <span>{this.state.FullName}</span></li>
                            <li> Start:  <span>{changeTimeZone(this.state.start_time, "LT")}</span></li>
                            <li> Duration: <span>{this.state.duration}</span></li>
                            <li> End: <span>{changeTimeZone(this.state.end_time, "LT")}</span></li>

                        </ul>
                        {// <h2 className="shift_start_heading pt-3"><span>Starts In:</span> <span className="color_d"> <span>0:00:00:00</span></span> </h2>
                        }
                    </div>
                    <div className="col-lg-12 col-md-12">
                        <div className="bor_T"></div>
                    </div>
                </div>


                <div className="row">
                    <div className="col-lg-12 col-sm-12">
                        <div className="row">
                            <div className="col-md-12 text-center py-3">
                                <h2>All Shift Details:</h2></div>
                            <div className="col-md-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-8  col-sm-10  pt-5">
                                <div className="list_shift_AZ__">
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Date: </span>{changeTimeZone(this.state.shift_date)}</div>
                                        <div className="td_list">
                                            <button className="default_but_remove" onClick={() => this.setState({ modal_show_date_time: true })}><i className="icon icon-done-arrow"></i></button>
                                        </div>
                                    </div>
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Participant: </span> <span>{this.state.FullName}</span></div>
                                        <div></div>
                                    </div>
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Start: </span>{changeTimeZone(this.state.start_time, "LT")}</div>
                                        <div className="td_list">
                                            <button className="default_but_remove" data-toggle="modal" data-target="#modal_1" onClick={() => this.setState({ modal_show_date_time: true })}><i className="icon icon-done-arrow"></i></button>
                                        </div>
                                    </div>
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Duration: </span>{this.state.duration}</div>
                                        <div className="td_list"></div>
                                    </div>
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">End: </span>{changeTimeZone(this.state.end_time, "LT")}</div>
                                        <div className="td_list">
                                            <button className="default_but_remove" data-toggle="modal" data-target="#modal_1" onClick={() => this.setState({ modal_show_date_time: true })}><i className="icon icon-done-arrow"></i></button>
                                        </div>
                                    </div>
                                    {// <div className="tr_list">
                                        //     <div className="td_list"><span className="color">Location: </span> 663 Volutpat Road Sydney, Sydney, 1001, NSW</div>
                                        //     <div className="td_list">
                                        //         <button className="default_but_remove"><i className="icon icon-done-arrow"></i></button>
                                        //     </div>
                                        // </div>
                                    }
                                    {// <div className="tr_list">
                                        //     <div className="td_list"><span className="color">Requirements: </span></div>
                                        //     <div className="td_list">
                                        //         <button className="default_but_remove"><i className="icon icon-done-arrow"></i></button>
                                        //     </div>
                                        // </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8 col-lg-offset-2 col-sm-10 col-sm-offset-1 mt-5">
                        <div className="row">
                            {// <div className="col-lg-3 col-sm-3">
                                //     <button className="but_submit but_cancel">Cancel Shift</button>
                                // </div>
                            }
                        </div>
                    </div>
                </div>


                <UpdateShiftDateTIme modal_show={this.state.modal_show_date_time} closeModel={this.closeModel} uId={this.state.crm_participant_id} shiftId={this.state.id} shift_date={this.state.start_time} start_time={changeTimeZone(this.state.start_time, "YYYY-MM-DDTHH:mm:ss", true)} end_time={changeTimeZone(this.state.end_time, "YYYY-MM-DDTHH:mm:ss", true)} />
                <CancelShift modal_show={false} />
                {/* <UpdateShiftDateTIme modal_show={this.state.modal_show_date_time} closeModel={this.closeModel} shiftId={this.state.id} shift_date={this.state.start_time} start_time={changeTimeZone(this.state.start_time, "YYYY-MM-DDTHH:mm:ss", true)} end_time={changeTimeZone(this.state.end_time, "YYYY-MM-DDTHH:mm:ss", true)} /> */}
                {/* <CancelShift modal_show={this.state.modal_show_cancel_shift} status={this.state.status} closeModel={this.closeModel} booked_by={this.state.booked_by} shiftId={this.state.id} participantName={(this.state.shift_participant.length > 0) ? this.state.shift_participant[0].firstname : ''} /> */}

                </React.Fragment>

        );

    }
}



class UpdateShiftDateTIme extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentWillReceiveProps(newProps) {
        this.setState(newProps);
    }
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        if (fieldname == 'start_time') {
            var difference = this.getTimeDifferInHours();

            if (difference > 24 || difference < 0) {
                state['end_time'] = '';
            }
        }
        this.setState(state);
    }
    getTimeDifferInHours = () => {
        var start_time = moment(this.state.start_time);
        var end_time = moment(this.state.end_time);

        const diff = end_time.diff(start_time);
        const diffDuration = moment.duration(diff);
        var dayHours = diffDuration.days() * 24
        return diffDuration.hours() + dayHours;
    }
    onSubmit = (e) => {
        e.preventDefault()
        jQuery('#updateDate').validate();
        if (jQuery('#updateDate').valid()) {
            var difference = this.getTimeDifferInHours();

            if (difference > 24) {
                toast.error(<ToastUndo message={"Shift duration can be maximum 24 hours."} showType={'e'} />, {
                    // toast.error("Shift duration can be maximum 24 hours.", {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                return false;
            } else if (difference < 0) {
                toast.error(<ToastUndo message={"Please check start date time and end date time."} showType={'e'} />, {
                    // toast.error("Please check start date time and end date time.", {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                return false;
            }

            this.setState({ loading: true }, () => {
                postData('crm/CrmParticipant/update_shift_date_time', this.state).then((result) => {
                    if (result.status) {
                        toast.success(<ToastUndo message={'Updated shift date/time successfully'} showType={'s'} />, {
                            // toast.success("Update shift date time successfully", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });

                        this.props.closeModel('date_time', true)
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            // toast.error(result.error, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }
    startDateTime = () => {
        return <DatePicker autoComplete={'off'} dateFormat="dd-MM-yyyy h:mm a" autoComplete="new-password" onChangeRaw={handleDateChangeRaw} placeholderText={"00/00/0000 00:00"} className="text-left"
            selected={this.state.start_time} name="start_time" onChange={(e) => this.selectChange(e, 'start_time')}
            timeIntervals={15} showTimeSelect timeCaption="Time" required={true} name="start_time"
            maxDate={(this.state.end_time) ? moment().add(60, 'days') : moment().add(60, 'days')}
            minDate={moment()}
            minTime={moment().hours(0).minutes(0)}
            maxTime={(this.state.end_time <= this.state.start_time) ? moment(this.state.end_time) : moment().hours(23).minutes(59)} minTime={moment().hours(0).minutes(0)} />
    }
    endDateTime = () => {
        return <DatePicker autoComplete={'off'} dateFormat="dd-MM-yyyy h:mm a" autoComplete="new-password" onChangeRaw={handleDateChangeRaw} placeholderText={"00/00/0000 00:00"} className="text-left"
            selected={this.state.end_time} name="end_time" onChange={(e) => this.selectChange(e, 'end_time')}
            showTimeSelect timeIntervals={15} timeCaption="Time" required={true} name="end_time"
            minDate={this.state.start_time ? moment(this.state.start_time) : moment()} maxDate={(this.state.start_time) ? moment(this.state.start_time).add(1, 'days') : moment().add(60, 'days')}
            minTime={(moment(this.state.start_time).format("DD-MM-YYYY") == moment(this.state.end_time).format("DD-MM-YYYY")) ? moment(this.state.start_time) : moment().hours(0).minutes(0)}
            maxTime={moment().hours(23).minutes(59)} />
    }
    render() {
        //console.log(this.state)
        return (

            <Modal
                className="Modal fade Modal_A Modal_B Crm"
                show={this.props.modal_show}
                onHide={this.handleHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>
                    <form id="updateDate">
                        <div className="text text-left by-1 Popup_h_er_1"><span>Update shift Date</span>
                            <a onClick={() => this.props.closeModel('date_time', false)} className="close_i"><i className="icon icon-cross-icons"></i></a>
                        </div>
                        <div className="row P_25_T">
                            <div className="col-lg-6 col-sm-6">
                                <label>Start Date Time:</label>
                                <span className="required">
                                    {this.startDateTime()}

                                </span>
                            </div>
                            <div className="col-lg-6 col-sm-6">
                                <label>End Date Time:</label>
                                <span className="required">
                                    {this.endDateTime()}
                                </span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-5 P_15_T pull-right">
                                <button disabled={this.state.loading} onClick={this.onSubmit} className="but_submit but_cancel">Update</button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

        )
    }
}



class CancelShift extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cancel_method: 1,
        }
        this.cancel_reason = [{ label: 'Can’t Afford to Get to Shift', value: 'Can’t Afford to Get to Shift' }, { label: 'My cousin will handle', value: 'My cousin will handle' }];

    }

    selectChange = (key, value) => {
        var state = {}
        state[key] = value;
        state[key + '_error'] = false;
        if (key == 'cancel_type') {
            this.getCancelPerson(value);
            this.setState({ cancel_person: '', onCancelPerson: false });
        }
        this.setState(state);
    }
    getCancelPerson = (cancel_type) => {
        if ((cancel_type == 'kin' || cancel_type == 'booker') && (this.props.booked_by == 2 || this.props.booked_by == 3)) {
            var request = { cancel_type: cancel_type, shiftId: this.props.shiftId, booked_by: this.props.booked_by };
            postData('schedule/Shift_Schedule/get_canceler_list', request).then((result) => {
                if (result.status) {
                    var rst = result.data;
                    if (rst.length > 0) {
                        this.setState({ cancel_person: rst[0].value, cancelerList: rst });
                    }
                    this.setState({ onCancelPerson: true })
                }
            });
        }
    }
    onSubmit = (e) => {
        e.preventDefault()
        var status = true;
        if (!this.state.cancel_type) { this.setState({ cancel_type_error: true }); status = false }
        if (!this.state.reason) { this.setState({ reason_error: true }); status = false }
        if ((this.state.cancel_type == 'kin' || this.state.cancel_type == 'booker') && !this.state.cancel_person) { this.setState({ cancel_person_error: true }); status = false }
        jQuery('#cancel_shift').validate();

        if (jQuery('#cancel_shift').valid() && status) {

            this.setState({ loading: true }, () => {
                var request = { shiftId: this.props.shiftId, cancel_type: this.state.cancel_type, reason: this.state.reason, cancel_method: this.state.cancel_method, cancel_person: this.state.cancel_person }
                postData('schedule/ScheduleDashboard/cancel_shift', request).then((result) => {
                    if (result.status) {
                        toast.success(<ToastUndo message={'Shift Cancelled Successfully'} showType={'s'} />, {
                            // toast.success("Shift cancel successfully", {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.props.closeModel('cancel_shift', true);
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }

    errorShowInTooltip($key, msg) {
        return (this.state[$key + '_error']) ? <div className={'tooltip custom-tooltip fade top in' + ((this.state[$key + '_error']) ? ' select-validation-error' : '')} role="tooltip">
            <div className="tooltip-arrow"></div><div className="tooltip-inner">{msg}.</div></div> : '';
    }
    render() {
        return (
            <div>
                <Modal
                    className="Modal fade Modal_A Modal_B Schedule_Module"
                    show={this.props.modal_show}
                    onHide={this.handleHide}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <form id="cancel_shift">
                            <div className="text text-left by-1 Popup_h_er_1"><span>Cancelling '{this.props.participantName}'s' Shift for: 12/12/2018</span>
                                <a onClick={() => this.props.closeModel('cancel_shift', false)} className="close_i"><i className="icon icon-cross-icons"></i></a>
                            </div>
                            <h4 className="P_20_T h4_edit__">Please give a reason for this cancellation</h4>
                            <div className="row P_15_T">
                                <div className="col-sm-6 mb-3">
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <label>Who Cancelled?</label>
                                            <span className="required">
                                                <Select clearable={false} className="custom_select" simpleValue={true} required={true} searchable={false} value={this.state['cancel_type']} onChange={(e) => this.selectChange('cancel_type', e)}
                                                    options={cancelShiftWhoOption('', this.props.booked_by, this.props.status)} placeholder="Please Select" />
                                                {this.errorShowInTooltip('cancel_type', 'This field is required')}
                                            </span>
                                        </div>
                                        <div className="col-md-12">
                                            {this.state.onCancelPerson ? <div>
                                                <label>List of '{this.props.participantName}'s'  Bookers</label>
                                                <span className="required">
                                                    <Select clearable={false} className="custom_select" simpleValue={true} required={true} searchable={false} value={this.state['cancel_person']} onChange={(e) => this.selectChange('cancel_person', e)}
                                                        options={this.state.cancelerList} placeholder="Please Select" />
                                                    {this.errorShowInTooltip('cancel_person', 'This field is required')}</span></div> : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <div className="row">
                                        <div className="col-sm-12 mb-4">
                                            <label>Cancel Method?</label>
                                            <span className="required">
                                                <Select clearable={false} className="custom_select" simpleValue={true} required={true} searchable={false} value={this.state['cancel_method']} onChange={(e) => this.selectChange('cancel_method', e)}
                                                    options={cancelShiftMethod()} placeholder="Please Select" />
                                            </span>
                                        </div>
                                        <div className="col-sm-12">
                                            <label>Cancellation Reason:</label>
                                            <span className="required">
                                                <Select clearable={false} className="custom_select" simpleValue={true} required={true} searchable={false} value={this.state['reason']} onChange={(e) => this.selectChange('reason', e)}
                                                    options={this.cancel_reason} placeholder="Please Select" />
                                                {this.errorShowInTooltip('reason', 'Please select reason')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6 col-sm-offset-6 P_25_T">
                                    <button onClick={this.onSubmit} disabled={this.state.loading} className="but_submit but_cancel">Cancel Shift</button>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default Editshift;
