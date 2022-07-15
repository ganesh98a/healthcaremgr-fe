import React, { Component } from 'react';
import jQuery from "jquery";
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
import { getEmailTemplateOption } from '../../../admin/recruitment/actions/RecruitmentAction.js';
/**
 * Class: ApplicantsCard
 */
const groupBookingStatusList = () => {
    return [
        { label: 'Successful', value: '1' },
        { label: 'Unsuccessful', value: '2' },
        { label: 'Did not show', value: '3' }
    ];
}

class ApplicantBulkUpdateStatus extends Component {
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            email_status_update: true,
            showSubject: false
        }
    }

    /**
     * Update stage for selected application
     * @patam {event} e
     */
    onSubmit = (e) => {
        e.preventDefault();
        if(this.state.selected_template==""){
            toastMessageShow("Please choose all mandatory fields", "e");
            return false;
        }
        jQuery("#update_stage").validate({ /* */ });
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#update_stage").valid()) {
        var req = { id: this.props.props.match.params.id, interview_meeting_status: this.state.interview_meeting_status, selected_interview_applicant: this.props.selected_applicant, 
                    email_status_update: this.state.email_status_update, selected_template: this.state.selected_template }
        this.setState({ loading: true });
        postData('recruitment/RecruitmentInterview/bulk_update_applicant_interview_status', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                this.props.closeModal(true);
                toastMessageShow(result.msg, "s");
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
}

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.getEmailTemplate();
     }

    /**
     * get the list of email template
     */
      getEmailTemplate = () => {
        this.setState({ loading: true });
        getEmailTemplateOption().then(res => {
            this.setState({
                email_template: res,
                showSubject: true,
                loading: false,
            });
        });
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

    onSelect = (value, key) => {
        this.setState({ [key]: value });
    }

    emailStatusUpdate = (e) => {
        if (e.target.checked) {
            this.setState({ email_status_update: true });
        } else {
            this.setState({ email_status_update: false });
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
                    heading={"Bulk Update Status"}
                    isOpen={this.props.showModal}
                    footer={[
                        <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal()} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />
                    ]}
                    onRequestClose={() => this.props.closeModal(false)}
                    dismissOnClickOutside={false}
                >
                    <SectionContainer className="mb-5">
                        <Form id="update_stage">
                            <Row>
                                <Col50>
                                    <SelectList
                                        label="Status"
                                        name="interview_meeting_status"
                                        required={true}
                                        options={groupBookingStatusList()}
                                        value={this.state.interview_meeting_status}
                                        onChange={(value) => this.onSelect(value, 'interview_meeting_status')}
                                    />
                                </Col50>
                            </Row>
                            <Row>                           
                                <Col50>
                                     <SelectList
                                        label="Email Template"
                                        name="selected_template"
                                        required={true}
                                        options={this.state.email_template}
                                        value={this.state.selected_template}
                                        onChange={(value) => this.onSelect(value, 'selected_template')}
                                    />
                                </Col50>
                            </Row>
                            {this.state.showSubject && <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="w-100 slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">Subject</label>
                                    <input type="text"
                                        name="interview_duration"
                                        disabled={true}
                                        placeholder="Do not send"
                                        value={this.getTemplateName() || ''}
                                        data-rule-maxlength="6"
                                        className="slds-input" />
                                </div>
                            </div>
                           </div> }
                                <div className="slds-form-element__control mb-4 mt-3">
                                    <div className="slds-checkbox">
                                        <input type="checkbox" id="check_preferred_phone" name="check_preferred_phone"
                                            onChange={(e) => this.emailStatusUpdate(e)} checked={this.state.email_status_update ? true : false} />
                                        <label className="slds-checkbox__label" htmlFor="check_preferred_phone">
                                            <span className="slds-checkbox_faux"></span>
                                            <span className="slds-form-element__label">  Send status update to all the selected applicants via email</span>
                                        </label>
                                    </div>
                                </div>
                        </Form>
                    </SectionContainer>
                </Modal>
            </IconSettings>
        );
    }
}

export default ApplicantBulkUpdateStatus;
