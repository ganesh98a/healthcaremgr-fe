import React, { Component } from 'react';
import jQuery from "jquery";
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Button,
    IconSettings,
    Input,
    Timepicker
} from '@salesforce/design-system-react';
import { getActiveStaffDetailData } from '../../actions/RecruitmentAction.js';
import moment from 'moment';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';

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
 * Class: CreateQuizModal
 */
class CreateQuizModal extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        const TIME_FORMAT = 'hh:mm A';
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            title: this.props.quiz ? this.props.quiz.task_name : '',
            owner: '',
            related_to: { label: this.props.application_id, value: this.props.application_id },
            form_template: this.props.quiz ? { label: this.props.quiz.form_name, value: this.props.quiz.form_id } : '',
            quiz_start_date: this.props.quiz ? this.props.quiz.start_datetime : '',
            quiz_end_date: this.props.quiz ? this.props.quiz.end_datetime : '',
            quiz_start_time: this.props.quiz ? this.props.quiz.quiz_start_time : '',
            quiz_end_time: this.props.quiz ? this.props.quiz.quiz_end_time : '',
            time_format: TIME_FORMAT,
            quiz_status: this.props.quiz ? { label: this.props.quiz.status_label, value: this.props.quiz.status } : '',
        }

        // we'll use these refs to fix toggling slds datepicker issues
        this.datepickers = {
            quiz_start_date: React.createRef(),
            quiz_end_date: React.createRef(),
        }
    }

    componentDidMount() {
        this.fetchStaffData();
        this.get_quiz_statuses();
    }

    /**
     * fetching the quiz statuses
     */
    get_quiz_statuses = () => {
		postData("recruitment/RecruitmentQuiz/get_quiz_stage_status", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_options: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * handling the status change event
     */
    handleChange = (value, key) => {
        this.setState({ [key]: value });
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
     * Call the create and update api when user save quiz
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#create_update_quiz").validate({ /* */ });
        var url = 'recruitment/RecruitmentQuiz/create_update_quiz';
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#create_update_quiz").valid()) {

            this.setState({ loading: true });
            var req = {
                quiz_id : this.props.quiz ? this.props.quiz.id : '',
                title: this.state.title,
                owner: this.state.owner ? this.state.owner.value : '',
                related_to: this.state.related_to ? this.state.related_to.value : '',
                form_id: this.state.form_template ? this.state.form_template.value : '',
                applicant_id: this.props.applicant_id ? this.props.applicant_id : this.props.quiz.applicant_id,
                application_id: this.props.application_id,
                quiz_start_date: this.state.quiz_start_date ? moment(this.state.quiz_start_date).format('YYYY-MM-DD') : '',
                quiz_start_time: this.state.quiz_start_time,
                quiz_end_date: this.state.quiz_end_date ? moment(this.state.quiz_end_date).format('YYYY-MM-DD') : '',
                quiz_end_time: this.state.quiz_end_time,
                task_status: this.props.quiz ? this.state.quiz_status : 0
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
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={this.props.quiz_id ? "Edit Quiz" : "New Quiz"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top createlistrole_popup" >
                            <div className="container-fluid">
                                <form id="create_update_quiz" autoComplete="off" className="slds_form">
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
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Start Date</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="SLDS_date_picker_width">
                                                        <Datepicker
                                                            input={<input name="quiz_start_date" />}
                                                            parser={(date) => moment(this.state.quiz_start_date, 'DD/MM/YYYY').toDate()}
                                                            onChange={(event, data) => this.setState({ 
                                                                quiz_start_date: (moment(data.date).isValid() ? moment.utc(data.date): null),quiz_start_time: '12:00 AM' })
                                                                }
                                                            formatter={(date) => { return date ? moment.utc(this.state.quiz_start_date).format('DD/MM/YYYY') : ''; }}
                                                            value={this.state.quiz_start_date || ''}
                                                            relativeYearFrom={0}
                                                            dateDisabled={(data) =>
                                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                            }
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
                                                        required={true}
                                                        name="quiz_start_time"
                                                        id="quiz_start_time"
                                                        menuPosition="relative"
                                                        formatter={(date) => {
                                                            if (date) {
                                                                return moment(date).format(this.state.time_format);
                                                            }
                                                            return null;
                                                        }}
                                                        strValue={this.state.quiz_start_time}
                                                        onDateChange={(date, inputStr) => {
                                                            this.handleChange(inputStr, "quiz_start_time")
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>End Date</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="SLDS_date_picker_width">
                                                        <Datepicker
                                                            input={<input name="quiz_end_date" />}
                                                            parser={(date) => moment(this.state.quiz_end_date, 'DD/MM/YYYY').toDate()}
                                                            onChange={(event, data) => this.setState({ quiz_end_date: (moment(data.date).isValid() ? moment.utc(data.date) : null),quiz_end_time: '11:30 PM' })}
                                                            formatter={(date) => { return date ? moment.utc(this.state.quiz_end_date).format('DD/MM/YYYY') : ''; }}
                                                            value={this.state.quiz_end_date || ''}
                                                            relativeYearFrom={0}
                                                            dateDisabled={(data) =>
                                                                moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                            }
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
                                                        required={true}
                                                        name="quiz_end_time"
                                                        id="quiz_end_time"
                                                        menuPosition="relative"
                                                        formatter={(date) => {
                                                            if (date) {
                                                                return moment(date).format(this.state.time_format);
                                                            }
                                                            return null;
                                                        }}
                                                        strValue={this.state.quiz_end_time}
                                                        onDateChange={(date, inputStr) => {
                                                            this.handleChange(inputStr, "quiz_end_time")
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.props.quiz_id && <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="select-01"><abbr className="slds-required" title="required">* </abbr>Status</label>
                                                <div className="slds-form-element__control" role="none">
                                                    <div className="">
                                                        <SLDSReactSelect
                                                            required={false}
                                                            simpleValue={true}
                                                            className="SLDS_custom_Select default_validation"
                                                            simpleValue={true}
                                                            searchable={false}
                                                            placeholder="Please Select"
                                                            clearable={false}
                                                            options={this.state.status_options}
                                                            onChange={(value) => this.handleChange(value, 'quiz_status')}
                                                            value={this.state.quiz_status || ''}
                                                        />
                                                    </div>
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

export default CreateQuizModal;
