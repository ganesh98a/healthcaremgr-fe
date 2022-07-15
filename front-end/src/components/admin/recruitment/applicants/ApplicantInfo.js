import React, { Component } from 'react';
import Select from 'react-select-plus';
import { postData,   checkLoginWithReturnTrueFalse, getPermission } from 'service/common.js';
import ApplicantNotesModal from './ApplicantNotesModal';
import ApplicantAttachment from './ApplicantAttachment';

import EditApplicantInfo from './EditApplicantInfo';
import FlagApplicantModal from './FlagApplicantModal';
import CommunicationLog from './CommunicationLog';
import ApplicantLogs from './ApplicantLogs';
import UpdateApplicantSkill from './UpdateApplicantSkill';
import { Panel,  ProgressBar, PanelGroup } from 'react-bootstrap';
import AppliedApplicantionApplicant from './AppliedApplicantionApplicant';
import { DynamicComponentMapping } from './applicant_stages/DynamicComponentMapping';
import { applicantStageStatus } from 'dropdown/recruitmentdropdown.js';
import moment from "moment";
import './recruit2.css';
import { getOptionsRecruitmentStaff } from './../action_task/CommonMethod.js';
import { connect } from 'react-redux'
import { getApplicantInfo, getApplicantMainStageDetails, getApplicantStageWiseDetails,getApplicantAttachmentDetails, getApplicantLastUpdateDetails } from './../actions/RecruitmentApplicantAction';
import ApplicantAttachmentsAndNotesModal from './ApplicantAttachmentsAndNotesModal';
import CreateNewTask from './../action_task/CreateNewTask.js';
import { getTaskStageDetails } from './../actions/RecruitmentAction.js';
import _ from 'lodash';
import  {AttachmentAndNotesAndCreateTask}  from './applicant_stages/AttachmentAndNotesAndCreateTask';

import ReactPlaceholder from 'react-placeholder';
import { custNumberLine, customHeading, recruitmentStages, recruitmentSubStage } from 'service/CustomContentLoader.js';
import { ROUTER_PATH, RECRUITMENT_BY_PASS_DEMO_STAGE } from 'config.js';
import { Link } from 'react-router-dom';
import { toastMessageShow, css } from '../../../../service/common';
import ChooseApplicationModal from './ChooseApplicationModal';
import { save_viewed_log } from '../../../admin/actions/CommonAction.js';
import {getAddressForViewPage} from '../../oncallui-react-framework/services/common';

export const ApplicantInfoCommunicationLogs = ({ id, info_loading, applicant_name = "" }) => {

    const styles = css({
        heading: {
            marginBottom: 10,
        },
        iconBtnParent: {
            marginBottom: 20,
        },
        iconBtn: {
            width: 'auto',
            marginRight: 5,
        },
        icon: {
            fontSize: 22,
        }
    })

    return (
        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!info_loading}>
            <h3 style={styles.heading}><strong>Communication Logs</strong></h3>
            <div className="log_btnBoo" style={{marginBottom:"5px"}}>
                <Link id="c_sms" to={ROUTER_PATH + 'admin/recruitment/communications_logs?a=' + id + '&t=1&n=' + applicant_name} title={`SMS`} className={`btn cmn-btn1`} style={styles.iconBtn}>
                    <span className={`icon icon-whatsapp`} style={styles.icon}></span>
                </Link>
                <Link id="c_email" to={ROUTER_PATH + 'admin/recruitment/communications_logs?a=' + id + '&t=2&n=' + applicant_name} title={`Email`} className={`btn cmn-btn1`} style={styles.iconBtn}>
                    <span className={`icon icon-letter-mail-1`} style={styles.icon}></span>
                </Link>
            </div> 
            <div className="log_btnBoo" style={styles.iconBtnParent}>
                <Link id="c_phone" to={ROUTER_PATH + 'admin/recruitment/communications_logs?a=' + id + '&t=3&n=' + applicant_name} title={`Phone`} className={`btn cmn-btn1`} style={styles.iconBtn}>
                    <span className={`icon icon-call3-ie`} style={styles.icon}></span>
                </Link>
                <Link id="c_phone" to={ROUTER_PATH + 'admin/recruitment/application/notes/' + id } title={`Notes`} className={`btn cmn-btn1`} style={styles.iconBtn}>
                    <span className={`icon icon-notes3-ie`} style={styles.icon}></span>
                </Link>
            </div>
        </ReactPlaceholder>
    )
}


class ApplicantInfo extends Component {

    constructor(props) {
        super(props);
        var send_applicant_login = false;
        // Disable the Email app login btn based on env variable
        if (process.env.REACT_APP_RECRUIT_EMAIL_APP_LOGIN_ENABLE && process.env.REACT_APP_RECRUIT_EMAIL_APP_LOGIN_ENABLE === 'NO') {
            send_applicant_login = true;
        }
        this.state = {
            loading: true,
            ApplicantNotes: false,
            EditApplicant: false,
            editModeAssignRecruiter: false,
            ApplicantAttachmentsAndNotesModal: false,
            modal_type_stage_number:'',
            is_main_stage:false,
            current_stage_overwrite:null,
            CreateTaskShowModal:false,
            send_applicant_login: send_applicant_login,
            employment_contract_sending: false,
        }
        this.permission = (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? [] : JSON.parse(getPermission())):[];
        this.refTask = React.createRef();
    }

    /**
     * close applications selection modal
     */
    closeApplicationModal=()=>{
        this.setState({employment_contract_sending :false});
    }

    /**
     * opening applications selection modal
     */
    openApplicationModal=()=>{
        this.setState({employment_contract_sending :true});
    }

    /**
     * render applications selection modal
     */
    renderApplicationModal() {
        return (
            <React.Fragment>
                {
                    this.state.employment_contract_sending && (
                        <ChooseApplicationModal
                            applicant_id = {this.props.props.match.params.id}
                            application_id = {this.props.props.match.params.application_id}
                            showModal = {true}
                            closeModal = {this.closeApplicationModal}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    send_applicant_login = () => {
        if (this.state.send_applicant_login) {
            var req = { applicant_id: this.props.props.match.params.id}
            postData('recruitment/RecruitmentApplicant/send_applicant_login', req).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg,'s');
                }else if(!result.status && result.hasOwnProperty('error')){
                    toastMessageShow(result.error,'e');
                }
                this.setState({ send_applicant_login: false });
            });
        }
    }

    updateAssignRecruiter = () => {
        if (this.state.updatedRecruiter) {
            var req = { applicant_id: this.props.props.match.params.id, recruiter: this.state.updatedRecruiter.value, application_id: this.props.selected_application.id}
            postData('recruitment/RecruitmentApplicant/update_assign_recruiter', req).then((result) => {
                if (result.status) {
                    this.props.getApplicantInfo(this.props.props.match.params.id, this.props.selected_application.id);
                    this.setState({ editModeAssignRecruiter: false });
                }
            });
        }
    }

    closeFlageModel = (status) => {
        this.setState({flageModelOpen:false});
        if(status && this.props.selected_application){
             this.props.getApplicantInfo(this.props.props.match.params.id, this.props.selected_application.id);
        }
    }

    componentWillMount(){
        this.props.getApplicantAttachmentDetails(this.props.props.match.params.id);
    }
    componentDidMount() {
        this.props.getApplicantInfo(this.props.props.match.params.id, true);

        if (this.props.props.match.params.application_id) {
            save_viewed_log({ entity_type: 'application', entity_id: this.props.props.match.params.application_id });
        } else {
            save_viewed_log({ entity_type: 'applicant', entity_id: this.props.props.match.params.id });
        }

        if (this.props.props.match.params.application_id) {
            this.props.getApplicantMainStageDetails(this.props.props.match.params.id, this.props.props.match.params.application_id);
        }

        if(this.props.task_stage_list.length==0){
            this.props.getTaskStageDetails();
        }
    }

    // https://reactjs.org/docs/react-component.html#componentdidupdate
    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.selected_application) {
            if (prevProps.props.match.params.application_id != this.props.selected_application.id) {
                this.props.getApplicantMainStageDetails(this.props.props.match.params.id, this.props.props.match.params.application_id);
                save_viewed_log({ entity_type: 'application', entity_id: this.props.props.match.params.application_id });
            }
        }
    }

    openStagePanel = (its_open, stage_number,stage) => {
        var request = {its_open:its_open, stage_number:stage_number, applicant_id:this.props.id,show_loading:true, application_id:this.props.selected_application.id,stage_label_id:stage.id};
        this.props.getApplicantStageWiseDetails(request);
    }
    openAttachmentModel=(type,is_main_stage,current_stage_overwrite)=>{
        this.setState({ApplicantAddAttachmentsAndNotes:true,modal_type_stage_number:type,is_main_stage:is_main_stage,current_stage_overwrite:current_stage_overwrite});
    }

    CreateTaskCloseModal = (status) => {
        if(status){
            var request = {its_open:true, stage_number:this.state.current_open_stage_number, applicant_id:this.props.id,show_loading:true, application_id:this.props.selected_application.id};
            this.props.getApplicantStageWiseDetails(request);
            if(this.state.current_open_stage_number==3|| this.state.current_open_stage_number==8){
                this.props.getApplicantMainStageDetails(this.props.props.match.params.id, this.props.selected_application.id);
            }

        }
         this.setState({ CreateTaskShowModal: false });
    }

    CreateTaskShowModal = (stage) => { console.log('stage',stage)
        this.setState({ CreateTaskShowModal: true, current_open_stage_number: stage },()=>{
            if (this.refTask.hasOwnProperty('current')) {
                if(!this.permission.access_recruitment_admin && (stage =='3' ||stage =='6')){
                    stage = '0';
                }
                console.log(this.props.task_stage_list)
                let stageValue = _.find(this.props.task_stage_list,{stage_number:stage});
                console.log('stage->',stage);

                console.log('stageValue->',stageValue);
                let stageVal = stageValue!=undefined && stageValue.hasOwnProperty('value') ? stageValue.value : '';
                if(stageVal!=''){
                    this.refTask.current.wrappedInstance.setStageAndApplicatById(stageVal,this.props.props.match.params.id);
                }
            }
        })
    }

    skipStage = (stageNumber) => {
        const { id: application_id } = this.props.selected_application || {}

        if (stageNumber==3 || stageNumber==6) {
            var req = { applicant_id: this.props.props.match.params.id, stageNumber: stageNumber, application_id: application_id }
            postData('recruitment/RecruitmentCabDayInterview/call_bypass', req).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg,'s');
                    this.props.getApplicantMainStageDetails(this.props.props.match.params.id, this.props.selected_application.id);
                    this.props.getApplicantInfo(this.props.props.match.params.id, true);
                }else if(!result.status && result.hasOwnProperty('error')){
                    toastMessageShow(result.error,'e');
                }
            });
        }else{
            toastMessageShow('Invalid Request.','e');
        }
    }

    /**
     * generate cab certificate
     */
    geneateCabCertificate = () => {
        var req = { applicant_id: this.props.props.match.params.id, application_id: this.props.selected_application ? this.props.selected_application.id : 0}
        postData('recruitment/RecruitmentCabDayInterview/genearate_cab_certificate', req).then((result) => {
            if (result.status) {
                // this.props.getApplicantInfo(this.props.props.match.params.id, this.props.selected_application.id);
                this.props.getApplicantAttachmentDetails(this.props.props.match.params.id);
                toastMessageShow(result.msg,'s');
            } else {
                toastMessageShow(result.error,'e');
            }
            this.setState({ cab_cert_gen: false });
        });
    }

    render() {
        const applicant_status_color = { Successful: 'clr_green', Parked: 'clr_yellow', Rejected: 'clr_red' };

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12 col-md-12 no-pad back_col_cmn-">
                        <a onClick={() => this.props.props.history.goBack()}>
                            <span className="icon icon-back1-ie"></span>
                        </a>

                    </div>
                </div>
                {this.renderApplicationModal()}

                <div className="row">

                    <div className="col-lg-12 col-md-12 main_heading_cmn- d_flex1">
                        <div className="col-md-7 align-self-center">
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.props.info_loading}>
                            <h1>{this.props.showPageTitle}</h1>
                        </ReactPlaceholder>
                        </div>


                        <div className="Lates_up_1 col-md-5 bl-1 align-self-center bl-xs-0 pt-xs-3">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(3)} ready={!this.props.info_loading}>
                            <div className="Lates_up_a col-md-4 align-self-center text-right">Latest Update:</div>
                            <div className="col-md-8 justify-content-between pr-0">
                                <div className="Lates_up_b">
                                    {/*<div className="Lates_up_txt align-self-center"><b>Stage 2:</b> Phone Interview Completed</div>*/}
                                    <div className="Lates_up_txt align-self-center">{this.props.last_update.specific_title || 'N/A'}</div>
                                    <div className="Lates_up_btn">
                                        <i className="icon icon-view1-ie" onClick={() => this.setState({logsModelOpen: true})}></i><span>View all</span>
                                    </div>
                                </div>
                                <div className="Lates_up_2">
                                    <div className="Lates_up_txt2 btn-1"><span className="w-50"><b>Date:</b> {this.props.last_update.created? moment(this.props.last_update.created).format("DD/MM/YYYY"): 'N/A'}</span> <span  className="w-50"> <b>Time:</b> {this.props.last_update.created? moment(this.props.last_update.created).format("LT"): 'N/A'}</span></div>
                                </div>
                            </div>
                            </ReactPlaceholder>
                        </div>

                    </div>
                </div>
                {/* row ends */}

                <div className="row bg_w">
                    <div className="app_infoBox__">
                        <div className="row">

                            <div className="col-md-12 col-sm-12 d_flex1  align-items-center pb_15p bor_bot_b">

                                <h4 className="flex-1 pr_15p"><ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(40, 'left')} ready={!this.props.info_loading}>
                                <strong>Applicant Info</strong></ReactPlaceholder></h4>
                                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(0, 'center')} ready={!this.props.info_loading}>
                                    <button onClick={() => this.setState({send_applicant_login:true}, () => this.send_applicant_login() )} className="btn cmn-btn1 mr-2" disabled={this.state.send_applicant_login || this.props.flagged_status == 2}>Email App Login</button>
                                    <button disabled={true || this.props.flagged_status == 2} onClick={() => this.setState({cab_cert_gen:true}, () => this.geneateCabCertificate() )} className="btn cmn-btn1 mr-2">CAB Certificate</button>

                                    <button disabled={true || this.props.flagged_status == 2} onClick={() => this.openApplicationModal()} className="btn cmn-btn1 mr-2">Employment Contract</button>

                                    <button disabled={this.props.flagged_status == 2 || false} onClick={() => this.setState({EditApplicant:true})} className="btn cmn-btn1 eye-btn">Edit Applicant Info</button>
                                </ReactPlaceholder>
                            </div>
                            {/* col-sm-12 ends */}

                            <div className="col-md-12 col-sm-12 bor_bot_b pb_15p">
                                <div className="row mt-3 d_flex1 flex_wrap1 pb_15p after_before_remove">

                                    <div className="col-lg-2 col-md-5 col-sm-6 col-xs-12">
                                    <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(5)} ready={!this.props.info_loading}>
                                        <h3 className="pb_15p"><strong>{this.props.fullname}</strong></h3>
                                        <h4>(Id: APP-{this.props.appId})</h4>

                                        {/* <div className={"Def_btn_01 my-3"}>{this.props.applicant_status}</div> */}

                                        <label className="customChecks chck_clr1 mt-1 pl-sm-2">
                                            <input type="checkbox" onChange={() => this.setState({flageModelOpen: true})} disabled={ this.props.flagged_status == 0? false: true} checked={this.props.flagged_status == 2? true: false}/>
                                            <div className="chkLabs fnt_sm">{this.props.flagged_status==1 ? 'Flag Applicant pending':'Flag Applicant as Inappropriate'}</div>
                                        </label>
                                        </ReactPlaceholder>
                                    </div>

                                    <div className="col-lg-8 col-md-7 pd_lr_20p col-sm-6 col-xs-12">

                                        <div className="row">

                                            <div className="col-lg-4 col-md-6">
                                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(6)} ready={!this.props.info_loading}>
                                                <h5><strong>Applicant Information:</strong></h5>

                                                <div className="cstm_Tble mt-2 apli_infTble1 ">

                                                    <div className="cstm_tr">
                                                        <div><strong>Phone:</strong></div>
                                                        {this.props.phones.map((val, index) => (
                                                            <div key={index + 1}>{val.phone ? ('+61 '+val.phone) : ''}</div>
                                                        ))}
                                                    </div>
                                                    <div className="cstm_tr">
                                                        <div><strong>Email:</strong></div>
                                                        {this.props.emails.map((val, index) => (
                                                            <div key={index + 1}>{val.email}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <h5 className="mt-2"><strong>Primary Address:</strong></h5>
                                                <div className="fnt_14 mt-1 mb-1" >{this.props.is_manual_address==1 ? (getAddressForViewPage(this.props.manual_address , this.props.unit_number)) :  getAddressForViewPage(this.props.address , this.props.unit_number)}</div>

                                            </ReactPlaceholder>
                                            </div>


                                            <div className="col-lg-8 col-md-6">
                                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!this.props.info_loading}>
                                            <h5><strong>References:</strong></h5>
                                            <div className="row d-flex flex-wrap appLi_listBor__ mt-1">
                                            {this.props.references.map((val, index) => (
                                                <div className="col-lg-6 col-md-12" key={index + 1}>
                                                    {/* console.log((index % 2)) */}
                                                    <div className={"cstm_Tble w-90 apli_infTble1"}>
                                                        <div className="cstm_tr">
                                                            <div><strong>Name:</strong></div>
                                                            <div>{val.name}</div>
                                                        </div>
                                                        <div className="cstm_tr">
                                                            <div><strong>Phone:</strong></div>
                                                            <div>{val.phone ? ('+61 '+val.phone) : ''}</div>
                                                        </div>
                                                        <div className="cstm_tr">
                                                            <div><strong>Email:</strong></div>
                                                            <div>{val.email}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            </div>
                                            </ReactPlaceholder>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="col-lg-2 col-md-12 bor_l_b pd_lr_20p bl-sm-0 bt-sm-1 pt-sm-3 mt-sm-4 col-sm-12 col-xs-12">

                                        <div className="row">
                                            <div className="col-sm-6 col-md-12" style={{textAlign: "center"}}>
                                                <ApplicantInfoCommunicationLogs applicant_name={this.props.fullname} id={this.props.id} info_loading={this.props.info_loading} />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                            {/* col-sm-12 ends */}


                            <div className="col-sm-12">
                                <div className="row  d-flex flex-wrap mt-2">

                                    <AppliedApplicantionApplicant
                                        application={this.props.selected_application}
                                    />

                                </div>


                            </div>
                            {/* col-sm-12 ends */}

                        </div>
                    </div>
                    {/* app_infoBox__ ends */}
                </div>

                <ApplicantAttachment
                    application={this.props.selected_application}
                />


                { this.props.selected_application && (
                    /* Using key forces the component and its children to re-render */
                    <div className="row mt-3" key={this.props.selected_application.id}>
                        <div className="col-md-12 col-lg-12 pb_10p">
                            <h3>
                                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(40, 'left')} ready={!this.props.info_loading}><strong>Recruitment progress</strong></ReactPlaceholder>
                            </h3>
                            <div className="bor_bot_b" style={{ marginTop: 20 }}>
                                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(0, 'center')} ready={!this.props.info_loading}>
                                    <div className="progress-b1">
                                        <div className="overlay_text_p01"> {this.props.applicant_progress}% Complete</div>
                                        <ProgressBar className="progress-b2" now={this.props.applicant_progress}  >
                                        </ProgressBar>
                                    </div>
                                </ReactPlaceholder>
                            </div>
                        </div>


                        <div className="col-md-12 text-center" >

                            <div className="Version_timeline_4 timeline_1 rec_applicatn_timeline" style={{
                                display: "inline-flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                margin: "0px auto"
                            }}>
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={recruitmentStages()} ready={!this.props.info_loading}>
                                {this.props.stage_details.map((stage, index) => {
                                    return(
                                    <div className="time_l_1" key={index + 1}>
                                        <div className="time_no_div">
                                            <div className="time_no"><span>{stage.display_stage_number}</span></div>
                                            <div className="line_h"></div>
                                        </div>

                                        <div className="time_d_1" >
                                            <div className="time_d_2">
                                                <PanelGroup
                                                id={"panel_"+stage.stage_number}
                                                accordion
                                                onSelect={(e) => { this.openStagePanel(!stage.its_open, stage.stage_number,stage)}}
                                                >
                                                <Panel eventKey={stage.stage_number} >
                                                    <div className="time_txt w-100">
                                                        <div className="time_d_style v4-1_">
                                                            <Panel.Heading >
                                                                <Panel.Title toggle className="v4_panel_title_ v4-2_ mb-0">
                                                                    <div className="timeline_h tm_subHd"><span>Stage {stage.stage_number}</span><i  className="icon icon-arrow-down"></i></div>
                                                                    <div className="timeline_h tm_subShrH">{stage.title}</div>
                                                                </Panel.Title>

                                                            </Panel.Heading>

                                                            <div className="task_table_v4-1__">
                                                                <div className="t_t_v4-1">
                                                                    <div className={"t_t_v4-1a complete_msg"}>
                                                                        {/* TODO: Green badge color for unsuccessful stage is misleading */}
                                                                        <div className="ci_btn">{applicantStageStatus(stage.stage_status)}</div>
                                                                        <div className="ci_date">
                                                                            {(stage.stage_status == 3 || stage.stage_status == 4) ? <React.Fragment>{moment(stage.action_at).format("DD/MM/YYYY")} - {stage.action_username} </React.Fragment> : ''}
                                                                        </div>
                                                                    </div>
                                                                    <div className="t_t_v4-1b">
                                                                        <AttachmentAndNotesAndCreateTask
                                                                            showSkillsOption={true}
                                                                            UpdateSkillShowModal={() => this.setState({updateSkillShowModal: true})}
                                                                            CreateTaskShowModal={this.CreateTaskShowModal}
                                                                            openAttachmentModel={this.openAttachmentModel}
                                                                            stageDetailsAttachmentANdNotes={{task_stage_number:stage.id,stageId:stage.id,stage_number:stage.stage_number,overwrite_stage:true,is_main_stage:true,stage_status:stage.stage_status}}
                                                                        />
                                                                    </div>
                                                                </div>

                                                            </div>
                                                            {/*Skip_stage btn will come in GI and CAB day only*/}
                                                            <div className="text-right">
                                                            {(RECRUITMENT_BY_PASS_DEMO_STAGE ==0 && ((stage.stage_number==3 && stage.stage_status==2 && stage.key_name=='group_interview') || (stage.stage_number==6 && stage.stage_status==2 && stage.key_name=='cab_day')))?<button className="ci_btn" style={{marginRight:'0'}} onClick={()=>this.skipStage(stage.stage_number)}>Skip Stage</button>:<React.Fragment/>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Panel.Body collapsible className="px-1 py-3">
                                                        <div className="time_line_parent w-100">
                                                            {stage.sub_stage.map((sub_stage, sub_index) => {
                                                                var MyComponent = sub_stage.component_name ? DynamicComponentMapping[sub_stage.component_name] : 'React.Fragment';
                                                                return (<ReactPlaceholder showLoadingAnimation={true} customPlaceholder={recruitmentSubStage()} ready={!stage.its_loading}>
                                                                        <MyComponent key={sub_index + 1} {...sub_stage} stage_number={stage.stage_number}
                                                                        stageDetailsAttachmentANdNotes={{task_stage_number:stage.id,stageId:sub_stage.id,stage_number:sub_stage.stage,overwrite_stage:true,is_main_stage:false,stage_status:sub_stage.stage_status}} CreateTaskShowModal={this.CreateTaskShowModal} openAttachmentModel={this.openAttachmentModel}
                                                                        selected_application={this.props.selected_application} application={this.props.selected_application} stage_status_details={this.props.stage_status_details} is_recruiter_admin={this.permission.access_recruitment_admin}/>
                                                                        </ReactPlaceholder>)
                                                            }
                                                            )}
                                                        </div>
                                                    </Panel.Body>

                                                </Panel>
                                                </PanelGroup>
                                            </div>
                                        </div>
                                    </div>
                                )})}
                                </ReactPlaceholder>
                            </div>

                        </div>
                    </div>
                )}


                {this.state.flageModelOpen?<FlagApplicantModal showModal={this.state.flageModelOpen} closeModal={this.closeFlageModel} applicant_id={this.props.id} />:''}
                {this.state.ApplicantNotes? <ApplicantNotesModal show={this.state.ApplicantNotes} close={() => this.setState({ ApplicantNotes: false })} />:''}
                {this.state.EditApplicant ? <EditApplicantInfo avatar={this.props.avatar} uuid={this.props.uuid} show={this.state.EditApplicant} close={() => this.setState({ EditApplicant: false })} stateList={this.props.stateList} />:''}
                {this.state.logsModelOpen? <ApplicantLogs show={this.state.logsModelOpen} closeModal={() => { this.setState({ logsModelOpen: false }) }} applicant_id={this.props.id} />:''}
                {this.state.ApplicantAddAttachmentsAndNotes ? <ApplicantAttachmentsAndNotesModal show={this.state.ApplicantAddAttachmentsAndNotes} close={() => this.setState({ ApplicantAddAttachmentsAndNotes: false })} stage_title={this.state.modal_type_stage_number} is_main_stage={this.state.is_main_stage} current_stage_overwrite={this.state.current_stage_overwrite} overwrite_stage={true}
                    application={this.props.selected_application}
                />:''}
                {(this.state.CreateTaskShowModal) ? <CreateNewTask showModal={this.state.CreateTaskShowModal} closeModal={this.CreateTaskCloseModal} ref={this.refTask} application={this.props.selected_application} /> : ''}
                {(this.state.viewCommunicationLog) ? <CommunicationLog showModal={this.state.viewCommunicationLog} applicant_id={this.props.id} log_type={this.state.viewLogType} closeModal={() => this.setState({viewCommunicationLog: false})}  /> : ''}
                {(this.state.updateSkillShowModal) ? <UpdateApplicantSkill showModal={this.state.updateSkillShowModal} applicant_id={this.props.id} closeModal={() => this.setState({updateSkillShowModal: false})}  /> : ''}

            </React.Fragment >
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const application_id = _.get(ownProps, 'props.match.params.application_id', null)
    let selected_application = null
    if (!!parseInt(application_id)) {
        selected_application = state.RecruitmentApplicantReducer.applications.length > 0 ? (state.RecruitmentApplicantReducer.applications || []).find(a => parseInt(a.id) === parseInt(application_id)) : [];
    }

    return {
        ...state.RecruitmentApplicantReducer.details,
        ...state.RecruitmentApplicantReducer.applicant_address,
        phones: state.RecruitmentApplicantReducer.phones,
        emails: state.RecruitmentApplicantReducer.emails,
        references: state.RecruitmentApplicantReducer.references,
        applications: state.RecruitmentApplicantReducer.applications,
        stage_details: state.RecruitmentApplicantReducer.stage_details,
        applicant_progress: state.RecruitmentApplicantReducer.applicant_progress,
        stage_status_details: state.RecruitmentApplicantReducer.stage_status_details,
        last_update: state.RecruitmentApplicantReducer.last_update,
        info_loading: state.RecruitmentApplicantReducer.info_loading,
        task_stage_list: state.RecruitmentReducer.task_stage_option,
        showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
        showTypePage: state.RecruitmentReducer.activePage.pageType,
        interview_stage: state.RecruitmentApplicantReducer.interview_stage,
        stateList: state.CommonReducer.states,
        selected_application,
    }
}

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfo: (applicant_id, loading_status) => dispach(getApplicantInfo(applicant_id, loading_status)),
        getApplicantMainStageDetails: (applicant_id, application_id) => dispach(getApplicantMainStageDetails(applicant_id, application_id)),
        getApplicantAttachmentDetails: (applicant_id) => dispach(getApplicantAttachmentDetails(applicant_id)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
        getTaskStageDetails: () => dispach(getTaskStageDetails()),
        getApplicantLastUpdateDetails: (applicant_id) => dispach(getApplicantLastUpdateDetails(applicant_id)),
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantInfo)