import React, { Component } from 'react';
import moment from 'moment-timezone';
import { checkItsNotLoggedIn, checkPin, postData, setPinToken } from 'service/common.js';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import Modal from 'react-bootstrap/lib/Modal';
import 'react-block-ui/style.css';
import BlockUi from 'react-block-ui';
import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { custNumberLine, customHeading, customNavigation } from 'service/CustomContentLoader.js';

class DottedLine extends React.Component {
    render() {
        return <div className="row f_color_size py-3">
            <div className="col-lg-3 col-md-3 f align_e_2"></div>
            <div className="col-lg-9 col-md-9 f align_e_1 dotted_line"></div>
        </div>;
    }
}

class ShortShiftDetails extends Component {
    constructor(props) {
        super(props);
        this.shiftStatus = { 1: 'Unfilled', 2: 'Unconfirmed', 5: 'Cancelled', 7: 'Confirmed', 6 : "Completed" }
        this.state = {
            loading: false,
            location: [],
            allocated_member: []
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.shiftId && newProps.openShit) {
            this.get_shift_details(newProps.shiftId);
        }
    }

    get_shift_details = (shiftId) => {
        this.setState({ loading: true })
        postData('schedule/Shift_Schedule/get_short_shift_details', { id: shiftId }).then((result) => {
            if (result.status) {
                this.setState(result.data)
                this.setState({ loading: false })
            } else {
                this.setState({ error: result.error });
            }
        });
    }

    render() {
        return (
            <div>
                <Modal
                    className={"Modal_A " + this.props.color + " width_700"}
                    show={this.props.openShit}
                    onHide={this.handleHide}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <div className="dis_cell CSD_modal">
                            <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(40)} ready={!this.state.loading}>
                                <div className="text text-left Popup_h_er_1">
                                    <span>Shift Details</span>
                                    <a onClick={this.props.closeModel} className="close_i"><i className="icon icon-cross-icons"></i></a>
                                </div>
                            </ReactPlaceholder>
                            <div className="row mt-5">
                                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={custNumberLine(7)} ready={!this.state.loading}>

                                    <ShowShiftsDetails labelName={'Shift Date:'}>{moment(this.state.shift_date).format('DD/MM/YYYY')}</ShowShiftsDetails>
                                    <ShowShiftsDetails labelName={'Start Time:'}>{moment(this.state.start_time).format('LT')}</ShowShiftsDetails>
                                    <ShowShiftsDetails labelName={'End Time:'}>{moment(this.state.end_time).format('LT')}</ShowShiftsDetails>
                                    <ShowShiftsDetails labelName={'Duration:'}>{this.state.duration}</ShowShiftsDetails>
                                    {this.state.location.map((val, index) => (
                                        <ShowShiftsDetails labelName={'Location:'}>{val.site}</ShowShiftsDetails>
                                    ))
                                    }
                                    <ShowShiftsDetails labelName={'Status:'}>{this.shiftStatus[this.state.status]}</ShowShiftsDetails>
                                    {this.state.allocated_member.map((val, index) => (
                                        <ShowShiftsDetails labelName={'Allocated To:'}>{val.memberName} {(val.preferred == 1) ? '- Preferred' : ''}</ShowShiftsDetails>
                                    ))
                                    }

                                    {/* <div className="row f_color_size">
                                        <div className="col-lg-3 col-md-3 f align_e_2">Shift Date:</div>
                                        <div className="col-lg-7 col-md-7 f align_e_1">{moment(this.state.shift_date).format('DD/MM/YYYY')}</div>
                                    </div>
                                    <DottedLine />
                                    <div className="row f_color_size">
                                        <div className="col-lg-3 col-md-3 f align_e_2">Start Time:</div>
                                        <div className="col-lg-7 col-md-7 f align_e_1">{moment(this.state.start_time).format('LT')}</div>
                                    </div>
                                    <DottedLine />
                                    <div className="row f_color_size">
                                        <div className="col-lg-3 col-md-3 f align_e_2">End Time:</div>
                                        <div className="col-lg-7 col-md-7 f align_e_1">{moment(this.state.end_time).format('LT')}</div>
                                    </div>
                                    <DottedLine />
                                    <div className="row f_color_size">
                                        <div className="col-lg-3 col-md-3 f align_e_2">Duration: </div>
                                        <div className="col-lg-7 col-md-7 f align_e_1">{this.state.duration}</div>
                                    </div>
                                    {this.state.location.map((val, index) => (
                                        <div>
                                            <DottedLine />
                                            <div className="row f_color_size">
                                                <div className="col-lg-3 col-md-3 f align_e_2">Location: </div>
                                                <div className="col-lg-7 col-md-7 f align_e_1">{val.site}</div>
                                            </div>
                                        </div>

                                    ))
                                    }
                                    <div>
                                        <DottedLine />
                                        <div className="row f_color_size">
                                            <div className="col-lg-3 col-md-3 f align_e_2">Status: </div>
                                            <div className="col-lg-7 col-md-7 f align_e_1">{this.shiftStatus[this.state.status]}</div>
                                        </div>
                                    </div>
                                    {this.state.allocated_member.map((val, index) => (
                                        <div>
                                            <DottedLine />
                                            <div className="row f_color_size">
                                                <div className="col-lg-3 col-md-3 f align_e_2">Allocated To: </div>
                                                <div className="col-lg-7 col-md-7 f align_e_1">{val.memberName} {(val.preferred == 1) ? '- Preferred' : ''}</div>
                                            </div>
                                        </div>
                                    ))
                                    } */}

                                    <div className="row pt-5 pb-4 d-flex justify-content-center">
                                        <div className="col-md-4"><a className="but" target="_blank" href={"/admin/schedule/details/" + this.props.shiftId}>View Details</a></div>
                                    </div>
                                </ReactPlaceholder>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

            </div>
        );
    }
}

const ShowShiftsDetails = (props) => {
    return (
        <div className="col-sm-12 mt-4 d-flex">
            <label className="w-50 label_2_1_1 f-bold text-right mb-0">{props.labelName}</label>
            <div className="w-50 f-14 align-self-center">
                {props.children}
            </div>
        </div>
    )
}



export default ShortShiftDetails;

