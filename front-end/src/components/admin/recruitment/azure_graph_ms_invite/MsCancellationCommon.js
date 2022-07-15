import React, { useState } from "react";
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../../oncallui-react-framework/services/ms_azure_service/authConfig";
import { Button, } from '@salesforce/design-system-react';
import moment from 'moment';
import { postData, toastMessageShow } from 'service/common.js';
import { callMsGraphForToCancelMeeting, callMsGraphUpdateMeeting } from "./MSAzureService";
import { replaceGBEmailContent, ms_req_data, save_ms_error_log, validate_organizer } from './MSCommonRequest';
/**
 * To send the ms cancellation email 
 * InterviewDetails , ApplicantCard and ApplicantListing component are used in GB
 */
export const CancelMeetingInvite = (props) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [labelName, setLabelName] = useState(props.label_name);
    const [disableButton, setDisableButton] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const [accountData, setAccountData] = useState(accounts[0] || {});

    const checkUserLoggedIn = (e) => {
        if (isAuthenticated) {
            let org_username = accounts && accounts[0] ? accounts[0].username : ''
            if (validate_organizer(org_username, props)) {
                cancelMeetingInvite();
            }
        }else{
            instance.loginPopup(loginRequest).then((res) => {
                localStorage.setItem("ms_username", res.account.username);
                localStorage.setItem("ms_name", res.account.name);
                localStorage.setItem("ms_token", res.accessToken);
                setAccountData(res.account);
                if(validate_organizer(res.account.username, props)){
                    cancelMeetingInvite();
                }
            }).catch(err => {
                console.log(err);
                save_ms_error_log(err,'Login initiated','Group Booking');
            });
        }

    }
    function cancelMeetingInvite() {

        let selection = [];
        if (props.is_organizer) {
            if(props.page_name !='from_view_all'){
                selection = props.applicantRef && props.applicantRef.state && props.applicantRef.state.applicantList ? props.applicantRef.state.applicantList : [];
            }else{
                selection = props.applicantList ? props.applicantList : [];
            }

        } else {
            selection = props.applicantList ? props.applicantList : [];
        }

        if (selection && selection.length) {
            let applicants = {};
            let selected_applicants = [];
            selection.map(selected => {
                applicants = {
                    applicant_id: selected.applicant_id,
                    application_id: selected.application_id,
                    job_id: selected.job_id,
                    interview_id: props.interview_id,
                    interview_applicant_id: selected.id,
                    interview_type: props.interview_type_id,
                    email: selected.email,
                    applicant_name: selected.applicant_name,
                    interview_meeting_status: selected.interview_meeting_status ? selected.interview_meeting_status : 0
                };
                selected_applicants.push(applicants);
            })
            if (props.is_organizer) {
                sendCancellationEmailToAllAttendees(selected_applicants);
            } else {
                sendCancellationEmailToSelectedAttendees(selected_applicants);
            }
        } else {
            toastMessageShow('Add Applicant to cancel', 'e');
        }
    }


    function sendCancellationEmailToAllAttendees(selected_applicants) {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts && accounts[0] ? accounts[0] : accountData
        }).then((res) => {
            // Allow only validation is passed
            setDisableButton(true);
            setLabelName('Sending...');
            const request_data = {
                "Comment": props.email_content
            }

            let cancel_reason_id = ''
            props.unsuccessful_reason_option.forEach(val => {
                if (val.label == 'Canceled') {
                    cancel_reason_id = val.value;
                }
            });

            callMsGraphForToCancelMeeting(res.accessToken, request_data, props.event_id).then(response => {
                if (response.status == 202 && response.statusText == "Accepted") {
                    // Call Api
                    let req = {
                        interview_id: props.interview_id,
                        ms_event_log_id: props.ms_event_log_id,
                        cancel_reason_id: cancel_reason_id,
                        interview_stage_status: 4,  // Unsuccessful
                        selected_applicants: selected_applicants,
                        reason_note: props.reason_note ? props.reason_note : '',
                        template_content: props.email_content,
                        subject: "Canceled "+props.group_booking_email_subject,
                        archive: props.applicant_archive
                    }
                    postData('recruitment/RecruitmentInterview/update_cancellation_ms_invite_to_gb', req).then((result) => {
                        if (result.status) {
                            // Trigger success pop
                            toastMessageShow(result.msg, 's');
                            if(props.page_name=='status_path'){
                                props.closeGBModal(true);
                            }else{
                                props.closeModal(true);
                            }
                          
                            
                            setDisableButton(false);
                            setLabelName(props.label_name);
                        } else {
                            // Trigger error pop
                            setDisableButton(false);
                            setLabelName(props.label_name);
                            toastMessageShow(result.error, "e");
                        }
                    });
                } else {
                    let msg = 'Please login only using ONCALL outlook account';
                    setLabelName(props.label_name);
                    setDisableButton(false);

                    if (response.error && response.error.code == 'ErrorItemNotFound') {
                        toastMessageShow('Please login as a group booking owner account  '+props.owner_name, "e");
                    }else if(response.error && response.error.code == 'MailboxNotEnabledForRESTAPI') {
                        toastMessageShow(msg, "e");                       
                    }else if(response.status == 404 && response.statusText == 'Not Found') {
                        toastMessageShow('Please login as a group booking owner account  '+props.owner_name, "e");                        
                    }else {
                        toastMessageShow(msg, "e");
                        setLabelName(props.label_name);
                        setDisableButton(false);
                    }
                }
            })
        }).catch(err => {
            setLabelName(props.label_name);
            setDisableButton(false);
            save_ms_error_log(err,'Send cancellation for all attendees','Group Booking');
            localStorage.removeItem("ms_username");
            localStorage.removeItem("ms_name");
            localStorage.removeItem("ms_token");
        });
    }

    function sendCancellationEmailToSelectedAttendees(selection) {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts && accounts[0] ? accounts[0] : accountData
        }).then((res) => {
            // Allow only validation is passed
            let attendees = {};
            let selected_attendes = [];
          
            let deleted_applicants = {};
            let group_booking_email_template = replaceGBEmailContent(props);
            if (selection && selection.length) {
                selection.map(selected => {
                    if (props.archive_applicant_id != selected.interview_applicant_id) {
                        attendees = {
                            "emailAddress": {
                                "address": selected.email,
                                "name": selected.applicant_name
                            },
                            "type": "required"
                        }
                        selected_attendes.push(attendees);
                    } 
                    if(props.archive_applicant_id == selected.interview_applicant_id){
                        deleted_applicants = {
                            applicant_id: selected.applicant_id,
                            application_id: selected.application_id,
                            job_id: selected.job_id,
                            interview_id: props.interview_id,
                            interview_applicant_id: selected.interview_applicant_id,
                            interview_type: props.interview_type_id,
                        }
                    }

                })
            }

            const request_data = ms_req_data(props, group_booking_email_template, selected_attendes)
            
            setDisableButton(true);
            setLabelName('Sending...');

            callMsGraphUpdateMeeting(res.accessToken, request_data, props.event_id).then(response => {
                if (!response.error && response.id) {
                    let req = {
                        interview_id: props.interview_id,
                        ms_event_log_id: props.ms_event_log_id,
                        odata_etag: response['@odata.etag'],
                        attendees: response.attendees,
                        createdDateTime: response.createdDateTime,
                        end: response.end,
                        isOrganizer: response.isOrganizer,
                        lastModifiedDateTime: response.lastModifiedDateTime,
                        organizer: response.organizer,
                        originalEndTimeZone: response.originalEndTimeZone,
                        originalStartTimeZone: response.originalStartTimeZone,
                        responseStatus: response.responseStatus,
                        start: response.start,
                        subject: response.subject,
                        type: response.type,
                        hasAttachments: response.hasAttachments,
                        hideAttendees: response.hideAttendees,
                        event_id: response.id,
                        importance: response.importance,
                        isAllDay: response.isAllDay,
                        isCancelled: response.isCancelled,
                        isDraft: response.isDraft,
                        selected_applicants: deleted_applicants,
                        interview_type_id: props.interview_type_id,
                        owner: props.owner,
                        template_content: response.body.content,  
                        archive: props.applicant_archive                     
                    }

                    // Call Api
                    postData('recruitment/RecruitmentInterview/cancel_ms_event_for_particular_applicant', req).then((result) => {
                        if (result.status) {
                            // Trigger success pop
                            toastMessageShow('Invitation Cancelled successfully', 's');
                            setDisableButton(false);
                            setLabelName(props.label_name);
                            props.closeModal(true);
                        } else {
                            // Trigger error pop
                            setDisableButton(false);
                            setLabelName(props.label_name);
                            toastMessageShow(result.error, "e");
                        }
                    });
                } else {
                    if (response.error && response.error.code == 'ErrorItemNotFound') {
                        toastMessageShow('Please login as a group booking owner account  '+props.owner_name, "e");
                        setLabelName(props.label_name);
                        setDisableButton(false);
                    }
                    if (response.error && response.error.code == 'MailboxNotEnabledForRESTAPI') {
                        toastMessageShow('Please login only using ONCALL outlook account', "e");
                        setLabelName(props.label_name);
                        setDisableButton(false);
                    }
                }
            })
        }).catch(err => {
            setLabelName(props.label_name);
            setDisableButton(false);
            save_ms_error_log(err,'Send cancellation for particular attendees','Group Booking');
            localStorage.removeItem("ms_username");
            localStorage.removeItem("ms_name");
            localStorage.removeItem("ms_token");
        });

    }

    return (
        <div>
            <Button label="Cancel" key={1} variant="neutral" onClick={() => {props.page_name=='status_path' ? props.closeGBModal(true) :props.closeModal(false)}} />
            <Button label={labelName} variant="brand" key={1} disabled={disableButton} onClick={(e) => checkUserLoggedIn(e)} />
        </div>
    )


}

