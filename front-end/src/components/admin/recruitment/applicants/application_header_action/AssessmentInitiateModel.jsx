import Button from '@salesforce/design-system-react/lib/components/button';
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Popover from '@salesforce/design-system-react/lib/components/popover';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import React, { Component } from 'react';
import 'react-block-ui/style.css';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, toastMessageShow } from 'service/common.js';
import 'service/custom_script.js';
import 'service/jquery.validate.js';
import { connect } from 'react-redux'
class AssessmentInitiateModel extends Component {
	/**
     * setting the initial prop values
     * @param {*} props 
     */
	constructor(props) { 
		super(props);
		checkItsNotLoggedIn();
		this.state = {
			loading: false,
			assessmentId: 0,
			selection: this.props.selection,
			isOpen: false,
		};
	}

	/**
     * handle open/close of the popup
     */
	handleOpenClose = () => {
		if(this.props.selectedApplications && !this.props.selectedApplications.length) {
			this.props.onClick();
			return false;
		}
		let isOpen = !this.state.isOpen;
		this.setState({ isOpen });
	};

	/**
     * handle initiating the online assessment
     */
	handleSend = () => {
		this.handleOpenClose();
		const url = 'recruitment/OnlineAssessment/initiate_assessment';
		this.setState({ loading: true });
		let application_details = [];
		let user_name = localStorage.getItem("user_name");
		if (this.props.isJobDetailsPage) {
			application_details[0] = {
				applicantId: this.props['applicant_id'],
				applicationId: this.props.application_id				
			};
		} else {
			this.props.selectedApplications.forEach((val, index) => {
				application_details[index] = {
					applicantId: val['applicant_id'],
					applicationId: val['application_id'],
					
				};
			});
		}
		let assessmentId = this.state.assessmentId;
		if(this.props.templateList.length == 1 && !this.state.assessmentId) {
			assessmentId = this.props.templateList[0].value;
		}
		const req = {
			assessmentId: assessmentId,
			jobId: this.props.jobId,
			recruiterName: user_name,
			application_details
		};
		// Call Api
		postData(url, req).then((result) => {
			if (result.status) {
				// Trigger success pop
				if(this.props.closeModal){
					this.props.closeModal(true);
				}
				if(this.props.resetSelection){
					this.props.resetSelection(true);
				}
				
				toastMessageShow(result.msg, 's');
			} else {
				// Trigger error pop
				toastMessageShow(result.error, 'e');
			}
			this.setState({ loading: false });
		});
	};
	/**
     * rendering components
     */
	render() {
		let assessmentId = this.state.assessmentId; 
		if(this.props.job_category != undefined && this.props.job_category != 1) {
			return ("");
		}
		if(this.props.templateList && this.props.templateList.length == 1) {
			assessmentId = this.props.templateList[0].value;			
		}

		
		return (
			<IconSettings iconPath={'/assets/salesforce-lightning-design-system/assets/icons'}>
				{!this.props.containsInvalidApplications && (
					<Popover
						align="top"
						isOpen={this.state.isOpen}
						hasNoCloseButton="true"
						onRequestClose={this.handleOpenClose}
						body={
							<div>
								<div className="slds-form-element">
									<label className="slds-form-element__label" id="initiate-oa-button-label">
										Select Online Assessment Template
									</label>
									<div className="slds-form-element__control">
										<SLDSReactSelect
											simpleValue={true}
											className="custom_select default_validation"
											options={this.props.templateList}
											onChange={(value) => this.setState({ assessmentId: value})}
											value={assessmentId}
											clearable={false}
											searchable={false}
											placeholder="Please Select"
											required={true}
											name="Status"
											id="initiate-oa-template-dropdown"
										/>
									</div>
								</div>
							</div>
						}
						footer={
							<div className="slds-text-align_right">
								<Button label="Cancel" id="initiate-oa-button-cancel" onClick={this.handleOpenClose} />
								<Button
									variant="brand"
									label="Send"
									id="initiate-oa-button-send"
									onClick={() => this.handleSend()}
									disabled={ !this.props.templateList || !assessmentId }
								/>
							</div>
						}
						id="popover-controlled-with-footer"
						{...this.props}
					>
						<Button
							label="Online Assessment"
							id="initiate-oa-button"
							disabled={this.props.disabled || this.state.loading}
							onClick={this.handleOpenClose}
						/>
					</Popover>
				)}

				{this.props.containsInvalidApplications && (
					<Popover
						align="bottom"
						isOpen={this.state.isOpen}
						onRequestClose={this.handleOpenClose}
						body={
							<div>
								<p className="slds-p-bottom_x-small" id="initiate-oa-unsuccessful">
									{this.props.oa_error_msg}
								</p>
							</div>
						}
						heading="Error"
						id="popover-error"
						variant="error"
						{...this.props}
					>
						<Button
							id="initiate-oa-button"
							label="Online Assessment"
							disabled={this.props.disabled || this.state.loading}
							onClick={this.handleOpenClose}
						/>
					</Popover>
				)}
			</IconSettings>
		);
	}
}

const mapStateToProps = state => ({ jobType: state.jobType })

export default connect(mapStateToProps)(AssessmentInitiateModel);
