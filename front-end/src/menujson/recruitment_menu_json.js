export const recruitmentActiveTitle = {
    dashboard: 'Dashboard',
    usermanagment: 'User Management',
    taskschdule: 'Schedules',
    tasklisting: 'Tasks',
    createjob: 'Create New Job',
    editjob: 'Edit Job',
    duplicatejob: 'Duplicate Job',
    jobopening: 'Job Openings',
    applicants: 'Applicants',
    group_question_list: 'Group Interview Questions',
    cabday_question_list: 'CAB Day Questions',
    phone_interview_list: 'Questions List',
    ipad: 'Training',
    cabday: 'CAB Day',
    applicantinfo: 'Applicants - Applicant Info',
    MyComponents: 'My Components',
    staff_details: 'User Management - Staff Details',
    flagged_applicants: 'Flagged Applicants',
    // duplicate_applicants: 'Duplicate Applicants',
    PayRateApproval: 'Pay Scale Approvals',
    manage_group_interview: 'Manage Group Interview',
    cabday_interview: 'Manage CAB Day',
    group_interview_result: 'Applicants - Group Interview Results',
    cabday_interview_result: 'Applicants - CAB Day Interview Results',
    device_list: 'Devices',
    manage_devices_list: 'Manage Devices',
    communication_logs: 'Communication Logs',
    job_categories: 'Job Categories',
    email_setup: 'Email Setup',
    seek_api_integration: 'Seek API Integration',
    reference_data_list_title:'Reference Data Management',
    create_reference_data_title:'Create Reference Data',
    oa_details:'OnlineAssessment Template',
    oa_answers:'OnlineAssessment Answers'
};

export const recruitmentHideShowSubmenusPermissionBase = {
    "recruiter_managment_menu": {
        'hideLink': true,
        'submenu': {
            'recruiter_managment_recruiter_menu': { 'hideLink': true },
            // 'recruiter_managment_department_menu':{'hideLink':true},
            'recruiter_managment_round_robin_menu': { 'hideLink': true }
        }
    },
    "dashboard_menu": {
        "hideLink": false,
        "submenu": {
            "dashboard_duplicate_applicants_menu": { 'hideLink': true },
            "dashboard_flag_applicants_menu": { 'hideLink': true },
            "dashboard_pay_approval_menu": { 'hideLink': true }
        }
    }

    /* 'training_menu':{ 
        'hideLink':true,
        'submenu':{
            'training_group_interview_menu' :{
                'hideLink':true,
                'submenu': {
                    'training_group_interview_question_list_menu':{'hideLink':true},
                    'training_group_interview_manage_group_interview_menu':{'hideLink':true}
                }
            },
        }
    } */
};

export const recruitmentHideShowSubmenus = {
    "applicants_menu": {
        'hideLink': false,
        'submenu': {
            'applicant_info_menu': {
                'hideLink': true,
                'page_type_show': 'applicantinfo'
            },
        }
    }
};



export const recruitmentJson = [    
    { name: 'Schedules', submenus: [{ name: 'Task Schedules', path: '/admin/recruitment/action/schedule' }, { name: 'Tasks List', path: '/admin/recruitment/action/task' }], },
    { 
        name: 'Jobs',
        path: '/admin/recruitment/job_opening/jobs',
        submenus: [
            {
                name: 'Forms',
                title: 'Interview forms',
                path: '/admin/recruitment/jobs/forms'
            },
            { name: 'Question List', path: '/admin/recruitment/question_list' }
        ],
    },
    // { name: 'Applicants', submenus: [], path: '/admin/recruitment/applicants' },
    { 
        name: 'Applicants', 
        id:'applicants_menu',
        submenus: [
            { name: 'Applications List', path: '/admin/recruitment/applications' },
            { name: 'Applicant List', path: '/admin/recruitment/applicants' },
            { name: 'Applicant info', path: '/admin/recruitment/applicant/0', pathstructure: "/admin/recruitment/applicant/:id", linkOnlyHide: true, type: 1, id: "applicant_info_menu", },
        ]
    },
    {
        name: 'Training',
        id: 'training_menu',
        linkShow: true,
        submenus: [
            {
                name: 'Group Interview',
                id: 'training_group_interview_menu',
                //path: '/admin/recruitment/group_interview',
                linkOnlyHide: false,
                subSubMenu: [
                    { name: 'Manage Group Interview', path: '/admin/recruitment/group_interview/manage_group_interview', linkOnlyHide: false, id: 'training_group_interview_manage_group_interview_menu' },
                    // { name: 'Question List', path: '/admin/recruitment/question_list/group_interview', linkOnlyHide: false, id: 'training_group_interview_question_list_menu' }
                ]
            },
            {
                name: 'CAB Day',
                //path: '/admin/recruitment/manage_cab_day',
                subSubMenu: [
                    { name: 'Manage CAB Day', path: '/admin/recruitment/manage_cab_day' },
                    // { name: 'Question List', path: '/admin/recruitment/question_list/cab_day' }
                ]
            },
            /* { 
                 name: 'Devices', 
                 //path: '/admin/recruitment/training/cab_day',
                 subSubMenu: [
                     {name:'Devices List', path:'/admin/recruitment/device_list'},
                     {name:'Manage Devices', path:'/admin/recruitment/manage_devices_list'}
                 ]
             }, 
             { 
                 name: 'Ipad', 
                 path: '/admin/recruitment/training/ipad' 
             }*/
        ]
    },
    {
        name: 'User Management',
        id: 'recruiter_managment_menu',
        submenus: [
            // { name: 'Staff Members', path: '/admin/recruitment/user_management', linkOnlyHide: false, id: 'recruiter_managment_recruiter_menu' },
            //            { name: 'Department', path: '#',linkOnlyHide: false,id:'recruiter_managment_department_menu' },
        ],
        linkShow: true
    },
    {
        name: 'Communication Logs',
        id: 'communication_logs',
        path: '/admin/recruitment/communications_logs',
        linkShow: true
    },
    {
        name: 'Reference Data',
        id: 'reference_data',
        path: '/admin/item/reference_data',
        linkShow: true
    },
    // { 
    //     name: 'Wizard', 
    //     id:'recruiter_managment_menu',
    //     submenus: [
    //         { name: 'Job Categories', path: '/admin/recruitment/wizard/job_categories',linkOnlyHide: false,id:'recruiter_job_categories__menu' }, 
    //         { name: 'Email Setup', path: '/admin/recruitment/wizard/email_setup',linkOnlyHide: false,id:'recruiter_email_setup_menu' },
    //         { name: 'Seek API Integration', path: '/admin/recruitment/wizard/seek_api_integration',linkOnlyHide: false,id:'recruiter_seek_api_integration_menu'}
    //     ],
    //     linkShow:true 
    // },

];