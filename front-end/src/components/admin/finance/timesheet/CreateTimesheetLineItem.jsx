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
 * Class: CreateTimesheetLineItem
 */
class CreateTimesheetLineItem extends Component {
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
            timesheet_id: this.props.timesheet_id ? this.props.timesheet_id : '',
            shift_id: this.props.shift_id ? this.props.shift_id : '',
            id: this.props.id ? this.props.id : ''
        }
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
            List[index][fieldName] = value;
            if(fieldName == 'category_id') {
                category_option.map((catrow, idx) => {
                    if(catrow.value == value) {
                        List[index]['line_item_label'] = catrow.label;
                    }
                });
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
		postData("finance/FinanceDashboard/get_payrates_categories", {shift_id: this.props.shift_id}).then((res) => {
			if (res.status) {
				this.setState({ 
                    category_option: (res.data) ? res.data : []
				})
			}
		});
    }

    /**
     * fetching the timesheet line items
     */
    get_timesheet_line_items_list = () => {
        var Request = { timesheet_id: this.props.timesheet_id };
        postData('finance/FinanceDashboard/get_timesheet_line_items_list', Request).then((result) => {
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
        if (this.props.timesheet_id) {
            this.get_timesheet_line_items_list();
        }
        this.getReferenceData();
        this.setState({ loading: false });
    }

    /**
     * Call the create/edit timesheet line items when user saves
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#regmemsave").validate({ /* */ });        
        var url = 'finance/FinanceDashboard/add_update_timesheet_line_items';
        this.setState({ loading: true });
        var req = {
            timesheet_line_items: this.state.rows ? this.state.rows : '',
            timesheet_id: this.props.timesheet_id ? this.props.timesheet_id : '',
            shift_id: this.props.shift_id ? this.props.shift_id : '',
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
        return (
            <div className="slds-table_edit_container slds-is-relative">
                <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols" role="grid" >
                    <thead>
                        <tr className="slds-line-height_reset">
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 50+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Amount">#</span>
                                </div>
                            </th>
                            <th aria-label="Item" aria-sort="none" scope="col" style={{padding: 8}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span className="slds-truncate" title="Item">Item</span>
                                </div>
                            </th>
                            <th aria-label="Status" aria-sort="none" scope="col" style={{ padding: 8+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span className="slds-truncate" title="Status">Units</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Amount">Rate</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Amount">Total</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 60+'px'}}>&nbsp;</th>
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
                            <td colSpan="5">&nbsp;</td>
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
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <form id="lineitems" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} style={{display: 'block',minHeight: 200}}>
                                {this.renderForm()}
                            </form>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateTimesheetLineItem;
