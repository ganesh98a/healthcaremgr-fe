import React, { Component } from 'react';
import ReactTable from 'react-table';
import Chart from "react-google-charts";
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import CustomChartBar from './common/CommonBarChart';
import MonthChart from './common/MonthChart';
import { connect } from 'react-redux'
import { postData, toastMessageShow, currencyFormatUpdate } from 'service/common.js';
import { graphViewType } from 'service/custom_value_data.js';
import _ from 'lodash';
import {CURRENCY_SYMBOL} from 'config.js';

const graphModeTypeData = ['invoice_income','invoice_income_this_month','invoice_credited_and_refund_paid_this_month','invoice_profit_this_month'];
class FinanceDashboard extends React.Component {
    constructor(props) {
        super(props);
        let intGrphData={};
        _.forEach(graphModeTypeData,function(el,index){
            intGrphData[el+'_loading']=false;
            intGrphData[el+'_data']=[];
            intGrphData[el+'_type']='week';
        });
        this.state = {
            genrated_quote: [],
            graphType: graphViewType,
            dashboard_active_keys : {genrated_quote: 'week', accepted_quote: 'week', average_time: 'week'},
            ...intGrphData
        }
    }
    getGraphResult = (graphModeType, graphType) => {
        this.setState({ [graphModeType + '_type']: graphType }, () => {
            this.fetchGraphData(graphModeType, graphType);
        })
    }

    fetchGraphData = (graphModeType,graphType) => {
        let modeType = _.includes(graphModeTypeData,graphModeType)? graphModeType:'';
        let viewType = _.includes(_.map(this.state.graphType,'name'),graphType)? graphType:'week';
        if(modeType==''){
            toastMessageShow('Invalid Request.','e');
        }else{
            this.setState({[modeType+'_loading']:true},()=>{
                let requestData ={
                    mode:modeType,
                    type:viewType
                };
                postData('finance/FinanceInvoice/get_dashboard_graph_count',requestData).then((result) => {
                    if (result.status) {
                     this.setState({[modeType+'_data']:result.data});
                    }else{
                    //this.setState({chartData:dummyData});
                    }
                    this.setState({[modeType+'_loading']:false});
                });
            });
        }
      }
    
    componentDidMount(){ 
        this.getQuoteDashboardGraph({type: 'all', duration_type: 'week'});
        this.fetchGraphData(graphModeTypeData[0],this.state[graphModeTypeData[0]+'_type']);
        this.fetchGraphData(graphModeTypeData[1],this.state[graphModeTypeData[1]+'_type']);
        this.fetchGraphData(graphModeTypeData[2],this.state[graphModeTypeData[2]+'_type']);
        this.fetchGraphData(graphModeTypeData[3],this.state[graphModeTypeData[3]+'_type']);
    }
    
    getQuoteDashboardGraph = (req) => {
        return postData('finance/FinanceDashboard/get_quote_dashboard_graph', req).then((res) => {
            if(res.status){
                var dashboard_active_keys = this.state.dashboard_active_keys;
                var activeState = {}
                if(res.data.genrated_quote){         
                    activeState['genrated_quote'] = req.duration_type;
                    this.setState({genrated_quote: {labels: ['Total', 'Participant', 'Organisation'], datasets: [{data: res.data.genrated_quote, backgroundColor: ['#464765 ', '#707188', '#c1c1c9']}]}});
                }
                
                var x = {...dashboard_active_keys, ...activeState}
                this.setState({dashboard_active_keys: x})
            }
        });
    }
    
    NavLinkchart = (specific_key) => {
            return [{label:'Week', class: (this.state.dashboard_active_keys[specific_key] == 'week'? "active": ""), clickEvent : ()=> this.getQuoteDashboardGraph({type : specific_key, duration_type : "week"})},
            {label:'Month', class: (this.state.dashboard_active_keys[specific_key] == 'month'? "active": ""), clickEvent : ()=> this.getQuoteDashboardGraph({type : specific_key, duration_type : "month"})},
            {label:'Year', class: (this.state.dashboard_active_keys[specific_key] == 'year'? "active": ""), clickEvent : ()=> this.getQuoteDashboardGraph({type : specific_key, duration_type : "year"})},
        ]
    }

    render() {
 
        /* const data = [
            ["Year", "Sales", "Expenses"],
            ["2004", 1000, 400],
            ["2005", 1170, 460],
            ["2006", 660, 1120],
            ["2007", 1030, 540]
        ];
 */
        const invoiceIncomeData = {
            labels: ['', '', ''],
            datasets: [{
                data: this.state[graphModeTypeData[0]+'_data'],
                backgroundColor: ['#464765 ', '#707188', '#c1c1c9'],

            }],
        };
        const NavLinkchartIncomeQueries= graphViewType.length>0? graphViewType.map((row,index)=>{
            return {label:_.capitalize(row.name),clickEvent:()=>this.getGraphResult(graphModeTypeData[0],_.toLower(row.name)),class:this.state[graphModeTypeData[0]+'_type'] == _.toLower(row.name) ? 'active' : ''};
        }):[];


        const lablechart = [
            {label:'Total',extarClass:'drk-color4', extraStyle:{color:'#464765'}},
            {label:'Participant',extarClass:'drk-color2', extraStyle:{color:'#707188'}},
            {label:'Org',extarClass:'drk-color3', extraStyle:{color:'#c1c1c9'}},
        ];

        /* const NavLinkchart = [
            {label:'Week', },
            {label:'Month', },
            {label:'Year', },
        ];

        const chartData=[
                [
                    "Qty.",
                    "Quotes Created",
                    "Converted into Invoice",
                ],
                ["Jan", 2500, 5000],
                ["Feb", 1500, 2500],
                ["Mar", 1300, 1500],
                ["Apr", 5000, 1200],
                ["May", 1526, 1517],
                ["Jun", 5000, 4445],
                ["Jul", 3500, 4500],
                ["Aug", 1526, 1517],
                ["Sep", 1526, 1517],
                ["Oct", 1526, 1517],
                ["Nov", 1526, 1517],
                ["Dec", 1526, 1517]
            ];

          const setChartOptions  = {
                chartArea: { width: "80%" },
                isStacked: true,
                legend: { position: "bottom", alignment: "center" },
                backgroundColor: '#ececec',
                colors: ['#464765', '#6f7087'],
                vAxis: {
                    gridlines: {
                        color: 'transparent'
                    }
                }
            } */


        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="py-4 invisible">
                    <span className="back_arrow">
                            <a href="/admin/crm/participantadmin"><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>
                        <div className="d-flex by-1 py-4">
                            <div className="h-h1 color">{this.props.showPageTitle}</div>
                            <i className="icon icon-"></i>
                        </div>
                    </div>
                </div>

          
                <div className="row">
                    <div className="col-md-12">
                        <div className="FD_ul_">
                            <div className="FD_li_">
                                <i className="icon ie-usd"></i>
        <span className='custom_tooltip_set_0'><span>{CURRENCY_SYMBOL}XXXXXXXXXXXX <i>{currencyFormatUpdate(this.state[graphModeTypeData[1]+'_data'],CURRENCY_SYMBOL)}</i></span> has come in this month</span>
                            </div>
                            <div className="FD_li_">
                                <i className="icon ie-dollarl-cancel"></i>
                                <span className='custom_tooltip_set_0'> <span>{CURRENCY_SYMBOL}XXXXXXXXXXXX <i>{currencyFormatUpdate(this.state[graphModeTypeData[2]+'_data'],CURRENCY_SYMBOL)}</i></span> has come out this month</span>
                            </div>
                            <div className="FD_li_">
                                <i className="icon ie-ie-profit"></i>
                                <span className='custom_tooltip_set_0'>There is a <span>{CURRENCY_SYMBOL}XXXXXXXXXXXX <i>{currencyFormatUpdate(this.state[graphModeTypeData[3]+'_data'],CURRENCY_SYMBOL)}</i></span> profit this month</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <CustomChartBar barTitle={'Amount of Quotes Generated'} barData={this.state.genrated_quote} labelShowData={lablechart} navbarShowData={this.NavLinkchart('genrated_quote')}/>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                 <CustomChartBar barTitle={'Income From Invoices'} barData={invoiceIncomeData} labelShowData={lablechart} navbarShowData={NavLinkchartIncomeQueries}/>
                            </div>
                        </div>
                     {/*    <div className="row">
                            <div className="col-md-12">
                                <div className="Out_title by-1">Quote To Invoice Conversion</div>
                            </div>
                            <div className="col-md-12">
                                <MonthChart chartData={chartData} setOption={setChartOptions}  />
                            </div>
                        </div> */}
                    </div>
                </div>
            </React.Fragment >
        );
    }

}


class Square extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    render() {
        return (
            <button
                className="square"
                onClick={() => this.setState({ value: 'X' })}
            >
                {this.state.value}
            </button>
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(FinanceDashboard);

