import React, { Component } from "react";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import ScrollArea from "react-scrollbar";
import ApplicantAddAttachmentFrom from './ApplicantAddAttachmentFrom.js';
import {applicantAttchmentDocumentShow} from 'dropdown/recruitmentdropdown.js';
import { connect } from 'react-redux';
import _ from 'lodash';
import { object } from "prop-types";
import {NottachmentAvailable} from 'service/custom_value_data.js';

import { downloadSelectedRecuritmentAttachment, selecteRecuritmentAttachment,archiveSelectedRecuritmentAttachment,getApplicantAttachmentDetails } from './../actions/RecruitmentApplicantAction';

class ApplicantAttachmentModal extends Component {
  constructor() {
    super();
    this.state = {
      documentsSelected: 0,
      newDocumentUpload:false,
      activeDownload:{}, 
      restrictedArchiveDraftContratct:{}, 
    };
    this.scrollAreaData = React.createRef();
    this.scrollAreaOtherData = React.createRef();
  }

  scrollTopData(){
    this.scrollAreaData.current.scrollTop();
    this.scrollAreaOtherData.current.scrollTop();
  }

  attachmentListRefresh(){
    this.props.getApplicantAttachmentDetails(this.props.applicantDetails.id);
  }


  closeAttachment=(resp)=>{
    if(resp){

    }
    this.setState({newDocumentUpload:false});
  }

  render() {
    let attachmentListData = this.props.applicant_attachment_list.filter((row) => row.archive == this.state.documentsSelected && _.toLower(row.category_title)!='other');
    let attachmentOtherListData = this.props.applicant_attachment_list.filter((row) => row.archive == this.state.documentsSelected && _.toLower(row.category_title)=='other');
    return (
      <div className={"customModal " + (this.props.show ? " show" : "")}>
        <div className="cstomDialog widBig">
          <h3 className="cstmModal_hdng1--">
            Attachments
            <span
              className="closeModal icon icon-close1-ie"
              onClick={this.props.close}
            ></span>
          </h3>

          <div className="row pd_lf_15 mr_tb_20">
            <div className="col-md-12">
              <div className="row d-flex">
                <div className="col-sm-8 align-self-center">
                  <label className="bg_labs2 mb-0">
                    <strong>Applicant Attachments</strong>{" "}
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
                      onChange={e => this.setState({ documentsSelected: e, activeDownload:{} },()=>{
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
                      horizontal={false}
                      style={{
                        paddingRight: "20px",
                        height: "auto",
                        maxHeight: "300px"
                      }}
                      ref={this.scrollAreaData}
                    >
                      <div className="row attch_row">
                

                        {attachmentListData.length>0? attachmentListData.map((row,index)=>{
                            let selectDocumentAttribute = {};
                            //if(row.archive==0){
                              selectDocumentAttribute['onClick'] = ()=>selecteRecuritmentAttachment(this,row.id,row.draft_contract_type);
                           // }
                            let classActiveAdd ='';
                            if(this.state.activeDownload[row.id]){
                              classActiveAdd='select_active';
                            }
                            return (
                              <div className="col-sm-2 col-xs-3" key={index}>
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

                                                }):(<NottachmentAvailable />)
                                            }
                    
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <div className="row bt-1 mt-5">
                <div className="col-sm-12">
                  <div className="row mr_tb_20 ">
                    <label className="bg_labs2 mb-0">
                      <strong>Other Attachments</strong>{" "}
                    </label>
                  </div>

                  <div className=" cstmSCroll1">
                    <ScrollArea
                      speed={0.8}
                      className="stats_update_list"
                      contentClassName="content"
                      horizontal={false}
                      style={{
                        paddingRight: "15px",
                        height: "auto",
                        maxHeight: "200px"
                      }}
                      ref={this.scrollAreaOtherData}
                    >
                      <div className="row attch_row">
                        
                      {attachmentOtherListData.length>0? attachmentOtherListData.map((row,index)=>{
                         let selectDocumentAttribute = {};
                         //if(row.archive==0){
                           selectDocumentAttribute['onClick'] = ()=>selecteRecuritmentAttachment(this,row.id,row.draft_contract_type);
                         //}
                         let classActiveAdd ='';
                         if(this.state.activeDownload[row.id]){
                           classActiveAdd='select_active';
                         }
                     return (
                      <div className="col-sm-2 col-xs-6" key={index}>
                          <div className="attach_item">
                            <h5>
                              <strong>{row.category_title}</strong>
                            </h5>
                            <p>{row.attachment_title}</p>
                            <i className={"icon icon-document3-ie "+classActiveAdd} {...selectDocumentAttribute}></i>
                            <p>{row.attachment}</p>
                          </div>
                        </div>
                          );

                                                }):(<NottachmentAvailable />)
                                            }
                        
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>

         <div className="row pd_lf_15 ">
            <div className="col-md-12 ">
              <div className="row  mr_tb_20 bt-1"></div>
              <div className="row mt-5">
                <div className="col-md-6 pr-5">
                  <button className="cmn-btn1 btn btn-block atchd_btn1__" onClick={()=>downloadSelectedRecuritmentAttachment(this)}>
                    Download Selected Documents
                  </button>
                {this.state.documentsSelected==0? ( <button className="cmn-btn1 btn btn-block atchd_btn1__" onClick={()=>archiveSelectedRecuritmentAttachment(this)}>
                  Archive Selected Documents
                  </button>) :<React.Fragment />}
                </div>
                {!this.state.newDocumentUpload && this.state.documentsSelected==0 ? <div className="col-md-6 pr-5">
                   <button className="cmn-btn1 btn btn-block atchd_btn1__" onClick={()=>this.setState({newDocumentUpload:true})}>
                   Select a New document to Upload
                  </button> 
                </div>: this.state.documentsSelected==0 ? <ApplicantAddAttachmentFrom closeModel={this.closeAttachment} /> : <React.Fragment/>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  applicant_attachment_list:state.RecruitmentApplicantReducer.attachment_list,
  applicantDetails:{...state.RecruitmentApplicantReducer.details}
})

const mapDispatchtoProps = (dispatch) => {
  return {
    getApplicantAttachmentDetails: (applicant_id) => dispatch(getApplicantAttachmentDetails(applicant_id))
  }
};


export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantAttachmentModal)