// @ts-nocheck
import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, css } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import {
    Modal,
    Button,
    IconSettings,
    Input,
} from '@salesforce/design-system-react';
import { getGroupBookingCancellationEmailContent } from '../../../admin/recruitment/actions/RecruitmentAction.js';
import { replaceCancellationEmailContent } from '../../../admin/recruitment/azure_graph_ms_invite/MSCommonRequest';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from "draft-js-export-html";
import { ToolBarConfig } from '../ToolbarConfig.jsx';
import { Editor } from 'react-draft-wysiwyg';
import { MsalProvider } from "@azure/msal-react";
import {CancelMeetingInvite} from '../../../admin/recruitment/azure_graph_ms_invite/MsCancellationCommon';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Class: GBCancelInvite
 */
class GBCancelInvite extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            applicant_id: this.props.applicant_id,
            application_id: this.props.application_id,
            related_to: this.props.application_id,
            subject: '',
            email_content: null,
            editorState: null,
            application_options: [],
            employeeContractEmailContent:'content',
        }
    }
    

    componentDidMount() {      
         this.getGroupBookingCancellationEmail()
    }

    setEmailContent(content){
        let contentState = stateFromHTML(content);
        // Editor content
       let editorState = EditorState.createWithContent(contentState);
        // Update content state for footer
       const rawContentState =  convertToRaw(editorState.getCurrentContent())
       const markup = stateToHTML(editorState.getCurrentContent())
       this.setState({ editorState, email_content: markup });
     }

    /*
    * get group booking template and replace the date and location
    */
    getGroupBookingCancellationEmail = (email_key) => {
        this.setState({ loading: true });
        getGroupBookingCancellationEmailContent(email_key).then(res => {            
            if(res){
                this.setState({
                    group_booking_email_template:  res.template_content,   
                    group_booking_email_subject: res.subject,       
                    loading: false      
                },()=>
                {
                    let replaced_content = replaceCancellationEmailContent(res.template_content , this.props.interview_start_date, this.props.interview_start_time)
                    this.setEmailContent(replaced_content);
                });
                
            }
        });
    }      

    /**
     * Save template content on change
     * @param {obj} editorState 
     */
    onEditorChange = (editorState) => {
        // const rawContentState = convertToRaw(editorState.getCurrentContent());
        const rawContentState =  convertToRaw(this.state.editorState.getCurrentContent())
        const markup = stateToHTML(editorState.getCurrentContent())
        this.setState({ editorState, email_content: markup });
    };
   

    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setEmailContent(this.state.employeeContractEmailContent);
        this.setState({ [key]: value });
    }

    /**
     * Render the display content
     */
    render() {        
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <MsalProvider instance={msalInstance}> <CancelMeetingInvite 
                            label_name={'Send Cancellation'}
                            {...this.state}
                            {...this.props} 
                            />
                        </MsalProvider>
                        ]}
                        heading={'Cancel Meeting'}
                        size="x-small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.page_name=="status_path" ? this.props.closeGBModal(false) : this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="create_applicant_docusign" autoComplete="off" className="slds_form">                                   
                                   
                                    
                                    <div className="row py-1">
                                        <div className="col-sm-12">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required">* </abbr>Cancellation Note</label>
                                                    <div className='editor_custom_box' style={{ border: '1px solid #efefef'}}>
                                                    <Editor
                                                        toolbar={ToolBarConfig}
                                                        editorState={this.state.editorState}
                                                        toolbarClassName="toolbarClassName docusignToolBar"
                                                        wrapperClassName="wrapperClassName"
                                                        editorClassName="editorClassName"
                                                        onEditorStateChange={this.onEditorChange}
                                                        readOnly={this.props.is_organizer ? false : true}
                                                    />
                                                </div> 
                                            </div>
                                        </div>                            
                                    </div>
                                    <div className="row py-2"></div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }



}

export default GBCancelInvite;
