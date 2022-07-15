import React, { Component } from 'react';
import Select from 'react-select-plus';
import { postData, toastMessageShow } from 'service/common.js';
import { applicantCabStageStatus } from 'dropdown/recruitmentdropdown.js';
import { connect } from 'react-redux'
import moment from "moment";
import './../recruit2.css';
import { getApplicantMainStageDetails, getApplicantStageWiseDetails, setApplicantInfoKeyValue } from './../../actions/RecruitmentApplicantAction';
import { Panel, PanelGroup } from 'react-bootstrap';
import RescheduleGroupOrCabInterview from './../../action_task/RescheduleGroupOrCabInterview';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import { AttachmentAndNotesAndCreateTask } from './AttachmentAndNotesAndCreateTask';
import { ROUTER_PATH } from '../../../../../config.js';
import { Link } from 'react-router-dom';
import StageStatusDropdown from './../StageStatusDropdown';

class ScheduleCabDayStage extends Component {

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
    /**
     * Stage 6.1 status disable
     * Allow the users to change or update the status based on
     * 
     * If stage status is in-progress
     * 
     * Previous stage and current stage is equal
     * 
     */
    getStgStatusDisabled() {
        // && (this.props.applicant_email_status == 0 || this.props.applicant_email_status == 1)
        if (Number(this.props.stage_status) == 2) {
            return false;
        } else if ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage)) {
            return false;
        } else {
           return true;
        }
    }

    render() {

        return (<React.Fragment><div className="time_l_1" >
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

                                        <div className="cmn_select_dv mg_slct1  slct_des23 slct_s1">
                                            <button disabled={(typeof (this.props.applicant_email_status) === 'undefined' && this.props.stage_status == 2 && this.props.applicant_status == 1) ? false : true} onClick={() => this.setState({ openReschedule: true })} className="limt_btns">Select Interivew  <i className="icon icon-edit5-ie ml-2"></i></button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="Rec_Right_s_1">
                                <div>
                                        <StageStatusDropdown
                                            stage_props={this.props}
                                            disable_status={this.getStgStatusDisabled()}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantCabStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0, allow_unsuccess_status_change: this.props.applicant_email_status == 2 ? 1 : 0 })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                </div>
                                <div>
                                    <span className="Time_line_error_msg text_G_1">
                                        {applicantCabStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
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
                                            <div className="Stage_Left_2"><a className="O_btn_1 txt_success">Invitation Sent - {(this.props.invitation_send_at) ? <React.Fragment> {moment(this.props.invitation_send_at).format('DD/MM/YYYY LT')}</React.Fragment> : 'N/A'}</a></div>
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
                                        <div className="Stage_Left_1"><strong>Staff in Charge:</strong> {this.props.recruiter_in_charge || "N/A"}</div>
                                    </div>
                                    <div className="Stage_body_01">
                                        <div className="Stage_Left_1"><strong>Location:</strong> {this.props.training_location ? this.props.training_location : 'N/A'}</div>
                                    </div>
                                </Panel.Body>
                            </Panel>

                            {this.props.history_cab_day_interview.map((val, index) => (
                                <Panel eventKey={index} key={index} className="Time_line_panel_Main_0">
                                    <Panel.Heading className="px-0 py-0 Time_line_panel_heading_0">
                                        <Panel.Title toggle>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1 w-40"><strong>Interview Details:</strong></div>
                                                <div className="Stage_Left_2"><a className="O_btn_1 txt_infor">{val.mark_as_no_show == 1 ? "No show" : "Declined"} - {(val.manual_order) ? <React.Fragment> {moment(val.manual_order).format('DD/MM/YYYY')}</React.Fragment> : 'N/A'}</a></div>
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
                                            <div className="Stage_Left_1"><strong>Staff in Charge:</strong> {val.recruiter_in_charge || "N/A"}</div>
                                        </div>
                                        <div className="Stage_body_01">
                                            <div className="Stage_Left_1"><strong>Location:</strong> {val.training_location ? val.training_location : 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1"><strong>Invitation Sent:</strong></div>
                                            </div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1">{(val.invitation_send_at) ? <React.Fragment> {moment(val.invitation_send_at).format('DD/MM/YYYY')}</React.Fragment> : 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1"><strong>Applicant Response:</strong></div>
                                            </div>
                                            <div className="Stage_body_01">
                                                <div className="Stage_Left_1"><a className="O_btn_1">
                                                    {(val.applicant_email_status == 1 || val.applicant_email_status == 2) ?
                                                        <React.Fragment>{val.applicant_email_status == 1 ?
                                                            <React.Fragment> Accepted - {moment(val.invitation_accepted_at).format('DD/MM/YYYY')}</React.Fragment> :
                                                            <React.Fragment>Declined - {moment(val.invitation_cancel_at).format('DD/MM/YYYY')} </React.Fragment>}</React.Fragment>
                                                        : ((val.applicant_email_status == 0) ? 'Pending' : 'N/A')}</a></div>
                                            </div>
                                        </div>
                                        {val.applicant_email_status == 2 && val.is_status_decline_by_recruiter == 1 ?
                                            <div className="mt-1">
                                                <div className="Stage_body_01">
                                                    <div className="Stage_Left_1 "><strong>Decline By Staff:</strong></div>
                                                </div>
                                                <div className="Stage_body_01">
                                                    <div className="Stage_Left_1 brk_all">{val.status_decline_as_recruiter || ''}</div>
                                                </div>
                                            </div> : <React.Fragment />}

                                    </Panel.Body>
                                </Panel>
                            ))}
                        </PanelGroup>

                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                                {/* <ul className="Time_subTasks_Action__ ">
                                    <li><span className="sbTsk_li" {...attachmentsAttributes}>Attachments & Notes</span></li>
                                    <li><span className="sbTsk_li" {...createTaskAttributes}>Create Task</span></li>
                                </ul> */}
                                <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {this.state.openReschedule ?
                <RescheduleGroupOrCabInterview
                    task_stage={6}
                    showModal={this.state.openReschedule}
                    closeModal={this.closeRescheduleModel}
                    applicant_id={this.props.applicant_id}
                    request_type={"create_new_task"}
                /> : ''}

        </React.Fragment>);
    }
}

const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    application_id: state.RecruitmentApplicantReducer.details.application_id,
    applicant_status: state.RecruitmentApplicantReducer.details.status,
    history_cab_day_interview: state.RecruitmentApplicantReducer.history_cab_day_interview,
    ...state.RecruitmentApplicantReducer.cab_day_interview,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


ScheduleCabDayStage = connect(mapStateToProps, mapDispatchtoProps)(ScheduleCabDayStage)
export { ScheduleCabDayStage };

class ApplicantResponseCabDayStage extends Component {
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
            } else {
                toastMessageShow(result.error, 'e');
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
                if (this.props.application && this.props.application.id) {
                    application_id = this.props.application.id;
                }
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id, application_id: application_id};
                this.props.getApplicantStageWiseDetails(request);
            } else {
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

    /**
     * Stage 6.2 status disable
     * Allow the users to change or update the status based on
     * 
     * If stage status is in-progress
     * 
     * Previous stage and current stage is equal
     * 
     */
    getStgStatusDisabled() {
        // this.props.applicant_email_status == 1
        if (Number(this.props.stage_status) == 2) {
            return false;
        } else if ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage)) {
            return false;
        } else {
           return true;
        }
    }

    render() {
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
                                    <StageStatusDropdown
                                        stage_props={this.props}
                                            disable_status={this.getStgStatusDisabled()}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantCabStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0, allow_unsuccess_status_change: 1 })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                </div>
                                <div>
                                    <span className="Time_line_error_msg text_G_1">
                                        {applicantCabStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
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
                                    <div className={'f-12 pt-2 mb-4'} style={{ width: '150px' }}>Admin/recuiter user mark applicant invitation status as decline</div>
                                    {this.state.status_update_loading ? <i className="ie ie-loading my_Spin"></i> : ''}
                                    {this.state.status_update_decline ? <i className="icon icon-approved2-ie"></i> : ''}
                                </div> : null}
                                <div className="my-2"><button disabled={(this.props.applicant_email_status == 2 && this.props.applicant_status == 1) ? false : true} onClick={() => this.setState({ openReschedule: true })} className="limt_btns">Reschedule</button></div>
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

            {this.state.openReschedule ?
                <RescheduleGroupOrCabInterview
                    task_stage={6}
                    showModal={this.state.openReschedule}
                    closeModal={this.closeRescheduleModel}
                    applicant_id={this.props.applicant_id}
                    request_type={"reschedule_task"}
                /> : ''}

        </React.Fragment>);
    }
}

const mapStateToProps1 = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    application_id: state.RecruitmentApplicantReducer.details.application_id,
    ...state.RecruitmentApplicantReducer.cab_day_interview,
    applicant_status: state.RecruitmentApplicantReducer.details.status,
})

const mapDispatchtoProps1 = (dispach) => {
    return {
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


ApplicantResponseCabDayStage = connect(mapStateToProps1, mapDispatchtoProps1)(ApplicantResponseCabDayStage)
export { ApplicantResponseCabDayStage };

class CabDayResultStage extends Component {
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

    /**
     * Stage 6.3 status disable
     * Allow the users to change or update the status based on
     * 
     * If stage status is in-progress and the quiz status is not 0 - pending
     * 
     * Previous stage and current stage is equal
     * 
     */
    getStgStatusDisabled() {
	// && (this.props.quiz_status == 1 || this.props.quiz_status == 2)
        if (Number(this.props.stage_status) == 2 && (this.props.quiz_status == 1 || this.props.quiz_status == 2)) {
            return false;
        } else if ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage)) {
            return false;
        } else {
           return true;
        }
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
                                <h3><strong>Stage {this.props.stage}</strong></h3>
                                <h2>{this.props.title}</h2>

                                <div className="row">
                                    <div className="col-lg-6">
                                    </div>
                                </div>

                            </div>
                            <div className="Rec_Right_s_1">
                                <div>
                                    <StageStatusDropdown
                                        stage_props={this.props}
                                            disable_status={this.getStgStatusDisabled()}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantCabStageStatus('', this.props.quiz_status, true,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0, allow_unsuccess_status_change: 1  })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                </div>
                                <div>
                                    <span className="Time_line_error_msg text_G_1">
                                        {applicantCabStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                </div>
                            </div>
                        </div>

                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-12 Rec_center_s_1a mt-2 mb-1"><strong>Cab Day Results:</strong></div>
                        </div>
                        <div className="row d-flex justify-content-center">
                            <div>

                                {(this.props.quiz_status == 0 || !this.props.taskId) ? "Pending" :
                                    ((this.props.quiz_status == 1) ? <span className="O_btn_1 w-big my-1 txt_success">Applicant Successful</span> :
                                        <span className="O_btn_1 w-big my-1 txt_infor"><React.Fragment>Applicant Unsuccessful {(this.props.mark_as_no_show == 1) ? <React.Fragment><br />(Marked as No show)</React.Fragment> : ''}</React.Fragment></span>)}<br />

                                {this.props.mark_as_no_show == 1 ? <button disabled={(this.props.applicant_status == 1) ? false : true} onClick={() => this.setState({ openReschedule: true })} className="limt_btns">Reschedule</button>
                                    : <Link disabled={this.props.quiz_status == 1 ? false : true} to={this.props.quiz_status == 0 ? "/" : '/admin/recruitment/cab_interview_result/' + this.props.applicant_id + '/' + this.props.taskId} className="under_l_tx">View Results</Link>}

                            </div>
                        </div>

                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                                <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>

                        {this.state.openReschedule ?
                            <RescheduleGroupOrCabInterview
                                task_stage={6}
                                showModal={this.state.openReschedule}
                                closeModal={this.closeRescheduleModel}
                                applicant_id={this.props.applicant_id}
                                request_type={"reschedule_task"}
                            /> : ''}
                    </div>
                </div>
            </div>
        </div>);
    }
}

const mapStateToProps2 = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    application_id: state.RecruitmentApplicantReducer.details.application_id,
    ...state.RecruitmentApplicantReducer.cab_day_interview,
    applicant_status: state.RecruitmentApplicantReducer.details.status,
})

const mapDispatchtoProps2 = (dispach) => {
    return {
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};

CabDayResultStage = connect(mapStateToProps2, mapDispatchtoProps2)(CabDayResultStage)
export { CabDayResultStage };

class EmploymentContractStage extends Component {
    constructor() {
        super();
        this.state = {
            email_sended: false,
            email_loading: false,
            sms_sended: false,
            sms_loading: false
        }
    }

    resendDocusign = () => {
        var state = [];
        var req = { contractId: this.props.contractId, task_applicant_id: this.props.task_applicant_id, applicant_id: this.props.applicant_id } // this.props.task_applicant_id}
        state['email_sended'] = false;
        state['sms_sended'] = false;

        state['email_loading'] = true;
        this.setState(state);
        postData('recruitment/RecruitmentApplicant/resend_applicant_docusign_contract', req).then((result) => {
            if (result.status) {
                state['email_sended'] = true;
                toastMessageShow(result.msg, 's');
            } else {
                toastMessageShow(result.error, 'e');
            }
            state['email_loading'] = false;
            this.setState(state);
        });
    }

    sendReminderMail = () => {
        var state = [];
        state['sms_sended'] = false;
        state['email_sended'] = false;
        var req = { contractId: this.props.contractId, task_applicant_id: this.props.task_applicant_id, applicant_id: this.props.applicant_id } //   task_applicant_id: this.props.task_applicant_id}
        state['sms_loading'] = true;
        this.setState(state);
        postData('recruitment/RecruitmentApplicant/send_reminder_sms_for_docusign', req).then((result) => {
            if (result.status) {
                state['sms_sended'] = true;
                toastMessageShow(result.msg, 's');
            } else {
                toastMessageShow(result.error, 'e');
            }
            state['sms_loading'] = false;
            this.setState(state);
        });
    }

    /**
     * Stage 6.4 status disable
     * Allow the users to change or update the status based on
     * 
     * If stage status is in-progress
     * 
     * Previous stage and current stage is equal
     * 
     */
    getStgStatusDisabled() {
        // && this.props.signed_status == 1
        if (Number(this.props.stage_status) == 2 ) {
            return false;
        } else if ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage)) {
            return false;
        } else {
           return true;
        }
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
                                <h3><strong>Stage {this.props.stage}</strong></h3>
                                <h2>{this.props.title}</h2>

                                <div className="row">
                                    <div className="col-lg-6">

                                    </div>
                                </div>

                            </div>
                            <div className="Rec_Right_s_1">
                                <div>
                                    <StageStatusDropdown
                                        stage_props={this.props}
                                            disable_status={this.getStgStatusDisabled()}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantCabStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0, allow_unsuccess_status_change: 1, allow_completed_status: 0, signed_status: this.props.signed_status })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                </div>
                                <div>
                                    <span className="Time_line_error_msg text_G_1"> {applicantCabStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                </div>
                            </div>
                        </div>



                        <div className="limt_flex_set_0 mt-2">
                            <div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><strong>Contract Sent:</strong></div>
                                </div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1">{this.props.send_date ? moment(this.props.send_date).format('DD/MM/YYYY') : 'Pending'}</div>
                                </div>
                            </div>
                            <div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><strong>Docusign Response:</strong></div>
                                </div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><span className="O_btn_1">{this.props.signed_date ? "Signed" : "Sign"} -  {this.props.signed_date ? <React.Fragment>{moment(this.props.signed_date).format('DD/MM/YYYY')} </React.Fragment> : 'Pending'}</span></div>
                                </div>
                            </div>
                            <div>
                                <div className="mb-2"><button disabled={this.props.stage_status == 4 ? true : (this.props.signed_status != 0 || this.state.email_loading) ? true : false} onClick={this.resendDocusign} className="limt_btns">Resend Document</button></div>
                                {this.state.email_loading ? <i className="ie ie-loading my_Spin"></i> : ''}
                                {this.state.email_sended ? <i className="icon icon-approved2-ie"></i> : ''}
                                <div className="my-2"><button disabled={this.props.stage_status == 4 ? true :(this.props.signed_status != 0 || this.state.sms_loading) ? true : false} onClick={this.sendReminderMail} className="limt_btns">Send Reminder SMS</button></div>
                                {this.state.sms_loading ? <i className="ie ie-loading my_Spin"></i> : ''}
                                {this.state.sms_sended ? <i className="icon icon-approved2-ie"></i> : ''}
                                {/*<div className="mb-2"><button disabled={this.props.signed_status != 1? true: (this.props.signed_status != 0? false: true)} onClick={this.resendDocusign} className="limt_btns">Resend Document</button></div>
                            <div className="my-2"><button disabled={this.props.signed_status == 1? true: (this.props.signed_status == 0? false: true)} onClick={this.sendReminderMail} className="limt_btns">Send Reminder SMS</button></div> */}
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
        </div>);
    }
}

const mapStateToProps3 = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    application_id: state.RecruitmentApplicantReducer.details.application_id,
    ...state.RecruitmentApplicantReducer.cab_day_interview,
})

const mapDispatchtoProps3 = (dispach) => {
    return {
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};

EmploymentContractStage = connect(mapStateToProps3, mapDispatchtoProps3)(EmploymentContractStage)
export { EmploymentContractStage };

class MemberAppOnbordingStage extends Component {



    constructor() {
        super();
        this.state = {
            pinView: 0,
        }
    }

    setOnboarding = (value, type) => {
        postData('recruitment/RecruitmentApplicant/add_applicant_app_onboarding', { task_applicant_id: this.props.task_applicant_id, type: type, status: value }).then((result) => {
            if (result.status) {
                let statsData = {};
                if (type == 'orientation') {
                    statsData['app_orientation_status'] = value;
                } else if (type == 'onboarding') {
                    statsData['app_login_status'] = value;
                }
                var updateObj = this.props.cab_day_interview
                var updateObj = { ...updateObj, ...statsData }
                this.props.setApplicantInfoKeyValue({ cab_day_interview: updateObj });
            } else {
                toastMessageShow(result.error, 'e');
            }
        });
    }

    render() {


        var update_status = this.props.task_applicant_id && this.props.app_orientation_status == 0 && this.props.signed_status == 1 ? false : true;

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
                                <h3><strong>Stage {this.props.stage}</strong></h3>
                                <h2>{this.props.title}</h2>

                                <div className="row">
                                    <div className="col-lg-6">

                                    </div>
                                </div>

                            </div>
                            <div className="Rec_Right_s_1">
                                <div>
                                    <StageStatusDropdown
                                        stage_props={this.props}
                                            disable_status={this.props.stage_status == 2 ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantCabStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0 })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                </div>
                                <div>
                                    <span className="Time_line_error_msg text_G_1">
                                        {applicantCabStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                </div>
                            </div>
                        </div>

                        <div className="limt_flex_set_0 mt-2">
                            <div >
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1"><strong>One time PIN:</strong></div>
                                </div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1 justify-content-center w-100">
                                        <div className="icon icon-view w-100 color justify-content-center cursor-pointer" style={{ fontSize: '20px' }} onClick={() => this.setState({ pinView: !this.state.pinView })}>
                                        </div>

                                        <div className={this.state.pinView == 1 ? "my_tooltip_" : "hide"}>{this.props.applicant_pin || 'Pin not allotted'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 pl-3">
                                <div className="Stage_body_01 ">
                                    <div className="Stage_Left_1"><strong>Onboarding Complete:</strong></div>
                                </div>
                                <div className="Stage_body_01">
                                    <div className="Stage_Left_1 w-100">
                                        <div className="Time_Orient_div_">
                                            <span>Successful Login:</span>
                                            <span className="d-flex">
                                                <a className={"w-50 mr-1 Req_btn_out_1 _Succes_btn  " + ((this.props.app_login_status == 1) ? 'active ' : '') + ((this.props.app_login_status > 0) ? 'pointer-events-none ' : '')} onClick={() => this.setOnboarding(1, 'onboarding')}>Yes</a>
                                                <a className={"w-50 ml-1 Req_btn_out_1 _Error_btn  " + ((this.props.app_login_status == 2) ? 'active' : '') + ((this.props.app_login_status > 0) ? 'pointer-events-none ' : '')} onClick={() => this.setOnboarding(1, 'onboarding')}>No</a>
                                            </span>
                                        </div>
                                        <div className="Time_Orient_div_ pt-2">
                                            <span>Orientation Completed:</span>
                                            <span className="Time_Orient_span_">
                                                <div className="justify-content-center">
                                                    <label className="radio_F1"><input type="text" disabled={update_status} type="radio" checked={this.props.app_orientation_status == 1 ? true : false} onChange={() => this.setOnboarding(1, 'orientation')} name="aboriginal_tsi" value="1" /><span className="checkround"></span></label>
                                                    <span>Yes</span>
                                                </div>
                                                <div className="justify-content-center">
                                                    <label className="radio_F1"><input type="text" disabled={update_status} type="radio" checked={this.props.app_orientation_status == 2 ? true : false} onChange={(e) => this.setOnboarding(2, 'orientation')} name="aboriginal_tsi" value="1" /><span className="checkround"></span></label>
                                                    <span>NO</span>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
        </div>);
    }
}

const mapStateToProps4 = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    application_id: state.RecruitmentApplicantReducer.details.application_id,
    applicant_pin: state.RecruitmentApplicantReducer.details.pin,
    cab_day_interview: state.RecruitmentApplicantReducer.cab_day_interview,
    ...state.RecruitmentApplicantReducer.cab_day_interview,

})

const mapDispatchtoProps4 = (dispach) => {
    return {
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
        setApplicantInfoKeyValue: (obj) => dispach(setApplicantInfoKeyValue(obj)),
    }
};

MemberAppOnbordingStage = connect(mapStateToProps4, mapDispatchtoProps4)(MemberAppOnbordingStage)
export { MemberAppOnbordingStage };
