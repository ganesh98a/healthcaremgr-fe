import React, { Component } from 'react';
import ReactTable from "react-table";
import Select from 'react-select-plus';
import { getOptionsRecruitmentStaff, getOptionsApplicantList } from './CommonMethod.js';
import { postData, checkItsNotLoggedIn, Aux, handleChangeChkboxInput, handleChangeSelectDatepicker, handleRemoveShareholder, handleDateChangeRaw, checkLoginWithReturnTrueFalse , getPermission, archiveALL, handleShareholderNameChange} from 'service/common.js';
import { taskStatusOption} from 'dropdown/recruitmentdropdown.js';
import moment from 'moment';
import Pagination from "service/Pagination.js";
import { ROUTER_PATH, BASE_URL, PAGINATION_SHOW, DATA_CONSTANTS } from 'config.js';
import jQuery from "jquery";
import {  toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import ReactPlaceholder from 'react-placeholder';
import { custNumberLine, customHeading, closeIcons } from 'service/CustomContentLoader.js';

class EditTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assigned_user: [],
            applicant_list: [],
            presurb_primary: []
        }
        
        this.permission = (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? [] : JSON.parse(getPermission())):[];
    };

    getTaskDetails = (taskId) => {
        this.setState({dataLoading: true});
        postData('recruitment/RecruitmentTaskAction/get_task_details', {taskId: taskId}).then((result) => {
              if (result.status) {
                   this.setState(result.data); 
                   this.setState({dataLoading: false});
              }
        });
    }
    
    componentDidMount = () => {
        this.getTaskDetails(this.props.taskId);
    }
    
    reSendMail = (e, applicant_id, index) => {
        e.preventDefault();
        archiveALL({taskId: this.props.taskId, applicant_id: applicant_id}, 'Are you sure you want to send a reminder mail to the applicant?', "recruitment/RecruitmentTaskAction/resend_task_mail_to_applicant").then((result) => {
            if(result.status){
                var state ={};
                var applicant_list = this.state.applicant_list;
                applicant_list[index]['email_sended'] = true;
                state['applicant_list'] = applicant_list;
                this.setState(state);
            }else{
                if(result.error){
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            }
        });
    }
    
    AddRecruiterInList = (e) => {
        if(e){
            var assigned_user = this.state.assigned_user;
            var state = {};
            e['assigned_user'] = false;
            assigned_user = assigned_user.concat([e]);
            state['assigned_user'] = assigned_user;
            this.setState(state);
        }
    }
    
    addApplicantInList = (e) => {
        if(e){
            var applicant_list = this.state.applicant_list;
            var state = {};

            applicant_list = applicant_list.concat([e]);
            state['applicant_list'] = applicant_list;
            this.setState(state);
        }
    }

    addAdPrimaryRecruiter = (e, index) => {
        var assigned_user = this.state.assigned_user;
        var state = {};
        
        if(this.permission.access_recruitment_admin){
            if(assigned_user[index]['primary_recruiter'] === '1'){
                assigned_user[index]['primary_recruiter'] = '2';
            }else{
                assigned_user.map((val, idx) => {
                    assigned_user[idx]['primary_recruiter'] = '2';
                });
                assigned_user[index]['primary_recruiter'] = '1';
            }

            state['assigned_user'] = assigned_user;
            this.setState(state);
        }
    }
    
    handleSaveAction = (e) => {
        e.preventDefault();

        if (jQuery("#task_form").valid()) {
            if (this.state.assigned_user.length == 0) {
                toast.dismiss();
             
                toast.error(<ToastUndo message={'Please assign at least one staff to continue.'} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }else if(this.state.applicant_list.length == 0){
                toast.dismiss();
                toast.error(<ToastUndo message={'Please select atleast one applicant to continue.'} showType={'e'} />, {
                                position: toast.POSITION.TOP_CENTER,
                                hideProgressBar: true
                            });
            }else {
                this.setState({ loading: true, taskId : this.props.taskId }, () => {
                    postData('recruitment/RecruitmentTaskAction/update_task', this.state).then((result) => {
                        if (result.status) {
                            toast.dismiss();
                            toast.success(<ToastUndo message={'Task updated successfully.'} showType={'s'} />, {
                                position: toast.POSITION.TOP_CENTER,
                                hideProgressBar: true
                            });
                            this.props.closeModal(true);
                        } else {
                            toast.dismiss();
                            toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                                position: toast.POSITION.TOP_CENTER,
                                hideProgressBar: true
                            });
                        }
                         this.setState({ loading: false });
                    });
                });
            }
        }
        else {
            this.validator.focusInvalid();
        }
    }
    
    removeApplicant = (e, id, value) => {
        e.preventDefault();
     
        var state = {};
        var List = this.state.applicant_list;
        
        var index = List.findIndex(x => x.id == id);
        List[index]['removed'] = value
        state['applicant_list'] = List;

        this.setState(state);
    }

    render() {
        var applicant_main_list = this.state.applicant_list.filter((s, sidx) => s.removed !== true);
        var x = applicant_main_list.filter((s, sidx) => s.status != 2);
        var applicant_list_valid_length = x.length
        
        const columns = [
            {
                filterable: false,
                accessor: "applicant_id",
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Applicant ID</div>
                    </div>,
                Cell: props => <span>{props.value}</span>
            },
            {
                filterable: false,
                accessor: "label",
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Name</div>
                    </div>,
                Cell: props => <span>{props.value}</span>
            },
            {
                filterable: false,
                accessor: "email",
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Email</div>
                    </div>,
                Cell: props => <span>{props.value}</span>
            },
            {
                filterable: false,
                accessor: "phone",
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Phone</div>
                    </div>,
                Cell: props => <span>{props.value}</span>
            },
            { 
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                Header: 'Status ', accessor: 'status', filterable: false, Cell: (props) => (this.state.task_stage == 3 || this.state.task_stage == 6)? <span>
                    {props.value == 0 ? <span className="button">Pending </span>: props.value == 1? <span>Accepted</span>: props.value == 2? <span>Declined</span>: ''}
                    </span>: ''},
            {
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                minWidth:150,
                Cell: (props) => <span>
                {(this.state.task_stage == 3 || this.state.task_stage == 6) && props.original.status? 
                <button onClick={(e) => this.reSendMail(e,props.original.applicant_id, props.index)} disabled={(props.value == 0 || props.original.email_sended) && this.state.edit_mode? false: true}  className="btn Btn_01 remove_color resend_color mr-2"><span>Re-Send</span> 
                {props.original.email_loading ? <i className="ie ie-loading my_Spin"></i>: ''}
                {props.original.email_sended ? <i className="icon icon-approved2-ie"></i>: ''}</button>: ''}
                
                <button disabled={(this.state.edit_mode)? false: true}  className="btn Btn_01 remove_color" 
                onClick={(e) => {props.original.id? this.removeApplicant(e, props.original.id, true): handleRemoveShareholder(this, e, props.index, 'applicant_list')}}>Remove</button>
                 </span>,
                Header: 'Tasks', accessor: 'status'
            }
        ]

        return (
            <div className={'customModal ' + (this.props.showModal ? ' show' : ' ')}>
                <div className="cstomDialog widBig">
                <form method="post" id="task_form">
                    <h3 className="cstmModal_hdng1--">
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(20, 'left')} ready={!this.state.dataLoading}>
                        {!this.state.edit_mode? 'View': 'Edit'} Task  
                        
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModal(false)}></span>
                        </ReactPlaceholder>
                       
                    </h3>
                    

                    <div className="row">
                        <div className="col-md-12 col-sm-12">
                            <div className="row">
                                <div className="col-lg-2 col-md-2 col-sm-4">
                                    <div className="csform-group">
                                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                            <label className="">Task Name:</label>
                                            <p className="mt-3 clr_grey">{this.state.task_name || "N/A"}</p>
                                         </ReactPlaceholder>
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-2 col-sm-4">
                                    <div className="csform-group">
                                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                        <label className="">Stage:</label>
                                        <p className="mt-3 clr_grey">{this.state.stage || "N/A"}</p>
                                        </ReactPlaceholder>
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-2 col-sm-4">
                                    <div className="csform-group">
                                    <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                        <label className="">Date:</label>
                                        <p className="mt-3 clr_grey">{moment(this.state.start_datetime).format('DD/MM/YYYY')}</p>
                                        </ReactPlaceholder>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-3 col-sm-4">
                                    <div className="csform-group">
                                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                        <label className="">Time/Duration:</label>
                                        <div className="row">
                                            <div className="col-md-6"> <p className="mt-3 clr_grey"><strong>From:&nbsp;</strong>{moment(this.state.start_datetime).format('LT')}</p></div>
                                            <div className="col-md-6"> <p className="mt-3 clr_grey"><strong>To:&nbsp;</strong>{moment(this.state.end_datetime).format('LT')}</p></div>
                                        </div>
                                        </ReactPlaceholder>

                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-3 col-sm-4">
                                    <div className="csform-group">
                                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                        <label className="">Location:</label>
                                        <p className="mt-3 clr_grey">{this.state.training_location? this.state.training_location : 'N/A'}
                                        </p>
                                         </ReactPlaceholder>
                                    </div>
                                </div>

                                {/* <div className="col-lg-3 col-md-3 col-sm-4">
                                    <div className="csform-group">
                                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                        <label className="">Form:</label>
                                        <p className="mt-3 clr_grey">{this.state.form_name || 'N/A'}
                                        </p>
                                         </ReactPlaceholder>
                                    </div>
                                </div> */}
                            </div>

                        </div>
                    </div>
                   
                    <div className="bor_line"></div>


                    <div className="row">
                        <div className="col-lg-6 col-md-6 pr-5 br-1">
                                <div className="csform-group">
                                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                    <label className="mb-3">Assigned To Staff/s:<span className="asgnd_num clr_grey">(12)</span></label>
                                    <span className="requireds modify_select">
                                        <div className="search_icons_right modify_select default_validation slct_clr2">
                                       
                                            <Select.Async
                                                name='assigned_user'
                                                loadOptions={(e) => getOptionsRecruitmentStaff(e, this.state.assigned_user)}
                                                clearable={false}
                                                cache={false}
                                                //value={this.state.assigned_user}
                                                value={this.state.assigned_user.length>0? '':''}
                                                onChange={(e) => this.AddRecruiterInList(e)}
                                                disabled={this.state.assigned_user.length > 12 || !this.state.edit_mode? true: false}
                                                placeholder="Search Staff User"
                                                
                                            />
                                           
                                        </div>
                                    </span>
                                     </ReactPlaceholder>
                                </div>

                                <div className="rec_assignees__ cmnDivScrollBar__ prList_sclBar mt-5">
                                    {this.state.assigned_user.map((val, index) => (
                                        <div className="rec_assi active" key={index + 1}>
                                            <div className="nme_assi">{val.label}{val.non_removal_primary == true? '': <button disabled={this.state.edit_mode? false: true } className="icon icon-close1-ie" onClick={(e) => handleRemoveShareholder(this, e, index, 'assigned_user')}></button>}</div>
                                            <label className="customChecks mt-1">
                                                <input type="checkbox" name="primary_recruiter[]" checked={val.primary_recruiter == '1'? true: false} onChange={(e) => this.addAdPrimaryRecruiter(e, index)} data-rule-required="true" data-msg-required="Please select primary staff user"  disabled={val.non_removal_primary == true || !this.state.edit_mode? true: false} />
                                                <div className="chkLabs fnt_sm">Assign as primary Staff</div>
                                                <label htmlFor="primary_recruiter[]" className="error"></label>
                                            </label>
                                        </div>    
                                    ))}
                                </div>
                                

                                {this.state.assigned_user.length > 0? <div className="csform-group text-right">
                                    <button disabled={this.state.edit_mode? false: true} className="btn cmn-btn1 clr_all" onClick={() => this.setState({assigned_user: this.state.presurb_primary})}>Clear All </button>
                                </div>: ''}
                            </div>

                        <div className="col-md-6 col-sm-6 pl-5">

                            <div className="csform-group ">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(70, 'left')} ready={!this.state.dataLoading}>
                                <label className='bg_labs'>Task Status:</label>
                                <div className="cmn_select_dv wid-200">
                                    <Select name="view_by_status"
                                        required={true} 
                                        simpleValue={true}
                                        searchable={false} 
                                        clearable={false}
                                        placeholder="Select"
                                        options={taskStatusOption()}
                                        onChange={(e) => this.setState({ status: e })}
                                        value={this.state.status}
                                        disabled={true}
                                    />
                                </div>
                                </ReactPlaceholder>
                            </div>


                            <div className="csform-group ">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!this.state.dataLoading}>
                                <label className='bg_labs'>Relevant Task Notes:</label>
                                <p className="clr_grey wid-80P">{this.state.relevant_task_note}</p>
                                </ReactPlaceholder>
                            </div>
                        </div>
                    </div>
                  


                    <div className="row mt-5">
                        <div className="col-md-12 col-sm-12">
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(4)} ready={!this.state.dataLoading}>
                            <h3 className="mt-3 avl_ints mb-4"><b>Attach Applicant's</b> (Max {this.state.max_applicant})</h3>
                            <div className="row">
                                <div className="col-md-10 col-sm-10">
                                    <div className="csform-group">
                                        <div className="search_icons_right modify_select default_validation slct_clr2">
                                            <Select.Async
                                                    loadOptions={(e) => getOptionsApplicantList(e, applicant_main_list, this.state.task_stage)}
                                                    clearable={false}
                                                    placeholder='Search for Applicants'
                                                    cache={false}
                                                    //value={this.state.applicant_list}
                                                    value={applicant_list_valid_length > 0? '':''}
                                                    onChange={(e) => this.addApplicantInList(e)}
                                                    disabled={((applicant_list_valid_length >= this.state.max_applicant) || !this.state.edit_mode)? true: false}
                                                />
                                        </div>
                                    </div>
                                </div>
                            </div>


<div className="Req-Create-new-task-tBL mb-3">
                            <div className="listing_table PL_site th_txt_center__ odd_even_tBL   line_space_tBL H-Set_tBL Remove-Margin-tBL Remove-Border-body-tBL ">
                                        <ReactTable
                                            PaginationComponent={Pagination}
                                            showPagination={applicant_main_list.length >= 10 ? true : false}
                                            columns={columns}
                                            data={applicant_main_list}
                                            pages={this.state.pages}
                                            defaultPageSize={10}
                                            className="-striped -highlight"
                                            noDataText="No Record Found"
                                            minRows={2}
                                            previousText={<span className="icon icon-arrow-left privious"></span>}
                                            nextText={<span className="icon icon-arrow-right next"></span>}
                                        />

                            </div>
                            </div>
                            <div className="text-right">
                                <small className="extra_sm_fnt">*Clicking save will automatically send an email invite to the applicant</small>
                            </div>
                            </ReactPlaceholder>
                        </div>

                    </div>
                    <div className="bor_line mt-5"></div>
                    <div className="row  pb-5 pt-3">
                        <div className="col-sm-12 text-right">
                            {this.state.edit_mode ? <button type="submit" className="btn cmn-btn1 create_quesBtn" disabled={this.state.loading} onClick={this.handleSaveAction} >Save Changes</button>: ''}
                        </div>
                    </div>
                    </form>
                </div>

            </div>
        )
    }

}

export default EditTask;