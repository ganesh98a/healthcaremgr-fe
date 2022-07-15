export const fmsActiveTitle = {
    details: "Details",
    incident_ongoing:"Ongoing",
    case_ongoing:"Ongoing",
    incident_completed:"Completed",
    case_completed:"Completed",
    case_details:"Case Details",
    case_respond:"Case Details",
    case_monitor:"Case Details",
  };
  
  export const fmsJson = [
        {
            name: 'Cases',
            id:'cases',
            submenus: [
                            { name: 'Ongoing', path: '/admin/fms/dashboard/new/case_ongoing' },
                            { name: 'Completed', path: '/admin/fms/dashboard/new/case_completed' },     
            ],
            className:'removeDropdown'
        },
        {
            name: 'Incidents',
            id:'incidents',
            submenus: [
                { name: 'Ongoing', path: '/admin/fms/dashboard/incidents/incident_ongoing', pathstructure: "/admin/fms/dashboard/incidents/incident_ongoing", type:3,moduelname: "incident" },
                { name: 'Completed', path: '/admin/fms/dashboard/incidents/incident_completed', pathstructure: "/admin/fms/dashboard/incidents/incident_completed", type:3,moduelname: "incident" },
        
            ],
            className:'removeDropdown'
        },
        {
            name:  'Case ID :186',
            id:'fms_name_cases',
            linkShow: false,
            submenus: [
                            { name: 'Case Details', path: '#',pathstructure:"/admin/fms/case/:id/case_details",type:1 },
                            { name: 'Respond', path: '#',pathstructure:"/admin/fms/case/:id/case_respond",type:1 },     
                            { name: 'Monitor', path: '#' ,pathstructure:"/admin/fms/case/:id/case_monitor",type:1},     
            ],
            className:'removeDropdown'
           
        }
    ];
  