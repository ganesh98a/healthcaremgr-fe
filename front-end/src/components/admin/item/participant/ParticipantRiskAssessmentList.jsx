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
import CreateRiskAssessmentModel from '../../crm/pages/RiskAssessment/CreateRiskAssessmentModel';

/**
 * RequestData get unique reference id 
 */
 const requestReferenceID = () => {

    return new Promise((resolve, reject) => {
        // request json
        postData('sales/RiskAssessment/get_create_reference_id').then((result) => {
            if (result.status) {
                let raData = result.data;
                const res = {
                    data: raData,
                };
                resolve(res);
            } else {
                const res = {
                    data: [],
                };
                resolve(res);
            }           
        });

    });
};

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
        postData('sales/RiskAssessment/get_risk_assessment_list', req).then((result) => {
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
 * Class: ParticipantRiskAssessmentList
 */
class ParticipantRiskAssessmentList extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'reference_id': true,
            'topic': true,
            'account': true,
            'owner': true,
            'status': true,
            'created_date': true,
            'created_by': true,
            'action': true,
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
        this.fetchRefereceID();
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button disabled={this.state.loading_refid} label="New" onClick={e => this.showModal()} />
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
                    placeholder="Search Risk Assessments"
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
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
     determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "reference_id",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
               
                _label: 'Title',
                accessor: "topic",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                   return <Link style={{color: "rgb(0, 112, 210)"}} className="vcenter default-underlined slds-truncate" to={`${ROUTER_PATH}admin/crm/riskassessment/details/${props.original.risk_assessment_id}`}>
                        <span>{defaultSpaceInTable(props.value)}</span>
                    </Link>
                }
            },            
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Owner',
                accessor: "owner",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Created date',
                accessor: "created_date",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
                }
            },
            {
                _label: 'Created by',
                accessor: "created_by",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
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
                                label: 'Risk Assesments',
                            }}
                            category="standard"
                            name="file"
                            style={{
                                backgroundColor: '#56aadf',
                                fill: '#ffffff',
                            }}
                            title="Risk Assesments"
                        />
                    }
                    onRenderActions={this.handleOnRenderActions}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title="Risk Assesments"
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
                        {this.state.openCreateModal ?   <CreateRiskAssessmentModel 
                                                            showModal = {this.state.openCreateModal}
                                                            referenceId = {this.state.reference_id}
                                                            closeModal = {this.closeModal}
                                                            headingTxt = "Create Risk Assessment"
                                                            participant_id={this.state.participant_id}
                                                        /> : ''}
                    </IconSettings>
                </div>
            </React.Fragment>
        )


    }

    closeModal = (status, id) => {
        this.setState({ openCreateModal: false });
        if (id) {
            window.location.href = `${ROUTER_PATH}admin/crm/riskassessment/details/${id}`;
        }
    }

    /**
     * Call the getReferenceID
     */
     fetchRefereceID = () => {
        this.setState({loading_refid: true});
        requestReferenceID().then(res => {
            this.setState({loading_refid: false});
            var ra_data = res.data
            if(ra_data && ra_data.reference_id) {
                this.setState({
                    reference_id: ra_data.reference_id,
                    openCreateModal: true
                });
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

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantRiskAssessmentList);
