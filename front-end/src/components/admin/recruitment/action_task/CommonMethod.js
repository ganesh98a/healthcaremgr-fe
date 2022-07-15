import { postData} from 'service/common.js';

export const getOptionsRecruitmentStaff = (e, assigned_user) => {
    if (!e || e.length < 2) {
        return Promise.resolve({options: []});
    }

    return postData('recruitment/RecruitmentTaskAction/get_recruiter_listing_for_create_task', {search: e, assigned_user: assigned_user}).then((json) => {
        return {options: json};
    });
}

export const getOptionsApplicantList = (e, applicant_list, task_stage,searchByType, application_id = null) => {
    if (searchByType==undefined && (!e || e.length < 2)) {
        return Promise.resolve({options: []});
    }
    let requestData = {search: e, applicant_list: applicant_list, task_stage: task_stage};
    if(searchByType){
        requestData['type'] = searchByType;
    }

    // will be populated when currently in application stages (ie. application_id is in URL)
    if (!!application_id) {
        requestData['application_id'] = application_id
    }

    return postData('recruitment/RecruitmentTaskAction/get_applicant_option_for_create_task',requestData).then((json) => {
        if(searchByType=='id'){
           return json;
        }else{
            return {options: json};
        }
    
    });
}