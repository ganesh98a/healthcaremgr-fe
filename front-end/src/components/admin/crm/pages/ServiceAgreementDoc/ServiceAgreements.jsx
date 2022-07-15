import { Button, Dropdown, DropdownTrigger, IconSettings, PageHeaderControl } from '@salesforce/design-system-react';
import jQuery from 'jquery';
import React from 'react';
import { connect } from 'react-redux';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import { ROUTER_PATH } from '../../../../../config.js';
import { css, postData } from '../../../../../service/common.js';
import { getDataListById } from '../../../actions/CommonAction';
import DataTableListQuickFilter from '../../../oncallui-react-framework/view/ListView/DataTableListQuickFilter.jsx';

const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        // request json
        let req = { 
            pageSize: pageSize, 
            page: page, 
            sorted: sorted, 
            filtered: filtered
        }
        postData('sales/ServiceAgreement/get_service_agreement_list', req).then((result) => {
            if (result.status) {
                const res = {
                    data: result.data,
                    pages: result.count
                };
                resolve(res);
            } else {
                const res = {
                    data: [],
                    pages: 0
                };
                resolve(res);
            }
        });

    });
};



class ServiceAgreements extends React.Component {

    constructor(props) {
        super(props);

        const displayed_columns = this.determineColumns().map(c => c.id || c.accessor).filter(Boolean)

        this.state = {
            searchVal: '',
            filterVal: '',
            filter_status: 'all',

            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openViewModal: false,
            request_data: {},
            pageSize: 20,
            page: 0,
            sorted: [],
            filtered: {},
        }

        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }


    componentDidMount() {
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }


    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }


    fetchData = (state, instance) => {
        this.setState({ loading: true });
        let Request = this.props.request_list_data;
        Request['pageSize'] = this.props.currentPage > 0 ? (this.props.pageSize * this.props.currentPage) : this.props.pageSize;
        Request['page'] = this.props.page;
        Request['sorted'] = state.sorted;
        Request['filtered'] = Request.filtered || {};
        Request['filtered']['filter_status'] = state.filtered.filter_status || '';
        this.props.getListByIdProps('sales/ServiceAgreement/get_service_agreement_list', Request, true);
        this.props.setListRequestdProps(Request);
        this.setState({ loading: false, request_data: Request });
    }


    filterChange = (key, value) => {
        let state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }


    submitSearch = e => {
        e.preventDefault();
        this.setTableParams();
    }


    setTableParams = () => {
        let filtered = { 
            search: this.state.search, 
            filter_status: this.state.filter_status 
        };
        this.setState({ filtered: filtered }, () => {
            this.fetchData(this.state);
        });
    }

    /**
     * @returns {(import('react-table').Column<any> | { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "service_agreement_id",
                id: 'service_agreement_id',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Opportunity service type',
                accessor: "opportunity_topic",
                id: 'opportunity_topic',
                CustomUrl: [{url : ROUTER_PATH + 'admin/crm/serviceagreements/PARAM1/'},
                {param: ['id']}, {property: 'target=_blank'}]
            },
            {
                _label: 'Status',
                accessor: "status_label",
                id: 'status_label',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Assigned To',
                accessor: "owner_fullname",
                id: 'owner_fullname',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Account',
                accessor: "account_name",
                id: 'account_name',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Created date',
                accessor: "created",
                id: 'created',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },
            {
                _label: 'Created by',
                accessor: "created_by_fullname",
                id: 'created_by_fullname',
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            
            {
                _label: 'Last Viewed Date',
                accessor: "viewed_date",
                id: 'viewed_date',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
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

    filterChange = (key, value) => {
        let state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    /**
     * prepating the filter selection panel (secondary)
     */
     showSelectFilterPanel() {
        let filter_option = [
            { value: "all", label: "All" }, 
            { value: '0', label: "Draft" }, 
            { value: '1', label: "Issued" },
            { value: '2', label: "Approved" },
            { value: '3', label: "Accepted" },
            { value: '4', label: "Declined" },
            { value: '5', label: "Active" },
        ]
        return (
            <PageHeaderControl>
                <Dropdown
                    align="right"
                    checkmark
                    assistiveText={{ icon: 'Filter by status' }}
                    iconCategory="utility"
                    iconName="settings"
                    iconVariant="more"
                    options={filter_option}
                    onSelect={option => this.filterChange('filter_status', option.value)}
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
            </PageHeaderControl>
        )
    }

    /***
     * Render Header Action
     */
    handleOnRenderActions() {
        return (
            <React.Fragment />
        );
    }

    render() {
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const columns = this.determineColumns()
        let request_data = this.state.request_data;

        let pageComponentValue = {
            variant: 'object-home',
            title: 'Service Agreements',
            icon: {
                title: 'Service Agreements',
                category: 'standard',
                name: 'file',
                backgroundColor: '#ea7600',
                fill: '#ffffff'
            },
            inputSearch: {
                search: true,
                placeholder: 'Search service agreement',
                id: 'list_sa_input_search'
            },
            columns: {
                columns: true,
                list: columns,
            },
            filter: {
                quick_filter: false,
                dropdown_filter: true,
                filterComponent: this.showSelectFilterPanel.bind(this)
            }
        };
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <DataTableListQuickFilter
                            ref='child'
                            page_header={false}
                            pageSize={20}
                            pageComponentValue={pageComponentValue}
                            pageHeaderComponent={''}
                            pageTableColumns={columns}
                            header_icon="file"
                            displayed_columns={this.state.displayed_columns}
                            default_displayed_columns={this.state.default_displayed_columns}
                            list_api_url="sales/ServiceAgreement/get_service_agreement_list"
                            request_data={request_data}
                            related_type="service_agreement"
                            filter_status="all"
                            determine_columns={this.determineColumns}
                            refresh={this.state.refreshTable}
                            sortColumnLabel="Date Applied"
                            sortColumn="created"
                            on_render_actions={() => this.handleOnRenderActions()}
                            selectRows=""
                            info={false}
                            filter_status={this.state.filter_status}
                        />
                    </IconSettings>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    showPageTitle: 'ApplicationsApplicantList',
    showTypePage: state.RecruitmentReducer.activePage.pageType,
    dataTableValues: state.CommonReducer.dataTableValues,
    pageSize: state.CommonReducer.dataTableValues.pageSize || 0,
    items: state.CommonReducer.dataTableValues.items || [],
    prevItems: state.CommonReducer.dataTableValues.prevItems || [],
    pages: state.CommonReducer.dataTableValues.pages || 0,
    totalItem: state.CommonReducer.dataTableValues.totalItem || 0,
    hasMore: state.CommonReducer.dataTableValues.hasMore || 0,
    currentPage : state.CommonReducer.dataTableValues.currentPage  || 0,
    request_list_data: state.CommonReducer.request_list_data
})

const mapDispatchtoProps = (dispatch) => {
    return {
        getListByIdProps: (api_url, request, clear_all) => dispatch(getDataListById(api_url, request, clear_all)),
        setListRequestdProps: (request) => dispatch({ type: 'SET_DATA_TABLE_LIST_REQUEST', data: request}),
    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(ServiceAgreements);