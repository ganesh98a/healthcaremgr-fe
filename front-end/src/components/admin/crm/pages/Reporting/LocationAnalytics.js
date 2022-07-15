import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import 'react-table/react-table.css';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { ROUTER_PATH } from '../../../../../config.js';
import { connect } from 'react-redux';
import CrmPage from '../../CrmPage';
import { checkItsNotLoggedIn,getPermission, postData } from '../../../../../service/common.js';
import MapContainer from './MapContainer.jsx';
const requestData = ( filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = JSON.stringify({  filtered: filtered });
        postData('crm/CrmReporting/location_analytics', Request).then((result) => {
            let filteredData = result;

            const res = {
                rows: filteredData

            };
            resolve(res);
        });

    });
};
class LocationAnalytics extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);

        this.state = {
            key: 1,
            filterVal: 0,
            data:''
        };
    }

    handleSelect(key) {
        this.setState({ key });
    }
    componentWillMount (){
      this.fetchData();
    }
    fetchData = ()=>{
    requestData(
      this.state.filterVal
    ).then(res => {
      this.setState({
            data: res.rows,
            loading: false
        });
    });
  }
    render() {
        var options = [
            { value: '0', label: 'All' },
            { value: '1', label: 'Contact' },
            { value: '2', label: 'Intake' },
            { value: '3', label: 'Plan Delegation' }
        ];
        return (

            <div className="container-fluid">
            <CrmPage pageTypeParms={'report_location_analytics'}/>
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
                                    {this.props.showPageTitle}
                                    </div>
                            </div>
                        </div>
                        <div className="row"><div className="col-md-12"><div className="bt-1"></div></div></div>
                    </div>
                </div>

                <div className="row mt-5">


                    <div className="col-lg-12">

                        <div className="row my-3">
                            <div className="col-md-3">
                                <div className="s-def1  my-3">
                               <p className="my-1"><b>View Participants in Area:</b></p>
                                    <Select
                                        name="view_by_status"
                                        options={options}
                                        required={true}
                                        simpleValue={true}
                                        searchable={false}
                                        clearable={false}
                                        placeholder="Filter by: Stages"
                                        onChange={(e) => this.setState({ filterVal: e },()=>this.fetchData())}
                                        value={this.state.filterVal}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12 map_loca_analytic">
                             <MapContainer markers={this.state.data} filter={this.state.filterVal} />

                            </div>
                        </div>


                    </div>

                </div>




            </div>

        );
    }
}

const mapStateToProps = state => {
      return {
        showPageTitle: state.DepartmentReducer.activePage.pageTitle,
        showTypePage: state.DepartmentReducer.activePage.pageType,

      }
  };
export default connect(mapStateToProps)(LocationAnalytics);
