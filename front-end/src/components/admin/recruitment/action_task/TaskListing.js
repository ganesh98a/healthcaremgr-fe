import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import moment from 'moment';
import { PanelGroup, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import EditCabInfo from './../EditCabInfo';
import EditTask from './EditTask';
import CreateNewTask from './CreateNewTask';
import { checkItsNotLoggedIn, postData, handleDateChangeRaw, changeTimeZone, reFreashReactTable, archiveALL } from 'service/common.js';
import { PAGINATION_SHOW } from 'config.js';
import Pagination from "service/Pagination.js";
import queryString from 'query-string';
import { ToastUndo } from 'service/ToastUndo.js';
import { ToastContainer, toast } from 'react-toastify';
import {defaultSpaceInTable} from 'service/custom_value_data.js';
import { connect } from 'react-redux'


const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentTaskAction/get_recruitment_task_list', Request).then((result) => {
            let filteredData = result.data;

            if (result.status) {
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    total_count: (result.total_count),
                };
                resolve(res);
            }
        });

    });
};

class TaskListing extends Component {
    constructor() {
        super();
        this.state = {
            taskListing: [],
            filter_val: 'in_progress',
        }
        this.reactTable = React.createRef();
    }
    componentWillMount() {
        let recruiterId = '';
        const parsed = queryString.parse(window.location.search);

        if (typeof (parsed) === 'object' && parsed.rec != '') {
            let stateData = {};
            stateData['recruiterId'] = parsed.rec;
            if (parsed['actiontype'] && parsed.actiontype != '') {
                stateData['actionTypeSatge'] = parsed.actiontype;
            }
            this.setState(stateData);
        }
    }

    defaultFilteredData = () => {
        let data = {};
        data['filter_val'] = this.state.filter_val;
        data['recruiterId'] = this.state.hasOwnProperty('recruiterId') ? this.state.recruiterId : '';
        data['actionTypeSatge'] = this.state.hasOwnProperty('actionTypeSatge') ? this.state.actionTypeSatge : '';

        return data;
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
            this.setState({
                taskListing: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    showModal = () => {
        this.setState({ showModal: true })
    }

    closeModal = () => {
        this.setState({ showModal: false })
    }

    CreateTaskCloseModal = (status) => {
        if (status) {
            reFreashReactTable(this, 'fetchData');
        }
        this.setState({ CreateTaskShowModal: false })
    }

    filterChange = (value) => {
        let extratstate = {};
        if (this.state.hasOwnProperty('recruiterId')) {
            extratstate['recruiterId'] = this.state.recruiterId;
        }
        if (this.state.hasOwnProperty('actionTypeSatge')) {
            extratstate['actionTypeSatge'] = this.state.actionTypeSatge;
        }
        this.setState({ filter_val: value, filtered: { ...this.state.filtered, ...extratstate, search: this.state.search, filter_val: value } });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        let extratstate = {};
        if (this.state.hasOwnProperty('recruiterId')) {
            extratstate['recruiterId'] = this.state.recruiterId;
        }
        if (this.state.hasOwnProperty('actionTypeSatge')) {
            extratstate['actionTypeSatge'] = this.state.actionTypeSatge;
        }
        this.setState({ filtered: { ...this.state.filtered, ...extratstate, search: this.state.search, filter_val: this.state.filter_val } })
    }

    completeTask = (taskId) => {
        archiveALL({ taskId: taskId }, 'Are you sure, you want to complete this task?', 'recruitment/RecruitmentTaskAction/complete_recruiterment_task').then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchData');
            } else {
                if (result.error) {
                    toast.dismiss();
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            }
        });
    }

    arhiveTask = (taskId) => {
        archiveALL({ taskId: taskId }, 'Are you sure, you want to archive this task?', 'recruitment/RecruitmentTaskAction/archive_recruiterment_task').then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchData');
            } else {
                if (result.error) {
                    toast.dismiss();
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            }
        });
    }

    editTaskOpenModal = (taskId) => {
        this.setState({ editTaskId: taskId, EditNewTaskModal: true });
    }

    EditCloseModel = (status) => {
        if (status) {
            reFreashReactTable(this, 'fetchData');
        }
        this.setState({ editTaskId: '', EditNewTaskModal: false });
    }


    render() {

        var options = [
            { value: 'all', label: 'All' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'archive', label: 'Archive' },
        ];

        var columns = [
            {
                accessor: "task_name",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Task Name</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props =><div  className="ellipsis_line1__"><span className={props.original.overdue_task==1 ? 'overdue_task_class':''}>{defaultSpaceInTable(props.value)}</span></div>,
                minWidth: 80,
            },
            { 
            accessor: "stage",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line1__">Stage</div>
                </div>
            ,
            className: '_align_c__',
            Cell: props => <span>{defaultSpaceInTable(props.value)}</span>,
         },
            { 
            accessor: "start_datetime", 
            minWidth: 60, 
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line1__">Date</div>
                </div>
            ,
            className: '_align_c__',
            Cell: (props) => <span>{moment(props.value).format('DD/MM/YYYY')}</span>,
             },
            { 
                accessor: "primary_recruiter" ,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Primary Staff</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>,
            },
            {
                // Header: "Available Slots:",
                accessor: "slots",
                width: 320,
                sortable: false,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Available Slots:</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: (props) => (
                    <span>
                    <div className="text-center w-100 slots_flx">
                        {props.original.slot_applicable ? <React.Fragment>
                            <div><span className="slots_sp clr_green">{props.original.filled}/{props.original.max_applicant}</span></div>
                            <div><span className="counties2 green">{props.original.accepted}</span> Accepted</div>
                            <div><span className="counties2 orange">{props.original.pending}</span> Pending</div>
                        </React.Fragment> : <div>Not Applicable</div>}

                    </div>
                    </span>

                )
            },
            {
                // Header: "Status:",
                accessor: "status",
                minWidth: 100,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Status</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: (props) => (
                    <span>
                    <div>{(
                        props.original.status == '2' ? <span className="slots_sp clr_green">Completed</span> :
                            props.original.status == '1' ? <span className="slots_sp clr_blue">In progress</span> :
                                props.original.status == '4' ? <span className="slots_sp clr_purple">Archived</span> : <span className="slots_sp clr_red">Cancelled</span>
                    )}
                    </div>
                    </span>
                )
            },
            {
                // Header: "",
                sortable: false,
                accessor: "action",
                minWidth: 100,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Action</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: (props) => (<span className="tsk_actn_spn ">
                    {props.original.status == 2 || props.original.status == 4 ? '' : <React.Fragment><a onClick={() => this.completeTask(props.original.id)}>Complete</a>&nbsp;|&nbsp;</React.Fragment>}
                    <a onClick={() => this.editTaskOpenModal(props.original.id)}>{props.original.status == 1 ? <React.Fragment>Edit/View &nbsp;|&nbsp;</React.Fragment> : 'View'}</a>
                    {props.original.status == 2 || props.original.status == 4 ? '' : <React.Fragment><a onClick={() => this.arhiveTask(props.original.id)}>Archive</a></React.Fragment>}
                </span>)
            }
        ];


        return (
            <React.Fragment>

                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1> {this.props.showPageTitle}

                            <Link to='#'>
                                <button className="btn hdng_btn cmn-btn1 icn_btn12" onClick={() => this.setState({ CreateTaskShowModal: true })}>Create New Task <i className="icon icon-add-icons hdng_btIc"></i></button>
                            </Link>
                        </h1>
                    </div>
                </div>
                {/* row ends */}

                <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-9 col-md-8 col-sm-8 no_pd_l">
                        <form onSubmit={this.handleSubmit}>
                            <div className="search_bar right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                <i className="icon icon-search2-ie" onClick={(e) => this.handleSubmit(e)}></i>
                            </div>
                        </form>
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                        <div className="filter_flx">

                            <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                                <Select name="view_by_status"
                                    required={true} simpleValue={true}
                                    searchable={false} Clearable={false}
                                    placeholder="Filter by: Unread"
                                    options={options}
                                    onChange={this.filterChange}
                                    value={this.state.filter_val}
                                    clearable={false}
                                />
                            </div>

                        </div>
                    </div>

                </div>
                {/* row ends */}


                <div className="row mt-5">
                    <div className="col-sm-12 no_pd_l Req-Task_tBL">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                columns={columns}
                                manual
                                data={this.state.taskListing}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                filtered={this.state.filtered}
                                defaultPageSize={10}
                                defaultFiltered={this.defaultFilteredData()}
                                className="-striped -highlight"
                                noDataText="No Record Found"
                                minRows={2}
                                ref={this.reactTable}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={this.state.taskListing.length >= PAGINATION_SHOW ? true : false}
                            />
                        </div>
                    </div>
                </div>

                {
                    (this.state.CreateTaskShowModal) ?
                        <CreateNewTask showModal={this.state.CreateTaskShowModal} closeModal={this.CreateTaskCloseModal} />
                        : ''
                }

                {this.state.EditNewTaskModal ? <EditTask taskId={this.state.editTaskId} showModal={this.state.EditNewTaskModal} closeModal={this.EditCloseModel} /> : ''}

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

export default connect(mapStateToProps, mapDispatchtoProps)(TaskListing);