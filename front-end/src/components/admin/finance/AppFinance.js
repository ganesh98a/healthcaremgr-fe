
import React, { Component } from 'react';

import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { financeJson, financeHideShowSubmenusPermissionBase,financeHideShowSubmenus } from 'menujson/finance_menu_json';
import { setFooterColor } from '../../admin/notification/actions/NotificationAction.js';
import { setSubmenuShow } from 'components/admin/actions/SidebarAction';
import { connect } from 'react-redux'
import Sidebar from '../Sidebar';
import FinanceDashboard from './FinanceDashboard.js';

import LineItemListing from './line_item/LineItemListing';
import CreateNewLineItem from './line_item/CreateNewLineItem';
import ImportLineItem from './line_item/ImportLineItem';
import ImportLineItemMetaData from './line_item/ImportLineItemMetaData';
import ImportLineItemMetaDataWithPrice from './line_item/ImportLineItemMetaDataWithPrice';

import StatementsDashboard from './StatementsDashboard';
import ShiftsQueries from './ShiftsQueries';
import Shifts from './shift_and_payroll/Shifts';
import UploadPayrollExemption from './shift_and_payroll/UploadPayrollExemption';
//import PayrollTax from './PayrollTax';
import PayrollTaxIndividual from './PayrollTaxIndividual';
import PayrollExemption from './shift_and_payroll/PayrollExemption';
import PayrollExemptionHistory from './shift_and_payroll/PayrollExemptionHistory';
import Payroll from './shift_and_payroll/Payroll';
import NDISErrorTracking from './NDISErrorTracking';
import NDISBilling from './invoice/NDISBilling';
import Refunds from './invoice/Refunds';
import CreditNotes from './invoice/CreditNotes';
import InvoiceSchedulerHistory from './invoice/InvoiceSchedulerHistory';
import LineItemPricingGroups from './LineItemPricingGroups';


import QuoteDashboard from './quote/QuoteDashboard';
import CreateNewCustomer from './quote/CreateNewCustomer';
import CreateQuote from './quote/CreateQuote';
import ViewQuote from './quote/ViewQuote';

import PayratesDashboard from './payrate/PayratesDashboard';
import Payrates from './payrate/Payrates';
import Timesheets from './timesheet/Timesheets';
import Chargerates from './chargerate/Chargerates';
import TimesheetDetails from './timesheet/TimesheetDetails';
import TimesheetLineItemsList from './timesheet/TimesheetLineItemsList';
import NDISErrorTrackingList from './NDISErrorTrackingList';

import InvoiceDetails from './invoice/InvoiceDetails';
import InvoiceLineItemsList from './invoice/InvoiceLineItemsList';
import InvoiceShiftsList from './invoice/InvoiceShiftsList';
import Invoices from './invoice/Invoices';

import InvoicesDashboard from './invoice/InvoicesDashboard';
import ViewInvoice from './invoice/ViewInvoice';
import InvoiceScheduler from './invoice/InvoiceScheduler';
import ImportNdisInvoiceStatus from './invoice/ImportNdisInvoiceStatus';
import AuditLogsDash from './AuditLogsDash';


import CreateNewStatement from './CreateNewStatement';
import ApplyCreditNote from './ApplyCreditNote';
import CreateCreditNote from './invoice/CreateCreditNote';
import CreateManualInvoice from './invoice/CreateManualInvoice';

import CreateNewPayrate from './payrate/CreateNewPayrate';
import CreateNewLineItemGroup from './CreateNewLineItemGroup';
import UploadCSV from './UploadCSV';

import NdisInvoices from './invoice/NdisInvoices';
import ShiftsAndPayrollDash from './shift_and_payroll/ShiftsAndPayrollDash';
import AddFinanceUser from './user_management/AddFinanceUser';
import FinanceUserListing from './user_management/FinanceUserListing';
import PageTypeChange from './common/PageTypeChange';
import { BrowserRouter as Router, Route, Switch, NavLink, Redirect } from 'react-router-dom';
import {getPermission,checkLoginWithReturnTrueFalse,checkItsNotLoggedIn} from 'service/common.js';
import _ from 'lodash';
import PageNotFound from '../../admin/PageNotFound';
import ViewStatement from './ViewStatement';

import SetLineItem from './wizard/SetLineItem.js';
import SetPayRates from './wizard/SetPayRates.js';
import SetInvoiceTemplate from './wizard/SetInvoiceTemplate.js';
import SetPayrollExemption from './wizard/SetPayrollExemption.js';
import SetCreditNotes from './wizard/SetCreditNotes.js';
import Integrations from './wizard/Integrations.js';
import { FinanceMenu } from '../GlobalMenu.jsx';
import { css } from '../../../service/common.js';

const menuJson = () => {
    let menu = financeJson;
    return menu;
}
let cssLoaded = false;

class AppFinance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subMenuShowStatus: true,
            menus: menuJson(),
            showMobNav: false
        }
        this.permission = (getPermission() == undefined) ? [] : JSON.parse(getPermission());
    //console.log('sdds',this.permission);
    }
    componentDidMount(){
        this.checkPermissionMenu();      
    }

    permissionRediect = () => {
        if(!checkLoginWithReturnTrueFalse()){
             return <Redirect to={ROUTER_PATH} />;
        }else{
            return <Redirect to={ROUTER_PATH+'admin/no_access'} />;
        }
        checkItsNotLoggedIn();
    }

    getObjectValuePermissionBase(obj,menuType){
        let objectDataReturn = {};
        let menuState = obj.state.menus;
        let datasubmenu =menuType==1 ? financeHideShowSubmenusPermissionBase:financeHideShowSubmenus;
        var i;
        for(i in datasubmenu){
            let objdata = menuState.find(x => x.hasOwnProperty('id') && x.id == i);
            let objIndex = menuState.indexOf(objdata);
            objectDataReturn[i+'Index'] = objIndex;
            objectDataReturn[i+'menuLinkHide'] = objIndex;
            if(datasubmenu[i].hasOwnProperty('submenu')){
                for(var z in datasubmenu[i]['submenu']){
                    let objIndexSubmenu = '';
                    let objIndexSubmenuIndex = "-1";
                    let objIndexSubSubmenuLinkHide = "-1";
                    if(objIndex > -1){
                        objIndexSubmenu = menuState[objIndex]['submenus'].find(x => x.hasOwnProperty('id') && x.id == z);
                        objIndexSubmenuIndex = menuState[objIndex]['submenus'].indexOf(objIndexSubmenu);
                        if(datasubmenu[i]['submenu'][z].hasOwnProperty('submenu')){
                            for(var k in datasubmenu[i]['submenu'][z]['submenu']){
                                objectDataReturn[k+'subSubMenuLinkHide'] ='-1';
                                if(objIndexSubmenuIndex > -1){
                                    let objIndexSubSubmenu = menuState[objIndex]['submenus'][objIndexSubmenuIndex].hasOwnProperty('subSubMenu') ?  menuState[objIndex]['submenus'][objIndexSubmenuIndex]['subSubMenu'].find(x => x.hasOwnProperty('id') &&  x.id == k):'-1';
                                    if(objIndexSubSubmenu != -1){
                                        objIndexSubSubmenuLinkHide =  menuState[objIndex]['submenus'][objIndexSubmenuIndex]['subSubMenu'].indexOf(objIndexSubSubmenu);
                                        objectDataReturn[k+'subSubMenuLinkHide'] = objIndexSubSubmenuLinkHide;
                                    } 
                                }
                            }
                        }
                        
                        
                    }
                    objectDataReturn[z+'Index'] = objIndexSubmenuIndex;
                    objectDataReturn[z+'subMenuLinkHide'] = objIndexSubmenuIndex;
                }
            }
        }
        return objectDataReturn;
    }

    allLinkHideShowPermissionBase(menuStateData,dataIndex,hideShowType,menuType){
        let datasubmenu =menuType==1? financeHideShowSubmenusPermissionBase:financeHideShowSubmenus;

        for(var i in datasubmenu){
            let lk = 0;
            let checkAccessLength = datasubmenu[i].hasOwnProperty('check_access_type') ? datasubmenu[i].check_access_type.length : 0;
            let keypermiteed = datasubmenu[i].hasOwnProperty('check_access_type') && datasubmenu[i].check_access_type.length>0 ? _.intersection(datasubmenu[i].check_access_type, _.keys(this.permission)).length: 0;
            
            let hideShowTypeALLOWED = menuType==1 && hideShowType ==true && this.permission.hasOwnProperty('access_finance') && this.permission.access_finance && checkAccessLength!=keypermiteed ? false:true;
           
            /* console.log('sdds1',hideShowTypeALLOWED,keypermiteed,checkAccessLength,i);
            if(hideShowTypeALLOWED && hideShowType ==true && menuType==1){
                continue;
            } 
            console.log('sdds2',i);*/
            if(datasubmenu[i].hasOwnProperty('submenu')){

               
                for(var z in datasubmenu[i]['submenu']){
                    let lk1 = 0;
                    let checkAccessLengthSub = datasubmenu[i]['submenu'][z].hasOwnProperty('check_access_type') ? datasubmenu[i]['submenu'][z].check_access_type.length : 0;
                    let keypermiteedSub = datasubmenu[i]['submenu'][z].hasOwnProperty('check_access_type') && datasubmenu[i]['submenu'][z].check_access_type.length>0 ? _.intersection(datasubmenu[i]['submenu'][z].check_access_type, _.keys(this.permission)).length: 0;
                    
                    let hideShowTypeALLOWEDSub = menuType==1 && hideShowType ==true && this.permission.hasOwnProperty('access_finance') && this.permission.access_finance && checkAccessLengthSub!=keypermiteedSub ? false:true;
                   
                    if(hideShowTypeALLOWEDSub && hideShowType ==true && menuType==1){
                        continue;
                    }
                    
                    if(datasubmenu[i]['submenu'][z].hasOwnProperty('submenu')){ 
                        for(var k in datasubmenu[i]['submenu'][z]['submenu']){
                           
                            if(datasubmenu[i]['submenu'][z]['submenu'][k].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z]['submenu'][k].hideLink && dataIndex[i+'Index']>-1 && dataIndex[z+'Index']>-1 && dataIndex[k+'subSubMenuLinkHide']>-1){
                                menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'][dataIndex[k+'subSubMenuLinkHide']]['linkOnlyHide']=hideShowType;
                                lk1++;
                            }
                        }
                    }else if(datasubmenu[i]['submenu'][z].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z].hideLink && dataIndex[i+'Index']>-1 && dataIndex[z+'Index']>-1){
                        
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['linkOnlyHide'] = hideShowType;
                        lk++;
                    }
                    if(menuStateData[dataIndex[i+'Index']]!=null && menuStateData[dataIndex[i+'Index']]!=undefined && menuStateData[dataIndex[i+'Index']].hasOwnProperty('submenus') && menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']].hasOwnProperty('subSubMenu')  && menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'].length>0 && menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'].length == lk1 && datasubmenu[i]['submenu'][z].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z].hideLink && dataIndex[i+'Index']>-1 && dataIndex[z+'Index']>-1){
                       
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['linkOnlyHide'] = hideShowType;
                        lk++;
                    }
                }
            }

            if( (datasubmenu[i].hasOwnProperty('hideLink') && datasubmenu[i].hideLink && menuStateData[dataIndex[i+'Index']].hasOwnProperty('submenus') && menuStateData[dataIndex[i+'Index']]['submenus'].length == lk && menuStateData[dataIndex[i+'Index']]['submenus'].length>0) || (!hideShowTypeALLOWED && datasubmenu[i].hasOwnProperty('hideLink') && datasubmenu[i].hideLink && !menuStateData[dataIndex[i+'Index']].hasOwnProperty('submenus'))){
                menuStateData[dataIndex[i+'Index']]['linkShow']= !hideShowType;
            }
            
            
        }
        return menuStateData;
    }

    showSpecificId(menuStateData,dataIndex,showPageType,dataname){
        let datasubmenu =financeHideShowSubmenus;

        for(var i in datasubmenu){
            let lk = 0;
           
            if(datasubmenu[i].hasOwnProperty('submenu')){ 
               
                for(var z in datasubmenu[i]['submenu']){
                    
                    let lk1 = 0;
                    if(datasubmenu[i]['submenu'][z].hasOwnProperty('submenu')){ 
                        for(var k in datasubmenu[i]['submenu'][z]['submenu']){
                           
                            if(datasubmenu[i]['submenu'][z]['submenu'][k].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z]['submenu'][k].hasOwnProperty('page_type_show') &&  datasubmenu[i]['submenu'][z]['submenu'][k].page_type_show == showPageType && datasubmenu[i]['submenu'][z]['submenu'][k].hideLink && dataIndex[i+'Index']>-1 && dataIndex[z+'Index']>-1 && dataIndex[k+'subSubMenuLinkHide']>-1){
                                menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'][dataIndex[k+'subSubMenuLinkHide']]['linkOnlyHide']=false;
                                menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'][dataIndex[k+'subSubMenuLinkHide']]['name']=dataname;
                                lk1++;
                            }
                        }
                    }else if(datasubmenu[i]['submenu'][z].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z].hasOwnProperty('page_type_show')&& datasubmenu[i]['submenu'][z].page_type_show==showPageType  && datasubmenu[i]['submenu'][z].hideLink && dataIndex[i+'Index']>-1 && dataIndex[z+'Index']>-1){
                        
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['linkOnlyHide'] = false;
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['name'] = dataname;
                        lk++;
                    }
                    if(menuStateData[dataIndex[i+'Index']]!=null && menuStateData[dataIndex[i+'Index']]!=undefined && menuStateData[dataIndex[i+'Index']].hasOwnProperty('submenus') && menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']].hasOwnProperty('subSubMenu')  && menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'].length>0 && menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'].length == lk1 && datasubmenu[i]['submenu'][z].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z].hasOwnProperty('page_type_show') && datasubmenu[i]['submenu'][z].page_type_show==showPageType && datasubmenu[i]['submenu'][z].hideLink && dataIndex[i+'Index']>-1 && dataIndex[z+'Index']>-1){
                       
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['linkOnlyHide'] = false;
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['name'] = dataname;
                        lk++;
                    }
                }
            }
                    
        }
        return menuStateData;
    }

    checkPermissionMenu(){
        let menuState = this.checkMenuStatus();
        
        this.setState({menus:menuState});
    }


    checkMenuStatus(){
        let menuState = this.state.menus;
        let dataIndex = this.getObjectValuePermissionBase(this,1);
        if(this.permission.hasOwnProperty('access_finance_admin') && this.permission.access_finance_admin){
            menuState = this.allLinkHideShowPermissionBase(menuState,dataIndex,false,1);
        }else if(this.permission.hasOwnProperty('access_finance') && this.permission.access_finance){
            menuState = this.allLinkHideShowPermissionBase(menuState,dataIndex,true,1);
        }
        return menuState;
    }

    toggleNavbar = (key = null) => {

        if (key == 'openMenu') {
            this.setState({
                showMobNav: true
            })
        } else {
            this.setState({
                showMobNav: false
            })
        }

    }

    /**
     * Renders submenus of finance module on the left sidebar.
     * Submenus will only show when browsing this module
     */
    renderFinanceModuleMenus() {
        return (
            <FinanceMenu>
                <Sidebar
                    heading={'Finance'}
                    menus={this.state.menus}
                    subMenuShowStatus={this.state.subMenuShowStatus}
                    replacePropsData={this.state.replaceData}
                    renderMenusOnly
                />
            </FinanceMenu>
        )
    }


    render() {
        const styles = css({
            asideSect__: {
                paddingLeft: 'initial'
            }
        })

        return (

            <React.Fragment>
            <div className='bodyNormal Finance_M'>

                <section className={'asideSect__ ' +  (this.state.showMobNav ? 'open_left_menu' : '')} style={styles.asideSect__}>
                    { this.renderFinanceModuleMenus() }

                    <div className="container-fluid fixed_size">
                        <div className='row justify-content-center d-flex'>
                            <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                <Switch>
                                    <Route exact path={ROUTER_PATH + 'admin/finance/dashboard'} render={(props) => <React.Fragment><FinanceDashboard {...props} /><PageTypeChange pageTypeParms='dashboard' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/line_item_listing'} render={(props) => <React.Fragment><LineItemListing {...props} /><PageTypeChange pageTypeParms='pricing_dashboard' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/line_item/create'} render={(props) => <React.Fragment><CreateNewLineItem {...props} /><PageTypeChange pageTypeParms='create_new_line_item' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/line_item/edit/:id'} render={(props) => <React.Fragment><CreateNewLineItem {...props} /><PageTypeChange pageTypeParms='create_new_line_item' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/line_item/import'} render={(props) => <React.Fragment><ImportLineItem {...props} /><PageTypeChange pageTypeParms='create_new_line_item' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/line_item/import/meta_data'} render={(props) => <React.Fragment><ImportLineItemMetaData {...props} /><PageTypeChange pageTypeParms='update_new_line_item' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/line_item/import/meta_data_w_price'} render={(props) => <React.Fragment><ImportLineItemMetaDataWithPrice {...props} /><PageTypeChange pageTypeParms='update_new_line_item' /></React.Fragment>} />
                                    
                                    <Route exact path={ROUTER_PATH + 'admin/finance/quote/create/:user_type/:userId'} render={(props) => <React.Fragment><CreateQuote {...props} /><PageTypeChange pageTypeParms='create_new_enquiry' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/quote/edit/:quoteId'} render={(props) => <React.Fragment><CreateQuote {...props} /><PageTypeChange pageTypeParms='create_new_enquiry' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/quote_dashboard'} render={(props) => <React.Fragment><QuoteDashboard {...props} /><PageTypeChange pageTypeParms='quotes_dashboard' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/quote/view/:quoteId'} render={(props) => <React.Fragment><ViewQuote {...props} /><PageTypeChange pageTypeParms='quotes_view' /></React.Fragment>} />
                                    
                                    

                                    <Route exact path={ROUTER_PATH + 'admin/finance/statementsdashboard'} render={(props) => <React.Fragment><StatementsDashboard {...props} /><PageTypeChange pageTypeParms='statements_dashboard' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/shiftsqueries'} render={(props) => <React.Fragment><ShiftsQueries {...props} /><PageTypeChange pageTypeParms='shifts_queries' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/shifts'} render={(props) => <React.Fragment><Shifts {...props} /><PageTypeChange pageTypeParms='shifts' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/payrollexemption/certificate'} render={(props) => <React.Fragment><UploadPayrollExemption {...props} /><PageTypeChange pageTypeParms='payroll_exemption_add' /></React.Fragment>} />
                                   {/*  <Route exact path={ROUTER_PATH + 'admin/finance/payrolltax'} render={(props) => <React.Fragment><PayrollTax {...props} /><PageTypeChange pageTypeParms='payroll_tax' /></React.Fragment>} /> */}
                                    <Route exact path={ROUTER_PATH + 'admin/finance/Payroll'} render={(props) => <React.Fragment><Payroll {...props} /><PageTypeChange pageTypeParms='payroll' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/payrates'} render={(props) => <React.Fragment><Payrates {...props} /><PageTypeChange pageTypeParms='payrates' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/chargerates'} render={(props) => <React.Fragment><Chargerates {...props} /><PageTypeChange pageTypeParms='chargerates' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/timesheets'} render={(props) => <React.Fragment><Timesheets {...props} /><PageTypeChange pageTypeParms='timesheets' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/ndiserror_list'} render={(props) => <React.Fragment><NDISErrorTrackingList {...props} /><PageTypeChange pageTypeParms='ndis_error_tracking_list' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoices'} render={(props) => <React.Fragment><Invoices {...props} /><PageTypeChange pageTypeParms='invoices' /></React.Fragment>} />
                                    
                                    <Route exact path={ROUTER_PATH + 'admin/finance/timesheet/details/:id'} render={(props) => <TimesheetDetails props={props} />} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/timesheet/line_items/:id'} render={(props) => <TimesheetLineItemsList {...props} key={props.match.params.id} />} />

                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoice/details/:id'} render={(props) => <InvoiceDetails props={props} />} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoice/line_items/:id'} render={(props) => <InvoiceLineItemsList {...props} key={props.match.params.id} />} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoice/shifts/:id'} render={(props) => <InvoiceShiftsList {...props} key={props.match.params.id} />} />

                                    <Route exact path={ROUTER_PATH + 'admin/finance/payrolltaxindividual'} render={(props) => <React.Fragment><PayrollTaxIndividual {...props} /><PageTypeChange pageTypeParms='payroll_tax_individual' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/payrollexemption'} render={(props) => <React.Fragment><PayrollExemption {...props} /><PageTypeChange pageTypeParms='payroll_exemption' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/payrollexemptionhistory'} render={(props) => <React.Fragment><PayrollExemptionHistory {...props} /><PageTypeChange pageTypeParms='payroll_exemption_history' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/Ndiserrortracking'} render={(props) => <React.Fragment><NDISErrorTracking {...props} /><PageTypeChange pageTypeParms='ndis_error_tracking' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/refunds'} render={(props) => <React.Fragment><Refunds {...props} /><PageTypeChange pageTypeParms='refunds' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/creditnotes'} render={(props) => <React.Fragment><CreditNotes {...props} /><PageTypeChange pageTypeParms='credit_notes' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoiceschedulerhistory'} render={(props) => <React.Fragment><InvoiceSchedulerHistory {...props} /><PageTypeChange pageTypeParms='invoice_scheduler_history' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/InvoiceScheduler'} render={(props) => <React.Fragment><InvoiceScheduler {...props} /><PageTypeChange pageTypeParms='invoice_scheduler' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoice/view/:invoiceId'} render={(props) => <React.Fragment><ViewInvoice {...props} /><PageTypeChange pageTypeParms='invoice_view' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/lineItempricinggroups'} render={(props) => <React.Fragment><LineItemPricingGroups {...props} /><PageTypeChange pageTypeParms='line_item_pricing_groups' /></React.Fragment>} />
                                    
                                    <Route exact path={ROUTER_PATH + 'admin/finance/statement/view/:invoiceId'} render={(props) => <React.Fragment><ViewStatement {...props} /><PageTypeChange pageTypeParms='statement_view' /></React.Fragment>} />

                                    <Route exact path={ROUTER_PATH + 'admin/finance/invoicesdashboard'} render={(props) => <React.Fragment><InvoicesDashboard {...props} /><PageTypeChange pageTypeParms='invoice_dashboard' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/auditlogsdash'} render={(props) => <React.Fragment><AuditLogsDash {...props} /><PageTypeChange pageTypeParms='audit_logs_das' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/NDISBilling'} render={(props) => <React.Fragment><NDISBilling {...props} /><PageTypeChange pageTypeParms='ndis_billing' /></React.Fragment>} />



                                    <Route exact path={ROUTER_PATH + 'admin/finance/ShiftsAndPayrollDash'} render={(props) => <React.Fragment><ShiftsAndPayrollDash {...props} /><PageTypeChange pageTypeParms='shifts_payroll' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/NdisInvoices'} render={(props) => <React.Fragment><NdisInvoices {...props} /><PageTypeChange pageTypeParms='ndis_invoices' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/import_ndis_status'} render={(props) => <React.Fragment><ImportNdisInvoiceStatus {...props} /><PageTypeChange pageTypeParms='ndis_invoice_status_import' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/UploadCSV'} render={(props) => <React.Fragment><UploadCSV {...props} /><PageTypeChange pageTypeParms='upload_csv' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/CreateNewLineItemGroup'} render={(props) => <React.Fragment><CreateNewLineItemGroup {...props} /><PageTypeChange pageTypeParms='create_new_line_item_group' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/create_payrate'} render={(props) => <React.Fragment><CreateNewPayrate {...props} /><PageTypeChange pageTypeParms='create_new_payrate' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/edit_payrate/:id'} render={(props) => <React.Fragment><CreateNewPayrate {...props} /><PageTypeChange pageTypeParms='create_new_payrate' /></React.Fragment>} />
                                   
                                    
                                    {/*<Route exact path={ROUTER_PATH + 'admin/finance/CreateInvoiceNewScheduler'} render={(props) => <React.Fragment><CreateInvoiceNewScheduler {...props} /><PageTypeChange pageTypeParms='create_new_statement' /></React.Fragment>} />*/}
                                    <Route exact path={ROUTER_PATH + 'admin/finance/CreateManualInvoice/:UserType/:UserId'} render={(props) => <React.Fragment><CreateManualInvoice {...props} /><PageTypeChange pageTypeParms='create_manual_invoice' /></React.Fragment>} />                                    
                                    <Route exact path={ROUTER_PATH + 'admin/finance/CreateCreditNote'} render={(props) => <React.Fragment><CreateCreditNote {...props} /><PageTypeChange pageTypeParms='create_credit_note' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/applycreditnote'} render={(props) => <React.Fragment><ApplyCreditNote {...props} /><PageTypeChange pageTypeParms='apply_credit_note' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/createNewStatement/:UserType/:UserId'} render={(props) => <React.Fragment><CreateNewStatement {...props} /><PageTypeChange pageTypeParms='create_new_statement' /></React.Fragment>} />


                                    <Route exact path={ROUTER_PATH + 'admin/finance/:type(add_finance_user|edit_finance_user)/:adminId'} render={(props) => <React.Fragment><AddFinanceUser {...props} /><PageTypeChange pageTypeParms='add_finance_user' /></React.Fragment>} />
                                    
                                    <Route exact path={ROUTER_PATH + 'admin/finance/user_management'} render={(props) => <React.Fragment><FinanceUserListing {...props} /><PageTypeChange pageTypeParms='user_management' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/set_lineItem'} render={(props) => <React.Fragment><SetLineItem {...props} /><PageTypeChange pageTypeParms='wizard_set_line_item' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/set_payrates'} render={(props) => <React.Fragment><SetPayRates {...props} /><PageTypeChange pageTypeParms='wizard_set_pay_rates' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/set_invoice_template'} render={(props) => <React.Fragment><SetInvoiceTemplate {...props} /><PageTypeChange pageTypeParms='wizard_set_invoice_template' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/set_payroll_exemption'} render={(props) => <React.Fragment><SetPayrollExemption {...props} /><PageTypeChange pageTypeParms='wizard_set_payroll_exemption' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/set_credit_notes'} render={(props) => <React.Fragment><SetCreditNotes {...props} /><PageTypeChange pageTypeParms='wizard_set_credit_notes' /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/finance/integrations'} render={(props) => <React.Fragment><Integrations {...props} /><PageTypeChange pageTypeParms='wizard_Integrations' /></React.Fragment>} />

                                    <Route path={ROUTER_PATH+'admin/finance/'} component={PageNotFound}  /> 
                                </Switch>
                            </div>
                        </div>
                    </div>

                </section>
            </div>
            </React.Fragment>
        )
    }


}
export default AppFinance;

const mapStateToProps = state => ({
    // showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {
        setFooterColor: (result) => dispach(setFooterColor(result)),
        setSubmenuShow: (result) => dispach(setSubmenuShow(result))
    }
}


const AppCrmData = connect(mapStateToProps, mapDispatchtoProps)(AppFinance)
export { AppCrmData as AppFinance };