import React, { Component } from 'react';
import ReactTable from "react-table";
import ScrollArea from 'react-scrollbar';
import AddDevices from './AddDevices';
import { postData, reFreashReactTable } from 'service/common.js';
import 'react-table/react-table.css'
import { PAGINATION_SHOW } from 'config.js';
import Pagination from "service/Pagination.js";
import { connect } from 'react-redux'


const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {

        // request
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentDevice/get_device_listing', Request).then((result) => {
            let filteredData = result.data;

            const res = {
                rows: filteredData,
                pages: (result.count),
                total_count: result.total_count
            };
            resolve(res);
        });

    });
};

class ManageDevicesList extends React.Component {
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
    
    closeDeviceModal = (status) => {
        if(status){
            reFreashReactTable(this, 'fetchData');
        }
        this.setState({ AdddevicesModal: false });
    }

    render() {
        var column = [
            {Header: "Device Name:", accessor: "device_name",
                Cell: (props) => (
                    <div className="Question_id_div_">
                        <label className="customChecks publ_sal"><input type="checkbox" /><div className="chkLabs fnt_sm">&nbsp;</div></label>
                        <div>{props.value}</div>
                        <span className="short_buttons_01 add_right_site_icons location_at_i">Identify Device</span>
                    </div>
                )
            },
            { Header: "Device No:", accessor: "device_number", Cell: (props) => (<div className="text_ellip_2line">{props.value} </div>)},
            {Header: "Device Location:", accessor: "location", Cell: (props) => (<div className="text_ellip_2line">{props.value} </div>)},
            {Header: "Status:", accessor: "QuestionID",
                Cell: (props) => (
                    <div>
                        <span className="short_buttons_01 btn_color_assigned">Assigned</span>
                        {/*       <span className="short_buttons_01 btn_color_avaiable">Avaiable</span>
                                               <span className="short_buttons_01 btn_color_offline">Offline</span> */}
                    </div>
                )
            },
            {Header: "Actions:",
                Cell: (props) => (<div>
                    <button className="Req_btn_out_1 R_bt_co_ mr-2" onClick={() => this.setState({ AdddevicesModal: true, popUpTitle: 'Modify Device', EditDeviceData: props.original })}>Modify Device</button>
                    <button className="short_buttons_01">Remove Device</button>
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

                <div className="row pt-4">
                    <div className="col-md-12 text-right">
                        <button onClick={() => this.setState({ AdddevicesModal: true, popUpTitle: 'Add Device', EditDeviceData: []})} className="btn hdng_btn cmn-btn1 icn_btn12 pull-right">Add Device<i className="icon icon-add-icons hdng_btIc"></i></button>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-lg-12 Req-Manage-Devices_tB">

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

                <div className="row text-right mt-2">
                    <div className="col-md-12">
                        <input type="button" className="btn cmn-btn1 crte_svBtn" value="Commit And Changes" />
                    </div>
                </div>

                <AddDevices 
                    showModal={this.state.AdddevicesModal} 
                    closeModal={this.closeDeviceModal} 
                    popUpTitle={this.state.popUpTitle} 
                    EditDeviceData={this.state.EditDeviceData} 
                />

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
export default connect(mapStateToProps, mapDispatchtoProps)(ManageDevicesList);