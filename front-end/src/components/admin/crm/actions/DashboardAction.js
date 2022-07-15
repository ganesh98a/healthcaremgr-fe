import {postData} from '../../../../service/common.js';
export const FETCH_ALL_LATEST_UPDATE = 'FETCH_ALL_LATEST_UPDATE';


export function allLatestUpdate(){
let request_data = {data:0};
  return  dispatch=>{
    //console.log(request_data);
    return  postData('crm/Dashboard/latest_stage_updates',request_data)
    // .then(res => res.json())
      .then(json => {
        /* console.log(json); */
        dispatch(fetchAllLatestUpdate(json.data));
        return json.data;
      })
      .catch(error => console.log(error));
  };
    function fetchAllLatestUpdate(allLatestupdates) { return { type: FETCH_ALL_LATEST_UPDATE,allLatestupdates: allLatestupdates } }
  }
