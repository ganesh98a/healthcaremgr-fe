import { createReducerSlice } from '../helpers/createReducer'

/**
 * @typedef { 'FETCH_INFOGRAPHICS_LOADING' | 'FETCH_INFOGRAPHICS_SUCCESS' | 'FETCH_INFOGRAPHICS_FAILED' } ActionTypes
 * @typedef { typeof initialState } State
 */

const initialState = {
    loading: false,

    /** @type {{[url: string]: {[key: string]: any, items: any[], fetched_at?: number|null}}} */
    data: {},

    /** @type {number|null} */
    fetched_at: null,

    /** @type {string[]} */
    errors: [],
}

const slice = createReducerSlice(initialState, {
    "FETCH_INFOGRAPHICS_LOADING": (state, action) => ({
        ...state,
        loading: true,
    }),
    "FETCH_INFOGRAPHICS_SUCCESS": (state, action) => {
        return {
            ...state,
            loading: false,
            data: {
                ...state.data,
                [action.page_url]: {
                    ...state.data[action.page_url],
                    items: action.response.data['data'] || [],
                    fetched_at: Date.now(),
                }
            },
            fetched_at: Date.now(),
            errors: [],
        }
    },
    "FETCH_INFOGRAPHICS_FAILED": (state, action) => ({
        ...state,
        loading: false,
        fetched_at: null,
        errors: ["Could not fetch infographics"]
    })
})

export default slice.reducer