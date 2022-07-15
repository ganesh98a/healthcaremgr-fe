import React from 'react'
import moment from 'moment'
import classNames from 'classnames'
import { Button, Icon, Dropdown } from '@salesforce/design-system-react'

import { css } from '../../../../../service/common'

// DONT USE THIS ATM
export const UNSTABLE_TimelineItemDetails = props => {
    return (
        <article 
            className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small" 
            id="call-item-base" 
            aria-hidden="true"
        >
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


export const TimelineItem = ({
    subject,
    datetime = undefined,
    variant = 'event',
    expandable = true,
    icon = 'call',
    actions=[],
    description=undefined,
    details=undefined,
    onSelect=undefined,
}) => {

    const [isOpen, setIsOpen] = React.useState(false)

    const styles = css({
        subject: {
            fontSize: 13,
        }
    })

    const timelineClassNames = classNames({
        'slds-timeline__item': true,
        'slds-timeline__item_expandable': expandable,
        'slds-is-open': isOpen
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
                            // iconVariant="bare"
                            // iconSize="small"
                            variant="icon"
                            aria-controls="call-item-base"
                            iconClassName={['slds-timeline__details-action-icon']}
                            style={{ visibility: details ? 'visible' : 'hidden' }}
                            onClick={() => details && setIsOpen(!isOpen)}
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
                                <h3 className="slds-truncate" style={styles.subject} title={subject}>
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
                                        <Dropdown
                                            assistiveText={{ icon: 'More Options' }}
                                            buttonVariant="icon"
                                            iconCategory="utility"
                                            iconName="down"
                                            iconVariant="border-filled"
                                            iconSize="x-small"
                                            // menuPosition="overflowBoundaryElement"
                                            onSelect={(option, data) => {
                                                if (typeof option.onSelect === "function") {
                                                    option.onSelect(option, data)
                                                }
                                            }}
                                            openOn="click"
                                            options={actions}
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
                        { 
                            details 
                        }
                    </div>
                </div>
            </div>
        </li>
    )
}


export const Timeline = ({ items = [] }) => {
    const timelineItems = items

    if ((timelineItems || []).length <= 0) {
        return (
            <div className="slds-box slds-theme_default">
                <span>There are no items to display</span>
            </div>
        )
    }


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