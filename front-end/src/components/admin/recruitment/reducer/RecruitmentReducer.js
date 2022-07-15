const initialState = {
    recruitment_area: [],
    recruiter_admin_actionable_notification:{fetchRecord:false,data:[]},
    activePage:{pageTitle:'',pageType:''},
    recruitment_location: [],
    task_stage_option: [],
    its_recruiter_admin: false,
    documentMandatoryList: [],
    recruiter_data: [],
    recruit_refresh: {
        sms_recipient: false,
        application_feed: false,
        groupbooking_feed: false,
    }
}

const RecruitmentReducer = (state = initialState, action) => {

    switch (action.type) {
        case 'set_recruitment_area':
            return { ...state, recruitment_area : action.area };

        case 'set_active_page_recruitment':
            return {...state, activePage: action.value};

        case 'set_recruiter_admin_actionable_notification_data':
            return {...state, recruiter_admin_actionable_notification: {fetchRecord:false,data:action.data}};
        case 'get_recruiter_admin_actionable_notification_request':
            return {...state, recruiter_admin_actionable_notification: {...state.recruiter_admin_actionable_notification,fetchRecord:action.res}};
        case 'set_task_stage':
            return {...state, ...action.data};
        case 'SET_MANDATORY_DOCUMENT':
            return {
                ...state,
                documentMandatoryList: action.data
            };
        case 'SET_GROUPBOOKING_FEED':
            return {
                ...state,
                groupbooking_feed: action.condition
            };
        case 'SET_APPLICATION_FEED':
            return {
                ...state,
                application_feed: action.condition
            };
        case 'SET_SMS_RECIPIENT':
            let recruit_refresh = state.recruit_refresh;
            recruit_refresh.sms_recipient = action.condition;
            return {
                ...state,
                recruit_refresh: recruit_refresh
            };
        case 'SET_FEED_SMS_RECIPIENT':
            let feed_refresh = state.recruit_refresh;
            feed_refresh.application_feed = action.condition;
            feed_refresh.groupbooking_feed = action.condition;
            return {
                ...state,
                recruit_refresh: feed_refresh
            };
        default:
            return state
    }
}

export default RecruitmentReducer
