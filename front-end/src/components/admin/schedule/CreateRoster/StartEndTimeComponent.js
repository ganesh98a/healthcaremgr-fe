import React, { Component } from "react";
import { handleDateChangeRaw} from "service/common.js";
import moment from "moment";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import _ from "lodash";
import { onChange, getRosterShiftOption } from './../actions/CreateRosterAction';

class StartEndTimeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <React.Fragment>
        <div className="row P_25_T">
          <div className="w-10-lg col-lg-2  col-md-3 col-xs-12">
            <label className="label_2_1_1 f-bold">Start Time:</label>
            <span className="required">
              <DatePicker 
                autoComplete={'off'} 
                onChangeRaw={handleDateChangeRaw} 
                required={true} 
                maxTime={(this.props.end_time) ? moment(this.props.end_time) : moment().hours(23).minutes(59)}
                minTime={moment().hours(0).minutes(0)} 
                className="text-center"
                selected={this.props.start_time ? moment(this.props.start_time) : null} 
                name="start_time" 
                onChange={(e) => this.props.selectTime(e, 'start_time')}
                showTimeSelect showTimeSelectOnly scrollableTimeDropdown 
                timeIntervals={15} 
                dateFormat="LT"
                placeholderText="00:00" />
            </span>
          </div>
          
          <div className="w-10-lg col-lg-2 col-md-3 col-xs-12">
            <label className="label_2_1_1 f-bold">End Time:</label>
            <span className="required">
              <DatePicker 
                autoComplete={'off'} 
                onChangeRaw={handleDateChangeRaw} 
                required={true} 
                className="text-center" 
                selected={this.props.end_time ? moment(this.props.end_time) : null}
                name="end_time" 
                minTime={(this.props.start_time) ? moment(this.props.start_time) : moment().hours(0).minutes(0)}
                maxTime={moment(this.props.start_time, 'DD-MM-YYYY').hours(23).minutes(59)} 
                onChange={(e) => this.props.selectTime(e, 'end_time')}
                showTimeSelect showTimeSelectOnly scrollableTimeDropdown 
                timeIntervals={15} 
                dateFormat="LT"
                placeholderText="00:00" />
            </span>
          </div>
          
          <div className="w-40-lg col-lg-4 col-md-3 col-xs-12 col-lg-offset-1  text-left">
            <label className="label_2_1_1 f-bold"> Shift Category:</label>
            <ul className="List_2_ul">
              {this.props.time_of_days.map((val, index) => {
                let disable = false; 
                if((val.key_name === 's_o' || val.key_name === 'daytime' || val.key_name === 'evening' || val.key_name === 'a_o')){
                    disable = true;  
                }
                if(val.key_name === 'a_o'){
                    var ind = this.props.time_of_days.findIndex(x => x.key_name == "s_o")
                    let x = this.props.time_of_days[ind].checked;
                    disable = x ? false : true;
                }
                if(val.key_name === 's_o'){
                    var ind = this.props.time_of_days.findIndex(x => x.key_name == "a_o")
                    let x = this.props.time_of_days[ind].checked;
                    disable = x ? false: true;
                }
                return <li key={index + 1} className="w-30">
                  <label className="radio_F1 check_F1 mb-0" style={{ width: 'auto' }}>
                    <input
                      type="checkbox"
                      className="checkbox1 font"
                      onChange={() => this.props.setcheckbox(index, val.checked, "time_of_days")}
                      id={val.key_name}
                      name={val.key_name}
                      checked={val.checked || ""}
                      disabled={disable}
                    />
                    <span className="checkround" htmlFor={val.key_name}></span>
                    <span className="txtcheck text_2_0_1">{val.name}</span>
                  </label>
                </li>
                })}
            </ul>
          </div>
        </div>
      </React.Fragment>
    );
  }
}


const mapStateToProps = state => ({
    
});

const mapDispatchtoProps = dispach => {
    return {
      getRosterShiftOption: (key, value) => dispach(getRosterShiftOption()),
    };
};

export default connect(mapStateToProps, mapDispatchtoProps)(StartEndTimeComponent);