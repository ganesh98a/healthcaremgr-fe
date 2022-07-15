import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import 'react-table/react-table.css';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { ROUTER_PATH } from '../../../../../config.js';
import CrmPage from '../../CrmPage';
import Select from 'react-select-plus';
import ScrollArea from "react-scrollbar";
import { postData } from '../../../../../service/common.js';
import { plan_list } from '../../actions/CrmParticipantAction.js';
import { connect } from 'react-redux'

class ProspectiveParticipantFunding extends Component {
    constructor(props, context) {
        super(props, context);
        this.participantDetailsRef = React.createRef();
        this.state = { participant_id: this.props.props.match.params.id,
        selectedType: { value: '1', label: 'Active' },
        all_participant_plan_list:[],
        singlePlan:[],
        selectedPlanType:''
       };

    }

    componentDidMount() {

        this.setState({ participant_id: this.props.props.match.params.id, selectedType: { value: '1', label: 'Active' } });
        this.participantDetailsRef.current.wrappedInstance.getParticipantDetails(this.props.props.match.params.id);
        this.getNdisService(this.props.props.match.params.id);
        this.props.plan_list({ participant_id: this.props.props.match.params.id }).then(json => {
           if(json.status){
             this.setState({all_participant_plan_list:json.data});
           }
       });
        //this.listPlanData(1);
        //this.selectedPlanShow(1);
        // console.log(this.props);
        // console.log(this.state);
    }

    getNdisService = (crmParticipantId, planId = '') => {
        var data = { crm_participant_id: crmParticipantId, planId }
        postData('crm/CrmParticipant/get_ndis_services_p_participant_id', data).then((result) => {
            if (result) {
                this.setState({ ndisServeices: result.data });
            }
        });
    }
    listPlanData = (type) => {
        this.props.plan_list({ participant_id: this.props.props.match.params.id, status: type }).then(json => {
           if(json.status){
             this.setState({all_participant_plan_list:json.data});
           }
       });
      this.setState({ selectedType: type });
    }
    selectedPlanShow = (selectedId) => {

      // console.log('entered');
      //   console.log(this.state.all_participant_plan_list);
      //   console.log(selectedId);
        //this.getNdisService(this.props.props.match.params.id, selectedId);
        let singlePlan = {};
        let planIds = [];
        const plan = this.state.all_participant_plan_list;
        const state1 = this.state.singlePlan;
        for (let i = 0; i < this.state.all_participant_plan_list.length; i++) {
            if (plan[i].id == selectedId) {
                state1['id'] = plan[i].id;
                state1['plan_name'] = plan[i].plan_name;
                state1['plan_type'] = plan[i].plan_type;
                state1['start_date'] = plan[i].start_date;
                state1['end_date'] = plan[i].end_date;
                state1['total_funding'] = plan[i].total_funding;
                state1['fund_used'] = plan[i].fund_used;
                state1['remaing_fund'] = plan[i].remaing_fund;
                state1['status'] = plan[i].status;
                state1['planIds'] = { value: plan[i].id, label: 'Plan id #:' + plan[i].id };
            }
        }
        this.setState({ selectedPlanType: selectedId });
        this.getNdisService(this.props.props.match.params.id,selectedId);
        this.setState({ state1 });
    }


    render() {

        var planIdoptions = this.props.planIds;

        var options = [
            { value: '', label: 'All' },
            { value: '0', label: 'Archive' },
            { value: '1', label: 'Active' }
        ];

        const columns = [{
            Header: 'Plan id',
            accessor: 'id',
            headerClassName: 'Th_class_d1 _align_c__',
            minWidth: 95,
            className: 'Tb_class_d1',
            Cell: props => <span className="h-100" style={{ justifyContent: 'center' }}>
                <div>
                    {props.value}
                </div>
            </span>
        }, {
            Header: props => <span>Plan Name</span>,
            accessor: 'plan_name',
            headerClassName: 'Th_class_d1 _align_c__',
            className: 'Tb_class_d1',
            Cell: props => <span className="h-100" style={{ justifyContent: 'center' }}>
                <div>
                    {props.value}
                </div>
            </span>
        },
        {
            Header: props => <span>Start Date</span>,
            accessor: 'start_date',
            headerClassName: 'Th_class_d1 _align_c__',
            className: 'Tb_class_d1',
            Cell: props => <span className="h-100" style={{ justifyContent: 'center' }}>
                <div>
                    <div className=""><strong>Start Date:  </strong> <span>  {props.value}</span></div>
                </div>
            </span>
        },
        {
            headerClassName: 'Th_class_d1 _align_c__',
            className: 'Tb_class_d1',

            Header: props => <div className=" d-flex justify-content-between sed_set_0_">
                <div className=""><span>End Date</span></div>
                <div className=""><span>View Details</span></div>
            </div>,
            accessor: 'end_date',
            Cell: prop => <div>
                <div className=" d-flex justify-content-between sed_set_0_">
                    <div className=""><strong>End Date:  </strong> <span>{prop.value}</span></div>
                    <div className=""><i className="icon icon-view2-ie color" title="View" onClick={() => this.selectedPlanShow(prop.original.id)}></i></div>
                </div>
            </div>

        }]

        const now = 60;
        const nownew = 12;
        const startdate = 0;
        return (
            <div className="container-fluid">
                <CrmPage ref={this.participantDetailsRef} pageTypeParms={'prospective_participant_funding'} />
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <div className="py-4 bb-1">
                            <span className="back_arrow">
                                <Link to={ROUTER_PATH + 'admin/crm/prospectiveparticipants'}><span className="icon icon-back1-ie"></span></Link>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12  col-md-12">
                        <div className="row d-flex py-4">
                            <div className="col-md-6 align-self-center">
                                <div className="h-h1 ">
                                    {this.props.showPageTitle}
                                </div>
                            </div>

                        </div>

                        <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
                    </div>
                </div>


                <div className="row">

                    <div className="col-lg-12 col-sm-12">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="py-3" style={{ fontSize: '22px' }}><strong>NDIS:</strong> #{(this.state.ndisServeices) ? this.state.ndisServeices.ndis_num : ''}</div>
                            </div>
                            <div className="col-md-12">
                                <div className="shift_h1 py-2 by-1">Plan</div>
                            </div>
                        </div>
                        <div className="row d-flex my-4">
                            <div className="col-md-9 col-sm-9 col-xs-6 align-self-end">
                                <div className="PPartt_d1_txt_1 mt-4 mb-2"><strong>Plan Details</strong></div>
                            </div>
                            <div className="col-md-3 col-sm-3 col-xs-6">
                                {/* <div className="s-def1 s1 mt-3"> */}
                                {/* <div className="filter_flx">

                                    <div className="filter_fields__ cmn_select_dv gr_slctB sl_center"> */}
                                        <Select
                                            name="form-field-name"
                                            value={this.state.selectedType}
                                            options={options}
                                            onChange={(e) => this.listPlanData(e.value)}
                                            clearable={false}
                                            searchable={false}
                                        />
                                    {/* </div>
                                </div> */}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 Crm_Funding_Details_tBL">
                                <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                    <ReactTable
                                        data={this.state.all_participant_plan_list}
                                        columns={columns}
                                        onPageSizeChange={this.onPageSizeChange}
                                        defaultPageSize={5}
                                        className='-striped -highlight'
                                        showPagination={false} />
                                </div>

                            </div>
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-12">
                                <div className="shift_h1 py-2 by-1">Funds Breakdown</div>
                            </div>
                        </div>

                        <div className="row d-flex mt-5">
                            <div className="col-md-6 br-1 pr-5">
                                <div className="w-80 mb-4 sLT_gray left left-aRRow">{/* console.log(this.state.planIds) */}
                                    <Select
                                        name="form-field-name"
                                        value={(this.state.selectedPlanType)}
                                        options={planIdoptions}
                                        onChange={(e) => this.selectedPlanShow(e.value)}
                                        clearable={false}
                                        searchable={false}
                                    />
                                </div>
                                <div className="Partt_d1_txt_1 py-2"><strong>{(this.state.singlePlan) ? this.state.singlePlan.plan_name : ''}</strong> </div>
                                <div className="Partt_d1_txt_1 py-2 pb-3"><strong>Participant Plan Type: </strong> <span>{(this.state.singlePlan) ? 'Portal Managed' : ''}</span></div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="Partt_d1_txt_2 my-3"><strong>Start Date:  </strong> <span>{(this.state.singlePlan) ? this.state.singlePlan.start_date : ''}</span></div>
                                        <div className="Partt_d1_txt_2 my-3"><strong>End Date: </strong> <span>{(this.state.singlePlan) ? this.state.singlePlan.end_date : ''}</span></div>
                                    </div>
                                </div>
                                <div className="Partt_d1_txt_1 py-2 mt-4"><strong>Finance Breakdown: </strong> </div>
                                <div className="row">
                                    <div className="col-md-12">

                                        <div className="to_used__">
                                            <div className="Partt_d1_txt_1 mb-3"><strong>Totals:</strong><span> ${(this.state.singlePlan) ? this.state.singlePlan.total_funding : ''}</span></div>
                                            <div className="progress-b3 progress-b5">

                                                <ProgressBar className="progress-b2" now={this.state.singlePlan.fund_used/this.state.singlePlan.total_funding * 100} />
                                            </div>
                                            <div className=" d-flex justify-content-between mt-2">{/*$15,611.61 ,$205,717.69*/}
                                                <div className="Partt_d1_txt_3"><strong>Used:  </strong> <span>${(this.state.singlePlan) ? this.state.singlePlan.fund_used : '0.00'}</span></div>
                                                <div className="Partt_d1_txt_3"><strong>Remaining: </strong> <span>${(this.state.singlePlan) ? this.state.singlePlan.remaing_fund : '0.00'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 ">
                                <div className="Partt_d1_txt_1 py-2 pl-5"><strong>Plan Breakdown:</strong> </div>
                                <div className="Partt_d1_txt_3 pl-5">Item Name and Funding Allocated</div>
                                {/* console.log(this.state.ndisServeices) */}
                                <div className=" cstmSCroll1 CrmScroll">
                                    <ScrollArea
                                        speed={0.8}
                                        className="stats_update_list px-5"
                                        contentClassName="content"
                                        horizontal={false}
                                        style={{ paddingRight: '30px', height: 'auto', maxHeight: '300px' }}
                                    >
                                        {
                                            (this.state.ndisServeices) ?
                                                Object.keys(this.state.ndisServeices).map((key) => (
                                                    (this.state.ndisServeices[key].support_item_number) ?
                                                        <div className="Break_dow_SD" key={key}>
                                                            <div className="Break_dow_T">
                                                                <div className="Break_dow_T_a"><strong>{this.state.ndisServeices[key].support_item_number}:</strong> {this.state.ndisServeices[key].support_item_name}</div>
                                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $ {this.state.ndisServeices[key].amount}</div>
                                                            </div>
                                                        </div>
                                                        : ''
                                                ))
                                                : ''
                                        }
                                        {/* <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div>


                                        <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div>

                                        <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div>

                                        <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div>

                                        <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div>


                                        <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div>

                                        <div className="Break_dow_SD">
                                            <div className="Break_dow_T">
                                                <div className="Break_dow_T_a"><strong>01_011_0107_1_1:</strong> Assistance With Self-Care Activities (Standard - Weekday day </div>
                                                <div className="Break_dow_T_b"><strong>Allocated:</strong> $30,000</div>
                                            </div>
                                        </div> */}
                                    </ScrollArea>
                                </div>

                            </div>
                        </div>



                        {/* <div className="row d-flex justify-content-end mt-4">
                            <div className="col-md-3"> <span className="btn-3">Edit Participants Shifts</span></div>
                        </div> */}
                    </div>


                </div>
            </div>
        );
    }
}
const mapStateToProps = state => {
    return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,
        planList: state.CrmParticipantReducer.plans,
        planIds:state.CrmParticipantReducer.alllplansids
    }
};

export default connect(mapStateToProps, { plan_list })(ProspectiveParticipantFunding);
