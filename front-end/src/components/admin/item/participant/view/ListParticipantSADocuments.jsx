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
import SLDSReactTable from '../../../oncallui-react-framework/salesforce/lightning/SLDSReactTable';
import '../../../../../components/admin/scss/components/admin/crm/pages/contact/ListContact.scss';
import { showArchiveGoalModal } from '../../ItemCommon';
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
        postData('item/Participant/get_service_agreement_documents', req).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    participant: result.participant
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
 * Class: ListParticipantSADocuments
 */
class ListParticipantSADocuments extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'doc_type': true,
            'related': true,
            'to_select': true,
            'signed_by_name': true,
            'contract_status': true,
            'plan_start_date': true,
            'signed_date': true,
            'created_by_fullname': true
        }
    }

    constructor(props) {
        super(props);
        var participant_id = '';
        if (props.match && props.match.params.id > 0) {
            participant_id = props.match.params.id;
        }
        let displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            participant_id: participant_id,
            goal_id: '',
            searchVal: '',
            filterVal: '',
            paticipantList: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false,
            participant_name: props.location.participant_name
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
            this.state.participant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                recordList: res.rows,
                pages: res.pages,
                loading: false,
                participant_name: res.participant.name
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
        showArchiveGoalModal(goal_id, this.setTableParams);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');
        this.fetchData(this.state);
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    
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
                    placeholder="Search Documents"
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
        let columns = [
            {
                _label: 'Doc Type',
                accessor: "doc_type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{this.docLink(props)}</span>,
            },
            {
                _label: 'Related',
                accessor: "related",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
            },
            {
                _label: 'To',
                accessor: "to_select",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(JSON.parse(props.value)["label"])}</span>
            },
            {
                _label: 'Signed By',
                accessor: "signed_by_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value || "")}</span>
            },
            {
                _label: 'Status',
                accessor: "contract_status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Plan Start Date',
                accessor: "plan_start_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(this.displayDate(props.value))}</span>
            },
            {
                _label: 'Signed Date',
                accessor: "signed_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(this.displayDate(props.value))}</span>
            },
            {
                _label: 'Sent By',
                accessor: "created_by_fullname",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Action',
                accessor: "",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => {
                    return <Dropdown
                                assistiveText={{ icon: 'More Options' }}
                                iconCategory="utility"
                                iconName="down"
                                align="right"
                                iconSize="x-small"
                                id={'actions' + props.original.id}
                                iconVariant="border-filled"
                                onSelect={(e) => {
                                    if(e.value == 1){ //edit
                                        this.resendDoc(props.original.id)
                                    }
                                }}
                                width="xx-small"
                                options={[
                                    { label: 'Resend Doc', value: '1' }
                                ]}
                                disabled={props.original.signed_status === "1"}
                            />
                }
            }
        ]
        return columns;
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
                                label: 'SA Documents',
                            }}
                            category="standard"
                            name="file"
                            style={{
                                backgroundColor: '#56aadf',
                                fill: '#ffffff',
                            }}
                            title="Documents"
                        />
                    }
                    onRenderActions={this.handleOnRenderActions}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title="SA Documents"
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
        const displayedColumns = this.determineColumns();
        //const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
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
                        />
                    </IconSettings>
                </div>
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListParticipantSADocuments);
