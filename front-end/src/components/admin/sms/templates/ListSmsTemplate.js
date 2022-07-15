import { Button, PageHeaderControl } from '@salesforce/design-system-react';
import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import { AjaxConfirm, postData, toastMessageShow } from 'service/common.js';
import DataTableListView from '../../oncallui-react-framework/view/ListView/DataTableListView.jsx';
import CreateSmsTemplate from './CreateSmsTemplate';
const selectParticipantFilterOptions = [
    { value: "SMS template Name", label: "SMS template Name", field: "name" },
    { value: "Short Description", label: "Short Description", field: "short_description" },
    { value: "Created Date", label: "Created Date",  field: "created_at" },
    { value: "Created By", label: "Created By", field: "created_by" }
]
class ListingSmsTemplate extends Component {    
    /**
     * Set visible columns of the table
     */
         static defaultProps = {
            displayed_columns: {
                'name': true,
                'short_description': true,
                'created_at': true,
                'created_by': true,
                'actions':true
                
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
                refreshListView: true,
                sms_template_id:''
            }
        }
       
     
        /**
         * Open create participant modal
         */
        showModal = (sms_template,action='') => {
            if(action==='edit')
            {
                this.setState({ sms_template_id: sms_template.id });
                this.setState({ openCreateModal: true });
                return;
            }
            if(action==='delete')
            {
                if (sms_template.used_to_initiate_oa === "1") {
                    toastMessageShow("This template can't be deleted because it has been used to send SMS when an Online Assessment is initiated");
                    return false;
                }
                this.showArchiveModal(sms_template.id)
                return;
            }
            this.setState({ sms_template_id: '' });
            this.setState({ openCreateModal: true });
        }
    
        /**
         * Close the modal when user save the participant and refresh the table
         * Get the Unique reference id
         */
        closeModal = (status, participantId) => {
            this.setState({openCreateModal: false});
            this.refreshListView();
        }


         showSmsArchiveModal=(id, fresh_call_back)=> {
            const msg = `Are you sure you want to archive this sms template?`
            const confirmButton = `Archive SMS Template`
            AjaxConfirm({ id }, msg, `sms/Sms_template/delete_sms_template_by_id`, { confirm: confirmButton, heading_title: `Archive SMS template` }).then(result => {
                if (result.status) {
                    toastMessageShow(result.msg, "s");
                    fresh_call_back();
                } else {
                    if (result.error) {
                        toastMessageShow(result.error, "e");
                    }
                    return false;
                }
            })
         }
        showArchiveModal=(id)=>{
        this.showSmsArchiveModal(id,this.refreshListView)
        }
        /**
         * Render page header action
         */
        handleOnRenderActions = () => {
           
    
            return (
                <React.Fragment>
                     <PageHeaderControl>
                                   <Button label="New" onClick={() => this.showModal()} />
                </PageHeaderControl>
                    
                </React.Fragment> 
            )
        }
    
    
        renderModals() {
            return (
                <React.Fragment>
                    {
                        this.state.openCreateModal && (
                            <CreateSmsTemplate
                               id={this.state.sms_template_id}
                                showModal = {this.state.openCreateModal}
                                closeModal = {(status, sms_id)=>this.closeModal(status, sms_id)}
                                headingTxt = "Create SMS Template"
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
                    _label: 'SMS template Name',
                    accessor: "name",
                    id: 'name',

                    
                },        
                
                {
                    _label: 'Short Description',
                    accessor: "short_description",
                    id: 'short_description',
                },        
               
                {
                    _label: 'Created Date',
                    accessor: "created_at",
                    id: 'created_at',
                    CustomDateFormat: "DD/MM/YYYY"
                    
                },
                {
                    _label: 'Created By',
                    accessor: "created_by",
                    id: 'created_by'
                    
                },
                {
                    _label: '',
                    accessor: "actions",
                    id: 'actions',
                    sortable: false,
                    width: '70px',
                    actionList : [
                        {
                            id: 0,
                            label: 'Edit',
                            value: '1',
                            key: 'edit'
                        },
                        {
                            id: 1,
                            label: 'Delete',
                            value: '2',
                            key: 'delete'
                        },
                    ]
                 
                }
            ]
        }
    
        refreshListView=()=> {
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

        return(
            <React.Fragment>
            <DataTableListView
                    page_name="SMS Templates"
                    header_icon="channel_program_members"
                    displayed_columns={this.props.displayed_columns}
                    filter_options={
                        selectParticipantFilterOptions
                    }
                    list_api_url="sms/Sms_template/get_sms_templates"
                    related_type="sms_template"
                    filter_status="all"
                    default_filter_logic="1 AND 2"
                    filter_title="All SMS Templates"
                    show_filter={false}
                    check_default="all"
                    determine_columns={this.determineColumns}
                    on_render_actions={() => this.handleOnRenderActions()}
                    is_any_action={this.state.is_any_action}
                    filtered={true}   
                    sortColumnLabel="Created Date"
                    sortColumn="created_at"
                    selection={this.state.selection}
                    resetSelection={this.resetSelection.bind(this)}
                    selectionHandleChange={this.handleChanged.bind(this)}
                    refresh={this.state.refreshListView}
                    show_filter_icon = {true}
                    showModal={this.showModal}
                />
          
           {this.renderModals()}
        </React.Fragment>)
       
        
    }

}




export default ListingSmsTemplate;

