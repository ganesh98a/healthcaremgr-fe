import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import ScheduleNavigation from '../../admin/schedule/ScheduleNavigation';
import { checkItsNotLoggedIn, postData, changeTimeZone } from '../../../service/common.js';
import moment from 'moment';
import { RosterDropdown, AnalysisDropdown, rosterFilterOption } from '../../../dropdown/ScheduleDropdown.js';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import Countdown from 'react-countdown-now';
import DatePicker from 'react-datepicker';
import ScheduleMenu from './ScheduleMenu';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RosterHistory from './RosterHistory';
import { PAGINATION_SHOW } from '../../../config';
import { TotalShowOnTable } from '../../../service/TotalShowOnTable';
import SchedulePage from './SchedulePage';
import Pagination from "../../../service/Pagination.js";
import { SchedulePageIconTitle, ParticiapntPageIconTitle } from 'menujson/pagetitle_json';



const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {

        // request json
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
        postData('schedule/ScheduleListing/get_roster', Request).then((result) => {
            let filteredData = result.data;

            const res = {
                rows: filteredData,
                pages: (result.count),
                total_count: (result.total_count),
            };

            resolve(res);
        });

    });
};


class ArchivedDublicateRoster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roster: 'roster',
            analysis: 'analysis',
            loading: false,
            rosterListing: [],
            counter: 0,
            selected: [],
            selectAll: 0,
            start_date: '',
            end_date: '',
            active_panel: 'unfilled'
        }

    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                rosterListing: res.rows,
                pages: res.pages,
                total_count: res.total_count,
                loading: false
            });
        });
    }

    searchBox = (key, value) => {
        var state = {}
        state[key] = value;
        this.setState(state, () => {
            var filter = { search_box: this.state.search_box, roster_type: this.state.roster_type, start_date: this.state.start_date, end_date: this.state.end_date, status: '3,4,5' }
            this.setState({ filtered: filter });
        });
    }

    closeHistory = () => {
        this.setState({ open_history: false })
    }

    render() {


        const columns = [
            { Header: 'ID', className:'_align_c__', accessor: 'id', filterable: false, },
            { Header: 'Participant Name', className:'_align_c__', accessor: 'participantName', filterable: false, },
            { Header: 'Roster Title', className:'_align_c__', accessor: 'title', filterable: false, },
            { Header: 'Start Date', className:'_align_c__', accessor: 'start_date', filterable: false, Cell: props => <span>{changeTimeZone(props.original.start_date, "DD/MM/YYYY")}</span> },
            { Header: 'End Date', className:'_align_c__', accessor: 'end_date', filterable: false, Cell: props => <span>{props.original.end_date ? changeTimeZone(props.original.end_date, "DD/MM/YYYY") : 'N/A'}</span> },

            {
                Cell: (props) => <span className="d-flex w-100 justify-content-center align-item-center"><span title={ParticiapntPageIconTitle.par_history_icon} onClick={() => this.setState({ historyId: props.original.id, open_history: true })} className="short_buttons_01 mr-1">View History</span>
                    <Link title={ParticiapntPageIconTitle.par_view_icon} to={{ pathname: '/admin/schedule/roster_details/' + props.original.id, state: this.props.props.location.pathname }} className="short_buttons_01 ml-1">View Roster</Link>
                </span>, //Header: <div className="">Action</div>,
                Header: <TotalShowOnTable countData={this.state.total_count} />,
                headerStyle: { border: "0px solid #fff" }, sortable: false
            },
        ]

        return (
            <React.Fragment>
                <ScheduleMenu back_url={'/admin/dashboard'} roster={true} />
                <SchedulePage pageTypeParms={'archived_roster'} />

                <div className="row">

                    <div className="col-lg-12 col-sm-12">
                        <div className="tab-content">

                            <div role="tabpanel" className="tab-pane active" id={this.state.active_panel}>


                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="pAY_heading_01 bb-1"><div className="tXT_01">Rosters:</div></div>
                                    </div>
                                </div>

                                <div className="bb-1 mb-4">
                                    <div className="row sort_row1-- after_before_remove">
                                        <div className="col-md-5 col-sm-8 align-self-end">
                                            {/* <label>Search</label> */}
                                            <div className="table_search_new">
                                                <input type="text" onChange={(e) => this.searchBox('search_box', e.target.value)} name="" value={this.state.search_box || ''} />
                                                <button type="submit">
                                                    <span className="icon icon-search"></span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-sm-4 align-self-end">
                                            {/* <label></label> */}
                                            <div className="box">
                                                <Select clearable={false} name="roster_type" simpleValue={true} searchable={false} onChange={(e) => this.searchBox('roster_type', e)}
                                                    options={rosterFilterOption(0)} placeholder="Roster Type/Department" value={this.state.roster_type} />

                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-8 align-self-end">
                                            <div className="row">
                                                <div className="col-md-6 col-sm-6">
                                                    <div className="Fil_ter_ToDo">
                                                        <label>Form</label>
                                                        <div className="cust_date_picker ">
                                                            <DatePicker autoComplete={'off'} isClearable={true} name="start_date" onChange={(e) => this.searchBox('start_date', e)} selected={this.state['start_date'] ? moment(this.state['start_date'], 'DD-MM-YYYY') : null} dateFormat="dd-MM-yyyy" className="text-center px-0" placeholderText="00/00/0000" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 col-sm-6">
                                                    <div className="Fil_ter_ToDo">
                                                        <label >To</label>
                                                        <div className="cust_date_picker right_0_date_piker">
                                                            <DatePicker autoComplete={'off'} isClearable={true} name="end_date" onChange={(e) => this.searchBox('end_date', e)} selected={this.state['end_date'] ? moment(this.state['end_date'], 'DD-MM-YYYY') : null} dateFormat="dd-MM-yyyy" className="text-center px-0" placeholderText="00/00/0000" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 schedule_archived_dublicate_roster_Table">
                                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL">
                                            <ReactTable
                                                PaginationComponent={Pagination}
                                                columns={columns}
                                                manual
                                                data={this.state.rosterListing}
                                                pages={this.state.pages}
                                                loading={this.state.loading}
                                                onFetchData={this.fetchData}
                                                filtered={this.state.filtered}
                                                defaultFiltered={{ status: '3,4,5' }}
                                                defaultPageSize={10}
                                                className="-striped -highlight"
                                                noDataText="No Record Found"
                                                minRows={2}

                                                previousText={<span className="icon icon-arrow-left privious"></span>}
                                                nextText={<span className="icon icon-arrow-right next"></span>}
                                                showPagination={this.state.rosterListing.length >= PAGINATION_SHOW ? true : false}
                                            />
                                        </div>
                                        <RosterHistory open_history={this.state.open_history} rosterId={this.state.historyId} closeHistory={this.closeHistory} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>


            </React.Fragment>
        );
    }
}

export default ArchivedDublicateRoster
