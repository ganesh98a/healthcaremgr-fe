import React, { Component } from 'react';
import jQuery from "jquery";
import ReactGoogleAutocomplete from 'components/admin/externl_component/ReactGoogleAutocomplete';
import 'react-select-plus/dist/react-select-plus.css';

import { checkItsNotLoggedIn, postData, toastMessageShow, css, handleChange, queryOptionData } from 'service/common.js';
import { Combobox, ExpandableSection } from '@salesforce/design-system-react';
import 'react-block-ui/style.css';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';

import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import Checkbox from '@salesforce/design-system-react/lib/components/checkbox';
import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'service/OcsConstant.js';
import '../../../organisation/organisation.scss';
import ComboList from '../../../oncallui-react-framework/input/ComboList';

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


class CreateAccountModel extends Component {
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
            service_area_options: [],
            cost_book_options: [],
            valid_abn: "pending",
            payable_email: '',
            payable_phone: '',
            org_service_type_option: [],
            org_service_type: '',
            account_name: '',
            service_area_id: '',
            all_service_area_options: [],
            service_area_selected_options: [],
            billing_same_as_parent:false,
            fetch_service_area: false
        }
    }

    /**
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
                        this.setState({ valid_abn: true, account_name: result.data.account_name },(data)=>{
                             if(!this.state.billing_same_as_parent){
                                this.setState({  invoice_to: result.data.account_name });
                             } 
                        });
                    } else {
                        this.setState({ valid_abn: false, account_name: '' });
                    }
                    this.setState({ search_abn_num: false })
                });
            }
        })
    }

    /**
     * when the org/account name is selected
     */
    onChangeAccountName = (e) => {
        this.setState({ abn: '', account_name: e.target.value });
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ invoice_to : e.target.value});
        }
    }

   
     /**
     * when the org/account name is selected
     */
      onChangeBillAccountName = (e) => {
        this.setState({ invoice_to : e.target.value});
       
    }

    onShippingAddressChange = (value) => {
        this.setState({ shipping_address: value });
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ billing_address :value});
        }
    }
   

    /**
     * when the parent account is selected
     */
     onParentAccountSelect = (evt) => {
        if(evt)
        {
            this.get_parentorganisationDetails(evt)
        }
       
        
    }

    handleShippingNumberChange=(value) => {
        this.setState({ shipping_unit_number : value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ billing_unit_number : value});
        }
        
    }
     
    handleShippingAddressChange=(value) => {
        this.setState({ shipping_address : value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ billing_address : value});
        }

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
            let sa_options = this.state.service_area_selected_options.map(opt => {
                return opt.value;
            })
            var req = { ...this.state, service_area_selected_options: sa_options }
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

    handlePrimaryPhoneFieldChange=(e)=>{
        this.setState({ primary_phone : e.target.value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ payable_phone : e.target.value});
        }
    }

    handlePrimaryEmailFieldChange=(e)=>{
        this.setState({ primary_email : e.target.value});
        if(!this.state.billing_same_as_parent)
        {
            this.setState({ payable_email : e.target.value});
        }
    }

    setBillingFromParent=()=>
    {
        let org_id = this.state.parent_org && this.state.parent_org["value"] || 0;
        if (org_id) {
            this.setState({loading: true});
            postData('sales/Account/get_organisation_details', { org_id }).then((result) => {
                if (result.status) {
                    this.setState({ 
                        loading: false,
                        invoice_to: result.data.invoice_to || "", 
                        payable_phone: result.data.payable_phone || "",
                        billing_address: result.data.billing_address || "",
                        payable_email: result.data.payable_email || "" ,
                        billing_unit_number: result.data.billing_unit_number || ""
                    });
                }
            });
        }
    }

    setBillingFromAccount=()=>
    {
        this.setState({ 
            invoice_to: this.state.invoice_to, 
            payable_phone: this.state.payable_phone ,
            payable_email:this.state.payable_email,
            billing_address:this.state.billing_address,
            billing_unit_number:this.state.billing_unit_number});

    }

    
    /**
     * fetching the active roles/service types list
     */
    get_next_site_no() {
        postData('sales/Account/get_next_site_no', { id: this.props.childorgprops.id }).then((result) => {
            if (result.status) {
                this.setState({ account_name: this.props.childorgprops.account_name + ' - Site ' + result.data });
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the active roles/service types list
     */
    get_service_area_list(parent_id = null) {
        let parent_org_id = this.props.childorgprops && this.props.childorgprops.id;
        postData('organisation/Organisation/get_service_area_list', {parent_org: parent_org_id}).then((result) => {
            if (result.status) {
                let service_area_options = result.data["org_service_area_options"];
                if (parent_id === 0) {
                    service_area_options = result.data["all_service_area_options"];
                }
                this.setState({ service_area_options, all_service_area_options: result.data["all_service_area_options"] });
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

    /**
     * mounting all the components
     */
    componentDidMount() {        
        this.getOptionsOrganisationSource();
        this.getOptionsOrganisationServiceType();
        this.get_cost_book_options();
        this.setState({ is_site: this.props.add_site });
        if (this.props.add_site == 1) {
            this.get_next_site_no();
        }

        if (this.props.org_id) {
            this.get_organisationDetails(this.props.org_id);
        }

        this.get_service_area_list(this.props.childorgprops.id>0? this.props.childorgprops.id : 0);
        
        if (this.props.childorgprops && this.props.childorgprops.id) {
            this.setState({ parent_org: { "label": this.props.childorgprops.account_name, "value": this.props.childorgprops.id } });

        }
    }

    componentDidUpdate(props, state) {
        if (this.props.fetch_service_area === true && this.state.fetch_service_area === false) {
            this.setState({fetch_service_area: true}, () => {
                if (this.state.parent_org) {
                    this.getParentOrgOptions(this.state.parent_org);
                }
            });
        }
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
        postData('sales/Account/get_organisation_details', { org_id }).then((result) => {
            if (result.status) {
                let service_area_options = this.state.service_area_options;
                if (result.data.parent_org != "0" && result.data["parent_org_service_area_options"]) {
                    service_area_options = result.data["parent_org_service_area_options"];
                }
                this.setState({...result.data, service_area_options, all_service_area_options: service_area_options}, () => {
                    if (this.state.parent_org != 0) {
                        this.get_service_area_list();
                         this.setState({ 
                        org_parent_account_name: result.data.invoice_to,
                        org_parent_primary_phone:result.data.payable_phone,
                        org_parent_shipping_address:result.data.billing_address,
                        org_parent_primary_email: result.data.payable_email,
                        org_shipping_unit_number:result.data.billing_unit_number});
                    } 
                });
               this.setState({billing_same_as_parent:result.data.billing_same_as_parent==0?false:true})
                }
                
            else {
                toastMessageShow(result.error, "e");
            }

        });
    }

    /**
     * fetching the organisation details
     */
     get_parentorganisationDetails = (org_id) => {
        postData('sales/Account/get_organisation_details', { org_id }).then((result) => {
        if (result.status) {
                this.setState({
                        org_parent_account_name: result.data.account_name,
                        org_parent_shipping_address:!result.data.billing_address?'':result.data.billing_address,
                       org_parent_primary_email:!result.data.payable_email?'':result.data.payable_email,
                        org_parent_primary_phone:!result.data.payable_phone?'':result.data.payable_phone,
                        org_shipping_unit_number:!result.data.billing_unit_number?'':result.data.billing_unit_number},()=>{
                         if(this.state.billing_same_as_parent)
                         {
                                    this.setBillingFromParent(); 
                         } });
                } else {
                    toastMessageShow(result.error, "e");
                }
    
            });
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
                                        onChange={(evt) => this.getParentOrgOptions(evt)}
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
                        {this.state.is_site == 0 ? <div className="col-lg-6 col-sm-6 ">
                            <div className="slds-form-element ">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" > </abbr>ABN/ACN</label>
                                <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                                    <svg class="slds-input__icon" aria-hidden="true">
                                        {this.state.valid_abn !== "pending" && !this.state.search_abn_num ?
                                            (this.state.valid_abn === true ?
                                                <use style={{ fill: '#04844b' }} href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use> :
                                                <use style={{ fill: '#c23934' }} href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#error"></use>
                                            ) : (this.state.search_abn_num ? <use style={{ fill: '#c1c1c1' }} href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#spinner"></use> : '')
                                        }

                                    </svg>
                                    <div className="slds-form-element__control">
                                        <input type="text"
                                            disabled={false}
                                            className="slds-input"
                                            name="abn"
                                            placeholder="ABN/ACN"
                                            onChange={(e) => this.onCHangeAbnAcnNumber(e)}
                                            value={this.state.abn || ''}
                                            maxLength="15"
                                            pattern={REGULAR_EXPRESSION_FOR_NUMBERS}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div> : ''}
                    </div>
                    <div className="row py-2">
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Service Area</label>
                                <div className="slds-form-element__control">
                                    <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                        <Combobox
                                            id="service_area_selected_options"
                                            name="service_area_selected_options"
                                            className="SLDS_custom_Select default_validation"
                                            simpleValue={true}
                                            searchable={true}
                                            placeholder="Please Select"
                                            clearable={false}
                                            options={this.getServiceAreaOptions()}
                                            predefinedOptionsOnly
                                            events={{
                                                onChange: (event, { value }) => {
                                                    this.setState({ service_area_selected_ids: value });
                                                },
                                                onRequestRemoveSelectedOption: (event, data) => {
                                                    let selection = data.selection || [];
                                                    let sa_options = this.state.all_service_area_options;
                                                    let not_selected = [];
                                                    sa_options.map(sao => {
                                                        let exist = false;
                                                        selection.map(saso => {
                                                            if (saso.value == sao.value) {
                                                                exist = true;
                                                            }
                                                        })
                                                        if( exist === false ) {
                                                            not_selected.push(sao);
                                                        }
                                                    })
                                                    this.setState({service_area_options: not_selected}, () => {
                                                        this.setState({
                                                            service_area_selected_ids: '',
                                                            service_area_selected_options: data.selection,
                                                        });
                                                    });
                                                },
                                                onSubmit: (event, { value }) => {
                                                    this.setState({
                                                        service_area_selected_ids: '',
                                                        service_area_selected_options: [
                                                            ...this.state['service_area_selected_options'],
                                                            {
                                                                label: value
                                                            },
                                                        ],
                                                    });
                                                },
                                                onSelect: (event, data) => {
                                                    let selection = data.selection || [];
                                                    let sa_options = this.state.service_area_options;
                                                    let not_selected = [];
                                                    sa_options.map(sao => {
                                                        let exist = false;
                                                        selection.map(saso => {
                                                            if (saso.value == sao.value) {
                                                                exist = true;
                                                            }
                                                        })
                                                        if( exist === false ) {
                                                            not_selected.push(sao);
                                                        }
                                                    })
                                                    this.setState({service_area_options: not_selected}, () => {
                                                        this.setState({
                                                            service_area_selected_ids: '',
                                                            service_area_selected_options: selection                                                            
                                                        });
                                                    });
                                                },
                                            }}

                                            menuMaxWidth="500px"
                                            menuItemVisibleLength={5}
                                            multiple
                                            selection={this.state['service_area_selected_options']}
                                            required={!this.state.service_area_selected_options.length}
                                        />
                                    </div>
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
                                        {!this.state.is_secondary_phone && <div  style={{height: "30px", color: "rgb(221, 219, 218)", cursor: "pointer", marginTop: "16px"}} className="btn_0_type" onClick={(e) => this.setState({'is_secondary_phone': true})}>
                                                                <i className="icon icon-add-icons Add-1" ></i>
                                                            </div>}
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
                                        {!this.state.is_secondary_email && <div style={{height: "30px", color: "rgb(221, 219, 218)", cursor: "pointer", marginTop: "16px"}} className="btn_0_type" onClick={(e) => this.setState({'is_secondary_email': true})}>
                                                                <i className="icon icon-add-icons Add-1" ></i>
                                                            </div>}
                                        
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
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required"></abbr>Website</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="website"
                                        placeholder="Website"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.website || ''}
                                        maxLength="200"
                                        className="slds-input"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="row py-2">
                        {this.state.is_site == 0 ? <div className="col-lg-6 col-sm-6">
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
                        </div> : ''}
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >DHHS</label>
                                <div className="slds-form-element__control">
                                    <Checkbox
                                        assistiveText={{
                                            label: '',
                                        }}
                                        id="dhhs"
                                        labels={{
                                            label: '',
                                        }}
                                        checked={this.state.dhhs == "1"}
                                        name="dhhs"
                                        onChange={(e) => handleChange(this, e)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ExpandableSection>
        )
    }

    getParentOrgOptions(option) {
        let org_id = option && option.value || 0;
        if (org_id) {
            this.onParentAccountSelect(org_id);
            postData('sales/Account/get_organisation_service_area', { id: org_id }).then((result) => {
                if (result.status) {
                    this.setState( {all_service_area_options: result.data, service_area_options: result.data, service_area_selected_options: []});
                } else {
                    toastMessageShow(result.error, "e");
                }

            });
        } else {
            this.setState({billing_same_as_parent: false});
            this.get_service_area_list();
        }
        this.setState({ "parent_org": option, service_area_selected_options: [] })
    }

    /**
     * rendering billing information
     */
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
                    heading={this.props.org_id ? "Update Organisation" : "Create Organisation"}
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

    getServiceAreaOptions() {
        let sa_options = [];
        if (this.state.service_area_selected_options.length) {
            this.state.service_area_options.map(sa_option => {
                let exist = false;
                this.state.service_area_selected_options.map(ssao => {
                    if (ssao.value === sa_option.value ) {
                        exist = true;
                    }
                })
                if (!exist) {
                    sa_options.push(sa_option);
                }
            })
        } else {
            sa_options = this.state.service_area_options;
        }
        return sa_options;
    }
}

export default CreateAccountModel;