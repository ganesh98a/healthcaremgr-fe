import moment from 'moment';
import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import {Link} from 'react-router-dom';
import jQuery from "jquery";
import { ROUTER_PATH} from 'config.js';
import { checkItsLoggedIn, postData, getRemeber, setRemeber, setLoginToken, setPermission, setLoginTIme, setFullName, toastMessageShow, setUId, setAvatar} from 'service/common.js';
import { LOGIN_SVG, OCS_LOGO} from 'service/OcsConstant.js';
import { connect } from 'react-redux'
import {setHeaderFooterVisibility } from 'actions/PermissionAction.js';
import { 
    IconSettings,
    PageHeaderControl,
    ButtonGroup,
    Button,
    Icon,
    PageHeader, 
    Tabs,
    TabsPanel,
    Card,
    MediaObject,Dropdown,DropdownTrigger
} from '@salesforce/design-system-react';

import  'react-block-ui/style.css';

/**
 * Class: login
 */
class login extends Component {

    /**
     * setting the initial prop values
     */
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            pin: '',
            pin_resent: false,
            gender: 1,
            member_id: '',
            serial: '',
            remember: '',
            loading: false,
            locked_account: false,
            old_account: false,
            error: '',
            success: '',
            uuid_user_type: 1
        }

        checkItsLoggedIn(ROUTER_PATH);
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * when text field values are updated
     */
    handleChange(e) {
        var state = {};
        this.setState({error: ''});
        state[e.target.name] = (e.target.type === 'checkbox' ? e.target.checked : e.target.value);
        this.setState(state);
    }

    /**
     * when pin form is submitted
     */
    onPinSubmit = (e) => {
        e.preventDefault();

        jQuery('#pinform').validate();
        if (!this.state.loading && jQuery('#pinform').valid()) {
            this.setState({loading: true});

            postData('admin/Login/submit_oldlogin_pin', this.state).then((result) => {
                (this.state.remember == 1) ? setRemeber({ email: this.state.email, password: this.state.password }) : setRemeber({ email: '', password: '', pin: this.state.pin, serial: this.state.serial});
                this.setState({loading: false});
                if (result.status == true) {
                     this.setState({success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span>, error: ''});
                    setLoginToken(result.token)
                   
                    setPermission(JSON.stringify(result.permission));
                    setFullName(result.fullname);
                    setUId(result.id);
                    setLoginTIme(moment());
                    window.location = ROUTER_PATH + 'admin/dashboard';

                }
                else if(result.error == "Your account is locked!") {
                    this.setState({locked_account: true});
                }
                else {
                    this.setState({error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span>});
                }
            });
        }
    }

    /**
     * when the login form is submitted
     */
    onSubmit = (e) => {
        e.preventDefault();

        jQuery('#login').validate();
        if (!this.state.loading && jQuery('#login').valid()) {
            this.setState({loading: true});

            postData('admin/Login/check_login', this.state).then((result) => {
                (this.state.remember == 1) ? setRemeber({ email: this.state.email, password: this.state.password, user_type: this.state.password }) : setRemeber({ email: '', password: ''});
                this.setState({loading: false});
                if (result.status) {
                     this.setState({success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span>, error: ''});
                    setLoginToken(result.token)
                    setAvatar(result.avatar || "");
                    setPermission(JSON.stringify(result.permission));
                    setFullName(result.fullname);
                    setUId(result.id);
                    setLoginTIme(moment());
                    window.location = ROUTER_PATH + 'admin/dashboard';

                }
                else if(result.error == "Old account detected" && result.member_id && result.serial) {
                    this.setState({old_account: true, member_id: result.member_id, serial: result.serial});
                }
                else if(result.error == "Your account is locked!") {
                    this.setState({locked_account: true});
                }
                else {
                    this.setState({error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span>});
                }
            });
        }
    }

    /**
     * resending the pin
     */
    resend_oldlogin_pin = () => {
        this.setState({loading: true});
        postData('admin/Login/resend_oldlogin_pin', { member_id: this.state.member_id, email: this.state.email }).then((result) => {
            if (result.status) {
                this.setState({pin_resent: true, serial: result.serial});
                toastMessageShow(result.msg, "s");
            }
            else {
                toastMessageShow(result.error, "e");
            }
        });
        this.setState({loading: false});
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        this.props.setHeaderFooterVisibility(false);
        var loginCookie = getRemeber();
        this.setState({gender: loginCookie.gender});
        this.setState({email: loginCookie.email});
        this.setState({password: loginCookie.password});
    }

    /**
     * displaying pin form when old login is detected
     */
    showOldLoginPin() {
        return <div className="col-md-6 col-md-offset-3">
                <div className="logo text-center">
                    <a href="#"><img className="img-fluid" width="70px" src={OCS_LOGO} /></a>
                </div>
                <div className="limiter">
                    <div className="login_1 justify-content-center">
                        <div className="Smiley text-center">
                            <h2 style={{lineHeight:'40px'}}><span>We have sent an email with pin<br></br>Please check your email!</span></h2>   
                        </div>
                        <div className="col-md-12 d-flex justify-content-center">
                            <div class="glyphicon glyphicon-envelope" style={{'font-size':'12em'}}></div>
                        </div>
                        <form  id="pinform" className="col-md-6 justify-content-center" onSubmit={this.onPinSubmit} noValidate>
                            <div className="">
                                <div className="input_2">
                                    <input className="input_3 required" type="password" name="pin" placeholder="Enter Pin" value={this.state['pin'] || ''}  onChange={this.handleChange} data-rule-required="true" data-placement="top" title={`Enter Pin`}/>
                                </div>

                                <div className="login_but">
                                    <button className="but_login orange" >
                                        Submit
                                    </button>
                                </div>

                                <div className="success_login s_new">{this.state.success}</div>
                                <div className="error_login e_new">{this.state.error}</div>
                            </div>

                            <h5 className="col-md-12 text-center P_30_T text-center for_text justify-content-center"><a href="javascript:void(0)" onClick={(e) => {
                                this.resend_oldlogin_pin()
                            }}>Resend Pin?</a></h5>
                        </form>
                    </div>
                </div>
            </div>
    }

    /**
     * rendering the account locked section with a message
     */
    showAccountLocked() {
        return <div className="col-md-6 col-md-offset-3">
                    <div className="logo text-center">
                        <a href="#"><img className="img-fluid" width="70px" src={OCS_LOGO} /></a>
                    </div>
                    <div className="limiter">
                        <div className="login_1">
                            <div className="Smiley">
                                <h2 style={{color:'red'}}><span>Your account has been locked!<i className="icon icon-smail-big"></i></span></h2>   
                            </div>
                            <div className="col-md-12 d-flex justify-content-center">
                                <div class="glyphicon glyphicon-envelope" style={{'font-size':'12em'}}></div>
                            </div>
                            <div className="col-md-12 d-flex justify-content-center">
                                <h3>Please contact the Admin to unlock your account</h3>
                            </div>
                        </div>
                    </div>
                </div>
    }

    /**
     * displaying the main login form
     */
    showForm() {
        return <div className="col-md-4 col-md-offset-4">
                <div className="logo text-center">
                    <a href="#"><img className="img-fluid" width="70px" src={OCS_LOGO} /></a>
                </div>
                <div className="limiter">
                    <div className="login_1">
                        <div className="Smiley">
                            <h1><span>Login here<i className="icon icon-smail-big"></i></span></h1>   
                        </div>

                        <form  id="login" className="login100-form" onSubmit={this.onSubmit} noValidate>
                            <div className="col-md-12">
                                <div className="User d-flex">
                                    <span><img src={LOGIN_SVG} className="img-fluid align-self-center" alt="IMG"/></span>
                                </div>

                                <div className="input_2">
                                    <input className="input_3" type="email" name="email" placeholder="Email" value={this.state['email'] || ''}  onChange={(e) => this.setState({email: e.target.value.replace(/\s/g, '')})}  data-rule-required="true" data-placement="right" data-msg-email="Enter a valid email"/>
                                </div>

                                <div className="input_2">
                                    <input className="input_3 required" type="password" name="password" placeholder="Password" value={this.state['password'] || ''}  onChange={this.handleChange} data-rule-required="true" data-placement="right" title={`Enter your password`}/>
                                </div>

                                <div className="login_but">
                                    <button className="but_login orange" >
                                        Submit
                                    </button>
                                </div>

                                <div className="success_login s_new">{this.state.success}</div>
                                <div className="error_login e_new">{this.state.error}</div>
                            </div>

                            <h5 className="col-md-12 text-center P_30_T text-center for_text"><Link to={ROUTER_PATH + 'forgot_password'}>Forgot Password?</Link></h5>
                        </form>
                    </div>
                </div>
            </div>
    }

    /**
     * Render the display content
     */
    render() {
        return (
                <div>
                    <BlockUi tag="div" blocking={this.state.loading}>
                        <section className="gradient_color">
                            <div className="container">
                                <div className="row ">
                                    {this.state.locked_account == true ? this.showAccountLocked() : this.state.old_account == true ? this.showOldLoginPin() : this.showForm()}
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

const mapStateToProps = (state) => ({
    showHeaderFooter : state.Permission.showHeaderFooter,
})

const mapDispatchtoProps = (dispach) => ({
    setHeaderFooterVisibility: (status) => dispach(setHeaderFooterVisibility(status)),
})

export default connect(mapStateToProps, mapDispatchtoProps)(login);
