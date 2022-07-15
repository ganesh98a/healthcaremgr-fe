import React, { Component } from 'react';
import ReactTable from "react-table";
import jQuery from "jquery";
import ScrollArea from 'react-scrollbar';
import 'react-table/react-table.css'
import { postData, handleShareholderNameChange,toastMessageShow,getPermission,checkLoginWithReturnTrueFalse } from 'service/common.js';

class GroupInterviewQuestionsForApplicant extends React.Component {

    constructor() {
        super();
        this.state = {
            allSelectedQue:[],
            defaultFiltered:[{'questionTopic':0}],
            topic_list:[],
            applicant_name:'',
            selected_question:[],
            selected_que_bucket:[],
            enableCommitBtn:true,
            totalQueCount:0,
            errorInAddRemove:false
        }
        this.selected_category = [];
        this.displayData = [<div id="display-data"><React.Fragment>All Applicant Questions</React.Fragment></div>];
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
    }

    componentDidMount() {  
        document.title = "Applicant Group Interview Addional Questions"
        this.getRecruitmentTopicList();
        this.getApplicantQuestion();
        this.getApplicantSelectedQuestion();
        
    }

    getApplicantQuestion = () => {
        let applicantId = this.props.props.match.params.id;
        let taskId = this.props.props.match.params.task_id;
        //e.preventDefault();
        postData('recruitment/RecruitmentGroupInterview/get_applicant_question', { taskId :taskId, applicantId: applicantId, defaultFiltered: this.state.defaultFiltered }).then((result) => {
            if (result.status) {
                this.setState({ allSelectedQue: result.data, 'applicant_name': result.applicant_name,totalQueCount:result.data.length }, () => {  })
            }
        });
    }

    getApplicantSelectedQuestion = () => {
        let applicantId = this.props.props.match.params.id;
        let taskId = this.props.props.match.params.task_id;
        postData('recruitment/RecruitmentGroupInterview/get_applicant_selected_question', { applicantId: applicantId,taskId:taskId }).then((result) => {
            if (result.status) {
                this.setState({selected_question:result.data},()=>{  
                })              
            }
        });
    }

    getRecruitmentTopicList = () => {
        let applicantId = this.props.props.match.params.id;
        let taskId = this.props.props.match.params.task_id;
        postData('recruitment/RecruitmentGroupInterview/get_recruitment_topic_list', { applicantId: applicantId,taskId:taskId }).then((result) => {
            if (result.status) {
                if(result.permission || this.permission.access_recruitment_admin)
                    this.setState({enableCommitBtn:true});
                else
                    this.setState({enableCommitBtn:false});

                this.setState({topic_list:result.topic_list},()=>{  
                    
                })              
            }
        });
    }

    addRemoveSelected = (e, operationType) => {
        var selected_question = this.state.selected_question;
        let selectedCount = 0;
            this.state.allSelectedQue.map((value_1,index) => {
                if(value_1.temp_selected_add || value_1.selected) 
                selectedCount = selectedCount+1;
            })

       if(selectedCount == this.state.totalQueCount && operationType == 'add'){
            toastMessageShow('You can\'t remove all Questions.', 'w');
       }
        else{
         
            if (operationType == 'add') {

                this.state.allSelectedQue.map((value, idx) => {
                    if (value.temp_selected_add) {
                        var temp_state = {};
                        value.selected = true;
                        value.temp_selected_add = false;
                        selected_question = [...selected_question, value];
                    }
                })           
            }
            else if (operationType == 'remove') {
                var ii = [];
                var selected_question = selected_question.filter((s, sidx) => {
                    if (s.temp_selected_remove !== true) {
                        ii = [...ii, s.id];
                        return s;
                    }
                });  
                this.state.allSelectedQue.map((value, idx) => {
                if(jQuery.inArray( value.id, ii ))
                    value.selected = false;                         
                })                
            }  
            this.setState({selected_question:selected_question},()=>{
            var que_bucket = this.state.selected_question; 

            var temp = [];
            que_bucket.map(function(value,index) {
            temp[value.id] = true;
            })
            this.setState({selected_que_bucket:temp});
            });
        
        }      
    }

    questionChecked = (stateName, index, fieldName, e) => {
        var state = {};
        var List = this.state[stateName];
        List[index][fieldName] = (e.target.checked) ? true : false;
        state[stateName] = List;
        this.setState(state, () => { /* console.log(state) */ });
    }

    commitSaveChanges = (e) => {
        let applicantId = this.props.props.match.params.id;
        let taskId = this.props.props.match.params.task_id;
        postData('recruitment/RecruitmentGroupInterview/commit_n_save_ques', { applicantId: applicantId, selected_que: this.state.selected_question,taskId:taskId }).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, 's');
            } else {
                toastMessageShow(result.msg, 'e');
            }
        });
    }

    selectCategory=(e,index)=>{

        var tempState = this.state.topic_list;
        
        if(e.target.checked){
            this.selected_category.push(e.target.value);
            tempState[index]['selected'] = true;
        }else{ 
            this.selected_category = this.selected_category.filter(function(ele){
                return ele != e.target.value;
            });
            tempState[index]['selected'] = false;
        }
        this.setState({ defaultFiltered: [{ 'questionTopic': this.selected_category }] }, () => {
            this.getApplicantQuestion()
        });

        let myLength = this.state.topic_list.length;
        let selectedCount = 0;
        var topic_list = this.state.topic_list 

        var topic_list1 = topic_list.map((value_1,index) => {
            if(value_1.selected) 
                selectedCount = selectedCount+1;
        })
               
        this.displayData = [];
        if(selectedCount == myLength){
            this.displayData.push(<div id="display-data"><React.Fragment>All Applicant Questions</React.Fragment></div>);
        }
        else{
            let a =[];
           topic_list.map((value, ind) => {
                if(value.selected)
                a[ind] = value.label
           });            
           a = a.filter(Boolean);
           if(typeof a !== 'undefined' && a.length > 0)
           this.displayData.push(<React.Fragment>{a.join(', ')+' Question'}</React.Fragment>)
           else
           this.displayData.push(<div id="display-data"><React.Fragment>All Applicant Questions</React.Fragment></div>);
        }
    }

    //
    checkSelectedCountAnDisableBtn=()=>{
       let selectedCount = 0;
            this.state.allSelectedQue.map((value_1,index) => {
                if(value_1.temp_selected_add || value_1.selected) 
                selectedCount = selectedCount+1;
            })

       if(selectedCount == this.state.totalQueCount)
            toastMessageShow('You can\'t remove all Questions.', 'w');
        else
            this.setState({errorInAddRemove:true},()=>{   });
    }

    render() {

        return (
            <React.Fragment>

                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>  Group Interview Addional Questions </h1>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-lg-12">
                        <div className="Skilled_label1_">{(this.state.applicant_name)}</div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="mb-2 mt-2"><strong>Questions Topic:</strong></div>
                    </div>

                    <div className="col-lg-12">
                        <div className="Checkbox_convet_Button">
                            {(this.state.topic_list).map((value, ind) => (
                                <div key={ind}>
                                    <label>
                                        <input type="checkbox" value={value.value} checked={value.checked} onChange={(e)=>this.selectCategory(e,ind)}/>
                                        <span>{value.label}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-lg-6">
                        <div className="Skilled_label1_">All Question</div>
                        <div className="Skilled_div_01 mt-1">

                            <div>
                            <div className="bb-1 Skilled_label_">
                                <div>
                                       <strong>{this.displayData}</strong> 
                               </div>
                                {(this.state.enableCommitBtn)?
                                <button className="btn cmn-btn1 flag-btn add-btn-z1" onClick={(e) => this.addRemoveSelected(e, 'add')}>Add Selected</button>:''}
                            </div>
                            </div>
                            <div className="cstmSCroll1 ">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    style={{ paddingRight: '15px' }}
                                >
                                    <div className="Req-Group-Interview-Addional-Questions_tBL">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                        <ReactTable
                                            columns={[
                                                {
                                                    Header: "Question ID:", accessor: "id",
                                                    maxWidth: 190,
                                                    Cell: (props) => ( 
                                                        <div className="Question_id_div_">  
                                                            <label className="customChecks publ_sal"><input type="checkbox" checked={(!props.original.selected && props.original.temp_selected_add) || (props.original.selected || this.state.selected_que_bucket[props.original.id] == true)} onChange={(e)=>this.questionChecked('allSelectedQue',props.index,'temp_selected_add',e)}/><div className="chkLabs fnt_sm">{'GI-Q'+props.original.id}</div></label>
                                                            <span className="short_buttons_01">{props.original.topic}</span>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    Header: "Question:",
                                                    accessor: "question",
                                                    Cell: (props) => (
                                                        <div className="text_ellip_2line">
                                                            {props.original.question}
                                                        </div>
                                                    )
                                                },
                                            ]}                                           
                                            minRows={3}
                                            className={'-striped -highlight'}
                                            data={this.state.allSelectedQue}
                                            showPagination={false}
                                            defaultFiltered={this.state.defaultFiltered}
                                        />
                                    </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-6">
                        <div className="Skilled_label1_">Selected Questions</div>
                        <div className="Skilled_div_01 mt-1">

                            <div className="bb-1 Skilled_label_">
                                <div className="mb-0"></div>
                                {(this.state.enableCommitBtn)?
                                <button className="btn cmn-btn1 flag-btn remove-btn-z1" onClick={(e) => this.addRemoveSelected(e, 'remove')}>Remove Selected</button>:''}
                            </div>
                            <div className="cstmSCroll1">
                                <ScrollArea
                                    speed={0.8}
                                    className="stats_update_list"
                                    contentClassName="content"
                                    horizontal={false}
                                    style={{ paddingRight: '15px' }}
                                >
                                     <div className="Req-Group-Interview-Addional-Questions_tBL">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                        <ReactTable
                                            columns={[
                                                {
                                                    Header: "Question ID:", accessor: "id",
                                                    maxWidth: 190,
                                                    Cell: (props) => (
                                                        <div className="Question_id_div_">
                                                            <label className="customChecks publ_sal"><input type="checkbox" onChange={(e)=>this.questionChecked('selected_question',props.index,'temp_selected_remove',e)} checked={props.original.temp_selected_remove}/><div className="chkLabs fnt_sm">{'GI-Q'+props.original.id}</div></label>
                                                            <span className="short_buttons_01 btn_color_ihcyf">{props.original.topic}</span>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    Header: "Question:",
                                                    accessor: "question",
                                                    Cell: (props) => (
                                                        <div className="text_ellip_2line">
                                                            {props.original.question}
                                                        </div>

                                                    )
                                                },
                                            ]}
                                            defaultPageSize={3}
                                            pageSize={10}
                                            minRows={3}
                                            className={'-striped -highlight'}
                                            data={this.state.selected_question}
                                            showPagination={false}
                                        />
                                    </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </div>

                {(this.state.enableCommitBtn)?
                <div className="row text-right mt-2">
                    <div className="col-md-12">
                        <input type="button" className="btn cmn-btn1 crte_svBtn" value="Commit And Changes" onClick={(e) => this.commitSaveChanges(e)} />
                    </div>
                </div>:''}

            </React.Fragment>
        );
    }
}

export default GroupInterviewQuestionsForApplicant;