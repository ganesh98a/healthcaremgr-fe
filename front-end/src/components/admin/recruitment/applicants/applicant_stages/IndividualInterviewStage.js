import React, { Component } from 'react';
import Select from 'react-select-plus';
import { Link } from 'react-router-dom';
import {  postData} from 'service/common.js';
import { applicantStageStatus } from 'dropdown/recruitmentdropdown.js';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import { Panel,  PanelGroup } from 'react-bootstrap';
import moment from "moment";
import './../recruit2.css';
import { updateApplicantStage, getApplicantMainStageDetails, getApplicantStageWiseDetails } from './../../actions/RecruitmentApplicantAction';
import RescheduleGroupOrCabInterview from './../../action_task/RescheduleGroupOrCabInterview';
import { connect } from 'react-redux'
import { AttachmentAndNotesAndCreateTask } from './AttachmentAndNotesAndCreateTask';
import StageStatusDropdown from './../StageStatusDropdown';

class IndividualInterviewStage extends Component {

    static defaultProps = {
        application: null,
    }

    constructor() {
        super();
        this.state = {
            stage_details: []
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
        //console.log(this.props);
        
        return (<React.Fragment><div className="time_l_1" >
            <div className="time_no_div">
                <div className="time_no">3.1</div>
                <div className="line_h"></div>
            </div>
            <div className="time_d_1">
                <div className="time_d_2">

                    <div className="time_d_style">
                        <div className="Recruit_Time_header bb-1 min-height">
                            <div className="Rec_Left_s_1">
                                <h3><strong>Stage {this.props.stage}</strong></h3>
                                <h2>{this.props.title}</h2>

                            </div>
                            <div className="Rec_Right_s_1">
                                <div>
                                <div className="set_select_small req_s1">

                                        <StageStatusDropdown
                                            stage_props={this.props}
                                            disable_status={this.props.stage_status == 2 && (this.props.applicant_email_status == 0 || this.props.applicant_email_status == 1) ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
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


                        <PanelGroup
                            accordion
                            id="accordion-controlled-example"
                            activeKey={this.state.activeKey}
                            onSelect={this.handleSelect}
                        >
                            <Panel className="Time_line_panel_Main_0" activeKey={true}>
                                <Panel.Heading className="px-0 py-0 Time_line_panel_heading_0">
                                    <Panel.Title toggle >
                                        <div className="Stage_body_01">
                                            <div className="Stage_Left_1"><strong>Interview Details:</strong></div>
                                            <div className="Stage_Left_2"><a className="O_btn_1 txt_success">Invitation Send - {(this.props.invitation_send_at) ? <React.Fragment> {moment(this.props.invitation_send_at).format('DD/MM/YYYY LT')}</React.Fragment> : 'N/A'}</a></div>
                                            <i className="icon icon-arrow-left d-none"></i>
                                            <i className="icon icon-arrow-down  d-none"></i>
                                        </div>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body collapsible className="Time_line_panel_body_0">
                                    <div className="Stage_body_01">
                                        <div className="Stage_Left_1"><strong>Date:</strong> {this.props.start_datetime ? moment(this.props.start_datetime).format('DD/MM/YYYY') : 'N/A'}</div>
                                    </div>
                                    <div className="Stage_body_01">
                                        <div className="Stage_Left_1"><strong>Time:</strong> {this.props.start_time ? this.props.start_time+' - '+this.props.end_time : 'N/A'}</div>
                                    </div>
                                    <div className="Stage_body_01">
                                        <div className="Stage_Left_1"><strong>Staff in Charge:</strong> {this.props.recruiter_in_charge || "N/A"}</div>
                                    </div>
                                    <div className="Stage_body_01">
                                        <div className="Stage_Left_1"><strong>Location:</strong> {this.props.training_location ? this.props.training_location : 'N/A'}</div>
                                    </div>
                                </Panel.Body>
                            </Panel>

                            {this.props.history_group_interview.map((val, index) => (
                                <Panel eventKey={index} key={index} className="Time_line_panel_Main_0">
                                    <Panel.Heading className="px-0 py-0 Time_line_panel_heading_0">
                                        <Panel.Title toggle>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1 w-40"><strong>Interview Details:</strong></div>
                                                <div className="Stage_Left_2"><span className="O_btn_1 txt_infor">{val.mark_as_no_show == 1? "No show": "Declined"} - {(val.manual_order) ? <React.Fragment> {moment(val.manual_order).format('DD/MM/YYYY')}</React.Fragment> : 'N/A'}</span></div>
                                                <i className="icon icon-arrow-left d-none"></i>
                                                <i className="icon icon-arrow-down  d-none"></i>
                                            </div>
                                        </Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body collapsible className="Time_line_panel_body_0">
                                        <div className="Stage_body_01">
                                            <div className="Stage_Left_1"><strong>Date:</strong> {val.start_datetime ? moment(val.start_datetime).format('DD/MM/YYYY') : 'N/A'}</div>
                                        </div>
                                        <div className="Stage_body_01">
                                            <div className="Stage_Left_1"><strong>Time:</strong> {val.start_time ? val.start_time+' - '+val.end_time : 'N/A'}</div>
                                        </div>
                                        <div className="Stage_body_01">
                                            <div className="Stage_Left_1"><strong>Staff in Charge:</strong> {val.recruiter_in_charge || "N/A"}</div>
                                        </div>
                                        <div className="Stage_body_01">
                                            <div className="Stage_Left_1"><strong>Location:</strong> {val.training_location ? val.training_location : 'N/A'}</div>
                                        </div>
                                        <div className="d-flex mt-3">
                                        <div className="w-40">
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1"><strong>Invitation Sent:</strong></div>
                                            </div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1">{(val.invitation_send_at) ? <React.Fragment> {moment(val.invitation_send_at).format('DD/MM/YYYY')}</React.Fragment> : 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="w-40">
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1"><strong>Applicant Response:</strong></div>
                                            </div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1">
                                                    {(val.applicant_email_status == 1 || val.applicant_email_status == 2) ?
                                                        <React.Fragment>{val.applicant_email_status == 1 ?
                                                           <React.Fragment>  <span className="O_btn_1 txt_success">Accepted - {moment(val.invitation_accepted_at).format('DD/MM/YYYY')}</span></React.Fragment> :
                                                            <React.Fragment><span className="O_btn_1 txt_infor">Declined - {moment(val.invitation_cancel_at).format('DD/MM/YYYY')}</span> </React.Fragment>}</React.Fragment>
                                                        : ((val.applicant_email_status == 0) ? 'Pending' : 'N/A')}</div>
                                            </div>
                                        </div>
                                        {val.applicant_email_status == 2 &&  val.is_status_decline_by_recruiter==1 ? 
                                        <div className="w-20">
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1 f-12 "><strong>Decline By Staff:</strong></div>
                                            </div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1 f-12 brk_all">{val.status_decline_as_recruiter || ''}</div>
                                            </div>
                                        </div> : <React.Fragment/>}
                                        </div>
                                    </Panel.Body>
                                </Panel>
                            ))}
                        </PanelGroup>

                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                            <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {this.state.openReschedule ? <RescheduleGroupOrCabInterview task_stage={3} showModal={this.state.openReschedule} closeModal={this.closeRescheduleModel} applicant_id={this.props.applicant_id} /> : ''}

        </React.Fragment>);

    }
}

const mapStateToProps = (state,ownProps) => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    history_group_interview: state.RecruitmentApplicantReducer.history_individual_interview[ownProps.stage_label_id]?state.RecruitmentApplicantReducer.history_individual_interview[ownProps.stage_label_id]:[],
    ...state.RecruitmentApplicantReducer.individual_interview[ownProps.stage_label_id],
    applicant_status: state.RecruitmentApplicantReducer.details.status,
})


const mapDispatchtoProps = (dispach) => {
    return {
        updateApplicantStage: (applicant_id, stageId, status) => dispach(updateApplicantStage(applicant_id, stageId, status)),
        getApplicantMainStageDetails: (applicant_id) => dispach(getApplicantMainStageDetails(applicant_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


IndividualInterviewStage = connect(mapStateToProps, mapDispatchtoProps)(IndividualInterviewStage)
export { IndividualInterviewStage };

class ApplicantResponseIndividualStage extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    closeRescheduleModel = (status) => {
        this.setState({ openReschedule: false });
        if (status) {
            var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id};
            this.props.getApplicantStageWiseDetails(request);
        }
    }

    reSendMail = (e, taskId) => {
        e.preventDefault();
        var state = {};
        state['email_loading'] = true;
        state['email_sended'] = false;
        this.setState(state);

        let reqData = { taskId: taskId, applicant_id: this.props.applicant_id }
        if (this.props.application) {
            reqData.application_id = this.props.application.id
        }

        postData('recruitment/RecruitmentTaskAction/resend_task_mail_to_applicant', reqData).then((result) => {
            if (result.status) {
                state['email_sended'] = true;
            }else{
                toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
            state['email_loading'] = false;
            this.setState(state);
        });
    }

    markAsDeclineStatus = (e, taskId) => {
        e.preventDefault();
        var state = {};
        state['status_update_loading'] = true;
        state['status_update_decline'] = false;
        this.setState(state);

        postData('recruitment/RecruitmentTaskAction/task_mark_as_decline_to_applicant', { taskId: taskId, applicant_id: this.props.applicant_id }).then((result) => {
            if (result.status) {
                state['status_update_decline'] = true;
                let application_id = '';
                let stage_label_id = '';
                if (this.props.application && this.props.application.id) {
                    application_id = this.props.application.id;
                }
                if (this.props.stage_label_id && this.props.stage_label_id) {
                    stage_label_id = this.props.stage_label_id;
                }
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id, application_id: application_id, stage_label_id:stage_label_id};
                this.props.getApplicantStageWiseDetails(request);
            }else{
                toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
            state['status_update_loading'] = false;
            this.setState(state);
        });
    }

    componentDidMount() {
    }

    render() {

        var stage_status_option = applicantStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0 });

        if(this.props.applicant_email_status == 2){
            stage_status_option = stage_status_option.map((val, index) => {
                if (val.value == 3) {
                    val.disabled = true;
                }
                return val;
            })
        }

        var i = 0;
        return (<React.Fragment><div className=" time_l_1" >
            <div className="time_no_div">
                <div className="time_no">{this.props.stage}</div>
                <div className="line_h"></div>
            </div>
            <div className="time_d_1">
                <div className="time_d_2">

                    <div className="time_d_style">
                        <div className="Recruit_Time_header bb-1 min-height">
                            <div className="Rec_Left_s_1">
                                <h3><strong>Stage {this.props.stage}</strong></h3>
                                <h2>{this.props.title}</h2>

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
                                            disable_status={this.props.stage_status == 2 && (this.props.applicant_email_status == 1 || this.props.applicant_email_status == 2) ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={stage_status_option}
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


                        <div className="limt_flex_set_0 mt-2">
                            <div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><strong>Invitation Sent:</strong></div>
                                </div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1">{(this.props.invitation_send_at) ? <React.Fragment> {moment(this.props.invitation_send_at).format('DD/MM/YYYY')}</React.Fragment> : 'N/A'}</div>
                                </div>
                            </div>
                            <div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><strong>Applicant Response:</strong></div>
                                </div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><a className="O_btn_1">
                                        {(this.props.applicant_email_status == 1 || this.props.applicant_email_status == 2) ?
                                            <React.Fragment>{this.props.applicant_email_status == 1 ?
                                                <React.Fragment> Accepted - {moment(this.props.invitation_accepted_at).format('DD/MM/YYYY')}</React.Fragment> :
                                                <React.Fragment>Declined - {moment(this.props.invitation_cancel_at).format('DD/MM/YYYY')} </React.Fragment>}</React.Fragment>
                                            : ((this.props.applicant_email_status == 0) ? 'Pending' : 'N/A')}</a></div>
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 resend_color "><button disabled={(this.props.applicant_email_status == 0) ? false : true} onClick={(e) => this.reSendMail(e, this.props.taskId)} className="limt_btns w-z w1 ">Resend Invite</button>
                                    {this.state.email_loading ? <i className="ie ie-loading my_Spin"></i> : ''}
                                    {this.state.email_sended ? <i className="icon icon-approved2-ie"></i> : ''}
                                </div>
                                {this.props.applicant_email_status == 0 ? <div className="mb-2 resend_color ">
                                    <button disabled={(this.props.applicant_email_status == 0) ? false : true} onClick={(e) => this.markAsDeclineStatus(e, this.props.taskId)} className="limt_btns w1 ">Decline</button>
                                    <div className={'f-12 pt-2 mb-4'} style={{width:'150px'}}>Admin/recuiter user mark applicant invitation status as decline</div>
                                    {this.state.status_update_loading ? <i className="ie ie-loading my_Spin"></i> : ''}
                                    {this.state.status_update_decline ? <i className="icon icon-approved2-ie"></i> : ''}
                                </div> : null }
                                {/*<div className="my-2"><button disabled={(this.props.applicant_email_status == 2 && this.props.applicant_status == 1) ? false : true} onClick={() => this.setState({ openReschedule: true })} className="limt_btns">Reschedule</button></div>*/}
                            </div>
                        </div>


                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                                {/* <div>Complete by: Smith Roy</div> */}
                                <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

            {this.state.openReschedule ? <RescheduleGroupOrCabInterview task_stage={3} showModal={this.state.openReschedule} closeModal={this.closeRescheduleModel} applicant_id={this.props.applicant_id} /> : ''}

        </React.Fragment>);
    }
}

const mapStateToProps1 = (state,ownProps) => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    ...state.RecruitmentApplicantReducer.individual_interview[ownProps.stage_label_id],
    applicant_status: state.RecruitmentApplicantReducer.details.status,
})

const mapDispatchtoProps1 = (dispach) => {
    return {
        updateApplicantStage: (applicant_id, stageId, status) => dispach(updateApplicantStage(applicant_id, stageId, status)),
        getApplicantMainStageDetails: (applicant_id) => dispach(getApplicantMainStageDetails(applicant_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


ApplicantResponseIndividualStage = connect(mapStateToProps1, mapDispatchtoProps1)(ApplicantResponseIndividualStage)
export { ApplicantResponseIndividualStage };

class IndividualInterviewResultStage extends Component {

    constructor() {
        super();
        this.state = {
            stage_details: []
        }
    }
    
    closeRescheduleModel = (status) => {
        this.setState({ openReschedule: false });
        if (status) {
             var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id};
            this.props.getApplicantStageWiseDetails(request);
        }
    }

    componentDidMount() {
    }

    render() {
    
        return (<div className=" time_l_1" >
            <div className="time_no_div">
                <div className="time_no">{this.props.stage}</div>
                <div className="line_h"></div>
            </div>
            <div className="time_d_1">
                <div className="time_d_2">

                    <div className="time_d_style">
                        <div className="Recruit_Time_header bb-1 min-height">
                            <div className="Rec_Left_s_1">
                                <h3><strong>Stage {this.props.stage} </strong></h3>
                                <h2>{this.props.title} </h2>

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
                                            disable_status={this.props.stage_status == 2 ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
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

                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-12 Rec_center_s_1a mt-2 mb-1"><strong>Individual Interview Results:</strong></div>
                        </div>

                        <div className="row d-flex justify-content-center">
                            <div>
                                
                                {((this.props.stage_status == 2 || this.props.stage_status == 1) || !this.props.taskId)? <span className="O_btn_1 w-big my-1 txt_infor">Pending</span>: 
                                        ((this.props.stage_status == 3)? <span className="O_btn_1 w-big my-1 txt_success">Applicant Successful</span>:  
                                        <React.Fragment> <span className="O_btn_1 w-big my-1 txt_infor">Applicant Unsuccessful {(this.props.mark_as_no_show == 1)? <React.Fragment><br/>(Marked as No show)</React.Fragment>: ''}</span></React.Fragment>)}<br />
                                
                                {/*<div className="text-center">
                                {this.props.mark_as_no_show == 1? <button disabled={(this.props.status == 1) ? false : true} onClick={() => this.setState({ openReschedule: true })} className="limt_btns">Reschedule</button>
                                    : <Link disabled={this.props.applicant_result? false: true} to={'/admin/recruitment/group_interview_result/'+this.props.applicant_id+'/'+this.props.taskId} className="under_l_tx">View Results</Link>}
                                </div>*/}
                            </div>
                        </div>

                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                                <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>

                    </div>

                    {this.state.openReschedule ? <RescheduleGroupOrCabInterview task_stage={3} showModal={this.state.openReschedule} closeModal={this.closeRescheduleModel} applicant_id={this.props.applicant_id} /> : ''}
                            
                </div>
            </div>
        </div>);
    }
}

const mapStateToProps2 = (state,ownProps) => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    status: state.RecruitmentApplicantReducer.details.status,
            ...state.RecruitmentApplicantReducer.individual_interview[ownProps.stage_label_id],
})

const mapDispatchtoProps2 = (dispach) => {
    return {
        updateApplicantStage: (applicant_id, stageId, status, stage_key) => dispach(updateApplicantStage(applicant_id, stageId, status, stage_key)),
        getApplicantMainStageDetails: (applicant_id) => dispach(getApplicantMainStageDetails(applicant_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


IndividualInterviewResultStage = connect(mapStateToProps2, mapDispatchtoProps2)(IndividualInterviewResultStage)
export { IndividualInterviewResultStage };
