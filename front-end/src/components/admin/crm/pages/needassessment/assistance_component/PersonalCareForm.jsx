import React, { Component } from 'react';
import { handleChange, postData } from 'service/common.js';

class PersonalCareForm extends Component {

    constructor(props) {
        super(props);
        this.state = props.state
    }
    componentDidMount() {
        if(this.state.need_assessment_id){
            this.getSelectedPersonalCare();
        }
      }

      getState() {
          return this.state;
      }
      getSelectedPersonalCare = ()=> {
        postData("sales/NeedAssessment/get_selected_personalcare", {need_assessment_id:this.state.need_assessment_id}).then((res) => {
          if (res.status) {
              this.setState(res.data)
          }
        });
      }

    render() {
        return (
            <div className="slds-grid">
                <div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
                <form id="personalcare_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
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
                        <legend className="slds-form-element__legend slds-form-element__label">Shower/bath care</legend>
                        <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="showercare_2" value="2" name="showercare" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.showercare &&this.state.showercare == 2)?true:false}/>
                            <label className="slds-radio__label" htmlFor="showercare_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="showercare_3" value="3" name="showercare" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.showercare &&this.state.showercare == 3)?true:false}/>
                            <label className="slds-radio__label" htmlFor="showercare_3">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With supervision</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="showercare_4" value="4" name="showercare" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.showercare &&this.state.showercare == 4)?true:false}/>
                            <label className="slds-radio__label" htmlFor="showercare_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                            </label>
                        </span>
                        </div>
                    </fieldset>

                    <fieldset className="slds-form-element">
                        <legend className="slds-form-element__legend slds-form-element__label">Dressing/grooming</legend>
                        <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="dressing_2" value="2" name="dressing" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dressing &&this.state.dressing == 2)?true:false}/>
                            <label className="slds-radio__label" htmlFor="dressing_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="dressing_3" value="3" name="dressing" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dressing &&this.state.dressing == 3)?true:false}/>
                            <label className="slds-radio__label" htmlFor="dressing_3">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With supervision</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="dressing_4" value="4" name="dressing" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.dressing &&this.state.dressing == 4)?true:false}/>
                            <label className="slds-radio__label" htmlFor="dressing_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                            </label>
                        </span>
                        </div>
                    </fieldset>

                    <fieldset className="slds-form-element">
                        <legend className="slds-form-element__legend slds-form-element__label">Teeth cleaning</legend>
                        <div className="slds-form-element__control">
                       <span className="slds-radio slds-float_left">
                            <input type="radio" id="teethcleaning_2" value="2" name="teethcleaning" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.teethcleaning &&this.state.teethcleaning == 2)?true:false}/>
                            <label className="slds-radio__label" htmlFor="teethcleaning_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="teethcleaning_3" value="3" name="teethcleaning" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.teethcleaning &&this.state.teethcleaning == 3)?true:false}/>
                            <label className="slds-radio__label" htmlFor="teethcleaning_3">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With supervision</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="teethcleaning_4" value="4" name="teethcleaning" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.teethcleaning &&this.state.teethcleaning == 4)?true:false}/>
                            <label className="slds-radio__label" htmlFor="teethcleaning_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                            </label>
                        </span>
                        </div>
                    </fieldset>

                    <fieldset className="slds-form-element">
                        <legend className="slds-form-element__legend slds-form-element__label">Cooking/meal preperation</legend>
                        <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="cooking_2" value="2" name="cooking" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.cooking &&this.state.cooking == 2)?true:false}/>
                            <label className="slds-radio__label" htmlFor="cooking_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="cooking_3" value="3" name="cooking" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.cooking &&this.state.cooking == 3)?true:false}/>
                            <label className="slds-radio__label" htmlFor="cooking_3">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With supervision</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="cooking_4" value="4" name="cooking" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.cooking &&this.state.cooking == 4)?true:false}/>
                            <label className="slds-radio__label" htmlFor="cooking_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                            </label>
                        </span>
                        </div>
                    </fieldset>

                    <fieldset className="slds-form-element">
                        <legend className="slds-form-element__legend slds-form-element__label">Light housework/cleaning</legend>
                        <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="lighthousework_2" value="2" name="lighthousework" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.lighthousework &&this.state.lighthousework == 2)?true:false}/>
                            <label className="slds-radio__label" htmlFor="lighthousework_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="lighthousework_3" value="3" name="lighthousework" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.lighthousework &&this.state.lighthousework == 3)?true:false}/>
                            <label className="slds-radio__label" htmlFor="lighthousework_3">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With supervision</span>
                            </label>
                        </span>
                        <span className="slds-radio slds-float_left">
                            <input type="radio" id="lighthousework_4" value="4" name="lighthousework" disabled={(this.state.not_applicable && this.state.not_applicable=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.lighthousework &&this.state.lighthousework == 4)?true:false}/>
                            <label className="slds-radio__label" htmlFor="lighthousework_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                            </label>
                        </span>
                        </div>
                    </fieldset>

                    </div>

                </form>
            </div>
            </div>
        );
    }
}

export default PersonalCareForm;