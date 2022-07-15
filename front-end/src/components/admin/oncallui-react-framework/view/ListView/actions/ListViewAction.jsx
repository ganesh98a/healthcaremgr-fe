import { postData } from '../../../services/common';

export function get_list_view_controls_by_default_pinned(request_data, list_id = 0) {
    return dispatch => {
        dispatch(setKeyValue({ activity_loading: true, list_view_control: []}))

        return postData('common/ListViewControls/get_list_view_controls_by_default_pinned', { related_type: request_data, list_id }).then(result => {
            dispatch(setKeyValue({list_view_control:result}));
            dispatch(setKeyValue({ activity_loading: false}))
        })
    };

}

export const setKeyValue = (data) => {
    return {
        type: 'SET_KEY_VALUE_LIST_VIEW_DEFAULT_PINNED',
        data
    }
}

export const setKeyValueData = (data) => {
    return {
        type: 'LIST_VIEW_CONTROLS_BY_RELATED_TYPE',
        data
    }
}


/**
 * Get list for email activity recipient
 * @param {obj} request_data 
 */
export function get_list_view_controls_by_related_type(request_data) {
    return dispatch => {
        dispatch(setKeyValueData({ activity_loading: true, list_view_control_by_related_type: {}}))
        return postData('common/ListViewControls/get_list_view_controls_by_related_type', { related_type: request_data }).then(result => {
            if (result.status) {
                dispatch(setKeyValueData({list_view_control_by_related_type:result}));
            } else {
                dispatch(setKeyValueData({ list_view_control_by_related_type: {} }))
            }
            dispatch(setKeyValueData({ activity_loading: false}))

        })
    };

}

export const setKeyValueById = (data) => {
    return {
        type: 'LIST_VIEW_CONTROLS_BY_ID',
        data
    }
}


/**
 * Get list for email activity recipient
 * @param {obj} request_data 
 */
export function get_list_view_controls_by_id(request_data) {
    return dispatch => {
        dispatch(setKeyValueById({ activity_loading: true, list_view_control_by_id: []}))
        return postData('common/ListViewControls/get_list_view_controls_by_id', request_data).then(result => {
            if (result.status) {
                dispatch(setKeyValueById({list_view_control_by_id:result}));
            } else {
                dispatch(setKeyValueById({ list_view_control_by_id: [] }))
            }
            dispatch(setKeyValueById({ activity_loading: false}))

        })
    };

}