import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow,handleChange } from 'service/common.js';
import jQuery from "jquery";

class Communication extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      communication_verbal: false,
      yes_verbal_instruction: 0,
      instructions_desc : ''
    }
  }

  componentDidMount() {
    if(this.props.need_assessment_id){
      this.setState({need_assessment_id:this.props.need_assessment_id},()=>{
        this.getSelectedCommunication();
      })
    }
  }

  getSelectedCommunication = ()=> {        
    postData("sales/NeedAssessment/get_selected_communication", {need_assessment_id:this.state.need_assessment_id}).then((res) => {
      if (res.status) {
          this.setState(res.data)
      }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    jQuery("#communication_form").validate({ /* */ });

    if (jQuery("#communication_form").valid()) {
      this.setState({ loading: true });
      postData('sales/NeedAssessment/save_communication', this.state).then((result) => {
        if (result.status) {
          let msg = result.msg;
          toastMessageShow(msg, 's');
          this.getSelectedCommunication();
        } else {
          toastMessageShow(result.msg, "e");
          this.setState({ loading: false });
        }
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="slds-grid">
            <div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
              <form id="communication_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
                <div className="slds-panel__header">
                  <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Communication</h2>
                </div>
                <div className="slds-panel__body">

                  <fieldset className="slds-form-element mb-3" style={{ maxWidth: 600 }}>
                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_verbal" id="communication_verbal" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_verbal && this.state.communication_verbal=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_verbal">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Verbal</span>
                        </label>
                      </span>
                    
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_book" id="communication_book" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_book && this.state.communication_book=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_book">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Communication book/board</span>
                        </label>
                      </span>
                    </div>

                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_nonverbal" id="communication_nonverbal" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_nonverbal && this.state.communication_nonverbal=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_nonverbal">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Non-verbal</span>
                        </label>
                      </span>
                    
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_electric" id="communication_electric" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_electric && this.state.communication_electric=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_electric">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Electronic device</span>
                        </label>
                      </span>
                    </div>

                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_vocalization" id="communication_vocalization" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_vocalization && this.state.communication_vocalization=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_vocalization">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Vocalization / Gestures</span>
                        </label>
                      </span>
                    
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_sign" id="communication_sign" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_sign && this.state.communication_sign=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_sign">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Sign</span>
                        </label>
                      </span>
                    </div>

                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="communication_other" id="communication_other" onChange={(e) => handleChange(this,e)} checked={(this.state.communication_other && this.state.communication_other=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="communication_other">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Other, please describe</span>
                        </label>
                      </span>
                    
                      <span className="slds-checkbox slds-float_left col col-sm-12">
                        <input type="text" className="slds-input d-block" name="communication_other_desc" required={(this.state.communication_other_desc)?false:false} disabled={(this.state.communication_other != 1)?true:false} value={this.state.communication_other_desc} onChange={(e)=>handleChange(this,e)}
                          style={{ maxWidth: 400 }}
                        />
                      </span>
                    </div>

                  </fieldset>
                  <fieldset className="slds-form-element mb-3">
                    <legend className="slds-form-element__legend slds-form-element__label">Cognition and Comprehension</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="cognition_1" value="1" name="cognition" onChange={(e) => handleChange(this,e)} checked={(this.state.cognition && this.state.cognition == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="cognition_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Very good</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="cognition_2" value="2" name="cognition" onChange={(e) => handleChange(this,e)} checked={(this.state.cognition &&this.state.cognition == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="cognition_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Good</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="cognition_3" value="3" name="cognition" onChange={(e) => handleChange(this,e)} checked={(this.state.cognition &&this.state.cognition == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="cognition_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Fair</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="cognition_4" value="4" name="cognition" onChange={(e) => handleChange(this,e)} checked={(this.state.cognition &&this.state.cognition == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="cognition_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Poor</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element mb-3">
                    <legend className="slds-form-element__legend slds-form-element__label">Can the participant follow verbal instructions?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="instructions_2" value="2" name="instructions" onChange={(e) => {handleChange(this,e)
                        this.setState({instructions_desc : ''}) }} checked={(this.state.instructions &&this.state.instructions == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="instructions_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="instructions_1" value="1" name="instructions" onChange={(e) => {handleChange(this,e)
                        this.setState({yes_verbal_instruction : 0}) }} checked={(this.state.instructions && this.state.instructions == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="instructions_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                    </div>

                  {this.state.instructions == 2 ? <div>
                    <legend className="slds-form-element__legend slds-form-element__label">Choose one option</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="verbal_instructions_1" value="1" name="yes_verbal_instruction" onChange={(e) => handleChange(this, e)} checked={(this.state.yes_verbal_instruction && this.state.yes_verbal_instruction == 1) ? true : false} />
                        <label className="slds-radio__label" htmlFor="verbal_instructions_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Single Word Only</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="verbal_instructions_2" value="2" name="yes_verbal_instruction" onChange={(e) => handleChange(this, e)} checked={(this.state.yes_verbal_instruction && this.state.yes_verbal_instruction == 2) ? true : false} />
                        <label className="slds-radio__label" htmlFor="verbal_instructions_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Short Sentences (3-5 words)</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="verbal_instructions_3" value="3" name="yes_verbal_instruction" onChange={(e) => handleChange(this, e)} checked={(this.state.yes_verbal_instruction && this.state.yes_verbal_instruction == 3) ? true : false} />
                        <label className="slds-radio__label" htmlFor="verbal_instructions_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Full Sentence (5 words +)</span>
                        </label>
                      </span>
                    </div>
                  </div> :
                    <div>
                      <legend className="slds-form-element__legend slds-form-element__label">If no, please describe best method of communication</legend>
                      <div className="slds-form-element__control">
                        <input type="text" className="slds-input width50" name="instructions_desc" required={false} disabled={(this.state.instructions != 1) ? true : false} value={this.state.instructions_desc} onChange={(e) => handleChange(this, e)} />
                      </div>
                    </div>}
                </fieldset>

                  <fieldset className="slds-form-element mb-3">
                    <legend className="slds-form-element__legend slds-form-element__label">Hearing impaired?</legend>
                    <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                        <input type="radio" id="hearing_impared_1" value="1" name="hearing_impared" onChange={(e) => handleChange(this,e)} checked={(this.state.hearing_impared && this.state.hearing_impared == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="hearing_impared_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="hearing_impared_2" value="2" name="hearing_impared" onChange={(e) => handleChange(this,e)} checked={(this.state.hearing_impared &&this.state.hearing_impared == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="hearing_impared_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                    </div>
                    <div className="slds-form-element__control">
                      <input type="text" className="slds-input width50" name="hearing_impared_desc" required={false} disabled={(this.state.hearing_impared != 2)?true:false} value={this.state.hearing_impared_desc} onChange={(e)=>handleChange(this,e)}/>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element mb-3">
                    <legend className="slds-form-element__legend slds-form-element__label">Visually impaired?</legend>
                    <div className="slds-form-element__control">
                    <span className="slds-radio slds-float_left">
                        <input type="radio" id="visually_impared_1" value="1" name="visually_impared" onChange={(e) => handleChange(this,e)} checked={(this.state.visually_impared && this.state.visually_impared == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="visually_impared_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="visually_impared_2" value="2" name="visually_impared" onChange={(e) => handleChange(this,e)} checked={(this.state.visually_impared &&this.state.visually_impared == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="visually_impared_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                    </div>
                    <div className="slds-form-element__control">
                      <input type="text" className="slds-input width50" name="visually_impared_desc" required={false} disabled={(this.state.visually_impared != 2)?true:false} value={this.state.visually_impared_desc} onChange={(e)=>handleChange(this,e)}/>
                    </div>
                  </fieldset>
                </div>
                <div className="slds-panel__footer">
                    <button type="button" className="slds-button slds-button_brand" onClick={this.onSubmit}>Save</button>
                </div>
              </form>
            </div>
        </div>
      </React.Fragment >
    );
  }
}

export default Communication;