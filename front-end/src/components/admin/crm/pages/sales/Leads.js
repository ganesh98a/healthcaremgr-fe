import React, { Component } from 'react';
import jQuery from 'jquery'
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, checkLoginWithReturnTrueFalse, getPermission } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import CrmPage from 'components/admin/crm/CrmPage';
import EditLeadModal from './EditLeadModal';
import CreateLeadModal from './CreateLeadModal';
import ConvertLeadModal from './ConvertLeadModal';
import { AjaxConfirm, toastMessageShow, css  } from '../../../../../service/common';
import moment from 'moment';
import IconsMe from '../../../IconsMe';
import { 
    IconSettings,    
    PageHeaderControl, 
    Input, 
    InputIcon, 
    DropdownTrigger, 
    Button, 
    Dropdown,    
} from '@salesforce/design-system-react'

import '../../../scss/components/admin/crm/pages/sales/Leads.scss';
import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView';

const queryString = require('query-string');

const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Lead/get_leads_list', Request).then((result) => {
            let filteredData = result.data;
            const res = {
                rows: filteredData,
                pages: (result.count)
            };
            resolve(res);
        });

    });
};

/**
 * 
 * @param {object} props
 * @param {number} props.lead_id
 * @param {boolean} props.is_converted
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onEdit
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onArchive
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onPreview
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onConvertLead
 */
export const LeadActions = (props) => {
    return (
        <div className={`LeadActions d-flex`}>
            <Link to={'#'} title={`Preview lead details`} className={`inline-block`} onClick={e => { e.preventDefault(); props.onPreview(e, props.lead_id)}}>
                <IconsMe icon={`view1-ie`} className="f-21" />
            </Link>
            <Link to={ROUTER_PATH + `admin/crm/leads/${props.lead_id}/edit`} title={`Modify lead details`} className={`inline-block`} onClick={e => { e.preventDefault(); props.onEdit(e, props.lead_id)}}>
                <IconsMe icon="edit3-ie" className="f-21" />
            </Link>
            &nbsp;
            {props.is_converted == 0 ? <a title={`Convert lead`} className={`inline-block`} onClick={e => { e.preventDefault(); props.onConvertLead(e, props.lead_id) }}>
                <i className="icon HCM-ie ie-loading f-21"></i>
            </a> : ''}
            &nbsp;
            <Link to={'#'} title={`Archive lead`} className={`inline-block`} onClick={e => { e.preventDefault(); props.onArchive(e,  props.lead_id)}}>
                <IconsMe icon="trash-o" className="f-21"/>
            </Link>
        </div>
    )
}

/**
 * Page component the displays list of leads.
 */
class Leads extends Component {

    static defaultProps = {
        displayed_columns: {
            'lead_number': true,
            'lead_topic': true,
            'person_name': true,
            'lead_status': true,
            'lead_owner': true,
            'created_format': true,
            'created_by_name': true,
            "viewed_date": true,
            "viewed_by": true,
        },
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])

        this.state = {
            editLeadModal: null,
            addLeadModal: null,
            deleteLeadModal: null,
            searchVal: '',
            filterVal: '',
            end_date: null,
            start_date: null,
            leadList: [],
            filter_option: [],
            filter_lead_status: '',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            refreshTable: true,
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();

        this.rootRef = React.createRef()

    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                leadList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }
	 
	capitalize = ( s ) =>
    {
		return s[0].toUpperCase() + s.slice(1).toLowerCase();
	}

    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    setTableParams = () => {
        var search_re = { search: this.state.search, filter_lead_status: this.state.filter_lead_status, start_date: this.state.start_date, end_date: this.state.end_date, ...this.defualtFilter };
        this.setState({ filtered: search_re });
    }

    onConvertLead = (e, leadId) => {
        this.setState({ openConvertModal: true, convertLeadId: leadId })
    }

    renderLeadActions(original) {
        return (
            <LeadActions {...original}
                onEdit={(e, id) => this.setState({ editLeadModal: id })}
                onConvertLead={(e, id) => this.onConvertLead(e, id)}
                onArchive={this.handleOnArchiveLead}
                onPreview={(e, id) => this.setState({ previewLeadModal: id })}
            />
        )
    }


    renderCrmPagePageTypeParms() {
        return (
            <CrmPage pageTypeParms={'sales_leads'} />
        )
    }

    handleOnArchiveLead = (e, id) => {
        this.setState({ deleteLeadModal: id })

        const msg = `Are you sure you want to archive this lead?`
        const confirmButton = `Archive lead`

        AjaxConfirm({ id }, msg, `sales/Lead/archive_lead`, { confirm: confirmButton, heading_title: `Archive lead` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                this.refreshListView();
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })

    }



    /**
     * Called when 'Cancel' button in edit lead modal is clicked
     */
    handleOnCloseEditModal = () => {
        this.setState({ editLeadModal: null })
    }

    /**
     * Called when 'Cancel' button in add lead modal is clicked
     */
    handleOnCloseAddModal = () => {
        this.setState({ addLeadModal: null })
    }

    /**
     * Called when lead was succcessfully created. Note: onSuccess and onClose are different
     */
    handleOnAddLeadSuccess = () => {
        this.setState({ addLeadModal: null })
        this.refreshListView();
    }

    /**
     * Called when lead was succcessfully updated. Note: onSuccess and onClose are different
     */
    handleOnUpdateLeadSuccess = () => {
        this.setState({ editLeadModal: null })
        this.refreshListView();
    }

    handleCloseModalCOnvert = (status) => {
        this.setState({ openConvertModal: false })
        if (status) {
            this.refreshListView();
        }
    }

    handleOnClosePreviewModal = () => {
        this.setState({ previewLeadModal: null })
    }

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
                    id="Leads-search-1"
                    placeholder="Search leads"
                />
            </form>
        )
    }

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
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {

        const styles = css({
            datepicker: {
                maxWidth: 150,
            }
        })

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

    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link 
                        to={ROUTER_PATH + `admin/crm/leads/create`} 
                        className={`slds-button slds-button_neutral`} 
                        onClick={e => { 
                            e.preventDefault(); 
                            this.setState({ addLeadModal: true }) 
                        }}
                    >
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment> 
        )
    }


    /**
     * @return {(import('react-table').Column<any> | { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                id: "lead_id",
                accessor: "lead_id"
            },
            {
                _label: 'ID',
                id: "lead_number",
                accessor: "lead_number",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Service Type',
                id: "lead_topic",
                accessor: "lead_topic",
                CustomUrl: [{url : ROUTER_PATH + 'admin/crm/leads/PARAM1'}, {param: ['lead_id']}, {property: 'target=_blank'}],
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return (
                        <Link to={ROUTER_PATH + `admin/crm/leads/${props.original.lead_id}`}
                            className="default-underlined vcenter slds-truncate"
                            style={{ color: '#0070d2' }}
                        >
                            {defaultSpaceInTable(props.value)}
                        </Link>
                    )
                }
                
            },
            {
                _label: 'Full name',
                id: "person_name",
                accessor: "person_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Status',
                id: "lead_status",
                accessor: "lead_status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Assigned To',
                id: "lead_owner",
                accessor: "lead_owner",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Created',
                id: "created_format",
                accessor: "created_format",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Created by',
                id: "created_by_name",
                accessor: "created_by_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Last Viewed Date',
                accessor: "viewed_date",
                Header: ({ column }) => <div className='ellipsis_line1__ text-center'>{column._label}</div>,
                sortable: true,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    return (
                        <span>{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</span>
                    )
                    
                }
            },
            {
                _label: 'Last Viewed By',
                accessor: "viewed_by",
                Header: ({ column }) => <div className='ellipsis_line1__ text-center'>{column._label}</div>,
                sortable: true,
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
        ]
    }


    determineDisplayedColumns() {
        return this.determineColumns().reduce((acc, curr) => {
            acc[curr.id] = true
            return acc
        }, {})
    }


    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.addLeadModal && (
                        <CreateLeadModal open={!!this.state.addLeadModal}
                            onClose={this.handleOnCloseAddModal}
                            onSuccess={this.handleOnAddLeadSuccess}
                        />
                    )
                }
                {
                    this.state.editLeadModal && (
                        <EditLeadModal open={!!this.state.editLeadModal}
                            id={this.state.editLeadModal}
                            onClose={this.handleOnCloseEditModal}
                            onSuccess={this.handleOnUpdateLeadSuccess}
                        />
                    )
                }
                { 
                    this.state.previewLeadModal && (
                        <EditLeadModal open={!!this.state.previewLeadModal} 
                            heading={`Preview lead`}
                            id={this.state.previewLeadModal} 
                            onClose={this.handleOnClosePreviewModal} 
                            onSuccess={() => {}}
                            disabled={true}
                        />
                    )
                }

                {
                    this.state.openConvertModal && (
                        <ConvertLeadModal
                            leadId={this.state.convertLeadId}
                            showModal={this.state.openConvertModal}
                            closeModal={this.handleCloseModalCOnvert}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable},()=>{})
    }

    render() {
        this.defualtFilter = queryString.parse(window.location.search);

        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.determineColumns()
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)


        return (
            <React.Fragment>
                <div className="Leads slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <DataTableListView
                            page_name="Leads"
                            header_icon="lead"
                            displayed_columns={this.props.displayed_columns}
                            filter_options={
                                [
                                    { field: "lead_status", label: "Status", value: "Status", order: "1" }
                                ]
                            }
                            list_api_url="sales/Lead/get_leads_list"
                            related_type="leads"
                            filter_status="all"
                            default_filter_logic="1 AND 2"
                            filter_title="All Leads"
                            show_filter={false}
                            check_default="all"
                            determine_columns={this.determineColumns}
                            on_render_actions={() => this.handleOnRenderActions()}
                            is_any_action={this.state.is_any_action}
                            filtered={true}
                            refresh={this.state.refreshTable}
                            sortColumnLabel="Created"
                            sortColumn="created"
                        />
                    </IconSettings>
                </div>
                { this.renderModals() }
            </React.Fragment>
        )
    }
}

ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
const mapStateToProps = state => ({
    showPageTitle: state.DepartmentReducer.activePage.pageTitle,
    showTypePage: state.DepartmentReducer.activePage.pageType,
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchtoProps)(Leads);