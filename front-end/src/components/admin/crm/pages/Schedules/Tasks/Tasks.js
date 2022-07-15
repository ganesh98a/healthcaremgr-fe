import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { confirmAlert, createElementReconfirm } from 'react-confirm-alert';
import { checkItsNotLoggedIn, getPermission, postData, getQueryStringValue, getOptionsCrmParticipant, getOptionsCrmMembers, reFreashReactTable } from '../../../../../../service/common.js';
import jQuery from "jquery";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { BASE_URL, ROUTER_PATH } from '../../../../../../config';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import CrmPage from '../../../CrmPage';
import Pagination from "../../../../../../service/Pagination.js";
import { ToastUndo } from 'service/ToastUndo.js';
import { priorityTask } from '../../../../../../dropdown/CrmDropdown.js';
import { customProfile, customHeading, custNumberLine } from 'service/CustomContentLoader.js';
import ReactPlaceholder from 'react-placeholder';

import ViewTask from './ViewTask';
import EditTask from './EditTask';
import CreateTask from './CreateTask';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('crm/CrmTask/list_task', Request).then((result) => {
            let filteredData = result.data;

            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};


class Tasks extends Component {
    constructor(props, context) {
        super(props, context);
        this.child = React.createRef();
        this.handleSelect = this.handleSelect.bind(this);

        this.state = {
            key: 1, filterVal: '',
            filterStatusVal: '',
            showModal: false,
            taskList: [],
            loading: false,
            counter: 0,
            action: 2, task_id: '',
            permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),


        };

        this.reactTable = React.createRef();
    }

    openSortPriorityDetails = () => {
        let priority = typeof (this.props.props.history.location.state) != 'undefined' ? this.props.props.history.location.state.priority : [];
        let staffId = typeof (this.props.props.history.location.state) != 'undefined' ? this.props.props.history.location.state.staffId : '';
        let due_date = typeof (this.props.props.history.location.state) != 'undefined' ? this.props.props.history.location.state.due_date : '';
        var srch_ary = { staffId: staffId, filterVal: priority, due_date: due_date}
        this.setState({ filtered: srch_ary, loading: false }, () => reFreashReactTable(this, 'fetchData'));
    }

    openSortByDateDetails = () => {
        let due_date = typeof (this.props.props.history.location.state) != 'undefined' ? this.props.props.history.location.state.due_date : '';
        let status_type = typeof (this.props.props.history.location.state) != 'undefined' ? this.props.props.history.location.state.status_type : '';
        var srch_ary = { due_date: due_date, filterStatusVal:(status_type=="due")?"0":"1" }
        this.setState({ filtered: srch_ary, loading: false }, () => reFreashReactTable(this, 'fetchData'));
    }

    archiveCompleteAction = (taskId, type, val) => {
        let msg = '';
        if(val == 0){
          toast.error(<ToastUndo message={"Completed Task only able to archive"} showType={'s'} />, {
              position: toast.POSITION.TOP_CENTER,
              hideProgressBar: true
          });
        }else{

          if (type == 4) {
              var url = 'crm/CrmTask/complete_task';
              var tosteMessage = 'Task Completed Successfully';
              msg = <span>Are you sure you want to Complete this item? <br /> Once Completed, this action can not be undone.</span>;
          }
          else {
              url = 'crm/CrmTask/archive_task';
              tosteMessage = 'Task Archived Successfully';
              msg = <span>Are you sure you want to archive this item? <br /> Once archived, this action can not be undone.</span>;
          }

          return new Promise((resolve, reject) => {
              confirmAlert({
                  customUI: ({ onClose }) => {
                      return (
                          <div className='custom-ui'>
                              <div className="confi_header_div">
                                  <h3>Confirmation</h3>
                                  <span className="icon icon-cross-icons" onClick={() => {
                                      onClose();
                                      resolve({ status: false })
                                  }}></span>
                              </div>
                              <p>{
                                  msg}</p>
                              <div className="confi_but_div">
                                  <button className="Confirm_btn_Conf" onClick={
                                      () => {

                                          postData(url, { 'task_id': taskId }).then((result) => {
                                              if (result.status) {
                                                  toast.dismiss();
                                                  toast.success(<ToastUndo message={tosteMessage} showType={'s'} />, {

                                                      position: toast.POSITION.TOP_CENTER,
                                                      hideProgressBar: true
                                                  });

                                                  this.setState({ success: true })
                                                  reFreashReactTable(this, 'fetchData');
                                                  onClose();
                                              } else {
                                                  toast.dismiss();
                                                  toast.error(<ToastUndo message={result.error} showType={'e'} />, {

                                                      position: toast.POSITION.TOP_CENTER,
                                                      hideProgressBar: true
                                                  });
                                                  onClose();
                                              }
                                              this.setState({ loading: false })
                                          });

                                      }}>Confirm</button>
                                  <button className="Cancel_btn_Conf" onClick={
                                      () => {
                                          onClose();
                                          resolve({ status: false });
                                      }}> Cancel</button>
                              </div>
                          </div>
                      )
                  }
              })
          });
        }

    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            //console.log(res.rows);
            this.setState({
                taskLists: res.rows,
                pages: res.pages,
                loading: false
            }, () => {
                var taskId = this.props.props.match.params.id;

                if (taskId && this.state.taskLists) {
                    this.viewTask(taskId);
                }
            });
        });
    }



    handleSelect = (key) => {
        this.setState({ key });
    }

    showModal = () => {
        this.setState({ showModal: true })
    }

    editTask = (taskId) => {
        let singleTask = {};

        // this.state.taskLists.map(function (item, index) {

        //     if (item.task_id == taskId) {
        //         singleTask['assigned_staff_id'] = item.assigned_staff_id;
        //         singleTask['assigned_person'] = item.taskLists.assigned;
        //         singleTask['relevant_task_note'] = item.taskLists.relevant_task_note;
        //         singleTask['task_name'] = item.taskLists.taskname;
        //         singleTask['due_date'] = item.taskLists.duedate;
        //         singleTask['crm_participant_id'] = item.crm_participant_id;
        //         singleTask['crm_participant_name'] = item.participant_name;
        //         singleTask['task_id'] = taskId;
        //         singleTask['taskPriority'] = item.taskLists.priority;
        //         singleTask['stage_name'] = item.stage_name;

        //     }
        // });

        this.setState({ showModal1: true, editTaskId: taskId, viewEditTask: singleTask });
    }

    viewTask = (viewTaskId) => {
        this.setState({ viewTaskModel: true, viewTaskId: viewTaskId });
    }

    closeModal = (param) => {
        let singleTask = {};
        singleTask['assigned_person'] = '';
        singleTask['relevant_task_note'] = '';
        singleTask['task_name'] = '';
        singleTask['due_date'] = moment();
        singleTask['crm_participant_id'] = '';
        singleTask['crm_participant_name'] = '';
        singleTask['task_id'] = '';
        singleTask['taskPriority'] = '';
        singleTask['stage_name'] = '';
        this.setState({ singleTask, showModal: false, showModal1: false, viewTaskModel: false, editTaskId: '' });
        if (param)
            reFreashReactTable(this, 'fetchData');
        if (this.props.props.match.params.id) {
            //   window.location = ROUTER_PATH + 'admin/crm/tasks';
            this.setState({ redirect_deshboard: true })
        }
    }

    submitSearch = (e) => {
        e.preventDefault();
        var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, filterStatusVal:this.state.filterStatusVal }
        this.setState({ filtered: srch_ary });

    }

    searchStatusData = (key, value) => {
        var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, filterStatusVal:this.state.filterStatusVal};
        srch_ary[key] = value;
        this.setState(srch_ary);
        this.setState({ filtered: srch_ary });
    }

    searchPriorityData = (key, value) => {
        var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, filterStatusVal:this.state.filterStatusVal };
        srch_ary[key] = value;
        this.setState(srch_ary);
        this.setState({ filtered: srch_ary });
    }

    componentWillMount() {
        if (typeof (this.props.props.history.location.state) != 'undefined') {
            this.setState({ loading: true });
            if (this.props.props.history.location.state.openSortPriorityDetails) {
                this.openSortPriorityDetails();
            }
            if (this.props.props.history.location.state.openSortDateDetails) {
                this.openSortByDateDetails();
            }
        }
    }

    render() {


        const classname = ['none', 'priority_high_task', 'priority_medium_task', 'priority_low_task'];
        var prioritylevel = [
            { value: '1', label: 'Low' },
            { value: '2', label: 'Medium' },
            { value: '3', label: 'High' }
        ];
        var statuslevel = [
            { value: '0', label: 'Assigned' },
            { value: '1', label: 'Completed' },
            { value: '3', label: 'Archived' }
        ];
        const columns = [
            { Header: "Task Name:", accessor: "taskname", Cell: row => (<div className={classname[row.original.priority]}><span className="d-flex align-items-center tsk_sp"><i className="icon icon-circle1-ie cir_1"></i>  <span  className="ellipsis_line__">{row.value}</span></span></div>), headerStyle: { border: '0px solid #000', }, },


            {
                Header: (this.state.permissions.access_crm_admin) ? 'Assigned To:' : "Participant Name:", accessor: (this.state.permissions.access_crm_admin) ? 'assigned_to' : "participant_name",
                headerClassName: 'Th_class_d1 _align_c__',
                className:'_align_c__',
                Cell: props => <span className="h-100" style={{ justifyContent: 'flex-start' }}>
                    <div className="ellipsis_line__">
                        {props.value}
                    </div>
                </span>
            },
            {
                Header: "Due Date:", accessor: "duedate",
                headerClassName: 'Th_class_d1 _align_c__',
                className:'_align_c__',
                Cell: props => <span className="h-100" style={{ justifyContent: 'flex-start' }}>
                    <div className="ellipsis_line__">
                        {props.value}
                    </div>
                </span>
            },
            {
                Header: "Action Date:", accessor: "updated_at",
                headerClassName: 'Th_class_d1 _align_c__',
                className:'_align_c__',
                Cell: props => <span className="h-100" style={{ justifyContent: 'flex-start' }}>
                    <div className="ellipsis_line__">
                        {props.value}
                    </div>
                </span>
            },
            {
                Header: "Status:", accessor: "task_status",
                headerClassName: 'Th_class_d1 _align_c__',
                className:'_align_c__',
                Cell: props => <span className="h-100" style={{ justifyContent: 'flex-start' }}>
                    <div className="ellipsis_line__">
                        {props.value}
                    </div>
                </span>
            },
            {

                Cell: (props) => <span className="action_ix__ action_ix_1__">

                    <i className="icon icon-view2-ie icon_h-1 mr-2" onClick={() => this.viewTask(props.original.task_id)} title="View"></i>

                    <i className={(props.original.task_status == 'Completed' || props.original.task_status == 'Archived' ) ? "hide" : "icon icon-views icon_h-1"} onClick={() => this.editTask(props.original.task_id)} title="Edit"></i>

                    <i className={(props.original.task_status == 'Completed' || props.original.task_status == 'Archived' ) ? "hide" : "icon icon-accept-approve2-ie icon_h-1 mr-2"} onClick={() => this.archiveCompleteAction(props.original.task_id, '4')} title="Completed"></i>

                    <i className={(props.original.task_status=='Archived' || props.original.task_status == 'Assigned') ? "hide" : "icon icon-archive2-ie icon_h-1 mr-2"} onClick={() => this.archiveCompleteAction(props.original.task_id, '5', props.original.task_status_val)} title="Archive"></i>


                    {
                    //   (props.original.task_status=='Assigned' && props.original.task_archive == '0')?
                    // <i className={(props.original.task_archive == '0') ? "hide" : "icon icon-archive2-ie icon_h-1 mr-2"} onClick={() => this.archiveCompleteAction(props.original.task_id, '5', props.original.task_status_val)} title="Archive"></i>
                    // :
                    // <i className={(props.original.task_archive == '1') ? "hide" : "icon icon-archive2-ie icon_h-1 mr-2"} onClick={() => this.archiveCompleteAction(props.original.task_id, '5', props.original.task_status_val)} title="Archive"></i>
                    //
                  }

                </span>, Header: <div className="">Action</div>,
                headerStyle: { border: "0px solid #fff" }, sortable: false
            },


        ];


        return (
            <div className="container-fluid">
                {(this.state.redirect_deshboard) ? <Redirect to='/admin/crm/tasks' /> : ''}
                <CrmPage pageTypeParms={'schedule_user_task'} />
                <div className="row">
                    <div className="col-lg-12">
                        <div className=" py-4 bb-1">
                            {(this.state.filtered) ?
                                <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/StaffDetails/' + this.state.filtered.staffId}><span className="icon icon-back1-ie" ></span></Link>
                                : <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/participantadmin'}><span className="icon icon-back1-ie" ></span></Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="row d-flex py-4">
                            <div className="col-md-9">
                                <div className="h-h1">
                                    {this.props.showPageTitle}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <a className="C_NeW_BtN w-100" onClick={this.showModal}><span>Create New Task</span>
                                    <i className="icon icon icon-add-icons"></i>
                                </a>
                            </div>
                        </div>
                        <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
                    </div>
                </div>



                <form className="w-100 bb-1 mb-4 d-block" onSubmit={this.submitSearch}>
                    <div className="row sort_row1-- after_before_remove justify-content-between">
                        <div className="col-md-7">
                            <div className="search_bar ad_search_btn right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search" value={this.state.search || ''} onChange={(e) => this.setState({ 'search': e.target.value })} />
                                <button type="submit"><i className="icon icon-search2-ie"></i></button>
                            </div>
                        </div>

                        <div className="col-md-3 d-inline-flex align-self-center">
                            <div className="s-def1 w-100">
                                <Select
                                    name="view_by_status"
                                    options={statuslevel}
                                    required={true}
                                    simpleValue={true}
                                    searchable={false}
                                    clearable={false}
                                    placeholder="Filter by: Status"
                                    onChange={(e) => this.searchStatusData('filterStatusVal', e)}
                                    value={this.state.filterStatusVal}
                                    className={'custom_select'}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 d-inline-flex align-self-center">
                            <div className="s-def1 w-100">
                                <Select
                                    name="view_by_priority"
                                    options={prioritylevel}
                                    required={true}
                                    simpleValue={true}
                                    searchable={false}
                                    clearable={false}
                                    placeholder="Filter by: Priority"
                                    onChange={(e) => this.searchPriorityData('filterVal', e)}
                                    value={this.state.filterVal}
                                    className={'custom_select'}
                                />
                            </div>
                        </div>
                    </div>
                </form>





                <div className="row">
                    <div className="col-md-12 mt-4 crm_task_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                ref={this.reactTable}
                                columns={columns}
                                data={this.state.taskLists}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                defaultPageSize={10}
                                onFetchData={this.fetchData}
                                filtered={this.state.filtered}
                                showPagination={true}
                                onPageSizeChange={this.onPageSizeChange}
                                manual="true"
                                minRows={1}
                                className="-striped -highlight"
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}

                            //  SubComponent={subComponentTaskMapper}

                            />
                        </div>

                    </div>
                </div>


                {
                    this.state.showModal ?
                        <CreateTask show={this.state.showModal} closeModal={this.closeModal} />
                        : null

                }

                {
                    this.state.showModal1 ?
                        <EditTask
                            show={this.state.showModal1}
                            closeModal={this.closeModal}
                            editTaskId={this.state.editTaskId}
                            type={this.state.type}
                        // viewEditTask = {this.state.viewEditTask}
                        />
                        : null
                }


                <div className={this.state.viewTaskModel ? 'customModal show' : 'customModal'}>
                    <div className="custom-modal-dialog Information_modal task_modal">
                        {
                            this.state.viewTaskModel ?
                                <ViewTask
                                    show={this.state.viewTaskModel}
                                    closeModal={this.closeModal}
                                    taskId={this.state.viewTaskId}
                                    viewTaskModel={this.state.viewTaskModel} />
                                : null
                        }
                    </div>
                </div>








            </div>
        );
    }
}


const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,

    }
};

export default connect(mapStateToProps)(Tasks);
