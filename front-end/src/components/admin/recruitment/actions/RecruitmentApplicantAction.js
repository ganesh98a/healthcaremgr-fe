import { postData,toastMessageShow,archiveALL} from 'service/common.js';
import { BASE_URL } from 'config.js';

/*
 *  applicant info start
 *  set applicant info setter, getter and middleware 
 */

// action for set applicant info
export const setApplicantInfo = (applicantInfo) => ({
        type: 'set_applicant_info',
        applicantInfo
    })
    
export const setApplicantInfoKeyValue = (obj) => ({
        type: 'set_applicant_info_key_value',
        obj
    })


// call middleware from class
export function getApplicantInfo(applicant_id, loading_status, application_id) {
    return (dispatch, getState) => {
        return dispatch(applicantInfoQuery(applicant_id, loading_status, application_id))
    }
}

// ascronus middleware for fetch data 
function applicantInfoQuery(applicant_id, loading_status, application_id) {
    return dispatch => {
        if(loading_status)
        dispatch(setApplicantInfoKeyValue({info_loading: true}));
        
        return postData('recruitment/RecruitmentApplicant/get_applicant_info', {applicant_id: applicant_id, application_id: application_id}).then((result) => {
            if (result.status) {
                dispatch(setApplicantInfo(result.data))
                if(loading_status)
                dispatch(setApplicantInfoKeyValue({info_loading: false}));
            }else{
                window.location.href = "/admin/recruitment/applicants";
            }
        });
    }
}

// call middleware from class
export function getApplicantInfoByJobId(applicant_id,loading_status, application_id) {
    return (dispatch, getState) => {
        return dispatch(applicantInfoByJobIdQuery(applicant_id,loading_status, application_id))
    }
}

// ascronus middleware for fetch data job id refering to applicationid
function applicantInfoByJobIdQuery(applicant_id,loading_status, application_id) {
    return dispatch => {
        if(loading_status)
        dispatch(setApplicantInfoKeyValue({info_loading: true}));
        
        return postData('recruitment/RecruitmentApplicant/get_application_by_application_id', {applicant_id: applicant_id, application_id: application_id}).then((result) => {
            if (result.status) {
                dispatch(setApplicantInfo(result.data))
                if(loading_status)
                dispatch(setApplicantInfoKeyValue({info_loading: false}));
            }else{
                window.location.href = "/admin/recruitment/applicants";
            }
        });
    }
}

/*
 *  applicant info end 
 */


/*
 *  applicant stage details start
 *  set applicant stage details setter, getter and middleware 
 */

// action for set applicant stage details
export const setApplicantMainStageDetails = (stageDetails) => ({
        type: 'set_applicant_main_stage_details',
        stageDetails
    })


// call middleware from class
export function getApplicantMainStageDetails(applicant_id, application_id) {
    return (dispatch, getState) => {
        return dispatch(applicantMainStageDetailsQuery(applicant_id, application_id))
    }
}

// ascronus middleware for fetch data 
function applicantMainStageDetailsQuery(applicant_id, application_id) {
    return dispatch => {

        return postData('recruitment/RecruitmentApplicant/get_applicant_main_stage_details', {applicant_id: applicant_id, application_id: application_id}).then((result) => {
            if (result.status) {               
                dispatch(setApplicantMainStageDetails(result.data))
            }
        });
    }
}


// ascronus middleware for fetch data 
export function updateApplicantStage(request) {
    return dispatch => {
        return postData('recruitment/RecruitmentApplicant/update_applicant_stage_status', request).then((result) => {
            if (result.status) {
                let application_id = request.application_id ? request.application_id : 0

               dispatch(getApplicantMainStageDetails(request.applicant_id, application_id));
               if(request.status == 4 || request.status == 2 || request.status == 5 || request.stage_key === "group_interview_result" || request.stage_key === "individual_interview_result" || (request.stage_key === "recruitment_complete" && request.status == 3)){
                   dispatch(applicantInfoQuery(request.applicant_id));
               }
               if(request.status == 4 ){
                   dispatch(applicantAttachmentDetailsQuery(request.applicant_id));
               }

               if(request.status == 2 && result.hasOwnProperty('stage_wise_details_call') && result.stage_wise_details_call){
                dispatch(applicantStageWiseDetailsQuery(1,request.stage_number,request.applicant_id, true, request.application_id));
               }
            }else{
                toastMessageShow(result.error,'e')
            }
        });
    }
}

/*
 * end  update applicant stage
 */

/*
 *  get stage wise detials on open accordian
 */

// action for set applicant stage wise details
export const setApplicantStageWiseDetails = (stageDetails, its_open, stage_number, loading_status, application_id) => ({
        type: 'set_applicant_stage_wise_details',
        stageDetails,
        its_open,
        stage_number,
        loading_status,
        application_id
    })

export const setApplicantStageWiseDetailsLoadingStatus = (stage_number, its_loading) => ({
        type: 'set_applicant_stage_wise_details_loading_status',
        stage_number,
        its_loading,
    })

// call middleware from class
export function getApplicantStageWiseDetails(request) {
    return (dispatch, getState) => {
        return dispatch(applicantStageWiseDetailsQuery(request))
    }
}

// ascronus middleware for fetch data 
function applicantStageWiseDetailsQuery(request) {
    return (dispatch, getState) => {
        /* we are now passing the application_id as argument as part of applicant vs application split
        var application_id = '';
        if(getState().RecruitmentApplicantReducer.applications.length > 0){
            var application_id = getState().RecruitmentApplicantReducer.applications[0]['id']
        } */

        if(request.its_open){
        dispatch(setApplicantStageWiseDetailsLoadingStatus(request.stage_number, request.show_loading))    
            
        return postData('recruitment/RecruitmentApplicant/get_applicant_stage_wise_details', request).then((result) => {
            if (result.status) {
                dispatch(setApplicantStageWiseDetails(result.data, request.its_open, request.stage_number))
                dispatch(setApplicantStageStatusOPen(request.its_open, request.stage_number))
            }
            dispatch(setApplicantStageWiseDetailsLoadingStatus(request.stage_number, false))
        });
        }else{
            dispatch(setApplicantStageStatusOPen(request.its_open, request.stage_number));
        }
    }
}
/*
 * end stage wise details section of action
 */

/*
 * set open close status
 */
export const setApplicantStageStatusOPen = ( its_open, stage_number) => ({
        type: 'set_applicant_stage_wise_open_status',
        its_open,
        stage_number
})

/*
 * applicant attachment category start
 *  set applicant attachment categorydetails setter, getter and middleware 
 */

// action for set applicant stage details
export const setApplicantAttachmentCategoryDetails = (data) => ({
    type: 'set_applicant_attachment_category',
    attachmentCategory:data
})


// call middleware from class
export function getApplicantAttachmentCategoryDetails(params = {}) {
return (dispatch, getState) => {
    const { jobId } = params
    return dispatch(applicantAttachmentCategoryDetailsQuery({ jobId }))
}
}

// ascronus middleware for fetch data 
function applicantAttachmentCategoryDetailsQuery({ jobId = null}) {

return dispatch => {
    return postData('recruitment/RecruitmentApplicant/get_attachment_category_details', { jobId }).then((result) => {
        if (result.status) {
            dispatch(setApplicantAttachmentCategoryDetails(result.data))
        }
    });
}
}

/*
*  applicant mnastage details end 
*/

/*
 * applicant attachment start
 *  set applicant attachment categorydetails setter, getter and middleware 
 */

// action for set applicant stage details
export const setApplicantAttachmentDetails = (data) => ({
    type: 'set_applicant_attachment',
    attachment:data
})


// call middleware from class
export function getApplicantAttachmentDetails(applicantId) {
return (dispatch, getState) => {
    return dispatch(applicantAttachmentDetailsQuery(applicantId))
}
}

// ascronus middleware for fetch data 
function applicantAttachmentDetailsQuery(applicantId) {
return dispatch => {

    return postData('recruitment/RecruitmentApplicant/get_all_attachments_by_applicant_id',{id:applicantId}).then((result) => {
        if (result.status) {
            dispatch(setApplicantAttachmentDetails(result.data))
        }
    });
}
}

/*
*  applicant mnastage details end 
*/

/*
*common action
*/

export function downloadSelectedRecuritmentAttachment(obj) {
    if(Object.keys(obj.state.activeDownload).length>0){
        let requestData = {applicantId: obj.props.applicantDetails.id, downloadData: obj.state.activeDownload};
        postData('recruitment/RecruitmentApplicant/download_selected_file', requestData).then((result) => {
            if (result.status) {
                window.location.href = BASE_URL + "mediaDownload/"+result.zip_name;    
                obj.setState({activeDownload : {},restrictedArchiveDraftContratct:{}},()=>{
                    obj.scrollTopData();
                });
            } else {
            toastMessageShow(result.error,'e');
            }
        });   
    }else{
    toastMessageShow('Please select at least one document for download.','e');
    }
}
export function archiveSelectedRecuritmentAttachment(obj) {
    let restrictedArchiveDraftContratctData= obj.state.restrictedArchiveDraftContratct||{};
    if(Object.keys(restrictedArchiveDraftContratctData).length>0){
        toastMessageShow('Draft contract document can\'t be archived.','e');
    }else if(Object.keys(obj.state.activeDownload).length>0){
        let requestData = {applicantId: obj.props.applicantDetails.id, archiveData: obj.state.activeDownload};
        archiveALL(requestData, 'Are you sure want to archive selected attachment?', 'recruitment/RecruitmentApplicant/archive_selected_file').then((result) => {
            if (result.status) {
                obj.attachmentListRefresh();
                obj.setState({activeDownload : {},restrictedArchiveDraftContratct:{}},()=>{
                    obj.scrollTopData();
                });
            } else if (!result.status) {
                if (result.hasOwnProperty('error') || result.hasOwnProperty('msg')) {
                    let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg : ''));
                    toastMessageShow(msg,'e');
                }
            } else {
                toastMessageShow('Something went wrong please try again.','e');
            }
        });
    }else{
    toastMessageShow('Please select at least one document for Archive.','e');
    }
}
export function selecteRecuritmentAttachment(obj,id,draft_contract) {
    let activeDownloadData =obj.state.activeDownload;
    let restrictedArchiveDraftContratctData = obj.state.restrictedArchiveDraftContratct;
    if(activeDownloadData[id]){
        delete activeDownloadData[id];
        if(restrictedArchiveDraftContratctData[id] && draft_contract>0){
            delete restrictedArchiveDraftContratctData[id];
        }
    }else{
        activeDownloadData[id]=1;
        if(draft_contract>0){
            restrictedArchiveDraftContratctData[id]=1;
        }
    }
    obj.setState({activeDownload:activeDownloadData,restrictedArchiveDraftContratct:restrictedArchiveDraftContratctData});
}

/*
 * applicant stage label notes start
 *  set applicant notes setter, getter and middleware 
 */

// action for set applicant stage details
export const setApplicantAttachementStageNotesDetails = (data) => ({
    type: 'set_applicant_attachment_notes',
    notes:data
})


// call middleware from class
export function getApplicantAttachementStageNotesDetails(applicantId) {
return (dispatch, getState) => {
    return dispatch(applicantAttachementStageNotesDetailsQuery(applicantId))
}
}

// ascronus middleware for fetch data 
function applicantAttachementStageNotesDetailsQuery(applicantId) {
return dispatch => {

    return postData('recruitment/RecruitmentApplicant/get_attachment_stage_notes_by_applicant_id',{id:applicantId}).then((result) => {
        if (result.status) {
            dispatch(setApplicantAttachementStageNotesDetails(result.data))
        }
    });
}
}

/*
*  applicant stage label notes end 
*/

/*
 * applicant stage label notes start
 *  set applicant notes setter, getter and middleware 
 */


// call middleware from class
export function getApplicantLastUpdateDetails(applicantId) {
return (dispatch, getState) => {
    return dispatch(applicantLastUpdateDetailsQuery(applicantId))
}
}

// ascronus middleware for fetch data 
function applicantLastUpdateDetailsQuery(applicantId) {
return dispatch => {

    return postData('recruitment/RecruitmentApplicant/get_lastupdate_by_applicant_id',{id:applicantId}).then((result) => {
        if (result.status) {
            dispatch(setApplicantInfoKeyValue({last_update:result.data}))
        }
    });
}
}

// fetch mandatory document list
export function applicationMandatoryDocument(req) {
    return dispatch => {
        postData('recruitment/RecruitmentApplicant/get_applicant_mandatory_doucment_list', req).then((result) => {
            if (result.status) {
                dispatch({ type: 'SET_MANDATORY_DOCUMENT', data: result.data});
            }
        });
    }
}

//To fetch OnlineAssessment template by its job id
export function onlineAssementTemplate(req) {
    return dispatch => {
        postData('recruitment/OnlineAssessment/get_assessment_templates_by_jobid', req).then((result) => {
            if (result.status) {
                dispatch({ type: 'SET_ASSESSMENT_TEMPLATE', data: result.data});
            }
        });
    }
}