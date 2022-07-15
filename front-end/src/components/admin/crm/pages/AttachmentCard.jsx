import React from 'react';
import { connect } from 'react-redux';
import { Card, Button, Icon, MediaObject } from '@salesforce/design-system-react'
import { css, postImageData, toastMessageShow, postData } from '../../../../service/common'
import { BASE_URL } from '../../../../config'
import UploadAttachmentButton from './UploadAttachmentButton'
import moment from 'moment';
import { IconSettings} from '@salesforce/design-system-react';
import { get_sales_attachment_data } from "components/admin/crm/actions/SalesAttachmentAction.jsx";


/**
 * Tile for `<AttachmentCard/>`
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
    is_image=false
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
            figure={<Icon category="standard" name={is_image ? "photo" : "file"} size="small" style={styles.icon}/>}
            // verticalCenter
        />
    )
}


/**
 * @typedef {typeof AttachmentCard.defaultProps} Props
 * 
 * Card to display uploaded attachments
 * 
 * @extends {React.Component<Props>}
 */
class AttachmentCard extends React.Component {

    // check in `tbl_sales_attachment_relationship_object_type` table for these object types

    static OBJECT_TYPE_LEAD = 1
    static OBJECT_TYPE_OPPORTUNITY = 2
    static OBJECT_TYPE_CONTACT = 3
    static OBJECT_TYPE_ORGANISATION = 4
    static OBJECT_TYPE_NEED_ASSESSMENT = 5
    static OBJECT_TYPE_RISK_ASSESSMENT = 6
    static OBJECT_TYPE_SERVICE_AGREEMENT = 7
    static OBJECT_TYPE_FEED_BACK = 8

    static defaultProps = {
        /** @type {number} */
        object_id: null,
        /** @type {number} */
        object_type: null,
        onSuccessUploadNewFiles: () => {},
    }

    constructor(props) {
        super(props)

        this.state = {
            isSubmitting: false,
            isOpenUploadModal: false,
            existingAttachments: [],
            files: []
        }

        this.formRef = React.createRef()
        this.inputFile = React.createRef()

        // check the server side for supported exts
        this.allowedExtensions = [
            'jpg',
            'jpeg',
            'png',
            //'xlx',
            //'xlsx',
            //'xls',
            'doc',
            'docx',
            'pdf',
            //'csv',
            //'odt',
            //'rtf',
        ];

        // will be used in html accept attribute
        this.allowedFileTypes = [ 
            '.doc',  
            '.docx',  
            '.pdf', 
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'application/pdf',  
            'image/jpg', 
            'image/jpeg', 
            'image/png'
        ]
    }

    componentDidMount() {
        this.refreshAttachments()
    }

    /**
     * Fetch attachments
     */
    refreshAttachments() {
        this.props.get_sales_attachment_data({ object_id: this.props.object_id, object_type: this.props.object_type});
    }

    /**
     * Determine link for attachment.
     * 
     * @param {any} attachment 
     */
    determineAttachmentLink(attachment) {
        const { id } = attachment || {}

        if (!id) {
            return '#'
        }

        return `${BASE_URL}sales/Attachment/preview_attachment?attachment_id=${id}`
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
            uploaded = uploadedMoment.format('DD/MM/YYYY')
        }

        return [
            { 
                label: 'Size', 
                value: `${attachment.file_size} KB`
            },
            {
                label: 'Uploaded',
                value: uploaded,
            }
        ]
    }

    /**
     * Fired when new files were successfully uploaded
     */
    handleSuccess = () => {
        this.refreshAttachments()
        if (this.props.onSuccessUploadNewFiles) {
            this.props.onSuccessUploadNewFiles()
        }
    }

    get_uploaded_file_name = (attachment) => {
            let name = attachment.orig_name+'_'+attachment.object_name+''+attachment.file_ext;
            if(attachment.object_name.includes('ns_') && this.props.object_type==5){
                name = attachment.orig_name+'_NutritioalSupport'+attachment.file_ext;
            }
            return name;
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
            form: {
                display: 'block'
            }
        })

        const existingAttachments = this.props.existingAttachments
        const { object_id, object_type } = this.props

        return (
            <React.Fragment>
                <form onSubmit={this.handleSubmit} encType="multipart/form-data" style={styles.form} ref={this.formRef} noValidate>
                    <input type="hidden" name="object_type" value={this.props.object_type}/>
                    <input type="hidden" name="object_id" value={this.props.object_id}/>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <Card
                        headerActions={
                            <React.Fragment>
                                <UploadAttachmentButton object_type={object_type} object_id={object_id} onSuccess={this.handleSuccess}/>
                            </React.Fragment>
                        }
                        heading={ this.props.title ? (this.props.title + ' (' + existingAttachments.length+ ')')  : `Attachments (${existingAttachments.length})`}
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
                                                <div key={i} className="col col-sm-4" style={{ marginBottom: 15 }}>
                                                    <Tile 
                                                        client_name={attachment.object_name ? this.get_uploaded_file_name(attachment) : attachment.client_name}
                                                        file_size={0}
                                                        is_image={[1, '1'].indexOf(attachment.is_image) >= 0}
                                                        url={this.determineAttachmentLink(attachment)}
                                                        details={this.determineDetailsForAttachment(attachment)}
                                                    />
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
                </form>
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => ({
    existingAttachments: state.SalesAttachmentReducer.attachment_list,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_sales_attachment_data: (request) => dispatch(get_sales_attachment_data(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(AttachmentCard);
