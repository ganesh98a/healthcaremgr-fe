import React, { useState, useEffect } from "react";
import { AuthenticatedTemplate, useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../../oncallui-react-framework/services/ms_azure_service/authConfig";
import { Button, } from '@salesforce/design-system-react';
import moment from 'moment';
import { postData, toastMessageShow } from 'service/common.js';
import { callMsGraphForMeetingStatus } from "./MSAzureService";
import { save_ms_error_log, validate_organizer } from './MSCommonRequest';

export const GetInvitedEventStatus = (props) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const isAuthenticated = useIsAuthenticated();
    const [accountData, setAccountData] = useState(accounts[0] || {});


    function checkUserLoggedIn() {
        if (isAuthenticated) {
            let org_username = accounts && accounts[0] ? accounts[0].username : ''
            if (validate_organizer(org_username, props)) {
                updateMeetingInvite();
            }
        }else{
            instance.loginPopup(loginRequest).then((res) => {
                localStorage.setItem("ms_username", res.account.username);
                localStorage.setItem("ms_name", res.account.name);
                localStorage.setItem("ms_token", res.accessToken);
                setAccountData(res.account);
                if(validate_organizer(res.account.username, props)){
                    updateMeetingInvite();
                }
            }).catch(e => {
                console.log(e);
            });
        }

    }

    function updateMeetingInvite() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts && accounts[0] ? accounts[0] : accountData
        }).then((res) => {
            let list_of_applicants = props.applicantList ? props.applicantList : [];

            let applicants = {};
            let selected_applicants = [];
            if (list_of_applicants && list_of_applicants.length) {
                list_of_applicants.map(app => {
                    applicants = {
                        applicant_id: app.applicant_id,
                        application_id: app.application_id,
                        job_id: app.job_id,
                        interview_id: props.interview_id,
                        interview_applicant_id: app.id,
                        email: app.email,
                        email_response: '',
                    };
                    selected_applicants.push(applicants);
                })
            }

            if (selected_applicants.length != 0) {
                callMsGraphForMeetingStatus(res.accessToken, props.event_id).then(response => {



                    if (!response.error && response.id) {

                        selected_applicants.forEach(applicants => {
                            let applicant_status = response.attendees.find(o => o.emailAddress.address === applicants.email);
                            if (applicant_status) {
                                applicants.email_response = applicant_status.status.response
                            }
                        });

                        let req = {
                            interview_id: props.interview_id,
                            ms_event_log_id: props.ms_event_log_id,
                            attendees: response.attendees,
                            selected_applicants: selected_applicants
                        }

                        // Call Api
                        postData('recruitment/RecruitmentInterview/update_invite_response_for_all_applicant', req).then((result) => {
                            if (result.status) {
                                // Trigger success pop
                                props.closeModal(true);
                            } else {
                                // Trigger error pop
                                toastMessageShow(result.error, "e");
                            }
                        });
                    } else {
                        if (response.error && response.error.code == 'ErrorItemNotFound') {
                            toastMessageShow('Please login as a group booking owner account  ' + props.owner_name, "e");
                        }
                        if (response.error && response.error.code == 'MailboxNotEnabledForRESTAPI') {
                            toastMessageShow('Please login only using ONCALL outlook account', "e");
                        }
                    }

                }).catch(err => {
                    save_ms_error_log(err, 'While getting RSVP', 'Group Booking');
                    localStorage.removeItem("ms_username");
                    localStorage.removeItem("ms_name");
                    localStorage.removeItem("ms_token");
                });
            }
        }).catch(err => {
            save_ms_error_log(err, 'While getting RSVP', 'Group Booking');
            localStorage.removeItem("ms_username");
            localStorage.removeItem("ms_name");
            localStorage.removeItem("ms_token");
        });
    }



    return (
        <><Button
            title={`Refresh`}
            assistiveText={{ icon: 'Refresh' }}
            iconCategory="utility"
            iconName="refresh"
            variant="icon"
            iconSize="medium"
            onClick={() => checkUserLoggedIn()}
            iconVariant="border-filled"
            iconPosition='center'
        /></>
    )
}