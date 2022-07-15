// @ts-nocheck
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
    Dropdown,
} from '@salesforce/design-system-react'
import { connect } from 'react-redux'
import { ROUTER_PATH } from '../../../../config.js'
import { postData, css } from '../../../../service/common'
import ApplicationStatusPath from './ApplicationStatusPath.jsx'
import { getApplicantInfoByJobId, applicationMandatoryDocument, onlineAssementTemplate } from '../actions/RecruitmentApplicantAction';
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import FormCard from './forms/FormCard.jsx';
import QuizCard from './quizzes/QuizCard.jsx';
import Feed from '../../salesforce/lightning/SalesFeed.jsx';
import DocumentCard from './document/DocumentCard.jsx';
import DocusignCard from './docusign/DocusignCard.jsx';
import ReferenceCard from './reference/ReferenceCard.jsx';

import { save_viewed_log } from '../../../admin/actions/CommonAction.js';
import CreateCabCertificate from './application_header_action/CreateCabCertificate.jsx';
import OwnerChangeModal from './OwnerChangeModal.jsx';
import CreateMemberModal from './application_header_action/CreateMemberModal.jsx';
import AssessmentInitiateModel from './application_header_action/AssessmentInitiateModel.jsx';
import TransferApplicationModel from './application_header_action/TransferApplicationModel.jsx';
import {getAddressForViewPage} from '../../oncallui-react-framework/services/common';
import OncallFormWidget from '../../oncallui-react-framework/input/OncallFormWidget';
import OnlineAssessmentDetails from './OnlineAssessmentDetails';
class ApplicationDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'details',
            loading: false,
            redirectTo: null,
            form_list: [],
            openItemDialog: false,
            callGetLineItem: false,
            sa_account_name: '',
            service_docusign_datas: [],
            activity_page: false,
            fieldHistory: [],
            prevProps : window.location.pathname,
            applicant_id: this.props.props.match.params.id,
            openTransferApplication: false,
            create_member_disable : 'true',
            document_list_ref: false,
            applicant_phone: '',
            applicant_email: '',
            job_category_label: '',
            applicant_address : '',
            job_category : '',
            online_assessment_disable: false
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
        // item listing
        this.reactTable = React.createRef();
        this.documentListRef = React.createRef();
    }

    componentDidMount() {
        this.getFieldHistoryItems();
        this.getTheExistingOAStatus();
        
        // save viewed log
        if (this.props.props.match.params.application_id) {
            save_viewed_log({ entity_type: 'application', entity_id: this.props.props.match.params.application_id });
        } else {
            save_viewed_log({ entity_type: 'applicant', entity_id: this.props.props.match.params.id });
        }
    }

    componentWillUpdate(props) {
        if (props.sms_feed_refresh === true) {
            this.getFieldHistoryItems();
            this.props.set_feed_refresh(false);
        }
    }

    /**
     * When component is mounted, remove replace the parent element's
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentWillMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.getApplicantInfoByJobId();        
        this.checkApplicantAlreadyChangedMember();
    }

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        // jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }
    
    componentWillReceiveProps(props){
        if(props.application_phones.length > 0){
            this.setState({ applicant_phone: props.application_phones[0].phone })
        }
        
        if(props.application_emails.length > 0) {
            this.setState({ applicant_email: props.application_emails[0].email })
        }        
       
        if(props.applications && 
           props.applications.job_details && 
           props.applications.job_details.job_category_label) {
            this.setState({ job_category_label: props.applications.job_details.job_category_label, job_category: props.applications.job_details.category});                        
           
        }
    }
    componentDidUpdate(prevProps) {
        if(this.props.applications.jobId && this.props.applications.jobId != prevProps.applications.jobId)
        { 
            //Pull the template only for Field staff(1) category
            if(this.props.applications.job_details != undefined && this.props.applications.job_details.category == 1) {
                this.getAssementTemplate(this.props.applications.jobId);
            }           
        }        
   
     }
    /**
     * Fetch applications by job ID
     * @param {number} id
     */
    getApplicantInfoByJobId = () => {
        // this.setState({ loading: true })
        this.props.getApplicantInfoByJobId(this.props.props.match.params.id, false, this.props.props.match.params.application_id);
        this.setState({activity_page : true})
    }
    getFieldHistoryItems() {
        postData('recruitment/RecruitmentApplicant/get_field_history', { application_id: this.props.props.match.params.application_id }).then(resp => {
            let items = resp.data;
            this.setState({ fieldHistory: items }, () => {
                // call history component func
                if (this.props.applications.id ) {
                    this.history.updateItemsList();
                }
            });
        });
    }
    // check if the applicant already changed as member or not
    checkApplicantAlreadyChangedMember(){
        postData('recruitment/RecruitmentApplicant/check_applicant_already_active', { applicant_id: this.props.props.match.params.id }).then(res => {
            if (res.status) {
				this.setState({
					create_member_disable: res.is_member
				})
			}
        });
    }

    // check if the applicant already changed as member or not
    getTheExistingOAStatus(){
        let req = {
            applicant_id: this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id
        }
        postData('recruitment/OnlineAssessment/get_exisiting_oa_assessment_by_status', req).then(res => {
            if (res.status) {
				this.setState({
					online_assessment_disable: res.status
				})
			}
        });
    }

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
     * Open create cab certificate or transfer application
     */
    showHeaderActionModal = (header_action) => {
        if(header_action==1){
            this.showCreateMemberModal();
        }
        if(header_action == 2){
            this.setState({
                openTransferApplication: true,
            });
        }
    }

    /**
     * Close the modal when user save the applicant and refresh the table
     * Get the Unique reference id
     */
    closeHeaderActionModal = (status) => {
        this.setState({ openCreateCabCertificate: false, document_list_ref: true });

        if (status) {
            this.getMandatoryDocuments();
            this.documentListRef.componentDidMount();
            this.setState({ document_list_ref: false });
        }
    }

    /**
     * Get mandatory documents
     * @param {int} id
     */
     getMandatoryDocuments = () => {
        var req = { applicant_id: this.props.props.match.params.id, application_id: this.props.props.match.params.application_id }
        this.props.getApplicationMandatoryDocument(req);
    }

     /**
     * Get Online Assessment Template
     * @param {int} job_id
     */
    getAssementTemplate = (jobId) => {
        var req = { job_id: jobId }
        this.props.getOnlineAssementTemplate(req);
    }

    /**
     * Open change owner modal
     */
    showChangeOwnerModal = () => {
        let selected_application = [{
            applicant_id: this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id,
            jobId: this.props.applications.jobId,
            recruiter: this.props.applications.recruiter,
            id:this.props.applications.id,
        }];
        this.setState({openOwnerChangeModal : true,  selected_application: selected_application})
    }
    /**
     * Close the modal when user save the owner
     * Get the Unique reference id
     */
    closeChangeOwnerModal = (status) =>{
        this.setState({openOwnerChangeModal : false});
        if(status){
            this.getApplicantInfoByJobId();
            this.getFieldHistoryItems();
        }
    }

    /**
     * Close the modal when  and refresh the table
     */
    closeTransferAppHeaderActionModal = () => {
        this.setState({ openTransferApplication: false});
        this.getApplicantInfoByJobId();
        this.getFieldHistoryItems();
    }

    /**
     * Open create member modal
     */
     showCreateMemberModal = () => {
        this.setState({openCreateMemberModal : true, })
    }
    /**
     * Close the modal when user save the member
     * Get the Unique reference id
     */
    closeCreateMemberModal = (status) =>{
        this.setState({openCreateMemberModal : false});
        if(status){
            this.getApplicantInfoByJobId();
            this.checkApplicantAlreadyChangedMember();
        }
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        console.log(this.props,'props');
        let details=[
            {
                label: 'Job',
                content: <Link to={ROUTER_PATH + `admin/recruitment/job_opening/create_job/${this.props.applications.jobId}/E`} className="reset" style={{ color: '#006dcc' }} title={'Job'}>{this.props.applications.position_applied}</Link>
            },
            {
                label: 'Applicant',
                content: <Link to={ROUTER_PATH + `admin/recruitment/applicant/${this.props.applications.applicant_id}`} className="reset" style={{ color: '#006dcc' }} title={'Job'}>{this.props.applicant_details ? this.props.applicant_details.fullname : ''}</Link>
            },
            {
                label: 'Applied Date',
                content: this.props.applications ? this.formatDate(this.props.applications.created) : ''
            },
            {
                label: 'Owner',
                content: <Link to={ROUTER_PATH + `admin/recruitment/staff_details/${this.props.applications.recruiter}/`}
                    className="vcenter default-underlined slds-truncate"
                    style={{ color: '#0070d2' }}>
                    {this.props.applications.recruiter_fullname}
                </Link>
            },
            {
                label: 'Referred By',
                content: this.props.applicant_details ? this.props.applicant_details.referred_by : ''
            },
           
        ];
        if(this.props.applicant_details['business_unit_name'])
        {
            details.push( {
                label: 'Business Unit',
                content:  this.props.applicant_details['business_unit_name']
            });
        }
      
        return (
            <PageHeader
                details={details}
                icon={
                    <Icon
                        assistiveText={{ label: 'Lead' }}
                        category="standard"
                        name={`file`}
                    />
                }
                label={`Application`}
                title={this.props.applications.id}
                variant="record-home"
                onRenderActions={this.actions}
            />
        )
    }

    /**
     * Action renderer for `<PageHeader />`
     */
    actions = () => {
        let showCreateMember = false;
        if(this.state.create_member_disable=='true' || this.props.applicant_details.flagged_status == 2){
            showCreateMember = true;
        }else{
            if(this.props.application_process_status!=7){
                showCreateMember = true;
            }   
        }
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                <AssessmentInitiateModel
                        disabled={this.props.applicant_details.flagged_status == 2 || this.props.application_process_status==8 || this.state.online_assessment_disable} 
                        containsInvalidApplications={false}
                        {...this.state}
                        isJobDetailsPage={true}
                        selection={this.state.selected_application}
                        jobId = {this.props.applications.jobId}
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                        job_category={this.state.job_category}
                        templateList={this.props.assessment_templates}
                        closeModal={this.closeChangeOwnerModal}
                 />
                <Button label="Change Owner" disabled={showCreateMember} id="change_owner" title={`Change Owner`} onClick={() => this.showChangeOwnerModal()}/>
                <Button label="CAB Certificate" disabled={this.props.applicant_details.flagged_status == 2 || false} id="cab_certificate" title={`Cab Certificate`} onClick={() => { this.setState({openCreateCabCertificate: true });}}/>
                    <Dropdown
                        id="header_drop_down"
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-medium"
                        iconVariant="border-filled"
                        disabled={this.props.applicant_details.flagged_status == 2 || false}
                        onSelect={(e) => {
                        //call the cab certificate / tranfer application
                        this.showHeaderActionModal(e.value);
                        }}
                        width="xx-small"
                        options={[                            
                            { label: 'Transfer Application', value: '2' },
                            { label: 'Create support worker', value: '1', disabled: showCreateMember },
                        ]}
                    />
                </ButtonGroup>
            </PageHeaderControl>
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
                rowclass: 'row py-1 mb-3',
                child: [
                   { value: this.props.applicant_details.fullname, label: "Applicant Name", name:"applicantname" }, 
                   { value: this.state.applicant_phone ? ('+61 ' +this.state.applicant_phone) : 'N/A', label: "Phone", name:"phone" }
                ],
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [                
                    { value: this.props.applicant_details.middlename, label: "Middle name", name:"middlename" },
                    { value: this.props.applicant_details.previous_name, label: "Previous name", name:"previousname" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [                
                    { value: this.props.applicant_details.dob, label: "Date of Birth", name:"dob" },
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.state.applicant_email, label: "Email", name:"email" },
                    { value: this.props.is_manual_address==1 ? getAddressForViewPage(this.props.manual_address, this.props.unit_number) :  (this.props.address ?  getAddressForViewPage(this.props.address, this.props.unit_number) : 'N/A'), label: "Primary Address", name:"primaryaddress" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.applications.id, label: "Application Id", name:"applicationid" },
                    { value: this.formatDate(this.props.applications.created), label: "Date Applied", name:"dateapplied" }
                ]
            },
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.applications.position_applied, label: "Job Title", name:"jobtitle" },
                    { value: this.state.job_category_label, label: "Job Category", name:"jobcategory" } 
                ]
            },
            
            {
                rowclass: 'row py-1 mb-3',
                child: [
                    { value: this.props.applications.channel, label: "Applied Through", name:"appliedthrough" },
                    { value: this.props.applications.employement_type, label: "Employment Type", name:"employmenttype" }
                ]
            }
            
        ]

        return (
            <React.Fragment>
            {this.state.activity_page && this.props.applications.id ? <div className="row slds-box task_tab_des" style={styles.root}>
            <div className="col col col-sm-12" style={styles.heading}>
                <h3 style={styles.headingText}>Applicant Information</h3>
            </div>
            
            <OncallFormWidget formElement={formProps} />

            </div> : ''}
            </React.Fragment>
        )
    }
    /**
     * Render related tab content
     * Cards - Attachment, Items
     */
    renderRelatedTab() {

        const id = _.get(this.props, 'props.match.params.id')

        return (
            <React.Fragment>
                <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: 'none', paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
                </div>
                {this.renderHeaderAction()}
                {this.renderChangeOwnerModal()}
                {this.renderCreateMemberModal()}
                {this.renderOnlineAssessment()}
                {this.renderForms()}
                {/*this.renderQuizzes()*/}
                {this.renderDocuments()}
                {this.renderDocuSign()}
                {this.renderReference()}
            </React.Fragment>
        )

    }

    /**
     * Render Header action for change owner/ cab certificate
     */
    renderHeaderAction = () => {
        return (
            <React.Fragment>
                {
                    this.state.openCreateCabCertificate && (
                        <CreateCabCertificate
                            applicant_id={this.props.props.match.params.id}
                            application_id={this.props.props.match.params.application_id}
                            applicant_email={this.props.application_emails ? this.props.application_emails[0].email : ''}
                            isBulkApplication={false}
                            showModal = {this.state.openCreateCabCertificate}
                            closeModal = {()=>this.closeHeaderActionModal(true)}
                            {...this.props}
                        />
                    )
                }
                {
                    this.state.openTransferApplication && (
                        <TransferApplicationModel
                            applicant_id={this.props.props.match.params.id}
                            application_id={this.props.props.match.params.application_id}
                            showModal = {this.state.openTransferApplication}
                            closeModal = {()=>this.closeTransferAppHeaderActionModal(true)}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Render Modal  Owner Change
     */
    renderChangeOwnerModal= () => {
        return (
            <>
            {
                this.state.openOwnerChangeModal &&
                    <OwnerChangeModal
                        selection={this.state.selected_application}
                        closeModal={this.closeChangeOwnerModal}
                        openModal={this.state.openOwnerChangeModal}

                    />
            }
            </>
        );
    }

    /**
     * Render Modal  create member
     */
    renderCreateMemberModal= () => {
        return (
            <>
            {
                this.state.openCreateMemberModal &&
                    <CreateMemberModal
                        is_bulk_update = {false}
                        selection={this.state.selected_application}
                        closeModal={this.closeCreateMemberModal}
                        openModal={this.state.openCreateMemberModal}
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                    />
            }
            </>
        );
    }
    
    renderOnlineAssessment = () => {
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                    <OnlineAssessmentDetails
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                    />
                </div>
            </div>
        );
    }

    /**
     * Render line items card
     */
    renderForms = () => {
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                    <FormCard
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                        flagged_status={this.props.applicant_details.flagged_status}
                        referred_by={this.props.applicant_details.referred_by}
                    />
                </div>
            </div>
        );
    }
    renderQuizzes = () => {
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
            <div className="slds-grid slds-grid_vertical slds-related-tab-details">
                <QuizCard
                    applicant_id={this.props.props.match.params.id}
                    application_id={this.props.props.match.params.application_id}
                    flagged_status={this.props.applicant_details.flagged_status}
                />
            </div>
        </div>
        );
    }
    renderDocuments = () => {
        // Card style
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });

        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3 slds_my_card">
                <div className="slds-grid slds-grid_vertical">
                   {this.props.applicant_details && this.props.applicant_details.jobId && <DocumentCard
                        ref={e => this.documentListRef = e}
                        document_list_ref={this.state.document_list_ref}
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                        flagged_status={this.props.applicant_details.flagged_status}
                        jobId={this.props.applicant_details.jobId}
                        user_page={'application_details'}
                    />}
                </div>
            </div>
        );
    }

    renderDocuSign = () => {
        // Card style
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });

        let applicantAddress = '';  
        if (Number(this.props.is_manual_address) === 1) {
            applicantAddress = getAddressForViewPage(this.props.manual_address, this.props.unit_number);
        } else if (this.props.address) {
            applicantAddress = getAddressForViewPage(this.props.address, this.props.unit_number)
        }
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3 slds_my_card">
                <div className="slds-grid slds-grid_vertical">
                    <DocusignCard
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                        applicant_details={this.props.applicant_details}
                        flagged_status={this.props.applicant_details.flagged_status}
                        applicant_address={applicantAddress}
                    />
                </div>
            </div>
        );
    }

    /**
     * Render reference
     */
    renderReference = () => {
        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3 slds_my_card">
                <div className="slds-grid slds-grid_vertical">
                    <ReferenceCard
                        applicant_id={this.props.props.match.params.id}
                        application_id={this.props.props.match.params.application_id}
                        applicant_details={this.props.applicant_details}
                        flagged_status={this.props.applicant_details.flagged_status}
                    />
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
            <div className="ServiceAgreementDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    {this.renderPageHeader()}

                    {/* let's use the usual bootstrap grid system.
                    The grid system lightning provides is SUPER TERRIBLE in terms of spacing and creating responsive sidebars */}
                    {(this.props.applications.length > 0 || this.props.applications) && <ApplicationStatusPath
                        {...this.state}
                        {...this.props}
                        get_applicant_info_by_application_id={this.getApplicantInfoByJobId}
                        getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                        is_document_marked={this.props.is_document_marked}
                        is_reference_marked={this.props.is_reference_marked}
                        flagged_status={this.props.applicant_details.flagged_status}
                    />}

                    <div className="">
                        <div class="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box ">
                                        <Tabs>
                                            <TabsPanel label="Related">
                                                {this.renderRelatedTab()}
                                            </TabsPanel>
                                            <TabsPanel label="Details">
                                                {this.renderDetailsTab()}
                                            </TabsPanel>
                                            <TabsPanel label="Feed" id="application_feed">
                                             {this.props.applications.id ? <Feed
                                                  ref={ref => (this.history = ref)}
                                                  items={this.state.fieldHistory}
                                                  sourceId={this.props.props.match.params.application_id}
                                                  relatedType={"application"}
                                                  getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                                                  applicant_name = {this.props.applicant_details ? this.props.applicant_details.fullname : ''}
                                                /> : ''}
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
                                                {this.state.activity_page && this.props.applications.id ? <CreateActivityComponent
                                                    sales_type={"application"}
                                                    salesId={this.props.props.match.params.application_id}
                                                    applicant_id={this.props.props.match.params.id}
                                                    application_id={this.props.props.match.params.application_id}
                                                    person_id={this.props.applicant_details.person_id}
                                                    related_type="8"
                                                /> : ''}
                                            </div>
                                        </div>

                                        <div class="slds-col  slds-m-top_medium">
                                            <label>Activity</label>
                                            <ActivityTimelineComponent
                                                sales_type={"application"}
                                                salesId={this.props.props.match.params.application_id}
                                                related_type="8"
                                                applicant_id={this.state.applicant_id}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </IconSettings>
            </div>
        )
    }
}
const mapStateToProps = state => ({
    ...state.RecruitmentApplicantReducer.applicant_address,
    prev_application_process_status: state.RecruitmentApplicantReducer.applications.prev_application_process_status,
    application_process_status: state.RecruitmentApplicantReducer.applications.application_process_status,
    is_document_marked: state.RecruitmentApplicantReducer.applications.is_document_marked,
    is_reference_marked: state.RecruitmentApplicantReducer.applications.is_reference_marked,
    process_status_label: state.RecruitmentApplicantReducer.applications.process_status_label,
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    applicant_details: state.RecruitmentApplicantReducer.details,
    applications: state.RecruitmentApplicantReducer.applications,
    last_update: state.RecruitmentApplicantReducer.last_update,
    application_emails: state.RecruitmentApplicantReducer.emails,
    application_phones: state.RecruitmentApplicantReducer.phones,
    info_loading: state.RecruitmentApplicantReducer.info_loading,
    assessment_templates: state.RecruitmentApplicantReducer.OAtemplateList,
    sms_feed_refresh: state.RecruitmentReducer.recruit_refresh.groupbooking_feed,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfoByJobId: (applicant_id, loading, application_id) => dispach(getApplicantInfoByJobId(applicant_id, loading, application_id)),
        getApplicationMandatoryDocument: (request) => dispach(applicationMandatoryDocument(request)),
        getOnlineAssementTemplate: (request) => dispach(onlineAssementTemplate(request)),
        set_feed_refresh: (request) => dispach({ type: 'SET_FEED_SMS_RECIPIENT', condition: request }),
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(ApplicationDetails);