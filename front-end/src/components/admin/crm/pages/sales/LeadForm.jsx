import React from 'react'
import Select from 'react-select-plus'
import classNames from 'classnames'

import { BASE_URL } from 'config.js'
import { css, queryOptionData, handleChangeSelectDatepicker, handleShareholderNameChange } from '../../../../../service/common'

import '../../../../../service/jquery.validate.js'
import "../../../../../service/custom_script.js"
import SLDSSelect from '../../../salesforce/lightning/SLDSReactSelect'
import SLDSModalForm from '../../../salesforce/lightning/SLDSModalForm'

import 'react-select-plus/dist/react-select-plus.css'
import 'react-block-ui/style.css'

import '../../../scss/components/admin/crm/pages/sales/LeadForm.scss';
import { IconSettings, ExpandableSection } from '@salesforce/design-system-react';

/**
 * @extends {React.Component<typeof LeadForm.defaultProps>}
 */
class LeadForm extends React.Component {

    static THEME_LIGHTNING = 'lightning'
    static THEME_DEFAULT = 'default'


    static defaultProps = {
        /**
         * @type {(e: React.FormEvent<HTMLFormElement>, state: any) => void | null}
         */
        onSubmit: null,

        /**
         * @type {(e: React.MouseEvent<HTMLButtonElement>) => void | null}
         */
        onCancel: null,

        /**
         * @type {'default' | 'lightning'}
         */
        theme: LeadForm.THEME_LIGHTNING,

        /**
         * @type {any}
         */
        lead: null,
        loading: false,
        isSubmitting: false,
        id: "create_user",
        disabled: false,

        /**
         * @type { string | number | JSX.Element }
         */
        heading: undefined,

        /**
         * @type { string | number | JSX.Element }
         */
        tagLine: undefined,

        className: `LeadForm slds`
    }

    constructor(props) {
        super(props);
        let uid = localStorage.getItem("uid");
        let user_name = localStorage.getItem("user_name");
        this.state = {
            loading: false,
            redirectPage: false,
            email: [],
            PhoneInput: [{ phone: '' }],
            EmailInput: [{ email: '' }],
            lead_source_code_option: [],
            lead_status_options: [],
            lead_owner:{label: user_name, value: uid},
            ...props.lead,
            lead_service_type_option: [],
            isOpen: false
        }
    }

    componentDidMount() {
        this.getOptionsLeadSource();
        this.getOptionsLeadServiceType();

        if (this.props.lead) {
            this.getOptionsLeadStatus()
        }
    }

    getOptionsLeadStaff = (e, data) => {
        return queryOptionData(e, "sales/Lead/get_owner_staff", { query: e }, 2, 1);
    }

    getOptionsLeadSource = () => {
        queryOptionData(1, "sales/Lead/get_lead_source", { select_option: this.state.lead_status }, 0, 1).then((res) => { this.setState({ lead_source_code_option: res.options }) });
    }
    getOptionsLeadServiceType = () => {
        queryOptionData(1, "sales/Lead/get_lead_service_type_ref_list", false, 0, 1).then((res) => { this.setState({ lead_service_type_option: res.options }) });
    }

    async getOptionsLeadStatus() {
        const res = await queryOptionData(1, 'sales/Lead/get_lead_status', { select_option: 0 }, 0, 1)
        this.setState({ lead_status_options: res.options })
    }

    handleOnSubmit = e => {
        e.preventDefault()

        if (this.props.disabled) {
            // if you are seeing this error means the overlay which covers the form and prevents form submission 
            // is not working
            console.warn(`Cannot submit this form because this.props.disabled is true`)
            return false
        }

        if (this.props.onSubmit) {
            return this.props.onSubmit(e, this.state)
        }
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

    render() {
        // WARNING: When including this component, 
        // make sure the lightning design system assets are included

        // Note: used by create, edit and preview leads
        // You may want to test those features after making changes in this component

        // If you still need the previous theme for whatever reason
        // just pass 'default' to `this.props.theme`
        if (this.props.theme === LeadForm.THEME_DEFAULT) {
            return this.renderThemeDefault()
        }

        const MAX_PHONES = 1
        const MAX_EMAILS = 1

        return (
            <SLDSModalForm
                id={this.props.id}
                autoComplete="off"
                className={classNames('LeadForm slds', this.props.className)}
                onSubmit={e => this.props.onSubmit(e, this.state)}
                disabled={this.props.disabled}
                heading={this.props.heading}
                tagLine={this.props.tagLine}
                onCancel={this.props.onCancel}
                onClose={this.props.onCancel}
                disabled={this.props.disabled}
                size={'small'}
                isSubmitting={this.props.isSubmitting}
                submitButtonLabel={this.props.isSubmitting ? `Saving...` : `Save`}
            >
                <div className="col-xs-12">
                    {
                        this.props.lead && (
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="slds-form-element">
                                        <label htmlFor="" className="slds-form-element__label">Status</label>
                                    </div>
                                    <div className="slds-form-element__control">
                                        <SLDSSelect
                                            required={false}
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.lead_status_options}
                                            onChange={(value) => handleChangeSelectDatepicker(this, value, 'lead_status')}
                                            value={this.state.lead_status || ''}
                                            clearable={false}
                                            searchable={false}
                                            placeholder=""
                                            inputRenderer={(props) => <input type="text" name={"lead_status"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    }



                    <div className="row">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                    <abbr className="slds-required" title="required">* </abbr>Service type
                                </label>
                                <div className="slds-form-element__control">
                                    {/* <input type="text" name="lead_topic" className="slds-input" placeholder="Enter Topic" onChange={(e)=>handleChangeSelectDatepicker(this, e.target.value, 'lead_topic')} value={this.state.lead_topic || ''} data-rule-required="true" maxLength="255" data-msg-required="Enter Topic" /> */}
                                    <SLDSSelect
                                        required={false} simpleValue={true}
                                        className="custom_select default_validation"
                                        options={this.state.lead_service_type_option}
                                        onChange={(value) => handleChangeSelectDatepicker(this, value, 'lead_topic')}
                                        value={this.state.lead_topic || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Service Type"
                                        inputRenderer={(props) => <input type="text" name={"lead_topic"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                Assigned To
                                </label>
                                <div className="slds-form-element__control">
                                    <SLDSSelect.Async
                                        name='lead_owner_org'
                                        isLoading={true}
                                        loadOptions={(e) => this.getOptionsLeadStaff(e, [])}
                                        clearable={true}
                                        searchable={true}
                                        placeholder='Search'
                                        cache={false}
                                        value={this.state.lead_owner}
                                        onChange={(e) => this.setState({ lead_owner: e })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">

                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                    <abbr className="slds-required"></abbr>
                                    First name
                                </label>
                                <div className="slds-form-element__control">
                                    <input className="slds-input" type="text" name="firstname" placeholder="First" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'firstname')} value={this.state.firstname || ''} maxLength="40" data-msg-required="Add First Name" />
                                </div>
                            </div>
                        </div>

                        <div className=" col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                    Middle Name
                                </label>
                                <div className="slds-form-element__control">
                                    <input className="slds-input" type="text" name="middlename" placeholder="Middle" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'middlename')} value={this.state.middlename || ''}  maxLength="40" />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="row">
                        <div className=" col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                    <abbr className="slds-required" title="required">*</abbr>Last Name

                                </label>
                                <div className="slds-form-element__control">
                                    <input className="slds-input" type="text" name="lastname" placeholder="Last" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lastname')} value={this.state.lastname || ''} data-rule-required="true" maxLength="40" data-msg-required="Add Last Name" />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                    Previous name
                                </label>
                                <div className="slds-form-element__control">
                                    <input className="slds-input" type="text" name="previousname" placeholder="Previous" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'previous_name')} value={this.state.previous_name || ''} maxLength="40" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                            <div className={`slds-form-element`}>
                                <label className="slds-form-element__label">
                                    {/* <abbr className="slds-required" title="required">* </abbr>  */}
                                    Email
                                </label>
                                {this.state.EmailInput.map((EmailInput, idx) => (
                                    <div className="slds-form-element__control input_plus__" key={idx + 1}>
                                        <input className="slds-input distinctEmail" type="text"
                                            value={EmailInput.email || ''}
                                            name={'email_' + idx}
                                            placeholder={idx > 0 ? 'Secondary email' : 'Primary Email'}
                                            onChange={(e) => handleShareholderNameChange(this, 'EmailInput', idx, 'email', e.target.value)}
                                            data-rule-required="false"
                                            data-rule-email="true"

                                            // let's remove jquery remote validation
                                            // TODO: Even though you have remote validation in place, the form still submits
                                            // I dont know how to make this remote validation block form submissions

                                            // data-rule-remote={BASE_URL + 'sales/Lead/check_user_emailaddress_already_exist/0'}
                                            // data-msg-remote="This email already exist"

                                            data-rule-notequaltogroup='[".distinctEmail"]'
                                            maxLength="70"
                                            data-msg-required="Add Email Address"
                                        />
                                        {idx > 0 ? <div className="btn_0_type" onClick={(e) => this.handleRemoveShareholder(e, idx, 'EmailInput')} style={{ cursor: `pointer`, width: 30, height: 25, fontSize: 20, top: 15 }}>
                                            <i className="icon icon-decrease-icon Add-2" ></i>
                                        </div> : (this.state.EmailInput.length == MAX_EMAILS) ? '' : <div className="btn_0_type" onClick={(e) => this.handleAddShareholder(e, 'EmailInput')} style={{ cursor: `pointer`, width: 30, height: 30, fontSize: 26 }}>
                                            <i className="icon icon-add-icons Add-1" ></i>
                                        </div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">
                                    Phone
                                </label>
                                {this.state.PhoneInput.map((PhoneInput, idx) => (
                                    <div className="slds-form-element__control input_plus__" key={idx + 1}>
                                        <input className="slds-input distinctPhone" type="text"
                                            value={PhoneInput.phone || ''}
                                            name={'phone_' + idx}
                                            placeholder="Can include area code"
                                            onChange={(e) => handleShareholderNameChange(this, 'PhoneInput', idx, 'phone', e.target.value)}
                                            data-rule-required="false"
                                            maxLength="18"
                                            data-rule-phonenumber={true}
                                            data-rule-notequaltogroup='[".distinctPhone"]'
                                            data-msg-notequaltogroup='Please enter uniqe phone number'
                                            data-msg-required="Add Phone Number"
                                        />

                                        {idx > 0 ?
                                            (
                                                <div className="btn_0_type" onClick={(e) => this.handleRemoveShareholder(e, idx, 'PhoneInput')} style={{ cursor: `pointer`, width: 30, height: 25, fontSize: 20, top: 15 }}>
                                                    <i className="icon icon-decrease-icon Add-2" style={{ fontSize: `inherit` }}></i>
                                                </div>
                                            )
                                            :
                                            (
                                                this.state.PhoneInput.length == MAX_PHONES) ? '' : (
                                                    <div className="btn_0_type" onClick={(e) => this.handleAddShareholder(e, 'PhoneInput')} style={{ cursor: `pointer`, width: 30, height: 30, fontSize: 26 }}>
                                                        <i className="icon icon-add-icons Add-1" style={{ fontSize: `inherit` }}></i>
                                                    </div>
                                                )
                                        }
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                            <div className={`slds-form-element`}>
                                <label className="slds-form-element__label">Referring Organization (if applicable)</label>
                                <div className={`slds-form-element__control`}>
                                    <input className="slds-input" type="text" name="company" placeholder="Referring Organization (if applicable)" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lead_company')} value={this.state.lead_company || ''} />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label">Lead Source</label>
                            </div>
                            <div className="slds-form-element__control">
                                <SLDSSelect
                                    required={false} simpleValue={true}
                                    className="custom_select default_validation"
                                    options={this.state.lead_source_code_option}
                                    onChange={(value) => handleChangeSelectDatepicker(this, value, 'lead_source_code')}
                                    value={this.state.lead_source_code || ''}
                                    clearable={false}
                                    searchable={false}
                                    placeholder=""
                                    inputRenderer={(props) => <input type="text" name={"lead_source_code"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                            <ExpandableSection
                                id="referrer-details-section"
                                isOpen={this.state.isOpen}
                                onToggleOpen={(event, data) => {
                                    this.setState({ isOpen: !this.state.isOpen });
                                }}
                                title="Referrer Details"
                            >
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className={`slds-form-element`}>
                                            <label className="slds-form-element__label">First Name</label>
                                            <div className={`slds-form-element__control`}>
                                                <input className="slds-input" type="text" name="referrer_firstname" placeholder="First Name" onChange={(e) => this.setState({referrer_firstname: e.target.value})} value={this.state.referrer_firstname || ''} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className={`slds-form-element`}>
                                            <label className="slds-form-element__label">Last Name</label>
                                            <div className={`slds-form-element__control`}>
                                                <input className="slds-input" type="text" name="referrer_lastname" placeholder="Last Name" onChange={(e) => this.setState({referrer_lastname: e.target.value})} value={this.state.referrer_lastname || ''} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className={`slds-form-element`}>
                                            <label className="slds-form-element__label">Email</label>
                                            <div className={`slds-form-element__control`}>
                                                <input className="slds-input" type="text" name="referrer_email" placeholder="Email" onChange={(e) => this.setState({referrer_email: e.target.value})} value={this.state.referrer_email || ''} data-rule-required="false" data-rule-email="true" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className={`slds-form-element`}>
                                            <label className="slds-form-element__label">Phone</label>
                                            <div className={`slds-form-element__control`}>
                                                <input className="slds-input" type="text" name="referrer_phone" placeholder="Phone" onChange={(e) => this.setState({referrer_phone: e.target.value})} value={this.state.referrer_phone || ''} data-rule-required="false" maxLength="18" data-rule-phonenumber={true}  data-rule-notequaltogroup='[".distinctPhone"]'  data-msg-notequaltogroup='Please enter uniqe phone number' data-msg-required="Add Phone Number" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className={`slds-form-element`}>
                                            <label className="slds-form-element__label">Relationship to Participant</label>
                                            <div className={`slds-form-element__control`}>
                                                <input className="slds-input" type="text" name="referrer_relation" placeholder="Relationship to Participant" onChange={(e) => this.setState({referrer_relation: e.target.value})} value={this.state.referrer_relation || ''} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ExpandableSection>
                        </IconSettings>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className={`slds-form-element`}>
                                <label className="slds-form-element__label">Description</label>
                                <div className="slds-form-element__control">
                                    <textarea className="slds-textarea"
                                        name="description"
                                        placeholder="Description"
                                        onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lead_description')}
                                        value={this.state.lead_description || ''}
                                        readOnly={this.props.disabled}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </SLDSModalForm>
        );
    }

    renderThemeDefault() {
        const styles = css({
            emailFieldLabel: {
                whiteSpace: 'nowrap',
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 5,
            }
        });

        return (
            <form id={this.props.id} autoComplete="off" className={this.props.className} onSubmit={e => this.props.onSubmit(e, this.state)} disabled={this.props.disabled}>


                <div className="row">
                    <div className="col-sm-6">
                        <label className="label_font">Service Type</label>
                        <div className="required">
                            <Select
                                required={false} simpleValue={true}
                                className="custom_select default_validation"
                                options={(e) => this.getOptionsLeadServiceType(e, [])}
                                onChange={(value) => handleChangeSelectDatepicker(this, value, 'lead_service_type')}
                                value={this.state.lead_service_type || ''}
                                clearable={false}
                                searchable={true}
                                placeholder=""
                                inputRenderer={(props) => <input type="text" name={"lead_service_type"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                            />
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <label className="label_font">Owner</label>
                        <div className="sLT_gray left left-aRRow" >
                            <Select.Async
                                name='lead_owner'
                                loadOptions={(e) => this.getOptionsLeadStaff(e, [])}
                                clearable={false}
                                placeholder='Search'
                                cache={false}
                                value={this.state.lead_owner}
                                onChange={(e) => this.setState({ lead_owner: e })}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className=" col-sm-6">
                        <label className="label_font">First Name</label>
                        <div className="required">
                            <input className="input_f" type="text" name="firstname" placeholder="First" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'firstname')} value={this.state.firstname || ''} data-rule-required="true" maxLength="40" data-msg-required="Add First Name" />
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <label className="label_font">Last Name</label>
                        <div className="required">
                            <input className="input_f" type="text" name="lastname" placeholder="Last" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lastname')} value={this.state.lastname || ''} data-rule-required="true" maxLength="40" data-msg-required="Add Last Name" />
                        </div>
                    </div>

                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <label className="label_font">Phone</label>


                        {this.state.PhoneInput.map((PhoneInput, idx) => (
                            <div className="input_plus__ mb-1" key={idx + 1}>
                                <input className="input_f distinctPhone" type="text"
                                    value={PhoneInput.phone || ''}
                                    name={'phone_' + idx}
                                    placeholder="Can include area code"
                                    onChange={(e) => handleShareholderNameChange(this, 'PhoneInput', idx, 'phone', e.target.value)}
                                    data-rule-required="false"
                                    maxLength="18"
                                    data-rule-phonenumber={true}
                                    data-rule-notequaltogroup='[".distinctPhone"]'
                                    data-msg-notequaltogroup='Please enter uniqe phone number'
                                    data-msg-required="Add Phone Number"
                                />

                                {idx > 0 ? <div className="btn_0_type" onClick={(e) => this.handleRemoveShareholder(e, idx, 'PhoneInput')}>
                                    <i className="icon icon-decrease-icon Add-2" ></i>
                                </div> : (this.state.PhoneInput.length == 3) ? '' : <div className="btn_0_type" onClick={(e) => this.handleAddShareholder(e, 'PhoneInput')}>
                                    <i className="icon icon-add-icons Add-1" ></i>
                                </div>}

                            </div>
                        ))}
                    </div>

                    <div className="col-sm-6">
                        <label className="label_font">Email</label>
                        {this.state.EmailInput.map((EmailInput, idx) => (
                            <div className="input_plus__ mb-1 " key={idx + 1}>
                                <input className="input_f distinctEmail" type="text"
                                    value={EmailInput.email || ''}
                                    name={'email_' + idx}
                                    placeholder={idx > 0 ? 'Secondary email' : 'Primary Email'}
                                    onChange={(e) => handleShareholderNameChange(this, 'EmailInput', idx, 'email', e.target.value)}
                                    data-rule-required="false"
                                    data-rule-email="true"
                                    data-rule-remote={BASE_URL + 'sales/Lead/check_user_emailaddress_already_exist/0'}
                                    data-msg-remote="This email already exist"
                                    data-rule-notequaltogroup='[".distinctEmail"]'
                                    maxLength="70"
                                    data-msg-required="Add Email Address"
                                />
                                {idx > 0 ? <div className="btn_0_type" onClick={(e) => this.handleRemoveShareholder(e, idx, 'EmailInput')}>
                                    <i className="icon icon-decrease-icon Add-2" ></i>
                                </div> : (this.state.EmailInput.length == 3) ? '' : <div className="btn_0_type" onClick={(e) => this.handleAddShareholder(e, 'EmailInput')}>
                                    <i className="icon icon-add-icons Add-1" ></i>
                                </div>}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="row">
                    <div className=" col-sm-6">
                        <label className="label_font">Referring Organization (if applicable)</label>
                        <input className="input_f" type="text" name="company" placeholder="Referring Organization (if applicable)" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lead_company')} value={this.state.lead_company || ''} />
                    </div>
                    <div className="col-sm-6">
                        <label className="label_font">Lead Source</label>
                        <span className="">
                            <div className="sLT_gray left left-aRRow">
                                <Select
                                    required={false} simpleValue={true}
                                    className="custom_select default_validation"
                                    options={this.state.lead_source_code_option}
                                    onChange={(value) => handleChangeSelectDatepicker(this, value, 'lead_source_code')}
                                    value={this.state.lead_source_code || ''}
                                    clearable={false}
                                    searchable={true}
                                    placeholder=""
                                    inputRenderer={(props) => <input type="text" name={"lead_source_code"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                />

                            </div>
                        </span>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-6">
                        <label className="label_font">Description</label>
                        <textarea className="csForm_control notesArea clr2" name="description" placeholder="Description" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'lead_description')} value={this.state.lead_description || ''} />
                    </div>

                </div>

                {
                    !this.props.disabled && (
                        <div className="row d-flex justify-content-end">
                            <div className="w-20-lg col-lg-2 col-sm-3  mt-3">
                                <button disabled={this.props.loading || this.props.isSubmitting} className="but">{this.props.isSubmitting ? `Saving...` : `Save`}</button>
                            </div>
                        </div>
                    )
                }


            </form>
        )
    }
}

export default LeadForm