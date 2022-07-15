import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { reFreashReactTable, css } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import jQuery from 'jquery';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import {
    IconSettings,
    PageHeader,
    PageHeaderControl,
    Icon,
    Button,
    Dropdown,
    DropdownTrigger,
    Input,
    InputIcon,
    Tooltip
} from '@salesforce/design-system-react';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../scss/components/admin/item/item.scss';
import '../../../scss/components/admin/member/member.scss';
import _ from 'lodash';
import ReferenceModal from './ReferenceModal.jsx';
import { postData, toastMessageShow, AjaxConfirm } from 'service/common.js';


/**
 * RequestData get the list of reference
 * @param {int} pageSize
 * @param {int} page
 * @param {int} sorted
 * @param {int} filtered
 */
const requestData = (applicant_id, application_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { applicant_id: applicant_id, application_id: application_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentReferenceData/get_referece_list_by_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.rows;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    record_count: result.record_count,
                    is_reference_marked: result.is_reference_marked,
                    app_pros_hired_status: result.app_pros_hired_status
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    record_count: 0,
                    is_reference_marked: false,
                    app_pros_hired_status: false
                };
                resolve(res);
            }

        });

    });
};

/**
 * Class: ReferenceList
 */
class ReferenceList extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'name': true,
            'email': true,
            'status': true,
            'phone': true,
            'updated':true,
            'written_reference_check': true,
            'status_value': true,
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
            recordList: [],
            loading: false,
            redirectPage: false,
            record_count: 0,
            recordSize: 4,
            page: 0,
            pageSize: 4,
            sorted: '',
            filtered: '',
            openReferenceModal: false,
            modalHeading: 'Create',
            applicant_id: this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            is_reference_marked: false,
            app_pros_hired_status: false,
            flagged_status: ''
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchData = (state) => {
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
                recordList: res.rows,
                record_count: res.record_count,
                pages: res.pages,
                loading: false,
                is_reference_marked: res.is_reference_marked,
                app_pros_hired_status: res.app_pros_hired_status
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
     * Open create modal
     */
    showModal = () => {
        this.setState({ openReferenceModal: true });
    }

    /**
     * Close the modal when user save the form and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({ openReferenceModal: false });

        if(status){
            reFreashReactTable(this, 'fetchData');
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }
    componentWillMount() {
        this.getApplicantInfo();
    }

    getApplicantInfo = () => {
        postData('recruitment/RecruitmentApplicant/get_applicant_info', { applicant_id: this.state.applicant_id, application_id: this.state.application_id }).then(res => {
            if (res.status) {
				this.setState({
					flagged_status : res.data.details.flagged_status
				})
			}
        });
    }

    /**
     * Show modal
     */
     showModal = (value) => {
        switch(value) {
            case 1:
                if (this.state.record_count > 3) {
                    toastMessageShow('Only 4 references can be added at max', "e");
                } else {
                    this.setState({ openReferenceModal: true, modalHeading: 'Create' })
                }
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
        var msg = `Are you sure you want to references as verified ? Verification can be undone until the application is marked as 'Hired' (or) 'Unsuccessful'`

        if (status === 0) {
            msg = `Are you sure you want to undo the references verified ?`
        }
        if (this.state.record_count < 1) {
            toastMessageShow('The reference card can be marked as verified only when it have min of 1 reference', "e");
            return;
        }
        const confirmButton = `Mark as verified`;
        AjaxConfirm({ applicant_id: this.state.applicant_id, application_id: this.state.application_id, mark_as: status }, msg, `recruitment/RecruitmentReferenceData/mark_reference_status`, { confirm: confirmButton, heading_title: `Verify Reference Checklist` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.fetchData(this.state);
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
        var req = { applicant_id: this.state.applicant_id, application_id: this.state.application_id, mark_as: status }
        postData('recruitment/RecruitmentReferenceData/mark_reference_status', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                toastMessageShow(result.msg, 's');
                this.fetchData(this.state);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {

        var dropdown_option = [
            { label: 'New', value: 1 },
            { label: 'Mark reference as verified', value: 2 },
        ];
        if (this.state.is_reference_marked === true) {
            dropdown_option = [
                { label: 'New', value: 1 },
                { label: 'Undo Verification', value: 3 },
            ];
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                        {
                            this.state.is_reference_marked && <div className="col-sm-6">
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
                                id="header_drop_down"
                                assistiveText={{ icon: 'More Options' }}
                                iconCategory="utility"
                                iconName="down"
                                align="right"
                                iconSize="x-medium"
                                iconVariant="border-filled"
                                disabled={(Number(this.props.application_process_status) === 7 || Number(this.props.application_process_status) === 8) ? true : false || Number(this.state.flagged_status) === 2 ? true : false}
                                onSelect={(e) => {
                                //call the cab certificate / tranfer application
                                    this.showModal(e.value);
                                }}
                                width="xx-small"
                                options={dropdown_option}
                            />
                        </div>
                    </IconSettings>
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
                    id="form-search-1"
                    placeholder="Search"
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
            </React.Fragment>
        )
    }

    /**
     * Render modals
     * - Create Reference
     * - Edit Reference
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openReferenceModal && (
                        <ReferenceModal
                            showModal = {this.state.openReferenceModal}
                            closeModal = {this.closeModal}
                            applicant_id = {this.props.props.match.params.id}
                            application_id = {this.props.props.match.application_id}
                            headingTxt = {this.state.modalHeading}
                            reference_id={this.state.reference_id}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Reference more option
     * @param {obj} e
     * @param {int} id
     */
    referenceOption = (e, id) => {
        console.log('id', id);
        var value = Number(e.value);
        switch(value) {
            case 1:
                this.setState({ reference_id: id, openReferenceModal: true, modalHeading: 'Update' });
                break;
            case 2:
                // archive
                this.handleOnArchive(id);
                break;
            case 3:
                // update status
                this.handleOnUpdateStatus(id, 'Approved');
                break;
            case 4:
                // update status
                this.handleOnUpdateStatus(id, 'Rejected');
                break;
            default:
                break;
        }
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Full Name',
                accessor: "name",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Phone',
                accessor: "phone",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value ?  ("+61 " +props.value) : 'N/A')}</span>,
            },
            {
                _label: 'Email',
                accessor: "email",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Written Reference',
                accessor: "written_reference_check",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
           
            {
                _label: 'Updated On',
                accessor: "updated",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
           
            {
                _label: 'Status',
                accessor: "status_value",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Action',
                accessor: "action",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: (props) =>
                <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    iconVariant="border-filled"
                    onSelect={() => {
                        // todo
                    }}
                    onSelect={(e) => this.referenceOption(e, props.original.id)}
                    width="xx-small"
                    className={'slds-more-action-dropdown'}
                    disabled={this.state.app_pros_hired_status || Number(this.state.flagged_status) === 2 ? true : false}
                    options={[
                        { label: 'Approve', value: '3' },
                        { label: 'Reject', value: '4' },
                        { label: 'Edit', value: '1' },
                        { label: 'Delete', value: '2' },
                    ]}
                />,
            },
        ]
    }

    /**
     * Update status
     * @param {int} id
     */
    handleOnUpdateStatus= (id, status) => {
        var req = {
            reference_id: id,
            status: status === 'Approved' ? 1 : 2
        }
        postData('recruitment/RecruitmentReferenceData/update_reference_status', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                toastMessageShow(result.msg, 's');
                this.fetchData(this.state);
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }
    /**
     * when archive is requested by the user for selected document
     */
    handleOnArchive = (id) => {
        const msg = `Are you sure you want to archive this reference?`
        const confirmButton = `Archive Reference`
        AjaxConfirm({ reference_id: id }, msg, `recruitment/RecruitmentReferenceData/archive_reference`, { confirm: confirmButton, heading_title: `Archive Reference` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.fetchData(this.state);
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user create form assessment
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

        var applicant_id = _.get(this.props, 'props.match.params.id');
        var application_id = _.get(this.props, 'props.match.params.application_id');
        const trail = [
            <Link to={ROUTER_PATH + `admin/recruitment/applicant/${applicant_id}`} className="reset" style={{ color: '#0070d2' }}>
            {'Applicant Details'}
            </Link>,
            <Link to={ROUTER_PATH + `admin/recruitment/application_details/${applicant_id}/${application_id}`} className="reset" style={{ color: '#0070d2' }}>
                {application_id}
            </Link>
        ];

        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            icon={
                                <Icon
                                    assistiveText={{
                                        label: 'Forms',
                                    }}
                                    category="action"
                                    name="new_contact"

                                    title="Forms"
                                />
                            }
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title={"References"}
                            trail={trail}
                            label={<span />}
                            truncate
                            variant="object-home"
                        />
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
                                data={this.state.recordList}
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
    application_process_status: state.RecruitmentApplicantReducer.applications.application_process_status,
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = () => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(ReferenceList);
