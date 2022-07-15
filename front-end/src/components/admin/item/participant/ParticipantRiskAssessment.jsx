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
import { showArchiveGoalModal } from '../ItemCommon';
import {
    Button,
    Icon,
    Card} from '@salesforce/design-system-react';
import SLDSReactTable from '../../salesforce/lightning/SLDSReactTable';
import { defaultSpaceInTable } from 'service/custom_value_data';
import CreateRiskAssessmentModel from '../../crm/pages/RiskAssessment/CreateRiskAssessmentModel';

/**
 * RequestData get unique reference id 
 */
 const requestReferenceID = () => {

    return new Promise((resolve, reject) => {
        // request json
        postData('sales/RiskAssessment/get_create_reference_id').then((result) => {
            if (result.status) {
                let raData = result.data;
                const res = {
                    data: raData,
                };
                resolve(res);
            } else {
                const res = {
                    data: [],
                };
                resolve(res);
            }           
        });

    });
};

/**
 * Class: Participantrisk_assesments
 */
class ParticipantRiskAssessment extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            participant_id: this.props.participant_id ? this.props.participant_id : '',
            risk_assesment_id: '',
            risk_assesments: [],
            risk_assesments_count: 0,
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
     * fetching the participant risk_assesments
     */
    get_participant_risk_assesments = (id) => {
        var Request = { participant_id: this.state.participant_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('sales/RiskAssessment/get_risk_assessment_list', Request).then((result) => {
            if (result.status) {
                this.setState({risk_assesments: result.data, risk_assesments_count: result.total_item});
            } else {
                toastMessageShow(result.error, "e");
            }
        });
    }

    /**
     * Open create risk_assesments modal
     */
    showModal(e) {
        e.preventDefault();
        this.fetchRefereceID();
    }

    /**
     * Open archive goal modal
     */
    showArchiveModal(risk_assesment_id) {
        showArchiveGoalModal(risk_assesment_id, this.get_participant_risk_assesments);
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.state.participant_id) {
            this.get_participant_risk_assesments();
        }
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Close the modal when user save the risk_assesments and refresh the table
     */
    closeAddEditGoalModal = (status, risk_assesmentsId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_participant_risk_assesments();
        }
    }

    /**
     * Render view all if count greater than 0
     */
    renderFooter = () => {
        if (this.state.risk_assesments_count <= 6) {
            return <React.Fragment />
        }

        return (            
            <React.Fragment>
                <Link participant_name={this.props.participant_name} to={ROUTER_PATH + `admin/item/risk_assesments/${this.state.participant_id}`} className="pt-2 slds-align_absolute-center default-underlined" title="View all participant Risk assesments" style={{ color: '#0070d2' }}>View all</Link>
            </React.Fragment>    
        );
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
     determineColumns() {
        return [
            {
                _label: 'ID',
                accessor: "reference_id",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
               
                _label: 'Title',
                accessor: "topic",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                   return <Link style={{color: "rgb(0, 112, 210)"}} className="vcenter default-underlined slds-truncate" to={`${ROUTER_PATH}admin/crm/riskassessment/details/${props.original.risk_assessment_id}`}>
                        <span>{defaultSpaceInTable(props.value)}</span>
                    </Link>
                } 
            },            
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Owner',
                accessor: "owner",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
            {
                _label: 'Created date',
                accessor: "created_date",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(moment(props.value).format("DD/MM/YYYY"))}</span>
                }
            },
            {
                _label: 'Created by',
                accessor: "created_by",
                Header: ({ column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => {
                    return <span className="vcenter slds-truncate">{defaultSpaceInTable(props.value)}</span>
                }
            },
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
                headerActions={<Button disabled={this.state.loading_refid} label="New" onClick={e => this.showModal(e)} />}
                heading={"Risk Assesments ("+ this.state.risk_assesments_count +")"}
                className="slds-card-bor"
                icon={<Icon category="standard" name="service_contract" size="small" />}
                footer={this.renderFooter()}
                >
                {this.renderTable()}
                </Card>
                {this.state.openCreateModal ? <CreateRiskAssessmentModel 
                    showModal = {this.state.openCreateModal}
                    referenceId = {this.state.reference_id}
                    closeModal = {this.closeModal}
                    headingTxt = "Create Risk Assessment"
                    participant_id={this.state.participant_id}
                /> : ''}
            </React.Fragment>
        )
    }

    /**
     * Close the modal when user save the risk assessment and refresh the table
     * Get the Unique reference id
     */
     closeModal = (status, id) => {
        this.setState({ openCreateModal: false });
        if (id) {
            window.location.href = `${ROUTER_PATH}admin/crm/riskassessment/details/${id}`;
        }
    }

    /**
     * Call the getReferenceID
     */
    fetchRefereceID = () => {
        this.setState({loading_refid: true});
        requestReferenceID().then(res => {
            this.setState({loading_refid: false});
            var ra_data = res.data
            if(ra_data && ra_data.reference_id) {
                this.setState({
                    reference_id: ra_data.reference_id,
                    openCreateModal: true
                });
            }            
        });
    }

    refreshListView() {
        this.setState({refreshTable: !this.state.refreshTable});
        this.get_participant_risk_assesments();
    }

    /**
     * Render the account members table
     */
    renderTable() {
        const displayedColumns = this.determineColumns();

        if (this.state.risk_assesments_count == 0) {
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
                data={this.state.risk_assesments}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ParticipantRiskAssessment);
