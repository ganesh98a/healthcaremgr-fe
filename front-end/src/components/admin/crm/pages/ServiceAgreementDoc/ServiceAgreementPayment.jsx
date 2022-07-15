import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import { ExpandableSection } from '@salesforce/design-system-react';
import Button from '@salesforce/design-system-react/lib/components/button';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import React, { Component } from 'react';
import { postData, queryOptionData, toastMessageShow } from 'service/common.js';

const getOrglist = (input) => {
    return queryOptionData(input, 'sales/ServiceAgreement/get_account_list_names', { query: input });
}
const getOrgcontactdetails = (input,orgId) => {
        return queryOptionData(input, 'sales/ServiceAgreement/get_account_contacts', { query: input , orgId : orgId});
}

/**
 * Get contact list associated with opportunity
 * @param {str} input 
 * @param {id} service_agreement_id 
 */
const getSelfManagedContactlist = (input, service_agreement_id, opportunity_id) => {
    return queryOptionData(input, 'sales/ServiceAgreement/get_contacts_by_opportunity', { query: input , service_agreement_id : service_agreement_id, opportunity_id: opportunity_id });
}

class ServiceAgreementPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenLivSitun: true,
            managed_type:"",
            organisation_id:"",
            organisation_contact_id:"",
            service_booking_creator:'',
            organisationcont : true,
            sa_selftype_account_name : this.props.service_agreement_ac_name,
            sa_selftype_account_id : this.props.service_agreement_ac_id,
             managedType_options : [
                { value: 1, label: 'Portal Managed', sda_agencey_name: false },
                { value: 2, label: 'Plan Managed', sda_agencey_name: false },
                { value: 3, label: 'Self Managed', sda_agencey_name: false },
            ],
             servicebookingcreator_options : [
                { value: 1, label: 'Participant/Agent', sda_agencey_name: false },
                { value: 2, label: 'ONCALL', other: true },
            ],
            self_type_contact_name:'',
            self_managed_contact: '',
        }
    }
    componentWillMount() {
        this.get_service_agreement_details()
    }
    get_service_agreement_details = () => {
            let id =  this.props.service_agreement_id;
        this.setState({ loading: true })
        postData('sales/ServiceAgreement/get_service_agreement_details', { id }).then(res => {
            if (res.status && res.data.service_agreement_payments) {
                getOrglist();
                this.setState({
                    managed_type:res.data.service_agreement_payments.managed_type,
                    organisation_id:res.data.service_agreement_payments.organisation_id,
                    organisation_select: JSON.parse(res.data.service_agreement_payments.organisation_select),
                    organisation_contact_id:res.data.service_agreement_payments.organisation_contact_id,
                    organisation_contact_select:JSON.parse(res.data.service_agreement_payments.organisation_contact_select),
                    organisation_contact_id:res.data.service_agreement_payments.organisation_contact_id,
                    service_booking_creator:res.data.service_agreement_payments.service_booking_creator,
                    self_type_contact_name : res.data.service_agreement_payments.self_type_contact_name,
                    organisationcont:false,
                    self_managed_contact: res.data.service_agreement_payments.self_managed_contact
                },() => {
          
                    console.log(this.state.service_agreement_payments,"service_agreement_payments");                       
                })
            }

        })
        .finally(
            () => this.setState({ loading: false })
        )
         

    }
    handleChange = val => e => { 
        this.setState({ 
          managed_type : val,
          service_booking_creator : "",
          organisation_id : "",
          organisation_contact_id :"",
          organisation_select:"",
          organisation_contact_select : "",
          self_type_contact_name :"",
          self_managed_contact: ""
         })
    }
    handleServicebookingChange = val => e => { 
        this.setState({ service_booking_creator : val })
    }
 
    orgOnChange = (e, type) => {
        if(e && e.value != ""){
            var state = {};
            state['organisation_contact_name'] = "";
            state['organisation_contact_id'] = "";
            state['organisation_contact_select'] = "";
            state['organisationcont'] = false;
            state['organisation_name'] = e;
            state['organisation_select'] = e != null && e.hasOwnProperty('value') ? { label: e.label, value: e.value } : '';
            state['organisation_id'] = e != null && e.hasOwnProperty('value') ? e.value : '';
            this.setState(state, () => {
                getOrgcontactdetails();
            });
        }else{
            this.setState({ organisationcont : true }) 
        }     
    }
    orgContOnChange = (e, type) => {
        var state = {};
        state['organisation_contact_name'] = e;
        state['organisation_contact_id'] = e != null && e.hasOwnProperty('value') ? e.value : '';
        state['organisation_contact_select'] = e != null && e.hasOwnProperty('value') ? { label: e.label, value: e.value } : '';

        this.setState(state, () => {
        });
    }
    
    submit = (e) => {
      e.preventDefault();
      console.log(this.state,"-----state-----");
      let checkcondition = 1;
      const stateValue = {};
      if (this.state.managed_type == "" || this.state.managed_type == null) {
        checkcondition = 0;
        toastMessageShow('Select Managed Type is Mandatory', 'e');
        return false;
      }
      if (this.state.managed_type == 1 && this.state.service_booking_creator == "") {
        checkcondition = 0;
        toastMessageShow('Select Service Booking Creator is Mandatory', 'e');
        return false;
      }
      if (this.state.managed_type == 2) {
         if(this.state.organisation_id == ""){
            checkcondition = 0;
            toastMessageShow('Select Organisation is Mandatory', 'e');
            return false;
          } 
        /* if(this.state.organisation_contact_id == ""){
            checkcondition = 0;
            toastMessageShow('Select Organisation Contact is Mandatory, If there no Contact for this Organisation, Please Add Contact using Organisation Module', 'e');
            return false;
        } */
      }
      if (this.state.managed_type == 3) {
        if(this.state.self_managed_contact == "" || this.state.self_managed_contact == undefined){
            checkcondition = 0;
            toastMessageShow('Contact Name is Mandatory', 'e');
            return false;
        } 
    }
    if(checkcondition == 1){
    stateValue['service_agreement_id'] = this.props.service_agreement_id;
    stateValue['managed_type'] = this.state.managed_type;
    stateValue['service_booking_creator'] =  this.state.service_booking_creator;
    stateValue['organisation_id'] = this.state.organisation_id;
    stateValue['organisation_contact_id'] = this.state.organisation_contact_id;
    stateValue['self_type_contact_name'] = this.state.self_type_contact_name;
    stateValue['self_managed_contact_id'] = this.state.self_managed_contact && this.state.self_managed_contact.value ? this.state.self_managed_contact.value : '';
    stateValue['organisation_select'] = this.state.organisation_select;
    stateValue['organisation_contact_select'] = this.state.organisation_contact_select;
    
    // Api call
    postData('sales/ServiceAgreement/save_sa_payment', stateValue).then((result) => {
        if (result.status) {
            let msg = result.msg;
            toastMessageShow(msg, 's');
            this.props.get_service_agreement_details();
            this.setState({ submitDisabled: true });
        } else {
            toastMessageShow(result.error, "e");
        }
    });
}
    }
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <ExpandableSection
                    id="controlled-expandable-section"
                    isOpen={this.state.isOpenLivSitun}
                    onToggleOpen={(event, data) => {
                        this.setState({ isOpenLivSitun: !this.state.isOpenLivSitun });
                    }}
                    title="Payments"
                >
                    <div className="container-fluid">
                        <form id="living_situation" autoComplete="off" className="slds_form">
                            <div class="slds-form">
                                <label for="living_situation" class="error CheckieError" style={{ display: "block", width: "20%", marginBottom: '0px' }}></label>
                                <fieldset class="slds-form-element slds-m-top_medium">
                                    <div class="">
                                        {this.state.managedType_options.map((val, index) => (
                                            <>
                                                <span class="slds-radio" key={index + 1}>
                                                    <input
                                                        type="radio"
                                                        id={"alone" + index}
                                                        value={val.value}
                                                        name="managed_type_val"
                                                        required={true}
                                                        onChange={this.handleChange(val.value)}
                                                        checked={val.value == this.state.managed_type ? true : false}
                                                    />
                                                    <label class="slds-radio__label" for={"alone" + index}>
                                                        <span class="slds-radio_faux"></span>
                                                        <span class="slds-form-element__label">{val.label}</span>
                                                    </label>
                                                </span>
                                            </>
                                        ))}
                                    </div>
                                </fieldset>

                                { this.state.managed_type == 1 && 
                                    <fieldset class="slds-form-element slds-m-top_medium">
                                        <label for="informal_support" class="error CheckieError" style={{ display: "block", width: "20%", marginBottom: '0px' }}></label>
                                        <legend class="slds-form-element__legend slds-form-element__label" style={{margin:"0 0 10px 0px"}}>
                                            <abbr class="slds-required" title="required">* </abbr>Service Booking Creator</legend>
                                        <div class="">
                                            <br></br>
                                            { this.state.servicebookingcreator_options.map((val, index) => (
                                                <>
                                                    <span class="slds-radio">
                                                        
                                                        <input
                                                            type="radio"
                                                            id={"Informal_" + index}
                                                            value={val.value}
                                                            name="informal_support"
                                                            required={true}
                                                            onChange={ this.handleServicebookingChange(val.value)}                
                                                            checked={val.value == this.state.service_booking_creator ? true : false}
                                                        />
                                                        <label class="slds-radio__label" for={"Informal_" + index}>
                                                            <span class="slds-radio_faux"></span>
                                                            <span class="slds-form-element__label">{val.label}</span>
                                                        </label>
                                                    </span>
                                                </>
                                            ))}
                                        </div>
                                    </fieldset>  
                                }

                                { this.state.managed_type == 2 &&
                                    <div>
                                        <div className="row py-1">
                                            <div className="col-sm-4">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                        <abbr className="slds-required" title="required">* </abbr>Organisation</label>
                                                    <div className="slds-form-element__control">
                                                        <SLDSReactSelect.Async
                                                            className="default_validation"
                                                            required={true}
                                                            name='owner'
                                                            loadOptions={(e) => getOrglist(e)}
                                                            clearable={false}
                                                            placeholder='Search'
                                                            cache={false}
                                                            value={this.state.organisation_select}
                                                            onChange={(e) => this.orgOnChange(e)}
                                                        //   onChange={ this.orgOnChange(e)}                
                                                        //   onChange={(e) => this.setState({ organisation: e })}
                                                        //   inputRenderer={(props) => <input  {...props} name={"owner"} 
                                                        //   />
                                                        // }
                                                        />
                                                    </div>
                                                </div>
                                            </div> 
                                        </div>
                                        <div className="row py-1">
                                            <div className="col-sm-4" style={{float:"none"}}>
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="text-input-id-4">
                                                        {/* <abbr className="slds-required" title="required">* </abbr>*/}Contact</label>
                                                    <div className="slds-form-element__control">
                                                        <SLDSReactSelect.Async
                                                            className="default_validation"
                                                            required={true}
                                                            name='account_person'
                                                            loadOptions={(e) => getOrgcontactdetails(e,this.state.organisation_id)}
                                                            clearable={false}
                                                            placeholder='Search'
                                                            cache={false}
                                                            value={this.state.organisation_contact_select}
                                                            disabled = {this.state.organisationcont}
                                                            onChange={(e) => this.orgContOnChange(e)}
                                                        //   onChange={(e) => this.setState({ organisation_contact: e })}
                                                        //   inputRenderer={(props) => <input  {...props} name={"account_person"} />}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }

                                { this.state.managed_type == 3 &&
                                    <div>
                                        <div className="row py-1">
                                            <div className="col-sm-4">
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
                                            <div className="col-sm-4" style={{float:"none"}}>
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="text-input-id-4">
                                                        <abbr className="slds-required" title="required">* </abbr>Contact</label>
                                                    <div className="slds-form-element__control">
                                                        <div class="slds-form-element__control">
                                                            <SLDSReactSelect.Async
                                                                className="default_validation"
                                                                required={true}
                                                                name='self_managed_contact'
                                                                loadOptions={(e) => getSelfManagedContactlist(e, this.props.service_agreement_id, this.props.opportunity_id)}
                                                                clearable={false}
                                                                placeholder='Search'
                                                                cache={false}
                                                                value={this.state.self_managed_contact}
                                                                onChange={(e) => this.setState({ self_managed_contact: e })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <div className="slds-panel__footer py-2">
                                    <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />
                                </div>                    
                            </div>
                        </form>
                    </div>
                </ExpandableSection>
            </React.Fragment>
        );
    }

    }
export default ServiceAgreementPayment;
