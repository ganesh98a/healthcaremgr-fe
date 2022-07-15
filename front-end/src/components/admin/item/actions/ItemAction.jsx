import {recruitmentActiveTitle} from 'menujson/recruitment_menu_json';
import { postData} from 'service/common.js';
import { ROUTER_PATH} from 'config.js';

export const setRecruitmentArea = (area) => ({
        type: 'set_recruitment_area',
        area
})


export function getRecruitmentArea(){
     
     return (dispatch, getState) => {
        return dispatch(recruitmentQuery())
    }  
}

// ascronus middleware for fetch data 
function recruitmentQuery(request) {
    return dispatch => {
    
        return postData('recruitment/RecruitmentUserManagement/get_recruitment_area', request).then((result) => {
            if (result.status) {
                dispatch(setRecruitmentArea(result.data))
            }
        });
    }
}

export const setActiveSelectPageData= (value) => {
    return {
        type: 'set_active_page_recruitment',
        value
}}
    
export function setActiveSelectPage(request) {
    return (dispatch, getState) => {
        let pageData =recruitmentActiveTitle;
        let pageType = pageData.hasOwnProperty(request) ? request: 'details';
        let pageTypeTitle = pageData[pageType];
        return dispatch(setActiveSelectPageData({pageType:pageType,pageTitle:pageTypeTitle}))
    }
}


export const setRecruiterAdminActionNotification = (data) => ({
    type: 'set_recruiter_admin_actionable_notification_data',
    data
})
export const getRecruiterAdminActionNotificationRequest = () => ({
    type: 'get_recruiter_admin_actionable_notification_request',
    res:true
})


export function getRecruiterAdminActionNotification(){
     
    return (dispatch, getState) => {
        dispatch(getRecruiterAdminActionNotificationRequest());
       return dispatch(recruiterAdminActionNotificationQuery());
   }  
}

// ascronus middleware for fetch data 
function recruiterAdminActionNotificationQuery(request) {
    return dispatch => {
    
        return postData('recruitment/RecruitmentDashboard/get_latest_status_updates_notification', request).then((result) => {
            if (result.status) {
                dispatch(setRecruiterAdminActionNotification(result.data));
            }
        });
    }
}

export function recruiterAdminActionNotificationDismissAndView(request) {
    return dispatch => {
        return postData('recruitment/RecruitmentDashboard/action_updates_notification', request).then((result) => {
            if (result.status) {
                dispatch(getRecruiterAdminActionNotification());
                if(request.type==1){
                    window.location =request.url;
                }
            }
        });
    }
}

/*
 * applicant stage label notes start
 *  set applicant notes setter, getter and middleware 
 */

// action for set applicant stage details
export const setTaskStageDetails = (data) => ({
    type: 'set_task_stage',
    data:data
})


// call middleware from class
export function getTaskStageDetails() {
return (dispatch, getState) => {
    return dispatch(taskStageDetailsQuery())
}
}

// ascronus middleware for fetch data 
function taskStageDetailsQuery() {
return dispatch => {

    return postData('recruitment/RecruitmentTaskAction/get_recruiter_stage').then((result) => {
        if (result.status) {
            dispatch(setTaskStageDetails(result.data))
        }
    });
}
}

/*
*  applicant stage label notes end 
*/

/**
 * RequestData get the list of forms
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
export const getFormListData = (application_id, applicant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { application_id: application_id, applicant_id: applicant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentForm/get_form_list_by_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    count: result.total_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    count: 0
                };
                resolve(res);
            }
           
        });

    });
};

/**
 * RequestData get the list of question - forms
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
export const getFormQuestionListData = (application_id, applicant_id, form_applicant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { application_id: application_id, applicant_id: applicant_id, form_applicant_id: form_applicant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentForm/get_questions_list_by_applicant_form_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    count: result.total_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    form_count: 0
                };
                resolve(res);
            }
           
        });

    });
};

/**
 * RequestData get the detail of form
 * @param {int} formId
 */
export const getFormDetailData = (formId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { form_id: formId };
        postData('recruitment/RecruitmentForm/get_form_detail_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
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

/**
 * RequestData get the detail of current staff
 * @param {int} formId
 */
export const getActiveStaffDetailData = (userId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { user_id: userId };
        postData('recruitment/RecruitmentForm/get_curent_staff_detail_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
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

/**
 * RequestData get the list of quiz
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
export const getQuizListData = (application_id, applicant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { application_id: application_id, applicant_id: applicant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentQuiz/get_quiz_list_by_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    count: result.total_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    count: 0
                };
                resolve(res);
            }
           
        });

    });
};

/**
 * RequestData get the detail of quiz
 * @param {int} quizId
 */
export const getQuizDetailData = (quizId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { quiz_id: quizId };
        postData('recruitment/RecruitmentQuiz/get_quiz_detail_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
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

/**
 * RequestData get the list of question - forms
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
export const getQuizQuestionListData = (application_id, applicant_id, quiz_id,form_applicant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { application_id: application_id, applicant_id: applicant_id, quiz_id: quiz_id, form_id: form_applicant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentQuiz/get_questions_list_by_applicant_quiz_and_form_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    count: result.total_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    form_count: 0
                };
                resolve(res);
            }
           
        });

    });
};

/**
 * RequestData get the list of question - quiz
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
export const getQuizQuestionAndAnswerListData = (application_id, applicant_id, quiz_id,form_applicant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { application_id: application_id, applicant_id: applicant_id, quiz_id: quiz_id, form_id: form_applicant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentQuiz/get_question_details', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    count: result.total_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    form_count: 0
                };
                resolve(res);
            }
           
        });

    });
};