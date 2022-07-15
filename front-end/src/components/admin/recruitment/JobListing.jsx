import { PageHeaderControl } from '@salesforce/design-system-react';
import { ROUTER_PATH } from 'config.js';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';
import DataTableListView from '../oncallui-react-framework/view/ListView/DataTableListView';
import SLDSReactSelect from '../salesforce/lightning/SLDSReactSelect';
import {postData} from '../../../service/common.js';

const jobsFilterOptions = [
    { value: "Status", label: "Status", field: "job_status" },
    { value: "Job Category", label: "Job Category", field: "job_category" },
    { value: "Job Created", label: "Job Created", field: "created" }
]

/**
 * Class: JobListing
 */
class JobListing extends Component {

    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'position': true,
            'job_category': true,
            'employment_type': true,
            'applicant_cnt': true,
            'new_applicant': true,
            'created': true,
            'owner_name': true,
            'job_status': true,
            'actions': true,
            'business_unit_name': true
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
            filter_panel_display_status:false,
            status_filter_value:'3',
            business_unit_options: [],
            bu_id: ''
        }
    }

    componentDidMount() {
        this.get_business_units();        
    }

    get_business_units() {
        postData('common/common/get_business_unit_options', {}).then((result) => {
            if (result.status) {
                this.setState({business_unit_options: result.data }, () => {                    
                        if(Object.keys(result.business_unit).length) {
                            this.setState({bu_id : result.business_unit.bu_id, is_super_admin : result.business_unit.is_super_admin, bu_id_filter_value : result.business_unit.bu_id}, () => {
                                this.setState({displayed_columns : this.state.displayed_columns.splice(9, 1)});
                            });
                        }
                });
            }
        });
    }
    
    /**
     * Open create participant modal
     */
    // showModal = () => {
    //     this.setState({ openCreateModal: true });
    // }

    /**
     * Close the modal when user save the participant and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, participantId) => {
        this.setState({ openCreateModal: false });

        if (status) {
            this.setState({ is_any_action: true });
            if (participantId) {
                this.setState({ redirectTo: ROUTER_PATH + `admin/item/participant/details/` + participantId });
            }
        }
        this.refreshListView();
    }

    handleChange = (value, key) => {
        this.setState({ [key]: value }, () => { 
            if(key == 'bu_id') {
                this.setState({ bu_id_filter_value: value }, () => {
                    this.refreshListView();  
                });               
            }
    });
    }
    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const FilterOptions = [
            {
                value: 'all',
                label: 'All'
            },
            {
                value: '3',
                label: 'Live'
            },            
            {
                value: '5',
                label: 'Scheduled'
            },
            {
                value: '0',
                label: 'Draft'
            },
            {
                value: '2',
                label: 'Closed'
            },
        ]
        return (
            <React.Fragment>
                <PageHeaderControl>
                    {this.state.is_super_admin &&
                        <span>
                            <SLDSReactSelect
                                simpleValue={true}
                                className={"SLDS_custom_Select default_validation slds-select bu_type"}
                                searchable={false}
                                placeholder="Please Select"
                                clearable={false}                               
                                id={'bu_type'}
                                options={this.state.business_unit_options}
                                onChange={(value) => this.handleChange(value, 'bu_id')}
                                name={'bu_id'}
                                value={this.state.bu_id}
                            />
                        </span>
                    }
                    <span>
                        <SLDSReactSelect
                            simpleValue={true}
                            className={"SLDS_custom_Select default_validation slds-select status_type"}
                            searchable={false}
                            placeholder="Please Select"
                            clearable={false}
                            required={true}
                            disabled={this.state.filter_panel_display_status}
                            id={'status_type'}
                            options={FilterOptions}
                            onChange={this.handleOnSelectFilterSelector}
                            value={this.state.status_filter_value}
                        />
                    </span>
                    <Link id="btn-new" to={ROUTER_PATH + `admin/recruitment/job_opening/create_job`} className={`slds-button slds-button_neutral`}>
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    is_filter_panel_status=(filter_panel_display_status)=>{
        this.setState({ filter_panel_display_status });
    }

    handleOnSelectFilterSelector=(option)=>
    {
        this.setState({status_filter_value:option})
    }    

    // renderModals() {
    //     return (
    //         <React.Fragment>
    //             {
    //                 // this.state.openCreateModal && (
    //                 //     <CreateParticipantModel
    //                 //         showModal = {this.state.openCreateModal}
    //                 //         closeModal = {(status, participantId)=>this.closeModal(status, participantId)}
    //                 //         headingTxt = "Create Participant"
    //                 //     />
    //                 // )
    //             }
    //         </React.Fragment>
    //     )
    // }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [

            {
                _label: 'Title',
                accessor: "position",
                Title: item => item.position,
                Component: (value, row) => {
                    return <a style={{ color: "#0070d2" }} target="_blank" href={'/admin/recruitment/applications/'+ row.id || "#"} >{value}</a>
                }
            },
            {
                _label: "Business Unit",
                accessor: 'business_unit_name'
            },
            
            {
                _label: "Job Category",
                accessor: "job_category"
            },
            {
                _label: "Employment Type",
                accessor: "employment_type"
            },
            {
                _label: 'Total Applications',
                accessor: "applicant_cnt"
            },
            {
                _label: 'New Applications',
                accessor: "new_applicant",
                Title: item => item.new_applicant,
                Component: (value, row) => {
                    return <a style={{ color: "#0070d2" }} target="_blank" href={'/admin/recruitment/applications/'+ row.id+'/1' || "#"} >{value}</a>
                }
            },
            {
                _label: 'Job Created',
                accessor: "created"
            },
            {
                _label: 'Owner',
                accessor: "owner_name"
            },
            {
                _label: 'Status',
                accessor: "job_status"
            },
            {
                _label: 'Action',
                accessor: "actions",
                id: 'actions',
                sortable: false,
                width: '70px',
                actionList: [
                    {
                        id: 1,
                        label: "View live job",
                        value: '1',
                        key: 'view_applications'
                    },
                    {
                        id: 1,
                        label: "Edit Job",
                        value: '1',
                        key: 'view_edit_job'
                    },
                    {
                        id: 1,
                        label: "Duplicate Job",
                        value: '1',
                        key: 'duplicate_job'
                    }
                ],

            }
        ]
    }

    showModal(item, key) {
        if (key === "view_applications") {
            window.open(item.website_url,'_blank');
              
        } else if (key === "view_edit_job") {
            window.location.href = ROUTER_PATH + 'admin/recruitment/job_opening/create_job/' + item.id + '/E';
        } else if (key === "duplicate_job") {
            window.location.href = ROUTER_PATH + 'admin/recruitment/job_opening/create_job/' + item.id + '/D';
        }
    }

    refreshListView() {
        this.setState({ refreshListView: !this.state.refreshListView, bu_id: this.state.bu_id })
    }
    resetSelection() {
        this.setState({ selection: [] });
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
                    page_name="Job Openings"
                    header_icon="channel_program_members"
                    displayed_columns={this.props.displayed_columns}
                    filter_options={
                        jobsFilterOptions
                    }
                    list_api_url="recruitment/Recruitment_job/get_all_jobs"
                    related_type="jobs"
                    filter_status="all"
                    default_filter_logic="1 AND 2"
                    filter_title="All Job Openings"
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
                    show_filter_icon={true}
                    showModal={this.showModal}
                    status_filter_value={this.state.status_filter_value}
                    bu_id_filter_value={this.state.bu_id_filter_value}
                    is_filter_panel_status={this.is_filter_panel_status}
                    is_bu_super_admin={this.state.is_super_admin}
                />
            </React.Fragment>
        )


    }


}


export default JobListing;
