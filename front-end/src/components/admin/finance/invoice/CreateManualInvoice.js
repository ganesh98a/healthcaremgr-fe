import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import jQuery from "jquery";
import { Panel } from 'react-bootstrap';
import Pagination from "../../../../service/Pagination.js";
import ProfilePage from './../common/ProfilePage';
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom';
import { postData, toastMessageShow, handleChangeSelectDatepicker, handleRemoveShareholder, handleAddShareholder, handleChangeChkboxInput, handleShareholderNameChange, onlyNumberAllow, handleDateChangeRaw, selectFilterOptions, onKeyPressPrevent, calculateGst } from 'service/common.js';
import moment from 'moment-timezone';
import { getOrganisationDetails, getParticipantDetails, getSiteDetails,getHouseDetails } from "./../action/FinanceAction.js";
import { REGULAR_EXPRESSION_FOR_NUMBERS } from '../../../../config.js';
import BlockUi from 'react-block-ui';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        if (filtered.length != 0) {
            var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
            postData('finance/FinanceInvoice/srch_shift_bydate', Request).then((result) => {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    all_count: result.all_count,
                };
                resolve(res);
            });
        }
    });
};

const getOptionLineItem = (e, measure_by, previous_selected_item,user_type,user_id,lineItemInvoiceState,funding_type) => {
    if (!e) {
        return Promise.resolve({ options: [] });
    }

    return postData('finance/FinanceInvoice/get_line_item_by_funding_type', { search: e, measure_by: measure_by, previous_selected_item: previous_selected_item,user_type:user_type,user_id:user_id,lineItemInvoiceState:lineItemInvoiceState,funding_type:funding_type }).then((res) => {
        if (res.status) {
            return { options: res.data };
        }
    });    
}

class CreateManualInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            activeCol: '',
            lineItemInvoice: [{ 'measure_by': '', 'lineItem': '', 'quantity': '', 'cost': '','error':'' }],
            manualInvoiceItem: [{ 'item_name': '', 'item_description': '', 'item_cost': '' }],
            srchShiftList: [],
            fundingTypeDb: [],
            measureByDb: [],
            cost_error:false,
            funding_type:''
        }
    }

    handleSaveInvoice = (e) => {
        e.preventDefault();
        var validator = jQuery("#manual_invoice").validate({ ignore: [] });
        if(this.state.cost_error)
        {
            toastMessageShow('Line item has not sufficient fund.','w');
        }
        else{
            if (!this.state.loading && jQuery("#manual_invoice").valid()) {
                /*if(this.state.srchShiftList.length <= 0)
                {
                    toastMessageShow('Need atleat 1 shift to create invoice.','w');
                }*/

                this.setState({ loading: true }, () => {
                    postData('finance/FinanceInvoice/save_invoice', this.state).then((result) => {
                        if (result.status) {
                            this.setState({ loading: false });
                            toastMessageShow(result.msg, 's');
                            this.setState({ is_save: true }, () => {  });
                        } else {
                            toastMessageShow(result.msg, 'e');
                            this.setState({ loading: false });
                        }
                    });
                });
            }
            else {
                validator.focusInvalid();
            }
        }
    }

    componentDidMount() {
        this.getFundingType();
    }

    getFundingType = () => {
        postData('finance/FinanceInvoice/get_funding_type', this.props.match.params).then((result) => {
            if (result.status) {
                this.setState({ fundingTypeDb: result.data.response_funding_type,measureByDb:result.data.response_measure_type });
            }
        });
    }

    getShiftInvoiceByDate = (state, instance) => {
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
        ).then(res => {
            this.setState({
                srchShiftList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    searchInvoiceByDate = (e) => {
        this.setState({ invoice_shift_end_date: e }, () => {
            var requestData = { invoice_shift_start_date: this.state.invoice_shift_start_date, invoice_shift_end_date: this.state.invoice_shift_end_date, UserType: this.state.mode, UserId: this.props.match.params.UserId };
            this.setState({ filtered: requestData });
        })
    }

    componentWillMount() {
        this.setAndGetProfileData();
    }

    setAndGetProfileData = () => {
        //console.log('this.props',this.props)
        if (this.props.match.params.UserType == 2 || this.props.match.params.UserType == 3){
            this.setState({ mode: 'participant',UserTypeInt: this.props.match.params.UserType,UserId: this.props.match.params.UserId}, () => { this.props.getParticipantDetails(this.props.match.params.UserId); })
        }
        else if(this.props.match.params.UserType == 4 || this.props.match.params.UserType == 5){
            this.setState({ mode: 'finance',UserTypeInt:this.props.match.params.UserType,UserId: this.props.match.params.UserId }, () => { this.props.getOrganisationDetails(this.props.match.params.UserId); })
        }
        else if(this.props.match.params.UserType == 1 ){
            this.setState({ mode: 'site',UserTypeInt:this.props.match.params.UserType,UserId: this.props.match.params.UserId }, () => { this.props.getSiteDetails(this.props.match.params.UserId); })
        }else if(this.props.match.params.UserType == 7 ){
            this.setState({ mode: 'house',UserTypeInt:this.props.match.params.UserType,UserId: this.props.match.params.UserId }, () => { this.props.getHouseDetails(this.props.match.params.UserId); })
        }
    }

    calculateItemCost = (data) => { 
        //console.log(data)
        var cost = 0;
        if (data.measure_by && data.quantity && data.lineItem) {
            /* if (data.price_type == 1) {
                 var cost = (parseInt(data.quantity)) * parseFloat(data.line_ItemId.upper_price_limit)
             } else if (data.price_type == 2) {
                 var cost = (parseInt(data.quantity)) * parseFloat(data.line_ItemId.national_price_limit)
             } else {
                 var cost = (parseInt(data.quantity)) * parseFloat(5)
             }*/
            var cost = (parseInt(data.quantity)) * parseFloat(data.lineItem.national_price_limit);
        }
        return cost;
    }

    handleLineItemChange(index, fieldName, value, e,optional) {
        if (e) {
            e.preventDefault();
        }
        var state = {};
        var List = this.state['lineItemInvoice'];
        List[index][fieldName] = value;

        if(fieldName == 'quantity'){
            let cost = this.calculateItemCost(optional);
            List[index]['cost'] = cost;
            var gstOnCost = calculateGst(cost);
            var finalCostIncludeGst = parseInt(cost) + parseInt(gstOnCost);
            if(finalCostIncludeGst > optional.lineItem.fund_remaining){
                List[index]['error'] = 'Current line item has not that much of fund available that you requested.';
                this.setState({cost_error:true})
            }else{
                List[index]['error'] = '';
                this.setState({cost_error:false})
            }
        }

        if(fieldName == 'measure_by')
        {
            List[index]['quantity'] = '';
            List[index]['cost'] = '';
            List[index]['lineItem'] = '';
            List[index]['error'] = '';
        }
        state['lineItemInvoice'] = Object.assign([], List);
        this.setState(state, () => { 
            this.setState({cost_error:false})
        });
    }

    render() {
        const columns = [
            {
                id: "invshift",
                accessor: "id",
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },

            {
                id: "invoiceschedule",
                accessor: "invoiceschedule",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                className: 'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span>
                    <div>{props.value}</div>
                </span>

            },
            {
                id: "cost",
                accessor: "cost",
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                id: "outstanding",
                accessor: "outstanding",
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                Cell: props => <span className="short_buttons_01 btn_color_archive">{props.value}</span>
            },
        ]

        const modeTypePropsRequest = {"participant":"participantDetails","site":"siteDetails","finance":"organisationDetails","house":"houseDetails"};
        return (
            <React.Fragment>
                 {(this.state.is_save) ? <Redirect to='/admin/finance/InvoicesDashboard/' /> : ''}
                <BlockUi tag="div" blocking={this.state.loading}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className=" py-4">
                                <span className="back_arrow">
                                    <Link to="/admin/finance/InvoicesDashboard"><span className="icon icon-back1-ie"></span></Link>
                                </span>
                            </div>

                            <div className="by-1">
                                <div className="row d-flex  py-4">
                                    <div className="col-lg-8">
                                        <div className="h-h1 color">{this.props.showPageTitle} {(this.props[modeTypePropsRequest[this.state.mode]]['name'] || '')}</div>
                                    </div>
                                    <div className="col-lg-4 d-flex align-self-center">
                                        {/* <a className="but">Retrive Payroll  Tax Information Via MYOB</a> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ProfilePage details={(modeTypePropsRequest.hasOwnProperty(this.state.mode)) ? this.props[modeTypePropsRequest[this.state.mode]] : []} mode={this.state.mode} />
                    <form id="manual_invoice" method="post" onKeyPress={onKeyPressPrevent} autoComplete="off">
                        <div className="row d-flex justify-content-center mt-5">
                            <div className="col-lg-12 ">
                                <div className="Bg_F_moule">
                                    <div className="row d-flex justify-content-center">
                                        <div className="col-lg-8">
                                            <div className="row mt-5 d-flex">
                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">Invoice Date</label>
                                                    <input type="text" className="text-center" value={moment().format('DD/MM/YYYY')} readOnly />
                                                </div>
                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">Pay By</label>
                                                    <DatePicker className="text-center"
                                                    autoComplete={'off'}
                                                        selected={this.state.pay_by ? moment(this.state.pay_by) : null}
                                                        name="pay_by"
                                                        required={true}
                                                        dateFormat="dd-MM-yyyy"
                                                        onChange={(e) => handleChangeSelectDatepicker(this, e, 'pay_by')}
                                                        onChangeRaw={handleDateChangeRaw} minDate={moment()} />
                                                </div>

                                                <div className="col-lg-4 col-sm-4">
                                                    <label className="label_2_1_1">Funding Type</label>
                                                        <Select
                                                            name={'funding_type'}
                                                            simpleValue={true}
                                                            className="custom_select default_validation"
                                                            options={this.state.fundingTypeDb}
                                                            onChange={(e) => this.setState({funding_type:e},()=>{
                                                                this.setState({lineItemInvoice: [{'measure_by':'','lineItem': '', 'quantity': '', 'cost': '','error':'' }]})
                                                            })}
                                                            value={this.state.funding_type}
                                                            clearable={false}
                                                            searchable={false}
                                                            placeholder={'Select'}
                                                            inputRenderer={(props) => <input type="text" {...props} readOnly name={'funding_type'} />}
                                                        />
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="Finance__panel_1 mt-5">
                                    <div className="F_module_Panel E_ven_and_O_dd-color E_ven_color_ O_dd_color_ Border_0_F" >
                                        {/*<Panel eventKey="1">
                                            <Panel.Heading>
                                                <Panel.Title toggle>
                                                    <div>
                                                        <p>Invoice Shifts </p>
                                                        <span className="icon icon-arrow-right"></span>
                                                        <span className="icon icon-arrow-down"></span>
                                                    </div>
                                                </Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body collapsible>
                                                <React.Fragment>
                                                    <div className="row d-flex justify-content-center">
                                                        <div className="col-lg-8 col-sm-12">
                                                            <div className="row mt-5  d-flex flex-wrap">
                                                                <div className="col-lg-4 col-sm-4">
                                                                    <div className="">
                                                                        <label className="label_2_1_1">Start Date</label>
                                                                        <span>
                                                                            <DatePicker
                                                                            autoComplete={'off'}
                                                                                selected={this.state.invoice_shift_start_date}
                                                                                required={true}
                                                                                name="invoice_shift_start_date"
                                                                                dateFormat="DD/MM/YYYY"
                                                                                onChange={(e) => handleChangeSelectDatepicker(this, e, 'invoice_shift_start_date')}
                                                                                onChangeRaw={handleDateChangeRaw}
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-4 col-sm-4">
                                                                    <div className="">
                                                                        <label className="label_2_1_1">End Date</label>
                                                                        <span>
                                                                            <DatePicker
                                                                            autoComplete={'off'}
                                                                                selected={this.state.invoice_shift_end_date}
                                                                                required={true}
                                                                                name="invoice_shift_end_date"
                                                                                dateFormat="DD/MM/YYYY"
                                                                                onChange={(e) => this.searchInvoiceByDate(e)}
                                                                                onChangeRaw={handleDateChangeRaw}
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="listing_table PL_site odd_even_tBL  odd_even_marge-1_tBL line_space_tBL H-Set_tBL col-lg-12 col-sm-12">
                                                                    <ReactTable
                                                                        TheadComponent={_ => null}
                                                                        data={this.state.srchShiftList}
                                                                        columns={columns}
                                                                        PaginationComponent={Pagination}
                                                                        noDataText="No Record Found"
                                                                        minRows={1}
                                                                        className="-striped -highlight"
                                                                        onFetchData={this.getShiftInvoiceByDate}
                                                                        defaultPageSize={10}
                                                                        pages={this.state.pages}
                                                                        showPagination={((this.state.srchShiftList).length) > 0 ? true : false}
                                                                        loading={((this.state.srchShiftList).length) > 0 ? this.state.loading : ''}
                                                                        filtered={this.state.filtered}
                                                                        previousText={<span className="icon icon-arrow-left privious"></span>}
                                                                        nextText={<span className="icon icon-arrow-right next"></span>}
                                                                    />
                                                                </div>
                                                                <div className="col-lg-12 mt-5">
                                                                    <label className="label_2_1_1">Add Notes To Invoice</label>
                                                                    <textarea className="w-100" name="invoice_shift_notes" onChange={(e) => handleChangeChkboxInput(this, e)}></textarea>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            </Panel.Body>
                                        </Panel>*/}

                                        <Panel eventKey="1">
                                            <Panel.Heading>
                                                <Panel.Title toggle>
                                                    <div>
                                                        <p>Line Item Invoice</p>
                                                        <span className="icon icon-arrow-right"></span>
                                                        <span className="icon icon-arrow-down"></span>
                                                    </div>
                                                </Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body collapsible>
                                                <React.Fragment>
                                                    <div className="row d-flex justify-content-center">
                                                        <div className="col-lg-8 col-sm-12">
                                                            {this.state.lineItemInvoice.map((value, idx) => (
                                                                <React.Fragment>
                                                                <div className="row mt-5  d-flex flex-wrap" key={idx}>
                                                                    <div className="col-lg-3 col-sm-3 align-self-end">
                                                                        <div className="sLT_gray left left-aRRow">
                                                                            <label className="label_2_1_1">Type</label>
                                                                            <span>
                                                                                <Select
                                                                                    name={'measure_by' + idx}
                                                                                    simpleValue={true}
                                                                                    className="custom_select default_validation"
                                                                                    options={this.state.measureByDb}
                                                                                    onChange={(e) => this.handleLineItemChange( idx, 'measure_by', e,'')}
                                                                                    value={value.measure_by}
                                                                                    clearable={false}
                                                                                    searchable={false}
                                                                                    placeholder={'Select'}
                                                                                    inputRenderer={(props) => <input type="text" {...props} readOnly name={'measure_by'} />}
                                                                                />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-lg-4 col-sm-4 align-self-end">
                                                                        <div className="sLT_gray left left-aRRow">
                                                                            <label className="label_2_1_1">Line Item</label>
                                                                            <span className="modify_select">
                                                                                <Select.Async
                                                                                    cache={false}
                                                                                    ignoreCase={true}
                                                                                    required={(value.measure_by)?true:false}
                                                                                    className="custom_select default_validation"
                                                                                    name={'lineItem' + idx}
                                                                                    filterOptions={selectFilterOptions}
                                                                                    loadOptions={(e) => getOptionLineItem(e, value.measure_by, this.props.items,this.state.UserTypeInt,this.state.UserId,this.state.lineItemInvoice,this.state.funding_type)}
                                                                                    disabled={(value.measure_by && this.state.funding_type!='') ? false : true}
                                                                                    onChange={(e) => this.handleLineItemChange( idx, 'lineItem', e,'')}
                                                                                    value={value.lineItem}
                                                                                    clearable={false}
                                                                                    searchable={true}
                                                                                    placeholder={' '}
                                                                                    inputRenderer={(props) => <input type="text" {...props} name={'lineItem_'} disabled={value.measure_by && this.state.funding_type ? false : true}/>}
                                                                                />
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-lg-2 col-sm-2">
                                                                        <label className="label_2_1_1">Quantity</label>
                                                                        <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} required={(value.funding_type)?true:false} name={'quantity' + idx} value={value.quantity} onChange={(e) => this.handleLineItemChange(idx, 'quantity', e.target.value, e,value)} />
                                                                    </div>
                                                                    <div className="col-lg-2 col-sm-2 align-self-center">
                                                                        <div className="label_2_1_1">&nbsp;</div>
                                                                        <label className="label_2_1_1">Cost: ${(value.cost=='')?0:value.cost}</label>
                                                                    </div>

                                                                    <div className="col-lg-1 col-sm-1 align-self-center">
                                                                        <label className="label_2_1_1">&nbsp;</label>
                                                                        <div>
                                                                            {idx > 0 ? <span onClick={(e) => handleRemoveShareholder(this, e, idx, 'lineItemInvoice')} className="icon icon-remove2-ie aDDitional_bTN_F1">
                                                                            </span> : (this.state.lineItemInvoice.length == 3) ? '' : <span className="icon icon-add2-ie aDDitional_bTN_F0" onClick={(e) => handleAddShareholder(this, e, 'lineItemInvoice', value)}>
                                                                            </span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="row d-flex justify-content-center"> <div className="col-md-12 mt-2">{(value.error)?<div className="cUS_error_class error_cLass"><i className="icon icon-alert mr-2"></i><small >{value.error}</small></div>:''}</div></div>
                                                                  </React.Fragment>
                                                            ))}

                                                            <div className="row d-flex justify-content-center">
                                                                <div className="col-lg-12 mt-5">
                                                                    <label className="label_2_1_1">Add Notes To Invoice</label>
                                                                    <textarea className="w-100" name="line_item_notes" onChange={(e) => handleChangeChkboxInput(this, e)}></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            </Panel.Body>
                                        </Panel>

                                        <Panel eventKey="1">
                                            <Panel.Heading>
                                                <Panel.Title toggle>
                                                    <div>
                                                        <p>Manual Invoice</p>
                                                        <span className="icon icon-arrow-right"></span>
                                                        <span className="icon icon-arrow-down"></span>
                                                    </div>
                                                </Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body collapsible>
                                                <React.Fragment>
                                                    <div className="row d-flex justify-content-center">
                                                        <div className="col-lg-8 col-sm-12">

                                                            {this.state.manualInvoiceItem.map((manValue, index) => (
                                                                <div className="row mt-5  d-flex flex-wrap" key={index}>

                                                                    <div className="col-lg-4 col-sm-4">
                                                                        <label className="label_2_1_1">Item Name</label>
                                                                        <input type="text" name={"item_name" + index} value={manValue.item_name} onChange={(e) => handleShareholderNameChange(this, 'manualInvoiceItem', index, 'item_name', e.target.value, e)} />
                                                                    </div>

                                                                    <div className="col-lg-4 col-sm-4">
                                                                        <label className="label_2_1_1">Item Description</label>
                                                                        <input type="text" name={"item_description" + index} value={manValue.item_description} onChange={(e) => handleShareholderNameChange(this, 'manualInvoiceItem', index, 'item_description', e.target.value, e)} required={(manValue.item_name) ? true : false} />
                                                                    </div>


                                                                    <div className="col-lg-3 col-sm-2">
                                                                        <label className="label_2_1_1">Cost</label>
                                                                        <input type="text" pattern={REGULAR_EXPRESSION_FOR_NUMBERS} name={"item_cost" + index} value={manValue.item_cost} onChange={(e) => handleShareholderNameChange(this, 'manualInvoiceItem', index, 'item_cost', e.target.value, e)} required={(manValue.item_name) ? true : false} />
                                                                    </div>

                                                                    <div className="col-lg-1 col-sm-1 align-self-center">
                                                                        <label className="label_2_1_1">&nbsp;</label>
                                                                        <div>
                                                                            {index > 0 ? <span onClick={(e) => handleRemoveShareholder(this, e, index, 'manualInvoiceItem')} className="icon icon-remove2-ie aDDitional_bTN_F1">
                                                                            </span> : (this.state.manualInvoiceItem.length == 3) ? '' : <span className="icon icon-add2-ie aDDitional_bTN_F0" onClick={(e) => handleAddShareholder(this, e, 'manualInvoiceItem', manValue)}>
                                                                            </span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="row d-flex justify-content-center">
                                                                <div className="col-lg-12 mt-5">
                                                                    <label className="label_2_1_1">Add Notes To Invoice</label>
                                                                    <textarea className="w-100" name="manual_invoice_notes" onChange={(e) => handleChangeChkboxInput(this, e)}></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            </Panel.Body>
                                        </Panel>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-3 pull-right">
                                        <a onClick={(e) => this.handleSaveInvoice(e)} className="btn-1 w-100">Generate Invoice</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </BlockUi>
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
    houseDetails: state.FinanceReducer.houseDetails,
})
const mapDispatchtoProps = (dispach) => {
    return {
        getOrganisationDetails: (orgId) => dispach(getOrganisationDetails(orgId)),
        getParticipantDetails: (PartId) => dispach(getParticipantDetails(PartId)),
        getSiteDetails: (siteId) => dispach(getSiteDetails(siteId)),
        getHouseDetails: (houseId) => dispach(getHouseDetails(houseId)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(CreateManualInvoice);
