import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";
import ReactResponsiveSelect from "react-responsive-select";
import {
    checkItsNotLoggedIn,
    postData,
    getPermission,
    getQueryStringValue,
    getOptionsCrmParticipant,
    getOptionsCrmMembers,
    handleChangeChkboxInput,
    reFreashReactTable
} from "../../../../../service/common.js";
import { staffDisableAccount, staffAllocatedAccount } from "../../../../../dropdown/CrmDropdown.js";
import Modal from "react-bootstrap/lib/Modal";
import jQuery from "jquery";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddStaffMember from "./AddStaffMember";
import { BASE_URL, ROUTER_PATH } from "../../../../../config";
import CrmPage from "../../CrmPage";
import { connect } from "react-redux";
import Pagination from "../../../../../service/Pagination.js";
import { ToastUndo } from "service/ToastUndo.js";
import { PAGINATION_SHOW } from "../../../../../config.js";
import { confirmAlert, createElementReconfirm } from "react-confirm-alert";
import Scrollbar from "perfect-scrollbar-react";
import classNames from "classnames";
import "perfect-scrollbar-react/dist/style.min.css";

import DisableStaff from "./DisableStaff";

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData("crm/CrmStaff/list_user_management", Request).then(result => {
            var filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: result.count,
                total_count: result.total_count
            };
            resolve(res);
        });
    });
};

const getDepartmentList = () => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({});
        postData("crm/CrmDepartment/get_all_department", Request).then(result => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: result.count
            };
            setTimeout(() => resolve(res), 10);
        });
    });
};

const multiSelectOptionMarkup = text => (
    <div>
        <span className="rrs_select"> {text}</span>
        <span className="checkbox">
            <i className="icon icon-star2-ie"></i>
        </span>
    </div>
);

// By default no caret icon is supplied - any valid jsx markup will do
const caretIcon = <i className="icon icon-edit1-ie"></i>;

class UserMangement extends Component {
    constructor(props, context) {
        super(props, context);
        this.handleSelect = this.handleSelect.bind(this);

        this.state = {
            key: 1,
            filterVal: "All",
            showModal: false,
            usersList: [],
            searching: false,
            inactive: false,
            incomplete: false,
            depList: [],
            showCreateModal: false,
            search: "",
            disable: false,
            permissions: getPermission() == undefined ? [] : JSON.parse(getPermission()),
            confirm_box: false,
            redirect: false
        };
        this.reactTable = React.createRef();
    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(state.pageSize, state.page, state.sorted, state.filtered).then(res => {
            this.setState({
                usersList: res.rows,
                pages: res.pages,
                loading: false,
                total_count: res.total_count
            });
        });
    };
    refreshData = () => {
        reFreashReactTable(this, "fetchData");
    };
    closeCreateModal = param => {
        this.setState({ showCreateModal: false });

        if (param) {
            reFreashReactTable(this, "fetchData");
        }
    };
    handleSelect(key) {
        this.setState({ key });
    }
    options = data => {
        let opt = [];
        opt.push({ text: "Select Allocations:", optHeader: true });
        data.map((key, i) =>
            opt.push({
                value: data[i].value,
                text: data[i].label,
                markup: multiSelectOptionMarkup(data[i].label)
            })
        );

        return opt;
    };

    handleSelectedDropdown(value) {
        this.setState({ allocatedTo: value });
    }

    showModal = a => {
        this.setState({ showModal: true, a: a });
    };
    closeModal = () => {
        this.setState({ showModal: false });
    };

    submitSearch = e => {
        e.preventDefault();

        var srch_ary = {
            search: this.state.search,
            inactive: this.state.inactive,
            incomplete: this.state.incomplete,
            filterVal: this.state.filterVal
        };
        this.setState({ filtered: srch_ary });
    };

    searchData = (key, value) => {
        var srch_ary = { search: this.state.search, inactive: this.state.inactive, filterVal: this.state.filterVal };

        srch_ary[key] = value;
        this.setState(srch_ary);
        this.setState({ filtered: srch_ary });
    };
    EnableRecruiter = id => {
        this.setState({
            confirm_box: true,
            staff_disable: {
                staff_id: id
            }
        });
    };
    enable = e => {
        this.setState({ disable: true });
        postData("crm/CrmStaff/enable_crm_user", this.state.staff_disable.staff_id).then(result => {
            if (result.status) {
                toast.dismiss();
                toast.success(<ToastUndo message="Enabled successfully" showType={"s"} />, {
                    // toast.success("Note Deleted successfully", {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                this.setState({ success: true, disable: false, confirm_box: false }, () => this.refreshData());
            } else {
                toast.dismiss();
                toast.error(<ToastUndo message={result.error} showType={"e"} />, {
                    // toast.error(result.error, {
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
                this.setState({ disable: false, confirm_box: false });
            }
        });
    };
    render() {
        if (this.state.redirect) {
            return <Redirect to="admin/crm/StaffDetails/16" />;
        }

        if (!this.state.permissions.access_crm_admin) {
            return <Redirect to="/admin/no_access" />;
        }

        const { data, pages, loading } = this.state;
        var userStatus = [
            { value: "1", label: "Active" },
            { value: "0", label: "Disabled" },
            { value: "All", label: "All" }
        ];

        const columns = [
            { Header: "Name:", className: "_align_c__", accessor: "name" },
            { Header: "HCMGR ID:", className: "_align_c__", accessor: "ocs_id" },
            { Header: "Service Area:", accessor: "service_area", className: "_align_c__" },
            { Header: "Start Date:", accessor: "created", className: "_align_c__" },
            //  { Header: "End Date:", accessor: "updated", headerStyle: { border: "0px solid #fff" } },
            {
                expander: true,
                Header: () => <strong></strong>,
                width: 55,
                headerStyle: { border: "0px solid #fff" },
                Expander: ({ isExpanded, ...rest }) => (
                    <div className="expander_bind">
                        {isExpanded ? (
                            <i className="icon icon-arrow-up" style={{ fontSize: "13px" }}></i>
                        ) : (
                            <i className="icon icon-arrow-down" style={{ fontSize: "13px" }}></i>
                        )}
                    </div>
                ),
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }
            }
        ];

        const pageSize = typeof this.state.usersList == "undefined" ? 0 : this.state.usersList.length;
        const subComponentDataMapper = row => {
            let data = row.row._original;
            return (
                <div className="tBL_Sub">
                    <div className="row d-flex">
                        <div className="col-md-6  col-lg-5 br-1 py-3 d-flex my-3 flex-wrap border-black">
                            <div className="mr-4 mb-5">
                                <div className="Staff_U_img">
                                    <img src="/assets/images/admin/dummy.png" />
                                </div>
                                <div className="mt-3 show_tex_list_0 auto_1fr f-13">
                                    <span>User Status:</span> <b>{data.user_status == 1 ? "Active" : "Disable"}</b>
                                </div>
                                {
                                    // <a className="btn-3 mt-3" onClick={() => this.setState({ showCreateModal: true,staffData :data,id:data.ocs_id,pagetitile:'Update Staff Member' })}>Edit</a>
                                }
                            </div>
                            <div>
                                <div className="show_tex_list_0 auto f-16 py-1">
                                    <strong>{data.name}</strong>
                                </div>
                                <div className="show_tex_list_0 auto_1fr f-13 py-1">
                                    <span>Position:</span> <strong>{data.position}</strong>
                                </div>
                                <div className="show_tex_list_0 auto_1fr f-13 py-1">
                                    <span>HCMGR-ID:</span> <strong>{data.ocs_id}</strong>
                                </div>
                                <div className="show_tex_list_0 auto f-15 mt-4 py-1">
                                    <b>Contact:</b>
                                </div>
                                {data.PhoneInput.length > 0 ? (
                                    <div className="">
                                        {data.PhoneInput.map((value, idx) => (
                                            <div key={idx + 2} className="show_tex_list_0 auto_1fr f-13  py-1">
                                                {" "}
                                                {value.primary_phone == 1 ? <span>Phone (Primary):</span> : <span>Phone (Secondary):</span>}{" "}
                                                <b className="text_break_all">{value.name}</b>
                                            </div>
                                        ))}{" "}
                                    </div>
                                ) : (
                                    ""
                                )}

                                {data.EmailInput.length > 0 ? (
                                    <div className="mt-2">
                                        {data.EmailInput.map((value, idx) => (
                                            <div className="show_tex_list_0 auto_1fr f-13 py-1" key={idx + 5}>
                                                {value.primary_email == 1 ? <span>Email (Primary):</span> : <span>Email (Secondary):</span>}{" "}
                                                <b className="text_break_all"> {value.name}</b>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>

                        <div className="col-md-6  col-lg-7 pb-3 my-3">
                            <div className="row">
                                <div className="col-lg-6 col-md-12 px-5">
                                    <div className="show_tex_list_0 auto f-13 my-3">Access Permissions:</div>
                                    <div className="show_tex_list_0 auto f-13 mb-2">
                                        <b>All</b>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 px-5">
                                    <div className="show_tex_list_0 auto f-13 my-3">Allocated Service Area:</div>
                                    <div className="show_tex_list_0 auto f-13 mb-2 ">
                                        <b>NDIS</b>
                                    </div>
                                    <div className="show_tex_list_0 auto f-13 my-3">Preferred Service Area:</div>
                                    <div className="show_tex_list_0 auto f-13  mb-2">
                                        <b>NDIS</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bt-1 border-black"></div>
                    {this.state.permissions.access_crm_admin == 1 ? (
                        <div className="row pb-4 mt-3">
                            <div className="col-md-2">
                                <Link
                                    className="btn-3"
                                    to={ROUTER_PATH + "admin/crm/StaffDetails/" + data.ocs_id}
                                    disabled={data.user_status == 0 ? true : false}
                                >
                                    Staff Details
                                </Link>
                            </div>
                            <div className="col-md-10 task_table_footer pt-2">
                                {data.user_status == 1 ? (
                                    <a
                                        disabled={data.is_super_admin != 1 && data.its_crm_admin == 1 ? true : false}
                                        onClick={() => this.showModal(data.ocs_id)}
                                    >
                                        <u>Disable Account</u>
                                    </a>
                                ) : (
                                    <a
                                        disabled={data.is_super_admin != 1 && data.its_crm_admin == 1 ? true : false}
                                        onClick={() => this.EnableRecruiter(data.ocs_id)}
                                    >
                                        <u> Enable Account</u>
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            );
        };
        return (
            <div className="container-fluid">
                <CrmPage pageTypeParms={"user_staff_members"} />

                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <div className="py-4 bb-1">
                            <Link className="back_arrow d-inline-block" to={ROUTER_PATH + "admin/crm/participantadmin"}>
                                <span className="icon icon-back1-ie"></span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="row d-flex flex-wrap  py-4">
                    <div className="col-lg-9 col-md-9 col-xs-12">
                        <div className="h-h1 ">{this.props.showPageTitle}</div>
                    </div>
                    <div className="col-lg-3 col-md-3 col-xs-12">
                        {this.state.permissions.access_crm_admin == 1 ? (
                            <span
                                className="C_NeW_BtN w-100 cursor-pointer"
                                onClick={() => this.setState({ showCreateModal: true, staffData: "", pagetitile: "Add Participant Intake User" })}
                            >
                                <span>Add Participant Intake User</span>
                                <i className="icon icon icon-add-icons"></i>
                            </span>
                        ) : (
                            ""
                        )}
                        <AddStaffMember
                            showModal={this.state.showCreateModal}
                            closeModal={this.closeCreateModal}
                            staffData={this.state.staffData}
                            title={this.state.pagetitile}
                        />
                    </div>
                </div>

                <div className="d-block bt-1 mb-4"></div>
                <form onSubmit={this.submitSearch} className="w-100">
                    <div className="row d-flex">
                        <div className="col-md-9 col-xs-12">
                            <div className="search_bar ad_search_btn right srchInp_sm actionSrch_st">
                                <input
                                    type="text"
                                    className="srch-inp"
                                    placeholder="Search"
                                    value={this.state.search || ""}
                                    onChange={e => this.setState({ search: e.target.value })}
                                />
                                <button type="submit">
                                    <i className="icon icon-search2-ie"></i>
                                </button>
                            </div>
                        </div>

                        <div className="col-md-3 col-xs-12 d-grid auto_1fr align-self-center align-items-center">
                            Filter by:
                            <div className="s-def1 w-100">
                                <Select
                                    name="view_by_status"
                                    options={userStatus}
                                    required={true}
                                    simpleValue={true}
                                    searchable={false}
                                    clearable={false}
                                    placeholder="User Status"
                                    onChange={e => this.searchData("filterVal", e)}
                                    //  onChange={(e) => this.setState({ filterVal: e })}
                                    value={this.state.filterVal}
                                    className={"custom_select"}
                                />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="d-block bt-1 mt-4"></div>

                <div className="row">
                    <div className="col-md-12 Tab_Overflow__ Req-User-Management_tBL mt-4">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL staffTable12">
                            <ReactTable
                                PaginationComponent={Pagination}
                                ref={this.reactTable}
                                columns={columns}
                                manual="true"
                                data={this.state.usersList}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                loading={this.state.loading}
                                filtered={this.state.filtered}
                                defaultPageSize={10}
                                className="-striped -highlight"
                                noDataText="No Users Found"
                                onPageSizeChange={this.onPageSizeChange}
                                minRows={1}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                SubComponent={subComponentDataMapper}
                                showPagination={this.state.usersList.length >= PAGINATION_SHOW ? true : false}
                            />
                        </div>
                    </div>
                </div>

                <DisableStaff showModal={this.state.showModal} staffId={this.state.a} closeModal={this.closeModal} list={this.refreshData} />

                <div className={this.state.confirm_box ? "customModal show" : "customModal"}>
                    <div className="custom-modal-dialog Information_modal task_modal confirmation_module_size">
                        <div className="custom-ui">
                            <div className="confi_header_div">
                                <h3>Confirmation</h3>
                                <span
                                    className="icon icon-cross-icons"
                                    onClick={() => {
                                        this.setState({ confirm_box: false });
                                    }}
                                ></span>
                            </div>

                            <p>
                                <span>Are you sure you want to enable this account?</span>
                            </p>
                            <div className="confi_but_div">
                                <button className="Confirm_btn_Conf" disabled={this.state.disable} ref="btn" onClick={e => this.enable(e)}>
                                    Confirm
                                </button>
                                <button
                                    className="Cancel_btn_Conf"
                                    onClick={() => {
                                        this.setState({ confirm_box: false });
                                    }}
                                >
                                    {" "}
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType
    };
};
export default connect(mapStateToProps)(UserMangement);
