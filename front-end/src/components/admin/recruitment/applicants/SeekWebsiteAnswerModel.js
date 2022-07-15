import React, { Component } from 'react';
import { connect } from 'react-redux'

class SeekWebsiteAnswerModel extends Component {
    render() {
        return (
            <div className={'customModal ' + (this.props.openModel ? ' show' : '')}>
                <div className="cstomDialog widMedium">

                    <h3 className="cstmModal_hdng1--">
                        {this.props.answerType} Answers
                    <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModel}></span>
                    </h3>

                    <div className="modal_body_1_4__ pd_lr_20p">

                        <div><strong>Candidate answers to your questions</strong></div>

                        <div className="ques_ans_Seeks">
                           {this.props.seek.map((val, index) => (
                            <div key={index+1}>
                                <div>
                                    <span className={"ics_Q "+ ((val.answer_status == 1) ? "approve_Q" : "disApprove_Q")}><i className={"icon "+((val.answer_status == 1) ? "icon-accept-approve1-ie": "icon icon-cross-icons")}></i></span>
                                </div>
                                <div className="q_area_14__">
                                    <h5 className="pb_10p"><strong>{val.question}</strong></h5>
                                    <div >{val.answer}</div>
                                </div>
                            </div>
                            ))}
                            
                            {this.props.website.map((val, index) => (
                            <div key={index+1}>
                                <div>
                                    <span className={"ics_Q "+ ((val.answer_status == 1) ? "approve_Q" : "disApprove_Q")}><i className={"icon "+((val.answer_status == 1) ? "icon-accept-approve1-ie": "icon icon-cross-icons")}></i></span>
                                </div>
                                <div className="q_area_14__">
                                    <h5 className="pb_10p"><strong>{val.question}</strong></h5>
                                    <div>{val.answer}</div>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

const mapStateToProps = state => ({
    ...state.RecruitmentApplicantReducer.question_answer,
})

const mapDispatchtoProps = (dispach) => {
    return {
        
    }
};


export default connect(mapStateToProps, mapDispatchtoProps)(SeekWebsiteAnswerModel)