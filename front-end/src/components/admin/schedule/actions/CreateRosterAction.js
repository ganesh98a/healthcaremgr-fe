import { postData, calculateGst } from 'service/common.js'
import {getTimeDifferInHours} from "./../CreateRoster/CommonFunction";

export const setKeyValueData = (options) => ({
    type: 'set_key_value_data',
    options
});

export const onChange = (key, value) => ({
    type: 'on_change_method',
    key: key,
    value: value
});

export const setRosterList = (data) => ({
    type: 'set_roster_list',
    data
});

export function getRosterShiftOption() {
    return (dispatch, getState) => {
        if(getState().CreateRosterReducer.stateList.length === 0){
            return postData('schedule/ScheduleDashboard/get_create_shift_option', {}).then((result) => {
                if (result.status) {
                    dispatch(setKeyValueData(result.data))
                }
            });
        }
    }
}

export function getRosterRequirementsForParticipant(request) {
    return (dispatch, getState) => {
        return postData('schedule/ScheduleRoster/get_roster_requirements_for_participant', request).then((result) => {
            if (result.status) {
                dispatch(setKeyValueData(result.data))
            }
        });
    }
}

export const updatePlanLineItemFund = (data) => ({
    type: 'update_plan_line_item_fund',
    data
});

export function getRosterDetails(request) {
    return (dispatch, getState) => {
        return postData('schedule/ScheduleRoster/get_roster_details', request).then((result) => {
            if (result.status) {
                dispatch(setKeyValueData({...result.data, data_loaded: true}))
            }
        });
    }
}


export const updateRemovedRosterShiftId = (roster_shiftId) => ({
    type: 'update_remove_roster_shiftId',
    roster_shiftId
});

export const resetRoster = () => ({
    type: 'reset_roster',
});

export function removeShift(shiftRoster) {
    return (dispatch, getState) => {
        
        shiftRoster.map((shift, i) => {
            var week_index = shift.week_index;
            var day = shift.day;
            var shift_index = shift.shift_index;

            var roster = getState().CreateRosterReducer

            let List = [...roster.rosterList]
            let shift_details = List[week_index][day][shift_index];

            let plan_line_item = Object.assign({}, roster.plan_line_item);

            if (shift_details['roster_shiftId']) {
                dispatch(updateRemovedRosterShiftId(shift_details.roster_shiftId))
            }

            if (Object.keys(shift_details.selected_line_item_id_with_data).length > 0) {
                Object.keys(shift_details.selected_line_item_id_with_data).map((val, index) => {

                    if (shift_details.selected_line_item_id_with_data[val]['existing_shift'] && shift_details['roster_shiftId']) {
                        var shift_item_cost = shift_details.selected_line_item_id_with_data[val]["existing_shift_used_amount"];
                    } else {
                        var shift_item_cost = shift_details.selected_line_item_id_with_data[val]["will_use_fund"];
                    }
                    let plan_line_itemId = shift_details.selected_line_item_id_with_data[val]["plan_line_itemId"]

                    let have_fund = parseFloat(plan_line_item[plan_line_itemId]['have_fund']);
                    let current_used = parseFloat(plan_line_item[plan_line_itemId]['current_used']);

                    let new_have_fund = (have_fund + shift_item_cost);
                    let new_current_used = (current_used - shift_item_cost);

                    plan_line_item[plan_line_itemId]['have_fund'] = new_have_fund;
                    plan_line_item[plan_line_itemId]['current_used'] = new_current_used;

                });
            }

            List[week_index][day] = List[week_index][day].filter((s, sidx) => shift_index !== sidx);

            if (List[week_index][day].length === 0) {
                List[week_index][day][0] = {is_active: false };
            }

            dispatch(updatePlanLineItemFund(plan_line_item))
            dispatch(setRosterList(List))
           
        })
        
        dispatch(autoAdjustFundWhenRemoveShift());
    }
}

export function autoAdjustFundWhenRemoveShift() {
    return (dispatch, getState) => {
        var roster = getState().CreateRosterReducer
        
        var rosterList = JSON.parse(JSON.stringify(roster.rosterList));
        let plan_line_item = Object.assign({}, roster.plan_line_item);
          
        rosterList.map((weekList, index) => {
            Object.keys(weekList).forEach((key, week_index) => {
                weekList[key].map((shift, shiftIndex) => {

                    if (shift.is_active && !shift.in_funding) {
                        var in_funding = true;
                        let temp_plan_line_item = Object.assign({},plan_line_item);
                        
                        var qty = getTimeDifferInHours(shift.start_time, shift.end_time);
                        var selected_line_item_id_with_data = {...shift.selected_line_item_id_with_data}

                        if (Object.keys(selected_line_item_id_with_data).length > 0) {
                            Object.keys(selected_line_item_id_with_data).map((val, index) => {

                                var shift_item_cost = selected_line_item_id_with_data[val]["cost"] * qty;
                                shift_item_cost += calculateGst(shift_item_cost);

                                var plan_line_itemId = selected_line_item_id_with_data[val]["plan_line_itemId"]

                                selected_line_item_id_with_data[val]["will_use_fund"] = shift_item_cost;

                                var have_fund = parseFloat(temp_plan_line_item[plan_line_itemId]['have_fund']);
                                var current_used = parseFloat(temp_plan_line_item[plan_line_itemId]['current_used']);

                                have_fund = (have_fund - shift_item_cost);
                                current_used = (current_used + shift_item_cost);
                                temp_plan_line_item[plan_line_itemId]['have_fund'] = have_fund;
                                temp_plan_line_item[plan_line_itemId]['current_used'] = current_used;

                                if (have_fund < 0) {
                                    in_funding = false;
                                }
                            });
                        }
                        
                        if(in_funding){
                            plan_line_item = temp_plan_line_item;
                            
                            rosterList[index][key][shiftIndex] = {...shift, in_funding: in_funding}
                        }
                    }
                })
            })
        })
     
        dispatch(updatePlanLineItemFund(plan_line_item));
        dispatch(setRosterList(rosterList));
    }
}

