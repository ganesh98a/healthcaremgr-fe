import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { Dropdown } from '@salesforce/design-system-react';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AjaxConfirm, toastMessageShow } from 'service/common.js';
import ManageContactRoles from './ManageContactRoles';

class OpportunityContacts extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'related',
            openContactRoles: false,
            contactDataLen: 0,
            contacts_data: [],
            actions :[{ value: "1", label: "Delete" }],
            Isdelete : 0,
            redirectTrue: false
        }
    }

   /*  componentDidMount() {
    } */

    /* tabChange = (value) => {
        this.setState({ activeTab: value })
    }
 */
    showContactModal = () => {
        this.setState({ openContactRoles: true, contacts_data: this.state.contacts_data }, () => { })
    }

    closeModal = (param) => {
        this.setState({ openContactRoles: false }, () => {
            //if (param)
            //reFreashReactTable(this, 'fetchData');
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps['contacts_data']) {
            this.setState({ contacts_data: newProps.contacts_data, contactDataLen: newProps.contacts_data.length }, () => {

            })
        }
    }
    selectdelete = (value,oppId) => {
        if (!value) {
            console.error(`ID is required to delete oppurunity contacts`);
        }
        const msg = 'Are you sure you want to delete this oppurunity contact?';
        const confirmButton = 'Confirm';

        AjaxConfirm({ sales_id: value,contact_id :oppId  }, msg, 'sales/Opportunity/delete_opp_contacts', { confirm: confirmButton, heading_title: 'Delete Oppurunity Contact' }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, 's', { 'close': () => { this.setState({ loading: false, redirectTrue: true }) } });
                this.props.get_opportunity_details(this.props.opp_id);
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }


    render() {
        return (
            <React.Fragment>
                <article className="slds-card" style={{ border: '1px solid #dddbda', boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)' }}>
                    <div className="slds-card__header slds-grid ">
                        <header className="slds-media slds-media_center slds-has-flexi-truncate remove_previous_header_css">
                            <div className="slds-media__figure">
                                <span className="slds-icon_container slds-icon-standard-contact" title="contact">
                                    <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact"></use>
                                    </svg>
                                    <span className="slds-assistive-text">contact</span>
                                </span>
                            </div>
                            <div className="slds-media__body">
                                <h2 className="slds-card__header-title">
                                    <a href="#!" className="slds-card__header-link slds-truncate" title="Contacts (3)">
                                        <span>Contacts ({this.state.contactDataLen})</span>
                                    </a>
                                </h2>
                            </div>
                            <div className="slds-no-flex">
                                <button className="slds-button slds-button_neutral" onClick={() => this.showContactModal()}>
                                    {(this.state.contactDataLen > 0) ? 'Edit' : 'New'}
                                </button>
                            </div>
                        </header>
                    </div>
                    <div className="slds-card__body slds-card__body_inner">
                        <ul className="slds-grid slds-wrap slds-grid_pull-padded">

                            {(this.state.contacts_data.length > 0) ?
                                this.state.contacts_data.map((value, idx) => (
                                    <li className="slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3" key={idx}>
                                        <article className="slds-tile slds-media slds-card__tile slds-hint-parent">
                                            <div className="slds-media__figure">
                                                <span className="slds-icon_container slds-icon-standard-contact" title="Description of icon when needed">
                                                    <svg className="slds-icon slds-icon_small" aria-hidden="true">
                                                        <use href="/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact"></use>
                                                    </svg>
                                                    <span className="slds-assistive-text">Contact</span>
                                                </span>
                                            </div>
                                            <div className="slds-media__body">
                                                <div className="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                                                    <h3 className="slds-tile__title slds-truncate" title={value.name}>
                                                        <Link to={"/admin/crm/contact/details/"+value.contactId}>{value.name}</Link>
                                                    </h3>
                                                    <div className="slds-shrink-none">
                                                        <Dropdown
                                                         align="right"
                                            assistiveText={{ icon: 'More Options' }}
                                            buttonVariant="icon"
                                            iconCategory="utility"
                                            iconName="down"
                                            iconVariant="border-filled"
                                            iconSize="x-small"
                                            onSelect={(e) => +this.selectdelete(value.sales_id,this.props.opp_id)}
                                            openOn="click"
                                            options={this.state.actions}
                                        />
                                                    </div>
                                                </div>
                                                <div className="slds-tile__detail">
                                                    <dl className="slds-list_horizontal slds-wrap">
                                                        <dt className="slds-item_label slds-text-color_weak slds-truncate" title="First Label">Role:</dt>
                                                        <dd className="slds-item_detail slds-truncate" title="Role">{value.role} {(value.is_primary && value.is_primary == '1') ? '(Primary)' : ''}</dd>
                                                        <dt className="slds-item_label slds-text-color_weak slds-truncate" title="Second Label">Email:</dt>
                                                        <dd className="slds-item_detail slds-truncate" title="Email">{value.person_email}</dd>
                                                        <dt className="slds-item_label slds-text-color_weak slds-truncate" title="First Label">Phone:</dt>
                                                        <dd className="slds-item_detail slds-truncate" title="Phone">{value.person_phone}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </article>
                                    </li>
                                )) : ''}
                        </ul >
                    </div >
                    <footer className="slds-card__footer">
                        <a className="slds-card__footer-action" href="#!">View All <span className="slds-assistive-text">Contacts</span></a>
                    </footer>
                </article >

                {this.state.openContactRoles ? <ManageContactRoles contacts_data={this.state.contacts_data} openContactRoles={this.state.openContactRoles} closeModal={this.closeModal} get_opportunity_details={this.props.get_opportunity_details} opp_id={this.props.opp_id} {...this.props}/> : ''}
            </React.Fragment >
        );
    }
}



export default OpportunityContacts;