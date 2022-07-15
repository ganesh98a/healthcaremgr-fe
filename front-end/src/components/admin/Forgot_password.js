import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import {Link } from 'react-router-dom';
import jQuery from "jquery";
import moment from 'moment';
import { ROUTER_PATH } from '../../config.js';
import { checkItsLoggedIn, postData } from '../../service/common.js';
import { LOGIN_SVG, OCS_LOGO} from '../../service/OcsConstant.js';

class Forgot_password extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            error: '',
            loading: false,
            success: '',
            uuid_user_type: 1
        }
        
        checkItsLoggedIn();
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({email: e.target.value});
        this.setState({error: ''});
        this.setState({success: ''});
    }

    onSubmit(e) {
        e.preventDefault();
       jQuery('#forget_password').validate();
        if (!this.state.loading && jQuery('#forget_password').valid()) {
            this.setState({loading: true, error: ''});

            postData('admin/Login/request_reset_password',{email: this.state.email,type: 'forgot_password', user_type: this.state.user_type, uuid_user_type: 1}).then((result) => {
                this.setState({loading: false});
                if (result.status) {
                     this.setState({success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span>, email : ''});
                } else {
                    this.setState({error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span>});
                }
                this.setState({loading: false});
            });
        }
    }

    render() {
        return (
                <div>
                    <BlockUi tag="div" blocking={this.state.loading}>
        <section className="gradient_color">
                     
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-4 col-md-offset-4">
                
                                        <div className="logo text-center"><img alt="logo" className="img-fluid" width="70px" src={OCS_LOGO}/></div>
                
                                        <div className="limiter">
                                            <div className="login_1">
                                                <div className="Smiley">
                                                    <h1><span>Forgot Password&nbsp;<i className="icon icon-smail-big"></i></span></h1>
                                                </div>
                
                                                <form id="forget_password" className="login100-form" >
                                                    <div className="col-md-12">
                                                        <div className="User d-flex">
                                                            <span><img src={LOGIN_SVG} className="img-fluid align-self-center" alt="IMG"/></span>
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" type="text" name="email" placeholder="Enter email address"  onChange={(e) => this.setState({email: e.target.value.replace(/\s/g, '')})}  value={this.state.email} data-rule-required="true" data-rule-email="true" />
                                                        </div>
                                                        <div className="login_but">
                                                            <button onClick={this.onSubmit} className="but_login orange">
                                                                Request
                                                            </button>
                                                        </div>
                
                                                         <div className="success_login s_new">{this.state.success}</div>
                                                            <div className="error_login e_new">{this.state.error}</div>
                                                    </div>
                                                    <h5 className="col-md-12 text-center P_30_T text-center for_text button_small"><Link to={ROUTER_PATH} >Login here</Link></h5>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                
                        <footer className="text-center">
                            <div className="container">
                                <div className="row">
                                    <h6>© {moment().format("YYYY")} All Rights Reserved <span>Healthcare Manager</span></h6>
                                </div>
                            </div>
                        </footer>
                    </BlockUi>
                </div>
                            );
            }
}
export default Forgot_password;