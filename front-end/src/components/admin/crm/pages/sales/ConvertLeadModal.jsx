import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';

import { Icon } from '@salesforce/design-system-react';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import { get_sales_activity_data, setKeyValue } from 'components/admin/crm/actions/SalesActivityAction.jsx';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import createClass from 'create-react-class';
import jQuery from 'jquery';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    handleChange,
    handleChangeSelectDatepicker,
    postData,
    queryOptionData,
    selectFilterOptions,
    toastMessageShow,
} from 'service/common.js';

import SLDSSelect from '../../../salesforce/lightning/SLDSReactSelect';



const getOptionOfAccountName = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Lead/get_account_name_and_contact_name_search_option", { search: e }).then(json => {
        if (json.status) {
            return { options: json.data };
        } else {
            return { options: [] };
        }

    });
}

const getOptionOfContactName = (e, exixting_org) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Lead/get_contact_name_search_option", { search: e, exixting_org: exixting_org }).then(json => {
        if (json.status) {
            return { options: json.data };
        } else {
            return { options: [] };
        }

    });
}

const getOptionOfOpportunityName = (e, exixting_org) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Lead/get_opportunity_name_search_option", { search: e, exixting_org: exixting_org }).then(json => {
        if (json.status) {
            return { options: json.data };
        } else {
            return { options: [] };
        }

    });
}

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {
        if(this.props.option.type == 1){
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
            var className = "slds-icon-standard-contact";
        }else if(this.props.option.type == 2){
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account";
            var className = "slds-icon-standard-account";
        }

        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>

                <div role="presentation" class="slds-listbox__item">
                    <div id="option3" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                        <span class="slds-media__figure slds-listbox__option-icon">
                            <span class={"slds-icon_container "+className}>
                                <svg class="slds-icon slds-icon_small" aria-hidden="true">
                                    <use href={icon_ref}></use>
                                </svg>
                            </span>
                        </span>
                        <span class="slds-media__body">
                            <span class="slds-listbox__option-text slds-listbox__option-text_entity">{this.props.option.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
});

class ConvertLeadModal extends Component {

    constructor() {
        super();
        this.state = {
            leadDetails: {
                person: [],
            },
            org_name: '',
            email: '',
            ndis: '',
            email_person_account:'',
            first_name:'',
            last_name:'',
            person_account: false,
            contact_is_account: false,
            account_type: 1,
            contact_type: 1,
            opportunity_type: 1,
            EmailInput: [{ email: '' }],
            account_accordian: true,
            contact_accordian: true,
            opp_accordian: true,
            account_accordian_hover: false,
            contact_accordian_hover: false,
            opportunity_accordian_hover: false,
            opportunity_type_options: [],
            leademail:'',
            lead_phone:'',
            lead_fname:'',
            lead_lname:'',
            first_name_contact:'',
            last_name_contact:'',
            email_contact:'',
            phone_contact:'',
            first_name_account:'',
            contact_name_account:'',
            email_account:'',
            phone_account:''
        }
    }
    getOptionsCreateOpportunity = () => {
        postData("sales/Opportunity/get_create_opportunity_option", {}).then((res) => {
            if (res.status) {
                this.setState(res.data)
            }
        });
    }
    getLeadDetails = () => {
        postData('sales/Lead/get_lead_details', { id: this.props.leadId }).then((result) => {
            if (result.status) {
                var lead_details = result.data;
                if (lead_details.firstname.trim().length==0 || lead_details.firstname.trim()=="")
                {

                    lead_details.firstname = lead_details.firstname_new;
                    lead_details.lastname = lead_details.lastname_new;
                }

            

                var state = {
                    org_name: lead_details.lead_company,
                    contact_name: lead_details.firstname + ' ' + lead_details.lastname,
                    opportunity_name: lead_details.lead_topic,
                    topic: lead_details.lead_topic,
                    lead_phone: lead_details.phone,
                    lead_fname: lead_details.firstname,
                    lead_lname: lead_details.lastname,
                    leademail : lead_details.email,
                    first_name_contact: lead_details.firstname,
                    last_name_contact: lead_details.lastname,
                    email_contact: lead_details.email,
                    phone_contact: lead_details.phone,
                    email_account: lead_details.email,
                    phone_account: lead_details.phone,
                    first_name_account: lead_details.firstname,
                    last_name_account: lead_details.lastname,

                }

                this.setState({ leadDetails: lead_details, ...state },()=>{
                    this.getRelatedContactEmail();
                })
            }
        });
    }
    getRelatedContactEmail = () => {
        postData('sales/Lead/get_convertlead_related_contemail', { email: this.state.leadDetails.email }).then((result) => {
            if (result.status) {
                  this.setState({ exixting_contact: result.data[0],temp_exct:  result.data[0]})
            }
        });
    }

    onChange = (key_name, e) => {
        var lead_details = this.state.leadDetails;
        var contact_name = this.state.contact_name;
        var org_name = this.state.org_name;
       
        if (key_name === "person_account") {
           
         
            
            var exixting_contact = '';
            var exixting_org = '';
            if (e.target.checked) {
                
                if (this.state.contact_type == 1) {
                  
                    exixting_contact = this.state.temp_exct;
                    

                }
                if(!this.state.contact_is_account)
                {

                    this.setState({ email_account: '' });
                    this.setState({ phone_account: '' });
                }
            } else {
                if (this.state.account_type == 1) {
                    org_name = lead_details.lead_company;
                    exixting_org = '';
                }
                if (this.state.contact_type == 1) {
                    
                    exixting_contact = this.state.temp_exct;
                }
            }

            this.setState({ org_name: org_name, contact_name: contact_name, exixting_contact: exixting_contact })
        } else if (key_name === "contact_is_account") {
          
            var exixting_contact = '';
            var exixting_org = '';
            var phone='';
           
            if (!e.target.checked && this.state.person_account) {
                org_name = '';
                this.setState({ email_account: ''});
                this.setState({ phone_account: '' });
                if (this.state.contact_type == 1) {
                    
                    exixting_contact  = this.state.temp_exct;

                }

            } else {
                if (this.state.account_type == 1) {
                    org_name = lead_details.firstname + ' ' + lead_details.lastname;
                    exixting_org = this.state.temp_exct;
                    
                    

                }
                if(this.state.person_account)
                {

                    this.setState({ email_account: lead_details.email});
                    this.setState({ phone_account: lead_details.phone });
                }
            }
            this.setState({ org_name: org_name, contact_name: contact_name,exixting_contact:exixting_contact,exixting_org:exixting_org})
        }

        if (key_name == "person_account" && !e.target.checked) {
            this.setState({ contact_is_account: false });
        }
        if (key_name == "contact_account" && e.target.checked) {
            this.setState({ contact_is_account: true });
        }
        if(key_name === "contact_name")
        {
            var str = e.target.value;
            var array_string = str.split(' ');
            var length = array_string.length;
            if (length > 1) {
               
                var lastname = array_string[length - 1];
                var firstname = array_string.splice(length-1, 1);
                
                firstname = array_string.join(" ");
                this.setState({ first_name_contact: firstname,last_name_contact:lastname });
           
                
            } 
            

        }
        if(key_name === "org_name" && this.state.contact_is_account )
        {
            var str = e.target.value;
            var array_string = str.split(' ');
            var length = array_string.length;
            if (length > 1) {
               
                var lastname = array_string[length - 1];
                var firstname = array_string.splice(length-1, 1);
                
                firstname = array_string.join(" ");
                this.setState({ first_name_account: firstname,last_name_account:lastname });
           
                
            } 
            

        }
        if(key_name === "first_name_contact")
        {
            var firstname = e.target.value;
            var lastname = this.state.last_name_contact;
            var contact_name = firstname + " " + lastname;
            this.setState({ contact_name: contact_name });
            

        }
        if(key_name === "first_name_account")
        {
            var firstname = e.target.value;
            var lastname = this.state.last_name_account;
            var org_name = firstname + " " + lastname;
            this.setState({ org_name: org_name });
            

        }
        if(key_name === "last_name_contact")
        {
            var lastname = e.target.value;
            var firstname = this.state.first_name_contact;
            var contact_name = firstname + " " + lastname;
            this.setState({ contact_name: contact_name });
            

        }
        if(key_name === "last_name_account")
        {
            var lastname = e.target.value;
            var firstname = this.state.first_name_account;
            var org_name = firstname + " " + lastname;
            this.setState({ org_name: org_name });
            

        }

        if(key_name != "contact_name" || key_name != "first_name_contact" || key_name != "last_name_contact" || key_name != "org_name")
        {
            this.setState({ [key_name]: e.target.checked });
        }
       
        
    }

    componentDidMount() {
        this.getLeadDetails();
        this.getOptionsCreateOpportunity();
        this.getOptionsLeadServiceType();
    }

    getOptionsLeadServiceType=  () =>{
        queryOptionData(1, "sales/Lead/get_lead_service_type_ref_list", false, 0,1).then((res) => {this.setState({lead_service_type_option:res.options})});
    }

    handleChange = (value, key) => {

       
        this.setState({ [key]: value }, () => {
            if (this.state.validation_calls) {
               // jQuery("#create_user").valid()
            }
        })
    }
    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#convert_lead").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery("#convert_lead").valid()) {
            this.setState({ loading: true });

            var req = { lead_id: this.props.leadId, ...this.state, task_list : this.props.activity_timeline }
            
            postData('sales/Lead/convert_lead', req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                    if (this.props.onSuccess) {
                        this.props.onSuccess()
                    }
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }

    chooseExixtingNew = (e) => {
        var lead_details = this.state.leadDetails;
        var choose_type = e.target.name;
        var choose_value = e.target.value;

        if (choose_type === "account_type") {
            if (choose_value == 1) {
                if (this.state.person_account && this.state.contact_is_account) {
                    var org_name = lead_details.firstname + ' ' + lead_details.lastname;
                } else if (!this.state.person_account && !this.state.contact_is_account) {
                    var org_name = lead_details.lead_company;
                }
                this.setState({ exixting_org: this.state.temp_exct, org_name: org_name, opportunity_type: 1, exixting_opportunity: {}, opportunity_name: lead_details.lead_topic });
            } else {
                this.setState({ org_name: "", person_account: false, contact_is_account: false });
                if (this.state.contact_type == 1) {
                    var contact_name = lead_details.firstname + ' ' + lead_details.lastname;
                    this.setState({ contact_name: contact_name,exixting_contact:this.state.temp_exct });
                }
                
            }
        }

        if (choose_type === "contact_type") {
            if (this.state.person_account && this.state.contact_is_account) {
                // no action when both checked
            }
            else {
                if (choose_value == 1) {
                    var contact_name = lead_details.firstname + ' ' + lead_details.lastname;
                    this.setState({ 
                        exixting_contact: this.state.temp_exct, 
                        contact_name: contact_name ,
                        
                    })
                } else {
                    this.setState({ contact_name: "",exixting_contact:this.state.temp_exct})
                }
            }
        }

        if (choose_type === "opportunity_type") {
            if (choose_value == 1) {
                this.setState({ exixting_opportunity: {}, opportunity_name: lead_details.lead_topic })
            } else {
                this.setState({ opportunity_name: "" })
            }
        }

        this.setState({ [e.target.name]: e.target.value });
    }

    togglePanel = (event, key_name) => {
        console.log(event);
    }

    handleChangeChooseExistingAccount = (evt) => {
        evt = evt ? evt : {};

        if (evt && evt.type == 2) {
            this.setState({ //exixting_contact: {}
            });
        }
        this.setState({ "exixting_org": evt, exixting_opportunity: {}});
    }


    render() {
        if(this.state.account_type == 2){
            var exixting_org = this.state.exixting_org ? this.state.exixting_org : {};
             var disabled_existing_opportunity = true;
              var disabled_existing_contact = true;
            if(exixting_org.value){
                disabled_existing_opportunity = false;
                disabled_existing_contact = false;
            }
            
        }
        
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <div className="slds" style={{ "font-family": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "font-size": "13px;" }}
                >
                    <Modal
                        dismissOnClickOutside={false}
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} label="Convert" variant="brand" onClick={this.onSubmit} />,
                        ]}
                        onRequestClose={this.toggleOpen}
                        heading={"Convert Lead"}
                        size="medium"
                        className="slds_custom_modal"
                        onRequestClose={() => this.props.closeModal(false)}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="convert_lead" className="slds_form" method="post" autoComplete="off">


                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        
                                        <div className={'row py-2'}>
                                            <div className={'px-4 expand-div'}>
                                                <a onClick={() => this.setState({ account_accordian: !this.state.account_accordian }) }
                                                onMouseOver={() => this.setState({ account_accordian_hover: true }) }
                                                onMouseLeave={() => this.setState({ account_accordian_hover: false }) }
                                                style={{
                                                    display: 'flex'
                                                }}>
                                                    <span className={'pr-1'}>
                                                        <Icon
                                                            category="utility"
                                                            name={this.state.account_accordian ? "chevronright" : "chevrondown"}
                                                            size="xx-small"
                                                            style={{
                                                                color: this.state.account_accordian_hover ? '#005fb2' : '#000'
                                                            }}
                                                        />
                                                    </span>                           
                                                    <h4 style={{
                                                                color: this.state.account_accordian_hover ? '#005fb2' : '#000'
                                                            }}>
                                                        Account
                                                    </h4>
                                                </a>
                                            </div>
                                            <div className={'row pr-1'}>
                                            <div className="row slds-form">
                                                    <div className="col-md-2">
                                                        <div className="csform-group">
                                                           {/* <label className="mb-4 fs_16">Account Test:</label> */ }
                                                        </div>
                                                    </div>

                                                    <div className="col-md-4 ">
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio">
                                                                    <input type="radio"
                                                                        id="create_new_account"
                                                                        onChange={(e) => this.chooseExixtingNew(e)}
                                                                        value="1"
                                                                        name="account_type"
                                                                        checked={this.state.account_type == 1 ? true : false} />
                                                                    <label className="slds-radio__label" for="create_new_account">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Create New</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <div className="slds-checkbox">
                                                                    <input
                                                                        id="person_account"
                                                                        type="checkbox"
                                                                        name="person_account"
                                                                        onChange={(e) => this.onChange('person_account', e)}
                                                                        checked={this.state.person_account ? true : false}
                                                                        disabled={this.state.account_type == 1 ? false : true}
                                                                    />
                                                                    <label className="slds-checkbox__label" for="person_account">
                                                                        <span className="slds-checkbox_faux"></span>
                                                                        <span className="slds-form-element__label">Person Account</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <div className="slds-checkbox">
                                                                    <input
                                                                        id="contact_is_account"
                                                                        type="checkbox"
                                                                        name="contact_is_account"
                                                                        onChange={(e) => {
                                                                           /* this.setState({ account_accordian: true }) */
                                                                            this.onChange('contact_is_account', e)}}
                                                                        checked={this.state.contact_is_account ? true : false}
                                                                        disabled={!this.state.person_account || (this.state.account_type == 2) ? true : false}
                                                                    />
                                                                    <label className="slds-checkbox__label" for="contact_is_account">
                                                                        <span className="slds-checkbox_faux"></span>
                                                                        <span className="slds-form-element__label">Contact is account</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {
                                                             this.state.contact_is_account != true && 
                                                            <>
                                                        <div className="slds-form-element">
                                                            <label className="slds-form-element__label" for="org_name">
                                                                <abbr className="slds-required" title="required">* </abbr>Account Name</label>
                                                            <div className="slds-form-element__control">
                                                                <input
                                                                    name="org_name"
                                                                    type="text"
                                                                    id="org_name"
                                                                    value={this.state.org_name}
                                                                    maxLength={100}
                                                                    onChange={(e) => handleChange(this, e)}
                                                                    placeholder="Account Name"
                                                                    required={true}
                                                                    className="slds-input"
                                                                    disabled={this.state.account_type == 1 ? false : true}
                                                                />
                                                            </div>

                                                        </div>
                                                        </> }
                                                        {
                                                         !this.state.account_accordian &&
                                                            <>
                                                          {
                                                             this.state.contact_is_account != true &&  this.state.person_account === true &&
                                                            <>
                                                                <div className="slds-form-element">
                                                                    <label className="slds-form-element__label" for="email">
                                                                        Email</label>
                                                                    <div className="slds-form-element__control">
                                                                            <input
                                                                                name="email_account"
                                                                                type="text"
                                                                                id="email_account"
                                                                                value={this.state.email_account}
                                                                                maxLength={100}
                                                                                onChange={(e) => handleChange(this, e)}
                                                                                placeholder="Email"
                                                                                data-rule-email="true"
                                                                                className="slds-input"
                                                                                
                                                                            />
                                                                        </div>
                                                            
                                                                </div>
                                                                <div className="slds-form-element">
                                                                    <label className="slds-form-element__label" for="ndis_number">
                                                                        NDIS</label>
                                                                    <div className="slds-form-element__control">
                                                                            <input
                                                                                name="ndis_number"
                                                                                type="text"
                                                                                id="ndis_number"
                                                                                value={this.state.ndis_number}
                                                                                maxLength={100}
                                                                                placeholder="NDIS number"
                                                                                className="slds-input"
                                                                                data-rule-valid_ndis="true"
                                                                                data-msg-valid_ndis="Please enter a correct NDIS number"
                                                                                onChange={e => {
                                                                                    if(!isNaN(e.target.value))
                                                                                    {
                                                                                        this.setState({ ndis_number: e.target.value });
                                                                                    }
                                                                                }}
                                                                                maxLength="9"
                                                                                
                                                                            />
                                                                        </div>
                                                    
                                                                 </div>
                                                                 <div className="slds-form-element">
                                                                    <label className="slds-form-element__label" for="phone">
                                                                        Phone</label>
                                                                    <div className="slds-form-element__control">
                                                                            <input
                                                                                name="phone_account"
                                                                                type="text"
                                                                                id="phone_account"
                                                                                value={this.state.phone_account}
                                                                                maxLength={18}
                                                                                placeholder="Phone"
                                                                                className="slds-input"
                                                                                onChange={(e) => handleChange(this, e)}
                                                                                data-rule-phonenumber={true}
                                                                                data-msg-valid_ndis="Please enter a valid phone number"
                                                                                
                                                                                                                                                               
                                                                            />
                                                                        </div>
                                                    
                                                                </div>  
                                                            </> }
                                                        </> }
                                                        {
                                                            this.state.contact_is_account === true &&  this.state.account_accordian &&
                                                            <>
                                                               <div className="slds-form-element">
                                                                    <label className="slds-form-element__label" for="last_name">
                                                                        Account Name</label>
                                                                    <div className="slds-form-element__control">
                                                                        <input
                                                                            name="org_name"
                                                                            type="text"
                                                                            id="org_name"
                                                                            value={this.state.org_name}
                                                                            maxLength={100}
                                                                            onChange={(e) => { this.onChange('org_name', e);
                                                                             this.setState({ org_name: e.target.value })
                                                                             }}
                                                                            placeholder="Account Name"
                                                                            className="slds-input"
                                                                            
                                                                        />
                                                                    </div>
                                                                 </div>

                                                            </>
                                                         }
                                                        {
                                                            !this.state.account_accordian &&
                                                            <>
                                                        {
                                                    this.state.contact_is_account === true && 
                                                    <>
                                                      
                                            
                                                    <div className="slds-form-element"> 
                                                            <label className="slds-form-element__label" for="first_name">
                                                            First Name</label>
                                                            <div className="slds-form-element__control">
                                                                <input
                                                                    name="first_name_account"
                                                                    type="text"
                                                                    id="first_name_account"
                                                                    value={this.state.first_name_account}
                                                                    maxLength={100}
                                                                    onChange={(e) => { this.onChange('first_name_account', e);
                                                                       this.setState({ first_name_account: e.target.value })
                                                                     }}
                                                                    placeholder="First Name"
                                                                    className="slds-input"
                                                                    disabled={!this.state.contact_is_account || !this.state.contact_type == 2 ? true : false}
                                                                />
                                                            </div>
                                                     </div>
                                                     <div className="slds-form-element">
                                                                    <label className="slds-form-element__label" for="last_name">
                                                                        Last Name</label>
                                                                    <div className="slds-form-element__control">
                                                                        <input
                                                                            name="last_name_account"
                                                                            type="text"
                                                                            id="last_name_account"
                                                                            value={this.state.last_name_account}
                                                                            maxLength={100}
                                                                            onChange={(e) => { this.onChange('last_name_account', e);
                                                                             this.setState({ last_name_account: e.target.value })
                                                                             }}
                                                                            placeholder="Last Name"
                                                                            className="slds-input"
                                                                            
                                                                        />
                                                                    </div>
                                                        </div>
                                                
                                                <div className="slds-form-element">
                                                        <label className="slds-form-element__label" for="email">
                                                            Email</label>
                                                        <div className="slds-form-element__control">
                                                                <input
                                                                    name="email_account"
                                                                    type="text"
                                                                    id="email_account"
                                                                    value={this.state.email_account}
                                                                    maxLength={100}
                                                                    onChange={(e) => handleChange(this, e)}
                                                                    placeholder="Email"
                                                                    data-rule-email="true"
                                                                    className="slds-input"
                                                                    
                                                                />
                                                            </div>
                                                    
                                                </div>
                                                <div className="slds-form-element">
                                                        <label className="slds-form-element__label" for="ndis_number">
                                                            NDIS</label>
                                                        <div className="slds-form-element__control">
                                                                <input
                                                                    name="ndis_number"
                                                                    type="text"
                                                                    id="ndis_number"
                                                                    value={this.state.ndis_number}
                                                                    maxLength={100}
                                                                    placeholder="NDIS number"
                                                                    className="slds-input"
                                                                    data-rule-valid_ndis="true"
                                                                    data-msg-valid_ndis="Please enter a correct NDIS number"
                                                                    onChange={e => {
                                                                        if(!isNaN(e.target.value))
                                                                        {
                                                                            this.setState({ ndis_number: e.target.value });
                                                                        }
                                                                    }}
                                                                    maxLength="9"
                                                                    
                                                                />
                                                            </div>
                                                    
                                                </div>
                                                <div className="slds-form-element">
                                                        <label className="slds-form-element__label" for="phone">
                                                            Phone</label>
                                                        <div className="slds-form-element__control">
                                                                <input
                                                                    name="phone_account"
                                                                    type="text"
                                                                    id="phone_account"
                                                                    value={this.state.phone_account}
                                                                    maxLength={18}
                                                                    placeholder="Phone"
                                                                    className="slds-input"
                                                                    onChange={(e) => handleChange(this, e)}
                                                                    data-rule-phonenumber={true}
                                                                    data-msg-valid_ndis="Please enter a valid phone number"
                                                                   
                                                                    
                                                                />
                                                            </div>
                                                    
                                                </div>  
                                                </>}

                                                
                                                                </> }
                                                
                                                    </div>

                                                    <div className="col-md-1" style={{ textAlign: "center" }}><span>or</span><div className="vertical_line_or mt-2" style={{ height: '105px' }}></div></div>

                                                    <div className="col-md-4">
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio">
                                                                    <input type="radio" id="choose_account"
                                                                        onChange={(e) => this.chooseExixtingNew(e)}
                                                                        value="2"
                                                                        name="account_type"
                                                                        checked={this.state.account_type == 2 ? true : false} />
                                                                    <label className="slds-radio__label" for="choose_account">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Choose Existing</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="slds-form-element choose_account_margin">
                                                            <label className="slds-form-element__label" for="org_name">
                                                                <abbr className="slds-required" title="required">* </abbr>Account Search:</label>
                                                            <div className="slds-form-element__control">
                                                                <SLDSReactSelect.Async clearable={false}
                                                                    className=" default_validation"
                                                                    value={this.state.exixting_org}
                                                                    cache={false}
                                                                    loadOptions={(val) => getOptionOfAccountName(val)}
                                                                    onChange={(evt) => this.handleChangeChooseExistingAccount(evt)}
                                                                    placeholder="Please Search"
                                                                    disabled={this.state.account_type == 2 ? false : true}
                                                                    required={true}
                                                                    name={"exixting_org"}
                                                                    optionComponent={GravatarOption}
                                                                    filterOptions={selectFilterOptions}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </IconSettings>
                                    


                                    <div className="row">
                                        <div className="col-lg-12 col-md-12"><div className="bt-1" style={{ borderColor: "#dddbda" }}></div>
                                        </div>
                                    </div>

                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <div className={'row py-2'}>
                                            <div className={'px-4 expand-div'}>
                                                    <a onClick={() => this.setState({ contact_accordian: !this.state.contact_accordian }) }
                                                    onMouseOver={() => this.setState({ contact_accordian_hover: true }) }
                                                    onMouseLeave={() => this.setState({ contact_accordian_hover: false }) }
                                                    style={{
                                                        display: 'flex'
                                                    }}>
                                                        <span className={'pr-1'}>
                                                            <Icon
                                                                category="utility"
                                                                name={this.state.contact_accordian ? "chevronright" : "chevrondown"}
                                                                size="xx-small"
                                                                style={{
                                                                    color: this.state.contact_accordian_hover ? '#005fb2' : '#000'
                                                                }}
                                                            />
                                                        </span>                           
                                                        <h4 style={{
                                                                    color: this.state.contact_accordian_hover ? '#005fb2' : '#000'
                                                                }}>
                                                            Contact
                                                        </h4>
                                                    </a>
                                                </div> 
                                                <div className={'row pr-1'}>
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <div className="csform-group">
                                                            {/* <label className="mb-4 fs_16">Contact:</label> */}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 ">
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio">
                                                                    <input
                                                                        type="radio"
                                                                        name="contact_type"
                                                                        value="1"
                                                                        checked="true"
                                                                        id="new_contact_selection"
                                                                        onChange={(e) => this.chooseExixtingNew(e)}
                                                                        checked={this.state.contact_type == 1 ? true : false}
                                                                        //disabled={(this.state.contact_is_account || this.state.account_type == 1) ? true : false}
                                                                    />
                                                                    <label className="slds-radio__label" htmlFor="new_contact_selection">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Create New</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {
                                                            !this.state.contact_accordian &&
                                                            <>
                                                        <div className="slds-form-element"> 
                                                            <label className="slds-form-element__label" for="first_name">
                                                            First Name</label>
                                                            <div className="slds-form-element__control">
                                                                <input
                                                                    name="first_name_contact"
                                                                    type="text"
                                                                    id="first_name_contact"
                                                                    value={this.state.contact_is_account ? '':this.state.first_name_contact}
                                                                    maxLength={100}
                                                                    onChange={(e) => { this.onChange('first_name_contact', e);
                                                                       this.setState({ first_name_contact: e.target.value })
                                                                     }}
                                                                    
                                                                    placeholder="First Name"
                                                                    className="slds-input"
                                                                    disabled={this.state.contact_is_account || this.state.contact_type == 2 ? true : false}
                                                                    
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="slds-form-element">
                                                            <label className="slds-form-element__label" for="first_name">
                                                                Last Name</label>
                                                            <div className="slds-form-element__control">
                                                                <input type="text"
                                                                    name="last_name_contact"
                                                                    onChange={(e) => { this.onChange('last_name_contact', e);
                                                                       this.setState({ last_name_contact: e.target.value })
                                                                     }}
                                                                    value={this.state.contact_is_account ? '' :this.state.last_name_contact}
                                                                    required={true}
                                                                    maxLength={100}
                                                                    placeholder="Contact Name"
                                                                    required="true"
                                                                    className="slds-input"
                                                                    disabled={this.state.contact_is_account || this.state.contact_type == 2 ? true : false}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="slds-form-element">
                                                            <label className="slds-form-element__label" for="email">
                                                                Email</label>
                                                            <div className="slds-form-element__control">
                                                                    <input
                                                                        name="email_contact"
                                                                        type="text"
                                                                        id="email_contact"
                                                                        value={this.state.email_contact}
                                                                        maxLength={100}
                                                                        placeholder="Email"
                                                                        onChange={(e) => handleChange(this, e)}
                                                                        data-rule-email="true"
                                                                        className="slds-input"
                                                                        disabled={this.state.contact_is_account || this.state.contact_type == 2 ? true : false}
                                                                        
                                                                    />
                                                                </div>
                                                    
                                                        </div>
                                                        
                                                        <div className="slds-form-element">
                                                            <label className="slds-form-element__label" for="phone">
                                                                Phone</label>
                                                            <div className="slds-form-element__control">
                                                                    <input
                                                                        name="phone_contact"
                                                                        type="text"
                                                                        id="phone_contact"
                                                                       
                                                                        value={this.state.contact_is_account ? '' : this.state.phone_contact}
                                                                       
                                                                        maxLength={18}
                                                                        placeholder="Phone"
                                                                        onChange={(e) => handleChange(this, e)}
                                                                        className="slds-input"
                                                                        data-rule-phonenumber={true}
                                                                        data-msg-valid_ndis="Please enter a valid phone number"
                                                                        disabled={this.state.contact_is_account || this.state.contact_type == 2 ? true : false}
                                                                                                                                                
                                                                    />
                                                                </div>
                                                    
                                                        </div>
                                                        
                                                        </> }
                                                        {
                                                            this.state.contact_accordian &&
                                                            <>
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                   <input type="text"
                                                                    name="contact_name"
                                                                    
                                                                    onChange={(e) => { this.onChange('contact_name', e);
                                                                       this.setState({ contact_name: e.target.value })
                                                                     }}
                                                                    value={this.state.contact_name}
                                                                    required={true}
                                                                    maxLength={100}
                                                                    placeholder="Contact Name"
                                                                    required="true"
                                                                    className="slds-input"
                                                                    disabled={this.state.contact_is_account || this.state.contact_type == 2 ? true : false}
                                                                />
                                                            </div>
                                                        </div>
                                                        </> }
                                                        
                                                    </div>
                                                    
                                                    <div className="col-md-1" style={{ textAlign: "center" }}><span>or</span><div className="vertical_line_or mt-2" style={{ height: '30px' }}></div></div>

                                                    <div className="col-md-4 ">
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio">
                                                                    <input
                                                                        type="radio"
                                                                        name="contact_type"
                                                                        value="2"
                                                                        checked="true"
                                                                        id="exixting_contact_selection"
                                                                        onChange={(e) => this.chooseExixtingNew(e)}
                                                                        checked={this.state.contact_type == 2 ? true : false}
                                                                        //disabled={(this.state.contact_is_account || this.state.account_type == 1)? true : false}
                                                                    />
                                                                    <label className="slds-radio__label" htmlFor="exixting_contact_selection">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Choose Existing</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <SLDSReactSelect.Async clearable={false}
                                                                    className=" default_validation"
                                                                    value={this.state.exixting_contact}
                                                                    cache={false}
                                                                    loadOptions={(val) => getOptionOfContactName(val, this.state.exixting_org)}
                                                                    onChange={(evt) => this.setState({ "exixting_contact": evt })}
                                                                    placeholder="Please Search"
                                                                   disabled={(this.state.contact_is_account || this.state.contact_type == 1 || disabled_existing_contact)? true : false}
                                                                    required={true}
                                                                    name={"exixting_contact"}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> 
                                                


                                                </div> 

                                        </div> 
                                    
                                    </IconSettings>

                                    <div className="row">
                                        <div className="col-lg-12 col-md-12"><div className="bt-1" style={{ borderColor: "#dddbda" }}></div>
                                        </div>
                                    </div>

                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <div className={'row py-2'}>
                                        <div className={'px-4 expand-div'}>
                                                <a onClick={() => this.setState({ opp_accordian: !this.state.opp_accordian }) }
                                                onMouseOver={() => this.setState({ opp_accordian_hover: true }) }
                                                onMouseLeave={() => this.setState({ opp_accordian_hover: false }) }
                                                style={{
                                                    display: 'flex'
                                                }}>
                                                    <span className={'pr-1'}>
                                                        <Icon
                                                            category="utility"
                                                            name={this.state.opp_accordian ? "chevronright" : "chevrondown"}
                                                            size="xx-small"
                                                            style={{
                                                                color: this.state.opp_accordian_hover ? '#005fb2' : '#000'
                                                            }}
                                                        />
                                                    </span>                           
                                                    <h4 style={{
                                                                color: this.state.opp_accordian_hover ? '#005fb2' : '#000'
                                                            }}>
                                                        Opportunity
                                                    </h4>
                                                </a>
                                            </div> 
                                            <div className={'row pr-1'}>
                                            <div className="row mt-3 mb-3">
                                                    <div className="col-md-2">
                                                        <div className="csform-group">
                                                            {/* <label className="mb-4 fs_16">Opportunity:</label> */}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 ">
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio">
                                                                    <input type="radio" name="opportunity_type"
                                                                        id="new_opportunity_selection"
                                                                        onChange={(e) => this.chooseExixtingNew(e)}
                                                                        value="1"
                                                                        checked={this.state.opportunity_type == 1 ? true : false}
                                                                        //disabled={this.state.account_type == 1? true: false}
                                                                    />
                                                                    <label className="slds-radio__label" htmlFor="new_opportunity_selection">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Create New</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">                                                                
                                                                <SLDSSelect
                                                                    required={false} simpleValue={true}
                                                                    className="custom_select default_validation"
                                                                    options={this.state.lead_service_type_option}
                                                                    onChange={(value) => handleChangeSelectDatepicker(this, value, 'topic')}
                                                                    value={this.state.topic || ''}
                                                                    clearable={false}
                                                                    searchable={false}
                                                                    placeholder="Service Type"
                                                                    inputRenderer={(props) => <input type="text" name={"topic"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                                                    disabled={this.state.opportunity_type == 1 ? false : true}
                                                                />
                                                            </div>
                                                        </div>
                                                        {
                                                            !this.state.opp_accordian &&
                                                            <>

                                                        <div className="slds-form-element"> 
                                                            <label className="slds-form-element__label" for="first_name">
                                                            Type</label>
                                                            <div className="slds-form-element__control">
                                                             <SLDSReactSelect
                                                                required={true} simpleValue={true}
                                                                name="lead_source_code"
                                                                className="SLDS_custom_Select default_validation"
                                                                simpleValue={true}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                clearable={false}
                                                                options={this.state.opportunity_type_options}
                                                                onChange={(value) => this.handleChange(value, 'lead_source_code')}
                                                                value={this.state.lead_source_code || ''}
                                                            />
                                                            </div>
                                                        </div>
                                                          </>
                                                        }
                                                    </div>


                                                    <div className="col-md-1" style={{ textAlign: "center" }}><span>or</span><div className="vertical_line_or mt-2" style={{ height: '30px' }}></div></div>

                                                    <div className="col-md-4 ">
                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio">
                                                                    <input type="radio" name="opportunity_type" id="exixting_opportunity_selection"
                                                                        onChange={(e) => this.chooseExixtingNew(e)}
                                                                        value="2"
                                                                        checked={this.state.opportunity_type == 2 ? true : false}
                                                                        //disabled={this.state.account_type == 1? true: false}
                                                                    />
                                                                    <label className="slds-radio__label" htmlFor="exixting_opportunity_selection">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Choose Existing</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="slds-form-element">
                                                            <div className="slds-form-element__control">
                                                                <SLDSReactSelect.Async clearable={false}
                                                                    className=" default_validation"
                                                                    value={this.state.exixting_opportunity}
                                                                    cache={false}
                                                                    loadOptions={(val) => getOptionOfOpportunityName(val, this.state.exixting_org)}
                                                                    onChange={(evt) => this.setState({ "exixting_opportunity": evt })}
                                                                    placeholder="Please Search"
                                                                    disabled={this.state.opportunity_type == 2 && !disabled_existing_opportunity? false : true}
                                                                    required={true}
                                                                    name={"exixting_opportunity"}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>




                                            </div>

                                        </div>
                                    </IconSettings>

                                </form>
                            </div>
                        </section>
                    </Modal>
                </div>
            </IconSettings>
        )
    }
}

const mapStateToProps = state => ({
    activity_timeline: state.SalesActivityReducer.activity_timeline,
    activity_loading: state.SalesActivityReducer.activity_loading,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_sales_activity_data: (request) => dispatch(get_sales_activity_data(request)),
        setKeyValue: (request) => dispatch(setKeyValue(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ConvertLeadModal);
// export default ConvertLeadModal;