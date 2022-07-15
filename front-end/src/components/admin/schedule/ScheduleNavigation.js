import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';

class ScheduleNavigation extends Component {
    constructor(props) {
        super(props);
        this.active = this.props.active;
    }

    render() {
        return (
                 <aside className="col-lg-3 col-sm-3">
                        {(this.props.roster)? <ul className="side_menu">
                            <li><Link to={ROUTER_PATH+'admin/schedule/unfilled'} className="major_button"><i className="icon icon-back-arrow"></i> Schedule Main</Link></li>
                            <li><Link to={ROUTER_PATH+'admin/schedule/new_request'} className={(this.active == 'new_request')? 'active': ''}>New Request</Link></li>
                            <li><Link to={ROUTER_PATH+'admin/schedule/active_roster'} className={(this.active == 'active_roster')? 'active': ''}>Active Roster</Link></li>
                           <li><Link to={ROUTER_PATH+'admin/schedule/archived_roster'} className={(this.active == 'archived')? 'active': ''}>Archived (Duplicate)</Link></li>
                         
                           
                        </ul>:'' }
                        {(this.props.default)?
                        <ul className="side_menu">
                            <li><Link to={ROUTER_PATH+'admin/schedule/unfilled'} className={(this.active == 'unfilled')? 'active': ''}>Unfilled</Link></li>
                            <li><Link to={ROUTER_PATH+'admin/schedule/unconfirmed'} className={(this.active == 'unconfirmed')? 'active': ''}>Unconfirmed</Link></li>
                            <li><Link to={ROUTER_PATH+'admin/schedule/rejected_cancelled'} className={(this.active == 'rejected_cncelled')? 'active': ''}>Rejected & Cancelled</Link></li>
                           <li><Link to={ROUTER_PATH+'admin/schedule/filled'} className={(this.active == 'filled')? 'active': ''}>Filled</Link></li>
                            <li><Link to={ROUTER_PATH+'admin/schedule/completed'} className={(this.active == 'completed')? 'active': ''}>Completed</Link></li>
                        </ul>: ''}
                    </aside>
                );
    }
}

export default ScheduleNavigation
