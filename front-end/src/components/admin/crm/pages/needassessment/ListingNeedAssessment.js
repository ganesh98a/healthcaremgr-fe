import {PageHeaderControl} from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { css, postData } from 'service/common.js';
import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
import CreateNeedAssessmentPopUp from './CreateNeedAssessmentBox';



/* const queryString = require('query-string'); */

/* 
const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/NeedAssessment/get_need_assessment_list', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
}; */

const selectApplicationsFilterOptions = [
    { field: "need_assessment_number", label: "Id", value: "Id", order: "1" },
    { field: "title", label: "Title", value: "Title", order: "2" },
    { field: "account", label: "Account", value: "Account", order: "3" },
    { field: "status", label: "Status", value: "Status", order: "4" },
    { field: "owner_name", label: "Assigned To", value: "Assigned To", order: "5" },
    { field: "created", label: "Created Date", value: "Created Date", order: "6" },
    { field: "created_by", label: "Created By", value: "Created By", order: "7" }
]

class ListingNeedAssessment extends Component {

    static defaultProps = {
        displayed_columns: {
            'need_assessment_number': true,
            'title': true,
            'account': true,
            'status': true,
            'owner_name': true,
            'created': true,
            'created_by': true      
        }
    }
    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])

        this.state = {
            searchVal:'',
            filterVal: '',
            needassessmentList: [],
            filter_status: 'all',
            filter_need_assessment_status: 'all',
            needassessment_status_option: [],
            selection: [],
            refreshTable: true,
            showselectedfilters: false,
            showselectfilters: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openOppBox: false
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    
/*     fetchData = (state) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                needassessmentList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    } */

    getOptionsStatus = () => {
        postData('sales/NeedAssessment/get_need_assessment_status_option', {}).then((result) => {
            if (result.status) {
                var data = [{ value: "all", label: "All" }, ...result.data]
                this.setState({ needassessment_status_option: data })
            }
        });
    }
    componentDidMount() {
        $(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');

        this.getOptionsStatus();
        this.get_owner_name();
    }

    componentWillUnmount() {
        $(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

   /*  
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    } */
    /* setTableParams = () => {
        var search_re = { search: this.state.search, filter_need_assessment_status: this.state.filter_need_assessment_status };
        this.setState({ filtered: search_re });
    } */

    handleOnRenderActions = () => {
        const handleOnClickNewNeedAssessment = e => {
            e.preventDefault()
            this.showModal(0)
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/crm/opportunity/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewNeedAssessment}>
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * setting the column headers in the listing table
     */
     determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "need_assessment_number",
                id: 'need_assessment_number',
               
            },
            {
                _label: 'Title',
                accessor: "title",
                id: 'title',
                CustomUrl: [{url : ROUTER_PATH + 'admin/crm/needassessment/PARAM1'},
                 {param: ['need_assessment_id']}, {property: 'target=_blank'}]       
            },            
            
            {
                _label: 'Account',
                accessor: "account",
                id: 'account',
            },            
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
            },
            {
                _label: 'Assigned To',
                accessor: "owner_name",
                id: 'owner_name',
                
            },
            {
                _label: 'Created Date',
                accessor: "created",
                id: 'created',
                CustomDateFormat: "DD/MM/YYYY"
            },{

                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
                
            }
        ]
    }
    showModal = (oppId) => {
        this.setState({ openOppBox: true, oppId: oppId }, () => {
           /*  var tempPageTitle = '';
            if (this.state.oppId > 0)
                tempPageTitle = 'Edit Need Assessment'
            else
                tempPageTitle = 'New Need Assessment'

            this.setState({ pageTitle: tempPageTitle }) */
            this.setState({ pageTitle: 'New Need Assessment' })
        })
    }
    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable});
    }
    closeModal = (param) => {
        this.setState({ openOppBox: false }, () => {
            /*    this.setTableParams() */
                this.refreshListView();
        });
    }

    resetSelection() {
        this.setState({ selection: [] });
    }
    handleChanged = (event, data) => {
        this.setState({ selection: data.selection });
    };

    /**
     * get the owner name
     */
     get_owner_name = () => {
        postData("sales/Opportunity/get_owner_staff_search", {}).then((res) => {
            this.setState({owner_names : res});
        });
    }

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        const columns = this.determineColumns()
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)

        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                        <DataTableListView
                        page_name="Needs Assessments"
                        header_icon="file"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectApplicationsFilterOptions
                        }
                        select_filter_owner_name_options={this.state.owner_names}
                        list_api_url="sales/NeedAssessment/get_need_assessment_list"
                        related_type="need_assessment"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Needs Assessments"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}   
                        sortColumnLabel="Date Applied"
                        sortColumn="created"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshTable}
                        show_filter_icon = {true}
                    />
                   
                </div>

                {this.state.openOppBox ? <CreateNeedAssessmentPopUp openOppBox={this.state.openOppBox}
                 closeModal={this.closeModal} oppId={this.state.oppId} pageTitle={this.state.pageTitle} data={this.state} /> : ''}
            </React.Fragment>
            
        )
    }

}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListingNeedAssessment);