import React, { Component } from 'react';
import Select from 'react-select-plus';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import { ROUTER_PATH, PAGINATION_SHOW } from 'config.js';
import { checkItsNotLoggedIn, postData, reFreashReactTable, archiveALL } from 'service/common.js';
import Pagination from "service/Pagination.js";
import moment from "moment";
import {  toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js';
import { duplicateStatus } from 'dropdown/recruitmentdropdown';
import {defaultSpaceInTable} from 'service/custom_value_data.js';
import { connect } from 'react-redux'



const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentApplicant/get_duplicate_requirement_applicants', Request).then((result) => {
        
            if(result.status){
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    all_count:result.all_count,
                };
                resolve(res);
             }
        });
    });
};
const colorClass ={'Accepted':'clr_green','Rejected':'clr_red','Pending':'clr_yellow'};

class DuplicateApplicants extends Component {

    constructor() {
        super();
        checkItsNotLoggedIn(ROUTER_PATH);
        this.state = {
            InterviewType: '',
            search: '',
            filter_var: 1,
            duplicateList: [],
            filtered: { filter_by: '1', srch_box: '' },
            showButton:{},
            editRelevantNotes:{},
        }
        this.reactTable = React.createRef();
    }

    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState({[key]:value},()=>{
            this.setTableParams();
        });
    }
    setTableParams(){
        this.setState({
            ...this.state,
            search:this.state.search.trim(),
            filtered:{...this.state.filtered,srch_box:this.state.search.trim(),filter_by:this.state.filter_var},
        });
    }
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
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
                duplicateList: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
                editRelevantNotes:{}
            });
        })
    }
    takeEditRelevantNotes = (id,type,relN) =>{
        let statusType = type==1 ? true:false;
        let steteData = this.state.editRelevantNotes;

        steteData[id] = {status:statusType,text:relN,editContent:relN};
        this.setState({...this.state,editRelevantNotes:steteData});
    }

    changeRelevantNotes = (e,id) =>{
        let steteData = this.state.editRelevantNotes;
        let data = steteData[id];
        data['editContent'] = e.target.value;
        this.setState({...this.state,editRelevantNotes:{...this.state.editRelevantNotes,[id]:data}});
    }

    updateRelevantNotes = (id,appId) =>{
        var postData= {};
        let steteData = this.state.editRelevantNotes;
        let data = steteData.hasOwnProperty(id) ?steteData[id]:'';
        let noteData = data!='' && typeof(data)=='object' && data!=null && data.hasOwnProperty('editContent') ? data.editContent : ''; 
        postData['id'] = id;
        postData['relevant_note'] = noteData ;
        postData['applicationNumber'] = appId ;
        let msg = 'Are you sure, you want to save this relevant note?';
        archiveALL(postData,msg,'recruitment/RecruitmentApplicant/update_duplicate_application_relevant_note').then((result) => {
            if(result.status){
                reFreashReactTable(this, 'fetchData');
            }else{
                if(result.hasOwnProperty('error') || result.hasOwnProperty('msg')){
                    let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg :'')); 
                     toast.error(<ToastUndo message={msg} showType={'e'} />, {
                         position: toast.POSITION.TOP_CENTER,
                          hideProgressBar: true
                    })
                 }
            }
        });
        /* let steteData = this.state.editRelevantNotes;
        let data = steteData[id];
        data['editContent'] = e.target.value;
        this.setState({...this.state,editRelevantNotes:{...this.state.editRelevantNotes,[id]:data}}); */
    }
    

    takeAction = (type,id,appId,currentApplicant)=>{
        let showarchiveALL = false;
        var data= {};
        data['id'] = id;
        data['applicationNumber'] = appId ;
        if(type=='accept'){
            let steteData = this.state.showButton;
            steteData[id] = true;
            this.setState({...this.state,showButton:steteData});
        } else if(type=='reject'){
            data['status'] ='reject' ;
            var msg = 'Are you sure, you want to reject this application?';
            showarchiveALL = true;
        } else if(type=='accept_addnem'){
            data['status'] ='accept_addnem' ;
            var msg = 'Are you sure, this will add this position to the list of Position the applicant has applied for?';
            showarchiveALL = true;

        } else if(type=='accept_editexisting'){
            data['status'] ='accept_editexisting' ;
            var msg = 'Are you sure, you want to accept this application and modify existing application?';
            showarchiveALL = true;
        }

        if(showarchiveALL){

            archiveALL(data,msg,'recruitment/RecruitmentApplicant/update_duplicate_application_status').then((result) => {
                if(result.status && type=='accept_editexisting'){
                    window.location = ROUTER_PATH + 'admin/recruitment/applicant/'+currentApplicant;
                }else if(result.status){
                    reFreashReactTable(this, 'fetchData');
                }else{
                   if(result.hasOwnProperty('error') || result.hasOwnProperty('msg')){
                      let msg = (result.hasOwnProperty('error') ? result.error : (result.hasOwnProperty('msg') ? result.msg :'')); 
                       toast.error(<ToastUndo message={msg} showType={'e'} />, {
                           position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                      })
                   }
                }
            });
        }

    }

    
    render() {

        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two', clearableValue: false }
        ];
        return (
            <React.Fragment>


                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1> {this.props.showPageTitle}


                        </h1>
                    </div>
                </div>
                {/* row ends */}
                <form onSubmit={(e) => this.submitSearch(e)}  method="post">
                <div className="row sort_row1-- after_before_remove flex-wrap">
                    <div className="col-lg-9 col-md-8 col-sm-12 no_pd_l">
                        <div className="search_bar right srchInp_sm actionSrch_st">
                            <input type="text" className="srch-inp" placeholder="Search.." onChange={(e) => this.setState({search: e.target.value})} value={this.state.search}/>
                            <i className="icon icon-search2-ie" onClick={(e) => this.submitSearch(e)}></i>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-12 no_pd_r pl-xs-0">
                        <div className="filter_flx">

                            <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                                <Select name="view_by_status"
                                    required={true} simpleValue={true}
                                    searchable={false} 
                                    clearable={false}
                                    placeholder="Show All"
                                    options={duplicateStatus()}
                                    onChange={(e) => this.filterChange('filter_var',e)}
                                    value={this.state.filtered.filter_by}

                                />
                            </div>

                        </div>
                    </div>

                </div>
                </form>
                {/* row ends */}


                <div className="row mt-5">


                    <div className="col-sm-12 no_pd_l Req-Duplicate-Applicant_tBL">

                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">

                            <ReactTable
                                columns={[
                                    {
                                        // Header: "Name:",
                                        accessor: "FullName",
                                        minWidth: 80,
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        Header: () =>
                                            <div>
                                                <div className="ellipsis_line1__">Name</div>
                                            </div>
                                        ,
                                        className:'_align_c__',
                                        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
                                    },
                                    {
                                        // Header: "Current Job Position:",
                                        accessor: "job_position",
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        Header: () =>
                                            <div>
                                                <div className="ellipsis_line1__">Current Job Position</div>
                                            </div>
                                        ,
                                        className:'_align_c__',
                                        Cell: props => <span>{props.original.hasOwnProperty('job_position') && props.original.job_position!='' && props.original.job_position!=undefined ?props.original.job_position:''}</span>,
                                     
                                    },
                                    {
                                        // Header: "Recruitment Area:",
                                        accessor: "recruitment_area",
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        Header: () =>
                                            <div>
                                                <div className="ellipsis_line1__">Service Area</div>
                                            </div>
                                        ,
                                        className:'_align_c__',
                                        Cell: props => <span>
                                                {props.original.hasOwnProperty('recruitment_area') && props.original.recruitment_area!='' && props.original.recruitment_area!=undefined ?props.original.recruitment_area:''}

                                        </span>
     
                                      
                                    },
                                    { Header: "Date Applied",
                                     accessor: "date_applide",
                                     headerClassName: '_align_c__ header_cnter_tabl',
                                     className:'_align_c__',
                                     Cell:(props) =>{
                                    let dateData = props.original.hasOwnProperty('date_applide') && props.original.date_applide!='' && props.original.date_applide!=undefined ? moment(props.original.date_applide).format("DD/MM/YYYY") : '';
                                    return ( <React.Fragment>{dateData}</React.Fragment>)
                                }
                                },
                                    {
                                        Header: "Request Status",
                                        accessor: "duplicate_application_status",
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        className:'_align_c__',
                                        minWidth: 100,
                                        Cell: (props) => {
                                           
                                            return(
                                            <div>
                                                <span className={"slots_sp "+ (colorClass.hasOwnProperty(props.original.duplicate_application_status) ?colorClass[props.original.duplicate_application_status]:'clr_yellow')}>{props.original.duplicate_application_status}</span>
                                            </div>
                                        )}
                                    },
                                    {
                                        expander: true,
                                        Header: () => <strong></strong>,
                                     className:'_align_c__',
                                        width: 45,
                                        headerStyle: { border: "0px solid #fff" },
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
                                        }

                                    }

                                ]}
                                ref={this.reactTable}
                                data={this.state.duplicateList}
                                manual="true"
                                PaginationComponent={Pagination}
                                showPagination={this.state.duplicateList.length > PAGINATION_SHOW ? true : false}
                                filtered={this.state.filtered}
                                defaultFilter={this.state.filtered}
                                defaultSorted={[
                                    {
                                      id: "date_applide",
                                      desc: true
                                    }
                                  ]}
                                pages={this.state.pages}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                loading={this.state.loading}
                                onFetchData={this.fetchData}
                                noDataText="No duplicate applicant found"
                                defaultPageSize={10}
                                minRows={2}
                                className="-striped -highlight"
                                collapseOnDataChange={false}

                                SubComponent={(props) =>
                                    <DuplicateApplicantExpander {...props} showButton={this.state.showButton} takeAction={this.takeAction}  pstate={this.state} takeEditRelevantNotes={this.takeEditRelevantNotes} changeRelevantNotes ={this.changeRelevantNotes} updateRelevantNotes={this.updateRelevantNotes} />
                                } 
                                //getTrGroupProps={TrGroupProps}
                            />

                        </div>
                        <ul className="legend_ulBC small">

                        {Object.entries(colorClass).map(
                            ([key, value]) => { return ( <li key={key}><span className={"leg_ic "+ value}></span>{key}</li>); }
                        )}
                           
                        </ul>

                    </div>



                </div>
                {/* row ends */}


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

export default connect(mapStateToProps, mapDispatchtoProps)(DuplicateApplicants);

class DuplicateApplicantExpander extends Component {
    state = {
    
    }


    render() {
        let currentJobPossition = this.props.original.current_job_possition.split('@__@@__@');
        let FullNameData = this.props.original.hasOwnProperty('FullName') &&  this.props.original.FullName!='' && this.props.original.FullName!=undefined ?this.props.original.FullName:'NA';
        let appIdData = this.props.original.hasOwnProperty('appId') &&  this.props.original.appId!='' && this.props.original.appId!=undefined ?this.props.original.appId:'';
        let idData = this.props.original.hasOwnProperty('id') &&  this.props.original.id!='' && this.props.original.id!=undefined ?this.props.original.id:0;
        let phoneData = this.props.original.hasOwnProperty('phone') &&  this.props.original.phone!='' && this.props.original.phone!=undefined ?this.props.original.phone:'NA';
        let emailData = this.props.original.hasOwnProperty('email') &&  this.props.original.email!='' && this.props.original.email!=undefined ?this.props.original.email:'NA';
        let duplicateStatusData = this.props.original.hasOwnProperty('duplicate_application_status') &&  this.props.original.duplicate_application_status!='' && this.props.original.duplicate_application_status!=undefined ?this.props.original.duplicate_application_status:'';
        let duplicateIdData = this.props.original.hasOwnProperty('currentApplicant') &&  this.props.original.currentApplicant!='' && this.props.original.currentApplicant!=undefined ?this.props.original.currentApplicant:'';
        let currentApplicantStatus = this.props.original.hasOwnProperty('current_applicant_status') &&  this.props.original.current_applicant_status!='' && this.props.original.current_applicant_status!=undefined ?this.props.original.current_applicant_status:'';
        return (
            <div className='tBL_Sub applicant_info1 fl_aplis'>

                <div className="row bor_l_cols">
                    <div className="col-lg-3 col-md-4 col-sm-12 col-xs-12 bb-xs-1 pb-xs-3 br-xs-0">
                        <h4 className="mb-m-2 flg_ap_hd"><strong>{FullNameData}</strong>&nbsp;({appIdData!=''? appIdData:'NA'})</h4>
                        <div>
                            <h5 className="mb-m-1"><strong>Phone : </strong>{phoneData}</h5>
                            <h5 className="mb-m-1"><strong>Email : </strong><span className="brk_all">{emailData}</span></h5>
                        </div>

                    </div>
                    {/* col-lg-3 ends */}
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12  pt-xs-3 br-xs-0 bb-xs-1">
                        <div className="pb-2"><h5 className="mb-m-1"><strong>Status : </strong><span className='Def_btn_01 my-3 Def_btn_01'>{currentApplicantStatus}</span></h5>
                        </div>
                        <h5 className="mb-m-1"><strong>Job Applications: </strong></h5>
                        <ul className="appli_ul_14">
                            {currentJobPossition.map((applis, i) => {
                                let applisData =  applis.split('@__@BR@__@');
                                return (
                                    <React.Fragment key={i}>
                                    <li className="d-grid auto_1fr_1fr" key={i}><span>{i + 1}</span> <span>{applisData[0]}</span> <span>{applisData[1]}</span></li>
                                    </React.Fragment>
                                )
                            })}
                        </ul>
                    </div>
                    {/* col-lg-2 ends */}

                    <div className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
                        {duplicateStatusData!='Pending' ? (<React.Fragment />) : 
                        (<React.Fragment ><div className="mt-m-2 lnkie_sp">
                            <Link to={'#'} className="">
                                <span className="slots_sp clr_green" onClick={()=>this.props.takeAction('accept',idData,appIdData,0)}>Accept</span></Link>
                            <Link to={'#'}>
                                <span className="slots_sp clr_red" onClick={()=>this.props.takeAction('reject',idData,appIdData,0)}>Reject</span>
                            </Link>
                        </div>
                        <div className="pd-lr-4 mt-2 mb-m-1" style={{display:this.props.showButton[idData] ?'block':'none' }}>
                            <span className=" cmn-btn1 sp_btn_p" onClick={()=>this.props.takeAction('accept_addnem',idData,appIdData,0)}>
                                <span>Add to current applications </span>
                                <i className="icon icon-add-icons"></i>
                            </span>
                        </div>
                        <div className="pd-lr-4 mb-1" style={{display:this.props.showButton[idData] ?'block':'none' }} >
                            <span className=" cmn-btn1 sp_btn_p" onClick={()=>this.props.takeAction('accept_editexisting',idData,appIdData,duplicateIdData)}>
                                <span>Modify existing application </span>
                                <i className="icon icon-edit5-ie"></i>
                            </span>
                        </div> </React.Fragment>) }
                    </div>
                    {/* col-lg-2 ends */}

                    <div className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
                        <h5 className="mb-m-1"><strong>Relevant Notes: </strong></h5>
                        { (this.props.pstate.editRelevantNotes[idData] && this.props.pstate.editRelevantNotes[idData].hasOwnProperty('status') && this.props.pstate.editRelevantNotes[idData].status) ? (<div>
                            <div className="mt-m-1"><textarea rows="3" className="w-100" value={(this.props.pstate.editRelevantNotes[idData] && this.props.pstate.editRelevantNotes[idData].hasOwnProperty('status') && this.props.pstate.editRelevantNotes[idData].status && this.props.pstate.editRelevantNotes[idData].hasOwnProperty('editContent')) ? this.props.pstate.editRelevantNotes[idData].editContent:'' } onChange={(e)=>this.props.changeRelevantNotes(e,idData)}></textarea></div>
                            <div className="mt-m-1">
                                <span className="under_l_tx pd-r-10 cursor-pointer" onClick={(e)=>this.props.takeEditRelevantNotes(idData,0,this.props.original.relevantNotes)}>Close</span>
                                <span className="short_buttons_01 mr-2 cursor-pointer" onClick={(e)=>this.props.updateRelevantNotes(idData,appIdData)}>Save Notes</span>
                            </div>
                        </div>):
                        (<div className="mt-1 ">
                            {
                                (this.props.original.relevantNotes.length > 200) ?
                                    <div className="cursor-pointer">
                                        <span onClick={(e)=>this.props.takeEditRelevantNotes(idData,1,this.props.original.relevantNotes)}>
                                            {
                                                (!this.state.showComp) ?
                                                    this.props.original.relevantNotes.substring(0, 200) + ' [...]'
                                                    :
                                                    this.props.original.relevantNotes
                                            }

                                        </span>

                                        <span className="vwMore_sp" onClick={() => { this.setState({ showComp: !this.state.showComp }) }}>
                                            View {(!this.state.showComp) ? 'More' : 'Less'}
                                        </span>
                                    </div>
                                    :
                                    <div className="" >
                                    {this.props.original.relevantNotes.length > 0 ? <div className="cursor-pointer" onClick={(e)=>this.props.takeEditRelevantNotes(idData,1,this.props.original.relevantNotes)}>{this.props.original.relevantNotes}</div>: (<span className="under_l_tx pd-r-10 cursor-pointer"  onClick={(e)=>this.props.takeEditRelevantNotes(idData,1,this.props.original.relevantNotes)}>Add Notes</span>)}
                                    </div>
                            }

                        </div>
                        )}
                        

                    </div>
                    {/* col-lg-2 ends */}
                </div>

                <div className="row">
                    <div className="bor_bot_b1 mt-1"></div>
                    <div className="col-sm-12 col-md-12 ">
                        <Link className="pd_l_15" to={ROUTER_PATH+'admin/recruitment/applicant/'+duplicateIdData}><button className="btn cmn-btn1 eye-btn mt-2">Applicant Information</button></Link>
                    </div>

                </div>

            </div>
        );
    }
}

const TrGroupProps = (props, rowInfo) => {
    if( typeof(rowInfo) == 'object' && typeof(rowInfo) != undefined &&  rowInfo.hasOwnProperty('index')){
        return{
            className: props.expanded.hasOwnProperty(rowInfo.index)  && props.expanded[rowInfo.index]? 'active' :''
        }
    }else{
        return {className:''};
    }
    
}