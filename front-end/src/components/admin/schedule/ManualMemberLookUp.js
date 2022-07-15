import React, { Component } from 'react';
import {postData, handleShareholderNameChange, handleAddShareholder, handleRemoveShareholder, toastMessageShow} from 'service/common.js';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Modal from 'react-bootstrap/lib/Modal';
import jQuery from "jquery";

import "react-placeholder/lib/reactPlaceholder.css";
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastUndo } from 'service/ToastUndo.js'


const getOptionsMember = (e, shiftId) => {
    if (!e){
        return Promise.resolve({options: []});
    }
    return  postData('schedule/Shift_Schedule/get_manual_member_look_up_for_shift', {search: e, shiftId: shiftId}).then((result) => {
        if (result.status) {
                return {options: result.data};
            }
        });
    }

class ManualMemberLookUp extends Component {
    constructor(props) {

        super(props);
        this.state = {
            members: [{member: ''}]
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
         jQuery('#manual_member_assign').validate({ ignore: [] });
        if (jQuery('#manual_member_assign').valid()) {
            postData('schedule/Shift_Schedule/assing_member_manual', {...this.state, ...this.props}).then((result) => {
                if (result.status) {
                    toastMessageShow("Shift assigned to member successfully.", "s");

                    this.props.closeModel('manual_assign', true)
                }else{
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                 }
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
                    <div className="dis_cell">
                        <form id="manual_member_assign">
                        <div className="text text-left by-1 Popup_h_er_1"><span>Assign Member:</span>
                        <a onClick={() => this.props.closeModel('manual_assign', false)} className="close_i"><i className="icon icon-cross-icons"></i></a>
                        </div>
                        {this.state.members.map((value, idx) => (
                            <div className="row P_25_T" key={idx}>
                                <div className="col-sm-6">
                                <span className="required">
                                    <div className="search_icons_right modify_select">
                                        <Select.Async
                                            cache={false}
                                            className="default_validation" required={true}
                                            name={"form-field-name"+idx}
                                            value={value.member}
                                            clearable={false}
                                            loadOptions={(e) => getOptionsMember(e, this.props.shiftId)}
                                            placeholder='Preffered member'
                                            onChange={(e) => handleShareholderNameChange(this, 'members', idx, 'member', e)}
                                        />
                                    </div>
                                    </span>
                                </div>
                                <div className="col-lg-2 col-sm-2 mt-1">
                                    {idx > 0 ? <button onClick={(e) => handleRemoveShareholder(this, e, idx, 'members')} className="button_unadd">
                                        <i className="icon icon-decrease-icon icon_cancel_1" ></i>
                                    </button> : (this.state.members.length == 1) ? '' : <button className="add_i_icon" onClick={(e) => handleAddShareholder(this, e, 'members', value)}>
                                        <i className="icon icon-add-icons" ></i>
                                    </button>
                                    }
                                </div>
                            </div>
                        ))
                        }
                        <div className="row">
                            <div className="col-sm-5 col-sm-offset-7 P_15_T">
                                <button onClick={this.onSubmit} className="but_submit">Save Changes</button>
                            </div>
                        </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
            </div>
        )
    }
}

export default ManualMemberLookUp;