import React, { Component } from 'react';
import {  postData, handleChangeChkboxInput } from 'service/common.js';
import jQuery from "jquery";
import { ToastUndo } from 'service/ToastUndo.js';
import {toast } from 'react-toastify';
import Select from 'react-select-plus'

class FlagApplicantModal extends Component {

    constructor() {
        super();
        this.state = {
            flag_reasons: '',
            reason_id: '',
            reason_title: ''
        }
    }

    async get_flag_reasons() {
        postData('recruitment/RecruitmentApplicant/get_flag_reasons', {}).then((result) => {
            if (result.status) {
                var data = result.data
                this.setState({ flag_reasons: data });
            }
        });
    }

    /**
     * handling reason on change
     */
    handleOnChangeReason = id => {
        this.setState({ reason_id: id.value })
        this.setState({ reason_title: id.label })
    }

    componentDidMount() {
        this.get_flag_reasons();
    }
    
    submitFlag = (e) => {
        e.preventDefault();
        
        jQuery("#flag_applicant").validate();
        
        if(jQuery("#flag_applicant").valid()){
             this.setState({loading: true});
             var request_data = {'reason_title': this.state.reason_title, 'reason_note': this.state.reason_note, 'applicant_id': this.props.applicant_id, 'reason_id': this.state.reason_id};
             toast.dismiss();
             postData('recruitment/RecruitmentApplicant/flage_applicant', request_data).then((result) => {
                        if (result.status) {
                            this.setState({ loading: false });
                     
                            toast.success(<ToastUndo message={'Request for the flag an applicant successfully.'} showType={'s'} />, {
                                position: toast.POSITION.TOP_CENTER,
                                hideProgressBar: true
                            });
                            this.props.closeModal(true);
                        } else {
                            toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                                position: toast.POSITION.TOP_CENTER,
                                hideProgressBar: true
                            });
                            this.setState({ loading: false });
                     }
              });
        }
    }

    render() {
        return (
            <div className={'customModal ' + (this.props.showModal ? ' show Flag_application_size' : '')}>
                <div className="cstomDialog widBig">
                <form id="flag_applicant" method="post">
                    <h3 className="cstmModal_hdng1--">
                         Flag Applicant
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModal(false)}></span>
                    </h3>

                    <div className="row  pd_b_20 ">
                        <div className="col-md-6">
                            <div className="csform-group">
                                <label>Reason for Flagging Applicant: <b className="text-danger">*</b></label>
                                <Select className=""
                                    name="reason_id"
                                    id="reason_id"
                                    placeholder="Select reason"
                                    value={this.state.reason_id}
                                    options={this.state.flag_reasons}
                                    onChange={this.handleOnChangeReason}
                                    clearable={false}
                                    searchable
                                    required
                                    inputProps={{
                                        readOnly: true,
                                        'data-msg-required': "Reason is required"
                                    }}
                                />
                                
                            </div>
                        </div>
                    </div>

                    <div className="row  pd_b_20 ">
                        <div className="col-md-12">
                            <div className="csform-group">
                                <label>Add New Note:</label>
                                <span className="required">
                                <textarea className="csForm_control bl_bor txt_area brRad10 textarea-max-size" value={this.state.reason_note} name="reason_note" onChange={(e) => this.setState({reason_note: e.target.value})} data-rule-required="true"></textarea>
                                </span>
                            </div>
                        </div>
                    </div>
                  
                    <div className="row bt-1">
                        <div className="col-md-12 text-right">
                            <button onClick={this.submitFlag} disabled={this.state.loading} className="btn cmn-btn1 flag-btn mt-1">Flag Applicant</button>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default FlagApplicantModal;