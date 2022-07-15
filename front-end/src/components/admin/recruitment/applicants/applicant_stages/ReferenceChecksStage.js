import React, { Component } from 'react';
import Select from 'react-select-plus';

import { postData, handleShareholderNameChange, toastMessageShow, archiveALL } from 'service/common.js';
import { applicantStageStatus, applicantReferenceStatusApproveDeny } from 'dropdown/recruitmentdropdown.js';
import ReactTable from "react-table";
import moment from "moment";
import './../recruit2.css';
import { connect } from 'react-redux'
import { getApplicantInfo, setApplicantInfo, getApplicantStageWiseDetails } from './../../actions/RecruitmentApplicantAction';
import { AttachmentAndNotesAndCreateTask } from './AttachmentAndNotesAndCreateTask';
import CreateViewPhoneInterview from './../CreateViewPhoneInterview';
import StageStatusDropdown from './../StageStatusDropdown';

class ReferenceChecksStage extends Component {

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

    saveChanges = (e, detials) => {
        var req = {applicant_id: this.props.applicant_id, reference_id : detials.id, status : detials.status, relevant_note: detials.relevant_note,written_reference:detials.written_reference};
        
        postData('recruitment/RecruitmentApplicant/update_applicant_reference_status_note', req).then((result) => {
            if (result.status) {
                toastMessageShow('Updated Successfully', 's');
                this.props.setApplicantReferenceInfo({ references: this.state.references });
            }
        });
    }

    openCreateInterviewModel = (reference) => {

        this.setState({
            createPhoneInterviewModel: true,
            reference_id: reference.id,
            reference_interview_status: reference.interview_status,
            interview_form_id: reference.interview_form_id
        });
    }

    deleteInterview = (props) => {
        var req = {interview_applicant_form_id : props.interview_applicant_form_id}
        var msg = "Are you sure want to archive this Reference check Interview";

		archiveALL(req, msg, "recruitment/RecruitmentFormApplicant/archive_form_interview").then((result) => {
            if(result.status){
                toastMessageShow(result.msg, 's');
                this.props.getApplicantInfo(this.props.applicant_id, false);
                var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:false};
                this.props.getApplicantStageWiseDetails(request);
            }else{
                if(result.error){
                    toastMessageShow(result.error, 'e');
                }
            }
        })
    }

    closePhoneInterviewModel = (status) => {
        this.setState({ createPhoneInterviewModel: false });
        if (status) {
            this.props.getApplicantInfo(this.props.applicant_id, false);
            var request = {its_open:true, stage_number:this.props.stage_number, applicant_id:this.props.applicant_id,show_loading:false};
            this.props.getApplicantStageWiseDetails(request);
        }
    }

    render() {
        var columns = [
            {
                headerClassName: 'hdrCls',
                width: 100,
                className: (this.state.activeCol === 'firstName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_1 pl-0 pr-0',
                Cell: (props) => (<div className="text_ellip_2line text-left"><strong>Reference {props.index + 1}</strong></div>)
            },
            {
                accessor: "name",
                headerClassName: 'hdrCls',
                width: 120,
                className: (this.state.activeCol === 'name') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_2  pl-0 pr-0 ',
                Cell: (props) => (<div className="text_ellip_2line text-left">{props.value}</div>)
            },
            {
                accessor: "status",
                headerClassName: 'hdrCls',
                className: (this.state.activeCol === 'lastName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_3  pl-0 pr-0',
                Cell: (props) => (<div className="text_ellip_2line text-right">
                    <span style={{ cursor: "pointer" }} onClick={() => this.openCreateInterviewModel(props.original)}>
                        <u>{props.original.interview_status ? "View Interview" : "Create Interview"}</u>
                    </span>

                    {props.original.interview_status ?
                        <React.Fragment> &nbsp;&nbsp;<span style={{ cursor: "pointer" }} onClick={() => this.deleteInterview(props.original)}>
                            <u>Delete Interview</u>
                        </span></React.Fragment> : ""}

                    {props.value == 1 ?
                        <spna className="Req_btn_out_1 R_bt_co_green ml-2"> Approved</spna> :
                        <spna className="Req_btn_out_1 R_bt_co_  ml-2">Rejected</spna>}
                </div>)
            },
            {
                Header: "Expand",
                headerClassName: 'hdrCls',
                className: (this.state.activeCol === 'lastName') && this.state.resizing ? 'defaultCellCls' : 'Refer_colum_4  pl-0 pr-0 ',
                expander: true,
                Header: () => <strong>More</strong>,
                width: 35,
                Expander: ({ isExpanded, ...rest }) => (
                    <div className="text-right">
                        {isExpanded ? (
                            <i className="icon icon-arrow-down icn_ar1"></i>
                        ) : (
                                <i className="icon icon-arrow-right icn_ar1"></i>
                            )}
                    </div>
                ),
            }
        ];

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
                                            <StageStatusDropdown
                                                stage_props={this.props}
                                                disable_status={this.props.stage_status == 2 ? false : ((this.props.stage_status_details.hasOwnProperty('previous_stage') && this.props.id==this.props.stage_status_details.previous_stage) ? false:true)}
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

                            <div className="">
                                <ReactTable
                                    data={this.state.references}
                                    columns={columns}
                                    defaultPageSize={5}
                                    showPagination={false}
                                    collapseOnDataChange={false}
                                    SubComponent={(props) => <div className="References_table_SubComponent">
                                        <div className="col-lg-offset-1 col-lg-10">
                                            <div className="row mt-1">
                                                <div className="col-lg-5 text-left">
                                                    <label className="My_Label_">Reference Status:</label>
                                                    <div className="s-def1 s1">
                                                        <Select name="participant_assessment"
                                                            required={true}
                                                            simpleValue={true}
                                                            searchable={false}
                                                            clearable={false}
                                                            options={applicantReferenceStatusApproveDeny()}
                                                            value={props.original.status}
                                                            className={'custom_select'}
                                                            onChange={(e) => handleShareholderNameChange(this, 'references', props.index, 'status', e)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-1">
                                                <div className="col-lg-12 col-sm-12 text-left">
                                                    <label className="My_Label_">Relevant Notes:</label>
                                                    <textarea className="w-100 border-black" rows="5" maxlenght={500} onChange={(e) => handleShareholderNameChange(this, 'references', props.index, 'relevant_note', e.target.value)}
                                                        value={props.original.relevant_note}></textarea>
                                                </div>
                                            </div>

                                            <div className="limt_flex_set_0 mt-2">
                                                <div className="Stage_body_01">
                                                <label className="radio_F1 check_F1 mb-0" style={{width:'auto'}} >
                                                <input type="checkbox" name="" 
                                                onChange={(e) => handleShareholderNameChange(this, 'references', props.index, 'written_reference', e.target.checked) } 
                                                checked={(props.original.written_reference)?true:false}
                                                /><span
                                                className="checkround"></span><span className="txtcheck text_2_0_1">Written reference check {props.original.written_reference}</span></label>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-sm-12 text-right mb-3">
                                                    <button className="btn cmn-btn1" onClick={(e) => this.saveChanges(e, props.original)}>Save</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    className="References_table hide_header_ReferencesTable"
                                />
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

                {this.state.createPhoneInterviewModel ?
                    <CreateViewPhoneInterview
                        interview_status={this.state.reference_interview_status}
                        interview_form_id={this.state.interview_form_id}
                        reference_id={this.state.reference_id}
                        interview_type={"reference_check"}
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
    references: state.RecruitmentApplicantReducer.references,
})

const mapDispatchtoProps = (dispach) => {
    return {
        setApplicantReferenceInfo: (data) => dispach(setApplicantInfo(data)),
        getApplicantStageWiseDetails: (request) => dispach(getApplicantStageWiseDetails(request)),
        getApplicantInfo: (applicant_id, loading_status) => dispach(getApplicantInfo(applicant_id, loading_status)),
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(ReferenceChecksStage)