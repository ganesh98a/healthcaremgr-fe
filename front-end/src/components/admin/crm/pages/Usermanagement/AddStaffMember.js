import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import jQuery from "jquery";
import "react-datepicker/dist/react-datepicker.css";
import { ROUTER_PATH, BASE_URL } from '../../../../../config.js';
import { postData, handleChangeChkboxInput, getOptionsallUsers } from '../../../../../service/common.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../../../service/jquery.validate.js';
import "../../../../../service/custom_script.js";
import { ToastUndo } from 'service/ToastUndo.js'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';


import { connect } from 'react-redux'

class AddStaffMember extends Component {

    constructor() {
        super();
        this.state = {
            filterVal: '',
            statusSelect: '',
            locationSel: '',
            filterSearch: '',
            loading: false,
            add_staff_to_crm: '',
            department_option: [],
            department_error: false,
            PhoneInput: [{ name: '' }],
            EmailInput: [{ name: '' }],
            edit_mode: false,
            ocs_id: '',
            username: '',
            hide: true,
            staff_to_crm: [{ email: '', hcm_id: '', phone: '', email: '', staffName: '', username: '', position: '', id: '' }]

        }
    }

    componentWillReceiveProps(newProps) {
        //console.log(newProps)
        if (newProps.staffData) {
            this.setState(newProps.staffData);
            this.setState({ edit_mode: true });
        } else {
            this.setState({ EmailInput: [{ name: '' }], PhoneInput: [{ name: '' }], username: '', firstname: '', lastname: '', position: '' });
        }
        this.setState({ pageTitle: newProps.title })
    }

    handleAddShareholder = (e, tagType) => {
        e.preventDefault();
        if (tagType === 'PhoneInput') {
            this.setState({ PhoneInput: this.state.PhoneInput.concat([{ name: '' }]) });
        } else {
            this.setState({ EmailInput: this.state.EmailInput.concat([{ name: '' }]) });
        }
    }

    handleRemoveShareholder = (e, idx, tagType) => {
        e.preventDefault();
        if (tagType === 'PhoneInput') {
            this.setState({ PhoneInput: this.state.PhoneInput.filter((s, sidx) => idx !== sidx) });
        } else {
            this.setState({ EmailInput: this.state.EmailInput.filter((s, sidx) => idx !== sidx) });
        }
    }


    selectChange = (selectedOption) => {
        this.setState({ department: selectedOption, department_error: false });
    }

    onSubmit = (e) => {
        e.preventDefault();
        var isSubmit = 1;
        jQuery("#create_user").validate({ /* */ });
        var customValid = true;
        var state = {};
        /* if(!this.state.department)
         {
             isSubmit = 0;
             state['department'+'_error'] = true;
         }*/

        if (!this.state.loading && jQuery("#create_user").valid() && isSubmit) {
            this.setState({ loading: true });
            postData('crm/CrmStaff/create_user', this.state).then((result) => {
                if (result.status) {
                    this.props.closeModal(true);
                    toast.success((this.state.edit_mode) ? <ToastUndo message={'User updated successfully'} showType={'s'} /> : <ToastUndo message={'User created successfully'} showType={'s'} />, {
                        //   toast.success((this.state.edit_mode)? "User updated successfully": "User created successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true

                    });

                    //setTimeout(() => this.setState({success: true}), 2000);
                    //
                    let state = this.state.staff_to_crm;
                    state['email'] = '';
                    state['hcm_id'] = '';
                    state['phone'] = '';
                    state['email'] = '';
                    state['staffName'] = '';
                    state['username'] = '';
                    state['id'] = '';
                    state['position'] = '';
                    this.setState(state);
                    this.setState({ add_staff_to_crm: '', hide: true });
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        // toast.error(result.error, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({ loading: false });
            });
        }
    }

    /*componentDidMount()
    {
        this.setState({department_option:this.props.DepartmentData});
        //DepartmentData is coming from redux
    }*/

    handleShareholderNameChange = (idx, evt, tagType) => {
        let list = this.state[tagType]
        var state = {}

        if (tagType == 'EmailInput') {
            list[idx].name = evt.target.value.replace(/\s/g, '');
        } else {
            list[idx].name = evt.target.value;
        }

        state[tagType] = list
        this.setState(state);
    }
    selectedUserData = (e) => {
        if (typeof (e) != 'undefined' && e != null) {
            this.setState({ add_staff_to_crm: e, staff_to_crm: e.data, ocs_id: e.data.id, username: e.data.username, hide: false });
        }
        else {
            this.setState({ add_staff_to_crm: '', staff_to_crm: '', ocs_id: '', username: '', hide: true });
        }
    }
    callHtmlForValidation = (currentState) => {
        return (this.state[currentState + '_error']) ? <div className={'tooltip fade top in' + ((this.state[currentState + '_error']) ? ' select-validation-error' : '')} role="tooltip">
            <div className="tooltip-arrow"></div><div className="tooltip-inner">This field is required.</div></div> : '';
    }
    render() {



        var options = [
            { value: 'one', label: 'Group Interview' },
            { value: 'two', label: 'Personal Interview', clearableValue: false }
        ];

        return (
            <div className={this.props.showModal ? 'customModal show' : 'customModal'}>
                <div className="cstomDialog widBig " /* style={{ paddingBottom: 0 }} */>
                    <h3 className="Modal_title-- align-self-center py-3 by-1 color justify-content-between d-flex">
                        <span className="Modal_title">{this.state.pageTitle}</span>

                        <span><i className="icon icon-close1-ie Modal_close_i pull-right" onClick={() => this.props.closeModal(false)}></i></span>
                    </h3>

                    <form id="create_user" method="post" autoComplete="off">

                        <div className="row my-5 ">
                            <div className="col-sm-8 modify_select">
                                <label className="title_input">Search for a user: </label>
                                <Select.Async
                                    cache={false}
                                    clearable={false}
                                    impleValue={true}
                                    searchable={true}
                                    name="add_user_to_crm"
                                    required={true}
                                    value={this.state.add_staff_to_crm}
                                    loadOptions={getOptionsallUsers}
                                    placeholder="Filter by Type"
                                    onChange={(e) => this.selectedUserData(e)}
                                    className={'custom_select'}
                                />

                                {// <Select name="view_by_status" searchable={true} required={true} simpleValue={true} Clearable={false} placeholder="Filter by Type" />
                                }
                            </div>
                        </div>
                        {this.state.hide ? '' :
                            <div className="row">
                                <div className="col-md-12 title_sub_modal">User Information</div>
                                <div className="col-md-12">
                                    <div className="User_infomation_fileds_">

                                        <div className="User_info_td_">
                                            <label>Name:</label>
                                            <span>{(this.state.staff_to_crm) ? this.state.staff_to_crm.staffName : 'N/A'}</span>
                                        </div>


                                        <div className="User_info_td_">
                                            <label>Hcm ID:</label>
                                            <span>{(this.state.staff_to_crm) ? this.state.staff_to_crm.id : 'N/A'}</span>
                                        </div>

                                        <div className="User_info_td_">
                                            <label>Allocated Service Area:</label>
                                            <span>NDIS</span>
                                        </div>

                                        <div className="User_info_td_">
                                            <label>Preferred Service Area:</label>
                                            <span>NDIS</span>
                                        </div>

                                        <div className="User_info_td_">
                                            <label>Permissions:</label>
                                            <span>All Permissions</span>
                                        </div>

                                        <div className="User_info_td_">
                                            <label>Email:</label>
                                            <span>{(this.state.staff_to_crm.email) ? this.state.staff_to_crm.email : 'N/A'}</span>
                                        </div>

                                        <div className="User_info_td_">
                                            <label>Phone:</label>
                                            <span>{(this.state.staff_to_crm.phone) ? this.state.staff_to_crm.phone : 'N/A'}</span>
                                        </div>

                                        <div className="User_info_td_">
                                            <label>Position:</label>
                                            <span>{(this.state.staff_to_crm.position) ? this.state.staff_to_crm.position : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                        {/*
                        <div className="row bor_row_bef py-4">

                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Name:</label>
                                    <input type="text" className="Form_control" placeholder="First name" name="firstname"
                                        onChange={(e) => handleChangeChkboxInput(this, e)} value={this.state.firstname || ''} data-rule-required="true" maxLength="30" data-msg-required="Add First Name" />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label></label>
                                    <div className="cmn_select_dv">
                                        <input type="text" className="Form_control" placeholder="Last name" name="lastname"
                                            onChange={(e) => handleChangeChkboxInput(this, e)} value={this.state.lastname || ''} data-rule-required="true" maxLength="30" data-msg-required="Add Last Name" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Position:</label>
                                    <div className="cmn_select_dv">
                                        <input type="text" className="Form_control" placeholder="Position" name="position" onChange={(e) => handleChangeChkboxInput(this, e)} value={this.state.position || ''} data-rule-required="true" maxLength="30" data-msg-required="Enter Position" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3 ">
                                <div className="csform-group">
                                    <label>Phone:</label>

                                    {this.state.PhoneInput.map((PhoneInput, idx) => (
                                        <div className="ad_dv" key={idx + 1}>
                                            <input className="Form_control distinctPhone" type="text"
                                                value={PhoneInput.name || ''}
                                                name={'phone_' + idx}
                                                placeholder="Can include area code"
                                                onChange={(evt) => this.handleShareholderNameChange(idx, evt, 'PhoneInput')}
                                                data-rule-required="true"
                                                maxLength="18"
                                                data-rule-notequaltogroup='[".distinctPhone"]'
                                                data-msg-notequaltogroup='Please enter uniqe phone number'
                                                data-msg-required="Add Phone Number"
                                            />

                                            {idx > 0 ? <button className='btn btn_AddFld_cmn crm_plus_icon' onClick={(e) => this.handleRemoveShareholder(e, idx, 'PhoneInput')}>
                                                <i className="icon icon-decrease-icon icn_remove" ></i>
                                            </button> : (this.state.PhoneInput.length == 3) ? '' : <button className='btn btn_AddFld_cmn crm_plus_icon' onClick={(e) => this.handleAddShareholder(e, 'PhoneInput')}>
                                                <i className="icon icon-add-icons icn_add" ></i>
                                            </button>}

                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-3 ">
                                <div className="csform-group">
                                    <label>Email:</label>
                                    {this.state.EmailInput.map((EmailInput, idx) => (
                                        <div className="ad_dv" key={idx + 1}>
                                            <input className="Form_control distinctEmail" type="text"
                                                value={EmailInput.name || ''}
                                                name={'email_' + idx}
                                                placeholder={idx > 0 ? 'Secondary email' : 'Primary Email'}
                                                onChange={(evt) => this.handleShareholderNameChange(idx, evt, 'EmailInput')}
                                                data-rule-required="true"
                                                data-rule-email="true"
                                                data-rule-remote={BASE_URL + 'crm/CrmStaff/check_user_emailaddress_already_exist' + ((this.state.edit_mode) ? '?adminId=' + this.state.id : '')}
                                                data-msg-remote="This email already exist"
                                                data-rule-notequaltogroup='[".distinctEmail"]'
                                                maxLength="70"
                                                data-msg-required="Add Email Address"
                                            />
                                            {idx > 0 ? <button onClick={(e) => this.handleRemoveShareholder(e, idx, 'EmailInput')} className='btn btn_AddFld_cmn crm_plus_icon'>
                                                <i className="icon icon-decrease-icon icn_remove" ></i>
                                            </button> : (this.state.EmailInput.length == 3) ? '' : <button className='btn btn_AddFld_cmn crm_plus_icon' onClick={(e) => this.handleAddShareholder(e, 'EmailInput')}>
                                                <i className="icon icon-add-icons icn_add" ></i>
                                            </button>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-3">
                                <label>Username:</label>
                                <div className="csform-group ">
                                    <input className="Form_control input_f mb-1" type="text"
                                        value={this.state.username || ''}
                                        name="username"
                                        placeholder="Username"
                                        onChange={(e) => this.setState({ username: e.target.value.replace(/\s/g, '') })}
                                        data-rule-required="true"
                                        data-rule-minlength="6"
                                        maxLength="25"
                                        readOnly={(this.state.edit_mode)}
                                        data-rule-remote={BASE_URL + 'crm/CrmStaff/check_username_already_exist/' + ((this.state.edit_mode) ? '?adminId=' + this.state.id : '')}
                                        data-msg-remote="This username already exist"
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label>Password:</label>
                                <div className="csform-group">
                                    <input className="Form_control input_f mb-1" type="password"
                                        value={this.state.password || ''}
                                        name="password"
                                        maxLength="20"

                                        placeholder="Password"
                                        onChange={(e) => handleChangeChkboxInput(this, e)}
                                        data-rule-required={this.state.edit_mode ? false : true}
                                        data-rule-minlength="6" autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="bb-1"></div>
                            </div>
                        </div>

                    */}     <div className="row">
                            <div className="col-md-12">
                                <div className="bb-1"></div>
                            </div>
                            <div className="col-md-3 pull-right py-3">
                                <span className="v-c-btn1 creat_task_btn__">
                                    <button disabled={this.state.loading} onClick={this.onSubmit} className="but">Save User</button>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    DepartmentData: state.RecruitmentReducer.departmentData
})

const mapDispatchtoProps = (dispach) => {
    return {
        //departmentData: (value) => dispach(setDepartmentData(value)),

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(AddStaffMember)
