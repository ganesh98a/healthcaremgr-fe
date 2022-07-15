import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { postData, css, Confirm, toastMessageShow, AjaxConfirm } from 'service/common'

import '../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss'
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import SLDSReactSelect from '../salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from "jquery";

class ScheduleStatusPath extends React.Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            selected_status_id: false,
            selected_status_label: '',
            status_options: [],
            status_final: [],
            openChooseFinalStausModal: false,
            cancel_lost_reason_option: []
        }
    }

    /**
     * Handling the status change in closed popup
     */
    onSelect = (value, key) => {
        this.setState({ [key]: value });
    }

    /**
     * when final status modal is closed
     */
    closeChooseFinalStatusModal = (status) => {
        if (status) {
            if (!jQuery("#status_update").valid()) {
                return false;
            }
            var status_final = this.state.status_final;
            var index = status_final.findIndex(x => x.value == this.state.selected_final_status);

            this.setState({ selected_status_id: this.state.selected_final_status, selected_status_label: status_final[index]["label"] })
        } else {
            this.setState({ selected_status_label: "", selected_status_id: "" })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    /**
     * setting state when user clicks on any status (excluding the modal status)
     */
    selectStatus = (val) => {
        if (val.value === this.props.status || (val.value == 7 && (this.props.status_label === "Completed" || this.props.status_label === "Cancelled"))) {
            return false;
        }

        if (val.label === "Closed") {
            this.setState({ openChooseFinalStausModal: true });
        }
        this.setState({ selected_status_label: val.label, selected_status_id: val.value });
    }

    /**
     * when status change is requested
     */
    updateShiftStatus = () => {
        if (!this.state.selected_status_id) {
            toastMessageShow("Please select status", "e");
            return false;
        }

        if (!this.props.owner_id || this.props.owner_id === '') {
            toastMessageShow("Please add the Owner to the shift", "e");
            return false;
        }

        if (this.state.selected_status_label == "Cancelled") {
            jQuery("#cancel_reason").validate({ /* */ });
            this.setState({ validation_calls: true })

            if (!jQuery("#cancel_reason").valid()) {
                return false;
            }
        }

        var req = { reason_drop: this.state.reason_drop, reason_note: this.state.reason_note, id: this.props.id, status: this.state.selected_status_id }
        postData('schedule/ScheduleDashboard/update_shift_status', req).then((result) => {
            if (result.status) {
                this.props.get_shift_details(this.props.id);
                this.setState({ selected_status_label: "", selected_status_id: "", reason_note: "", reason_drop: ""})
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_shift_statuses_grouped();
        this.get_shift_statuses_final();
        this.get_shift_cancel_reason_option()
    }

    /**
     * fetching the cancel and lost reason options
     */
    get_shift_cancel_reason_option = () => {
		postData("schedule/ScheduleDashboard/get_shift_cancel_reason_option", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					cancel_lost_reason_option: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * fetching the shift statuses
     */
    get_shift_statuses_grouped = () => {
		postData("schedule/ScheduleDashboard/get_shift_statuses_grouped", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_options: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * fetching the shift statuses that are required in the final step
     */
    get_shift_statuses_final = () => {
		postData("schedule/ScheduleDashboard/get_shift_statuses_final", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_final: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * rendering cancellation part to collect/display cancellation reasons
     */
    renderCancelledReason = () => {
        return (
        <React.Fragment>
            {this.state.selected_status_label === "Cancelled" ?
                <div className="slds-path__content " id="path-coaching-2">
                    <div className="slds-path__coach slds-grid">
                        <div className="slds-path__keys">
                            <form id="cancel_reason">
                                <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                    <h2>Reason for Cancellation</h2>
                                </div>
                                <div class="slds-grid ">
                                    <div class="slds-size_4-of-12">
                                        <div className="slds-form" role="list">
                                            <div className="slds-form__row">
                                                <div className="slds-form__item" >
                                                    <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                        <span className="slds-form-element__label"><abbr class="slds-required" title="required">* </abbr>Reason</span>
                                                        <div className="slds-form-element__control">
                                                            <SLDSReactSelect
                                                                simpleValue={true}
                                                                className="SLDS_custom_Select default_validation"
                                                                simpleValue={true}
                                                                searchable={false}
                                                                placeholder="Please Select"
                                                                clearable={false}
                                                                options={this.state.cancel_lost_reason_option}
                                                                onChange={(value) => this.onSelect(value, 'reason_drop')}
                                                                value={this.state.reason_drop || ''}
                                                                name="reason_drop"
                                                                required={true}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="slds-form__row">
                                                <div className="slds-form__item" >
                                                    <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                        <span className="slds-form-element__label">Note</span>
                                                        <div className="slds-form-element__control">
                                                            <textarea
                                                                name="reason_note"
                                                                id="single-form-element-id-01"
                                                                class="slds-textarea"
                                                                placeholder="Note"
                                                                onChange={(e) => this.onSelect(e.target.value, "reason_note")}
                                                            >{this.state.reason_note}</textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="slds-col"></div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div> : ""}

            {this.props.status_label === "Cancelled" ?
                <div className="slds-path__content " id="path-coaching-2">
                    <div className="slds-path__coach slds-grid">
                        <div className="slds-path__keys">
                            <form id="cancel_reason">
                                <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                    <h2>Reason for Cancellation</h2>
                                </div>
                                <div class="slds-grid ">
                                    <div class="slds-size_4-of-12">
                                        <div className="slds-form" role="list">
                                            <div className="slds-form__row">
                                                <div className="slds-form__item" >
                                                    <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                        <span className="slds-form-element__label">Reason</span>
                                                        <div className="slds-form-element__control">
                                                            {this.props.cancel_reason_label}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="slds-form__row">
                                                <div className="slds-form__item" >
                                                    <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                        <span className="slds-form-element__label">Note</span>
                                                        <div className="slds-form-element__control">
                                                            {this.props.cancel_notes || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="slds-col"></div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div> : ""}

        </React.Fragment>
        )
    }

    /**
     * rendering components
     */
    render() {
        var status_label = this.props.status_label;
        var selected_status_close = false;

        if (this.state.selected_status_label == "Closed" ||
            this.state.selected_status_label == "Cancelled" ||
            this.state.selected_status_label == "Completed") {
            selected_status_close = true;
        }

        return (
            <div className="slds-path ">
                <div className="slds-grid slds-path__track">
                    <div className="slds-grid slds-path__scroller-container">
                        <div className="slds-path__scroller" role="application">
                            <div className="slds-path__scroller_inner sdls_custom_path">
                                <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">

                                    {this.state.status_options.map((val, index) => {
                                        var genral_className = "";
                                        // pre-highlighting existing status from db
                                        if (parseInt(val.value) === parseInt(this.props.status)) {
                                            var genral_className = "slds-is-current slds-is-active";
                                        }

                                        var complated_class_name = "";
                                        var lost_classname = "";
                                        var com_label = val.label;
                                        var selected_status_class = "slds-is-incomplete";

                                        // marking all previous statuses as green ticked
                                        if (parseInt(val.value) < parseInt(this.props.status)) {
                                            complated_class_name = "slds-is-complete";
                                        }

                                        // when user changes the status, we need to highlight that
                                        // Also consider final statuses for Closed status
                                        if(this.state.selected_status_label === val.label) { 
                                            selected_status_class = "slds-is-current";
                                            complated_class_name = "";
                                        }
                                        if (selected_status_close && val.label == "Closed") {
                                            selected_status_class = "slds-is-current";
                                            complated_class_name = "";
                                        }
                                        
                                        // Marking the final stage as red
                                        if (val.label === "Closed" && status_label === "Cancelled") {
                                            lost_classname = "slds-is-lost slds-is-active slds-is-current";
                                            com_label = "Cancelled";
                                        }

                                        // Marking the final stage as green
                                        if (val.label === "Closed" && status_label === "Completed") {
                                            complated_class_name = "slds-is-won slds-is-active slds-is-current";
                                            com_label = "Completed";
                                        }

                                        var className = classNames('slds-path__item', genral_className, selected_status_class, complated_class_name, lost_classname);

                                        return (
                                            <li key={index + 1} className={className} role="presentation" onClick={() => this.selectStatus(val)}>
                                                <a aria-selected="true" className="slds-path__link" href="javascript:void(0);" id="path-1" role="option" tabindex="0">
                                                    <span className="slds-path__stage">
                                                        <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                        </svg>
                                                        <span className="slds-assistive-text">Current Stage:</span>
                                                    </span>
                                                    <span className="slds-path__title" id={com_label}>{com_label}</span>
                                                </a>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="slds-grid slds-path__action">
                        <span className="slds-path__stage-name"></span>
                        <button className="slds-button slds-button_brand slds-path__mark-complete" onClick={this.updateShiftStatus} disabled={this.props.is_shift_locked || !this.props.isEditable ? true : false}>
                            <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                            </svg>Mark Status as Complete</button>
                    </div>
                </div>
                
                {this.renderCancelledReason()}

                <ChooseFinalStagePopUp
                    selected_final_status={this.state.selected_final_status}
                    openModal={this.state.openChooseFinalStausModal}
                    status_final={this.state.status_final}
                    onSelect={this.onSelect}
                    closeModal={this.closeChooseFinalStatusModal}
                />
            </div>
        );
    }

}

export default ScheduleStatusPath


/**
 * Componened to display the final status selection modal
 */
class ChooseFinalStagePopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
     * rendering components
     */
    render() {
        var status_final = this.props.status_final;
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openModal}
                    footer={[
                        <Button label="Cancel" onClick={() => this.props.closeModal(false)} />,
                        <Button label="Save" variant="brand" onClick={() => this.props.closeModal(true)} />,
                    ]}
                    onRequestClose={this.props.closeModal}
                    heading={"Choose Final Status"}
                    className="slds_custom_modal"
                    size="small"
                >

                    <form id="status_update" autoComplete="off" className="px-4 col-md-12 slds_form" style={{height: "165px"}} >
                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr class="slds-required" title="required">* </abbr>Status</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect
                                                getOptionLabel={(option) => option.label}
                                                getOptionValue={(option) => option.value}
                                                simpleValue={true}
                                                className="SLDS_custom_Select default_validation"
                                                simpleValue={true}
                                                searchable={false}
                                                placeholder="Please Select"
                                                clearable={false}
                                                options={status_final}
                                                onChange={(value) => this.props.onSelect(value, 'selected_final_status')}
                                                value={this.props.selected_final_status || ''}
                                                required={true}
                                                name="selected_final_status"
                                            />
                                        </div>
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
