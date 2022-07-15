export const imailActiveTitle = {
    inbox: "Inbox",
    draft: "Drafts",
    archive: "Archive",
    group_message: "Group Messages"
};

export const imailJson = [
    {
        name: 'Dashboard',
        id: 'imail_dashboard',
        submenus: [],
        className: 'removeDropdown',
        path: '/admin/imail/dashboard'
    },
    {
        name: 'External Imail',
        id: 'external_iMail',
        submenus: [
            {name: 'Inbox', path: '/admin/imail/external/inbox'},
            {name: 'Sent', path: '/admin/imail/external/sent'},
            {name: 'Drafts', path: '/admin/imail/external/draft'},
            {name: 'Archived', path: '/admin/imail/external/archive'},
        ]
    },
    {
        name: 'Internal Imail',
        id: 'internal_iMail',
        submenus: [
            {name: 'Inbox', path: "/admin/imail/internal/inbox"},
            {name: 'Sent', path: "/admin/imail/internal/sent"},
            {name: 'Drafts', path: "/admin/imail/internal/draft"},
            {name: 'Group Messages', path: "/admin/imail/internal/group_message"},
            {name: 'Archived', path: "/admin/imail/internal/archive"},
        ],

    },
    {name: 'Out Of Office', path: '/admin/imail/office_messages'},
    {
        name: 'Templates',
        id: 'templates',
        submenus: [
            {
                name: 'Listing', 
                path: "/admin/imail/templates/listing"
            },
            {
                name: 'Automatic Emails', 
                path: "/admin/imail/automatic_emails/listing"
            }
        ]
    }
];
  