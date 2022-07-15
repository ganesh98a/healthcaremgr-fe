import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, css, currencyFormatUpdate, toastMessageShow } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon,ToastContainer,Toast} from '@salesforce/design-system-react'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import { BASE_URL } from "config.js";
import { openAddEditTimesheetModal } from '../FinanceCommon';
const queryString = require('query-string');

const timesheet_filter_options = [
    { value: "Timesheet No", label: "Timesheet No", field:"timesheet_no"},
    { value: "Member", label: "Member", field:"member_label"},
    { value: "Shift No", label: "Shift No", field:"shift_no"},
    { value: "Account", label: "Account", field:"account_label"},
    { value: "Status", label: "Status" , field:"ts.status"},
    { value: "Amount", label: "Amount" , field:"amount"},
    { value: "Shift Start Date", label: "Shift Start Date" , field:"scheduled_start_date"},
    { value: "Shift Time", label: "Shift Time" , field:"scheduled_shift_time"},
    { value: "Matches Actual", label: "Matches Actual" , field:"matches_actual"},
]

class Timesheets extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "id": true,
            "shift_no": true,
            "member_label": true,
            "account_label": true,
            "timesheet_no": true,
            "skill_level_label": true,
            "amount": true,
            "status_label": true,
            "scheduled_start_date": true,
            "scheduled_shift_time": true,
            "matches_actual": true,
            "actions": true
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            openCreateModal: false,
            timesheet_id: '',
            searchVal: '',
            filterVal: '',
            row_selections: [],
            timesheets_list: [],
            status_options: [],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            showselectedfilters: false,
            showselectfilters: false,
            show_toast: false,
            import_id: '',
            data_msg: '',
            fetchbtn: false
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * changing the state when checkboxes are ticked/unticked
     */
     handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
        var newselection = [];
        for (let i = 0; i < selection_count; i++) { 
            if(dataSelection[i].status == 2 && dataSelection[i].keypay_emp_id) {
                newselection.push(dataSelection[i]);
            }
        }
        var newselection_count = newselection.count;

		this.setState({ selection: newselection, checkedItem: newselection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};

    /**
     * when checkboxes are clicked inside the data table
     */
     handleCheckboxSelect = (e) => {
        let data = this.state.selection;
        let tempArr = [];
        for (let i = 0; i < data.length; i++) {
            tempArr.push(data[i].id);
        }
        this.setState({row_selections: tempArr});
    }

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection:[], row_selections:[] });
    }

    /**
     * Close the modal when user saves the timesheet
     */
    closeAddEditTimesheetModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.refreshListView();
        }
    }

    /**
     * refreshing the list view
     */
    refreshListView = () => {
        this.setState({refreshListView: !this.state.refreshListView})
    }

    /**
     * Open create payrate modal
     */
    showModal = (item,action='') => {
        if(action === 'edit') {
            this.setState({ openCreateModal: true, timesheet_id: item.id });
        }
        else if(action === 'delete') {
            
        }
        else {
            this.setState({ openCreateModal: true });
        }
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_timesheet_statuses();
    }

    /**
     * fetching the timesheet statuses
     */
    get_timesheet_statuses = () => {
		postData("finance/FinanceDashboard/get_timesheet_statuses", {}).then((res) => {
			if (res.status) {
				this.setState({ 
					status_options: (res.data)?res.data:[]
				})
			}
		});
    }

    /**
     * fetching the paid timesheets from keypay and updating hcm timesheet status
     */
    get_paid_keypay_timesheets = () => {
        this.setState({fetchbtn: true});
        postData('finance/FinanceDashboard/get_paid_keypay_timesheets', { id: this.state.row_selections }).then((result) => {
            if (result.status) {
                this.setState({show_toast: true, import_id: result.import_id, data_msg: result.data_msg, fetchbtn: false});
                this.refreshListView();
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * bulk publishing timesheets to keypay
     */
    create_bulk_keypay_timesheet = () => {
        if(this.state.row_selections.length <= 0) {
            toastMessageShow("Please select at least one approved timesheet to publish to KeyPay", "e");
            return false;
        }
        postData('finance/FinanceDashboard/create_keypay_timesheet', { id: this.state.row_selections }).then((result) => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.setState({ row_selections: [] });
                this.refreshListView();
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={() => this.showModal()} />
                    <Button label="Publish" onClick={() => this.create_bulk_keypay_timesheet()} />
                    <Button label="Fetch Paid Timesheets" disabled={this.state.fetchbtn} onClick={() => this.get_paid_keypay_timesheets()} />
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
                _label: 'Timesheet',
                accessor: "timesheet_no",
                id: 'timesheet_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/finance/timesheet/details/PARAM1/'},
                    {custom_value: 'timesheet_no'},
                    {param : ['id']},
                ],
                width: '11%'
            },
            {
                _label: 'Support Worker',
                accessor: "member_label",
                id: 'member_label',
                CustomUrl: [{url : ROUTER_PATH + 'admin/support_worker/details/PARAM1/'},
                    {custom_value: 'member_id'},
                    {param : ['member_id']},
                ],
                width: '13%'
            },
            {
                _label: 'Shift',
                accessor: "shift_no",
                id: 'shift_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/details/PARAM1/'},
                    {custom_value: 'shift_id'},
                    {param : ['shift_id']},
                ],
                width: '11%'
            },
            {
                _label: 'Account',
                accessor: "account_label",
                id: 'account_label',
                CustomUrl: [{url : ROUTER_PATH + 'admin/item/participant/details/PARAM1/'},
                {param : ['account_id']}],
                width: '23%'
            },
            {
                _label: 'Amount',
                accessor: "amount",
                id: 'amount',
                width: '9%'
            },
            {
                _label: 'Status',
                accessor: "status_label",
                id: 'status_label',
                width: '10%'
            },
            {
                _label: 'Shift Date',
                accessor: "scheduled_start_date",
                id: 'scheduled_start_date',
                width: '12%'
            },
            {
                _label: 'Shift Time',
                accessor: "scheduled_shift_time",
                id: 'scheduled_shift_time',
                width: '18%'
            },
            {
                _label: 'Matches Actual',
                accessor: "matches_actual",
                id: 'matches_actual',
                width: '6%'
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '4%',
                actionList : [
                    {
                        id: 1,
                        label: 'Edit',
                        value: '1',
                        key: 'edit'
                    },
                    {
                        id: 2,
                        label: 'Delete',
                        value: '2',
                        key: 'delete'
                    }
                ]
            }
        ]
    }

    /**
     * rendering components
     */
    render() {
        this.defualtFilter = queryString.parse(window.location.search);

        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0);

        return (
            <React.Fragment>
            <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                {this.state.show_toast ? <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <ToastContainer>
                        <Toast
                            labels={{
                                heading: [
                                    this.state.data_msg,
                                ],
                                headingLink: this.state.import_id ? 'Download' : '',
                            }}
                            onClickHeadingLink={() => {
                                const import_id = this.state.import_id;
                                window.location=BASE_URL + "finance/FinanceDashboard/download_import_stats?id=" + import_id;
                            }}
                            onRequestClose={() => {
                                this.setState({show_toast: false})
                            }}
                            variant="info"
                            className="toastdiv"
                        />
                    </ToastContainer>
                </IconSettings> : ''}
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <DataTableListView
                        page_name="Timesheets"
                        header_icon="timesheet"
                        icon_style={{display:'inherit'}}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            timesheet_filter_options
                        }
                        list_api_url="finance/FinanceDashboard/get_timesheets_list"
                        filter_api_url='finance/FinanceDashboard/get_timesheets_list'
                        related_type="timesheets"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        list_control_option={this.state.list_control_option}
                        filter_title="All Timesheets"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={() => this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        custom_filter_status_option={this.state.status_options}
                        selectRows="checkbox"
                        sortColumnLabel="ID"
                        sortColumn="id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}

                        showModal={this.showModal}
                    />
                </IconSettings>
                {openAddEditTimesheetModal(this.state.timesheet_id, this.state.openCreateModal, this.closeAddEditTimesheetModal, undefined)}
            </div>

            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'Timesheet',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Timesheets);