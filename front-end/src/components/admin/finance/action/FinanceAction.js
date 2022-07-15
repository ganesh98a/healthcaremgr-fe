import {financeActiveTitle} from 'menujson/finance_menu_json';
import { postData,archiveALL,toastMessageShow} from 'service/common.js';
import { ROUTER_PATH} from 'config.js';
import _ from 'lodash';
import { object } from 'prop-types';


export const setActiveSelectPageData= (value) => {
    return {
        type: 'set_active_page_finance',
        value
}}
    
export function setActiveSelectPage(request) {
    return (dispatch, getState) => {
        let pageData =financeActiveTitle;
        let pageType = pageData.hasOwnProperty(request) ? request: 'details';
        let pageTypeTitle = pageData[pageType];
        return dispatch(setActiveSelectPageData({pageType:pageType,pageTitle:pageTypeTitle}))
    }
}

export const setOrganisationDetails = (data) => ({
    type: 'set_finance_organisation_details',
    orgDetail:data
})


// call middleware from class
export function getOrganisationDetails(orgId,extraParms) {
return (dispatch, getState) => {
    return dispatch(organisationQuery(orgId,extraParms))
}
}

// ascronus middleware for fetch data 
function organisationQuery(orgId,extraParms) {
return dispatch => {
    let objData = {id:orgId};
    if(extraParms!=undefined && extraParms!=null && typeof(extraParms)=='object' && Object.keys(extraParms).length>0){
        objData['extraParms'] = extraParms;
    }
    return postData('finance/FinanceCommon/get_organisation_details',objData).then((result) => {
        if (result.status) {
            dispatch(setOrganisationDetails(result.data))
        }
    });
}
}

export const setParticipantDetails = (data) => ({
    type: 'set_finance_participant_details',
    participantDetail:data
})


// call middleware from class
export function getParticipantDetails(partId) {
return (dispatch, getState) => {
    return dispatch(participantQuery(partId))
}
}

// ascronus middleware for fetch data 
function participantQuery(partId) {
return dispatch => {

    return postData('finance/FinanceCommon/get_participant_details',{id:partId}).then((result) => {
        if (result.status) {
            dispatch(setParticipantDetails(result.data))
        }
    });
}
}

export const setSiteDetails = (data) => ({
    type: 'set_finance_site_details',
    siteDetail:data
})


// call middleware from class
export function getSiteDetails(siteId) {
return (dispatch, getState) => {
    return dispatch(siteQuery(siteId))
}
}

// ascronus middleware for fetch data 
function siteQuery(siteId,extraParms) {
return dispatch => {
    let objData = {id:siteId};
    if(extraParms!=undefined && extraParms!=null && typeof(extraParms)=='object' && Object.keys(extraParms).length>0){
        objData['extraParms'] = extraParms;
    }

    return postData('finance/FinanceCommon/get_site_details',objData).then((result) => {
        if (result.status) {
            dispatch(setSiteDetails(result.data))
        }
    });
}
}

export function reSendInvoiceEmail(obj,invoiceId) {
        let requestData = {invoiceId: invoiceId};
        archiveALL({ invoiceId: invoiceId }, "Are you sure want to resend mail?", 'finance/FinanceInvoice/resend_invoice_mail').then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s")
                
            }else if(result.hasOwnProperty('error') || result.hasOwnProperty('msg')){
                let msg = result.hasOwnProperty('error') ? result.error:result.msg;
                toastMessageShow(msg,'e');
            }
        });   
    
}

export function updateInvoiceStatus(obj,invoiceData) {
    let invoiceId = invoiceData.hasOwnProperty('invoiceId') &&  invoiceData.invoiceId>0 ? invoiceData.invoiceId : '';
    let status = invoiceData.hasOwnProperty('status') &&  invoiceData.status!='' ? invoiceData.status : '';
    let preStatus = invoiceData.hasOwnProperty('invoicePreStatus') &&  invoiceData.invoicePreStatus!='' ? invoiceData.invoicePreStatus : '';

    if(status!='' && invoiceId!=''){
        let requestData = {invoiceId:invoiceId, status:status};
        let cnfMsg =preStatus!=''? "Are you sure want to update status from "+_.startCase(preStatus)+" to "+_.startCase(status)+"?":"Are you sure want to update status?";
        archiveALL(requestData, cnfMsg, 'finance/FinanceInvoice/update_invoice_status').then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                if(obj!=null && obj!=undefined && typeof(obj) =='object' && obj.hasOwnProperty('closeUpdateStatusModel')){
                    obj.closeUpdateStatusModel(true);
                }
                
            }else if(result.hasOwnProperty('error') || result.hasOwnProperty('msg')){
                let msg = result.hasOwnProperty('error') ? result.error:result.msg;
                toastMessageShow(msg,'e');
            }
        });   
    }else{
        toastMessageShow('Invalid Request.','e');
    }

}

export const requestInvoiceData = (pageSize, page, sorted, filtered,type) => {
    let requestTypeUrlData = {'1':'finance/FinanceInvoice/ndis_invoice_list','0':'finance/FinanceInvoice/dashboard_invoice_list','2':'finance/FinanceInvoice/get_pending_invoice_list_for_credit_notes','3':'finance/FinanceInvoice/get_credit_notes_list','4':'finance/FinanceInvoice/get_refund_list','5':'finance/FinanceInvoice/get_credit_note_view'};
    let typeRequest = requestTypeUrlData[type]? requestTypeUrlData[type] :'finance/FinanceInvoice/dashboard_invoice_list';
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData(typeRequest, Request).then((result) => {
            if(result.status){
                let filteredData = result.data;
                let otherData = _.omit(result,['data','count','all_count']);
                otherData = Object.keys(otherData).length<=0 ? {} :otherData;

                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    all_count: result.all_count,
                    ...otherData
                };
                resolve(res);
            }
        });
    });
};

export const setHouseDetails = (data) => ({
    type: 'set_finance_house_details',
    houseDetail:data
})


// call middleware from class
export function getHouseDetails(houseId) {
return (dispatch, getState) => {
    return dispatch(houseQuery(houseId))
}
}

// ascronus middleware for fetch data 
function houseQuery(houseId,extraParms) {
return dispatch => {
    let objData = {id:houseId};
    if(extraParms!=undefined && extraParms!=null && typeof(extraParms)=='object' && Object.keys(extraParms).length>0){
        objData['extraParms'] = extraParms;
    }

    return postData('finance/FinanceCommon/get_house_details',objData).then((result) => {
        if (result.status) {
            dispatch(setHouseDetails(result.data))
        }
    });
}
}




