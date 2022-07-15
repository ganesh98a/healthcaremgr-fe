import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { checkItsNotLoggedIn, postData, queryOptionData, toastMessageShow } from 'service/common.js';
import { SLDSIcon } from '../../../salesforce/lightning/SLDS';
import SLDSReactSelect from '../../../salesforce/lightning/SLDSReactSelect.jsx';

const getOptionsStaff = (e, data) => {
    return queryOptionData(e, "sales/Opportunity/get_owner_staff_search", { query: e }, 2, 1);
}

const getOptionsAccountPersonName = (e, data) => {
    var accounts = queryOptionData(e, "sales/Opportunity/get_account_person_name_search", { query: e }, 2, 1);
    console.log(accounts);
    return accounts;
}

class CreateNeedAssessmentBox extends Component {

    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            title: '',
            account_person: '',
            account_type: '',
            isSubmitting: false,
            redirectPage: false,
            lead_source_code_option: [],
            lead_status_options: [],
            lead_owner: {},
            needassessment_type_options: []
        }

    }

    onSubmit = (e, state) => {
        e.preventDefault();
        jQuery("#create_needassessment").validate({ /* */ });
        this.setState({ validation_calls: true })
        console.log( this.state);

        if (!this.state.loading && jQuery("#create_needassessment").valid()) {
            this.setState({ loading: true });
            var req = {
                ...this.state,
                owner: this.state.owner ? this.state.owner.value : '',
                account_person: this.state.account_person ? this.state.account_person.value : '',
                account_type: this.state.account_person ? this.state.account_person.account_type : ''
            }
            postData('sales/NeedAssessment/create_need_assessment', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.props.closeModal(result.id);

                    // tells the parent component to do 
                    // something when needassessment was updated successfully
                    if (this.props.onUpdate && this.state.need_assessment_id) {
                        this.props.onUpdate(this.state.need_assessment_id)
                    }

                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }
/* 
    handleOnClose = e => {
        this.setState({ redirectPage: true }, () => this.props.closeModal())
    }

    handleOwnerChange = (evt) => {
        this.state.account_person = evt.value;
        this.state.account_type = evt.account_type;
        console.log(this.state);
        return true;
    } */

    handleChange = (value, key) => {
        this.setState({ [key]: value }, () => {
            console.log(key);
            if (this.state.validation_calls) {
                jQuery("#create_needassessment").valid()
            }
        })
    }

    componentDidMount() {
        // Code below is incorrect. getNeedAssessmentData accepts needassessment_id not oppId
        if (this.props.oppId) { 
            this.getNeedAssessmentData(this.props.oppId);
        }

        if (this.props.data) {
            this.setState({ ...this.props.data })
        }
    }

    getNeedAssessmentData = (needassessment_id) => {
        postData('sales/NeedAssessment/get_needassessment_detail', { needassessment_id: needassessment_id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow('Something went wrong', "e");
            }
        });
    }

    handleCancel = e => {
        e.preventDefault()
        
        if (this.props.closeModal) {
            this.props.closeModal(null)
        }
    }


    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.openOppBox}
                    footer={[
                        <Button label="Cancel" onClick={this.handleCancel} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                    ]}
                    onRequestClose={this.props.closeModal}
                    heading={this.props.pageTitle}
                    className="slds_custom_modal"
                    size="small"
                    dismissOnClickOutside={false}
                >

                    <div className="slds-modal__header_">
                        <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={this.handleCancel}>
                            <SLDSIcon icon="close" className={`slds-button__icon slds-button__icon_large`} aria-hidden="true" />
                            <span className="slds-assistive-text">Close</span>
                        </button>
                    </div>

                    <form id="create_needassessment" autoComplete="off" className="px-4 col-md-12 slds_form" onSubmit={e => this.props.onSubmit(e, this.state)} disabled={this.props.disabled}
                        style={{ paddingBottom: 80 }}
                    >
                        <div className="row py-2">
                            <div className="w-50-lg col-lg-4 col-sm-6 ">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Account (Person/Org) Name</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.account_person}
                                                cache={false}
                                                loadOptions={(e) => getOptionsAccountPersonName(e, [])}
                                                onChange={(e) => {
                                                    this.setState({ account_person: e })
                                                    this.handleChange(e.label + " Need Assessment", "title")
                                                    }
                                                } 
                                                placeholder="Please Search"
                                                required={true} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        <div className="row py-1">
                            <div className="w-50-lg col-lg-4 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                        <abbr className="slds-required" title="required">* </abbr>Title</label>
                                    <div className="slds-form-element__control">
                                        <input type="text" className="slds-input" name="topic" placeholder="Enter Title" onChange={(e) => this.handleChange(e.target.value, "title")} value={this.state.title || ''} required />
                                    </div>
                                </div>
                            </div>

                            <div className="w-50-lg col-lg-4 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Assigned To</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.owner}
                                                cache={false}
                                                loadOptions={(e) => getOptionsStaff(e, [])}
                                                onChange={(e) => this.setState({ owner: e })}
                                                placeholder="Please Search" 
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row py-2 pb-2"></div>
                    </form>
                </Modal>
            </IconSettings>
        )
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(CreateNeedAssessmentBox);