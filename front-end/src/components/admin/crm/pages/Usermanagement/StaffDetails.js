import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import ReactResponsiveSelect from "react-responsive-select";
import { confirmAlert, createElementReconfirm } from "react-confirm-alert";
import { Doughnut } from "react-chartjs-2";
import { checkItsNotLoggedIn, getJwtToken, getOptionsCrmParticipant, postData, reFreashReactTable, getPermission } from "../../../../../service/common.js";
import BigCalendar from "react-big-calendar";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "react-big-calendar/lib/Toolbar";
import { ROUTER_PATH } from "../../../../../config.js";
import CrmPage from "../../CrmPage";
import { ToastUndo } from "service/ToastUndo.js";
import { connect } from "react-redux";
import { CounterShowOnBox } from "service/CounterShowOnBox.js";
import DisableStaff from "./DisableStaff";
import PageNotFound from "../../../PermissionError";
import { CustomEvent } from "service/CustomEvent.js";
import { WeekendDayPropGetter } from "service/WeekendDayPropGetter.js";
import { MyCustomHeader } from "service/MyCustomHeader.js";
import jQuery from "jquery";
import DatePicker from "react-datepicker";
import { priorityTask } from "../../../../../dropdown/CrmDropdown.js";
import Tasks from "../Schedules/Tasks/Tasks.js";
import ViewTask from "../Schedules/Tasks/ViewTask.js";
import SimpleBar from "simplebar-react";
import classNames from "classnames";

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer
moment.locale("au", {
    week: {
        dow: 1,
        doy: 1
    }
});
const localizer = BigCalendar.momentLocalizer(moment);

const CustomTbodyComponent = props => (
    <div {...props} className={classNames("rt-tbody", props.className || [])}>
      <SimpleBar
        style={{
          maxHeight: "715px",
          overflowX: "hidden",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        forceVisible={false}
      >
        {props.children}
      </SimpleBar>
    </div>
  );

const multiSelectOptionMarkup = text => (
    <div>
        <span className="rrs_select"> {text}</span>
        <span className="checkbox">
            <i className="icon icon-star2-ie"></i>
        </span>
    </div>
);
class CreateTask extends Component {
    constructor(props, context) {
        super(props, context);
        this.child = React.createRef();
        this.state = {
            crm_participant_id: "",
            task_name: "",
            due_date: "",
            task_note: "",
            priority: "",
            task_id: "",
            assign_to: "",
            action: "1",
            tasksurl: false,
            priority: "",
            redirectsucess: false
        };
    }

    submit = e => {
        e.preventDefault();
        var url = "crm/CrmTask/create_task";
        var tosteMessage = "Task created successfully";
        var custom_validate = this.custom_validation({ errorClass: "tooltip-default" });
        var validator = jQuery("#create_task").validate({ ignore: [] });
        if (jQuery("#create_task").valid()) {
            var str = JSON.stringify(this.state);
            postData(url, str).then(result => {
                if (result.status) {
                    toast.success(<ToastUndo message={tosteMessage} showType={"s"} />, {
                        // toast.success("Task created successfully", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                    this.setState({ success: true });
                    this.props.closeModal(true);
                    // this.props.getStaffDetails(true);

                    let state = this.state;
                    state["task_name"] = "";
                    state["due_date"] = "";
                    state["relevant_task_note"] = "";
                    state["assigned_person"] = "";
                    state["taskPriority"] = "";
                    state["crm_participant_id"] = "";
                    this.setState(state, () => this.props.callbackFromParent(true));
                    this.props.getStaffScheduleListCalender();
                    // this.setState({a:true},()=>this.props.callbackFromParent(true))
                } else {
                    toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                        //   toast.error(result.error, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                    this.closeModal();
                }
                this.setState({ loading: false });
            });
        } else {
            validator.focusInvalid();
        }
    };
    closeModal = () => {
        this.props.closeModal();
        jQuery(".tooltip").hide();
    };

    handleChange = e => {
        var state = {};
        this.setState({ error: "" });
        state[e.target.name] = e.target.value;
        this.setState(state);
    };
    custom_validation = () => {
        var return_var = true;
        var state = {};
        var List = [{ key: "due_date" }, { key: "crm_participant_id" }];
        List.map((object, sidx) => {
            if (object.key == "crm_participant_id") {
                if (this.state["crm_participant_id"] == undefined || this.state["crm_participant_id"] == "") {
                    state[object.key + "_error"] = true;
                    this.setState(state);
                    return_var = false;
                }
            } else if (this.state[object.key] == null || this.state[object.key] == undefined || this.state[object.key] == "") {
                state[object.key + "_error"] = true;
                this.setState(state);
                return_var = false;
            } else if (object.key == "due_date") {
                if (this.state["due_date"] == undefined || this.state["due_date"] == "") {
                    state[object.key + "_error"] = true;
                    this.setState(state);
                    return_var = false;
                }
            }
        });
        return return_var;
    };
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + "_error"] = false;

        this.setState(state);
    };
    errorShowInTooltip = ($key, msg) => {
        //alert($key);
        return this.state[$key + "_error"] ? (
            <div className={"tooltip custom-tooltip fade top in" + (this.state[$key + "_error"] ? " select-validation-error" : "")} role="tooltip">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-inner">{msg}.</div>
            </div>
        ) : (
                ""
            );
    };

    render() {
        var priority = this.state.task_priority;
        var options = "";

        return (
            <div className="custom-modal-body w-100 mx-auto">
                <div className="custom-modal-header by-1">
                    <div className="Modal_title">Create Task</div>
                    <i className="icon icon-close1-ie Modal_close_i" onClick={this.closeModal}></i>
                </div>
                <form id="create_task">
                    <div className="row">
                        <div className="w-100 my-4">
                            <div className="col-md-12">
                                <h4 className="my-2 h4_edit__">
                                    {" "}
                                    <b>Search for a Participant</b>
                                </h4>
                            </div>
                            <div className="col-md-7">
                                <div className="search_icons_right modify_select">
                                    <Select.Async
                                        cache={false}
                                        clearable={true}
                                        name="crm_participant_id"
                                        value={this.state["crm_participant_id"]}
                                        loadOptions={e => getOptionsCrmParticipant(e, this.props.staffId)}
                                        placeholder="Search"
                                        onChange={e => this.selectChange(e, "crm_participant_id")}
                                        className="custom_select"
                                    />

                                    {this.errorShowInTooltip("crm_participant_id", "Select Participant")}
                                </div>
                            </div>

                            <div className="col-md-3">
                                <p>
                                    <b>Onboarding Stage:</b> {this.state["crm_participant_id"] != null ? this.state["crm_participant_id"].stageName : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 my-4">
                            <h4 className="my-2 h4_edit__">
                                <b>Task Name:</b>
                            </h4>

                            <input type="text" name="task_name" data-rule-required="true" data-msg-required="Add Task Name" value={this.state["task_name"]} onChange={this.handleChange} className="default-input" />
                        </div>
                        <div className="col-md-3 my-4">
                            <h4 className="my-2 h4_edit__">
                                <b>Priority:</b>
                            </h4>
                            <div className="s-def1 w-100">
                                <Select
                                    name="view_by_status"
                                    className="custom_select"
                                    options={priorityTask(0)}
                                    //  onFetchData = {this.fetchData2}
                                    required={true}
                                    name="priority"
                                    simpleValue={true}
                                    searchable={false}
                                    clearable={false}
                                    value={this.state["priority"] ? this.state["priority"] : ""}
                                    placeholder="Priority"
                                    onChange={e => this.selectChange(e, "priority")}
                                />

                                {this.errorShowInTooltip("priority", "Select Priority")}
                            </div>
                        </div>
                        <div className="col-md-2 my-4">
                            <h4 className="my-2 h4_edit__">
                                <b>Due Date:</b>
                            </h4>
                            <div className="s-def1 w-100">
                                <DatePicker
                                    autoComplete={"off"}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={110}
                                    dateFormat="dd-MM-yyyy"
                                    required={true}
                                    data-placement={"bottom"}
                                    utcOffset={0}
                                    minDate={moment()}
                                    name="due_date"
                                    onChange={e => this.selectChange(e, "due_date")}
                                    selected={this.state["due_date"] ? moment(this.state["due_date"], "DD-MM-YYYY") : null}
                                    className="text-center "
                                    placeholderText="DD/MM/YYYY"
                                    maxLength="30"
                                />
                            </div>
                        </div>
                        <div className="col-md-3 my-4">
                            <h4 className="my-2 h4_edit__">
                                <b>Assigned To :</b>
                            </h4>
                            <div className="search_icons_right modify_select">
                                <p>{this.state["crm_participant_id"] != null ? this.state["crm_participant_id"].assigned_person : ""}</p>
                            </div>
                        </div>
                    </div>

                    <div className="row d-flex">
                        <div className="col-md-7">
                            <h4 className="my-2 h4_edit__">
                                <b>Relevant Task Notes:</b>
                            </h4>
                        </div>
                    </div>

                    <div className="row d-flex mb-4">
                        <div className="col-md-7  task_N_txt">
                            <textarea
                                name="relevant_task_note"
                                data-rule-required="true"
                                data-msg-required="Add Task Note"
                                value={this.state["relevant_task_note"]}
                                onChange={this.handleChange}
                                className="form-control textarea-max-size "
                                wrap="soft"
                            ></textarea>
                        </div>
                    </div>

                    <div className="custom-modal-footer bt-1 mt-5 px-0 pb-4">
                        <div className="row d-flex justify-content-end">
                            <div className="col-md-2">
                                {" "}
                                <a className="btn-1" onClick={this.submit}>
                                    Create Task
                </a>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
// By default no caret icon is supplied - any valid jsx markup will do
const caretIcon = <i className="icon icon-edit1-ie"></i>;

class StaffDetails extends Component {
    constructor(props, context) {
        super(props, context);
        this.participantDetailsRef = React.createRef();
        this.handleSelect = this.handleSelect.bind(this);

        this.state = {
            key: 1,
            filterVal: "",
            showModal: false,
            details: [],
            crmparticipantCount: 0,
            view_type: "month",
            grapheachdata: "",
            myStaffScheduleList: [],
            permissions: getPermission() == undefined ? [] : JSON.parse(getPermission()),
            staffId: this.props.props.match.params.id,
            tasks: false,
            redirectsucess: false,
            viewTaskModel: false,
            viewTaskId: '',
            details: {},
            details: {email_contact:[],phone_contact:[]},
        };
    }
    handleSelect(key) {
        this.setState({ key });
    }
    callbackFunction = childData => {
        if (childData) this.getStaffDetails();
    };
    viewTask = (viewTaskId) => {
        this.setState({ viewTaskModel: true, viewTaskId: viewTaskId });
    }

    getStaffScheduleList = e => {
        var requestData = { date: e, staffId: this.props.props.match.params.id };
        postData("crm/CrmSchedule/schedules_calendar_data_by_staffid", requestData).then(result => {
            if (result.status) {
                var tempAry = result.data;
                if (tempAry.length > 0) {
                    tempAry.map((value, idx) => {
                        tempAry[idx]["end"] = value.end;
                        tempAry[idx]["start"] = value.start;
                    });
                    this.setState({ myStaffScheduleList: tempAry });
                }
            } else {
                this.setState({ error: result.error });
            }
            this.setState({ loading: false });
        });
    };

    EnableRecruiter = id => {
        this.setState({
            staff_disable: {
                staff_id: id
            }
        });
        let msg = <span>Are you sure you want to enable this account?</span>;
        return new Promise((resolve, reject) => {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className="custom-ui">
                            <div className="confi_header_div">
                                <h3>Confirmation</h3>
                                <span
                                    className="icon icon-cross-icons"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                ></span>
                            </div>
                            <p>{msg}</p>
                            <div className="confi_but_div">
                                <button
                                    className="Confirm_btn_Conf"
                                    onClick={() => {
                                        postData("crm/CrmStaff/enable_crm_user", id).then(result => {
                                            if (result) {
                                                toast.success(<ToastUndo message="Enabled successfully" showType={"s"} />, {
                                                    // toast.success("Note Deleted successfully", {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                                onClose();
                                                this.setState({ success: true });
                                                this.getStaffDetails();
                                                this.getStaffScheduleList(moment());
                                            } else {
                                                toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                                                    // toast.error(result.error, {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                            }
                                        });
                                    }}
                                >
                                    Confirm
                </button>
                                <button
                                    className="Cancel_btn_Conf"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    {" "}
                                    Cancel
                </button>
                            </div>
                        </div>
                    );
                }
            });
        });
    };
    archiveTask = id => {
        let msg = (
            <span>
                Are you sure you want to archive this item? <br /> Once archived, this action can not be undone.
      </span>
        );
        return new Promise((resolve, reject) => {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className="custom-ui">
                            <div className="confi_header_div">
                                <h3>Confirmation</h3>
                                <span
                                    className="icon icon-cross-icons"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                ></span>
                            </div>
                            <p>{msg}</p>
                            <div className="confi_but_div">
                                <button
                                    className="Confirm_btn_Conf"
                                    onClick={() => {
                                        postData("crm/CrmTask/archive_task", { task_id: id }).then(result => {
                                            if (result) {
                                                toast.success(<ToastUndo message={"Task Archived successfully"} showType={"s"} />, {
                                                    // toast.success("Note Deleted successfully", {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                                onClose();
                                                this.setState({ success: true });
                                                this.getStaffDetails();
                                                this.getStaffScheduleList(moment());
                                            } else {
                                                toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                                                    // toast.error(result.error, {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                            }
                                        });
                                    }}
                                >
                                    Confirm
                </button>
                                <button
                                    className="Cancel_btn_Conf"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    {" "}
                                    Cancel
                </button>
                            </div>
                        </div>
                    );
                }
            });
        });
    };
    completeTask = id => {
        let msg = (
            <span>
                Are you sure you want to complete this task? <br /> Once completed, this action can not be undone.
      </span>
        );
        return new Promise((resolve, reject) => {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className="custom-ui">
                            <div className="confi_header_div">
                                <h3>Confirmation</h3>
                                <span
                                    className="icon icon-cross-icons"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                ></span>
                            </div>
                            <p>{msg}</p>
                            <div className="confi_but_div">
                                <button
                                    className="Confirm_btn_Conf"
                                    onClick={() => {
                                        postData("crm/CrmTask/complete_task", { task_id: id }).then(result => {
                                            if (result) {
                                                toast.success(<ToastUndo message={"Task Completed successfully"} showType={"s"} />, {
                                                    // toast.success("Note Deleted successfully", {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                                onClose();
                                                this.setState({ success: true });
                                                this.getStaffDetails();
                                                this.getStaffScheduleList(moment());
                                            } else {
                                                toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                                                    // toast.error(result.error, {
                                                    position: toast.POSITION.TOP_CENTER,
                                                    hideProgressBar: true
                                                });
                                            }
                                        });
                                    }}
                                >
                                    Confirm
                </button>
                                <button
                                    className="Cancel_btn_Conf"
                                    onClick={() => {
                                        onClose();
                                        resolve({ status: false });
                                    }}
                                >
                                    {" "}
                                    Cancel
                </button>
                            </div>
                        </div>
                    );
                }
            });
        });
    };

    showModal = () => {
        this.setState({ showModal: true });
    };
    closeModal = () => {
        this.setState({ showModal: false, showModal1: false, viewTaskModel: false });
    };
    options = data => {
        let opt = [];

        if (typeof data != "undefined") {
            opt.push({ text: "Select Allocations:", optHeader: true });
            data.map((key, i) =>
                opt.push({
                    value: data[i].deptList,
                    text: data[i].deptList,
                    markup: multiSelectOptionMarkup(data[i].deptList)
                })
            );
        }
        return opt;
    };
    crmParticipantAjax = () => {
        postData("crm/Dashboard/crm_participant_status", this.state).then(result => {
            if (result.status) {
                this.setState({ grapheachdata: result.grapheachdata });
            } else {
                this.setState({ error: result.error });
            }
        });
    };
    crmParticipantCountBy = type => {
        this.setState({ count_view_type: type, staffId: this.props.props.match.params.id, view_type: type }, function () {
            this.crmParticipantCountAjax();
        });
    };
    crmParticipantStatusBy = type => {
        this.setState({ status_view_type: type, staffId: this.props.props.match.params.id, view_type: type }, function () {
            this.crmParticipantAjax();
        });
    };

    //
    crmParticipantCountAjax = () => {
        postData("crm/Dashboard/crm_participant_count", this.state).then(result => {
            if (result.status) {
                this.setState({ crmparticipantCount: result.crm_participant_count });
                this.setState({ all_crmparticipant_count: result.all_crmparticipant_count });
            } else {
                this.setState({ error: result.error });
            }
        });
    };
    componentDidMount() {		
		this.disableAfterRedirect();
    }
    disableAfterRedirect = () => {
        this.crmParticipantCountAjax();
        this.getStaffScheduleList(moment());
        this.setState({ participant_id: this.props.props.match.params.id, staff_id: this.props.props.match.params.id });
        this.getStaffDetails();
        this.crmParticipantAjax();
    };
    getStaffScheduleListCalender = () => {
        this.getStaffScheduleList(moment());
    };
    EventList = () => {
        let eventList = [];
        if (typeof this.state.dueTask !== "undefined" && this.state.dueTask.length > 0) {
            this.state.dueTask.map((key, i) =>
                eventList.push({
                    id: this.state.dueTask[i].id,
                    title: this.state.dueTask[i].title,
                    allDay: this.state.dueTask[i].allDay,
                    start: new Date(this.state.dueTask[i].start),
                    end: new Date(this.state.dueTask[i].end),
                    lowData: this.state.dueTask[i].lowData,
                    highData: this.state.dueTask[i].highData,
                    mediumData: this.state.dueTask[i].mediumData
                })
            );
        }
        return eventList;
    };

    clickOnpriorityDat = (e, type, timeStamp) => {
        var evDate = moment(timeStamp).format("YYYY-MM-DD");

        let priority = 0;
        if (type == "low") {
            priority = 1;
        }
        if (type == "medium") {
            priority = 2;
        }
        if (type == "high") {
            priority = 3;
        }
        this.setState({ tasksurl: true, priority: priority, taskDate: evDate });
    };
    getStaffDetails = () => {
        this.setState({ loading: true }, () => {
            postData("crm/CrmStaff/get_staff_details", { id: this.props.props.match.params.id }).then(result => {
                if (result.status) {
                    this.setState({ details: result.data });
                    
                }
                this.setState({ loading: false });
            });
        });
    };
    redirectSuccess = status => {
        if (status) this.setState({ redirectsucess: true });
        else this.setState({ redirectsucess: false });
    };
    render() {		
        if (this.state.tasksurl && this.state.priority && this.state.taskDate) {
            return (
                <Redirect
                    to={{ pathname: "/admin/crm/tasks", state: { openSortPriorityDetails: true, priority: this.state.priority, staffId: this.props.props.match.params.id, due_date: this.state.taskDate } }}
                />
            );
        }
		if (this.state.details.status == 0) {
            return (
                <Redirect
                    to={{ pathname: "/admin/crm/usermangement" }}
                />
            );
        }
        if (this.state.staffIdStatus) {
            return <Redirect to={{ pathname: "/admin/crm/tasks", state: { openSortPriorityDetails: true, staffId: this.props.props.match.params.id } }} />;
        }
        if (!this.state.permissions.access_crm_admin) {
            return <Redirect to="/admin/no_access" />;
        }
        const Graphdata = {
            labels: ["Successful", "Processing", "Rejected"],
            datasets: [
                {
                    data: [this.state.grapheachdata.successful, this.state.grapheachdata.processing, this.state.grapheachdata.rejected],
                    backgroundColor: ["#be77ff", "#7c00ef", "#5300a7"]
                }
            ]
        };

        const Applicantdata = {
            labels: ["Successful", "Processing", "Rejected"],
            datasets: [
                {
                    data: ["250", "333", "250"],
                    backgroundColor: ["#ed97fa", "#b968c7", "#702f75"]
                }
            ]
        };
        const pageSize = typeof this.state.details.task_list == "undefined" ? 0 : this.state.details.task_list.length;
        const status = ["none", "NDIS Intake", "Intake", "Plan Delegation"];
        const contact = ["none", "Phone Call", "Email"];
        const classname = ["none", "priority_high_task", "priority_medium_task", "priority_low_task"];

        const subIconMapper = row => {
            let data = row.original;
            return (
                <span className={"Staff_TIcon " + classname[data.stage_id]}>
                    <i className="icon icon-circle1-ie"></i>
                </span>
            );
        };

        const subComponentDataMapper = row => {
            let data = row.original;
            return (
                <div className="tBL_Sub col-md-12 task_table bt-1 pt-3">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="w-80 mx-auto  mt-5">
                                {
                                    // <div className="Partt_d1_txt_3  mb-3"><strong>Task Name:  </strong><span> {data.task_name}</span></div>
                                }
                                <div className="Partt_d1_txt_3  mb-3">
                                    <strong>Task Note: </strong>
                                    <span> {data.note}</span>
                                </div>
                                <div className="Partt_d1_txt_3  mb-3">
                                    <strong>Date: </strong>
                                    <span> {data.date}</span>
                                </div>
                                {
                                    // <div className="Partt_d1_txt_3  mb-3"><strong>Update Specifics Notes:  </strong><span> {data.note}</span></div>
                                    // <div className="Partt_d1_txt_3  mb-3"><strong>Contact Method: </strong><span> <u>{contact[data.prefer_contact]}</u></span></div>
                                }
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="pt-3 pb-4 task_table_footer">
                                {/* <a><u>Add Note</u></a>
                            <a><u>Attach to Sub-Task</u></a> */}
                                <a onClick={() => this.viewTask(data.task_id)
                                }>
                                    <u>
                                        View
                                    </u>

                                </a>
                                <a onClick={() => this.completeTask(data.task_id)}>
                                    <u>Complete</u>
                                </a>
                                <a onClick={() => this.archiveTask(data.task_id)}>
                                    <u>Archive</u>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        return (
            <div className="container-fluid">
                <CrmPage ref={this.participantDetailsRef} pageTypeParms={"user_staff_members_details"} />
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
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <div className="py-4 bb-1">
                            <Link className="back_arrow d-inline-block" to={ROUTER_PATH + "admin/crm/Usermangement"}>
                                <span className="icon icon-back1-ie"></span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12  col-md-12">
                        <div className="row d-flex">
                            <div className="col-md-12 align-self-center py-4 bb-1">
                                <div className="h-h1 ">{this.props.showPageTitle}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12  col-md-12 py-4 bb-1">
                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-12 sm_mb_3">
                                        <div>
                                            <h4 className="text_break_all">
                                                <strong>{this.state.details.FullName}</strong>
                                            </h4>
                                            <div className="fs-15 mt-3">
                                                <b>HCMGR-Id:</b> <span className="d-inBl">{this.state.details.hcmgr_id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-md-6 col-sm-12 sm_mb_3">
                                        <div className="fs-15 pb-2">
                                            <b>Phone:</b> <span className="d-inBl">{this.state.details.phone_contact.map((val, key) =>
                                              (val.primary_phone == 1)?<div><span>(Primary) {val.phone}  </span> <br/></div>: <span>(Secondary) {val.phone}</span>
                                            )}</span>
                                        </div>
                                        <div className="fs-15 pb-2 d-flex">
                                            <b className="pr-2">Email:</b> <span className="d-inBl text_break_all">{this.state.details.email_contact.map((val, key) =>
                                              (val.primary_email == 1)?<div><span>(Primary) {val.email} </span> <br/></div>: <span>(Secondary) {val.email}</span>
                                            )}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-12 sm_mb_3">
                                        <div className="fs-15">
                                            <b>Allocated Service Area:</b> <span className="d-inBl w-100 pt-5">NDIS</span>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 sm_mb_3">
                                        <div className="fs-15">
                                            <b>Participant Intake Access Permissions:</b> <span className="d-inBl w-100 pt-5">All Permissions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12 sm_mb_3">
                                <div className="fs-15">
                                    <b>Position: </b> <span className="d-inBl">{this.state.details.position}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-5 col-md-12  col-sm-12 mt-5">
                        <div className="Staff_details_left">
                            <div className="row d-flex my-3">
                                <div className="col-md-8 d-inline-flex align-self-center">
                                    <h3 className="color">Task details</h3>
                                </div>
                                <div className="col-md-4">
                                    <a onClick={() => this.setState({ showModal1: true })} className="v-c-btn1 n2">
                                        <span>New Task</span> <i className="icon icon-add3-ie"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <div className="bt-1"></div>
                                </div>
                            </div>

                            <div className="row d-flex my-3">
                                <div className="col-md-12">
                                    <ul className="Staff_task_div1">
                                        <h3 className="color mr-3">Task Priority:</h3>
                                        <li className="Suc_task">
                                            <i className="icon icon-circle1-ie"></i>
                                            <span>Low</span>
                                        </li>
                                        <li className="Pro_task">
                                            <i className="icon icon-circle1-ie"></i>
                                            <span>Medium</span>
                                        </li>
                                        <li className="Rej_task">
                                            <i className="icon icon-circle1-ie"></i>
                                            <span>High</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 Req-Staff-Details_tBL mt-4">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                        <ReactTable
                                            columns={[
                                                {
                                                    Header: "Type",
                                                    Cell: row => (
                                                        <span className={"Staff_TIcon " + classname[row.original.priority]}>
                                                            <i className="icon icon-circle1-ie"></i>
                                                        </span>
                                                    ),
                                                    // Task color class
                                                    // 1. Suc_task
                                                    // 2. Pro_task
                                                    // 3. Rej_task
                                                    headerStyle: { border: "0px solid #000" },
                                                    width: 65
                                                },
                                                {
                                                    Header: "HCMGR-ID:",
                                                    accessor: "hcmgr_id",
                                                    headerClassName: "Th_class_d1 _align_c__",
                                                    className: this.state.activeCol === "name" && this.state.resizing ? "borderCellCls" : "Tb_class_d1",
                                                    Cell: props => (
                                                        <span className="h-100" style={{ justifyContent: "flex-start" }}>
                                                            <div className="ellipsis_line__">{props.value}</div>
                                                        </span>
                                                    )
                                                },
                                                {
                                                    Header: "Name:",
                                                    accessor: "FullName",
                                                    headerClassName: "Th_class_d1 _align_c__",
                                                    className: this.state.activeCol === "name" && this.state.resizing ? "borderCellCls" : "Tb_class_d1",
                                                    Cell: props => (
                                                        <span className="h-100" style={{ justifyContent: "flex-start" }}>
                                                            <div className="ellipsis_line__">{props.value}</div>
                                                        </span>
                                                    )
                                                },
                                                {
                                                    Header: "Task Name:",
                                                    accessor: "task_name",
                                                    headerClassName: "Th_class_d1 _align_c__",
                                                    className: this.state.activeCol === "name" && this.state.resizing ? "borderCellCls" : "Tb_class_d1",
                                                    Cell: props => (
                                                        <span className="h-100" style={{ justifyContent: "flex-start" }}>
                                                            <div className="ellipsis_line__">{props.value}</div>
                                                        </span>
                                                    )
                                                },
                                                {
                                                    Header: "",
                                                    Cell: row => (
                                                        <span className="">
                                                            {/* <Link to={ROUTER_PATH + "admin/crm/tasks/" + row.original.task_id}> */}
                                                            <a onClick={() => this.viewTask(row.original.task_id)} >
                                                                <i className="icon icon-view2-ie fs-15 "></i>
                                                            </a>
                                                            {/* </Link> */}
                                                        </span>
                                                    ),
                                                    headerStyle: { border: "0px solid #000" },
                                                    width: 65
                                                },
                                                {
                                                    expander: true,
                                                    Header: () => <strong></strong>,
                                                    width: 35,
                                                    headerStyle: { border: "0px solid #fff" },
                                                    Expander: ({ isExpanded, ...rest }) => (
                                                        <div className="rec-table-icon">
                                                            {isExpanded ? <i className="icon icon-arrow-up" style={{ fontSize: "13px" }}></i> : <i className="icon icon-arrow-down" style={{ fontSize: "13px" }}></i>}
                                                        </div>
                                                    ),
                                                    style: {
                                                        cursor: "pointer",
                                                        fontSize: 25,
                                                        padding: "0",
                                                        textAlign: "center",
                                                        userSelect: "none"
                                                    }
                                                }
                                            ]}
                                            data={this.state.details.task_list}
                                            pageSize={pageSize}
                                            showPagination={false}
                                            className="-striped -highlight"
                                            previousText={<span className="icon icon-arrow-1-left privious"></span>}
                                            nextText={<span className="icon icon-arrow-1-right next"></span>}
                                            SubComponent={subComponentDataMapper}
                                            minRows={2}
                                            TbodyComponent={CustomTbodyComponent}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-md-4 col-md-offset-4">
                                    <Link to={"#"} onClick={() => this.setState({ staffIdStatus: true })} className="btn-1 s2">
                                        View All Tasks
                  </Link>
                                </div>
                            </div>
                        </div>
                    </div>{" "}
                    {/* col-4 */}
                    <div className="col-lg-7 col-md-12 col-sm-12 mt-5">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 ">
                                <div className="status_box1">
                                    <div className="row">
                                        <h4 className="hdng">Participant Status</h4>
                                        <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                                            <div className="mb-3">
                                                <Doughnut data={Graphdata} height={170} className="myDoughnut" legend={null} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-sm-12 colJ-1">
                                            <ul className="status_det_list">
                                                <li className="chart_txt_1">Successful = {this.state.grapheachdata.successful}</li>
                                                <li className="chart_txt_2">Processing = {this.state.grapheachdata.processing}</li>
                                                <li className="chart_txt_3">Rejected = {this.state.grapheachdata.rejected}</li>
                                            </ul>
                                            {/* <div className="duly_vw"> */}
                                            <div className="viewBy_dc text-center">
                                                <h5>View By:</h5>
                                                <ul>
                                                    <li onClick={() => this.crmParticipantStatusBy("week")} className={this.state.status_view_type == "week" ? "active" : ""}>
                                                        Week{" "}
                                                    </li>
                                                    <li onClick={() => this.crmParticipantStatusBy("month")} className={this.state.status_view_type == "month" ? "active" : ""}>
                                                        Month{" "}
                                                    </li>
                                                    <li onClick={() => this.crmParticipantStatusBy("year")} className={this.state.status_view_type == "year" ? "active" : ""}>
                                                        {" "}
                                                        Year
                          </li>
                                                </ul>
                                            </div>
                                            {/* </div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-6">
                                <div className="status_box1">
                                    <div className="row">
                                        <h4 className="hdng">Onboarded Participants</h4>

                                        <div className="col-lg-12 col-md-12 col-sm-12 colJ-1">
                                            <CounterShowOnBox counterTitle={this.state.crmparticipantCount} classNameAdd="" mode="crm" />
                                            <div className="duly_vw">
                                                <div className="viewBy_dc text-center">
                                                    <h5>View By:</h5>
                                                    <ul>
                                                        {/* {this.state.graphType.length > 0 ? this.state.graphType.map((val, index) => {
                                                            return (<li key={index} className={val.name == this.state.applicant_successful_count_type ? 'active' : ''} onClick={() => this.getGraphResult('applicant_successful_count', val.name, 2)}>{_.capitalize(val.name)}</li>);
                                                        }) : <React.Fragment />} */}
                                                        <li onClick={() => this.crmParticipantCountBy("week")} className={this.state.count_view_type == "week" ? "active" : ""}>
                                                            Week
                            </li>
                                                        <li onClick={() => this.crmParticipantCountBy("month")} className={this.state.count_view_type == "month" ? "active" : ""}>
                                                            Month{" "}
                                                        </li>
                                                        <li onClick={() => this.crmParticipantCountBy("year")} className={this.state.count_view_type == "year" ? "active" : ""}>
                                                            {" "}
                                                            Year
                            </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row d-flex my-3 mt-5">
                            <div className="col-md-12 d-inline-flex align-self-center">
                                <h3 className="">Current Task Schedule:</h3>
                            </div>
                            {/* <div className="col-md-8">
                                <h5 className="mb-3">Current Schedule:</h5>
                                <ul className="Staff_task_div1">
                                    <li className="Suc_task"><i className="icon icon-circle1-ie"></i><span>Low</span></li>
                                    <li className="Pro_task"><i className="icon icon-circle1-ie"></i><span>Medium</span></li>
                                    <li className="Rej_task"><i className="icon icon-circle1-ie"></i><span>High</span></li>
                                </ul>
                            </div> */}
                        </div>

                        <div className="row">
                            <div className="col-md-12 mt-4">
                                <div className="Schedule_calendar weekend_bg-color__ set_hide_weekend_calander">
                                    <BigCalendar
                                        localizer={localizer}
                                        defaultView="month"
                                        views={["month"]}
                                        events={this.state.myStaffScheduleList}
                                        //components={{ toolbar: CalendarToolbar }}
                                        components={{
                                            event: props => CustomEvent({ ...props, headertype: "staffDetails", clickOnpriorityDat: this.clickOnpriorityDat }),
                                            toolbar: CalendarToolbar,
                                            month: { dateHeader: props => MyCustomHeader({ ...props, headertype: "staffDetails" }) }
                                        }}
                                        startAccessor="start"
                                        endAccessor="end"
                                        dayPropGetter={WeekendDayPropGetter}
                                        onNavigate={this.getStaffScheduleList}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>{" "}
                    {/* col-6 */}
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="task_table_footer Staff_f bt-1">
                            {/* <a><u>View Analytics </u></a> */}
                            {this.state.details.status == 1 ? (
                                <a onClick={() => this.setState({ showModal: true })}>
                                    <u>Disable User Account</u>
                                </a>
                            ) : (
                                    <a onClick={() => this.EnableRecruiter(this.state.staff_id)}>
                                        <u>Enable Account</u>
                                    </a>
                                )}
                        </div>
                    </div>
                </div>
                <DisableStaff showModal={this.state.showModal} disableRedirect={this.disableAfterRedirect} staffId={this.state.staff_id} closeModal={this.closeModal} getStaffDetails={this.getStaffDetails} />
                <div className={this.state.showModal1 ? "customModal show" : "customModal"}>
                    <div className="custom-modal-dialog Information_modal task_modal">
                        <CreateTask staffId={this.state.staffId} closeModal={this.closeModal} getStaffScheduleListCalender={this.getStaffScheduleListCalender} callbackFromParent={this.callbackFunction} />
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType
    };
};
export default connect(mapStateToProps)(StaffDetails);

class CalendarToolbar extends Toolbar {
    render() {
        return (
            <div>
                <div className="rbc-btn-group">
                    <span className="" onClick={() => this.navigate("TODAY")}>
                        {/* Today */}
                    </span>
                    <span className="icon icon-arrow-left" onClick={() => this.navigate("PREV")}></span>
                    <span className="icon icon-arrow-right" onClick={() => this.navigate("NEXT")}></span>
                </div>
                <div className="rbc-toolbar-label">{this.props.label}</div>
            </div>
        );
    }
}
