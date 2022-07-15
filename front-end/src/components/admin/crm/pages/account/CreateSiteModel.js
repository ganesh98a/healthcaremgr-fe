import React, { Component } from 'react';
import jQuery from "jquery";
import ReactGoogleAutocomplete from 'components/admin/externl_component/ReactGoogleAutocomplete';
import 'react-select-plus/dist/react-select-plus.css';

import { checkItsNotLoggedIn, postData, toastMessageShow, css, handleChange, queryOptionData } from 'service/common.js';
import { ExpandableSection }from '@salesforce/design-system-react';
import 'react-block-ui/style.css';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';

import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
/**
 * based on the keyword, searching and listing the parent account options
 */
const getOptionOfParantAccount = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Account/get_option_of_account", { search: e, type: 'organisation' }).then(json => {
        if (json.status) {
            return { options: json.data };
        } else {
            return { options: [] };
        }

    });
}

const styles = css({
    root: {
        fontFamily: `Salesforce Sans, Arial, Helvetica, sans-serif`,
        zIndex: 12,
    },
    backdrop: {
        zIndex: 11,
    },
})


class CreateSiteModel extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            redirectPage: false,
            parent_org: this.props.parent_org,
            is_site: '',
            cost_book_id: null,
            status: 1,
            role_options: [],
            cost_book_options: [],
            valid_abn: "pending",
            payable_email: '',
            payable_phone: '',
            org_service_type_option: [],
            org_service_type: '',
            account_name: '',
            role_id: '',
            billing_same_as_parent:false,
            service_area_selected_options:[],
            mapped_sa_and_swa:[],
            filtered_sa_and_swa:[],
            support_worker_area_options:[]
        }
    }

    /**service_area_selected_options
     * when ABN/ACN is searched
     */
    onCHangeAbnAcnNumber = (e) => {
        var value = e.target.value.trim()

        if (e != undefined && e.target.pattern) {
            const re = eval(e.target.pattern);
            if (e.target.value != "" && !re.test(e.target.value)) {
                return;
            }
        }

        this.setState({ abn: value }, () => {
            if (value === "") {
                this.setState({ valid_abn: "pending" });
                return false;
            }
            var search = false;

            if (this.state.abn.length == 9) {
                search = true;
            } else if (this.state.abn.length == 11) {
                search = true;
            } else {
                this.setState({ valid_abn: false });
            }

            if (this.state.requestedMethod) {
                this.state.requestedMethod.abort();
                this.setState({ search_abn_num: false })
            }


            if (search) {
                this.setState({ search_abn_num: true })
                postData("sales/Account/get_abn_acn_number_on_base_search", { search: this.state.abn }, this).then(result => {
                    if (result.status) {
                        this.setState({ valid_abn: true, account_name: result.data.account_name });
                    } else {
                        this.setState({ valid_abn: false, account_name: '' });
                    }
                    this.setState({ search_abn_num: false })
                });
            }
        })
    }

    
    /**
     * fetching the active roles/service types list
     */
     get_service_area_list() {
        postData('organisation/Organisation/get_service_area_list', {parent_org: this.props.childorgprops && this.props.childorgprops.id}).then((result) => {
            if (result.status) {
                this.setState({ service_area_options: result.data["org_service_area_options"], all_service_area_options: result.data["all_service_area_options"] });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    /**
     * fetching the active roles/service types list
     */
        get_mapped_sa_and_swa() {
            postData('sales/Account/get_mapped_sa_and_swa').then((result) => {
                if (result.length>0) {
                    this.setState({ mapped_sa_and_swa: result });
                } else {
                    toastMessageShow('API ERROR', "e");
                }
            });
        }
    /**
     * when the org/account name is selected
     */
    onChangeAccountName = (e) => {
        this.setState({ abn: '', account_name: e.target.value,invoice_to:e.target.value});
    }

    /**
     * when billing address is asked to be same as shipping
     */
     sameAsParentOrg = (e) => {
        if (e.target.checked) {
            this.setState({billing_same_as_parent: true})
            this.setBillingFromParent();   
        } else {
            this.setState({billing_same_as_parent: false})
            //this.setBillingFromAccount();
        }
    }



    handleShippingAddressChange=(value) => {
        this.setState({ shipping_address : value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ billing_address : value});
        }

    }

    setBillingFromParent=()=>
    {
        this.setState({ 
            invoice_to: this.state.org_parent_account_name, 
            payable_phone:this.state.org_parent_primary_phone,
            billing_address:this.state.org_parent_shipping_address,
            payable_email: this.state.org_parent_primary_email ,
            billing_unit_number:this.state.org_shipping_unit_number});
    }
        /**
     * when the org/account name is selected
     */
     onChangeBillAccountName = (e) => {
         this.setState({ invoice_to : e.target.value});
           
    }
    
    /**
     * when the add/edit form is submitted
     */
    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#create_org").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (this.state.valid_abn === false) {
            toastMessageShow("Please provide valid ABN/ACN number", "e");
            return;
        }

        if (!this.state.loading && jQuery("#create_org").valid()) {
            this.setState({ loading: true });

            var req = { ...this.state }
            postData('sales/Account/create_organisation', req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }

    /**
     * when billing address is asked to be same as shipping
     */
    sameAsShippingAddress = (e) => {
        if (e.target.checked) {
            this.setState({ billing_same_as_shipping: true, billing_address: this.state.shipping_address, billing_unit_number: this.state.shipping_unit_number });
        } else {
            this.setState({ billing_same_as_shipping: false, billing_address: '', billing_unit_number: '' });
        }
    }

    /**
     * fetching the active roles/service types list
     */
    get_next_site_no() {
        postData('sales/Account/get_next_site_no', { id: this.props.childorgprops.id }).then((result) => {
            if (result.status) {
                this.setState({ account_name: this.props.childorgprops.account_name + ' - Site ' + result.data ,invoice_to:this.props.childorgprops.account_name + ' - Site ' + result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the active roles/service types list
     */
    get_role_list() {
        postData('item/MemberRole/get_active_role_list').then((result) => {
            if (result.status) {
                this.setState({ role_options: result.data });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the active cost book options list
     */
    get_cost_book_options() {
        postData('common/get_cost_book_options').then((result) => {
            if (result.status) {
                this.setState({ cost_book_options: result.data });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
     
    handlePrimaryEmailFieldChange=(e)=>{
        this.setState({ primary_email : e.target.value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ payable_email : e.target.value});
        }
    }

    handleShippingNumberChange=(value) => {
        this.setState({ shipping_unit_number : value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ billing_unit_number : value});
        }
        
    }
     

    service_area_selection_handler(value)
    {

        let service_area_options=[];
        service_area_options[0]=value;
        this.setState({ 'service_area_id': value ,service_area_selected_options:service_area_options});
        if(value>0)
        {
            let filterSupportWorker=[...this.state.mapped_sa_and_swa];
            const supportWorkerOptions=[];
            const sa_result=filterSupportWorker.filter((res,index)=>{
                if( res.service_area==value)
                {
                supportWorkerOptions.push({'value':res.support_worker_area,
                                              'label':res.support_worker_area_label});
                    return res;
                }
               
            })
            if(supportWorkerOptions.length > 1){
                supportWorkerOptions.splice(0, 0, {label: "Please Select", value: ""});
            }
           this.setState({support_worker_area_options:supportWorkerOptions,selected_swa: supportWorkerOptions && supportWorkerOptions.length && supportWorkerOptions[0]['value']})
        }
    }
  

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_role_list();
        this.get_service_area_list();
        this.get_mapped_sa_and_swa();
        this.getOptionsOrganisationSource();
        this.getOptionsOrganisationServiceType();
        this.get_cost_book_options();
        this.setState({ is_site: this.props.add_site });
        if (this.props.add_site == 1) {
            this.get_next_site_no();
        }
        if (this.props.childorgprops && this.props.childorgprops.id) {
            this.setState({ parent_org: { "label": this.props.childorgprops.account_name, "value": this.props.childorgprops.id } }
            ,()=>{
                if(Object.keys(this.state.parent_org).length>0){
                    this.get_parent_org_service_area();
                    this.get_parentorganisationDetails(this.props.childorgprops.id);
                }
            });

        }
        if (this.props.org_id) {
            this.get_organisationDetails(this.props.org_id);
            
        }
        
        
    }

           /**
     * fetching the organisation details
     */
    get_parentorganisationDetails = (org_id) => {
        this.setState({loading: true});
        postData('sales/Account/get_organisation_details', { org_id }).then((result) => {
            if (result.status) {
                this.setState({
                org_parent_account_name: result.data.account_name,
                 org_parent_shipping_address:!result.data.billing_address?'':result.data.billing_address,
                 org_parent_primary_email:!result.data.payable_email?'':result.data.payable_email,
                 org_parent_primary_phone:!result.data.payable_phone?'':result.data.payable_phone,
                org_shipping_unit_number:!result.data.billing_unit_number?'':result.data.billing_unit_number,
                loading: false},()=>{
                    if(this.state.billing_same_as_parent==1)
                     {
                      this.setBillingFromParent(); 
                     } });
                    } else {
                        toastMessageShow(result.error, "e");
                    }
        
                });
            }

  /**
     * fetching the active roles/service types list
     */
   get_parent_org_service_area() {
    postData('sales/Account/get_organisation_service_area', { id: this.state.parent_org.value }).then((result) => {
        if (result.status) {
            this.setState( {service_area_options: result.data});
        } else {
            toastMessageShow(result.error, "e");
        }

    });
}
    /**
     * fetching the list of organisation source
     */
    getOptionsOrganisationSource = () => {
        queryOptionData(1, "sales/Account/get_organization_source").then((res) => { this.setState({ org_type_option: res.options }) });
    }

    /**
    *
    * @param {*} org_id
    */
    getOptionsOrganisationServiceType = () => {
        queryOptionData(1, "sales/Account/get_organization_service_type").then((res) => { this.setState({ org_service_type_option: res.options }) });
    }

    /**
     * fetching the organisation details
     */
    get_organisationDetails = (org_id) => {
        this.setState({loading: true});
        postData('sales/Account/get_organisation_details', { org_id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
                if(result.data.service_area_selected_options.length>0){
                   if(result.data.service_area_selected_options.length>0)
                   {
                    this.setState(
                        {service_area_id:result.data.service_area_selected_options[0]['value']},()=>{
                            this.service_area_selection_handler(this.state.service_area_id)
                        })
                   }
                   if(result.data.selected_support_area_worker.length>0){
                    this.setState(
                        {selected_swa:result.data.selected_support_area_worker[0]['value']}
                    );
                   }
                   this.setState({billing_same_as_parent:result.data.billing_same_as_parent==0?false:true})
                }
                    if(Object.keys(result.data.parent_org).length>0)
                    {
                      
                        this.get_parentorganisationDetails(result.data.parent_org['value']);
                    }
                
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({loading: false});
        });
    }

    handlePrimaryPhoneFieldChange=(e)=>{
        this.setState({ primary_phone : e.target.value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ payable_phone : e.target.value});
        }
    }

    /**
     * rendering account information
     */
    renderAccountInformation() {
        return (
            <ExpandableSection id="default-expandable-section" title="Account Information">
                <div className="container-fluid">                   

                    <div className="row py-2">
                    <div className="col-lg-6 col-sm-6 ">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">Status</label>
                                <div className="slds-form-element__control">
                                    <div className="">
                                        <SLDSReactSelect
                                            name="view_by_status"
                                            className="SLDS_custom_Select default_validation"
                                            simpleValue={true}
                                            searchable={false}
                                            placeholder="Please Select"
                                            clearable={false}
                                            options={[{ value: "0", label: "Inactive" }, { value: "1", label: "Active" }]}
                                            onChange={(e) => this.setState({ 'status': e })}
                                            value={this.state.status}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                

                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">{this.state.is_site == 1 ? <abbr className="slds-required" title="required">* </abbr> : ''}Parent Account</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async clearable={false}
                                        className="SLDS_custom_Select default_validation"
                                        value={this.state.parent_org}
                                        cache={false}
                                        required={this.state.is_site == 1 ? true : false}
                                        loadOptions={(val) => getOptionOfParantAccount(val)}
                                        onChange={(evt) => this.setState({ "parent_org": evt })}
                                        placeholder="Please Search"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row py-2">
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Account Name</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        className="slds-input"
                                        type="text"
                                        name="account_name"
                                        placeholder="Account Name"
                                        disabled={this.state.valid_abn === true ? true : false}
                                        onChange={(e) => this.onChangeAccountName(e)}
                                        value={this.state.account_name || ''}
                                        required={true}
                                    />
                                </div>
                            </div>
                        </div> 
                      
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Service Area</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect
                                        name="service_area_id"
                                        className="SLDS_custom_Select default_validation"
                                        simpleValue={true}
                                        searchable={true}
                                        placeholder="Please Select"
                                        clearable={false}
                                        required={true}
                                        options={this.state.service_area_options}
                                        onChange={(e) => this.service_area_selection_handler(e)}
                                        value={this.state.service_area_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Preferred Support Worker Area</label>
                                <div className="slds-form-element__control">
                                <SLDSReactSelect
                                        name="support_worker_area_options"
                                        className="SLDS_custom_Select default_validation"
                                        simpleValue={true}
                                        searchable={true}
                                        placeholder="Please Select"
                                        clearable={false}
                                        required={true}
                                        options={this.state.support_worker_area_options}
                                        onChange={(e) => this.setState({'selected_swa':e})}
                                        value={this.state.selected_swa}
                                    />
                                </div>
                            </div>
                        </div>
     
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    Apartment/Unit number</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="shipping_unit_number"
                                        placeholder="Apartment/Unit number"
                                        onChange={(e) => this.handleShippingNumberChange(e.target.value)}
                                        value={this.state.shipping_unit_number || ''}
                                        maxLength="30"
                                        className="slds-input"
                                    />
                                </div>
                            </div>
                        </div>

                      
                    </div>

                    <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" ><abbr className="slds-required" title="required">* </abbr>Shipping Address</label>
                                <div className="slds-form-element__control">
                                <ReactGoogleAutocomplete className="slds-input add_input mb-1"
                                        placeholder="street, suburb state postcode, Country"
                                        name={"Shipping Address"}
                                        onPlaceSelected={(place) => this.handleShippingAddressChange(place.formatted_address)}
                                        types={['address']}
                                        returntype={'array'}
                                        value={this.state.shipping_address || ''}
                                        onChange={(evt) => this.handleShippingAddressChange(evt.target.value)}
                                        onKeyDown={(evt) => this.handleShippingAddressChange(evt.target.value)}
                                        required={true}
                                        componentRestrictions={{ country: "au" }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >Phone</label>                     
                                    <div className="slds-form-element__control mb-1 input_plus__">
                                        <input type="text" name="primary_phone" style={{float: "left"}}
                                            placeholder="Phone"
                                            onChange={(e) => this.handlePrimaryPhoneFieldChange(e)}
                                            value={this.state.primary_phone || ''}
                                            data-rule-phonenumber={true}
                                            className="slds-input"
                                        />
                                        <div  style={{height: "30px", color: "rgb(221, 219, 218)", cursor: "pointer", marginTop: "16px"}} className="btn_0_type" onClick={(e) => this.setState({'is_secondary_phone': true})}>
                                                                <i className="icon icon-add-icons Add-1" ></i>
                                                            </div>
                                    </div>
                                    {this.state.is_secondary_phone ?
                                        <div style={{marginTop: "35px"}} className="slds-form-element__control mb-1 input_plus__">
                                            <input type="text" style={{float: "left"}}
                                        name="secondary_phone"
                                        placeholder="Secondary Phone"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.secondary_phone || ''}
                                        maxLength="100"
                                        className="slds-input" 
                                    />
                                    <div className="btn_0_type"  style={{height: "30px", color: "rgb(221, 219, 218)", cursor: "pointer", marginTop: "16px"}} onClick={(e) => this.setState({'is_secondary_phone': false})}>
                                                                <i className="icon icon-decrease-icon Add-2" ></i>
                                                            </div>
                                    </div> : ''
                                    }
                            </div>
                        </div>

        
                    </div>
                    <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >Email</label>
                                    <div className="slds-form-element__control mb-1 input_plus__">
                                        <input style={{background: "transparent", float: "left"}} type="text"
                                            name="primary_email"
                                            placeholder="Primary email"
                                            onChange={(e) => this.handlePrimaryEmailFieldChange(e)}
                                            value={this.state.primary_email || ''}
                                            maxLength="100"
                                            className="slds-input" 
                                        />
                                        <div style={{height: "30px", color: "rgb(221, 219, 218)", cursor: "pointer", marginTop: "16px"}} className="btn_0_type" onClick={(e) => this.setState({'is_secondary_email': true})}>
                                                                <i className="icon icon-add-icons Add-1" ></i>
                                                            </div>
                                        
                                    </div>
                                    {this.state.is_secondary_email ?
                                        <div style={{marginTop: "35px"}} className="slds-form-element__control mb-1 input_plus__">
                                            <input type="text" style={{float: "left"}}
                                                name="secondary_email"
                                                placeholder="Secondary email"
                                                onChange={(e) => handleChange(this, e)}
                                                value={this.state.secondary_email || ''}
                                                maxLength="100"
                                                className="slds-input" 
                                            />
                                            <div style={{height: "30px", color: "rgb(221, 219, 218)", cursor: "pointer", marginTop: "16px"}} className="btn_0_type" onClick={(e) => this.setState({'is_secondary_email': false})}>
                                                                <i className="icon icon-decrease-icon Add-2" ></i>
                                                            </div>
                                        </div> : ''
                                    }
                            </div>
                        </div>
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >Fax</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="fax"
                                        placeholder="Fax"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.fax || ''}
                                        maxLength="100"
                                        className="slds-input" />
                                </div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </ExpandableSection>
        )
    }

    renderBillingInformation() {
        return (
            <ExpandableSection id="default-expandable-section" title="Billing Information">
                <div className="container-fluid">
                    <div className="row py-2">
                   {this.state.parent_org&&this.state.parent_org['value']>0&&( <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <div className="slds-form-element__control">
                            <div className="slds-checkbox">
                                        <input type="checkbox" id="check_preferred_phone" name="check_preferred_phone" onChange={(e) => this.sameAsParentOrg(e)} checked={this.state.billing_same_as_parent ? true : false} />
                                        <label className="slds-checkbox__label" htmlFor="check_preferred_phone">
                                            <span className="slds-checkbox_faux"></span>
                                            <span className="slds-form-element__label">Same as Parent Organisation</span>
                                        </label>
                                    </div>
                            </div>
                        </div>
                    </div>)}

                        </div>
                    <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                <abbr className="slds-required" title="required">* </abbr>Invoice To</label>
                            <div className="slds-form-element__control">
                                <input type="text"
                                disabled={this.state.billing_same_as_parent}
                                    className="slds-input"
                                    type="text"
                                    name="invoice_to"
                                    placeholder="Invoice To"
                                    onChange={(e) => this.onChangeBillAccountName(e)}
                                    value={this.state.invoice_to || ''}
                                    required={true}
                                />
                            </div>
                        </div>
                    </div>

                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">

                                <label className="slds-form-element__label" ><abbr className="slds-required" title="required">* </abbr>Accounts Payable Phone</label>
                                <div className="slds-form-element__control">
                                    <input type="text" name="payable_phone"
                                        placeholder="Can include area code"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.payable_phone || ''}
                                        data-rule-phonenumber={true}
                                        className="slds-input"
                                        disabled={this.state.billing_same_as_parent}
                                        maxLength="18"
                                        required={true}
                                        data-rule-phonenumber={true}
                                    />
                                </div>
                            </div>
                        </div>

                     
                    </div>
                    <div className="row py-2">
                    <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" ><abbr className="slds-required" title="required">* </abbr>Accounts Payable Email</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="payable_email"
                                        placeholder="Account Payable Email"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.payable_email||''}
                                        maxLength="100"
                                        required={true}
                                        disabled={this.state.billing_same_as_parent}
                                        className="slds-input"
                                        data-rule-email="true"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    Apartment/Unit number</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="billing_unit_number"
                                        placeholder="Apartment/Unit number"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.billing_unit_number || ''}
                                        maxLength="200"
                                        disabled={this.state.billing_same_as_parent}
                                        className="slds-input"
                                    />
                                </div>
                            </div>
                        </div>
                    
                    </div>
                    <div className="row py-2">
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" ><abbr className="slds-required" title="required">* </abbr>Billing Address</label>
                                <div className="slds-form-element__control">
                                    <ReactGoogleAutocomplete className="slds-input add_input mb-1"
                                        placeholder="street, suburb state postcode, Country"
                                        name={"Billing Address"}
                                        onPlaceSelected={(place) => this.setState({ billing_address: place.formatted_address })}
                                        types={['address']}
                                        returntype={'array'}
                                        required={true}
                                        disabled={this.state.billing_same_as_parent}
                                        value={this.state.billing_address ||''}
                                        onChange={(evt) => this.setState({ billing_address: evt.target.value })}
                                        onKeyDown={(evt) => this.setState({ billing_address: evt.target.value })}
                                        componentRestrictions={{ country: "au" }}
                                    />
                                </div>
                                </div>
                                </div>
                            
                    </div>
                </div>
            </ExpandableSection>
        )
    }


    /**
     * rendering components
     */
    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={this.props.org_id && this.state.is_site == 1 ? "Update Site" :  "Add Site" }
                    size="small"
                    className="slds_custom_modal"
                    onRequestClose={() => this.props.closeModal(false)}
                    dismissOnClickOutside={false}
                >
                    <section className="manage_top" >
                        <form id="create_org" autoComplete="off" className="slds_form">
                            {this.renderAccountInformation()}
                            {this.renderBillingInformation()}
                        </form>
                    </section>
                </Modal>
            </IconSettings>
        );
    }
}

export default CreateSiteModel;