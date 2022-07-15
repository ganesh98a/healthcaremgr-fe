import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, reFreashReactTable, css, AjaxConfirm, toastMessageShow, remove_access_lock } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import SLDSReactTable from '../salesforce/lightning/SLDSReactTable'
import '../scss/components/admin/crm/pages/contact/ListContact.scss'
import { showArchiveShiftMemberModal, openAddShiftMember } from './ScheduleCommon';
import {
    IconSettings,
    PageHeaderControl,
    ButtonGroup,
    Button,
    Icon,
    PageHeader,
    Tabs,
    TabsPanel,
    Card,
    Checkbox,
    Dropdown
} from '@salesforce/design-system-react';

/**
 * Class: ScheduleMembers
 */
class ScheduleMembers extends Component {
    
    /**
     * setting the initial prop values
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            shift_id: this.props.shift_id ? this.props.shift_id : '',
            disabled_members: this.props.disabled_members ? this.props.disabled_members : '',
            shift_member_id: '',
            shift_members_list: [],
            shift_members_count: 0,
            openCreateModal: false,
            pageSize: 6,
            page: 0,
            sorted: [],
            filtered: []
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    get_shift_member_modal = (id) => {
        this.get_shift_member(id);
        this.forceUpdate();
    }

    /**
     * fetching the shift members
     */
    get_shift_member = (id) => {
        var Request = { shift_id: this.state.shift_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered,is_restricted:true };
        postData('schedule/ScheduleDashboard/get_shift_member_list', Request).then((result) => {
            if (result.status) {
                this.setState({shift_members_list: result.data, shift_members_count: result.count},()=>{
                    this.restrict_member();
                });
               
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Open assign shift member modal
     */
    showModal(shift_member_id) {
        this.setState({ openCreateModal: true, shift_member_id: shift_member_id });
    }

    /**
     * Open archive shift member modal
     */
    showArchiveModal(shift_member_id) {
        showArchiveShiftMemberModal(this.state.shift_id, shift_member_id, this.get_shift_member);
    }


    restrict_member(){
        this.state.shift_members_list.forEach((item,index)=>{
            if(item.is_restricted==1){
                if(document.getElementsByClassName('shift_members').length>0)
                {
                    document.getElementsByClassName('shift_members')
                    [0].children[1].children[index].setAttribute('title','member restricted')
                    let container = document.getElementsByClassName('shift_members')
                                   [0].children[1].children[index].children[0];
                                   container.style.backgroundColor="rgba(188,188,188,0.73)"
                                   container.style.pointerEvents="none"
                }
                
            }else{
                document.getElementsByClassName('shift_members')
                    [0].children[1].children[index].setAttribute('title','')
                    let container = document.getElementsByClassName('shift_members')
                                   [0].children[1].children[index].children[0];
                                   container.style.backgroundColor="white"
                                   container.style.pointerEvents="fill"
            }
        })
       
    }
    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.shift_id) {
            this.get_shift_member();
        }
       
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Close the modal when user saves the shift member and refresh the member table
     */
    closeAddShiftMember = (status) => {
        this.setState({openCreateModal: false});
        remove_access_lock('shift', this.state.shift_id);

        if(status){
            this.get_shift_member();
        }
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Support Worker',
                accessor: "fullname",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'memlink' + props.original.member_id} to={ROUTER_PATH + 'admin/support_worker/details/' + props.original.member_id} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Assigned',
                accessor: "is_accepted",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Checkbox
                    id="assigned"
                    checked={props.value > 0 ? true : false}
                />
            },
            {
                _label: 'Declined',
                accessor: "is_declined",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Checkbox
                id="assigned"
                checked={props.value > 0 ? true : false}
            />
            },
            {
                _label: 'Date Added',
                accessor: "created",
                id: 'created',
                Header: ({ data, column }) => <div className="ellipsis_line1__">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY HH:mm"))}</span>
            },
            {
                _label: 'Action',
                accessor: "actions",
                Header: props => <div style={{width:'1.5rem'}}></div>,
                width:'1.5rem',
                Cell: props => <Dropdown
                assistiveText={{ icon: 'More Options' }}
                iconCategory="utility"
                iconName="down"
                align="right"
                iconSize="x-small"
                disabled={(this.state.disabled_members == 1 || this.props.is_shift_locked) ? true : false}
                id={'actions' + props.original.member_id}
                iconVariant="border-filled"
                onSelect={(e) => {
                    this.showArchiveModal(props.original.id)
                }}
                width="xx-small"
                options={[
                    { label: 'Delete', value: '2' },
                ]}
            />
            
            }
        ]
    }

    /**
     * Render the shift members table
     */
    renderTable() {
        var shift_id = this.props.shift_id;
        const displayedColumns = this.determineColumns();

        if (this.state.shift_members_count == 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable
                PaginationComponent={() => false}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                filtered={this.state.filtered}
                columns={displayedColumns}
                data={this.state.shift_members_list}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles shift_members' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={false} 
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.shift_members_count == 0) {
            return <React.Fragment />
        }

        return (            
            <React.Fragment>
                <Link to={ROUTER_PATH + `admin/schedule/support_worker/${this.state.shift_id}`} className="slds-align_absolute-center default-underlined" id="view-all-members" title="View all shift members" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }
    
    /**
     * Render the display content
     */
    render() {
        // return
        return (
            <React.Fragment>
                <Card
                headerActions={<Button disabled={(this.state.disabled_members == 1 || this.props.is_shift_locked) ? true : false} id="new-shift-member" label="New" onClick={e => this.showModal()} />}
                heading={"Support Workers ("+ this.state.shift_members_count +")"}
                className="slds-card-bor"
                style={{border: '1px solid #dddbda', boxShadow: '0 2px 2px 0 rgba(0,0,0,.1)', 'margin-bottom': 0}}
                icon={<Icon category="standard" size="small" name="avatar"
                    style={{
                        backgroundColor: '#ea7600',
                        fill: '#ffffff',
                    }} />}
                footer={this.renderFooter()}
                >
                {this.renderTable()}
                </Card>
                {openAddShiftMember(this.state.shift_id, this.state.openCreateModal, this.closeAddShiftMember, this.state.shift_members_count)}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ScheduleMembers);
