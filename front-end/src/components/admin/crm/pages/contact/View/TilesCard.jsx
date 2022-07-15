import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import {
    Icon,
    Dropdown
} from '@salesforce/design-system-react';
import { showArchiveAccountContactModal } from '../../account/AccountCommon';

class TilesCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sub_organisation: [],
        }
    }

    /**
     * Open archive account contact modal
     */
    openArchiveAccountContactModal(account_contact_id) {
        showArchiveAccountContactModal(account_contact_id, this.props.listCallback, 1, this.props.is_site);
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <article class="slds-tile slds-media slds-card__tile slds-hint-parent">
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
                                    this.openArchiveAccountContactModal(this.props.delete_id)
                                }}
                                openOn="click"
                                options={[
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