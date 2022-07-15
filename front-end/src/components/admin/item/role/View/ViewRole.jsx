
import React, { Component } from 'react';
import _ from 'lodash'
import jQuery from 'jquery'
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { postData, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { ROUTER_PATH } from '../../../../../config.js';


import IconSettings from '@salesforce/design-system-react/lib/components/icon-settings';
import Tabs from '@salesforce/design-system-react/lib/components/tabs';
import TabsPanel from '@salesforce/design-system-react/lib/components/tabs/panel';
import ButtonGroup from '@salesforce/design-system-react/lib/components/button-group';
import Button from '@salesforce/design-system-react/lib/components/button';
import PageHeader from '@salesforce/design-system-react/lib/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/lib/components/page-header/control';
import Icon from '@salesforce/design-system-react/lib/components/icon';
import CreateRoleModal from '../CreateRoleModel';
import Card from '@salesforce/design-system-react/lib/components/card';
import AttachDocToRoleModal from '../AttachDocToRoleModal';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import { defaultSpaceInTable } from 'service/custom_value_data.js'
import { Dropdown, DataTableRowActions } from '@salesforce/design-system-react'

class ViewRole extends Component {

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            openAttachDocToRoleModal: false,
            role_details: [],
            role_documents: [],
            role_doc_id: '',
            deleteRoleDocumentModal: 0,
            total_role_documents: 0
        }

        this.rootRef = React.createRef()
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')

        var roleId = this.props.match.params.id;
        this.get_role_details({ roleId: roleId });
        this.get_role_documents({ role_id: roleId });
    }

    /**
     * Not in use?
     */
    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Fetch role details
     * 
     * Will fetch when:
     * - This component was mounted
     * - Role was successfully updated
     */
    get_role_details = (id) => {
        this.setState({ loading: true })

        postData('item/MemberRole/get_role_details_for_view', id)
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
     * Fetching all the documents of a current role
     * @param {*} id 
     */
    get_role_documents = (id) => {
        this.setState({ loading: true })

        postData('item/document/get_role_documents', id)
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
     * when archive is requested by the user for selected role document
     */
    handleOnArchiveRoleDocument = (role_doc_id) => {
        const msg = `Are you sure you want to archive this role document?`
        const confirmButton = `Archive Role Document`
        AjaxConfirm({ role_doc_id }, msg, `item/document/archive_role_document`, { confirm: confirmButton, heading_title: `Archive role document` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.get_role_documents({ role_id: this.props.match.params.id });
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * when archive is requested by the user for current role
     */
    handleOnArchiveRole = () => {
        const role_id = this.props.match.params.id
        this.setState({ deleteLeadModal: role_id })

        const msg = `Are you sure you want to archive this role?`
        const confirmButton = `Archive role`

        AjaxConfirm({ role_id }, msg, `item/MemberRole/archive_role`, { confirm: confirmButton, heading_title: `Archive role` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.setState({ redirectTo: ROUTER_PATH + `admin/item/role` })
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Rendering buttons of the header
     */
    actions = () => (
        <React.Fragment>
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" onClick={() => this.setState({ openCreateModal: true, selectedOrgId: this.state.id })} />
                    <Button label="Delete" onClick={this.handleOnArchiveRole} />
                </ButtonGroup>
            </PageHeaderControl>
        </React.Fragment>
    );

    /**
     * When edit role modal is closed
     * @param {*} status 
     */
    closeModal = (status) => {
        this.setState({ openCreateModal: false });
        if (status) {
            this.get_role_details({ roleId: this.props.match.params.id });
            this.get_role_documents({ role_id: this.props.match.params.id });
        }
    }

    /**
     * Open opportunity create modal
     */
    showAttachDocToRoleModal = (role_doc_id) => {
        this.setState({ openAttachDocToRoleModal: true, role_doc_id: role_doc_id, role_details: { name: this.props.name, id: this.props.match.params.id } });
    }

    /**
     * Close opportunity create modal
     */
    hideAttachDocToRoleModal = (status) => {
        this.setState({ openAttachDocToRoleModal: false });
        if(status == true) {
            var roleId = this.props.match.params.id;
            this.get_role_details({ roleId: roleId });
            this.get_role_documents({ role_id: this.props.match.params.id });
        }
    }

    /**
     * Formats date to` DD/MM/YYYY` (eg `10/06/2020`) 
     * or else display `N/A`
     * 
     * @param {string} dateStrYmdHis 
     * @param {string} defaultDate 
     * @param {string} displayFormat 
     */
    formatDate(dateStrYmdHis, defaultDate = `N/A`, displayFormat = 'DD/MM/YYYY') {
        if (!dateStrYmdHis) {
            return defaultDate
        }

        return moment(dateStrYmdHis).isValid() ?
            moment(dateStrYmdHis).format(displayFormat) :
            defaultDate
    }

    /**
     * Renders the details tab
     */
    renderDetailsTab() {
        const styles = css({
            root: {
                border: 'none',
                paddingTop: 0,
            },
            heading: {
                marginBottom: 15,
                marginTop: 8,
            },
            headingText: {
                fontSize: 15,
                fontWeight: 'normal',
            },
            col: {
                marginBottom: 15,
            },
            hr: { marginTop: 20, marginBottom: 20, border: 0, borderTop: '1px solid #eee', width: 'auto' },
            ul: { listStyleType: 'disc', paddingLeft: 40 },
        })

        const notAvailable = 'N/A' // this.props.notAvailable

        const details = [
            {
                label: 'Name',
                value: this.state.name || 'N/A',
            },
            {
                label: 'Description',
                value: this.state.description || 'N/A',
            },
            {
                label: 'Start Date',
                title: this.formatDate(this.state.start_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.start_date),
            },
            {
                label: 'End Date',
                title: this.formatDate(this.state.end_date, undefined, 'Do MMMM YYYY'),
                value: this.formatDate(this.state.end_date),
            },
        ]


        return (
            <div className="row slds-box" style={styles.root}>
                <div className="col col col-sm-12" style={styles.heading}>
                    <h3 style={styles.headingText}>Role details</h3>
                </div>
                {
                    details.map((detail, i) => {
                        return (
                            <div key={i} className="col col-sm-6" style={styles.col}>
                                <div className="slds-form-element">
                                    <label className="slds-form-element__label">{detail.label}</label>
                                    <div className="slds-form-element__control" title={detail.title}>
                                        {detail.value || notAvailable}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
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
                <Link to={ROUTER_PATH + `admin/item/role/details/${this.props.match.params.id}/documents/`} className="slds-align_absolute-center default-underlined" title="View all role documents" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }

    /**
     * specifying the columns to be used in documents card
     */
    determineDocColumns() {
        return [
            {
                _label: 'Document Name',
                accessor: "title",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <Link to={ROUTER_PATH + `admin/item/document/details/${props.original.document_id}`} 
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
                        this.showAttachDocToRoleModal(props.original.id)
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
     * Renders the related tab
     */
    renderRelatedTab() {
        const id = _.get(this.props, 'props.match.params.id')
        const displayedColumns = this.determineDocColumns()

        return (
            <React.Fragment>
                <div className="slds-grid slds-grid_vertical slds_my_card">
                    <div className="slds-col">
                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <div className="slds-grid slds-grid_vertical">
                                <Card
                                    id="ExampleCard"
                                    headerActions={<Button label="New" onClick={e => this.showAttachDocToRoleModal()} />}
                                    heading={"Documents ("+this.state.total_role_documents+")"}
                                    icon={<Icon category="standard" size="small" name="document"
                                    style={{
                                        backgroundColor: '#baac93',
                                        fill: '#ffffff'
                                    }} />}
                                    footer={this.renderViewAll()}
                                >
                                    
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

                                
                                </Card>
                            </div>
                        </IconSettings>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    /**
     * specifying and rendering modals
     */
    renderModals() {
        return (
            <React.Fragment>
            {
            this.state.openCreateModal ? <CreateRoleModal
                roleId={this.props.match.params.id}
                showModal={this.state.openCreateModal}
                closeModal={this.closeModal}
            /> : "" }
            {
            this.state.openAttachDocToRoleModal && (
                <AttachDocToRoleModal 
                    showAttachDocToRoleModal={true}
                    hideAttachDocToRoleModal={this.hideAttachDocToRoleModal}
                    role_details={this.state.role_details}
                    role_doc_id={this.state.role_doc_id}
                    pageTitle={'Add Document to Role'}
                />
            )
            }
            </React.Fragment>
        )
    }

    /**
     * rendering components
     */
    render() {
        if (this.props.owner_name) {
            var details = [
                {
                    label: 'Owner',
                    content: this.props.owner_name,
                    truncate: true,
                },
            ];
        } else {
            var details = "";
        }

        // This will only run when you archive lead
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }


        return (
            <React.Fragment>
                <div className="slds-grid slds-grid_vertical slds" ref={this.rootRef} style={{ "fontFamily": "Salesforce Sans, Arial, Helvetica, sans-serif", "margin-right": "-15px", "fontSize": "13px" }}>
                    <div className="slds-col custom_page_header">

                        <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                            <PageHeader
                                details={details}
                                icon={
                                    <Icon
                                        assistiveText={{ label: 'User' }}
                                        category="standard"
                                        name="portal_roles"
                                    />
                                }
                                label="Role"
                                onRenderActions={this.actions}
                                title={this.state.name}
                                variant="record-home"
                            />
                        </IconSettings>
                    </div>

                    <div className="slds-col ">
                        <div className="slds-grid slds-wrap slds-gutters_x-small">
                            <div className="slds-col slds-m-top_medium ">
                                <div className="white_bg_color slds-box ">
                                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                                        <Tabs id="tabs-example-default">
                                            <TabsPanel label="Related">
                                                {this.renderRelatedTab()}
                                            </TabsPanel >
                                            <TabsPanel label="Details">
                                                {this.renderDetailsTab()}
                                            </TabsPanel >
                                        </Tabs >
                                    </IconSettings >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderModals()}
            </React.Fragment >
        );
    }
}

export default ViewRole;