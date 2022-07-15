import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, handleChange, } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
    Input,
    Datepicker,
    Timepicker,
    Badge,
    Icon
} from '@salesforce/design-system-react';
import moment from 'moment';
import '../../scss/components/admin/item/item.scss';
import '../../scss/components/admin/member/member.scss';
import { SLDSISODatePicker } from '../../oncallui-react-framework/salesforce/SLDSISODatePicker';

/**
 * Class: CreateReferenceData
 */
class CreateReferenceData extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            ref_type: [],
            operation: 'A',
            definition: this.props.selected_item && this.props.selected_item.definition ? this.props.selected_item.definition : '',
            parent_id: this.props.selected_item && this.props.selected_item.parent_id ? this.props.selected_item.parent_id : ''

        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            start_date: React.createRef(),
            end_date: React.createRef(),
        }
    }

    componentDidMount() {
        this.getReferenceDataMasterList();
    }

    getReferenceDataMasterList = () => {
        postData('recruitment/RecruitmentReferenceData/get_ref_master_list', {}).then((result) => {
            if (result.status) {
                this.setState({
                    ref_type: result.data.data_type,
                }, () => { });
            }
        });
    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        this.setState({
            [key]: dateYmdHis
        })
    }


    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value });
    }

    /**
     * Call the create and update api when user save quiz
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_ref_data").validate({ /* */ });
        var url = 'recruitment/RecruitmentReferenceData/save_ref_data';
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_ref_data").valid()) {
            this.setState({ loading: true });

            // Call Api
            postData(url, this.state).then((result) => {
                if (result.status) {
                    let form_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        form_id = resultData.form_id || '';
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
        }
    }
    renderSourceAndDefinition = () => {
        return (
            <>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-2">Parent Id</label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    name="parent_id"
                                    placeholder="Enter Parent Id"
                                    required={true}
                                    className="slds-input"
                                    value={this.state.parent_id || ''}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-2">Definition</label>
                            <div className="slds-form-element__control">
                                <textarea
                                    required={false}
                                    className="slds-textarea"
                                    name="description"
                                    placeholder="Definition"
                                    value={this.state.definition ? this.state.definition : ''}
                                    disabled={true}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }


    /**
     * rendering sechedule timing part of the schedule form
     */
    RenderBasicsSection() {
        return (
            <React.Fragment>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                <abbr className="slds-required" title="required">* </abbr>Type</label>
                            <div className="slds-form-element__control">
                                <SLDSReactSelect
                                    simpleValue={true}
                                    className="custom_select default_validation"
                                    options={this.state.ref_type}
                                    onChange={(value) => this.handleChange(value, 'type')}
                                    value={this.state.type || ''}
                                    clearable={false}
                                    searchable={false}
                                    placeholder="Please Select"
                                    required={true}
                                    name="type"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                <abbr className="slds-required" title="required">* </abbr>Code</label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter Code"
                                    required={true}
                                    className="slds-input"
                                    onChange={(e) => this.handleChange(e.target.value, "code")}
                                    value={this.state.code || ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                <abbr className="slds-required" title="required">* </abbr>Display Name</label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter Display Name"
                                    required={true}
                                    className="slds-input"
                                    onChange={(e) => this.handleChange(e.target.value, "display_name")}
                                    value={this.state.display_name || ''}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-2">Parent Id</label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter Parent Id"
                                    required={true}
                                    className="slds-input"
                                    onChange={(e) => this.handleChange(e.target.value, "parent_id")}
                                    value={this.state.parent_id || ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">

                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-2">Start Date</label>
                            <div className="slds-form-element__control" role="none">
                                <div className="SLDS_date_picker_width">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <SLDSISODatePicker
                                            type="date"
                                            ref={this.datepickers.start_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="date_picker"
                                            placeholder="DD/MM/YYYY"
                                            onChange={this.handleChangeDatePicker('start_date')}
                                            value={this.state.start_date || ''}
                                            input={<input name="start_date" />}
                                            clearable={false}
                                            relativeYearFrom={0}
                                            dateDisabled={(data) =>
                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                            }
                                        />
                                    </IconSettings>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">End Date</label>
                            <div className="slds-form-element__control" role="none">
                                <div className="SLDS_date_picker_width">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <SLDSISODatePicker
                                            type="date"
                                            ref={this.datepickers.end_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="date_picker"
                                            placeholder="DD/MM/YYYY"
                                            onChange={this.handleChangeDatePicker('end_date')}
                                            value={this.state.end_date || ''}
                                            input={<input name="end_date" />}
                                            clearable={false}
                                            relativeYearFrom={0}
                                            dateDisabled={(data) =>
                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                            }
                                        />
                                    </IconSettings>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-1">Source</label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter Source"
                                    required={true}
                                    className="slds-input"
                                    onChange={(e) => this.handleChange(e.target.value, "source")}
                                    value={this.state.source || ''}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="text-input-id-2">Definition</label>
                            <div className="slds-form-element__control">
                                <textarea
                                    required={false}
                                    className="slds-textarea"
                                    name="description"
                                    placeholder="Definition"
                                    onChange={(e) => this.handleChange(e.target.value, "definition")}
                                    value={this.state.definition ? this.state.definition : ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
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
                        footer={!this.props.selected_item && [
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.selected_item ? "View Reference Data" : "Create Reference Data"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top createlistrole_popup badgesettings">
                            <div className="container-fluid">
                                <form id="create_ref_data" autoComplete="off" className="slds_form">
                                    {!this.props.selected_item && this.RenderBasicsSection()}
                                    {this.props.selected_item && this.renderSourceAndDefinition()}
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateReferenceData;
