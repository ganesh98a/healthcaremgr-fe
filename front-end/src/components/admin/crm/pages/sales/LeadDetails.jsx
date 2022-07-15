import '../../../scss/components/admin/crm/pages/sales/LeadDetails.scss';
import {
    Button,
    ButtonGroup,
    Icon,
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Tabs,
    TabsPanel,
} from '@salesforce/design-system-react';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import { get_contact_name_search_for_email_act } from 'components/admin/crm/actions/ContactAction.jsx';
import { get_sales_activity_data } from 'components/admin/crm/actions/SalesActivityAction.jsx';
import jQuery from 'jquery';
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../../../../../config.js';
import { AjaxConfirm, css, postData, toastMessageShow } from '../../../../../service/common';
import { save_viewed_log } from '../../../actions/CommonAction.js';
import Feed from '../../../salesforce/lightning/SalesFeed.jsx';
import AttachmentCard from '../AttachmentCard.jsx';
import ConvertLeadModal from './ConvertLeadModal.jsx';
import EditLeadModal from './EditLeadModal.jsx';
import LeadDocuSignCard from './LeadDocuSignCard';
import LeadPath from './LeadPath.jsx';
import AvatarIcon from '../../../oncallui-react-framework/view/AvatarIcon';

/**
 * @typedef {typeof LeadDetails.defaultProps} Props
 * 
 * Renders the leads details page
 * 
 * @extends {React.Component<Props>}
 */
class LeadDetails extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);
        this.state = {

            // modal states
            editLeadModal: false,
            deleteLeadModal: false,
            openConvertModal: false,

            activeTab: 'activity',
            loading: false,
            redirectTo: null,
            unqualified_reason_option : [],
            prevProps : window.location.pathname,
            fieldHistory: [],
            // will populate more items when `get_lead_details` was first called
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef()
        this.leadPathRef = React.createRef()
        this.leadCreateActivity = React.createRef()
    }

    /**
     * When component is mounted, remove replace the parent element's 
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')

        const id = _.get(this.props, 'props.match.params.id')
        this.get_lead_details(id);
        this.getFieldHistoryItems(id);
        // save viewed log
        save_viewed_log({ entity_type: 'lead', entity_id: this.props.props.match.params.id });
    }

    getFieldHistoryItems(id) {
        postData('sales/LeadHistory/get_field_history', { lead_id: id }).then(resp => {
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

    componentDidUpdate(prevProps) {
        if (window.location.pathname != prevProps.props.location.pathname) {
            this.setState({ prevProps: window.location.pathname })
            const id = _.get(this.props, 'props.match.params.id')
            this.get_lead_details(id);
        }
    }

    /**
     * Fetch lead details
     * 
     * Will fetch when:
     * - This component was mounted
     * - Lead was successfully updated
     */
    get_lead_details = (id) => {
        this.setState({ loading: true })

        postData('sales/Lead/get_lead_details', { id })
            .then((result) => {
                if (result.status) {
                    this.setState({ ...result.data, lead: result.data })
                } else {
                    console.error('Could not fetch lead details')
                }
            })
            .catch(() => console.error('Could not fetch lead details'))
            .finally(() => this.setState({ loading: false }))
    }


    handleOnArchiveLead = () => {
        const id = _.get(this.props, 'props.match.params.id')
        this.setState({ deleteLeadModal: id })

        const msg = `Are you sure you want to archive this lead?`
        const confirmButton = `Archive lead`

        AjaxConfirm({ id }, msg, `sales/Lead/archive_lead`, { confirm: confirmButton, heading_title: `Archive lead` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.setState({ redirectTo: ROUTER_PATH + `admin/crm/leads` })
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })

    }

    openConvertModal = () => {
        this.setState({openConvertModal: true})
    }

    closeConvertModal = (status) => {
        this.setState({ openConvertModal: false })
        this.leadPathRef.current.closeConvertModal()
        this.refs.leadCreateActivity.getWrappedInstance().getOptionsContactName();
    }

   pageTitle = () => {
    return this.state.lead_topic +' - (' +this.state.lead_number+')';
   }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        return (
            <PageHeader
                details={[
                    {
                        label: 'Assigned To',
                        content: this.renderRelatedOwnerLink()
                    }
                ]}
                icon={
                    <AvatarIcon assistiveText="Lead" avatar={this.state.avatar} category="standard" name="lead" />
                }
                label={`Lead`}
                title={this.pageTitle()}
                variant="record-home"
                onRenderActions={this.actions}
            />
        )
    }

    /**
     * Action renderer for `<PageHeader />`
     */
    actions = () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list">
                    {
                        [1, '1', true].indexOf(this.state.is_converted) >= 0 ?
                            (
                                <Link
                                    to={ROUTER_PATH + `admin/crm/opportunity/${this.state.converted_opportunity_id}`}
                                    title={`Navigate to related opportunity`}
                                    className={`slds-button slds-button_neutral`}
                                >
                                    View opportunity
                                </Link>
                            )
                            :
                            (
                                <Button
                                    label="Convert"
                                    title={`Convert lead to account, contact and opportunity`}
                                    disabled={[0, '0'].indexOf(this.state.is_converted) < 0}
                                    onClick={() => this.setState({ openConvertModal: true })}
                                />
                            )
                    }
                </ButtonGroup>
                <ButtonGroup variant="list">
                    <Button label="Edit" title={`Update lead`} onClick={() => this.setState({ editLeadModal: true })} />
                    <Button label="Delete" title={`Remove lead`} onClick={this.handleOnArchiveLead} />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }


    /**
     * Renders the link related to owner.
     * The link generated will link back to **Members** module
     */
    renderRelatedOwnerLink() {
        const memberId = _.get(this.state, 'lead_owner', null)
        if (!memberId) {
            return this.props.notAvailable
        }

        const owner_firstname = _.get(this.state, 'lead_owner_member.firstname', null)
        const owner_lastname = _.get(this.state, 'lead_owner_member.lastname', null)
        const owner_fullname = [owner_firstname, owner_lastname].filter(Boolean).join(' ')

        const link = ROUTER_PATH + `admin/support_worker/about/${memberId}/details`
        const tooltip = `${owner_fullname} \nClicking will take you to Members module`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{owner_fullname}</Link>
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

        const details = [
            {
                label: 'Service type',
                value: this.state.lead_topic,
            },
            {
                label: 'Assigned To',
                value: [
                    _.get(this.state, 'lead_owner_member.firstname', null),
                    _.get(this.state, 'lead_owner_member.lastname', null),
                ].filter(Boolean).join(' '),
            },
            {
                label: 'First name',
                value: this.state.firstname,
            },
            {
                label: 'Middle name',
                value: this.state.middlename,
            },
            {
                label: 'Last name',
                value: this.state.lastname,
            },
            {
                label: 'Previous name',
                value: this.state.previous_name,
            },
            {
                label: 'Email',
                value: this.state.email,
            },
            {
                label: 'Phone',
                value: this.state.phone,
            },
            {
                label: 'Referring Organization (if applicable)',
                value: this.state.lead_company,
            },
            {
                label: 'Lead source',
                value: _.get(this.state, 'lead_source_code_details.display_name'),
            },
            {
                label: 'Description',
                value: this.state.lead_description,
            },
        ]


        return (
            <>
                <div className="row slds-box" style={styles.root}>
                    <div className="col col col-sm-12" style={styles.heading}>
                        <h3 style={styles.headingText}>Lead details</h3>
                    </div>
                    {
                        details.map((detail, i) => {
                            return (
                                <div key={i} className="col col-sm-6" style={styles.col}>
                                    <div className="slds-form-element">
                                        <label className="slds-form-element__label">{detail.label}</label>
                                        <div className="slds-form-element__control">
                                            {detail.value || notAvailable}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="row slds-box" style={styles.root}>
                    <div className="col col col-sm-12" style={styles.heading}>
                        <h3 style={styles.headingText}>Referrer details</h3>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">First Name</label>
                            <div className="slds-form-element__control">
                                {this.state.referrer_firstname || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Last Name</label>
                            <div className="slds-form-element__control">
                                {this.state.referrer_lastname || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Email</label>
                            <div className="slds-form-element__control">
                                {this.state.referrer_email || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Phone</label>
                            <div className="slds-form-element__control">
                                {this.state.referrer_phone || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col col-sm-6" style={styles.col}>
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Relationship to Participant</label>
                            <div className="slds-form-element__control">
                                {this.state.referrer_relation || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
        </>
        )
    }

    renderRelatedTab() {
        const id = _.get(this.props, 'props.match.params.id')

        return (
            <React.Fragment>
                <div className="slds-col">
                    <AttachmentCard 
                        object_type={AttachmentCard.OBJECT_TYPE_LEAD}
                        object_id={id}
                        attachments={this.state.attachments}
                        onSuccessUploadNewFiles={() => this.get_lead_details(id)}
                    />                    
                </div>
                {this.state.lead_status_key_name !== "open" && <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                    <LeadDocuSignCard
                        lead_id={this.props.props.match.params.id}
                        serviceAgreements={this.state.service_agreement_summary || []}
                        openCreateServiceAgreementFn={() => this.openServiceModal()}
                        lead={this.state.lead}
                        lead_docusign_datas={this.state.lead && this.state.lead.lead_docusign_datas}
                        get_lead_details={() => this.get_lead_details(id)}
                    />
                    </div>
                </div>}
            </React.Fragment>
        )
    }

    closeServiceModal=()=>{
        this.setState({openServiceDialog:false});
        this.get_lead_details(this.props.props.match.params.id);
    }
    /**
     * Renderr the sidebar
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
            <div className="white_bg_color slds-box">
                <div className="slds-grid slds-grid_vertical ">
                    <div className="slds-col">
                        <label>Activity</label>
                        <CreateActivityComponent
                            sales_type={"lead"}
                            salesId={this.props.props.match.params.id}
                            //ref={this.leadCreateActivity}
                            ref="leadCreateActivity"
                            related_type="2"
                        />
                    </div>
                </div>

                <div className="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                    <ActivityTimelineComponent
                        sales_type={"lead"}
                        salesId={this.props.props.match.params.id}
                        related_type="2"
                        prevProps={this.state.prevProps}
                    />
                </div>
            </div>
        )
    }

    refreshAfterConverted = () => {
        const id = _.get(this.props, 'props.match.params.id');
        this.get_lead_details(id);
        this.props.get_sales_activity_data({ salesId: id, sales_type: "lead", related_type: 2 });
        this.getFieldHistoryItems(id);
    }

    /**
     * Render modals here
     */
    renderModals() {
        // lead ID
        const id = _.get(this.props, 'props.match.params.id')

        return (
            <React.Fragment>
                {
                    this.state.editLeadModal && (
                        <EditLeadModal id={id}
                            open={this.state.editLeadModal}
                            onClose={() => this.setState({ editLeadModal: false })}
                            onSuccess={() => {
                                this.setState({ editLeadModal: false })
                                this.get_lead_details(id)
                                this.getFieldHistoryItems(id)
                            }}
                        />
                    )
                }
                {
                    this.state.openConvertModal && (
                        <ConvertLeadModal
                            leadId={id}
                            showModal={this.state.openConvertModal}
                            closeModal={this.closeConvertModal}
                            onSuccess={() => this.refreshAfterConverted()}
                        />
                    )
                }
            </React.Fragment>
        )
    }


    render() {
       
        // This will only run when you archive lead
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
            <div className="LeadDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col">
                            {this.renderPageHeader()}
                        </div>
                        
                        <LeadPath
                            ref={this.leadPathRef}
                            {...this.state}
                            get_lead_details={this.get_lead_details}
                            openConvertModal= {this.openConvertModal}
                            get_history_items={(id) => this.getFieldHistoryItems(id)}
                        />

                        <div className="slds-col LeadDetailsContentArea">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box ">
                                        <Tabs>
                                            <TabsPanel label="Details">
                                                {this.renderDetailsTab()}
                                            </TabsPanel>
                                            <TabsPanel label="Related">
                                                { this.renderRelatedTab() }
                                            </TabsPanel>
                                            <TabsPanel label="Feed" id="lead_feed">
                                                <Feed 
                                                  ref={ref => (this.history = ref)}
                                                  items={this.state.fieldHistory}
                                                  sourceId={this.props.props.match.params.id}
                                                  relatedType={"lead"}
                                                  getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                                                />
                                            </TabsPanel>
                                        </Tabs>
                                    </div>
                                </div>
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12 SLDSRightSidebarParent">
                                    {this.renderSidebar()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {this.renderModals()}
                </IconSettings>
            </div>
        );
    }

    openServiceModal() {
        this.setState({openServiceDialog: true});
    }
} 

const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
        get_sales_activity_data: (request) => dispatch(get_sales_activity_data(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(LeadDetails);
