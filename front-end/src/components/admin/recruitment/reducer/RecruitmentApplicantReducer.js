const initialState = {
    details:[],
    phones: [],
    emails: [],
    // addresses: [],
    address: '',
    references: [],
    applications: {},
    stage_details: [],
    question_answer:{seek: [], website: []},
    applicant_progress: 0,
    phone_interview_classification: false,
    group_interview: [],
    last_update: [],
    history_group_interview: [],
    work_area_option: [],
    pay_point_option: [],
    pay_level_option: [],
    pay_scale_details: [],
    pay_scale_approval: [],
    history_cab_day_interview: [],
    cab_day_interview: [],
    attachment_category_list :[],
    attachment_list:[],
    applicant_document_cat:[],
    attachment_notes_list:[],
    info_loading: false,
    stage_status_details:{previous_stage:0,current_stage:1},
    individual_interview:[],
    history_individual_interview:[],    
    OAtemplateList:[]
}

const RecruitmentApplicantReducer = (state = initialState, action) => {

    switch (action.type) {
        case 'set_applicant_info':
            return {...state, ...action.applicantInfo};

        case 'set_applicant_main_stage_details':
            // console.log(action.stageDetails, "stageDetails");
            return {...state, ...action.stageDetails};
            
        case 'set_applicant_stage_wise_details':
            return {...state, ...action.stageDetails};
        
        case 'set_applicant_stage_wise_open_status': {
            var index = state.stage_details.findIndex(x => x.stage_number == action.stage_number);

            if(index > -1){
                var stage_details = state.stage_details;
                stage_details[index]['its_open'] = action.its_open;
                
                return {...state, stage_details: stage_details};
            }
        }
        case 'set_applicant_attachment_category': 
            return {...state,attachment_category_list:action.attachmentCategory};
        case 'set_applicant_attachment': 
            return {...state,attachment_list:action.attachment};
        case 'set_applicant_attachment_notes': 
            return {...state,attachment_notes_list:action.notes};
            
        case 'set_applicant_info_key_value': 
            return {...state, ...action.obj};
            
        case 'set_applicant_stage_wise_details_loading_status': 
            var index = state.stage_details.findIndex(x => x.stage_number == action.stage_number);

            if(index > -1){
                var stage_details = state.stage_details;
                stage_details[index]['its_loading'] = action.its_loading;
                //console.log(stage_details[index], 'stage_details');
                return {...state, stage_details: JSON.parse(JSON.stringify(stage_details))};
            }
        case 'SET_ASSESSMENT_TEMPLATE':
            return {
                ...state,
                OAtemplateList: action.data
            };
        default:
            return state;
}
}

export default RecruitmentApplicantReducer
    