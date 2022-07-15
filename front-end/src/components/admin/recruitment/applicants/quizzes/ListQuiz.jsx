import React, { Component } from 'react';
import moment from 'moment';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { reFreashReactTable, css, postData } from 'service/common.js';
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
    InputIcon
} from '@salesforce/design-system-react';
import CreateQuizModel from './CreateQuizModal.jsx';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../scss/components/admin/item/item.scss';
import '../../../scss/components/admin/member/member.scss';
import { getQuizListData } from '../../actions/RecruitmentAction.js';
import _ from 'lodash';
import ArchiveModal  from '../../../oncallui-react-framework/view/Modal/ArchiveModal';
import { getApplicantInfo} from '../../../recruitment/actions/RecruitmentApplicantAction';
/**
 * Class: ListQuiz
 */
class ListQuiz extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'task_name': true,
            'start_datetime': true,
            'end_datetime': true,
            'status': true,
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
            quizList: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateQuiz: false,
            applicant_id:this.props.props.match.params.id,
            application_id: this.props.props.match.params.application_id,
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
        getQuizListData(
            this.state.application_id,
            this.state.applicant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                quizList: res.rows,
                quiz_count: res.count,
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
        this.setState({ filtered: search_re, showQuizArchiveModal:false });
    }

    /**
     * Open create quiz modal
     */
    showModal = () => {
        this.setState({ openCreateQuiz: true });
    }

    /**
     * Close the modal when user save the quiz and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status) => {
        this.setState({openCreateQuiz: false});

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

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
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
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewForm = e => {
            e.preventDefault()
            this.showModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/recruitment/applicant_details/quizzes/create`} disabled={Number(this.state.flagged_status) === 2 ? true : false} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewForm} id="form-type-new-btn">
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Render search input quiz
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
                    placeholder="Search Form"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let quizStatusFilter = [
            { value: 'all', label: 'All' },
            { value: '0', label: 'Draft' },
            { value: '1', label: 'Scheduled' },
            { value: '2', label: 'Open' },
            { value: '3', label: 'In progress' },
            { value: '4', label: 'Submitted' },
            { value: '5', label: 'Expired' },
            { value: '6', label: 'Completed' },
            { value: '7', label: 'Unsuccessful' },
        ];
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={quizStatusFilter}
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
     * Open archive quiz modal
     */
    showQuizArchiveModal(quiz_id) {
        this.setState({showQuizArchiveModal :  true, archive_quiz_id : quiz_id});
    }
    /**
     * Close archive quiz modal
     */
    closeQuizArchiveModal= () =>{
        this.setState({showQuizArchiveModal:false , archive_quiz_id : ''})
        this.setTableParams();
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
     * Render modals
     * - Create Form
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateQuiz && (
                        <CreateQuizModel
                            application_id={this.state.application_id}
                            applicant_id={this.state.applicant_id}
                            showModal = {this.state.openCreateQuiz}
                            closeModal = {this.closeModal}
                            headingTxt = "New Form"
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
        return [
            {
                _label: 'Title',
                accessor: "task_name",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                        return <Link to={ROUTER_PATH + `admin/recruitment/application_quiz/detail/${props.original.id}`} className="reset" style={{ color: '#0070d2' }}>
                            {defaultSpaceInTable(props.value)}
                        </Link>
                }
            },
            {
                _label: 'Start Date',
                accessor: "start_datetime",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>,
            },
            {
                _label: 'End Date',
                accessor: "end_datetime",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>,
            },
            {
                _label: 'Status',
                accessor: "status",
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
                    disabled={Number(this.state.flagged_status) === 2 ? true : false}
                    onSelect={() => {
                        this.showQuizArchiveModal(props.original.id)
                    }}
                    width="xx-small"
                    className={'slds-more-action-dropdown'}
                    options={[
                        { label: 'Delete', value: '1' },
                    ]}
                />,
            },
        ]
    }
    /**
     * Render the display content
     */
    render() {
        // This will only run when user archive quiz
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
                                        label: 'Quizzes',
                                    }}
                                    category="utility"
                                    name="puzzle"
                                    style={{
                                        fill: '#769ed9',
                                    }}
                                    title="Quizzes"
                                />
                            }
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title={'Quizzes'}
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
                                data={this.state.quizList}
                                defaultPageSize={9999}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No Record Found"
                                collapseOnDataChange={true}
                                resizable={true}
                                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-card slds-tbl-scroll tablescroll' }) }
                            />
                            {this.state.showQuizArchiveModal && <ArchiveModal
                                id = {this.state.archive_quiz_id}
                                msg={'Quiz'}
                                content ={'Are you sure you want to archive this quiz'}
                                confirm_button={'Archive Quiz'}
                                api_url = {'recruitment/RecruitmentQuiz/archive_quiz'}
                                close_archive_modal = {this.closeQuizArchiveModal}
                                on_success={()=> this.setTableParams()}

                /> }
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListQuiz);
