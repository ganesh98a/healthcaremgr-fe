import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { showArchiveGoalModal, openAddEditGoalModal } from '../ItemCommon';
import {
    IconSettings,
    PageHeaderControl,
    ButtonGroup,
    Button,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
    Card,
    MediaObject,
    Dropdown
} from '@salesforce/design-system-react';

/**
 * Class: ParticipantGoals
 */
class ParticipantGoals extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            participant_id: this.props.participant_id ? this.props.participant_id : '',
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
    get_participant_goals = (id) => {
        var Request = { id: this.state.participant_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
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
        showArchiveGoalModal(goal_id, this.get_participant_goals);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.participant_id) {
            this.get_participant_goals();
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
            this.get_participant_goals();
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
                <Link to={ROUTER_PATH + `admin/item/goals/${this.state.participant_id}`} className="pt-2 slds-align_absolute-center default-underlined" title="View all participant goals" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        // return
        return (
            <React.Fragment>
                <Card
                headerActions={<Button label="New" onClick={e => this.showModal()} />}
                heading={"Goals ("+ this.state.goals_count +")"}
                className="slds-card-bor"
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
                                        <h3 className="slds-tile__title slds-truncate" title={value.goal}>
                                            <Link to={`/admin/item/goals/details/${value.id}`} style={{color:'rgb(0, 112, 210)'}}>{value.goal}</Link>
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
                                        <dt className="slds-item_label slds-text-color_weak slds-truncate" title="First Label">Service Type:</dt>
                                            <dd className="slds-item_detail slds-truncate" title="service_type">{value.service_type}</dd>
                                            <dt className="slds-item_label slds-text-color_weak slds-truncate" title="Second Label">Start Date:</dt>
                                            <dd className="slds-item_detail slds-truncate" title="start_date">{moment(value.start_date).format("DD/MM/YYYY")}</dd>
                                            <dt className="slds-item_label slds-text-color_weak slds-truncate" title="Third Label">End Date:</dt>
                                            <dd className="slds-item_detail slds-truncate" title="end_date">{moment(value.end_date).format("DD/MM/YYYY")}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </article>
                            </li>
                        )) : ''}
                    </ul >
                </div > ) : ''}
                </Card>
                {openAddEditGoalModal(this.state.goal_id, this.state.participant_id, this.state.openCreateModal, this.closeAddEditGoalModal,true)}
            </React.Fragment>
        )
    }
}

// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
// Get the page title and type from reducer
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantGoals);
