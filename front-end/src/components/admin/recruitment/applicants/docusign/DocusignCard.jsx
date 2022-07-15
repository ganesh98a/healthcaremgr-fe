import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, reFreashReactTable, toastMessageShow, AjaxConfirm, css } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH, COMMON_DOC_DOWNLOAD_URL, FILE_DOWNLOAD_MODULE_NAME } from 'config.js';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
} from '@salesforce/design-system-react';
import CreateDocusignModel from './CreateDocusignModel.jsx';

import '../../../scss/components/admin/member/member.scss';

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
 * Class: DocusignCard
 */
class DocusignCard extends Component {

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            document_count: 0,
            openCreateDocument: false,
            openEditDocument: false,
            searchVal: '',
            filterVal: '',
            documentList: [],
            pageSize: 6,
            page: 0,
            document_id: '',
            validStatus: 1,
            applicant_id: this.props.applicant_id,
            application_id: this.props.application_id,
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        this.fetchDocumentData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchDocumentData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.state.applicant_id,
            this.state.application_id,
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
                Header: ({ data, column }) => <div className="vcenter slds-truncate">{column._label}</div>,
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
                accessor: "",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 50,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props =>
                <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    iconVariant="border-filled"
                    disabled={Number(this.props.flagged_status) === 2 || false}
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
     * Render document table if count greater than 0
     */
    renderTable() {
        if (this.state.document_count === 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.documentList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                onFetchData={this.fetchDocumentData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card' })}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.document_count === 0) {
            return <React.Fragment />
        }

        return (
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/recruitment/application_details/docusign/${this.state.applicant_id}/${this.state.application_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
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
     * Render modals
     * - Create Docusign
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
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={<Button label="New" disabled={Number(this.props.flagged_status) === 2 || false} onClick={() => this.setState({ openCreateDocument: true }) }/>}
                        heading={Number(this.state.document_count) > 6 ? "Docusign (6+)" : "Docusign ("+this.state.document_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="file" size="small" />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                    {this.renderModals()}
                </IconSettings>
            </React.Fragment>
        );
    }
}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default DocusignCard;
