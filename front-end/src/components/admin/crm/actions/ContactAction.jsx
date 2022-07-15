import { postData, AjaxConfirm, toastMessageShow } from '../../../../service/common.js';

export function get_contact_details_for_view(request_data) {
    return dispatch => {
        return postData('sales/Contact/get_contact_details_for_view', request_data).then(result => {
            if (result.status) {
                dispatch(setKeyValue(result.data));
            }else{
                // window.location.href = "/admin/crm/contact/listing";
            }

        })
    };

}

/**
 * Get contact list for email activity recipient
 * @param {obj} request_data 
 */
export function get_contact_name_search_for_email_act(request_data) {
    return dispatch => {
        return postData('sales/Activity/get_contact_name_search', request_data).then(result => {
            if (result.status) {
                let type = 'EMAIL_ACT_CONTACT_OPTIONS_DEFAULT';
                if (request_data.type == 'all') {
                    type = 'EMAIL_ACT_CONTACT_OPTIONS';
                }
                dispatch({ type: type, data: result.data });
                return result.data;
            }else{
                // to do...
            }

        })
    };

}

export const setKeyValue = (data) => {
    return {
        type: 'SET_KEY_VALUE',
        data
    }
}


export function archive_contact(id) {
    return (dispatch, state) => {
        var contactId = state().ContactReducer.id

        const msg = `Are you sure you want to archive this Contact?`
        const confirmButton = `Archive Contact`

        return AjaxConfirm({ id }, msg, `sales/Contact/archive_contact`, { confirm: confirmButton, heading_title: `Archive Contact` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                dispatch(get_contact_details_for_view(id));
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }

        })
    };

}


/**
 * RequestData get the list of question - forms
 * @param {int} person_id 
 */
 export const activate_org_portal_user = (person_id) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { person_id: person_id };
        postData('admin/login/sent_org_portal_login_access', Request).then((result) => {
            resolve(result);           
        });

    });
};