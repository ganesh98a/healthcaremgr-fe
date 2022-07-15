import { postData } from 'service/common.js'

// action for set submenu show on sidebar menu or not
export function setSubmenuShow(status) {
    return {
        type: 'set_sidebar_subMenu_Show',
        subMenuShowData: Boolean(status),
    }
}



export function getDocCategory(request) {
    return dispatch => {
       
        return postData('common/Common/get_document_category_by_user_type', request).then((result) => {
            if (result.status) {
                dispatch(setDocCategory(result.data))
            }
        });
    }
    function setDocCategory (docs) {
       return {type: 'set_doc_category',
        docs
    }
    }

}