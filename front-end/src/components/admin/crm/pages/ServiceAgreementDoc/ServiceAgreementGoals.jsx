import '../../../scss/components/admin/crm/pages/contact/ListContact.scss';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { Button, Card, Dropdown, Icon } from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import jQuery from 'jquery';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import { css, postData, toastMessageShow } from 'service/common.js';

import { openAddEditGoalModal, showArchiveGoalModal } from '../../../item/ItemCommon';

/**
 * Class: ParticipantGoals
 */
class ServiceAgreementGoals extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            service_agreement_id: this.props.related_service_agreement_id ?this.props.related_service_agreement_id   : '',
            goal_id: '',
            goals: [],
            goals_count: 0,
            searchVal: '',
            filterVal: '',
            filter_status: 'all',
            openEditModal: false,
            openCreateModal: false,
            pageSize: 3,
            page: 0,
            sorted: [],
            filtered: []
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
        console.log(this.props);
    }

    /**
     * fetching the participant goals
     */
    get_service_agreement_goals = (id) => {
        var Request = { id: this.props.related_service_agreement_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered ,is_sa:true};
        postData('item/Goals/get_goals_list', Request).then((result) => {
            if (result.status) {
                this.setState({goals: result.data, goals_count: result.count});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Open create goals modal
     */
    showModal(goal_id) {
        this.setState({ openCreateModal: true, goal_id: goal_id });
    }

    /**
     * Open archive goal modal
     */
    showArchiveModal(goal_id) {
        showArchiveGoalModal(goal_id, this.get_service_agreement_goals);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.service_agreement_id) {
            this.get_service_agreement_goals();
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Close the modal when user save the goals and refresh the table
     */
    closeAddEditGoalModal = (status, goalsId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_service_agreement_goals();
        }
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.goals_count == 0) {
            return <React.Fragment />
        }

        return (            
            <React.Fragment>
                <Link to={ROUTER_PATH + `admin/item/serviceagreement/goals/${this.state.service_agreement_id}`}
                 className="pt-2 slds-align_absolute-center default-underlined" 
                title="View all goals" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        return (
            <React.Fragment>
                    <div className=" slds-m-top_medium">
                <div className="slds-grid slds-grid_vertical">
                <Card
                headerActions={<Button label="New" onClick={e => this.showModal()} />}
                heading={"Goals ("+ this.state.goals_count +")"}
                className="slds-card-bor"
                style={styles.card}
                icon={<Icon category="standard" name="goals" size="small" />}
                footer={this.renderFooter()}
                >
                {(this.state.goals.length > 0) ? (
                <div className="slds-card__body slds-card__body_inner">
                    <ul className="slds-grid slds-wrap slds-grid_pull-padded">
                        {(this.state.goals.length > 0) ?
                        this.state.goals.map((value, idx) => (
                            <li className="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3" key={idx}>
                            <article className="slds-tile slds-media slds-card__tile slds-hint-parent">
                                <div className="slds-media__figure">
                                {<Icon category="standard" name="goals" size="small" />}
                                </div>
                                <div className="slds-media__body">
                                    <div className="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                                        <h3 className="slds-tile__title slds-truncate" title="asdsad">
                                            <Link to={`/admin/item/goals/details/${value.id}`}>{value.goal}</Link>
                                        </h3>
                                        <div className="slds-shrink-none">
                                            <Dropdown
                                                align="right"
                                                assistiveText={{ icon: 'More Options' }}
                                                buttonVariant="icon"
                                                iconCategory="utility"
                                                iconName="down"
                                                iconVariant="border-filled"
                                                iconSize="x-small"
                                                onSelect={(e) => {
                                                    if(e.value == 1){ //edit
                                                        this.showModal(value.id)
                                                    }
                                                    else { // delete
                                                        this.showArchiveModal(value.id)
                                                    }
                                                }}
                                                openOn="click"
                                                options={[
                                                    { label: 'Edit', value: '1' },
                                                    { label: 'Delete', value: '2' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="slds-tile__detail">
                                        <dl className="slds-list_horizontal slds-wrap">
                                            <dt className="slds-item_label slds-text-color_weak slds-truncate" title="First Label">Start Date:</dt>
                                            <dd className="slds-item_detail slds-truncate" title="Role">{moment(value.start_date).format("DD/MM/YYYY")}</dd>
                                            <dt className="slds-item_label slds-text-color_weak slds-truncate" title="Second Label">End Date:</dt>
                                            <dd className="slds-item_detail slds-truncate" title="Email">{moment(value.end_date).format("DD/MM/YYYY")}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </article>
                            </li>
                        )) : ''}
                    </ul >
                </div > ) : ''}
                </Card>
                </div>
                </div>
                {openAddEditGoalModal(this.state.goal_id, '', this.state.openCreateModal, this.closeAddEditGoalModal,false,this.props.related_service_agreement_id,this.props.service_type,this.props.plan_start_date,this.props.plan_end_date)}
            </React.Fragment>
        )
    }
}

// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}


export default ServiceAgreementGoals;
