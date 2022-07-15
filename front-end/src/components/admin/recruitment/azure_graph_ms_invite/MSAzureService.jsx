import React from "react";
/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken 
 */
 export async function callMsGraph(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');
    

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch('https://graph.microsoft.com/v1.0/me', options)
        .then(response => response.json())
        .catch(error => console.log(error));

}


export async function callMsGraphForMeeting(accessToken, request_data) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');

    return fetch('https://graph.microsoft.com/v1.0/me/events', {
        method:'POST',
        headers: headers,
        body:JSON.stringify(request_data)
    })
        .then(response => response.json())
        .catch(error => console.log(error));
}

/***
 * send meeting update like time / content / add extra attendees 
 * **/

export async function callMsGraphUpdateMeeting(accessToken, request_data, event_id) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');     

    const options = {
        method: "PATCH",
        headers: headers,
        body:JSON.stringify(request_data)
    };
 
        return fetch('https://graph.microsoft.com/v1.0/me/events/'+event_id, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

/***
 * To get the attendees accept/decline/tentative status & 
 * get meeting details 
 * **/

export async function callMsGraphForMeetingStatus(accessToken, event_id) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');
    

    const options = {
        method: "GET",
        headers: headers
    };

    
        return fetch('https://graph.microsoft.com/v1.0/me/calendar/events/'+event_id, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}


/***
 * To get the attendees accept/decline/tentative status & 
 * get meeting details 
 * **/

 export async function callMsGraphForToCancelMeeting(accessToken, request_data, event_id) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');
    

    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request_data)
    };

    
        return fetch('https://graph.microsoft.com/v1.0/me/events/'+event_id+'/cancel', options)
        .then(response => response)        
        .catch(error => console.log(error));
}


/***
 * To get the attendees accept/decline/tentative status & 
 * get meeting details 
 * **/

 export async function callMsGraphToGetUserMessages(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');
    

    const options = {
        method: "GET",
        headers: headers,       
    };

    
        return fetch("https://graph.microsoft.com/v1.0/me/messages?$filter=Subject eq 'Accepted: Meeting Link to attend group interview'", options)
        .then(response => response)        
        .catch(error => console.log(error));
}