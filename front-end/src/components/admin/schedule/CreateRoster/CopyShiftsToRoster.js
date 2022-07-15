import React, { Component } from 'react'
import { connect } from 'react-redux';
import Select from 'react-select-plus';
import moment from "moment";
import {toastMessageShow, calculateGst} from "service/common.js";
import {setRosterList, removeShift, updatePlanLineItemFund} from './../actions/CreateRosterAction';
import { Link, Redirect } from 'react-router-dom';

class CopyShiftsToRoster extends Component {
    constructor(props) {
        super(props)
        this.state = {
            week_dropdown: [{ value: 0, label: "Week 1" }, { value: 1, label: "Week 2" }, { value: 2, label: "Week 3" }, { value: 3, label: "Week 4" }],
            fromWeek: 0,
            rosterList: [{}],
        }
        this.r_det = [];
    }
    
    componentDidMount(){
        let rosterList = JSON.parse(JSON.stringify(this.props.rosterList));
        this.setState({rosterList: rosterList})
    }
    
    markForCopyShift = (day, shiftIndex) => {
        let rosterList = this.state.rosterList;
        rosterList[this.state.fromWeek][day][shiftIndex]['is_copied'] = rosterList[this.state.fromWeek][day][shiftIndex]['is_copied']? false: true; 
        this.setState({rosterList: rosterList});
    }
    
    saveRoster = () => {
        let rosterList = this.state.rosterList;
        
        let rosterForRemovelList = JSON.parse(JSON.stringify(this.props.rosterList));
        
        var removel_shift = [];
        Object.keys(rosterForRemovelList[this.r_det.current_week]).map((key) => {
          rosterForRemovelList[this.r_det.current_week][key].map((val, index) => {
               if(val.is_active){
                   removel_shift = [...removel_shift, {shift_index: index, week_index: this.r_det.current_week, day: key}]
               }
           })
       });
       
        console.log(removel_shift, "removel_shift");
       
       this.props.removeShift(removel_shift);
       
        var rosterUpdatedList = JSON.parse(JSON.stringify(this.props.rosterList));
        
        let plan_line_item = JSON.parse(JSON.stringify(this.props.plan_line_item));  
           
        var is_select_any_day = false;
        Object.keys(rosterList[this.state.fromWeek]).map((key) => {
          rosterList[this.state.fromWeek][key].map((val, index) => {
               if(val.is_active && val.is_copied){
                   
                   is_select_any_day = true;
                   var in_funding = true;
                   var shift_details = {...val};  
                   
                   var selected_line_item_id_with_data = {...shift_details.selected_line_item_id_with_data};
                   
                   let temp_plan_line_item = JSON.parse(JSON.stringify(plan_line_item));  
                   Object.keys(selected_line_item_id_with_data).map((val, index) => {
                        var shift_item_cost = selected_line_item_id_with_data[val]["will_use_fund"];
                        var plan_line_itemId = selected_line_item_id_with_data[val]["plan_line_itemId"];
                        selected_line_item_id_with_data[val]["existing_shift_used_amount"] = undefined;


                        var have_fund = parseFloat(temp_plan_line_item[plan_line_itemId]['have_fund']);
                        var current_used = parseFloat(temp_plan_line_item[plan_line_itemId]['current_used']);

                        have_fund = (have_fund - shift_item_cost);
                        current_used = (current_used + shift_item_cost);
                        
                        temp_plan_line_item[plan_line_itemId]['have_fund'] = have_fund;
                        temp_plan_line_item[plan_line_itemId]['current_used'] = current_used;

                        if (have_fund < 0) {
                            in_funding = false;
                        }
                    });
                
                   if(in_funding){
                       plan_line_item = JSON.parse(JSON.stringify(temp_plan_line_item));
                   }
                   rosterUpdatedList[this.r_det.current_week][key][index] = {...val, roster_shiftId: undefined, in_funding: in_funding, preferred_member_ary: [{ name: "" }]}
               }
           })
       })
       
       if(is_select_any_day){
            this.props.updatePlanLineItemFund(plan_line_item);
            this.props.setRosterList(rosterUpdatedList);
            this.setState({redirect_roster: true})
       }else{
           toastMessageShow("Please select at least one shift.", "e");
           return false;
       }
    }
    
   
    render() {
        this.r_det = this.props.location.state;
        
        if(!this.r_det || !this.props.participantId){
            return <Redirect to={"/admin/schedule/create_roster"} />;
        }
          
        var week_dropdown = [];
        this.state.rosterList.map((val, index) => {
            if(index !== this.r_det.current_week){
                week_dropdown[index] = { value: index, label: "Week "+ (index+1)}
            }
        })
        
        if (this.state.redirect_roster) {
            let pathname = (this.props.rosterId)? "/admin/schedule/roster_details/"+this.props.rosterId : "/admin/schedule/create_roster";
            return <Redirect to={{ pathname: pathname, state: {come_from_add_shift: true}}} />;
        }
       
        
        return (
            <React.Fragment>
                <div className="row  _Common_back_a">
                    <div className="col-lg-12 col-md-12"><a onClick={() => this.setState({redirect_roster: true})}><span className="icon icon-back-arrow back_arrow"></span></a></div>
                </div>
                <div className="row"><div className="col-lg-12 col-md-12"><div className="bor_T"></div></div></div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 P_15_TB">
                        <h1 className={"color"}>Copy Shifts To Roster</h1>
                    </div>
                    <div className="col-lg-12 col-md-12"><div className="bor_T"></div></div>
                </div>

                <div className="pAY_heading_01 by-1 mt-5">
                    <div className="tXT_01"> Select Pre-fill Data:</div>
                </div>

                <div className="f-13 color pt-5">
                    To save time you have the option of copying information from another shift in this roster. Use<br />
                    the filters on the right to select a shift and the data from that shift will populate the form below.
                </div>

                <div className="row mt-5">
                    <div className="col-lg-12"><label className="label_2_1_1 f-bold">Select the Week to copy shifts from:</label></div>
                    <div className="col-lg-3">
                        <div className="csform-group">
                            <Select
                                simpleValue={true}
                                name=""
                                searchable={false}
                                clearable={false}
                                value={this.state.fromWeek}
                                onChange={e => this.setState({fromWeek: e})}
                                options={week_dropdown}
                                placeholder="Please select"
                            />
                        </div>
                    </div>
                </div>

                <div className="row d-flex flex-wrap after_before_remove">
                    {Object.keys(this.state.rosterList[this.state.fromWeek]).map((key) => {
                        var no_shift = true;
                        this.state.rosterList[this.state.fromWeek][key].map((val, ind) => {
                            if (val.is_active) {
                                no_shift = false;
                            }
                        })

                        return <div className="w-20-lg col-lg-3 pr-5" key={key}>
                            <div className="csform-group">
                                <label className="label_2_1_1 f-bold">{key}</label>
                                {this.state.rosterList[this.state.fromWeek][key].map((val, index) => (
                                    <React.Fragment key={index+1}>
                                        {(val.is_active && !no_shift) ?
                                            <ul className="List_2_ul w-50">
                                                <li className="w-100">
                                                    <label className="radio_F1 check_F1 mb-0 radio_direction_r black_F1">
                                                        <input type="checkbox" name="week_days" checked={val.is_copied || ''} onChange={() => this.markForCopyShift(key, index)} value="1" />
                                                        <span className="checkround"></span>
                                                        <span className="txtcheck text_2_0_1 w-100">
                                                            <span className="d-inline-block w-100">{ moment(val.start_time).format("HH:mm") + " - " + moment(val.end_time).format("HH:mm")}</span>
                                                        </span>
                                                    </label>
                                                </li>
                                            </ul>

                                            : (no_shift) ? 
                                                <div className="w-100">No Shift</div>
                                            : ""}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    })}
                </div>


                <div className="row mt-5">
                    <div className="col-lg-12"><label className="label_2_1_1 f-bold">Select the Week to copy shifts to:</label></div>
                    <div className="col-lg-3">
                        <div className="csform-group">
                            <Select
                                disabled={true}
                                simpleValue={true}
                                searchable={false}
                                clearable={false}
                                value={this.r_det.current_week}
                                onChange={e => { '' }}
                                options={this.state.week_dropdown}
                                placeholder="Please select"
                            />
                        </div>
                    </div>
                </div>

                <div className="row mt-5 d-flex flex-wrap after_before_remov justify-content-end">
                    <div className="col-lg-3 col-md-3">
                        <div className="button_set0 button_set1 w-100" onClick={this.saveRoster}>Save Roster</div>
                    </div>
                </div>

            </React.Fragment>
        )
    }
}


const mapStateToProps = state => ({
    participantId: state.CreateRosterReducer.participant.value,
    rosterList: state.CreateRosterReducer.rosterList,
    plan_line_item: state.CreateRosterReducer.plan_line_item,
    rosterId: state.CreateRosterReducer.rosterId
})

const mapDispatchtoProps = (dispach) => {
    return {
        setRosterList: (data) => dispach(setRosterList(data)),
        removeShift: (shift_data) => dispach(removeShift(shift_data)),
        updatePlanLineItemFund : (data) => dispach(updatePlanLineItemFund(data)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CopyShiftsToRoster);