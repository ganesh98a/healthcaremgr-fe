import {getPermission, checkLoginWithReturnTrueFalse} from '../service/common';

const initialState = {
    AllPermission : (checkLoginWithReturnTrueFalse())?((getPermission() == undefined)? {} : JSON.parse(getPermission())):{},
    socketObj: '',
    showHeaderFooter: true,
    public_holidays: [],
}


const Permission = (state = initialState, action) => {

    switch (action.type) {
        case 'setPermissions':
            
            return {...state, AllPermission: action.permission};
        case 'set_websocket_object':
     
            return {...state, socketObj: action.obj};
        case 'set_header_footer_visibility':
     
            return {...state, showHeaderFooter: action.status};
        case 'set_public_holiday':
     
            return {...state, public_holidays: action.public_holiday};
        default:            
            return state;
    }
}

export default Permission