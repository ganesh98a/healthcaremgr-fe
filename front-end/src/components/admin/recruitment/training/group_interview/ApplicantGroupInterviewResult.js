import React, { Component } from 'react';
import { Link,Redirect } from 'react-router-dom';
import Chart from 'react-google-charts';
import { Tab, Tabs } from 'react-bootstrap';
import { postData, archiveALL, checkLoginWithReturnTrueFalse, getPermission,toastMessageShow } from 'service/common.js';
import { typeOfInterViewResult} from 'service/custom_value_data.js';
import { answerTypeDrpDown } from 'dropdown/recruitmentdropdown.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from '../../../../../config';
const graphDataDefault = [['','pass','fail'],['N/A',0,0]];

//const graphDataDefault = [['','pass','fail'],['N/A',0,0]];
class ApplicantGroupInterviewResult extends Component {

    constructor() {
        super();
        this.state = {
            applicant_phone: '',
            applicant_email: '',
            applicant_address: '',
            applicant_basic_info: [],
            task_info: [],
            question_record: [],
            right_answer_count: 0,
            total_que_count: 0,
            graph_data: [],
            enableCommitBtn:true,
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
    }

    componentDidMount() {
        document.title = "Applicant Group Interview Result"
        this.getApplicantDetail();
        this.getQuestionAnswerDetail();
    }

    getApplicantDetail = () => {
        let taskId = this.props.props.match.params.task_id;
        let applicantId = this.props.props.match.params.id;
        let fetchType = typeOfInterViewResult[this.props.fetchType]  ? typeOfInterViewResult[this.props.fetchType] :'none';
        postData('recruitment/RecruitmentGroupInterview/get_applicant_detail', { applicantId: applicantId, taskId: taskId,type:fetchType }).then((result) => {
            if (result.status) {
                this.setState({
                    applicant_basic_info: (result.basic_info) ? result.basic_info : [],
                    applicant_phone: result.phone,
                    applicant_email: result.email,
                    applicant_address: result.address,
                    task_info: (result.task_info) ? result.task_info : [],
                }, () => { })

                if(result.permission || this.permission.access_recruitment_admin)
                    this.setState({enableCommitBtn:true});
                else
                    this.setState({enableCommitBtn:false});
            }else{
                let url = ROUTER_PATH+'admin/recruitment/dashboard';
                if(this.props.fetchType=='group_interview_result'){
                    url=ROUTER_PATH+'admin/recruitment/group_interview/manage_group_interview';
                    
                }else if(this.props.fetchType=='cabday_interview_result'){
                    url=ROUTER_PATH+'admin/recruitment/manage_cab_day';
                }else{
                    url=ROUTER_PATH+'admin/recruitment/dashboard';
                }
            toastMessageShow('Invalid Requested','e',{'close':()=>{window.location=url;}});
               
            }
        });
    }

    getQuestionAnswerDetail = () => {
        let taskId = this.props.props.match.params.task_id;
        let applicantId = this.props.props.match.params.id;
        let fetchType = typeOfInterViewResult[this.props.fetchType]  ? typeOfInterViewResult[this.props.fetchType] :'none';
        postData('recruitment/RecruitmentGroupInterview/get_question_details', { applicantId: applicantId, taskId: taskId,type:fetchType }).then((result) => {
            if (result.status) {
                this.setState({
                    question_record: result.data,
                    right_answer_count: result.right_ans,
                    total_que_count: result.total_row,
                    graph_data: result.graph_ary
                });
            }
        });
    }

    markApplicantTaskStatus = (e, quiz_status) => { 
        let taskId = this.props.props.match.params.task_id;
        let applicantId = this.props.props.match.params.id;
        let fetchType = typeOfInterViewResult[this.props.fetchType]  ? typeOfInterViewResult[this.props.fetchType] :'none';
        let msgData = fetchType =='group_interview' ? 'Are you sure you want to mark Quiz Status to Pass and Draft Contract should be generated.' :'Are you sure you want to mark Quiz Status to Pass.';
        let msg = (quiz_status == 2) ? 'Are you sure you want to mark Quiz Status to Fail.' : msgData ;
        archiveALL({ applicantId: applicantId, quiz_status: quiz_status, taskId: taskId,type:fetchType }, msg, 'recruitment/RecruitmentGroupInterview/mark_applicant_quiz_status').then((result) => {
            if (result.status) {
               toastMessageShow(result.msg,'s',{'close':()=>{this.getApplicantDetail()}}); 
               this.setState({is_save:true});
            }else{
                toastMessageShow(result.msg,'e'); 
            }
        })
    }

    render() {
        var ary_keys = Object.keys(this.state.question_record);
        var default_key = ary_keys[0];
        let resultClass = this.state.applicant_basic_info.quiz_status>0 ? 'pointer-events-none' :'';
        return (

            <React.Fragment>
            {(this.state.is_save) ? <Redirect to={'/admin/recruitment/'+(this.props.fetchType=='cabday_interview_result' ? 'manage_cab_day':'group_interview/manage_group_interview') }/>:''}

                <div className="row">
                    <div className="col-lg-12 col-md-12 no-pad back_col_cmn-">
                        <Link to={ROUTER_PATH+'admin/recruitment/'+(this.props.fetchType=='cabday_interview_result' ? 'manage_cab_day':'group_interview/manage_group_interview')}>
                            <span className="icon icon-back1-ie"></span>
                        </Link>
                    </div>
                </div>
                {/* row ends */}

                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>
                {/* row ends */}

                <div className='row resInfo_row__ mt-5 border-color-black'>

                    <div className='col-sm-3'>

                        <div className='apli_info2'>
                            <h4><b>{(this.state.applicant_basic_info.applicant_name) ? this.state.applicant_basic_info.applicant_name : 'N/A'}:</b></h4>
                            <h3 className="my-4"> <span>(ID: {(this.state.applicant_basic_info.appId) ? this.state.applicant_basic_info.appId : 'N/A'})</span></h3>
                            <span className={"Def_btn_01 " + ((this.state.applicant_basic_info.task_status && this.state.applicant_basic_info.task_status == 1) ? 'success_btn_01' : (this.state.applicant_basic_info.task_status == 2) ? 'un_success_btn_01' : 'pending_btn_01' )} >{(this.state.applicant_basic_info.task_status && this.state.applicant_basic_info.task_status == 1) ? 'Successful' : (this.state.applicant_basic_info.task_status == 2) ? 'Unsuccessful' : 'Pending'}</span         >
                        </div>

                        <div className='cntct_info cntct_inf2'>
                            <div className="Group_d_1a__">
                                <div className="Group_d_1b__">
                                    <div><b>Applicant Information:</b></div>
                                </div>
                                {(this.state.applicant_phone.phone) ?
                                    <div className="Group_d_1b__">
                                        <div><b>Phone: </b> {this.state.applicant_phone.phone}</div>
                                    </div>
                                    : ''}

                                {(this.state.applicant_email.email) ?
                                    <div className="Group_d_1b__">
                                        <div><b>Email: </b> {this.state.applicant_email.email}</div>
                                    </div> : ''}
                            </div>

                            {(this.state.applicant_address) ?
                                <div className="Group_d_1a__">
                                    <div className="Group_d_1b__">
                                        <div><b>Primary Address:</b></div>
                                    </div>

                                    <div className="Group_d_1b__">
                                        <div>{this.state.applicant_address['full_address']}</div>
                                    </div>
                                </div> : ''}

                        </div>
                    </div>

                    <div className='col-sm-6 bor_left_right border-color-black'>
                        <div className="result_breakdown_01_">
                            <div className="result_graph_DIV_A">
                            <div className="result_graph_TEXT_B">Result Breakdown</div>
                              <Chart
                                    height={'340px'}
                                    chartType="ColumnChart"
                                    loader={<div>Loading Chart</div>}
                                   
                                    data={this.state.graph_data.length > 0 ? this.state.graph_data : graphDataDefault}
                                    options={{
                                        // title: 'Result Breakdown' ,
                                        horizontalAlign: "center",
                                        titleTextStyle: {
                                            color: '333333',
                                            fontName: 'Arial',
                                            fontSize: 22,
                                            text:'red'
                                          },

                                        is3D: true,
                                        chartArea: { width: "80%",},
                                        isStacked: false,
                                        legend:{position:'none'},
                                        backgroundColor: 'none',
                                        colors: ['#01be44', '#f00'],
                                        vAxis: {
                                            gridlines: {
                                                color: 'transparent'
                                            },
                                        },  
                                         
                                    }}
                                    rootProps={{ 'data-testid': '2' }}

                                />
                                 </div>
                      


                            <div className="mt-4"><b>Mark Assessment:</b></div>
                            <div className="mark_assess_01">
                                <div className="mark_assess_01a">{this.state.right_answer_count}/{this.state.total_que_count}</div>

                                <div className="mark_assess_01b align-self-center">
                                {/* console.log(this.state.applicant_basic_info.quiz_status +'---'+ this.state.applicant_basic_info.quiz_status +'---'+ this.permission.access_recruitment_admin +'---'+ this.state.enableCommitBtn) */}
                                    <a className={(this.state.applicant_basic_info.quiz_status == '2') ? 'fail_btn_01b1 active pointer-events-none' : 'fail_btn_01b1 '+resultClass} onClick={(e) => this.state.applicant_basic_info.quiz_status && this.state.applicant_basic_info.quiz_status == '0' && this.state.enableCommitBtn && this.markApplicantTaskStatus(e, 2)}>Fail</a>

                                    <a className={(this.state.applicant_basic_info.quiz_status == '1') ? 'pass_btn_01b2 active pointer-events-none' : 'pass_btn_01b2 '+resultClass} onClick={(e) => this.state.applicant_basic_info.quiz_status && this.state.applicant_basic_info.quiz_status == '0' && this.state.enableCommitBtn && this.markApplicantTaskStatus(e, 1)}>Pass</a>
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className='col-sm-3'>
                        <div className='res_info2D'>
                            <h4><b>{this.props.showTypePage=='group_interview_result' ? 'Group Interview Info' : 'CAB Day Interview Info'}:</b></h4>
                            <ul>
                                <li><b>Date: </b>{(this.state.task_info.date) ? this.state.task_info.date : 'N/A'}</li>
                                <li><b>Staff: </b>{(this.state.task_info.recruiter_name) ? this.state.task_info.recruiter_name : 'N/A'}</li>
                                <li><b>Duration: </b>{(this.state.task_info.duration) ? this.state.task_info.duration : 'N/A'}</li>
                                <li><b>Location: </b>{(this.state.task_info.location) ? this.state.task_info.location : 'N/A'}</li>
                            </ul>

                            <div><b>Overseen by: </b>{(this.state.applicant_basic_info.quiz_status_overseen_by) ? this.state.applicant_basic_info.quiz_status_overseen_by : 'N/A'}</div>

                        </div>
                    </div>
                </div>

                <div className="Questionanswer_tab">
                    {
                        Object.keys(this.state.question_record).length > 0 ?
                            <Tabs defaultActiveKey={default_key} id="uncontrolled-tab-example" >
                                {Object.keys(this.state.question_record).map((key, index) => {
                                    return (
                                        <Tab eventKey={key} title={this.state.question_record[key]['name']} key={index}>
                                            <Questionanswer quiz_status={this.state.applicant_basic_info.quiz_status} fetchType={this.props.fetchType} question_records={this.state.question_record[key]} applicantId={this.props.props.match.params.id} taskId={this.props.props.match.params.task_id} getQuestionAnswerDetail={this.getQuestionAnswerDetail} />
                                        </Tab>
                                    );
                                })}
                            </Tabs>
                            : ''
                    }
                </div>
            </React.Fragment>
        );
    }
}
const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ApplicantGroupInterviewResult);

class Questionanswer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            props_question_records: [],
            loading: false
        }
    }

    componentWillReceiveProps(newProps) {
        this.getDataAndSetInState(newProps);
    }

    componentWillMount() {
        this.getDataAndSetInState();
    }

    getDataAndSetInState = (newProps) => {
        if (this.props.question_records) {
            this.setState({ props_question_records: this.props.question_records.complete_ary }, () => { })
        }

        if (newProps) {
            this.setState({ props_question_records: newProps.question_records.complete_ary }, () => { })
        }
    }

    markAnswer = (e, questionId,form_applicant_id) => {
        let applicantId = this.props.applicantId;
        let taskId = this.props.taskId;
        let fetchType = typeOfInterViewResult[this.props.fetchType]  ? typeOfInterViewResult[this.props.fetchType] :'none';
        
        //if (!this.state.loading)
        {
            let msg = 'Are you sure, you want to mark this answer as '+(e.target.value==1? 'correct':'incorrect')+'?';
            //this.setState({ loading: true }, () => {
            //postData('recruitment/RecruitmentGroupInterview/update_answer', { applicantId: applicantId, questionId: questionId, answer_val: e.target.value, taskId: taskId,type:fetchType }).then((result) => {
                archiveALL({ applicantId: applicantId, questionId: questionId, answer_val: e.target.value, taskId: taskId,type:fetchType,form_applicant_id:form_applicant_id }, msg, 'recruitment/RecruitmentGroupInterview/update_answer').then((result) => {
                if (result.status) {
                    this.props.getQuestionAnswerDetail();
                }else if(!result.status && result.hasOwnProperty('msg')){
                    toastMessageShow(result.msg,'e');
                }
                this.setState({ loading: false });
            });
            //});
        }

    }

    render() {
        return (

            <div className='row resColrow'>
                {(this.state.props_question_records) ?
                    this.state.props_question_records.map((value, idx) => (

                        <div className='col-sm-12 resultColM' key={idx}>
                            <div className='col_100'>
                                <div className='circQues QuesNo__ '>{'Q' + (idx + 1)}</div>
                            </div>


                            {(value.question_type != 4) ?
                                <div className='quesAns_box__ border-color-black Multiple_Choice_div___'>
                                    <div className='row'>

                                        <div className='col-sm-12'>
                                            <h4><b>GI-Q{value.question_id}</b><span className="Mul_choice_bnt__">{(value.question_type) ? answerTypeDrpDown(value.question_type,'viewonly') : ''}</span></h4>
                                            <div className="row">
                                                <div className='col-sm-12 '>

                                                    <div className="row d-flex flew-wrap remove-after-before">
                                                        <div className='col-sm-6 br-1 border-color-black'>

                                                            <div className='qShwcse'>
                                                                <h4 className="mt-0"><b>Question</b></h4>
                                                                <p>{value.question}</p>
                                                            </div>
                                                        </div>
                                                        <div className='col-sm-6 pl-4'>
                                                            <h4  className="mt-0"><b>{(value.question_type) ? answerTypeDrpDown(value.question_type) : ''}:</b></h4>
                                                            <ul className='answrShw'>
                                                                {(value.job_details.serial) ?
                                                                    value.job_details.serial.map((val, idxx) => (
                                                                        <li className={(value.job_details.is_answer[idxx] && value.job_details.is_answer[idxx] == 1) ? 'rightAnswer' : 'wrongAnswer'} key={idxx}>
                                                                            <b>{val}:</b>
                                                                            <span>{(value.job_details.option_value) ? value.job_details.option_value[idxx] : ''}</span>
                                                                        </li>

                                                                    )) : ''}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div className='col-sm-12 '>
                                        <div className='queBxFoot border-color-black d-flex'>
                                            <h4 className="w-50"><b>Created by:</b> {value.created_by}</h4>
                                            <h4 className="w-50">
                                                <span><b>Applicant answer:</b> <b>{value.applicant_answer_key}</b><p ><span>{(value.applicant_answer_val)?value.applicant_answer_val:'N/A'}</span></p></span>
                                            </h4>
                                        </div>
                                    </div>

                                </div>
                                :
                                <div className='quesAns_box__ border-color-black Single_Choice_div___'>
                                    <div className='row'>

                                        {/*answer question_option serial*/}
                                        <div className='col-sm-12'>
                                                <h4><b>GI-Q{value.question_id}</b><span className="Mul_choice_bnt__">{(value.question_type) ? answerTypeDrpDown(value.question_type,'viewonly') : ''}</span></h4>
                                                    <div className='qShwcse'>
                                                        <h4><b>Question</b></h4>
                                                        <p>{value.question}</p>
                                                    </div>                                               
                                            </div>                                       

                                    <div className='col-sm-12 '>
                                        <div className='queBxFoot border-color-black'>
                                            <h4><b>Created by:</b> {value.created_by}</h4>
                                        </div>
                                    </div>
                                    <div className='col-sm-12 '>
                                    <div className="row d-flex AppL_Grop_Footer_set_ remove-after-before">
                                                    <div className="col-lg-6 br-1 border-color-black">
                                                        <div className="Left-Applicant_Answer">

                                                            <div className="w-100">
                                                                <label>Applicant Answer</label>
                                                                <p>{value.applicant_answer}</p>
                                                            </div>

                                                            <div className="App_Answer_btn_">
                                                               
                                                                <label className="mr-2"> 
                                                                    <input type="radio" disabled={this.props.quiz_status>0?true:false} name={'is_ans_correct_' + value.question_id} value="2" corrected="true" onChange={(e) => this.markAnswer(e, value.question_id,value.form_applicant_id)} checked={value.is_correct == 0 ? true : false} />
                                                                    <span></span>
                                                                </label>

                                                                <label className="mr-2">
                                                                    <input type="radio" disabled={this.props.quiz_status>0?true:false} name={'is_ans_correct_' + value.question_id} value="1" corrected="false" onChange={(e) => this.markAnswer(e, value.question_id,value.form_applicant_id)} checked={value.is_correct == 1 ? true : false} />
                                                                    <span></span>
                                                                </label>
                                                            </div>

                                                        </div>

                                                    </div>
                                                    <div className="col-lg-6">
                                                        <label>Answer Key</label>
                                                        <div>
                                                        {value.job_details.answer_key}
                                                        </div>
                                                    </div>
                                                </div>
                                                </div>
                                                </div>
                                    </div>
                            }

                            <div className='col_100'>
                                <div className={value.is_correct == 1 ? 'circQues checkieRe correct' : (value.is_correct == 0) ? 'circQues checkieRe unCorrect' : ''}></div>
                            </div>
                        </div>
                    ))
                    : ''
                }




            </div>
        );
    }
}
const mapStateToProps1 = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps1 = (dispach) => {
    return {

    }
}

connect(mapStateToProps1, mapDispatchtoProps1)(Questionanswer);