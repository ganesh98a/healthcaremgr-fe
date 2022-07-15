export const financeActiveTitle = {
  add_finance_user: "Add New Finance User",
  apply_credit_note: "Apply Credit Note-",
  audit_logs_das: "Audit Logs",
  create_credit_note: "Create Credit Note -",
  create_new_schedule: "Create New Schedule For Parent Org",
  create_manual_invoice: "New Quote For",
  create_new_enquiry: "New Quote Enquiry",
  create_new_line_item: "Create New Line Item",
  create_new_line_item_group: "Create New Line Item Group",
  create_new_payrate: "Create New Payrate",
  create_new_statement: "Create New Statement for",
  credit_notes: "Credit Notes",
  dashboard: "Finance Dashboard",
  invoice_scheduler: "Invoice Scheduler",
  invoice_scheduler_history: "Invoice Scheduler History",
  invoice_dashboard: "Invoices",
  create_manual_invoice: "New Manual Invoice For",
  line_item_pricing_groups: "Line Item Pricing Groups",
  ndis_billing: "NDIS Billing",
  ndis_error_tracking: "NDIS Error Tracking",
  ndis_invoices: "NDIS Invoices",
  payrates: "Payrates",
  payroll: "Payroll",
  payroll_exemption: "Payroll Exemption",
  payroll_exemption_history: "Payroll Exempt History",
  payroll_tax: "Payroll Tax",
  payroll_tax_individual: "Payroll Tax for",
  pricing_dashboard: "Line Item Pricing",
  quotes_dashboard: "Quotes Home",
  quotes_view: "New Quotes for",
  invoice_view: "Invoice for",
  refunds: "Refunds",
  shifts: "Shifts",
  shifts_payroll: "Shifts & Payroll",
  shifts_queries: "Shifts Queries",
  statements_dashboard: "Statements Dashboard",
  upload_csv: "Upload CSV File",
  user_management: "User Management",
  payroll_exemption_add: "To Payroll Exemption",
  ndis_invoice_status_import: "Upload File",
  wizard_set_line_item:'Set Line Items',
  wizard_set_pay_rates:'Set Pay Rates',
  wizard_set_invoice_template:'Set Invoice Template',
  wizard_set_payroll_exemption:'Set Payroll Exemption',
  wizard_set_credit_notes:'Set Credit Notes',
  wizard_Integrations:'Integrations',

};

export const financeHideShowSubmenus = {
  shift_payroll_menu: {
    hideLink: false,
    submenu: {
      shift_payroll_payroll_exemption_menu: {
        hideLink: false,
        page_type_show: "payroll_exemption",
        sunmenu: {
          shift_payroll_payroll_exemption_history_menu: {
            hideLink: true,
            page_type_show: "payroll_exemption_history"
          }
        }
      }
    }
  }
};

export const financeHideShowSubmenusPermissionBase = {
  shift_payroll_menu: {
    hideLink: true,
    check_access_type: ["access_finance_shift_and_payroll"],
    submenu: {
      shift_payroll_shifts_menu: {
        hideLink: true,
        check_access_type: ["access_finance_shift_and_payroll"]
      },
      shift_payroll_payroll_menu: {
        hideLink: true,
        check_access_type: ["access_finance_shift_and_payroll"]
      },
      shift_payroll_payroll_exemption_menu: {
        hideLink: true,
        check_access_type: ["access_finance_shift_and_payroll"]
      }
    }
  },
  payrates_menu:{
    hideLink: true,
    check_access_type: ["access_finance_payrate"]
  },
  quotes_menu:{
    hideLink: true,
    check_access_type: ["access_finance_quote"]
  },
  invoices_menu:{
      hideLink: true,
      //check_access_type: ["access_finance_invoice"],
    submenu:{
        invoice_scheduler_menu:{
            hideLink: true,
            check_access_type: ["access_finance_invoice"]
        },
        credit_notes_menu:{
            hideLink: true,
            check_access_type: ["access_finance_credit_note_and_refund"]
        },
        refunds_menu:{
            hideLink: true,
            check_access_type: ["access_finance_credit_note_and_refund"]
        },
        ndis_invoices_menu:{
            hideLink: true,
            check_access_type: ["access_finance_ndis_invoice"],
            submenu:{
                ndis_invoices_billing_menu : {
                    hideLink: true,
                    check_access_type: ["access_finance_ndis_invoice"]
                },
                /* ndis_invoices_error_tracking_menu : {
                    hideLink: true,
                    check_access_type: ["access_finance_ndis_invoice"]
                }, */
            }
        },
    }
},
statements_menu:{
  hideLink: true,
  check_access_type: ["access_finance_statement"]
},
/* audit_logs_menu:{
  hideLink: true,
  check_access_type: ["access_finance_audit_log"]
}, */
user_management_menu:{
  hideLink: true,
  check_access_type: ["access_finance_admin"]
},
line_item_pricing_menu:{
  hideLink: true,
  check_access_type: ["access_finance_line_item"]
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

export const financeJson = [
  {
    name: "Dashboard",
    id: "dashboard_menu",
    // submenus: [
    //     {name:'Line Item Pricing', path:'/admin/recruitment/dashboard/flagged_applicants'},
    // ],
    path: "/admin/finance/dashboard"
  },
  {
    name: "Line Item Pricing",
    id:"line_item_pricing_menu",
    path: "/admin/finance/line_item_listing"
  },
  {
    name: "Payrates",
    id:"payrates_menu",
    path: "/admin/finance/payrates"
  },
  {
    name: "Quotes",
    id:"quotes_menu",
    path: "/admin/finance/quote_dashboard"
  },

  {
    name: "Invoices",
    id:"invoices_menu",
    path: "/admin/finance/InvoicesDashboard",
    submenus: [
      {
        name: "Invoice Scheduler",
        id: "invoice_scheduler_menu",
        path: "/admin/finance/InvoiceScheduler"
      },
      {
        name: "Credit Notes",
        id: "credit_notes_menu",
        path: "/admin/finance/CreditNotes"
      },
      {
        name: "Refunds",
        id: "refunds_menu",
        path: "/admin/finance/Refunds"
      },
      {
        name: "NDIS Invoices",
        path: "/admin/finance/NdisInvoices",
        id: "ndis_invoices_menu",
        subSubMenu: [
          { name: "NDIS Billing", path: "/admin/finance/NDISBilling",id: "ndis_invoices_billing_menu"}
          ,
          {
            name: "NDIS Error Tracking",
            id: "ndis_invoices_error_tracking_menu",
            path: "/admin/finance/import_ndis_status"
          }
        ]
      }
    ]
  },
  {
    name: "Statements",
    id: "statements_menu",
    path: "/admin/finance/StatementsDashboard"
  },
  /* {
        name: 'SIL & SDA',
        submenus: [
            {
                name: 'SILs',
                path: '/admin/finance/dashboard',
            },
            {
                name: 'SDAs',
                path: '/admin/finance/dashboard',
            },
        ]
    }, */
  {
    name: "Shifts & Payroll",
    id: "shift_payroll_menu",
    path: "/admin/finance/ShiftsAndPayrollDash",
    submenus: [
      {
        name: "Shifts",
        id: "shift_payroll_shifts_menu",
        path: "/admin/finance/shifts"
      },
      /*  {
                name: 'Shift Queries',
                path: '/admin/finance/ShiftsQueries',
            }, */
      {
        name: "Payroll",
        id: "shift_payroll_payroll_menu",
        path: "/admin/finance/payroll"
      },
      {
        name: "Payroll Exemption",
        id: "shift_payroll_payroll_exemption_menu",
        path: "/admin/finance/payrollexemption",
        subSubMenu: [
          {
            name: "Payroll Exemption History",
            path: "/admin/finance/payrollexemptionhistory",
            pathstructure: "/admin/finance/payrollexemptionhistory",
            linkOnlyHide: true,
            type: 2,
            id: "shift_payroll_payroll_exemption_history_menu"
          }
        ]
      }
    ]
  },
  /* {
    name: "Audit Logs",
    id: "audit_logs_menu",
    path: "/admin/finance/AuditLogsDash",
  }, */
  {
    name: "User Management",
    id: "user_management_menu",
    path: "/admin/finance/user_management"
  },
  // {
  //   name: "Wizard",
  //   id: "wizard_menu",
  //   path: "/admin/finance/set_lineItem",
  //   submenus: [
  //     {
  //       name: "Set Line Items ",
  //       id: "set_lineItem_menu",
  //       path: "/admin/finance/set_lineItem"
  //     },
  //     {
  //       name: "Set Pay Rates",
  //       id: "set_payrates_menu",
  //       path: "/admin/finance/set_payrates"
  //     },
  //     {
  //       name: "Set Invoice Templates",
  //       id: "shift_payroll_shifts_menu",
  //       path: "/admin/finance/set_invoice_template"
  //     },
  //     {
  //       name: "Set Payroll Exemptions",
  //       id: "set_payroll_exemption_menu",
  //       path: "/admin/finance/set_payroll_exemption"
  //     },
  //     {
  //       name: "Setup Credit Notes / Write Off’s",
  //       id: "set_credit_notes_menu",
  //       path: "/admin/finance/set_credit_notes"
  //     },
  //     {
  //       name: "Integration",
  //       id: "integrations_menu",
  //       path: "/admin/finance/integrations"
  //     },
  //   ]
  // }
];
