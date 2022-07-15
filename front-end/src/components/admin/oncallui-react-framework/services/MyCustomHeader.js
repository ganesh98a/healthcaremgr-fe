
import React from 'react';

const MyCustomHeader = (props) => {
    // console.log('props',props);
    let weekDay = props.headertype == 'schedules' ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let dayName = weekDay[props.date.getDay()];
    let dateNumber = props.date.getDate();
    let classData = dayName =='Sun' || dayName =='Sat' ? 'weekend-day-header' : 'weekday-header';
    let dateData = props.date.getDate() + '-'+(props.date.getMonth()+1)+'-'+props.date.getYear();
    let currrentDateData = new Date();
    let currrentDateDataFormat = currrentDateData.getDate() + '-'+(currrentDateData.getMonth()+1)+'-'+currrentDateData.getYear();
    if(dateData === currrentDateDataFormat){
        classData = classData+' rcb-today-day';
    }
    return (
        <div className={classData}><span className="rcb-day-name">{dayName}</span> <span className="rcb-day-number">{dateNumber}</span></div>
    );
}
MyCustomHeader.defaultProps ={
    headertype:'schedules'
};
export { MyCustomHeader };