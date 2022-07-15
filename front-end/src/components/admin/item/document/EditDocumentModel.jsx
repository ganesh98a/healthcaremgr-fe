import React, { Component } from 'react';
import jQuery from "jquery";
import Select from 'react-select-plus';
import BlockUi from 'react-block-ui';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, comboboxFilterAndLimit } from 'service/common.js';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    IconSettings,
    Combobox,
    Icon
} from '@salesforce/design-system-react';
import '../../scss/components/admin/item/item.scss';

/**
 * RequestData get the data of member
 * @param {int} documentId
 */
const requestDocumentData = (documentId) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { document_id: documentId };
        postData('item/Document/get_document_data_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }           
        });
    });
};

/**
 * Class: EditDocumentModel
 */
class EditDocumentModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            title: '',
            issue_date_mandatory: false,
            expire_date_mandatory: false,
            reference_number_mandatory: false,
            active: false,
            doc_category_options: [],
            doc_related_to_options: [],
            doc_related_to_selection: [],
            doc_related_to_selection_ids: [],
            mandatory: true,
            document_id: this.props.documentId,
        }
    }

    /**
     * Request Document Data call
     */
    callRedquestDocumentData = () => {
        requestDocumentData(
            this.state.document_id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    title: raData.title,
                    issue_date_mandatory: raData.issue_date_mandatory === '0' ? false : true,
                    expire_date_mandatory: raData.expire_date_mandatory === '0' ? false : true,
                    reference_number_mandatory: raData.reference_number_mandatory === '0' ? false : true,
                    active: raData.active === '0' ? false : true,
                    doc_related_to_selection: raData.doc_related_to_selection,
                    doc_category:  raData.doc_category_id != '' && Number(raData.doc_category_id) !== 0 ? raData.doc_category_id : '',
                    mandatory: (raData.doc_related_to_selection && raData.doc_related_to_selection.length == 0) ? true : false,
                    // doc_related_to_selection_ids: raData.doc_related_to_id,
                })
            }            
        });
    }

    /**
     * Update the state value of input
     * @param {Obj} e
     */
    handleChange = (e) => {
        var state = {};
        state[e.target.name] = !this.state[e.target.name];
        this.setState(state);
    }

    handleDropChange = (value, key) => {
        this.setState({ [key]: value });
    }

    /**
     * Update the state value of Select option
     * @param {Obj} selectedOption
     * @param {str} fieldname
     */
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;

        this.setState(state);
    }

    getOptionForDocumentCategory = () => {
        postData('item/Document/get_document_details', {}).then((result) => {
            if (result.status) {
                this.setState({
					doc_category_options: (result.data.doc_category_options) ? result.data.doc_category_options : [],
                    doc_related_to_options: (result.data.doc_related_to_options) ? result.data.doc_related_to_options : [],
                    //language_options: (res.data.language)?res.data.language:[],
                    //transport_options: (res.data.language)?res.data.transport:[]
				})
            }
        });
    }

    componentDidMount() {
        this.getOptionForDocumentCategory();
        this.callRedquestDocumentData();
    }
    /**
     * Call the create api when user save document
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#update_document").validate({ /* */ });
        var url = 'item/Document/update_document';
        var validator = jQuery("#update_document").validate({ ignore: [] });

        if (this.state.doc_related_to_selection.length === 0) {
            toastMessageShow("Please select related to ", "e");
            return false;
        }
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#update_document").valid()) {

            this.setState({ loading: true });
            var req = {
                ...this.state,
                active: this.state.active ? 1 : 0,
                issue_date_mandatory: this.state.issue_date_mandatory ? 1 : 0,
                expire_date_mandatory: this.state.expire_date_mandatory ? 1 : 0,
                reference_number_mandatory: this.state.reference_number_mandatory ? 1 : 0,
                doc_related_to_selection: this.state.doc_related_to_selection ? this.state.doc_related_to_selection : '',
                doc_category: this.state.doc_category ? this.state.doc_category : '',
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let document_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        document_id = resultData.document_id || '';
                    }
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
            // Validation is failed
            validator.focusInvalid();
        }
    }

     /**
     * Rendering likes, transport and language multi selection boxes
     * @param {str} label
     * @param {str} stateName - selection state
     * @param {str} valueName - value state
     */
    renderCCComboBox = (id, selection_options, stateName, valueName) => {
        return (
            <Combobox
                id={id}
                predefinedOptionsOnly
                disabled={this.props.disabled}
                events={{
                    onChange: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({ [valueName]: value });
                    },
                    onRequestRemoveSelectedOption: (event, data) => {
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                            mandatory : (data.selection.length == 0) ? true : false
                        });

                    },
                    onSubmit: (event, { value }) => {
                        if (this.props.action) {
                            this.props.action('onChange')(event, value);
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: [
                                ...this.state[stateName],
                                {
                                    label: value,
                                    icon: (
                                        <Icon
                                            assistiveText={{ label: 'Account' }}
                                            category="standard"
                                            name="account"
                                        />
                                    ),
                                },
                            ],
                            mandatory : (this.value.length == 0) ? true : false
                        });
                    },
                    onSelect: (event, data) => {
                        if (this.props.action) {
                            this.props.action('onSelect')(
                                event,
                                ...Object.keys(data).map((key) => data[key])
                            );
                        }
                        this.setState({
                            [valueName]: '',
                            [stateName]: data.selection,
                            mandatory: false
                        });

                    },
                }}

                menuMaxWidth="500px"
                menuItemVisibleLength={5}
                multiple
                required={this.state.mandatory}
                options={comboboxFilterAndLimit(
                    this.state[valueName],
                    5,
                    this.state[selection_options],
                    this.state[stateName],
                )}
                selection={this.state[stateName]}
                value={this.state[valueName]}
            />
        );
    }

    /**
     * Render the display content
     */
    render() {
        //var doc_related_to_option = [{ value: "1", label: "Recuirment" }, { value: "2", label: "Member" }]
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"Update Document"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="update_document" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Document Name</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        id="title"
                                                        placeholder=""
                                                        required={true}
                                                        className="slds-input slds-input-readonly"
                                                        onChange={(value) => this.setState({ title: value.target.value})}
                                                        value={this.state.title || ''}
                                                        readOnly={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                                    <abbr className="slds-required" title="required"></abbr>Active</label>
                                                <div className="slds-form-element__control">
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: '',
                                                        }}
                                                        id="active"
                                                        labels={{
                                                            label: '',
                                                        }}
                                                        name="active"
                                                        checked={this.state.active}
                                                        onChange={(value) => this.handleChange(value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01">Document Category</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="">
                                                        <SLDSReactSelect
                                                            simpleValue={true}
                                                            className="custom_select default_validation"
                                                            options={this.state.doc_category_options}
                                                            onChange={(value) => this.handleDropChange(value, 'doc_category')}
                                                            value={this.state.doc_category || ''}
                                                            clearable={true}
                                                            searchable={false}
                                                            placeholder="Please Select"
                                                            name="doc_category"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                        <div className="slds-form-element">
                                        <abbr className="slds-required" title="required">* </abbr>
                                            <label className="slds-form-element__label" htmlFor="select-01">Related to</label>
                                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                    {this.renderCCComboBox("doc_related_to", "doc_related_to_options", "doc_related_to_selection", "doc_related_to_selection_ids")}
                                                </IconSettings>
                                            </div>
                                        </div>
                                        </div>
                                    </div>

                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required"></abbr>Issue Date Mandatory</label>
                                                <div className="slds-form-element__control">
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: '',
                                                        }}
                                                        id="issue_date_mandatory"
                                                        labels={{
                                                            label: '',
                                                        }}
                                                        checked={this.state.issue_date_mandatory}
                                                        name="issue_date_mandatory"
                                                        onChange={(value) => this.handleChange(value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-4">
                                                    <abbr className="slds-required" title="required"></abbr>Expire Date Mandatory</label>
                                                <div className="slds-form-element__control">
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: '',
                                                        }}
                                                        id="expire_date_mandatory"
                                                        labels={{
                                                            label: '',
                                                        }}
                                                        checked={this.state.expire_date_mandatory}
                                                        name="expire_date_mandatory"
                                                        onChange={(value) => this.handleChange(value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required"></abbr>Reference Number Mandatory</label>
                                                <div className="slds-form-element__control">
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: '',
                                                        }}
                                                        id="reference_number_mandatory"
                                                        labels={{
                                                            label: '',
                                                        }}
                                                        checked={this.state.reference_number_mandatory}
                                                        name="reference_number_mandatory"
                                                        onChange={(value) => this.handleChange(value)}
                                                    />
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

export default EditDocumentModel;
