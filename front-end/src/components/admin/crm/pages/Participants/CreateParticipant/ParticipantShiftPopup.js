import React from "react";

import {
    checkItsNotLoggedIn,
    postData,
    handleRemoveShareholder
} from "../../../../../../service/common.js";
import jQuery from "jquery";
import { toast } from "react-toastify";
import { ToastUndo } from "service/ToastUndo.js";
import moment from "moment";

import SingleDay from "./ParticipantShiftUtils/SingleDay";
import OverlapShifts from "./ParticipantShiftUtils/OverlapShifts";
import StartEndTimeModal from "./ParticipantShiftUtils/StartEndTimeModal";
import StartAndEndDateOfRoster from "./ParticipantShiftUtils/StartAndEndDateOfRoster";
import SavingRoster from "./ParticipantShiftUtils/SavingRoster";
import BlockUi from "react-block-ui";

// import { isThursday } from 'date-fns';

const WeekData = {
    Mon: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ],
    Tue: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ],
    Wed: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ],
    Thu: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ],
    Fri: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ],
    Sat: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ],
    Sun: [
        { is_active: false },
        { is_active: false },
        { is_active: false },
        { is_active: false }
    ]
};

// export const ParticipantShiftPopup = (props) => {
class ParticipantShiftPopup extends React.Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            rosterList: [WeekData],
            start_time: "",
            end_time: "",
            start_date: "",
            modal_par_info: false,
            booked_by: 2,
            modal_collapse_shift: false,
            collapseSelect: 2,
            collapse_shift: [],
            rosterId: false,
            update_disableds: false,
            is_default: 1,
            editObj: null,
            delete_shiftIndex: false,
            loading: false
        };
    }

    getRosterDetails = id => {
        var requestData = { id: id };
        postData("crm/CrmParticipant/get_roster_details", requestData).then(
            result => {
                if (result.status) {
                    this.setState(result.data);
                } else {
                    this.setState({ error: result.error });
                }
                this.setState({ loading: false });
            }
        );
    };
    componentWillMount() {
        // if (this.props.participant_id) {
        //     this.setState({ update_disableds: true });
        //     this.getRosterDetails(this.props.participant_id);
        // }
        // else {
        this.setState({
            modal_par_info: true,
            update_disableds: false,
            rosterList: [this.reInitializeObject(WeekData)]
        });
        // }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.p_id) {
            if (newProps.p_id != this.state.p_id) {
                this.getRosterDetails(newProps.p_id);
                this.setState({
                    p_id: newProps.p_id,
                    modal_par_info: true,
                    update_disableds: false
                });
            }
        }
    }

    addRoster = (shiftIndex, index, day) => {
        if (!this.state.update_disableds) {
            var List = this.state.rosterList;

            this.setState(
                {
                    modal_show: true,
                    index: index,
                    day: day,
                    shiftIndex: shiftIndex
                },
                () => {
                    if (List[index][day][shiftIndex]["is_active"]) {
                        // List[index][day][shiftIndex] = { is_active: false };
                        this.setState({
                            start_time: List[index][day][shiftIndex]["start_time"],
                            end_time: List[index][day][shiftIndex]["end_time"],
                            delete_shiftIndex: true
                        });
                    } else {
                        this.setState({
                            start_time: null,
                            end_time: null,
                            delete_shiftIndex: false
                        });
                    }
                }
            );

            this.setState({ rosterList: List });
        }
    };

    deleteShiftHandler = (e, shiftIndex, index, day) => {
        e.preventDefault();
        var List = this.state.rosterList;
        List[index][day][shiftIndex] = {
            is_active: false,
            start_time: null,
            end_time: null
        };
        this.setState({ rosterList: List });
        this.closeModal();
    };

    saveDateTime = (e, shiftIndex, index, day) => {
        e.preventDefault();
        jQuery("#saving_time").validate();

        if (jQuery("#saving_time").valid()) {
            var List = this.state.rosterList;
            var status1 = false,
                status2 = false,
                status3 = false,
                status4 = false;

            // skip same id on edit mode id!==shiftIndex
            List[index][day].map((val, id) => {
                if (
                    !status1 &&
                    !status2 &&
                    !status3 &&
                    !status4 &&
                    val.start_time &&
                    val.end_time &&
                    id !== shiftIndex &&
                    val.is_active
                ) {
                    let stateStartTime = moment(this.state.start_time).format("HH:mm");
                    let valStartTime = moment(val.start_time).format("HH:mm");
                    let stateEndTime = moment(this.state.end_time).format("HH:mm");
                    let valEndTime = moment(val.end_time).format("HH:mm");

                    status1 = moment(stateStartTime, "HH:mm").isBetween(
                        moment(valStartTime, "HH:mm"),
                        moment(valEndTime, "HH:mm"),
                        null,
                        "[]"
                    );
                    status2 = moment(stateEndTime, "HH:mm").isBetween(
                        moment(valStartTime, "HH:mm"),
                        moment(valEndTime, "HH:mm"),
                        null,
                        "[]"
                    );
                    status3 = moment(valStartTime, "HH:mm").isBetween(
                        moment(stateStartTime, "HH:mm"),
                        moment(stateEndTime, "HH:mm"),
                        null,
                        "[]"
                    );
                    status4 = moment(valEndTime, "HH:mm").isBetween(
                        moment(stateStartTime, "HH:mm"),
                        moment(stateEndTime, "HH:mm"),
                        null,
                        "[]"
                    );
                }
            });
            // toast.dismiss();
            if (!status1 && !status2 && !status3 && !status4) {
                List[index][day][shiftIndex]["is_active"] = true;
                List[index][day][shiftIndex]["start_time"] = this.state.start_time;
                List[index][day][shiftIndex]["end_time"] = this.state.end_time;
                this.setState({ rosterList: List }, () => console.log(List));
                this.closeModal();
            } else {
                toast.error(
                    <ToastUndo
                        message={
                            "Selected start and end time shouldnt be in between your previous selected time(s) on this day"
                        }
                        showType={"e"}
                    />,
                    {
                        // toast.error("Selected start and end time overide your previous selected time on this day", {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    }
                );
            }
        }
    };

    handleAddShareholder = (e, stateName, object_array) => {
        e.preventDefault();
        var state = {};
        var temp = object_array;
        var list = this.state[stateName];

        state[stateName] = list.concat(this.reInitializeObject(WeekData));
        this.setState(state);
    };

    closeModal = () => {
        this.setState({
            modal_show: false,
            start_time: null,
            end_time: null
        });
    };

    reInitializeObject = object_array => {
        var state = {};
        Object.keys(object_array).forEach(function (key) {
            state[key] = [
                { is_active: false },
                { is_active: false },
                { is_active: false },
                { is_active: false }
            ];
        });
        return state;
    };

    selectChange = (value, fieldName) => {
        var state = {};
        state[fieldName] = value;
        this.setState(state);
    };

    closeStartEndDateModal = () => {
        this.setState({
            modal_start_end_date: false,
            start_date: "",
            end_date: "",
            title: ""
        });
    };

    saveAndFinish = e => {
        e.preventDefault();
        this.setState({
            modal_show_type: false,
            modal_start_end_date: true,
            rosterId: true
        });
        if (!this.state.rosterId) {
            this.setState({ start_date: "", end_time: "" });
        }
    };
    final_submit = e => {
        this.props.submitParticipantShift(this.state);

        // var custom_validate = this.checkValidDay()
        // if (custom_validate && this.state.start_date !== '') {
        //     this.props.submitParticipantShift(this.state);
        // }

        // else {
        //     toast.dismiss();
        //     toast.error(<ToastUndo message={'Please Save Roster'} showType={'e'} />, {
        //         // toast.error('Please select at least one day', {
        //         position: toast.POSITION.TOP_CENTER,
        //         hideProgressBar: true
        //     });
        // }
    };
    checkValidDay = () => {
        var status = false;
        var List = this.state.rosterList;
        List.map((mutipleShift, index) => {
            Object.keys(mutipleShift).forEach(function (key, index) {
                mutipleShift[key].map((shift, shiftIndex) => {
                    if (shift.is_active) {
                        if (!status) {
                            status = true;
                        }
                    }
                });
            });
        });
        return status;
    };

    saveRoster = e => {
        e.preventDefault();
        var status = this.checkValidDay();

        toast.dismiss();
        if (status) {
            this.setState({ modal_show_type: true });
            return true;
        } else {
            toast.error(
                <ToastUndo message={"Please select at least one day"} showType={"e"} />,
                {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                }
            );
            return false;
        }
    };

    check_shift_collapse = (e, bool) => {
        e.preventDefault();
        jQuery("#saving_roster").validate();
        toast.dismiss();

        if (jQuery("#saving_roster").valid()) {
            this.setState({ modal_start_end_date: false });
        }
    };

    checkboxResolveCollapse = (id, value, selectAll, old, oldIndex) => {
        var List = this.state.collapse_shift;

        // if want to select all
        if (selectAll) {
            List.map((shift, id) => {
                List[id]["status"] = value;
                var NewOld = value == 2 ? false : true;
                if (List[id].is_collapse) {
                    List[id]["old"].map((temp, tId) => {
                        List[id]["old"][tId]["active"] = NewOld;
                    });
                }
            });
            this.setState({ collapseSelect: value });
        } else if (old == "old") {
            if (List[id]["old"][oldIndex]["active"]) {
                List[id]["old"][oldIndex]["active"] = false;
                var totl = false;

                List[id]["old"].map((temp, tId) => {
                    if (List[id]["old"][tId]["active"]) totl = true;
                });

                if (!totl) List[id]["status"] = 2;
            } else {
                List[id]["status"] = false;
                List[id]["old"][oldIndex]["active"] = true;
            }

            this.setState({ collapseSelect: false });
        } else {
            List[id]["old"].map((temp, tId) => {
                List[id]["old"][tId]["active"] = false;
            });
            List[id]["status"] = value;
        }

        this.setState({ collapse_shift: List });
    };

    newMethod() {
        //console.log('its diffrent');
    }

    render() {
        // console.log('shiftPopUp', this.state)

        return (
            <React.Fragment>
                <BlockUi tag="div">
                    {" "}
                    {/*blocking={this.state.loading}*/}
                    <form id="partcipant_shift">
                        <div className="row">
                            <div className="col-md-12 py-4 title_sub_modal">Shift</div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12  col-md-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12  col-md-12 P_15_TB text-center">
                                <h1 className="color mb-3">
                                    Roster ID <span> - {"Roster ID"}</span>
                                </h1>
                                <ul className="user_info P_15_T">
                                    <li>
                                        Start Date:{" "}
                                        <span>
                                            {this.state.start_date
                                                ? moment(this.state.start_date).format("DD/MM/YYYY")
                                                : "dd/mm/yyyy"}
                                        </span>
                                    </li>
                                    <li>
                                        End Date{" "}
                                        <span>
                                            {this.state.start_date
                                                ? moment(this.state.end_date).format("DD/MM/YYYY")
                                                : "dd/mm/yyyy"}
                                        </span>
                                    </li>
                                    <li>
                                        Participant: <span>{"Participant"}</span>
                                    </li>
                                    <li>
                                        Title:{" "}
                                        <span> {this.state.title ? this.state.title : "N/A"}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-lg-12  col-md-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12  col-md-12 py-4">
                                <div className="key_color_calendar">
                                    <ul>
                                        <li>
                                            <span className="key_heading">Key:</span>
                                        </li>
                                        <li className="inside_funding pl-4">
                                            <small></small>
                                            <span>inside Funding</span>
                                        </li>
                                        <li className="outside_funding pl-3">
                                            <small></small>
                                            <span>Outside Funding</span>
                                        </li>
                                        <li className="inside_funding_count pl-5">
                                            <small></small>
                                            <span>1:1</span>
                                        </li>
                                        <li className="defaout_funding pl-3">
                                            <small></small>
                                            <span>2:1</span>
                                        </li>
                                        <li className="black_funcing pl-3">
                                            <small></small>
                                            <span>3:1</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-12  col-md-12">
                                <div className="bor_T"></div>
                            </div>
                        </div>

                        <div className="row mt-5">
                            <div className="col-lg-10 col-lg-offset-1">
                                <div className="row">
                                    <div id="calendar-wrap" className="calendar-wrap">
                                        <div className="left_side hidden_date">
                                            <img src="/assets/images/Schedules/calendar_left.svg" />
                                        </div>
                                        <div className="center_box">
                                            <div className="row P_15_b">
                                                <div className="col-md-4"></div>
                                                <div className="col-md-4 text-center">
                                                    <h1 className="month_name"> Roster</h1>
                                                </div>
                                                <div className="col-md-2 col-md-offset-2"></div>
                                            </div>
                                            <table id="calendar" className="calendar_table">
                                                <tbody>
                                                    {this.state.rosterList.map((weekList, index) => (
                                                        <tr className="days" key={index + 1}>
                                                            <SingleDay
                                                                day="Mon"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Mon"]}
                                                            />
                                                            <SingleDay
                                                                day="Tue"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Tue"]}
                                                            />
                                                            <SingleDay
                                                                day="Wed"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Wed"]}
                                                            />
                                                            <SingleDay
                                                                day="Thu"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Thu"]}
                                                            />
                                                            <SingleDay
                                                                day="Fri"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Fri"]}
                                                            />
                                                            <SingleDay
                                                                day="Sat"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Sat"]}
                                                            />
                                                            <SingleDay
                                                                day="Sun"
                                                                addRoster={this.addRoster}
                                                                index={index}
                                                                weekList={weekList["Sun"]}
                                                            />
                                                            {
                                                            // {this.state.update_disableds ? null : (
                                                            //     <td className="roster_border_td">
                                                            //         {(this.state.rosterList.length == index + 1 &&
                                                            //             this.state.rosterList.length != 4) > 0 ? (
                                                            //                 <div>
                                                            //                     {index != 0 ? (
                                                            //                         <span
                                                            //                             className="button_plus__ mb-2"
                                                            //                             onClick={e =>
                                                            //                                 handleRemoveShareholder(
                                                            //                                     this,
                                                            //                                     e,
                                                            //                                     index,
                                                            //                                     "rosterList"
                                                            //                                 )
                                                            //                             }
                                                            //                         >
                                                            //                             <i className="icon icon-decrease-icon Add-2-2"></i>
                                                            //                         </span>
                                                            //                     ) : (
                                                            //                             ""
                                                            //                         )}
                                                            //                     <span
                                                            //                         className="button_plus__"
                                                            //                         onClick={e =>
                                                            //                             this.handleAddShareholder(
                                                            //                                 e,
                                                            //                                 "rosterList",
                                                            //                                 weekList
                                                            //                             )
                                                            //                         }
                                                            //                     >
                                                            //                         <i className="icon icon-add-icons Add-2-1"></i>
                                                            //                     </span>
                                                            //                 </div>
                                                            //             ) : (
                                                            //                 <span
                                                            //                     className="button_plus__"
                                                            //                     onClick={e =>
                                                            //                         handleRemoveShareholder(
                                                            //                             this,
                                                            //                             e,
                                                            //                             index,
                                                            //                             "rosterList"
                                                            //                         )
                                                            //                     }
                                                            //                 >
                                                            //                     <i className="icon icon-decrease-icon Add-2-2"></i>
                                                            //                 </span>
                                                            //             )}
                                                            //     </td>
                                                            // )}
                                                          }
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <div className="row mt-3">
                                                <div className="col-md-12 P_15_T text-center">
                                                    {/* <span className="default_but_remove"><i className="icon icon-invoice invoice_button"></i></span> */}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="right_side hidden_date">
                                            <img src="/assets/images/Schedules/calendar_right.svg" />
                                        </div>
                                    </div>

                                    <div className="col-sm-6 col-sm-offset-3 mt-4">
                                        <div className="row">
                                            <div className="col-md-12 text-center">
                                                {this.state.update_disableds ? (
                                                    ""
                                                ) : (
                                                        <button
                                                            onClick={e => this.saveRoster(e)}
                                                            className="but_submit w-50"
                                                        >
                                                            Save New Roster
                                                        </button>
                                                    )}
                                            </div>
                                            <div className="col-md-12 my-3">
                                                <div className="row">
                                                    {
                                                        // <div className="col-sm-6"> <button type="button"  className="but_submit">Decline Request</button></div>
                                                        // <div className="col-sm-6"> <button type="button"  className="but_submit">Approve Request</button></div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.modal_show ? (
                                        <StartEndTimeModal
                                            modal_show={this.state.modal_show}
                                            selectChange={this.selectChange}
                                            start_time={this.state.start_time}
                                            end_time={this.state.end_time}
                                            index={this.state.index}
                                            day={this.state.day}
                                            saveDateTime={this.saveDateTime}
                                            closeModal={this.closeModal}
                                            loading={this.state.loading}
                                            shiftIndex={this.state.shiftIndex}
                                            editObj={this.state.editObj}
                                            delete_shiftIndex={this.state.delete_shiftIndex}
                                            deleteShiftHandler={this.deleteShiftHandler}
                                        />
                                    ) : null}

                                    {this.state.modal_collapse_shift ? (
                                        <OverlapShifts
                                            modal_show={this.state.modal_collapse_shift}
                                            collapse_shift={this.state.collapse_shift}
                                            checkboxResolveCollapse={this.checkboxResolveCollapse}
                                            collapseSelect={this.state.collapseSelect}
                                            saveRoster={this.saveRoster}
                                            selectChange={this.selectChange}
                                            loading={this.state.loading}
                                        />
                                    ) : null}
                                    {this.state.modal_show_type ? (
                                        <SavingRoster
                                            update_disableds={this.state.update_disableds}
                                            modal_show={this.state.modal_show_type}
                                            saving_type={this.state.is_default}
                                            selectChange={this.selectChange}
                                            saveAndFinish={this.saveAndFinish}
                                            loading={this.state.loading}
                                        />
                                    ) : null}
                                    {this.state.modal_start_end_date ? (
                                        <StartAndEndDateOfRoster
                                            modal_show={this.state.modal_start_end_date}
                                            is_default={this.state.is_default}
                                            selectChange={this.selectChange}
                                            start_date={this.state.start_date}
                                            title={this.state.title}
                                            end_date={this.state.end_date}
                                            check_shift_collapse={this.check_shift_collapse}
                                            closeModal={this.closeStartEndDateModal}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="row d-flex justify-content-end">
                            <div className="col-md-3">
                                <a
                                    className={
                                        this.props.disable ? "btn-1 disable-stage-pointer" : "btn-1"
                                    }
                                    onClick={e => this.final_submit(e)}
                                >
                                    Save And Create Participant
                                </a>
                            </div>
                        </div>
                    </form>
                </BlockUi>
            </React.Fragment>
        );
    }
}
export default ParticipantShiftPopup;
