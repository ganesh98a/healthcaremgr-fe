import { Button, IconSettings, PageHeaderControl, Toast, ToastContainer } from '@salesforce/design-system-react';
import { BASE_URL } from "config.js";
import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { css, postData } from 'service/common.js';
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss';
import { openAddEditChargerateModal, openImportChargeRateModal, showArchiveChargerateModal } from "../FinanceCommon";
const queryString = require('query-string');

/**
 * to get the main list from back-end
 */
const requestData = (pageSize, page, sorted, filtered) => {
    return new Promise((resolve, reject) => {
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('finance/FinanceDashboard/get_charge_rates_list', Request).then((result) => {
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

const chargeFilterOptions = [
    { value: "Category", label: "Category", field:"charge_rate_category_label"},
    { value: "Pay Level", label: "Pay Level" , field:"pay_level_label"},
    { value: "Skill", label: "Skill" , field:"skill_level_label"},
    { value: "Cost Book", label: "Cost Book" , field:"cost_book_label"},
    { value: "Amount", label: "Amount" , field:"amount"},
    { value: "Start Date", label: "Start Date" , field:"start_date"},
    { value: "End Date", label: "End Date" , field:"end_date"}
    
]
class Chargerates extends Component {

    /**
     * default displayed columns in the listing
     */
    static defaultProps = {
        displayed_columns: {
            "charge_rate_category_label": true,
            "pay_level_label": true,
            "skill_level_label": true,
            "cost_book_label": true,
            "amount": true,
            "status_label": true,
            "end_date": true,
            "start_date": true,
            "actions": true
        }
    }

    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            openCreateModal: false,
            openImportModal: false,
            show_toast: false,
            error_msg: '',
            data_msg: '',
            status: '',
            import_id: '',
            charge_rate_id: '',
            chargerates_list: [],
            default_displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            displayed_columns: Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k]),
            refreshListView:false
        }
        
    }

    /**
     * to fetch the filtered data by setting required props and calling the request data function
     */
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                chargerates_list: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * mounting all the components
     */
    componentDidMount() {
      
    }

    /**
     * Open create chargerate modal
     */
    showModal=(charge_rate_id,action='') =>{
        console.log('action',action,charge_rate_id)
       
        if(action==='edit')
        { 
            
            this.setState({ openCreateModal: true, charge_rate_id: charge_rate_id.id });
            return;
        }
        else if(action==='delete')
        { 
           
            this.showArchiveModal(charge_rate_id.id);
            return;
        }else{
            this.setState({ openCreateModal: true})
        }
       
      
      
    }

    /**
     * Open archive chargerate modal
     */
    showArchiveModal(charge_rate_id) {
        showArchiveChargerateModal(charge_rate_id, this.setTableParams);
    }

    /**
     * Open import chargerates modal
     */
    showImportModal() {
        this.setState({ openImportModal: true });
    }

    /**
     * Close the import modal
     */
    closeImportModal = (status, import_id, data_msg, error_msg) => {
        this.setState({openImportModal: false});

        if(status){
            this.setState({show_toast: true, import_id: import_id, data_msg: data_msg, error_msg: error_msg});
            this.setTableParams();
        }
    }

    /**
     * hanlding quick search submission
     * @param {*} e 
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * setting the filtering parameters before calling the back-end function
     */
    setTableParams = () => {
        var search_re = { search: this.state.search,  filters: this.state.selectedfilval};
        this.setState({ filtered: search_re });
        this.refreshListView();
    }
    handleOnRenderActions = () => {
        
        return (
            <React.Fragment>
                <PageHeaderControl>
                                   <Button label="New" onClick={() => this.showModal()} />
                                    <Button label="Import" onClick={() => this.showImportModal()} />
                   
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }
    /**
     * setting the column headers in the listing table
     */
     determineColumns() {
        return [
            {
                _label: 'Category',
                accessor: "charge_rate_category_label",
                id: 'charge_rate_category_label'
               
            },
            {
                _label: 'Pay Level',
                accessor: "pay_level_label",
                id: 'pay_level_label'
               
            },
            {
                _label: 'Skill',
                accessor: "skill_level_label",
                id: 'skill_level_label'
            },
            {
                _label: 'Cost Book',
                accessor: "cost_book_label",
                id: 'cost_book_label'
            },
            {
                _label: 'Amount',
                accessor: "amount",
                id: 'amount'
            },
            {
                _label: 'Start Date',
                accessor: "start_date",
                id: 'start_date'
            },
            {
                _label: 'End Date',
                accessor: "end_date",
                id: 'end_date'
            },
            {
                _label: 'Action',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '70px',
                actionList : [
                    {
                        id: 0,
                        label: 'Edit',
                        value: '1',
                        key: 'edit'
                    },
                    {
                        id: 1,
                        label: 'Delete',
                        value: '2',
                        key: 'delete'
                    },
                ]
             
            }
        ]
    }

   
    /**
     * Close the modal when user save the chargerate and refresh the table
     */
    closeAddEditChargerateModal = (status) => {
        this.setState({openCreateModal: false});

        if(status){
            this.setTableParams();
        }
    }

    /***
     * Reset selection List
     */
     resetSelection() {
        this.setState({ selection:[], row_selections:[] });
    }

    handleChanged = (event, data) => {
        let dataSelection = data.selection;
        let selection_count = dataSelection.length;
		this.setState({ selection: data.selection, checkedItem: selection_count } , (e) => {
            this.handleCheckboxSelect(e);
        });
	};

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

        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.id || col.accessor) >= 0);

        return (
            <React.Fragment>
            <div className="ListContact slds" style={styles.root} ref={this.rootRef}>
                {this.state.show_toast ? <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <ToastContainer>
                        <Toast
                            labels={{
                                heading: [
                                    this.state.data_msg,
                                ],
                                headingLink: this.state.error_msg ? 'Download' : '',
                            }}
                            onClickHeadingLink={() => {
                                const import_id = this.state.import_id;
                                window.location=BASE_URL + "finance/FinanceDashboard/download_import_stats?id=" + import_id;
                            }}
                            onRequestClose={() => {
                                this.setState({show_toast: false})
                            }}
                            variant="info"
                            className="toastdiv"
                        />
                    </ToastContainer>
                </IconSettings> : ''}

                 <DataTableListView
                        page_name="Charge Rate"
                        header_icon="file"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            chargeFilterOptions
                        }
                        list_api_url="finance/FinanceDashboard/get_charge_rates_list"
                        related_type="charge_rates"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Charge Rates"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}   
                        sortColumnLabel="start date"
                        sortColumn="start_date"
                        selection={this.state.selection}
                        resetSelection={this.resetSelection.bind(this)}
                       selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshListView}
                        show_filter_icon = {true}
                        showModal={this.showModal}
                    />
            </div>

            {openAddEditChargerateModal(this.state.charge_rate_id, this.state.openCreateModal, this.closeAddEditChargerateModal)}

            {openImportChargeRateModal(this.state.openImportModal, this.closeImportModal)}

            </React.Fragment>
        );
    }
}
export default Chargerates;