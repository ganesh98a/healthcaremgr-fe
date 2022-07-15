import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import jQuery from 'jquery'
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect.jsx';

import { SLDSPath } from '../../salesforce/lightning/SLDSPath.jsx'
import { postData, css, Confirm, toastMessageShow, AjaxConfirm } from 'service/common';
import '../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import GBCancelInvite from './GBCancelInvite';

const successful_status = 3
const unsuccessful_status = 4
class GroupBookingStatusPath extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected_status_id: undefined,
            selected_status_label: '',
            status_options: [],
            status_final : [],
            updating_status: false,
            selected_final_status_reason: '',
            openCancelInvite: false,
            unsuccess_edit: true,
            reason_note: this.props.unsuccessful_reason ? this.props.unsuccessful_reason.reason_note  :  '',
            reason_drop : this.props.unsuccessful_reason ? this.props.unsuccessful_reason.reason : '',
        }

    }

    /**
     * setting state when user clicks on any status (excluding the modal status)
     */
    selectStatus = (val) => {
        if (val.value === this.props.interview_stage_status) {
            return false;
        }
        if (val.label === "Closed") {
            this.setState({ openChooseFinalStausModal: true });
        }
        this.setState({ selected_status_label: val.label, selected_status_id: val.value });
    }

    closeGBModal = (status) => {
        this.setState({openCancelInvite :  false, selected_status_label: "", selected_status_id: undefined, unsuccess_edit: true});
        this.props.closeModal(status);
    }

    /**
     * when status change is requested
     */
    updateApplicationStatus = () => {
        if((this.props.interview_stage_status == 3 || this.props.interview_stage_status == 4) && this.state.selected_status_id < 4){
            toastMessageShow("Group booking Stage cannot be reverted.", "e");
            return false;
        }
        if (this.state.selected_status_id == undefined) {
            toastMessageShow("Please select status", "e");
            return false;
        }
        
        let reason_for_drop = ''
        this.props.unsuccessful_reason_option.forEach(val => {
            if (val.label == 'Canceled' && this.state.reason_drop==val.value) {
                reason_for_drop = 'Canceled';
            }else if(val.label == 'Others' && this.state.reason_drop==val.value){
                reason_for_drop = 'Others';
            }
        });
     
        if (reason_for_drop == 'Canceled' && unsuccessful_status == this.state.selected_final_status && this.props.applicantRef.state.applicantList.length!=0 && this.props.ms_event_status !=1) {           
            this.setState({ selected_final_status_reason: reason_for_drop, openCancelInvite: true });
        } else {
            if(this.state.selected_status_id == 4 && !this.state.reason_drop)
            {
                toastMessageShow("Please provide reason for unsuccessful", "e");
                return;
            }
            if(this.state.selected_status_id == 4 && this.state.reason_drop_label=='Others' && !this.state.reason_note)
            {
                toastMessageShow("Please provide note", "e");
                return;
            }
            var req = { id: this.props.props.match.params.id, interview_stage_status: this.state.selected_status_id, reason_drop: this.state.reason_drop, reason_note: this.state.reason_note, selected_final_status_reason: reason_for_drop }
            this.setState({ updating_status: true });
            postData('recruitment/RecruitmentInterview/update_interview_status', req).then((result) => {
                this.setState({ updating_status: false });
                if (result.status) {
                    this.props.get_interview_by_id(this.props.props.match.params.id);
                    this.setState({ selected_status_label: "", selected_status_id: undefined, unsuccess_edit: true })
                    toastMessageShow(result.msg, "s");
                } else {
                    toastMessageShow(result.error, "e");
                }
            });
        }

    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_interview_statuses();
        this.get_interview_statuses_final();
        // this.props.getFieldHistoryItems();
    }

    /**
     * fetching the application statuses
     */
    get_interview_statuses = () => {
		postData("recruitment/RecruitmentInterview/get_interview_stage_status", {}).then((res) => {
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
    get_interview_statuses_final = () => {
		postData("recruitment/RecruitmentInterview/get_interview_statuses_final", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_final: (res.data)?res.data:[]
				})
			}
		});
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

            this.setState({ selected_status_id: this.state.selected_final_status, selected_status_label: status_final[index]["label"] },()=>{
                this.setState({unsuccess_edit: true});
                if(this.state.selected_status_label=='Unsuccessful'){
                    this.setState({unsuccess_edit: false});
                }
            })
        } else {
            this.setState({ selected_status_label: "", selected_status_id: "", unsuccess_edit: true })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    
   unsuccesful_reason_handler=(reason_drop)=>{
        const reason_drop_arr = this.props.unsuccessful_reason_option.filter((value)=>{
            return value.value == reason_drop;
        })
       if(reason_drop_arr && reason_drop_arr.length > 0)
        {
          this.setState({reason_drop,'reason_drop_label':reason_drop_arr[0]['label']})
        }
       
    }

    /**
     * rendering components
     */
    render() {
        var status_label = this.props.interview_stage_status_label;
        var selected_status_close = false;

        if (this.state.selected_status_label == "Closed" ||
            this.state.selected_status_label == "Successful" ||
            this.state.selected_status_label == "Unsuccessful") {
            selected_status_close = true;
        }

        return (      
            <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">     
            <div className="slds-path ">
                <div className="slds-grid slds-path__track">
                    <div className="slds-grid slds-path__scroller-container">
                        <div className="slds-path__scroller" role="application">
                            <div className="slds-path__scroller_inner sdls_custom_path">
                                <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">

                                    {this.state.status_options.map((val, index) => {
                                        var genral_className = "";
                                        // pre-highlighting existing status from db
                                        if (parseInt(val.value) === parseInt(this.props.interview_stage_status)) {
                                            genral_className = "slds-is-current slds-is-active";
                                        }

                                        var complated_class_name = "";
                                        var lost_classname = "";
                                        var com_label = val.label;
                                        var selected_status_class = "slds-is-incomplete";

                                        // marking all previous statuses as green ticked
                                        if (parseInt(val.value) < parseInt(this.props.interview_stage_status)) {
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
                                        if (val.label === "Closed" && status_label === "Unsuccessful") {
                                            lost_classname = "slds-is-lost slds-is-active slds-is-current";
                                            com_label = "Unsuccessful";
                                        }

                                        // Marking the final stage as green
                                        if (val.label === "Closed" && status_label === "Successful") {
                                            complated_class_name = "slds-is-won slds-is-active slds-is-current";
                                            com_label = "Successful";
                                        }

                                        var className = classNames('slds-path__item', genral_className, selected_status_class, complated_class_name, lost_classname);

                                        return (
                                            <li key={index + 1} className={className} style={{pointerEvents:this.props.archived? 'none':'fill',cursor:this.props.archived?'default':'pointer'}}role="presentation" onClick={() => this.selectStatus(val)}>
                                                <a aria-selected="true" className="slds-path__link" href="javascript:void(0);" id="path-1" role="option" tabindex="0">
                                                    <span className="slds-path__stage">
                                                        <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                                                        </svg>
                                                        <span className="slds-assistive-text">Current Stage:</span>
                                                    </span>
                                                    <span className="slds-path__title">{com_label}</span>
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
                        <button disabled={this.state.updating_status || this.props.archived} className="slds-button slds-button_brand slds-path__mark-complete" onClick={this.updateApplicationStatus}>
                            <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                            </svg>Mark Stage as Current</button>
                    </div>
                </div>
                <ChooseFinalStagePopUp
                    selected_final_status={this.state.selected_final_status}
                    openModal={this.state.openChooseFinalStausModal}
                    status_final={this.state.status_final}
                    onSelect={this.onSelect}
                    closeModal={this.closeChooseFinalStatusModal}
                />
            </div>
            
            
            {(this.state.selected_status_id == 4) || this.props.interview_stage_status == 4 ?
                    <div className="slds-path__content " id="path-coaching-2">
                        <div className="slds-path__coach slds-grid">
                            <div className="slds-path__keys">
                                <form id="cancel_reason">
                                    <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                        <h2>Reason for Unsuccessful</h2>
                                    </div>
                                    <div class="slds-grid ">
                                        <div class="slds-size_4-of-12">
                                            <div className="slds-form" role="list">
                                                <div className="slds-form__row">
                                                    <div className="slds-form__item" >
                                                        <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                            <span className="slds-form-element__label">
                                                            {this.state.selected_status_id == 4? <abbr class="slds-required" title="required">* </abbr>:  ""}Reason</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.interview_stage_status == 4 && this.state.unsuccess_edit == true ?
                                                                    (this.props.unsuccessful_reason ? this.props.unsuccessful_reason.reason_label : "" ): ""}

                                                                {this.state.selected_status_id == 4 ?
                                                                    <SLDSReactSelect
                                                                        simpleValue={true}
                                                                        className="SLDS_custom_Select default_validation"
                                                                        simpleValue={true}
                                                                        searchable={false}
                                                                        placeholder="Please Select"
                                                                        clearable={false}
                                                                        options={this.props.unsuccessful_reason_option}
                                                                        onChange={this.unsuccesful_reason_handler}
                                                                        value={this.state.reason_drop || ''}
                                                                        name="reason_drop"
                                                                        required={true}
                                                                    /> : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="slds-form__row">
                                                    <div className="slds-form__item" >
                                                        <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                        <span>{this.state.selected_status_id == 4 && this.state.reason_drop_label=='Others' ? <abbr class="slds-required" title="required">* </abbr>:  ""}Note</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.interview_stage_status == 4 && this.state.reason_drop ? (this.props.unsuccessful_reason && this.props.unsuccessful_reason.reason_note || '') : ""}

                                                                {this.state.selected_status_id == 4 ?
                                                                    <textarea
                                                                        name="reason_note"
                                                                        id="single-form-element-id-01"
                                                                        class="slds-textarea"
                                                                        placeholder="Placeholder Text"
                                                                        onChange={(e) => this.setState({"reason_note" : e.target.value})}
                                                                        value={this.state.reason_note}
                                                                    >{this.state.reason_note}</textarea> : ""}
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

                    {this.state.openCancelInvite &&
                    <GBCancelInvite
                        showModal={this.state.openCancelInvite}
                        closeGBModal={this.closeGBModal}
                        applicantRef={this.props.applicantRef}
                        is_organizer={true}
                        page_name = {'status_path'}
                        applicant_archive = {0}
                        {...this.state}
                        {...this.props}
                    />
                }
            </div> 
        );
    }

}

export default GroupBookingStatusPath;

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