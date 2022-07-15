import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, archiveALL } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../scss/components/admin/crm/pages/sales/ServiceAgreementDoc/ServiceAgreementDocsign.scss';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import Popover from '@salesforce/design-system-react/lib/components/popover'; 
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Icon from '@salesforce/design-system-react/lib/components/icon'; 
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import { css} from '../../../../../service/common'
import { 
    Textarea
} from '@salesforce/design-system-react';
/**
 * Get person or organization as account
 * @param {obj} e 
 * @param {array} data 
 */
const getOppContacts = (e, opporunity_id) => {
    return queryOptionData(e, "sales/Opportunity/get_opp_contacts", { query: e,opporunity_id:opporunity_id });
}

/**
 * Get person
 * @param {obj} e 
 * @param {array} data 
 */
 const getOppContactsWithAc = (e, opporunity_id) => {
    return queryOptionData(e, "sales/ServiceAgreement/get_opp_contacts_with_ac", { query: e,opporunity_id:opporunity_id });
}

class AddNewDocuSign extends Component {

    static PreCondErrors = Object.freeze({
        account:            [   { code: 0, label: 'A Contact Account is missing on this Service Agreement' },
                                { code: 1, label: 'NDIS Number' },
                                { code: 2, label: 'D.O.B' },
                                { code: 3, label: 'Address' }], // unused
        to:                 [   { code: 4, label: 'Email' }],
        signer:             [   { code: 5, label: 'Phone Number' },
                                { code: 6, label: 'Address' }],
        service_agreement:  [   { code: 7, label: 'Items' },
                                { code: 8, label: 'Payment Method' },
                                { code: 9, label: 'Goals' }]   ,
        payment_method:     [   { code: 10, label: 'Self Managed' }],                                  
    })

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            status: '1',
            reference_id: props.referenceId,
            topic: '',
            owner: '',
            account_person: '',
            meetsPreCond: true, // has all required preconditions to construct this service agreement document
            missingConds: [], // fields/conditions that the user must first resolve
            docutype: 1,
            docuTypeoptions : [
                { value: 1, label: 'Consent'},
                { value: 2, label: 'Service Agreement'},
               ],
            to_id : this.props.oppunity_decisionmaker_contacts ? this.props.oppunity_decisionmaker_contacts.value : "",
            to_select : this.props.oppunity_decisionmaker_contacts ? this.props.oppunity_decisionmaker_contacts : "",
            signed_by: this.props.oppunity_decisionmaker_contacts ? this.props.oppunity_decisionmaker_contacts : "",
            document_type: '',
            subject: '',
            email_content: 'Please DocuSign the Service Agreement.',
            cc_email: [],
            cc_email_input: '',
            cc_email_flag: false,
            completed_email_content: 'All parties have completed the Service Agreement.',
            cc_popover: false,
            service_agreement_options: [
                { value: "1", label: "Consent", type: 1},
                { value: "2", label: "NDIS Service Agreement", type: 2 },
                { value: "3", label: "Support Coordination Service Agreement", type: 2 },
                { value: "4", label: "Private Travel Agreement", type: 2}                
            ]
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.dismissPoppover = this.dismissPoppover.bind(this);
        this.renderPopover = this.renderPopover.bind(this);
    }

    handleChange = val => () => { 
        this.setState({ 
            docutype : val,
        })
    }
    /**
     * Update service agreement type
     * @param {int} val 
     * @param {str} name - state variable 
     */
    handleSATypeChange = (val, name) => { 
        let service_agreement_options = this.state.service_agreement_options;
        let find_sa_index = service_agreement_options.findIndex((item) => item.value === val);
        let docutype = this.state.docutype;
        if (find_sa_index > -1) {
            docutype = service_agreement_options[find_sa_index].type;
        }
        this.setState({ 
            [name] : val,
            docutype: docutype
        })
    }

    /**
     * Save Docusign contract
     * @param {eventObj} e 
     */
    handleSubmit(e) {
        e.preventDefault();
        console.log(this.state);
        if (this.state.docutype == "") {
            toastMessageShow('Select Type is Mandatory', 'e');
            return;
        }
        
        if ((this.state.document_type == '' || this.state.document_type == 'null' || this.state.document_type == null)) {
            toastMessageShow('Select document type', 'e');
            return;
        }
        
        if (this.state.to_id == "") {
            toastMessageShow('Select To Field is Mandatory, If there is no Data, Please Add Contacts under Opportunities Module', 'e');
            return;
        }

        if (this.state.signed_by == '') {
            toastMessageShow('Select Signed By Field is Mandatory, If there is no Data, Please Add Contacts under Opportunities Module', 'e');
            return;
        }

        var validate_steps = this.validateSteps();

        if (validate_steps === false) {
            return false;
        }

        this.canCreate().then((result) => {            
            if (!result.info || result.info.length == 0) {

                this.setState({ meetsPreCond: true });

                let stateValue = {};
                stateValue['type'] = this.state.docutype;
                stateValue['to'] = this.state.to_id;
                stateValue['to_select'] =  this.state.to_select;
                stateValue['document_type'] = this.state.document_type;
                stateValue['related'] = this.props.service_agreement_related;
                stateValue['service_agreement_id'] = this.props.service_agreement_id;
                stateValue['account_id'] = this.props.account_person_id;
                stateValue['account_type'] = this.props.account_type;
                stateValue['opporunity_id'] = this.props.opporunity_id;
                stateValue['signed_by'] = this.state.signed_by ? this.state.signed_by.value : '';
                stateValue['subject'] = this.state.subject;
                stateValue['email_content'] = this.state.email_content;
                stateValue['cc_email_flag'] = this.state.cc_email_flag ? 1 : 0;
                stateValue['cc_email'] = this.state.cc_email_flag ? this.state.cc_email : '';
                stateValue['completed_email_content'] = this.state.completed_email_content;
                // Api call with confirmation
                archiveALL(stateValue, 'Are you sure you want to save. Once its done can\'t be change again.', 'sales/ServiceAgreement/save_add_newdocusign').then((result) => {
                    if (result.status) {
                        let msg = result.msg;
                        toastMessageShow(msg, 's');
                        this.props.onSuccess()
                    } else {
                        toastMessageShow(result.error, "e");
                    }
                });                    
            }
            else {
                try {
                    this.setState({ meetsPreCond: false, missingConds: result.info });
                } catch (e) { console.log(e) }
            }            
        })
    }
    
    ToOnChange = (e) => {
        if(e && e.value != ""){
            var state = {};
            state['to_select'] = e != null && e.hasOwnProperty('value') ? { label: e.label, value: e.value } : '';
            state['to_id'] = e != null && e.hasOwnProperty('value') ? e.value : '';
            this.setState(state, () => {
            });
        }   
    }

    dismissPoppover() {
        this.setState({ meetsPreCond: true })
    }

    async canCreate() {
        if (this.state.docutype != 2) return Promise.resolve(true);
        const req = { id: this.props.service_agreement_id, recipientId: this.state.to_id, signerId: this.state.signed_by.value, template_type: this.state.document_type }
        return await postData('sales/ServiceAgreement/can_create_docusign_agreement', req);
    }

    renderPopover() {
        
        let acc_items = AddNewDocuSign.PreCondErrors.account.filter(e => this.state.missingConds.find(v => e.code == v));
        let to_items = AddNewDocuSign.PreCondErrors.to.filter(e => this.state.missingConds.find(v => e.code == v));
        let signer_items = AddNewDocuSign.PreCondErrors.signer.filter(e => this.state.missingConds.find(v => e.code == v));
        let sa_items = AddNewDocuSign.PreCondErrors.service_agreement.filter(e => this.state.missingConds.find(v =>  e.code == v));
        let payment_method = AddNewDocuSign.PreCondErrors.payment_method.filter(e => this.state.missingConds.find(v =>  e.code == v));
        let jsx = [];

        if (acc_items.length) {
            jsx.push(<strong>Account</strong>);
            jsx.push(<ul>{acc_items.map(i => <li>{i.label}</li>)}</ul>);
        }

        if (to_items.length) {
            jsx.push(<strong>To</strong>);
            jsx.push(<ul>{to_items.map(i => <li>{i.label}</li>)}</ul>)
        }  
        
        if (signer_items.length) {
            jsx.push(<strong>Signer</strong>);
            jsx.push(<ul>{signer_items.map(i => <li>{i.label}</li>)}</ul>)
        } 

        if (sa_items.length) {
            jsx.push(<strong>Service Agreement</strong>);
            jsx.push(<ul>{sa_items.map(i => <li>{i.label}</li>)}</ul>)
        } 

        if (payment_method.length) {
            jsx.push(<strong>Payment</strong>);
            jsx.push(<ul>{payment_method.map(i => <li>{i.label}</li>)}</ul>)
        }

        return jsx;
    }
    
    /**
     * Validate the steps
     */
    validateSteps = () => {

        if (this.state.docutype == "") {
            toastMessageShow('Select Document Type is Mandatory', 'e');
            return false;
        }

        if (!this.state.to_id) {
            toastMessageShow('Select To Field is Mandatory, If there is no Data, Please Add Contacts under Opportunities Module', 'e');
            return false;
        }

        if (!this.state.signed_by) {
            toastMessageShow('Select Signed By Field is Mandatory, If there is no Data, Please Add Contacts under Opportunities Module', 'e');
            return false;
        }

        if (Number(this.state.docutype) === 2 && (this.state.document_type == '' || this.state.document_type == 'null' || this.state.document_type == null)) {
            toastMessageShow('Select document type', 'e');
            return false;
        }

        this.canCreate().then((result) => {            
            if (result.info && result.info.length != 0) {
                this.setState({ meetsPreCond: false, missingConds: result.info });
                return false;                   
            }
        });
        
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
     * Render form content based on 
     */
    renderFormContent = () => {
        var document_type = this.state.service_agreement_options;
        return (
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <div class="slds-form">
                    <div className="row py-1">
                        <div className="col-sm-6">
                            <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                    <abbr className="slds-required" title="required">* </abbr>Document Type</label> 
                            <div className="slds-form-element">
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={document_type}
                                        onChange={(value) => this.handleSATypeChange(value, 'document_type')}
                                        value={this.state.document_type || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Select Document Type"
                                        required={true}
                                        name="document_type"
                                    />
                                </div> 
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                    <abbr className="slds-required" title="required">* </abbr>Account Name</label>
                                <div className="slds-form-element__control">
                                    <p style={{margin:"8px"}}>{this.props.service_agreement_ac_name}</p>
                                </div>
                            </div>
                        </div> 
                        </div>

                        <div className="row py-1">
                            <div className="col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                        <abbr className="slds-required" title="required">* </abbr>To</label>
                                    <div className="slds-form-element__control">
                                        <SLDSReactSelect.Async
                                            className="default_validation"
                                            required={true}
                                            name='owner'
                                            loadOptions={(e) => getOppContactsWithAc(e,this.props.opporunity_id)}
                                            clearable={false}
                                            placeholder='Search'
                                            cache={false}
                                            value={this.state.to_select}
                                            onChange={(e) => this.ToOnChange(e)}
                                        />
                                    </div> 
                                </div>
                            </div> 
                            <div className="col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                        <abbr className="slds-required" title="required">* </abbr>Related</label>
                                    <div className="slds-form-element__control">
                                        <p style={{margin:"8px"}}>{this.props.service_agreement_related}</p>
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
                                                    required={true}
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
                            <div className="col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                        <abbr className="slds-required" title="required">* </abbr>Signed By</label>
                                    <div className="slds-form-element__control">
                                        <SLDSReactSelect.Async
                                            className="default_validation"
                                            required={true}
                                            name='signed_by'
                                            loadOptions={(e) => getOppContactsWithAc(e,this.props.opporunity_id)}
                                            clearable={false}
                                            placeholder='Search'
                                            cache={false}
                                            value={this.state.signed_by}
                                            onChange={(e) => this.setState({ signed_by: e })}
                                        />
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
                                    <div className="slds-form-element__control">
                                        <Textarea
                                            className="slds-input slds-cus-textarea"
                                            required={true}
                                            name='email_content'
                                            placeholder='Email msg'
                                            value={this.state.email_content}
                                            data-rule-email="true"
                                            onChange={(e) => this.setState({ email_content: e.target.value })}
                                        />
                                    </div> 
                                </div>
                            </div>                            
                        </div>
                        <div className="row py-2"></div>        
                </div>
            </IconSettings>
        );
    }

    /**
     * Render the display content
     */
    render() {
        var save_btn_disabled = false;
        if (this.state.isSubmitting || this.state.firstError) {
            save_btn_disabled = true;
        }
                
        /**
         * Render button based on steps
         * Save or Next
         */
        var save_btn = (
            <Button 
                disabled={save_btn_disabled} 
                label={'Save'} 
                variant="brand" 
                type="button" 
                onClick={this.handleSubmit}
            />
        );

        /**
         * Render button based on steps
         * Cancel or Prev
         */
        var cancel_btn = (
            <Button
                label={'Cancel'}
                type="button"
                onClick={this.props.onClose}
            />
        );

        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        id="new-docusign"
                        isOpen={this.props.isOpen}
                        heading={'Add Docu-Sign'}
                        containerClassName="service_agreement_modal"
                        footer={[      
                            <Popover
                                align="top right"
                                body={<><p style={{marginBottom: 6+'px'}}>Review the following fields</p>{this.renderPopover()}</>}
                                // onClick={this.setState({ isReviewErrorOpen: true })}
                                onRequestClose={this.dismissPoppover}
                                isOpen={!this.state.meetsPreCond}
                                heading="Resolve Error"
                                id="popover-error"
                                variant="error"
                            >
                                <Icon
                                    style={{display: !this.state.meetsPreCond ? 'inline' : 'none', marginRight: 8+'px' }}
                                    assistiveText={{ label: 'Error' }}
                                    category="utility"
                                    colorVariant="error"
                                    name="error"
                                />                                
                            </Popover>,
                            <>{cancel_btn}</>,
                            <>{save_btn}</>
                        ]}
                        onRequestClose={this.props.onClose}
                        size="x-small"
                        //    contentStyle={styles.contentStyle}
                        dismissOnClickOutside={false}
                        ariaHideApp={false}
                    >
                      <div className="container-fluid">
                            <form id="living_situation" autoComplete="off" className="slds_form">
                                {this.renderFormContent()}
                            </form>
                        </div>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default AddNewDocuSign;
