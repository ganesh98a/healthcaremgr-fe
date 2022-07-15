import React from 'react'
import ReactDatePicker from 'react-datepicker';
import './scss/components/admin/DateOfBirthDatePicker.scss'
import moment from 'moment';

export const defaultDateFormat = 'DD/MM/YYYY'

/**
 * @param {import('react-datepicker').ReactDatePickerProps} props 
 */
const DateOfBirthDatePicker =  (props) => {
    return (
        <ReactDatePicker
            selected={props.selected}
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            autoComplete={"off"}
            dateFormat={defaultDateFormat}
            placeholderText={defaultDateFormat}
            calendarClassName={`DateOfBirthDatePickerCalendar`}
            dropdownMode="select"
            maxDate={moment().subtract(1, 'day')}
            {...props}
        />
    );
}

export default DateOfBirthDatePicker