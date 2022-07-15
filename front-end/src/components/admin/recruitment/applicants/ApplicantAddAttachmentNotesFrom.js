import React, { Component } from "react";
import "react-select-plus/dist/react-select-plus.css";
import { archiveALL,toastMessageShow,handleChangeChkboxInput } from "service/common.js";
import jQuery from "jquery";
import { connect } from 'react-redux';
import {getApplicantAttachementStageNotesDetails,getApplicantLastUpdateDetails} from './../actions/RecruitmentApplicantAction.js';

class ApplicantAddAttachmentNotesFrom extends Component {
  constructor() {
    super();
      this.notesInitialState = { 
        applicant_attachment_note: '',
        loading: false  
    }
    this.state =this.notesInitialState;
     
  }
  componentDidMount(){
   }


   SaveNoteHandler = (e) => {
    e.preventDefault();
    jQuery("#applicant_attachment_notes_form").validate({ ignore: [] });
    if (jQuery("#applicant_attachment_notes_form").valid()) {
        if(this.props.current_stage_overwrite>0){
        let postData= {};
        postData['note'] = this.state.applicant_attachment_note;
        postData['applicantId'] = this.props.applicantDetailsDocPage.id;
        postData['is_main_stage'] = this.props.is_main_stage == true ? 1 : 0;
        postData['current_stage'] = this.props.current_stage_overwrite;
        postData['stage'] = this.props.stage_title;

        if (this.props.application) {
          postData['application_id'] = this.props.application.id
        }

        let msg = 'Are you sure, you want to save this note?';
        archiveALL(postData,msg,'recruitment/RecruitmentApplicant/save_application_stage_note').then((result) => {
            if(result.status){
               this.setState(this.notesInitialState);
               this.props.getApplicantAttachementStageNotesDetails(this.props.applicantDetailsDocPage.id);
               this.props.getApplicantLastUpdateDetails(this.props.applicantDetailsDocPage.id);
            }else{
                if(result.hasOwnProperty('error') || result.hasOwnProperty('msg')){
                    let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg :'')); 
                    toastMessageShow(msg,'e')
                 }
            }
        });

        }
    
    }
  };

  
  render() {
     return (
      <React.Fragment>
        <form
          id="applicant_attachment_notes_form"
          method="post"
          autoComplete="off"
        >
          <label className="bg_labs2 ">
            <strong> Add New Note</strong>{" "}
          </label>
          <div className="row d-flex  mb-4">
            <div className="col-md-8">
            <span className="required">
              <textarea data-rule-required="true" 
              data-msg-required="Add Note" placeholder="Note" 
              className="notes_txt_area textarea-max-size w-100" name="notes_txt_area"
              name="applicant_attachment_note" 
              value={this.state.relevant_task_note} 
              onChange={(e) => handleChangeChkboxInput(this, e, 'applicant_attachment_note')}
              value={this.state.applicant_attachment_note}
              data-rule-maxlength="500" 
              data-msg-maxlength="Note can not be more than 500 characters."
              ></textarea>
              </span>
            </div>
            <div className="col-md-3 align-items-end d-inline-flex">
              <a className="btn cmn-btn1 create_quesBtn" onClick={(e)=>this.SaveNoteHandler(e)}>Add New Note</a>
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  applicantDetailsDocPage:{...state.RecruitmentApplicantReducer.details}
  
})

const mapDispatchtoProps = (dispatch) => {
  return {
    getApplicantAttachementStageNotesDetails: (applicant_id) => dispatch(getApplicantAttachementStageNotesDetails(applicant_id)),
    getApplicantLastUpdateDetails: (applicant_id) => dispatch(getApplicantLastUpdateDetails(applicant_id))
   }
};

ApplicantAddAttachmentNotesFrom.defaultProps ={
    is_main_stage: false,
    current_stage_overwrite:0,
    stage_title:0,

    /**
     * Will be populated as object (ie: one of the items in `state.RecruitmentApplicantReducer.applications`) 
     * when application ID is retrievable from URL.
     * 
     * @type {object|null}
     */
    application: null,
};


export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantAddAttachmentNotesFrom)

