export const participaintActiveTitle = {
  bookers_list: "Booker List",
  requirements: "Requirements",
  preferences: "Preferences",
  details: "Details",
  diagnosis: "Diagnosis",
  health_notes: "Health notes",
  misc: "Misc",
  sites: "Sites",
  strategies: "Care Strategies",
  notes: "Notes",
  fms: "FMS",
  financial_overview: "Financial Overview",
  current_shift: "Current Shift",
  roster_requests: "Roster Request",
  current_roster: "Current Roster",
  current_plan: "Current Plan",
  plan_history: "Plan History",
  goal_tracker: "Goal Tracker",
  goal_history: "Goal History",
  service_docs: "Service Docs",
  SIL_docs: "SIL Docs",
  analysis: "Analysis",
  totals: "Totals",
  feedback:'Feedback',
  previous_feedback_notes:'Previous Feedback Notes'
};
export const participaintJson = [
  {
    name: "name",
    pathstructure: "/admin/participant/about/:id/details",
    type: 1,
    path: "/admin/participant/about/",
    linkShow: false,
    id: "participant_name",
    className: "active"
  },
  {
    name: "Participants Details",
    path: "#",
    id: "participant_details",
    linkShow: false,
    submenus: [
      {
        name: "About",
        pathstructure: "#",
        type: 1,
        path: "#",
        subSubMenu: [
          {
            name: "Details",
            pathstructure: "/admin/participant/about/:id/details",
            type: 1,
            path: "/admin/participant/about/"
          },
          {
            name: "Bookers List",
            pathstructure: "/admin/participant/about/:id/bookers_list",
            type: 1,
            path: "/admin/participant/about/"
          },
          {
            name: "Requirements",
            pathstructure: "/admin/participant/about/:id/requirements",
            type: 1,
            path: "/admin/participant/about/"
          },
          {
            name: "Preferences",
            pathstructure: "/admin/participant/about/:id/preferences",
            type: 1,
            path: "/admin/participant/about/"
          }
        ]
      },

      {
        name: "Health",
        pathstructure: "#",
        type: 1,
        path: "#",
        subSubMenu: [
          {
            name: "Diagnosis",
            pathstructure: "/admin/participant/health/:id/diagnosis",
            type: 1,
            path: "/admin/participant/health/"
          },
          {
            name: "Health Notes",
            pathstructure: "/admin/participant/health/:id/health_notes",
            type: 1,
            path: "/admin/participant/health/"
          },
          {
            name: "Misc",
            pathstructure: "/admin/participant/health/:id/misc",
            type: 1,
            path: "/admin/participant/health/"
          }
        ]
      },

      {
        name: "Site",
        pathstructure: "/admin/participant/sites/:id/sites",
        path: "/admin/participant/sites/",
        type: 1
      },
      // {
      //   name: "Feedback",
      //   pathstructure: "/admin/participant/feedback/:id/feedback",
      //   path: "/admin/participant/feedback",
      //   type: 1
      // },
      {
        name: "Care Notes",
        pathstructure: "#",
        type: 1,
        path: "#",
        subSubMenu: [
          {
            name: "Care Strategies",
            pathstructure: "/admin/participant/care_notes/:id/strategies",
            path: "/admin/participant/care_notes/",
            type: 1
          },
          {
            name: "Notes",
            path: "/admin/participant/care_notes/",
            pathstructure: "/admin/participant/care_notes/:id/notes",
            type: 1
          }
        ]
      },
      {
        name: "FMS",
        subSubMenu: [],
        pathstructure: "/admin/participant/fms/:id",
        path: "/admin/participant/fms/",
        type: "1",
        moduelname: "fms",
        // subSubMenu: [
        //   {
        //     name: "Previous Feedback Notes",
        //     pathstructure: "/admin/participant/previous_feedback_notes/:id/previous_feedback_notes",
        //     path: "/admin/participant/previous_feedback_notes/",
        //     type: 1
        //   }
        // ]
      }
    ]
  },

  {
    name: "Shift & Rosters",
    id: "participant_shifts_rosters",
    linkShow: false,
    submenus: [
      {
        name: "Current Shifts",
        pathstructure: "/admin/participant/current_shift/:id",
        path: "/admin/participant/current_shift/:id",
        type: 1
      },
      {
        name: "Roster Requests",
        pathstructure: "/admin/participant/roster_request/:id",
        path: "/admin/participant/roster_request/",
        type: 1
      },
      {
        name: "Current Roster",
        pathstructure: "/admin/participant/current_roster/:id",
        path: "/admin/participant/current_roster/",
        type: 1
      }
      
    ]
  },

  {
    name: "Funding",
    id: "participant_funding",
    linkShow: false,
    submenus: [
      {
        name: "Plan(s)",
        path: "#",
        subSubMenu: [
          {
            name: "Current Plan(s)",
            pathstructure: "/admin/participant/current_plan/:id",
            path: "/admin/participant/financial_overview/",
            type: 1
          },
          {
            name: "Plan History",
            pathstructure: "/admin/participant/plan_history/:id",
            path: "/admin/participant/financial_overview/",
            type: 1
          }
        ]
      },
      {
        name: "Goals",
        path: "#",
        subSubMenu: [
          {
            name: "Goal Tracker",
            path: "/admin/participant/goal/",
            pathstructure: "/admin/participant/goal/:id/goal_tracker",
            type: 1
          },
          {
            name: "Goal History",
            path: "/admin/participant/goal/",
            pathstructure: "/admin/participant/goal/:id/goal_history",
            type: 1
          }
        ]
      },

      {
        name: "Docs",
        path: "#",
        subSubMenu: [
          {
            name: "Service Docs",
            path: "/admin/participant/doc/",
            pathstructure: "/admin/participant/doc/:id/service_docs",
            type: 1
          },
          /*{
            name: "SIL Docs",
            path: "/admin/participant/doc/",
            pathstructure: "/admin/participant/doc/:id/SIL_docs",
            type: 1
          }*/
        ]
      },

      {
        name: "Funds",
        path: "#",
        subSubMenu: [
            {
                name: "Financial Overview",
                pathstructure: "/admin/participant/financial_overview/:id",
                path: "/admin/participant/financial_overview/",
                type: 1
              }
          /*{
            name: "Totals",
            path: "/admin/participant/funding/",
            pathstructure: "/admin/participant/total_funding/:id",
            type: 1
          }/*,
          {
            name: "Analysis",
            path: "/admin/participant/funding/",
            pathstructure: "/admin/participant/analysis_funding/:id",
            type: 1
          }*/
        ]
      }
    ]
  }
];
