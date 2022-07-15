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
import { Redirect } from 'react-router';
import { showArchiveAccountMemberModal, openAddEditAccountMemberModal } from './AccountCommon';
import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Icon, 
    ButtonGroup, 
    Button, 
    Dropdown, 
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';


/**
 * RequestData get the list of organistation members
 */
const requestData = (account_id, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { account_id: account_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Account/get_organisation_members_list', Request).then((result) => {
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
 * Class: ListOrganisationMembers
 */
class ListOrganisationMembers extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'fullname': true,
            'status_label': true,
            'reg_date': true,
            'ref_no': true,
            'created': true,
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
            account_member_id: '',
            account: '',
            searchVal: '',
            filterVal: '',
            filter_status: 'all',
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
                member_skillsList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * Get the list based on Search value
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
     * Open create organisation member modal
     */
    showModal(account_member_id) {
        this.setState({ openCreateModal: true, account_member_id: account_member_id });
    }

    /**
     * Open archive organisation member modal
     */
    showArchiveModal(account_member_id) {
        showArchiveAccountMemberModal(account_member_id, this.setTableParams);
    }

    /**
     * fetching the organisation details if the account_id is passed
     */
    get_organisation_account_details = (id) => {
        postData('sales/Account/get_organisation_account_details', { org_id: id }).then((result) => {
            if (result.status) {
                this.setState({account: result.data});
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
            this.get_organisation_account_details(this.state.account_id);
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
                    <Button label="New" onClick={e => this.showModal()} />
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * Close the modal when user save the organisation members and refresh the table
     */
    closeAddEditOrgMemberModal = (status) => {
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
                    id="Member-skills-search-1"
                    placeholder="Search Registered Support Workers"
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
                _label: 'Support Worker',
                accessor: "fullname",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'memlink' + props.original.member_id} to={ROUTER_PATH + 'admin/support_worker/details/' + props.original.member_id} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Status',
                accessor: "status_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Registration Date',
                accessor: "reg_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value != null && props.value != "0000-00-00 00:00:00" ? moment(props.value).format("DD/MM/YYYY") : ""}</span>
            },
            {
                _label: 'Reference Number',
                accessor: "ref_no",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Date Added',
                accessor: "created",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value != null && props.value != "0000-00-00 00:00:00" ? moment(props.value).format("DD/MM/YYYY HH:mm") : "N/A"}</span>
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
                id={'actions' + props.original.member_id}
                iconVariant="border-filled"
                onSelect={(e) => {
                    if(e.value == 1){ //edit
                        this.showModal(props.original.id)
                    }
                    else { // delete
                        this.showArchiveModal(props.original.id)
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
            <Link id={'listing-link'} to={ROUTER_PATH + `admin/crm/organisation/listing`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Organisation</Link>,
            <Link id={'detail-link'} to={ROUTER_PATH + `admin/crm/organisation/details/` + this.state.account_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.account.label}</Link>,
        ];

        return (
            <React.Fragment>
            <PageHeader
                trail={trail}
                onRenderActions={this.handleOnRenderActions}
                onRenderControls={this.handleOnRenderControls({ columns })}
                title="Registered Support Workers"
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
                            data={this.state.member_skillsList}
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
                {openAddEditAccountMemberModal(this.state.account_member_id, this.state.account_id, this.state.openCreateModal, this.closeAddEditOrgMemberModal)}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListOrganisationMembers);
