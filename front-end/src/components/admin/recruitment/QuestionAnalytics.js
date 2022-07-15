import React, { Component } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';

class QuestionAnalytics extends Component {

    constructor() {
        super();
        this.state = {
            durationArr: ['Week', 'Month', 'Year'],        
            durationIntake: 0,
            durationData:[
                ['78', '32'],
                ['25', '75'],
                ['50', '50']
            ],
            dataGraph:''
        }
    }

    clickHandler(i) {
       
        let dupliDataAry = this.state.durationData
        this.setState({ durationIntake: i, dataGraph:dupliDataAry[i] })
    }

    componentDidMount(){

        let dupliDataAry = this.state.durationData
        this.setState({dataGraph:dupliDataAry[0]});
    }
    



    render() {

       
        const dataGraph = this.state.dataGraph;
        const Applicantdata = {
            labels: ['Right', 'wrong'],
            datasets: [{
                data: dataGraph,
                backgroundColor: ['#03a552', '#c01b2f'],

            }],

        };


        return (
            <div className={'customModal ' + (this.props.show ? ' show' : ' ')}>
                <div className="cstomDialog widBig">

              
                    <h3 className="cstmModal_hdng1--">
                        Question Analytics
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.close}></span>
                    </h3>

                    <div className='row pd_lr_30 d-flex flexWrap' >

                        <div className='col-md-2 col-sm-4 col-xs-12'>
                            <h3 >Question 12</h3>
                            <p>Literacy</p>
                        </div>

                        <div className='col-md-10 col-sm-8 col-xs-12'>
                            <h3><strong>{this.props.question}</strong></h3>
                           <h4>(Multiple Choice)</h4>
                        </div>


                    </div>
                    <div className='row pd_lr_30 d-flex justify-content-center mr_tb_20'>

                       

                        <div className='col-sm-6'>

                            <div className='Analytics_box1__'>

                                <h5 className='cmn_font_clr'><strong>Question's Average Results</strong></h5>
                                <ul className='durationtk_ul__'>

                                    {this.state.durationArr.map((durations, i) => {
                                        return (
                                            <li
                                                key={i}
                                                className={this.state.durationIntake == i ? 'active' : ''}
                                                onClick={this.clickHandler.bind(this, i)}
                                            >
                                                <span>{durations}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                                <div className='showCase_amnt'>
                                    <h1><strong>77</strong></h1>
                                    <h6>Total Amount of Applicants Tested</h6>
                                </div>

                                <div className='grph_dv'>
                                    <Doughnut data={Applicantdata} height={200} className="myDoughnut" legend={""} />
                                </div>

                                <p className='mr_tb_20'>
                                    {this.state.dataGraph[1]}% of Interviees got this question wrong ({this.state.durationArr[this.state.durationIntake]})

                                    {/* 25% of Interviees got this question wrong (week) */} 
                                    {/* static code */}
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="row trnMod_Foot__ disFoot1__">
                        <div className="col-sm-12 no-pad text-right">
                            <button type="submit" className="btn cmn-btn1 create_quesBtn">Export Analytics</button>
                        </div>
                    </div>



                </div>
            </div>

        );
    }
}

export default QuestionAnalytics;

