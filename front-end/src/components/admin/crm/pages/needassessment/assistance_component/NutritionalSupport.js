import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow, handleChange, css, postImageData, comboboxFilterAndLimit, AjaxConfirm } from 'service/common.js';
import jQuery from "jquery";
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import Button from '@salesforce/design-system-react/lib/components/button';
import { BASE_URL } from '../../../../../../config';
import { get_sales_attachment_data, archive_need_assessment_doc } from "components/admin/crm/actions/SalesAttachmentAction.jsx";
import { allowedFileExtensionForNeedAssessment, allowedFileTypeForNeedAssessment } from "../../../../oncallui-react-framework/services/common";

import { Icon } from '@salesforce/design-system-react';
import Combobox from '@salesforce/design-system-react/lib/components/combobox';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';

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

class NutritionalSupport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      not_applicable: false,
      aspiration_food: false,
      aspiration_fluids: false,
      choking_food: false,
      choking_fluids: false,
      support_with_eating: 0,
      risk_aspiration: 0,
      risk_choking: 0,
      peg_assistance_plan: 0,
      pej_assistance_plan: 0,
      aspiration_food_desc: '',
      aspiration_fluids_desc: '',
      choking_food_desc: '',
      choking_fluids_desc: '',
      food_preferences_desc: '',
      ns_mealtime_files: [],
      ns_aspiration_files: [],
      ns_choking_files: [],
      ns_peg_assistance_files: [],
      ns_pej_assistance_files: [],
      max_post: 0,
      max_upload: 0,
      memory_limit: 0,
      upload_mb: 0,
      byte: 1048576, // 1 MB in bytes
      uploaded_total_bytes: 0,
      max_total_bytes: 0,
      attachment_details: [],
      selected_food_preferences: [],
      food_preference_id: '',
      food_preferences: [],
      show_food_desc: false,
    }

    this.mealtimeInputFile = React.createRef();
    this.aspirationInputFile = React.createRef();
    this.chokingInputFile = React.createRef();
    this.pegInputFile = React.createRef();
    this.pejInputFile = React.createRef();

    // check the server side for supported exts
    this.allowedExtensions = allowedFileExtensionForNeedAssessment();

    // will be used in html accept attribute
    this.allowedFileTypes = allowedFileTypeForNeedAssessment();
  }

  componentDidMount() {
    if (this.props.need_assessment_id) {
      this.setState({ need_assessment_id: this.props.need_assessment_id }, () => {
        this.getSelectedMealAssistance();
        this.getFoodPreferencesData();
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

  removeDoc(index, value, type, stateName) {
    if (type === 'before') {
      let files = this.state[stateName];
      files.splice(index, 1);
      this.setState({ [stateName]: files });
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
    postData("sales/NeedAssessment/get_selected_nutritional_support", { need_assessment_id: this.props.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT, object_name: 'Mealtime' }).then((res) => {
      if (res.status) {
        this.setState(res.data.nutritional_support);
        this.setState({ attachment_details: res.data.attachment_data, selected_food_preferences: res.data.food_preferences }, () => {
          let arr = this.state.selected_food_preferences;
          if (arr && arr.length > 0) {
            let check_other = arr.some(code => code.label === 'Other'); // true
            if (check_other) {
              this.setState({ show_food_desc: true })
            } else {
              this.setState({ show_food_desc: false, food_preferences_desc: '' })
            }
          }
        });
      }
    });
  }

  getFoodPreferencesData = () => {
    postData("sales/NeedAssessment/get_food_reference_data", { need_assessment_id: this.props.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT, object_name: 'Mealtime' }).then((res) => {
      if (res.status) {
        this.setState({ food_preferences: res.data });
      }
    });
  }

  empty_desc = () => {
    if (this.state.aspiration_food_desc == false) {
      this.setState({ aspiration_food_desc: '' });
    } else if (this.state.aspiration_fluids_desc == false) {
      this.setState({ aspiration_fluids_desc: '' });
    } else if (this.state.choking_food_desc == false) {
      this.setState({ choking_food_desc: '' });
    } else if (this.state.choking_fluids_desc == false) {
      this.setState({ choking_fluids_desc: '' });
    } else if (this.state.show_food_desc == false) {
      this.setState({ food_preferences_desc: '' });
    }
  }

  /**
   * Fires when 'Upload files' button is clicked
   */
  handleClickAddMoreForMealtimeFiles = () => {
    if (this.mealtimeInputFile) {
      const { current } = this.mealtimeInputFile
      current.click()
    }
  }

  handleClickAddMoreForAspirationFiles = () => {
    if (this.aspirationInputFile) {
      const { current } = this.aspirationInputFile
      current.click()
    }
  }


  handleClickAddMoreForChokingFiles = () => {
    if (this.chokingInputFile) {
      const { current } = this.chokingInputFile
      current.click()
    }
  }

  handleClickAddMoreForPegFiles = () => {
    if (this.pegInputFile) {
      const { current } = this.pegInputFile
      current.click()
    }

  }

  handleClickAddMoreForPejFiles = () => {
    if (this.pejInputFile) {
      const { current } = this.pejInputFile
      current.click()
    }
  }

  /**
     * Fires after files in `this.state` was updated. 
     */
  handleAfterStateChanged() {
    if (this.props.uploadImmediately) {
      this.handleUpload()
    }
  }

  handleChangeUpload = (e, stateName) => {
    if (e) {
      e.preventDefault()
    }

    let attachments = [...this.state[stateName]]
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
      this.setState({ [stateName]: newFiles }, this.handleAfterStateChanged);
    }
  }
  /**
     * Render Cc & Bcc contacts
     * @param {str} label
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
  renderFoodPreferencesComboBox = (id, selection_options, stateName, valueName) => {
    return (
      <Combobox
        id={id}
        predefinedOptionsOnly
        disabled={this.props.disabled}
        events={{
          onChange: (event, { value }) => {
            if (this.props.action) {
              this.props.action('onChange')(event, value);
            }
            this.setState({ [valueName]: value });
          },
          onRequestRemoveSelectedOption: (event, data) => {
            this.setState({
              [valueName]: '',
              [stateName]: data.selection,
            },()=>{
              let arr = this.state.selected_food_preferences;
              let check_other = arr.some(code => code.label === 'Other'); // true
              if (check_other) {
                this.setState({ show_food_desc: true })
              } else {
                this.setState({ show_food_desc: false, food_preferences_desc: '' })
              }
            });
           
          },
          onSubmit: (event, { value }) => {
            if (this.props.action) {
              this.props.action('onChange')(event, value);
            }
            this.setState({
              [valueName]: '',
              [stateName]: [
                ...this.state[stateName],
                {
                  label: value,
                  icon: (
                    <Icon
                      assistiveText={{ label: 'Account' }}
                      category="standard"
                      name="account"
                    />
                  ),
                },
              ],
            });
          },
          onSelect: (event, data) => {
            if (this.props.action) {
              this.props.action('onSelect')(
                event,
                ...Object.keys(data).map((key) => data[key])
              );
            }

            this.setState({
              [valueName]: '',
              [stateName]: data.selection,
            }, () => {
              let arr = this.state.selected_food_preferences;
              let check_other = arr.some(code => code.label === 'Other'); // true
              if (check_other) {
                this.setState({ show_food_desc: true })
              }
            });
          },
        }}

        menuMaxWidth="500px"
        menuItemVisibleLength={5}
        multiple
        options={comboboxFilterAndLimit(
          this.state[valueName],
          10,
          this.state[selection_options],
          this.state[stateName],
        )}
        selection={this.state[stateName]}
        value={this.state[valueName]}
      />
    );
  }

  validated_entered_data = () => {
    var msg = 'Please Upload Mealtime Assistant Plan with Review Dates';
    if (this.state.support_with_eating == "2") {
      if (this.state.attachment_details && this.state.attachment_details.ns_mealtime_files && this.state.attachment_details.ns_mealtime_files.length == 0) {
        toastMessageShow(msg, "e");
        return false;
      } else if (!(this.state.attachment_details && this.state.attachment_details.ns_mealtime_files) && (this.state.ns_mealtime_files && this.state.ns_mealtime_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }

    }

    if (this.state.risk_choking == "2") {
      if (this.state.attachment_details && this.state.attachment_details.ns_choking_files && this.state.attachment_details.ns_choking_files.length == 0) {
        toastMessageShow(msg, "e");
        return false;
      } else if (!(this.state.attachment_details && this.state.attachment_details.ns_choking_files) && (this.state.ns_choking_files && this.state.ns_choking_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }

    }

    if (this.state.risk_aspiration == "2") {
      if (this.state.attachment_details && this.state.attachment_details.ns_aspiration_files && this.state.attachment_details.ns_aspiration_files.length == 0) {
        toastMessageShow(msg, "e");
        return false;
      } else if (!(this.state.attachment_details && this.state.attachment_details.ns_aspiration_files) && (this.state.ns_aspiration_files && this.state.ns_aspiration_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }
    }
    if (this.state.peg_assistance_plan == "2") {
      msg = 'Please Upload PEJ Mealtime Assistant Plan with Review Dates';
      if (this.state.attachment_details && this.state.attachment_details.ns_peg_assistance_files && this.state.attachment_details.ns_peg_assistance_files.length == 0) {
        toastMessageShow(msg, "e");
        return false;
      } else if (!(this.state.attachment_details && this.state.attachment_details.ns_peg_assistance_files) && (this.state.ns_peg_assistance_files && this.state.ns_peg_assistance_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }
    }
    if (this.state.pej_assistance_plan == "2" && this.state.ns_pej_assistance_files.length == 0) {
      msg = 'Please Upload PEJ Mealtime Assistant Plan with Review Dates';
      if (this.state.attachment_details && this.state.attachment_details.ns_pej_assistance_files && this.state.attachment_details.ns_pej_assistance_files.length == 0) {
        toastMessageShow(msg, "e");
        return false;
      } else if (!(this.state.attachment_details && this.state.attachment_details.ns_pej_assistance_files) && (this.state.ns_pej_assistance_files && this.state.ns_pej_assistance_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }
    }

    // Check existing data is there uploaded file
    if (this.state.attachment_details && this.state.attachment_details.length > 0) {
      if (this.state.support_with_eating == "2" && (this.state.attachment_details.ns_mealtime_files && this.state.attachment_details.ns_mealtime_files.length == 0 && this.state.ns_mealtime_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }
      if (this.state.risk_choking == "2" && (this.state.attachment_details.ns_choking_files && this.state.attachment_details.ns_choking_files.length == 0 && this.state.ns_choking_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }
      if (this.state.risk_aspiration == "2" && (this.state.attachment_details.ns_aspiration_files && this.state.attachment_details.ns_aspiration_files.length == 0 && this.state.ns_aspiration_files.length == 0)) {
        toastMessageShow(msg, "e");
        return false;
      }
      if (this.state.peg_assistance_plan == "2" && (this.state.attachment_details.ns_peg_assistance_files.length == 0 && this.state.ns_peg_assistance_files && this.state.ns_peg_assistance_files.length == 0)) {
        msg = 'Please Upload PEJ Mealtime Assistant Plan with Review Dates';
        toastMessageShow(msg, "e");
        return false;
      }
      if (this.state.pej_assistance_plan == "2" && (this.state.attachment_details.ns_pej_assistance_files.length == 0 && this.state.ns_pej_assistance_files && this.state.ns_pej_assistance_files.length == 0)) {
        msg = 'Please Upload PEJ Mealtime Assistant Plan with Review Dates';
        toastMessageShow(msg, "e");
        return false;
      }
    }

    if (this.state.risk_aspiration == "2") {
      if ((this.state.aspiration_food == false) && (this.state.aspiration_fluids == false)) {
        toastMessageShow("Please choose one option in Risk of aspiration", "e");
        return false;
      } else if (this.state.aspiration_food && this.state.aspiration_food_desc == '') {
        toastMessageShow('Please enter the details of  “Risk of aspiration Foods”', "e");
        return false;
      } else if (this.state.aspiration_fluids && this.state.aspiration_fluids_desc == '') {
        toastMessageShow('Please enter the details of  “Risk of aspiration Fluids”', "e");
        return false;
      }
    }

    if (this.state.risk_choking == "2") {
      if ((this.state.choking_food == false) && (this.state.choking_fluids == false)) {
        toastMessageShow("Please choose one option in Risk of choking", "e");
        return false;
      } else if (this.state.choking_food && this.state.choking_food_desc == '') {
        toastMessageShow('Please enter the details of  “Risk of choking Foods”', "e");
        return false;
      } else if (this.state.choking_fluids && this.state.choking_fluids_desc == '') {
        toastMessageShow('Please enter the details of  “Risk of choking Fluids”', "e");
        return false;
      }
    }

    if ((this.state.show_food_desc == true) && (this.state.food_preferences_desc == '')) {
      toastMessageShow("Please enter the details of  “Food Preferences”", "e");
      return false;
    }

    if (this.state.selected_food_preferences && this.state.selected_food_preferences.length == 0) {
      toastMessageShow("Please select food preferences", "e");
      return false;
    }

    return true;
  }
  onSubmit = (e) => {
    e.preventDefault();
    jQuery("#mealtime_form").validate({ /* */ });

    let validated_data = this.validated_entered_data();

    if (!validated_data) {
      return false;
    }


    if (jQuery("#mealtime_form").valid()) {


      let formData = new FormData()
      if (this.state.support_with_eating === '1') {
        this.setState({ ns_mealtime_files: [] });
      } else {
        this.state.ns_mealtime_files.forEach(file => formData.append('ns_mealtime_files[]', file));
      }

      if (this.state.risk_choking === '1') {
        this.setState({ ns_choking_files: [] });
      } else {
        this.state.ns_choking_files.forEach(file => formData.append('ns_choking_files[]', file));
      }

      if (this.state.peg_assistance_plan === '1') {
        this.setState({ ns_peg_assistance_files: [] });
      } else {
        this.state.ns_peg_assistance_files.forEach(file => formData.append('ns_peg_assistance_files[]', file));
      }


      if (this.state.pej_assistance_plan === '1') {
        this.setState({ ns_pej_assistance_files: [] });
      } else {
        this.state.ns_pej_assistance_files.forEach(file => formData.append('ns_pej_assistance_files[]', file));
      }

      if (this.state.risk_aspiration === '1') {
        this.setState({ ns_aspiration_files: [] });
      } else {
        this.state.ns_aspiration_files.forEach(file => formData.append('ns_aspiration_files[]', file));
      }


      let exceededFileSizeLimit = false;
      let cumulativeFileSize = 0
      this.state.ns_mealtime_files.forEach(file => {
        cumulativeFileSize += file.size
        if (cumulativeFileSize > (10 * 1048576)) {
          if (!exceededFileSizeLimit) { // show only once
            toastMessageShow("The File Size Exceeds 10MB", 'e')
            exceededFileSizeLimit = true
            this.state.ns_mealtime_files = []
          }
        }
      })

      formData.append('object_type', OBJECT_TYPE_NEED_ASSESSMENT);
      formData.append('object_id', this.props.need_assessment_id);
      formData.append('object_name', 'ns');
      if (this.state.id) {
        formData.append('id', this.state.id);
      }

      // These are required data
      if (this.state.support_with_eating && this.state.risk_aspiration && this.state.risk_choking && this.state.peg_assistance_plan && this.state.pej_assistance_plan) {
        formData.append('need_assessment_id', this.state.need_assessment_id);
        formData.append('support_with_eating', this.state.support_with_eating);
        formData.append('risk_aspiration', this.state.risk_aspiration);
        formData.append('risk_choking', this.state.risk_choking);
        formData.append('aspiration_food', this.state.aspiration_food ? 1 : 0);
        formData.append('aspiration_food_desc', this.state.aspiration_food_desc);
        formData.append('aspiration_fluids', this.state.aspiration_fluids ? 1 : 0);
        formData.append('aspiration_fluids_desc', this.state.aspiration_fluids_desc);
        formData.append('choking_food', this.state.choking_food ? 1 : 0);
        formData.append('choking_food_desc', this.state.choking_food_desc);
        formData.append('choking_fluids', this.state.choking_fluids ? 1 : 0);
        formData.append('choking_fluids_desc', this.state.choking_fluids_desc);
        formData.append('peg_assistance_plan', this.state.peg_assistance_plan);
        formData.append('pej_assistance_plan', this.state.pej_assistance_plan);
        formData.append('selected_food_preferences', JSON.stringify(this.state.selected_food_preferences));
        formData.append('food_preferences_desc', this.state.food_preferences_desc);

      } else {
        toastMessageShow("Please select all the options to continue. ", 'e');
        return false;
      }

      if (!exceededFileSizeLimit) {

        this.setState({ loading: true });
        postImageData('sales/NeedAssessment/save_nutritional_support', formData).then((result) => {
          if (result.status) {
            let msg = result.msg;
            toastMessageShow(msg, 's');
            this.getSelectedMealAssistance();
            this.setState({
              ns_mealtime_files: [],
              ns_aspiration_files: [],
              ns_choking_files: [],
              ns_peg_assistance_files: [],
              ns_pej_assistance_files: [],
              loading: false
            });
            this.props.get_sales_attachment_data({ object_id: this.props.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT });
          } else {
            toastMessageShow(result.msg, "e");
            this.setState({ loading: false });
          }
        });
      }
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
                <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Nutritional Support</h2>
              </div>
              <div className="slds-panel__body">
                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">
                    Do you require support with Eating and Swallowing ?</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" value="1" id="support_with_eating_no" name="support_with_eating" onChange={(e) => handleChange(this, e)} checked={(this.state.support_with_eating && this.state.support_with_eating == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="support_with_eating_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" value="2" id="assisstance_plan_yes" name="support_with_eating" onChange={(e) => handleChange(this, e)} checked={(this.state.support_with_eating && this.state.support_with_eating == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="assisstance_plan_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {this.state.support_with_eating == 2 && <fieldset>
                  <div className="col-lg-12 col-sm-12">
                    <div className="slds-form-element" >
                      <div className="row">
                        <div className="col-sm-2">
                          <abbr className="slds-required" title="required">* </abbr>
                          <input
                            type="file"
                            multiple
                            name="file-uploader"
                            accept={this.determineAcceptableFileTypes()}
                            ref={this.mealtimeInputFile}
                            onChange={(e) => this.handleChangeUpload(e, 'ns_mealtime_files')}
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
                                  label={`Upload Document`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreForMealtimeFiles}
                                />
                              )
                          }
                        </div>
                        <div className="col-sm-10">

                          {

                            this.state.ns_mealtime_files && this.state.ns_mealtime_files.length > 0 && this.state.ns_mealtime_files.map((val, index) => (

                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span>
                                      <a onClick={() => { this.openfile(val) }} href={"javascript:void(0);"} className="reset" style={{ color: '#000', cursor: 'pointer' }}>
                                        {((val.name).length > 30) ? val.name : (val.name)} </a> <span><Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'before', 'ns_mealtime_files')}
                                    /></span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {this.state.attachment_details && this.state.attachment_details.ns_mealtime_files && this.state.attachment_details.ns_mealtime_files.length > 0 &&
                            this.state.attachment_details.ns_mealtime_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                 <div className="row">
                                <div className="col-sm-12">
                                  <span><a href={this.determineAttachmentLink(val)} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                    {val.orig_name + '_NutritionalSupport' + val.file_ext}</a>
                                    <span><Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="delete"
                                    variant="icon"
                                    iconClassName={`slds-button__icon_delete ml-2`}
                                    onClick={() => this.removeDoc(index, val, 'after', 'ns_mealtime_files')}
                                  /></span>
                                  </span>
                                </div>
                                
                              </div>
</div>
                            ))}


                        </div>
                      </div>
                    </div>
                  </div>

                </fieldset>}

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label"> Is there a Risk of aspiration</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="aspiration_no" value="1" name="risk_aspiration" onChange={(e) => handleChange(this, e)} checked={(this.state.risk_aspiration && this.state.risk_aspiration == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="aspiration_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="aspiration_yes" value="2" name="risk_aspiration" onChange={(e) => handleChange(this, e)} checked={(this.state.risk_aspiration && this.state.risk_aspiration == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="aspiration_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {this.state.risk_aspiration == 2 && <fieldset>
                  <div className="col-lg-12 col-sm-12">
                    <div className="slds-form-element" >
                      <div className="row">
                        <div className="col-sm-2">
                          <abbr className="slds-required" title="required">* </abbr>
                          <input
                            type="file"
                            multiple
                            name="file-uploader"
                            accept={this.determineAcceptableFileTypes()}
                            ref={this.aspirationInputFile}
                            onChange={(e) => this.handleChangeUpload(e, 'ns_aspiration_files')}
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
                                  label={`Upload Document`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreForAspirationFiles}
                                />
                              )
                          }
                        </div>
                        <div className="col-sm-10">


                          {

                            this.state.ns_aspiration_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span>
                                      <a onClick={() => { this.openfile(val) }} href={"javascript:void(0);"} className="reset" style={{ color: '#000', cursor: 'pointer' }}>
                                        {((val.name).length > 30) ? val.name : (val.name)} </a><span><Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'before', 'ns_aspiration_files')}
                                    /></span> 
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {this.state.attachment_details && this.state.attachment_details.ns_aspiration_files && this.state.attachment_details.ns_aspiration_files.length > 0 &&
                            this.state.attachment_details.ns_aspiration_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span><a href={this.determineAttachmentLink(val)} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                      {val.orig_name + '_NutritionalSupport' + val.file_ext}
                                    </a><span><Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'after', 'ns_aspiration_files')}
                                    /></span></span>
                                  </div>
                                </div>
                              </div>

                            ))}


                        </div>
                      </div>
                    </div>
                  </div>

                </fieldset>}

                {this.state.risk_aspiration == '2' && <div className="slds-form-element__control row">
                  <span className="slds-checkbox slds-float_left col col-sm-6">
                    <input type="checkbox" name="aspiration_food" id="aspiration_food" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.aspiration_food && this.state.aspiration_food == '1') ? true : false} />
                    <label className="slds-checkbox__label" htmlFor="aspiration_food">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label"> Food</span>
                    </label>
                  </span>
                </div>}

                {this.state.risk_aspiration == '2' && this.state.aspiration_food == '1' && <div className="slds-form-element__control row">
                  <fieldset className="slds-form-element mb-3">
                    <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                      <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                          <Textarea
                            type="text"
                            className="slds-input"
                            name="aspiration_food_desc"
                            placeholder="Enter the details of “Food”"
                            onChange={(e) => this.setState({ aspiration_food_desc: e.target.value })}
                            value={this.state.aspiration_food_desc}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>}

                {this.state.risk_aspiration == '2' && <div className="slds-form-element__control row">
                  <span className="slds-checkbox slds-float_left col col-sm-6">
                    <input type="checkbox" name="aspiration_fluids" id="aspiration_fluids" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.aspiration_fluids && this.state.aspiration_fluids == '1') ? true : false} />
                    <label className="slds-checkbox__label" htmlFor="aspiration_fluids">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label"> Fluids</span>
                    </label>
                  </span>
                </div>}

                {this.state.risk_aspiration == '2' && this.state.aspiration_fluids == '1' && <div className="slds-form-element__control row">
                  <fieldset className="slds-form-element mb-3">
                    <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                      <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                          <Textarea
                            type="text"
                            className="slds-input"
                            name="aspiration_fluids_desc"
                            placeholder="Enter the details of “Fluids”"
                            onChange={(e) => this.setState({ aspiration_fluids_desc: e.target.value })}
                            value={this.state.aspiration_fluids_desc}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>}

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label"> Is there a Risk of choking</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="choking_no" value="1" name="risk_choking" onChange={(e) => handleChange(this, e)} checked={(this.state.risk_choking && this.state.risk_choking == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="choking_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="choking_yes" value="2" name="risk_choking" onChange={(e) => handleChange(this, e)} checked={(this.state.risk_choking && this.state.risk_choking == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="choking_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {this.state.risk_choking == '2' && <fieldset>
                  <div className="col-lg-12 col-sm-12">
                    <div className="slds-form-element" >
                      <div className="row">
                        <div className="col-sm-2">
                          <abbr className="slds-required" title="required">* </abbr>
                          <input
                            type="file"
                            multiple
                            name="file-uploader"
                            accept={this.determineAcceptableFileTypes()}
                            ref={this.chokingInputFile}
                            onChange={(e) => this.handleChangeUpload(e, 'ns_choking_files')}
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
                                  label={`Upload Document`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreForChokingFiles}
                                />
                              )
                          }
                        </div>
                        <div className="col-sm-10">
                          {
                            this.state.ns_choking_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span>
                                      <a onClick={() => { this.openfile(val) }} href={"javascript:void(0);"} className="reset" style={{ color: '#000', cursor: 'pointer' }}>
                                        {((val.name).length > 30) ? val.name : (val.name)} </a><span><Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'before', 'ns_choking_files')}
                                    /></span> 
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {this.state.attachment_details && this.state.attachment_details.ns_choking_files && this.state.attachment_details.ns_choking_files.length > 0 &&
                            this.state.attachment_details.ns_choking_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span><a href={this.determineAttachmentLink(val)} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                      {val.orig_name + '_NutritionalSupport' + val.file_ext} </a><span>
                                      <Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'after', 'ns_choking_files')}
                                    />
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </fieldset>}

                {this.state.risk_choking == '2' && <div className="slds-form-element__control row">
                  <span className="slds-checkbox slds-float_left col col-sm-6">
                    <input type="checkbox" name="choking_food" id="choking_food" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.choking_food && this.state.choking_food == '1') ? true : false} />
                    <label className="slds-checkbox__label" htmlFor="choking_food">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label"> Food</span>
                    </label>
                  </span>
                </div>}

                {this.state.risk_choking == '2' && this.state.choking_food == '1' && <div className="slds-form-element__control row">
                  <fieldset className="slds-form-element mb-3">
                    <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                      <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                          <Textarea
                            type="text"
                            className="slds-input"
                            name="choking_food_desc"
                            placeholder="Enter the details of “Food”"
                            onChange={(e) => this.setState({ choking_food_desc: e.target.value })}
                            value={this.state.choking_food_desc}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>}

                {this.state.risk_choking == '2' && <div className="slds-form-element__control row">
                  <span className="slds-checkbox slds-float_left col col-sm-6">
                    <input type="checkbox" name="choking_fluids" id="choking_fluids" onChange={(e) => { handleChange(this, e); this.empty_desc() }} checked={(this.state.choking_fluids && this.state.choking_fluids == '1') ? true : false} />
                    <label className="slds-checkbox__label" htmlFor="choking_fluids">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label"> Fluids</span>
                    </label>
                  </span>
                </div>}

                <div className="slds-form-element__control row">
                  {this.state.risk_choking == 2 && this.state.choking_fluids == '1' && <fieldset className="slds-form-element mb-3">
                    <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                      <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                          <Textarea
                            type="text"
                            className="slds-input"
                            name="choking_fluids_desc"
                            placeholder="Enter the details of “Fluids”"
                            onChange={(e) => this.setState({ choking_fluids_desc: e.target.value })}
                            value={this.state.choking_fluids_desc}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>}
                </div>
                <div className="slds-form-element__control row">
                  <div className="col-lg-6 col-sm-6 ">
                    <div className="slds-form-element">
                      <legend className="slds-form-element__legend slds-form-element__label"> Food Preferences</legend>
                      <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                          <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            {this.renderFoodPreferencesComboBox("food_preference", "food_preferences", "selected_food_preferences", "food_preference_id")}
                          </IconSettings>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="slds-form-element__control row">
                  {this.state.show_food_desc && <fieldset className="slds-form-element mb-3">
                    <div className="col-md-6"><label className="slds-form-element__legend slds-form-element__label">Description</label>
                      <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                          <Textarea
                            type="text"
                            className="slds-input"
                            name="food_preferences_desc"
                            placeholder="Enter the details of “Food preferences”"
                            onChange={(e) => this.setState({ food_preferences_desc: e.target.value })}
                            value={this.state.food_preferences_desc}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>}
                </div>

                <fieldset className="slds-form-element">
                  <div className="slds-form-element__control row">

                    <legend className="slds-form-element__legend slds-form-element__label">
                      Percutaneous Endoscopic Gastromy (PEG) Meal Assistance</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" value="1" id="peg_assistance_plan_no" name="peg_assistance_plan" onChange={(e) => handleChange(this, e)} checked={(this.state.peg_assistance_plan && this.state.peg_assistance_plan == 1) ? true : false} />
                        <label className="slds-radio__label" htmlFor="peg_assistance_plan_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" value="2" id="peg_assistance_plan_yes" name="peg_assistance_plan" onChange={(e) => handleChange(this, e)} checked={(this.state.peg_assistance_plan && this.state.peg_assistance_plan == 2) ? true : false} />
                        <label className="slds-radio__label" htmlFor="peg_assistance_plan_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                    </div>
                  </div>
                </fieldset>

                {this.state.peg_assistance_plan == 2 && <fieldset>
                  <div className="col-lg-12 col-sm-12">
                    <div className="slds-form-element" >
                      <div className="row">
                        <div className="col-sm-2">
                          <abbr className="slds-required" title="required">* </abbr>
                          <input
                            type="file"
                            multiple
                            name="file-uploader"
                            accept={this.determineAcceptableFileTypes()}
                            ref={this.pegInputFile}
                            onChange={(e) => this.handleChangeUpload(e, 'ns_peg_assistance_files')}
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
                                  label={`Upload Document`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreForPegFiles}
                                />
                              )
                          }
                        </div>
                        <div className="col-sm-10">

                          {

                            this.state.ns_peg_assistance_files && this.state.ns_peg_assistance_files.length > 0 && this.state.ns_peg_assistance_files.map((val, index) => (

                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span>
                                      <a onClick={() => { this.openfile(val) }} href={"javascript:void(0);"} className="reset" style={{ color: '#000', cursor: 'pointer' }}>
                                        {((val.name).length > 30) ? val.name : (val.name)} </a><span><Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'before', 'ns_peg_assistance_files')}
                                    /></span> 
                                    </span>
                                  </div>
                                  
                                </div>
                              </div>
                            ))}
                          {this.state.attachment_details && this.state.attachment_details.ns_peg_assistance_files && this.state.attachment_details.ns_peg_assistance_files.length > 0 &&
                            this.state.attachment_details.ns_peg_assistance_files.map((val, index) => (

                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="col-sm-12">
                                  <span><a href={this.determineAttachmentLink(val)} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                    {val.orig_name + '_NutritionalSupport' + val.file_ext}</a> 
                                    <span>
                                    <Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="delete"
                                    variant="icon"
                                    iconClassName={`slds-button__icon_delete ml-2`}
                                    onClick={() => this.removeDoc(index, val, 'after', 'ns_peg_assistance_files')}
                                  /></span>
                                  </span>
                                </div>
                              </div>
                            ))}


                        </div>
                      </div>
                    </div>
                  </div>

                </fieldset>}

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">
                    Percutaneous Endoscopic Jejunostomy (PEJ) Meal Assistance</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" value="1" id="pej_assistance_plan_no" name="pej_assistance_plan" onChange={(e) => handleChange(this, e)} checked={(this.state.pej_assistance_plan && this.state.pej_assistance_plan == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="pej_assistance_plan_no">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" value="2" id="pej_assistance_plan_yes" name="pej_assistance_plan" onChange={(e) => handleChange(this, e)} checked={(this.state.pej_assistance_plan && this.state.pej_assistance_plan == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="pej_assistance_plan_yes">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {this.state.pej_assistance_plan == 2 && <fieldset>
                  <div className="col-lg-12 col-sm-12">
                    <div className="slds-form-element" >
                      <div className="row">
                        <div className="col-sm-2">
                          <abbr className="slds-required" title="required">* </abbr>
                          <input
                            type="file"
                            multiple
                            name="file-uploader"
                            accept={this.determineAcceptableFileTypes()}
                            ref={this.pejInputFile}
                            onChange={(e) => this.handleChangeUpload(e, 'ns_pej_assistance_files')}
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
                                  label={`Upload Document`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreForPejFiles}
                                />
                              )
                          }
                        </div>
                        <div className="col-sm-10">

                          {

                            this.state.ns_pej_assistance_files && this.state.ns_pej_assistance_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span>
                                      <a onClick={() => { this.openfile(val) }} href={"javascript:void(0);"} className="reset" style={{ color: '#000', cursor: 'pointer' }}>
                                        {((val.name).length > 30) ? val.name : (val.name)} </a><span><Button
                                      category="reset"
                                      iconSize="medium"
                                      iconName="delete"
                                      variant="icon"
                                      iconClassName={`slds-button__icon_delete ml-2`}
                                      onClick={() => this.removeDoc(index, val, 'before', 'ns_pej_assistance_files')}
                                    /></span> 
                                    </span>
                                  </div>
                                  
                                </div>
                              </div>
                            ))}
                          {this.state.attachment_details && this.state.attachment_details.ns_pej_assistance_files && this.state.attachment_details.ns_pej_assistance_files.length > 0 &&
                            this.state.attachment_details.ns_pej_assistance_files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                 <div className="row">
                                <div className="col-sm-12">
                                  <span><a href={this.determineAttachmentLink(val)} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                    {val.orig_name + '_NutritionalSupport' + val.file_ext} </a><span><Button
                                    category="reset"
                                    iconSize="medium"
                                    iconName="delete"
                                    variant="icon"
                                    iconClassName={`slds-button__icon_delete ml-2`}
                                    onClick={() => this.removeDoc(index, val, 'after', 'ns_pej_assistance_files')}
                                  /></span>
                                  </span>
                                </div>
                                
                                </div>
                              </div>
                            ))}


                        </div>
                      </div>
                    </div>
                  </div>

                </fieldset>}


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

export default connect(mapStateToProps, mapDispatchtoProps)(NutritionalSupport);
