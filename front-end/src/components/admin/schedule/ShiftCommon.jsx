import React from 'react';
import InlineAddEditModal from '../oncallui-react-framework/view/Modal/InlineAddEditModal';

/**
* Render modals here
*/
export function openAddEditShiftSkillModal(shift_skills, manageShiftSkillsModal, shift_id, closeAddEditShiftModal, isClose) {
   const condition_list =  [
        { label: 'Mandatory', value: '1' },
        { label: 'Optional', value: '2' }
    ];
    const determine_rows = ['Skill', 'Condition', 'Delete'];
    let shift_skills_list = [];
    if (shift_skills && shift_skills.length > 0) {
        shift_skills_list = shift_skills.map(c => {
            return {
                skill_key_val: {
                    label: c.skill_name,
                    value: c.skill_id,
                },
                shift_id: c.shift_id,
                skill_id: c.skill_id,
                skill_name: c.skill_name,
                condition: c.condition,
                id: c.id,
            }
        })
    }
    return (
        <React.Fragment>           
            <InlineAddEditModal
                key={manageShiftSkillsModal ? 0 : 1}
                heading={'Add Shift Skills'}
                is_open={true}
                on_close={() => { closeAddEditShiftModal(false); }}
                shift_skills_list={shift_skills_list}
                shift_id={shift_id}
                on_success={() => { closeAddEditShiftModal(true); }}
                close_add_edit_shift_modal={() => closeAddEditShiftModal(isClose)}
                table_rows={determine_rows}
                list_url={'schedule/ScheduleDashboard/get_skill_reference_data'}
                submit_url={'schedule/ScheduleDashboard/create_update_shift_skills'}
                condition_list= {condition_list}
            />
        </React.Fragment>
    )
} 