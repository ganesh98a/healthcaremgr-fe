
/**
 * @typedef {keyof crmActiveTitle} CrmActiveTitleKey
 */


export const crmActiveTitle = {
  crm_admin_dashboard: 'Participant Intake Dashboard',
  crm_user_dashboard: 'Participant Intake Dashboard',
  prospective_participants: 'Prospective Participants',
  rejected_participants: 'Rejected Participants',
  participant_details: 'Participant Details',
  participant_ability: 'Participant Ability',
  participant_shift: 'Shift',
  participant_funding_details: 'Funding Details',
  report_onbording_analytics: 'Onboarding Analytics',
  report_service_analytics: 'Service Analytics',
  report_location_analytics: 'Location Analytics',
  schedule_user_schedule: 'User Schedules',
  schedule_user_task: 'User Tasks',
  user_staff_members: 'Participant Intake User Management ',
  user_staff_members_details: 'User Management - Staff Details',
  user_departments: 'Departments',
  prospective_participant_funding: 'Funding Details',
  service_agreement_doc: 'Service Agreement Doc',
  sales_lead_create: 'New Lead',
  sales_lead_edit: 'Edit Lead',
  sales_leads: 'Leads',
  sales_contacts: 'Contacts',
  risk_assessments:'Risk Assessments',
  service_agreements:'Service Agreements',
};

export const crmLinkHideShowSubmenus = {
  "crm_user": {
    'staff_member': 'staff_member_id'
  }
};


export const crmJson = [
        {
          name: 'CRM', submenus:
          [
            { name: 'Contact', path: '/admin/crm/contact/listing' },
            { name: 'Organisation', path: '/admin/crm/organisation/listing' },
            { name: 'Tasks', path: '/admin/crm/task/listing' },
          ],
          id:'crm'
        },
        {
          name: 'Sales', submenus:
          [
            { name: 'Leads', path: '/admin/crm/leads' },
            { name: 'Opportunities', path: '/admin/crm/opportunity/listing' },
            { name: 'Need Assessments', path: '/admin/crm/needassessment/listing' },
            { name: 'Risk Assessments', path: '/admin/crm/riskassessment/listing' },
            { name: 'Service Agreements', path: '/admin/crm/serviceagreements' },
          ],
          id:'sales'
        },
        /* { name: 'Dashboard', submenus: [], path: '/admin/crm/participantadmin',id:'crm_admin_dashboard' },
        { name: 'Dashboard', submenus: [], path: '/admin/crm/participantuser',id:'crm_user_dashboard' },
        { name: 'Prospective Participants', submenus: [], path: '/admin/crm/prospectiveparticipants',id:'crm_prospective_participant' },
        {
          name: 'John Smith', submenus:
            [
              { name: 'Participant Details', path: '/admin/crm/participantdetails/', pathstructure:'/admin/crm/participantdetails/:id',type:1 },
              { name: 'Participant Ability', path: '/admin/crm/participantability/', pathstructure:'/admin/crm/participantability/:id',type:1 },
              { name: 'Shift', path: '/admin/crm/shifts/', pathstructure:'/admin/crm/shifts/:id',type:1 },
              { name: 'Funding Details', path: '/admin/crm/fundingdetails/' , pathstructure:'/admin/crm/fundingdetails/:id',type:1},
            ],
            linkShow:false,
            id:'crm_participant_details',
            className:'active'
        },
        { name: 'Rejected Participants', submenus: [], path: '/admin/crm/rejectedparticipants',id:'crm_prospective_participant' },
        {
          name: 'John Smith', submenus:
            [
              { name: 'Participant Details', path: '/admin/crm/participantdetails/', pathstructure:'/admin/crm/participantdetails/:id',type:1 },
              { name: 'Participant Ability', path: '/admin/crm/participantability/', pathstructure:'/admin/crm/participantability/:id',type:1 },
              { name: 'Shift', path: '/admin/crm/shifts/', pathstructure:'/admin/crm/shifts/:id',type:1 },
              { name: 'Funding Details', path: '/admin/crm/fundingdetails/' , pathstructure:'/admin/crm/fundingdetails/:id',type:1},
            ],
            linkShow:false,
            id:'crm_participant_details1',
            className:'active'
        },

  {
    name: 'Reporting', submenus:
      [
        { name: 'Onboarding Analytics', path: '/admin/crm/reporting' },
        { name: 'Service Analytics', path: '/admin/crm/ServiceAnalytics' },
        { name: 'Location Analytics', path: '/admin/crm/locationanalytics' },
      ],
    id: 'crm_reports'
  },

  {
    name: 'Schedules', submenus:
      [
        { name: 'User Schedules', path: '/admin/crm/schedules' },
        { name: 'User Tasks', path: '/admin/crm/tasks' },
      ],
    id: 'crm_schedules'
  }, */
  {
    name: 'User Management', submenus:
      [
        // {
        //   name: 'Staff Members', path: '/admin/crm/usermangement', id: 'staff_member',
        //   subSubMenu:
        //     [
        //       { name: 'Staff Details', path: '/admin/crm/StaffDetails/', pathstructure: '/admin/crm/StaffDetails/:staffId', type: 1, 'linkOnlyHide': true, id: 'staff_member_id' },
        //     ]
        // },
        // { name: 'Departments', path: '/admin/crm/departments' },
      ],
    id: 'crm_user'
  },
  // {
  //   name: 'Service Agreement Document',
  //   submenus: [],
  //   path: '/admin/crm/service_agreement_doc',
  //   id:'service_agreement_doc'
  // },

];
