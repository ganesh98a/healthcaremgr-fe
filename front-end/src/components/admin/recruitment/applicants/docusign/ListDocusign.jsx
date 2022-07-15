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
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
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
import CreateDocusignModel from './CreateDocusignModel.jsx';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../scss/components/admin/item/item.scss';
import { getApplicantInfoByJobId } from '../../actions/RecruitmentApplicantAction';

/**
 * RequestData get the list of docusign document
 * @param {int} pageSize
 * @param {int} page
 * @param {int} sorted
 * @param {int} filtered
 */
const requestData = (applicant_id, application_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { applicant_id: applicant_id, application_id: application_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentApplicantDocusign/get_docusign_document_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    document_count: result.document_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    document_count: 0
                };
                resolve(res);
            }

        });

    });
};

/**
 * Class: ListDocusign
 */
class ListDocusign extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'document': true,
            'applicant': true,
            'status': true,
            'created_by': true,
            'created_date': true,
            'signed_date': true,
            'signed_by': true,
            'file_path': true,
            'created_at': true,
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
            applicant_id: this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id,
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
        this.getApplicantInfoByJobId();
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Fetch applications by job ID
     * @param {number} id
     */
    getApplicantInfoByJobId = () => {
        // this.setState({ loading: true })
        this.props.getApplicantInfoByJobId(this.props.props.match.params.id, false, this.props.props.match.params.application_id);
        this.setState({activity_page : true})
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchDocumentData = (state, instance) => {
        this.setState({ loading: true });
        var applicant_id = this.props.props.match.params.id;
        var application_id = this.props.props.match.params.application_id;
        requestData(
            applicant_id,
            application_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                documentList: res.rows,
                document_count: res.document_count,
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
                    <Link to={ROUTER_PATH + `admin/recruitment/docusign/create`} className={`slds-button slds-button_neutral`}
                    disabled={Number(this.props.applicant_details.flagged_status) == 2 ? true : false}
                    onClick={handleOnClickNewDocument}>
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
            { value: 'unsigned', label: 'Unsigned' },
            { value: 'signed', label: 'Signed' },
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
     * when archive is requested by the user for selected document
     */
    handleOnArchiveDocument = (id) => {
        const msg = `Are you sure you want to archive this document?`
        const confirmButton = `Archive Document`
        AjaxConfirm({ applicantId: this.state.applicant_id, archiveData: { [id]: true } }, msg, `recruitment/RecruitmentApplicant/archive_selected_file`, { confirm: confirmButton, heading_title: `Archive Document` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, 'fetchDocumentData');
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, documentId) => {
        this.setState({openCreateDocument: false});

        if(status){
            reFreashReactTable(this, 'fetchDocumentData');
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
        return (
            <React.Fragment>
                {
                    this.state.openCreateDocument && (
                        <CreateDocusignModel
                            showModal = {this.state.openCreateDocument}
                            closeModal = {this.closeModal}
                            headingTxt = "New Docusign"
                            applicant_id={this.state.applicant_id}
                            application_id={this.state.application_id}
                            {...this.props}
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
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        return [
            {
                _label: 'Type',
                accessor: "document",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Applicant',
                accessor: "applicant",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Sent',
                accessor: "created_at",
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
                _label: 'Sent By',
                accessor: "created_by",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Signed Date',
                accessor: "signed_date",
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
                _label: 'Document',
                accessor: "file_path",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (Number(props.original.signed_status) === 0) {
                        return <span className="vcenter slds-truncate"></span>
                    }
                    if (!props.original.file_path || props.original.file_path == '') {
                        return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.original.file_name)}</span>
                    }
                    return (
                        <span className="vcenter slds-truncate"><a style={styles.hyperlink} className="reset" title="View/download" target="_blank" href={defaultSpaceInTable(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod9 + '/?url=' + props.original.file_path)}>{defaultSpaceInTable(props.original.file_name)}</a></span>
                    );
                }
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
                    disabled={Number(this.props.applicant_details.flagged_status) == 2 ? true : false}
                    onSelect={(e) => {
                        // delete
                        this.handleOnArchiveDocument(props.original.id)
                    }}
                    className={'slds-more-action-dropdown'}
                    options={[
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
            <Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.applicant_id}/${this.state.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.props.applications.position_applied ? this.props.applications.position_applied : 'Application'}
            </Link>,
			<Link to={ROUTER_PATH + `admin/recruitment/application_details/${this.state.applicant_id}/${this.state.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.props.applicant_details ? this.props.applicant_details.fullname : 'Documents'}
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
                            title="Related Docusign"
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
const mapStateToProps = state => ({
    application_process_status: state.RecruitmentApplicantReducer.applications.application_process_status,
    process_status_label: state.RecruitmentApplicantReducer.applications.process_status_label,
    applicant_id: state.RecruitmentApplicantReducer.details.id,
    applicant_details: state.RecruitmentApplicantReducer.details,
    applications: state.RecruitmentApplicantReducer.applications,
    last_update: state.RecruitmentApplicantReducer.last_update,
    info_loading: state.RecruitmentApplicantReducer.info_loading,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfoByJobId: (applicant_id, loading, application_id) => dispach(getApplicantInfoByJobId(applicant_id, loading, application_id)),
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(ListDocusign);
