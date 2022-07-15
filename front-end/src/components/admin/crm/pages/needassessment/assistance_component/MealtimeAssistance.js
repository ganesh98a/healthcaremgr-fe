import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow, handleChange, css, postImageData, AjaxConfirm } from 'service/common.js';
import jQuery from "jquery";
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import Button from '@salesforce/design-system-react/lib/components/button';
import { BASE_URL } from '../../../../../../../src/config';
import { get_sales_attachment_data, archive_need_assessment_doc } from "components/admin/crm/actions/SalesAttachmentAction.jsx";
import { allowedFileExtensionForNeedAssessment, allowedFileTypeForNeedAssessment } from "../../../../oncallui-react-framework/services/common";

const OBJECT_TYPE_NEED_ASSESSMENT = 5;

/**
 * get upload file limit
 */
const getUploadFileLimit = () => {
  return new Promise((resolve, reject) => {
    postData("common/Common/max_upload_file_limit").then(result => {
      if (result.status) {
        let raData = result.data;
        const res = {
          data: raData,
        };
        resolve(res);
      } else {
        const res = {
          data: [],
        };
        resolve(res);
      }
    });
  });
}

class MealtimeAssistance extends Component {


  constructor(props) {
    super(props);
    this.state = {
      not_applicable: false,
      assistance_plan_requirement: '',
      physical_assistance: false,
      aids: false,
      verbal_prompting: false,
      mealtime_assistance_plan: 0,
      physical_assistance_desc: '',
      aids_desc: '',
      verbal_prompting_desc: '',
      files: [],
      max_post: 0,
      max_upload: 0,
      memory_limit: 0,
      upload_mb: 0,
      byte: 1048576, // 1 MB in bytes
      uploaded_total_bytes: 0,
      max_total_bytes: 0,
      attachment_details: [],
    }

    this.inputFile = React.createRef();
    // check the server side for supported exts
    this.allowedExtensions = allowedFileExtensionForNeedAssessment();

    // will be used in html accept attribute
    this.allowedFileTypes = allowedFileTypeForNeedAssessment();
  }

  componentDidMount() {
    if (this.props.need_assessment_id) {
      this.setState({ need_assessment_id: this.props.need_assessment_id }, () => {
        this.getSelectedMealAssistance();
      })
    }

    this.callUploadFileLimit();

  }

  /**
   * Call callUploadFileLimit api 
   */
  callUploadFileLimit = () => {
    getUploadFileLimit().then(res => {
      var ra_data = res.data;
      if (ra_data && ra_data.upload_mb) {
        let max_upload = ra_data.max_upload;
        /**
         * calculate the total allowed file size
         * ex 
         * this.state.byte = 1048576
         * max_upload = 10
         * max_total_bytes = 10 * 1048576 = 10485760
         *  
        */
        let max_total_bytes = max_upload * this.state.byte;
        this.setState({
          upload_mb: ra_data.upload_mb,
          max_post: ra_data.max_post,
          max_upload: ra_data.max_upload,
          memory_limit: ra_data.memory_limit,
          max_total_bytes: max_total_bytes,
        });
      }
    });
  }

  /**
     * Determine attachment link
     * 
     * @param {any} attachment 
     */
  determineAttachmentLink(attachment) {
    const { id } = attachment || {}

    if (!id) {
      return '#'
    }

    return `${BASE_URL}sales/Attachment/preview_attachment?attachment_id=${id}`
  }

  openfile(file) {
    let reader = new FileReader();

    reader.onloadend = () => {
      window.open(reader.result, "_blank");
    }

    reader.readAsDataURL(file);
  }

  removeDoc(index, value, type) {
    if (type === 'before') {
      let files = this.state.files;
      files.splice(index, 1);
      this.setState({ files: files });
    } else {
      archive_need_assessment_doc(value, 'mealtime').then((res) => {
        if (res) {
          this.getSelectedMealAssistance();
        }
      });
    }
  }

  /**
     * Determine allowed file types
     */
  determineAcceptableFileTypes() {
    return this.allowedFileTypes.join(', ')
  }

  getSelectedMealAssistance = () => {
    postData("sales/NeedAssessment/get_selected_meal_assistance", { need_assessment_id: this.props.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT, object_name: 'Mealtime' }).then((res) => {
      if (res.status) {
        this.setState(res.data.mealtime_data);
        this.setState({ attachment_details: res.data.attachment_data });
      }
    });
  }

  empty_desc = () => {
    if (this.state.physical_assistance == false) {
      this.setState({ physical_assistance_desc: '' });
    } else if (this.state.verbal_prompting == false) {
      this.setState({ verbal_prompting_desc: '' });
    } else if (this.state.aids == false) {
      this.setState({ aids_desc: '' });
    }
  }

  /**
     * Fires when 'Upload files' button is clicked
     */
  handleClickAddMoreFiles = () => {
    const { current } = this.inputFile
    current.click()
  }

  /**
     * Fires after files in `this.state` was updated. 
     */
  handleAfterStateChanged() {
    if (this.props.uploadImmediately) {
      this.handleUpload()
    }
  }

  handleChangeUpload = e => {
    if (e) {
      e.preventDefault()
    }

    let attachments = [...this.state.files]
    let error = false;
    let files = e.target.files

    let invalidFileNames = []

    Object.keys(files).map((key, i) => {
      let filename = files[key].name
      let ext = files[key].name.replace(/^.*\./, '');
      ext = ext.toLowerCase();

      if (this.allowedExtensions.includes(ext)) {
        attachments[(attachments.length + 1)] = files[key];
      } else {
        invalidFileNames.push(filename)
        error = true
      }
    });

    if (error) {
      const firstInvalidFileName = invalidFileNames.find(Boolean)
      const reason = <>Cannot upload this file <i style={{ fontSize: 'inherit' }}>{firstInvalidFileName}</i></>
      const msg = `File types supported are ${this.allowedExtensions.join(`, `)}`

      const msgComponent = <span style={{ textAlign: 'left' }}>
        {firstInvalidFileName && reason}
        <br />
        {msg}
      </span>

      toastMessageShow(msgComponent, 'e')
    } else {
      const newFiles = attachments.filter(Boolean)
      console.log(newFiles);
      this.setState({ files: newFiles }, this.handleAfterStateChanged);
    }

  }

  onSubmit = (e) => {
    e.preventDefault();
    jQuery("#mealtime_form").validate({ /* */ });
    if (this.state.mealtime_assistance_plan === '1' && this.state.assistance_plan_requirement === '') {
      toastMessageShow('Please enter the details of  “meal time needs/ method/ requirements”', "e");
      return false;
    }

    if (this.state.require_assistance_plan == 2) {
      if ((this.state.physical_assistance == false) && (this.state.aids == false) && (this.state.verbal_prompting == false)) {
        toastMessageShow("Please choose one option", "e");
        return false;
      } else if (this.state.physical_assistance && this.state.physical_assistance_desc == '') {
        toastMessageShow('Please enter the details of  “physical assistance description”', "e");
        return false;
      } else if (this.state.aids && this.state.aids == '') {
        toastMessageShow('Please enter the details of  “Aids description”', "e");
        return false;
      } else if (this.state.verbal_prompting && this.state.verbal_prompting_desc == '') {
        toastMessageShow('Please enter the details of  “verbal prompting description”', "e");
        return false;
      }
    }

    //if (!this.state.loading && jQuery("#mealtime_form").valid()) {
    if (jQuery("#mealtime_form").valid()) {


      let formData = new FormData()
      if (this.state.mealtime_assistance_plan === '1') {
        this.setState({ files: [] });
      } else {
        this.state.files.forEach(file => formData.append('files[]', file));
      }

      if (this.state.mealtime_assistance_plan === '2' && this.state.files.length == 0 && this.state.attachment_details.length == 0) {
        toastMessageShow('Please upload the file', "e");
        return false;
      }

      let exceededFileSizeLimit = false;
      let cumulativeFileSize = 0
      this.state.files.forEach(file => {
        cumulativeFileSize += file.size
        if (cumulativeFileSize > (10 * 1048576)) {
          if (!exceededFileSizeLimit) { // show only once
            toastMessageShow("The File Size Exceeds 10MB", 'e')
            exceededFileSizeLimit = true
            this.state.files = []
          }
        }
      })

      formData.append('object_type', OBJECT_TYPE_NEED_ASSESSMENT);
      formData.append('object_id', this.props.need_assessment_id);
      formData.append('object_name', 'Mealtime');
      if (this.state.id) {
        formData.append('id', this.state.id);
      }

      // These are required data
      if (this.state.mealtime_assistance_plan && this.state.risk_choking && this.state.risk_aspiration && this.state.require_assistance_plan) {
        formData.append('mealtime_assistance_plan', this.state.mealtime_assistance_plan);
        formData.append('risk_choking', this.state.risk_choking);
        formData.append('risk_aspiration', this.state.risk_aspiration);
        formData.append('require_assistance_plan', this.state.require_assistance_plan);
      }
      formData.append('not_applicable', this.state.not_applicable);
      formData.append('aids', this.state.aids);
      formData.append('aids_desc', this.state.aids_desc && this.state.aids_desc != undefined ? this.state.aids_desc : '');
      formData.append('assistance_plan_requirement', this.state.assistance_plan_requirement && this.state.assistance_plan_requirement != undefined ? this.state.assistance_plan_requirement : '');
      formData.append('need_assessment_id', this.state.need_assessment_id);
      formData.append('physical_assistance', this.state.physical_assistance);
      formData.append('physical_assistance_desc', this.state.physical_assistance_desc && this.state.physical_assistance_desc != undefined ? this.state.physical_assistance_desc : '');
      formData.append('verbal_prompting', this.state.verbal_prompting);
      formData.append('verbal_prompting_desc', this.state.verbal_prompting_desc && this.state.verbal_prompting_desc != undefined ? this.state.verbal_prompting_desc : '');

      if (!exceededFileSizeLimit) {

        this.setState({ loading: true });
        postImageData('sales/NeedAssessment/save_mealtime_assisstance', formData).then((result) => {
          if (result.status) {
            let msg = result.msg;
            toastMessageShow(msg, 's');
            this.getSelectedMealAssistance();
            this.setState({ files: [], loading: false });
            this.props.get_sales_attachment_data({ object_id: this.props.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT });
          } else {
            toastMessageShow(result.msg, "e");
            this.setState({ loading: false });
          }
        });
      }
    }
  }

  /**
   * Show toastr msg
   */
  showInfoMsg = (obj, e) => {
    handleChange(obj, e);
    if (this.state.attachment_details.length == 0) {
      var msg = 'Please upload document in Attachments with expiry dates';
      toastMessageShow(msg, "w");
    }
  }

  render() {
    const styles = css({
      inputFile: {
        display: 'inline-block',
        border: 'unset',
        lineHeight: 'initial',
        height: 'initial',
        visibility: 'hidden',
        width: '0px',
        padding: '0px',
        marginTop: '0px',
      },
      uploadingCursor: {
        cursor: 'auto',
      },
      btnPadTop: {
        paddingTop: '1.25rem'
      }
    })
    return (
      <React.Fragment>
        <div className="slds-grid">
          <div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
            <form id="mealtime_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
              <div className="slds-panel__header">
                <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Mealtime Assistance</h2>
              </div>
              <div className="slds-panel__body">
                {/* <div className="slds-form-element">
                    <div className="slds-form-element__control">
                      <div className="slds-checkbox">
                        <input type="checkbox" name="not_applicable" id="not_applicable_chkbox" onChange={(e) => handleChange(this,e)} checked={(this.state.not_applicable && this.state.not_applicable=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="not_applicable_chkbox">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Not applicable</span>
                        </label>
                      </div>
                    </div>
                  </div> */}

                <fieldset className="slds-form-element">
                  {
                    (this.state.risk_aspiration == 2 || this.state.risk_choking == 2) ?
                      <label for="mealtime_assistance_plan" class="error CheckieError" style={{ display: "block", width: "20%", marginBottom: '0px' }}></label>
                      : ''
                  }
                  <legend className="slds-form-element__legend slds-form-element__label">
                    {
                      (this.state.risk_aspiration == 2 || this.state.risk_choking == 2) ?
                        <abbr class="slds-required" title="required">*</abbr>
                        : ''
                    }
                     Do you have a mealtime assistance plan ?</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" value="1" id="assisstance_plan_no" required name="mealtime_assistance_plan" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} required={(this.state.risk_aspiration == 2 || this.state.risk_choking == 2) ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.mealtime_assistance_plan && this.state.mealtime_assistance_plan == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="assisstance_plan_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" value="2" id="assisstance_plan_yes" name="mealtime_assistance_plan" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => { this.showInfoMsg(this, e) }} checked={(this.state.mealtime_assistance_plan && this.state.mealtime_assistance_plan == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="assisstance_plan_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>
                {
                  (this.state.mealtime_assistance_plan && this.state.mealtime_assistance_plan === '1') ?
                    <fieldset className="slds-form-element mb-3">
                      <div className="col-md-6">
                        <div className="slds-form-element__control">
                          <div className="SLDS_date_picker_width">
                            <Textarea
                              disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false}
                              type="text"
                              className="slds-input"
                              name="assistance_plan_requirement"
                              placeholder="Enter the details of “meal time needs/ method/ requirements”"
                              onChange={(e) => this.setState({ assistance_plan_requirement: e.target.value })}
                              value={this.state.assistance_plan_requirement}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    : <React.Fragment />
                }

                {this.state.mealtime_assistance_plan == 2 && <fieldset>
                  <div className="col-lg-6 col-sm-6">
                    <div className="slds-form-element" >
                      <div className="row">
                        <div className="col-sm-6">
                          <abbr className="slds-required" title="required">* </abbr>
                          <input
                            type="file"
                            multiple
                            name="file-uploader"
                            accept={this.determineAcceptableFileTypes()}
                            ref={this.inputFile}
                            onChange={this.handleChangeUpload}
                            value=""
                            style={styles.inputFile}
                            disabled={false}
                          />
                          {


                            this.state.isUploading ?
                              (
                                <Button
                                  label={'Uploading...'}
                                  style={[styles.uploadingCursor]}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                />
                              )
                              :
                              (
                                <Button
                                  disabled={this.state.isUploading}
                                  label={`Upload Mealtime Plan`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreFiles}
                                />
                              )
                          }
                        </div>
                        <div className="col-sm-6">
                          {

                            this.state.files.map((val, index) => (

                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="col-sm-9">
                                  <span onClick={() => { this.openfile(val) }}  >
                                    <a href={"javascript:void(0);"} className="reset" style={{ color: '#000', cursor: 'pointer' }}>
                                      {((val.name).length > 30) ? val.name : (val.name)} </a>
                                  </span>
                                </div>
                                <div className="col-sm-3">
                                  <Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="delete"
                                    variant="icon"
                                    iconClassName={`slds-button__icon_delete ml-2`}
                                    onClick={() => this.removeDoc(index, val, 'before')}
                                  />

                                </div>
                              </div>
                            ))}
                          <br></br>
                          <br></br>
                          {this.state.attachment_details.length > 0 &&
                            this.state.attachment_details.map((val, index) => (

                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="col-sm-9">
                                  <span><a href={this.determineAttachmentLink(val)} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                    {val.orig_name + '_' + val.object_name + val.file_ext}
                                  </a></span>
                                </div>
                                <div className="col-sm-3">
                                  <Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="delete"
                                    variant="icon"
                                    iconClassName={`slds-button__icon_delete ml-2`}
                                    onClick={() => this.removeDoc(index, val, 'after')}
                                  />
                                </div>
                              </div>
                            ))}


                        </div>
                      </div>
                    </div>
                  </div>

                </fieldset>}

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label"> Risk of aspiration</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="aspiration_no" value="1" name="risk_aspiration" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.risk_aspiration && this.state.risk_aspiration == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="aspiration_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="aspiration_yes" value="2" name="risk_aspiration" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.risk_aspiration && this.state.risk_aspiration == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="aspiration_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label"> Risk of choking</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="choking_no" value="1" name="risk_choking" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.risk_choking && this.state.risk_choking == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="choking_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="choking_yes" value="2" name="risk_choking" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.risk_choking && this.state.risk_choking == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="choking_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>
                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label"> Do you require assistance with meal time ?</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="require_assistance_no" value="1" name="require_assistance_plan" onChange={(e) => handleChange(this, e)} checked={(this.state.require_assistance_plan && this.state.require_assistance_plan == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="require_assistance_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="require_assistance_yes" value="2" name="require_assistance_plan" onChange={(e) => handleChange(this, e)} checked={(this.state.require_assistance_plan && this.state.require_assistance_plan == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="require_assistance_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {this.state.require_assistance_plan == 2 ?
                  <div> <div className="slds-form-element__control row">
                    <span className="slds-checkbox slds-float_left col col-sm-6">
                      <input type="checkbox" name="physical_assistance" id="physical_assistance" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.physical_assistance && this.state.physical_assistance == '1') ? true : false} />
                      <label className="slds-checkbox__label" htmlFor="physical_assistance">
                        <span className="slds-checkbox_faux"></span>
                        <span className="slds-form-element__label"> Physical Assistance</span>
                      </label>
                    </span>
                  </div>
                    {this.state.physical_assistance && <div className="slds-form-element__control row">
                      <fieldset className="slds-form-element mb-3">
                        <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                          <div className="slds-form-element__control">
                            <div className="SLDS_date_picker_width">
                              <Textarea
                                type="text"
                                className="slds-input"
                                name="physical_assistance_desc"
                                placeholder="Enter the details of “Physical Assistance”"
                                onChange={(e) => this.setState({ physical_assistance_desc: e.target.value })}
                                value={this.state.physical_assistance_desc}
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>}

                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="verbal_prompting" id="verbal_prompting" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.verbal_prompting && this.state.verbal_prompting == '1') ? true : false} />
                        <label className="slds-checkbox__label" htmlFor="verbal_prompting">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label"> Verbal Prompting/Reminding</span>
                        </label>
                      </span>
                    </div>

                    {this.state.verbal_prompting && <div className="slds-form-element__control row">
                      <fieldset className="slds-form-element mb-3">
                        <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                          <div className="slds-form-element__control">
                            <div className="SLDS_date_picker_width">
                              <Textarea
                                type="text"
                                className="slds-input"
                                name="verbal_prompting_desc"
                                placeholder="Enter the details of “Verbal Prompting/Reminding”"
                                onChange={(e) => this.setState({ verbal_prompting_desc: e.target.value })}
                                value={this.state.verbal_prompting_desc}
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>}

                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="aids" id="aids" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.aids && this.state.aids == '1') ? true : false} />
                        <label className="slds-checkbox__label" htmlFor="aids">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label"> Aids</span>
                        </label>
                      </span>
                    </div>

                    {this.state.aids && <div className="slds-form-element__control row">
                      <fieldset className="slds-form-element mb-3">
                        <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                          <div className="slds-form-element__control">
                            <div className="SLDS_date_picker_width">
                              <Textarea
                                type="text"
                                className="slds-input"
                                name="aids_desc"
                                placeholder="Enter the details of “Aids”"
                                onChange={(e) => this.setState({ aids_desc: e.target.value })}
                                value={this.state.aids_desc}
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>}</div> : ''}



              </div>
              <div className="slds-panel__footer">
                <button type="button" className="slds-button slds-button_brand" disabled={this.state.loading ? true : false} onClick={this.onSubmit}>Save</button>
              </div>
            </form>
          </div>
        </div>
      </React.Fragment >
    );
  }
}
const mapStateToProps = state => ({
  existingAttachments: state.SalesAttachmentReducer.attachment_list,
})

const mapDispatchtoProps = (dispatch) => {
  return {
    get_sales_attachment_data: (request) => dispatch(get_sales_attachment_data(request)),
  }
}

export default connect(mapStateToProps, mapDispatchtoProps)(MealtimeAssistance);
