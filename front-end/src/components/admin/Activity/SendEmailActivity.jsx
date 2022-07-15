import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { postData, selectFilterOptions, css, comboboxFilterAndLimit, postImageData, handleRemoveShareholder } from 'service/common.js';
import { connect } from 'react-redux'
import jQuery from "jquery";
import { Combobox, Icon, IconSettings } from '@salesforce/design-system-react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js'
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import { EditorState, ContentState, convertFromHTML, convertToRaw, Modifier } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { TollBarConfig } from './TollBarConfig.jsx';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../scss/components/admin/crm/pages/sales/EmailActivity.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import createClass from 'create-react-class';
import { stateToHTML } from "draft-js-export-html";
import { get_contact_name_search_for_email_act } from "components/admin/crm/actions/ContactAction.jsx"
import { DropdownList, apiRequest, CustomModal, Form, Label, Row, SelectList } from '../oncallui-react-framework';
import EmailTemplates from '../imail/EmailTemplates.jsx';
import { toastMessageShow } from '../../../service/common.js';
import EmailInsertMergeField from '../Activity/EmailInsertMergeField';
import Col from '../oncallui-react-framework/grid/Col.jsx';
import { getStateChild, setStateChild, getUploadFileLimit, validateUploadedFile, validatePostSize } from '../oncallui-react-framework/services/ARF.js'; 
import 'service/jquery.validate.js';

/**
 * get contact details
 * @param {obj} e
 * @param {array} data
 */
const getOptionsRelatedToTask = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData("sales/Contact/get_option_task_field_ralated_to", { search: e }).then(res => {
        return { options: res.data };
    });
}

/**
 * List option with icon for related to field
 */
const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {
        if (this.props.option.type == 1) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#opportunity";
            var className = "slds-icon-standard-opportunity";
        } else if (this.props.option.type == 2) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#lead";
            var className = "slds-icon-standard-lead";
        } else if (this.props.option.type == 3) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#skill_requirement";
            var className = "slds-icon-standard-skill-requirement";
        } else if (this.props.option.type == 4) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#service_report";
            var className = "slds-icon-standard-service-report";
        } else if (this.props.option.type == 5) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#service_contract";
            var className = "slds-icon-standard-service-contract";
        } else if (this.props.option.type == 6) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#contact";
            var className = "slds-icon-standard-contact";
        } else if (this.props.option.type == 7) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#timesheet";
            var className = "slds-icon-standard-timesheet";
        } else if (this.props.option.type == 8) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#file";
            var className = "slds-icon-standard-file";
        } else if (this.props.option.type == 9) {
            var icon_ref = "/assets/salesforce-lightning-design-system/assets/icons/standard-sprite/svg/symbols.svg#people";
            var className = "slds-icon-standard-people";
        }

        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>

                <div role="presentation" class="slds-listbox__item">
                    <div id="option3" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                        <span class="slds-media__figure slds-listbox__option-icon">
                            <span class={"slds-icon_container " + className}>
                                <svg class="slds-icon slds-icon_small" aria-hidden="true">
                                    <use href={icon_ref}></use>
                                </svg>
                            </span>
                        </span>
                        <span class="slds-media__body">
                            <span class="slds-listbox__option-text slds-listbox__option-text_entity">{this.props.option.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
});

/**
 * Class: SendEmailActivity
 */
class SendEmailActivity extends Component {
    constructor(props) {
        super(props);
        this.allowedExtensions = ['jpg', 'jpeg', 'png', 'doc', 'docx', 'pdf', 'odt', 'rtf'];
        this.state = {
            inputValue: '',
            loading: false,
            isLoadingMenuItems: false,
            selection: [],
            email_to: this.props.contactDefaultOptions,
            defalut_to: this.props.contactDefaultOptions,
            email_to_id: '',
            contact_option: [],
            contact_option_cc: [],
            email_bcc: [],
            email_bcc_id: '',
            email_cc: [],
            email_cc_id: '',
            email_cc_isvisible: false,
            related_to: this.props.related_to,
            email_subject: '',
            email_comment: '',
            attachments: [],
            content: '',
            editorState: EditorState.createEmpty(),
            footer: "<p><br /></p><p><br /></p><p><br /></p><p><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p><p>660 Canterbury Rd, Surrey Hills VIC 3127, Australia</p><p><a href='https://www.oncall.com.au'>www.oncall.com.au</a></p><p>(03) 9896 2468</p>",
            max_post: 0,
            max_upload: 0,
            memory_limit: 0,
            upload_mb: 0,
            byte: 1048576, // 1 MB in bytes
            uploaded_total_bytes: 0,
            max_total_bytes: 0,
            uploaded_file_count: 0,
            iconset: [],
            showlist: false,
            merge_field_modal: false,
            merge_field_value: '',
            merge_field_sep_start: '{{{',
            merge_field_sep_end: '}}}',
            show_template_list: false,
            template_assigned: true,
            warning: { content: "", title: "Warning", onClickOkButton: (e) => { return false } },
            save_as: {}
        };
        this.sanFormRef = React.createRef()
    }

    setEditorContent(content = "") {
        // Convert the raw html to preview format
        let contentState = stateFromHTML(this.state.footer);
        if (content) {
            contentState = stateFromHTML(content);
        }
        // Editor content
        let editorState = EditorState.createWithContent(contentState);
        // Update content state for footer
        const markup = stateToHTML(editorState.getCurrentContent());
        this.setState({ editorState, content: markup });
    }

    componentDidMount() {
        this.getContactNameEmail('own');
        this.getContactNameEmail('all');
        this.callUploadFileLimit();
        this.setEditorContent();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ related_to: nextProps.related_to });
    }

    setIconForList(option) {
        return option.map((elem) => ({
            ...elem,
            ...{
                icon: (
                    <Icon
                        assistiveText={{ label: 'Account' }}
                        category="standard"
                        name={elem.type}
                    />
                ),
            },
        }));
    }

    /**
     * Get contact list based on type
     * @param {str} type - 'own' & 'all'
     * if type is own fetch only current contact details for default selection
     * if type is all fetch all contact details for options
     */
    getContactNameEmail = (type) => {
        this.props.get_contact_name_search_for_email_act({ salesId: this.props.salesId, sales_type: this.props.sales_type, type: type }).then((res) => {
            if (res && res.contact_option) {
                var option = res.contact_option;
                if (type == 'own' && option.length > 0) {
                    // set Icon for list  

                    let accountsWithIcon = this.setIconForList(option);
                    let defaultAccountsWithIcon = this.setIconForList(this.props.contactDefaultOptions);

                    this.setState({ email_to_id: '', email_to: defaultAccountsWithIcon, contact_option: option, defalut_to: defaultAccountsWithIcon, iconset: accountsWithIcon, showlist: true });
                } else {
                    // set contact id
                    var option = res.contact_option;
                    // set Icon for list
                    let accountsWithIcon = this.setIconForList(option);


                    this.setState({
                        email_to_contact_id: '',
                        contact_option_cc: [...this.state.contact_option, ...option],
                        contact_option: [...this.state.contact_option, ...option],
                        iconset: accountsWithIcon, showlist: true
                    });
                }
            }
        });
    }

    /**
     * Call callUploadFileLimit api
     */
    callUploadFileLimit = () => {
        getUploadFileLimit().then(res => {
            var ra_data = res.data;
            if (ra_data && ra_data.upload_mb) {
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
     * Render To contacts
     * @param {str} label
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
    renderToComboBox = (label, stateName, valueName) => {
        return (
            <Combobox
                id="combobox-to-contact"
                classNameContainer="combox_box-to-cus"
                events={{
                    onChange: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({ [valueName]: value, isLoadingMenuItems: true });
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        });
                    },
                    onSubmit: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: [
                                ...this.state[stateName],
                                {
                                    label: value,
                                    icon: (
                                        <Icon
                                            assistiveText="Account"
                                            category="standard"
                                            name="account"
                                        />
                                    ),
                                },
                            ],
                        });
                    },
                    onSelect: (event, data) => {
                        if (this.props.action) {
                            this.props.action('onSelect')(
                                event,
                                ...Object.keys(data).map((key) => data[key])
                            );
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        });
                    },
                }}
                labels={{
                    label: '  ' + label,
                    placeholder: 'Search ' + label,
                }}
                multiple
                menuItemVisibleLength={5}
                options={
                    comboboxFilterAndLimit(
                        this.state[valueName],
                        100,
                        this.state.iconset,
                        this.state[stateName],
                    )
                }
                selection={this.state[stateName]}
                value={this.state[valueName]}
                variant="inline-listbox"
            />
        );
    }

    /**
     * Render Cc & Bcc contacts
     * @param {str} label
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
    renderCCComboBox = (label, stateName, valueName) => {
        return (
            <Combobox
                id="combobox-cc-contact"
                disabled={this.props.disabled}
                classNameContainer="combox_box-cc-cus"
                events={{
                    onChange: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({ [valueName]: value });
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        });
                    },
                    onSubmit: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: [
                                ...this.state[stateName],
                                {
                                    label: value,
                                    icon: (
                                        <Icon
                                            assistiveText={{ label: 'Account' }}
                                            category="standard"
                                            name="account"
                                        />
                                    ),
                                },
                            ],
                        });
                    },
                    onSelect: (event, data) => {
                        if (this.props.action) {
                            this.props.action('onSelect')(
                                event,
                                ...Object.keys(data).map((key) => data[key])
                            );
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        });
                    },
                }}
                labels={{
                    label: label,
                    placeholder: 'Search ' + label,
                }}
                menuItemVisibleLength={5}
                multiple
                options={comboboxFilterAndLimit(
                    this.state[valueName],
                    100,
                    // this.props.contactOptions,
                    this.state.iconset,
                    this.state[stateName],
                )}
                selection={this.state[stateName]}
                value={this.state[valueName]}
            />
        );
    }

    /**
     * Save template content on change
     * @param {obj} editorState
     */
    onEditorChange = (editorState) => {
        // const rawContentState = convertToRaw(editorState.getCurrentContent());
        const markup = stateToHTML(editorState.getCurrentContent());
        this.setState({ editorState, content: markup });
    };

    /**
     * Update the attachment state to list the selected attachment
     * @param {obj} event
     */
    selectAttchment = (event) => {
        var attachments = this.state.attachments;
        var tempState = event.target.files
        Object.keys(tempState).map((key) => {
            let validation = validateUploadedFile(tempState[key], this.allowedExtensions, this.state);
            // validate the file
            if (validation.error) {
                toast.error(<ToastUndo message={validation.message} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            } else {
                let uploaded_total_bytes = validation.uploaded_total_bytes;
                attachments.push(tempState[key]);
                this.setState({ uploaded_file_count: this.state.uploaded_file_count + 1, uploaded_total_bytes });
            }
        });

        this.setState({ attachments: attachments });
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
     * Save & Send email
     * @param {obj} e
     * @param {*} type
     */
    sendMail = (e) => {
        e.preventDefault();
        // Validate the form
        jQuery('#send_email_activity').validate();
        if (jQuery('#send_email_activity').valid()) {
            const formData = new FormData()
            this.state.attachments.map((val) => {
                if (val.aws_object_uri) {
                    let temp_attachment = JSON.stringify(val);
                    formData.append('temp_attachments[]', temp_attachment);
                } else {
                    formData.append('attachments[]', val);
                }
            })

            formData.append('to_user', JSON.stringify(this.state.email_to));
            formData.append('cc_user', JSON.stringify(this.state.email_cc));
            formData.append('bcc_user', JSON.stringify(this.state.email_bcc));
            formData.append('subject', this.state.email_subject);
            formData.append('content', this.state.content);
            formData.append('salesId', this.props.salesId);
            formData.append('sales_type', this.props.sales_type);
            formData.append('related_to', this.state.related_to ? this.state.related_to.value : '');
            formData.append('related_type', this.state.related_to ? this.state.related_to.type : '');
            let validation = validatePostSize(formData, this.state);
            if (validation.error) {
                toast.error(<ToastUndo message={validation.message} showType={'e'} />, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                return false;
            }
            this.setState({ loading: true });
            postImageData("sales/Activity/send_new_mail", formData).then((result) => {
                if (result.status) {
                    var message = "Send mail successfully.";
                    toast.success(<ToastUndo message={message} showType={'s'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });

                    // Convert the raw html to preview format
                    let contentState = stateFromHTML(this.state.footer);
                    // Editor content
                    let editorState = EditorState.createWithContent(contentState);
                    // Update content state for footer
                    const markup = stateToHTML(editorState.getCurrentContent());

                    // Resetting stage values
                    this.setState({
                        editorState,
                        email_subject: '',
                        email_to: this.state.defalut_to,
                        email_to_id: '',
                        email_cc: [],
                        email_cc_id: '',
                        email_bcc: [],
                        email_bcc_id: '',
                        related_to: '',
                        attachments: [],
                        content: markup
                    });

                    // reload the activity log
                    this.props.get_sales_activity_data({ salesId: this.props.salesId, sales_type: this.props.sales_type, related_type: this.props.related_type });
                } else {
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
                this.setState({ loading: false });
            });
        }
    }

    /**
     * Open Merge Insert Field
     * @param {eventObj} e 
     */
    triggerInsertMergeField = (e) => {
        e.preventDefault();
        this.setState({ merge_field_modal: true });
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, documentId) => {
        this.setState({ merge_field_modal: false });
    }

    /**
     * Set values
     * @param {str} value 
     */
    setMergeFieldValus = (value) => {
        this.setState({ merge_field_value: value, merge_field_modal: false });
        if (value != '' && value != undefined) {
            let text = this.state.merge_field_sep_start + value + this.state.merge_field_sep_end;
            this.sendTextToEditor(text);
        }
    }

    /**
     * Set the dynamic merge field values
     */
    sendTextToEditor = (text) => {
        this.setState({ editorState: this.insertText(text, this.state.editorState) });
        this.focusEditor();
    }

    /**
     * 
     * @param {string} text 
     * @param {object} editorState 
     */
    insertText = (text, editorState) => {
        const currentContent = editorState.getCurrentContent(),
            currentSelection = editorState.getSelection();

        const newContent = Modifier.replaceText(
            currentContent,
            currentSelection,
            text
        );

        const newEditorState = EditorState.push(editorState, newContent, 'insert-characters');
        return EditorState.forceSelection(newEditorState, newContent.getSelectionAfter());
    }

    /**
     * Set Editor ref
     * @param {object} editor 
     */
    setEditor = (editor) => {
        this.editor = editor;
    };

    /**
     * Focus editor
     */
    focusEditor = () => {
        if (this.editor) {
            this.editor.focusEditor();
        }
    };

    /**
     * Render modals
     * - Merge Field
     * 
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.merge_field_modal && (
                        <EmailInsertMergeField
                            setMergeFieldValus={this.setMergeFieldValus.bind(this)}
                            showModal={this.state.merge_field_modal}
                            closeModal={this.closeModal}
                            headingTxt="Insert Merge Field"
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    render() {
        const styles = css({
            attachment: {
                width: '34px',
                paddingTop: '5px',
                paddingBottom: '3px'
            },
            to_req: {
                color: '#0070d2',
                float: 'left',
                paddingRight: '5px',
                zIndex: 9001,
                border: 'none',
                paddingTop: '4px'
            }
        });
        return (
            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                <form id="send_email_activity" autocomplete="off" className="slds_form">
                    <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                            <span style={styles.to_req}>
                                <abbr class="slds-required" title="required">* </abbr>
                            </span>
                            {
                                this.state.email_cc_isvisible === false ?
                                    <button type="button" class="slds-button email_cc" onClick={() => {
                                        this.setState({ email_cc_isvisible: true })
                                    }}>Cc</button>
                                    :
                                    ''
                            }
                            {this.state.showlist ? this.renderToComboBox('To', 'email_to', 'email_to_id') : ''}
                        </div>
                    </div>
                    {
                        this.state.email_cc_isvisible ?
                            <div className="slds-form-element__control">
                                <div className="SLDS_date_picker_width">
                                    {this.renderCCComboBox('Cc', 'email_cc', 'email_cc_id')}
                                </div>
                            </div>
                            :
                            ''
                    }

                    <div className="slds-form-element__control">
                        <div className="SLDS_date_picker_width">
                            {this.renderCCComboBox('Bcc', 'email_bcc', 'email_bcc_id')}
                        </div>
                    </div>
                    <div className="row py-1 px-2">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label" htmlFor="input_email_subject">
                                <abbr class="slds-required" title="required">* </abbr>Subject
                            </label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    id="email_subject"
                                    name="reference_id"
                                    placeholder="Enter Subject..."
                                    className="slds-input input_email_subject"
                                    maxLength="3000"
                                    value={this.state.email_subject || ''}
                                    onChange={(e) => this.setState({ email_subject: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="row py-1 px-2">
                    <div className="slds-form-element">
                        <div className='editor_custom_box' style={{ border: '1px solid #efefef' }}>
                            <Editor
                                ref={this.setEditor}
                                toolbar={TollBarConfig}
                                editorState={this.state.editorState}
                                toolbarClassName="toolbarClassName"
                                wrapperClassName="wrapperClassName"
                                editorClassName="editorClassName"
                                onEditorStateChange={this.onEditorChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="row py-1 px-2">
                    <div className="px-0 py-0 mt-2 d-inline-block attach_bn">
                        <span className="upload_btn d-inline-block">
                            <label className="btn btn-default btn-sm center-block btn-file">
                                <OverlayTrigger placement="bottom" overlay={<Tooltip id="attachment" className="MSG_Tooltip" placement={'top'}>Attach File</Tooltip>}><i className="icon icon-attach-im attach_im mr-0"></i></OverlayTrigger>
                                <input className="p-hidden" multiple type="file" onChange={this.selectAttchment} name="attachment" value="" />
                            </label>
                        </span>
                    </div>
                    <div className="px-0 py-0 mt-2 ml-1 d-inline-block attach_bn">
                        <DropdownList
                            iconName="insert_template"
                            tooltip="Insert, Create or Update template"
                            options={[
                                { label: '', type: 'header' },
                                { label: 'Insert a Template...', value: 'insert' },
                                { label: 'Save as new template...', value: 'saveasnew' },
                                { label: 'Save template...', value: 'save', disabled: this.state.template_assigned }
                            ]}
                            onSelect={(value) => this.handleTemplateChange(value)}
                        />
                    </div>
                    <div className="px-0 py-0 mt-2 ml-1 d-inline-block attach_bn">
                        <button style={{margin:"7px 6px 6px 6px"}} class="slds-button slds-button_icon" tabindex="5" onClick={this.triggerInsertMergeField} id="insert-merge-fields-btn">
                            <Icon
                                assistiveText={{ label: 'Lead' }}
                                category="utility"
                                name={`merge_field`}
                                size={'xx-small'}
                            />
                            <span class="slds-assistive-text">Insert Merge Field</span>
                        </button>
                    </div>                    
                </div>
                {this.state.attachments.map((val, index) => (
                    <div key={index + 1} className="attach_txt pt-2"><span>{val.name}</span><i onClick={(e) => { handleRemoveShareholder(this, e, index, 'attachments').then(() => {
                        this.handleExistingAttachment(e, index);
                    }); }} className="icon icon-cross-icons-1"></i> </div>
                ))}
                <div className="slds-form-element">
                    <label className="slds-form-element__label">Related To</label>
                    <div className="slds-form-element__control">
                        <SLDSReactSelect.Async
                            clearable={true}
                            className="SLDS_custom_Select default_validation"
                            value={this.state.related_to}
                            cache={false}
                            loadOptions={(e) => getOptionsRelatedToTask(e, [])}
                            onChange={(e) => this.setState({ related_to: e })}
                            placeholder="Please Search"
                            name="related_to"
                            optionComponent={GravatarOption}
                            filterOptions={selectFilterOptions}
                        />
                    </div>
                </div>
                <div className="mt-3 text-right">
                    <button style={{ color: 'white' }} className="slds-button slds-button_success" type="button" onClick={(e) => this.sendMail(e)} disabled={this.state.loading || this.state.uploading}>Save</button>
                </div>
                {this.renderModals()}
                {
                    this.state.show_template_list && <CustomModal
                        title="Insert Template"
                        ok_button="Select"
                        showModal={this.state.show_template_list}
                        setModal={(status) => this.setState({ show_template_list: status })}
                        size="small"
                        onClickOkButton={(e) => { return false }}
                        width="200px"
                        style={{ minHeight: "200px", overFlowY: "hidden" }}
                        hideSaveButton={true}
                        loading={this.state.loading || this.state.uploading}
                    >
                        <EmailTemplates
                            onTemplateClick={(e, id, text) => this.replaceEditorContent(e, id, text)}
                        />
                    </CustomModal>
                }
                {
                    this.state.show_warning && <CustomModal
                        title={this.state.warning.title}
                        ok_button={this.state.warning.ok_button}
                        showModal={this.state.show_warning}
                        setModal={(status) => this.setState({ show_warning: status })}
                        size="x-small"
                        onClickOkButton={(e) => this.state.warning.onClickOkButton(e)}
                        width="200px"
                        style={{ overFlowY: "hidden" }}
                        loading={this.state.loading || this.state.uploading}
                    >
                        <div>
                            {this.state.warning.content}
                        </div>
                    </CustomModal>
                }
                {
                    this.state.save_as_modal && <CustomModal
                        title="Save as Template"
                        ok_button="Save"
                        showModal={this.state.save_as_modal}
                        setModal={(status) => this.setState({ save_as_modal: status })}
                        size="x-small"
                        onClickOkButton={(e) => this.saveAsNewTemplate(e)}
                        width="200px"
                        style={{ overFlowY: "hidden" }}
                        loading={this.state.uploading || this.state.loading}
                    >
                        {this.renderSaveAsNewForm()}
                    </CustomModal>
                }
            </IconSettings>
        );
    }

    handleExistingAttachment(e, index) {
        e.preventDefault();
        let eas = this.state.existing_attachment;
        if (eas) {
            let ea = eas[index];
            ea["is_deleted"] = 1;
            eas[index] = ea;
            this.setState({ existing_attachment: eas });
        }
    }

    saveAsNewTemplate(e, isNew = true) {
        if (isNew) {
            jQuery(this.sanFormRef.current).validate({  });
            if (!jQuery(this.sanFormRef.current).valid()) {
                return false;
            }
        }
        //upload attachments
        this.setState({ uploading: true, loading: true });
        if (this.state.attachments.length) {
            let new_upload = false;
            const formData = new FormData();
            this.state.attachments.map(item => {
                if (!item["uploaded"] || isNew) {
                    let ea = this.state.existing_attachment;
                    if (ea && ea.length) {
                        let exist = false;
                        this.state.existing_attachment.map(eam => {
                            if (eam.filename === item.name) {
                                exist = true;
                            }
                        });
                        if (!exist) {
                            formData.append('file[]', item);
                        }
                    } else {
                        formData.append('file[]', item);
                    }
                }
            });
            new_upload = formData.getAll('file[]').length;
            if (new_upload) {
                this.setState({ uploading: true, loading: true });
                postImageData('imail/Templates/upload_template_attachment_tempory', formData, this).then((result) => {
                    if (result.status) {
                        let uploads = [];
                        if (result.response && result.response.length) {
                            result.response.map(item => {
                                if (item["status"]) {
                                    uploads.push({ updated_filename: item["filename"] });
                                }
                            })
                        }
                        this.saveTemplate(e, uploads, isNew);
                    } else {
                        toastMessageShow(result.error, 'e');
                    }
                });
            } else {
                this.saveTemplate(e, [], isNew);
            }
        } else {
            this.saveTemplate(e, [], isNew);
        }
    }

    replaceEditorContent(e, id, text) {
        e.preventDefault();
        this.setState({ loading: true });
        //check if template is in use or not
        apiRequest({ url: "imail/Automatic_email/automatic_email_listing", params: { conditions: { templateId: id } } }).then(res => {
            if (!res.rows.length) {
                this.setState({ template_assigned: false, loading: false });
            } else {
                this.setState({ template_assigned: true, loading: false });
            }
        });
        apiRequest({ url: "imail/Templates/details", params: { id } }).then(res => {
            let attachments = [];
            let existing_attachment = [];
            if (res.rows.existing_attachment && res.rows.existing_attachment.length) {
                res.rows.existing_attachment.map((item, index) => {
                    let file = {
                        name: item.filename,
                        id: item.id,
                        aws_object_uri: item.aws_object_uri,
                        file_path: item.file_path
                    };
                    // attachments[(attachments.length + 1)] = file;
                    // existing_attachment[(existing_attachment.length + 1)] = item;
                    attachments.push(file);
                    existing_attachment.push(item);
                });
            }
            this.setEditorContent(res.rows.content);
            this.setState({ show_template_list: false, selected_template: id, template_name: text, from_label: res.rows.from, subject: res.rows.subject, attachments, existing_attachment, loading: false });
        });
    }

    handleTemplateChange(option) {
        if (option.value === "insert") {
            let warning = { content: "Inserting this template will overwrite the current email", title: "Warning", ok_button: "Insert", onClickOkButton: (e) => { this.setState({ show_warning: false, show_template_list: true }) } };
            this.setState({ show_warning: true, warning });
        }
        if (option.value === "save" && !this.state.template_assigned) {
            let warning = { content: "Updating overwrites the current template with your changes", title: "Update existing email template", onClickOkButton: (e) => this.saveAsNewTemplate(e, false) };
            this.setState({ show_warning: true, warning, ok_button: "Save" });
        }
        if (option.value === "saveasnew") {
            this.setState({ save_as_modal: true });
        }
        return false;
    }

    saveTemplate(e, uploads = [], save_asnew = false) {
        e.preventDefault();
        let id = this.state.selected_template;
        let is_edit = true;
        if (save_asnew) {
            is_edit = false;
        }
        let content = this.state.content;
        let name = this.state.save_as.template_name || this.state.template_name;
        let from = this.state.save_as.from_label || this.state.from_label;
        let subject = this.state.save_as.subject || this.state.subject;
        let existing_attachment = this.state.existing_attachment || [];
        let attachments = uploads;
        let template_assigned = this.state.template_assigned;
        if (save_asnew) {
            existing_attachment = [];
            template_assigned = false;
            this.state.attachments.map(item => {
                if (item.id) {
                    attachments.push(item);
                }
            });
            this.setState({ template_assigned });
        }
        this.setState({ uploading: true, loading: true });
        apiRequest({ url: "imail/Templates/create", params: { template_id: id, id, content, name, is_edit, from, subject, attachments, existing_attachment } }).then(res => {
            this.setState({ show_warning: false, save_as_modal: false, uploading: true, loading: true });
            if (res.status) {
                //mark all uploaded attachemnts
                attachments = this.state.attachments.map(item => {
                    item["uploaded"] = true;
                    return item;
                });
                this.setState({ selected_template: res.template_id, attachments });
                toastMessageShow("Template updated successfully", "s");
            } else {
                if (save_asnew) {
                    this.setState({ template_assigned: true });
                }
                toastMessageShow(res.error || "Something went wrong", "e");
            }
            this.setState({ uploading: false, loading: false });
        });
    }

    renderSaveAsNewForm() {
        return (
            <Form id="save-as-new-template" ref={this.sanFormRef}>
                <Row>
                    <Col id="template-name" input={{ id: "template-name", name: "template_name", label: "Template Name", required: true, value: getStateChild("save_as", "template_name", this), onChange: (e) => setStateChild("save_as", { template_name: e.target.value }, this) }}
                    />
                </Row>
                <Row>
                    <Col id="template-from-label" input={{ id: "template-name", name: "from_label", label: "From Label", required: true, value: this.state.save_as.from_label, onChange: (e) => setStateChild("save_as", { from_label: e.target.value }, this) }}
                    />
                </Row>
                <Row>
                    <Col id="template-subject" input={{ id: "template-name", name: "subject", label: "Subject", required: true, value: getStateChild("save_as", "subject", this), onChange: (e) => setStateChild("save_as", { subject: e.target.value }, this) }}
                    />
                </Row>
                <Row>
                    <SelectList
                        required
                        label="Folder"
                        options={[
                            { label: "Public", value: "public" },
                            { label: "Private", value: "private" }
                        ]}
                        onChange={value => setStateChild("save_as", { folder: value }, this)}
                        value={getStateChild("save_as", "folder", this) || "public"}
                        name="folder"
                    />
                </Row>
                <Row>
                    {this.state.attachments.map((val, index) => (
                        <div key={index + 1} className="attach_txt pt-2">
                            <Icon
                                category="utility"
                                name="attach"
                                size="xx-small"
                            />
                            <span className="ml-2">{val.name}</span>
                        </div>
                    ))}
                </Row>
            </Form>
        )
    }
}

// Get the page title and type from reducer
const mapStateToProps = state => ({
    contactDefaultOptions: state.ContactReducer.contactDefaultOptions,
    contactOptions: state.ContactReducer.contactOptions,
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispatch) => {
    return {
        get_contact_name_search_for_email_act: (request) => dispatch(get_contact_name_search_for_email_act(request)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(SendEmailActivity);