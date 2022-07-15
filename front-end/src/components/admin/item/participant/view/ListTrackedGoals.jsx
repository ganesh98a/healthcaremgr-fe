import {  Card, Icon} from '@salesforce/design-system-react';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from 'config.js';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { css,postData } from 'service/common.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable';
import './../../../scss/components/admin/crm/pages/contact/ListContact.scss';

/**
 * Class: ListTrackedGoals
 */
class ListTrackedGoals extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            tracked_goals_list: [],
            tracked_goals_count: 0,
            openCreateModal: false,
            pageSize: 6,
            page: 0,
            sorted: [],
            filtered: [],
            isUpdate:false,
            id_to_update:null,
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /**
     * fetching the goals entered by  members
     */
    get_participant_tracked_goals = (id) => {
        var Request = { participant_id :this.props.participant_id,pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('item/Goals/get_tracked_goals_by_participant', Request).then((result) => {
         console.log('result',result)
                this.setState({tracked_goals_list: result, tracked_goals_count: result.length});
         
        });
    } 
    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        this.get_participant_tracked_goals();
    }
    
    /**
     * Table columns
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
                _label: 'Outcome',
                accessor: "outcometype",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
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
     * Render the participant tracked goals table
     */
    renderTable() {
        const displayedColumns = this.determineColumns();

        if (this.state.tracked_goals_count == 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => <React.Fragment></React.Fragment>}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                filtered={this.state.filtered}
                columns={displayedColumns}
                data={this.state.tracked_goals_list}
                defaultPageSize={6}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={true} 
                style={{border:'none'}}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.tracked_goals_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="custom-card-footer">
                <Link className="slds-align_absolute-center default-underlined" 
                id="view-all-member-submitted-goals" 
                title="View all" to={ROUTER_PATH + `admin/item/trackedgoals/${this.props.participant_id}`} style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }

    /**
     * Render the display content
     */
    render() {

        if (this.state.tracked_goals_count == 0) {
            return <React.Fragment />
        }
        const styles = css({
            card: {

                border: '1px solid #dddbda',
                boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)',
            }
        });
        return (
            <React.Fragment>
                <div className=" slds-m-top_medium">
                <div className="slds-grid slds-grid_vertical">
                <Card
               
                heading={"Goal Tracking"}
                className="slds-card-bor"
                style={styles.card}
                icon={<Icon category="standard" size="small"  name="goals"
                    style={{
                        backgroundColor: '#ea7600',
                        fill: '#ffffff',
                    }} />}
                bodyClassName="body-no-padding"
                >
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
            
               </div>
               </div>
            </React.Fragment>
        )
    }
}

export default ListTrackedGoals;
