import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import 'react-block-ui/style.css';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';

/**
 * to fetch the roles as user types
 */
const getStaff = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentTaskAction/get_recruiter_listing_for_create_task", { search: e }, 2, 1);
}

class CreateMemberModal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            member_status: '0',
            selection : this.props.selection
        }
    }

    /**
     * when submit button is clicked on the modal
     */
    onSubmit = (e) => {
        e.preventDefault();
        var check_application_status = true;
        var url = 'recruitment/RecruitmentApplicant/create_member_for_hired_applicant';
        var req = {
            applicant_id: this.props.applicant_id,
            application_id: this.props.application_id,
            member_status: this.state.member_status
        }
        if(this.props.is_bulk_update){
            url = 'recruitment/RecruitmentApplicant/create_member_for_bulk_hired_applicant';
            req = {               
                applicants_details: this.props.selection,
                member_status: this.state.member_status
            }
            let show_msg = [];
            this.props.selection.forEach((selected)=> { 
                if(parseInt(selected.application_process_status)!=7){
                    show_msg.push('true');  
                }
            });

            if(show_msg.length!=0){
                toastMessageShow("Choose applications only in ‘Hired’ status", "e");
                check_application_status = false;
            }
        }
       
        if(check_application_status){
            jQuery("#create_update_quiz").validate({ /* */ });
            // Allow only validation is passed
            if (!this.state.loading && jQuery("#create_update_quiz").valid()) {

                this.setState({ loading: true });               
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
     * mounting all the components
     */
    componentDidMount() { }


    /**
     * rendering components
     */
    render() {
        var status_option = [{ "value": '1', "label": "Active" }, { "value": '0', "label": "Inactive" },];
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <div>
                    <Modal
                        size="small"
                        heading={"Create Support Worker"}
                        isOpen={this.props.openModal}
                        footer={[
                            <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal()} />,
                            <Button id='submit' disabled={this.state.loading} label="Ok" variant="brand" onClick={this.onSubmit} />
                        ]}
                        onRequestClose={() => this.props.closeModal(false)} >

                        <div className="col-lg-12 mb-5">
                        <form id="create_update_quiz" autoComplete="off" className="slds_form">
                            <div className="row py-2 mb-3">
                                <div className="col-sm-12">
                                    <div className="slds-form-element">
                                        <label className="slds-form-element__label" htmlFor="text-input-id-2">Are you sure you want to create {this.props.is_bulk_update ? 'these' : 'this' } applicant as a support worker within the support worker module?</label>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" >
                                                    <abbr className="slds-required" title="required">* </abbr>Support Worker Status</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="custom_select default_validation"
                                                        options={status_option}
                                                        onChange={(value) => this.setState({ member_status: value })}
                                                        value={this.state.member_status || ''}
                                                        clearable={false}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        required={true}
                                                        name="Status"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        </div>
                    </Modal>
                </div>
            </IconSettings>
        );
    }
}

export default CreateMemberModal;
