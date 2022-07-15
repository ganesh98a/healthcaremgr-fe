const initialState = {
    list_view_control: [],
    list_view_control_by_related_type: {},
    list_view_control_by_id:[]
}
const ListViewControlActivityReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_KEY_VALUE_LIST_VIEW_DEFAULT_PINNED':
            return {
                ...state,
                ...action.data
            };
        case 'LIST_VIEW_CONTROLS_BY_RELATED_TYPE':
            return {
                ...state,
                ...action.data
            };
        case 'LIST_VIEW_CONTROLS_BY_ID':
            return {
                ...state,
                ...action.data
            };
        default:
            return state;
    }
}

export default ListViewControlActivityReducer
