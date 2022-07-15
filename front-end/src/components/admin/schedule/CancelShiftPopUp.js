import React, { Component } from 'react';
import { postData } from 'service/common.js';
import { cancelShiftMethod, cancelShiftWhoOption } from 'dropdown/ScheduleDropdown.js';
import Select from 'react-select-plus';
import Modal from 'react-bootstrap/lib/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jQuery from "jquery";
import "react-placeholder/lib/reactPlaceholder.css";
import { ToastUndo } from 'service/ToastUndo.js'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom';

class CancelShiftPopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cancel_method: '',
        }

        this.cancel_reason = [
            { label: 'Can’t Afford to Get to Shift', value: 'Can’t Afford to Get to Shift' },
            { label: 'My cousin will handle', value: 'My cousin will handle' },
            { label: 'Other', value: 'other' },
        ];

    }

    selectChange = (key, value) => {
        var state = {}
        state[key] = value;
        this.getCancelPerson(value);
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
                }
            });
        }
    }

    onSubmit = (e) => {
        e.preventDefault()
        var status = true;
        jQuery('#cancel_shift').validate();
        if (jQuery('#cancel_shift').valid()) {

            this.setState({ loading: true }, () => {
                var request = { shiftId: this.props.shiftId, ...this.state }
                postData('schedule/ScheduleDashboard/cancel_shift', request).then((result) => {
                    if (result.status) {
                        toast.success(<ToastUndo message={'Shift Cancelled Successfully'} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        if (this.state.cancel_type === "member") {
                            var redirect_url = "/admin/schedule/unfilled/unfilled";
                        } else {
                            var redirect_url = "/admin/schedule/rejected_cancelled/cancelled";
                        }
                        this.setState({ is_redirect: true, redirect_url: redirect_url })
                        this.props.closeModel('cancel_shift', true);
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }

    render() {
        return (
            <div>
                {(this.state.is_redirect) ? <Redirect to={this.state.redirect_url} /> : ''}
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
                            {/* <h4 className="P_20_T h4_edit__">Please give a reason for this cancellation</h4> */}
                            <div className="row P_15_T d-flex justify-content-between after_before_remove">
                                <div className="col-sm-4 mb-3">
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <label className="label_2_1_1 f-bold">Who Cancelled?</label>
                                            <span className="required">
                                                <Select
                                                    clearable={false}
                                                    className="custom_select default_validation"
                                                    simpleValue={true}
                                                    required={true}
                                                    searchable={false}
                                                    value={this.state['cancel_type']}
                                                    onChange={(e) => this.selectChange('cancel_type', e)}
                                                    options={cancelShiftWhoOption('', this.props.booked_by, this.props.status)}
                                                    placeholder="Please Select"
                                                    inputRenderer={() => <input type="text" className="define_input" name={"cancel_type"} required={true} value={this.state.cancel_type} />}
                                                />
                                            </span>
                                        </div>

                                        <div className="col-md-12">
                                            {this.state.cancel_type === 'kin' || this.state.cancel_type === 'booker' ? <div>
                                                <label className="label_2_1_1 f-bold">List of '{this.props.participantName}'s'  Bookers</label>
                                                <span className="required">
                                                    <Select
                                                        clearable={false}
                                                        className="custom_select default_validation"
                                                        simpleValue={true}
                                                        required={true}
                                                        searchable={false}
                                                        value={this.state['cancel_person']}
                                                        onChange={(e) => this.selectChange('cancel_person', e)}
                                                        options={this.state.cancelerList} placeholder="Please Select"
                                                        inputRenderer={() => <input type="text" className="define_input" name={"cancel_person"} required={true} value={this.state.cancel_person} />}
                                                    />
                                                </span></div> : ''}

                                        </div>
                                    </div>
                                </div>


                                <div className="col-sm-4 mb-3">
                                    <div className="row">
                                        <div className="col-sm-12 mb-4">
                                            <label className="label_2_1_1 f-bold">Cancel Method?</label>
                                            <span className="required">
                                                <Select
                                                    clearable={false}
                                                    className="custom_select default_validation"
                                                    simpleValue={true}
                                                    required={true}
                                                    searchable={false}
                                                    value={this.state['cancel_method']} onChange={(e) => this.selectChange('cancel_method', e)}
                                                    options={cancelShiftMethod()} placeholder="Please Select"
                                                    inputRenderer={() => <input type="text" className="define_input" name={"cancel_method"} required={true} value={this.state.cancel_method} />}
                                                />
                                            </span>
                                        </div>

                                        <div className="col-sm-12">
                                            <label className="label_2_1_1 f-bold">Cancellation Reason:</label>
                                            <span className="required">
                                                <Select
                                                    clearable={false}
                                                    className="custom_select default_validation"
                                                    simpleValue={true}
                                                    required={true}
                                                    searchable={false}
                                                    value={this.state.reason}
                                                    onChange={(e) => this.selectChange('reason', e)}
                                                    options={this.cancel_reason} placeholder="Please Select"
                                                    inputRenderer={() => <input type="text" className="define_input" name={"reason"} required={true} value={this.state.reason} />}
                                                />

                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {this.state.reason === 'other' ?
                                    <div className="col-sm-12 mb-3">
                                        <div className="row">
                                            <div className="col-sm-12 mb-4">
                                                <label className="label_2_1_1 f-bold">Other Reason:</label>
                                                <span className="required">
                                                    <textarea
                                                        clearable={false}
                                                        className="csForm_control txt_area brRad10 textarea-max-size bl_bor"
                                                        simpleValue={true}
                                                        required={true}
                                                        searchable={false}
                                                        value={this.state.other_reason}
                                                        onChange={(e) => this.selectChange('other_reason', e.target.value)}
                                                        placeholder="Please Select"
                                                    ></textarea>
                                                </span>
                                            </div>
                                        </div>
                                    </div> : ""}
                            </div>
                            <div className="bt-1 w-100 mt-3"></div>
                            <div className="row  d-flex justify-content-end after_before_remove">
                                <div className="col-sm-4 pt-4">
                                    <button onClick={this.onSubmit} disabled={this.state.loading} className="but_submit but_cancel">Finished</button>
                                </div>
                            </div>

                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = state => ({

})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CancelShiftPopUp)