import React, { Component } from 'react';
import jQuery from "jquery";
import _ from 'lodash'
import ReactGoogleAutocomplete from 'components/admin/externl_component/ReactGoogleAutocomplete';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { BASE_URL, ROUTER_PATH } from 'config.js';
import { checkItsNotLoggedIn, postData, toastMessageShow, css, queryOptionData, handleChangeSelectDatepicker, handleShareholderNameChange, getOptionsSuburb, googleAddressFillOnState, checkLoginWithReturnTrueFalse, getPermission, handleChange } from 'service/common.js';
import { Link, Redirect } from 'react-router-dom';
import CrmPage from 'components/admin/crm/CrmPage';
import 'react-block-ui/style.css';
import BlockUi from 'react-block-ui';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import { SLDSISODatePicker, SLDSISODateOfBirthPicker } from '../../../salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';
import { get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { Modal, Button, IconSettings } from '@salesforce/design-system-react';
import UserAvatar from '../../../oncallui-react-framework/view/UserAvatar';
import {getAgeByDateOfBirth} from '../../../oncallui-react-framework/services/common';
import moment from "moment";
class CreateContactModel extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            isFetching: false,
            redirectPage: false,
            email: [],
            PhoneInput: [{ phone: '' }],
            EmailInput: [{ email: '' }],
            contact_type_option: [],
            stateList: [],
            source_option: [],
            original_ndis_number: '',
            ndis_number: '',
            aboriginal: 0,
            communication_method: 0,
            date_of_birth: '',
			date_of_birth_error: '',
            religion: '',
            cultural_practices: '',
            status: "1",
            callAjax: false,
            gender_option: [],
            interpreter: '',
            is_manual_address: false,
            manual_address: ''
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            date_of_birth: React.createRef(),
        }

        this.formRef = React.createRef()
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
    }

    getOptionForCreateContact = () => {
        postData('sales/Contact/get_option_for_create_contact', {}).then((result) => {
            if (result.status) {
                this.setState(result.data);
            }
        });
    }

    getContactDetails = () => {
        this.setState({ isFetching: true, callAjax: true })
        postData('sales/Contact/get_contact_details', { contactId: this.props.contactId }).then((result) => {
            if (result.status) {
                var det = result.data;
                this.setState(result.data);
                if (result.data && result.data.contact_address) {
                    this.setState(result.data.contact_address);
                }

                if (det.PhoneInput.length === 0) {
                    this.setState({ PhoneInput: [{ phone: '' }] })
                }

                if (det.EmailInput.length === 0) {
                    this.setState({ EmailInput: [{ email: '' }] })
                }

                if(det.date_of_birth){
                    this.setAgeByDOB(det.date_of_birth);
                }else{
                    this.setState({age: ''})
                }

                this.setState({ original_ndis_number: _.get(result.data, 'ndis_number', '') })
            }
        }).finally(() => this.setState({ isFetching: false }))
    }

    handleAddShareholder = (e, tagType) => {
        e.preventDefault();
        if (tagType === 'PhoneInput') {
            this.setState({ PhoneInput: this.state.PhoneInput.concat([{ name: '' }]) });
        } else {
            this.setState({ EmailInput: this.state.EmailInput.concat([{ name: '' }]) });
        }
    }

    handleRemoveShareholder = (e, idx, tagType) => {
        e.preventDefault();
        if (tagType === 'PhoneInput') {
            this.setState({ PhoneInput: this.state.PhoneInput.filter((s, sidx) => idx !== sidx) });
        } else {
            this.setState({ EmailInput: this.state.EmailInput.filter((s, sidx) => idx !== sidx) });
        }
    }

    //dateError gives us whether given date is valid or not, 0 -> no error, 1 -> error
	//formattedObject gives us Object 
    handleChangeDatePicker = key => (dateYmdHis, e, data, dateError, formattedObject) => {
        let newState = {};
        newState[key] = dateYmdHis;
		this.setState(newState);
		
		//if this function will use for another date, explicitly check key so other date don't change age.
		if(key == 'date_of_birth'){
			if(dateError == 0){
				this.setAgeByDOB(dateYmdHis);
			} else {
				this.setState({age: ''});
			}
		}
		
		let errorClass = (dateError == 1 && formattedObject.formattedDate !='') ? 'slds-has-error' : '';
		newState = {};
		newState[key+'_error'] = errorClass;
        this.setState(newState); 
    }

    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    setAgeByDOB = (dateYmdHis) => {
        let ageVal = getAgeByDateOfBirth(dateYmdHis)          
        this.setState({age: ageVal});
    }

    componentDidMount() {
        this.getOptionForCreateContact();
        if (this.props.contactId) {
            this.getContactDetails();
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery(this.formRef.current).validate({ /* */ });
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery(this.formRef.current).valid() && this.state.date_of_birth_error == '') {
            this.setState({ loading: true });

            var account_person = this.props.account_person || '';
            var req = { ...this.state, contactId: this.props.contactId, account_person: account_person }
            /*if (!this.shouldAllowSavingNDIS(req)) {
                req.ndis_number = req.original_ndis_number
                delete req.original_ndis_number
            }*/
            postData('sales/Contact/create_update_contact', req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(result.msg, 's');
                    if (this.props.is_manage_contact_role) {
                        this.getContactById(result.contactId)
                    } else {
                        this.props.closeModal(true);
                    }


                    // fetch contact list for email activity recipients
                    this.props.get_contact_name_search_for_email_act({ salesId: this.props.contactId, sales_type: 'contact', type: 'own' });
                    this.props.get_contact_name_search_for_email_act({ salesId: this.props.contactId, sales_type: 'contact', type: 'all' });
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }

    getContactById = (id) => {
        postData('sales/Contact/get_contact_details_by_id', { contactId: id }).then((result) => {
            if (result.status) {
                console.log(result);
                this.setState(result.data);
                this.props.closeModal(true, result.data)
            }
        })
    }

    handleChange = (value, key) => {
        this.setState({ [key]: value }, () => {
            if (this.state.validation_calls) {
                jQuery("#create_user").valid()
            }
        })
    }

    /**
     * Determines if the current user is able to edit the NDIS number with the following rules:
     * * admins can always edit
     * * if contact is not yet created, assignment of NDIS number is permitted
     * @param {*} state
     */
    canEditNDIS(state) {
        if (state.loading) return false;

        if (this.permission.access_crm_admin || !state.id) return true;

        return false;
    }

    render() {
        var status_option = [{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]

        const styles = css({
            emailFieldLabel: {
                whiteSpace: 'nowrap',
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 5,
            }
        });
        return (
            <div>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.showModal}
                            footer={[
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                                <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading={this.props.contactId ? "Update Contact" : "Create Contact"}
                            size="small"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeModal(false)}
                            dismissOnClickOutside={false}
                        >
                            <section className="manage_top" >
                                <div className="container-fluid">
                                    <form id="create_user" autoComplete="off" className="slds_form" ref={this.formRef} style={{ paddingBottom: 100, display: 'block' }}>
                                        <div className="row py-3">
                                            <div className="col-lg-4 col-sm-4">
                                                <div class="slds-form-element">
                                                    <UserAvatar avatar={this.state.avatar || ""} onUpdateAvatar={data => this.setState({ avatar: data })} />
                                                </div>
                                            </div>
                                            <div className="col-lg-8 col-sm-8">
                                                <div className="row py-2">
                                                    <div className="col-lg-6 col-sm-6">
                                                        <div class="slds-form-element">
                                                            <label class="slds-form-element__label" for="text-input-id-1">
                                                                {/* <abbr class="slds-required" title="required">* </abbr>First Name</label> */}
                                                                <abbr class="slds-required"></abbr>First Name</label>
                                                            <div class="slds-form-element__control">
                                                                <input type="text"
                                                                    class="slds-input"
                                                                    name="firstname"
                                                                    placeholder="First Name"
                                                                    onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'firstname')}
                                                                    value={this.state.firstname || ''}
                                                                    maxLength="40" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-6">
                                                        <div class="slds-form-element">
                                                            <label class="slds-form-element__label" for="text-input-id-1">
                                                                <abbr class="slds-required"></abbr>Middle Name</label>
                                                            <div class="slds-form-element__control">
                                                                <input type="text"
                                                                    class="slds-input"
                                                                    type="text"
                                                                    name="middlename"
                                                                    placeholder="Middle Name"
                                                                    onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'middlename')}
                                                                    value={this.state.middlename || ''}
                                                                    maxLength="40"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="row py-2">
                                                    <div className="col-lg-6 col-sm-6">
                                                        <div class="slds-form-element">
                                                            <label class="slds-form-element__label" for="text-input-id-1">
                                                                {/* <abbr class="slds-required" title="required">* </abbr>First Name</label> */}
                                                                <abbr class="slds-required" title="required">* </abbr>Last Name</label>
                                                            <div class="slds-form-element__control">
                                                                <input type="text"
                                                                    class="slds-input"
                                                                    name="lastname"
                                                                    placeholder="Last Name"
                                                                    onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lastname')}
                                                                    value={this.state.lastname || ''}
                                                                    maxLength="40" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-6">
                                                        <div class="slds-form-element">
                                                            <label class="slds-form-element__label" for="text-input-id-1">
                                                                <abbr class="slds-required"></abbr>Previous Name</label>
                                                            <div class="slds-form-element__control">
                                                                <input type="text"
                                                                    class="slds-input"
                                                                    type="text"
                                                                    name="previous_name"
                                                                    placeholder="Previous Name"
                                                                    onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'previous_name')}
                                                                    value={this.state.previous_name || ''}
                                                                    maxLength="40"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="row py-2">
                                                    <div className="col-lg-4 col-sm-4">
                                                        <div class="slds-form-element">
                                                            <label class="slds-form-element__label" for="text-input-id-1">Gender</label>
                                                            <div className="slds-form-element__control">
                                                                <div className="">
                                                                    <SLDSReactSelect
                                                                        simpleValue={true}
                                                                        className="custom_select default_validation"
                                                                        options={this.state.gender_option}
                                                                        onChange={(value) => this.handleChange(value, 'gender')}
                                                                        value={this.state.gender || ''}
                                                                        clearable={true}
                                                                        searchable={false}
                                                                        placeholder="Please Select"
                                                                        name="gender"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div className="col-lg-4 col-sm-4">
                                                        <div class="slds-form-element">
                                                            <label className="slds-form-element__label" htmlFor="select-01">Date of Birth ('dd/mm/yyyy')</label>
                                                            <div className="slds-form-element__control">
                                                                <div className={[this.state.date_of_birth_error, "SLDS_date_picker_width"].join(' ')}>
                                                                    <SLDSISODateOfBirthPicker
                                                                        ref={this.datepickers.date_of_birth} // !important: this is needed by this custom SLDSISODatePicker
                                                                        className="customer_signed_date"
                                                                        placeholder="Date of Birth"
                                                                        onChange={this.handleChangeDatePicker('date_of_birth')}
                                                                        onOpen={this.handleDatePickerOpened('date_of_birth')}
                                                                        onClear={this.handleChangeDatePicker('date_of_birth')}
                                                                        value={this.state.date_of_birth}
                                                                        input={<Input name="date_of_birth" />}
                                                                        inputProps={{
                                                                            name: "date_of_birth",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="col-lg-4 col-sm-4">
                                                        <div class="slds-form-element">
                                                            <label className="slds-form-element__label" htmlFor="select-01">Age</label>
                                                            <div className="slds-form-element__control">
                                                                <input className="slds-input" type="text" name="age" placeholder="Age" disabled={true} value={this.state.age || ''} maxLength="3" />
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row py-2">
                                        <div className="col-lg-1 col-sm-1">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Phone</label>
                                                    {this.state.PhoneInput.map((PhoneInput, idx) => (
                                                        <div class="slds-form-element__control mb-1">
                                                            <input type="text"
                                                                class="slds-input distinctPhone"
                                                                name=""
                                                                placeholder="+61"
                                                                value={"+61"}
                                                                disabled={true}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-lg-5 col-sm-5">
                                                <div class="slds-form-element" style={{marginTop: "19px"}}>
                                                    {this.state.PhoneInput.map((PhoneInput, idx) => (
                                                        <div class="slds-form-element__control mb-1 input_plus__">
                                                            <input type="text"
                                                                class="slds-input distinctPhone"
                                                                name={'phone_' + idx}
                                                                placeholder="04XXXXXXXX"
                                                                onChange={(e) => {
                                                                    if (!isNaN(e.target.value)) {
                                                                        handleShareholderNameChange(this, 'PhoneInput', idx, 'phone', e.target.value)
                                                                    }
                                                                }
                                                                }
                                                                maxlength="10"
                                                                phoneMinLength="10"
                                                                data-rule-phonenumber={true}
                                                                value={PhoneInput.phone}
                                                                data-rule-notequaltogroup='[".distinctPhone"]'
                                                                data-msg-notequaltogroup='Please enter uniqe phone number'
                                                                data-msg-required="Add Phone Number"
                                                            />

                                                            {idx > 0 ? <div className="btn_0_type" style={{ height: "30px", color: "#dddbda", cursor: "pointer" }} onClick={(e) => this.handleRemoveShareholder(e, idx, 'PhoneInput')}>
                                                                <i className="icon icon-decrease-icon Add-2" ></i>
                                                            </div> : (this.state.PhoneInput.length == 3) ? '' : <div style={{ height: "30px", color: "#dddbda", cursor: "pointer" }} className="btn_0_type" onClick={(e) => this.handleAddShareholder(e, 'PhoneInput')}>
                                                                <i className="icon icon-add-icons Add-1" ></i>
                                                            </div>}
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Email</label>
                                                    {this.state.EmailInput.map((EmailInput, idx) => (
                                                        <div class="slds-form-element__control mb-1 input_plus__">
                                                            <input type="text"
                                                                class="slds-input distinctEmail"
                                                                value={EmailInput.email || ''}
                                                                name={'email_' + idx}
                                                                placeholder={idx > 0 ? 'Secondary email' : 'Primary Email'}
                                                                onChange={(e) => handleShareholderNameChange(this, 'EmailInput', idx, 'email', e.target.value)}
                                                                data-rule-email="true"
                                                                data-rule-notequaltogroup='[".distinctEmail"]'
                                                                maxLength="100"
                                                            />

                                                            {idx > 0 ? <div className="btn_0_type" style={{ height: "30px", color: "#dddbda", cursor: "pointer" }} onClick={(e) => this.handleRemoveShareholder(e, idx, 'EmailInput')}>
                                                                <i className="icon icon-decrease-icon Add-2" ></i>
                                                            </div> : (this.state.EmailInput.length == 3) ? '' : <div style={{ height: "30px", color: "#dddbda", cursor: "pointer" }} className="btn_0_type" onClick={(e) => this.handleAddShareholder(e, 'EmailInput')}>
                                                                <i className="icon icon-add-icons Add-1" ></i>
                                                            </div>}
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Apartment/Unit number</label>
                                                    <div class="slds-form-element__control">
                                                        <input type="text"
                                                            class="slds-input"
                                                            type="text"
                                                            name="unit_number"
                                                            placeholder="Apartment/Unit number"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'unit_number')}
                                                            value={this.state.unit_number || ''}
                                                            maxLength="30"
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="col-lg-6 col-sm-6">

                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Address</label>
                                                    <div class="slds-form-element__control">
                                                        <ReactGoogleAutocomplete className="slds-input add_input mb-1"
                                                            placeholder="street, suburb state postcode"
                                                            name={"address_primary"}
                                                            onPlaceSelected={(place) => this.setState({ address: place.formatted_address })}
                                                            types={['address']}
                                                            returntype={'array'}
                                                            value={this.state.is_manual_address == 1 ? '' : (this.state.address || '')}
                                                            onChange={(evt) => this.setState({ address: evt.target.value })}
                                                            onKeyDown={(evt) => this.setState({ address: evt.target.value })}
                                                            componentRestrictions={{ country: "au" }}
                                                            disabled={this.state.is_manual_address==1 ? true : false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6"></div>
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <div className="slds-form-element__control">
                                                        <div className="slds-checkbox">
                                                            <input
                                                                id="is_manual_address"
                                                                type="checkbox"
                                                                name="is_manual_address"
                                                                onChange={(e) => {
                                                                    handleChange(this, e);
                                                                    if (!this.state.manual_address) {
                                                                        this.setState({ manual_address: '' });
                                                                    }
                                                                }}
                                                                checked={this.state.is_manual_address == 1 ? true : false}
                                                            />
                                                            <label className="slds-checkbox__label" for="is_manual_address">
                                                                <span className="slds-checkbox_faux"></span>
                                                                <span className="slds-form-element__label">Address did not show up</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Address (Manual Entry)</label>
                                                    <div class="slds-form-element__control">
                                                        <input type="text"
                                                            class="slds-input"
                                                            type="text"
                                                            name="manual_address"
                                                            placeholder="Manual Address"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'manual_address')}
                                                            value={this.state.is_manual_address == 0 ? '' : (this.state.manual_address==0 ? '' : this.state.manual_address)}
                                                            disabled={!this.state.is_manual_address}
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <div className="col-lg-6 col-sm-6">
                                                        <div className="slds-form-element">
                                                            <label className="slds-form-element__label" htmlFor="select-01">Is an interpreter required?</label>
                                                            <div className="slds-form-element__control">
                                                                <span className="slds-radio slds-float_left">
                                                                    <input type="radio" id="interpreter_2" value="2" name="interpreter" onChange={(e) => handleChange(this, e)} checked={(this.state.interpreter && this.state.interpreter == 2) ? true : false} />
                                                                    <label className="slds-radio__label" htmlFor="interpreter_2">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">Yes</span>
                                                                    </label>
                                                                </span>

                                                                <span className="slds-radio slds-float_left">
                                                                    <input type="radio" id="interpreter_1" value="1" name="interpreter" onChange={(e) => handleChange(this, e)} checked={(this.state.interpreter && this.state.interpreter == 1) ? true : false} />
                                                                    <label className="slds-radio__label" htmlFor="interpreter_1">
                                                                        <span className="slds-radio_faux"></span>
                                                                        <span className="slds-form-element__label">No</span>
                                                                    </label>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                        <div className="row py-2">

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">Preferred Communication Method</label>
                                                    <div className="slds-form-element__control">
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="communication_method_1" value="1" name="communication_method" onChange={(e) => handleChange(this, e)} checked={(this.state.communication_method && this.state.communication_method == 1) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="communication_method_1">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Phone</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="communication_method_2" value="2" name="communication_method" onChange={(e) => handleChange(this, e)} checked={(this.state.communication_method && this.state.communication_method == 2) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="communication_method_2">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Email</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="communication_method_3" value="3" name="communication_method" onChange={(e) => handleChange(this, e)} checked={(this.state.communication_method && this.state.communication_method == 3) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="communication_method_3">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Post</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="communication_method_4" value="4" name="communication_method" onChange={(e) => handleChange(this, e)} checked={(this.state.communication_method && this.state.communication_method == 4) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="communication_method_4">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">SMS</span>
                                                            </label>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-sm-6">

                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">Aboriginal or Torres Strait Islander heritage</label>
                                                    <div className="slds-form-element__control">
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="aboriginal_1" value="1" name="aboriginal" onChange={(e) => handleChange(this, e)} checked={(this.state.aboriginal && this.state.aboriginal == 1) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="aboriginal_1">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Aboriginal</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="aboriginal_2" value="2" name="aboriginal" onChange={(e) => handleChange(this, e)} checked={(this.state.aboriginal && this.state.aboriginal == 2) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="aboriginal_2">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Torres Strait Islander</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="aboriginal_3" value="3" name="aboriginal" onChange={(e) => handleChange(this, e)} checked={(this.state.aboriginal && this.state.aboriginal == 3) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="aboriginal_3">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Both</span>
                                                            </label>
                                                        </span>
                                                        <span className="slds-radio slds-float_left">
                                                            <input type="radio" id="aboriginal_4" value="4" name="aboriginal" onChange={(e) => handleChange(this, e)} checked={(this.state.aboriginal && this.state.aboriginal == 4) ? true : false} />
                                                            <label className="slds-radio__label" htmlFor="aboriginal_4">
                                                                <span className="slds-radio_faux"></span>
                                                                <span className="slds-form-element__label">Neither</span>
                                                            </label>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="row py-1">
                                            <div className="col-lg-6 col-sm-6">
                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Cultural Practices Observed</label>
                                                    <div class="slds-form-element__control">
                                                        <input type="text"
                                                            class="slds-input"
                                                            type="text"
                                                            name="cultural_practices"
                                                            placeholder="Cultural Practices Observed"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'cultural_practices')}
                                                            value={this.state.cultural_practices || ''}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">Type</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="">
                                                            <SLDSReactSelect
                                                                id="type"
                                                                simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.contact_type_option}
                                                                onChange={(value) => this.handleChange(value, 'contact_type')}
                                                                value={this.state.contact_type || ''}
                                                                clearable={true}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                name="type"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                        <div className="row py-1 mb-3">
                                            <div className="col-lg-6 col-sm-6">
                                                <label className="slds-form-element__label" htmlFor="CreateContactModal-ndis_number">
                                                    NDIS Number
                                                </label>
                                                <div className="slds-form-element__control" title={`Please enter a correct NDIS number`}>
                                                    <input
                                                        type="text"
                                                        className="slds-input"
                                                        name="CreateContactModal[ndis_number]"
                                                        id="CreateContactModal-ndis_number"
                                                        data-rule-valid_ndis="true"
                                                        data-msg-valid_ndis="Please enter a correct NDIS number"
                                                        value={this.state.ndis_number}
                                                        disabled={!this.canEditNDIS(this.state)}
                                                        onChange={e => {
                                                            if (!isNaN(e.target.value)) {
                                                                this.setState({ ndis_number: e.target.value });
                                                            }
                                                        }}
                                                        maxLength="9"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-sm-6">

                                                <div class="slds-form-element">
                                                    <label class="slds-form-element__label" for="text-input-id-1">Religion</label>
                                                    <div class="slds-form-element__control">
                                                        <input type="text"
                                                            class="slds-input"
                                                            name="religion"
                                                            placeholder="Religion"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'religion')}
                                                            value={this.state.religion || ''} />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row py-1 mb-3">
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">Source</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="">
                                                            <SLDSReactSelect
                                                                simpleValue={true}
                                                                className="default_validation"
                                                                options={this.state.source_option}
                                                                onChange={(value) => this.handleChange(value, 'contact_source')}
                                                                value={this.state.contact_source || ''}
                                                                clearable={true}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                name="Source"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        <abbr class="slds-required" title="required">* </abbr>Status</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="">
                                                            <SLDSReactSelect
                                                                simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={status_option}
                                                                onChange={(value) => this.handleChange(value, 'status')}
                                                                value={this.state.status || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                required={true}
                                                                name="Status"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </Modal>
                    </div>
                </IconSettings>
            </div >
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateContactModel);
