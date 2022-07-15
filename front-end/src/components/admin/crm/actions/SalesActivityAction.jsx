import { postData, AjaxConfirm, toastMessageShow } from '../../../../service/common.js';

export function get_sales_activity_data(request_data) {
    return dispatch => {
        dispatch(setKeyValue({ activity_loading: true, aactivity_timeline: []}))

        return postData('sales/Contact/get_acitvity_as_per_entity_id_and_type', request_data).then(result => {
            if (result.status) {
                dispatch(setKeyValue(result.data));
               
            } else {
                dispatch(setKeyValue({ aactivity_timeline: [] }))
            }
            dispatch(setKeyValue({ activity_loading: false}))
        })
    };

}

export const setKeyValue = (data) => {
    return {
        type: 'SET_KEY_VALUE_SALES_ACTIVITY',
        data
    }
}

/**
 * RequestData get the detail of list of activity notes
 * @param {int} entity_id
 */
 export const getActivityNotesByRelatedType = (entity_id, related_type, pageSize, page, sorted, filtered, entity_parent) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { entity_id: entity_id, related_type: related_type, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, entity_parent};
        postData('sales/Activity/get_acitvity_notes_by_related_type', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
                    applicant: result.applicant || false
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }
        });
    });
};