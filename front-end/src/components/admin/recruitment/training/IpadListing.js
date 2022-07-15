import React, { Component } from 'react';
import jQuery from "jquery";
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import Navigation from './../Navigation';
import { ToastContainer, toast } from 'react-toastify';
import { Panel, Button, ProgressBar, Modal, PanelGroup } from 'react-bootstrap';
import { postData, handleChangeChkboxInput, changeTimeZone, archiveALL, reFreashReactTable } from 'service/common.js';
import QuestionAnalytics from './../QuestionAnalytics';
import SetUpIpadModal from './../SetUpIpadModal';
import AddQuestion from './AddQuestion';
import TrainingNavigation from './TrainingNavigation';
import { connect } from 'react-redux'



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
            setUpIpad:false
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
        archiveALL({id: questionId},'Are you sure want to archive', 'recruitment/Recruitment_question/delete_Question').then((result) => {

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
                                <h1>{this.props.showPageTitle}</h1>
                            </div>
                        </div>
                        {/* row ends */}
                      
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
                                                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
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
                                                                                ? <i className="icon icon-arrow-down icn_ar1" style={{fontSize:'13px'}}></i>
                                                                                : <i className="icon icon-arrow-right icn_ar1" style={{fontSize:'13px'}}></i>}

                                                                        </div>,
                                                                    style: {
                                                                        cursor: "pointer",
                                                                        padding: "0",
                                                                        textAlign: "center",
                                                                        userSelect: "none"
                                                                    },
                                                                }
                                                            ]}
                                                            collapseOnDataChange={false}
                                                            data={ipadDay}
                                                            pageSize={3}
                                                            showPagination={false}
                                                            className="-striped -highlight"
                                                            SubComponent={() =>
                                                                <div className='tBL_Sub  applicant_info1 training_info1'>
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

                                                                                <button className='btn cmn-btn1 edt_ipad' onClick={()=>{this.setState({setUpIpad:true})}}>Edit IPad Set-Up</button>
                                                                                
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
                        {/* row ends */}
                   
                <AddQuestion showadd={this.state.showadd} handleAddClose={this.handleAddClose} address={this.state.address} options={options} question={this.state.question} mode={this.state.mode} />
                
                <SetUpIpadModal show={this.state.setUpIpad} close={()=>{this.setState({setUpIpad:false})}} />
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

export default connect(mapStateToProps, mapDispatchtoProps)(GroupInterviewListing);

