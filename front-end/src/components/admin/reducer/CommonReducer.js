
const initialState = {
    states: {
        loading: false,
        /**
         * @type {{label: string, value: number|string}[]}
         */
        data: [],
    },
    title: {
        loading: false,
        /**
         * @type {{label: string, value: number|string}[]}
         */
        data: [],
    },
    request_list_data: {},
    dataTableValues: {
        pageSize: 20,
        items: [],
        prevItems: [],
        pages: 0,
        totalItem: 0,
        hasMore: true,
        currentPage: 0,
        prevPage: 0,
    },
    isApiCallDone: false
}


export default function CommonReducer(state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case 'FETCH_STATE_LIST_STARTED':
            return {
                ...state,
                states: { 
                    ...state.states, 
                    loading: true 
                }
            }
        case 'FETCH_STATE_LIST_SUCCESS':
            return {
                ...state,
                states: {
                    ...state.states,
                    loading: false,
                    data: payload.data,
                }
            }
        case 'FETCH_STATE_LIST_FAILED':
            return {
                ...state,
                states: {
                    ...state.states,
                    loading: false,
                }
            }
        case 'FETCH_TITLE_OPTIONS_STARTED':
            return {
                ...state,
                title: {
                    ...state.title,
                    loading: true,
                }
            }
        case 'FETCH_TITLE_OPTIONS_SUCCESS':
            return {
                ...state,
                title: {
                    ...state.title,
                    loading: false,
                    data: payload.data,
                }
            }
        case 'FETCH_TITLE_OPTIONS_FAILED':
            return {
                ...state,
                title: {
                    ...state.title,
                    loading: false,
                }
            }
        case 'SET_DATA_TABLE_LIST_REQUEST':
            return {
                ...state,
                request_list_data: action.data
            };
        case 'SET_DATA_TABLE_LOAD_MORE_FALSE':
            let dataTableValuesHasMore = state.dataTableValues;
            dataTableValuesHasMore.hasMore = false;
            return {
                ...state,
                dataTableValues: dataTableValuesHasMore
            };
        case 'SET_DATA_TABLE_PAGE_SIZE':
            let data_page_size = action.data;
            let dataTableValuesPageSize = state.dataTableValues;
            if (data_page_size) {
                dataTableValuesPageSize.pageSize = data_page_size;
            }
            return {
                ...state,
                dataTableValues: dataTableValuesPageSize
            };  
        case 'SET_DATA_TABLE_LIST':
            let data = action.data;
            let dataTableValues = state.dataTableValues;


            if (action.list_reset === true) {
                dataTableValues.items = [];
                dataTableValues.prevItems = [];
            }
            
            if (data && data.status) {
                
                dataTableValues.prevItems = dataTableValues.items;
                dataTableValues.items = data.data;
                dataTableValues.pages = data.count;
                dataTableValues.totalItem = data.total_item;
                dataTableValues.hasMore = (Number(dataTableValues.totalItem) === dataTableValues.items.length) ? false :  true;
                dataTableValues.currentPage = dataTableValues.currentPage + 1;
                
            } else {
                dataTableValues.items = [];
                dataTableValues.pages = 0;
            }
            if (action && action.clear_all && action.clear_all === true) {
                dataTableValues.prevItems = [];
                dataTableValues.currentPage = 0;
            }

            if (dataTableValues.prevItems) {
                dataTableValues.items = [ ...dataTableValues.prevItems, ...data.data];
            }
            return {
                dataTableValues: dataTableValues,
                ...state
            };
        case 'IS_API_CALL_DONE':
            return {
                ...state,
                isApiCallDone: action.isApiCallDone
            }
        case 'SET_DATA_TABLE_ITEMS':
            var list = action.data;
            let dataTableListItem = state.dataTableValues;
            if (list) {
                dataTableListItem.items = list;
            }
            return {
                ...state,
                dataTableValues: dataTableListItem
            };
        default:
            return state
    }
}