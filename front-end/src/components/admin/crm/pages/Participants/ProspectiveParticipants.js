import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, IsValidJson, getOptionsCrmMembers, getPermission, input_kin_lastname, getOptionsSuburb, handleRemoveShareholder, handleShareholderNameChange, handleAddShareholder, getQueryStringValue }
  from '../../../../../service/common.js';
import { listViewSitesOption, relationDropdown, sitCategoryListDropdown, ocDepartmentDropdown, getAboriginalOrTSI, LivingSituationOption, bookingstatusDropDown, nextActionDropDown } from '../../../../../dropdown/CrmDropdown.js';

import jQuery from "jquery";
import DatePicker from 'react-datepicker';
import Autocomplete from 'react-google-autocomplete';
import moment from 'moment';
import axios from 'axios';
import { BASE_URL, ROUTER_PATH } from '../../../../../config';

import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import CrmPage from '../../CrmPage';
import Pagination from "../../../../../service/Pagination.js";

import { ToastUndo } from 'service/ToastUndo.js'

import { PAGINATION_SHOW } from '../../../../../config.js';
import { TrComponent, getTrProps } from 'service/ReactTableTrProgressBar'
import {defaultSpaceInTable} from 'service/custom_value_data.js';


const getDepartmentList = () => {
  return new Promise((resolve, reject) => {
    // request json
    var Request = JSON.stringify({});
    postData('crm/CrmDepartment/get_all_department', Request).then((result) => {
      let filteredData = result.data;
      const res = {
        rows: filteredData,
        pages: (result.count)
      };
      setTimeout(() => resolve(res), 10);
    });
  });
};

const requestData = (pageSize, page, sorted, filtered) => {
  return new Promise((resolve, reject) => {

    // request json
    var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
    postData('crm/CrmParticipant/list_prospective_participant', Request).then((result) => {
      let filteredData = result.data;
      const res = {
        rows: filteredData,
        pages: (result.count)
      };
      resolve(res);
    });

  });
};

class ProspectiveParticipants extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      key: 1,
      permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),

    };
  }

  handleSelect(key) {
    this.setState({ key });
  }

  render() {

    return (

      <div className="container-fluid">
        <CrmPage pageTypeParms={'prospective_participants'} />
        <div className="row">
          <div className="col-lg-12">
            <div className="py-4 bb-1">
              {/*(this.state.permissions.access_crm_admin) ?
                <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/participantadmin'}><span className="icon icon-back1-ie"></span></Link>
                : <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/participantuser'}><span className="icon icon-back1-ie"></span></Link>
              */}
              <a className="back_arrow d-inline-block" onClick={() => this.props.props.history.goBack()} ><span className="icon icon-back1-ie"></span></a>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="row d-flex py-4">
              <div className="col-md-9">
                <div className="h-h1">
                  {this.props.showPageTitle}
                </div>
              </div>
            </div>
            <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="Crm-Applicant_tBL">
              <ListProspectiveParticipant addclass="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL table_progress" />
            </div>
          </div>
        </div>
      </div>


    );
  }
}

class CreateProspectiveParticipant extends Component {
  constructor(props) {

    super(props);
    this.kindetails = [{ name: '', lastname: '', contact: '', email: '', relation: '', relation_error: '', name_error: '', lastname_error: '', contact_error: '', email_error: '' }];

    this.state = {
      filterVal: '',
      showModal: false,
      ParticipantSituation: '',
      Preferredcontacttype: 1,
      ParticipantTSI: 1,
      second_step: false,
      PhoneInput: [{ name: '' }],
      EmailInput: [{ name: '' }],
      AddressInput: [{ type: '', city: 'ewe', state: 'sdf', street: '', postal: '98763', type_error: false }],
      kindetails: [{ name: '', lastname: '', contact: '', email: '', relation: '' }],
      bookerdetails: [{ name: '', lastname: '', contact: '', email: '', relation: '' }],
      success: false,
      participantReferral: [{ value: 1, label: 'Yes' }, { value: 2, label: 'No' }],
      gender_option: [{ value: 1, label: 'Male' }, { value: 2, label: 'Female' }],
      department_option: [{ value: 1, label: 'HCM' }, { value: 2, label: 'Healthcare' }],
      contact_option: [{ value: 1, label: 'Phone' }, { value: 2, label: 'Email' }],
      to_org_option: [{ value: 1, label: 'To Org' }, { value: 2, label: 'To House' }],
      stateList: [],
      referral: 1,
      selectedState: '',
      selectedState1: '',
      selectedState2: '',
      selectedState3: '',
      Dob: '', pAddress: '', pAddress2: '',
      showModal1: false,
      department_option: []
    }


  }
  componentWillMount() {
    getDepartmentList().then(res => {
      this.setState({
        department_option: res.rows,
        pages: res.pages,
        loading: false
      });
    });
  }
  submit = (e) => {
    e.preventDefault();
    var custom_validate = this.custom_validation({ errorClass: 'tooltip-default' });
    var validator = jQuery("#create_participant").validate({ ignore: [] });
    if (!this.state.loading && jQuery("#create_participant").valid() && custom_validate) {
      this.setState({
        PhoneInput: [{ 'name': '43434' }],
        EmailInput: [{ 'name': 'aa@aa.com' }],
        username: 'wewew',
        gender: 'male',
        referral: 1,
        ParticipantTSI: "sdsd",
        formaldiagnosisprimary: "dsdsd",
        participantCognition: "sdsd",
        participantCommunication: "sdsd",
        participantenglish: "sdsd",
        participantPreferredlang: "asdsd",
        CarersInput: [{ "Gender": "1", "Ethnicity": "sd", "Religious": "sdsd" }],
        bookerdetails: [{ "name": "", "lastname": "", "contact": "", "email": "", "relation": "father" }]
      });
      var str = JSON.stringify(this.state);
      sessionStorage.setItem("participant_step_1", str);

      this.setState({ loading: true }, () => {
        postData('crm/CrmParticipant/create_crm_participant', str).then((result) => {

          if (result.status) {

            toast.success(<ToastUndo message={"Participant created successfully"} showType={'s'} />, {
              // toast.success("Participant created successfully", {
              position: toast.POSITION.TOP_CENTER,
              hideProgressBar: true
            });

            this.setState({ success: true })
            this.props.closeingModel();
          } else {
            toast.error(<ToastUndo message={result.error} showType={'e'} />, {
              // toast.error(result.error, {
              position: toast.POSITION.TOP_CENTER,
              hideProgressBar: true
            });
            this.props.closeingModel();

          }
          this.setState({ loading: false })
        });

      });
    } else {
      validator.focusInvalid();
    }
  }

  handleChange = (e) => {
    var state = {};
    this.setState({ error: '' });
    state[e.target.name] = (e.target.type === 'checkbox' ? e.target.checked : e.target.value.replace(/\s/g, ' '));
    this.setState(state);
  }

  handleShareholderNameChange = (index, stateKey, fieldtkey, fieldValue) => {

    var state = {};
    var tempField = {};
    var List = this.state[stateKey];
    List[index][fieldtkey] = fieldValue

    state[stateKey] = List;

    this.setState(state);

  }
  handleAddShareholder = (e, tagType) => {
    e.preventDefault();
    var state = [];
    state[tagType] = this.state[tagType].concat([{ name: '', lastname: '', contact: '', email: '', relation: '' }]);
    this.setState(state);
  }
  selectChange = (selectedOption, fieldname) => {

    var state = {};
    state[fieldname] = selectedOption;
    state[fieldname + '_error'] = false;

    this.setState(state);

  }
  handleRemoveShareholder = (e, idx, tagType) => {
    e.preventDefault();
    var state = {};
    var List = this.state[tagType];

    state[tagType] = List.filter((s, sidx) => idx !== sidx);
    this.setState(state);
  }

  custom_validation = () => {
    var return_var = true;
    var state = {};
    var List = [{ key: 'refferalRelation' }, { key: 'ParticipantSituation' }];
    List.map((object, sidx) => {
      if (object.key == 'refferalRelation') {

        if ((this.state['refferalRelation'] == undefined || this.state['refferalRelation'] == '')) {
          state[object.key + '_error'] = true;
          this.setState(state);
          return_var = false;
        }
      } else if (this.state[object.key] == null || this.state[object.key] == undefined || this.state[object.key] == '') {
        state[object.key + '_error'] = true;
        this.setState(state);
        return_var = false;
      }
    });

    const newShareholders = this.state.AddressInput.map((object, sidx) => {
      if (object.type == '' || object.type == undefined || object.type == null) {

        return_var = false;
        return { ...object, type_error: true };
      } else {
        return { ...object, type_error: false };
      }
    });
    this.setState({ AddressInput: newShareholders });

    return return_var;
  }


  errorShowInTooltip = ($key, msg) => {
    //alert($key);
    return (this.state[$key + '_error']) ? <div className={'tooltip custom-tooltip fade top in' + ((this.state[$key + '_error']) ? ' select-validation-error' : '')} role="tooltip">
      <div className="tooltip-arrow"></div><div className="tooltip-inner">{msg}.</div></div> : '';

  }

  errorShowInTooltipForLoop = (key, msg) => {
    return (key == true) ? <div className={'tooltip custom-tooltip fade top in' + ((key == true) ? ' select-validation-error' : '')} role="tooltip">
      <div className="tooltip-arrow"></div><div className="tooltip-inner">{msg}.</div></div> : '';

  }

  showModal1 = () => {

    this.setState({ showModal1: true })
  }

  closeModal1 = () => {
    this.setState({ showModal1: false })
  }
  fileChangedHandler = (event) => {
    this.setState({ selectedFile: event.target.files[0], filename: event.target.files[0].name })
  }
  render() {


    if (this.state.success) {
      return (<CreateProspectiveParticipant />)
    }

    return (


      <div>

        <div className={this.props.showModal ? 'customModal show' : 'customModal'}>


          <div className="custom-modal-dialog Information_modal">
            <div className="custom-modal-header by-1">
              <div className="Modal_title">Create Prospective Participant</div>
              <i className="icon icon-close1-ie Modal_close_i" onClick={this.props.closeModal}></i>
            </div>
            <form id="create_participant">
              <div className="custom-modal-body w-80 mx-auto">

                <div className="row">
                  <div className="col-md-12 py-4 title_sub_modal">Participant Details</div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">First name: </label>
                    <div className="required">
                      <input data-rule-required='true' data-msg-required="Add First Name" placeholder="First Name" type="text" name="firstname" value={this.state['firstname'] || ''} onChange={this.handleChange} maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Last name: </label>
                    <div className="required">
                      <input placeholder="Last Name" data-msg-required="Add Last Name" type="text" name="lastname" value={this.state['lastname'] || ''} onChange={this.handleChange} data-rule-required="true" maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Date of Birth: </label>
                    <div className="required">
                      <DatePicker  autoComplete={'off'} utcOffset={0} showYearDropdown scrollableYearDropdown yearDropdownItemNumber={110} dateFormat="dd-MM-yyyy" required={true} data-placement={'bottom'} maxDate={moment()}
                        name="Dob" onChange={(e) => this.selectChange(e, 'Dob')} selected={this.state['Dob'] ? moment(this.state['Dob'], 'DD-MM-YYYY') : null} className="text-center " placeholderText="DD/MM/YYYY" maxLength="30" />
                    </div>
                  </div>



                  <div className="col-md-4 mb-4">
                    <label className="title_input">NDIS Number: </label>
                    <div className="required">
                      <input type="number" data-rule-required='true' data-msg-required="NDIS Number Required" placeholder="000 000 000" name="Preferredndis" value={this.state['Preferredndis'] || ''} onChange={this.handleChange} maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Medicare Number: </label>
                    <div className="required">
                      <input type="number" data-rule-required='true' data-msg-required="Medicare Number Required" placeholder="0000 00000 0" name="Preferredmedicare" value={this.state['Preferredmedicare'] || ''} onChange={this.handleChange} maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Assign To Department: </label>
                    <div className="required">


                      <Select
                        className="custom_select"
                        name="assign_to"
                        options={this.state.department_option}
                        required={true}
                        simpleValue={true}
                        searchable={false}
                        clearable={false}
                        placeholder="Please Select"
                        onChange={(e) => this.selectChange(e, 'assign_to')}
                        className={'custom_select'}
                        value={this.state['assign_to']}
                      />
                      {this.errorShowInTooltip('assign_to', 'Select User')}

                    </div>
                  </div>

                </div>

                <div className="row">
                  <div className="col-md-12 py-4"><div className="bt-1"></div></div>
                  <div className="col-md-12 pt-1 pb-4 title_sub_modal">Reference Details</div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">First name: </label>
                    <div className="required">
                      <input placeholder="First name" data-msg-required="Add First Name" type="text" value={this.state['Referrer_first_name'] || ''} name="Referrer_first_name" onChange={this.handleChange} data-rule-required="true" maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Last name: </label>
                    <div className="required">
                      <input placeholder="Last Name" data-msg-required="Add Last Name" type="text" value={this.state['Referrer_last_name'] || ''} name="Referrer_last_name" onChange={this.handleChange} data-rule-required="true" maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Organisation: </label>
                    <div className="required">
                      <input type="text" className="default-input" data-rule-required='true' data-msg-required="Organisation Name Required" value={this.state['referral_org']} name="referral_org" onChange={this.handleChange} placeholder="Organisation" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Email: </label>
                    <div className="required">
                      <input placeholder="Email" type="text" data-msg-required="Add Email Address" name="Referrer_email" value={this.state['Referrer_email']} onChange={this.handleChange} data-rule-required="true" data-rule-email="true" maxLength="70" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Phone Number: </label>
                    <div className="required">
                      <input placeholder="Phone" type="text" data-msg-required="Add Phone Number" name="Referrer_phone" value={this.state['Referrer_phone']} onChange={this.handleChange} data-rule-required="true" maxLength="30" maxLength="30" />
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Relationship to Participant: </label>
                    <div className="s-def1">
                      <div className="required">
                        <Select className="custom_select"
                          clearable={false}
                          searchable={false}
                          simpleValue={true}
                          value={this.state['refferalRelation'] || ''}
                          name="refferalRelation"
                          onChange={(e) => this.selectChange(e, 'refferalRelation')}
                          options={relationDropdown(0)}
                          required={true}
                          placeholder="Please Select" />

                        {this.errorShowInTooltip('refferalRelation', 'Add Relation')}

                      </div>
                    </div>
                  </div>
                </div>


                <div className="row">
                  <div className="col-md-12 py-4"><div className="bt-1"></div></div>
                  <div className="col-md-12 pt-1 pb-4 title_sub_modal">Living Details:</div>
                  <div className="col-md-4 mb-4">
                    <label className="title_input">Living Situation: </label>
                    <div className="s-def1">
                      <div className="required">
                        <Select className="custom_select" clearable={false}
                          name="ParticipantSituation" simpleValue={true}
                          value={this.state['ParticipantSituation'] || ''}
                          onChange={(e) => this.selectChange(e, 'ParticipantSituation')}
                          required={true} searchable={false}
                          options={LivingSituationOption(0)} placeholder="Please Select" />
                        {this.errorShowInTooltip('ParticipantSituation', 'Add ParticipantSituation')}
                      </div>
                    </div>
                  </div>
                </div>
                {this.state.AddressInput.map((AddressInput, idx) => (
                  <div key={idx + 1}>
                    <div className="row">
                      <label className="title_input col-md-12 pl-5"><b>{idx > 0 ? 'Secondary Address:' : 'Primary Address:'} </b></label>
                    </div>
                    <div key={idx + 1} className="row d-flex">
                      <div className="col-md-7 mb-4">
                        <label className="title_input">Address: </label>

                        <div className="small-search l-search">

                          <Autocomplete className="form-control"
                            style={{ width: '90%' }}
                            data-rule-required="true"
                            name={"address_primary" + idx}
                            onPlaceSelected={(place) => this.handleShareholderNameChange(idx, 'AddressInput', 'street', place.formatted_address)}
                            types={['(regions)']}
                            value={AddressInput.street || ''}
                            onChange={(evt) => this.handleShareholderNameChange(idx, 'AddressInput', 'street', evt.target.value)}
                            onKeyDown={(evt) => this.handleShareholderNameChange(idx, 'AddressInput', 'street', evt.target.value)}

                          />


                          <button><span className="icon icon-location1-ie"></span></button>
                        </div>
                      </div>
                      <div className="col-md-4 mb-4">
                        <label className="title_input">Address Type: </label>
                        <div className="required">
                          <div className="s-def1">

                            <Select clearable={false} searchable={false}
                              className="custom_select"
                              simpleValue={true}
                              name={"address_primary_type" + idx}
                              value={AddressInput.type || ''}
                              onChange={(e) => this.handleShareholderNameChange(idx, 'AddressInput', 'type', e)}
                              options={sitCategoryListDropdown(0)}
                              data-rule-required="true"
                              data-msg-required="Select Address Type"
                              placeholder="Please Select" />
                            {this.errorShowInTooltipForLoop(AddressInput.type_error, 'Select Address Type')}
                          </div>
                        </div>
                      </div>
                      {idx > 0 ? <div className="col-md-1 align-items-end d-inline-flex mb-4"> <span className="button_plus__" onClick={(e) => this.handleRemoveShareholder(e, idx, 'AddressInput')}>
                        <i className="icon icon-decrease-icon Add-2-2"></i>
                      </span></div> : (this.state.AddressInput.length == 3) ? '' : <div className="col-md-1 align-items-end d-inline-flex mb-4"><span className="button_plus__"
                        onClick={(e) => handleAddShareholder(this, e, 'AddressInput', AddressInput)}>
                        <i className="icon icon-add-icons Add-2-1"></i>
                      </span></div>}

                    </div>
                  </div>
                ))}



                <RalativeDetails title="Next of Kin" stateKey="kindetails" kindetails={this.state['kindetails']} errorShowInTooltipForLoop={this.errorShowInTooltipForLoop}
                  handleShareholderNameChange={this.handleShareholderNameChange}
                  handleRemoveShareholder={this.handleRemoveShareholder}
                  handleAddShareholder={this.handleAddShareholder}
                />
                <div className="row">
                  <div className="col-md-12 py-4"><div className="bt-1"></div></div>
                  <div className="col-md-12 pt-1 pb-4 title_sub_modal">Attachments</div>
                </div>

                <div className="row ">
                  <div className="col-md-3 mb-4">
                    <label className="title_input">NDIS Plan Document: </label>
                    <a className="v-c-btn1">
                      <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                    </a>
                  </div>
                  <div className="col-md-3 mb-4">
                    <label className="title_input">Agreement Document: </label>
                    <a className="v-c-btn1">
                      <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                    </a>
                  </div>
                  <div className="col-md-3 mb-4">
                    <label className="title_input">Signed Consent Document: </label>
                    <a className="v-c-btn1">
                      <span>Document 1</span> <i className="icon icon-view1-ie"></i>
                    </a>
                  </div>
                </div>

                <div className="row d-flex mb-5">
                  <div className="col-md-9 align-items-end d-inline-flex"><div className="bt-1 w-100"></div></div>
                  <div className="col-md-3"><a className="btn-1" >Browse</a></div>
                  {/* <div className="col-md-3">
                  <div className="upload_btn">
                    <label className="btn-file">
                      <div className="v-c-btn1"><span>Browse</span><i className="icon icon-export1-ie" aria-hidden="true"></i></div>
                      <input className="p-hidden" type="file" />
                    </label>
                  </div>
                </div> */}
                </div>

              </div>

              <div className="custom-modal-footer bt-1 mt-5">
                <div className="row d-flex justify-content-end">
                  <div className="col-md-3"><a className="btn-1" onClick={this.submit}>Apply Changes</a></div>
                </div>
              </div>
            </form>
          </div>


        </div>

        <div className={this.state.showModal1 ? 'customModal show' : 'customModal'} style={{ zIndex: '2' }}>
          <div className="custom-modal-dialog Information_modal Attach_modal">
            <div className="custom-modal-header by-1">
              <div className="Modal_title">Upload New</div>
              <i className="icon icon-close1-ie Modal_close_i" onClick={this.closeModal1}></i>
            </div>

            <div className="custom-modal-body mx-auto">
              <div className="row mx-0 my-4">
                <div className="col-md-6">
                  <label>Title</label>
                  <input type="text" ></input>
                </div>
              </div>

              <div className="row mx-0 mb-5">
                <div className="col-md-6">
                  <span className="required upload_btn">
                    <label className="btn btn-default btn-sm center-block btn-file">
                      <i className="but" aria-hidden="true">Browse Document(s)</i>
                      <input className="p-hidden" type="file" onChange={this.fileChangedHandler} />
                    </label>
                  </span>
                  {/* <p>File Name: <small></small></p> */}
                  {(this.state.filename) ? <p>File Name: <small>{this.state.filename}</small></p> : ''}
                </div>
              </div>
            </div>

            <div className="custom-modal-footer bt-1 mt-5">
              <div className="row d-flex justify-content-end">
                <div className="col-md-5"><a className="btn-1">Apply Changes</a></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

}

class RalativeDetails extends Component {
  render() {

    return (
      <div>
        <div className="row P_25_T">
          <div className="col-lg-10  col-md-12"><div className="bor_T"></div></div><div className="col-lg-1"></div>
          <div className="col-lg-10  col-md-12 P_15_TB title_sub_modal"><h3 ><b>{this.props.title} Details:</b></h3></div><div className="col-lg-1"></div>
          <div className="col-lg-10  col-md-12"><div className="bor_T"></div></div><div className="col-lg-1"></div>
        </div>

        {this.props.kindetails.map((obj, index) => (
          <div key={index + 1} className="P_25_T row">
            <div className="col-lg-2 col-md-3">
              <label className="title_input"> Name:</label>
              <div className="required">
                <input className="input_f mb-1 "
                 type="text"
                  value={obj.name || ''}
                  name={this.props.stateKey + 'input_kin_first_name' + index}
                  placeholder='First Name'
                  onChange={(evt) => this.props.handleShareholderNameChange(index, this.props.stateKey, 'name', evt.target.value)}
                  maxLength="30"
                  required={true}
                />
              </div>
            </div>

            <div className="col-lg-2 col-md-3 pt-4 mt-2">
              <div className="required">
                <input className="input_f mb-1 mt-1"
                 type="text"
                  value={obj.lastname || ''}
                  name={this.props.stateKey + 'input_kin_lastname' + index}
                  placeholder='Last Name'
                  onChange={(evt) => this.props.handleShareholderNameChange(index, this.props.stateKey, 'lastname', evt.target.value)}
                  maxLength="30"
                  required={true}
                />
              </div>
            </div>
            <div className="col-lg-2 col-md-3">
              <label className="title_input"> Contact:</label>
              <div className="required">
                <input className="input_f mb-1  distinctKinCOntact"
                 type="text"
                  value={obj.contact || ''}
                  name={this.props.stateKey + 'input_kin_contact' + index}
                  placeholder='Contact'
                  onChange={(evt) => this.props.handleShareholderNameChange(index, this.props.stateKey, 'contact', evt.target.value)}
                  maxLength="30"
                  data-rule-notequaltogroup='[".distinctKinCOntact"]'
                  data-msg-notequaltogroup='Please enter unique contact number'
                  required={true}
                />
              </div>
            </div>
            <div className="col-lg-2 col-md-3 pt-4 mt-2">
              <div className="required">
                <input className="input_f mb-1 mt-1 distinctEmail"
                  type="text"
                  value={obj.email || ''}
                  name={this.props.stateKey + 'input_kin_email' + index}
                  placeholder='Email'
                  maxLength="70"
                  data-rule-notequaltogroup='[".distinctEmail"]'
                  data-rule-email="true"
                  required={true}
                  onChange={(evt) => this.props.handleShareholderNameChange(index, this.props.stateKey, 'email', evt.target.value)}
                />

              </div>
            </div>

            <div className="col-lg-2 col-md-3">
              <label className="title_input">Relation:</label>
              <div className="row">
                <div className="col-lg-9 col-md-9">
                  <div className="required">
                    <span className="default_validation">
                      <Select className={'custom_select'}
                        clearable={false}
                        searchable={true}
                        simpleValue={true}
                        value={obj.relation || ''}
                        name={this.props.stateKey + 'input_relation_primary' + index}
                        onChange={(evt) => this.props.handleShareholderNameChange(index, this.props.stateKey, 'relation', evt)}
                        options={relationDropdown(0)}
                        required={true}
                        placeholder="Please Select" />
                    </span>
                  </div>
                </div>
                <div className="col-lg-3 col-md-3">
                  {index > 0 ? <span className="button_plus__" onClick={(e) => this.props.handleRemoveShareholder(e, index, this.props.stateKey)}>
                    <i className="icon icon-decrease-icon Add-2-2" ></i>
                  </span> : (this.props.kindetails.length == 3) ? '' : <span className="button_plus__" onClick={(e) => this.props.handleAddShareholder(e, this.props.stateKey)}>
                    <i className="icon icon-add-icons Add-2-1" ></i>
                  </span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}



class ListProspectiveParticipant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterVal: '4', showModal: false,
      p_participantList: [],
      counter: 0,
      loading: false,
      search_by: '',
      filtered: { search: '', filterVal: 4, search_by: '' }
    };


  }

  fetchData = (state, instance) => {
    // function for fetch data from database
    this.setState({ loading: true });
    requestData(
      state.pageSize,
      state.page,
      state.sorted,
      state.filtered
    ).then(res => {

      this.setState({
        p_participantList: res.rows,
        pages: res.pages,
        loading: false
      });
    });
  }


  closeModal = () => {
    this.setState({ showModal: false })
  }

  showModal = () => {
    this.setState({
      showModal: true, state: {
        filterVal: '', showModal: false,
        p_participantList: [],
        counter: 0,
        loading: false,
      }
    })
  }

  submitSearch = (e) => {
    e.preventDefault();

    var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, search_by: this.state.search_by }
    this.setState({ filtered: srch_ary });

  }

  searchData = (key, value) => {
    var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, search_by: this.state.search_by };
    srch_ary[key] = value;
    this.setState(srch_ary);
    this.setState({ filtered: srch_ary });
  }



  render() {
    const { data, pages, loading } = this.state;


    const now = 10;

    var options1 = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' }
    ];


    var options = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' }
    ];

    const columns = [
      {
        //  Header: "NDIS No:",
        accessor: "ndis_num",
        headerClassName: '_align_c__ header_cnter_tabl',
        Header: () =>
          <div>
            <div className="ellipsis_line1__">NDIS No</div>
          </div>
        ,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        // Header: props => <span>Participant Name:</span>,
        accessor: 'FullName',
        headerClassName: '_align_c__ header_cnter_tabl',
        Header: () =>
          <div>
            <div className="ellipsis_line1__">Participant Name</div>
          </div>
        ,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>,
        filterable: false, maxWidth: 200
      },
      // { Header: "Participant Name:", accessor: "name", },
      {
        // Header: "Stage:",
        accessor: "latest_stage_name",
        headerClassName: '_align_c__ header_cnter_tabl',
        Header: () =>
          <div>
            <div className="ellipsis_line1__">Stage</div>
          </div>
        ,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        // Header: "Assigned To:",
        accessor: "assigned_to",
        headerClassName: '_align_c__ header_cnter_tabl',
        Header: () =>
          <div>
            <div className="ellipsis_line1__">Assigned To</div>
          </div>
        ,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        // Header: "Intake Submisson Date:",
        accessor: "date",
        headerClassName: '_align_c__ header_cnter_tabl',
        Header: () =>
          <div>
            <div className="ellipsis_line1__">Intake Submisson Date</div>
          </div>
        ,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        Header: "Intake Type", accessor: "intake_type",
        headerStyle: { border: "0px solid #fff" },
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {

        expander: true,
        Header: () => <strong></strong>,
        width: 45,
        headerStyle: { border: "0px solid #fff" },
        Expander: ({ isExpanded, ...rest }) =>

          <div className="expander_bind">
            {isExpanded ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i> : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
          </div>,
        accessor: "id",
        style: {
          cursor: "pointer",
          fontSize: 25,
          padding: "0",
          textAlign: "center",
          userSelect: "none"
        },

      }

    ]


    const subComponentDataMapper = row => {
      let data = row.row._original;
      return (
        <div className="tBL_Sub applicant_info1">
          <div className="row bor_l_cols bor_top pt-3 bor_bot_b1 pb-3">
            <div className="text-left col-lg-3 col-sm-6 mb-2">
              <div className="txt_t1 mb-3"><b>{data.FullName}</b></div>
              {/*<div className="txt_t2 my-2"><b>NDIS No.: </b> <u>{(data.ndis_num) ? data.ndis_num : 'N/A'}</u></div> for PIMSD-23 need to disable*/}
              <div className="txt_t2 my-2 pb-0"><b>Phone: </b> <u>{(data.phone) ? data.phone : 'N/A'}</u></div>
              <div className="txt_t2 my-2 pt-0"><b>Email: </b> <u>{(data.email) ? data.email : 'N/A'}</u></div>
            </div>
            <div className="text-left br-1 col-lg-3 col-sm-6 mb-2 br-sm-0">
              <div className="txt_t2"><b>Address: </b> <u>{(data.address) ? data.address : 'N/A'}</u></div>
            </div>
            <div className="text-left  br-1 col-lg-3 col-sm-12 mb-2 bt-sm-1 pt-sm-3">
              <div className="txt_t2"><b>Last Seen Ago: </b>{(data.updated)}</div>

            </div>
            {
              (data.ref_relation != 'Participant') ?
            <div className="text-left col-lg-3 col-sm-12 mb-2">
              <div className="txt_t2 my-2"><b>Reference: </b>{(data.ref_name) ? data.ref_name : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Email: </b>{(data.ref_email) ? data.ref_email : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Phone: </b>{(data.ref_phone) ? data.ref_phone : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Organisation: </b>{(data.ref_org) ? data.ref_org : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Relationship to Participant: </b>{(data.ref_relation) ? data.ref_relation : 'N/A'}</div>
            </div> :
            <div className="text-left col-lg-3 col-sm-12 mb-2">
              <div className="txt_t2 my-2"><b>Relationship to Participant: </b>{(data.ref_relation) ? 'Self' : 'N/A'}</div>
            </div>
          }
            {/* <div className="d-flex align-items-end table_view_icon col-lg-1">
              <div>
                <Link to={ROUTER_PATH + 'admin/crm/participantdetails/' + data.id} title='View'>
                  <span className="icon icon-view1-ie"></span>
                  More Info

                           </Link>
              </div>
            </div> */}
          </div>

          <div className="row">
            <div className="col-md-12 ">
              <div className="applicant_info_footer_1">
                <div className="no_pd_l">
                    <Link to={ROUTER_PATH + 'admin/crm/participantdetails/' + data.id} title='View'>
                      <button className="btn cmn-btn1 apli_btn__ eye-btn">More Information</button>
                    </Link>
                </div>
                <div className="no_pd_r">
                  {/* <ul className="subTasks_Action__">
                    <li><span className="sbTsk_li">Archive Applicant</span></li>
                    <li><span className="sbTsk_li">Flag Applicant</span></li>
                  </ul> */}
                </div>
              </div>
            </div>
          </div>


          <div className="progress-img"></div>
          <div className="progress-b1">
            <div className="overlay_text_p0">Intake Progress  {(data.now.level) ? data.now.level : now}% Complete</div>
            <ProgressBar className="progress-b2" now={(data.now.level) ? data.now.level : now} >
            </ProgressBar>

          </div>
        </div>
      );
    }

    return (

      <React.Fragment>
        <form className="w-100" onSubmit={this.submitSearch}>
        <div className="row _Common_Search_a justify-content-between after_before_remove">
          <div className="col-md-7 col-xs-6">
          <div className="search_bar ad_search_btn right srchInp_sm actionSrch_st">
            <input type="text" className="srch-inp" name="search" value={this.state.search || ''} onChange={(e) => this.setState({ 'search': e.target.value })} />
          <button type="submit"><i className="icon icon-search2-ie"></i></button>
          </div>
            {/* <div className="big-search l-search">
              <input type="text" name="search" value={this.state.search || ''} onChange={(e) => this.setState({ 'search': e.target.value })} />
              <button type="submit"><span className="icon icon-search1-ie"></span></button>
            </div> */}
          </div>
          <div className="col-md-3 col-xs-6">
            <div className="s-def1">
              <Select
                name="view_by_status"
                options={bookingstatusDropDown(0)}
                required={true}
                simpleValue={true}
                searchable={false}
                clearable={false}
                placeholder="Filter by: Unread"
                onChange={(e) => this.searchData('filterVal', e)}
                value={this.state.filterVal}
                className={'custom_select'}
              />
            </div>
          </div>
          </div>
        </form>

        <div className="bt-1 mb-4"></div>

        <div className={this.props.addclass}>
          <ReactTable
            PaginationComponent={Pagination}
            columns={columns}
            data={this.state.p_participantList}
            pages={this.state.pages}
            loading={this.state.loading}
            onFetchData={this.fetchData}
            defaultPageSize={10}
            className="-striped -highlight"
            loading={this.state.loading}
            filtered={this.state.filtered}
            minRows={1}
            onPageSizeChange={this.onPageSizeChange}
            manual="true"
            previousText={<span className="icon icon-arrow-left privious"></span>}
            nextText={<span className="icon icon-arrow-right next"></span>}
            SubComponent={subComponentDataMapper}
            ref={this.reactTable}
            // showPagination={true}
            showPagination={this.state.p_participantList.length >= PAGINATION_SHOW ? true : false}
            TrComponent={TrComponent}
            getTrProps={getTrProps}
          />




          <div className="row justify-content-end d-flex">
            <div className="col-lg-3 col-md-3">
              <Link className="btn-1 w-100" to={ROUTER_PATH + 'admin/crm/createParticipant'} >Create New Participant</Link>
            </div>
          </div>




          {<CreateProspectiveParticipant closeingModel={this.closeModal} closeModal={this.closeModal} showModal={this.state.showModal} />}



        </div>
        </React.Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,

  }
};

export default connect(mapStateToProps)(ProspectiveParticipants);
