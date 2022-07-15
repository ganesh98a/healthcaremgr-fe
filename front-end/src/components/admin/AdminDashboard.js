import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import PinModal from './PinModal';
import { checkItsNotLoggedIn, getPermission, checkLoginModule, pinHtml } from 'service/common.js';
import { DashboardPageTitle } from 'menujson/pagetitle_json';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';

class AdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pinModalOpen: false,
            permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),

        }
        checkItsNotLoggedIn();
    }

    closeModal = () => {
        this.setState({ pinModalOpen: false })
    }
    componentDidMount() {
        sessionStorage.removeItem('previous_menu');
    }

    setPath = (path, module) => {
        var data = {};
        data['module'] = module || '';
        this.props.onUpdateMenu('SET_CURRENT_APP', data);
        window.location = ROUTER_PATH + path;
    }

    render() {
        return (
            <div>
                <section className="manage_top w-100">
                    <div className="container-fluid  fixed_size">
                        <div className="row d-flex justify-content-center">
                            {/* <ul className="nav nav-tabs Category_tap col-lg-8 col-md-8 P_20_TB bb-0 mt-5" role="tablist">
                                <li role="presentation" className="col-lg-6 col-sm-6 active px-0">
                                    <a href="#Barry_details" aria-controls="Barry_details" role="tab" data-toggle="tab">Your Apps</a>
                                </li>
                            </ul> */}
                            <div className="col-lg-4 col-xs-6">
                                <span className="your_app_heading">Your Apps</span>
                            </div>
                        </div>

                        <div className="row">
                            <div className="tab-content folder_tab">

                                <div role="tabpanel" className="tab-pane active" id="Barry_details">
                                    <div className="row">
                                        <div className="col-lg-10 col-md-10 col-md-offset-1 col-lg-offset-1">
                                            <div className="row">
                                                <ul className="but_around_second text-center">
                                                    {/* {this.state.permissions.access_participant ? <li><Link to={ROUTER_PATH + 'admin/participant/dashboard'} title={DashboardPageTitle.participants_app}><span className="add_access p-colr">P</span><p>Participants</p></Link></li> : ''}
                                                    {this.state.permissions.access_organization ? <li><Link to={ROUTER_PATH + 'admin/organisation/dashboard'} title={DashboardPageTitle.organisation_app}><span className="add_access o-colr">O</span><p>Organisation</p></Link></li> : ''}
                                                    {this.state.permissions.access_fms ? <li><Link to={ROUTER_PATH + 'admin/fms/dashboard/new/case_ongoing'} title={DashboardPageTitle.fms_app}><span className="add_access f-colr">F</span><p>FMS</p></Link></li> : ''}
                                                    {this.state.permissions.access_imail ? <li><Link to={ROUTER_PATH + 'admin/imail/dashboard'} title={DashboardPageTitle.imail_app}><span className="add_access i-colr">I</span><p>Imail</p></Link></li> : ''}
                                                    {this.state.permissions.access_member ? <li><Link to={ROUTER_PATH + 'admin/member/dashboard'} title={DashboardPageTitle.member_app}><span className="add_access m-colr">M</span><p>Members</p></Link></li> : ''}
                                                    {this.state.permissions.access_schedule ? <li><Link to={ROUTER_PATH + 'admin/schedule/unfilled/unfilled'} title={DashboardPageTitle.schedule_app}><span className="add_access s-colr">S</span><p>Schedule</p></Link></li> : ''}
                                                    {this.state.permissions.access_admin ? <li>{pinHtml(this, 'admin', 'dashboard')}</li> : ''}
                                                    {this.state.permissions.access_crm_admin ? <li><Link to={ROUTER_PATH + 'admin/crm/participantadmin'} title={DashboardPageTitle.crm_admin_app}><span className="add_access c-colr">P</span><p>Participant Intake</p></Link></li> : (this.state.permissions.access_crm) ? <li><Link to={ROUTER_PATH + 'admin/crm/participantuser'}><span className="add_access c-colr">P</span><p>Participant Intake</p></Link></li> : ''}
                                                    {this.state.permissions.access_finance ? <li><Link to={ROUTER_PATH + 'admin/finance/dashboard'} title={DashboardPageTitle.finance_app}><span className="add_access finance-colr">F</span><p>Finance</p></Link></li> : ''} */}
                                                    {/* <li><Link to={ROUTER_PATH+'admin/helpdesk/enquiries'} title={'Helpdesk'}><span className="add_access helpdesk-colr">H</span><p>Helpdesk</p></Link></li> */}

                                                    {this.state.permissions.access_fms ? <li><Link onClick={()=>this.setPath('admin/fms/dashboard/new/cases',  'fms')} to={ROUTER_PATH + 'admin/fms/dashboard/new/cases'} title={DashboardPageTitle.fms_app}><span className="add_access f-colr">F</span><p>FMS</p></Link></li> : ''}
                                                    {this.state.permissions.access_imail ? <li><Link onClick={()=>this.setPath('admin/imail/dashboard','imail')} to={ROUTER_PATH + 'admin/imail/dashboard'} title={DashboardPageTitle.imail_app}><span className="add_access i-colr">I</span><p>Imail</p></Link></li> : ''}
                                                    {this.state.permissions.access_member ? <li><Link onClick={()=>this.setPath('admin/support_worker/list','member')} to={ROUTER_PATH + 'admin/support_worker/list'} title={DashboardPageTitle.member_app}><span className="add_access m-colr">S</span><p>Support Workers</p></Link></li> : ''}
                                                    {this.state.permissions.access_schedule ? <li><Link onClick={()=>this.setPath('admin/schedule/list','schedule')} to={ROUTER_PATH + 'admin/schedule/list'} title={DashboardPageTitle.schedule_app}><span className="add_access s-colr">S</span><p>Schedule</p></Link></li> : ''}
                                                    {this.state.permissions.access_recruitment ? <li><Link onClick={()=>this.setPath('admin/recruitment/applications','recruitment')} to={ROUTER_PATH + 'admin/recruitment/applications'} title={DashboardPageTitle.recruitment_app}><span className="add_access r-colr">R</span><p>Recruitment</p></Link></li> : ''}
                                                    {this.state.permissions.access_admin ? <li onClick={()=>this.setPath('admin/user/dashboard','admin')}>{pinHtml(this, 'admin', 'dashboard')}</li> : ''}
                                                    {this.state.permissions.access_crm_admin ? <li><Link onClick={()=>this.setPath('admin/crm/leads','crm')} to={ROUTER_PATH + 'admin/crm/leads'} title={DashboardPageTitle.crm_admin_app}><span className="add_access c-colr">I</span><p>Intake</p></Link></li> : (this.state.permissions.access_crm) ? <li><Link to={ROUTER_PATH + 'admin/crm/leads'}><span className="add_access c-colr">I</span><p>Intake</p></Link></li> : ''}
                                                    {this.state.permissions.access_finance ? <li><Link onClick={()=>this.setPath('admin/finance/timesheets','finance')} to={ROUTER_PATH + 'admin/finance/timesheets'} title={DashboardPageTitle.finance_app}><span className="add_access finance-colr">F</span><p>Finance</p></Link></li> : ''}


                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<PinModal
                            color={this.state.color}
                            pinType={this.state.pinType}
                            moduleHed={this.state.moduleHed}
                            modal_show={this.state.pinModalOpen}
                            returnUrl={this.state.returnUrl}
                            closeModal={this.closeModal}
                        />*/}
                    </div>
                </section>

            </div>
        );
    }
}

const mapStateToProps = state => ({
    permissions: state.Permission.AllPermission,
})


const mapDispatchtoProps = (dispach) => {
    return {
        onUpdateMenu: (type, data) => dispach({ type: type, payload: data }),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(AdminDashboard)
