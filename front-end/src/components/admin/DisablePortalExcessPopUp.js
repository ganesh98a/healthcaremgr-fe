import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import {Link, Redirect } from 'react-router-dom';
import jQuery from "jquery";
import {postData } from '../../service/common.js';




class DisablePortalExcessPopUp extends Component {
    constructor(props){
        super(props);
        this.state={
            // loading:false
        }
    }
   
    AddDisableNote = () => { 
        this.setState({loading:true});
        if(jQuery('#notes').valid({ignore: []})){
            this.props.disableEnableParticipantAccess(0 , this.state.notes);
        }
    }  
    
    render() {
        // {console.log(this.props)}
        return (
            <div >
                {this.props.showtype=='add_notes' ?
                
                <form style={{position:'relative'}} id="add_device" method="post" autoComplete="off">
                <div className={'customModal ' + (this.props.showModal ? ' show' : '')}>
                    <div className="cstomDialog widBig" style={{ width: " 800px", minWidth: " 800px" }}>
                    <BlockUi tag="div" blocking={this.props.loadingEnable}>

                        <h3 className="cstmModal_hdng1--">
                            Reason
                            <span className="closeModal icon icon-close1-ie" onClick={() => this.props.popClose()}></span>
                        </h3>
                        <form id="notes">
                        <div className="row  pd_b_20 mt-5 mb-5 d-flex align-content-end">
                            <div className="col-md-12">
                                <div className="csform-group">
                                    <label>Note:</label>
                                    <div className="">
                                    <textarea className="csForm_control txt_area brRad10 textarea-max-size bl_bor" maxLength="500" required="true" data-msg-required="Add Note" placeholder="Note" onChange={(e) => this.setState({ notes: e.target.value })}></textarea>
                                    </div>
                                    </div>
                            </div>
                        </div>

                        <div className="row bt-1" style={{ paddingTop: "15px" }}>
                            <div className="col-md-12 text-right">
                                <input type='button' className='btn cmn-btn1 new_task_btn' value='Save' onClick={() => this.AddDisableNote()} />
                            </div>
                        </div>
                        </form>
                </BlockUi> 
                    </div>
                </div>

            </form>
           : 
           <div className={'customModal ' + (this.props.showModal ? ' show' : '')}>
                <div className="cstomDialog widBig" style={{ width: " 800px", minWidth: " 800px" }}>

                    <h3 className="cstmModal_hdng1--">
                        Reason
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.popClose()}></span>
                    </h3>
                    
                    <div className="row  d-flex align-content-end">
                        <div className="col-lg-12">
                            <div className="csform-group"> <label>Disable By:</label> <label>{this.props.popup_notes.fullName}</label></div>
                        </div>
                        </div>
                        <div className="row d-flex align-content-end">
                        <div className="col-lg-12">
                            <div className="csform-group"> <label>Disable date:</label> <label>{this.props.popup_notes.created}</label></div>
                        </div>
                        </div>
                        <div className="row d-flex align-content-end">
                        <div className="col-md-12">
                            <div className="csform-group"> <label>Note:</label>   <label>{this.props.popup_notes.note}</label>                   
                                </div>
                        </div>

                    </div>                   
                </div>
            </div>
                }
            </div>
            
        );
    }
}

export default DisablePortalExcessPopUp;