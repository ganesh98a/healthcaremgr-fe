export const homeMenusJson = {

    label: 'Admin',
    menus:[
        {
            name: 'Home',
            id:'home',
            path: '/admin/dashboard'
        },
    ]
};

export const adminMenusJson = {
    label: 'Admin',
    menus:[
        {
            name: 'Logs',
            id: 'log',
            submenus: [],
            path: '/admin/user/logs'
        },
        {
            name: 'User Management',
            id: 'user_management',
            path: '/admin/user/list',
            path2: '/admin/user/details/',
            submenus: [],
        },
        {
            name: 'Module Management',
            id: 'modules',
            submenus: [],
            path: '/admin/user/module_management',
        },
        {
            name: 'Role',
            id: 'modules',
            submenus: [],
            path: '/admin/user/access_roles',
        },
        {
            name: 'Data Import',
            id: 'modules',
            submenus: [],
            path: '/admin/user/data_import',
        },
        {
            name: 'Settings',
            id: 'modules',
            submenus: [],
            path: '/admin/user/settings',
        },
        {
            name: 'API Settings',
            id: 'modules',
            submenus: [],
            path: '/admin/settings/api',
        },
        {
            name: 'Reference Data',
            id: 'reference_data',
            submenus: [],
            path: '/admin/item/reference_data',
            path2: '/admin/item/create_reference_data'
        },
        {
            name: 'Holiday Management',
            id: 'holidays',
            submenus: [],
            path: '/admin/user/holidays',
        },
        {
            name: 'Business Unit Management',
            id: 'bum',
            submenus: [],
            path: '/admin/user/business_unit_management',
        },
    ]
};

export const salesMenusJson = {
    label: 'Intake',
    menus:[
        {
            name: 'Leads',
            id:'leads',
            submenus: [],
            path: '/admin/crm/leads',
            path2: '/admin/crm/leads/'
        },
        {
            name: 'Opportunities',
            id:'opportunities',
            submenus: [],
            path: '/admin/crm/opportunity/listing',
            path2: '/admin/crm/opportunity/'
        },
        {
            name: 'Needs Assessments',
            id:'needs_assessments',
            submenus: [],
            path: '/admin/crm/needassessment/listing',
            path2: '/admin/crm/needassessment/'
        },
        {
            name: 'Risk Assessments',
            id:'risk_assessments',
            submenus: [],
            path: '/admin/crm/riskassessment/listing',
            path2: '/admin/crm/riskassessment/details/'
        },
        {
            name: 'Service Agreements',
            id:'service_agreements',
            submenus: [],
            path: '/admin/crm/serviceagreements',
            path2: '/admin/crm/serviceagreements/',
            path3: '/admin/item/serviceagreement/'
        },
        {
            name: 'Tasks',
            id:'tasks',
            submenus: [],
            path: '/admin/crm/task/listing',
            path2: '/admin/crm/task/details/'
        },
    ],
};

export const recruitMenusJson = {
    label:"Recruitment",
    menus:[
        {
            name: 'Dashboard',
            id:'applications',
            submenus: [],
            path: '/admin/recruitment/applications',
            path2: '/admin/recruitment/application_',
            path3: '/admin/recruitment/oa_answers_',
        },
        {
            name: 'Applicants',
            id:'applicants',
            submenus: [],
            path: '/admin/recruitment/applicants',
            path2: '/admin/recruitment/applicant/'
        },
        {
            name: 'Group Booking',
            id:'interview',
            submenus: [],
            path: '/admin/recruitment/interview',
            path2: '/admin/recruitment/interview_details/'
        },
        {
            name: 'Jobs',
            id:'jobs',
            submenus: [],
            path: '/admin/recruitment/job_opening/jobs',
            path2: '/admin/recruitment/applications/',
            path3: '/admin/recruitment/job_opening/'
        },
        {
            name: 'Forms',
            id:'forms',
            submenus: [],
            path: '/admin/recruitment/jobs/forms'
        },
        {
            name: 'Questions',
            id:'questions',
            submenus: [],
            path: '/admin/recruitment/question_list'
        },
        {
            name: 'OA Templates',
            id:'oa_template',
            submenus: [],
            path: '/admin/recruitment/oa_template',
            path2: '/admin/recruitment/oa_template/create',
            path3: '/admin/recruitment/oa_template/update/:id'
        },
        {
            name: 'Communication Logs',
            id:'communications_logs ',
            submenus: [],
            path: '/admin/recruitment/communications_logs'
        },
        {
            name: 'Flagged Applicants',
            id:'applicants',
            submenus: [],
            path: '/admin/recruitment/dashboard/flagged_applicants'
        },
        // {
        //     name: 'Staff Members',
        //     id:'staff_members',
        //     submenus: [],
        //     path: '/admin/recruitment/user_management',
        //     path2: '/admin/recruitment/staff_details/'
        // },
        // {
        //     name: 'Round Robin Management',
        //     id:'round_robin_management ',
        //     submenus: [],
        //     path: '/admin/recruitment/user_management/roundrobin_management'
        // }
    ]
};
export const imailMenusJson =
    {
        label: 'Imail',
        menus:[
        {
            name: 'Inbox',
            id:'inbox',
            path: '/admin/imail/external/inbox',
            path2: '/admin/imail/external/inbox/'
        },
        {
            name: 'Sent',
            id:'sent',
            submenus: [],
            path: '/admin/imail/external/sent',
            path2: '/admin/imail/external/sent/'
        },
        {
            name: 'Drafts',
            id:'drafts',
            submenus: [],
            path: '/admin/imail/external/draft',
            path2: '/admin/imail/external/draft/'
        },
        {
            name: 'Archived',
            id:'archived',
            submenus: [],
            path: '/admin/imail/external/archive',
            path2: '/admin/imail/external/archive/',

        },
        {
            name: 'Out Of Office',
            id:'outofoffice',
            submenus: [],
            path: '/admin/imail/office_messages'
        },
        {
            name: 'Listing',
            id:'listing',
            submenus: [],
            path: '/admin/imail/templates/listing',
            path2:'/admin/imail/templates/'
        },
        {
            name: 'Automatic Emails',
            id:'automatic_emails',
            submenus: [],
            path: '/admin/imail/automatic_emails/listing'
        },
    ]
};

/**
 * Item menu Json
 * - Label
 * - Menus
 */
export const itemMenuJson = {
    label:"Items",
    menus:[
        {
            group_by: 'item',
            name: 'Documents',
            label: 'Documents',
            id:'document',
            path: '/admin/item/document',
            path2:'/admin/item/document/details/',
            on_close: true,
            submenus:[]
        },
        {
            group_by: 'item',
            name: 'Role',
            label: 'Role',
            id:'role',
            path: '/admin/item/role',
            path2: '/admin/item/role/details/',
            on_close: true,
            submenus:[],
        },
        {
            group_by: 'item',
            name: 'Participants',
            label: 'Participants',
            id:'participant',
            path: '/admin/item/participant',
            path2: '/admin/item/participant/details/',
            on_close: true,
            submenus:[],
        },
        {
            group_by: 'item',
            name: 'Organisation',
            label: 'Organisation',
            id:'organisation',
            path: '/admin/crm/organisation/listing',
            path2: '/admin/crm/organisation/details/',
            on_close: true,
            submenus:[],
        },
        {
            group_by: 'item',
            name: 'Goals',
            label: 'Goals',
            id:'goals',
            path: '/admin/item/goals',
            path2: '/admin/item/goals/details/',
            on_close: true,
            submenus:[],
        },
        {
            group_by: 'item',
            name: 'Reference Data',
            label: 'Reference Data',
            id: 'reference_data',
            path: '/admin/item/reference_data',
            path2: '/admin/item/create_reference_data',
            on_close: true,
            submenus: []
        },
        {
            group_by: 'item',
            name: 'Email Templates',
            label: 'Email Templates',
            id: 'email_templates',
            path: '/admin/item/email_templates',
            on_close: true,
            submenus: []
        },
        {
            group_by: 'item',
            name: 'SMS Templates',
            label: 'SMS Templates',
            id: 'sms_templates',
            path: '/admin/item/sms_templates',
            on_close: true,
            submenus: []
        },
        {
            group_by: 'item',
            name: 'Contact',
            label: 'Contact',
            id: 'contact',
            path: '/admin/crm/contact/listing',
            path2: '/admin/crm/contact/details/',
            on_close: true,
            submenus: []
        }
    ]
};


/**
 * Finance Menu Json
 * Label
 * Menus
 */
export const financeMenusJson =
    {
        label: 'Finance',
        menus:[
        {
            name: "Timesheets",
            id: "timesheets",
            submenus: [],
            path: "/admin/finance/timesheets",
            path2:'/admin/finance/timesheet/details/'
        },       
        {
            name: "Pay Rates",
            id: "payrates_menu",
            submenus: [],
            path: "/admin/finance/payrates"
        },
        {
            name: 'Invoices',
            id:'invoice',
            path: '/admin/finance/invoices',
            path2: '/admin/finance/invoice/details/'
        },
        {
            name: "Charge Rates",
            id:"chargerates_menu",
            submenus: [],
            path: "/admin/finance/chargerates"
        },
        {
            name: "Support Items",
            id:"line_item_pricing_menu",
            path: "/admin/finance/line_item_listing",
            path2: '/admin/finance/line_item/'
        },
        {
            name: "NDIS Support Item Errors",
            id: "ndiserror_list",
            submenus: [],
            path: "/admin/finance/ndiserror_list"            
        }
    ],
};
/**
 * Participants Menu Json
 * Label
 * Menus
 */
export const participaintmenuJson =
{
    label: 'Participant',
}
/**
 * Schdedule Menu Json
 * Label
 * Menus
 */
export const schedulemenuJson =
{
    label: 'Schedule',
    menus:[
    {
        name: 'Shifts',
        id:'shifts',
        path: "/admin/schedule/list",
        path2: "/admin/schedule/details",
    },
    // {
    //     name: 'Unfilled',
    //     path: '/admin/schedule/unfilled/unfilled' },
    // {
    //     name: 'Unfilled On App',
    //     path: '/admin/schedule/unfilled/app' },
    {
        name: 'Rosters',
        id:'rosters',
        path: '/admin/schedule/roster/list',
        path2: '/admin/schedule/roster/'
    },
    {
        name: 'Support Workers',
        id:'members',
        path: '/admin/support_worker/list',
        path2: '/admin/support_worker/details/'
    },
    {
        name: 'Participants',
        id:'participants',
        path: '/admin/item/participant',
        path2:'/admin/item/participant/details/'
    },
    {
        name: 'Organisation',
        submenus: [],
        path: '/admin/crm/organisation/listing',
        path2: '/admin/crm/organisation/details/',
        id: 'organisation',
    }
    // {
    //     name: 'Unconfirmed Shift',
    //     path: '/admin/schedule/unconfirmed/unconfirmed'
    // },
    // {
    //     name: 'Quoted Shift',
    //     path: '/admin/schedule/unconfirmed/quoted'
    // },
    // {
    //     name: 'Cancelled Shift',
    //     path: '/admin/schedule/rejected_cancelled/cancelled'
    // },
    // {
    //     name: 'Filled',id:'filled', path: '/admin/schedule/filled'
    // },
    // {
    //     name: 'Completed',id:'completed',
    //     path: '/admin/schedule/completed',
    // },
    // {
    //     name: 'New Request',
    //     id:'new_request',
    //     path: '/admin/schedule/new_request'
    // },
    // {
    //     name: 'Active Roster ',
    //     path: '/admin/schedule/active_roster',
    //     id:"active_roster"
    // },
    // {
    //     name: 'Archived (Duplicate)',
    //     id:"archived_roster",
    //     path: '/admin/schedule/archived_roster'
    // }
    ]
}
/**
 * FMS Menu Json
 * Label
 * Menus
 */
export const fmsmenuJson =
{
    label: 'FMS',
    menus:[
        {
            name: 'Feedback',
            id:'feedback',
            path: '/admin/fms/dashboard/new/cases',
            path2: '/admin/fms/feedback/details/'
        },
        {
            name: 'Incidents',
            id:'incidents',
            path: '/admin/fms/dashboard/incidents/incident_completed',
        }
    ]
}

/**
 * Members Menu Json
 * Label
 * Menus
 */
export const membersmenuJson =
{
    label: 'Support Workers',
    menus:[
        {
            name: 'Support Workers',
            id:'members',
            path: '/admin/support_worker/list',
            path2: '/admin/support_worker/details/'
        },
        {
            name: 'Roles',
            id:'roles',
            path: '/admin/item/role',
            path2: '/admin/item/role/details/'
        },
        {
            name: 'Participants',
            id:'participants',
            path: '/admin/item/participant',
            path2: '/admin/item/participant/details/'
        }
    ]
}
export const orgmenuJson =
{
    label: 'Organisation',
    menus:[
        {
            name: 'Home',
            submenus: [],
            path: '/admin/crm/organisation/listing',
            id: 'organisation',
        }
    ]
}

export const helmenuJson =
{
    label: 'Help',
    menus:[
        {
            name: 'Home',
            submenus: [],
            path: '/admin/dashboard',
            id: 'home',
        },
        {
            name: 'Help',
            id:'help',
            path: '/admin/help/dashboard'
        }
    ]
}


