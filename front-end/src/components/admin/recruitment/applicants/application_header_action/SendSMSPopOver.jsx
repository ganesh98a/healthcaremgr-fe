import { Icon, Textarea } from '@salesforce/design-system-react';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Popover from '@salesforce/design-system-react/lib/components/popover';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import React, { Component } from 'react';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow } from 'service/common.js';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import { Row } from '../../../oncallui-react-framework';
import Label from '../../../oncallui-react-framework/input/Label';
import { postRequest, requestData } from '../../../oncallui-react-framework/services/common';
import SMSInsertMergeField from './SMSInsertMergeField';
import './application_header_action.scss';
import jQuery from 'jquery';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { fields_warning } from '../../../constants';

class SendSMSPopOver extends Component {
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            assessmentId: '0',
            selection: props.selection,
            isOpen: false,
            templates: [{label: "Free Text", value: ""}],
            sms_content: "",
            unsuccessful_selected: false,
            merge_field_sep_start: '{',
            merge_field_sep_end: '}',
            length_overlimit: false,
            isWarn: false,
            content_length: 0,
            bottom_text: "Character limit: 160",
            fields_warning
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState) {
        let selection = prevProps.selection || [];
        if (selection.length !== this.props.selection.length) {
            this.setState({ selection: this.props.selection });
        }
    }

    fetchData() {
        this.setState({ loading: true });
        let apiUrl = "sms/Sms_template/get_sms_templates";
        requestData(apiUrl).then((res) => {
            let templates = this.state.templates;
            if (res.rows) {
                res.rows.map(row => {
                    templates.push({ label: row.name, value: row.id })
                })
            }
            this.setState({ templates, pages: res.pages, loading: false });
        });
    }

    /**
     * handle open/close of the popup
     */
    handleOpenClose(e) {
        e.preventDefault();
        if (e.target.id !== "send-sms-button" && e.target.id !== "initiate-oa-button" && e.target.innerText !== "Close dialog") {
            return false;
        }
        if (!this.props.onClick(e)) {
            return false;
        }
        let unsuccessful_selected = false;
        this.state.selection.map(sel => {
            if (sel.application_process_status == 8) {
                unsuccessful_selected = true;
            }
        })
        this.setState({ isOpen: !this.state.isOpen, unsuccessful_selected });        
        return true;
     }
    handleClose(e) {
        e.preventDefault();
        this.setState({ isOpen: false });
    };

    /**
     * handle initiating the online assessment
     */
    handleSend = () => {
        if (this.state.sms_content.trim().length === 0) {
            toastMessageShow("SMS is required", 'e');
            return false;
        }
        let applicants = [];
        let application_id = this.props.jobId;
        let unsuccessful_selected = false;
        this.state.selection.map(sel => {
            if (sel.application_process_status == 8) {
                unsuccessful_selected = true;
                return false;
            } else {
                applicants.push({ applicant_id: sel.applicant_id, phone: sel.phone, application_id: sel.application_id })
            }
        })
        if (unsuccessful_selected) {
            this.setState({unsuccessful_selected: true});
            return false;
        }
        const url = 'sms/Sms/send_bulk_sms_queue';
        this.setState({ loading: true });
        let req = { applicants, msg: this.state.sms_content, application_id, sms_template_id: this.state.sms_template_id };
        // Call Api
        postData(url, req).then((result) => {
            if (result.status) {
                // Trigger success pop
                toastMessageShow(result.message, 's');
            } else {
                // Trigger error pop
                toastMessageShow(result.error, 'e');
            }
            this.setState({ loading: false, isOpen: false, sms_content: '', sms_template_id: '' });
        });
    };

    getSMSTemplateContent(id) {
        if (id) {
            this.setState({ loading: true });
            postRequest("sms/Sms_template/get_sms_templates", { id }).then((res) => {
                if (res.rows) {
                    let sms_content = res.rows[0].content;
                    let puretext = sms_content.replaceAll("{Applicant.firstname}", "").replaceAll("{Applicant.lastname}", "");
                    let bottom_text = `Character limit: ${160 - puretext.length >= 0 ? 160 - puretext.length : 0}`;
                    let isWarn = false;
                    let length_overlimit = false;
                    if (puretext.length > 160) {
                        isWarn = true;
                        bottom_text = "Character limit cannot exceed 160";
                        length_overlimit = true;
                    }
                    
                    this.setState({ loading: false, sms_content, sms_template_id: id, bottom_text, isWarn, length_overlimit })
                }
            });
        } else {
            this.setState({ sms_content: "", sms_template_id: "", isWarn: false, bottom_text: "Character limit: 160" })
        }
    }

    handleContentChange(e) {
        e.preventDefault();
        let content = e.target.value;
        let length = content.replaceAll("{Applicant.firstname}", "").replaceAll("{Applicant.lastname}", "").length;
        // function to check the detection
        let ev = e || window.event;  // Event object 'ev'
        var key = ev.which || ev.keyCode; // Detecting keyCode
        // Detecting Ctrl
        var ctrl = ev.ctrlKey ? ev.ctrlKey : ((key === 17)? true : false);
        // If key pressed is V and if ctrl is true.key == 86 && ctrl
        if (ev.type == "paste") {
            var clipboardData, pastedData;
            // Stop data actually being pasted into div
            // Get pasted data via clipboard API
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            this.setMergeFieldValues(pastedData, false);
        } else if (length <= 160) {
            let bottom_text = `Character limit: ${160 - length >= 0 ? 160 - length : 0}`;
            this.setState({ sms_content: e.target.value, bottom_text, isWarn: false, length_overlimit: false });
        } else {
            let isWarn = true;
            let bottom_text = "Character limit cannot exceed 160";
            let sms_content = e.target.value;
            this.setState({ length_overlimit: true, isWarn, bottom_text, sms_content });
        }
    }
    /**
     * Open Merge Insert Field
     * @param {eventObj} e 
     */
    triggerInsertMergeField(e) {
        e.preventDefault();
        this.setState({ merge_field_modal: true });
    }
    setMergeFieldValues = (value, sep = true) => {
        let cursorPosition = jQuery('#send-sms-box').prop("selectionStart");
        this.setState({ merge_field_modal: false });
        if (value != '' && value != undefined) {
            let text = this.state.sms_content;
            let newContent = value;
            if (sep) {
                newContent = this.state.merge_field_sep_start + value + this.state.merge_field_sep_end;
            }
            let p1 = text.slice(0, cursorPosition);
            let p2 = text.slice(cursorPosition);
            text = [p1, newContent, p2].join('');
            let puretext = text.replaceAll("{Applicant.firstname}", "").replaceAll("{Applicant.lastname}", "");
            let bottom_text = `Character limit: ${160 - puretext.length >= 0 ? 160 - puretext.length : 0}`;
            let length_overlimit = this.state.length_overlimit;
            let isWarn = this.state.isWarn;
            if (puretext.length > 160) {
                isWarn = true;
                bottom_text = "Character limit cannot exceed 160";
                length_overlimit = true;
            }            
            this.setState({ sms_content: text, bottom_text, isWarn, length_overlimit });
        }
    }
    closeModal(status) {
        this.setState({ merge_field_modal: status });
    }
    /**
     * rendering components
     */
    render() {
        let has_variables = this.state.sms_content.includes("{Applicant.firstname}") || this.state.sms_content.includes("{Applicant.lastname}");
        return (
            <IconSettings iconPath={'/assets/salesforce-lightning-design-system/assets/icons'}>
                <Popover
                    heading={this.state.unsuccessful_selected && "Error"}
                    variant={this.state.unsuccessful_selected && "error" || "base"}
                    align="bottom"
                    isOpen={this.state.isOpen}
                    hasNoCloseButton={this.state.unsuccessful_selected? false : true}
                    onRequestClose={e => this.handleOpenClose(e)}
                    body={
                        this.state.unsuccessful_selected && <div>Unselect 'Unsuccessful' applicants to successfully send SMS</div> ||
                        <div id="form-send-sms-box">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" id="initiate-oa-button-label">
                                    Choose SMS Template
									</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={this.state.templates}
                                        onChange={(value) => this.getSMSTemplateContent(value)}
                                        value={this.state.sms_template_id || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Please Select"
                                        required={true}
                                        name="Status"
                                        id="initiate-oa-template-dropdown"
                                        disabled={this.state.loading}
                                    />
                                </div>
                            </div>
                            <Label text={"SMS"} required />
                            <textarea
                                id="send-sms-box"
                                name="sms_text"
                                required
                                placeholder="Maximum 160 characters allowed"
                                onPaste={e => this.handleContentChange(e)}
                                onChange={e => this.handleContentChange(e)}
                                value={this.state.sms_content}
                                readOnly={this.state.loading}
                            >
                            </textarea>
                            <Label errorText={this.state.isWarn} text={this.state.bottom_text} />
                            {has_variables && <div className="slds-text-body_small">
                                <span className="slds-p-right_x-small">
                                <Icon
                                    assistiveText={{ lable: 'Warning' }}
                                    category="utility"
                                    colorVariant="warning"
                                    name="warning"
                                    size="x-small"
                                />
                                </span>
                                {this.state.fields_warning}
                                </div>}
                            <Row>
                                <div className="row px-2">
                                    <div className="px-0 ml-2 d-inline-block attach_bn">
                                        <button style={{ margin: "7px 6px 6px 6px" }} class="slds-button slds-button_icon" tabindex="5" onClick={e => this.triggerInsertMergeField(e)} id="insert-merge-fields-btn" title="Insert Merge Field">
                                            <Icon
                                                assistiveText={{ label: 'Insert Merge Field' }}
                                                category="utility"
                                                name={`merge_field`}
                                                size={'xx-small'}
                                            />
                                            <span class="slds-assistive-text">Insert Merge Field</span>
                                        </button>
                                    </div>
                                </div>
                            </Row>
                        </div>
                    }
                    footer={
                        !this.state.unsuccessful_selected && <div className="slds-text-align_right">
                            <Button style={{borderRadius: "0.25rem", color: "#005fb2", textDecoration: "none"}} label="Cancel" id="initiate-oa-button-cancel" onClick={e => this.handleClose(e)} />&nbsp;&nbsp;
                             <Button
                                style={{borderRadius: "0.25rem"}}
                                variant="brand"
                                label="Send"
                                id="initiate-oa-button-send"
                                onClick={() => this.handleSend()}
                                disabled={this.state.loading || !this.state.sms_content || this.state.length_overlimit}
                            />
                        </div>
                    }
                    id="popover-controlled-with-footer"
                    {...this.props}
                >
                    <Button
                        label="Send SMS"
                        id="send-sms-button"
                        disabled={this.props.disabled || this.state.loading}
                        onClick={e => this.handleOpenClose(e)}
                    />
                </Popover>
                {this.state.merge_field_modal && (
                    <SMSInsertMergeField
                        setMergeFieldValus={this.setMergeFieldValues.bind(this)}
                        showModal={this.state.merge_field_modal}
                        closeModal={(status) => this.closeModal(status)}
                        headingTxt="Insert Merge Field"
                    />
                )
                }
            </IconSettings>
        );
    }
}

export default SendSMSPopOver;
