import React, { Component } from 'react';
import jQuery from "jquery";
import classNames from 'classnames'
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    IconSettings,
    Popover
} from '@salesforce/design-system-react';
import { css } from '../../../../service/common';

/**
 * to fetch the line item
 */
 const getLineItem = (e, shift_id, field, data) => {
    return queryOptionData(e, "finance/FinanceDashboard/get_line_item_list_from_sa", { query: e, shift_id: shift_id, field: field }, 2, 1);
}

/**
 * Class: CreateInvoiceLineItem
 */
class CreateInvoiceLineItem extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            title: ' ',
            rows_count: 0,
            rows: [{category_id: "", units: "", unit_rate: "", total_cost: "" , external_reference: "", "line_item_label": ""}],
            category_option: [],
            account_option: [],
            shift_option: [],
            invoice_id: this.props.invoice_id ? this.props.invoice_id : '',
            id: this.props.id ? this.props.id : ''
        }
    }

    /**
     * fetching the invoice details
     */
     get_invoice_details = (id) => {
        this.setState({loading: true});
        postData('finance/FinanceDashboard/get_invoice_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ showActivity: true, loading: false })
            if (this.state.invoice_no == '') {
                this.redirectToListing();
            }
        });
    }

    /**
     * when multi select/text value are changed
     */
    handleShareholderNameChange(obj, stateName, index, fieldName, value, e) {
        if (e) {
            e.preventDefault();
        }
        return new Promise((resolve, reject) => {
            if (e != undefined && e.target.pattern) {
                const re = eval(e.target.pattern);
                if (e.target.value != "" && !re.test(e.target.value)) {
                    resolve({ status: false });
                    return;
                }
            }
            var state = {};
            var List = obj.state[stateName];
            var category_option = obj.state['category_option'];
            var shift_option = obj.state['shift_option'];
            List[index][fieldName] = value;
            
            if(fieldName == 'category_id') {
                category_option.map((catrow, idx) => {
                    if(catrow.value == value) {
                        List[index]['line_item_label'] = catrow.label;
                    }
                });
                let categoryId = value;
                let selectedShift = List[index]['shift_id'];
                let objItem = List.find(o => Number(o.category_id) === Number(categoryId) && o.shift_id === selectedShift);
                let objItemIndex = List.findIndex(o => Number(o.category_id) === Number(categoryId) && o.shift_id === selectedShift);
                if (objItem && objItem.shift_id === selectedShift && objItemIndex !== index) {
                    toastMessageShow("Line item already exist for selected shift", "e");
                    List[index]['category_id'] = '';
                    List[index]['line_item_label'] = '';
                } 
            }

            if(fieldName == 'shift_id') {
                shift_option.map((shiftrow, idx) => {
                    if(shiftrow.value == value) {
                        List[index]['account_type'] = shiftrow.account_type;
                        List[index]['account_id'] = shiftrow.account_id;
                    }
                });

                let selectedShift = value;

                if(Number(this.state.invoice_type) === 4) {
                    let lineItemId = List[index]['line_item_id'] || '';
                    let objItem = List.find(o => o.line_item_id === lineItemId && o.shift_id === selectedShift);
                    let objItemIndex = List.findIndex(o => o.line_item_id === lineItemId && o.shift_id === selectedShift);
                    if (objItem && objItem.shift_id === selectedShift && selectedShift !== '' && objItemIndex !== index) {
                        toastMessageShow("Line item already exist for selected shift", "e");
                        List[index]['line_item_label'] = '';
                        List[index]['line_item_code'] = '';
                        List[index]['line_item_id'] = '';
                        List[index]['unit_rate'] = '';
                    } 
                } else {
                    let categoryId = List[index]['category_id'] || '';
                    let objItem = List.find(o => Number(o.category_id) === Number(categoryId) && o.shift_id === selectedShift);
                    let objItemIndex = List.findIndex(o => Number(o.category_id) === Number(categoryId) && o.shift_id === selectedShift);
                    if (objItem && objItem.shift_id === selectedShift && categoryId !== '' && selectedShift !== '' && objItemIndex !== index) {
                        toastMessageShow("Line item already exist for selected shift", "e");
                        List[index]['category_id'] = '';
                    } 
                }                
            }

            if(fieldName == 'line_item_id') {
                if (value && value.value) {
                    let selectedShift = List[index]['shift_id'];
                    let selectedId = value.value || '';
                    let objItem = List.find(o => o.line_item_id === selectedId && o.shift_id === selectedShift);
                    let objItemIndex = List.findIndex(o => o.line_item_id === selectedId && o.shift_id === selectedShift);
                    if (objItem && objItem.shift_id === selectedShift && value.value && objItemIndex !== index) {
                        toastMessageShow("Line item already exist for selected shift", "e");
                        List[index]['line_item_label'] = '';
                        List[index]['line_item_code'] = '';
                        List[index]['line_item_id'] = '';
                        List[index]['unit_rate'] = '';
                    } else {
                        List[index]['line_item_label'] = value.line_item_name;
                        List[index]['line_item_code'] = value.code;
                        List[index]['line_item_id'] = value.value;
                        List[index]['unit_rate'] = value.rate;
                    }
                } else {
                    List[index]['line_item_label'] = '';
                    List[index]['line_item_code'] = '';
                    List[index]['line_item_id'] = '';
                    List[index]['unit_rate'] = '';
                }            
            }
            
            List[index]['total_cost'] = (List[index]['units'] * List[index]['unit_rate']).toFixed(2);
            state[stateName] = Object.assign([], List);
            obj.setState(state, () => {
                resolve({ status: true });
            });
        });
    }

    /**
     * Adding a new row in the table for user to insert data of registered line item
     */
    addRow = (e) => {
        var currows = this.state.rows;
        currows.push({category_id: "", units: "", unit_rate: "", total_cost: "" , external_reference: "", "line_item_label": ""});
        this.setState({rows: currows});
    }

    /**
     * Removing a new row in the table
     */
    removeRow = (idx) => {
        var currows = this.state.rows;
        currows.splice(idx, 1);
        this.setState({rows: currows});
    }

    /**
     * fetching the reference data (pay categories)
     */
    getReferenceData = () => {
		postData("finance/FinanceDashboard/get_invoice_line_items_ref_data", { id: this.props.invoice_id }).then((res) => {
			if (res.status) {
				this.setState({ 
                    category_option: (res.data.category_option) ? res.data.category_option : [],
                    account_option: (res.data.account_option) ? res.data.account_option : [],
                    shift_option: (res.data.shift_option) ? res.data.shift_option : []
				})
			}
		});
    }

    /**
     * fetching the invoice line items
     */
    get_invoice_line_items_list = () => {
        var Request = { invoice_id: this.props.invoice_id };
        postData('finance/FinanceDashboard/get_invoice_line_items_list', Request).then((result) => {
            if (result.status) {
                this.setState({rows: result.data, rows_count: result.count});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        if (this.props.invoice_id) {
            this.get_invoice_line_items_list();
            this.get_invoice_details(this.props.invoice_id);
        }
        this.getReferenceData();
        this.setState({ loading: false });
    }

    /**
     * Call the create/edit invoice line items when user saves
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#regmemsave").validate({ /* */ });        
        var url = 'finance/FinanceDashboard/add_update_invoice_line_items';
        this.setState({ loading: true });
        var req = {
            invoice_line_items: this.state.rows ? this.state.rows : '',
            invoice_id: this.props.invoice_id ? this.props.invoice_id : '',
            category_check: Number(this.state.invoice_type) === 4 ? false : true,
            line_item_check: Number(this.state.invoice_type) === 4 ? true : false
        };
        // Call Api
        postData(url, req).then((result) => {
            if (result.status) {
                // Trigger success pop 
                toastMessageShow(result.msg, 's');
                this.props.closeModal(true);
            } else {
                // Trigger error pop 
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false });
        });
    }

    /**
     * rendering the form table for add/edit/delete
     */
    renderForm() {
        const styles = css({
            inlineEditableCellPopover: {
                position: 'absolute',
                top: 0,
                left: '0.0625rem',
            }
        });
        let ndisInvoice = Number(this.state.invoice_type) === 4 ? true : false;
        return (
            <div className="slds-table_edit_container slds-is-relative">
                <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols" role="grid" >
                    <thead>
                        <tr className="slds-line-height_reset">
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width: ndisInvoice ? 30+'px' : 40+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="#">#</span>
                                </div>
                            </th>
                            <th aria-label="Item" aria-sort="none" scope="col" style={{padding: 8, width: ndisInvoice ? 60+'px' : 120+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span className="slds-truncate" title="Shift">Shift</span>
                                </div>
                            </th>

                            {this.renderLineItemLabel()}

                            <th aria-label="Status" aria-sort="none" scope="col" style={{ padding: 8+'px', width:  ndisInvoice ? 50+'px' : 70+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span className="slds-truncate" title="Units">Units</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 50+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Rate">Rate</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width:  ndisInvoice ? 60+'px' : 85+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Total">Total</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width:  ndisInvoice ? 15+'px' :30+'px'}}>&nbsp;</th>
                        </tr>
                    </thead >
                    <tbody>
                        {(this.state.rows.length > 0) ?
                            this.state.rows.map((row, idx) => {
                                return (
                                    <tr aria-selected="false" className="slds-hint-parent" key={idx + 1}>
                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                            {idx+1}
                                        </td>
                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                                {((this.state.shift_option || []).find(opt => opt.value == row.shift_id) || {}).label}
                                            </span>
                                            <Popover
                                                body={(
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="SLDS_custom_Select default_validation slds-select"
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        required={true}
                                                        options={this.state.shift_option}
                                                        onChange={(e) => this.handleShareholderNameChange(this, 'rows', idx, 'shift_id', e)}
                                                        value={row.shift_id}
                                                    />
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

                                        {this.renderLineItemInput(idx, row, styles)}

                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                            {row.units}
                                            </span>
                                            <Popover
                                                body={(
                                                    <input
                                                        className="slds-input"
                                                        placeholder="Units"
                                                        type="text"
                                                        name="units"
                                                        required={true}
                                                        maxLength={18}
                                                        data-rule-phonenumber={true}
                                                        data-msg-valid_ndis="Please enter valid units"
                                                        value={row.units}
                                                        onChange={e => {
                                                            if (!isNaN(e.target.value)) {
                                                                var val = e.target.value;
                                                                this.handleShareholderNameChange(this, 'rows', idx, 'units', val)}
                                                            }
                                                        }
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
                                        </span>
                                        </td>

                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                            ${row.unit_rate}
                                            </span>
                                            <Popover
                                                body={(
                                                    <input
                                                        className="slds-input"
                                                        placeholder="Unit rate"
                                                        type="text"
                                                        required={true}
                                                        name="unit_rate"
                                                        maxLength={18}
                                                        data-rule-phonenumber={true}
                                                        data-msg-valid_ndis="Please enter valid unit rate"
                                                        value={row.unit_rate}
                                                        onChange={e => {
                                                            if (!isNaN(e.target.value)) {
                                                                this.handleShareholderNameChange(this, 'rows', idx, 'unit_rate', e.target.value)
                                                            }
                                                        }}
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
                                                    disabled={Number(this.state.invoice_type) === 4 ? true : false}
                                                    iconClassName={`slds-button__icon_edit`}
                                                />
                                            </Popover>
                                        </span>
                                        </td>
                                    
                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                            ${row.total_cost}
                                            </span>
                                        </span>
                                        </td>
                                        
                                        <td style={{'text-align': 'center'}} >
                                            <Button
                                                category="reset"
                                                iconSize="medium"
                                                iconName="delete"
                                                variant="icon"
                                                iconClassName={`slds-button__icon_delete`}
                                                onClick={() => this.removeRow(idx)}
                                            />
                                        </td>
                                    </tr >
                                )
                            }) : ''}
                        <tr aria-selected="false" className="slds-hint-parent">
                            <td colSpan={Number(this.state.invoice_type) === 4 ? "7" : "6"}>&nbsp;</td>
                            <td style={{'text-align': 'center'}}>
                                <Button
                                    category="reset"
                                    iconSize="large"
                                    iconName="new"
                                    variant="icon"
                                    iconClassName={`slds-button__icon_new`}
                                    onClick={() => this.addRow()}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
    
    /**
     * Render line item label by diff invoice type
     * @returns 
     */
     renderLineItemLabel = () => {
        if (Number(this.state.invoice_type) === 4) {
            return (
            <>
                <th aria-label="Code" aria-sort="none" scope="col" style={{padding: 8, width: 80+'px'}}>
                    <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                        <span className="slds-truncate" title="Code">Code</span>
                    </div>
                </th>
                <th aria-label="Item" aria-sort="none" scope="col" style={{padding: 8, width: 200+'px' }}>
                    <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                        <span className="slds-truncate" title="Item">Item</span>
                    </div>
                </th>
            </>
            );
        }
        return (
            <th aria-label="Item" aria-sort="none" scope="col" style={{padding: 8, width: 150+'px'}}>
                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                    <span className="slds-truncate" title="Item">Item</span>
                </div>
            </th>
        );
    }

    /**
     * Render Line item input by invoice type
     * @returns 
     */
    renderLineItemInput = (idx, row, styles) => {

        if (Number(this.state.invoice_type) === 4) {
            let line_item_label = row.line_item_label;
            let line_item_code = row.line_item_code;
            let line_item_code_value = { label: row.line_item_code, value: row.line_item_id };
            let line_item_value = { label: row.line_item_label, value: row.line_item_id };
            return (
                <>
                    <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                        <span className="slds-grid slds-grid_align-spread">
                            <span className="slds-p-right_x-small slds-truncate">
                                {line_item_code}
                            </span>
                            <Popover
                                body={(
                                        <SLDSReactSelect.Async clearable={false}
                                            className="SLDS_custom_Select default_validation"
                                            value={line_item_code_value}
                                            cache={false}
                                            required={true}
                                            loadOptions={(e) => getLineItem(e, row.shift_id, 'code',[])}
                                            onChange={(e) => {
                                                this.handleShareholderNameChange(this, 'rows', idx, 'line_item_id', e);
                                            }}
                                            placeholder="Please Search"
                                        />
                                    )
                                }
                                hasNoCloseButton
                                hasNoNubbin
                                style={styles.inlineEditableCellPopover}
                            >
                                <Button
                                    category="reset"
                                    iconSize="small"
                                    iconName="edit"
                                    variant="icon"
                                    disabled={row.shift_id ? false : true}
                                    iconClassName={`slds-button__icon_edit`}
                                />
                            </Popover>
                        </span>
                    </td>
                    <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                        <span className="slds-grid slds-grid_align-spread">
                            <span className="slds-p-right_x-small slds-truncate">
                                {line_item_label}
                            </span>
                            <Popover
                                body={(
                                    <SLDSReactSelect.Async clearable={false}
                                        className="SLDS_custom_Select default_validation"
                                        value={line_item_value}
                                        cache={false}
                                        required={true}
                                        loadOptions={(e) => getLineItem(e, row.shift_id, 'name',[])}
                                        onChange={(e) => {
                                            this.handleShareholderNameChange(this, 'rows', idx, 'line_item_id', e);
                                        }}
                                        placeholder="Please Search"
                                    />
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
                                    disabled={row.shift_id ? false : true}
                                    iconClassName={`slds-button__icon_edit`}
                                />
                            </Popover>
                        </span>
                    </td>
                </>
            );
        }
        
        return (
            <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                <span className="slds-grid slds-grid_align-spread">
                    <span className="slds-p-right_x-small slds-truncate">
                        {((this.state.category_option || []).find(opt => opt.value == row.category_id) || {}).label}
                    </span>
                    <Popover
                        body={(
                                <SLDSReactSelect
                                    simpleValue={true}
                                    className="SLDS_custom_Select default_validation slds-select"
                                    searchable={false}
                                    placeholder="Please Select"
                                    clearable={false}
                                    required={true}
                                    options={this.state.category_option}
                                    onChange={(e) => this.handleShareholderNameChange(this, 'rows', idx, 'category_id', e)}
                                    value={row.category_id}
                                />
                            )
                        }
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
        );
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading="Edit Line Items"
                        size="large"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <form id="lineitems" autoComplete="off" className="slds_form" onSubmit={e => { e.preventDefault();}} style={{display: 'block',minHeight: 200}}>
                                {this.renderForm()}
                            </form>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateInvoiceLineItem;
