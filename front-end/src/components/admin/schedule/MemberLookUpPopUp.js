import React, { Component } from 'react';
import { postData, handleDateChangeRaw, handleShareholderNameChange, getOptionsMember, toastMessageShow } from 'service/common.js';
import Select, { Async } from 'react-select-plus';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/lib/Modal';

import { availableMemberLookup, availableMemberMatches } from '../../../dropdown/ScheduleDropdown.js';

class MemberLookUpPopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allocate_to: [],
            member_lookup: "highest_matched",
            memberLimit: 3
        }
    }

    componentDidMount(newProps) {
        this.getAllocatedMember();
    }

    assign_member = (index, value) => {
        if (value) {
            var allocate_to = this.state.allocate_to.map((val, id) => {
                val.access = false;
                return val;
            });
            this.setState({ allocate_to: allocate_to }, () => {
                handleShareholderNameChange(this, 'allocate_to', index, 'access', value);
            });
        }
    }

    getAllocatedMember() {
        var Request = { shiftId: this.props.shiftId, memberLimit: this.state.memberLimit, member_lookup: this.state.member_lookup };
        postData('schedule/Shift_Schedule/get_nearest_shift_member', Request).then((result) => {
            if (result.status) {
                this.setState({ allocate_to: result.data });
            }
        });
    }

    onSubmit(e) {
        var checkSelect = false;
        this.state.allocate_to.map((val, id) => {
            if (val.access == true) {
                checkSelect = true
            }
        });

        if (checkSelect) {
            var Request = { shiftId: this.props.shiftId, allocate_to: this.state.allocate_to }
            postData('schedule/Shift_Schedule/allot_member_to_shift', Request).then((result) => {
                if (result.status) {
                    toastMessageShow("Shift re-assigned to member successfully.", "s");
                    this.props.closeModel('member_lookUp', true);
                }
            });
        }
        else {
            toast.error("Please select atleast one Member to continue.", {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }
    }

    render() {
        return (
            <div>
                <Modal
                    className="Modal fade Modal_A Modal_B"
                    show={this.props.modal_show}
                    onHide={this.handleHide}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <div className="lock_icon">
                            <i className="icon icon-circule fill_shifts_icons color"></i>
                        </div>

                        <div className="text text-center color by-1 Popup_h_er_1">
                            <span> Available Member Look-Up:</span>
                            <a onClick={() => this.props.closeModel('member_lookUp', false)} className="close_i"><i className="icon icon-cross-icons"></i></a></div>

                        <div className="row mt-5">
                            <div className="col-sm-5">
                                <label className="label_2_1_1 f-bold">Filter by:</label>
                                <Select name="member_lookup" required={true} simpleValue={true} searchable={false} clearable={false} options={availableMemberLookup()} placeholder='Matched option' value={this.state.member_lookup} onChange={(e) => this.setState({ 'member_lookup': e }, () => { this.getAllocatedMember() })} />
                            </div>

                            <div className="col-sm-3">
                                <label className="label_2_1_1 f-bold">Show:</label>
                                <div className="sLT_gray left left-aRRow">
                                    <Select name="memberLimit" required={true} simpleValue={true} searchable={false} clearable={false} options={availableMemberMatches()} placeholder='Matched option' value={this.state.memberLimit} onChange={(e) => this.setState({ 'memberLimit': e }, () => { this.getAllocatedMember() })} />
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-12">
                                <table className="available_member_table_parent  w-100">
                                    <tbody>
                                        {(this.state.allocate_to.length > 0) ?
                                            this.state.allocate_to.map((value, idx) => (
                                                <tr key={idx + 1}>
                                                    <td className="px-3 py-3">{value.memberName}</td>
                                                    <td align="right" className="px-3 pt-2">

                                                        <label className="CU_input">
                                                            <input type="checkbox" checked={value.access || ''} onChange={(e) => this.assign_member(idx, e.target.checked)} disabled="" />
                                                            <i className="CU_input__img"></i>
                                                        </label>

                                                    </td>
                                                </tr>
                                            )) : <div className="no_record py-2">No record found.</div>
                                        }
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        <div className="bt-1 my-3"></div>
                        <div className="row d-flex justify-content-end">
                            <div className="col-sm-4 mt-3">
                                {this.state.allocate_to.length > 0 ? <button className="but_submit" onClick={(e) => this.onSubmit(e)}>Finished</button> : ''}
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default MemberLookUpPopUp;
