
import React, { Component } from 'react';
import _ from 'lodash'
import jQuery from 'jquery'
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { postData, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'


import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Card from '@salesforce/design-system-react/lib/components/card';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import CreateContactModal from './../CreateContactModal';
import Details from './Details';
import ContactDetails from './ContactDetails';
import TilesCard from './TilesCard';
import CreateActivityComponent from 'components/admin/Activity/CreateActivityComponent.jsx';
import ActivityTimelineComponent from 'components/admin/Activity/ActivityTimelineComponent.jsx';
import CreateOpportunityPopUp from '../../opportunity/CreateOpportunityBox';
import ContactOrganisations from './ContactOrganisations';

import { get_contact_details_for_view, archive_contact, get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import AttachmentCard from '../../AttachmentCard';
import ManageAccountRoles from '../../account/ManageAccountRoles';
import DefaultPic from '../../../../oncallui-react-framework/object/DefaultPic';
import { Avatar } from '@salesforce/design-system-react';

class ViewContact extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sub_organisation: [],
            contact_id: this.props.match.params.id ? this.props.match.params.id : '',
            openOppBox: false,
            default_account: '',
            prevProps: ''
        }

        this.rootRef = React.createRef()
    }

    componentDidMount() {
        var contactId = this.props.match.params.id;
        this.props.get_contact_details_for_view({ contactId: contactId });
    }    

    componentWillReceiveProps(newProps){
        var contactId = this.props.match.params.id;
        var updatedContactId = newProps.match.params.id;

        if(contactId != updatedContactId){
            this.props.get_contact_details_for_view({ contactId: updatedContactId });
        }
    }

    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" onClick={() => this.setState({ openCreateModal: true, selectedOrgId: this.state.id })} />
                    <Button label="Delete" onClick={() => this.props.archive_contact(this.props.id)} />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );

    closeModal = (status) => {
        this.setState({ openCreateModal: false });

        if (status) {
            this.props.get_contact_details_for_view({ contactId: this.props.id });
        }
    }

    renderModals() {
        const contactId = _.get(this.props, 'match.params.id', 0)
        const ACCOUNT_TYPE_PERSON = 1

        let account_contact_roles = (this.props.contacts || []).map(c => {
            return {
                contact_key_val: {
                    label: c.contact_name,
                    value: c.id,
                },
                role_id: c.roll_id,
                can_book: [1, '1', true].indexOf(c.can_book) >= 0,
                id: c.sales_relation_id,
            }
        })

        return (
            <React.Fragment>
                <ManageAccountRoles
                    key={this.state.manageAccountRolesModal ? 1 : 0}
                    isOpen={this.state.manageAccountRolesModal}
                    closeModal={() => this.setState({ manageAccountRolesModal: false })}
                    account_contact_roles={account_contact_roles}
                    account_id={contactId}
                    account_type={ACCOUNT_TYPE_PERSON}
                    onSuccess={() => {
                        this.setState({ manageAccountRolesModal: false })
                        this.props.get_contact_details_for_view({ contactId });
                        // fetch contact list for email activity recipients
                        this.props.get_contact_name_search_for_email_act({ salesId: this.props.match.params.id, sales_type: 'contact', type: 'own' });
                        this.props.get_contact_name_search_for_email_act({ salesId: this.props.match.params.id, sales_type: 'contact', type: 'all' });
                    }}
                />
                {
                    this.state.openOppBox && (
                        <CreateOpportunityPopUp
                            openOppBox={this.state.openOppBox}
                            closeModal={this.closeOppCreateModal}
                            oppId={''}
                            pageTitle={'New Opportunity'}
                            data={this.state}
                            default_account={this.state.default_account}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    yesOrNoLabel(val) {
        if ([1, '1', true].indexOf(val) >= 0) {
            return 'yes'
        }

        if ([0, '0', false].indexOf(val) >= 0) {
            return 'no'
        }

        return <>&nbsp;</>
    }

    /**
     * Open opportunity create modal
     */
    showOppCreateModal = () => {
        this.setState({ openOppBox: true, default_account: { label: this.props.firstname + ' ' +this.props.lastname, value: this.props.match.params.id, account_type: 1 } });
    }

    /**
     * Close opportunity create modal
     */
    closeOppCreateModal = () => {
        this.setState({ openOppBox: false });
        this.props.get_contact_details_for_view({ contactId: this.props.id });
    }

    renderDetailsTab() {
        return (
            <TabsPanel label="Details">
                <div className="container-fluid">
                {/*<Details {...this.props} /> */}
                    <ContactDetails {...this.props} />
                </div>
            </TabsPanel >
        )
    }

    renderRelatedTab() {
        return (
            <TabsPanel label="Related">
                <div className="slds-grid slds-grid_vertical slds_my_card">
                    <div className="slds-col ">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <div className="slds-grid slds-grid_vertical">
                                <Card
                                    id="ExampleCard"
                                    headerActions={<Button label="New" onClick={() => this.setState({ manageAccountRolesModal: true })} />}
                                    heading={"Contacts (" + this.props.contacts.length + ")"}
                                    icon={<Icon category="standard" name="contact" size="small" />}
                                >{this.props.contacts.length > 0 ?
                                    <div className="slds-card__body_inner">
                                        <ul className="slds-grid slds-wrap slds-grid_pull-padded">
                                            {this.props.contacts.map((val, index) => (
                                                <li className="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3" key={index + 1}>
                                                    <TilesCard
                                                        title={val.contact_name}
                                                        url={"/admin/crm/contact/details/" + val.id}
                                                        title_details={[{label: "Email", value: val.email }, { label: "Phone", value: val.phone },
                                                            {
                                                                label: 'Role',
                                                                value: _.get(val, 'role.label'),
                                                            },
                                                            {
                                                                label: 'Can book?',
                                                                value: this.yesOrNoLabel(val.can_book)
                                                            },

                                                        ]}
                                                        icon={{ category: "standard", name: "contact", size: "small" }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div> : ""}
                                </Card>
                            </div>
                        </IconSettings>
                    </div>

                    <div className="slds-col slds-m-top_medium ">
                        <ContactOrganisations contact_id={this.state.contact_id} account_name={this.state.fullname} account_type={2} type="organisations" />
                    </div>

                    <div className="slds-col slds-m-top_medium ">
                        <ContactOrganisations contact_id={this.state.contact_id} account_name={this.state.fullname} account_type={2} type="sites" />
                    </div>

                    <div className="slds-col slds-m-top_medium ">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <div className="slds-grid slds-grid_vertical">
                                <Card
                                    id="ExampleCard"
                                    headerActions={<Button label="New" onClick={this.showOppCreateModal} />}
                                    heading={"Opportunity (" + (this.props.opportunitys.length) + ")"}
                                    icon={<Icon category="standard" name="opportunity" size="small" />}
                                >{this.props.opportunitys.length > 0 ?
                                    <div className="slds-card__body_inner">
                                        <ul className="slds-grid slds-wrap slds-grid_pull-padded">
                                            {this.props.opportunitys.map((val, index) => (
                                                <li className="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3" key={index + 1}>
                                                    <TilesCard
                                                        key={index + 1}
                                                        url={"/admin/crm/opportunity/" + val.id}
                                                        title={val.topic}
                                                        title_details={[{ label: "ID", value: val.opportunity_number }, { label: "Amount", value: val.amount }]}
                                                        icon={{ category: "standard", name: "opportunity", size: "small" }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div> : ""}
                                </Card>
                            </div>
                        </IconSettings>
                    </div>
                    
                    <div className="slds-col slds-m-top_medium">
                        <div className="slds-grid slds-grid_vertical">
                            <AttachmentCard 
                                object_type={AttachmentCard.OBJECT_TYPE_CONTACT}
                                object_id={this.props.match.params.id}
                                attachments={this.props.attachments}
                                onSuccessUploadNewFiles={() => this.props.get_contact_details_for_view(this.props.match.params.id)}
                            />
                        </div>
                    </div>
                </div >
            </TabsPanel >
        )
    }

    renderActivityBlock() {
        return (
            <div className="white_bg_color slds-box">
                <div className="slds-grid slds-grid_vertical ">
                    <div className="slds-col">
                        <label>Activity</label>
                        <CreateActivityComponent
                            sales_type={"contact"}
                            salesId={this.props.match.params.id}
                        />
                    </div>
                </div>

                <div className="slds-col  slds-m-top_medium">
                    <label>Activity</label>
                    <ActivityTimelineComponent
                        sales_type={"contact"}
                        salesId={this.props.match.params.id}
                        prevProps={this.state.prevProps}
                    />
                </div>
            </div>
        )
    }

    render() {
        if (this.props.owner_name) {
            var details = [
                {
                    label: 'Owner',
                    content: this.props.owner_name,
                    truncate: true,
                },
            ];
        } else {
            var details = "";
        }

        var status_option = [{ "value": '0', "label": "Assigned" }, { "value": '1', "label": "Completed" }, { "value": '3', "label": "Archived" }];

        return (
            <React.Fragment>
                {(this.state.redirectTrue) ? <Redirect to='/admin/crm/contact/listing' /> : ''}
                <div className="slds-grid slds-grid_vertical slds" ref={this.rootRef} style={{ "fontFamily": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "fontSize": "13px" }}>
                    <div className="slds-col custom_page_header">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    this.props.avatar && <Avatar
                                        assistiveText={{ icon: 'Avatar image' }}
                                        imgSrc={this.props.avatar || DefaultPic}
                                        imgAlt="Profile Pic"
                                        size="medium"
                                        title={false}
                                    /> ||
									<Icon
                                        assistiveText={{ label: 'User' }}
                                        category="standard"
                                        name="contact"
                                    />
                                }
                                label="Contact"
                                onRenderActions={this.actions}
                                title={this.props.fullname}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <div className="slds-col ">
                        <div className="slds-grid slds-wrap slds-gutters_x-small">
                            <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                <div className="white_bg_color slds-box ">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <Tabs id="tabs-example-default">
                                            {this.renderRelatedTab()}
                                            {this.renderDetailsTab()}
                                        </Tabs >
                                    </IconSettings >
                                </div>
                            </div>

                            <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12 ">
                                {this.renderActivityBlock()}
                            </div>
                        </div>
                    </div>
                </div>

                {
                    this.state.openCreateModal ? <CreateContactModal
                        contactId={this.props.id}
                        showModal={this.state.openCreateModal}
                        closeModal={this.closeModal}
                    /> : ""
                }

                { this.renderModals() }

            </React.Fragment >
        );
    }
}


const mapStateToProps = state => ({
    ...state.ContactReducer,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_details_for_view: (request) => dispatch(get_contact_details_for_view(request)),
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
        archive_contact: (id) => dispatch(archive_contact(id)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ViewContact);