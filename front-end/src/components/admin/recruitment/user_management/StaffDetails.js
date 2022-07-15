import React, { Component } from 'react';
import Select from 'react-select-plus';
import BigCalendar from 'react-big-calendar';
import { CustomEvent } from 'service/CustomEvent.js';
import { WeekendDayPropGetter } from 'service/WeekendDayPropGetter.js';
import { MyCustomHeader } from 'service/MyCustomHeader.js';
import moment from 'moment';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import { Doughnut } from 'react-chartjs-2';
import ReactTable from "react-table";
import { Link, Redirect } from 'react-router-dom';
import { ROUTER_PATH, PAGINATION_SHOW } from 'config.js';
import { checkItsNotLoggedIn, postData, calendarColorCode, archiveALL, reFreashReactTable } from 'service/common.js';
import { ToastUndo } from 'service/ToastUndo.js'
import { ToastContainer, toast } from 'react-toastify';
import CreateNewTask from '../action_task/CreateNewTask.js';
import EditTask from '../action_task/EditTask';
import _ from 'lodash';
import { CounterShowOnBox } from 'service/CounterShowOnBox.js';
import { graphViewType, taskProirtyRecruitment } from 'service/custom_value_data.js';
import RecruiterDisable from 'components/admin/recruitment/user_management/RecruiterDisable';
import { toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux';

moment.locale('au', {
    week: {
        dow: 1,
        doy: 1,
    },
});
const localizer = BigCalendar.momentLocalizer(moment)


class StaffDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            apliNumber: 15,
            aplictNumArr: [],
            phones: [],
            emails: [],
            calanderTaskList: [],
            start_task_listing: [],
            staffId: 0,
            EditNewTaskModal: false,
            editTaskId: 0,
            applicant_count_type: 'week',
            applicant_successful_count_type: 'week',
            applicant_successful_count_data: { successfull: 0 },
            applicant_count_data: {
                labels: ['Successful', 'Processing', 'Rejected'],
                datasets: [{
                    data: ['0', '0', '0'],
                    backgroundColor: ['#2082ac', '#39a4d1', '#63bae9'],

                }],

            },
            tasksurl: false,
            showDisModal: false,
            actionType: 'other',
            graphType: graphViewType

        }

        this.reactTable = React.createRef();
        this.refTask = React.createRef();
    }

    CreateTaskCloseModal = (status) => {
        if (status) {
            this.getStaffTaskListing();
            this.navigateCalanderMonth(moment());
        }
        this.setState({ CreateTaskShowModal: false })
    }

    getStaffDetails = () => {
        var staffId = this.props.props.match.params.id;
        postData('recruitment/RecruitmentUserManagement/get_staff_details', { adminId: staffId }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            }
        });
    }

    getStaffTaskListing = () => {
        var staffId = this.props.props.match.params.id;
        postData('recruitment/RecruitmentUserManagement/get_staff_task_ongoing_list', { adminId: staffId }).then((result) => {
            if (result.status) {
                this.setState({ ...this.state, start_task_listing: result.data });
            }
        });
    }
    componentDidMount() {
        let str = this.state.apliNumber.toString();
        let arr = str.split("");
        this.setState({
            aplictNumArr: arr,
            staffId: this.props.props.match.params.id
        });

        /*  this.navigateCalanderMonth(moment());
         this.getStaffDetails(); */
        this.refreshPageData();
    }
    refreshPageData() {
        this.navigateCalanderMonth(moment());
        this.getStaffDetails();
    }

    departmentAllotedTo = (value) => {
        var requestData = { staffId: this.state.id, preffered_area: this.state.preffered_area, recruiter_area: value };

        if (value.length > 0) {
            this.setState({ recruiter_area: value });
            postData('recruitment/RecruitmentUserManagement/update_alloted_department', requestData).then((result) => {
            });
        } else {
            toast.error(<ToastUndo message={'Keep at least one Service area'} showType={'e'} />, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }
    }

    navigateCalanderMonth = (date) => {
        postData('recruitment/RecruitmentUserManagement/get_staff_calander_task', { date: date, staffId: this.props.props.match.params.id }).then((result) => {
            if (result.status) {
                var tempAry = result.data;
                if (tempAry.length > 0) {

                    tempAry.map((value, idx) => {
                        tempAry[idx]['end'] = value.start_datetime
                        tempAry[idx]['start'] = value.start_datetime
                        tempAry[idx]['allDay'] = true
                        tempAry[idx]['title'] = ' '

                    })

                    this.setState({ calanderTaskList: tempAry });
                } else {
                    this.setState({ calanderTaskList: [] });
                }
            }
        });
    }

    completeTask = (taskId) => {
        archiveALL({ taskId: taskId }, 'Are you sure, you want to complete this task?', 'recruitment/RecruitmentTaskAction/complete_recruiterment_task').then((result) => {
            if (result.status) {
                this.refreshPageData();
            } else if (!result.status) {
                if (result.hasOwnProperty('error') || result.hasOwnProperty('msg')) {
                    let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg : ''));
                    toast.error(<ToastUndo message={msg} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    })
                }
            } else {
                toast.error(<ToastUndo message={'Something went wrong please try again.'} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                })
            }
        });
    }

    arhiveTask = (taskId) => {
        archiveALL({ taskId: taskId }, 'Are you sure, you want to archive this task?', 'recruitment/RecruitmentTaskAction/archive_recruiterment_task').then((result) => {
            if (result.status) {
                this.refreshPageData();
            } else if (!result.status) {
                if (result.hasOwnProperty('error') || result.hasOwnProperty('msg')) {
                    let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg : ''));
                    if(msg!=''){
                        toastMessageShow(msg,'e');
                    }
                }
            }
        });
    }

    editShowTask = (taskId) => {
        this.setState({ EditNewTaskModal: true, editTaskId: taskId })
    }

    getGraphResult = (actionType, graphType, mode) => {
        this.setState({ [actionType + '_type']: graphType }, () => {
            this.fetchGraphData(actionType, mode);
        })
    }

    fetchGraphData = (actionType, mode) => {
        let type = this.state[actionType + '_type'];
        postData('recruitment/RecruitmentUserManagement/get_staff_applicant_count', { staffId: this.state.staffId, type: type, mode: mode }).then((result) => {
            if (result.status) {
                this.setState({ [actionType + '_data']: result.data });
            }
        });
    }

    clickOnpriorityDat = (countVal, type, timeStamp) => {
        let task_stage = taskProirtyRecruitment;
        let checkType = _.toLower(type);
        checkType = task_stage.hasOwnProperty(checkType) ? checkType : 'high';
        this.setState({ tasksurl: true, actionType: task_stage[checkType].type });
    }

    openDisModal = () => {
        this.setState({ selected_disable_recruiter: { id: this.state.staffId, name: this.state.name, task_cnt: this.state.task_count } });
        this.setState({ showDisModal: true })
    }

    confirEnableStaff = () => {
        var requestData = { staffId: this.state.staffId };
        archiveALL(requestData, 'Are you sure you want to enable the recruiter account?', 'recruitment/RecruitmentUserManagement/enable_recruiter_staff').then((response) => {
            if (response.status) {
                this.refreshPageData();
            }
        });
    }

    closeDisModal = (response) => {
        if (response) {
            this.refreshPageData();
        }
        this.setState({ showDisModal: false });
    }

    render() {
        var columns = [
            {
                // Header: "HCMGR-ID:",
                accessor: "id",

                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">HCMGR-ID</div>
                    </div>
                ,
                className: '_align_c__',
              

                Cell: (props) => {
                    let hcmgrData = props.original.primary_recruiter.split('@__@@__@');
                    return (<div className={"text-center tskMbi_14 " +
                        (props.original.task_stage == 3 ? 'low_t' :
                            props.original.task_stage == 6 ? 'medium_t' : 'high_t')}
                    ><i className="icon icon-circle1-ie"></i>{hcmgrData[1]}</div>
                    )
                }
            },
            /* { Header: "Primary Recruiter Name:", accessor: "primary_recruiter",Cell: (props) => {
                let hcmgrData = props.original.primary_recruiter.split('@__@@__@');
                return (<React.Fragment>{hcmgrData[0]}</React.Fragment>
            )} }, */
            {
                // Header: "Task Name:", 
                accessor: "task_name",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Task Name</div>
                    </div>
                ,
                className: '_align_c__',
       
                
            },
            {
                Header: "Action",
                accessor: "task_name",
                width: 80,
                expander: true,
                Expander: (props) => {
                    return (<div className="reactTableActionTask">
                        <a onClick={() => this.editShowTask(props.original.id)}> <i className={"icon icon-view2-ie fs-15 " + (props.isExpanded ? "cmn_font_clr" : "")}></i></a>
                        {props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1 cmn_font_clr" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}

                    </div>);

                }
                ,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none",
                    // borderLeft: "1px solid"
                }

            }
            /* ,
            {
                
                Header: () => <strong></strong>,
                width: 55,
                headerStyle: { border: "0px solid #fff" },
                Expander: ({ isExpanded, ...rest }) =>
                    <div className="">
                        {isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1 cmn_font_clr"></i>
                            : <i className="icon icon-arrow-right icn_ar1 cmn_font_clr"></i>}

                    </div>,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                },
            } */
        ];

        /* const Applicantdata = {
            labels: ['Successful', 'Processing', 'Rejected'],
            datasets: [{
                data: ['116', '42', '28'],
                backgroundColor: ['#f76d42', '#ffa083', '#fdc2b0'],

            }],

        }; */

        if (this.state.tasksurl) {
            return (
                <Redirect to={ROUTER_PATH + 'admin/recruitment/action/task?rec=' + this.state.staffId + '&actiontype=' + this.state.actionType} />
            )
        }

        if (this.state.recruiter_status == 0) {
            return (
                <Redirect to={ROUTER_PATH + 'admin/recruitment/user_management'} />
            )

        }
        return (


            <React.Fragment>

                <div className="row mt-5">

                    <div className="col-lg-12 col-md-12 no-pad back_col_cmn-">
                        <Link to={ROUTER_PATH + 'admin/recruitment/user_management'}>
                            <span className="icon icon-back1-ie"></span>
                        </Link>
                    </div>

                    <div className="col-lg-12 col-md-12 col-sm-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>


                    <div className="col-lg-12 col-md-12 col-sm-12 mt-5">

                        <div className="row">
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6">
                                        <div>
                                            <h4><b>{this.state.name}</b></h4>
                                            <div className="fs-15 mt-3"><b>HCMGR-Id:</b> <span className="d-inBl">{this.state.id}</span></div>
                                        </div>
                                    </div>
                                    <div className="col-lg-8 col-md-6">
                                        <div>
                                            {this.state.phones.map((val, index) => (
                                                <div className="fs-15" key={index + 1}><b>Phone:</b> <span className="d-inBl">{val.name} ({val.primary_phone==1 ? 'Primary' : 'Secondary'})</span></div>
                                            ))}
                                            {this.state.emails.map((val, index) => (
                                                <div className={"fs-15 " + (index==0 ? 'mt-2' :'')} key={index + 1}><b>Email:</b> <span className="d-inBl">{val.name} ({val.primary_email==1 ? 'Primary' : 'Secondary'})</span></div>
                                            ))}


                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">

                                <div className="row">
                                    <div className="col-md-6 col-lg-4">
                                        <div className="">
                                            <label className=''>Allocated Service Area:</label>
                                            <div className="mg_slct1">
                                                <Select name="view_by_status"
                                                    multi={true}
                                                    required={true}
                                                    clearable={false}
                                                    searchable={false}
                                                    placeholder="Select Type"
                                                    options={this.state.retcruitment_area_option}
                                                    onChange={this.departmentAllotedTo}
                                                    value={this.state.recruiter_area}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-lg-5 col-lg-offset-1 pl-5">
                                        <div className="fs-15">
                                            <b>User Access Permissions:</b>
                                            <div className="">All Permissions</div>
                                        </div>
                                    </div>


                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="col-lg-12 col-md-12 bor_line mt-5 mb-5"></div>

                    <div className="col-lg-12 col-md-12 col-sm-12 ">
                        <div className="row pt-3 d-flex detail_row">
                            <div className="col-lg-5 col-md-6 col-sm-12 col-xs-12 no_pd_l st_l">
                                <div className="task_dets1_">

                                    <div className="d-flex align-items-center mb-3">
                                        <h4 className="flex-1 cmn_font_clr"><b>Task Detail</b></h4>
                                        <a className="btn hdng_btn cmn-btn1 icn_btn12 nTsk_bt" onClick={() => this.setState({ CreateTaskShowModal: true, pagetitile: 'Create New Task' }, () => {
                                            if (this.refTask.hasOwnProperty('current')) {
                                                this.refTask.current.wrappedInstance.setRecruiterById([this.state.staffId]);
                                            }
                                        })}>New Task <i className="icon icon-add-icons hdng_btIc"></i></a>
                                    </div>

                                    <div className="bor_line"></div>

                                    <div className="tsks_shw">
                                        <h5 className=" mb-3"><b>Task Stage:</b></h5>
                                        <ul className="Staff_task_div1">
                                            {Object.keys(taskProirtyRecruitment).map((valD, index) => {
                                                return (<li className={taskProirtyRecruitment[valD].className} key={index}><i className="icon icon-circle1-ie"></i><span>{taskProirtyRecruitment[valD].name}</span></li>);
                                            })
                                            }

                                        </ul>

                                    </div>
                                    <div className="clearfix"></div>

                                    {/* <div className="tsk_table_mini data_table_cmn dataTab_accrdn_cmn mt-4 tbl_fnt_sm tble_txt_center "> */}
                                    <div className="Req-Staff-Details_tBL">
                                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                            <ReactTable
                                                popup
                                                columns={columns}
                                                data={this.state.start_task_listing}
                                                showPagination={false}
                                                defaultPageSize={10}
                                                minRows={2}
                                                ref={this.reactTable}
                                                collapseOnDataChange={false}
                                                className="-striped -highlight"

                                                SubComponent={(props) =>
                                                    <div className="tBL_Sub mni_tsk_subs">

                                                        <div className="pd-lr-50">
                                                            <div className="tb_dv_st">
                                                                <div className="fs-14 tr_dv">
                                                                    <div><b>Applicant Name:</b></div>
                                                                    <div>{props.original.applicant_names}</div>
                                                                </div>
                                                                <div className="fs-14 tr_dv">
                                                                    <div><b>Task Notes:</b></div>
                                                                    <div>{props.original.relevant_task_note}</div>
                                                                </div>
                                                                <div className="fs-14 tr_dv">
                                                                    <div><b>Date:</b></div>
                                                                    <div>{moment(props.original.start_datetime).format('DD/MM/YYYY')}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <ul className="subTasks_Action__">
                                                            <li><span onClick={() => this.editShowTask(props.original.id)} className="sbTsk_li">View </span></li>
                                                            <li><span onClick={() => this.completeTask(props.original.id)} className="sbTsk_li">Complete</span></li>
                                                            <li><span onClick={() => this.arhiveTask(props.original.id)} className="sbTsk_li">Archive</span></li>
                                                        </ul>
                                                    </div>
                                                }
                                            />
                                            <Link to={"/admin/recruitment/action/task?rec=" + this.state.staffId}><button className="btn cmn-btn1 btn-block vw_btn w-100 mt-2">View All Task</button></Link>
                                        </div>
                                    </div>

                                </div>
                                {/* task_dets1_ ends */}


                            </div>

                            <div className="col-lg-7 col-md-6 col-sm-12 col-xs-12  no_pd_r st_r">

                                <div className="row status_row-- ">


                                    <div className="col-lg-6 col-md-12 col-sm-6  col-xs-12 mb-2">
                                        <div className="status_box1">
                                            <div className="row">
                                                <h4 className="hdng">Applicant Status:</h4>
                                                <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                                                    <div className='mb-3'>
                                                        <Doughnut data={this.state.applicant_count_data} height={250} className="myDoughnut" legend={null} />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                                                    <ul className="status_det_list">
                                                        <li className="drk-color1">Successful = {this.state.applicant_count_data.datasets[0].data[0]}</li>
                                                        <li className="drk-color2">Processing = {this.state.applicant_count_data.datasets[0].data[1]}</li>
                                                        <li className="drk-color3">Rejected = {this.state.applicant_count_data.datasets[0].data[2]}</li>
                                                    </ul>
                                                    {/* <div className="duly_vw"> */}
                                                    <div className="viewBy_dc text-center">
                                                        <h5>View By:</h5>
                                                        <ul>
                                                            {this.state.graphType.length > 0 ? this.state.graphType.map((val, index) => {
                                                                return (<li key={index} className={val.name == this.state.applicant_count_type ? 'active' : ''} onClick={() => this.getGraphResult('applicant_count', val.name, 1)}>{_.capitalize(val.name)}</li>);
                                                            }) : <React.Fragment />}
                                                        </ul>
                                                    </div>
                                                    {/* </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 ">
                                        <div className="status_box1">
                                            <div className="row">
                                                <h4 className="hdng">Successful Applicants:</h4>

                                                <div className="col-lg-12 col-md-12 col-sm-12 colJ-1">
                                                    <CounterShowOnBox counterTitle={this.state.applicant_successful_count_data.successfull} classNameAdd="" mode="recruitment" />
                                                    <div className="duly_vw">
                                                        <div className="viewBy_dc text-center">
                                                            <h5>View By:</h5>
                                                            <ul>
                                                                {this.state.graphType.length > 0 ? this.state.graphType.map((val, index) => {
                                                                    return (<li key={index} className={val.name == this.state.applicant_successful_count_type ? 'active' : ''} onClick={() => this.getGraphResult('applicant_successful_count', val.name, 2)}>{_.capitalize(val.name)}</li>);
                                                                }) : <React.Fragment />}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="mb-4"><b>Current Task Schedules</b></div>
                                <div className="Schedule_calendar weekend_bg-color__">
                                    <BigCalendar
                                        localizer={localizer}
                                        defaultView='month'
                                        views={['month']}
                                        events={this.state.calanderTaskList}
                                        onNavigate={(event) => this.navigateCalanderMonth(event)}
                                        components={{
                                            event: (props) => CustomEvent({ ...props, headertype: 'staffDetails', clickOnpriorityDat: this.clickOnpriorityDat }),
                                            toolbar: CalendarToolbar,
                                            month: { dateHeader: (props) => MyCustomHeader({ ...props, headertype: 'staffDetails' }) }
                                        }}
                                        startAccessor="start"
                                        endAccessor="end"
                                        dayPropGetter={WeekendDayPropGetter}
                                    />

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-md-5 col-sm-6 mt-2">
                        <ul className="subTasks_Action__" style={{ textAlign: 'center' }}>
                            {this.state.recruiter_status == 1 ? <li onClick={() => this.openDisModal()} ><span className="sbTsk_li">Disable User</span></li> :
                                <li onClick={() => this.confirEnableStaff()} ><span className="sbTsk_li">Enable User</span></li>
                            }



                        </ul>
                    </div>
                </div>
                {this.state.showDisModal ? <RecruiterDisable showDisModal={this.state.showDisModal}  {...this.state.selected_disable_recruiter} closeDisModal={this.closeDisModal} /> : ''}
                {
                    (this.state.CreateTaskShowModal) ?
                        <CreateNewTask showModal={this.state.CreateTaskShowModal} closeModal={this.CreateTaskCloseModal} ref={this.refTask} /> : ''
                }
                {this.state.EditNewTaskModal ? <EditTask taskId={this.state.editTaskId} showModal={this.state.EditNewTaskModal} closeModal={(res) => { this.setState({ EditNewTaskModal: false }, () => { if (res == true) { this.refreshPageData(); } }) }} /> : ''}

            </React.Fragment>
        );
    }

}
const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(StaffDetails);

class CalendarToolbar extends Toolbar {
    render() {
        return (
            <div className="stf_calHdr d-flex align-items-center pt-2 pb-4">

                <i className="icon icon-arrow-left" onClick={() => this.navigate('PREV')}></i>
                <div className=""><b>{this.props.label}</b></div>
                <i className="icon icon-arrow-right" onClick={() => this.navigate('NEXT')}></i>

                {/* <div className="rbc-btn-group ">
                    <span className="" onClick={() => this.navigate('TODAY')} > Today</span>
                    <span className="icon icon-arrow-left" onClick={() => this.navigate('PREV')}></span>
                    <span className="icon icon-arrow-right" onClick={() => this.navigate('NEXT')}></span>
                </div>
                <div className="rbc-toolbar-label">{this.props.label}</div> */}
            </div>
        );
    }
}