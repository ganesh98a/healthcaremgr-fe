import '../../../scss/components/admin/crm/pages/contact/ListContact.scss';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-table/react-table.css';

import { Button, Card, Dropdown, Icon } from '@salesforce/design-system-react';
import jQuery from 'jquery';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AjaxConfirm, css, postData, toastMessageShow } from 'service/common.js';
import { defaultSpaceInTable } from 'service/custom_value_data.js';

import SLDSReactTable from '../../../salesforce/lightning/SLDSReactTable';
import CreateServiceBookingModal from '../sales/CreateServiceBookingModal';

/**
 * Class: ParticipantMembers
 */
class ServiceBookingsList extends Component {
    
    constructor(props) {
        super(props);
        
        // Initialize state
        this.state = {
            service_booking_list: [],
            service_booking_count: 0,
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
     * fetching the participant members
     */
    get_servicebooking_list = (id) => {
        var Request = { related_service_agreement_id: this.props.related_service_agreement_id, pageSize: this.state.pageSize, page: this.state.page, sorted: this.state.sorted, filtered: this.state.filtered };
        postData('sales/ServiceBooking/get_service_booking_list', Request).then((result) => {
         console.log('result',result)
                this.setState({service_booking_list: result, service_booking_count: result.length});
         
        });
    }

    /**
     * Open create members modal
     */
    showModal() {
        this.setState({ openCreateModal: true,isUpdate:false,id_to_update:null});
    }
/**
* when archive is requested by the user for selected role document
*/
    showArchiveServiceBookingModal(id, fresh_call_back) {
       const msg = `Are you sure you want to archive this service booking?`
       const confirmButton = `Archive Service Booking`
       AjaxConfirm({ id }, msg, `sales/ServiceBooking/delete_service_booking`, { confirm: confirmButton, heading_title: `Archive Service Booking` }).then(result => {
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
    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
        if(this.props.related_service_agreement_id) {
            this.get_servicebooking_list();
        }
    }

    /**
     * Close the modal when user save the members and refresh the table
     */
    closeAddEditMemberModal = (status, membersId) => {
        this.setState({openCreateModal: false});

        if(status){
            this.get_servicebooking_list();
        }
    }

    handleOnCloseAddModal=()=>{
        this.setState({openCreateModal:false})
        this.get_servicebooking_list()
    }


    handleListAction=(action_id,data_id)=>{
          console.log('handleListAction',data_id);
        if(action_id==1){
            this.setState({openCreateModal:true,isUpdate:true,id_to_update:data_id})
            return;
        }
        this.showArchiveServiceBookingModal(data_id, this.get_servicebooking_list); 

    }
    /**
     * Table columns
     */
    determineColumns() {
        return [
            {
                _label: 'Service Booking Number',
                accessor: "service_booking_number",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Service Agreement Type',
                accessor: "service_agreement_type",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => (
                    <span className="slds-truncate">
                        {defaultSpaceInTable(props.value)}
                    </span>
                ),
            },
            {
                _label: 'Funding($)',
                accessor: "funding",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Date Submitted',
                accessor: "date_submitted",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Status',
                accessor: "status",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate"  style={{textTransform:'capitalize'}}>{defaultSpaceInTable(props.value)}</span>
            },
            {
                _label: 'Signed',
                accessor: "is_received_signed_service_booking",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>
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
                id={'actions' + props.original.id}
                iconVariant="border-filled"
                onSelect={(e) => {
                    this.handleListAction(e.value,props.original.id)
                }}
                width="xx-small"
                options={[
                    { label: 'Edit', value: '1' },
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

        if (this.state.service_booking_count == 0) {
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
                data={this.state.service_booking_list}
                defaultPageSize={6}
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
        if (this.state.service_booking_count == 0) {
            return <React.Fragment />
        }

        return (            
            <div className="custom-card-footer">
                <Link className="slds-align_absolute-center default-underlined" id="view-all-service-booking" 
                title="View all service  booking" to ="" style={{ color: '#0070d2' }}>View all</Link>
            </div>    
        );
    }

    /**
     * Render the display content
     */
    render() {
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
                headerActions={<Button id="new-service-booking" 
                label="New" onClick={e => this.showModal()} />}
                heading={"Service Booking ("+ this.state.service_booking_count +")"}
                className="slds-card-bor"
                style={styles.card}
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
               {
                   this.state.openCreateModal&&(
                    <CreateServiceBookingModal open={!!this.state.openCreateModal}
                    onClose={this.handleOnCloseAddModal}
                    isUpdate={this.state.isUpdate}
                    id_to_update={this.state.id_to_update}
                    service_agreement_id={this.props.related_service_agreement_id}
                    is_portal_managed={this.props.is_portal_managed}
                    service_booking_creator={this.props.service_booking_creator}
                    onSuccess={this.handleOnCloseAddModal}
                />
                   )
               }
               </div>
               </div>
            </React.Fragment>
        )
    }
}

export default ServiceBookingsList;
