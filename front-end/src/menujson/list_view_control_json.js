
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
};

export const selectFilterOperatorOptions = [  
  { value: "equals", label: "equals" , symbol:"="},
  { value: "not equal to", label: "not equal to" , symbol:"<>"},
  { value: "less than", label: "less than" , symbol:"<"},
  { value: "greater than", label: "greater than" , symbol:">"},
  { value: "greater or equal", label: "greater or equal" , symbol:">="},
  { value: "less or equal", label: "less or equal" , symbol:"<="},
  { value: "contains", label: "contains" , symbol:""},
  { value: "does not contains", label: "does not contains" , symbol:""},
  { value: "starts with", label: "starts with" , symbol:""}
]
// contact page starts here
export const selectFilterTypeOptions = [  
  { value: "Applicant", label: "Applicant" },
  { value: "Lead", label: "Lead" },
  { value: "Participant", label: "Participant" },
  { value: "Booker", label: "Booker" },
  { value: "Agent", label: "Agent" },
  { value: "Organisation", label: "Organisation" }
]

export const selectContactFilterOptions = [  
  { value: "ID", label: "ID", field:"contact_code"},
  { value: "Full Name", label: "Full Name", field:"fullname"},
  { value: "Type", label: "Type" , field:"type"},
  { value: "Status", label: "Status" , field:"status"},
  { value: "Created Date", label: "Created Date" , field:"created"},
  { value: "Created By", label: "Created By" , field:"created_by"}
]

export const selectFilterStatusoptions = [  
  { value: "Active", label: "Active" },
  { value: "In Active", label: "In Active" },
]

// contact page ends here