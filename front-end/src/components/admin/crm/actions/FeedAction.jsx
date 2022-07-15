import { postData } from '../../../../service/common.js';

/**
 * Get related type for lead, opportunity & service agreement 
 * @param {obj} request_data 
 */
export function get_related_type(request_data) {
    return postData('sales/Feed/get_related_type', request_data).then(result => {
        if (result.status === true && result.data) {
            return result.data;
        } else {
            return [];
        }
    })
}