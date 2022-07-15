import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import moment from "moment";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, checkLoginWithReturnTrueFalse, getPermission, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import jQuery from 'jquery';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon} from '@salesforce/design-system-react'
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import AttachRoleToDocModal from './AttachRoleToDocModal';

const queryString = require('query-string');

/**
 * to get the main list from back-end
 */
const requestData = (doc_id, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Arr = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        var Request = JSON.stringify(Arr);
        console.log(Arr);
        postData('item/document/get_role_documents', { doc_id: doc_id, request: Request }).then((result) => {
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

class ListDocumentRoles extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "name": true,
            "start_date": true,
            "end_date": true,
            "created": true,
            "mandatory_label": true,
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
            doc_id: this.props.match.params.id,
            openAttachRoleToDocModal: false,
            end_date: null,
            start_date: null,
            role_documents_list: [],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            mandatory_options: [{label: 'All', value:0}],
            showselectedfilters: false,
            showselectfilters: false,
            selectfilteroptions: [
                { value: "name", label: "Role name", order: "1" },
                { value: "start_date", label: "Start date", order: "2" },
                { value: "end_date", label: "End date", order: "3" },
                { value: "created", label: "Date created", order: "4" },
                { value: "mandatory_label", label: "Mandatory", order: "5" },
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
           console.log("this.state.selectedfilval",this.state.selectedfilval);
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
        if(key == "select_filter_field" && (value == "mandatory_label")) {
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
            var filterarray = [];
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
            console.log(this.state);
            if (this.state.select_filter_field == "start_date" || this.state.select_filter_field == "end_date" || this.state.select_filter_field == "created") {
                filterObj['select_filter_value_label'] = moment(this.state.select_filter_value).format('DD/MM/YYYY');
            }
            else if (this.state.select_filter_field == "mandatory_label") {
                var selected_obj = this.state.mandatory_options.find(obj => {
                    if(obj.value == this.state.select_filter_value) {
                        return obj;
                    }
                });
                console.log(this.state.mandatory_options);
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
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        console.log(this.state);
        requestData(
            state.doc_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                role_documents_list: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * fetching the mandatory labels
     */
    get_mandatory_labels = () => {
        // mandatory_options
        postData('item/document/get_mandatory_labels', {}).then((result) => {
            if (result.status) {
                var res = [{ label: 'All', value: '' }];
                var data = result.data
                data = res.concat([...data]);
                this.setState({ mandatory_options: data });
            }
        });
    }

    /**
     * Fetch document details
     * 
     * Will fetch when:
     * - This component was mounted
     * - Role was successfully updated
     */
    get_document_details = (id) => {
        this.setState({ loading: true})

        postData('item/document/get_document_detail_by_id', id)
            .then((result) => {
                if (result.status) {
                    this.setState({ ...result.data })
                } else {
                    console.error('Could not fetch role details')
                }
            })
            .catch(() => console.error('Could not fetch role details'))
            .finally(() => this.setState({ loading: false }))
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        this.get_mandatory_labels();
        var doc_id = this.props.match.params.id;
        this.get_document_details({ document_id: doc_id });
    }

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search,  filters: this.state.selectedfilval};
        console.log(search_re);
        this.setState({ filtered: search_re });
    }

    /**
     * when archive is requested by the user for selected role document
     */
    handleOnArchiveRoleDocument = (role_doc_id) => {
        const msg = `Are you sure you want to archive this role document?`
        const confirmButton = `Archive Role Document`
        AjaxConfirm({ role_doc_id }, msg, `item/document/archive_role_document`, { confirm: confirmButton, heading_title: `Archive role document` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.setTableParams();
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Open attaching role and document modal
     */
    showAttachRoleToDocModal = (role_doc_id) => {
        console.log(this.props);
        this.setState({ openAttachRoleToDocModal: true, role_doc_id: role_doc_id, doc_details: { name: this.state.title, id: this.state.document_id } });
    }

    /**
     * Close attaching role and document modal
     */
    hideAttachRoleToDocModal = (status) => {
        this.setState({ openAttachRoleToDocModal: false });
        if(status == true) {
            this.setTableParams();
        }
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Role Name',
                accessor: "name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <Link to={ROUTER_PATH + `admin/item/role/details/${props.original.role_id}`} 
                    className="vcenter default-underlined slds-truncate"
                    style={{ color: '#0070d2' }}>
                        {props.value}
                    </Link>
                )
            },
            {
                _label: 'Start Date',
                accessor: "start_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value != "" && props.value != "0000-00-00" ? moment(props.value).format("DD/MM/YYYY") : "N/A"}</span>
            },
            {
                _label: 'End Date',
                accessor: "end_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value != "" && props.value != "0000-00-00" ? moment(props.value).format("DD/MM/YYYY") : "N/A"}</span>
            },
            {
                _label: 'Mandatory',
                accessor: "mandatory_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Created',
                accessor: "created",
                id: 'created',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</span>
            },
            {
                _label: '',
                accessor: "actions",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => <Dropdown
                assistiveText={{ icon: 'More Options' }}
                iconCategory="utility"
                align="right"
                iconSize="x-small"
                iconName="down"
                iconVariant="border-filled"
                onSelect={(e) => {
                    if(e.value == 1){ //edit
                        this.showAttachRoleToDocModal(props.original.id)
                        console.log("edit");
                    }
                    else { // delete
                        console.log("delete");
                        this.handleOnArchiveRoleDocument(props.original.id)
                    }
                }}
                className={'slds-more-action-dropdown'}
                options={[
                    { label: 'Edit', value: '1' },
                    { label: 'Delete', value: '2' },
                ]}
            />
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
                                    
                                    
                                    {this.state.select_filter_field != "mandatory_label" && 
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
                                    
                                    {this.state.select_filter_field != "created" && this.state.select_filter_field != "start_date" && this.state.select_filter_field != "end_date" && this.state.select_filter_field != "mandatory_label" &&
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
                                    {(this.state.select_filter_field == "created" || this.state.select_filter_field == "start_date" || this.state.select_filter_field == "end_date") && 
                                        <div className="slds-form-element__control datepicker_100_width">
                                            <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                                <Datepicker                                            
                                                    input={<input name="select_filter_value"/>}   
                                                    parser={(date) => moment(this.state.select_filter_value, 'DD/MM/YYYY').toDate()}                                        
                                                    onChange={(event, data) => this.setState({ select_filter_value: (moment(data.date).isValid() ? moment.utc(data.date) : null) })}
                                                    formatter={(date) => { return date ? moment.utc(this.state.select_filter_value).format('DD/MM/YYYY') : ''; }}
                                                    value={this.state.select_filter_value || ''}
                                                    relativeYearFrom={0}
                                                />
                                            </IconSettings>
                                        </div>
                                    }
                                    {this.state.select_filter_field == "mandatory_label" &&
                                        <div className="slds-form-element__control">
                                            <SLDSReactSelect
                                                simpleValue={true}
                                                className="custom_select default_validation"
                                                options={this.state.mandatory_options}
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
                                    <Button label="Cancel" onClick={(e) => this.sendFilterSubmit("search")} />
                                    {this.state.selectedfilval &&
                                    <Button style={{ float: 'right' }} disabled={this.state.loading} label="Save" variant="brand"
                                            onClick={(e) => this.sendFilterSubmit("search")}
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
                                                        <span onClick={(value) => this.removeSelectedFilters(idx)} style={{ float: 'right', cursor: 'pointer' }} class="slds-show slds-text-body_small">x</span>
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
     * rendering the header portion of the page
     */
    renderHeader() {
        var columns = this.determineColumns();
        columns = columns.filter(col => (col.accessor != "actions"));
        const trail = [
			<Link to={ROUTER_PATH + `admin/item/document`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Document</Link>,
			<Link to={ROUTER_PATH + `admin/item/document/details/` + this.state.document_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.title}</Link>,
		];
        return (
            <React.Fragment>
                <PageHeader
                    onRenderActions={() => {
                        return (
                            <React.Fragment>
                                <PageHeaderControl>
                                    <Button label="New" onClick={e => this.showAttachRoleToDocModal()} />
                                </PageHeaderControl>
                                </React.Fragment>
                            )
                        }}
                        onRenderControls={() => {
                        return (
                            <React.Fragment>
                                <PageHeaderControl>
                                    {
                                        (() => {
                                            const mapColumnsToOptions = columns.map(col => ({
                                                value: 'id' in col ? col.id : col.accessor,
                                                label: col._label,
                                            }))

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
                                                    onSelect={option => {
                                                        const value = option.value;

                                                        let cols = [...this.state.displayed_columns]
                                                        if (cols.indexOf(value) >= 0) {
                                                            cols = cols.filter(col => col !== value)
                                                        } else {
                                                            cols = [...this.state.displayed_columns, value]
                                                        }

                                                        this.setState({ displayed_columns: cols })
                                                    }}
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
                                        })()
                                    }
                                </PageHeaderControl>
                                <PageHeaderControl>
                                    <button onClick={(e) => this.showselectedfilters(this.state.showselectedfilters)} class="slds-button slds-button_icon-more ignore-click-lWJnKo2QxH" tabindex="0" title="Filter records" type="button" aria-expanded="false" aria-haspopup="true">
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
                    }}
                    trail={trail}
                    title="Document roles"
                    label=" "
                    truncate
                    variant="related-list"
                />
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
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    {this.renderHeader()}
                    <SLDSReactTable
                        PaginationComponent={() => false}
                        ref={this.reactTable}
                        manual="true"
                        loading={this.state.loading}
                        pages={this.state.pages}
                        onFetchData={this.fetchData}
                        filtered={this.state.filtered}
                        doc_id={this.state.doc_id}
                        defaultFiltered={{ filter_status: 'all' }}
                        columns={displayedColumns}
                        data={this.state.role_documents_list}
                        pageSize={9999}
                        minRows={1}
                        getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                        onPageSizeChange={this.onPageSizeChange}
                        noDataText="No records Found"
                        collapseOnDataChange={true} 
                        resizable={true} 
                    />
                </IconSettings>
            </div>
            {
            this.state.openAttachRoleToDocModal && (
                <AttachRoleToDocModal 
                    showAttachRoleToDocModal={true}
                    hideAttachRoleToDocModal={this.hideAttachRoleToDocModal}
                    doc_details={this.state.doc_details}
                    role_doc_id={this.state.role_doc_id}
                    pageTitle={'Add Role to Document'}
                />
            )
            }
            </React.Fragment>
        );
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: 'Document Roles',
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListDocumentRoles);