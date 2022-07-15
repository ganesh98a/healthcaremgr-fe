import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { postData, css, Confirm, toastMessageShow, AjaxConfirm } from 'service/common'

import '../../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss'
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from "jquery";

class OpportunityStatusPath extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_status_id: false,
            selected_status_key_name: '',
        }

    }

    onSelect = (value, key) => {
        this.setState({ [key]: value });
    }

    closeChooseFinalStatusModal = (status) => {
        if (status) {
            if (!jQuery("#create_opp").valid()) {
                return false;
            }
            
            var final_opportunity_status_list = this.props.final_opportunity_status_list
            var index = final_opportunity_status_list.findIndex(x => x.id == this.state.selected_final_status);

            this.setState({ selected_status_id: this.state.selected_final_status, selected_status_key_name: final_opportunity_status_list[index]["key_name"] })
        } else {
            this.setState({ selected_status_key_name: "", selected_status_id: "" })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    selectStatus = (val) => {
        if (val.key_name === this.props.opportunity_status_key_name) {
            return false;
        }

        if (val.key_name === "closed") {
            this.setState({ openChooseFinalStausModal: true });
        }
        this.setState({ selected_status_key_name: val.key_name, selected_status_id: val.id });
    }

    updateStatusOpportunity = () => {
        if (!this.state.selected_status_id) {
            toastMessageShow("Please select status", "e");
            return false;
        }

        if (this.state.selected_status_key_name == "lost" || this.state.selected_status_key_name == "cancelled") {
            jQuery("#cancel_reason").validate({ /* */ });
            this.setState({ validation_calls: true })

            if (!jQuery("#cancel_reason").valid()) {
                return false;
            }
        }
        var req = { reason_drop: this.state.reason_drop, reason_note: this.state.reason_note, opportunity_id: this.props.id, status: this.state.selected_status_id }
        postData('sales/Opportunity/update_status_opportunity', req).then((result) => {
            if (result.status) {
                this.props.get_opportunity_details(this.props.id);
                this.setState({ selected_status_key_name: "", selected_status_id: "", reason_note: "", reason_drop: ""})
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    render() {
        var class_used_complate = ""
        var opportunity_status_key = this.props.opportunity_status_key_name;


        if (opportunity_status_key != "new") {
            class_used_complate = true;
        }

        if (this.state.selected_status_key_name == "closed" ||
            this.state.selected_status_key_name == "lost" ||
            this.state.selected_status_key_name == "won" ||
            this.state.selected_status_key_name == "cancelled") {
            var selected_status_close = (this.state.selected_status_key_name) ? true : false;
        }



        return (
            <div className="slds-path ">
                <div className="slds-grid slds-path__track">
                    <div className="slds-grid slds-path__scroller-container">
                        <div className="slds-path__scroller" role="application">
                            <div className="slds-path__scroller_inner sdls_custom_path">
                                <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">

                                    {this.props.opportunity_status_list.map((val, index) => {
                                        var genral_className = "";
                                        if (parseInt(val.id) === parseInt(this.props.opportunity_status)) {
                                            var genral_className = "slds-is-current slds-is-active";
                                        }

                                        var selected_status_class = (this.state.selected_status_key_name === val.key_name) ? "slds-is-current" : "slds-is-incomplete";
                                        if (selected_status_close && val.key_name == "closed") {
                                            selected_status_class = "slds-is-current";
                                        }

                                        var complated_class_name = ""
                                        if (class_used_complate && parseInt(val.id) < parseInt(this.props.opportunity_status)) {
                                            var complated_class_name = "slds-is-complete";
                                        }

                                        

                                        if (val.key_name === "lost" && opportunity_status_key === "lost") {
                                            var complated_class_name = "";
                                            var lost_classname = "slds-is-lost slds-is-active slds-is-current"
                                        }

                                        if (val.key_name === "cancelled" && opportunity_status_key === "cancelled") {
                                            var complated_class_name = "";
                                            var lost_classname = "slds-is-lost slds-is-active slds-is-current"
                                        }

                                        if (val.key_name === "won" && opportunity_status_key === "won") {
                                            var complated_class_name = "slds-is-won slds-is-active slds-is-current";
                                        }

                                        if(selected_status_class === "slds-is-current"){
                                            var complated_class_name = "";
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
                                                    <span className="slds-path__title">{val.name}</span>
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
                        <button className="slds-button slds-button_brand slds-path__mark-complete" onClick={this.updateStatusOpportunity}>
                            <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                            </svg>Mark Status as Complete</button>
                    </div>
                </div>

                {this.state.selected_status_key_name === "lost" || this.state.selected_status_key_name === "cancelled" ?
                    <div className="slds-path__content " id="path-coaching-2">
                        <div className="slds-path__coach slds-grid">
                            <div className="slds-path__keys">
                                <form id="cancel_reason">
                                    <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                        <h2>Reason for {this.state.selected_status_key_name}</h2>
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
                                                                    options={this.props.cancel_lost_reason_option}
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
                                                                    placeholder="Placeholder Text"
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

                {this.props.opportunity_status_key_name === "lost" || this.state.opportunity_status_key_name === "cancelled" ?
                    <div className="slds-path__content " id="path-coaching-2">
                        <div className="slds-path__coach slds-grid">
                            <div className="slds-path__keys">
                                <form id="cancel_reason">
                                    <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                        <h2>Reason for {this.props.opportunity_status_key_name}</h2>
                                    </div>
                                    <div class="slds-grid ">
                                        <div class="slds-size_4-of-12">
                                            <div className="slds-form" role="list">
                                                <div className="slds-form__row">
                                                    <div className="slds-form__item" >
                                                        <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                            <span className="slds-form-element__label">Reason</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.cancel_lost_reason_details.reason_label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="slds-form__row">
                                                    <div className="slds-form__item" >
                                                        <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                            <span className="slds-form-element__label">Note</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.cancel_lost_reason_details.reason_note || "N/A"}
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


                <ChooseFinalStagePopUp
                    selected_final_status={this.state.selected_final_status}
                    openModal={this.state.openChooseFinalStausModal}
                    final_opportunity_status_list={this.props.final_opportunity_status_list}
                    onSelect={this.onSelect}
                    closeModal={this.closeChooseFinalStatusModal}
                />
            </div >
        );
    }

}

export default OpportunityStatusPath

class ChooseFinalStagePopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }

    }


    render() {
        var final_opportunity_status_list = this.props.final_opportunity_status_list.map((val, index) => {
            val.label = val.name;
            val.value = val.id;
            return val;
        })
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

                    <form id="create_opp" autoComplete="off" className="px-4 col-md-12 slds_form" style={{height: "165px"}} >
                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr class="slds-required" title="required">* </abbr>Status</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect
                                                getOptionLabel={(option) => option.name}
                                                getOptionValue={(option) => option.id}
                                                simpleValue={true}
                                                className="SLDS_custom_Select default_validation"
                                                simpleValue={true}
                                                searchable={false}
                                                placeholder="Please Select"
                                                clearable={false}
                                                options={final_opportunity_status_list}
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
