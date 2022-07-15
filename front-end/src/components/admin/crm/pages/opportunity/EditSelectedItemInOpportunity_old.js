import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, handleShareholderNameChange, handleChangeChkboxInput, queryOptionData } from 'service/common.js';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'config.js';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Spinner from '@salesforce/design-system-react/lib/components/spinner';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from "jquery";

const getOppContactDrpDwnList = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_contact_list_for_opportunity", { query: e }, 2, 1);
}

class EditSelectedItemInOpportunity extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            selectedLineItem: [],
        }
    }

    componentDidMount() {
        if (this.props.selectedLineItem) {
            this.setState({ selectedLineItem: this.props.selectedLineItem }, () => {
                //console.log('selectedLineItem',this.state.selectedLineItem)
            })
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#lineItemSave").validate({ /* */ });
        this.setState({ validation_calls: true })
        var req = {
            ...this.state,
            opp_id: this.props.opp_id ? this.props.opp_id : '',
        }
        if (!this.state.loading && jQuery("#lineItemSave").valid()) {
            this.setState({ loading: true });
            postData('sales/Opportunity/save_opportunity_item', req).then((result) => {
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
        //console.log('selectedLineItem',this.state.selectedLineItem)
        return (
            <div>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <div>
                        <Modal
                            isOpen={this.props.editSelectedDialogBox}
                            footer={[
                                <Button disabled={this.state.loading} label="Back" onClick={this.props.backBtn} style={{ float: "left" }} />,
                                <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeEditItemDialog(false)} />,
                                <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                            ]}
                            onRequestClose={this.toggleOpen}
                            heading={this.props.agreement_id ? "Update Add Items" : "Edit selected items"}
                            size="medium"
                            className="slds_custom_modal"
                            onRequestClose={() => this.props.closeEditItemDialog(false)}
                            dismissOnClickOutside={false}
                        >

                            <div className="slds-table_edit_container slds-is-relative">
                                <form id="lineItemSave" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} >
                                    <div className="slds-scrollable slds-grow">
                                        <div className="slds-scrollable_none">
                                            <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols" role="grid" >
                                                <thead>
                                                    <tr className="slds-line-height_reset">

                                                        <th aria-label="Item" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "50%" }}>
                                                            <a className="slds-th__action slds-text-link_reset" href="#!" role="button" tabIndex="-1">
                                                                <span className="slds-assistive-text">Sort by: </span>
                                                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                    <span className="slds-truncate" title="Item">Item</span>
                                                                    <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                        <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                            </a>
                                                            <div className="slds-resizable">
                                                                <input type="range" aria-label="Item column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-533" max="1000" min="20" tabIndex="-1" />
                                                                <span className="slds-resizable__handle">
                                                                    <span className="slds-resizable__divider"></span>
                                                                </span>
                                                            </div>
                                                        </th>
                                                        <th aria-label="Quantity" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                            <a className="slds-th__action slds-text-link_reset" href="#!" role="button" tabIndex="-1">
                                                                <span className="slds-assistive-text">Sort by: </span>
                                                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                    <span className="slds-truncate" title="Quantity">Quantity</span>
                                                                    <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                        <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                            </a>
                                                            <div className="slds-resizable">
                                                                <input type="range" aria-label="Quantity column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-534" max="1000" min="20" tabIndex="-1" />
                                                                <span className="slds-resizable__handle">
                                                                    <span className="slds-resizable__divider"></span>
                                                                </span>
                                                            </div>
                                                        </th>
                                                        <th aria-label="Amount" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "25%" }}>
                                                            <a className="slds-th__action slds-text-link_reset" href="#!" role="button" tabIndex="-1">
                                                                <span className="slds-assistive-text">Sort by: </span>
                                                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                                    <span className="slds-truncate" title="Close Date">Amount</span>
                                                                    <span className="slds-icon_container slds-icon-utility-arrowdown">
                                                                        <svg className="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                                                                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                            </a>
                                                            <div className="slds-resizable">
                                                                <input type="range" aria-label="Amount column width" className="slds-resizable__input slds-assistive-text" id="cell-resize-handle-535" max="1000" min="20" tabIndex="-1" />
                                                                <span className="slds-resizable__handle">
                                                                    <span className="slds-resizable__divider"></span>
                                                                </span>
                                                            </div>
                                                        </th>
                                                    </tr >
                                                </thead >
                                                <tbody>

                                                    {(this.state.selectedLineItem.length > 0) ?
                                                        this.state.selectedLineItem.map((value, idx) => (
                                                            (value.selected) ?
                                                                <tr aria-selected="false" className="slds-hint-parent" key={idx + 1}>
                                                                    <th className="slds-cell-edit" scope="row" tabIndex="0">
                                                                        <span className="slds-grid slds-grid_align-spread">
                                                                            {value.line_item_name}
                                                                        </span>
                                                                    </th >
                                                                    <td className="slds-cell-edit" role="gridcell">
                                                                        <span className="slds-grid slds-grid_align-spread">

                                                                            <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} required name={'qty' + idx} value={value.qty} onChange={(e) => handleShareholderNameChange(this, 'selectedLineItem', idx, 'qty', e.target.value, e)} disabled={(value.qty_editable && value.qty_editable == '0') ? true : false} required={true} />

                                                                            {(value.qty_editable && value.qty_editable == '0') ?
                                                                                <button className="slds-button slds-button_icon slds-cell-edit__button slds-m-left_x-small" tabIndex="-1" title="Edit" onClick={(e) => handleShareholderNameChange(this, 'selectedLineItem', idx, 'qty_editable', '1', e)}>
                                                                                    <svg className="slds-button__icon slds-button__icon_hint slds-button__icon_edit" aria-hidden="true">
                                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#edit"></use>
                                                                                    </svg>
                                                                                    <span className="slds-assistive-text">Edit </span>
                                                                                </button>
                                                                                :
                                                                                <button className="slds-button slds-button_icon slds-cell-edit__button slds-m-left_x-small" tabIndex="-1" title="Cancel Edit" onClick={(e) => handleShareholderNameChange(this, 'selectedLineItem', idx, 'qty_editable', '0', e)}>
                                                                                    <svg className="slds-button__icon slds-button__icon_hint slds-button__icon_edit" aria-hidden="true">
                                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                                                                                    </svg>
                                                                                    <span className="slds-assistive-text">Cancel Edit </span>
                                                                                </button>
                                                                            }
                                                                        </span>
                                                                    </td >

                                                                    <td className="slds-cell-edit" role="gridcell">
                                                                        <div className="slds-checkbox">
                                                                            <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} required name={'amount' + idx} value={value.amount} onChange={(e) => handleShareholderNameChange(this, 'selectedLineItem', idx, 'amount', e.target.value, e)} disabled={(value.amount_editable && value.amount_editable == '0') ? true : false} required={true} />

                                                                            {(value.amount_editable && value.amount_editable == '0') ?
                                                                                <button className="slds-button slds-button_icon slds-cell-edit__button slds-m-left_x-small" tabIndex="-1" title="Edit" onClick={(e) => handleShareholderNameChange(this, 'selectedLineItem', idx, 'amount_editable', '1', e)}>
                                                                                    <svg className="slds-button__icon slds-button__icon_hint slds-button__icon_edit" aria-hidden="true">
                                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#edit"></use>
                                                                                    </svg>
                                                                                    <span className="slds-assistive-text">Edit</span>
                                                                                </button>
                                                                                :
                                                                                <button className="slds-button slds-button_icon slds-cell-edit__button slds-m-left_x-small" tabIndex="-1" title="Cancel Edit" onClick={(e) => handleShareholderNameChange(this, 'selectedLineItem', idx, 'amount_editable', '0', e)}>
                                                                                    <svg className="slds-button__icon slds-button__icon_hint slds-button__icon_edit" aria-hidden="true">
                                                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                                                                                    </svg>
                                                                                    <span className="slds-assistive-text">Cancel Edit </span>
                                                                                </button>
                                                                            }
                                                                        </div>
                                                                    </td >
                                                                </tr > : ''
                                                        )) : ''}
                                                </tbody >
                                            </table >
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </Modal >
                    </div >
                </IconSettings >
            </div >
        );
    }
}


export default EditSelectedItemInOpportunity;
