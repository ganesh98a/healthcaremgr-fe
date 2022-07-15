import React, { Component } from 'react';

class DepartmentAnalytics extends Component {

    constructor() {
        super();
        this.state = {
            durationArr: ['Week', 'Month', 'Year'],
            durationTask: 0,
            durationIntake: 0,
            applicantGraph: [
                { legend: 'Total Applicants', color: '#82bdbd', value: '2500', percentage: '100' },
                { legend: 'Required Training', color: '#05adee', value: '2000', percentage: '80' },
                { legend: 'Qualified', color: '#166284', value: '500', percentage: '20' }
            ]
        }
    }

    clickHandler = (i) => {
        this.setState({ durationTask: i })
    }

    taksCompleteHandler = (i) => {
        this.setState({ durationTask: i })
    }



    render() {

      


        return (
            <div className={this.props.showDepartModal ? 'customModal show' : 'customModal'}>
                <div className="cstomDialog widBig">


                    <h3 className="cstmModal_hdng1--">
                        Department Analytics
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.closeDepartModal}></span>
                    </h3>

                    <div className='row pd_lr_30'>

                        <div className='col-sm-12'>
                            <h3 >Department <strong>NDIS Intake</strong></h3>
                        </div>
                    </div>
                    <div className='row pd_lr_30 d-flex justify-content-center mr_tb_20 flexWrap'>

                        <div className='col-md-6 col-sm-12 col-xs-12 mr_bt_10'>

                            <div className='Analytics_box1__'>

                                <h5 className='cmn_font_clr'><strong>Tasks Completed</strong></h5>
                                <ul className='durationtk_ul__'>

                                    {this.state.durationArr.map((durations, i) => {
                                        return (
                                            <li
                                                key={i}
                                                className={this.state.durationTask == i ? 'active' : ''}
                                                onClick={() => this.taksCompleteHandler(i)}
                                            >
                                                <span>{durations}</span>
                                            </li>
                                        )
                                    })}
                                </ul>

                                <h6>Total Tasks: <strong>71 Tasks</strong></h6>

                                <div className='cstmBar_chart'>
                                    {this.state.applicantGraph.map((graph, i) => {
                                        return (
                                            <div key={i} className='bars' style={{ background: (graph.color), height: (graph.percentage + '%') }}>
                                                <span style={{ color: (graph.color) }}>{graph.percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <ul className='lengend_Ul__'>
                                    {this.state.applicantGraph.map((graph, i) => {
                                        return (
                                            <li key={i} style={{ color: (graph.color) }}>{graph.legend}<div>({graph.value} People)</div></li>
                                        );
                                    })}

                                </ul>

                            </div>

                        </div>

                        <div className='col-md-6 col-sm-12 col-xs-12 mr_bt_10'>

                            <div className='Analytics_box1__'>

                                <h5 className='cmn_font_clr'><strong>Department's Participant Intake</strong></h5>
                                <ul className='durationtk_ul__'>

                                    {this.state.durationArr.map((durations, i) => {
                                        return (
                                            <li
                                                key={i}
                                                className={this.state.durationIntake == i ? 'active' : ''}
                                                onClick={() => this.setState({ durationIntake: i })}
                                            >
                                                <span>{durations}</span>
                                            </li>
                                        )
                                    })}
                                </ul>

                                <div className='showCase_amnt'>
                                    <h1><strong>27</strong></h1>
                                    <h6>Total Amount of Participants fully Onboarded</h6>
                                </div>

                                <div style={{width:'100%'}}>
                                 
                                </div>

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

export default DepartmentAnalytics;

