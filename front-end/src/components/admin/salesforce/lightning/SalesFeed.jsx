import React from 'react'
import moment from 'moment';
import _ from 'lodash';
import { postData, toastMessageShow, handleChange } from 'service/common.js';
import { IconSettings, Button, Icon, Popover } from '@salesforce/design-system-react';
import titleCase from '../../oncallui-react-framework/helpers/title_case.js';
import convertTitle from '../../oncallui-react-framework/helpers/convert_title.js';
import '../../scss/feed.scss';
import { get_related_type } from '../../crm/actions/FeedAction.jsx';
import {  OverlayTrigger,  Tooltip } from 'react-bootstrap';
import ViewTemplate from '../../imail/templates/ViewTemplate';
// i.e.  [Page] -> Opportunity, Lead, Service Agreement [Tab] -> Feed [Generic Component]

class SalesFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            items: this.props.items,
            expanded: {},
            feed_title: '',
            sourceId: this.props.sourceId,
            relatedType: this.props.relatedType,
            isViewOpen: false,
            viewData: ''
        }
        this.field_labels = {
            firstname: "First Name",
            lastname: "Last Name",
            lead_topic: "Topic",
            lead_company: "Referring Organization (if applicable)",
            lead_description: "Description",
            lead_status: "Status",
            lead_source_code: "Lead Source",
            lead_owner: "Assigned To",
            referrer_firstname: "Referrer First Name",
            referrer_lastname: "Referrer Last Name",
            referrer_email: "Referrer Email",
            referrer_phone: "Referrer Phone",
            referrer_relation: "Referrer Relationship to Participant",
            //interview fields
            interview_start_datetime: "Start Date",
            interview_end_datetime: "End Date",
            location_id: "Location",
            interview_type_id: "About",
            invite_type: "Invite Type",
            max_applicant: "Max Applicant",
            form_id: "Quiz Template",
            meeting_link: "Meeting Link",            
            job_transfer: "Job Transfer",
            //FMS-Feed back
            alert_type: "Alert Type",
            feedback_type: "Feedback Type",
            Initiator_first_name: "Initiator First name",
            Initiator_last_name: "Initiator Last name",
            Initiator_email: "Initiator Email",
            Initiator_phone: "Initiator Phone",
            department_id: "Department",
            categoryId: "Feedback category",
            assigned_to: "AssignedTo",
            against_category: "Against Category",
            against_by: "Against Details",
            event_date: "Event Date",
            initiated_type:"Initiator Category",
            initiated_by: "Initiator Details",
            against_first_name: "Against first name",
            against_last_name: "Against last name",
            against_email: "Against email",
            against_phone: "Against phone",
            notify_email: "Notification sent to",
            notes_reason: "Notes Reason",
            oa_status: 'Online Assessment Status',
            oa_start_date_time: 'Start Time',
            oa_completed_date_time: 'End Time',

        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.toggleDetail = this.toggleDetail.bind(this);
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
        this.render = this.render.bind(this);
        this.renderTitle = this.renderTitle.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.getLifecycleEventType = this.getLifecycleEventType.bind(this);
    }

    componentDidMount() {
        // get related type - api call through feed action
        get_related_type(
        { 
            related: this.props.relatedType
        }).then(result => {
            if (result) {
                if (result.related_type) {
                    var related_type = result.related_type;
                    this.setState({ relatedType: related_type });
                }
            }
        })
    }
    /**
     * Toggle details expand feed - update state value
     * @param {int} key 
     */
    toggleDetail(key) {
        var items = this.state.items;
        items[key][0].expanded = !items[key][0].expanded;       
        this.setState({ items: items});
    }

    titleCase(label) {
        if (this.field_labels[label]) {
            return this.field_labels[label];
        }
        return titleCase(label);
    }

    /**
     * Call toggle details for expand
     * @param {int} key 
     */
    expand(key) {
        this.toggleDetail(key, true);
    }

    /**
     * Call toggle details for minimize
     * @param {int} key 
     */
    collapse(key) {
        this.toggleDetail(key, false);
    }

    /**
     * ShowDetails - view feed changes
     * @param {int} key 
     */
    shouldShowDetail(key) {
        return this.state.items[key][0].expanded ? 'block' : 'none'
    }

    /**
     * Get feed field type - updated, converted, etc..
     * @param {array} item 
     */
    getLifecycleEventType(item) {
        if (item.length == 1 && item[0].field == 'created') return 'created';
        if (item.length == 1 && item[0].field == 'converted') return 'converted';
        return 'updated';
    }

    /**
     * Handle comment change event
     * @param {object} obj 
     * @param {str} val 
     * @param {int} index 
     */
    handleChangeComment = (obj, val, index) => {
        var items = this.state.items;
        items[index][0].comment_desc = val;
        this.setState({ items: items });
    }

    /**
     * Handle toggle to view comment
     * @param {object} obj 
     * @param {str} val 
     * @param {int} index 
     */
    handletoggleComment = (index) => {
        var items = this.state.items;
        items[index][0].comment_create = !items[index][0].comment_create;
        this.setState({ items: items });
    }

    /**
     * Update Items state from props once api call finished
     */
    updateItemsList = () => {
        let items = this.props.items;
        this.setState({ items: items });
    }

    getSeparator(field) {
        return (
            (field.field == "goals" || field.field == "additional_services") && <ul><li>to</li></ul> ||
            field.field != "goals" && <>to</>
        )
    }

    /**
     * Post Feed
     */
    postFeed = () => {
        this.setState({ feed_post: true })

        if (!this.state.loading) {
            this.setState({ loading: true });
            var req = {
                feed_title: this.state.feed_title ? this.state.feed_title : '',
                source_id: this.state.sourceId,
                related_type: this.state.relatedType
            }

            postData('sales/Feed/post_feed', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ feed_title: '' });
                    this.props.getFieldHistoryItems(this.state.sourceId);
                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false, feed_post: false });
            });
        }
    }

    /**
     * Post comment
     * @param {array} item 
     * @param {int} index 
     */
    postComment = (item, index) => {
        var items = this.state.items;
        var feed_comment =  items[index][0].comment_desc;
        items[index][0].comment_post = true;
        this.setState({ items: items });

        var history_id = item[0].history_id;

        if (!this.state.loading) {
            this.setState({ loading: true });
            
            var req = {
                feed_comment: feed_comment ? feed_comment  : '',
                history_id: history_id,
                source_id: this.state.sourceId,
                related_type: this.state.relatedType
            }

            postData('sales/Feed/post_comment', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.setState({ [index]: '' });
                    this.props.getFieldHistoryItems(this.state.sourceId);
                    this.handletoggleComment(index);
                } else {
                    toastMessageShow(result.error, "e");
                }
                items[index][0].comment_post = false;
                this.setState({ loading: false, items: items });
            });
        }
    }
    /**
     * 
     * @param {*} item 
     * @param {*} subText 
     * @returns sub text based on feed field like oa_status , oa_start_time..,
     */
    render_oa_feed_title_text = (item, subText) => {
        let content = item[0].created_by + ' Initiated online assessment to ' + this.props.applicant_name;
        if(item[0].value== '2'){
            content = item[0].created_by + ' inprogress online assessment to ' + this.props.applicant_name;
        }else if(item[0].value== '3'){
            content = item[0].created_by + ' submitted online assessment to ' + this.props.applicant_name;
        }else if(item[0].value== '5'){
            content = item[0].created_by + '  link expired online assessment to ' + this.props.applicant_name;
        }else if(item[0].value== '6'){
            content = item[0].created_by + ' error ' + this.props.applicant_name;
        }else if(item[0].value== '7'){
            content = item[0].created_by + ' sent Online Assessment invite to ' + this.props.applicant_name;
        }else if(item[0].value== '9'){
            content = item[0].created_by + ' sent Online Assessment reminder to ' + this.props.applicant_name;
        }
       
        return (

            item[0].field == 'oa_status' && ( item[0].value== '1' || item[0].value== '7' || item[0].value== '9') ?<p className="slds-history-title-max-wid">
               
                <a href="javascript:void(0);" title={item[0].created_by}>{content}</a>&nbsp;
            </p> : <p className="slds-history-title-max-wid">
               
               <a href="javascript:void(0);" title={item[0].created_by}>{item[0].created_by}</a>&nbsp;
               {subText}
           </p>
        );
    }
    /** 
     * @param {*} oa_status 
     * @returns oa title text
     */
    renderOAStausTitle = (oa_status) => {
        let headerTitle = 'the online assessment';
        switch (oa_status) {
            case '1':
                headerTitle = "Initiated " + headerTitle;
                break;
            case '2':
                headerTitle = "Started " + headerTitle;
                break;
            case '3':
                headerTitle = "Submitted " + headerTitle;
                break; 
            case '4':
                headerTitle = "Graded  " + headerTitle;
                break; 
            case '5':
                headerTitle = "The online assessment Link Expired";
                break; 
            case '6':
                headerTitle = "There is an Error while attending " + headerTitle;
                break;
            case '8':
                headerTitle = "online assessment is session expired";
                break;            
            default:
                headerTitle = "the online assessment"
                break;
        }
        return headerTitle;
    }
    /** 
     * @param {*} oa_data 
     * @returns oa sub title
     */
    renderOASubTitle = (oa_data) => {
        let start_time = oa_data.oa_start_date_time ? moment((oa_data.oa_start_date_time.split(' ')[1]), ["hh:mm:ss"]).format("hh:mm A") : ''
        let end_time = oa_data.oa_completed_date_time ? moment((oa_data.oa_completed_date_time.split(' ')[1]), ["hh:mm:ss"]).format("hh:mm A") : ''
        let duration = moment(oa_data.oa_completed_date_time).diff(moment(oa_data.oa_start_date_time),'minutes');
        if(oa_data.oa_status > 4 && oa_data.oa_status < 8){
            return <></>
        }else{
            return (
                <div class="slds-post__content slds-text-longform">
                    <React.Fragment>
                    {(oa_data.oa_status == 2 || oa_data.oa_status == 3 || oa_data.oa_status == 8) &&<ul class="slds-list--vertical">
                            <p><b>Assessment Details</b></p>
                            <li class="slds-list__item">{'Attempted on : ' + moment(oa_data.oa_start_date_time).format('DD/MM/YYYY')}</li><br />
                            <li class="slds-list__item">{'Start Time : ' + start_time}</li><br />
                            {oa_data.oa_status == 3 || oa_data.oa_status == 8 ?
                                [<React.Fragment><li class="slds-list__item">{'End Time : ' + end_time}</li><br />
                                    <li class="slds-list__item">{'Duration : ' + duration +' Min'}</li></React.Fragment>]
                                : ''}
    
                        </ul>}
                        {oa_data.oa_status == 4 ? <ul class="slds-list--vertical">
                            <p><b>Assessment Details</b></p>
                            <li class="slds-list__item">{'Grade : ' + oa_data.oa_grade}</li><br />
                        </ul> : ''}
                    </React.Fragment>
                </div>
            )
        }
       
    }   

    /**
     * Render Title and updated by
     * @param {int} key 
     * @param {array} item 
     */
    renderTitle(key, item) {
        const eventType = this.getLifecycleEventType(item);
        let titleText = '';
        var subText = '';
        var subTitle = '';
        let tooltip = '';
        if (item[0].feed === false && item[0].field != 'oa_status') {
            // Title
            subText = eventType == 'converted' && Number(item[0].related_type) === 1 ?
                <>converted a <a href={'/admin/crm/leads/' + item[0].prev_val}>lead</a> to this opportunity</>
                :
                <>{eventType} this record {moment(item[0].created_at).fromNow()}.</>
            titleText = (
                <p className="slds-history-title-max-wid">
                    <a href="javascript:void(0);" title={item[0].created_by}>{item[0].created_by}</a>&nbsp;
                    {subText}
                </p>
            );
            // Sub Title
            subTitle = (
                <p class="slds-text-body_small">
                    <a href="javascript:void(0);" title={moment(item[0].created_at).format('h:mm A')+' | '+ moment(item[0].created_at).format('D/MM/YYYY')} class="slds-text-link_reset"> {moment(item[0].created_at).format('h:mm A')} | {moment(item[0].created_at).format('D/MM/YYYY')}</a>
                </p>
            );
        } else if (item[0].feed === false && item[0].field == 'oa_status' && item[0].related_type == 4) {
            // Title
            subText = eventType == <>{eventType} this record {moment(item[0].created_at).fromNow()}.</>
            titleText = this.render_oa_feed_title_text(item, subText);
            // Sub Title
            subTitle = (
                <p class="slds-text-body_small">
                    <a href="javascript:void(0);" title="Click for single-item view of this post" class="slds-text-link_reset">{moment(item[0].created_at).format('D MMMM YYYY')} at {moment(item[0].created_at).format('h:mm a')}</a>
                </p>
            );
        } else {
            let posted_on = "posted this";
            subText = item[0].feed_title;  
            let more_applicants = '';          
            if (this.state.relatedType == 5 && item[0].feed_type == 1) {
                try {
                    let smsfeed = JSON.parse(subText);
                    let template_title = smsfeed.title || "";
                    let applicant_name = smsfeed.applicant_name || "";
                    let applicants = smsfeed.applicants || [];
                    let o_applicants = smsfeed.applicants.map((itm, i) => {
                        if (i === 0) {
                            return false;
                        }
                            return `${itm.firstname} ${itm.lastname}`;
                        }
                    );
                    if (template_title) {
                        posted_on = "sent " + template_title;
                        if (applicant_name) {
                            posted_on += " to " + applicant_name;
                        }
                    } else {
                        posted_on = "sent SMS to " + applicant_name;
                    }
                    let moretext = '';
                    if (applicants.length > 2) {
                        posted_on += " and ";
                        moretext = `+${applicants.length - 1}`;
                        more_applicants = ' applicants';
                        tooltip = ( <Popover
                            body={o_applicants.map(applicant_name => <p>{applicant_name}</p>)}
                            id="popover-heading"
                            align="bottom"
                        >
                            <b style={{cursor: "pointer", display: "inline"}}>{moretext}</b>
                        </Popover>);
                    } else if (applicants.length == 2) {
                        moretext = applicants[1].firstname + ' ' + applicants[1].lastname;
                    }

                    if (applicants.length == 2) {                        
                        posted_on += " and " + moretext;
                    }   
                    subText = smsfeed.content;
                } catch (e) {
                    //nothing to do
                }
            } else if (item[0].feed_type == 1) {
                try {
                    let smsfeed = JSON.parse(subText);
                    let template_title = smsfeed.title || "";
                    let applicant_name = smsfeed.applicant_name || "";
                    if (template_title) {
                        posted_on = "sent " + template_title;
                        if (applicant_name) {
                            posted_on += " to " + applicant_name;
                        }
                    } else {
                        posted_on = "sent SMS to " + applicant_name;
                    }
                    subText = smsfeed.content;
                } catch (e) {
                    //nothing to do
                }
            }else if(item[0].related_type==4 && item[0].feed_type==2){
                subText = JSON.parse(item[0].feed_title);
            }

            if (item[0].feed_type!=2 && subText.includes("\\n")) {
                let parts = subText.split("\\n");
                subText = parts.map(part => <p>{part}</p>)
            }
            subTitle = (<div className="slds-text-body_small slds-history-title-max-wid slds-feed__content">
                <div dangerouslySetInnerHTML={{__html: subText}} />
            </div>
            );
            // Sub Title
            titleText = (
                <p className="">
                    <a href="javascript:void(0);" title={item[0].created_by}>{item[0].created_by}</a>&nbsp;{posted_on}{tooltip}{more_applicants} on&nbsp;
                    <a href="javascript:void(0);" title="Click for single-item view of this post" class="slds-text-link_reset">{moment(item[0].created_at).format('D MMMM YYYY')} at {moment(item[0].created_at).format('h:mm a')}</a>
                </p>
            );
            let reminder_text = '';
            
            //Update the Reminder text in feed sections
            if(subText === 'OA Reminder SMS') {
                
                reminder_text = 'SMS';

            } else if(subText === 'OA Reminder Email') {                
                
                reminder_text = 'Email';
            
            }

            if(reminder_text) {
                subTitle = '';
                titleText = (
                    <p className="">
                        <a href="javascript:void(0);" title={item[0].created_by}>{item[0].created_by}</a>&nbsp;<>Sent OA Reminder - {reminder_text} on </>
                        <a href="javascript:void(0);" title="Click for single-item view of this post" class="slds-text-link_reset">{moment(item[0].created_at).format('D MMMM YYYY')} at {moment(item[0].created_at).format('h:mm a')}</a>
                    </p>
                );
            }

            if(item[0].related_type==4 && item[0].feed_type==2){
                subTitle = (this.renderOASubTitle(subText));
                titleText = (<p className="">
                <a href="javascript:void(0);" title={item[0].created_by}>{subText.oa_status== '4' ? item[0].created_by : subText.applicant_name}</a>&nbsp;{this.renderOAStausTitle(subText.oa_status)} on&nbsp;
                <a href="javascript:void(0);" title="Click for single-item view of this post" class="slds-text-link_reset">{moment(item[0].created_at).format('D MMMM YYYY')} at {moment(item[0].created_at).format('h:mm a')}</a>
            </p>); 
            }

        }

        // Show expand btn at which state
        let expandMoreBtn = '';
        if ((eventType == 'updated' && item[0].feed === false) || (Number(item[0].comments_count) > 0)) {
            expandMoreBtn = (
                <button class="slds-button slds-button_icon slds-button_icon-border slds-button_icon-x-small" aria-haspopup="true" title="More Options" id={"comment-expand-" + key} onClick={() => this.toggleDetail(key)}>
                    <Icon
                        category="utility"
                        name={item[0].expanded ? "down" : "right"}
                        size="x-small"
                    />
                    <span class="slds-assistive-text">More Options</span>
                </button>
            )
        }
        if ((eventType == 'converted' && item[0].feed === false && (Number(item[0].comments_count) === 0)) || (item[0].field == 'oa_status' && item[0].related_type == 4)) {
            expandMoreBtn = '';
        }
        return <div className="mt-1">
            <div class="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                {titleText}
                <div>
                    <a className="mr-2" id={"comment-btn-" + key} onClick={() => this.handletoggleComment(key)}>
                        <Icon
                            category="utility"
                            name="comments"
                            size="x-small"
                        />
                    </a>
                    {expandMoreBtn}
                </div>
            </div>
            {subTitle}
        </div>
    }

    getFieldValue = (field) => {
        if(field.field =='status_updated_from_gb' && field.related_type==4){
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">Status</li>
                        <li class="slds-list__item">Applicant marked unsuccessful from group booking meeting</li>
                    </ul>
                </React.Fragment>
            )
        }else if((field.field =="interview_start_datetime" || field.field =="interview_end_datetime")){
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">{this.titleCase(field.field)}</li>
                        <li class="slds-list__item">{moment(this.titleCase(field.prev_val)).format("DD/MM/YYYY HH:mm")=='Invalid date' ? 'N/A' : moment(this.titleCase(field.prev_val)).format("DD/MM/YYYY HH:mm")} to {moment(this.titleCase(field.value)).format("DD/MM/YYYY HH:mm")=='Invalid date' ? 'N/A' : moment(this.titleCase(field.value)).format("DD/MM/YYYY HH:mm")}</li>
                    </ul>
                </React.Fragment>
            )
        }else if(field.field =="event_date"){
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">{this.titleCase(field.field)}</li>
                        <li class="slds-list__item">{moment(this.titleCase(field.prev_val)).format("DD/MM/YYYY")=='Invalid date' ? 'N/A' : moment(this.titleCase(field.prev_val)).format("DD/MM/YYYY")} to {moment(this.titleCase(field.value)).format("DD/MM/YYYY")=='Invalid date' ? 'N/A' : moment(this.titleCase(field.value)).format("DD/MM/YYYY")}</li>
                    </ul>
                </React.Fragment>
            )
        }else if(field.field =='notes' && field.related_type==6){
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">Notes</li>
                        <li class="slds-list__item">Notes entered in the form</li>
                    </ul>
                </React.Fragment>
            )
        }
        else if(field.field =="notes_reason" || field.field =="notify_email"){
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">{this.titleCase(field.field)}</li>
                        <li class="slds-list__item">{this.titleCase(field.value)}</li>
                    </ul>
                </React.Fragment>
            )
        } else if(field.field =="oa_status"){
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">Initiated</li>
                        <li class="slds-list__item">{this.titleCase(field.value)}</li>
                    </ul>
                </React.Fragment>
            )
        }
        else{
            return (
                <React.Fragment>
                    <ul class="slds-list--vertical">
                        <li class="slds-list__item">{this.titleCase(field.field)}</li>
                        <li class="slds-list__item">{this.titleCase(field.prev_val)} to {this.titleCase(field.value)}</li>
                    </ul>
                </React.Fragment>
            )
        } 
    }
    
    
    openCloseView = (item) => {
        this.setState({ isViewOpen: !this.state.isViewOpen, viewData: item }, () => {
            this.renderViewModal();
        });
    }

    renderViewModal() {
        return (
            <React.Fragment>
                <ViewTemplate size={'medium'} isOpen={this.state.isViewOpen} heading={false} data={this.state.viewData} close={() => this.openCloseView()} />
            </React.Fragment>
        );
    }
    viewFeedContent(feed) {
        this.setState({ isViewOpen: !this.state.isViewOpen, viewData: feed }, () => {
            this.renderViewModal();
        });
    }

    /**
     * Feed updated content
     * @param {int} key 
     * @param {array} item 
     */
    renderContent(key, item) {
        var oAEmailStatus = ['7', '9', '1'];
        if (item[0].feed == true) {
            return <div  style={{ display: this.shouldShowDetail(key) }}>{this.renderComments(key, item[0].comments)}</div>
        }
        if ((Number(item[0].related_type) === 3 || Number(item[0].related_type) === 4) && !oAEmailStatus.includes(item[0].value) ) {
            return this.getLifecycleEventType(item) != 'updated' ?  <div style={{ display: this.shouldShowDetail(key) }} className="mt-3">{this.renderComments(key, item[0].comments)}</div> :
            <div style={{ display: this.shouldShowDetail(key) }} className="mt-3">
                <div class="slds-post__content slds-text-longform">
                    {
                        item.map((field) => 
                            <ul class="slds-list--vertical">
                                <li class="slds-list__item">{field.field != 'additional_services_custom' && field.field != 'additional_services' ? convertTitle(field.field) : "Other support services being provided by ONCALL"}</li>
                                <li class="slds-list__item">{this.renderValue(field, 'prev')} {this.getSeparator(field)} {this.renderValue(field, '')}</li>
                            </ul>
                        )
                    }
                </div>
                {this.renderComments(key, item[0].comments)}
            </div>
        }

        if(item[0].field == 'oa_status' && item[0].value == '1'){
            return <>{this.renderComments(key, item[0].comments)}</>
        }
        
        if(item[0].field == 'oa_status' && oAEmailStatus.includes(item[0].value)){
            
            return <>
                <div style={{ display: this.shouldShowDetail(key) }} className="mt-3">
                    <div class="slds-post__content slds-text-longform">
                        <span onClick={() => this.viewFeedContent(item[0].feed_title)} style={{ 'cursor': 'pointer', 'text-decoration': 'underline', 'color':'blue' }}>Click here to read the email content</span>
                    </div>
                    {this.renderComments(key, item[0].comments)}
                </div>
            </>
        }

        return this.getLifecycleEventType(item) != 'updated' ? <div style={{ display: this.shouldShowDetail(key) }} className="mt-3">{this.renderComments(key, item[0].comments)}</div> :
        <div style={{ display: this.shouldShowDetail(key) }} className="mt-3">
            <div class="slds-post__content slds-text-longform">
                {item.map((field) => this.getFieldValue(field))}
            </div>
            {this.renderComments(key, item[0].comments)}
        </div>
    }

    /**
     * Render Comment form
     * @param {*} key 
     * @param {*} item 
     */
    renderCommentForm(key, item) {
        if (item[0].comment_create == false) {
            return <React.Fragment />
        }
        return (
            <div className="slds-comment-section mt-3 mb-3 pl-2 pr-2">
                <div className="row">
                    <div className="slds-size_1-of-1 slds-medium-size_12-of-12 slds-large-size_12-of-12">
                        <div className={`slds-form-element`}>
                            <div className="slds-form-element__control">
                                <textarea className="slds-textarea" 
                                    name={"comment_description_"+key}
                                    id={"comment_description_"+key}
                                    placeholder="Write a comment ..." 
                                    onChange={(e)=> this.handleChangeComment(this, e.target.value, key)} 
                                    value={item[0].comment_desc || ''}
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="slds-size_1-of-1 slds-medium-size_12-of-12 slds-large-size_12-of-12 text-right">
                        <Button id={"comment_cancel_"+key} label={"Cancel"} className="mr-2" disabled={item[0].comment_post} onClick={() => this.handletoggleComment(key)}/>
                        <Button id={"comment_post_"+key} label={item[0].comment_post ? "Commenting ..." : "Comment"} className="slds-button_brand" disabled={item[0].comment_post} onClick={() => this.postComment(item, key)}/>
                    </div>
                </div>
            </div>                
        );
    }

    /**
     * Render Comment list
     * @param {int} key 
     * @param {obj} items 
     */
    renderComments = (key, items) => {
        let comments = [];
        items.map((item) => {
            let titleText = '';
            var subText = '';
            var subTitle = '';
            subText = item.desc;
            subTitle = (
                <p className="slds-text-body_small slds-commented-text">
                    <>{subText}</>
                </p>
            );
            // Sub Title
            titleText = (
                <p className="slds-text-title_com_small">
                   <span className="slds-comment-avatar">
                       <Icon
                        category="action"
                        name="user"
                        size="xx-small"
                        />
                    </span> 
                    
                    <a href="javascript:void(0);" title={item.created_by}>{item.created_by}</a>&nbsp;<>commented this on </>
                    <a href="javascript:void(0);" title="Click for single-item view of this post" class="slds-text-link_reset">{moment(item.created_at).format('h:mm A')} | {moment(item.created_at).format('D/MM/YYYY')}</a>
                </p>
            );    
            
            comments.push(
                <div className="mt-3 ml-3">
                    <div class="slds-grid slds-grid_align-spread slds-has-flexi-truncate mb-1">
                        {titleText}
                    </div>
                    {subTitle}
                </div>
            );
        })
        return comments;
    }

    /**
     * Render Feed form
     */
    renderFeedForm = () => {
        return (
            <li class="slds-feed__item">
                <article class="slds-post slds-post-bor-top">
                    <header class="slds-post__header slds-media">
                        <div class="slds-media__figure">
                            <a href="javascript:void(0);">
                                <Icon
                                    category="action"
                                    name="user"
                                    size="x-small"
                                />
                            </a>
                        </div>
                        <div class="slds-media__body">
                            <div className="row">
                                <div className="slds-size_1-of-1 slds-medium-size_12-of-12 slds-large-size_12-of-12">
                                    <div className="slds-form-element">
                                        <textarea className="slds-textarea" 
                                            name={"feed_title"}
                                            id={"feed_title"}
                                            placeholder="Post on Feed ..."
                                            onChange={(e) => handleChange(this, e)}
                                            value={this.state.feed_title || ''}
                                            data-rule-required="true"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="slds-size_1-of-1 slds-medium-size_12-of-12 slds-large-size_12-of-12 text-right">
                                    <Button label={this.state.feed_post ? "Posting ..." : "Post"} className={"slds-button_brand"} id={"post-feed-btn"} disabled={this.state.feed_post} onClick={this.postFeed}/>
                                </div>
                            </div>
                        </div>
                    </header>                    
                </article>
            </li >
        );
    }

    /**
     * Render values for updated field and value
     * @param {str} field 
     * @param {str} flag 
     */
    renderValue(field, flag) {
        let val = [];
        if (field.field != 'goals' && field.field != 'additional_services') {
            return flag === 'prev'? `${field.prev_val}` : `${field.value}`;
        }
        if (field.field == 'additional_services') {
            val = flag === 'prev'? field.prev_val != "N/A" && JSON.parse(field.prev_val) : field.value != "N/A" && JSON.parse(field.value);
            if (!val || val.length == 0 || val == "N/A") {
                val = ["N/A"];
            }
            return  (
                <ul>
                    {
                    val.map(obj =>
                    <li>{obj}</li>
                    )
        }
                </ul>
            )
            
        }
        val = flag === 'prev'? JSON.parse(field.prev_val) : JSON.parse(field.value);
        return val.map(obj => 
            <ul>
                <li>{obj.goal? obj.goal:'N/A'}</li>
                <li>{obj.outcome? obj.outcome:'N/A'}</li>
            </ul>
        );
    }
    
    render() {
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <div class="field-history-feed slds-feed" style={{ margin: 0 + 'px', maxWidth: 'unset' }}>
                    <ul class="slds-feed__list">
                        {this.renderFeedForm()}
                        {Object.entries(this.state.items).map(([key, item]) =>
                            <li class="slds-feed__item slds-li-border-bot">
                                <article class="slds-post slds-post-bor-top">
                                    <header class="slds-post__header slds-media">
                                        <div class="slds-media__figure">
                                            <a href="javascript:void(0);">
                                                <Icon
                                                    category="action"
                                                    name="user"
                                                    size="x-small"
                                                />
                                            </a>
                                        </div>
                                        <div class="slds-media__body">
                                            {this.renderTitle(key, item)}
                                            {this.renderCommentForm(key, item)}
                                            {this.renderContent(key, item)}
                                            {this.state.isViewOpen && this.renderViewModal()}
                                        </div>
                                    </header>                                    
                                </article>
                            </li>
                        )
                        }
                    </ul>
                </div>
            </IconSettings>
        )
    }
}


const defaultProps = {
    /**
     * @type {object}
     */
    items: {},

    /**
     * @type {string}
     */
    sourceId: '',

    /**
     * @type {string}
     */
    relatedType: '',

    /**
     * @type {event}
     */
    getFieldHistoryItems: undefined,
}

SalesFeed.defaultProps = defaultProps;

export default SalesFeed;