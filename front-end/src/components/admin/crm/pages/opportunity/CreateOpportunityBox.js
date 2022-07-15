import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import { checkItsNotLoggedIn, postData, toastMessageShow, handleChangeSelectDatepicker, handleShareholderNameChange, css, queryOptionData, handleChange } from 'service/common.js';
import { BASE_URL, REGULAR_EXPRESSION_FOR_AMOUNT } from 'config.js'
import 'react-block-ui/style.css';
import Select from 'react-select-plus'
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import { SLDSIcon } from '../../../salesforce/lightning/SLDS';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';
import SLDSSelect from '../../../salesforce/lightning/SLDSReactSelect';


const getOptionsLeadStaff = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_owner_staff_search", { query: e }, 2, 1);
}

const getOptionsRelatedLead = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_lead_number_search", { query: e }, 2, 1);
}

const getOptionsAccountPersonName = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_account_person_name_search", { query: e }, 2, 1);
}

class CreateOpportunityBox extends Component {

    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            isSubmitting: false,
            redirectPage: false,
            lead_source_code_option: [],
            lead_status_options: [],
            lead_owner: {},
            opportunity_type_options: [],
            ndis_sp_visible: false,
            account_person: this.props.default_account || '',
            oppurtunity_description:'',
            lead_service_type_option: [],
        }

    }

    onSubmit = (e, state) => {
        e.preventDefault();
        jQuery("#create_opp").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery("#create_opp").valid()) {
            this.setState({ loading: true });
            var req = {
                ...this.state,
                owner: this.state.owner ? this.state.owner.value : '',
                account_person: this.state.account_person ? this.state.account_person.value : '',
                account_type: this.state.account_person ? this.state.account_person.account_type : '',
                related_lead: this.state.related_lead ? this.state.related_lead.value : '',
            }
            postData('sales/Opportunity/create_opportunity', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.props.closeModal(true);

                    // tells the parent component to do 
                    // something when opportunity was updated successfully
                    if (this.props.onUpdate && this.state.opportunity_id) {
                        this.props.onUpdate(this.state.opportunity_id)
                    }

                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }
    handleChange = (value, key) => {
        this.setState({ [key]: value }, () => {
            if (this.state.validation_calls) {
                jQuery("#create_opp").valid()
            }
        })
    }

    getOptionsCreateOpportunity = () => {
        postData("sales/Opportunity/get_create_opportunity_option", {}).then((res) => {
            if (res.status) {
                this.setState(res.data)
            }
        });
    }

    componentDidMount() {
        this.getOptionsCreateOpportunity();
        this.getOptionsLeadServiceType();
        if (this.props.oppId) {
            this.getOpportunityData(this.props.oppId);
        }
    }

    getOptionsLeadServiceType=  () =>{
        queryOptionData(1, "sales/Lead/get_lead_service_type_ref_list", false, 0,1).then((res) => {this.setState({lead_service_type_option:res.options})});
    }


    getOpportunityData = (opportunity_id) => {
        postData('sales/Opportunity/get_opportunity_detail', { opportunity_id: opportunity_id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow('Something went wrong', "e");
            }
        });
    }

    render() {
        var opportunity_type = '';
        if (this.state.opportunity_type) {
            var opportunity_type_options = this.state.opportunity_type_options
            var index = opportunity_type_options.findIndex(x => x.value == this.state.opportunity_type);

            if (index >= 0) {
                opportunity_type = opportunity_type_options[index]["key_name"];
            }
        }

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openOppBox}
                    footer={[
                        <Button label="Cancel" onClick={this.props.closeModal} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                    ]}
                    onRequestClose={this.props.closeModal}
                    heading={this.props.pageTitle}
                    className="slds_custom_modal"
                    size="small"
                    dismissOnClickOutside={false}
                >

                    <div className="slds-modal__header_">
                        <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={this.props.closeModal}>
                            <SLDSIcon icon="close" className={`slds-button__icon slds-button__icon_large`} aria-hidden="true" />
                            <span className="slds-assistive-text">Close</span>
                        </button>
                    </div>

                    <form id="create_opp" autoComplete="off" className="px-4 col-md-12 slds_form" onSubmit={e => this.props.onSubmit(e, this.state)} disabled={this.props.disabled}>

                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        <abbr className="slds-required" title="required">* </abbr>Service Type</label>
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
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Type</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect
                                                required={true} simpleValue={true}
                                                name="lead_source_code"
                                                className="SLDS_custom_Select default_validation"
                                                simpleValue={true}
                                                searchable={false}
                                                placeholder="Please Select"
                                                clearable={false}
                                                options={this.state.opportunity_type_options}
                                                onChange={(value) => this.handleChange(value, 'opportunity_type')}
                                                value={this.state.opportunity_type || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {opportunity_type === 'ndis' && this.state.ndis_sp_visible == true ?
                            <div className="row py-2">
                                <div className="w-40-lg col-lg-4 col-sm-6 ">

                                    <fieldset className="slds-form-element">
                                        <legend className="slds-form-element__legend slds-form-element__label">Needs support plan</legend>
                                        <div className="slds-form-element__control">
                                            <span className="slds-radio">
                                                <input type="radio" id="radio-47" name="need_support_plan" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.need_support_plan == 1) ? true : false} data-rule-required="true" />
                                                <label className="slds-radio__label" htmlFor="radio-47">
                                                    <span className="slds-radio_faux"></span>
                                                    <span className="slds-form-element__label">Yes</span>
                                                </label>

                                                <input type="radio" id="radio-48" name="need_support_plan" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.need_support_plan == 0) ? true : false} data-rule-required="true" />
                                                <label className="slds-radio__label" htmlFor="radio-48">
                                                    <span className="slds-radio_faux"></span>
                                                    <span className="slds-form-element__label">No</span>
                                                </label>
                                            </span>
                                        </div>
                                    </fieldset>

                                </div>
                                <div className="w-40-lg col-lg-4 col-sm-6 ">
                                </div>
                            </div> : ""}

                        <div className="row py-1">
                            <div className="w-50-lg col-lg-4 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Assigned To</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.owner}
                                                cache={false}
                                                loadOptions={(e) => getOptionsLeadStaff(e, [])}
                                                onChange={(e) => this.setState({ owner: e })}
                                                placeholder="Please Search"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-50-lg col-lg-4 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Account (Person/Org) Name</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.account_person}
                                                cache={false}
                                                loadOptions={(e) => getOptionsAccountPersonName(e, [])}
                                                onChange={(e) => this.setState({ account_person: e })}
                                                placeholder="Please Search"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row py-1">
                            <div className="w-50-lg col-lg-4 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        <abbr className="slds-required" ></abbr>Amount ($$)</label>
                                    <div className="slds-form-element__control">
                                        <input type="text" name="amount" placeholder="00"
                                            onChange={(e) => handleChange(this, e)}
                                            value={this.state.item_amount || (this.state.amount || '')}
                                            data-rule-required="false"
                                            disabled={this.state.item_amount? true : false}
                                            maxLength="13"
                                            pattern={REGULAR_EXPRESSION_FOR_AMOUNT} className="slds-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Related Lead</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.related_lead}
                                                cache={false}
                                                loadOptions={(e) => getOptionsRelatedLead(e, [])}
                                                onChange={(e) => this.setState({ related_lead: e })}
                                                placeholder="Please Search"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Source</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect
                                                required={false}
                                                simpleValue={true}
                                                className="SLDS_custom_Select default_validation"
                                                simpleValue={true}
                                                searchable={false}
                                                placeholder="Please Select"
                                                clearable={false}
                                                options={this.state.lead_source_code_option}
                                                onChange={(value) => this.handleChange(value, 'opportunity_source')}
                                                value={this.state.opportunity_source || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div className="w-50-lg col-lg-4 col-sm-6">
                                <div className="slds-form-element">
                                        <label className="slds-form-element__label">Description</label>
                                        <div >
                                            <textarea
								                className="slds-textarea"
								                name="oppurtunity_description"
								                placeholder="Description"
                                                onChange={(e)=>handleChangeSelectDatepicker(this, e.target.value, 'oppurtunity_description')}
                                                value= {this.state.oppurtunity_description ?  this.state.oppurtunity_description : (this.state.related_lead && this.state.related_lead.lead_description) ? this.state.related_lead.lead_description : ''}
                                                />
                                        </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
            </IconSettings>
        )
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(CreateOpportunityBox);