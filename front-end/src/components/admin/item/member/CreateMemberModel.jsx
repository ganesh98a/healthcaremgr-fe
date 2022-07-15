import React, { Component } from 'react';
import jQuery from "jquery";
import classNames from 'classnames'
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, handleShareholderNameChange } from 'service/common.js';
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
 * Get members names using the typed keywords
 * Not including the existing chosen members
 */
const getMembersName = (e, exist_data) => {
    var skip_ids = [];
    if(exist_data.length > 0) {
        exist_data.map((row, idx) => {
            if(row.member_obj.value > 0) {
                skip_ids.push(row.member_obj.value);
            }
        });
    }
    var ret = queryOptionData(e, "member/MemberDashboard/get_member_name_search", { query: e, skip_ids: skip_ids }, 2, 1);
    return ret;
}

/**
 * Class: CreateMembersModel
 */
class CreateMembersModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            title: ' ',
            rows: [{member_obj: {label: "", value: ""}, status: ""}],
            status_option: [],
            participant_id: this.props.participant_id ? this.props.participant_id : '',
            id: this.props.id ? this.props.id : '',
            redirectPage: false,
            goal: '',
            participant: '',
            objective:'',
            active: true,
        }
    }

    /**
     * Adding a new row in the table for user to insert data of registered member
     */
    addRow = (e) => {
        var currows = this.state.rows;
        currows.push({member_obj: {label: "", value: ""}, status: ""});
        console.log(currows);
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
     * fetching the reference data (unavailability type) of member's object
     */
    getReferenceData = () => {
		postData("item/participant/get_participant_member_ref_data").then((res) => {
			if (res.status) {
				this.setState({ 
                    status_option: (res.data) ? res.data : []
				})
			}
		});
    }

    /**
     * fetching the participant members list for pre-selection
     */
    get_participant_members = (id) => {
        postData('item/participant/get_participant_members', { id }).then((result) => {
            if (result.status) {
                if(result.data.length == 0) {
                    result.data.push({member_obj: {label: "", value: ""}, status: ""});
                    this.setState({title: "Add Registered Support Worker"})
                }
                else {
                    this.setState({title: "Edit Registered Support Worker"})
                }
                this.setState({rows: result.data});
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
        if (this.props.participant_id) {
            this.get_participant_members(this.props.participant_id);
        }
        this.getReferenceData();
        this.setState({ loading: false });
    }

    /**
     * Call the create/edit participant members api when user saves
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#regmemsave").validate({ /* */ });        
        var url = 'item/Participant/assign_participant_members';
        this.setState({ loading: true });
        var req = {
            participant_members: this.state.rows ? this.state.rows : '',
            participant_id: this.state.participant_id ? this.state.participant_id : '',
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
                            <th aria-label="Registered Member" aria-sort="none" scope="col" style={{padding: 8}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span className="slds-truncate" title="Registered Member">Registered Support Worker</span>
                                </div>
                            </th>
                            <th aria-label="Status" aria-sort="none" scope="col" style={{ padding: 8+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span className="slds-truncate" title="Status">Status</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px', width: 50+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Amount">&nbsp;</span>
                                </div>
                            </th>
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
                                        <td
                                            className={classNames({
                                                'slds-cell-edit': true,
                                                'slds-is-edited': !!row.member_id,
                                                'slds-has-error': (row.errors || {})['member_id']
                                            })}
                                            role="gridcell"
                                            tabindex="0"
                                        >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                                {row.member_obj.label}
                                            </span>
                                            <Popover
                                                body={(
                                                    <div className="slds-form-element">
                                                        <div className="slds-form-element__control">
                                                            <div className="slds-select-container">
                                                            <SLDSReactSelect.Async
                                                                className="default_validation"
                                                                required={true}
                                                                name={idx +"member"}
                                                                loadOptions={(e) => getMembersName(e, this.state.rows)}
                                                                clearable={false}
                                                                placeholder='Search Members'
                                                                cache={false}
                                                                value={row.member_obj}
                                                                onChange={(e) => handleShareholderNameChange(this, 'rows', idx, 'member_obj', e)}
                                                                inputRenderer={(props) => <input  {...props} name={idx +"member"} />}
                                                            />
                                                            </div>
                                                        </div>
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
                                                'slds-is-edited': !!row.amount,
                                                'slds-has-error': (row.errors || {})['amount']
                                            })}
                                            role="gridcell"
                                            tabIndex="0"
                                        >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                                {((this.state.status_option || []).find(opt => opt.value == row.status) || {}).label}
                                            </span>
                                            <Popover
                                                body={(
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="SLDS_custom_Select default_validation slds-select"
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        options={this.state.status_option}
                                                        onChange={(e) => handleShareholderNameChange(this, 'rows', idx, 'status', e)}
                                                        value={row.status}
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
                            <td colSpan="3">&nbsp;</td>
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
                        heading={this.state.title}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <form id="regmemsave" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} style={{display: 'block',minHeight: 200}}>
                                {this.renderForm()}
                            </form>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateMembersModel;
