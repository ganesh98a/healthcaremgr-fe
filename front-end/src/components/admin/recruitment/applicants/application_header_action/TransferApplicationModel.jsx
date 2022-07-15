import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, handleChange } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
} from '@salesforce/design-system-react';
import { connect } from 'react-redux'

/**
 * Get job application
 * @param {obj} e 
 * @param {array} data 
 */
const getJobApplication = (e, data) => {
    return queryOptionData(e, "recruitment/Recruitment_job/get_job_application", { query: e, data: data }, 2, 1);
}

/**
 * Class: TransferApplicationModel
 */
class TransferApplicationModel extends Component {

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
            job_application: '',
            job_options: []
        }
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
            // this.get_job_application(this.props.applicant_id);
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
        jQuery("#transfer_application").validate({ /* */ });
        
        if (this.props.application_process_status >= 6) {
            toastMessageShow('Job can not be transferred as the applicant is either in or past CAB stage.', 'e');
            return false;
        }
        // Allow only if validation is passed
        if (!this.state.loading && jQuery("#transfer_application").valid()) {
            this.setState({ loading: true });
            var req = { applicant_id: this.state.applicant_id, application_id: this.state.application_id, selected_job: this.state.job_application };
            postData('recruitment/Recruitment_job/transfer_application', req).then((result) => {
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
                        heading={"Transfer Application"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal()}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="transfer_application" autoComplete="off" className="slds_form">
                                    <div className="row py-2 mb-5">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1"><abbr className="slds-required" title="required">* </abbr>Choose Job</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name='job_application'
                                                        loadOptions={(e) => getJobApplication(e, { applicant_id: this.state.applicant_id, application_id: this.state.application_id })}
                                                        clearable={true}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.job_application}
                                                        onChange={(value) => this.handleChange(value, 'job_application')}
                                                        inputRenderer={(props) => <input  {...props} name={"job_application"} />}
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

const mapStateToProps = state => ({
    application_process_status: state.RecruitmentApplicantReducer.applications.application_process_status,
})

const mapDispatchtoProps = (dispach) => {
    return {
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(TransferApplicationModel);