import React, { Component } from 'react';
import Highcharts from 'highcharts';
import drilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import '../../scss/components/admin/recruitment/applicants/ApplicantDashboard.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';


    // Link drilldown hover tooltips to high charts    
    drilldown(Highcharts)

    // Mock Data - @TODO Get Jobs and there status counts form pie chart
    const jobStatusData = [
        {
            name: "Hired",
            y: 62.74,
            drilldown: "Chrome"
        },
        {
            name: "Screening",
            y: 10.57,
            drilldown: "Firefox"
        },
        {
            name: "In Progress",
            y: 7.23,
            drilldown: "Internet Explorer"
        },
        {
            name: "Cab",
            y: 5.58,
            drilldown: "Safari"
        },
        {
            name: "New",
            y: 4.02,
            drilldown: "Edge"
        },
    ];
    const jobStatusOptions = {
        chart: {
            type: "pie"
        },
        series: [
            {
            name: 'Job Status',
                    data: jobStatusData
                }
        ]
    };


    // MockData - @TODO Get Documents, new versus verified
    const documentsData = [
        {
            name: "Hired",
            id: "Hired",
            y: 20,
            drilldown: "Hired"
        },
        {
            name: "Screening",
            y: 60,
            drilldown: "Firefox"
        },
        {
            name: "In Progress",
            y: 30,
            drilldown: "Internet Explorer"
        },
    ];
    const documentOptions = {
        title: "asdf",
        chart: {
            type: "bar"
        },
        xAxis: {
            categories: ['Online Assessments (Uncompleted)', 'Forms (Unverified)', 'Documents (Unverified)'],
            title: {
                text: null
            }
        },
        series: [
            {
                name: 'Documents',
                data: documentsData
            }
        ]
    };


    // MockData - @TODO Get Documents, new versus verified
    const groupBookingsData = [
        {
            name: "Open",
            y: 30,
            drilldown: "Open",
            color: '#5cb85c'
        },
        {
            name: "Unsuccessful",
            y: 20,
            drilldown: "Unsuccessful",
            color: '#f0ad4e'
        },
        {
            name: "In Progress",
            y: 40,
            drilldown: "In Progress",
            color: '#d9534f'
        },
    ];
    const groupBookingOptions = {
        title: "asdf",
        chart: {
            type: "bar"
        },
        xAxis: {
            categories: ['Open', 'In Progress', 'Unsuccessful'],
            title: {
                text: null
            }
        },
        series: [
            {
                name: 'Applicant Status',
                data: groupBookingsData
            }
        ],
    };    

        // MockData - @TODO Get Documents, new versus verified
    const applicantStatusData = [
        {
            name: "Open",
            y: 100,
            drilldown: "Open",
            color: '#5cb85c'
        },
        {
            name: "Unsuccessful",
            y: 20,
            drilldown: "Unsuccessful",
            color: '#f0ad4e'
        },
        {
            name: "In Progress",
            y: 45,
            drilldown: "In Progress",
            color: '#d9534f'
        },
    ];
    const applicantStatusOptions = {
        title: "asdf",
        chart: {
            type: "bar"
        },
        xAxis: {
            categories: ['Open', 'In Progress', 'Unsuccessful'],
            title: {
                text: null
            }
        },
        series: [
            {
                name: 'Applicant Status',
                data: applicantStatusData
            }
        ],
    };    






class ApplicationDashboard extends Component {
    constructor() {
        super();
        this.state = {
        }
    }
    

    render() {
    
        return (
            <div className="dashboard" style={{ backgroundColor: 'white', padding : 20}}>
                <div class="slds-col custom_page_header">
                    <div class="row">
                        <div class="col-lg-12 col-md-12 main_heading_cmn-">
                            <h1>Dashboard</h1>
                            <br /><br />
                        </div>
                    </div>

                    {/* Job Status */}
                    <div class="row">
                        <div class="col-lg-12 col-md-12">
                            <h2>Jobs Status</h2>
                            <p>View the Job Status overall picture and Job openings which are live. Hover over the pie chart to view job statuses and the % associated to them.</p>
                            <br /><br />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-6">
                            <HighchartsReact highcharts={Highcharts} options={jobStatusOptions} />
                            <br /><br />
                        </div>
                        <div class="col-lg-6">
                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Job Openings</h4>
                                </div>
                                <div class="panel-body">
                                    <small>Live</small>
                                    <div class="progress">
                                        <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100" style={{width:'72%'}}>
                                            <span class="sr-only">72% Complete</span>
                                        </div>
                                    </div>
                                    <small>Scheduled</small>
                                    <div class="progress">
                                        <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{width: '20%'}}>
                                            <span class="sr-only">20% Complete</span>
                                        </div>
                                    </div>
                                    <small>Drafted</small>
                                    <div class="progress">
                                        <div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: '60%'}}>
                                            <span class="sr-only">60% Complete (warning)</span>
                                        </div>
                                    </div>
                                    <small>Closed</small>
                                    <div class="progress">
                                        <div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style={{width: '80%'}}>
                                            <span class="sr-only">80% Complete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p>Click the Job Openings and their status above to see more details.</p>
                        </div>
                    </div>


                    {/* Application Status */}
                    <div class="row">
                        <div class="col-lg-6 col-md-6">
                            <h2>Applicant Status</h2>
                            <p>View applicant status completed and items to action.</p>
                            <br /><br />
                        </div>
                        <div class="col-lg-6 col-md-6">
                            <SLDSReactSelect
                                simpleValue={true}
                                className="custom_select default_validation"
                                options={[                            
                                    { label: '85XE3942FB', value: '2' },
                                    { label: 'L39GTW78VX', value: '1' },
                                ]}
                                //onChange={(value) => this.handleChange(value, 'business_unit')}
                                //value={this.state.business_unit || ''}
                                clearable={false}
                                searchable={false}
                                placeholder="Please Select NDIS WSC"
                                required={true}
                                name="business_unit"
                                disabled={this.state.is_locked ? true : false}
                            />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <HighchartsReact highcharts={Highcharts} options={applicantStatusOptions} />
                        </div>
                    </div>


                    {/* Job Listings */}
                    <div class="row">
                        <div class="col-lg-12 col-md-12">
                            <h2>Jobs Listing Statistics</h2>
                            <p>View the Job Status overall picture and Job openings which are live. Hover over the pie chart to view job statuses and the % associated to them.</p>
                            <br /><br />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12 col-md-12">
                            <table class="table table-striped">
                                <thead>
                                <tr><th>Impressions</th><th>ROI</th><th>Source</th></tr>
                                </thead>
                                <tbody>
                                <tr><td>45</td><td>2.45%</td><td>Seek</td></tr>
                                <tr><td>289</td><td>56.2%</td><td>LinkedIn</td></tr>
                                <tr><td>98</td><td>25%</td><td>Oncall</td></tr>
                                <tr><td>..</td><td>..</td><td>..</td></tr>
                                <tr><td>..</td><td>..</td><td>..</td></tr>
                                </tbody>
                            </table>

                            <br /><br />
                        </div>
                    </div>


                    {/* Documents */}
                    <div class="row">
                        <div class="col-lg-12 col-md-12">
                            <h2>Documents</h2>
                            <p>Click the Documents below to view more details or .</p>
                            <br /><br />
                        </div>
                        <div class="col-lg-12">
                            <HighchartsReact highcharts={Highcharts} options={documentOptions} />
                            <br /><br />
                        </div>
                    </div>

                    {/* Group Bookings */}
                    <div class="row">
                        <div class="col-lg-12 col-md-12">
                            <h2>Group Bookings</h2>
                            <p>View all group bookings Open, In Progress and Unsuccessful, click to view more details.</p>
                            <br /><br />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <HighchartsReact highcharts={Highcharts} options={groupBookingOptions} />
                            <br /><br />
                        </div>
                    </div>


                    {/* Applicant Visability Matrix */}
                    <div class="row">
                        <div class="col-lg-12 col-md-12" style={{display: 'none'}}>
                            <h2>Applicant Visability Matrix</h2>
                            <p>Select dropdowns Status and NDIS WEC Number then view the applicants visibility of actionable items.</p>
                            <br /><br />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12" style={{display: 'none'}}>
                            <div class="col-lg-6">
                                <SLDSReactSelect
                                    simpleValue={true}
                                    className="custom_select default_validation"
                                    options={[                            
                                        { label: 'Open', value: '2' },
                                        { label: 'In Progress', value: '1' },
                                    ]}
                                    //onChange={(value) => this.handleChange(value, 'business_unit')}
                                    //value={this.state.business_unit || ''}
                                    clearable={false}
                                    searchable={false}
                                    placeholder="Please Select Status"
                                    required={true}
                                    name="business_unit"
                                    disabled={this.state.is_locked ? true : false}
                                />
                            </div>
                            <div class="col-lg-6">
                                <SLDSReactSelect
                                    simpleValue={true}
                                    className="custom_select default_validation"
                                    options={[                            
                                        { label: '85XE3942FB', value: '2' },
                                        { label: 'L39GTW78VX', value: '1' },
                                    ]}
                                    //onChange={(value) => this.handleChange(value, 'business_unit')}
                                    //value={this.state.business_unit || ''}
                                    clearable={false}
                                    searchable={false}
                                    placeholder="Please Select NDIS WSC"
                                    required={true}
                                    name="business_unit"
                                    disabled={this.state.is_locked ? true : false}
                                />

                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12" style={{display: 'none'}}>
                            <table class="table table-striped">
                            <thead>
                                    <tr>
                                        <th>Join date</th>
                                        <th>VISA</th>
                                        <th>Qualifications</th>
                                        <th>Ref Checks</th>
                                    </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>X</td><td>X</td><td>X</td><td>X</td>
                                </tr>
                                <tr>
                                    <td>X</td><td></td><td>X</td><td>X</td>
                                </tr>
                                <tr>
                                    <td>X</td><td>X</td><td>X</td><td>X</td>
                                </tr>
                                <tr>
                                    <td>X</td><td></td><td>X</td><td>X</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                    </div>


                </div>
            </div>
        );
    }
}

export default ApplicationDashboard;

