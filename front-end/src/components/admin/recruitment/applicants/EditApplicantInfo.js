import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { connect } from 'react-redux'
import _ from 'lodash'
import { getApplicantInfo } from './../actions/RecruitmentApplicantAction';
import { handleChange, handleShareholderNameChange, handleShareholderNameChangeState, handleAddShareholder, handleRemoveShareholder, googleAddressFill, postData, getOptionsSuburb, onKeyPressPrevent, queryOptionData } from 'service/common.js';
import ReactGoogleAutocomplete from './../../externl_component/ReactGoogleAutocomplete';
import jQuery from "jquery";
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js'
import DatePicker from 'react-datepicker'

import '../../scss/components/admin/recruitment/applicants/EditApplicantInfo.scss'
import moment from 'moment';
import DateOfBirthDatePicker, { defaultDateFormat as defaultDateOfBirthDateFormat } from '../../DateOfBirthDatePicker';
import UserAvatar from '../../oncallui-react-framework/view/UserAvatar';
import { IconSettings } from '@salesforce/design-system-react';
import { SLDSISODatePicker, SLDSISODateOfBirthPicker } from '../../salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';
class EditApplicantInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            phones: [],
            emails: [],
            address: "",
            references: [],
            is_any_address_provided: false,
            title: null,
            dob: '',
            unit_number: '',
            is_manual_address: this.props.is_manual_address ? this.props.is_manual_address :false,
            manual_address: ''
        }

        this.datepickers = {
            dob: React.createRef(),
        }
        /**
         * @type {React.Ref<HTMLFormElement>}
         */
        this.formEl = React.createRef()


    }

    componentDidMount() {
        this.setState(JSON.parse(JSON.stringify(this.props)));
        if (this.props.references.length === 0) {
            this.setState({ references: [{ name: '', email: '', phone: '', is_validate: false }] })
        }
        // if (this.props.addresses.length === 0) {
        //     this.setState({ addresses: [{ street: '', state: '', city: '', postal: '' }] })
        // }
        // else {
        //     this.setState({ is_any_address_provided: true });
        // }

        this.setState({
            stateList: this.getStateList(),
        })

    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState)
    }

    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    handleShareholderNameChange_ref(index, stateKey, fieldtkey, fieldValue) {
        var state = {};
        var tempField = {};
        var List = this.state[stateKey];
        List[index][fieldtkey] = fieldValue
        state[stateKey] = List;
        this.setState(state, () => { });
    }

    getStateList() {
        const { data } = this.props.stateList

        let states = [
            { label: "Select...", value: "" },
            ...data,
        ]

        return states
    }

    // revalidateAddressComponents() {
    //     if (this.validator) {
    //         // revalidate only the first address
    //         let addresses = this.state.addresses || []

    //         for (let i in addresses) {
    //             this.validator.element(`form#edit_applicant input[name=address_primary${i}]`)
    //             this.validator.element('form#edit_applicant input[name=state-hidden]')
    //             this.validator.element('form#edit_applicant input[name=suburb-hidden]')
    //             this.validator.element('form#edit_applicant input[name=postal]')
    //             break;
    //         }
    //     }
    // }


    // areAddressComponentsRequired() {
    //     // return this.state.is_any_address_provided
    //     const firstAddress = _.first(this.state.addresses) || {}
    //     const { postal, state, street, city } = firstAddress

    //     return [postal, state, street, city].some(Boolean)
    // }

    componentDidUpdate(props, state) {
        if (props.avatar && !state.avatar) {
            this.setState({ avatar: props.avatar });
        }
    }


    onSubmit = (e) => {
        e.preventDefault();
        this.validator = jQuery("#edit_applicant").validate({ ignore: [] });
        const dobMoment = moment(this.state.dob, 'YYYY-MM-DD');
        const DATEFORMAT_ISO8601 = 'YYYY-MM-DD' // format used by the form validation and mysql for dates
        if (!dobMoment.isValid()) {
            toast.error(<ToastUndo message={'Please select Date Of Birth'} showType={'e'} />, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }        
        
        if (jQuery("#edit_applicant").valid() && dobMoment.isValid()) {
            this.setState({ loading: true });


            if (this.state.is_manual_address) {
                this.setState({ address: '' });
            }
            const state = {
                ...this.state,
                dob: dobMoment.isValid() ? dobMoment.format(DATEFORMAT_ISO8601) : null,
                uuid: this.props.uuid
            }
            postData('recruitment/RecruitmentApplicant/update_applicant_details', state).then((result) => {
                if (result.status) {
                    this.props.getApplicantInfo(this.props.id);
                    this.props.close();
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({ loading: false });
            });
        }
    }

    // handleShareholderNameChange = (index, stateKey, fieldtkey, fieldValue) => {
    //     var state = {};
    //     var tempField = {};
    //     var List = this.state[stateKey];
    //     List[index][fieldtkey] = fieldValue;

    //     const useBlankInsteadOfNullForTheseKeys = [
    //         'city'
    //     ];

    //     if (useBlankInsteadOfNullForTheseKeys.indexOf(fieldtkey) >= 0 && !List[index][fieldtkey]) {
    //         List[index][fieldtkey] = ''
    //     }

    //     if (this.state.addresses[0].street || this.state.addresses[0].state || this.state.addresses[0].city || this.state.addresses[0].postal)
    //         this.setState({ is_any_address_provided: true });
    //     else
    //         this.setState({ is_any_address_provided: false });

    //     if (fieldtkey == 'state') {
    //         List[index]['city'] = {}
    //         List[index]['postal'] = ''
    //         List[index]['state_error'] = false;
    //     }

    //     if (fieldtkey == 'city' && fieldValue) {
    //         List[index][fieldtkey] = fieldValue.value
    //         List[index]['postal'] = fieldValue.postcode
    //     }

    //     state[stateKey] = List;
    //     this.setState(state);
    // }

    /**
     * Prepend with options to empty title field
     */
    titleOptions() {
        return [{ value: null, label: 'Select title' }].concat(this.props.title_options)
    }


    /**
     * Renders dob date picker. 
     * Date of birth datepickers will be formatted as YYYY-MM-DD
     */
    renderDateOfBirthDatePicker() {
        let selected = this.state.dob

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <div class='set_date_border'>
                    <SLDSISODateOfBirthPicker
                        ref={this.datepickers.dob} // !important: this is needed by this custom SLDSISODatePicker
                        className="customer_signed_date"
                        placeholder="Date of Birth"
                        onChange={this.handleChangeDatePicker('dob')}
                        onOpen={this.handleDatePickerOpened('dob')}
                        onClear={this.handleChangeDatePicker('dob')}
                        value={this.state.dob}
                        input={<Input name="dob" />}
                        inputProps={{
                            name: "dob",
                        }}
                    /></div>
            </IconSettings>
        )
    }


    render() {
        var references = this.state.references.filter((s, sidx) => s.its_delete !== true);

        const stateMapping = (this.state.stateList || []).reduce((acc, curr) => {
            acc[curr.value] = curr.label
            return acc
        }, {})

        return (
            <div className={'customModal ' + (this.props.show ? ' show' : '')} id="EditApplicantInfo">
                <div className="cstomDialog widBig" >

                    <h3 className="cstmModal_hdng1--">
                        Edit Applicant Info
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                    <form id="edit_applicant" onSubmit={(e) => e.preventDefault()} onKeyPress={onKeyPressPrevent} ref={this.formEl}>

                        <div className='row pd_lf_15 mr_tb_20 d-flex justify-content-center flexWrap' >
                            <div className='col-sm-12 col-xs-12'>
                                <label className='bg_labs2 mr_b_20'><strong>Applicants Information</strong> </label>
                            </div>

                            <div className='col-md-12 col-xs-12'>
                                <div className="row">
                                    <div className="col-sm-12 col-md-4">
                                        <div className="csform-group">
                                            <label>Title</label>
                                            <Select
                                                simpleValue={true}
                                                name="title"
                                                placeholder={`Select title`}
                                                options={this.titleOptions()}
                                                clearable={false}
                                                // required={}
                                                searchable={false}
                                                disabled={this.props.title_options_loading}
                                                isLoading={this.props.title_options_loading}
                                                onChange={e => this.setState({ title: e })}
                                                value={this.state.title || ''}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-12 col-md-8">
                                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                            <UserAvatar style={{ textAlign: "center", marginBottom: "10px" }} avatar={this.state.avatar || ""} onUpdateAvatar={data => this.setState({ avatar: data })} />
                                        </IconSettings>
                                    </div>
                                </div>

                                <div className='row '>
                                    <div className="col-sm-3">
                                        <div className="csform-group">
                                            <label>First Name:</label>
                                            <span className="required">
                                                <input type="text" maxLength="30" name="firstname" required className="csForm_control bl_bor" onChange={(e) => handleChange(this, e)} value={this.state.firstname || ''} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="csform-group">
                                            <label>Middle Name:</label>
                                            <input type="text" maxLength="30" name="middlename" className="csForm_control bl_bor" onChange={(e) => handleChange(this, e)} value={this.state.middlename || ''} />
                                        </div>
                                    </div>

                                    <div className="col-sm-3">
                                        <div className="csform-group">
                                            <label>Last Name:</label>
                                            <span className="required">
                                                <input type="text" maxLength="30" name="lastname" required className="csForm_control bl_bor" onChange={(e) => handleChange(this, e)} value={this.state.lastname || ''} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="csform-group">
                                            <label>Previous Name:</label>
                                            <input type="text" maxLength="30" name="previous_name" className="csForm_control bl_bor" value={this.state.previous_name || ''} onChange={e => this.setState({ previous_name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="csform-group">
                                            <label>ID:</label>
                                            <p className="clr_grey">{this.state.appId || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xs-12">
                                <div className="row">
                                    <div className="col-sm-12 col-md-3">
                                        <div className="csform-group">
                                            <label>Preferred name</label>
                                            <input type="text" name="preferred_name" value={this.state.preferred_name || ''} onChange={e => this.setState({ preferred_name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-sm-12 col-md-3">
                                        <div className="csform-group">
                                            <label>Date of birth</label>
                                            <span className="required">                                            
                                                {this.renderDateOfBirthDatePicker()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>


                            <div className='col-sm-12 col-xs-12 mt-5'>
                                <label className='bg_labs2 mr_b_20'><strong>Contact Information</strong> </label>
                            </div>
                            <div className='col-md-12 col-xs-12'>
                                <div className='row '>
                                    <div className="col-sm-1">
                                        <div className="csform-group">
                                            <label>Phone:</label>
                                            <span >
                                                <input type="text" name="phone" className="csForm_control bl_bor" value={'+61'} readOnly={true} disabled={true}/>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        {this.state.phones.map((val, index) => (
                                            <div className="csform-group" key={index + 1}>
                                                <label> </label>
                                                <span className="required" style={{textAlign: "center", marginTop: "6px"}}>
                                                    <input type="text" name="phone" maxLength="10" phoneMinLength="10" required data-rule-phonenumber="true" placeholder="04XXXXXXXX" className="csForm_control bl_bor" onChange={(e) => { if (!isNaN(e.target.value)) { handleShareholderNameChange(this, 'phones', index, 'phone', e.target.value) } }} value={val.phone || ''} />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-sm-3">
                                        {this.state.emails.map((val, index) => (
                                            <div className="csform-group" key={index + 1}>
                                                <label>Email:</label>
                                                <span className="required">
                                                    <input type="text" maxLength="100" name="email" required className="csForm_control bl_bor" onChange={(e) => handleShareholderNameChange(this, 'emails', index, 'email', e.target.value)} value={val.email || ''} />
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>


                                <div className='row ' >
                                    <div className="col-sm-3">
                                        <div className="csform-group">
                                            <label>Apartment/Unit number:</label>
                                            <span>
                                                <input maxlength='30' type="text" name="unit_number" placeholder="Apartment/Unit number" value={this.state.unit_number || ''} onChange={e => this.setState({ unit_number: e.target.value })} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-sm-5">
                                        <div className="csform-group">
                                            <label>Primary Address:</label>
                                            <span className={""}>
                                                <ReactGoogleAutocomplete className="add_input mb-1" maxLength="100"
                                                    // required={this.areAddressComponentsRequired()}
                                                    data-msg-required="Add address"
                                                    name={"address_primary"}
                                                    onPlaceSelected={(place) => this.setState({ 'address': place.formatted_address })}
                                                    types={['address']}
                                                    returntype={'array'}
                                                    value={this.state.is_manual_address == 1 ? '' : (this.state.address || '')}
                                                    onChange={(evt) => this.setState({ 'address': evt.target.value })}
                                                    componentRestrictions={{ country: "au" }}
                                                    disabled = {this.state.is_manual_address==1 ? true : false}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-sm-4 mt-3">
                                        <label className="customChecks chck_clr1 mt-1 pl-sm-2">
                                            <input type="checkbox"
                                                name="is_manual_address"
                                                onChange={e => {
                                                    handleChange(this, e);
                                                    if (!this.state.manual_address) {
                                                        this.setState({ manual_address: '' });
                                                    }
                                                }}
                                                checked={this.state.is_manual_address == 1 ? true : false}
                                            />
                                            <div className="chkLabs fnt_sm">Address did not show up</div>
                                        </label>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className="col-sm-5">
                                        <div className="csform-group">
                                            <label>Address (Manual Entry)</label>
                                            <span>
                                                <input type="text" name="manual_address" placeholder="Manual Address" 
                                                value={this.state.is_manual_address == 0 ? '' :  (this.state.manual_address || '' )}
                                                onChange={e => this.setState({ manual_address: e.target.value })} 
                                                disabled = {this.state.is_manual_address==0 ? true: false}/>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="bt-1 mt-3"></div>
                            </div>
                        </div>

                        <div className='row pd_lf_15 mr_tb_20 d-flex justify-content-center flexWrap' >
                            <div className='col-sm-12 col-xs-12'>
                                <label className='bg_labs2 mr_b_20'><strong>Reference:</strong> </label>
                            </div>
                            {this.state.references.map((val, index) => (
                                !val.its_delete ?
                                    <div className='col-md-12 col-xs-12 mt-5' key={index + 1}>
                                        <div className="row d-flex flex-wrap">
                                            <div className="col-md-12 pr-12">
                                                <div className="row">
                                                    <div className='col-sm-12 col-xs-12'>
                                                        <label className='bg_labs2 mr_b_20'><strong>Reference {index + 1}:</strong> </label>
                                                    </div>
                                                </div>
                                                <div className="row d-flex flex-wrap">
                                                    <div className="col-md-3">
                                                        <div className="csform-group">
                                                            <label>Full Name:</label>
                                                            <span className={val.name ? 'required' : (val.phone ? 'required' : (val.email ? 'required' : false))}>
                                                                <input type="text" maxlength="30" required={val.name ? true : (val.phone ? true : (val.email ? true : false))} name={"references_name" + index} className="csForm_control bl_bor" onChange={(e) => this.handleShareholderNameChange_ref(index, 'references', 'name', e.target.value)} value={val.name || ''} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <div className="csform-group">
                                                            <label>Phone:</label>
                                                            <span >
                                                                <input type="text" name="phone" className="csForm_control bl_bor" value={'+61'} readOnly={true} disabled={true} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="csform-group">
                                                            <label>&nbsp;</label>
                                                            <span className={val.phone ? 'required' : (val.email ? 'required' : (val.name ? 'required' : false))}>
                                                                <input type="text"  maxLength="10" phoneMinLength="10" placeholder="04XXXXXXXX" required={val.phone ? true : (val.email ? true : (val.name ? true : false))} data-rule-phonenumber="true" name={"references_phone" + index} className="csForm_control bl_bor" onChange={(e) => { if (!isNaN(e.target.value)) { this.handleShareholderNameChange_ref(index, 'references', 'phone', e.target.value) } }} value={val.phone || ''} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="csform-group">
                                                            <label>Email:</label>
                                                            <span className=''>
                                                                <input type="email" maxlength="100" name={"references_email" + index} className="csForm_control bl_bor" onChange={(e) => this.handleShareholderNameChange_ref(index, 'references', 'email', e.target.value)} value={val.email || ''} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 align-self-end">
                                                        <div className="csform-group">
                                                            {index > 0 ? <a onClick={(e) => { val.id > 0 ? handleShareholderNameChange(this, 'references', index, 'its_delete', true, e) : handleRemoveShareholder(this, e, index, 'references') }} className="button_plus__"><i className="icon icon-decrease-icon Add-2-2"></i></a>
                                                                : (references.length == 4) ? '' :
                                                                    <a className="button_plus__" onClick={(e) => handleAddShareholder(this, e, "references", val)}><i className="icon icon-add-icons Add-2-1"></i></a>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div> : ''
                            ))}
                        </div>

                        <div className="row trnMod_Foot__ disFoot1__">
                            <div className="col-sm-12 no-pad text-right">
                                <button type="submit" onClick={this.onSubmit} className="btn cmn-btn1 create_quesBtn">Save Changes</button>
                            </div>
                        </div>

                    </form>


                </div>
            </div>

        );
    }
}

const mapStateToProps = state => ({
    ...state.RecruitmentApplicantReducer.details,
    ...state.RecruitmentApplicantReducer.applicant_address,
    phones: state.RecruitmentApplicantReducer.phones,
    emails: state.RecruitmentApplicantReducer.emails,
    references: state.RecruitmentApplicantReducer.references,
    title_options: state.CommonReducer.title.data,
    title_options_loading: state.CommonReducer.title.loading,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfo: (applicant_id) => dispach(getApplicantInfo(applicant_id)),
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(EditApplicantInfo);

