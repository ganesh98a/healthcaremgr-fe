
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { handleDateChangeRaw } from '../../../../../../../service/common.js';


class StartAndEndDateOfRoster extends React.Component {
    render() {
        return <div><Modal
            className="Modal fade Modal_A Modal_B Crm"
            show={this.props.modal_show}
            onHide={this.handleHide}
            container={this}
            aria-labelledby="contained-modal-title"
        >
            <Modal.Body>
                <div className="dis_cell">
                    <div className="text text-left by-1 Popup_h_er_1"><span>Saving New Roster</span>

                        <a 
                        onClick={this.props.closeModal}
                        // onClick={() => this.props.selectChange(false, 'modal_start_end_date')} 
                        className="close_i">
                            <i className="icon icon-cross-icons"></i
                        ></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Please set a start {(this.props.is_default == 1) ? 'and an end date' : ''} for this roster.</h4>

                    <div className="row P_15_T">
                        <div className="col-md-5">
                            <form id="saving_roster">
                                <div className="row">
                                    {(this.props.is_default == 1) ?
                                        <div className="col-md-6">
                                            <label>Title</label>
                                            <span className="required">
                                                <input 
                                                type="text" 
                                                required={true} 
                                                name="title" 
                                                value={this.props.title || ''} 
                                                onChange={(e) => this.props.selectChange(e.target.value, 'title')} />
                                            </span>
                                        </div> : ''}
                                    <div className="col-md-6">
                                        <label>Start:</label>
                                        <span className="required">
                                            <DatePicker
                                                autoComplete={'off'}
                                                onChangeRaw={handleDateChangeRaw}
                                                required={true}
                                                dateFormat="dd-MM-yyyy"
                                                maxDate={(this.props.end_date) ? moment(this.props.end_date) : null}
                                                minDate={moment()} 
                                                className="text-center"
                                                selected={this.props.start_date ? moment(this.props.start_date) : null}
                                                name="start_date"
                                                onChange={(e) => this.props.selectChange(e, 'start_date')}
                                            />
                                        </span>
                                    </div>
                                    {(this.props.is_default == 1) ?
                                        <div className="col-md-6 mt-3">
                                            <label>End:</label>
                                            <span className="required">
                                                <DatePicker
                                                    autoComplete={'off'}
                                                    onChangeRaw={handleDateChangeRaw}
                                                    required={true}
                                                    dateFormat="dd-MM-yyyy"
                                                    className="text-center"
                                                    selected={this.props.end_date ? moment(this.props.end_date) : null}
                                                    name="end_date" 
                                                    minDate={(this.props.start_date) ? moment(this.props.start_date) : moment()}
                                                    onChange={(e) => this.props.selectChange(e, 'end_date')}
                                                />
                                            </span>
                                        </div> : ''}
                                </div>
                            </form>
                        </div>

                        <div className="col-md-2">
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-7"></div>
                        <div className="col-md-5 P_15_T">
                            <button className="but_submit" onClick={(e) => this.props.check_shift_collapse(e, true)}>Save & Continue</button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        </div>;
    }
}

export default StartAndEndDateOfRoster;