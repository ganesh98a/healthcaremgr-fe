import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { ROUTER_PATH, BASE_URL } from '../../config.js';
import Header from '../admin/Header';
import Footer from '../admin/Footer';
import {postData, checkItsNotLoggedIn } from '../../service/common.js';

class VerifyEmailConfirmation extends Component {
    constructor(props) {
        super(props);
     
        this.state = {
            message: 'Please Wait, We are verify your request',
            happy_img: 'Login-Icon.svg',
            current_img: 'Login-Icon.svg',
            invalid_img: '404_img.svg',
        }
    }
    
    componentDidMount() {
        postData('admin/Login/verify_email_update', this.props.match.params).then((result) => {
            this.setState({loading: false});
            if (result.status) {
                this.setState({validating: true});
                this.setState({error: ''});
                this.setState({message: result.success});
            } else {
                this.setState({message: result.error, current_img : this.state.invalid_img});
            }
        });
    }

    render() {
        return (
<div>
    <div className="error_bg">
        <div className="flex_p">
            <div><img src={'/assets/images/admin/'+this.state.current_img} className="error_img_404"/></div>
            <div>
                <h2 className="pt-4">{this.state.message}</h2>
                <div className="pt-4 col-md-5 pull-right pr-0"><a className="but VEC_btn px-5" href={'/'}>Login</a></div>
            </div>
        </div>
    </div>
</div>
                );
    }
}
export default VerifyEmailConfirmation
