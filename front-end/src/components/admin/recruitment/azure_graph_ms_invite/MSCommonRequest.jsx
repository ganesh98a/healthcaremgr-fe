import React from "react";
import moment from 'moment';
import { postData, toastMessageShow } from 'service/common.js';

// replace the email content
export const replaceGBEmailContent = (obj) => {
	
    let template_content = obj.group_booking_email_template;
    let contentChanged = template_content.replace("%INTERVIEW_START_TIME%", (moment(obj.interview_start_date).format('YYYY-MM-DD')+' '+obj.interview_start_time));
    contentChanged = contentChanged.replace("%INTERVIEW_END_TIME%", (moment(obj.interview_end_date).format('YYYY-MM-DD') +' '+obj.interview_start_time));
    contentChanged = contentChanged.replace("%INTERVIEW_LOCATION%", obj.location && obj.location.label ? obj.location.label : obj.location);
    contentChanged = contentChanged.replace("Dear %FIRSTNAME%", 'Hello');
    contentChanged = contentChanged.replace("LINK:  %MEETING_INVITE%", '');
   
    return contentChanged
}


// replace the ms joi url email content
export const replaceMSTemplateContent = (ms_template, meeting_link, meeting_options) => {
	
    let template_content = ms_template;
    let contentChanged = meeting_link ? template_content.replace("%JOIN_URL%", meeting_link) : template_content;   
    contentChanged = meeting_options ? contentChanged.replace("%MEETING_OPTIONS%", meeting_options) : template_content;   
   
    return contentChanged
}

// replace the ms cancellation email content
export const replaceCancellationEmailContent = (cancel_template, start_date, start_time) => {
	
    let template_content = cancel_template;
    let contentChanged = template_content.replace("%START_DATE%", moment(start_date).format("DD/MM/YYYY"));   
    contentChanged = contentChanged.replace("%START_TIME%", start_time);   
   
    return contentChanged
}

// replace the ms cancellation email content
export const ms_req_data = (obj, group_booking_email_template, selected_attendees) => {
    let ms_template_url = '';
    if(obj.event_id){
        ms_template_url = replaceMSTemplateContent(obj.ms_template, obj.meeting_link, obj.meeting_options);
    }
	
    return {
        "subject": obj.group_booking_email_subject,
        "body" : {
            "contentType": "HTML",
            "content": group_booking_email_template +'' + ms_template_url
        },
        "start": {
            "dateTime": moment(obj.interview_start_date).format('YYYY-MM-DD') + 'T' + moment(obj.interview_start_time, ["h:mm A"]).format("HH:mm"),
            "timeZone": moment.tz.guess()
        },
        "end": {
            "dateTime": moment(obj.interview_end_date).format('YYYY-MM-DD') + 'T' + moment(obj.interview_end_time, ["h:mm A"]).format("HH:mm"),
            "timeZone": moment.tz.guess()
        },
        "location": {
            "displayName": "Online"
        },
        "attendees": selected_attendees,
        "allowNewTimeProposals": true,
        "isOnlineMeeting": true,
        "onlineMeetingProvider": "teamsForBusiness"

    };      
}
// store ms event error
export function save_ms_error_log(err_data, title, module) {
    let req_data = {
        err_data : err_data,
        title: title,
        module: module,
    }
    postData('recruitment/RecruitmentInterview/save_ms_error_log', req_data).then((result) => {
        if(result.status){
            toastMessageShow("Please click send invite again", "e");
        }else{
            toastMessageShow("Something went wrong!", "e");
        }
        
    });
}
// Validate the GB owner with Ms Organizer email
export function validate_organizer (org_username, props){
    // validating GB Owner email
    if (org_username != props.owner_email) {
        toastMessageShow('Please login as a group booking owner account  ' + props.owner_name, "e");
        return false;
    } else {
        return true;
    }
}