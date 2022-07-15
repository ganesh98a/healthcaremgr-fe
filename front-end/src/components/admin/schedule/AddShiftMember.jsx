import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, handleShareholderNameChange, handleChange } from 'service/common.js';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Spinner from '@salesforce/design-system-react/lib/components/spinner';
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon, Checkbox} from '@salesforce/design-system-react'

/**
 * Renders the add shift member modal component
 */
class AddShiftMember extends Component {

    /**
     * default constructor
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            redirectPage: false,
            showselectfilters: true,
            selected_item: 0,
            age_from: 0,
            age_to: 100,
            shift_members: [],
            selected_shift_members: [],
            srch_box:'',
            within_distance: false,
            available_only: false,
            mandatory_skills_only: false,
            male_only: false,
            female_only: false,
            age_range_only: false,
            preferred_only: false,
        }
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        var requestData = { 
            srch_box: this.state.srch_box,
            shift_id: this.props.shift_id,
            available_only: this.state.available_only,
            preferred_only: this.state.preferred_only,
            mandatory_skills_only: this.state.mandatory_skills_only,
            male_only: this.state.male_only,
            female_only: this.state.female_only,
            within_distance: this.state.within_distance,
            age_range_only: this.state.age_range_only,
            age_from: this.state.age_from,
            age_to: this.state.age_to
        };
        this.get_members_for_shift(requestData);
    }

    /**
     * fetching latest leaves of employees from KeyPay
     */
    get_keypay_employee_leaves = () => {
        this.setState({ loading: true });
		postData("member/MemberDashboard/get_keypay_employee_leaves").then((res) => {
			if (res.status) {
				toastMessageShow('Fetched leaves of employees/members from KeyPay successfully', "s");
                this.searchData();
			}
            else {
                toastMessageShow(res.error, "e");
            }
            this.setState({ loading: false });
		});
    }

    /**
     * Fetching/searching members to assign to the shift
     */
    get_members_for_shift = (requestData) => {
        this.setState({ loading: true });
        postData('member/MemberDashboard/get_members_for_shift',requestData).then((result) => {
            if (result.status) {
                let members = result.data;
                let selectedMemberShift = this.state.selected_shift_members;
                members.map((value, idx) => {
                    let findIndexMem = selectedMemberShift.findIndex((x) => x.id === value.id);
                    if (value.selected && findIndexMem === -1) {
                        selectedMemberShift.push(value);
                    }
                    if (findIndexMem > -1) {
                        value.selected = true;
                        members[idx].selected = true;
                    }
                }) 
                this.setState({ shift_members: members, selected_shift_members: selectedMemberShift }, () => {
                    this.setState({ loading: false });
                });
            } else if(result.error) {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false });
            } else {
                toastMessageShow('Something went wrong', "e");
                this.setState({ loading: false });
            }
        });
    }

    /**
     * Search members, setting required search variable elements
     */
    searchData = (e) => {
        if(e) {
            e.preventDefault();
        }
        this.setState({showselectfilters: false})
        var requestData = { 
            srch_box: this.state.srch_box,
            available_only: this.state.available_only,
            preferred_only: this.state.preferred_only,
            within_distance: this.state.within_distance,
            mandatory_skills_only: this.state.mandatory_skills_only,
            male_only: this.state.male_only,
            female_only: this.state.female_only,
            age_range_only: this.state.age_range_only,
            age_from: this.state.age_from,
            age_to: this.state.age_to,
            shift_id: this.props.shift_id,
            submitted: 1
        };
        this.get_members_for_shift(requestData);
    }

    /**
     * when save button is clicked on the modal
     */
    submitShiftMembers = (e) => {
        this.setState({ loading: true });

        var req = {
            shift_id: this.props.shift_id, 
            shift_members: this.state.selected_shift_members
        }
        postData('schedule/ScheduleDashboard/assign_shift_members', req).then((result) => {
            if (result.status) {
                let msg = result.hasOwnProperty('msg') ? result.msg : '';
                toastMessageShow(result.msg, 's');
                this.props.closeAddShiftMember(true);
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false });
        });
    }

    /**
     * to display the filter panel on right of the listing table
     */
    showFilterPanel() {
        return (
            this.state.showselectfilters && 
            <td class="slds-panel slds-panel_docked-right slds-is-open" style={{ height:'100%'}} aria-hidden="false" style={{ width: "280px",  'vertical-align': 'top', position: 'relative' }}>
                {/* List Filtering */}
                <div >
                    <div class="slds-panel__header">
                        <h3 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Quick Filter</h3>
                        <button  onClick={(e) => this.toggleFilterPanel()} class="slds-button slds-button_icon slds-button_icon-large slds-panel__close" title="Collapse Filter">X</button>
                    </div>
                    <div class="slds-panel__body pb-2">
                        <div class="slds-filters">
                            <div className="row col-sm-12">
                            <div className="slds-form-element__control">
                                <Checkbox
                                assistiveText={{
                                    label: 'Available only',
                                }}
                                id="is_available"
                                labels={{
                                    label: 'Available only',
                                }}
                                checked={this.state.available_only}
                                onChange={(e) => {
                                    this.setState({available_only: e.target.checked});
                                }}
                            />
                            </div>
                            </div>

                            <div className="row col-sm-12">
                            <div className="slds-form-element__control">
                                <Checkbox
                                assistiveText={{
                                    label: 'Preferred only',
                                }}
                                id="is_preferred"
                                labels={{
                                    label: 'Preferred only',
                                }}
                                checked={this.state.preferred_only}
                                onChange={(e) => {
                                    this.setState({preferred_only: e.target.checked});
                                }}
                            />
                            </div>
                            </div>

                            <div className="row col-sm-12">
                            <div className="slds-form-element__control">
                                <Checkbox
                                assistiveText={{
                                    label: 'Within Distance',
                                }}
                                id="within_distance"
                                labels={{
                                    label: 'Within Distance',
                                }}
                                checked={this.state.within_distance}
                                onChange={(e) => {
                                    this.setState({within_distance: e.target.checked});
                                }}
                            />
                            </div>
                            </div>

                            <div className="row col-sm-12">
                            <div className="slds-form-element__control">
                                <Checkbox
                                assistiveText={{
                                    label: 'Mandatory Skills',
                                }}
                                id="mandatory_skills_only"
                                labels={{
                                    label: 'Mandatory Skills',
                                }}
                                checked={this.state.mandatory_skills_only}
                                onChange={(e) => {
                                    this.setState({mandatory_skills_only: e.target.checked});
                                }}
                            />
                            </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-5 text-left">
                                    <div className="slds-form-element__control">
                                        <Checkbox
                                        assistiveText={{
                                            label: 'Male',
                                        }}
                                        id="male_only"
                                        labels={{
                                            label: 'Male',
                                        }}
                                        checked={this.state.male_only}
                                        onChange={(e) => {
                                            this.setState({male_only: e.target.checked});
                                        }}
                                    />
                                    </div>
                                </div>
                                <div className="col-sm-5 text-left">
                                    <div className="slds-form-element__control">
                                        <Checkbox
                                            assistiveText={{
                                                label: 'Female',
                                            }}
                                            id="female_only"
                                            labels={{
                                                label: 'Female',
                                            }}
                                            checked={this.state.female_only}
                                            onChange={(e) => {
                                                this.setState({female_only: e.target.checked});
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-5 text-left">
                                    <div className="slds-form-element__control">
                                        <Checkbox
                                        assistiveText={{
                                            label: 'Age',
                                        }}
                                        id="age_range_only"
                                        labels={{
                                            label: 'Age Range',
                                        }}
                                        checked={this.state.age_range_only}
                                        onChange={(e) => {
                                            this.setState({age_range_only: e.target.checked});
                                        }}
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-3 text-left">
                                    <div className="slds-form-element__control"> 
                                    <input type="text"
                                        name="age_from"
                                        placeholder=""
                                        onChange={(e) => {
                                            if (!isNaN(e.target.value)) {
                                                this.setState({ changedValue: true });
                                                handleChange(this, e);
                                            }
                                        }}
                                        value={this.state.age_from}
                                        data-rule-maxlength="3"
                                        maxLength="3"
                                        data-msg-number="Please enter valid number"
                                        className="slds-input"
                                    />
                                    </div>
                                </div>
                                <div className="col-sm-3 text-left">
                                    <div className="slds-form-element__control"> 
                                    <input type="text"
                                        name="age_to"
                                        placeholder=""
                                        onChange={(e) => {
                                            if (!isNaN(e.target.value)) {
                                                this.setState({ changedValue: true });
                                                handleChange(this, e);
                                            }
                                        }}
                                        value={this.state.age_to}
                                        data-rule-maxlength="3"
                                        maxLength="3"
                                        data-msg-number="Please enter valid number"
                                        className="slds-input"
                                    />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="row pt-3">
                                <div className="col-sm-6 text-left">
                                <Button id="cancel-member-filter" onClick={(e) => this.setState({showselectfilters: false})}  disabled={this.state.loading} label="Cancel" />
                                </div>
                                <div className="col-sm-6 text-right">
                                    <Button id="apply-member-filter" disabled={this.state.loading} label="Apply" variant="brand" onClick={this.searchData} />
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            
            </td>
        )
    }

    /**
     * toggle filter panel
     */
    toggleFilterPanel = () => {
        this.setState({showselectfilters: !this.state.showselectfilters})
    }

    /**
     * onChangeselect
     * @param {int} idx 
     * @param {boolean} selectCond 
     * @param {*} e 
     */
    onSelectMember = (idx, selectCond, e) => {
        let member = [];
        let selectedMemberShift = this.state.selected_shift_members;
        let shift_members = this.state.shift_members;
        if (selectCond) {
            member = this.state.shift_members[idx];
        } else {
            member = this.state.selected_shift_members[idx];
        }
        
        if (member && member.id) {
            let findIndexMem = selectedMemberShift.findIndex((x) => x.id === member.id);
            let findIndexShiftMembers = shift_members.findIndex((x) => x.id === member.id);
            if (findIndexMem > -1) {
                selectedMemberShift.splice(findIndexMem, 1);
                shift_members[findIndexShiftMembers].selected = false;
                this.setState({shift_members: shift_members});
            } else {
                member.selected = true;
                selectedMemberShift.push(member);
            }
            this.setState({ selected_shift_members: selectedMemberShift });
        }       

    } 

    /**
     * rendering components
     */
    render() {
        var selected_count = 0;
        this.state.selected_shift_members.map((value, idx) => {
            if (value.selected) {
                selected_count += 1;
            }
        }) 

        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openAddShiftMember}
                    footer={[
                        <div className="row">
                        <div className="col-xs-6 text-left">
                        <Button disabled={this.state.loading} label="Fetch Leaves" variant="brand" onClick={() => this.get_keypay_employee_leaves()} />
                        </div>
                        <div className="col-xs-6 text-right">
                        <Button id="cancel_member" disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeAddShiftMember(false,false)} />
                        <Button id="save-member-filter" disabled={this.state.loading} label="Save" variant="brand" onClick={() => this.submitShiftMembers()} />
                        </div>
                        </div>
                    ]}
                    onRequestClose={this.toggleOpen}
                    heading={"Add Shift Support Workers"}
                    size="large"
                    className="slds_custom_modal"
                    onRequestClose={() => this.props.closeAddShiftMember(false)}
                    dismissOnClickOutside={false}
                >
                    <div className="slds-col slds-grid slds-grid_vertical slds-nowrap">
                        <div className="slds-p-vertical_x-small slds-p-horizontal_large slds-shrink-none slds-theme_shade">
                            <div className="slds-form-element">
                                <form id="srch_task" autoComplete="off" onSubmit={this.searchData} method="post">
                                <div class="slds-clearfix">
                                    <div class="slds-float_left" style={{width:'93%'}}>
                                        <Input
                                        iconRight={
                                            <InputIcon
                                                assistiveText={{
                                                    icon: 'Search',
                                                }}
                                                name="search"
                                                category="utility"
                                            />
                                        }
                                        onChange={(e) => this.setState({ srch_box: e.target.value })}
                                        id="multiple-select-search"
                                        placeholder="Search Support Workers"
                                        disabled={this.state.loading}
                                        />
                                    </div>
                                    <div class="slds-float_left" style={{position: 'relative'}}>
                                        <button onClick={(e) => this.toggleFilterPanel()} class="slds-button  slds-button_icon-more" tabindex="0" title="Filter records" type="button" aria-expanded="false" aria-haspopup="true">
                                            <svg aria-hidden="true" class="slds-button__icon">
                                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#filterList"></use>
                                            </svg>
                                            <span class="slds-assistive-text">Filter</span>
                                        </button>
                                        
                                    </div>
                                </div>
                                </form>
                            </div>
                            {(this.state.selected_shift_members.length > 0) ?
                            <div className="slds-pill_container slds-pill_container_bare">
                                <ul className="slds-listbox slds-listbox_horizontal" role="listbox" aria-label="Selected Options:" aria-orientation="horizontal">
                                        {this.state.selected_shift_members.map((value, idx) => (
                                            (value.selected) ?
                                                <li className="slds-listbox-item" role="presentation" key={idx + 9}>
                                                    <span className="slds-pill" role="option" tabIndex="0" aria-selected="true">
                                                        <span className="slds-pill__label" title={value.fullname}>{value.fullname}</span>
                                                        <span className="slds-icon_container slds-pill__remove" title="Remove" onClick={(e) => {
                                                            this.onSelectMember(idx, false, e);
                                                        }}>
                                                            <svg className="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                                                            </svg>
                                                        </span>
                                                    </span>
                                                </li> : ''
                                        ))}
                                </ul>
                            </div> : ''}
                            <div className="slds-text-title slds-m-top_x-small" aria-live="polite">{selected_count} Support Worker{(selected_count > 1)?'s':''} Selected</div>
                        </div>
                        
                        <div className="slds-scrollable slds-grow" style={{'min-height':'200px'}}>
                        <table>
                            <tr><td style={{ width: "auto",  'vertical-align': 'top' }}>
                            <div className="slds-scrollable_none">
                                <table aria-multiselectable="true" className="slds-table slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid">
                                    <thead>
                                        <tr className="slds-line-height_reset">
                                            <th className="" scope="col" style={{ width: "5%" }}></th>
                                            <th aria-label="Item" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "20%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Support Worker
                                                <span className="slds-resizable__handle">
                                                    <span className="slds-resizable__divider"></span>
                                                </span>
                                                </a>
                                            </th>
                                            <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "12%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Is Preferred
                                                <span className="slds-resizable__handle">
                                                    <span className="slds-resizable__divider"></span>
                                                </span>
                                                </a>
                                            </th>
                                            <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "32%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Skills
                                                <span className="slds-resizable__handle">
                                                    <span className="slds-resizable__divider"></span>
                                                </span>
                                                </a>
                                            </th>
                                            <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "12%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Distance
                                                <span className="slds-resizable__handle">
                                                    <span className="slds-resizable__divider"></span>
                                                </span>
                                                </a>
                                            </th>
                                            <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "10%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Is Available
                                                <span className="slds-resizable__handle">
                                                    <span className="slds-resizable__divider"></span>
                                                </span>
                                                </a>
                                            </th>
                                            <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "6%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Age
                                                <span className="slds-resizable__handle">
                                                    <span className="slds-resizable__divider"></span>
                                                </span>
                                                </a>
                                            </th>
                                            <th aria-label="Item Number" aria-sort="none" className="slds-is-resizable slds-is-sortable" scope="col" style={{ width: "8%" }}>
                                                <a className="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabIndex="-1">Gender</a>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.shift_members.map((value, idx) => {
                                                var activeClass = '';
                                                if(value.selected)
                                                    activeClass ='slds-hint-parent slds-is-selected';
                                                else
                                                    activeClass ='slds-hint-parent';
                                                
                                                return <tr className={activeClass} key={idx} aria-selected={(value.selected) ? 'true' : 'false'} title={value.not_available_reason}>
                                                    
                                                    <td className="slds-text-align_right" role="gridcell">
                                                        <div className="slds-checkbox_add-button">

                                                            <input type="checkbox"  style={{'padding-bottom':0}} className="slds-assistive-text" id={'add-checkbox-'+value.id} value={'add-checkbox-'+value.id}  tabIndex="-1" onChange={(e) => { 
                                                                handleShareholderNameChange(this, 'shift_members', idx, 'selected', e.target.checked)
                                                            this.onSelectMember(idx, true, e);
                                                            }} checked={value.selected?true:false} disabled={value.is_available ? false : true} />                                                                    
                                                            <label style={{'margin-bottom':0}} htmlFor={'add-checkbox-'+value.id} className="slds-checkbox_faux" >
                                                                
                                                            </label>
                                                        </div>
                                                    </td>

                                                    <td role="gridcell">
                                                        <div className="slds-truncate" title={value.line_item_name}>{value.fullname}</div>
                                                    </td>
                                                    <td role="gridcell">
                                                        <div className="slds-checkbox">
                                                        <input type="checkbox" name={value.id} id={value.id} checked={(value.is_preferred && value.is_preferred=='1') ? true : false}/>
                                                        <label className="slds-checkbox__label" htmlFor={value.id}>
                                                            <span className="slds-checkbox_faux"></span>
                                                        </label>
                                                        </div>
                                                    </td>
                                                    <td role="gridcell">
                                                        <div className="slds-truncate" title={value.skills}>{value.skills}</div>
                                                    </td>
                                                    <td role="gridcell">
                                                        <div className="slds-truncate" title={value.distance_label}>{value.distance_label}</div>
                                                    </td>
                                                    <td role="gridcell">
                                                        <div className="slds-checkbox">
                                                        <input type="checkbox" name={value.id} id={value.id}  checked={(value.is_available && value.is_available=='1') ? true : false}/>
                                                        <label className="slds-checkbox__label" htmlFor={value.id}>
                                                            <span className="slds-checkbox_faux"></span>
                                                        </label>
                                                        </div>
                                                    </td>
                                                    <td role="gridcell">
                                                        <div className="slds-truncate" title={value.dob}>{value.age > 0 ? value.age : ''}</div>
                                                    </td>
                                                    <td role="gridcell">
                                                        <div className="slds-truncate" title={value.gender_label}>{value.gender_label}</div>
                                                    </td>
                                                </tr>
                                            }) }
                                    </tbody>
                                </table>
                            </div>
                            </td>
                            {this.showFilterPanel()}
                            </tr>
                            </table>
                        </div>
                    </div>
                </Modal>
            </IconSettings>
        );
    }
}

export default AddShiftMember;