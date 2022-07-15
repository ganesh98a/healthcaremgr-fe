
/**
 * @typedef {keyof crmActiveTitle} CrmActiveTitleKey
 */

export const ListViewRelatedType = {
    contact: '1',
    organisation: '2',
    tasks: '3',
    leads: '4',
    opportunity: '5',
    need_assessment: '6',
    risk_assessment: '7',
    service_agreements: '8',
    shift: '9',
    payrates: '20',
    timesheets: '21',
    application: '11',
    roster: '18',
    charge_rates: '19',
    document: '16',
    participant: '10',
    email_templates: '17',
    holiday: '23',
    fms_feed_back: '24',
    sms_template: '26',
    business_unit: '35'
};

export const selectFilterOperatorOptions = [
    { value: "equals", label: "equals", symbol: "=" },
    { value: "not equal to", label: "not equal to", symbol: "<>" },
    { value: "less than", label: "less than", symbol: "<" },
    { value: "greater than", label: "greater than", symbol: ">" },
    { value: "greater or equal", label: "greater or equal", symbol: ">=" },
    { value: "less or equal", label: "less or equal", symbol: "<=" },
    { value: "contains", label: "contains", symbol: "" },
    { value: "does not contains", label: "does not contain", symbol: "" },
    { value: "starts with", label: "starts with", symbol: "" }
]

//recruitment datatable list
export const selectFilterOperatorOptionsForRecruit = [
  { value: "contains", label: "contains", symbol: "" },
  { value: "does not contains", label: "does not contain", symbol: "" },
  { value: "equals", label: "equals", symbol: "=" },
  { value: "not equal to", label: "not equal to", symbol: "<>" },
  { value: "less than", label: "less than", symbol: "<" },
  { value: "greater than", label: "greater than", symbol: ">" },
  { value: "greater or equal", label: "greater or equal", symbol: ">=" },
  { value: "less or equal", label: "less or equal", symbol: "<=" },
  { value: "starts with", label: "starts with", symbol: "" }
]

// for all page - 1-contact
export const selectFilterTypeOptions = function (filter_related_type) {
    filter_related_type = parseInt(filter_related_type);
    switch (filter_related_type) {
        case 1:
            return [
                { value: "Applicant", label: "Applicant" },
                { value: "Lead", label: "Lead" },
                { value: "Participant", label: "Participant" },
                { value: "Booker", label: "Booker" },
                { value: "Agent", label: "Agent" },
                { value: "Organisation", label: "Organisation" }
            ];
        case 12:
            return [
                { value: "Quiz", label: "Quiz" },
                { value: "Meeting Invite", label: "Meeting Invite" },
            ];
        default:
            return []
    }
}

export const selectContactFilterOptions = [
    { value: "ID", label: "ID", field: "contact_code" },
    { value: "Full Name", label: "Full Name", field: "fullname" },
    { value: "Type", label: "Type", field: "type" },
    { value: "Status", label: "Status", field: "status" },
    { value: "Created Date", label: "Created Date", field: "created" },
    { value: "Created By", label: "Created By", field: "created_by" }
]

export const selectFilterStatusoptions = function(filter_related_type,status_filter_value='') {
    switch(filter_related_type) {
      //9-shifts ,11- Applicants, 4-leads
      case '4':
        return [
          { value: "1", label: "Open" },
          { value: "2", label: "In progress" },
          { value: "3", label: "Qualified" },
          { value: "4", label: "Unqualified" }
        ];
        case '6':
        return [
            { value: 1, label: "Draft" },
            { value: 2, label: "Active" },
            { value: 3, label: "InActive" }
        ];
      case '9':
        return filter_shift_status(status_filter_value)
      case '11':
        return [
          { value: "0", label: "New" },
          { value: "1", label: "Screening" },
          { value: "2", label: "Interviews" },
          // { value: "3", label: "References" },
          // { value: "4", label: "Documents" },
          { value: "5", label: "In progress" },
          { value: "6", label: "CAB" },
          { value: "7", label: "Hired" },
          { value: "8", label: "Unsuccessful" }
        ];
      case 'member_status':
        return [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ];
      case '7':
          return [
            { value: "1", label: "Draft" },
            { value: "2", label: "Final" },
            { value: "3", label: "InActive" }
          ];
        case '17':
            return [
              { value: "Active", label: "Active" },
              { value: "Archive", label: "Archive" }
            ]
      case '23':
      return [
          { value: "1", label: "Active" },
          { value: "0", label: "InActive" }
      ]
        case '24':
          return [
            { value: "0", label: "Open" },
            { value: "1", label: "In progress" },
            { value: "2", label: "Closed" }
          ]
      case '32':
        return [
            { value: "1", label: "Active" },
            { value: "2", label: "InActive" }
        ]
      case '28':
              return [
                  { value: "0", label: "Draft" },
                  { value: "2", label: "Closed" },
                  { value: "3", label: "Live" },
                  { value: "5", label: "Scheduled" }
              ]
          default:
              return [
                  { value: "Active", label: "Active" },
                  { value: "In Active", label: "In Active" }
              ]
      }
  }
// contact page ends here
// organisation page starts here

export const selectOrganisationFilterOptions = [
    { value: "Organisation ID", label: "ID", field: "contact_code" },
    { value: "Organisation Name", label: "Full Name", field: "fullname" },
    { value: "Status", label: "Status", field: "status" },
    { value: "Created Date", label: "Created Date", field: "created" },
]
// organisation page ends here

export const yesOrNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
]
export const publicOrPrivateOptions = [
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
]
export const feedAlertTypeOptions = [
    { value: "Member Alert", label: "Member Alert" },
    { value: "Organisation/Participant Alert", label: "Organisation/Participant Alert" },
]
export const feedbackTypeOptions = [
    { value: "Complaint", label: "Complaint" },
    { value: "Reportable Incident", label: "Reportable Incident" },
    { value: "Other Feedback", label: "Other Feedback" }
]
export const feedCategoryOptions = [
    { value: "Currently works there", label: "Currently works there" },
    { value: "Previously works there", label: "Previously works there" },
    { value: "Location not suitable", label: "Location not suitable" },
    { value: "Mismatch skills/ shift tasks", label: "Mismatch skills/ shift tasks" },
    { value: "Mismatch Client/Site", label: "Mismatch Client/Site" },
    { value: "Other", label: "Other" },
    { value: "Staff Performance", label: "Staff Performance" },
    { value: "Mismatch Member skills/quals", label: "Mismatch Member skills/quals" },
    { value: "Mismatch demographic", label: "Mismatch demographic" },
    { value: "Service Delivery", label: "Service Delivery" },
    { value: "NDIS Serious", label: "NDIS Serious" },
    { value: "NDIS Unauthorised Restrictive Practice", label: "NDIS Unauthorised Restrictive Practice" },
    { value: "CIMS Major", label: "CIMS Major" },
    { value: "Notification of Event", label: "Notification of Event" },
    { value: "Other Agency Reportable", label: "Other Agency Reportable" },
    { value: "Compliment", label: "Compliment" },
    { value: "Comment", label: "Comment" },
];

export const initCategoryOptions = [
    { value: "Member of Public", label: "Member of Public" },
    { value: "HCM Member", label: "HCM Member" },
    { value: "HCM Participant", label: "HCM Participant" },
    { value: "HCM (General)", label: "HCM (General)" },
    { value: "HCM User/Admin", label: "HCM User/Admin" },
    { value: "HCM Organisation", label: "HCM Organisation" },
    { value: "HCM Site", label: "HCM Site" }
];

export const againstCategoryOptions = [
    { value: "Member of Public", label: "Member of Public" },
    { value: "HCM Member", label: "HCM Member" },
    { value: "HCM Participant", label: "HCM Participant" },
    { value: "HCM (General)", label: "HCM (General)" },
    { value: "HCM User/Admin", label: "HCM User/Admin" },
    { value: "HCM Organisation", label: "HCM Organisation" },
    { value: "HCM Site", label: "HCM Site" }
];

export const selectFilterActiveOptions = function (filter_related_type) {
    filter_related_type = parseInt(filter_related_type);
    switch (filter_related_type) {
        case 10:
            return [
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
            ];        
        default:
            return []
    }
}

const filter_shift_status = (status_filter_value) => {
    const shift_status = [
        { value: "1", label: "Open" },
        { value: "2", label: "Published" },
        { value: "3", label: "Scheduled" },
        { value: "4", label: "In progress" },
        { value: "5", label: "Completed" },
        { value: "6", label: "Cancelled" }
    ];
    if (status_filter_value == 'all' || status_filter_value == '') {
        return shift_status;
    }
    else if (status_filter_value == 'inactive') {
        return shift_status.filter((data) => data.value > 4)
    }
    else if (status_filter_value == 'active') {
        return shift_status.filter((data) => data.value < 5)
    }
}

export const jobCategoryFilterOptions = [
    { value: "1", label: "Field Staff" },
    { value: "2", label: "Head Office" }
]

export const fundType = [
    { value: "1", label: "Portal" },
    { value: "2", label: "Plan" },
    { value: "3", label: "Self" }
]

export const interviewStatus=[
    { value: "0", label: "Open" },
    { value: "1", label: "Scheduled" },
    { value: "2", label: "In progress" },
    { value: "3", label: "Successful" },
    { value: "4", label: "Unsuccessful" },
]

export const OAStatus=[
    { value: "1", label: "Sent" },
    { value: "2", label: "In progress" },
    { value: "3", label: "Submitted" },
    { value: "8", label: "Session Expired" },
    { value: "4", label: "Completed" },
    { value: "5", label: "Link Expired" },
    { value: "6", label: "Error" },
    { value: "7", label: "Moodle" },
]