import React from 'react'
import _ from 'lodash'
import { Link, Redirect } from 'react-router-dom'
import jQuery from 'jquery'
import moment from 'moment'
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
    Input,
    Dropdown,
} from '@salesforce/design-system-react';
import { connect } from 'react-redux'
import { ROUTER_PATH , MS_TENANTID} from '../../../../config.js'
import { postData, css, toastMessageShow } from '../../../../service/common'
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import CreateInterviewModal from './CreateInterviewModal.jsx';
import ApplicantsCard from './ApplicantsCard.jsx';
import ArchiveModal from '../../oncallui-react-framework/view/Modal/ArchiveModal';
import Feed from '../../salesforce/lightning/SalesFeed.jsx';
import GroupBookingStatusPath from './GroupBookingStatusPath.jsx';
import CreateCabCertificate from '../applicants/application_header_action/CreateCabCertificate';
import CreateEmployerContract from '../applicants/application_header_action/CreateEmployerContract';
import ApplicantBulkUpdateStatus from './ApplicantBulkUpdateStatus.jsx';
import { AjaxConfirm } from 'service/common';
import OncallFormWidget from '../../oncallui-react-framework/input/OncallFormWidget';
import { getGroupBookingEmailContent } from '../../../admin/recruitment/actions/RecruitmentAction.js';
import { MsalProvider } from "@azure/msal-react";
import { UpdateMeetingInvite } from '../../../admin/recruitment/azure_graph_ms_invite/MsUpdateCommon';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";
import GBCancelInvite from './GBCancelInvite';
const msalInstance = new PublicClientApplication(msalConfig);

const determineListingControlColumns = () => {
    return [
        { label: 'Cancel Invite', value: '4',disabled: 'false' },
        { label: 'Generate CAB', value: '1',disabled: 'false' },
        { label: 'Employment contract', value: '2',disabled: 'false' },
        { label: 'Archive', value: '3' , disabled: 'false'},
    ];
}
class InterviewDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'details',
            loading: false,
            redirectTo: null,
            activity_page: false,
            interview_id: this.props.props.match.params.id,
            unsuccessful_reason_option: [],
            show_related_card : true,
            openCreateCabCertificate: false,
            openEmploymentContract: false,            
            interview_start_date:'',
            interview_start_time:'',
            interview_end_date:'',
            interview_end_time:'',
            group_booking_email_template: '',
            group_booking_email_subject:'', 
            ms_template: '',
            meeting_options: '',
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
        // item listing
        this.reactTable = React.createRef();
        this.applicantListRef = React.createRef();
    }


    /**
     * When component is mounted, remove replace the parent element's
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentWillMount() {
        if(this.state.interview_id){
            this.getInterviewById(this.state.interview_id);
        }
    }

    componentDidMount(){
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.getFieldHistoryItems();
        this.get_ms_url_template();
    }

    get_ms_url_template=()=>{
        postData("recruitment/RecruitmentInterview/get_ms_url_template", {}).then((res) => {
            if (res.status) {
                this.setState({
                    ms_template: (res.data) ? res.data.template : ''
                })
            }
        });
    }

    /*
    * get group booking template and replace the date and location
    */
    getGroupBookingEmailHtmlFormat = (email_key) => {
        this.setState({ loading: true });
        getGroupBookingEmailContent(email_key).then(res => {
            if(res){
                this.setState({
                    group_booking_email_template: res.template_content,   
                    group_booking_email_subject: res.subject,             
                    loading: false,
                });
            }
           
        });
    }

    componentWillUpdate(props) {
        if (props.sms_feed_refresh === true) {
            this.getFieldHistoryItems();
            this.props.set_feed_refresh(false);
        }
    }

    componentWillUpdate(props) {
        if (props.sms_feed_refresh === true) {
            this.getFieldHistoryItems();
            this.props.set_feed_refresh(false);
        }
    }

    getFieldHistoryItems() {
        postData('recruitment/RecruitmentInterview/get_field_history', { interview_id: this.state.interview_id }).then(resp => {
            let items = resp.data;
            this.setState({ fieldHistory: items }, () => {
                // call history component func
                this.history.updateItemsList();
            });
        });
    }

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * get the interview details by id
     */
    getInterviewById = (interview_id) => {
        postData("recruitment/RecruitmentInterview/get_interview_by_id", {interview_id : interview_id}).then((res) => {
            if (res.status) {
                this.setState(res.data, () => {
                    if (res.data.meeting_link != '' && res.data.meeting_link !=null && res.data.ms_event_org_id !=null) {
                        let url = res.data.meeting_link
                        url = url.replace("https://teams.microsoft.com/l/meetup-join/", '');
                        url = url.split('/');

                        let org_id = res.data.ms_event_org_id
                        org_id = org_id.replace("https://graph.microsoft.com/v1.0/$metadata#users('", '');
                        org_id = org_id.replace("')/events/$entity", '');

                        let meeting_options = 'https://teams.microsoft.com/meetingOptions/?organizerId=' + org_id + '&tenantId=' + MS_TENANTID + '&threadId=' + url[0] + '&messageId=0&language=en-US';
                        this.setState({ meeting_options: meeting_options });
                    }

                });
                this.setState({ unsuccessful_reason_option : res.unsuccessful_reason_option, unsuccessful_reason :  res.unsuccessful_reason,  show_related_card : true }, ()=>{
                this.applicantListRef.current.getWrappedInstance().callApplicantData();
                let email_key = res.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation';
                this.getGroupBookingEmailHtmlFormat(email_key);
                this.listHeaderOptions();
                })

            }

        });
    }

    /*
    * Open create quiz modal
    */
    showModal = (id) => {
        this.setState({ openCreateInterview: true, selected_id: id });
    }

    /**
     * Close the modal when user save the quiz and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({ openCreateInterview: false ,openCancelInvite: false ,  showApplicantBulkUpdateStatus: false, openCreateCabCertificate: false, selected_row : [], openEmploymentContract: false });
        this.applicantListRef.current.getWrappedInstance().emptyTheSeletedRow();
        if (status) {
            this.getInterviewById(this.state.interview_id);
            this.getFieldHistoryItems();
        }
    }

    /**
     * Open archive interview modal
     */
    showInterviewArchiveModal(interview_id) {
        this.setState({ showInterviewArchiveModal: true, archive_interview_id: interview_id });
    }
    /**
     * Close archive interview modal
     */
    closeInterviewArchiveModal = () => {
        this.setState({ showInterviewArchiveModal: false, archive_interview_id: '' })
    }

    /**
     * Close archive interview modal
     */
    closeAndRedirectListPage = () => {
        let redirectTo = ROUTER_PATH + `admin/recruitment/interview`
        this.setState({ showInterviewArchiveModal: false, archive_interview_id: '', redirectTo: redirectTo });
    }

     /**
     * Open create cab certificate or transfer application
     */
      showHeaderActionModal = (header_action) => {
        if(header_action == 1){
            this.showCabCertificateModal()
        }else if(header_action == 2){
            this.showEmploymentContractModal();
        }
        else if(header_action == 3){
            this.showInterviewArchiveModal(this.state.interview_id);
        }
        else if(header_action == 4){
            if(!this.applicantListRef.current.getWrappedInstance().state.selected_header_check_box){
                this.setState({ openCancelInvite: false });
                toastMessageShow('Please select all applicant','e');
            }else{
                this.setState({ openCancelInvite: true });
            }
            
        }
    }

    listHeaderOptions = () => {
        let header_options = determineListingControlColumns();
        header_options.map((col) => {
            if((col.value == 1 && this.state.interview_stage_status < 2 ) ||
            (col.value==3 && this.state.interview_stage_status > 0)){
             /**
                * As of 9023,regardless of any status,group booking can be archived
                *  // col.disabled = true;
              */
              
            }
            if((col.value == 4 && this.state.ms_event_status=="1" ) && this.state.interview_stage_status==4 || this.state.event_id==null)
            {             
              col.disabled = true;              
            }
        })
        return header_options;
    }    

    setApplicantRef = () =>{
        let selected_row = this.applicantListRef.current.getWrappedInstance().state.selected_row;
        if (selected_row == 0) {
            toastMessageShow("Please choose applicant", "e");
            return false;
        }
    }
    resendInvite = () => {
        let selected_row = this.applicantListRef.current.getWrappedInstance().getSeletedApplicants();
        if(selected_row == 0){
            toastMessageShow("Please choose applicant", "e");
            return false;
        }

        var req = { applicants: selected_row, interview_id : this.state.interview_id , owner: this.state.owner, interview_type: this.state.interview_type}
        this.setState({resetLoading : true});
        postData('recruitment/RecruitmentInterview/resend_invite_to_applicants', req).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.getInterviewById(this.state.interview_id);
                this.applicantListRef.current.getWrappedInstance().emptyTheSeletedRow();
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({resetLoading : false});
        });
    }

    updateStatus = () => {

        let selected_row = this.applicantListRef.current.getWrappedInstance().getSeletedApplicants();
        if(selected_row == 0){
            toastMessageShow("Please choose applicant", "e");
            return false;
        }

        let show_modal = [];
        selected_row.forEach((selected)=> {
                if(selected.interview_meeting_status!='0') {
                    show_modal.push('true');
                }
            })
            if(show_modal.length > 0){
                toastMessageShow("Status once marked cannot be reverted", "e");
                return false;
            }else{
                this.setState({showApplicantBulkUpdateStatus : true, selected_id: this.state.interview_id, selected_applicant: selected_row});
            }
    }

    /**
     * Open Cab certificate Generated modal
     */
     showCabCertificateModal() {
        let selected_row = this.applicantListRef.current.getWrappedInstance().getSeletedApplicants();
        let app_status = this.validateSelectedApplicantStatus();    
        if(app_status){     
            this.setState({ openCreateCabCertificate: true, applicants: selected_row, interview_id : this.state.interview_id , owner: this.state.owner});
        }
    }

    /**
     * Open Cab certificate Generated modal
     */
     showEmploymentContractModal() {
        let selected_row = this.applicantListRef.current.getWrappedInstance().getSeletedApplicants();
        let app_status = this.validateSelectedApplicantStatus();    
        if(app_status){
            this.setState({ openEmploymentContract: true, applicants: selected_row, interview_id : this.state.interview_id , owner: this.state.owner});
        }
    }

    validateSelectedApplicantStatus = () =>{
        let selected_row = this.applicantListRef.current.getWrappedInstance().getSeletedApplicants();
        if(selected_row == 0) {
            toastMessageShow("Please choose applicant", "e");
            return false;
        }

        let checkSuccessApplicant = selected_row.find(o => o.interview_meeting_status !== '1');
        if(checkSuccessApplicant){
            toastMessageShow("Please choose successful applicant only", "e");
            return false;
        }
        return true;
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        return (
            <PageHeader
                details={[
                    {
                        label: 'Start Date',
                        content: this.state.interview_start_datetime ? moment(this.state.interview_start_datetime).format("DD/MM/YYYY HH:mm") : ''
                    },
                    {
                        label: 'Owner',
                        content: this.state.owner ? <Link to={ROUTER_PATH + `admin/recruitment/staff_details/${this.state.owner.value}/`}
                        className="vcenter default-underlined slds-truncate"
                        style={{ color: '#0070d2' }}>
                        {this.state.owner_name}
                    </Link>: ''
                    },
                    {
                        label: 'Location',
                        content: <div className="">{this.state.location ? this.state.location.label : ''}</div>,

                    },
                    {
                        label: 'About',
                        content: this.state.interview_type

                    },
                ]}
                icon={
                    <Icon
                        assistiveText={{ label: 'Group Booking' }}
                        category="standard"
                        name={`people`}
                    />
                }
                label={`Group Booking`}
                title={this.state.title}
                variant="record-home"
                onRenderActions={this.actions}
            />
        )
    }

    /**
     * Render interview Status
     */
     renderSldsPath = () => {
        return (
            <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                { this.state.show_related_card && this.applicantListRef && this.applicantListRef.current && this.applicantListRef.current.getWrappedInstance() && <GroupBookingStatusPath                   
                    archived={this.state.archive==0?false:true}
                    get_interview_by_id={this.getInterviewById}
                    applicantRef={this.applicantListRef.current.getWrappedInstance()}
                    closeModal={this.closeModal}
                    {...this.state}
                    {...this.props}
                />}
            </div>
        );
    }

    /**
     * Action renderer for `<PageHeader />`
     */
    actions = () => {
        return (
       <React.Fragment>
                <PageHeaderControl>
                {this.state.archive==0&&(  <ButtonGroup variant="list" id="button-group-page-header-actions">
                        <Button label="Edit Booking" disabled={this.state.interview_stage_status == 3 || this.state.interview_stage_status == 4  || this.state.ms_event_status == 1? true : false} onClick={() => this.setState({ openCreateInterview: true, selected_id: this.state.interview_id })} title={`Edit booking`}/>
                        <Button label="Update Status" disabled={this.state.interview_time_status=='Expired' || this.state.resetLoading || parseInt(this.state.interview_stage_status) < 2 || this.state.ms_event_status == 1 ? true : false} id="update_status" title={`Update Status`} onClick={()=> this.updateStatus()}/>                                                
                        {this.state.ms_event_status!=1 && this.state.interview_time_status!='Expired'? <MsalProvider instance={msalInstance}> <UpdateMeetingInvite
                            {...this.state}
                            {...this.props}
                            applicantRef={this.applicantListRef.current.getWrappedInstance()}
                            page_name={'from_details'}
                            label_name={'Resend Invite'}
                        />
                        </MsalProvider> : <Button label="Resend Invite" disabled={true} id="update_status" title={`Resend Invite`} />                                                
                        }
                        
                    <Dropdown
                        id="header_drop_down"
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-medium"
                        iconVariant="border-filled"
                        onSelect={(e) => {
                        //call the cab certificate / tranfer application
                        this.showHeaderActionModal(e.value);
                        }}
                        width="xx-small"
                        options={this.listHeaderOptions()}
                    />
                </ButtonGroup>)}
                {this.state.archive==1&&(
                    <>
                        <span style={{marginRight:25+'px'}}>
                         <Link to={ROUTER_PATH + `admin/recruitment/interview/archived`} 
                         className="vcenter default-underlined slds-truncate" style={{ color: '#0070d2' }}>
                        {'Back to Archived List'}
                        </Link>
                        </span>
                       <button onClick={()=>this.restoreArchived()}
                       className="slds-button slds-button_brand slds-path__mark-complete"  title={`Restore`}>
                          <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                           <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#undo"></use>
                      </svg>Restore</button>
                      
                        </>
                )}
               
                </PageHeaderControl>
            </React.Fragment>
        )
    }
    restoreArchived = () => {
    
            let heading_title='Restore Group Booking'
            let content= 'Are you sure you want to restore this group booking?';
            let  api_url = 'recruitment/RecruitmentInterview/rollback_archived_interviews';
            AjaxConfirm({ id: this.state.interview_id,isBulkRetrieve:false,retrieve_archive_id_list:[] }, 
                content, api_url, { confirm: 'Yes', heading_title,cancel:'No'}).
                then(result => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    this.getInterviewById(this.state.interview_id);
                } else {
                    if (result.error) {
                        toastMessageShow(result.error, "e");
                    }
                }
            })

        
    }

    getMeetingLink = () => {
        if(this.state.meeting_link && this.state.ms_event_status !=1){
            return (
                <React.Fragment>
                    <a href={this.state.meeting_link} style={{
                        background: '#0b09a233', color: '#0000ff', width: 'auto',
                        padding: '0', textAlign: 'center', width: '150px', padding: '2px 9px', borderRadius: '6px'
                    }}>Join conversation</a>                     
                </React.Fragment>);
        }else if(this.state.ms_event_status ==1){
            return (
                <React.Fragment>                    
                    <a href={this.state.meeting_options} disabled={true} style={{
                        background: '#0b09a233', color: '#0000ff', width: 'auto',
                        padding: '0', textAlign: 'center', width: '150px', padding: '2px 9px', borderRadius: '6px'
                    }}>Join conversation</a>                     
                </React.Fragment>);
        }else{
            return  'N/A';
        }
      
    }
    
    getFormatedDate(dDate) {
        return dDate ? moment(dDate).format("DD/MM/YYYY HH:mm") : ''
    }
    
    getQuizTemplateLabel(invite_type){
        return invite_type == 1 ? 'Quiz Template' : 'Meeting Invite Link';
    }

    getQuizTemplateValue(invite_type){
        return invite_type == 1 ? _.get(this.state, 'interview_type', '') : this.getMeetingLink();
    }
    
    returnlabel=(label)=>{
        return(
            <React.Fragment>
               <span style={{  fontSize: '1.3em',fontWeight: 'normal'}}>{label}</span>
            </React.Fragment>
        )
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
            }
        })

        const notAvailable = 'N/A' // this.props.notAvailable
        var formProps = [
            {
                rowclass: 'row',
                child: [
                   { value: '', label: this.returnlabel('Group Booking Details'), name:"groupbookingdetails", style: styles.headingText }, 
                ],
            },
            {
                rowclass: 'row',
                child: [
                   { value: '', label: this.returnlabel('Basics'), name:"basics", style: styles.headingText }, 
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: this.state.title, label: "Title", name:"title" },
                   { value: _.get(this.state, 'owner.label', ''), label: "Owner", name:"owner" },
                ],
            },
            {
                rowclass: 'row',
                child: [
                   { value: '', label: this.returnlabel('Date & Location'), name:"datenadlocation", style: styles.headingText }, 
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: this.getFormatedDate(this.state.interview_start_datetime), 
                     label: "Start Date Time", name:"startdatetime", colclass:"col col-sm-4" },
                   { value: this.getFormatedDate(this.state.interview_end_datetime), label: "End Date Time", name:"enddatetime", colclass:"col col-sm-4" },
                   { value: _.get(this.state, 'interview_duration', ''), label: "Duration(h)", name:"durationh", colclass:"col col-sm-4" },
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: _.get(this.state, 'location.label', ''), label: "Location", name:"location" },
                   { value: _.get(this.state, 'max_applicant', ''), label: "Max Applicant", name:"maxapplicant" },
                ],
            },
            {
                rowclass: 'row',
                child: [
                   { value: '', label: this.returnlabel('Invite Info'), name:"inviteinfo", style: styles.headingText }, 
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: _.get(this.state, 'interview_type', ''), label: "About", name:"about", colclass:"col col-sm-4" },
                   { value: this.getQuizTemplateValue(this.state.invite_type), label: this.getQuizTemplateLabel(this.state.invite_type), name:"quiztemplate", colclass:"col col-sm-4" },
                ],
            },
            {
                rowclass: 'row',
                child: [
                   { value: '', label: this.returnlabel('Notes'), name:"notes", style: styles.headingText }, 
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: _.get(this.state, 'description', ''), label: "Description", name:"description" }
                ],
            },
        ]

        return (
            <div className="row slds-box task_tab_des" style={styles.root}>
                <OncallFormWidget formElement={formProps} />
            </div>
        )
    }

    /**
     * Render related tab content
     * Cards - Attachment, Items
     */
    renderRelatedTab() {
        return (
            <React.Fragment>
                <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: 'none', paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
                </div>
                {this.renderApplicantsCard()}                              
            </React.Fragment>
        )

    }

    /**
     * Render line items card
     */
    renderApplicantsCard = () => {
        // Get line items table column
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                   {this.state.show_related_card && <ApplicantsCard
                     ref={this.applicantListRef}
                     interview_id={this.props.props.match.params.id}
                     {...this.state}
                     {...this.props}
                     archived={this.state.archive==0?false:true}
                     get_interview_by_id={this.getInterviewById}
                     listHeaderOptions={this.listHeaderOptions}
                    />}                    
                </div>
            </div>
        );
    }

    /**
     * Render the sidebar
     */
    renderSidebar() {
        const styles = css({
            root: {
                fontSize: 12,
                height: '100%',
                backgroundColor: 'white',
                border: 'none',
            },
            sidebarBlock: {
                marginBottom: 15,
            },
        })

        return (
            <div style={styles.root} className="SLDSRightSidebar"></div>
        )
    }

    /**
     * Render Modal
     * - Owner Change
     */
    renderModal = () => {
        return (
            <>
                {
                    this.state.openCreateInterview &&
                    <CreateInterviewModal
                        interview_id={this.state.selected_id}
                        showModal={this.state.openCreateInterview}
                        closeModal={this.closeModal}
                        headingTxt="New Form"
                        interview_stage_status={this.state.interview_stage_status}
                        applicantRef={this.applicantListRef.current.getWrappedInstance()}
                        page_name={'from_details'}
                        {...this.props}
                    />
                }
                {this.state.showInterviewArchiveModal && <ArchiveModal
                        id={this.state.archive_interview_id}
                        msg={'Group Booking'}
                        content={'Are you sure you want to archive this group booking ?'}
                        confirm_button={'Archive Group Booking'}
                        api_url={'recruitment/RecruitmentInterview/archive_interview'}
                        close_archive_modal={this.closeInterviewArchiveModal}
                        on_success={() => this.closeAndRedirectListPage()}

                    />}
                {this.state.showApplicantBulkUpdateStatus && <ApplicantBulkUpdateStatus
                        interview_id={this.state.selected_id}
                        selected_applicant={this.state.selected_applicant}
                        showModal={this.state.showApplicantBulkUpdateStatus}
                        closeModal={this.closeModal}
                        headingTxt="New Form"
                        interview_stage_status={this.state.interview_stage_status}
                        {...this.props}
                    />}

                {this.state.openCreateCabCertificate &&
                        <CreateCabCertificate
                            application_list = {this.state.applicants}
                            isBulkApplication = {true}
                            group_booking_applicant = {true}
                            showModal = {this.state.openCreateCabCertificate}
                            closeModal = {this.closeModal}
                            {...this.state}
                            {...this.props}
                        />
                }
                {this.state.openEmploymentContract &&
                        <CreateEmployerContract
                            application_list = {this.state.applicants}
                            isBulkApplication = {true}
                            group_booking_applicant = {true}
                            showModal = {this.state.openEmploymentContract}
                            closeModal = {this.closeModal}
                            from_group_booking_page = {true}
                            {...this.state}
                            {...this.props}
                        />
                }

                {this.state.openCancelInvite &&
                    <GBCancelInvite
                        showModal={this.state.openCancelInvite}
                        closeModal={this.closeModal}
                        applicantRef={this.applicantListRef.current.getWrappedInstance()}
                        is_organizer={true}
                        applicant_archive = {0}
                        {...this.state}
                        {...this.props}
                    />
                }
            </>
        );
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }

        const styles = css({
            root: {
                fontFamily: 'Salesforce Sans, Arial, Helvetica, sans-serif',
                marginRight: -15,
                fontSize: 13,
            }
        })

        return (
            <div className="ServiceAgreementDetails slds pb-5" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    {this.renderPageHeader()}
                    {this.renderSldsPath()}
                    {/* let's use the usual bootstrap grid system.
                    The grid system lightning provides is SUPER TERRIBLE in terms of spacing and creating responsive sidebars */}

                    <div className="">
                        <div class="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box">
                                        <Tabs>
                                            <TabsPanel label="Related">
                                                {this.renderRelatedTab()}
                                            </TabsPanel>
                                            <TabsPanel label="Details">
                                                {this.renderDetailsTab()}
                                            </TabsPanel>
                                            <TabsPanel label="Feed" id="application_feed">
                                            <Feed
                                                  ref={ref => (this.history = ref)}
                                                  items={this.state.fieldHistory}
                                                  sourceId={this.state.interview_id}
                                                  relatedType={"interview"}
                                                  getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                                                />
                                            </TabsPanel>
                                        </Tabs>
                                    </div>

                                    {
                                        false && (
                                            <div className="col col-sm-3">
                                                {this.renderSidebar()}
                                            </div>
                                        )
                                    }
                                </div>
                                {/* Create task for Application */}
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12">
                                    <div className="white_bg_color slds-box task_tab_des">
                                        <div class="slds-grid slds-grid_vertical ">
                                            <div class="slds-col ">
                                                <label>Activity</label>
                                                <CreateActivityComponent
                                                    sales_type={"interview"}
                                                    salesId={this.state.interview_id}
                                                    related_type="9"
                                                />
                                            </div>
                                        </div>

                                        <div class="slds-col  slds-m-top_medium">
                                            <label>Activity</label>
                                            <ActivityTimelineComponent
                                                sales_type={"interview"}
                                                salesId={this.state.interview_id}
                                                related_type="9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </IconSettings>
                {this.renderModal()}
            </div>
        )
    }
}
const mapStateToProps = state => ({
    sms_feed_refresh: state.RecruitmentReducer.recruit_refresh.groupbooking_feed,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        set_feed_refresh: (request) => dispatch({ type: 'SET_FEED_SMS_RECIPIENT', condition: request }),
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(InterviewDetails);