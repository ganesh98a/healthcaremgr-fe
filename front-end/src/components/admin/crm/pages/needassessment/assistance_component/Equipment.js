import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import jQuery from 'jquery';
import React, { Component } from 'react';
import BlockUi from 'react-block-ui';
import { handleChange, postData, toastMessageShow } from 'service/common.js';

//import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'config.js';


class Equipment extends Component {

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			other_label: '',
            model_brand:'',
            daily_safety_aids_description:'',
            hoist_sling_description:'',
            other_description:'',
		}
	}

	componentDidMount() {
		if (this.props.need_assessment_id) {
			this.setState({ need_assessment_id: this.props.need_assessment_id }, () => {
				this.getSelectedEquipmentAssistance();
			})
		}
	}

	getSelectedEquipmentAssistance = () => {
		postData("sales/NeedAssessment/get_selected_equipment_assistancei", { need_assessment_id: this.state.need_assessment_id }).then((res) => {
			if (res.status) {
				this.setState(res.data)
			}
		});
	}

	onSubmit = (e) => {
		e.preventDefault();
		jQuery("#equipment_form").validate({ /* */ });
		this.setState({ loading: true });
		//if (jQuery("#equipment_form").valid()) {
		if (!this.state.loading && jQuery("#equipment_form").valid()) {
			postData('sales/NeedAssessment/save_equipment_assisstance', this.state).then((result) => {
				if (result.status) {
					this.setState({ loading: false });
					let msg = result.msg;
					toastMessageShow(msg, 's');
                    this.getSelectedEquipmentAssistance();
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
							<form id="equipment_form" autoComplete="off" className="col-md-12 slds_form" onSubmit={e => this.onSubmit(e)}>
								<div className="slds-panel__header">
									<h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Equipment/Aides</h2>
								</div>
								<div className="slds-panel__body">
									<div className="col-md-6">
										<div className="slds-form-element">
											<div className="slds-form-element__control">
												<div className="slds-checkbox">
													<input type="checkbox" name="not_applicable" id="not_applicable_chkbox" onChange={(e) => handleChange(this, e)} checked={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} />
													<label className="slds-checkbox__label" htmlFor="not_applicable_chkbox">
														<span className="slds-checkbox_faux"></span>
														<span className="slds-form-element__label">Not applicable</span>
													</label>
												</div>
											</div>
										</div>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label"> Walking Stick</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="stick_no" value="1" name="walking_stick" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.walking_stick && this.state.walking_stick == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="stick_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="stick_yes" value="2" name="walking_stick" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.walking_stick && this.state.walking_stick == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="stick_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes</span>
													</label>
												</span>
											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Wheel chair</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="chair_no" value="1" name="wheel_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.wheel_chair && this.state.wheel_chair == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="chair_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="chair_yes" value="2" name="wheel_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.wheel_chair && this.state.wheel_chair == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="chair_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes </span>
													</label>
												</span>
											</div>
										</fieldset>
										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Shower chair</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="schair_no" value="1" name="shower_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.shower_chair && this.state.shower_chair == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="schair_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="schair_yes" value="2" name="shower_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.shower_chair && this.state.shower_chair == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="schair_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes </span>
													</label>
												</span>
											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Transfer Aides</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="transfer_no" value="1" name="transfer_aides" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.transfer_aides && this.state.transfer_aides == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="transfer_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" id="transfer_yes" value="2" name="transfer_aides" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.transfer_aides && this.state.transfer_aides == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="transfer_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes </span>
													</label>
												</span>
											</div>
										</fieldset>

										<div className="slds-grid slds-grid_vertical-reverse" style={{ height: '168px' }}>
											<div className="slds-col mt-4">
											{
											Number(this.state.transfer_aides) === 2 ? 
												(	
												<span className="slds-radio" style={{ display: 'inline' }}>
													<textarea name="transfer_aides_description" className="slds-textarea" style={{ marginTop: '0px', marginBottom: '0px', height: '145px' }} disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this,e)} value={this.state.transfer_aides_description}></textarea>
												</span>
												)
											: 
												<React.Fragment />
										}
											</div>
											<div className="slds-col">
												<span></span>
											</div>
										</div>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Environmental Controls</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="1" id="dsa_no" name="daily_safety_aids" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.daily_safety_aids && this.state.daily_safety_aids == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="dsa_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="2" id="dsa_yes" name="daily_safety_aids" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.daily_safety_aids && this.state.daily_safety_aids == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="dsa_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes</span>
													</label>
												</span>

											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Description</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<textarea name="daily_safety_aids_description" className="slds-textarea" style={{ marginTop: '0px', marginBottom: '0px', height: '145px' }} disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this,e)} value={this.state.daily_safety_aids_description}></textarea>
												</span>
											</div>
										</fieldset>


									</div>

									<div className="col-md-6">
										{/*for blank space don't remove this*/}
										<div className="slds-form-element">
											<div className="slds-form-element__control">
												<div className="slds-checkbox">
													<label className="slds-checkbox__label" htmlFor="">
														<span className="slds-form-element__label"></span>
													</label>
												</div>
											</div>
										</div>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Walking frame</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="1" id="wframe_no" name="walking_frame" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.walking_frame && this.state.walking_frame == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="wframe_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="2" id="wframe_yes" name="walking_frame" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.walking_frame && this.state.walking_frame == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="wframe_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes</span>
													</label>
												</span>

											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Type</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="1" id="electric" name="type" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.type && this.state.type == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="electric">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Manual</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="2" id="motorised" name="type" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.type && this.state.type == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="motorised">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Motorised</span>
													</label>
												</span>
											</div>
										</fieldset>
										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Toilet Chair</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="1" id="tchair_no" name="toilet_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.toilet_chair && this.state.toilet_chair == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="tchair_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="2" id="tchair_yes" name="toilet_chair" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.toilet_chair && this.state.toilet_chair == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="tchair_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes </span>
													</label>
												</span>
											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Hoist or Sling</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="1" id="hoist_no" name="hoist_sling" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.hoist_sling && this.state.hoist_sling == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="hoist_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="2" id="hoist_yes" name="hoist_sling" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.hoist_sling && this.state.hoist_sling == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="hoist_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes</span>
													</label>
												</span>

											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Description</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<textarea name="hoist_sling_description" className="slds-textarea" style={{ marginTop: '0px', marginBottom: '0px', height: '145px' }} disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this,e)} value={this.state.hoist_sling_description}></textarea>
												</span>
											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Other Assistive Technology</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="1" id="other_no" name="other" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.other && this.state.other == 1) ? true : false} />
													<label className="slds-radio__label" htmlFor="other_no">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">No</span>
													</label>
												</span>
												<span className="slds-radio" style={{ display: 'inline' }}>
													<input type="radio" value="2" id="other_yes" name="other" disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this, e)} checked={(this.state.other && this.state.other == 2) ? true : false} />
													<label className="slds-radio__label" htmlFor="other_yes">
														<span className="slds-radio_faux"></span>
														<span className="slds-form-element__label">Yes</span>
													</label>
												</span>

											</div>
										</fieldset>

										<fieldset className="slds-form-element">
											<legend className="slds-form-element__legend slds-form-element__label">Description</legend>
											<div className="slds-form-element__control">
												<span className="slds-radio" style={{ display: 'inline' }}>
													<textarea name="other_description" className="slds-textarea" style={{ marginTop: '0px', marginBottom: '0px', height: '145px' }} disabled={(this.state.not_applicable && this.state.not_applicable == '1') ? true : false} onChange={(e) => handleChange(this,e)} value={this.state.other_description}></textarea>
												</span>
											</div>
										</fieldset>

									</div>
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
export default Equipment;