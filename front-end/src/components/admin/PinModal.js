import React, { Component } from 'react';

import { BASE_URL } from '../../config.js';
import { checkItsNotLoggedIn, postData, setPinToken, getPinToken, getAllPinToken } from '../../service/common.js';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import Modal from 'react-bootstrap/lib/Modal';
import  'react-block-ui/style.css';
import BlockUi from 'react-block-ui';

class PinModal extends Component {
    constructor(props) {
        super(props);
        //checkItsNotLoggedIn();
        
        this.state = {
            pin: '',
            pinType: 0,
            error: '',
            success_msg: '',
            loading: false,
            returnUrlData:false
            
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState(newProps);
    }
    componentDidMount(newProps) {
        this.setState(this.props);
    }
    
    reset_msg = () => {
        this.setState({success_msg: '', error: '', waiting: ''});
    }
    
    forgottenPin = () => {
           this.reset_msg();
        this.setState({loading: true, waiting: 'Please Wait...'}); 
        postData('admin/Dashboard/forgotten_pin', {pin_type:  this.state.pinType}).then ((result) => {
                if (result.status) {
                        this.setState({success_msg : result.message, error: '', waiting: ''});
                    }else{
                        this.setState({error : result.error, waiting: ''});
                    }
                     
                    this.setState({loading: false});
            });
    }
    
    onSubmit(e){
         e.preventDefault();
           this.reset_msg();
           
       if(this.state.pin){
            let reqData = {};
            let pinType = this.state.pinType;
            reqData['pinData'] = this.state.pin;  
            reqData['pinType'] = pinType;  
            postData('admin/Login/check_pin', reqData).then ((result) => {
                if (result.status) {
                    let oldPinData = getPinToken();
                    let token = result.token;
                    let pinData = oldPinData!= null && oldPinData != '' ? JSON.parse(oldPinData) : {};
                    pinData[pinType] = token;
                    
                    setPinToken(JSON.stringify(pinData)).then((res) => {
                        if(res.status){
                            this.reset_msg();
                            this.setState({modal_show : false, returnUrlData:true});
                        }
                    }); 
                   
                }else{
                    this.reset_msg();
                    this.setState({error : result.error});
                }
            });
       }
    }

    closeModal = ()=>
    {
        this.props.closeModal();
        
        this.setState({pin : '',error:''});
    }

    render() {
        if (this.state.returnUrlData) {
            return <Redirect to={this.state.returnUrl}/>;
        }
        return (
                <React.Fragment>
            <BlockUi className={'block_ui_custom'} tag="div" blocking={this.state.loading}>
            <Modal
               className={"Modal_A "+ this.props.color}
               show={this.state.modal_show}
               onHide={this.handleHide}
               container={this}
               aria-labelledby="contained-modal-title"
             >
              <Modal.Body className="ch_Pin_M">
              <form onSubmit={this.onSubmit.bind(this)}>
              <div className="color R1_TEST_1">Restricted Area: {this.props.moduleHed}</div>
               <div className="lock_icon"><i className="icon icon-lock-icons"></i></div>
                <div className="text text-center bor_TB color by-1">Please Enter Your Credentials</div>
                <div className="six_digit"> 
                <input type="password" name="pin" autoFocus maxLength="6" placeholder="Six Digit Pin" onChange={(e) => this.setState({pin: e.target.value})} value={this.state.pin} /> </div>
                <div className="text-center forgetten_pin mb-2"><a className="color" onClick={this.forgottenPin}>Forgotten PIN?</a></div>    
                <div className="pin_error">{this.state.error}</div>
                <div className="pin_error">{this.state.waiting}</div>
                <div className="Pin_success text-center">{this.state.success_msg}</div>  
                <a className="close_i" onClick={ () => this.closeModal()}><i className="icon icon-cross-icons"></i></a>
              </form>
               </Modal.Body>
            </Modal>
            </BlockUi>
        </React.Fragment>
        );
    }
}
export default PinModal;