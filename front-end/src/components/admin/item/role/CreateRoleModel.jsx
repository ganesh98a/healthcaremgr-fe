import React, { Component } from 'react';
import jQuery from "jquery";
import _ from 'lodash';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { SLDSISODatePicker } from '../../../admin/salesforce/lightning/SLDSISODatePicker';
import './ListRole.scss'


import {
    Modal,
    Checkbox,
    Button,
    IconSettings,
} from '@salesforce/design-system-react';
/**
 * Class: CreateRoleModel
 */
class CreateRoleModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            name: '',            
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            start_date: React.createRef(),
            end_date: React.createRef(),
        }
    }

    componentDidMount() {
        if (this.props.roleId) {
            this.get_role_details();
        }
    }

     /**
     * get role details while updating
     * @param {Obj} e
     */

    get_role_details = () => {
        this.setState({ isFetching: true,callAjax:true })
        postData('item/MemberRole/get_role_details_for_view', { roleId: this.props.roleId }).then((result) => {
            if (result.status) {
                var det = result.data;
                this.setState(result.data);                
            }
        }).finally(() => this.setState({ isFetching: false }))
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
   
    /**
     * validate the start date and end date on submit
     * @param {Obj} start_date
     * @param {str} end_date
     */

    validateDate() {
        if (this.state.end_date) {
            var d1 = new Date(this.state.start_date);
            var d2 = new Date(this.state.end_date);
            var same = d1.getTime() === d2.getTime();
            var notSame = d1.getTime() !== d2.getTime();
            if (d1.getTime() < d2.getTime() || d1.getTime() === d2.getTime()) {
                return true

            } else if (d1.getTime() > d2.getTime()) {
                toastMessageShow("End date should be greater than start date", "e");
                return false
            }
        } else {
            return true;
        }
    }

    /**
     * Call the create api when user save role
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        
        jQuery("#create_role").validate({ /* */ });
        var url = 'item/MemberRole/create_update_role';       
        var validator = jQuery("#create_role").validate({ ignore: [] });

        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_role").valid() && this.validateDate()) {

            this.setState({ loading: true });
            var req = {
                ...this.state,                
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let role_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        role_id = resultData.role_id || '';
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
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.roleId ? "Edit Role" : "Create Role"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top createlistrole_popup" >
                            <div className="container-fluid">
                                <form id="create_role" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Name</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder=""
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={(value) => this.handleChange(value)}
                                                        value={this.state.name || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    Description</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        type="text"
                                                        name="description"
                                                        placeholder=""
                                                        required={false}
                                                        className="slds-input"
                                                        onChange={(value) => this.handleChange(value)}
                                                        value={this.state.description || ''}
                                                    />
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
                                                            placeholder="Start Date"
                                                            onChange={this.handleChangeDatePicker('start_date')}
                                                            onOpen={this.handleDatePickerOpened('start_date')}
                                                            onClear={this.handleChangeDatePicker('start_date')}
                                                            value={this.state.start_date}
                                                            inputProps={{
                                                                name: "start_date",
                                                                required: true,
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
                                                            placeholder="End Date"
                                                            onChange={this.handleChangeDatePicker('end_date')}
                                                            onOpen={this.handleDatePickerOpened('end_date')}
                                                            onClear={this.handleChangeDatePicker('end_date')}
                                                            value={this.state.end_date}
                                                            inputProps={{
                                                                name: "end_date",
                                                                required: false,
                                                            }}
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
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateRoleModel;
