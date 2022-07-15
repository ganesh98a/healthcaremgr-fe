import React, { Component } from 'react';
import { ROUTER_PATH, PAGINATION_SHOW } from '../../../config.js';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactResponsiveSelect from 'react-responsive-select';
import { checkItsNotLoggedIn, postData, handleChangeChkboxInput, getPermission, reFreashReactTable, archiveALL } from '../../../service/common.js';
import AddDepartment from './AddDepartment';
import { connect } from 'react-redux'
import { getRecruitmentArea } from './actions/RecruitmentAction.js';
import Pagination from "../../../service/Pagination.js";
import DepartmentAnalytics from './DepartmentAnalytics';

const multiSelectOptionMarkup = (text) => (
    <div>
        <span className="rrs_select"> {text}</span>
        <span className="checkbox">
            <i className="icon icon-star2-ie"></i>
        </span>
    </div>
);
const caretIcon = (
    <i className="icon icon-edit1-ie"></i>
);

//
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('recruitment/RecruitmentDashboard/get_department', Request).then((result) => {
            let filteredData = result.data;

            const res = {
                rows: filteredData,
                pages: (result.count),
                all_count: result.all_count,
                total_duration: result.total_duration
            };

            resolve(res);
        });

    });
};

class DepartmentList extends Component {
    constructor(props) {
        checkItsNotLoggedIn(ROUTER_PATH);
        super(props);
        this.permission = (getPermission() == undefined) ? [] : JSON.parse(getPermission());

        this.state = {
            filterVal: '',
            filtered: '',
            deptListing: [],
            showDepartModal:false
        }
        this.reactTable = React.createRef();
    }

    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                deptListing: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
                total_duration: res.total_duration
            });
            this.props.getRecruitmentArea();
        })
    }

    closeModal = (param) => {
        this.setState({ showModal: false, oldData: [] }, () => {

            if (param)
                reFreashReactTable(this, 'fetchData');
        });
    }

    archived(index, id, tbl) {
        archiveALL({id: id},'',  'recruitment/RecruitmentDashboard/archive_department').then((result) => {
            if (result.status) {
                var state = {}
                state['deptListing'] = this.state.deptListing.filter((s, sidx) => index !== sidx);
                this.setState(state);
            }
        })
    }

    searchData = (e) => {
        e.preventDefault();
        var requestData = { srch_box: this.state.srch_box };
        this.setState({ filtered: requestData });
    }

    render() {
        var options = [
            { value: 'one', label: 'Option 1' },
            { value: 'two', label: 'Option 2' }
        ];

        const departColumns = [
            { Header: 'Name', accessor: 'name', filterable: false, sortable: false },
            { Header: 'HCMGR-ID', accessor: 'id', filterable: false, },
            { Header: 'Department', accessor: "department" },
            { Header: 'Start Date ', accessor: 'created', filterable: false, },
            {
                expander: true,
                Header: () => <strong></strong>,
                width: 55,
                headerStyle: {border:"0px solid #fff" },
                Expander: ({ isExpanded, ...rest }) =>
                  <div className="rec-table-icon">
                    {isExpanded
                      ?<i className="icon icon-arrow-down icn_ar1"></i>
                      :<i className="icon icon-arrow-right icn_ar1"></i>}
                  </div>,
                style: {
                  cursor: "pointer",
                  fontSize: 25,
                  padding: "0",
                  textAlign: "center",
                  userSelect: "none"
                },
          
            }
        ]
    
        const StaffMemberHeader = [
            { Header: "HCMGR-ID", accessor: "hcmr_id" },
            { Header: "Name:", accessor: "name" },
            { Header: "Manager:", accessor: "manager" },
            { Header: "Date of Allocation:", accessor: "allocation_date" },
        ]
        //
        return (
            <React.Fragment>
                <div className="tasks_comp ">
                    <div className="row">
                        <div className='col-sm-12 text-right'>
                            <button className="btn cmn-btn1 apli_btn__ eye-btn add_staff" onClick={() => this.setState({ showModal: true, pageTitle: 'Create New Department' })}>Add Department</button>
                        </div>

                        {(this.state.showModal) ?
                            <AddDepartment showModal={this.state.showModal} closeModal={this.closeModal} pageTitle={this.state.pageTitle} oldData={this.state.oldData} />
                            : ''}

                        <form method='get' onSubmit={this.searchData} autoComplete="off">
                            <div className='col-sm-8 mr_b_20'>
                                <div className="search_bar left">
                                    <input type="text" className="srch-inp" placeholder="Job specific Search Bar.." name="srch_box" onChange={(e) => handleChangeChkboxInput(this, e)} />
                                    <i className="icon icon-search2-ie"></i>
                                </div>
                            </div>
                        </form>

                        <div className='col-sm-4'>
                            <div className="filter_flx lab_vrt">
                                <label>Show:</label>
                                <div className="filter_fields__ cmn_select_dv">
                                    <Select name="view_by_status"
                                        required={true} simpleValue={true}
                                        searchable={false} Clearable={false}
                                        placeholder="All Applicant"
                                        options={options}
                                        onChange={(e) => this.setState({ filterVal: e })}
                                        value={this.state.filterVal}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-12">
                            <div className="data_table_cmn dataTab_accrdn_cmn aplcnt_table hdng_cmn2 departTable">
                                <ReactTable
                                PaginationComponent={Pagination}
                                    showPagination={this.state.deptListing.length > PAGINATION_SHOW ? true : false}
                                    columns={departColumns}
                                    data={this.state.deptListing}
                                    pages={this.state.pages}
                                    loading={this.state.loading}
                                    onFetchData={this.fetchData}
                                    filtered={this.state.filtered}
                                    defaultPageSize={10}
                                    noDataText="No Record Found"
                                    className={"-striped -highlight"}
                                    minRows={1}
                                    previousText={<span className="icon icon-arrow-left privious"></span>}
                                    nextText={<span className="icon icon-arrow-right next"></span>}
                                    ref={this.reactTable}
                                    SubComponent={(props) => 
                                            
                                        <div className='depart_info__'>
                                            <div className='lineCmn'></div>
                                            <h5 className='dprt_hdng1'><strong>Allocated Staff Members</strong></h5>

                                            <div className="data_table_cmn tableType2 depStaffTable__ ">
                                                <ReactTable                                                 
                                                    columns={StaffMemberHeader}
                                                    manual
                                                    data={props.original.alloted_staff_member}
                                                    defaultPageSize={10}
                                                    className="-striped -highlight"
                                                    noDataText="No Record Found"
                                                    minRows={1}
                                                    showPagination={false}
                                                />
                                            </div>

                                                <div className="row departFoot_1__">                                                   
                                                    <div className="col-md-12">
                                                        <ul className="subTasks_Action__">

                                                            <li><a onClick={()=> this.setState({showDepartModal:true})} className="sbTsk_li">Department Analytics</a></li>
                                                            <li><a onClick={() => this.setState({ showModal: true, pageTitle: 'Edit Department', oldData: props.original })}className="sbTsk_li">Edit Department</a></li>
                                                            <li><a onClick={() => this.archived(props.index, props.original.id, 'recruitment_department')} className="sbTsk_li">Archive Department</a></li>
                                                            <li><span className="sbTsk_li">Export Department Record</span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                       </div>
                </div>

                <DepartmentAnalytics showDepartModal={this.state.showDepartModal} closeDepartModal={() => this.setState({showDepartModal:false})} />
               
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    MemberProfile : state.MemberReducer.memberProfile
})

const mapDispatchtoProps = (dispach) => {
    return {
        getRecruitmentArea: (value) => dispach(getRecruitmentArea(value)),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(DepartmentList)