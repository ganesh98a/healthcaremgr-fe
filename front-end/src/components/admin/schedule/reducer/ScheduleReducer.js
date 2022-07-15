const initialState = {
    shfit_details: {
        id: '',
        shift_location: [],
        preferred_member: [],
        shift_caller: [],
        confirmation_details: [],
        allocated_member: [],
        rejected_data: [],
        shift_participant: [],
    },
    roster_details: {
        id: ''
    },
    activePage: {pageTitle: '', pageType: ''},
    shiftCategoryType: [],
    is_loading: false,
}


const ScheduleReducer = (state = JSON.parse(JSON.stringify(initialState)), action) => {
    switch (action.type) {
        case 'set_schedule_shfits_details_data':
            var x = {...JSON.parse(JSON.stringify(initialState.shfit_details)), ...action.detailsData};
            return {...state, shfit_details: x};

        case 'set_schedule_roster_details_data':
            return {...state, roster_details: action.detailsData};
            
        case 'set_loading_status':
            return {...state, is_loading: action.status};

        case 'set_active_page_schedule':
            return {...state, activePage: action.value};
            
        case 'set_shift_category_type':
            return {...state, shiftCategoryType: action.options};

        default:
            return state;
}
}
export default ScheduleReducer