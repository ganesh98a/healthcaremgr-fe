import React from 'react'
import _ from 'lodash'
import { Card, Button, Icon, MediaObject, Modal } from '@salesforce/design-system-react'
import { css, postImageData, toastMessageShow, postData } from '../../../../service/common'
import { BASE_URL } from '../../../../config'


/**
 * @typedef {typeof UploadAttachmentButton.defaultProps} Props
 *
 * Upload manager using a single button. This component can be reused elsewhere
 * 
 * Displays a single button by default. 
 * Clicking the button will trigger a file selector.
 * 
 * By default any files that you selected will be uploaded immediately. 
 * 
 * @extends {React.Component<Props>}
 */
class UploadAttachmentButton extends React.Component {
    static defaultProps = {
        /** @type {number} */
        object_type: null,
        /** @type {number} */
        object_id: null,
        onClose: () => {},
        onSuccess: () => {},
        uploadImmediately: true,
    }

    constructor(props) {
        super(props)

        this.state = {
            isUploading: false,
            isSuccess: false,
            isOpenUploadModal: false,

            /**
             * @type {File[]}
             */
            files: [],
            uploadedFiles: [],
        }

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

        this.formRef = React.createRef()
        this.inputFile = React.createRef()
    }


    /**
     * @param {any} e 
     */
    handleUpload = e => {
        if (e) {
            e.preventDefault()
        }

        let formData = new FormData()
        this.state.files.forEach(file => formData.append('attachments[]', file))

        let exceededFileSizeLimit = false;
        let cumulativeFileSize = 0
        this.state.files.forEach(file => {
            cumulativeFileSize += file.size
            if (cumulativeFileSize > (10 * 1048576)) {
                if (!exceededFileSizeLimit) { // show only once
                    toastMessageShow("The File Size Exceeds 10MB", 'e')
                    exceededFileSizeLimit = true
                    this.state.files = []
                }
            }
        })
        
        formData.append('object_type', this.props.object_type)
        formData.append('object_id', this.props.object_id)

    	if (!exceededFileSizeLimit) {
	        this.setState({ isUploading: true })
	        postImageData('sales/Attachment/save_multiple_attachments', formData).then(response => {
	            const { status, msg, error } = response
	            if (status) {
	                toastMessageShow(msg, 's')

	                const uploadedFiles = response.uploadedFiles || []

	                if (this.props.uploadImmediately) {
	                    this.setState({ isSuccess: true, isOpenUploadModal: true, uploadedFiles }, this.props.onSuccess)
	                } else {
	                    this.setState({ files: [], isOpenUploadModal: false, isSuccess: true, uploadedFiles  }, this.props.onSuccess)
	                }
	            } else {
	                let errorMsg = typeof error === "string" ? error : "The File Size Exceeds 10MB"
	                if (typeof error === "object" && error.file_error) {
	                    errorMsg = error.file_error
	                }

	                toastMessageShow(errorMsg, 'e')
	            }
	        }).finally(() => this.setState({ isUploading: false, files: [] }))
	    }
    }

    /**
     * @param {boolean} removeAllSelected 
     */
    handleClose = (removeAllSelected) => e => {
        if (e) {
            e.preventDefault()
        }

        // do not close while uploading
        if (this.state.isUploading) {
            return
        }

        if (removeAllSelected) {
            this.setState({ files: [], isOpenUploadModal: false })
        } else {
            this.setState({ isOpenUploadModal: false })
        }
    }

    /**
     * Fires when 'Upload files' button is clicked
     */
    handleClickAddMoreFiles = () => {
        const { current } = this.inputFile
        current.click()
    }

    /**
     * Fires after OS file manager was closed
     */
    handleChange = e => {
        if (e) {
            e.preventDefault()
        }

        let attachments = [...this.state.files]
        let error = false;
        let files = e.target.files

        let invalidFileNames = []

        Object.keys(files).map((key, i) => {
            let filename = files[key].name
            let ext = files[key].name.replace(/^.*\./, '');
            ext = ext.toLowerCase();

            if (this.allowedExtensions.includes(ext)) {
                attachments[(attachments.length + 1)] = files[key];
            } else {
                invalidFileNames.push(filename)
                error = true
            }
        });

        if (error) {
            const firstInvalidFileName = invalidFileNames.find(Boolean)
            const reason = <>Cannot upload this file <i style={{ fontSize: 'inherit'}}>{firstInvalidFileName}</i></>
            const msg = `File types supported are ${this.allowedExtensions.join(`, `)}`

            const msgComponent = <span style={{ textAlign: 'left' }}>
                {firstInvalidFileName && reason}
                <br/>
                {msg}
            </span>

            toastMessageShow(msgComponent, 'e')
        } else {
            const newFiles = attachments.filter(Boolean)
            this.setState({ files: newFiles }, this.handleAfterStateChanged);
        }

    }

    /**
     * Fires after files in `this.state` was updated. 
     */
    handleAfterStateChanged() {
        if (this.props.uploadImmediately) {
            this.handleUpload()
        }
    }


    /**
     * Determine attachment link
     * 
     * @param {any} attachment 
     */
    determineAttachmentLink(attachment) {
        const { id } = attachment || {}

        if (!id) {
            return '#'
        }

        return `${BASE_URL}sales/Attachment/preview_attachment?&attachment_id=${id}`
    }


    /**
     * Determine allowed file types
     */
    determineAcceptableFileTypes() {
        return this.allowedFileTypes.join(', ')
    }

    /**
     * Format number based on given number of decimal places
     * @param {number} number 
     * @param {number} decimalPlaces 
     */
    formatNum(number, decimalPlaces) {
        return (Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces))
    }

    /**
     * Convert bytes to kilobytes
     * 
     * DANGER: Don't use this if the given param was provided by the server (ie. `file_size`). 
     * The file size provided by server is already in kilobytes
     * 
     * @param {number} bytes 
     */
    bytesToKilobytes(bytes = 0) {
        return bytes / 1024
    }


    renderModal() {
        const styles = css({
            form: {
                display: 'block',
                minHeight: 480,
                fontSize: 13,
                fontFamily: 'Salesforce Sans, Arial, Helventica, sans-serif'
            },
            modal: {
                fontSize: 13,
                fontFamily: 'Salesforce Sans, Arial, Helventica, sans-serif'
            },
            file: {
                marginTop: -1
            },
            mediaBody: {
                display: 'flex',
                justifyContent: 'space-between',
            },
            successIcon: {
                display: 'flex',
                alignItems: 'center',
            },
            fileIcon: {
                backgroundColor: '#baac93', // brown
            }
        })

        const files = this.state.files || []
        const uploadedFiles = this.state.uploadedFiles || []

        return (
            <Modal
                isOpen={this.state.isOpenUploadModal}
                footer={[
                    // <Button label="Add more files" title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`} onClick={this.handleClickAddMoreFiles} />,
                    this.props.uploadImmediately && <Button label="Done" disabled={this.state.isUploading} onClick={this.handleClose(true)} />,
                    !this.props.uploadImmediately && <Button label="Cancel" disabled={this.state.isUploading} onClick={this.handleClose(true)} />,
                    !this.props.uploadImmediately && <Button disabled={this.state.isUploading} label="Upload" variant="brand" type="button" onClick={this.handleUpload} />,
                ].filter(Boolean)}
                onRequestClose={this.handleClose(true)}
                heading={'Uploaded files'}
                size="small"
                style={styles.modal}
                dismissOnClickOutside={false}
            >
                <form onSubmit={this.handleUpload} encType="multipart/form-data" className="row" style={styles.form}>
                    {
                        uploadedFiles.map((uploadedFile, i) => {
                            const url = this.determineAttachmentLink(uploadedFile)
                            const is_image = ['1', 1].indexOf(uploadedFile.is_image) >= 0

                            return (
                                <div key={i} className="col col-sm-12" style={styles.file}>
                                    <MediaObject 
                                        body={(
                                            <div style={styles.mediaBody}>
                                                <span>
                                                    <a href={url} className="reset" style={{ color: '#0070d2' }} target="_blank">
                                                        {uploadedFile.client_name}
                                                    </a>
                                                    <br/>
                                                    <span>{uploadedFile.file_size} KB</span>
                                                </span>
                                                {
                                                    (this.state.isSuccess) ?
                                                    ( <Icon category="utility" name="check" size="small" containerStyle={styles.successIcon}/> ) :
                                                    ( <span /> )
                                                }
                                            </div>
                                        )}
                                        className="slds-box"
                                        figure={<Icon category="standard" name={is_image ? "photo" : "file"} size="medium" style={styles.fileIcon}/>}
                                        verticalCenter
                                    />
                                </div>
                            )
                        })
                    }
                </form>
            </Modal>
        )
    }



    render() {
        const styles = css({
            card: {
                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            },
            form: {

            },
            inputFile: {
                display: 'inline-block',
                border: 'unset',
                lineHeight: 'initial',
                height: 'initial',
                visibility: 'hidden',
                width: 1,
                paddin: 0,
                marginTop: 0,
            },
            uploadingCursor: {
                cursor: 'auto',
            }
        })

        return (
            <React.Fragment>
                <input 
                    type="file" 
                    multiple 
                    name="file-uploader" 
                    accept={this.determineAcceptableFileTypes()} 
                    ref={this.inputFile} 
                    onChange={this.handleChange} 
                    value="" 
                    style={styles.inputFile}
                />
                {
                    this.state.isUploading ? 
                    (
                        <Button 
                            label={'Uploading...'}
                            style={styles.uploadingCursor}
                            title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                        />
                    )
                    :
                    (
                        <Button 
                            disabled={this.state.isUploading}
                            label={`Upload files`}
                            title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                            onClick={this.handleClickAddMoreFiles}
                        />
                    )
                }
                { this.renderModal() }
            </React.Fragment>
        )
    }

}

export default UploadAttachmentButton