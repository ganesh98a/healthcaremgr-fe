import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow, handleChange, css, getLoginToken, postImageData, AjaxConfirm } from 'service/common.js';
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
class Mobility extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      existingAttachments: 0,
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
        this.getSelectedMobility();
      })
    }
  }

  getSelectedMobility = () => {
    postData("sales/NeedAssessment/get_selected_mobility", { need_assessment_id: this.state.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT, object_name: 'Mobility' }).then((res) => {
      if (res.status) {
        this.setState(res.data.mobility_data)
        this.setState({ attachment_details: res.data.attachment_data });
      }
    });
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
      archive_need_assessment_doc(value, 'mobility').then((res) => {
        if (res) {
          this.getSelectedMobility();
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

  getExistingAttachments = () => {
    let object_id = this.state.need_assessment_id;
    let object_type = 5;
    postData('sales/Attachment/get_all_related_attachments', { object_id, object_type }).then(res => {
      if (res.status) {
        this.setState({ existingAttachments: res.data.length }, () => {
          let aidCnt = this.get_aid_selected_count();

          if (this.state.not_applicable != "1" && aidCnt != 0 && this.state.existingAttachments < aidCnt) {
            toastMessageShow('Please upload all the required Manual Handling Plan', 'e');
            return false;
          } else {
            this.saveOrUpdate();
          }
        })
      }
    })
  }

  showInfoMsg = (obj, e) => {
    handleChange(obj, e);
    if (this.state.attachment_details.length == 0) {
      toastMessageShow('Please upload Manual Handling Plan in Attachments', "w");
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
      this.setState({ files: newFiles }, this.handleAfterStateChanged);
    }

  }

  onSubmit = (e) => {
    e.preventDefault();
    jQuery("#mobility_form").validate({ /* */ });
    this.saveOrUpdate();
  }

  saveOrUpdate = () => {

    let formData = new FormData()
    this.state.files.forEach(file => formData.append('files[]', file));
    if (this.state.inout_bed == "5" || this.state.inout_shower == "5" || this.state.onoff_toilet == "5" || this.state.inout_chair == "5" || this.state.inout_vehicle == "5") {
      if (this.state.files.length == 0 && this.state.attachment_details.length == 0) {
        toastMessageShow('Please upload all the required Manual Handling Plan', 'e');
        return false;
      }
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
    formData.append('object_name', 'Mobility');
    if (this.state.id) {
      formData.append('id', this.state.id);
    }
    // These are required data
    if (this.state.can_mobilize && this.state.short_distances && this.state.long_distances && this.state.up_down_stairs && this.state.inout_bed
      && this.state.inout_shower && this.state.onoff_toilet && this.state.inout_chair && this.state.inout_vehicle && this.state.uneven_surfaces) {
      formData.append('need_assessment_id', this.state.need_assessment_id);
      formData.append('can_mobilize', this.state.can_mobilize);
      formData.append('short_distances', this.state.short_distances);
      formData.append('long_distances', this.state.long_distances);
      formData.append('up_down_stairs', this.state.up_down_stairs);
      formData.append('inout_bed', this.state.inout_bed);
      formData.append('inout_shower', this.state.inout_shower);
      formData.append('onoff_toilet', this.state.onoff_toilet);
      formData.append('inout_chair', this.state.inout_chair);
      formData.append('inout_vehicle', this.state.inout_vehicle);
      formData.append('uneven_surfaces', this.state.uneven_surfaces)

    }
    formData.append('not_applicable', this.state.not_applicable);
    formData.append('inout_bed_equipment_used', this.state.inout_bed_equipment_used && this.state.inout_bed_equipment_used != undefined ? this.state.inout_bed_equipment_used : '');
    formData.append('inout_chair_equipment_used', this.state.inout_chair_equipment_used && this.state.inout_chair_equipment_used != undefined ? this.state.inout_chair_equipment_used : '');
    formData.append('inout_shower_equipment_used', this.state.inout_shower_equipment_used && this.state.inout_shower_equipment_used != undefined ? this.state.inout_shower_equipment_used : '');
    formData.append('inout_vehicle_equipment_used', this.state.inout_vehicle_equipment_used && this.state.inout_vehicle_equipment_used != undefined ? this.state.inout_vehicle_equipment_used : '');
    formData.append('onoff_toilet_equipment_used', this.state.onoff_toilet_equipment_used && this.state.onoff_toilet_equipment_used != undefined ? this.state.onoff_toilet_equipment_used : '');

    this.setState({ loading: true });
    postImageData('sales/NeedAssessment/save_mobility', formData).then((result) => {
      if (result.status) {
        let msg = result.msg;
        toastMessageShow(msg, 's');
        this.getSelectedMobility();
        this.setState({ files: [], loading: false });
        this.props.get_sales_attachment_data({ object_id: this.props.need_assessment_id, object_type: OBJECT_TYPE_NEED_ASSESSMENT });

      } else {
        toastMessageShow(result.msg, "e");
        this.setState({ loading: false });
      }
    });
  }

  /** Get selected aid count */
  get_aid_selected_count = () => {
    let aid_cnt = 0;
    if (this.state.inout_bed == "5") {
      aid_cnt = aid_cnt + 1;
    }
    if (this.state.inout_shower == "5") {
      aid_cnt = aid_cnt + 1;
    }
    if (this.state.onoff_toilet == "5") {
      aid_cnt = aid_cnt + 1;
    }
    if (this.state.inout_chair == "5") {
      aid_cnt = aid_cnt + 1;
    }
    if (this.state.inout_vehicle == "5") {
      aid_cnt = aid_cnt + 1;
    }

    return aid_cnt;
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
            <form id="mobility_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
              <div className="slds-panel__header">
                <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Mobility</h2>
              </div>
              <div className="slds-panel__body">
                <div className="slds-form-element">
                  <div className="slds-form-element__control">
                    <div className="slds-checkbox">
                      <input type="checkbox" name="not_applicable" id="not_applicable_chkbox" onChange={(e) => handleChange(this, e)} checked={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} />
                      <label className="slds-checkbox__label" htmlFor="not_applicable_chkbox">
                        <span className="slds-checkbox_faux"></span>
                        <span className="slds-form-element__label">Not applicable</span>
                      </label>
                    </div>
                  </div>
                </div>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">Can you Mobilize?</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="can_mobilize_2" value="1" name="can_mobilize" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.can_mobilize && this.state.can_mobilize == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="can_mobilize_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="can_mobilize_1" value="2" name="can_mobilize" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.can_mobilize && this.state.can_mobilize == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="can_mobilize_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">Short distances?</legend>
                  <div className="slds-form-element__control">

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="short_distances_2" value="1" name="short_distances" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.short_distances && this.state.short_distances == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="short_distances_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="short_distances_1" value="2" name="short_distances" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.short_distances && this.state.short_distances == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="short_distances_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">Long distances?</legend>
                  <div className="slds-form-element__control">

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="long_distances_2" value="1" name="long_distances" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.long_distances && this.state.long_distances == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="long_distances_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="long_distances_1" value="2" name="long_distances" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.long_distances && this.state.long_distances == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="long_distances_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">Up/down stairs?</legend>
                  <div className="slds-form-element__control">

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="up_down_stairs_2" value="1" name="up_down_stairs" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.up_down_stairs && this.state.up_down_stairs == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="up_down_stairs_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="up_down_stairs_1" value="2" name="up_down_stairs" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.up_down_stairs && this.state.up_down_stairs == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="up_down_stairs_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">Uneven surfaces?</legend>
                  <div className="slds-form-element__control">

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="uneven_surfaces_2" value="1" name="uneven_surfaces" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.uneven_surfaces && this.state.uneven_surfaces == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="uneven_surfaces_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">No</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="uneven_surfaces_1" value="2" name="uneven_surfaces" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.uneven_surfaces && this.state.uneven_surfaces == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="uneven_surfaces_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Yes</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">In/out of bed</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_bed_1" value="1" name="inout_bed" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_bed && this.state.inout_bed == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_bed_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Not applicable</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_bed_5" value="5" name="inout_bed" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => this.showInfoMsg(this, e)} checked={(this.state.inout_bed && this.state.inout_bed == 5) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_bed_5">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With Aids and Equipment</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_bed_2" value="2" name="inout_bed" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_bed && this.state.inout_bed == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_bed_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With assistance</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_bed_3" value="3" name="inout_bed" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_bed && this.state.inout_bed == 3) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_bed_3">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With supervision</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_bed_4" value="4" name="inout_bed" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_bed && this.state.inout_bed == 4) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_bed_4">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Independant</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {
                  (this.state.inout_bed && this.state.inout_bed == '5') ?
                    <fieldset className="slds-form-element mb-3">
                      <div className="col-md-6">
                        <div className="slds-form-element__control">
                          <div className="SLDS_date_picker_width">
                            <label style={{ fontWeight: "bold", padding: "3px", fontSize: "12px" }}>Please, enter type of equipment used</label>
                            <Textarea
                              disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false}
                              type="text"
                              className="slds-input"
                              name="inout_bed_equipment_used"
                              placeholder=""
                              onChange={(e) => this.setState({ inout_bed_equipment_used: e.target.value })}
                              value={this.state.inout_bed_equipment_used}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    : ''
                }

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">In/out of shower/bath</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_shower_1" value="1" name="inout_shower" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_shower && this.state.inout_shower == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_shower_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Not applicable</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_shower_5" value="5" name="inout_shower" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => this.showInfoMsg(this, e)} checked={(this.state.inout_shower && this.state.inout_shower == 5) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_shower_5">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With Aids and Equipment</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_shower_2" value="2" name="inout_shower" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_shower && this.state.inout_shower == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_shower_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With assistance</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_shower_3" value="3" name="inout_shower" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_shower && this.state.inout_shower == 3) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_shower_3">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With supervision</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_shower_4" value="4" name="inout_shower" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_shower && this.state.inout_shower == 4) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_shower_4">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Independant</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {
                  (this.state.inout_shower && this.state.inout_shower == '5') ?
                    <fieldset className="slds-form-element mb-3">
                      <div className="col-md-6">
                        <div className="slds-form-element__control">
                          <div className="SLDS_date_picker_width">
                            <label style={{ fontWeight: "bold", padding: "3px", fontSize: "12px" }}>Please, enter type of equipment used</label>
                            <Textarea
                              disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false}
                              type="text"
                              className="slds-input"
                              name="inout_shower_equipment_used"
                              placeholder=""
                              onChange={(e) => this.setState({ inout_shower_equipment_used: e.target.value })}
                              value={this.state.inout_shower_equipment_used}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    : ''
                }

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">On/off toilet</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="onoff_toilet_1" value="1" name="onoff_toilet" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.onoff_toilet && this.state.onoff_toilet == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="onoff_toilet_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Not applicable</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="onoff_toilet_5" value="5" name="onoff_toilet" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => this.showInfoMsg(this, e)} checked={(this.state.onoff_toilet && this.state.onoff_toilet == 5) ? true : false} />
                      <label className="slds-radio__label" htmlFor="onoff_toilet_5">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With Aids and Equipment</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="onoff_toilet_2" value="2" name="onoff_toilet" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.onoff_toilet && this.state.onoff_toilet == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="onoff_toilet_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With assistance</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="onoff_toilet_3" value="3" name="onoff_toilet" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.onoff_toilet && this.state.onoff_toilet == 3) ? true : false} />
                      <label className="slds-radio__label" htmlFor="onoff_toilet_3">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With supervision</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="onoff_toilet_4" value="4" name="onoff_toilet" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.onoff_toilet && this.state.onoff_toilet == 4) ? true : false} />
                      <label className="slds-radio__label" htmlFor="onoff_toilet_4">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Independant</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {
                  (this.state.onoff_toilet && this.state.onoff_toilet == '5') ?
                    <fieldset className="slds-form-element mb-3">
                      <div className="col-md-6">
                        <div className="slds-form-element__control">
                          <div className="SLDS_date_picker_width">
                            <label style={{ fontWeight: "bold", padding: "3px", fontSize: "12px" }}>Please, enter type of equipment used</label>
                            <Textarea
                              disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false}
                              type="text"
                              className="slds-input"
                              name="onoff_toilet_equipment_used"
                              placeholder=""
                              onChange={(e) => this.setState({ onoff_toilet_equipment_used: e.target.value })}
                              value={this.state.onoff_toilet_equipment_used}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    : ''
                }

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">In/out of chair/wheelchair</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_chair_1" value="1" name="inout_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_chair && this.state.inout_chair == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_chair_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Not applicable</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_chair_5" value="5" name="inout_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => this.showInfoMsg(this, e)} checked={(this.state.inout_chair && this.state.inout_chair == 5) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_chair_5">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With Aids and Equipment</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_chair_2" value="2" name="inout_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_chair && this.state.inout_chair == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_chair_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With assistance</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_chair_3" value="3" name="inout_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_chair && this.state.inout_chair == 3) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_chair_3">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With supervision</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_chair_4" value="4" name="inout_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_chair && this.state.inout_chair == 4) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_chair_4">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Independant</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {
                  (this.state.inout_chair && this.state.inout_chair == '5') ?
                    <fieldset className="slds-form-element mb-3">
                      <div className="col-md-6">
                        <div className="slds-form-element__control">
                          <div className="SLDS_date_picker_width">
                            <label style={{ fontWeight: "bold", padding: "3px", fontSize: "12px" }}>Please, enter type of equipment used</label>
                            <Textarea
                              disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false}
                              type="text"
                              className="slds-input"
                              name="inout_chair_equipment_used"
                              placeholder=""
                              onChange={(e) => this.setState({ inout_chair_equipment_used: e.target.value })}
                              value={this.state.inout_chair_equipment_used}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    : ''
                }

                <fieldset className="slds-form-element">
                  <legend className="slds-form-element__legend slds-form-element__label">In/out of vehicle</legend>
                  <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_vehicle_1" value="1" name="inout_vehicle" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_vehicle && this.state.inout_vehicle == 1) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_vehicle_1">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Not applicable</span>
                      </label>
                    </span>

                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_vehicle_5" value="5" name="inout_vehicle" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => this.showInfoMsg(this, e)} checked={(this.state.inout_vehicle && this.state.inout_vehicle == 5) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_vehicle_5">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With Aids and Equipment</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_vehicle_2" value="2" name="inout_vehicle" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_vehicle && this.state.inout_vehicle == 2) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_vehicle_2">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With assistance</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_vehicle_3" value="3" name="inout_vehicle" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_vehicle && this.state.inout_vehicle == 3) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_vehicle_3">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">With supervision</span>
                      </label>
                    </span>
                    <span className="slds-radio slds-float_left">
                      <input type="radio" id="inout_vehicle_4" value="4" name="inout_vehicle" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.inout_vehicle && this.state.inout_vehicle == 4) ? true : false} />
                      <label className="slds-radio__label" htmlFor="inout_vehicle_4">
                        <span className="slds-radio_faux"></span>
                        <span className="slds-form-element__label">Independant</span>
                      </label>
                    </span>
                  </div>
                </fieldset>

                {
                  (this.state.inout_vehicle && this.state.inout_vehicle == '5') ?
                    <fieldset className="slds-form-element mb-3">
                      <div className="col-md-6">
                        <div className="slds-form-element__control">
                          <div className="SLDS_date_picker_width">
                            <label style={{ fontWeight: "bold", padding: "3px", fontSize: "12px" }}>Please, enter type of equipment used</label>
                            <Textarea
                              disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false}
                              type="text"
                              className="slds-input"
                              name="inout_vehicle_equipment_used"
                              placeholder=""
                              onChange={(e) => this.setState({ inout_vehicle_equipment_used: e.target.value })}
                              value={this.state.inout_vehicle_equipment_used}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    : ''
                }

                {this.state.inout_bed == "5" || this.state.inout_shower == "5" || this.state.onoff_toilet == "5" || this.state.inout_chair == "5" || this.state.inout_vehicle == "5" ? <fieldset>
                  <div className="col-lg-6 col-sm-6">
                    <div className="slds-form-element" >
                      <div className="row">
                        {/* {!this.props.readOnly &&  */}
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
                                  label={`Upload Manual Handling Plan`}
                                  title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                  onClick={this.handleClickAddMoreFiles}
                                />
                              )
                          }
                        </div>
                        {/* // } */}
                        <div className="col-sm-6">

                          {

                            this.state.files.map((val, index) => (
                              <div key={index + 1} className="attach_txt pt-1">
                                <div className="col-sm-9">
                                  <span onClick={() => { this.openfile(val) }} className="reset" style={{ color: '#000', cursor: 'pointer' }}>{(val.name)}</span>
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

                </fieldset> : ''}


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

export default connect(mapStateToProps, mapDispatchtoProps)(Mobility);

