// import * as actionType from './actions/CrmParticipantAction.js';
const initialState = {
    activity_timeline: [],
}
const SalesActivityReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_KEY_VALUE_SALES_ACTIVITY':
            return {
                ...state,
                ...action.data
            };
        default:
            return state;
    }
}

export default SalesActivityReducer
