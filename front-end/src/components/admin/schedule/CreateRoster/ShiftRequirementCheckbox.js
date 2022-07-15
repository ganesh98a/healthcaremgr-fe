import React, { Component } from "react";
import "react-block-ui/style.css";
import ScrollArea from "react-scrollbar";
import { connect } from "react-redux";
import _ from "lodash";


class ShiftRequirementCheckbox extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="w-40-lg col-lg-4 col-md-6 col-xs-12">
          <label className="label_2_1_1 f-bold">{this.props.title}:</label>
          {this.props.checkBoxArray.length > 0 ? (
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
                  {this.props.checkBoxArray.map((value, key) => (
                    <span key={key + 1} className="w-50 d-inline-block pb-2">
                      <label className="c-custom-checkbox CH_010">
                        <input
                          type="checkbox"
                          className="checkbox1"
                          id="1"
                          className="checkbox1"
                          checked={value.checked || ""}
                          onChange={e =>
                            this.props.setcheckbox(
                              key,
                              value.checked,
                              this.props.stateName
                            )
                          }
                          name={this.props.assistance}
                        />
                        <i className="c-custom-checkbox__img"></i>
                        <div>{value.label}</div>
                      </label>
                    </span>
                  ))}
                </ScrollArea>
              </div>
            </div>
          ) : (
              " Not available"
            )}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
    stateList : state.CreateRosterReducer.stateList,
});

const mapDispatchtoProps = dispach => {
    return {
      
    };
};

export default connect(mapStateToProps, mapDispatchtoProps)(ShiftRequirementCheckbox);