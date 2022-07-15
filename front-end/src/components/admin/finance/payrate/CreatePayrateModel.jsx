import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, handleChange, handleDecimalChange } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import { SLDSISODatePicker } from '../../salesforce/lightning/SLDSISODatePicker';
import {
    Modal,
    Checkbox,
    Button,
    Input,
    IconSettings
} from '@salesforce/design-system-react';
import moment from 'moment';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss';


/**
 * to fetch the roles as user types
 */
const getRoles = (e, data) => {
    return queryOptionData(e, "item/document/get_role_name_search", { query: e }, 2, 1);
}

/**
 * Class: CreatePayrateModel
 */
class CreatePayrateModel extends Component {

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
            pay_rate_id: this.props.id ? this.props.id : '',
            role_details: '',
            pay_rate_category_id: '',
            pay_rate_award_id: '',
            pay_level_id: '',
            skill_level_id: '',
            employment_type_id: '',
            start_date: '',
            end_date: '',
            amount: '',
            external_reference: '',
            description: '',
            status: '0',
            payrates_category_options: [],
            payrates_award_options: [],
            employment_type_options: [],
            skill_level_options: [],
            pay_level_options: []
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            start_date: React.createRef(),
            end_date: React.createRef()
        }
    }

    /**
     * fetching the pay rate details if the modal is opened in the edit mode
     */
    get_pay_rate_details = (id) => {
        postData('finance/FinanceDashboard/get_pay_rate_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the reference data of pay rates
     */
    get_pay_rate_ref_data = () => {
        postData("finance/FinanceDashboard/get_pay_rate_ref_data").then((result) => {
            if (result.status) {
                this.setState(result.data)
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    
    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value });
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
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        this.get_pay_rate_ref_data();

        if(this.props.id) {
            this.setState({ pay_rate_id: this.props.id });
            this.get_pay_rate_details(this.props.id);
        }
        this.setState({ loading: false });
    }


    /**
     * Calling the API to create/update the payrate
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_payrate").validate({ /* */ });        
        var url = 'finance/FinanceDashboard/create_update_pay_rate';
        var validator = jQuery("#create_payrate").validate({ ignore: [] });
        
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#create_payrate").valid()) {
            this.setState({ loading: true });
            var req = {
                id: this.state.pay_rate_id,
                pay_rate_category_id: this.state.pay_rate_category_id,
                pay_rate_award_id: this.state.pay_rate_award_id,
                role_id: this.state.role_details ? this.state.role_details.value : '',
                pay_level_id: this.state.pay_level_id,
                skill_level_id: this.state.skill_level_id,
                employment_type_id: this.state.employment_type_id,
                start_date: this.state.start_date ? moment(this.state.start_date).format('YYYY-MM-DD') : '',
                end_date: this.state.end_date ? moment(this.state.end_date).format('YYYY-MM-DD') : '',
                amount: this.state.amount,
                external_reference: this.state.external_reference,
                description: this.state.description,
                status: this.state.status
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
     * rendering the main form
     */
    RenderAddEditForm() {
        return (
            <form id="create_payrate" autoComplete="off" className="slds_form">
                <div className="container-fluid">
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Category</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.payrates_category_options}
                                            onChange={(value) => this.handleChange(value, 'pay_rate_category_id')}
                                            value={this.state.pay_rate_category_id || ''}
                                            clearable={true}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Payrates Category"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Award</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.payrates_award_options}
                                            onChange={(value) => this.handleChange(value, 'pay_rate_award_id')}
                                            value={this.state.pay_rate_award_id || ''}
                                            clearable={true}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Payrates Award"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Service Type</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect.Async clearable={false}
                                            className="SLDS_custom_Select default_validation"
                                            value={this.state.role_details}
                                            cache={false}
                                            required={true}
                                            loadOptions={(e) => getRoles(e, [])}
                                            onChange={(e) => this.setState({ role_details: e })}
                                            placeholder="Please Search"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Pay Level</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.pay_level_options}
                                            onChange={(value) => this.handleChange(value, 'pay_level_id')}
                                            value={this.state.pay_level_id || ''}
                                            clearable={true}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Pay Level"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Skill</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.skill_level_options}
                                            onChange={(value) => this.handleChange(value, 'skill_level_id')}
                                            value={this.state.skill_level_id || ''}
                                            clearable={true}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Skill Level"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Employment Type</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.employment_type_options}
                                            onChange={(value) => this.handleChange(value, 'employment_type_id')}
                                            value={this.state.employment_type_id || ''}
                                            clearable={true}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Employment Type"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Start Date</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSISODatePicker
                                            ref={this.datepickers.start_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="customer_signed_date"
                                            placeholder="Start Date"
                                            onChange={this.handleChangeDatePicker('start_date')}
                                            onOpen={this.handleDatePickerOpened('start_date')}
                                            onClear={this.handleChangeDatePicker('start_date')}
                                            value={this.state.start_date}
                                            input={<Input name="start_date"/>}
                                            inputProps={{
                                                name: "start_date",
                                                required: true
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1"><abbr className="slds-required" title="required">* </abbr>End Date</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSISODatePicker
                                            ref={this.datepickers.end_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="customer_signed_date"
                                            placeholder="End Date"
                                            onChange={this.handleChangeDatePicker('end_date')}
                                            onOpen={this.handleDatePickerOpened('end_date')}
                                            onClear={this.handleChangeDatePicker('end_date')}
                                            value={this.state.end_date}
                                            input={<Input name="end_date"/>}
                                            inputProps={{
                                                name: "end_date",
                                                required: true
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" ><abbr className="slds-required" title="required">* </abbr>Amount</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="amount"
                                        placeholder="Amount (in $)"
                                        onChange={(e) => {
                                            if (!isNaN(e.target.value)) {
                                                handleDecimalChange(this, e);
                                            }
                                        }}
                                        maxLength="9"
                                        required={true}
                                        value={this.state.amount || ''}
                                        className="slds-input" />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">                      
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >External Reference</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="external_reference"
                                        placeholder="External Reference"
                                        onChange={(e) => handleChange(this, e)}
                                        value={this.state.external_reference || ''}
                                        className="slds-input" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-sm-12">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">Description</label>
                                <div className="slds-form-element__control">
                                    <textarea
                                        className="slds-textarea"
                                        name="description"
                                        placeholder="Description"
                                        onChange={(e) => this.handleChange(e.target.value, "description")}
                                        value= {this.state.description ?  this.state.description : ''}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label slds-checkbox__label" htmlFor="status">Active</label>
                                <div className="slds-form-element__control">
                                    <div className="slds-checkbox">
                                    <input type="checkbox" name="status" id="status" onChange={(e) => handleChange(this,e)} checked={(this.state.status && this.state.status=='1')?true:false}/>
                                    <label className="slds-checkbox__label" htmlFor="status">
                                        <span className="slds-checkbox_faux"></span>
                                    </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        )
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
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.id ? "Update Pay Rate" : "New Pay Rate"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            {this.RenderAddEditForm()}
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreatePayrateModel;
