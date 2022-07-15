import React, { Component } from 'react';

import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import { REGULAR_EXPRESSION_FOR_NUMBERS, REGULAR_EXPRESSION_FOR_AMOUNT } from 'config.js';
import ScrollArea from 'react-scrollbar';
import { PanelGroup, Panel } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom';
import { postData, handleChangeSelectDatepicker, handleChange, handleDateChangeRaw, handleShareholderNameChange, toastMessageShow, onlyNumberAllow, Confirm } from 'service/common.js';
import moment from 'moment';
import jQuery from "jquery";
import { SLDSISODatePicker } from '../../salesforce/lightning/SLDSISODatePicker';
import { Input } from '@salesforce/design-system-react';
import { Dropdown } from '@salesforce/design-system-react'
import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
const WAIT_INTERVAL = 1000;

class CreateNewLineItem extends React.Component {

    static EUnitTypes = Object.freeze({
        each: { label: 'Each', value: 1 << 0 },
        hour: { label: 'Hourly', value: 1 << 1 },
        daily: { label: 'Daily', value: 1 << 2 },
        week: { label: 'Weekly', value: 1 << 3 },
        monthly: { label: 'Monthly', value: 1 << 4 },
        annually: { label: 'Annually', value: 1 << 5 },
        km: { label: 'KM', value: 1 << 6 },
    });

    UnitOptions = [];

    constructor(props) {
        super(props);
        this.state = {
            funding_type_option: [],
            outcome_domain_option: [],
            registration_group_option: [],
            support_category_option: [],
            time_of_the_days: [],
            week_days: [],
            state: [],
            quote_required: false,
            price_control: false,
            units: '',
            schedule_constraint: false,
            travel_required: false,
            cancellation_fees: false,
            ndis_reporting: false,
            non_f2f: false,
            public_holiday: false,
            oncall_provided: false,
            category_ref: false,
            weekday: false,
            saturday: false,
            sunday: false,
            daytime: false,
            evening: false,
            overnight: false,
            sleepover: false,
            support_type: '',
        }

        this.timer = null;
        this.datepickers = {
            start_date: React.createRef(),
            end_date: React.createRef(),
        }


        for (const prop in CreateNewLineItem.EUnitTypes)
            this.UnitOptions.push(CreateNewLineItem.EUnitTypes[prop])
    }

    triggerChange = () => {
        let { support_category, line_item_name } = this.state;
        this.getSupportType(support_category, line_item_name, 'support_type');
    }

    getCreateLineItemOption = (lineItemId) => {
        postData('finance/FinanceLineItem/get_create_line_item_option_and_details', { lineItemId: lineItemId }).then((result) => {
            if (result.status) {
                this.setState(result.data, () => {
                    if (!result.data.category_ref) {
                        this.setState({ is_cat: true })
                    }
                })
            }
        });
    }

    /**
     * Get support purpose based on category
     * @param {int} support_category
     * @param {str} state_index
     */
    getSupportPurpose = (support_category, state_index) => {
        postData('finance/FinanceLineItem/get_support_purpose_and_outcome_by_category', { support_category: support_category }).then((result) => {
            if (result.status) {
                this.setState({ [state_index]: result.support_purpose, support_outcome_domain: result.support_outcome_domain });
                let { line_item_name } = this.state;
                this.getSupportType(support_category, line_item_name, 'support_type');
            }
        });
    }

    /**
     * Get support type based on category
     * @param {int} support_category
     * @param {str} state_index
     */
     getSupportType = (support_category, line_item_name, state_index) => {
        postData('finance/FinanceLineItem/get_support_type_by_category', { support_category: support_category, line_item_name: line_item_name }).then((result) => {
            if (result.status) {
                this.setState({ [state_index]: result.support_type });
            }
        });
    }

    componentDidMount = () => {
        this.getCreateLineItemOption(this.props.match.params.id);
        if (this.props.match.params.id) {
            this.setState({ lineItemId: this.props.match.params.id });
        }
    }

    handleChangeDatePicker = key => (dateYmdHis, e, data) => {
        let newState = {}
        newState[key] = dateYmdHis
        this.setState(newState, () => {
            if ((key == 'to_date' && this.state.from_date != '') || (this.state.from_date != '' && this.state.to_date != '')) {
                if ((Date.parse(this.state.from_date) > Date.parse(this.state.to_date))) {
                    toastMessageShow("To date should be greater than From date", "e");
                }
            }
        });

    }

    handleDatePickerOpened = k => () => {
        Object.keys(this.datepickers).forEach(refKey => {
            const { current } = this.datepickers[refKey] || {}
            if (refKey !== k && current && 'instanceRef' in current) {
                current.instanceRef.setState({ isOpen: false })
            }
        })
    }

    onSubmit = (e) => {
        e.preventDefault();

        var validator = jQuery("#add_line_item").validate({ ignore: [], });

        if (jQuery("#add_line_item").valid()) {
            this.setState({ loading: true });
            postData('finance/FinanceLineItem/add_update_line_item', this.state).then((result) => {
                if (result.status) {
                    toastMessageShow('Line item created successfully', 's');
                    this.setState({ redirectTrue: true });
                } else {
                    if (result.overwrite) {
                        this.confirmationOverwrite(result.error);
                    } else {
                        toastMessageShow(result.error, 'e');
                    }                    
                }
                this.setState({ loading: false });
            });
        } else {
            validator.focusInvalid();
        }

    }

    /**
   * Confirmation to overwrite line item
   * @param {object} formData 
   * @param {int} totalRows 
   * @param {int} infectedRows 
   */
    confirmationOverwrite = (error_msg) => {
        var confirm_msg = error_msg;
        Confirm(confirm_msg, { confirm: 'Confirm', heading_title: "Import Line Item" }).then(msg_result => {
        if (msg_result.status === true) {
            let rqData = {
                ...this.state,
                overwrite: true
            }
            postData('finance/FinanceLineItem/add_update_line_item', rqData).then((result) => {
                if (result.status) {
                    toastMessageShow('Line item created successfully', 's');
                    this.setState({ redirectTrue: true });
                } else {
                    toastMessageShow(result.error, 'e');
                }
                this.setState({ loading: false });
            });
        }                
        });
    }

    viewStatus = () => {
        var status = '';
        if (this.props.match.params.id) {
            if (this.state.status == 1) {
                var status = "Active";
            } else if (this.state.status == 2) {
                var status = "Inactive";
            } else {
                var status = "Archived";
            }
        }
        return status;
    }

    renderSupportCategory = () => {
        return (
            <div className="col-lg-12">
                <label className="label_2_1_1">Support Category</label>
                <label htmlFor="support_category" className="error CheckieError" style={{ display: "block", width: "100%;" }} ></label>
                <span className="required">
                    <div className="Parent-List_2_ul">
                        <div className="cstmSCroll1 FScroll">
                            <ScrollArea
                                speed={0.8}
                                contentClassName="content"
                                horizontal={false}

                                style={{ paddingRight: '15px', maxHeight: "140px" }}
                            >
                                <ul className="List_2_ul">
                                    {this.state.support_category_option.map((val, index) => (
                                        <li className={"w-" + (((index % 2) == 0) ? "60" : "40")} key={index + 1}>
                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                <input type="radio" name={"support_category_"+index} onChange={(e) => {
                                                    handleChangeSelectDatepicker(this, e.target.value, 'support_category');
                                                    if (this.state.line_item_number != '') {
                                                        let val_str = e.target.value;
                                                        this.setState({ line_item_number: val_str.padStart(2, '0')});
                                                    }                                                    
                                                    this.getSupportPurpose(e.target.value, 'support_purpose');
                                                }} 
                                                checked={(val.id == this.state.support_category) ? true : false} value={val.id || ''} />
                                                <span className="checkround" name={"support_category_chk_"+index}></span>
                                                <span className="txtcheck text_2_0_1">{val.name}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    </div>
                </span>
            </div>
        );
    }

    /**
     * Update checkbox handling
     * @param {str} name 
     */
    onCheckHandle = (name) => {
        let state = this.state;
        state[name] = !state[name];
        this.setState(state);
    }

    render() {
        const line_itemId = this.props.match.params.id;
        const weekDays = [ 
            { name:"Weekday", state: "weekday" }, 
            { name:"Saturday", state: "saturday" },
            { name:"Sunday", state: "sunday" },
            { name:"Public Holiday", state: "public_holiday" }
        ];
        const dayTime = [ 
            { name:"DayTime", state: "daytime" }, 
            { name:"Evening", state: "evening" },
            { name:"Overnight (Sleep Over)", state: "sleepover" },
            { name:"Active Overnight", state: "overnight" }
        ];
        return (
            <React.Fragment>
                {this.state.redirectTrue ? <Redirect to='/admin/finance/line_item_listing' /> : ''}
                <div className="row">

                    <div className="col-lg-12">
                        <div className=" py-4">
                            <span className="back_arrow">
                                <Link to="/admin/finance/line_item_listing"><span className="icon icon-back1-ie"></span></Link>
                            </span>
                        </div>

                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-8">
                                    <div className="h-h1 color">{this.props.match.params.id ? 'Edit Line Item ' + this.state.line_item_number : this.props.showPageTitle}</div>
                                </div>
                                <div className="col-lg-4 d-flex align-self-center justify-content-end">
                                    {this.viewStatus() ? <span className="Small_btn_az green_colr">{this.viewStatus()}</span> : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="Finance__panel_1 mt-5">
                    <div className="F_module_Panel E_ven_and_O_dd-color E_ven_color_ O_dd_color_ Border_0_F" >
                        <form id="add_line_item" method="post">
                            <Panel defaultExpanded>
                                <Panel.Heading>
                                    <Panel.Title toggle>
                                        <div>
                                            <p>Line Item Categories</p>
                                            <span className="icon icon-arrow-right"></span>
                                            <span className="icon icon-arrow-down"></span>
                                        </div>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body collapsible>
                                    <div className="row">
                                        <div className="col-lg-8 col-lg-offset-2">

                                            <div className="row mt-5">
                                                <div className="col-lg-6 col-md-6 col-sm-6">

                                                    <span className='required'>

                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                required={true} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.funding_type_option}
                                                                onChange={(value) => handleChangeSelectDatepicker(this, value, 'funding_type')}
                                                                value={this.state.funding_type || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                aceholder="Support Funding Type"
                                                                inputRenderer={(props) => <input type="text" name={"funding_type"} {...props} readOnly  /* value={this.state.funding_type || ""} */ />}
                                                            />
                                                        </div>
                                                    </span>

                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6">
                                                    <div className="sLT_gray left left-aRRow">
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-12">
                                                    <label className="label_2_1_1">Support Registration Group</label>
                                                    <label htmlFor="support_registration_group" className="error CheckieError" style={{ display: "block", width: "100%;" }} ></label>
                                                    <span className={this.state.is_cat ? "" : "required"}>
                                                        <div className="Parent-List_2_ul">
                                                            <div className="cstmSCroll1 FScroll">
                                                                <ScrollArea
                                                                    speed={0.8}
                                                                    contentClassName="content"
                                                                    horizontal={false}
                                                                    style={{ paddingRight: '15px', maxHeight: "140px" }}
                                                                >
                                                                    <ul className="List_2_ul">
                                                                        {this.state.registration_group_option.map((val, index) => (
                                                                            <li className={"w-" + (((index % 2) == 0) ? "60" : "40")} key={index + 1}>
                                                                                <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                                    <input type="radio" name="support_registration_group" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'support_registration_group')} checked={(val.id == this.state.support_registration_group) ? true : false} value={val.id || ''} required={this.state.is_cat ? false : true} />
                                                                                    <span className="checkround" name={"support_registration_group_chk_"+index}></span>
                                                                                    <span className="txtcheck text_2_0_1">{val.name}</span>
                                                                                </label>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </ScrollArea>
                                                            </div>
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                {this.renderSupportCategory()}
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-6 col-md-6 col-sm-6">
                                                    <label className="label_2_1_1">Purpose</label>
                                                    <label htmlFor="support_purpose" className="error CheckieError" style={{ display: "block", width: "100%;" }} ></label>
                                                    <span className={Number(this.state.funding_type) === 1 ? 'required' : ''}>
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                disabled={true}
                                                                required={Number(this.state.funding_type) === 1 ? false : false} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.support_purpose_option}
                                                                onChange={(value) => handleChangeSelectDatepicker(this, value, 'support_purpose')}
                                                                value={this.state.support_purpose || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Purpose"
                                                                inputRenderer={(props) => <input type="text" name={"support_purpose"} {...props} readOnly  /* value={this.state.purpose || ""} */ />}
                                                            />
                                                        </div>
                                                    </span>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6">
                                                    <div className="sLT_gray left left-aRRow">
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-12">
                                                    <label className="label_2_1_1">Support Outcome Domain</label>
                                                    <label htmlFor="support_outcome_domain" className="error CheckieError" style={{ display: "block", width: "100%;" }} ></label>
                                                    <span className="required">
                                                        <div className="Parent-List_2_ul">
                                                            <div className="cstmSCroll1 FScroll">
                                                                <ScrollArea
                                                                    speed={0.8}
                                                                    contentClassName="content"
                                                                    horizontal={false}
                                                                    style={{ paddingRight: '15px', maxHeight: "140px" }}
                                                                >
                                                                    <ul className="List_2_ul">
                                                                        {this.state.outcome_domain_option.map((val, index) => (
                                                                            <li className={"w-" + (((index % 2) == 0) ? "60" : "40")} key={index + 1}>
                                                                                <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                                    <input type="radio" name="support_outcome_domain" onChange={(e) => handleChangeSelectDatepicker(this, e.target.value, 'support_outcome_domain')} checked={(val.id == this.state.support_outcome_domain) ? true : false} value={val.id || ''} required={true}/>
                                                                                    <span className="checkround"></span>
                                                                                    <span className="txtcheck text_2_0_1">{val.name}</span>
                                                                                </label>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </ScrollArea>
                                                            </div>
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Panel.Body>
                            </Panel>

                            <Panel defaultExpanded>
                                <Panel.Heading>
                                    <Panel.Title toggle>
                                        <div>
                                            <p>Line Item Details </p>
                                            <span className="icon icon-arrow-right"></span>
                                            <span className="icon icon-arrow-down"></span>
                                        </div>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body collapsible>
                                    <div className="row">
                                        <div className="col-lg-8 col-lg-offset-2">
                                            <div className="row mt-5">
                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">Reference Number</label>
                                                    <span className='required'>
                                                        <input type="text" placeholder="001" name="line_item_number" onChange={(e) => handleChange(this, e)} value={this.state.line_item_number || ''} data-rule-required="true" maxLength="40"/>
                                                    </span>
                                                </div>
                                                <div className="col-lg-8 col-sm-8">
                                                    <label className="label_2_1_1">Line Item Name</label>
                                                    <span className='required'>
                                                        <input type="text" name="line_item_name" placeholder="Name" onChange={(e) => {
                                                            clearTimeout(this.timer);
                                                            handleChange(this, e);
                                                            this.timer = setTimeout(this.triggerChange, WAIT_INTERVAL);
                                                        }} value={this.state.line_item_name || ''} maxLength="200" data-rule-required="true" />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="row mt-5">
                                                <div className="col-lg-6 col-md-6 col-sm-6">
                                                    <label className="label_2_1_1">Support Type</label>
                                                    <span className=''>
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                disabled={true}
                                                                required={false} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.support_type_option}
                                                                onChange={(value) => handleChangeSelectDatepicker(this, value, 'support_type')}
                                                                value={this.state.support_type || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Support Type"
                                                                inputRenderer={(props) => <input type="text" name={"support_type"} {...props} readOnly  /* value={this.state.support_type || ""} */ />}
                                                            />
                                                        </div>
                                                    </span>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6">
                                                    <div className="sLT_gray left left-aRRow">
                                                    </div>
                                                </div>
                                            </div>
                                            <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                                            <div className="row mt-5">
                                                <div className="col-lg-4 col-sm-6">
                                                    <label className="label_2_1_1">Start Date</label>
                                                        <span className={this.state.is_cat ? 'cust_date_picker' : 'required cust_date_picker'}>
                                                            <div class='set_finance_date_border'>
                                                                <SLDSISODatePicker
                                                                    ref={this.datepickers.start_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                    className="customer_signed_date"
                                                                    placeholder="DD/MM/YYYY"
                                                                    onChange={this.handleChangeDatePicker('start_date')}
                                                                    onOpen={this.handleDatePickerOpened('start_date')}
                                                                    onClear={this.handleChangeDatePicker('start_date')}
                                                                    value={this.state.start_date}
                                                                    input={<Input name="start_date" />}
                                                                    inputProps={{
                                                                        name: "start_date",
                                                                        readOnly: true
                                                                    }}
                                                                    dateDisabled={(data) => {
                                                                        if (!this.props.match.params.id) {
                                                                            return moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                                        } else {
                                                                            return false
                                                                        }
                                                                    }

                                                                    }
                                                                />
                                                            </div>
                                                        </span>
                                                </div>
                                                <div className="col-lg-4 col-sm-6">
                                                    <label className="label_2_1_1">End Date</label>
                                                        <span className={this.state.is_cat ? 'cust_date_picker' : 'required cust_date_picker'}>
                                                            <div class='set_finance_date_border'>
                                                                <SLDSISODatePicker
                                                                    ref={this.datepickers.end_date} // !important: this is needed by this custom SLDSISODatePicker
                                                                    className="customer_signed_date"
                                                                    placeholder="DD/MM/YYYY"
                                                                    onChange={this.handleChangeDatePicker('end_date')}
                                                                    onOpen={this.handleDatePickerOpened('end_date')}
                                                                    onClear={this.handleChangeDatePicker('end_date')}
                                                                    value={this.state.end_date}
                                                                    input={<Input name="end_date" />}
                                                                    inputProps={{
                                                                        name: "end_date",
                                                                        readOnly: true
                                                                    }}
                                                                    dateDisabled={(data) => {
                                                                        if (!this.props.match.params.id) {
                                                                            return moment(data.date).isSame(moment(), 'day') && moment(data.date).isBefore() ? false : moment(data.date).isBefore() ? true : false
                                                                        } else {
                                                                            return false
                                                                        }
                                                                    }

                                                                    }
                                                                />
                                                            </div>
                                                        </span>
                                                </div>
                                            </div>
                                            </IconSettings>
                                            <div className="row mt-5">
                                                <div className="col-lg-8 col-sm-8">
                                                    <label className="label_2_1_1">Line Item Description</label>

                                                    <textarea className="w-100" maxLength="500" placeholder="Maximum 500 Characters" name="description" onChange={(e) => handleChange(this, e)} value={this.state.description || ''} />

                                                </div>
                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">Needs</label>

                                                    <textarea className="w-100" maxLength="500" placeholder="" name="needs" onChange={(e) => handleChange(this, e)} value={this.state.needs || ''} />

                                                </div>
                                            </div>
                                            <div className="row mt-5 d-flex align-items-center">
                                                <div className="col-lg-4 col-sm-6">
                                                    <label className="label_2_1_1">Category Reference Number</label>
                                                    <span className={!this.state.is_cat ? 'required' : ''}>
                                                        <input type="text" placeholder="001" name="category_ref" onChange={(e) => handleChange(this, e)} disabled={this.state.is_cat ? true : false} required={!this.state.is_cat} value={this.state.category_ref || ''} maxLength="40" />
                                                    </span>
                                                </div>
                                                <div className="col-lg-4 col-sm-6">
                                                    <label className="customChecks">
                                                        <input type="checkbox" name="is_cat" onChange={(e) => { this.setState({ is_cat: e.target.checked }); if (e.target.checked) this.setState({ category_ref: '' }); }} checked={this.state.is_cat} />
                                                        <div className="chkLabs fnt_sm" name="is_cat_span">Is Category</div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Panel.Body>
                            </Panel>

                            <Panel defaultExpanded>
                                <Panel.Heading>
                                    <Panel.Title toggle>
                                        <div>
                                            <p>Line Item Pricing</p>
                                            <span className="icon icon-arrow-right"></span>
                                            <span className="icon icon-arrow-down"></span>
                                        </div>
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body collapsible>
                                    <div className="row">
                                        <div className="col-lg-8 col-lg-offset-2">
                                            <div className="row mt-5">
                                                <div className="col-lg-5 col-md-5 col-sm-5">
                                                    <div className="Time_line_lables">
                                                        <div className="label_2_1_1">Quote Required?</div>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="quote_required" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.quote_required == 1) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="quote_required" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.quote_required == 0) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-7">
                                                    <div className="Time_line_lables">
                                                        <div className="label_2_1_1">Does this Item have a Price Control? </div>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="price_control" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.price_control == 1) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="price_control" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.price_control == 0) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-5 col-md-5 col-sm-5">
                                                    <div className="Time_line_lables">
                                                        <div className="label_2_1_1">Travel Required?</div>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="travel_required" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.travel_required == 1) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="travel_required" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.travel_required == 0) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-7">
                                                    <div className="Time_line_lables">
                                                        <div className="label_2_1_1">Cancellation Fees? </div>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="cancellation_fees" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.cancellation_fees == 1) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="cancellation_fees" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.cancellation_fees == 0) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-5 col-md-5 col-sm-5">
                                                    <div className="Time_line_lables">
                                                        <label className="label_2_1_1">NDIA Reporting?</label>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="ndis_reporting" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.ndis_reporting == 1) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="ndis_reporting" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.ndis_reporting == 0) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-7">
                                                    <div className="Time_line_lables">
                                                        <label className="label_2_1_1">Non-F2F? </label>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="non_f2f" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.non_f2f == 1) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="non_f2f" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.non_f2f == 0) ? true : false} />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-4 col-md-6 col-sm-6">
                                                    <label className="label_2_1_1">Member to Participant Ratio</label>
                                                    <br></br>
                                                    <div className="ratio_input mt-2">
                                                        <span className=""><input type="text" name="member_ratio" placeholder='1' onChange={(e) => onlyNumberAllow(this, e)} value={this.state.member_ratio || ''} min="0" max="9" maxLength="1" data-rule-required="false" /></span>
                                                        <span>:</span>
                                                        <span className=""><input type="text" name="participant_ratio" placeholder='1' onChange={(e) => onlyNumberAllow(this, e)} value={this.state.participant_ratio || ''} min="0" max="9" maxLength="1" data-rule-required="false" /></span>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6 col-sm-6">
                                                    <label className="label_2_1_1">Upper Price Limit (National Non Remote)</label>
                                                    <span className={this.state.is_cat ? "mt-2" : "required mt-2"}>
                                                        <input type="text" name="upper_price_limit" placeholder="$00.00" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} onChange={(e) => handleChange(this, e)} value={this.state.upper_price_limit || ''} data-rule-required={this.state.is_cat ? "false" : "true"} min="0.01" max="99999.99" maxLength="8" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-4 col-md-6 col-sm-6">
                                                    <span className="">
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                required={false} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.level_option}
                                                                onChange={(value) => handleChangeSelectDatepicker(this, value, 'levelId')}
                                                                value={this.state.levelId || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Minimum Level Required"
                                                                inputRenderer={(props) => <input type="text" name={"levelId"} {...props} readOnly  /* value={this.state.levelId || ''} */ />}
                                                            />
                                                        </div>
                                                    </span>
                                                </div>
                                                <div className="col-lg-4 col-md-6 col-sm-6">
                                                    <span className="">
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                required={false} simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.state.point_name_option}
                                                                onChange={(value) => handleChangeSelectDatepicker(this, value, 'pay_pointId')}
                                                                value={this.state.pay_pointId || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Minimum Pay Point Required"
                                                                inputRenderer={(props) => <input type="text" name={"pay_pointId"} {...props} readOnly  /* value={this.state.pay_pointId || ''} */ />}
                                                            />

                                                        </div>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-4 col-md-6 col-sm-6">
                                                    <div className="Time_line_lables">
                                                        <label className="label_2_1_1">Does this item have a schedule constraint?</label>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="schedule_constraint" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.schedule_constraint == 1) ? true : false} data-rule-required="true" />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="schedule_constraint" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.schedule_constraint == 0) ? true : false} data-rule-required="true" />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6 col-sm-6">
                                                    <span className={this.state.is_cat ? "" : "required" }>
                                                        <div className="sLT_gray left left-aRRow">
                                                            <Select
                                                                required={this.state.is_cat ? false : true}
                                                                simpleValue={true}
                                                                className="custom_select default_validation"
                                                                options={this.UnitOptions}
                                                                onChange={(val) => this.setState({ units: val })}
                                                                value={Number(this.state.units) || ''}
                                                                clearable={false}
                                                                searchable={false}
                                                                placeholder="Units"
                                                                inputRenderer={(props) => <input type="text" name={"units"} {...props} readOnly />}
                                                            />
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-6 col-md-6 col-sm-6">
                                                    <label className="label_2_1_1">Select Days Applied to</label>
                                                    <div className="Parent-List_2_ul">
                                                        <div className="cstmSCroll1 FScroll">
                                                            <ScrollArea
                                                                speed={0.8}
                                                                contentClassName="content"
                                                                horizontal={false}
                                                                style={{ paddingRight: '15px', maxHeight: "140px" }}
                                                            >
                                                                <ul className="List_2_ul">
                                                                    {weekDays.map((val, index) => (
                                                                        <li className="w-50" key={index + 1}>
                                                                            <label className="radio_F1 check_F1 mb-0" style={{ width: 'auto' }}>
                                                                                <input type="checkbox" name={this.state[val.state]} checked={(this.state[val.state] == 1) ? true : false} onChange={(e) => {
                                                                                    this.onCheckHandle(val.state);
                                                                                }}/>
                                                                                <span className="checkround"></span>
                                                                                <span className="txtcheck text_2_0_1">{val.name}</span>
                                                                            </label>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </ScrollArea>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <label className="label_2_1_1">Select Time of Day Applied to</label>
                                                    <div className="Parent-List_2_ul">
                                                        <div className="cstmSCroll1 FScroll">
                                                            <ScrollArea
                                                                speed={0.8}
                                                                contentClassName="content"
                                                                horizontal={false}

                                                                style={{ paddingRight: '15px', maxHeight: "140px" }}
                                                            >
                                                                <ul className="List_2_ul">
                                                                    {dayTime.map((val, index) => (
                                                                        <li className="w-50" key={index + 1}>
                                                                            <label className="radio_F1 check_F1 mb-0" style={{ width: 'auto' }}>
                                                                                <input type="checkbox" name={this.state[val.state]} checked={(this.state[val.state] == 1) ? true : false} onChange={(e) => {
                                                                                    this.onCheckHandle(val.state);
                                                                                }}/>
                                                                                <span className="checkround"></span>
                                                                                <span className="txtcheck text_2_0_1">{val.name}</span>
                                                                            </label>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </ScrollArea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-lg-12">
                                                    <div className="Time_line_lables">
                                                        <label className="label_2_1_1">ONCALL provided</label>
                                                        <div className="label_2_1_2">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="oncall_provided" value="1" onChange={(e) => handleChange(this, e)} checked={(this.state.oncall_provided == 1) ? true : false} data-rule-required="true" />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">Yes</span>
                                                            </label>
                                                        </div>
                                                        <div className="label_2_1_3">
                                                            <label className="radio_F1 mb-0" style={{ width: 'auto' }}>
                                                                <input type="radio" name="oncall_provided" value="0" onChange={(e) => handleChange(this, e)} checked={(this.state.oncall_provided == 0) ? true : false} data-rule-required="true" />
                                                                <span className="checkround"></span>
                                                                <span className="txtcheck">No</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </Panel.Body>
                            </Panel>
                            <div>
                                <div className="row d-flex justify-content-end none-after none-before">
                                    {this.props.match.params.id ? <div className="col-lg-3"><Link to="/admin/finance/line_item_listing" className="btn-1 w-100" >Cancel</Link></div> : ""}
                                    <div className="col-lg-3"><button className="btn-1 w-100" name="save_line_item" disabled={this.state.loading} onClick={this.onSubmit}>{this.props.match.params.id ? 'Update Line Item' : 'Save Line Item'}</button></div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </React.Fragment >
        );
    }

}


const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateNewLineItem);

const FundingAreaRender = (props) => {
    //console.log(props.value)
    return (
        <React.Fragement >df{props.value}</React.Fragement>
    )
}    