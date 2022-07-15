import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { postData, css, Confirm, toastMessageShow, AjaxConfirm } from 'service/common'

import '../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss'
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from "jquery";

class TimesheetStatusPath extends React.Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            selected_status_id: undefined,
            selected_status_label: '',
            status_options: [],
        }
    }

    /**
     * setting state when user clicks on any status (excluding the modal status)
     */
    selectStatus = (val) => { 
        //Disable to select backward options if status pending payment or paid
        if (this.props.status >= 3 && val.value <= 3) {
            toastMessageShow('Cannot revert the status as the timesheet is published', 'e');
            return false;
        }
        this.setState({ selected_status_label: val.label, selected_status_id: val.value });
    }

    /**
     * when status change is requested
     */
    updateTimesheetStatus = () => {
        if (this.state.selected_status_id == undefined) {
            toastMessageShow("Please select status", "e");
            return false;
        }

        var req = { id: this.props.id, status: this.state.selected_status_id }
        postData('finance/FinanceDashboard/update_timesheet_status', req).then((result) => {
            if (result.status) {
                this.props.get_timesheet_details(this.props.id);
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
        this.get_timesheet_statuses();
    }

    /**
     * fetching the timesheet statuses
     */
    get_timesheet_statuses = () => {
		postData("finance/FinanceDashboard/get_timesheet_statuses", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_options: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * rendering components
     */
    render() {
        var status_label = this.props.status_label;

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
                                            genral_className = "slds-is-current slds-is-active";
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

                                        // Marking the final stage as green
                                        if (status_label === "Paid" && parseInt(val.value) === parseInt(this.props.status)) {
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
                        <button className="slds-button slds-button_brand slds-path__mark-complete"
                        onClick={this.updateTimesheetStatus}>
                            <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                            </svg>Mark Status as Current</button>
                    </div>
                </div>
            </div>
        );
    }

}

export default TimesheetStatusPath
