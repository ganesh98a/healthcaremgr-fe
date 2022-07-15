import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { ROUTER_PATH, BASE_URL } from '../../config.js';
import Header from '../admin/Header';
import Footer from '../admin/Footer';

class PageNotFound extends Component {
    constructor(props) {
        super(props);
        this.state = {          
            pagenotfound:true,
        };
    }

    render() {
        return (
                <div>
                    <div className="error_bg">
                        <div className="flex_p">
                            <div><img src='/assets/images/admin/404_img.svg' className="error_img_404"/></div>
                                <div>
                                    <h2>Oops!</h2>
                                    <p>It looks like the link you have entered no longer exists or is incorrect. </p>
                                    <p>You can search for what you’re looking for in the search bar above<br/>
                                        or click the button below to go back to the previous page.</p>
                                <div className="pt-4 pull-right "><a className="but px-5 VEC_btn" href={'/admin/dashboard/'}>Back To Previous Page</a></div>
                            </div>
                        </div>
                    </div>
                </div>    
                );
    }
}
export default PageNotFound
