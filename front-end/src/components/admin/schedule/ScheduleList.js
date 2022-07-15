import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, checkLoginWithReturnTrueFalse, getPermission, css, handleChange, toastMessageShow, remove_access_lock } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../salesforce/lightning/SLDSReactSelect'
import '../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon,Modal} from '@salesforce/design-system-react'
import { openAddEditShiftModal, get_service_agreement } from './ScheduleCommon';
import '../item/member/view/role/ListMemberRole.scss'
import ArchiveModal  from '../oncallui-react-framework/view/Modal/ArchiveModal';

import DataTableListView from '../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import condition from '@salesforce/design-system-react/lib/components/expression/condition';

const queryString = require('query-string');



/**
 * to get the main list from back-end
 */
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });

        postData('schedule/ScheduleDashboard/get_shifts_list', { request: Request }).then((result) => {
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
    { value: "Shift Number", label: "Shift Number", field:"shift_no"},
    { value: "Account", label: "Account" , field:"account_fullname"},
    { value: "Roster ID", label: "Roster ID", field: "roster_no" },
    { value: "Member", label: "Member" , field:"member_fullname"},
    { value: "Status", label: "Status" , field:"status_label"},
    { value: "Work Type", label: "Work Type" , field:"role_name"},
    { value: "Scheduled Start Time", label: "Scheduled Start Time" , field:"scheduled_start_datetime"},
    { value: "Scheduled End Time", label: "Scheduled End Time" , field:"scheduled_end_datetime"},
    { value: "Day of Week", label: "Day of Week", field:"day_of_week" },
    { value: "Duration", label: "Duration" , field:"scheduled_duration"},
    { value: "Organization Type", label: "Organization Type" , field:"account_organisation_type"}    
]

class ScheduleList extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "id": true,
            "shift_no": true,
            "roster_no": true,
            "account_fullname": true,
            "account_organisation_type":true,
            "scheduled_start_datetime": true,
            "scheduled_end_datetime": true,
            "day_of_week": true,
            "member_fullname": true,
            "status_label": true,
            "role_name": true,
            "scheduled_duration": true,
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
            selectfilteroptions: [
                { value: "shift_no", label: "Shift No", order: "1" },
                { value: "account_fullname", label: "Account", order: "2" },
                { value: "role_name", label: "Work Type", order: "4" },
                { value: "status_label", label: "Status", order: "5" },
                { value: "scheduled_start_datetime", label: "Scheduled Start Time", order: "6" },
                { value: "scheduled_end_datetime", label: "Scheduled End Time", order: "7" },
                { value: "scheduled_duration", label: "Duration", order: "8" },
                { value: "day_of_week", label: "Day of Week", order: "9" },
                { value: "roster_no", label: "Roster ID", order: "10" },
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
        if(key == "select_filter_field" && (value == "shift_no" || value == "account_fullname" || value == "member_fullname" || value == "role_name" || value == "status_label" || value == "scheduled_duration")) {
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
     * fetching the statuses of shift
     */
    get_shift_statuses = () => {
        // status_option
        postData("schedule/ScheduleDashboard/get_shift_statuses", {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
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
        this.get_shift_statuses();
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
     * Close the modal when user save the shift and refresh the table
     */
    closeAddEditShiftModal = (status,id=null) => {
        this.setState({openCreateModal: false,last_created_id:id});
        remove_access_lock('shift', this.state.shift_id);

        if(status){
            this.refreshListView();
            this.setState({row_selections:[], is_any_action : true});
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
     * when checkboxes are clicked inside the data table
     */
    handleCheckboxSelect = (e) => {
        let data = this.state.selection;
        let tempArr = [];
        var copy_disabled = false;
        for (let i = 0; i < data.length; i++) {
            tempArr.push(data[i].id);
            if (data[i].roster_id && data[i].roster_id !=='') {
                copy_disabled = true;
            }
        }
        this.setState({row_selections: tempArr, copy_disabled: copy_disabled});
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Shift Number',
                accessor: "shift_no",
                id: 'shift_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/details/PARAM1/'},
                    {custom_value: 'shift_no'},
                    {param : ['id']},
                ],
                width: '165px'
            },
            {
                _label: 'Roster ID',
                accessor: "roster_no",
                id: 'roster_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/roster/PARAM1/'},
                {param : ['roster_id']}]
            },
            {
                _label: 'Account',
                accessor: "account_fullname",
                id: 'account_fullname',
                CustomUrl: [{url : ROUTER_PATH + 'admin/item/participant/details/PARAM1/'},
                {param : ['account_id']}],
            },
            {
                _label: 'Organization Type',
                accessor: "account_organisation_type",
                id: 'account_organisation_type',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Support Worker',
                accessor: "member_fullname",
                id: 'member_fullname',
                CustomUrl: [{url : ROUTER_PATH + 'admin/support_worker/details/PARAM1/'},
                {param : ['member_id']}]
            },
            {
                _label: 'Status',
                accessor: "status_label",
                id: 'status_label',
            },
            {
                _label: 'Work Type',
                accessor: "role_name",
                id: 'role_name',
            },
            {
                _label: 'Scheduled Start Time',
                accessor: "scheduled_start_datetime",
                id: 'scheduled_start_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Scheduled End Time',
                accessor: "scheduled_end_datetime",
                id: 'scheduled_end_datetime',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Day of Week',
                accessor: "day_of_week",
                id: 'day_of_week',
            },
            {
                _label: 'Duration (h)',
                accessor: "scheduled_duration",
                id: 'scheduled_duration',
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
                        key: 'edit'
                    },
                ]
            }
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
     * to close the modal
     */
    closeModal = (status) => {
        this.setState({ openCreateModal: false });
        if (status) {
            this.setState({ is_any_action : true})
            this.refreshListView();
        }
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
      console.log(option,'option');
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
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderFilterSelector({ columns }) }
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {

        const FilterOptions = [
            {
                value:'all',
                label:'All'
            },
            {
                value:'active',
                label:'Active'
            },
            {
                value:'inactive',
                label:'Closed'
            }
        ]
        return (
            <React.Fragment>
               
                <PageHeaderControl>
               <span>
                <SLDSReactSelect
                simpleValue={true}
                className={"SLDS_custom_Select default_validation slds-select status_type"}
                searchable={false}
                placeholder="Please Select"
                clearable={false}
                required={true}
                disabled={this.state.filter_panel_display_status}
                id={'status_type'}
                options={FilterOptions}
                onChange={this.handleOnSelectFilterSelector}
                value={this.state.status_filter_value}
            />
            </span>
                    <Button id="btn-new" label="New" onClick={() => this.showModal()} />
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();

        return (
            <React.Fragment>
            <PageHeader
                icon={
                    <Icon
                        assistiveText={{
                            label: 'Shift',
                        }}
                        category="standard"
                        name="date_input"
                        title="Shift"
                    />
                }
                onRenderActions={this.handleOnRenderActions}
                onRenderControls={this.handleOnRenderControls({ columns })}
                title="Shift"
                label={<span />}
                truncate
                variant="object-home"
            />
            </React.Fragment>
        )
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

    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: data.selection, checkedItem: selection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};
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
                    page_name="Shifts"
                    header_icon="date_input"
                    icon_style={{display:'inherit'}}
                    displayed_columns={this.props.displayed_columns}
                    filter_options={
                        shiftsFilterOptions
                    }
                    list_api_url="schedule/ScheduleDashboard/get_shifts_list"
                    list_api_callback = {(dataRows) => this.list_api_url(dataRows)}
                    related_type="shift"
                    filter_status="all"
                    default_filter_logic="1 AND 2"
                    list_control_option={this.state.list_control_option}
                    filter_title="All Shifts"
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
                    selectionHandleChange={this.handleChanged.bind(this)}
                    checkedItem={this.state.checkedItem}
                    showModal={this.showModal}
                    is_filter_panel_status={this.is_filter_panel_status}
                    status_filter_value={this.state.status_filter_value}
                    />
                    <input type="hidden" id="last_created_id" value={this.state.last_created_id}/>
            </div>
            {openAddEditShiftModal(this.state.shift_id, this.state.openCreateModal, this.closeAddEditShiftModal, undefined)}
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'Shift List',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = () => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ScheduleList);