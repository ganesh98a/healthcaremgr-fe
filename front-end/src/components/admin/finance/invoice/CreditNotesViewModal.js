import React, { Component } from "react";
import ReactTable from "react-table";
import Pagination from "service/Pagination.js";
import _ from "lodash";
import classNames from "classnames";
import ScrollArea from "react-scrollbar";
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

const CustomTbodyComponent = props => (
  <div {...props} className={classNames("rt-tbody", props.className || [])}>
    <div className=" cstmSCroll1">
      <ScrollArea
        speed={0.8}
        className="stats_update_list"
        contentClassName="content"
        horizontal={false}
        style={{
          paddingRight: "15px",
          paddingLeft: "15px",
          height: "auto",
          maxHeight: "300px",
          minHeight: "150px"
        }}
      >
        {props.children}
      </ScrollArea>
    </div>
  </div>
);

class CreditNotesViewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invoiceList: [],
      expanded: null,
      data_apply: [],
      creditDetails: {}
      //filtered:{}
    };
    this.reactTable = React.createRef();
  }

  fetchInvoiceList = (state, instance) => {
    this.setState({ loading: true });
    requestData(
      state.pageSize,
      state.page,
      state.sorted,
      state.filtered,
      5
    ).then(res => {
      this.setState({
        invoiceList: res.rows,
        all_count: res.all_count,
        pages: res.pages,
        loading: false,
        data_apply: res.hasOwnProperty("data_apply") ? res.data_apply : [],
        creditDetails: res.hasOwnProperty("credit_details_data")
          ? res.credit_details_data
          : {},
        expanded:
          res.rows.length > 0
            ? res.rows.map(() => {
                return true;
              })
            : null
      });
    });
  };
  render() {
    const columns = [
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

    return (
      <div className={"customModal " + (this.props.show ? " show" : "")}>
        <div className="cstomDialog widBig">
          <h3 className="cstmModal_hdng1--">
            Credit Note {this.state.creditDetails.credit_note_number || ""}
            <span
              className="closeModal icon icon-close1-ie"
              onClick={this.props.close}
            ></span>
          </h3>

          <div className="row d-flex justify-content-center">
            <div className="col-lg-10 col-sm-12 py-5">
              <div className="pAY_heading_01 bb-1">
                <div className="tXT_01">Select for invoice Credit Notes</div>
              </div>

              <div className="row mb-5">
                <div className="col-lg-12 NDIS-Billing_tBL Credit-notes_tBL">
                  <div className="listing_table PL_site th_txt_center__ odd_even_tBL  odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                    <ReactTable
                      expanded={this.state.expanded}
                      filtered={this.state.filtered}
                      defaultFiltered={{
                        creditNoteId: this.props.creditNoteId
                      }}
                      TheadComponent={_ => null}
                      manual
                      onFetchData={this.fetchInvoiceList}
                      data={this.state.invoiceList}
                      columns={columns}
                      PaginationComponent={Pagination}
                      noDataText="No Record Found"
                      minRows={1}
                      defaultPageSize={this.state.invoiceList.length}
                      pages={this.state.pages}
                      loading={this.state.loading}
                      previousText={
                        <span className="icon icon-arrow-left privious"></span>
                      }
                      nextText={
                        <span className="icon icon-arrow-right next"></span>
                      }
                      showPagination={false}
                      TbodyComponent={CustomTbodyComponent}
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
                                  {" "}
                                  <strong>Amount</strong>
                                </label>
                                <div className="f-14">
                                  {currencyFormatUpdate(
                                    props.original.item_amount,
                                    CURRENCY_SYMBOL
                                  )}
                                </div>
                              </div>
                              <div className="col-lg-8 col-sm-8">
                                <label className="label_2_1_1">
                                  <strong>Item Description</strong>
                                </label>
                                <div className="f-14">
                                  {props.original.item_desc || ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="pAY_heading_01 bb-1 mb-3">
                <div className="tXT_01">Apply Credit Notes</div>
              </div>
              <div className="row d-flex mb-3">
                <div className="col-lg-5 col-sm-5">
                  <label className="label_2_1_1">
                    {" "}
                    <strong>Apply To: </strong>
                  </label>
                </div>
                <div className="col-lg-4 col-sm-4 text-center">
                  <label className="label_2_1_1">
                    {" "}
                    <strong>Refund Number: </strong>
                  </label>
                </div>
                <div className="col-lg-3 col-sm-3 text-center">
                  <label className="label_2_1_1">
                    {" "}
                    <strong>Amount To: </strong>
                  </label>
                </div>
              </div>

              <div className=" cstmSCroll1">
                <ScrollArea
                  speed={0.8}
                  className="stats_update_list"
                  contentClassName="content"
                  horizontal={false}
                  style={{
                    paddingRight: "15px",
                    paddingLeft: "15px",
                    height: "auto",
                    maxHeight: "300px",
                    minHeight: "150px"
                  }}
                >
               
                  {this.state.data_apply.length > 0 ? (
                    this.state.data_apply.map((row, index) => {
                      return (
                        <div className="row d-flex mb-3" key={index}>
                          <div className="col-lg-5 col-sm-5">
                            <div className="add_dotted_012 f-14">
                              Invoice {row.apply_invoice_number} (
                              {currencyFormatUpdate(
                                row.invoice_amount,
                                CURRENCY_SYMBOL
                              )}
                              )
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-4">
                            <div className="text-center f-14">
                              {row.apply_refund_number} 
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-3">
                            <div className="text-center f-14">
                              {currencyFormatUpdate(
                                row.apply_item_amount,
                                CURRENCY_SYMBOL
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <React.Fragment />
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreditNotesViewModal;
