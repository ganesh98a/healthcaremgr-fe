/*All dropdown of recruitment area*/

export function recruitmentStatus() {
    return [{ value: '0', label: 'Pending' }, { value: '1', label: 'Active' }];
}

export function recruitmentActionType() {
    return [
        { value: '1', label: 'Review Online Application' },
        { value: '2', label: 'Phone interview' },
        { value: '3', label: 'Group Interview' },
        { value: '4', label: '1-1 Interview' },
        { value: '5', label: 'Mandatory Documentation' },
        { value: '6', label: 'Reference Checks' },
        { value: '7', label: 'CAB day' },
        { value: '8', label: 'Hiring Stage' },
        { value: '9', label: 'None' },
    ];
}

export function tastPriorityOptions() {
    return [
        { value: '1', label: 'Low' },
        { value: '2', label: 'Medium' },
        { value: '3', label: 'High' },
    ];
}

//export function recruitmentLocation(key) {
//    var interpreter = [{value: '1', label: 'HCM Training Facility - Training Room'}, {value: '2', label: 'At Desk'}];
//
//    if (parseInt(key) > 0) {
//        var index = interpreter.findIndex(x => x.value == key)
//        return interpreter[index].label;
//    } else {
//        //console.log(key);
//        return interpreter;
//    }
//}

export function recruitmentTempDropDown() {
    return [{ value: '0', label: 'Option 1' }, { value: '1', label: 'Option 2' }];
}

export function recruitmentQuestionFilter() {
    return [{ value: 'all', label: 'All Question' }, { value: 'current_question', label: 'Current Question' }, { value: 'archive_question', label: 'Current Question' }];
}

export function taskStatusOption() {
    return [{ value: '1', label: 'In progress' }, { value: '2', label: 'Completed' }, { value: 3, label: 'Cancelled' }, { value: 4, label: 'Archived' }];
}

export function applicantStageStatus(key, applicant_result, need_check, extraParm) {
    // disable option according to applicant result
    var complete_disable = false;
    var unsuccessfull_disable = false;

    let is_recruiter_admin = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('is_recruiter_admin') ? extraParm.is_recruiter_admin : 0;
    let in_progress_allow_to_enable = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_inporgress_status_change') ? extraParm.allow_inporgress_status_change : 0;
    let allow_inporgress_status_unsuccess = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_inporgress_status_unsuccess') ? extraParm.allow_inporgress_status_unsuccess : 0;
    let allow_unsuccess_status_change = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_unsuccess_status_change') ? extraParm.allow_unsuccess_status_change : 0;
    let inprogress_disable = (is_recruiter_admin == 1 && in_progress_allow_to_enable == 1) ? false : true;

    if (need_check) {
        complete_disable = applicant_result == 1 ? false : true
        unsuccessfull_disable = applicant_result == 2 ? false : true
    }

    if (!inprogress_disable) {
        complete_disable = unsuccessfull_disable = true;
    }

    if (allow_inporgress_status_unsuccess == 1) {
        inprogress_disable = is_recruiter_admin == 0 || is_recruiter_admin == undefined ? true : false;
        complete_disable = true;
    }

    if (allow_unsuccess_status_change == 1) {
        unsuccessfull_disable = false;
    }

    var interpreter = [
        { value: '1', label: 'Pending', disabled: true },
        { value: '2', label: 'In-Progress', disabled: inprogress_disable },
        { value: '3', label: 'Completed', disabled: complete_disable },
        { value: '4', label: 'Unsuccessfull', disabled: unsuccessfull_disable }
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}


export function applicantCabStageStatus(key, applicant_result, need_check, extraParm) {
    // disable option according to applicant result
    var complete_disable = false;
    var unsuccessfull_disable = false;

    let is_recruiter_admin = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('is_recruiter_admin') ? extraParm.is_recruiter_admin : 0;
    let in_progress_allow_to_enable = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_inporgress_status_change') ? extraParm.allow_inporgress_status_change : 0;
    let inprogress_disable = (is_recruiter_admin == 1 && in_progress_allow_to_enable == 1) ? false : true;
    let allow_unsuccess_status_change = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_unsuccess_status_change') ? extraParm.allow_unsuccess_status_change : 0;
    let allow_completed_status = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_completed_status') ? extraParm.allow_completed_status : 1;
    let signed_status = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('signed_status') ? extraParm.signed_status : 0;
    if (need_check) {
        complete_disable = applicant_result == 1 ? false : true
        unsuccessfull_disable = applicant_result == 2 ? false : true
    }

    if (!inprogress_disable) {
        complete_disable = unsuccessfull_disable = true;
        // unsuccessfull_disable = applicant_result == undefined ? false : true;
    }

    if (allow_unsuccess_status_change == 1) {
        unsuccessfull_disable = false;
    }

    if (allow_completed_status == 0 && (signed_status == 0 || signed_status == undefined)) {
        complete_disable = true;
    }

    var interpreter = [
        { value: '1', label: 'Pending', disabled: true },
        { value: '2', label: 'In-Progress', disabled: inprogress_disable },
        { value: '3', label: 'Completed', disabled: complete_disable },
        { value: '4', label: 'Unsuccessfull', disabled: unsuccessfull_disable }
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function applicantStageStatusFInalStage(key, applicant_result, need_check, extraParm) {
    // disable option according to applicant result
    var complete_disable = false;
    var unsuccessfull_disable = false;

    let is_recruiter_admin = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('is_recruiter_admin') ? extraParm.is_recruiter_admin : 0;
    let in_progress_allow_to_enable = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_inporgress_status_change') ? extraParm.allow_inporgress_status_change : 0;
    let inprogress_disable = (is_recruiter_admin == 1 && in_progress_allow_to_enable == 1) ? false : true;
    let allow_unsuccess_status_change = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('allow_unsuccess_status_change') ? extraParm.allow_unsuccess_status_change : 0;
    let prev_stage_status = extraParm != null && typeof(extraParm) == 'object' && extraParm.hasOwnProperty('prev_stage_status') ? extraParm.prev_stage_status : 0;

    if (need_check) {
        complete_disable = applicant_result == 1 ? false : true
        unsuccessfull_disable = applicant_result == 2 ? false : true
    }

    if (!inprogress_disable) {
        complete_disable = unsuccessfull_disable = true;
    }

    if (allow_unsuccess_status_change == 1) {
        unsuccessfull_disable = false;
    }

    if (complete_disable == false && Number(prev_stage_status) != 3) {
        complete_disable = true;
    }

    console.log('prev_stage_status', prev_stage_status, complete_disable);
    var interpreter = [
        { value: '1', label: 'Pending', disabled: true },
        { value: '2', label: 'In-Progress', disabled: inprogress_disable },
        { value: '3', label: 'Hired', disabled: complete_disable },
        { value: '4', label: 'Unsuccessfull', disabled: unsuccessfull_disable }
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}
export function phoneInterviwApplicantClassification(key) {
    var interpreter = [
        { value: '1', label: 'Skilled' },
        { value: '2', label: 'Job Ready' },
        { value: '3', label: 'Training Required' }
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}
export function duplicateStatus() {
    return [
        { value: 'all', label: 'Show All' },
        { value: '2', label: 'Accepted' },
        { value: '1', label: 'Pending' },
        { value: '3', label: 'Rejected' },
    ];
}
export function PayScaleStatus() {
    return [
        { value: 'all', label: 'Show All' },
        { value: '0', label: 'Pending' },
        { value: '1', label: 'Approved' },
    ];
}

export function questionStatus(key, view) {
    var interpreter = [{ value: 1, label: 'Active' }, { value: 2, label: 'Inactive' }];
    if (view != '') {
        var interpreter = [{ value: 'all', label: 'All' }, { value: 1, label: 'Active' }, { value: 2, label: 'Inactive' }];
    }
    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function trainingCategory(key) {
    var interpreter = [{ value: 1, label: 'Group Interview' }, { value: 2, label: 'CAB Day' }, { value: 3, label: 'Reference Check' }, { value: 4, label: 'Phone Interview' }];
    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function answerTypeDrpDown(key, type = 'forAllPlace') {
    if (type == 'forAllPlace') {
        return [{ value: '2', label: 'Single Choice Answer' }, { value: '1', label: 'Multiple Choice Answer' }, { value: '3', label: 'True/False' }, { value: '4', label: 'Short Answers' },{value:'5',label: 'Comprehensive Passage' },{value:'6',label: 'Fill Up question' }];
    } else if (type == 'questionList') {
        var interpreter = [{ value: '2', label: 'Single Choice Answer' }, { value: '1', label: 'Multiple Choice Answer' }, { value: '3', label: 'True/False' }, { value: '4', label: 'Short Answers' },{value:'5',label: 'Comprehensive Passage' },{value:'6',label: 'Fill Up question' }];
        if (parseInt(key) > 0) {
            var index = interpreter.findIndex(x => x.value == key)
            return interpreter[index].label;
        } else {
            return interpreter;
        }     
    }
    else {
        return  [{ value: '2', label: 'Single Choice' }, { value: '1', label: 'Multiple Choice' }, { value: '3', label: 'True/False' }, { value: '4', label: 'Short Answers' }];
    }
}

export function disabeSelOptions(key) {
    var interpreter = [{ value: 1, label: 'Disable staff user account' }];
    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function recruitmentAllocationSelectionOptions(key) {
    var interpreter = [{ value: 1, label: 'Auto Allocation' }, { value: 2, label: 'Custom Selection (Search)' }];
    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function applicantReferenceStatusApproveDeny(key) {
    var interpreter = [{ value: 1, label: 'Approved' }, { value: 2, label: 'Rejected' }];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function applicantAttchmentDocumentShow() {
    return [
        { value: "0", label: "Current Documents" },
        { value: "1", label: "Archived Documents" }
    ];
}

export function applicantQuizResultStatus(key) {
    var interpreter = [
        { value: '0', label: 'Pending' },
        { value: '1', label: 'Success' },
        { value: '2', label: 'UnSuccess' },
        { value: '3', label: 'In-Progress' },
        { value: '4', label: 'Parked' },
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function manageGroupInterviewStatus(key) {
    var interpreter = [
        { value: '4', label: 'All' },
        { value: '1', label: 'Completed' },
        { value: '2', label: 'Pending' },
        { value: '3', label: 'In-Progress' },
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function manageCabdayInterviewStatus(key) {
    var interpreter = [
        { value: '0', label: 'All' },
        { value: '3', label: 'Completed' },
        { value: '1', label: 'Pending' },
        { value: '2', label: 'In-Progress' },
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function applicantCabDayDocumentStatus(key, document_result, need_check) {
    // disable option according to applicant result
    var complete_disable = false;
    var pending_disable = false;
    var unsuccess_disable = false;

    if (need_check) {
        pending_disable = document_result == 0 ? false : true;
        complete_disable = document_result == 0 || document_result == 1 ? false : true;
        unsuccess_disable = document_result == 0 || document_result == 2 ? false : true;
    }

    var interpreter = [
        { value: '0', label: 'Pending', disabled: pending_disable },
        { value: '1', label: 'Success', disabled: complete_disable },
        { value: '2', label: 'Unsuccess', disabled: unsuccess_disable }
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function logType(key) {
    var interpreter = [
        { value: 0, label: 'All' },
        { value: 1, label: 'SMS' },
        { value: 2, label: 'Email' },
        { value: 3, label: 'Phone' },
    ];

    if (parseInt(key) > 0) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}
export function yesOrNoOption() {
    return [
        { value: "1", label: 'Yes' },
        { value: "0", label: 'No' }
    ];
}

export function CorrectOrNotOption() {
    return [
        { value: 1, label: 'Correct' },
        { value: 0, label: 'Incorrect' }
    ];
}

export function FillUpAnswerType() {
    return [
        { value: 1, label: 'Free Text' },
        { value: 2, label: 'Selectable' }
    ];
}
