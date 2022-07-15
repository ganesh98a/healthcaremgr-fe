import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { checkItsNotLoggedIn, postData, queryOptionData, toastMessageShow } from 'service/common.js';

/**
 * Get staff person as owner
 * @param {obj} e 
 * @param {array} data 
 */
const getOptionsLeadStaff = (e, data) => {
    return queryOptionData(e, "sales/RiskAssessment/get_owner_staff_search", { query: e }, 2, 1);
}

/**
 * Get person or organization as account
 * @param {obj} e 
 * @param {array} data 
 */
const getOptionsAccountPersonName = (e, data) => {
    return queryOptionData(e, "sales/RiskAssessment/get_account_person_name_search", { query: e }, 2, 1);
}

/**
 * Class: CreateRiskAssessmentModel
 */
class CreateRiskAssessmentModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            status: '1',
            topic: '',
            owner: '',
            account_person: ''
        }
    }

    /**
     * Update the state value of input 
     * @param {Obj} e
     */
    handleChange = (e) => {
        var state = {};
        this.setState({ error: '' });
        state[e.target.name] = e.target.value;
        this.setState(state);
        this.setState({ disabled: false });
    }

    /**
     * Update the account name and topic with "Need Assessment"
     * param {object} item
     */
    updateAccountName = (item) => {
        var topic = this.state.topic;
        var defaultTxt = ' Risk Assessment';
        var state = {};
        if (item && item.label) {
            topic = item.label + defaultTxt;
            state['topic'] = topic;
        }
        state['account_person'] = item;
        this.setState(state);
    }

    /**
     * Call the create api when user save risk assessment
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_risk_assessment").validate({ /* */ });
        this.setState({ validation_calls: true })
        var url = 'sales/RiskAssessment/create_risk_assessment';
        var validator = jQuery("#create_risk_assessment").validate({ ignore: [] });
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_risk_assessment").valid()) {
            this.setState({ loading: true });
            var req = {
                ...this.state,
                owner_id: this.state.owner ? this.state.owner.value : '',
                account_id: this.state.account_person ? this.state.account_person.value : '',
                account_type: this.state.account_person ? this.state.account_person.account_type : '',
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let risk_assessment_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        risk_assessment_id = resultData.risk_assessment_id || '';
                    }
                    // Trigger success pop 
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true, risk_assessment_id);
                    // Reset the state values
                    let state = this.state;
                    state['status'] = '';
                    this.setState(state);
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
                        heading={"Create Risk Assessment"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_risk_assessment" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-4">
                                                    <abbr className="slds-required" title="required">* </abbr>Account (Person/Org) Name</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name='account_person'
                                                        loadOptions={(e) => getOptionsAccountPersonName(e, [])}
                                                        clearable={false}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.account_person}
                                                        onChange={(e) => this.updateAccountName(e) }
                                                        inputRenderer={(props) => <input  {...props} name={"account_person"} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-1">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required">* </abbr>Assigned To</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name='owner'
                                                        loadOptions={(e) => getOptionsLeadStaff(e, [])}
                                                        clearable={false}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.owner}
                                                        onChange={(e) => this.setState({ owner: e })}
                                                        inputRenderer={(props) => <input  {...props} name={"owner"} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                                    <abbr className="slds-required" title="required">* </abbr>Topic</label>
                                                <div className="slds-form-element__control">
                                                    <input 
                                                        type="text"
                                                        name="topic"
                                                        placeholder="Enter Topic"
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={this.handleChange}
                                                        value={this.state.topic || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-1"></div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateRiskAssessmentModel;
