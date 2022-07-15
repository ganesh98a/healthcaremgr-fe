import React, { Component } from "react";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import _ from 'lodash'
import { getStateList, handleChangeSelectDatepicker, postImageData, toastMessageShow } from "service/common.js";
import jQuery from "jquery";
import { connect } from 'react-redux';
import { getApplicantAttachmentCategoryDetails, getApplicantAttachmentDetails } from './../actions/RecruitmentApplicantAction.js';
import { UPLOAD_MAX_SIZE_IN_MB, UPLOAD_MAX_SIZE_ERROR } from 'config.js';
import DatePicker from 'react-datepicker'
import moment from "moment";
import Checkbox from "../../oncallui-react-framework/input/Checkbox";
import Calendar from "../../oncallui-react-framework/input/Calendar";
import { getVisaCategory, getVisaTypeByCategory } from '../../oncallui-react-framework/services/common';
import label from "@salesforce/design-system-react/lib/components/global-navigation-bar/label";
import { VISA_DETAILS } from '../../oncallui-react-framework/constants';

export const ApplicantAttachmentJobTitle = ({ application = null }) => {
    if (!application) {
        return null
    }

    const { position_applied } = application || {}
    return (
        <div className="csform-group">
            <label>Job title</label>
            <div>
                <span>{position_applied}</span>
            </div>
        </div>
    )
}

// @todo: Refactor with ApplicantEditAttachmentForm.jsx to 
// make attachment form reusable
class ApplicantAddAttachmentFrom extends Component {
    constructor() {
        super();
        this.uploadDocsInitialState = {
            selectedFile: null,
            docsTitle: "",
            docsCategory: "",
            docStatus: 1,
            docExpiryDate: null,
            docIssueDate: null,
            filename: null,
            fileValue: '',
            loading: false,
            reference_number: '',
            issue_date_mandatory: false,
            expiry_date_mandatory: false,
            reference_number_mandatory: false,
            show_visa_field: false,
            visa_category: '',
            visa_category_type: ''
        }
        this.state = this.uploadDocsInitialState;

    }
    componentDidMount() {
        getStateList().then(data => {
            this.setState({ stateList: data });
        })
        if (this.props.attachment_category_list.length <= 0) {
            const { applicantDetailsDocPage } = this.props
            const { jobId } = applicantDetailsDocPage || {}
            this.props.getApplicantAttachmentCategoryDetails({ jobId });
        }

         // fetch visa category list
         getVisaCategory().then((result) => {
            this.setState({ visa_category_option: result }, () => { });
        });
    }    

    // fetch visa type list by visa category id
    callVisaTypeByCategory = (visa_category) => {
        getVisaTypeByCategory(visa_category).then((result) => {
            this.setState({ visa_type_category_option: result }, () => { });
        });
    }

    fileChangedHandler = event => {
        let fileData = event.target.files.length > 0 ? event.target.files[0] : '';
        let fileSize = fileData != '' ? Math.round((fileData.size / 1024)) : '';
        let fileUpload = fileSize != '' && fileSize > (UPLOAD_MAX_SIZE_IN_MB * 1024) ? false : true;
        if (fileUpload) {
            this.setState({
                selectedFile: fileData != '' ? fileData : null,
                filename: fileData != '' ? fileData.name : null,
                fileValue: event.target.files.length > 0 ? event.target.value : ''
            });
        } else {
            this.setState({
                selectedFile: null,
                filename: null,
                fileValue: ''
            }, () => {
                toastMessageShow(UPLOAD_MAX_SIZE_ERROR, 'e');
            });

        }
        /* this.setState({
          selectedFile:  fileData!='' &&  >0 ?fileData:null,
          filename: fileData!='' ?  fileData.name:null,
          fileValue: event.target.files.length>0 ?event.target.value:''
        },()=>{
          let fSize =  event.target.files.length>0 ? event.target.files[0].size:0;
          console.log('sdd',fSize);
          let  fileSize = Math.round((fSize / 1024)); 
          if (fileSize > 5120) { 
            this.setState({
              selectedFile:  null,
              filename: null,
              fileValue: ''
            },()=>{toastMessageShow('The file you are attempting to upload is larger than the permitted size(5MB).','e')});
          }
        }); */
    };

    /**
       * Valid form fields 
       */
    validCheck = () => {
        var issue_date = this.state.docIssueDate;
        var expiry_date = this.state.docExpiryDate;
        var reference_number = this.state.reference_number;
        var issue_date_mandatory = this.state.issue_date_mandatory;
        var expiry_date_mandatory = this.state.expiry_date_mandatory;
        var reference_number_mandatory = this.state.reference_number_mandatory;

        if ((issue_date === "" || issue_date === null) && issue_date_mandatory === true) {
            toastMessageShow('Select Issue Date', 'e');
            return false;
        }

        var issue_date_moment = moment(this.state.docIssueDate);
        if (issue_date !== "" && issue_date != null && issue_date_moment.isValid() === false) {
            toastMessageShow('Provide Valid Issue Date. format must be DD/MM/YYYY', 'e');
            return false;
        }

        let newDate = new Date();
        if (issue_date !== "" && (moment(issue_date) >= moment(newDate))) {
            toastMessageShow('Issue date should be less than today', 'e');
            return false;
        }

        if ((expiry_date === "" || expiry_date === null) && expiry_date_mandatory === true) {
            toastMessageShow('Select Expiry Date', 'e');
            return false;
        }

        var expire_date_moment = moment(this.state.docExpiryDate);
        if (expiry_date !== "" && expiry_date != null && expire_date_moment.isValid() === false) {
            toastMessageShow('Provide Valid Expiry Date. format must be DD/MM/YYYY', 'e');
            return false;
        }

        if (expiry_date !== "" && issue_date !== "" && (moment(expiry_date).isValid()) && moment(issue_date).isValid()) {
            if ((moment(issue_date) >= moment(expiry_date))) {
                toastMessageShow('Expiry date should be greater than Issue date', 'e');
                return false;
            }
        }

        if (reference_number == "" && reference_number_mandatory === true) {
            toastMessageShow('Reference Number is Mandatory', 'e');
            return false;
        }

        if(this.state.doc_name==VISA_DETAILS && this.state.visa_category == '' && this.state.visa_category_type== ''){
            toastMessageShow('Please add visa category and type', 'e');
            return false;
        }

        return true;
    }

    uploadHandler = e => {
        e.preventDefault();
        jQuery("#applicant_attachment_form").validate({ ignore: [] });
        var validCheck = this.validCheck();
        if (validCheck && jQuery("#applicant_attachment_form").valid()) {
            this.setState({ loading: true });
            const [filename, extension] = this.determineDerivedDocFileName()
            const formData = new FormData();
            let currentStageData = this.props.overwrite_stage && this.props.current_stage_overwrite > 0 ? this.props.current_stage_overwrite : this.props.applicantDetailsDocPage.current_stage;
            formData.append("docsFile", this.state.selectedFile, this.state.filename);
            formData.append("applicantId", this.props.applicantDetailsDocPage.id);
            formData.append("currentStage", currentStageData);
            formData.append("stageMain", this.props.is_main_stage);
            formData.append("docsTitle", filename);
            formData.append("docsCategory", this.state.docsCategory);
            formData.append("docStatus", this.state.docStatus);
            formData.append("reference_number", this.state.reference_number);
            formData.append('license_type', this.state.license_type);
            formData.append('issuing_state', this.state.issuing_state);
            formData.append('vic_conversion_date', this.state.vic_conversion_date);
            formData.append('visa_category', this.state.visa_category);
            formData.append('visa_category_type', this.state.visa_category_type);
            formData.append('doc_name', this.state.doc_name);

            const application_id = _.get(this.props.application, 'id', null)
            if (!!parseInt(application_id)) {
                formData.append('application_id', application_id)
            }

            const { docExpiryDate, docIssueDate } = this.state
            const docExpiryDateYmdHis = docExpiryDate ? moment(docExpiryDate).format('YYYY-MM-DD HH:mm:ss') : '';
            formData.append('docExpiryDate', docExpiryDateYmdHis)

            const docIssueDateDateYmdHis = docIssueDate ? moment(docIssueDate).format('YYYY-MM-DD HH:mm:ss') : '';
            formData.append('docIssueDate', docIssueDateDateYmdHis)

            postImageData(
                "recruitment/RecruitmentApplicant/upload_attachment_docs",
                formData
            )
                .then(responseData => {
                    var x = responseData;
                    if (responseData.status) {
                        this.props.closeModel(true);
                        this.setState(this.uploadDocsInitialState);
                        this.props.getApplicantAttachmentDetails(this.props.applicantDetailsDocPage.id);
                        let msg = (
                            <span>
                                File uploaded successfully. <br />
                                {responseData.warn ? responseData.warn : ""}
                            </span>
                        );
                        toastMessageShow(msg, 's');
                    } else {
                        toastMessageShow(x.error, 'e');
                    }
                    this.setState({ loading: false });
                })
                .catch(error => {
                    toastMessageShow("Api Error", 'e');
                    this.setState({ loading: false });
                });
        }
    };

    typeToCodeMapping() {
        const { attachment_category_list } = this.props

        const codes = (attachment_category_list || []).reduce((obj, curr) => {
            if ('code' in curr === false) {
                return obj
            }

            const id = parseInt(curr['value'])
            obj[id] = curr['code']
            return obj
        }, {})

        return codes
    }

    determineDerivedDocFileName() {
        const { fullname, firstname, lastname } = this.props.applicantDetailsDocPage
        const { docsCategory, filename } = this.state

        const categoryId = parseInt(docsCategory)
        const mapping = this.typeToCodeMapping()

        const tokens = (filename || '').split('.')
        const extension = tokens.pop()
        if (categoryId in mapping === false) {
            return [filename, extension]
        }

        const code = mapping[categoryId]
        const newFileName = `${code} ${firstname}${lastname}`

        return [newFileName, extension]
    }


    renderDocExpiryDatePicker() {
        return (
            <DatePicker
                title={this.state.docExpiryDate ? moment(this.state.docExpiryDate).format('dddd, DD MMMM YYYY') : undefined}
                autoComplete={"off"}
                dateFormat="dd-MM-yyyy"
                placeholderText={"DD/MM/YYYY"}
                className="text-left"
                onChange={e => this.setState({ docExpiryDate: e })}
                selected={this.state.docExpiryDate}
                name="docExpiryDate"
            />
        )
    }


    renderDocIssueDatePicker() {
        let selected = this.state.docIssueDate

        const docIssueDateMoment = moment(selected)
        if (!docIssueDateMoment.isValid()) {
            selected = undefined
        }

        return (
            <DatePicker
                title={this.state.docIssueDate ? moment(this.state.docIssueDate).format('dddd, DD MMMM YYYY') : undefined}
                autoComplete={"off"}
                dateFormat="dd-MM-yyyy"
                placeholderText={"DD/MM/YYYY"}
                className="text-left"
                maxDate={moment()} // Allow up to today's date. Tomorrow and beyond not allowed
                onChange={e => this.setState({ docIssueDate: e })}
                selected={selected}
                name="docIssueDate"
            />
        )
    }


    renderDocsTitle() {
        const [filename, extension] = this.determineDerivedDocFileName()

        return (
            <div>
                {filename}
            </div>
        )
    }


    render() {


        const { attachment_category_list } = this.props

        let license = false;
        const catlist = (attachment_category_list || []).map(l => {
            if (l.value === this.state.docsCategory && l.label === "Drivers’ Licence") {
                license = true;
            }
            return ({
                value: l.value,
                label: l.label,
                issue_date_mandatory: l.issue_date_mandatory,
                expiry_date_mandatory: l.expire_date_mandatory,
                reference_number_mandatory: l.reference_number_mandatory,
            })
        })

        return (
            <React.Fragment>
                <form
                    id="applicant_attachment_form"
                    method="post"
                    autoComplete="off"
                >

                    <div className={this.props.isModelPage ? "col-md-12 pr-5" : "col-md-6 pr-5"}>
                        <label className={"bg_labs2 mr_b_20 " + (this.props.isModelPage ? "mt-3" : "")}>
                            <strong>New Document Information</strong>{" "}
                        </label>

                        <ApplicantAttachmentJobTitle application={this.props.application} />

                        <div className="csform-group">
                            <label title={`Formerly known as 'Document category'`}>Type</label>
                            <div className="sLT_gray left left-aRRow w-70">
                                <span className="required">
                                    <Select
                                        className="custom_select default_validation "
                                        name="docsCategory"
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        value={this.state.docsCategory}
                                        onChange={e => {
                                            const [title, extension] = this.determineDerivedDocFileName()

                                            let findDocIndex = catlist.findIndex((doc) => Number(doc.value) === Number(e));
                                            const findVisaDocId = catlist.find((doc)=>{
                                                if(doc.label=='Visa Details'){
                                                    return doc;
                                                }
                                            });

                                            if(findVisaDocId.value==e){
                                                this.setState({doc_name: findVisaDocId.label ,show_visa_field: true})
                                            }else{
                                                this.setState({doc_name: catlist[findDocIndex].label ,show_visa_field: false, visa_category: '', visa_category_type:''})
                                            } 

                                            this.setState({
                                                docsCategory: e,
                                                docsTitle: title,
                                                issue_date_mandatory: catlist[findDocIndex] && Number(catlist[findDocIndex].issue_date_mandatory) === 1 ? true : false,
                                                expiry_date_mandatory: catlist[findDocIndex] && Number(catlist[findDocIndex].expiry_date_mandatory) === 1 ? true : false,
                                                reference_number_mandatory: catlist[findDocIndex] && Number(catlist[findDocIndex].reference_number_mandatory) === 1 ? true : false,
                                            })
                                            handleChangeSelectDatepicker(this, e, "docsCategory")
                                        }}
                                        placeholder={'Select type of document'}
                                        options={catlist}
                                        inputRenderer={() => (
                                            <input
                                                type="text"
                                                className="define_input"
                                                name={"docsCategory"}
                                                required={"true"}
                                                value={this.state.docsCategory}
                                            />
                                        )}
                                    />
                                </span>
                            </div>
                        </div>                        

                        {this.state.show_visa_field && <React.Fragment> <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Visa Category</label>
                            <Select
                                className="custom_select default_validation"
                                name="visa_category"
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                value={this.state.visa_category}
                                onChange={e => {
                                    handleChangeSelectDatepicker(this, e, "visa_category");
                                    this.callVisaTypeByCategory(e)
                                }}
                                placeholder={'Select visa category'}
                                options={this.state.visa_category_option}
                                inputRenderer={() => (
                                    <input
                                        type="text"
                                        className="define_input"
                                        name={"visa_category"}
                                        required={"true"}
                                        value={this.state.visa_category}
                                    />
                                )}
                            />
                        </div>
                        <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Visa Type</label>
                            <Select
                                className="custom_select default_validation"
                                name="visa_category_type"
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                value={this.state.visa_category_type}
                                onChange={e => handleChangeSelectDatepicker(this, e, "visa_category_type")}
                                placeholder={'Select visa category'}
                                options={this.state.visa_type_category_option}
                                inputRenderer={() => (
                                    <input
                                        type="text"
                                        className="define_input"
                                        name={"visa_category_type"}
                                        required={"true"}
                                        value={this.state.visa_category_type}
                                    />
                                )}
                            />
                        </div></React.Fragment>}

                        <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Issue date</label>
                            {
                                this.state.issue_date_mandatory === true &&
                                <span className="required"></span>
                            }
                            {this.renderDocIssueDatePicker()}
                        </div>

                        <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Expiry date</label>
                            {
                                this.state.expiry_date_mandatory === true &&
                                <span className="required"></span>
                            }
                            {this.renderDocExpiryDatePicker()}
                        </div>

                        <div className="csform-group">
                            <label>Reference number</label>
                            {
                                this.state.reference_number_mandatory === true &&
                                <span className="required"></span>
                            }
                            <input
                                type='text'
                                name='reference_number'
                                value={this.state.reference_number || ''}
                                maxLength={20}
                                onChange={e => this.setState({ reference_number: e.target.value })}
                            />
                        </div>
                        {license && <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>License Type</label>
                            <span className={this.state.reference_number ? "required" : ""}>
                            <Select
                                className="custom_select default_validation"
                                name="license_type"
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                value={!this.state.license_type || this.state.license_type == "0"? "" : this.state.license_type}
                                onChange={val => {
                                    let issuing_state = this.state.issuing_state;
                                    let vic_conversion_date = this.state.vic_conversion_date;
                                    if (val !== "3") {
                                        issuing_state = null;
                                        vic_conversion_date = "";
                                    }
                                    this.setState({ license_type: val, issuing_state, vic_conversion_date })
                                }}
                                inputRenderer={() => (
                                    <input
                                        type="text"
                                        className="define_input"
                                        name={"license_type"}
                                        required={this.state.reference_number? true : false}
                                        value={!this.state.license_type || this.state.license_type == "0"? "" : this.state.license_type}
                                    />
                                )}
                                options={[
                                    { label: "Select", value: "" },
                                    { label: "International", value: "1" },
                                    { label: "Probationary", value: "2" },
                                    { label: "Unrestricted", value: "3" }
                                ]}
                                value={this.state.license_type}
                            />
                            </span>
                        </div>
                        }
                        {license && <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Issuing State</label>
                            <span className={this.state.license_type == "3" ? "required" : ""}>
                            <Select
                                className="custom_select default_validation"
                                name="issuing_state"
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                value={!this.state.issuing_state || this.state.issuing_state == "0"? "" : this.state.issuing_state }
                                onChange={val => {
                                    let vic_conversion_date = this.state.vic_conversion_date;
                                    if (!val || val === "7" || val == "1") {
                                        vic_conversion_date = "";
                                    }
                                    this.setState({ issuing_state: val })
                                }}
                                inputRenderer={() => (
                                    <input
                                        type="text"
                                        className="define_input"
                                        name={"issuing_state"}
                                        required={this.state.license_type !== "1" ? true : false}
                                        value={!this.state.issuing_state || this.state.issuing_state == "0"? "" : this.state.issuing_state }
                                    />
                                )}
                                options={this.state.stateList}
                                disabled={this.state.license_type == "1"}
                            />
                            </span>
                        </div>}
                        {
                            license && <div className="csform-group">
                                <Calendar
                                    name="vic_conversion_date"
                                    label="Convert to Victorian license on/before"
                                    onChange={dateYmdHis => {
                                        this.setState({ vic_conversion_date: dateYmdHis })
                                    }}
                                    disabled={!this.state.issuing_state || this.state.issuing_state === "7" || this.state.license_type == "1"}
                                    required={this.state.issuing_state && this.state.issuing_state !== "0" && this.state.issuing_state !== "7"}
                                    value={this.state.vic_conversion_date}
                                />
                            </div>
                        }
                        <div className="csform-group">
                            <label>Doc Title:</label>
                            {this.renderDocsTitle()}
                        </div>

                        <div className="csform-group mt-3">
                            {this.state.filename != null && this.state.filename != '' ? <div className="fileAtch_box__">
                                {/* <label>File Name:</label> */}
                                <div className=" d-flex align-items-center">
                                    <div className="w-100 text-center py-2">
                                        <i className="icon icon-document3-ie fle_ic"></i>
                                        <div className="fle_nme__">{this.state.filename}</div>
                                    </div>
                                    <i className="icon icon-close2-ie fle_close__" onClick={() => this.setState({ fileValue: '', selectedFile: null, filename: null })}></i>
                                </div>
                            </div> : <React.Fragment />}
                        </div>

                        <span className="required">
                            <label className="cmn-btn1 btn btn-block atchd_btn1__">
                                Upload File
                      <input className="p-hidden" multiple="false" type="file" name="special_agreement_file" value={this.state.fileValue} onChange={this.fileChangedHandler} data-rule-required="true" date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf" />
                            </label>
                        </span>
                    </div>

                    <div className="col-sm-12 no-pad text-right bt-1 pt-3">

                        <button
                            type="submit"
                            className="btn cmn-btn1 create_quesBtn"
                            onClick={(e) => this.uploadHandler(e)}
                            disabled={this.state.loading}
                        >
                            Apply Changes
                    </button>

                        {!this.props.isModelPage ? <button
                            type="button"
                            className="btn cmn-btn1 create_quesBtn ml-2"
                            onClick={() => this.props.closeModel(false)}
                        >
                            Cancel
          </button> : <React.Fragment />}

                    </div>
                </form>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    applicantDetailsDocPage: { ...state.RecruitmentApplicantReducer.details },
    attachment_category_list: state.RecruitmentApplicantReducer.attachment_category_list,

})

const mapDispatchtoProps = (dispatch) => {
    return {
        getApplicantAttachmentCategoryDetails: (params) => dispatch(getApplicantAttachmentCategoryDetails(params)),
        getApplicantAttachmentDetails: (applicant_id) => dispatch(getApplicantAttachmentDetails(applicant_id))
    }
};

ApplicantAddAttachmentFrom.defaultProps = {
    closeModel: (e) => {
        //console.log('default function call');
    },
    isModelPage: false,
    overwrite_stage: false,
    is_main_stage: 0,
    current_stage_overwrite: 0,
    application: null,
};


export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantAddAttachmentFrom)

