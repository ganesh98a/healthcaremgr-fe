import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { ROUTER_PATH, BASE_URL } from '../../config.js';
import { postData, checkLoginWithReturnTrueFalse,  setPermission } from '../../service/common.js';
import { connect } from 'react-redux'
import { getPermissions } from 'actions/PermissionAction';

class PageNotFound extends Component {
    constructor(props) {
        super(props);
        this.state = {          
            pagenotfound:true,
        };
    }
    
    componentDidMount() {
        this.props.getPermissions();
    }

    render() {
        return (
                <div>
                    <div className="error_bg">
                        <div className="flex_p">
                            <div><img src='/assets/images/admin/404_img.svg' className="error_img_404"/></div>
                                <div>
                                    <h2 className="pt-4">You do not have permission to access</h2>
                                    <div className="pt-4 col-md-5 pull-right pr-0">
                                        <Link className="but px-5 VEC_btn" to={ROUTER_PATH+'admin/dashboard/'}>back to home</Link>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>    
                );
    }
}

const mapStateToProps = state => ({
    permissions: state.Permission.AllPermission,
})

const mapDispatchtoProps = (dispatch) => {
   return {
        getPermissions: () => dispatch(getPermissions()),
   }
}

export default connect(mapStateToProps, mapDispatchtoProps)(PageNotFound);
