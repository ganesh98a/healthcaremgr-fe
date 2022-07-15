
import React, { Component } from 'react';
import _ from 'lodash'
import jQuery from 'jquery'
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { postData, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { ROUTER_PATH } from '../../../../../config.js';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import { showArchiveGoalModal, openAddEditGoalModal } from '../../ItemCommon';

class ViewGoal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        let is_service_agreement_goal=false;
        if(props.sa_goal)
        {
            is_service_agreement_goal=true;
        }
        this.state = {
            openCreateModal: false,
            role_details: [],
            participant: [],
            goal_id: props.match.params.id ? props.match.params.id : '',
            is_service_agreement_goal:is_service_agreement_goal,
            is_goal_archived:0,
        }

        this.rootRef = React.createRef()
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')

        var goal_id = this.props.match.params.id;
        this.get_goal_details(goal_id);
    }

    /**
     * Not in use?
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * fetching the goal details
     */
    get_goal_details = (id) => {
        postData('item/Goals/get_goal_details', { id ,is_sa:this.state.is_service_agreement_goal}).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Close the modal when user save the goals and refresh the table
     */
    closeAddEditGoalModal = (status) => {
        this.setState({openCreateModal: false});
        var goal_id = this.props.match.params.id;
        this.get_goal_details(goal_id);
    }

    /**
     * Open create goals modal
     */
    showModal(goal_id) {
        this.setState({ openCreateModal: true });
    }

    /**
     * display archive goal modal
     */
    showArchiveModal() {
        showArchiveGoalModal(this.state.goal_id, this.closeArchiveModal);
    }

    /**
     * close and redirect after archiving goal
     */
    closeArchiveModal = () => {
        this.setState({ redirectTo: ROUTER_PATH + `admin/item/goals/details/` });
    }

    /**
     * Rendering buttons of the header
     */
    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" disabled={this.state.is_goal_archived>0} onClick={() => this.showModal() } />
                    <Button label="Delete"  disabled={this.state.is_goal_archived>0}  onClick={() => this.showArchiveModal()} />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );

    /**
     * Formats date to` DD/MM/YYYY` (eg `10/06/2020`) 
     * or else display `N/A`
     * 
     * @param {string} dateStrYmdHis 
     * @param {string} defaultDate 
     * @param {string} displayFormat 
     */
    formatDate(dateStrYmdHis, defaultDate = `N/A`, displayFormat = 'DD/MM/YYYY') {
        if (!dateStrYmdHis) {
            return defaultDate
        }

        return moment(dateStrYmdHis).isValid() ?
            moment(dateStrYmdHis).format(displayFormat) :
            defaultDate
    }

    /**
     * Renders the details tab
     */
    renderDetailsTab() {
        const styles = css({
            root: {
                border: 'none',
                paddingTop: 0,
            },
            heading: {
                marginBottom: 15,
                marginTop: 8,
            },
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
            },
            col: {
                marginBottom: 15,
            },
            hr: { marginTop: 20, marginBottom: 20, border: 0, borderTop: '1px solid #eee', width: 'auto' },
            ul: { listStyleType: 'disc', paddingLeft: 40 },
        })

        const notAvailable = 'N/A' // this.props.notAvailable

        const details = [
            {
                label: 'Participant',
                value: this.state.participant.label || 'N/A',
            },
            {
                label: 'Service Type',
                value: this.state.service_type || 'N/A',
            },
            {
                label: 'Goal',
                value: this.state.goal || 'N/A',
            },
            {
                label: 'Start Date',
                title: this.formatDate(this.state.start_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.start_date),
            },
            {
                label: 'End Date',
                title: this.formatDate(this.state.end_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.end_date),
            },
        ]


        return (
            <div className="row slds-box" style={styles.root}>
                {
                    details.map((detail, i) => {
                        return (
                            <div key={i} className="col col-sm-6" style={styles.col}>
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">{detail.label}</label>
                                    <div className="slds-form-element__control" title={detail.title}>
                                        {detail.value || notAvailable}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
                <div className="col col-sm-12" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Objective</label>
                        <div className="slds-form-element__control" title="Objective">
                            {this.state.objective || notAvailable}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /**
     * rendering components
     */
    render() {

        // This will only run when you archive
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        var details = "";

        return (
            <React.Fragment>
                <div className="slds-grid slds-grid_vertical slds" ref={this.rootRef} style={{ "fontFamily": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "fontSize": "13px" }}>
                    <div className="slds-col custom_page_header">

                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    <Icon
                                        assistiveText={{
                                            label: 'Goals',
                                        }}
                                        category="standard"
                                        name="goals"
                                        style={{
                                            backgroundColor: '#56aadf',
                                            fill: '#ffffff',
                                        }}
                                        title="Goal"
                                    />
                                }
                                label="Goals"
                                onRenderActions={this.actions}
                                title={this.state.goal}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <div className="slds-col ">
                        <div className="slds-grid slds-wrap slds-gutters_x-small">
                            <div className="slds-col slds-m-top_medium ">
                                <div className="white_bg_color slds-box ">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <Tabs id="tabs-example-default">
                                            <TabsPanel label="Details">
                                                {this.renderDetailsTab()}
                                            </TabsPanel >
                                        </Tabs >
                                    </IconSettings >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {openAddEditGoalModal(this.state.goal_id, this.state.participant_id, this.state.openCreateModal, this.closeAddEditGoalModal)}
            </React.Fragment >
        );
    }
}

export default ViewGoal;