import {
    Button,
    Dropdown,
    DropdownTrigger, Icon, IconSettings,
    Input,
    InputIcon,PageHeader,
    PageHeaderControl
} from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { css, postData } from 'service/common.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable';
import './../../../scss/components/admin/crm/pages/contact/ListContact.scss';
/**
 * RequestData get the list of goals
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (participant_id, pageSize, page, sorted, filtered,) => {
    return new Promise((resolve, reject) => {
        // request json
        var Request = { participant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('item/Goals/get_tracked_goals_by_participant', Request).then((result) => {
            if (result.length>0) {
                let filteredData = result;
                const res = {
                    rows: filteredData,
                    pages: (result.length)
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
 * Class: ViewAllTrackedGoals
 */
class ViewAllTrackedGoals extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'goal': true,
            'snapshot': true,
            'service_type':true,
            'shift_no':true,
            'action':true,
            'date_submitted':true,
            'member_name':true,
        },
      
    }

    constructor(props) {
        super(props);
        // Initialize state
        let participant_id='';
        let displayed_columns=[];
        if(props.match && props.match.params.id > 0) {
            participant_id = props.match.params.id;
            displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        }
        this.state = {
            participant_id:participant_id,
            searchVal: '',
            filterVal: '',
            filter_status: 'all',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            goalsList:[],
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
            this.state.participant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
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
        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Button label="New" onClick={e => this.showModal()} />
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
        return [
            {
                _label: 'Goal',
                accessor: "goal",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (<Link to={ROUTER_PATH + `admin/item/goals/details/${props.original.goal_id}`} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>{defaultSpaceInTable(props.value)}</Link>)
            },
            {
                _label: 'Snapshot',
                accessor: "snapshot",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
            },
            {
                _label: 'Service Type',
                accessor: "service_type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Shift Id',
                accessor: "shift_no",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (<Link to={ROUTER_PATH + `admin/schedule/details/${props.original.shift_id}`} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>{defaultSpaceInTable(props.value)}</Link>)
            },
            {
                _label: 'Action',
                accessor: "action",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Submitted On',
                accessor: "date_submitted",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Member',
                accessor: "member_name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (<Link to={ROUTER_PATH + `admin/support_worker/details/${props.original.member_id}`} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>{defaultSpaceInTable(props.value)}</Link>)
            }
        ]
    }


    

    /**
     * render header part
     */
    renderHeader() {
        const columns = this.determineColumns();
        if(this.state.participant_id) {
          const  trail= [
                    <Link to={ROUTER_PATH + `admin/item/participant`} className="default-underlined slds-truncate" style={{ color: '#0070d2' }}>
                        Participant
                        </Link>,
                    <Link to={ROUTER_PATH + `admin/item/participant/details/` + 
                    this.state.participant_id} className="default-underlined slds-truncate" 
                    style={{ color: '#0070d2' }}>{this.state.goalsList.length>0?this.state.goalsList[0]['participant_name']:''}</Link>,
                ];
    
            
         

            return (
                <React.Fragment>
               {trail &&(<PageHeader
                    trail={trail}
                    onRenderControls={this.handleOnRenderControls({ columns })}
                    title={"Participant  Tracked Goals"}
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
               
            </React.Fragment>
        )


    }
    

}


export default ViewAllTrackedGoals;
