import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

import { changeTimeZone, postData, archiveALL, getShiftTimerColor, handleChangeSelectDatepicker, handleDateChangeRaw, downloadFile } from 'service/common.js';
import moment from 'moment';
import { confirmBy } from 'dropdown/ScheduleDropdown.js';
import Countdown from 'react-countdown-now';
import Modal from 'react-bootstrap/lib/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jQuery from "jquery";
import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { custNumberLine, customHeading } from 'service/CustomContentLoader.js';

import { connect } from 'react-redux'
import { getShiftDetails } from './actions/ScheduleAction';
import SchedulePage from './SchedulePage';
import { SchedulePageIconTitle, ParticiapntPageIconTitle } from 'menujson/pagetitle_json';
import { ToastUndo } from 'service/ToastUndo.js'

import MemberLookUpPopUp from './MemberLookUpPopUp';
import ManualMemberLookUp from './ManualMemberLookUp';
import CancelShiftPopUp from './CancelShiftPopUp';
import UpdateShiftPrefferedMemberPopUp from './UpdateShiftPrefferedMemberPopUp';
import UpdateShiftRequirementPopUp from './UpdateShiftRequirementPopUp';
import UpdateShiftAddressPopUp from './UpdateShiftAddressPopUp';
import UpdateShiftDateTImePopUp from './UpdateShiftDateTImePopUp';
import DatePicker from 'react-datepicker';
import { BASE_URL } from 'config.js';
import { ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import ContactPopup from './ContactPopup'


class ScheduleDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            back_url: this.props.props.location.state,
            contactDetails: false
        }
    }

    componentDidMount() {
        var shiftId = this.props.props.match.params.id
        this.props.getShiftDetails({ id: shiftId }, true);
    }

    render() {
        return (
            <React.Fragment>
                <SchedulePage pageTypeParms={'schedule_details'} />


                <div className="row  _Common_back_a">
                    <div className="col-lg-12 col-md-12">
                        <Link className="d-inline-flex" to={((this.props.props.location.state) ? this.props.props.location.state : '/admin/schedule/unfilled/unfilled')}><div className="icon icon-back-arrow back_arrow"></div></Link>
                    </div>
                </div>
                <div className="row"><div className="col-lg-12 col-md-12"><div className="bor_T"></div></div></div>


                <div className="row">
                    <div className="col-lg-12 col-sm-12 P_15_TB text-center">

                        <h1 className="color">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(20, 'center')} ready={!this.props.is_loading}>
                                Shift ID<span> - {this.props.id}</span>
                            </ReactPlaceholder>
                        </h1>

                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(60, 'center')} ready={!this.props.is_loading}>
                            <ul className="user_info P_15_T">
                                <li> Date: <span>{changeTimeZone(this.props.shift_date)}</span></li>
                                <li> {this.props.booked_for}: <span>{this.props.shift_for || "N/A"}</span></li>
                                <li> Start:  <span>{changeTimeZone(this.props.start_time, "LT")}</span></li>
                                <li> Duration: <span>{this.props.duration}</span></li>
                                <li> End: <span>{changeTimeZone(this.props.end_time, "LT")}</span></li>
                                <li> Suburb: <span>{(this.props.shift_location.length > 0) ? this.props.shift_location[0].suburb : 'N/A'}</span></li>
                            </ul>
                        </ReactPlaceholder>
                        {/*(this.props.status == 7) ? 'Confirmed' : ''*/}
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(20, 'center')} ready={!this.props.is_loading}>
                            <h2 className={"shift_start_heading pt-3 " + (getShiftTimerColor(this.props.start_time))}>
                                {(this.props.status == 7) ? <span className="g_heading_color">Confirmed - </span> : ''}
                                <span>Starts In:</span> <span className={""}> <Countdown date={moment() + this.props.diff} /></span>
                            </h2>
                        </ReactPlaceholder>
                    </div>

                    <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                </div>

                <div className="row">
                    <div className="col-lg-2 col-md-0"></div>
                    <ul className="nav nav-tabs Category_tap col-lg-8 col-sm-12 P_20_TB" role="tablist">
                        <li role="presentation" className="col-lg-3 col-sm-3 col-xs-12 active">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70)} ready={!this.props.is_loading}>
                                <a href="#Shift_Details" aria-controls="Shift_Details" role="tab" data-toggle="tab">Shift Details</a>
                            </ReactPlaceholder>
                        </li>
                        <li role="presentation" className="col-lg-3 col-sm-3 col-xs-12">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70)} ready={!this.props.is_loading}>
                                <a href="#booking_details" aria-controls="booking_details" role="tab" data-toggle="tab">Booking Details</a>
                            </ReactPlaceholder>
                        </li>
                        <li role="presentation" className="col-lg-3 col-sm-3 col-xs-12">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70)} ready={!this.props.is_loading}>
                                <a href="#notes" aria-controls="notes" role="tab" data-toggle="tab">Notes</a>
                            </ReactPlaceholder>
                        </li>
                        <li role="presentation" className="col-lg-3 col-sm-3 col-xs-12">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70)} ready={!this.props.is_loading}>
                                <a href="#confirmation" aria-controls="confirmation" role="tab" data-toggle="tab">Confirmation Details</a>
                            </ReactPlaceholder>
                        </li>
                    </ul>

                    <div className="col-lg-3"></div>

                    <div className="col-lg-12 col-sm-12"><div className="bor_T"></div></div>
                </div>


                <div className="row">
                    <div className="tab-content">
                        <ShiftDetais />
                        <BookingDetais back_url={this.state.back_url} />
                        <Notes shiftId={this.props.props.match.params.id} back_url={this.state.back_url} />
                        <ConfirmationDetails shiftId={this.props.props.match.params.id} back_url={this.state.back_url} />
                    </div>
                </div>

            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    showTypePage: state.MemberReducer.activePage.pageType,
    ...state.ScheduleDetailsData.shfit_details,
    is_loading: state.ScheduleDetailsData.is_loading,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getShiftDetails: (request, is_loading) => dispach(getShiftDetails(request, is_loading))
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ScheduleDetails)


class ShiftDetaisComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    closeModel = (type, mode) => {
        var state = {};
        state['modal_show_' + type] = false;
        this.setState(state);
        if (mode) {
            this.props.getShiftDetails({ id: this.props.id });
        }
    }

    render() {
        var shift_status = this.props.status;
        let org_shift_data = { 'org_shift_data': [] };
        if (this.props.booked_by == 1 || this.props.booked_by == 7) {
            org_shift_data['org_shift_data'] = this.props.org_shift_data;
        }
        return (
            <div role="tabpanel" className="tab-pane active" id="Shift_Details">
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-md-12 text-center py-3">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(40, 'center')} ready={!this.props.is_loading}><h2>All Shift Details:</h2></ReactPlaceholder>
                        </div>
                        <div className="col-md-12"><div className="bor_T"></div></div>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="row d-flex flex-wrap justify-content-center after_before_remove">
                        <div className="col-lg-9 col-md-9 pt-5">
                            <ReactPlaceholder showLoadingAnimation={true} type='textRow' customPlaceholder={custNumberLine(8)} ready={!this.props.is_loading}>

                                <div className="list_shift_AZ__">

                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Date: </span>{changeTimeZone(this.props.shift_date)}</div>
                                        {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list"> {/* <button title={ParticiapntPageIconTitle.par_update_icon} className="default_but_remove" onClick={() => this.setState({ modal_show_date_time: true })}>
                                            <i className="icon icon-done-arrow"></i></button> */}
                                        </div>}
                                    </div>

                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">{this.props.booked_for}: </span> {this.props.shift_for || "N/A"}</div>
                                        <div className="td_list"></div>
                                    </div>

                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Start: </span>{changeTimeZone(this.props.start_time, "LT")}</div>
                                        {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list">
                                            {/* <button title={ParticiapntPageIconTitle.par_update_icon} className="default_but_remove" onClick={() => this.setState({ modal_show_date_time: true })} data-toggle="modal" data-target="#modal_1">
                                                <i className="icon icon-done-arrow"></i></button> */}
                                        </div>}
                                    </div>
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">Duration: </span>{this.props.duration}</div>
                                        <div className="td_list"></div>
                                    </div>
                                    <div className="tr_list">
                                        <div className="td_list"><span className="color">End: </span>{changeTimeZone(this.props.end_time, "LT")}</div>
                                        {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list">
                                            {/* <button title={ParticiapntPageIconTitle.par_update_icon} className="default_but_remove" onClick={() => this.setState({ modal_show_date_time: true })}>
                                                <i className="icon icon-done-arrow"></i></button> */}
                                        </div>}
                                    </div>
                                    {this.props.shift_location.map((address, index) => (
                                        <div className="tr_list" key={index + 1}>
                                            <div className="td_list"><span className="color">Location: </span> {address.site}</div>
                                            {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list">
                                                {/* <button title={ParticiapntPageIconTitle.par_update_icon} className="default_but_remove" onClick={() => this.setState({ modal_show_address: true })}>
                                                    <i className="icon icon-done-arrow"></i></button> */}
                                            </div>}
                                        </div>
                                    ))}
                                    <div className="tr_list">
                                        <div className="td_list" style={{ whiteSpace: "pre-line" }}><span className="color">Requirements: </span>{this.props.shift_requirement}</div>
                                        {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list">
                                            <button title={ParticiapntPageIconTitle.par_update_icon} className="default_but_remove" onClick={() => this.setState({ modal_show_requirement: true })}>
                                                <i className="icon icon-edit3-ie f-18 color"></i></button>
                                        </div>}
                                    </div>

                                    {this.props.preferred_member.map((member, index) => (
                                        <div className="tr_list" key={index + 1}>
                                            <div className="td_list"><span className="color">Prefered Member: </span>{member.memberName}</div>
                                            {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list">
                                                <button title={ParticiapntPageIconTitle.par_update_icon} className="default_but_remove" onClick={() => this.setState({ modal_show_preffered_member: true })}>
                                                    <i className="icon icon-edit3-ie f-18 color"></i></button>
                                            </div>}
                                        </div>
                                    ))}

                                    {(this.props.allocated_member.length > 0 && this.props.status == 2) ?
                                        this.props.allocated_member.map((member, index) => (
                                            <div className="tr_list" key={index + 1}>
                                                <div className="td_list"><span className="color">Allocated To: </span>{member.memberName}  {(member.preferred == 1) ? '- Preferred' : ''}</div>
                                                {(shift_status == 5 || shift_status == 6) ? "" : <div className="td_list">
                                                    <i onClick={() => this.setState({ modal_show_member_lookUp: true })} className="icon icon-circule color"></i>
                                                </div>}
                                            </div>))
                                        : ''
                                    }

                                    {(this.props.status == 7) ?
                                        this.props.allocated_member.map((member, index) => (
                                            <div className="tr_list" key={index + 1}>
                                                <div className="td_list"><span className="color">Confirm By: </span>{member.memberName}  {(member.preferred == 1) ? '- Preferred' : ''}</div>
                                                <div className="td_list"></div>
                                            </div>)) : ''
                                    }

                                    {(this.props.status == 4) ?
                                        this.props.rejected_data.map((member, index) => (
                                            <div className="tr_list" key={index + 1}>
                                                <div className="td_list"><span className="color">Rejected By: </span>{member.memberName}</div>
                                                <div className="td_list"></div>
                                            </div>)) : ''
                                    }

                                    {(this.props.status == 5) ?
                                        this.props.cancel_data.map((val, index) => (

                                            <div ><div className="tr_list" key={index + 1}>
                                                <div className="td_list"><span className="color">Cancel By: </span>{val.cancel_by}</div>
                                                <div className="td_list"></div>
                                            </div>
                                                <div className="tr_list" key={index + 1}>
                                                    <div className="td_list"><span className="color">Cancel Reason: </span>{val.reason}</div>
                                                    <div className="td_list"></div>
                                                </div></div>)) : ''
                                    }


                                </div>

                            </ReactPlaceholder>
                        </div>
                    </div>

                </div>
                <div className="col-lg-12">
                    <div className="row d-flex flex-wrap justify-content-center after_before_remove">
                        <div className="col-lg-9 col-md-9 mt-5">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(40)} ready={!this.props.is_loading}>
                                <div className="row">
                                    <div className="col-lg-3 col-md-3 ">
                                        <button disabled={(this.props.status == 5 || this.props.status == 6) ? true : false} className="but_submit but_cancel" onClick={() => this.setState({ modal_show_cancel_shift: true })}>Cancel Shift</button></div>

                                </div>
                            </ReactPlaceholder>
                        </div>
                    </div>
                </div>



                {this.state.modal_show_member_lookUp ? <MemberLookUpPopUp modal_show={this.state.modal_show_member_lookUp} closeModel={this.closeModel} shiftId={this.props.id}
                    LookUpttitle={this.props.LookUpttitle} manual_assign={this.state.manual_assign} /> : ""}

                <UpdateShiftPrefferedMemberPopUp modal_show={this.state.modal_show_preffered_member} closeModel={this.closeModel} shiftId={this.props.id} preferred_members={this.props.preferred_member} />

                {this.state.modal_show_requirement ? <UpdateShiftRequirementPopUp modal_show={this.state.modal_show_requirement} closeModel={this.closeModel} booked_by={this.props.booked_by} requirement={this.props.requirement} requirement_mobility={this.props.requirement_mobility} {...org_shift_data} shiftId={this.props.id} /> : ""}

                <UpdateShiftAddressPopUp modal_show={this.state.modal_show_address} closeModel={this.closeModel} shift_location={this.props.shift_location} shiftId={this.props.id} booked_by={this.props.booked_by} />

                <UpdateShiftDateTImePopUp modal_show={this.state.modal_show_date_time} closeModel={this.closeModel} shiftId={this.props.id} shift_date={this.props.start_time} start_time={changeTimeZone(this.props.start_time, "YYYY-MM-DDTHH:mm:ss", true)} end_time={changeTimeZone(this.props.end_time, "YYYY-MM-DDTHH:mm:ss", true)} booked_by={this.props.booked_by} />

                <CancelShiftPopUp modal_show={this.state.modal_show_cancel_shift} status={this.props.status} closeModel={this.closeModel} booked_by={this.props.booked_by} shiftId={this.props.id} participantName={(this.props.shift_participant.length > 0) ? this.props.shift_participant[0].firstname : ''} />
            </div>
        )
    }
}

const mapStateToProps1 = state => ({
    ...state.ScheduleDetailsData.shfit_details,
    is_loading: state.ScheduleDetailsData.is_loading,
})

const mapDispatchtoProps1 = (dispach) => {
    return {
        getShiftDetails: (request) => dispach(getShiftDetails(request))
    }
}

const ShiftDetais = connect(mapStateToProps1, mapDispatchtoProps1)(ShiftDetaisComponent)

class BookingDetaisComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentWillReceiveProps(newProps) {
        this.setState(newProps);
    }

    bookedWay = (val) => {
        if (this.props.shift_caller.booking_method) {
            if (this.props.shift_caller.booking_method == 1) {
                return <span>- <u>{this.props.shift_caller.phone}</u><button className="default_but_remove ml-2"> <span className="icon icon-caller-icons call_icon"></span></button></span>;
            } else if (this.props.shift_caller.booking_method == 2) {
                return <span>- <u>{this.props.shift_caller.email}</u></span>;
            }
        }
    }
    render() {
        return (
            <div role="tabpanel" className="tab-pane" id="booking_details">
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-md-12 text-center py-3"><h2>Booking Details:</h2></div>
                        <div className="col-md-12"><div className="bor_T"></div></div>
                    </div>
                </div>

                <div className="col-lg-4 col-lg-offset-4 col-sm-4 col-sm-offset-4">
                    <div className="booking_details_parent pt-5">
                        <div className="py-3 dotted_line text_child"><span className="color">Booked By: </span>{(this.props.shift_caller.firstname) ? (this.props.shift_caller.firstname + ' ' + this.props.shift_caller.lastname) : 'N/A'}</div>
                        <div className="py-3 dotted_line text_child"><span className="color">Booked On: </span>{changeTimeZone(this.props.created)}</div>
                        <div className="py-3 text_child"><span className="color">Booking Method:</span> {this.props.shift_caller.booking_method ? confirmBy(this.props.shift_caller.booking_method) : 'N/A'} {/*this.bookedWay(this.props.shift_caller.booking_method)*/}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps2 = state => ({
    created: state.ScheduleDetailsData.shfit_details.created,
    shift_caller: state.ScheduleDetailsData.shfit_details.shift_caller,
    confirmation_details: state.ScheduleDetailsData.shfit_details.confirmation_details,
})

const mapDispatchtoProps2 = (dispach) => {
    return {
        getShiftDetails: (request) => dispach(getShiftDetails(request))
    }
}

const BookingDetais = connect(mapStateToProps2, mapDispatchtoProps2)(BookingDetaisComponent)

class NotesComponent extends Component {
    constructor(props) {

        super(props);
        this.state = {
            notes: []
        }
    }

    getShifNotes() {
        postData('schedule/ScheduleDashboard/get_shift_notes', { shiftId: this.props.shiftId }).then((result) => {
            if (result.status) {
                this.setState({ notes: result.data });
            }
        });
    }

    arhchiveNote = (id, index) => {
        var loges = { userId: this.props.shiftId, note: 'Archive notes: Shift Id ' + this.props.shiftId, module: 4 }
        archiveALL({ id: id }, '', 'schedule/Shift_Schedule/archive_shift_notes').then((result) => {
            if (result.status) {
                var state = {}
                state['notes'] = this.state.notes.filter((s, sidx) => index !== sidx);
                this.setState(state);
            }
        })
    }

    onSubmit = (e) => {
        e.preventDefault()
        jQuery('#create_notes').validate({});
        if (jQuery('#create_notes').valid()) {

            this.setState({ loading: true }, () => {
                var data = { id: this.state.id, title: this.state.title, notes: this.state.content, shiftId: this.props.shiftId, note_date: this.state.note_date };

                postData('schedule/ScheduleDashboard/create_shift_notes', data).then((result) => {
                    if (result.status) {
                        this.setState({ modal_show: false });
                        this.getShifNotes();
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }
    componentDidMount() {
        //console.log('here',this.props);
        this.getShifNotes();
    }

    render() {
        var shift_status = this.props.shift_status
        return (
            <div role="tabpanel" className="tab-pane" id="notes">
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-lg-12 text-center py-3"><h2>Internal Shift Notes:</h2></div>
                        <div className="col-lg-12"><div className="bor_T"></div></div>
                    </div>
                </div>

                <div className="col-lg-12">
                    <div className="row d-flex flex-wrap justify-content-center after_before_remove">
                        <div className="col-lg-9 col-sm-12">

                            {(this.state.notes.length > 0) ? this.state.notes.map((note, id) => (
                                <div className="internal_shift_parent mt-4" key={id + 1}>
                                    <div className="row d-flex flex-wrap">
                                        <div className="col-lg-4 col-xs-5 flex_wrap br-1">
                                            <div className="w-100 align-self-start">
                                                <h6 className="px-4 py-3"><span className="color">User:</span> {note.adminId}</h6>
                                            </div>
                                            <div className="w-100 align-self-center color">
                                                <div className="font_w_4 px-4 py-2 text_break_all">{note.title}</div>
                                            </div>
                                            <div className="w-100 align-self-end">
                                                <h6 className="px-4 py-3"><span className="color">Date:</span> {note.note_date}</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg-8 col-xs-7 flex_wrap">
                                            <div className="w-100 align-self-start">
                                                <div className="font_w_4 px-4 pt-3 text_break_all">{note.notes}</div>
                                            </div>
                                            <div className="w-100 align-self-end text-right px-4 pt-1 pb-2">
                                                {(shift_status == 6 || shift_status == 5) ? "" : <button title={'Archive'} onClick={() => this.arhchiveNote(note.id, id)}  className="default_but_remove pr-2 mr-2"><i className="icon icon-archive2-ie f-21 color"></i></button>}
                                                {(shift_status == 6 || shift_status == 5) ? "" : <button title={'Edit'} onClick={() => this.setState({ id: note.id,  title: note.title, content: note.notes, modal_show: true, note_date: moment(note.note_date, 'DD/MM/YYYY') })} className="default_but_remove"><i className="icon icon-edit3-ie f-21 color"></i></button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <div className="internal_shift_parent mt-4" >
                                    <div className=" py-3 px-3 text-center font_w_4">
                                        No Notes Found
                                </div>
                                </div>
                            }
                            <div className="w-100 pt-5 text-right">
                                {(shift_status == 6 || shift_status == 5) ? "" : <span title={SchedulePageIconTitle.internal_shift_notes} onClick={() => this.setState({ modal_show: true, id: '', title: '', content: '', note_date: null })} className="button_plus__"><i className="icon icon-add-icons Add-2-1"></i></span>}
                            </div>

                            <div className="row">
                                <div className="col-lg-3 col-lg-offset-9 col-sm-3 mt-5">
                                    {/*<Link to={((this.props.back_url) ? this.props.back_url : '/admin/schedule/unfilled/unfilled')} className="but_submit w-100 d-block text-center">Return Previous</Link>*/}
                                </div>
                            </div>

                            <Modal
                                className="modal fade Modal_A Modal_B"
                                show={this.state.modal_show}
                                onHide={this.handleHide}
                                container={this}
                                aria-labelledby="contained-modal-title"
                            >
                                <Modal.Body>
                                    <form id="create_notes">

                                        <div className="text text-left Popup_h_er_1">
                                            <span>Internal Shift Notes</span>
                                            <a type="button" className="close_i"><i onClick={() => this.setState({ modal_show: false })} className="icon icon-cross-icons"></i></a>
                                        </div>

                                        <div className="row P_15_T">
                                            <div className="col-md-5">
                                                <label>Title:</label>
                                                <span className="required">
                                                    <input type="text" name="title" onChange={(e) => this.setState({ title: e.target.value })} value={this.state['title'] || ''} data-rule-required="true" />
                                                </span>
                                            </div>
                                            <div className="col-md-5">
                                                <label>Date:</label>
                                                <span className={"required"}>
                                                    <DatePicker
                                                        autoComplete={'off'}
                                                        selected={this.state.note_date}
                                                        required={true}
                                                        name={"note_date"}
                                                        dateFormat="DD/MM/YYYY"
                                                        placeholderText={"DD/MM/YYYY"}
                                                        onChange={(e) => handleChangeSelectDatepicker(this, e, 'note_date')}
                                                        onChangeRaw={handleDateChangeRaw}
                                                    />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="row P_15_T">
                                            <div className="col-md-12">
                                                <label>Notes:</label>
                                                <span className="required">
                                                    <textarea className="col-md-12 min-h-120 textarea-max-size" onChange={(e) => this.setState({ content: e.target.value })} name="content" value={this.state['content'] || ''} data-rule-required="true" data-rule-maxlength="500" ></textarea>
                                                </span>

                                            </div>

                                        </div>

                                        <div className="row P_15_T">
                                            <div className="col-md-7"></div>
                                            <div className="col-md-5">
                                                <input disabled={this.state.loading} type="submit" onClick={this.onSubmit.bind(this)} className="but" value={'Save'} name="content" />
                                            </div>
                                        </div>

                                    </form>
                                </Modal.Body>
                            </Modal>
                        </div>
                    </div>
                </div>


            </div>
        )
    }
}

const mapStateToProps3 = state => ({
    shift_status: state.ScheduleDetailsData.shfit_details.status
})

const mapDispatchtoProps3 = (dispach) => {
    return {
        getShiftDetails: (request) => dispach(getShiftDetails(request))
    }
}

const Notes = connect(mapStateToProps3, mapDispatchtoProps3)(NotesComponent)

class ConfirmationDetailsComponent extends Component {
    constructor(props) {

        super(props);
        this.state = {
            allocatedDeatils: [{ memberName: 'N/A', allocate_on: '' }],
            confirmation_details: {},
            contactAllocated: false,
            contactBooker:false
        }
    }

    callBooker = () => {
        this.setState({
            contactBooker: true
        })
        postData('schedule/ScheduleDashboard/call_booker', { shiftId: this.props.shiftId }).then((result) => {
            if (result.status) {
                this.props.getShiftDetails({ id: this.props.shiftId });
            }
        });
    }

    callAllocated = () => {
        this.setState({
            contactAllocated: true
        })
        postData('schedule/ScheduleDashboard/call_allocated', { shiftId: this.props.shiftId }).then((result) => {
            if (result.status) {
                this.props.getShiftDetails({ id: this.props.shiftId });
            }
        });
    }

    bookedWay = (val) => {
        if (val) {
            if (val == 1) {
                return <span>-<u>{this.state.phone}</u><button className="default_but_remove ml-2"> <span className="icon icon-caller-icons call_icon"></span></button></span>;
            } else if (val == 2) {
                return <span>-<u>{this.state.email}</u></span>;
            }
        }
    }

    submitConfirmationPdf = () => {
        let Request = { shiftId: this.props.shiftId };
        postData('schedule/ScheduleDashboard/confirmation_pdf', Request).then((result) => {
            if (result.status) {
                downloadFile(BASE_URL + 'mediaDownload/' + result.filename);
            }
        })

    }

    render() {
        var shift_status = this.props.shift_status;
        var confirm_by = this.props.confirm_by;
        var confirmed_with_booker = this.props.confirmed_with_booker;

        var confirm_booke_name = "N/A";
        if (this.props.confirmer_name) {
            confirm_booke_name = this.props.confirmer_name + (this.props.confirmer_relation ? (' (' + this.props.confirmer_relation + ')') : "");
        }

        var allocated_member, allocated_on, confirmed_with_allocated, member_phone;
        {
            this.props.allocated_member.map((allocate, index) => {
                member_phone = allocate.member_phone;
                allocated_member = allocate.memberName;
                allocated_on = allocate.allocate_on;
                confirmed_with_allocated = allocate.confirmed_with_allocated ? moment(allocate.confirmed_with_allocated).format("DD/MM/YYYY LT") : "";
            })
        }

        return (
            <div role="tabpanel" className="tab-pane" id="confirmation">
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-lg-12 text-center py-3"><h2>Confirmation Details</h2></div>
                        <div className="col-lg-12"><div className="bor_T"></div></div>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="row d-flex flex-wrap justify-content-center after_before_remove">
                        <div className="col-lg-5 col-sm-6 ">
                            <div className="booking_details_parent pt-5">

                                <div className="py-3 dotted_line text_child"><span className="color">Allocated to member:</span> {allocated_member || "N/A"}</div>
                                <div className="py-3 dotted_line text_child"><span className="color">Allocated to member on:</span> {allocated_on || 'N/A'}</div>
                                <div className="py-3 dotted_line text_child"><span className="color">Confirmed with allocated member on: </span>
                                    {confirmed_with_allocated || 'N/A'}
                                </div>



                                <div className="py-3 dotted_line text_child">
                                    <span className="color">Confirmed with Booker: </span>
                                    {confirm_booke_name || "N/A"}
                                </div>
                                <div className="py-3 dotted_line text_child"><span className="color">Confirmed with Booker on: </span>
                                    {confirmed_with_booker ? moment(confirmed_with_booker).format("DD/MM/YYYY LT") : "N/A"}
                                </div>

                                <div className="py-3 text_child"><span className="color">Confirmed Method: </span>
                                    {(confirm_by) ? (confirmBy(confirm_by)) : 'N/A'} {/*this.bookedWay(confirm_by)*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="row d-flex flex-wrap justify-content-center after_before_remove">
                        <div className="col-lg-5 col-sm-6 ">
                            <div className="row">
                                <div className="col-lg-6 col-sm-6 mt-4">
                                    <a
                                        // href={"tel:" + member_phone}
                                        disabled={(shift_status > 1 && shift_status != 5) ? false : true}
                                        onClick={this.callAllocated} className="btn-1">Contact Allocated</a>
                                </div>
                                <div className="col-lg-6 col-sm-6 mt-4">
                                    <a
                                        // href={"tel:" + this.props.phone}
                                        onClick={this.callBooker}
                                        className="btn-1">Contact Booker</a>
                                </div>
                                <div className="col-lg-6 col-sm-8 mt-4 col-lg-offset-3 col-sm-offset-2">
                                    <div className="but_submit w-100 d-block text-center" onClick={() => this.submitConfirmationPdf()}>Download Confirmation as PDF</div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <ContactPopup title={'Contact Allocated'} show={this.state.contactAllocated} close={() => { this.setState({ contactAllocated: false }) }}>
                        <h2 style={{paddingTop:'30px', paddingBottom:'30px'}} className={'d-flex'}><i className={'icon icon-call3-ie color'} style={{fontSize:'25px', paddingRight:'15px'}}></i> <span>{member_phone}</span></h2>
                    </ContactPopup>
                    <ContactPopup title={'Contact Booker'} show={this.state.contactBooker} close={() => { this.setState({ contactBooker: false }) }}>
                        <h2 style={{paddingTop:'30px', paddingBottom:'30px'}} className={'d-flex'}><i className={'icon icon-call3-ie color'} style={{fontSize:'25px', paddingRight:'15px'}}></i> <span>{this.props.phone}</span></h2>
                    </ContactPopup>


                </div>
            </div>
        )
    }
}

const mapStateToProps4 = state => ({
    shift_status: state.ScheduleDetailsData.shfit_details.status,
    ...state.ScheduleDetailsData.shfit_details.confirmation_details,
    allocated_member: state.ScheduleDetailsData.shfit_details.allocated_member,
})

const mapDispatchtoProps4 = (dispach) => {
    return {
        getShiftDetails: (request) => dispach(getShiftDetails(request))
    }
}

const ConfirmationDetails = connect(mapStateToProps4, mapDispatchtoProps4)(ConfirmationDetailsComponent)