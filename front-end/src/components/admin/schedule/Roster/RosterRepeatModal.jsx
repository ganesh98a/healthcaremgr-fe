import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import 'react-block-ui/style.css';
import Input from '@salesforce/design-system-react/lib/components/input';
import Checkbox from '@salesforce/design-system-react/lib/components/checkbox';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import Row from '../../oncallui-react-framework/grid/Row';
import Col50 from '../../oncallui-react-framework/grid/Col50';
import SelectList from "../../oncallui-react-framework/input/SelectList";
import SectionContainer from '../../oncallui-react-framework/grid/SectionContainer';
import jQuery from "jquery";
import  SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import { SLDSISODatePicker, SLDSISODateOfBirthPicker } from '../../salesforce/lightning/SLDSISODatePicker';
import moment from 'moment';


class RosterRepeatModal extends Component {
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            selected_roster: this.props.roster,
            roster_id: this.props.roster_id,
            roster_start_date: '',
            roster_end_date: '',
            scheduled_start_date: this.props.scheduled_start_date,
            scheduled_end_date: this.props.scheduled_end_date,
            selected_dates: [],
            repeat_option: this.props.repeat_option,
            special: ['Zeroth','First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'],
        };
    }

    componentDidMount() {
        // Calculate the week and months
        let repeat_option = Number(this.props.repeat_option);
        if (repeat_option === 6) {
            this.formMonthArray();
        } else {
            this.formWeekArray();
        }        
        
    }

    /** Save Shift */
    onSubmit = () => {
        let selectedValues = [];
        let repeat_option = Number(this.props.repeat_option);
        if (this.state.selected_dates && this.state.selected_dates.length > 0) {
            var selected_dates = this.state.selected_dates;
            selected_dates.map((item) => {
                if (item.checked === true && (repeat_option === 4 || repeat_option === 5)) {
                    selectedValues.push(item.date);
                }
                if (item.checked === true && repeat_option === 6) {
                    var week = item.weeks;
                    console.log(item.weeks);
                    selectedValues = selectedValues.concat(week);
                }
            });
        }
        var repeat_specific_days = false;
        var total_length = this.state.selected_dates.length;
        var selected_length = selectedValues.length;
        if (total_length !== selected_length) {
            repeat_specific_days = true;
        }
        this.props.saveRepeatRoster(selectedValues, repeat_specific_days);
    }

    /**
     * Form Month Week Array with default selected
     */
    formMonthArray = () => {
         let selected_roster = this.state.selected_roster[0] ?  this.state.selected_roster[0] : '';
        
         //  Get weeks count
         if (selected_roster.start_date && selected_roster.end_date) {
            let sc_start_date = new Date(this.state.scheduled_start_date);
            let sc_end_date = new Date(this.state.scheduled_end_date);
 
            let ros_start_date = new Date(selected_roster.start_date);
            let ros_end_date = new Date(selected_roster.end_date);
            this.setState({ roster_start_date: selected_roster.start_date, roster_end_date: selected_roster.end_date });
 
            let month_diff = this.monthDiff(ros_start_date, ros_end_date);
            let all_month = this.dateRange(this.state.scheduled_start_date, selected_roster.end_date);
            let scheduled_end_date=moment(this.state.scheduled_end_date);
            let scheduled_start_date=moment(this.state.scheduled_start_date);
            if (all_month.length > 1) {
                var calender = [];
                var res_date = moment(selected_roster.end_date);
                let dayINeed = moment(sc_start_date).format('dddd');
                for (let i = 1; i < all_month.length; i++) {
                    var month_temp = [];
                    var date = all_month[i];

                    var day = moment(date).startOf('month').day(dayINeed);
                    if (day.date() > 7) day.add(7,'d');
                    var month = day.month();
                    var week_in = 1;
                    var week_temp = [];
                    while(month === day.month()) {
                        var date_temp = [];
                        if (day.isBefore(res_date) === true || day.isSame(res_date) === true ) {
                            // date_temp['date_str'] = day.toString();
                            // date_temp['date_format'] = day.format('YYYY-MM-DD');
                            // date_temp['dat'] = day;
                            week_temp.push(day.format('YYYY-MM-DD'));
                            day.add(7,'d');
                            week_in++;
                        } else {
                            break;
                        }
                    }


                 
                    if(week_temp.indexOf(res_date.format('YYYY-MM-DD').toString())>-1)
                    {
                      if(!scheduled_start_date.isSame(scheduled_end_date,'days'))
                                {
        
                                    week_temp.splice(week_temp.indexOf(res_date.format('YYYY-MM-DD').toString()),1)
                                  
                                }
                    }
                    month_temp['weeks'] = week_temp;
                    month_temp['date'] = date;
                    month_temp['month'] = moment(date).format('MMM');
                    month_temp['week_count'] = week_in;
                    calender.push(month_temp);
                }

                // Form month select array
                let month_array = [];
                var calender_length = calender.length;

                for (var l = 0; l < 5; l++) {
                    var selected_week = [];
                    selected_week['id'] = l + 1;
                    // get available week of month
                    var value = '';
                    var dates = [];
                    for (var j = 0; j < calender_length; j++) {
                        if (calender[j]['weeks'][l]) {
                            value += value !== '' ? ', ' + calender[j]['month'] : calender[j]['month'];
                            dates.push(calender[j]['weeks'][l]);
                        }
                    }

                    selected_week['label'] = 'First '+dayINeed+ ' of '+value;
                    if (value !== '') {
                        selected_week['checked'] = true;
                        selected_week['disabled'] = false;
                    } else {
                        selected_week['checked'] = false;
                        selected_week['disabled'] = true;
                    }
                    selected_week['idx'] = l+1;
                    selected_week['weeks'] = dates;
                    selected_week['selected_date'] = this.state.special[l+1]+' '+dayINeed+ ' of '+value;
                    if (value !== '') {
                        month_array.push(selected_week);
                    }

                }
                this.setState({ selected_dates: month_array, calender: calender });
            }
        }
    }

    /**
     * Get all months between two dates
     * @param {str} startDate 
     * @param {str} endDate 
     * @returns 
     */
    dateRange = (startDate, endDate) => {
        startDate = moment(startDate).format('YYYY-MM-DD');
        endDate = moment(endDate).format('YYYY-MM-DD');
        
        var start      = startDate.split('-');
        var end        = endDate.split('-');
        var startYear  = parseInt(start[0]);
        var endYear    = parseInt(end[0]);
        var dates      = [];
      
        for(var i = startYear; i <= endYear; i++) {
          var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
          var startMon = i === startYear ? parseInt(start[1])-1 : 0;
          for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
            var month = j+1;
            var displayMonth = month < 10 ? '0'+month : month;
            dates.push([i, displayMonth, '01'].join('-'));
          }
        }
        return dates;
    }

    /**
     * Get all weeks start and end date // not in use
     * for reference
     */
    getAllWeekWithdatteOfMonth = (sc_start_date) => {
        var dateApril = sc_start_date;
        // year and month are variables
        var year = moment(sc_start_date).format('Y');
        var month = moment(sc_start_date).format('M');
        var startDate = moment([year, month]);

        // // Get the first and last day of the month
        var firstDay = moment(startDate).startOf('month')
        var endDay = moment(startDate).endOf('month')
        var monthRange = moment.range(firstDay, endDay);
        var weeks = []
        for (let mday of monthRange.by('days')) {
            if (weeks.indexOf(mday.week()) === -1) {
                weeks.push(mday.week());
            }
        }

        // // Create a range for each week
        var calendar = []
        for (let index = 0; index < weeks.length; index++) {
            var weeknumber = weeks[index];
    
    
            var firstWeekDay = moment(firstDay).week(weeknumber).day(0);
            if (firstWeekDay.isBefore(firstDay)) {
                firstWeekDay = firstDay;
            }
    
            var lastWeekDay = moment(endDay).week(weeknumber).day(6);
            if (lastWeekDay.isAfter(endDay)) {
                lastWeekDay = endDay;
            }
            // var weekRange = moment.range(firstWeekDay, lastWeekDay)
            var weekRange = [];
            weekRange['week_no'] = index + 1;
            weekRange['start_date'] = firstWeekDay;
            weekRange['end_date'] = lastWeekDay;
            weekRange['start_date_format'] = firstWeekDay.format("DD-MM-YYYY");
            weekRange['end_date_format'] = lastWeekDay.format("DD-MM-YYYY");
            calendar.push(weekRange)
        }
    }

    /**
     * Form Week Array with default selected
     */
    formWeekArray = () => {
        let selected_roster = this.state.selected_roster[0] ?  this.state.selected_roster[0] : '';
        
        //  Get weeks count
        if (selected_roster.start_date && selected_roster.end_date) {
            let sc_start_date = new Date(this.state.scheduled_start_date);
            let sc_end_date = new Date(this.state.scheduled_end_date);

            sc_start_date = new Date(selected_roster.start_date);
            sc_end_date = new Date(selected_roster.end_date);
            this.setState({ roster_start_date: selected_roster.start_date, roster_end_date: selected_roster.end_date });

            let bet_weeks = this.diff_weeks(sc_start_date, sc_end_date);

            var weeks = {};
            var weeksArr = [];
            var date = moment(this.state.scheduled_start_date); // Thursday Feb 2015
            let dow = '';
            let end_date = moment(selected_roster.end_date);
            let end_date_ros = moment(selected_roster.end_date);
            let start_date = moment(selected_roster.start_date);
            let scheduled_end_date=moment(this.state.scheduled_end_date);
            let scheduled_start_date=moment(this.state.scheduled_start_date);
            let diff_day = 0;
            var start_date_form;
            var end_date_form;
            let addDays = 0;
            if (Number(this.state.repeat_option) === 4) {
                addDays = 7;
            } else {
                addDays = 14;
            }
            for( let i = 1; i <= bet_weeks; i++) {
                weeks = {};
                date.add(addDays,'days');

                // if date is greater than end date break and continue the loop
                if (end_date_ros.isAfter(date) === false && end_date_ros.isSame(date,'days') === false ) {
                    continue;
                }
                
                if (i === 1) {
                    start_date_form = start_date.format('dddd, DD/MM/YYYY');
                    dow = start_date.day();
                    diff_day = addDays - dow;
                    end_date = start_date;
                    end_date.add(diff_day, 'days');
                    end_date_form = end_date.format('dddd, DD/MM/YYYY');
                } else {
                    start_date.add(1, 'days');
                    start_date_form = start_date.format('dddd, DD/MM/YYYY');
                    diff_day = addDays - 1;
                    end_date = start_date;
                    end_date.add(diff_day, 'days');
                    end_date_form = end_date.format('dddd, DD/MM/YYYY');
                }   
                
                    weeks['start_date'] = start_date_form;
                    weeks['end_date'] = end_date_form;
                    weeks['checked'] = true;
                    weeks['idx'] = i-1;
                    weeks['selected_date'] = date.format('dddd, DD/MM/YYYY');
                    weeks['date'] = date.format('YYYY-MM-DD');
                    weeks['disabled'] = false;
                    weeks['start_date_shift']= moment(date);
                    if(end_date_ros.isSame(date,'days'))
                    {
                    if(!scheduled_start_date.isSame(scheduled_end_date,'days'))
                        {

                            continue;
                        }
                    }
                    // Push the date in array
                    weeksArr.push(weeks);
    
                
               
            }
            this.setState({ selected_dates: weeksArr });
        }
    }

    /**
     * Month diff
     * @param {str} d1 
     * @param {str*} d2 
     * @returns 
     */
    monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    /**
     * Calculate the week between two date using moment
     * @param {str} date1 
     * @param {str} date2 
     */
    calculateWeekBetweenMoment = (date1, date2) => { 
        let currDay = moment(date1);
        let endDay = moment(date2);
        let diff = moment.duration(endDay.diff(currDay));

        let diff_mwd = [];
        diff_mwd['months'] = diff.months();
        diff_mwd['weeks'] = diff.weeks();
        diff_mwd['weeks_v1'] = Math.floor(diff.asWeeks());
        diff_mwd['days'] = diff.days()%7;
    }

    /**
     * Calculate the week between two date
     * @param {date} date1 
     * @param {date} date2 
     * @returns 
     */
    calculateWeeksBetween = (date1, date2) => {
        // The number of milliseconds in one week
        let ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
        // Convert both dates to milliseconds
        let date1_ms = date1.getTime();
        let date2_ms = date2.getTime();
        // Calculate the difference in milliseconds
        let difference_ms = Math.abs(date1_ms - date2_ms);
        // Convert back to weeks and return hole weeks
        return Math.floor(difference_ms / ONE_WEEK);
    }

    /**
     * Calculate the week between two date
     * @param {date} dt1 
     * @param {date} dt2 
     * @returns 
     */
    diff_weeks(dt2, dt1) 
    {

    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
    
    }

    /**
     * Handle on check
     * @param {str} idx 
     * @param {obj} comdate 
     */
    handleOnCheck = (idx, comdate) => {
        var selected_date = this.state.selected_dates;
        if (selected_date && selected_date[idx]) {
            selected_date[idx]['checked'] = !selected_date[idx]['checked'];
            this.setState({ selected_dates: selected_date });
        }
    }

    /**
     * rendering components
     */
    render() {
        let pattern_txt;
        let repeat_option = Number(this.props.repeat_option);
        switch (repeat_option) {
            case 5:
                pattern_txt = 'fortnightly';
                break;
            case 6:
                pattern_txt = 'monthly';
                break;
            default: 
                pattern_txt = 'weekly';
                break;
        }
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    size="small"
                    heading={this.props.headingTxt}
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} id="roster_cancel" label="Cancel" onClick={() => this.props.closeModal()} />,
                        <Button disabled={this.state.loading} id="roster_save" label="Save" variant="brand" onClick={() => this.onSubmit()} />
                    ]}
                    onRequestClose={() => this.props.closeModal(false)} 
                    dismissOnClickOutside={false}
                >
                    <SectionContainer>
                        <div className="row py-2">
                            <div className="col-sm-12 pl-5 mt-3 mb-3">
                                <div className="slds-form-element pb-2">
                                    <label className="slds-form-element__label">Selected {pattern_txt} pattern to repeat the shift:</label>
                                </div>
                                <div class="slds-form-element__control date_clip">
                                {(this.state.selected_dates.length > 0) ? this.state.selected_dates.map((comdate, idx) => {
                                    return <div>
                                        <Checkbox
                                            assistiveText={{
                                                label: comdate.selected_date,
                                            }}
                                            id={"date"+idx}
                                            labels={{
                                                label: comdate.selected_date,
                                            }}
                                            value={idx}
                                            disabled={comdate.disabled}
                                            onChange={this.handleOnCheck.bind(this, idx, comdate)}
                                            checked={comdate.checked}
                                        />
                                        </div>
                                    }) : ''}
                                </div>
                            </div>
                        </div>
                    </SectionContainer>                    
                </Modal>
            </IconSettings>
        );
    }

}

export default RosterRepeatModal;
