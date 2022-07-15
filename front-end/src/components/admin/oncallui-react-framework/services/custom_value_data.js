import React from 'react';

export const graphViewType = [{name:'week'},{name:'month'},{name:'year'}];
export const urlNotification = {"1":"flagged_applicants","2":"PayRateApproval","3":"duplicate_applicants"};
export const taskProirtyRecruitment = {"low":{"type":"group","name":"Group Interview","className":"low_t"},'medium':{"type":"cab","name":"CAB Day","className":"medium_t"},'high':{"type":"other","name":"Others","className":"high_t"}};
export const taskRecruitmentDashboard = {"1":{"type":"New","className":"drk-color4","color":"#136283"},'2':{"type":"In-Progress","className":"drk-color2","color":"#39a4d1"},'3':{"type":"Unsuccessful","className":"drk-color3","color":"#2082ac"}};
export const NottachmentAvailable = (props)=> (<div className={"no_record py-2 w-100 "+props.extraClass}>{props.msg}</div>);
NottachmentAvailable.defaultProps ={
    msg :"No attachment available",
    extraClass:''
};
export const colorCodeCABDay = {'successful':'clr_green','unsuccessful':'clr_red','pending':'clr_yellow','in progress':'clr_blue','completed':'clr_green'};
export const progressQuizColorCodeCABDay = {'successful':'success_color_01_','unsuccessful':'danger_color_01_','pending':'pending_color_01_','in progress':'progress_color_01_','completed':'success_color_01_'};
export const progressContractColorCodeCABDay = {'successful':'success_color_02_','unsuccessful':'danger_color_02_','pending':'pending_color_02_','in progress':'progress_color_02_','completed':'success_color_02_'};
export const typeOfInterViewResult = {'group_interview_result':'group_interview','cabday_interview_result':'cab_day'};
export const colorCodeFinanceShift = {'pending':'btn_color_unavailable pointer-events-none','completed':'btn_color_avaiable pointer-events-none','resolved':'btn_color_avaiable pointer-events-none','disputed':'btn_color_ndis','cancelled':'btn_color_archive pointer-events-none'};
export const colorCodeFinancePayroll = {'expired soon':'btn_color_unavailable pointer-events-none','active':'btn_color_avaiable pointer-events-none','inactive':'btn_color_ndis','expired':'btn_color_archive pointer-events-none'};
export const warningIconColorCodeFinancePayroll = {'expired soon':'text-warning','expired':'text-danger'};
export const checkBoxFinancePayrollExemptionAllowStatus = ['active','expired soon'];
export const warningIconColorFinancePayrollExemptionShowAllowStatus = ['expired','expired soon'];
export const iconFinanceShift = {'participant':'Participant_icon','site':'Site_icon','sub_org':'Sub_org_icon','org':'Org_icon','member':'Member_icon','house':'House_icon','sub organisation':'Sub_org_icon','organisation':'Org_icon'};
export const iconFinanceShiftByTypeValue = {'2':'Participant_icon','1':'Site_icon','5':'Sub_org_icon','4':'Org_icon','3':'Participant_icon', '6':'Other_icon', '7':'House_icon'};
export const payrollExemptionFinanceStatus = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'expired soon', label: 'Expired Soon' }
];
export const defaultSpaceInTable = (value)=> (value!=undefined && value!=null && ( value.length>0 || value=='0')  ? value : <React.Fragment>&nbsp;</React.Fragment>);
export const colorCodeInvoiceStatus = {'payment received':'btn_color_avaiable pointer-events-none','payment not received':'btn_color_archive pointer-events-none','payment pending':'btn_color_unavailable pointer-events-none'};
export const colorCodeCreditNoteStatus = {'used':'btn_color_avaiable pointer-events-none'};
