import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import Pagination from "service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { Redirect } from 'react-router';
import { showArchiveGoalModal, openAddEditGoalModal } from '../ItemCommon';
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
import { Next } from 'react-bootstrap/lib/Pagination';

/**
 * RequestData get the list of goals
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (id, pageSize, page, sorted, filtered,is_sa=false) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered,is_sa };
        postData('item/Goals/get_goals_list', Request).then((result) => {
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
 * Class: ListGoals
 */
class ListGoals extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'goal': true,
            'participant': true,
            'service_type':true,
            'start_date': true,
            'end_date': true,
            'actions': true
        },
        part_displayed_columns: {
            'goal': true,
            'service_type':true,
            'start_date': true,
            'end_date': true,
            'actions': true
        }
    }

    constructor(props) {
        super(props);
        
        var displayed_columns = ''
        let participant_id = '';
        let service_agreement_id=null;
        let is_service_agreement_goal=false;
        if(props.sa_goal)
        {
            is_service_agreement_goal=true;
            service_agreement_id=props.match.params.id
            displayed_columns = Object.keys(props.part_displayed_columns).filter(k => !!props.part_displayed_columns[k])
        }
        else{
            if(props.match && props.match.params.id > 0) {
                participant_id = props.match.params.id;
                displayed_columns = Object.keys(props.part_displayed_columns).filter(k => !!props.part_displayed_columns[k])
            }
            else {
                displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
            }
        }
       
       
        
        // Initialize state
        this.state = {
            participant_id: participant_id,
            goal_id: '',
            searchVal: '',
            filterVal: '',
            paticipantList: [],
            filter_status: 'all',
            openEditModal: false,
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateModal: false,
            service_agreement_id:service_agreement_id,
            is_service_agreement_goal:is_service_agreement_goal,
            goalsList:[]
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * Fetch participant details
     */
    get_participant_details = (request) => {
        this.setState({ loading: true})

        postData('item/participant/get_participant_detail_by_id', request)
            .then((result) => {
                if (result.status) {
                    this.setState({ ...result.data })
                } else {
                    console.error('Could not fetch role details')
                }
            })
            .catch(() => console.error('Could not fetch role details'))
            .finally(() => this.setState({ loading: false }))
    }
   
    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.state.is_service_agreement_goal==true?this.state.service_agreement_id:this.state.participant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            this.state.is_service_agreement_goal
        ).then(res => {
            this.setState({
                goalsList: res.rows,
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
     * Open create goals modal
     */
    showModal(goal_id) {
        this.setState({ openCreateModal: true, goal_id: goal_id });
    }

    /**
     * 
     */
    showArchiveModal(goal_id) {
        showArchiveGoalModal(goal_id, this.setTableParams);
    }
    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.participant_id) {
            this.get_participant_details({participant_id: this.state.participant_id});
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={e => this.showModal()} />
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * Close the modal when user save the goals and refresh the table
     * Get the Unique reference id
     */
    closeAddEditGoalModal = (status, goalsId) => {
        this.setState({openCreateModal: false});

        if(status){
            if (goalsId) {
                this.setState({ redirectTo: ROUTER_PATH + `admin/item/goals/details/`+ goalsId });
            } else {
                reFreashReactTable(this, 'fetchData');
            }
        }
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
                    id="Goals-search-1"
                    placeholder="Search Goals"
                />
            </form>
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
        columns = columns.filter(col => (col.accessor != "actions"));
        const mapColumnsToOptions = columns.map(col => {
            return ({ 
                value: 'id' in col ? col.id : col.accessor,
                label: col._label,
            })
        })

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
            </React.Fragment>
        )
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        var columns = [
            {
  
                _label: 'Participant',
                accessor: "participant",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <Link to={ROUTER_PATH + `admin/item/participant/details/${props.original.participant_master_id}`}
                        className="vcenter default-underlined slds-truncate"
                        style={{ color: '#0070d2' }}
                    >
                        {defaultSpaceInTable(props.value)}
                    </Link>
                )
            },
          
            {
                _label: 'Goal',
                accessor: "goal",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (<Link to={ROUTER_PATH + `admin/item/goals/details/${props.original.id}`} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>{defaultSpaceInTable(props.value)}</Link>)
            },
            {
  
                _label: 'Service Type',
                accessor: "service_type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span  className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                )
            },
            {
                _label: 'Start Date',
                accessor: "start_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }        
            },
            {
                _label: 'End Date',
                accessor: "end_date",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    if (!props.value) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    const dateMoment = moment(props.value)
                    if (!dateMoment.isValid()) {
                        return <span className="vcenter slds-truncate"></span>
                    }

                    let tooltip = dateMoment.format('dddd, DD MMMM YYYY')
                    let value = dateMoment.format('DD/MM/YYYY')

                    return (
                        <span className="slds-truncate" title={tooltip}>{defaultSpaceInTable(value)}</span>
                    )
                }
            },
            {
                _label: 'Actions',
                accessor: "actions",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => <Dropdown
                assistiveText={{ icon: 'More Options' }}
                iconCategory="utility"
                iconName="down"
                align="right"
                iconSize="small"
                iconVariant="border-filled"
                onSelect={(e) => {
                    if(e.value == 1){ //edit
                        this.showModal(props.original.id)
                    }
                    else { // delete
                        this.showArchiveModal(props.original.id)
                    }
                }}
                className={'slds-more-action-dropdown'}
                options={[
                    { label: 'Edit', value: '1' },
                    { label: 'Delete', value: '2' },
                ]}
            />
            }
        ]

        // skip columns
        if(this.state.participant_id > 0) {
            var columns = columns.filter(col => (col.accessor || col.id) != "participant")
        }
        if(this.state.service_agreement_id>0){
            var columns = columns.filter(col => (col.accessor || col.id) != "service_type")
        }
        return columns;
    }

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();
        if(this.state.participant_id||this.state.service_agreement_id) {
            let trail;
            if(this.state.service_agreement_id&&this.state.goalsList.length>0)
            {
                trail= [
                    <Link to ={ROUTER_PATH + `admin/crm/serviceagreements`}  className="default-underlined slds-truncate"  style={{ color: '#0070d2' }} >ServiceAgreement</Link>,
                    <Link to ={ROUTER_PATH + `admin/crm/serviceagreements/`+this.state.service_agreement_id}  className="default-underlined slds-truncate" style={{ color: '#0070d2' }}> { 'ServiceAgreement For' +' ' + this.state.goalsList[0]['service_type']}</Link>,
                ];
            }
            else if(this.state.participant_id){
                trail= [
                    <Link to={ROUTER_PATH + `admin/item/participant`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>
                        {this.state.is_service_agreement_goal&&( <span>ServiceAgreement</span>)}
                        {!this.state.is_service_agreement_goal&&( <span>Participant</span>)}
                      
                        </Link>,
                    <Link to={ROUTER_PATH + `admin/item/participant/details/` + 
                    this.state.participant_id} className="default-underlined slds-truncate" 
                    style={{ color: '#0070d2' }}>{this.state.name}</Link>,
                ];
    
            }
         

            return (
                <React.Fragment>
               {trail &&(<PageHeader
                    trail={trail}
                    onRenderActions={this.handleOnRenderActions}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title={this.state.is_service_agreement_goal?"Service Agreement Goals" :"Participant Goals"}
                    label=" "
                    truncate
                    variant="related-list"
                />)}
                </React.Fragment>
            )
        }
        else {
            return (
                <React.Fragment>
                <PageHeader
                    icon={
                        <Icon
                            assistiveText={{
                                label: 'Goals',
                            }}
                            category="standard"
                            name="goals"
                            style={{
                                backgroundColor: '#56aadf',
                                fill: '#ffffff',
                            }}
                            title="Goals"
                        />
                    }
                    onRenderActions={this.handleOnRenderActions}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title="Goals"
                    label={<span />}
                    truncate
                    variant="object-home"
                />
                </React.Fragment>
            )
        }
    }
    
    /**
     * Render the display content
     */
    render() {
        // This will only run when user create goals
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
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        {this.renderHeader()}
                        <SLDSReactTable
                            PaginationComponent={() => false}
                            ref={this.reactTable}
                            manual="true"
                            loading={this.state.loading}
                            pages={this.state.pages}
                            onFetchData={this.fetchData}
                            filtered={this.state.filtered}
                            defaultFiltered={{ filter_status: 'all' }}
                            columns={displayedColumns}
                            data={this.state.goalsList}
                            defaultPageSize={9999}
                            minRows={1}
                            getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                            onPageSizeChange={this.onPageSizeChange}
                            noDataText="No Record Found"
                            collapseOnDataChange={true}
                            resizable={true}                                     
                        />
                    </IconSettings>
                </div>
                {openAddEditGoalModal(this.state.goal_id, this.state.participant_id, this.state.openCreateModal, this.closeAddEditGoalModal,this.state.participant_id>0?true:false,this.state.service_agreement_id>0?this.state.service_agreement_id:null,this.state.goalsList.length>0?this.state.goalsList[0]['service_type']:'')}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListGoals);
