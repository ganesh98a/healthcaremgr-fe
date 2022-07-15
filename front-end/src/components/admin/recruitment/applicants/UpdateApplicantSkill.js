import React, { Component } from "react";
import { postData, handleCheckboxValue, toastMessageShow, handleShareholderNameChange,onKeyPressPrevent } from "service/common.js";
import Modal from "react-bootstrap/lib/Modal";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ToastUndo } from "service/ToastUndo.js";
import ScrollArea from "react-scrollbar";
import jQuery from "jquery";

class UpdateApplicantSkill extends Component {
    constructor(props) {
        super(props);
        this.state = {
            applicant_skill: [],
        };
    }

    getApplicantSkill = () => {
        postData("recruitment/RecruitmentApplicant/get_applicant_skill", { applicant_id: this.props.applicant_id }).then(result => {
            if (result.status) {
                this.setState({ applicant_skill: result.data });
            }
        });
    }

    componentDidMount() {
        this.getApplicantSkill();
    }

    onSubmit = e => {
        e.preventDefault();
        jQuery('#skill').validate({ ignore: [] });

        if (jQuery('#skill').valid()) {
            this.setState({ loading: true }, () => {
                postData("recruitment/RecruitmentApplicant/update_applicant_skill", { applicant_id: this.props.applicant_id, applicant_skill: this.state.applicant_skill }).then(result => {
                    if (result.status) {
                        toastMessageShow("Update applicant skill successfully", "s");
                        this.props.closeModal();
                    } else {
                        toastMessageShow(result.error, "e");
                    }
                    this.setState({ loading: false });
                });
            });
        }
    };

    render() {
      
        return (
                <div>
            <Modal
                className="Modal fade Modal_A Modal_B"
                show={this.props.showModal}
                onHide={this.handleHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>
                    <div className="dis_cell">
                        <div className="text text-left by-1 mb-3 Popup_h_er_1">
                            <span>Skills:</span>
                            <a onClick={() => this.props.closeModal()} className="close_i">
                                <i className="icon icon-cross-icons"></i>
                            </a>
                        </div>
                        <div className="row">
                            <form id="skill" onKeyPress={onKeyPressPrevent}>
                                <div className="col-md-12">
                                    <label className="label_2_1_1"></label>

                                    <div className="custom_scroll_set__">
                                        <label htmlFor="skill[]" className="error CheckieError" style={{ display: "block", width: "100%" }} ></label>
                                        <div className="cstmSCroll1 CrmScroll">
                                            <ScrollArea
                                                speed={0.8}
                                                className="stats_update_list"
                                                contentClassName="content"
                                                horizontal={false}
                                                enableInfiniteScroll={true}
                                                style={{
                                                    paddingRight: "0px",
                                                    height: "auto",
                                                    maxHeight: "120px"
                                                }}
                                            >
                                                {this.state.applicant_skill.map((value, key) => (
                                                    <span key={key + 1} className="w-50 d-inline-flex pb-2">
                                                        <label className="c-custom-checkbox CH_010">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox1"
                                                                checked={value.checked || ""}
                                                                onChange={e => {handleCheckboxValue(this, "applicant_skill", key, "checked"); handleShareholderNameChange(this, "applicant_skill", key, "other_title", "")}}
                                                                name="skill[]"
                                                                required={true}
                                                                data-msg-required="Please select atleast one skill"
                                                            />
                                                            <i className="c-custom-checkbox__img"></i>
                                                            <div>{value.name}</div>
                                                            
                                                        </label>
                                                        {value.key_name === "other" && value.checked?
                                                        <div>
                                                        <input
                                                            type="text"
                                                            className="border-color-black"
                                                            onChange={e => handleShareholderNameChange(this, "applicant_skill", key, "other_title", e.target.value)}
                                                            name="other"
                                                            required={true}
                                                            value={value.other_title}
                                                            style={{height:'22px', fontSize:'13px', marginLeft:'3px'}}
                                                        />
                                                        </div>: ""}        
                                                    </span>
                                                ))}
                                            </ScrollArea>
                                        </div>
                                    </div>
                                    
                                </div>
                            </form>
                        </div>

                        <div className="row">
                            <div className="col-sm-5 col-sm-offset-7 P_15_T">
                                <button
                                    disabled={this.state.loading}
                                    onClick={this.onSubmit}
                                    className="but_submit"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchtoProps = dispach => {
    return {};
};

export default connect(mapStateToProps, mapDispatchtoProps)(UpdateApplicantSkill);
