import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ScrollArea from 'react-scrollbar';
import { postData,handleChangeChkboxInput } from '../../../service/common.js';
import jQuery from "jquery";

class AddDocuments extends Component {

    constructor() {
        super();
        this.state = {
            
        }
    } 

    render() {
        return (
            <div className={'customModal ' + (this.props.showModal? ' show' : '')}>
                <div className="cstomDialog widBig" style={{minWidth:'600px', maxWidth: "600px"}}>
                    <h3 className="cstmModal_hdng1--">
                        Add Document <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModal}></span>
                    </h3>
                    <form id="AddDocsForm" method="post" autoComplete="off">
                        <div className="row Manage_div_1">

                            <div className="dis_cell-1 w-100">
                                <div className="P_15_T" >
                                <div className="col-md-8">
                                    <label>Document Name: </label>
                                    <span className="required">
                                        <input type="text"  data-rule-required="true" className="text-center" placeholder="Document Name" name="document_name" value={this.state.document_name} onChange={(e) => this.props.handleDocumentOnChange(e)}/>
                                    </span>
                                </div>  
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-12">
                                <div className="bt-1"></div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <button disabled={this.state.loading}  className="btn cmn-btn1 creat_task_btn__" onClick={(e)=>this.props.addDocuments(e)}>Save Changes</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
export default AddDocuments;

