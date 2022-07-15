import React, { Component } from 'react';
import {postData, handleShareholderNameChange, handleAddShareholder, handleRemoveShareholder, getOptionsMember} from 'service/common.js';
import Select, { Async } from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Modal from 'react-bootstrap/lib/Modal';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jQuery from "jquery";
import { connect } from 'react-redux'
import { ToastUndo } from 'service/ToastUndo.js'


class UpdateShiftPrefferedMemberPopUp extends Component {
    constructor(props) {

        super(props);
        this.state = {
            preferred_members: []
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState(newProps);
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery('#preferred_member_update').validate({ ignore: [] });
        if (jQuery('#preferred_member_update').valid()) {
            postData('schedule/ScheduleDashboard/update_preffered_member', this.state).then((result) => {
                if (result.status) {
                    toast.success(<ToastUndo message={'Update preffered member successfully'} showType={'s'} />, {
                        // toast.success("Update preffered member successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                    this.props.closeModel('preffered_member', true)
                }
            });
        }
    }

    render() {
        return (
            <Modal
                className="Modal fade Modal_A Modal_B Schedule_Module"
                show={this.props.modal_show}
                onHide={this.handleHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>
                    <div className="dis_cell">
                        <form id="preferred_member_update">
                            <div className="text text-left by-1 Popup_h_er_1"><span>Updating Shift Member:</span>
                                <a onClick={() => this.props.closeModel('preffered_member', false)} className="close_i"><i className="icon icon-cross-icons"></i></a>
                            </div>
                            {this.state.preferred_members.map((value, idx) => (
                                <div className="row P_25_T" key={idx}>
                                    <div className="col-lg-6">
                                        <div className="search_icons_right modify_select">
                                            <Select.Async
                                                className="default_validation" required={true}
                                                name={"form-field-name" + idx}
                                                value={value.select}
                                                loadOptions={getOptionsMember}
                                                placeholder='Preffered member'
                                                onChange={(e) => handleShareholderNameChange(this, 'preferred_members', idx, 'select', e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-2 mt-1">
                                        {idx > 0 ? <button onClick={(e) => handleRemoveShareholder(this, e, idx, 'preferred_members')} className="button_unadd">
                                            <i className="icon icon-decrease-icon icon_cancel_1" ></i>
                                        </button> : (this.state.preferred_members.length == 1) ? '' : <button className="add_i_icon" onClick={(e) => handleAddShareholder(this, e, 'preferred_members', value)}>
                                            <i className="icon icon-add-icons" ></i>
                                        </button>
                                        }
                                    </div>
                                </div>
                            ))
                            }
                            <div className="row">
                                <div className="col-md-7"></div>
                                <div className="col-md-5 P_15_T">
                                    <button onClick={this.onSubmit} className="but_submit">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>

        )
    }
}

const mapStateToProps = state => ({

})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(UpdateShiftPrefferedMemberPopUp)