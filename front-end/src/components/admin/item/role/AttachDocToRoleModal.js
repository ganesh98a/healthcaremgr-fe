import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import Textarea from '@salesforce/design-system-react/lib/components/textarea';
import { checkItsNotLoggedIn, postData, toastMessageShow, handleChangeSelectSLDSISODatePicker, handleShareholderNameChange, css, queryOptionData, handleChange } from 'service/common.js';
import { BASE_URL, REGULAR_EXPRESSION_FOR_AMOUNT } from 'config.js'
import 'react-block-ui/style.css';
import Select from 'react-select-plus'
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { connect } from 'react-redux';
import { SLDSIcon } from '../../salesforce/lightning/SLDS';
import Modal from '@salesforce/design-system-react/lib/components/modal';
import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect.jsx';
// import SLDSISODatePicker from '@salesforce/design-system-react/lib/components/date-picker';
import { SLDSISODatePicker } from '../../salesforce/lightning/SLDSISODatePicker';
import moment from "moment";

const getDocuments = (e, data) => {
    return queryOptionData(e, "item/document/get_document_name_search", { query: e }, 2, 1);
}

class AttachDocToRoleModal extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        checkItsNotLoggedIn();

        this.state = {
            loading: false,
            isSubmitting: false,
            redirectPage: false,
            start_date: '',
            end_date: '',
            role_id: '',
            doc_id: '',
            doc_details: [],
            
            role_obj: this.props.role_details,
            role_doc_id: this.props.role_doc_id,
            mandatory:'',
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {            
            start_date: React.createRef(),
            end_date: React.createRef(),
        }
    }

    /**
     * when the date is changed, setting the specific state variable value
     */
    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState)
    }


    /**
     * tinker with internal Datepicker state to
     * fix calendar toggling issue with multiple datepickers
     */
    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    /**
     * When the form is submmitted, calling backend function to attach document to a role
     */
    onSubmit = (e, state) => {
        e.preventDefault();
        jQuery("#attach_doc").validate({ /* */ });
        this.setState({ validation_calls: true })

        if (!this.state.loading && jQuery("#attach_doc").valid()) {
            this.setState({ loading: true });
            var req = {
                start_date: this.state.start_date ? moment(this.state.start_date).format('YYYY-MM-DD') : '',
                end_date: this.state.end_date ? moment(this.state.end_date).format('YYYY-MM-DD') : '',
                role_id: this.state.role_id,
                id: this.state.role_doc_id,
                mandatory: this.state.mandatory,
                doc_id: this.state.doc_details ? this.state.doc_details.value : '',
                role_obj: this.state.role_obj ? this.state.role_obj.value : ''
            }
            postData('item/document/attach_document_and_role', req).then((result) => {
                if (result.status) {
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.props.hideAttachDocToRoleModal(true);
                } else {
                    toastMessageShow(result.error, "e");
                    this.setState({ loading: false });
                }
            });
        }
    }

    /**
     * fetching the role document details if the modal is opened in the edit mode
     */
    get_role_doc_details = (id) => {
        postData('item/document/get_role_doc_details', { id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.setState({ loading: true });
        if (this.props.role_details.id) {
            this.setState({ role_id: this.props.role_details.id });
        }
        if(this.props.role_doc_id) {
            this.setState({ role_doc_id: this.props.role_doc_id });
            this.get_role_doc_details(this.props.role_doc_id);
        }
        this.setState({ loading: false });
    }

    /**
     * rendering components
     */
    render() {
        return (
            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                <Modal
                    isOpen={this.props.showAttachDocToRoleModal}
                    footer={[
                        <Button label="Cancel" onClick={this.props.hideAttachDocToRoleModal} />,
                        <Button disabled={this.state.loading} label="Save" variant="brand" onClick={this.onSubmit} />,
                    ]}
                    onRequestClose={this.props.hideAttachDocToRoleModal}
                    heading={this.props.pageTitle}
                    className="slds-modal_small"
                    size="small"
                    dismissOnClickOutside={false}
                >

                    <section className="manage_top" >
                    <div className="container-fluid">
                    <form id="attach_doc" autoComplete="off" className="slds_form" onSubmit={e => this.props.onSubmit(e, this.state)} disabled={this.props.disabled}>

                        <div className="row py-1">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Document</label>
                                    <div className="slds-form-element__control">
                                        <div className="">
                                            <SLDSReactSelect.Async clearable={false}
                                                className="SLDS_custom_Select default_validation"
                                                value={this.state.doc_details}
                                                cache={false}
                                                required={true}
                                                loadOptions={(e) => getDocuments(e, [])}
                                                onChange={(e) => this.setState({ doc_details: e })}
                                                placeholder="Please Search"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row py-1">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Start Date</label>
                                    <div className="slds-form-element__control SLDSISODatePicker_100_width">
                                        <SLDSISODatePicker
                                            ref={this.datepickers.start_date} 
                                            placeholder="Start Date"
                                            onChange={this.handleChangeDatePicker('start_date')}
                                            onOpen={this.handleDatePickerOpened('start_date')}
                                            onClear={this.handleChangeDatePicker('start_date')}
                                            value={this.state.start_date}
                                            inputProps={{
                                                name: "start_date",
                                                required: true,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row py-1">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label" htmlFor="select-01">End Date</label>
                                    <div className="slds-form-element__control SLDSISODatePicker_100_width">
                                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                            <SLDSISODatePicker
                                                ref={this.datepickers.end_date} 
                                                placeholder="End Date"
                                                onChange={this.handleChangeDatePicker('end_date')}
                                                onOpen={this.handleDatePickerOpened('end_date')}
                                                onClear={this.handleChangeDatePicker('end_date')}
                                                value={this.state.end_date}
                                                inputProps={{
                                                    name: "end_date",
                                                    required: false,
                                                }}
                                            />
                                        </IconSettings>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row py-1">
                            <div className="col-lg-6 col-sm-6">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label slds-checkbox__label" htmlFor="mandatory">Is Mandatory?</label>
                                    <div className="slds-form-element__control">
                                        <div className="slds-checkbox">
                                        <input type="checkbox" name="mandatory" id="mandatory" onChange={(e) => handleChange(this,e)} checked={(this.state.mandatory && this.state.mandatory=='1')?true:false}/>
                                        <label className="slds-checkbox__label" htmlFor="mandatory">
                                            <span className="slds-checkbox_faux"></span>
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
export default connect(mapStateToProps, mapDispatchtoProps)(AttachDocToRoleModal);