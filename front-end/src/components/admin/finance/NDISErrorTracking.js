import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "../../../service/Pagination.js";
import { connect } from 'react-redux'


class NDISErrorTracking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeCol: '',
        }
    }


    render() {
        const dataTable = [
            { task: 'Task 1', duedate: '10/10/2025', assign: 'Tanner Linsley', },
            { task: 'Task 1', duedate: '10/10/2025', assign: 'Tanner Linsley', },
            {
                task: 'Task 1', duedate: '10/10/2025', assign: 'Tanner Linsley',
            },]



            const ndiserror=[
                {invoicenumber:'X_00001',description:'Shift',invoicefor:'Participant 1',addressedto:'Booker 1',amount:'$100',dateofinvoice:'01/03/2019'},
                {invoicenumber:'X_00002',description:'Shift',invoicefor:'Participant 2',addressedto:'Booker 2',amount:'$110',dateofinvoice:'01/03/2019'},
                {invoicenumber:'X_00003',description:'Shift',invoicefor:'Participant 3',addressedto:'Booker 3',amount:'$140',dateofinvoice:'01/03/2019'},
                ]



        const columns = [
            {
                id: "invoicenumber",
                accessor: "invoicenumber",
                headerClassName: 'Th_class_d1 header_cnter_tabl checkbox_header',
                className:'Tb_class_d1 Tb_class_d2',
                Cell: (props) => {
                    return (
                        <span>
                            <label className="Cus_Check_1">
                                <input type="checkbox" /><div className="chk_Labs_1"></div>
                            </label>
                            <div>{props.value}</div>
                        </span>
                    );
                },
                Header: x => {
                    return (
                        <div className="Tb_class_d1 Tb_class_d2">
                            <span >
                                <label className="Cus_Check_1">
                                    <input type="checkbox" /><div className="chk_Labs_1"></div>
                                </label>
                                <div>Invoice Number</div>
                            </span>
                        </div>
                    );

                },
                resizable: false,
                width: 230
            },
            {
                id: "description",
                accessor: "description",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Description</div>
                    </div>
                ,
                className:'_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                id: "invoicefor",
                accessor: "invoicefor",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Invoice For</div>
                    </div>
                ,
                className:'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span>
                    <i className="icon icon-userm1-ie"></i>
                    <i className="icon icon-userf1-ie"></i>
                    <div>{props.value}</div>
                </span>

            },
           
            {
                id: "addressedto",
                accessor: "addressedto",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Addressed To</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                // Header: "Fund Type",
                id: "amount",
                accessor: "amount",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Amount</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{props.value}</span>
            },
            {
                // Header: "Date Of Last Issue",
                id: "dateofinvoice",
                accessor: "dateofinvoice",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Date Of Invoice</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{props.value}</span>
            },
           
            {
                id: "status",
                // accessor: "status",
                headerClassName: '_align_c__ header_cnter_tabl',
                className:'_align_c__',
                width: 160,
                resizable: false,
                headerStyle: { border: "0px solid #fff" },
                expander: true,
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Status</div>
                    </div>,
                Expander: (props) =>
                    <div className="expander_bind">
                          <div className="d-flex w-100 justify-content-center align-item-center">
    <span className="short_buttons_01 btn_color_archive">Error</span>
                       {/* <span className="short_buttons_01 btn_color_assigned" >Assigned</span>
                            <span className="short_buttons_01 btn_color_avaiable">Assigned</span>
                            <span className="short_buttons_01 btn_color_ihcyf">Assigned</span>
                            <span className="short_buttons_01 btn_color_offline">Assigned</span>
                        
                            <span className="short_buttons_01 btn_color_unavailable">Assigned</span>
                        <span className="short_buttons_01">Assigned</span> */}
                        </div>

                        {props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                    </div>,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }

            }

        ]


        var selectOpt = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];

        function logChange(val) {
            //console.log("Selected: " + val);
        }


        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">


                    <div className=" py-4">
                        <span className="back_arrow">
                            <a href="/admin/crm/participantadmin"><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-9">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>
                                <div className="col-lg-3 d-flex align-self-center">
                                    <a className="C_NeW_BtN w-100"><span>Create New CSV</span><i className="icon icon icon-add-icons"></i></a>
                                </div>
                            </div>
                        </div>

                        <div className="bb-1 mb-4">
                        <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-6 col-md-8 col-sm-8 ">
                        <form method="post">
                            <div className="search_bar right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search.." value="" /><i className="icon icon-search2-ie"></i>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-4 ">
                    <div className="sLT_gray left left-aRRow">
                                <Select
                                    name="form-field-name"
                                    value="one"
                                    options={selectOpt}
                                    onChange={logChange}
                                    clearable={false}
                                    searchable={false}
                                />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-4 ">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="Fil_ter_ToDo">
                                    <label>From</label>
                                    <span  className={'cust_date_picker'}>
                                        <DatePicker
                                            selected={this.state.startDate}
                                            onChange={this.handleChange}
                                            placeholderText="00/00/0000"
                                            autoComplete={'off'}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="Fil_ter_ToDo">
                                    <label>To</label>
                                    <span  className={'cust_date_picker right_0_date_piker'}>
                                        <DatePicker
                                            selected={this.state.startDate}
                                            onChange={this.handleChange}
                                            placeholderText="00/00/0000"
                                            autoComplete={'off'}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>


                    </div>
                </div>

                <div className="row">

                    <div className="col-lg-12 NDIS-Error-Tracking_tBL">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                            <ReactTable
                                data={ndiserror}
                                columns={columns}
                                PaginationComponent={Pagination}
                                noDataText="No Record Found"
                                // onPageSizeChange={this.onPageSizeChange}
                                minRows={2}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={true}
                                className="-striped -highlight"
                                noDataText="No duplicate applicant found"
                                SubComponent={(props) =>
                                    <div className="tBL_Sub">
                                        <div className="tBL_des">Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                     when an unknown printer took a galley of type and scrambled it to make a</div>
                                        <a className="short_buttons_01 pull-right">View Task</a>
                                    </div>}
                            />
                        </div>
                        {/* <div className="d-flex justify-content-between mt-3">
                            <a className="btn B_tn" href="#">Mark Selected As Complete</a>
                            <a className="btn B_tn" href="#">View all Taks</a>
                        </div> */}
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


export default connect(mapStateToProps, mapDispatchtoProps)(NDISErrorTracking);