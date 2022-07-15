import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { TextBlock, MediaBlock, TextRow, RectShape, RoundShape, ContentLoader, Circle, Rect } from 'react-placeholder/lib/placeholders';



class CustomChartBar extends React.Component {
    render() {
        if (this.props.placeHoldeShow) {
            return (
                <ReactPlaceholder showLoadingAnimation={true} ready={this.props.placeHoldeShow}>
                    <div className="status_box1 d-flex flex-wrap">
                        <div className="row d-flex flex-wrap after_before_remove w-100">
                            <h4 className="hdng w-100">
                                <RectShape defaultValue={''} showLoadingAnimation={true} color='#CDCDCD' style={{ width: '62%', height: 20, 'borderRadius': 0, display: 'inline-block' }} />
                            </h4>
                            <div className="row d-flex flex-wrap w-100">
                                <div className="col-lg-5 col-md-12 col-sm-12 colJ-1">
                                <RectShape defaultValue={''} showLoadingAnimation={true} color='#818181' style={{ width: '20px', height: '100px', 'borderRadius': 0, display: 'inline-block' }} />
                                <RectShape defaultValue={''} showLoadingAnimation={true} color='#a7a7a7' style={{ width: '20px', height: '80px', 'borderRadius': 0, display: 'inline-block' }} />
                                <RectShape defaultValue={''} showLoadingAnimation={true} color='#cdcdcd' style={{ width: '20px', height: '60px', 'borderRadius': 0, display: 'inline-block' }} />
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12 colJ-1 d-flex flex-wrap col-lg-offset-1">
                                    <ul className="status_det_list w-100">
                                        <li className=" drk-color4">
                                            <RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#818181' style={{ 'marginTop': '0em', width: '60%', height:'10px', 'borderRadius': '0px', display: 'inline-block',  }} />
                                        </li>
                                        <li className=" drk-color2" >
                                        <RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#a7a7a7' style={{ 'marginTop': '0em', width: '50%', height:'10px', 'borderRadius': '0px', display: 'inline-block',  }} />
                                        </li>
                                        <li className=" drk-color3">
                                            <RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#cdcdcd' style={{ 'marginTop': '0em', width: '40%', height:'10px', 'borderRadius': '0px', display: 'inline-block',  }} />
                                        </li>
                                    </ul>
                                    <div className="viewBy_dc text-center w-100">
                                        <h5><RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#CDCDCD' style={{ 'marginTop': '0em', width: '40%', height:'15px', 'borderRadius': '0px', display: 'inline-block',  }} /></h5>
                                        <ul>
                                            <li><RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#CDCDCD' style={{ 'marginTop': '0em', width: '80%', height:'10px', 'borderRadius': '0px', display: 'inline-block',  }} /></li>
                                            <li><RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#CDCDCD' style={{ 'marginTop': '0em', width: '80%', height:'10px', 'borderRadius': '0px', display: 'inline-block',  }} /></li>
                                            <li><RectShape defaultValue={''} type='textRow' showLoadingAnimation={true} color='#CDCDCD' style={{ 'marginTop': '0em', width: '80%', height:'10px', 'borderRadius': '0px', display: 'inline-block',  }} /></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ReactPlaceholder>);
        } else {

            return (
                <React.Fragment>
                    <div className="status_box1 d-flex flex-wrap">
                        <div className="row d-flex flex-wrap after_before_remove">
                            <h4 className="hdng w-100">{this.props.barTitle}</h4>
                            <div className={this.props.labelShowType == 'bottom' ? "row d-flex flex-wrap w-100 justify-content-center after_before_remove" : "row d-flex flex-wrap w-100"}>
                                <div className={(this.props.labelShowType == 'bottom' ? "col-lg-8 col-md-12 col-sm-12 colJ-1" : "col-lg-5 col-md-12 col-sm-12 colJ-1") + ' '+(this.props.labelExtratClass)}>
                                    <div className='grph_dv w-100'>
                                        <Bar data={this.props.barData} height={this.props.height} legend={null}
                                            options={{
                                                maintainAspectRatio: false, scales: {
                                                    yAxes: [{
                                                        ticks: {
                                                            beginAtZero: true
                                                        },
                                                        gridLines: {
                                                            display: false,
                                                            drawBorder: true
                                                        }, ...this.props.scaleLabelYAxis

                                                    }],
                                                    xAxes: [{
                                                        ticks: { display: false },
                                                        gridLines: {
                                                            display: false,
                                                            drawBorder: true
                                                        }, ...this.props.scaleLabelXAxis
                                                    }]
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className={"col-lg-6 col-md-12 col-sm-12 colJ-1 d-flex flex-wrap " + (this.props.labelShowType == 'bottom' ? '' : 'col-lg-offset-1')}>
                                    <ul className={this.props.labelShowType == 'bottom' ? "status_det_list w-100 d-flex justify-content-between" : "status_det_list w-100"}>
                                        {this.props.labelShowData.map((row, index) => (<li className={" " + row.extarClass} style={row.extraStyle || {}} key={index}>{row.label}</li>))}
                                    </ul>
                                    {this.props.viewByDisable ? <React.Fragment/> :<div className="viewBy_dc text-center w-100">
                                        <h5>View By:</h5>
                                        <ul>
                                            {this.props.navbarShowData.map((row, index) => (<li key={index} className={row.class} onClick={eval(row.clickEvent)}>{row.label}</li>))}
                                        </ul>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        }
    }


}
CustomChartBar.defaultProps = {
    viewByDisable:false,
    placeHoldeShow: false,
    labelShowType: 'parallel',
    labelExtratClass: '',
    scaleLabelYAxis: {
        scaleLabel: {
            display: false,
            labelString: 'y-axis'
        }
    },
    scaleLabelXAxis: {
        scaleLabel: {
            display: false,
            labelString: 'x-axis'
        }
    },
    barData: {
        labels: ['', '', ''],
        datasets: [{
            data: ['01', '09', '05'],
            backgroundColor: ['#464765 ', '#707188', '#c1c1c9'],

        }],
    },
    barTitle: 'bar Title',
    labelShowData: [
        { label: 'Total', extarClass: 'drk-color4', extraStyle: {} },
        { label: 'Participant', extarClass: 'drk-color2', extraStyle: {} },
        { label: 'Org', extarClass: 'drk-color3', extraStyle: {} },
    ],
    navbarShowData: [
        { label: 'Week', class: '' },
        { label: 'Month', class: '' },
        { label: 'Year', class: '' },
    ],
    height:130,
    width:130,


}
export default CustomChartBar;