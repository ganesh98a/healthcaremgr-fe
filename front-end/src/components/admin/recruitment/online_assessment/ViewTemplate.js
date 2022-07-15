import React, { useEffect, useState } from 'react';
import {  Modal, Button, IconSettings, Textarea } from '@salesforce/design-system-react'


/** Render choice answers */
const renderChoiceAnswer = (question) => {
    
    var classNametype = question.answer_type == 1 ? "radio_F1 check_F1 mb-0" : "radio_F1 mb-0";
    var type = question.answer_type == 1 ? "checkbox" : "radio";

    return <React.Fragment>
        {question.options.map((val, idxx) => {
           
            let is_answer_true = false;
            if(val.is_correct == "1") {
                is_answer_true = true;
            }

            return <li className={'w-50'} key={idxx}>
                    <label className={'align-self-center' +(question.answer_type == 1 ? ' chk_bx_Des nocls' : ' radio_bx_Des nocls') + classNametype} style={{ width: 'auto' }}>
                        <input checked={is_answer_true} type={type} name={val.id} />
                        <span className={"checkround" + (question.answer_type == 1 ? " form-checkbox-quest " : " form-radio-quest ") } ></span>
                        <span className="txtcheck text_2_0_1">{val.option}</span>
                    </label>
                </li>
        })}
        </React.Fragment>
}

function ViewTemplate(props) {
    const [heading, setHeading] = useState('');

    useEffect(() => {
        if (!props.heading) {
            setHeading(props.OAtitle || '');
        }
    }, []);
    let columns = [];
    const finalArr = [];
    return (
        <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
            <Modal
                isOpen={true}
                dismissOnClickOutside={props.dismissOnClickOutside}
                footer={[
                    <Button key="close" label="close" variant="brand" onClick={() => props.close("")} />,
                ]}
                onRequestClose={() => props.close("")}
                size={props.size}                
                heading={heading}>
                <section className="slds-p-around_large">
                    <div className="container-fluid">
                        <form id="submit_form" autoComplete="off" className="slds_form">
                            <div className="col-sm-12">

                                { props.data.map((value, idx) => {                                   
                                    columns.push(
                                        <div className='col-sm-6 pr_set_lef' key={idx}>
                                            <div className="row">
                                                <div className='col-sm-12 '>
                                                    <div className="row d-flex flew-wrap remove-after-before">
                                                        <div className='col-sm-12'>
                                                            <div className="qShwcse">
                                                                <p>
                                                                    <span className={(value.is_mandatory == 1 ? " set_inline_required" : "" ) + " question-2h"}>
                                                                        {idx + 1}. {value.question}
                                                                    </span>
                                                                </p>
                                                                    { value.answer_type > 0  && value.answer_type <= 3 &&
                                                                        <ul className={"List_2_ul mt-2"}>
                                                                            {renderChoiceAnswer(value)}
                                                                        </ul>
                                                                    }
                                                                { value.answer_type == 4 &&                                          
                                                                <div className={ "mt-2"}>
                                                                    {<Textarea className="slds-input" />}
                                                                </div>
                                                                }            
                                                                    
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    if (idx % 2 !== 0 || (idx + 1) === props.data.length) {
                                        finalArr.push(<div className=' d-flex flex-wrap slds_quesAns_box__  Multiple_Choice_div___ w-100 mb-4' >{columns}</div>);
                                        columns = [];
                                    }
                                    })
                                }
                                {finalArr}
                            </div>
                        </form>
                    </div>
                </section>

            </Modal>
        </IconSettings>
    );
}

export default ViewTemplate;