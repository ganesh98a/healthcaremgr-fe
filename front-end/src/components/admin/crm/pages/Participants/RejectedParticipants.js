import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import ReactTable from "react-table";
// import 'react-table/react-table.css';
// import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { checkItsNotLoggedIn, postData, IsValidJson, getOptionsCrmMembers, getPermission, input_kin_lastname, getOptionsSuburb, handleRemoveShareholder, handleShareholderNameChange, handleAddShareholder, getQueryStringValue }
  from '../../../../../service/common.js';

import { BASE_URL, ROUTER_PATH } from '../../../../../config';
import { connect } from 'react-redux';
import CrmPage from '../../CrmPage';
import Pagination from "../../../../../service/Pagination.js";

import { TrComponent, getTrProps } from 'service/ReactTableTrProgressBar'
import { PAGINATION_SHOW } from '../../../../../config.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

const requestData = (pageSize, page, sorted, filtered) => {
  return new Promise((resolve, reject) => {

    // request json
    var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });
    postData('crm/CrmParticipant/list_prospective_participant', Request).then((result) => {
      let filteredData = result.data;
      const res = {
        rows: filteredData,
        pages: (result.count)
      };
      resolve(res);
    });

  });
};

class RejectedParticipants extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      key: 1,
      permissions: (getPermission() == undefined) ? [] : JSON.parse(getPermission()),

    };
  }

  handleSelect(key) {
    this.setState({ key });
  }

  render() {

    return (

      <div className="container-fluid">
        <CrmPage pageTypeParms={'rejected_participants'} />
        <div className="row">
          <div className="col-lg-12">
            <div className="py-4 bb-1">
              <a className="back_arrow d-inline-block" onClick={() => this.props.props.history.goBack()} >
                <span className="icon icon-back1-ie"></span>
              </a>
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

        <div className="row">
          <div className="col-lg-12">
            <div className="Crm-Applicant_tBL">
              <ListRejectedParticipant addclass="listing_table PL_site th_txt_center__ odd_even_tBL  line_space_tBL H-Set_tBL table_progress" />
            </div>
          </div>
        </div>
      </div>


    );
  }
}



class ListRejectedParticipant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterVal: '4', showModal: false,
      p_participantList: [],
      counter: 0,
      loading: false,
      search_by: '',
      filtered: { search: '', filterVal: 4, search_by: '' }
    };


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
        p_participantList: res.rows,
        pages: res.pages,
        loading: false
      });
    });
  }


  closeModal = () => {
    this.setState({ showModal: false })
  }

  showModal = () => {
    this.setState({
      showModal: true, state: {
        filterVal: '', showModal: false,
        p_participantList: [],
        counter: 0,
        loading: false,
      }
    })
  }

  submitSearch = (e) => {
    e.preventDefault();
    var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, search_by: this.state.search_by }
    this.setState({ filtered: srch_ary });

  }

  searchData = (key, value) => {
    var srch_ary = { search: this.state.search, filterVal: this.state.filterVal, search_by: this.state.search_by };
    srch_ary[key] = value;
    this.setState(srch_ary);
    this.setState({ filtered: srch_ary });
  }
  componentWillMount() {
    this.searchData('filterVal', '5');
  }


  render() {
    const { data, pages, loading } = this.state;


    const now = 10;

    const columns = [
      {
        accessor: "ndis_num",
        Header: () => <div> <div className="ellipsis_line1__">NDIS No</div></div>,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        accessor: 'FullName',
        Header: () => <div><div className="ellipsis_line1__">Participant Name</div></div>,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>,
        filterable: false, maxWidth: 200
      },

      {
        accessor: "latest_stage_name",
        Header: () => <div><div className="ellipsis_line1__">Stage</div></div>,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        accessor: "assigned_to",
        Header: () => <div><div className="ellipsis_line1__">Assigned To</div></div>,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        accessor: "date",
        Header: () => <div><div className="ellipsis_line1__">Intake Rejection Date</div></div>,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
      },
      {
        accessor: "intake_type",
        Header: () => <div><div className="ellipsis_line1__">Intake Type</div> </div>,
        className: '_align_c__',
        Cell: props => <span>{defaultSpaceInTable(props.value)}</span>,
        headerStyle: { border: "0px solid #fff" },
      },
      {

        expander: true,
        Header: () => <strong></strong>,
        width: 55,
        headerStyle: { border: "0px solid #fff" },
        Expander: ({ isExpanded, ...rest }) =>

          <div className="expander_bind">
            {isExpanded ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i> : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
          </div>,
        accessor: "id",
        style: {
          cursor: "pointer",
          fontSize: 25,
          padding: "0",
          textAlign: "center",
          userSelect: "none"
        },

      }

    ]


    const subComponentDataMapper = row => {
      let data = row.row._original;
      return (
        <div className="tBL_Sub applicant_info1">
          <div className="row bor_l_cols bor_top pt-3 bor_bot_b1 pb-3">
            <div className="text-left col-lg-3 col-sm-6 mb-2">
              <div className="txt_t1 mb-3"><b>{data.FullName}</b></div>
              <div className="txt_t2 my-2"><b>NDIS No.: </b> <u>{(data.ndis_num) ? data.ndis_num : 'N/A'}</u></div>
              <div className="txt_t2 my-2"><b>Phone: </b> <u>{(data.phone) ? data.phone : 'N/A'}</u></div>
              <div className="txt_t2 my-2"><b>Email: </b> <u>{(data.email) ? data.email : 'N/A'}</u></div>
            </div>
            <div className="text-left br-1 col-lg-3 col-sm-6 mb-2 br-sm-0">
              <div className="txt_t2"><b>Address: </b> <u>{(data.address) ? data.address : 'N/A'}</u></div>
            </div>
            <div className="text-left  br-1 col-lg-3 col-sm-12 mb-2 bt-sm-1 pt-sm-3">
              <div className="txt_t2"><b>Last Seen Ago: </b>{(data.updated)}</div>

            </div>
            <div className="text-left col-lg-3 col-sm-12 mb-2">
              <div className="txt_t2 my-2"><b>Reference: </b>{(data.ref_name) ? data.ref_name : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Email: </b>{(data.ref_email) ? data.ref_email : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Phone: </b>{(data.ref_phone) ? data.ref_phone : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Organisation: </b>{(data.ref_org) ? data.ref_org : 'N/A'}</div>
              <div className="txt_t2 my-2"><b>Relationship to Participant: </b>{(data.ref_relation) ? data.ref_relation : 'N/A'}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 ">
              <div className="applicant_info_footer_1">
                <div className="no_pd_l">
                  <Link to={ROUTER_PATH + 'admin/crm/participantdetails/' + data.id} title='View'>
                    <button className="btn cmn-btn1 apli_btn__ eye-btn">More Information</button>
                  </Link>
                </div>
                <div className="no_pd_r">
                </div>
              </div>
            </div>
          </div>


          <div className="progress-img"></div>
          <div className="progress-b1">
            <div className="overlay_text_p0">Intake Progress  {(data.now.level) ? data.now.level : now}% Complete</div>
            <ProgressBar className="progress-b2" now={(data.now.level) ? data.now.level : now} >
            </ProgressBar>
          </div>
        </div>
      );
    }

    return (

      <React.Fragment>

        <form className="w-100" onSubmit={this.submitSearch}>
          <div className="row _Common_Search_a justify-content-between after_before_remove">
            <div className="col-md-7">
              <div className="search_bar ad_search_btn right srchInp_sm actionSrch_st">
                <input type="text" className="srch-inp" name="search" value={this.state.search || ''} onChange={(e) => this.setState({ 'search': e.target.value })} />
                <button type="submit"><i className="icon icon-search2-ie"></i></button>
              </div>
            </div>
          </div>
        </form>
        <div className="bt-1 mb-4"></div>


        <div className={this.props.addclass}>
          <ReactTable
            TrComponent={TrComponent}
            getTrProps={getTrProps}
            PaginationComponent={Pagination}
            columns={columns}
            data={this.state.p_participantList}
            pages={this.state.pages}
            loading={this.state.loading}
            onFetchData={this.fetchData}
            defaultPageSize={10}
            className="-striped -highlight"
            loading={this.state.loading}
            filtered={this.state.filtered}
            minRows={1}
            onPageSizeChange={this.onPageSizeChange}
            manual="true"
            previousText={<span className="icon icon-arrow-left privious"></span>}
            nextText={<span className="icon icon-arrow-right next"></span>}
            SubComponent={subComponentDataMapper}
            ref={this.reactTable}
            showPagination={this.state.p_participantList.length >= PAGINATION_SHOW ? true : false}
          />
        </div></React.Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,

  }
};

export default connect(mapStateToProps)(RejectedParticipants);
