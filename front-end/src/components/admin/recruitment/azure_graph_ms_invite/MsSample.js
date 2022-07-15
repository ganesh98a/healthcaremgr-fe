import React, { useState } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import { loginRequest } from "../../oncallui-react-framework/services/ms_azure_service/authConfig";
import { Button, } from '@salesforce/design-system-react';
import moment from 'moment';
import { postData, toastMessageShow } from 'service/common.js';
import { callMsGraphForMeeting, callMsGraphUpdateMeeting, callMsGraph, callMsGraphForMeetingStatus } from "./MSAzureService";
import { replaceGBEmailContent, replaceMSTemplateContent } from './MSCommonRequest';

export const SignInButton = (props) => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [graphData, setGraphData] = useState(null);

    const handleLoginSave = (loginType) => {
        if (loginType === "popup") {
            instance.loginPopup(loginRequest).then((res) => {
                localStorage.setItem("ms_username", res.account.username);
                localStorage.setItem("ms_name", res.account.name);
            }).catch(e => {
                console.log(e);
            });
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest).then((res) => {
                console.log(res)
            }).catch(e => {
                console.log(e);
            });
        }
    }



    function RequestProfileData() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            callMsGraph(response.accessToken).then(response => {
                setGraphData(response)
            }

            );
        });
    }

    function sendMeetingInvite() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            const request_data = {

                "subject": "API Creating test meeting link ",
                "body": {
                    "contentType": "HTML",
                    "content": "This meeting link is created from SAmple React. Now Need to integrate with our APP. Hence HCM-9741 integration Sucessfully completed"
                },
                "start": {
                    "dateTime": moment(props.interview_start_date).format('YYYY-MM-DD') + 'T' + moment(props.interview_start_time, ["h:mm A"]).format("HH:mm"),
                    "timeZone": moment.tz.guess()
                },
                "end": {
                    "dateTime": moment(props.interview_end_date).format('YYYY-MM-DD') + 'T' + moment(props.interview_end_time, ["h:mm A"]).format("HH:mm"),
                    "timeZone": moment.tz.guess()
                },
                "location": {
                    "displayName": "Online"
                },
                "attendees": [
                    {
                        "emailAddress": {
                            "address": localStorage.getItem('ms_username'),
                            "name": localStorage.getItem('ms_name')
                        },
                        "type": "required"
                    },                
                {
                    "emailAddress": {
                    "address":props.owner.email,
                    "name": props.owner.label
                    },
                    "type": "required"
                }
                ],
                "allowNewTimeProposals": true,
                "isOnlineMeeting": true,
                "onlineMeetingProvider": "teamsForBusiness"

            }
            callMsGraphForMeeting(response.accessToken, request_data).then(response => setGraphData(response));
        });
    }

    function updateMeetingInvite() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            callMsGraphUpdateMeeting(response.accessToken).then(response => setGraphData(response));
        });
    }

    return (
        <div>
            <button className="d-none" value="Login" key={1} variant="brand" onClick={() => handleLoginSave("popup")} >Login</button>
            <button className="d-none" value="Send meeting invite" key={1} variant="brand" onClick={() => sendMeetingInvite()} >Send meeting invite</button>
        </div>

    )
}
