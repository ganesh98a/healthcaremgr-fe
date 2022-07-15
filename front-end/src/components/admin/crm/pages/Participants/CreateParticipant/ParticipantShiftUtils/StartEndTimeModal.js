import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { handleDateChangeRaw } from '../../../../../../../service/common.js';

class StartEndTimeModal extends React.Component {
    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>
                <div className="dis_cell">
                    <div className="text text-left by-1 Popup_h_er_1"><span>Select start and end time of this day</span>
                        <a onClick={this.props.closeModal} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Please set a start and an end time for this day.</h4>

                    <div className="row P_15_T">
                        <div className="col-md-5">
                            <form id="saving_time">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Start:</label>
                                        <span className="required">
                                            <DatePicker
                                                autoComplete={'off'}
                                                onChangeRaw={handleDateChangeRaw}
                                                required={true}
                                                maxTime={(this.props.end_time) ? moment(this.props.end_time) : moment().hours(23).minutes(59)}
                                                minTime={moment().hours(0).minutes(0)} className="text-center"
                                                selected={this.props.start_time ? moment(this.props.start_time) : null}
                                                name="start_time"
                                                onChange={(e) => this.props.selectChange(e, 'start_time')}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                scrollableTimeDropdown
                                                timeIntervals={15}
                                                dateFormat="LT"
                                            />

                                        </span>
                                    </div>
                                    <div className="col-md-6">
                                        <label>End:</label>
                                        <span className="required">
                                            <DatePicker
                                                autoComplete={'off'}
                                                onChangeRaw={handleDateChangeRaw}
                                                required={true}
                                                className="text-center"
                                                selected={this.props.end_time ? moment(this.props.end_time) : null}
                                                name="end_time"
                                                minTime={(this.props.start_time) ? moment(this.props.start_time) : moment().hours(0).minutes(0)}
                                                maxTime={moment(this.props.start_time, 'DD-MM-YYYY').hours(23).minutes(59)}
                                                onChange={(e) => this.props.selectChange(e, 'end_time')}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                scrollableTimeDropdown
                                                timeIntervals={15}
                                                dateFormat="LT"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col-md-2">
                        </div>
                    </div>

                    <div className="row P_15_T d-flex" style={{justifyContent:'flex-end'}}>
                        
                            {
                                
                                this.props.delete_shiftIndex !==false?
                                <div className="col-md-2">
                                <button 
                                onClick={(e) => this.props.deleteShiftHandler(e, this.props.shiftIndex, this.props.index, this.props.day)} 
                                className="btn btn-danger w-100"
                                style={{lineHeight: '15px',padding: '12px 15px',fontSize: '17px',fontWeight: 'normal',border: 'none'}}
                                >Delete</button>
                                </div>
                                :null
                            }
                        
                        <div className="col-md-5 ">
                            <button 
                            disabled={this.props.loading} 
                            className="but_submit" 
                            onClick={(e) => this.props.saveDateTime(e, this.props.shiftIndex, this.props.index, this.props.day)}>
                                Save & Continue
                                </button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        </div>;
    }
}

export default StartEndTimeModal;