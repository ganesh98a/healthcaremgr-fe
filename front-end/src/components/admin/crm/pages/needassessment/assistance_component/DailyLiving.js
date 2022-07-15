import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData,handleChange } from 'service/common.js';


class DailyLiving extends Component {

  constructor(props) {
    super(props);
    this.state = props.state
  }

  componentDidMount() {
    if(this.state.need_assessment_id){
        this.getSelectedCommunityAccess();
    }
  }

  getSelectedCommunityAccess = ()=> {
    postData("sales/NeedAssessment/get_selected_community_access", {need_assessment_id:this.state.need_assessment_id}).then((res) => {
      if (res.status) {
          res.data.not_applicable_living = res.data.not_applicable;
          this.setState(res.data)
      }
    });
  }

  getState() {
    return this.state;
  }
  render() {
    return (
      <React.Fragment>
        <div className="slds-grid">
            <div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
              <form id="community_access_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
                <div className="slds-panel__body">
                  <div className="slds-form-element">
                    <div className="slds-form-element__control">
                      <div className="slds-checkbox">
                        <input type="checkbox" name="not_applicable_living" id="not_applicable_living_chkbox" onChange={(e) => handleChange(this,e)} checked={(this.state.not_applicable_living  && this.state.not_applicable_living =='1')?true:false}/>
                        <label className="slds-checkbox__label" htmlFor="not_applicable_living_chkbox">
                          <span className="slds-checkbox_faux"></span>
                          <span className="slds-form-element__label">Not applicable</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Toileting</legend>
                      <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="toileting_2" value="2" name="toileting" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.toileting &&this.state.toileting == 2)?true:false}/>
                          <label className="slds-radio__label" htmlFor="toileting_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                          </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                        <input type="radio" id="toileting_3" value="3" name="toileting" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.toileting &&this.state.toileting == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="toileting_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="toileting_4" value="4" name="toileting" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.toileting &&this.state.toileting == 4)?true:false}/>
                          <label className="slds-radio__label" htmlFor="toileting_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                          </label>
                        </span>
                      </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Organization and/or administration</legend>
                      <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="organiz_admin_2" value="2" name="organiz_admin" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.organiz_admin &&this.state.organiz_admin == 2)?true:false}/>
                          <label className="slds-radio__label" htmlFor="organiz_admin_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                          </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                        <input type="radio" id="organiz_admin_3" value="3" name="organiz_admin" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.organiz_admin &&this.state.organiz_admin == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="organiz_admin_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="organiz_admin_4" value="4" name="organiz_admin" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.organiz_admin &&this.state.organiz_admin == 4)?true:false}/>
                          <label className="slds-radio__label" htmlFor="organiz_admin_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                          </label>
                        </span>
                      </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Banking and money handling</legend>
                      <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="bank_money_2" value="2" name="bank_money" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bank_money &&this.state.bank_money == 2)?true:false}/>
                          <label className="slds-radio__label" htmlFor="bank_money_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                          </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                        <input type="radio" id="bank_money_3" value="3" name="bank_money" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bank_money &&this.state.bank_money == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="bank_money_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="bank_money_4" value="4" name="bank_money" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.bank_money &&this.state.bank_money == 4)?true:false}/>
                          <label className="slds-radio__label" htmlFor="bank_money_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                          </label>
                        </span>
                      </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Grocery shopping</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="grocessary_shopping_2" value="2" name="grocessary_shopping" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.grocessary_shopping &&this.state.grocessary_shopping == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="grocessary_shopping_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With assistance</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="grocessary_shopping_3" value="3" name="grocessary_shopping" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.grocessary_shopping &&this.state.grocessary_shopping == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="grocessary_shopping_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="grocessary_shopping_4" value="4" name="grocessary_shopping" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.grocessary_shopping &&this.state.grocessary_shopping == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="grocessary_shopping_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Independant</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Community Access</legend>
                      <div className="slds-form-element__control">
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="community_access_2" value="2" name="community_access" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.community_access &&this.state.community_access == 2)?true:false}/>
                          <label className="slds-radio__label" htmlFor="community_access_2">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">With assistance</span>
                          </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                        <input type="radio" id="community_access_3" value="3" name="community_access" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.community_access &&this.state.community_access == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="community_access_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                        <span className="slds-radio slds-float_left">
                          <input type="radio" id="community_access_4" value="4" name="community_access" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.community_access &&this.state.community_access == 4)?true:false}/>
                          <label className="slds-radio__label" htmlFor="community_access_4">
                            <span className="slds-radio_faux"></span>
                            <span className="slds-form-element__label">Independant</span>
                          </label>
                        </span>
                      </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Road safety</legend>
                    <div className="slds-form-element__control">

                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="road_safety_2" value="2" name="road_safety" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.road_safety &&this.state.road_safety == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="road_safety_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With assistance</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="road_safety_3" value="3" name="road_safety" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.road_safety &&this.state.road_safety == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="road_safety_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="road_safety_4" value="4" name="road_safety" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.road_safety &&this.state.road_safety == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="road_safety_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Independant</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Navigating transport</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="navigate_trans_2" value="2" name="navigate_trans" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.navigate_trans &&this.state.navigate_trans == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="navigate_trans_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With assistance</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="navigate_trans_3" value="3" name="navigate_trans" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.navigate_trans &&this.state.navigate_trans == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="navigate_trans_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">With supervision</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="navigate_trans_4" value="4" name="navigate_trans" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.navigate_trans &&this.state.navigate_trans == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="navigate_trans_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Independant</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Is there a companion card available for support workers?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="companion_cart_1" value="1" name="companion_cart" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.companion_cart && this.state.companion_cart == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="companion_cart_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="companion_cart_2" value="2" name="companion_cart" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.companion_cart &&this.state.companion_cart == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="companion_cart_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Method of transport</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="method_transport_1" value="1" name="method_transport" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.method_transport && this.state.method_transport == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="method_transport_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Public transport</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="method_transport_2" value="2" name="method_transport" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.method_transport &&this.state.method_transport == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="method_transport_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Support worker vehicle</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="method_transport_3" value="3" name="method_transport" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.method_transport &&this.state.method_transport == 3)?true:false}/>
                        <label className="slds-radio__label" htmlFor="method_transport_3">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No paid transport</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="method_transport_4" value="4" name="method_transport" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.method_transport &&this.state.method_transport == 4)?true:false}/>
                        <label className="slds-radio__label" htmlFor="method_transport_4">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Rideshare</span>
                        </label>
                      </span>
                    </div>
                  </fieldset>

                  <fieldset className="slds-form-element">
                    <legend className="slds-form-element__legend slds-form-element__label">Is support required to book and pay for Taxis / Ubers?</legend>
                    <div className="slds-form-element__control">
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="support_taxis_2" value="2" name="support_taxis" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.support_taxis && this.state.support_taxis == 2)?true:false}/>
                        <label className="slds-radio__label" htmlFor="support_taxis_2">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">No</span>
                        </label>
                      </span>
                      <span className="slds-radio slds-float_left">
                        <input type="radio" id="support_taxis_1" value="1" name="support_taxis" disabled={(this.state.not_applicable_living && this.state.not_applicable_living=='1')?true:false} onChange={(e) => handleChange(this,e)} checked={(this.state.support_taxis &&this.state.support_taxis == 1)?true:false}/>
                        <label className="slds-radio__label" htmlFor="support_taxis_1">
                          <span className="slds-radio_faux"></span>
                          <span className="slds-form-element__label">Yes, please describe</span>
                        </label>
                      </span>

                      <div className="slds-form-element__control">
                      <input type="text" className="slds-input width50" name="support_taxis_desc" required={(this.state.other)?false:false} disabled={((this.state.not_applicable_living && this.state.not_applicable_living=='1') || this.state.support_taxis != 1)?true:false} value={this.state.support_taxis_desc} onChange={(e)=>handleChange(this,e)}/>
                      </div>

                    </div>
                  </fieldset>
                </div>
              </form>
            </div>
        </div>
      </React.Fragment >
    );
  }
}

export default DailyLiving;