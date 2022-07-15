import { postData, AjaxConfirm, toastMessageShow } from '../../../../service/common.js';

export function get_sales_attachment_data(request_data) {
    return dispatch => {
        return postData('sales/Attachment/get_all_related_attachments', request_data).then(result => {
            if (result.status) {
                console.log(result.data);
                dispatch(setKeyValue(result.data));
            } else {
                dispatch(setKeyValue([]));
            }

        })
    };

}

export const setKeyValue = (data) => {
    return {
        type: 'SET_KEY_VALUE_SALES_ATTACHMENT',
        data
    }
}

export function archive_need_assessment_doc(request_data, tab) {
    return new Promise((resolve, reject) => {
        if (tab === 'mealtime') {
            var msg = `Are you sure you want to archive this Nutritional Support?`;
            var heading = 'Archive Nutritional Support Plan';
        } else if (tab === 'mobility') {
            var msg = `Are you sure you want to archive this manual handling plan?`;
            var heading = 'Archive manual handling plan';
        }
        
        const confirmButton = `Archive`;

        AjaxConfirm({ id: request_data.id }, msg, 'sales/NeedAssessment/archive_need_assessment_doc', { confirm: confirmButton, heading_title: heading })
            .then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg, 's');
                    resolve(true);
                } else {
                    if (result.error) {
                        toastMessageShow(result.error, 'e');
                        reject(false);
                    }
                }
            });
    })
}
