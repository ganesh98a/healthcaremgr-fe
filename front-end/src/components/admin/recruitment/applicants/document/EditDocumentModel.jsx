import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import moment from "moment";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, css, postImageData } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import { SLDSISODatePicker } from 'components/admin/salesforce/lightning/SLDSISODatePicker';
import {
    Modal,
    Button,
    Input,
    IconSettings,
    Checkbox
} from '@salesforce/design-system-react';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import '../../../scss/components/admin/member/member.scss';
import { Col50, Row, SelectList } from '../../../oncallui-react-framework';
import Calendar from '../../../oncallui-react-framework/input/Calendar';
import { getStateList } from '../../../../../service/common';
import { getVisaCategory, getVisaTypeByCategory } from '../../../oncallui-react-framework/services/common';
import { VISA_DETAILS } from '../../../oncallui-react-framework/constants';
import { COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from 'config.js';

/**
 * Get document type
 * @param {obj} e 
 * @param {array} data 
 */
const getDocumentName = (e, data) => {
    return queryOptionData(e, "member/MemberDocument/get_document_name_search", { query: e }, 2, 1);
}

/**
 * get upload file limit
 */
const getUploadFileLimit = () => {
    return new Promise((resolve, reject) => {
        postData("common/Common/max_upload_file_limit").then(result => {
            if (result.status) {
                let raData = result.data;
                const res = {
                    data: raData,
                };
                resolve(res);
            } else {
                const res = {
                    data: [],
                };
                resolve(res);
            }
        });
    });
}

/**
 * RequestData get the data of member document
 * @param {int} documentId
 */
const requestMemberDocumentData = (documentId) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { document_id: documentId };
        postData('member/MemberDocument/get_member_doucment_data_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }           
        });
    });
};

/**
 * Class: EditDocumentModel
 */
class EditDocumentModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            document_type: '',
            status_options: [
                { id: 1, label: 'Submitted', value: 0 },
                { id: 2, label: 'Valid', value: 1 },
                { id: 3, label: 'InValid', value: 2 },
                { id: 4, label: 'Expired', value: 3 },
            ],
            status: '',
            issue_date: '',
            expiry_date: '',
            issue_date_input: '',
            expiry_date_input: '',
            reference_number: '',
            issue_date_mandatory: false,
            expiry_date_mandatory: false,
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
            member_id: this.props.member_id,
            document_id: this.props.document_id,
            isUploadingDisable: false,
            validStatus: 1,
            statusUpdated: false,
            license_type: "",
            stateList: [],
            applicant_id: this.props.applicant_id,
            application_id: this.props.application_id,
            show_visa_field: false
        }
        
        // check the server side for supported exts
        this.allowedExtensions = [
            'jpg',
            'jpeg',
            'png',
            'doc',
            'docx',
            'pdf',
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

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            issue_date: React.createRef(),
            expiry_date: React.createRef()
        };
        this.inputFile = React.createRef();
    }

    componentDidMount() {
        this.callUploadFileLimit();
        getStateList().then(data => {
            this.setState({ stateList: data });
        })
        getVisaCategory().then((result) => {
            this.setState({ visa_category_option: result }, () => { });
        });
    }

    componentWillMount() {
        this.getMemberDocumentDetails();
    }

    // fetch visa type list by visa category id
    callVisaTypeByCategory = (visa_category) => {
        getVisaTypeByCategory(visa_category).then((result) => {
            this.setState({ visa_type_category_option: result }, () => { });
        });
    }
    
    /**
     * Get member document details by document id
     */
    getMemberDocumentDetails = () => {
        this.setState({loading: true});
        requestMemberDocumentData(
            this.state.document_id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                var issue_date = '';
                if (raData.issue_date != 'NULL' && raData.issue_date != '' && raData.issue_date != '0000-00-00') {
                    issue_date = moment(raData.issue_date);
                    issue_date = issue_date.format('YYYY-MM-DD');
                }
                
                var expiry_date = '';
                if (raData.expiry_date != 'NULL' && raData.expiry_date != '' && raData.expiry_date != '0000-00-00') {
                    expiry_date = moment(raData.expiry_date);
                    expiry_date = expiry_date.format('YYYY-MM-DD');
                }

                var attachments = [];
                attachments = [
                    {
                        name: raData.file_name,
                        size: raData.file_size,
                        file_path: raData.file_path,
                        ext: raData.file_ext,
                    }
                ];

                var document_type =
                    {
                        id: raData.doc_type_id,
                        label: raData.document,
                        value: raData.doc_type_id,
                        issue_date_mandatory: Number(raData.issue_date_mandatory) === 0 ? false : true,
                        expire_date_mandatory: Number(raData.expire_date_mandatory) === 0 ? false : true,
                        reference_number_mandatory: Number(raData.reference_number_mandatory) === 0 ? false : true,
                    };

                var issue_date_input = '';
                var expiry_date_input = '';
                if (moment(raData.issue_date).isValid()) {
                    issue_date_input = moment(raData.issue_date).format('DD/MM/YYYY');
                }

                if (moment(raData.expiry_date).isValid()) {
                    expiry_date_input = moment(raData.expiry_date).format('DD/MM/YYYY');
                }

                this.setState({
                    isUploadingDisable: true,
                    document_type : document_type,
                    document_id: raData.document_id,
                    status: raData.document_status,
                    issue_date: issue_date ? issue_date : '',
                    expiry_date: expiry_date ? expiry_date : '',
                    issue_date_input: issue_date_input,
                    expiry_date_input: expiry_date_input,
                    reference_number: raData.reference_number,
                    files: attachments,
                    issue_date_mandatory: Number(raData.issue_date_mandatory) === 0 ? false : true,
                    expire_date_mandatory: Number(raData.expire_date_mandatory) === 0 ? false : true,
                    reference_number_mandatory: Number(raData.reference_number_mandatory) === 0 ? false : true,
                    license_type: raData.license_type,
                    issuing_state: raData.issuing_state,
                    vic_conversion_date: raData.vic_conversion_date,
                    applicant_specific: raData.applicant_specific,
                    visa_category: raData.visa_category,
                    visa_category_type: raData.visa_category_type
                },()=>{
                    if(raData.visa_category){
                        this.callVisaTypeByCategory(raData.visa_category);
                    }
                    if(raData.document == VISA_DETAILS){
                        this.setState({show_visa_field: true})
                    }
                });    
            }
            this.setState({loading: false});
        });
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
        return this.allowedFileTypes.join(', ')
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
        let files = e.target.files

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
        this.setState({ statusUpdated: true });
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
        var error = <p>Sorry we are only supported <br/> jpg, jpeg, png, xlx, xls, doc, docx, pdf, odt, rtf</p>
        switch(error_type) {
            case 1:
                const firstInvalidFileName = invalidFileNames.find(Boolean)
                const reason = <>Cannot upload this file <i style={{ fontSize: 'inherit'}}>{firstInvalidFileName}</i></>
                const msg = `File types supported are ${this.allowedExtensions.join(`, `)}`

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
     * Update the state value of input 
     * @param {Obj} e
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value, statusUpdated: true });
    }

    /**
     * Update the state value of Select option
     * @param {Obj} selectedOption
     * @param {str} fieldname
     */
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;

        this.setState(state);
    }

    /**
     * Update the document type
     * And set mandatory field associated with selected document type 
     * param {object} item
     */
    updateDocumentName = (item) => {
        var state = {};
        state['document_type'] = item;
        state['issue_date_mandatory'] = false;
        state['expiry_date_mandatory'] = false;
        state['reference_number_mandatory'] = false;
        if (item && item.issue_date_mandatory) {
            state['issue_date_mandatory'] = Number(item.issue_date_mandatory) === 0 ? false : true;
        }
        if (item && item.expire_date_mandatory) {
            state['expiry_date_mandatory'] = Number(item.expire_date_mandatory) === 0 ? false : true;
        }
        if (item && item.reference_number_mandatory) {
            state['reference_number_mandatory'] = Number(item.reference_number_mandatory) === 0 ? false : true;
        }
        this.setState(state);
    }

    /**
     * Format the input of date when use type manually
     * @param {date|str} value 
     */
    onChangeInputDatePicker = (value, dateYmdHis) => {
        var date_format;
        if (!value) {
            date_format = moment(dateYmdHis);
            if (!date_format.isValid()) {
                date_format = '';
            } else {
                date_format = date_format.format('DD/MM/YYYY');
            }
        } else {
            // Add slash after character length 2 and 4 using reg exp
            date_format = value.replace(/^(\d\d)(\d)$/g,'$1/$2').replace(/^(\d\d\/\d\d)(\d+)$/g,'$1/$2').replace(/[^\d\/]/g,'');
        }

        return date_format;
    }

    /**
     * Handle onchange of datepicker
     * - Issue Date
     * - Expiry Date
     * @param {date} dateYmdHis 
     * @param {obj} e 
     * @param {any} data
     */
    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        if(e && e.target){
            var value = e.target.value;
        // format date
        let formatted_date = this.onChangeInputDatePicker(value, dateYmdHis);

        let newState = {}
        if (dateYmdHis) {
            newState[key] = dateYmdHis;
            newState[key+'_input'] = formatted_date;
        } else {
            newState[key] = '';
            newState[key+'_input'] = formatted_date;
        }
        this.setState(newState)
        }        
    }

    // tinker with internal Datepicker state to
    // fix calendar toggling issue with multiple datepickers
    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
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
        jQuery("#edit_applicant_document").validate({ /* */ });
        var url = 'recruitment/RecruitmentApplicant/save_applicant_document';
        var validator = jQuery("#edit_applicant_document").validate({ ignore: [] });
        var validCheck = this.validCheck();
        // Allow only validation is passed
        if (validCheck && !this.state.loading && jQuery("#edit_applicant_document").valid()) {

            const formData = new FormData()
            this.state.files.map((val, index) => {
                formData.append('attachments[]', val);
            })
            var doc_type = this.state.document_type;
            var doc_type_id = doc_type.value ? doc_type.value : '';
            var doc_name = doc_type.label ? doc_type.label : '';
            var issue_date = moment(this.state.issue_date).isValid() ? this.state.issue_date : '';
            var expiry_date = moment(this.state.expiry_date).isValid() ? this.state.expiry_date : '';

            formData.append('is_member', false);
            formData.append('action', 'update');
            formData.append('member_id', 0);
            formData.append('document_id', this.state.document_id);
            formData.append('application_id', this.state.application_id);
            formData.append('applicant_id', this.state.applicant_id);
            formData.append('doc_type_id', doc_type_id);
            formData.append('doc_name', doc_name);
            formData.append('status', this.state.status);
            formData.append('issue_date', issue_date);
            formData.append('expiry_date', expiry_date);
            formData.append('reference_number', this.state.reference_number);
            formData.append('issue_date_mandatory', this.state.issue_date_mandatory);
            formData.append('expiry_date_mandatory', this.state.expiry_date_mandatory);
            formData.append('reference_number_mandatory', this.state.reference_number_mandatory);
            formData.append('license_type', this.state.license_type);
            formData.append('issuing_state', this.state.issuing_state);
            formData.append('vic_conversion_date', this.state.vic_conversion_date);
            formData.append('applicant_specific', this.state.applicant_specific);
            formData.append('visa_category', this.state.visa_category);
            formData.append('visa_category_type', this.state.visa_category_type);
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
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let document_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        document_id = resultData.document_id || '';
                    }
                    // Trigger success pop 
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                    
                } else {
                    // Trigger error pop 
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });           
        } else {
            // Validation is failed
            validator.focusInvalid();
        }
    }

    /**
     * Valid form fields 
     */
    validCheck = () => {
        var doc_type_id = this.state.document_type;
        var issue_date = this.state.issue_date;
        var expiry_date = this.state.expiry_date;
        var reference_number = this.state.reference_number;
        var issue_date_mandatory = this.state.issue_date_mandatory;
        var expiry_date_mandatory = this.state.expiry_date_mandatory;
        var reference_number_mandatory = this.state.reference_number_mandatory;
        var attachments = this.state.files;

        if (doc_type_id == "") {
            toastMessageShow('Select Documenet Type is Mandatory', 'e');
            return false;
        }

        if (issue_date == "" && issue_date_mandatory === true) {
            toastMessageShow('Select Issue Date', 'e');
            return false;
        }

        var issue_date_moment = moment(this.state.issue_date_input);
        if (issue_date == "" && this.state.issue_date_input != "" && issue_date_moment.isValid() === false) {
            toastMessageShow('Provide Valid Issue Date. format must be DD/MM/YYYY', 'e');
            return false;
        }

        let newDate = new Date();
        if (issue_date !== "" && (moment(issue_date) >= moment(newDate))) {
            toastMessageShow('Issue date should be less than today', 'e');
            return false;
        }

        if (expiry_date == "" && expiry_date_mandatory === true) {
            toastMessageShow('Select Expiry Date', 'e');
            return false;
        }

        var expire_date_moment = moment(this.state.expiry_date_input);
        if (expiry_date == "" && this.state.expiry_date_input != '' && expire_date_moment.isValid() === false) {
            toastMessageShow('Provide Valid Expiry Date. format must be DD/MM/YYYY', 'e');
            return false;
        }

        if (expiry_date !== "" && issue_date !== "" && (moment(expiry_date).isValid()) && moment(issue_date).isValid()) {
            if ((moment(issue_date).format('YYYY-MM-DD') >= moment(expiry_date).format('YYYY-MM-DD'))) {
                toastMessageShow('Expiry date should be greater than Issue date', 'e');
                return false;
            }
        }

        if (reference_number == "" && reference_number_mandatory === true) {
            toastMessageShow('Reference Number is Mandatory', 'e');
            return false;
        }

        if (attachments.length < 1) {
            toastMessageShow('Document is Mandatory', 'e');
            return false;
        }

        return true;
    }
    
    /**
     * Render Uploaded document
     */
    renderUploadedDoc = () => {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
       return this.state.files.map((val, index) => 
        {
            if (val.file_path) {
                return (
                    <div key={index + 1} className="attach_txt pt-1">
                        <span>
                            <a style={styles.hyperlink} className="reset" title="View/download" target="_blank" href={COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod9 + '/?url=mediaShow/m/' + val.file_path}>{ ((val.name).length > 30) ? (((val.name).substring(0,30-3)) + '...' + '  ('+ val.ext +')') : (val.name) }</a>
                        </span>
                    </div> 
                );
            } else {
                return (
                    <div key={index + 1} className="attach_txt pt-1">
                        <span>{ ((val.name).length > 30) ? (((val.name).substring(0,30-3)) + '...' + '  ('+ val.ext +')') : (val.name) }
                        </span>
                    </div> 
                );
            }
        })
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
            uploadingCursor: {
                cursor: 'auto',
            },
            btnPadTop: {
                paddingTop: '1.25rem'
            }
        })
        let license = this.state.document_type && this.state.document_type.label === "Drivers’ Licence";
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"Update Document"}
                        size="medium"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="edit_applicant_document" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Document Type</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name='document_type'
                                                        loadOptions={(e) => getDocumentName(e, [])}
                                                        clearable={true}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.document_type}
                                                        onChange={(e) => {
                                                            this.updateDocumentName(e);
                                                            if(e){
                                                                if (e.label == VISA_DETAILS) {
                                                                    this.setState({ doc_name: e.label, show_visa_field: true })
                                                                } else {
                                                                    this.setState({ doc_name: e.label, show_visa_field: false, visa_category: '', visa_category_type:'' })
                                                                }
                                                            }
                                                            
                                                        } }
                                                        inputRenderer={(props) => <input  {...props} name={"document_type"} />}
                                                        disabled={this.state.validStatus === Number(this.state.status) && this.state.statusUpdated === false ? true : false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                                    <abbr className="slds-required" title="required"></abbr>Status</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        required={false}
                                                        simpleValue={true}
                                                        name="status"
                                                        className="SLDS_custom_Select default_validation"
                                                        simpleValue={true}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        options={this.state.status_options}
                                                        onChange={(value) => this.handleChange(value, 'status')}
                                                        value={this.state.status}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {(this.props.user_page =='application_details' && this.state.show_visa_field) && <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Visa Category</label>
                                                <div className="slds-form-element__control">                                                    
                                                    <SLDSReactSelect
                                                        required={false}
                                                        simpleValue={true}
                                                        name="visa_category"
                                                        className="SLDS_custom_Select default_validation"
                                                        simpleValue={true}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        options={this.state.visa_category_option}
                                                        onChange={(value) => {
                                                            this.handleChange(value, 'visa_category');
                                                            if(value){
                                                                this.callVisaTypeByCategory(value)
                                                            }
                                                        }}
                                                        value={this.state.visa_category}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                                    <abbr className="slds-required" title="required">*</abbr>Visa Type</label>
                                                <div className="slds-form-element__control">
                                                <SLDSReactSelect
                                                        required={true}
                                                        simpleValue={true}
                                                        name="visa_category_type"
                                                        className="SLDS_custom_Select default_validation"
                                                        simpleValue={true}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        clearable={false}
                                                        options={this.state.visa_type_category_option}
                                                        onChange={(value) => this.handleChange(value, 'visa_category_type')}
                                                        value={this.state.visa_category_type}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    {
                                                        this.state.issue_date_mandatory && <abbr className="slds-required" title="required">* </abbr>
                                                    }
                                                    Issue Date</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSISODatePicker
                                                        relativeYearFrom={-110}
                                                        relativeYearTo={50}
                                                        type="date"
                                                        ref={this.datepickers.issue_date} // !important: this is needed by this custom SLDSISODatePicker
                                                        className="date_picker"
                                                        placeholder="DD/MM/YYYY"
                                                        onChange={this.handleChangeDatePicker('issue_date')}
                                                        onOpen={this.handleDatePickerOpened('issue_date')}
                                                        onClear={this.handleChangeDatePicker('issue_date')}
                                                        value={this.state.issue_date}
                                                        input={<Input name="issue_date" />}
                                                        inputProps={{
                                                            name: "issue_date",
                                                            value: this.state.issue_date_input,
                                                            maxLength: 10,
                                                            readOnly: this.state.validStatus === Number(this.state.status) && this.state.statusUpdated === false ? true : false
                                                        }}
                                                        disabled={this.state.validStatus === Number(this.state.status) && this.state.statusUpdated === false ? true : false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-4">
                                                    {
                                                        this.state.expiry_date_mandatory && <abbr className="slds-required" title="required">* </abbr>
                                                    }
                                                    Expiry Date</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSISODatePicker
                                                        relativeYearFrom={-110}
                                                        relativeYearTo={50}
                                                        type="date"
                                                        ref={this.datepickers.expiry_date} // !important: this is needed by this custom SLDSISODatePicker
                                                        className="expiry_date"
                                                        placeholder="DD/MM/YYYY"
                                                        onChange={this.handleChangeDatePicker('expiry_date')}
                                                        onOpen={this.handleDatePickerOpened('expiry_date')}
                                                        onClear={this.handleChangeDatePicker('expiry_date')}
                                                        value={this.state.expiry_date}
                                                        input={<Input name="expiry_date" />}
                                                        inputProps={{
                                                            name: "expiry_date",
                                                            value: this.state.expiry_date_input,
                                                            maxLength: 10,
                                                            readOnly: this.state.validStatus === Number(this.state.status) && this.state.statusUpdated === false ? true : false
                                                        }}
                                                        disabled={this.state.validStatus === Number(this.state.status) && this.state.statusUpdated === false ? true : false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-5">
                                                    {
                                                        this.state.reference_number_mandatory && <abbr className="slds-required" title="required">* </abbr>
                                                    }
                                                    Reference Number</label>
                                                <div className="slds-form-element__control">
                                                    <input type="text"
                                                        className="slds-input"
                                                        name="reference_number"
                                                        placeholder="Reference Number"
                                                        onChange={(e) => {
                                                            var reference_number = e.target.value;
                                                            var regex =  /[a-zA-Z0-9-_/]+$/;
                                                            if (!regex.test(reference_number) && reference_number!='') {
                                                                // return;
                                                            }
                                                            this.setState({ reference_number });
                                                        }}
                                                        value={this.state.reference_number || ''}
                                                        readOnly={this.state.validStatus === Number(this.state.status) && this.state.statusUpdated === false ? true : false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {license && <Col50>
                                                <SelectList
                                                    label="License Type"
                                                    id="license_type"
                                                    name="license_type"
                                                    options={[
                                                        { label: "International", value: "1" },
                                                        { label: "Probationary", value: "2" },
                                                        { label: "Unrestricted", value: "3" }
                                                    ]}
                                                    value={this.state.license_type}
                                                    onChange={value => {
                                                        let issuing_state = this.state.issuing_state;
                                                        if (value !== "3") {
                                                            issuing_state =null;
                                                        }
                                                        this.setState({ license_type: value, issuing_state })
                                                    }}
                                                    required={this.state.reference_number? true : false}
                                                    clearable
                                                />
                                            </Col50>}
                                        {license && <Row>
                                            <Col50>
                                                <SelectList
                                                    label="Issuing State"
                                                    id="issuing_state"
                                                    name="issuing_state"
                                                    options={this.state.stateList}
                                                    value={this.state.issuing_state}
                                                    onChange={value => {
                                                        this.setState({ issuing_state: value })
                                                    }}
                                                    required={this.state.license_type !== "1"}
                                                    clearable
                                                    disabled={this.state.license_type == "1"}
                                                />
                                            </Col50>
                                            {<Col50>
                                                <Calendar
                                                    name="vic_conversion_date"
                                                    label="Convert to Victorian license on/before"
                                                    onChange={dateYmdHis => {
                                                        this.setState({ vic_conversion_date: dateYmdHis })
                                                    }}
                                                    disabled={!this.state.issuing_state || this.state.issuing_state === "7" || this.state.license_type == "1"}
                                                    required={this.state.issuing_state && this.state.issuing_state !== "7"}
                                                    value={this.state.vic_conversion_date}
                                                />
                                            </Col50>}
                                        </Row>}
                                        <div className="col-sm-6">
                                            <div className="slds-form-element" >
                                            <label className="slds-form-element__label" htmlFor="text-input-id-6"><abbr className="slds-required" title="required">* </abbr>Document</label>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <input 
                                                            type="file" 
                                                            multiple 
                                                            name="file-uploader" 
                                                            accept={this.determineAcceptableFileTypes()} 
                                                            ref={this.inputFile} 
                                                            onChange={this.handleChangeUpload} 
                                                            value="" 
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
                                                                    disabled={this.state.isUploading || this.state.isUploadingDisable}
                                                                    label={`Upload files`}
                                                                    title={`Accepts .doc, .docx, .pdf, .jpg, jpeg, .png`}
                                                                    onClick={this.handleClickAddMoreFiles}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                    <div className="col-sm-8">
                                                    {this.renderUploadedDoc()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Row>
                                        <Col50>
                                            <Checkbox 
                                                id="applicant_specific"
                                                name="applicant_specific"
                                                onChange={e => {
                                                        this.setState({applicant_specific: e.target.checked? 1 : 0})
                                                    }
                                                }
                                                label="Applicant specific" 
                                                value={this.state.applicant_specific} 
                                                checked={this.state.applicant_specific>0? true : false}
                                            />
                                        </Col50>
                                        </Row>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default (EditDocumentModel)
  