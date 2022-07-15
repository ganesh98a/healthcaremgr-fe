import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import _ from 'lodash'
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { postData, archiveALL, reFreashReactTable, handleChangeChkboxInput, checkLoginWithReturnTrueFalse, getPermission, css } from '../../../../../service/common.js';
import { questionStatus, answerTypeDrpDown, trainingCategory } from 'dropdown/recruitmentdropdown.js';
import QuestionAnalytics from '../../QuestionAnalytics';
import { REGULAR_EXPRESSION_FOR_NUMBERS } from 'config.js';
import AddQuestion from '../AddQuestion';
import { ROUTER_PATH } from 'config.js';
import Pagination from "service/Pagination.js";
import { connect } from "react-redux";
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import CreateViewPhoneInterview from '../../applicants/CreateViewPhoneInterview.js'

import '../../../scss/components/admin/recruitment/training/group_interview/GroupInterviewQuestion.scss'

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/Recruitment_question/get_questions_list', Request)
            .then((result) => {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    filter_form: result.filter_form,
                    filter_option: result.filter_option,
                };
                resolve(res);
            });
    });
};

class GroupInterviewQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalOpenedPreviewForm: false,
            showModal: false,
            trainingCategory: '',
            SelectTopic: '',
            SetStatus: '',
            SetQuesType: '',
            question_topic: '',
            QuestionAnalyticsModal: false,
            ActiveClass: 'groupInterview',
            setUpIpad: false,
            createQuestionModeMode: 'add',
            filter_topic: 'all',
            srch_box: '',
            searchStart: false,
            groupInterviewQueList: [],
            form_filter_option: [],
            question_fliter_option: [],
            filter_category: 'group_interview'
        }
        this.reactTable = React.createRef();
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
    
    }

    showModal = () => { this.setState({ showModal: true }) }
    closeModal = () => { this.setState({ showModal: false }) }

    handleAddClose = (param) => {
        this.setState({ showadd: false }, () => {
            if (param)
                reFreashReactTable(this, 'fetchQueList');
        });
    }

    handleAddShow = (val) => { this.setState({ showadd: true, editQuesId: '' }); }

    fetchQueList = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
        ).then(res => {
            this.setState(res.filter_option);
            this.setState({
                groupInterviewQueList: res.rows,
                pages: res.pages,
                filter_form: res.filter_form,
                loading: false,
            }, () => { });
        });
    }    

    archiveHandle = (questionId) => {
        archiveALL({ id: questionId }, 'Are you sure want to archive this Question?', 'recruitment/Recruitment_question/delete_Question/').then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchQueList');
            }
        })
    }

    handleQuestionAnalytics = (value) => {
        this.setState({
            QuestionAnalyticsModal: true,
            question: value
        })
    }

    searchQuestion = (e) => {
        if (e != undefined) {
            e.preventDefault();
        }

        var requestData = { srch_box: this.state.srch_box, filter_category: this.state.filter_category, filter_form: this.state.filter_form, filter_topic: this.state.filter_topic };
        this.setState({ filtered: requestData });
    }

    changeStatus = (e, queId, val) => {
        e.preventDefault();
        postData('recruitment/Recruitment_question/update_question_status', { queId: queId, updatedVal: val }).then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchQueList');
            }
        });
    }

    onChangeDisplayOrder = (index, e) => {
        if (e != undefined && e.target.pattern) {
            const re = eval(REGULAR_EXPRESSION_FOR_NUMBERS);
            if (e.target.value != "" && !re.test(e.target.value)) {
                return;
            }
        }

        if (e.target.value > 0) {
            let groupInterviewQueList = this.state.groupInterviewQueList;
            groupInterviewQueList[index]["display_order"] = e.target.value;
            this.setState({ groupInterviewQueList: groupInterviewQueList });
            var req = { questionId: groupInterviewQueList[index]['id'], order: e.target.value };

            postData('recruitment/Recruitment_question/update_display_order_question', req).then((result) => {
                if (result.status) {
                    reFreashReactTable(this, 'fetchQueList');
                }
            });
        }
    }

    /*getFormOptionForFilter = () => {
        postData('recruitment/Recruitment_question/get_form_option_for_filter', {  }).then((result) => {
            if (result.status) {
                var res = result.data;
                this.setState(res);
            }
        });
    }*/

    onChnageCategoryFilter = (value) => {
        if (this.state.filter_category != value) {
           
            this.setState({ filter_category: value, filter_form: ''}, () => {
                this.searchQuestion();
            });
        }
    }

    /**
     * @param {React.MouseEvent<HTMLAnchorElement>} e
     */
    handleOnClickPreviewForm = e => { 
        e.preventDefault(); 
        this.setState({ isModalOpenedPreviewForm: true }) 
    }


    // Renders modal for 'Preview Form'
    renderPreviewFormModal() {
        const { isModalOpenedPreviewForm, filter_form, filter_category, form_filter_option, question_fliter_option } = this.state

        const form_id = filter_form
        const formTitle = filter_category in form_filter_option ? 
            _.get(form_filter_option[filter_category].find(f => parseInt(f.value) === parseInt(filter_form)), 'label', 'N/A')
            : 'N/A'

        const interview_type = filter_category
        const interview_type_label = _.get(question_fliter_option.find(o => o.value === filter_category), 'label')
        const styles = css({
            formTitle: { 
                display: 'inline-block',
                maxWidth: 160,
                verticalAlign: 'bottom',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis' 
            }
        })


        return isModalOpenedPreviewForm && (
            <CreateViewPhoneInterview
                interview_status={true}
                interview_form_id={form_id}
                interview_type={interview_type}
                openModel={isModalOpenedPreviewForm}
                closeModel= {() => this.setState({ isModalOpenedPreviewForm: false })}

                // additional props for the sake of reusing this component
                applications={[{id: 0, position_applied: false }]}
                applicantId={0}
                submittable={false}
                defaultModalHeading={interview_type_label}
                defaultInterviewTypeLabel={[interview_type_label, 'ID'].filter(Boolean).join(' ')}
                formTitle={
                    <span style={styles.formTitle} title={formTitle}>
                        {formTitle}
                    </span>
                }
            />
        )
    }


    render() {
       
        var categoryId = '';
        if (this.state.question_fliter_option.length > 0) {
            var index = this.state.question_fliter_option.findIndex(x => x.value == this.state.filter_category)
            categoryId = this.state.question_fliter_option[index].id;
        }

        var column = [
            {
                accessor: "view_id",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Question ID</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            (this.state.filter_category === "group_interview" || this.state.filter_category === "cab_day")? ({
                accessor: "question_topic",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Related Topic</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            }) : { headerStyle: { borderColor: "transparent" }, width: 0, className: 'br-0' },

            {
                accessor: "form",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Form</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: "display_order",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Display Order</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: props => <span><input min="1" style={{ height: "30px", width: "60px", paddingRight: "0px" }} type="number" onChange={(e) => this.onChangeDisplayOrder(props.index, e)} name="fname" value={props.value || ''} /></span>
            },
            {
                accessor: "status",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Status</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: (propsa) => {
                    let dataClieckedActive = propsa.original.status == 1 && this.permission.access_recruitment_admin ? { onClick: (e) => { this.changeStatus(e, propsa.original.id, '2') } } : {}
                    let dataClieckedInActive = propsa.original.status == 2 && this.permission.access_recruitment_admin ? { onClick: (e) => { this.changeStatus(e, propsa.original.id, '1') } } : {}
                    return (<span>

                        <div className="inACtive_bTN_span">
                            {/* <input type='radio' value={propsa.original.status} name={'activebuttonDe_'+propsa.original.id+''} onChange={(e)=>this.permission.access_recruitment_admin && this.changeStatus(e,propsa.original.id,'2')} checked={(propsa.original.status) && propsa.original.status == 2?true:false}/> */}
                            <span className={propsa.original.status == 2 ? 'active' : ''} {...dataClieckedActive}>Inactive</span>
                            {/* <input type='radio' value={propsa.original.status} name={'activebuttonDe_'+propsa.original.id} onChange={(e)=>this.permission.access_recruitment_admin && this.changeStatus(e,propsa.original.id,'1')} checked={(propsa.original.status) && propsa.original.status == 1?true:false}/> */}
                            <span className={propsa.original.status == 1 ? 'active' : ''} {...dataClieckedInActive}>Active</span>

                        </div>
                    </span>);
                }
            },
            {
                accessor: "created_by",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Created by</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                accessor: "created",
                Header: () =>
                    <div>
                        <div className="ellipsis_line1__">Created</div>
                    </div>,
                headerClassName: "_align_c__ header_cnter_tabl",
                className: "_align_c__",
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                expander: true,
                Header: () => <strong></strong>,
                width: 45,
                headerStyle: { border: "0px solid #fff" },
                className: "_align_c__",
                Expander: ({ isExpanded, ...rest }) =>
                    <div className="expander_bind">
                        {isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}

                    </div>,
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                },
            }
        ];

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>Question List
                            {(this.permission.access_recruitment_admin) ?
                                <a className="btn hdng_btn cmn-btn1 icn_btn12" onClick={(e) => this.handleAddShow()}>Create New Question <i className="icon icon-add-icons hdng_btIc"></i></a>
                                : ''}
                        </h1>
                    </div>
                </div>

                <div className="row action_cont_row">
                    <div className="col-lg-12 col-md-12 col-sm-12 no_pd_r noPd_l_ipd pl-0">
                        <div className="tasks_comp ">
                            <div className="row sort_row1-- after_before_remove" style={{ marginBottom: 0 }}>
                                <div className='col-lg-5 col-md-5 col-sm-5'>
                                    <form id="srch_que" autoComplete="off" onSubmit={this.searchQuestion} method="post">
                                        <div className="search_bar search_bar right srchInp_sm actionSrch_st">
                                            <input type="text" className="srch-inp" placeholder="Search.." name="srch_box" onChange={(e) => { handleChangeChkboxInput(this, e); this.setState({ searchStart: true }) }} />
                                            <i className="icon icon-search2-ie"></i>
                                        </div>
                                    </form>
                                </div>

                                <div className="col-lg-4 col-md-4 col-sm-4 no_pd_r">
                                    <div className="filter_flx lab_vrt">
                                        <label>Filter by Category:</label>
                                        <div className="filter_fields__ cmn_select_dv gr_slctB ">
                                            <Select name="view_by_status"
                                                simpleValue={true}
                                                searchable={false}
                                                clearable={false}
                                                placeholder="Category"
                                                options={this.state.question_filter_option}
                                                onChange={(e) => this.onChnageCategoryFilter(e)}
                                                value={this.state.filter_category}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-3 col-sm-3 no_pd_r">
                                        <div className="filter_flx lab_vrt">
                                            <label>Filter by Form:</label>
                                            <div className="filter_fields__ cmn_select_dv gr_slctB ">
                                                <Select name="view_by_status"
                                                    simpleValue={true}
                                                    searchable={false}
                                                    clearable={false}
                                                    placeholder="Category"
                                                    options={this.state.form_filter_option[this.state.filter_category]}
                                                    onChange={(e) => this.setState({ filter_form: e }, () => { this.searchQuestion(); })}
                                                    value={this.state.filter_form}
                                                />
                                            </div>
                                        </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-12 text-right">
                                    <div className="text-right">
                                        <a href='#' 
                                            id="GroupInterviewQuestion-preview_form" 
                                            onClick={this.handleOnClickPreviewForm}
                                        >
                                                Preview form
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-12 Req-Group-Interview-Querstion_tBL">
                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                        <ReactTable
                                            loading={this.state.loading}
                                            columns={column}
                                            manual
                                            defaultFiltered={{ filter_category: "group_interview", filter_topic: 'all' }}
                                            defaultPageSize={10}
                                            pages={this.state.pages}
                                            PaginationComponent={Pagination}
                                            minRows={1}
                                            data={this.state.groupInterviewQueList}
                                            onFetchData={this.fetchQueList}
                                            filtered={this.state.filtered}
                                            ref={this.reactTable}
                                            collapseOnDataChange={false}
                                            className="-striped -highlight"
                                            previousText={<span className="icon icon-arrow-left privious"></span>}
                                            nextText={<span className="icon icon-arrow-right next"></span>}
                                            SubComponent={(props) =>
                                                <div className='tBL_Sub applicant_info1 training_info1'>
                                                    <div className='trngBoxAc'>
                                                        <div className='row '>
                                                            <div className='col-lg-6 col-md-6 col-sm-6'>
                                                                {/* <h4><b>{props.original.view_id}</b></h4> */}
                                                                <div className='qShwcse'>
                                                                    <h4><b>Question</b></h4>
                                                                    <p>{props.original.question}</p>
                                                                </div>
                                                            </div>
                                                            <div className='col-lg-6 col-md-6 col-sm-6 bor_left ans_colTr'>

                                                                <label>{(props.original.question_type) ? answerTypeDrpDown(props.original.question_type, 'questionList') : 'N/A'}:</label>

                                                                <div className='singleAnswer__'>

                                                                    <div className="Seek_Q_ul">
                                                                        {(props.original.answers.length > 0) ?
                                                                            props.original.answers.map((val, idx) => (
                                                                                <div className="w-100" key={idx + 2}>
                                                                                    <div className="Seek_Q_li">

                                                                                        {
                                                                                            (props.original.question_type != 4) ?
                                                                                                <React.Fragment><div><b>{val.lebel}.</b><span>{val.value}</span></div>
                                                                                                    <span><i className={(val.checked == 0) ? 'icon icon-cross-icons' : 'icon icon-accept-approve1-ie'}></i></span></React.Fragment>
                                                                                                :
                                                                                                <div><b>Answer key:</b><br /><span>{val.value}</span></div>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                            : ''}
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className='row accFootRow1'>
                                                            <div className='col-md-6 col-sm-12 '>
                                                                <div className=''>
                                                                    {/* <h4 className='crtdByH'><b>Created by:</b> {props.original.created_by}</h4> */}
                                                                </div>
                                                            </div>
                                                            <div className='col-md-6 col-sm-12'>
                                                                <ul className="subTasks_Action__">
                                                                    <li className="d-none"><span className="sbTsk_li">Question Analytics</span></li>
                                                                    <li className=""><span className="sbTsk_li" onClick={(e) => this.archiveHandle(props.original.id, props.original.applicant_on_que)}>Archive Question</span></li>
                                                                    {(this.permission.access_recruitment_admin) ?
                                                                        <li ><span className="sbTsk_li" onClick={(e) => this.setState({ 'editQuesId': props.original.id, showadd: true })}>Edit Question</span></li> : ''}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                {this.state.showadd ? <AddQuestion showadd={this.state.showadd} handleAddClose={this.handleAddClose} interviewType={categoryId} question={this.state.question} questionId={this.state.editQuesId} /> : ''}
                < QuestionAnalytics question={this.state.question} show={this.state.QuestionAnalyticsModal} close={() => { this.setState({ QuestionAnalyticsModal: false }) }
                } />
                { this.renderPreviewFormModal() }

            </React.Fragment >
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

const GroupInterviewQuestionData = connect(mapStateToProps, mapDispatchtoProps)(GroupInterviewQuestion);
export { GroupInterviewQuestionData as GroupInterviewQuestion };
