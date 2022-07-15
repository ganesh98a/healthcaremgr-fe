import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, css } from 'service/common.js';
import '../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import { toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import {
    Modal,
    Button,
    Input,
    IconSettings,
    VerticalNavigation,
    RadioGroup,
    Radio,
    Badge,
    InputIcon
} from '@salesforce/design-system-react';
import moment from "moment";

/**
 * Class: EmailInsertMergeField
 */
class EmailInsertMergeField extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        let recipient_field_values = [
            { label: 'First Name', value: 'Recipient_FirstName', field: [ '(Lead)', '(Contact)' ] },
            { label: 'Last Name', value: 'Recipient_LastName', field: [ '(Lead)', '(Contact)' ] },
            { label: 'Email', value: 'Recipient_Email', field: [ '(Lead)', '(Contact)' ] },
            { label: 'Phone', value: 'Recipient_Phone', field: [ '(Lead)', '(Contact)' ] },
            { label: 'Address', value: 'Recipient_Address', field: [ '(Contact)' ] },
            { label: 'Created By', value: 'Recipient_CreatedBy', field: [ '(Lead)', '(Contact)' ] },
            { label: 'Created Date', value: 'Recipient_CreatedDate', field: [ '(Lead)', '(Contact)' ] }
        ];
        let sender_field_values = [
            { label: 'First Name', value: 'Sender_FirstName', field: [] },
            { label: 'Last Name', value: 'Sender_LastName', field: [] },
            { label: 'Email', value: 'Sender_Email', field: [] }
        ];
        this.state = {
            loading: false,
            redirectPage: false,
            sender_field_values: sender_field_values,
            recipient_field_values: recipient_field_values,
            merge_field_values: recipient_field_values,
            search_merge_field: '',
            selectedMergeTypeId: 'recipient'
        }

    }

    componentDidMount() {

    }
    
    submit = () => {
        this.props.setMergeFieldValus(this.state.checked);
    }

    searchMergeField = (search_value) => {
        let merge_field_value;
        switch (this.state.selectedMergeTypeId) {
            case 'recipient':
                merge_field_value = this.state.recipient_field_values;
                break;
            case 'sender':
                merge_field_value = this.state.sender_field_values;
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
                this.setState({ checked: ''});
            }
        }
        this.setState({ merge_field_values: merge_field_value });
        return false;
    }
    /**
     * Render the display content
     */
    render() {
        
        const sampleReportCategories = [
            {
                id: 'reports',
                label: '',
                items: [
                    { id: 'recipient', label: 'Recipient' },
                    { id: 'sender', label: 'Sender' },
                    { id: 'organization', label: 'Organization' },
                    { id: 'account', label: 'Account' },
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
                                                categories={sampleReportCategories}
                                                selectedId={this.state.selectedMergeTypeId}
                                                onSelect={(event, data) => {
                                                    let merge_field_value = this.state.merge_field_values;
                                                    if (data.item.id && data.item.id === 'recipient') {
                                                        merge_field_value = this.state.recipient_field_values;
                                                    } else
                                                    if (data.item.id && data.item.id === 'sender') {
                                                        merge_field_value = this.state.sender_field_values;
                                                    } else {
                                                        merge_field_value = [];
                                                    }
                                                    this.setState({ selectedMergeTypeId: data.item.id, merge_field_values: merge_field_value, checked: '' });
                                                }}
                                            />
                                        </div>
                                        <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_9-of-12 slds-large-size_9-of-12">
                                            <div className="row mb-2">
                                                <div className="slds-form-element">
                                                    <label className="slds-form-element__label pb-2" >
                                                    Select Merge Field</label>
                                                    <div className="slds-form-element__control">
                                                        <Input
                                                            iconRight={
                                                                <InputIcon
                                                                    assistiveText={{
                                                                        icon: 'Search',
                                                                    }}
                                                                    name="search"
                                                                    category="utility"
                                                                />
                                                            }
                                                            type="text"
                                                            placeholder="Search Recipient merge fields..."
                                                            name="search_merge_field"
                                                            id="search_merge_field"
                                                            onChange={(e) => this.setState({ search_merge_field: e.target.value },() => {
                                                                this.searchMergeField(this.state.search_merge_field);
                                                            })}
                                                            value={this.state.search_merge_field}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
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
                                                        <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_4-of-12 slds-large-size_4-of-12">
                                                        {value.field.map((field_label) => (
                                                            <Badge content={field_label} />
                                                        ))}
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

export default (EmailInsertMergeField)
  