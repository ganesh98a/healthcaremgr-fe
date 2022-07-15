import React, { Component } from 'react';
import ReactTable from "react-table";
import { postData} from 'service/common.js';
import moment from "moment";
import { ToastContainer, toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';

class RescheduleGroupOrCabInterview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            available_interview: [],
            selected_interview: [],
        }
    };

     getTaskDetails = (applicant_id) => {
        postData('recruitment/RecruitmentTaskAction/get_available_group_or_cab_interview_for_applicant', {applicant_id: applicant_id, task_stage: this.props.task_stage}).then((result) => {
              if (result.status) {
                   this.setState(result.data);   
              }
        });
    }
    
    selectInterview = (index) => {
        var state = {};
        var List = this.state['available_interview'];
        var NewList = List.map((val, idx) => {
             val.selected = false;
             return val;
        })
        
        NewList[index]['selected'] = true
        state['available_interview'] = NewList;
        state['selected_interview'] = NewList[index];
              
        this.setState(state);
    }
    
    saveChanges = (e) => {
        e.preventDefault();
        if(this.state.selected_interview.taskId){
            this.setState({loading: true});
            var request = {applicant_id: this.props.applicant_id, taskId : this.state.selected_interview.taskId, task_stage: this.props.task_stage, request_type: this.props.request_type};
            postData('recruitment/RecruitmentTaskAction/add_applicant_in_available_interview', request).then((result) => {
                if (result.status) {
                    this.setState(result.data);   
                    this.props.closeModal(true);
                }else{
                     toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({loading: false});
            });
        }else{
            toast.error(<ToastUndo message={this.props.task_stage==6?"Please select cabday interview":"Please select group interview"} showType={'e'} />, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }
    }
    
    componentDidMount = () => {
        this.getTaskDetails(this.props.applicant_id);
    }

    render() {
        return (
            <div className={'customModal ' + (this.props.showModal ? ' show' : ' ')}>
                <div className="cstomDialog widBig">

                    <h3 className="cstmModal_hdng1--">
                        New {this.props.task_stage == 3? "Group Interview": "Cab Day"} for Applicant
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModal(false)}></span>
                    </h3>

                    <div className="row">

                        <div className="col-md-6 col-sm-12">

                            <div className="row">
                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="csform-group">
                                        <label className="fs_16">Applicant Name:</label>
                                        <p className="mt-3 clr_grey">{this.state.applicant_name}</p>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="csform-group">
                                        <label className="fs_16">Interview Type:</label>
                                        <p className="mt-3 clr_grey">{this.props.task_stage == 3? "Group Interview": "Cab Day"}</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="col-md-6 col-sm-12">

                            <div className="row">
                                <div className="col-md-12 col-sm-12">
                                    <div className="csform-group">
                                        <label className="fs_16">Interview Selected:</label>
                                    </div>
                                </div>

                                <div className="col-md-6 col-sm-6">
                                    <h6 className="mb-4"><b>Date: &nbsp;</b><span className="clr_grey">
                                    {this.state.selected_interview.start_datetime? moment(this.state.selected_interview.start_datetime).format('DD/MM/YYYY'): 'N/A'}</span></h6>
                                    <h6 className="mb-4"><b>Time: &nbsp;</b><span className="clr_grey">
                                    {this.state.selected_interview.start_time? this.state.selected_interview.start_time +' - '+this.state.selected_interview.end_time : 'N/A'}</span></h6>
                                    <h6>
                                        <b>Location:</b><br />
                                        <div className="lh-17 mt-2 clr_grey">{this.state.selected_interview.training_location? this.state.selected_interview.training_location: 'N/A'}</div>
                                    </h6>
                                </div>
                                <div className="col-md-6 col-sm-6">
                                    <h6 className="mb-4"><b>Confirmed Attendees: &nbsp;</b><span className="clr_grey">{this.state.selected_interview.accepted || "N/A"}</span></h6>
                                    <h6 className="mb-4"><b>Pending Attendees: &nbsp;</b><span className="clr_grey">{this.state.selected_interview.pending || "N/A"}</span></h6>
                                    <h6 className="mb-5"><b>Available Spots: &nbsp;</b><span className="clr_grey">{this.state.selected_interview.available || "N/A"}</span></h6>

                                    <h6 className="mb-4"><b>Staff in charge: &nbsp;</b><span className="clr_grey">{this.state.selected_interview.primary_recruiter || "N/A"}</span></h6>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bor_line"></div>

                    <div className="row">
                        <div className="col-md-12 col-sm-12 Req-Reschedule-tBL">
                            <h3 className="mt-3 mb-4"><b>Next Available Interviews</b></h3>
                            <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">

                                <ReactTable
                                    columns={[
                                        { Header: "Date:",   className: "_align_c__", accessor: "start_datetime", Cell: props => <span>{moment(props.value).format('DD/MM/YYYY')}</span>},
                                        { Header: "Location:",   className: "_align_c__", accessor: "training_location", Cell: props => <span>{props.value}</span> },
                                        { Header: "Staff:",   className: "_align_c__", accessor: "primary_recruiter",  Cell: props => <span>{props.value}</span>},
                                        { Header: "Accepted:",   className: "_align_c__", accessor: "accepted",  Cell: props => <span>{props.value}</span> },
                                        { Header: "Pending:",   className: "_align_c__", accessor: "pending",  Cell: props => <span>{props.value}</span> },
                                        { Header: "Available:",   className: "_align_c__", accessor: "available",  Cell: props => <span>{props.value}</span> },
                                        { Header: "Select Interview",  className: "_align_c__",
                                            accessor: "selected",
                                            Cell: props => (
                                                <div>
                                                <button className={"selectTsk_btn cmn-btn1 " + ((props.value) ? 'active': '')} 
                                                onClick={() => this.selectInterview(props.index)} > Select
                                                </button>
                                                </div>
                                            )
                                        }
                                    ]}
                                    defaultPageSize={3}
                                    minRows={3}
                                    data={this.state.available_interview}
                                    pageSize={this.state.available_interview.length}
                                    showPagination={false}
                                    className=""
                                />

                            </div>
                            <div className="text-right">
                                <small className="extra_sm_fnt">*Clicking save will automatically send an email invite to the applicant</small>
                            </div>
                        </div>
                        


                    </div>
                    <div className="bor_line mt-5"></div>
                    <div className="row  pb-5 pt-3">
                            <div className="col-sm-12 text-right">
                                {this.state.available_interview.length > 0?<button disabled={this.state.loading} type="submit" className="btn cmn-btn1 create_quesBtn" onClick={this.saveChanges}>Save Changes</button>:""}
                            </div>
                        </div>

                </div>

            </div>
        )
    }

}

export default RescheduleGroupOrCabInterview;