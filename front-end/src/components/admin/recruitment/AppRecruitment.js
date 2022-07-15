import React, { Component } from 'react';
import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { BrowserRouter as Router, Route, Switch, NavLink, Redirect } from 'react-router-dom';

import UserManagement from '../../admin/recruitment/user_management/UserManagement';
import TaskSchedule from '../../admin/recruitment/action_task/TaskSchedule';
import JobOpening from '../../admin/recruitment/JobOpening';
import CreateJob from '../../admin/recruitment/CreateJob';
import ApplicantListing from '../../admin/recruitment/applicants/ApplicantListing';
import ApplicationListing from '../../admin/recruitment/applicants/ApplicationListing';
import AppliedApplicationApplicantList from '../../admin/recruitment/applicants/AppliedApplicationApplicantList';
//import Training from '../../admin/recruitment/Training';
//import GroupInterviewQuestion from './training/group_interview/GroupInterviewQuestion';
import IpadListing from '../../admin/recruitment/training/IpadListing';
import CABDayListing from '../../admin/recruitment/training/cab_day_interview/CABDayListing';
import { postData, getPermission, checkItsNotLoggedIn, checkLoginWithReturnTrueFalse } from 'service/common.js';
import ApplicantInfo from '../../admin/recruitment/applicants/ApplicantInfo';
import ApplicationDetails from './applicants/ApplicationDetails';
import { setFooterColor } from '../../admin/notification/actions/NotificationAction.js';
import UI from './UI/UI';
import TaskListing from '../../admin/recruitment/action_task/TaskListing';
import PageNotFound from '../../admin/PageNotFound';
import ApplicantResult from '../../admin/recruitment/training/group_interview/ApplicantGroupInterviewResult';
import { connect } from 'react-redux'
import MyComponents from '../../admin/recruitment/MyComponents';
import Sidebar from '../Sidebar';
import {recruitmentJson, recruitmentHideShowSubmenusPermissionBase,recruitmentHideShowSubmenus} from 'menujson/recruitment_menu_json';
import {setActiveSelectPage} from 'components/admin/recruitment/actions/RecruitmentAction';
import StaffDetails from './user_management/StaffDetails';
import FlaggedApplicantList from './applicants/FlaggedApplicantList';
// import DuplicateApplicants from './applicants/duplicate_applicants';

import PayRateApproval from './applicants/PayRateApproval';
import ManageGroupInterview from './training/group_interview/ManageGroupInterview';
import CABDay from './training/group_interview/CABDay';
import GroupInterviewQuestionsForApplicant from '../recruitment/training/group_interview/GroupInterviewQuestionsForApplicant';
import DevicesList from '../recruitment/devices/DevicesList';
import ManageDevicesList from '../recruitment/devices/ManageDevices';
import PageTypeChange from './PageTypeChange.js';
import CommunicationsLogs from './communication/CommunicationsLogs.js'

// interview forms
import JobsFormsIndex from "./forms/Index";

// css load
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import "react-datepicker/dist/react-datepicker.css";
import {Loading} from 'components/admin/externl_component/Loading';
import JobCategories from './wizard/JobCategories';
import EmailSetup from './wizard/EmailSetup';
import SeekAPIIntegration from './wizard/SeekAPIIntegration.js';
import { RecruitmentMenu } from '../GlobalMenu.jsx';
import { css } from '../../../service/common.js';

import {GroupInterviewQuestion} from './training/group_interview/GroupInterviewQuestion';
import { fetchStateList, fetchTitleOptions } from '../actions/CommonAction.js';
import FormListing from '../../admin/recruitment/applicants/forms/ListForm';
import FormDetail from '../../admin/recruitment/applicants/forms/FormDetail.jsx';
import QuestionList from '../../admin/recruitment/applicants/forms/QuestionList.jsx';
import QuizListing from '../../admin/recruitment/applicants/quizzes/ListQuiz';
import QuizDetail from '../../admin/recruitment/applicants/quizzes/QuizDetail.jsx';
import QuizQuestionList from '../../admin/recruitment/applicants/quizzes/QuizQuestionList.jsx';
import DocumentList from './applicants/document/ListDocument';
import DocusignList from './applicants/docusign/ListDocusign';

import ListInterviews from '../../admin/recruitment/interviews/ListInterviews.jsx';
import InterviewDetails from '../../admin/recruitment/interviews/InterviewDetails.jsx';
import InterviewApplicantList from '../../admin/recruitment/interviews/ListInterviewApplicants.jsx';
import ReferenceList from './applicants/reference/ReferenceList';
import ApplicationActivityNotesList from '../Activity/ApplicationActivityNotesList.jsx';
import JobListing from './JobListing.jsx';
import ArchivedInterviewList from '../../admin/recruitment/interviews/ArchivedInterviewList.jsx';
import OnlineAssessmentListing from '../../admin/recruitment/applicants/OnlineAssessmentListing.jsx';

import OnlineAssessmentList from '../../admin/recruitment/online_assessment/OnlineAssessmentList.jsx';
//import CreateAssessmentTemplate from '../../admin/recruitment/online_assessment/CreateAssessmentTemplate.jsx'

import AssessmentTemplate from '../../admin/recruitment/online_assessment/AssessmentTemplate.jsx'
import AssessmentEvaluation from '../../admin/recruitment/online_assessment/AssessmentEvaluation.jsx'
const menuJson = () => {
    let menu = recruitmentJson;
    return menu;
}



let cssLoaded = false;

class AppRecruitment extends Component {
    constructor(props) {
        checkItsNotLoggedIn(ROUTER_PATH);
        super(props);
        this.permission = (getPermission() == undefined) ? [] : JSON.parse(getPermission());
        this.state = {
            loadState: true,
            subMenuShowStatus:true,
            menus:menuJson(),
            replaceData:{':id':(props.applicantinfoDetails.hasOwnProperty('id') ? props.applicantinfoDetails.id :0)},
            showMobNav: false

        }
    }


    componentDidMount() {
        this.props.setFooterColor('recruitment_module');
        this.checkPermissionMenu();

        this.props.dispatch(fetchStateList())
        this.props.dispatch(fetchTitleOptions())
    }

    componentWillUnmount() {
        this.props.setFooterColor('');
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
        let datasubmenu =menuType==1 ? recruitmentHideShowSubmenusPermissionBase:recruitmentHideShowSubmenus;
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
        let datasubmenu =menuType==1? recruitmentHideShowSubmenusPermissionBase:recruitmentHideShowSubmenus;

        for(var i in datasubmenu){
            let lk = 0;

            if(datasubmenu[i].hasOwnProperty('submenu')){

                for(var z in datasubmenu[i]['submenu']){

                    let lk1 = 0;
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
                    if(
                        menuStateData[dataIndex[i+'Index']]!=null &&
                        menuStateData[dataIndex[i+'Index']]!=undefined &&
                        menuStateData[dataIndex[i+'Index']].hasOwnProperty('submenus') &&
                        (menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']] || {}).hasOwnProperty('subSubMenu') &&
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'].length>0 &&
                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['subSubMenu'].length == lk1 &&
                        datasubmenu[i]['submenu'][z].hasOwnProperty('hideLink') && datasubmenu[i]['submenu'][z].hideLink &&
                        dataIndex[i+'Index']>-1 &&
                        dataIndex[z+'Index']>-1
                    ){

                        menuStateData[dataIndex[i+'Index']]['submenus'][dataIndex[z+'Index']]['linkOnlyHide'] = hideShowType;
                        lk++;
                    }
                }
            }

            if( datasubmenu[i].hasOwnProperty('hideLink') && datasubmenu[i].hideLink && menuStateData[dataIndex[i+'Index']].hasOwnProperty('submenus') && menuStateData[dataIndex[i+'Index']]['submenus'].length == lk && menuStateData[dataIndex[i+'Index']]['submenus'].length>0){
                menuStateData[dataIndex[i+'Index']]['linkShow']= !hideShowType;
            }


        }
        return menuStateData;
    }

    showSpecificId(menuStateData,dataIndex,showPageType,dataname){
        let datasubmenu =recruitmentHideShowSubmenus;

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


    updateApplicantInfoLink(nextProps){
           let menuState = this.checkMenuStatus();
            let dataIndex = this.getObjectValuePermissionBase(this,2);
            menuState= this.allLinkHideShowPermissionBase(menuState,dataIndex,true,2);
            if(nextProps.showTypePage=='applicantinfo'){

                menuState= this.showSpecificId(menuState,dataIndex,nextProps.showTypePage,'Applicant Info - '+nextProps.applicantinfoDetails.appId);
            }
            this.setState({menus:menuState});
   }

    componentWillReceiveProps(nextProps){

        if(this.props.showTypePage != nextProps.showTypePage){
            this.updateApplicantInfoLink(nextProps);
        }

        if(nextProps.applicantinfoDetails.id!=this.props.applicantinfoDetails.id && nextProps.showTypePage=='applicantinfo'){
            this.setState({replaceData:{':id':nextProps.applicantinfoDetails.id}},()=>{
                this.updateApplicantInfoLink(nextProps);

        })
        }

    }


    checkPermissionMenu(){
        let menuState = this.checkMenuStatus();

        this.setState({menus:menuState});
    }


    checkMenuStatus(){
        let menuState = this.state.menus;
        let dataIndex = this.getObjectValuePermissionBase(this,1);
        if(this.permission.hasOwnProperty('access_recruitment_admin') && this.permission.access_recruitment_admin){
            menuState = this.allLinkHideShowPermissionBase(menuState,dataIndex,false,1);
        }else{
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
     * Renders submenus of recruitment module on the left sidebar.
     * Submenus will only show when browsing this module
     */
    renderRecruitmentMenus() {
        const { menus, subMenuShowStatus, replaceData } = this.state

        return (
            <RecruitmentMenu>
                <Sidebar
                    heading={'Recruitment'}
                    menus={menus}
                    subMenuShowStatus={subMenuShowStatus}
                    replacePropsData={replaceData}
                    renderMenusOnly
                />
            </RecruitmentMenu>
        )
    }


    render() {
        const styles = css({
            asideSect__: {
                paddingLeft: 'initial',
            }
        })

        return (
            <React.Fragment>
            <div className={'recruitment_module bodyNormal '} >

               <section className={'asideSect__ ' +  (this.state.showMobNav ? 'open_left_menu' : '')} style={styles.asideSect__}>
                    { this.renderRecruitmentMenus() }
                    <div className="container-fluid fixed_size">
                        <div className='row justify-content-center d-flex'>

                            <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                                <Switch>

                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/user_management'} render={(props) => this.permission.access_recruitment_admin ? <React.Fragment><PageTypeChange pageTypeParms='usermanagment'/><UserManagement props={props} /></React.Fragment> : this.permissionRediect()} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/action/schedule'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='taskschdule'/><TaskSchedule props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/action/task'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='tasklisting'/><TaskListing props={props} /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/job_opening/create_job/:jobId?/:jobType?'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={props.match.params.jobType=='E' ? 'editjob' :props.match.params.jobType=='D'?'duplicatejob':'createjob'}/><CreateJob props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/job_opening/:page?'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='jobopening'/><JobListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/applicants'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicants'/><ApplicantListing props={props} /> </React.Fragment>} />

                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/applications'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicantions'/><ApplicationListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/applications/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicantionsapplicant'/><AppliedApplicationApplicantList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/applications/:id/:application_status'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicantionsapplicant'/><AppliedApplicationApplicantList props={props} /> </React.Fragment>} />

                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/question_list'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'phone_interview_list'}/><GroupInterviewQuestion props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/training/ipad'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='ipad'/><IpadListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/manage_cab_day'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='cabday_interview'/><CABDayListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/applicant/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicantinfo'/><ApplicantInfo props={props} /> </React.Fragment>} />
                                    {/* <Route exact path={ROUTER_PATH + 'admin/recruitment/applicant/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicantinfo'/><ApplicantInfo props={props} /> </React.Fragment>} /> */}
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicationdetails'/><ApplicationDetails props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/MyComponents'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='MyComponents'/><MyComponents props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/ui'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='dashboard'/><UI props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/staff_details/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='staff_details'/><StaffDetails props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/dashboard/flagged_applicants'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='flagged_applicants'/><FlaggedApplicantList props={props}/> </React.Fragment>} />
                                    {/* <Route exact path={ROUTER_PATH + 'admin/recruitment/dashboard/duplicate_applicants'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='duplicate_applicants'/><DuplicateApplicants props={props}/> </React.Fragment>} /> */}
                                    {/* <Route exact path={ROUTER_PATH + 'admin/recruitment/user_management/roundrobin_management'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='roundrobin_management'/><RoundRobinManagement props={props}/> </React.Fragment>} /> */}
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/dashboard/PayRateApproval'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='PayRateApproval'/><PayRateApproval props={props}/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/group_interview/manage_group_interview'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='manage_group_interview'/><ManageGroupInterview props={props}/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/training/group_interview/CABDay'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='cabday_interview'/><CABDay props={props}/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/group_interview_questions/:id/:task_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='group_interview_questions'/><GroupInterviewQuestionsForApplicant props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/group_interview_result/:id/:task_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='group_interview_result'/><ApplicantResult props={props} fetchType='group_interview_result' /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/cab_interview_result/:id/:task_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='cabday_interview_result'/><ApplicantResult props={props} fetchType='cabday_interview_result'/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/device_list'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='device_list'/><DevicesList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/manage_devices_list'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='manage_devices_list'/><ManageDevicesList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/communications_logs'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='communication_logs'/><CommunicationsLogs props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/question_list/:category(cab_day)'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'cabday_question_list'}/><GroupInterviewQuestion props={props}  typeList='cabday_question_list'/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/wizard/job_categories'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'job_categories'}/><JobCategories props={props}  /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/wizard/email_setup'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'email_setup'}/><EmailSetup props={props}  /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/wizard/seek_api_integration'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'seek_api_integration'}/><SeekAPIIntegration props={props}  /> </React.Fragment>} />

                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/jobs/forms'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'job_forms_index'}/><JobsFormsIndex props={props}/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/form_list/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='formlisting'/><FormListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_form/detail/:id/:form_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='form_detail'/><FormDetail props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_question/list/:id/:form_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='form_detail'/><QuestionList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/onlineassessment_list/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='quizlisting'/><OnlineAssessmentListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_quiz/detail/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='quiz_detail'/><QuizDetail props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_question/quiz/list/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='form_detail'/><QuizQuestionList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/interview'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'job_forms_index'}/><ListInterviews props={props}/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/interview/archived'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms={'archived_interview_list'}/><ArchivedInterviewList props={props}/> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/documents/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='documents'/><DocumentList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/interview_details/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='applicationdetails'/><InterviewDetails props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/interview_details/applicant_list/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='interviewapplicantlisting'/><InterviewApplicantList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/documents/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='documents'/><DocumentList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/docusign/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='documents'/><DocusignList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/reference/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='documents'/><ReferenceList props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application/notes/:applicant_id/:id?'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='documents'/><ApplicationActivityNotesList props={props} /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/application_details/onlineassessment_list/:id/:application_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='quizlisting'/><OnlineAssessmentListing props={props} /> </React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/oa_template'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='oa_template_list'/><OnlineAssessmentList props={props} /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/oa_template/create'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='oa_template_create'/><AssessmentTemplate props={props} /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/oa_template/update/:id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='oa_template_update'/><AssessmentTemplate props={props} /></React.Fragment>} />
                                    <Route exact path={ROUTER_PATH + 'admin/recruitment/applicant_assessment/:application_id/:assessment_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='oa_assessment_answers'/><AssessmentEvaluation props={props} /></React.Fragment>} />
                                    <Route path='/admin/recruitment/' component={PageNotFound}  />
                                  </Switch>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
            </React.Fragment>
        );
    }
}
const mapStateToProps = state => ({
    showTypePage: state.RecruitmentReducer.activePage.pageType,
    applicantinfoDetails:state.RecruitmentApplicantReducer.details
})

const mapDispatchtoProps = (dispach) => {
    return {
        setFooterColor: (result) => dispach(setFooterColor(result)),
        dispatch: dispach,
    }
}

const AppRecruitmentData = connect(mapStateToProps, mapDispatchtoProps)(AppRecruitment)
export { AppRecruitmentData as AppRecruitment };