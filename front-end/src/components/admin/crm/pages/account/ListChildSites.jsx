import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import '../../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { showArchiveAccountModal, openAddEditAccountModal } from './AccountCommon';

import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Icon, 
    ButtonGroup, 
    Button, 
    Dropdown, 
    DropdownTrigger,
    Checkbox,
    Input,
    InputIcon
} from '@salesforce/design-system-react';

/**
 * RequestData get the list of account sites
 */
const requestData = (account_id, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { id: account_id, is_site: 1, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Account/get_sub_organisation_details', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count)
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0
                };
                resolve(res);
            }
        });
    });
};

/**
 * Class: ListChildSites
 */
class ListChildSites extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'name': true,
            'site_id': true,
            'account_id': true,
            'created': true,
            'updated': true,
            'status': true,
            'service_area_label': true,
            'primary_contact_name': true,
            'shipping_address': true,
            'created_by' : true,
            'actions': true
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        
        var displayed_columns = ''
        var account_id = '';
        if(props.match && props.match.params.id > 0) {
            account_id = props.match.params.id;
            displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        
        // Initialize state
        this.state = {
            account_id: account_id,
            account_no: '',
            edit_account_id: '',
            searchVal: '',
            filterVal: '',
            account_sites_list: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }
   
    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.state.account_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                account_sites_list: res.rows,
                pages: res.pages,
                loading: false
            });
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
     * Open assign account site modal
     */
    showModal(edit_account_id) {
        this.setState({ openCreateModal: true, edit_account_id: edit_account_id });
    }

    /**
     * Open archive account site modal
     */
    showArchiveModal(edit_account_id) {
        showArchiveAccountModal(edit_account_id, this.setTableParams, null, "sites");
    }

    /**
     * fetching the account details if the account_id is passed
     */
    get_account_details = (id) => {
        postData('sales/Account/get_account_details_for_view', { org_id: id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.account_id) {
            this.get_account_details(this.state.account_id);
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button disabled={(this.state.is_account_locked || this.state.disabled_sites == 1) ? true : false} label="New" id="new-account-site" onClick={e => this.showModal()} />
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * Close the modal when user saves the account site and refresh the table
     */
    closeAddEditAccountModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            reFreashReactTable(this, 'fetchData');
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
                    id="Account-site-search-1"
                    placeholder="Search Sites"
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

    /**
     * Render table column dropdown
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {
        columns = columns.filter(col => (col.accessor != "actions"));
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
                _label: 'Account Name',
                accessor: "name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'memlink' + props.original.site_id} to={ROUTER_PATH + 'admin/crm/organisation/details/' + props.original.id} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Service Area',
                accessor: "service_area_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value}</span>
            },
            {
                _label: 'Primary Contact',
                accessor: "primary_contact_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'contactlink' + props.original.primary_contact_id} to={ROUTER_PATH + 'admin/crm/contact/details/' + props.original.primary_contact_id} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Location',
                accessor: "shipping_address",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value}</span>
            },
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value}</span>
            },
            {
                _label: 'Date Added',
                accessor: "created",
                id: 'created',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</span>
            },
            {
                _label: 'Date Updated',
                accessor: "updated",
                id: 'updated',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value != '0000-00-00 00:00:00' ? defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm")) : ''}</span>
            },
            {
                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value}</span>
            },
            {
                _label: 'Action',
                accessor: "actions",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => <Dropdown
                assistiveText={{ icon: 'More Options' }}
                iconCategory="utility"
                iconName="down"
                align="right"
                iconSize="x-small"
                disabled={(this.state.is_account_locked || this.state.disabled_sites == 1) ? true : false}
                id={'actions' + props.original.site_id}
                iconVariant="border-filled"
                onSelect={(e) => {
                    if(e.value == 2) {
                        this.showArchiveModal(props.original.id)
                    }
                    else {
                        this.showModal(props.original.id)
                    }
                }}
                width="xx-small"
                options={[
                    { label: 'Edit', value: '1' },
                    { label: 'Delete', value: '2' },
                ]}
            />
            
            }
        ];
    }

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();
        const trail = [
            <Link to={ROUTER_PATH + `admin/crm/organisation/listing`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }} id="account-list">Organisations</Link>,
            <Link to={ROUTER_PATH + `admin/crm/organisation/details/` + this.state.account_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }} id="account-details">{this.state.account_name}</Link>,
        ];

        return (
            <React.Fragment>
            <PageHeader
                trail={trail}
                onRenderActions={this.handleOnRenderActions}
                onRenderControls={this.handleOnRenderControls({ columns })}
                title="Related Sites"
                label=" "
                truncate
                variant="related-list"
            />
            </React.Fragment>
        )
    }
    
    /**
     * Render the display content
     */
    render() {
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        
        // return
        return (
            <React.Fragment>
                {this.state.openCreateModal && openAddEditAccountModal(this.state.edit_account_id, true, this.state.account_id, this.state.account_name, this.state.openCreateModal, this.closeAddEditAccountModal, 1)}
                <div className="slds" style={styles.root} ref={this.rootRef}>
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
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.account_sites_list}
                            defaultPageSize={9999}
                            minRows={1}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}                                     
                        />
                    </IconSettings>
                </div>
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListChildSites);
