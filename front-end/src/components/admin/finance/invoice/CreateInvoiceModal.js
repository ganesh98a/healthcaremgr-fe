import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, queryOptionDataAddNewEntity, selectFilterOptions, css } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    Input,
    IconSettings
} from '@salesforce/design-system-react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { SLDSISODatePicker } from '../../salesforce/lightning/SLDSISODatePicker';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable';
const queryString = require('query-string');

/**
 * to fetch the account contacts as user types
 */
const getOptionsAccountPersonName = (e,invoice_type, data) => {
    return queryOptionData(e, "finance/FinanceDashboard/account_participant_name_search", { skip_sites: true, query: e,invoice_type }, 2, 1);
}

/**
 * to fetch the contacts as user types
 */
const getContactPersonName = (e, data) => {
    return queryOptionDataAddNewEntity(e, "sales/Opportunity/get_contact_list_for_opportunity", { query: e, limit: 20 }, 2, 1);
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
        var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
        var className = "slds-icon-standard-contact";
        if(this.props.option.value=='new contact'){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#add";
            className = "slds-icon-standard-add";
        }
        else if(this.props.option.account_type==2 && this.props.option.is_site==0){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account";
            className = "slds-icon-standard-account";
        }
        else if(this.props.option.account_type==2 && this.props.option.is_site==1){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#household";
            className = "slds-icon-standard-household";
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
                                <svg class="slds-icon slds-icon_small" aria-hidden="true" style={{ fill : this.props.option.value !='new contact' ? '':'#000' } }>
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

/**
 * Class: CreateInvoiceModel
 */
class CreateInvoiceModel extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "id": true,
            "shift_no": true,
            "account_fullname": true,
            "member_fullname": true,
            "actual_start_datetime": true,
            "actual_end_datetime": true,
            "scheduled_duration" : true
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            show_shifts: false,
            invoice_id: this.props.id ? this.props.id : '',
            invoice_no: '',
            account_person: '',
            amount: 0.00,
            invoice_date: '',
            enable_sites: false,
            header_checkbox: false,
            allsites_checkbox: false,
            account_contacts: [],
            contact_id: '',
            invoice_sites: [],
            site_id: '',
            account_sites: [],
            account_shifts: [],
            invoice_shifts: [],
            start_date: '',
            end_date: '',
            status: '0',
            invoice_type: '1',
            status_options: [],
            invoice_type_options: [],
            ndis_invoice_type_id:null,
            service_agreement_payment: '',
            service_agreement_id: '',
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            invoice_date: React.createRef(),
            start_date: React.createRef(),
            end_date: React.createRef()
        }
    }

    /**
     * fetching the service agreement details if the user changed the account
     */
     get_service_agreement = (e) => {
        postData('finance/FinanceDashboard/get_service_agreement_by_participant', { account: e }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the invoice details if the modal is opened in the edit mode
     */
    get_invoice_details = (id) => {
        postData('finance/FinanceDashboard/get_invoice_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
                this.get_account_contacts_selection(result.data.account_person);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the reference data of invoices
     */
    get_invoice_ref_data = () => {
        postData("finance/FinanceDashboard/get_invoice_ref_data").then((result) => {
            if (result.status) {
                if(result.data.invoice_type_options){
                    let ndisId=result.data.invoice_type_options.find(res=>res.label=='NDIS');
                    this.setState({ndis_invoice_type_id:ndisId['value']});
                }
                this.setState(result.data)
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * when shifts checkboxes are clicked inside the form
     */
    handleShiftsCheckbox = (e, checkid) => {
        let tempArr = [...this.state.invoice_shifts];
        if(checkid == undefined) {
            this.state.account_shifts.map((row) => {
                var index = tempArr.indexOf(row.id);
                if(e.target.checked == true) {
                    this.setState({header_checkbox: true});
                    if(index == -1) {
                        tempArr.push(row.id);
                    }
                }
                else if (index > -1) {
                    this.setState({header_checkbox: false});
                    tempArr.splice(index, 1);
                }
            });
        }
        else {
            var index = tempArr.indexOf(checkid);
            if(e.target.checked == true) {
                if(index == -1) {
                    tempArr.push(checkid);
                }
            }
            else if (index > -1) {
                this.setState({header_checkbox: false});
                tempArr.splice(index, 1);
            }
        }
        this.setState({invoice_shifts: tempArr});
        if(tempArr.length == this.state.account_shifts.length) {
            this.setState({header_checkbox: true});
        }
    }

    /**
     * handling the change event of the data picker fields
     */
    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState)
    }

    /**
     * tinker with internal Datepicker state to
     * fix calendar toggling issue with multiple datepickers
     */
    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }
    
    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        if(key=='invoice_type'){
           if((value!=this.state.ndis_invoice_type_id&&this.state.invoice_type==this.state.ndis_invoice_type_id)||(value==this.state.ndis_invoice_type_id&&this.state.invoice_type!==this.state.ndis_invoice_type_id))
           {
             this.setState({account_person:'',contact_id:''});
           }
        }
        this.setState({ [key]: value });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true, invoice_date: moment().format('YYYY-MM-DD 00:00:00') });
        this.get_invoice_ref_data();
        if(this.props.id) {
            this.setState({ invoice_id: this.props.id });
            this.get_invoice_details(this.props.id);
        }
        this.setState({ loading: false });
    }
    /**
     * when the account is selected
     */
    on_account_selected = (e) => {
        var enable_sites = false;
        this.setState({ account_person: e, changedValue: true, service_agreement_id: '', service_agreement_payment: '', account_shifts: [], invoice_shifts: [], header_checkbox: false, site_id: '' });
        if(e && e.account_type == 2) {
            enable_sites = true;
            this.get_account_sites_selection(e);
        }
         
        if(e && e.account_type == 1) {
            this.get_service_agreement(e);
        }

        if (e) {
            this.get_account_contacts_selection(e);
        }

        this.setState({ enable_sites: enable_sites });
    }

    /**
     * fetching list of sites of the selected org/suborg
     */
    get_account_sites_selection = (e) => {
        postData("sales/Account/get_account_sites_selection", {account_id: e.value}).then((res) => {
			if (res.status) {
				this.setState({ 
					account_sites: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * fetching list of contacts of the selected account
     */
    get_account_contacts_selection = (e) => {
        postData("sales/Account/get_account_contacts_selection", {account_id: e.value, account_type: e.account_type}).then((res) => {
			if (res.status) {
                if(!this.state.account_id) {
                    this.setState({ 
                        account_contacts: (res.data)?res.data:[],
                        contact_id: (res.contact_id) ? res.contact_id:''
                    });
                }
                else {
                    this.setState({ 
                        account_contacts: (res.data)?res.data:[]
                    });
                }
			}
		});
    }

    /**
     * showing account shifts for selection
     */
    get_paid_non_invoice_shifts = (e) => {
        e.preventDefault();
        jQuery("#create_invoice").validate({ /* */ });        
        var validator = jQuery("#create_invoice").validate({ ignore: [] });
        
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#create_invoice").valid()) {
            this.setState({ loading: true, show_shifts: false });
            var req = {
                account_id: (this.state.account_person) ? this.state.account_person.value : '',
                account_type: (this.state.account_person) ? this.state.account_person.account_type : '',
                start_date: this.state.start_date ? moment(this.state.start_date).format('YYYY-MM-DD') : '',
                end_date: this.state.end_date ? moment(this.state.end_date).format('YYYY-MM-DD') : '',
                invoice_sites: this.state.site_id ? [this.state.site_id] : ''
            };
            // Call Api
            postData('schedule/ScheduleDashboard/get_paid_non_invoice_shifts', req).then((result) => {
                if (result.status) {
                    this.setState({ loading: false, show_shifts: true, account_shifts: result.data });
                } else {
                    // Trigger error pop 
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });       
        }
    }

    /**
     * Calling the API to create/update the invoice
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_invoice").validate({ /* */ });        
        var url = 'finance/FinanceDashboard/create_update_invoice';
        var validator = jQuery("#create_invoice").validate({ ignore: [] });
        
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#create_invoice").valid()) {

            if(this.state.invoice_shifts.length <= 0) {
                toastMessageShow("Please select at least one shift to include in the invoice", "e");
                return false;
            }
            console.log(this.state);

            this.setState({ loading: true });
            var req = {
                id: this.state.invoice_id,
                invoice_no: this.state.invoice_no,
                invoice_type: this.state.invoice_type,
                status: this.state.status,
                amount: this.state.amount,
                account_id: (this.state.account_person) ? this.state.account_person.value : '',
                account_type: (this.state.account_person) ? this.state.account_person.account_type : '',
                invoice_date: this.state.invoice_date ? moment(this.state.invoice_date).format('YYYY-MM-DD') : '',
                contact_id: this.state.contact_id,
                invoice_sites: this.state.invoice_sites,
                invoice_shifts: this.state.invoice_shifts,
                service_agreement_payment: this.state.service_agreement_payment,
                service_agreement_id: this.state.service_agreement_id,
                site_id: this.state.site_id,
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
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
     * rendering contact selection field
     */
    renderContactField() {
        return (
            <div className="col-lg-6 col-sm-6">
                <div className="slds-form-element">
                    <label className="slds-form-element__label" htmlFor="select-01">
                    <abbr className="slds-required" title="required">* </abbr>Contact</label>
                    <div className="slds-form-element__control">
                        <SLDSReactSelect
                            simpleValue={true}
                            className="custom_select default_validation"
                            options={this.state.account_contacts}
                            onChange={(value) => this.handleChange(value, 'contact_id')}
                            value={this.state.contact_id >= 0 ? this.state.contact_id : ''}
                            clearable={false}
                            searchable={true}
                            placeholder="Please Select"
                            required={true}
                            name="Account Contacts"
                        />
                    </div>
                </div>
            </div>
        )
    }

    /**
     * rendering account selection field
     */
    renderAccountField() {
        return (
            this.state.invoice_type_options.length>0&&  ( <div className="col-lg-6 col-sm-6">
                <label className="slds-form-element__label" >
                    <abbr className="slds-required" title="required">* </abbr>Account (Participant/Org) Name
                </label>
                <div className="slds-form-element">
                    <SLDSReactSelect.Async clearable={false}
                        className="SLDS_custom_Select default_validation"
                        value={this.state.account_person}
                        disabled={this.state.invoice_id ? true : false}
                        cache={false}
                        loadOptions={(e) => getOptionsAccountPersonName(e, this.state.invoice_type_options[this.state.invoice_type-1],[])}
                        onChange={(e) => this.on_account_selected(e)} 
                        placeholder="Please Search"
                        required={true} 
                        disabled={this.state.invoice_type >= 0?false:true}
                        optionComponent={GravatarOption}
                    />
                </div>
            </div>)
        )
    }

    /**
     * rendering the main form
     */
    RenderAddEditForm() {
        let servicePaymentType = <React.Fragment />;
        if (this.state.service_agreement_payment && this.state.service_agreement_payment.label) {
            servicePaymentType = <span className="mr-4">Payment Type: {this.state.service_agreement_payment.label}</span>
        }

        return (
            <form id="create_invoice" autoComplete="off" className="slds_form">
                <div className="container-fluid">
                    <div className="row py-2">
                   { this.props.id&&(  <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >Invoice No: </label>
                                <div className="slds-form-element__control">
                                {this.state.invoice_no || ''}
                                </div>
                            </div>
                        </div>)}
                        {!this.state.invoice_id ? <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Invoice Type</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.invoice_type_options}
                                            onChange={(value) => this.handleChange(value, 'invoice_type')}
                                            value={this.state.invoice_type >= 0 ? this.state.invoice_type : ''}
                                            clearable={false}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Invoice Type"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div> : ''}
                    </div>

                    {this.state.invoice_id ? <div className="row py-2">
                        {this.renderAccountField()}
                        {this.renderContactField()}
                    </div> : ''}

                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Invoice Date</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSISODatePicker
                                            ref={this.datepickers.invoice_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="customer_signed_date"
                                            placeholder="Start Date"
                                            onChange={this.handleChangeDatePicker('invoice_date')}
                                            onOpen={this.handleDatePickerOpened('invoice_date')}
                                            value={this.state.invoice_date}
                                            input={<Input name="invoice_date"/>}
                                            inputProps={{
                                                name: "invoice_date",
                                                required: true
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Status</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.status_options}
                                            onChange={(value) => this.handleChange(value, 'status')}
                                            value={this.state.status >= 0 ? this.state.status : ''}
                                            clearable={false}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Invoices Category"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!this.state.invoice_id ? <div className="row py-2">
                        {this.renderAccountField()}
                        {this.state.enable_sites ? <div className="col-lg-6 col-sm-6">
                            <label className="slds-form-element__label" >Site</label>
                            <div className="slds-form-element">
                                <SLDSReactSelect
                                    simpleValue={true}
                                    className="custom_select default_validation"
                                    options={this.state.account_sites}
                                    onChange={(value) => this.handleChange(value, 'site_id')}
                                    value={this.state.site_id >= 0 ? this.state.site_id : ''}
                                    clearable={true}
                                    searchable={true}
                                    placeholder="Please Select"
                                    required={false}
                                    name="Account Contacts"
                                />
                            </div>
                        </div> : ''}
                    </div> : ''}

                    {!this.state.invoice_id ? 
                    <div className="row py-2">
                        {this.renderContactField()}
                    </div> : ''}

                    {!this.state.invoice_id ? <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                Start Date</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSISODatePicker
                                            ref={this.datepickers.start_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="customer_signed_date"
                                            placeholder="Start Date"
                                            onChange={this.handleChangeDatePicker('start_date')}
                                            onOpen={this.handleDatePickerOpened('start_date')}
                                            value={this.state.start_date}
                                            input={<Input name="start_date"/>}
                                            inputProps={{
                                                name: "start_date",
                                                required: false
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                End Date</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSISODatePicker
                                            ref={this.datepickers.end_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="customer_signed_date"
                                            placeholder="Start Date"
                                            onChange={this.handleChangeDatePicker('end_date')}
                                            onOpen={this.handleDatePickerOpened('end_date')}
                                            value={this.state.end_date}
                                            input={<Input name="end_date"/>}
                                            inputProps={{
                                                name: "end_date",
                                                required: false
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : ''}

                    {!this.state.invoice_id ? <div className="row py-2">

                        <div className="col-sm-12 text-right">
                            {servicePaymentType}                            
                            <Button disabled={this.state.loading} key={0} label="Show Shifts" onClick={this.get_paid_non_invoice_shifts} />
                        </div>
                    </div> : <div className="row py-4"></div>}
                </div>
            </form>
        )
    }
    
    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "id",
                id: 'id',
                Header: () =>  {
                    let disabled = false;
                    if (this.state.service_agreement_payment && this.state.service_agreement_payment.value === '1' && Number(this.state.invoice_type) === 4) {
                        disabled = true;
                    }
                    return (
                        <div style={{width:'1.5rem'}} className="slds-checkbox">
                            <input type="checkbox" name="header_checkbox" id="header_checkbox" onChange={(e) => this.handleShiftsCheckbox(e)} checked={this.state.header_checkbox} disabled={disabled}/>
                            <label className="slds-checkbox__label" htmlFor="header_checkbox">
                                <span className="slds-checkbox_faux"></span>
                            </label>
                        </div>
                    )
                },
                    sortable: false,
                width:'1.5rem',
                Cell: props => {
                    var checkid = props.value;
                    var check_index = this.state.invoice_shifts.indexOf(checkid);
                    var checked = (check_index == -1) ? false : true;
                    var disabled = false;
                    if (this.state.service_agreement_payment && this.state.service_agreement_payment.value === '1' && this.state.invoice_shifts.length > 0 && checked === false && Number(this.state.invoice_type) === 4) {
                        disabled = true;
                    }
                    return (
                    <div className="slds-checkbox">
                        <input type="checkbox" name={checkid} id=
                        {checkid} onChange={(e) => this.handleShiftsCheckbox(e, checkid)} checked={checked} disabled={disabled}/>
                        <label className="slds-checkbox__label" htmlFor={checkid}>
                            <span className="slds-checkbox_faux"></span>
                        </label>
                    </div>
                    )
                }
            },
            {
                _label: 'Shift',
                accessor: "shift_no",
                id: 'shift_no',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link to={ROUTER_PATH + 'admin/schedule/details/' + props.original.id} className="vcenter default-underlined slds-truncate"
                    style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Account',
                accessor: "account_fullname",
                id: 'account_fullname',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => props.original.account_type == 2 ? <Link to={ROUTER_PATH + 'admin/crm/organisation/details/' + props.original.account_id} className="vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }}>{props.value}</Link> : <Link to={ROUTER_PATH + 'admin/item/participant/details/' + props.original.account_id} className="vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }}>{props.value}</Link>
            },
            {
                _label: 'Member',
                accessor: "member_fullname",
                id: 'member_fullname',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link to={ROUTER_PATH + 'admin/support_worker/details/' + props.original.member_id} className="vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }}>{props.value}</Link>
            },
            {
                _label: 'Start date time',
                accessor: "actual_start_datetime",
                id: 'actual_start_datetime',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</span>
            },
            {
                _label: 'End date time',
                accessor: "actual_end_datetime",
                id: 'actual_end_datetime',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</span>
            }
        ]
    }

    /**
     * rendering components
     */
    renderShiftsTable() {
        this.defualtFilter = queryString.parse(window.location.search);

        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0);

        return (
            <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <SLDSReactTable
                        PaginationComponent={() => false}
                        ref={this.reactTable}
                        manual="true"
                        loading={this.state.loading}
                        columns={displayedColumns}
                        data={this.state.account_shifts}
                        defaultPageSize={9999}
                        minRows={1}
                        getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                        noDataText="No records Found"
                        collapseOnDataChange={true} 
                        resizable={true} 
                    />
                </IconSettings>
                <div className="row pl-3 py-2">{this.state.invoice_shifts.length} {(this.state.invoice_shifts.length) > 1 ? " shifts" : " shift"} selected</div>
            </div>
        );
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
                            <Button disabled={this.state.loading} key={1} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={2} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.id ? "Update Invoice" : "Create New Invoice"}
                        size="medium"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            {this.RenderAddEditForm()}
                            {this.state.show_shifts ? this.renderShiftsTable() : ''}
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateInvoiceModel;
