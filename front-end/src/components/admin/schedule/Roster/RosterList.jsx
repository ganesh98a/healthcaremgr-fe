import React, { Component } from 'react';
import { connect } from 'react-redux'
import { postData, reFreashReactTable, checkLoginWithReturnTrueFalse, getPermission, css, handleChange, toastMessageShow, remove_access_lock } from 'service/common.js';
import jQuery from 'jquery';
import { ROUTER_PATH } from 'config.js';
import moment from "moment";
import PropTypes from 'prop-types';
import Datepicker from '@salesforce/design-system-react/lib/components/date-picker';
import SLDSReactSelect from '../../salesforce/lightning/SLDSReactSelect'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import {IconSettings,PageHeader,PageHeaderControl,Icon,ButtonGroup,Button,Dropdown,DropdownTrigger,Input,InputIcon,Modal} from '@salesforce/design-system-react'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx'
import RosterModal from './RosterModal.jsx';
/**
 * to get the main list from back-end
 */
 const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve) => {
        var Request = JSON.stringify({ pageSize: pageSize, page: page, sorted: sorted, filtered: filtered });

        postData('schedule/Roster/get_rosters_list', { request: Request }).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    total_count: result.total_count
                };

                resolve(res);
            }
        });
    });
};

const rostersFilterOptions = [
    { value: "Roster ID", label: "Roster ID", field:"roster_no"},
    { value: "Account", label: "Account" , field:"account"},
    { value: "Roster Type", label: "Roster Type" , field:"roster_type"},
    { value: "Start Date", label: "Start Date" , field:"start_date"},
    { value: "End Date", label: "End Date" , field:"end_date"},
    { value: "Stage", label: "Stage" , field:"stage"},
    { value: "Owner", label: "Owner" , field:"owner"},
    { value: "Status", label: "Status" , field:"status"},
    { value: "Created Date", label: "Created Date" , field:"created"},
    { value: "Created By", label: "Created By" , field:"created_by_label"}
];

class RosterList extends Component {
    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "roster_no": true,
            "roster_type": true,
            "roster_type_label": true,
            "account": true,
            "start_date":true,
            "end_date": true,
            "stage": true,
            "owner": true,
            "status": true,
            "created": true,
            "created_by": true,
            "actions": true
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            filterVal: '',
            roster_list: [],
            row_selections: [],
            weeks_list: [],
            header_checkbox: false,
            openCopyShiftsModal: false,
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            status_option: [{label: 'All', value:0}],
            showselectedfilters: false,
            showselectfilters: false,
            selectfilteroptions: [
                { value: "roster_no", label: "Roster ID", order: "1" },
                { value: "account", label: "Account", order: "3" },
                { value: "roster_type_label", label: "Roster Type", order: "2" },
                { value: "status_label", label: "Status", order: "8" },
                { value: "start_date", label: "Roster Start Date", order: "4" },
                { value: "end_date", label: "Roster End Date", order: "5" },
                { value: "owner", label: "Duration", order: "7" },
                { value: "stage_label", label: "Stage", order: "6" },
                { value: "created", label: "Created Date", order: "9" },
                { value: "created_by_label", label: "Created By", order: "10" },
            ],
            selectfilteroperatoroptions: [
                { value: "equals", label: "Equals to", symbol: "=" },
                { value: "not_equal", label: "Not equal to", symbol: "!=" },
                { value: "less_than", label: "Less than", symbol: "<" },
                { value: "less_than_equal", label: "Less than equal to", symbol: "<=" },
                { value: "greater_than", label: "Greater than", symbol: ">" },
                { value: "greater_than_equal", label: "Greater than equal to", symbol: ">=" },
                { value: "contains", label: "Contains", symbol: "%.%" },
                { value: "not_contain", label: "Does not contain", symbol: "!%.%" },
                { value: "starts_with", label: "Starts with", symbol: "%" }
            ],
            rosterModalOpen: false,
            stage_option: [
                { value: "1", label: "Open", order: "1" },
                { value: "2", label: "Finalize", order: "2" },
                { value: "3", label: "In progress", order: "3" },
                { value: "4", label: "Completed", order: "4" },
            ],
            modalHeading: 'Create',
            roster_type_options: [],
        }
        this.permission = (checkLoginWithReturnTrueFalse()) ? ((getPermission() == undefined) ? [] : JSON.parse(getPermission())) : [];
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * showing the filter options selection panel
     */
     showselectfilters = () => {
        this.setState({ showselectfilters: true });
    }

    /**
     * hiding the filter options selection panel
     */
    hideselectfilters = () => {
        this.setState({
            showselectfilters: false,
            select_filter_field: '',
            select_filter_operator: '',
            select_filter_value: ''
        });
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
            this.refreshListView();
            this.setState({
                roster_list: res.rows,
                pages: res.pages,
                loading: false,
            });
        });
    }

    /**
     * mounting all the components
     */
     componentDidMount() {
        this.get_roster_reference_data(); 
    }

    /**
     * fetching the reference data (roster) type & funding type
     */
     get_roster_reference_data = () => {
		postData("schedule/Roster/get_roster_reference_data").then((res) => {
			if (res.status) {
				this.setState({ 
					roster_type_options: (res.roster_type) ? res.roster_type : [],
                    roster_funding_type_options: (res.roster_funding_type) ? res.roster_funding_type : [],
                    roster_end_date_options: (res.roster_end_date_options) ? res.roster_end_date_options : [],
                    owner: (res.owner_selected) ? res.owner_selected : '',
				})
			}
		});
    }


    list_api_url(res) {
        this.setState({
            roster_list: res.rows,
            pages: res.pages,
            loading: false
        });
    }

    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: data.selection, checkedItem: selection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};

    /***
     * Reset selection List
     */
    resetSelection() {
        this.setState({ selection:[], row_selections:[] });
    }

    /**
     * when checkboxes are clicked inside the data table
     */
     handleCheckboxSelect = (e) => {
        let data = this.state.selection;
        let tempArr = [];
        for (let i = 0; i < data.length; i++) {
            tempArr.push(data[i].id);
        }
        this.setState({row_selections: tempArr});
    }

    /**
     * setting the column headers in the listing table
     */
    determineColumns() {
        return [
            {
                _label: 'Roster ID',
                accessor: "roster_no",
                id: 'roster_no',
                CustomUrl: [{url : ROUTER_PATH + 'admin/schedule/roster/PARAM1/'},
                    {custom_value: 'id'},
                    {param : ['id']},
                ],
                width: '150px'
            },
            {
                _label: 'Type',
                accessor: "roster_type_label",
                id: 'roster_type',
            },
            {
                _label: 'Account',
                accessor: "account",
                id: 'account',
                multipleCustomUrl: "roster_account_fullname"
            },
            {
                _label: 'Start Date',
                accessor: "start_date",
                id: 'start_date',
                CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: 'End Date',
                accessor: "end_date",
                id: 'end_date',
                CustomDateFormat: "DD/MM/YYYY"
            },
            {
                _label: 'Stage',
                accessor: "stage_label",
                id: 'stage',
            },
            {
                _label: 'Owner',
                accessor: "owner_label",
                id: 'owner_label',
                // CustomUrl: [{url : ROUTER_PATH + 'admin/member/details/PARAM1/'},
                // {param : ['owner_id']}]
            },            
            {
                _label: 'Status',
                accessor: "status_label",
                id: 'status',
            },            
            {
                _label: 'Created Date',
                accessor: "created",
                id: 'created',
                CustomDateFormat: "DD/MM/YYYY HH:mm"
            },            
            {
                _label: 'Created By',
                accessor: "created_by_label",
                id: 'created_by',
            },
            {
                _label: '',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '50px',
                actionList : [
                    {
                        id: 0,
                        label: 'Edit',
                        value: '1',
                        key: 'edit'
                    },
                    {
                        id: 0,
                        label: 'Deactivate',
                        value: '2',
                        key: 'deactivate'
                    },
                ]
            }
        ]
    }

    /**
     *  action Selection Handler
     */
     actionSelectionHandler(item, key) {
       console.log(item,key,"item, key")
         if(key === "edit"){ 
             this.setState({'edit_data':item},()=>{
                this.showModal('Update',item.id)
             })
           
        }
        else if(key === "delete") { 
            this.showArchiveModal(item.id)
        } 
    }

    /**
     * to close the modal
     */
    closeModal = (status) => {
        this.setState({ openCreateModal: false });
        if (status) {
            this.setState({ is_any_action : true})
            this.refreshListView();
        }
    }

    /**
     * Render page header actions
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" name="roster_create" onClick={() => this.showModal()} />
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }

    /**
     * Render modals
     * - Create Roster
     * - Edit Roster
     * 
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.rosterModalOpen && (
                        <RosterModal
                            showModal = {this.state.rosterModalOpen}
                            closeModal = {this.closeModal}
                            headingTxt = {this.state.modalHeading}
                            reference_id={this.state.roster_id}
                            roster_data={this.state.roster_id!=''?this.state.edit_data:''}
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Roster modal open
     */
    showModal = (heading ='Create',roster_id='') => {
        this.setState({ rosterModalOpen: true, modalHeading: heading, roster_id })
    }

    /**
     * to close the modal
     */
    closeModal = (status) => {
        this.setState({ rosterModalOpen: false });
        if (status) {
            this.setState({ is_any_action : true})
            this.refreshListView();
        }
    }

    render() {
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
                        page_name="Rosters"
                        header_icon="work_plan_template"
                        icon_style={{display:'inherit'}}
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            rostersFilterOptions
                        }
                        list_api_url="schedule/Roster/get_roster_list"
                        list_api_callback = {(dataRows) => this.list_api_url(dataRows)}
                        related_type="roster"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        list_control_option={this.state.list_control_option}
                        filter_title="All Rosters"
                        show_filter={false}
                        check_default="all"
                        is_any_data_pinned={false}
                        determine_columns={()=>this.determineColumns()}
                        on_render_actions={() => this.handleOnRenderActions()}
                        ref={this.reactTable}
                        refresh={this.state.refreshListView}
                        is_any_action={this.state.is_any_action}
                        selectRows="checkbox"
                        sortColumnLabel="ID"
                        sortColumn="id"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        checkedItem={this.state.checkedItem}
                        showModal={(item, key) => this.actionSelectionHandler(item, key)}
                        selectFilterStageoptions={this.state.stage_option}
                        selectFilterRosterTypeoptions={this.state.roster_type_options}
                        />
                </div>
                {this.renderModals()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
})

const mapDispatchtoProps = () => {
    return { }
}

export default connect(mapStateToProps, mapDispatchtoProps)(RosterList);