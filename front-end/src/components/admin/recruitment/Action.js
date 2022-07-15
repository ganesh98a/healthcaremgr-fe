import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from 'moment';
import CreateNewTask from './CreateNewTask';
import { Link } from 'react-router-dom';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import TaskComponent from './Tasks';
import SuccessPopUp from './SuccessPopup';
import { connect } from 'react-redux'
import RecruitmentPage from 'components/admin/recruitment/RecruitmentPage';


class Action extends Component {

    constructor() {
        super();
        this.state = {
            searchVal: '',
            filterVal: '',
            showModal: false,
            ActiveClass: 'schedule',
            events: [
                {
                    start: new Date(),
                    end: new Date(moment().add(0, "days")),
                    title: "Reminder 1"
                },
                {
                    start: new Date(),
                    end: new Date(moment().add(1, "days")),
                    title: "Reminder 2"
                },
                {
                    start: new Date(),
                    end: new Date(moment().add(2, "days")),
                    title: "Recruitment of Web developer"
                }
            ],
            successPop: false,
            schedModal: false
        }
    }

    showModal = () => {
        this.setState({ showModal: true })
    }

    closeModal = () => {
        this.setState({ showModal: false })
    }

    render() {

        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];
        moment.locale('ko', { week: { dow: 1, doy: 1, }, });
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
                        <RecruitmentPage pageTypeParms={this.props.props.match.params.page}/>
                        {/* row ends */}


                        <div className="row action_cont_row">
                            

                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="tab-content">
                                    <div role="tabpanel" className={this.props.showTypePage=='schedule' ? "tab-pane active" : "tab-pane"} id="scheduleSection">
                                        <div className="schedules_comp">

                                            <div className="row sort_row1-- after_before_remove">
                                                <div className="col-lg-8 col-md-8 col-sm-8 no_pd_l">
                                                    <div className="search_bar left">
                                                        <input type="text" className="srch-inp" placeholder="Search.." />
                                                        <i className="icon icon-search2-ie"></i>
                                                    </div>
                                                </div>

                                                <div className="col-lg-4 col-md-4 col-sm-4 no_pd_r">
                                                    <div className="filter_flx">
                                                        <div className="filter_fields__ cmn_select_dv">
                                                            <Select name="view_by_status"
                                                                required={true} simpleValue={true}
                                                                searchable={true} Clearable={false}
                                                                placeholder="Filter by: Unread"
                                                                options={options}
                                                                onChange={(e) => this.setState({ filterVal: e })}
                                                                value={this.state.filterVal}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* row ends */}

                                            <div className="row">
                                                <div className="col-lg-12 no-pad">
                                                    <div className="action_calendar">
                                                        <BigCalendar
                                                            localizer={localizer}
                                                            components={{ toolbar: CalendarToolbar }}
                                                            defaultDate={new Date()}
                                                            defaultView="month"
                                                            views={['month']}
                                                            events={this.state.events}
                                                            style={{ height: "100vh" }}
                                                            onSelectEvent={() => { this.setState({ schedModal: true }) }}
                                                        />
                                                        <div className={"schedules_modal " + (this.state.schedModal ? 'show' : '')}>
                                                            <div className="sched_modal_dialog left">

                                                                <div className="sched_head1">
                                                                    <div className="sch_type">Group Interview</div>
                                                                    <div className="sch_date">- 11/10/18 - <b>9:00am</b></div>
                                                                    <small>Duration: 1h</small>
                                                                </div>

                                                                <div className="asgndTo"><b>Assigned to:</b> John Mathews</div>

                                                                <div className="attending_list_dv">
                                                                    <b>Attending</b>
                                                                    <ul className="attendees1">
                                                                        <li>Johnny Smith <span className="icon icon-back1-ie"></span></li>
                                                                        <li>Jane McSmith<span className="icon icon-back1-ie"></span></li>
                                                                        <li>Kim Williamson<span className="icon icon-back1-ie"></span></li>
                                                                        <li>Terry Johnston<span className="icon icon-back1-ie"></span></li>
                                                                        <li>Eric Nguyen<span className="icon icon-back1-ie"></span></li>
                                                                        <li>Chris Gomez<span className="icon icon-back1-ie"></span></li>
                                                                    </ul>
                                                                </div>

                                                                <div className="btn cmn-btn1 snd_mail1" onClick={() => { this.setState({ successPop: true, schedModal: false }) }}>Send Confirmation Email</div>

                                                                <div className="asgndTo"><b>Where</b> Training Room 3</div>

                                                                <small className="creatn_tg">Created by <b>James Matthews</b><br />
                                                                    Date <b>02/10/18</b>
                                                                </small>

                                                            </div>
                                                        </div>
                                                        {/* schedules_modal ends */}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* row ends */}

                                            <div className="row legend_row--">
                                                <div className="col-sm-8 ">
                                                    <ul className="legend_ulBC">
                                                        <li><span className="leg_ic gr_int"></span> Group Interview</li>
                                                        <li><span className="leg_ic trng"></span> Training</li>
                                                        <li><span className="leg_ic Ind"></span> Individual Task</li>
                                                    </ul>
                                                </div>
                                                <div className="col-sm-4 no_pd_r">
                                                    <button className="btn cmn-btn1 new_task_btn" onClick={this.showModal}>Create New Task</button>
                                                </div>
                                            </div>

                                        </div>
                                        {/* schedules_comp ends */}
                                    </div>
                                    <div role="tabpanel" className={this.props.showTypePage=='task' ? "tab-pane active" : "tab-pane"} id="taskSection" ><TaskComponent /></div>
                                </div>
                            </div>
                        </div>
                  
                {(this.state.showModal) ?
                    <CreateNewTask showModal={this.state.showModal} closeModal={this.closeModal} />
                    : ''}

                {/* <div className={'successBg_popUp ' + (this.state.successPop?'show':'')}>
                    <div className='popUp_bx_1'>
                        <div className='text-right'>
                            <i className='icon icon-close1-ie close_ic' onClick={() => {this.setState({successPop:false})}}></i>
                        </div>
                        <div className='popMsg'>Your email has been sent out to the selected Applicant</div>
                        <i className='icon icon-accept-approve1-ie aprv_ic'></i>
                    </div>
                </div> */}

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

export default connect(mapStateToProps, mapDispatchtoProps)(Action);
class CalendarToolbar extends Toolbar {

    render() {
        return (
            <div>
                <div className="rbc-btn-group">
                <span className="" onClick={() => this.navigate('TODAY')} >Today</span>
                    <span className="icon icon-arrow-left" onClick={() => this.navigate('PREV')}></span>
                    <span className="icon icon-arrow-right" onClick={() => this.navigate('NEXT')}></span>
                </div>
                <div className="rbc-toolbar-label">{this.props.label}</div>
            </div>
        );
    }
}