import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { handleChange, postData, toastMessageShow } from 'service/common.js';

class Medication extends Component {

  constructor(props) {
    super(props);
    this.state = {
      full_assistance_and_verbal : 0,
    }
  }

  componentDidMount() {
    if(this.props.need_assessment_id){
        this.setState({need_assessment_id:this.props.need_assessment_id},()=>{
             this.getSelectedMedication();
        })
    }
  }

  getSelectedMedication = ()=>{        
    postData("sales/NeedAssessment/get_selected_medication", {need_assessment_id:this.state.need_assessment_id}).then((res) => {
        if (res.status) {
            this.setState(res.data)
        }
    });    
    }

  onSubmit = (e) => {
        e.preventDefault();
        jQuery("#medication_form").validate({ /* */ });
        if(this.state.full_assistance_and_verbal=="1" && this.state.not_applicable!=1){
          if((this.state.tablets_liquid_oral=="0") && (this.state.crushed_oral=="0") && (this.state.crushed_via_peg=="0")){
            toastMessageShow('Please choose atlease one option', "e");
            return false;
          }else{
            this.save_medication(this.state);
          }
        }else if(this.state.full_assistance_and_verbal=="2"){
          this.setState({tablets_liquid_oral : 0, crushed_oral : 0 , crushed_via_peg : 0 }, ()=>{
            this.save_medication(this.state);
          })
        }else{
          this.save_medication(this.state);
        }
    }

    // API call for save medication
    save_medication = (state) =>{
      if (jQuery("#medication_form").valid()) {
        this.setState({ loading: true });            
        postData('sales/NeedAssessment/save_medication', state).then((result) => {
            if (result.status) {
                let msg = result.msg;
                toastMessageShow(msg, 's');
                this.getSelectedMedication();
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
              <form id="medication_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
                <div className="slds-panel__header">
                  <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Medication Assistance</h2>
                </div>
                <div className="slds-panel__body">
                  <div className="slds-form-element">
                    <div className="slds-form-element__control">
                      <div className="slds-checkbox">
                        <input type="checkbox" name="not_applicable" id="not_applicable_chkbox" onChange={(e) => handleChange(this,e)} checked={(this.state.not_applicable && this.state.not_applicable=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="not_applicable_chkbox">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Not applicable</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Medication administration</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio">
                        <input type="radio" id="medication_administration_1" value="1" name="medication_administration" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.medication_administration && this.state.medication_administration == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="medication_administration_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I take medication but dont't require support</span>
                        </label>
                      </span>
                      <span className="slds-radio">
                        <input type="radio" id="medication_administration_2" value="2" name="medication_administration" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.medication_administration &&this.state.medication_administration == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="medication_administration_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I take medication and require assistance</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Choose one option</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="full_assistance_and_verbal_no" value="1" name="full_assistance_and_verbal" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.full_assistance_and_verbal &&this.state.full_assistance_and_verbal == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="full_assistance_and_verbal_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Full Assistance</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="full_assistance_and_verbal_yes" value="2" name="full_assistance_and_verbal" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.full_assistance_and_verbal &&this.state.full_assistance_and_verbal == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="full_assistance_and_verbal_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Verbal Prompting</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>


                  {this.state.full_assistance_and_verbal==1 && <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Please choose the option</legend>
                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="tablets_liquid_oral" id="tablets_liquid_oral" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.tablets_liquid_oral && this.state.tablets_liquid_oral=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="tablets_liquid_oral">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Full tablets/liquid-oral</span>
                        </label>
                      </span>
                    </div>
                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="crushed_oral" id="crushed_oral" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.crushed_oral && this.state.crushed_oral=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="crushed_oral">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Crushed-Oral</span>
                        </label>
                      </span>
                    </div>
                    <div className="slds-form-element__control row">
                      <span className="slds-checkbox slds-float_left col col-sm-6">
                        <input type="checkbox" name="crushed_via_peg" id="crushed_via_peg" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.crushed_via_peg && this.state.crushed_via_peg=='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="crushed_via_peg">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Crushed-Via Peg</span>
                        </label>
                      </span>
                    </div>
                  </fieldset> }

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Are any of your medications prescribed as PRN?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio">
                        <input type="radio" id="medication_emergency_no" value="1" name="medication_emergency" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.medication_emergency &&this.state.medication_emergency == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="medication_emergency_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>                      
                      <span className="slds-radio">
                        <input type="radio" id="medication_emergency_yes" value="2" name="medication_emergency" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.medication_emergency &&this.state.medication_emergency == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="medication_emergency_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Do you take any regular over the counter medications (included vitamins) ?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio">
                        <input type="radio" id="medication_vitamins_no" value="1" name="medication_vitamins_counter" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.medication_vitamins_counter &&this.state.medication_vitamins_counter == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="medication_vitamins_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>                      
                      <span className="slds-radio">
                        <input type="radio" id="medication_vitamins_yes" value="2" name="medication_vitamins_counter" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.medication_vitamins_counter &&this.state.medication_vitamins_counter == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="medication_vitamins_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>
                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label"> Is any of your medication used to alter your mood/behavior ?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio">
                        <input type="radio" value="1" id="reduce_concern_no" name="reduce_concern" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.reduce_concern &&this.state.reduce_concern == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="reduce_concern_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio">
                        <input type="radio" value="2" id="reduce_concern_yes" name="reduce_concern" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.reduce_concern &&this.state.reduce_concern == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="reduce_concern_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
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

export default Medication;