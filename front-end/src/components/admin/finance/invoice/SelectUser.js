import React, { Component, Fragment } from "react";
import "react-select-plus/dist/react-select-plus.css";
import "react-datepicker/dist/react-datepicker.css";
import { queryOptionData,selectFilterOptions,postData} from "service/common.js";
import Select from "react-select-plus";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { ROUTER_PATH } from "config.js";
import PropTypes from 'prop-types';
import createClass from 'create-react-class';
import {iconFinanceShift} from 'service/custom_value_data.js';

const getOptionNewUser = (e) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData('finance/FinanceInvoice/get_participant_organization_name', { search: e ,type:'all'}).then((res) => {
        if(res.status){
            return { options: res.data };
        }
    });
}

const GravatarOption = createClass({
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    },
    handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
    },
    handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    },
    render() {
        
        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
                title={this.props.option.title}>
                <div className="Select_Search_Type_">
                    <div className="text_set">{this.props.children}</div>
                    <span className={"Default_icon "+ ((iconFinanceShift[this.props.option.booked_by])?iconFinanceShift[this.props.option.booked_by] : "") +' '+(this.props.option.hasOwnProperty('booked_gender') ? this.props.option.booked_gender:'')}><i className="icon"></i></span>
                </div>
            </div>
        );
    }
});

class SelectUser extends Component {
  constructor() {
    super();
    this.state = {
      userList: []
    };
  }

  selectChange = e => {
    let valData =
      e != undefined &&
      e != null &&
      typeof e == "object" &&
      e.hasOwnProperty("type")
        ? e
        : [];
    
    this.setState({ userList: valData, });
  };

  render() {
     
    return (
      <React.Fragment>
        
        {this.state.userList.hasOwnProperty("value") &&
                  this.state.userList.value > 0 ? (
                    <Redirect
                      to={{
                        state: {
                          inf: this.state.userList.value,
                          ptype: this.state.userList.booked_by,
                          booked_by: this.state.userList.type,
                        },
                        pathname:
                          ROUTER_PATH +
                          "admin/finance/CreateCreditNote"
                      }}
                      disabled={this.state.loading}
                      onClick={this.onSubmit}
                      className="btn cmn-btn1 creat_task_btn__"
                   />
                  ) : (
                    ""
                  )}

      <div
      className={
        "cmn_select_dv srch_select12 vldtn_slct " +
        (this.state.userList.hasOwnProperty("value")
          ? "remove-search"
          : "")
      }
    >
      <Select.Async
        cache={false}
        newOptionCreator={({ label: '', labelKey: '', valueKey: '' })}
        name="form-field-name"
        ignoreCase={true}
        matchProp={'any'}
        clearable={false}
        value={this.state.userList}
        filterOptions={selectFilterOptions}
        loadOptions={(e) => getOptionNewUser(e)}
        placeholder='Search'
        onChange={(e) => this.selectChange(e)}
        required={true}
        optionComponent={GravatarOption}
        />
    </div>
    </React.Fragment>
                   
    );
  }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(SelectUser);
