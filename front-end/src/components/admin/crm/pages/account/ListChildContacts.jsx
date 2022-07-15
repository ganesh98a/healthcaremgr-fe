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
import { showArchiveAccountContactModal, openAddEditAccountContactModal } from './AccountCommon';

import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Button, 
    Dropdown, 
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import { activate_org_portal_user } from '../../actions/ContactAction';

/**
 * RequestData get the list of account contacts
 */
const requestData = (account_id, account_type, pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { id: account_id, account_type: account_type, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Account/get_account_contacts_list', Request).then((result) => {
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
 * Class: ListChildContacts
 */
class ListChildContacts extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'contact_name': true,
            'role_name': true,
            'contact_id': true,
            'account_id': true,
            'created': true,
            'updated': true,
            'status': true,
            'is_primary': true,
            'org_status': true,
            'shipping_address': true,
            'actions': true,
            'id': true
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
        var account_type = '';
        if(props.match && props.match.params.id > 0) {
            account_id = props.match.params.id;
            displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        if(props.match && props.match.params.type > 0) {
            account_type = props.match.params.type;
        }
        
        // Initialize state
        this.state = {
            account_id: account_id,
            account_type: account_type,
            account_no: '',
            edit_account_id: '',
            searchVal: '',
            filterVal: '',
            account_contacts_list: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false,
            row_selections: []
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
            this.state.account_type,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                account_contacts_list: res.rows,
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
     * Open assign account contact modal
     */
    showModal(edit_account_id) {
        this.setState({ openCreateModal: true, edit_account_id: edit_account_id });
    }

    /**
     * Open archive account contact modal
     */
    showArchiveModal(edit_account_id) {
        showArchiveAccountContactModal(edit_account_id, this.setTableParams, null, "contacts");
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

    /**
     * fetching the opportunity details if the account_id is passed
     */
    get_opportunity_details = (id) => {
        postData('sales/Opportunity/view_opportunity', { opportunity_id : id }).then((result) => {
            if (result.status) {
                this.setState({account_name: result.data.opportunity_number});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        if(this.state.account_id && this.state.account_type == 2) {
            this.get_account_details(this.state.account_id);
        }
        else if(this.state.account_id && this.state.account_type == 3) {
            this.get_opportunity_details(this.state.account_id);
        }
    }

    checkEmailPortalStatus() {
        console.log(this.state.account_contacts_list);
        this.state.account_contacts_list.forEach((e, i) => {
            if (e.is_primary === '1') {
                if (e.org_status === "Active") {
                    toastMessageShow('User already activated', 'e');
                    return;
                } else {
                    if (!e.email || e.email === '') {
                        toastMessageShow('Contact mail not available', 'e');
                        return;
                    } else {
                        activate_org_portal_user(e.person_id).then((result) => {
                            if (result.status) {
                                toastMessageShow(result.msg, 's');
                            } else {
                                toastMessageShow(result.error, 'e');
                            }
                        });
                    }
                }
            }
        });
        
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="Portal login" id="new-account-org" onClick={() => { this.checkEmailPortalStatus() }} />
                    <Button disabled={(this.state.is_account_locked || this.state.disabled_contacts == 1) ? true : false} label="New" id="new-account-contact" onClick={e => this.showModal()} />
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * Close the modal when user saves the account contact and refresh the table
     */
    closeAddEditModal = (status) => {
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
                    id="Account-contact-search-1"
                    placeholder="Search Contacts"
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
                _label: 'ID',
                accessor: "id",
                id: 'id',
                Header: () => (
                    <div className="slds-checkbox">
                        <input type="checkbox" name="header_checkbox" id="header_checkbox" disabled />
                        <label className="slds-checkbox__label" htmlFor="header_checkbox">
                            <span className="slds-checkbox_faux"></span>
                        </label>
                    </div>
                ),
                sortable: false,
                resizable: false,
                width: '1.5rem',
                Cell: props => {
                    var checkid = props.value;
                    var check_index = this.state.row_selections.indexOf(checkid);
                    var checked = (check_index == -1) ? false : true;
                    return (
                        <div className="slds-checkbox">
                            <input type="checkbox" name={checkid} id=
                                {checkid} disabled />
                            <label className="slds-checkbox__label" htmlFor={checkid}>
                                <span className="slds-checkbox_faux"></span>
                            </label>
                        </div>
                    )
                }
            },
            {
                _label: 'Contact Name',
                accessor: "contact_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'contactlink' + props.original.id} to={ROUTER_PATH + 'admin/crm/contact/details/' + props.original.person_id} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Role',
                accessor: "role_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value}</span>
            },
            {
                _label: 'Is Primary?',
                accessor: "is_primary",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{props.value == 1 ? 'Yes' : 'No'}</span>
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
                _label: 'Org Portal Access',
                accessor: "org_status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
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
                disabled={(this.state.is_account_locked || this.state.disabled_contacts == 1) ? true : false}
                id={'actions' + props.original.contact_id}
                iconVariant="border-filled"
                onSelect={(e) => {
                    this.showArchiveModal(props.original.id)
                }}
                width="xx-small"
                options={[
                    { label: 'Delete', value: '1' },
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
        var link_page = this.state.account_type == 3 ? "Opportunities" : "Organisations";
        var link_url = this.state.account_type == 3 ? "opportunity" : "organisation";
        var link_url2 = this.state.account_type == 3 ? "opportunity" : "organisation/details";
        const trail = [
            <Link to={ROUTER_PATH + `admin/crm/` + link_url +`/listing`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }} id="account-list">{link_page}</Link>,
            <Link to={ROUTER_PATH + `admin/crm/` + link_url2 +`/` + this.state.account_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }} id="account-details">{this.state.account_name}</Link>,
        ];

        return (
            <React.Fragment>
            <PageHeader
                trail={trail}
                onRenderActions={this.handleOnRenderActions}
                onRenderControls={this.handleOnRenderControls({ columns })}
                title="Related Contacts"
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
                {openAddEditAccountContactModal(this.state.account_id, this.state.account_type, this.state.openCreateModal, this.closeAddEditModal)}
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
                            data={this.state.account_contacts_list}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListChildContacts);
