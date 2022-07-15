import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';

import jQuery from 'jquery';
import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import { handleChange, postData, toastMessageShow } from 'service/common.js';

class Health extends Component {

  constructor(props) {
    super(props);
    this.state = {
        loading:false,
        other_label:''
    }
  }

  componentDidMount() {
    if(this.props.need_assessment_id){
        this.setState({need_assessment_id:this.props.need_assessment_id},()=>{
            this.getSelectedHealthAssistance();
        })
    }
  }

  getSelectedHealthAssistance = ()=>{
    postData("sales/NeedAssessment/get_selected_health_assistance", {need_assessment_id:this.state.need_assessment_id}).then((res) => {
        if (res.status) {
            this.setState(res.data)
        }
    });
    }

  onSubmit = (e) => {
        e.preventDefault();
        jQuery("#mealtime_form").validate({ /* */ });
        this.setState({ loading: true });
        //if (jQuery("#mealtime_form").valid()) {
        if (!this.state.loading && jQuery("#mealtime_form").valid()) {
            postData('sales/NeedAssessment/save_health_assisstance', this.state).then((result) => {
                if (result.status) {
                    this.setState({ loading: false });
                    let msg = result.msg;
                    toastMessageShow(msg, 's');
                    this.getSelectedHealthAssistance();
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
      <BlockUi tag="div" blocking={this.state.loading}>
        <div className="slds-grid">
            <div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
              <form id="mealtime_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
                <div className="slds-panel__header">
                  <h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Health Support</h2>
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
                    <legend className="slds-form-element__legend slds-form-element__label"> Diabetes</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="dia_no" value="1" name="diabetes" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.diabetes && this.state.diabetes == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dia_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="dia_yes" value="2" name="diabetes" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.diabetes && this.state.diabetes == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dia_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="dia_yes_wop" value="3" name="diabetes" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.diabetes && this.state.diabetes == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dia_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="dia_4" value="4" name="diabetes" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.diabetes && this.state.diabetes == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dia_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label"> Epilepsy</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="epilepsy_no" value="1" name="epilepsy" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.epilepsy && this.state.epilepsy == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="epilepsy_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="epilepsy_yes" value="2" name="epilepsy" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.epilepsy && this.state.epilepsy == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="epilepsy_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="epilepsy_yes_wop" value="3" name="epilepsy" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.epilepsy &&this.state.epilepsy == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="epilepsy_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="epilepsy_4" value="4" name="epilepsy" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.epilepsy && this.state.epilepsy == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="epilepsy_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Asthma</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="asthma_no" name="asthma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.asthma &&this.state.asthma == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="asthma_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="asthma_yes" name="asthma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.asthma && this.state.asthma == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="asthma_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="asthma_yes_wop" value="3" name="asthma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.asthma && this.state.asthma == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="asthma_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="asthma_4" value="4" name="asthma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.asthma && this.state.asthma == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="asthma_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Dietry Requirements</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="dietry_no" name="dietry_requirements" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dietry_requirements && this.state.dietry_requirements == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dietry_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="dietry_yes" name="dietry_requirements" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dietry_requirements && this.state.dietry_requirements == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dietry_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="dietry_yes_wop" value="3" name="dietry_requirements" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dietry_requirements && this.state.dietry_requirements == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dietry_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="dietry_requirements_4" value="4" name="dietry_requirements" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dietry_requirements && this.state.dietry_requirements == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="dietry_requirements_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Alergies</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="alergies_no" name="alergies" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.alergies && this.state.alergies == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="alergies_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="alergies_yes" name="alergies" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.alergies && this.state.alergies == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="alergies_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="alergies_yes_wop" value="3" name="alergies" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.alergies && this.state.alergies == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="alergies_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="alergies_4" value="4" name="alergies" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.alergies && this.state.alergies == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="alergies_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Bladder/Bowel care</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="bladder_no" name="bladder_bowel_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bladder_bowel_care && this.state.bladder_bowel_care == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="bladder_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="bladder_yes" name="bladder_bowel_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bladder_bowel_care && this.state.bladder_bowel_care == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="bladder_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="bladder_yes_wop" value="3" name="bladder_bowel_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bladder_bowel_care && this.state.bladder_bowel_care == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="bladder_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="bladder_4" value="4" name="bladder_bowel_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bladder_bowel_care && this.state.bladder_bowel_care == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="bladder_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Pressure care</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="care_no" name="pressure_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.pressure_care &&this.state.pressure_care == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="care_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="care_yes" name="pressure_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.pressure_care &&this.state.pressure_care == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="care_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="care_yes_wop" value="3" name="pressure_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.pressure_care &&this.state.pressure_care == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="care_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="care_4" value="4" name="pressure_care" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.pressure_care && this.state.pressure_care == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="care_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Stoma</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="stoma_no" name="stoma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.stoma &&this.state.stoma == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="stoma_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="stoma_yes" name="stoma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.stoma &&this.state.stoma == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="stoma_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="stoma_yes_wop" value="3" name="stoma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.stoma && this.state.stoma == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="stoma_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="stoma_4" value="4" name="stoma" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.stoma && this.state.stoma == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="stoma_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>






                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Peg or Pej Meal Assistance</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="peg_pej_no" name="peg_pej" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.peg_pej &&this.state.peg_pej == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="peg_pej_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="peg_pej_yes" name="peg_pej" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.peg_pej &&this.state.peg_pej == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="peg_pej_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="peg_pej_yes_wop" value="3" name="peg_pej" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.peg_pej && this.state.peg_pej == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="peg_pej_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="peg_pej_4" value="4" name="peg_pej" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.peg_pej && this.state.peg_pej == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="peg_pej_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Anaphylaxis</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="anaphylaxis_no" name="anaphylaxis" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.anaphylaxis &&this.state.anaphylaxis == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="anaphylaxis_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="anaphylaxis_yes" name="anaphylaxis" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.anaphylaxis &&this.state.anaphylaxis == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="anaphylaxis_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="anaphylaxis_yes_wop" value="3" name="anaphylaxis" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.anaphylaxis && this.state.anaphylaxis == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="anaphylaxis_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="anaphylaxis_4" value="4" name="anaphylaxis" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.anaphylaxis && this.state.anaphylaxis == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="anaphylaxis_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Breathing Assistance</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="breath_assist_no" name="breath_assist" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.breath_assist &&this.state.breath_assist == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="breath_assist_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="breath_assist_yes" name="breath_assist" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.breath_assist &&this.state.breath_assist == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="breath_assist_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="breath_assist_yes_wop" value="3" name="breath_assist" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.breath_assist && this.state.breath_assist == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="breath_assist_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="breath_assist_4" value="4" name="breath_assist" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.breath_assist && this.state.breath_assist == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="breath_assist_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Mental Health</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="mental_health_no" name="mental_health" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.mental_health &&this.state.mental_health == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="mental_health_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="mental_health_yes" name="mental_health" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.mental_health &&this.state.mental_health == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="mental_health_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="mental_health_yes_wop" value="3" name="mental_health" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.mental_health && this.state.mental_health == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="mental_health_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="mental_health_4" value="4" name="mental_health" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.mental_health && this.state.mental_health == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="mental_health_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Other</legend>

                    <input type="text" className="slds-input" name="other_label"  disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} value={this.state.other_label} onChange={(e)=>handleChange(this,e)}/>

                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="other_no" name="other" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.other && this.state.other == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="other_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="other_yes" name="other" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.other && this.state.other == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="other_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with health plan</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="other_yes_wop" value="3" name="other" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.other && this.state.other == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="other_yes_wop">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes with other supports</span>
                        </label>
                      </span>

                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" id="other_4" value="4" name="other" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.other && this.state.other == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="other_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">I don't require staff support with this</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Do you access community nursing services?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="1" id="nursing_service_no" name="nursing_service" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.nursing_service &&this.state.nursing_service == "1")?true:false}/>
                        <label className="slds-radio__label" htmlFor="nursing_service_no">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio" style={{display:'inline'}}>
                        <input type="radio" value="2" id="nursing_service_yes" name="nursing_service" disabled={(this.state.not_applicable && this.state.not_applicable =='1') ? true : false} onChange={(e) => handleChange(this,e)} checked={(this.state.nursing_service && this.state.nursing_service == 2) ? true : false}/>
                        <label className="slds-radio__label" htmlFor="nursing_service_yes">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>

                      <div className="slds-form-element__control">
                      <input type="text" className="slds-input width50" name="nursing_service_reason" disabled={((this.state.not_applicable && this.state.not_applicable=='1') || this.state.nursing_service != "2")?true:false} value={this.state.nursing_service_reason} placeholder="If yes provide the reason" onChange={(e)=>handleChange(this,e)}/>
                      </div>

                    </div>
                  </fieldset>

                </div>
                <div className="slds-panel__footer">
                    <button type="button" className="slds-button slds-button_brand" onClick={this.onSubmit}>Save</button>
                </div>
              </form>
            </div>
        </div>
        </BlockUi>
      </React.Fragment >
    );
  }
}

export default Health;