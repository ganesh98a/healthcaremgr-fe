import React, { Component } from 'react';
import _ from 'lodash'
import { Link, Redirect } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, toastMessageShow, handleChange } from 'service/common.js';
import { connect } from 'react-redux'

import PropTypes from 'prop-types';

import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';

import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import AccountMembers from './AccountMembers';
import AccountContacts from './AccountContacts';
import AccountOrganisations from './AccountOrganisations';
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import AttachmentCard from '../AttachmentCard';
import { get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import { showArchiveAccountModal, openAddEditAccountModal } from './AccountCommon';
import AccountDetails from './AccountDetails';
import SiteDetails from './SiteDetails';
import { Col50, CustomModal, Label, Row, SelectList } from '../../../oncallui-react-framework';
import Text from '../../../oncallui-react-framework/input/Text';
import RadioList from '../../../oncallui-react-framework/input/RadioList';
import { Badge, Checkbox, ExpandableSection, Input,Tooltip} from '@salesforce/design-system-react';
import jQuery from "jquery";
import AccountBillingInfo from './AccountBillingInfo';
import SiteBillingInfo from './SiteBillingInfo';

const initialState = {
    org_id: '',
    tile_heading: "Organisation",
    tile_icon: "account",
    manageAccountRolesModal: false,
    openCreateModal: false,
    is_site: false,
    childorgprops: '',
    parent_org: {},
    child_par_organisation: [],
    contacts: [],
    loading: false,
    admin_permission: false,
    payroll_tax: "1",
    gst: "1",
    site_discount: "1",
    communication_mode: "1",
    billing_same_as_parent: false,
    loading_billing: false,
    isBasicBIOpen: false,
    isAdditionalBIOpen: true,
    ab_invoice_batch: "1",
    ab_site_discount: false,
    account_info_updated:false,
    update_billing_info:false,
}

class ViewOrganisation extends Component {

    constructor(props) {
        super(props);
        this.state = initialState;
        this.rootRef = React.createRef()
    }

    /**
     * fetching the org/sub-org or the site information
     */
    get_account_details = (id) => {
        this.setState({ loading: true });
        this.ResetAdditionalBillingInfo();
        postData('sales/Account/get_account_details_for_view', { org_id: id }).then((result) => {
            if (result.status) {
                this.setState(result.data, () => {
                    if (result.data["is_site"] == 1) {
                        result.data["billing_same_as_parent"] = "1";
                    }
                    if (result.data["billing_same_as_parent"] == 1) {
                        let {gst, payroll_tax, site_discount, communication_mode} = result.data["parent_billing_info"] || {gst: 0, payroll_tax: "1", site_discount: 0, communication_mode: 0};
                        this.setState({gst, payroll_tax, site_discount, communication_mode}, () => {
                            this.setBillingInfoAsParent(null);
                            if (result.data["is_site"] == 1) {
                                this.get_cost_book_options();
                            }
                        });
                    }
                    if(!result.data['ab_cost_code'])
                    {
                        let ab_cost_code=this.state.cost_codes && this.state.cost_codes.length && this.state.cost_codes[0]['value'];
                       this.setState({ab_cost_code}) 
                    }
                });
                this.setState({admin_permission : result.admin_permission,account_info_updated:true ,update_billing_info:true , is_site: result.data["is_site"] == 1 ? 1 : 0});
                this.setState({tile_heading: result.data.is_site == 1 ? "Site" : "Organisation"});
                this.setState({tile_icon: result.data.is_site == 1 ? "household" : "account"});
                this.setState({ loading: false });
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ redirectTrue: true, loading: false });
            }
        });
    }

    /**
     * reset additional Info
     *
     */
    ResetAdditionalBillingInfo(){
     this.setState({ab_invoice_type:null, ab_invoice_batch:null, ab_cost_code:null,cost_codes:null,
                    ab_site_discount:null,site_discount:null, ab_cost_book:null, confirm_bi:null}) 
    }
    /**
     * fetching the cost book
     */
     get_cost_book_options = () => {
        let org_id = this.props.match.params.id;
        let cost_code = this.state.ab_cost_code || (this.state.cost_codes && this.state.cost_codes.length && this.state.cost_codes[0]['value'] || '');
        let service_area = (this.state.service_area_selected_options && this.state.service_area_selected_options.length && this.state.service_area_selected_options[0]['value'] || '');
        let site_discount = this.state.ab_site_discount;
        this.setState({ loading: true });
        postData('sales/Account/get_cost_book_options', { org_id: org_id, cost_code: cost_code, service_area: service_area, site_discount: site_discount }).then((result) => {
            if (result.status) {
                let cost_book = result.data;
                let ab_cost_book =(cost_book && cost_book.length && cost_book[0]['value'] || '');
                this.setState({ cost_book_options: result.data, ab_cost_book: ab_cost_book });
                this.setState({ loading: false });
            } else {
                toastMessageShow(result.error, "e");
                this.setState({ loading: false, ab_cost_book: '' });
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        var org_id = this.props.match.params.id;
        this.setState({org_id: org_id});
        this.get_account_details(org_id);
    }

    componentDidUpdate(prevProps){
         if(window.location.pathname != prevProps.location.pathname){
            var org_id = this.props.match.params.id;
            this.setState({org_id: org_id});
            this.get_account_details(org_id);
         }
    }

    /**
     * rendering header action buttons
     */
    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button disabled={this.state.loading} label="Edit" onClick={() => this.showAddEditModal()} />
                    <Button disabled={this.state.loading} label="Delete" onClick={() => this.archiveOrg(this.state.id)} />
                    <Button disabled={this.state.loading || this.state.loading_billing} label="Billing Information" onClick={() => this.orgBillingInformation(this.state.id)} />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );

    /**
     * Open create account organisation modal
     */
    showAddEditModal() {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user save the account and refresh the organisations table
     */
    closeAddEditAccountModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_account_details(this.state.id);
        }
    }

    /**
     * to set the redirection to listing page
     */
    redirectToListing() {
        this.setState({ redirectTrue: true });
    }
    
    /**
     * Open archive account modal
     */
    archiveOrg(account_id) {
        showArchiveAccountModal(account_id, null, this, this.state.is_site == 1 ? "sites" : "organisations");
    }

    /**
     * rendering details tab
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
        return (
            <TabsPanel label="Details">
                <div className="row slds-box" style={styles.root}>
                    {this.state.is_site == 0 ? <AccountDetails
                        {...this.state}
                        {...this.props}
                    /> : <SiteDetails
                        {...this.state}
                        {...this.props}
                    />}
                </div>
            </TabsPanel >
        )
    }

    /**
     * rendering related tab
     */
    renderRelatedTab() {

        if(this.state.loading == true) {
            return (
                <React.Fragment></React.Fragment>
            )
        }

        const org_id = this.props.match.params.id;
        return (
            <TabsPanel label="Related">
                <div class="slds-grid slds-grid_vertical slds_my_card">
                    <div className="slds-col">
                        <AccountContacts account_id={org_id} account_name={this.state.account_name} account_type={2} get_account_details={() => this.get_account_details(org_id)} />
                    </div>

                    {this.state.is_site == 0 ? <div className="slds-col slds-m-top_medium ">
                        <AccountOrganisations account_id={org_id} account_name={this.state.account_name} type="organisations" />
                    </div> : ''}

                    {this.state.is_site == 0 ? <div className="slds-col slds-m-top_medium ">
                        <AccountOrganisations account_id={org_id} account_name={this.state.account_name} type="sites" />
                    </div> : ''}
                    
                    <div class="slds-col slds-m-top_medium">
                        <div className="slds-grid slds-grid_vertical">
                            <AttachmentCard 
                                object_type={AttachmentCard.OBJECT_TYPE_ORGANISATION}
                                object_id={org_id}
                                attachments={this.state.attachments}
                                onSuccessUploadNewFiles={() => this.get_account_details(org_id)}
                            />
                        </div>
                    </div>

                    <div className="slds-col slds-m-top_medium ">
                        <AccountMembers account_id={org_id} />
                    </div>
                </div >
            </TabsPanel >
        )
    }

    /**
     * rendering activity block
     */
    renderActivityBlock() {
        return (
            <div className="white_bg_color slds-box">
                <div class="slds-grid slds-grid_vertical ">
                    <div class="slds-col">
                        <label>Activity</label>
                        <CreateActivityComponent
                            sales_type={"organisation"}
                            salesId={this.props.match.params.id}
                        />
                    </div>
                </div>

                <div class="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                    <ActivityTimelineComponent
                        sales_type={"organisation"}
                        salesId={this.props.match.params.id}
                    />
                </div>
            </div>
        )
    }

     /**
     * if service is area more than it will display in tooltip as list,otherwise a single text
     */
   formatted_serviceArea_list(){
     if(this.state.service_area_selected_options && this.state.service_area_selected_options.length > 1){
    const return_values=this.state.service_area_selected_options && this.state.service_area_selected_options.map((sa,ind) => {
        return (ind >0 && <><p>{sa.label}</p></>)
    }) 
      return ( this.state.service_area_selected_options.length > 1 && (<Tooltip
        align="right"
        content={return_values}
        variant="list-item"
        dialogClassName="org_service_area_tooltip"
        body={return_values} >
        <span style={{cursor:'pointer'}}>{this.state.service_area_selected_options && this.state.service_area_selected_options[0]['label']}
      { (` (+${return_values.length -1})`)}</span></Tooltip>)
      )
    }
    if(this.state.service_area_selected_options && this.state.service_area_selected_options.length ==1 ){
      return(this.state.service_area_selected_options[0]['label'])
    }
      return 'N/A';
        
    }
    

    /**
     * rendering components
     */
    render() {
        var details = [];
        if(this.state.parent_org && this.state.parent_org.value > 0) {
            details.push({
                label: 'Parent Account',
                content: <Link to={ROUTER_PATH + `admin/crm/organisation/details/${this.state.parent_org.value}`} className="reset" style={{ color: '#006dcc' }} title={this.state.parent_org.label}>{this.state.parent_org.label}</Link>,
            });
        }
        
        details.push({
            label: 'Primary Contact', 
            content: this.state.primary_contact_id > 0 ? <Link to={ROUTER_PATH + `admin/crm/contact/details/${this.state.primary_contact_id}`} className="reset" style={{ color: '#006dcc' }} title={this.state.primary_contact_name}>{this.state.primary_contact_name}</Link> : '',
        });
        details.push({
            label: 'Service Area', 
            content: this.formatted_serviceArea_list(),
        });
        details.push({
            label: 'Status',
            content: this.state.status == 1 ? "Active" : "Inactive"
        });

        return (
            <React.Fragment>
                {(this.state.redirectTrue) ? <Redirect to='/admin/crm/organisation/listing' /> : ''}
                
                <div ref={this.rootRef} class="slds-grid slds-grid_vertical slds" style={{ "font-family": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "font-size": "13px;" }}>
                    <div class="slds-col custom_page_header">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    <Icon
                                        assistiveText={{ label: 'User' }}
                                        category="standard"
                                        name={this.state.tile_icon}
                                    />
                                }
                                label={this.state.tile_heading}
                                onRenderActions={this.actions}
                                title={this.state.account_name}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <div class="slds-col">
                        <div className="slds-grid slds-wrap slds-gutters_x-small">
                            <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                <div className="white_bg_color slds-box ">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <Tabs id="tabs-example-default">
                                            {this.renderRelatedTab()}
                                            {this.renderDetailsTab()}
                                            {this.renderBillingInfoTab()}
                                        </Tabs >
                                    </IconSettings >
                                </div>
                            </div>


                            <div class="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12 ">
                                {this.renderActivityBlock()}
                            </div>
                        </div >
                    </div >
                </div >
                {this.state.openCreateModal && openAddEditAccountModal(this.props.match.params.id, null, this.state.parent_org_id, null, this.state.openCreateModal, this.closeAddEditAccountModal, this.state.is_site)}
                {
                    this.state.show_billing_info === true? <CustomModal
                    title={this.state.is_site == 1? "Site Billing Information" : "Organisation Billing Information"}
                    showModal={this.state.show_billing_info}
                    setModal={status => this.setState({ show_billing_info: status })}
                    size="small"
                    onClickOkButton={(e) => { this.saveBillingInfo(e) }}
                    width="200px"
                    style={{ minHeight: "200px", overFlowY: "hidden" }}
                    loading={this.state.loading}
                >
                    <form name="billing_info" id="billing_info">
                    {this.state.is_site == 1? <ExpandableSection
                        id="default-expandable-section"
                        title="Basic Billing Information"
                        isOpen={this.state.isBasicBIOpen}
                        onToggleOpen={() => this.onToggleOpen("isBasicBIOpen")}
                    > 
                        {this.renderBasicBillingInfo()}
                        </ExpandableSection> : this.renderBasicBillingInfo()}
                        {this.state.is_site == 1 && <ExpandableSection
                            id="default-expandable-section"
                            title="Additional Billing Information"
                            isOpen={this.state.isAdditionalBIOpen}
                            onToggleOpen={() => this.onToggleOpen("isAdditionalBIOpen")}
                        >
                            <Row>
                                <Col50>
                                    <SelectList name="ab_invoice_type" onChange={value => this.setState({ab_invoice_type: value})} value={this.state.ab_invoice_type} required label="Invoice Type" options={[{label: "Debtors", value: "1"}, {label: "SAMS", value: "2"}, {label: "COS (65+)", value: "3"}]} />
                                </Col50>
                                <Col50>
                                    <SelectList name="ab_invoice_batch" onChange={value => this.setState({ab_invoice_batch: value})} value={this.state.ab_invoice_batch} required label="Invoice Batch" options={[{label: "Weekly", value: "1"}, {label: "Monthly", value: "2"}, {label: "Manual", value: "3"}]} />
                                </Col50>
                            </Row>
                            <Row>
                                <Col50>
                                    <SelectList name="ab_service_area" value={this.state.service_area_selected_options && this.state.org_billing_info.org_sa[0]["value"]} disabled label="Service Area" options={this.state.org_billing_info.parent_org_sa || []} />
                                </Col50>
                                <Col50>
                                    <SelectList name="ab_support_worker_area" value={this.state.selected_support_area_worker && this.state.selected_support_area_worker.length && this.state.selected_support_area_worker[0]["value"] || []} disabled label="Preferred Support Worker Area" options={this.state.selected_support_area_worker} />
                                </Col50>
                            </Row>
                            <Row>
                                <Col50>
                                    <SelectList name="ab_cost_code" onChange={value => this.setState({ab_cost_code: value}, () => {
                                        this.get_cost_book_options();
                                    })} value={this.state.ab_cost_code} required label="Cost Code" options={this.state.cost_codes} />
                                </Col50>
                                <Col50>
                                    <RadioList name="ab_site_discount" 
                                    onChange={(e) => 
                                             { this.setState({ "ab_site_discount": e.target.value }, () => { this.get_cost_book_options(); }) }
                                             }

                                     value={!this.state.ab_site_discount? "0": this.state.ab_site_discount} required label="Site Discount" options={[{id: "absd_applicable", label: "Applicable", value: "1"}, {id: "absd_na", label: "Not Applicable", value: "0"}]} />
                                </Col50>
                            </Row>
                            <Row>
                                <Col50>
                                    <SelectList name="ab_cost_book" onChange={value => this.setState({ab_cost_book: value})} value={this.state.ab_cost_book} required label="Cost Book" options={this.state.cost_book_options} disabled />
                                </Col50>
                                <Col50 style={{paddingTop: "25px"}}>                                    
                                    <Checkbox
                                        assistiveText={{
                                            label: 'Confirm Billing Information',
                                        }}
                                        id="confirm_bi"
                                        labels={{
                                            label: 'Confirm Billing Information',
                                        }}
                                        checked={this.state.confirm_bi == "1"}
                                        name="confirm_bi"
                                        onChange={(e) => handleChange(this, e)}
                                    />
                                </Col50>
                            </Row>
                        </ExpandableSection>}
                    </form>
                </CustomModal> : ''
                }
            </React.Fragment >
        );
    }

    renderBasicBillingInfo() {
        let org_billing = this.state.org_billing_info.org_billing;
        return (
            <>
            {this.state.is_site != 1 && <Row><Col50><Checkbox disabled={!this.state.parent_org.value} name="billing_same_as_parent" id="billing_same_as_parent" onChange={e => this.setBillingInfoAsParent(e)} label="Same as Parent Organisation" checked={this.state.billing_same_as_parent === "1"? true : false} /></Col50></Row>}
            <Row>
                <Col50><Text disabled onChange={e => {return false}} value={this.state.invoice_to} label="Invoice To" /></Col50>
                <Col50><Text disabled onChange={e => {return false}} value={this.state.billing_address}  label="Billing Address" /></Col50>
            </Row>
            <Row>
                <Col50><Text disabled onChange={e => {return false}} value={this.state.payable_phone} label="Account Payable Phone" /></Col50>
                <Col50><Text disabled onChange={e => {return false}} value={this.state.payable_email} label="Account Payable Email" /></Col50>
            </Row>                        
            <Row>
                <Col50>
                <SelectList disabled={this.state.billing_same_as_parent === "1"} 
                            name="communication_mode" 
                            onChange={value => this.setState({communication_mode: value})} 
                            value={this.state.communication_mode||org_billing.communication_mode} required label="Preferred Communication Mode" 
                            options={[{label: "Email", value: "1"}, {label: "One Email per Invoice", value: "2"}, {label: "Post", value: "3"}]} />
                </Col50>
                <Col50><RadioList disabled={this.state.billing_same_as_parent === "1"} name="payroll_tax" onChange={(e) => { this.setState({ "payroll_tax": e.target.value }) }} value={this.state.payroll_tax} required label="Payroll Tax" options={[{id: "pt_applicable", label: "Applicable", value: "1"}, {id: "pt_na", label: "Not Applicable", value: "0"}]} /></Col50>
                <Col50><Input required={this.state.payroll_tax !== "1" && this.state.billing_same_as_parent !== "1"} label="Upload PRT Exemption Form" disabled={this.state.payroll_tax == "1"} type="file"/></Col50>
            </Row>
            <Row>
                <Col50><RadioList disabled={this.state.billing_same_as_parent === "1"} name="gst" onChange={(e) => { this.setState({ "gst": e.target.value }) }} value={this.state.gst||( org_billing && org_billing.gst)} required label="GST" options={[{label: "Applicable", id: "gst_applicable", value: "1"}, {label: "Not Applicable", id: "gst_na", value: "0"}]} /></Col50>
                <Col50><RadioList disabled={this.state.billing_same_as_parent === "1"} name="site_discount" onChange={(e) => { this.setState({ "site_discount": e.target.value }) }} value={this.state.site_discount || org_billing.site_discount} required label="Site Discount" options={[{label: "Applicable", value: "1", id: "sd_applicable"}, {label: "Not Applicable", value: "0", id: "sd_na"}]} /></Col50>
            </Row>
            </>
        )
    }

    orgBillingInformation(id,show_billing_info=true) {        
        let org_id = this.state.id;
        let billing_same_as_parent = this.state.billing_same_as_parent === "1"? 1 : 0;
        if (org_id) {
            this.setState({loading_billing: true});
            postData('sales/Account/get_organisation_billing_info', { org_id, billing_same_as_parent }).then((result) => {
                this.setState({loading_billing: false});
                if (result.status) {
                    this.setState({org_billing_info: result.data}, () => {
                        if(show_billing_info==true){
                            this.get_account_details(org_id);
                        }
                        this.setState({show_billing_info});
                       
                    });                
                }
            })
        }
    }

    saveBillingInfo(e) {
        e.preventDefault();
        jQuery("#billing_info").validate();
        if (!this.state.loading && jQuery('#billing_info').valid()) {
            this.setState({ loading: true });
            let {gst, payroll_tax, site_discount, communication_mode, org_id, billing_same_as_parent} = this.state;
            let ab_info = {};
            if (this.state.is_site == 1) {
                let ab_site_discount = this.state.ab_site_discount === false? "1" : this.state.ab_site_discount;
                ab_info = {ab_invoice_type: this.state.ab_invoice_type, ab_invoice_batch: this.state.ab_invoice_batch, ab_service_area: this.state.ab_service_area, ab_support_worker_area: this.state.ab_support_worker_area, 
                    ab_cost_code: this.state.ab_cost_code || (this.state.cost_codes && this.state.cost_codes.length && this.state.cost_codes[0]['value'] || 0), 
                    ab_site_discount, confirm_bi: this.state.confirm_bi, is_site: this.state.is_site, ab_cost_book: this.state.ab_cost_book}
            }
            postData('sales/Account/save_billing_info', {gst, payroll_tax, site_discount, communication_mode, org_id, billing_same_as_parent: billing_same_as_parent === "1"? 1 : 0, ...ab_info}).then((result) => {                
                this.setState({ loading: false, show_billing_info: false, update_billing_info: !this.state.update_billing_info }, () => {
                    this.setState({billing_info: {gst, payroll_tax, site_discount, communication_mode}});
                });
                if (result.status) {
                    toastMessageShow(result.message, "s");
                } else {
                    toastMessageShow(result.error, "e");                
                }
            });
        }
    }

    setBillingInfoAsParent(e) {
        let {gst, payroll_tax, site_discount, communication_mode} = this.state.parent_billing_info || {gst: 0, payroll_tax: "1", site_discount: 0, communication_mode: 0};  
        if (e && !e.target.checked) {
            gst = 0;
            payroll_tax = 0;
            site_discount = 0;
            communication_mode = '';
        }
        let billing_same_as_parent = e && e.target.checked? "1" : "0";
        if (!e) {
            billing_same_as_parent = "1";
        }
        this.setState({billing_same_as_parent, gst, payroll_tax, site_discount, communication_mode})
    }

    /**
     * rendering details tab
     */
     renderBillingInfoTab() {
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
        return (
            <TabsPanel label="Billing Information">
                <div className="row slds-box" style={styles.root}>
                {(this.state.account_info_updated && this.state.is_site==0) &&(<AccountBillingInfo
                        {...this.state}
                        {...this.props}
                        billing_info={this.state.billing_info}
                    />)}
                {(this.state.account_info_updated && this.state.is_site==1)&&(<SiteBillingInfo
                        {...this.state}
                        {...this.props}
                        billing_info={this.state.billing_info}
                    />)}
                </div>
            </TabsPanel >
        )
    }

    onToggleOpen = (key) => {
        this.setState({[key]: !this.state[key]});
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ViewOrganisation);