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
import { changeTimeZone, handleDateChangeRaw, checkItsNotLoggedIn, postData, handleRemoveShareholder, getOptionsSiteName, getOptionsParticipant } from 'service/common.js';
import { Link, Redirect } from 'react-router-dom';

import 'react-block-ui/style.css';
import BlockUi from 'react-block-ui';
import { connect } from 'react-redux'
import { setRosterDetails } from './../actions/ScheduleAction';
import { onChange } from './../actions/CreateRosterAction';
import SchedulePage from './../SchedulePage';
import { ROUTER_PATH } from 'config.js';
import SimpleBar from "simplebar-react";

class OverlapShiftsPopUp extends React.Component {

    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B Schedule_Module big_modal overlap_shift_popup_Modal"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>

                <div className="dis_cell collaspe_roster save_new_roster_model">
                    <div className="text text-left by-1 Popup_h_er_1"><span>Saving New Roster</span>
                        <a disabled={this.props.loading} onClick={() => this.props.selectChange(false, 'modal_collapse_shift')} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Please select the shifts to keep or discard from this Participants current <br />DEFAULT roster. </h4>
                    <small><i>*Please note, any shifts you discard will automatically be cancelled. </i></small>

                    <div className="d-flex P_15_T bt-1 mt-5">
                        <div className="col pr-5">
                            <div className="d-flex"><h3 className="w-100 text-center py-4 ">Previous Shifts:</h3></div>
                        </div>

                        <div className="col pl-5">
                            <div className="d-flex"><h3 className="w-100 text-center py-4 ">New Shifts:</h3></div>
                        </div>
                    </div>

                    <div className="d-flex">
                        <div className="col pr-5">
                            <div className="d-flex make_header">
                                <div className="col-1 px-3 color font_w_4 br-1 text-center">
                                    <span>
                                        <input type="checkbox" className="checkbox_flex" name="" checked={this.props.collapseSelect == 1 ? true : false} onChange={() => this.props.checkboxResolveCollapse('', 1, true)} />
                                        <label htmlFor="zw" style={{ marginBottom: '0' }}><span onClick={() => this.props.checkboxResolveCollapse('', 1, true)} className="mx-0"></span></label>
                                    </span>
                                </div>
                                <div className="col-3 px-3 color font_w_4 br-1 text-center">Date:</div>
                                <div className="col-2 px-3 color font_w_4 br-1 text-center">Start:</div>
                                <div className="col-2 px-3 color font_w_4 br-1 text-center">Duration:</div>
                                <div className="col-2 px-3 color font_w_4 br-1  text-center">End:</div>
                                <div className="col-2 px-3 color font_w_4  text-center">Status</div>
                            </div>
                        </div>

                        <div className="col pl-5">
                            <div className="d-flex make_header">
                                <div className="col-1 px-3 color font_w_4 br-1  text-center">
                                    <span>
                                        <input type="checkbox" className="checkbox_flex" name="" checked={this.props.collapseSelect == 2 ? true : false} onChange={() => this.props.checkboxResolveCollapse('', 2, true)} />
                                        <label htmlFor="z" style={{ marginBottom: '0' }}><span onClick={() => this.props.checkboxResolveCollapse('', 2, true)} className="mx-0"></span></label>
                                    </span>
                                </div>
                                <div className="col-3 px-3 color font_w_4 br-1 text-center">Date:</div>
                                <div className="col-2 px-3 color font_w_4 br-1 text-center">Start:</div>
                                <div className="col-2 px-3 color font_w_4 br-1 text-center">Duration:</div>
                                <div className="col-2 px-3 color font_w_4 br-1 text-center">End:</div>
                                <div className="col-2 px-3 color font_w_4 text-center">Status</div>
                            </div>

                        </div>
                    </div>

                    {this.props.collapse_shift.map((shift, id) => (
                        (shift.is_collapse) ?
                            <div key={id + 1} className="d-flex save_new_roster_table_">


                                <div className="col pdd-b pr-5 align-self-center">
                                    {shift.old.map((oldShift, index) => (
                                        <div className="d-flex make_up radi_1 mt-3 mr-0">
                                            <div className="col-1 py-2 px-3 br-1">
                                                <span>
                                                    <input type="checkbox" className="checkbox_flex" name={id+"old"+index} checked={(oldShift.active) ? true : false} onChange={() => this.props.checkboxResolveCollapse(id, 1, false, 'old', index)} />
                                                    <label for="a" style={{ marginBottom: '0' }}><span className="mx-0" onClick={() => this.props.checkboxResolveCollapse(id, 1, false, 'old', index)} ></span></label>
                                                </span>
                                            </div>
                                            <div className="col-3 py-2 px-3 br-1">{changeTimeZone(oldShift.shift_date)}</div>
                                            <div className="col-2 py-2 px-3 br-1">{changeTimeZone(oldShift.start_time, "LT")}</div>
                                            <div className="col-2 py-2 px-3 br-1">{oldShift.duration}</div>
                                            <div className="col-2 py-2 px-3 br-1">{changeTimeZone(oldShift.end_time, "LT")}</div>
                                            <div className="col-2 py-2 px-3">
                                                {
                                                    (
                                                        oldShift.status == 'Unfilled' ?
                                                            <span className="short_buttons_01">{oldShift.status}</span>
                                                            :
                                                            oldShift.status == 'Unconfirmed' ?
                                                                <span className="short_buttons_01 btn_color_unavailable">{oldShift.status}</span>
                                                                :
                                                                <span className="short_buttons_01 btn_color_avaiable">{oldShift.status}</span>
                                                    )
                                                }

                                                {/* <span className={"short_buttons_01 mx-1"}>{oldShift.status}</span> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>


                                <div className="col pdd-b pl-5 align-self-center">
                                    <div className="d-flex make_up radi_1 mt-3 ml-0">
                                        <div className="col-1 py-2 px-3 br-1">
                                            <span>
                                                <input type="checkbox" className="checkbox_flex" checked={(shift.status == 2) ? true : false} name="" onChange={() => this.props.checkboxResolveCollapse(id, 2)} />
                                                <label htmlFor="g" style={{ marginBottom: '0' }}><span onClick={() => this.props.checkboxResolveCollapse(id, 2)} className="mx-0"></span></label>
                                            </span>
                                        </div>
                                        <div className="col-3 py-2 px-3 br-1">{changeTimeZone(shift.new.shift_date)}</div>
                                        <div className="col-2 py-2 px-3 br-1">{changeTimeZone(shift.new.start_time, "LT")}</div>
                                        <div className="col-2 py-2 px-3 br-1">{shift.new.duration}</div>
                                        <div className="col-2 py-2 px-3 br-1">{changeTimeZone(shift.new.end_time, "LT")}</div>
                                        <div className="col-2 py-2 px-3">
                                            {
                                                (
                                                    shift.new.status == 'Unfilled' ?
                                                        <span className="short_buttons_01">{shift.new.status}</span>
                                                        :
                                                        shift.new.status == 'Unconfirmed' ?
                                                            <span className="short_buttons_01 btn_color_unavailable">{shift.new.status}</span>
                                                            :

                                                            <span className="short_buttons_01 btn_color_avaiable">{shift.new.status}</span>
                                                )
                                            }
                                        </div>
                                    </div>

                                </div>
                            </div> : ''
                    ))}

                    <div className="bb-1 mt-5 pt-3"></div>
                    <div className="row after_before_remove P_25_T d-flex flex-wrap justify-content-end">
                        <div className="col-md-2 align-self-end">
                            <button disabled={this.props.loading} className="button_set0 w-100">Cancel</button>
                        </div>
                        <div className="col-md-2 ">
                            {this.props.loading ? <span>Please wait...</span> : ''}
                            <button disabled={this.props.loading} className="but_submit" onClick={this.props.saveRoster}>Finish & Save</button>
                        </div>
                    </div>

                </div>


            </Modal.Body>
        </Modal>
        </div>;
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
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(OverlapShiftsPopUp);