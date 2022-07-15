import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import {
  bookedByDropDown,
  shiftYesNo,
  confirmWith,
  confirmWithSites,
  confirmBy,
  bookingMethodOption,
  confirmWithHouse
} from "dropdown/ScheduleDropdown.js";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import Modal from "react-bootstrap/lib/Modal";
import {
  postData,
  handleChangeChkboxInput,
  handleChangeSelectDatepicker,
  getOptionsParticipant,
  getOptionsMember,
  getOptionsSiteName,
  getOptionsSuburb,
  handleDateChangeRaw,
  handleAddShareholder,
  handleRemoveShareholder,
  handleShareholderNameChange,
  toastMessageShow,
  handleChange,
  getOptionsHouseName,
  googleAddressFill,
  onKeyPressPrevent
} from "service/common.js";
import Pagination from "service/Pagination.js";
import ReactTable from "react-table";
import jQuery from "jquery";
import moment from "moment";
import DatePicker from "react-datepicker";
import BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import { ParticiapntPageIconTitle } from "menujson/pagetitle_json";
import ScrollArea from "react-scrollbar";
import { getAllPublicHoliday } from "actions/PermissionAction";
import { connect } from "react-redux";
import _ from "lodash";
import ReactGoogleAutocomplete from "components/admin/externl_component/ReactGoogleAutocomplete";
import SimpleBar from "simplebar-react";
import classNames from "classnames";

class AdressComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    var showPlus = false 
    if(this.props.time_of_days.find(x => x.key_name == 'transferred')){
        showPlus = this.props.time_of_days.find(x => x.key_name == 'transferred').checked;
    }
    
    var participant_address = [{value: '', label : "Select"}, ...this.props.participant_address];
    
    return (
      <React.Fragment>
        {this.props.completeAddress.map((value, idx) => (
          <div className="row P_25_b AL_flex" key={idx}>
            <div className="w-20-lg col-lg-2 col-md-2 col-xs-12">
                <div className="csform-group">
                  <label className="label_2_1_1 f-bold">Participant Address:</label>
                  <div className="sLT_gray left left-aRRow">
                    <Select
                      simpleValue={true}
                      name="form-field-name"
                      options={participant_address}
                      clearable={false}
                      searchable={false}
                      onChange={e => this.props.handleChangePropsParticipaintAddress(e, idx)}
                      value={value.selected_pre_filled_address || ''}
                    />
                  </div>
                </div>
              </div>
            <div className="w-30-lg col-lg-2 col-md-2 col-xs-12">
              <div className="csform-group">
                <label className="label_2_1_1 f-bold">Address:</label>
                <span className="required">
                  <ReactGoogleAutocomplete
                    className="add_input mb-1"
                    key={idx + 1}
                    maxlength="100"
                    required={true}
                    data-msg-required="Add address"
                    name={"address_primary" + idx}
                    onPlaceSelected={place => this.props.googleAddressFill(idx, "completeAddress", "street", place)}
                    types={["address"]}
                    returntype={"array"}
                    value={value.street || ""}
                    onChange={evt => this.props.handleShareholderNameChange(idx, "street", evt.target.value)}
                    onKeyDown={evt => this.props.handleShareholderNameChange(idx, "street", evt.target.value)}
                    componentRestrictions={{ country: "au" }}
                  />
                </span>
              </div>
            </div>
            
            <div className="w-40-lg col-lg-5 col-md-5 col-xs-12">
              <div className="row">
                <div className="col-md-4">
                  <div className="csform-group">
                    <label className="label_2_1_1 f-bold">State:</label>
                    <div className="sLT_gray left left-aRRow">
                      <Select
                        simpleValue={true}
                        name="form-field-name"
                        options={this.props.stateList}
                        clearable={false}
                        searchable={false}
                        onChange={e => this.props.handleShareholderNameChange(idx, "state", e)}
                        value={value.state || ""}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="csform-group">
                    <label className="label_2_1_1 f-bold">Suburb:</label>
                    <div className="sLT_gray left left-aRRow">
                      <Select.Async
                        simpleValue={true}
                        clearable={false}
                        className="default_validation"
                        required={true}
                        value={{ label: value.suburb, value: value.suburb }}
                        cache={false}
                        disabled={value.state ? false : true}
                        loadOptions={e => getOptionsSuburb(e, value.state)}
                        onChange={evt => this.props.handleShareholderNameChange(idx, "suburb", evt)}
                        placeholder="Please Select"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="csform-group">
                    <label className="label_2_1_1 f-bold">PostCode:</label>
                    <span className="required">
                      <input
                        type="text"
                        maxlength="6"
                        name="postal"
                        required
                        className="csForm_control bl_bor"
                        onChange={e => this.props.handleShareholderNameChange(idx,"postal",e.target.value)}
                        value={value.postal || ""}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {showPlus ? <div className="w-10-lg col-lg-2 col-md-2 col-xs-12 pb-4">
              {idx > 0 ? 
                <div
                  title={ParticiapntPageIconTitle.par_remove_icon}
                  onClick={e => this.props.handleRemoveShareholder(e, idx, "completeAddress")}
                  className="button_plus__"
                ><i className="icon icon-decrease-icon Add-2-2"></i>
                </div>
              : this.props.completeAddress.length == 3 ? "": 
                    <div title={ParticiapntPageIconTitle.par_add_icon}
                      className="button_plus__"
                      onClick={e => this.props.handleAddShareholder(e, "completeAddress", value)}
                    ><i className="icon icon-add-icons Add-2-1"></i>
                    </div>
                 }
            </div> : <React.Fragment />}
          </div>
        ))}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
    stateList : state.CreateRosterReducer.stateList,
    participant_address : state.CreateRosterReducer.participant_address,
});

const mapDispatchtoProps = dispach => {
    return {
      
    };
};

export default connect(mapStateToProps, mapDispatchtoProps)(AdressComponent);