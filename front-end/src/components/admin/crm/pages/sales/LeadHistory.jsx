import React from 'react';

import moment from 'moment';
import _ from 'lodash';

import Icon from '@salesforce/design-system-react/lib/components/icon';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';

import titleCase from '../../../../../helpers/title_case.js';

import '../../../scss/components/admin/crm/pages/sales/opportunity/OpportunityHistory.scss';


class LeadHistory extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            expanded: {},
            source_id: props.sourceId
        }

        this.field_labels = {
            firstname: "First Name",
            lastname: "Last Name",
            lead_topic: "Topic",
            lead_company: "Referring Organization (if applicable)",
            lead_description: "Description",
            lead_status: "Status",
            lead_source_code: "Lead Source",
            lead_owner: "Owner"
        }
    }

    titleCase(label) {
        if (this.field_labels[label]) {
            return this.field_labels[label];
        }
        return titleCase(label);
    }

    toggleDetail(key, state = !this.state[key + '-expanded']) {
        this.setState({ [key + '-expanded']: state });
    }

    expand(key) {
        this.toggleDetail(key, true);
    }

    collapse(key) {
        this.toggleDetail(key, false);
    }

    shouldShowDetail(key) {
        return this.state[key + '-expanded'] ? 'block' : 'none'
    }

    getLifecycleEventType(item) {
        if (item.length == 1 && item[0].field == 'created') return 'created';
        if (item.length == 1 && item[0].field == 'converted') return 'converted';
        return 'updated';
    }

    renderTitle(key, item) {
        const eventType = this.getLifecycleEventType(item);

        const titleText = eventType == 'converted' ? 
            <>converted a <a href={'/admin/crm/leads/' + item[0].prev_val}>lead</a> to this opportunity</>
            : 
            <>{eventType} this record {moment(item[0].created_at).fromNow()}.</>
        
        return <>
            <div class="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                <p>
                    <a href="javascript:void(0);" title={item[0].created_by}>{item[0].created_by}</a>&nbsp;
                    {titleText}
                </p>
                {eventType == 'updated' && <button class="slds-button slds-button_icon slds-button_icon-border slds-button_icon-x-small" aria-haspopup="true" title="More Options" onClick={() => this.toggleDetail(key)}>
                    <Icon
                        category="utility"
                        name="down"
                        size="x-small"
                    />
                    <span class="slds-assistive-text">More Options</span>
                </button>}
            </div>
            <p class="slds-text-body_small">
                <a href="javascript:void(0);" title="Click for single-item view of this post" class="slds-text-link_reset">{moment(item[0].created_at).format('D MMMM YYYY')} at {moment(item[0].created_at).format('h:mm a')}</a>
            </p>
        </>
    }

    renderContent(key, item) {
        return this.getLifecycleEventType(item) != 'updated' ? <></> :
            <div class="slds-post__content slds-text-longform" style={{ display: this.shouldShowDetail(key) }}>
                {
                    item.map((field) =>
                        <ul class="slds-list--vertical">
                            <li class="slds-list__item">{this.titleCase(field.field)}</li>
                            <li class="slds-list__item">{field.prev_val? field.prev_val:"A blank value"} to {field.value? field.value:"a blank value"}</li>
                        </ul>
                    )}
            </div>
    }

    render() {
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <div class="field-history-feed slds-feed" style={{ margin: 0 + 'px', maxWidth: 'unset' }}>
                    <ul class="slds-feed__list">
                        {this.props.items && _.orderBy(Object.entries(this.props.items), _.identity, 'desc').map(([key, item]) =>
                            <li class="slds-feed__item">
                                <article class="slds-post">
                                    <header class="slds-post__header slds-media">
                                        <div class="slds-media__figure">
                                            <a href="javascript:void(0);">
                                                <Icon
                                                    category="action"
                                                    name="user"
                                                    size="x-small"
                                                />
                                            </a>
                                        </div>
                                        <div class="slds-media__body">
                                            {this.renderTitle(key, item)}
                                        </div>
                                    </header>
                                    {this.renderContent(key, item)}
                                </article >
                            </li >
                        )
                        }
                    </ul >
                </div >
            </IconSettings>
        )
    }
}

export default LeadHistory