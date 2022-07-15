import {
    Button, IconSettings, Modal, Textarea, Icon
} from '@salesforce/design-system-react';
import jQuery from "jquery";
import React, { Component } from 'react';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow } from 'service/common.js';
import "service/custom_script.js";
import 'service/jquery.validate.js';
import { Label, Row, SelectList } from '../../oncallui-react-framework';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SMSInsertMergeField from '../SMSInsertMergeField';

class CreateSmsTemplate extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            name: '',
            short_description:'',
            sms_content:'',
            sms_template_id:this.props.id ? this.props.id : '',
            merge_field_sep_start: '{',
            merge_field_sep_end: '}',
            txt: "",
            textoverlimit: false,
            bottom_text: "Character limit: 160"
        }
    }

    /**
     * Update the state value of input 
     * @param {Obj} e
     */
    handleChange = (e) => {
        var state = {};
        this.setState({ error: '' });
        state[e.target.name] = e.target.value;
        this.setState(state);
    }


    get_sms_template_by_id(){
        this.setState({ loading: true });
        postData('sms/Sms_template/get_sms_template_by_id', {id: this.state.sms_template_id }).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                this.setState(result.data[0]);
                let sms_content = result.data[0]['content'];
                let txt = this.getText(sms_content);
                this.setState({sms_content, txt});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    
    /**
     * mounting all the components
     */
     componentDidMount() {        
        if(this.props.id) {
            this.setState({ sms_template_id: this.props.id });
            this.get_sms_template_by_id(this.props.id);
        }
    }


    /**
     * Update the state value of Select option
     * @param {Obj} selectedOption
     * @param {str} fieldname
     */
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;

        this.setState(state);
    }

    /**
     * Update the contact name
     * param {object} item
     */
    updateContactName = (item) => {
        var state = {};
        state['contact'] = item;
        this.setState(state);
    }

    /**
     * Call the create api when user save sms template
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_sms_template").validate({ /* */ });        
        var url = !this.props.id? 'sms/Sms_template/create_sms_template':'sms/Sms_template/update_sms_template';
        var validator = jQuery("#create_sms_template").validate({ ignore: [] });
        
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_sms_template").valid()) {
            this.setState({ loading: true });
            // Call Api
            const req={...this.state}
            postData(url, req).then((result) => {
                if (result.status) {
                    // Trigger success pop 
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                    
                } else {
                    // Trigger error pop 
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });           
        } else {
            // Validation is failed
            validator.focusInvalid();
        }
    }
    
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button id="sms_template_cancel" disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading || this.state.textoverlimit} id="sms_template_save" key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={ !this.props.id ? "New SMS Template":"Update SMS Template"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_sms_template" autoComplete="off" className="slds_form">
                                <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Name</label>
                                                <div className="slds-form-element__control">
                                                    <input                                                   
                                                        type="text"
                                                        name="SMS Template Name"
                                                        placeholder=""
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={e => this.setState({ name: e.target.value })}
                                                        value={this.state.name}                                                   
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01">Short Description</label>
                                                <div className="slds-form-element__control">
                                                    <div className="">
                                                    <input
                                                        type="text"
                                                        name="short_description"
                                                        placeholder=""
                                                    
                                                        className="slds-input"
                                                        onChange={e => this.setState({ short_description: e.target.value })}
                                                        value={this.state.short_description}
                                                    />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>                                        
                                    </div>
                                    <div className="row py-2">                                        
                                        <div className="col-sm-12 mt-2">
                                            <div className={`slds-form-element ${this.state.textoverlimit && "slds-has-error"}`}>
                                                
                                                <div className="slds-form-element__control">
                                                <Textarea  
                                                id="sms-template-content"
                                                className="min-h-120 textarea-max-size w-100" 
                                                name='sms_content'
                                                onChange={e => this.setContent(e)}
                                                value={this.state.sms_content}
                                                rows={10} label="SMS Content (Maximum 160 characters allowed without dynamic variables)" required />
                                                <Label errorText={this.state.textoverlimit} text={this.state.bottom_text} />
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <Row>
                                            <div className="row py-1 px-2">
                                                <div className="px-0 py-0 mt-2 ml-3 d-inline-block attach_bn">
                                                    <button style={{margin:"7px 6px 6px 6px"}} class="slds-button slds-button_icon" tabindex="5" onClick={this.triggerInsertMergeField} id="insert-merge-fields-btn" title="Insert Merge Field">
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
                                   
                                </form>
                            </div>
                        </section>
                    </Modal>
                    {
                        this.state.merge_field_modal && (
                            <SMSInsertMergeField
                                setMergeFieldValus={this.setMergeFieldValues.bind(this)}
                                showModal={this.state.merge_field_modal}
                                closeModal={(status) => this.closeModal(status)}
                                headingTxt="Insert Merge Field"
                            />
                        )
                    }
                </IconSettings>
            </React.Fragment>
        );
    }

    getText(sms_content) {
        let txt = sms_content.replaceAll("{Account.name}", "").replaceAll("{Shift.account_address}", "").replaceAll("{Shift.start}", "").replaceAll("{Shift.url}", "").replaceAll("{Applicant.firstname}", "").replaceAll("{Applicant.lastname}", "");
        return txt;
    }

    setContent(e) {        
        let textoverlimit = this.state.textoverlimit;
        let sms_content = e.target.value;
        let txt = this.getText(e.target.value);
        let length = txt.length;
        let bottom_text = `Character limit: ${160 - length >= 0 ? 160 - length : 0}`;
        if (txt.length > 160) {
            bottom_text = "Character limit cannot exceed 160";
            textoverlimit = true;
        } else {
            textoverlimit = false;
        }
        this.setState({ sms_content, txt, textoverlimit, bottom_text });
    }

    closeModal(status) {
        this.setState({ merge_field_modal: status });
    }

    setMergeFieldValues = (value) => {
        let cursorPosition = jQuery('#sms-template-content').prop("selectionStart");
        this.setState({ merge_field_value: value, merge_field_modal: false });
        if (value != '' && value != undefined) {
            let text = this.state.sms_content;
            let field = this.state.merge_field_sep_start + value + this.state.merge_field_sep_end;
            let p1 = text.slice(0, cursorPosition);
            let p2 = text.slice(cursorPosition);
            text = [p1, field, p2].join('');
            let puretext = this.getText(text);
            let bottom_text = `Character limit: ${160 - puretext.length >= 0 ? 160 - puretext.length : 0}`;
            this.setState({ sms_content: text, bottom_text });
            this.setState({sms_content: text, bottom_text});
        }
    }

    /**
     * Open Merge Insert Field
     * @param {eventObj} e 
     */
    triggerInsertMergeField = (e) => {
        e.preventDefault();
        this.setState({ merge_field_modal: true });
    }
}

export default CreateSmsTemplate;
