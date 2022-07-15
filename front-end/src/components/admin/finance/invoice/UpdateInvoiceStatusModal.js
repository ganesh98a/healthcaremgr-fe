import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ScrollArea from "react-scrollbar";
import {InvoicePaymentStatusDropdown} from 'dropdown/FinanceDropdown.js'

class UpdateInvoiceStatusModal extends Component {

    constructor() {
        super();
        this.state = {
        }

    }
render() {
        return (
            <div className={'customModal ' + (this.props.show ? ' show' : '')}>
                <div className="cstomDialog widBig" style={{maxWidth:'600px', minWidth:'600px'}}>

                    <h3 className="cstmModal_hdng1--">
                      Update Invoice Status
                            <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                    <div className="row">
                    <div className="col-lg-4 col-md-4 col-sm-3 w-100">
                        <label>Update Status</label>
                        <div className="sLT_gray left left-aRRow">
                            <Select
                                 simpleValue={true}
                                 name="form-field-name"
                                 value={this.props.details.invoiceStatus}
                                 options={InvoicePaymentStatusDropdown()}
                                 onChange={(value) => this.props.updateStatusData(value)}
                                 clearable={false}
                                 searchable={false}
                            />
                        </div>
                        </div>
                    </div>
                    <div className="row">
                    <div className="col-lg-4 col-md-4 col-sm-3 w-100 text-center mt-5">
                        <span className="btn cmn-btn1 btn_color_avaiable w-40" onClick={()=>this.props.updateInvoiceStatus(this.props.details.invoiceStatus,this.props.details.invoiceId)}>Accept</span>
                        </div>
                    </div>

                   
                </div>
            </div>

        );
    }
}

export default UpdateInvoiceStatusModal;

