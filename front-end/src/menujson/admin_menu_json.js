export const adminActiveTitle = {
    single_approval: 'Approval',
    single_user_management: 'User Managment',
    user_management: 'User Managments',
    log: 'Logs',
    report: 'Report'
};

export const adminJson = [
//    { name: 'Reports', id: 'report', submenus: [], path: '/admin/user/reports' },
    { name: 'Logs', id: 'log', submenus: [], path: '/admin/user/logs' },
    { name: 'User Management', id: 'user_management', submenus: [{ id: 'user_management_id', name: 'Onbording Analytics', pathstructure: '/admin/user/update/:AdminId', path: '/admin/user/update/:AdminId', className: '', 'linkOnlyHide': false, type: 1 }], path: '/admin/user/list', className: 'removeDropdown' },
   {
       name: 'Module Management',
       id: 'modules',
       submenus: [],
       path: '/admin/user/module_management',
   },
   {
    name: 'Data Import',
    id: 'modules',
    submenus: [],
    path: '/admin/user/data_import',
},
//    {
//        name: 'Setup Wizard',
//        id: 'setup_wizard',
//        submenus: [],
//        path: '/admin/user/setup_wizard',
//    },
//    {
//        name: 'Remote Access',
//        id: 'remote_access',
//        submenus: [],
//        path: '/admin/user/remote_access',
//    },
];