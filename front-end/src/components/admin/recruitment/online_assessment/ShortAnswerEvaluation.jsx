import { Icon, Textarea } from "@salesforce/design-system-react";
import React from "react";
import { COLON } from "./OaConstants.js";
import { ViewLessViewMore, ViewLessViewMoreFormat } from "./ViewLessViewMore";

class ShortAnswerEvaluation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      score_options: [1, 2, 3]
    };
    this.myRef = React.createRef();
  }
  componentDidMount() {
    let score_options = [];
    for (let i = 0; i < +this.props.question.grade + 1; i++) {
      score_options.push({ label: i, value: i });
    }
    this.setState({ score_options });
  }

  render() {
    let question_tag = <React.Fragment />;
    let question_txt = this.props.question.question;
    if (this.props.question.fill_up_formatted_question) {
      question_txt = this.props.question.fill_up_formatted_question;
    }

    if (question_txt && question_txt.length > 200) {
      question_tag = <ViewLessViewMore question={question_txt} />;
    }

    if (question_txt && question_txt.length < 200) {
      question_tag = (
        <div dangerouslySetInnerHTML={{ __html: question_txt }}></div>
      );
    }

    return (
      <>
        <div
          style={{
            marginTop: this.props.index > 0 ? 50 : 0,
            marginBottom: 100
          }}
        >
          <div className="row mt-2">
            <div className="col-sm-10">
              <p>
                <span
                  style={{
                    backgroundColor:
                      this.props.selected_question_for_eval == this.props.index
                        ? "yellow"
                        : "white"
                  }}
                >
                  {this.props.question.is_mandatory && (
                    <abbr className="slds-required" title="required">
                      *{" "}
                    </abbr>
                  )}
                  Question&nbsp;{this.props.question.serial_no}&nbsp;{COLON}
                </span>
                {(this.props.question.not_answered) && (<span style={{color:'red',fontWeight:'bold'}}> Not Answered</span>)}
              </p>
            </div>
            <div
              className="col-sm-2"
              style={{ fontSize: 14, textAlign: "right" }}
            >
              {/* <span  style={{"marginRight":10}} >
                Result&ensp;{COLON}&nbsp;
                {this.props.question.result != null &&(<><span
                  style={{
                    color: this.props.question.result == 1 ? '#02c902' : 'red',
                    fontWeight: 'bold',
                   
                  }}
                >
                  &nbsp;{this.props.question.result == 1 ? 'Correct' : 'Incorrect'}
                </span></>)}
                {this.props.question.result == null &&(<><span>&ensp;&emsp;&emsp;&ensp;&ensp;</span></>)}
              </span> */}

              <span style={{ marginRight: 20 }}>
                Score&ensp;{COLON}&ensp;
                {this.props.question.score != null && (
                  <>
                    {this.props.question.score}
                    {"/"}
                    {this.props.question.grade}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="row mt-2" style={{ border: "1px solid #dadada" }}>
            <div className="col-sm-12 p-2">
              {this.props.question.passage_question && (
                <p
                  className="p-1 mt-1 p-line-height"
                  style={{ textAlign: "justify", textJustify: "inter-word" }}
                >
                  {this.props.question.passage_question.length > 200 && (
                    <ViewLessViewMore
                      question={this.props.question.passage_question}
                      delimeter={Number(this.props.question.answer_type) === 7 ? false : true}
                    />
                  )}
                  {this.props.question.passage_question.length < 200 && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: this.props.question.passage_question
                      }}
                    ></div>
                  )}
                </p>
              )}
              <p className="p-1 mt-1 p-line-height">{question_tag}</p>
              {Number(this.props.question.answer_type) === 4 &&
                this.props.question.suggest_answer && (
                  <>
                    <p className="p-1 mt-2" style={{ fontWeight: "bold" }}>
                      Answer Guidance&ensp;{COLON}&nbsp;
                    </p>
                    <p
                      className="p-1 mt-1 p-line-height"
                      style={{
                        textAlign: "justify",
                        textJustify: "inter-word"
                      }}
                    >
                      <ViewLessViewMoreFormat
                        question={this.props.question.suggest_answer}
                      />
                    </p>
                  </>
                )}
              <p className="p-1 mt-2" style={{ fontWeight: "bold" }}>
                Applicant's Answer&ensp;{COLON}&nbsp;
                {this.props.question.result != null && (
                  <span>
                    <Icon
                      assistiveText={{ label: "check" }}
                      style={{
                        width: 1.25 + "rem",
                        height: 1.25 + "rem"
                      }}
                      className={
                        Number(this.props.question.result) === 1
                          ? "slds_icon_iscorrect"
                          : "slds_icon_iswrong"
                      }
                      variant="error"
                      category="utility"
                      size="xx-small"
                      name={
                        Number(this.props.question.result) === 1
                          ? "check"
                          : "close"
                      }
                    />
                  </span>
                )}
              </p>
              <p
                className="p-1 mt-1 p-line-height"
                style={{ textAlign: "justify", textJustify: "inter-word" }}
              >
                <pre>{this.props.question.answer}</pre>
              </p>

              {this.props.question.options &&
                this.props.question.options.length > 0 && (
                  <p className="p-1 mt-1">
                    <span style={{ fontWeight: "bold" }}>
                      Correct Answer&ensp;{COLON}&ensp;
                    </span>
                    <span>
                      {this.props.question.options.map((val, index) => {
                        return (
                          <span>
                            {val.is_correct === "1"
                              ? index > 0
                                ? " , " + val.option
                                : val.option
                              : ""}
                          </span>
                        );
                      })}
                    </span>
                  </p>
                )}
            </div>
          </div>
          {this.props.question.answer_type == 4 && this.props.question.answer && (
            <div className="row">
              <div className="col-sm-10">
                <Textarea
                  disabled={this.props.assessment_status == 4 ? true : false}
                  label=" "
                  className="slds-textarea text_area_height_100"
                  name={"Option"}
                  value={this.props.question.comments}
                  placeholder="Comment Here"
                  onChange={event => {
                    this.props.shortAnswerCommentsChange(
                      event.target.value,
                      this.props.index
                    );
                  }}
                />
              </div>
              <div className="col-sm-2">
                <div
                  style={{ marginRight: 12, marginLeft: 12, lineHeight: 2.5 }}
                >
                  score (out of {this.props.question.grade}) &nbsp;{COLON}&nbsp;
                </div>

                <form id={"short_answer_grade_" + this.props.index}>
                  <select
                  disabled={this.props.assessment_status == 4 ? true : false}
                  required
                    name="oa_result_eval"
                    id="oa_result_eval"
                    ref={this.myRef}
                    value={this.props.question.score}
                    onChange={() => {
                      this.props.shortAnswerScoreChange(
                        this.myRef.current.value,
                        this.props.index,
                        +this.props.question.grade
                      );
                    }}
                    className="slds-input Select-input decorated"
                  >
                    <option></option>
                    {this.state.score_options.map(val => (
                      <option value={val.value}>{val.label}</option>
                    ))}
                  </select>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
export default ShortAnswerEvaluation;
