import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { RosterDropdown, AnalysisDropdown} from '../../../dropdown/ScheduleDropdown.js';
import Select from 'react-select-plus';
import { connect } from 'react-redux';
import { ROUTER_PATH } from 'config.js';

class ScheduleMenu extends Component {
    constructor(props) {
        super(props);
        this.active = this.props.active;
        this.RosterDropdown = [{label: "New Request", value: 'new_request'}, {label: "Active Roster", value: 'active_roster'}, {label: "Archived (Duplicate)", value: 'archived_roster'}]
        this.AnalysisDropdown = []
        
        this.state = {
            roster: 'roster',
            analysis: 'analysis'
        }
    }

    render() {
        return (
                <div>
                     {(this.state.is_redirect)? <Redirect to={this.state.url} />:''}

                        <div className="w-100">
                        {(this.props.landingPage)? "" :
                        <div className="row  _Common_back_a">
                            <div className="col-lg-12 col-md-12"><Link className="d-inline-flex" to={this.props.back_url}><div className="icon icon-back-arrow back_arrow"></div></Link></div>
                        </div>
                        }  
                          <div className="row"><div className="col-lg-12 col-sm-12"><div className="bor_T"></div></div></div>
                    </div>
                       {(this.props.landingPage)? "":
                     <React.Fragment>
                    <div className="row _Common_He_a">
                        <div className="col-lg-9 col-md-9 col-sm-8">
                            <h1 className="my-0 color">{this.props.showPageTitle}</h1>
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-4">
                            {this.props.roster? 
                            <Link className="Plus_button" to={ROUTER_PATH+'admin/schedule/create_roster'}><i className="icon icon-add-icons create_add_but"></i><span>Create New Roster</span></Link>:
                            <Link className="Plus_button" to={ROUTER_PATH+'admin/schedule/create_shift'}><i className="icon icon-add-icons create_add_but"></i><span>Create New Shift</span></Link>        
                            }
                        </div>

                       
                    </div>
                      <div className="row"> <div className="col-lg-12 col-sm-12"><div className="bor_T"></div></div></div>
                      </React.Fragment> }
                
                </div>
                );
    }
}
const mapStateToProps = state => ({
    showPageTitle: state.ScheduleDetailsData.activePage.pageTitle,
    showTypePage: state.ScheduleDetailsData.activePage.pageType
})

export default connect(mapStateToProps)(ScheduleMenu);
