import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, css, comboboxFilterAndLimit } from 'service/common.js';
// import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    Icon,
    IconSettings,
    Combobox,
} from '@salesforce/design-system-react';
/**
 * Class: CreateApplicantModel
 */
class CreateApplicantModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            showlist: false,
            isLoadingMenuItems: false,
            selection: [],
            selected_applicant: [],
            selected_applicant_id: this.props.selected_data.applicant_id ? this.props.selected_data.applicant_id : '',
            application_id: this.props.selected_data.application_id ? this.props.selected_data.application_id : '',
            limit: 100,
            selected_applicant_name : this.props.selectedApplicantName ? this.props.selectedApplicantName : '',
        }
    }

    componentWillMount() {
        this.get_applicant_name();
        if (this.props.selected_data.id) {
            this.setState({ selected_applicant: this.setIconForList(this.props.selected_applicant) });
            this.get_application_data_by_applicant_id(this.state.selected_applicant_id);
        }
    }

    setIconForList(option) {
        return option.map((elem) => ({
            ...elem,
            ...{
                icon: (
                    <Icon
                        assistiveText={{ label: 'Account' }}
                        category="standard"
                        name={elem.type}
                    />
                ),
            },
        }));
    }

    /**
     * fetching the quiz statuses
     */
    get_applicant_name = (search) => {
        postData("recruitment/RecruitmentInterview/get_applicant_name_search", { search: search, limit: this.state.limit }).then((res) => {
            if (res.data && res.data.applicant_option) {
                this.setState({
                    iconset: []
                });
                var option = res.data.applicant_option;
                // set Icon for list                       
                let accountsWithIcon = this.setIconForList(option);
                this.setState({
                    iconset: accountsWithIcon, showlist: true
                });
            }
        });
    }

    get_application_data_by_applicant_id = (applicant_id) => {
        postData("recruitment/RecruitmentInterview/get_application_data_by_applicant_id", { applicant_id: applicant_id }).then((res) => {
            if (res.data && res.data.applications) {
                this.setState(res.data);
            }
        });
    }

    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value });
    }

    get_job_id = (application_id) => {
        let job_id = '';
        this.state.applications.map((col) => {
            if (col.value == application_id) {
                job_id = col.job_id;
            }
        });
        return job_id;
    }

    /**
     * Call the create and update api when user save quiz
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_update_applicant").validate({ /* */ });
        var url = 'recruitment/RecruitmentInterview/create_update_applicant_interview';
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_update_applicant").valid()) {
            let selected_application_id = this.state.application_id ? this.state.application_id : this.state.applications ? this.state.applications[0].value : '';            
               
            this.setState({ loading: true });
            var req = {
                interview_applicant_id: this.props.selected_data.id ? this.props.selected_data.id : '',
                applicant_id: this.state.selected_applicant_id,
                application_id: selected_application_id,
                job_id: this.get_job_id(selected_application_id),
                interview_id: this.props.interview_id
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

    /**
     * Render To contacts
     * @param {str} label 
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
    renderToComboBox = (label, stateName, valueName) => {
        return (
            <Combobox
                id="combobox-to-contact"
                classNameContainer="combox_box-to-cus dropboxalign"
                events={{
                    onChange: (event, { value }) => {
                        this.setState({ iconset: [] });

                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        if (value) {
                            this.get_applicant_name(value);
                        }
                        this.setState({ [valueName]: value, isLoadingMenuItems: true });
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                        });
                    },
                    onSubmit: (event, { value }) => {  
                        if (this.props.action) {
                            this.props.action('onChange')(event,  value);
                        }
                        if(this.state.iconset.length > 0){
                            this.setState({
                                [valueName]: this.state.iconset[0].label,
                                selected_applicant: this.state.iconset[0], selected_applicant_id: this.state.iconset[0].id,
                                [stateName]: [
    
                                    {
                                        label: this.state.iconset[0].label,
                                        icon: (
                                            <Icon
                                                assistiveText="Account"
                                                category="standard"
                                                name="contact"
                                            />
                                        ),
                                    },
                                ],
                            }, () => {
                                this.get_application_data_by_applicant_id(this.state.iconset[0].id)
                            });
                        }
                       
                    },
                    onSelect: (event, data) => {
                        if (this.props.action) {
                            this.props.action('onSelect')(
                                event,
                                ...Object.keys(data).map((key) => data[key])
                            );
                        }
                        this.setState({
                            [valueName]: data.selection[0].id,
                            [stateName]: data.selection,
                            application_id: ''
                        }, () => {
                            this.get_application_data_by_applicant_id(data.selection[0].id)
                        });

                    },
                }}
                labels={{
                    label: '  ' + label,
                    placeholder: 'Search by name',
                }}
                menuItemVisibleLength={5}
                options={
                        comboboxFilterAndLimit(
                            this.state[valueName],
                            100,
                            this.state.iconset,
                            this.state[stateName],
                        )
                   
                }
                
                selection={this.state[stateName]}
                value={this.state[valueName]}
                variant="inline-listbox"
            />
        );
    }

    /**
     * Render the display content
     */
    render() {
        const styles = css({
            attachment: {
                width: '34px',
                paddingTop: '5px',
                paddingBottom: '3px'
            },
            to_req: {
                color: '#0070d2',
                float: 'left',
                paddingRight: '5px',
                zIndex: 9001,
                border: 'none',
                paddingTop: '4px'
            }
        });
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.headingTxt}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top mt-4 mb-5" >
                            <div className="container-fluid">
                                <form id="create_update_applicant" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element__control">
                                                <div className="SLDS_date_picker_width">                                                   
                                                     <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Applicant</label>
                                                    <input
                                                        type="text"
                                                        name="Application"
                                                        placeholder="Enter Application"
                                                        required={true}
                                                        className="slds-input"
                                                        value={this.state.selected_applicant_name ? this.state.selected_applicant_name : ''}
                                                        disabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Application Number</label>
                                                <div className="slds-form-element__control">
                                                    {this.state.applications && this.state.applications.length > 1 ? <SLDSReactSelect
                                                        simpleValue={true}
                                                        className="custom_select default_validation"
                                                        options={this.state.applications}
                                                        onChange={(value) => this.handleChange(value, 'application_id')}
                                                        value={this.state.application_id || ''}
                                                        clearable={false}
                                                        searchable={false}
                                                        placeholder="Please Select"
                                                        required={true}
                                                        name="application_id"
                                                    /> : <input
                                                            type="text"
                                                            name="Application"
                                                            placeholder="Enter Application"
                                                            required={true}
                                                            className="slds-input"
                                                            onChange={(value) => this.setState({ application_id: value.target.value })}
                                                            value={this.state.applications ? this.state.applications[0].value : ''}
                                                        />}
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

export default CreateApplicantModel;
