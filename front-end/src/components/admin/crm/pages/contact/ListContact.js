import React, { Component } from 'react';
import jQuery from 'jquery'
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, AjaxConfirm, toastMessageShow } from '../../../../../service/common.js';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import CrmPage from '../../CrmPage'
import CreateContactModal from "./CreateContactModal";
import '../../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {PageHeaderControl} from '@salesforce/design-system-react'

import { defaultSpaceInTable } from '../../../oncallui-react-framework/services/custom_value_data'
import moment from "moment";
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import DataTableListView from '../../../oncallui-react-framework/view/ListView/DataTableListView';
import { selectFilterTypeOptions } from '../../../oncallui-react-framework/view/ListView/list_view_control_json';

const selectContactFilterOptions = [
    { value: "ID", label: "ID", field: "contact_code" },
    { value: "Full Name", label: "Full Name", field: "fullname" },
    { value: "Type", label: "Type", field: "type" },
    { value: "Status", label: "Status", field: "status" },
    { value: "Created Date", label: "Created Date", field: "created" },
    { value: "Created By", label: "Created By", field: "created_by" }
]

const listControlOption = [
    { label: 'LIST VIEW CONTROLS', type: 'header' },
    { label: 'All Contacts', value: 'all' },
];

const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('sales/Contact/get_contact_list', Request).then((result) => {
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

class ListContact extends Component {

    static defaultProps = {
        displayed_columns: {
            "contact_code": true,
            "fullname": true,
            "type": true,
            "status": true,
            "created": true,
            "created_by": true,
        }
    }
    constructor(props) {
        sessionStorage.removeItem('filterarray');
        super(props);
        this.state = {
            searchVal: '',
            filterVal: '',
            contactList: [],
            filter_status: 'all',
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            selectfilteroptions: selectContactFilterOptions,
            showselectedfilters: false,
            showselectfilters: false,
            selectfiltercreatedbyoptions: [],
            selectedfilval: [],
            default_filter_logic: '1 AND 2',
            filter_logic: '',
            list_control_option: listControlOption,
            filter_title: 'All Contacts',
            filter_list_id: '',
            showFilter: false,
            checkdefault: 'all',
            filter_related_type: '',//ListViewRelatedType.contact,
            filter_error_msg: '',
            is_any_data_pinned: false,
            pinned_id: "0",
            filter_list_length: '0',
            is_own_list: false,
            user_view_by: '1',
            list_control_data: [],
            showFilterOption: false
        }

        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    componentDidMount() {
        jQuery(this.rootRef.current).parent(`.col-lg-11`).removeClass(`col-lg-11`).addClass(`col-lg-12`);
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent(`.col-lg-12`).removeClass(`col-lg-12`).addClass(`col-lg-11`)
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    fetchData = (state) => {
        this.setState({
            fil_pageSize: state.pageSize,
            fil_page: state.page,
            fil_sorted: state.sorted,
            fil_filtered: state.filtered
        });
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
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

    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re });
    }
    /**
     * To close the create or update modal
     */
    closeModal = (status) => {
        this.setState({ openCreateModal: false });

        if (status) {
            this.setState({is_any_action : true});
            this.refreshListView();
        }
    }
    /**
    * To delete the contact
    * @param {*} id
    *
    */
    archiveContact = (id) => {
        const msg = `Are you sure you want to archive this Contact?`
        const confirmButton = `Archive Contact`

        AjaxConfirm({ id }, msg, `sales/Contact/archive_contact`, { confirm: confirmButton, heading_title: `Archive Contact` }).then(result => {
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

    determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "contact_code",
                id: 'contact_code',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>

            },
            {
                _label: 'Full Name',
                accessor: "fullname",
                id: 'fullname',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <Link to={ROUTER_PATH + `admin/crm/contact/details/${props.original.id}`}
                        className="vcenter default-underlined slds-truncate"
                        style={{ color: '#0070d2' }}
                    >
                        {defaultSpaceInTable(props.value)}
                    </Link>
                ),
                CustomUrl: [{url : ROUTER_PATH + 'admin/crm/contact/details/PARAM1'},
                 {param: ['id']}, {property: 'target=_blank'}]

            },
            {
                _label: 'Type',
                accessor: "type",
                id: 'type',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span>{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Created Date',
                accessor: "created",
                id: 'created',
                Header: ({ column }) => <div className="ellipsis_line1__">{column._label}</div>,
                CustomDateFormat: "DD/MM/YYYY HH:mm:ss"
            },
            {
                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
                Header: ({  }) => <div className="slds-truncate" title="Created By">Created By</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
        ]
    }

    onRenderActions() {
        return (
            <React.Fragment>

                <PageHeaderControl>
                    <Link to={'/admin/crm/contacts/import'} className={`slds-button slds-button_neutral`} >
                        <span>Import CSV File</span>&nbsp;<i className="icon icon icon-download2-ie"></i> </Link>
                    <Link id="btn-new" to={ROUTER_PATH + `admin/crm/contacts/create`}
                        className={`slds-button slds-button_neutral`}
                        onClick={e => {
                            e.preventDefault();
                            this.setState({ openCreateModal: true, selectedContactId: '' })
                        }}
                    >
                        New
                        </Link>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }

    render() {
        return (
            <React.Fragment>
                <CrmPage pageTypeParms={'sales_contact'} />
                <DataTableListView
                    page_name="Contacts"
                    header_icon="opportunity"
                    displayed_columns={this.props.displayed_columns}
                    filter_options={
                        selectContactFilterOptions
                    }
                    list_api_url="sales/Contact/get_contact_list"
                    related_type="contact"
                    filter_status= "all"
                    default_filter_logic= "1 AND 2"
                    list_control_option={listControlOption}
                    filter_title="All Contacts"
                    show_filter={false}
                    check_default = "all"
                    is_any_data_pinned = {false}
                    determine_columns={this.determineColumns}
                    on_render_actions={() => this.onRenderActions()}
                    ref={this.reactTable}
                    refresh={this.state.refreshListView}
                    is_any_action={this.state.is_any_action}
                    sortColumnLabel="ID"
                    select_filter_type_options={selectFilterTypeOptions(1)}
                />
                {
                    this.state.openCreateModal && (
                        <CreateContactModal
                            contactId={this.state.selectedContactId}
                            showModal={this.state.openCreateModal}
                            closeModal={this.closeModal}
                        />
                    )
                }

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
    list_view_control: state.ListViewControlActivityReducer.list_view_control,
    activity_loading: state.ListViewControlActivityReducer.activity_loading,
    list_view_control_by_related_type: state.ListViewControlActivityReducer.list_view_control_by_related_type,
    list_view_control_by_id: state.ListViewControlActivityReducer.list_view_control_by_id,
})

const mapDispatchtoProps = () => {
    return {}
}

export default connect(mapStateToProps, mapDispatchtoProps)(ListContact);