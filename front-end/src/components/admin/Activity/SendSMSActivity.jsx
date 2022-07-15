import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { 
    postData,
    selectFilterOptions,
    css,
    comboboxFilterAndLimit,
    toastMessageShow,
    Info
} from 'service/common.js';
import { 
    Combobox,
    Icon,
    IconSettings
} from '@salesforce/design-system-react';
import createClass from 'create-react-class';

import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import SMSInsertMergeField from '../Activity/SMSInsertMergeField';
import Label from '../oncallui-react-framework/input/Label';
import jQuery from 'jquery';
import '../scss/components/admin/crm/pages/sales/EmailActivity.scss';
import {fields_warning} from '../constants'

import ReactHtmlParser from 'react-html-parser';

const styles = css({
    to_req: {
        color: '#0070d2',
        float: 'left',
        paddingRight: '5px',
        zIndex: 9001,
        border: 'none',
        paddingTop: '4px'
    }
});



/**
 * Class: SendSMSActivity
 */
class SendSMSActivity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selection: [],
            sms_to: [],
            sms_to_option: [],
            sms_to_id: '',
            iconset: [],
            sms_template_option: [
                { value: 'free_text', label: 'Free Text' }
            ],
            sms_template: 'free_text',
            sms_content: '',
            sms_merge_field_modal: false,
            entity_type: this.props.entity_type,
            entity_id: this.props.entity_id,
            isLoadingMenuItems: false,
            length_overlimit: false,
            phone: '',
            fields_warning
        };

    }

    setIconForList(option) {
        return option.map((elem) => ({
            ...elem,
            ...{
                icon: (
                    <Icon
                        assistiveText={{ label: 'Applicant' }}
                        category="standard"
                        name={'user'}
                    />
                ),
            },
        }));
    }

    componentWillMount(){
        this.get_sms_template();
    }
  
    componentDidMount() {

        if (this.state.entity_type === 'interview') {
            this.get_sms_recipients();
        }
        if (this.state.entity_type === 'application') {
            this.get_sms_recipient_data();
        }
        if (this.state.entity_type === 'contact') {
            this.get_contact_data_for_sms();
        }
        this.checkValidField();
    }
    
    componentWillUpdate(props) {
        if (props.sms_recipient_refresh) {
            if (this.state.entity_type === 'interview') {
                this.get_sms_recipients();
            }
            if (this.state.entity_type === 'application') {
                this.get_sms_recipient_data();
            }
            this.checkValidField();
            this.props.set_recipient_refresh(false);
        }
    }

    /**
     * Get SMS Templatelist
     */
    get_sms_template = () => {
        postData("sms/Sms_template/get_active_sms_templates", { }).then((res) => {
            if (res.status && res.data) {
                this.setState({ sms_template_option: [...this.state.sms_template_option, ...res.data] });
            }
        });
    }

    /**
     * Get sms recipient list
     */
    get_sms_recipients = () => {
        postData("recruitment/GroupBooking/get_applicant_list_for_sms", { interview_id: this.state.entity_id }).then((res) => {
            if (res.status && res.data) {
                // set contact id
                var option = res.data;
                // set Icon for list
                let accountsWithIcon = this.setIconForList(option);
                this.setState({ sms_to: accountsWithIcon, sms_to_option: accountsWithIcon });
            }
        });
    }

    /**
     * Get SMS recipient data
     */
     get_sms_recipient_data = () => {
        postData("recruitment/GroupBooking/get_applicant_data_for_sms", { application_id: this.state.entity_id }).then((res) => {
            if (res.status && res.data) {
                // set contact id
                var option = res.data;
                // set Icon for list
                let accountsWithIcon = this.setIconForList(option);
                let phone = '';
                if (res.data[0] && res.data[0].phone) {
                    phone = res.data[0].phone;
                }
                this.setState({ sms_to: accountsWithIcon, sms_to_option: accountsWithIcon, phone: phone });
            }
        });
    }

    get_contact_data_for_sms = () => {
        postData("sales/Contact/get_contact_data_for_sms", { person_id: this.state.entity_id }).then((res) => {
            if (res.status && res.data) {
                // set contact id
                var option = res.data;
                // set Icon for list
                let accountsWithIcon = this.setIconForList(option);
                let phone = '';
                if (res.data[0] && res.data[0].phone) {
                    phone = res.data[0].phone;
                }
                this.setState({ sms_to: accountsWithIcon, sms_to_option: accountsWithIcon, phone: phone });
            }
        });
    }

    /**
     * Handle content change
     * @param {*} e 
     */
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
            this.setState({ sms_content: e.target.value }, () => {this.checkValidField()});
        } else {
            this.setState({ length_overlimit: true, sms_content: e.target.value }, () => {this.checkValidField()});
        }
    }

    /**
     * Set SMS template content
     * @param {int} value 
     */
    setSMSTemplate = (value) => {
        let sms_template = this.state.sms_template_option;
        let template_index = sms_template.filter(template => Number(template.value) === Number(value));
        let template_content = this.state.sms_content;
        if (template_index && template_index[0]) {
            template_content = template_index[0].content;
        }
        if (value === 'free_text') {
            template_content = '';
        }
        this.setState({ sms_template: value, sms_content: template_content }, ()=> {this.checkValidField()});
    }
    
    /**
     * Open SMS Merge Insert Field
     * @param {eventObj} e 
     */
    triggerSMSInsertMergeField = (e) => {
        e.preventDefault();
        this.setState({ sms_merge_field_modal: true });
    }

    /**
     * Close the modal when user save
     */
    closeModal = () => {
        this.setState({ sms_merge_field_modal: false });
    }

    /**
     * Set merge fields values
     * @param {str} value 
     */
     setMergeFieldValues = (value, sep = true) => {
        let cursorPosition = jQuery('#sms_content').prop("selectionStart");
        this.setState({ sms_merge_field_modal: false });

        if (value != '' && value != undefined) {
            let text = this.state.sms_content;
            let newContent = value;
            if (sep) {
                newContent = value;
            }
            let p1 = text.slice(0, cursorPosition);
            let p2 = text.slice(cursorPosition);
            text = [p1, newContent, p2].join('');
            this.setState({ sms_content: text }, () => {this.checkValidField()});
        }
    }

    /**
     * handle initiating the online assessment
     */
     handleSend = () => {
        let applicants = this.state.sms_to;     
        let template = this.state.sms_template;  
        const url = 'sms/Sms/send_activity_sms_queue';
        this.setState({ loading: true });

        if (template === 'free_text') {
            template = '';
        }

        let req = { 
            applicants,
            msg: this.state.sms_content,
            template: template,
            entity_type: this.state.entity_type,
            entity_id: this.state.entity_id
        };
        // Call Api
        postData(url, req).then((result) => {
            if (result.status) {
                // Trigger success pop
                toastMessageShow(result.message, 's');

                // Resetting state values
                this.setState({
                    sms_to: this.state.sms_to_option,
                    email_to_id: '',
                    sms_content: '',
                    sms_template: 'free_text',
                },() => {
                    this.checkValidField();
                    // reload the activity log
                    this.props.get_sales_activity_data({ salesId: this.state.entity_id, sales_type: this.state.entity_type, related_type: this.props.related_type });
                    // load feed
                    this.props.set_feed_refresh(true);
                });
            } else {
                if (result.over_check) {
                    var confirm_msg = ReactHtmlParser (result.error) ;
                    Info(confirm_msg, { heading_title: "Error" }).then(conf_result => { });
                } else {
                    // Trigger error pop
                    toastMessageShow(result.error, 'e');
                }                
            }
            this.setState({ loading: false});
        });
    };

    /**
     * Check the field
     */
    checkValidField = () => {
        let disabled_send = false;
        let sms_to = this.state.sms_to;
        let sms_content = this.state.sms_content;
        let length = sms_content.replaceAll("{Applicant.firstname}", "").replaceAll("{Applicant.lastname}", "").length;
        if (sms_to.length < 1) {
            disabled_send = true;
        }
        if (length > 160 || length < 1) {
            disabled_send = true;
        }

        this.setState({ disabled_send: disabled_send });
    }   
    
    /**
     * Render To applicants
     * @param {str} label
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
     renderComboBox = (label, stateName, valueName, stateOption) => {
        return (
            <Combobox
                id="combobox-to-contact"
                classNameContainer="combox_box-to-cus"
                events={{
                    onChange: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({ [valueName]: value, isLoadingMenuItems: true });
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        }, ()=> {this.checkValidField()});
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
                                            assistiveText="Account"
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
                        }, ()=> {this.checkValidField()});
                    },
                }}
                labels={{
                    label: '  ' + label,
                    placeholder: 'Search ' + label,
                }}
                multiple
                menuItemVisibleLength={5}
                options={
                    comboboxFilterAndLimit(
                        this.state[valueName],
                        100,
                        this.state[stateOption],
                        this.state[stateName],
                    )
                }
                selection={this.state[stateName]}
                value={this.state[valueName]}
                variant="inline-listbox"
            />
        );
    }

    /**
     * Render modals
     * - SMS Merge Field
     * 
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.sms_merge_field_modal && (
                        <SMSInsertMergeField
                            setMergeFieldValus={this.setMergeFieldValues.bind(this)}
                            showModal={this.state.sms_merge_field_modal}
                            closeModal={this.closeModal}
                            headingTxt="Insert Merge Field"
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Render SMS recipient
     * @returns 
     */
    renderSMSSelectOption = () => {
        if (this.state.entity_type === 'interview') {
            return (
                <div className="SLDS_date_picker_width">
                    <span style={styles.to_req}>
                        <abbr class="slds-required" title="required">* </abbr>
                    </span>
                    {this.renderComboBox('SMS Recipients', 'sms_to', 'sms_to_id', 'sms_to_option')}
                </div>
            );
        } else {
            return (
                <div className="slds-form-element__label">
                    <label className="slds-form-element__label" >
                        <abbr className="slds-required" title="required">* </abbr>Phone
                    </label>
                    <div className="slds-form-element__control pb-2">
                        {this.state.phone ? ("+61 "+this.state.phone) : 'N/A' || 'N/A'}
                    </div>
                </div>
            );
        }
        
    }

    render() {
        let isWarn = false;
        let content = this.state.sms_content;
        let length = content.replaceAll("{Applicant.firstname}", "").replaceAll("{Applicant.lastname}", "").length;
        let bottom_text = `Character limit: ${160 - length >= 0 ? 160 - length : 0}`;
        if (length > 160) {
            isWarn = true;
            bottom_text = "Character limit cannot exceed 160";
        }
        let has_variables = this.state.sms_content.includes("{Applicant.firstname}") || this.state.sms_content.includes("{Applicant.lastname}");
        return(
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <form id="send_sms_activity" autocomplete="off" className="slds_form">
                    <div className="slds-form-element__control">
                        {this.renderSMSSelectOption()}
                    </div>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label" >
                            Choose SMS Template
                        </label>
                        <div className="slds-form-element__control">
                            <SLDSReactSelect
                                simpleValue={true}
                                className="custom_select default_validation"
                                options={this.state.sms_template_option}
                                onChange={(value) => this.setSMSTemplate(value)}
                                value={this.state.sms_template || ''}
                                clearable={false}
                                searchable={false}
                                placeholder="Please Select"
                                required={false}
                                name="sms_template"
                                id="sms_template"
                            />
                        </div>
                    </div>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label" >
                            <abbr className="slds-required" title="required">* </abbr>SMS
                        </label>
                        <div className="slds-form-element__control">
                            <textarea 
                                class="slds-textarea"  
                                name="sms_content"
                                id="sms_content"
                                value={this.state.sms_content}                                 
                                placeholder="Maximum 160 characters allowed"
                                onPaste={e => this.handleContentChange(e)}
                                onChange={e => this.handleContentChange(e)}
                                style={{minHeight: "80px"}}
                                required={true}
                            >
                            </textarea>
                            <Label errorText={isWarn} text={bottom_text} />
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
                        </div>
                    </div>
                    <div className="row px-2">
                        <div className="mt-1 d-inline-block attach_bn">
                            <button style={{margin:"7px 6px 6px 6px"}} class="slds-button slds-button_icon" tabindex="5" onClick={this.triggerSMSInsertMergeField} id="insert-sms-merge-fields-btn">
                                <Icon
                                    assistiveText={{ label: 'Lead' }}
                                    category="utility"
                                    name={`merge_field`}
                                    size={'xx-small'}
                                />
                                <span class="slds-assistive-text">Insert SMS Merge Field</span>
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 text-right">
                        <button style={{ color: 'white' }} className="slds-button slds-button_success" type="button" onClick={(e) => this.handleSend(e)} disabled={this.state.loading || this.state.disabled_send}>Send</button>
                    </div>
                </form>
                {this.renderModals()}
            </IconSettings>
        );
    }
}

// Get the page title and type from reducer
const mapStateToProps = state => ({
    sms_recipient_refresh: state.RecruitmentReducer.recruit_refresh.sms_recipient,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        set_recipient_refresh: (request) => dispatch({ type: 'SET_SMS_RECIPIENT', condition: request }),
        set_feed_refresh: (request) => dispatch({ type: 'SET_FEED_SMS_RECIPIENT', condition: request }),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps, null , { withRef: true })(SendSMSActivity);