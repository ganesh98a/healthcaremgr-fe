import React, { Component } from 'react';
import Chart from "react-google-charts";




class MonthChart extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Chart
                    height={this.props.height}
                    chartType={this.props.chartType}
                    loader={<div>Loading Chart</div>}
                    data={this.props.chartData}
                    options={this.props.setOption}
                    legendToggle={this.props.setLegendToggle}
                    // For tests
                    rootProps={{ "data-testid": "3" }}
                />
            </React.Fragment>
        );
    }
}

MonthChart.defaultProps={
    chartType:'ColumnChart',
    chartData:[
        [
            "Qty.",
            "Quotes Created",
            "Converted into Invoice",
        ],
        ["Jan", 2500, 5000],
        ["Feb", 1500, 2500],
        ["Mar", 1300, 1500],
        ["Apr", 5000, 5000],
        ["May", 1526, 1517],
        ["Jun", 5000, 4445],
        ["Jul", 3500, 4500],
        ["Aug", 1526, 1517],
        ["Sep", 1526, 1517],
        ["Oct", 1526, 1517],
        ["Nov", 1526, 1517],
        ["Dec", 1526, 1517]
    ],
   setOption:{
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
   },
   height:['350px']
    
}
export default MonthChart;