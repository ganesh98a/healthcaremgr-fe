import React from 'react'
import { Card, Icon, MediaObject } from '@salesforce/design-system-react'
import { css } from '../../../../service/common';
import moment from 'moment';
import { IconSettings } from '@salesforce/design-system-react';
import {COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME} from 'config.js';

/**
 * Tile for `<ShiftAttachmentCard/>`
 */
export const Tile = ({
    /**
     * @type {string}
     */
    client_name,
    /**
     * @type {number}
     */
    file_size,
    /**
     * @type {string}
     */
    url,
    /**
     * @type {{label: string, value: React.ReactNode}[]}
     */
    details = [],
    is_image = false
}) => {

    const headerTooltip = ['string', 'number'].indexOf(typeof client_name) >= 0 ? client_name : undefined
    const styles = css({
        icon: {
            backgroundColor: '#baac93', // brown
        }
    })

    return (
        <MediaObject
            body={(
                <React.Fragment>
                    <h3 className="slds-tile__title slds-truncate" title={headerTooltip}>
                        <a href={url} className="reset" style={{ color: '#0070d2' }} target="_blank">{client_name}</a>
                    </h3>
                    {
                        (details || []).length > 0 && (
                            <div className="slds-tile__detail">
                                <dl className="slds-list_horizontal slds-wrap">
                                    {
                                        details.map((detail, i) => {
                                            const tooltip = typeof detail.label === "string" ? detail.label : undefined
                                            const tooltipValue = typeof detail.value === "string" ? detail.value : undefined

                                            return (
                                                <React.Fragment>
                                                    <dt className="slds-item_label slds-text-color_weak slds-truncate" title={tooltip}>
                                                        {detail.label}
                                                    </dt>
                                                    <dd className="slds-item_detail slds-truncate" title={tooltipValue}>
                                                        {detail.value}
                                                    </dd>
                                                </React.Fragment>
                                            )
                                        })
                                    }
                                </dl>
                            </div>
                        )
                    }
                </React.Fragment>
            )}
            className="slds-tile"
            figure={<Icon category="standard" name={is_image ? "photo" : "file"} size="small" style={styles.icon} />}
        // verticalCenter
        />
    )
}


/**
 * @typedef {typeof ShiftAttachmentCard.defaultProps} Props
 * 
 * Card to display uploaded attachments
 * 
 * @extends {React.Component<Props>}
 */
class ShiftAttachmentCard extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isSubmitting: false,
            existingAttachments: this.props.attachments,
        }
    }

    componentDidMount() {
    }

    /**
     * Determine tile details by provided attachment info
     * 
     * @param {any} attachment 
     */
    determineDetailsForAttachment(attachment) {
        const uploadedMoment = moment(attachment.created)
        let uploaded = null
        if (uploadedMoment.isValid()) {
            uploaded = uploadedMoment.format('Do MMMM YYYY')
        }

        return [
            {
                label: 'File Size',
                value: `${attachment.file_size} KB`,
                width: '50%'
            },
            {
                label: 'Uploaded On',
                value: uploaded,
            }
        ]
    }

    render() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            },
            rowParent: {
                borderRadius: 0,
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
            },
        })

        const existingAttachments = this.state.existingAttachments;

        return (
            <React.Fragment>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <Card
                        headerActions={''}
                        heading={'Uploaded Timesheet'}
                        style={styles.card}
                        icon={
                            <Icon
                                category="standard"
                                name="document"
                                size="small"
                            />
                        }
                    >
                        {
                            existingAttachments.length > 0 && (
                                <div className="slds-box" style={styles.rowParent}>
                                    <div className="row">
                                        {
                                            existingAttachments.map((attachment, i) => {
                                                return (
                                                    <div className="row">
                                                        <div key={i} className="col col-sm-6" style={{ marginBottom: 15 }}>
                                                            <Tile
                                                                client_name={attachment.filename}
                                                                file_size={0}
                                                                is_image={[1, '1'].indexOf(attachment.is_image) >= 0}
                                                                url={COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod4 + '/?url=' + attachment.file_show_url}
                                                                details={this.determineDetailsForAttachment(attachment)}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </Card>
                </IconSettings>
            </React.Fragment>
        )
    }
}

export default ShiftAttachmentCard