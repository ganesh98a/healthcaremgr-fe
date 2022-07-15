// @ts-nocheck
import {
  Button,
  Icon,
  IconSettings,
  PageHeader,
  PageHeaderControl
} from "@salesforce/design-system-react";
import jQuery from "jquery";
import { default as React } from "react";
import { Redirect, Link } from "react-router-dom";
import { ROUTER_PATH } from "config.js";
import { postData ,AjaxConfirm} from "service/common.js";
import { css } from "../../../../service/common";
import QuestionResult from "./QuestionResult";
import ShortAnswerEvaluation from "./ShortAnswerEvaluation.jsx";
import FillUpQuestionEvaluation from "./FillUpQuestionEvaluation.jsx";
import { EMPTY_SPACE, COLON, BLUR, CHANGE } from "./OaConstants.js";
import { toast } from "react-toastify";
import { ToastUndo } from "service/ToastUndo.js";
import moment from "moment";
class AssessmentEvaluation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assessment_id: this.props.props.match.params.assessment_id,
      application_id: this.props.props.match.params.application_id,
      question_answers_list: [],
      loading: true,
      print_btn: false,
      selected_question_for_eval: null
    };

    this.rootRef = React.createRef();
    this.reactTable = React.createRef();
  }

  componentDidMount() {
    jQuery(this.rootRef.current)
      .parent(".col-lg-11")
      .removeClass("col-lg-11")
      .addClass("col-lg-12");
    if (this.state.assessment_id) {
      this.setState({ loading: true });
      this.getTemplateData();
    }
  }

  /**
   * Short Answer score change handler
   */
  shortAnswerScoreChange = (score, index, maxScore) => {
    console.log(score, index, maxScore);
    let question_answers_list = this.state.question_answers_list;
    let question = question_answers_list[index];
    question.score = +score;
    let result = (score==maxScore) ? 1:score > 0 ? 2 :score == 0 ?0:'';
      this.setState({ ...question_answers_list }, () => {
        this.calculateTotalGradeandScore();
        this.shortAnswerResultChange(result,index);
      });
    /* let question_answers_list = this.state.question_answers_list;
    let question = question_answers_list[index];
    if (score <= maxScore && +score >= 0 && score != "") {
      question.score = +score;
      let result = (score==maxScore) ? 1:score > 0 ? 2 :score == 0 ?0:'';
      this.setState({ ...question_answers_list }, () => {
        this.calculateTotalGradeandScore();
        this.shortAnswerResultChange(result,index);
      });
    } else {
      question.score = event_type == BLUR ? 0 : null;
      this.setState({ ...question_answers_list }, () => {
        this.calculateTotalGradeandScore();
        this.shortAnswerResultChange(0,index);
      });
    } */
  };

  /**
   * Short Answer result change handler
   */
  shortAnswerResultChange = (result, index) => {
    let question_answers_list = this.state.question_answers_list;
    question_answers_list[index]["result"] = result;
    this.setState({ ...question_answers_list }, () => {
      console.log(this.state.question_answers_list[index], "questionresult");
     // this.calculateTotalGradeandScore();
    });
  };

  /**
   *
   * @param {answer_list} comments
   * @param {answer_type} index
   */
  filterAnswerByType = answer_type => {
    let question_answers_list = this.state.question_answers_list;
    const short_answers_list = question_answers_list
      .map((val, ind) => {
        if (val.answer_type == answer_type) {
          return ind;
        }
      })
      .filter(item => item !== undefined && item !== null);
    this.setState({ short_answers_list });
  };

  /**
   * Short Answer recruiter comment change handler
   */
  shortAnswerCommentsChange = (comments, index) => {
    let question_answers_list = this.state.question_answers_list;
    question_answers_list[index]["comments"] = comments;
    this.setState({ ...question_answers_list });
  };
  /**
   *
   * @returns void
   */
  cancelEvaluation = () => {
    /**
     * @todo:need to have AJAX request for confirmation
     */
    this.props.props.history.goBack();
  };

  /**
   *
   * @returns filtered CRP type questions
   */

  filterOutCRPQuestion = question_answers_list => {
    const result = question_answers_list.filter(val => val.answer_type != 5);
    const result_id_list = result
      .map(val => {
        return val.id;
      })
      .filter(val => val);
    const parent_passage_list = question_answers_list.filter(
      val => val.answer_type == 5
    );
    const questions_with_parent_id = question_answers_list.filter(
      val => val.parent_question_id > 0
    );
    if (questions_with_parent_id && questions_with_parent_id.length > 0) {
      parent_passage_list.forEach((item, index) => {
        const first_question = questions_with_parent_id.find(
          val => val.parent_question_id == item.id
        );
        const insert_parent_id_index = result_id_list.indexOf(
          first_question.id
        );
        result[insert_parent_id_index]["passage_question"] = item.question;
      });
    }

    this.setState({ question_answers_list: result }, () => {
      this.filterAnswerByType(4);
      this.formatAssessmentDateandTime();
      this.calculateTotalGradeandScore();
    });
  };

  /**
   *
   */
  saveAssessmentResult = () => {
    let valid_status = true;
   /*  this.state.short_answers_list.forEach(val => {
      if (!jQuery(`#short_answer_grade_${val}`).valid()) {
        valid_status = false;
      }
       if (!jQuery(`#short_answer_result_${val}`).valid()) {
        valid_status = false;
      } 
    }); */
    if (!valid_status) {
      toast.error(
        <ToastUndo
          message={
            "Not all the answers are evaluated. Please save after evaluating all the answers."
          }
          showType={"e"}
        />,
        {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true
        }
      );
      return;
    }
    const msg = `Please note that you will not be able to change the grading once it is completed. Are you sure you want to continue?`;
    const confirmButton = `Yes`;
    const post_data = {
      question_answers_list: this.state.question_answers_list,
      assessment_details: this.state.assessment_details,
      grade: this.state.grade,
      score: this.state.score,
      percentage: +this.state.percentage,
      applicant_name: this.state.applicant_name,
      admin_name: this.state.admin_name
    }
    AjaxConfirm(post_data, msg, `recruitment/OnlineAssessment/save_oa_results_from_recruiter`, { confirm: confirmButton, heading_title: `Complete Grading` }).then(result => {
      if (result.status) {
        this.setState({ loading: false, assessment_status: 4 });
        toast.success(<ToastUndo message={result.msg} showType={"s"} />, {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true
        });
        this.getTemplateData();
      } else {
        this.setState({ loading: false });
        if(result.msg)
        {
          toast.error(<ToastUndo message={result.msg} showType={"e"} />, {
            position: toast.POSITION.TOP_CENTER,
            hideProgressBar: true
          });
        }
      }
  })
  };
  /**
   * retrieving the template
   */
  getTemplateData() {
    postData("recruitment/Recruitment_oa_template/retrieve_oa_template", {
      assessment_id: this.state.assessment_id,
      application_id: this.state.application_id
    }).then(result => {
      if (result.status) {
        this.setState(
          {
            question_answers_list: result.data.question_answers_list,
            assessment_details: result.data.assessment_details,
            job_title: result.data.assessment_details.title,
            assessment_status: result.data.assessment_details.status,
            applicant_id: result.data.assessment_details.applicant_id,
            job_id: result.data.assessment_details.job_id,
            applicant_name: result.data.assessment_details.applicant_name,
            admin_name: result.data.assessment_details.admin_name
          },
          () => {
            this.filterOutCRPQuestion(result.data.question_answers_list);
          }
        );
      } else {
        toast.error(<ToastUndo message={result.msg} showType={"e"} />, {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true
        });
        this.setState({ loading: false });
        /**
         * @todo:once result list page is ready - redirect
         */
      }
    });
  }

  /**
   * Generate & download pdf
   */
  generatePdf = () => {
    this.setState({ print_btn: true });
    postData("recruitment/OnlineAssessment/print_online_assessment", {
      job_assessment_id: this.state.assessment_id,
      application_id: this.state.application_id
    }).then(result => {
      if (result.status) {
        let msg = result.msg;
        toast.success(<ToastUndo message={msg} showType={"s"} />, {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true
        });
        let url = result.data;
        window.open(url, "_blank");
      } else {
        toast.error(<ToastUndo message={result.error} showType={"e"} />, {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true
        });
      }
      this.setState({ print_btn: false });
    });
  };

  /**
   * format assessment date and time
   */

  formatAssessmentDateandTime() {
    //moment(this.state.scheduled_start_date).format('YYYY-MM-DD')
    let shared_on = moment(this.state.assessment_details.created_at).format(
      "MM/DD/YYYY"
    );
    let completed_on = moment(
      this.state.assessment_details.completed_date_time
    ).format("MM/DD/YYYY");
    let start_time = moment(
      this.state.assessment_details.start_date_time.split(" ")[1],
      ["hh:mm:ss"]
    ).format("hh:mm A");
    let end_time = moment(
      this.state.assessment_details.completed_date_time.split(" ")[1],
      ["hh:mm:ss"]
    ).format("hh:mm A");
    let duration = this.state.assessment_details.duration;
    let application_id = this.state.assessment_details.application_id;
    this.setState({
      shared_on,
      completed_on,
      start_time,
      end_time,
      duration,
      application_id
    });
  }

  /**
   *
   * @returns total calculation
   */
  calculateTotalGradeandScore() {
    const grade = this.state.question_answers_list.reduce(
      (previousValue, currentValue) => {
        return +previousValue + +currentValue.grade;
      },
      0
    );
    const score = this.state.question_answers_list.reduce(
      (previousValue, currentValue) => {
        return +previousValue + +currentValue.score;
      },
      0
    );

    const percentage = ((score / grade) * 100).toFixed(2);
    this.setState({ grade, score, percentage, loading: false });
  }

  getFormattedResult() {
    return ` ${this.state.score} / ${this.state.grade} (${this.state.percentage}  % )`;
  }

  getFormattedTitle() {
    return ` ${this.state.applicant_name} online assessment for ${this.state.job_title}  `;
  }

  getAssessmentStatus () {
    let status;
    switch (this.state.assessment_status) {
      case '3':
        status = 'Submitted';
        break;
      case '4':
        status = 'Completed';
        break;
      case '8':
        status = 'Session Expired';
        break;
      default:
        status = 'N/A';
        break;
    }
   
    return status;
  }
  /*  `admin/recruitment/application_details/${applicant_id}/${parseInt(application_id)}` */
  /**
   * Renders the page header
   */
  renderPageHeader() {
    return (
      <PageHeader
        details={[
          {
            label: "Related to",
            content: (
              <Link
                id="btn-new"
                style={{ color: "#0070d2" }}
                to={
                  ROUTER_PATH +
                  `admin/recruitment/application_details/${this.state.applicant_id}/${this.state.application_id}`
                }
              >
                {this.state.application_id}
              </Link>
            )
          },
          {
            label: "Shared on",
            content: moment(this.state.shared_on).format("DD/MM/YYYY")
          },
          {
            label: "Completed on",
            content: moment(this.state.completed_on).format("DD/MM/YYYY")
          },
          {
            label: "Status",
            content: this.getAssessmentStatus()
          },
          {
            label: "Start Time",
            content: this.state.start_time
          },
          {
            label: "End Time",
            content: this.state.end_time
          },
          {
            label: "Duration",
            content: `${this.state.duration}`
          },
          {
            label: "Grade",
            content: this.getFormattedResult()
          }
        ]}
        icon={
          <Icon
            assistiveText={{ label: "Online Assessment" }}
            category="standard"
            name={`record_update`}
          />
        }
        label={`Online Assessment`}
        title={this.getFormattedTitle()}
        variant="record-home"
        onRenderActions={this.actions}
      />
    );
  }

  questionNavigation = (index,maxIndex) => {
    let scrollTop = document.documentElement.getElementsByClassName(
      `question_block_${index}`
    )[0].offsetTop;
   /*  if(maxIndex==index){
      scrollTop+=75;
    } */
    scrollTop+=10;
    document.documentElement
      .getElementsByClassName("question-set-scoll")[0]
      .scrollTo(0, scrollTop - 20);
    this.setState({ selected_question_for_eval: index });
  };

  /**
   * Action renderer for `<PageHeader />`
   */
  actions = () => {
    return (
      <React.Fragment>
        <PageHeaderControl>
          { (this.state.assessment_status == 3 || this.state.assessment_status == 8)&& (
            <Button
              label="Complete Grading"
              title={`Complete Grading`}
              disabled={this.isAllAnswersEvaluated()}
              onClick={this.saveAssessmentResult}
            />
          )}
          <Button
            label="Print"
            title={`Print`}
            disabled={this.state.print_btn}
            onClick={() => {
              this.generatePdf();
            }}
          />
        </PageHeaderControl>
      </React.Fragment>
    );
  };

  /**
   * When component is mounted, remove replace the parent element's
   * classname `col-lg-11` and replace it with `col-lg-12` to fix the extra margin
   */
  componentWillMount() {
    jQuery(this.rootRef.current)
      .parent(".col-lg-11")
      .removeClass("col-lg-11")
      .addClass("col-lg-12");
    jQuery("body").css("overflow", "hidden");
  }

  /**
   *
   * @returns check all answers evaluated
   * 
   */
  isAllAnswersEvaluated=()=>{
    const check_non_evaluated = this.state.question_answers_list.find((val)=>val.result == null);
    console.log(check_non_evaluated,'check_non_evaluated')
    return  check_non_evaluated ? true:false;
  }
  
  render() {
    const styles = css({
      root: {
        fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
        marginRight: -15,
        fontSize: 13
      }
    });

    if (this.state.loading) {
      return <></>;
    }
    return (
      <>
        <div
          className="ServiceAgreementDetails slds assessment_eval"
          style={styles.root}
          ref={this.rootRef}
        >
          <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
            {this.renderPageHeader()}
          </IconSettings>
          <div
            className="slds-col slds-m-top_medium"
            style={{ position: "relative", top: 110, "z-index": 100 }}
          >
            <div className="slds-grid ">
              <div className="slds-col slds-size_12-of-12">
                <div className="row">
                  <div
                    className="col-xl-3 col-xs-3 white_bg_color slds-box"
                    style={{
                      height: 450,
                      overflow: "auto"
                    }}
                  >
                    <div className="row">
                      <h2 style={{ fontWeight: "bolder", fontSize: 14 }}>
                        Assessment Overview
                      </h2>
                    </div>
                    <div
                      className="row"
                      style={{ fontWeight: "600", fontSize: 11 }}
                    >
                      <div className="col-xs-12">
                        <span style={{ marginRight: 10 }}>
                          <span
                            style={{ background: "green" }}
                            className="answer-link_indication"
                          ></span>{" "}
                          - Correct
                        </span>
                      </div>
                      <div className="col-xs-12">
                        <span style={{ marginRight: 10 }}>
                          <span
                            style={{ background: "red" }}
                            className="answer-link_indication"
                          ></span>{" "}
                          - Incorrect
                        </span>
                      </div>
                      <div className="col-xs-12">
                        <span style={{ marginRight: 10 }}>
                          <span
                            style={{ background: "orange" }}
                            className="answer-link_indication"
                          ></span>{" "}
                          - Partially Correct
                        </span>
                      </div>
                      <div className="col-xs-12">
                        <span>
                          <span
                            style={{ background: "grey" }}
                            className="answer-link_indication"
                          ></span>{" "}
                          - To be marked
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      {this.state.question_answers_list.map(
                        (question, index) => (
                          <span
                            key={index}
                            onClick={() => this.questionNavigation(index,this.state.question_answers_list.length-1)}
                            style={{
                              cursor:
                                this.state.selected_question_for_eval != index
                                  ? "pointer"
                                  : "default",
                              pointerEvents:
                                this.state.selected_question_for_eval != index
                                  ? "all"
                                  : "none",
                              background:
                                question.result == 0
                                  ? "red"
                                  : question.result == 1
                                  ? "green"
                                  : question.result == 2
                                  ? "orange"
                                  : "null"
                            }}
                            className={
                              this.state.selected_question_for_eval == index
                                ? "selected-question"
                                : "answer-link"
                            }
                          >
                            {question.serial_no}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="col-xl-9 col-xs-9">
                    <div
                      className="white_bg_color slds-box question-set-scoll"
                      style={{
                        height: 450,
                        overflowX: "hidden",
                        overflowY: "scroll"
                      }}
                    >
                      <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <div className="row">
                          <p className="p-2">Questions&ensp;and&ensp;Answers</p>
                        </div>
                        {this.state.question_answers_list.map(
                          (question, index) => (
                            <>
                              <div className={`question_block_${index}`}>
                                {question.answer_type < 4 && (
                                  <QuestionResult
                                    index={index}
                                    question={question}
                                    selected_question_for_eval={
                                      this.state.selected_question_for_eval
                                    }
                                  />
                                )}
                                {(question.answer_type == 4 || question.answer_type == 7)&& (
                                  <ShortAnswerEvaluation
                                    shortAnswerScoreChange={
                                      this.shortAnswerScoreChange
                                    }
                                    shortAnswerResultChange={
                                      this.shortAnswerResultChange
                                    }
                                    shortAnswerCommentsChange={
                                      this.shortAnswerCommentsChange
                                    }
                                    index={index}
                                    question={question}
                                    assessment_status={
                                      this.state.assessment_status
                                    }
                                    selected_question_for_eval={
                                      this.state.selected_question_for_eval
                                    }
                                  />
                                )}
                                {question.answer_type == 6 && (
                                  <FillUpQuestionEvaluation
                                    shortAnswerScoreChange={
                                      this.shortAnswerScoreChange
                                    }
                                    shortAnswerResultChange={
                                      this.shortAnswerResultChange
                                    }
                                    shortAnswerCommentsChange={
                                      this.shortAnswerCommentsChange
                                    }
                                    index={index}
                                    question={question}
                                    assessment_status={
                                      this.state.assessment_status
                                    }
                                    selected_question_for_eval={
                                      this.state.selected_question_for_eval
                                    }
                                  />
                                )}
                              </div>
                            </>
                          )
                        )}
                      </IconSettings>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default AssessmentEvaluation;
