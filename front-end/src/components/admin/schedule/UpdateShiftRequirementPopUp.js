import React, { Component } from "react";
import { postData, handleCheckboxValue,handleShareholderNameChange } from "service/common.js";
import Modal from "react-bootstrap/lib/Modal";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ToastUndo } from "service/ToastUndo.js";
import ScrollArea from "react-scrollbar";

const bookedByData = {
    1:{'requirement_mobility':'Mobility Requirements','requirement':'Assistance Requirements','org_shift_data':'Org Requirements'},
    2:{'requirement_mobility':'Mobility Requirements','requirement':'Assistance Requirements','org_shift_data':''},
    3:{'requirement_mobility':'Mobility Requirements','requirement':'Assistance Requirements','org_shift_data':'Assistance Requirements'},
    7:{'requirement_mobility':'Mobility Requirements','requirement':'Assistance Requirements','org_shift_data':'House Requirements'}
};
class UpdateShiftRequirementPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requirement_mobility: [],
      requirement: [],
      org_shift_data: [],
      booked_by: 0
    };
  }

  componentDidMount() { 
    this.setState(this.props);
  }

  handleCheckboxValue =(stateKeyName,idx,keyName,value)=>{
    handleCheckboxValue(this, stateKeyName, idx, keyName, value).then(res=>{
        if((this.state.booked_by==1 || this.state.booked_by==7 || this.state.booked_by==0) && stateKeyName=='org_shift_data'){
    
        }else if(!this.state[stateKeyName][idx]['checked']){
          let other_value_data = this.state[stateKeyName][idx]['other_value'];
          handleShareholderNameChange(this, stateKeyName, idx, 'other_title', other_value_data);
        }
    });
  }
  handleShareholderNameChange =(stateKeyName,idx,keyName,value)=>{
    handleShareholderNameChange(this, stateKeyName, idx, keyName, value);
  }

  onSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true }, () => {
      postData(
        "schedule/ScheduleDashboard/update_shift_requirement",
        this.state
      ).then(result => {
        if (result.status) {
          toast.success(
            <ToastUndo
              message={"Updated Shift Requirements Successfully"}
              showType={"s"}
            />,
            {
              position: toast.POSITION.TOP_CENTER,
              hideProgressBar: true
            }
          );
          this.props.closeModel("requirement", true);
        } else {
          toast.error(<ToastUndo message={result.error} showType={"e"} />, {
            position: toast.POSITION.TOP_CENTER,
            hideProgressBar: true
          });
        }
        this.setState({ loading: false });
      });
    });
  };

  render() {
      
    return (
      <Modal
        className="Modal fade Modal_A Modal_B Schedule_Module update_shift_requirement_MODAL"
        show={this.props.modal_show}
        onHide={this.handleHide}
        container={this}
        aria-labelledby="contained-modal-title"
      >
        <Modal.Body>
          <div className="dis_cell">
            <div className="text text-left by-1 mb-3 Popup_h_er_1">
              <span>Updating Shift Requirement:</span>
              <a
                onClick={() => this.props.closeModel("requirement", false)}
                className="close_i"
              >
                <i className="icon icon-cross-icons"></i>
              </a>
            </div>
            <div className="row">
              <div className="col-md-6">
              <label className="label_2_1_1">{this.state.booked_by>0 && bookedByData[this.state.booked_by]['requirement_mobility'] ? bookedByData[this.state.booked_by]['requirement_mobility'] : 'Shift Requirement'}:</label>
                  
                <div className="custom_scroll_set__">
                  <div className="cstmSCroll1 CrmScroll">
                    <ScrollArea
                      speed={0.8}
                      className="stats_update_list"
                      contentClassName="content"
                      horizontal={false}
                      enableInfiniteScroll={true}
                      style={{
                        paddingRight: "0px",
                        height: "auto",
                        maxHeight: "120px"
                      }}
                    >
                      {this.state.requirement_mobility.map((value, key) => (
                        <span
                          key={key + 1}
                          className="w-50 d-inline-flex pb-2"
                        >
                          {/*   <input type='checkbox' name="oc_service" className="checkbox1" checked={value.active || ''} onChange={(e) => this.setcheckbox(key, value.active, 'requirement')} name="shift_requirement" data-rule-required="true" />
                                        <label >
                                            <div className="d_table-cell">
                                                <span onClick={(e) => handleCheckboxValue(this, 'requirement', key, 'active')}></span>
                                            </div>
                                            <div className="d_table-cell" onClick={(e) => handleCheckboxValue(this, 'requirement', key, 'active')}>{value.name}</div>
                                        </label> */}

                          <label className="c-custom-checkbox CH_010">
                            <input
                              type="checkbox"
                              name="oc_service"
                              className="checkbox1"
                              checked={value.active>0? true:false || ""}
                              onChange={e =>
                                this.handleCheckboxValue(
                                  "requirement_mobility",
                                  key,
                                  "active"
                                )
                              }
                              name="shift_requirement_mobility"
                              data-rule-required="true"
                            />
                            <i className="c-custom-checkbox__img"></i>
                            <div>{value.name}</div>
                          </label>
                          {value.key_name === "other" && value.active>0?
                              <div className={"pr-3"}>
                              <input
                                  type="text"
                                  className="border-color-black"
                                  onChange={e => this.handleShareholderNameChange("requirement_mobility", key, "other_title", e.target.value)}
                                  name="other"
                                  required={true}
                                  value={value.other_title}
                                  style={{height:'22px', fontSize:'13px', marginLeft:'3px'}}
                              />
                              </div>: ""}
                        </span>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
              <label className="label_2_1_1">{this.state.booked_by>0 && bookedByData[this.state.booked_by]['requirement'] ? bookedByData[this.state.booked_by]['requirement'] : 'Shift Requirement'}:</label>
                  
                <div className="custom_scroll_set__">
                  <div className="cstmSCroll1 CrmScroll">
                    <ScrollArea
                      speed={0.8}
                      className="stats_update_list"
                      contentClassName="content"
                      horizontal={false}
                      enableInfiniteScroll={true}
                      style={{
                        paddingRight: "0px",
                        height: "auto",
                        maxHeight: "120px"
                      }}
                    >
                      {this.state.requirement.map((value, key) => (
                        <span
                          key={key + 1}
                          className="w-50 d-inline-flex pb-2"
                        >
                          {/*   <input type='checkbox' name="oc_service" className="checkbox1" checked={value.active || ''} onChange={(e) => this.setcheckbox(key, value.active, 'requirement')} name="shift_requirement" data-rule-required="true" />
                                        <label >
                                            <div className="d_table-cell">
                                                <span onClick={(e) => handleCheckboxValue(this, 'requirement', key, 'active')}></span>
                                            </div>
                                            <div className="d_table-cell" onClick={(e) => handleCheckboxValue(this, 'requirement', key, 'active')}>{value.name}</div>
                                        </label> */}

                          <label className="c-custom-checkbox CH_010">
                            <input
                              type="checkbox"
                              name="oc_service"
                              className="checkbox1"
                              checked={value.active>0? true:false || ""}
                              onChange={e =>
                                this.handleCheckboxValue(
                                  "requirement",
                                  key,
                                  "active"
                                )
                              }
                              name="shift_requirement"
                              data-rule-required="true"
                            />
                            <i className="c-custom-checkbox__img"></i>
                            <div>{value.name}</div>
                          </label>
                          {value.key_name === "other" && value.active>0?
                              <div className={"pr-3"}>
                              <input
                                  type="text"
                                  className="border-color-black"
                                  onChange={e => this.handleShareholderNameChange("requirement", key, "other_title", e.target.value)}
                                  name="other"
                                  required={true}
                                  value={value.other_title}
                                  style={{height:'22px', fontSize:'13px', marginLeft:'3px'}}
                              />
                              </div>: ""}
                        </span>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>


            {this.state.booked_by==7 || this.state.booked_by==1 ? (<div className="row mt-3">
            <div className="col-md-6">
                  <label className="label_2_1_1">{this.state.booked_by>0 && bookedByData[this.state.booked_by]['org_shift_data'] ? bookedByData[this.state.booked_by]['org_shift_data'] : 'Org Requirement'}:</label>
                <div className="custom_scroll_set__">
                  <div className="cstmSCroll1 CrmScroll">
                    <ScrollArea
                      speed={0.8}
                      className="stats_update_list"
                      contentClassName="content"
                      horizontal={false}
                      enableInfiniteScroll={true}
                      style={{
                        paddingRight: "0px",
                        height: "auto",
                        maxHeight: "120px"
                      }}
                    >
                      {this.state.org_shift_data.map((value, key) => (
                        <span
                          key={key + 1}
                          className="w-50 d-inline-flex pb-2"
                        >
                          {/*   <input type='checkbox' name="oc_service" className="checkbox1" checked={value.active || ''} onChange={(e) => this.setcheckbox(key, value.active, 'requirement')} name="shift_requirement" data-rule-required="true" />
                                        <label >
                                            <div className="d_table-cell">
                                                <span onClick={(e) => handleCheckboxValue(this, 'requirement', key, 'active')}></span>
                                            </div>
                                            <div className="d_table-cell" onClick={(e) => handleCheckboxValue(this, 'requirement', key, 'active')}>{value.name}</div>
                                        </label> */}

                          <label className="c-custom-checkbox CH_010">
                            <input
                              type="checkbox"
                              name="oc_service"
                              className="checkbox1"
                              checked={value.active>0? true:false || ""}
                              onChange={e =>
                                this.handleCheckboxValue(
                                  "org_shift_data",
                                  key,
                                  "active"
                                )
                              }
                              name="shift_requirement_date"
                              data-rule-required="true"
                            />
                            <i className="c-custom-checkbox__img"></i>
                            <div>{value.name}</div>
                          </label>

                          {value.key_name === "other" && value.active>0?
                              <div>
                              <input
                                  type="text"
                                  className="border-color-black"
                                  onChange={e => this.handleShareholderNameChange( "org_shift_data", key, "other_title", e.target.value)}
                                  name="other"
                                  required={true}
                                  value={value.other_title}
                                  style={{height:'22px', fontSize:'13px', marginLeft:'3px'}}
                              />
                              </div>: ""}
                        </span>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>):(<React.Fragment/>)}
            <div className="row">
              <div className="col-sm-5 col-sm-offset-7 P_15_T">
                <button
                  disabled={this.state.loading}
                  onClick={this.onSubmit}
                  className="but_submit"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchtoProps = dispach => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchtoProps
)(UpdateShiftRequirementPopUp);
