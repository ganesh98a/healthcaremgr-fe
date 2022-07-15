import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import moment from "moment";
import 'react-table/react-table.css'
import { postData, checkLoginWithReturnTrueFalse, getPermission, css, toastMessageShow } from 'service/common.js';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import jQuery from "jquery";
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import '../../../scss/components/admin/crm/pages/contact/ListContact.scss'

import {
    Checkbox,
    IconSettings,
    ButtonGroup,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger,
} from '@salesforce/design-system-react'
import DataTableListQuickFilter from '../../../oncallui-react-framework/view/ListView/DataTableListQuickFilter.jsx'
import { getDataListById } from '../../../actions/CommonAction.js';
import { openAddEditShiftModal } from '../../../schedule/ScheduleCommon';

const queryString = require('query-string');

/**
 * RequestData get the detail of roster
 * @param {int} rosterId
 */
 const requestRTData = (rosterId) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { participant_id: rosterId };
        postData('item/participant/get_participant_detail_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }
        });
    });
};

class ParticipantShiftList extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "shift_no": true,
            "roster_no": true,
            "member_fullname": true,
            "status_label": true,
            "scheduled_start_datetime": true,
            "scheduled_end_datetime": true,
            "actions": true,
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props
     */
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            filterVal: '',
            end_date: null,
            start_date: null,
            applicantList: [],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            flageModel: false,
            filter_val: '',
            status_option: [{label: 'All', value:0}],
            request_data: { participant_id: this.props.match.params.id },
            participant_id: this.props.match.params.id,
            selection: [],
            refreshTable: false,
            openCreateMember: false,
            checkedItem: 0,
            shift_id: '',
            rosterDetails: '',
            filter_status: 'all',
            pageSize: 20,
            page: 0,
            sorted: [],
            filtered: {},
            last_created_id:null,
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * to fetch the filtered data by setting required props and calling the request data function
     */
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        let Request = this.props.request_list_data;
        Request['pageSize'] = this.props.currentPage > 0 ? (this.props.pageSize * this.props.currentPage) : this.props.pageSize;
        Request['page'] = this.props.page;
        Request['participant_id'] = this.state.participant_id;
        Request['sorted'] = state.sorted;
        Request['filtered'] = Request.filtered || {};
        Request['filtered']['filter_status'] = state.filtered.filter_status || '';
        Request['page_name'] = 'participants';
        this.props.getListByIdProps('schedule/Roster/get_associated_shift_list', Request, true);
        this.props.setListRequestdProps(Request);
        this.setState({ loading: false, request_data: Request });
    }

    /**
     * Call requestRTData
     * param {int} id
     */
     getRTetails = (id) => {
        requestRTData(
            id,
        ).then(res => {
            var ros_id = this.props.match.params.id;
            var raData = res.data;
            if (raData) {
                this.setState(raData);
                var account = {
                        label: raData.name,
                        value: ros_id,
                        account_type: 1,
                    };
                var owner = {
                    value: raData.owner_id,
                    label: raData.owner_label
                };
                this.setState({ rosterDetails: { account: account, participant_id: ros_id, owner: owner } });
            }

        });
    }

    /**
     * fetching the statuses of shift
     */
     get_shift_status = () => {
        // status_option
        postData('schedule/ScheduleDashboard/get_shift_statuses', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: 'all' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ status_option: data });
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        var participant_id = this.props.match.params.id;
        this.getRTetails(participant_id);
        this.get_shift_status();
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery('body').removeClass('datatablelist-view');
    }

    /**
     * hanlding quick search submission
     * @param {*} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    filterChange = (key, value) => {
        this.setState({ [key]: value },() => {
            this.setTableParams();
        });
    }

    setTableParams = () => {
        let filtered = { 
            search: this.state.search, 
            filter_status: this.state.filter_status 
        };
        this.setState({ filtered: filtered }, () => {
            this.fetchData(this.state);
        });
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Shift',
                accessor: "shift_no",
                id: 'shift_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/details/PARAM1/'},
                {custom_value: 'shift_no'},
                {param: ['id']},
                {property: 'target=_blank'}]
                
            },
            {
                _label: 'Roster ID',
                accessor: "roster_no",
                id: 'roster_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/roster/PARAM1/'},
                {param : ['roster_id']}]
            },
            {
                _label: 'Member',
                accessor: "member_fullname",
                CustomUrl: [{url : ROUTER_PATH + 'admin/support_worker/details/PARAM1/'},
                {param : ['member_id']}]
            },
            {
                _label: 'Status',
                accessor: "status_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Scheduled start time',
                accessor: "scheduled_start_datetime",
                id: 'scheduled_start_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Scheduled end time',
                accessor: "scheduled_end_datetime",
                id: 'scheduled_end_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '50px',
                actionList : [
                    {
                        id: 0,
                        label: 'Edit',
                        value: '1',
                        key: 'edit',
                    },
                ]
             }           
        ]
    }

    /**
     * prepating the filter selection panel (secondary)
     */
     showSelectFilterPanel() {
        let filter_option = this.state.status_option;
        return (
            <PageHeaderControl>
                <Dropdown
                    align="right"
                    checkmark
                    assistiveText={{ icon: 'Filter by status' }}
                    iconCategory="utility"
                    iconName="settings"
                    iconVariant="more"
                    options={filter_option}
                    onSelect={option => this.filterChange('filter_status', option.value)}
                    length={null}
                >
                    <DropdownTrigger title={`Filter by status`}>
                        <Button
                            assistiveText={{ icon: 'Filter' }}
                            iconCategory="utility"
                            iconName="filterList"
                            iconVariant="more"
                            variant="icon"
                        />
                    </DropdownTrigger>
                </Dropdown>
            </PageHeaderControl>
        )
    }

    handleOnRenderActions() {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="New" id="create_shift_btn" title={`Create Shift`} disabled={Number(this.state.stage) > 1 || false} onClick={() => this.setState({ openCreateModal: true }) }/>
                </ButtonGroup>
            </PageHeaderControl>
        );
    }

    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable,selection:[], checkedItem: 0},()=>{this.fetchData(this.state)})
    }


    /**
     * Render Modal
     * - Create Shift
     */
     renderModal = () => {
        return (
            <React.Fragment>
            {
                openAddEditShiftModal(this.state.shift_id, this.state.openCreateModal, this.closeAddEditShiftModal, undefined, this.state.rosterDetails, 'participants')
            }
            </React.Fragment>
        );
    }

    /**
     * Close the modal when user save the shift and refresh the table
     */
     closeAddEditShiftModal = (status,id=null) => {
        this.setState({openCreateModal: false, shift_id: '',last_created_id:id});

        if(status){
            this.fetchData(this.state);
        }
    }

    /**
     * Open create shift modal
     */
     showModal = (item, action) => {
        if(action === 'edit' && item.is_shift_locked) {
            toastMessageShow("This Shift " + item.shift_no + " is opened at another location for " + action, "e");
            return false;
        }

        this.setState({ openCreateModal: true, shift_id: (action == 'edit') ? item.id : '' });

    }

    /**
     * rendering components
     */
    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.determineColumns();
        let request_data = this.state.request_data;

        const trail = [
            <Link to={ROUTER_PATH + `admin/item/participant`} className="reset slds-truncate" style={{ color: '#0070d2' }} id="job-list">Participants</Link>,
            <Link to={ROUTER_PATH + `admin/item/participant/details/`+this.state.participant_id} className="slds-truncate reset" style={{ color: '#0070d2' }} id="jroster-details">{this.state.name}</Link>,
		];
        let pageComponentValue = {
            variant: 'related-list',
            title: 'Shifts',
            trail: trail,
            icon: {
                title: 'Shifts',
                category: 'standard',
                name: 'date_input',
                backgroundColor: '#51a2e0',
                fill: '#ffffff'
            },
            inputSearch: {
                search: true,
                placeholder: 'Search Shifts',
                id: 'list_shift_input_search'
            },
            columns: {
                columns: true,
                list: columns,
            },
            filter: {
                quick_filter: false,
                dropdown_filter: true,
                filterComponent: this.showSelectFilterPanel.bind(this)
            }
        };
        return (
            <React.Fragment>
            <div className="slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <DataTableListQuickFilter
                        ref='child'
                        page_header={false}
                        pageSize={20}
                        page_name={'participants'}
                        pageComponentValue={pageComponentValue}
                        pageHeaderComponent={''}
                        pageTableColumns={columns}
                        header_icon="file"
                        displayed_columns={this.state.displayed_columns}
                        default_displayed_columns={this.state.default_displayed_columns}
                        list_api_url="schedule/Roster/get_associated_shift_list"
                        request_data={request_data}
                        related_type="application"
                        filter_status="all"
                        determine_columns={this.determineColumns}
                        refresh={this.state.refreshTable}
                        sortColumnLabel="ID"
                        sortColumn="created"
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        selectRows=""
                        info={false}
                        showModal={this.showModal}
                    />
                </IconSettings>
                <input type="hidden" id="last_created_id" value={this.state.last_created_id}/>
            </div>
            {this.renderModal()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    showPageTitle: 'ShiftListPage',
    showTypePage: state.RecruitmentReducer.activePage.pageType,
    dataTableValues: state.CommonReducer.dataTableValues,
    pageSize: state.CommonReducer.dataTableValues.pageSize || 0,
    items: state.CommonReducer.dataTableValues.items || [],
    prevItems: state.CommonReducer.dataTableValues.prevItems || [],
    pages: state.CommonReducer.dataTableValues.pages || 0,
    totalItem: state.CommonReducer.dataTableValues.totalItem || 0,
    hasMore: state.CommonReducer.dataTableValues.hasMore || 0,
    currentPage : state.CommonReducer.dataTableValues.currentPage  || 0,
    request_list_data: state.CommonReducer.request_list_data
})

const mapDispatchtoProps = (dispatch) => {
    return {
        getListByIdProps: (api_url, request, clear_all) => dispatch(getDataListById(api_url, request, clear_all)),
        setListRequestdProps: (request) => dispatch({ type: 'SET_DATA_TABLE_LIST_REQUEST', data: request}),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantShiftList);