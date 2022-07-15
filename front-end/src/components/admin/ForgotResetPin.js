import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import {Link, Redirect } from 'react-router-dom';
import jQuery from "jquery";
import { connect } from 'react-redux'

import {postData } from '../../service/common.js';
import {setHeaderFooterVisibility } from 'actions/PermissionAction.js';
import moment from 'moment';
import { LOGIN_SVG, OCS_LOGO} from '../../service/OcsConstant.js';

class Reset_password extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pin: '',
            confirm_pin: '',
            loading: false,
            success: '',
            validating: false,
            validateMassage: '',
            resetTrue: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleChange(e) {
        var state = {};
        this.setState({error: ''});
        state[e.target.name] = (e.target.value);
        this.setState(state);
    }

    onSubmit(e) {
        e.preventDefault();
        
        jQuery('#reset_password').validate();
        if (!this.state.loading && jQuery('#reset_password').valid()) {
            this.setState({loading: true, error: '', success: ''});

            var resetData = {pin: this.state.pin, id: this.props.match.params.id, token: this.props.match.params.token, dateTime: this.props.match.params.dateTime};

            postData('admin/Login/reset_forgot_pin_token', resetData).then((result) => {
                this.setState({loading: false});
                if (result.status) {
                    this.setState({success: <span><i className="icon icon-input-type-check"></i><div>{result.success}</div></span>});
                    setTimeout(() => this.setState({resetTrue: true}), 2000);
                } else {
                    this.setState({error: <span><i className="icon ocs-warning2-ie"></i><div>{result.error}</div></span>});
                }
            });

        }
    }
    
    componentWillUnmount() {
         this.props.setHeaderFooterVisibility(true);
    }

    componentDidMount() {
       this.props.setHeaderFooterVisibility(false);
       this.setState({validateMassage: <span><h2 className="text-center">Please wait..</h2><p className="text-center">we are validating your request</p></span>})
        postData('admin/Login/verify_forgot_pin_token', this.props.match.params).then((result) => {
            this.setState({loading: false});
            if (result.status) {
                this.setState({validating: true});
                this.setState({error: ''});
                this.setState({success: result.success});
            } else {
                this.setState({validateMassage: <h2 className="text-center">{result.error}</h2>});
            }
        });
    }

    render() {
        return (
                <div>
                {(this.state.resetTrue)? <Redirect to='/'  />:''}
                    <BlockUi tag="div" blocking={this.state.loading}>
    <section className="gradient_color">
                      
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-4 col-md-offset-4">
                
                                        <div className="logo text-center"><img alt="logo" className="img-fluid" width="70px" src={OCS_LOGO}/></div>
                
                                        <div className="limiter">
                                            <div className="login_1">
                                                <div className="Smiley">
                                                    <h1>
                                                        <span>Reset Pin&nbsp;<i className="icon icon-smail-big"></i></span> 
                                                    </h1>
                                                </div>
                
                                                <div className="col-md-12">
                                                    <div className="User d-flex">
                                                        <span><img src={LOGIN_SVG} className="img-fluid align-self-center" alt="IMG"/></span>
                                                    </div>
                                                    {(this.state.validating) ?
                                                    <form id="reset_password" className="login100-form" >
                                                        <div className="input_2">
                                                            <input className="input_3" id="password" type="password" name="pin" placeholder="New pin" onChange={this.handleChange} value={this.state.password} minlength="6" maxlength="6" data-rule-required="true" data-placement="right" />
                                                        </div>
                                                        <div className="input_2">
                                                            <input className="input_3" type="password" name="confirm_pin" placeholder="Confirm pin" onChange={this.handleChange} value={this.state.confirm_password} data-rule-required="true" data-rule-equalto="#password" data-msg-equalto="Please enter same pin as above" data-placement="right" />
                                                        </div>
                                                        <div className="login_but">
                                                            <button onClick={this.onSubmit} className="but_login orange">Reset pin</button>
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

const mapStateToProps = (state) => ({
    showHeaderFooter : state.Permission.showHeaderFooter,
})

const mapDispatchtoProps = (dispach) => ({
    setHeaderFooterVisibility: (status) => dispach(setHeaderFooterVisibility(status)),
})

export default connect(mapStateToProps, mapDispatchtoProps)(Reset_password);