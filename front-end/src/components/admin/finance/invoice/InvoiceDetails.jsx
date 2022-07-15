import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import jQuery from 'jquery'
import { connect } from 'react-redux';
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
    MediaObject,Dropdown,DropdownTrigger
} from '@salesforce/design-system-react'
import { ROUTER_PATH,COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from '../../../../config.js';
import { postData, css, Confirm, toastMessageShow, AjaxConfirm, currencyFormatUpdate } from '../../../../service/common'
import '../../scss/components/admin/crm/pages/sales/opportunity/OpportunityDetails.scss'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import InvoiceStatusPath from './InvoiceStatusPath.jsx'
import InvoiceLineItems from './InvoiceLineItems'
import InvoiceShifts from './InvoiceShifts'

import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import { get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import { openAddEditInvoiceModal } from '../FinanceCommon';
import OncallFormWidget from '../../oncallui-react-framework/input/OncallFormWidget';
/**
 * Renders the invoice details page
 */
class InvoiceDetails extends React.Component {

    static defaultProps = {
        notAvailable: <span>&nbsp;</span>
    }

    constructor(props) {
        super(props);

        this.state = {
            invoice_id: _.get(this.props, 'props.match.params.id'),
            loading: false,
            invoice_no: '',
            shift_no: '',
            activeTab: 'related',
            activity_loading: true,
            openCreateModal: false,
            redirectTo: null,
            amount: '0',
            status: '',
            status_label: '',
            showActivity: false,
            created: '',
            enable_invoice_btn: false
        }

        /**
         * @type {React.Ref<HTMLDivElement>}
         */
        this.rootRef = React.createRef();
    }

    /**
     * fetching the invoice details
     */
    get_invoice_details = (id) => {
        this.setState({loading: true});
        postData('finance/FinanceDashboard/get_invoice_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ showActivity: true, loading: false })
            if (this.state.invoice_no == '') {
                this.redirectToListing();
            }
        });
    }

    /**
     * generating pdf file of the invoice
     */
     generate_invoice_pdf = (id) => {
        this.setState({loading: true, enable_invoice_btn: true});
        postData('finance/FinanceDashboard/generate_invoice_pdf', { id: this.state.invoice_id }).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");                
                this.setState({enable_invoice_btn: false}, () => {
                    window.open(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod22 + '/?url=' + result.preview_url, "_blank");
                });
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false })
        });
    }

    /**
     * submitting invoice line items into keypay
     */
    create_keypay_invoice = (id) => {
        this.setState({loading: true});
        postData('finance/FinanceDashboard/create_keypay_invoice', { id }).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.get_invoice_details(id);
            } else {
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false })
        });
    }

    /**
     * after no invoice details are found or archived the invoice
     */
    redirectToListing() {
        this.setState({ redirectTo: ROUTER_PATH + `admin/finance/invoices` });
    }

    /**
     * When component is mounted
     */
    componentDidMount() {
        const id = _.get(this.props, 'props.match.params.id')
        this.get_invoice_details(id);
    }

    /**
     * Open create invoice modal
     */
    showModal = () => {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user saves the invoice
     */
    closeAddEditInvoiceModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_invoice_details(this.state.invoice_id);
        }
    }

    /**
     * Action renderer for `<PageHeader />`
     */
    actions =  () => {
        let email_dis = Number(this.state.status) > 1 ? true : false;
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" title={`Edit`} onClick={() => this.showModal()} />
                    <Button label="Delete" title={`Delete`} />
                    <Button label="Generate PDF" onClick={() => this.generate_invoice_pdf()} disabled={this.state.enable_invoice_btn || this.state.invoice_type > 4 ? true : false} />
                    <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-medium"
                        iconVariant="border-filled"
                        onSelect={(e) => { 
                            this.handleMoreHeader(e);
                        }}
                        width="xx-small"
                        options={[
                            { label: 'Email Invoice', value: '1', disabled: email_dis },
                            { label: 'Send Reminder', value: '2' }
                        ]}
                    />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * Handle header more option
     * @param {obj} e
     */
    handleMoreHeader = (e) => {
        let objVal = e;
        if(objVal.value) {
            let selected_value = Number(objVal.value);
            switch(selected_value) {
                // Email Invoice
                case 1:
                    this.emailSendConfirm();
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Email send confirmation
     */
    emailSendConfirm = () => {
        var confirm_msg = 'Are you sure want to email this invoice to '+ this.state.contact_label + ' ?';
        var req = {
            ids: [this.state.invoice_id]
        };
        AjaxConfirm(req, confirm_msg, `finance/FinanceDashboard/send_invoice_mail`, { confirm: "Save" }).then(conf_result => {
            if (conf_result.status) {
                this.get_invoice_details(this.state.invoice_id);
                let msg = conf_result.hasOwnProperty('msg') ? conf_result.msg : '';
                toastMessageShow(msg, 's');
            }
            else {
                toastMessageShow(conf_result.error, "e");
            }
        })
    }

    /**
     * Renders the link for account in header
     */
    renderRelatedAccountLink() {
        const accountId = _.get(this.state, 'account_id', null)
        const account_type = _.get(this.state, 'account_type', null)
        const account =_.get(this.state, 'account_label', null)
        if (!account) {
            return this.props.notAvailable
        }

        const link = account_type == 2 ? ROUTER_PATH + `admin/crm/organisation/details/${accountId}` : ROUTER_PATH + `admin/item/participant/details/${accountId}`;
        const tooltip = `${account} \nClicking will take you to Account details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{account}</Link>
    }

    /**
     * Renders the link for site in header
     */
     renderRelatedSiteLink() {
        const siteId = _.get(this.state, 'site_id', null)
        const account_type = _.get(this.state, 'account_type', null)
        const site =_.get(this.state, 'site_label', null)
        if (!siteId) {
            return this.props.notAvailable
        }

        const link = account_type == 2 ? ROUTER_PATH + `admin/crm/organisation/details/${siteId}` : '';
        const tooltip = `${site} \nClicking will take you to Site details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{site}</Link>
    }

    /**
     * Renders the link related to contact.
     */
    renderRelatedContactLink() {
        const contactid = _.get(this.state, 'contact_id', null)
        const contact =_.get(this.state, 'contact_label', null)
        if (!contact) {
            return this.props.notAvailable
        }

        const link = ROUTER_PATH + `admin/crm/contact/details/${contactid}`
        const tooltip = `${contact} \nClicking will take you to Contact details`
        return <Link to={link} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{contact}</Link>
    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        let siteIndex = [];
        if (this.state.site_id != '' && this.state.site_id != null && this.state.account_type == 2) {
            siteIndex = 
            { 
                label: 'Site', 
                content: this.renderRelatedSiteLink(),
            };
        };        
        
        const header = {
            icon: "Invoice",
            label: "Invoice",
            title: this.state.invoice_no || '',
            details: [
                { 
                    label: 'Account', 
                    content: this.renderRelatedAccountLink(),
                },
                siteIndex,
                { 
                    label: 'Contact', 
                    content: this.renderRelatedContactLink(),
                },
                { 
                    label: 'Invoice Type', 
                    content: this.state.invoice_type_label,
                },
                { 
                    label: 'Shift Start Date', 
                    content: (moment(this.state.shift_start_date).format("DD/MM/YYYY")),
                },
                { 
                    label: 'Shift End Date', 
                    content: (moment(this.state.shift_end_date).format("DD/MM/YYYY")),
                },
                
                { 
                    label: 'Invoice Date', 
                    content: (moment(this.state.invoice_date).format("DD/MM/YYYY")),
                },
                { 
                    label: 'Total', 
                    content: currencyFormatUpdate(this.state.amount, '$'),
                }
            ],
        }

        return (
            <PageHeader
                details={header.details}
                icon={
                    <Icon
                        assistiveText={{
                            label: 'Invoice',
                        }}
                        category="standard"
                        name="record"
                        title="Invoice"
                    />
                }
                label={header.label}
                onRenderActions={this.actions}
                title={header.title}
                variant="record-home"
            />
        )
    }

    /**
     * Render related tab
     */
    renderRelatedTab() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        })

        return (
            <React.Fragment>
                <div class="slds-grid slds-grid_vertical slds_my_card">
                    <InvoiceLineItems invoice_id={this.state.invoice_id} get_invoice_details={this.get_invoice_details} status={this.state.status} />
                </div>
                <div className="slds-m-top_medium">
                    <div className="slds-grid slds-grid_vertical slds_my_card">
                        <InvoiceShifts invoice_id={this.state.invoice_id} />
                    </div>
                </div>
            </React.Fragment>
        )
    }
    
    getCurrency(amount){
        return (amount) ? currencyFormatUpdate(amount, '$') : '';
    }
    
    getFormattedDate(dDate){
        return dDate ? moment(dDate).format("DD/MM/YYYY") : '';
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

        var formProps = [
            {
                rowclass: 'row py-2',
                child: [
                   { value: this.state.invoice_no, label: "Invoice no", name:"invoice_no" },
                   { value: this.state.account_label, label: "Account", name:"account" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.state.contact_label, label: "Contact", name:"contact_label" },
                   { value: this.state.invoice_type_label, label: "Invoice Type", name:"invoice_type_label" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.state.status_label, label: "Status", name:"status_label" },
                   { value: this.getCurrency(this.state.amount), label: "Amount", name:"amount" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.getFormattedDate(this.state.invoice_date), label: "Invoice Date", name:"invoice_date" },
                   { value: this.getFormattedDate(this.state.shift_start_date), label: "Shift Start Date", name:"shift_start_date" }, 
                ],
            },{
                rowclass: 'row py-2',
                child: [
                   { value: this.getFormattedDate(this.state.shift_end_date), label: "Shift End Date", name:"shift_end_date" }
                ],
            }
        ];
                 
        return (
            <React.Fragment>
                <OncallFormWidget formElement={formProps} />
            </React.Fragment>
        )
    }

    /**
     * Render the sidebar
     */
    renderSidebar() {
        const styles = css({
            root: {
                fontSize: 12
            },
            sidebarBlock: {
                marginBottom: 15,
            },
        })

        return (
            <>
                <div className="slds-grid slds-grid_vertical">
                    <div className="slds-col">
                        <label>Activity</label>
                        {this.state.showActivity ?  <CreateActivityComponent
                            sales_type={"invoice"}
                            salesId={this.props.props.match.params.id}
                            related_type="6" 
                        /> :  ''} 
                    </div>
                </div>
                <div className="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                   {this.state.showActivity ? <ActivityTimelineComponent
                        sales_type={"invoice"}
                        salesId={this.props.props.match.params.id}
                        related_type="7" 
                        activity_loading={true}
                    /> : ''} 
                </div>
            </>
        )
    }

    /**
     * rendering components
     */
    render() {
        // This will only run when you archive this invoice
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
            <div className="InvoiceDetails slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            { this.renderPageHeader() }
                        </div>

                        <div className="slds-col slds-m-top_medium slds-theme_default slds-page-header">
                            <InvoiceStatusPath {...this.state} get_invoice_details={this.get_invoice_details} />
                        </div>

                        {openAddEditInvoiceModal(this.state.invoice_id, this.state.openCreateModal, this.closeAddEditInvoiceModal, undefined)}

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

export default connect(mapStateToProps, mapDispatchtoProps)(InvoiceDetails);