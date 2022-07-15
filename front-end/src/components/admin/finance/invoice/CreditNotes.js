import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select-plus';
import DatePicker from 'react-datepicker';
import Pagination from "service/Pagination.js";
import {Link} from 'react-router-dom';
import { connect } from 'react-redux';
import SelectUser from './SelectUser.js';
import {requestInvoiceData as requestData} from '../action/FinanceAction.js';
import _ from 'lodash';
import {colorCodeCreditNoteStatus,iconFinanceShift,defaultSpaceInTable,graphViewType} from 'service/custom_value_data.js';
import {CreditNoteListFilterStatusDropdown} from 'dropdown/FinanceDropdown.js';
import {PAGINATION_SHOW,CURRENCY_SYMBOL,ROUTER_PATH} from 'config.js';
import {currencyFormatUpdate} from 'service/common.js'; 
import CreditNotesViewModal from './CreditNotesViewModal.js'; 




class CreditNotes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeCol: '',
            openUserModal:false,
            credieNoteList:[],
            filter_by: 'all',
            openCreditNotesViewShow:false,
            creditNoteId:0
        }
        this.reactTable = React.createRef();
    }

    closeUserModal = (status) => {
        this.setState({ openUserModal: false },()=>{
            if(status){

            }
        });
    }

    closeCreditNoteViewModal = () => {
        this.setState({ openCreditNotesViewShow: false,creditNoteId:0 },()=>{
        });
    }
    

    fetchCredieNoteList = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            3
        ).then(res => {
            
            this.setState({
                credieNoteList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    submitSearch = (e, key, value,checkTextBoxValue) => {
        if(e)
        e.preventDefault();

        

        
        var state = {};
        state[key] = value;
        
        this.setState(state, () => {
            if(checkTextBoxValue!=undefined && checkTextBoxValue){
                if((this.state.search && this.state.search.length>0) || (value== this.state.filter_by && this.state.filter_by=='all' && key=='filter_by') ){
                    this.filterListing();
                }
            }else{
                this.filterListing();
            }
        })
    }

    filterListing =()=>{
        let req = {search: this.state.search, filter_by: this.state.filter_by, start_date:this.state.start_date, end_date: this.state.end_date};
            this.setState({filtered: req})
    }



    render() {
    
        const columns = [
            {
                id: "credit_note_number",
                accessor: "credit_note_number",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Credit Note Number</div>
                    </div>
                ,
                className:'_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
           
            {
                id: "credit_note_for",
                accessor: "credit_note_for",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Credit Note For</div>
                    </div>
                ,
                className:'Tb_class_d1 Tb_class_d2 ',
                Cell: props =>  <span className={(props.original.booked_from !='' && iconFinanceShift.hasOwnProperty(_.toLower(props.original.booked_from)) ? iconFinanceShift[_.toLower(props.original.booked_from)] :'') +' '+ ((props.original.booked_gender !='' ? props.original.booked_gender :''))}>
                <i className="icon"></i>
                    <div>{defaultSpaceInTable(props.value)}</div>
                </span>
            },
           
            {
                id: "total_amount",
                accessor: "total_amount",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Amount</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{defaultSpaceInTable(currencyFormatUpdate(props.value,CURRENCY_SYMBOL))}</span>
            },
            {
                // Header: "Timeframe",
                id: "created_date",
                accessor: "created_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Created</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            /* {
                // Header: "Status",
                id: "tobeused",
                accessor: "tobeused",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">To Be Used</div>
                    </div>,
                className:'_align_c__',
                Cell: props => <span>{props.value}</span>
            }, */
            {
                id: "credit_note_status",
                accessor: "credit_note_status",
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
                       
                        <span className={'short_buttons_01 '+(colorCodeCreditNoteStatus[_.toLower(props.original.credit_note_status)]? colorCodeCreditNoteStatus[_.toLower(props.original.credit_note_status)]:'')}>{_.capitalize(props.original.credit_note_status)}</span>
                        
                        </div>
                        <span title="Credit note Detail" className="inherit-color" onClick={()=>this.setState({openCreditNotesViewShow:true,creditNoteId:props.original.id})}><i className="icon icon-view2-ie fs-15 "></i></span>

                        {/* {props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>} */}
                    </div>,
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
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">


                    <div className=" py-4">
                    <span className="back_arrow">
                            <a href={ROUTER_PATH+"admin/finance/InvoicesDashboard"}><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-9">
                                    <div className="h-h1 color">{this.props.showPageTitle}</div>
                                </div>
                                <div className="col-lg-3 d-flex align-self-center">
                                    {!this.state.openUserModal ?
                                        <a  onClick={() => this.setState({ openUserModal: true })} className="C_NeW_BtN w-100">
                                            <span>Create New Credit Note</span><i className="icon icon icon-add-icons"></i>
                                        </a> :
                                        <div className="modify_select align-self-center w-100">
                                           {this.state.openUserModal ? <SelectUser showModal={this.state.openUserModal} closeModal={this.closeOrganisationModal} /> :<React.Fragment />}
                                          </div>}
                                </div>
                                {/* <div className="col-lg-3 d-flex align-self-center">
                                    <Link to='./CreateCreditNote' className="C_NeW_BtN w-100"><span>Create New Credit Notes</span><i className="icon icon icon-add-icons"></i></Link>
                                </div> */}
                            </div>
                        </div>

                        <div className="bb-1 mb-4">
                        <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-6 col-md-6 col-sm-8 ">
                        <form method="post" onSubmit={this.submitSearch}>
                            <div className="search_bar right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({search: e.target.value})} value={this.state.search} />
                                <i className="icon icon-search2-ie" onClick={this.filterListing}></i>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-2 col-md-2 col-sm-2 ">
                    <div className="sLT_gray left left-aRRow">
                    <Select
                                 simpleValue={true}
                                 name="form-field-name"
                                 value={this.state.filter_by}
                                 options={CreditNoteListFilterStatusDropdown(true)}
                                 onChange={(value) => this.submitSearch('', 'filter_by', value,true)}
                                 clearable={false}
                                 searchable={false}
                            />
                            </div>
                        </div>
                    <div className="col-lg-4 col-md-4 col-sm-4 ">
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="Fil_ter_ToDo">
                                    <label>From</label>
                                    <span  className={'cust_date_picker'}>
                                    <DatePicker
                                        selected={this.state.start_date}
                                        isClearable={true}
                                        onChange={(value) => this.submitSearch('', 'start_date', value)}
                                        placeholderText="00/00/0000"
                                        dateFormat="dd-MM-yyyy"
                                        autoComplete={'off'}
                                    />
                                    </span>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="Fil_ter_ToDo">
                                    <label>To</label>
                                    <span  className={'cust_date_picker right_0_date_piker'}>
                                        <DatePicker
                                            selected={this.state.end_date}
                                            onChange={(value) => this.submitSearch('', 'end_date', value)}
                                            placeholderText="00/00/0000"
                                            isClearable={true}
                                            dateFormat="dd-MM-yyyy"
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

                    <div className="col-lg-12 Credit-Note_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                        <ReactTable
                            filtered={this.state.filtered}
                            manual
                            onFetchData={this.fetchCredieNoteList}
                            data={this.state.credieNoteList}
                            columns={columns}
                            PaginationComponent={Pagination}
                            noDataText="No Record Found"
                            minRows={2}
                            defaultPageSize={10}
                            pages={this.state.pages}
                            loading={this.state.loading}
                            previousText={<span className="icon icon-arrow-left privious"></span>}
                            nextText={<span className="icon icon-arrow-right next"></span>}
                            showPagination={this.state.credieNoteList.length > PAGINATION_SHOW ? true : false}
                            className="-striped -highlight"
                            noDataText="No record found"
                            collapseOnDataChange={false}
                            ref={ this.reactTable}
                        />
                        </div>
                    </div>

                </div>

            {this.state.openCreditNotesViewShow ? <CreditNotesViewModal show={this.state.openCreditNotesViewShow} close={this.closeCreditNoteViewModal} creditNoteId={this.state.creditNoteId} /> :<React.Fragment/>}
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


export default connect(mapStateToProps, mapDispatchtoProps)(CreditNotes);