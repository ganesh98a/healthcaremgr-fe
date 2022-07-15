import React, { Component } from 'react';
import jQuery from "jquery";
import _ from 'lodash';
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
    Icon
} from '@salesforce/design-system-react';
import { getFormQuestionListData, getFormDetailData } from '../../actions/RecruitmentAction.js';
import '../../../scss/components/admin/recruitment/applicants/ApplicantForm.scss';

/**
 * Class: QuestionsFormModal
 */
class QuestionsFormModal extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            title: '',
            owner: '',
            related_to: { label: 'APP'+this.props.application_id, value: this.props.application_id},
            form: [],
            form_applicant_id: this.props.form_applicant_id,
            questionList: [],
            pageSize: 9999,
            sorted: '',
            filtered: '',
            page: 0,
        }
    }

    componentDidMount() {
        var form_applicant_id = this.state.form_applicant_id;
        this.getApplicantFormById(form_applicant_id);
        this.fetchFormQuestionData(this.state);        
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
                    form: raData
                });
            }
        });
    }

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchFormQuestionData = (state) => {
        var form_applicant_id = this.state.form_applicant_id;
        this.setState({ loading: true });
        getFormQuestionListData(
            '',
            '',
            form_applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            this.props.form_id
        ).then(res => {
            this.setState({
                questionList: res.rows,
                question_count: res.count,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * Call the create api when user save document
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#submit_form").validate({ /* */ });
        var url = 'recruitment/RecruitmentForm/submit_interview_form';
        var validator = jQuery("#create_document").validate({ ignore: [] });
        
        // Allow only validation is passed
        if (!this.state.loading && jQuery("#submit_form").valid()) {

            this.setState({ loading: true });
            var req = {
                form_id: this.state.form.form_id ? this.state.form.form_id : '',
                applicant_id: this.props.applicant_id,
                application_id: this.props.application_id,
                question_answers: this.state.questionList,
                interview_applicant_form_id: this.state.form_applicant_id,
                notes: this.state.notes,
                form_name: this.props.formTitle
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    if(this.props.page !='Viewall'){
                        this.props.getFieldHistoryItems();
                    }                   
                    this.props.closeModal(true);
                } else {
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        } else {
            // Validation is failed
            // validator.focusInvalid();
        }
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
                    <label className={'align-self-center' +(question.question_type == 1 ? ' chk_bx_Des nocls' : ' radio_bx_Des nocls') + classNametype} style={{ width: 'auto' }}>
                        <input checked={is_answer_true}
                            disabled={(Number(this.state.form.status) === 2 ? true : false)}
                            type={type} name={question.id}
                            onChange={(e) => this.onChangeAnswer(main_index, idxx, e.target.checked)} />
                        <span className={"checkround" + (question.question_type == 1 ? " form-checkbox-quest " : " form-radio-quest ") } ></span>
                        <span className="txtcheck text_2_0_1">{val.value}</span>
                    </label>
                </li>
            })}
        </React.Fragment>
    }

    /**
     * Define Anser type
     * @param {obj} val 
     * @param {int} main_index 
     */
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
                return <ul className={ "answrShw mt-2"}>
                    <textarea
                        name={val.id}
                        readOnly={(Number(this.state.form.status) === 2 ? true : false)}
                        onChange={(e) => this.onChangeAnswer(main_index, 0, e.target.value)}
                        value={val.answer_text}
                        maxLength="500"
                        className="slds-input"
                    ></textarea>
                </ul>;
                break;
            default:
                return '';
                break;
        }
    }

    /**
     * Render Question List
     */
    rendorQuestionList = () => {
        var finalArr = [];
        var columns = [];
        this.state.questionList.map((value, idx) => {
            // prepare the array
            columns.push(
                <div className='col-sm-6 pr_set_lef' key={idx}>
                    <div className="row">
                        <div className='col-sm-12 '>
                            <div className="row d-flex flew-wrap remove-after-before">
                                <div className='col-sm-12'>
                                    <div className='qShwcse'>
                                        <p>
                                            <span className={(value.is_required == 1 ? " set_inline_required" : "" ) + " question-lh"}>
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
                finalArr.push(<div className=' d-flex flex-wrap slds_quesAns_box__  Multiple_Choice_div___ w-100 mb-4' >{columns}</div>);
                columns = [];
            }
        })

        return finalArr;
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
                            <Button disabled={this.state.loading || (Number(this.state.form.status) === 2 ? true : false)} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"Form"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        {this.state.form.interview_type=="4" && <div className="row slds-box" >

                            <div className="col col-sm-4" >
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">Referred By</label>
                                    <div className="slds-form-element__control">{this.state.form.referred_by || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="col col-sm-4">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">Phone</label>
                                    <div className="slds-form-element__control">{(this.state.form.referred_phone ? ("+61 " +this.state.form.referred_phone) : "N/A") || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="col col-sm-4">
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">Email</label>
                                    <div className="slds-form-element__control">{this.state.form.referred_email || 'N/A'}</div>
                                </div>
                            </div>
                        <div className="col col-sm-12" style={{margin: '20px 0px'}}>
                            <label className="slds-form-element__label">Notes</label>
                            <textarea
                                name='notes'
                                readOnly={false}
                                onChange={(e) => this.setState({notes: e.target.value})}
                                value={this.state.notes ? this.state.notes : this.state.form.notes}
                                maxLength="500"
                                className="slds-input"
                            ></textarea>
                            </div>
                        </div> }
                                    

                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="submit_form" autoComplete="off" className="slds_form mb-3">
                                    <div className="mt-3">
                                      {this.rendorQuestionList()}                    
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

export default QuestionsFormModal;
