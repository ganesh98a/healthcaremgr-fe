import { Input, Textarea,Icon } from '@salesforce/design-system-react'
import { CorrectOrNotOption } from 'dropdown/recruitmentdropdown.js'
import React ,{useEffect }from 'react';
import jQuery from "jquery";
import SelectList from '../../oncallui-react-framework/input/SelectList'
import {EMPTY_SPACE,COLON,QUESTION_MARK} from './OaConstants.js';
import { ViewLessViewMore } from './ViewLessViewMore';

const red_icon_svg=`<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
width="20px" height="20px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" xml:space="preserve">
<path fill="red" d="M31,25.4L44,12.3c0.6-0.6,0.6-1.5,0-2.1L42,8.1c-0.6-0.6-1.5-0.6-2.1,0L26.8,21.2c-0.4,0.4-1,0.4-1.4,0
L12.3,8c-0.6-0.6-1.5-0.6-2.1,0l-2.1,2.1c-0.6,0.6-0.6,1.5,0,2.1l13.1,13.1c0.4,0.4,0.4,1,0,1.4L8,39.9c-0.6,0.6-0.6,1.5,0,2.1
l2.1,2.1c0.6,0.6,1.5,0.6,2.1,0L25.3,31c0.4-0.4,1-0.4,1.4,0l13.1,13.1c0.6,0.6,1.5,0.6,2.1,0l2.1-2.1c0.6-0.6,0.6-1.5,0-2.1
L31,26.8C30.6,26.4,30.6,25.8,31,25.4z"/>
</svg>`;
const green_icon_svg =  `<span style="margin-left:10px;margin-right:5px"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
width="20px" height="20px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" xml:space="preserve"><g>
<path fill="green" d="M19.1,42.5L2.6,25.9c-0.6-0.6-0.6-1.6,0-2.2l2.2-2.2c0.6-0.6,1.6-0.6,2.2,0L19.4,34c0.4,0.4,1.1,0.4,1.5,0 L45.2,9.5c0.6-0.6,1.6-0.6,2.2,0l2.2,2.2c0.6,0.6,0.6,1.6,0,2.2L21.3,42.5C20.7,43.2,19.7,43.2,19.1,42.5z"/>
</g>
</svg><span>
`
class FillUpQuestionEvaluation extends React.Component {
  constructor(props) {
    super(props);
    this.state={
        loading:false,
        question:null,
        correctAnswers: [],
        score_options:[1,2,3]
    }
    this.myRef = React.createRef();
  }
    
  
  componentDidMount(){
    let correctAnswers = this.props.question.options.filter((val, index) => {
      return val.is_correct === '1'
    })
    this.setState({ correctAnswers: correctAnswers}, () => {
      this.updateUserAnswer();  
    }); 
    let score_options=[];
    for(let i= 0; i<(+this.props.question.grade)+1;i++){
      score_options.push({label:i,value:i});
    }
    this.setState({score_options})   
  }
  updateUserAnswer(){    
    if (this.props.question.answer) {
      this.setState({loading:true});
      const fillup_elem=jQuery(`.fill_${ this.props.index}`);
      const array_formatted_answer =   JSON.parse(JSON.stringify(this.props.question.answer)).replace(/\[|\]/g,'').split(',')
      if(array_formatted_answer){
          for(let i=0;i<fillup_elem.length;i++){
              if(this.props.question.blank_question_type == 2 ){
                  const icon_element = this.props.question.fill_up_answers[i]['is_correct'] == 0 ? red_icon_svg : green_icon_svg;
                  if(this.props.question.fill_up_answers[i]['option']){
                      fillup_elem[i].innerText = this.props.question.fill_up_answers[i]['option'];
                  }
                
                  fillup_elem[i].insertAdjacentHTML("afterend", icon_element)
              }else{
                  if(array_formatted_answer[i] && array_formatted_answer[i].replaceAll("\"", ""))
                  {
                      fillup_elem[i].innerText = array_formatted_answer[i].replaceAll("\"", "");
                  }
                
              }
            
          }
      }
      this.setState({loading:false});
    }    
}
  componentWillReceiveProps(props) {
    const { index } = this.props;
     if (props.index !== index  ) {
        this.updateUserAnswer();
    }
}

  render() {
    let replace_from =  this.props.question.blank_question_type ==2 ? '{{SELECT_OPTION}}':'{{INPUT_OPTION}}'
    this.question = this.props.question.fill_up_formatted_question.replaceAll(replace_from,`<span class='fill_${ this.props.index}' style="border:3px solid black;padding:1px;width:25px;height:10px">&emsp;&emsp;&emsp;</span>`)
    return (
      <>
       { !this.state.loading && ( <div style={{marginTop:this.props.index > 0 ? 50:0}} >
        <div className="row mt-2">
          <div className="col-sm-10">
            <p>
              <span style={{backgroundColor:this.props.selected_question_for_eval==this.props.index?'yellow':'white'}}>{this.props.question.is_mandatory && (<abbr className="slds-required" title="required">* </abbr>)}Question&nbsp;{this.props.question.serial_no}&nbsp;{COLON}</span>
              {(this.props.question.not_answered) && (<span style={{color:'red',fontWeight:'bold'}}> Not Answered</span>)}
            </p>
          </div>
          <div className="col-sm-2" style={{"fontSize":14,"textAlign":'right'}}>
             {/*  <span  style={{"marginRight":10}} >
                Result&ensp;{COLON}&nbsp;
                {this.props.question.result != null &&(<><span
                  style={{
                    color: this.props.question.result == 1 ? '#02c902' : this.props.question.result == 2 ? '#FFA500' : 'red',
                    fontWeight: 'bold'
                  }}
                >
                  &nbsp;{this.props.question.result == 1 ? 'Correct' : this.props.question.result == 2 ? 'Partially Incorrect' : 'Incorrect'}
                </span></>)}
                {this.props.question.result == null &&(<><span>&ensp;&emsp;&emsp;&ensp;&ensp;</span></>)}
              </span> */}
           
              <span  style={{"marginRight":20}}>
                Score&ensp;{COLON}&ensp;{this.props.question.score != null &&(<>{this.props.question.score}
                {'/'}
                {this.props.question.grade}</>)}
              </span>
          </div>
        </div>

        <div className="row mt-2" style={{ border: '1px solid #dadada' }}>
          <div className="col-sm-12 p-2">
          {this.props.question.passage_question && (<p className="p-1 mt-1" style={{ textAlign: 'justify',
    textJustify: 'inter-word'}}>
        { this.props.question.passage_question .length > 200 &&(  <ViewLessViewMore question = {this.props.question.passage_question} delimeter={Number(this.props.question.answer_type) === 7 ? false : true} />)}
           { this.props.question.passage_question .length < 200 && (   <div dangerouslySetInnerHTML={{__html:this.props.question.passage_question}} ></div>)}
          </p>)}
          
          <div className="p-1 mt-1" style={{ textAlign: 'justify',
    textJustify: 'inter-word'}}>
          <div style={{lineHeight: 2}} dangerouslySetInnerHTML={{__html:this.props.question.question}} ></div>
          </div>
           

          {this.props.question.blank_question_type == 1 &&  (<p className="p-1 mt-2"  style={{fontWeight: 'bold'}}>Applicant's Answer&ensp;{COLON}&nbsp; {this.props.question.result !=null  && (
                  <span>
                    <Icon
                      assistiveText={{ label: 'check' }}
                      style={{
                        width: 1.25 + 'rem',
                        height: 1.25 + 'rem',
                      }}
                      className={
                        Number(this.props.question.result) === 1
                          ? 'slds_icon_iscorrect'
                          : 'slds_icon_iswrong'
                      }
                      variant="error"
                      category="utility"
                      size="xx-small"
                      name={this.props.question.result == 1 ? 'check' : 'close'}
                    />
                  </span>
                )}</p>)}
            <p className="p-1 mt-1" >
            {<div dangerouslySetInnerHTML={{__html:`<p style='line-height: 2;'>${this.question}</p>`}}></div> }
          </p>
          { (this.props.question.blank_question_type == 2 || (this.props.question.blank_question_type == 1 && this.state.correctAnswers.length > 0)) ? ( <p className="p-1 mt-1">
              <span style={{fontWeight:'bold'}}>
                Correct Answer&ensp;{COLON}&ensp;
                </span>
                <span>
                  {this.state.correctAnswers.map((val,index) => (
                    <span>{index > 0 ? ' , ' + val.option: val.option}</span>
                  ))}
              </span>
            </p>) : <React.Fragment />}
          </div>
        </div>
       { this.props.question.blank_question_type ==1 && (  <div className="row">
          <div className="col-sm-10">
            <Textarea
            disabled={this.props.assessment_status > 3 ? true:false}
              label=" "
              className="slds-textarea text_area_height_100"
              name={'Option'}
              value={this.props.question.comments}
              placeholder="Comment Here"
              onChange={(event) => {
                this.props.shortAnswerCommentsChange(
                    event.target.value,
                  this.props.index,
                )
              }}
            />
          </div>
          <div className="col-sm-2">
              <div
                style={{ marginRight: 12, marginLeft: 12, lineHeight: 2.5 }}
              >
                score (out of {this.props.question.grade}) &nbsp;{COLON}&nbsp; 
              </div>
                <form id={'short_answer_grade_'+ this.props.index}>
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
            {/* <div className="mt-2" style={{ display: 'flex' }}>
              <span
                style={{ marginRight: 12, marginLeft: 54, lineHeight: 2.5 }}
              >
                Choose the result &nbsp;{COLON}&nbsp;
              </span>
              <span>
              <form id={'short_answer_result_'+ this.props.index}>
                <SelectList
                  required={true}
                  simpleValue={true}
                  searchable={false}
                  id="oa_result_eval"
                  placeholder="Choose"
                  options={CorrectOrNotOption()}
                  value={ this.props.question.result!=null?this.props.question.result.toString():''}
                   onChange={(event)=>{ this.props.shortAnswerResultChange(event,this.props.index)}}
                  inputRenderer={(data) => (
                    <input type="text" name="is_mandatory" {...data} readOnly />
                  )}
                  disabled={this.props.assessment_status > 3 ? true:false}
                />
                </form>
              </span>
            </div> */}
        </div>)}
        </div>)}
      </>
    )
  }
}
export default FillUpQuestionEvaluation;
