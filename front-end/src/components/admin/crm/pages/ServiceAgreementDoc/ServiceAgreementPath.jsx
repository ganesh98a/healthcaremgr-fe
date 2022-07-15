import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import jQuery from 'jquery'
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';

import { postData, toastMessageShow } from 'service/common.js'
import { SLDSPath } from '../../../salesforce/lightning/SLDSPath.jsx'
import '../../../scss/components/admin/crm/pages/sales/LeadDetails.scss'
import ChooseFinalStagePopUp from './../ChooseFinalStagePopUp.jsx'

class ServiceAgreementPath extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);
        this.state = {
            declined_reason_det: {},
        }
    }

    closeConvertModal = () => {
        this.setState({ selected_status: "" });
    }

    closeChooseFinalStatusModal = (status) => {
        if (status) {
            if (this.state.selected_status == 4) {
                jQuery("#create_opp").validate({ /* */ });

                if (!jQuery("#create_opp").valid()) {
                    return false;
                }
            }

        } else {
            this.setState({ selected_status: "" })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    selectStatus = (selected_status) => {
        if (selected_status === "close") {
            this.setState({ openChooseFinalStausModal: true })
        }

        if (this.props.status != 'close') {
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

        const STATUS_DRAFT = 0
        const STATUS_AWAITING_APPROVAL = 1
        // const STATUS_APPROVED = 2
        const STATUS_INACTIVE = 3
        const STATUS_DECLINED = 4
        const STATUS_ACTIVE = 5

        const path = [
            {
                title: 'Draft',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-new': status === STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-active': status === STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                    'slds-is-current': this.state.selected_status === STATUS_DRAFT,
                    'slds-is-complete': status > STATUS_DRAFT && (this.state.selected_status !== STATUS_DRAFT),
                }),
                onClick: () => this.selectStatus(STATUS_DRAFT),
            },
            {
                title: 'Issued',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status < STATUS_AWAITING_APPROVAL && this.state.selected_status !== STATUS_AWAITING_APPROVAL,
                    'slds-is-active': status === STATUS_AWAITING_APPROVAL && (this.state.selected_status !== STATUS_AWAITING_APPROVAL),
                    'slds-is-current': this.state.selected_status === STATUS_AWAITING_APPROVAL,
                    'slds-is-complete': status > STATUS_AWAITING_APPROVAL && (this.state.selected_status !== STATUS_AWAITING_APPROVAL),
                }),
                onClick: () => this.selectStatus(STATUS_AWAITING_APPROVAL),
            },
            // {
            //     title: 'Approved',
            //     visible: true,
            //     icon: 'check',
            //     className: classNames({
            //         'slds-is-incomplete': status < STATUS_APPROVED && this.state.selected_status !== STATUS_APPROVED,
            //         'slds-is-active': status === STATUS_APPROVED && (this.state.selected_status !== STATUS_APPROVED),
            //         'slds-is-current': this.state.selected_status === STATUS_APPROVED,
            //         'slds-is-complete': status > STATUS_APPROVED && (this.state.selected_status !== STATUS_APPROVED),
            //     }),
            //     onClick: () => this.selectStatus(STATUS_APPROVED),
            // },
            {
                title: 'Closed',
                visible: (status == STATUS_INACTIVE || status == STATUS_DECLINED || status == STATUS_ACTIVE) ? false : true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': ((this.state.selected_status != STATUS_DECLINED) && (this.state.selected_status != STATUS_ACTIVE) && (this.state.selected_status != STATUS_INACTIVE)),
                    'slds-is-current': ((this.state.selected_status === STATUS_DECLINED) || (this.state.selected_status === STATUS_ACTIVE) || (this.state.selected_status === STATUS_INACTIVE)),
                }),
                onClick: () => this.selectStatus("close"),
            },
            {
                title: 'Inactive',
                visible: status == STATUS_INACTIVE,
                icon: 'check',
                className: classNames({
                    'slds-is-lost': status === STATUS_INACTIVE,
                    'slds-is-active': status === STATUS_INACTIVE,
                }),
                onClick: () => this.selectStatus(STATUS_INACTIVE),
            },
            {
                title: 'Declined',
                visible: status == STATUS_DECLINED,
                icon: 'check',
                className: classNames({
                    'slds-is-lost': status === STATUS_DECLINED,
                })
            },
            {
                title: 'Active',
                visible: status == STATUS_ACTIVE,
                icon: 'check',
                className: classNames({
                    'slds-is-won': status === STATUS_ACTIVE,
                })
            },
        ]

        return path
    }

    updateStatus = () => {
        let selected_status = "";
        if (this.state.selected_status === 0) {
            selected_status = 0;
        } else if (!this.state.selected_status){
            toastMessageShow("Please select status", "e");
            return false;
        } else {
            selected_status = this.state.selected_status;
        }

        if (selected_status == 4) {
            jQuery("#cancel_reason").validate({ /* */ });
            this.setState({ validation_calls: true })

            if (!jQuery("#cancel_reason").valid()) {
                return false;
            }
        }
        var req = { reason_drop: this.state.reason_drop, reason_note: this.state.reason_note, service_agreement_id: this.props.id, status: selected_status }
        postData('sales/ServiceAgreement/update_status_service_agreement', req).then((result) => {
            if (result.status) {
                this.props.get_service_agreement_details(this.props.id);
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
        const { status } = this.props
        let service_agreement_status = status ? parseInt(status) : 0

        // Want to test statuses? Uncomment this
        // status = 0

        const paths = this.determineStatusPaths(service_agreement_status)
        const visiblePaths = paths.filter(p => p.visible)

        const actionProps = {
            buttonText: `Mark status as Complete`,
            //disabled: [3, 4].indexOf(status) >= 0, // qualified=3, unqualified=4
            onClick: () => this.updateStatus(),
        }

        var final_option = [{ label: "Inactive", value: 3 }, { label: "Declined", value: 4 }, { label: "Active", value: 5 }];

        return (
            <>
                <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                    <SLDSPath
                        path={visiblePaths}
                        actionProps={actionProps}
                    />
                </div>

                {(this.state.selected_status == 4) || this.props.status == 4 ?
                    <div className="slds-path__content " id="path-coaching-2">
                        <div className="slds-path__coach slds-grid">
                            <div className="slds-path__keys">
                                <form id="cancel_reason">
                                    <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                        <h2>Reason for Declined</h2>
                                    </div>
                                    <div class="slds-grid ">
                                        <div class="slds-size_4-of-12">
                                            <div className="slds-form" role="list">
                                                <div className="slds-form__row">
                                                    <div className="slds-form__item" >
                                                        <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                            <span className="slds-form-element__label">
                                                                {this.state.selected_status == 4 ?
                                                                    <abbr class="slds-required" title="required">* </abbr> : ""}Reason:</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.status == 4 ?
                                                                    this.props.declined_reason_det.reason_label : ""}

                                                                {this.state.selected_status == 4 ?
                                                                    <SLDSReactSelect
                                                                        simpleValue={true}
                                                                        className="SLDS_custom_Select default_validation"
                                                                        simpleValue={true}
                                                                        searchable={false}
                                                                        placeholder="Please Select"
                                                                        clearable={false}
                                                                        options={this.props.declined_reason_option}
                                                                        onChange={(value) => this.setState({ 'reason_drop': value })}
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
                                                            <span className="slds-form-element__label">Note:</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.status == 4 ? (this.props.declined_reason_det.reason_note || "N/A") : ""}

                                                                {this.state.selected_status == 4 ?
                                                                    <textarea
                                                                        name="reason_note"
                                                                        id="single-form-element-id-01"
                                                                        class="slds-textarea"
                                                                        placeholder="Placeholder Text"
                                                                        onChange={(e) => this.setState({ "reason_note": e.target.value })}
                                                                        maxLength={500}
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


                <ChooseFinalStagePopUp
                    selected_status={this.state.selected_status}
                    openModal={this.state.openChooseFinalStausModal}
                    onSelect={this.selectStatus}
                    closeModal={this.closeChooseFinalStatusModal}
                    option={final_option}
                />
            </>
        )
    }

}

export default ServiceAgreementPath;