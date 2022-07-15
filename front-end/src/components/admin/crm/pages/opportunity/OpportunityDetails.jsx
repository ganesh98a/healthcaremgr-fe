import '../../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss';

import {
    Button,
    ButtonGroup,
    Card,
    Icon,
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Tabs,
    TabsPanel,
    Popover
} from '@salesforce/design-system-react';
import classNames from 'classnames';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import { get_contact_name_search_for_email_act } from 'components/admin/crm/actions/ContactAction.jsx';
import jQuery from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from '../../../../../config.js';
import { AjaxConfirm, css, postData, toastMessageShow } from '../../../../../service/common';
import { save_viewed_log } from '../../../actions/CommonAction.js';
import Feed from '../../../salesforce/lightning/SalesFeed.jsx';
import { SLDSIcon } from '../../../salesforce/lightning/SLDS';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable';
import AccountContacts from '../account/AccountContacts';
import AttachmentCard from '../AttachmentCard.jsx';
import AddNewItemInOpportunity from './AddNewItemInOpportunity.js';
import CreateOpportunityPopUp from './CreateOpportunityBox';
import CreateServiceAgreement from './CreateServiceAgreement.js';
import EditSelectedItemInOpportunity from './EditSelectedItemInOpportunity.js';
import OpportunitySafetyChecklist from './OpportunitySafetyChecklist.jsx';
import OpportunityServiceAgreementsCard from './OpportunityServiceAgreementsCard.jsx';
import OpportunityStatusPath from './OpportunityStatusPath.jsx';
import AvatarIcon from '../../../oncallui-react-framework/view/AvatarIcon';

/**
 * 
 * @param {object} props
 * @param {string | React.ReactNode} props.title
 * @param {string} [props.link]
 * @param {string | string[] | Record<string, boolean>} [props.className]
 * @param {string} [props.assistiveText]
 * @param {string} [props.icon]
 * @param {string} [props.id]
 * @param {boolean} [props.selected]
 * @param {string} [props.description]
 */
export const SLDSPathItem = ({ 
    title,
    link = undefined,
    className = '',
    assistiveText = undefined,
    icon = 'check',
    id = undefined,
    selected = true,
    description = undefined
}) => {
    const styles = css({
        root: { 
            borderTopLeftRadius: '0 rem',
            borderBottomLeftRadius: '0 rem',
        }
    })

    const linkClassNames = classNames("SLDSPathItem slds-path__item", className)

    const handleClickLink = e => {
        e.preventDefault()
    }

    return (
        <li className={linkClassNames} role="presentation" style={styles.root}>
            <a aria-selected={selected} className="slds-path__link" href={link} id={id} role="option" tabIndex="0" title={description} onClick={handleClickLink}>
                <span className="slds-path__stage">
                    {
                        icon && (
                            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
                                <SLDSIcon icon={icon}/>
                            </svg>
                        )
                    }
                    { assistiveText && <span className="slds-assistive-text">{assistiveText}</span> }
                </span>
                <span className="slds-path__title">{title}</span>
            </a>
        </li>
    )
}


/**
 * 
 * @param {object} props
 * @param {string} [props.stage]
 * @param {string} [props.buttonText]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick]
 */
export const SLDSPathAction = ({ 
    stage = '', 
    buttonText = `Mark Status as Complete`, 
    onClick=undefined
}) => {

    return (
        <div className="slds-grid slds-path__action">
            <span className="slds-path__stage-name">Stage: {stage}</span>
            <button className="slds-button slds-button_brand slds-path__mark-complete">
                <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                    <SLDSIcon icon="check" />
                </svg>
                {buttonText}
            </button>
            <button 
                type="button" 
                className="slds-button slds-button_neutral slds-path__trigger-coaching-content" 
                aria-expanded="false" 
                aria-controls="path-coaching-1"
                onClick={onClick}
            >
                Show More
            </button>
        </div>
    )
}


/**
 * 
 * @param {object} props
 * @param {boolean} [props.hasCoaching]
 * @param {any} [props.actionProps]
 * @param {string} [props.className]
 * @param {any[]} [props.path]
 */
export const SLDSPath = props => {
    const { actionProps, hasCoaching, className } = props
    const pathClassNames = classNames('SLDSPath', 'slds-path', hasCoaching && 'slds-path_has-coaching', className)

    return (
        <div className={pathClassNames}>
            <div className="slds-grid slds-path__track">
                <div className="slds-grid slds-path__scroller-container">
                    <div className="slds-path__scroller" role="application">
                        <div className="slds-path__scroller_inner">
                            <ul className="slds-path__nav" role="listbox" aria-orientation="horizontal">
                                {
                                    this.props.opportunity_status.map((p, i) => {
                                        return (
                                            <SLDSPathItem key={i} {...p} />
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                {
                    actionProps && (
                        <SLDSPathAction {...actionProps} />
                    )
                }
            </div>
        </div>
    )
}


export const TimelineItem = ({
    subject,
    datetime = undefined,
    variant = 'event',
    expandable = true,
    icon = 'call',
    actions=[],
    description = undefined,

}) => {
    const styles = css({
        subject: {
            fontSize: 13,
        }
    })

    const timelineClassNames = classNames({
        'slds-timeline__item': true,
        'slds-timeline__item_expandable': expandable,
    })

    return (
        <li>
            <div className={classNames([timelineClassNames, `slds-timeline__item_${variant}`])}>
                <div className="slds-media">

                    <div className="slds-media__figure">
                        <Button 
                            type="button"
                            assistiveText="Toggle details"
                            title="Toggle details"
                            iconName="switch"
                            variant="icon"
                            aria-controls="call-item-base"
                            iconClassName={['slds-timeline__details-action-icon']}
                        />
                        <Icon
                            category="standard"
                            name={icon}
                            containerClassName={['slds-timeline__icon']}
                            size="small"
                            title={'Activity'}
                        />
                    </div>

                    <div className="slds-media__body">
                        <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                            <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                <h3 className="slds-truncate" title={subject} style={styles.subject}>
                                    {subject}
                                </h3>
                            </div>
                            <div className="slds-timeline__actions slds-timeline__actions_inline">
                                {
                                    datetime && (
                                        <p className="slds-timeline__date">
                                            <time dateTime={datetime} 
                                                title={moment(datetime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm a')}>
                                                {moment(datetime, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}
                                            </time>
                                        </p>
                                    )
                                }
                                {
                                    (actions || []).length > 0 && (
                                        <Button 
                                            variant="icon"
                                            aria-haspopup="true"
                                            title="More Options"
                                            assistiveText="More Options"
                                            iconName="down"
                                            iconVariant="border-filled"
                                            iconSize="x-small"
                                        />
                                    )
                                }
                            </div>
                        </div>
                        {
                            description && (
                                <p className="slds-m-horizontal_xx-small">
                                    {description}
                                </p>
                            )
                        }
                        {/* @todo: rendering details not supported */}
                        { false && this.renderActivityDetail() }
                    </div>
                </div>
            </div>
        </li>
    )
}



/**
 * @typedef {typeof OpportunityDetails.defaultProps} Props
 * 
 * Renders the opportunity details page
 * 
 * @extends {React.Component<Props>}
 */
class OpportunityDetails extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }


    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'related',
            editModal: null,
            redirectTo: null,
            openItemDialog:false,
            editSelectedDialogBox:false,
            opportunity_items:[],
            isModalOpenManageContactRoles: null,
            openServiceDialog:false,
            service_agreement:[],
            service_agreement_summary: [],
            final_opportunity_status_list: [],
            opportunity_status_list: [],
            cancel_lost_reason_details: {},
            oppurtunity_description: '',
            fieldHistory: [],
            showActivity: false,
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
        this.myRefForSelectedItem = React.createRef(); // that reference is send from item listing to edit
        this.myRefForSelectedItemFromEditScreen = React.createRef(); // that reference is send from edit to item listing
        this.reactTable = React.createRef();

        this.getFieldHistoryItems = this.getFieldHistoryItems.bind(this);
    }

    getFieldHistoryItems(id) {
        postData('sales/Opportunity/get_field_history', { opportunity_id: id }).then(items => {
            this.setState({ fieldHistory: items }, () => {
                // call history component func
                this.history.updateItemsList();
            });
        });
    }

    /**
     * Fetch opportunity details
     * 
     * Will fetch when:
     * - This component was mounted
     * - Opportunity successfully updated
     */
    get_opportunity_details = (id) => {
        postData('sales/Opportunity/view_opportunity', { opportunity_id: id }).then((result) => {
            if (result.status) {
                this.setState({ ...result.data })
                this.setState({showActivity : true})
            } else {
                this.setState({showActivity : true})
                console.error('Could not fetch opportunity details')
            }
        });
        
        this.getFieldHistoryItems(id);
    }

    getServiceAgreementSummary(id) {
        postData('sales/Opportunity/get_opportunity_service_agreement_summary', { opportunity_id: id }).then((result) => {
            if (result.status) this.setState({ service_agreement_summary: result.data })
        });
    }   

    /**
    *close item Dialog
    *param1 is reserve
    *param2 is used to identify where modal is close 
    * or move to edit dialog 
    *(if param2 is true means edit Dialog needs to open and pass selected data in it)
    */
    closeItemDialog=(param1,param2)=>{
        var tempStorage = this.myRefForSelectedItem.current.state.activeLineItem;
        var selectedLineItems = this.myRefForSelectedItem.current.state.selectedLineItems;
        if(param2){
            var isOneChecked = this.IsIdInArray(tempStorage,'selected')
            if(isOneChecked){
                if(this.IsChildInArray(tempStorage) == true) {
                    toastMessageShow('Missing parent item selection for one or more child items.', "e");
                    return;
                }
                this.setState({openItemDialog :false},()=>{ 
                    this.setState({editSelectedDialogBox:true,selectedLineItem:selectedLineItems, activeLineItem: tempStorage})
                });
            }else{
                toastMessageShow('Select at least one Item to continue.', "e");
            }
        }else{
            this.setState({openItemDialog :false, callGetLineItem: true, selectedLineItem: []},()=>{ });
        }
    }

    /*
    *search selected is set to true in selected key
    * in given array
    */
    IsIdInArray=(array)=> {
        for (var i = 0; i < array.length; i++) {
            if (array[i].selected === true)
            return true;
        }
        return false;
    }

    /**
     * Search selected items doesn't have parent item
     * in given array
     */
     IsChildInArray=(array)=> {
        
        for (var i = 0; i < array.length; i++) {
            //Getting parent item
            if(array[i].category_ref == '' && array[i].selected === false) {
                //To Check child is selected or not
                for (var j = 0; j < array.length; j++) {                    
                    if (array[i].line_item_number === array[j].category_ref && array[j].selected === true) {                    
                        return true;
                    }
                }         
            }
                  
        }        
    }    

    /*
    *
    */
    closeEditItemDialog=()=>{
        this.setState({editSelectedDialogBox :false},()=>{
            this.get_opportunity_details(this.props.props.match.params.id);
        })
    }

    /*
    *Close edit Dialog and move to `Add item` dialog
    * with selected data
    */
    backBtn =()=>{
        var tempStorage = this.myRefForSelectedItemFromEditScreen.current.state.selectedLineItem;
        var activeLineItem = this.myRefForSelectedItemFromEditScreen.current.state.activeLineItem;
        this.setState({editSelectedDialogBox :false},()=>{
            this.setState({openItemDialog:true,activeLineItem:activeLineItem, selectedLineItem: tempStorage, callGetLineItem:false})
        })
    }

    /**
     * When component is mounted, remove replace the parent element's 
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')

        const id = _.get(this.props, 'props.match.params.id')
        this.get_opportunity_details(id);      
        this.getServiceAgreementSummary(id); 
        // save viewed log
        save_viewed_log({ entity_type: 'opportunity', entity_id: this.props.props.match.params.id });        
    }
    

    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }


    /**
     * Runs when a tab (incl. itself) is clicked
     * @param {string} value
     */
    tabChange = (value) => {
        this.setState({ activeTab: value })
    }


    /**
     * Runs when 'Opportunity' modal has made a successful form submission
     * @param {number} id
     */
    handleOpportunityUpdated = id => {
        this.get_opportunity_details(id)
    }


    /**
     * Fires when 'Edit' button on top left is clicked
     */
    editOpportunity = () => {
        this.setState({ editModal: true })       
    }


    /**
     * Fires when 'Delete' button on page header is clicked
     */
    archiveOpportunity = () => {
        const id = _.get(this.props, 'props.match.params.id')
        if (!id) {
            console.error(`ID is required to remove opportunity`)
        }

        const msg = 'Are you sure you want to archive this opportunity?'
        const confirmButton = 'Confirm'

        AjaxConfirm({ opportunity_id: id }, msg, 'sales/Opportunity/archive_opportunity', { confirm: confirmButton, heading_title: 'Archive Opportunity' }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s")
                this.setState({ redirectTo: ROUTER_PATH + `admin/crm/opportunity/listing` })
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }


    /**
     * Action renderer for `<PageHeader />`
     */
    actions =  () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" title={`Update opportunity`} onClick={this.editOpportunity} />
                    <Button label="Delete" title={`Remove opportunity`} onClick={this.archiveOpportunity}  />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * Formats the number to *n* number of decimals
     * 
     * @param {number} number 
     * @param {number} decimalPlaces 
     */
    formatNum(number, decimalPlaces) {
        return (Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces))
    }


    /**
     * Determines what would be the displayed when rendering amount
     * 
     * @param {any} amount 
     */
    determineOpportunityAmount(amount) {
        if ([null, '', undefined, false, NaN].indexOf(amount) >= 0) {
            return 'N/A'
        }

        const formattedAmount = this.formatNum(amount, 2)
        if ([null, '', undefined, false, NaN].indexOf(amount) >= 0 || Number.isNaN(amount)) {
            return 'N/A'
        }

        return `${formattedAmount.toFixed(2)}`
    }

    /**
     * Finds the value of `this.state.opportunity_source` from 
     * `this.state.opportunity_source_options`
     */
    determineOpportunitySource() {
        if (!this.state.opportunity_source) {
            return 'N/A'
        }

        const normalizedSourceOptions = (this.state.opportunity_source_options || []).reduce((acc, curr) => {
            acc[curr.value] = curr
            return acc
        }, {})

        if (this.state.opportunity_source in normalizedSourceOptions) {
            return normalizedSourceOptions[this.state.opportunity_source].label || 'N/A'
        }

        return 'N/A'
    }


    /**
     * Finds the value of `this.state.opportunity_type` 
     * from `this.state.opportunity_type_options`
     */
    determineOpportunityType() {
        if (!this.state.opportunity_type) {
            return 'N/A'
        }
        
        const normalizedOpportunityTypeOptions = (this.state.opportunity_type_options || []).reduce((acc, curr) => {
            acc[curr.value] = curr
            return acc
        }, {})

        if (this.state.opportunity_type in normalizedOpportunityTypeOptions) {
            return normalizedOpportunityTypeOptions[this.state.opportunity_type].label || 'N/A'
        }

        return 'N/A'
    }

    /**
     * Renders link for related account. 
     * Account can link back to 'organisation' or 'contact'
     */
    renderRelatedAccountLink() {
        const ACCOUNT_TYPE_CONTACT = 1
        const ACCOUNT_TYPE_ORGANISATION = 2
        const accountType = _.get(this.state, 'account_type', ACCOUNT_TYPE_CONTACT)
        const accountId = _.get(this.state, 'account_person.value')
        let tooltip = undefined

        if (parseInt(accountType) === ACCOUNT_TYPE_ORGANISATION) {
            const org =_.get(this.state, 'account_person.label', null)
            if (!org) {
                return this.props.notAvailable
            }

            tooltip = `${org} (organisation)`
            
            return <Link to={ROUTER_PATH + `admin/crm/organisation/details/${accountId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{org}</Link>
        } else if (parseInt(accountType) === ACCOUNT_TYPE_CONTACT) {
            const person =_.get(this.state, 'account_person.label', null)
            if (!person) {
                return this.props.notAvailable
            }

            tooltip = `${person} (contact)`
            
            return <Link to={ROUTER_PATH + `admin/crm/contact/details/${accountId}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{person}</Link>
        }

        return this.props.notAvailable
    }


    /**
     * Renders the link related to owner.
     * The link generated will link back to **Members** module
     */
    renderRelatedOwnerLink() {
        const memberId = _.get(this.state, 'owner.value', null)
        const owner =_.get(this.state, 'owner.label', null)
        if (!owner) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/support_worker/about/${memberId}/details`
        const tooltip = `${owner} \nClicking will take you to Members module`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{owner}</Link>
    }

    pageTitle = () => {
        return this.state.topic +' - (' +this.state.opportunity_number+')';
       }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        const header = {
            icon: "opportunity",
            label: "Opportunity",
            title: this.pageTitle(),
            details: [
                {
                    label: 'Account',
                    content: this.renderRelatedAccountLink(),
                },
                { 
                    label: 'Assigned To', 
                    content: this.renderRelatedOwnerLink(),
                }
            ],
        }

        return (
            <PageHeader
                details={header.details}
                icon={
                    <AvatarIcon assistiveText="User" avatar={this.state.account_person && this.state.account_person.avatar || ""} category="standard" name={header.icon} />
                }
                label={header.label}
                onRenderActions={this.actions}
                title={header.title}
                variant="record-home"
            />
        )
    }

    /**
     * Determines what would be the path props for `<SLDSPath />` component.
     * 
     * @important WRITE UNIT TEST FOR THIS!
     * @param {0|1|2|3|4|5|6} status 
     */
    determineStatusPaths(status) {

        const STATUS_UNKNOWN = 0
        const STATUS_NEW = 1
        const STATUS_DISCOVERY = 2
        const STATUS_PROPOSAL = 3
        const STATUS_CANCELLED = 4
        const STATUS_LOST = 5
        const STATUS_WON = 6

        const path = [
            {
                title: 'New',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status <= STATUS_UNKNOWN,
                    'slds-is-new': status === STATUS_NEW, 
                    'slds-is-active': status === STATUS_NEW,
                    'slds-is-current': status === STATUS_NEW,
                    'slds-is-complete': status > STATUS_NEW,
                }),
            },
            {
                title: 'Discovery',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status < STATUS_DISCOVERY,
                    'slds-is-active': status === STATUS_DISCOVERY, 
                    'slds-is-current': status === STATUS_DISCOVERY,
                    'slds-is-complete': status > STATUS_DISCOVERY,
                }),
            },
            {
                title: 'Proposal',
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': status < STATUS_PROPOSAL,
                    'slds-is-active': status === STATUS_PROPOSAL, 
                    'slds-is-current': status === STATUS_PROPOSAL,
                    'slds-is-complete': status > STATUS_PROPOSAL,
                }),
            },
            {
                title: status === 0 ? 'Unknown' : 'Won',
                visible: [STATUS_UNKNOWN, STATUS_NEW, STATUS_DISCOVERY, STATUS_PROPOSAL].indexOf(status) >= 0 || [STATUS_LOST, STATUS_CANCELLED].indexOf(status) < 0,
                icon: 'check',
                className: classNames({
                    'slds-is-incomplete': [STATUS_UNKNOWN, STATUS_NEW, STATUS_DISCOVERY, STATUS_PROPOSAL].indexOf(status) >= 0,
                    'slds-is-current': status === STATUS_WON,
                    'slds-is-active': status === STATUS_WON, 
                    'slds-is-won': status === STATUS_WON,
                    'slds-is-complete': status === STATUS_WON,
                }),
            },
            {
                title: 'Cancelled',
                // visible: status == STATUS_CANCELLED,
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-lost': [STATUS_CANCELLED].indexOf(status) >= 0,
                    'slds-is-incomplete' : true,
                }),
            },
            {
                title: 'Lost',
                // visible: status === STATUS_LOST,
                visible: true,
                icon: 'check',
                className: classNames({
                    'slds-is-lost': [STATUS_LOST].indexOf(status) >= 0,
                    'slds-is-incomplete' : true,
                }),
            },
        ]

        return path
    }


    /**
     * Render the 'path' stages with triangular side pointing to the right
     */
    renderPath() {

        const { opportunity_status } = this.state
        let status = !!opportunity_status ? parseInt(opportunity_status) : 0

        const paths = this.determineStatusPaths(status)
        const visiblePaths = paths.filter(p => p.visible)

        return (
            <SLDSPath path={visiblePaths}/>
        )
    }

    /**
     * Render details of an activity/event
     * 
     * @todo: If you have time, maybe display this 
     */
    renderActivityDetail() {
        return (
            <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small" id="call-item-base" aria-hidden="true">
                <ul className="slds-list_horizontal slds-wrap">
                    <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                        <span className="slds-text-title slds-p-bottom_x-small">Name</span>
                        <span className="slds-text-body_medium slds-truncate" title="Adam Chan">
                        <a href="javascript:void(0);">Adam Chan</a>
                        </span>
                    </li>
                    <li className="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
                        <span className="slds-text-title slds-p-bottom_x-small">Related To</span>
                        <span className="slds-text-body_medium slds-truncate" title="Tesla Cloudhub + Anypoint Connectors">
                        <a href="javascript:void(0);">Tesla Cloudhub + Anypoint Connectors</a>
                        </span>
                    </li>
                </ul>
                <div>
                    <span className="slds-text-title">Description</span>
                    <p className="slds-p-top_x-small">Adam seemed interested in closing this deal quickly! Let’s move.</p>
                </div>
            </article>
        )
    }

    /**
     * Renders activity timeline items
     */
    renderActivityTimeline() {
        const timelineItems = [
            {
                datetime: '2020-06-01 13:00:00',
                subject: `Mobile conversation on Monday`,
                // description: 'You logged a call with someone',
                actions: [],
                icon: 'choice',
            },
            {
                datetime: '2020-06-01 13:00:00',
                subject: `Mobile conversation on Monday`,
                // description: 'You logged a call with someone',
                actions: [],
                icon: 'choice',
            },
            {
                datetime: '2020-06-01 13:00:00',
                subject: `Mobile conversation on Monday`,
                // description: 'You logged a call with someone',
                actions: [],
                icon: 'choice',
            },
            {
                datetime: '2020-06-01 13:00:00',
                subject: `Mobile conversation on Monday`,
                // description: 'You logged a call with someone',
                actions: [],
                icon: 'choice',
            },
            {
                datetime: '2020-06-01 13:00:00',
                subject: `Mobile conversation on Monday`,
                // description: 'You logged a call with someone',
                actions: [],
                icon: 'choice',
            },
        ]

        return (
            <ul className="slds-timeline slds-box slds-theme_default">
                {
                    timelineItems.map((item, i) => {
                        return (
                            <TimelineItem key={i} {...item} />
                        )
                    })
                }
            </ul>
        )
    }


   /*  handleClickNewContact = (e) => {
        e.preventDefault()
        this.setState({ isModalOpenManageContactRoles: true })
    } */

    openServiceModal = () => {
        this.setState({openServiceDialog: true})
    }

    closeServiceModal=()=>{
        this.setState({openServiceDialog:false});
        this.getServiceAgreementSummary(this.props.props.match.params.id);
    }


    /**
     * Render related tab
     * 
     * @todo: Create a 'tile' component YOURSELF! 
     * Tile is not currently supported by React Lightning components
     */
    renderRelatedTab() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        })

        const id = _.get(this.props, 'props.match.params.id')
        const contacts_data = this.state.contacts
        const displayedColumns = this.determineColumns()

        return (
            <div class="slds-grid slds-grid_vertical slds_my_card">
                <div className="slds-col">
                    <AccountContacts account_id={id} account_name={this.state.account_name} account_type={3} />
                </div>

                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        <Card
                            headerActions={<Button id="Opp_lineItems" label={(this.state.opportunity_items.length > 0)?'Edit':'New'} onClick={() => this.setState({openItemDialog:true,callGetLineItem:true})} />}
                            heading={"Items ("+this.state.opportunity_items.length+")"}
                            style={styles.card}
                            icon={<Icon category="standard" name="product_item" size="small" />}
                        // icon={<Icon category="standard" name="document" size="small" />}
                        >

                        <div class="slds-grid slds-grid_pull-padded-medium">
                            <div class="slds-col slds-p-horizontal_medium">
                                <span>&nbsp;</span>
                            </div>
                            <div class="slds-col slds-p-horizontal_medium">
                                <span>&nbsp;</span>
                            </div>
                        </div>

                        <SLDSReactTable
                            // PaginationComponent={Pagination}
                            PaginationComponent={React.Fragment}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            //onFetchData={this.fetchData}
                            filtered={this.state.filtered}
                            //defaultFiltered={{filter_opportunity_status: 'all'}}
                            columns={displayedColumns}
                            data={this.state.opportunity_items}
                            defaultPageSize={9999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No records found"
                            collapseOnDataChange={true}                            
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles ' })}
                            style={{
                                fontSize: 13
                            }}
                            resizable={true}
                            // className="-striped1 -highlight"
                            // previousText={<span className="icon icon-arrow-left privious"></span>}
                            // nextText={<span className="icon icon-arrow-right next"></span>}
                        />
                        </Card>
                        {(this.state.openItemDialog)?<AddNewItemInOpportunity openItemDialog={this.state.openItemDialog} opp_id={this.props.props.match.params.id} closeItemDialog={this.closeItemDialog} get_opportunity_details={this.get_opportunity_details} selectedLineItem={this.state.selectedLineItem} ref={this.myRefForSelectedItem} callGetLineItem={this.state.callGetLineItem} activeLineItem={this.state.activeLineItem}/>:''}

                         {(this.state.editSelectedDialogBox)?<EditSelectedItemInOpportunity editSelectedDialogBox={this.state.editSelectedDialogBox} closeEditItemDialog={this.closeEditItemDialog} selectedLineItem={this.state.selectedLineItem} activeLineItem={this.state.activeLineItem} backBtn={this.backBtn} ref={this.myRefForSelectedItemFromEditScreen} opp_id={this.props.props.match.params.id}/>:''}
                    </div>
                </div>

                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        <OpportunityServiceAgreementsCard
                            opportunity_id={this.props.props.match.params.id}
                            serviceAgreements={this.state.service_agreement_summary}
                            openCreateServiceAgreementFn={this.openServiceModal}
                        />
                        {(this.state.openServiceDialog)?<CreateServiceAgreement openServiceDialog={this.state.openServiceDialog} opp_id={this.props.props.match.params.id} agreement_id={0} closeServiceModal={this.closeServiceModal} get_opportunity_details={this.get_opportunity_details}
                            
                            // Note: The 'account_person' attr name is misleading
                            // because it can also have account details of org. Proper name should be `account_details` or `account_info`, etc...
                            account={this.state.account_person}
                        />:''}
                    </div>
                </div>

                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        <AttachmentCard 
                            object_type={AttachmentCard.OBJECT_TYPE_OPPORTUNITY}
                            object_id={id}
                            attachments={this.state.attachments}
                            onSuccessUploadNewFiles={() => this.get_opportunity_details(id)}
                        />
                    </div>
                </div>
                <div className="slds-col slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical">
                        <OpportunitySafetyChecklist
                            opportunity_id={id}
                        />
                    </div>
                </div>
            </div>
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


        return (
            <div className="row slds-box" style={styles.root}>
                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Opportunity details</h3>
                </div>
                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Service Type</label>
                        <div className="slds-form-element__control">
                            {this.state.topic || notAvailable}
                        </div>
                    </div>
                </div>
                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Type</label>
                        <div className="slds-form-element__control">
                            {this.determineOpportunityType()}
                        </div>
                    </div>
                </div>

                {/* <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Needs support plan</label>
                        <div className="slds-form-element__control">
                            {[null, false, NaN, undefined, ''].indexOf(this.state.need_support_plan) >= 0 ? notAvailable 
                                : (['0', 0].indexOf(this.state.need_support_plan) >= 0 ? 'No' : 'Yes')}
                        </div>
                    </div>
                </div> */}

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Assigned To</label>
                        <div className="slds-form-element__control">
                            {_.get(this.state, 'owner.label', notAvailable)}
                        </div>
                    </div>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Account (Person/Org) Name</label>
                        <div className="slds-form-element__control">
                            {_.get(this.state, 'account_person.label', notAvailable)}
                        </div>
                    </div>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">
                            Amount ($$)
                        </label>
                        <div className="slds-form-element__control">
                            { this.determineOpportunityAmount(this.state.amount ? this.state.amount : '0.00') }
                        </div>
                    </div>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Related Lead</label>
                        <div className="slds-form-element__control">
                            {_.get(this.state, 'related_lead.label', notAvailable)}
                        </div>
                    </div>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Source</label>
                        <div className="slds-form-element__control">
                            {this.determineOpportunitySource()}
                        </div>
                    </div>
                </div>

                <div className="col col-sm-6" style={styles.col}>
                    <div className="slds-form-element">
                        <label className="slds-form-element__label">Description</label>
                        <div className="slds-form-element__control">
                            {this.state.oppurtunity_description ?  this.state.oppurtunity_description : (this.state.related_lead && this.state.related_lead.lead_description) ? this.state.related_lead.lead_description : notAvailable}
                                   
                        </div>        
                    </div>
                </div>

            </div>
        )
    }


    /**
     * Renderr the sidebar
     */
    renderSidebar() {

        return (
            <>
                <div className="slds-grid slds-grid_vertical">
                    <div className="slds-col">
                        <label>Activity</label>
                        {this.state.showActivity ?  <CreateActivityComponent
                            sales_type={"opportunity"}
                            salesId={this.props.props.match.params.id}
                            related_type="1"                           
                        /> :  ''} 
                    </div>
                </div>
                <div className="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                   {this.state.showActivity ? <ActivityTimelineComponent
                        sales_type={"opportunity"}
                        salesId={this.props.props.match.params.id}
                        related_type="1"                        
                    /> : ''} 
                </div>
            </>
        )
    }


    /**
     * Render modals here
     */
    renderModals() {
        const id = _.get(this.props, 'props.match.params.id')

        return (
            <React.Fragment>
                {
                    this.state.editModal && (
                        <CreateOpportunityPopUp 
                            openOppBox={!!this.state.editModal} 
                            closeModal={() => this.setState({ editModal: null })} 
                            oppId={id} 
                            pageTitle={`Edit opportunity`} 
                            data={null} 
                            onUpdate={this.handleOpportunityUpdated}
                        />
                    )
                }

                {/* More modals here */}
            </React.Fragment>
        )
    }

        determineColumns() {
        return [
            {
                _label: 'Item',
                accessor: "line_item_name",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Item Number',
                accessor: "line_item_number",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
            },
            {
                _label: 'Support category',
                accessor: "support_cat",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'ONCALL provided',
                accessor: "oncall_provided",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Quantity',
                accessor: "qty",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Rate',
                accessor: "rate",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (props.original.line_item_price_id !== null) {
                        return (
                            <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
                        );    
                    } else {

                        return(
                            <div>
                                <Popover
                                    align="top left"
                                    body={
                                        <div>
                                             <p className="slds-p-bottom_x-small">{'This denotes old rate. Rate will be updated upon the import of new price list'}</p>
                                        </div>
                                    }
                                    heading="Missing Rate"
                                    id="popover-error"
                                    variant="warning"
                                    className="slds-cus-popover-heading slds-popover-wrap"
                                    {...this.props}
                                >
                                   {<Button
                                        assistiveText={{ icon: 'Icon Info' }}
                                        style={{'fill':'red', 'background-color': 'transparent', 'color': 'red', 'border': 'none', 'padding': '0'}}
                                        label={defaultSpaceInTable(props.value)}
                                        />  
                                    }
                                </Popover>
                            </div>
                        );
                    } 
                }
            },
            {
                _label: 'Funding',
                accessor: "amount",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            }
        ]
    }



    render() {
        // This will only run when you archive this opportunity
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
            <div className="OpportunityDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            { this.renderPageHeader() }
                        </div>

                        <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                            <OpportunityStatusPath {...this.state} get_opportunity_details={this.get_opportunity_details} />
                        </div>

                        <div className="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box ">
                                        <Tabs>
                                            <TabsPanel label="Related">
                                                { this.renderRelatedTab() }
                                            </TabsPanel>

                                            <TabsPanel label="Details">
                                                { this.renderDetailsTab() }
                                            </TabsPanel>

                                            <TabsPanel label="Feed">
                                                <Feed 
                                                  ref={ref => (this.history = ref)}
                                                  items={this.state.fieldHistory}
                                                  sourceId={this.props.props.match.params.id}
                                                  relatedType={"opportunity"}
                                                  getFieldHistoryItems={this.getFieldHistoryItems.bind(this)}
                                                />
                                        </TabsPanel>
                                        </Tabs>
                                    </div>
                                </div>
                                
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12">
                                    <div className="white_bg_color slds-box">
                                        { this.renderSidebar() }
                                    </div>
                                </div>
                                   
                            </div>
                        </div>
                    </div>
                    
                    { this.renderModals() }
                </IconSettings>
            </div>
        );
    }

}
const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(OpportunityDetails);
// export default OpportunityDetails