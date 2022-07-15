export const scheduleActiveTitle = {
    unfilled:'Unfilled',
    app:'Unfilled on App',
    unconfirmed:'Unconfirmed',
    quoted:'Quoted',
    rejected:'Rejected',
    cancelled:'Cancelled',
    filled:'Filled',
    completed:'Completed',
    new_request:'New Request',
    active_roster:'Active Roster',
    archived_roster:'Archived (Duplicate)',
    schedule_details:'Shift Details',
    roster_details:'Roster Details'
};

export const scheduleLinkHideShowSubmenus = {"shift":{
    'unfilled':'shift_id_unfilled',
    'unconfirmed':'shift_id_unconfirmed',
    'rejected':'shift_id_rejected',
    'filled':'shift_id_filled'},
    "roster":{
        "active_roster":"roster_id_active",
        "new_roster":"roster_id_new",
        "archived_roster":"roster_id_archived"
    }
};

export const scheduleJson = [
                {
                    name: 'Shifts',
                    id:'shift',
                    submenus: [
                        {
                            name: 'Unfilled',id:'unfilled', path: '#', subSubMenu:
                                [
                                    { name: 'Unfilled', path: '/admin/schedule/unfilled/unfilled' },
                                    { name: 'Unfilled On App', path: '/admin/schedule/unfilled/app' },
                                    { name: 'Shift Id- 50', path: '/admin/schedule/details/',pathstructure:'/admin/schedule/details/:id',type:1 ,'linkOnlyHide':true,id:'shift_id_unfilled' },
                                ]
                        },

                        {
                            name: 'Unconfirmed',id:'unconfirmed', path: '#', subSubMenu:
                                [
                                    { name: 'Unconfirmed Shift', path: '/admin/schedule/unconfirmed/unconfirmed' },
                                    { name: 'Quoted Shift', path: '/admin/schedule/unconfirmed/quoted' },
                                    { name: 'Shift Id- 50', path: '/admin/schedule/details/',pathstructure:'/admin/schedule/details/:id',type:1 ,'linkOnlyHide':true,id:'shift_id_unconfirmed' },
                                ]
                        },
                        {
//                            name: 'Rejected & Cancelled',id:'rejected', path: '#', subSubMenu:
                            name: 'Cancelled',id:'rejected', path: '#', subSubMenu:
                                [
//                                    { name: 'Rejected Shift', path: '/admin/schedule/rejected_cancelled/rejected' },
                                    { name: 'Cancelled Shift', path: '/admin/schedule/rejected_cancelled/cancelled' },
                                    { name: 'Shift Id- 50', path: '/admin/schedule/details/',pathstructure:'/admin/schedule/details/:id',type:1 ,'linkOnlyHide':true,id:'shift_id_rejected'},
                                ]
                        },
                        { name: 'Filled',id:'filled', path: '/admin/schedule/filled',subSubMenu:
                        [
                            //{ name: 'Filled', path: '/admin/schedule/filled' },
                            { name: 'Shift Id- 50', path: '/admin/schedule/details/',pathstructure:'/admin/schedule/details/:id',type:1 ,'linkOnlyHide':true,id:'shift_id_filled'},
                        ] },

                        { name: 'Completed',id:'completed', path: '/admin/schedule/completed', },

                    ]
                },

                {
                    name: 'Rosters',id:'roster', submenus:
                        [
                            { name: 'New Request',id:"new_roster", path: '/admin/schedule/new_request',subSubMenu:
                            [
                                { name: 'Shift Id- 50', path: '/admin/schedule/roster_details/', pathstructure:'/admin/schedule/roster_details/:rosterId',type:1,'linkOnlyHide':true,id:'roster_id_new'},
                            ] },
                            {
                                name: 'Active Roster ', path: '/admin/schedule/active_roster',id:"active_roster", subSubMenu:
                                    [
                                        { name: 'Shift Id- 50', path: '/admin/schedule/roster_details/', pathstructure:'/admin/schedule/roster_details/:rosterId',type:1,'linkOnlyHide':true,id:'roster_id_active'},
                                    ]
                            },
                            
                            { name: 'Archived (Duplicate)',id:"archived_roster", path: '/admin/schedule/archived_roster',subSubMenu:
                            [
                                { name: 'Shift Id- 50', path: '/admin/schedule/roster_details/', pathstructure:'/admin/schedule/roster_details/:rosterId',type:1,'linkOnlyHide':true,id:'roster_id_archived'},
                            ] },
                        ]
                },

                /*{
                    name: 'Analysis',
                    submenus: [
                        {
                            name: 'Plan(s)', path: '#', subSubMenu:
                                [
                                    { name: 'Booking Tracker', path: '#' },
                                    { name: 'Financial Tracker', path: '#' },
                                    { name: 'Cancellation Tracker', path: '#' },
                                ]
                        },
                    ],
                },*/

            ];