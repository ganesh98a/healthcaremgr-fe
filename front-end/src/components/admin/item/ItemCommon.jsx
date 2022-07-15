import React from 'react';
import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { itemJson } from 'menujson/item_menu_json';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import CreateGoalsModel from './goals/CreateGoalsModel';
import CreateMemberModel from './member/CreateMemberModel';

 /**
* when archive is requested by the user for selected role document
*/
export function showArchiveGoalModal(goal_id, fresh_call_back) {
   const msg = `Are you sure you want to archive this goal?`
   const confirmButton = `Archive Goal`
   AjaxConfirm({ goal_id }, msg, `item/Goals/archive_goal`, { confirm: confirmButton, heading_title: `Archive Goal` }).then(result => {
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
 * Render add/edit goal modal
 * 
 */
export function openAddEditGoalModal(goal_id, participant_id, openCreateModal, closeCreatModal,isFromParticipantPage=false,service_agreement_id=null,service_type='',plan_start_date=null,plan_end_date=null) {
    return (
        <React.Fragment>
            {
                openCreateModal && (
                    <CreateGoalsModel
                        id = {goal_id}
                        participant_id = {participant_id}
                        showModal = {openCreateModal}
                        closeModal = {closeCreatModal}
                        service_agreement_id={service_agreement_id}
                        headingTxt = "Create Goals"
                        isFromParticipantPage={isFromParticipantPage}
                        service_type={service_type}
                        plan_start_date={plan_start_date}
                        plan_end_date={plan_end_date}
                    />
                )
            }
        </React.Fragment>
    )
}

/**
 * Render add/edit participant member modal
 */
export function openAddEditMemberModal(participant_id, openCreateModal, closeCreatModal) {
    return (
        <React.Fragment>
            {
                openCreateModal && (
                    <CreateMemberModel
                        participant_id = {participant_id}
                        showModal = {openCreateModal}
                        closeModal = {closeCreatModal}
                        headingTxt = "Add/Update Registered Member"
                    />
                )
            }
        </React.Fragment>
    )
}

/**
* when archive is requested by the user for selected participant member
*/
export function showArchiveMemberModal(id, fresh_call_back) {
    const msg = `Are you sure you want to archive this registered support worker?`
    const confirmButton = `Archive Registered Support worker`
    AjaxConfirm({ id }, msg, `item/Participant/archive_participant_member`, { confirm: confirmButton, heading_title: `Archive Registered Support worker` }).then(result => {
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