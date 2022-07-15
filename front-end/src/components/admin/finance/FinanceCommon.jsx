import React from 'react';
import { AjaxConfirm, toastMessageShow } from 'service/common.js';
import CreatePayrateModel from './payrate/CreatePayrateModel.jsx';
import CreateChargerateModel from './chargerate/CreateChargerateModel.jsx';
import ImportPayRateModel from './payrate/ImportPayrate';
import ImportChargeRateModel from './chargerate/ImportChargerate';
import CreateTimesheetLineItem from './timesheet/CreateTimesheetLineItem';
import CreateInvoiceLineItem from './invoice/CreateInvoiceLineItem';
import CreateTimesheetModal from './timesheet/CreateTimesheetModal';
import CreateInvoiceModal from './invoice/CreateInvoiceModal';

/**
* when archive is requested by the user for selected payrate
*/
export function showArchivePayrateModal(id, fresh_call_back) {
   const msg = `Are you sure you want to archive this pay rate?`
   const confirmButton = `Archive Pay Rate`
   AjaxConfirm({ id }, msg, `finance/FinanceDashboard/archive_pay_rate`, { confirm: confirmButton, heading_title: `Archive Pay Rate` }).then(result => {
       if (result.status) {
           toastMessageShow(result.msg, "s");
           fresh_call_back();
       } else {
           if (result.error) {
               toastMessageShow(result.error, "e");
           }
           return false;
       }
   })
}

/**
* when archive is requested by the user for selected chargerate
*/
export function showArchiveChargerateModal(id, fresh_call_back) {
    const msg = `Are you sure you want to archive this charge rate?`
    const confirmButton = `Archive Charge Rate`
    AjaxConfirm({ id }, msg, `finance/FinanceDashboard/archive_charge_rate`, { confirm: confirmButton, heading_title: `Archive Charge Rate` }).then(result => {
        if (result.status) {
            toastMessageShow(result.msg, "s");
            fresh_call_back();
        } else {
            if (result.error) {
                toastMessageShow(result.error, "e");
            }
            return false;
        }
    })
}

/**
 * Render add/edit payrate modal
 */
export function openAddEditPayrateModal(payrate_id, openCreatePayrateModal, closeCreatePayrateModal) {
    return (
        <React.Fragment>
            {
                openCreatePayrateModal && (
                    <CreatePayrateModel
                        id = {payrate_id}
                        showModal = {openCreatePayrateModal}
                        closeModal = {closeCreatePayrateModal}
                        headingTxt = "Create Payrate"
                    />
                )
            }
        </React.Fragment>
    )
}

/**
 * Render add/edit chargerate modal
 */
export function openAddEditChargerateModal(chargerate_id, openCreateChargerateModal, closeCreateChargerateModal) {
    return (
        <React.Fragment>
            {
                openCreateChargerateModal && (
                    <CreateChargerateModel
                        id = {chargerate_id}
                        showModal = {openCreateChargerateModal}
                        closeModal = {closeCreateChargerateModal}
                        headingTxt = "Create Chargerate"
                    />
                )
            }
        </React.Fragment>
    )
}

/**
 * Render bulk import payrates modal
 * 
 */
export function openImportModal(openImportModal, closeImportModal) {
    return (
        <React.Fragment>
            {
                openImportModal && (
                    <ImportPayRateModel
                        showModal = {openImportModal}
                        closeModal = {closeImportModal}
                        headingTxt = "Import Pay Rates"
                    />
                )
            }
        </React.Fragment>
    )
}

/**
 * Render bulk import chargerates modal
 * 
 */
export function openImportChargeRateModal(openImportModal, closeImportModal) {
    return (
        <React.Fragment>
            {
                openImportModal && (
                    <ImportChargeRateModel
                        showModal = {openImportModal}
                        closeModal = {closeImportModal}
                        headingTxt = "Import Pay Rates"
                    />
                )
            }
        </React.Fragment>
    )
}

/**
 * Render add/edit timesheet line item modal
 */
export function openAddEditLineItemModal(timesheet_id, shift_id, openCreateModal, closeCreatModal) {
    return (
        <React.Fragment>
            {
                openCreateModal && (
                    <CreateTimesheetLineItem
                        shift_id = {shift_id}
                        timesheet_id = {timesheet_id}
                        showModal = {openCreateModal}
                        closeModal = {closeCreatModal}
                    />
                )
            }
        </React.Fragment>
    )
}

/**
* when archive is requested by the user for selected timesheet line item
*/
export function showArchiveLineItemModal(id, timesheet_id, fresh_call_back, fresh_call_back2) {
    const msg = `Are you sure you want to archive this line item?`
    const confirmButton = `Archive Line Item`
    AjaxConfirm({ id }, msg, `finance/FinanceDashboard/archive_timesheet_line_item`, { confirm: confirmButton, heading_title: `Archive Line Item` }).then(result => {
        if (result.status) {
            toastMessageShow(result.msg, "s");
            fresh_call_back();

            if(timesheet_id) {
                fresh_call_back2(timesheet_id);
            }
        } else {
            if (result.error) {
                toastMessageShow(result.error, "e");
            }
            return false;
        }
    })
}

/**
 * Render add/edit invoice line item modal
 */
 export function openAddEditInvoiceLineItemModal(invoice_id, openCreateModal, closeCreatModal) {
    return (
        <React.Fragment>
            {
                openCreateModal && (
                    <CreateInvoiceLineItem
                        invoice_id = {invoice_id}
                        showModal = {openCreateModal}
                        closeModal = {closeCreatModal}
                    />
                )
            }
        </React.Fragment>
    )
}

/**
* when archive is requested by the user for selected invoice line item
*/
export function showArchiveInvoiceLineItemModal(id, invoice_id, fresh_call_back, fresh_call_back2) {
    const msg = `Are you sure you want to archive this line item?`
    const confirmButton = `Archive Line Item`
    AjaxConfirm({ id }, msg, `finance/FinanceDashboard/archive_invoice_line_item`, { confirm: confirmButton, heading_title: `Archive Line Item` }).then(result => {
        if (result.status) {
            toastMessageShow(result.msg, "s");
            fresh_call_back();

            if(invoice_id) {
                fresh_call_back2(invoice_id);
            }
        } else {
            if (result.error) {
                toastMessageShow(result.error, "e");
            }
            return false;
        }
    })
}

/**
 * Render add/edit timesheet modal
 */
export function openAddEditTimesheetModal(timesheet_id, openCreateTimesheetModal, closeCreateTimesheetModal) {
    return (
        <React.Fragment>
            {
                openCreateTimesheetModal && (
                    <CreateTimesheetModal
                        id = {timesheet_id}
                        showModal = {openCreateTimesheetModal}
                        closeModal = {closeCreateTimesheetModal}
                    />
                )
            }
        </React.Fragment>
    )
}

/**
 * Render add/edit invoice modal
 */
export function openAddEditInvoiceModal(invoice_id, openCreateInvoiceModal, closeCreateInvoiceModal) {
    return (
        <React.Fragment>
            {
                openCreateInvoiceModal && (
                    <CreateInvoiceModal
                        id = {invoice_id}
                        showModal = {openCreateInvoiceModal}
                        closeModal = {closeCreateInvoiceModal}
                    />
                )
            }
        </React.Fragment>
    )
}