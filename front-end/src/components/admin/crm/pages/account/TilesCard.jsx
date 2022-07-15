import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import {
    Icon,
    Dropdown
} from '@salesforce/design-system-react';
import { showArchiveAccountModal, openAddEditAccountModal, showArchiveAccountContactModal } from './AccountCommon';
import { activate_org_portal_user } from '../../actions/ContactAction';
import { toastMessageShow } from '../../../../../service/common';

class TilesCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sub_organisation: [],
        }
        console.log("lll", this.props)
    }

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
            this.props.listCallback();
        }
    }

    /**
     * Open archive account organisation modal
     */
    openArchiveAccountModal(account_id, type) {
        showArchiveAccountModal(account_id, this.props.listCallback, null, type);
    }

    /**
     * Open archive account contact modal
     */
    openArchiveAccountContactModal(account_contact_id) {
        showArchiveAccountContactModal(account_contact_id, this.props.listCallback);
    }

    check_activate_org_portal_user() {
        if (this.props.org_details.is_primary === '1') {
            if (this.props.org_details.org_status === 'Active') {
                toastMessageShow('User already activated', 'e');
            } else {
                if (!this.props.org_details.email || this.props.org_details.email === '') {
                    toastMessageShow('Contact mail not available', 'e');
                } else {
                    activate_org_portal_user(this.props.org_details.person_id).then((result) => {
                        if (result.status) {
                            toastMessageShow(result.msg, 's');
                        } else {
                            toastMessageShow(result.error, 'e');
                        }
                    })
                }
            }

        } else {
            toastMessageShow('Not a primary contact', 'e');
        }
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <article class="slds-tile slds-media slds-card__tile slds-hint-parent">
                {this.state.openCreateModal && openAddEditAccountModal(this.props.id, null, null, null, this.state.openCreateModal, this.closeAddEditAccountModal, this.props.type=='sites' ? 1 : 0)}
                <div class="slds-media__figure">
                    {<Icon category="standard" name={this.props.icon.name} size="small" />}
                </div>
                <div class="slds-media__body">
                    <div className="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                        <h2 className="slds-tile__title slds-truncate" title={this.props.title}><Link to={this.props.url || "#"} title={this.props.title} style={{ color: '#0070d2' }}>{this.props.title}</Link></h2>
                        <div className="slds-shrink-none">
                            <Dropdown
                                align="right"
                                assistiveText={{ icon: 'More Options' }}
                                buttonVariant="icon"
                                iconCategory="utility"
                                iconName="down"
                                iconVariant="border-filled"
                                iconSize="x-small"
                                width="xx-small"
                                onSelect={(e) => {
                                    if(e.value == 1) {
                                        this.showAddEditModal()
                                    }
                                    else if(e.value == 2 && this.props.type == "contacts") {
                                        this.openArchiveAccountContactModal(this.props.delete_id)
                                    }
                                    else if(e.value == 2) {
                                        this.openArchiveAccountModal(this.props.delete_id, this.props.type)
                                    } else if (e.value === '3') {
                                        this.check_activate_org_portal_user();
                                    }
                                }}
                                openOn="click"
                                options={(this.props.type == "contacts") ? [
                                    { label: 'Delete', value: '2' },
                                    { label: 'Portal login', value: '3' },
                                ] : [
                                    { label: 'Edit', value: '1' },
                                    { label: 'Delete', value: '2' },
                                ]}
                            />
                        </div>
                    </div>
                    <div class="slds-tile__detail">
                        <dl class="slds-list_horizontal slds-wrap lower_font_size">
                            {this.props.title_details.map((val, index) => (
                                <>
                                    <dt class="slds-item_label slds-text-color_weak slds-truncate" title={val.label}>{val.label}:</dt>
                                    <dd class="slds-item_detail slds-truncate" title={val.value}>{val.value || "N/A"}</dd>
                                </>
                            ))}
                        </dl>
                    </div>
                </div>
            </article>
        );
    }
}

export default TilesCard;