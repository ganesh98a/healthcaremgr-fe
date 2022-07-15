
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { postData, AjaxConfirm, toastMessageShow, css } from 'service/common.js';

import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import { connect } from 'react-redux'
import { get_sales_activity_data, setKeyValue } from "components/admin/crm/actions/SalesActivityAction.jsx"
import { custNumberLine } from 'service/CustomContentLoader.js';
import ReactPlaceholder from 'react-placeholder';
import { handleShareholderNameChange } from '../../../service/common';
import EmailActivityLogDetail from './EmailActivityLogDetail.jsx';
import _ from 'lodash';
import { getRelatedTypeReturnUrl } from '../oncallui-react-framework/services/common.js';
import { getNotesTypes } from '../recruitment/RecruitmentCommon';
import SMSActivityLogDetail from './SMSActivityLogDetail.jsx';

class ActivityTimelineComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        if (window.location.href.indexOf("leads") > -1) {
            this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });

        } else {
            this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });
        }
    }

    componentDidUpdate(locationProps) {
        if (window.location.href.indexOf("leads") > -1 ||
            window.location.href.indexOf("contacts") > -1) {
            if (locationProps.prevProps != "") {
                if (locationProps.prevProps !== window.location.pathname) {
                    this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });

                }
            }
        }
    }

    expandDetails = (activity) => {
        var activity_timeline = this.props.activity_timeline;
        let activities = activity_timeline.map((act, i) => {
            if (act.activity_id === activity.activity_id) {
                act.is_open = !act.is_open;
                activity_timeline[i]=act;
            }
        });
        activity_timeline = JSON.parse(JSON.stringify(activity_timeline))

        this.props.setKeyValue({ activity_timeline: activity_timeline })
    }

    markCompleteTask = (val) => {
        const msg = `Are you sure you want to complete this Task?`
        const confirmButton = `Confirm`

        AjaxConfirm({ task_id: val.task_details.task_id }, msg, `sales/Contact/complete_task`, { confirm: confirmButton, heading_title: `Confirmation` }).then(result => {
            if (result.status) {
                this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type, opp_id: this.props.opp_id, lead_id: this.props.lead_id });


            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }

        })
    }

    activityIconReturn = (activity_type) => {
        var icon_url = '';
        switch(Number(activity_type)) {
            case 1:
                icon_url = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#task";
                break;
            case 2:
                icon_url = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#email";
                break;
            case 3:
                icon_url = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#log_a_call";
                break;
            case 4:
                icon_url = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#note";
                break;
            case 5:
                icon_url = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#sms";
                break;
            default:
                break; 
        }
        return icon_url;
    }

    renderActivities = (activity_timeline) => {
        let log_type = [
            '',
            'task',
            'email',
            'call',
            'event'
        ];

        let log_type_line = [
            '',
            'task',
            'email',
            'log-a-call',
            'event'
        ];
        let nt_options = getNotesTypes(true);
        return (
            <ul className="slds-timeline">
                {activity_timeline && activity_timeline.length > 0 ?
                    activity_timeline.map((val, index) => {
                        let title = val.title || nt_options[val.note_type];
                        let comments = val.comment;
                        let comment_lines = [];
                        if ( comments && comments.includes("\n")) {
                            comment_lines = comments.split("\n");
                        } else {
                            comment_lines.push(comments);
                        }
                        if (title && title.includes("SMS SMS")) {
                            title = title.replace("SMS SMS", "SMS");
                        }
                        return (
                        <li key={index + 1}>
                            <div className={"slds-timeline__item_expandable slds-timeline__item_" + (log_type[val.activity_type] ? log_type[val.activity_type] : 'task') + " " + (val.is_open ? "slds-is-open" : "")}>
                                <span className="slds-assistive-text">{
                                    (log_type[val.activity_type] ? log_type[val.activity_type] : 'task')
                                }</span>
                                <div className="slds-media">
                                    <div className="slds-media__figure">
                                        <button className="slds-button slds-button_icon" onClick={() => this.expandDetails(val)} title={"Expand Details"} aria-controls="task-item-base">
                                            <svg className="slds-button__icon slds-timeline__details-action-icon" aria-hidden="true">
                                                <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#switch"></use>
                                            </svg>
                                        </button>
                                        <div className={"slds-icon_container slds-icon-standard-" + (log_type_line[val.activity_type] ? log_type_line[val.activity_type] : 'task') + " slds-timeline__icon"} title="task">
                                            <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                                <use href={this.activityIconReturn(val.activity_type)}></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="slds-media__body">
                                        <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                                            <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                                {val.activity_type == 1 ?
                                                    <div className="slds-checkbox">
                                                        <input type="checkbox" name="complete_task" onChange={(e) => this.markCompleteTask(val)} disabled={val.task_details.task_status == 1 ? true : false} checked={val.task_details.task_status == 1 ? true : false} id={"task_complete" + index} value="1" />
                                                        <label className="slds-checkbox__label" htmlFor={"task_complete" + index} style={{ marginBottom: "0px" }} title={val.task_details.task_status == 0 ? "Mark as complete" : "Task complated"}>
                                                            <span className="slds-checkbox_faux"></span>
                                                            <span className="slds-form-element__label slds-assistive-text">{val.task_details.task_status == 0 ? "Mark as Complete" : "Task complated"}</span>
                                                        </label>
                                                    </div> : ""}
                                                <h3 className="slds-truncate" title={title}>
                                                    <a  onClick={() => this.expandDetails(val)} href="javascript:void(0);">
                                                        <strong>{title}</strong>
                                                    </a>
                                                </h3>
                                            </div>
                                            <div className="slds-timeline__actions slds-timeline__actions_inline">
                                                <p className="slds-timeline__date">{moment(val.created).format("LT")} | {moment(val.created).format("DD/MM/YYYY")}</p>
                                                {/* <button className="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" aria-haspopup="true" >
                                                    <svg className="slds-button__icon" aria-hidden="true">
                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#down"></use>
                                                    </svg>
                                                </button> */}
                                            </div>
                                        </div>
                                        {Number(val.is_single_sms) === 1 ? 
                                            (<p className={"slds-m-horizontal_xx-small slds-timeline__item_details "+(val.is_open ? "" : "slds-truncate")}>
                                            {comment_lines.map(cmt => cmt && <p>{cmt}</p> || <br />)}
                                        </p>) 
                                        : 
                                        (<p className="slds-m-horizontal_xx-small">
                                            {val.description}
                                        </p>)
                                        }                                        

                                        {val.activity_type == 1 ?
                                            <TaskDetails {...val.task_details} applicant_id={this.props.applicant_id ? this.props.applicant_id :  val.applicant_id}/>
                                            : ""}

                                        {val.activity_type == 2 ?
                                            <EmailActivityLogDetail {...val} {...val.email_details} applicant_id={this.props.applicant_id ? this.props.applicant_id :  val.applicant_id}/>
                                            : ""}

                                        {val.activity_type == 3 ?
                                            <CallLogDetails {...val} applicant_id={this.props.applicant_id ? this.props.applicant_id :  val.applicant_id}/>
                                            : ""}
                                        {val.activity_type == 4 ?
                                          <NotesDetails {...val} applicant_id={this.props.applicant_id ? this.props.applicant_id :  val.applicant_id}/>
                                          : ""}
                                        {val.activity_type == 5 && Number(val.is_single_sms) === 0 ?
                                            <SMSActivityLogDetail {...val} {...val.sms_details} applicant_id={this.props.applicant_id ? this.props.applicant_id :  val.applicant_id}/>
                                            : ""}
                                    </div>
                                </div>
                            </div>
                        </li>
                    )}) :
                    <li >
                        <div className="">
                            <span className="slds-assistive-text"></span>
                            <div className="slds-media">
                                <div className="slds-media__body">
                                    <div className="">
                                        <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                            <h3 className="slds-truncate" >
                                                <strong>No Activity</strong>
                                            </h3>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </li>
                }
            </ul>
        )
    }

    renderMonthwiseActivities(completedActivities) {
        let acts = [];
        for (const mnth in completedActivities) {
        acts.push(
            <div id={mnth} className="slds-section  slds-is-open">
            <h3 className="slds-section__title">
                <button onClick={()=>this.toggleSection(mnth)} aria-controls={`${mnth}-activities`} aria-expanded="true" className="slds-button slds-section__title-action">
                    <svg className="slds-section__title-action-icon slds-button__icon slds-button__icon_left" aria-hidden="true">
                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#switch"></use>
                    </svg>
                    <span className="slds-truncate" title="Section Title">{mnth}</span>
                </button>
            </h3>
            <div className="slds-section__content" id={`${mnth}-activities`}>
            {
                this.renderActivities(completedActivities[mnth])
            }
            </div>
        </div>
        );
        }
        return acts;
    }

    toggleSection(sectionId) {
        let section = document.getElementById(sectionId);
        if (section) {
            section.classList.contains('slds-is-open')? section.classList.remove('slds-is-open') : section.classList.add('slds-is-open');
        }
    }


    render() {
        let groupedActivities = [];
        let monthWiseActivities = [];
        if (this.props.activity_timeline) {
            groupedActivities = _.groupBy(this.props.activity_timeline, function (item) {
                let task_status = item.task_details && item.task_details.task_status;
                //if activity is not completed and due date is in past or not set
                if (item.task_details && parseInt(task_status) !== 1) {
                    return "upcoming";
                }
                return "completed";
            });
            if (groupedActivities.completed) {
                monthWiseActivities = _.groupBy(groupedActivities.completed, function (item) {
                    if (!item.task_details)
                        return moment(item.created).format("MMMM YYYY");
                    else {
                        let updated_at = "";
                        if (item.task_details.task_status == 1) {
                            updated_at = item['task_details']['updated_at'];
                        } else {
                            updated_at = item['task_details']['due_date'];
                        }
                        return moment(updated_at, "DD-MM-YYYY").format("MMMM YYYY");
                    }
                });
            }
        }
        return (
            <React.Fragment>
                <div className="">
                    <ReactPlaceholder showLoadingAnimation type='textRow' customPlaceholder={custNumberLine(4)} ready={!this.props.activity_loading}>
                    <div className="slds-tab-overflow-x">
                        <div id="upcoming-section" className="slds-section  slds-is-open">
                            <h3 className="slds-section__title">
                                <button onClick={()=>this.toggleSection("upcoming-section")} aria-controls="upcoming-acts" aria-expanded="true" className="slds-button slds-section__title-action">
                                    <svg className="slds-section__title-action-icon slds-button__icon slds-button__icon_left" aria-hidden="true">
                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#switch"></use>
                                    </svg>
                                    <span className="slds-truncate" title="Section Title">Upcoming &amp; Overdue</span>
                                </button>
                            </h3>
                            <div className="slds-section__content" id="upcoming-acts">
                            {
                                this.renderActivities(groupedActivities.upcoming)
                            }
                            </div>
                        </div>
                        {
                            monthWiseActivities && this.renderMonthwiseActivities(monthWiseActivities)
                        }
                    </div>
                    </ReactPlaceholder>
                </div>
            </React.Fragment >
        );
    }
}

const mapStateToProps = state => ({
    activity_timeline: state.SalesActivityReducer.activity_timeline,
    activity_loading: state.SalesActivityReducer.activity_loading,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_sales_activity_data: (request) => dispatch(get_sales_activity_data(request)),
        setKeyValue: (request) => dispatch(setKeyValue(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ActivityTimelineComponent);

class TaskDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        var related_to_url = getRelatedTypeReturnUrl(this.props.related_type, this.props.related_to, this.props.applicant_id);        
        
        var name_url = '#'
        if(!this.props.crm_participant_id && this.props.lead_id){
            name_url = '/admin/crm/leads/' + this.props.lead_id;
        }else{
            name_url = '/admin/crm/contact/details/' + this.props.crm_participant_id;
        }        

        return (
            <React.Fragment>
                <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium" id="task-item-expanded" aria-hidden="false">
                    <ul className="slds-list_horizontal slds-wrap">
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Task Name</span>
                            <span className="slds-text-body_medium slds-truncate" >{this.props.task_name || "N/A"}</span>
                        </li>
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Due Date</span>
                            <span className="slds-text-body_medium slds-truncate" >{this.props.due_date}</span>
                        </li>

                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Name</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.contact_name}>
                                {
                                    (this.props.contact_name)?
                                <Link to={name_url}>{this.props.contact_name}</Link>
                                : <span>{"N/A"}</span>
                                }
                            </span>
                        </li>
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Related To</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.related_to_label}>
                                <Link to={related_to_url}>{this.props.related_to_label}</Link>
                            </span>
                        </li>

                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Assign To</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.assign_to}>
                            <Link to={"#"}>{this.props.assign_to || "N/A"}</Link>
                            </span>
                        </li>
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Status</span>
                            <span className="slds-text-body_medium slds-truncate" >
                                {this.props.status_label || "N/A"}
                            </span>
                        </li>

                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Priority</span>
                            <span className="slds-text-body_medium slds-truncate" >
                                {this.props.priority || "N/A"}
                            </span>
                        </li>
                    </ul>

                </article>
            </React.Fragment >
        );
    }
}

class CallLogDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        var related_to_url = getRelatedTypeReturnUrl(this.props.related_type, this.props.related_to, this.props.applicant_id); 
        
        var name_url = '#'
        if(!this.props.contactId && this.props.lead_id){
            name_url = '/admin/crm/leads/' + this.props.lead_id;
        }else{
            name_url = '/admin/crm/contact/details/' + this.props.contactId;
        }

        return (
            <React.Fragment>
                <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium" id="task-item-expanded" aria-hidden="false">
                    <ul className="slds-list_horizontal slds-wrap">
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Subject</span>
                            <span className="slds-text-body_medium slds-truncate" >{this.props.subject || "N/A"}</span>
                        </li>
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Name</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.contact_name}>
                                {
                                    (this.props.contact_name)?
                                <Link to={name_url}>{this.props.contact_name}</Link>
                                : <span>{"N/A"}</span>
                                }
                            </span>
                        </li>

                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Related To</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.related_to_label}>
                                <Link to={related_to_url}>{this.props.related_to_label}</Link>
                            </span>
                        </li>
                    </ul>
                    <div>
                        <span className="slds-text-title">Description</span>
                        <p className="slds-p-top_x-small">{this.props.comment}</p>
                    </div>
                </article>
            </React.Fragment >
        );
    }
}

class NotesDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        var related_to_url =getRelatedTypeReturnUrl(this.props.related_type, this.props.related_to, this.props.applicant_id);        
        
        var name_url = '#'
        if(!this.props.contactId && this.props.lead_id){
            name_url = '/admin/crm/leads/' + this.props.lead_id;
        }else{
            name_url = '/admin/crm/contact/details/' + this.props.contactId;
        }
        let nt_options = getNotesTypes(true);
        return (
            <React.Fragment>
                <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium" id="task-item-expanded" aria-hidden="false">
                    <ul className="slds-list_horizontal slds-wrap">
                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">{this.props.related_type == "8" && "Note Type" || "Title"}</span>
                            <span className="slds-text-body_medium slds-truncate" >{this.props.related_type == "8" && nt_options[this.props.note_type] || this.props.subject || "N/A"}</span>
                        </li>

                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Related To</span>
                            <span className="slds-text-body_medium slds-truncate" title={this.props.related_to_label}>
                                <Link to={related_to_url}>{this.props.related_to_label}</Link>
                            </span>
                        </li>

                        <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small">Description</span>
                            <span className="slds-text-body_medium slds-truncate" >{this.props.comment}</span>
                        </li>

                        {this.props.confidential==1&&( <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                            <span className="slds-text-title slds-p-bottom_x-small" style={{'fontWeight': 700}}>Confidential</span>
                        </li>)}
                    </ul>
                </article>
            </React.Fragment >
        );
    }
}