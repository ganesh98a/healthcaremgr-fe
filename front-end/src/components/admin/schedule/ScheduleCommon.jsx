import React from 'react';
import { AjaxConfirm, toastMessageShow, get_take_access_lock,postData } from 'service/common.js';
import CreateShiftModal from './CreateShiftModal';
import AddShiftMember from './AddShiftMember';

/**
* when archive is requested by the user for selected shift
*/
export function showArchiveShiftModal(id, fresh_call_back="", obj = null) {

    return get_take_access_lock('shift', id, true).then(ret => {
        if(ret.status == false) {
            toastMessageShow(ret.error, "e");
            return false;
        }
        else {
            const msg = `Are you sure you want to archive this shift?`
            const confirmButton = `Archive Shift`
            AjaxConfirm({ id }, msg, `schedule/ScheduleDashboard/archive_shift`, { confirm: confirmButton, heading_title: `Archive Shift` }).then(result => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    if(fresh_call_back) {
                    fresh_call_back();
                    }

                    if(obj) {
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
    })
 }

/**
* when archive shift member is requested by the user
*/
export function showArchiveShiftMemberModal(shift_id, id, fresh_call_back="", obj = null) {

    return get_take_access_lock('shift', shift_id, true).then(ret => {
        if(ret.status == false) {
            toastMessageShow(ret.error, "e");
            return false;
        }
        else {
            const msg = `Are you sure you want to archive this shift member?`
            const confirmButton = `Archive Shift Member`
            AjaxConfirm({ id }, msg, `schedule/ScheduleDashboard/archive_shift_member`, { confirm: confirmButton, heading_title: `Archive Shift Member` }).then(result => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    if(fresh_call_back) {
                    fresh_call_back();
                    }

                    if(obj) {
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
    })
 }
 
 /**
  * Render add/edit shift modal
  * 
  */
 export function openAddEditShiftModal(shift_id, openCreateShiftModal, closeCreateShiftModal, clone_shift_id, roster, page_name) {
    // make shift_id null if clone_shift_id is passed
    if(clone_shift_id != '' && clone_shift_id > 0) {
    shift_id = '';
    }

    return (
        <React.Fragment>
            {
                openCreateShiftModal && (
                    <CreateShiftModal
                        id = {shift_id}
                        clone_id = {clone_shift_id}
                        showModal = {openCreateShiftModal}
                        closeModal = {closeCreateShiftModal}
                        roster = {roster}
                        page_name= {page_name}
                    />
                )
            }
        </React.Fragment>
    )
 }

  /**
  * Render add/edit shift modal
  * 
  */
 export function openAddShiftMember(shift_id, openAddShiftMember, closeAddShiftMember, shift_members_count) {
    return (
        <React.Fragment>
            {openAddShiftMember ? 
                <AddShiftMember
                    openAddShiftMember={openAddShiftMember}
                    shift_id={shift_id}
                    closeAddShiftMember={closeAddShiftMember}
                    shift_members_count={shift_members_count}
                /> 
                : '' 
            }
        </React.Fragment>
     )
 }

 export function get_service_agreement (shift_start_date,shift_end_date,section,account) {
    return new Promise((resolve, reject) => {
        let start_date = shift_start_date;
        let end_date = shift_end_date;
        if (start_date === '' || end_date === '' || !start_date || !end_date) {
            return false;
        }
        postData("schedule/ScheduleDashboard/get_service_agreement", { account, start_date, end_date, section }).then((res) => {
            if (!res.status && res.error !== 'API ERROR') {
                resolve(res);
            }else{
                resolve({'service_booking_exist':true});
            }
    });
    });
}

