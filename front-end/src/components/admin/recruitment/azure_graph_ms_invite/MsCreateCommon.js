import React, { useState } from "react";
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../../oncallui-react-framework/services/ms_azure_service/authConfig";
import { Button, } from '@salesforce/design-system-react';
import moment from 'moment';
import { postData, toastMessageShow } from 'service/common.js';
import { callMsGraphForMeeting, callMsGraphUpdateMeeting } from "./MSAzureService";
import { replaceGBEmailContent, ms_req_data, save_ms_error_log, validate_organizer } from './MSCommonRequest';

export const CreateOrUpdateMeetingInvite = (props) => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [labelName, setLabelName] = useState('Send Invite');
    const [disableButton, setDisableButton] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const [accountData, setAccountData] = useState(accounts[0] || {});

    const checkUserLoggedIn = (e) => {

        e.preventDefault();
        if (props.selection && props.selection.length > 0) {
            if (isAuthenticated) {
                let org_username = accounts && accounts[0] ? accounts[0].username : ''
                if (validate_organizer(org_username, props)) {
                    createOrUpdateMeetingInvite(e);
                }
            }else{
                instance.loginPopup(loginRequest).then((res) => {
                    localStorage.setItem("ms_username", res.account.username);
                    localStorage.setItem("ms_name", res.account.name);
                    localStorage.setItem("ms_token", res.accessToken);
                    setAccountData(res.account);
                    if(validate_organizer(res.account.username, props)){
                        createOrUpdateMeetingInvite();
                    }
                }).catch(e => {
                    console.log(e);
                });
            }
        } else {
            toastMessageShow("Select atleast one applicant", "e");
        }
    }

    const createOrUpdateMeetingInvite = (e) => {
        e.preventDefault();
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts && accounts[0] ? accounts[0] : accountData
        }).then((res) => {
            // Allow only validation is passed
            let attendees = {};
            let selected_attendes = [];

            let applicants = {};
            let selected_applicants = [];
            let selected_data = props.applicantList;
            let group_booking_email_template = replaceGBEmailContent(props);
            if (props.page_from == 'list_interviews') {
                selected_data = props.selection;
            }
            // IF already selected data is there update that also
            if (selected_data && selected_data.length > 0) {
                selected_data.map(selected => {
                    attendees = {
                        "emailAddress": {
                            "address": selected.email,
                            "name": selected.applicant_name
                        },
                        "type": "required"
                    }
                    selected_attendes.push(attendees);
                })
            }
            if (props.selection && props.selection.length > 0) {
                props.selection.map(selected => {

                    applicants = {
                        applicant_id: selected.applicant_id,
                        application_id: selected.application_id,
                        job_id: selected.jobId,
                        interview_id: props.interview_id,
                        interview_applicant_id: "",
                        interview_type: props.interview_type,
                    };

                    attendees = {
                        "emailAddress": {
                            "address": selected.email,
                            "name": selected.applicant_name
                        },
                        "type": "required"
                    }
                    selected_attendes.push(attendees);

                    selected_applicants.push(applicants);

                })
            }

            const request_data = ms_req_data(props, group_booking_email_template, selected_attendes);

            let applicant_req = {
                selected_applicants: selected_applicants
            }
            setDisableButton(true);
            setLabelName('Sending...');
            postData('recruitment/RecruitmentInterview/check_applicant_interview_exists', applicant_req).then((result) => {
                if (result.status) {
                    if (props.event_id) {
                        updateMeetingLink(res, request_data, selected_applicants);
                    } else {
                        createMeetingLink(res, request_data, selected_applicants);
                    }

                } else {
                    // Trigger error pop
                    setLabelName('Send Invite');
                    setDisableButton(false);
                    toastMessageShow(result.error, "e");
                }
            });

        }).catch(err => {
            setLabelName('Send Invite');
            setDisableButton(false);
            console.log(err);
            save_ms_error_log(err,'Login initiated','Group Booking');
            localStorage.removeItem("ms_username");
            localStorage.removeItem("ms_name");
            localStorage.removeItem("ms_token");
        });

        const createMeetingLink = (res, request_data, selected_applicants) => {
            callMsGraphForMeeting(res.accessToken, request_data).then(response => {
                if (!response.error && response.id) {
                    let req = {
                        interview_id: props.interview_id,
                        odata_context: response['@odata.context'],
                        odata_etag: response['@odata.etag'],
                        allowNewTimeProposals: response.allowNewTimeProposals,
                        attendees: response.attendees,
                        createdDateTime: response.createdDateTime,
                        end: response.end,
                        hasAttachments: response.hasAttachments,
                        hideAttendees: response.hideAttendees,
                        iCalUId: response.iCalUId,
                        event_id: response.id,
                        importance: response.importance,
                        isAllDay: response.isAllDay,
                        isCancelled: response.isCancelled,
                        isDraft: response.isDraft,
                        isOnlineMeeting: response.isOnlineMeeting,
                        isOrganizer: response.isOrganizer,
                        isReminderOn: response.isReminderOn,
                        lastModifiedDateTime: response.lastModifiedDateTime,
                        location: response.location,
                        locations: response.locations,
                        occurrenceId: response.occurrenceId,
                        onlineMeeting: response.onlineMeeting,
                        onlineMeetingProvider: response.onlineMeetingProvider,
                        onlineMeetingUrl: response.onlineMeetingUrl,
                        organizer: response.organizer,
                        originalEndTimeZone: response.originalEndTimeZone,
                        originalStartTimeZone: response.originalStartTimeZone,
                        recurrence: response.recurrence,
                        reminderMinutesBeforeStart: response.reminderMinutesBeforeStart,
                        responseRequested: response.responseRequested,
                        responseStatus: response.responseStatus,
                        sensitivity: response.sensitivity,
                        seriesMasterId: response.seriesMasterId,
                        showAs: response.showAs,
                        start: response.start,
                        subject: response.subject,
                        type: response.type,
                        webLink: response.webLink,
                        interview_type_id: props.interview_type_id,
                        selected_applicants: selected_applicants,
                        template_content: response.body.content
                    }

                    // Call Api
                    postData('recruitment/RecruitmentInterview/create_ms_events_logs', req).then((result) => {
                        if (result.status) {
                            // Trigger success pop
                            toastMessageShow(result.msg, 's');
                            setDisableButton(false);
                            setLabelName('Send Invite');
                            props.closeApplicantModal(true);
                            if (props.addApplicantFromList) {
                                props.refreshListView();
                            } else {
                                props.get_interview_by_id(props.interview_id);
                                props.listHeaderOptions();
                            }
                        } else {
                            // Trigger error pop
                            setDisableButton(false);
                            setLabelName('Send Invite');
                            toastMessageShow(result.error, "e");
                        }
                    });
                } else {
                    if (response.error && response.error.code == 'ErrorItemNotFound') {
                        toastMessageShow('Please login as a group booking owner account  '+props.owner_name, "e");
                    }
                }

            }).catch(err => {
                setLabelName('Send Invite');
                setDisableButton(false);
                console.log(err);
                save_ms_error_log(err,'Add attendees / generate meeting link','Group Booking');                
                localStorage.removeItem("ms_username");
                localStorage.removeItem("ms_name");
                localStorage.removeItem("ms_token");
            })
        }

        const updateMeetingLink = (res, request_data, selected_applicants) => {
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
                        selected_applicants: selected_applicants,
                        interview_type_id: props.interview_type_id,
                        owner: props.owner,
                        template_content: response.body.content
                    }

                    // Call Api
                    postData('recruitment/RecruitmentInterview/resend_ms_invite_to_applicants', req).then((result) => {
                        if (result.status) {
                            // Trigger success pop
                            toastMessageShow(result.msg, 's');
                            setDisableButton(false);
                            setLabelName('Send Invite');
                            props.closeApplicantModal(true);
                        } else {
                            // Trigger error pop
                            setDisableButton(false);
                            setLabelName('Send Invite');
                            toastMessageShow(result.error, "e");
                        }
                    });

                } else {
                    // Trigger error pop
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
                    setDisableButton(false);
                    setLabelName('Send Invite');
                }
            }).catch(err => {
                setLabelName('Resend Invite');
                setDisableButton(false);
                console.log(err);
                save_ms_error_log(err,'Add extra attendees / update meeting link ','Group Booking');
                localStorage.removeItem("ms_username");
                localStorage.removeItem("ms_name");
                localStorage.removeItem("ms_token");
            })
        }
    }

    return (
        <div>
            <Button label="Later" key={1} variant="brand" onClick={() => props.closeApplicantModal(true)} />
            <Button label={labelName} key={1} variant="brand" disabled={disableButton} onClick={(e) => checkUserLoggedIn(e)} />
        </div>
    )


}

