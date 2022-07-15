import React, { Component } from 'react';
import jQuery from "jquery";
import Select from 'react-select-plus';
import BlockUi from 'react-block-ui';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    IconSettings,
} from '@salesforce/design-system-react';
import SLDSSelect from '../../salesforce/lightning/SLDSReactSelect'

/**
 * Get person or organization as account
 * @param {obj} e 
 * @param {array} data 
 */
const getContactPersonName = (e, data) => {
    return queryOptionData(e, "item/Participant/get_contact_person_name_search", { query: e }, 2, 1);
}

/**
 * to fetch the roles as user types
 */
const getRoles = (e, data) => {
    return queryOptionData(e, "item/document/get_role_name_search", { query: e }, 2, 1);
}

/**
 * Class: CreateParticipantModel
 */
class CreateParticipantModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            name: '',
            contact: '',
            cost_book_id: '',
            cost_book_options: [],
            active: true,
            role_details: '',
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
    }

    /**
     * fetching the active cost book options list
     */
    get_cost_book_options() {
        postData('common/get_cost_book_options').then((result) => {
            if (result.status) {
                this.setState({ cost_book_options : result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_cost_book_options();
    }

    getOptionsLeadStaff = (e, data) => {
        return queryOptionData(e, "sales/Lead/get_owner_staff", { query: e }, 2, 1);
    }

    /**
     * Update the state value of Select option
     * @param {Obj} selectedOption
     * @param {str} fieldname
     */
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;

        this.setState(state);
    }

    /**
     * Update the contact name
     * param {object} item
     */
    updateContactName = (item) => {
        console.log("---", item);
        var state = {};
        state['contact'] = item;
        state['name'] = item.label;
        state['middlename'] = item.middlename;
        state['previous_name'] = item.previous_name;
        this.setState(state);
        this.getParticipantSafetyChecklist(item);
    }

    updateChecklistOpportunity = (item) => {
        var state = {};
        state['checklist_opportunity'] = item;
        this.setState(state);
    }

    /**
     * Call the create api when user save participant
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_participant").validate({ /* */ });        
        var url = 'item/Participant/create_participant';
        var validator = jQuery("#create_participant").validate({ ignore: [] });
        
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_participant").valid()) {

            this.setState({ loading: true });
            var service_agreement_id = this.props.service_agreement_id || '';
            var req = {
                ...this.state,
                active: this.state.active ? 1 : 0,
                contact_id: this.state.contact ? this.state.contact.value : '',
                role_id: (this.state.role_details) ? this.state.role_details.value : '',
                service_agreement_id: service_agreement_id
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let participant_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        participant_id = resultData.participant_id || '';
                    }
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
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button id="participant_cancel" disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button id="participant_save" disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"New Participant"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_participant" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">*</abbr>Contact</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        id="participant_contact"
                                                        className="default_validation"
                                                        required={true}
                                                        name='contact'
                                                        loadOptions={(e) => getContactPersonName(e, [])}
                                                        clearable={false}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.contact}
                                                        onChange={(e) => this.updateContactName(e)}
                                                        inputRenderer={(props) => <input  {...props} name={"contact"} />}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                        <div className="col-lg-6 col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01">Service Type</label>
                                                <div className="slds-form-element__control">
                                                    <div className="">
                                                        <SLDSReactSelect.Async clearable={false}
                                                            id="participant_role"
                                                            name="Service Type"
                                                            className="SLDS_custom_Select default_validation"
                                                            value={this.state.role_details}
                                                            cache={false}
                                                            required={false}
                                                            loadOptions={(e) => getRoles(e, [])}
                                                            onChange={(e) => this.setState({ role_details: e })}
                                                            placeholder="Please Search"
                                                            name="Service Type"
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
                                                    <abbr className="slds-required" title="required">* </abbr>Name</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        id="participant_name"
                                                        type="text"
                                                        name="name"
                                                        placeholder=""
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={(value) => this.handleChange(value)}
                                                        value={this.state.name || ''}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    Middle Name</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        id="middle_name"
                                                        type="text"
                                                        name="middlename"
                                                        placeholder="Middle Name"
                                                        disabled
                                                        className="slds-input"
                                                        onChange={(value) => this.handleChange(value)}
                                                        value={this.state.middlename || ''}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="row py-2">
                                        <div className="col-lg-6 col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" >Previous Name</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        id="previous_name"
                                                        type="text"
                                                        name="previousname"
                                                        placeholder="Previous Name"
                                                        disabled
                                                        className="slds-input"
                                                        onChange={(value) => this.handleChange(value)}
                                                        value={this.state.previous_name || ''}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label">Cost Book</label>
                                                <div className="slds-form-element__control">
                                                    <div className="SLDS_date_picker_width">
                                                        <SLDSReactSelect
                                                            simpleValue={true}
                                                            className="custom_select default_validation"
                                                            options={this.state.cost_book_options}
                                                            onChange={(e) => this.setState({ 'cost_book_id': e })}
                                                            value={this.state.cost_book_id || ''}
                                                            clearable={true}
                                                            searchable={true}
                                                            placeholder="Please Select"
                                                            required={false}
                                                            name="Cost Book"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">

                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label">
                                                    Assigned To
                                                 </label>
                                                <div className="slds-form-element__control">
                                                    <SLDSSelect.Async
                                                        name='owner'
                                                        isLoading={true}
                                                        loadOptions={(e) => this.getOptionsLeadStaff(e, [])}
                                                        clearable={true}
                                                        searchable={true}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.owner}
                                                        onChange={(e) => this.setState({ owner: e })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    Opportunity for Safety Checklist</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        id="checklist_opportunity"
                                                        className="default_validation"
                                                        name='checklist_opportunity'
                                                        options={this.state.checklist_opportunities || []}
                                                        cache={false}
                                                        value={this.state.checklist_opportunity}
                                                        onChange={(e) => this.updateChecklistOpportunity(e)}
                                                        inputRenderer={(props) => <input  {...props} name={"checklist_opportunity"} />}
                                                        disabled={!this.state.contact}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                                    <abbr className="slds-required" title="required"></abbr>Active</label>
                                                <div className="slds-form-element__control">
                                                    <Checkbox
                                                        id="participant_active"
                                                        assistiveText={{
                                                            label: '',
                                                        }}
                                                        labels={{
                                                            label: '',
                                                        }}
                                                        name="active"
                                                        checked={this.state.active}
                                                        onChange={(value) => this.setState({ active: !this.state.active })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }

    getParticipantSafetyChecklist = (contact) => {
        let contact_id = contact && contact.value;
        postData('item/Participant/get_staff_safety_checklist', { contact_id }).then(res => {
            if (res.status) {
                this.setState({ checklist_opportunities: res.data.checklist_opportunities })
            }
        })
    }
}

export default CreateParticipantModel;
