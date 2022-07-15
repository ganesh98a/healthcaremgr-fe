import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, checkLoginWithReturnTrueFalse, getPermission, css } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../salesforce/lightning/SLDSReactSelect'
import '../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeaderControl,Button,Dropdown,DropdownTrigger,Input,InputIcon} from '@salesforce/design-system-react'
import '../item/member/view/role/ListMemberRole.scss'

import DataTableListView from '../oncallui-react-framework/view/ListView/DataTableListView.jsx'

/**
 * to get the main list from back-end
 */
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });

        postData('finance/FinanceDashboard/get_ndis_error_list', { request: Request }).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    total_count: result.total_count
                };

                resolve(res);
            }
        });
    });
};
const shiftsFilterOptions = [
    { value: "Shift ID", label: "Shift ID", field:"shift_id"},
    { value: "Account", label: "Account" , field:"account_fullname"},
    { value: "Service Type", label: "Service Type" , field:"role_name"},
    { value: "Fund Manager", label: "Fund Manager" , field:"fund_type"},
    { value: "Shift Date", label: "Shift Date" , field:"actual_start_datetime"},
    { value: "Shift Time", label: "Shift Time" , field:"shift_time"},
    { value: "Duration", label: "Duration" , field:"actual_duration"}    
]

class NDISErrorTrackingList extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "id": true,
            "shift_id": true,
            "account_fullname": true,
            "actual_start_datetime": true,
            "scheduled_end_datetime": true,
            "role_name": true,
            "actual_duration": true,
            "warnings": true,
            "short_warning_msg": true,
            "shift_time": true,
            "fund_type": true
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
            shifts_list: [],
            row_selections: [],
            weeks_list: [],
            header_checkbox: false,
            openCopyShiftsModal: false,
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            status_option: [{label: 'All', value:0}],
            showselectedfilters: false,
            showselectfilters: false,
            selectfilteroptions: [],
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
            copy_disabled: false,
            last_created_id:null,
            shiftWarnings:[],
            show_shift_warnings:false,
            status_filter_value:'active',
            filter_panel_display_status:false,
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * showing the filter options selection panel
     */
    showselectfilters = () => {
        this.setState({ showselectfilters: true });
    }

    /**
     * hiding the filter options selection panel
     */
    hideselectfilters = () => {
        this.setState({
            showselectfilters: false,
            select_filter_field: '',
            select_filter_operator: '',
            select_filter_value: ''
        });
    }

    /**
     * showing the panel of selected filters
     */
    showselectedfilters = (type) => {
        this.setState({ showselectfilters : false,showselectedfilters: !type });
    }

    /**
     * hiding the panel of selected filters
     */
    removeSelectedFilters = (key) => {
        var allEntries = JSON.parse(sessionStorage.getItem("filterarray"));
        delete allEntries[key];
        let cleanArray = allEntries.filter(function () { return true });
        sessionStorage.setItem('filterarray', JSON.stringify(cleanArray));
        this.setState({ selectedfilval: JSON.parse(sessionStorage.getItem("filterarray")) },()=>{
                if (this.state.selectedfilval.length == 0){
                this.resetFilters();
            }
        });
    }

    /**
     * handling the change event in selection of filter fields
     */
    handleChangeSelectFilterValue = (key, value) => {
        this.setState({ [key]: value });

        // check if certain filter fields are selected, then making operator fields pre-set
        if(key == "select_filter_field" && (value == "shift_id" || value == "account_fullname" || value == "member_fullname" || value == "role_name" || value == "status_label" || value == "scheduled_duration")) {
            this.setState({ 'select_filter_operator': 'equals' });
        }
    }

    /**
     * handling the submission of main filtered panel
     */
    sendFilterSubmit = (type) => {
        this.setState({ showselectedfilters: false,showselectfilters: false});
        let getsessdatas = JSON.parse(sessionStorage.getItem("filterarray"));
        if(type == "reset"){
            getsessdatas =  sessionStorage.removeItem('filterarray');
        }
        getsessdatas && getsessdatas.sort(function (x, y) {
            return x.selected_field_sort - y.selected_field_sort;
        });

        this.setTableParams();
    }

    /**
     * when selected filters are reset using a link
     */
    resetFilters = () => {
        this.state.selectedfilval = [];
        this.state.showselectedfilters = false;
        this.state.showselectfilters = false;
        this.sendFilterSubmit("reset");
    }

    /**
     * handling the submission of filter selection panel
     */
    selectFilterOnSubmit = (e) => {
        e.preventDefault();
        jQuery("#select_filter_form").validate({});

        if (jQuery("#select_filter_form").valid()) {
            let filterObj = {}
            var selected_field_label = "";
            var selected_field_sort = "";
            var select_filter_operator_sym = "";
            var select_filter_operator_label = "";

            var selected_field_obj = this.state.selectfilteroptions.find(filter_opt => {
                if(filter_opt.value == this.state.select_filter_field) {
                    return filter_opt;
                }
            });

            var selected_field_operator_obj = this.state.selectfilteroperatoroptions.find(filter_ope_opt => {
                if(filter_ope_opt.value == this.state.select_filter_operator) {
                    return filter_ope_opt;
                }
            });

            selected_field_label = selected_field_obj.label;
            selected_field_sort = selected_field_obj.order;
            select_filter_operator_label = selected_field_operator_obj.label;
            select_filter_operator_sym = selected_field_operator_obj.symbol;

            filterObj['select_filter_field'] = this.state.select_filter_field;
            filterObj['select_filter_field_label'] = selected_field_label;
            filterObj['select_filter_operator'] = this.state.select_filter_operator;
            filterObj['select_filter_operator_label'] = select_filter_operator_label;
            filterObj['select_filter_operator_sym'] = select_filter_operator_sym;
            filterObj['select_filter_value'] = this.state.select_filter_value;
            filterObj['select_filter_value_label'] = this.state.select_filter_value;
            filterObj['selected_field_sort'] = selected_field_sort;
            if (this.state.select_filter_field == "scheduled_start_datetime" || this.state.select_filter_field == "scheduled_end_datetime") {
                filterObj['select_filter_value_label'] = moment(this.state.select_filter_value).format('DD/MM/YYYY');
            }
            else if (this.state.select_filter_field == "status_label") {
                var selected_obj = this.state.status_option.find(obj => {
                    if(obj.value == this.state.select_filter_value) {
                        return obj;
                    }
                });
                filterObj['select_filter_value_label'] = selected_obj.label;
            }

            var allEntries = JSON.parse(sessionStorage.getItem("filterarray")) || [];
            allEntries.push(filterObj);
            sessionStorage.setItem('filterarray', JSON.stringify(allEntries));
            console.log("filterarrayfilterarray", JSON.parse(sessionStorage.getItem("filterarray")));
            this.setState({
                selectedfilval: JSON.parse(sessionStorage.getItem("filterarray")),
                showselectfilters: false,
                select_filter_field: '',
                select_filter_operator: '',
                select_filter_value: '',
            }, () => {
            });
        }
    }

    /**
     * to fetch the filtered data by setting required props and calling the request data function
     */
    fetchData = (state) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.refreshListView();
            this.setState({
                shifts_list: res.rows,
                pages: res.pages,
                loading: false,
            });
        });
    }

    /**
     * hanlding quick search submission
     * @param {*} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search,  filters: this.state.selectedfilval};
        this.setState({ filtered: search_re, row_selections: [], selection:[], is_any_action: true },()=>{
            this.refreshListView();
        });
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Shift ID',
                accessor: "shift_id",
                id: 'shift_id',
                width: '75px',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/details/PARAM1/'},
                    {custom_value: 'shift_id'},
                    {param : ['id']},
                ],                
            },            
            {
                _label: 'Account',
                accessor: "account_fullname",
                id: 'account_fullname',
                CustomUrl: [{url : ROUTER_PATH + 'admin/item/participant/details/PARAM1/'},
                {param : ['account_id']}],
                width: '75px',
            },
            {
                _label: 'Service Type',
                accessor: "role_name",
                id: 'role_name',
                width: '75px',
            },
            {
                _label: 'Fund Manager',
                accessor: "fund_type",
                id: 'fund_type',
                width: '75px',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },            
                   
            {
                _label: 'Shift Date',
                accessor: "actual_start_datetime",
                id: 'actual_start_datetime',
                width: '75px',
                // CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: 'Shift Time',
                accessor: "shift_time",
                id: 'shift_time',
                width: '117px',
                WithoutTruncate: true,                
            },          
            {
                _label: 'Duration',
                accessor: "actual_duration",
                id: 'actual_duration',
                width: '50px',
            },
            {
                _label: 'Error Note',
                accessor: "short_warning_msg",
                width: '150px',
                CustomShiftErrorNote: true,               
            },
            
        ]
    }

    /**
     * prepating the filter selection panel (secondary)
     */
    showSelectFilterPanel() {
        return (
            this.state.showselectfilters &&
            <PageHeaderControl>
                <div style={{ height: '340px', top: '90px', right: '340px', position: 'absolute', 'zIndex': '1' }}>
                    {/* List Filtering */}
                    <div class="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
                        <div class="slds-panel__header">
                            <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Select Filter</h2>
                            <button  onClick={this.hideselectfilters} class="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Filter">
                               x
                                <span class="slds-assistive-text">Select Filters</span>
                            </button>
                        </div>
                        <div class="slds-panel__body">
                            <div class="slds-filters">
                                <form id="select_filter_form" autoComplete="off" className="slds_form">
                                <h3 class="slds-text-body_small slds-m-vertical_x-small">Field</h3>
                                    <div className="slds-form-element__control">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.selectfilteroptions}
                                            onChange={(value) => this.handleChangeSelectFilterValue('select_filter_field', value)}
                                            value={this.state.select_filter_field || ''}
                                            clearable={false}
                                            searchable={false}
                                            placeholder="Please Select"
                                            required={true}
                                            name="select_filter_field"
                                        />
                                    </div>

                                    {(this.state.select_filter_field != "status_label") &&
                                    <div>
                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">Operator</h3>
                                    <div className="slds-form-element__control">
                                        <SLDSReactSelect
                                            simpleValue={true}
                                            className="custom_select default_validation"
                                            options={this.state.selectfilteroperatoroptions}
                                            onChange={(value) => this.handleChangeSelectFilterValue('select_filter_operator', value)}
                                            value={this.state.select_filter_operator || ''}
                                            clearable={false}
                                            searchable={false}
                                            placeholder="Please Select"
                                            required={true}
                                            name="select_filter_operator"
                                        />
                                    </div>
                                    </div>
                                    }


                                    <h3 class="slds-text-body_small slds-m-vertical_x-small">Value</h3>

                                    {this.state.select_filter_field != "scheduled_start_datetime" && this.state.select_filter_field != "scheduled_end_datetime" && this.state.select_filter_field != "status_label" &&
                                        <div className="slds-form-element__control">
                                            <input type="text"
                                                class="slds-input"
                                                name="select_filter_value"
                                                placeholder="Enter Value"
                                                required={true}
                                                onChange={(e) => this.handleChangeSelectFilterValue('select_filter_value', e.target.value)}
                                                value={this.state.select_filter_value || ''}
                                            />
                                        </div>
                                    }
                                    {(this.state.select_filter_field == "scheduled_start_datetime" || this.state.select_filter_field == "scheduled_end_datetime") &&
                                        <div className="slds-form-element__control datepicker_100_width">
                                            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                <Datepicker
                                                    input={<input name="select_filter_value"/>}
                                                    parser={() => moment(this.state.select_filter_value, 'DD/MM/YYYY').toDate()}
                                                    onChange={(event, data) => this.setState({ select_filter_value: (moment(data.date).isValid() ? moment.utc(data.date) : null) })}
                                                    formatter={(date) => { return date ? moment.utc(this.state.select_filter_value).format('DD/MM/YYYY') : ''; }}
                                                    value={this.state.select_filter_value || ''}
                                                    relativeYearFrom={0}
                                                />
                                            </IconSettings>
                                        </div>
                                    }
                                    {this.state.select_filter_field == "status_label" &&
                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="custom_select default_validation"
                                                options={this.state.status_option}
                                                onChange={(value) => this.handleChangeSelectFilterValue('select_filter_value', value)}
                                                value={this.state.select_filter_value || ''}
                                                clearable={false}
                                                searchable={false}
                                                placeholder="Please Select"
                                                required={true}
                                                name="select_filter_value"
                                            />
                                        </div>
                                    }

                                    <h3 class="slds-text-body_small slds-m-vertical_x-small"></h3>
                                    <div style={{ float: 'right' }} className="slds-form-element__control">
                                        <Button disabled={this.state.loading} label="Done" variant="brand" onClick={this.selectFilterOnSubmit} />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {/* List Filtering */}
                </div>
            </PageHeaderControl>
        )
    }

    /**
     * prepating the panel of selected filters (primary)
     */
    showSelectedFilterPanel() {
        return (
            this.state.showselectedfilters &&
            <PageHeaderControl>
                <div style={{ top: '90px', right: '14px', position: 'absolute', 'zIndex': '1' }}>
                    <div class="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
                        <div class="slds-panel__header">
                            <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Filter</h2>
                        </div>
                        <div class="slds-panel__body">
                            <div class="slds-filters">
                                <div className="slds-form-element__control">
                                    <Button label="Cancel" onClick={() => this.sendFilterSubmit("search")} />
                                    {this.state.selectedfilval &&
                                    <Button style={{ float: 'right' }} disabled={this.state.loading} label="Save" variant="brand"
                                            onClick={() => this.sendFilterSubmit("search")}
                                            />
                                    }
                                </div>

                                {this.state.selectedfilval &&
                                <h3 class="slds-text-body_small slds-m-vertical_x-small">Matching following filters:</h3>
                                }
                                {!this.state.selectedfilval &&
                                <br></br>
                                }
                                <ol class="slds-list_vertical slds-list_vertical-space">
                                    {
                                        this.state.selectedfilval && this.state.selectedfilval.map((value, idx) => (
                                            value !== null &&
                                            (<li class="slds-item slds-hint-parent">
                                                <div style={{ background: 'lightgoldenrodyellow' }} class="slds-filters__item slds-grid slds-grid_vertical-align-center">
                                                    <button class="slds-button_reset slds-grow slds-has-blur-focus">
                                                        <span class="slds-assistive-text">Edit filter:</span>
                                                        <span class="slds-show slds-text-body_small">{value.select_filter_field_label}</span>
                                                        <span class="slds-show">{value.select_filter_operator_label} "{value.select_filter_value_label}"</span>
                                                    </button>
                                                    <span class="slds-button_reset slds-grow slds-has-blur-focus">
                                                        <span onClick={() => this.removeSelectedFilters(idx)} style={{ float: 'right', cursor: 'pointer' }} class="slds-show slds-text-body_small">x</span>
                                                    </span>
                                                </div>
                                            </li>
                                            )
                                        ))
                                    }
                                </ol>
                                <div class="slds-filters__footer slds-grid slds-shrink-none">
                                    <button class="slds-button_reset slds-text-link" onClick={this.showselectfilters}>Add Filter</button>
                                    <button class="slds-button_reset slds-text-link slds-col_bump-left" onClick={this.resetFilters}>Remove All</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Filtering */}
                </div>
            </PageHeaderControl>
        )
    }

    /**
     * Render search input form
     */
    renderSearchForm() {
        return (
            <form
                autoComplete="off"
                onSubmit={(e) => this.submitSearch(e)}
                method="post"
                className="slds-col_padded"
                style={{ display: 'block' }}
            >
            <Input
                iconLeft={
                    <InputIcon
                        assistiveText={{
                            icon: 'Search',
                        }}
                        name="search"
                        category="utility"
                    />
                }
                onChange={(e) => this.setState({ search: e.target.value })}
                id="ListContact-search-1"
                placeholder="Search Shifts"
            />
            </form>
        )
    }

    /**
     * Handle the selected columns visible or not
     */
    handleOnSelectColumnSelectorItem = option => {
        const value = option.value

        let cols = [...this.state.displayed_columns]
        if (cols.indexOf(value) >= 0) {
            cols = cols.filter(col => col !== value)
        } else {
            cols = [...this.state.displayed_columns, value]
        }

        this.setState({ displayed_columns: cols })
    }

    handleOnSelectFilterSelector=(option)=>
    {
        this.setState({status_filter_value:option})
    }
    /**
     * Render table column dropdown
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {
        columns = columns.filter(col => (col.accessor != "actions" && col.accessor != "id"));
        const mapColumnsToOptions = columns.map(col => {
            return ({
                value: 'id' in col ? col.id : col.accessor,
                label: col._label,
            })
        })

        return (
            <Dropdown
                align="right"
                checkmark
                multiple
                assistiveText={{ icon: 'More' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={mapColumnsToOptions}
                value={this.state.default_displayed_columns}
                onSelect={this.handleOnSelectColumnSelectorItem}
            >
                <DropdownTrigger>
                    <Button
                        title={`Show/hide columns`}
                        assistiveText={{ icon: 'Show/hide columns' }}
                        iconCategory="utility"
                        iconName="table"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Rendering the filter button in header
     */
    renderFilterSelector() {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <button onClick={() => this.showselectedfilters(this.state.showselectedfilters)} class="slds-button slds-button_icon-more" tabindex="0" title="Filter records" type="button" aria-expanded="false" aria-haspopup="true">
                        <svg aria-hidden="true" class="slds-button__icon">
                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#filterList"></use>
                        </svg>
                        <svg aria-hidden="true" class="slds-button__icon slds-button__icon_x-small">
                            <use href="/assets/salesforce-lightning-design-system/assets/icons/utility-sprite/svg/symbols.svg#down">
                            </use>
                        </svg>
                        <span class="slds-assistive-text">Filter</span>
                    </button>
                </PageHeaderControl>

                {
                /* showing the selecting filter panel */
                this.showSelectFilterPanel()
                }

                {
                /* showing the selected filter panel */
                this.showSelectedFilterPanel()
                }
            </React.Fragment>
        )
    }

    /**
     * Render page header controlls
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    { this.renderSearchForm() }
                </PageHeaderControl>              
                <PageHeaderControl>
                    { this.renderFilterSelector({ columns }) }
                </PageHeaderControl>
            </React.Fragment>
        )
    }
    handleOnRenderActions = () =>{
        return (
            <React.Fragment>
               
                <PageHeaderControl>
                </PageHeaderControl>
            </React.Fragment>);
    }

    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }

    list_api_url(res) {
        this.setState({
            shifts_list: res.rows,
            pages: res.pages,
            loading: false
        });
    }
   
    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection:[], row_selections:[] });
    }
    
    is_filter_panel_status=(filter_panel_display_status)=>{
        this.setState({ filter_panel_display_status });
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

        return (
            <React.Fragment>
                <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="NDIS Invoices"
                        header_icon="date_input"
                        icon_style={{display:'inherit'}}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            shiftsFilterOptions
                        }
                        list_api_url="finance/FinanceDashboard/get_ndis_error_list"
                        list_api_callback = {(dataRows) => this.list_api_url(dataRows)}
                        related_type="ndis_error_list"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        list_control_option={this.state.list_control_option}
                        filter_title="All NDIS Invoices"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={()=>this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        selectRows=""
                        sortColumnLabel="ID"
                        sortColumn="id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        checkedItem={this.state.checkedItem}
                        showModal={this.showModal}
                        is_filter_panel_status={this.is_filter_panel_status}
                        status_filter_value={this.state.status_filter_value}
                        />
                        <input type="hidden" id="last_created_id" value={this.state.last_created_id}/>
                </div>
           
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'NDIS Error Tracking List',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = () => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(NDISErrorTrackingList);