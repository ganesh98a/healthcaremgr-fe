import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import jQuery from "jquery";
import "react-datepicker/dist/react-datepicker.css";
import { ROUTER_PATH, BASE_URL } from 'config.js';
import { postData, handleChangeChkboxInput, handleChangeSelectDatepicker } from 'service/common.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { ToastUndo } from 'service/ToastUndo.js'
import Select from 'react-select-plus';

import { setDepartmentData } from 'components/admin/recruitment/actions/RecruitmentAction.js';
import { connect } from 'react-redux'

const getOptionNewRecruiter = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData('recruitment/RecruitmentUserManagement/get_new_recruiter_name', { search: e }).then((json) => {
        return { options: json };
    });
}


class AddStaffMember extends Component {
    constructor() {
        super();
        this.state = {
            pageTitle: 'Add User',
            phones: [],
            emails: [],
            allocation_area: [],
            preffer_allocation_area: [],
            user_details_show: false,
        }
    }


    selectChange = (e, selectedOption) => {
        this.setState({ recruiter: e });
        this.get_staff_details(e);
    }

    get_staff_details = (e) => {
        postData('recruitment/RecruitmentUserManagement/get_admin_details', { adminId: e.value }).then((result) => {
            if (result.status) {
                this.setState(result.data, () => { this.setState({ user_details_show: true }) });
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        var validate = jQuery("#add_staff").validate({ /* */ });

        if (jQuery("#add_staff").valid()) {
            this.setState({ loading: true });
            var request = { staffId: this.state.recruiter.value, allocation_area: this.state.allocation_area, preffer_allocation_area: this.state.preffer_allocation_area };
            postData('recruitment/RecruitmentUserManagement/add_new_recruiter_staff', request).then((result) => {
                if (result.status) {
                    this.props.closeModal(true);
                    toast.success(<ToastUndo message={'Added new staff successfully'} showType={'s'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({ loading: false });
            });
        }
    }


    render() {

        const options = [
            { value: 'all', label: 'All' },
            { value: 'disabled', label: 'Disabled' },
            { value: 'active', label: 'Active' },
        ];

        return (
            <div className={this.props.showModal ? 'customModal show' : 'customModal'}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        {this.state.pageTitle}
                        <span className="closeModal  icon icon-close1-ie" onClick={() => this.props.closeModal(false)}></span>
                    </h3>
                    <form id="add_staff" autoComplete="off">
                        <div className="row">
                            <div className="col-lg-8 col-md-8 col-sm-8">
                                <div className="csform-group">
                                <h3 className="mb-2"><strong>Search for a user:</strong></h3>
                                    <div className=" cmn_select_dv srch_select12 vldtn_slct">
                                        <Select.Async
                                            cache={false}
                                            name="form-field-name"
                                            clearable={false}
                                            value={this.state.recruiter}
                                            loadOptions={(e) => getOptionNewRecruiter(e)}
                                            placeholder='Search'
                                            onChange={(e) => this.selectChange(e, 'recruiter')}
                                            required={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>



                        {this.state.user_details_show ? <React.Fragment>

                            <div className="row mt-5">
                                <div className="col-lg-12 col-md-12 col-sm-12 ">
                                    <h3><strong>Staff Information:</strong></h3>
                                </div>
                            </div>
                            {/* row ends */}

                            <div className="row mt-5">

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                    <label className="">Name:</label>
                                        <p className="clr_grey mt-3r">{this.state.name}</p>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                        <label className="">HCM ID:</label>
                                        <p className="clr_grey mt-3r">{this.state.id}</p>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                        <label className="">Allocated Service Area/s:</label>
                                        <div className="filter_fields__ cmn_select_dv  w-80 vldtn_slct  mg_slct1 slct_des23">
                                            <Select
                                                className="custom_select"
                                                name="department"
                                                searchable={false}
                                                multi={true}
                                                clearable={false}
                                                value={this.state.allocation_area || ''}
                                                onChange={(e) => handleChangeSelectDatepicker(this, e, 'allocation_area')}
                                                options={this.props.recruitment_area}
                                                placeholder="Select"
                                                inputRenderer={() => <input type="text" className="define_input" name={"allocation_ares"} required="true" value={this.state.allocation_area.length > 0 ? 'dummy' : ''} />}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                        <label className="">Preferred Service Area:</label>
                                        <div className="filter_fields__ cmn_select_dv  w-80 vldtn_slct  mg_slct1 slct_des23">
                                            <Select name="view_by_status"
                                                required={true} 
                                                multi={true}
                                                searchable={false}
                                                clearable={false}
                                                placeholder="Select All"
                                                options={this.props.recruitment_area}
                                                onChange={(e) => handleChangeSelectDatepicker(this, e, 'preffer_allocation_area')}
                                                value={this.state.preffer_allocation_area}
                                                inputRenderer={() => <input type="text" className="define_input" name={"allocation_ares"} required="true" value={this.state.preffer_allocation_area.length > 0 ? 'dummy' : ''} />}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                        <label className="">Permission:</label>
                                        <p className="clr_grey mt-3r">All Permissions</p>
                                    </div>
                                </div>


                            </div>
                            {/* row ends */}

                            <div className="row">

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                        <label className="">Email:</label>
                                        <p className="clr_grey mt-3r">{this.state.emails.map((val, index) => (
                                            <span>{val.name}</span>
                                        ))}</p>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-2 addColie">
                                    <div className="csform-group">
                                        <label className="">Phone:</label>
                                        <p className="clr_grey mt-3r">{this.state.phones.map((val, index) => (
                                            <span>{val.name}</span>
                                        ))}</p>
                                    </div>
                                </div>

                            </div>
                            {/* row ends */}

                            <div className="row bor_line mt-5"></div>

                           
                            <div className="row">
                                <div className="col-md-12">
                                    <span className="">
                                        <button disabled={this.state.loading} onClick={this.onSubmit} className="btn cmn-btn1 creat_task_btn__">Apply Changes</button>
                                    </span>
                                </div>
                            </div></React.Fragment> : ''}
                    </form>
                    
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    recruitment_area: state.RecruitmentReducer.recruitment_area
})

const mapDispatchtoProps = (dispach) => {
    return {
        //departmentData: (value) => dispach(setDepartmentData(value)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(AddStaffMember)