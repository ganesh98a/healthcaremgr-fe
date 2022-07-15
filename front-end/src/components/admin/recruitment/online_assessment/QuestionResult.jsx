import { Icon, Radio,Checkbox } from '@salesforce/design-system-react'
import React from 'react'
import {EMPTY_SPACE,COLON,QUESTION_MARK} from './OaConstants.js';
const QuestionResult = (props) => {
  let correctAnswers = props.question.options.filter((val, index) => {
    return val.is_correct === '1'
  })
  return (
    <>
    <div style={{marginTop:props.index > 0 ? 50:0}} >
      <div className="row mt-2">
        <div className="col-sm-10">
          <p>
            <span style={{backgroundColor:props.selected_question_for_eval==props.index?'yellow':'white'}} >{props.question.is_mandatory && (<abbr className="slds-required" title="required">* </abbr>)}Question&nbsp;{props.question.serial_no}&nbsp;{COLON}</span>
            {(props.question.not_answered) && (<span style={{color:'red',fontWeight:'bold'}}> Not Answered</span>)}
          </p>
        </div>
        <div className="col-sm-2" style={{"fontSize":14,"textAlign":'right'}}>
             {/*  <span  style={{"marginRight":10}} >
                Result&ensp;{COLON}&nbsp;
                <span
                  style={{
                    color: props.question.result == 1 ? '#02c902' : 'red',
                    fontWeight: 'bold',
                   
                  }}
                >
                  &nbsp;{props.question.result == 1 ? 'Correct' : 'Incorrect'}
                </span>
              </span>
            */}
              <span  style={{"marginRight":20}}>
               Score&ensp;{COLON}&ensp;{props.question.score == null ? 0:props.question.score}
                {'/'}
                {props.question.grade}
              </span>
        </div>
      </div>

      <div className="row mt-1" style={{ border: '1px solid #dadada' }}>
        <div className="col-sm-12 p-2">
        {props.question.passage_question && (<p className="p-1 mt-1 p-line-height" style={{ paddingBottom: '5px', borderBottom: Number(props.question.answer_type === 7) ? '2px solid #ccc' : '0px' }}>
            <div dangerouslySetInnerHTML={{__html:props.question.passage_question}} ></div>
          </p>)}
          <p className="p-1 mt-1 p-line-height">
            <div dangerouslySetInnerHTML={{__html:props.question.question}} ></div>
          </p>

          <p className="p-1 mt-1">
            {props.question.options.map((value,id) => (
              <p>
                {props.question.answer_type==1 && (
                    <Checkbox
							assistiveText={{
								label: value.option,
							}}
							id={"checkbox_eval_"+{id}}
							labels={{
								label: value.option,
							}}
                            className="checkbox_eval"
                            disabled={true}
                            checked={value.is_selected}
							
				/>
                 )}
                {( props.question.answer_type ==2 || props.question.answer_type == 3)  && (
                       <Radio
                       key={value}
                       id={"radio_eval"+value}
                       labels={{ label: value.option }}
                       value={value}
                       disabled={true}
                       checked={value.is_selected}
                       variant="base"
                     />
                )}
                {value.is_selected && (
                  <span>
                    <Icon
                      assistiveText={{ label: 'check' }}
                      style={{
                        width: 1.25 + 'rem',
                        height: 1.25 + 'rem',
                      }}
                      className={
                        value.is_correct == 1
                          ? 'slds_icon_iscorrect'
                          : 'slds_icon_iswrong'
                      }
                      variant="error"
                      category="utility"
                      size="xx-small"
                      name={value.is_correct == 1 ? 'check' : 'close'}
                    />
                  </span>
                )}
              </p>
            ))}
          </p>
          <p className="p-1 mt-1">
            <span style={{fontWeight:'bold'}}>
              Correct Answer&ensp;{COLON}&ensp;
              </span>
              <span>
                {correctAnswers.map((val,index) => (
                  <span>{index > 0 ? ' , ' + val.option: val.option}</span>
                ))}
             
            </span>
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
export default QuestionResult
