import React, { Component } from 'react';

import { postData, handleDateChangeRaw } from 'service/common.js';
import moment from 'moment';
import 'react-select-plus/dist/react-select-plus.css';
import Modal from 'react-bootstrap/lib/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jQuery from "jquery";
import DatePicker from 'react-datepicker';
import "react-placeholder/lib/reactPlaceholder.css";
import { connect } from 'react-redux'
import { ToastUndo } from 'service/ToastUndo.js'

class UpdateShiftDateTImePopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentWillReceiveProps(newProps) {
        this.setState(newProps);
    }
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        if (fieldname == 'start_time') {
            var difference = this.getTimeDifferInHours();

            if (difference > 24 || difference < 0) {
                state['end_time'] = '';
            }
        }
        this.setState(state);
    }

    getTimeDifferInHours = () => {
        var start_time = moment(this.state.start_time);
        var end_time = moment(this.state.end_time);

        const diff = end_time.diff(start_time);
        const diffDuration = moment.duration(diff);
        var dayHours = diffDuration.days() * 24
        return diffDuration.hours() + dayHours;
    }

    onSubmit = (e) => {
        e.preventDefault()
        jQuery('#updateDate').validate();
        if (jQuery('#updateDate').valid()) {
            var difference = this.getTimeDifferInHours();

            if (difference > 24) {
                toast.error(<ToastUndo message={"Shift duration can be maximum 24 hours."} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                return false;
            } else if (difference < 0) {
                toast.error(<ToastUndo message={"Please check start date time and end date time."} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                return false;
            }

            this.setState({ loading: true }, () => {
                postData('schedule/ScheduleDashboard/update_shift_date_time', this.state).then((result) => {
                    if (result.status) {
                        toast.success(<ToastUndo message={'Updated shift date/time successfully'} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });

                        this.props.closeModel('date_time', true)
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                    }
                    this.setState({ loading: false })
                });
            });
        }
    }

    startDateTime = () => {
        return <DatePicker autoComplete={'off'} dateFormat="dd-MM-yyyy h:mm a" autoComplete="new-password" onChangeRaw={handleDateChangeRaw} placeholderText={"00/00/0000 00:00"} className="text-left"
            selected={this.state.start_time} name="start_time" onChange={(e) => this.selectChange(e, 'start_time')}
            timeIntervals={15} showTimeSelect timeCaption="Time" required={true} name="start_time"
            maxDate={(this.state.end_time) ? moment().add(60, 'days') : moment().add(60, 'days')}
            minDate={moment()}
            minTime={moment().hours(0).minutes(0)}
            maxTime={(this.state.end_time <= this.state.start_time) ? moment(this.state.end_time) : moment().hours(23).minutes(59)} minTime={moment().hours(0).minutes(0)} />
    }

    endDateTime = () => {
        return <DatePicker autoComplete={'off'} dateFormat="dd-MM-yyyy h:mm a" autoComplete="new-password" onChangeRaw={handleDateChangeRaw} placeholderText={"00/00/0000 00:00"} className="text-left"
            selected={this.state.end_time} name="end_time" onChange={(e) => this.selectChange(e, 'end_time')}
            showTimeSelect timeIntervals={15} timeCaption="Time" required={true} name="end_time"
            minDate={this.state.start_time ? moment(this.state.start_time) : moment()} maxDate={(this.state.start_time) ? moment(this.state.start_time).add(1, 'days') : moment().add(60, 'days')}
            minTime={(moment(this.state.start_time).format("DD-MM-YYYY") == moment(this.state.end_time).format("DD-MM-YYYY")) ? moment(this.state.start_time) : moment().hours(0).minutes(0)}
            maxTime={moment().hours(23).minutes(59)} />
    }

    render() {
        return (

            <Modal
                className="Modal fade Modal_A Modal_B Schedule_Module"
                show={this.props.modal_show}
                onHide={this.handleHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>
                    <form id="updateDate">
                        <div className="text text-left by-1 Popup_h_er_1"><span>Update Shift Date and Time</span>
                            <a onClick={() => this.props.closeModel('date_time', false)} className="close_i"><i className="icon icon-cross-icons"></i></a>
                        </div>
                        <div className="row P_25_T">
                            <div className="col-lg-6 col-sm-6">
                                <label>Start Date Time:</label>
                                <span className="required">
                                    {this.startDateTime()}
                                </span>
                            </div>
                            <div className="col-lg-6 col-sm-6">
                                <label>End Date Time:</label>
                                <span className="required">
                                    {this.endDateTime()}
                                </span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-5 P_15_T pull-right">
                                <button disabled={this.state.loading} onClick={this.onSubmit} className="but_submit but_cancel">Update</button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        )
    }
}

const mapStateToProps = state => ({

})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(UpdateShiftDateTImePopUp)