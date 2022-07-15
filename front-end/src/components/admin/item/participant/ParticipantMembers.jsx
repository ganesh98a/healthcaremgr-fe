import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, toastMessageShow } from 'service/common.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable'
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { showArchiveMemberModal, openAddEditMemberModal } from '../ItemCommon';
import {
    Button,
    Icon,
    Card,
    Dropdown
} from '@salesforce/design-system-react';

/**
 * Class: ParticipantMembers
 */
class ParticipantMembers extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            participant_id: this.props.participant_id ? this.props.participant_id : '',
            participant_members_list: [],
            participant_members_count: 0,
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

    /**
     * fetching the participant members
     */
    get_participant_members = (id) => {
        var Request = { participant_id: this.state.participant_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('item/participant/get_participant_member_list', Request).then((result) => {
            if (result.status) {
                this.setState({participant_members_list: result.data, participant_members_count: result.count});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Open create members modal
     */
    showModal() {
        this.setState({ openCreateModal: true});
    }

    /**
     * Open archive member modal
     */
    showArchiveModal(participant_member_id) {
        showArchiveMemberModal(participant_member_id, this.get_participant_members);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.participant_id) {
            this.get_participant_members();
        }
    }

    /**
     * Close the modal when user save the members and refresh the table
     */
    closeAddEditMemberModal = (status, membersId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_participant_members();
        }
    }

    /**
     * Table columns
     */
    determineColumns() {
        return [
            {
                _label: 'Support worker',
                accessor: "fullname",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link id={'memlink' + props.original.member_id} to={ROUTER_PATH + 'admin/support_worker/details/' + props.original.member_id} 
                className="vcenter default-underlined slds-truncate"
                style={{ color: '#0070d2' }}>
                    {props.value}
                </Link>
            },
            {
                _label: 'Status',
                accessor: "status_label",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
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
     * Render the participant members table
     */
    renderTable() {
        const displayedColumns = this.determineColumns();

        if (this.state.participant_members_count == 0) {
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
                data={this.state.participant_members_list}
                defaultPageSize={9999}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                onPageSizeChange={this.onPageSizeChange}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={false} 
                style={{border:'none'}}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.participant_members_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="custom-card-footer">
                <Link to={ROUTER_PATH + `admin/item/participant/support_worker/${this.state.participant_id}`} className="slds-align_absolute-center default-underlined" id="view-all-members" title="View all participant members" style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <Card
                headerActions={<Button id="new-participant-member" label="New" onClick={e => this.showModal()} />}
                heading={"Support Workers ("+ this.state.participant_members_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" size="small" name="avatar"
                    style={{
                        backgroundColor: '#ea7600',
                        fill: '#ffffff',
                    }} />}
                bodyClassName="body-no-padding"
                >
                {this.renderTable()}
                {this.renderFooter()}
                </Card>
                {openAddEditMemberModal(this.state.participant_id, this.state.openCreateModal, this.closeAddEditMemberModal)}
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

const mapDispatchtoProps = (dispach) => { return { } }

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantMembers);
