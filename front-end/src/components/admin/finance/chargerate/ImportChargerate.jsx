import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, css, postImageData } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import {
    Modal,
    Button,
    Input,
    IconSettings,
} from '@salesforce/design-system-react';
import '../../scss/components/admin/member/member.scss';
import { getUploadFileLimit } from '../../oncallui-react-framework/services/ARF.js'; 


/**
 * Class: ImportChargeRateModel
 */
class ImportChargeRateModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            reference_number_mandatory: false,
            isUploading: false,
            files: [],
            max_post: 0,
            max_upload: 0,
            memory_limit: 0,
            upload_mb: 0,
            byte: 1048576, // 1 MB in bytes
            uploaded_total_bytes: 0,
            max_total_bytes: 0,
            uploaded_file_count: 0,
            attachments: [],
        }

        // check the server side for supported exts
        this.allowedExtensions = [
            'csv',
        ];

        this.inputFile = React.createRef();
    }

    componentDidMount() {
        this.callUploadFileLimit();
    }
    
    /**
     * Call callUploadFileLimit api 
     */
    callUploadFileLimit = () => {
        getUploadFileLimit().then(res => {
            var ra_data = res.data;
            if(ra_data && ra_data.upload_mb) {
                let max_upload = ra_data.max_upload;
                /**
                 * calculate the total allowed file size
                 * ex 
                 * this.state.byte = 1048576
                 * max_upload = 10
                 * max_total_bytes = 10 * 1048576 = 10485760
                 *  
                */
                let max_total_bytes = max_upload * this.state.byte;
                this.setState({
                    upload_mb: ra_data.upload_mb,
                    max_post: ra_data.max_post,
                    max_upload: ra_data.max_upload,
                    memory_limit: ra_data.memory_limit,
                    max_total_bytes: max_total_bytes,
                });
            }
        });
    }

    /**
     * Determine allowed file types
     */
    determineAcceptableFileTypes() {
        return this.allowedExtensions.join(', ')
    }

    /**
     * Fires after OS file manager was closed
     */
    handleChangeUpload = e => {
        if (e) {
            e.preventDefault()
        }

        let attachments = [...this.state.files]
        let error = false;
        let files = e.target.files;

        let invalidFileNames = []
        var error_type = 1;
        Object.keys(files).map((key, i) => {
            let filename = files[key].name
            let ext = files[key].name.replace(/^.*\./, '');
            ext = ext.toLowerCase();
            let file_size_bytes = files[key].size;
            let file_size_mb = this.bytesToSize(file_size_bytes);
            let uploaded_total_bytes = this.state.uploaded_total_bytes;
            uploaded_total_bytes = uploaded_total_bytes + file_size_bytes;
            if (this.allowedExtensions.includes(ext)) {
                // check the upload file size is exceed or not
                if (file_size_bytes > this.state.max_total_bytes) {
                    error = true;
                    error_type = 2;
                } else {
                    attachments[0] = files[key];
                    attachments[0]['ext'] = ext;
                    this.setState({ uploaded_total_bytes });
                }
            } else {
                invalidFileNames.push(filename);
                error_type = 1;
                error = true;
            }
            return;
        });

        if (error) {          
            this.extensionError(error_type, invalidFileNames);
        } else {
            const newFiles = attachments.filter(Boolean)
            this.setState({ files: newFiles }, this.handleAfterStateChanged);
        }

    }

    /**
     * Covert bytes to MB
     * @param {int} bytes 
     */
    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
    
    /**
     * Validate the uploaded file extension & file size
     */
    extensionError = (error_type, invalidFileNames) => {
        var error = '';
        switch(error_type) {
            case 1:
                const firstInvalidFileName = invalidFileNames.find(Boolean)
                const reason = <>Cannot upload this file <i style={{ fontSize: 'inherit'}}>{firstInvalidFileName}</i></>
                const msg = `File types supported is ${this.allowedExtensions.join(`, `)}`

                const msgComponent = <span style={{ textAlign: 'left' }}>
                    {firstInvalidFileName && reason}
                    <br/>
                    {msg}
                </span>
                error = msgComponent;
                break;
            case 2:
                error = <p>Maximum file upload size exceed.. <br/> Allowed size limit is - {this.state.max_upload} MB only</p>;
                break;
            case 3:
                error = <p>Maximum file upload size exceed.. <br/> Total allowed size limit is - {this.state.upload_mb} MB only</p>;
                break;
            case 4:
                error = <p>Post Content limit exceed.. <br/> Allowed size limit is - {this.state.max_post} MB only</p>;
            default:
                break;
        }
        toast.error(<ToastUndo message={error} showType={'e'} />, {
            position: toast.POSITION.TOP_CENTER,
            hideProgressBar: true
        });
    }

    /**
     * Fires when 'Upload files' button is clicked
     */
    handleClickAddMoreFiles = () => {
        const { current } = this.inputFile
        current.click()
    }
    
    /**
     * Call the create api when user save document type
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#import_chargerate").validate({ /* */ });
        var url = 'finance/FinanceDashboard/import_chargerates';
        var validator = jQuery("#import_chargerate").validate({ ignore: [] });

        const formData = new FormData()
        this.state.files.map((val, index) => {
            formData.append('attachments[]', val);
        })
        var formdata_size = 0;
        var res = Array.from(formData.entries(), ([key, prop]) => (
            {
                "ContentLength": 
                typeof prop === "string" 
                ? formdata_size = formdata_size + prop.length 
                : formdata_size = formdata_size + prop.size
            }));

        /**
            * calcutlate the post content limit
            * ex 
            * this.state.byte = 1048576
            * this.state.max_post = 10
            * max_post = 10 * 1048576 = 10485760
            *  
        */
        var post_limit = this.state.byte * this.state.max_post;
        if (formdata_size > post_limit) {
            var error_type = 4;
            this.extensionError(error_type);
            return false;
        }
        this.setState({ loading:true });
        // Call Api
        postImageData(url, formData).then((result) => {
            if (result.status == true) {
                this.props.closeModal(true, result.import_id, result.data_msg, result.error_msg);
            } else {
                // Trigger error pop 
                toastMessageShow(result.error, "e");
            }
            this.setState({ loading: false });
        });
    }
    
    /**
     * Render the display content
     */
    render() {
        const styles = css({
            inputFile: {
                display: 'inline-block',
                border: 'unset',
                lineHeight: 'initial',
                height: 'initial',
                visibility: 'hidden',
                width: '0px',
                padding: '0px',
                marginTop: '0px',
            },
            toastdiv: {
                'font-size': 12,
            },
            uploadingCursor: {
                cursor: 'auto',
            },
            btnPadTop: {
                paddingTop: '1.25rem'
            }
        })
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                        <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                    ]}
                    heading={"Import Charge Rates"}
                    size="small"
                    className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                    onRequestClose={() => this.props.closeModal(false)}
                    ariaHideApp={false}
                    dismissOnClickOutside={false}
                >
                    <section className="manage_top" >
                        <div className="container-fluid">
                            <form id="import_chargerate" autoComplete="off" className="slds_form">
                                <div className="row pt-5">
                                    <div className="col-sm-12 text-center">
                                        <div className="slds-form-element" >
                                            <input 
                                                type="file" 
                                                multiple 
                                                name="file-uploader" 
                                                accept={this.determineAcceptableFileTypes()} 
                                                ref={this.inputFile} 
                                                onChange={this.handleChangeUpload} 
                                                value="" 
                                                required={true}
                                                style={styles.inputFile}
                                            />
                                            {
                                                this.state.isUploading ? 
                                                (
                                                    <Button 
                                                        label={'Uploading...'}
                                                        style={[ styles.uploadingCursor ]}
                                                        title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                                    />
                                                )
                                                :
                                                (
                                                    <Button 
                                                        disabled={this.state.isUploading}
                                                        label={`Upload File`}
                                                        title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                                        onClick={this.handleClickAddMoreFiles}
                                                    />
                                                )
                                            }
                                            <div className="text-center">{
                                            this.state.files.map((val, index) => (
                                                <div key={index + 1} className="text-center pt-1">{ ((val.name).length > 30) ? (((val.name).substring(0,30-3)) + '...' + '  (.'+ val.ext +')') : (val.name) }</div>
                                            ))}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row pt-2 pb-5">
                                    <div className="col-sm-12 text-center">
                                        <div className="slds-form-element" >
                                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                            Allowed file types: {this.determineAcceptableFileTypes()}</label>
                                        </div>
                                    </div>
                                    <div className="col-sm-12 text-center">
                                        <div className="slds-form-element" >
                                            <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                            CSV columns allowed: <abbr className="slds-required" title="required">* </abbr>category, <abbr className="slds-required" title="required">* </abbr>role, <abbr className="slds-required" title="required">* </abbr>pay_level, <abbr className="slds-required" title="required">* </abbr>skill, <abbr className="slds-required" title="required">* </abbr>cost_book, <abbr className="slds-required" title="required">* </abbr>start_date, <abbr className="slds-required" title="required">* </abbr>end_date, <abbr className="slds-required" title="required">* </abbr>amount, external_reference</label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>
                </Modal>
            </IconSettings>
        );
    }
}

export default (ImportChargeRateModel)  