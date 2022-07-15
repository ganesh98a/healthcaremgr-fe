import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';

import { Button, Popover } from '@salesforce/design-system-react';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import classNames from 'classnames';
import { get_contact_name_search_for_email_act } from 'components/admin/crm/actions/ContactAction.jsx';
import createClass from 'create-react-class';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { postData, queryOptionDataAddNewEntity, selectFilterOptions, toastMessageShow } from 'service/common.js';

import { css } from '../../../../../service/common';
import { SLDSIcon } from '../../../salesforce/lightning/SLDS';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';
import CreateContactModal from '../contact/CreateContactModal';

const getOppContactDrpDwnList = (e, data) => {
    return queryOptionDataAddNewEntity(e, "sales/Opportunity/get_contact_list_for_opportunity", { query: e, limit: 20 }, 2, 1);
}

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {       
        var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
        var className = "slds-icon-standard-contact";
        if(this.props.option.value=='new contact'){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#add";
            className = "slds-icon-standard-add";
        }
        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>

                <div role="presentation" class="slds-listbox__item">
                    <div id="option3" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                        <span class="slds-media__figure slds-listbox__option-icon">
                            <span class={"slds-icon_container "+className}>
                                <svg class="slds-icon slds-icon_small" aria-hidden="true" style={{ fill : this.props.option.value !='new contact' ? '':'#000' } }>
                                    <use href={icon_ref}></use>
                                </svg>
                            </span>
                        </span>
                        <span class="slds-media__body">
                            <span class="slds-listbox__option-text slds-listbox__option-text_entity">{this.props.option.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
});



class ManageContactRoles extends Component {

    // feature toggles
    static SHOULD_ADD_EXTRA_ROW = true

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'related',
            contacts_data: [],
            roles: [],
            rows: [],
        }
    }

    componentDidMount() { 
        if (this.props.contacts_data) {
            this.getOppRoleDrpDwnList();
            let rows = this.props.contacts_data.map((contact, i) => {
                return {
                    id: contact.sales_id,
                    contact: contact.contact_key_val,
                    role_id: contact.roll_id,
                    is_primary: contact.is_primary == 1,
                    errors: {},
                }
            })

            // add one more row
            if (ManageContactRoles.SHOULD_ADD_EXTRA_ROW) {
                rows.push({ errors: {}})
            }

            // always set the first row as primary
            rows = rows.map((c, i) => {
                return {
                    ...c,
                    is_primary: i === 0 && (this.props.contacts_data || []).length === 0 ? true : !!c.is_primary
                }
            })

            let contacts_data = this.props.contacts_data.map(c=> ({...c}))

            this.setState({ 
                contacts_data: contacts_data,
                rows: rows,
            })
        }
    }

    /* componentWillReceiveProps(newProps) {
    } */

    getOppRoleDrpDwnList = (e, data) => {
        postData('sales/Opportunity/get_roles_for_opportunity').then((result) => {
            if (result.status) {
                this.setState({ roles: result.data }, () => {  })
            }
        });
    }

    onSubmit = () => {
        const invalidReason = this.isInvalidForm()
        if (invalidReason) {
            console.error(invalidReason)
            return false;
        }

        const opportunity_id = this.props.opp_id
        const dataToBeSubmitted = this.state.rows.filter(r => r.contact).map(r => {
            return {
                sales_id: r.id, // for new contacts, this value will be null/undefined
                roll_id: r.role_id,
                is_primary: r.is_primary ? 1 : 0,
                contact_key_val: r.contact,
                source_data_id: opportunity_id, // source_data_type=3
            }
        })

        

        postData('sales/Opportunity/update_opportunity_contact_role', dataToBeSubmitted).then((result) => {
            if (result.status) {
                toastMessageShow('Update successfully.', 's');
                this.props.closeModal();
                this.props.get_opportunity_details(this.props.opp_id);
                // fetch contact list for email activity recipients
                this.props.get_contact_name_search_for_email_act({ salesId: this.props.salesId, sales_type: this.props.sales_type, type: 'own' });
                this.props.get_contact_name_search_for_email_act({ salesId: this.props.salesId, sales_type: this.props.sales_type, type: 'all' });
            }
        });
    }

    
    isInvalidForm() {
        // validate role
        for (let i = 0; i < this.state.rows.length; i++) {
            const row = this.state.rows[i]
            const errors = row.errors || {}

            if (Object.keys(errors).length > 0) {
                const firstError = errors[Object.keys(errors)[0]]
                return firstError
            }
        }

        return false
    }


    checkIfRowIndexIsBrandNew(index) {
        const numOfContactsInitially = (this.props.contacts_data || []).length
        if (index > numOfContactsInitially - 1) {
            return true
        }

        return false
    }


    checkIfRoleWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        const prevRoleId = _.get(this.props.contacts_data, `${index}.roll_id`)
        const newRoleId = _.get(this.state.rows, `${index}.role_id`)

        if (prevRoleId && newRoleId) {
            if (parseInt(prevRoleId) !== parseInt(newRoleId)) {
                return true
            }
        }

        return false
    }

    checkIfContactWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        const prevContactId = _.get(this.props.contacts_data, `${index}.contact_key_val.value`)
        const newContactId = _.get(this.state.rows, `${index}.contact.value`)

        if (prevContactId && newContactId) {
            if (parseInt(prevContactId) !== parseInt(newContactId)) {
                return true
            }
        }

        return false
    }

    checkIfIsPrimaryWasModified(index) {
        // lets use the props for prev values because it contains the most original data
        let prevIsPrimary = _.get(this.props.contacts_data, `${index}.is_primary`)
        prevIsPrimary = ['1', 1, true].indexOf(prevIsPrimary) >= 0
        let currentIsPrimary = _.get(this.state.rows, `${index}.is_primary`)
        currentIsPrimary = ['1', 1, true].indexOf(currentIsPrimary) >= 0

        if (prevIsPrimary !== currentIsPrimary) {
            return true
        }

        return false
    }

    isRoleCellInvalid(row) {
        const reasons = this.state.roles.map(role => {
            if (parseInt(row.role_id) !== parseInt(role.value)) {
                return false
            }

            const maxNumContactsWithThisRole = role.max_num_contacts_with_this_role
            if (maxNumContactsWithThisRole) {
                const otherRows = this.state.rows.filter(_row => _row !== row)
                const otherRowsWithThisRole = otherRows.filter(_row => parseInt(_row.role_id) === parseInt(role.value))
                const is_invalid = otherRowsWithThisRole.length >= maxNumContactsWithThisRole
                if (is_invalid) {
                    if (parseInt(maxNumContactsWithThisRole) === 1) {
                        return `This role '${role.label}' was already been taken`
                    } else {
                        return `You can only use the '${role.label}' role for up to ${maxNumContactsWithThisRole} contacts`
                    }
                }
            }

            return false
        })


        const firstErrorReason = reasons.find(r => !!r && typeof r === 'string')
        return firstErrorReason
    }

    handleChangeRole = prevRow => e => {
        let role_id = !e.target.value || e.target.value === 'Select option' ? null : e.target.value // The 'Select option' is for safety

        const newRows = this.state.rows.map(r => prevRow !== r ? r : {...r, role_id})
        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }


    handleChangedContact = idx=> prevRow => contact => {
        if (!contact) {
            return
        }
       
        if (contact.value === 'new contact') {
            this.setState({openCreateModal :  true, row_index: idx});
            return;
        } 

        let newRows = this.state.rows.map(r => prevRow !== r ? r : {...r, contact: contact })

        let shouldAddOneMoreExtraRow = false
        let rowsWithNonEmptyContacts = newRows.filter(r => !!r.contact)
        if (rowsWithNonEmptyContacts.length === this.state.rows.length) {
            shouldAddOneMoreExtraRow = true
        }

        if (ManageContactRoles.SHOULD_ADD_EXTRA_ROW && shouldAddOneMoreExtraRow) {
            newRows = newRows.concat({})
        }

        this.setState({ rows: newRows }, this.revalidateTable(newRows))
    }

    revalidateTable = (newRows) => () => {
        const newRowsWithErrors = this.validateAllRows(newRows)
        this.setState({ rows: newRowsWithErrors })
    }


    validateAllRows(newRows = []) {
        let rows = [...newRows]
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]

            // if contact is empty, dont validate
            if (!row.contact) {
                continue
            }

            // reset error bag for each row
            let errors = {}

            // role_id is required
            // The word 'Select option' is for safety 
            // just in case some dev put null/false/undefined instead of '' in the <select/>
            if (!row.role_id || row.role_id === 'Select option') {
                errors.role_id = 'Role is required'
            }
            
            // For the case of managing contact roles in opportunity details page
            // If 'decision maker' is used in multiple rows, yell error message
            if (row.contact && row.role_id) {
                const invalidRoleReason = this.isRoleCellInvalid(row)
                if (invalidRoleReason) {
                    errors.role_id = invalidRoleReason
                }
            }

            // find all rows with same contact and same role
            const rowWithSameContactAndRole = rows.filter(r => r !== row).filter(r => {
                const contactId = (r.contact || {}).value
                const roleId = r.role_id

                if (contactId && roleId) {
                    if ((row.contact || {}).value == contactId && row.role_id == roleId) {
                        return true
                    }
                }

                return false
            })
            if (rowWithSameContactAndRole.length > 0) {
                errors.role_id = `Role was used twice in the same contact`
                errors.contact = `Role was used twice in the same contact`
            }


            rows[i].errors = errors
        }
        
        return rows
    }


    /**
         * To close the create or update modal
         */
    closeModal = (status, res_data) => {
        let dataArr = res_data;
        this.setState({ openCreateModal: false });

        if (dataArr) {
            let rows = dataArr.map((contact, i) => {
                return {
                    id: '',
                    contact: { label: contact.label, value: contact.value },
                    // contact: {label: 'test', value: '1'},
                    role_id: '',
                    is_primary: 0,
                    errors: {},
                }
            })

            this.state.rows.splice(this.state.row_index, 0, ...rows);
            rows = this.state.rows;

            // add one more row
            if (ManageContactRoles.SHOULD_ADD_EXTRA_ROW) {
                rows.push({ errors: {} })
            }

            // always set the first row as primary
            rows = rows.map((c, i) => {
                return {
                    ...c,
                    is_primary: i === 0 && (dataArr || []).length === 0 ? true : !!c.is_primary
                }
            })

            let contacts_data = dataArr.map(c => ({ ...c }))

            this.setState({
                contacts_data: contacts_data,
                rows: rows,
            }, this.revalidateTable(rows))
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

        const invalidReason = this.isInvalidForm()


        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openContactRoles}
                    footer={[
                        <Button label="Cancel" onClick={this.props.closeModal} />,
                        <Button disabled={this.state.loading || invalidReason} label="Save" variant="brand" type="button" onClick={e => {
                            e.preventDefault()
                            this.onSubmit()
                        }} />,
                    ]}
                    onRequestClose={this.props.closeModal}
                    heading={'Manage Contact Roles'}
                    className="slds_custom_modal"
                    style={styles.modal}
                    size="small"
                >

                    <div className="slds-modal__header_">
                        <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={this.props.closeModal}>
                            <SLDSIcon icon="close" className={`slds-button__icon slds-button__icon_large`} aria-hidden="true" />
                            <span className="slds-assistive-text">Close</span>
                        </button>
                    </div>

                    <form id="create_opp" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} disabled={this.props.disabled} style={styles.form}>
                        <div className="slds-table_edit_container slds-is-relative">
                            <table aria-multiselectable="true" className="slds-table slds-no-cell-focus slds-table_bordered slds-table_edit slds-table_fixed-layout slds-table_resizable-cols" role="grid" >
                                <thead>
                                    <tr className="slds-line-height_reset">
                                        <th aria-label="Contact" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Contact">Contact</span>
                                            </div>
                                        </th>
                                        <th aria-label="Role" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Role">Role</span>
                                            </div>
                                        </th>
                                        <th aria-label="Is Primary" aria-sort="none" scope="col" style={styles.colHeader}>
                                            <span className="slds-assistive-text">Sort by: </span>
                                            <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                                <span className="slds-truncate" title="Close Date">Is Primary</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead >
                                <tbody>

                                    {(this.state.rows.length > 0) ?
                                       this.state.rows.map((row, idx) => {
                                        const invalidRoleReason = !!row.contact && !!row.role_id && this.isRoleCellInvalid(row)

                                        return (
                                            <tr aria-selected="false" className="slds-hint-parent" key={idx + 1}>
                                                {/* Inline editable cell to edit 'contact'.*/}
                                                <td
                                                    className={classNames({
                                                        'slds-cell-edit': true,
                                                        'slds-is-edited': !!row.contact && (this.checkIfRowIndexIsBrandNew(idx) || this.checkIfContactWasModified(idx)),
                                                        'slds-has-error': (row.errors || {})['contact'],
                                                    })}
                                                    role="gridcell" 
                                                    tabindex="0"
                                                >
                                                    <span className="slds-grid slds-grid_align-spread" title={!!invalidRoleReason ? invalidRoleReason : undefined}>
                                                        <span className="slds-p-right_x-small slds-truncate">
                                                            {(row.contact || {}).label}
                                                        </span>
                                                        <Popover
                                                            body={(
                                                                <SLDSReactSelect.Async 
                                                                    clearable={false}
                                                                    required={true}
                                                                    value={row.contact}
                                                                    cache={false}
                                                                    style={{ position: 'absolute' }}
                                                                    loadOptions={(e) => getOppContactDrpDwnList(e, [])}
                                                                    onChange={this.handleChangedContact(idx)(row)}
                                                                    placeholder="Search for contact"
                                                                    optionComponent={GravatarOption}
                                                                    filterOptions={selectFilterOptions}
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
                                                {/* 
                                                    Inline editable cell to edit 'role'. 
                                                    Note: The role 'decision maker' should be assigned to one of the rows only 
                                                */}
                                                <td 
                                                    className={classNames({
                                                        'slds-cell-edit': true,
                                                        'slds-is-edited': !!row.contact && (this.checkIfRowIndexIsBrandNew(idx) || this.checkIfRoleWasModified(idx)),
                                                        'slds-has-error': (row.errors || {})['role_id']
                                                    })} 
                                                    role="gridcell" 
                                                    tabindex="0"
                                                >
                                                    {
                                                        row.contact && (
                                                            <span className="slds-grid slds-grid_align-spread">
                                                                <span className="slds-p-right_x-small">
                                                                    {((this.state.roles || []).find(opt => opt.value == row.role_id) || {}).label}
                                                                </span>
                                                                <Popover
                                                                    body={(
                                                                        <div className="slds-form-element">
                                                                            <div className="slds-form-element__control">
                                                                                <div className="slds-select-container">
                                                                                    <select
                                                                                        className={`slds-select`} 
                                                                                        value={row.role_id} 
                                                                                        onChange={this.handleChangeRole(row)}
                                                                                    >
                                                                                        <option value={''} disabled selected hidden>Select option</option>
                                                                                        { 
                                                                                            this.state.roles.map(role => (
                                                                                                <option value={role.value}>{role.label}</option>
                                                                                            ))
                                                                                        }
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                            {
                                                                                // Validation error
                                                                                (row.errors || {})['role_id'] && (
                                                                                    <div className="slds-form-element__help">{(row.errors || {})['role_id']}</div>
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
                                                        )
                                                    }
                                                </td>
                                                {/* Inline editable cell to choose the 'primary' among all contacts */}
                                                <td
                                                    className={classNames({
                                                        'slds-cell-edit': true,
                                                        'slds-is-edited': !!row.contact && (this.checkIfRowIndexIsBrandNew(idx) || this.checkIfIsPrimaryWasModified(idx)),
                                                        'slds-has-error': (row.errors || {})['is_primary'],
                                                    })}
                                                    role="gridcell"
                                                >
                                                    {
                                                        row.contact && (
                                                            <span className="slds-radio">
                                                                <input type="radio" 
                                                                    name="is_primary" 
                                                                    id={`is_primary-${idx}`} 
                                                                    checked={row.is_primary} 
                                                                    onClick={() => {
                                                                        const newRows = this.state.rows.map(r => {
                                                                            if (r === row) {
                                                                                return {
                                                                                    ...r,
                                                                                    is_primary: true,
                                                                                }
                                                                            } else {
                                                                                return {
                                                                                    ...r,
                                                                                    is_primary: false,
                                                                                }
                                                                            }
                                                                        })

                                                                        this.setState({ rows: newRows })
                                                                    }} 
                                                                />
                                                                <label className="slds-radio__label" htmlFor={`is_primary-${idx}`} style={{ marginBottom: 0 }}>
                                                                    <span className="slds-radio_faux"></span>
                                                                    <span className="slds-form-element__label"></span>
                                                                </label>
                                                            </span>
                                                        )
                                                    }
                                                </td>
                                            </tr >
                                            )
                                       }) : ''}
                                </tbody >
                            </table >
                        </div >
                    </form>

                    {
                        this.state.openCreateModal && (
                            <CreateContactModal
                                contactId=''
                                showModal={this.state.openCreateModal}
                                closeModal={this.closeModal}
                                is_manage_contact_role={true}
                            />
                        )
                    }
                </Modal >
            </IconSettings>
        );
    }
}

const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ManageContactRoles);
