import React, { Component } from 'react';
import ReactTable from 'react-table';
import Pagination from "service/Pagination.js";
import ProfilePage from './../common/ProfilePage';
import { connect } from 'react-redux'
import { ROUTER_PATH,BASE_URL,PAGINATION_SHOW } from "config.js";
import { getOrganisationDetails,getParticipantDetails,getSiteDetails,getHouseDetails } from "./../action/FinanceAction.js";
import {postData,toastMessageShow} from 'service/common.js'
import {colorCodeInvoiceStatus, defaultSpaceInTable} from 'service/custom_value_data.js';
import _ from 'lodash';

const urlRedirect = ROUTER_PATH+'admin/finance/InvoiceScheduler';
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {
        
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceInvoice/get_invoice_scheduler_history_list', Request).then((result) => {
            if (result.status) {
                const res = { rows: result.data, pages: (result.count) };
                resolve(res);
            }
        });
    });
};


class InvoiceSchedulerHistory extends React.Component {
    constructor(props) {

        super(props);
        let inf = props.location.state!=undefined && props.location.state!=null && props.location.state.hasOwnProperty('inf') && props.location.state.inf>0 ? props.location.state.inf : 0;
        let ptype = props.location.state!=undefined && props.location.state!=null && props.location.state.hasOwnProperty('ptype') && props.location.state.ptype!='' ? _.toLower(props.location.state.ptype) : '';
        let booked_by = props.location.state!=undefined && props.location.state!=null && props.location.state.hasOwnProperty('booked_by') && props.location.state.booked_by!='' ? props.location.state.booked_by : 0;
        
        this.state = {
            inf:inf, 
            ptype:ptype, 
            modeType:'',
            filtered:{inf:inf,booked_by:booked_by},
            activeCol: '',
            invoiceSchedulerHistoryList: [],
            loading:false,
        }
        this.reactTable = React.createRef();
       
    }
    fetchData = (state) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                invoiceSchedulerHistoryList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
                editNotes:{}
            });
        })
    }

    componentWillMount() {
        if(this.state.inf>0 && this.state.ptype!=''){
            if(this.state.ptype=='participant'){
                this.setState({modeType:'participant'},()=>{
                    this.props.getParticipantDetails(this.state.inf);

                });
            }else if(this.state.ptype=='site'){
                this.setState({modeType:'site'},()=>{
                    this.props.getSiteDetails(this.state.inf);
                });
            }else if(this.state.ptype=='sub_org' || this.state.ptype=='org'){
                this.setState({modeType:'finance'},()=>{
                    this.props.getOrganisationDetails(this.state.inf);
                });
            }else if(this.state.ptype=='house'){
                this.setState({modeType:'house'},()=>{
                    this.props.getHouseDetails(this.state.inf);
                });
            }
        }else{
          this.setState({pageDisplay:false},()=>{
            toastMessageShow('Required parameter is missing.','e',{'close':()=>{window.location=urlRedirect;}});
          });
        }
      }



    render() {
        const modeTypePropsRequest = {"participant":"participantDetails","site":"siteDetails","finance":"organisationDetails","house":"houseDetails"};
        
        const columns = [

            {
                id: "invoice_number",
                accessor: "invoice_number",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Invoice No</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },

            {
                id: "invoice_amount",
                accessor: "invoice_amount",
                headerClassName: 'Th_class_d1 header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Amount</div>
                    </div>
                ,
                className: 'Tb_class_d1 Tb_class_d2 ',
                Cell: props => <span>
                    {/* <i className="icon icon-userm1-ie"></i>
                    <i className="icon icon-userf1-ie"></i> */}
                    <div>{defaultSpaceInTable(props.value)}</div>
                </span>

            },
            {
                id: "invoice_send_date",
                accessor: "invoice_send_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Sent Date</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                // Header: "Fund Type",
                id: "invoice_amount_paid",
                accessor: "invoice_amount_paid",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Amount Paid</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                // Header: "Date Of Last Issue",
                id: "invoice_finalised_date",
                accessor: "invoice_finalised_date",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Finalised</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                // Header: "Date Of Last Issue",
                id: "invoice_status",
                accessor: "invoice_status",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className={"ellipsis_line__"}>Status</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span className={'short_buttons_01 '+(colorCodeInvoiceStatus[_.toLower(props.value)]? colorCodeInvoiceStatus[_.toLower(props.value)]:'')}>{defaultSpaceInTable(props.value)}</span>
            }

        ]

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">


                    <div className=" py-4">
                        <span className="back_arrow">
                            <a href={urlRedirect}><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>


                        <div className="by-1">
                            <div className="row d-flex  py-4">
                                <div className="col-lg-9">
                                    <div className="h-h1 color">{this.props.showPageTitle + ' for '+ (this.props[modeTypePropsRequest[this.state.modeType]]['name'] || '')}</div>
                                </div>
                        
                            </div>
                        </div>
                    </div>
                </div>
                
                <ProfilePage pageType="invoicescheduler" details={(modeTypePropsRequest.hasOwnProperty(this.state.modeType)) ? this.props[modeTypePropsRequest[this.state.modeType]] : []}  mode={this.state.modeType!=''? this.state.modeType:'participaint'}  />

                <div className="row">
                    <div className="col-lg-9 Invoic-Scheduler-History_Table">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL">
                        <ReactTable
                            PaginationComponent={Pagination}
                            showPagination={this.state.invoiceSchedulerHistoryList.length > PAGINATION_SHOW ? true : false}
                            ref={this.reactTable}
                            columns={columns}
                            manual
                            data={this.state.invoiceSchedulerHistoryList}
                            filtered={this.state.filtered}
                            defaultFilter={this.state.filtered}
                            pages={this.state.pages}
                            previousText={<span className="icon icon-arrow-left privious" ></span>}
                            nextText={<span className="icon icon-arrow-right next"></span>}
                            loading={this.state.loading}
                            onFetchData={this.fetchData}
                            noDataText="No invoice scheduler history found"
                            defaultPageSize={10}
                            className="-striped -highlight"
                            minRows={2}
                            //collapseOnDataChange={false}
                        />
                        </div>
                    </div>
                </div>
            </React.Fragment >
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
        getOrganisationDetails: (orgId,extraParms) => dispach(getOrganisationDetails(orgId,extraParms)),
        getParticipantDetails: (patId) => dispach(getParticipantDetails(patId)),
        getSiteDetails: (siteId) => dispach(getSiteDetails(siteId)),
        getHouseDetails: (houseId) => dispach(getHouseDetails(houseId)),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(InvoiceSchedulerHistory);