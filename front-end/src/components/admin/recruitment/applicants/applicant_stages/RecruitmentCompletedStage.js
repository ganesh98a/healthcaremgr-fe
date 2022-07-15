import React, { Component } from 'react';
import Select from 'react-select-plus';
import { Link } from 'react-router-dom';
import {  postData} from 'service/common.js';
import { applicantStageStatus,applicantStageStatusFInalStage } from 'dropdown/recruitmentdropdown.js';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import { Panel,  PanelGroup } from 'react-bootstrap';
import moment from "moment";
import './../recruit2.css';
import  {AttachmentAndNotesAndCreateTask}  from './AttachmentAndNotesAndCreateTask';
import { updateApplicantStage, getApplicantInfo, setApplicantInfo, getApplicantStageWiseDetails } from './../../actions/RecruitmentApplicantAction';
import { connect } from 'react-redux'
import StageStatusDropdown from './../StageStatusDropdown';

class RecruitmentCompletedStage extends Component {

    static defaultProps = {
        application: null,
    }

    constructor() {
        super();
        this.state = {
            stage_details: [],
            create_member:false
        }
    }

    componentDidMount() {
    }

    closeRescheduleModel = (status) => {
        this.setState({ openReschedule: false });
        if (status) {
            var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id};
            this.props.getApplicantStageWiseDetails(request);
        }
    }

    render() {
        //console.log('-->',this.props)
        //console.log('-->',this.props.stage_key)
        return (
            <React.Fragment>
                <div className=" time_l_1" >
                    <div className="time_no_div">
                        <div className="time_no">7.1</div>
                        <div className="line_h"></div>
                    </div>
                    <div className="time_d_1">
                        <div className="time_d_2">

                            <div className="time_d_style">
                                <div className="Recruit_Time_header bb-1">
                                    <div className="Rec_Left_s_1">
                                        <h2>Finalise Recruitment</h2>
                                        <div className="row">
                                            <div className="col-lg-6">
                                            </div>
                                        </div>

                                    </div>
                                    <div className="Rec_Right_s_1">
                                        <div>
                                            <div className="s-def1 s1 req_s1">
                                            
                                            <StageStatusDropdown
                                            stage_props={this.props}
                                            disable_status={this.props.stage_status == 2 || this.props.task_its_recruiter_admin ? false:((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantStageStatusFInalStage(0, 0, false, {is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0, allow_unsuccess_status_change: 1, prev_stage_status: this.props.stage_status_details.prev_stage_status })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            is_create_member={this.state.create_member}
                                            application={this.props.application}
                                            />

                                            </div>
                                        </div>
                                        <div>
                                            <span className="Time_line_error_msg text_G_1">{applicantStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="limt_flex_set_0 mt-2">
                                    <div className="Stage_body_01">
                                    <label className="radio_F1 check_F1 mb-0" style={{width:'auto'}} >
                                    <input type="checkbox" name="create_member1" 
                                    onChange={(e) => this.setState({ create_member: e.target.checked}) } 
                                    disabled={(this.props.stage_key == 'recruitment_complete' && this.props.stage_status == 3)?true:false} 
                                    checked={(this.props.hired_as==1 || this.state.create_member)?true:false}
                                    /><span
                                    className="checkround"></span><span className="txtcheck text_2_0_1">Create Member in the member's module</span></label>
                                    </div>
                                </div>

                                <div className="d-flex">
                                    <div className="time_txt w-100 Rerm_time_txt">
                                        <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                                    </div>
                                </div>

                            </div>


                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}



const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    references: state.RecruitmentApplicantReducer.references,
    hired_as: state.RecruitmentApplicantReducer.details.hired_as,
    task_its_recruiter_admin: state.RecruitmentReducer.its_recruiter_admin,
})

const mapDispatchtoProps = (dispach) => {
    return {
        updateApplicantStage: (applicant_id, stageId, status) => dispach(updateApplicantStage(applicant_id, stageId, status)),
        setApplicantReferenceInfo: (data) => dispach(setApplicantInfo(data)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
        getApplicantInfo: (applicant_id, loading_status) => dispach(getApplicantInfo(applicant_id, loading_status)),
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(RecruitmentCompletedStage)
