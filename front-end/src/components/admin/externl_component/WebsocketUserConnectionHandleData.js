import React, { Component } from 'react';
import { postData, getLoginToken, setPermission, logout, checkLoginWithReturnTrueFalse, getPermission} from 'service/common.js';
import { connect } from 'react-redux'
import { WS_URL} from '../../../config.js';
import { setWebscoketObject, setPermissions} from '../../../actions/PermissionAction.js';
import Websocket from 'react-websocket';
import {updateUnreadGroupMessageCounter, setNotificationImailAlert, updateNotificationAlert, decreaseGroupMessageCounter} from './../notification/actions/NotificationAction';
import { getInternalMailListing, setGroupChatData, addNewGroupMessage, setGroupMessageAsRead } from './../imail/actions/InternalImailAction';
import { getExternalMailContent } from './../imail/actions/ExternalImailAction';
import { getRecruiterAdminActionNotification } from './../recruitment/actions/RecruitmentAction';


class WebsocketUserConnectionHandleData extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        
          this.permission = (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? [] : JSON.parse(getPermission())):[];
    }

    componentDidMount() {
      
    }
    
    notifyMessageReaded = (messageIds) => {
        var obj = { req_type: 'single_group_chat', ms_type: 'read_notify', token: getLoginToken(), messageId: messageIds }

        if (this.refWebSocke) {
            this.refWebSocke.sendMessage(JSON.stringify(obj));
        }
    }
    
    setWebscoketObject = (Websocket) => {
        this.refWebSocke = Websocket;
        this.props.setWebscoketObject(Websocket)
    }
    
    checkPermissionAndKickOut = (permission) => {
       var parts = window.location.pathname.split('/');
       if(parts.length >= 2){
           var module = parts[2];
           var modules = {member: 'access_member', user: 'access_admin', imail: 'access_imail', participant: 'access_participant', organisation: 'access_organization', 
               fms: 'access_fms', schedule: 'access_schedule', crm: 'access_crm', recruitment: 'access_recruitment'}
          
           if(modules[module]){
               if(!permission[modules[module]]){
                   window.location = '/admin/dashboard';
               }
           }
       }
    }
    
    handleData = (res) => {
        var res = JSON.parse(res);
//        console.log(res);
        if(res.type === 'unread_group_message_notification'){
            
            // set unread group message
            this.props.updateUnreadGroupMessageCounter(res.data);
        }else if(res.type === "imail_notification"){
       
            // set imail notification
            this.props.imailnotificationalert(res.data);
        
        }else if(res.type === "internal_imail_listing"){
            if(this.props.mail_type == 'inbox'){
                var request = {type: this.props.mail_type, select: '', search_box: ''};
               // set imail notification
               this.props.getInternalMailListing(request);
           }
        }else if(res.type === "external_imail_listing"){
            if(this.props.mail_type == 'inbox'){
                var request = {type: this.props.mail_type, select: '', search_box: ''};
               // set imail notification
               this.props.getExternalMailContent(request);
           }
        }else if(res.type === "update_permission"){
                var perm = JSON.stringify(res.data)
                setPermission(perm);
                this.props.setPermissionRole(res.data);
                this.checkPermissionAndKickOut(res.data);
        
        }else if(res.type === "logout_admin_user"){
              logout();
        }else if(res.type === 'bell_notification'){
               this.props.updateNotificationAlert(res.data);
        }else if (res.type === 'usermsg') {
            if(res.tm == this.props.teamId && res.ty == this.props.team_type){
                // add new message in chat box
                this.props.addNewGroupMessage(res.message_data);
                
                // notify to admin message read by user
                this.notifyMessageReaded([res.message_data.messageId]);
                this.props.decreaseGroupMessageCounter(this.props.teamId, this.props.team_type);
            } 
        } else if(res.type =='recruitment_admin_actionable_notification'){
            if(res.data && this.permission.access_recruitment_admin){
                this.props.getRecruiterAdminActionNotification();
            }
        }   
    }

    render() {
        const ws_url = WS_URL+'/?req_type=user_connect_to_socket&user_type=admin&chanel=client&token=' + getLoginToken() + '&blk=';
         
        return (
                <React.Fragment><Websocket reconnect={false} url={ws_url} onMessage={this.handleData} ref={Websocket => { this.setWebscoketObject(Websocket)}} /></React.Fragment>
        );
    }
}
const mapStateToProps = state => ({
     mail_type: state.InternalImailReducer.mail_type,
     teamId: state.InternalImailReducer.teamId,
     team_type: state.InternalImailReducer.team_type,
})

const mapDispatchtoProps = (dispatch) => {
    return {
         setWebscoketObject: (obj) => dispatch(setWebscoketObject(obj)),
         updateUnreadGroupMessageCounter: (data) => dispatch(updateUnreadGroupMessageCounter(data)),
         imailnotificationalert: (object) => dispatch(setNotificationImailAlert(object)),
         getInternalMailListing: (object) => dispatch(getInternalMailListing(object)),
         updateNotificationAlert: (object) => dispatch(updateNotificationAlert(object)),
         setPermissionRole: (permission) => dispatch(setPermissions(permission)),
         addNewGroupMessage: (data) => dispatch(addNewGroupMessage(data)),
         decreaseGroupMessageCounter: (teamId, type) => dispatch(decreaseGroupMessageCounter(teamId, type)),
         getRecruiterAdminActionNotification: () => dispatch(getRecruiterAdminActionNotification()),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(WebsocketUserConnectionHandleData);