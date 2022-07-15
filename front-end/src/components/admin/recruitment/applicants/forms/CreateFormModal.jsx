import React, { Component } from 'react';
import jQuery from "jquery";
import Select from 'react-select-plus';
import BlockUi from 'react-block-ui';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData, comboboxFilterAndLimit } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
    Combobox,
    Icon,
    Timepicker,
    Input

} from '@salesforce/design-system-react';
import { getActiveStaffDetailData } from '../../actions/RecruitmentAction.js';
import moment from 'moment';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import { get_start_hour_time, get_end_time } from '../../../oncallui-react-framework/services/common';
import { getFormDetailData } from '../../actions/RecruitmentAction.js';

/**
 * to fetch the roles as user types
 */
const getStaff = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentTaskAction/get_recruiter_listing_for_create_task", { search: e }, 2, 1);
}

/**
 * to fetch the form
 */
const getFormTemplate = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentForm/get_question_form_template", { search: e }, 2, 1);
}

/**
 * to fetch the applications
 */
const getApplications = (e, data) => {
    return queryOptionData(e, "recruitment/RecruitmentForm/get_all_applications", { search: e }, 2, 1);
}

/**
 * Class: CreateFormModal
 */
class CreateFormModal extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        const TIME_FORMAT = 'hh:mm A';
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            title: '',
            owner: '',
            related_to: { label: this.props.application_id, value: this.props.application_id },
            form_template: '',
            form_start_date: moment().format('YYYY-MM-DD'),
            form_end_date: moment().format('YYYY-MM-DD'),
            form_start_time: '',
            form_end_time: '',
            time_format: TIME_FORMAT,
            referred_by: this.props.referred_by
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            form_start_date: React.createRef(),
            form_end_date: React.createRef(),
        }
    }

    componentDidMount() {
        this.fetchStaffData();
        
        let currentDateTime = moment().format('YYYY-MM-DD:HH:mm');
        currentDateTime = currentDateTime.split(':');// here the time is like "16:14"
        let starthr = get_start_hour_time(parseInt(currentDateTime[1]), currentDateTime[2]);
        let endtime = starthr.split(':');// here the time is like "16:14"
        let endhr = get_end_time(endtime[0], endtime[1]);

        if(this.props.form_id){
            this.getApplicantFormById(this.props.form_id);
        }else{
            this.setState({
                form_start_date: currentDateTime[0],
                form_start_time: starthr,
                form_end_date: currentDateTime[0],
                form_end_time: endhr
            });
        }
    }

    /**
     * Call getApplicantFormById
     * param {int} id
     */
     getApplicantFormById = (id) => {
        getFormDetailData(
            id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    title: raData.title,
                    form_template: {label: raData.form_title, value:raData.form_id, interview_type: raData.interview_type},
                    form_start_date: raData.form_start_date,
                    form_start_time: raData.form_start_time,
                    form_end_date: raData.form_end_date,
                    form_end_time: raData.form_end_time,
                });
            }

        });
    }
   

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchStaffData = (state) => {
        getActiveStaffDetailData(
            1,
        ).then(res => {
            this.setState({
                owner: res.data,
            });
        });
    }

    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value });    
        if (key == 'form_start_time') {
            let time = value.split(':');// here the time is like "16:14"
            if(time && time.length == 2){
                let hrminutes = get_end_time(time[0], time[1]);
                this.setState({ form_end_time: hrminutes });
            }else{
                this.setState({ form_end_time: '' });
            }         
        }  
    }

    /**
     * Call the create api when user save document
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_form").validate({ /* */ });
        var url = 'recruitment/RecruitmentForm/create_form';
        var validator = jQuery("#create_document").validate({ ignore: [] });
        if(this.state.form_start_time != '' && (this.state.form_start_date == '' || this.state.form_start_date==null)){
            toastMessageShow('Start date is required','e');
            return false;
        }
        if(this.state.form_end_time != '' && (this.state.form_end_date == '' || this.state.form_end_date==null)){
            toastMessageShow('End date is required','e');
            return false;
        }

        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_form").valid()) {

            this.setState({ loading: true });
            var req = {
                title: this.state.title,
                owner: this.state.owner ? this.state.owner.value : '',
                related_to: this.state.related_to ? this.state.related_to.value : '',
                form_id: this.state.form_template ? this.state.form_template.value : '',
                applicant_id: this.props.applicant_id,
                application_id: this.props.application_id,
                form_start_date: this.state.form_start_date ? moment(this.state.form_start_date).format('YYYY-MM-DD') : '',
                form_start_time: this.state.form_start_time,
                form_end_date: this.state.form_end_date ? moment(this.state.form_end_date).format('YYYY-MM-DD') : '',
                form_end_time: this.state.form_end_time,
                interview_type_id: this.state.form_template ? this.state.form_template.interview_type : '',
                referred_by: this.state.form_template ? this.state.referred_by : '',
                applicant_form_id: this.props.form_id ? this.props.form_id : '',
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let form_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        form_id = resultData.form_id || '';
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
        }
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
                        heading={this.props.form_id ? "Edit Form" : "New Form"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top createlistrole_popup" >
                            <div className="container-fluid">
                                <form id="create_form" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Title</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        placeholder="Enter Title"
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={(value) => this.setState({ title: value.target.value })}
                                                        value={this.state.title || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">Owner</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async clearable={false}
                                                        id="owner"
                                                        className="SLDS_custom_Select default_validation"
                                                        value={this.state.owner}
                                                        cache={false}
                                                        required={false}
                                                        loadOptions={(e) => getStaff(e, [])}
                                                        onChange={(e) => this.setState({ owner: e })}
                                                        placeholder="Please Search"
                                                        name="owner"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Form Templates</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="">
                                                        <SLDSReactSelect.Async
                                                            clearable={false}
                                                            required={true}
                                                            id="form_template"
                                                            className="SLDS_custom_Select default_validation"
                                                            value={this.state.form_template}
                                                            cache={false}
                                                            required={false}
                                                            loadOptions={(e) => getFormTemplate(e, [])}
                                                            onChange={(e) => this.setState({ form_template: e })}
                                                            placeholder="Please Search"
                                                            name="form_template"
                                                            disabled={this.props.form_id ? true : false}
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
                                                    <SLDSReactSelect.Async clearable={false}
                                                        required={true}
                                                        id="related_to"
                                                        className="SLDS_custom_Select default_validation"
                                                        value={this.state.related_to}
                                                        cache={false}
                                                        required={false}
                                                        loadOptions={(e) => getApplications(e, [])}
                                                        onChange={(e) => this.setState({ related_to: e })}
                                                        placeholder="Please Search"
                                                        name="related_to"
                                                        disabled={this.props.form_id ? true : false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01">Start Date</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="SLDS_date_picker_width">
                                                        <Datepicker
                                                            input={<input name="form_start_date" />}
                                                            parser={(date) => moment(this.state.form_start_date, 'DD/MM/YYYY').toDate()}
                                                            onChange={(event, data) => this.setState({
                                                                form_start_date: data && (moment(data.date).isValid() ? moment.utc(data.date) : null),
                                                            })
                                                            }
                                                            formatter={(date) => { return date ? moment.utc(this.state.form_start_date).format('DD/MM/YYYY') : ''; }}
                                                            value={this.state.form_start_date || ''}
                                                            relativeYearFrom={0}
                                                            dateDisabled={(data) =>
                                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                            }
                                                            required={false}
                                                            disabled={this.props.interview_stage_status > 1 ? true : false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control">
                                                    <Timepicker
                                                        label={<span>&nbsp;Start Time</span>}
                                                        stepInMinutes={30}
                                                        required={false}
                                                        name="form_start_time"
                                                        id="form_start_time"
                                                        menuPosition="relative"
                                                        formatter={(date) => {
                                                            if (date) {
                                                                return moment(date).format(this.state.time_format);
                                                            }
                                                            return null;
                                                        }}
                                                        strValue={this.state.form_start_time || ''}
                                                        onDateChange={(date, inputStr) => {
                                                            this.handleChange(inputStr, "form_start_time")
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01">End Date</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="SLDS_date_picker_width">
                                                        <Datepicker
                                                            input={<input name="form_end_date" />}
                                                            parser={(date) => moment(this.state.form_end_date, 'DD/MM/YYYY').toDate()}
                                                            onChange={(event, data) => this.setState({
                                                                form_end_date: data && (moment(data.date).isValid() ? moment.utc(data.date) : null),
                                                            })
                                                            }
                                                            formatter={(date) => { return date ? moment.utc(this.state.form_end_date).format('DD/MM/YYYY') : ''; }}
                                                            value={this.state.form_end_date || ''}
                                                            relativeYearFrom={0}
                                                            dateDisabled={(data) =>
                                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                            }
                                                            required={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control">
                                                    <Timepicker
                                                        label={<span>&nbsp;End Time</span>}
                                                        stepInMinutes={30}
                                                        required={false}
                                                        name="form_end_time"
                                                        id="form_end_time"
                                                        menuPosition="relative"
                                                        formatter={(date) => {
                                                            if (date) {
                                                                return moment(date).format(this.state.time_format);
                                                            }
                                                            return null;
                                                        }}
                                                        strValue={this.state.form_end_time || ''}
                                                        onDateChange={(date, inputStr) => {
                                                            this.handleChange(inputStr, "form_end_time")
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.form_template && this.state.form_template.interview_type == 4 && <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Referred By</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        type="text"
                                                        name="referred_by"
                                                        placeholder="Enter referred by"
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={(value) => this.setState({ referred_by: value.target.value })}
                                                        value={this.state.referred_by || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default CreateFormModal;
