import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'
import jQuery from 'jquery'
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';


import { postData, css, AjaxConfirm, toastMessageShow } from 'service/common.js'

import { SLDSPath } from '../../../salesforce/lightning/SLDSPath.jsx'
import ChooseFinalStagePopUp from './../ChooseFinalStagePopUp.jsx'

import '../../../scss/components/admin/crm/pages/sales/LeadDetails.scss'


class RiskAssessmentStatusPath extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);
        this.state = {

        }
    }

    closeConvertModal = () => {
        this.setState({selected_status : ""});
    }

    closeChooseFinalStatusModal = (status) => {
        if (status) {
            
        } else {
            this.setState({ selected_status: "" })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    selectStatus = (selected_status) => {
        if (selected_status === "close") {
            this.setState({ openChooseFinalStausModal: true })
        }

        if (this.props.risk_status != 'close') {
            this.setState({ selected_status: selected_status })
        }
    }

    /**
     * @todo Write unit test for this
     * @param {number} status
     */
    determineStatusPaths(status) {

        // WARNING: Don't provide `status` as non-number 
        // It is not yet tested for non-numbers

        const STATUS_DRAFT = 1
        const STATUS_FINAL = 2
        const STATUS_INACTIVE = 3

        const path = [
            {
                title: 'Draft',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status <= STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-new': status === STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-active': status === STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-current': this.state.selected_status === STATUS_DRAFT,
                    'slds-is-complete': status > STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                }),
                onClick: () => this.selectStatus(STATUS_DRAFT),
            },
            {
                title: 'Closed',
                visible: (status == STATUS_FINAL || status == STATUS_INACTIVE)? false: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': this.state.selected_status != STATUS_INACTIVE,
                    'slds-is-current': this.state.selected_status === STATUS_INACTIVE || this.state.selected_status == STATUS_FINAL,
                }),
                onClick: () => this.selectStatus("close"),
            },
            {
                title: 'Active',
                visible: status === STATUS_FINAL,
                icon: 'check',
                className: classNames({
                    'slds-is-active': status === STATUS_FINAL,
                    'slds-is-won': status === STATUS_FINAL,
                    'slds-is-complete': status === STATUS_FINAL,
                    'slds-is-current': this.state.selected_status === STATUS_FINAL
                }),
                onClick: () => this.selectStatus(STATUS_FINAL),
            },
            {
                title: 'Inactive',
                visible: status == STATUS_INACTIVE,
                icon: 'check',
                className: classNames({
                    'slds-is-lost': status === STATUS_INACTIVE,
                }),
                onClick: () => this.selectStatus(STATUS_INACTIVE),
            },
        ]

        return path
    }

    updateStatus = () => {
        if (!this.state.selected_status) {
            toastMessageShow("Please select status", "e");
            return false;
        }

        if (this.state.selected_status == 4) {
            jQuery("#cancel_reason").validate({ /* */ });
            this.setState({ validation_calls: true })

            if (!jQuery("#cancel_reason").valid()) {
                return false;
            }
        }
        var req = { reason_drop: this.state.reason_drop, reason_note: this.state.reason_note, risk_assessment_id: this.props.risk_assessment_id, status: this.state.selected_status }
        postData('sales/RiskAssessment/update_status_risk_assessment', req).then((result) => {
            if (result.status) {
                this.props.getRADetails(this.props.risk_assessment_id);
                this.setState({ selected_status: "", reason_note: "", reason_drop: "" })
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }


    /**
     * Renders the 'path' stages
     */
    render() {
        const { risk_status } = this.props
        let status = risk_status ? parseInt(risk_status) : 0

        // Want to test statuses? Uncomment this
        // status = 0

        const paths = this.determineStatusPaths(status)
        const visiblePaths = paths.filter(p => p.visible)

        const actionProps = {
            buttonText: `Mark status as Complete`,
            //disabled: [3, 4].indexOf(status) >= 0, // qualified=3, unqualified=4
            onClick: () => this.updateStatus(),
        }

        var final_status = [{value: "2", label : "Active"}, {value: "3", label : "Inactive"}]; 

        return (
            <>
                <div className="slds-col">
                    <SLDSPath
                        path={visiblePaths}
                        actionProps={actionProps}
                    />
                </div>

                <ChooseFinalStagePopUp
                    selected_status={this.state.selected_status}
                    openModal={this.state.openChooseFinalStausModal}
                    onSelect={(value) => this.selectStatus(value)}
                    closeModal={this.closeChooseFinalStatusModal}
                    option={final_status}
                />
            </>
        )
    }

}

export default RiskAssessmentStatusPath;