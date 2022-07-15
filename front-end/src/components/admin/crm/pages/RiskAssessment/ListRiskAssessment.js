import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';

import { Button, Dropdown, DropdownTrigger, Input, InputIcon, PageHeaderControl } from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import jQuery from 'jquery';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import { css, reFreashReactTable } from 'service/common.js';
import { riskAssessmentStatusFilter } from '../../../../../dropdown/CrmDropdown.js';
import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView';
import CreateRiskAssessmentModel from './CreateRiskAssessmentModel';
import EditRiskAssessmentModel from './EditRiskAssessmentModel';

// create risk assessment model
/**
 * Class: ListRiskAssessment
 */
class ListRiskAssessment extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'reference_id': true,
            'topic': true,
            'account': true,
            'owner': true,
            'status': true,
            'created_date': true,
            'created_by': true,
            'action': true,
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            riskAssessmentList: [],
            filter_status: 'all',
            openEditModal: false,
            editRiskAssessmentId: '',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }
    /**
     * Get the list based on filter value
     * @param {str} key 
     * @param {str} value 
     */
    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    /**
     * Get the list based on Search value
     * @param {object} e 
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * Set the data for fetching the list
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re });
    }

    /**
     * Open create risk assessment modal
     */
    showModal = (oppId) => {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user save the risk assessment and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, riskAssessmentId) => {
        this.setState({openCreateModal: false});

        if(status){
            if (riskAssessmentId) {
                this.setState({ redirectTo: ROUTER_PATH + `admin/crm/riskassessment/details/`+ riskAssessmentId });
            } else {
                reFreashReactTable(this, 'fetchData');
              //  this.fetchRefereceID();
            }
        }
    }

    /*
     * Assign the risk assessment id and open edit modal true
     * param {int} risAssessmentId
     */
    editRiskAssessment(risAssessmentId) {
        this.setState({ openEditModal: true, editRiskAssessmentId: risAssessmentId });
    }

    /**
     * Close the edit modal when user save the risk assessment and refresh the table
     */
    closeEditModal = (status) => {
        this.setState({openEditModal: false});

        if(status){
            reFreashReactTable(this, 'fetchData');
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
      //  this.fetchRefereceID();
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewRiskAssessment = e => {
            e.preventDefault()
            this.showModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/crm/riskassessment/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewRiskAssessment}>
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment> 
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
                    id="ListingRiskAssessment-search-1"
                    placeholder="Search risk assessment"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={riskAssessmentStatusFilter(0)}
                onSelect={value => this.filterChange('filter_status', value.value)}
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

    /**
     * Render table column dropdown
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

    /**
     * Render page header
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
            </React.Fragment>
        )
    }

    /**
     * Render modals
     * - Create Risk Assessment
     * - Edit Risk Assessment
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateModal && (
                        <CreateRiskAssessmentModel
                            showModal = {this.state.openCreateModal}
                            closeModal = {this.closeModal}
                            headingTxt = "Create Risk Assessment"
                        />
                    )
                }
                {
                   this.state.openEditModal && (
                        <EditRiskAssessmentModel
                            showModal = {this.state.openEditModal}
                            riskAssessmentId = {this.state.editRiskAssessmentId}
                            closeModal= {this.closeEditModal}
                            headingTxt = "Edit Risk Assessment"
                        />
                    ) 
                }
            </React.Fragment>
        )
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "reference_id"
            },
            {
               
                _label: 'Topic',
                accessor: "topic",
                CustomUrl: [{ url: ROUTER_PATH + 'admin/crm/riskassessment/details/PARAM1' }, { param: ['risk_assessment_id'] }, { property: 'target=_blank' }]
            },
            {
                _label: 'Account',
                accessor: "account"
            },
            {
                _label: 'Assigned To',
                accessor: "owner"
            },
            {
                _label: 'Status',
                accessor: "status"
            },
            {
                _label: 'Created date',
                accessor: "created_date"
            },
            {
                _label: 'Created by',
                accessor: "created_by"
            },
        ]
    }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user create risk assessment
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="Risk Assessment"
                        header_icon="service_contract"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            [
                                { value: "Status", label: "Status", field: "status" }
                            ]
                        }
                        list_api_url="sales/RiskAssessment/get_risk_assessment_list"
                        related_type="risk_assessment"
                        filter_status= "all"
                        default_filter_logic= "1 AND 2"
                        filter_title="All Risk Assessments"
                        show_filter={false}
                        check_default = "all"
                        is_any_data_pinned = {false}
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        sortColumnLabel="ID"
                    />
                </div>
                {this.renderModals()}
            </React.Fragment>
        )


    }
    

}
// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
// Get the page title and type from reducer
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListRiskAssessment);
