const initialState = {
    crmDepartmentData: {
    },
    activePage:{pageTitle:'',pageType:''},
    participaint_details:{'id':''},
    staff_details:{'id':''} 
}

const DepartmentReducer = (state = initialState, action) => {

    switch (action.type) {
        case 'set_crm_department_data':
            return { ...state, crmDepartmentData: action.crmDepartmentData };
        
        case 'set_active_page_crm':
            return {...state, activePage: action.value};

        case 'set_participaint_details_crm':
            return {...state, participaint_details: action.detailsData};

        case 'set_staff_details_crm':
            return {...state, staff_details: action.detailsData};

        default:
            return state
    }
}

export default DepartmentReducer
