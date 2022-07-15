import React, { Component } from 'react';
import _ from 'lodash'
import Select from 'react-select-plus';
import { applicantStageStatus } from 'dropdown/recruitmentdropdown.js';
import SeekWebsiteAnswerModel from './../SeekWebsiteAnswerModel'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap';
import moment from "moment";
import './../recruit2.css';

import  {AttachmentAndNotesAndCreateTask}  from './AttachmentAndNotesAndCreateTask';
import  StageStatusDropdown  from './../StageStatusDropdown';

import '../../../scss/components/admin/recruitment/applicants/applicant_stages/ReviewAnswerStage.scss'
import CreateViewPhoneInterview from '../CreateViewPhoneInterview';

const Modal = ({ children = null, open = false, closeModal= () => {} }) => {
    return (
        <div className={`customModal ${open && 'show'}`}>
            <div className="cstomDialog widMedium">
                <form>
                    <h3 className="cstmModal_hdng1--">
                        View answers
                        <span className="closeModal icon icon-close1-ie" onClick={closeModal}></span>
                    </h3>
                    <div className="modal_body_1_4__">
                        {children}
                    </div>
                </form>
            </div>
        </div>
    );
}


class StageReviewAnswer extends Component {

    static defaultProps = {
        application: null,
    }

    constructor() {
        super();
        this.state = {
            seek_answer_model: false,
            answerType: "",
            isModalOpenedApplicantAnswersFromJobAd: false,
            loadingApplicantAnswersFromJobAd: null,
            applicantAnswersFromJobAd: null
        }
    }

    applicantHasSubmittedAnswers() {
        const form = this.getJobQuestionTypeForm()
        const { form_id } = form || {}

        return !!form_id
    }

    closeSeekAnswerModel = () => {
        this.setState({seek_answer_model: false, answerType: ''})
    }

    getJobQuestionTypeForm() {
        return _.get(this.props.application, 'submitted_forms', []).find(f => f.form_interview_type_key_type === 'job_questions')
    }

    handleOnClickedViewAnswers = e => {
        e.preventDefault();
        
        this.setState(() => ({ isOpenModalJobAdQuestions: true }))
    }

    renderSeekOrWebsiteAnswersPreview() {
        return (
            <div style={{ marginTop: "-25px" }}>
                <div className="Line_base_tabs">
                    <Tabs defaultActiveKey={this.props.seek.length > 0? "SeekAnswers": "WebsiteAnswers"} id="uncontrolled-tab-example">
                        {this.props.seek.length > 0?
                        <Tab eventKey="SeekAnswers" title="Seek Answers">
                            <div className="Seek_Q_ul mt-1">
                                {this.props.seek.map((val, index) => (   
                                <div className="Seek_Q_li w-100" key={index + 1}><span><i className={"icon "+ ((val.answer_status == 1)? "icon-accept-approve1-ie" : "icon-cross-icons")}></i></span>
                                    <div>{val.question}</div>
                                </div>
                                ))}
                            </div>
                            <div className="text-left"><a className="under_l_tx" onClick={() => this.setState({seek_answer_model: true, answerType: "SEEK"})}>View all Answers</a></div>
                        </Tab>: ''}
                        
                        {this.props.website.length > 0?
                        <Tab eventKey="WebsiteAnswers" title="Website Answers">
                            <div className="Seek_Q_ul  mt-1">
                                {this.props.website.map((val, index) => (   
                                <div key={index + 1} className="Seek_Q_li w-100"><span><i className={"icon "+ ((val.answer_status == 1)? "icon-accept-approve1-ie" : "icon-cross-icons")}></i></span>
                                    <div>{val.question}</div>
                                </div>
                                ))}
                            </div>
                            <div className="text-left"><a className="under_l_tx" onClick={() => this.setState({seek_answer_model: true, answerType: "Website"})}>View all Answers</a></div>
                        </Tab>: ''}

                        {this.props.website.length == 0 && this.props.seek.length == 0?
                        <Tab eventKey="WebsiteAnswers" title=" Answers">
                            <div className="Seek_Q_ul  mt-1">
                            No records found.
                            </div>
                        </Tab>: ''}
                    </Tabs>
                </div>
            </div>
        )
    }


    render() {
        const formApplicant = this.getJobQuestionTypeForm()
        const { form_id } = formApplicant || {}

        return (
            <React.Fragment>
                <div id="ReviewAnswerStage" className=" time_l_1" >
                    <div className="time_no_div">
                        <div className="time_no">{this.props.stage}</div>
                        <div className="line_h"></div>
                    </div>
                    <div className="time_d_1">
                        <div className="time_d_2">
                            <div className="time_d_style">
                                <div className="Recruit_Time_header">
                                    <div className="Rec_Left_s_1">
                                        <h3><strong>{this.props.title}</strong></h3>

                                        <div className="row">
                                            <div className="col-lg-6">
                                            </div>
                                        </div>

                                    </div>
                                    <div className="Rec_Right_s_1">
                                        <div>
                                                <StageStatusDropdown
                                                    stage_props={this.props}
                                                    disable_status={(this.props.stage_status == 2 || this.props.stage_status == 4) && (this.props.application.status == 1 || this.props.application.status == 2)? false: ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
                                                    stage_status={this.props.stage_status}
                                                    stage_status_option = {applicantStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0, allow_inporgress_status_unsuccess: this.props.stage_status == 2 ? 0 : 1, allow_unsuccess_status_change: 1 })}
                                                    stageId={this.props.id}
                                                    stage_key={this.props.stage_key}
                                                    enable_email_template_pop_up={true}
                                                    application={this.props.application}
                                                />
                                        </div>
                                        <div>
                                            <span className="Time_line_error_msg text_G_1">
                                            {applicantStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4)? 
                                            <React.Fragment>{moment(this.props.action_at).format("DD/MM/YYYY LT")} </React.Fragment>: ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* { this.renderSeekOrWebsiteAnswersPreview() } */}

                                <div className="d-flex flex-wrap">
                                    <div className="time_txt w-100 Rerm_time_txt" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>Complete by: {this.props.action_username || 'N/A'}</div>
                                        <div>
                                            <div className="d-inline-block" id="ReviewAnswerStage-view_answers_parent">
                                                {
                                                    this.applicantHasSubmittedAnswers() ? 
                                                    (
                                                        <a href='#' id="ReviewAnswerStage-view_answers" onClick={this.handleOnClickedViewAnswers} title={`View all applicant responses from job ad questions`}>
                                                            <u >View answers</u>
                                                        </a>
                                                    ) : 
                                                    (
                                                        <a href='#' className='disabled' style={{ pointerEvents: 'auto' }} id="ReviewAnswerStage-view_answers" onClick={e => e.preventDefault()} disabled title={`NOTE: The job ad does not have additional questions`}>
                                                            <u><s>View answers</s></u>
                                                        </a>
                                                    )
                                                }
                                            </div>
                                            <div className="d-inline-block">
                                                <AttachmentAndNotesAndCreateTask 
                                                    stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} 
                                                    CreateTaskShowModal={this.props.CreateTaskShowModal} 
                                                    openAttachmentModel={this.props.openAttachmentModel} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.state.seek_answer_model ? <SeekWebsiteAnswerModel answerType={this.state.answerType} closeModel={this.closeSeekAnswerModel} openModel={this.state.seek_answer_model}/>: ''}
                    
                    {/* Note: Component name is misleading. This is reused in multiple stages */}
                    <CreateViewPhoneInterview
                        interview_status={true}
                        interview_form_id = {form_id}
                        interview_type={"job_questions"}
                        openModel={this.state.isOpenModalJobAdQuestions}
                        closeModel={() => this.setState({ isOpenModalJobAdQuestions: false })}
                        application={this.props.application}
                    />
                </div>
                
           
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    ...state.RecruitmentApplicantReducer.question_answer,
    applicant_id :state.RecruitmentApplicantReducer.details.id,
    applicant_status :state.RecruitmentApplicantReducer.details.status,
    applications: state.RecruitmentApplicantReducer.applications,

    fullname: state.RecruitmentApplicantReducer.details.fullname,
    appId: state.RecruitmentApplicantReducer.details.appId,
})

const mapDispatchtoProps = (dispach) => {
    return {
        
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(StageReviewAnswer)
