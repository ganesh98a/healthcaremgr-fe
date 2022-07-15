import React, { Component } from 'react';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { handleChangeSelectDatepicker, handleDateChangeRaw, postData, postImageData, toastMessageShow } from 'service/common.js';
import { UPLOAD_MAX_SIZE, UPLOAD_MAX_SIZE_IN_MB } from "config.js";
import Dropzone from "react-dropzone";
import _ from "lodash";
import jQuery from "jquery";

const allowedFileTypes = ['application/csv', 'text/csv', '*.csv', '.csv', 'text/plain', 'application/vnd.ms-excel'];
class ImportCsvOrganistaion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCol: '',
      redirectTrue:false
    }
  }
  onDropAddFiles = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {

      let errormsg = false;
      if (
        rejectedFiles.length > 0 &&
        !_.includes(allowedFileTypes, rejectedFiles[0].type)
      ) {
        errormsg = "The filetype you are attempting to upload is not allowed.";
      } else if (
        rejectedFiles.length > 0 &&
        rejectedFiles[0].size > UPLOAD_MAX_SIZE
      ) {
        errormsg =
          "The file you are attempting to upload is larger than the permitted size (" +
          UPLOAD_MAX_SIZE_IN_MB +
          " MB).";
      } else {
        //errormsg = "The filetype you are attempting to upload is not allowed.";
      }
      this.setState({ rejected_msg: errormsg, selected_file: null, selected_file_name: false });
    } else if (acceptedFiles.length > 0) {
      this.setState({ rejected_msg: false, selected_file: acceptedFiles[0], selected_file_name: acceptedFiles[0].name });
    }
  };
  uploadHandler = e => {
    e.preventDefault();
    this.setState({ progress: '0' })
    jQuery("#import_line_item_from").validate({ ignore: [] });
    if (jQuery("#import_line_item_from").valid()) {
      this.setState({ loading: true });
      const formData = new FormData();
      formData.append("docsFile", this.state.selected_file);
    //   formData.append("funding_type", this.state.funding_type);
    //   formData.append("start_date", this.state.start_date);
    //   formData.append("end_date", this.state.end_date);
      formData.append("file_title", this.state.selected_file_name);

      postImageData("sales/OrganisationImport/read_csv_organisation", formData, this).then(responseData => {
        var x = responseData;
        if (responseData.status) {
          let msg = responseData.hasOwnProperty('msg') ? responseData.msg : responseData.message;
          toastMessageShow(msg, 's', { 'close': () => { this.setState({ loading: false, redirectTrue: true }) } });
        } else {
          toastMessageShow(x.error, 'e');
          this.setState({ loading: false });
        }
      })
        .catch(error => {
          toastMessageShow("Api Error", 'e');
          this.setState({ loading: false });
        });
    }
  };


  render() {
    return (
      <React.Fragment>
      {(this.state.redirectTrue) ? <Redirect to='/admin/crm/organisation/listing' /> : ''}
        <div className="row">
          <div className="col-lg-12">
            <div className=" py-4">
              <span className="back_arrow">
                <Link to={"/admin/finance/line_item_listing"}><span className="icon icon-back1-ie"></span></Link>
              </span>
            </div>

            <div className="by-1">
              <div className="row d-flex  py-4">
                <div className="col-lg-8">
                  <div className="h-h1 color">Import CSV Organisation</div>
                </div>
                <div className="col-lg-4 d-flex align-self-center">
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="Finance__panel_1 mt-5">
          <div className="F_module_Panel E_ven_and_O_dd-color E_ven_color_ O_dd_color_ Border_0_F" >
            <Panel defaultExpanded>
              <Panel.Heading>
                <Panel.Title toggle>
                  <div>
                    <p>Upload.CSV for import</p>
                    <span className="icon icon-arrow-right"></span>
                    <span className="icon icon-arrow-down"></span>
                  </div>
                </Panel.Title>
              </Panel.Heading>
              <Panel.Body collapsible>
                <form id="import_line_item_from" method="post" autoComplete="off">
                  <div className="row d-flex justify-content-center">
                    <div className="col-lg-6 col-ms-6 col-xs-12">
                        <div className="row mt-5">
                        <div className="col-lg-12 col-sm-12">
                            <div className="File-Drag-and-Drop_bOX position-relative" >
                            <input type="text " readOnly className="hide" value={(!this.state.selected_file_name ? '' : this.state.selected_file_name)} name={"file_upload"} id={"file_upload"} data-rule-required={true} />
                            <Dropzone
                              onDrop={(files, rejected) =>
                                this.onDropAddFiles(files, rejected)
                              }
                              multiple={false}
                              accept={allowedFileTypes}
                              minSize={0}
                              // maxSize={UPLOAD_MAX_SIZE}
                              autoDiscover={false}
                            >
                              {props => {
                                return (
                                  <div
                                    className="custom-file-upload"
                                    {...props.getRootProps()}
                                  >
                                    <input type="text" {...props.getInputProps()} />
                                    {!this.state.selected_file_name ? (<React.Fragment>
                                      <div className="Drop_bOX_content_1">
                                        <i className="icon icon-if-ic-file-upload-48px-352345"></i>
                                        <span>
                                          <h3>Drag &amp; Drop</h3>
                                          <div>
                                            or <span>Browser</span> for your files
                                        </div>
                                        </span>
                                      </div>

                                    </React.Fragment>) :
                                      (<React.Fragment>
                                        <div className="Drop_bOX_content_2">
                                          <i className="icon icon-document3-ie"></i>
                                          <span>
                                            <div>{this.state.selected_file_name}</div>
                                          </span>
                                        </div>
                                      </React.Fragment>)}
                                  </div>
                                );
                              }}
                            </Dropzone>
                            {this.state.rejected_msg ? (
                              <div className="row mt-5 d-flex justify-content-center">
                                <div className="col-lg-9 col-sm-12 text-center">
                                  <div className="cUS_error_class error_cLass">
                                    <i className="icon icon-alert"></i>
                                    <span>Error, {this.state.rejected_msg}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                                <React.Fragment />
                              )}
                          </div>
                          </div>
                      </div>
                       {this.state.progress > 0 ?
                        (<div className="row  mt-5">
                          <div className="col-lg-12 col-sm-12"><div className="Progress-bar_mYcustom cNTer_mYcustom"><div className="_mYcustom_1"><div className="_mYcustom_Bar" style={{ width: this.state.progress + '%' }}>
                            <span>{this.state.progress} % Upload File</span>
                          </div></div></div>   </div>
                        </div>) : (
                          <React.Fragment />
                        )}
                        <div className="row mt-5 d-flex justify-content-center">
                        <div className="col-lg-5">
                          <button type="submit" className="but" onClick={(e) => this.uploadHandler(e)} disabled={this.state.loading}>Confirm import</button>
                        </div>
                      </div>
                      </div>
                  </div>
                </form>
              </Panel.Body>
            </Panel>
            {/* </PanelGroup> */}
          </div>
        </div>
      </React.Fragment >
    );
  }
}
export default ImportCsvOrganistaion;