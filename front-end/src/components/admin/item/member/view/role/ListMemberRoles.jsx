import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, AjaxConfirm, toastMessageShow, css } from 'service/common.js';
import { connect } from 'react-redux'
import Pagination from "service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import _ from 'lodash';
import './ListMemberRole.scss';
import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Icon, 
    ButtonGroup, 
    Button, 
    Dropdown, 
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import CreateMemberRoleModal from '../../../../member/CreateMemberRoleModal';
import IconsMe from '../../../../IconsMe'

/**
 * 
 * @param {object} props
 * @param {number} props.opportunity_id
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onEdit
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onArchive
 * @param {(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) => void} props.onPreview
 */
export const RoleActions = ({ member_role_id, onEdit, onArchive, onPreview }) => {

    const styles = css({
        root: {
            maxWidth: 100,
            height: '100%'
        }
    })

    return (
        <div style={styles.root} className="d-flex align-items-center">
            <Link to={'#'} title= {`Modify opportunity details`} className={`inline-block`} onClick={e => { e.preventDefault(); onEdit(e, member_role_id)}}>
                <IconsMe icon="edit3-ie" className="f-21"/>
            </Link>
            &nbsp;
            <Link to={'#'} title={`Archive opportunity`} className={`inline-block`} onClick={e => { e.preventDefault(); onArchive(e, member_role_id)}}>
                <IconsMe icon="trash-o" className="f-21"/>
            </Link>
        </div>
    )
}

/**
 * RequestData get the list of role
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (pageSize, page, sorted, filtered, member_id) => {
    
    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, id: member_id };
        postData('member/MemberRole/get_member_roles', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data.roles;
                const res = {
                    rows: filteredData,
                    pages: (result.data.roles.count),
                    pay_points: result.data.pay_points,
                    levels: result.data.levels,
                    member: result.data.member
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
 * Class: ListRole
 */
class ListMemberRoles extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'name': true,
            'level': true,
            'start_date': true,
            'end_date': true,
            'pay_point': true,
            'role_actions': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            roleList: [],
            filter_status: 'all',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openMemberRoleModal: false,
            member: props.location.member
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
        console.log(this.props);
        let member_id = this.props.match.params.id;
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            member_id
        ).then(res => {
            this.setState({
                roleList: res.rows,
                pages: res.pages,
                loading: false,
                levels: res.levels,
                pay_points: res.pay_points,
                member: res.member
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
     * Open create role modal
     */
    showModal = (oppId) => {
        this.setState({ openMemberRoleModal: true });
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.get_member_details(this.props.match.params.id);
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewRole = e => {
            e.preventDefault()
            this.showModal();
        }
        
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/item/role/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewRole}>
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
                    id="Member-search-1"
                    placeholder="Search Role"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let roleStatusFilter = [
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'InActive' },        
        ];
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={roleStatusFilter}
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
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
                <PageHeaderControl>
                    {/* { this.renderStatusFilters() } */}
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Render modals
     * - Create Role
     * 
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openMemberRoleModal &&
                    <CreateMemberRoleModal addModal={this.state.addModal} showModal={this.state.openMemberRoleModal} member={this.state.member} closeModal={(status) => this.closeMemberRoleModal(status)} />
                }
            </React.Fragment>
        )
    }

    closeMemberRoleModal(status) {
        reFreashReactTable(this, 'fetchData');
        this.setState({openMemberRoleModal: false});
    }

    editMemberRole(props) {
        this.get_member_role(props.member_role_id);
        let member_role_details = _.find(this.state.roleList, {member_role_id: props.member_role_id});
        let member = {...this.state.member, role_id: member_role_details.role_id, role_name: member_role_details.role_name, role_start_time: props.role_start_time, role_end_time: props.role_end_time, pay_point: props.pay_point, level: props.level, member_role_id: props.member_role_id}
        this.setState({openMemberRoleModal: true, member});
    }

    getEndDate(date) {
        if (moment(date).isValid()) {
            return moment(date).format("DD/MM/YYYY h:mm a");
        }
        return "N/A";
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Role Name',
                accessor: "name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <Link to={ROUTER_PATH + `admin/item/role/details/${props.original.role_id}`}
                        className="vcenter default-underlined slds-truncate"
                        style={{ color: '#0070d2' }}
                    >
                        {defaultSpaceInTable(props.original.role_name)}
                    </Link>
                )
            },
            {
                _label: 'Start Date & Time',
                accessor: "start_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(moment(props.original.role_start_time).format("DD/MM/YYYY h:mm a"))}</span>
            },
            {
               
                _label: 'End Date & Time',
                accessor: "end_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(this.getEndDate(props.original.role_end_time))}</span>
            },
            {
                _label: 'Pay Point',
                accessor: "pay_point",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(_.find(this.state.pay_points, {value:props.original.pay_point}).label)}</span>
            }, 
            {
                _label: 'Level',
                accessor: "level",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(defaultSpaceInTable(_.find(this.state.levels, {value:props.original.level}).label))}</span>
            },    
            {
                _label: 'Action',
                id: 'role_actions',
                className: "slds-tbl-roles-td",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => 
                    <Dropdown
                        assistiveText={{ icon: 'More Options' }}
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        onSelect={(option) => {
                            if (option.value === 1) {
                                this.editMemberRole(props.original)
                            }
                            if (option.value === 2) {
                                this.archiveMemberRole(props.original.member_role_id)
                            }
                        }}
                        className={'slds-more-action-dropdown'}
                        options={[
                            { label: 'Edit', value: 1 },
                            { label: 'Delete', value: 2 },
                        ]}
                    />
            }                 
        ]
    }

    get_member_role(id) {
        this.setState({ loading: true })
        postData('member/MemberRole/get_member_role_details', { id })
            .then((result) => {
                if (result.status) {
                    this.setState({ member: result.data })
                    this.setState({ openMemberRoleModal: true })
                } else {
                    this.setState({ redirectTo: ROUTER_PATH + `admin/support_worker/list` })
                }
            })
            .catch(() => console.error('Could not fetch member details'))
            .finally(() => this.setState({ loading: false }))
    }

    /**
     * Fetching member details
     * 
     * Will fetch when:
     * - This component was mounted
     * - Member was successfully updated
     */
    get_member_details = (id) => {
        this.setState({ loading: true })
        postData('member/MemberDashboard/get_member_details', { id })
            .then((result) => {
                if (result.status) {
                    this.setState({ ...result.data })
                } else {
                    this.setState({ redirectTo: ROUTER_PATH + `admin/support_worker/list` })
                }
            })
            .catch(() => console.error('Could not fetch member details'))
            .finally(() => this.setState({ loading: false }))
    }

    archiveMemberRole = (id) => {
        const msg = `Are you sure you want to archive this Role?`
        const confirmButton = `Archive Member Role`

        AjaxConfirm({ id }, msg, `member/MemberRole/archive_member_role`, { confirm: confirmButton, heading_title: `Archive Role` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, "fetchData");
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
        // This will only run when user create role assessment
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
			<Link to={ROUTER_PATH + `admin/support_worker/list`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>Members</Link>,
			<Link to={`${ROUTER_PATH}admin/support_worker/details/${this.props.match.params.id}`} className="default-underlined slds-truncate">{this.state.member && this.state.member.member_name || ''}</Link>,
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
                                        label: 'Member Roles',
                                    }}
                                    category="standard"
                                    name="avatar"
                                    style={{
                                        backgroundColor: '#ea7600',
                                        fill: '#ffffff',
                                    }}
                                    title="Member Roles"
                                />
                            }
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title="Member Roles"
                            label={<span />}
                            truncate
                            variant="object-home"
                            trail={trail}
                        />
                            <SLDSReactTable
                                PaginationComponent={() => false}
                                ref={this.reactTable}
                                manual="true"
                                loading={this.state.loading}
                                pages={this.state.pages}
                                onFetchData={(state, instance)=>this.fetchData(state, instance)}
                                filtered={this.state.filtered}
                                defaultFiltered={{ filter_status: 'all' }}
                                columns={displayedColumns}
                                data={this.state.roleList}
                                defaultPageSize={9999}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No Record Found"
                                collapseOnDataChange={true}
                                resizable={true} 
                                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}                                   
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListMemberRoles);
