import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import jQuery from "jquery";
import { postData, handleChangeChkboxInput, handleShareholderNameChange } from '../../../../service/common.js';
import { ToastUndo } from 'service/ToastUndo.js';
import {  toast } from 'react-toastify';

class AddDevices extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    getDeviceLocation = () => {
        postData('recruitment/RecruitmentDevice/get_device_location_list', {}).then((result) => {
            if (result.status) {
                this.setState({ device_locations: result.data })
            }
        });
    }

    componentDidMount() {
        this.getDeviceLocation();
    }
    
    componentWillReceiveProps(newProps){
        if(newProps.EditDeviceData.id){
            this.setState(newProps.EditDeviceData);
        }else{
            this.setState({device_name: '', device_number: '', device_location: '', id: ''})
        }
    }

    saveDevice = (e) => {
        if (e) e.preventDefault()

        var validator = jQuery("#add_device").validate({ ignore: [] });
        if (jQuery("#add_device").valid()) {
            postData('recruitment/RecruitmentDevice/add_edit_device', this.state).then((result) => {
                if (result.status) {
                    this.props.closeModal(true);
                }else{
                    toast.dismiss();
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            });
        }
    }

    render() {
        return (
            <form id="add_device" method="post" autoComplete="off">
                <div className={'customModal ' + (this.props.showModal ? ' show' : '')}>
                    <div className="cstomDialog widBig" style={{ width: " 800px", minWidth: " 800px" }}>

                        <h3 className="cstmModal_hdng1--">
                            {this.props.popUpTitle}
                            <span className="closeModal icon icon-close1-ie" onClick={() => this.props.closeModal(false)}></span>
                        </h3>

                        <div className="row  pd_b_20 mt-5 mb-5 d-flex align-content-end">
                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Devices Name:</label>
                                    <input type="text" name="device_name" className="csForm_control bl_bor" data-rule-required="true" value={this.state.device_name || ''} required onChange={(e) => handleChangeChkboxInput(this, e)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Devices Number:</label>
                                    <input type="text" name="device_number" className="csForm_control bl_bor" data-rule-required="true" value={this.state.device_number || ''} required onChange={(e) => handleChangeChkboxInput(this, e)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Devices Location:</label>
                                    <Select className="custom_select default_validation"
                                        simpleValue={true}
                                        searchable={false} clearable={false}
                                        placeholder="Select Type"
                                        options={this.state.device_locations}
                                        onChange={(e) => this.setState({ device_location: e })}
                                        value={this.state.device_location || ''}
                                        inputRenderer={() => <input type="text" className="define_input" name={"device_location"} required={true} value={this.state.device_location || ''} />}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row bt-1" style={{ paddingTop: "15px" }}>
                            <div className="col-md-12 text-right">
                                <input type='button' className='btn cmn-btn1 new_task_btn' value='Add Devices' onClick={(e) => this.saveDevice(e)} />
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        );
    }
}

export default AddDevices;