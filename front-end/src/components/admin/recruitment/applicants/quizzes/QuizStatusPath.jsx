import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import jQuery from 'jquery'
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';

import { SLDSPath } from '../../../salesforce/lightning/SLDSPath.jsx';
import { postData, css, Confirm, toastMessageShow, AjaxConfirm } from 'service/common';
// import '../../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
class QuizStatusPath extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected_status_id: undefined,
            selected_status_label: '',
            status_options: [],
            status_final : []
        }
    }

    /**
     * setting state when user clicks on any status (excluding the modal status)
     */
    selectStatus = (val) => {
        if (val.value === this.props.quiz.task_status) {
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
    updateApplicantQuizStatus = () => {
        if (this.state.selected_status_id == undefined) {
            toastMessageShow("Please select status", "e");
            return false;
        }

        if(this.state.selected_status_id < this.props.quiz.task_status){
            toastMessageShow("Status cannot be reverted", "e");
            return false;
        }

        var req = { id: this.props.props.match.params.id, quiz_task_status: this.state.selected_status_id }
        postData('recruitment/RecruitmentQuiz/update_quiz_status', req).then((result) => {
            if (result.status) {
                this.props.get_applicant_quiz_by_id(this.props.props.match.params.id);
                this.setState({selected_status_label: "", selected_status_id: undefined})
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
        this.get_quiz_statuses();
        this.get_quiz_statuses_final();
    }

    /**
     * fetching the quiz statuses
     */
    get_quiz_statuses = () => {
		postData("recruitment/RecruitmentQuiz/get_quiz_stage_status", {}).then((res) => {
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
    get_quiz_statuses_final = () => {
		postData("recruitment/RecruitmentQuiz/get_quiz_statuses_final", {}).then((res) => {
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

            this.setState({ selected_status_id: this.state.selected_final_status, selected_status_label: status_final[index]["label"] })
        } else {
            this.setState({ selected_status_label: "", selected_status_id: "" })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    /**
     * rendering components
     */
    render() {
        var status_label = this.props.quiz.status_label;
        var selected_status_close = false;      

        if (this.state.selected_status_label == "Closed" ||
            this.state.selected_status_label == "Completed" ||
            this.state.selected_status_label == "Expired") {
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
                                        if (parseInt(val.value) === parseInt(this.props.quiz.task_status)) {
                                            genral_className = "slds-is-current slds-is-active";
                                        }

                                        var complated_class_name = "";
                                        var lost_classname = "";
                                        var com_label = val.label;
                                        var selected_status_class = "slds-is-incomplete";

                                        // marking all previous statuses as green ticked
                                        if (parseInt(val.value) < parseInt(this.props.quiz.task_status)) {
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
                                        if (val.label === "Closed" && status_label === "Expired") {
                                            lost_classname = "slds-is-lost slds-is-active slds-is-current";
                                            com_label = "Expired";
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
                        <button className="slds-button slds-button_brand slds-path__mark-complete" onClick={this.updateApplicantQuizStatus}>
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
            </div> 
        );
    }

}

export default QuizStatusPath;

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