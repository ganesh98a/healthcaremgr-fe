const initaileState = {
    subMenuShow: false,
    doc_categorys: []
}

const sidebarData = (state = initaileState, action) => {

    switch (action.type) {
        case 'set_sidebar_subMenu_Show':
            return {...state, subMenuShow: action.subMenuShowData};

        case 'set_doc_category':
            return {...state, doc_categorys: action.docs};
        default:
            return state;
    }
}

export default sidebarData;
    