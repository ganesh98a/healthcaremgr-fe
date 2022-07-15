// @ts-nocheck
import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, css } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import {
    Modal,
    Button,
    IconSettings,
    Input,
} from '@salesforce/design-system-react';
/**
 * Class: CreateCabCertificate
 */
class CreateCabCertificate extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            email_certificate: false,
        }
    }

    componentDidMount() {
    }

    emailCertificate=(e)=>{
        if (e.target.checked) {
            this.setState({ email_certificate: true});
        } else {
            this.setState({ email_certificate: false});
        }
    }

    /**
     * Call the create and update api when user create cab certificate
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#send_cab_certificate").validate({ /* */ });
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#send_cab_certificate").valid()) {

            this.setState({ loading: true });
            if(this.props.isBulkApplication) {
                var url = 'recruitment/RecruitmentApplicant/generate_bulk_mail_cab_day_certificate';
                var req = {
                    applications: this.props.application_list,
                    email_certificate: this.state.email_certificate,
                    group_booking_applicant: this.props.group_booking_applicant || false,
                }

                // Call Api
                postData(url, req).then((result) => {
                    if (result.status) {
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
                var url = 'recruitment/RecruitmentApplicant/generate_and_mail_cab_day_certificate';
                var req = {
                    applicant_id: this.props.applicant_id ? this.props.applicant_id : this.props.quiz.applicant_id,
                    application_id: this.props.application_id,
                    email_certificate: this.state.email_certificate,
                    applicant_email: this.props.applicant_email
                };
                // Call Api
                postData(url, req).then((result) => {
                    if (result.status) {
                        // Trigger success pop
                        toastMessageShow(result.msg, 's');
                        this.props.closeModal(true);
                    } else {
                        // Trigger error pop
                        toastMessageShow(result.error, "e");
                    }
                    this.setState({ loading: false });
                });
            }
        }
    }

    /**
     * Render the display content
     */
    render() {

        const styles = css({
            root: {
                fontSize: '0.8125rem',
            },
        })

        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"CAB Certificate"}
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="send_cab_certificate" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-12">
                                            <div className="slds-form-element mt-4">
                                                { this.props.application_list && this.props.application_list.length > 1  ?
                                                <label className="slds-form-element__label" style={styles.root} htmlFor="text-input-id-1">
                                                    Do you wish to generate CAB Certificate for these applications?
                                                    </label>
                                                :
                                                <label className="slds-form-element__label" style={styles.root} htmlFor="text-input-id-1">
                                                    Do you wish to generate CAB Certificate for this application?
                                                    </label>
                                                }

                                                <div className="slds-form-element__control mb-4 mt-3">
                                                    <div className="slds-checkbox">
                                                        <input type="checkbox" id="check_preferred_phone" name="check_preferred_phone"
                                                        onChange={(e) => this.emailCertificate(e)} checked={this.state.email_certificate ? true : false} />
                                                        <label className="slds-checkbox__label" htmlFor="check_preferred_phone">
                                                            <span className="slds-checkbox_faux"></span>
                                                            <span className="slds-form-element__label">Email CAB Certificate</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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

export default CreateCabCertificate;
