import React from 'react';
import { ROUTER_PATH, BASE_URL } from '../../../config.js';
import { itemJson } from 'menujson/item_menu_json';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { css } from '../../../service/common.js';
import Sidebar from '../Sidebar';
import ListDocument from './document/ListDocument.jsx';
import ViewDocument from './document/view/DocumentDetails.jsx';
import ListParticipant from './participant/ListParticipant.jsx';
import ViewParticipant from './participant/view/ParticipantDetails.jsx';
import ParticipantMembersList from './participant/ParticipantMembersList.jsx';
import ViewParticipantLocation from './participant/view/location/ListLocation';
import ListMemberRoles from './member/view/role/ListMemberRoles';
import ViewParticipantLocationDetails from './participant/view/location/LocationDetails';
import ListRole from './role/ListRole.jsx';
import ViewRole from './role/View/ViewRole.jsx';
import ViewGoal from './goals/view/ViewGoal.jsx';
import ReferenceDataList from '../recruitment/reference_data/ReferenceDataList.jsx';
import ParticipantDocumentList from './participant/ParticipantDocumentList.jsx'
import CreateReferenceData from '../recruitment/reference_data/CreateReferenceData';

import ListRoleDocuments from './role/ListRoleDocuments';
import ListDocumentRoles from './document/ListDocumentRoles';
import { ItemMenu } from '../GlobalMenu.jsx';
import PageNotFound from '../PageNotFound';
import ListGoals from './goals/ListGoals.jsx';

import PageTypeChange from '../recruitment/PageTypeChange';
import TemplateListing from '../imail/TemplateListing';
import ListingSmsTemplate from '../sms/templates/ListSmsTemplate';
import ParticipantNeedAssessmentList from './participant/ParticipantNeedAssessmentList';
import ParticipantRiskAssessment from './participant/ParticipantRiskAssessment.jsx';
import ParticipantRiskAssessmentList from './participant/ParticipantRiskAssessmentList.jsx';
import UpdateSafteyChecklist from '../crm/pages/opportunity/UpdateSafteyChecklist.jsx';

import PartipantShiftList from '../item/participant/shift/ParticipantShiftList';
import ViewAllTrackedGoals from './participant/view/ViewAllTrackedGoals.jsx';
import ListParticipantSADocuments from './participant/view/ListParticipantSADocuments';

const menuJson = () => {
    let menu = itemJson;
    return menu;
}

class AppItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menus: menuJson(),
            showMobNav: false
        }
        //console.log('sdds',this.permission);
    }

    /**
     * Renders submenus of helpdesk module on the left sidebar.
     * Submenus will only show when browsing this module
     */
    renderItemModuleMenus() {
        return (
            <ItemMenu>
                <Sidebar
                    heading={'Item'}
                    menus={this.state.menus}
                    subMenuShowStatus={this.state.subMenuShowStatus}
                    // replacePropsData={this.state.replaceData}
                    renderMenusOnly
                />
            </ItemMenu>
        )
    }


    render() {
        const styles = css({
            asideSect__: {
              background: 'none',
              paddingLeft: 'initial',
            }
          })
        return (
            <React.Fragment>
                <div className='bodyNormal Helpdesk_M'>
                    <section className={'asideSect__ ' + (this.state.showMobNav ? 'open_left_menu' : '')}  style={styles.asideSect__}>
                        { this.renderItemModuleMenus() }
                        <div className='bodyNormal Crm' >
                            <div className={this.state.loadState ? 'Rloader' : ''}></div>
                            <div className="container-fluid fixed_size">
                                <div className="row justify-content-center d-flex">

                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <Switch>
                                        <Route exact path={ROUTER_PATH + 'admin/item/'} render={() => <Redirect to={ROUTER_PATH + 'admin/item/document'} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/document'} render={(props) => <ListDocument pageTypeParms='Documents' props={props}  />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/document/details/:id'} render={(props) => <ViewDocument {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/document/details/:id/roles'} render={(props) => <ListDocumentRoles {...props} key={props.match.params.id} />} />
                                        
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant'} render={(props) => <ListParticipant pageTypeParms='Participants' props={props}  />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/details/:id'} render={(props) => <ViewParticipant {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/support_worker/:id'} render={(props) => <ParticipantMembersList {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/locations/:id'} render={(props) => <ViewParticipantLocation {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/document/:id(\\d+)'} render={(props) => <ParticipantDocumentList {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/locations/details/:id'} render={(props) => <ViewParticipantLocationDetails {...props} />} />

                                        <Route exact path={ROUTER_PATH + 'admin/item/member/roles/:id'} render={(props) => <ListMemberRoles {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/role'} render={(props) => <ListRole pageTypeParms='Role' props={props}  />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/role/details/:id'} render={(props) => <ViewRole {...props} key={props.match.params.id} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/role/details/:id/documents'} render={(props) => <ListRoleDocuments {...props} key={props.match.params.id} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/goals'} render={(props) => <ListGoals pageTypeParms='Goals' props={props}  />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/goals/:id'} render={(props) => <ListGoals {...props} key={props.match.params.id} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/goals/details/:id'} render={(props) => <ViewGoal {...props} />} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/serviceagreement/goals/:id'} render={(props) => <ListGoals {...props} key={props.match.params.id} sa_goal={true}/>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/trackedgoals/:id'} render={(props) => <ViewAllTrackedGoals {...props} key={props.match.params.id}/>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/serviceagreement/goals/details/:id'} render={(props) => <ViewGoal {...props} sa_goal={true}/>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/reference_data'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='reference_data_list_title'/><ReferenceDataList props={props} /> </React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/create_reference_data'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='create_reference_data_title'/><CreateReferenceData props={props} /> </React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/email_templates'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='create_reference_data_title'/><TemplateListing props={props} /> </React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/sms_templates'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='create_reference_data_title'/><ListingSmsTemplate props={props} /> </React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/need_assesments/:participant_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='create_reference_data_title'/><ParticipantNeedAssessmentList {...props} /></React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/risk_assesments/:participant_id'} render={(props) => <React.Fragment><PageTypeChange pageTypeParms='create_reference_data_title'/><ParticipantRiskAssessmentList {...props} /></React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/opportunity/safetychecklist/:opportunity_id'} render={(props) => <React.Fragment><UpdateSafteyChecklist {...props} /> </React.Fragment>} />

                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/shift/:id'} render={(props) => <React.Fragment><PartipantShiftList {...props} key={props.match.params.id} /></React.Fragment>}/>

                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/sadocuments/:id'} render={(props) => <React.Fragment><ListParticipantSADocuments {...props} key={props.match.params.id} /></React.Fragment>} />
                                        <Route exact path={ROUTER_PATH + 'admin/item/participant/safetychecklist/:participant_id'} render={(props) => <React.Fragment><UpdateSafteyChecklist {...props} /> </React.Fragment>} />
                                        <Route path='*' component={PageNotFound}  />

                                    </Switch>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </React.Fragment>
        )
    }
}

export default AppItem;