import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';

import ReactTable from "react-table";
import moment from "moment";
import {  postData } from 'service/common.js';
import Pagination from "service/Pagination.js";
import {PAGINATION_SHOW} from 'config.js';


const requestData = (pageSize, page, sorted, filtered, applicant_id) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, applicant_id: applicant_id};
        postData('recruitment/RecruitmentApplicant/get_applicant_logs', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

class ApplicantLogs extends Component {

    constructor() {
        super();
        this.state = {
           applicantLogs: []
        }
    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            this.props.applicant_id        
        ).then(res => {
            this.setState({
                applicantLogs: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }
    
    render() {
        var columns = [
            { Header: "Staff/Staff admin:", accessor: "recruiter",  className:"_align_c__"},
            { Header: "Date:", accessor: "created", className:"_align_c__" , Cell: props => <span>{moment(props.value).format('DD/MM/YYYY')}</span> },
            { Header: "Time:", accessor: "created", className:"_align_c__" ,  Cell: props => <span>{moment(props.value).format('LT')}</span> },
            { Header: "Description:", accessor: "specific_title", className:"_align_c__"},
            
        ];

        return (
            <React.Fragment>
                <div className={'customModal ' + (this.props.show ? ' show' : '')}>
                <div className="cstomDialog widBig">
                    <h3 className="cstmModal_hdng1--">
                        Applicant Logs
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModal}></span>
                    </h3>
                
                <div className="row action_cont_row">

                    <div className="col-lg-12 col-md-12">
                        <div className="tasks_comp">
                            {/* row ends */}

                            <div className="row">
                                <div className="col-sm-12 Req-Applicant-logs_tBL">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">

                                        <ReactTable
                                            PaginationComponent={Pagination}
                                            manual="true"
                                            loading={this.state.loading}
                                            pages={this.state.pages}
                                            onFetchData={this.fetchData}
                                            filtered={this.state.filtered}
                                            defaultFiltered={{filter_val: 1}}
                                            columns={columns}
                                            data={this.state.applicantLogs}
                                            defaultPageSize={10}
                                            minRows={1}
                                            onPageSizeChange={this.onPageSizeChange}
                                            className={'-striped -highlight'}
                                            noDataText="No Record Found"
                                            collapseOnDataChange={true}
                                            previousText={<span className="icon icon-arrow-left privious"></span>}
                                            nextText={<span className="icon icon-arrow-right next"></span>}
                                             showPagination={this.state.applicantLogs.length >= PAGINATION_SHOW ? true : false}
                                            />

                                    </div>

                                </div>

                            </div>
                            {/* row ends */}
                        </div>
                        {/* tasks_comp ends */}
                    </div>
                    {/* col-sm-10 ends */}
                </div>
               </div>
            </div>
               
            </React.Fragment>
        );
    }
}

export default ApplicantLogs;