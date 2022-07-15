const initialState = {
    activePage:{pageTitle:'',pageType:''},
    organisationDetails:[],
    participantDetails:[],
    siteDetails:[],
    houseDetails:[],

}

const FinanceReducer = (state = initialState, action) => {

    switch (action.type) {
    
        case 'set_active_page_finance':
            return {...state, activePage: action.value};
        case 'set_finance_organisation_details':
            return {...state, organisationDetails: action.orgDetail};
        case 'set_finance_participant_details':
            return {...state, participantDetails: action.participantDetail};
        case 'set_finance_site_details':
            return {...state, siteDetails: action.siteDetail};
        case 'set_finance_house_details':
            return {...state, houseDetails: action.houseDetail};
        default:
            return state
    }
}

export default FinanceReducer
    