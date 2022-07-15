import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from 'moment-timezone';
import CreateNewTask from './CreateNewTask';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import ShortTaskListPopUp from './ShortTaskListPopUp';
import SuccessPopUp from './../SuccessPopup';
import { MyCustomHeader } from 'service/MyCustomHeader.js';
import { CustomEvent } from 'service/CustomEvent.js';
import { postData } from 'service/common.js';
import { connect } from 'react-redux';

class TaskSchedule extends Component {

    constructor() {
        super();
        this.state = {
            showModal: false,
            ActiveClass: 'schedule',
            events: [],
            successPop: false,
            schedModal: false,
            editActionModal: false
        }

    }

    showModal = () => {
        this.setState({ showModal: true })
    }

    closeModal = () => {
        this.setState({ showModal: false, showTaskList: false })
    }

    componentDidMount() {
        this.getTaskList(moment());
    }
    
    selectSlot = (props, type) => {
        if(type === "due"){
            this.setState({task_list: props.event.due_task_list, showTaskList: true});
        }else{
            this.setState({task_list: props.event.comp_task_list, showTaskList: true});
        }
        console.log(props);
    }

    getTaskList = (date) => {
        postData('recruitment/RecruitmentTaskAction/get_recruitment_task_list_calendar', { date: date }).then((result) => {
            if (result.status && result.data.length > 0) {
                var temp_state = result.data;
                var title = '';
                result.data.map((value, index) => {
                    temp_state[index]['completedData'] = { status: false, count: 0, msg: ' Tasks Due' };
                    temp_state[index]['dueData'] = { status: false, count: 0, msg: ' Tasks Due' };

                    if (moment(value.start_date).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD') && value.dueCount > 0) {
                        title = value.dueCount + ' Tasks Due';
                        temp_state[index]['dueData'] = { status: true, count: value.dueCount, msg: ' Tasks Due' };
                    }
                    if (moment(value.start_date).format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD') && value.CompleteCount > 0) {
                        title = value.CompleteCount + ' Tasks Completed';
                        temp_state[index]['completedData'] = { status: true, count: value.CompleteCount, msg: ' Tasks Completed' };
                    }

                    temp_state[index]['start'] = new Date(value.start_date);
                    temp_state[index]['end'] = new Date(value.end_date);
                })
                this.setState({ 'events': temp_state });
            }
        });
    }



    render() {
        moment.locale('au', { week: { dow: 1, doy: 1, }, });
        moment.tz.setDefault('Australia/Melbourne');
        const localizer = BigCalendar.momentLocalizer(moment) // or globalizeLocalizer 

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12 col-md-12 no-pad back_col_cmn-">
                        <span onClick={(e) => window.history.back()} className="icon icon-back1-ie"></span>
                    </div>
                </div>
                {/* row ends */}

                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>
                {/* row ends */}


                <div className="row action_cont_row">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="tab-content">
                            <div role="tabpanel" className="tab-pane active" id="scheduleSection">
                                <div className="Schedule_calendar">


                                    <div className="row">
                                        <div className="col-lg-12 no-pad">
                                            <div className="action_calendar">

                                                <BigCalendar
                                                    popup
                                                    localizer={localizer}
                                                    components={{ toolbar: CalendarToolbar }}
                                                    defaultDate={new Date()}
                                                    defaultView="month"
                                                    views={['month']}
                                                    events={this.state.events}
                                                    style={{ height: "100vh" }}
                                                    onNavigate={(e) => this.getTaskList(e)}
                                                    components={{
                                                        event: (props) => CustomEvent({ ...props, headertype: 'schedules', clickOnDate: this.selectSlot }),
                                                        toolbar: CalendarToolbar,
                                                        month: { dateHeader: (props) => MyCustomHeader({ ...props, headertype: 'schedules' }) }
                                                    }}
                                                />

                                                <div className="leg_dv">
                                                    <ul className="legend_ulBC">
                                                        <li><span className="leg_ic trng"></span> Due Tasks</li>
                                                        <li><span className="leg_ic gr_int"></span> Complete Tasks</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* row ends */}


                                </div>
                                <div className="row legend_row--">
                                    <div className="col-sm-8 ">

                                    </div>

                                    <div className="col-sm-4 no_pd_r">
                                        <button className="btn cmn-btn1 new_task_btn" onClick={this.showModal}>Create New Task</button>
                                    </div>

                                </div>
                                {/* schedules_comp ends */}
                            </div>

                        </div>
                    </div>
                </div>

                {(this.state.showModal) ? <CreateNewTask showModal={this.state.showModal} closeModal={this.closeModal} />: ''}
                
                {(this.state.showTaskList) ? <ShortTaskListPopUp task_list={this.state.task_list} showModal={this.state.showTaskList} closeModal={this.closeModal} />: ''}



                <SuccessPopUp show={this.state.successPop} close={() => { this.setState({ successPop: false }) }} >
                    Your email has been sent out to the selected Applicant
                </SuccessPopUp>

            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(TaskSchedule);

class CalendarToolbar extends Toolbar {

    render() {
        return (
            <div>
                <div className="rbc-btn-group">
                    {/* <span className="" onClick={() => this.navigate('TODAY')} >Today</span> */}
                    <span className="icon icon-arrow-left" onClick={() => this.navigate('PREV')}></span>
                    <span className="icon icon-arrow-right" onClick={() => this.navigate('NEXT')}></span>
                </div>
                <div className="rbc-toolbar-label">{this.props.label}</div>
            </div>
        );
    }
}