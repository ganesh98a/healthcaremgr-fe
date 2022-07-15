import React, { Component } from 'react';

import { answerTypeDrpDown } from 'dropdown/recruitmentdropdown.js';
import { connect } from 'react-redux'
import { postData, toastMessageShow } from 'service/common.js';
import Select from 'react-select-plus';
import SimpleBar from 'simplebar-react';
import jQuery from "jquery";
import ReactPlaceholder from 'react-placeholder';
import { custNumberLine, customHeading, recruitmentStages, recruitmentSubStage } from 'service/CustomContentLoader.js';


/**
 * @typedef {ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchtoProps> & typeof CreateViewPhoneInterview.defaultProps} Props
 * 
 * @todo Refactor and rename this component so that 
 * - it will work even without applicant & application IDs
 * - rename or extract certain parts into another component because it is getting used by forms, questions, and other stages. 
 * - The name is becoming misleading
 * 
 * @extends {React.Component<Props>}
 */
class CreateViewPhoneInterview extends Component {
    constructor() {
        super();
        this.state = {
            questionList: [],
            form_id: {},
            form_option: [],
            second_form: false,
            reference_details: [],
        }

        /**
         * @type {React.Ref<HTMLFormElement>}
         */
        this.form = React.createRef()
    }

    componentDidMount() {
        if (this.props.interview_status) {
            this.setState({ second_form: true });
            this.getQuestionListAndDetails(this.props.interview_form_id);
        } else {
            this.getFormOptionForFilter();
        }
    }

    selectForm = (value) => {
        this.setState({ form_id: value, second_form: true });
        this.getQuestionListAndDetails(value.value);
    }

    getQuestionListAndDetails = (form_id) => {
        this.setState({ fetchLoading: true });
        var application_id = '';
        if (Array.isArray(this.props.applications)) {
            application_id = (this.props.applications[0] || {})["id"];
        }

        if (this.props.application) {
            application_id = this.props.application.id
        }

        var reqData = { application_id, form_id, applicantId: this.props.applicantId, interview_type: this.props.interview_type, reference_id: this.props.reference_id, interview_applicant_form_id: this.props.interview_applicant_form_id };

        postData('recruitment/RecruitmentForm/get_question_list_and_details', reqData).then((result) => {
            if (result.status) {
                var res = result.data;
                this.setState(res);
            }
            this.setState({ fetchLoading: false });
        });
    }

    getFormOptionForFilter = () => {
        // interview-id of the phone interview needs to be passed
        var req = { interview_type: this.props.interview_type };
        postData('recruitment/RecruitmentForm/get_question_form_option', req).then((result) => {
            if (result.status) {
                var res = result.data;
                this.setState({ form_option: res });
            }
        });
    }

    
    determineModalHeader() {
        if (this.props.interview_type == "phone_interview") {
            return "Phone Interview"
        }

        if (this.props.interview_type == 'job_questions') {
            return "Job questions"
        }
        return this.props.defaultModalHeading
    }


    determineInterviewTypeLabel() {
        if (this.props.interview_type == 'phone_interview') {
            return "Phone Interview ID"
        }

        if (this.props.interview_type == 'job_questions') {
            return 'Job questions ID'
        }

        return this.props.defaultInterviewTypeLabel
    }


    onChangeAnswer = (main_index, answer_index, answer) => {
        var questionList = this.state.questionList;
        var question_type = questionList[main_index]['question_type'];

        if (question_type == 1) {
            var answer_id = questionList[main_index]['answers'][answer_index]['answer_id'];
            var answer_ids = questionList[main_index]['answer_id'];

            if (Array.isArray(answer_ids)) {
                var ind = answer_ids.indexOf(answer_id);
                if (ind < 0) {
                    questionList[main_index]['answer_id'][answer_ids.length + 1] = answer_id;
                } else {
                    questionList[main_index]['answer_id'].splice(ind, 1);
                }
            } else {
                questionList[main_index]['answer_id'] = [answer_id];
            }
        } else if (question_type == 2 || question_type == 3) {
            var answer_id = questionList[main_index]['answers'][answer_index]['answer_id'];
            questionList[main_index]['answer_id'] = [answer_id];
        } else {
            questionList[main_index]['answer_text'] = answer;
        }

        this.setState({ questionList: questionList });
    }

    rendorDefaultAnswer = (question, main_index) => {
        var classNametype = question.question_type == 1 ? "radio_F1 check_F1 mb-0" : "radio_F1 mb-0";
        var type = question.question_type == 1 ? "checkbox" : "radio";

        return <React.Fragment>
            {question.answers.map((val, idxx) => {
                var classNameForAnswer = "non_of_these";
                if (Array.isArray(question.answer_id)) {
                    var ind = question.answer_id.indexOf(val.answer_id);

                    var is_answer_true = false;
                    if (ind >= 0) {
                        is_answer_true = true;
                    }
                    var classNameForAnswer = (val.checked === true && question.is_answer_optional == 0) ? "write_answer" : (question.answer_id == val.answer_id && question.is_answer_optional == 0) ? "wrong_answer" : "non_of_these";
                }

                return <li className={'w-50'} key={idxx}>
                    <span className={'default_answer_v0e1 ' + classNameForAnswer}>{val.label}</span>
                    <label className={'align-self-center ' + classNametype} style={{ width: 'auto' }}>
                        <input checked={is_answer_true}
                            required={question.is_required == 1 ? true : false}
                            type={type} name={question.id}
                            onChange={(e) => this.onChangeAnswer(main_index, idxx, e.target.checked)} />
                        <span className="checkround" ></span>
                        <span className="txtcheck text_2_0_1">{val.value}</span>
                    </label>
                </li>
            })}
        </React.Fragment>
    }

    answerRender = (val, main_index) => {
        switch (val.question_type) {
            case '2':
                return <ul className={ "List_2_ul"}>
                    {this.rendorDefaultAnswer(val, main_index)}
                </ul>;
                break;
            case '3':
                return <ul className={ "List_2_ul"}>
                    {this.rendorDefaultAnswer(val, main_index)}
                </ul>;
                break;
            case '1':
                return <ul className={ "List_2_ul"}>
                    {this.rendorDefaultAnswer(val, main_index)}
                </ul>;
                break;
            case '4':
                return <ul className={ "answrShw"}>
                    <textarea
                        name={val.id}
                        required={val.is_required == 1 ? true : false}
                        onChange={(e) => this.onChangeAnswer(main_index, 0, e.target.value)}
                        value={val.answer_text}
                        maxLength="500"
                        className="w-100"
                    ></textarea>
                </ul>;
                break;
            default:
                return '';
                break;
        }
    }

    submitInterview = (e) => {
        e.preventDefault();
        
        // Refer the form element with react refs instead of IDs because IDs doesn't guarantee 
        // uniqueness as this component is reused in many places
        jQuery(this.form.current).validate();

        if (jQuery(this.form.current).valid()) {
            this.setState({ submitLoading: true });
            var application_id = '';
            if (Array.isArray(this.props.applications)) {
                application_id = this.props.applications[0]["id"];
            }

            if (this.props.application) {
                application_id = this.props.application.id
            }


            var reqData = {reference_id: this.props.reference_id, application_id, applicant_id: this.props.applicantId, question_answers: this.state.questionList, form_id: this.state.form_id.value, interview_type: this.props.interview_type, interview_applicant_form_id: this.props.interview_applicant_form_id }
            postData('recruitment/RecruitmentFormApplicant/submit_interview_form', reqData).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    this.props.closeModel(true);
                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ submitLoading: false })
            });
        }
    }

    rendorFormSelect = () => {
        if (!!this.props.formTitle) {
            return this.props.formTitle
        }

        return <Select name="view_by_status"
            searchable={false}
            clearable={false}
            placeholder="Filter"
            options={this.state.form_option}
            onChange={(e) => this.selectForm(e)}
            value={this.state.form_id}
            className="w-100"
        />
    }

    rendorQuestionList = () => {
        var finalArr = [];
        var columns = [];

        this.state.questionList.map((value, idx) => {
            // prepare the array
            columns.push(
                <div className='col-sm-6 pr_set_lef' key={idx}>
                    {/*<h4><b>{value.view_id}</b><span className="Mul_choice_bnt__">{(value.question_type) ? answerTypeDrpDown(value.question_type) : ''}</span></h4>*/}
                    <div className="row">
                        <div className='col-sm-12 '>
                            <div className="row d-flex flew-wrap remove-after-before">
                                <div className='col-sm-12'>
                                    <div className='qShwcse'>
										{/*<h4 className="mt-0"><b>Question</b></h4>*/}
                                        <p><span className={value.is_required == 1 ? " set_inline_required" : ""}>
                                            {value.question}</span></p>
                                        {this.answerRender(value, idx)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

            if (idx % 2 !== 0 || (idx+1) === this.state.questionList.length) {
                finalArr.push(<div className=' d-flex flex-wrap quesAns_box__  Multiple_Choice_div___ w-100 mb-4' >{columns}</div>);
                columns = [];
            }
        })

        return finalArr;
    }

    /**
     * Determine ID for form. 
     */
    htmlIdAttributeForForm() {
        // No hashtag
        return `submitQuestion-${this.props.interview_type}-${this.props.interview_form_id}`
    }


    render() {

        var job_title = '';
        if (Array.isArray(this.props.applications)) {
            job_title = (this.props.applications[0] || {})["position_applied"];
        }


        return (
            <div className={'customModal Create_view_phone_interview_Modal' + (this.props.openModel ? ' show' : '')}>
                <div className="cstomDialog widMedium">
                    <form id={this.htmlIdAttributeForForm()} ref={this.form}>
                        <h3 className="cstmModal_hdng1--">
                            { this.determineModalHeader() }
                            <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModel}></span>
                        </h3>

                        {!this.state.second_form ?
                            <div className="modal_body_1_4__">
                                <div className="row pb-3">
                                    <div className="col-md-4">
                                        <label>Please select form:</label>
                                        <div className="sLT_gray left left-aRRow w-100">
                                            {this.rendorFormSelect()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="modal_body_1_4__">
                                <div className="py-4 d-grid add_1fr_1fr_1fr">
                                    <div className="py-3 d-grid auto_1fr">
                                        <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">
                                            { this.determineInterviewTypeLabel() }: 
                                        </label>
                                        <div className="f-14 align-self-center">{this.state.id || "N/A"}</div>
                                    </div>
                                    <div className="py-3 d-grid auto_1fr">
                                        <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Form Title: </label>
                                        <div className="f-14 align-self-center w-50 set_select_small req_s1">{this.rendorFormSelect()}</div>
                                    </div>
                                    <div className="py-3 d-grid auto_1fr">
                                        <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Applicant ID: </label>
                                        <div className="f-14 align-self-center">{this.props.appId || "N/A"}</div>
                                    </div>
                                    <div className="py-3 d-grid auto_1fr">
                                        <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Applicant Full Name: </label>
                                        <div className="f-14 align-self-center">{this.props.fullname || "N/A"}</div>
                                    </div>
                                    <div className="py-3 d-grid auto_1fr">
                                        <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Job Title: </label>
                                        <div className="f-14 align-self-center">{job_title || "N/A"}</div>
                                    </div>
                                    <div className="py-3 d-grid auto_1fr">
                                        <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Interviewer: </label>
                                        <div className="f-14 align-self-center">{this.state.completed_by || "N/A"}</div>
                                    </div>
                                    {
                                        this.props.application && (
                                            <div className="py-3 d-grid auto_1fr">
                                                <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Application ID: </label>
                                                <div className="f-14 align-self-center">{this.props.application.id || "N/A"}</div>
                                            </div>
                                        )
                                    }

                                    {this.props.interview_type === "reference_check"?
                                    <React.Fragment>
                                        <div className="py-3 d-grid auto_1fr">
                                            <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Referee Full Name: </label>
                                            <div className="f-14 align-self-center">{this.state.reference_details.name || "N/A"}</div>
                                        </div>
                                        <div className="py-3 d-grid auto_1fr">
                                            <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Referee Email: </label>
                                            <div className="f-14 align-self-center">{this.state.reference_details.email || "N/A"}</div>
                                        </div>
                                        <div className="py-3 d-grid auto_1fr">
                                            <label className="label_2_1_1 mr-0 f-bold text-right mb-0 align-self-center">Referee Phone: </label>
                                            <div className="f-14 align-self-center">{this.state.reference_details.phone || "N/A"}</div>
                                        </div>
                                    </React.Fragment>: ""}
                                </div>



                                <SimpleBar style={{ maxHeight: '430px', overflowX: 'hidden', paddingLeft: '0px', paddingRight: '15px' }} forceVisible={false}>
                                    <div className=''>
                                        <div className='creater_phone_interview_V0e4e'>

                                            {/* <div className='quesAns_box__  Multiple_Choice_div___ w-100'> */}
                                                {this.rendorQuestionList()}
                                            {/* </div> */}
                                        </div>
                                    </div>
                                </SimpleBar>

                                {
                                    this.props.submittable && (
                                        <div>
                                            <div className="bt-1 pt-4 mt-3"></div>
                                            <button loading={this.state.submitLoading} onClick={this.submitInterview} className="button_set0 button_set1">Submit</button>
                                        </div>
                                    )
                                }
                            </div>}
                    </form>
                </div>

            </div>
        );
    }
}

/**
 * @param {{applicantId: any, fullname: any, appId: any, applications: any[] }} ownProps 
 */
const mapStateToProps = (state, ownProps) => ({
    applicantId: state.RecruitmentApplicantReducer.details.id,
    fullname: state.RecruitmentApplicantReducer.details.fullname,
    appId: state.RecruitmentApplicantReducer.details.appId,
    applications: state.RecruitmentApplicantReducer.applications,
    ...ownProps,
})

const mapDispatchtoProps = (dispach) => {
    return {
        
    }
};

CreateViewPhoneInterview.defaultProps = {
    submittable: true,
    defaultModalHeading: 'Reference check',
    defaultInterviewTypeLabel: 'Reference check ID',
    /**
     * @type {boolean|JSX.Element}
     */
    formTitle: false, // `false` means use react-select's <Select/> component
    /**
     * Will be populated as object when application ID is retrievable from URL and if this ID belongs to the applicant
     * @type {object|null}
     */
    application: null,
}


export default connect(mapStateToProps, mapDispatchtoProps)(CreateViewPhoneInterview)