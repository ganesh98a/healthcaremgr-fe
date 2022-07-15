// @ts-nocheck
import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link, Switch } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, checkLoginWithReturnTrueFalse, getPermission, css, toastMessageShow } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import OwnerChangeModal from './OwnerChangeModal.jsx';
import CreateCabCertificate from './application_header_action/CreateCabCertificate.jsx';
import CreateMemberModal from './application_header_action/CreateMemberModal.jsx';

import CreateEmployerContract from './application_header_action/CreateEmployerContract.jsx';
import {
    Dropdown,
    IconSettings,
    PageHeaderControl,
    Button,DataTableColumn, DropdownTrigger, ButtonGroup } from '@salesforce/design-system-react'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import ListView from '../../oncallui-react-framework/view/ListView/ListView.jsx'
import DataTableListQuickFilter from '../../oncallui-react-framework/view/ListView/DataTableListQuickFilter.jsx'

import StageUpdateModal from './StageUpdateModal.jsx';
import ApplicantDashboard from './ApplicationDashboard';

const queryString = require('query-string');

const selectApplicationsFilterOptions = [
    { field: "id", label: "Application Id", value: "Application Id", order: "1" },
    { field: "fullname", label: "Applicant", value: "Applicant", order: "2" },
    { field: "job_position", label: "Job Title", value: "Job Title", order: "3" },
    { field: "process_status_label", label: "Application Status", value: "Application Status", order: "4" },
    { field: "oa_status", label: "Online Assessment Status", value: "Online Assessment Status", order: "5" },
    { field: "recruiter_name", label: "Owner", value: "Owner", order: "6" },
    { field: "created", label: "Date Applied", value: "Date Applied", order: "7" },
    { field: "hired_as_member", label: "Is Member", value: "Is Member", order: "8" }, 
    { field: "referred_by", label: "Referred By", value: "Referred By", order: "9" }    
]

const determineListingControlColumns = () => {
    return [
        { label: 'CAB Certificate', value: '1' , disabled: 'false'},
        { label: 'Employment Contract', value: '2' , disabled: 'false'},        
    ]; 
}

const requestData = (pageSize, page, sorted, filtered) => {

    /**
     * to get the main list from back-end
     */
    return new Promise((resolve) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentApplicant/get_applications', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

class Applications extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "id": true,
            "fullname": true,
            "job_position": true,
            "recruiter": true,
            "created": true,
            "stage": true,
            "status_label": true,
            "process_status_label": true,
            "hired_as_member": true,
            "applied_through": true,
            "referred_by": true,
            "viewed_date": true,
            "viewed_by": true,
            "oa_status": true,
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
            selection: [],
            refreshTable: true,
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            flageModel: false,
            filter_val: '',
            recruiter_val: '',
            job_position_option: [],
            stage_option: [{ label: 'All', value: 0 }],
            recruiter_option: [{ label: 'All', value: 0 }],
            status_option: [{ label: 'All', value: 0 }],
            showselectedfilters: false,
            showselectfilters: false,
            selectfilteroptions: selectApplicationsFilterOptions,
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
            openOwnerChangeModal: false,
            openCreateCabCertificate: false,
            openCreateMember: false,
            openEmployerContract: false,
            checkedItem: 0
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
        this.setState({ showselectfilters: false, showselectedfilters: !type });
    }

    /**
     * hiding the panel of selected filters
     */
    removeSelectedFilters = (key) => {
        var allEntries = JSON.parse(sessionStorage.getItem("filterarray"));
        delete allEntries[key];
        let cleanArray = allEntries.filter(function () { return true });
        sessionStorage.setItem('filterarray', JSON.stringify(cleanArray));
        this.setState({ selectedfilval: JSON.parse(sessionStorage.getItem("filterarray")) }, () => {
            if (this.state.selectedfilval.length == 0) {
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
        if (key == "select_filter_field" && (value == "stage" || value == "recruiter" || value == "status_label")) {
            this.setState({ 'select_filter_operator': 'equals' });
        }
    }

    /**
     * handling the submission of main filtered panel
     */
    sendFilterSubmit = (type) => {
        this.setState({ showselectedfilters: false, showselectfilters: false });
        let getsessdatas = JSON.parse(sessionStorage.getItem("filterarray"));
        if (type == "reset") {

            getsessdatas = sessionStorage.removeItem('filterarray');

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
                if (filter_opt.value == this.state.select_filter_field) {
                    return filter_opt;
                }
            });

            var selected_field_operator_obj = this.state.selectfilteroperatoroptions.find(filter_ope_opt => {
                if (filter_ope_opt.value == this.state.select_filter_operator) {
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
            if (this.state.select_filter_field == "created") {
                filterObj['select_filter_value_label'] = moment(this.state.select_filter_value).format('DD/MM/YYYY');
            }
            else if (this.state.select_filter_field == "status_label") {
                var selected_obj = this.state.status_option.find(obj => {
                    if (obj.value == this.state.select_filter_value) {
                        return obj;
                    }
                });
                filterObj['select_filter_value_label'] = selected_obj.label;
            }
            else if (this.state.select_filter_field == "recruiter") {
                var selected_obj = this.state.recruiter_option.find(obj => {
                    if (obj.value == this.state.select_filter_value) {
                        return obj;
                    }
                });
                filterObj['select_filter_value_label'] = selected_obj.label;
            }
            else if (this.state.select_filter_field == "stage") {
                var selected_obj = this.state.stage_option.find(obj => {
                    if (obj.value == this.state.select_filter_value) {
                        return obj;
                    }
                });
                filterObj['select_filter_value_label'] = selected_obj.label;
            }

            var allEntries = JSON.parse(sessionStorage.getItem("filterarray")) || [];
            allEntries.push(filterObj);
            sessionStorage.setItem('filterarray', JSON.stringify(allEntries));
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
            this.setState({
                applicantList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * fetching the stages of application process
     */
    get_application_stages = () => {
        // stage_option
        postData('recruitment/RecruitmentApplicant/get_all_recruitment_stages', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ stage_option: data });
            }
        });
    }

    /**
     * fetching the statuses of application
     */
    get_application_statuses = () => {
        // status_option
        postData('recruitment/RecruitmentApplicant/get_application_statuses', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ status_option: data });
            }
        });
    }

    /**
     * fetching the list of recruiters
     */
    get_application_recruiters = () => {
        // recruiter_option
        postData('recruitment/RecruitmentApplicant/get_application_recruiters', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ recruiter_option: data });
            }
        });        
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_application_stages();
        this.get_application_recruiters();
        this.get_application_statuses();
    }

    /**
     * hanlding quick search submission
     * @param {*} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: data.selection, checkedItem: selection_count });
	};

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filters: this.state.selectedfilval };
        this.setState({ filtered: search_re });
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Application Id',
                accessor: "id",
                id: 'id',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/application_details/PARAM1/PARAM2/'},
                 {param: ['applicant_id','id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Applicant',
                accessor: "FullName",
                id: 'fullname',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/applicant/PARAM1/'},
                 {param: ['applicant_id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Job Title',
                accessor: "job_position",
                id: 'job_position',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/job_opening/create_job/PARAM1/E'},
                 {param : ['jobId']}]
            },
            {
                _label: 'Application Status',
                accessor: "process_status_label",
                id: 'process_status_label',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },  
            {
                _label: 'Online Assessment Status',
                accessor: "oa_status",
                id: 'oa_status',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/applicant_assessment/PARAM1/PARAM2/'},
                 {param: ['application_id','assessment_id']}, {property: 'target=_blank'}]
            },          
            {
                _label: 'Owner',
                accessor: "recruiter_name",
                id: 'recruiter',
                CustomUrl: [{url : ROUTER_PATH + 'admin/recruitment/staff_details/PARAM1/'},
                {param : ['recruiter']}]
            },
            {
                _label: 'Applied through',
                accessor: "applied_through",
                id: 'applied_through'
            },
            {
                _label: 'Is Support Worker',
                accessor: "hired_as_member",
                id: 'hired_as_member',               
            },
            {
                _label: 'Referred By',
                accessor: "referred_by",
                id: 'referred_by',
            },
            {
                _label: 'Last Viewed Date',
                accessor: "viewed_date",
                id: 'viewed_date',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Last Viewed By',
                accessor: "viewed_by",
                id: 'viewed_by'
            },
            {
                _label: 'Date Applied',
                accessor: "created",
                id: 'created',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            }
        ]
    }

    /**
     * prepating the filter selection panel (secondary)
     * @todo: while working for HCM-10103 I found this function is unused need to be removed
     */
    showSelectFilterPanel() {
        const is_member_status = [{label: "Inactive", value: 'inactive'}, {label: "Active", value: 'active'}]
        return (
            this.state.showselectfilters &&
            <PageHeaderControl>
                <div style={{ height: '340px', top: '90px', right: '340px', position: 'absolute', 'zIndex': '1' }}>
                    {/* List Filtering */}
                    <div class="slds-panel slds-size_medium slds-panel_docked slds-panel_docked-right slds-is-open" aria-hidden="false">
                        <div class="slds-panel__header">
                            <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Filter">Select Filter</h2>
                            <button onClick={this.hideselectfilters} class="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Filter">
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


                                    {this.state.select_filter_field != "recruiter" && this.state.select_filter_field != "stage" && this.state.select_filter_field != "status_label" &&
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

                                    {this.state.select_filter_field != "created" && this.state.select_filter_field != "recruiter" && this.state.select_filter_field != "status_label" && this.state.select_filter_field != "stage" &&
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
                                    {this.state.select_filter_field == "created" &&
                                        <div className="slds-form-element__control datepicker_100_width">
                                            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                <Datepicker
                                                    input={<input name="select_filter_value" />}
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
                                    {this.state.select_filter_field == "hired_as_member" &&
                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="custom_select default_validation"
                                                options={this.state.is_member_status}
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
                                    {this.state.select_filter_field == "recruiter" &&
                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="custom_select default_validation"
                                                options={this.state.recruiter_option}
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
                                    {this.state.select_filter_field == "stage" &&
                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="custom_select default_validation"
                                                options={this.state.stage_option}
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
     * Open create cab certificate or transfer application
     */
    showHeaderActionModal = (header_action) => {
        let selected_application = [];
        if(this.state.selection.length <= 0) {
            toastMessageShow("Please select at least one applicant", "e");
            return false;
        }
        if(this.state.selection.length > 15) {
                toastMessageShow("Please select maximum 15 applications", "e");
                return false;
        }
        if(header_action==1){
            
            this.state.selection.forEach((item:any)=> {
                let obj = {
                    applicant_id: item.applicant_id,
                    application_id: item.application_id,
                    applicant_email: item.email,
                }
                selected_application.push(obj);
            })        
            this.setState({ 
                openCreateCabCertificate: true,
                selected_application: selected_application
            });
        } else if(header_action==2){
            this.state.selection.forEach((item:any)=> {
                let obj = {
                    applicant_id: item.applicant_id,
                    application_id: item.application_id,
                    contractId: '', 
                    task_applicant_id: ''
                }
                selected_application.push(obj);
            })
            this.setState({ 
                openEmployerContract: true,
                selected_application: selected_application
            });
        }else if(header_action=='create_member'){
            let show_modal = [];
            this.state.selection.forEach((selected)=> {     
                if(selected.hired_as_member=='Yes') {
                    show_modal.push('true');                   
                }         
                let obj = {
                    applicant_id: selected.applicant_id,
                    application_id: selected.application_id,
                    application_process_status: selected.application_process_status
                }
                selected_application.push(obj);
            }) 
            if(show_modal.length==0){
                this.setState({ 
                    openCreateMember: true,
                    selected_application: selected_application
                });
            }else{
                toastMessageShow("Please select an applicant/applicants that are not already converted to a member", "e");
                return false;
            }           
        }else if (header_action === 'update_stage') {
            let selected_applicant = [];
            this.state.selection.forEach((selected)=> {               
                selected_applicant.push(selected.flagged_status);
            })
            
            if(selected_applicant.includes('2')) {
                toastMessageShow("Please unselect flagged applicant", "e");
                return false;
            }
            this.toggleUpdateStageModal(false);
        }
    }

    /**
     * Close the modal when user save the applicant and refresh the table
     * Get the Unique reference id
     */
    closeHeaderActionModal = (status) => {
        this.setState({ openCreateCabCertificate: false, openCreateMember: false});
        
        if (status) {
            this.setTableParams();
            this.refreshListView();
        }
    }

    closeEmployerContractModel = (status) => {
        this.setState({ openEmployerContract: false, selection :[],checkedItem:0});
    }

    handleOnRenderActions() {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Update Status" id="create_member" title={`Update Status`} onClick={() => this.showHeaderActionModal('update_stage')} />
                    <Button label="Create Support Worker" id="create_member" title={`Create Member`} onClick={() => this.showHeaderActionModal('create_member')} />
                    <Button label="Change Owner" id="change_owner" title={`Change Owner`} onClick={e => this.get_applicant_list()} />

                    <Dropdown
                        id="header_drop_down"
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        align="right"
                        iconSize="x-medium"
                        iconVariant="border-filled"
                        onSelect={(e) => {
                            //call the cab certificate / employment contract   
                            this.showHeaderActionModal(e.value);
                        }}
                        width="xx-small"                        
                        options={determineListingControlColumns()}
                    />
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     *  for change owner
     */
    get_applicant_list = (val) => {
        if(this.state.selection.length <= 0) {
            toastMessageShow("Please select at least one applicant", "e");
            return false;
        }
        if(this.state.selection.length > 15) {
                toastMessageShow("Please select maximum 15 applications", "e");
                return false;
        }
        switch(val) {
            case 1:
                this.toggleChangeOwnerModal();
                break;
            case 2:
                this.toggleUpdateStageModal(false);
                break;
            default:
                this.toggleChangeOwnerModal();
                break;
        }
    }
    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable,selection:[],checkedItem:0},()=>{this.fetchData(this.state)})
    }

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection:[] }); 
    }

    /**
     * toggling the copy shifts modal
     */
    toggleChangeOwnerModal = (status) => {
        this.setState({ openOwnerChangeModal: !this.state.openOwnerChangeModal});
        this.setTableParams();
        if(status) {
            toastMessageShow("Updated successfully", "s");
            this.refreshListView();
        }
       
    }

    /**
     * toggling the copy shifts modal
     */
    toggleUpdateStageModal = (status) => {
        this.setState({ openStageUpdateModal: !this.state.openStageUpdateModal});
        if(status) {
            this.setTableParams();
            this.refreshListView();
        }
    }

    /**
     * Render Modal
     * - Owner Change
     */
    renderModal= () => {
        return (
            <>
            {
                this.state.openOwnerChangeModal && 
                    <OwnerChangeModal
                        selection={this.state.selection}
                        closeModal={this.toggleChangeOwnerModal.bind(this)}
                        openModal={this.state.openOwnerChangeModal}

                    />
            }
            {
                this.state.openStageUpdateModal && 
                    <StageUpdateModal
                        selection={this.state.selection}
                        closeModal={this.toggleUpdateStageModal.bind(this)}
                        openModal={this.state.openStageUpdateModal}

                    />
            }
            </>
        );
    }

    /**
     * Render Modal
     * - Change Status / cab certificate
    */

    renderChangeStatusModel = () => {
        return (
            <>
            {
                this.state.openCreateCabCertificate && (
                    <CreateCabCertificate        
                        application_list = {this.state.selected_application}
                        isBulkApplication = {true}
                        showModal = {this.state.openCreateCabCertificate}
                        closeModal = {()=>this.closeHeaderActionModal(true)}
                        {...this.props}
                    />
                )                
            }
            {
                this.state.openEmployerContract && (
                    <CreateEmployerContract        
                        application_list = {this.state.selected_application}
                        showModal = {this.state.openEmployerContract}
                        closeModal = {()=>this.closeEmployerContractModel(true)}
                        {...this.props}
                    />
                )
            }

            {
                this.state.openCreateMember && (
                    <CreateMemberModal     
                        is_bulk_update = {true}   
                        selection={this.state.selected_application}
                        isBulkApplication = {true}
                        openModal = {this.state.openCreateMember}
                        closeModal = {()=>this.closeHeaderActionModal(true)}
                        {...this.props}
                    />
                )
            }
            </>
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
                
        let pageComponentValue = {
            variant: 'related-list',
            title: 'All Applications',
            icon: {
                title: 'All Applications',
                category: 'standard',
                name: 'employee_job',
                backgroundColor: '#51a2e0',
                fill: '#ffffff'
            },
            inputSearch: {
                search: true,
                placeholder: 'Search Applications',
                id: 'list_applicant_input_search'
            },
            columns: {
                columns: true,
                list: columns,
            },
            filter: {
                quick_filter: true,
                btnAction: this.showselectedfilters.bind(this),
                modalShowState: this.state.showselectedfilters,
                filterComponent: this.showSelectFilterPanel.bind(this)
            }
        };

        return (
            <React.Fragment>
                <div className="ListContact slds" style={styles.root} ref={this.rootRef}>

                { /* Commented out in favour of the visual dashboard prototype              
                    <DataTableListView
                        page_name="Applications"
                        header_icon="file"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectApplicationsFilterOptions
                        }
                        list_api_url="recruitment/RecruitmentApplicant/get_applications"
                        related_type="application"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Applications"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}
                        selectRows="checkbox"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}
                        refresh={this.state.refreshTable}
                        sortColumnLabel="Date Applied"
                        sortColumn="created"
                    />
                    */
                }
                    <ApplicantDashboard />
                    {this.renderModal()}
                    {this.renderChangeStatusModel()}
                </div>
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'Applications',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Applications);