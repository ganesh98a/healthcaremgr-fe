import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css'
import { postData, toastMessageShow } from 'service/common.js';
import Button from '@salesforce/design-system-react/lib/components/button';
import DiagnosisAdd from './DiagnosisAdd.js'
import DiagnosisEdit from './DiagnosisEdit.js'
import SLDSReactTable from '../../../../salesforce/lightning/SLDSReactTable'
import { defaultSpaceInTable } from 'service/custom_value_data.js'
import moment from 'moment';

class Diagnosis extends Component {

	constructor(props) {
		super(props);
		this.state = {
			openAddDiagnosis: false,
			openEditDiagnosis: false,
			isResultAlreadySelected: false,
			diagnosisCount: 0
		}

		this.myRefForSelectedItem = React.createRef(); // that reference is send from item listing to edit
		this.myRefForSelectedItemFromEditScreen = React.createRef(); // that reference is send from edit to item listing
	}

	componentDidMount() {
		if (this.props.need_assessment_id) {
			this.setState({ need_assessment_id: this.props.need_assessment_id }, () => {
				this.getSelectedDiagnosisAssistance();
			})
		}
	}

	getSelectedDiagnosisAssistance = () => {
		return new Promise((resolve, reject) => {
			postData("sales/NeedAssessment/get_selected_diagnosis_assistance", { need_assessment_id: this.state.need_assessment_id }).then((res) => {
				if (res.status) {
					this.setState({ searchResult: res.data, isResultAlreadySelected: true, user_id: res.user_id }, () => {
						this.setState({ diagnosisCount: this.state.searchResult.length })
						resolve({ status: true, error: "" });
					})
				}
			});
		});
	}

	/*
	*close Diagnosis Dialog
	*param1 is true means item is selected from
	* search result and move to edit screen
	*/
	closeDiagnosisDialog = (param1) => {
		var tempStorage = this.myRefForSelectedItem.current.state.searchResult;
		if (param1) {
			var isOneChecked = this.IsIdInArray(tempStorage, 'selected')
			if (isOneChecked) {
				this.setState({ openAddDiagnosis: false, isResultAlreadySelected: false }, () => {
					this.setState({ openEditDiagnosis: true, selectedSearchResult: tempStorage })
				});
			} else {
				toastMessageShow('Select atleast one Item to continue.', "e");
			}
		} else {
			this.setState({ openAddDiagnosis: false, isResultAlreadySelected: false }, () => { });
		}
	}

	/*
	*search selected is set to true in selected key
	* in given array
	*/
	IsIdInArray = (array) => {
		for (var i = 0; i < array.length; i++) {
			if (array[i].selected === true || array[i].selected == '1')
				return true;
		}
		return false;
	}

	/*
	* close edit dialog and clear all state and props
	*/
	closeEditItemDialog = (needPageRefresh) => {
		this.setState({ openEditDiagnosis: false }, () => {
			this.getSelectedDiagnosisAssistance();
		})
	}

	/*
	*Close edit Dialog and move to `Add dialog`
	* with selected data
	*/
	backBtn = () => {
		var tempStorage = this.myRefForSelectedItemFromEditScreen.current.state.rows;
		this.setState({ openEditDiagnosis: false }, () => {
			this.setState({ openAddDiagnosis: true, searchResult: tempStorage, isResultAlreadySelected: true })
		})
	}

	checkDiagnosisLenAndOpenDialog = () => {
		if (this.state.diagnosisCount > 0) {
			this.getSelectedDiagnosisAssistance().then((res) => {
				if (res.status) {
					this.setState({ openAddDiagnosis: true });
				}
			});
		} else {
			this.setState({ openAddDiagnosis: true });
		}
	}

	determineColumns() {
		return [
			{
				_label: 'Diagnosis',
				accessor: "label",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
			},
            {
				_label: 'Primary Disability',
				accessor: "primary_disability",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">
					{(props.value == 1)?
						<div class="slds-form-element">
						<div class="slds-form-element__control">
						  <div class="slds-checkbox">
							<input type="checkbox" name="options" checked="true" />
							<label class="slds-checkbox__label">
							  <span class="slds-checkbox_faux"></span>
							  <span class="slds-form-element__label"></span>
							</label>
						  </div>
						</div>
					  </div>
					:''}
				</span>
			},
			{
				_label: 'Level of Support',
				accessor: "support_level",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => (
					<span className="slds-truncate">
						{defaultSpaceInTable((props.value == 1)?'High': (props.value == 2?'Medium':(props.value == 3?'Low':'')))}
					</span>
				),
			},
			{
				_label: 'Current Plan',
				accessor: "current_plan",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">
					{(props.value == 1)?
						<div class="slds-form-element">
						<div class="slds-form-element__control">
						  <div class="slds-checkbox">
							<input type="checkbox" name="options" checked="true" />
							<label class="slds-checkbox__label">
							  <span class="slds-checkbox_faux"></span>
							  <span class="slds-form-element__label"></span>
							</label>
						  </div>
						</div>
					  </div>
					:''}
				</span>
			},
			{
				_label: 'Plan End Date',
				accessor: "plan_end_date",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">{defaultSpaceInTable( (props.value)?moment(props.value).format('DD/MM/YYYY'):'' )}</span>
			},
			{
				_label: 'Impact on Participant',
				accessor: "impact_on_participant",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">
					{defaultSpaceInTable((props.value == 1)?'Severe': (props.value == 2?'Moderate':(props.value == 3?'Mild':(props.value == 4?' Managed by medication':''))))}
					</span>
			},
			{
				_label: 'Edited by',
				accessor: "admin_name",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
			},
			{
				_label: 'Edited date',
				accessor: "updated",
				Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
				Cell: props => <span className="slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
			}
		]
	}

	render() {
		return (
			<React.Fragment>
				<div className="slds-grid">
					<div className="slds-panel slds-size_full slds-is-open" aria-hidden="false">
						<div className="slds-panel__header">
							<h2 className="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Diagnosis</h2>
						</div>
						<div className="slds-panel__body">
							<div className="col-md-12 p-2">
								<Button label={(this.state.diagnosisCount > 0) ? "Edit" : "New"} className="slds-button slds-button_neutral" style={{ marginTop: '10px', float: "right" }}
									onClick={e => this.checkDiagnosisLenAndOpenDialog()} />
							</div>
							<div className="col-md-12 td_aligncenter">
								<SLDSReactTable
									// PaginationComponent={Pagination}
									PaginationComponent={React.Fragment}
									//ref={this.reactTable}
									manual="true"
									loading={this.state.loading}
									pages={this.state.pages}
									//onFetchData={this.fetchData}
									//filtered={this.state.filtered}
									//defaultFiltered={{filter_opportunity_status: 'all'}}
									columns={this.determineColumns()}
									data={this.state.searchResult}
									defaultPageSize={9999}
									minRows={1}
									onPageSizeChange={this.onPageSizeChange}
									noDataText="No records found"
									collapseOnDataChange={true}
									getTableProps={() => ({ className: `slds-table` })}
									style={{
										fontSize: 13
									}}
									resizable={true}
								className="-striped1 -highlight"
								// previousText={<span className="icon icon-arrow-left privious"></span>}
								// nextText={<span className="icon icon-arrow-right next"></span>}
								/>
							</div>
						</div>

						{(this.state.openAddDiagnosis) ?
							<DiagnosisAdd
								openAddDiagnosis={this.state.openAddDiagnosis}
								closeDiagnosisDialog={this.closeDiagnosisDialog}
								need_assessment_id={this.props.need_assessment_id}
								ref={this.myRefForSelectedItem}
								isResultAlreadySelected={this.state.isResultAlreadySelected}
								searchResult={this.state.searchResult}
							/> : ''}

						{(this.state.openEditDiagnosis) ?
							<DiagnosisEdit
								openEditDiagnosis={this.state.openEditDiagnosis}
								selectedSearchResult={this.state.selectedSearchResult}
								closeEditItemDialog={this.closeEditItemDialog}
								backBtn={this.backBtn}
								ref={this.myRefForSelectedItemFromEditScreen}
								need_assessment_id={this.props.need_assessment_id}
								user_id={this.state.user_id}

							/> : ''}
					</div>


				</div>
			</React.Fragment >
		);
	}
}

export default Diagnosis;