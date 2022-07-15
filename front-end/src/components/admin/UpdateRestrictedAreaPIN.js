import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import { Redirect } from 'react-router-dom';
import jQuery from "jquery";


import { checkItsNotLoggedIn, postData } from '../../service/common.js';


class UpdateRestrictedAreaPIN extends Component {
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
        
        jQuery('#update_pin').validate();
        if (jQuery('#update_pin').valid()) {
            this.setState({loading: true, error: '', success: ''});


            postData('admin/Dashboard/update_pin', this.state).then((result) => {
                this.setState({loading: false});
                if (result.status) {
                    this.setState({error: '', pin: '', new_pin: '', confirm_pin: ''});
                    this.setState({success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span>});
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
                                 <div className="H_B_1">Update your Restricted Area PIN</div>
                            </div>
                            </div>

                                <form id="update_pin" className="login100-form" >
                                <div className="row">
                                <div className="col-md-8 col-md-offset-2 text-center Pass_Ma1"><img src="/assets/images/admin/kye_icon.svg" /></div>
                                    <div className="col-md-8 col-md-offset-2">
                                          <div className="limiter">
                                            <div className="login_1">
                                               <div className="col-md-6">
                                                      
                                                       <div className="input_2">
                                                            <input className="input_3"  type="password" name="pin" placeholder="Confirm Current" 
                                                            onChange={this.handleChange} value={this.state.pin} data-rule-required="true" data-placement="right" />
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" id="password" type="password" name="new_pin" 
                                                            placeholder="Enter New" onChange={this.handleChange} value={this.state.new_pin} data-rule-number="true" data-rule-required="true" data-rule-minlength="6" data-placement="right" />
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" type="password" name="confirm_pin" placeholder="Confirm New" 
                                                            onChange={this.handleChange} value={this.state.confirm_pin} data-rule-required="true" data-rule-equalto="#password" data-msg-equalto="Please enter same password as above" data-placement="right" />
                                                        </div>
                                                      
                                                      <div className="col-md-10 col-md-offset-1">
                                                            <div className="login_but"><button disabled={this.state.loading} onClick={this.onSubmit} className="but_login orange">Save New Pin</button></div>
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
export default UpdateRestrictedAreaPIN;
