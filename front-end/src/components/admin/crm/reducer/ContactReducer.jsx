// import * as actionType from './actions/CrmParticipantAction.js';
const initialState = {
    PhoneInput: [{ phone: '' }],
    EmailInput: [{ email: '' }],
    organisations: [],
    contacts: [],
    contactOptions: [],
    contactDefaultOptions: [],
    opportunitys : [],
}
const ContactReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_KEY_VALUE':
            return {
                ...state,
                ...action.data
            };
        case 'EMAIL_ACT_CONTACT_OPTIONS_DEFAULT':
            let contact_option_default = state.contactDefaultOptions;
            if (action.data && action.data.contact_option) {
                contact_option_default = action.data.contact_option;
            }
            return {
                ...state,
                contactDefaultOptions: contact_option_default
            };
        case 'EMAIL_ACT_CONTACT_OPTIONS':
            let contact_option = state.contactOptions;
            if (action.data && action.data.contact_option) {
                contact_option = action.data.contact_option;
            }
            let default_id;
            if (state.contactDefaultOptions && state.contactDefaultOptions[0]) {
                default_id = state.contactDefaultOptions[0]['id'];
            }
            // remove contact if already exist in default by find index with id
            let match_index = contact_option.findIndex((contact)=>contact.id == default_id);
            if (match_index > -1) {
                // contact_option.splice(match_index, 1);
            }
            return {
                ...state,
                contactOptions: [ ...state.contactDefaultOptions, ...contact_option]
            };
        default:
            return state;
    }
}

export default ContactReducer
