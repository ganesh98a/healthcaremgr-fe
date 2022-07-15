import React, { Component } from 'react';
import jQuery from "jquery";
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Navigation from './Navigation';
import { ToastContainer, toast } from 'react-toastify';
import { Panel, Button, ProgressBar, Modal, PanelGroup } from 'react-bootstrap';
import { postData, handleChangeChkboxInput, changeTimeZone, archiveALL, reFreashReactTable } from '../../../service/common.js';
import QuestionAnalytics from './QuestionAnalytics';
import SetUpIpadModal from './SetUpIpadModal';
import AddQuestion from './AddQuestion';
import TrainingNavigation from './TrainingNavigation';


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

class Training extends Component {
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
        archiveALL({ id: questionId }, 'Are you sure want to archive', 'recruitment/Recruitment_question/delete_Question').then((result) => {
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
        var options_trainging_category = [{ value: 1, label: 'Cab Day' }, { value: 2, label: 'iPad' }];
        var options_status = [{ value: 1, label: 'Active' }, { value: 2, label: 'Inactive' }];
        var options_type = [{ value: '0', label: 'Single Choice' }, { value: '1', label: 'Multiple Choice' }];


        const groupInterview = [
            { Question: 'GI-Q10', Topic: 'Fire Management', Status: 'Active', Created: 'Jane Marciano', Updated: '02/02/02' },
            { Question: 'GI-Q10', Topic: 'Fire Management', Status: 'Active', Created: 'Jane Marciano', Updated: '02/02/02' },
            { Question: 'GI-Q10', Topic: 'Fire Management', Status: 'Active', Created: 'Jane Marciano', Updated: '02/02/02' }
        ];

        const ipadDay = [
            { ipadId: 'IPad-107', allocated: 'Jimmy Smith', Status: 'Active', set: 'Jane Marciano', date: '02/02/02' },
            { ipadId: 'IPad-108', allocated: 'Jimmy Smith', Status: 'Active', set: 'Jane Marciano', date: '02/02/02' },
            { ipadId: 'IPad-109', allocated: 'Jimmy Smith', Status: 'Active', set: 'Jane Marciano', date: '02/02/02' }
        ];

        var ipadStatusOptions = [{ value: '1', label: 'Active' }, { value: '2', label: 'Inactive' }];


        return (
            <React.Fragment>

                <div className="row">
                    <div className="col-lg-12 col-md-12 no-pad back_col_cmn-">
                        <span onClick={(e) => window.history.back()} className="icon icon-back1-ie"></span>
                    </div>
                </div>
                {/* row ends */}
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>Training</h1>
                    </div>
                </div>
                {/* row ends */}
                <Navigation Active={'training'} />
                {/* row ends */}
                <div className="row action_cont_row">
                    <TrainingNavigation />

                    <div className="col-lg-10 col-md-10 col-sm-10 no_pd_r noPd_l_ipd">
                        <div className="tab-content">
                            <div role="tabpanel" className="tab-pane active" id="groupInterview">

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
                                                        required={true} simpleValue={true}
                                                        searchable={true} Clearable={false}
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
                                                        { Header: "Question ID:", accessor: "Question" },
                                                        { Header: "Related Topic:", accessor: "Topic" },
                                                        { Header: "Status:", accessor: "Status" },
                                                        { Header: "Created by:", accessor: "Created" },
                                                        { Header: "Last Updated:", accessor: "Updated" },
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
                                                    defaultPageSize={groupInterview.length}
                                                    data={groupInterview}
                                                    showPagination={false}
                                                    className="-striped -highlight"
                                                    SubComponent={() =>
                                                        <div className='applicant_info1 training_info1'>
                                                            <div className='trngBoxAc'>
                                                                <div className='row '>
                                                                    <div className='col-lg-6 col-md-6 col-sm-6'>
                                                                        <h4><b>GI-Q01</b></h4>
                                                                        <div className='qShwcse'>
                                                                            <h4><b>Question</b></h4>
                                                                            <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisienim ad minim veniam?</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-lg-6 col-md-6 col-sm-6 bor_left ans_colTr'>
                                                                        <h4><b>Single Answer:</b></h4>


                                                                        <div className='singleAnswer__'>
                                                                            <label>Answer:</label>

                                                                           


                                                                            <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna</p>
                                                                        </div>



                                                                    </div>

                                                                </div>
                                                                {/* row ends */}

                                                                <div className='row accFootRow1'>
                                                                    <div className='col-md-6 col-sm-12 '>
                                                                        <div className=''>
                                                                            <h4 className='crtdByH'><b>Created by:</b> Jane Marciano (01/01/01 - 3:42pm)</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-12'>

                                                                        <ul className="subTasks_Action__">
                                                                            <li><span className="sbTsk_li">Question Analytics</span></li>
                                                                            <li><span className="sbTsk_li">Edit Question</span></li>
                                                                            <li><span className="sbTsk_li">Archive Question</span></li>
                                                                        </ul>

                                                                    </div>
                                                                </div>
                                                                {/* row ends */}


                                                            </div>

                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                            {/* group Interview ends */}


                            <div role="tabpanel" className="tab-pane " id="cabDay">

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
                                                        required={true} simpleValue={true}
                                                        searchable={true} Clearable={false}
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
                                                    className="-striped -highlight"
                                                    SubComponent={(props) =>
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
                                                                            <li onClick={() => { this.handleQuestionAnalytics(props.original.question) }}><span className="sbTsk_li">Question Analytics</span></li>
                                                                            <li>
                                                                                <a align="right" className="sbTsk_li" onClick={() => this.handleAddShow(props.original)} >Edit Question</a>
                                                                            </li>

                                                                            <li><a align="right" className="sbTsk_li" onClick={() => this.archiveHandle(props.original.id)}>archived Question</a></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                                {/* row ends */}
                                                            </div>
                                                        </div>
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


                            <div role="tabpanel" className="tab-pane " id="ipad">

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
                                                        required={true} simpleValue={true}
                                                        searchable={true} Clearable={false}
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
                                                        { Header: "IPad ID:", accessor: "ipadId" },
                                                        { Header: "Allocated To:", accessor: "allocated" },
                                                        { Header: "Status:", accessor: "Status" },
                                                        { Header: "Set by:", accessor: "set" },
                                                        { Header: "Date:", accessor: "date" },
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
                                                    collapseOnDataChange={false}
                                                    data={ipadDay}
                                                    showPagination={false}
                                                    className="-striped -highlight"
                                                    SubComponent={() =>
                                                        <div className='applicant_info1 training_info1'>
                                                            <div className='trngBoxAc'>
                                                                <div className='row '>
                                                                    <div className='col-lg-4 col-md-4 col-sm-4'>

                                                                        <div className='qShwcse'>
                                                                            <h4><b>CAB Day Information</b></h4>
                                                                            <div className='CABinfo_lstBox__ '>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-4 col-xs-12'><strong>Date:</strong></div>
                                                                                    <div className='col-sm-8 col-xs-12'>01/01/2011</div>
                                                                                </div>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-4 col-xs-12'><strong>Time:</strong></div>
                                                                                    <div className='col-sm-8 col-xs-12'> 09:30 AM</div>
                                                                                </div>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-4 col-xs-12'><strong>Attendees:</strong></div>
                                                                                    <div className='col-sm-8 col-xs-12'>15</div>
                                                                                </div>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-4 col-xs-12'><strong>Run By:</strong></div>
                                                                                    <div className='col-sm-8 col-xs-12'>Roc Marciano</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-lg-5 col-md-5 col-sm-4 bor_left ans_colTr'>
                                                                        <div className='qShwcse'>
                                                                            <h4><b>IPad Information</b></h4>
                                                                            <div className='CABinfo_lstBox__ '>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-5 col-xs-12'><strong>Allocated To:</strong></div>
                                                                                    <div className='col-sm-7 col-xs-12'>Jimmy Smith</div>
                                                                                </div>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-5 col-xs-12'><strong>Attached Docs:</strong></div>
                                                                                    <div className='col-sm-7 col-xs-12'>
                                                                                        <div>Contract</div>
                                                                                        <div>Power Pres</div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className='row d-flex wordWrap'>
                                                                                    <div className='col-sm-5 col-xs-12'><strong>Members App Pin:</strong></div>
                                                                                    <div className='col-sm-7 col-xs-12'>Active</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-lg-3 col-md-4 col-sm-4 bor_left ans_colTr'>
                                                                        <div className='qShwcse'>
                                                                            <h4><b>Set Status</b></h4>
                                                                            <div className="filter_fields__ cmn_select_dv">
                                                                                <Select name="view_by_status"
                                                                                    required={true} simpleValue={true}
                                                                                    searchable={false} Clearable={false}
                                                                                    placeholder="Set Status"
                                                                                    options={ipadStatusOptions}
                                                                                    onChange={(e) => this.setState({ ipadstatus: e })}
                                                                                    value={this.state.ipadstatus}
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                {/* row ends */}

                                                                <div className='row accFootRow1'>
                                                                    <div className='col-md-6 col-sm-12 '>
                                                                        <div className=''>
                                                                            <h4 className='crtdByH'><b>Created by:</b> Jane Marciano (01/01/01 - 3:42pm)</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-12 text-right'>

                                                                        <button className='btn cmn-btn1 edt_ipad' onClick={() => { this.setState({ setUpIpad: true }) }}>Edit IPad Set-Up</button>

                                                                    </div>
                                                                </div>
                                                                {/* row ends */}


                                                            </div>

                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </div>




                                    </div>
                                </div>

                            </div>
                            {/* ipad ends */}
                        </div>
                    </div>
                    {/* col-lg-10 ends */}

                </div>
                {/* row ends */}

                <AddQuestion showadd={this.state.showadd} handleAddClose={this.handleAddClose} address={this.state.address} options={options} question={this.state.question} mode={this.state.mode} />

                <QuestionAnalytics question={this.state.question} show={this.state.QuestionAnalyticsModal} close={() => { this.setState({ QuestionAnalyticsModal: false }) }} />

                <SetUpIpadModal show={this.state.setUpIpad} close={() => { this.setState({ setUpIpad: false }) }} />
            </React.Fragment>
        );
    }
}
export default Training;
