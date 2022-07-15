import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css } from 'service/common.js';
import { connect } from 'react-redux'
import Pagination from "service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
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
import CreateDocumentModel from './CreateDocumentModel';
import EditDocumentModel from './EditDocumentModel.jsx';
import '../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../scss/components/admin/item/item.scss';
import '../../scss/components/admin/member/member.scss';
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
/**
 * RequestData get the list of document
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('item/Document/get_document_list', Request).then((result) => {
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
const selectDocumentFilterOptions = [
    { field: "title", label: "Document Name", value: "Document Name", order: "1" },
    { field: "issue_date_mandatory", label: "Issue Date Mandatory", value: "issue_date_mandatory", order: "2" },
    { field: "expire_date_mandatory", label: "Expire Date Mandatory", value: "expire_date_mandatory", order: "3" },
    { field: "reference_number_mandatory", label: "Reference Number Mandatory", value: "reference_number_mandatory", order: "4" },
    { field: "active", label: "Active", value: "active", order: "5" }
]

/**
 * Class: ListDocument
 */
class ListDocument extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'title': true,
            'issue_date_mandatory': true,
            'expire_date_mandatory': true,
            'reference_number_mandatory': true,
            'active': true,
            'document_id': false,
            'action': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            documentList: [],
            filter_status: 'all',
            openEditModal: false,
            selection: [],
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false,
            document_id: '',
            refreshListView: false,
            showselectedfilters: false,
            showselectfilters: false,
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
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                documentList: res.rows,
                pages: res.pages,
                loading: false
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
     * Open create document modal
     */
    showModal = (oppId) => {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, documentId) => {
        this.setState({openCreateModal: false});

        if(status){
            if (documentId) {
                this.setState({ redirectTo: ROUTER_PATH + `admin/item/document/details/`+ documentId });
            } else {
                reFreashReactTable(this, 'fetchData');
            }
        }
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewDocument = e => {
            e.preventDefault()
            this.showModal(0);
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/item/documment/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewDocument} id="document-type-new-btn">
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
                    id="Document-search-1"
                    placeholder="Search Document"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let documentStatusFilter = [
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
                options={documentStatusFilter}
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
                    { this.renderSearchForm() }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderStatusFilters() }
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    closeEditModal=()=>{
        this.setState({openEditModal: false}); 
        this.refreshListView();
       }
    closeModal = (status, documentId) => {
        console.log('closed new')
       
                this.setState({openCreateModal: false}); 
                this.refreshListView();
            }
    /**
     * Render modals
     * - Create Document
     * 
     */
     resetSelection() {
        this.setState({ selection:[] }); 
    }

    handleChanged = (event, data) => {
           this.setState({ selection: data.selection });
        };
        showModal = (oppId,actionkey='') => {
            console.log(oppId,'oppId')
            console.log('actionkey',actionkey)
             if(actionkey.trim().length>0)
             {
               
                this.setState({ openEditModal: true, document_id: oppId.document_id });
                return;
             }
            this.setState({ openCreateModal: true });
            
        
    }
    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView});
    
    }
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateModal && (
                        <CreateDocumentModel
                            showModal = {this.state.openCreateModal}
                            closeModal = {this.closeModal}
                            headingTxt = "Create Document"
                        />
                    )
                }
                {
                    this.state.openEditModal && (
                        <EditDocumentModel
                            showModal = {this.state.openEditModal}
                            closeModal = {this.closeEditModal}
                            headingTxt = "Update Document"
                            documentId = {this.state.document_id}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
     determineColumns() {
        return [
            {
                _label: 'Document Name',
                accessor: "title",
                id: 'title',
                CustomUrl: [{url : ROUTER_PATH + `admin/item/document/details/PARAM1`},
                {param : ['document_id']}]
                
               
            },
            {
                _label: 'Issue Date Mandatory',
                accessor: "issue_date_mandatory",
                id: 'issue_date_mandatory'   
            },            
            
            {
                _label: 'Expire Date Mandatory',
                accessor: "expire_date_mandatory",
                id: 'expire_date_mandatory',
            },            
            {
                _label: 'Reference Number Mandatory',
                accessor: "reference_number_mandatory",
                id: 'reference_number_mandatory',
            },
            {
                _label: 'Active',
                accessor: "active",
                id: 'active',
                
            },
            {
                _label: '',
                accessor: "actions",
                id: 'action',
                sortable: false,
                width: '100px',
                actionList : [
                    {
                        id: 0,
                        label: 'Edit',
                        value: '1',
                        key: 'edit'
                    },
                ]
            }
        ]
    }

    /**
     * Open create document modal
     */
    showEditDocumentModal = (docId) => {
        this.setState({ openEditModal: true, document_id: docId });
    }

    /**
     * Close the modal when user save the document and refresh the table
     * Get the Unique reference id
     */
    // closeEditModal = (status, documentId) => {
    //     this.setState({openEditModal: false});

    //     if(status){
    //         reFreashReactTable(this, 'fetchData');
    //     }
    // }

    /**
     * Render the display content
     */
    render() {
        // This will only run when user create document assessment
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
        // return
        return (
            <React.Fragment>
               <DataTableListView
                        page_name="Documents"
                        header_icon="Documents"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectDocumentFilterOptions
                        }
                        
                        list_api_url="item/Document/get_document_list"
                        related_type="document"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Documents"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}   
                        showModal={this.showModal}
                        selection={this.state.selection}
                        sortColumnLabel="Document Name"
                        sortColumn="title"
                        resetSelection={this.resetSelection.bind(this)}
                        selectionHandleChange={this.handleChanged.bind(this)}
                        refresh={this.state.refreshListView}
                        show_filter_icon = {true}
                    />
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListDocument);
