import React, { Component } from 'react';
import _ from 'lodash'
import classNames from 'classnames'
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow, handleShareholderNameChange } from 'service/common.js';
import { SLDSIcon } from '../../../../salesforce/lightning/SLDS';
import SLDSReactSelect from '../../../../salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from "jquery";
import 'react-block-ui/style.css';
import { css } from '../../../../../../service/common';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import moment from 'moment';
import '../../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { Modal, Button, IconSettings, Popover} from '@salesforce/design-system-react';

class DiagnosisEdit extends Component {

    // feature toggles
    static SHOULD_ADD_EXTRA_ROW = true

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selectedSearchResult: [],
            support_level_option: [{ label: 'High', value: '1' }, { label: 'Medium', value: '2' }, { label: 'Low', value: '3' }],
            participant_impact_option: [{ label: 'Severe', value: '1' }, { label: 'Moderate', value: '2' }, { label: 'Mild', value: '3' }, { label: 'Managed by medication', value: '4' }],
            rows: [],
        }
    }

    componentDidMount() {
        if (this.props.selectedSearchResult) {
            let rows = this.props.selectedSearchResult.map((contact, i) => {
                return {
                    id: contact.id,
                    label: contact.label,
                    conceptId: contact.conceptId,
                    incr_id_diagnosis: contact.incr_id_diagnosis,
                    selected: contact.selected,
                    parent: contact.parent,
                    child_count: contact.child_count,
                    search_term: contact.search_term,
                    impact_on_participant: (contact.impact_on_participant) ? contact.impact_on_participant : '',
                    plan_end_date: contact.plan_end_date,
                    support_level: (contact.support_level) ? contact.support_level : '',
                    current_plan: (contact.current_plan) ? contact.current_plan : '',
                    errors: {},
                    primary_disability: contact.primary_disability
                }
            })

            let selectedSearchResult = this.props.selectedSearchResult.map(c => ({ ...c }))
            this.setState({
                selectedSearchResult: selectedSearchResult,
                rows: rows,
            })
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#diagnosis_form").validate({ /* */ });
        this.setState({ validation_calls: true })
        var req = {
            ...this.state,
            need_assessment_id: this.props.need_assessment_id ? this.props.need_assessment_id : '',
            user_id : this.props.user_id
        }

        if (jQuery("#diagnosis_form").valid()) {
            this.setState({ loading: true });
            postData('sales/NeedAssessment/save_diagnosis', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.props.closeEditItemDialog();
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }

    render() {
        const styles = css({
            form: {
                display: 'block',
                minHeight: 480,
            },
            modal: {
                fontSize: 13,
                fontFamily: 'Salesforce Sans, Arial, Helventica, sans-serif'
            },
            inlineEditableCellPopover: {
                position: 'absolute',
                top: 0,
                left: '0.0625rem',
            },
            colHeader: {
                padding: 8
            }
        })

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openEditDiagnosis}
                    footer={[
                        <Button disabled={this.state.loading} label="Back" onClick={this.props.backBtn} style={{ float: "left" }} />,
                        <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeEditItemDialog(false)} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={this.props.agreement_id ? "Update Add Items" : "Edit selected items"}
                    className="slds_custom_modal"
                    style={styles.modal}
                    onRequestClose={() => this.props.closeEditItemDialog(false)}
                    size="medium"
                    dismissOnClickOutside={false}
                >

                    <div className="slds-modal__header_">
                        <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={this.props.closeModal}>
                            <SLDSIcon icon="close" className={`slds-button__icon slds-button__icon_large`} aria-hidden="true" />
                            <span className="slds-assistive-text">Close</span>
                        </button>
                    </div>

                    <form id="diagnosis_form" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} disabled={this.props.disabled} style={styles.form}>
                        <div className="slds-table_edit_container slds-is-relative">
                            <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols" role="grid" >
                                <thead>
                                    <tr className="slds-line-height_reset">
                                        <th aria-label="Diagnosis" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Diagnosis">Diagnosis</span>
                                            </div>
                                        </th>
                                        <th aria-label="Diagnosis" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Primary Disability</span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Primary Disability">Primary Disability</span>
                                            </div>
                                        </th>
                                        <th aria-label="Level of Support" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Level of Support">Level of Support</span>
                                            </div>
                                        </th>
                                        <th aria-label="Current Plan" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Current Plan">Current Plan</span>
                                            </div>
                                        </th>
                                        <th aria-label="Plan End Date" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Plan End Date">Plan End Date</span>
                                            </div>
                                        </th>
                                        <th aria-label="Impact on Participant" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Impact on Participant">Impact on Participant</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead >
                                <tbody>

                                    {(this.state.rows.length > 0) ?
                                        this.state.rows.map((row, idx) => {
                                            return (
                                                (row.selected) ?
                                                    <tr aria-selected="false" className="slds-hint-parent" key={idx + 1}>
                                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                                            <span className="slds-grid slds-grid_align-spread" title={row.label}>
                                                                <span className="slds-p-right_x-small slds-truncate">
                                                                    {row.label}
                                                                </span>
                                                            </span>
                                                        </td>
                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-is-edited': !!row.primary_disability,
                                                                'slds-has-error': (row.errors || {})['primary_disability']
                                                            })}
                                                            role="gridcell"
                                                            tabIndex="0"
                                                        >
                                                            {
                                                                <span className="slds-checkbox">
                                                                     <input type="checkbox" name={'primary_disability' + idx} id={'primary_disability' + idx} checked={((row.primary_disability && row.primary_disability == 1)) ? true : false} onChange={(e) => {
                                                                        handleShareholderNameChange(this, 'rows', idx, 'primary_disability', e.target.checked)
                                                                        if (!e.target.checked) {
                                                                        handleShareholderNameChange(this, 'rows', idx, 'primary_disability', '')
                                                                        }
                                                                        }} />

                                                                    <label className="slds-checkbox__label" htmlFor={'primary_disability' + idx} style={{ marginBottom: 0 }}>
                                                                        <span className="slds-checkbox_faux"></span>
                                                                        <span className="slds-form-element__label"></span>
                                                                    </label>
                                                                </span>


                                                            }
                                                        </td>
                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-is-edited': !!row.support_level,
                                                                'slds-has-error': (row.errors || {})['support_level']
                                                            })}
                                                            role="gridcell"
                                                            tabindex="0"
                                                        >

                                                            <span className="slds-grid slds-grid_align-spread">
                                                                <span className="slds-p-right_x-small">
                                                                    {((this.state.support_level_option || []).find(opt => opt.value == row.support_level) || {}).label}
                                                                </span>
                                                                <Popover
                                                                    body={(
                                                                        <div className="slds-form-element">
                                                                            <div className="slds-form-element__control">
                                                                                <div className="slds-select-container">
                                                                                    <SLDSReactSelect
                                                                                        simpleValue={true}
                                                                                        className="SLDS_custom_Select default_validation slds-select"
                                                                                        searchable={false}
                                                                                        placeholder="Please Select"
                                                                                        clearable={false}
                                                                                        options={this.state.support_level_option}
                                                                                        onChange={(e) => handleShareholderNameChange(this, 'rows', idx, 'support_level', e)}
                                                                                        value={row.support_level}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            {
                                                                                // Validation error
                                                                                (row.errors || {})['support_level'] && (
                                                                                    <div className="slds-form-element__help">{(row.errors || {})['support_level']}</div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    hasNoCloseButton
                                                                    hasNoNubbin
                                                                    style={styles.inlineEditableCellPopover}
                                                                >
                                                                    <Button
                                                                        category="reset"
                                                                        iconSize="small"
                                                                        iconName="edit"
                                                                        variant="icon"
                                                                        iconClassName={`slds-button__icon_edit`}
                                                                    />
                                                                </Popover>
                                                            </span>
                                                        </td>
                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-is-edited': !!row.current_plan,
                                                                'slds-has-error': (row.errors || {})['current_plan']
                                                            })}
                                                            role="gridcell"
                                                            tabIndex="0"
                                                        >
                                                            {
                                                                <span className="slds-checkbox">
                                                                     <input type="checkbox" name={'current_plan' + idx} id={'current_plan' + idx} checked={((row.current_plan && row.current_plan == 1) || row.plan_end_date ) ? true : false} onChange={(e) => {
                                                                        handleShareholderNameChange(this, 'rows', idx, 'current_plan', e.target.checked)
                                                                        if (!e.target.checked) {
                                                                        handleShareholderNameChange(this, 'rows', idx, 'plan_end_date', '')
                                                                        }
                                                                        }} />

                                                                    <label className="slds-checkbox__label" htmlFor={'current_plan' + idx} style={{ marginBottom: 0 }}>
                                                                        <span className="slds-checkbox_faux"></span>
                                                                        <span className="slds-form-element__label"></span>
                                                                    </label>
                                                                </span>


                                                            }
                                                        </td>

                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-is-edited': !!row.plan_end_date,
                                                                'slds-has-error': (row.errors || {})['plan_end_date']
                                                            })}
                                                            role="gridcell"
                                                            tabindex="0"
                                                        >
                                                            <span className="slds-grid slds-grid_align-spread">
                                                                <span className="slds-p-right_x-small">
                                                                    {(row.plan_end_date) ? moment(row.plan_end_date).format('DD/MM/YYYY') : ''}
                                                                </span>
                                                                <Popover
                                                                    body={(
                                                                        <div className="slds-form-element">
                                                                            <div className="slds-form-element__control">
                                                                                <div className="slds-select-container">
                                                                                    <Datepicker
                                                                                        className="customer_signed_date"
                                                                                        placeholder="Customer Signed Date"
                                                                                        onChange={(e, data) => handleShareholderNameChange(this, 'rows', idx, 'plan_end_date', data.date)}
                                                                                        formatter={(date) => { return date ? moment(date).format('DD/MM/YYYY') : ''; }}
                                                                                        value={row.plan_end_date}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            {
                                                                                // Validation error
                                                                                (row.errors || {})['plan_end_date'] && (
                                                                                    <div className="slds-form-element__help">{(row.errors || {})['plan_end_date']}</div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    hasNoCloseButton
                                                                    hasNoNubbin
                                                                    style={styles.inlineEditableCellPopover}
                                                                >
                                                                    <Button
                                                                        category="reset"
                                                                        iconSize="small"
                                                                        iconName="edit"
                                                                        variant="icon"
                                                                        iconClassName={`slds-button__icon_edit`}
                                                                    />
                                                                </Popover>
                                                            </span>
                                                        </td>

                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-is-edited': !!row.impact_on_participant,
                                                                'slds-has-error': (row.errors || {})['impact_on_participant']
                                                            })}
                                                            role="gridcell"
                                                            tabindex="0"
                                                        >

                                                            <span className="slds-grid slds-grid_align-spread">
                                                                <span className="slds-p-right_x-small">
                                                                    {((this.state.participant_impact_option || []).find(opt => opt.value == row.impact_on_participant) || {}).label}
                                                                </span>
                                                                <Popover
                                                                    body={(
                                                                        <div className="slds-form-element">
                                                                            <div className="slds-form-element__control">
                                                                                <div className="slds-select-container">
                                                                                    <SLDSReactSelect
                                                                                        simpleValue={true}
                                                                                        className="SLDS_custom_Select default_validation slds-select"
                                                                                        searchable={false}
                                                                                        placeholder="Please Select"
                                                                                        clearable={false}
                                                                                        options={this.state.participant_impact_option}
                                                                                        onChange={(e) => handleShareholderNameChange(this, 'rows', idx, 'impact_on_participant', e)}
                                                                                        value={row.impact_on_participant}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            {
                                                                                // Validation error
                                                                                (row.errors || {})['impact_on_participant'] && (
                                                                                    <div className="slds-form-element__help">{(row.errors || {})['impact_on_participant']}</div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    hasNoCloseButton
                                                                    hasNoNubbin
                                                                    style={styles.inlineEditableCellPopover}
                                                                >
                                                                    <Button
                                                                        category="reset"
                                                                        iconSize="small"
                                                                        iconName="edit"
                                                                        variant="icon"
                                                                        iconClassName={`slds-button__icon_edit`}
                                                                    />
                                                                </Popover>
                                                            </span>
                                                        </td>
                                                    </tr >
                                                    : ''
                                            )
                                        }) : ''}
                                </tbody >
                            </table >
                        </div >
                    </form>
                </Modal >
            </IconSettings>
        );
    }
}
export default DiagnosisEdit;