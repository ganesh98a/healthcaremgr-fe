import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, css } from 'service/common.js';
import '../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import {
    Modal,
    Button,
    Input,
    IconSettings,
    VerticalNavigation,
    Radio,
    Badge,
    InputIcon
} from '@salesforce/design-system-react';

/**
 * Class: EmailInsertMergeField
 */
class SMSInsertMergeField extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        let participant_field_values = [
            { label: 'Account (Participant/Site) Name', value: 'Account.name' }
        ];
        let shift_field_values = [
            { label: 'Shift Start Date and Time', value: 'Shift.start' },
            { label: 'Shift Address', value: 'Shift.account_address' },
            { label: 'Shift Url', value: 'Shift.url' }
        ];
        let applicant_field_values = [
            { label: 'Applicant First Name', value: 'Applicant.firstname' },
            { label: 'Applicant Last Name', value: 'Applicant.lastname' }
        ];
        this.state = {
            loading: false,
            redirectPage: false,
            shift_field_values: shift_field_values,
            participant_field_values: participant_field_values,
            applicant_field_values: applicant_field_values,
            merge_field_values: applicant_field_values,
            search_merge_field: '',
            selectedMergeTypeId: 'applicant'
        }

    }

    submit = () => {
        this.props.setMergeFieldValus(this.state.checked);
    }

    searchMergeField = (search_value) => {
        let merge_field_value;
        switch (this.state.selectedMergeTypeId) {
            case 'applicant':
                merge_field_value = this.state.applicant_field_values;
                break;
            case 'account':
                merge_field_value = this.state.participant_field_values;
                break;
            case 'shift':
                merge_field_value = this.state.shift_field_values;
                break;
            default:
                merge_field_value = [];
                break;
        }
        if (search_value != '' && merge_field_value) {
            let match_arr = [];
            let item_str = '';
            merge_field_value.map((item) => {
                item_str = item.label;
                item_str = item_str.toLowerCase();
                search_value = search_value.toLowerCase();
                if (item_str.includes(search_value)) {
                    match_arr.push(item);
                }
            });
            merge_field_value = match_arr;
            if (match_arr.length < 1) {
                this.setState({ checked: '' });
            }
        }
        this.setState({ merge_field_values: merge_field_value });
        return false;
    }
    /**
     * Render the display content
     */
    render() {

        const fieldCategories = [
            {
                id: 'reports',
                label: '',
                items: [
                    { id: 'applicant', label: 'Applicant' },
                    { id: 'account', label: 'Account' },
                    { id: 'shift', label: 'Shift' }
                ],
            }
        ];
        const styles = css({
            inputFile: {
                display: 'inline-block',
                border: 'unset',
                lineHeight: 'initial',
                height: 'initial',
                visibility: 'hidden',
                width: '0px',
                padding: '0px',
                marginTop: '0px',
            },
            uploadingCursor: {
                cursor: 'auto',
            },
            btnPadTop: {
                paddingTop: '1.25rem'
            }
        })

        const field_values = this.state.merge_field_values;
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        ref={React.createRef()}
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" id="merge-field-cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading || (this.state.checked ? false : true)} key={1} label="Save" variant="brand" id="merge-field-save" onClick={this.submit} />,
                        ]}
                        heading={this.props.headingTxt}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <div className="slds-col LeadDetailsContentArea">
                                    <div className="slds-grid slds-wrap slds-gutters_x-small">
                                        <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_3-of-12 slds-large-size_3-of-12 slds-p-right_small">
                                            <VerticalNavigation
                                                id="insert-merge-field-nav-ver"
                                                categories={fieldCategories}
                                                selectedId={this.state.selectedMergeTypeId}
                                                onSelect={(event, data) => {
                                                    let merge_field_value = this.state.merge_field_values;
                                                    switch (data.item.id) {
                                                        case 'applicant':
                                                            merge_field_value = this.state.applicant_field_values;
                                                            break;
                                                        case 'account':
                                                            merge_field_value = this.state.participant_field_values;
                                                            break;
                                                        case 'shift':
                                                            merge_field_value = this.state.shift_field_values;
                                                            break;
                                                        default:
                                                            merge_field_value = [];
                                                            break;
                                                    }
                                                    this.setState({ selectedMergeTypeId: data.item.id, merge_field_values: merge_field_value, checked: '' });
                                                }}
                                            />
                                        </div>
                                        <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_9-of-12 slds-large-size_9-of-12">
                                            <div className="row">
                                                {field_values.map((value) => (
                                                    <div className="slds-grid slds-wrap slds-gutters_x-small">
                                                        <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_8-of-12 slds-large-size_8-of-12">
                                                            <Radio
                                                                key={value.value}
                                                                id={value.value}
                                                                labels={{ label: value.label }}
                                                                value={value.value}
                                                                checked={this.state.checked === value.value}
                                                                variant="base"
                                                                onChange={(event) => {
                                                                    this.setState({ checked: event.target.value })
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default (SMSInsertMergeField)
