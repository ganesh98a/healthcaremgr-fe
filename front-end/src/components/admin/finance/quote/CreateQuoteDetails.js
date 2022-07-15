import React, { Component } from "react";
import Select from "react-select-plus";
import DatePicker from "react-datepicker";
import ProfilePage from "./../common/ProfilePage";
import { connect } from "react-redux";
import {
  postData,
  handleDateChangeRaw,
  selectFilterOptions,
  onKeyPressPrevent
} from "service/common.js";
import { priceTypeDropdown } from "dropdown/FinanceDropdown.js";
import moment from "moment";
import { BrowserRouter as Router, Link } from "react-router-dom";
import { REGULAR_EXPRESSION_FOR_NUMBERS } from "config.js";
import SimpleBar from "simplebar-react";
import classNames from "classnames";

const getOptionLineItem = (e, funding_type, previous_selected_item) => {
  if (!e) {
    return Promise.resolve({ options: [] });
  }

  return postData("finance/FinanceQuoteManagement/get_line_item_name", { search: e, funding_type: funding_type, previous_selected_item: previous_selected_item }).then(res => {
    if (res.status) {
      return { options: res.data };
    }
  });
};

class CreateQuoteDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    var user_type = this.props.user_type == 6 ? 6 : this.props.user_type;
    var update_btn_type = this.props.dynamic_button_name_on_update();

    var update_btn_name = update_btn_type ? "Send As New Quote" : "Override Existing Quote";

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-lg-12">
            <div className=" py-4">
              {user_type == 6 ? (
                <span className="back_arrow">
                  <a onClick={() => this.props.stateChange("secondStage", false)}>
                    <span className="icon icon-back1-ie"></span>
                  </a>
                </span>
              ) : (
                  <Link to={"/admin/finance/quote_dashboard"}>
                    <span className="icon icon-back1-ie"></span>
                  </Link>
                )}
            </div>
            <div className="by-1">
              <div className="row d-flex  py-4">
                <div className="col-lg-8">
                  <div className="h-h1 color">
                    New Quote For{" "} {this.props.user_details.name || "N/A"}
                  </div>
                </div>
                <div className="col-lg-4 d-flex align-self-center"></div>
              </div>
            </div>
          </div>
        </div>

        <ProfilePage
          fundingShow={user_type == 6 ? false : true}
          details={this.props.user_details}
        />

        <div className="row d-flex justify-content-center">
          <div className="col-lg-12">
            <div className="Bg_F_moule">
              <div className="row d-flex justify-content-center">
                <div className="col-lg-8 col-sm-12">
                  <form id="create_quote" method="post" onKeyPress={onKeyPressPrevent}>
                    <div className="row mt-5  d-flex">
                      <div className="col-lg-12 col-sm-12">
                        {this.props.quote_number ? (
                          <label className="label_2_1_1 color">
                            <strong>Quote Number: </strong>
                            {this.props.quote_number || "N/A"}
                          </label>
                        ) : (
                            ""
                          )}
                      </div>
                      <div className="col-lg-12 col-sm-12">
                        {this.props.quoteId ? this.props.status == 1 ? "Sent" : "Draft" : ""}
                      </div>
                    </div>

                    <div className="row mt-5">
                      <div className="col-lg-4 col-sm-4">
                        <label className="label_2_1_1">Quote Date</label>
                        <div className="datepicker_my">
                          <DatePicker
                            dateFormat="dd-MM-yyyy"
                            autoComplete={"off"}
                            onChangeRaw={handleDateChangeRaw}
                            placeholderText={"00/00/0000"}
                            className="text-left"
                            selected={this.props.quote_date ? moment(this.props.quote_date) : null}
                            name="quote_date"
                            onChange={e => this.props.stateChange("quote_date", e)}
                            required={true}
                            minDate={moment()}
                          />
                        </div>
                      </div>
                      <div className="col-lg-4 col-sm-4">
                        <label className="label_2_1_1">Valid Until</label>
                        <div className="datepicker_my">
                          <DatePicker
                            dateFormat="dd-MM-yyyy"
                            autoComplete={"off"}
                            onChangeRaw={handleDateChangeRaw}
                            placeholderText={"00/00/0000"}
                            className="text-left"
                            selected={
                              this.props.valid_until
                                ? moment(this.props.valid_until)
                                : null
                            }
                            name="start_date"
                            onChange={e =>
                              this.props.stateChange("valid_until", e)
                            }
                            required={true}
                            minDate={moment()}
                          />
                        </div>
                      </div>
                    </div>

                    {/* <SimpleBar
                      style={{
                        maxHeight: "450px",
                        overflowX: "hidden",
                        paddingLeft: "0px",
                        paddingRight: "15px"
                      }}
                      forceVisible={false}
                    > */}
                    {this.props.items.map((val, index) => (
                      <div className="row mt-5 d-flex" key={index + 1}>
                        <div className="col-lg-3 col-sm-3">
                          <label className="label_2_1_1">Funding Type</label>

                          <div className="sLT_gray left left-aRRow">
                            <Select
                              required={true} simpleValue={true}
                              className="custom_select default_validation"
                              options={this.props.funding_types}
                              onChange={value => this.props.handleShareholderNameChange("items", index, "funding_type", value)}
                              value={val.funding_type}
                              clearable={false}
                              searchable={false}
                              placeholder={'Select...'}
                              inputRenderer={(props) => <input type="text" name={"funding_type" + index} {...props} readOnly  /* value={val.funding_type || ""} */ />}
                            />
                          </div>
                        </div>

                        <div className="col-lg-5 col-sm-5 align-self-end">
                          <label className="label_2_1_1">Line Item</label>
                          <div className="modify_select">
                            <Select.Async
                              cache={false}
                              className="default_validation "
                              name="form-field-name"
                              clearable={false}
                              ignoreCase={true}
                              filterOptions={selectFilterOptions}
                              onChange={value =>
                                this.props.handleShareholderNameChange("items", index, "line_ItemId", value)
                              }
                              value={val.line_ItemId}
                              loadOptions={e =>
                                getOptionLineItem(e, val.funding_type, this.props.items)
                              }
                              disabled={val.funding_type ? false : true}
                              placeholder="Search"
                              required={true}

                            />
                          </div>
                        </div>
                        <div className="col-lg-5 col-sm-5 align-self-end">
                          <label className="label_2_1_1">Price Type</label>
                          <div className="sLT_gray left left-aRRow">
                            <Select
                              required={true} simpleValue={true}
                              className="custom_select default_validation"
                              options={priceTypeDropdown()}
                              onChange={value =>
                                this.props.handleShareholderNameChange(
                                  "items",
                                  index,
                                  "price_type",
                                  value
                                )
                              }
                              value={val.price_type}
                              clearable={false}
                              searchable={false}
                              placeholder={'Select...'}
                              inputRenderer={(props) => <input type="text" name={"price_type" + index} {...props} readOnly  /* value={val.price_type || ""} */ />}
                            />
                          </div>
                        </div>
                        <div className="col-lg-2 col-sm-2">
                          <label className="label_2_1_1">Quantity</label>
                          <input
                            type="text"
                            name={"qty" + index}
                            pattern="/^0$|^[1-9][0-9]*$/"
                            onChange={e =>
                              this.props.handleShareholderNameChange(
                                "items",
                                index,
                                "qty",
                                e.target.value,
                                e
                              )
                            }
                            value={val.qty || ""}
                            required={true}
                            min="1"
                            max="10"
                            maxLength="2"
                          />
                        </div>
                        <div className="col-lg-2 col-sm-2 align-self-center">
                          <div className="label_2_1_1">&nbsp;</div>
                          <label className="label_2_1_1">
                            Cost: ${this.props.calculateItemCost(val)}
                          </label>
                        </div>
                        <div className="col-lg-1 col-sm-1 align-self-center">
                          <label className="label_2_1_1">&nbsp;</label>
                          <div>
                            {index === 0 && this.props.items.length < 10 ? (
                              <span
                                onClick={e =>
                                  this.props.handleAddShareholder(
                                    e,
                                    "items",
                                    val
                                  )
                                }
                                className="icon icon-add2-ie aDDitional_bTN_F0"
                              ></span>
                            ) : (
                                <span
                                  onClick={e =>
                                    this.props.handleRemoveShareholder(
                                      e,
                                      index,
                                      "items"
                                    )
                                  }
                                  className="icon icon-remove2-ie aDDitional_bTN_F1"
                                ></span>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* </SimpleBar> */}

                    <div className="row mt-5  d-flex">
                      <div className="col-lg-4">
                        <a
                          onClick={() =>
                            this.props.stateChange("add_manual_item", true)
                          }
                          className="C_NeW_BtN w-100"
                        >
                          <span>Add Manual Quote Item</span>
                          <i className="icon icon icon-add-icons"></i>
                        </a>
                      </div>
                    </div>

                    <React.Fragment>

                      {this.props.add_manual_item ? (
                        <React.Fragment>
                          <div className="row mt-5  d-flex">
                            <div className="col-lg-12 col-sm-12">
                              <div className="pAY_heading_01 by-1">
                                <div className="tXT_01">Manual Quote Item</div>
                                <i
                                  onClick={() =>
                                    this.props.stateChange(
                                      "add_manual_item",
                                      false
                                    )
                                  }
                                  className="icon icon-close2-ie"
                                ></i>
                              </div>
                            </div>
                          </div>
                          {/* <SimpleBar
                      style={{
                        maxHeight: "450px",
                        overflowX: "hidden",
                        paddingLeft: "0px",
                        paddingRight: "15px"
                      }}
                      forceVisible={false}
                    > */}
                          {this.props.manual_item.map((val, index) => (
                            <React.Fragment key={index + 1}>
                              <div className="row mt-5  d-flex">
                                <div className="col-lg-6 col-sm-6">
                                  <label className="label_2_1_1">
                                    Item Name
                                  </label>
                                  <input
                                    type="text"
                                    name={"item_name" + index}
                                    onChange={e => this.props.handleShareholderNameChange(
                                      "manual_item",
                                      index,
                                      "item_name",
                                      e.target.value
                                    )
                                    }
                                    value={val.item_name}
                                    required={true}
                                  />
                                </div>
                                <div className="col-lg-6 col-sm-6">
                                  <label className="label_2_1_1">
                                    Item Description
                                  </label>
                                  <input
                                    type="text"
                                    name={"description" + index}
                                    onChange={e =>
                                      this.props.handleShareholderNameChange(
                                        "manual_item",
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    value={val.description}
                                    required={true}
                                  />
                                </div>
                              </div>
                              <div className="row mt-5 d-flex">
                                <div className="col-lg-4 col-sm-4">
                                  <label className="label_2_1_1">Cost</label>
                                  <input
                                    type="text"
                                    name={"cost" + index}
                                    pattern={REGULAR_EXPRESSION_FOR_NUMBERS}
                                    onChange={e => this.props.handleShareholderNameChange("manual_item", index, "cost", e.target.value, e)}
                                    value={val.cost}
                                    required={true}
                                    min="1"
                                    max="99999.99"
                                    maxLength="8"
                                  />
                                </div>
                                <div className="col-lg-2 col-sm-2 align-self-center">
                                  <label className="label_2_1_1">&nbsp;</label>
                                  <div>
                                    {index === 0 && this.props.manual_item.length < 10 ?
                                      <span onClick={e => this.props.handleAddShareholder(e, "manual_item", val)}
                                        className="icon icon-add2-ie aDDitional_bTN_F0"
                                      ></span>
                                      :
                                      <span onClick={e => this.props.handleRemoveShareholder(e, index, "manual_item")}
                                        className="icon icon-remove2-ie aDDitional_bTN_F1"
                                      ></span>
                                    }
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                          {/* </SimpleBar> */}
                        </React.Fragment>
                      ) : (
                          ""
                        )}


                      <div className="row mt-5  d-flex">
                        <div className="col-lg-8 col-sm-12">
                          <label className="label_2_1_1">
                            Add Notes To Quote
                          </label>
                          <textarea
                            name="quote_note"
                            onChange={this.props.handleChange}
                            value={this.props.quote_note}
                            maxlength="400"
                            required={true}
                            className="w-100"
                          ></textarea>
                        </div>
                      </div>

                      <div className="row mt-5 d-flex justify-content-end">
                        {this.props.quoteId ? "": (
                            <div className="col-lg-4">
                              <button
                              disabled={this.props.loading || false}
                                onClick={e => this.props.submitQuote(e, 2)}
                                className="btn-1 out_line w-100"
                              >
                                Save Draft
                            </button>
                            </div>
                          )}
                        {!this.props.quoteId ? (
                          <div className="col-lg-4">
                            <button disabled={this.props.loading || false}
                              onClick={e => this.props.submitQuote(e, 1)}
                              className="btn-1 w-100"
                            >
                              Create & View Quote
                            </button>
                          </div>
                        ) : (
                            <div className="col-lg-4">
                              <button disabled={this.props.loading || false}
                                onClick={e => this.props.submitQuote(e, 1)}
                                className={
                                  "btn-1 w-100 " +
                                  (update_btn_type == 1 ? "out_line" : "")
                                }
                              >
                                {update_btn_name}
                              </button>
                            </div>
                          )}
                      </div>
                    </React.Fragment>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  showPageTitle: state.FinanceReducer.activePage.pageTitle,
  showTypePage: state.FinanceReducer.activePage.pageType
});
const mapDispatchtoProps = dispach => {
  return {};
};

export default connect(mapStateToProps, mapDispatchtoProps)(CreateQuoteDetails);
