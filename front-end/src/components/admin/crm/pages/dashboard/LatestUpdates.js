import React, { Component } from 'react';
import ReactTable from "react-table";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { allLatestUpdate } from '../../actions/DashboardAction.js';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../../../../../config.js';
import CustomTbodyComponent from './CustomTbodyComponent';

class LatestUpdates extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeCol: '',
            crmlogsList: [],
            filterVal: '',
            allLatestUpdates: []
        }
    }

    componentWillMount() {
        this.props.allLatestUpdate()
        .then((result) => {
            this.setState({ allLatestUpdates: result })
            let filteredData = result;
            const res = {
                rows: filteredData,
                // pages: (result.count)
            };
        });
    }

    render() {
        const { data, pages, loading } = this.state;
        const TheadComponent = props => null;
        const columns = [{
            className: 'update_td_set',
            Header: '', accessor: 'name', filterable: false, Cell: row => {
                return (

                    <div className="stats_ups" key={row.original.id}>
                        <div className="sts_dtie flex-wrap text-left">
                            <div className="text_break_all pb-2">{row.original.title}</div>
                            <span className="text_break_all" style={{ paddingLeft: '0px' }}>{row.original.created}</span>
                        </div>
                        <div className="sts_bdy">
                            <div className="">
                                <h6 className="sts_co text_break_all"><strong>Participant: </strong>{row.original.participant_name}</h6>
                                <h6 className="pb-2 text_break_all"><strong>Action:</strong> {row.original.action}</h6>
                                <h6 className="pb-2 text_break_all"><strong>User:</strong> {row.original.FullName}</h6></div>
                            <div className="sts_footer">
                                <ul className="subTasks_Action__">
                                    {/* <li><span className="sbTsk_li">Dismiss</span></li> */}
                                    <li><span className="sbTsk_li" > <Link to={ROUTER_PATH + 'admin/crm/participantdetails/' + row.original.userId} title="View" >View</Link></span></li>
                                </ul>
                            </div>
                        </div>
                    </div>


                );
            }
        }]
        return (

            <div className="Req-Dashboard_tBL Req-Latest-Updates_tBL">
                <div className="PD_Al_div1">
                    <div className="PD_Al_h_txt pt-3 lt_heads">Latest Updates</div>
                    {
                        <div className="listing_table PL_site th_txt_center__ odd_even_tBL   odd_even_marge-1_tBL line_space_tBL H-Set_tBL ">
                            <ReactTable
                                columns={columns}
                                manual
                                data={this.state.allLatestUpdates}
                                // pages={this.state.pages}
                                loading={this.state.loading}
                                // onFetchData={this.fetchData}
                                defaultPageSize={10}
                                TbodyComponent={CustomTbodyComponent}
                                noDataText="No Updates"
                                className="-striped -highlight "
                                showPagination={false}
                                TheadComponent={_ => null}

                            />
                            <br />
                        </div>
                    }
                    <Link className="btn-1 w-100" to={ROUTER_PATH + 'admin/crm/prospectiveparticipants'}  >View All</Link>
                </div>
            </div>
        )
    }
}


const mapStateToProps = state => {
    return {

    }
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    allLatestUpdate
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(LatestUpdates);
