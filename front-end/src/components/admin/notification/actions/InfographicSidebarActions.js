import { postData } from "../../../../service/common"

/**
 * @template T, S, P
 * @typedef {{types: [T, T, T], shouldCallAPI: (state: S) => boolean, callAPI: () => Promise, payload: P}} CallAPIAction
 */

/**
 * @param {string} page_url
 * @returns {CallAPIAction<string, {infographics: import('../reducer/infographics').State}, any>}
 */
export function fetchInfographics(page_url) {
    return {
        types: ['FETCH_INFOGRAPHICS_LOADING', 'FETCH_INFOGRAPHICS_SUCCESS', 'FETCH_INFOGRAPHICS_FAILED'],
        shouldCallAPI: ({ infographics }) => {
            const { data } = infographics
            if (page_url in data && Array.isArray(data[page_url].items) && data[page_url].items.length > 0) {
                return false;
            }

            return true
        },
        callAPI: () => postData(`common/common/get_infographics`, { module: 'admin portal', page_url: page_url }).then(json => ({ data: json })),
        payload: { page_url },
    }
}
