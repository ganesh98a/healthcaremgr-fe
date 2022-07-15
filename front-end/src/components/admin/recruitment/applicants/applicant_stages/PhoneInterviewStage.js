import React, { Component } from 'react';
import Select from 'react-select-plus';
import { postData, toastMessageShow, archiveALL } from 'service/common.js';
import { applicantStageStatus, phoneInterviwApplicantClassification } from 'dropdown/recruitmentdropdown.js';
import { connect } from 'react-redux'
import moment from "moment";
import './../recruit2.css';
import { getApplicantMainStageDetails, getApplicantStageWiseDetails } from './../../actions/RecruitmentApplicantAction';
import { AttachmentAndNotesAndCreateTask } from './AttachmentAndNotesAndCreateTask';
import CreateViewPhoneInterview from './../CreateViewPhoneInterview';
import StageStatusDropdown from './../StageStatusDropdown';


class PhoneInterviewStage extends Component {

    static defaultProps = {
        application: null,
    }

    constructor() {
        super();
        this.state = {
        }
    }

    updateClassfication = (classificaiton) => {
        console.log(this.props);
        var req = { classificaiton: classificaiton, applicant_id: this.props.applicant_id, application_id: this.props.selected_application.id };
        postData('recruitment/RecruitmentApplicant/update_applicant_phone_interview_classification', req).then((result) => {
            if (result.status) {
                // this.props.getApplicantMainStageDetails(this.props.applicant_id);
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:true, application_id:this.props.selected_application.id};
                this.props.getApplicantStageWiseDetails(request);
            } else {
                toastMessageShow(result.error, 'e')
            }
        });
    }

    openCreateInterviewModel = () => {
        this.setState({ createPhoneInterviewModel: true });
    }

    closePhoneInterviewModel = (status) => {
        this.setState({ createPhoneInterviewModel: false });
        if (status) {
            var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:true, application_id:this.props.selected_application.id};
            this.props.getApplicantStageWiseDetails(request);
        }
    }
	
	deleteInterview = () => {
        var req = {interview_applicant_form_id : this.props.phone_interview_applicant_form_id}
        var msg = "Are you sure want to archive this Phone Interview";

		archiveALL(req, msg, "recruitment/RecruitmentFormApplicant/archive_form_interview").then((result) => {
            if(result.status){
                toastMessageShow(result.msg, 's');
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:true, application_id:this.props.selected_application.id};
                this.props.getApplicantStageWiseDetails(request);
            }else{
                if(result.error){
                    toastMessageShow(result.error, 'e');
                }
            }
        })
	}

    render() {
        var disable_status = this.props.stage_status == 2 && this.props.phone_interview_classification > 0 ?
         false : 
         ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)
         
         console.log(this.props.stage_status_details);
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
                                    <h3><strong>Stage {this.props.stage}</strong></h3>
                                    <h2>{this.props.title}</h2>

                                    <div className="row">
                                        <div className="col-lg-6">
                                            <button phone={this.props.phone} className="btn cmn-btn1 phone-btn mb-2" onClick={() => this.setState({ pinView: !this.state.pinView })}>Call Application</button>

                                            <div className={this.state.pinView == 1 ? "my_tooltip_" : "hide"}>
                                                {this.props.phones.map((val, index) => (
                                                    <div key={index + 1}>{val.phone}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="Rec_Right_s_1">
                                    <div>
                                            <StageStatusDropdown
                                                stage_props={this.props}
                                                disable_status={disable_status}
                                                stage_status={this.props.stage_status}
                                                stage_status_option={applicantStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0 })}
                                                stageId={this.props.id}
                                                stage_key={this.props.stage_key}
                                                enable_email_template_pop_up={true}
                                                application={this.props.application}
                                            />
                                    </div>
                                    <div>
                                        <span className="Time_line_error_msg text_G_1">
                                            {applicantStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-12 Rec_center_s_1a mt-2 mb-1"><strong>Applicant Classification:</strong></div>
                            </div>

                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-4 col-sm-4 px-0">
                                    <div className="s-def1 s1">
                                        <Select name="participant_assessment"
                                            simpleValue={true}
                                            searchable={false}
                                            clearable={false}
                                            onChange={(status) => this.updateClassfication(status)}
                                            options={phoneInterviwApplicantClassification()}
                                            value={this.props.phone_interview_classification}
                                            placeholder="Applicant Classification"
                                            className={'custom_select'}
                                            disabled={this.props.stage_status == 2 ? false : true}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap">
                                <div className="time_txt w-100 Rerm_time_txt">
                                    {/* <div>Complete by: Smith Roy</div> */}
                                    {/*  <ul className="Time_subTasks_Action__ ">
                                            <li><span className="sbTsk_li" {...attachmentsAttributes}>Attachments & Notes</span></li>
                                            <li><span className="sbTsk_li" {...createTaskAttributes}>Create Task</span></li>
                                        </ul> */}
                                    <AttachmentAndNotesAndCreateTask
                                        openCreateInterviewModel={this.openCreateInterviewModel}
                                        titlePhoneInterview={this.props.phont_interview_status ? "View Phone Interview" : "Create Phone Interview"}
										deleteInterview={this.props.phont_interview_status}
										delleteInterviewMethod = {this.deleteInterview}
                                        stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes}
                                        CreateTaskShowModal={this.props.CreateTaskShowModal}
                                        openAttachmentModel={this.props.openAttachmentModel}
                                        createPhoneInterviewOption={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {this.state.createPhoneInterviewModel ?
                    <CreateViewPhoneInterview
                        interview_applicant_form_id={this.props.phone_interview_applicant_form_id}
                        interview_status={this.props.phont_interview_status}
                        interview_form_id={this.props.phont_interview_form_id}
                        interview_type={"phone_interview"}
                        openModel={this.state.createPhoneInterviewModel}
                        closeModel={this.closePhoneInterviewModel}
                        application={this.props.application}
                    /> : ''}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    phone_interview_classification: state.RecruitmentApplicantReducer.phone_interview_classification,
    phont_interview_status: state.RecruitmentApplicantReducer.phont_interview_status,
    phones: state.RecruitmentApplicantReducer.phones,
    phont_interview_status: state.RecruitmentApplicantReducer.phont_interview_status,
    phont_interview_form_id: state.RecruitmentApplicantReducer.phont_interview_form_id,
    phone_interview_applicant_form_id: state.RecruitmentApplicantReducer.phone_interview_applicant_form_id,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(PhoneInterviewStage)