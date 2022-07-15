import { postData, setPermission as setPermissionInLocalhost, checkLoginWithReturnTrueFalse } from 'service/common.js';

export const getPermissions = () => {
    return dispatch => {
        if (checkLoginWithReturnTrueFalse()) {
            postData('admin/Dashboard/get_all_permission', {}).then((result) => {
                if (result.status) {
                    var perm = JSON.stringify(result.data)
                   
                    setPermissionInLocalhost(perm);
                    dispatch(setPermissions(result.data));
                }
            });
        }
    }
}

export const setPermissions = (permission) => ({
    type: 'setPermissions',
    permission
})

/* set webscoket object
 *  
 *  here set webscoket for send request for every thing like reload notification, mail count, group
 *  message count
 */
export const setWebscoketObject = (obj) => ({
        type: 'set_websocket_object',
        obj
    })

/* set header footer showing status
 *  
 *  here set haader footer visibility status true and false
 *  
 */
export const setHeaderFooterVisibility = (status) => ({
        type: 'set_header_footer_visibility',
        status
    })


// ascronus middleware for fetch data 
export function getAllPublicHoliday(request) {
    return dispatch => {
        return postData('common/Common/get_all_public_holiday', request).then((result) => {
            if (result.status) {
                dispatch(setPublicHoliday(result.data))
            }
        });
    }

    function setPublicHoliday(public_holiday) {
        return {
            type: 'set_public_holiday',
            public_holiday
        }
    }
}