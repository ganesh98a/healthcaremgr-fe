import React, { Component } from "react";
import ReactTable from "react-table";
import Select from "react-select-plus";
import DatePicker from "react-datepicker";
import Pagination from "service/Pagination.js";
import ScrollArea from "react-scrollbar";
import { PanelGroup, Panel } from "react-bootstrap";
import ProfilePage from "./../common/ProfilePage";
import { connect } from "react-redux";
import _ from "lodash";
import {
  ROUTER_PATH,
  BASE_URL,
  PAGINATION_SHOW,
  CURRENCY_SYMBOL,
  REGULAR_EXPRESSION_FOR_AMOUNT
} from "config.js";
import {
  getOrganisationDetails,
  getParticipantDetails,
  getSiteDetails,
  getHouseDetails,
  requestInvoiceData as requestData
} from "./../action/FinanceAction.js";
import {
  postData,
  toastMessageShow,
  currencyFormatUpdate,
  handleShareholderNameChange,
  handleRemoveShareholder,
  handleAddShareholder
} from "service/common.js";
import {
  colorCodeInvoiceStatus,
  iconFinanceShift,
  defaultSpaceInTable
} from "service/custom_value_data.js";
import jQuery from "jquery";
import SimpleBar from "simplebar-react";
import classNames from "classnames";

const CustomTbodyComponent = props => (
  <div {...props} className={classNames("rt-tbody", props.className || [])}>
    <SimpleBar
      style={{
        maxHeight: "450px",
        overflowX: "hidden",
        paddingLeft: "15px",
        paddingRight: "15px"
      }}
      forceVisible={false}
    >
      {props.children}
    </SimpleBar>
  </div>
);

const urlRedirect = ROUTER_PATH + "admin/finance/CreditNotes";
const modeTypePropsRequest = {
  participant: "participantDetails",
  site: "siteDetails",
  finace: "organisationDetails",
  house: "houseDetails"
};

class CreateCreditNote extends React.Component {
  constructor(props) {
    super(props);
    let invoice_for =
      props.location.state != undefined &&
      props.location.state != null &&
      props.location.state.hasOwnProperty("booked_by") &&
      props.location.state.inf > 0
        ? props.location.state.inf
        : 0;
    let ptype =
      props.location.state != undefined &&
      props.location.state != null &&
      props.location.state.hasOwnProperty("ptype") &&
      props.location.state.ptype != ""
        ? _.toLower(props.location.state.ptype)
        : "";
    let booked_by =
      props.location.state != undefined &&
      props.location.state != null &&
      props.location.state.hasOwnProperty("booked_by") &&
      props.location.state.booked_by != ""
        ? props.location.state.booked_by
        : 0;

    this.state = {
      activeCol: "",
      invoice_for: invoice_for,
      ptype: ptype,
      booked_by: booked_by,
      modeType: "",
      filtered: { invoice_for: invoice_for, booked_by: booked_by },
      invoiceList: [],
      filter_by: "invoice_number",
      callDefault: false,
      expanded: null,
      selectedInvoiceId: {},
      totalCreditAvailabelAmount: 0,
      totalCreditAmountRemaining: 0,
      amountAppliedInvoiceList: [],
      loading: false,
      formValidRequest: false
    };
    this.reactTable = React.createRef();
  }

  expand_row(rowIndexId, invoice_id) {
    var expanded = { ...this.state.expanded };
    var selectedInvoiceId = { ...this.state.selectedInvoiceId };
    if (expanded[rowIndexId]) {
      expanded[rowIndexId] = !expanded[rowIndexId];
      delete selectedInvoiceId[invoice_id];
    } else {
      expanded[rowIndexId] = true;
      let tempData = {};
      tempData["status"] = true;
      tempData["amount"] = "";
      tempData["desc"] = "";
      tempData["indexId"] = rowIndexId;
      tempData["invoice_id"] = invoice_id;
      selectedInvoiceId[invoice_id] = tempData;
    }

    this.setState(
      {
        expanded: expanded,
        selectedInvoiceId: selectedInvoiceId
      },
      () => {
        this.calculateCreditAmountAvailableAndRemaining();
      }
    );
  }

  fetchInvoiceList = (state, instance) => {
    this.setState({ loading: true });
    requestData(
      state.pageSize,
      state.page,
      state.sorted,
      state.filtered,
      2
    ).then(res => {
      this.setState(
        {
          invoiceList: res.rows,
          all_count: res.all_count,
          pages: res.pages,
          loading: false
        },
        () => this.calculateCreditAmountAvailableAndRemaining()
      );
    });
  };

  submitSearch = (e, key, value, checkTextBoxValue) => {
    if (e) e.preventDefault();

    var state = {};
    state[key] = value;

    this.setState(state, () => {
      if (checkTextBoxValue != undefined && checkTextBoxValue) {
        if (
          (this.state.search && this.state.search.length > 0) ||
          (value == this.state.filter_by &&
            this.state.filter_by == "all" &&
            key == "filter_by")
        ) {
          this.filterListing();
        }
      } else {
        this.filterListing();
      }
    });
  };

  filterListing = () => {
    let req = {
      search: this.state.search,
      filter_by: this.state.filter_by,
      start_date: this.state.start_date,
      end_date: this.state.end_date,
      invoice_for: this.state.invoice_for,
      booked_by: this.state.booked_by
    };
    this.setState({
      filtered: req,
      expanded: null,
      selectedInvoiceId: {},
      amountAppliedInvoiceList: [],
      totalCreditAvailabelAmount: 0,
      totalCreditAmountRemaining: 0
    });
  };

  componentDidMount() {
    if (this.state.invoice_for > 0 && this.state.ptype != "") {
      if (this.state.booked_by == "2" || this.state.booked_by == "3") {
        this.setState({ modeType: "participant", callDefault: true }, () => {
          this.props.getParticipantDetails(this.state.invoice_for);
        });
      } else if (this.state.booked_by == "1") {
        this.setState({ modeType: "site", callDefault: true }, () => {
          this.props.getSiteDetails(this.state.invoice_for);
        });
      } else if (this.state.booked_by == "4" || this.state.booked_by == "5") {
        this.setState({ modeType: "finace", callDefault: true }, () => {
          this.props.getOrganisationDetails(this.state.invoice_for);
        });
      } else if (this.state.booked_by == "7") {
        this.setState({ modeType: "house", callDefault: true }, () => {
          this.props.getHouseDetails(this.state.invoice_for);
        });
      }
    } else {
      this.setState({ pageDisplay: false }, () => {
        toastMessageShow("Required parameter is missing.", "e", {
          close: () => {
            window.location = urlRedirect;
          }
        });
      });
    }
  }

  calculateCreditAmountAvailableAndRemaining = () => {
    let availableAmountData = Object.values(this.state.selectedInvoiceId);
    let oldCreditAvailabelAmount = this.state.totalCreditAvailabelAmount;
    let totalAmount = _.sumBy(availableAmountData, function(row) {
      return row != undefined &&
        row != null &&
        row.hasOwnProperty("amount") &&
        !isNaN(parseFloat(row.amount))
        ? parseFloat(row.amount)
        : 0;
    });

    let applyAmountData = Object.values(this.state.amountAppliedInvoiceList);
    let totalApplyAmount = _.sumBy(applyAmountData, function(row) {
      return row != undefined &&
        row != null &&
        row.hasOwnProperty("invoice_apply_amount") &&
        !isNaN(parseFloat(row.invoice_apply_amount))
        ? parseFloat(row.invoice_apply_amount)
        : 0;
    });
    let remaingAmount = _.subtract(totalAmount, totalApplyAmount);
    this.setState(
      {
        totalCreditAvailabelAmount: _.round(parseFloat(totalAmount), 2),
        totalCreditAmountRemaining: _.round(parseFloat(remaingAmount), 2)
      },
      () => {
        if (
          this.state.totalCreditAvailabelAmount > 0 &&
          oldCreditAvailabelAmount == 0
        ) {
          this.setState({
            amountAppliedInvoiceList: [
              { invoice_id_selected: "", invoice_apply_amount: "" }
            ]
          });
        } else if (
          oldCreditAvailabelAmount > 0 &&
          this.state.totalCreditAvailabelAmount == 0
        ) {
          this.setState({ amountAppliedInvoiceList: [] });
        }
      }
    );
  };

  onchangedData = (e, invoice_id, type) => {
    if (_.includes(["amount", "desc"], type)) {
      let selectedInvoiceIdData = Object.assign(
        {},
        { ...this.state.selectedInvoiceId }
      );
      let invoicListData = this.state.invoiceList[
        selectedInvoiceIdData[invoice_id]["indexId"]
      ]
        ? this.state.invoiceList[selectedInvoiceIdData[invoice_id]["indexId"]]
        : {};
      let amountAvailable =
        invoicListData != undefined &&
        invoicListData != null &&
        invoicListData.hasOwnProperty("amount") &&
        invoicListData.hasOwnProperty("credit_note_from_used")
          ? invoicListData.amount - invoicListData.credit_note_from_used
          : 0;
      if (
        selectedInvoiceIdData[invoice_id]["status"] &&
        type == "amount" &&
        e.target.value <= amountAvailable
      ) {
        selectedInvoiceIdData[invoice_id][type] = e.target.value;
        handleShareholderNameChange(
          this,
          "selectedInvoiceId",
          invoice_id,
          type,
          e.target.value,
          e
        ).then(res => {
          if (res.status) {
            this.calculateCreditAmountAvailableAndRemaining();
          }
        });
      } else if (
        selectedInvoiceIdData[invoice_id]["status"] &&
        type != "amount"
      ) {
        selectedInvoiceIdData[invoice_id][type] = e.target.value;
        this.setState({ selectedInvoiceId: selectedInvoiceIdData }, () => {});
      }
    } else if (_.includes(["invoice_apply_amount"], type)) {
      let selectedInvoiceIdData = Object.assign(
        {},
        { ...this.state.amountAppliedInvoiceList }
      );
      let invoicListData = _.filter(this.state.invoiceList, { id: invoice_id });
      invoicListData = invoicListData.length > 0 ? invoicListData[0] : {};
      let amountAvailable =
        invoicListData != undefined &&
        invoicListData != null &&
        invoicListData.hasOwnProperty("amount") &&
        invoicListData.hasOwnProperty("credit_note_to_used")
          ? invoicListData.amount - invoicListData.credit_note_to_used
          : 0;
      let amountDataremain =
        type == "invoice_apply_amount" &&
        !isNaN(
          this.state.amountAppliedInvoiceList[
            e.target.attributes.getNamedItem("data-indexkey").value
          ]["invoice_apply_amount"]
        ) &&
        this.state.amountAppliedInvoiceList[
          e.target.attributes.getNamedItem("data-indexkey").value
        ]["invoice_apply_amount"] != ""
          ? _.round(
              parseFloat(
                this.state.amountAppliedInvoiceList[
                  e.target.attributes.getNamedItem("data-indexkey").value
                ]["invoice_apply_amount"]
              ),
              2
            )
          : 0;
      if (
        type == "invoice_apply_amount" &&
        e.target.value <= amountAvailable &&
        _.round(parseFloat(e.target.value), 2) <=
          this.state.totalCreditAmountRemaining + amountDataremain
      ) {
        handleShareholderNameChange(
          this,
          "amountAppliedInvoiceList",
          e.target.attributes.getNamedItem("data-indexkey").value,
          type,
          e.target.value,
          e
        ).then(res => {
          if (res.status) {
            this.calculateCreditAmountAvailableAndRemaining();
          }
        });
      }
    }
  };
  selectPendingInvoiceListOption = (index, selectedInvoiceId) => {
    let selectedtoOption = _.map(
      this.state.amountAppliedInvoiceList,
      "invoice_id_selected"
    );
    selectedtoOption = _.difference(selectedtoOption, [selectedInvoiceId]);
    let selectedfromOption = Object.keys(this.state.selectedInvoiceId);
    let selectOption = _.filter(this.state.invoiceList, { status: "0" });
    //selectOption = _.filter(selectOption, (v) => !_.includes(selectedfromOption, v.id) && !_.includes(selectedtoOption, v.id));
    selectOption = _.map(selectOption, row => {
      return {
        label:
          "Invoice " +
          row.invoice_number +
          " ( " +
          currencyFormatUpdate(
            _.round(
              _.round(parseFloat(row.amount), 2) -
                _.round(parseFloat(row.credit_note_to_used), 2),
              2
            ),
            CURRENCY_SYMBOL
          ) +
          " )",
        value: row.id,
        disabled:
          _.includes(selectedfromOption, row.id) ||
          _.includes(selectedtoOption, row.id)
            ? true
            : false
      };
    });
    return selectOption;
  };

  submitHandler = e => {
    e.preventDefault();
    jQuery("#case_form").validate({ ignore: [] });
    // console.log(validator);
    if (jQuery("#case_form").valid()) {
      this.setState({ loading: true });
      let requestData = {};
      let userDetails = modeTypePropsRequest.hasOwnProperty(this.state.modeType)
        ? this.props[modeTypePropsRequest[this.state.modeType]]
        : {};
      requestData["from_select_invoice_apply"] = Object.values(
        this.state.selectedInvoiceId
      );
      requestData[
        "to_select_invoice_apply"
      ] = this.state.amountAppliedInvoiceList;
      requestData["invoice_for"] = this.state.invoice_for;
      requestData["ptype"] = this.state.ptype;
      requestData["booked_by"] = this.state.booked_by;
      requestData[
        "totalCreditAvailabelAmount"
      ] = this.state.totalCreditAvailabelAmount;
      requestData["invoice_for_user"] = userDetails.name;
      postData("finance/FinanceInvoice/save_credit_notes", requestData).then(
        result => {
          if (result.status) {
            toastMessageShow(result.msg, "s", {
              close: () => {
                window.location = urlRedirect;
              }
            });
          } else {
            toastMessageShow(result.error, "e");
            this.setState({ loading: false });
          }
        }
      );
    } else {
      this.setState({ formValidRequest: true });
    }
  };

  handleEnterPressSubmit = e => {
    if (e.key == "Enter") {
      this.submitSearch(e);
    }
  };
  render() {
    const dataTable = [
      { task: "Task 1", duedate: "10/10/2025", assign: "Tanner Linsley" },
      { task: "Task 1", duedate: "10/10/2025", assign: "Tanner Linsley" },
      {
        task: "Task 1",
        duedate: "10/10/2025",
        assign: "Tanner Linsley"
      }
    ];

    const ndiserror = [
      {
        invoicenumber: "X_00001",
        description: "Shift",
        addressedto: "Booker 1",
        amount: "$100",
        dateofinvoice: "01/03/2019"
      },
      {
        invoicenumber: "X_00002",
        description: "Shift",
        addressedto: "Booker 2",
        amount: "$110",
        dateofinvoice: "01/03/2019"
      },
      {
        invoicenumber: "X_00003",
        description: "Shift",
        addressedto: "Booker 3",
        amount: "$140",
        dateofinvoice: "01/03/2019"
      }
    ];

    const columns = [
      {
        headerClassName: "_align_c__ header_cnter_tabl",
        className: "_align_c__",
        accessor: "invoice_status",
        id: "invoice_status",
        width: 70,
        resizable: false,
        headerStyle: { border: "0px solid #fff" },
        //expander: true,
        Header: () => (
          <div>
            <div className="ellipsis_line__">Status</div>
          </div>
        ),
        Cell: props => (
          <div className="">
            <span>
              <label className="Cus_Check_1">
                <input
                  type="checkbox"
                  onChange={() =>
                    this.expand_row(props.viewIndex, props.original.id)
                  }
                  checked={props.isExpanded ? true : false}
                />
                <div className="chk_Labs_1" style={{ paddingRight: 0 }}></div>
              </label>
            </span>
          </div>
        ),
        style: {
          cursor: "pointer",
          fontSize: 25,
          padding: "0",
          textAlign: "center",
          userSelect: "none"
        }
      },

      {
        accessor: "invoice_number",
        id: "invoice_number",
        headerClassName: "_align_c__ header_cnter_tabl",
        className: "Tb_class_d1 Tb_class_d2",
        Cell: props => {
          return (
            <span>
              <div>{defaultSpaceInTable(props.value)}</div>
            </span>
          );
        },
        Header: x => {
          return (
            <div className="Tb_class_d1 Tb_class_d2">
              <span>
                <div className="ellipsis_line__">Invoice Number</div>
              </span>
            </div>
          );
        },
        className: "_align_c__",
        resizable: false,
        width: 180
      },
      {
        id: "description",
        accessor: "description",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Description</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },

      {
        // Header: "Fund Type",
        id: "amount",
        accessor: "amount",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Amount</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => (
          <span>
            {defaultSpaceInTable(
              currencyFormatUpdate(props.value, CURRENCY_SYMBOL)
            )}
          </span>
        )
      },
      {
        id: "fund_type",
        accessor: "fund_type",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Fund Type</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        // Header: "Date Of Last Issue",
        id: "invoice_date",
        accessor: "invoice_date",
        headerClassName: "_align_c__ header_cnter_tabl",
        Header: () => (
          <div>
            <div className="ellipsis_line__">Date Of Invoice</div>
          </div>
        ),
        className: "_align_c__",
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },

      {
        accessor: "invoice_status",
        id: "invoice_status",
        headerClassName: "_align_c__ header_cnter_tabl",
        className: "_align_c__",
        width: 160,
        resizable: false,
        headerStyle: { border: "0px solid #fff" },
        Header: () => (
          <div>
            <div className="ellipsis_line__">Status</div>
          </div>
        ),
        Cell: props => (
          <div className="expander_bind">
            <div className="d-flex w-100 justify-content-center align-item-center">
              <span
                className={
                  "short_buttons_01 " +
                  (colorCodeInvoiceStatus[
                    _.toLower(props.original.invoice_status)
                  ]
                    ? colorCodeInvoiceStatus[
                        _.toLower(props.original.invoice_status)
                      ]
                    : "")
                }
              >
                {props.original.invoice_status}
              </span>
            </div>
          </div>
        ),
        style: {
          cursor: "pointer",
          fontSize: 25,
          padding: "0",
          textAlign: "center",
          userSelect: "none"
        }
      }
    ];

    var selectOpt = [
      { value: "one", label: "One" },
      { value: "two", label: "Two" }
    ];

    function logChange(val) {
      //console.log("Selected: " + val);
    }

    console.log("props", this.props.location);
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-lg-12">
            <div className=" py-4">
              <span className="back_arrow">
                <a href={urlRedirect}>
                  <span className="icon icon-back1-ie"></span>
                </a>
              </span>
            </div>

            <div className="by-1">
              <div className="row d-flex  py-4">
                <div className="col-lg-8">
                  <div className="h-h1 color">
                    {this.props.showPageTitle}{" "}
                    {this.props[modeTypePropsRequest[this.state.modeType]]
                      ? this.props[modeTypePropsRequest[this.state.modeType]][
                          "name"
                        ]
                      : ""}
                  </div>
                </div>
                <div className="col-lg-4 d-flex align-self-center">
                  {/* <a className="but">Retrive Payroll  Tax Information Via MYOB</a> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProfilePage
          fundingShow={
            this.state.booked_by == "2" || this.state.booked_by == "3"
              ? true
              : false
          }
          pageType="creditnotes"
          details={
            modeTypePropsRequest.hasOwnProperty(this.state.modeType)
              ? this.props[modeTypePropsRequest[this.state.modeType]]
              : []
          }
          mode={
            this.state.modeType != "" ? this.state.modeType : "participaint"
          }
        />
        <form method="post" id="case_form">
          <div className="Finance__panel_1 mt-5">
            <div className="F_module_Panel E_ven_and_O_dd-color E_ven_color_ O_dd_color_ Border_0_F">
              {/* <PanelGroup accordion id="accordion-example"> */}
              <Panel eventKey="1" defaultExpanded>
                <Panel.Heading>
                  <Panel.Title toggle>
                    <div>
                      <p>Select for invoice Credit Notes</p>
                      <span className="icon icon-arrow-right"></span>
                      <span className="icon icon-arrow-down"></span>
                    </div>
                  </Panel.Title>
                </Panel.Heading>
                <Panel.Body collapsible>
                  <div className="row d-flex justify-content-center">
                    <div className="col-lg-8 col-sm-12 py-5">
                      <div className="row d-flex">
                        <div className="col-lg-7">
                          <div className="search_bar right srchInp_sm actionSrch_st">
                            <input
                              type="text"
                              className="srch-inp"
                              placeholder="Search.."
                              onChange={e =>
                                this.setState({ search: e.target.value })
                              }
                              value={this.state.search}
                              onKeyPress={this.handleEnterPressSubmit}
                            />
                            <i
                              className="icon icon-search2-ie"
                              onClick={this.filterListing}
                            ></i>
                          </div>
                        </div>

                        <div className="col-lg-5">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="Fil_ter_ToDo">
                                <label>From</label>
                                <span  className={'cust_date_picker'}>
                                  <DatePicker
                                    selected={this.state.start_date}
                                    isClearable={true}
                                    onChange={value =>
                                      this.submitSearch("", "start_date", value)
                                    }
                                    placeholderText="00/00/0000"
                                    dateFormat="dd-MM-yyyy"
                                    autoComplete={"off"}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="Fil_ter_ToDo">
                                <label>To</label>
                                <span  className={'cust_date_picker right_0_date_piker'}>
                                  <DatePicker
                                    selected={this.state.end_date}
                                    onChange={value =>
                                      this.submitSearch("", "end_date", value)
                                    }
                                    placeholderText="00/00/0000"
                                    isClearable={true}
                                    dateFormat="dd-MM-yyyy"
                                    autoComplete={"off"}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row py-5">
                        <div className="col-lg-12">
                          <div className="bt-1"></div>
                        </div>
                      </div>

                      <div className="row">
                        <input
                          name="applyAmount_hidden"
                          type="hidden"
                          value={
                            this.state.totalCreditAvailabelAmount <= 0 ? "" : 0
                          }
                          required={true}
                          data-msg-required="please select atleast on shift for credit amount."
                        />
                        <div className="col-lg-12 NDIS-Billing_tBL Credit-notes_tBL">
                          <div className="listing_table PL_site th_txt_center__ odd_even_tBL  odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                            <ReactTable
                              expanded={this.state.expanded}
                              filtered={this.state.filtered}
                              TheadComponent={_ => null}
                              manual
                              onFetchData={this.fetchInvoiceList}
                              data={this.state.invoiceList}
                              columns={columns}
                              PaginationComponent={Pagination}
                              noDataText="No Record Found"
                              minRows={2}
                              defaultPageSize={this.state.invoiceList.length}
                              pages={this.state.pages}
                              loading={this.state.loading}
                              TbodyComponent={CustomTbodyComponent}
                              previousText={
                                <span className="icon icon-arrow-left privious"></span>
                              }
                              nextText={
                                <span className="icon icon-arrow-right next"></span>
                              }
                              showPagination={false}
                              className="-striped -highlight"
                              noDataText="No record found"
                              collapseOnDataChange={false}
                              ref={this.reactTable}
                              SubComponent={props => (
                                <div className="tBL_Sub">
                                  <div className="tBL_des">
                                    <div className="row  d-flex">
                                      <div className="col-lg-4 col-sm-4">
                                        <label className="label_2_1_1">
                                          Amount
                                        </label>
                                        <input
                                          type="text"
                                          pattern={
                                            REGULAR_EXPRESSION_FOR_AMOUNT
                                          }
                                          required={
                                            this.state.selectedInvoiceId[
                                              props.original.id
                                            ]["status"]
                                          }
                                          value={
                                            this.state.selectedInvoiceId[
                                              props.original.id
                                            ]["amount"] || ""
                                          }
                                          name={"amount_" + props.original.id}
                                          onChange={e =>
                                            this.onchangedData(
                                              e,
                                              props.original.id,
                                              "amount"
                                            )
                                          }
                                        />
                                        {props.original.credit_note_from_used >
                                        0 ? (
                                          <div className="text-success f-13 mt-3">
                                            Credit limit Available{" "}
                                            {_.round(
                                              _.round(
                                                parseFloat(
                                                  props.original.amount
                                                ),
                                                2
                                              ) -
                                                _.round(
                                                  parseFloat(
                                                    props.original
                                                      .credit_note_from_used
                                                  ),
                                                  2
                                                ),
                                              2
                                            )}{" "}
                                            only
                                          </div>
                                        ) : (
                                          <React.Fragment />
                                        )}
                                      </div>
                                      <div className="col-lg-8 col-sm-8">
                                        <label className="label_2_1_1">
                                          Item Description
                                        </label>
                                        <input
                                          type="text"
                                          required={
                                            this.state.selectedInvoiceId[
                                              props.original.id
                                            ]["status"]
                                          }
                                          value={
                                            this.state.selectedInvoiceId[
                                              props.original.id
                                            ]["desc"] || ""
                                          }
                                          onChange={e =>
                                            this.onchangedData(
                                              e,
                                              props.original.id,
                                              "desc"
                                            )
                                          }
                                          name={"desc_" + props.original.id}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {this.state.totalCreditAvailabelAmount > 0 ? (
                        <div className="row mt-5  d-flex">
                          <div className="col-lg-12 text-right">
                            <span className="short_buttons_01 btn_color_avaiable F__bTN ">
                              Credit Amount Available{" "}
                              {this.state.totalCreditAvailabelAmount}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <React.Fragment>
                          {this.state.formValidRequest ? (
                            <div className="mt-3">
                              <div className="cUS_error_class error_cLass">
                                <i
                                  className="icon icon-alert mr-2"
                                  style={{ fontSize: "15px" }}
                                ></i>
                                <small style={{ fontSize: "10px" }}>
                                  Please select atleast one invoice and fill
                                  amount for create credit notes
                                </small>
                              </div>
                            </div>
                          ) : (
                            <React.Fragment />
                          )}
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                </Panel.Body>
              </Panel>

              <Panel eventKey="2" defaultExpanded>
                <Panel.Heading>
                  <Panel.Title toggle>
                    <div>
                      <p>Apply Credit Notes</p>
                      <span className="icon icon-arrow-right"></span>
                      <span className="icon icon-arrow-down"></span>
                    </div>
                  </Panel.Title>
                </Panel.Heading>
                <Panel.Body collapsible>
                  {this.state.amountAppliedInvoiceList.length > 0 ? (
                    <React.Fragment>
                      {" "}
                      <div className="row d-flex justify-content-center">
                        <div className="col-lg-8 col-sm-12 py-5">
                          <SimpleBar
                            style={{
                              height: "300px",
                              maxHeight: "400px",
                              overflowX: "hidden",
                              paddingLeft: "15px",
                              paddingRight: "15px"
                            }}
                            forceVisible={false}
                          >
                            {this.state.amountAppliedInvoiceList.map(
                              (inValue, index) => (
                                <div className="row d-flex mb-5" key={index}>
                                  <div className="col-lg-6 col-sm-6 align-self-end">
                                    <label className="label_2_1_1">
                                      Apply To
                                    </label>
                                    <div className="sLT_gray left left-aRRow">
                                      <Select
                                        name={"invoice_id_selected_" + index}
                                        simpleValue={true}
                                        className="custom_select default_validation"
                                        options={this.selectPendingInvoiceListOption(
                                          index,
                                          inValue.invoice_id_selected
                                        )}
                                        onChange={e =>
                                          handleShareholderNameChange(
                                            this,
                                            "amountAppliedInvoiceList",
                                            index,
                                            "invoice_id_selected",
                                            e
                                          )
                                        }
                                        value={inValue.invoice_id_selected}
                                        clearable={false}
                                        searchable={false}
                                        required={true}
                                        placeholder={"Select Invoice"}
                                        inputRenderer={props => (
                                          <input
                                            type="text"
                                            readOnly
                                            required={true}
                                            {...props}
                                            defaultValue={
                                              inValue.invoice_id_selected
                                            }
                                            name={
                                              "invoice_id_selected_input" +
                                              index
                                            }
                                          />
                                        )}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-lg-4 col-sm-4">
                                    <label className="label_2_1_1">
                                      Amount
                                    </label>
                                    <input
                                      type="text"
                                      pattern={REGULAR_EXPRESSION_FOR_AMOUNT}
                                      required={
                                        inValue.invoice_apply_amount == ""
                                          ? true
                                          : false
                                      }
                                      value={inValue.invoice_apply_amount}
                                      name={"invoice_apply_amount_" + index}
                                      data-indexkey={index}
                                      onChange={e =>
                                        this.onchangedData(
                                          e,
                                          inValue.invoice_id_selected,
                                          "invoice_apply_amount"
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="col-lg-1 col-sm-1 align-self-center">
                                    <label className="label_2_1_1">
                                      &nbsp;
                                    </label>
                                    <div>
                                      {index > 0 ? (
                                        <button
                                          onClick={e =>
                                            handleRemoveShareholder(
                                              this,
                                              e,
                                              index,
                                              "amountAppliedInvoiceList"
                                            ).then(res => {
                                              if (res.status) {
                                                this.calculateCreditAmountAvailableAndRemaining();
                                              }
                                            })
                                          }
                                          className="icon icon-remove2-ie aDDitional_bTN_F1"
                                        ></button>
                                      ) : (
                                        <button
                                          className="icon icon-add2-ie aDDitional_bTN_F0"
                                          onClick={e =>
                                            handleAddShareholder(
                                              this,
                                              e,
                                              "amountAppliedInvoiceList",
                                              inValue
                                            )
                                          }
                                        ></button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </SimpleBar>
                        </div>
                      </div>
                      {this.state.totalCreditAmountRemaining > 0 ? (
                        <React.Fragment>
                          <div className="row d-flex justify-content-center">
                            <div className="col-lg-8 col-sm-12 text-right">
                              <span
                                className={
                                  "short_buttons_01 " +
                                  (this.state.totalCreditAmountRemaining ==
                                  this.state.totalCreditAvailabelAmount
                                    ? this.state.formValidRequest
                                      ? "btn_color_archive"
                                      : ""
                                    : "btn_color_archive")
                                }
                              >
                                Credit Amount Remaining{" "}
                                {this.state.totalCreditAmountRemaining}
                              </span>

                              {this.state.formValidRequest ? (
                                <div className="mt-3">
                                  <div className="cUS_error_class error_cLass">
                                    <i
                                      className="icon icon-alert mr-2"
                                      style={{ fontSize: "15px" }}
                                    ></i>
                                    <small style={{ fontSize: "10px" }}>
                                      Amount remaining must be $0.00
                                    </small>
                                  </div>
                                </div>
                              ) : (
                                <React.Fragment />
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      ) : (
                        <React.Fragment />
                      )}
                      <input
                        name="credit_amount_hidden"
                        type="hidden"
                        value={
                          this.state.totalCreditAmountRemaining > 0 ? "" : 0
                        }
                        required={true}
                        data-msg-required="Amount remaining must be $0.00"
                      />
                    </React.Fragment>
                  ) : (
                    <React.Fragment />
                  )}
                </Panel.Body>
              </Panel>

              {/* <PanelGroup/> */}
            </div>
          </div>

          <div className="row d-flex justify-content-end">
            <div className="col-lg-3">
              <button
                type="button"
                className="btn-1 w-100"
                onClick={e => this.submitHandler(e)}
                disabled={this.state.loading}
              >
                Apply Credit Note
              </button>
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => ({
  showPageTitle: state.FinanceReducer.activePage.pageTitle,
  showTypePage: state.FinanceReducer.activePage.pageType,
  organisationDetails: state.FinanceReducer.organisationDetails,
  participantDetails: state.FinanceReducer.participantDetails,
  siteDetails: state.FinanceReducer.siteDetails,
  houseDetails: state.FinanceReducer.houseDetails
});
const mapDispatchtoProps = dispach => {
  return {
    getOrganisationDetails: (orgId, extraParms) =>
      dispach(getOrganisationDetails(orgId, extraParms)),
    getParticipantDetails: patId => dispach(getParticipantDetails(patId)),
    getSiteDetails: siteId => dispach(getSiteDetails(siteId)),
    getHouseDetails: houseId => dispach(getHouseDetails(houseId))
  };
};

export default connect(mapStateToProps, mapDispatchtoProps)(CreateCreditNote);
