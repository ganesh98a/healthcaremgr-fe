import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import { ROUTER_PATH, PAGINATION_SHOW } from 'config.js';
import { checkItsNotLoggedIn, postData, handleChangeChkboxInput, getPermission, reFreashReactTable, changeTimeZone, handleChangeSelectDatepicker, archiveALL } from 'service/common.js';
import 'react-select-plus/dist/react-select-plus.css';
import ReactResponsiveSelect from 'react-responsive-select';
import Navigation from 'components/admin/recruitment/Navigation';
import DepartmentList from 'components/admin/recruitment/DepartmentList';
import AddStaffMember from './AddStaffMember';
import { connect } from 'react-redux';
import Pagination from "service/Pagination.js";
import RecruiterDisable from 'components/admin/recruitment/user_management/RecruiterDisable';
import { ToastUndo } from 'service/ToastUndo.js'
import { ToastContainer, toast } from 'react-toastify';
import { getRecruitmentArea } from 'components/admin/recruitment/actions/RecruitmentAction.js';
import {defaultSpaceInTable} from 'service/custom_value_data.js';
import AvatarIcon from '../../oncallui-react-framework/view/AvatarIcon';


const caretIcon = (
    <i className="icon icon-edit1-ie"></i>
);

//
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentUserManagement/get_staff_members', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    //all_count:result.all_count,
                };
                resolve(res);
            }
        });
    });
};


class UserManagement extends Component {
    constructor() {
        checkItsNotLoggedIn(ROUTER_PATH);
        //super(props);
        super();
        this.state = {
            filterVal: '',
            cstmSelectHandler: false,
            showModal: false,
            ActiveClass: 'staffMember',
            staffList: [],
            department_option: [],
            department_option_design: [],
            desing1: [],
            filtered: { filter_by: 'all', srch_box: '' },
            alloted_dept: [],
            showDisModal: false,
            filter_by: 'all',
        }
        this.reactTable = React.createRef();
    }
    cstmSelect = () => {
        // e.preventDefault();
        this.setState({
            cstmSelectHandler: !this.state.cstmSelectHandler
        });
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
                staffList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    closeModal = (param) => {
        this.setState({ showModal: false });

        if (param)
            reFreashReactTable(this, 'fetchData');
    }

    componentWillReceiveProps(newProps) {

    }

    componentDidMount() {
        if (this.props.recruitment_area.length > 0) {
            this.props.getRecruitmentArea();
        }
    }

    designDepartmentSelect = () => {
        let d = this.state.department_option;
        let c = [{ value: '', text: 'Select Allocations:' }];
        var x = c.concat(d);

        var optionDepartment = [];
        var tempAry = { text: 'Select Allocations:', optHeader: true }

        var designSelect = x.length > 0 ? x.map((z, index) => {
            var desingAry = {};
            if (index == 0) {
                desingAry['text'] = z.text;
                desingAry['optHeader'] = true;
            }
            else {
                desingAry['value'] = z.value;
                desingAry['text'] = z.text;
                desingAry['markup'] = this.multiSelectOptionMarkup(z.text);
            }
            return desingAry;
        }) : [];
        this.setState({ optionDepartment: designSelect });
    }

    multiSelectOptionMarkup = (text) => {
        return <div>
            <span className="rrs_select"> {text}</span>
            <span className="checkbox">
                <i className="icon icon-star2-ie"></i>
            </span>
        </div>
    }

    confirEnableStaff = (recruiter) => {
        var requestData = { staffId: recruiter.id };
        archiveALL(requestData, 'Are you sure you want to enable the staff user account?', 'recruitment/RecruitmentUserManagement/enable_recruiter_staff').then((response) => {
            if (response.status) {
                reFreashReactTable(this, 'fetchData');
            }
        });
    }


    departmentAllotedTo = (index, data, value, area_type) => {
        var requestData = { staffId: data.id, preffered_area: data.preffered_area, recruiter_area: data.recruiter_area };

        if (value.length > 0) {
            if (area_type == 1) {
                requestData['recruiter_area'] = value;
            } else {
                requestData['preffered_area'] = value;
            }

            postData('recruitment/RecruitmentUserManagement/update_alloted_department', requestData).then((result) => {
                if (result.status) {
                    reFreashReactTable(this, 'fetchData');
                }
            });
        } else {
            toast.error(<ToastUndo message={'Keep at least one service area'} showType={'e'} />, {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true
            });
        }
    }

    searchData = (e) => {
        e.preventDefault();
        var requestData = { srch_box: this.state.srch_box, filter_by: this.state.filter_by };
        this.setState({ filtered: requestData });
    }

    openDisModal = (recruiter) => {
        this.setState({ selected_disable_recruiter: { id: recruiter.id, name: recruiter.name, task_cnt: recruiter.task_cnt } });
        this.setState({ showDisModal: true })
    }

    closeDisModal = (response) => {
        if (response) {
            reFreashReactTable(this, 'fetchData');
        }
        this.setState({ showDisModal: false });
    }

    searchSubmit = (e) => {
        var requestData = { filter_by: e, srch_box: this.state.srch_box };
        this.setState({ filtered: requestData, filter_by: e });
    }

    get_recruitment_area = () => {
        postData('recruitment/RecruitmentUserManagement/get_recruitment_area', {}).then((result) => {
            if (result.status) {
                this.setState({ area: result.data });
            }
        });
    }

    render() {
        const tblColumns = [
            {
                // Header: "Name", 
                accessor: "name",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Name</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                // Header: "HCMGR-ID",
                 accessor: "id",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">HCMGR-ID</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: "area", sortable: false, filterable: false,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Service Area</div>
                    </div>
                ,
                className: '_align_c__',
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                // Header: "Start Date", 
                accessor: "created",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Start Date</div>
                    </div>
                ,
                className: '_align_c__',

                Cell: props => <span>{changeTimeZone(props.value, "DD/MM/YYYY")}</span>
            },
            {
                expander: true,
                Header: () => <strong></strong>,
                width: 45,
                headerStyle: { border: "0px solid #fff" },
                className: '_align_c__',
                Expander: ({ isExpanded, ...rest }) =>
                   <div className="expander_bind">
                        {isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                   </div> ,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                },
            }
        ];

        var options = [
            { value: 'all', label: 'All' },
            { value: 'disabled', label: 'Disabled' },
            { value: 'active', label: 'Active' },
        ];

        return (
            <React.Fragment>

                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}
                        <a className="btn hdng_btn cmn-btn1 icn_btn12" onClick={() => this.setState({ showModal: true, staffData: '', pagetitile: 'Create New Staff Member' })}>Add User <i className="icon icon-add-icons hdng_btIc"></i></a>
                        </h1>
                    </div>
                </div>

                <div className="row action_cont_row">

                    {/* <div className="col-lg-2 col-md-2 col-sm-2 no_pd_l asideCol1">
                        <aside>
                            <ul className="side_menu">
                                <li onClick={() => this.setState({ ActiveClass: 'staffMember' })} ><a className={this.state.ActiveClass && this.state.ActiveClass == 'staffMember' ? 'active' : ''} href="#staffSection" aria-controls="staffSection" role="tab" data-toggle="tab">Staff Members</a></li>
                                <li onClick={() => this.setState({ ActiveClass: 'department' })}><a className={this.state.ActiveClass && this.state.ActiveClass == 'department' ? 'active' : ''} href="#departmentSection" aria-controls="departmentSection" role="tab" data-toggle="tab">Departments</a></li>
                            </ul>
                        </aside>
                    </div> */}

                    <div className="col-lg-12 col-md-12 col-sm-12 px-0 mainCntntCol1">
                        <div className="tab-content">
                            <div role="tabpanel" className="tab-pane active" id="staffSection">
                                <div className="tasks_comp ">
                                    <div className="row">
                                        {/* <div className='col-sm-12 text-right mb-1'>
                                            <a className="btn cmn-btn1 apli_btn__ eye-btn add_staff" onClick={() => this.setState({ showModal: true, staffData: '', pagetitile: 'Create New Staff Member' })}>Add Recruiter</a>
                                        </div> */}


                                        <div className='col-sm-8 col-md-8 mr_b_20'>
                                            <form method='get' onSubmit={this.searchData} autoComplete="off">
                                                <div className="search_bar right srchInp_sm actionSrch_st">
                                                    <input type="text" className="srch-inp" placeholder="Job specific Search Bar.." name="srch_box" onChange={(e) => handleChangeChkboxInput(this, e)} />
                                                    <i className="icon icon-search2-ie" onClick={(e) => this.searchSubmit(e)}></i>
                                                </div>
                                            </form>
                                        </div>


                                        <div className='col-md-3 col-sm-4 col-md-offset-1 mb-xs-4'>

                                            {/* <label>Filter by:</label> */}
                                            <div className="filter_fields__ cmn_select_dv">
                                                <Select name="view_by_status"
                                                    required={true} simpleValue={true}
                                                    searchable={false} clearable={false}
                                                    placeholder="Select All"
                                                    options={options}
                                                    onChange={(e) => this.searchSubmit(e)}
                                                    value={this.state.filter_by}
                                                />
                                            </div>

                                        </div>
                                        <div className="col-sm-12 Tab_Overflow__ Req-User-Management_tBL">
                                            <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL staffTable12">
                                                <ReactTable
                                                    PaginationComponent={Pagination}
                                                    showPagination={this.state.staffList.length > PAGINATION_SHOW ? true : false}
                                                    ref={this.reactTable}
                                                    columns={tblColumns}
                                                    manual
                                                    data={this.state.staffList}
                                                    filtered={this.state.filtered}
                                                    defaultFilter={this.state.filtered}
                                                    pages={this.state.pages}
                                                    previousText={<span className="icon icon-arrow-left privious" ></span>}
                                                    nextText={<span className="icon icon-arrow-right next"></span>}
                                                    loading={this.state.loading}
                                                    onFetchData={this.fetchData}
                                                    noDataText="No recruiters found"
                                                    defaultPageSize={10}
                                                    className="-striped -highlight"

                                                    minRows={2}
                                                    collapseOnDataChange={false}
                                                    SubComponent={(props) => <ShortStaffDetails {...props} openDisModal={this.openDisModal} recruitment_area={this.props.recruitment_area} departmentAllotedTo={this.departmentAllotedTo} confirEnableStaff={this.confirEnableStaff} />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div role="tabpanel" className="tab-pane" id="departmentSection">
                                <DepartmentList />
                            </div>
                        </div>
                    </div>
                </div>

                {this.state.showDisModal ? <RecruiterDisable showDisModal={this.state.showDisModal}  {...this.state.selected_disable_recruiter} closeDisModal={this.closeDisModal} /> : ''}

                {this.state.showModal ? <AddStaffMember
                    showModal={this.state.showModal}
                    closeModal={this.closeModal}
                    staffData={this.state.staffData}
                    title={this.state.pagetitile}
                /> : ''}


            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    recruitment_area: state.RecruitmentReducer.recruitment_area,
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {
        getRecruitmentArea: (value) => dispach(getRecruitmentArea(value)),
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(UserManagement)

class ShortStaffDetails extends Component {
    render() {
        return (<div className='tBL_Sub applicant_info1 training_info1 usrMng'>
            <div className='trngBoxAc usrMngBox' style={{borderTop:'0px solid'}}>
                <div className='row'>
                    <div className='col-lg-5 col-md-5 col-xs-12'>
                        <div className='profDet_lSe'>
                            <div className='prof_left'>
                                {
                                    this.props.original.avatar &&
                                    <div className='profImg'>
                                        <AvatarIcon size="large" assistiveText="" avatar={this.props.original.avatar} category="standard" name="user" />
                                    </div> ||
                                    <div className='profImg' style={{ backgroundImage: 'url("/assets/images/admin/dummy.png")' }}>
                                        <img src="" />
                                    </div>
                                }
                                
                                <div className="mt-4">
                                    <small className="fnt-w-600 text-left ">
                                        <div>User Status:</div>
                                        <div>{this.props.original.status == 1 ? 'Active' : "Disabled"}</div>
                                    </small>
                                </div>

                            </div>
                            <div className='prof_right'>
                                <h4 className='usName'><b>{this.props.original.name}</b></h4>
                                <div>{this.props.original.position}</div>
                                <div><b>HCMGR-ID:</b> {this.props.original.id}</div>

                                <div className='cntBxiE mt-5'>
                                    <h4 className="fs-15"><b>Contact:</b></h4>
                                    {(this.props.original.phones.length > 0) ? <span>
                                        {this.props.original.phones.map((value, idx) => (
                                            <div key={idx + 2}><b>Phone ({(value.primary_phone) && value.primary_phone == 1 ? 'Primary' : 'Secondary'}):</b> {value.name}</div>
                                        ))} </span> : ''
                                    }
                                    <div className='mt-1'>
                                        {(this.props.original.emails.length > 0) ? <span>
                                            {this.props.original.emails.map((value, idx) => (
                                                <div key={idx + 5}><b>Email ({(value.primary_email) && value.primary_email == 1 ? 'Primary' : 'Secondary'}):</b> {value.name}</div>
                                            ))} </span> : ''
                                        }
                                    </div>
                                    <div className='mt-1'>
                                        <div><b>Experience:</b>Yes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='clearfix'></div>
                    </div>
                    <div className='col-lg-3 col-md-3 col-xs-12 bt-xs-1 bb-xs-1 py-xs-3'>
                        <p className='hd_para fs-15'><b>Access Permissions:</b></p>
                        <div className="fs-15 mt-4">All</div>
                    </div>
                    <div className='col-lg-3 col-md-4 col-xs-12 pd_l_30 pd_b_20'>
                        {/* <p className='hd_para'>Allocated Recruitment Area:</p> */}
                        <div className="mt-4">
                            <label>Allocated Service Area:</label>
                            <div className="mb-3 cmn_select_dv mg_slct1  slct_des23">
                                <Select
                                    className="custom_select"
                                    name="department"
                                    multi={true}
                                    clearable={false}
                                    searchable={false}
                                    clearable={false}
                                    value={this.props.original.recruiter_area}
                                    onChange={(e) => { this.props.departmentAllotedTo(this.props.index, this.props.original, e, 1) }}
                                    options={this.props.recruitment_area} placeholder="Department" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label>Preferred Service Area:</label>
                            <div className="mb-3 cmn_select_dv mg_slct1 slct_des23">
                                <Select
                                    className="custom_select"
                                    name="department"
                                    multi={true}
                                    clearable={false}
                                    searchable={false}
                                    clearable={false}
                                    value={this.props.original.preffered_area}
                                    onChange={(e) => { this.props.departmentAllotedTo(this.props.index, this.props.original, e, 2) }}
                                    options={this.props.recruitment_area} placeholder="Department" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row accFootRow1">
                    <div className="col-md-6 col-sm-6 pl-3">
                        {(this.props.original.status == 1) ? <Link to={"/admin/recruitment/staff_details/" + this.props.original.id}><button className={"btn cmn-btn1 eye-btn"}>Staff Details</button></Link> : <button className={"btn cmn-btn1 eye-btn disabled"}>Staff Details</button>}
                    </div>
                    <div className="col-md-6 col-sm-6">
                        <ul className="subTasks_Action__">
                            {this.props.original.status == 1 ? <li onClick={() => this.props.openDisModal(this.props.original)} ><span className="sbTsk_li">Disable User</span></li> :
                                <li onClick={() => this.props.confirEnableStaff(this.props.original)} ><span className="sbTsk_li">Enable User</span></li>}

                        </ul>
                    </div>
                </div>

            </div>
        </div>)
    }
}

