// import * as actionType from './actions/CrmParticipantAction.js';
const initialState = {
    attachment_list: [],
}
const SalesAttachmentReducer = (state = initialState, action) => {

    
    switch (action.type) {
        case 'SET_KEY_VALUE_SALES_ATTACHMENT':
            console.log(action);
            return {
                ...state,
                attachment_list: action.data
            };
        default:
            return state;
    }
}

export default SalesAttachmentReducer
