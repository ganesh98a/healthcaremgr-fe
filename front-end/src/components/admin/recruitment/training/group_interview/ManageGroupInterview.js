import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import Select from 'react-select-plus';
import { postData, handleShareholderNameChange, archiveALL, reFreashReactTable, toastMessageShow, handleChangeChkboxInput } from 'service/common.js';
import DatePicker from "react-datepicker";
import { phoneInterviwApplicantClassification, manageGroupInterviewStatus } from 'dropdown/recruitmentdropdown.js';
import moment from 'moment';
import FlagApplicantModal from '../../applicants/FlagApplicantModal';
import { ROUTER_PATH } from 'config.js';
import { connect } from "react-redux";
import Pagination from "service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('recruitment/RecruitmentGroupInterview/get_group_interview_list', Request).then((result) => {
            //if(result.status)
            {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    all_count: result.all_count,
                };
                resolve(res);
            }
        });
    });
};

class ManageGroupInterview extends Component {
    constructor() {
        super();
        this.state = {
            interViewList: [],
            flagallicantpopup: false,
            filtered: [],
            filter_by: 4
        }
        this.reactTable = React.createRef();
    }

    closeFlagApplicantPopUp = (status) => {
        this.setState({ flagallicantpopup: false })
        if (status)
            this.refreshDataTbl();
    }

    refreshDataTbl = () => {
        reFreashReactTable(this, 'fetchGroupInterview');
    }

    fetchGroupInterview = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
        ).then(res => {
            this.setState({
                interViewList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    handleChangeCurrentState = () => {
        this.setState({ flagallicantpopup: true });
    }

    searchData = (e) => {
        e.preventDefault();
        var requestData = { srch_box: this.state.srch_box, filter_by: this.state.filtered.filter_by };
        this.setState({ filtered: requestData });
    }

    render() {
        var options2 = [
            { value: 'successful', label: 'Successful' },
            { value: 'pending', label: 'Pending' }
        ];

        return (
            <React.Fragment>               

                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>

                <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-6 col-md-7 col-sm-7 no_pd_l">
                        <div className=" cmn_select_dv srch_select12  vldtn_slct">
                            <div className="search_bar Small_set__R">
                                <form id="srch_task" autoComplete="off" onSubmit={this.searchData} method="post">
                                    <div className="input_search">
                                        <input type="text" className="form-control" placeholder="Search" name="srch_box" onChange={(e) => handleChangeChkboxInput(this, e)} />
                                        <button type="submit"><span className="icon icon-search"></span></button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                        <div className="filter_flx">
                            <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                                <Select name="filter_by"
                                    required={true} simpleValue={true}
                                    searchable={false} clearable={false}
                                    placeholder="Filter by: Status"
                                    options={manageGroupInterviewStatus()}
                                    onChange={(e) => this.setState({ filtered: { filter_by: e, srch_box: this.state.srch_box } }, () => { })}
                                    value={(this.state.filtered) ? this.state.filtered.filter_by : ''}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 px-0 dataTab_accrdn_cmn Req-Manage-Group-Interview-List_tBL">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                columns={[
                                    {
                                        Header: "task_name:",
                                        accessor: "task_name",
                                        className: "Show_td_stracture",
                                        // width: 200,
                                        Cell: (props) => (
                                            <div className="d_flex1 align-items-center">
                                                <div><h3><strong>{props.original.task_name} </strong>{props.original.datetime_start}&nbsp;</h3></div>
                                                <div><h3><span>{props.original.date}</span>&nbsp;</h3></div>
                                                {
                                                    (
                                                        props.original.task_status == '2' ?
                                                            <span className="slots_sp clr_blue">In progress</span>
                                                            :
                                                            props.original.task_status == '1' ?
                                                                <span className="slots_sp clr_yellow">Pending</span>
                                                                :
                                                                props.original.task_status == '3' ?
                                                                    <span className="slots_sp clr_green">Completed</span>
                                                                    :
                                                                    <span className="">N/A</span>
                                                    )
                                                }

                                            </div>
                                        )
                                    },
                                    {
                                        expander: true,
                                        Header: () => <strong></strong>,
                                        width: 55,
                                        headerStyle: { border: "0px solid #fff" },
                                        Expander: ({ isExpanded, ...rest }) =>
                                            <div >
                                                {isExpanded
                                                    ? <i className="icon icon-arrow-down icn_ar1"></i>
                                                    : <i className="icon icon-arrow-right icn_ar1"></i>}
                                            </div>,
                                        style: {
                                            cursor: "pointer",
                                            fontSize: 25,
                                            padding: "0",
                                            textAlign: "right",
                                            userSelect: "none"
                                        }
                                    }
                                ]}
                                manual
                                defaultFiltered={{ filter_by: this.state.filter_by, srch_box: '' }}
                                defaultPageSize={10}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                PaginationComponent={Pagination}
                                minRows={1}
                                data={this.state.interViewList}
                                onFetchData={this.fetchGroupInterview}
                                filtered={this.state.filtered}
                                ref={this.reactTable}
                                collapseOnDataChange={false}
                                className="-striped -highlight dble_tble_Mg mnge_grp_Tble"
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                SubComponent={(props) =>
                                    <GroupInterviewDetail {...props.original} index={props.index} options2={options2} handleChangeCurrentState={this.handleChangeCurrentState} flagallicantpopup={this.state.flagallicantpopup} closeFlagApplicantPopUp={this.closeFlagApplicantPopUp} refreshDataTbl={this.refreshDataTbl} />
                                }
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

export default connect(mapStateToProps, mapDispatchtoProps)(ManageGroupInterview);

class GroupInterviewDetail extends Component {
    render() {

        return (

            <div className="mngGrp_subComp" style={{ padding: '15px 7px' }}>
                {/* {this.props.original.name} */}
                <div className="row mt_15p">
                    <div className="col-lg-3 col-md-4">
                        <h5><strong>Time/Duration</strong></h5>
                        <div className="row mt_15p">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <small className="smallwid_50"><strong>From:</strong></small>
                                    <div className="input_type_box">{(this.props.start_datetime) ? this.props.start_datetime : 'N/A'}</div>
                                   {/*  <input type="text" className="csForm_control clr2 text-center" value={(this.props.start_datetime) ? this.props.start_datetime : 'N/A'} readOnly={true} /> */}
                                </div>

                            </div>
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <small className="smallwid_50"><strong>To:</strong></small>
                                    <div className="input_type_box">{(this.props.end_datetime) ? this.props.end_datetime : 'N/A'}</div>
                                    {/* <input type="text" className="csForm_control clr2 text-center" value={(this.props.end_datetime) ? this.props.end_datetime : 'N/A'} readOnly={true} /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4  pd_l_20p">
                        <h5><b>Location:</b></h5>
                        <div className="d_flex1">
                            <div>
                                <h6 className="fnt_15p">
                                    <div className="lh-17 mt-2 clr_grey">
                                        {this.props.training_location || 'N/A'}

                                    </div>
                                </h6>
                            </div>
                            <div className="align-items-end d_flex1 pd_l_20p">
                                <h6 className="pd_l_20p fnt_15p">Total Applicants <strong>{this.props.applicant_cnt}</strong></h6>
                            </div>

                        </div>

                    </div>

                </div>

                <div className="row mt_30p">
                    <div className="col-sm-12 Req-Management-Group-Interview-Inner_tBL">
                        <ApplicantListing mainIndex={this.props.index} {...this.props} handleChangeCurrentState={this.props.handleChangeCurrentState} flagallicantpopup={this.props.flagallicantpopup} closeFlagApplicantPopUp={this.props.closeFlagApplicantPopUp} refreshDataTbl={this.props.refreshDataTbl} />
                    </div>
                </div>

            </div>
        );
    }
}
//
class ApplicantListing extends Component {

    handleMarkNoShow = (props, x) => {
        let recruitment_task_applicant_id = props.recruitment_task_applicant_id;
        let applicant_id = props.applicant_id;
        if (props.allot_question == 1) {
            toastMessageShow('Quiz is allocated to applicant, "No Show" is not allowed.', 'e');
            return false;
        }
        archiveALL({ recruitment_task_applicant_id: recruitment_task_applicant_id, applicant_id: applicant_id }, 'Are you sure you want to change Applicant status to \'Unsuccesful\'.Once its done can\'t be change again.', 'recruitment/RecruitmentGroupInterview/mark_no_show').then((result) => {
            if (result.status) {
                this.props.refreshDataTbl();
            }
        })
    }

    commitTask = (taskId) => {
        archiveALL({ taskId: taskId }, 'Are you sure you want to Commit this task.Once its done can\'t be change again.', 'recruitment/RecruitmentGroupInterview/commit_group_interview').then((result) => {
            if (result.status) {
                this.props.refreshDataTbl();
            }
        })
    }

    render() {
        return (
            <React.Fragment>
                <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                    <ReactTable
                        columns={[
                            {
                                accessor: "applicant_name",
                                headerClassName: "_align_c__ header_cnter_tabl",
                                className: "_align_c__",
                                Header: () =>
                                    <div>
                                        <div className="ellipsis_line1__">Applicant Name </div>
                                    </div>
                                ,
                                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                            },
                            {
                                accessor: "quiz",
                                headerClassName: "_align_c__ header_cnter_tabl",
                                className: "_align_c__",
                                Header: () =>
                                    <div>
                                        <div className="ellipsis_line1__">Quiz</div>
                                    </div>
                                ,
                                Cell: (props) => (
                                    <div className="">
                                        {
                                            (
                                                props.original.quiz_status == 1 ?
                                                    <span className="slots_sp clr_green">Successful</span>
                                                    :
                                                    props.original.quiz_status == 2 ?
                                                        <span className="slots_sp clr_blue">Unsuccessful</span>
                                                        :
                                                        <span className="slots_sp clr_yellow">Pending</span>
                                            )
                                        }

                                    </div>
                                )
                            },
                            {
                                accessor: "draft",
                                headerClassName: "_align_c__ header_cnter_tabl",
                                className: "_align_c__",
                                Header: () =>
                                    <div>
                                        <div className="ellipsis_line1__">Draft Contract</div>
                                    </div>
                                ,
                                Cell: (props) => (
                                    <div className="">
                                        {
                                            (
                                                props.original.contract_status == 1 ?
                                                    <span className="slots_sp clr_green">Successful</span>
                                                    :
                                                    <span className="slots_sp clr_yellow">Pending</span>
                                            )
                                        }
                                    </div>
                                )
                            },
                            {
                                accessor: "apli_Status",
                                headerClassName: "_align_c__ header_cnter_tabl",
                                Header: () =>
                                    <div>
                                        <div className="ellipsis_line1__">Applicant Status</div>
                                    </div>
                                ,
                                className: "_align_c__",
                                Cell: (props) => (
                                    <div className="">
                                        {
                                            (
                                                props.original.applicant_status == 1 ?
                                                    <span className="slots_sp clr_green">Successful</span>
                                                    :
                                                    props.original.applicant_status == 0 ?
                                                        <span className="slots_sp clr_yellow">Pending</span>
                                                        :
                                                        props.original.applicant_status == 2 ?
                                                            <span className="slots_sp clr_red">Unsuccessful</span> :

                                                            <span className="slots_sp clr_yellow">Pending</span>
                                            )
                                        }

                                    </div>
                                )
                            },
                            {
                                expander: true,
                                Header: () => <strong></strong>,
                                width: 55,
                                headerStyle: { border: "0px solid #fff" },
                                Expander: ({ isExpanded, ...rest }) =>
                                    <div className="expander_bind" >
                                        {isExpanded
                                            ? <i className="icon icon-arrow-down icn_ar1"></i>
                                            : <i className="icon icon-arrow-right icn_ar1"></i>}
                                    </div>,
                                style: {
                                    cursor: "pointer",
                                    fontSize: 25,
                                    padding: "0",
                                    textAlign: "center",
                                    userSelect: "none"
                                }

                            }

                        ]}

                        defaultPageSize={10}
                        minRows={3}
                        data={this.props.aplicantDetail}
                        pageSize={this.props.aplicantDetail.length}
                        showPagination={false}
                        collapseOnDataChange={false}
                        className="-striped -highlight"
                        SubComponent={(props) => {
                            return (

                                <div className="tBL_Sub pd_lr_20p">
                                    <div className="ap_dts_bx2__k____">

                                        <div className="row ap_dts_padding  after_before_remove">
                                            <div className="col-lg-3 col-md-5">
                                                <div className="">

                                                    <div className="mb-m-1 header_CABDay"><span className="MG_inter_label"><strong>Applicant Email</strong></span>
                                                        <div className="Mg_email_set_ word_wrap_break_">{props.original.applicant_primary_email}</div>
                                                    </div>

                                                    <div className="mb-m-1 header_CABDay">
                                                        <span className="MG_inter_label"><strong>1. Review Quiz Results</strong></span>
                                                        <div className="my_wigh">
                                                            <div className="s-def1 s1 req_s1">
                                                                <span className={(props.original.quiz_status == 1) ? 'slots_sp clr_green' : (props.original.quiz_status == 2) ? 'slots_sp clr_blue' : 'slots_sp clr_yellow'}>{(props.original.quiz_status == 1) ? 'Successful' : (props.original.quiz_status == 2) ? 'Unsuccessful' : 'Pending'}</span>
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div className={(props.original.quiz_status == 1) ? 'main_row_NA_Quiz mb-m-1 success_color_01_' : (props.original.quiz_status == 2) ? 'main_row_NA_Quiz mb-m-1 progress_color_01_' : 'main_row_NA_Quiz mb-m-1 pending_color_01_'} >
                                                        <div className="heading_Na_Quiz">
                                                            Applicant Results:
                                                                        </div>
                                                        <div className="row_NA_Quiz">
                                                            <a className="NA_btn active_NA_Quiz">
                                                                {
                                                                    (props.original.quiz_status) && props.original.quiz_status == 1 ? (props.original.correct_count + '/' + props.original.total_question) : 'N/A'
                                                                }
                                                            </a>
                                                            
                                                            {
                                                                (props.original.flagged_status != 2 && props.original.mark_as_no_show != 1) ?
                                                                    (
                                                                        (this.props.task_status != 2) ?
                                                                            <a className="NA_btn" disabled={true}>Mark Quiz</a>
                                                                            :
                                                                            <Link to={'/admin/recruitment/group_interview_result/' + (props.original.applicant_id) + '/' + this.props.id} className="NA_btn">Mark Quiz</Link>

                                                                    ) : <button className="NA_btn" disabled={true}>Mark Quiz</button>
                                                            }
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>

                                            <div className="col-lg-9 col-md-7 bor_l_b ">

                                                <div className="col-lg-9">
                                                    <div className="appli_row_1 mb-m-1">
                                                        <div className="appli_row_a">
                                                            <div>
                                                                <label>Applicant Classification:</label>
                                                                <a className="appli_btn_ ">{(props.original.classfication) ? phoneInterviwApplicantClassification(props.original.classfication) : 'N/A'}</a>
                                                            </div>
                                                        </div>
                                                        <div className="appli_row_a">
                                                            <div>
                                                                <label>Job Position:</label>
                                                                <a className="appli_btn_ ">{props.original.job_position}</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {(this.props.flagallicantpopup) ?
                                                <FlagApplicantModal showModal={this.props.flagallicantpopup} closeModal={this.props.closeFlagApplicantPopUp} applicant_id={props.original.applicant_id} /> : ''}
                                        </div>
                                        <div className="CAB_table_footer_">

                                            <div className="Cab_table_footer_div1_ mr-5">
                                                <label className="customChecks publ_sal mr-3">
                                                    <input type="checkbox" name="no_show" onChange={(e) => this.handleMarkNoShow(props.original)} checked={(props.original.mark_as_no_show) && props.original.mark_as_no_show == 1 ? true : false} disabled={(props.original.mark_as_no_show) && props.original.mark_as_no_show == 1 ? true : false} />
                                                    <div className="chkLabs fnt_sm" >No Show</div>
                                                </label>

                                                <label className="customChecks publ_sal ml-3">
                                                    {
                                                        (props.original.flagged_status == 2) ?
                                                            <span><input type="checkbox" checked={true} disabled={true} />
                                                                <div className="chkLabs fnt_sm">Flag Applicant</div></span>
                                                            : (props.original.flagged_status == 1) ?
                                                                <div className="chkLabs fnt_sm">Flag request Pending</div>
                                                                : <span><input type="checkbox" onChange={(e) => this.props.handleChangeCurrentState()} checked={false} />
                                                                    <div className="chkLabs fnt_sm">Flag Applicant</div></span>
                                                    }
                                                </label>
                                            </div>
                                            {/*<div className="CAB_table_footer_div2_">
                                                    <a className="CAB-btn">Stop</a>
                                                    <a className="CAB-btn ml-3" disabled>Start</a>
                                                </div>
                                            */}

                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        }
                    />
                </div>
                <div>
                    {(this.props.commit_status) && this.props.commit_status != 1 && this.props.applicant_cnt > 0 && moment(this.props.datetime_end) < moment() ?
                        <button className="btn cmn-btn1 creat_task_btn__" onClick={(e) => this.commitTask(this.props.id)}>Commit Changes</button>
                        : ''}
                </div>
            </React.Fragment>
        );
    }
}
