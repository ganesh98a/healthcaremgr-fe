export const orgActiveTitle = {
    inbox: "Inbox",
    draft: "Drafts",
    archive: "Archive",
    group_message: "Group Messages",
    house_overview: "House Details"
};

export const orgJson = [
    // {name: 'Dashboard', submenus: [], path: '/admin/organisation/dashboard'},

    {
        name: 'Organisations',
        submenus: [],
        path: '/admin/organisation/dashboard',
        id: 'org_dash',
    },
    {
        name: 'Pending Requests',
        submenus: [],
        path: '/admin/organisation/pending_request',
        id: 'pending_request',
    },
    {
        name: 'Sub-Orgs',
        submenus: [],
        linkOnlyHide: true,
        className: 'removeDropdown',
        id: 'sub_orgs',
        path: '#'
    },
    {
        name: 'sub-org',
        submenus: [
            {
                name: 'Org Details',
                path: '/admin/organisation/overview',
                id: 'suborg_details',
                pathstructure: '/admin/organisation/overview/:orgId/:subOrgId',
                subSubMenu: [
                    {name: 'About', path: '/admin/organisation/overview', pathstructure: '/admin/organisation/overview/:orgId/:subOrgId', type: 1},
                    {name: 'Contacts', path: '/admin/organisation/contacts', pathstructure: '/admin/organisation/contacts/:orgId/:subOrgId', type: 1},
                    {name: 'FMS', path: '/admin/organisation/fms', pathstructure: '/admin/organisation/fms/:orgId/:subOrgId', type: 1, moduelname: 'fms'}
                ],
                type: 1,
                closeMenus: false,
            },
            {
                name: 'Sites',
                subSubMenu: [],
                linkOnlyHide: false,
                path: '/admin/organisation/sites',
                pathstructure: '/admin/organisation/sites/:orgId/:subOrgId',
                type: 1,
            }
        ],
        linkShow: false,
        className: 'removeDropdown',
        id: 'suborg_details_menu',
        closeMenus: true,
        path: '#',
        type: 1,
    },
    {
        name: 'sub-org-house',
        submenus: [
            {
                name: 'About',
                path: '/admin/organisation/overview',
                id: 'suborg_details',
                pathstructure: '/admin/organisation/site_about/:houseid/:subOrgId',
                subSubMenu: [],
                type: 1,

            },
            {
                name: 'Contacts',
                path: '/admin/organisation/sites',
                pathstructure: '/admin/organisation/site_contact/:houseid/:subOrgId',
                subSubMenu: [],
                type: 1,
            },
            {
                name: 'Billing',
                subSubMenu: [],
                linkOnlyHide: false,
                path: '/admin/organisation/sites',
                pathstructure: '/admin/organisation/site_billing/:houseid/:subOrgId',
                type: 1,
            },
            {
                name: 'Docs',
                subSubMenu: [],
                linkOnlyHide: false,
                path: '/admin/organisation/sites',
                pathstructure: '/admin/organisation/site_docs/:houseid/:subOrgId',
                type: 1,
            },
            {
                name: 'FMS',
                subSubMenu: [],
                linkOnlyHide: false,
                path: '/admin/organisation/sites',
                pathstructure: '/admin/organisation/site_fms/:houseid/:subOrgId',
                type: 1,
            }
        ],
        linkShow: false,
        className: 'removeDropdown',
        id: 'suborg_house_menu',
        closeMenus: true,
        path: '#',
        type: 1,
    },
    {
        name: 'My Houses',
        submenus: [
            {
                name: 'All Houses', 
                path: '/admin/house/dashboard',
                pathstructure: '/admin/house/dashboard',
                linkShow: true,
                linkOnlyHide: false,
            },
           /*  {name: 'Participants', path: '#'},
            {name: 'Shifts', path: '#'},
            {name: 'Documentations', path: '#'},
            {name: 'Management', path: '#'}, */
        ],
        path: '/admin/house/dashboard',
        linkShow: true,
        linkOnlyHide: false
    },
    {
        name: 'house_details',
        path: '/admin/house/details',
        id: 'house_details',
        pathstructure: '/admin/house/details/:houseId',
        submenus: [
            { name: 'House Details', path: '/admin/house/details', pathstructure: '/admin/house/details/:houseId', type: 1 },
            { name: 'Contacts', path: '/admin/house/contact', pathstructure: '/admin/house/contact/:houseId', type: 1 },
            { name: 'Participants', path: '/admin/house/participant', pathstructure: '/admin/house/participant/:houseId', type: 1 },
            { name: 'Shifts', path: '/admin/house/shift', pathstructure: '/admin/house/shift/:houseId', type: 1, moduelname: 'fms' },
            { name: 'Documentation', path: '/admin/house/house_doc', pathstructure: '/admin/house/:type_doc/:houseId', 
            subSubMenu: [
                    { name: 'House Docs', linkShow: false, path: '/admin/house/house_doc', pathstructure: '/admin/house/house_doc/:houseId', type: 1, moduelname: 'fms' },
                    { name: 'Client Docs', linkShow: false, path: '/admin/house/client_doc', pathstructure: '/admin/house/client_doc/:houseId', type: 1, moduelname: 'fms' }
                ], 
                type: 1, moduelname: 'fms' },
            { name: 'Management', path: '/admin/house/management', pathstructure: '/admin/house/management/:houseId', type: 1, moduelname: 'Billing' }
        ],
        linkOnlyHide: true,
        className: 'removeDropdown',
        id: 'house_details',
        path: '#'
    },
];

export const OrgWillAdded = [
    {
        name: 'Org Details',
        path: '/admin/organisation/overview',
        id: 'org_details',
        pathstructure: '/admin/organisation/overview/:orgId',
        subSubMenu: [
            { name: 'About', path: '/admin/organisation/overview', pathstructure: '/admin/organisation/overview/:orgId', type: 1 },
            { name: 'Contacts', path: '/admin/organisation/contacts', pathstructure: '/admin/organisation/contacts/:orgId', type: 1 },
            { name: 'FMS', path: '/admin/organisation/fms', pathstructure: '/admin/organisation/fms/:orgId', type: 1, moduelname: 'fms' },
            { name: 'Billing', path: '/admin/organisation/billing', pathstructure: '/admin/organisation/billing/:orgId', type: 1, moduelname: 'Billing' }
        ],
        type: 1,
        closeMenus: false,
    },
    {
        name: 'Sub-Orgs',
        submenus: [],
        linkOnlyHide: false,
        className: 'removeDropdown',
        path: '/admin/organisation/suborg/',
        pathstructure: '/admin/organisation/suborg/:orgId',
        type: 1,
    },
    {
        name: 'Sites',
        subSubMenu: [],
        linkOnlyHide: false,
        path: '/admin/organisation/sites',
        pathstructure: '/admin/organisation/sites/:orgId',
        type: 1,
    }
]





