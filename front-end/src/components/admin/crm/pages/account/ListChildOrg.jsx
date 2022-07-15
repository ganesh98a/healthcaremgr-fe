import React, { Component } from 'react';
import jQuery from 'jquery'
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, AjaxConfirm, toastMessageShow, css } from 'service/common.js';
import { connect } from 'react-redux'
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';

import moment from "moment";

import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import '../../../scss/components/admin/crm/pages/account/ManageAccountRoles.scss'
import { 
    IconSettings, 
    PageHeader, 
    Badge,
    PageHeaderControl, 
    Icon,    
} from '@salesforce/design-system-react'

/**
 * Get all child orgnisation with sub level
 * @param {int} org_id
 * @param {int} pageSize
 * @param {int} page
 * @param {array} sorted
 * @param {array} filtered
 */
const requestData = (org_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { id: org_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Account/get_account_child_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count)
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
 * Class: ListChildOrg
 */
class ListChildOrg extends Component {

    static defaultProps = {
        displayed_columns: {
            org_code: false,
            name: true,
            status: true,
            created:  true,
        }
    }


    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])

        this.state = {
            searchVal: '',
            filterVal: '',
            contactList: [],
            filter_status: 'all',
            parent_org_name: '',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openViewModal: false
        }

        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    componentDidMount() {
        var org_id = this.props.match.params.id;
        this.get_organisationDetails(org_id);
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Get organisation details
     * @param {int} org_id 
     */
    get_organisationDetails = (org_id) => {
        postData('sales/Account/get_organisation_details', { org_id }).then((result) => {
            if (result.status) {
                this.setState(result.data);
            } else {
                toastMessageShow(result.error, "e");
            }

        });
    }

    /**
     * Call requestData 
     * @param {obj} state 
     * @param {*} instance 
     */
    fetchData = (state, instance) => {
        var org_id = this.props.match.params.id;
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            org_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                contactList: res.rows,
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
            diplayBadge: {
                display: 'inline'
            }
        })
        return [
            {
                _label: 'Organisation ID',
                accessor: "org_code",
                id: 'org_code',
                sortable: false,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Organisation Name',
                accessor: "name",
                id: 'name',
                sortable: false,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    var depth = 2 * Number(props.original.space_depth);
                    var iconAdd = (
                        <Icon
                            category="utility"
                            name={"add"}
                            size="xx-small"
                            style={{
                                color: '#000',
                                paddingRight: '0.2rem'
                            }}
                        />
                    )

                    var iconMinus = (
                        <Icon
                            category="utility"
                            name={"dash"}
                            size="xx-small"
                            style={{
                                color: '#000',
                                paddingRight: '0.2rem'
                            }}
                        />
                    )
                    return (
                    <span style={{paddingLeft: depth+'rem'}} className="row">
                        {
                            // props.original._children && iconMinus
                        }
                        <Link 
                            className={"vcenter slds-truncate pr-2 reset"}
                            title={`View organisation`} 
                            to={"/admin/crm/organisation/details/" + props.original.id}
                            style={{ color: '#0070d2' }}
                        >
                            {defaultSpaceInTable(props.value)}
                        </Link>
                        {
                            this.props.match.params.id === props.original.id && 
                            <Badge id={"badge-base-"+props.original.id} className="org-child-badge-current" content="Current" style={{
                                display: 'inline'
                            }} />
                        }
                    </span>
                )
                }
            },
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
                sortable: false,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Created date',
                accessor: "created",
                id: 'created',
                sortable: false,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
            },
        ];
    }

    /**
     * Render modals
     */
    renderModals() {
        return (
            <React.Fragment />
        )
    }

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        var filter_option = [{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]

        const columns = this.determineColumns()
        const displayed_columns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0)
        const trail = [
            <Link to={ROUTER_PATH + `admin/crm/organisation/listing`} className="reset" style={{ color: '#0070d2' }}>
                {'Organisations'}
            </Link>,
			<Link to={ROUTER_PATH + `admin/crm/organisation/details/${this.props.match.params.id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.account_name}
            </Link>,
		];
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons/">
                        <PageHeader
                            info=""
                            title="Organisation Hierarchy"
                            trail={trail}
                            truncate
                            variant="related-list"
                        />
                        <SLDSReactTable
                            PaginationComponent={React.Fragment}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchData}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayed_columns}
                            data={this.state.contactList}
                            defaultPageSize={99999}
                            minRows={1}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No records found"
                            collapseOnDataChange={true}
                            getTableProps={() => ({ role: 'grid', className: `slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles` })}
                            resizable={true}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListChildOrg);