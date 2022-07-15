import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Navigation from './../Navigation';
import { postData, handleChangeChkboxInput, changeTimeZone, archiveALL, reFreashReactTable } from 'service/common.js';
import QuestionAnalytics from './../QuestionAnalytics';
import AddQuestion from './AddQuestion';
import TrainingNavigation from './TrainingNavigation';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/Recruitment_question/get_questions_list', Request)
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

class GroupInterviewListing extends Component {
    constructor() {
        super();
        this.state = {
            showModal: false,
            trainingCategory: '',
            SelectTopic: '',
            SetStatus: '',
            SetQuesType: '',
            question_topic: '',
            QuestionAnalyticsModal: false,
            filterVal: '',
            ActiveClass: 'groupInterview',
            setUpIpad: false
        }

        this.reactTable = React.createRef();
    }

    componentDidMount() {

    }

    showModal = () => { this.setState({ showModal: true }) }
    closeModal = () => { this.setState({ showModal: false }) }
    handleAddClose = () => { this.setState({ showadd: false }); }
    handleAddShow = (val) => { this.setState({ showadd: true, mode: 'update', question: val }); }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
        ).then(res => {
            this.setState({
                shiftListing: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    archiveHandle = (questionId) => {
        archiveALL({id: questionId}, 'Are you sure want to archive', 'recruitment/Recruitment_question/delete_Question').then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchData');
            }
        })
    }

    handleQuestionAnalytics = (value) => {
        this.setState({
            QuestionAnalyticsModal: true,
            question: value
        })

    }

    render() {
        var options = [{ value: 'one', label: 'Option 1' }, { value: 'two', label: 'Option 2' }];

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>Training</h1>
                    </div>
                </div>
                
                <div className="row action_cont_row">
                  
                    <div className="col-lg-12 col-md-12 col-sm-12 no_pd_r noPd_l_ipd" >
                        <div className="tasks_comp ">
                            <div className="row">
                                <div className='col-lg-8 col-md-8 col-sm-8 mr_b_20'>
                                    <div className="search_bar left">
                                        <input type="text" className="srch-inp" placeholder="Search.." />
                                        <i className="icon icon-search2-ie"></i>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-4 col-sm-4 no_pd_r">

                                    <div className="filter_flx lab_vrt">
                                        <label>Filter by:</label>
                                        <div className="filter_fields__ cmn_select_dv">
                                            <Select name="view_by_status"
                                                simpleValue={true}
                                                searchable={false} Clearable={false}
                                                placeholder="Filter by: Unread"
                                                options={options}
                                                onChange={(e) => this.setState({ filterVal: e })}
                                                value={this.state.filterVal}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12">
                                    <div className="data_table_cmn dataTab_accrdn_cmn aplcnt_table hdng_cmn2 trainTable">
                                        <ReactTable
                                            columns={[
                                                { Header: "Question ID:", accessor: "id" },
                                                { Header: "Related Topic:", accessor: "topic" },
                                                { Header: "Status:", accessor: "status", Cell: props => <span className='status'>{props.value == "1" ? 'Active' : 'Inactive'}</span> },
                                                { Header: "Created by:", accessor: "Created" },
                                                { Header: "Last Updated:", accessor: "updated", filterable: false, Cell: props => <span>{changeTimeZone(props.value, 'DD/MM/YYYY')}</span> },
                                                {
                                                    expander: true,
                                                    Header: () => <strong></strong>,
                                                    width: 55,
                                                    headerStyle: { border: "0px solid #fff" },
                                                    Expander: ({ isExpanded, ...rest }) =>
                                                        <div className="rec-table-icon">
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
                                                    },
                                                }
                                            ]}
                                            ref={this.reactTable}
                                            data={this.state.shiftListing}
                                            onFetchData={this.fetchData}
                                            pageSize={this.state.pages}
                                            showPagination={false}
                                            SubComponent={(props) => <InterviewDetails {...props} handleAddShow={this.handleAddShow} archiveHandle={this.archiveHandle} handleQuestionAnalytics={this.handleQuestionAnalytics} />
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-12 TaskAccordion_col jobOpeningCol__">
                                    <button onClick={() =>
                                        this.setState({ showadd: true, mode: 'add' })} className="btn cmn-btn1 new_task_btn" >Create New Question</button>
                                </div>
                            </div>
                            {/* row ends */}
                        </div>
                        {/* tasks_comp ends */}
                    </div>
                    {/* cab day ends */}
                </div>
                {/* row ends */}

                <AddQuestion showadd={this.state.showadd} handleAddClose={this.handleAddClose} address={this.state.address} options={options} question={this.state.question} mode={this.state.mode} />

                {this.state.QuestionAnalyticsModal? <QuestionAnalytics question={this.state.question} show={this.state.QuestionAnalyticsModal} close={() => { this.setState({ QuestionAnalyticsModal: false }) }} />: ''}

            </React.Fragment>
        );
    }
}
export default GroupInterviewListing;

const InterviewDetails = (props) => {
    return (
        <div className='applicant_info1 training_info1'>
            <div className='trngBoxAc'>
                <div className='row '>
                    <div className='col-lg-6 col-md-6 col-sm-6'>
                        <h4><b>GI-Q{props.original.id}</b></h4>
                        <div className='qShwcse'>
                            <h4><b>Question</b></h4>
                            <p>{props.original.question}</p>
                        </div>
                    </div>
                    <div className='col-lg-6 col-md-6 col-sm-6 bor_left ans_colTr'>
                        <h4><b>Multiple Choice Answer:</b></h4>
                        <ul className='answrShw'>
                            {
                                props.original.answers.map((v, idx) => (
                                    <li key={'index' + idx} className={v.checked == 1 ? 'rightAnswer' : 'wrongAnswer'}><b> {v.lebel} :</b><span>{v.value}</span></li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
                {/* row ends */}
                <div className='row accFootRow1'>
                    <div className='col-md-6 col-sm-12 '>
                        <div className=''>
                            <h4 className='crtdByH'><b>Created by:</b> Jane Marciano ({changeTimeZone(props.original.created, 'DD/MM/YYYY LT')} )</h4>
                        </div>
                    </div>
                    <div className='col-md-6 col-sm-12'>
                        <ul className="subTasks_Action__">
                            <li onClick={() => { props.handleQuestionAnalytics(props.original.question) }}><span className="sbTsk_li">Question Analytics</span></li>
                            <li>
                                <a align="right" className="sbTsk_li" onClick={() => props.handleAddShow(props.original)} >Edit Question</a>
                            </li>

                            <li><a align="right" className="sbTsk_li" onClick={() => props.archiveHandle(props.original.id)}>archived Question</a></li>
                        </ul>
                    </div>
                </div>
                {/* row ends */}
            </div>
        </div>
    );
}    
