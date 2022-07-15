import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';


import ReactTable from "react-table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



class EditCabInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            location: '',
            UserAssign: '',
            dueDate: '',
            filterSearch: ''
        }
    }





    render() {
        const columns = [
            { Header: 'HCMGR-ID', accessor: 'id' },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Email ', accessor: 'email' },
            { Header: 'Phone ', accessor: 'phone' },
            { Header: 'Remove ', accessor: 'remove', Cell: () => <span className='icon icon-close1-ie removeAppli_ic'></span> }
        ]




        var options = [
            { value: '1', label: 'Filled' },
            { value: '2', label: 'Unfilled' }
        ];

        const acceptAplliData = [
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            }

        ]

        const SrchFillColumns = [
            { Header: 'HCMGR-ID', accessor: 'id' },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Email ', accessor: 'email' },
            { Header: 'Phone ', accessor: 'phone' },
            { Header: 'Remove ', accessor: 'remove', Cell: () => <span className='ADd_btn_cstie'>Add</span> }
        ]

        const SrchFillData = [
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            },
            {
                id: '0011257',
                name: 'John Smith',
                email: 'smith@gmail.com',
                phone: '9876543321',
                remove: ''
            }

        ]


        return (
            <div className={'customModal ' + (this.props.showModal ? ' show' : '')}>
                <div className="cstomDialog widBig">
                    <h3 className="cstmModal_hdng1--">
                        Edit 'CAB Day' Information
                        <span className="closeModal icon icon-close1-ie" onClick={this.props.closeModal}></span>
                    </h3>
                    <form id="EditCab_form" method="post" autoComplete="off">

                        <div className='row'>

                            <div className='col-md-3'>
                                <div className="csform-group">
                                    <label>Action Type</label>
                                    <h3 className='QId'><b>CAB Day</b></h3>
                                </div>
                            </div>

                            <div className="col-md-4">

                                <div className="csform-group">
                                    <label>Status:</label>
                                    <div className="cmn_select_dv ">
                                        <Select name="view_by_status"
                                            required={true}
                                            simpleValue={true}
                                            searchable={false}
                                            Clearable={false}
                                            placeholder="Select Status"
                                            options={options}
                                            onChange={(e) => this.setState({ status: e })}
                                            value={this.state.status}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="col-md-5">

                                <div className="csform-group">
                                    <label>Location:</label>
                                    <div className="cmn_select_dv ">
                                        <Select name="view_by_status"
                                            required={true}
                                            simpleValue={true}
                                            searchable={false}
                                            Clearable={false}
                                            placeholder="Select Location"
                                            options={options}
                                            onChange={(e) => this.setState({ location: e })}
                                            value={this.state.location}
                                        />
                                    </div>
                                </div>

                            </div>


                        </div>
                        {/* row ends */}


                        <div className='row'>

                            <div className='col-md-4'>
                                <div className="csform-group ">
                                    <label>Assign to User:</label>
                                    <div className="cmn_select_dv dropDwnType2">
                                        <Select name="view_by_status"
                                            required={true} simpleValue={true}
                                            searchable={true} Clearable={false}
                                            placeholder=" "
                                            options={options}
                                            onChange={(e) => this.setState({ UserAssign: e })}
                                            value={this.state.UserAssign}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* row ends */}

                        <div className='row'>

                            <div className="col-md-4">
                                <div className="csform-group">
                                    <label>Due Date:</label>
                                    <DatePicker
                                        selected={this.state.dueDate}
                                        className="csForm_control"
                                        onChange={(e) => { this.setState({ dueDate: e }) }}
                                        dateFormat="dd-MM-yyyy"
                                        name="tempDueDate"
                                        autoComplete={'off'}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="csform-group">
                                    <label>Start Time:</label>
                                    <DatePicker
                                        selected={this.state.startTime}
                                        className="csForm_control"
                                        onChange={(e) => { this.setState({ startTime: e }) }}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        dateFormat="h:mm a"
                                        timeCaption="Time"
                                        autoComplete={'off'}
                                    />
                                </div>
                            </div>

                            <div className="col-md-2">
                                <div className="csform-group">
                                    <label>Duration:</label>
                                    <input type="text" name="answer0" className="csForm_control" />
                                </div>
                            </div>

                        </div>
                        {/* row ends */}

                        <div className='bor_bot1 row mr_tb_20'></div>
                        <div className='row'>
                            <div className="col-md-6">
                                <h3><strong>Accepted Applicant/s</strong></h3>
                            </div>
                            <div className="col-md-6 text-right">
                                <h5><strong>9/10 Applicants</strong>(1 Space left)</h5>
                            </div>

                            <div className='col-md-12'>

                                <div className="data_table_cmn tableType2 createACtion_Table1 editCabTable1 cmnScrollBar__">
                                    <ReactTable
                                        columns={columns}
                                        manual
                                        data={acceptAplliData}
                                        className="-striped -highlight"
                                        noDataText="No Record Found"
                                        minRows={1}
                                    //ref={this.reactTable}
                                    />
                                </div>

                            </div>

                        </div>
                        {/* row ends */}

                        <div className='row'>
                            <div className="col-md-12">
                                <label>Search for an Applicant to Add</label>
                            </div>
                        </div>

                        <div className="row d-flex align-items-center">

                            <div className="col-md-8 col-sm-8 col-xs-12">

                                <div className="csform-group">

                                    <div className="search_bar right">
                                        <input type="text" className="srch-inp" placeholder="Search.." />
                                        <i className="icon icon-search2-ie"></i>
                                    </div>
                                </div>

                            </div>

                            <div className="col-md-4 col-sm-4 col-xs-12">

                                <div className="csform-group">

                                    <div className="cmn_select_dv">
                                        <Select name="view_by_status"
                                            required={true} simpleValue={true}
                                            searchable={false} Clearable={false}
                                            placeholder="Filter by: All"
                                            options={options}
                                            onChange={(e) => this.setState({ filterSearch: e })}
                                            value={this.state.filterSearch}
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>
                        {/* row ends */}


                        <div className='row'>

                            <div className='col-md-12'>

                                <div className="data_table_cmn SrchFiltTable__">
                                    <ReactTable
                                        showPagination={false}
                                        columns={SrchFillColumns}
                                        manual
                                        data={SrchFillData}
                                        className="-striped -highlight"
                                        noDataText="No Record Found"
                                        minRows={1}
                                    />
                                </div>

                            </div>

                        </div>
                        {/* row ends */}

                        <div className="row trnMod_Foot__ disFoot1__">
                            <div className="col-sm-12 no-pad text-right">
                                <button type="submit" className="btn cmn-btn1 create_quesBtn">Save Task & Resend Email Invitation</button>
                            </div>
                        </div>


                    </form>

                </div>
            </div>
        );
    }
}
export default EditCabInfo;