import React from "react"
import jQuery from "jquery"
import moment from "moment"
import _ from 'lodash'
import { connect } from 'react-redux'
import Select from "react-select-plus"
import DatePicker from 'react-datepicker'

import { UPLOAD_MAX_SIZE_IN_MB, UPLOAD_MAX_SIZE_ERROR } from '../../../../config.js'
import { getStateList, handleChangeSelectDatepicker, postImageData, toastMessageShow } from "../../../../service/common.js"
import { getApplicantAttachmentCategoryDetails, getApplicantAttachmentDetails } from '../actions/RecruitmentApplicantAction.js'

import "react-select-plus/dist/react-select-plus.css"
import { ApplicantAttachmentJobTitle } from "./ApplicantAddAttachmentFrom.js"
import Checkbox from "../../oncallui-react-framework/input/Checkbox";
import Calendar from "../../oncallui-react-framework/input/Calendar";
import { getVisaCategory, getVisaTypeByCategory } from '../../oncallui-react-framework/services/common';
import { VISA_DETAILS } from '../../oncallui-react-framework/constants';
import { SLDSISODatePicker } from '../../salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
/**
 * @typedef {ReturnType<typeof mapStateToProps> | ReturnType<typeof mapDispatchtoProps> | {}} Props
 * 
 * @todo Refactor this component to combine with `ApplicantAddAttachmentFrom.js`
 * 
 * @extends {React.Component<Props, any>}
 */
class ApplicantEditAttachmentForm extends React.Component {
    constructor(props) {
        super(props);

        const { attachment } = props
        const docStatus = !attachment.document_status ? 0 : parseInt(attachment.document_status)

        this.uploadDocsInitialState = {
            selectedFile: null,
            docsTitle: attachment.attachment_title,
            docsCategory: attachment.doc_category,
            docStatus: docStatus,
            docExpiryDate: attachment.expiry_date ? attachment.expiry_date : null,
            docIssueDate: attachment.issue_date ? attachment.issue_date : null,
            reference_number: attachment.reference_number || '',
            filename: attachment.attachment,
            fileValue: '',
            loading: false,
            issue_date_mandatory: false,
            expiry_date_mandatory: false,
            reference_number_mandatory: false,
            validStatus: 1,
            statusUpdated: false,
            license_type: attachment.license_type,
            issuing_state: attachment.issuing_state,
            vic_conversion_date: attachment.vic_conversion_date,
            applicant_specific:attachment.applicant_specific,
            category_title: attachment.category_title,
            visa_category: attachment.visa_category,
            visa_category_type: attachment.visa_category_type,
            attachment_category_list:[],
            show_visa_field: ''
        }
        this.state = this.uploadDocsInitialState;

        this.datepickers = {
            docIssueDate: React.createRef(),
            docExpiryDate: React.createRef(),
        }

    }
    componentDidMount() {

        getStateList().then(data => {
            this.setState({ stateList: data });
        })
         if (this.props.attachment_category_list.length <= 0) {
            const { jobId } = this.props.applicantDetailsDocPage
            this.props.getApplicantAttachmentCategoryDetails({ jobId });
           }
        getVisaCategory().then((result) => {
            this.setState({ visa_category_option: result , visa_category_type: this.props.attachment.visa_category_type}, () => { });
        });

        if(this.props.attachment.visa_category){
            this.callVisaTypeByCategory(this.props.attachment.visa_category) 
        }
    }

    // fetch visa type list by visa category id
    callVisaTypeByCategory = (visa_category) => {
        getVisaTypeByCategory(visa_category).then((result) => {
            this.setState({ visa_type_category_option: result ,  }, () => { });
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
    };

    /**
     * Valid form fields 
     */
    validCheck = (doc_name) => {
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
        
        if ((expiry_date === "" || expiry_date === null ) && expiry_date_mandatory === true) {
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

        if(doc_name==VISA_DETAILS && this.state.visa_category == '' && this.state.visa_category_type== ''){
            toastMessageShow('Please add visa category and type', 'e');
            return false;
        }
  
        return true;
    }

    uploadHandler = e => {
        e.preventDefault();

        const { id } = this.props.attachment
        let findDocIndex = this.props.attachment_category_list.findIndex((doc) => Number(doc.value) === Number(this.state.docsCategory));
        let doc_name = this.props.attachment_category_list[findDocIndex].label;
        jQuery("#applicant_attachment_form").validate({ ignore: [] });
        var validCheck = this.validCheck(doc_name);
        if (validCheck && jQuery("#applicant_attachment_form").valid()) {
            this.setState({ loading: true });
            const [filename, extension] = this.determineDerivedDocFileName()
            const formData = new FormData();
            let currentStageData = this.props.overwrite_stage && this.props.current_stage_overwrite > 0 ? this.props.current_stage_overwrite : this.props.applicantDetailsDocPage.current_stage;
            // formData.append("docsFile", this.state.selectedFile, this.state.filename);
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
            formData.append('applicant_specific', this.state.applicant_specific);
            formData.append('visa_category', this.state.visa_category);
            formData.append('visa_category_type', this.state.visa_category_type);
            formData.append('doc_name', doc_name);
            const { docExpiryDate, docIssueDate } = this.state
            const docExpiryDateYmdHis = docExpiryDate ? moment(docExpiryDate).format('YYYY-MM-DD HH:mm:ss') : '';
            formData.append('docExpiryDate', docExpiryDateYmdHis)
            
            const docIssueDateDateYmdHis = docIssueDate ? moment(docIssueDate).format('YYYY-MM-DD HH:mm:ss') : '';
            formData.append('docIssueDate', docIssueDateDateYmdHis)

            const application_id = _.get(this.props.application, 'id', null)
            if (!!parseInt(application_id)) {
                formData.append('application_id', application_id)
            }

            postImageData("recruitment/RecruitmentApplicant/update_attachment_docs/" + id, formData).then(responseData => {
                var x = responseData;
                if (responseData.status) {
                    this.props.closeModal(true);
                    this.setState(this.uploadDocsInitialState);
                    this.props.getApplicantAttachmentDetails(this.props.applicantDetailsDocPage.id);
                    let msg = responseData.msg || (
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

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState, () => {
            if ((key == 'to_date' && this.state.from_date != '') || (this.state.from_date != '' && this.state.to_date != '')) {
                if ((Date.parse(this.state.from_date) > Date.parse(this.state.to_date))) {
                    toastMessageShow("To date should be greater than From date", "e");
                }
            }
        });

    }

    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }


    renderDocExpiryDatePicker() { 
        return (            
            <SLDSISODatePicker
            ref={this.datepickers.docExpiryDate} // !important: this is needed by this custom SLDSISODatePicker
            className="docExpiryDate"
            placeholder="DD/MM/YYYY"
            onChange={this.handleChangeDatePicker('docExpiryDate')}
            onOpen={this.handleDatePickerOpened('docExpiryDate')}
            onClear={this.handleChangeDatePicker('docExpiryDate')}
            value={this.state.docExpiryDate}
            input={<Input name="docExpiryDate" />}
            required={true}
            inputProps={{
                name: "docExpiryDate",
                readOnly: true
            }}
            disabled={this.state.validStatus === Number(this.state.docStatus) && this.state.statusUpdated === false ? true : false}
        />
        )
    }


    renderDocIssueDatePicker() {
        return (
            <SLDSISODatePicker
                ref={this.datepickers.docIssueDate} // !important: this is needed by this custom SLDSISODatePicker
                className="docIssueDate"
                placeholder="DD/MM/YYYY"
                onChange={this.handleChangeDatePicker('docIssueDate')}
                onOpen={this.handleDatePickerOpened('docIssueDate')}
                onClear={this.handleChangeDatePicker('docIssueDate')}
                value={this.state.docIssueDate}
                input={<Input name="docIssueDate" />}
                required={true}
                inputProps={{
                    name: "docIssueDate",
                    readOnly: true
                }}
                disabled={this.state.validStatus === Number(this.state.docStatus) && this.state.statusUpdated === false ? true : false}
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

    getVisaField = () => {
        let show_visa_field = false;
        if (this.props.attachment_category_list && this.props.attachment_category_list.length > 0) {
            const findVisaDocId = this.props.attachment_category_list.find((doc) => {
                if (doc.label == 'Visa Details') {
                    return doc;
                }
            });
            if (findVisaDocId.value == this.state.docsCategory) {
                show_visa_field = true;
            }

        }
        return show_visa_field;
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
            });
        })
        return (
            <React.Fragment>
                <form
                    id="applicant_attachment_form"
                    method="post"
                    autoComplete="off"
                >

                    <div className={this.props.isModalPage ? "col-md-12 pr-5" : "col-md-6 pr-5"}>
                        <label className={"bg_labs2 mr_b_20 " + (this.props.isModalPage ? "mt-3" : "")}>
                            <strong>Update document information</strong>{" "}
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
                                        disabled={this.state.validStatus === Number(this.state.docStatus) && this.state.statusUpdated === false ? true : false}
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
                                                issue_date_mandatory: catlist[findDocIndex] && Number(catlist[findDocIndex].issue_date_mandatory) === 1 ?  true : false,
                                                expiry_date_mandatory: catlist[findDocIndex] && Number(catlist[findDocIndex].expiry_date_mandatory) === 1 ?  true : false,
                                                reference_number_mandatory: catlist[findDocIndex] && Number(catlist[findDocIndex].reference_number_mandatory) === 1 ?  true : false,
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

                        <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Status</label>
                            <Select
                                className="custom_select default_validation"
                                name="docStatus"
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                value={this.state.docStatus}
                                onChange={e => {
                                    this.setState({ statusUpdated: true }, () => {
                                        handleChangeSelectDatepicker(this, e, "docStatus")
                                    })
                                }}
                                placeholder={'Select status'}
                                options={[
                                    { value: 0, label: 'Submitted' },
                                    { value: 1, label: 'Valid' },
                                    { value: 2, label: 'Invalid' },
                                    { value: 3, label: 'Expired' },
                                ]}
                                inputRenderer={() => (
                                    <input
                                        type="text"
                                        className="define_input"
                                        name={"docStatus"}
                                        required={"true"}
                                        value={this.state.docStatus}
                                    />
                                )}
                            />
                        </div>

                        {this.getVisaField() && <React.Fragment><div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Visa Category</label>
                            <span className="required">
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
                            </span>
                        </div>
                        <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Visa Type</label>
                            <span className="required">
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
                            </span>
                        </div></React.Fragment>}
                        <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                            <div className="csform-group set_date_border" style={{ maxWidth: 320 }}>
                                <label>Issue date</label>
                                {
                                    this.state.issue_date_mandatory === true &&
                                    <span className="required"></span>
                                }
                                {this.renderDocIssueDatePicker()}
                            </div>

                            <div className="csform-group set_date_border" style={{ maxWidth: 320 }}>
                                <label>Expiry date</label>
                                {
                                    this.state.expiry_date_mandatory === true &&
                                    <span className="required"></span>
                                }
                                {this.renderDocExpiryDatePicker()}
                            </div>
                        </IconSettings>
                        <div className="csform-group">
                            <label>Reference number</label>
                            {
                                this.state.reference_number_mandatory === true &&
                                <span className="required"></span>
                            }
                            <input 
                                className={this.state.validStatus === Number(this.state.docStatus) && this.state.statusUpdated === false ? "bg-grey" : ""}
                                type='text' 
                                name='reference_number' 
                                value={this.state.reference_number} 
                                maxLength={20} 
                                onChange={e => this.setState({ reference_number: e.target.value })}
                                readOnly={this.state.validStatus === Number(this.state.docStatus) && this.state.statusUpdated === false ? true : false}
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
                                value={this.state.license_type}
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
                                value={!this.state.license_type || this.state.license_type == "0"? "" : this.state.license_type}
                            />
                            </span>
                        </div>
                        }
                        { license && <div className="csform-group" style={{ maxWidth: 320 }}>
                            <label>Issuing State</label>
                            <span className={this.state.license_type !== "1" ? "required" : ""}>
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
                                    this.setState({ issuing_state: val, vic_conversion_date })
                                }}
                                inputRenderer={() => (
                                    <input
                                        type="text"
                                        className="define_input"
                                        name={"issuing_state"}
                                        required={this.state.license_type !== "1"? true : false}
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
                                    disabled={!this.state.issuing_state || this.state.issuing_state === "7" || this.state.license_type !== "1"}
                                    required={this.state.issuing_state && this.state.issuing_state !== "0" && this.state.issuing_state !== "7"}
                                    value={this.state.vic_conversion_date}
                                />
                            </div>
                        }
                        <div className="csform-group">
                            <label>Applicant specific</label>
                            <Checkbox 
                                id="applicant_specific"
                                name="applicant_specific"
                                onClick={e => {
                                                this.setState({applicant_specific: e.target.checked? 1 : 0})
                                            }
                                        }
                                label="Applicant specific" 
                                value={this.state.applicant_specific}
                                disabled 
                                readOnly
                            />                            
                        </div>
                        <div className="csform-group">
                            <label>Doc Title:</label>
                            {this.renderDocsTitle()}
                        </div>

                        <span className="required" disabled title={`Replacing existing file not yet supported. Instead upload a new attachment as workaround`} style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                            <label className="cmn-btn1 btn btn-block atchd_btn1__">
                                { this.state.filename ? this.state.filename : `Upload file` }
                                <input className="p-hidden" multiple="false" type="file" name="special_agreement_file" value={this.state.fileValue} onChange={this.fileChangedHandler} date-rule-extension="jpg|jpeg|png|xlx|xls|doc|docx|pdf" disabled/>
                            </label>
                        </span>
                    </div>

                    <div className="col-sm-12 no-pad text-right bt-1 pt-3">
                        <button type="submit" className="btn cmn-btn1 create_quesBtn" onClick={(e) => this.uploadHandler(e)} disabled={this.state.loading}>
                            Apply Changes
                        </button>

                        <button type="button" className="btn cmn-btn1 create_quesBtn ml-2" onClick={() => this.props.closeModal(false)}>
                            Cancel
                        </button>
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

ApplicantEditAttachmentForm.defaultProps = {
    closeModal: (e) => {},
    isModalPage: false,
    overwrite_stage: false,
    is_main_stage: 0,
    current_stage_overwrite: 0,
    application: null,
};


export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantEditAttachmentForm)

