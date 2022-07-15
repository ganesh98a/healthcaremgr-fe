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
import { ROUTER_PATH,COMMON_DOC_DOWNLOAD_URL,FILE_DOWNLOAD_MODULE_NAME } from 'config.js';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { connect } from 'react-redux'
import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
    Tooltip,
    Popover
} from '@salesforce/design-system-react';
import CreateDocumentModel from './CreateDocumentModel.jsx';
import EditDocumentModel from './EditDocumentModel.jsx';
import Row from '../../../oncallui-react-framework/grid/Row';
import { getApplicantInfoByJobId,applicationMandatoryDocument } from '../../actions/RecruitmentApplicantAction';
import '../../../scss/components/admin/member/member.scss';

/**
 * RequestData get the list of document
 * @param {int} pageSize
 * @param {int} page
 * @param {int} sorted
 * @param {int} filtered
 */
const requestData = (applicant_id, application_id,jobId, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { applicant_id: applicant_id, application_id: application_id, job_id: jobId, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentApplicant/get_document_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    document_count: result.document_count,
                    is_document_marked: result.is_document_marked
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    document_count: 0,
                    is_document_marked: false
                };
                resolve(res);
            }

        });

    });
};

/**
 * Class: DocumentCard
 */
class DocumentCard extends Component {

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
            jobId: this.props.jobId,
            is_document_marked: false,
            mandatoryDocList: [],
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        this.fetchDocumentData(this.state);
        this.getMandatoryDocuments();
    }

    componentWillReceiveProps(props) {
        if (props && this.props && props.document_list_ref !== this.props.document_list_ref) {
            this.fetchDocumentData(this.state);
        }
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
            this.state.jobId,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                documentList: res.rows,
                document_count: res.document_count,
                pages: res.pages,
                loading: false,
                is_document_marked: res.is_document_marked
            });
        });
    }

    /**
     * Get mandatory documents
     * @param {int} id
     */
     getMandatoryDocuments = () => {
        var req = { applicant_id: this.props.applicant_id, application_id: this.props.application_id }
        this.props.getApplicationMandatoryDocument(req);
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
                        <span className="vcenter slds-truncate"><a style={styles.hyperlink} className="reset" title="View/download" target="_blank" href={defaultSpaceInTable(COMMON_DOC_DOWNLOAD_URL + FILE_DOWNLOAD_MODULE_NAME.mod3 + '/?url=' + props.original.file_path)}>{defaultSpaceInTable(props.value)}</a></span>
                    );
                }
            },
            {
                _label: 'Doc Type',
                accessor: "document",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Is Mandatory',
                accessor: "is_mandatory",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value=='No' || !props.value ? 'No' : props.value)}</span>,
            },
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
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
                _label: 'Reference Number',
                accessor: "reference_number",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>,
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
                    disabled={ Number(props.original.system_gen_flag) === 1 && this.state.validStatus === Number(props.original.document_status)? true : false || Number(this.props.flagged_status) === 2 ? true : false}
                    onSelect={(e) => {
                        if(e.value == 1){ //edit
                            this.showEditDocumentModal(props.original.id)
                        }
                        else { // delete
                            this.handleOnArchiveDocument(props.original.id)
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
                    getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card tablescroll' })}
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
                <Link to={ROUTER_PATH + `admin/recruitment/application_details/documents/${this.state.applicant_id}/${this.state.application_id}`} className="reset" style={{ color: '#0070d2' }}>
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
            this.getMandatoryDocuments();
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
                this.getMandatoryDocuments();
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
            if (this.state.document_count === 0) {
                this.fetchDocumentData(this.state);
            } else {
                reFreashReactTable(this, 'fetchDocumentData');
            }
            this.getMandatoryDocuments();
        }
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
                        <CreateDocumentModel
                            showModal = {this.state.openCreateDocument}
                            closeModal = {this.closeModal}
                            headingTxt = "New Document"
                            applicant_id={this.state.applicant_id}
                            application_id={this.state.application_id}
                            {...this.props}
                        />
                    )
                }
                {
                    this.state.openEditDocument && (
                        <EditDocumentModel
                            document_id={this.state.document_id}
                            showModal = {this.state.openEditDocument}
                            closeModal = {this.closeEditDocumentModal}
                            location_id = {this.state.document_id}
                            headingTxt = "Update Document"
                            {...this.props}
                            applicant_id={this.state.applicant_id}
                            application_id={this.state.application_id}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Show modal
     */
     showModal = (value) => {
        switch(value) {
            case 1:
                this.setState({ openCreateDocument: true })
                break;
            case 2:
                this.handleOnMarkReference(1);
                break;
            case 3:
                this.handleOnUndoVerified(0);
                break;
            default:
                break;
        }
    }

    /**
     * when archive is requested by the user for selected document
     */
     handleOnMarkReference = (status) => {
        var msg = `Are you sure to mark the documents as verified? Verification can be undone until the application is marked as 'Hired' (or) 'Unsuccessful'`
        if (status === 0) {
            msg = `Are you sure you want to undo the documents verified ?`
        }
        if (this.state.document_count < 1) {
            toastMessageShow('The document card can be marked as verified only when it have min of 1 document', "e");
            return;
        }
        const confirmButton = `Mark as verified`;
        AjaxConfirm({ applicant_id: this.props.applicant_id, application_id: this.props.application_id, mark_as: status }, msg, `recruitment/RecruitmentApplicant/mark_document_status`, { confirm: confirmButton, heading_title: `Verify Mandatory Document Checklist` }).then(result => {
            if (result.status) {
                this.props.getApplicantInfoByJobId(this.props.applicant_id, false, this.props.application_id);
                toastMessageShow(result.msg, "s");
                this.fetchDocumentData(this.state);
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Undo Verified
     * @param {int} id
     */
     handleOnUndoVerified = (status) => {
        var req = { applicant_id: this.props.applicant_id, application_id: this.props.application_id, mark_as: status }
        postData('recruitment/RecruitmentApplicant/mark_document_status', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                this.props.getApplicantInfoByJobId(this.props.applicant_id, false, this.props.application_id);
                toastMessageShow(result.msg, 's');
                this.fetchDocumentData(this.state);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * card header
     * @returns
     */
    cardHeader = () => {
        var msg = "Documents ("+this.state.document_count+")"
        if (Number(this.state.document_count) > 6) {
            msg =  "Documents (6+)";
        }
        var doc_list = [];
        if (this.props.documentMandatoryList) {
            this.props.documentMandatoryList.map((doc) => {
                doc_list.push(
                    <div className="row p-1">
                        <span className="">
                            {doc.title}
                        </span>
                        {
                            doc.is_uploaded && <span className="float-right">
                                <Icon
                                    category="action"
                                    name="check"
                                    size="xx-small"
                                    colorVariant="base"
                                    containerStyle={{
                                        backgroundColor: '#9fdb66',
                                        padding: '0.2rem'
                                    }}
                                />
                            </span>
                        }
                    </div>
                );
            });
        }
        return(
            <div className="">
                <span>
                {msg}&nbsp;
                </span>
                <span>
                    <Popover
						body={doc_list}
						heading="Mandatory Documents"
						id="popover-heading"
                        align="top left"
                        className="document_mandatory_popover"
					>
						<Button
							assistiveText={{ icon: 'Icon Border medium' }}
							iconCategory="utility"
							iconName="info"
							iconVariant="border"
							variant="icon"
                            className="bor-non"
						/>
					</Popover>
                </span>
            </div>
        );
    }

    /**
     * Render the display content
     */
    render() {
        var dropdown_option = [
            { label: 'New', value: 1, id: "ndoc" },
            { label: 'Mark documents as verified', value: 2 },
        ];
        if (this.state.is_document_marked === true) {
            dropdown_option = [
                { label: 'New', value: 1 },
                { label: 'Undo Verification', value: 3 },
            ];
        }
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={
                            <div>
                                {
                                    this.state.is_document_marked && <div className="col-sm-6">
                                        <Tooltip
                                            id="tooltip"
                                            align="top"
                                            content="Reference Verified"
                                        >
                                            <Icon
                                                category="action"
                                                name="check"
                                                size="xx-small"
                                                colorVariant="base"
                                                containerStyle={{
                                                    backgroundColor: '#9fdb66',
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                }
                                <div className="col-sm-6">
                                    <Dropdown
                                        id='document_dropdown'
                                        assistiveText={{ icon: 'More Options' }}
                                        iconCategory="utility"
                                        iconName="down"
                                        align="right"
                                        iconSize="x-medium"
                                        iconVariant="border-filled"
                                        disabled={(Number(this.props.application_process_status) === 7 || Number(this.props.application_process_status) === 8) ? true : false || Number(this.props.flagged_status) === 2 ? true : false}
                                        onSelect={(e) => {
                                        //call the cab certificate / tranfer application
                                            this.showModal(e.value);
                                        }}
                                        width="xx-small"
                                        options={dropdown_option}
                                    />
                                </div>
                            </div>
                        }
                        heading={this.cardHeader()}
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
const mapStateToProps = state => ({
    application_process_status: state.RecruitmentApplicantReducer.applications.application_process_status,
    documentMandatoryList: state.RecruitmentReducer.documentMandatoryList,
})

const mapDispatchtoProps = (dispach) => {
    return {
        getApplicantInfoByJobId: (applicant_id, loading, application_id) => dispach(getApplicantInfoByJobId(applicant_id, loading, application_id)),
        getApplicationMandatoryDocument: (request) => dispach(applicationMandatoryDocument(request)),
    }
};
export default connect(mapStateToProps, mapDispatchtoProps)(DocumentCard);
