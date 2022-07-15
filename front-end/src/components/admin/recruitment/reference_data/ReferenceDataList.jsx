import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'react-select-plus/dist/react-select-plus.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, css, checkLoginWithReturnTrueFalse, getPermission, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import {
    PageHeaderControl,
    Button,
} from '@salesforce/design-system-react';
import DataTableListView from '../../../admin/oncallui-react-framework/view/ListView/DataTableListView.jsx';
import CreateReferenceData from './CreateReferenceData.jsx';

const queryString = require('query-string');

/**
 * RequestData get the list of reference
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentReferenceData/get_all_ref_data', Request).then((result) => {
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
 * Class: ReferenceDataList
 */
class ReferenceDataList extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "code": true,
            "type": true,
            "display_name": true,
            "source": true,
            "start_date": true,
            "end_date": true,
            "actions": true,
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props
     */
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            filterVal: '',
            refList: [],
            filter_status: 'all',
            refreshTable: true,
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
        }

        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * to fetch the filtered data by setting required props and calling the request data function
     */
    fetchData = (state) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                refList: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * hanlding quick search submission
     * @param {*} e
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    handleChanged = (event, data) => {
        this.setState({ selection: data.selection });
    };

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filters: this.state.selectedfilval };
        this.setState({ filtered: search_re });
    }

    /**
    * Action for inactive and archive
    */
    showModal = (item, key) => {
        this.setState({ openCreateReferenceData: true, selected_item: item });
    }

    /**
    * Close the modal when user save the interview and refresh the table
    * Get the Unique reference id
    */
    closeModal = (status) => {
        this.setState({ openCreateReferenceData: false });
        if (status) {
            this.refreshListView();
        }
    }


    refreshListView() {
        this.setState({ refreshTable: !this.state.refreshTable }, () => { this.fetchData(this.state) })
    }
    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Code',
                accessor: "code",
                id: 'code',
            },
            {
                _label: 'Type',
                accessor: "type",
                id: 'type'
            },
            {
                _label: 'Display Name',
                accessor: "display_name",
                id: 'display_name',
            },
            {
                _label: 'Source',
                accessor: "source",
                id: 'source',
            },
            {
                _label: 'Start date',
                accessor: "start_date",
                id: 'start_date',
                CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: 'End date',
                accessor: "end_date",
                id: 'end_date',
                CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '50px',
                actionList: [
                    {
                        id: 1,
                        label: 'View',
                        value: '1',
                        key: '1',
                    },
                ]
            }
        ]
    }

    handleOnRenderActions() {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" disabled={false} onClick={() => this.showModal('', 'create')} />
                </PageHeaderControl>
            </React.Fragment>
        )
    }
    refreshListView() {
        this.setState({ refreshTable: !this.state.refreshTable, selection: [] }, () => { this.fetchData(this.state) })
    }

    /**
     * Render Modal
     * - Create Inteview Modal
     */
    renderModal = () => {
        return (
            <>
                {
                    this.state.openCreateReferenceData &&
                    <CreateReferenceData
                        showModal={this.state.openCreateReferenceData}
                        closeModal={this.closeModal}
                        selected_item={this.state.selected_item}
                        {...this.props}
                    />
                }
            </>
        );
    }

    /**
     * rendering components
     */
    render() {
        this.defualtFilter = queryString.parse(window.location.search);

        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        const icon_style = {
            backgroundColor: '#56aadf',
            fill: '#ffffff',
        }

        return (
            <React.Fragment>
                <div className="ListContact slds td_height_settings" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page_name="Reference Data Management"
                        header_icon="user"
                        icon_style={icon_style}
                        displayed_columns={this.props.displayed_columns}
                        list_api_url="recruitment/RecruitmentReferenceData/get_all_ref_data"
                        related_type="reference_data_management"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="Reference Data Management"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}
                        sortColumnLabel="User Id"
                        sortColumn="id"
                        selection={this.state.selection}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshTable}
                        disable_list_view={true}
                        is_header_info={false}
                        is_list_view_control={false}
                        get_default_pinned_data={false}
                        show_filter_icon={false}
                        showModal={this.showModal}
                    />
                    {this.renderModal()}
                </div>

            </React.Fragment>
        );
    }
}
// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
// Get the page title and type from reducer
const mapStateToProps = state => ({})

const mapDispatchtoProps = (dispach) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchtoProps)(ReferenceDataList);
