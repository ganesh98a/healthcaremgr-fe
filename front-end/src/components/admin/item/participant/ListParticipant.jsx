import { PageHeaderControl } from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
import CreateParticipantModel from './CreateParticipantModel';
const selectParticipantFilterOptions = [
    { value: "Name", label: "Name", field: "name" },
    { value: "Contact", label: "Contact", field: "contact" },
    { value: "Active", label: "Active", field: "active" },
    { value: "Last Modified By", label: "Last Modified By", field: "updated_by" },
    { value: "Last Modified Date", label: "Last Modified Date",  field: "updated_at" }
]


/**
 * Class: ListParticipant
 */
class ListParticipant extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'name': true,
            'contact': true,
            'active': true,
            'updated_by': true,
            'updated_at': true,
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            displayed_columns: [...displayed_columns],
            openCreateModal: false,
            selection: [],
            refreshListView: true
        }
    }
   
 
    /**
     * Open create participant modal
     */
    showModal = () => {
        this.setState({ openCreateModal: true });
    }

    /**
     * Close the modal when user save the participant and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, participantId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.setState({is_any_action: true});
            if (participantId) {
                this.setState({ redirectTo: ROUTER_PATH + `admin/item/participant/details/`+ participantId });
            } 
        }
        this.refreshListView();
    }
    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewParticipant = e => {
            e.preventDefault()
            this.showModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link id="btn-new" to={ROUTER_PATH + `admin/item/participant/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewParticipant}>
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment> 
        )
    }


    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateModal && (
                        <CreateParticipantModel
                            showModal = {this.state.openCreateModal}
                            closeModal = {(status, participantId)=>this.closeModal(status, participantId)}
                            headingTxt = "Create Participant"
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
                _label: 'Name',
                accessor: "name",
                id: 'name',
                CustomUrl: [{url : ROUTER_PATH +  `admin/item/participant/details/PARAM1`},
                 {param: ['participant_id']}, {property: 'target=_blank'}]   
                
            },
            {
                _label: 'Contact',
                accessor: "contact",
                id: 'contact',
                CustomUrl: [{url : ROUTER_PATH +  `admin/crm/contact/details/PARAM1`},
                 {param: ['contact_id']}, {property: 'target=_blank'}]       
            },            
            
            {
                _label: 'Active',
                accessor: "active",
                id: 'active',
            },            
            {
                _label: 'Last Modified By',
                accessor: "updated_by",
                id: 'updated_by'
                
            },
            {
                _label: 'Last Modified Date',
                accessor: "updated_at",
                id: 'updated_at',
                CustomDateFormat: "DD/MM/YYYY"
                
            }
        ]
    }

    refreshListView() {
        this.setState({refreshListView: !this.state.refreshListView})
    }
    resetSelection() {
        this.setState({ selection:[] }); 
    }

    handleChanged = (event, data) => {
        this.setState({ selection: data.selection });
    };
    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
               
                <DataTableListView
                        page_name="Participants"
                        header_icon="channel_program_members"
                        displayed_columns={this.props.displayed_columns}
                        filter_options={
                            selectParticipantFilterOptions
                        }
                        
                        list_api_url="item/Participant/get_participant_list"
                        related_type="participant"
                        filter_status="all"
                        default_filter_logic="1 AND 2"
                        filter_title="All Participants"
                        show_filter={false}
                        check_default="all"
                        determine_columns={this.determineColumns}
                        on_render_actions={() => this.handleOnRenderActions()}
                        is_any_action={this.state.is_any_action}
                        filtered={true}   
                        sortColumnLabel="Last Modified Date"
                        sortColumn="updated_at"
                        selection={this.state.selection}
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


export default ListParticipant;
