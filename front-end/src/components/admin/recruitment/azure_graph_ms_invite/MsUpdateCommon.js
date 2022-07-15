import React, { useState } from "react";
import { useMsal, useAccount, useIsAuthenticated  } from "@azure/msal-react";
import { loginRequest } from "../../oncallui-react-framework/services/ms_azure_service/authConfig";
import { Button, } from '@salesforce/design-system-react';
import moment from 'moment';
import { postData, toastMessageShow } from 'service/common.js';
import { callMsGraphForMeeting, callMsGraphUpdateMeeting } from "./MSAzureService";
import { replaceGBEmailContent, save_ms_error_log, ms_req_data, validate_organizer } from './MSCommonRequest';

export const UpdateMeetingInvite = (props) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [labelName, setLabelName] = useState(props.label_name);
    const [disableButton, setDisableButton] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const [accountData, setAccountData] = useState(accounts[0] || {});

    const checkUserLoggedIn = (e) => {
        let selection = [];
        let selected_row = [];        
        if (props.page_name == 'from_view_all') {
            selected_row = props.selected_row ? props.selected_row : [];
            selection = props.applicantList ? props.applicantList : [];
        } else {
            selected_row = props.applicantRef && props.applicantRef.state && props.applicantRef.state.selected_row ? props.applicantRef.state.selected_row : [];
            selection = props.applicantRef && props.applicantRef.state && props.applicantRef.state.applicantList ? props.applicantRef.state.applicantList : [];
        }
        e.preventDefault();

        let check_update = {
            interview_start_datetime: moment(props.interview_start_date).format('YYYY-MM-DD') + ' ' + moment(props.interview_start_time, ["h:mm A"]).format("HH:mm"),
            interview_end_datetime: moment(props.interview_end_date).format('YYYY-MM-DD') + ' ' + moment(props.interview_end_time, ["h:mm A"]).format("HH:mm"),
            location_id: props.location_id,
            interview_type_id: props.interview_type_id,
        }

        if (props.page_name == 'edit_gb') {
            postData('recruitment/RecruitmentInterview/check_any_changes_done_for_gb_update', check_update).then((result) => {
                if (result.status) {
                    props.submit_interview();
                } else if (selection && selection.length == 0) {
                    props.submit_interview();
                } else {
                    loginAndUpdateInvite(selection, selected_row, true);
                }
            });
        } else {
            loginAndUpdateInvite(selection, selected_row);
        }
    }

    function loginAndUpdateInvite(selection, selected_row, is_edit) {
        if (selected_row && selected_row.length == 0 && props.page_name != 'edit_gb') {
            toastMessageShow("Select atleast one applicant", "e");
            return;
        }

        if (isAuthenticated) {            
            let org_username = accounts && accounts[0] ? accounts[0].username : ''
            if (validate_organizer(org_username, props)) {
                updateMeetingInvite(selection, selected_row, is_edit);
            }
        }else{
            instance.loginPopup(loginRequest).then((res) => {
                localStorage.setItem("ms_username", res.account.username);
                localStorage.setItem("ms_name", res.account.name);
                localStorage.setItem("ms_token", res.accessToken);
                setAccountData(res.account);
                if(validate_organizer(res.account.username, props)){
                    updateMeetingInvite(selection, selected_row, is_edit);
                }
            }).catch(err => {
                console.log(err);
                save_ms_error_log(err,'Login initiated','Application Listing');
            });
        }

    }

    function updateMeetingInvite(selection, selected_row, is_edit) {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts && accounts[0] ? accounts[0] : accountData
        }).then((res) => {
            // Allow only validation is passed
            let attendees = {};
            let selected_attendes = [];

            let applicants = {};
            let selected_applicants = [];
            let group_booking_email_template = replaceGBEmailContent(props);
            if (selection && selection.length) {
                selection.map(selected => {
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

            if (selected_row && selected_row.length) {
                selected_row.map(selected => {
                    applicants = {
                        applicant_id: selected.applicant_id,
                        application_id: selected.application_id,
                        job_id: selected.job_id,
                        interview_id: props.interview_id,
                        interview_applicant_id: selected.interview_applicant_id,
                        interview_type: props.interview_type_id,
                    };
                    selected_applicants.push(applicants);
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
                        selected_applicants: selected_applicants,
                        interview_type_id: props.interview_type_id,
                        owner: props.owner,
                        template_content: response.body.content,
                        is_resend: 1,
                        is_edit: is_edit,
                        selection: selection
                    }

                    // Call Api
                    postData('recruitment/RecruitmentInterview/resend_ms_invite_to_applicants', req).then((result) => {
                        if (result.status) {
                            // Trigger success pop
                            toastMessageShow(result.msg, 's');
                            if (props.page_name == 'from_view_all') {
                                props.emptyTheSeletedRow();
                            } else {
                                if (props.page_name == 'edit_gb') {
                                    props.submit_interview();
                                }
                                props.applicantRef.emptyTheSeletedRow();
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
                    if (response.error && response.error.code == 'ErrorItemNotFound') {
                        toastMessageShow('Please login as a group booking owner account '+props.owner_name, "e");
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
                let title = "Resend Invite to all applicant"
                if(props.page_name == 'edit_gb'){
                    title = "Updating group booking and resend invite"
                }
                save_ms_error_log(err,title,'Group Booking');
                localStorage.removeItem("ms_username");
                localStorage.removeItem("ms_name");
                localStorage.removeItem("ms_token");
            });
    }

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: "/admin/recruitment/interview",
            mainWindowRedirectUri: "/admin/recruitment/interview"
        }).then(() => {
            localStorage.removeItem("ms_username");
            localStorage.removeItem("ms_name");
            localStorage.removeItem("ms_token");
        });
    }

    return (
        <div>
            {props.page_name == 'edit_gb' ?
                <> <Button label="Cancel" key={1} variant="neutral" onClick={() => props.closeModal(false)} />
                    <Button label={labelName} key={1} variant="brand" disabled={disableButton} onClick={(e) => checkUserLoggedIn(e)} /></>
                :
                <Button label={labelName} key={1} disabled={disableButton} onClick={(e) => checkUserLoggedIn(e)} />}

        </div>
    )


}

