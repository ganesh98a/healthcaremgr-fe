import React from 'react';

import moment from 'moment';
import _ from 'lodash';

import Icon from '@salesforce/design-system-react/lib/components/icon';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';

import convertTitle from '../../../../../helpers/convert_title.js';

import '../../../scss/components/admin/crm/pages/sales/ServiceAgreementDoc/ServiceAgreementHistory.scss';

// todo: extract out into generic FieldHistoryFeed component, 
// with specialised wrapper components for each concept type.
// i.e. OpportunityDetails [Page] -> OpportunityFieldHistory [Tab] -> FieldHistoryFeed [Generic Component]

class ServiceAgreementFieldHistory extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            expanded: {}
        }

        this.componentDidMount = this.componentDidMount.bind(this);
        this.toggleDetail = this.toggleDetail.bind(this);
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
        this.render = this.render.bind(this);
        this.renderTitle = this.renderTitle.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.getLifecycleEventType = this.getLifecycleEventType.bind(this);
    }

    componentDidMount() { }

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

    getSeparator(field) {
        return (
            (field.field == "goals" || field.field == "additional_services") && <ul><li>to</li></ul> ||
            field.field != "goals" && <>to</>
        )
    }

    renderContent(key, item) {
        return this.getLifecycleEventType(item) != 'updated' ? <></> :
            <div class="slds-post__content slds-text-longform" style={{ display: this.shouldShowDetail(key) }}>
                {
                    item.map((field) => 
                        <ul class="slds-list--vertical">
                            <li class="slds-list__item">{field.field != 'additional_services_custom' && field.field != 'additional_services' ? convertTitle(field.field) : "Other support services being provided by ONCALL"}</li>
                            <li class="slds-list__item">{this.renderValue(field, 'prev')} {this.getSeparator(field)} {this.renderValue(field, '')}</li>
                        </ul>
                    )
                }
            </div>
    }

    renderValue(field, flag) {
        let val = [];
        if (field.field != 'goals' && field.field != 'additional_services') {
            return flag === 'prev'? `${field.prev_val}` : `${field.value}`;
        }
        if (field.field == 'additional_services') {
            val = flag === 'prev'? field.prev_val != "N/A" && JSON.parse(field.prev_val) : field.value != "N/A" && JSON.parse(field.value);
            if (!val || val.length == 0 || val == "N/A") {
                val = ["N/A"];
            }
            return  (
                <ul>
                    {
                    val.map(obj =>
                    <li>{obj}</li>
                    )
        }
                </ul>
            )
            
        }
        val = flag === 'prev'? JSON.parse(field.prev_val) : JSON.parse(field.value);
        return val.map(obj => 
            <ul>
                <li>{obj.goal? obj.goal:'N/A'}</li>
                <li>{obj.outcome? obj.outcome:'N/A'}</li>
            </ul>
        );
    }

    render() {
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <div class="field-history-feed slds-feed" style={{ margin: 0 + 'px', maxWidth: 'unset' }}>
                    <ul class="slds-feed__list">
                        {this.props.items && _.orderBy(Object.entries(this.props.items),(i) => +i.history_id, 'desc').map(([key, item]) =>
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

export default ServiceAgreementFieldHistory