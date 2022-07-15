import React, { Component } from 'react';
   
export const AttachmentAndNotesAndCreateTask = (props)=>{
    let attachmentsAttributes = {};
    if(props.stageDetailsAttachmentANdNotes.stage_status !=1){
        attachmentsAttributes['onClick'] = ()=>props.openAttachmentModel(props.stageDetailsAttachmentANdNotes.stage_number,props.stageDetailsAttachmentANdNotes.is_main_stage,props.stageDetailsAttachmentANdNotes.stage_number);
    }
    let createTaskAttributes = {};
    if(props.stageDetailsAttachmentANdNotes.stage_status ==2){
        createTaskAttributes['onClick'] = () => props.CreateTaskShowModal(props.stageDetailsAttachmentANdNotes.task_stage_number);
    }

    return (
        <React.Fragment>
            <ul className="Time_subTasks_Action__ ">
				{props.createPhoneInterviewOption? <li><span className="sbTsk_li" onClick={props.openCreateInterviewModel}>{props.titlePhoneInterview}</span></li>: ''}
				{props.deleteInterview? <li><span className="sbTsk_li" onClick={props.delleteInterviewMethod}>Delete Interview</span></li>: ''}
                {props.stageDetailsAttachmentANdNotes.task_stage_number == 2 && props.showSkillsOption? <li><span onClick={() => props.UpdateSkillShowModal()} className="sbTsk_li" >Skills</span></li>: ""}
                {props.stageDetailsAttachmentANdNotes.task_stage_number % 1 === 0 && props.stageDetailsAttachmentANdNotes.is_main_stage == true &&<li><span className="sbTsk_li" {...attachmentsAttributes}> Notes </span></li>}
                <li><span className="sbTsk_li" {...createTaskAttributes}>Create Task </span></li>
            </ul>
    

    </React.Fragment>
    );
}

AttachmentAndNotesAndCreateTask.defaultProps ={
    
    stageDetailsAttachmentANdNotes:{
        overwrite_stage:false,
        stageId:0,
        is_main_stage:false,
        stage_number:0,
        task_stage_number:0,
        stage_status:0,
        
    },
    showSkillsOption: false
};