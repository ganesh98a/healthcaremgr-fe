
import React from 'react';

const WeekendDayPropGetter = (date) => {
  let dayData = '';
  if(date.getDay()==0 || date.getDay()==6){
    return {
        className: 'weekend-day',
       /*  style: {
          border: 'solid 3px ' +  '#afa',
        }, */
      }
    
  }
  else {
      return {}
  }
    
}

export { WeekendDayPropGetter };