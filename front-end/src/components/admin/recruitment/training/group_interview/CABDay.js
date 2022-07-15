import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import Select from 'react-select-plus';
import DatePicker from "react-datepicker";
import ManageCABModal from './ManageCABDayCheckAnswersModal';
import { ROUTER_PATH } from 'config.js';


class CABDay extends Component {
    constructor() {
        super();
        this.state = {

        }

    }




    render() {
        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two', clearableValue: false }
        ];
        

        const data = [
            {
                name: 'Group Interview',
                date: '02/03/03',
                status: 'progress',
                apliantDetail: [
                    {
                        apli_name: 'Santiago Valentin',
                        device_alloc: '00015',
                        dob: '03/08',
                        additional_ques: 'successful',
                        quiz: 'progress',
                        draft: 'successful',
                        apli_Status: 'progress'
                    },
                    {
                        apli_name: 'Santiago Valentin',
                        device_alloc: '00015',
                        dob: '03/08',
                        additional_ques: 'successful',
                        quiz: 'progress',
                        draft: 'successful',
                        apli_Status: 'progress'
                    },
                    {
                        apli_name: 'Santiago Valentin',
                        device_alloc: '00015',
                        dob: '03/08',
                        additional_ques: 'successful',
                        quiz: 'progress',
                        draft: 'successful',
                        apli_Status: 'progress'
                    },

                ]

            },
            // {
            //     name: 'Group Interview',
            //     date: '02/03/03',
            //     status: 'progress',

            // },
            // {
            //     name: 'Group Interview',
            //     date: '02/03/03',
            //     status: 'pending',

            // }
        ];
        

        return (
            <React.Fragment>               
                {/* row ends */}
                <div className="row">
                    <div className="col-lg-12 col-md-12 main_heading_cmn-">
                        <h1>Manage CAB Day</h1>
                    </div>
                </div>
                {/* row ends */}

                <div className="row sort_row1-- after_before_remove">
                    <div className="col-lg-6 col-md-7 col-sm-7 no_pd_l">
                        <div className=" cmn_select_dv srch_select12  vldtn_slct">

                            <Select
                                cache={false}
                                name="form-field-name"
                                clearable={false}
                                value={this.state.job_location}
                                placeholder='Search'
                                onChange={(e) => this.setState({ job_location: e })}
                                required={true}
                            />

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


                <div className="row">

                    <div className="col-sm-12">

                        <div className="data_table_cmn dataTab_accrdn_cmn tbl_flx2 ">

                            <ReactTable
                                columns={[
                                    {
                                        Header: "Name:",
                                        accessor: "name",
                                        // width: 200,
                                        Cell: (props) => (
                                            <div className="d_flex1 align-items-center">
                                                <div><h3><strong>{props.original.name}</strong>&nbsp;</h3></div>
                                                <div><h3><span>{props.original.date}</span>&nbsp;</h3></div>
                                                {
                                                    (
                                                        props.original.status == 'progress' ?
                                                            <span className="slots_sp clr_blue">In progress</span>
                                                            :
                                                            props.original.status == 'pending' ?
                                                                <span className="slots_sp clr_yellow">Pending</span>
                                                                :

                                                                <span className="slots_sp clr_red">Flagged</span>
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
                                className="dble_tble_Mg mnge_grp_Tble"
                                SubComponent={(props) =>
                                    <GroupInterviewDetail {...props} />
                                }
                            />

                        </div>
                    </div>
                    <ManageCABModal showModal={ this.state.CABday} closeModal={() => this.setState({ CABday: false })}/>
                </div>


            </React.Fragment>
        );
    }
}
export default CABDay;

class GroupInterviewDetail extends Component {
    render() {
        return (
            <div className="mngGrp_subComp">
                {/* {this.props.original.name} */}
                <div className="row mt_15p">
                    <div className="col-lg-3 col-md-4">
                        <h5><strong>Time/Duration</strong></h5>
                        <div className="row mt_15p">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <small className="smallwid_50"><strong>From:</strong></small>
                                    <DatePicker
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        dateFormat="h:mm A"
                                        timeCaption="Time"
                                        required={true}
                                        className="csForm_control clr2"
                                        autoComplete={'off'}
                                    />
                                </div>

                            </div>
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <small className="smallwid_50"><strong>To:</strong></small>
                                    <DatePicker
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        dateFormat="h:mm A"
                                        timeCaption="Time"
                                        required={true}
                                        className="csForm_control clr2"
                                        autoComplete={'off'}
                                    />
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
                                        ONCALL Training facility<div>- Training Room</div>
                                    </div>
                                </h6>
                            </div>
                            <div className="align-items-end d_flex1 pd_l_20p">
                                <h6 className="pd_l_20p fnt_15p">Total Applicants <strong>10</strong></h6>
                            </div>

                        </div>

                    </div>
                    <div className="col-md-4 col-lg-5">
                        <div className="st_dvice_bx disabled_1__">
                            <button className="btn cmn-btn1 set_up_btn">Set up device</button>
                            <div><small className="cmplte_sp txtclr_green">completed DD/MM/YYYY - 00:00 AM</small></div>
                        </div>
                    </div>
                </div>

                <div className="row mt_30p">
                    <div className="col-sm-12">
                        <ApplicantsDets {...this.props} />
                    </div>
                </div>

            

            </div>
        );
    }
}

class ApplicantsDets extends Component {
    render() {
        var optionsAP = [
            { value: '0', label: 'Pending' },
            { value: '1', label: 'Success' },
            { value: '2', label: 'UnSuccess' },
            { value: '3', label: 'In-Progress' },
            { value: '4', label: 'Parked' },
        ];
        return (
            <div className="data_table_cmn dataTab_accrdn_cmn tbl_flx2 header_center tble_2_clr">
                <ReactTable
                    columns={[
                        { Header: "Applicant Name:", accessor: "apli_name" },
                        { Header: "Device Allocation:", accessor: "device_alloc" },
                        { Header: "D.O.B:", accessor: "dob" },
                        {
                            Header: "Additional Questions",
                            accessor: "additional_ques",
                            Cell: (props) => (
                                <div className="">
                                    {
                                        (
                                            props.original.additional_ques == 'successful' ?
                                                <span className="slots_sp clr_green">Successful</span>
                                                :
                                                props.original.additional_ques == 'pending' ?
                                                    <span className="slots_sp clr_yellow">Pending</span>
                                                    :
                                                    <span className="slots_sp clr_red">Flagged</span>
                                        )
                                    }

                                </div>
                            )
                        },
                        {
                            Header: "Quiz",
                            accessor: "quiz",
                            Cell: (props) => (
                                <div className="">
                                    {
                                        (
                                            props.original.quiz == 'successful' ?
                                                <span className="slots_sp clr_green">Successful</span>
                                                :
                                                props.original.quiz == 'progress' ?
                                                    <span className="slots_sp clr_blue">Progress</span>
                                                    :
                                                    <span className="slots_sp clr_red">Flagged</span>
                                        )
                                    }

                                </div>
                            )
                        },
                        {
                            Header: "Draft Contract",
                            accessor: "draft",
                            Cell: (props) => (
                                <div className="">
                                    {
                                        (
                                            props.original.draft == 'successful' ?
                                                <span className="slots_sp clr_green">Successful</span>
                                                :
                                                props.original.draft == 'progress' ?
                                                    <span className="slots_sp clr_blue">Progress</span>
                                                    :
                                                    <span className="slots_sp clr_red">Flagged</span>
                                        )
                                    }

                                </div>
                            )
                        },
                        {
                            Header: "Applicant Status",
                            accessor: "apli_Status",
                            Cell: (props) => (
                                <div className="">
                                    {
                                        (
                                            props.original.apli_Status == 'successful' ?
                                                <span className="slots_sp clr_green">Successful</span>
                                                :
                                                props.original.apli_Status == 'progress' ?
                                                    <span className="slots_sp clr_blue">Progress</span>
                                                    :
                                                    <span className="slots_sp clr_red">Flagged</span>
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
                    data={this.props.original.apliantDetail}
                    pageSize={this.props.original.apliantDetail.length}
                    showPagination={false}
                    className=""
                    SubComponent={(props) =>
                        <div className="pd_lr_20p">
                            <div className="ap_dts_bx2__k____">

                                <div className="row ap_dts_padding">
                                    <div className="col-lg-3 br-1 border-black">
                                        <div className="">
                                            <div className="mb-m-1 header_CABDay">
                                                <span className="MG_inter_label"><strong>1. Review Quiz Results</strong></span>
                                                <span>
                                                    <span className="slots_sp clr_green">Successful</span>
                                                </span>
                                            </div>

                                            <div className="main_row_NA_Quiz mb-m-1 progress_color_01_ success_color_01_ danger_color_01_">
                                                <div className="heading_Na_Quiz">
                                                    Applicant Results:
			                                </div>
                                                <div className="row_NA_Quiz">
                                                    <a className="NA_btn active_NA_Quiz">N/A</a>
                                                    <a className="NA_btn">Mark Quiz</a>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="col-lg-6 br-1 border-black">
                                        <div className="">
                                            <div className="mb-m-1 header_CABDay">
                                                <span className="MG_inter_label"><strong>2. Mandatory Documents:</strong></span>
                                                <div className="my_wigh">
                                                <div className="s-def1 s1 req_s1">
                                                        <Select name="participant_assessment"
                                                            required={true}
                                                            simpleValue={true}
                                                            searchable={false}
                                                            clearable={false}
                                                            options={optionsAP}
                                                            value="1"
                                                            placeholder="Filter by: Unread"
                                                            className={'custom_select'} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row d-flex">
                                                <div className="col-md-6  br-1 border-black">
                                                    <p>For Review</p>
                                                    <div className="R_view_Div__">
                                                        <div className="R_view_List__">
                                                            <div className="R_view_text">1. Laculis urma id valutpat</div>
                                                            <div className="R_view_icons">
                                                                <i className="icon icon-view1-ie"></i>
                                                                <i className="icon icon-close2-ie"></i>
                                                                <i className="icon icon-accept-approve2-ie"></i>
                                                            </div>
                                                        </div>
                                                        <div className="R_view_List__">
                                                            <div className="R_view_text">2. Laculis urma id valutpat</div>
                                                            <div className="R_view_icons">
                                                                <i className="icon icon-view1-ie"></i>
                                                                <i className="icon icon-close2-ie"></i>
                                                                <i className="icon icon-accept-approve2-ie"></i>
                                                            </div>
                                                        </div>
                                                        <div className="R_view_List__">
                                                            <div className="R_view_text">3. Laculis urma id valutpat</div>
                                                            <div className="R_view_icons">
                                                                <i className="icon icon-view1-ie"></i>
                                                                <i className="icon icon-close2-ie"></i>
                                                                <i className="icon icon-accept-approve2-ie"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <p>Outstanding</p>
                                                    <div className="R_view_Div__">
                                                        <div className="R_view_List__">
                                                            <div className="R_view_text">4. Contact:</div>
                                                            <div className="R_view_icons">
                                                            </div>
                                                        </div>
                                                        <div className="R_view_List__">
                                                            <div className="R_view_text">5. App onboarding</div>
                                                            <div className="R_view_icons">
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="col-lg-3 ">
                                        <div className="disabled_1__">
                                            <div className="mb-m-1 header_CABDay">
                                                <span className="MG_inter_label"><strong>3. Review Quiz Results</strong></span>
                                                {/* <span className="slots_sp clr_blue">Successful</span> */}
                                                <div className="my_wigh">
                                                    <div className="s-def1 s1 req_s1">
                                                        <Select name="participant_assessment"
                                                            required={true}
                                                            simpleValue={true}
                                                            searchable={false}
                                                            clearable={false}
                                                            options={optionsAP}
                                                            value="1"
                                                            placeholder="Filter by: Unread"
                                                            className={'custom_select'} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="Con_list_grid progress_color_02_ success_color_02_ danger_color_02_">
                                                    <a className="btn_1_Contact">Generate Contract</a>
                                                    <a className="btn_1_Contact active">Conteract Signed!</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bt-1 border-black pt-3">
                                            <div className="mb-m-1">
                                                <span className="MG_inter_label"><strong>4. Review Quiz Results</strong></span>
                                            </div>
                                            <div className="Stage_Left_1 w-100">
                                                <div className="Time_Orient_div_">
                                                    <span>Successful Login:</span>
                                                    <span>
                                                        <a className="Onboard_btn y_colo">Yes</a>
                                                        <a className="Onboard_btn n_colo ml-3">No</a>
                                                    </span>
                                                </div>
                                                <div className="Time_Orient_div_ pt-2">
                                                    <span>Orientation Completed:</span>
                                                    <span className="Time_Orient_span_">
                                                        <div><label className="radio_F1">
                                                            <input type="radio" name="aboriginal_tsi" value="1" />
                                                            <span className="checkround"></span>
                                                        </label><span>Yes</span>
                                                        </div>
                                                        <div>
                                                            <label className="radio_F1">
                                                                <input type="radio" name="aboriginal_tsi" value="1" />
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
                                            <input type="checkbox" name="is_salary_publish" />
                                            <div className="chkLabs fnt_sm">No Show</div>
                                        </label>

                                        <label className="customChecks publ_sal ml-3">
                                            <input type="checkbox" name="is_salary_publish" />
                                            <div className="chkLabs fnt_sm">Flag Applicant</div>
                                        </label>
                                    </div>
                                    <div className="CAB_table_footer_div2_">
                                        <a className="CAB-btn">Stop</a>
                                        <a className="CAB-btn ml-3" disabled>Start</a>
                                    </div>

                                </div>





                            </div>
                        </div>
                    }
                />
            </div>
        );
    }
}