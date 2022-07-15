import { postData } from '../../../service/common'

export function fetchStateList() {
    return dispatch => {
        dispatch({ type: 'FETCH_STATE_LIST_STARTED' })
        postData('common/Common/get_state')
            .then(res => dispatch({ type: 'FETCH_STATE_LIST_SUCCESS', payload: res }))
            .catch(e => dispatch({ type: 'FETCH_STATE_LIST_FAILED', payload: e }))
    }
}

export function fetchTitleOptions() {
    return dispatch => {
        dispatch({ type: 'FETCH_TITLE_OPTIONS_STARTED' })
        postData('common/Common/title_options')
            .then(res => dispatch({ type: 'FETCH_TITLE_OPTIONS_SUCCESS', payload: res }))
            .catch(e => dispatch({ type: 'FETCH_TITLE_OPTIONS_FAILED', payload: e }))
    }
}

/**
 * Save viewed log
 * @param {obj} request_data 
 */
export function save_viewed_log(request_data) {
    return postData('common/Common/save_viewed_log', request_data).then(result => {
        if (result.status === true && result.data) {
            return result.data;
        } else {
            return [];
        }
    })
}


/**
 * RequestData get the list of question - quiz
 * @param {str} list_api_url 
 * @param {obj} request_data 
 */
 export const getDataListById = (list_api_url, request_data, clear_all, list_reset) => {
    return dispatch => {
        // request json
        var Request = request_data;
        return postData(list_api_url, Request).then((result) => {
            if (result.status) {
                dispatch({type: 'SET_DATA_TABLE_LIST', data: result, clear_all: clear_all, list_reset: list_reset});
                dispatch({type: 'SET_DATA_TABLE_LIST_REQEST', data: request_data});
                dispatch({type: 'IS_API_CALL_DONE', isApiCallDone: true})
            }
        });

    };
};