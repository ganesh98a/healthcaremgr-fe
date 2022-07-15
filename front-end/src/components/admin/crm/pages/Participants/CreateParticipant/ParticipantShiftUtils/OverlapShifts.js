
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import { changeTimeZone } from '../../../../../../../service/common.js';


class OverlapShifts extends React.Component {

    render() {
        // console.log(this.props);
        return <div>
            <Modal
                className="Modal fade Modal_A Modal_B Crm big_modal"
                show={this.props.modal_show}
                onHide={this.handleHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>

                    <div className="dis_cell collaspe_roster">
                        <div className="text text-left by-1 Popup_h_er_1"><span>Saving New Roster</span>
                            <a onClick={() => this.props.selectChange(false, 'modal_collapse_shift')} className="close_i">
                                <i className="icon icon-cross-icons"></i></a>
                        </div>
                        <h4 className="P_20_T h4_edit__">Please select the shifts to keep or discard from this Participants current <br />DEFAULT roster. </h4>
                        <small><i>*Please note, any shifts you discard will automatically be cancelled. </i></small>

                        <div className="flex P_15_T">
                            <div className="col border_dotted_right">
                                <div className="flex"><h3 className="w-100 text-center py-4 by-1">Previous Shifts:</h3></div>
                            </div>

                            <div className="col">
                                <div className="flex"><h3 className="w-100 text-center py-4 by-1">New Shifts:</h3></div>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="col border_dotted_right">
                                <div className="flex make_header  pr-3 bb-1">
                                    <div className="col-1 py-3 px-3 color font_w_4 br-1">
                                        <span>
                                            <input type="checkbox" className="checkbox_flex" name="" checked={this.props.collapseSelect == 1 ? true : false} onChange={() => this.props.checkboxResolveCollapse('', 1, true)} />
                                            <label htmlFor="zw"><span onClick={() => this.props.checkboxResolveCollapse('', 1, true)} className="mx-0"></span></label>
                                        </span>
                                    </div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">Date:</div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">Start:</div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">Duration:</div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">End:</div>
                                    <div className="col-3 py-3 px-3 color font_w_4">Status</div>
                                </div>
                            </div>

                            <div className="col">
                                <div className="flex make_header  pl-3 bb-1">
                                    <div className="col-1 py-3 px-3 color font_w_4 br-1">
                                        <span>
                                            <input type="checkbox" className="checkbox_flex" name="" checked={this.props.collapseSelect == 2 ? true : false} onChange={() => this.props.checkboxResolveCollapse('', 2, true)} />
                                            <label htmlFor="z"><span onClick={() => this.props.checkboxResolveCollapse('', 2, true)} className="mx-0"></span></label>
                                        </span>
                                    </div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">Date:</div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">Start:</div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">Duration:</div>
                                    <div className="col-2 py-3 px-3 color font_w_4 br-1">End:</div>
                                    <div className="col-3 py-3 px-3 color font_w_4">Status</div>
                                </div>

                            </div>
                        </div>

                        {this.props.collapse_shift.map((shift, id) => (
                            (shift.is_collapse) ?
                                <div key={id + 1} className="flex">

                                    <div className="col pdd-b border_dotted_right align-self-center">
                                        {shift.old.map((oldShift, index) => (
                                            <div className="flex make_up radi_1 mt-3 mr-3">
                                                <div className="col-1 py-2 px-3 br-1">
                                                    <span>
                                                        <input type="checkbox" className="checkbox_flex" name="" checked={(oldShift.active) ? true : false} onChange={() => this.props.checkboxResolveCollapse(id, 1, false, 'old', index)} />
                                                        <label for="a"><span className="mx-0" onClick={() => this.props.checkboxResolveCollapse(id, 1, false, 'old', index)} ></span></label>
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
                                        <div className="flex make_up radi_1 mt-3 ml-3">
                                            <div className="col-1 py-2 px-3 br-1">
                                                <span>
                                                    <input type="checkbox" className="checkbox_flex" checked={(shift.status == 2) ? true : false} name="" onChange={() => this.props.checkboxResolveCollapse(id, 2)} />
                                                    <label htmlFor="g"><span onClick={() => this.props.checkboxResolveCollapse(id, 2)} className="mx-0"></span></label>
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

export default OverlapShifts;