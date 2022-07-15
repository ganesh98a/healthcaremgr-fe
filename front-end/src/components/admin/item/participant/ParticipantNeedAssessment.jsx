import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { postData, toastMessageShow } from 'service/common.js';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import '../../scss/components/admin/crm/pages/contact/ListContact.scss'
import { showArchiveGoalModal, openAddEditGoalModal } from '../ItemCommon';
import {
    Button,
    Icon,
    Card,
    Dropdown
} from '@salesforce/design-system-react';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable';
import { defaultSpaceInTable } from 'service/custom_value_data';
import CreateNeedAssessmentBox from '../../crm/pages/needassessment/CreateNeedAssessmentBox';
/**
 * Class: Participantneed_assesments
 */
class ParticipantNeedAssessment extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            participant_id: this.props.participant_id ? this.props.participant_id : '',
            need_assesment_id: '',
            need_assesments: [],
            need_assesments_count: 0,
            searchVal: '',
            filterVal: '',
            filter_status: 'all',
            openEditModal: false,
            openCreateModal: false,
            pageSize: 6,
            page: 0,
            sorted: [],
            filtered: [],
            refreshTable: false
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef();
    }

    /**
     * fetching the participant need_assesments
     */
    get_participant_need_assesments = (id) => {
        var Request = { participant_id: this.state.participant_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('sales/NeedAssessment/get_need_assessment_list', Request).then((result) => {
            if (result.status) {
                this.setState({need_assesments: result.data, need_assesments_count: result.total_item});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Open create need_assesments modal
     */
    showModal(need_assesment_id) {
        this.setState({ openCreateModal: true, need_assesment_id: need_assesment_id });
    }

    /**
     * Open archive goal modal
     */
    showArchiveModal(need_assesment_id) {
        showArchiveGoalModal(need_assesment_id, this.get_participant_need_assesments);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.participant_id) {
            this.get_participant_need_assesments();
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Close the modal when user save the need_assesments and refresh the table
     */
    closeAddEditGoalModal = (status, need_assesmentsId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_participant_need_assesments();
        }
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.need_assesments_count <= 6) {
            return <React.Fragment />
        }

        return (            
            <React.Fragment>
                <Link participant_name={this.props.participant_name} to={ROUTER_PATH + `admin/item/need_assesments/${this.state.participant_id}`} className="pt-2 slds-align_absolute-center default-underlined" title="View all participant need assesments" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }

    /**
     * setting the column headers in the listing table
     */
     determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "need_assessment_number",
                id: 'need_assessment_number',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
               
            },
            {
                _label: 'Title',
                accessor: "title",
                id: 'title',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                   return <Link style={{color: "rgb(0, 112, 210)"}} className="vcenter default-underlined slds-truncate" to={`${ROUTER_PATH}admin/crm/needassessment/${props.original.need_assessment_id}`}>
                        <span>{defaultSpaceInTable(props.value)}</span>
                    </Link>
                }      
            },           
            {
                _label: 'Status',
                accessor: "status",
                id: 'status',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
            },
            {
                _label: 'Owner',
                accessor: "owner_name",
                id: 'owner_name',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
                
            },
            {
                _label: 'Created Date',
                accessor: "created",
                id: 'created',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
                } 
            },{

                _label: 'Created By',
                accessor: "created_by",
                id: 'created_by',
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                } 
                
            }
        ]
    }
    
    /**
     * Render the display content
     */
    render() {
        // return
        return (
            <React.Fragment>
                <Card
                headerActions={<Button label="New" onClick={e => this.showModal()} />}
                heading={"Need Assesments ("+ this.state.need_assesments_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" name="service_contract" size="small" />}
                footer={this.renderFooter()}
                >
                {this.renderTable()}
                </Card>
                {this.state.openCreateModal ? <CreateNeedAssessmentBox openOppBox={this.state.openCreateModal}
                 closeModal={this.closeModal} oppId={this.state.need_assesment_id} pageTitle={"New Need Assessment"} data={this.state} contact_id={this.props.contact_id} contact_name={this.props.contact_name} /> : ''}
            </React.Fragment>
        )
    }

    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable});
        this.get_participant_need_assesments();
    }
    closeModal = (id) => {
        this.setState({ openCreateModal: false }, () => {
            if (id) {
                window.location.href = `${ROUTER_PATH}admin/crm/needassessment/${id}`;
            }
        });
    }

    /**
     * Render the account members table
     */
    renderTable() {
        const displayedColumns = this.determineColumns();

        if (this.state.need_assesments_count == 0) {
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
                data={this.state.need_assesments}
                defaultPageSize={6}
                minRows={1}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
                noDataText="No records Found"
                collapseOnDataChange={true} 
                resizable={false} 
                style={{border:'none'}}
                refreshTable={this.state.refreshTable}
            />
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

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantNeedAssessment);
