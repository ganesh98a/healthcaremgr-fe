import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, AjaxConfirm, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import AttachRoleToDocModal from '../AttachRoleToDocModal';
import { Dropdown, DataTableRowActions } from '@salesforce/design-system-react'
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { ROUTER_PATH } from '../../../../../config.js';

import {
    Card,
    Button,
    Icon,
    IconSettings,
} from '@salesforce/design-system-react';


/**
 * Class: Roles
 */
class Roles extends Component {

    static defaultProps = {
        /**
         * @type {int}
         */
        document_id: null,
    };

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            openAttachRoleToDocModal: false,
            doc_details: [],
            role_documents: [],
            role_doc_id: '',
            doc_id: '',
            loading: false,
            redirectPage: false,
            total_role_documents: 0,
        }
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
                this.get_role_documents({ doc_id: this.props.document_id });
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
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
                iconVariant="border-filled"
                onSelect={(e) => {
                    if(e.value == 1){ //edit
                        this.showAttachRoleToDocModal(props.original.id)
                    }
                    else { // delete
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
     * mounting all the components
     */
    componentDidMount() {
        var doc_id = this.props.document_id;
        this.get_role_documents({ doc_id: doc_id });
    }

    /**
     * Render roles table
     */
    renderTable() {
        var doc_id = this.props.document_id;
        const displayedColumns = this.determineColumns();

        return (
            <SLDSReactTable
                PaginationComponent={() => false}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                // onFetchData={this.fetchData}
                filtered={this.state.filtered}
                // defaultFiltered={{ filter_status: 'all' }}
                columns={displayedColumns}
                data={this.state.role_documents}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={false} 
            />
        )
    }

    /**
     * Open attaching role and document modal
     */
    showAttachRoleToDocModal = (role_doc_id) => {
        console.log(this.props);
        this.setState({ openAttachRoleToDocModal: true, role_doc_id: role_doc_id, doc_details: { name: this.props.title, id: this.props.document_id } });
    }

    /**
     * Close attaching role and document modal
     */
    hideAttachRoleToDocModal = (status) => {
        this.setState({ openAttachRoleToDocModal: false });
        if(status == true) {
            var doc_id = this.props.document_id;
            this.get_role_documents({ doc_id: doc_id });
        }
    }

    /**
     * Fetching all the roles of a current document
     * @param {*} id 
     */
    get_role_documents = (reqdata) => {
        this.setState({ loading: true })
        console.log(reqdata);

        postData('item/document/get_role_documents', reqdata)
            .then((result) => {
                if (result.status) {
                    this.setState({ role_documents: result.data, total_role_documents: result.total_rows })
                } else {
                    console.error('Could not fetch role details')
                }
            })
            .catch(() => console.error('Could not fetch role details'))
            .finally(() => this.setState({ loading: false }))
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.total_role_documents == 0) {
            return <React.Fragment />
        }

        return (            
            <React.Fragment>
                <Link to={ROUTER_PATH + `admin/item/document/details/${this.props.document_id}/roles/`} className="pt-2 slds-align_absolute-center default-underlined" title="View all document roles" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={<Button label="New" onClick={e => this.showAttachRoleToDocModal()}/>}
                        heading={"Roles ("+this.state.total_role_documents+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="portal_roles" size="small" />}
                        footer={this.renderViewAll()}
                    >
                        
                        {this.renderTable()}
                    </Card>                    
                </IconSettings>
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

export default Roles;
