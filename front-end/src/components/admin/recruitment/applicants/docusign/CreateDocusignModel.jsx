import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, css, postImageData, handleChange } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import {
    Modal,
    Button,
    Input,
    Icon,
    IconSettings,
    Textarea
} from '@salesforce/design-system-react';
import moment from "moment";
import '../../../scss/components/admin/member/member.scss';
import '../../../scss/components/admin/crm/pages/sales/ServiceAgreementDoc/ServiceAgreementDocsign.scss';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from "draft-js-export-html";
import { ToolBarConfig } from '../../ToolbarConfig.jsx';

/**
 * Class: CreateDocusignModel
 */
class CreateDocusignModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        let content = ` <p>Dear %FIRSTNAME% %LASTNAME%,</p><p><br></p><p>Well done on successfully completing the assessment component of the Candidate Assessment
                        and Briefing Day.</p><p><br></p><p>This is the final step of the Recruitment process.</p>
                        <p><br></p><p>Attached is your Contract of Casual Employment with ONCALL Group Australia. 
                        Please read carefully, complete each section and sign and return electronically, as prompted. 
                        If you have any questions, please contact your Recruitment Consultant.</p>
                        <p><br></p><p>(Please note the terms and conditions within this contract 
                        are identical to the draft copy sent to you to review ahead of CAB day.)</p>
                        <p><br></p><p>Congratulations and welcome to the ONCALL Team!</p><p><br></p>
                        <p>Recruitment Team</p><p>ONCALL Group Australia</p>`;
        let superAnnuationEmailContent = `<p>Dear %FIRSTNAME% %LASTNAME%,</p><p><br></p><p>
                                          Well done on reaching the final stages of the Recruitment process at ONCALL Group Australia.</p><p><br></p><p></p>
                                          <p><br></p><p>Attached are documents that we require in order to start setting you up in our onboarding 
                                          and payroll systems. Please read carefully, complete each section and sign and return electronically, as prompted. 
                                          If you have any questions, please contact your Recruitment Consultant.</p>
                                          <p><br></p>
                                          <p><br></p>
                                          <p>Recruitment Team</p><p>ONCALL Group Australia</p>`;


        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            applicant_id: this.props.applicant_id,
            application_id: this.props.application_id,
            related_to: this.props.application_id,
            subject: '',
            email_content: null,
            editorState: null,
            cc_email: [],
            cc_email_input: '',
            cc_email_flag: false,
            completed_email_content: 'All parties have completed the Employment Contract.',
            cc_popover: false,
            application_options: [],
            employeeContractEmailContent:content,
            superAnnuationEmailContent:superAnnuationEmailContent
        }
    }

    componentDidMount() {
        this.setState({ loading: true });
        if(this.props.applicant_id) {
            this.get_applicant_job_application(this.props.applicant_id);
            this.get_document_type(this.props.applicant_id);
        }else if(this.props.applicants) {
            this.get_document_type(this.props.applicant_id);
        }

        this.setEmailContent(this.state.employeeContractEmailContent);
        this.setState({ loading: false });
    }

    /**
     * Save template content on change
     * @param {obj} editorState 
     */
    onEditorChange = (editorState) => {
        // const rawContentState = convertToRaw(editorState.getCurrentContent());
        const rawContentState =  convertToRaw(this.state.editorState.getCurrentContent())
        const markup = stateToHTML(editorState.getCurrentContent())
        this.setState({ editorState, email_content: markup });
    };

    /**
     * fetching the job applications of an applicant
     */
    get_applicant_job_application = (applicant_id) => {
        postData('recruitment/RecruitmentApplicantDocusign/get_applicant_job_application_by_id', { applicant_id }).then((result) => {
            if (result.status) {
                this.setState({application_options: result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the document type
     */
    get_document_type = (applicant_id) => {
        postData('recruitment/RecruitmentApplicantDocusign/get_employment_contract_document_type', { applicant_id }).then((result) => {
            if (result.status) {
                this.setState({document_type_options: result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    
    /**
     * Handle onchange cc email input
     * @param {obj} event 
     */
    handleCcChange = (event) => {
        var email = event.target.value.trim(); 
        if (email === ',') {
            email = '';
        }
        this.setState({ cc_email_input: email });
    }
    
    /**
     * Add cc recipient
     * @param {obj} event 
     */
    addCcRecipient(event) {
        var code = event.keyCode || event.which;
        if(code === 13 || code === 32 || code === 44) { //13 is the enter keycode & 33 is spacebar & 188 is comma
            // Validate Email
            var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
            var cc_email_input = this.state.cc_email_input;
            var cc_email_input_raw = cc_email_input.replace(/[, ]+/g,'').trim();
            if (!pattern.test(cc_email_input_raw)) {
                toastMessageShow('Please enter valid cc email address ', 'e');
                return false;
            } else {
                var cc_email = this.state.cc_email;
                let findEmail = cc_email.findIndex((email) => email === cc_email_input_raw);
                if (findEmail > -1) {
                    toastMessageShow('Cc email address already added', 'e');
                    return false;
                } else {
                    cc_email.push(cc_email_input_raw);
                    this.setState({
                        cc_email: cc_email,
                        cc_email_input: '',
                        cc_email_flag: true,
                    });
                    return true;
                }             
            }
        } 
    }

    /**
     * Remove cc recipient from list
     * @param {int} remove_index 
     */
    removeCcRecipient = (remove_index) => {
        var cc_email = this.state.cc_email;
        cc_email.splice(remove_index, 1);
        var cc_email_flag = cc_email.length < 1 ? false : true;
        this.setState({
            cc_email_flag: cc_email_flag,
            cc_email: cc_email
        });
    }

    /**
     * Render cc recipient List
     */
    renderCcRecipient = () => {
        let styles = css({
            sldsGrpListBox: {
                height: '100% !important',
                overflow: 'visible !important'
            }
        });
        var cc_email = this.state.cc_email;
        if (Number(cc_email.length) < 1) {
            return <React.Fragment />;
        }
        // return <React.Fragment />;
        var cc_html = [];
        cc_email.map((cc, cc_index) => {
            cc_html.push (                
                <li role="presentation" class="slds-listbox__item">
                    <span tabindex="0" aria-selected="true" role="option" class="slds-pill">
                    <span class="slds-pill__label" title="tester testerson">{cc}</span>
                    <span class="slds-icon_container slds-pill__remove" title="Remove" role="button">
                        <buton onClick={() => this.removeCcRecipient(cc_index) }>
                            <Icon
                                assistiveText={{ label: 'Remove' }}
                                category="utility"
                                name="close"
                                size="x-small"
                            />
                            </buton>
                        <span class="slds-assistive-text">remove</span>
                    </span>
                    </span>
                </li>
            );
        });
        return (
            <div class="slds-combobox_container slds-has-inline-listbox slds-has-inline-listbox-bor">
                <div id="combobox-to-contact-selected-listbox" role="listbox" aria-orientation="horizontal">
                    <ul class="slds-listbox slds-listbox_horizontal slds-p-top_xxx-small" role="group" aria-label="Selected Options:">
                        {cc_html}
                    </ul>
                </div>
            </div>
        );
    }

    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        if(key=='document_type')
        {
           let document_type_label= this.state.document_type_options.find((data)=>data.value==value);
           if(document_type_label.label == 'Payroll Documents')
           {
            this.setState({subject: "Payroll Documents"});
            this.setEmailContent(this.state.superAnnuationEmailContent);
           }
           else{
                if (document_type_label.label == "DSW - CASUAL (VIC)" || document_type_label.label == "DSW - CASUAL (QLD)" || document_type_label.label == "DSW - CASUAL (NSW)") {
                   this.setState({subject: "Employment Contract"});
                }
               this.setEmailContent(this.state.employeeContractEmailContent);
           }
        }
        this.setState({ [key]: value });
    }

    
    
    setEmailContent(content){
       let contentState = stateFromHTML(content);
       // Editor content
      let editorState = EditorState.createWithContent(contentState);
       // Update content state for footer
      const rawContentState =  convertToRaw(editorState.getCurrentContent())
      const markup = stateToHTML(editorState.getCurrentContent())
      this.setState({ editorState, email_content: markup });
    }
    /**
     * Calling the API to create/update the member unavailability
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_applicant_docusign").validate({ /* */ });
        var validCheck = this.validateSteps();

        // Allow only if validation is passed
        if (validCheck && !this.state.loading && jQuery("#create_applicant_docusign").valid()) {
            this.setState({ loading: true });
            let doc_type_name = '';
            this.state.document_type_options.map((val) => {
                if (val.value == this.state.document_type) {
                    doc_type_name = val.label;
                }
            });

            var req = { contractId: '', task_applicant_id: '', applicant_id: this.state.applicant_id, application_id: this.state.related_to };

            let stateValue = {};
            stateValue['contractId'] = '';
            stateValue['task_applicant_id'] = '';
            stateValue['applicant_id'] =  this.state.applicant_id;
            stateValue['application_id'] =  this.state.related_to;
            stateValue['subject'] = this.state.subject;
            stateValue['email_content'] = this.state.email_content;
            stateValue['cc_email_flag'] = this.state.cc_email_flag ? 1 : 0;
            stateValue['cc_email'] = this.state.cc_email_flag ? this.state.cc_email : '';
            stateValue['completed_email_content'] = this.state.completed_email_content;
            stateValue['doc_type_name'] = doc_type_name;
            stateValue['document_type'] = this.state.document_type;
            stateValue['applicants'] = this.props.applicants;
            let url = 'recruitment/RecruitmentApplicantDocusign/generate_employment_contract_docusign';
            if(this.props.applicants && this.props.applicants.length > 0){
                url = 'recruitment/RecruitmentApplicantDocusign/generate_bulk_docusign_contract';
            }
            postData(url, stateValue).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                } else {
                    toastMessageShow(result.error, 'e');
                }
                this.setState({ loading: false });
            });
        }
    }

    /**
     * Validate the steps
     */
    validateSteps = () => {

        if (this.state.document_type == "") {
            toastMessageShow('Select Document Type is Mandatory', 'e');
            return false;
        }

        if (!this.state.related_to && !this.props.from_group_booking_page) {
            toastMessageShow('Select Related Field is Mandatory', 'e');
            return false;
        }
        
        if (this.state.subject == "") {
            toastMessageShow('Subject is Mandatory', 'e');
            return false;
        }

        if (this.state.email_content == "") {
            toastMessageShow('Email message is Mandatory', 'e');
            return false;
        }

        if (this.state.cc_email_flag && this.state.cc_email == "") {
            toastMessageShow('CC User is Mandatory', 'e');
            return false;
        }
        
        if (this.state.cc_email_input != "") {
            //Do stuff in here
            var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
            var cc_email_input = this.state.cc_email_input;
            var cc_email_input_raw = cc_email_input.replace(/[, ]+/g,'').trim();
            if (!pattern.test(cc_email_input_raw)) {
                toastMessageShow('Please enter valid cc email address ', 'e');
                return false;
            } else {
                var cc_email = this.state.cc_email;
                let findEmail = cc_email.findIndex((email) => email === cc_email_input_raw);
                if (findEmail > -1) {
                    toastMessageShow('Cc email address already added', 'e');
                    return false;
                } else {
                    cc_email.push(cc_email_input_raw);
                    this.setState({
                        cc_email: cc_email,
                        cc_email_input: '',
                        cc_email_flag: true,
                    });
                    return true;
                }
            }
        }

        return true;
    }
    
    /**
     * Render the display content
     */
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
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.headingTxt}
                        size="x-small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_applicant_docusign" autoComplete="off" className="slds_form">
                                    {!this.props.from_group_booking_page && <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Applicant</label>
                                                <div className="slds-form-element__control">
                                                    <p style={{margin:"8px"}}>
                                                    <Link id={'memlink'} to={ROUTER_PATH + 'admin/recruitment/applicant/'+this.props.applicant_id}
                                                        className="vcenter default-underlined slds-truncate"
                                                        style={{ color: '#0070d2' }}>
                                                        {this.props.applicant_details ? this.props.applicant_details.fullname : ''}
                                                    </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {!this.props.from_group_booking_page && <div className="row py-2">
                                        <div className="col-sm-9">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                 Primary Address</label>
                                                <div className="slds-form-element__control">
                                                    <p style={{margin:"8px"}}>{this.props.applicant_address ? this.props.applicant_address : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {!this.props.from_group_booking_page && <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Related</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="custom_select default_validation"
                                                        options={this.state.application_options}
                                                        onChange={(e) => this.handleChange(e, 'related_to')}
                                                        value={this.state.related_to || ''}
                                                        clearable={false}
                                                        searchable={true}
                                                        placeholder="Please Select"
                                                        name="Type"
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Document Type</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="custom_select default_validation"
                                                        options={this.state.document_type_options}
                                                        onChange={(e) => this.handleChange(e, 'document_type')}
                                                        value={this.state.document_type || ''}
                                                        clearable={false}
                                                        searchable={true}
                                                        placeholder="Please Select"
                                                        name="document_type"
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-1">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element combox_box-cc-cus">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    CC Email
                                                </label>
                                                <div className="slds-combobox_container slds-has-inline-listbox">
                                                    {this.renderCcRecipient()}
                                                    <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ignore-react-onclickoutside" aria-expanded="false" aria-haspopup="listbox" role="combobox">
                                                        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                                            <input
                                                                className="slds-input slds-combobox__input"
                                                                required={false}
                                                                name='cc_email_input'
                                                                placeholder='Enter Email'
                                                                value={this.state.cc_email_input}
                                                                onKeyPress={this.addCcRecipient.bind(this)}
                                                                onChange={this.handleCcChange.bind(this)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-1">
                                        <div className="col-sm-12">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required">* </abbr>Subject</label>
                                                <div className="slds-form-element__control pt-2">
                                                    <input
                                                        className="slds-input"
                                                        required={true}
                                                        name='subject'
                                                        placeholder='Subject'
                                                        value={this.state.subject}
                                                        onChange={(e) => this.setState({ subject: e.target.value })}
                                                    />
                                                </div> 
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-1">
                                        <div className="col-sm-12">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required">* </abbr>Email Message</label>
                                                    <div className='editor_custom_box' style={{ border: '1px solid #efefef'}}>
                                                    <Editor
                                                        toolbar={ToolBarConfig}
                                                        editorState={this.state.editorState}
                                                        toolbarClassName="toolbarClassName docusignToolBar"
                                                        wrapperClassName="wrapperClassName"
                                                        editorClassName="editorClassName"
                                                        onEditorStateChange={this.onEditorChange}
                                                    />
                                                </div> 
                                            </div>
                                        </div>                            
                                    </div>
                                    <div className="row py-2"></div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default (CreateDocusignModel)
  