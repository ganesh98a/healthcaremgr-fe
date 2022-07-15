import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../../../../../config.js';
import { Doughnut } from "react-chartjs-2";
import { postData } from '../../../../../service/common.js';
import MapServiceContainer from './MapServiceContainer.jsx';
import { GenderAnalysisChart } from 'service/GenderAnalysisChart.js';
import CrmPage from '../../CrmPage';
// import { PartShiftModal } from '../oldPages/ParticipantShiftModal';
// import { FunnelAnalysisChart } from 'service/FunnelAnalysisChart.js';



const requestData = (filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({ filtered: filtered });
        postData('crm/CrmReporting/service_analytics', Request).then((result) => {
            let filteredData = result;
            const res = {
                rows: filteredData
            };
            resolve(res);
        });
    });
};


class ServiceAnalytics extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            participant_id: '',
            PartShiftModal: false,
            ServiceAnalytics: [{ grapheachdata: [], count: [], markerDetails: [{ portal: '', thirdparty: '', private: '' }], ageDetails: [{ portal: [], thirdparty: [], private: [] }] }]
        };
    }

    fetchData = () => {
        requestData(
            this.state.filterVal
        ).then(res => {
            this.setState({
                ServiceAnalytics: res.rows,
                loading: false
            });
        });
    }


    componentDidMount() {
        this.fetchData();
        this.setState({ participant_id: this.props.props.match.params.id });
    }

    // closePartShiftModal() {
    //     this.setState({ PartShiftModal: false });
    // }

    // showPartShiftModal() {
    //     this.setState({ PartShiftModal: true });
    // }


    render() {
        const now = 60;
        const data = {
            labels: ["Portal Managed Funding", "3rd Party Managed Funding", "Private Managed Funding"],
            datasets: [
                {
                    data: this.state.ServiceAnalytics.count,
                    backgroundColor: ["#6401c0", "#d22e2e", "#2e9cca"],
                    hoverBackgroundColor: ["#6401c0", "#d22e2e", "#2e9cca"],
                    borderWidth: 0,
                }
            ]
        };




        return (
            <div className="container-fluid">
                <CrmPage pageTypeParms={'report_service_analytics'}/>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="py-4 bb-1">
                            <Link className="back_arrow d-inline-block" to={ROUTER_PATH + 'admin/crm/participantadmin'}><span className="icon icon-back1-ie"></span></Link>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="row d-flex py-4">
                            <div className="col-md-9">
                                <div className="h-h1">
                                    Service Analytics
                                    </div>
                            </div>
                        </div>
                        <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-lg-12">
                        <h3 className="mb-4">Service Funding Analytics</h3>


                        <div className="col-md-12 Ver_4_SAG_ mt-5_">
                            <div className="row">
                                <div className="col-md-6">
                                    <Doughnut
                                        data={data}
                                        options={{
                                            title: {
                                                display: true,
                                            },
                                            legend: {
                                                display: false,
                                                position: "bottom"
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-md-6">

                                    {typeof (this.state.ServiceAnalytics.countdata) != 'undefined' ?


                                        <div>

                                            {(this.state.ServiceAnalytics.countdata.portal) ?
                                                <div className="Ser_Anal_aba_v4- Oncall_P">
                                                    <div className="Ser_Anal_aba_v4--1"><span></span></div>
                                                    <div className="Ser_Anal_aba_v4--2">
                                                        <h4>Portal Managed Funding</h4>
                                                        <div><em>{this.state.ServiceAnalytics.countdata.portal}</em> People Onboarded with<br />
                                                            Portal managed Funding</div>
                                                    </div>
                                                </div>
                                                : ''}

                                            {(this.state.ServiceAnalytics.countdata.thirdparty) ?
                                                <div className="Ser_Anal_aba_v4- thread_P">
                                                    <div className="Ser_Anal_aba_v4--1"><span></span></div>
                                                    <div className="Ser_Anal_aba_v4--2">
                                                        <h4> 3rd Party Managed Funding</h4>
                                                        <div><em>{this.state.ServiceAnalytics.countdata.thirdparty}</em> People Onboarded with<br />
                                                            3rd Party managed Funding</div>
                                                    </div>
                                                </div>
                                                : ''}

                                            {(this.state.ServiceAnalytics.countdata.private) ?
                                                <div className="Ser_Anal_aba_v4- Private_M">
                                                    <div className="Ser_Anal_aba_v4--1"><span></span></div>
                                                    <div className="Ser_Anal_aba_v4--2">
                                                        <h4>Private Managed Funding</h4>
                                                        <div><em>{this.state.ServiceAnalytics.countdata.private}</em> People Onboarded with<br />
                                                            Private managed Funding</div>
                                                    </div>
                                                </div>
                                                : ''}


                                        </div>
                                        : ''}
                                </div>
                                <div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>




                <div className="row pt-5">
                    <div className="col-lg-12 bt-1">


                        <div className="row">
                            <h3 className="py-4">Service Funding Demographic Analytics</h3>
                            <ul className="nav nav-tabs Ser_Anal_tab_1 V4_DG1__">
                                <li className="col-md-3 px-0 Oncall_P active"><a data-toggle="tab" href="#home">Portal Managed Participants</a></li>
                                <li className="col-md-3 px-0 thread_P"><a data-toggle="tab" href="#menu1">3rd Party Managed Participants</a></li>
                                <li className="col-md-3 px-0 Private_M"><a data-toggle="tab" href="#menu2">Private Participants</a></li>
                            </ul>

                            <div className="tab-content">
                                <div id="home" className="tab-pane Oncall_P in active">
                                    {typeof (this.state.ServiceAnalytics.ageDetails) != 'undefined' ?
                                        <MsgGraph genderDatas={typeof (this.state.ServiceAnalytics.ageDetails.portal) != 'undefined' ? this.state.ServiceAnalytics.ageDetails.portal : []} mapDetails={this.state.ServiceAnalytics.cityDetails.portal} markerDetails={this.state.ServiceAnalytics.markerDetails.portal} />
                                        : ''}
                                </div>

                                <div id="menu1" className="tab-pane thread_P">
                                    {typeof (this.state.ServiceAnalytics.ageDetails) != 'undefined' ?
                                        <MsgGraph genderDatas={typeof (this.state.ServiceAnalytics.ageDetails.thirdparty) != 'undefined' ? this.state.ServiceAnalytics.ageDetails.thirdparty : []} mapDetails={this.state.ServiceAnalytics.cityDetails.thirdparty} markerDetails={this.state.ServiceAnalytics.markerDetails.thirdparty} />
                                        : ''}
                                </div>

                                <div id="menu2" className="tab-pane Private_M">
                                    {typeof (this.state.ServiceAnalytics.ageDetails) != 'undefined' ?
                                        <MsgGraph genderDatas={typeof (this.state.ServiceAnalytics.ageDetails.private) != 'undefined' ? this.state.ServiceAnalytics.ageDetails.private : []} markerDetails={this.state.ServiceAnalytics.markerDetails.private} mapDetails={this.state.ServiceAnalytics.cityDetails.private} />
                                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>




            </div>




        );
    }
}



const MsgGraph = props => {
    return (
        <div className="DG_a1 V4_DG2__ mt-5">

            <div className="row DG_aa flex-wrap after_before_remove">
                <GenderAnalysisChart genderData={(props.genderDatas.length > 0 ? props.genderDatas : [
                    { title: 'U18', data: { male: 0, female: 0 } },
                    { title: '18-25', data: { male: 0, female: 0 } },
                    { title: '25-35', data: { male: 0, female: 0 } },
                    { title: '35-45', data: { male: 0, female: 0 } },
                    { title: '45-60', data: { male: 0, female: 0 } },
                    { title: '60+', data: { male: 0, female: 0 } },
                ])} />

                {// <GenderAnalysisChart genderData={[
                    //     { title: 'U18', data: { male: 0, female: 0 } },
                    //     { title: '18-25', data: { male: 0, female: 0 } },
                    //     { title: '25-35', data: { male: 630, female: 260 } },
                    //     { title: '35-45', data: { male: 5, female: 360 } },
                    //     { title: '45-60', data: { male: 400, female: 360 } },
                    //     { title: '60+', data: { male: 45, female: 600 } },
                    // ]} />
                }

                <div className="col-md-8 DG-aa-2">
                    <h4 className="mb-3"> Area Demographic Analysis:</h4>
                    <div className="DG-aa-2a">
                        Hot spots of Victoria, Portal Managed
                        Participants.
                                                    </div>
                    <div className="row mt-5">
                        <div className="col-md-8 px-5">
                            <MapServiceContainer markers={typeof (props.markerDetails) != 'undefined' ? props.markerDetails : []} />
                        </div>
                        <div className="col-md-4 DG-aa-3">
                            Top 5 Hot Spots for VIC:
                            {typeof (props.mapDetails) != 'undefined' ? props.mapDetails.map((city, idx) => (
                                <div className="DG-aa-3a">
                                    <span className="DG-aa-3b"><span>{idx + 1}</span></span>
                                    <div className="DG-aa-3c"><span>{city.title}</span>

                                        -{city.count} Participants</div>
                                </div>
                            )) : ''}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}


export default ServiceAnalytics;
