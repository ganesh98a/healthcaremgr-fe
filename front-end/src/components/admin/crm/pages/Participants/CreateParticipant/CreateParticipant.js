import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import 'react-table/react-table.css';
import 'react-select-plus/dist/react-select-plus.css';
import { allLatestUpdate } from '../../../actions/DashboardAction.js';
import { crmParticipant, states, crmParticipantSubmit, states_update } from '../../../actions/CrmParticipantAction.js';
import { connect } from 'react-redux';
import jQuery from 'jquery';
import '../../../../../../service/jquery.validate.js';
import { ROUTER_PATH, BASE_URL } from '../../../../../../config.js';
import { postData, toastMessageShow, archiveALL, postImageData, postDataDownload } from '../../../../../../service/common.js';
import CrmPage from '../../../CrmPage';
import { RefererData } from './RefererData';
import { ParticipantAbilityPopup } from './ParticipantAbilityPopup';
import { ParticipantDetailsPopup } from './ParticipantDetailsPopup';
import ParticipantShiftPopup from './ParticipantShiftPopup';
import { ToastContainer, toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import { confirmAlert, createElementReconfirm } from 'react-confirm-alert';
import BlockUi from 'react-block-ui';

class NewParticipant extends Component {
	constructor(props, context) {
		super(props, context);
		this.allowExtentsion = ['jpg', 'jpeg', 'png', 'pdf'];
		this.handleSelect = this.handleSelect.bind(this);
		this.selectStateClose = React.createRef();
		this.state = {
			filterVal: '',
			key: 1,
			participant_id: '',
			p_id: '',
			RefererDetails_tab: true,
			ParticipantDetails_tab: false,
			ParticipantAbility_tab: false,
			Shift_tab: false,
			Customloading: false,
			refererDetails: {
				first_name: '',
				last_name: '',
				organisation: '',
				remail: '',
				phone_number: '',
				relation: ''
			},
			participantDetails: {
				ndisno: '',
				ndis_file_selected: '',
				hearing_file_selected: '',
				phonenumber: '',
				Dob: '',
				aboriginal_tsi: '',
				current_behavioural: '',
				email: '',
				firstname: '',
				lastname: '',
				preferredfirstname: '',
				livingsituation: '',
				maritalstatus: '',
				plan_management: 2,
				provide_plan: '',
				provide_state: '',
				provide_postcode: '',
				provide_email: '',
				provide_address: '',
				current_behavioural: 0,
				other_relevent_plans: 0,
				ndis_file: [],
				hearing_file: [],
				gender: 0,
				aboriginal_tsi: 0,
				medicare: '',
				crn: '',
				preferred_contact: '2',
				primary_contact: '',
				booking_status: '',
				kin_details: [{ first_name: '', last_name: '', relation: '', phone: '', email: '' }],

				booker_details: [{ first_name: '', last_name: '', relation: '', phone: '', email: '' }]
			},
			participantAbility: {
				legal_issues: 0,
				other_relevant_conformation: '',
				secondary_fomal_diagnosis_desc: '',
				primary_fomal_diagnosis_desc: '',
				languages_spoken: [],
				language_interpreter: 0,
				linguistic_diverse: 0,
				require_assistance: [],
				require_mobility: [],
				languages_spoken: [],
				hearing_interpreter: 0,
				communication: '',
				cognitive_level: '',
				languages_spoken_other: '',
				require_assistance_other: '',
				require_mobility_other: '',
				carer_gender: 1,
				ethnicity: [],
				religious_beliefs: [],
				carer_male: '0',
				carer_female: '0',
				carers_gender: '',
				old_participant_id: '',
				intake_type: ''
			},
			participantShift: {},
			redirect: '',
			checkrelation: false,
			disable: false,
			isEmailExist: false,
			loading: true,
			ndisExists: false,
			changedData: { refererDetails: [], participantDetails: [], participantAbility: [] },
			loaderParticipantDetails: false
		};
	}

	tab_active = e => {
		switch (e) {
			case 0:
				this.setState(
					{
						RefererDetails_tab: true,
						ParticipantDetails_tab: false,
						ParticipantAbility_tab: false,
						Shift_tab: false
					},
					() => {
						if (this.state.ErrorChecktabclick) {
							jQuery('#referral_details').valid();
						}
					}
				);
				break;

			case 1:
				this.setState(
					{
						RefererDetails_tab: false,
						ParticipantDetails_tab: true,
						ParticipantAbility_tab: false,
						Shift_tab: false
					},
					() => {
						if (this.state.ErrorChecktabclick) {
							jQuery('#partcipant_details').valid();
						}
					}
				);
				break;

			case 2:
				this.setState(
					{
						RefererDetails_tab: false,
						ParticipantDetails_tab: false,
						ParticipantAbility_tab: true,
						Shift_tab: false
					},
					() => {
						if (this.state.ErrorChecktabclick) {
							jQuery('#partcipant_ability').valid();
						}
					}
				);
				break;

			case 3:
				this.setState({
					RefererDetails_tab: false,
					ParticipantDetails_tab: false,
					ParticipantAbility_tab: false,
					Shift_tab: true
				});
				break;
		}
	};

	arrInputHandler = (e, name, obj, arrName, index) => {
		let mainObject = this.state[obj];

		let editArr = mainObject[arrName];
		let editObj = Object.assign({}, editArr[index]);

		editObj[name] = e.target.value;
		mainObject[arrName][index] = editObj;
		this.setState({ mainObject });
	};

	updateArrSelect = (val, name, obj, arrName, index) => {
		let mainObject = this.state[obj];
		let editArr = mainObject[arrName];
		let editObj = Object.assign({}, editArr[index]);
		editObj[name] = val;
		mainObject[arrName][index] = editObj;
		this.setState({ mainObject });
	};

	rowDeleteHandler = (e, mainObj, arrName, index) => {
		e.preventDefault();
		let mainObj1 = this.state[mainObj];
		let mainArr1 = mainObj1[arrName];
		mainArr1.splice(index, 1);
		mainObj1 = mainObj1[mainArr1];
		this.setState({ mainObj1 });
	};

	rowAddHandler = (e, mainObj, arrName) => {
		e.preventDefault();
		let obj = {
			first_name: '',
			last_name: '',
			relation: '',
			phone: '',
			email: ''
		};

		let mainObj1 = this.state[mainObj];
		let mainArr1 = mainObj1[arrName];
		mainArr1.push(obj);
		mainObj1 = mainObj1[mainArr1];
		this.setState({ mainObj1 });
	};

	googleAddressFill = (stateKey, fieldtkey, fieldValue, field, array_name = '') => {
		if (fieldtkey == 'street') {
			var componentForm = {
				street_number: 'short_name',
				route: 'long_name',
				locality: 'long_name',
				administrative_area_level_1: 'short_name',
				postal_code: 'short_name'
			};

			var addess_key = { street: '' };

			let participantDetails = this.state.participantDetails;
			if (fieldValue.address_components == undefined) {
				participantDetails['address'] = '';
				participantDetails['state'] = '';
				participantDetails['postcode'] = '';

				this.setState({
					participantDetails: participantDetails
				});
				return;
			}

			for (var i = 0; i < fieldValue.address_components.length; i++) {
				var addressType = fieldValue.address_components[i].types[0];
				if (componentForm[addressType]) {
					var val = fieldValue.address_components[i][componentForm[addressType]];
					if (addressType === 'route') {
						addess_key['street'] = addess_key['street'] + ' ' + val;
					} else if (addressType === 'street_number') {
						addess_key['street'] = val;
					} else if (addressType === 'locality') {
						// addess_key["city"] = { value: val, label: val };
						addess_key['city'] = val;
					} else if (addressType === 'administrative_area_level_1') {
						var t_index = this.state.suburbState.findIndex(x => x.label == val);
						addess_key['state'] = this.state.suburbState[t_index].value;
						// addess_key['state'] = val;
					} else if (addressType === 'postal_code') {
						addess_key['postal'] = val;
					}
				}
			}
			let state = this.state.participantDetails;
			if (field == 'personalAddress') {
				state['Address'] = addess_key.street;
				state['state'] = addess_key.state;
				state['city'] = addess_key.city;
				state['postcode'] = addess_key.postal;
				state['disabled'] = true;
				state['readOnly'] = true;
				if (array_name !== '') {
					this.setUpdatedData(array_name, 'Address', addess_key.street);
					this.setUpdatedData(array_name, 'provide_state', addess_key.state);
					this.setUpdatedData(array_name, 'provide_city', addess_key.city);
					this.setUpdatedData(array_name, 'provide_postcode', addess_key.postal);
				}
			} else {
				state['provide_address'] = addess_key.street;
				state['provide_state'] = addess_key.state;
				state['provide_city'] = addess_key.city;
				state['provide_postcode'] = addess_key.postal;
				state['disabled'] = true;
				state['readOnly'] = true;
				if (array_name !== '') {
					this.setUpdatedData(array_name, 'provide_address', addess_key.street);
					this.setUpdatedData(array_name, 'provide_state', addess_key.state);
					this.setUpdatedData(array_name, 'provide_city', addess_key.city);
					this.setUpdatedData(array_name, 'provide_postcode', addess_key.postal);
				}
			}

			this.setState(state);
		}
	};

	deletefile = (name, array_name, index) => {
		let state = this.state.participantDetails;
		let reqData = {};

		if (state['crm_participant_id']) {
			let stsData = true;
			if (name == 'behaviouraldoc' && state['hearing_file'][index]['docs_id']) {
				reqData['hearing_file_id'] = state['hearing_file'][index]['docs_id'];
				reqData['hearing_file_name'] = state['hearing_file'][index]['name'];
				reqData['crm_participant_id'] = state['crm_participant_id'];
			} else if (name == 'ndisdoc' && state['ndis_file'][index]['docs_id']) {
				reqData['ndis_file_id'] = state['ndis_file'][index]['docs_id'];
				reqData['ndis_file_name'] = state['ndis_file'][index]['name'];
				reqData['crm_participant_id'] = state['crm_participant_id'];
			} else {
				stsData = false;
				let ModeleDataName = name == 'behaviouraldoc' ? 'hearing_file' : 'ndis_file';
				this.handleRemoveShareholder(array_name, ModeleDataName, index);
			}

			if (stsData) {
				let msg = (
					<span>
						Are you sure you want to delete this document? <br /> Once deleted, this action can not be undone.
					</span>
				);

				archiveALL(reqData, msg, 'crm/CrmParticipant/delete_participant_docs').then(result => {
					if (result.status) {
						toastMessageShow('Participant document deleted successfully', 's');
						let ModeleDataName = name == 'behaviouraldoc' ? 'hearing_file' : 'ndis_file';
						this.handleRemoveShareholder(array_name, ModeleDataName, index);
					}
				});
			}
		} else {
			let ModeleDataName = name == 'behaviouraldoc' ? 'hearing_file' : 'ndis_file';
			this.handleRemoveShareholder(array_name, ModeleDataName, index);
		}
	};

	// viewDocuments = (filePath) => {
	//      this.setState({ Customloading: true});
	//      let data = { crmParticipantId: this.state.participant_id, path: filePath };
	//      setTimeout(() => postDataDownload('download/file', data, filePath), 200);
	//      setTimeout(() =>  this.setState({Customloading:false}), 1000);
	// };
	// viewPlanDocuments = (filePath) => {
	//     this.setState({ Customloading: true});
	//     let data = { crmParticipantId: this.state.participant_id, path: filePath };
	//     setTimeout(() => postDataDownload('download/file', data, filePath), 200);
	//     setTimeout(() =>  this.setState({Customloading:false}), 1000);
	// };

	viewDocuments = filePath => {
		this.setState({ loaderParticipantDetails: true });
		let data = { crmParticipantId: this.state.participant_id, path: filePath };
		postDataDownload('download/file', data, filePath).then(() => {
			this.setState({ loaderParticipantDetails: false });
		});
	};

	viewPlanDocuments = filePath => {
		this.setState({ loaderParticipantDetails: true });
		let data = { crmParticipantId: this.state.participant_id, path: filePath };
		postDataDownload('download/file', data, filePath).then(() => {
			this.setState({ loaderParticipantDetails: false });
		});
	};

	handleRemoveShareholder = (mainStateNamee, stateName, index) => {
		var stateData = [];
		stateData[mainStateNamee] = [];
		var List = this.state[mainStateNamee][stateName];
		stateData = List.filter((s, sidx) => {
			return index !== sidx;
		});

		this.setState(
			{
				...this.state,
				[mainStateNamee]: {
					...this.state[mainStateNamee],
					[stateName]: stateData
				}
			},
			() => {}
		);
	};

	handleShiftCheckbox = (e, array_name, week) => {
		let details = this.state[array_name];

		let data = details[e.target.name][week] != null ? details[e.target.name][week] : [];

		if (data.includes(e.target.value)) {
			var index = data.indexOf(e.target.value);
			if (index != -1) {
				data.splice(index, 1);
			}
		} else {
			data.push(e.target.value);
		}
		details[e.target.name][week] = data;
		this.setState({ [array_name]: details });
	};

	handleCheckboxValue = (e, array_name) => {
		let details = this.state[array_name];
		let data = details[e.target.name] != null ? details[e.target.name] : [];
		if (data.includes(e.target.value)) {
			var index = data.indexOf(e.target.value);
			if (index != -1) {
				data.splice(index, 1);
			}
		} else {
			data.push(e.target.value);
		}
		details[e.target.name + '_error'] = false;
		details[e.target.name] = data;
		this.setState({ [array_name]: details });
		// Storing changedData into states
		this.setUpdatedData(array_name, e.target.name, e.target.value);
	};

	carerCheckHandler = (e, array_name) => {
		const arrayName = this.state[array_name];
		const fieldName = arrayName[e.target.name];

		if (fieldName == 0) {
			const carer_ethnicity = this.state.ethnicityOpts.map((val, i) => val.value);
			const carer_religious_beliefs = this.state.religious_beliefs_opts.map((val, i) => val.value);
			arrayName[e.target.name] = 1;
			arrayName[e.target.name + '_ethnicity'] = carer_ethnicity;
			arrayName[e.target.name + '_religious_beliefs'] = carer_religious_beliefs;
		} else {
			arrayName[e.target.name] = 0;
			arrayName[e.target.name + '_ethnicity'] = [];
			arrayName[e.target.name + '_religious_beliefs'] = [];
		}
		this.setState({
			array_name: arrayName
		});
	};

	selectChange = (selectedOption, fieldname, array_name) => {
		this.handleSelectClose();
		var state = this.state[array_name];
		state[fieldname] = selectedOption;
		state[fieldname + '_error'] = false;
		this.setState({ [array_name]: state });
		// Storing data in changedData state
		this.setUpdatedData(array_name, fieldname, selectedOption);
	};

	validateElement = elemId => {
		var validator = jQuery('#' + elemId).validate();
		validator.element('#' + elemId);
	};

	handleSelectClose = () => {
		this.selectStateClose.current.setState({ isOpen: false });
	};

	setUpdatedData = (array_name, field_name, field_value) => {
		if (this.state.participant_id) {
			var fieldList = this.state['changedData'];
			if (fieldList['refererDetails'] !== undefined || fieldList['participantDetails'] !== undefined || fieldList['participantAbility'] !== undefined) {
				var exist = 0;
				var index = 0;
				fieldList[array_name].forEach((value, key) => {
					if (field_name in value) {
						exist = 1;
						index = key;
						return;
					}
				});
				if (exist) {
					fieldList[array_name][index][field_name] = field_value;
				} else {
					fieldList[array_name].push({ [field_name]: field_value });
				}
			} else {
				fieldList[array_name].push({ [field_name]: field_value });
			}
			this.setState({ changedData: fieldList });
		}
	};

	handleChange = (e, array_name) => {
		this.handleSelectClose();
		var inputFields = this.state[array_name];
		if (e.target.type == 'file') {
			this.selectAttchment(e, array_name, e.target.name);
		} else {
			this.setState({ error: '' });
			inputFields[e.target.name] = e.target.value;
			this.setState({ [array_name]: inputFields });
			this.setUpdatedData(array_name, e.target.name, e.target.value);
		}
	};

	selectAddress = place => {
		let state = this.state.participantDetails;
		state['Address'] = place.formatted_address;
		this.setState(state);
	};

	fileUploadHandler = e => {
		this.setState({ progress: '0' });
		let formData = new FormData();
		formData.append('uploader', e.target.files[0]);
		postImageData('crm/CrmParticipant/uploadNdisAttchments', formData, this).then(resp => {
			console.log(resp);
		});
	};

	selectAttchment = (event, array_name) => {
		this.setState({ progress: '0', loaderParticipantDetails: true });
		var keyName = event.target.name;
		var inputFields = this.state[array_name];
		var tempState = event.target.files;

		this.setState({
			[event.target.name + '_disabled']: true
		});

		if (tempState.length > 0) {
			this.setUpdatedData(array_name, event.target.name, true);
			let formData = new FormData();
			Object.keys(tempState).map((val, i) => {
				if (!val.hasOwnProperty('docs_id')) {
					formData.append('files[]', tempState[val]);
				}
			});

			postImageData('crm/CrmParticipant/uploadNdisAttchments', formData, this).then(resp => {
				if (resp.status) {
					if (resp.files.length > 0) {
						for (var i = 0; i < resp.files.length; i++) {
							inputFields[keyName].push(resp.files[i]);
						}

						this.setState({
							[array_name]: inputFields
						});
					}
				} else {
				}
				if (resp.error !== null) {
					toastMessageShow(resp.error, 'e');
				}

				inputFields[keyName + '_selected'] = '';
				this.setState({
					[keyName + '_disabled']: false,
					[array_name]: inputFields
				});
				this.setState({ loaderParticipantDetails: false });
			});
		}
	};

	extensionError = () => {
		var error = (
			<div>
				Sorry only supported <br /> jpg, jpeg, png, pdf
			</div>
		);
		toastMessageShow(error, 'e');
	};

	handleNdisno = (e, array_name) => {
		var inputFields = this.state[array_name];
		this.setState({ error: '' });
		var text = (inputFields[e.target.name] = e.target.value);
		var textCount = text.length;
		if (textCount == 9) {
			// request json
			var Request = JSON.stringify({ ndis_num: text });
			postData('crm/CrmParticipant/checkNdis', Request).then(result => {
				if (result.status == false) {
					this.setState({ loading: true }, () => {
						var res = result.data;
						var data = JSON.stringify({ ndis_num: text });
						var msg = <span>NDIS number already exists, Are you sure you want to continue ?</span>;

						return new Promise((resolve, reject) => {
							confirmAlert({
								customUI: ({ onClose }) => {
									return (
										<div className="custom-ui">
											<div className="confi_header_div">
												<h3>Confirmation</h3>
												<span
													className="icon icon-cross-icons"
													onClick={() => {
														onClose();
														resolve({ status: false });
													}}></span>
											</div>
											<p>{msg}</p>
											<div className="confi_but_div">
												<button
													className="Confirm_btn_Conf"
													onClick={() => {
														// postData(url, data).then((result) => {
														//     resolve({ result });
														onClose();
														let refererDetails = {};
														let participantDetails = {};
														let participantAbility = {};
														let participantShift = {};
														let changedData = {};

														refererDetails = {
															first_name: res.referral_firstname,
															last_name: res.referral_lastname,
															remail: res.referral_email,
															phone_number: res.referral_phone,
															organisation: res.referral_org,
															relation: res.referral_relation
														};
														participantDetails = {
															firstname: res.firstname,
															middlename: res.middlename,
															lastname: res.lastname,
															phonenumber: res.phone,
															gender: res.gender,
															email: res.email,
															ndisno: res.ndis_num,
															preferredfirstname: res.preferredname,
															Dob: res.dob,
															livingsituation: res.living_situation,
															aboriginal_tsi: res.aboriginal_tsi,
															crm_participant_id: res.crm_participant_id,
															martialstatus: res.marital_status,
															current_behavioural: res.behavioural_support_plan,
															other_relevent_plans: res.other_relevant_plans,
															plan_management: res.ndis_plan,
															Address: res.primary_address,
															state: res.state,
															city: res.city,
															postcode: res.postal,
															provide_plan: res.manager_plan,
															provide_email: res.manager_email,
															provide_address: res.manager_address,
															provide_state: res.manager_state,
															provide_postcode: res.manager_postcode,
															/* hearing_file_name:res.hearing_file_name,
                                                                                                                        ndis_file_name:res.ndis_file_name,
                                                                                                                        hearing_file_id:res.hearing_file_id,
                                                                                                                        ndis_file_id:res.ndis_file_id, */
															hearing_file: res.hearing_file,
															ndis_file: res.ndis_file,
															medicare: res.medicare_num,
															crn: res.crn,
															preferred_contact: res.prefer_contact,
															primary_contact: '',
															kin_details: res.participant_kin_details,
															booker_details: res.booking_list_details,
															booking_status: res.booking_status
														};
														participantAbility = {
															cognitive_level: res.ability.cognitive_level,
															communication: res.ability.communication,
															hearing_interpreter: res.ability.hearing_interpreter,
															require_mobility: res.ability.require_mobility,
															require_assistance: res.ability.require_assistance,
															linguistic_diverse: res.ability.linguistic_diverse,
															language_interpreter: res.ability.language_interpreter,
															languages_spoken: res.ability.languages_spoken,
															primary_fomal_diagnosis_desc: res.ability.primary_fomal_diagnosis_desc,
															secondary_fomal_diagnosis_desc: res.ability.secondary_fomal_diagnosis_desc,
															other_relevant_conformation: res.ability.other_relevant_information,
															legal_issues: res.ability.legal_issues,
															languages_spoken_other: res.ability.languages_spoken_other,
															require_mobility_other: res.ability.require_mobility_other,
															require_assistance_other: res.ability.require_assistance_other,
															carers_gender: res.carers_gender,
															ethnicity: res.ability.ethnicity,
															religious_beliefs: res.ability.religious_beliefs,
															old_participant_id: res.crm_participant_id,
															intake_type: res.intake_type
														};

														changedData = {
															changedData: res.changedData
														};

														this.setState({
															refererDetails,
															participantDetails,
															participantAbility,
															participantShift,
															changedData,
															p_id: res.id,
															loading: false,
															ndisExists: true
														});
														// })
														// })
													}}>
													Confirm
												</button>
												<button
													className="Cancel_btn_Conf"
													onClick={() => {
														onClose();
														resolve({ status: false });
														this.setState({ loading: false });
													}}>
													{' '}
													Cancel
												</button>
											</div>
										</div>
									);
								}
							});
						});
					});
				}
			});
		}
		this.setState({ [array_name]: inputFields });
	};

	custom_validation_details = () => {
		var return_var = true;
		var state = this.state['participantDetails'];
		var List = [{ key: 'state' }, { key: 'provide_state' }, { key: 'martialstatus' }, { key: 'livingsituation' }];
		List.map((object, sidx) => {
			if (object.key == 'provide_state' && state['plan_management'] == 3) {
				if (state[object.key] == null || state[object.key] == '') {
					state[object.key + '_error'] = true;
					this.setState(state);
					return_var = false;
				}
			} else {
				if ((state[object.key] == null || state[object.key] == '') && object.key != 'provide_state') {
					state[object.key + '_error'] = true;
					this.setState(state);
					return_var = false;
				}
			}
		});
		return return_var;
		return return_var;
	};

	custom_validation_ability = () => {
		var return_var = true;
		var state = this.state['participantAbility'];
		var List = [{ key: 'cognitive_level' }, { key: 'communication' }, { key: 'require_mobility' }, { key: 'require_assistance' }, { key: 'languages_spoken' }];
		List.map((object, sidx) => {
			if (state[object.key] == null || state[object.key] == '') {
				state[object.key + '_error'] = true;
				this.setState(state);
				return_var = false;
			}
		});
		return return_var;
	};

	custom_validation_shift = () => {
		var return_var = true;
		var state = this.state['participantShift'];
		var List = [{ key: 'shift_requirement' }, { key: 'shiftsvalues' }];
		List.map((object, sidx) => {
			if (state[object.key] == null || state[object.key] == '') {
				state[object.key + '_error'] = true;
				this.setState(state);
				return_var = false;
			}
		});
		return return_var;
	};

	custom_validation_refer = () => {
		var return_var = true;
		var state = this.state['refererDetails'];
		var List = [{ key: 'relation' }];
		List.map((object, sidx) => {
			if (state[object.key] == null || state[object.key] == '') {
				state[object.key + '_error'] = true;
				this.setState(state);
				return_var = false;
			}
		});
		return return_var;
	};

	submitReferDetails = e => {
		e.preventDefault();
		var custom_validate = true;
		var validator = jQuery('#referral_details').validate();
		jQuery('#relation')
			.attr('name', 'relation')
			.attr('data-msg', 'Referer Relationship to Participant is required');

		if (jQuery('#referral_details').valid() && custom_validate) {
			if (this.state.refererDetails.relation == '2') {
				this.state.checkrelation = true;
				this.state.participantDetails.firstname = this.state.refererDetails.first_name;
				this.state.participantDetails.lastname = this.state.refererDetails.last_name;
				this.state.participantDetails.email = this.state.refererDetails.remail;
				this.state.participantDetails.phonenumber = this.state.refererDetails.phone_number;
			} else if (this.state.checkrelation == true) {
				this.state.checkrelation = false;
				this.state.participantDetails.firstname = '';
				this.state.participantDetails.lastname = '';
				this.state.participantDetails.email = '';
				this.state.participantDetails.phonenumber = '';
			}
			var str = JSON.stringify(this.state);
			this.props.crmParticipant(str);
			this.tab_active(1);
		} else {
			validator.focusInvalid();
		}
	};

	submitParticipantDetails = e => {
		e.preventDefault();
		var isEmailExist = false;
		var custom_validate = true;
		var validator = jQuery('#partcipant_details').validate();
		jQuery('#state')
			.attr('name', 'state')
			.attr('data-msg', 'Participant state is required');
		jQuery('#preferred_contact')
			.attr('name', 'preferred_contact')
			.attr('data-msg', 'Preferred Contact is required');
		jQuery('#kin_relation')
			.attr('name', 'kin_relation')
			.attr('data-msg', 'Relation is required');
		jQuery('#booker_relation')
			.attr('name', 'booker_relation')
			.attr('data-msg', 'Relation is required');
		jQuery('#maritalstatus')
			.attr('name', 'maritalstatus')
			.attr('data-msg', 'Participant Marital Status is required');
		jQuery('#livingsituation')
			.attr('name', 'livingsituation')
			.attr('data-msg', 'Participant Living Situation is required');
		jQuery('#provide_state')
			.attr('name', 'provide_state')
			.attr('data-msg', 'Participant state is required');

		if (!this.state.ndisExists && jQuery('#partcipant_details').valid()) {
			postData('crm/CrmParticipant/check_participant_email_id', {
				crm_participant_id: this.state.participant_id !== undefined ? this.state.participant_id : '',
				ndis_number: this.state.participantDetails.ndisno !== undefined ? this.state.participantDetails.ndisno : '',
				email: this.state.participantDetails.email
			}).then(result => {
				if (result.status) {
					isEmailExist = true;
				} else {
					isEmailExist = false;
					toast.error(<ToastUndo message={result.error} />, {
						position: toast.POSITION.TOP_CENTER,
						hideProgressBar: true
					});
				}

				if (jQuery('#partcipant_details').valid() && custom_validate && isEmailExist) {
					var str = JSON.stringify(this.state);
					this.props.crmParticipant(str);
					this.tab_active(2);
				} else {
					validator.focusInvalid();
				}
			});
		} else {
			if (jQuery('#partcipant_details').valid() && custom_validate) {
				var str = JSON.stringify(this.state);
				this.props.crmParticipant(str);
				this.tab_active(2);
			} else {
				validator.focusInvalid();
			}
		}
	};

	submitParticipantAbility = e => {
		e.preventDefault();

		var custom_validate = true;
		var validator = jQuery('#partcipant_ability').validate({ ignore: [] });
		jQuery('#cognitive_level')
			.attr('name', 'cognitive_level')
			.attr('data-msg', 'Participant Cognitive Level is required');
		jQuery('#communication')
			.attr('name', 'communication')
			.attr('data-msg', 'Participant Communication is required');

		if (jQuery('#partcipant_ability').valid() && custom_validate) {
			if (this.state.participant_id) {
				const refererDetails = this.state.refererDetails;
				const participantDetails = this.state.participantDetails;
				const participantAbility = this.state.participantAbility;
				const participant_id = this.state.participant_id;
				const changedData = this.state.changedData;
				const ndisExist = false;
				let obj = {
					refererDetails,
					participantDetails,
					participantAbility,
					participant_id,
					ndisExist,
					changedData
				};
				this.finalSubmitParticipant(obj);
			} else {
				this.tab_active(3);
			}
		} else {
			validator.focusInvalid();
		}
	};

	submitParticipantShift = data => {
		this.setState({
			participantShift: data
		});

		const refererDetails = this.state.refererDetails;
		const participantDetails = this.state.participantDetails;
		const participantAbility = this.state.participantAbility;
		const participantShift = data;
		const participant_id = '';
		const ndisExist = this.state.ndisExists;
		let obj = {
			refererDetails,
			participantDetails,
			participantAbility,
			participantShift,
			participant_id,
			ndisExist
		};
		this.finalSubmitParticipant(obj);
	};

	finalSubmitParticipant = obj => {
		this.setState({ loading: false });
		var validate_partcipant = jQuery('#partcipant_details').validate({
			ignore: []
		});
		// var validate_referral = jQuery("#referral_details").validate({
		//     ignore: []
		// });
		var validate_ability = jQuery('#partcipant_ability').validate({
			ignore: []
		});

		if (jQuery('#partcipant_details').valid() && jQuery('#partcipant_ability').valid()) {
			if (
				this.state.participantAbility.ndisExist &&
				(this.state.participantAbility.intake_type == 1 || this.state.participantAbility.intake_type == 3 || this.state.participantAbility.booking_status != 5)
			) {
				var type = this.state.participantAbility.intake_type == 1 ? 'New' : 'Return';
				toast.error(<ToastUndo message={'Sorry, Participant intake type is ' + type + ' So you can not save the details from this page'} showType={'e'} />, {
					position: toast.POSITION.TOP_CENTER,
					hideProgressBar: true
				});
				//this.setState({ success: true });
			} else {
				this.setState({ Customloading: true });
				if (this.state.participant_id) {
					postData('crm/CrmParticipant/update_crm_participant', obj).then(result => {
						this.setState({ Customloading: false });
						if (result.status) {
							toast.success(<ToastUndo message={'Participant Updated Successfully'} showType={'s'} />, {
								position: toast.POSITION.TOP_CENTER,
								hideProgressBar: true
							});
							this.setState({ success: true });
						} else {
							toast.error(<ToastUndo message={result.error} showType={'e'} />, {
								position: toast.POSITION.TOP_CENTER,
								hideProgressBar: true
							});
						}
						// this.setState({ success: true });
					});
				} else {
					postData('crm/CrmParticipant/create_crm_participant', obj).then(result => {
						this.setState({ Customloading: false });
						if (result.status) {
							this.setState(result.data);
							toast.success(<ToastUndo message={'Participant Created Successfully'} showType={'s'} />, {
								position: toast.POSITION.TOP_CENTER,
								hideProgressBar: true
							});
							this.setState({ success: true });
						} else {
							toast.error(<ToastUndo message={result.error} showType={'e'} />, {
								position: toast.POSITION.TOP_CENTER,
								hideProgressBar: true
							});
						}
					});
				}
			}
		} else {
			this.setState({ ErrorChecktabclick: true });
			var errors = '';

			// for (var i = 0; i < validate_referral.errorList.length; i++) {
			//     errors += validate_referral.errorList[i]["message"] + ".,";
			// }
			for (var i = 0; i < validate_partcipant.errorList.length; i++) {
				errors += validate_partcipant.errorList[i]['message'] + '.,';
			}
			for (var i = 0; i < validate_ability.errorList.length; i++) {
				errors += validate_ability.errorList[i]['message'] + '.,';
			}
			toastMessageShow(errors, 'e');
		}
	};

	submitParticipantShift2 = data => {
		var str = this.state;
		if (!this.state.participant_id) {
			str.participantShift = data;
		}
		var msg = '';
		// var custom_validate2 = true;
		// var custom_validate3 = true;
		// var custom_validate4 = true;
		var validate_partcipant = jQuery('#partcipant_details').validate({
			ignore: []
		});
		// var validate_referral = jQuery("#referral_details").validate({
		//     ignore: []
		// });
		var validate_ability = jQuery('#partcipant_ability').validate({
			ignore: []
		});

		if (jQuery('#partcipant_details').valid() && jQuery('#partcipant_ability').valid()) {
			//  && jQuery("#partcipant_ability").valid()  && jQuery("#referral_details").valid()  && custom_validate2 && custom_validate3 && custom_validate4) {
			var str = JSON.stringify(this.state);
			const formData = new FormData();
			if (this.state.participant_id) {
				formData.append('participant_id', this.state.participant_id);
				formData.append('action', 'edit');
				msg = 'Participant updated successfully';
			} else if (this.state.p_id) {
				formData.append('participant_id', this.state.p_id);
				formData.append('action', '');
				msg = 'Participant created successfully';
			} else {
				formData.append('participant_id', '');
				formData.append('action', '');
				msg = 'Participant created successfully';
			}
			if (this.state.participantDetails.ndis_file.length > 0) {
				this.state.participantDetails.ndis_file.map((val, index) => {
					if (!val.hasOwnProperty('docs_id')) {
						formData.append('ndis[]', val);
					}
				});
			} else {
				//formData.append('ndis[]', this.state.participantDetails.ndis_file);
			}
			if (this.state.participantDetails.hearing_file.length > 0) {
				this.state.participantDetails.hearing_file.map((val, index) => {
					if (!val.hasOwnProperty('docs_id')) {
						formData.append('hearing[]', val);
					}
				});
			} else {
				//formData.append('hearing[]', this.state.participantDetails.hearing_file);
			}
			formData.append('data', str);

			this.setState({ disable: true });
			this.props.crmParticipantSubmit(formData).then(json => {
				if (json.status) {
					this.setState({ success: true, disable: false });
					toast.success(<ToastUndo message={msg} showType={'s'} />, {
						position: toast.POSITION.TOP_CENTER,
						hideProgressBar: true
					});
				} else {
					this.setState({ disable: false });
					toast.error(<ToastUndo message={json.error} />, {
						position: toast.POSITION.TOP_CENTER,
						hideProgressBar: true
					});
				}
			});
		} else {
			this.setState({ ErrorChecktabclick: true });
			var erroes = '';

			// for (var i = 0; i < validate_referral.errorList.length; i++) {
			//     erroes += validate_referral.errorList[i]["message"] + ".,";
			// }
			for (var i = 0; i < validate_partcipant.errorList.length; i++) {
				erroes += validate_partcipant.errorList[i]['message'] + '.,';
			}
			for (var i = 0; i < validate_ability.errorList.length; i++) {
				erroes += validate_ability.errorList[i]['message'] + '.,';
			}

			toastMessageShow(erroes, 'e');
		}
	};

	handleSelect(key) {
		this.setState({ key });
	}

	errorShowInTooltip = ($key, msg, array) => {
		var state = this.state[array];
		return state[$key + '_error'] ? (
			<div className={'tooltip custom-tooltip fade top in' + (state[$key + '_error'] ? ' select-validation-error' : '')} role="tooltip">
				<div className="tooltip-arrow"></div>
				<div className="tooltip-inner">{msg}.</div>
			</div>
		) : (
			''
		);
	};

	handleSelect(key) {
		this.setState({ key });
	}

	getDropdowns = () => {
		postData('crm/CrmParticipant/get_participant_dropdown_list', []).then(result => {
			if (result.status) {
				this.setState({
					cognitive_level: result.data.cognitive_level,
					communicationOpts: result.data.communication_type,
					living_situation: result.data.living_situation,
					marital_status: result.data.marital_status,
					relations_participant: result.data.relations_participant,
					suburbState: result.data.state,
					relationOpts: result.data.relations,
					mobilityOpts: result.data.mobility,
					assistanceOpts: result.data.assistance,
					ethnicityOpts: result.data.ethnicity,
					religious_beliefs_opts: result.data.religious_beliefs,
					languagesOpts: result.data.languages
				});
			}
			this.setState({ loading: false });
		});
	};

	componentWillMount() {
		this.getDropdowns();
		if (this.props.props.match.params.id) {
			this.setState({ participant_id: this.props.props.match.params.id });
			this.getParticipantDetails();
		}
	}

	getParticipantDetails = () => {
		let refererDetails = {};
		let participantDetails = {};
		let participantAbility = {};
		let participantShift = {};
		this.setState({ loading: true });

		postData('crm/CrmParticipant/get_prospective_participant_details', {
			id: this.props.props.match.params.id
		}).then(result => {
			if (result.status) {
				refererDetails = {
					first_name: result.data.referral_firstname,
					last_name: result.data.referral_lastname,
					remail: result.data.referral_email,
					phone_number: result.data.referral_phone,
					organisation: result.data.referral_org,
					relation: result.data.referral_relation
				};
				participantDetails = {
					firstname: result.data.firstname,
					middlename: result.data.middlename,
					lastname: result.data.lastname,
					phonenumber: result.data.phone,
					gender: result.data.gender,
					email: result.data.email,
					ndisno: result.data.ndis_num,
					preferredfirstname: result.data.preferredname,
					Dob: result.data.dob,
					livingsituation: result.data.living_situation,
					aboriginal_tsi: result.data.aboriginal_tsi,
					crm_participant_id: result.data.crm_participant_id,
					martialstatus: result.data.marital_status,
					current_behavioural: result.data.behavioural_support_plan,
					other_relevent_plans: result.data.other_relevant_plans,
					plan_management: result.data.ndis_plan,
					Address: result.data.primary_address,
					state: result.data.state,
					city: result.data.city,
					postcode: result.data.postal,
					provide_plan: result.data.manager_plan,
					provide_email: result.data.manager_email,
					provide_address: result.data.manager_address,
					provide_state: result.data.manager_state,
					provide_postcode: result.data.manager_postcode,
					hearing_file: result.data.hearing_file,
					ndis_file: result.data.ndis_file,
					medicare: result.data.medicare_num,
					crn: result.data.crn,
					preferred_contact: result.data.prefer_contact,
					primary_contact: '',
					kin_details: result.data.participant_kin_details,
					// kin_details: [
					//   { 'first_name': '', 'last_name': '', 'relation': '', 'phone': '', 'email': '' }
					// ],
					booker_details: result.data.booking_list_details,
					old_participant_id: result.data.id,
					booking_status: result.data.booking_status
					// booker_details: [
					//   { 'first_name': '', 'last_name': '', 'relation': '', 'phone': '', 'email': '' }
					// ]
				};
				participantAbility = {
					cognitive_level: result.data.ability.cognitive_level,
					communication: result.data.ability.communication,
					hearing_interpreter: result.data.ability.hearing_interpreter,
					require_mobility: result.data.ability.require_mobility,
					require_assistance: result.data.ability.require_assistance,
					linguistic_diverse: result.data.ability.linguistic_diverse,
					language_interpreter: result.data.ability.language_interpreter,
					languages_spoken: result.data.ability.languages_spoken,
					primary_fomal_diagnosis_desc: result.data.ability.primary_fomal_diagnosis_desc,
					secondary_fomal_diagnosis_desc: result.data.ability.secondary_fomal_diagnosis_desc,
					other_relevant_conformation: result.data.ability.other_relevant_information,
					legal_issues: result.data.ability.legal_issues,
					languages_spoken_other: result.data.ability.languages_spoken_other,
					require_mobility_other: result.data.ability.require_mobility_other,
					require_assistance_other: result.data.ability.require_assistance_other,
					carers_gender: result.data.carers_gender,
					ethnicity: result.data.ability.ethnicity,
					religious_beliefs: result.data.ability.religious_beliefs,
					old_participant_id: result.data.crm_participant_id,
					intake_type: result.data.intake_type
				};
			}
			this.setState({
				refererDetails,
				participantDetails,
				participantAbility,
				participantShift,
				loading: false
			});
		});
	};
	render() {
		if (this.state.success) {
			return <Redirect to="/admin/crm/prospectiveparticipants" />;
		}
		if (this.state.redirect) {
			if (this.state.participantId) window.location = ROUTER_PATH + 'admin/crm/editProspectiveParticipant/' + this.state.participantId;
		}
		var options = [
			{ value: 'one', label: 'One' },
			{ value: 'two', label: 'Two' }
		];

		return (
			<div>
				<BlockUi tag="div" blocking={this.state.Customloading}>
					<CrmPage pageTypeParms={'crm_dashboard'} />

					<div className="row">
						<div className="col-lg-12">
							<div className="py-4 bb-1">
								<a className="back_arrow d-inline-block" onClick={() => this.props.props.history.goBack()} /*href={ROUTER_PATH + 'admin/dashboard'}*/>
									<span className="icon icon-back1-ie"></span>
								</a>
							</div>
						</div>
					</div>

					<div className="row _Common_He_a">
						<div className="col-lg-9 col-xs-9">
							<h1 className="my-0 color"> {this.state.participant_id ? 'Edit Prospective Participant' : 'Create New Participant'}</h1>
						</div>
					</div>
					<div className="row ">
						<div className="col-lg-12">
							<div className="bt-1"></div>
						</div>
					</div>

					<div className="row">
						<div className="col-lg-12">
							<ul className="nav nav-tabs create-new-par__ bb-1" style={{ borderBottom: '1px solid var(--b-color)' }}>
								<li className={this.state.RefererDetails_tab ? 'active' : ''}>
									<a data-toggle="tab" href="#RefererDetails" onClick={() => this.tab_active(0)}>
										Referer Details
									</a>
								</li>
								<li className={this.state.ParticipantDetails_tab ? 'active' : ''}>
									<a data-toggle="tab" href="#ParticipantDetails" onClick={() => this.tab_active(1)}>
										Participant Details
									</a>
								</li>
								<li className={this.state.ParticipantAbility_tab ? 'active' : ''}>
									<a data-toggle="tab" href="#ParticipantAbility" onClick={() => this.tab_active(2)}>
										Participant Ability
									</a>
								</li>
								{!this.state.participant_id ? (
									<li className={this.state.Shift_tab ? 'active' : ''}>
										<a data-toggle="tab" href="#Shift" onClick={() => this.tab_active(3)}>
											Shift
										</a>
									</li>
								) : (
									''
								)}
							</ul>

							<div className="w-100">
								<div className="tab-content">
									{/* 1. Start Referer Details from */}
									<div id="RefererDetails" className={this.state.RefererDetails_tab ? 'tab-pane active' : 'tab-pane '}>
										<RefererData
											sts={this.state.refererDetails}
											errorTooltip={this.errorShowInTooltip}
											updateSelect={this.selectChange}
											formIds={'referral_details'}
											options={options}
											submitReferDetail={this.submitReferDetails}
											handleChanges={this.handleChange}
											relations_participant={this.state.relations_participant}
											optsState={this.state}
										/>
									</div>
									{/* End Referer Details from */}

									{/* 1. Start Participant Details from */}
									<div id="ParticipantDetails" className={this.state.ParticipantDetails_tab ? 'tab-pane active' : 'tab-pane'}>
										<ParticipantDetailsPopup
											sts={this.state.participantDetails}
											selectAddress={this.selectAddress}
											fileChangedHandlers={this.fileChangedHandler}
											propData={this.props}
											errorTooltip={this.errorShowInTooltip}
											updateSelect={this.selectChange}
											submitParticipantDetail={this.submitParticipantDetails}
											handleNdis={this.handleNdisno}
											handleChanges={this.handleChange}
											googleAddress={this.googleAddressFill}
											deletefiles={this.deletefile}
											arrInputHandler={this.arrInputHandler}
											updateArrSelect={this.updateArrSelect}
											rowDeleteHandler={this.rowDeleteHandler}
											rowAddHandler={this.rowAddHandler}
											optsState={this.state}
											fileUploadHandler={this.fileUploadHandler}
											selectStateClose={this.selectStateClose}
											viewDocument={this.viewDocuments}
											viewPlanDocument={this.viewPlanDocuments}
											loading_participant_popup={this.state.loaderParticipantDetails}
										/>
									</div>
									{/* End Participant Details from */}

									{/* 1. Start Participant Details from */}
									<div id="ParticipantAbility" className={this.state.ParticipantAbility_tab ? 'tab-pane active' : 'tab-pane'}>
										<ParticipantAbilityPopup
											participant_id={this.state.participant_id}
											sts={this.state.participantAbility}
											fileChangedHandlers={this.fileChangedHandler}
											propData={this.props}
											errorTooltip={this.errorShowInTooltip}
											updateSelect={this.selectChange}
											submitParticipantAbility={this.submitParticipantAbility}
											handleChanges={this.handleChange}
											checkboxHandler={this.handleCheckboxValue}
											optsState={this.state}
											carerCheckHandler={this.carerCheckHandler}
										/>
									</div>

									{this.state.participant_id == '' ? (
										<div id="Shift" className={this.state.Shift_tab ? 'tab-pane active' : 'tab-pane'}>
											<ParticipantShiftPopup
												sts={this.state.participantShift}
												participant_id={this.state.participant_id}
												p_id={this.state.p_id}
												fileChangedHandlers={this.fileChangedHandler}
												propData={this.props}
												errorTooltip={this.errorShowInTooltip}
												updateSelect={this.selectChange}
												submitParticipantShift={this.submitParticipantShift}
												handleChanges={this.handleChange}
												checkboxHandlerShift={this.handleShiftCheckbox}
												checkboxHandler={this.handleCheckboxValue}
												disable={this.state.disable}
												optsState={this.state}
											/>
										</div>
									) : null}
								</div>
							</div>
						</div>
					</div>
				</BlockUi>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		showPageTitle: state.DepartmentReducer.activePage.pageTitle,
		showTypePage: state.DepartmentReducer.activePage.pageType,
		participantDatas: state.CrmParticipantReducer.participantData,
		statesValue: state.CrmParticipantReducer.states2
	};
};
const mapDispatchtoProps = dispach => {
	return {
		allLatestUpdate: () => dispach(allLatestUpdate()),
		crmParticipant: data => dispach(crmParticipant(data)),
		crmParticipantSubmit: data => dispach(crmParticipantSubmit(data)),
		states: () => dispach(states()),
		states_update: stateData => dispach(states_update(stateData))
	};
};
export default connect(mapStateToProps, mapDispatchtoProps)(NewParticipant);
