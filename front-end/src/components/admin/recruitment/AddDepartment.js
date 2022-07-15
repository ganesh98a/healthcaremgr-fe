import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import jQuery from "jquery";
import "react-datepicker/dist/react-datepicker.css";
import { postData, handleChangeChkboxInput } from '../../../service/common.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastUndo } from 'service/ToastUndo.js'

class AddDepartment extends Component {

    constructor() {
        super();
        this.state = {
            loading: false,
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#create_dept").validate({ /* */ });

        if (!this.state.loading && jQuery("#create_dept").valid()) {
            this.setState({ loading: true });
            postData('recruitment/RecruitmentDashboard/create_department', this.state).then((result) => {
                if (result.status) {
                    toast.success((this.state.edit_mode) ? <ToastUndo message={'Department updated successfully'} showType={'s'} />:<ToastUndo message={'Department created successfully'} showType={'s'} />, {
                    // toast.success((this.state.edit_mode) ? "Department updated successfully" : "Department created successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                    this.props.closeModal(true);
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

    componentDidMount()
    {             
        this.setState(this.props.oldData,()=>{
            
        });
    }

    render() {

        return (
            <div className={this.props.showModal ? 'customModal show' : 'customModal'}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        {this.props.pageTitle}
                        <span className="closeModal icon icon-close1-ie" onClick={()=>this.props.closeModal(false)}></span>
                    </h3>

                    <form id="create_dept" autoComplete="off">

                        <div className="row bor_row_bef">

                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Department name:</label>
                                    <input type="text" className="csForm_control" placeholder="Department name" name="name" onChange={(e) => handleChangeChkboxInput(this, e)} value={this.state.name || ''} data-rule-required="true" maxLength="15" data-msg-required="Add Name" />
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="bor_line"></div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <span ><button /*disabled={this.state.loading} */ onClick={this.onSubmit} className="btn cmn-btn1 creat_task_btn__">Save User</button></span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default AddDepartment;