import React, { Component } from 'react';
import jQuery from "jquery";

import ReactTable from "react-table";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setNotificationToggel, setNotificationAlert, setNotificationImailAlert, clearImailNotification } from './actions/NotificationAction.js';
import { checkItsNotLoggedIn, postData, checkPinVerified, archiveALL, getTimeAgoMessage } from '../../../service/common.js';
import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Header from '../../admin/Header';
import Footer from '../../admin/Footer';
import moment from 'moment-timezone';
import { connect } from 'react-redux'
import ReactHtmlParser from 'react-html-parser';

// globale varibale to stote data
var rawData = [];


/*
 * class Imail notification  
 */
class Imail extends Component {
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

    clearNotification = (obj) => {
        postData('admin/Notification/clear_imail_notification', obj).then((result) => {
            if (result.status) {
             
                if(obj.contentID === 'ALL'){
                    this.props.imailnotificationalert({count: 0, data: []});
                }else{
                    this.props.clearImailNotification(obj);
                }
            }
        });
    }
    
    imailCount = () => {
        var count = this.props.external_imail_count + this.props.internal_imail_count;
        if(count > 0)
        return <span>{count}</span>;
    }

    render() {

        return (
            <React.Fragment>
                <h3 className="active_user text-right"><span >Your Imail
                         <i className="icon icon-share show_notification" data-toggle="dropdown">
                        {this.imailCount()}
                    </i></span>
                    <i onClick={() => this.props.notificationtoggle({LeftMenuOpen: false, RightMenuOpen: false, NotificationType: '' })} className="icon-back-arrow Close_SB"></i>
                    </h3>

                <div className="left_menu_content">

                {this.props.ImailNotificationData.map((item, index) => (
                    <div className="Imail_MSG_div" key={index}>

                        <div className="Imail_Name_div">
                            <div className="Imail_Name_div_1">
                                <span className={"Imail_Img_div_1 "+ item.sender_type}><img src={item.user_img} className="img-responsive"></img></span>
                                <label className="Imail_Name_txt">{item.user_name}</label>
                            </div>
                            <div onClick={() => this.clearNotification({contentId: item.contentId, type: item.type})} className="Imail_close_icon"><i className="icon icon-close2-ie"></i></div>
                        </div>

                        <div className="Imail_Des_div">
                            <div className="Imail_Des_Title_div">
                                <div className="Imail_Des_Title1"><a href={item.redirect_uri}><label>{item.title}</label></a></div>
                                <div className="Imail_Des_Time">{getTimeAgoMessage(item.mail_date)+ ' ago'}</div>
                            </div>
                            <div className="Imail_Des_txt"><a href={item.redirect_uri}>{ReactHtmlParser(item.content)}</a></div>
                            <div className="Imail_Reply_btn"><a href={item.redirect_uri+'/re/'+ item.contentId}>Reply</a></div>
                        </div>

                    </div>
                  ))}
                    

                </div>
                <h3 className="footer_right  footer_right_v2  bt-1">
                    <div className="row">
                        <div className="col-xs-6 text-center P_15_LR py-3 br-1">
                            <a className="right-i" href="#" onClick={() => this.clearNotification({contentId: 'ALL'})} data-placement="bottom" data-toggle="tooltip" title="Info">Clear All Notification</a>
                        </div>
                        <div className="col-xs-6 text-center P_15_LR">
                            <span className="w-100 d-block py-3">
                                <Link className="right-i" to="/admin/imail/dashboard/" data-placement="bottom" data-toggle="tooltip" title="Info">Open Imail</Link>
                            </span>
                        </div>
                    </div>
                </h3>
            </React.Fragment>
        );
    }
}
const mapStateToProps = state => ({
    ImailNotificationData: state.NotificationReducer.ImailNotificationData,
    ImailNotificationCount: state.NotificationReducer.ImailNotificationCount,
    external_imail_count: state.NotificationReducer.external_imail_count,
    internal_imail_count: state.NotificationReducer.internal_imail_count,
})
const mapDispatchtoProps = (dispach) => {
    return {
        imailnotificationalert: (object) => dispach(setNotificationImailAlert(object)),
        notificationtoggle: (object) => dispach(setNotificationToggel(object)),
        clearImailNotification: (object) => dispach(clearImailNotification(object)),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(Imail);