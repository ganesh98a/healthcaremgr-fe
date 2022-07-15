import React, { Component } from 'react';
import Select from 'react-select-plus';
import jQuery from "jquery";

import ReactTable from "react-table";
import {  toast } from 'react-toastify';
import { ToastUndo } from 'service/ToastUndo.js'
import {  postData, reFreashReactTable,archiveALL,downloadFile} from '../../../../service/common.js';
import { PayScaleStatus } from '../../../../dropdown/recruitmentdropdown.js';
import Pagination from "service/Pagination.js";
import { connect } from 'react-redux'
import { ROUTER_PATH,BASE_URL } from 'config.js';
import {defaultSpaceInTable} from 'service/custom_value_data.js';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });		
        postData('recruitment/RecruitmentDashboard/get_pay_scale_approval_applicant_list', Request).then((result) => {
           
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
class PayRateApproval extends Component {
    constructor() {
        super();
        this.state = {
            InterviewType: '',
            filtered: { filter_val: 0 },
            filter_val: 0,
            datalist: [],
        }
        this.reactTable = React.createRef();
        this.validate=''
    }

    handleShareholderNameChangeGrid = (subindex,index, fieldName, value)=> {        
        let stateLocal = {};
        let List = this.state.datalist;
        List[index]['work_area_options'][subindex][fieldName] = value			
        stateLocal['datalist'] = List;
        this.setState(stateLocal, () => {
            if( this.validate){
                jQuery("#pay_rate_approval").valid(); 
            }
        });
        
}

    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
        ).then(res => {
            this.setState({
                datalist: res.rows,
                //all_count: res.all_count,
                pages: res.pages,
                loading: false,
                //total_duration: res.total_duration
            });
            //this.props.getRecruitmentArea();
        })
    }

    filterChange = (value) => {
        this.setState({ filter_val: value, filtered: { search: this.state.search, filter_val: value } });
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setState({ filtered: { search: this.state.search, filter_val: this.state.filter_val } })
    }

    componentDidMount() {
		 postData('recruitment/RecruitmentDashboard/get_pay_scale_approval_work_area_options').then((result) => {            
			let filteredData = result.data;			
			this.setState(filteredData)			
        });
    }
		
	handleApprovedJobApplicants= (item,key,index,mode,type)=> { 
        jQuery("#pay_rate_approval").validate({ignore: [] });
            if (jQuery("#pay_rate_approval").valid()){
		        postData('recruitment/RecruitmentDashboard/update_pay_scale_approval_applicant_work_area',item).then((result) => {            
                    if(result.status){
                        this.handleShareholderNameChangeGrid(key, index,mode,0);
                        reFreashReactTable(this, 'fetchData');               
                    }else{
                        toast.error(<ToastUndo message={result.msg} showType={'e'} />, {                            
                            position: toast.POSITION.TOP_CENTER,
                            hideProgressBar: true
                        }); 
                    }
            });
        }else{
            this.validate=true;
        }
	}
	handleApprovedAllButton= (e,id)=> { 
        e.preventDefault();
        archiveALL({ id:id }, 'Are you sure want to Approval this pay rate', 'recruitment/RecruitmentDashboard/save_approved_pay_scale_approval_applicant').then((result) => {
            if (result.status) {
                reFreashReactTable(this, 'fetchData');
            } else {
                if (result.error) {
                    toast.dismiss();                    
                    toast.error(<ToastUndo message={result.error} showType={'e'} />, {                            
                        position: toast.POSITION.TOP_CENTER,
                        hideProgressBar: true
                    });
                }
            }
        });
    }
    handelRefreshReactTable = (e) => {
        reFreashReactTable(this, 'fetchData');
    }

    render() {
        return (
            <React.Fragment>
                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1> {this.props.showPageTitle}

                        </h1>
                    </div>
                </div>
                {/* row ends */}
                <div className="row sort_row1-- after_before_removeafter_before_remove">
                    <div className="col-lg-9 col-md-8 col-sm-8 no_pd_l">
                        <form method="post" onSubmit={this.submitSearch}>
                            <div className="search_bar right srchInp_sm actionSrch_st">
                                <input type="text" className="srch-inp" placeholder="Search.." name="search" onChange={(e) => this.setState({ search: e.target.value })} value={this.state.search} />
                                <i className="icon icon-search2-ie" onClick={(e) => this.submitSearch(e)}></i>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                        <div className="filter_flx">
                            <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                                <Select name="view_by_status"
                                    simpleValue={true}
                                    searchable={false} clearable={false}
                                    options={PayScaleStatus()}
                                    onChange={(e) => this.filterChange(e)}
                                    value={this.state.filter_val}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* row ends */}
                <div className="row mt-5">

                    <div className="col-sm-12 no_pd_l Req-Pay-Rat-Approval_tBL Tab_Overflow__">

                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">

                            <ReactTable
                                columns={[
                                    {
                                        accessor: "applicant",
                                        minWidth: 80,
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Name</div>
                                        </div>,
                                         className:'_align_c__',
                                         Cell: (props) => (
                                             <span>
                                                {defaultSpaceInTable(props.value)}
                                             </span>
                                         )

                                    },
                                    {
                                    accessor: "Recruiter",
                                    headerClassName: '_align_c__ header_cnter_tabl',
                                    Header: () =>
                                    <div>
                                        <div className="ellipsis_line1__">Staff</div>
                                    </div>,
                                     className:'_align_c__',
                                     Cell: (props) => (
                                         <span>
                                            {defaultSpaceInTable(props.value)}
                                         </span>
                                     )
                                     },
                                    {
                                        accessor: "date_applide",
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Date Applied</div>
                                        </div>
                                    ,
                                        className:'_align_c__',
                                        Cell: (props) => (
                                            <span>
                                               {defaultSpaceInTable(props.value)}
                                            </span>
                                        )


                                    },
                                    { 
                                        // Header: "CAB Day Booked:", 
                                        accessor: "cabday_booked",
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Date CAB Day Booked:</div>
                                        </div>,
                                         className:'_align_c__',
                                         Cell: (props) => (
                                             <span>
                                                {defaultSpaceInTable(props.value)}
                                             </span>
                                         )
                                     },

                                    {
                                        accessor: "status",
                                        minWidth: 100,
                                        headerClassName: '_align_c__ header_cnter_tabl',
                                        className:'_align_c__',
                                        Header: () =>
                                        <div>
                                            <div className="ellipsis_line1__">Status</div>
                                        </div>
                                    ,
                                        Cell: (props) => (
                                            <div>
                                                {
                                                    (
                                                        props.original.status == 1 ?
                                                            <span className="slots_sp clr_purple">Approved</span>
                                                            :
                                                            props.original.status == 'flagged' ?
                                                                <span className="slots_sp clr_red">Flagged</span>
                                                                :

                                                                <span className="slots_sp clr_yellow">Pending</span>
                                                    )
                                                }

                                            </div>
                                        )
                                    },


                                    {
                                        expander: true,
                                        Header: () => <strong></strong>,
                                        width: 45,
                                        headerStyle: { border: "0px solid #fff" },
                                        className:'_align_c__',

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
                                defaultPageSize={10}
                                data={this.state.datalist}
                                onFetchData={this.fetchData}
                                filtered={this.state.filtered}
                                pages={this.state.pages}
                                ref={this.reactTable}
                                collapseOnDataChange={false}
                                freezeWhenExpanded={false}
                                showPagination={true}
                                PaginationComponent={Pagination}
                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                nextText={<span className="icon icon-arrow-right next"></span>}
                                minRows={1}
                                loading={this.state.loading}
                                className="-striped -highlight"
                                SubComponent={(props) =>
                                    <FlaggedApplicantExpander {...props.original}
                                        work_area={this.state.work_area}
                                        pay_point={this.state.pay_point}
                                        pay_level={this.state.pay_level}
                                        handleShareholderNameChangeGrid={this.handleShareholderNameChangeGrid}
                                        handleApprovedJobApplicants={this.handleApprovedJobApplicants}
                                        handleApprovedAllButton={this.handleApprovedAllButton}
                                        mainindex={props.index}
                                        handelRefreshReactTable={this.handelRefreshReactTable}
                                    />
                                }
                            />
                        </div>
                        {/* <ul className="legend_ulBC small">
                            <li><span className="leg_ic clr_red"></span>Flagged</li>
                            <li><span className="leg_ic clr_yellow"></span>Pending</li>
                            <li><span className="leg_ic clr_purple"></span>New</li>
                        </ul> */}
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

export default connect(mapStateToProps, mapDispatchtoProps)(PayRateApproval);
class FlaggedApplicantExpander extends Component {
    constructor() {
        super();
        this.state = {

        }

    }
	savenote=(e)=>{
        e.preventDefault();
		var request={relevant_notes:this.state.relevant_notes,id:this.props.id}			
		postData('recruitment/RecruitmentDashboard/save_approved_pay_scale_approval_applicant_relevant_notes',request).then((result) => {			
            
            if(result.status){
				this.props.handelRefreshReactTable();
				////reFreashReactTable(this, 'fetchData');	
				this.setState({'edit_mode_notes':false})
			}else{
				toast.error(<ToastUndo message={"somthing went wrong"} showType={'e'} />, {                            
                    position: toast.POSITION.TOP_CENTER,
                    hideProgressBar: true
                });
            }
        });

    }

    componentDidMount = (newprops) => {
        this.setState({ relevant_notes: this.props.relevant_notes })
    }

    render() {        
        return (
            <div className='tBL_Sub applicant_info1 fl_aplis'>
                <form name="pay_rate_approval" id="pay_rate_approval" method="post">
                <div className="row bor_l_cols d-flex flex-wrap after_before_remove bor_l_cols_small">
                    <div className="col-lg-3 col-md-5 col-sm-12 br-xs-0">
                        <h4 className="mb-m-2 flg_ap_hd"><strong>{this.props.applicant}</strong>&nbsp;({this.props.appId})</h4>
                        <div>
                            <h5 className="mb-m-1"><strong>Phone : </strong>{this.props.phone}</h5>
                            <h5 className="mb-m-1"><strong>Email : </strong><span className="brk_all">{this.props.email}</span></h5>
                        </div>

                        <div className="w-70 mt-2">
                        <div>
                        <a className="v-c-btn1 n2" target="_blank" disabled={this.props.attachment? false:true} onClick={() => this.props.attachment?downloadFile(BASE_URL + 'mediaShow/r/' + this.props.id + '/' + encodeURIComponent(btoa(this.props.attachment)),this.props.attachment):''}><span className="text-center">Applicant CV</span> <i className="icon icon-view1-ie"></i></a>
                        </div>
                        <div className="mt-1">
                        
                        <a className="v-c-btn1 n2" href={ROUTER_PATH + 'admin/recruitment/applicant/' + this.props.id}><span className="text-center">Applicant Information</span> <i className="icon icon-view1-ie"></i></a>
                        </div>
                        </div>

                    </div>
                    {/* col-lg-3 ends */}
                    <div className="col-lg-5 col-md-7 br-sm-0 col-sm-12 bt-xs-1 mt-xs-4 pt-xs-3">
                        <h5 className="mb-m-1"><strong>Pay Scale Requests: </strong></h5>
                        <div className="Pay_S_Details">

                            <div className="Pay_S_li Pay_head">
                                <span><strong>Work Area:</strong></span>
                                <span className="P_tdw"><strong>Level:</strong></span>
                                <span className="P_tdw"><strong>Paypoint:</strong></span>
                                <span className="P_tdw"></span>
                            </div>

                            {this.props.work_area_options.map((item, key) => ( 
                                <React.Fragment>
                                    <div className="Pay_S_li" key={key+1} style={{ display: item.edit_mode==1 ? 'flex':'none'}} >
                                        <span className="s-def1 s1">
                                            <Select name="work_area" className="default_validation" 
                                                required={true}
                                                simpleValue={true} searchable={false} clearable={false}
                                                value={item.work_area_id}
                                                onChange={(e) => this.props.handleShareholderNameChangeGrid(key, this.props.mainindex, 'work_area_id', e)}
                                                options={this.props.work_area} placeholder="Please Select" 
                                                inputRenderer={() => <input type="text"  className="define_input distinct_work_area" data-msg-notequaltogroup={"Please select different work area !"} data-rule-notequaltogroup='[".distinct_work_area"]' name={key+"work_area"} 
                                                required={'true'} value={item.work_area_id} />}
                                                />
                                        </span>

                                       
                                        <span className="P_tdw Pay_line_1">
                                            <div className="s-def1 s1 gr_slctB">
                                                <Select name="pay_level"
                                                    required={true}
                                                    simpleValue={true} searchable={false} clearable={false}
                                                    value={item.level_id}
                                                    onChange={(e) => this.props.handleShareholderNameChangeGrid(key, this.props.mainindex, 'level_id', e)}
                                                    options={this.props.pay_level} placeholder="Please Select" />
                                            </div>
                                        </span>
                                        <span className="P_tdw Pay_line_1">
                                            <span className="s-def1 s1 gr_slctB">
                                                <Select name="pay_point"
                                                    required={true}
                                                    simpleValue={true} searchable={false} clearable={false}
                                                    value={item.point_id}
                                                    onChange={(e) => this.props.handleShareholderNameChangeGrid(key, this.props.mainindex, 'point_id', e)}
                                                    options={this.props.pay_point} placeholder="Please Select" />
                                            </span>
                                        </span>
                                        
                                        <span className="P_tdw">
                                            <i className="icon icon-accept-approve2-ie" onClick={() => this.props.handleApprovedJobApplicants(item,key,this.props.mainindex,'edit_mode', 0)}></i>
                                            <i className="icon icon-close2-ie" onClick={() => this.props.handleShareholderNameChangeGrid(key, this.props.mainindex, 'edit_mode', 0)}></i>                                            
                            </span> 
                                    </div>

                                    
                                    <div className="Pay_S_li" key={key+1} style={{ display: item.edit_mode==1 ? 'none':'flex'}}>
                                        <span>{item.work_area}</span>                                        
                                        <span className="P_tdw Pay_line_1">{item.level_name}</span>
                                        <span className="P_tdw Pay_line_1">{item.point_name}</span>
                                        {this.props.status==1 ? <span className="P_tdw"></span> :
                                        <span className="P_tdw"><a className="under_l_tx" onClick={() => this.props.handleShareholderNameChangeGrid(key, this.props.mainindex, 'edit_mode', 1)} >Edit</a></span>
                                        }
                                    </div>
                                   
                            
                                </React.Fragment>
                            ))}
                            
                        </div>
                        <div className="col-lg-4 col-md-3 col-sm-12">
                            <span className="P_tdw Pay_line_1">
                            {this.props.status==1 ? '' :
                                <button  onClick={(e) => this.props.handleApprovedAllButton(e,this.props.id)} className="slots_sp clr_green" >Approve All</button>
                                    }
                            
                            </span></div>
                    </div>
                    {/* col-lg-2 ends */}
                    <div className="col-lg-4 col-md-12 col-sm-12 bt-sm-1 pt-sm-3 mt-sm-4">
                        <h5 className="mb-m-1"><strong>Relevant Notes: </strong></h5>
                        <div className="mt-m-2">
                            {this.state.edit_mode_notes ?
                                <React.Fragment>
                                    <textarea rows="5" name="relevant_task_note" data-rule-required='true' data-msg-required="Add Task Note"
                                        value={this.state.relevant_notes} onChange={(e) => this.setState({ 'relevant_notes': e.target.value })}
                                        className="w-100" wrap="soft" ></textarea>
                                    <div className="mt-m-2"><span className="under_l_tx pd-r-10 cursor-pointer"  onClick={(e) => this.setState({ 'relevant_notes': ''})} >Clear</span>
                                        <button className='btn cmn-btn1' onClick={(e) => this.savenote(e)} >Save Notes</button></div>	</React.Fragment>
                                :
                                <React.Fragment>

                                    <div>{this.state.relevant_notes}</div>
                                    {this.props.status==1 ? '' :
                            <span className="under_l_tx cursor-pointer" onClick={(e) => this.setState({ 'edit_mode_notes': true })} >Edit Relevant Notes</span>}</React.Fragment>}

                        </div>


                    </div>
                    {/* col-lg-2 ends */}
                </div>
                </form>
            </div>
        );
    }
}