import {crmActiveTitle} from 'menujson/crm_menu_json';
export const setCrmDepartmentData = (crmDepartmentData) => ({
        type: 'set_crm_department_data',
        crmDepartmentData
    })

export const setActiveSelectPageData= (value) => {
    return {
        type: 'set_active_page_crm',
        value
}}
export const setProspectiveParticipantData= (detailsData) => ({
        type: 'set_participaint_details_crm',
        detailsData
});
export const setStaffData= (detailsData) => ({
        type: 'set_staff_details_crm',
        detailsData
});
    
        
export function setActiveSelectPage(request) {
    return (dispatch, getState) => {
        let pageData =crmActiveTitle;
        let pageType = pageData.hasOwnProperty(request) ? request: 'details';
        let pageTypeTitle = pageData[pageType];
        return dispatch(setActiveSelectPageData({pageType:pageType,pageTitle:pageTypeTitle}))
    }
}
