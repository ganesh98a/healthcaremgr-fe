import React, { Component } from "react";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import ScrollArea from "react-scrollbar";
import ApplicantAddAttachmentFrom from './ApplicantAddAttachmentFrom.js';
import { applicantAttchmentDocumentShow } from 'dropdown/recruitmentdropdown.js';
import _ from 'lodash';
import { connect } from 'react-redux';
import {NottachmentAvailable} from 'service/custom_value_data.js';
import { downloadSelectedRecuritmentAttachment, selecteRecuritmentAttachment,archiveSelectedRecuritmentAttachment,getApplicantAttachmentDetails, getApplicantAttachementStageNotesDetails } from './../actions/RecruitmentApplicantAction';
import ApplicantAddAttachmentNotesFrom from './ApplicantAddAttachmentNotesFrom.js';
import SimpleBar from "simplebar-react";


class ApplicantAttachmentsAndNotesModal extends Component {

  static defaultProps = {
    /**
     * if application ID is retrievable from URL and belongs to the applicant,
     * this will be populated as object
     * 
     * @type {object|null}
     */
    application: null,
  }

  constructor() {
    super();
    this.state = {
      documentsSelected: 0,
      newDocumentUpload: false,
      activeDownload:{},
      restrictedArchiveDraftContratct:{},
    };
    this.scrollAreaData = React.createRef();
  }
  componentWillMount(){
    if(this.props.applicant_notes_list.length<=0){
      this.props.getApplicantAttachementStageNotesDetails(this.props.applicantDetails.id);
    }
  }

  closeAttachment = (resp) => {
    if (resp) {

    }
    this.setState({ newDocumentUpload: false });
  }

  scrollTopData(){
    this.scrollAreaData.current.scrollTop();
  }

  
  attachmentListRefresh(){
    this.props.getApplicantAttachmentDetails(this.props.applicantDetails.id);
  }


  render() {
    let attachmentData = this.props.applicant_attachment_list.filter((row) => row.archive == this.state.documentsSelected && ((this.props.is_main_stage == false && row.current_stage_level == this.props.stage_title) || (this.props.is_main_stage == true && _.floor(row.current_stage_level) == this.props.current_stage_overwrite)));
    let attachmentNotesData = this.props.applicant_notes_list.filter((row) => (
      (this.props.is_main_stage == false && row.current_stage_level == this.props.stage_title) 
      || (this.props.is_main_stage == true && _.floor(row.current_stage_level) == this.props.current_stage_overwrite)));
    
    if (this.props.application) {
      attachmentData = attachmentData.filter(a => parseInt(a.application_id) === parseInt(this.props.application.id))
      attachmentNotesData = attachmentNotesData.filter(note => parseInt(note.application_id) === parseInt(this.props.application.id))
    }
    
    return (
      <div className={"customModal " + (this.props.show ? " show" : "")}>
        <div className="cstomDialog widBig">
          <h3 className="cstmModal_hdng1--">
            Stage {this.props.stage_title} - Notes
            <span
              className="closeModal icon icon-close1-ie"
              onClick={this.props.close}
            ></span>
          </h3>

          <div className="row">
            <div className="col-sm-12 align-self-center">
              <label className="bg_labs2 mb-2">
                <strong> Stage {this.props.stage_title} - Notes</strong>{" "}
              </label>
            </div>
          </div>


          <SimpleBar
                      style={{
                        maxHeight: "450px",
                        paddingLeft: "0px",
                        paddingRight: "0px",
                        paddingBottom: "15px"
                      }}
                      forceVisible={false}
                    >
          <div className="aTTach_nOTe">
            {attachmentNotesData.length>0? attachmentNotesData.map((row,index)=>{
              return (<div className="aTTach_nOTe_li" key={index}>
              <div className="aTTach_nOTe_Name">{row.created_by}</div>
              <div className="aTTach_nOTe_Des">
                <p>
                <div className=" cstmSCroll1">
                <ScrollArea
                  speed={0.8}
                  className="stats_update_list"
                  contentClassName="content"
                  style={{
                    paddingRight: "15px",
                    height: "auto",
                    maxHeight: "150px"
                  }}
                >
                {row.notes}
                 </ScrollArea>
                 </div>
                </p>
              </div>
              <div className="aTTach_nOTe_Date">Date: {row.created_date}</div>
          </div>)

            }):<NottachmentAvailable msg={'No note available'}/>}
              

          </div>
          </SimpleBar>


          <div className="row  mr_tb_20 bt-1"></div>
          <ApplicantAddAttachmentNotesFrom stage_title={this.props.stage_title} is_main_stage={this.props.is_main_stage} current_stage_overwrite={this.props.current_stage_overwrite}
              application={this.props.application}
          />



          {/* <div className="row  mr_tb_20 bt-1"></div>

          <div className="row pd_lf_15">

            <div className="col-md-12">
              <div className="row d-flex">
                <div className="col-sm-8 align-self-center">
                  <label className="bg_labs2 mb-0">
                    <strong> Stage {this.props.stage_title} - Attachments</strong>{" "}
                  </label>
                </div>
                <div className="col-sm-4">
                  <div className="cmn_select_dv ">
                    <Select
                      name="view_by_status "
                      required={true}
                      simpleValue={true}
                      searchable={false}
                      clearable={false}
                      placeholder="Select Type"
                      options={applicantAttchmentDocumentShow()}
                      onChange={e => this.setState({ documentsSelected: e,activeDownload:{}  }, () => {
                        this.scrollTopData();
                      })}
                      value={this.state.documentsSelected}
                    />
                  </div>
                </div>
              </div>

              <div className="row ">
                <div className="col-sm-12">
                  <div className="row mr_tb_20 "></div>
                  <div className=" cstmSCroll1">
                    <ScrollArea
                      speed={0.8}
                      className="stats_update_list"
                      contentClassName="content"
                      style={{
                        paddingRight: "15px",
                        height: "auto",
                        maxHeight: "300px"
                      }}
                      ref={this.scrollAreaData}
                    >
                      <div className="row attch_row">
                        {attachmentData.length>0? attachmentData.map((row, index) => {
                          let selectDocumentAttribute = {};
                          //if(row.archive==0){
                            selectDocumentAttribute['onClick'] = ()=>selecteRecuritmentAttachment(this,row.id,row.draft_contract_type);
                          //}
                          let classActiveAdd ='';
                          if(this.state.activeDownload[row.id]){
                            classActiveAdd='select_active';
                          }
                          return (
                            <div className="col-lg-2 col-sm-3 col-xs-4" key={index}>
                              <div className="attach_item">
                                <h5>
                                  <strong>{row.category_title}</strong>
                                </h5>
                                <p className={'ellipsis_line__'}>{row.attachment_title}</p>
                                <i className={"icon icon-document3-ie " + classActiveAdd} {...selectDocumentAttribute}></i>
                                <p>{row.attachment}</p>
                              </div>
                            </div>
                          );

                        }):(<div className="pb-5 w-100"><NottachmentAvailable/></div>)
                        }


                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="row  mr_tb_20 bt-1"></div>

         <React.Fragment><div className="row pd_lf_15 ">
            <div className="col-md-12 ">
              <div className="row mt-5">
                <div className="col-md-6 pr-5">
                  <button className="cmn-btn1 btn btn-block atchd_btn1__" onClick={()=>downloadSelectedRecuritmentAttachment(this)}>
                    Download Selected Documents
                  </button>
                {this.state.documentsSelected==0? ( <button className="cmn-btn1 btn btn-block atchd_btn1__" onClick={()=>archiveSelectedRecuritmentAttachment(this)}>
                  Archive Selected Documents
                  </button>):<React.Fragment/>}
                </div>
                {!this.state.newDocumentUpload && this.state.documentsSelected==0 ? <div className="col-md-6 pr-5">
                  <button className="cmn-btn1 btn btn-block atchd_btn1__" onClick={() => this.setState({ newDocumentUpload: true })}>
                  Select a New document to Upload
                  </button>
                </div> : this.state.documentsSelected==0 ?<ApplicantAddAttachmentFrom closeModel={this.closeAttachment} overwrite_stage={this.props.overwrite_stage} is_main_stage={this.props.is_main_stage} current_stage_overwrite={this.props.current_stage_overwrite} application={this.props.application} />:<React.Fragment/>}
              </div>
            </div>
          </div></React.Fragment> */}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  applicant_attachment_list: state.RecruitmentApplicantReducer.attachment_list,
  applicant_notes_list: state.RecruitmentApplicantReducer.attachment_notes_list,
  applicantDetails:{...state.RecruitmentApplicantReducer.details}
})

const mapDispatchtoProps = (dispatch) => {
  return {
    getApplicantAttachmentDetails: (applicant_id) => dispatch(getApplicantAttachmentDetails(applicant_id)),
    getApplicantAttachementStageNotesDetails: (applicant_id) => dispatch(getApplicantAttachementStageNotesDetails(applicant_id))
  }
};




export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantAttachmentsAndNotesModal)
