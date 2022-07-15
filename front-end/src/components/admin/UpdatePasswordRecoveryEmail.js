import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import {  Redirect } from 'react-router-dom';
import jQuery from "jquery";


import { checkItsNotLoggedIn, postData } from '../../service/common.js';


class UpdatePasswordRecoveryEmail extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            
        }
        checkItsNotLoggedIn();
    }

    handleChange = (e) => {
        var state = {};
        state[e.target.name] = (e.target.value);
        this.setState(state);
    }

    onSubmit = (e) => {
        e.preventDefault();
        
        jQuery('#update_email').validate();
        if (jQuery('#update_email').valid()) {
            this.setState({loading: true, error: '', success: ''});


            postData('admin/Dashboard/update_password_recovery_email', this.state).then((result) => {
                this.setState({loading: false});
                if (result.status) {
                    this.setState({success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span>});
                    this.setState({error: '', email: '', confirm_email: '', password: ''});
                } else {
                    this.setState({error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span>});
                }
            });

        }
    }

    componentDidMount() {
       
    }

    render() {
        return (
                <div>
              
                {(this.state.resetTrue)? <Redirect to='/'  />:''}
                    <BlockUi tag="div" blocking={this.state.loading}>
            <section className="gradient_color">
            <div className="container-fluid fixed_size">
            <div className="col-md-10 col-md-offset-1">
                            
                         
                            <div className="row d-flex w-100 justify-content-center mt-5">
                            <div className="col-md-9 mt-5">
                                 <div className="H_B_1">Update Password Recovery Email</div>
                            </div>
                            </div>

                             <form id="update_email" className="login100-form" >
                                <div className="row">
                                <div className="col-md-8 col-md-offset-2 text-center Pass_Ma1"><img src="/assets/images/admin/kye_icon.svg" /></div>
                                    <div className="col-md-8 col-md-offset-2">
                                          <div className="limiter">
                                            <div className="login_1">
                                               <div className="col-md-6">
                                                        <div className="input_2">
                                                            <input className="input_3" id="email" type="text" name="email" 
                                                            placeholder="Enter Email" onChange={this.handleChange} value={this.state.email || ''}  data-rule-required="true" data-placement="right" />
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" type="text" name="confirm_email" placeholder="Confirm Email" 
                                                            onChange={this.handleChange} value={this.state.confirm_email || ''} data-rule-required="true" data-rule-equalto="#email"  data-placement="right" />
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" type="password" name="password" 
                                                            placeholder="Enter password" onChange={this.handleChange} value={this.state.password || ''}  data-rule-required="true" data-placement="right" />
                                                        </div>
                                                     
                                                      <div className="col-md-10 col-md-offset-1">
                                                            <div className="login_but"><button disabled={this.state.loading} onClick={this.onSubmit} className="but_login orange">Update Email</button></div>
                                                      </div>
                                                      
                                                      <div className="success_login s_new w-100 d-inline-block">{this.state.success}</div>
                                                      <div className="error_login e_new w-100 d-inline-block">{this.state.error}</div>
                                                 </div>
                                             </div>
                                        </div>
                                    </div>
                                </div>
                                 </form>
                            </div>
                            </div>
                        </section>
                
                    </BlockUi>
                   
                </div>
                            );
            }
}
export default UpdatePasswordRecoveryEmail;
