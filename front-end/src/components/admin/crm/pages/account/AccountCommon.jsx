import React from 'react';
import { AjaxConfirm, toastMessageShow } from 'service/common.js';
import CreateAccountMemberModel from './CreateAccountMemberModel';
import CreateAccountModel from './CreateAccountModel';
import ManageAccountRoles from './ManageAccountRoles';
import CreateSiteModel from './CreateSiteModel';
/**
* when archive is requested by the user for selected organisation member
*/
export function showArchiveAccountMemberModal(id, fresh_call_back) {
    const msg = `Are you sure you want to archive this registered member?`
    const confirmButton = `Archive Registered Member`
    AjaxConfirm({ id }, msg, `sales/Account/archive_organisation_member`, { confirm: confirmButton, heading_title: `Archive Registered Member` }).then(result => {
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
* when archive is requested by the user for selected organisation
*/
export function showArchiveAccountModal(id, fresh_call_back = "", obj, type = "organisations") {
    var type_title = (type == "organisations") ? "Organisation" : "Site";
    const msg = `Are you sure you want to archive this ` + type_title + `?`;
    const confirmButton = `Archive ` + type_title;
    AjaxConfirm({ id }, msg, `sales/Account/archive_account`, { confirm: confirmButton, heading_title: `Archive ` + type_title }).then(result => {
        if (result.status) {
            toastMessageShow(result.msg, "s");

            if (fresh_call_back) {
                fresh_call_back();
            }

            if (obj) {
                obj.redirectToListing();
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
* when archive is requested by the user for selected account contact
*/
export function showArchiveAccountContactModal(id, fresh_call_back, from_contact = 0, is_site = false) {
    console.log(is_site);
    var title = '';
    var title2 = '';
    if (from_contact == 1 && is_site == true) {
        title = "contact from site";
        title2 = "Contact from Site";
    }
    else if (from_contact == 1 && is_site == false) {
        title = "contact from organisation";
        title2 = "Contact from Organisation";
    }
    else {
        title = "contact";
        title2 = "Contact";
    }

    const msg = `Are you sure you want to archive this ` + title + `?`
    const confirmButton = `Archive ` + title2;
    AjaxConfirm({ id }, msg, `sales/Account/archive_account_contact`, { confirm: confirmButton, heading_title: `Archive ` + title2 }).then(result => {
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
 * Render add/edit account member modal
 * 
 */
export function openAddEditAccountMemberModal(account_member_id, account_id, openCreateAccountMemberModal, closeCreateAccountMemberModal) {
    return (
        <React.Fragment>
            {
                openCreateAccountMemberModal && (
                    <CreateAccountMemberModel
                        id={account_member_id}
                        account_id={account_id}
                        showModal={openCreateAccountMemberModal}
                        closeModal={closeCreateAccountMemberModal}
                    />
                )
            }
        </React.Fragment>
    )
}


/**
 * Render add/edit account/organisation modal
 */
export function openAddEditAccountModal(account_id, add_site, parent_org_id, parent_org_name, openCreateAccountModal, closeCreateAccountModal, is_site, fetch_service_area = false) {
    var childorgprops = { account_name: parent_org_name, id: parent_org_id };
    console.log("is_site", is_site);
    // site = 0 means ORG 1 means site
    if (is_site == 1 && openCreateAccountModal) {
        return (
            <React.Fragment>
                {<CreateSiteModel
                    add_site={add_site}
                    org_id={account_id}
                    parent_org={parent_org_id}
                    childorgprops={childorgprops}
                    showModal={openCreateAccountModal}
                    closeModal={closeCreateAccountModal}
                />




                }
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                
                    <CreateAccountModel
                        add_site={add_site}
                        org_id={account_id}
                        parent_org={parent_org_id}
                        childorgprops={childorgprops}
                        showModal={openCreateAccountModal}
                        closeModal={closeCreateAccountModal}
                        fetch_service_area={fetch_service_area}
                    />
                
            </React.Fragment>
        )
    }

}

/**
 * Render add/edit account/opportunity contact modal
 */
export function openAddEditAccountContactModal(account_id, account_type, openCreateModal, closeAddEditModal) {
    return (
        <React.Fragment>
            {
                openCreateModal && (
                    <ManageAccountRoles
                        account_id={account_id}
                        account_type={account_type}
                        isOpen={openCreateModal}
                        closeModal={closeAddEditModal}
                    />
                )
            }
        </React.Fragment>
    )
}