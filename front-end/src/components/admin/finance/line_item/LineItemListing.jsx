import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, css, toastMessageShow, AjaxConfirm } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon} from '@salesforce/design-system-react'
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
const queryString = require('query-string');

const line_item_filter_options = [  
    { value: "Support Item No", label: "Support Item No", field:"line_item_number"},
    { value: "Name", label: "Name", field:"line_item_name"},
    { value: "Support Category", label: "Support Category", field:"support_category"},
    { value: "Domain", label: "Domain" , field:"support_outcome_domain"},
    { value: "Support Purpose", label: "Support Purpose" , field:"support_purpose"},
    { value: "Support Type", label: "Support Type" , field:"support_type"},
    { value: "Start Date", label: "Start Date" , field:"start_date"},
    { value: "End Date", label: "End Date" , field:"end_date"},
    { value: "Rate", label: "Rate" , field:"upper_price_limit"},
]

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {

        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceLineItem/get_finance_line_item_listing', Request).then((result) => {
            if (result.status) {
                const res = { rows: result.data, pages: (result.count) };
                resolve(res);
            }
        });
    });
};

class LineItemListing extends React.Component {
    /**
     * default displayed columns in the listing
     */
     static defaultProps = {
        displayed_columns: {
            "line_item_number": true,
            "line_item_name": true,
            "support_category": true,
            "support_purpose": true,
            "support_type": true,
            "support_outcome_domain": true,
            "start_date": true,
            "end_date": true,
            "rate": true,
            "upper_price_limit": true,
            "status": true,
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
            line_item_id: '',
            searchVal: '',
            filterVal: '',
            line_item_list: [],
            row_selections: [],
            status_options: [],
            list_control_option: [
                { label: 'LIST VIEW CONTROLS', type: 'header' },
                { label: 'All Line Item', value: 'all' },
            ],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    fetchData = (state) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                lineItems: res.rows,
                all_count: res.all_count,
                pages: res.pages,
                loading: false,
            });
        })
    }

    /**
     * changing the state when checkboxes are ticked/unticked
     */
     handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
        var newselection = [];
        for (let i = 0; i < selection_count; i++) {
            if(dataSelection[i].status == 1 || dataSelection[i].status == 0) {
                newselection.push(dataSelection[i]);
            }
        }
        var newselection_count = newselection.count;

		this.setState({ selection: newselection, checkedItem: newselection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};

    /**
     * refreshing the list view
     */
     refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }

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
     * Action 
     */
     showModal = (item, key) => {
        if(key === "edit") {
            window.location = ROUTER_PATH + 'admin/finance/line_item/edit/'+item.id;
        }
    }

    /**
     * Render page header actions
     */
     handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="Import Support Item CSV" onClick={(e) => { window.location = ROUTER_PATH + 'admin/finance/line_item/import'; }} />
                    <Button label="Export Support Item CSV" onClick={(e) => { }} />
                    {/* <Button label="New" onClick={(e) => { window.location = ROUTER_PATH + 'admin/finance/line_item/create'; }} /> */}
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
                _label: 'Support Item No',
                accessor: "line_item_number",
                id: 'line_item_number',
                width: '18%'
            },
            {
                _label: 'Name',
                accessor: "line_item_name",
                id: 'line_item_name',
                width: '20%'
            },
            {
                _label: 'Support Category',
                accessor: "support_category_label",
                id: 'support_category',
                width: '13%'
            },
            {
                _label: 'Domain',
                accessor: "support_outcome_domain_label",
                id: 'support_outcome_domain',
                width: '10%'
            },
            {
                _label: 'Purpose',
                accessor: "support_purpose_label",
                id: 'support_purpose',
                width: '8%'
            },
            {
                _label: 'Support Type',
                accessor: "support_type_label",
                id: 'support_type',
                width: '8%'
            },
            {
                _label: 'Start Date',
                accessor: "start_date",
                id: 'start_date',
                width: '10%'
            },
            {
                _label: 'End Date',
                accessor: "end_date",
                id: 'end_date',
                width: '10%'
            },
            {
                _label: 'Rate',
                accessor: "rate",
                id: 'rate',
                width: '10%'
            },
            {
                _label: 'Status',
                accessor: "status_label",
                id: 'status',
                width: '10%'
            },
            /*{
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '5%',
                actionList : [
                    {
                        id: 1,
                        label: 'Edit',
                        value: '0',
                        key: 'edit'
                    },
                    {
                        id: 2,
                        label: 'Archive',
                        value: '0',
                        key: 'archive',
                        disabled: true
                    },
                ]
            } */
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
            <div className="ListLineItem slds" style={styles.root} ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <DataTableListView
                        page_name="Line Items"
                        header_icon="record"
                        icon_style={{display:'inherit'}}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            line_item_filter_options
                        }
                        list_api_url="finance/FinanceLineItem/get_finance_line_item_listing"
                        filter_api_url='finance/FinanceLineItem/get_finance_line_item_listing'
                        related_type="line_item"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        list_control_option={this.state.list_control_option}
                        filter_title="All Line Items"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={() => this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        custom_filter_status_option={this.state.status_options}
                        sortColumnLabel="ID"
                        sortColumn="id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}
                        showModal={this.showModal}
                    />
                </IconSettings>
            </div>
            </React.Fragment>
        );
    }
}


const mapStateToProps = state => ({
    showPageTitle: state.FinanceReducer.activePage.pageTitle,
    showTypePage: state.FinanceReducer.activePage.pageType
})
const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(LineItemListing);