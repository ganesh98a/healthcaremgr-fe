import moment from 'moment';

const WeekData = {
    Mon: [{"is_active": false}],
    Tue: [{ is_active: false }],
    Wed: [{ is_active: false }],
    Thu: [{ is_active: false }],
    Fri: [{ is_active: false }],
    Sat: [{ is_active: false }],
    Sun: [{ is_active: false }]
}

const week_mapping = {Mon: "Monday", Tue: "Tuesday",Wed: "Wednesday",Thu: "Thursday", Fri: "Friday",Sat: "Saturday",Sun: "Sunday"};


const initialState = {
    data_loaded: false,
    update_disabled: false,
    is_default: 2,
    participant: {},
    rosterList : [WeekData],
    stateList: [],
    time_of_days:[],
    participant_address: [],
    assistance:[],
    booker_list:[],
    mobility:[],
    week_mapping: week_mapping,
    plan_line_item: [],
    will_remove_roster_shiftId : [],
}


const CreateRosterReducer = (state = {...JSON.parse(JSON.stringify(initialState))}, action) => {
    switch (action.type) {
        case 'on_change_method':
            return {...state, [action.key] : action.value};

        case 'set_key_value_data':
            return {...state, ...action.options};

        case 'set_active_page_schedule':
            return {...state, activePage: action.value};
            
        case 'set_shift_category_type':
            return {...state, shiftCategoryType: action.options};
            
        case 'set_roster_list':
            return {...state, rosterList: [...action.data]};
            
        case 'update_plan_line_item_fund':
            return {...state, plan_line_item : {...action.data}};
            
        case 'update_remove_roster_shiftId':
            return {...state, will_remove_roster_shiftId : [...state.will_remove_roster_shiftId, action.roster_shiftId]};
            
        case 'reset_roster':
            return { ...JSON.parse(JSON.stringify(initialState))};

        default:
            return state;
    }
}
export default CreateRosterReducer