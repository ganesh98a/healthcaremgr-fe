import React, { Component } from 'react';
import Select from 'react-select-plus';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";


class PayRateApproval extends Component {

    constructor() {
        super();
        this.state = {
            InterviewType: '',
            filterVal: '',

           
        }
    }

    
    render() {

        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two', clearableValue: false }
        ];

        const data = [
            {
                name: 'Andrew Johnson',
                date: '02/03/03',
                recruiter: 'David Smith',
                position:'Disability Support Workers', 
                status:'new',
                applicants:['Residential Youth Workers', 'Disability Support'],
                relevantNotes:'Ac feugist sed lectus velibulum mattis '
            },
            {
                name: 'Lucas Pacheho',
                date: '02/03/03',
                recruiter: 'David Smith',
                position:'Residential Youth Workers',
                status:'pending',
                applicants:['Residential Youth Workers', 'Disability Support'],
                relevantNotes:'Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus'
            
            },
            {
                name: 'Harmen Porter',
                date: '02/03/03',
                recruiter: 'David Smith',
                position:'Disability Support Workers',
                status:'flagged',
                applicants:['Residential Youth Workers', 'Disability Support'],
                relevantNotes:'Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus'
            
            },
            {
                name: 'Martin Abasto',
                date: '02/03/03',
                recruiter: 'David Smith',
                position:'Disability Support Workers',
                status:'pending',
                applicants:['Residential Youth Workers', 'Disability Support'],
                relevantNotes:'Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus'
            
            },
            {
                name: 'Conan Matusov',
                date: '02/03/03',
                recruiter: 'David Smith',
                position:'Disability Support Workers',
                status:'pending',
                applicants:['Residential Youth Workers', 'Disability Support'],
                relevantNotes:'Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus'
            
            },
            {
                name: 'Andrew Johnson',
                date: '02/03/03',
                recruiter: 'David Smith',
                position:'Disability Support Workers',
                status:'new',
                applicants:['Residential Youth Workers', 'Disability Support'],
                relevantNotes:'Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus Ac feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectusAc feugist sed lectus velibulum mattis ullamcorperAc feugist sed lectus'
            
            }

        ];




        return (
            <React.Fragment>


                <div className="row pt-5">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1> Pay Scale Approvals

                           
                        </h1>
                    </div>
                </div>
                {/* row ends */}

                <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-9 col-md-8 col-sm-8 no_pd_l">
                        <div className="search_bar right srchInp_sm actionSrch_st">
                            <input type="text" className="srch-inp" placeholder="Search.." />
                            <i className="icon icon-search2-ie"></i>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-4 no_pd_r">
                        <div className="filter_flx">

                            <div className="filter_fields__ cmn_select_dv gr_slctB sl_center">
                                <Select name="view_by_status"
                                    required={true} simpleValue={true}
                                    searchable={false} Clearable={false}
                                    placeholder="Filter by: Unread"
                                    options={options}
                                    onChange={(e) => this.setState({ filterVal: e })}
                                    value={this.state.filterVal}

                                />
                            </div>

                        </div>
                    </div>

                </div>
                {/* row ends */}


                <div className="row mt-5">


                    <div className="col-sm-12 no_pd_l Pay-Rat-Approval_tBL">

                    <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                      




                            <ReactTable
                                columns={[
                                    {
                                        Header: "Name:",
                                        accessor: "name",
                                        minWidth: 80,
                                     
                                    },
                                    { Header: "Staff:", accessor: "recruiter" },
                                    { 
                                        Header: "Date Applied:", 
                                        accessor: "position",
                                        //  minWidth:100,
                                         Cell: (props) => (
                                            <div className="text-center text_ellip">
                                               {props.original.position}
                                            </div>

                                        )
                                    },
                                    { Header: "CAB Day Booked:", accessor: "date" },
                                    
                                    {
                                        Header: "Status:",
                                        accessor: "status",
                                        minWidth: 100,
                                        Cell: (props) => (
                                            <div>
                                                {
                                                    (
                                                        props.original.status == 'new' ? 
                                                        <span className="slots_sp clr_purple">New</span>
                                                    :
                                                        props.original.status == 'flagged'? 
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
                                            textAlign: "center",
                                            userSelect: "none"
                                        }

                                    }

                                ]}

                                defaultPageSize={3}
                                data={data}
                                pageSize={data.length}
                                showPagination={false}
                                className=""
                                SubComponent={(props) => 
                                    <FlaggedApplicantExpander {...props} />
                                }
                            />

                        </div>
                        <ul className="legend_ulBC small">
                            <li><span className="leg_ic clr_red"></span>Flagged</li>
                            <li><span className="leg_ic clr_yellow"></span>Pending</li>
                            <li><span className="leg_ic clr_purple"></span>New</li>
                        </ul>

                    </div>



                </div>
                {/* row ends */}


            </React.Fragment>
        );
    }
}

export default PayRateApproval;

class FlaggedApplicantExpander extends Component {
    state= {

    }
  
    render(){
      
        return(
            <div className='applicant_info1 fl_aplis'>
    
                <div className="row bor_l_cols">
                    <div className="col-lg-3 col-md-4 col-sm-12">
                        <h4 className="mb-m-2 flg_ap_hd"><strong>{this.props.original.name}</strong>&nbsp;(APP - 10844)</h4>
                        <div>
                            <h5 className="mb-m-1"><strong>Phone : </strong>04214 79713</h5>
                            <h5 className="mb-m-1"><strong>Email : </strong><span className="brk_all">ajonhston@gmail.com</span></h5>
                        </div>
                        <div>
                        <button className="btn cmn-btn1 eye-btn mt-1">Applicant CV</button>
                        </div>
                        <div>
                        <button className="btn cmn-btn1 eye-btn mt-1">Applicant Information</button>
                        </div>
                        
                    </div>
                    {/* col-lg-3 ends */}
                    <div className="col-lg-5 col-md-5 col-sm-12">
                        <h5 className="mb-m-1"><strong>Job Applications: </strong></h5>

                        <div className="Pay_S_Details">
	<div className="Pay_S_li Pay_head">
		<span><strong>Work Area:</strong></span>
		<span className="P_tdw"><strong>Level:</strong></span>
		<span className="P_tdw"><strong>Paypoint:</strong></span>
		<span className="P_tdw"></span>
	</div>
    
	<div className="Pay_S_li">
		<span>Social & Community Services </span>
		<span className="P_tdw Pay_line_1">2</span>
		<span className="P_tdw Pay_line_1">2</span>
		<span className="P_tdw"><a className="under_l_tx">Edit</a></span>
	</div>
    <div className="Pay_S_li">
		<span> </span>
		<span className="P_tdw Pay_line_1"></span>
		<span className="P_tdw Pay_line_1"></span>
		<span className="P_tdw"></span>
	</div>
	<div className="Pay_S_li">
		<span>Social & Community Services </span>
		<span className="P_tdw Pay_line_1">2</span>
		<span className="P_tdw Pay_line_1">2</span>
		<span className="P_tdw"><a className="under_l_tx">Edit</a></span>
	</div>
</div>
<Link to={'#'}>
                                <span className="slots_sp clr_green">Appove All</span>
                            </Link>


                    </div>
                    {/* col-lg-2 ends */}
                  

                    <div className="col-lg-4 col-md-3 col-sm-12">
                        <h5 className="mb-m-1"><strong>Relevant Notes: </strong></h5>
                        <div className="mt-m-2">
                            <textarea  rows="5" className="w-100"></textarea>
                        </div>
                        <div className="mt-m-2"><a className="under_l_tx pd-r-10" href="#">Clear</a>
                        <a href="#"><span className="btn cmn-btn1">Save Notes</span></a></div>
                       
                        
                    </div>
                    {/* col-lg-2 ends */}



                </div>
            </div>
        );
    }
}