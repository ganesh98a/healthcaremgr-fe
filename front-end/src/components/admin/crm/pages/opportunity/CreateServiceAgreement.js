import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';

import { Checkbox, Input } from '@salesforce/design-system-react';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    checkItsNotLoggedIn,
    handleChangeSelectDatepicker,
    postData,
    queryOptionData,
    toastMessageShow,
} from 'service/common.js';

import { SLDSISODatePicker } from '../../../salesforce/lightning/SLDSISODatePicker';

const getOptionsLeadStaff = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_owner_staff_search", { query: e }, 2, 1);
}

const getOptionsAccountPersonName = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_account_person_name_search", { query: e }, 2, 1);
}


class CreateServiceAgreement extends Component {

    static EAdditionalServiceTypes = Object.freeze({
        support_coordination: 1,
        ndis_client_services: 2,
        supported_independent_living: 3,
        plan_management: 4,
        other: 5
    });

    static defaultProps = {
        onSuccess: () => { },

        /** @type {{label: string, value: string|number, account_type: string|number}} */
        account: undefined,
    }

    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            redirectPage: false,
            goals: [{ goal: '', outcome: '' }],
            additional_services: [],
            additional_services_custom: '',
            source_option: [],
            status_option: [{ value: "0", label: "Draft" }, { value: "1", label: "Issued" }, { value: "3", label: "Inactive" }, { value: "4", label: "Declined" }, { value: "5", label: "Active" }],
            status: 0
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            customer_signed_date: React.createRef(),
            contract_start_date: React.createRef(),
            contract_end_date: React.createRef(),
            plan_start_date: React.createRef(),
            plan_end_date: React.createRef(),
        }

        this.formRef = React.createRef()
    }


    componentDidMount() {
        const { serviceAgreement } = this.props
        // merge service agreement with current state (usually when editing)
        // Note: `serviceAgreement.account` is expected to be present as well
        if (serviceAgreement) {
            this.setState({ ...serviceAgreement })
        }
        // expects `this.props.account` when creating new svc agreement
        else {
            if (this.props.account) {
                this.setState({ account: this.props.account })
            }
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery(this.formRef.current).validate({});
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery(this.formRef.current).valid()) {
            this.setState({ loading: true });

            var req = {
                ...this.state,
                agreement_id: this.props.agreement_id,
                opp_id: this.props.opp_id,
                owner: this.state.owner ? this.state.owner.value : '',
                account: this.state.account ? this.state.account.value : '',
                account_type: this.state.account ? this.state.account.account_type : '',
                signed_by: this.state.signed_by ? this.state.signed_by.value : '',
            }
            postData('sales/Opportunity/save_service_agreement', req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    toastMessageShow(result.msg, 's');
                    this.props.closeServiceModal(true);
                    this.props.get_opportunity_details(this.props.opp_id);

                    this.props.onSuccess()

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
                jQuery("#create_user").valid()
            }
        })
    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState)
    }


    // tinker with internal Datepicker state to
    // fix calendar toggling issue with multiple datepickers
    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    handleAdditionalServicesChanged = (e) => {
        const id = parseInt(e.target.id.substring(e.target.id.lastIndexOf('-')+1));

        if (!Object.values(CreateServiceAgreement.EAdditionalServiceTypes).includes(id)) return;

        const idx = this.state.additional_services.findIndex(s => s == id);

        // state not to be modified directly; a deep copy is created
        let data = JSON.parse(JSON.stringify(this.state.additional_services)); 
        
        idx >= 0 ? data.splice(idx, 1) : data.splice(0, 0, id);    
        
        this.setState({ additional_services: data });
    }

    hasAdditionalService(id) { return this.state.additional_services.find(s => s == id) }
    
    render() {
        let service_agreement_items_total = this.state.service_agreement_items_total && this.state.service_agreement_items_total.toFixed(2) || "0.00";
        return (
            <div>

                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.openServiceDialog}
                            footer={[
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeServiceModal(false)} />,
                                <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading={this.props.agreement_id ? "Update Service Agreement" : "Create Service Agreement"}
                            size="small"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeServiceModal(false)}
                            dismissOnClickOutside={false}
                        >
                            <section className="manage_top" >
                                <div className="container-fluid">

                                    <form id="create_user" autoComplete="off" className="slds_form" ref={this.formRef}>
                                        <div className="row py-3">

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        Status</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="">
                                                            <SLDSReactSelect
                                                                simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.status_option}
                                                                onChange={(value) => this.handleChange(value, 'status')}
                                                                value={this.state.status}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                name="type"
                                                                required={false}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" for="text-input-id-1">
                                                        <abbr className="slds-required" title="required">* </abbr>Assigned To</label>
                                                    <div className="slds-form-element__control">
                                                        <SLDSReactSelect.Async clearable={false}
                                                            className="SLDS_custom_Select default_validation"
                                                            value={this.state.owner}
                                                            cache={false}
                                                            loadOptions={(e) => getOptionsLeadStaff(e, [])}
                                                            onChange={(e) => this.setState({ owner: e })}
                                                            placeholder="Please Search"
                                                            required={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" for="text-input-id-1">
                                                        {
                                                            !this.props.agreement_id && (
                                                                <abbr className="slds-required" title="required">* </abbr>
                                                            )
                                                        }
                                                        Account
                                                    </label>
                                                    <div className="slds-form-element__control">
                                                        {
                                                            !this.props.agreement_id ?
                                                                (
                                                                    <SLDSReactSelect.Async clearable={false}
                                                                        name="account"
                                                                        className="SLDS_custom_Select default_validation"
                                                                        value={this.state.account}
                                                                        cache={false}
                                                                        loadOptions={(e) => getOptionsAccountPersonName(e, [])}
                                                                        onChange={(e) => this.setState({ account: e })}
                                                                        placeholder="Please Search"
                                                                        required={true}
                                                                        backspaceRemoves={false}
                                                                    />
                                                                )
                                                                :
                                                                <span>{_.get(this.state, 'account.label')}</span>

                                                        }
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" for="text-input-id-1">
                                                       Grand Total</label>
                                                    <div className="slds-form-element__control">
                                                        <input type="text"
                                                            className="slds-input"
                                                            name="grand_total"
                                                            placeholder="Grand Total"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'grand_total')}
                                                            disabled={this.state.isGrandTotalEdit}
                                                            value={ service_agreement_items_total || (this.state.grand_total || '')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" for="text-input-id-1">
                                                       Subtotal</label>
                                                    <div className="slds-form-element__control">
                                                        <input type="text"
                                                            className="slds-input"
                                                            name="sub_total"
                                                            placeholder="Subtotal"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'sub_total')}
                                                            value={this.state.sub_total || ''}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" for="text-input-id-1">
                                                       Tax</label>
                                                    <div className="slds-form-element__control">
                                                        <input type="text"
                                                            className="slds-input"
                                                            name="tax"
                                                            placeholder="Tax"
                                                            onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'tax')}
                                                            value={this.state.tax || ''}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-lg-6 col-sm-6">

                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                      Customer Signed Date</label>

                                                    <div className="slds-form-element__control">

                                                        <div className="SLDS_date_picker_width">
                                                            <SLDSISODatePicker
                                                                ref={this.datepickers.customer_signed_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                className="customer_signed_date"
                                                                placeholder="Customer signed date"
                                                                onChange={this.handleChangeDatePicker('customer_signed_date')}
                                                                onOpen={this.handleDatePickerOpened('customer_signed_date')}
                                                                onClear={this.handleChangeDatePicker('customer_signed_date')}
                                                                value={this.state.customer_signed_date}
                                                                input={<Input name="customer_signed_date" />}
                                                                inputProps={{
                                                                    name: "customer_signed_date",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" for="text-input-id-1">
                                                       Signed By</label>
                                                    <div className="slds-form-element__control">
                                                        <SLDSReactSelect.Async clearable={false}
                                                            className="SLDS_custom_Select default_validation"
                                                            value={this.state.signed_by}
                                                            cache={false}
                                                            loadOptions={(e) => getOptionsLeadStaff(e, [])}
                                                            onChange={(e) => this.setState({ signed_by: e })}
                                                            placeholder="Please Search"
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="row py-1">
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        <abbr className="slds-required" title="required">* </abbr>Contract Start Date</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <SLDSISODatePicker
                                                                ref={this.datepickers.contract_start_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                className="contract_start_date"
                                                                placeholder="Contract Start Date"
                                                                onChange={this.handleChangeDatePicker('contract_start_date')}
                                                                onOpen={this.handleDatePickerOpened('contract_start_date')}
                                                                onClear={this.handleChangeDatePicker('contract_start_date')}
                                                                value={this.state.contract_start_date}
                                                                inputProps={{
                                                                    name: "contract_start_date",
                                                                    required: true,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        <abbr className="slds-required" title="required">* </abbr>Contract End Date</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <SLDSISODatePicker
                                                                ref={this.datepickers.contract_end_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                placeholder="Contract End Date"
                                                                onChange={this.handleChangeDatePicker('contract_end_date')}
                                                                onOpen={this.handleDatePickerOpened('contract_end_date')}
                                                                onClear={this.handleChangeDatePicker('contract_end_date')}
                                                                value={this.state.contract_end_date}
                                                                inputProps={{
                                                                    name: "contract_end_date",
                                                                    required: true,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="row py-1 mb-3">
                                            <div className="col-lg-6 col-sm-6 ">
                                                <div className="slds-form-element ">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        <abbr className="slds-required" title="required">* </abbr>Plan Start Date</label>
                                                    <div className="slds-form-element__control ">
                                                        <div className="SLDS_date_picker_width">
                                                            <SLDSISODatePicker
                                                                ref={this.datepickers.plan_start_date} // !important: ref is needed by this custom SLDSISODatePicker
                                                                placeholder="Plan Start Date"
                                                                onChange={this.handleChangeDatePicker('plan_start_date')}
                                                                onOpen={this.handleDatePickerOpened('plan_start_date')}
                                                                onClear={this.handleChangeDatePicker('plan_start_date')}
                                                                value={this.state.plan_start_date}
                                                                inputProps={{
                                                                    name: "plan_start_date",
                                                                    required: true,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label" htmlFor="select-01">
                                                        <abbr className="slds-required" title="required">* </abbr>Plan End Date</label>
                                                    <div className="slds-form-element__control">
                                                        <div className="SLDS_date_picker_width">
                                                            <SLDSISODatePicker
                                                                ref={this.datepickers.plan_end_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                placeholder="Plan end date"
                                                                onChange={this.handleChangeDatePicker('plan_end_date')}
                                                                onOpen={this.handleDatePickerOpened('plan_end_date')}
                                                                onClear={this.handleChangeDatePicker('plan_end_date')}
                                                                value={this.state.plan_end_date}
                                                                inputProps={{
                                                                    name: "plan_end_date",
                                                                    required: true,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6 col-sm-6">
                                            </div>
                                        </div>

                                        <div className="row py-1">
                                            <div className="col-lg-6 col-sm-6">
                                                <label>Other support services being provided by ONCALL:</label>
                                                <Checkbox
                                                    id={'sa-additional-services-' + CreateServiceAgreement.EAdditionalServiceTypes.support_coordination}
                                                    assistiveText={{ label: 'Support Coordination' }}
                                                    labels={{ label: 'Support Coordination' }}
                                                    onChange={this.handleAdditionalServicesChanged} 
                                                    checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.support_coordination)} />
                                                
                                                <Checkbox
                                                    id={'sa-additional-services-' + CreateServiceAgreement.EAdditionalServiceTypes.ndis_client_services}
                                                    assistiveText={{ label: 'NDIS Client Services' }}
                                                    labels={{ label: 'NDIS Client Services' }}
                                                    onChange={this.handleAdditionalServicesChanged} 
                                                    checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.ndis_client_services)} />
                                                
                                                <Checkbox
                                                    id={'sa-additional-services-' + CreateServiceAgreement.EAdditionalServiceTypes.supported_independent_living}
                                                    assistiveText={{ label: 'Supported Independent Living' }}
                                                    labels={{ label: 'Supported Independent Living' }}
                                                    onChange={this.handleAdditionalServicesChanged} 
                                                    checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.supported_independent_living)} />
                                                
                                                <Checkbox
                                                    id={'sa-additional-services-' + CreateServiceAgreement.EAdditionalServiceTypes.plan_management}
                                                    assistiveText={{ label: 'Plan Management' }}
                                                    labels={{ label: 'Plan Management' }}
                                                    onChange={this.handleAdditionalServicesChanged}
                                                    checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.plan_management)} />
                                                
                                                <Checkbox
                                                    id={'sa-additional-services-' + CreateServiceAgreement.EAdditionalServiceTypes.other}
                                                    assistiveText={{ label: 'Other' }}
                                                    labels={{ label: 'Other' }}
                                                    onChange={(e) => {
                                                         if (!e.target.checked) {
                                                            this.setState({ additional_services_custom: '', other_checked:false});
                                                         } else {
                                                            this.setState({ other_checked:true});
                                                         }
                                                         this.handleAdditionalServicesChanged(e);
                                                    }} 
                                                    checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.other)} />
                                                <Input 
                                                    style={{ display: 'inline-block' }}
                                                    disabled={!this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.other)} 
                                                    onChange={(e, data) => this.setState({ additional_services_custom: data.value })}
                                                    value={this.state.additional_services_custom} 
                                                    required={this.state.other_checked}
                                                    />
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

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateServiceAgreement);

export { CreateServiceAgreement }
