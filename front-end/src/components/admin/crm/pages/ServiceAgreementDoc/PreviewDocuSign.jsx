import '../../../scss/components/admin/crm/pages/sales/ServiceAgreementDoc/ServiceAgreementDocsign.scss';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import Button from '@salesforce/design-system-react/lib/components/button';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Popover from '@salesforce/design-system-react/lib/components/popover';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import React, { Component } from 'react';
import { checkItsNotLoggedIn, postData, queryOptionData, toastMessageShow } from 'service/common.js';

/**
 * Get person or organization as account
 * @param {obj} e 
 * @param {array} data 
 */
const getOppContacts = (e, opporunity_id) => {
    return queryOptionData(e, "sales/Opportunity/get_opp_contacts", { query: e,opporunity_id:opporunity_id });
}

class PreviewDocuSign extends Component {

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
            service_agreement_type: '',
            subject: '',
            email_content: 'Please DocuSign the Service Agreement.',
            cc_email: [],
            cc_email_input: '',
            cc_email_flag: false,
            completed_email_content: 'All parties have completed the Service Agreement.',
            cc_popover: false,
            service_agreement_options: [
                { value: "2", label: "NDIS Service Agreement", type: 2 },
                { value: "3", label: "Support Coordination Service Agreement", type: 2 },
                { value: "4", label: "Private Travel Agreement", type: 2},
                { value: "1", label: "Consent", type: 1 }
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

        if (this.state.docutype == "") {
            toastMessageShow('Select Type is Mandatory', 'e');
            return;
        }

        if ((this.state.service_agreement_type == '' || this.state.service_agreement_type == 'null' || this.state.service_agreement_type == null)) {
            toastMessageShow('Select service agreement template', 'e');
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
            if ((!result.info || result.info.length == 0 || Number(result.info[0]) == 4)) {

                this.setState({ meetsPreCond: true, loading: true });

                let stateValue = {};
                stateValue['type'] = this.state.docutype;
                stateValue['to'] = this.state.to_id;
                stateValue['to_select'] =  this.state.to_select;
                stateValue['service_agreement_type'] = this.state.service_agreement_type;
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
                // Api call
                postData('sales/ServiceAgreementContract/preview_docusign', stateValue).then((result_res) => {
                    if (result_res.status) {
                        let msg = result_res.msg;
                        toastMessageShow(msg, 's');
                        let url = result_res.data;
                        window.open(url, "_blank");
                        this.props.onSuccess();
                    } else {
                        toastMessageShow(result_res.error, "e");
                    }
                    this.setState({ loading:false });
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
        const req = { id: this.props.service_agreement_id, recipientId: this.state.to_id, signerId: this.state.signed_by.value, template_type: this.state.service_agreement_type }
        return await postData('sales/ServiceAgreement/can_create_docusign_agreement', req);
    }

    renderPopover() {
        
        let acc_items = PreviewDocuSign.PreCondErrors.account.filter(e => this.state.missingConds.find(v => e.code == v));
        let signer_items = PreviewDocuSign.PreCondErrors.signer.filter(e => this.state.missingConds.find(v => e.code == v));
        let sa_items = PreviewDocuSign.PreCondErrors.service_agreement.filter(e => this.state.missingConds.find(v =>  e.code == v));
        let payment_method = PreviewDocuSign.PreCondErrors.payment_method.filter(e => this.state.missingConds.find(v =>  e.code == v));
        let jsx = [];

        if (acc_items.length) {
            jsx.push(<strong>Account</strong>);
            jsx.push(<ul>{acc_items.map(i => <li>{i.label}</li>)}</ul>);
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

        if (!this.state.signed_by) {
            toastMessageShow('Select Signed By Field is Mandatory, If there is no Data, Please Add Contacts under Opportunities Module', 'e');
            return false;
        }

        if (Number(this.state.docutype) === 2 && (this.state.service_agreement_type == '' || this.state.service_agreement_type == 'null' || this.state.service_agreement_type == null)) {
            toastMessageShow('Select service agreement template', 'e');
            return false;
        }

        this.canCreate().then((result) => {            
            if (result.info && result.info.length != 0 && Number(result.info[0]) !== 4) {
                this.setState({ meetsPreCond: false, missingConds: result.info });
                return false;                   
            }
        });
        
        return true;
    }

    /**
     * Render form content based on 
     */
    renderFormContent = () => {
        var service_agreement_type = this.state.service_agreement_options;
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
                                        options={service_agreement_type}
                                        onChange={(value) => this.handleSATypeChange(value, 'service_agreement_type')}
                                        value={this.state.service_agreement_type || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Select Document Type"
                                        required={true}
                                        name="service_agreement_type"
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
                                        <abbr className="slds-required" title="required">* </abbr>Signed By</label>
                                    <div className="slds-form-element__control">
                                        <SLDSReactSelect.Async
                                            className="default_validation"
                                            required={true}
                                            name='signed_by'
                                            loadOptions={(e) => getOppContacts(e,this.props.opporunity_id)}
                                            clearable={false}
                                            placeholder='Search'
                                            cache={false}
                                            value={this.state.signed_by}
                                            onChange={(e) => this.setState({ signed_by: e })}
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
        if (this.state.isSubmitting || this.state.firstError || this.state.loading) {
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
                        heading={'Preview Document'}
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
                      <div className="container-fluid mb-5 mt-5">
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

export default PreviewDocuSign;
