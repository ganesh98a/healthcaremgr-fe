import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import { Link, Redirect } from 'react-router-dom';
import jQuery from "jquery";

import { postData, handlePasswordChangeProgress } from '../../service/common.js';
import moment from 'moment';
import { LOGIN_SVG, OCS_LOGO } from '../../service/OcsConstant.js';
import PasswordProgressRing from './PasswordProgressRing';

class PasswordAndPin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            pin: '',
            confirm_password: '',
            loading: false,
            success: '',
            validating: false,
            validateMassage: '',
            resetTrue: false,
            pin_access: false,
            valueForChar: 0,
            alphaNumeric: 0,
            specialChar: 0,
            iconForChar: false,
            iconForAlphaNumeric: false,
            iconForSpecialChar: false,
            uuid_user_type: 1
        }

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleChange(e) {
        var state = {};
        this.setState({ error: '' });
        state[e.target.name] = (e.target.value);
        this.setState(state);
        if (e.target.name == 'password') {
            handlePasswordChangeProgress(this, e.target.value);
        }
    }

    onSubmit(e) {
        e.preventDefault();

        jQuery('#reset_password').validate();
        if (!this.state.loading && jQuery('#reset_password').valid()) {
            this.setState({ loading: true, error: '', success: '' });
            var resetData = { password: this.state.password, id: this.props.match.params.id, token: this.props.match.params.token, pin: this.state.pin, uuid_user_type: this.state.uuid_user_type };
            postData('admin/Login/reset_password_pin', resetData).then((result) => {
                this.setState({ loading: false });
                if (result.status) {
                    this.setState({ success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span> });
                    setTimeout(() => this.setState({ resetTrue: true }), 2000);
                } else {
                    this.setState({ error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span> });
                }
            });

        }
    }

    componentDidMount() {
        localStorage.clear()
        this.setState({ validateMassage: <span><h2 className="text-center">Please wait..</h2><p className="text-center">we are validating your request</p></span> })
        postData('admin/Login/verify_generate_password_pin_token', this.props.match.params).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                this.setState({ validating: true });
                this.setState({ error: '' });
                this.setState({ success: result.success });
                this.setState({ 'pin_access': result.pin_access, username: result.data.firstname + ' ' + result.data.lastname })
            } else {
                this.setState({ validateMassage: <h2 className="text-center">{result.error}</h2> });
            }
        });
    }

    render() {
        return (
            <div>
                {(this.state.resetTrue) ? <Redirect to='/' /> : ''}
                <BlockUi tag="div" blocking={this.state.loading}>
                    <section className="gradient_color">

                        <div className="container">
                            <div className="row">
                                <div className="col-md-5 col-md-offset-4 maxwidset">



                                    <div className="limiter">
                                        <div className="login_1">
                                            <div className="Smiley">
                                                <h1 className="text-center">
                                                    <span>Sign up!&nbsp;<i className="icon icon-smail-big"></i></span>

                                                    <div className="logo text-center"><img alt="logo" className="img-fluid" width="70px" src={OCS_LOGO} /></div>
                                                </h1> </div>

                                            <div className="col-md-12 bordset mt-5">
                                                {/*  <div className="User d-flex">
                                                        <span><img src={LOGIN_SVG} className="img-fluid align-self-center" alt="IMG"/></span>
                                                    </div> */}
                                                {(this.state.validating) ?
                                                    <form id="reset_password" className="login100-form" >

                                                        <PasswordProgressRing {...this.state} />
                                                        <div className="input_2">
                                                            <input className="input_3" id="password" type="password" name="password" placeholder="New password" onChange={this.handleChange} value={this.state.password}
                                                                data-rule-required="true" data-placement="right" />
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" type="password" name="confirm_password" placeholder="Confirm password" onChange={this.handleChange} value={this.state.confirm_password} data-rule-required="true" data-rule-equalto="#password" data-msg-equalto="Please enter same password as above" data-placement="right" />
                                                        </div>

                                                        {(this.state.pin_access) ?
                                                            <div>

                                                                <div className="mt-5 title_pin01__">
                                                                    <h2>
                                                                        <span>Restricted Area Pin</span>
                                                                    </h2>
                                                                </div>


                                                                <div className="input_2">
                                                                    <input className="input_3" id="pin" type="password" name="pin" placeholder="New pin" onChange={this.handleChange} value={this.state.pin} min-length="6" data-rule-required="true" data-rule-number="true" data-placement="right" maxlength="6" />
                                                                </div>
                                                                <div className="input_2">
                                                                    <input className="input_3" type="password" name="confirm_pin" placeholder="Confirm pin" onChange={this.handleChange} value={this.state.confirm_pin} data-rule-required="true" data-rule-equalto="#pin" data-msg-equalto="Please enter same pin as above" data-placement="right" maxlength="6" />
                                                                </div>
                                                            </div>

                                                            : ''}

                                                        <div className="login_but">
                                                            <button onClick={this.onSubmit} className="but_login orange" disabled={this.state.iconForChar && this.state.iconForAlphaNumeric && this.state.iconForSpecialChar ? false : true}>Save password</button>
                                                        </div>

                                                        <span className="success_login s_new text-center">{this.state.success}</span>

                                                        <span className="text-center e_new error_login">{this.state.error}</span>
                                                    </form>
                                                    : <div>{this.state.validateMassage} </div>
                                                }


                                            </div>
                                            <h5 className="col-md-12 text-center P_30_T text-center for_text button_small"><Link to={'/'}>Login here</Link></h5>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <footer className="text-center">
                        <div className="container">
                            <div className="row">
                                <h6>© {moment().format("YYYY")} All Rights Reserved <span>ONCALL</span></h6>
                            </div>
                        </div>
                    </footer>
                </BlockUi>
            </div>
        );
    }
}
export default PasswordAndPin;