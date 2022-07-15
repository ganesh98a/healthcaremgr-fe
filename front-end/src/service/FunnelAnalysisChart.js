
import React from 'react';

const FunnelAnalysisChart = (props) => {
    let totalRow =  typeof(props.funnelData) == 'object' && props.funnelData.length>0 ? props.funnelData.length :0;
    return (
        typeof(props.funnelData) == 'object' && props.funnelData.length>0 && props.funnelData!=undefined && props.funnelData!=null  ? props.funnelData.map((row,index)=>{
            if((row== undefined || row== null)) {
                return(<React.Fragment />);
            }else{
            let classNameData = (index==0 ? 'Funnel_skew1':(index==(totalRow-1) ? 'Funnel_skew2' :''));
            let classNameDataExtra = (row.label_status? 'funnel_line_':'');
            let extraStayle = (typeof(row)=='object' && row!=null && row!=undefined &&  row.hasOwnProperty('itemGridentColor') && row.itemGridentColor.hasOwnProperty('col1') &&row.itemGridentColor.hasOwnProperty('col2') ? props.setgradientColor(row.itemGridentColor.col1,row.itemGridentColor.col2):{} );
            let styleData = row.hasOwnProperty('itemStyle') ? {...row.itemStyle, ...extraStayle} :{};
            return(
                <div key={index} className={"Funnel_common "+ (props.funnelPosition=='left' ? 'left_funnel' : (props.funnelPosition=='right' ? 'right_funnel' :'') )}>
                    <div className={"Funnel_list "+ classNameData +' '+ classNameDataExtra} style={styleData}>
                        <div className="Funnel_tr">
                            <div className="Funnel_td_1">{row.hasOwnProperty('lost_per') && row.lost_per!='' && row.lost_per != undefined && row.lost_per!=null && row.lost_per>0 ? row.lost_per:'0'}%</div>
                            <div  className="Funnel_td_2">{row.hasOwnProperty('success_per') && row.success_per!='' && row.success_per != undefined && row.success_per!=null && row.success_per>0 ? row.success_per:'0'}%</div>
                        </div>
                        <i style={styleData}>
                        {row.hasOwnProperty('label_status') && row.label_status && row.hasOwnProperty('label_data')  && typeof(row.label_data)== 'object' && row.label_data!= undefined && row.label_data!=null? (<div className="Funnle_data">
                                <div><strong>{row.label_data.hasOwnProperty('title') ? row.label_data.title:''}</strong></div>
                                <div>Start: {row.label_data.hasOwnProperty('start') ? row.label_data.start:0}</div>
                                <div>complete: {row.label_data.hasOwnProperty('complete') ? row.label_data.complete:0}</div>
                            </div>) :(<React.Fragment/>)
                        }
                        </i>
                      
                    </div>                               
                </div>
        );}}) : <React.Fragment />
        
    );
}

FunnelAnalysisChart.defaultProps = {
   funnelData:[
       /* {lost_per:'50',success_per:'50',label_status:true,label_data:{title:'Contact',start:'253',complete:'152'},itemStyle:{color:'red'},itemGridentColor:{col1:'#7e85d3',col2:'#7e85d3'}},
       {lost_per:'50',success_per:'50',label_status:false,label_data:{title:'Contact',start:'253',complete:'152'},itemStyle:{color:'red'},itemGridentColor:{col1:'#c2e0ce',col2:'#c2e0ce'}} */
    ],
    funnelPosition:'left',
    setgradientColor:(col1,col2) => { 
        let setColor = {
            backgroundImage: '-moz-linear-gradient(right top,'+col1+' 0%,'+col2+' 100%)',
            backgroundImage: '-webkit-gradient(linear,right top, left bottom,color-stop(0, '+col1+'),color-stop(1, '+col2+'))',
            background: '-webkit-linear-gradient(right top, '+col1+' 0%, '+col2+' 100%)',
            background: '-o-linear-gradient(right top, '+col1+' 0%, '+col2+' 100%)',
            background: '-ms-linear-gradient(right top, '+col1+' 0%, '+col2+' 100%)',
            background: 'linear-gradient(right top, '+col1+' 0%, '+col2+' 100%)'
        }
        return setColor;

    },
    

    
};



export { FunnelAnalysisChart };


