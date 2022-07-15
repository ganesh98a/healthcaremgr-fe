import React from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable } from 'service/common.js';
import 'react-table/react-table.css'
import { PAGINATION_SHOW } from 'config.js';
import Pagination from "service/Pagination.js";
import { connect } from 'react-redux'


const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {

        // request
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentDevice/get_allocated_or_unallocated_device_listing', Request).then((result) => {
              
                    let filteredData = result.data;
                    const res = {
                        rows: filteredData? filteredData : [],
                        pages: (result.count),
                        total_count: result.total_count
                    };
                    resolve(res);
                });

    });
};

class DevicesList extends React.Component {
    constructor() {
        super();
        this.state = {
            deviceList: [],
            EditDeviceData: [],
        }

        this.reactTable = React.createRef();
    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                deviceList: res.rows,
                pages: res.pages,
                loading: false,
                total_count: res.total_count
            });
        });
    }

    render() {
        var column = [
            { Header: "Device Name:", accessor: "device_name", Cell: (props) => (<div className="text_ellip_2line  text-center">{props.value} </div>) },
            { Header: "Device No:", accessor: "device_number", Cell: (props) => (<div className="text_ellip_2line text-center">{props.value} </div>) },
            { Header: "Device Location:", accessor: "location", Cell: (props) => (<div className="text_ellip_2line  text-center">{props.value} </div>)},
            { Header: "Status:", accessor: "satus",
                Cell: (props) => (
                    <div>
                        <span className="short_buttons_01 btn_color_assigned">Assigned</span>
                        {/*       <span className="short_buttons_01 btn_color_avaiable">Avaiable</span>
                                               <span className="short_buttons_01 btn_color_offline">Offline</span> */}
                    </div>
                )
            },
            {Header: "Event Type:", accessor: "event_type", Cell: (props) => (<div className="text_ellip_2line  text-center">{props.original.EventType} </div>)},
            {Header: "Session Details:", accessor: "SectionDetails", Cell: (props) => (<div className="text_ellip_2line  text-center">{props.original.SectionDetails} </div>)
            },
            {Header: "Applicant Name:", accessor: "applicant_name", Cell: (props) => (<div className="text_ellip_2line  text-center">{props.original.ApplicantName} </div>)},
            { Header: "D.O.B:", accessor: "DOB", Cell: (props) => (<div className="text_ellip_2line">{props.original.DOB} </div>)},
            {Header: "Actions:", accessor: "QuestionID",
                Cell: (props) => (<div>
                    <a className="short_buttons_01 mr-2">Clear</a>
                    <a className="short_buttons_01" disabled="disabled">Assign</a>
                </div>)
            },
        ];
        return (

            <React.Fragment>
                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12 text-right" >
                        <button className="btn cmn-btn1 edt_ipad">Manage Device</button>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-lg-12 Req-Devices_tBL">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                columns={column}
                                manual="true"
                                data={this.state.deviceList}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                filtered={this.props.filtered}
                                defaultPageSize={10}
                                className="-striped -highlight"
                                noDataText="No Device Found"
                                onPageSizeChange={this.onPageSizeChange}
                                ref={this.reactTable}
                                minRows={2}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={this.state.deviceList.length >= PAGINATION_SHOW ? true : false}
                            />
                        </div>

                    </div>
                </div>
            </React.Fragment>

        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(DevicesList);