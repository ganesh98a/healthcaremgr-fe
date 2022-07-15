import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, handleChange } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
} from '@salesforce/design-system-react';

/**
 * Class: ChooseApplicationModal
 */
class ChooseApplicationModal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        this.state = {
            loading: false,
            applicant_id: this.props.applicant_id ? this.props.applicant_id : '',
            application_id: this.props.application_id ? this.props.application_id : '',
            application_options: []
        }
    }

    /**
     * fetching the job applications of an applicant
     */
    get_applicant_job_application = (applicant_id) => {
        postData('recruitment/RecruitmentApplicant/get_applicant_job_application', { applicant_id }).then((result) => {
            if (result.status) {
                this.setState({application_options: result.data});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    
    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        if(this.props.applicant_id) {
            this.get_applicant_job_application(this.props.applicant_id);
        }
        this.setState({ loading: false });
    }

    /**
     * Calling the API to create/update the member unavailability
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#send_employment_contract").validate({ /* */ });
        
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#send_employment_contract").valid()) {
            this.setState({ loading: true });
            var req = { contractId: '', task_applicant_id: '', applicant_id: this.state.applicant_id, application_id: this.state.application_id };
            postData('recruitment/RecruitmentApplicant/generate_employment_contract', req).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal();
                } else {
                    toastMessageShow(result.error, 'e');
                }
                this.setState({ loading: false });
            });
        }
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
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal()} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"Send Employment Contract"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal()}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="send_employment_contract" autoComplete="off" className="slds_form">
                                    <div className="row py-2 mb-5">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1"><abbr className="slds-required" title="required">* </abbr>Choose Job Application</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="custom_select default_validation"
                                                        options={this.state.application_options}
                                                        onChange={(e) => this.handleChange(e, 'application_id')}
                                                        value={this.state.application_id || ''}
                                                        clearable={false}
                                                        searchable={true}
                                                        placeholder="Please Select"
                                                        name="Type"
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2 mb-5">&nbsp;</div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default ChooseApplicationModal;
