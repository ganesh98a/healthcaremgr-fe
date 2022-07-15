import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow } from 'service/common.js';
import 'react-block-ui/style.css';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import Row from '../../oncallui-react-framework/grid/Row';
import Col50 from '../../oncallui-react-framework/grid/Col50';
import SelectList from "../../oncallui-react-framework/input/SelectList";
import SectionContainer from '../../oncallui-react-framework/grid/SectionContainer';
import Form from '../../oncallui-react-framework/grid/Form';
import { getGroupBookingEmailContent } from '../../../admin/recruitment/actions/RecruitmentAction.js';
import { MsalProvider } from "@azure/msal-react";
import {ApplicationCreateOrUpdateMeetingInvite} from '../../recruitment/azure_graph_ms_invite/MsCreateUpdateApplicantToGB';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../../admin/oncallui-react-framework/services/ms_azure_service/authConfig";
const msalInstance = new PublicClientApplication(msalConfig);
class StageUpdateModal extends Component {
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            selected_stage: '',
            stage_options: [],
            selection: this.props.selection,
            ms_template: ''
        }
    }

    validate_added_applicants = () => {
        let show_msg = [];
        let added_appplicant_count = parseInt(this.state.added_applicant_count) + this.props.selection.length;
        if(this.state.selected_stage=='CAB' || this.state.selected_stage=='Interviews'){
            if(parseInt(this.state.max_applicant) <= parseInt(this.state.added_applicant_count)){
                toastMessageShow("Max applicants are already added ", "e");
                return false;
            }else if(parseInt(this.state.max_applicant) < added_appplicant_count){
                let val  = parseInt(this.state.added_applicant_count) - this.state.max_applicant;
                toastMessageShow("Select only "+Math.abs(val)+" applications in order to update the stage and assign them to the selected group booking", "e");
                return  false;
            }else{
                this.props.selection.forEach((selected)=> { 
                    if(parseInt(selected.application_process_status)==7){
                        show_msg.push('true');  
                    }
                });        
                if(show_msg.length!=0){
                    toastMessageShow("Choose applications not in ‘Hired status", "e");
                    return false;
                }
            }            
        }
        return true;
    }

    get_ms_url_template=()=>{
        postData("recruitment/RecruitmentInterview/get_ms_url_template", {}).then((res) => {
            if (res.status) {
                this.setState({
                    ms_template: (res.data) ? res.data.template : ''
                })
            }
        });
    }

    /**
     * Update stage for selected application
     * @patam {event} e
     */
    onSubmit = (e) => {
        if(e){
            e.preventDefault();     
        }
         
        var check_application_status = true;
        var options = this.state.stage_options;
        var item = options.filter(option => {
            if (option.value === this.state.selected_stage) {
                return option;
            }
        });

        var item_val = '';
        options.filter(option => {
            if (option.value === this.state.selected_stage) {
                item_val = option.org_value;
            }
        });


        check_application_status = this.validate_added_applicants();        

        var req = {
            selected_stage: item_val,
            selected_option: item,
            applications: this.props.selection,
            interview_id: this.state.interview_id,
            selected_template : this.state.selected_template,
        }
        if(!this.state.selected_stage) {
            toastMessageShow("Please select the Status", "e");
            return false;
        }else if(item_val==8 && !this.state.selected_template){
            toastMessageShow("Please select the email template", "e");
            return false;
        }else
        {
            if(check_application_status){
                this.setState({ loading: true });
                postData('recruitment/RecruitmentApplication/update_application_status', req).then((result) => {
                    this.setState({ loading: false });
                    if (result.status) {
                        toastMessageShow(result.msg, 's');
                        this.props.closeModal(true);
                    } else {
                        toastMessageShow(result.error, "e");
                    }
                });
                return true;
            }
           
        }
    }

    /**
     * mounting all the components
     */
    componentDidMount() { 
        this.get_application_statuses();
        this.getAllInterviewList();
        this.getUnsuccessfulEmailTemplate();
        this.get_ms_url_template();
    }

    onSelect = (value, key) => {
        if(key=="selected_stage" && value!=8){
            this.setState({ [key]: value , selected_template: ''});
        }else{
            this.setState({ [key]: value});
        }
    }

    getTemplateName = () =>{
        let template_subject = '';
        this.state.email_template.map((col)=>{
            if(col.value == this.state.selected_template){
                template_subject = col.subject;
            }
        });
        return template_subject;
    }

    onGroupBookingSelect = (value) => {
        this.setState({ interview_id: value })
        postData("recruitment/RecruitmentInterview/get_max_applicant_details", {id : value}).then((res) => {
            this.setState({applicantList : res.data.applicants ? res.data.applicants.data : []})
            this.setState(res.data,()=>{
                let email_key = res.data.interview_type=='CAB day' ? 'group_booking_cab_day_invite' : 'group_booking_confirmation';
                this.getGroupBookingEmailHtmlFormat(email_key);
            });
        });
    }
    /**
     * get the list of email template
     */
    getUnsuccessfulEmailTemplate = () =>{
        postData("imail/Templates/get_email_template_name", {}).then((res) => {
            if (res.status) {
                let sel_def = [{'label': "Do not send", 'value': "0"}];
                let sel_val = res.data;
                let sel_data = [];
                if(sel_val) {
                    sel_data = [...sel_def, ...sel_val];
                }
                else {
                    sel_data = sel_def;
                }
                this.setState({
                    email_template: sel_data
                })
            }
        });
    }

    /**
     * get the interview location
     */
     getAllInterviewList = () =>{
        postData("recruitment/RecruitmentInterview/get_interviews_list_by_search", {}).then((res) => {
                this.setState({group_booking_options : res.data});
        });
       
    }

    /*
    * get group booking template and replace the date and location
    */
    getGroupBookingEmailHtmlFormat = (email_key) => {
        this.setState({ loading: true });
        getGroupBookingEmailContent(email_key).then(res => {
            if(res){
                this.setState({
                    group_booking_email_template: res.template_content,   
                    group_booking_email_subject: res.subject,             
                    loading: false,
                });
            }
           
        });
    }

    /**
     * fetching the stages of application
     */
    get_application_statuses = () => {
        // status_option
        postData('recruitment/RecruitmentApplication/get_all_recruitment_stages', {}).then((result) => {
            if (result.status) {
                var data = result.data
                this.setState({ stage_options: data });
            }
        });
    }

    getFooterButton = () => {
        if(this.state.selected_stage=="Interviews" || this.state.selected_stage=="CAB" ){
            return (
                <>
                 <MsalProvider instance={msalInstance}> <ApplicationCreateOrUpdateMeetingInvite 
                        applicantList={this.state.applicantList}
                        updateApplicationStatus={this.onSubmit}
                        validate_added_applicants={this.validate_added_applicants}
                        {...this.state}
                        {...this.props} 
                        />
                    </MsalProvider>
                </>
            )
        }else{
            return([<Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal()} />,
            <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />])
        }
    }

    /**
     * rendering components
     */
    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    size="small"
                    heading={"Update Status"}
                    isOpen={this.props.openModal}
                    footer={                        
                        this.getFooterButton()
                    }
                    onRequestClose={() => this.props.closeModal(false)} 
                    dismissOnClickOutside={false}
                >
                    <SectionContainer className="mb-5">
                        <Form id="update_stage">
                            <Row>
                                <Col50>
                                    <SelectList
                                        label="Status"
                                        name="selected_stage"
                                        required={true}
                                        options={this.state.stage_options}
                                        value={this.state.selected_stage}
                                        onChange={(value) => this.onSelect(value,'selected_stage')}
                                    />
                                </Col50>
                            </Row>                            
                            {this.state.selected_stage=="Interviews" || this.state.selected_stage=="CAB" ? <Row>                           
                                <Col50>
                                     <SelectList
                                        label="Group Booking"
                                        name="interview_id"
                                        options={this.state.group_booking_options}
                                        value={this.state.interview_id}
                                        onChange={(value) => this.onGroupBookingSelect(value)}
                                    />
                                </Col50>
                            </Row> : '' }
                            {this.state.selected_stage=="Unsuccessful" ? <Row>                           
                                <Col50>
                                     <SelectList
                                        label="Select Email Template"
                                        name="selected_template"
                                        required={true}
                                        options={this.state.email_template}
                                        value={this.state.selected_template}
                                        onChange={(value) => this.onSelect(value, 'selected_template')}
                                    />
                                </Col50>
                            </Row> : '' }
                            {this.state.selected_template && <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="w-100 slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Subject of the selected template</label>
                                    <input type="text"
                                        name="interview_duration"
                                        disabled={true}
                                        placeholder="Do not send"
                                        value={this.getTemplateName() || ''}
                                        data-rule-maxlength="6"
                                        className="slds-input" />
                                </div>
                            </div>
                        </div>}
                        </Form>
                    </SectionContainer>                    
                </Modal>
            </IconSettings>
        );
    }
}

export default StageUpdateModal;
