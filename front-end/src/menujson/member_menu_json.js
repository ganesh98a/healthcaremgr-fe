export const memberActiveTitle = {
    details: "Details",
    availability: "Availability",
    preferences: "Preferences",
    current_docs: "Current Qualifications",
    qual_docs: "Qualifications Documents",
    current_work_area: "Current Work Areas",
    award_level: "Position/Award Level",
    special_agreement: "Special Agreements",
    fms: "FMS",
    upcoming_shift: "Upcoming Shifts",
    completed_shift: "Completed Shifts",
    cancelled_shift: "Cancelled Shifts",
    rejected_shift: "Rejected Shifts",
    contact_history: "Contact History",
    overview: "Overview",
    bonus_training: "Overview",
    member_feedback: "Member Feedback",
    member_payslip: "Payslips",
    Upload_Payslip:"Upload New Payslip",
};

export const memberJson = [
    { name: 'Dashboard', id: "member_dashboard", submenus: [], path: '/admin/support_worker/list' },
    {
        name: "name",
        pathstructure: "/admin/support_worker/about/:id/details",
        type: 1,
        path: "/admin/support_worker/about/",
        linkShow: false,
        id: "member_name",
        className: "active"
    },
    {
        name: 'Member Details',
        id: "member_details",
        linkShow: false,
        submenus: [
            {
                name: 'About', path: '#', subSubMenu:
                    [
                        { name: 'Details', path: '#', pathstructure: "/admin/support_worker/about/:id/details", type: 1 },
                        { name: 'Availability', path: '#', pathstructure: "/admin/support_worker/about/:id/availability", type: 1 },
                        { name: 'Preferences', path: '#', pathstructure: "/admin/support_worker/about/:id/preferences", type: 1 },
                    ]
            },

            {
                name: 'Qualifications', path: '#', subSubMenu:
                    [
                        { name: 'Current Qualifications', path: '#', pathstructure: "/admin/support_worker/quals/:id/current_docs", type: 1 },
                        { name: 'Qualifications Documents', path: '#', pathstructure: "/admin/support_worker/quals/:id/qual_docs", type: 1 },
                    ]
            },

            {
                name: 'Work Areas', path: '#', subSubMenu:
                    [
                        { name: 'Current Work Areas', path: '#', pathstructure: "/admin/support_worker/work_area/:id/current_work_area", type: 1 },
                        { name: 'Position/Award Level', path: '#', pathstructure: "/admin/support_worker/work_area/:id/award_level", type: 1 },
                        { name: 'Special Agreements', path: '#', pathstructure: "/admin/support_worker/work_area/:id/special_agreement", type: 1 }
                    ]
            },
            // { name: 'Payslips', subSubMenu: [], path: '#', pathstructure: "/admin/member/payslip/:id", type: 1},
            { name: 'FMS', subSubMenu: [], path: '#', pathstructure: "/admin/support_worker/fms/:id", type: 1, moduelname: "fms" },
            // { name: 'Member Feedback', subSubMenu: [], path: '#', pathstructure: "/admin/member/member_feedback/:id", type: 1},
            // { name: 'Upload New Payslip', subSubMenu: [], path: '#', pathstructure: "/admin/member/Upload_Payslips/:id", type: 1},
        ]
    },

    {
        name: 'Shift & Rosters',
        id: "member_shift_rosters",
        linkShow: false,
        submenus: [
            {
                name: 'Shift', path: '#', subSubMenu:
                    [
                        { name: 'Overview', path: '#', pathstructure: "/admin/support_worker/overview/:id", type: 1 },
                        { name: 'Upcoming Shifts', path: '#', pathstructure: "/admin/support_worker/shifts/:id/upcoming_shift", type: 1 },
                        { name: 'Complete Shifts', path: '#', pathstructure: "/admin/support_worker/shifts/:id/completed_shift", type: 1 },
                        { name: 'Rejected Shifts', path: '#', pathstructure: "/admin/support_worker/shifts/:id/rejected_shift", type: 1 },
                        { name: 'Cancelled Shifts', path: '#', pathstructure: "/admin/support_worker/shifts/:id/cancelled_shift", type: 1 },
                    ]
            },
            { name: 'Contact History', path: '#', pathstructure: "/admin/support_worker/contact_history/:id", type: 1 },
            
        ]
    } ,
    {
        name: 'Bonus Training',
        type: 1,
        id: "bonus_training",
        linkShow: true,
        pathstructure: '/admin/support_worker/bonus_training/:id',
        moduelname: "bonus_training"
    }
 

];
