import React, { Component } from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import Pagination from "service/Pagination.js";
import ReactTable from 'react-table';
import classNames from "classnames";
import ScrollArea from "react-scrollbar";
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import { REGULAR_EXPRESSION_FOR_AMOUNT } from 'config.js';
import { handleDateChangeRaw } from 'service/common.js';
import SimpleBar from "simplebar-react";

import BlockUi from 'react-block-ui';


const CustomTbodyComponent = props => (
    <div {...props} className={classNames("rt-tbody", props.className || [])}>
        <SimpleBar
            style={{
                maxHeight: "450px",
                overflowX: "hidden",
                paddingLeft: "0px",
                paddingRight: "0px"
            }}
            forceVisible={false}
        >
            {props.children}
        </SimpleBar>
    </div>
);


// const CustomTbodyComponent = props => (
//     <div {...props} className={classNames("rt-tbody", props.className || [])}>
//         <div className=" cstmSCroll1 CrmScroll">
//             <ScrollArea
//                 speed={0.8}
//                 className="stats_update_list"
//                 contentClassName="content"
//                 horizontal={false}
//                 enableInfiniteScroll={true}
//                 style={{ paddingRight: "0px", height: 'auto', maxHeight: '300px' }}
//             >{props.children}</ScrollArea>
//         </div>
//     </div>
// );

export const AllocateFund = (props) => {

    const columns = [
        {
            id: "support_category_number", accessor: "support_category_number",
            Cell: ({ original }) => {
                return (
                    <span >
                        <input type='checkbox' className="checkbox1" checked={props.selected[original.support_id] === true} onChange={() => props.toggleRow(original.support_id)} />
                        <label className="Cus_Check_1">
                            <div className="chk_Labs_1"> <span onClick={() => props.toggleRow(original.support_id)}  ></span></div>
                        </label>
                    </span>);
            },
            Header: x => {
                return (
                    <div >
                        <span >
                            <input type='checkbox' className="checkbox1" checked={props.selectAll === 1} ref={input => {
                                if (input) { input.indeterminate = props.selectAll === 2 }
                            }}
                                onChange={() => props.toggleSelectAll()} />
                            <label className="Cus_Check_1">
                                <div className="chk_Labs_1"> <span onClick={() => props.toggleSelectAll()}></span></div>
                            </label>
                        </span>
                    </div>
                );
            },
            resizable: false,
            width: 50,
        },
        {
            id: "support_category_number",
            accessor: "support_category_number",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Category Number</div>
                </div>
            ,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>,
        },
        {
            id: "support_category_name",
            accessor: "support_category_name",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Category Name</div>
                </div>
            ,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            id: "support_item_number",
            accessor: "support_item_number",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Item Number</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            // Header: "Date Of Last Issue",
            id: "support_item_name",
            accessor: "support_item_name",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Item Name</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },


    ]


    const columnsAllocateAmount = [
        {
            id: "support_category_number",
            accessor: "support_category_number",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Category Number</div>
                </div>
            ,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            id: "support_category_name",
            accessor: "support_category_name",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Category Name</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            // Header: "Fund Type",
            id: "support_item_number",
            accessor: "support_item_number",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Item Number</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            // Header: "Fund Type",
            id: "support_item_name",
            accessor: "support_item_name",
            headerClassName: '_align_c__ header_cnter_tabl',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Support Item Name</div>
                </div>,
            className: '_align_c__',
            Cell: props => <span>{props.value}</span>
        },
        {
            // Header: "Date Of Last Issue",
            id: "amount",
            accessor: "amount",
            headerClassName: '_align_c__ header_cnter_tabl',
            className: '_align_c__ td_Overflow',
            Header: () =>
                <div>
                    <div className="ellipsis_line__">Amount</div>
                </div>,
            Cell: prop => <span className="All_div_amount left_validation">

                <div className="small-search l-search n2"><input type="text"
                    name={prop.index + "amount"}
                    required={true}
                    data-msg-required="Enter the amount"
                    data-placement="left"
                    // value={prop.value}
                    pattern={REGULAR_EXPRESSION_FOR_AMOUNT}
                    onChange={(e) => props.itemdNdisService(prop.index, e)} /><button>$:</button></div>
                <div className="All_div_amount_but">
                    {/* <a className="icon icon-add2-ie" disabled></a> */}
                    <a className="icon icon-remove2-ie" onClick={(e) => props.removeItemdNdisService(e, prop)}></a>
                </div>

            </span>
        },
    ]

    return (
        <Modal className="modal fade Crm" bsSize="large" show={props.showModal} onHide={() => props.handleClose} >
            <BlockUi tag="div" blocking={props.loading}>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="bb-1 text-left px-0 pb-3 Popup_h_er_1">
                                    <h2 className="color">Plan Delegation - Funding:</h2>
                                    <a className="close_i" onClick={() => props.handleClose()}><i className="icon icon-cross-icons"></i></a>
                                </div>
                            </div>
                        </div>
                        <div className="Partt_d1_txt_3 mt-5 mb-4">
                            <strong>Find Support Items</strong>
                        </div>
                        <div className="row">
                            <div className="col-lg-7 mb-5">

                                <div className="row">
                                    <div className="col-lg-5 col-md-5 col-sm-5">
                                        <label className="Partt_d1_txt_2 ">Show all Support Category:</label>
                                    </div>
                                    <div className="col-lg-5 col-md-5 col-sm-5">
                                        <label className="Partt_d1_txt_2 ">Input Support Item Number:</label>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-5 col-md-5 col-sm-5">
                                        <div className="sLT_gray left left-aRRow">
                                            <Select
                                                name="form-field-name"
                                                value={(props.selectedNdisService) ? props.selectedNdisService.category : ''}
                                                options={props.ndisServeicesCategories}
                                                onChange={(e) => props.selectedCategory(e, 'categorySelected')}
                                                clearable={false}
                                                searchable={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-5 col-md-5 col-sm-5">
                                        <div className="sLT_gray left left-aRRow">
                                            <input type="text" value={props.searchedNdisService} onChange={(e) => props.searchNdisService(e, 'ndisService')} />
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-2 col-sm-2 d-inline-flex">
                                        <span className="button_plus__" onClick={() => props.searchNdisServiceByItemNumber()}><i className="icon icon-search Add-2-1"></i></span>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="bt-1"></div>
                            </div>
                        </div>
                        <div className="Partt_d1_txt_3 mt-5 mb-4">
                            <strong>Select Support Items</strong>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 Tab_Overflow__ Allocate-Funding-Amount_tB ">
                                <div className=" listing_table PL_site th_txt_center__ odd_even_tBL odd_even_marge-1_tBL  line_space_tBL H-Set_tBL">


                                    <ReactTable
                                        data={typeof (props.selectedNdisService) != 'undefined' ? props.selectedNdisService.ndis_service : []}
                                        columns={columns}
                                        // PaginationComponent={Pagination}
                                        noDataText="No Record Found"
                                        // onPageSizeChange={this.onPageSizeChange}
                                        previousText={<span className="icon icon-arrow-left privious"></span>}
                                        nextText={<span className="icon icon-arrow-right next"></span>}
                                        showPagination={false}
                                        className="-striped -highlight"
                                        noDataText="No support items found"
                                        pageSize={typeof (props.selectedNdisService) != 'undefined' && props.selectedNdisService.ndis_service != undefined ? props.selectedNdisService.ndis_service.length : 0}
                                        TbodyComponent={CustomTbodyComponent}
                                        minRows={2} />
                                </div>
                            </div>
                        </div>
                        <div className="row d-flex justify-content-end mt-3" >
                            <div className="col-md-2">
                                <a className="btn cmn-btn1 new_task_btn" onClick={(e) => props.itemdNdisService()}>Add Selected</a>
                            </div>
                        </div>


                        <div className="row mt-5">
                            <div className="col-lg-12">
                                <div className="bt-1"></div>
                            </div>
                        </div>
                        <form id="allocateFundForm">
                            <div className="row mt-5 mb-3">
                                <div className="col-lg-8 col-md-8 col-sm-8 ">
                                    <div className="Partt_d1_txt_3 mt-3 mb-4 d-flex justify-content-between">
                                        <strong>Allocate Amounts to Selected Services :</strong>
                                        <strong>Funding Duration:</strong>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 ">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="Fil_ter_ToDo">
                                                <label> From</label>
                                                <span className={'cust_date_picker'}>
                                                    <DatePicker
                                                        // disabled={props.ndisSaveButtonDisable}
                                                        disabled={props.itemdNdisServices.length > 0 ? false : true}
                                                        selected={props.ndisPlanStartDate ? props.ndisPlanStartDate : null}
                                                        yearDropdownItemNumber={110} dateFormat="dd-MM-yyyy"
                                                        // minDate={moment()}
                                                        utcOffset={0}
                                                        onChange={props.handleChangeStartDate}
                                                        placeholderText="00/00/0000"
                                                        autoComplete={'off'}
                                                        required={true}
                                                        name={'ndisPlanStartDate'}
                                                        onChangeRaw={handleDateChangeRaw}
                                                        minDate={new Date()}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="Fil_ter_ToDo">
                                                <label>To</label>
                                                <span className={'cust_date_picker right_0_date_piker'}>
                                                    <DatePicker
                                                        // disabled={props.ndisSaveButtonDisable}
                                                        disabled={props.itemdNdisServices.length > 0 ? false : true}
                                                        selected={props.ndisPlanEndDate ? props.ndisPlanEndDate : null}
                                                        yearDropdownItemNumber={110} dateFormat="dd-MM-yyyy"
                                                        // minDate={moment()}
                                                        utcOffset={0}
                                                        onChange={props.handleChangeEndDate}
                                                        placeholderText="00/00/0000"
                                                        autoComplete={'off'}
                                                        required={true}
                                                        name={'ndisPlanEndDate'}
                                                        onChangeRaw={handleDateChangeRaw}
                                                        minDate={new Date()}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12 Tab_Overflow__  Allocate-Funding-Amount_tBL">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL odd_even_marge-1_tBL  line_space_tBL H-Set_tBL">

                                        {(props.itemdNdisServices) ?
                                            <ReactTable
                                                TbodyComponent={CustomTbodyComponent}
                                                data={props.itemdNdisServices}
                                                columns={columnsAllocateAmount}
                                                PaginationComponent={Pagination}
                                                noDataText="No Record Found"
                                                // onPageSizeChange={this.onPageSizeChange}
                                                minRows={2}
                                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                                nextText={<span className="icon icon-arrow-right next"></span>}
                                                showPagination={false}
                                                className="-striped -highlight"
                                                noDataText="No categories found"
                                                pageSize={props.itemdNdisServices.length}
                                            />
                                            : ''}
                                    </div>

                                </div>

                            </div>

                            <div className="row mt-5">
                                <div className="col-lg-12">
                                    <div className="Total_Fund_details_01">
                                        <div className="Total_Fund_head">Total Funds Allocated</div>
                                        <span className="Total_Fund_boy">{(props.totalNdisAmounts) ? '$ ' + props.totalNdisAmounts : ''}</span>
                                    </div>
                                </div>
                            </div>


                            <div className="row mt-5">
                                <div className="col-lg-12">
                                    <div className="bt-1"></div>
                                </div>
                            </div>

                            <div className="row d-flex justify-content-end mt-3">
                                <div className="col-md-2">
                                    <a
                                        className="btn cmn-btn1 new_task_btn"
                                        onClick={(e) => props.saveNdisService(e, 'Save')}
                                        disabled={props.itemdNdisServices.length > 0 ? false : true}
                                    >Save</a>
                                </div>
                                <div className="col-md-5">
                                    <a
                                        className="btn cmn-btn1 new_task_btn w-100"
                                        onClick={(e) => props.saveNdisService(e, 'Sent')}
                                        disabled={props.itemdNdisServices.length > 0 ? false : true}
                                    >Save and Send Funding Consent agreement
                                </a>
                                </div>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </BlockUi>
        </Modal>
    );
}
