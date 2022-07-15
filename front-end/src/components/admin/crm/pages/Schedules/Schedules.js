import React, { Component } from 'react';
import { Link,Redirect } from 'react-router-dom';
import { ROUTER_PATH } from '../../../../../config.js';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import { checkItsNotLoggedIn, postData, getQueryStringValue } from '../../../../../service/common.js';
import { connect } from 'react-redux';
import CrmPage from '../../CrmPage';
import { CustomEvent } from 'service/CustomEvent.js';
import { WeekendDayPropGetter } from 'service/WeekendDayPropGetter.js';
import { MyCustomHeader } from 'service/MyCustomHeader.js';

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer
moment.locale('au', {
    week: {
        dow: 0,
        doy: 0,
    },
});
const localizer = BigCalendar.momentLocalizer(moment)
class Schedules extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);

        this.state = {
            myEventsList: [],
            key: 1, filterVal: '', dueTask: [], subTaskData: [], date: '',myAllSchedulesList:[],
            redirect:false,
            taskDate:'',
            status_type:'',

        };
    }
    handleSelect(key) {
        this.setState({ key });
    }

    componentDidMount() {
        this.getScheduleList(moment());
    }

    clickOnDate = (e, type, timeStamp) => {
        var evDate = e.event.start;
        //moment(timeStamp).format("YYYY-MM-DD");
        this.setState({ redirect: true, status_type:type, taskDate: evDate });
    };

     getScheduleList = (e) => {
         var requestData = { date: e };
         postData('crm/CrmSchedule/schedules_calendar_data', requestData).then((result) => {
             if (result.status) {
                 var tempAry = result.data;
                 if (tempAry.length > 0) {

                     tempAry.map((value, idx) => {
                         tempAry[idx]['end'] = value.end
                         tempAry[idx]['start'] = value.start
                     })
                     this.setState({ myAllSchedulesList: tempAry });
                 }
             } else {
                 this.setState({ error: result.error });
             }
             this.setState({ loading: false });
         });
     }

    render() {
      if (this.state.redirect && this.state.taskDate) {
          return (
              <Redirect
                  to={{ pathname: "/admin/crm/tasks", state: { openSortDateDetails: true,  status_type:this.state.status_type, due_date: this.state.taskDate } }}
              />
          );
      }

        let formats = {
            dateFormat: 'ddd D',
        };
        return (
            <div className="container-fluid">
                <CrmPage pageTypeParms={'schedule_user_schedule'} />
                <div className="row">
                    <div className="col-lg-12">
                        <div className="py-4 bb-1">
                            <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/participantadmin'}><span className="icon icon-back1-ie"></span></Link>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="row d-flex py-4">
                            <div className="col-md-9">
                                <div className="h-h1">
                                    {this.props.showPageTitle}
                                </div>
                            </div>
                        </div>
                        <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="col-md-12 mt-4">
                                <div className="Schedule_calendar">
                                    <BigCalendar
                                        localizer={localizer}
                                        defaultView='month'
                                        events={this.state.myAllSchedulesList}
                                        views={['month']}
                                        components={{
                                            event: (props) => CustomEvent({ ...props, headertype: 'schedules', clickOnDate: this.clickOnDate }),
                                            toolbar: CalendarToolbar,
                                            month: { dateHeader: (props) => MyCustomHeader({ ...props, headertype: 'schedules' }) }
                                        }}

                                        //components={{ toolbar: CalendarToolbar }}
                                        startAccessor="start"
                                        endAccessor="end"
                                        dayPropGetter={WeekendDayPropGetter}
                                        formats={formats}
                                        headertype={'schedules'}
                                        onNavigate={this.getScheduleList}
                                    />


                                </div>
                            </div>
                            <div className="col-md-12 d-flex Shift_times_div my-4">
                                <div><span className="na_shift"></span>Due Tasks</div>
                                <div><span className="pm_shift"></span>Completed Tasks</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,
    }
};
export default connect(mapStateToProps)(Schedules);
class CalendarToolbar extends Toolbar {
    render() {
        return (
            <div>
                <div className="rbc-btn-group">
                    <span className="" onClick={() => this.navigate('TODAY')} >{/* Today */}</span>
                    <span className="icon icon-arrow-left" onClick={() => this.navigate('PREV')}></span>
                    <span className="icon icon-arrow-right" onClick={() => this.navigate('NEXT')}></span>
                </div>
                <div className="rbc-toolbar-label">{this.props.label}</div>
            </div>
        );
    }
}
