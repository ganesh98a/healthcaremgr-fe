import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { ToastContainer, toast } from 'react-toastify';
import { postData, handleChangeChkboxInput, changeTimeZone, archiveALL, reFreashReactTable, handleChangeSelectDatepicker } from 'service/common.js';
import { questionStatus, answerTypeDrpDown } from 'dropdown/recruitmentdropdown.js';
import { ToastUndo } from 'service/ToastUndo.js'
import BlockUi from 'react-block-ui';
import jQuery from "jquery";
import ReactPlaceholder from 'react-placeholder';
import { custNumberLine, customHeading, closeIcons } from 'service/CustomContentLoader.js';

class AddQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title_heading: 'New Question',
            loading: false,
            is_answer_optional: false,
            is_required: false,
            answer_type: 2,
            trainingCategory: [],
            formOption: [],
            question_category: (this.props.interviewType == 'cabday_question_list') ? 2 : (this.props.interviewType == 'group_question_list') ? 1 : 3,
            answers: [{ 'checked': false, 'value': '', 'lebel': 'A' }, { 'checked': false, 'value': '', 'lebel': 'B' }, { 'checked': false, 'value': '', 'lebel': 'C' }, { 'checked': false, 'value': '', 'lebel': 'D' }],
        }
    }

    componentWillReceiveProps(newProps) {
        var newObj = JSON.parse(JSON.stringify(newProps));
        this.setState({ mode: newObj.mode })

        if (newObj.mode == 'update') {
            this.setState({
                question_id: newObj.question.id,
                answers: newObj.question.answers,
                question_status: newObj.question.status,
                question_category: newObj.question.training_category,
                question_topic: newObj.question.question_topic,
                answer_type: newObj.question.question_type,
                question: newObj.question.question,
            });
        }
    }

    checkAnswerType = (ansType) => {
        var ary_type = [];
        if (ansType == 2)
            ary_type = [{ 'checked': false, 'value': '', 'lebel': 'A' }, { 'checked': false, 'value': '', 'lebel': 'B' }, { 'checked': false, 'value': '', 'lebel': 'C' }, { 'checked': false, 'value': '', 'lebel': 'D' }];
        else if (ansType == 3)
            ary_type = [{ 'checked': false, 'value': 'True', 'lebel': 'A' }, { 'checked': false, 'value': 'False', 'lebel': 'B' }];
        else if (ansType == 4)
            ary_type = [{ 'checked': true, 'value': '', 'lebel': ' Key' }];
        else
            ary_type = [{ 'checked': false, 'value': '', 'lebel': 'A' }, { 'checked': false, 'value': '', 'lebel': 'B' }, { 'checked': false, 'value': '', 'lebel': 'C' }, { 'checked': false, 'value': '', 'lebel': 'D' }];

        return ary_type;
    }

    componentDidMount() {
        this.getTopicList();
        this.getFormOption();
        if (this.props.questionId)
            this.getQuestionDetail(this.props.questionId);
    }

    //get topic list and interview type in this method
    getTopicList = () => {
        postData('recruitment/Recruitment_question/get_recruitment_topic_list', {}).then((result) => {
            if (result.status) {
                this.setState({ topicList: result.data, trainingCategory: result.interview_type_data });
            }
        });
    }

    getFormOption = () => {
        postData('recruitment/Recruitment_question/get_form_option', { category_id: this.state.question_category }).then((result) => {
            if (result.status) {
                this.setState({ formOption: result.data });
            }
        });
    }

    submitquestion = (e) => {
        e.preventDefault();
        var validator = jQuery("#form_question").validate({
            ignore: [],
            focusInvalid: true,
            invalidHandler: function (form, validator) {
                var errors = validator.numberOfInvalids();
                if (errors) {
                    var firstInvalidElement = jQuery(validator.errorList[0].element);
                    jQuery('html,body').scrollTop(firstInvalidElement.offset().top);
                }
            }
        });

        //if (jQuery('#form_question').valid()) 
        if (!this.state.loading && jQuery('#form_question').valid()) {
            this.setState({ loading: true }, () => {
                postData('recruitment/Recruitment_question/insert_update_question', this.state).then((result) => {
                    if (result.status) {
                        this.setState({ loading: false });
                        toast.success(<ToastUndo message={result.msg} showType={'s'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.props.handleAddClose(true);
                    } else {
                        toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        });
                        this.setState({ loading: false });
                    }
                });
            });
        }
    }

    multiple_answer_Change(obj, stateName, index, fieldName, value) {
        if (obj.state.answer_type == 2 || obj.state.answer_type == 3) {
            obj.state.answers.map((value, idx) => {
                var state = {};
                var List = obj.state[stateName];
                List[idx]['checked'] = false
                state[stateName] = List;
                obj.setState(state);
            })
        } else if (obj.state.answer_type == 1) {
            //multiple selection of answer
            obj.state.answers.map((value, idx) => {
                var state = {};
                var List = obj.state[stateName];
                state[stateName] = List;
                obj.setState(state);
            })
        }
        var state = {};
        var List = obj.state[stateName];
        List[index][fieldName] = value
        state[stateName] = List;
        obj.setState(state, () => { });
    }

    selectChange(selectedOption, fieldname) {
        if (fieldname == 'answer_type' && this.state.answer_type != selectedOption) {
            var ary = this.checkAnswerType(selectedOption);
            var old_state = this.state;
            old_state['answers'] = ary;

            this.setState(old_state, () => {
                this.state.answers.map((value, idx) => {
                    var stateName = 'answers';
                    var state = {};
                    var List = this.state[stateName];
                    List[idx]['checked'] = false
                    state[stateName] = List;
                    this.setState(state);
                })
            });
        }


        var state = this.state;
        state[fieldname] = selectedOption;
        this.setState(state, () => { /* console.log(this.state) */ });

        if (fieldname == 'question_category') {
            this.setState({ question_topic: '', is_answer_optional: false,form_id:'' })
            this.getFormOption();
        }
    }

    getQuestionDetail = (questionId) => {
        this.setState({ dataLoading: true, title_heading: 'Edit Question' }, () => {
            postData('recruitment/Recruitment_question/get_question_detail', { questionId: questionId }).then((result) => {
                if (result.status) {
                    this.setState({ dataLoading: false });
                    this.setState(result.data, () => { this.getFormOption() });
                }
            });
        });
    }

    render() {
        return (

            <div className={'customModal ' + (this.props.showadd ? ' show' : ' ')} id='newActionModal'>
                <div className="cstomDialog widBig">
                    <h3 className="cstmModal_hdng1--">
                        {this.state.title_heading}
                        <span className="closeModal icon icon-close1-ie" onClick={() => this.props.handleAddClose(false)}></span>
                    </h3>
                    <form id="form_question" >
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(100, 'left')} ready={!this.state.dataLoading}>
                            <div className="row bor_bot2 pd_b_20 mr_b_20">

                                <div className='col-md-2 w-20-lg'>
                                    <div className="csform-group">
                                        <label>Question ID:</label>
                                        <h3 className='QId'><b>Q{(this.state.question_id) ? ('GI-Q') + this.state.question_id : ''}</b></h3>
                                    </div>
                                </div>

                                <div className="col-md-3 w-20-lg">
                                    <div className="csform-group">
                                        <label>Category:</label>
                                        <div className="cmn_select_dv ">
                                            <span className="required">

                                                <Select className="custom_select default_validation"
                                                    required={true} simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Select Category"
                                                    options={this.state.trainingCategory}
                                                    onChange={(e) => this.selectChange(e, 'question_category')}
                                                    value={this.state.question_category || 2}
                                                    name="question_category"
                                                    inputRenderer={(props) => <input type="text" {...props} name="question_category" readOnly />}
                                                />
                                            </span>

                                        </div>
                                    </div>
                                </div>

                                {(this.state.question_category != 4 && this.state.question_category != 3 && this.state.question_category != 5) ?
                                    <div className='col-md-3 w-20-lg'>
                                        <div className="csform-group ">
                                            <label>Question Topic:</label>
                                            <div className="cmn_select_dv ">
                                                <span className="required">
                                                    <Select className="custom_select default_validation"
                                                        required={true} simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Topic"
                                                        options={this.state.topicList}
                                                        onChange={(e) => this.selectChange(e, 'question_topic')}
                                                        value={this.state.question_topic}
                                                        name="question_topic"
                                                        inputRenderer={(props) => <input type="text" name="question_topic" {...props} readOnly />}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div> : ''}

                                    <div className='col-md-3 w-20-lg'>
                                        <div className="csform-group ">
                                            <label>Form Name:</label>
                                            <div className="cmn_select_dv ">
                                                <span className="required">
                                                    <Select className="custom_select default_validation"
                                                        required={true} simpleValue={true}
                                                        searchable={false} clearable={false}
                                                        placeholder="Select Form"
                                                        options={this.state.formOption}
                                                        onChange={(e) => this.selectChange(e, 'form_id')}
                                                        value={this.state.form_id}
                                                        name="form_id"
                                                        inputRenderer={(props) => <input type="text" name="form_id" {...props} readOnly />}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                <div className="col-md-3 w-20-lg">
                                    <div className="csform-group">
                                        <label>Set Status:</label>
                                        <div className="cmn_select_dv">
                                            <span className="required">
                                                <Select className="custom_select default_validation"
                                                    required={true} simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Set Status"
                                                    options={questionStatus('', '')}
                                                    onChange={(e) => this.selectChange(e, 'question_status')}
                                                    value={this.state.question_status}
                                                    name="question_status"
                                                    inputRenderer={(props) => <input type="text" name="question_status" {...props} readOnly />}
                                                />
                                            </span>

                                        </div>
                                    </div>
                                </div>


                            </div>
                        </ReactPlaceholder>
                        {/* row ends */}

                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(100, 'left')} ready={!this.state.dataLoading}>
                            <div className='row bor_bot2 pd_b_20 ' >
                                <div className="col-md-12">
                                    <div className="csform-group">
                                        <label>Question:</label>
                                        <span className="required">
                                            <textarea className="csForm_control txt_area brRad10 textarea-max-size bl_bor" name="question" value={this.state.question} onChange={(e) => handleChangeChkboxInput(this, e)} data-rule-required="true"></textarea>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ReactPlaceholder>

                        {/* row ends */}
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(50, 'left')} ready={!this.state.dataLoading}>
                            <div className='row'>
                                <div className='col-md-12 mr_b_20 mt-3'>
                                    <h4><b>Answer</b></h4>
                                </div>
                            </div>

                            <div className='row d-flex none-after flex-wrap'>
                                <div className="col-md-3">
                                    <div className="csform-group">
                                        <label className=''>Type:</label>
                                        <div className="cmn_select_dv">
                                            <Select className="custom_select default_validation"
                                                required={true} simpleValue={true}
                                                searchable={false} clearable={false}
                                                placeholder="Select Type"
                                                options={answerTypeDrpDown()}
                                                onChange={(e) => this.selectChange(e, 'answer_type')}
                                                value={this.state.answer_type}
                                                name="answer_type"
                                                inputRenderer={(props) => <input type="text" name="answer_type" {...props} readOnly />}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3 pt-3 align-self-center">
                                    <label className="customChecks publ_sal mr_l_45">
                                        <input type="checkbox" value={this.state.is_answer_optional} name="is_answer_optional" onChange={(e) => this.setState({ is_answer_optional: e.target.checked }, () => {
                                            jQuery('.dev_required').valid()
                                        })} checked={this.state.is_answer_optional == 1?true:false} />
                                        <div className="chkLabs fnt_sm">No Correct answer</div>
                                    </label>
                                </div>

                                <div className="col-md-4 pt-3 align-self-center">
                                    <label className="customChecks publ_sal">
                                        <input type="checkbox" value={this.state.is_required} name="is_required" onChange={(e) => this.setState({ is_required: e.target.checked }, () => {
                                        })} checked={this.state.is_required == 1?true:false} />
                                        <div className="chkLabs fnt_sm">Mandatory Question</div>
                                    </label>
                                </div>

                            </div>
                        </ReactPlaceholder>
                        {/* row ends */}
                        <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={customHeading(100, 'left')} ready={!this.state.dataLoading}>
                            <div className='row multiple_choice_row'>

                                <div className="col-md-12 no-pad">
                                    <div className="col-xs-9">
                                    </div>

                                    {(this.state.answer_type != 4) ?
                                        <div className="col-xs-3 text-center">
                                            <span className={this.state.is_answer_optional?"":'required d-inline'}>
                                                <strong>Correct Answer</strong>
                                            </span>
                                        </div> : ''}

                                </div>

                                {this.state.answers ?
                                    this.state.answers.map((value, idx) => (
                                        <div key={idx} className='col-md-12 no-pad ques_col'>
                                            <div className="col-xs-9">
                                                <div className="csform-group">
                                                    <label className=''>Answer {(this.state.answer_type != 4) ? value.lebel : 'Key'}:</label>
                                                    {
                                                        (this.state.answer_type != 4)?
                                                        <input type="text" name={'int_answer' + idx} className="csForm_control bl_bor" required={idx == 0 || idx == 1?true:false} value={value.value} onChange={(e) => this.multiple_answer_Change(this, 'answers', idx, 'value', e.target.value)} readOnly={(this.state.answer_type == 3)?true:false}/>:

                                                            <textarea name={'text_answer' + idx} className="csForm_control bl_bor dev_required" style={{ minHeight: '70px' }} required={this.state.is_answer_optional ? false : true} onChange={(e) => this.multiple_answer_Change(this, 'answers', idx, 'value', e.target.value)} defaultValue={(value.value) ? value.value : ''} ></textarea>
                                                    }
                                                </div>
                                            </div>

                                            {(this.state.answer_type != 4) ?
                                                <div className='col-xs-3 text-center'>
                                                    <p className="radio_form_control1_ mr_t_30">
                                                        <input type="checkbox" id={'ans_' + idx} className="dev_required"
                                                            name="radio-group"
                                                            checked={value.checked == "1" ? 'checked' : ''}
                                                            onChange={(e) => this.multiple_answer_Change(this, 'answers', idx, 'checked', e.target.checked)}
                                                            required={this.state.is_answer_optional ? false : true}

                                                        />
                                                        <label htmlFor={'ans_' + idx}></label>
                                                    </p>
                                                </div> : ''}
                                        </div>))
                                    : ''}

                            </div>
                        </ReactPlaceholder>
                        <div className='row trnMod_Foot__'>
                            <div className='col-sm-12 no-pad text-right'>
                                <button type="submit" disabled={this.state.loading} onClick={this.submitquestion} className="btn cmn-btn1 create_quesBtn">Save and Create Question</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        )
    }
}
export default AddQuestion;