import React, { Component } from 'react';
import jQuery from "jquery";

import ReactTable from "react-table";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { checkItsNotLoggedIn, postData, checkPinVerified, archiveALL } from '../../../service/common.js';
import { ROUTER_PATH, BASE_URL, PAGINATION_SHOW } from '../../../config.js';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { ToastUndo } from 'service/ToastUndo.js'
import Pagination from "service/Pagination.js";


import moment from 'moment-timezone';
// globale varibale to stote data
var rawData = [];


const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {

        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });

        postData('admin/notification/get_all_notification', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

/*
 * class ListNotification
 */
class ListNotification extends Component {
    constructor(props) {
        super(props);
        checkItsNotLoggedIn(ROUTER_PATH);
        this.filterType = [{ label: 'Select', value: '' }, { label: 'Archive only', value: 'archive_only' }, { label: 'Active only', value: 'active_only' }, { label: 'Inactive only', value: 'inactive_only' }]
        this.state = {
            loading: false,
            userList: [],
            counter: 0,
            startDate: new Date(),
            search: '',
            search_by: ''
        };
    }


    refreashReactTable = () => {
        // if filter is update then react table automaticallty update on change to filter
        // and even odd functionality use beacuse same change it does not refreash react table
        if (this.state.counter % 2 == 0) {
            this.setState({ counter: this.state.counter + 1, filtered: {} });
        } else {
            this.setState({ counter: this.state.counter + 1, filtered: false });
        }
    }

    searchTable = (search_by) => {
        var searchData = { search: this.state.search, search_by: search_by };
        this.setState({ filtered: searchData, search_by: search_by });
    }

    submitSearch = (e) => {
        e.preventDefault();
        // reflec value of search box
        this.searchTable(this.state.search, this.state.search_by);
    };

    archiveHandle = (id) => {
        alert()
        archiveALL({ id: id }, 'Are you you won’t to move Archive', 'admin/Dashboard/delete_user').then((result) => {
            if (result.status) {
                this.refreashReactTable();
            } else {
                this.setState({ loading: false });
                toast.dismiss();
                toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                    // toast.error(result.error, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
        })
    }

    activeDeactiveHandle = (id, status) => {
        this.setState({ loading: true });
        postData('admin/Dashboard/active_inactive_user', { 'adminID': id, 'status': status }).then((result) => {
            if (result.status) {
                this.refreashReactTable();
            } else {
                this.setState({ loading: false });
                toast.dismiss();
                toast.error(<ToastUndo message={result.error} showType={'e'} />, {
                    // toast.error(result.error, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
        });
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
                userList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    render() {

        const { data, pages, loading } = this.state;
        const columns = [{ Header: 'Time', accessor: 'created', filterable: false, className: "_align_c__", Cell: props => <span>{moment(props.original.created).format('DD/MM/YYYY LT')}</span> },
        { Header: 'App', accessor: 'user_type', filterable: false, className: "_align_c__" },
        { Header: 'Username', accessor: 'username', filterable: false, className: "_align_c__" },
        { Header: 'Title', accessor: 'title', filterable: false, className: "_align_c__" },
        {
            Header: 'Description', accessor: 'shortdescription', filterable: false, className: "_align_c__",  headerClassName: '_align_c__ header_cnter_tabl',

            expander: true,
            className: "_align_c__",
            width: 400,
            Expander: (props) =>
                <div className="expander_bind">
                    <div className="d-flex w-100 justify-content-center align-item-center">
                        <span className=""><div className="ellipsis_line__">{props.original.shortdescription}</div></span>
                    </div>
                    {props.isExpanded
                        ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                        : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                </div>

        },
            // {
            //     expander: true,
            //     className:"_align_c__",
            //     Expander: (props) =>
            //         <div className="expander_bind">
            //             {props.isExpanded
            //                 ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
            //                 : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
            //         </div>,
            //    }
        ]



        return (
            <React.Fragment>
                <section className="manage_top">
                    <div className="container-fluid Blue">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 P_15_TB"><Link to={ROUTER_PATH + 'admin/dashboard'}><div className="icon icon-back-arrow back_arrow"></div></Link></div>
                                    <div className="col-lg-12 col-md-12 P_25_TB bor_T text-left">
                                        <h1 className="color">Notifications</h1>
                                    </div>

                                </div>



                                <div className="row">
                                    <div className="col-lg-12 col-md-12 L-I-P_Table">
                                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                            <ReactTable
                                                columns={columns}
                                                manual
                                                data={this.state.userList}
                                                pages={this.state.pages}
                                                loading={this.state.loading}
                                                onFetchData={this.fetchData}
                                                filtered={this.state.filtered}
                                                defaultPageSize={10}
                                                noDataText="No notification"
                                                className="-striped -highlight"
                                                PaginationComponent={Pagination}
                                                minRows={2}
                                                previousText={<span className="icon icon-arrow-1-left privious"></span>}
                                                nextText={<span className="icon icon-arrow-1-right next"></span>}
                                                showPagination={this.state.userList.length > PAGINATION_SHOW ? true : false}
                                                SubComponent={(props) =>
                                                    <div className="tBL_Sub">
                                                        <div className="tBL_des d-flex ">
                                                            <b>Description:</b>
                                                            <p className="mb-0 pt-1 pl-1"> {props.original.shortdescription}</p>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </section>
            </React.Fragment>
        );
    }
}
export default ListNotification;
