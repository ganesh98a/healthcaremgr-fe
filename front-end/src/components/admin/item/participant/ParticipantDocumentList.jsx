import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { css, postData, reFreashReactTable, toastMessageShow, AjaxConfirm } from 'service/common.js';

import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
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
import CreateDocumentModel from '../../member/view/document/CreateDocumentModel.jsx';
import EditDocumentModel from '../../member/view/document/EditDocumentModel.jsx';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../scss/components/admin/item/item.scss';
import { getDocumentListByPage } from '../../member/actions/MemberAction';
import ArchiveModal  from '../../oncallui-react-framework/view/Modal/ArchiveModal';
/**
 * Class: ParticipantDocumentList
 */
class ParticipantDocumentList extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'file_name': true,
            'document': true,
            'status': true,
            'issue_date': true,
            'expiry_date': true,
            'reference_number': true,
            'file_ext': true,
            'file_size': true,
            'attached_on': true,
            'updated_on': true,
            'action': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            documentList: [],
            contact_id: '',
            filter_status: 'all',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateDocument: false,
            openEditDocument: false,
            participant_id: this.props.match.params.id,
            document_id: '',
            validStatus: 1,
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');
        this.get_participant_details(this.state.participant_id);
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Fetching participant details
     * 
     * Will fetch when:
     * - This component was mounted
     * - Participant was successfully updated
     */
    get_participant_details = (participant_id) => {
        this.setState({ loading: true })

        postData('item/participant/get_participant_detail_by_id', { participant_id })
            .then((result) => {
                if (result.status) {
                    this.setState({ ...result.data })
                } else {
                    this.setState({ redirectTo: ROUTER_PATH + `admin/item/participant` })
                }
            })
            .catch(() => console.error('Could not fetch participant details'))
            .finally(() => this.setState({ loading: false }))
    }
    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchDocumentData = (state) => {
        this.setState({ loading: true });
        getDocumentListByPage(
            this.state.participant_id,
            'item/participant/get_participant_document_list',
            'participants',
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                documentList: res.rows,
                document_count: res.count,
                pages: res.pages,
                loading: false
            });
        });
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
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewDocument = e => {
            e.preventDefault()
            this.showCreateDocumentModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/item/participant/participant_document/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewDocument}>
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
                    id="member-search-1"
                    placeholder="Search Document"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let documentStatusFilter = [
            { value: '', label: 'All' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'valid', label: 'Valid' },
            { value: 'invalid', label: 'InValid' },
            { value: 'expired', label: 'Expired' },
        ];
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={documentStatusFilter}
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
     * Show create document model
     */
    showCreateDocumentModal = () => {
        this.setState({
            openCreateDocument: true,
        });
    }
    
    /**
     * Show update document model
     */
    showEditDocumentModal = (id) => {
        this.setState({
            openEditDocument: true,
            document_id: id,
        });
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeEditDocumentModal = (status, documentId) => {
        this.setState({openEditDocument: false});

        if(status){
            if (documentId) {
                // to do...
            } else {
                if (this.state.document_count === 0) {
                    this.fetchDocumentData(this.state);
                } else {
                    reFreashReactTable(this, 'fetchDocumentData');
                }
                
            }
        }
    }

    /**
     * Open archive document modal
     */
    showDocumentArchiveModal(document_id) {
        this.setState({showDocumentArchiveModal :  true, archive_document_id : document_id});
    }
    /**
     * Close archive document modal
     */
    closeArchiveModal= () =>{
        this.setState({showDocumentArchiveModal :  false, archive_document_id : ''})
        reFreashReactTable(this, 'fetchDocumentData');
    }
    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, documentId) => {
        this.setState({openCreateDocument: false});

        if(status){
            if (documentId) {
                // to do...
            } else {
                reFreashReactTable(this, 'fetchDocumentData');                
            }
        }
    }

    /**
     * Covert bytes to MB
     * @param {int} bytes 
     */
    bytesToSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    /**
     * Render modals
     * - Create Document
     * - Edit Document
     * 
     */
    renderModals() {
        console.log("this.state.participant_id", this.state.participant_id);
        return (
            <React.Fragment>
                {
                    this.state.openCreateDocument && (
                        <CreateDocumentModel
                            showModal = {this.state.openCreateDocument}
                            closeModal = {this.closeModal}
                            headingTxt = "New Document"
                            entity_id={this.state.participant_id}
                            url={'item/participant/get_participant_document_list'}
                            user_page={'participants'}
                            {...this.props}
                        />
                    )
                }
                {
                    this.state.openEditDocument && (
                        <EditDocumentModel
                            showModal = {this.state.openEditDocument}
                            closeModal = {this.closeEditDocumentModal}
                            document_id = {this.state.document_id}
                            entity_id={this.state.participant_id}
                            url={'item/participant/get_participant_document_list'}
                            user_page={'participants'}
                            headingTxt = "Update Document"
                            {...this.props}
                        />
                    )
                }
                {this.state.showDocumentArchiveModal && <ArchiveModal
                        id = {this.state.archive_document_id}
                        msg={'Document'}
                        content ={'Are you sure you want to archive this document'}
                        confirm_button={'Archive Document'}
                        api_url = {'member/MemberDocument/archive_document'}
                        close_archive_modal = {this.closeArchiveModal}
                        on_success={()=> this.closeArchiveModal()}
                        />
                    }
            </React.Fragment>
        )
    }
    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        return [
            {
                _label: 'File Name',
                accessor: "file_name",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.original.file_path || props.original.file_path == '') {
                        return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                    }
                    return (
                        <span className="vcenter slds-truncate"> <a style={styles.hyperlink} className="reset" title="View/download" target="_blank" href={defaultSpaceInTable(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod3 + '/?url=' + props.original.file_path)}>{defaultSpaceInTable(props.value)}</a></span>
                    );
                }
            },
            {
                _label: 'Doc Type',
                accessor: "document",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Issue Date',
                accessor: "issue_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Expiry Date',
                accessor: "expiry_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Attached On',
                accessor: "attached_on",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Updated On',
                accessor: "updated_on",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="vcenter slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Reference Number',
                accessor: "reference_number",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Size',
                accessor: "file_size",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    return (<span className="slds-truncate">{this.bytesToSize(defaultSpaceInTable(props.value))}</span>);
                },
            },
            {
                _label: 'Action',
                accessor: "action",
                className: "slds-tbl-card-td slds-tbl-card-td-dd",
                sortable: false,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => 
                <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    iconVariant="border-filled"
                    disabled={ Number(props.original.system_gen_flag) === 1 && this.state.validStatus === Number(props.original.document_status)? true : false}
                    onSelect={(e) => {
                        if(e.value == 1){ //edit
                            this.showEditDocumentModal(props.original.id)
                        }
                        else { // delete
                            this.showDocumentArchiveModal(props.original.id);
                        }
                    }}
                    className={'slds-more-action-dropdown'}
                    options={[
                        { label: 'Edit', value: '1' },
                        { label: 'Delete', value: '2' },
                    ]}
                />,
            },
        ]
    }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user create document
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        const trail = [
            <Link to={ROUTER_PATH + `admin/item/participant`} className="reset" style={{ color: '#0070d2' }}>
                {'Participants'}
            </Link>,
			<Link to={ROUTER_PATH + `admin/item/participant/details/${this.state.participant_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.name}
            </Link>,
		];
        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title="Documents"
					        trail={trail}
                            label={<span />}
                            truncate
                            variant="related-list"
                        />
                            <SLDSReactTable
                                PaginationComponent={() => false}
                                ref={this.reactTable}
                                manual="true"
                                loading={this.state.loading}
                                pages={this.state.pages}
                                onFetchData={this.fetchDocumentData}
                                filtered={this.state.filtered}
                                defaultFiltered={{ filter_status: 'all' }}
                                columns={displayedColumns}
                                data={this.state.documentList}
                                defaultPageSize={9999}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No Record Found"
                                collapseOnDataChange={true}
                                resizable={true}
                                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card slds-tbl-scroll' }) }
                            />
                        </IconSettings>
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

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantDocumentList);
