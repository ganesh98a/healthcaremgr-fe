import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    IconSettings,
    Input,
    InputIcon,
    PageHeaderControl,
} from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import { AjaxConfirm, css, postData, reFreashReactTable, toastMessageShow } from 'service/common.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import IconsMe from '../../../IconsMe';
import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
import CreateOpportunityPopUp from './CreateOpportunityBox';


/* const queryString = require('query-string'); */

const selectOpportunityFilterOptions = [
    { field: "opportunity_number", label: "ID", value: "ID", order: "1" },
    { field: "topic", label: "Service type", value: "Service type", order: "2" },
    { field: "account", label: "Account", value: "Account", order: "3" },
    { field: "status", label: "Status", value: "Status", order: "4" },
    { field: "opportunity_type", label: "Type", value: "opportunity_type", order: "5" },
    { field: "owner_name", label: "Assigned To", value: "Assigned To", order: "6" },
    { field: "related_lead", label: "Related Lead", value: "Related Lead", order: "8" },
    { field: "created", label: "Created date", value: "Created date", order: "7" }

]

/**
 *
 * @param {object} props
 * @param {number} props.opportunity_id
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onEdit
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onArchive
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onPreview
 */
class ListingOpportunity extends Component {

    static defaultProps = {
        displayed_columns: {
            'opportunity_number': true,
            'topic': true,
            'account': true,
            'status': true,
            'opportunity_type': true,
            'owner_name': true,
            'created': true,
            'created_by': true,
            'related_lead': true,
            "viewed_date": true,
            "viewed_by": true,
            // 'lead_actions': true,
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])

        this.state = {
            filter_opportunity_status: 'all',
            opportunityList: [],
            opportunity_status_option: [],

            // need these 2 states because lightning's <Dropdown /> is always an uncontrolled component
            // @todo: Unless there's a better way (maybe using object with booleans as value)
            // I didn't have the time to refactor
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            openOppBox: false,
            request_data: {},
            pageSize: 20,
            page: 0,
            sorted: [],
            filtered: {},
            refreshTable: true,
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
        this.rootRef = React.createRef()
    }


    getOptionsLeadStatus = () => {
        postData('sales/Opportunity/get_opportunity_status_option', {}).then((result) => {
            if (result.status) {
                this.setState({ opportunity_status_option: result.data })
            }
        });
    }

    componentDidMount() {
        $(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillMount() {
        this.getOptionsLeadStatus();
    }
    componentWillUnmount() {
        $(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    setTableParams = () => {
        var search_re = { search: this.state.search, filter_opportunity_status: this.state.filter_opportunity_status };
        this.setState({ filtered: search_re }, () => {
            this.refreshListView();
        });
    }

    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable,selection:[]}, () => {

        });
    }

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
                    id="ListingOpportunity-search-1"
                    placeholder="Search opportunities"
                />
            </form>
        )
    }

    renderStatusFilters() {
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={this.state.opportunity_status_option}
                onSelect={value => this.filterChange('filter_opportunity_status', value.value)}
                length={null}
                // value={this.state.filter_opportunity_status} // uncontrolled component
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
        )
    }

    /**
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {

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



    handleOnRenderActions = () => {
        const handleOnClickNewOpportunity = e => {
            e.preventDefault()
            this.showModal(0)
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/crm/opportunity/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewOpportunity}>
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment>
        )
    }


    /**
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
                    { this.renderStatusFilters() }
                </PageHeaderControl>
                <PageHeaderControl>
                    <Button
                        title={`Exporting data as CSV is not yet supported.`}
                        assistiveText={{ icon: 'Download' }}
                        iconCategory="utility"
                        iconName="arrowdown"
                        iconVariant="border-filled"
                        variant="icon"
                        disabled={true}
                    />
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'ID',
                width: 150,
                accessor: "opportunity_number",
                id: "opportunity_number",
            },
            {
                _label: 'Service type',
                accessor: "topic",
                id: "topic",
                width: 150,
                CustomUrl: [{ url: ROUTER_PATH + 'admin/crm/opportunity/PARAM1/' },
                { param: ['opportunity_id'] }, { property: 'target=_blank' }]
            },
            {
                _label: 'Account',
                accessor: "account",
                id: "account",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Status',
                accessor: "status",
                id: "status",
            },
            {
                _label: 'Type',
                accessor: "opportunity_type",
                id: "opportunity_type",
            },
            {
                _label: 'Assigned To',
                accessor: "owner_name",
                id: "owner_name",
            },
            {
                _label: 'Created date',
                accessor: "created",
                id: "created",
                width: 100,
                CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: 'Created by',
                accessor: "created_by",
                id: "created_by",
            },
            {
                _label: 'Related Lead',
                accessor: "related_lead",
                id: "related_lead",
            },
            {
                _label: 'Last Viewed Date',
                accessor: "viewed_date",
                id: "viewed_date",
                CustomDateFormat: "DD/MM/YYYY HH:mm",
            },
            {
                _label: 'Last Viewed By',
                accessor: "viewed_by",
                Header: ({ column }) => <div className='ellipsis_line1__ text-center'>{column._label}</div>,
                sortable: true,
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
        ]
    }

    showModal = (oppId) => {
        this.setState({ openOppBox: true, oppId: oppId }, () => {
            var tempPageTitle = '';
            if (this.state.oppId > 0)
                tempPageTitle = 'Edit Opportunity'
            else
                tempPageTitle = 'New Opportunity'

            this.setState({ pageTitle: tempPageTitle })
        })
    }

    closeModal = (param) => {
        this.setState({ openOppBox: false }, () => {
            if (param)
                this.refreshListView();
        });
    }

    editOpportunity = (editData) => {
        this.showModal(editData.opportunity_id);
    }

    archiveOpportunity = (id) => {
        this.setState({ deleteLeadModal: id })
        const msg = 'Are you sure you want to archive this Opportunity?'
        const confirmButton = 'Confirm'

        AjaxConfirm({ opportunity_id:id }, msg, 'sales/Opportunity/archive_opportunity', { confirm: confirmButton, heading_title: 'Archive Opportunity' }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, "fetchData");
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
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
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">

                        <DataTableListView
                            page_name="Opportunities"
                            header_icon="opportunity"
                            displayed_columns={this.props.displayed_columns}
                            filter_options={
                                selectOpportunityFilterOptions
                            }
                            list_api_url="sales/Opportunity/get_opportunity_list"
                            related_type="opportunity"
                            filter_status="all"
                            default_filter_logic="1 AND 2"
                            filter_title="All Opportunities"
                            show_filter={false}
                            check_default="all"
                            determine_columns={this.determineColumns}
                            on_render_actions={() => this.handleOnRenderActions()}
                            is_any_action={this.state.is_any_action}
                            filtered={true}
                            refresh={this.state.refreshTable}
                            custom_filter_status_option = {this.state.opportunity_status_option}
                        />

                    </IconSettings>
                </div>

                {this.state.openOppBox ? <CreateOpportunityPopUp openOppBox={this.state.openOppBox} closeModal={this.closeModal} oppId={this.state.oppId} pageTitle={this.state.pageTitle} data={this.state} /> : ''}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListingOpportunity);