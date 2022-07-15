import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import Select from 'react-select-plus';
import DatePicker from "react-datepicker";
import ManageCABModal from './ManageCABDayCheckAnswersModal';
import { ROUTER_PATH, BASE_URL } from 'config.js';
import { postData, reFreashReactTable, downloadFile, archiveALL, toastMessageShow } from 'service/common.js';
import { applicantCabDayDocumentStatus, manageCabdayInterviewStatus } from 'dropdown/recruitmentdropdown.js';
import { PAGINATION_SHOW } from 'config.js';
import Pagination from "service/Pagination.js";
import moment from 'moment-timezone';
import { connect } from 'react-redux'
import _ from 'lodash';
import { colorCodeCABDay, progressQuizColorCodeCABDay, NottachmentAvailable, progressContractColorCodeCABDay } from 'service/custom_value_data.js';
import FlagApplicantModal from './../../applicants/FlagApplicantModal.js';
import { recruitmentCabDayDocumentStatusChange, recruitmentCabDayDetailsFetch } from 'service/CustomContentLoader.js';
import ReactPlaceholder from 'react-placeholder';



const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentCabDayInterview/get_cab_day_interview_list', Request)
            .then((result) => {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count)
                };
                resolve(res);
            });
    });
};

class CABDayListing extends Component {
    constructor() {
        super();
        this.state = {
            taskList: [],
            search: '',
            filter_var: '',
            filtered: { filter_by: '', srch_box: '' },
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
                taskList: res.rows,
                pages: res.pages,
                loading: false,
                total_count: res.total_count
            });
        });
    }
    refreshDataTbl = () => {
        reFreashReactTable(this, 'fetchData');
    }

    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState({ [key]: value }, () => {
            this.setTableParams();
        });
    }
    setTableParams() {
        this.setState({
            ...this.state,
            search: this.state.search.trim(),
            filtered: { ...this.state.filtered, srch_box: this.state.search.trim(), filter_by: this.state.filter_var },
        }, () => {
            //console.log('ffsdf',this.state);
        });
    }
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    render() {
        var columns = [
            {
                Header: "Name: ", accessor: "task_name", className: "Show_td_stracture",
                // width: 200,
                Cell: (props) => {
                    let classNameData = colorCodeCABDay[props.original.task_overall_status] ? colorCodeCABDay[props.original.task_overall_status] : 'clr_yellow';
                    return (
                        <div className="d_flex1 align-items-center">
                            <div><h3><strong>{props.value}</strong>&nbsp;</h3></div>
                            <div><h3><span>{moment(props.original.start_datetime).format('DD/MM/YYYY')}</span>&nbsp;</h3></div>
                            <span className={"slots_sp " + classNameData}>{_.capitalize(props.original.task_overall_status)}</span>
                        </div>

                    )
                }
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
        ]

        return (
            <React.Fragment>                
                {/* row ends */}
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>{this.props.showPageTitle}</h1>
                    </div>
                </div>
                {/* row ends */}

                <form onSubmit={(e) => this.submitSearch(e)} method="post">
                    <div className="row sort_row1-- after_before_remove">
                        <div className="col-lg-6 col-md-7 col-sm-7 no_pd_l">
                            <div className="search_bar right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                <i className="icon icon-search2-ie" onClick={(e) => this.submitSearch(e)}></i>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                            <div className="filter_flx">
                                <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                                    <Select name="filter_by"
                                        required={true} simpleValue={true}
                                        searchable={false} clearable={false}
                                        placeholder="Filter by: Status"
                                        options={manageCabdayInterviewStatus()}
                                        onChange={(e) => this.filterChange('filter_var', e)}
                                        value={this.state.filtered.filter_by}
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                </form>
                {/* row ends */}


                <div className="row">
                    <div className="col-sm-12 px-0 dataTab_accrdn_cmn Req-Manage-Group-Interview-List_tBL">
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                            <ReactTable
                                PaginationComponent={Pagination}
                                columns={columns}
                                manual="true"
                                data={this.state.taskList}
                                pages={this.state.pages}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                filtered={this.state.filtered}
                                defaultPageSize={10}
                                noDataText="No CAB Day Found"
                                onPageSizeChange={this.onPageSizeChange}
                                ref={this.reactTable}
                                minRows={2}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                showPagination={this.state.taskList.length >= PAGINATION_SHOW ? true : false}
                                collapseOnDataChange={false}
                                className="-striped -highlight dble_tble_Mg mnge_grp_Tble"
                                SubComponent={(props) =>
                                    <CabDayInterviewDetail {...props.original} mainIndex={props.index} openFlageModel={this.openFlageModel} refreshDataTbl={this.refreshDataTbl} />
                                }
                            />

                        </div>
                    </div>
                    <ManageCABModal showModal={this.state.CABday} closeModal={() => this.setState({ CABday: false })} />

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

export default connect(mapStateToProps, mapDispatchtoProps)(CABDayListing);

class CabDayInterviewDetail extends Component {
    constructor() {
        super();
        this.state = {
            taskApplicant: [],
            flageModelOpen: false,
            flageApplicantId: 0,
            loading_status: false,
        }
    }


    closeFlageModel = (status) => {
        this.setState({ flageModelOpen: false, flageApplicantId: 0 }, () => {
            if (status) {
                this.getTaskApplicantDetails();
            }
        })
    }

    openFlageModel = (appid) => {
        if (this.checkedTaskCompletd()) {

            this.setState({ flageModelOpen: true, flageApplicantId: appid }, () => {

            })
        }
    }
    getTaskApplicantDetails = () => {
        this.setState({ loading_status: true }, () => {
            postData('recruitment/RecruitmentCabDayInterview/get_cab_day_task_applicant_details', { taskId: this.props.id }).then((result) => {
                if (result.status) {
                    this.setState({ taskApplicant: result.data })
                }
                this.setState({ loading_status: false });
            });
        });
    }

    componentDidMount() {
        this.getTaskApplicantDetails();
    }
    commitTask = (taskId, applicantId) => {
        archiveALL({ taskId: taskId, applicant_id: applicantId }, 'Are you sure you want to Commit this task.Once its done can\'t be change again.', 'recruitment/RecruitmentCabDayInterview/commit_cabday_interview').then((result) => {
            if (result.status) {
                this.props.refreshDataTbl();
                this.getTaskApplicantDetails();
            } else {
                let msg = result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg : '');
                if (msg != '') {
                    toastMessageShow(msg, 'e');
                }
            }
        })
    }

    checkedTaskCompletd = (type, applicantData) => {
        let typeTask = type != undefined ? type : 'complete';
        let dataApplyFor = ['complete', 'noshow', 'flag'];
        let dataInprogresseApplyFor = ['noshow'];


        if (this.props.task_overall_status == 'completed' && dataApplyFor.includes(typeTask)) {
            toastMessageShow('Task is completed, no further action is allowed.', 'e');
            return false;
        } else if (this.props.task_overall_status == 'in progress' && applicantData && applicantData.quiz_allocated == '1' && dataInprogresseApplyFor.includes(typeTask)) {
            toastMessageShow('Quiz is allocated to applicant, "No Show" is not allowed.', 'e');
            return false;
        } else {

            return true;
        }
    }
    render() {
        return (
            <React.Fragment>
                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={recruitmentCabDayDetailsFetch()} ready={!this.state.loading_status}>
                    <div className="mngGrp_subComp" style={{ padding: '0px 7px' }}>
                        {/* {this.props.original.name} */}
                        <div className="row mt_15p d-flex flex-wrap">
                            <div className="col-lg-3 col-md-4 col-xs-12">
                                <h5><strong>Time/Duration</strong></h5>
                                <div className="row mt_15p pb-xs-3 bb-xs-1 mb-xs-3">
                                    <div className="col-md-6 col-xs-6">
                                        <div className="d-flex align-items-center">
                                            <small className="smallwid_50"><strong>From:</strong></small>
                                            <DatePicker
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="HH:mm"
                                                timeCaption="Time"
                                                required={true}
                                                className="csForm_control clr2 text-center"
                                                selected={moment(this.props.start_datetime)}
                                                disabled={true}
                                                autoComplete={'off'}
                                            />
                                        </div>

                                    </div>
                                    <div className="col-md-6 col-xs-6">
                                        <div className="d-flex align-items-center">
                                            <small className="smallwid_50"><strong>To:</strong></small>
                                            <DatePicker
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="HH:mm"
                                                timeCaption="Time"
                                                required={true}
                                                className="csForm_control clr2 text-center"
                                                selected={moment(this.props.end_datetime)}
                                                disabled={true}
                                                autoComplete={'off'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-2 col-md-4 col-xs-6  pd_l_20p">
                                <h5><b>Location:</b></h5>
                                <div className="d_flex1">
                                    <div>
                                        <h6 className="fnt_15p">
                                            <div className="lh-17 mt-2 clr_grey">{this.props.location}</div>
                                        </h6>
                                    </div>


                                </div>

                            </div>
                            <div className="col-lg-4 col-md-4 col-xs-6  pd_l_20p align-self-center">
                                <div className="pd_l_20p">
                                    <div>&nbsp;</div>
                                    <h6 className="pd_l_20p fnt_15p">Total Applicants <strong>{this.state.taskApplicant != null && typeof (this.state.taskApplicant) == 'object' ? this.state.taskApplicant.length : 0}</strong></h6>
                                </div>
                            </div>


                            {/* <div className="col-md-4 col-lg-5">
                        <div className="st_dvice_bx disabled_1__">
                            <button className="btn cmn-btn1 set_up_btn">Set up device</button>
                            <div><small className="cmplte_sp txtclr_green">completed DD/MM/YYYY - 00:00 AM</small></div>
                        </div>
                    </div> */}
                        </div>

                        <div className="row mt_30p">

                            <div className="col-sm-12 Req-Management-Group-Interview-Inner_tBL">
                                <ApplicantsDets taskApplicant={this.state.taskApplicant} openFlageModel={this.openFlageModel} mainIndex={this.props.mainIndex} task_overall_status={this.props.task_overall_status} taskIdOpen={this.props.id} taskRefresh={this.getTaskApplicantDetails} checkedTaskCompletd={this.checkedTaskCompletd} />
                            </div>

                            <div>
                                {(this.props.commit_status) && this.props.commit_status != 1 && (this.state.taskApplicant != null && typeof (this.state.taskApplicant) == 'object' ? this.state.taskApplicant.length > 0 : 1 == 0) && this.props.task_overall_status == 'in progress' ?
                                    (<button className="btn cmn-btn1 creat_task_btn__" onClick={(e) => this.commitTask(this.props.id, this.state.taskApplicant[0].applicant_id)}>Commit Changes</button>)
                                    : (<React.Fragment />)}
                            </div>

                        </div>
                    </div>
                    {this.state.flageModelOpen ? <FlagApplicantModal showModal={this.state.flageModelOpen} closeModal={this.closeFlageModel} applicant_id={this.state.flageApplicantId} /> : ''}
                </ReactPlaceholder>
            </React.Fragment>
        );
    }
}

class ApplicantsDets extends Component {

    render() {


        return (
            <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                <ReactTable
                    columns={[
                        { Header: "Applicant Name:", accessor: "applicant_name" },
                        // { Header: "Device Allocation:", accessor: "s"},
                        //{ Header: "D.O.B:", accessor: "dob" },
                        {
                            Header: "Quiz", accessor: "quiz_result",
                            className: '_align_c__',
                            Cell: (props) => {
                                let classNameData = colorCodeCABDay[props.original.quiz_result] ? colorCodeCABDay[props.original.quiz_result] : 'clr_yellow';
                                return (
                                    <div className="">
                                        <span className={"slots_sp " + classNameData}>{_.capitalize(props.original.quiz_result)}</span>
                                    </div>
                                )
                            }
                        },
                        {
                            Header: "Document", accessor: "document",
                            className: '_align_c__',

                            Cell: (props) => {
                                let classNameData = colorCodeCABDay[props.original.document_result] ? colorCodeCABDay[props.original.document_result] : 'clr_yellow';
                                return (
                                    <div className="">
                                        <span className={"slots_sp " + classNameData}>{_.capitalize(props.original.document_result)}</span>
                                    </div>
                                )
                            }
                        },
                        {
                            Header: "Contract", accessor: "draft",
                            className: '_align_c__',

                            Cell: (props) => {
                                let resultContract = 'pending';
                                if (props.original.contract_result == 'in progress' && (props.original.contract_result_other == null || props.original.contract_result_other == 'pending' || props.original.contract_result_other == 'in progress')) {
                                    resultContract = props.original.contract_result;
                                } else if (props.original.contract_result == 'in progress' && (props.original.contract_result_other == 'successful' || props.original.contract_result_other == 'unsuccessful')) {
                                    resultContract = props.original.contract_result_other;
                                }
                                let classNameData = colorCodeCABDay[resultContract] ? colorCodeCABDay[resultContract] : 'clr_yellow';
                                return (
                                    <div className="">
                                        <span className={"slots_sp " + classNameData}>{_.capitalize(resultContract)}</span>
                                    </div>
                                )
                            }
                        },
                        {
                            Header: "CAB Certificate", accessor: "cab_certificate_status",
                            className: '_align_c__',

                            Cell: (props) => {
                                let classNameData = colorCodeCABDay[props.original.cab_certificate_status] ? colorCodeCABDay[props.original.cab_certificate_status] : 'clr_yellow';
                                return (
                                    <div className="">
                                        <span className={"slots_sp " + classNameData}>{_.capitalize(props.original.cab_certificate_status)}</span>
                                    </div>
                                )
                            }
                        },
                        {
                            Header: "Applicant Status", accessor: "applicant_status",
                            className: '_align_c__',

                            Cell: (props) => {
                                let classNameData = colorCodeCABDay[props.original.applicant_status] ? colorCodeCABDay[props.original.applicant_status] : 'clr_yellow';
                                return (
                                    <div className="">
                                        <span className={"slots_sp " + classNameData}>{_.capitalize(props.original.applicant_status)}</span>
                                    </div>
                                )
                            }
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
                            style: { cursor: "pointer", fontSize: 25, padding: "0", textAlign: "center", userSelect: "none" }
                        }

                    ]}

                    defaultPageSize={3}
                    data={this.props.taskApplicant}
                    pageSize={this.props.taskApplicant.length}
                    showPagination={false}
                    className="-striped -highlight"
                    collapseOnDataChange={false}
                    minRows={3}
                    SubComponent={(props) =>
                        <ApplicantsSpaceficDets ApplicantsDets={props.original} mainProps={this.props} />

                    }
                />

            </div>

        );
    }

}
class ApplicantsSpaceficDets extends Component {
    constructor() {
        super();
        this.state = {
            taskApplicantData: [],
            documentStatus: 0,
            loading_status: false,
        }
    }
    reviewDocumentAction(type, docId, attachmentId, applicantID, title, details_id, applicationId) {
        if (this.props.mainProps.checkedTaskCompletd()) {
            let requestData = {};
            requestData['applicant_id'] = applicantID;
            requestData['application_id'] = applicationId;
            requestData['recruitment_doc_id'] = docId;
            requestData['attachment_id'] = attachmentId;
            requestData['detailId'] = details_id;
            requestData['action'] = type == 'reject' ? 2 : 1;
            requestData['doc_cat'] = title;
            let msg = type == 'reject' ? 'Are you sure, you want to reject this review document and move this document again in outstanding category list?' : 'Are you sure, you want to approve this review document?';
            archiveALL(requestData, msg, 'recruitment/RecruitmentApplicant/approve_deny_applicant_doc_category').then((result) => {
                if (result.status) {
                    this.getTaskApplicantDetails();
                } else if (!result.status && result.error != '') {
                    toastMessageShow(result.error, 'e');

                }
            });
        }
    }

    documentStatusUpdate = (e, details_id) => {
        if (this.state.documentStatus == 0 && e != this.state.documentStatus && this.props.mainProps.checkedTaskCompletd()) {
            let statusMsg = e == 1 ? "Success" : "Unsuccess"
            this.setState({ loading_status: true }, () => {
                archiveALL({ detailId: details_id, applicant_id: this.props.ApplicantsDets.applicant_id, application_id: this.props.ApplicantsDets.application_id, action: e }, 'Are you sure, you want to change applicant document status to \'' + statusMsg + '\'.Once its done can\'t be change again.', 'recruitment/RecruitmentCabDayInterview/update_document_status').then((result) => {
                    if (result.status) {
                        this.setState({ documentStatus: e }, () => {
                            this.props.mainProps.taskRefresh();
                        })
                    } else {
                        let msg = result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg : '');
                        if (msg != '') {
                            toastMessageShow(msg, 'e');
                        }
                    }
                    this.setState({ loading_status: false });

                })
            })

        }
    }
    getTaskApplicantDetails = () => {
        postData('recruitment/RecruitmentCabDayInterview/get_cab_day_task_applicant_specific_details', { taskId: this.props.mainProps.taskIdOpen, applicant_id: this.props.ApplicantsDets.applicant_id }).then((result) => {
            if (result.status) {
                this.setState({ taskApplicantData: result.data })
            } else {
                this.setState({ taskApplicantData: [] })
            }
        });
    }

    componentDidMount() {
        this.setState({ documentStatus: (this.props.ApplicantsDets.document_result == 'successful') ? 1 : (this.props.ApplicantsDets.document_result == 'unsuccessful') ? 2 : 0 }, () => {
            this.getTaskApplicantDetails();
        });
    }
    setOnboarding = (value, type) => {

        archiveALL({ task_applicant_id: this.props.ApplicantsDets.applicant_task_id, type: type, status: value, requestBy: 'cabday', applicant_id: this.props.ApplicantsDets.applicant_id }, 'Are you sure, you want to app onboarding update?', 'recruitment/RecruitmentApplicant/add_applicant_app_onboarding').then((result) => {

            if (result.status) {
                this.props.mainProps.taskRefresh();
            } else if (result.error) {
                toastMessageShow(result.error, 'e');
            }
        });
    }

    setCabDayCertificate = (value, type) => {
        var req = { task_applicant_id: this.props.ApplicantsDets.applicant_task_id, type: type, status: value, requestBy: 'cabday', applicant_id: this.props.ApplicantsDets.applicant_id };
        postData('recruitment/RecruitmentCabDayInterview/add_applicant_cab_certificate_status', req).then((result) => {
            if (result.status) {
                this.props.mainProps.taskRefresh();
            } else {
                toastMessageShow(result.error, 'e');
            }
        });
    }

    handleMarkNoShow = (recruitment_task_applicant_id, applicant_id) => {
        if (this.props.mainProps.checkedTaskCompletd('noshow', this.props.ApplicantsDets)) {
            archiveALL({ recruitment_task_applicant_id: recruitment_task_applicant_id, applicant_id: applicant_id }, 'Are you sure you want to change Applicant status to \'Unsuccesful\'.Once its done can\'t be change again.', 'recruitment/RecruitmentGroupInterview/mark_no_show').then((result) => {
                if (result.status) {
                    this.props.mainProps.taskRefresh();
                }
            })
        }
    }



    render() {

        let classQuizeData = colorCodeCABDay[this.props.ApplicantsDets.quiz_result] ? colorCodeCABDay[this.props.ApplicantsDets.quiz_result] : 'clr_yellow';
        let classProgressQuizeData = progressQuizColorCodeCABDay[this.props.ApplicantsDets.quiz_result] ? progressQuizColorCodeCABDay[this.props.ApplicantsDets.quiz_result] : '';
        let reviewDocumentData = this.state.taskApplicantData.hasOwnProperty('documentInfo') ? this.state.taskApplicantData.documentInfo.filter((row) => row.is_approved == 2 && row.outstanding_doc == 1 && row.attachment_data != null && row.attachment_data != 0) : [];
        let outstandingDocumentData = this.state.taskApplicantData.hasOwnProperty('documentInfo') ? this.state.taskApplicantData.documentInfo.filter((row) => row.is_approved == 2 && row.outstanding_doc == 1 && (row.attachment_data == 0 || row.attachment_data == null)) : [];

        let resultContract = 'pending';
        if (this.props.ApplicantsDets.contract_result == 'in progress' && (this.props.ApplicantsDets.contract_result_other == null || this.props.ApplicantsDets.contract_result_other == 'pending' || this.props.ApplicantsDets.contract_result_other == 'in progress')) {
            resultContract = this.props.ApplicantsDets.contract_result;
        } else if (this.props.ApplicantsDets.contract_result == 'in progress' && (this.props.ApplicantsDets.contract_result_other == 'successful' || this.props.ApplicantsDets.contract_result_other == 'unsuccessful')) {
            resultContract = this.props.ApplicantsDets.contract_result_other;
        }
        let classResultContractData = colorCodeCABDay[resultContract] ? colorCodeCABDay[resultContract] : 'clr_yellow';
        let classProgressContractData = progressContractColorCodeCABDay[resultContract] ? progressContractColorCodeCABDay[resultContract] : '';
        /* let resultApponboarding = 'pending';
        if(this.props.ApplicantsDets.app_login==1 && this.props.ApplicantsDets.app_orientation==1 ){
            resultApponboarding = 'successful';
        }else if(this.props.ApplicantsDets.app_login==0 && this.props.ApplicantsDets.app_orientation==0 ){
            resultApponboarding = 'pending';
        }else if((this.props.ApplicantsDets.app_login==1 && this.props.ApplicantsDets.app_orientation==2 ) || (this.props.ApplicantsDets.app_login==2 && this.props.ApplicantsDets.app_orientation==1 ) ){
            resultApponboarding = 'unsuccessful';
        }else if(this.props.ApplicantsDets.app_login==2 && this.props.ApplicantsDets.app_orientation==2 ){
            resultApponboarding = 'unsuccessful';
        } */
        let classResultApponboardingData = colorCodeCABDay[this.props.ApplicantsDets.cab_certificate_status] ? colorCodeCABDay[this.props.ApplicantsDets.cab_certificate_status] : 'clr_yellow';
        let disabledTaskCompleted = this.props.mainProps.task_overall_status == 'completed' ? true : false;
        return (
            <div className="tBL_Sub  pd_lr_20p">
                <ReactPlaceholder showLoadingAnimation={true} customPlaceholder={recruitmentCabDayDocumentStatusChange()} ready={!this.state.loading_status}>
                    <div className="ap_dts_bx2__k____">
                        <div className="row ap_dts_padding after_before_remove">
                            <div className="col-lg-3 col-md-5 col-xs-12 br-1 border-black br-xs-0">
                                <div className={(this.props.ApplicantsDets.mark_as_no_show == 1) ? "disabled_1__" : ''}>
                                    <div className="mb-m-1 header_CABDay">
                                        <span className="MG_inter_label"><strong>Applicant Email</strong></span>
                                        <div className="Mg_email_set_ word_wrap_break_">
                                            {this.props.ApplicantsDets.applicant_email}
                                        </div>
                                    </div>

                                    <div className="mb-m-1 header_CABDay">
                                        <span className="MG_inter_label"><strong>1. Review Quiz Results</strong></span>
                                        <span>
                                            <span className={"slots_sp " + classQuizeData}>{_.capitalize(this.props.ApplicantsDets.quiz_result)}</span>
                                        </span>
                                    </div>

                                    <div className={"main_row_NA_Quiz mb-m-1 " + classProgressQuizeData}>
                                        <div className="heading_Na_Quiz">
                                            Applicant Results: {(this.props.mainProps.task_overall_status)}
                                            </div>
                                        <div className="row_NA_Quiz">
                                            <span className="NA_btn active_NA_Quiz">{(this.props.mainProps.task_overall_status == 'pending' ? 'N/A' : (this.props.ApplicantsDets.quiz_result == 'pending' ? 'N/A' : this.props.ApplicantsDets.quiz_marked))}</span>
                                            {this.props.mainProps.task_overall_status == 'pending' ? <button disabled={(this.props.mainProps.task_overall_status == 'pending') ? true : false} className="NA_btn">Mark Quiz</button> : this.props.ApplicantsDets.quiz_allocated == '0' ? (<button disabled={true} className="NA_btn">Mark Quiz</button>) : (<Link to={this.props.ApplicantsDets.quiz_allocated == '0' ? '#' : ROUTER_PATH + 'admin/recruitment/cab_interview_result/' + this.props.ApplicantsDets.applicant_id + '/' + this.props.mainProps.taskIdOpen} className="NA_btn">Mark Quiz</Link>)}
                                        </div>
                                    </div>

                                </div>

                            </div>

                            <div className="col-lg-6 col-md-7 col-xs-12 br-1 border-black br-sm-0 bt-xs-1">
                                <div className={(this.props.ApplicantsDets.quiz_result == 'pending' || this.props.ApplicantsDets.mark_as_no_show == 1) ? "disabled_1__" : ''}>
                                    <div className="mb-m-1 header_CABDay pt-xs-4">
                                        <span className="MG_inter_label"><strong>2. Mandatory Documents:</strong></span>
                                        <div className="my_wigh">
                                            <div className={"s-def1 s1 req_s1 " + (this.state.documentStatus == 1 ? 'success-select' : this.state.documentStatus == 2 ? 'unsuccess-select' : '')}>
                                                <Select name="participant_assessment"
                                                    required={true}
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    disabled={this.props.ApplicantsDets.quiz_result == 'pending' || this.state.documentStatus > 0 ? true : false}
                                                    options={applicantCabDayDocumentStatus('', this.state.documentStatus, true)}
                                                    value={this.state.documentStatus}
                                                    placeholder="Filter by: Unread"
                                                    onChange={(e) => this.documentStatusUpdate(e, this.props.ApplicantsDets.details_id)}
                                                    className={'custom_select'} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row d-flex flex-wrap">
                                        <div className="col-md-6 col-xs-12 br-1 border-black br-xs-0 pb-xs-4">
                                            <p>For Review</p>
                                            <div className="R_view_Div__">
                                                {reviewDocumentData.length > 0 ? reviewDocumentData.map((row, index) => {
                                                    return (
                                                        <div className="R_view_List__" key={index}>
                                                            <div className="R_view_text">{index + 1}. {row.title}</div>
                                                            <div className="R_view_icons">
                                                                <a className={'d-inline-flex cursor-pointer'} onClick={() => downloadFile(BASE_URL + 'mediaShow/r/' + this.props.ApplicantsDets.applicant_id + '/' + encodeURIComponent(btoa(row.attachment_data)), row.attachment_data)} > <i className="icon icon-view1-ie"></i></a>
                                                                <i className="icon icon-close2-ie cursor-pointer" onClick={() => this.reviewDocumentAction('reject', row.id, row.attachment_id, this.props.ApplicantsDets.applicant_id, row.title, this.props.ApplicantsDets.details_id, this.props.ApplicantsDets.application_id)}></i>
                                                                <i className="icon icon-accept-approve2-ie cursor-pointer" onClick={() => this.reviewDocumentAction('approved', row.id, row.attachment_id, this.props.ApplicantsDets.applicant_id, row.title, this.props.ApplicantsDets.details_id, this.props.ApplicantsDets.application_id)}></i>
                                                            </div>
                                                        </div>
                                                    );
                                                }) : <NottachmentAvailable msg="No outstanding document category found for review." extraClass={'font_size_13'} />}

                                            </div>
                                        </div>
                                        <div className="col-md-6 col-xs-12">
                                            <p>Outstanding</p>
                                            <div className="R_view_Div__">
                                                {outstandingDocumentData.length > 0 ? outstandingDocumentData.map((row, index) => {
                                                    return (
                                                        <div className="R_view_List__" key={index}>
                                                            <div className="R_view_text">{index + 1}. {row.title}</div>
                                                            <div className="R_view_icons">
                                                            </div>
                                                        </div>
                                                    );
                                                }) : <NottachmentAvailable msg="No document category found for Outstanding." extraClass={'font_size_13'} />}


                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="col-lg-3 col-md-12 col-xs-12 bt-sm-1  mt-sm-5">
                                <div className={(resultContract == 'pending' || this.props.ApplicantsDets.mark_as_no_show == 1) ? "disabled_1__" : ''}>
                                    <div className="mb-m-1 header_CABDay pt-sm-3">
                                        <span className="MG_inter_label"><strong>3. Contract</strong></span>
                                        {/* <span className="slots_sp clr_blue">Successful</span> */}
                                        {/* <div className="my_wigh">
                                                    <div className="s-def1 s1 req_s1">
                                                        <Select name="participant_assessment"
                                                            required={true}
                                                            simpleValue={true}
                                                            searchable={false}
                                                            clearable={false}
                                                            options={[]}
                                                            value="1"
                                                            placeholder="Filter by: Unread"
                                                            className={'custom_select'} />
                                                    </div>
                                                </div> */}
                                        <span className={"slots_sp " + classResultContractData}>{_.capitalize(resultContract)}</span>
                                    </div>
                                    <div className="mb-3">
                                        <div className={"Con_list_grid " + classProgressContractData}>
                                            <span className={"btn_1_Contact " + (resultContract == 'in progress' ? 'active' : '')}>Generate Contract</span>
                                            <span className={"btn_1_Contact " + (resultContract == 'successful' ? 'active' : '')}>Contract Signed!</span>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className={"bt-1 border-black pt-3 " + ((resultContract != 'successful' || this.props.ApplicantsDets.mark_as_no_show == 1) ? "disabled_1__" : '')}> */}
                                <div className={"bt-1 border-black pt-3 " + ((this.props.ApplicantsDets.mark_as_no_show == 1) ? "disabled_1__" : '')}>
                                    <div className="mb-m-1">
                                        <span className="MG_inter_label mr-2"><strong>4. Cab Certificate</strong></span>
                                        <span className={"slots_sp slots_sp_size_small " + classResultApponboardingData}>{_.capitalize(this.props.ApplicantsDets.cab_certificate_status)}</span>
                                    </div>
                                    <div className="Stage_Left_1 w-100">
                                        <div className="Time_Orient_div_ pt-2">
                                            <span>Generate CAB Certificate:</span>
                                            <span className="Time_Orient_span_">
                                                <div><label className="radio_F1">
                                                    <input
                                                        type="radio"
                                                        name="genrate_cab_certificate"
                                                        value="1"
                                                        //disabled={this.props.ApplicantsDets.app_orientation == 0 && resultContract == 'successful' ? false : true}
                                                        checked={this.props.ApplicantsDets.genrate_cab_certificate == 1 ? true : false}
                                                        onChange={() => this.setCabDayCertificate('1', 'genrate_cab_certificate')}
                                                    />
                                                    <span className="checkround"></span>
                                                </label><span>Yes</span>
                                                </div>
                                                <div>
                                                    <label className="radio_F1">
                                                        <input
                                                            type="radio"
                                                            name="genrate_cab_certificate"
                                                            //disabled={this.props.ApplicantsDets.app_orientation == 0 && resultContract == 'successful' ? false : true}
                                                            value="2" checked={this.props.ApplicantsDets.genrate_cab_certificate == 2 ? true : false}
                                                            onChange={() => this.setCabDayCertificate('2', 'genrate_cab_certificate')} />
                                                        <span className="checkround"></span></label>
                                                    <span>NO</span>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="Time_Orient_div_ pt-2">
                                            <span>Email CAB Certificate to an Applicant:</span>
                                            <span className="Time_Orient_span_">
                                                <div><label className="radio_F1">
                                                    <input
                                                        type="radio"
                                                        name="email_cab_certificate"
                                                        value="1"
                                                        disabled={this.props.ApplicantsDets.genrate_cab_certificate == 1 ? false : true}
                                                        checked={this.props.ApplicantsDets.email_cab_certificate == 1 ? true : false}
                                                        onChange={() => this.setCabDayCertificate('1', 'email_cab_certificate')} />
                                                    <span className="checkround"></span>
                                                </label><span>Yes</span>
                                                </div>
                                                <div>
                                                    <label className="radio_F1">
                                                        <input
                                                            type="radio"
                                                            name="email_cab_certificate"
                                                            disabled={this.props.ApplicantsDets.genrate_cab_certificate == 1 ? false : true}
                                                            value="2"
                                                            checked={this.props.ApplicantsDets.email_cab_certificate == 2 ? true : false}
                                                            onChange={() => this.setCabDayCertificate('2', 'email_cab_certificate')} />
                                                        <span className="checkround"></span></label>
                                                    <span>NO</span>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="CAB_table_footer_">
                            <div className="Cab_table_footer_div1_ mr-5">
                                <label className="customChecks publ_sal mr-3">
                                    <input type="checkbox" name="no_show" onChange={(e) => this.handleMarkNoShow(this.props.ApplicantsDets.applicant_task_id, this.props.ApplicantsDets.applicant_id)} checked={(this.props.ApplicantsDets.mark_as_no_show) && this.props.ApplicantsDets.mark_as_no_show == 1 ? true : false} disabled={((this.props.ApplicantsDets.mark_as_no_show) && this.props.ApplicantsDets.mark_as_no_show == 1) ? true : false} />
                                    <div className="chkLabs fnt_sm">No Show</div>
                                </label>

                                <label className="customChecks publ_sal ml-3">{this.props.ApplicantsDets.flagged_status == 1 ? (<React.Fragment><div className="chkLabs fnt_sm">Flag Applicant pending</div></React.Fragment>) : (<React.Fragment>
                                    <input type="checkbox" name="is_flag" onChange={() => this.props.mainProps.openFlageModel(this.props.ApplicantsDets.applicant_id)} disabled={this.props.ApplicantsDets.flagged_status == 2 ? true : false} checked={this.props.ApplicantsDets.flagged_status == 2 ? true : false} />
                                    <div className="chkLabs fnt_sm">Flag Applicant</div></React.Fragment>)}
                                </label>
                            </div>
                        </div>
                    </div>
                </ReactPlaceholder></div>);
    }
}
