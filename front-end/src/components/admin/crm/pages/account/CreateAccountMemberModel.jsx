import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, handleChange } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    IconSettings,
} from '@salesforce/design-system-react';
import moment from 'moment';
import { SLDSISODatePicker } from '../../../../admin/salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';

/**
 * Get accounts names using the typed keywords
 */
const getAccountsName = (e, data) => {
    return queryOptionData(e, "sales/Account/account_name_search", { query: e }, 2, 1);
}

/**
 * Get members names using the typed keywords
 */
const getMembersName = (e, data) => {
    return queryOptionData(e, "member/MemberDashboard/get_member_name_search", { query: e }, 2, 1);
}

/**
 * Class: CreateAccountMembersModel
 */
class CreateAccountMembersModel extends Component {

    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);

        // Check user is logged in or not
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            account_id: this.props.account_id ? this.props.account_id : '',
            id: this.props.id ? this.props.id : '',
            account: '',
            member: '',
            account_disabled: false,
            member_id: '',
            reg_date: '',
            ref_no: ''
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            reg_date: React.createRef()
        }
    }

    /**
     * Update the account name
     */
    updateAccountName = (item) => {
        var state = {};
        state['account'] = item;
        this.setState(state);
    }

    /**
     * Update the member name
     */
    updateMemberName = (item) => {
        var state = {};
        state['member'] = item;
        this.setState(state);
    }

    /**
     * fetching the organisation member details if the modal is opened in the edit mode
     */
    get_organisation_member_details = (id) => {
        postData('sales/Account/get_organisation_member_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the organisation details if the account_id is passed
     */
    get_organisation_account_details = (id) => {
        postData('sales/Account/get_organisation_account_details', { org_id: id }).then((result) => {
            if (result.status) {
                this.setState({account: result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the reference data (unavailability type) of member's object
     */
    getReferenceData = () => {
		postData("item/participant/get_participant_member_ref_data").then((res) => {
			if (res.status) {
				this.setState({ 
                    status_option: (res.data) ? res.data : []
				})
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
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        if (this.props.account_id) {
            this.setState({ account_id: this.props.account_id });
            this.get_organisation_account_details(this.props.account_id);
        }

        if(this.props.id) {
            this.setState({ id: this.props.id, account_disabled: true });
            this.get_organisation_member_details(this.props.id);
        }
        this.getReferenceData();
        this.setState({ loading: false });
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
     * Calling the API to create/update the account members
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_account_member").validate({ /* */ });        
        var url = 'sales/Account/create_update_org_member';
        var validator = jQuery("#create_account_member").validate({ ignore: [] });
        
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#create_account_member").valid()) {
            this.setState({ loading: true });
            var req = {
                id: this.state.id,
                ref_no: this.state.ref_no,
                member_id: this.state.member ? this.state.member.value : '',
                org_id: this.state.account ? this.state.account.value : '',
                status: this.state.status ? this.state.status : '',
                reg_date: this.state.reg_date ? moment(this.state.reg_date).format('YYYY-MM-DD') : ''
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
            console.log("failed");
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
                        heading={this.props.id ? "Update Registered Support Worker" : "Add Registered Support Worker"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_account_member" autoComplete="off" className="slds_form">
                                    <div className="row py-2 pt-3">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                <abbr className="slds-required" title="required">* </abbr>Account</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        disabled={this.state.account_disabled}
                                                        name='account'
                                                        loadOptions={(e) => getAccountsName(e, [])}
                                                        clearable={false}
                                                        placeholder='Search Organisations'
                                                        cache={false}
                                                        value={this.state.account}
                                                        onChange={(e) => this.updateAccountName(e) }
                                                        inputRenderer={(props) => <input  {...props} name={"account"} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                <abbr className="slds-required" title="required">* </abbr>Support Worker</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name="member"
                                                        loadOptions={(e) => getMembersName(e, [])}
                                                        clearable={false}
                                                        placeholder='Search support worker'
                                                        cache={false}
                                                        value={this.state.member}
                                                        onChange={(e) => this.updateMemberName(e) }
                                                        inputRenderer={(props) => <input  {...props} name={"member"} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">Registration Date</label>
                                                <div className="slds-form-element__control">
                                                    <div className="SLDS_date_picker_width">
                                                         <SLDSISODatePicker
                                                                ref={this.datepickers.reg_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                className="customer_signed_date"
                                                                placeholder="Registration Date"
                                                                onChange={this.handleChangeDatePicker('reg_date')}
                                                                onOpen={this.handleDatePickerOpened('reg_date')}
                                                                onClear={this.handleChangeDatePicker('reg_date')}
                                                                value={this.state.reg_date}
                                                                input={<Input name="reg_date"/>}
                                                                inputProps={{
                                                                    name: "reg_date",
                                                                    required: false
                                                                }}
                                                            />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" >Reference Number</label>
                                                <div className="slds-form-element__control">
                                                    <input type="text"
                                                    name="ref_no"
                                                    placeholder="Reference Number"
                                                    onChange={(e) => handleChange(this, e)}
                                                    value={this.state.ref_no || ''}
                                                    className="slds-input" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2 pb-5">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">Status</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="SLDS_custom_Select default_validation slds-select"
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        options={this.state.status_option}
                                                        onChange={(e) => this.handleChange(e, 'status')}
                                                        value={this.state.status}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row pb-5"></div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateAccountMembersModel;
