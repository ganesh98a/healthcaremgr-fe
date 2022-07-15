import React from 'react';
import 'react-table/react-table.css'
import { postData, toastMessageShow, checkLoginWithReturnTrueFalse, getPermission, css } from 'service/common.js';
import { BASE_URL } from 'config.js';
import 'react-table/react-table.css'
import queryString from 'query-string';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { connect } from 'react-redux'
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect';
import { PageHeaderControl, Button } from '@salesforce/design-system-react'
import ViewTemplate from '../../imail/templates/ViewTemplate';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';

const requestData = (pageSize, page, sorted, filtered, log_type, applicant_id) => {
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, log_type: log_type, applicant_id: applicant_id };

        postData('recruitment/RecruitmentDashboard/get_communication_log', Request).then((result) => {
            let filteredData = result.data;
            if (result.status) {
                const res = {
                    rows: filteredData,
                    page: (result.count)
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    page: 0
                };
                resolve(res);
            }
        });

    });
};

const communicationFilterOptions = [
    { value: "Shift Number", label: "Shift Number", field: "from" },
    { value: "Shift Number", label: "Shift Number", field: "to_email" },
    { value: "Shift Number", label: "Shift Number", field: "log_type" },
    { value: "Shift Number", label: "Shift Number", field: "title" },
    { value: "Shift Number", label: "Shift Number", field: "created" },
    { value: "Shift Number", label: "Shift Number", field: "actions" },
]

class CommunicationsLogs extends React.Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "from": true,
            "to_email": true,
            "log_type": true,
            "title": true,
            "created": true,
            "actions": true
        }
    }

    constructor(props) {
        super(props);
        let search = props.props.location.search || false;
        let sp = search && new URLSearchParams(search) || false;
        let applicant_id = sp && sp.get("a") || false;
        let applicant_name = sp && sp.get("n") || "";
        this.state = {
            page: 0,
            communicationLog: [],
            selectAll: 0,
            filterVal: 0,
            selected: [],
            srch_box: '',
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            filter_panel_display_status: false,
            status_filter_value: 0,
            isViewOpen: false,
            applicant_id,
            applicant_name
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.rootRef = React.createRef();
        this.reactTable = React.createRef();
    }

    componentWillMount() {
        const parsed = queryString.parse(window.location.search);
        if (typeof (parsed) === 'object' && parsed.a != '') {
            let stateData = {};
            stateData['applicantId'] = parsed.a;
            if (parsed['t'] && parsed.t != '') {
                stateData['filterVal'] = parsed.t;
                this.setState({ 'status_filter_value': parsed.t });
            }
            this.setState(stateData);
        }
    }

    fetchData = (state, instance) => {
        // function for fetch data from database
        this.setState({ loading: true });
        requestData(
            this.state.pageSize,
            this.state.page,
            this.state.sorted,
            this.state.filtered,
            this.props.log_type,
            this.props.applicant_id,
        ).then(res => {
            this.setState({
                communicationLog: res.rows,
                page: res.pages,
                loading: false,
                userSelectedList: [],
                selectAll: 0
            });
        });
    }

    toggleSelectAll_ = () => {
        let newSelected = {};

        if (this.state.selectAll === 0) {
            this.state.communicationLog.forEach(x => {
                newSelected[x.id] = true;
            });
        }

        this.setState({
            selected: newSelected,
            selectAll: (this.state.selectAll === 0) ? 1 : 0
        }, () => {

        });
    }

    toggleSelectAll = () => {
        let newSelected = {};
        let selectedList = this.state.communicationLog;
        var userSelectedList = this.state.userSelectedList;

        if (this.state.selectAll === 0) {
            this.state.communicationLog.forEach(x => {
                newSelected[x.id] = true;
            });
        }

        this.setState({
            userSelectedList: selectedList,
            selected: newSelected,
            selectAll: (this.state.selectAll === 0) ? 1 : 0
        });
    }

    toggleRow_1 = (id) => {
        const newSelected = Object.assign({}, this.state.selected);
        newSelected[id] = !this.state.selected[id];

        this.setState({
            selected: newSelected,
            selectAll: 2
        });
    }

    toggleRow = (id) => {
        const newSelected = Object.assign({}, this.state.selected);
        newSelected[id] = !this.state.selected[id];
        let selectedList = this.state.communicationLog;
        var userSelectedList = this.state.userSelectedList;

        var columnIndex = selectedList.findIndex(x => x.id == id);
        if (newSelected[id]) {
            this.setState({
                userSelectedList: userSelectedList.concat(selectedList[columnIndex]),
            });
        }
        else {
            var tempState = {};
            var selectedColumnIndex = userSelectedList.findIndex(x => x.id == id);
            tempState['userSelectedList'] = userSelectedList.filter((s, sidx) => selectedColumnIndex !== sidx);
            this.setState(tempState);
        }

        this.setState({
            selected: newSelected,
            selectAll: 2
        }, () => { });
    }

    searchLog = (e) => {
        if (e != undefined) {
            e.preventDefault();
        }
        let extratstate = {};
        if (this.state.hasOwnProperty('applicantId')) {
            extratstate['applicantId'] = this.state.applicantId;
        }
        var requestData = { ...this.state.filtered, ...extratstate, srch_box: this.state.srch_box, filterBy: this.state.filterVal };
        this.setState({ filtered: requestData });
    }

    defaultFilteredData = () => {
        let data = {};
        data['applicantId'] = this.state.hasOwnProperty('applicantId') ? this.state.applicantId : '';
        data['filterBy'] = this.state.hasOwnProperty('filterVal') ? this.state.filterVal : 0;
        return data;
    }

    filterChange = (value) => {
        let extratstate = {};
        if (this.state.hasOwnProperty('applicantId')) {
            extratstate['applicantId'] = this.state.applicantId;
        }
        this.setState({ filterVal: value, filtered: { ...this.state.filtered, ...extratstate, srch_box: this.state.srch_box, filterBy: value } });
    }

    csvDownload = () => {
        let requestData = { userSelectedList: this.state.selection };
        if (this.state.selection) {
            postData('recruitment/RecruitmentDashboard/export_communication_log', requestData).then((result) => {
                if (result.status) {
                    this.setState({ selected: [], selectAll: '', userSelectedList: [] });
                    window.location.href = BASE_URL + "archieve/" + result.csv_url;
                } else {
                    toastMessageShow(result.error, 's');
                }
            });
        } else {
            toastMessageShow("Please select at least one communication log", "e");
        }
    }

    list_api_url(res) {
        
        this.setState({
            shifts_list: res.rows,
            page: res.pages,
            loading: false
        });
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Title',
                accessor: "title",
                id: 'title',
            },
            {
                _label: 'From',
                accessor: "from",
                id: 'from',
            },
            {
                _label: 'To',
                accessor: "to_email",
                id: 'to_email',
            },
            {
                _label: 'Type',
                accessor: "log_type",
                id: 'log_type',
            },
            {
                _label: 'Sent',
                accessor: "created",
                id: 'created',
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '50px',
                actionList: [
                    {
                        id: 0,
                        label: 'View',
                        value: '1',
                        key: 'view'
                    },
                ]
            },
        ]
    }

    handleOnSelectFilterSelector = (option) => {
        this.setState({ status_filter_value: option })
        this.setState({ page: 0 })
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {

        const FilterOptions = [
            {
                value: 'all',
                label: 'All'
            },
            {
                value: '1',
                label: 'SMS'
            },
            {
                value: '2',
                label: 'Email'
            },
            {
                value: '3',
                label: 'Phone'
            }
        ]
        return (
            <React.Fragment>

                <PageHeaderControl>
                    <span>
                        <SLDSReactSelect
                            simpleValue={true}
                            className={"SLDS_custom_Select default_validation slds-select status_type"}
                            searchable={false}
                            placeholder="Please Select"
                            clearable={false}
                            required={true}
                            disabled={this.state.filter_panel_display_status}
                            id={'status_type'}
                            options={FilterOptions}
                            onChange={this.handleOnSelectFilterSelector}
                            value={this.state.status_filter_value}
                        />
                    </span>
                    <Button id="btn-new" label="Download selected logs" onClick={e => this.csvDownload()} />
                </PageHeaderControl>
            </React.Fragment>
        )
    }
/*
    is_filter_panel_status = (filter_panel_display_status) => {
        this.setState({ filter_panel_display_status });
    }
*/
    refreshListView() {
        this.setState({ refreshListView: !this.state.refreshListView })
    }

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection: [], row_selections:[] });
    }

    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
        this.setState({ selection: data.selection, checkedItem: selection_count }, (e) => {
            this.handleCheckboxSelect(e);
        });
    };

    /**
     * when checkboxes are clicked inside the data table
     */
    handleCheckboxSelect = (e) => {
        let data = this.state.selection;
        let tempArr = [];
        var copy_disabled = false;
        for (let i = 0; i < data.length; i++) {
            tempArr.push(data[i].id);
            if (data[i].roster_id && data[i].roster_id !== '') {
                copy_disabled = true;
            }
        }
        this.setState({ row_selections: tempArr, copy_disabled: copy_disabled });
    }

    is_filter_panel_status = (filter_panel_display_status) => {
        this.setState({ filter_panel_display_status });
    }

    /**
     * Open view page
     */
    showModal = (item, action) => {
        if (action === 'view') {
            this.openCloseView(item);
        }
    }

    openViewModal = (item) => {
        this.openCloseView(item);
    }

    openCloseView = (item) => {
        this.setState({ isViewOpen: !this.state.isViewOpen, viewData: item }, () => {
            this.renderViewModal();
        });
    }


    renderViewModal() {
        return (
            <React.Fragment>
                <ViewTemplate size={'medium'} isOpen={this.state.isViewOpen} heading={false} data={this.state.viewData} close={() => this.openCloseView()} />
            </React.Fragment>
        );
    }

    render() {

        const columns = [
            {
                id: "from",
                accessor: "from",
                headerClassName: 'Th_class_d1 header_cnter_tabl checkbox_header',
                className: 'Tb_class_d1 Tb_class_d2',
                Cell: props => {
                    return (
                        <span>
                            <label className="Cus_Check_1">
                                <input type='checkbox' checked={this.state.selected[props.original.id] === true} onChange={() => this.toggleRow(props.original.id)} />
                                <div className="chk_Labs_1"></div>
                            </label>
                            <div> {defaultSpaceInTable(props.value)}<span onClick={() => this.toggleRow(props.original.id)}  ></span></div>
                        </span>

                    );
                },
                Header: x => {
                    return (
                        <div className="Tb_class_d1 Tb_class_d2 w-100">
                            <span>
                                <label className={"Cus_Check_1 " + (this.state.selectAll === 2 ? "minus_select__" : '')}>
                                    <input type='checkbox' checked={this.state.selectAll === 1} ref={input => {
                                        if (input) { input.indeterminate = this.state.selectAll === 2 }
                                    }}
                                        onChange={() => this.toggleSelectAll()} />
                                    <div className="chk_Labs_1"></div>
                                </label>
                                <div>From:</div>

                            </span>
                        </div>
                    );
                },
                resizable: false,
                sortable: false,
            },
            {
                id: "To",
                accessor: "to_email",
                sortable: false,
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">To:</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span> {defaultSpaceInTable(props.value)}</span>
            },
            {

                accessor: "log_type",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Type:</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{props.original.log_type}</span>,
                width: 120
            }, {

                accessor: "title",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Title:</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span>{(props.original.title)}</span>,
                width: 230
            },
            {
                accessor: "created",
                headerClassName: '_align_c__ header_cnter_tabl',
                Header: () =>
                    <div>
                        <div className="ellipsis_line__">Sent:</div>
                    </div>,
                className: '_align_c__',
                Cell: props => <span> {(props.value)}</span>,
                width: 230
            },
            {
                headerClassName: '_align_c__ header_cnter_tabl',
                className: '_align_c__',
                width: 50,
                resizable: false,
                headerStyle: { border: "0px solid #fff" },
                expander: true,
                accessor: "created",

                Cell: props => <span> {(props.value)}</span>,
                Expander: (props) =>
                    <div className="expander_bind">
                        <span>{props.original.sent}</span>
                        {props.isExpanded
                            ? <i className="icon icon-arrow-down icn_ar1" style={{ fontSize: '13px' }}></i>
                            : <i className="icon icon-arrow-right icn_ar1" style={{ fontSize: '13px' }}></i>}
                    </div>,
                style: {
                    cursor: "pointer",
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }
            }
        ]
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })

        return (

            <React.Fragment>

                <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                    <DataTableListView
                        page={this.state.page}
                        page_name="All Communication Logs"
                        header_icon="date_input"
                        icon_style={{ display: 'inherit' }}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            communicationFilterOptions
                        }
                        list_api_url="recruitment/RecruitmentDashboard/get_communication_log"
                        list_api_callback={(dataRows) => this.list_api_url(dataRows)}
                        default_filter_logic="1 AND 2"
                        filter_title="Communication Logs"
                        show_filter={false}
                        check_default="all"
                        determine_columns={() => this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        filtered={false}
                        selectRows="checkbox"
                        sortColumnLabel="ID"
                        sortColumn="id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}
                        is_filter_panel_status={this.is_filter_panel_status}
                        status_filter_value={this.state.status_filter_value}
                        get_default_pinned_data={false}
                        is_list_view_control={false}
                        show_filter_icon={false}
                        is_header_info={false}
                        showModal={this.showModal}
                        listToOpenModal={true}
                        opencloseModal={this.openViewModal}
                        applicant_id={this.state.applicant_id}
                        trail = {this.state.applicant_id && [
                            <Link to={ROUTER_PATH + `admin/recruitment/applicant/${this.state.applicant_id}/`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>{this.state.applicant_name || ""}</Link>
                        ] || false}
                    />
                  
    
    

                    {this.state.isViewOpen && this.renderViewModal()}
                </div>
            </React.Fragment>

        );
    }
}


const mapStateToProps = state => ({
    showPageTitle: state.RecruitmentReducer.activePage.pageTitle,
    showTypePage: state.RecruitmentReducer.activePage.pageType
})

const mapDispatchtoProps = (dispach) => {
    return {

    }
}
export default connect(mapStateToProps, mapDispatchtoProps)(CommunicationsLogs);