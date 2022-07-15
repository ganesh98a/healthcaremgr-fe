import {scheduleActiveTitle} from 'menujson/schedule_menu_json';
import { postData } from 'service/common.js'

export const setRosterDetails = (detailsData) => ({
        type: 'set_schedule_roster_details_data',
        detailsData
    });

export const setActiveSelectPageData = (value) => ({
        type: 'set_active_page_schedule',
        value
    })

// action for set fetching status true or false
export const setFetchingStatusRequest = (status) => ({
        type: 'set_loading_status',
        status: status,
}) 

export function setActiveSelectPage(request) {
    return (dispatch, getState) => {
        let pageData = scheduleActiveTitle;
        let pageType = pageData.hasOwnProperty(request) ? request : 'details';
        let pageTypeTitle = pageData[pageType];
        return dispatch(setActiveSelectPageData({pageType: pageType, pageTitle: pageTypeTitle}))
    }
}


export const setShiftDetails = (detailsData) => ({
    type: 'set_schedule_shfits_details_data',
    detailsData
});

export function getShiftDetails(request, with_loading) {
    return dispatch => {
        with_loading = with_loading ? true : false
        
        dispatch(setFetchingStatusRequest(with_loading))
        return postData('schedule/ScheduleDashboard/get_shift_details', request).then((result) => {
            if (result.status) {
                dispatch(setShiftDetails(result.data))
            }
            dispatch(setFetchingStatusRequest(false))
        });
    }
}

export const setShiftCategoryType = (options) => ({
    type: 'set_shift_category_type',
    options
});

export function getShiftCategoryType() {
    return (dispatch, getState) => {
        var state = getState();

        if(state.ScheduleDetailsData.shiftCategoryType.length === 0){
            return postData('schedule/ScheduleListing/get_shift_category_options', {}).then((result) => {
                if (result.status) {
                    dispatch(setShiftCategoryType(result.data))
                }
            });
        }
    }
}   