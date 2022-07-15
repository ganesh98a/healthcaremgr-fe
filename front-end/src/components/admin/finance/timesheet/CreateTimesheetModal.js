import React, { Component } from 'react';
import jQuery from "jquery";
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
    Input,
    IconSettings
} from '@salesforce/design-system-react';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss';


/**
 * to fetch the shifts as user types
 */
const getShifts = (e, data) => {
    return queryOptionData(e, "schedule/ScheduleDashboard/get_shift_name_search", { query: e }, 2, 1);
}

/**
 * Class: CreateTimesheetModel
 */
class CreateTimesheetModel extends Component {

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
            timesheet_id: this.props.id ? this.props.id : '',
            timesheet_no: '',
            amount: 0.00,
            shift_details: '',
            timesheet_query: [],
            member_id: '',
            member_label: '',
            status: '',
            status_options: [],
            query_options: [],
            actualStatus: ''
        }
    }

    /**
     * fetching the timesheet details if the modal is opened in the edit mode
     */
    get_timesheet_details = (id) => {
        postData('finance/FinanceDashboard/get_timesheet_details', { id }).then((result) => {
            if (result.status) {
                result.data.actualStatus = result.data.status;
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * fetching the reference data of timesheets
     */
    get_timesheet_ref_data = () => {
        postData("finance/FinanceDashboard/get_timesheet_ref_data").then((result) => {
            if (result.status) {
                this.setState(result.data)
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * when checkboxes are clicked inside the form
     */
    handleMultiCheckbox = (e, checkid) => {
        let tempArr = [...this.state.timesheet_query];
        var index = tempArr.indexOf(checkid);
        if(e.target.checked == true) {
            if(index == -1) {
                tempArr.push(checkid);
            }
        }
        else if (index > -1) {
            this.setState({header_checkbox: false});
            tempArr.splice(index, 1);
        }
        this.setState({timesheet_query: tempArr});
    }
    
    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        if (key == 'status' && this.state.actualStatus >= 3 && value <= 3) {
            toastMessageShow('Cannot revert the status as the timesheet is published', 'e');
            return false;
        }
        this.setState({ [key]: value });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        this.get_timesheet_ref_data();
        if(this.props.id) {
            this.setState({ timesheet_id: this.props.id });
            this.get_timesheet_details(this.props.id);
        }
        this.setState({ loading: false });
    }
    /**
     * Calling the API to create/update the timesheet
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_timesheet").validate({ /* */ });        
        var url = 'finance/FinanceDashboard/create_update_timesheet';
        var validator = jQuery("#create_timesheet").validate({ ignore: [] });
        
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#create_timesheet").valid()) {
            this.setState({ loading: true });
            var req = {
                id: this.state.timesheet_id,
                status: this.state.status,
                amount: this.state.amount,
                shift_id: this.state.shift_details ? this.state.shift_details.value : '',
                member_id: this.state.member_id,
                timesheet_no: this.state.timesheet_no,
                timesheet_query: this.state.timesheet_query
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
            <form id="create_timesheet" autoComplete="off" className="slds_form">
                <div className="container-fluid">
                    {this.props.id &&(<div className="row py-2">
                        <div className="col-lg-6 col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >
                                    <abbr className="slds-required" title="required">* </abbr>Timesheet No: 
                                </label>
                                <div className="slds-form-element__control">
                                {this.state.timesheet_no || ''}
                                </div>
                            </div>
                        </div>
                    </div>)}
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Shift</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect.Async clearable={false}
                                            className="SLDS_custom_Select default_validation"
                                            value={this.state.shift_details}
                                            cache={false}
                                            required={true}
                                            loadOptions={(e) => getShifts(e, [])}
                                            onChange={(e) => {
                                                console.log(e);
                                                this.setState({ shift_details: e, member_id: e.member_id, member_label: e.member_label })}
                                            }
                                            placeholder="Please Search"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Shift Support Worker</label>
                                <div className="slds-form-element__control">
                                    <input type="text"
                                        name="member_label"
                                        placeholder="Member Name"
                                        disabled={true}
                                        value={this.state.member_label || ''}
                                        className="slds-input" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-sm-6">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label"><abbr className="slds-required" title="required">* </abbr>Status</label>
                                <div className="slds-form-element__control">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.status_options}
                                            onChange={(value) => this.handleChange(value, 'status')}
                                            value={this.state.status >= 0 ? this.state.status : ''}
                                            clearable={false}
                                            searchable={true}
                                            placeholder="Please Select"
                                            required={true}
                                            name="Timesheets Category"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                        <label className="slds-form-element__label">Query</label>
                            <div className="slds-form-element">
                            {
                            this.state.query_options.map((row, idx) => {
                                var checkid = row.value;
                                var check_index = this.state.timesheet_query.indexOf(checkid);
                                var checked = (check_index == -1) ? false : true;
                                return (
                                <span className="slds-checkbox slds-float_left col col-sm-4">
                                    <input type="checkbox" name={checkid} id={checkid} onChange={(e) => this.handleMultiCheckbox(e, checkid)} checked={checked}/>
                                    <label className="slds-checkbox__label" htmlFor={checkid}>
                                        <span className="slds-checkbox_faux"></span>
                                        <span className="slds-form-element__label">{row.label}</span>
                                    </label>
                                </span>
                                )
                            })
                            }
                            </div>
                        </div>
                    </div>
                    <div className="row py-2">&nbsp;</div>
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
                        heading={this.props.id ? "Update Timesheet" : "Create New Timesheet"}
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

export default CreateTimesheetModel;
