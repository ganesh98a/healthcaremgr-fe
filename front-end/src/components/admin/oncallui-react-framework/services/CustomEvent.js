
import React from 'react';

const CustomEvent = (props) => {
  let lowDataHtml ='';
  let mediumDataHtml ='';
  let highDataHtml ='';
  let dueDataHtml ='';
  let completedDataHtml ='';
  let propsData = {};
  if(props.event.hasOwnProperty('lowData') && typeof(props.event.lowData) == 'object' && props.event.lowData !=null && props.event.lowData!=undefined && props.event.lowData.hasOwnProperty('status') &&  props.event.lowData.status){
    if(props.hasOwnProperty('clickOnpriorityDat')){
      propsData['onClick'] = props.clickOnpriorityDat.bind(null,props.event.lowData.count,'low',props.event.start);
    }

    lowDataHtml =(<div className="priority_task low_priority"  {...propsData}>{props.event.lowData.count}</div>);
  }
  if(props.event.hasOwnProperty('mediumData') && typeof(props.event.mediumData) == 'object' && props.event.mediumData !=null && props.event.mediumData!=undefined && props.event.mediumData.hasOwnProperty('status') && props.event.mediumData.status){
    if(props.hasOwnProperty('clickOnpriorityDat')){
      propsData['onClick'] = props.clickOnpriorityDat.bind(null,props.event.mediumData.count,'medium',props.event.start);
    }
    mediumDataHtml =(<div className="priority_task medium_priority" {...propsData}>{props.event.mediumData.count}</div>);
  }
  if(props.event.hasOwnProperty('highData') && typeof(props.event.highData) == 'object' && props.event.highData !=null && props.event.highData!=undefined && props.event.highData.hasOwnProperty('status') && props.event.highData.status){
    if(props.hasOwnProperty('clickOnpriorityDat')){
      propsData['onClick'] = props.clickOnpriorityDat.bind(null,props.event.highData.count,'high',props.event.start);
    }
    highDataHtml =(<div className="priority_task high_priority" {...propsData}>{props.event.highData.count}</div>);
  }

  if(props.event.hasOwnProperty('dueData') && typeof(props.event.dueData) == 'object' && props.event.dueData !=null && props.event.dueData!=undefined && props.event.dueData.hasOwnProperty('status') && props.event.dueData.status){
    dueDataHtml =(<div onClick={() => props.clickOnDate(props,"due",props.event.dueData)} className="due_priority">{(props.event.dueData.hasOwnProperty('count')? props.event.dueData.count:'')+' '+(props.event.dueData.hasOwnProperty('msg')?props.event.dueData.msg:'')}</div>);
  }

  if(props.event.hasOwnProperty('completedData') && typeof(props.event.completedData) == 'object' && props.event.completedData !=null && props.event.completedData!=undefined && props.event.completedData.hasOwnProperty('status') && props.event.completedData.status){
    completedDataHtml =(<div onClick={() => props.clickOnDate(props, "completed",props.event.completedData)} className="completed_priority">{(props.event.completedData.hasOwnProperty('count')? props.event.completedData.count:'')+' '+(props.event.completedData.hasOwnProperty('msg')?props.event.completedData.msg:'')}</div>);
  }

  if(props.headertype=='schedules'){
    lowDataHtml='';
    mediumDataHtml='';
    highDataHtml='';
  }else if(props.headertype == 'staffDetails'){
    dueDataHtml ='';
    completedDataHtml ='';
  }
    return (
        <div className={"event-render-contant__"}>
            {lowDataHtml}{mediumDataHtml}{highDataHtml}{dueDataHtml}{completedDataHtml}
        </div>
    );
}
CustomEvent.defaultProps = {
    event: {
    dueData:{status:false,count:0,msg:''},
    completedData:{status:false,count:0,msg:''},
    highData:{status:false,count:0},
    lowDataHtml:{status:false,count:0},
    mediumDataHtml:{status:false,count:0}
    },
    headertype:'schedules',
    clickEvent: () => {}

};

export { CustomEvent };
