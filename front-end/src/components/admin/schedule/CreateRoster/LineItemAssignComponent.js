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
import AdressComponent from "./AdressComponent";
import ShiftRequirementCheckbox from "./ShiftRequirementCheckbox";
import StartEndTimeComponent from "./StartEndTimeComponent";
import { onChange, getRosterShiftOption } from './../actions/CreateRosterAction';


const CustomTbodyComponent = props => (
  <div {...props} className={classNames("rt-tbody", props.className || [])}>
    <SimpleBar
      style={{
        maxHeight: "350px",
        overflowX: "hidden",
        paddingLeft: "0px",
        paddingRight: "15px"
      }}
      forceVisible={false}
    >
      {props.children}
    </SimpleBar>
  </div>
);

class LineItemAssignComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  checkRequiredParamterForGetLineItem = () => {
    if (!this.props.participantId) {
        return false;
    }
    
    if (!this.props.start_time) {
        return false;
    }
    if (!this.props.end_time) {
        return false;
    }
    
    if (this.props.completeAddress.length > 0) {
      if (!this.props.completeAddress[0].state) {
         return false;
      }
    }

    return true;
  };

  render() {

    const columns = [
      {accessor: "support_item_number",
        headerClassName: "Th_class_d1 header_cnter_tabl checkbox_header",
        className: "Tb_class_d1 Tb_class_d2",
        Cell: props => {
          return (
            <span>
              <label className="Cus_Check_1">
                <input
                  type="checkbox"
                  name="plan_line_item[]"
                  checked={props.original.checked || ""}
                  onChange={() =>
                    this.props.setcheckbox(
                      props.index,
                      "checked",
                      "lineItemList"
                    )
                  }
                />
                <div className="chk_Labs_1"></div>
              </label>
              <div>{props.value}</div>
            </span>
          );
        },
        Header: x => {
          return (
            <div className="Tb_class_d1 Tb_class_d2">
              <span>
                <div>Support Category Number</div>
              </span>
            </div>
          );
        },
        resizable: false,
        width: 230
      },
      {
        accessor: "support_item_name",
        headerClassName: "Th_class_d1 header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Support Category Name:</div>
          </div>
        ),
        className: "Tb_class_d1 Tb_class_d2 ",
        Cell: props => <span>{props.value}</span>
      },
      {
        accessor: "line_item_number",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Support Item Number:</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{props.value}</span>
      },
      {
        accessor: "line_item_name",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Support Item Name:</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{props.value}</span>
      }
    ];

    const columnsSelected = [
      {
        accessor: "support_item_number",
        headerClassName: "Th_class_d1 header_cnter_tabl checkbox_header",
        className: "Tb_class_d1 Tb_class_d2",
        Cell: props => {
          return (
            <span>
              <div>{props.value}</div>
            </span>
          );
        },
        Header: x => {
          return (
            <div className="Tb_class_d1 Tb_class_d2">
              <span>
                <div>Support Category Number</div>
              </span>
            </div>
          );
        },
        resizable: false,
        width: 230
      },
      {
        accessor: "support_item_name",
        headerClassName: "Th_class_d1 header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Support Category Name:</div>
          </div>
        ),
        className: "Tb_class_d1 Tb_class_d2 ",
        Cell: props => <span>{props.value}</span>
      },
      {
        accessor: "line_item_number",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Support Item Number:</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{props.value}</span>
      },
      {
        accessor: "line_item_name",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Support Item Name:</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{props.value}</span>
      },
      {
        accessor: "line_itemId",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Action:</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => (
          <span  className={"short_buttons_01 btn_color_archive"} onClick={() => this.props.removeSelectedLineItem(props.value)}>
            Remove
          </span>
        )
      }
    ];

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-lg-12">
            <div className="label_2_1_1 f-bold">
              Line Item for shift (Search and select Required)
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-lg-12 Finance-Statement_tBL">
            <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
              <ReactTable
                PaginationComponent={Pagination}
                columns={columns}
                manual="true"
                data={this.props.lineItemList}
                pages={this.props.pages}
                loading={this.props.loading}
                onFetchData={this.props.fetchDataLineItem}
                filtered={this.props.lineItemfiltered}
                defaultPageSize={10}
                className="-striped -highlight"
                noDataText="No Record Found"
                minRows={2}
                previousText={<span className="icon icon-arrow-left privious"></span>}
                nextText={<span className="icon icon-arrow-right next"></span>}
                showPagination={false}
                TbodyComponent={CustomTbodyComponent}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <label className="label_2_1_1 f-bold">Selected Line Items:</label>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-lg-12 Finance-Statement_tBL">
            <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
              <ReactTable
                PaginationComponent={Pagination}
                columns={columnsSelected}
                manual="true"
                data={_.values(this.props.selected_line_item_id_with_data)}
                pages={this.props.pages}
                loading={this.props.loading}
                defaultPageSize={Object.keys(this.props.selected_line_item_id_with_data).length > 0? Object.keys(this.props.selected_line_item_id_with_data).length: 10}
                className="-striped -highlight"
                noDataText="No Record Found"
                minRows={2}
                previousText={ <span className="icon icon-arrow-left privious"></span>}
                nextText={<span className="icon icon-arrow-right next"></span>}
                showPagination={false}
                TbodyComponent={CustomTbodyComponent}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}


const mapStateToProps = state => ({
    stateList : state.CreateRosterReducer.stateList,
    participantId : state.CreateRosterReducer.participant.value,
});

const mapDispatchtoProps = dispach => {
    return {
      getRosterShiftOption: (key, value) => dispach(getRosterShiftOption()),
    };
};

export default connect(mapStateToProps, mapDispatchtoProps, null, { withRef: true })(LineItemAssignComponent);