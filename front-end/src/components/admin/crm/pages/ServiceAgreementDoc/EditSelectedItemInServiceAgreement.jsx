import React, { Component } from 'react';
import _ from 'lodash'
import classNames from 'classnames'
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow, handleShareholderNameChange, css } from 'service/common.js';
import { SLDSIcon } from '../../../salesforce/lightning/SLDS';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';
import jQuery from "jquery";
import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'config.js';
import {Button, Popover} from '@salesforce/design-system-react'

class EditSelectedItemInServiceAgreement extends Component {

    // feature toggles
    static SHOULD_ADD_EXTRA_ROW = true

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selectedLineItem: [],
            activeLineItem: [],
            roles: [],
            rows: [],
            additional_rows: [],
            selectedItem: [],            
        }
    }

    componentDidMount() {

        if (this.props.activeLineItem) {
            
            let rows = this.props.activeLineItem.map((contact, i) => { 
                    return {
                        id: contact.id,
                        amount: contact.incr_id_service_agreement_items > 0? contact.amount : "",
                        amount_editable: contact.amount_editable,
                        line_item_number: contact.line_item_number,
                        line_item_name: contact.line_item_name,
                        line_item_price_id: contact.line_item_price_id,
                        category_ref: contact.category_ref,
                        qty: contact.incr_id_service_agreement_items > 0? contact.qty : "",
                        qty_editable: contact.qty_editable,
                        selected: contact.selected,
                        incr_id_service_agreement_items: contact.incr_id_service_agreement_items,
                        oncall_provided: contact.oncall_provided,
                        errors: {},
                        upper_price_limit: contact.upper_price_limit
                    }
            });

            let activeLineItem = this.props.activeLineItem.map(c => ({ ...c }))

            this.setState({
                selectedLineItem: this.props.selectedLineItem,
                activeLineItem: this.props.activeLineItem,
                rows: rows,                
            });
            this.getLineItemsAdditionalFundingDetail({service_agreement_id: this.props.service_agreement_id});
        }
    }

    getLineItemsAdditionalFundingDetail = (requestData) => {
    
        postData('sales/ServiceAgreement/get_line_items_additional_funding_detail', requestData).then((result) => {
            if (result.status) {
                this.setState({ additional_rows: result.data }, () => {
                   
                    this.setState({ loading: false });
                });
            } else {
                toastMessageShow('Something went wrong', "e");
                this.setState({ loading: false });
            }
        });

    }

    validateChildItemsAmount(loop = false) {
        let valid_child = true;
        this.state.rows.map((row, idx) => {
            //Check only validation for selected items
            if (!this.validateChildAmount(row.amount, idx, loop) && row.selected) {
                valid_child = false;
                return false;
            }
        });
        if (!valid_child) {
            return false;
        }
        return valid_child;
    }

    /**
     * Save line item
     * @param {eventObj} e
     */
    onSubmit = (e,total,total_value) => {
        e.preventDefault();
        jQuery("#lineItemSave").validate({ /* */ });
        //validate child amount and prevent submit if amount is greater than parent
        let valid_child = this.validateChildItemsAmount(true);        

        if (!valid_child) {
            toastMessageShow("Please check the validation before saving the items", "e");
            return false;
        }
        if(!this.additionalRowsAmountValidation()) {
            return false;
        }
      /*   if(e.target.dataset.satotal == "0" || e.target.dataset.total == "0") {
            toastMessageShow("Value of SA and Total value should be greater than zero", "e");
            return false;   
        }      */  

        if(total == "0" ||total_value == "0") {
            toastMessageShow("Value of SA and Total value should be greater than zero", "e");
            return false;   
        } 

        this.setState({ validation_calls: true });  

        var req = {
            ...this.state,
            service_agreement_id: this.props.service_agreement_id ? this.props.service_agreement_id : '',
           // line_item_sa_total : e.target.dataset.satotal,
           line_item_sa_total:total,
           line_item_total:total_value
           // line_item_total: e.target.dataset.total
        }
        if (jQuery("#lineItemSave").valid()) { //this.isFormValid() && 
            this.setState({ loading: true });
            postData('sales/ServiceAgreement/save_service_agreement_item', req).then((result) => {
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

    //Validate additional field values
    additionalRowsAmountValidation() {
        if(this.state.additional_rows.length == 0 ) {
            return true;
        }
        let status = true;
        this.state.additional_rows.map((item) => {            
            if(item.additional_title == "" || 
            item.additional_price == "" || item.additional_price == "0" || item.additional_price == "0.00") {
                
                toastMessageShow("One or more Additional funding title or amount is missing", "e");                
                status = false;
            }
            
        });
        
        return status;
    }

    /**
     * Determines if an Opportunity Line Item Value is required.
     *
     * If the parent Category of this Line Item is present in the list,
     * and it has a value, a value is optional;
     * else, a value is required.
     */
    IsAmountRequired(row) {
        if (!row.selected) return false;

        let isCategory = !row.category_ref;
        if (!isCategory) {
            let parentCat = this.state.rows.find(r => r.selected && row.category_ref === r.line_item_number);
            if (!!parentCat) // && parseInt(parent.amount)
                return false;
        }

        return true;
    }

    handleQtyChange(e, idx) {
        let qty = e.target.value || "";
        if (!isNaN(qty)) {
            let amount = qty * this.state.rows[idx].upper_price_limit;
            handleShareholderNameChange(this, 'rows', idx, 'qty', qty, e);
            handleShareholderNameChange(this, 'rows', idx, 'amount', amount, e).then(st => {
                if (st) {
                    this.validateChildAmount(amount, idx);
                }
            });
            return true;
        }
        return false;
    }

    handleRateChange(e, idx) {
        let price = e.target.value;
        let amount = price * this.state.rows[idx].qty
        handleShareholderNameChange(this, 'rows', idx, 'upper_price_limit', price, e);
        handleShareholderNameChange(this, 'rows', idx, 'amount', price * this.state.rows[idx].qty, e).then(st => {
            if (st) {
                this.validateChildAmount(amount, idx, true);
            }
        });
        return true;
    }

    handleAmountChange(e, idx) {
        let amount = e.target.value;
        handleShareholderNameChange(this, 'rows', idx, 'amount', amount, e).then(status => {
            if (status) {
                handleShareholderNameChange(this, 'rows', idx, 'errors', {amount: ""});
                if (!isNaN(amount) && amount !== "") {
                    this.validateChildAmount(amount, idx)
                }
            }
        });
    }

    validateChildAmount(amount, idx, loop = false) {
        //if it is a child item the sum of all child amount should not exceed the parent item
        let curItem = this.state.rows[idx];
        let item_ref = curItem.category_ref;
        if (item_ref !== "" || item_ref.length !== 0) {
            let child_amount = 0;
            let parent_amount = 0;
            this.state.rows.map(item => {
                if (item.line_item_number === item_ref && item.selected) {
                    parent_amount = item.amount;
                }
                if (item.selected && item.category_ref === item_ref) {
                    if (item.line_item_number === curItem.line_item_number) {
                        child_amount += (1 * amount);
                    } else {
                        child_amount += (1 * item.amount);
                    }
                }
            })
            if (parent_amount > 0 && child_amount > parent_amount) {
                
                handleShareholderNameChange(this, 'rows', idx, 'errors', {amount: "Sum of child items amount can not be greater than the amount of parent item"});
                if (!loop) {
                    toastMessageShow("Sum of child items amount can not be greater than the amount of parent item", "e");
                }
                return false;
            } 
            else if (parent_amount == '' && child_amount == '' || parent_amount == 0 && child_amount == 0) {
                
                handleShareholderNameChange(this, 'rows', idx, 'errors', {amount: "Parent items and child items amount can not be blank"});
                if (!loop) {
                    toastMessageShow("Please add parent item or child item fund", "e");
                   
                } 
                return false;
            }
            else {
                handleShareholderNameChange(this, 'rows', idx, 'errors', {amount: ""});
                // if (!loop) {
                //     this.validateChildItemsAmount(true);
                // }
                
            }
        } else { //Checking Parent line item
            if(curItem.selected == true && (curItem.amount == '' || curItem.amount == '0.00' || curItem.amount == '0')) {
                handleShareholderNameChange(this, 'rows', idx, 'errors', {amount: ""});
                if(!this.checkChildItem(curItem.line_item_number)) {
                    handleShareholderNameChange(this, 'rows', idx, 'errors', {amount: "Parent items amount can not be blank"});
                    return false;
                }
            }     
            // if (!loop) {
                //this.validateChildItemsAmount(true);
            // }
        }
        return true;
    }

    isParentAdded(item) {
        if (item.category_ref === "") {
            return false;
        }
        let parent_exists = false;
        this.state.rows.map((row, idx) => {
            if (row.line_item_number === item.category_ref && row.selected === true) {
                parent_exists = true;
                return;
            }
        });
        return parent_exists;
    }

    //Check child items found while click the parent selection
    checkChildItem(line_item_number) {
        for (const item of this.state.rows) {
            if (item.category_ref === line_item_number && item.selected) {    
                return true;
            }
          }
    }

    getAmount(row) {
        if (row.amount === "") {
            return "";
        }
        if (isNaN(row.amount)) {
            return row.amount;
        }
        let db_amount = row.amount;
        let amount = db_amount >= 0? db_amount : row.qty * row.upper_price_limit;
        return amount;
    }

    addRow = (actual_row = false) => {
        var currows = this.state.additional_rows;
        var actrows = this.state.actual_rows;      
        if(!actual_row) {
            currows.push({id:"", additional_title: "", additional_price: ""});
        }
        else {
            actrows.push({id:"", additional_title: "", additional_price: ""});
        }
        this.setState({'additional_rows': currows, 'actual_rows': actrows});
    }

     /**
     * Removing a new row in the table
     */
      removeRow = (idx, actual_row = false) => {
        var currows = this.state.additional_rows;
        var actrows = this.state.actual_rows;
        if(!actual_row) {
            currows.splice(idx, 1);
        }
        else {
            actrows.splice(idx, 1);
        }
        this.setState({'additional_rows': currows, 'actual_rows': actrows, changedValue: true});
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
        });
        let child_amount = 0;
        let is_parent_item = false;
        let saTotal = [];
        let is_parent_amount = [];
       
        this.state.rows.map((row) => {           
            //Parent Item
            if(row.selected && row.category_ref === "" ) {             
              
                saTotal[row.line_item_number] = {
                    'line_item_number' : row.line_item_number,
                    'amount': parseFloat(row.amount),
                    'parent': true
                };
                child_amount = 0;
                is_parent_amount[row.line_item_number] = "0";

               if(row.amount != "0" && row.amount != "0.00" && row.amount != "") {
                    is_parent_amount[row.line_item_number] = parseFloat(row.amount);
               }       
            }
            else if(row.selected && row.category_ref !== row.line_item_number && 
                    (row.amount != "0" && row.amount != "0.00" && row.amount != "") && is_parent_amount[row.category_ref] == "0") {
                    
                    //Child item                       
                    child_amount = child_amount + parseFloat(row.amount ? row.amount : 0)
                   
                    saTotal[row.category_ref] = {
                        'line_item_number' : row.category_ref,
                        'amount': child_amount,
                        'parent': false
                    };
               
            }

        });
        let total = 0;
       //Add Parent and child amount
        Object.keys(saTotal).map((keyName, i) => {
           
            if(saTotal[keyName].amount !== undefined) {
                if (isNaN(saTotal[keyName].amount) || saTotal[keyName].amount === "") {
                    saTotal[keyName].amount = 0;
                }
                
                total = total + parseFloat(saTotal[keyName].amount);
            }
        });
        
        let total_value = 0;
        //FUll total calculation
        this.state.additional_rows.map((row) => {         
            
            if (isNaN(row.additional_price) || row.additional_price === "") {
                row.additional_price = 0;
            }
            total_value = total_value + parseFloat(row.additional_price);
        });

        if(total) {
            total_value = isNaN(total_value) ? 0 : total_value;
            total_value = parseFloat(total) + parseFloat(total_value);
        }

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.editSelectedDialogBox}
                    footer={[
                        <Button disabled={this.state.loading} label="Back" onClick={this.props.backBtn} style={{ float: "left" }} />,
                        <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeEditItemDialog(false)} />,
                        <Button disabled={this.state.loading } label="Save" variant="brand" data-satotal={total} data-total={total_value} onClick={(e)=>this.onSubmit(e,total,total_value)} />,
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={this.props.agreement_id ? "Update Add Items" : "Edit selected items"}
                    className="slds_custom_modal"
                    style={styles.modal}
                    onRequestClose={() => this.props.closeEditItemDialog(false)}
                    size="large"
                    dismissOnClickOutside={false}
                >

                    <div className="slds-modal__header_">
                        <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={this.props.closeModal}>
                            <SLDSIcon icon="close" className={`slds-button__icon slds-button__icon_large`} aria-hidden="true" />
                            <span className="slds-assistive-text">Close</span>
                        </button>
                    </div>

                    <form id="lineItemSave" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} disabled={this.props.disabled} style={styles.form}>
                        <div className="slds-table_edit_container slds-is-relative">
                            <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols table-line-item" style={{"position": "relative", "z-index": "10"}} role="grid" >
                                <thead>
                                    <tr className="slds-line-height_reset">
                                        <th aria-label="Item" aria-sort="none" scope="col" style={{padding: 8}}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Item">Item</span>
                                            </div>
                                        </th>
                                        <th aria-label="Item Number" aria-sort="none" scope="col" style={{padding: 8}}>
                                            <span className="slds-assistive-text">Item Number</span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Item Number">Item Number</span>
                                            </div>
                                        </th>
                                        
                                        <th aria-label="Unit(s)" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 150+'px'}}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Unit(s)">Unit(s)</span>
                                            </div>
                                        </th>
                                        <th aria-label="Rate" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 180+'px'}}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Rate">Rate</span>
                                            </div>
                                        </th>
                                        <th aria-label="Funding" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 180+'px'}}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Funding">Funding</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead >
                                <tbody>
                                    {(this.state.rows.length > 0) ?
                                        this.state.rows.map((row, idx) => {
                                           
                                            is_parent_item = row.category_ref === "" ? true : false;
                                            let line_item_rate = '';
                                            if (!row.line_item_price_id && !is_parent_item) {
                                                let p_con = 'Rate will be available once the new price list covering the selected date range is imported';
                                                let b_con = (
                                                    <Button
                                                        assistiveText={{ icon: 'Icon Info' }}
                                                        iconCategory="utility"
                                                        iconClassName="btn-icon-err"
                                                        iconName="date_input"
                                                        iconSize="small"
                                                        iconVariant="bare"
                                                        variant="icon"
                                                        style={{'fill':'red'}}
                                                    />
                                                );
                                                if (row.upper_price_limit && row.upper_price_limit !== '') {
                                                    p_con = 'This denotes old rate. Rate will be updated upon the import of the new price list.';
                                                    b_con = (
                                                        <Button
                                                            assistiveText={{ icon: 'Icon Info' }}
                                                            style={{'fill':'red', 'background-color': 'transparent', 'color': 'red', 'border': 'none', 'padding': '0'}}
                                                            label={row.upper_price_limit}
                                                        />
                                                    );
                                                }
                                                line_item_rate = (
                                                    <Popover
                                                        align="top right"
                                                        body={
                                                            <div>
                                                                <p className="slds-p-bottom_x-small">{p_con}</p>
                                                            </div>
                                                        }
                                                        heading="Missing Rate"
                                                        id="popover-error"
                                                        variant="warning"
                                                        className="slds-cus-popover-heading slds-popover-wrap"
                                                        {...this.props}
                                                    >
                                                        {b_con}
                                                    </Popover>
                                                );
                                            } else {
                                                line_item_rate = (!is_parent_item ? row.upper_price_limit : '');
                                            }
                                            return (
                                                (row.selected) ?
                                                    <tr aria-selected="false" className={`slds-hint-parent ${is_parent_item ? 'parent-line-item' : 'child-line-item'}`} key={idx + 1}>
                                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                                            <span className="slds-grid slds-grid_align-spread" title={row.line_item_name}>
                                                                <span className="slds-p-right_x-small slds-truncate">
                                                                    {row.line_item_name}
                                                                </span>
                                                            </span>
                                                        </td>

                                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                                            <span className="slds-grid slds-grid_align-spread" title={row.line_item_number}>
                                                                <span className="slds-p-right_x-small slds-truncate">
                                                                    {row.line_item_number}
                                                                </span>
                                                            </span>
                                                        </td>

                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-has-error': (row.errors || {})['qty'],
                                                            })}
                                                            role="gridcell"
                                                            tabIndex="0"
                                                        >
                                                            <span className="slds-grid slds-grid_align-spread" title={`Quantity`}>
                                                                <span className="slds-p-right_x-small slds-truncate">
                                                                    {!is_parent_item ? row.qty : ''}
                                                                </span>
                                                                <Popover
                                                                    body={(
                                                                        <input type="text"
                                                                            pattern={REGULAR_EXPRESSION_FOR_NUMBERS} name={'qty' + idx}
                                                                            maxLength="5"
                                                                            value={row.qty}
                                                                            onChange={(e) => { this.handleQtyChange(e, idx) }}
                                                                            disabled={(row.qty_editable && row.qty_editable == '0') ? true : false}
                                                                            required
                                                                            required={true}
                                                                        />
                                                                    )}
                                                                    hasNoCloseButton
                                                                    hasNoNubbin
                                                                    style={{ width: 150+'px', position: 'absolute', top: 0, left: 0.0625+'rem' }}
                                                                >
                                                                    <Button
                                                                        category="reset"
                                                                        iconSize="small"
                                                                        iconName="edit"
                                                                        variant="icon"
                                                                        iconClassName={`slds-button__icon_edit`}
                                                                        style={{display:  is_parent_item ? 'none' : 'inline-block' }}
                                                                    />
                                                                </Popover>
                                                            </span>
                                                        </td>

                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-has-error': (row.errors || {})['upper_price_limit']
                                                            })}
                                                            role="gridcell"
                                                            tabIndex="0"
                                                        >
                                                            <span className="slds-grid slds-grid_align-spread" title={'Rate'}>
                                                                <span className="slds-p-right_x-small slds-truncate">
                                                                    {line_item_rate}
                                                                </span>
                                                            </span>
                                                        </td>
                                                       
                                                        <td
                                                            className={classNames({
                                                                'slds-cell-edit': true,
                                                                'slds-has-error': (row.errors || {})['amount']
                                                            })}
                                                            role="gridcell"
                                                            tabIndex="0"
                                                            title={(row.errors || {})['amount']}
                                                        >
                                                            {
                                                               
                                                                    <span className="slds-grid slds-grid_align-spread">
                                                                        <span className="slds-p-right_x-small">
                                                                        {isNaN(this.getAmount(row)) || this.getAmount(row) === ""? "" : parseFloat(this.getAmount(row)).toFixed(2)}
                                                                        </span>
                                                                        {row.qty <= 0 && <Popover
                                                                            body={(
                                                                                <input type="text" 
                                                                                    pattern={REGULAR_EXPRESSION_FOR_NUMBERS}
                                                                                    maxLength="10"
                                                                                    name={'amount' + idx} 
                                                                                    value={this.getAmount(row)} 
                                                                                    onChange={(e) => this.handleAmountChange(e, idx)} 
                                                                                    disabled={(row.amount_editable && row.amount_editable == '0') ? true : false} 
                                                                                    required={this.IsAmountRequired(row)} 
                                                                                />
                                                                            )}
                                                                            hasNoCloseButton
                                                                            hasNoNubbin
                                                                            style={{ position: 'absolute', top: 0, left: 0.0625+'rem', width: 180+'px'}}
                                                                        >
                                                                            <Button
                                                                                category="reset"
                                                                                iconSize="small"
                                                                                iconName="edit"
                                                                                variant="icon"
                                                                                iconClassName={`slds-button__icon_edit`}
                                                                            />
                                                                        </Popover>
                                                                        }
                                                                    
                                                                    {(is_parent_item || row.qty <= "0") && <Popover
                                                                        body={(
                                                                            <input type="text"
                                                                                pattern={REGULAR_EXPRESSION_FOR_NUMBERS}
                                                                                maxLength="10"
                                                                                name={'amount' + idx}
                                                                                value={this.getAmount(row)}
                                                                                onChange={(e) => this.handleAmountChange(e, idx)}
                                                                                disabled={(row.amount_editable && row.amount_editable == '0') ? true : false}
                                                                                required={this.IsAmountRequired(row)}
                                                                            />
                                                                        )}
                                                                        hasNoCloseButton
                                                                        hasNoNubbin
                                                                        style={{ position: 'absolute', top: 0, left: 0.0625+'rem', width: 180+'px'}}
                                                                    >
                                                                        <Button
                                                                            category="reset"
                                                                            iconSize="small"
                                                                            iconName="edit"
                                                                            variant="icon"
                                                                            iconClassName={`slds-button__icon_edit`}                                                                               
                                                                        />
                                                                    </Popover>
                                                                    }
                                                                </span>

                                                            }
                                                        </td>
                                                    </tr >
                                                : ''
                                            )
                                        }) : ''}
                                       
                                </tbody>
                            </table >
                            
                            <table className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols table-line-item" style={{"position": "relative", "z-index": "1"}} role="grid">
                                <tbody>
                                {(this.state.additional_rows.length > 0) ?
                                    this.state.additional_rows.map((row, idx) => {
                                        return (

                                            <tr aria-selected="false" className="slds-hint-parent" style={{borderTop: 'rgb(221 219 218)'}}>
                                                <td aria-label="Item" className="slds-cell-edit" aria-sort="none" scope="col"  
                                                role="gridcell"                                                
                                                tabIndex="0">
                                                    {
                                                    <span className="slds-grid slds-grid_align-spread" title={`Additional Title`}>
                                                        <span className="slds-truncate slds-p-right_x-small">
                                                        {row.additional_title || <span style={{color: "#ccc", fontSize: "12px"}}>Enter funding title</span>}
                                                        </span>
                                                        
                                                        <Popover
                                                            body={(
                                                                <input type="text" 
                                                                value = {row.additional_title}
                                                                name = {'additional_title'}
                                                                id = {'additional_title_' + idx}                                                                                    
                                                                placeholder="Enter funding title"
                                                                onChange={e =>                               
                                                                    handleShareholderNameChange(this, 'additional_rows', idx, 'additional_title', 
                                                                    e.target.value, e)                                    
                                                                }
                                                                />
                                                            )}
                                                            hasNoCloseButton
                                                            hasNoNubbin
                                                            style={{ position: 'absolute', top: 0, left: 0.0625+'rem', width: 80+'%'}}
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

                                                    }
                                                </td>
                                                <td aria-selected="false" aria-label="Amount" className="slds-cell-edit" aria-sort="none" scope="col"                                                 
                                                role="gridcell"
                                                tabIndex="0"                                                
                                                style={{ width: 180+'px'}}>
                                                    
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                                
                                                                {

                                                                <span className="slds-grid slds-grid_align-spread">
                                                                    <span className="slds-p-right_x-small">
                                                                    {row.additional_price ? parseFloat(row.additional_price).toFixed(2) : "0.00"}
                                                                    </span>
                                                                    
                                                                    <Popover
                                                                        body={(
                                                                            <input type="text"
                                                                            pattern={REGULAR_EXPRESSION_FOR_NUMBERS}
                                                                            maxLength="10"                               
                                                                            value = {row.additional_price ? row.additional_price : null}
                                                                            name = {"additional_price"}
                                                                            onChange={e =>     
                                                                                handleShareholderNameChange(this, 'additional_rows', idx, 'additional_price', 
                                                                                e.target.value, e)                                      
                                                                        }
                                                                        />
                                                                        )}
                                                                        hasNoCloseButton
                                                                        hasNoNubbin
                                                                        style={{ position: 'absolute', top: 0, left: 0.0325+'rem', width: 180+'px'}}
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

                                                                }
                                                            </div>
                                                            <div className="col-sm-1">
                                                                <div className="slds-form-element">
                                                                    <div className="slds-form-element__control">
                                                                        <Button
                                                                        category="reset"
                                                                        iconSize="small"
                                                                        iconName="delete"
                                                                        title="Remove fund"
                                                                        variant="icon"
                                                                        iconClassName={`slds-button__icon_delete`}
                                                                        onClick={() => this.removeRow(idx)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    </div>
                                                </td>
                                            </tr> 
                                            )
                                        }) : ''
                                    }
                                    </tbody>
                                </table>
                            
                            <div className="row">
                                <div className="col-sm-12">&nbsp;</div>
                                <div className="col-sm-9">&nbsp;</div>
                                <div className="col-sm-3">
                                    <Button
                                        category="reset"
                                        iconSize="medium"
                                        iconName="new"
                                        label="Add additional funding"
                                        onClick={() => this.addRow()}
                                        style={{
                                            position: "relative",
                                            marginTop: "18px",
                                            left: "27%"
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">&nbsp;</div>                                
                            </div>
                            
                             <div className="row" style={{top: "14px", position: "relative", left: "8%"}}>
                                <div className="col-sm-6">&nbsp;</div>
                                <div className="col-sm-6">
                                    <div className="col-sm-6" style={{textAlign: "right"}}><b>Value of SA : </b>
                                    { Number.parseFloat(total).toFixed(2)}
                                    </div>
                                    <div className="col-sm-6">
                                        <b>Total Value : </b>                                        
                                    { Number.parseFloat(total_value).toFixed(2)}
                                    </div>
                                </div>
                                
                            </div>
                        </div >
                    </form>
                </Modal >
            </IconSettings>
        );
    }
}
export default EditSelectedItemInServiceAgreement;