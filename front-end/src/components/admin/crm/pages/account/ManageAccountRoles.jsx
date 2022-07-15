import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionDataAddNewEntity } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
    Popover
} from '@salesforce/design-system-react';
import { css, selectFilterOptions } from '../../../../../service/common';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import CreateContactModal from '../contact/CreateContactModal';
/**
 * fetching contact names as user types in
 */
const getContactOptions = (e) => {
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
        else if(this.props.option.account_type==2 && this.props.option.is_site==0){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#account";
            className = "slds-icon-standard-account";
        }
        else if(this.props.option.account_type==2 && this.props.option.is_site==1){
            icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#household";
            className = "slds-icon-standard-household";
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
/**
 * Class: ManageAccountRoles
 */
class ManageAccountRoles extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            title: ' ',
            rows_count: 1,
            rows: [{id: "",contact: {label: "", value: ""}, role_id: "", is_primary: ""}],
            role_option: [],
            account_id: this.props.account_id ? this.props.account_id : '',
            account_type: this.props.account_type ? this.props.account_type : '',
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
        var state = {};
        var List = obj.state[stateName];
        if (value && value.value === 'new contact') {
            //validate contact already is primary
            if (fieldName == 'contact') {
                List.map((listrow, idx) => {
                    if (listrow.is_primary != 1) {
                        List[idx]['is_primary'] = 0;
                    }
                });
            }
            this.setState({rows : List}, () => {
                this.setState({ openCreateModal: true, row_index: index });
                return;
            });

        }else{
            return new Promise((resolve, reject) => {
                if (e != undefined && e.target.pattern) {
                    const re = eval(e.target.pattern);
                    if (e.target.value != "" && !re.test(e.target.value)) {
                        resolve({ status: false });
                        return;
                    }
                }
                
                // make all is_primary 0 before setting one for current index
                List[index][fieldName] = value;
                if(fieldName == 'is_primary') {
                    List.map((listrow, idx) => {
                        List[idx]['is_primary'] = 0;
                    });
                }

                List[index][fieldName] = value;
                state[stateName] = Object.assign([], List);
                obj.setState(state, () => {
                    resolve({ status: true });                   
                });
                
            });
        }  
       
    }

    /**
     * Adding a new row in the table for user to insert data of contact
     */
    addRow = (e) => {
        var currows = this.state.rows;
        currows.push({id: "",contact: {label: '', value: ''}, role_id: "", is_primary: ""});
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
     * To close the create contact modal
     */
     closeModal = (status, res_data) => {
        let dataArr = res_data;
        this.setState({ openCreateModal: false });
        let contact_id = this.state.rows[this.state.row_index].id;
        
        if (dataArr) {
            let state_rows = this.state.rows;
            let contact_index = this.state.row_index;
            let rows = dataArr.map((contact, i) => {
                return {
                    id: state_rows[contact_index] && state_rows[contact_index].id ? state_rows[contact_index].id : '' ,
                    contact: { label: contact.label, value: contact.value },
                    role_id: state_rows[contact_index] && state_rows[contact_index].role_id ? state_rows[contact_index].role_id : '' ,
                    is_primary: state_rows[contact_index] && state_rows[contact_index].is_primary ? state_rows[contact_index].is_primary : 0 ,
                }
            })
            //insert data in particular index
            this.state.rows.splice(this.state.row_index, 0, ...rows);
            rows = this.state.rows;           
            // always set the first row as primary
            rows = rows.map((c, i) => {
                return {
                    ...c,
                    is_primary: i === 0 && (dataArr || []).length === 0 ? true : !!c.is_primary
                }
            })
            //filter the empty row
            let filteredRow = rows.filter(function(row) { 
                if(row.contact.label){
                    if(row.id==contact_id){
                        if(!row.person_id){
                            return row;  
                        }                        
                    }else{
                        return row;  
                    }                   
                }                 
             });
            this.setState({
                rows: filteredRow,
            })
        }

    }

    /**
     * fetching the reference data (org roles)
     */
    getReferenceData = () => {
		postData("sales/Account/get_account_roles", {account_type: this.props.account_type}).then((res) => {
			if (res.status) {
				this.setState({ 
                    role_option: (res.data) ? res.data : []
				})
			}
		});
    }

    /**
     * fetching the account contacts
     */
    get_account_contacts_list = () => {
        var Request = { id: this.props.account_id, account_type: this.props.account_type };
        postData('sales/Account/get_account_contacts_list', Request).then((result) => {
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
        this.getReferenceData();
        if (this.props.account_id) {
            this.get_account_contacts_list();
        }
        this.setState({ loading: false });
    }

    /**
     * Call the create/edit account contacts when user saves
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#regmemsave").validate({ /* */ });        
        var url = 'sales/Account/save_account_contact_roles';
        this.setState({ loading: true });
        var req = {
            account_contacts: this.state.rows ? this.state.rows : '',
            account_id: this.props.account_id ? this.props.account_id : '',
            account_type: this.props.account_type ? this.props.account_type : ''
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
                                    <span className="slds-truncate" title="Contact">Contact</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Role">Role</span>
                                </div>
                            </th>
                            <th aria-label="" aria-sort="none" scope="col" style={{ padding: 8+'px'}}>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                <span className="slds-truncate" title="Is Primary?">Is Primary?</span>
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
                                                {row.contact ? row.contact.label : ''}
                                            </span>
                                            <Popover
                                                body={(
                                                    <SLDSReactSelect.Async 
                                                        clearable={false}
                                                        required={true}
                                                        value={row.contact}
                                                        cache={false}
                                                        style={{ position: 'absolute' }}
                                                        loadOptions={(e) => getContactOptions(e, [])}
                                                        onChange={(e) => {
                                                            this.handleShareholderNameChange(this, 'rows', idx, 'contact', e)}
                                                        }
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
                                        
                                        <td className={"slds-cell-edit"} role="gridcell" tabIndex="0" >
                                        <span className="slds-grid slds-grid_align-spread">
                                            <span className="slds-p-right_x-small">
                                            {((this.state.role_option || []).find(opt => opt.value == row.role_id) || {}).label}
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
                                                        options={this.state.role_option}
                                                        onChange={(e) => this.handleShareholderNameChange(this, 'rows', idx, 'role_id', e)}
                                                        value={row.role_id}
                                                    />
                                                )}
                                                hasNoCloseButton
                                                hasNoNubbin
                                                style={{ position: 'absolute', top: 0, left: 0.0625+'rem', width: 230+'px'}}
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
                                                <span class="slds-radio" key={idx + 1}>
                                                    <input
                                                        type="radio"
                                                        id={"is_primary" + idx}
                                                        value={1}
                                                        name="managed_type_val"
                                                        required={true}
                                                        onClick={(e) => {
                                                            this.handleShareholderNameChange(this, 'rows', idx, 'is_primary', e.target.value)}
                                                        }
                                                        checked={1 == row.is_primary ? true : false}
                                                    />
                                                    <label class="slds-radio__label" for={"is_primary" + idx}>
                                                        <span class="slds-radio_faux"></span>
                                                        <span class="slds-form-element__label">&nbsp;</span>
                                                    </label>
                                                </span>
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
                            <td colSpan="4">&nbsp;</td>
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
                        isOpen={this.props.isOpen}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading="Manage Contact Roles"
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible slds_manage_contact-modal"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top">
                            <form id="contacts" autoComplete="off" className="slds_form" onSubmit={e => this.onSubmit()} style={{display: 'block',minHeight: 200}}>
                                {this.renderForm()}
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
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default ManageAccountRoles;
