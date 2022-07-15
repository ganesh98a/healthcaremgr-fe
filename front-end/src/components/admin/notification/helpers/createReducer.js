// @ts-check


/**
 * @template S
 * @param {S} initialState 
 * @param {Record<string, (state: S, action: {type: string, payload?: any, response?: import("axios").AxiosResponse, error?: import("axios").AxiosResponse}) => S>} handlers 
 */
export default function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action)
        } else {
            return state
        }
    }
}

/** 
 * Helper method to help intellisense get possible action types (Will be determined from keys of `handlers`)
 * 
 * @template S
 * @param {S} initialState
 * @param {Record<string, (state: S, action: {type: string, payload?: any, response?: import("axios").AxiosResponse, error?: import("axios").AxiosResponse}) => S>} handlers
 */
export function createReducerSlice(initialState, handlers) {
    return {
        reducer(state = initialState, action) {
            if (handlers.hasOwnProperty(action.type)) {
                return handlers[action.type](state, action)
            } else {
                return state
            }
        },
        // @ts-ignore
        ActionTypes: null // do not call this directly in your code
    }
}