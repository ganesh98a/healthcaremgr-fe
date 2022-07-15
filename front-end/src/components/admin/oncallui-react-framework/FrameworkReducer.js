
const initialState = {
    openCreateModal: false,
    displayed_columns: [],
    loadData: {api: false, data: {}},
    open_modal: false,
    modal_content: ""
}
/************ Event Block ****************/
const open_create_model_action = (status, loadData) => {
    return {
        type: 'OPEN_CREATE_MODAL',
        payload: {status, loadData}
    }
}
const open_modal_action = (status, content) => {
    return {
        type: 'OPEN_MODAL',
        payload: {status, content}
    }
}
const show_hide_column = (payload) => {
    return {
        type: 'show_hide_column',
        payload
    }
}
/******************************************/
/************ Reducer Block ****************/
const FrameworkReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'OPEN_CREATE_MODAL':
            return {
                ...state,
                openCreateModal: action.payload.status,
                loadData: action.payload.loadData
            }
        case 'OPEN_MODAL':
            return {
                ...state,
                open_modal: action.payload.status,
                modal_content: action.payload.content
            }
        case 'show_hide_column':
            return {
                ...state,
                displayed_columns: {...action.payload.displayed_columns}
            }
        default:
            return state;
    }
}
/******************************************/
/************ Dispatcher Block ****************/
export function openCreateModal(status, loadData) {
    return (dispatch) => {
        dispatch(open_create_model_action(status, loadData))
    }
}

export function openModal(status, content = null) {
    return (dispatch) => {
        dispatch(open_modal_action(status, content))
    }
}

export function showHideColumns(cols) {
    return (dispatch) => {
        dispatch(show_hide_column(cols))
    }
}
/******************************************/
export default FrameworkReducer