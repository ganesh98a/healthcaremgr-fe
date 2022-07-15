import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import Select from 'react-select-plus';

class SavingRoster extends React.Component {
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
                    <div className="text text-left by-1 Popup_h_er_1"><span>Saving new Roster</span>
                    <a onClick={() => this.props.selectChange(false, 'modal_show_type')} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    <h4 className="P_20_T h4_edit__">Would you like to set this as the DEFAULT roster for this Participant?</h4>
                    <div className="row P_15_T">
                        <div className="col-md-5">
                            <Select 
                                clearable={false} 
                                className="custom_select" 
                                simpleValue={true} 
                                searchable={false} 
                                value={this.props.saving_type} 
                                onChange={(e) => this.props.selectChange(e, 'is_default')}
                                options={
                                    [
                                        { label: 'No', value: 1 }, 
                                        { label: 'Yes', value: 2 }]} 
                                // placeholder="Please Select"
                                
                            />
                        </div>
                        <div className="col-md-2">
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-7"></div>
                        <div className="col-md-5 P_15_T">
                            <button onClick={this.props.saveAndFinish} className="but_submit">Finish & Save</button>
                        </div>
                    </div>

                </div>
            </Modal.Body>
        </Modal>
        </div>;
    }
}
export default SavingRoster;