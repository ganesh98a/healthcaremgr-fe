export function subOrgViewBy() {
    return [{value: '1', label: 'Active'}, {value: '0', label: 'Inactive'}];
}

export function siteViewBy() {
    return [{value: '0', label: 'Current'}, {value: '1', label: 'Archive'}];
}

export function orgFmsViewBy() {
    return [{value: '0', label: 'All'},{value: '1', label: 'Organisation'}, {value: '2', label: 'Sub-Orgs'}];
}

export function subOrgFmsViewBy() {
    return [{value: '0', label: 'All'},{value: '1', label: 'Organisation (Self)'}];
}

export function docsViewBy() {
    return [{value: '1', label: 'Current'}, {value: '0', label: 'Archive'}];
}

export function subOrgStatus() {
    return [{value: '1', label: 'Active'}, {value: '0', label: 'Inactive'}];
}

export function isParentOrg() {
    return [{value: '1', label: 'Yes'}, {value: '0', label: 'No'}];
}

export function orgGst() {
    return [{value: '1', label: 'Yes'}, {value: '0', label: 'No'}];
}

export function orgTax() {
    return [{value: '1', label: 'Yes'}, {value: '0', label: 'No'}];
}

export function orgAddressCategory() {
    return [{value: '1', label: 'Head Office'}, {value: '2', label: 'Billing'}, {value: '3', label: 'Other'}];
}


export function statusOptionProfile() {
    return [{value: 1, label: 'Active'}, {value: 0, label: 'Inactive'}];
}

export function orgContactViewBy() {
    return [{value: '0', label: 'Current'}, {value: '1', label: 'Archive'}];
}

export function orgContactType() {
    return [{value: '3', label: 'Key Contact'}, {value: '4', label: 'Billing Contact'}];
}

export function houseContactType() {
    return [{value: 1, label: 'Support Corrdinator'}, {value: 3, label: 'Key Contact'}, {value: 5, label: 'Other'}];
}

export function orgSiteType() {
    return [{value: '1', label: 'Site'}];
}

export function contactViewBy() {
    return [{value: '0', label: 'Current'}, {value: '1', label: 'Archive'}];
}

export function billPayBy() {
    return [{value: '1', label: 'Parent Org'}, {value: '2', label: 'Sub-org'}, {value: '3', label: 'Self'}];
}

export function siteBillPayBy() {
    return [{value: '1', label: 'Parent Org'}, {value: '3', label: 'Self'}];
}

export function orgBillPayBy() {
    return [{value: '1', label: 'Parent Org'}, {value: '3', label: 'Self'}];
}

export function orgBillViewBy() {
    return [{value: '0', label: 'Payment Pending/Xero Draft'}, {value: '1', label: 'Payment Received/Xero Paid'}, {value: '2', label: 'Payment Not Received/Xero Not Paid'}];
}

export function orgContactTypeOtherOnly() {
    return [{value: '5', label: 'Other'}];
}

export function orgContactTypeAll() {
    return [{value: '3', label: 'Key Contact'}, {value: '4', label: 'Billing Contact'}, {value: '5', label: 'Other'}];
}

export function documentFrequencyOptions() {
    return  [
        {value: "daily", label: "Daily Document"},
        {value: "week", label: "Weekly"},
        {value: "fortnightly", label: "Fortnightly"},
        {value: "month", label: "Monthly"},
        {value: "quarterly", label: "Quarterly"},
        {value: "year", label: "Yearly"}
    ];
}

export function orgListFilterBy() {
    return [{value: '1', label: 'Newest'}, {value: '2', label: 'Oldest'}];
}

export function orgSiteDrpDwn(givenKey) {
    var myArray = [{value:0,label:'All (Orgs & Sites)'},{value:1,label:'Orgs'},{value:2,label:'Sites'}];

    if(givenKey == 0)
        return myArray;
        else
        return myArray[givenKey-1].label;
}

export function orgPendingStatusDrpDwn(givenKey) {
    var myArray = [{value:0,label:'Pending Action'},{value:1,label:'Rejected'}];

    if(givenKey == 0)
        return myArray;
        else
        return myArray[givenKey-1].label;
}