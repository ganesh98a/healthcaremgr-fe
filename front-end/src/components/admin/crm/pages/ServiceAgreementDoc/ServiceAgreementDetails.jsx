import React from 'react'
import _ from 'lodash'
import { Redirect, Link } from 'react-router-dom'
import jQuery from 'jquery'
import moment from 'moment'
import {
    Dropdown,
    IconSettings,
    PageHeaderControl,
    ExpandableSection,
    ButtonGroup,
    Button,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
    Card,
    Input,
    Checkbox,
    Popover
} from '@salesforce/design-system-react'

import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from '../../../../../config.js'
import { postData, css, formatNum, AjaxConfirm, toastMessageShow } from '../../../../../service/common'
import CreateServiceAgreement from '../opportunity/CreateServiceAgreement.js'
import AttachmentCard from '../AttachmentCard.jsx'
import ServiceAgreementPath from './ServiceAgreementPath.jsx'
import { defaultSpaceInTable } from 'service/custom_value_data.js'
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import AddNewItemInServiceAgreement from './AddNewItemInServiceAgreement.jsx'
import EditSelectedItemInServiceAgreement from './EditSelectedItemInServiceAgreement.jsx'
import ServiceAgreementPayment from './ServiceAgreementPayment.jsx'
import AddNewDocuSign from './AddNewDocuSign.jsx'
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import Feed from '../../../salesforce/lightning/SalesFeed.jsx';
import PreviewDocuSign from './PreviewDocuSign.jsx'
import { save_viewed_log } from '../../../actions/CommonAction.js';
import CreateParticipantModel from '../../../item/participant/CreateParticipantModel';
import CreateServiceBookingModal from '../sales/CreateServiceBookingModal';
import ServiceBookingsList from '../sales/ServiceBookingsList';
import ServiceAgreementGoals from './ServiceAgreementGoals';
import AvatarIcon from '../../../oncallui-react-framework/view/AvatarIcon.jsx'
class ServiceAgreementDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // modal states
            editModal: false,

            activeTab: 'details',
            loading: false,
            redirectTo: null,
            service_agreement_items: [],
            service_agreement_payments: [],
            additional_services: [],
            additional_services_custom: '',
            openItemDialog: false,
            callGetLineItem: false,
            sa_account_name: '',
            openDocusigDialog: false,
            oppunity_decisionmaker_contacts: '',
            service_docusign_datas: [],
            fieldHistory: [],
            activity_page: false,
            openPreviewDocusigDialog: false,
            openParticipantDialog: false,
            OpenServiceBookingModal: false,
            service_booking_list: [],
            alreadySeleactedItem: []
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef()
        this.myRefForSelectedItem = React.createRef(); // that reference is send from item listing to edit
        this.myRefForSelectedItemFromEditScreen = React.createRef(); // that reference is send from edit to
        // item listing
        this.reactTable = React.createRef();
    }


    /**
     * When component is mounted, remove replace the parent element's
     * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')

        const id = _.get(this.props, 'props.match.params.id')
        this.get_service_agreement_details(id);
        // save viewed log
        save_viewed_log({ entity_type: 'service_agreement', entity_id: id });
    }


    /**
     * When component will be unmounted, return the parent element's classnames back to previous.
     * If you don't do this, other pages will be affected, maybe including other modules
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    hasAdditionalService(id) {
        if (this.state.additional_services)
            return this.state.additional_services.find(s => s == id);
        return false;
    }

    /**
     * Fetch service agreement by ID
     * @param {number} id
     */
    get_service_agreement_details = (id) => {
        this.setState({ loading: true })
        postData('sales/ServiceAgreement/get_service_agreement_details', { id }).then(res => {
            if (res.status) {
                res.data.additional_services = JSON.parse(res.data.additional_services);

                this.setState({ ...res.data, loading: false, oppunity_decisionmaker_contacts: JSON.parse(res.data.oppunity_decisionmaker_contacts), activity_page: true }, () => {
                })
            }
        })
            .finally(() => this.setState({ loading: false }))
        this.getFieldHistoryItems(id);
    }

    /**
     *
     * @param {React.MouseEvent} e
     */
    handleArchiveServiceAgreement = e => {
        e.preventDefault()

        const id = _.get(this.props, 'props.match.params.id')
        this.setState({ deleteLeadModal: id })


        const msg = `Are you sure you want to archive this service agreement?`
        const confirmButton = `Archive service agreement`

        AjaxConfirm({ id }, msg, `sales/ServiceAgreement/archive_service_agreement`, { confirm: confirmButton, heading_title: `Archive service agreement` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.setState({ redirectTo: ROUTER_PATH + `admin/crm/serviceagreements` })
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        return (
            <PageHeader
                details={[
                    {
                        label: 'Account',
                        content: this.renderRelatedAccountLink()
                    },
                    {
                        label: 'Assigned To',
                        content: this.renderRelatedOwnerLink()
                    },
                    {
                        label: 'Opportunity',
                        content: this.renderRelatedOpportunityLink()
                    },
                    {
                        label: 'Signed by',
                        content: this.renderRelatedSignedByLink()
                    },
                ]}
                icon={
                    <AvatarIcon assistiveText="Lead" avatar={this.state.account_details && this.state.account_details.profile_pic || ""} category="standard" name="file" />
                }
                label={`Service agreement`}
                title={!_.get(this.state, 'opportunity.topic') ? (<span>&nbsp;</span>) : [
                    'Service Agreement for ',
                    _.get(this.state, 'opportunity.topic')
                ].filter(Boolean).join(' ')}
                variant="record-home"
                onRenderActions={this.actions}
            />
        )
    }

    getFieldHistoryItems(id) {
        postData('sales/ServiceAgreement/get_field_history', { service_agreement_id: id }).then(items => {
            this.setState({ fieldHistory: items }, () => {
                // call history component func
                this.history && this.history.updateItemsList();
            });
        });
    }

    /**
     * Action renderer for `<PageHeader />`
     */
    actions = () => {
        var participant_btn;
        var create_par_disable = Number(this.state.status) !== 1 && Number(this.state.status) !== 5 ? true : false;
        if (this.state.participant_id && this.state.participant_id != '') {
            participant_btn = (
                <Link
                    to={ROUTER_PATH + `admin/item/participant/details/${this.state.participant_id}`}
                    title={`Navigate to related participant`}
                    className={`slds-button slds-button_neutral`}
                >
                    View participant
                </Link>
            );
        } else {
            participant_btn = (
                <Button label="Create Participant" title={`Create Participant`} onClick={this.showParticipantModal} disabled={create_par_disable} />
            );
        }

        return (
            <PageHeaderControl>
                <ButtonGroup variant="list">
                    {participant_btn}
                    <Button label="Delete" title={`Archives the service agreement`} onClick={this.handleArchiveServiceAgreement} />
                    <Button label="Edit" title={`Update service agreement`} onClick={() => this.setState({ editModal: true })} />
                    <Dropdown
                        align="right"
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        id="dropdown-record-home-example"
                        options={[
                            { label: 'Preview Document', value: 1 }
                        ]}
                        onSelect={(e) => {
                            if (e.value === 1) { // preview document
                                this.setState({ openPreviewDocusigDialog: true })
                            }
                        }}
                    />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }



    /**
     * Renders the link related to owner.
     * The link generated will link back to **Members** module
     */
    renderRelatedOwnerLink() {
        const memberId = _.get(this.state, 'owner_details.id', null)
        if (!memberId) {
            return <span>&nbsp;</span>
        }

        const owner_firstname = _.get(this.state, 'owner_details.firstname', null)
        const owner_lastname = _.get(this.state, 'owner_details.lastname', null)
        const owner_fullname = [owner_firstname, owner_lastname].filter(Boolean).join(' ')

        const link = ROUTER_PATH + `admin/support_worker/about/${memberId}/details`
        const tooltip = `${owner_fullname} \nClicking will take you to Members module`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{owner_fullname}</Link>
    }

    /**
     * Renders the 'signed by' link
     */
    renderRelatedSignedByLink() {
        const memberId = _.get(this.state, 'signed_by_details.id', null)
        if (!memberId) {
            return <span>&nbsp;</span>
        }

        const fname = _.get(this.state, 'signed_by_details.firstname', null)
        const lname = _.get(this.state, 'signed_by_details.lastname', null)
        const fullname = [fname, lname].filter(Boolean).join(' ')

        const link = ROUTER_PATH + `admin/support_worker/about/${memberId}/details`
        const tooltip = `${fullname} \nClicking will take you to Members module`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{fullname}</Link>
    }

    /**
     * Renders the link related to account
     */
    renderRelatedAccountLink() {
        let account = null
        let account_type_label = null
        let account_link = null

        if (!this.state.account) {
            return account
        }

        if (this.state.account_type == 1) {
            account = [
                _.get(this.state, 'account_person.firstname'),
                _.get(this.state, 'account_person.lastname'),
            ].filter(Boolean).join(' ')


            if (_.get(this.state, 'account_person.id')) {
                account_link = ROUTER_PATH + `admin/crm/contact/details/${_.get(this.state, 'account_person.id')}`

            }

            account_type_label = '(Person)'
        } else if (this.state.account_type == 2) {
            account = _.get(this.state, 'account_organisation.name')
            account_type_label = '(Organisation)'

            if (_.get(this.state, 'account_organisation.id')) {
                account_link = ROUTER_PATH + `admin/crm/organisation/details/${_.get(this.state, 'account_organisation.id')}`
            }
        }

        if (account_link) {
            this.state['sa_account_name'] = account;
            this.state['account_person_id'] = _.get(this.state, 'account_person.id');
            return (
                <Link
                    to={account_link}
                    title={[account, account_type_label].filter(Boolean).join(' ')}
                    className="reset"
                    style={{ color: '#006dcc' }}
                >
                    {account}
                </Link>
            )
        }
        return (
            <span title={[account, account_type_label].filter(Boolean).join(' ')}>
                {account}
            </span>
        )
    }

    renderRelatedOpportunityLink() {
        const opportunity_id = _.get(this.state, 'opportunity.id')
        if (!opportunity_id) {
            return <span>&nbsp;</span>
        }
        let opp_topic = _.get(this.state, 'opportunity.topic');
        let opp_number = _.get(this.state, 'opportunity.opportunity_number')
        const topic = opp_topic + ' - (' + opp_number + ')';

        const link = ROUTER_PATH + `admin/crm/opportunity/${opportunity_id}`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }}>{topic}</Link>
    }




    /**
     * @param {any} amount
     */
    formatAmount(amount) {
        if ([null, '', undefined, false, NaN].indexOf(amount) >= 0) {
            return 'N/A'
        }

        const formattedAmount = formatNum(amount, 2)
        if ([null, '', undefined, false, NaN].indexOf(amount) >= 0 || Number.isNaN(amount)) {
            return 'N/A'
        }

        return `$ ${formattedAmount.toFixed(2)}`
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

    mapStateToServiceAgreementProps() {
        const serviceAgreement = this.state
        const sanitizeDate = d => {
            const valid = moment(d).isValid()
            if (!valid) {
                return null
            }

            return d
        }

        const sanitizeAmount = amount => {
            if ([null, '', undefined, false, NaN].indexOf(amount) >= 0) {
                return null
            }

            const formattedAmount = formatNum(amount, 2)
            if ([null, '', undefined, false, NaN].indexOf(amount) >= 0 || Number.isNaN(amount)) {
                return null
            }

            if (formattedAmount == 0) {
                return null
            }

            return amount
        }

        let additionalServices = [];

        if (_.isArray(serviceAgreement.additional_services) || _.isObject(serviceAgreement.additional_services))
            additionalServices = JSON.parse(JSON.stringify(serviceAgreement.additional_services))
        else if (_.isString(serviceAgreement.additional_services))
            additionalServices = JSON.parse(serviceAgreement.additional_services)

        return {
            status: serviceAgreement.status,
            owner: (() => {
                if (!serviceAgreement.owner_details) {
                    return {}
                }

                const label = [
                    _.get(serviceAgreement, 'owner_details.firstname'),
                    _.get(serviceAgreement, 'owner_details.lastname'),
                ].filter(Boolean).join(' ')

                return {
                    value: _.get(serviceAgreement, 'owner_details.id'),
                    label: label
                }
            })(),
            account: (() => {
                let value = serviceAgreement.account
                if ([0, '0', false, null, undefined, '', NaN].indexOf(value) >= 0) {
                    return {}
                }

                let label = null
                let account_type = serviceAgreement.account_type

                if (account_type == 1) {
                    label = [
                        _.get(serviceAgreement, 'account_person.firstname'),
                        _.get(serviceAgreement, 'account_person.lastname'),
                    ].filter(Boolean).join(' ')
                    value = _.get(serviceAgreement, 'account_person.id')

                } else if (account_type == 2) {
                    label = _.get(serviceAgreement, 'account_organisation.name')
                    value = _.get(serviceAgreement, 'account_organisation.id')
                }

                return { value, label, account_type }
            })(),
            grand_total: sanitizeAmount(serviceAgreement.grand_total),
            service_agreement_items_total: sanitizeAmount(serviceAgreement.service_agreement_items_total),
            sub_total: sanitizeAmount(serviceAgreement.sub_total),
            tax: sanitizeAmount(serviceAgreement.tax),
            additional_services: additionalServices,
            additional_services_custom: serviceAgreement.additional_services_custom,
            customer_signed_date: sanitizeDate(serviceAgreement.customer_signed_date), // @todo. Displays invalid date ATM
            signed_by: (() => {
                let value = serviceAgreement.signed_by
                if ([0, '0', false, null, undefined, '', NaN].indexOf(value) >= 0) {
                    return {}
                }

                let label = [
                    _.get(serviceAgreement, 'signed_by_details.firstname'),
                    _.get(serviceAgreement, 'signed_by_details.lastname'),
                ].filter(Boolean).join(' ')

                return { value, label }
            })(),
            contract_start_date: sanitizeDate(serviceAgreement.contract_start_date),
            contract_end_date: sanitizeDate(serviceAgreement.contract_end_date),
            plan_start_date: sanitizeDate(serviceAgreement.plan_start_date),
            plan_end_date: sanitizeDate(serviceAgreement.plan_end_date),
            goals: (!serviceAgreement.goals || ((serviceAgreement.goals || []).length === 0)) ? [{ goal: '' }] : (serviceAgreement.goals || []).map(g => ({ id: g.id, goal: g.goal, outcome: g.outcome })),
            service_id: serviceAgreement.id,
            isGrandTotalEdit: (serviceAgreement.service_agreement_items_total != 0 ? true : false)
        }
    }
    showArchiveModal(id) {

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
                label: 'Status',
                value: this.state.status_label || 'N/A',
            },
            {
                label: 'Assigned To',
                value: [
                    _.get(this.state, 'owner_details.firstname'),
                    _.get(this.state, 'owner_details.lastname'),
                ].filter(Boolean).join(' '),
            },
            {
                label: 'Account',
                value: (() => {
                    let account = 'N/A'
                    let account_type_label = null

                    if (!this.state.account) {
                        return account
                    }

                    if (this.state.account_type == 1) {
                        account = [
                            _.get(this.state, 'account_person.firstname'),
                            _.get(this.state, 'account_person.lastname'),
                        ].filter(Boolean).join(' ')

                        account_type_label = '(Person)'
                    } else if (this.state.account_type == 2) {
                        account = _.get(this.state, 'account_organisation.name')
                        account_type_label = '(Organisation)'
                    }

                    return (
                        <span title={[account, account_type_label].filter(Boolean).join(' ')}>
                            {account}
                        </span>
                    )
                })()
            },
            {
                label: 'Grand Total',
                value: this.formatAmount(this.state.service_agreement_items_total && this.state.service_agreement_items_total != 0 ? this.state.service_agreement_items_total.toFixed(2) : this.state.grand_total)
            },
            {
                label: 'Subtotal',
                value: this.formatAmount(this.state.sub_total),
            },
            {
                label: 'Tax',
                value: this.formatAmount(this.state.tax),
            },
            {
                label: 'Customer Signed Date',
                title: this.formatDate(this.state.customer_signed_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.customer_signed_date),
            },
            {
                label: 'Signed by',
                value: (() => {
                    const details = _.get(this.state, 'signed_by_details', null)
                    if (!details) {
                        return 'N/A'
                    }

                    const fname = _.get(this.state, 'signed_by_details.firstname', null)
                    const lname = _.get(this.state, 'signed_by_details.lastname', null)
                    const fullname = [fname, lname].filter(Boolean).join(' ')

                    const tooltip = [fullname, '(Staff member)'].filter(Boolean).join(' ')

                    return <span title={tooltip}>{fullname}</span>
                })(),
            },
            {
                label: 'Contract Start Date',
                title: this.formatDate(this.state.contract_start_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.contract_start_date),
            },
            {
                label: 'Contract End Date',
                title: this.formatDate(this.state.contract_end_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.contract_end_date),
            },
            {
                label: 'Plan Start Date',
                title: this.formatDate(this.state.plan_start_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.plan_start_date),
            },
            {
                label: 'Plan End Date',
                title: this.formatDate(this.state.plan_end_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.plan_end_date),
            },
        ]


        return (
            <div className="row slds-box" style={styles.root}>
                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Service agreement details</h3>
                </div>
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
                <ExpandableSection
                    id="default-expandable-section"
                    title="Other support services being provided by ONCALL:"
                >
                    <Checkbox
                        assistiveText={{ label: 'Support Coordination' }}
                        labels={{ label: 'Support Coordination' }}
                        disabled={true}
                        checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.support_coordination)} />

                    <Checkbox
                        assistiveText={{ label: 'NDIS Client Services' }}
                        labels={{ label: 'NDIS Client Services' }}
                        disabled={true}
                        checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.ndis_client_services)} />

                    <Checkbox
                        assistiveText={{ label: 'Supported Independent Living' }}
                        labels={{ label: 'Supported Independent Living' }}
                        disabled={true}
                        checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.supported_independent_living)} />

                    <Checkbox
                        assistiveText={{ label: 'Plan Management' }}
                        labels={{ label: 'Plan Management' }}
                        disabled={true}
                        checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.plan_management)} />

                    <Checkbox
                        assistiveText={{ label: 'Other' }}
                        labels={{ label: 'Other' }}
                        disabled={true}
                        checked={this.hasAdditionalService(CreateServiceAgreement.EAdditionalServiceTypes.other)} />
                </ExpandableSection>
                <ServiceAgreementPayment
                    opportunity_id={this.state.opportunity_id}
                    paymentdata={this.state.service_agreement_payments}
                    get_service_agreement_details={() => { this.get_service_agreement_details(_.get(this.props, 'props.match.params.id')) }}
                    service_agreement_ac_name={this.state.sa_account_name}
                    service_agreement_id={_.get(this.props, 'props.match.params.id')}
                />

            </div>
        )
    }

    /**
     * Determin line items table colums
     * return array
     */
    determineItemsTblColumns() {
        return [
            {
                _label: 'Item',
                accessor: "line_item_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Item Number',
                accessor: "line_item_number",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
            },
            {
                _label: 'Support category',
                accessor: "support_cat",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'ONCALL provided',
                accessor: "oncall_provided",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Quantity',
                accessor: "qty",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Rate',
                accessor: "rate",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (props.original.line_item_price_id !=='0') {
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
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            }
        ]
    }

    determineDocusignTblColumns() {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        return [
            {
                _label: 'Contract Id',
                accessor: "contract_id",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.original.contract_id)}</span>,
            },
            {
                _label: 'Type',
                accessor: "type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.original.document_type_label)}</span>,
            },
            {
                _label: 'To',
                accessor: "to_select",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    const { original } = props
                    let ac_label = JSON.parse(original.to_select);
                    return <span className="vcenter slds-truncate" title={ac_label.label}>{ac_label.label}</span>
                }
            },
            {
                _label: 'Signed By',
                accessor: "signed_by_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    const { original } = props
                    return <span className="vcenter slds-truncate" title={props.value}>{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Account',
                accessor: "account_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Related',
                accessor: "related",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable('Service Agreement for ' + _.get(this.state, 'opportunity.topic'))}</span>
            },
            {
                _label: 'Contract Sent',
                accessor: "send_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Sent By',
                accessor: "send_date",
                className: '_align_c__',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.original.created_by_fullname)}</span>
            },
            {
                _label: 'Status',
                accessor: "contract_status",
                className: '_align_c__',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Signed Date',
                accessor: "signed_date",
                className: '_align_c__',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate">-</span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Document',
                accessor: "url",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                className: '_align_c__',
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate">-</span>
                    }
                    return (
                        <span className="vcenter slds-truncate"><a style={styles.hyperlink} className="default-underlined" title="View/download contract" target="_blank" href={defaultSpaceInTable(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod10 + '/?url=' + props.value)}>{defaultSpaceInTable(props.original.signed_file)}</a></span>
                    )
                }
            },
        ]
    }


    /**
     * Close item Dialog
     * Param1 is reserve
     * Param2 is used to identify where modal is close
     * or move to edit dialog
     * (if param2 is true means edit Dialog needs to open and pass selected data in it)
     */
    closeItemDialog = (param1, param2) => {
        var tempStorage = this.myRefForSelectedItem.current.state.activeLineItem;
        var selectedLineItems = this.myRefForSelectedItem.current.state.selectedLineItems;
        var alreadySeleactedItem = this.myRefForSelectedItem.current.state.alreadySeleactedItem;



        if (param2) {
            var isOneChecked = this.IsIdInArray(tempStorage, 'selected')
            if (isOneChecked) {
                if (this.IsChildInArray(tempStorage) == true) {
                    toastMessageShow('Missing parent item selection for one or more child items.', "e");
                    return;
                }

                alreadySeleactedItem.forEach(element => {
                    let item = tempStorage.findIndex(x => x.id == element.id);
                    if (!item) {
                        tempStorage['selected'] = true;
                        tempStorage['amount'] = element.amount;
                        tempStorage['incr_id_service_agreement_items'] = element.incr_id_service_agreement_items;
                    }
                });
                if (alreadySeleactedItem && alreadySeleactedItem.length != 0) {
                    tempStorage = tempStorage.concat(alreadySeleactedItem)

                    let parent = [];
                    tempStorage.forEach((e, i) => {
                        if (e.category_ref == '') {
                            parent.push(e);
                            tempStorage.splice(i, 1);
                        }                       
                    });


                    var sorted_parent = parent.sort(function (a, b) {
                        return parseInt(a.line_item_number) - parseInt(b.line_item_number);
                    });
                    var sorted_child = tempStorage.sort(function (a, b) {
                        return parseInt(b.incr_id_service_agreement_items) - parseInt(a.incr_id_service_agreement_items);
                    })
                    var parent_child = [];
                    for (let i = 0; i < sorted_parent.length; i++) {
                        parent_child.push(sorted_parent[i]);
                        for (let j = 0; j < sorted_child.length; j++) {
                            if (sorted_child[j].category_ref == sorted_parent[i].line_item_number) {
                                parent_child.push(sorted_child[j]);
                            }
                        }
                    }
                    var jsonObject = parent_child.map(JSON.stringify);
                    var uniqueSet = new Set(jsonObject);
                    parent_child = Array.from(uniqueSet).map(JSON.parse);
                }

                this.setState({ openItemDialog: false }, () => {
                    this.setState({
                        editSelectedDialogBox: true,
                        selectedLineItem: selectedLineItems,
                        activeLineItem: alreadySeleactedItem && alreadySeleactedItem.length == 0 ? tempStorage : parent_child

                    })
                });
            } else {
                toastMessageShow('Select atleast one Item to continue.', "e");
            }
        } else {
            this.setState({ openItemDialog: false, callGetLineItem: true, selectedLineItem: [] });
        }
    }

    /**
     * Search selected is set to true in selected key
     * in given array
     */
    IsIdInArray = (array) => {
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
    IsChildInArray = (array) => {

        for (var i = 0; i < array.length; i++) {
            //Getting parent item
            if (array[i].category_ref == '' && array[i].selected === false) {
                //To Check child is selected or not
                for (var j = 0; j < array.length; j++) {
                    if (array[i].line_item_number === array[j].category_ref && array[j].selected === true) {
                        return true;
                    }
                }
            }

        }
    }

    /**
     * Close edit item dialog and refresh the table content
     */
    closeEditItemDialog = (needPageRefresh) => {
        this.setState({ editSelectedDialogBox: false }, () => {
            this.get_service_agreement_details(this.props.props.match.params.id);
            this.setState({alreadySeleactedItem : [], selectedLineItem: []});
        })
    }

    /*
     * Close edit Dialog and move to `Add item` dialog
     * with selected data
     */
    backBtn = () => {
        var tempStorage = this.myRefForSelectedItemFromEditScreen.current.state.selectedLineItem;
        var activeLineItem = this.myRefForSelectedItemFromEditScreen.current.state.activeLineItem;
        this.setState({ editSelectedDialogBox: false }, () => {
            this.setState({ openItemDialog: true, activeLineItem: activeLineItem, selectedLineItem: tempStorage, callGetLineItem: false })
        })
    }

    /**
     * Render related tab content
     * Cards - Attachment, Items
     */
    renderRelatedTab() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        })
        const id = _.get(this.props, 'props.match.params.id')

        return (
            <React.Fragment>
                <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: 'none', paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
                    <AttachmentCard
                        object_type={AttachmentCard.OBJECT_TYPE_SERVICE_AGREEMENT}
                        object_id={id}
                        attachments={this.state.attachments}
                        onSuccessUploadNewFiles={() => this.get_service_agreement_details(id)}
                    />
                </div>
                <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: 'none', paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
                    <ServiceAgreementGoals related_service_agreement_id={id}
                        plan_start_date={this.state.plan_start_date}
                        plan_end_date={this.state.plan_end_date}
                        service_type={_.get(this.state, 'opportunity.topic')}
                        topic={'Service Agreement for ' + _.get(this.state, 'opportunity.topic')}
                        is_portal_managed={this.state.service_agreement_payments && this.state.service_agreement_payments.managed_type == 1 ? true : false}
                        service_booking_creator={this.state.service_agreement_payments ? this.state.service_agreement_payments.service_booking_creator : 0} />
                </div>
                <div className="slds-col slds-m-top_medium pl-3 pr-3" style={{ border: 'none', paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
                    <ServiceBookingsList related_service_agreement_id={id}
                        is_portal_managed={this.state.service_agreement_payments && this.state.service_agreement_payments.managed_type == 1 ? true : false}
                        service_booking_creator={this.state.service_agreement_payments ? this.state.service_agreement_payments.service_booking_creator : 0} />
                </div>
                {this.renderLineItems()}
                {this.renderDocusign()}
            </React.Fragment>
        )

    }

    /**
    * open service booking creation 
    */
    openServiceBookingCreationModel() {

        if (!this.state.service_agreement_payments) {
            this.setState({ OpenServiceBookingModal: true })
            return;
        }

        if (this.state.service_agreement_payments.managed_type == 1) {
            this.setState({ OpenServiceBookingModal: true })
        }
        else {
            toastMessageShow('Service bookings could be entered only if the payments are portal managed'
                , "e");
        }

    }

    /**
   * Render service booking  card
   */
    renderServiceBookingList = () => {
        // Card style
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        // Get service booking table column
        const displayedColumns = this.determineServiceBookingTblColumns();

        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical">
                    <Card
                        headerActions={<Button label={'New'}
                            onClick={() => this.openServiceBookingCreationModel()} />}
                        heading={"Service Bookings (" + this.state.service_booking_list.length + ")"}
                        style={styles.card}
                        icon={<Icon category="standard" name="document" size="small" />}
                    >
                        {this.state.service_booking_list.length > 0 && (<> <div class="slds-grid slds-grid_pull-padded-medium">
                            <div class="slds-col slds-p-horizontal_medium">
                                <span>&nbsp;</span>
                            </div>
                            <div class="slds-col slds-p-horizontal_medium">
                                <span>&nbsp;</span>
                            </div>
                        </div>
                            <SLDSReactTable
                                PaginationComponent={React.Fragment}
                                ref={this.reactTable}
                                manual="true"
                                loading={this.state.loading}
                                pages={this.state.pages}
                                filtered={this.state.filtered}
                                columns={displayedColumns}
                                data={this.state.service_booking_list}
                                defaultPageSize={9999}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No records found"
                                collapseOnDataChange={true}
                                getTableProps={() => ({ className: `slds-table` })}
                                style={{
                                    fontSize: 13
                                }}
                                resizable={true}
                            />
                            <div className="slds-align_absolute-center ">

                                <a href="#" className="mt-2" style={{ color: '#0070d2' }}>
                                    {'View All'}
                                </a>
                            </div>
                        </>)}
                    </Card>


                </div>
            </div>
        );
    }
    /**
     * Render line items card
     */
    renderLineItems = () => {
        // Card style
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        // Get line items table column
        const displayedColumns = this.determineItemsTblColumns();

        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical">
                    <Card
                        headerActions={<Button label={(this.state.service_agreement_items.length > 0) ? 'Edit' : 'New'} onClick={e => this.setState({ openItemDialog: true, callGetLineItem: true })} />}
                        heading={"Items (" + this.state.service_agreement_items.length + ")"}
                        style={styles.card}
                        icon={<Icon category="standard" name="product_item" size="small" />}
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
                            filtered={this.state.filtered}
                            columns={displayedColumns}
                            data={this.state.service_agreement_items}
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
                        />
                    </Card>

                    {(this.state.openItemDialog) ?
                        <AddNewItemInServiceAgreement
                            openItemDialog={this.state.openItemDialog}
                            service_agreement_id={this.props.props.match.params.id}
                            closeItemDialog={this.closeItemDialog}
                            get_opportunity_details={this.get_service_agreement_details}
                            ref={this.myRefForSelectedItem}
                            callGetLineItem={this.state.callGetLineItem}
                            activeLineItem={this.state.activeLineItem}
                            selectedLineItem={this.state.selectedLineItem}
                            selectedLineItem={this.state.selectedLineItem}
                        />
                        : ''
                    }

                    {(this.state.editSelectedDialogBox) ?
                        <EditSelectedItemInServiceAgreement
                            editSelectedDialogBox={this.state.editSelectedDialogBox}
                            closeEditItemDialog={this.closeEditItemDialog}
                            selectedLineItem={this.state.selectedLineItem}
                            backBtn={this.backBtn}
                            ref={this.myRefForSelectedItemFromEditScreen}
                            activeLineItem={this.state.activeLineItem}
                            service_agreement_id={this.props.props.match.params.id}
                        />
                        : ''
                    }
                </div>
            </div>
        );
    }
    renderDocusign = () => {
        // Card style
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        // Get line items table column
        const displayedColumns = this.determineDocusignTblColumns();

        return (
            <div className="slds-col slds-m-top_medium pl-3 pr-3">
                <div className="slds-grid slds-grid_vertical">
                    <Card
                        headerActions={<Button label={'New'} onClick={e => this.setState({ openDocusigDialog: true })} />}
                        heading={"Docusign (" + this.state.service_docusign_datas.length + ")"}
                        style={styles.card}
                        icon={<Icon category="standard" name="product_item" size="small" />}
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
                            filtered={this.state.filtered}
                            columns={displayedColumns}
                            data={this.state.service_docusign_datas}
                            defaultPageSize={9999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No records found"
                            collapseOnDataChange={true}
                            getTableProps={() => ({ className: `slds-table` })}
                            style={{
                                fontSize: 13
                            }}
                            resizable={true}
                        />
                    </Card>

                    {(this.state.openDocusigDialog) ?
                        <AddNewDocuSign
                            // key={this.props.risk_assessment_id}
                            isOpen={this.state.openDocusigDialog}
                            onClose={() => this.setState({ openDocusigDialog: false })}
                            onSuccess={() => this.setState({ openDocusigDialog: false }, this.get_service_agreement_details(_.get(this.props, 'props.match.params.id')))}
                            oppunity_decisionmaker_contacts={this.state.oppunity_decisionmaker_contacts ? this.state.oppunity_decisionmaker_contacts[0] : ""}
                            service_agreement_ac_name={this.state.sa_account_name}
                            service_agreement_related={'Service Agreement for ' + _.get(this.state, 'opportunity.topic')}
                            service_agreement_id={_.get(this.props, 'props.match.params.id')}
                            account_person_id={this.state.account_type == 1 ? _.get(this.state, 'account_person.id') : _.get(this.state, 'account_organisation.id')}
                            account_type={this.state.account_type}
                            opporunity_id={this.state.opportunity_id}
                        />
                        : ''
                    }

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

    handleOnCloseAddModal = () => {
        this.setState({ OpenServiceBookingModal: false })
        this.get_service_agreement_details(_.get(this.props, 'props.match.params.id'))
    }

    renderModals() {
        const id = _.get(this.props, 'props.match.params.id')
        const opportunity_id = this.state.opportunity_id

        const closeEditModal = () => this.setState({ editModal: false })

        return (
            <React.Fragment>
                {
                    this.state.editModal && (
                        // 'CreateServiceAgreement' is misleading component name,
                        //  a more accurate name should be 'SaveServiceAgreement' or 'SaveServiceAgreementForm'
                        <CreateServiceAgreement
                            key={id || Date.now()}
                            openServiceDialog={this.state.editModal}
                            opp_id={opportunity_id}
                            agreement_id={id}
                            closeServiceModal={closeEditModal}
                            get_opportunity_details={closeEditModal}
                            onSuccess={() => this.get_service_agreement_details(id)}
                            serviceAgreement={this.mapStateToServiceAgreementProps()}
                        />
                    )
                }
                {
                    this.state.openParticipantDialog && (
                        <CreateParticipantModel
                            showModal={this.state.openParticipantDialog}
                            closeModal={(status, participantId) => this.closeParticipantModal(status, participantId)}
                            headingTxt="Create Participant"
                            service_agreement_id={id}
                        />
                    )
                }

                {
                    this.state.OpenServiceBookingModal && (
                        <CreateServiceBookingModal open={!!this.state.OpenServiceBookingModal}
                            onClose={this.handleOnCloseAddModal}
                            service_agreement_id={id}
                            is_portal_managed={this.state.service_agreement_payments && this.state.service_agreement_payments.managed_type == 1 ? true : false}
                            service_booking_creator={this.state.service_agreement_payments ? this.state.service_agreement_payments.service_booking_creator : 0}
                            onSuccess={this.handleOnCloseAddModal}
                        />
                    )
                }
                { (this.state.openPreviewDocusigDialog) ?
                    <PreviewDocuSign
                        // key={this.props.risk_assessment_id}
                        isOpen={this.state.openPreviewDocusigDialog}
                        onClose={() => this.setState({ openPreviewDocusigDialog: false })}
                        onSuccess={() => this.setState({ openPreviewDocusigDialog: false }, this.get_service_agreement_details(_.get(this.props, 'props.match.params.id')))}
                        oppunity_decisionmaker_contacts={this.state.oppunity_decisionmaker_contacts ? this.state.oppunity_decisionmaker_contacts[0] : ""}
                        service_agreement_ac_name={this.state.sa_account_name}
                        service_agreement_related={'Service Agreement for ' + _.get(this.state, 'opportunity.topic')}
                        service_agreement_id={_.get(this.props, 'props.match.params.id')}
                        account_person_id={this.state.account_type == 1 ? _.get(this.state, 'account_person.id') : _.get(this.state, 'account_organisation.id')}
                        account_type={this.state.account_type}
                        opporunity_id={this.state.opportunity_id}
                    />
                    : ''
                }
            </React.Fragment>
        )
    }

    /**
     * Open create participant modal
     */
    showParticipantModal = () => {
        this.setState({ openParticipantDialog: true });
    }

    /**
     * Close the modal when user save the participant and refresh the table
     * Get the Unique reference id
     */
    closeParticipantModal = (status, participantId) => {
        this.setState({ openParticipantDialog: false });

        if (status) {
            this.get_service_agreement_details(this.props.props.match.params.id);
        }
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
                    <ServiceAgreementPath
                        {...this.state}
                        get_service_agreement_details={this.get_service_agreement_details}
                    />

                    <div className="">
                        <div class="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box ">
                                        <Tabs onSelect={(tab) => {
                                            if (tab === 1) {
                                                this.setState({ renderRelatedTab: true });
                                            }
                                            if (tab === 2) {
                                                this.setState({ renderFeedTab: true });
                                            }
                                        }}>
                                            <TabsPanel label="Details">
                                                {this.renderDetailsTab()}
                                            </TabsPanel>
                                            <TabsPanel label="Related">
                                                {this.state.renderRelatedTab && this.renderRelatedTab() || ""}
                                            </TabsPanel>
                                            <TabsPanel label="Feed">
                                                {this.state.renderFeedTab && <Feed
                                                    ref={ref => (this.history = ref)}
                                                    items={this.state.fieldHistory}
                                                    sourceId={this.props.props.match.params.id}
                                                    relatedType={"service_agreement"}
                                                    getFieldHistoryItems={(id) => this.getFieldHistoryItems(id)}
                                                /> || ""}
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
                                {/* Create task for Service Agreements */}
                                <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12">
                                    <div className="white_bg_color slds-box">
                                        <div class="slds-grid slds-grid_vertical ">
                                            <div class="slds-col">
                                                <label>Activity</label>
                                                {this.state.activity_page ? <CreateActivityComponent
                                                    sales_type={"service"}
                                                    salesId={this.props.props.match.params.id}
                                                    contactId={this.state.account_details ? (this.state.account_details.contact_code ? this.state.account_details.id : '') : ''}
                                                    related_type="3"
                                                /> : ''}
                                            </div>
                                        </div>

                                        <div class="slds-col  slds-m-top_medium">
                                            <label>Activity</label>
                                            <ActivityTimelineComponent
                                                sales_type={"service"}
                                                salesId={this.props.props.match.params.id}
                                                related_type="3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {this.renderModals()}
                </IconSettings>
            </div>
        )
    }
}

export default ServiceAgreementDetails
