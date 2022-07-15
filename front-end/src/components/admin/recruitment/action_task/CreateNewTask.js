import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { ROUTER_PATH, BASE_URL, PAGINATION_SHOW, DATA_CONSTANTS } from 'config.js';
import { recruitmentStatus, recruitmentActionType } from 'dropdown/recruitmentdropdown.js';
import { postData, checkItsNotLoggedIn, Aux, handleChangeChkboxInput, handleChangeSelectDatepicker, handleRemoveShareholder, handleDateChangeRaw, checkLoginWithReturnTrueFalse , getPermission} from 'service/common.js';
import ReactTable from "react-table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import jQuery from "jquery";
import { ToastContainer, toast } from 'react-toastify';
import Pagination from "service/Pagination.js";
import { ToastUndo } from 'service/ToastUndo.js';
import { getOptionsRecruitmentStaff, getOptionsApplicantList } from './CommonMethod.js';
import { getTaskStageDetails } from './../actions/RecruitmentAction.js';
import _ from 'lodash';
import { connect } from 'react-redux'



const WAIT_INTERVAL = DATA_CONSTANTS.FILTER_WAIT_INTERVAL;
const ENTER_KEY = DATA_CONSTANTS.FILTER_ENTER_KEY;

class CreateTask extends Component {

    static defaultProps = {
        // The selected application
        // This will be populated when application ID is in the URL and 
        // when you have clicked one of the 'Create Task' links in one of the application (not applicant) stages
        // @see ApplicantInfo.js as an example
        application: null, 
    }

    constructor(props) {
        super(props);
        checkItsNotLoggedIn(ROUTER_PATH);
        
        this.permission = (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? [] : JSON.parse(getPermission())):[];
        
        this.state = {
            applicant_list: [],
            assigned_user: [],
            loading: false,
            max_applicant: 10,
            presurb_primary: [],
            task_stage: '',
            task_stage_option:[],
            form_option: [],
        }

        this.state_key = '';
    }

    componentDidMount() {
        if(this.props.task_stage_option.length==0){
            this.props.getTaskStageDetails();
        }else{
            this.setTaskStageState(this.props);
        }
        console.log(this.state.task_stage);
    }

    componentWillReceiveProps(nextProps){
        if(this.state.task_stage_option.length==0 && nextProps.task_stage_option.length>0){
            this.setTaskStageState(nextProps);
        }
    }
    setTaskStageState(nextProps){
        if(this.state.task_stage_option.length==0 && nextProps.task_stage_option.length>0){
            let state = {};
            if(!nextProps.task_its_recruiter_admin){
                let  recruiter_data = nextProps.task_recruiter_data;
                      state['presurb_primary'] = recruiter_data
                      state['assigned_user'] = recruiter_data
            }
            state['task_stage_option'] = nextProps.task_stage_option;
            state['recruitment_location'] = nextProps.recruitment_location;
            this.setState(state);
        }
    }


    setRecruiterById = (ids) =>{
        postData('recruitment/RecruitmentTaskAction/get_selected_recruiter', {selected_recruiter:ids}).then((result) => {
            if (result.status) {
                var state = {};
                 var recruiter_data = result.recruiter_data;
                    state['assigned_user'] = recruiter_data
                 this.setState(state);   
            }
      });
    }

    getFormOption = (form_type) =>{ 
        postData('recruitment/RecruitmentTaskAction/get_create_task_form_option', {form_type:form_type}).then((result) => {
            if (result.status) {
                 this.setState({form_option: result.data});   
            }
      });
    }

    setStageAndApplicatById = (stage,appId) =>{
        this.setState({task_stage:stage},()=>{
            (this.state.task_stage == 9)?this.setState({max_applicant:1}):this.setState({max_applicant:10})

            let temp_form_type = (this.state.task_stage == 6)?'cab_day':((this.state.task_stage == 3)?'group_interview':'');
            if(temp_form_type!='')
                this.getFormOption(temp_form_type);

            let application_id = null
            if (this.props.application) {
                application_id = this.props.application.id
            }

            getOptionsApplicantList(appId,this.state.applicant_list,this.state.task_stage,'id', application_id).then((result)=>{
                if (result.length>0) {
                    this.addApplicantInList(result[0]);
                }
            });
        })
    }


    handleSaveAction = (e) => {
        e.preventDefault();
        var validator = jQuery("#task_form").validate();
       
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
                let form_id = (this.state_key === 'group_interview' || this.state_key === 'cab_day')? this.state.form_id : '';
                this.setState({ loading: true, form_id: form_id }, () => {
                    postData('recruitment/RecruitmentTaskAction/create_task', this.state).then((result) => {
                        if (result.status) {
                            this.setState({ loading: false });
                            toast.dismiss();
                            toast.success(<ToastUndo message={'Task created successfully.'} showType={'s'} />, {
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
            validator.focusInvalid();
        }
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

            // // add application ID to `this.state.applicant_list` if application is in URL
            // if (this.props.application) {
            //     if (parseInt(e.applicant_id) === parseInt(this.props.application.applicant_id)) {
            //         e.application_id = this.props.application.id
            //     } else {
            //         console.warn(`WARNING: The application ID ${this.props.application.id} does not belong to applicant with ID ${e.applicant_id}`)
            //     }
            // }

            applicant_list = applicant_list.concat([e]);
            state['applicant_list'] = applicant_list;

            this.setState(state);
        }
    }

    addAdPrimaryRecruiter = (e, index) => {
        var assigned_user = this.state.assigned_user;
        var state = {};
        
        if(this.permission.access_recruitment_admin){
            if(assigned_user[index]['primary_recruiter'] == "1"){
                assigned_user[index]['primary_recruiter'] = "2";
            }else{
                assigned_user.map((val, idx) => {
                    assigned_user[idx]['primary_recruiter'] = "2";
                });
                assigned_user[index]['primary_recruiter'] = "1";
            }

            state['assigned_user'] = assigned_user;
            this.setState(state);
        }
    }
    
    onlyNumberAllow = (obj, e) => {
       const re = /^[0-9\b]+$/;
        // if value is not blank, then test the regex
        if ((e.target.value === '' || re.test(e.target.value)) && e.target.value <= 10) {
           var state = {};
           state[e.target.name] = e.target.value
           obj.setState(state)
        }
    }

    updateStageAndGetFormData=(e)=>{
        console.log('updateStageAndGetFormData',e.value)
        this.setState({form_option:[],form_id:''},()=>{
            this.setState({ task_stage: e.value, applicant_list : []},()=>{
                (this.state.task_stage == 9)?this.setState({max_applicant:1}):this.setState({max_applicant:10})
            })
            if(e.stage_key == 'group_interview' || e.stage_key == 'cab_day')
            this.getFormOption(e.stage_key)  
        })         
    }
    
    render() {
        console.log('render',this.state.applicant_list)
        if(this.state.task_stage_option.length > 0 && this.state.task_stage){
            var index = this.state.task_stage_option.findIndex(x => x.value == this.state.task_stage);
            
            this.state_key = this.state.task_stage_option[index]["stage_key"];
        }

        
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
                Header: () =>
                <div>
                    <div className="ellipsis_line__">Tasks</div>
                </div>,
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                Cell: (props) => !this.props.application && (
                    <span>
                        <span className="short_buttons_01" onClick={(e) => handleRemoveShareholder(this, e, props.index, 'applicant_list')}>
                            Remove
                        </span>
                    </span>
                )
            }
        ]
  
        return (
            <div className={this.props.showModal ? 'customModal show' : 'customModal'}>
                <div className="cstomDialog widBig">
                    <h3 className="cstmModal_hdng1--">
                        Create New Task
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModal(false)}></span>
                    </h3>
                    <form id="task_form" method="post" autoComplete="off">
                        <div className="row ">
                            <div className="col-md-6">
                                <div className="csform-group">
                                    <label className="mb-4 fs_16">Task Name:</label>
                                    <span className="required">
                                         <input type="text" className="csForm_control clr2" onChange={(e) => handleChangeChkboxInput(this, e)} name="task_name" value={this.state.task_name} data-rule-required="true" data-rule-maxlength="100" data-msg-maxlength="Task name can not be more than 100 characters."/>
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-3 pl-5">
                                <div className="csform-group ">
                                    <label className="mb-4 fs_16">Stage:</label>
                                    <span className="required">
                                    <div className="cmn_select_dv">
                                        <Select name="action_type" className="custom_select default_validation "
                                            searchable={false} clearable={false}
                                            placeholder="Stage"
                                            options={this.state.task_stage_option}
                                            onChange={(e) => this.updateStageAndGetFormData(e)}
                                            value={this.state.task_stage}
                                            inputRenderer={() => <input type="text"  className="define_input" name={"task_stage"} required={true} value={this.state.task_stage} />}
                                        />
                                    </div>
                                      </span>
                                </div>
                            </div>
                            {(this.state_key === 'group_interview' || this.state_key === 'cab_day')? 
                            <div className="col-md-3 pl-5">
                                <div className="csform-group ">
                                    <label className="mb-4 fs_16">Select the form:</label>
                                    <span className="required">
                                    <div className="cmn_select_dv">
                                        <Select name="action_type" 
                                            simpleValue={true}
                                            className="custom_select default_validation "
                                            searchable={false} clearable={false}
                                            placeholder=""
                                            options={this.state.form_option}
                                            onChange={(e) => this.setState({ form_id: e})}
                                            value={this.state.form_id}
                                            inputRenderer={() => <input type="text"  className="define_input" name={"form_id"} required={true} value={this.state.form_id} />}
                                        />
                                    </div>
                                      </span>
                                </div>
                            </div>: ''}
                        </div>

                        <div className="row ">

                            <div className="col-lg-2 col-md-3 ">
                                <div className="csform-group">
                                    <label className="mb-4 ">Date:</label>
                                    <span className="required">
                                    <DatePicker
                                        dateFormat="dd-MM-yyyy"
                                        required={true}
                                        data-placement={'bottom'}
                                        name="PostDate"
                                        onChange={(date) => this.setState({ task_date: date })}
                                        selected={this.state.task_date || ''}
                                        className="csForm_control text-center clr2"
                                        placeholderText="DD/MM/YYYY"
                                        minDate={moment()}
                                        onChangeRaw={handleDateChangeRaw}
                                        autoComplete={'off'}
                                    />
                                    </span>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-5 pl-5">
                                <div className="csform-group">
                                    <label className="mb-4 ">Time/Duration:</label>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <small className="smallwid_50"><strong>From:</strong></small>
                                                <span className="required">
                                                <DatePicker
                                                    selected={this.state.start_time || ''}
                                                    onChange={(e) => handleChangeSelectDatepicker(this, e, 'start_time')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    dateFormat="h:mm A"
                                                    timeCaption="Time"
                                                    required={true}
                                                    name={'from_time'}
                                                    minTime={moment().hours(0).minutes(0)}
                                                    maxTime={(this.state.end_time) ? moment(this.state.end_time) : moment().hours(23).minutes(59)}
                                                    onChangeRaw={handleDateChangeRaw}
                                                    autoComplete={'off'}
                                                    className="csForm_control clr2"
                                                />
                                                </span>
                                            </div>

                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <small className="smallwid_50"><strong>To:</strong></small>
                                                <span className="required">
                                                <DatePicker
                                                    selected={this.state.end_time || ''}
                                                    onChange={(e) => handleChangeSelectDatepicker(this, e, 'end_time')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    dateFormat="h:mm A"
                                                    timeCaption="Time"
                                                    required={true}
                                                    name={'to_time'}
                                                    minTime={(moment(this.state.start_time)) ? moment(this.state.start_time) : moment().hours(0).minutes(0)}
                                                    maxTime={moment().hours(23).minutes(59)}
                                                    onChangeRaw={handleDateChangeRaw}
                                                    className="csForm_control clr2"
                                                    autoComplete={'off'}
                                                />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="col-lg-4 col-md-3 ">
                                <div className="csform-group">
                                    <label className="mb-4">Location:</label>
                                    <span className="required">
                                    <div className="cmn_select_dv">
                                        <Select name="action_location" className="custom_select default_validation"
                                            simpleValue={true}
                                            searchable={false} clearable={false}
                                            placeholder="Select Location"
                                            options={this.props.recruitment_location}
                                            onChange={(e) => this.setState({ training_location: e})}
                                            value={this.state.training_location}
                                            inputRenderer={() => <input type="text" className="define_input" name={"action_location"} value={this.state.training_location} required={'true'} />}
                                            
                                        />
                                     
                                    </div>
                                    </span>
                                </div>
                            </div>
                            
                            <div className="col-lg-2 col-md-2 ">
                                <div className="csform-group">
                                    <label className="mb-4">Max Applicants:</label>
                                    <span className="required">
                                        <input type="text" className="csForm_control clr2" disabled={this.state.applicant_list.length > 0 || this.state.task_stage == 9? true: false} name="max_applicant" data-rule-required="true" data-rule-number="true" onChange={(e) => this.onlyNumberAllow(this, e)}  value={this.state.max_applicant} />
                                       </span>
                                </div>
                            </div>

                        </div>

                        <div className="bor_line mt-5"></div>

                        <div className="row mt-5">
                            <div className="col-lg-6 col-md-6 pr-5">

                                <div className="csform-group">
                                    <label className="mb-3">Assigned to Staff/s:<span className="asgnd_num clr_grey">(12)</span></label>
                                    <span className="required modify_select">
                                        <div className="search_icons_right modify_select default_validation slct_clr2">
                                            <Select.Async
                                                name='assigned_user'
                                                loadOptions={(e) => getOptionsRecruitmentStaff(e, this.state.assigned_user)}
                                                clearable={false}
                                                placeholder='Search Staff'
                                                cache={false}
                                               // value={this.state.assigned_user}
                                                value={''}
                                                onChange={(e) => this.AddRecruiterInList(e)}
                                                disabled={this.state.assigned_user.length > 12? true: false}
                                            />
                                        </div>
                                    </span>
                                </div>

                                <div className="rec_assignees__ cmnDivScrollBar__ prList_sclBar mt-5">
                                    {this.state.assigned_user.map((val, index) => (
                                        <div className="rec_assi active" key={index + 1}>
                                            <div className="nme_assi">{val.label}{val.non_removal_primary == '1'? '': <span className="icon icon-close1-ie" onClick={(e) => handleRemoveShareholder(this, e, index, 'assigned_user')}></span>}</div>
                                            <label className="customChecks mt-1">
                                                <input type="checkbox" name="primary_recruiter[]" checked={val.primary_recruiter == '1' ? true: false} onChange={(e) => this.addAdPrimaryRecruiter(e, index)} data-rule-required="true" data-msg-required="Please select primary staff"  disabled={val.non_removal_primary == '1'? true: false} />
                                                <div className="chkLabs fnt_sm">Assign as primary Staff</div>
                                                <label for="primary_recruiter[]" className="error"></label>
                                            </label>
                                        </div>    
                                    ))}
                                </div>
                                {/* rec_assignees__ ends */}

                                {this.state.assigned_user.length > 0? <div className="csform-group text-right">
                                    <span className="btn cmn-btn1 clr_all" onClick={() => this.setState({assigned_user: this.state.presurb_primary})}>Clear All </span>
                                </div>: ''}

                            </div>
                            <div className="col-md-6 bor-l pl-5">
                                <div className="csform-group">
                                    <label className="mb-3">Relevant Task Notes:</label>
                                    <span /* className="required" */>
                                    <textarea className="csForm_control notesArea clr2" name="relevant_task_note" value={this.state.relevant_task_note} onChange={(e) => handleChangeChkboxInput(this, e, 'relevant_task_note')} placeholder="[Any relevant task notes here]"  data-rule-maxlength="500" data-msg-maxlength="Relevant task notes can not be more than 500 characters"></textarea>
                                    </span>
                                </div>

                                {/*<div className="csform-group text-right">
                                    <button className="btn cmn-btn1">Save Note</button>
                                </div>*/}
                            </div>

                            <div className="col-md-12">
                                <div className="bor_line mt-5"></div>
                            </div>
                        </div>
                        {/* row ends */}
                        
                        <div className="row">
                            <div className="col-md-12">
                                <div className="csform-group">
                                <h3 className="mt-3 avl_ints mb-4"><b>Attach Applicant's</b> (Max {this.state.max_applicant})</h3>
                                    
                                <div className="row">
                                    <div className="col-md-10 col-sm-10">
                                        <div className="csform-group">
                                            <div className="search_icons_right modify_select default_validation slct_clr2">
                                                <Select.Async
                                                    loadOptions={(e) => getOptionsApplicantList(e, this.state.applicant_list, this.state.task_stage)}
                                                    clearable={false}
                                                    placeholder='Search for Applicants'
                                                    cache={false}
                                                    // value={this.state.applicant_list}
                                                    value={''}
                                                    onChange={(e) => this.addApplicantInList(e)}
                                                    disabled={((this.state.applicant_list.length >= this.state.max_applicant) || !this.state.task_stage)? true: false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                                
                                <div className="Req-Create-new-task-tBL mb-3">
                                    {/* <div className="data_table_cmn tableType2 createACtion_Table1"> */}
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL   line_space_tBL H-Set_tBL Remove-Margin-tBL Remove-Border-body-tBL ">
                                        <ReactTable
                                            PaginationComponent={Pagination}
                                            showPagination={false}
                                            columns={columns}
                                            data={this.state.applicant_list}
                                            pages={this.state.pages}
                                            defaultPageSize={10}
                                            className="-striped -highlight"
                                            noDataText="No Record Found"
                                            minRows={2}
                                            previousText={(<span className="icon icon-arrow-left privious"></span>)}
                                            nextText={(<span className="icon icon-arrow-right next"></span>)}
                                        />
                                    </div>
                                 </div>
                                    <div className="bor_line"></div>
                                </div>
                            </div>
                        </div>
                        {/* row ends */}
                       
                        <div className="row">
                            <div className="col-md-12">
                                <button className="btn cmn-btn1 creat_task_btn__" disabled={this.state.loading} onClick={(e) => this.handleSaveAction(e)} >Create Task</button>
                            </div>
                        </div>
                        {/* row ends */}
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
return {
    task_stage_option: state.RecruitmentReducer.task_stage_option,
    task_its_recruiter_admin: state.RecruitmentReducer.its_recruiter_admin,
    task_recruiter_data: state.RecruitmentReducer.recruiter_data,
    recruitment_location: state.RecruitmentReducer.recruitment_location
}
}

const mapDispatchtoProps = (dispatch) => {
    return {
        getTaskStageDetails: () => dispatch(getTaskStageDetails()),
    
    }
};


export default connect(mapStateToProps, mapDispatchtoProps,null,{withRef:true})(CreateTask)