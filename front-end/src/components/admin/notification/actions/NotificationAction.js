import React from 'react';
import { postData, AjaxConfirm, toastMessageShow } from '../../../../service/common.js';

export const setNotificationToggel = (object) => ({
        type: 'setNotificationToggel',
        object
    })
export const setNotificationAlert = (object) => ({
        type: 'setNotificationAlert',
        object
    })
export const setNotificationImailAlert = (object) => ({
        type: 'setNotificationImailAlert',
        object
    })

export const setToggleInfographicSidebar = (object) => ({
    type: 'setToggleInfographicSidebar',
    object
})

/* set internal message count
 *
 * this action use for set message count on group message
 */
export const setUnreadGroupMessage_count = (object) => ({
        type: 'set_unread_group_message_count',
        object
    })

/* clear imail notification
 *
 * this action use for clear particular notification
 */
 export const clearImailNotification = (object) => ({
        type: 'clear_imail_notification',
        object
 })

/* decrease unread message counter
 *
 * this action use for decrease message counter by group and type
 * in which two paramter is mandatory {type, teamId}
 */
 export const decreaseGroupMessageCounter = (teamId, group_type) => ({
        type: 'decrease_group_message_counter',
        teamId,
        group_type
 })

/* decrease unread message counter
 *
 * this action use for decrease message counter by group and type
 * in which two paramter is mandatory {type, teamId}
 */
 export const updateUnreadGroupMessageCounter = (data) => ({
        type: 'update_unread_group_message_counter',
        data,
 })

 /* decrease unread message counter
 *
 * this action use for decrease message counter by group and type
 * in which two paramter is mandatory {type, teamId}
 */
 export const updateNotificationAlert = (data) => ({
        type: 'update_notification_alert',
        data,
 })

 /* set footer color
 *
 * this action use for set dynamic footer color
 */
 export const setFooterColor = (color) => ({
        type: 'set_footer_color',
        color,
 })

 /**
  * Update notification status as read
  * @param {*} request_data
  */
 export function dismissNotificationAlert(data) {
    return dispatch => {
        return postData('admin/Notification/remove_notification', data).then(result => {
            if (result.status) {
                dispatch({ type: 'dismissNotificationAlert', data: data.index });
            }else{
                // to do...
            }

        })
    };

}


/**
  * Update notification status as read
  * @param {*} request_data
  */
 export function updateNotificationAsReaded(data) {
    return dispatch => {
        return postData('admin/Notification/update_notification_as_readed', data).then(result => {
            if (result.status) {
                dispatch({ type: 'updateNotificationAsReaded', data: data.index });
                if(data.url != undefined && data.url) {
                    window.location = data.url;
                }
                else if(data.url === undefined || data.url === ''){
                    window.location = '/';
                }
            }

        })
    };

}

/**
  * Update notification status as read
  * @param {*} request_data
  */
 export function markAllAsRead() {
    return dispatch => {
        return postData('admin/Notification/mark_all_as_read', {}).then(result => {
            if (result.status) {
                dispatch({ type: 'markAllAsRead'});
            }else{
                // to do...
            }

        })
    };

}