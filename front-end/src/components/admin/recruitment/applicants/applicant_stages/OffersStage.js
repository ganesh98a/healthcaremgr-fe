import React, { Component } from 'react';
import Select from 'react-select-plus';

import {  postData, handleShareholderNameChange, toastMessageShow } from 'service/common.js';
import { applicantStageStatus } from 'dropdown/recruitmentdropdown.js';
import ReactTable from "react-table";
import moment from "moment";
import './../recruit2.css';
import { connect } from 'react-redux'
import { updateApplicantStage, getApplicantInfo, setApplicantInfo, getApplicantStageWiseDetails,getApplicantMainStageDetails } from './../../actions/RecruitmentApplicantAction';
import  {AttachmentAndNotesAndCreateTask}  from './AttachmentAndNotesAndCreateTask';
import StageStatusDropdown from './../StageStatusDropdown';

class OffersStage extends Component {

    static defaultProps = {
        application: null,
    }

    constructor() {
        super();
        this.state = {
            references: []
        }
    }

    componentDidMount() {
        this.setState({ references: this.props.references })
    }

    componentWillReceiveProps(newProps) {
        this.setState({ references: newProps.references })
    }
    
    
    render() {
       
        return (
            <div className=" time_l_1" >
                <div className="time_no_div">
                    <div className="time_no">{this.props.stage}</div>
                    <div className="line_h"></div>
                </div>
                <div className="time_d_1">
                    <div className="time_d_2">

                        <div className="time_d_style">
                            <div className="Recruit_Time_header bb-1">
                                <div className="Rec_Left_s_1">
                                    <h3><strong>{this.props.title}</strong></h3>
                                    <div className="row">
                                        <div className="col-lg-6">
                                        </div>
                                    </div>
                                </div>
                                <div className="Rec_Right_s_1">
                                    <div>
                                    <div className="set_select_small req_s1">
                                            
                                            <StageStatusDropdown
                                            stage_props={this.props}
                                            disable_status={this.props.stage_status == 2 ? false:((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0 })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="Time_line_error_msg text_G_1">
                                            {applicantStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap">
                                <div className="time_txt w-100 Rerm_time_txt">
                                    <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    references: state.RecruitmentApplicantReducer.references,
})


const mapDispatchtoProps = (dispach) => {
    return {
        updateApplicantStage: (applicant_id, stageId, status) => dispach(updateApplicantStage(applicant_id, stageId, status)),
        setApplicantReferenceInfo: (data) => dispach(setApplicantInfo(data)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
        getApplicantInfo: (applicant_id, loading_status) => dispach(getApplicantInfo(applicant_id, loading_status)),
        getApplicantMainStageDetails: (applicant_id) => dispach(getApplicantMainStageDetails(applicant_id)),

    }
};

export default connect(mapStateToProps, mapDispatchtoProps)(OffersStage)