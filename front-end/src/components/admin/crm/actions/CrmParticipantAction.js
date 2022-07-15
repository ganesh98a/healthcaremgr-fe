import {postData,postImageData} from '../../../../service/common.js';
export const CRM_PARTICIPANT_DATA = 'CRM_PARTICIPANT_DATA';
export const STATES = 'STATES';
export const SUBMIT = 'SUBMIT';
export const PLANLIST = 'PLANLIST';
export const ALLPLANLISTIDS ='ALLPLANLISTIDS';

export function crmParticipant(data){
  return  dispatch=>{
        dispatch(fetchAllLatestUpdate(data));
  };
    function fetchAllLatestUpdate(participantData) { return { type: CRM_PARTICIPANT_DATA,participantData: participantData } }
  }
export function crmParticipantSubmit(data){
  const config = {
                      headers: {
                          'content-type': 'multipart/form-data'
                      }
  }
  return  dispatch=>{
    return  postImageData('crm/CrmParticipant/create_crm_participant',data,config)
     // .then(json => {
     //   console.log(json.error);
     //   if(json.status){
     //     dispatch(submit(json.data));
     //     return json.data;
     //   }else{
     //     dispatch(failure(json.error));
     //   }
     // })
  };
    function submit(participantData) { return { type: SUBMIT,response: participantData } }
  }


  export function states(){
    let request_data = {data:''};
    return  dispatch=>{
        postData('crm/CrmParticipant/get_state',request_data)
        .then(json => {

          dispatch(states(json.data));
          return json.data;
        })
        .catch(error => console.log(error));
    };
      function states(state) { return { type: STATES,states: state } }
  }

  export function plan_list(request_data){
    //console.log(request_data);
    var planids=[];
    return  dispatch=>{
    return postData('crm/CrmStage/plan_list',request_data)
        .then(json => {

          dispatch(plan_list(json.data));
          if(json.status){
            json.data.map((item)=>{
               planids.push({ value: item.id, label: 'Plan id #:' + item.id });
            })
            dispatch(plan_id_options(planids));
          }
          dispatch(plan_list(json.data));
          return json;
        })
        .catch(error => console.log(error));
    };
      function plan_list(planlist) { return { type: PLANLIST,planlist: planlist } }
      function plan_id_options(planids) { return { type: ALLPLANLISTIDS,planids: planids } }
  }

  export function states_update(stateData){
    return  dispatch=>{
          dispatch(states(stateData));

    };
      function states(state) { return { type: STATES,states: state } }
  }
