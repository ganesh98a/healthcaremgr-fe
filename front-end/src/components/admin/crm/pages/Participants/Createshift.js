import React from "react";
import { CounterShowOnBox } from "service/CounterShowOnBox.js";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import ReactTable from "react-table";
import CrmPage from "../../CrmPage";
import "react-table/react-table.css";
import Countdown from "react-countdown-now";
import DatePicker from "react-datepicker";
import { ROUTER_PATH } from "../../../../../config.js";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../../../../service/Pagination.js";
import moment from "moment";
import { checkItsNotLoggedIn, postData, getQueryStringValue, changeTimeZone, handleDateChangeRaw, reFreashReactTable } from "../../../../../service/common.js";
import { RosterDropdown, AnalysisDropdown, unfilledShiftTypeFilterOption } from "../../../../../dropdown/ScheduleDropdown.js";
import { TotalShowOnTable } from "../../../../../service/TotalShowOnTable";
import ManualMemberLookUp from "./ManualMemberLookUp";
import ScheduleHistory from "./ScheduleHistory";
import { connect } from "react-redux";
import { AllUpdates } from "./ParticipantAllUpdates";

const requestData = (pageSize, page, sorted, filtered, participantId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, participantId: participantId };
        postData("crm/CrmParticipant/participant_shifts", Request).then(result => {
            //console.log(result.total_count);
            let filteredData = result.data.data;

            const res = {
                rows: filteredData,
                pages: result.data.count,
                total_count: result.data.total_count
            };
            resolve(res);
        });
    });
};
class Createshift extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.participantDetailsRef = React.createRef();
        this.state = {
            sub_count: 0,
            all_shift: 0
        };
    }
    componentDidMount() {
        this.setState({ participant_id: this.props.props.match.params.id });
        this.participantDetailsRef.current.wrappedInstance.getParticipantDetails(this.props.props.match.params.id);
        this.getLatestSage();
        this.getAllStages();
    }
    showModal_PE = id => {
        if (id == "AllupdateModalShow") {
            var str = { participantId: this.state.participant_id };
            this.notes_list(str);
            this.getAllStages();
        }

        let state = {};
        state[id] = true;

        this.setState(state);
    };
    closeModal_PE = id => {
        let state = {};
        state[id] = false;

        this.setState(state);
    };
    notes_list = str => {
        postData("crm/CrmParticipant/latest_updates", str).then(result => {
            if (result.data.length > 0) {
                this.setState({ allupdates: result.data });
            }
        });
    };
    getAllStages = () => {
        let stage_name = "";
        this.setState({ loading: true }, () => {
            var intakeStr = "{}";
            postData("crm/CrmStage/get_all_stage", intakeStr).then(result => {
                if (result.status) {
                    this.setState({ stage_info: result.data, stage_dropdown: result.stage });
                }
                this.setState({ loading: false });
            });
        });
    };
    getLatestSage = () => {
        let latestStage = "";

        var intakeStr = JSON.stringify({ crm_participant_id: this.props.props.match.params.id });
        postData("crm/CrmStage/get_latest_stage", intakeStr).then(result => {
            if (result.status) {
                this.setState({
                    latestDate: result.data.latest_date,
                    latestStage: result.data[0].latest_stage_name,
                    latestStageStates: result.data[0].latest_stage,
                    booking_status: result.data.booking_status,
                    fund_lock: result.locked
                });
            }
            this.setState({ loading: false });
        });
    };
    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(state.pageSize, state.page, state.sorted, state.filtered, this.props.props.match.params.id).then(res => {
            this.setState({
                shiftListing: res.rows,
                pages: res.pages,
                total_count: res.total_count,
                loading: false,
                selectAll: 0,
                userSelectedList: [],
                selected: []
            });
        });
    };
    searchBox = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            var filter = {
                search_box: this.state.search_box,
                shift_type: this.state.shift_type,
                shift_date: this.state.shift_date,
                start_date: this.state.start_date,
                end_date: this.state.end_date,
                push_to_app: this.state.active_panel
            };
            this.setState({ filtered: filter });
        });
    };
    render() {
        const data = {
            labels: ["Other Shift", "New Shift"],
            datasets: [
                {
                    data: [this.state.all_shift - this.state.sub_count, this.state.sub_count],
                    backgroundColor: ["#d04170", "#d04170"],
                    hoverBackgroundColor: ["#d04170", "#d04170"],
                    borderWidth: 0
                }
            ]
        };
        const columns = [
            this.state.active_panel == "unfilled"
                ? {
                    id: "checkbox",
                    accessor: "",
                    Cell: ({ original }) => {
                        return (
                            <span className="w_50 w-100  mt-2">
                                <input
                                    disabled={original.push_to_app == 2 ? true : false}
                                    type="checkbox"
                                    className="checkbox1"
                                    checked={this.state.selected[original.id] === true}
                                    onChange={() => this.toggleRow(original.id)}
                                />
                                <label>
                                    <div className="d_table-cell">
                                        {" "}
                                        <span onClick={() => (original.push_to_app == 2 ? "" : this.toggleRow(original.id))}></span>
                                    </div>
                                </label>
                            </span>
                        );
                    },
                    Header: x => {
                        return (
                            <span className="w_50 w-100  mb-2">
                                <input
                                    type="checkbox"
                                    className="checkbox1"
                                    checked={this.state.selectAll === 1}
                                    ref={input => {
                                        if (input) {
                                            input.indeterminate = this.state.selectAll === 2;
                                        }
                                    }}
                                    onChange={() => this.toggleSelectAll()}
                                />
                                <label>
                                    <div className="d_table-cell">
                                        {" "}
                                        <span onClick={() => this.toggleSelectAll()}></span>
                                    </div>
                                </label>
                            </span>
                        );
                    },
                    sortable: false
                }
                : { width: 0, headerStyle: { border: "0px solid #fff" } },

            { Header: "ID", className: "_align_c__", accessor: "id", filterable: false },
            { Header: "Date", className: "_align_c__", accessor: "shift_date", filterable: false, Cell: props => <span>{changeTimeZone(props.original.shift_date, "DD/MM/YYYY")}</span> },
            { Header: "For", className: "_align_c__", accessor: "participantName", filterable: false },
            { Header: "Start", className: "_align_c__", accessor: "start_time", filterable: false, Cell: props => <span>{changeTimeZone(props.original.start_time, "LT")}</span> },
            { Header: "Duration", className: "_align_c__", accessor: "duration", filterable: false },
            {
                Cell: props => (
                    <span className="d-flex w-100 justify-content-center align-item-center">

                        <Link className="short_buttons_01" to={{ pathname: "/admin/crm/shiftdetails/" + props.original.id, state: this.props.props.location.pathname }}>
                            View Shift
            </Link>
                    </span>
                ),
                Header: <div className="">Action</div>,
                style: {
                    textAlign: "right"
                },
                headerStyle: { border: "0px solid #fff" },
                Header: <TotalShowOnTable countData={this.state.total_count} />,
                sortable: false
            },
            // {
            //     expander: true,
            //     sortable: false,
            //     Expander: ({ isExpanded, ...rest }) => <div>{isExpanded ? <i className="icon icon-arrow-up"></i> : <i className="icon icon-arrow-down"></i>}</div>,
            //     headerStyle: { border: "0px solid #fff" }
            // }
        ];

        return (
            <div>
                <CrmPage ref={this.participantDetailsRef} pageTypeParms={"participant_shift"} />
                <section className="manage_top">
                    <div className="container-fluid">
                        <div className="row  _Common_back_a">
                            <div className="col-lg-12 col-md-12">
                                <Link className="d-inline-flex" to={ROUTER_PATH + "admin/crm/prospectiveparticipants"}>
                                    <span className="icon icon-back-arrow back_arrow"></span>
                                </Link>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12  col-md-12">
                                <div className="row d-flex py-4">
                                    <div className="col-md-6 align-self-center br-1">
                                        <div className="h-h1 ">{this.props.showPageTitle}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="Lates_up_1">
                                            <div className="Lates_up_a col-md-3 align-self-center">Latest Update:</div>
                                            <div className="col-md-9 justify-content-between pr-0">
                                                <div className="Lates_up_b">
                                                    <div className="Lates_up_txt">
                                                        <b>
                                                            {this.state.latestStage ? this.state.latestStage : "Stage 1:NDIS Intake Participant Submission"} {this.state.stageId != 6 ? "Information" : ""}
                                                        </b>
                                                    </div>
                                                    {/* <div className="Lates_up_btn br-1 bl-1"><i className="icon icon-view1-ie"></i><span>View Attachment</span></div> */}
                                                    <div className="Lates_up_btn" onClick={() => this.showModal_PE("AllupdateModalShow")}>
                                                        <i className="icon icon-view1-ie"></i>
                                                        <span>View all Updates</span>
                                                    </div>
                                                    <AllUpdates
                                                        allupdates={this.state.allupdates}
                                                        stages={this.state.stage_info ? this.state.stage_info : ""}
                                                        onSelectDisp={this.state.newSelectedValue ? this.state.newSelectedValue : ""}
                                                        selectedChange1={e => this.selectChange(e, "view_by_status")}
                                                        selectedChange={e => this.selectChange(e, "assign_to")}
                                                        showModal={this.state.AllupdateModalShow}
                                                        handleClose={() => this.closeModal_PE("AllupdateModalShow")}
                                                    />
                                                </div>
                                                <div className="Lates_up_2">
                                                    <div className="Lates_up_txt2 btn-1">Date: {this.state.latestDate}</div>
                                                    {/* <div className="Lates_up_time_date"> Date: 01/01/01 - 11:32AM</div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="bt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12">
                                <div className="tab-content">
                                    <div role="tabpanel" className="tab-pane active" id={this.state.active_panel}>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="col-md-12 P_7_TB">
                                                        <h3>Shifts:</h3>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="bor_T"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bb-1 mb-4">
                                            <div className="row sort_row1-- after_before_remove">
                                                <div className="col-md-8 col-sm-12">
                                                    <div className="search_bar right srchInp_sm actionSrch_st">
                                                        <input type="text" className="srch-inp" onChange={e => this.searchBox("search_box", e.target.value)} name="" value={this.state.search_box || ""} />
                                                        <i className="icon icon-search2-ie"></i>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <div className="Fil_ter_ToDo">
                                                                <label>From</label>
                                                                <div className="cust_date_picker">
                                                                    <DatePicker
                                                                        autoComplete="off"
                                                                        onChangeRaw={handleDateChangeRaw}
                                                                        minDate={moment()}
                                                                        utcOffset={0}
                                                                        isClearable={true}
                                                                        name="start_date"
                                                                        onChange={e => this.searchBox("start_date", e)}
                                                                        selected={this.state["start_date"] ? moment(this.state["start_date"], "DD-MM-YYYY") : null}
                                                                        className="text-center px-0"
                                                                        placeholderText="00/00/0000"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="Fil_ter_ToDo">
                                                                <label>To</label>
                                                                <div className="cust_date_picker">
                                                                    <DatePicker
                                                                        autoComplete="off"
                                                                        onChangeRaw={handleDateChangeRaw}
                                                                        minDate={moment()}
                                                                        utcOffset={0}
                                                                        isClearable={true}
                                                                        name="end_date"
                                                                        onChange={e => this.searchBox("end_date", e)}
                                                                        selected={this.state["end_date"] ? moment(this.state["end_date"], "DD-MM-YYYY") : null}
                                                                        className="text-center px-0"
                                                                        placeholderText="00/00/0000"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 crm_create_shift_Table">
                                                <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                                    <ReactTable
                                                        PaginationComponent={Pagination}
                                                        manual="true"
                                                        ref={this.reactTable}
                                                        columns={columns}
                                                        data={this.state.shiftListing}
                                                        pages={this.state.pages}
                                                        onPageSizeChange={this.onPageSizeChange}
                                                        loading={this.state.loading}
                                                        onFetchData={this.fetchData}
                                                        filtered={this.state.filtered}
                                                        defaultPageSize={10}
                                                        className="-striped -highlight"
                                                        noDataText="No Record Found"
                                                        minRows={2}
                                                        previousText={<span className="icon icon-arrow-left privious"></span>}
                                                        nextText={<span className="icon icon-arrow-right next"></span>}
                                                        SubComponent={props => (
                                                            <div className="tBL_Sub">
                                                                <div className="other_conter">
                                                                    <div className="col-md-6">
                                                                        <ul>
                                                                            <li>
                                                                                <span className="color">End: </span> {changeTimeZone(props.original.end_time, "LT")}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                    <div className="col-md-6 text-right">
                                                                        <ul>
                                                                            <li>
                                                                                <span className="start_in_color">Start In: </span> <Countdown date={Date.now() + props.original.diff} />
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <ScheduleHistory open_history={false} />
                                        <ManualMemberLookUp modal_show={false} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,
        participaintDetails: state.DepartmentReducer.participaint_details
    };
};
export default connect(mapStateToProps)(Createshift);
