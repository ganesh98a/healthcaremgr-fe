import * as actionType from './actions/DashboardAction.js';
const initialState = {
  allLatestupdates: []
}
export default function DashboardReducer(state = initialState, action) {
  //console.log(action);
  switch(action.type) {
    case actionType.FETCH_ALL_LATEST_UPDATE:
      return {
        ...state,
        loading: false,
        allLatestupdates: action.allLatestupdates
      };
    default:
      return state;
  }
}
