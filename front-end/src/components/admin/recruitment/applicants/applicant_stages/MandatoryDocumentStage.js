import React, { Component } from 'react';
import Select from 'react-select-plus';
import { postData, handleShareholderNameChange, toastMessageShow } from 'service/common.js';
import { applicantStageStatus } from 'dropdown/recruitmentdropdown.js';
import ScrollArea from 'react-scrollbar';
import moment from "moment";
import jQuery from "jquery";
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import './../recruit2.css';
import { connect } from 'react-redux'
import { getApplicantMainStageDetails, getApplicantStageWiseDetails } from './../../actions/RecruitmentApplicantAction';
import ManageDocumentsApplicant from './../ManageDocumentsApplicant';
import { AttachmentAndNotesAndCreateTask } from './AttachmentAndNotesAndCreateTask';
import StageStatusDropdown from './../StageStatusDropdown';

class DocumentCheckListStage extends Component {

    static defaultProps = {
        application: null,
    } 

    constructor() {
        super();
        this.state = {
            applicant_document_cat: [],
        }
    }

    componentDidMount() {
        this.setState({ applicant_document_cat: this.props.applicant_document_cat })
    }

    componentWillReceiveProps(newProps) {
        this.setState({ applicant_document_cat: newProps.applicant_document_cat })
    }

    enableAndSelectDocs = (details, index, value) => {
        if (!details.assined)
            handleShareholderNameChange(this, 'applicant_document_cat', index, 'selected', value);
    }

    chooseOptionalMandatory = (index, value) => {
        handleShareholderNameChange(this, 'applicant_document_cat', index, 'is_required', value);
    }

    selectDocument = (index, status) => {
        handleShareholderNameChange(this, 'applicant_document_cat', index, 'assined', status);
        handleShareholderNameChange(this, 'applicant_document_cat', index, 'selected', false);
    }

    SaveDocuments = () => {
        var req = { application_id: this.props.application.id, applicant_id: this.props.applicant_id, applicant_document_cat: this.state.applicant_document_cat }
        postData('recruitment/RecruitmentApplicant/update_mandatory_optional_docs_for_applicant', req).then((result) => {
            if (result.status) {
                this.setState({ magageDocModal: false });
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:true, application_id:this.props.application.id};
                this.props.getApplicantStageWiseDetails(request);
            } else {
                toast.dismiss();
                toastMessageShow(result.error, 'e');
            }
            this.setState({ loading: false });
        });
    }

    denyApproveApplicantDocCat = (det, status) => {
        this.setState({ loading: true });
        var req = { application_id: this.props.application.id, applicant_id: this.props.applicant_id, recruitment_doc_id: det.recruitment_doc_id, action: status, doc_cat: det.title,is_required:det.is_required }
        postData('recruitment/RecruitmentApplicant/approve_deny_applicant_doc_category', req).then((result) => {
            if (result.status) {
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:false, application_id:this.props.application.id};
                this.props.getApplicantStageWiseDetails(request);
            } else {
                toast.dismiss();
                toastMessageShow(result.error, 'e');
            }
            this.setState({ loading: false });
        });
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
                        <div className="Recruit_Time_header bb-1">
                            <div className="Rec_Left_s_1">
                                <h3><strong>{this.props.title}</strong></h3>

                                {/*<div className="row">
                                    <div className="col-lg-6">
                                        <button className="btn cmn-btn1" onClick={() => this.setState({ magageDocModal: true })}>Manage Documents</button>
                                    </div>
                                </div>*/}

                            </div>
                            <div className="Rec_Right_s_1">
                                <div>
                                    
                                        <StageStatusDropdown
                                            stage_props={this.props}
                                            disable_status={(this.props.stage_status == 2 && this.props.application_current_stage == this.props.id) ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
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

                        <div className="cstmSCroll1">
                            <ScrollArea
                                speed={0.8}
                                className="area"
                                contentClassName="content"
                                horizontal={false}
                                style={{ maxHeight: '350px', paddingRight: '30px' }}
                            >

                                <div className="CheckList_Mand_Option">
                                    {this.state.applicant_document_cat.map((val, index) => 
                                        
                                            <div className="Check_Mand_Option_li">
                                                <div className="Ch-MO-1"><span>{val.title}</span></div>
                                                <div className="Ch-MO-2">
                                                    <a className={(val.is_required == 1 ? "Man_btn_2" : "Man_btn_1")} href="#">{val.is_required == 1 ? "Mandatory" : "Optional"}</a>
                                                </div>
                                                <div className="Ch-MO-3 ml-3" style={{ minWidth: '45px' }}>
                                                    <span className="d-flex justify-content-between">
                                                        <i onClick={() => this.denyApproveApplicantDocCat(val, 1)} className={"icon icon-accept-approve2-ie mr-2 " + (val.is_approved == 1 ? 'active' : '')}></i>
                                                        <i onClick={() => this.denyApproveApplicantDocCat(val, 2)} className={"icon icon-close2-ie " + (val.is_approved == 2 ? 'active' : '')}></i>
                                                    </span>
                                                </div>
                                            </div> 
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                                {/* <div>Complete by: Smith Roy</div> */}

                                <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>
                    </div>

                    {this.state.magageDocModal ? <ManageDocumentsApplicant
                        showModal={this.state.magageDocModal}
                        closeModal={() => this.setState({ magageDocModal: false })}
                        enableAndSelectDocs={this.enableAndSelectDocs}
                        chooseOptionalMandatory={this.chooseOptionalMandatory}
                        selectDocument={this.selectDocument}
                        all_documents={this.state.applicant_document_cat}
                        closeAndSaveDocuments={this.closeAndSaveDocuments}
                        check_documents={this.state.check_documents}
                        SaveDocuments={this.SaveDocuments}
                    /> : ''}

                </div>
            </div>
        </div>);
    }
}

const mapStateToProps1 = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    application_current_stage: state.RecruitmentApplicantReducer.application_current_stage,
    applicant_document_cat: state.RecruitmentApplicantReducer.applicant_document_cat,
})

const mapDispatchtoProps1 = (dispach) => {
    return {
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};

DocumentCheckListStage = connect(mapStateToProps1, mapDispatchtoProps1)(DocumentCheckListStage);
export { DocumentCheckListStage };

class PositionAndAwardLevelsStage extends Component {

    constructor() {
        super();
        let pay_sc = JSON.parse(JSON.stringify([{ work_area: '' }, { pay_point: '' }, { pay_level: '' }]));

        this.state = {
            pay_scale_approval: [
                { work_area: '', pay_point: '', pay_level: '' },
                { work_area: '', pay_point: '', pay_level: '' },
                { work_area: '', pay_point: '', pay_level: '' },
            ],
        }
        this.validator = false;
    }

    componentDidMount() {
        if (this.props.pay_scale_approval.length > 0) {
            this.setState({ pay_scale_approval: this.props.pay_scale_approval });
        }
    }

    handleShareholderNameChange = (obj, stateName, index, fieldName, value) => {
        var state = {};
        var List = obj.state[stateName];
        List[index][fieldName] = value
        state[stateName] = List;

        obj.setState(state, () => {
            if (this.validator) {
                jQuery("#pay_scale_approval").valid();
            }
        });
    }

    componentWillReceiveProps = (newProps) => {
        if (newProps.pay_scale_approval.length > 0) {
            this.setState({ pay_scale_approval: newProps.pay_scale_approval });
        }
    }


    onSubmit = (e) => {
        e.preventDefault();
        this.validator = jQuery("#pay_scale_approval").validate();

        if (jQuery("#pay_scale_approval").valid()) {
            this.setState({ loading: true }, () => {
                postData('recruitment/RecruitmentApplicant/request_for_pay_scal_approval', { applicant_id: this.props.applicant_id, pay_scale_approval: this.state.pay_scale_approval }).then((result) => {
                    if (result.status) {
                        this.setState({ loading: false });
                         var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id};
                        this.props.getApplicantStageWiseDetails(request);
                    } else {
                        toast.dismiss();
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false });
                });
            });
        } else {
            this.validator = true;
        }
    }

    render() {
        var submit_dis = (typeof (this.props.pay_scale_approval_status) == "undefined" && this.props.stage_status == 2) ? (this.state.loading ? true : false) : true
        return (<div className=" time_l_1" >
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
                                    
                                        <StageStatusDropdown
                                            stage_props={this.props}
                                            disable_status={this.props.stage_status == 2 && this.props.pay_scale_approval_status == 1 ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
                                            stage_status={this.props.stage_status}
                                            stage_status_option={applicantStageStatus(0,0,false,{is_recruiter_admin:this.props.is_recruiter_admin,allow_inporgress_status_change:(this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? 1:0 })}
                                            stageId={this.props.id}
                                            stage_key={this.props.stage_key}
                                            enable_email_template_pop_up={false}
                                            application={this.props.application}
                                        />
                                    
                                </div>
                                <div>
                                    <span className="Time_line_error_msg text_G_1">
                                        {applicantStageStatus(this.props.stage_status)} {(this.props.stage_status == 3 || this.props.stage_status == 4) ? moment(this.props.action_at).format("DD/MM/YYYY LT") : ''}</span>
                                </div>
                            </div>
                        </div>

                        <form id="pay_scale_approval" method="post">
                            <div className="mt-1">
                                <div className="Award_list_table_">
                                    <div className="Award_list_header_">
                                        <div className="Award_col_1">
                                            <strong className="justify-content-start w-100 d-flex">Work Area:</strong>
                                        </div>
                                        <div className="Award_col_2">
                                            <strong>Level:</strong>
                                        </div>
                                        <div className="Award_col_3">
                                            <strong>Paypoint:</strong>
                                        </div>
                                    </div>

                                    {this.state.pay_scale_approval.map((val, index) => (
                                        <div className="Award_list_" key={index + 1}>
                                            <div className="Award_list_col_1">
                                                <strong>{index + 1}.</strong>
                                            </div>
                                            <div className="Award_list_col_2">
                                                <div className="w-100">
                                                    <div className="s-def1 s1">
                                                        <Select className="custom_select default_validation "
                                                            required={index == 0 ? true : false}
                                                            simpleValue={true}
                                                            searchable={false}
                                                            clearable={false}
                                                            onChange={(e) => this.handleShareholderNameChange(this, 'pay_scale_approval', index, 'work_area', e)}
                                                            options={this.props.work_area_option}
                                                            placeholder="Select work area"
                                                            value={val.work_area}
                                                            disabled={submit_dis}
                                                            inputRenderer={() => <input type="text" readOnly={true} className="define_input" name={"work_area" + index} required={index == 0 ? true : false} value={val.work_area} />}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="Award_list_col_3">
                                                <span className="w-100 s-def1 s1 gr_slctB">
                                                    <Select className="custom_select default_validation "
                                                        required={index == 0 ? true : false}
                                                        simpleValue={true}
                                                        searchable={false}
                                                        clearable={false}
                                                        onChange={(e) => this.handleShareholderNameChange(this, 'pay_scale_approval', index, 'pay_level', e)}
                                                        options={this.props.pay_level_option}
                                                        placeholder="Level"
                                                        value={val.pay_level}
                                                        disabled={submit_dis}
                                                        inputRenderer={() => <input type="text" readOnly={true} className="define_input" name={"pay_level" + index} required={index == 0 ? true : false} value={val.pay_level} />}
                                                    />
                                                </span>
                                            </div>
                                            <div className="Award_list_col_4">
                                                <span className="w-100 s-def1 s1 gr_slctB">
                                                    <Select className="custom_select default_validation "
                                                        required={index == 0 ? true : false}
                                                        simpleValue={true}
                                                        searchable={false}
                                                        clearable={false}
                                                        onChange={(e) => this.handleShareholderNameChange(this, 'pay_scale_approval', index, 'pay_point', e)}
                                                        options={this.props.pay_point_option}
                                                        placeholder="Paypoint"
                                                        value={val.pay_point}
                                                        disabled={submit_dis}
                                                        inputRenderer={() => <input type="text" readOnly={true} className="define_input" name={"pay_point" + index} required={index == 0 ? true : false} value={val.pay_point} />}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="Recruit_Time_header mt-3">
                                <div className="Rec_Left_s_1">&nbsp;</div>
                                <div className="Rec_Right_s_1">
                                    <button className="btn cmn-btn1 w-100" disabled={submit_dis} onClick={this.onSubmit}>Submit</button>
                                    {this.props.pay_scale_approval_status == 0 ? <span className="Time_line_error_msg">Awaiting Response - Sent {moment(this.props.requested_at).format('DD/MM/YYYY LT')}</span> : ''}
                                    {this.props.pay_scale_approval_status == 1 ? <span className="Time_line_error_msg">Approve at - {moment(this.props.requested_at).format('DD/MM/YYYY LT')}</span> : ''}
                                </div>
                            </div>
                        </form>

                        <div className="d-flex flex-wrap">
                            <div className="time_txt w-100 Rerm_time_txt">
                                <AttachmentAndNotesAndCreateTask stageDetailsAttachmentANdNotes={this.props.stageDetailsAttachmentANdNotes} CreateTaskShowModal={this.props.CreateTaskShowModal} openAttachmentModel={this.props.openAttachmentModel} />
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>);
    }
}

const mapStateToProps = state => ({
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    work_area_option: state.RecruitmentApplicantReducer.work_area_option,
    pay_point_option: state.RecruitmentApplicantReducer.pay_point_option,
    pay_level_option: state.RecruitmentApplicantReducer.pay_level_option,
    pay_scale_approval: state.RecruitmentApplicantReducer.pay_scale_approval,
    ...state.RecruitmentApplicantReducer.pay_scale_details,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
    }
};


PositionAndAwardLevelsStage = connect(mapStateToProps, mapDispatchtoProps)(PositionAndAwardLevelsStage);
export { PositionAndAwardLevelsStage }