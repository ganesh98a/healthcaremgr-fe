import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'
import jQuery from 'jquery'
import {
    IconSettings,
    Button,
} from '@salesforce/design-system-react'
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';
import { ROUTER_PATH } from '../../../../../config.js';

import { postData, css, AjaxConfirm, toastMessageShow } from '../../../../../service/common'

import { SLDSPath } from '../../../salesforce/lightning/SLDSPath.jsx'

import '../../../scss/components/admin/crm/pages/sales/LeadDetails.scss'


class LeadPath extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);
        this.state = {
            selected_status: ""
        }
    }

    closeConvertModal = () => {
        this.setState({selected_status : ""});
    }

    closeChooseFinalStatusModal = (status) => {
        if (status) {
            jQuery("#create_opp").validate({ /* */ });

            if (!jQuery("#create_opp").valid()) {
                return false;
            }
            

            // when status == 3 TEHN convert lead pop-up will open
            // when status == 4 TEHN ask cancel reason

            if (this.state.selected_status == 3) {
                // then lead already converted show message and go further
                if(this.props.is_converted == 1){
                    toastMessageShow("Lead was already converted. So click on 'Mark status as Complete' to continue", "i");
                }else{
                    this.props.openConvertModal();
                }
            }

        } else {
            this.setState({ selected_status: "" })
        }
        this.setState({ openChooseFinalStausModal: false });
    }

    selectStatus = (selected_status) => {
        if (selected_status && selected_status !== "close") {
            this.setState({selected_status: selected_status})
            return false;
        }

        if (selected_status === "close") {
            this.setState({ selected_status: selected_status, openChooseFinalStausModal: true })
        }

        if (this.props.lead_status != 'close') {
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

        const STATUS_UNKNOWN = 0
        const STATUS_OPEN = 1
        const STATUS_IN_PROGRESS = 2
        const STATUS_QUALIFIED = 3
        const STATUS_UNQUALIFIED = 4
        const STATUS_ACCOMODATION = 5

        const path = [
            {
                title: 'Open',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status <= STATUS_UNKNOWN && (this.state.selected_status !== STATUS_OPEN),
                    'slds-is-new': status === STATUS_OPEN && (this.state.selected_status !== STATUS_OPEN),
                    'slds-is-active': status === STATUS_OPEN && (this.state.selected_status !== STATUS_OPEN),
                    'slds-is-current': this.state.selected_status === STATUS_OPEN,
                    'slds-is-complete': status > STATUS_OPEN && (this.state.selected_status !== STATUS_OPEN),
                }),
                onClick: () => this.selectStatus(STATUS_OPEN),
            },
            {
                title: 'In progress',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status < STATUS_IN_PROGRESS && this.state.selected_status !== STATUS_IN_PROGRESS,
                    'slds-is-active': status === STATUS_IN_PROGRESS,
                    'slds-is-current': this.state.selected_status === STATUS_IN_PROGRESS,
                    'slds-is-complete': status > STATUS_IN_PROGRESS && (this.state.selected_status !== STATUS_IN_PROGRESS),
                }),
                onClick: () => this.selectStatus(STATUS_IN_PROGRESS),
            },
            {
                title: 'Closed',
                visible: (status == 3 || status == 4 || status == 5)? false: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status <= STATUS_IN_PROGRESS && (this.state.selected_status != 3 && this.state.selected_status != 4 && this.state.selected_status !== 'close'),
                    'slds-is-current': ((this.state.selected_status == 3) || (this.state.selected_status === 4) || (this.state.selected_status == 5) || (this.state.selected_status === 'close')),
                    'slds-is-active': (status == 3 || status == 4 || status == 5),
                }),
                onClick: () => this.selectStatus("close"),
            },
            {
                title: status === 0 ? 'Unknown' : 'Qualified',
                visible: status === STATUS_QUALIFIED,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': [STATUS_UNKNOWN, STATUS_OPEN, STATUS_IN_PROGRESS].indexOf(status) >= 0,
                    'slds-is-current': this.state.selected_status === STATUS_QUALIFIED,
                    'slds-is-active': status === STATUS_QUALIFIED,
                    'slds-is-won': status === STATUS_QUALIFIED,
                    'slds-is-complete': status === STATUS_QUALIFIED,
                }),
                onClick: () => this.selectStatus(STATUS_QUALIFIED),
            },
            {
                title: 'Unqualified',
                visible: status == STATUS_UNQUALIFIED,
                icon: 'check',
                className: classNames({
                    'slds-is-lost': [STATUS_UNQUALIFIED].indexOf(status) >= 0,
                }),
                onClick: () => this.selectStatus(STATUS_UNQUALIFIED),
            },
            {
                title: 'Accomodation Waitlist',
                visible: status == STATUS_ACCOMODATION,
                icon: 'check',
                className: classNames({
                    'slds-is-complete': status === STATUS_ACCOMODATION,
                }),
                onClick: () => this.selectStatus(STATUS_ACCOMODATION),
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
        var req = { reason_drop: this.state.reason_drop, reason_note: this.state.reason_note, lead_id: this.props.id, status: this.state.selected_status }
        postData('sales/Lead/update_status_lead', req).then((result) => {
            if (result.status) {
                this.props.get_lead_details(this.props.id);
                this.props.get_history_items(this.props.id);
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
        const { lead_status } = this.props
        let status = lead_status ? parseInt(lead_status) : 0

        // Want to test statuses? Uncomment this
        // status = 0

        const paths = this.determineStatusPaths(status)
        const visiblePaths = paths.filter(p => p.visible)

        const actionProps = {
            buttonText: `Mark status as Complete`,
            //disabled: [3, 4].indexOf(status) >= 0, // qualified=3, unqualified=4
            onClick: () => this.updateStatus(),
        }

        return (
            <>
                <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                    <SLDSPath
                        path={visiblePaths}
                        actionProps={actionProps}
                    />
                </div>

                {(this.state.selected_status == 4) || this.props.lead_status == 4 ?
                    <div className="slds-path__content " id="path-coaching-2">
                        <div className="slds-path__coach slds-grid">
                            <div className="slds-path__keys">
                                <form id="cancel_reason">
                                    <div className="slds-grid slds-grid_align-spread slds-path__coach-title">
                                        <h2>Reason for Unqualified</h2>
                                    </div>
                                    <div class="slds-grid ">
                                        <div class="slds-size_4-of-12">
                                            <div className="slds-form" role="list">
                                                <div className="slds-form__row">
                                                    <div className="slds-form__item" >
                                                        <div className="slds-form-element slds-form-element_stacked slds-hint-parent">
                                                            <span className="slds-form-element__label">
                                                            {this.state.selected_status == 4? <abbr class="slds-required" title="required">* </abbr>:  ""}Reason</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.lead_status == 4 ?
                                                                    this.props.unqualified_reason_det.reason_label : ""}

                                                                {this.state.selected_status == 4 ?
                                                                    <SLDSReactSelect
                                                                        simpleValue={true}
                                                                        className="SLDS_custom_Select default_validation"
                                                                        simpleValue={true}
                                                                        searchable={false}
                                                                        placeholder="Please Select"
                                                                        clearable={false}
                                                                        options={this.props.unqualified_reason_option}
                                                                        onChange={(value) => this.setState({'reason_drop': value})}
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
                                                            <span className="slds-form-element__label">Note</span>
                                                            <div className="slds-form-element__control">
                                                                {this.props.lead_status == 4 ? (this.props.unqualified_reason_det.reason_note || "N/A") : ""}

                                                                {this.state.selected_status == 4 ?
                                                                    <textarea
                                                                        name="reason_note"
                                                                        id="single-form-element-id-01"
                                                                        class="slds-textarea"
                                                                        placeholder="Placeholder Text"
                                                                        onChange={(e) => this.setState({"reason_note" : e.target.value})}
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
                    onSelect={(value) => this.selectStatus(value)}
                    closeModal={this.closeChooseFinalStatusModal}
                />
            </>
        )
    }

}

export default LeadPath;

class ChooseFinalStagePopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }

    }


    render() {
        var option = [{ label: "QUALIFIED", value: 3 }, { label: "UNQUALIFIED", value: 4 }, { label: "ACCOMODATION WAITLIST", value: 5 }];
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

                    <form id="create_opp" autoComplete="off" className="px-4 col-md-12 slds_form" style={{height: "150px"}}>
                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr class="slds-required" title="required">* </abbr>Status</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect
                                               
                                                simpleValue={true}
                                                className="SLDS_custom_Select default_validation"
                                                simpleValue={true}
                                                searchable={false}
                                                placeholder="Please Select"
                                                clearable={false}
                                                options={option}
                                                onChange={(value) => this.props.onSelect(value)}
                                                value={this.props.selected_status || ''}
                                                required={true}
                                                name="selected_status"
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
