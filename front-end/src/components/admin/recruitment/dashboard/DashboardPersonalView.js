import React, { Component } from 'react';
//import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../../../../config.js';
//import Pagination from "../../../../service/Pagination.js";
import { connect } from 'react-redux'
import ScrollArea from "react-scrollbar";
import classNames from "classnames";

const CustomTbodyComponent = props => (
    <div {...props} className={classNames("rt-tbody", props.className || [])}>
        <div className=" cstmSCroll1">
            <ScrollArea
                speed={0.8}
                className="stats_update_list"
                contentClassName="content"
                horizontal={false}
                style={{ paddingRight: "15px", paddingLeft: "15px", height: '620px', minHeight: '620px' }}
            >{props.children}</ScrollArea>
        </div>
    </div>
);

class DashboardPersonalView extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    render() {

        return (
            <React.Fragment>
                <div className="row mt-5">

                    <div className="col-lg-6 col-md-6 mycol-xl-6">
                        <div className="Req-Dashboard_tBL">
                            <div className="PD_Al_div1">
                                <div className="PD_Al_h_txt pt-3 lt_heads">New Assigned Applicants</div>
                                <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">
                                    <ReactTable
                                        data={this.props.new_assigned_applicant}
                                        columns={[
                                            {
                                                Header: "Applicant", accessor: "applicant_name",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'applicant_name') ? 'borderCellCls' : 'T_align_m1'
                                            },
                                            {
                                                Header: "Service Area ", accessor: "recruitment",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'recruitment') ? 'borderCellCls' : 'T_align_m1'
                                            },
                                            {
                                                Header: "Channel", accessor: "channel_name",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'channel_name') ? 'borderCellCls' : 'T_align_m1'
                                            },
                                            {
                                                Header: "Date Applied", accessor: "date_applide",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'date_applide') ? 'borderCellCls' : 'T_align_m1',
                                                maxWidth: 120,
                                            },
                                            {
                                                Header: "Action", headerStyle: { border: '0px solid #000' },
                                                maxWidth: 60,
                                                Cell: row => (<span className="PD_Al_icon"><a href={ROUTER_PATH + 'admin/recruitment/applicant/' + row.original.id}><i className="icon icon-view2-ie LA_i1"></i></a> </span>)
                                            },
                                        ]}
                                        defaultPageSize={10}
                                        // pageSize={this.props.new_assigned_applicant.length}
                                        showPagination={false}
                                        sortable={false}
                                        TbodyComponent={CustomTbodyComponent}
                                        className="-striped -highlight"
                                    />
                                </div>
                                <Link to={ROUTER_PATH + 'admin/recruitment/applicants?rec=1'}><button className="btn cmn-btn1 btn-block vw_btn">View All</button></Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 mycol-xl-6">
                        <div className="Req-Dashboard_tBL">
                            <div className="PD_Al_div1">
                                <div className="PD_Al_h_txt pt-3 lt_heads">Due Tasks (Next 5 Days)</div>
                                <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">
                                    <ReactTable
                                        data={this.props.due_task}
                                        columns={[
                                            {
                                                Header: "Task", accessor: "task",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'status') ? 'borderCellCls' : 'T_align_m1'
                                            },
                                            {
                                                Header: "Applicant", accessor: "applicant",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'date') ? 'borderCellCls' : 'T_align_m1',

                                            },
                                            {
                                                Header: "Date", accessor: "date",
                                                headerClassName: 'hdrCls', className: (this.state.activeCol === 'date') ? 'borderCellCls' : 'T_align_m1',

                                            },
                                            {
                                                Header: "Action", headerStyle: { border: '0px solid #000' },
                                                Cell: row => (<span className="PD_Al_icon"><a onClick={() => this.props.editShowTask(row.original.id)}><i className="icon icon-view2-ie LA_i1"></i></a> <a onClick={() => this.props.editShowTask(row.original.id)}><i className="icon icon-notes2-ie LA_i1 ml-3"></i></a></span>)
                                            },
                                        ]}
                                        defaultPageSize={10}
                                        // pageSize={this.state.data.length}
                                        showPagination={false}
                                        TbodyComponent={CustomTbodyComponent}
                                        sortable={false}
                                        className="-striped -highlight"
                                    />
                                </div>
                                <Link to={ROUTER_PATH + 'admin/recruitment/action/task'}><button className="btn cmn-btn1 btn-block vw_btn">View All</button></Link>
                            </div>
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

export default connect(mapStateToProps, mapDispatchtoProps)(DashboardPersonalView);