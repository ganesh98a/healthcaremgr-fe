import React from 'react';
import moment from 'moment';
const SingleDay = (props) => {

        return <td className="day">
            <table>
                <tbody>
                    <tr>
                        <th><span className="weekdays">{props.day}</span></th>
                        <th><span className="hidden_date"></span></th>
                    </tr>
                    {props.weekList.map((val, index) => (
                        <tr 
                        title={val.is_active ? "Start at: " + moment(val.start_time).format('hh:mm A') + " End time: " + moment(val.end_time).format('hh:mm A') : ""} 
                        key={index + 1} 
                        className={((val.is_active) ? 'outside_funding_number odd' : '')} 
                        onClick={() => props.addRoster(index, props.index, props.day)}>
                            <td colSpan="2"></td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </td>;
}

export default SingleDay;