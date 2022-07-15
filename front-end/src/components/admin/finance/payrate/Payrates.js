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
import { BASE_URL } from "config.js";
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import {openAddEditPayrateModal, showArchivePayrateModal, openImportModal} from "../FinanceCommon";

const queryString = require('query-string');

const payrates_filter_options = [  
    { value: "Category", label: "Category", field:"pay_rate_category_id"},
    { value: "Award", label: "Award", field:"pay_rate_award_id"},
    { value: "Pay Level", label: "Pay Level", field:"pay_level_id"},
    { value: "Skill", label: "Skill" , field:"skill_level_id"},
    { value: "Employment Type", label: "Employment Type" , field:"employment_type_id"},
    { value: "Amount", label: "Amount" , field:"amount"},
    { value: "Start Date", label: "Start Date" , field:"start_date"},
    { value: "End Date", label: "End Date" , field:"end_date"},
]

class Payrates extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "pay_rate_category_label": true,
            "pay_rate_award_label": true,
            "pay_level_label": true,
            "skill_level_label": true,
            "employment_type_label": true,
            "amount": true,
            "status_label": true,
            "formatted_end_date": true,
            "formatted_start_date": true,
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
            openImportModal: false,
            show_toast: false,
            error_msg: '',
            data_msg: '',
            status: '',
            import_id: '',
            pay_rate_id: '',
            searchVal: '',
            filterVal: '',
            payrates_list: [],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            showselectedfilters: false,
            showselectfilters: false,
            selectfilteroptions: [
                { value: "pay_rate_category_label", label: "Category", order: "1" },
                { value: "pay_rate_award_label", label: "Award", order: "1" },
                { value: "pay_level_label", label: "Pay Level", order: "1" },
                { value: "skill_level_label", label: "Skill", order: "1" },
                { value: "employment_type_label", label: "Employment Type", order: "1" },
                { value: "amount", label: "Amount", order: "1" },
                { value: "status_label", label: "Status", order: "1" },
                { value: "start_date", label: "Start Date", order: "2" },
                { value: "end_date", label: "End Date", order: "3" },
            ],
            selectfilteroperatoroptions: [
                { value: "equals", label: "Equals to", symbol: "=" },
                { value: "not_equal", label: "Not equal to", symbol: "!=" },
                { value: "less_than", label: "Less than", symbol: "<" },
                { value: "less_than_equal", label: "Less than equal to", symbol: "<=" },
                { value: "greater_than", label: "Greater than", symbol: ">" },
                { value: "greater_than_equal", label: "Greater than equal to", symbol: ">=" },
                { value: "contains", label: "Contains", symbol: "%.%" },
                { value: "not_contain", label: "Does not contain", symbol: "!%.%" },
                { value: "starts_with", label: "Starts with", symbol: "%" }
            ],
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * fetching the reference data of pay rates
     */
    get_pay_rate_ref_data = () => {
        postData("finance/FinanceDashboard/get_pay_rate_ref_data").then((result) => {
            if (result.status) {
                this.setState(result.data)
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_pay_rate_ref_data();
    }

    /**
     * Open create payrate modal
     */
    showModal = (item,action='') => {
        if(action === 'edit') {
            this.setState({ openCreateModal: true, pay_rate_id: item.id });
        }
        else if(action === 'delete') {
            this.showArchiveModal(item.id);
        }
        else {
            this.setState({ openCreateModal: true });
        }
    }

    /**
     * Open archive payrate modal
     */
    showArchiveModal(pay_rate_id) {
        showArchivePayrateModal(pay_rate_id, this.refreshListView);
    }

    /**
     * Open import payrates modal
     */
    showImportModal() {
        this.setState({ openImportModal: true });
    }

    /**
     * Close the import modal
     */
    closeImportModal = (status, import_id, data_msg, error_msg) => {
        this.setState({openImportModal: false});

        if(status){
            this.setState({show_toast: true, import_id: import_id, data_msg: data_msg, error_msg: error_msg});
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
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Category',
                accessor: "pay_rate_category_label",
                id: 'pay_rate_category_label',
                width: '20%'
            },
            {
                _label: 'Award',
                accessor: "pay_rate_award_label",
                id: 'pay_rate_award_label',
                width: '15%'
            },
            {
                _label: 'Pay Level',
                accessor: "pay_level_label",
                id: 'pay_level_label',
                width: '10%'
            },
            {
                _label: 'Skill',
                accessor: "skill_level_label",
                id: 'skill_level_label',
                width: '10%'
            },
            {
                _label: 'Employment Type',
                accessor: "employment_type_label",
                id: 'employment_type_label',
                width: '12%'
            },
            {
                _label: 'Amount',
                accessor: "amount",
                id: 'amount',
                width: '10%'
            },
            {
                _label: 'Start Date',
                accessor: "formatted_start_date",
                id: 'formatted_start_date',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
            },
            {
                _label: 'End Date',
                accessor: "formatted_end_date",
                id: 'formatted_end_date',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '5%',
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
     * Close the modal when user save the payrate and refresh the table
     */
    closeAddEditPayrateModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.refreshListView();
        }
    }

    /**
     * Render page header actions
     */
     handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={() => this.showModal()} />
                    <Button label="Import" onClick={() => this.showImportModal()} />
                </PageHeaderControl>
            </React.Fragment>
        )
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
                                headingLink: this.state.error_msg ? 'Download' : '',
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
                        page_name="Pay Rates"
                        header_icon="investment_account"
                        icon_style={{display:'inherit'}}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            payrates_filter_options
                        }
                        list_api_url="finance/FinanceDashboard/get_pay_rates_list"
                        filter_api_url='finance/FinanceDashboard/get_pay_rates_list'
                        related_type="payrates"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        list_control_option={this.state.list_control_option}
                        filter_title="All Pay Rates"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={() => this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        showModal={this.showModal}
                    />
                </IconSettings>
            </div>

            {openAddEditPayrateModal(this.state.pay_rate_id, this.state.openCreateModal, this.closeAddEditPayrateModal)}

            {openImportModal(this.state.openImportModal, this.closeImportModal)}

            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'Pay Rate',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Payrates);