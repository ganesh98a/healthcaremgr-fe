import React, { useState, useEffect, useRef } from 'react';
import DatePicker from "react-datepicker";
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import "../salesforce/scss/components/admin/ReactDatePicker.scss";
import {
    Button,
    ButtonGroup,
    Dropdown,
    ExpandableSection,
    Icon,
    IconSettings,
    Input,
    Modal,
    Popover,
} from '@salesforce/design-system-react';
import SLDSReactSelect from '../salesforce/lightning/SLDSReactSelect';

function ReactDatePicker(props) {
    const [selectedDate, setSelectedDate] = useState();
    const [maxYear, setMaxYear] = useState('');

    const ref = useRef();

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const getYear = (date) => {
        return new Date(date).getFullYear();
    }

    const getMonth = (date) => {
        return new Date(date).getMonth();
    }

    const onChangeDate = (date) => {
        if (date) {
            if (maxYear !== '' && date <= maxYear) {
                setSelectedDate(date);
                props.callBack({ label: props.name, value: date });
            }

        } else {
            setSelectedDate();
            props.callBack({ label: props.name, value: '' });
        }
    }

    const onChangeRawDate = (date) => {
        if (date.target.value) {
            var new_date = moment(date.target.value, "dd/MM/yyyy");
            if (new_date.isValid()) {
                var date_string = date.target.value.toString();
                if (date_string.indexOf('-') > -1) {
                    date_string = date_string.replaceAll("-", "/");
                } else if (date_string.indexOf('.') > -1) {
                    date_string = date_string.replaceAll(".", "/");
                }
                let format_date = moment(date_string, "dd/MM/yyyy");
                if (maxYear !== '' && date <= maxYear) {
                    props.callBack({ label: props.name, value: format_date });
                }
            }
        }else {
            setSelectedDate();
            props.callBack({ label: props.name, value: '' });
        }
    }


    const years = () => {
        let list = [];
        let minYear = props.minYear ? props.minYear : new Date().getFullYear() - 200;
        let maxYear = props.maxYear ? props.maxYear : new Date().getFullYear() + 200;
        for (let year = minYear; year < maxYear; year++) {
            list.push(+year);
        }
        return list;
    }


    useEffect(() => {
        moment.lang('en-AU');
        if (props.selected) {
            setSelectedDate(moment(new Date(props.selected)).toDate());
        }
        if (props.maxYear) {
            let max_date = new Date('12/31/' + props.maxYear);
            setMaxYear(max_date);
        }
    }, [props]);


    return (
        <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
            <div className="row py-2 custom_date">
                <div className="col-lg-8 col-sm-8 cust_date_picker">
                    <label style={{ display: 'Inline-flex' }}>
                        <DatePicker
                            ref={ref}
                            renderCustomHeader={({
                                date,
                                changeYear,
                                changeMonth,
                                decreaseMonth,
                                increaseMonth,
                                prevMonthButtonDisabled,
                                nextMonthButtonDisabled,
                            }) => (
                                <div className="date-picker-main row">
                                    <div className="col-sm-1">
                                        <a className="arrow-btn" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                                            {"<"}
                                        </a>
                                    </div>
                                    <div className="col-sm-5">
                                        <select style={{ margin: '0px 5px', }}
                                            value={months[getMonth(date)]}
                                            onChange={({ target: { value } }) =>
                                                changeMonth(months.indexOf(value))
                                            }
                                        >
                                            {months.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-4">
                                        <select style={{ margin: '0px 5px', }}
                                            value={getYear(date)}
                                            onChange={({ target: { value } }) => changeYear(value)}
                                        >
                                            {years().map((option_year) => (
                                                <option key={option_year} value={option_year}>
                                                    {option_year}
                                                </option>
                                            ))}

                                        </select>
                                    </div>
                                    <div className="col-sm-1">
                                        <a className="arrow-btn" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                                            {">"}
                                        </a>
                                    </div>
                                </div>
                            )}
                            dropdownMode={'scroll'}
                            required={true}
                            autoComplete={'on'}
                            dateFormat='dd/MM/yyyy'
                            placeholderText={props.placeholder}
                            minDate={props.minDate || ''}
                            maxDate={maxYear}
                            selected={selectedDate}
                            value={selectedDate}
                            onChange={(date) => { onChangeDate(date) }}
                            onChangeRaw={(date) => { onChangeRawDate(date) }}
                            id={props.id}
                            showPopperArrow={true}
                            shouldCloseOnSelect={true}
                            calendarClassName={'react-calendar'}
                        />
                        <i className='icon icon-calendar' style={{ position: 'absolute', marginLeft: '130px', marginTop: '5px' }}></i>
                    </label>

                </div>
            </div>
        </IconSettings>
    );
}

export default ReactDatePicker;