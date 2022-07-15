import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import '../../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { showArchiveAccountMemberModal, openAddEditAccountMemberModal } from './AccountCommon';
import {
    IconSettings,
    PageHeaderControl,
    ButtonGroup,
    Button,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
    Card,
    MediaObject,
    Dropdown
} from '@salesforce/design-system-react';

/**
 * Class: AccountMembers
 */
class AccountMembers extends Component {
    
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            account_id: this.props.account_id ? this.props.account_id : '',
            account_member_id: '',
            account_members: [],
            account_members_count: 0,
            openCreateModal: false,
            pageSize: 6,
            page: 0,
            sorted: [],
            filtered: []
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * fetching the account_members
     */
    get_organisation_members_list = () => {
        var Request = { account_id: this.state.account_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('sales/Account/get_organisation_members_list', Request).then((result) => {
            if (result.status) {
                this.setState({account_members: result.data, account_members_count: result.count});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Open create account member modal
     */
    showModal(account_member_id) {
        this.setState({ openCreateModal: true, account_member_id: account_member_id });
    }

    /**
     * Open archive account member modal
     */
    showArchiveModal(account_member_id) {
        showArchiveAccountMemberModal(account_member_id, this.get_organisation_members_list);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.account_id) {
            this.get_organisation_members_list();
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Close the modal when user save the account members and refresh the members table
     */
    closeAddEditAccountMemberModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_organisation_members_list();
        }
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
                _label: 'Action',
                accessor: "",
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
        ]
    }

    /**
     * Render the account members table
     */
    renderTable() {
        var account_id = this.props.account_id;
        const displayedColumns = this.determineColumns();

        if (this.state.account_members_count == 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => false}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                filtered={this.state.filtered}
                columns={displayedColumns}
                data={this.state.account_members}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={false} 
                style={{border:'none'}}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.account_members_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="custom-card-footer">
                <Link to={ROUTER_PATH + `admin/crm/organisation/support_worker/${this.state.account_id}`} className="slds-align_absolute-center default-underlined" id="view-all-members" title="View all account members" style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        // return
        return (
            <React.Fragment>
                <Card
                headerActions={<Button label="New" onClick={e => this.showModal()} />}
                heading={"Registered Support Workers ("+ this.state.account_members_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" size="small" name="avatar"
                style={{
                    backgroundColor: '#ea7600',
                    fill: '#ffffff',
                }} />}
                bodyClassName="body-no-padding"
                >
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
                {openAddEditAccountMemberModal(this.state.account_member_id, this.state.account_id, this.state.openCreateModal, this.closeAddEditAccountMemberModal)}
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

export default connect(mapStateToProps, mapDispatchtoProps)(AccountMembers);
