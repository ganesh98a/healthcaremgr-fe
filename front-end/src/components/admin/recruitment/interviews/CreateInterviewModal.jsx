import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, handleChange, calculate_interview_duration} from 'service/common.js';
import { onlyNumberAllow, get_start_hour_time, get_end_time} from '../../../admin/oncallui-react-framework/services/common';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
    Input,
    Datepicker,
    Timepicker,
    Badge,
    Icon
} from '@salesforce/design-system-react';
import { MS_TENANTID } from '../../../../config.js';
// import { getActiveStaffDetailData } from '../../actions/RecruitmentAction.js';
import moment from 'moment';
import '../../scss/components/admin/item/item.scss';
import '../../scss/components/admin/member/member.scss';
import { SLDSISODatePicker } from '../../oncallui-react-framework/salesforce/SLDSISODatePicker';
import { getGroupBookingEmailContent } from '../../../admin/recruitment/actions/RecruitmentAction.js';
import { MsalProvider } from "@azure/msal-react";
import {UpdateMeetingInvite} from '../../../admin/recruitment/azure_graph_ms_invite/MsUpdateCommon';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";
const msalInstance = new PublicClientApplication(msalConfig);
/**
 * to fetch the roles as user types
 */
const getStaff = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentTaskAction/get_recruiter_listing_for_create_task", { search: e }, 2, 1);
}
/**
 * to fetch the form
 */
const getFormTemplate = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentForm/get_question_form_template", { search: e }, 2, 1);
}

/**
 * Class: CreateInterviewModal
 */
class CreateInterviewModal extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        const TIME_FORMAT = 'hh:mm A';
        // Initialize state
        this.state = {
            loading: false,
            time_format: TIME_FORMAT,
            invite_type: "",
            recruitment_location : [],
            group_booking_email_subject: '',
            group_booking_email_template: '',
            ms_template: '',
            meeting_options: ''
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            interview_start_date: React.createRef(),
            interview_end_date: React.createRef(),
        }
    }

    componentDidMount() {
        this.getAllRecruitmentInterviewType();
        this.getAllRecruitmentLocation();
        let currentDateTime = moment().format('YYYY-MM-DD:HH:mm');
        currentDateTime = currentDateTime.split(':');// here the time is like "16:14"
        let starthr = get_start_hour_time(parseInt(currentDateTime[1]) + 1, currentDateTime[2]);
        let endtime = starthr.split(':');// here the time is like "16:14"
        let endhr = get_end_time(endtime[0], endtime[1]);

        this.setState({
            interview_start_date: currentDateTime[0],
            interview_start_time: starthr,
            interview_end_date: currentDateTime[0],
            interview_end_time: endhr,
        }, () => {
            if(!this.props.interview_id){
                this.calcActiveDuration('', '');
            }

        });
        //Edit interview
        if (this.props.interview_id) {
            this.getInterviewById(this.props.interview_id)
            this.get_ms_url_template();
        }else{
            this.get_current_user();
            
        }

        let email_key = this.props.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation';
        if(email_key!=''){
            this.getGroupBookingEmailHtmlFormat(email_key);
        }
        
    }

     /*
    * get group booking template and replace the date and location
    */
     getGroupBookingEmailHtmlFormat = (email_key) => {
        getGroupBookingEmailContent(email_key).then(res => {
            if(res){
                this.setState({
                    group_booking_email_template:  res.template_content,   
                    group_booking_email_subject: res.subject,             
                });
            }
            
        });
        
    }

    get_ms_url_template=()=>{
        postData("recruitment/RecruitmentInterview/get_ms_url_template", {}).then((res) => {
            if (res.status) {
                this.setState({
                    ms_template: (res.data) ? res.data.template : ''
                })
            }
        });
    }

    /**
     * fetching the current user details
     */
     get_current_user = () => {
        postData("recruitment/RecruitmentInterview/get_current_admin_user_details", {}).then((res) => {
            if (res.status) {
                this.setState({
                    owner: (res.data) ? res.data : ''
                })
            }
        });
    }

    /**
     * fetching the current user details
     */
     get_current_user = () => {
        postData("recruitment/RecruitmentInterview/get_current_admin_user_details", {}).then((res) => {
            if (res.status) {
                this.setState({
                    owner: (res.data) ? res.data : ''
                })
            }
        });
    }

    /**
     * get the interview details by id
     */

    getInterviewById = (interview_id) => {
        postData("recruitment/RecruitmentInterview/get_interview_by_id", { interview_id: interview_id }).then((res) => {
            if (res.status) {
                this.setState(res.data, () => {
                    if (res.data.meeting_link != '' && res.data.meeting_link !=null && res.data.ms_event_org_id !=null) {
                        let url = res.data.meeting_link
                        url = url.replace("https://teams.microsoft.com/l/meetup-join/", '');
                        url = url.split('/');

                        let org_id = res.data.ms_event_org_id
                        org_id = org_id.replace("https://graph.microsoft.com/v1.0/$metadata#users('", '');
                        org_id = org_id.replace("')/events/$entity", '');

                        let meeting_options = 'https://teams.microsoft.com/meetingOptions/?organizerId=' + org_id + '&tenantId=' + MS_TENANTID + '&threadId=' + url[0] + '&messageId=0&language=en-US';
                        this.setState({ meeting_options: meeting_options });
                    }

                });
                this.calcActiveDuration('', '');
            }
        });
    }
    /**
     * get the interview types
     */
    getAllRecruitmentInterviewType = () => {
        postData("recruitment/RecruitmentInterview/get_all_interview_type", {}).then((res) => {
            if (res.status) {
                this.setState(res)
            }
        });
    }
    /**
     * get the interview location
     */
    getAllRecruitmentLocation = () =>{
        postData("recruitment/RecruitmentInterview/get_all_recruitment_location", {}).then((res) => {
                this.setState({recruitment_location : res})
        });
    }
    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value }, () => {	
            this.calcActiveDuration(key, value);	
        });
        if (key == 'interview_start_time') {
            let time = value.split(':');// here the time is like "16:14"
            let hrminutes = get_end_time(time[0], time[1]);
            if(hrminutes.includes('NaN:undefined') || hrminutes.includes('undefined')){
                this.setState({ interview_end_time: '' });
            }else{
                this.setState({ interview_end_time: hrminutes });
            }
            
        }
        if(key == 'interview_type_id'){
            let interview_type = this.getInterviewType(value);
            let email_key = interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation';
            if(email_key!=''){
                this.getGroupBookingEmailHtmlFormat(email_key);
            }
        }  
        if(key == 'location'){
            this.setState({ location_id: value });
        }        
    }
    /**
     * calculating interview duration
     */
    async calcActiveDuration(key, val) {
        var final_req = await calculate_interview_duration(this.state, key, val);
            this.setState({
                interview_duration: (final_req) ? final_req : ''
            })
    }    

    getInterviewType = (id) =>{
        let interview_type = '';
        this.state.interview_types.map((col)=>{
            if(col.value == id){
                interview_type = col.label;
            }
        });
        return interview_type;
    }

    getLocationName = (id) =>{
        let interview_type = '';
        this.state.recruitment_location.map((col)=>{
            if(col.value == id){
                interview_type = col.label;
            }
        });
        return interview_type;
    }

    /**
     * Call the create and update api when user save quiz
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        if(e){
            e.preventDefault();
        }

        jQuery("#create_update_interview").validate({ /* */ });
        var url = 'recruitment/RecruitmentInterview/create_update_interview';
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_update_interview").valid()) {

            if(!this.state.meeting_link && !this.state.location) {
                toastMessageShow('The Location Field is required.', 'e');
                return false;
            } else if(this.state.interview_type_id == "0" || !this.state.interview_type_id) {
                toastMessageShow('About Field is required.', 'e');
                return false;
            }
            this.setState({ loading: true });
            var req = {
                interview_id: this.props.interview_id ? this.props.interview_id : '',
                title: this.state.title,
                owner: this.state.owner && this.state.owner.value? this.state.owner.value : '',
                interview_type_id: this.state.interview_type_id ? this.state.interview_type_id : '',
                location_id: this.state.location && this.state.location.value? this.state.location.value : this.state.location,
                interview_start_date: this.state.interview_start_date ? moment(this.state.interview_start_date).format('YYYY-MM-DD') : '',
                interview_start_time: this.state.interview_start_time,
                interview_end_date: this.state.interview_end_date ? moment(this.state.interview_end_date).format('YYYY-MM-DD') : '',
                interview_end_time: this.state.interview_end_time,
                interview_duration: this.state.interview_duration,
                max_applicant: this.state.max_applicant,
                invite_type: this.state.invite_type,
                form_id: this.state.form_template ? this.state.form_template.value : '',
                meeting_link: this.state.meeting_link,
                description: this.state.description ? this.state.description : '',
            };         
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let interview_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        interview_id = resultData.interview_id || '';
                    }
                    // Trigger success pop
                    toastMessageShow(result.msg, 's');
                    let dataTmp = {};
                    dataTmp.interview_id = interview_id;
                    dataTmp.max_applicant = this.state.max_applicant;
                    dataTmp.interview_start_date = this.state.interview_start_date ? moment(this.state.interview_start_date).format('YYYY-MM-DD') : '';
                    dataTmp.interview_end_date = this.state.interview_end_date ? moment(this.state.interview_end_date).format('YYYY-MM-DD') : '';
                    dataTmp.interview_start_time = this.state.interview_start_time;
                    dataTmp.interview_end_time = this.state.interview_end_time;
                    dataTmp.location = this.getLocationName(this.state.location);
                    dataTmp.interview_type = this.getInterviewType(this.state.interview_type_id);
                    dataTmp.interview_type_id = this.state.interview_type_id;
                    dataTmp.group_booking_email_subject = this.state.group_booking_email_subject;
                    dataTmp.group_booking_email_template = this.state.group_booking_email_template;
                    dataTmp.owner = this.state.owner;

                    this.props.closeModal(true, dataTmp);

                } else {
                    // Trigger error pop
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        }
    }


    /**
     * rendering sechedule timing part of the schedule form
     */
    RenderBasicsSection() {
        return (
            <React.Fragment>
                    <Badge id="badge-base-example-default" content="Basics"></Badge>
                    <div className="row py-2">
                        <div className="col-sm-5">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                    <abbr className="slds-required" title="required">* </abbr>Title</label>
                                <div className="slds-form-element__control">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Enter Title"
                                        required={true}
                                        className="slds-input"
                                        onChange={(value) => this.setState({ title: value.target.value })}
                                        value={this.state.title || ''}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">
                                    <abbr className="slds-required" title="required">* </abbr>About</label>
                                <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                    <SLDSReactSelect
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={this.state.interview_types}
                                        onChange={(value) => this.handleChange(value, 'interview_type_id')}
                                        value={this.state.interview_type_id || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Please Select"
                                        required={true}
                                        name="interview_type_id"
                                        disabled={this.props.interview_stage_status > 1 ? true : false}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                <abbr className="slds-required" title="required">* </abbr>Owner</label>
                                <div className="slds-form-element__control">
                                    <SLDSReactSelect.Async clearable={false}
                                        id="owner"
                                        className="SLDS_custom_Select default_validation"
                                        value={this.state.owner}
                                        cache={false}
                                        required={true}
                                        loadOptions={(e) => getStaff(e, [])}
                                        onChange={(e) => this.setState({ owner: e })}
                                        placeholder="Please Search"
                                        name="owner"
                                        disabled={(this.props.applicantRef && this.props.applicantRef.state.applicantList && this.props.applicantRef.state.applicantList.length > 0) || this.props.attendees_count > 0 ? true : false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
            </React.Fragment>
        )
    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        this.setState({
            [key]: dateYmdHis
        }, () => {
            this.calcActiveDuration(key, dateYmdHis);
        })
    }

    /**
     * rendering sechedule timing part of the schedule form
     */
    RenderDateAndLocationSection() {
        return (
            <React.Fragment>
                <Badge id="badge-base-example-default" content="Date & Location"></Badge>
                <div className="row py-2">
                        <div className="col-sm-3">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Start Date</label>
                                <div className="slds-form-element__control" role="none">
                                    <div className="SLDS_date_picker_width">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <SLDSISODatePicker
                                            type="date"
                                            ref={this.datepickers.interview_start_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="date_picker"
                                            placeholder="DD/MM/YYYY"
                                            onChange={this.handleChangeDatePicker('interview_start_date')}
                                            value={this.state.interview_start_date || ''}
                                            input={<input name="interview_start_date" />}
                                            clearable={false}
                                            relativeYearFrom={0}
                                            dateDisabled={(data) =>
                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                            }
                                            required={true}
                                        />
                                        </IconSettings>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="slds-form-element">
                                <div className="slds-form-element__control">
                                    <Timepicker
                                        label={<span>&nbsp;Start Time</span>}
                                        stepInMinutes={30}
                                        required={true}
                                        name="interview_start_time"
                                        id="interview_start_time"
                                        menuPosition="relative"
                                        formatter={(date) => {
                                            if (date) {
                                                return moment(date).format(this.state.time_format);
                                            }
                                            return null;
                                        }}
                                        strValue={this.state.interview_start_time}
                                        onDateChange={(date, inputStr) => {
                                            this.handleChange(inputStr, "interview_start_time");
                                        }}
                                        disabled={this.props.interview_stage_status > 1 ? true : false}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>End Date</label>
                                <div className="slds-form-element__control" role="none">
                                    <div className="SLDS_date_picker_width">
                                        <SLDSISODatePicker
                                            type="date"
                                            ref={this.datepickers.interview_end_date} // !important: this is needed by this custom SLDSISODatePicker
                                            className="date_picker"
                                            placeholder="DD/MM/YYYY"
                                            onChange={this.handleChangeDatePicker('interview_end_date')}
                                            value={this.state.interview_end_date || ''}
                                            input={<input name="interview_end_date" />}
                                            clearable={false}
                                            relativeYearFrom={0}
                                            dateDisabled={(data) =>
                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                            }
                                            required={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="slds-form-element">
                                <div className="slds-form-element__control">
                                    <Timepicker
                                        label={<span>&nbsp;End Time</span>}
                                        stepInMinutes={30}
                                        required={true}
                                        name="interview_end_time"
                                        id="interview_end_time"
                                        menuPosition="relative"
                                        formatter={(date) => {
                                            if (date) {
                                                return moment(date).format(this.state.time_format);
                                            }
                                            return null;
                                        }}
                                        strValue={this.state.interview_end_time}
                                        onDateChange={(date, inputStr) => {
                                            this.handleChange(inputStr, "interview_end_time");
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" >Duration</label>
                                <div className="slds-form-element__control pt-2">
                                    <span>{this.state.interview_duration || 'HH:MM'}</span>
                                </div>
                            </div>
                        </div>

                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Location</label>
                            <div className="slds-form-element__control" role="none">
                                <div className="">
                                    <SLDSReactSelect
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={this.state.recruitment_location}
                                        onChange={(value) => this.handleChange(value, 'location')}
                                        value={this.state.location || ''}
                                        clearable={false}
                                        searchable={false}
                                        placeholder="Please Select"
                                        required={true}
                                        name="location"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                    <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">Max Applicants</label>
                                <div className="slds-form-element__control">
                                    <input
                                        type="text"
                                        name="max_applicant"
                                        placeholder="Max applicants"
                                        className="slds-input"
                                        onChange={(e) => {
                                            if(!isNaN(e.target.value))
                                            {
                                                onlyNumberAllow(this, e , 10);
                                            }
                                        }}
                                        value={this.state.max_applicant || ''}
                                        maxLength="2"
                                    />
                                </div>
                            </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div class="slds-col px-2">
                        <Icon
                            assistiveText={{ label: 'Info' }}
                            category="utility"
                            name={`info`}
                            size={'x-small'}
                        /> Time zone : AEST
                    </div>
                </div>
            </React.Fragment>
        )
    }

    /**
     * rendering sechedule timing part of the schedule form
     */
    RenderInviteInfoSection() {
        return (
            <React.Fragment>
                <Badge id="badge-base-example-default" content="Invite Info"></Badge>
                <div className="row py-2">
                    {/* <div className="col-sm-6"> */}
                    <div className="col-sm-4">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01">Invite Type</label>
                            <div className="slds-form-element__control">
                                <span className="slds-radio slds-float_left">
                                    <input type="radio" id="communication_method_1" value="1" name="invite_type"
                                    onChange={(e) => handleChange(this, e)}
                                    checked={(this.state.invite_type && this.state.invite_type == 1) ? true : false}
                                    disabled={true}/>
                                    <label className="slds-radio__label" htmlFor="communication_method_1">
                                        <span className="slds-radio_faux"></span>
                                        <span className="slds-form-element__label">Quiz</span>
                                    </label>
                                </span>
                                <span className="slds-radio slds-float_left">
                                    <input type="radio" id="communication_method_2" value="2" name="invite_type"
                                    onChange={(e) => handleChange(this, e)}
                                    checked={(this.state.invite_type && this.state.invite_type == 2) ? true : false}
                                    disabled={this.props.interview_stage_status > 1 ? true : false}/>
                                    <label className="slds-radio__label" htmlFor="communication_method_2">
                                        <span className="slds-radio_faux"></span>
                                        <span className="slds-form-element__label">Meeting Invite</span>
                                    </label>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* </div> */}

                    <div className="col-sm-4">
                        {this.state.invite_type == "1" ? <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="select-01">
                                <abbr className="slds-required" title="required">* </abbr>Quiz Template</label>
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                <SLDSReactSelect.Async
                                    clearable={false}
                                    required={true}
                                    id="form_template"
                                    className="SLDS_custom_Select default_validation"
                                    value={this.state.form_template}
                                    cache={false}
                                    required={false}
                                    loadOptions={(e) => getFormTemplate(e, [])}
                                    onChange={(e) => this.setState({ form_template: e })}
                                    placeholder="Please Search"
                                    name="form_template"
                                    disabled={this.props.interview_stage_status > 0 ? true : false}
                                />
                            </div>
                        </div> :
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="text-input-id-1">Link to Meeting Invite</label>
                                <div className="slds-form-element__control">
                                    <input
                                        type="text"
                                        name="meeting_link"
                                        placeholder="Enter Title"
                                        required={false}
                                        className="slds-input"
                                        onChange={(value) => this.setState({ meeting_link: value.target.value })}
                                        value={this.state.meeting_link || ''}
                                    />
                                </div>
                            </div>
                        }
                    </div>



                </div>
            </React.Fragment>
        )
    }

    /**
     * rendering sechedule timing part of the schedule form
     */
    RenderNotesSection() {
        return (
            <React.Fragment>
                <Badge id="badge-base-example-default" content="Notes"></Badge>
                    <div className="row py-2">
                        <div className="col-sm-12">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">Description</label>
                                <div className="slds-form-element__control" role="none">
                                    <div className="slds-form-element__control">
                                        <textarea
                                            required={false}
                                            className="slds-textarea"
                                            name="description"
                                            placeholder="Description"
                                            onChange={(e) => this.handleChange(e.target.value, "description")}
                                            value={this.state.description ? this.state.description : ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </React.Fragment>
        )
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            this.props.interview_id ? <MsalProvider instance={msalInstance}> <UpdateMeetingInvite
                                {...this.state}
                                {...this.props}
                                
                                page_name={'edit_gb'}
                                label_name={'Update'}
                                submit_interview={this.submit}
                            />
                            </MsalProvider> :
                                <>
                                    <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />
                                    <Button disabled={this.state.loading} key={1} label={"Create Meeting Link"} variant="brand" onClick={this.submit} />
                                </>
                               
                        ]}
                        heading={this.props.interview_id ? "Edit Group Booking" : "New Group Booking"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top createlistrole_popup badgesettings">
                            <div className="container-fluid">
                                <form id="create_update_interview" autoComplete="off" className="slds_form">
                                    {this.RenderBasicsSection()}
                                    {this.RenderDateAndLocationSection()}
                                    {this.RenderNotesSection()}                                  
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateInterviewModal;
