import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, css } from 'service/common.js';
import '../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';

import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable'
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
} from '@salesforce/design-system-react';
import { openAddEditShiftModal } from '../../../schedule/ScheduleCommon';

import '../../../scss/components/admin/member/member.scss';

/**
 * RequestData get the list of shift 
 * @param {int} pageSize
 * @param {int} page
 * @param {int} sorted
 * @param {int} filtered
 */
const requestData = (participant_id,pageSize, page, sorted, filtered, page_name) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { participant_id: participant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered, page_name:page_name };
            postData('schedule/Roster/get_associated_shift_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    record_count: result.record_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    record_count: 0
                };
                resolve(res);
            }

        });

    });
};

/**
 * Class: ParticipantShiftCard
 */
class ParticipantShiftCard extends Component {

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            record_count: 0,
            openCreateModal: false,
            searchVal: '',
            filterVal: '',
            recordList: [],
            pageSize: 6,
            page: 0,
            shift_id: '',
            participant_id: this.props.participant_id,
            page_name: this.props.page_name ? this.props.page_name : '',
            sorted:'Desc',
            last_created_id:null,
            warningStatus:[],
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {
        if(this.state.page_name){
            this.fetchRecordData(this.state);
        }
    }

    /**
     * Call the requestData
     * @param {temp} state
     */
    fetchRecordData = (state) => {
        this.setState({ loading: true });
        requestData(
            this.state.participant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            state.page_name,
        ).then(res => {
            this.setState({
                recordList: res.rows,
                record_count: res.record_count,
                pages: res.pages,
                loading: false
            });
        });
    }

     /**
     * Open archive quiz modal
     */
      showModal(id) {
        this.setState({ openCreateModal: true, shift_id: id });
    }
    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        const styles = css({
            hyperlink: {
                color: 'rgb(0, 112, 210)'
            },
            lineHeight: {
                lineHeight: '1.75',
                color: '#0070d2'
            }
        });

        const shiftWarnStatusHandler=(index,status)=>{
            let warnStatus=this.state.warningStatus;
            warnStatus[index]=status;
            this.setState({warningStatus:warnStatus})
        }
        return [
            {
                _label: 'Shift',
                accessor: "shift_no",
                className: "slds-tbl-card-td-link-hidden",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    let warningIcon = '';
                    let shiftWarningPopup='';
                    if(props.original.account_type == 1 && props.original.role_name == 'NDIS' && props.original.warnings.is_warnable  == 1) {
                        warningIcon = <span onMouseEnter={(e)=>{shiftWarnStatusHandler(props.index,true)}} onMouseLeave={(e)=>{shiftWarnStatusHandler(props.index,false)}} ><Icon category="utility" name="warning"  size="x-small" style={{'marginRight':10+'px','fill':'#eed202'}} /></span>
                    }
                    if(props.original.account_type == 1 && props.original.role_name == 'NDIS' && props.original.warnings.is_warnable == 1)
                    {
                        if(this.state.warningStatus[props.index]){
                            shiftWarningPopup=
                         <section aria-label="Dialog title" aria-describedby="popover-body-id" class="slds-popover slds-nubbin_top-left" role="dialog" 
                               style={{zIndex:1, position: 'absolute', left: 93+'px',top: 38+'px' , width:370+'px'}}>
                        <div id="popover-body-id" class="slds-popover__body">
                       <br/>
                     <ul>
                 { props.original.warnings.warning_messages.map((item)=>
                          <li> <Icon category="utility" name="warning" style={{'marginRight':5+'px','fill':'#eed202','width':'1rem','height':'1rem'}} /><span style={{'fontSize':11+'px'}}>{item}</span></li>
                  )}
                  </ul>
                 </div>
                   </section> 
                        }   
                    }
                    
                    return (<React.Fragment>
                    <Link to={ROUTER_PATH + `admin/schedule/details/${props.original.id}`} className="reset" style={styles.lineHeight}>
                                    {defaultSpaceInTable(props.value)}
                                </Link> <span title={props.original.shift_no}>{warningIcon}</span>  
                               
                                {shiftWarningPopup}
                                </React.Fragment>
                                );
                }
            },
            {
                _label: 'Roster ID',
                accessor: "roster_no",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <Link to={ROUTER_PATH + `admin/schedule/roster/${props.original.roster_id}`} className="reset" style={styles.lineHeight}>
                            {defaultSpaceInTable(props.value)}
                        </Link>
                }
            },
            {
                _label: 'Member',
                accessor: "member_fullname",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => 
                    <Link to={ROUTER_PATH + `admin/support_worker/details/${props.original.member_id}/`} 
                    className="reset" style={styles.lineHeight}>
                        {props.value}
                    </Link>
            },
            {
                _label: 'Status',
                accessor: "status_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Scheduled start time',
                accessor: "scheduled_start_datetime",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>,
            },
            {
                _label: 'Scheduled end time',
                accessor: "scheduled_end_datetime",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable((moment(props.value).format("DD/MM/YYYY HH:mm")))}</span>,
            },
            {
                _label: 'Action',
                accessor: "",
                className: "slds-tbl-card-td slds-tbl-card-td-dd slds-ma-wxh",
                sortable: false,
                width: 75,
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: (props) =>
                <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    iconVariant="border-filled"
                    onSelect={() => {
                        this.showModal(props.original.id)
                    }}
                    className={'slds-more-action-dropdown'}
                    options={[
                        { label: 'Edit', value: '1' },
                    ]}
                />,
            },
        ]
    }

    /**
     * Render shift table if count greater than 0
     */
    renderTable() {
        if (Number(this.state.record_count) === 0) {
            return <React.Fragment />
        }

        return (
            <React.Fragment>
                {this.state.page_name && <SLDSReactTable
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.recordList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
            />}
            </React.Fragment>
            
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (Number(this.state.record_count) === 0) {
            return <React.Fragment />
        }

        return (
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/item/participant/shift/${this.props.participant_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>
        );
    }

    /**
     * Render modals
     * - Create Shift
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    openAddEditShiftModal(this.state.shift_id, this.state.openCreateModal, this.closeAddEditShiftModal, undefined, this.props.rosterDetails, this.state.page_name)
                }
            </React.Fragment>
        )
    }

    /**
     * Close the modal when user save the shift and refresh the table
     */
     closeAddEditShiftModal = (status,id=null) => {
        this.setState({openCreateModal: false, shift_id: '',last_created_id:id});

        if(status){
                this.fetchRecordData(this.state);
        }
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={<Button label="New" disabled={Number(this.props.stage) > 1 || false} onClick={() => this.setState({ openCreateModal: true }) }/>}
                        heading={Number(this.state.record_count) > 6 ? "Shifts (6+)" : "Shifts ("+this.state.record_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="date_input" size="small" />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                    {this.renderModals()}
                </IconSettings>
                <input type="hidden" id="last_created_id" value={this.state.last_created_id}/>
            </React.Fragment>
        );
    }
}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default ParticipantShiftCard;
