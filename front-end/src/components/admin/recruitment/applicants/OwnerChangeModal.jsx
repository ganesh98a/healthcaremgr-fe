import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow, css, handleChange, queryOptionData, comboboxFilterAndLimit } from 'service/common.js';
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

class OwnerChangeModal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            owner: '',
            selection: this.props.selection,
        }
    }

    /**
     * when submit button is clicked on the modal
     */
    onSubmit = (e) => {
        e.preventDefault();
        jQuery("#change_owner_form").validate({ /* */ });
        var url = 'recruitment/RecruitmentApplicant/change_owner';
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#change_owner_form").valid()) {
            var req = {
                owner: this.state.owner,
                applicants: this.props.selection
            }
            if(!this.state.owner) {
                toastMessageShow("Please select the Owner", "e");                
            }
            else
            {
            this.setState({ loading: true });
             postData(url, req).then((result) => {
                this.setState({ loading: false });
                if (result.status) {
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);
                } else {
                    toastMessageShow(result.error, "e");
                }
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
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
            <div>
                <Modal
                size="small"
                heading={"Change Owner"}
                isOpen={this.props.openModal}
                footer={[
                    <Button disabled={this.state.loading} label="Cancel" onClick={() => this.props.closeModal()} />,
                    <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />
                ]}
                onRequestClose={() => this.props.closeModal(false)} 
                dismissOnClickOutside={false}>
                 <form id="change_owner_form" autoComplete="off" className="slds_form">
                    <div className="col-lg-12 mb-5">
                        <div className="row py-2 mb-3">
                            <div className="col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                    <abbr className="slds-required" title="required">* </abbr>Owner</label>
                                    <div className="slds-form-element__control">
                                        <SLDSReactSelect.Async clearable={false}
                                            id="owner"
                                            className="SLDS_custom_Select default_validation"
                                            value={this.state.owner}
                                            cache={false}                                            
                                            loadOptions={(e) => getStaff(e, [])}
                                            onChange={(e) => this.setState({ owner: e ? e : [] })}
                                            placeholder="Please Search"
                                            name="owner"
                                            required={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
              </Modal>
            </div>
            </IconSettings>
        );
    }
}

export default OwnerChangeModal;
