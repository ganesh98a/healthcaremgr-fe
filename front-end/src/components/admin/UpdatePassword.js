import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import { Redirect } from 'react-router-dom';
import jQuery from "jquery";
import { checkItsNotLoggedIn, postData, logout, handlePasswordChangeProgress } from '../../service/common.js';
import PasswordProgressRing from './PasswordProgressRing';
class UpdatePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueForChar: 0,
            alphaNumeric: 0,
            specialChar: 0,
            iconForChar: false,
            iconForAlphaNumeric: false,
            iconForSpecialChar: false,
            username: localStorage.getItem("user_name"),
            uuid_user_type: 1,
        }
        checkItsNotLoggedIn();
    }

    handleChange = (e) => {
        var state = {};
        state[e.target.name] = (e.target.value);
        this.setState(state);
        if (e.target.name == 'new_password') {
            handlePasswordChangeProgress(this, e.target.value);
        }
    }

    onSubmit = (e) => {
        e.preventDefault();

        jQuery('#update_password').validate();
        if (jQuery('#update_password').valid()) {
            this.setState({ loading: true, error: '', success: '' });

            postData('admin/Dashboard/update_password', this.state).then((result) => {
                this.setState({ loading: false });
                if (result.status) {
                    this.setState({ success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span> });
                    setTimeout(() => logout(), 2000);
                } else {
                    this.setState({ error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span> });
                }
            });



        }
    }

    componentDidMount() {

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
                                                <h1>
                                                    <span>Update Password&nbsp;<i className="icon icon-smail-big"></i></span>
                                                    <div className="logo text-center"><img alt="logo" className="img-fluid" width="70px" src="/assets/images/admin/kye_icon.svg" /></div>
                                                </h1>
                                            </div>
                                            <div class="col-md-12 bordset mt-4">
                                                <div className="col-md-12">
                                                    <div class="mb-3">
                                                        <PasswordProgressRing {...this.state} />
                                                        <form id="update_password" className="login100-form" >
                                                            <div className="input_2">
                                                                <input className="input_3" type="password" name="password" placeholder="Confirm Current"
                                                                    onChange={this.handleChange} value={this.state.password || ''} data-rule-required="true" data-placement="right" />
                                                            </div>
                                                            <div className="input_2">
                                                                <input className="input_3" id="password" type="password" name="new_password"
                                                                    placeholder="Enter New" onChange={this.handleChange} value={this.state.new_password || ''} data-rule-required="true" data-placement="right" />
                                                            </div>
                                                            <div className="input_2">
                                                                <input className="input_3" type="password" name="confirm_password" placeholder="Confirm password" onChange={this.handleChange} value={this.state.confirm_password} data-rule-required="true" data-rule-equalto="#password" data-msg-equalto="Please enter same password as above" data-placement="right" />
                                                            </div>
                                                            <div className="login_but">
                                                                <button onClick={this.onSubmit} className="but_login orange" disabled={this.state.iconForChar && this.state.iconForAlphaNumeric && this.state.iconForSpecialChar && !this.state.loading ? false : true}>Save New Password</button>
                                                            </div>
                                                            <span className="success_login s_new text-center">{this.state.success}</span>
                                                            <span className="text-center e_new error_login">{this.state.error}</span>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                </BlockUi>
            </div>
        );
    }
}
export default UpdatePassword;
