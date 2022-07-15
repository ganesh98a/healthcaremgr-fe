import React, { Component } from 'react';
import ReactTable from 'react-table';
import Chart from "react-google-charts";
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import CustomChartBar from './../common/CommonBarChart';
import MonthChart from './../common/MonthChart';
import { CounterShowOnBox } from 'service/CounterShowOnBox.js';
import { connect } from 'react-redux'
import { graphViewType } from 'service/custom_value_data.js';
import {postData,toastMessageShow} from 'service/common.js';
import {ROUTER_PATH} from 'config.js';
import _ from 'lodash';
const graphModeTypeData = ['ndis_money_in','ndis_invoice_error_rejected','invoice_error_rejected','last_ndis_billing','ndis_invoice_error_rejected_monthwise_financial_year'];
class NdisInvoices extends React.Component {
    constructor(props) {
        super(props);
        let intGrphData={};
        _.forEach(graphModeTypeData,function(el,index){
            intGrphData[el+'_loading']=false;
            intGrphData[el+'_data']=[];
            intGrphData[el+'_type']='week';
        });
        this.state = {
            activeCol: '',
            value: null,
            graphType: graphViewType,
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
                postData('finance/FinanceInvoice/get_ndis_dashboard_graph_count',requestData).then((result) => {
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
      componentWillMount(){
        this.fetchGraphData(graphModeTypeData[0],this.state[graphModeTypeData[0]+'_type']);
        this.fetchGraphData(graphModeTypeData[1],this.state[graphModeTypeData[1]+'_type']);
        this.fetchGraphData(graphModeTypeData[2],this.state[graphModeTypeData[2]+'_type']);
        this.fetchGraphData(graphModeTypeData[3],this.state[graphModeTypeData[3]+'_type']);
        this.fetchGraphData(graphModeTypeData[4],this.state[graphModeTypeData[4]+'_type']);
    }
    render() {

        const invoiceNotPaidByMonthWisedata = {
            labels: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
                data: this.state[graphModeTypeData[4]+'_data'],
                backgroundColor: ['#464765 ', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765', '#464765'],

            }],
        };
        const lablechart = [
            { label: 'Total Not Paid', extarClass: 'drk-color4 w-100 text-center' }
        ];

        const scaleLabelXAxisData = {
            ticks:{display:true}
        };
        let dataMax =(_.max(this.state[graphModeTypeData[4]+'_data'])==undefined || _.max(this.state[graphModeTypeData[4]+'_data'])<100 )? 100 : _.max(this.state[graphModeTypeData[4]+'_data']);
        const scaleLabelYAxisData = {
            ticks:{beginAtZero:true,
                min:0,
                max :parseInt(dataMax)
                  }
        };

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-lg-12">
                        <div className=" py-4 ">
                        <span className="back_arrow">
                            <a href={ROUTER_PATH+"admin/finance/InvoicesDashboard"}><span className="icon icon-back1-ie"></span></a>
                            </span>
                        </div>
                        <div className="d-flex by-1 py-4">
                            <div className="h-h1 color">{this.props.showPageTitle}</div>
                            <i className="icon icon-"></i>
                        </div>
                    </div>
                </div>
                <div className="row d-flex  justify-content-center mt-5">
                    <div className="col-lg-8">


                        <div className="row">

                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <div className="status_box1 d-flex flex-wrap">
                                    <div className="d-flex flex-wrap w-100">
                                        <h4 className="hdng w-100">Money In:</h4>
                                        <div className="w-100">
                                            <CounterShowOnBox placeHoldeShow={this.state[graphModeTypeData[0]+'_loading']} counterTitle={this.state[graphModeTypeData[0]+'_data']} classNameAdd="" mode="other" currencyFormat={true} currencySymbol={"$"}  currencySymbolClass="currency_remove_cls"/>
                                        </div>
                                        <div className="colJ-1 w-100">
                                            <div className="duly_vw">
                                                <div className="viewBy_dc text-center">
                                                    <h5>View By:</h5>
                                                    <ul>
                                                        {this.state.graphType.length > 0 ? this.state.graphType.map((val, index) => {
                                                            return (<li key={index} className={this.state[graphModeTypeData[0]+'_type']==val.name ? 'active':''} onClick={() => this.getGraphResult(graphModeTypeData[0], val.name)}>{_.capitalize(val.name)}</li>);
                                                        }) : <React.Fragment />}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <div className="status_box1 d-flex flex-wrap">
                                    <div className="d-flex flex-wrap w-100">
                                        <h4 className="hdng w-100">NDIS Payment Not Received:</h4>
                                        <div className="w-100">
                                            <CounterShowOnBox placeHoldeShow={this.state[graphModeTypeData[1]+'_loading']} counterTitle={this.state[graphModeTypeData[1]+'_data']} classNameAdd="" mode="other" currencyFormat={true} currencySymbol={"$"} currencySymbolClass="currency_remove_cls" />
                                        </div>
                                        <div className="colJ-1 w-100">
                                            <div className="duly_vw">
                                                <div className="viewBy_dc text-center">
                                                    <h5>View By:</h5>
                                                    <ul>
                                                        {this.state.graphType.length > 0 ? this.state.graphType.map((val, index) => {
                                                            return (<li key={index} className={this.state[graphModeTypeData[1]+'_type']==val.name ? 'active':''} onClick={() => this.getGraphResult(graphModeTypeData[1], val.name)}>{_.capitalize(val.name)}</li>);
                                                        }) : <React.Fragment />}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <div className="status_box1 d-flex flex-wrap">
                                    <div className="d-flex flex-wrap w-100">
                                        <h4 className="hdng w-100">All funding types Payment Not Received:</h4>
                                        <div className="w-100">
                                            <CounterShowOnBox placeHoldeShow={this.state[graphModeTypeData[2]+'_loading']} counterTitle={this.state[graphModeTypeData[2]+'_data']} classNameAdd="" mode="other" currencyFormat={true} currencySymbol={"$"} currencySymbolClass="currency_remove_cls"/>
                                        </div>
                                        <div className="colJ-1 w-100">
                                            <div className="duly_vw">
                                                <div className="viewBy_dc text-center">
                                                    <h5>View By:</h5>
                                                    <ul>
                                                        {this.state.graphType.length > 0 ? this.state.graphType.map((val, index) => {
                                                           return (<li key={index} className={this.state[graphModeTypeData[2]+'_type']==val.name ? 'active':''} onClick={() => this.getGraphResult(graphModeTypeData[2], val.name)}>{_.capitalize(val.name)}</li>);
                                                        }) : <React.Fragment />}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <div className="status_box1 d-flex flex-wrap">
                                    <div className="d-flex flex-wrap w-100">
                                        <h4 className="hdng w-100">Last NDIS Billing:</h4>
                                        <div className="w-100">
                                            <CounterShowOnBox placeHoldeShow={this.state[graphModeTypeData[3]+'_loading']} counterTitle={this.state[graphModeTypeData[3]+'_data']} classNameAdd="" mode="other" />
                                        </div>
                                        <div className="colJ-1 w-100">
                                            <div className="duly_vw">
                                                <div className="viewBy_dc text-center">
                                                    <h5>Day Ago</h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>




                <div className="row">
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="Out_title by-1">NDIS Payment Not Received</div>
                            </div>
                            <div className="col-md-12 ">
                            <CustomChartBar barTitle={'NDIS Payment Not Received'} barData={invoiceNotPaidByMonthWisedata} labelShowData={lablechart}  scaleLabelXAxis={scaleLabelXAxisData} height={350} labelShowType="bottom" viewByDisable={true} labelExtratClass={'w-100'} scaleLabelYAxis={scaleLabelYAxisData}/> 
                              
                            </div>
                        </div>
                    </div>

                </div>              
            </React.Fragment >
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


export default connect(mapStateToProps, mapDispatchtoProps)(NdisInvoices);