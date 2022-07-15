// import * as actionType from './actions/CrmParticipantAction.js';
const initialState = {
  participantData: [],
  alllplansids:[]
}
const CrmParticipantReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'CRM_PARTICIPANT_DATA':
      return {
        ...state,
        loading: false,
        participantData: action.participantData
      };
      case 'STATES':
        return {
          ...state,
          loading: false,
          states2: action.states
        };
      case 'PLANLIST':
        return {
          ...state,
          loading: false,
          plans: action.planlist
        };
        case 'ALLPLANLISTIDS':
          return {
            ...state,
            loading: false,
            alllplansids: action.planids
          };
    default:
      return state;
  }
}

export default CrmParticipantReducer
