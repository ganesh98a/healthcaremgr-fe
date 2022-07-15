import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../oncallui-react-framework/salesforce/lightning/SLDSReactTable';
import '../../../../components/admin/scss/components/admin/crm/pages/contact/ListContact.scss';
//import { showArchiveGoalModal } from '../ItemCommon';
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
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import CreateNeedAssessmentBox from '../../crm/pages/needassessment/CreateNeedAssessmentBox';
/**
 * RequestData get the list of documents
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (participant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {

        var req = {
            filtered,
            sorted,
            participant_id,
            page,
            pageSize
        }
        postData('sales/NeedAssessment/get_need_assessment_list', req).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    participant_name: result.participant_name
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
 * Class: ParticipantNeedAssessmentList
 */
class ParticipantNeedAssessmentList extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'need_assessment_number': true,
            'title': true,
            'status': true,
            'owner_name': true,
            'created': true,
            'created_by': true
        }
    }

    constructor(props) {
        super(props);
        let displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            participant_id: props.match.params.participant_id,
            searchVal: '',
            filterVal: '',
            paticipantList: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false,
            participant_name: "",
            refreshTable: false
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
            this.props.match.params.participant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                recordList: res.rows,
                pages: res.pages,
                loading: false,
                participant_name: res.participant_name
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
     * 
     */
    showArchiveModal(goal_id) {
        //showArchiveGoalModal(goal_id, this.setTableParams);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    showModal() {
        this.setState({ openCreateModal: true });
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={e => this.showModal()} />
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
                    id="Documents-search-1"
                    placeholder="Search Need Assessments"
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
                    {this.renderSearchForm()}
                </PageHeaderControl>
                <PageHeaderControl>
                    {this.renderColumnSelector({ columns })}
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    displayDate(value) {
        return value !== "0000-00-00 00:00:00" && value != "" && moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') || "";
    }

    docLink(props) {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            }
        });
        if (!props.original.url) {
            return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
        }
        return (
            <span className="vcenter slds-truncate"><a style={styles.hyperlink} className="reset" title="View/download" target="_blank" href={defaultSpaceInTable(props.original.url)}>{defaultSpaceInTable(props.value)}</a></span>
        );
    }

    /**
     * setting the column headers in the listing table
     */
     determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "need_assessment_number",
                id: 'need_assessment_number',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
               
            },
            {
                _label: 'Title',
                accessor: "title",
                id: 'title',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                   return <Link style={{color: "rgb(0, 112, 210)"}} className="vcenter default-underlined slds-truncate" to={`${ROUTER_PATH}admin/crm/needassessment/${props.original.need_assessment_id}`}>
                        <span>{defaultSpaceInTable(props.value)}</span>
                    </Link>
                }      
            },           
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
            },
            {
                _label: 'Owner',
                accessor: "owner_name",
                id: 'owner_name',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
                
            },
            {
                _label: 'Created Date',
                accessor: "created",
                id: 'created',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
                } 
            },{

                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
                
            }
        ]
    }

    resendDoc(id) {
        let req = {id};
        postData('item/Participant/resend_doc', req).then((result) => {
            this.setState({ loading: false });
            if (result.status) {
                toastMessageShow("Document sent successfully", "s");
            } else {
                toastMessageShow(result.msg, "e");
            }
        });
    }

    /**
     * render header part
     */
    renderHeader() {
        const trail = [
            <Link to={ROUTER_PATH + `admin/item/participant`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Participant</Link>,
            <Link to={ROUTER_PATH + `admin/item/participant/details/` + this.state.participant_id} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.participant_name}</Link>,
        ];
        const columns = this.determineColumns();
        return (
            <React.Fragment>
                <PageHeader
                    trail={trail}
                    icon={
                        <Icon
                            assistiveText={{
                                label: 'Need Assesments',
                            }}
                            category="standard"
                            name="file"
                            style={{
                                backgroundColor: '#56aadf',
                                fill: '#ffffff',
                            }}
                            title="Need Assesments"
                        />
                    }
                    onRenderActions={this.handleOnRenderActions}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title="Need Assesments"
                    label={<span />}
                    truncate
                    variant="object-home"
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
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        {this.renderHeader()}
                        <SLDSReactTable
                            PaginationComponent={React.Fragment}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            filtered={this.state.filtered}
                            columns={displayedColumns}
                            data={this.state.recordList}
                            onFetchData={(state, instance) => this.fetchData(state, instance)}
                            minRows={1}
                            noDataText="No records found"
                            collapseOnDataChange={true}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            style={{
                                fontSize: 13
                            }}
                            resizable={true}
                            refreshTable= {!this.state.refreshTable}
                        />
                        {
                            this.state.openCreateModal ? <CreateNeedAssessmentBox openOppBox={this.state.openCreateModal} closeModal={this.closeModal} oppId={this.state.need_assesment_id} pageTitle={"New Need Assessment"} data={this.state} /> : ''
                        }
                    </IconSettings>
                </div>
            </React.Fragment>
        )


    }

    closeModal = (id) => {
        this.setState({ openCreateModal: false }, () => {
            if (id) {
                window.location.href = `${ROUTER_PATH}admin/crm/needassessment/${id}`;
            }
        });
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

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantNeedAssessmentList);
