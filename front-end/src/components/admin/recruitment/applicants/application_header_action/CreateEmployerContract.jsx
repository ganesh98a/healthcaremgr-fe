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
import CreateDocusignModel from '../../applicants/docusign/CreateDocusignModel';

/**
 * Class: CreateEmployerContract
 */
class CreateEmployerContract extends Component {
    constructor(props) {
        console.log('props',props);
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
        }
    }

    componentDidMount() {       
    }

    /**
     * Call the create and update api when user create cab certificate
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#send_contract").validate({ /* */ });
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#send_contract").valid()) {

            this.setState({ loading: true });
            var url = 'recruitment/RecruitmentApplicant/generate_bulk_employment_contract';
            var req = {
                applications: this.props.application_list,
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
        }
    }

    renderFooter = () => {
        let footerButton = [
            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />
        ]
        if (this.props.from_group_booking_page) {
            footerButton.push(<Button disabled={this.state.loading} key={1} label="Continue" variant="brand" onClick={()=>{this.setState({openCreateDocument : true})} } />);

        } else {
            footerButton.push(<Button disabled={this.state.loading} key={1} label="Ok" variant="brand" onClick={this.submit} />);
        }
        return footerButton;
    }

    /**
     * Render modals
     * - Create Docusign
     */
     renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateDocument && (
                        <CreateDocusignModel
                            showModal = {this.state.openCreateDocument}
                            closeModal = {this.closeModal}
                            headingTxt = "Employment Contract"
                            applicant_id={this.state.applicant_id}
                            application_id={this.state.application_id}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
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
                        footer={this.renderFooter()}
                        heading={"Bulk Employment Contract"}
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="send_contract" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-12">
                                            <div className="slds-form-element mt-1 mb-1">                                                                       
                                               {  this.props.application_list && this.props.application_list.length > 1  ? 
                                                <label className="slds-form-element__label" style={styles.root} htmlFor="text-input-id-1">
                                                    Do you wish to generate employment contract for all these selected applications?
                                                </label> :
                                                <label className="slds-form-element__label" style={styles.root} htmlFor="text-input-id-1">
                                                    Do you wish to generate employment contract for  the selected application?
                                                </label>     
                                                }                                                                           
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
                {this.renderModals()}
            </React.Fragment>
        );
    }
}

export default CreateEmployerContract;
