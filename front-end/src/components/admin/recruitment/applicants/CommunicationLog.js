import React from 'react';

import { postData } from 'service/common.js';
import Modal from 'react-bootstrap/lib/Modal'
import moment from "moment";
import 'react-toastify/dist/ReactToastify.css';
import ReactTable from "react-table";
import {CSVLink} from 'react-csv';
import Pagination from "service/Pagination.js";
import {PAGINATION_SHOW} from 'config.js';

import { connect } from 'react-redux'


const requestData = (pageSize, page, sorted, filtered, log_type, applicant_id) => {
    return new Promise((resolve, reject) => {
        var Request = {pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, log_type: log_type, applicant_id: applicant_id};

            postData('recruitment/RecruitmentApplicant/get_applicant_communication_log', Request).then ((result) => {
                    let filteredData = result.data;
                        const res = {
                                rows: filteredData,
                                pages: (result.count)
                        };
                   resolve(res);
            });

    });
};

class CommunicationLog extends React.Component {
    constructor(props) {
        super(props); 
        this.state = {   
            communicationLog: [],
        }
    }
    
    fetchData = (state, instance)=> {
        // function for fetch data from database
        this.setState({loading: true});
        requestData(
                state.pageSize,
                state.page,
                state.sorted,
                state.filtered,
                this.props.log_type,
                this.props.applicant_id,
                ).then(res => {
            this.setState({
                communicationLog: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }
    
    onSubmit = (e) => {
        e.preventDefault(); 
        this.setState({filtered: {search: this.state.search}})
    }

    render() {
        const csv_header = [
                            {label: 'Type', key: 'type'},
                            {label: 'Initiated By HCMID', key: 'HCMID'},
                            {label: 'Contact Used', key: 'contact_used'},
                            {label: 'Date', key: 'created'},
                        ];
        
        const columns = [{ Header: 'ID', accessor: 'id', filterable: false, sortable: false,},
        { Header: 'Title', accessor: 'title', filterable: false },
        { Header: 'Date', accessor: 'created', filterable: false, Cell: props => <span>{moment(props.value).format('DD/MM/YYYY')}</span> },
        { Header: 'Time', accessor: 'created', filterable: false, Cell: props => <span>{moment(props.value).format('LT')}</span>},
        { Header: 'Action', accessor: 'ID', filterable: false, sortable: false,
          Cell: props => <span className="booking_L_T1 color">
                            <CSVLink data={[props.original]} headers={csv_header} filename={"loges.csv"}>
                                    <i className="icon icon-download1-ie"></i>
                            </CSVLink>
                        </span>
        },
        { expander: true,
                Header: () => <strong></strong>,width: 45,accessor: "progress_count",
                headerStyle: { border: "0px solid #fff" },
                className: '_align_c__',
                Expander: ({ isExpanded, ...rest }) =>
                    <div className="expander_bind">
                        {isExpanded ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i> : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                    </div>,
                style: {cursor: "pointer", fontSize: 25, padding: "0", textAlign: "center", userSelect: "none"}
            }
        ]
    
        return (
        <div className="ConH_modal">
            <Modal bsSize="large" className="modal fade-scale" show={this.props.showModal} onHide={this.handleHide} container={this} aria-labelledby="myModalLabel" id="modal_1" tabIndex="-1" role="dialog" >
               <form id="booking_form" method="post" autoComplete="off">
                <Modal.Body>
                    <div className="dis_cell">
                        <div className="text text-left by-1 Popup_h_er_1"><span>Communication log:</span>
                            <a data-dismiss="modal" aria-label="Close" className="close_i" onClick={()  => this.props.closeModal()}><i className="icon icon-cross-icons"></i></a>
                        </div>
                        <div>
                              <form onSubmit={this.onSubmit}>
                                <div className="row py-5">
                                    <div className="col-md-6">
                                        <div className="table_search_new ConH_Sear">
                                            <input type="text" onChange={(e) => this.setState({search: e.target.value})} name="" value={this.state.search || ''} />
                                            <button type="submit">
                                                <span className="icon icon-search"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                              </form>
                        </div>
                        <div className="row ">
                        <div className="col-md-12 listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                    PaginationComponent={Pagination}                             
                                    columns={columns}
                                    manual 
                                    ref={this.reactTable}
                                    data={this.state.communicationLog}
                                    pages={this.state.pages}
                                    loading={this.state.loading} 
                                    onFetchData={this.fetchData} 
                                    filtered={this.state.filtered}
                                    defaultPageSize={10}
                                    noDataText="No Records"
                                    className="-striped -highlight"  

                                    minRows={2}
                                    previousText = {<span className="icon icon-arrow-1-left privious"></span>}
                                    nextText = {<span className="icon icon-arrow-1-right next"></span>}
                                    showPagination={this.state.communicationLog.length > PAGINATION_SHOW ? true : false }
                                    SubComponent={(props) => <CommunicationTextView {...props.original} />}
                                />
                        </div>
                        </div>
                    </div> 
                    
                   
                </Modal.Body>
               </form>
            </Modal>
        </div>
        );
    }
}

export default CommunicationLog;

const CommunicationTextView = (props) => {
//console.log(props.communication_text);
    return(
           <div className="tBL_Sub">{JSON.stringify(props.log_data)}</div>                       
        )
}