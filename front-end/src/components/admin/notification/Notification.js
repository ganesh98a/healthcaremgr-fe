import React, { Component } from 'react';
import jQuery from "jquery";

import ReactTable from "react-table";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setNotificationToggel, setNotificationAlert, setNotificationImailAlert } from './actions/NotificationAction.js';
import { checkItsNotLoggedIn, postData, archiveALL } from '../../../service/common.js';
import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Header from '../../admin/Header';
import Footer from '../../admin/Footer';
import moment from 'moment-timezone';
import { connect } from 'react-redux'
// globale varibale to stote data
var rawData = [];


/*
 * class ListNotification 
 */
class Notification extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn(ROUTER_PATH);
        this.filterType = [{ label: 'Select', value: '' }, { label: 'Archive only', value: 'archive_only' }, { label: 'Active only', value: 'active_only' }, { label: 'Inactive only', value: 'inactive_only' }]
        this.state = {
            loading: false,
            userList: [],
            counter: 0,
            startDate: new Date(),
            search: '',
            search_by: ''
        };
    }

    clearNotification = () => {
        postData('admin/notification/clear_all_notification', {}).then((result) => {
            if (result.status) {
                this.props.notificationalert({ "count": "0", "data": [] });
            }
        });
    }

    render() {

        return (

            <React.Fragment>
                <h3 className="active_user text-right"><span>Your Notifcation
                            <i className="icon icon-notification-icons show_notification" data-toggle="dropdown">
                        {this.props.NotificationCount > 0 ? <span>{this.props.NotificationCount}</span> : ''}
                    </i></span>
                    <i onClick={() => this.props.notificationtoggle({ LeftMenuOpen: false, RightMenuOpen: false, NotificationType: '' })} className="icon-back-arrow Close_SB"></i>
                </h3>
                <div className="left_menu_content">
                    {this.props.NotificationData.map((item, index) => (
                        <div className="col-md-12" key={index}>
                            <div className="Not_msg_div">
                                <div className="Not_m_d1"><span>Name:</span> {item.username}</div>
                                <div className="Not_m_d2"><span>Date:</span> {moment(item.created).format('DD/MM/YYYY LT')}</div>
                                <div className="Not_m_d3"><span>Des:</span> {item.shortdescription}</div>

                            </div>
                        </div>
                    ))}
                </div>
                <h3 className="footer_right  footer_right_v2  bt-1">
                    <div className="row">
                        <div className="col-xs-6 text-center P_15_LR py-3  br-1">
                            <a className="right-i" href="#" onClick={
                                this.clearNotification} data-placement="bottom" data-toggle="tooltip" title="Info">
                                Clear All Notifcation
                                            </a>
                        </div>
                        <div className="col-xs-6 text-center P_15_LR ">
                            <span className="w-100 d-block py-3">


                                <Link className="right-i" to="/admin/notification" data-placement="bottom" data-toggle="tooltip" title="Info">
                                    Open Notification {/*<i className="icon icon-notification-icons"></i>*/}
                                </Link>

                            </span>
                        </div>
                    </div>
                </h3>
            </React.Fragment>
        );
    }
}


const mapStateToProps = state => ({
    NotificationData: state.NotificationReducer.NotificationData,
    NotificationCount: state.NotificationReducer.NotificationCount,
    ImailNotificationData: state.NotificationReducer.ImailNotificationData,
    ImailNotificationCount: state.NotificationReducer.ImailNotificationCount

})

const mapDispatchtoProps = (dispach) => {
    return {
        notificationalert: (object) => dispach(setNotificationAlert(object)),
        notificationtoggle: (object) => dispach(setNotificationToggel(object)),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(Notification);