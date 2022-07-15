import React, { Component } from "react";

import Select from "react-select-plus";
import DatePicker from "react-datepicker";

import { Panel } from "react-bootstrap";

import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import moment from "moment";
import {
  handleChangeSelectDatepicker,
  handleDateChangeRaw,
  postData,
  postImageData,
  toastMessageShow
} from "service/common.js";
import { UPLOAD_MAX_SIZE, UPLOAD_MAX_SIZE_IN_MB } from "config.js";
import Dropzone from "react-dropzone";
import _ from "lodash";
import jQuery from "jquery";
import { ROUTER_PATH } from "config.js";
import ScrollArea from "react-scrollbar";

const allowedFileTypes = [
  "application/csv",
  "text/csv",
  "*.csv",
  ".csv",
  "text/plain",
  "application/vnd.ms-excel"
];
class ImportNdisInvoiceStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCol: "",
      redirectPage: false,
      succesMsg: false,
      errorMsg: false
    };
  }
  componentDidMount() {
    //this.get_funding_type();
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
      this.setState({
        rejected_msg: errormsg,
        selected_file: null,
        selected_file_name: false
      });
    } else if (acceptedFiles.length > 0) {
      this.setState({
        rejected_msg: false,
        selected_file: acceptedFiles[0],
        selected_file_name: acceptedFiles[0].name
      });
    }
  };
  /* get_funding_type() {
    var requestData = { case_id: this.state.caseId };
    this.setState({ loading: true });
    postData(
      "finance/FinanceLineItem/get_finance_line_item_listing_filter_option",
      requestData
    ).then(result => {
      if (result.status) {
        this.setState(
          { funding_type_option: result.data.funding_type_option },
          () => {}
        );
      } else {
      }
      this.setState({ loading: false });
    });
  } */

  resetForm = e => {
    e.preventDefault();
    this.setState({
      progress: null,
      loading: false,
      selected_file: null,
      selected_file_name: false,
      succesMsg: false,
      errorMsg: false,
      rejected_msg: false,
      file_title: ""
    });
  };

  uploadHandler = e => {
    e.preventDefault();
    this.setState({ progress: "0" });
    jQuery("#import_ndis_invoice_status_update_from").validate({ ignore: [] });
    if (jQuery("#import_ndis_invoice_status_update_from").valid()) {
      this.setState({ loading: true });
      const formData = new FormData();
      formData.append("docsFile", this.state.selected_file);
      formData.append("file_title", this.state.file_title);
      postImageData(
        "finance/FinanceInvoice/read_csv_ndis_invoice_status",
        formData,
        this
      )
        .then(responseData => {
          var x = responseData;
          if (responseData.status) {
            let msgData = x.hasOwnProperty("msg")
              ? x.msg
              : false;
            let errormsg = x.hasOwnProperty("warraing") ? x.warraing : false;
            this.setState({
              loading: false,
              succesMsg: msgData,
              errorMsg: errormsg,
              selected_file: null,
              selected_file_name: false,
              file_title: ""
            });
            //toastMessageShow(msg, 's', { 'close': () => { this.setState({ loading: false, redirectPage: true }) } });
          } else {
            //toastMessageShow(x.error, 'e');
            this.setState({
              loading: false,
              errorMsg: x.error,
              succesMsg: false
            });
          }
        })
        .catch(error => {
          toastMessageShow("Api Error", "e");
          this.setState({ loading: false });
        });
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.redirectPage ? (
          <Redirect to={ROUTER_PATH + "admin/finance/NDISBilling"} />
        ) : (
          <React.Fragment />
        )}
        <div className="row">
          <div className="col-lg-12">
            <div className=" py-4">
              <span className="back_arrow">
                <Link to={ROUTER_PATH + "admin/finance/NDISBilling"}>
                  <span className="icon icon-back1-ie"></span>
                </Link>
              </span>
            </div>

            <div className="by-1">
              <div className="row d-flex  py-4">
                <div className="col-lg-8">
                  <div className="h-h1 color">{this.props.showPageTitle}</div>
                </div>
                <div className="col-lg-4 d-flex align-self-center"></div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="Finance__panel_1">
          <div className="F_module_Panel E_ven_and_O_dd-color E_ven_color_ O_dd_color_ Border_0_F" >
            <PanelGroup accordion id="accordion-example">
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
              <Panel.Body collapsible> */}
        <div className="row d-flex justify-content-center mt-5">
          <div className="col-lg-12">
            <div className="Bg_F_moule">
              <form
                id="import_ndis_invoice_status_update_from"
                method="post"
                autoComplete="off"
              >
                <div className="row d-flex justify-content-center">
                  <div className="col-md-6 col-lg-6 col-xs-12">
                    <div className="d-flex justify-content-center row_status_show_0">
                      {!this.state.succesMsg ? (
                        <React.Fragment></React.Fragment>
                      ) : (
                        <div className="row_status_scucces">
                          <div className="cstmSCroll1 FScroll">
                            <ScrollArea
                              speed={0.8}
                              contentClassName="content"
                              horizontal={false}
                              style={{
                                paddingRight: "15px",
                                maxHeight: "140px"
                              }}
                            >
                              <div dangerouslySetInnerHTML={{ __html: this.state.succesMsg }}></div> 
                  
                            </ScrollArea>
                          </div>
                        </div>
                      )}

                      {!this.state.errorMsg ? (
                        <React.Fragment></React.Fragment>
                      ) : (
                        <div className="row_status_error">
                          <div className="cstmSCroll1 FScroll">
                            <ScrollArea
                              speed={0.8}
                              contentClassName="content"
                              horizontal={false}
                              style={{
                                paddingRight: "15px",
                                maxHeight: "140px"
                              }}
                            >
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: this.state.errorMsg
                                }}
                              ></div>
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row d-flex justify-content-center">
                  <div className="col-lg-6 col-ms-6 col-xs-12">
                    <div className="row mt-5">
                      <div className="col-lg-12 col-sm-12 file_drag_validation__">
                        <input
                          type="text "
                          readOnly
                          className="hide"
                          value={
                            !this.state.selected_file_name
                              ? ""
                              : this.state.selected_file_name
                          }
                          name={"file_upload"}
                          id={"file_upload"}
                          data-rule-required={true}
                        />
                        <div className="File-Drag-and-Drop_bOX position-relative">
                          <Dropzone
                            onDrop={(files, rejected) =>
                              this.onDropAddFiles(files, rejected)
                            }
                            multiple={false}
                            accept={allowedFileTypes}
                            minSize={0}
                            maxSize={UPLOAD_MAX_SIZE}
                            autoDiscover={false}
                          >
                            {props => {
                              return (
                                <div
                                  className="custom-file-upload"
                                  {...props.getRootProps()}
                                >
                                  <input
                                    type="text"
                                    {...props.getInputProps()}
                                  />
                                  {!this.state.selected_file_name ? (
                                    <React.Fragment>
                                      <div className="Drop_bOX_content_1">
                                        <i className="icon icon-if-ic-file-upload-48px-352345"></i>
                                        <span>
                                          <h3>Drag &amp; Drop</h3>
                                          <div>
                                            or <span>Browse</span> for your
                                            files
                                          </div>
                                        </span>
                                      </div>
                                      {/* <div className="Drop_bOX_content_2">
                                        <i className="icon icon-document3-ie"></i>
                                        <span>
                                          <div>for your files</div>
                                        </span>
                                      </div> */}
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment>
                                      <div className="Drop_bOX_content_2">
                                        <i className="icon icon-document3-ie"></i>
                                        <span>
                                          <div>
                                            {this.state.selected_file_name}
                                          </div>
                                        </span>
                                      </div>
                                    </React.Fragment>
                                  )}
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
                    <div className="row mt-5">
                      <div className="col-lg-12 col-sm-12">
                        <label className="label_2_1_1">File Title</label>
                        <span className="required">
                          <input
                            type="text"
                            className="csForm_control"
                            placeholder="New Document Title"
                            name="file_title"
                            maxLength="60"
                            required={true}
                            onChange={e =>
                              this.setState({ file_title: e.target.value })
                            }
                            value={this.state.file_title || ""}
                          />
                        </span>
                      </div>
                    </div>

                    <div className="row mt-5">
                      <div className="col-lg-12 col-sm-12">
                        <div className="Progress-bar_mYcustom cNTer_mYcustom">
                          {this.state.progress > 0 ? (
                            <div className="_mYcustom_1">
                              <div
                                className="_mYcustom_Bar"
                                style={{ width: this.state.progress + "%" }}
                              >
                                <span>{this.state.progress} % Upload File</span>
                              </div>
                            </div>
                          ) : (
                            <React.Fragment />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mt-5 d-flex justify-content-center">
                      {/*<div className="col-lg-9 col-sm-12 text-center">
                                                <div className="cUS_error_class error_cLass">
                                                    <i className="icon icon-alert"></i>
                                                    <span>Error, this file has already been uploaded. Please select another</span>
                                                </div>
                                                <div className="cUS_error_class success_cLass">
                                                    <i className="icon icon-input-type-check"></i>
                                                    <span>This CSV file has successfully been uploaded into the system. Once Confirmed, it will become available for use within the system</span>
                                                </div>
                                            </div>*/}
                    </div>

                    <div className="row mt-5 d-flex justify-content-center">
                      <div className="col-lg-5">
                        <button
                          type="submit"
                          className="but"
                          onClick={e => this.uploadHandler(e)}
                          disabled={this.state.loading}
                        >
                          Save & Upload
                        </button>
                      </div>

                      <div className="col-lg-5">
                        <button
                          type="submit"
                          className="but"
                          onClick={e => this.resetForm(e)}
                          disabled={this.state.loading}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* <div className="row mt-5 d-flex justify-content-center">
                        <div className="col-lg-5">
                          <a className="but" >Refresh Upload</a>
                        </div>
                      </div> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* </Panel.Body>
            </Panel>
            </PanelGroup>
          </div>
        </div> */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  showPageTitle: state.FinanceReducer.activePage.pageTitle,
  showTypePage: state.FinanceReducer.activePage.pageType
});
const mapDispatchtoProps = dispach => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchtoProps
)(ImportNdisInvoiceStatus);
