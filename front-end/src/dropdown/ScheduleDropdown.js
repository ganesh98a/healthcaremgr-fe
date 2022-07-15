export function RosterDropdown(key) {
    var interpreter = [{value: "roster", label: 'Roster'}, {value: 'plans', label: 'Plan(s)'}, {value: 'plans', label: 'Plan(s)'}, {value: 'plans', label: 'Plan(s)'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

export function AnalysisDropdown(key) {
    var interpreter = [{value: "analysis", label: 'Analysis'}, {value: 'plans', label: 'Plan(s)'}, {value: 'plans', label: 'Plan(s)'}, {value: 'plans', label: 'Plan(s)'}]

    if (key > 0) {
        return interpreter[key - 1].label;
    } else if (key == 0) {
        return interpreter;
    }

}

/*Booked by*/
export function bookedByDropDown(givenKey) {
    var myArray = [{value: 2, label: 'Participant'}, {value: 1, label: 'Site'}, {value: 7, label: 'House'}/* ,{value: 3, label: 'Location'} */];

    if (givenKey == 0)
        return myArray;
    else
        return myArray[givenKey - 1].label;
}

export function bookingListyDropDown(givenKey) {
    var myArray = [{value: 1, label: 'Other 1'}, {value: 2, label: 'Other 2'}, {value: 3, label: 'Other 3'}];

    if (givenKey == 0)
        return myArray;
    else
        return myArray[givenKey - 1].label;
}

export function bookingListySiteBooker(givenKey) {
    var myArray = [{value: 1, label: 'Other'}];

    if (givenKey == 0)
        return myArray;
    else
        return myArray[givenKey - 1].label;
}

export function shiftYesNo() {
    return [{value: 1, label: 'Yes'}, {value: 2, label: 'No'}];
}

export function confirmWith(key) {
    var interpreter = [{value: 1, label: 'Booker'}, {value: 2, label: 'Other'}];

    if (key == 0) {
        return interpreter;
    } else {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;

    }
}

export function confirmWithSites(key) {
    var interpreter = [{value: 3, label: 'Key Contacts'}, {value: 4, label: 'Billing Contact'}];
    if (key == 0) {
        return interpreter;
    } else {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;

    }
}
export function confirmBy(key) {
    var interpreter = [{value: 1, label: 'Phone'}, {value: 2, label: 'Direct Email'}, {value: 3, label: 'SMS'}, {value: 4, label: 'Imail'}];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        if (index >= 0) {
            return interpreter[index].label;
        }

    } else {
        return interpreter;
    }
}

export function bookingMethodOption(key) {

    var interpreter = [{value: 1, label: 'Phone'}, {value: 2, label: 'Direct Email'}, {value: 3, label: 'SMS'}, {value: 4, label: 'Imail'}];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        if (index >= 0) {
            return interpreter[index].label;
        }

    } else {
        return interpreter;
    }
}

export function availableMemberLookup() {
    return [{value: 'highest_matched', label: 'Highest Matched'}, {value: "most_contact", label: 'Most Contact'}, {value: "most_shared_preferences", label: 'Most Shared Preferences'}];
}

export function availableMemberMatches() {
    return [{value: 3, label: '3'}, {value: 5, label: '5'}, {value: 10, label: '10'}];
}

export function cancelShiftMethod(key) {
    var interpreter = [{value: 1, label: 'Email'}, {value: 2, label: 'Call'}, {value: 3, label: 'SMS'}];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function shiftTypeDepartmentOption(key) {

    var interpreter = [
        {label: 'Select', value: ''},
        {value: 'am', label: 'AM'},
        {value: 'pm', label: 'PM'},
        {value: 'so', label: 'S/O'},
        {value: 4, label: 'Emergency'},
        {value: 4, label: 'NDIS'},
        {value: 4, label: 'Out of Home Care'},
        {value: 4, label: 'Disability Accommodation Services'},
    ];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function unfilledShiftTypeFilterOption(key) {

    var interpreter = [
        {label: 'Select', value: ''},
        {value: 'am', label: 'AM'},
        {value: 'pm', label: 'PM'},
        {value: 'so', label: 'S/O'},
        {value: 4, label: 'Emergency'},
    ];

    return interpreter;
}

export function rosterFilterOption(key) {

    var interpreter = [
        {value: '', label: 'Select'},
        {value: 'default', label: 'Default Roster'},
        {value: 'temporary', label: 'Temporary Roster'},
        {value: 'NDIS', label: 'NDIS'},
        {value: 'OutofHomeCare', label: 'Out of Home Care'},
        {value: 'DisabilityAccommodationServices', label: 'Disability Accommodation Services'},
    ];

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}

export function cancelShiftWhoOption(key, booked_by, status) {
    var interpreter = [];
    
    if(status == 7){
        interpreter = [...interpreter, {value: 'member', label: 'Member'}];
    }
    if(booked_by == 2 || booked_by == 3){
        interpreter = [...interpreter,{value: 'participant', label: 'Participant'}, {value: 'kin', label: 'Next of kin'}, {value: 'booker', label: 'Booker'}];
    }
    if(booked_by == 1){
        interpreter = [...interpreter,{value: 'org', label: 'Org'}, {value: 'site', label: 'Site'}];
    } 
    if(booked_by == 7){
        interpreter = [...interpreter,{value: 'house', label: 'House'}];
    } 

    if (key) {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;
    } else {
        return interpreter;
    }
}
export function confirmWithHouse(key) {
    var interpreter = [{value: 3, label: 'Key Contacts'}, {value: 1, label: 'Support Coordinator'}];
    if (key == 0) {
        return interpreter;
    } else {
        var index = interpreter.findIndex(x => x.value == key)
        return interpreter[index].label;

    }
}