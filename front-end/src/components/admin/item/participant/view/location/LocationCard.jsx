import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, reFreashReactTable, toastMessageShow, AjaxConfirm, queryOptionData } from 'service/common.js';
import '../../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactTable from '../../../../salesforce/lightning/SLDSReactTable'
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import { ROUTER_PATH } from 'config.js';
import { Link } from 'react-router-dom';

import { defaultSpaceInTable } from 'service/custom_value_data.js';

import {
    Card,
    Button,
    Dropdown,
    Icon,
    IconSettings,
} from '@salesforce/design-system-react';
import CreateLocationtModel from './CreateLocationModel.jsx';
import EditLocationModel from './EditLocationModel.jsx';

import '../../../../scss/components/admin/item/item.scss';

/**
 * RequestData get the list of paricipant locations
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
const requestData = (participant_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { participant_id: participant_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('item/ParticipantLocation/get_participant_location_list', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    location_count: result.location_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    location_count: 0
                };
                resolve(res);
            }
           
        });

    });
};

/**
 * Class: Location
 */
class LocationCard extends Component {   

    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            location_count: 0,
            openCreateLocation: false,
            openEditLocation: false,
            searchVal: '',
            filterVal: '',
            locationList: [],
            pageSize: 6,
            page: 1,
            location_id: '',
        }
        // Initilize react table
        this.reactTable = React.createRef();
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        this.fetchLocationData(this.state);
    }

    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchLocationData = (state, instance) => {
        this.setState({ loading: true });
        requestData(
            this.props.participant_id,
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                locationList: res.rows,
                location_count: res.location_count,
                pages: res.pages,
                loading: false
            });
        });
    }

    /**
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Location Name',
                accessor: "name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <Link to={ROUTER_PATH + `admin/item/participant/locations/details/${props.original.location_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {defaultSpaceInTable(props.value)}
                </Link>,
            },
            {
                _label: 'Location',
                accessor: "address",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Active',
                accessor: "active",
                style: { minWidth: '50px', maxWidth: '100px' },
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => <span className="slds-truncate">{defaultSpaceInTable(props.value)}</span>,
            },
            {
                _label: 'Action',
                accessor: "",
                className: "slds-tbl-roles-td",
                sortable: false,
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => 
                <Dropdown
                    assistiveText={{ icon: 'More Options' }}
                    iconCategory="utility"
                    iconName="down"
                    iconVariant="border-filled"
                    onSelect={(e) => {
                        if(e.value == 1){ //edit
                            this.showEditLocationModal(props.original.id)
                        }
                        else { // delete
                            this.handleOnArchiveLocation(props.original.id)
                        }
                    }}
                    className={'slds-more-action-dropdown'}
                    options={[
                        { label: 'Edit', value: '1' },
                        { label: 'Delete', value: '2' },
                    ]}
                />,
            },
        ]
    }

    /**
     * Render roles table if count greater than 0
     */
    renderTable() {
        if (this.state.location_count === 0) {
            return <React.Fragment />
        }

        return (
            <SLDSReactTable 
                PaginationComponent={() => <React.Fragment />}
                ref={this.reactTable}
                manual="true"
                loading={this.state.loading}
                pages={this.state.pages}
                data={this.state.locationList}
                defaultPageSize={6}
                minRows={1}
                sortable={false}
                resizable={true}
                onFetchData={this.fetchLocationData}
                columns={this.determineColumns()}
                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}
            />
        )
    }

    /**
     * Render view all if count greater than 0
     */
    renderViewAll = () => {
        if (this.state.location_count === 0) {
            return <React.Fragment />
        }

        return (            
            <div className={'slds-align_absolute-center pt-2'}>
                <Link to={ROUTER_PATH + `admin/item/participant/locations/${this.props.participant_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {'View All'}
                </Link>
            </div>   
        );
    }

    /**
     * Show update location model
     */
    showEditLocationModal = (id) => {
        this.setState({
            openEditLocation: true,
            location_id: id,
        });
    }

    /**
     * Close the modal when user save the participant and refresh the table
     * Get the Unique reference id
     */
    closeEditLocationModal = (status, locationId) => {
        this.setState({openEditLocation: false});

        if(status){
            if (locationId) {
                // to do...
            } else {
                if (this.state.location_count === 0) {
                    this.fetchLocationData(this.state);
                } else {
                    reFreashReactTable(this, 'fetchLocationData');
                }
                
            }
        }
    }
    
    /**
     * when archive is requested by the user for selected location
     */
    handleOnArchiveLocation = (id) => {
        const msg = `Are you sure you want to archive this location?`
        const confirmButton = `Archive Location`
        AjaxConfirm({ location_id: id }, msg, `item/ParticipantLocation/archive_location`, { confirm: confirmButton, heading_title: `Archive Location` }).then(result => {
            if (result.status) {
                toastMessageShow(result.msg, "s");
                reFreashReactTable(this, 'fetchLocationData');
            } else {
                if (result.error) {
                    toastMessageShow(result.error, "e");
                }
            }
        })
    }

    /**
     * Close the modal when user save the participant and refresh the table
     * Get the Unique reference id
     */
    closeModal = (status, locationId) => {
        this.setState({openCreateLocation: false});

        if(status){
            if (locationId) {
                // to do...
            } else {
                if (this.state.location_count === 0) {
                    this.fetchLocationData(this.state);
                } else {
                    reFreashReactTable(this, 'fetchLocationData');
                }
                
            }
        }
    }

    /**
     * Render modals
     * - Create Location
     * 
     */
    renderModals() {
        return (
            <React.Fragment>
                {
                    this.state.openCreateLocation && (
                        <CreateLocationtModel
                            defaultParticipant = {this.state.default_participant}
                            showModal = {this.state.openCreateLocation}
                            closeModal = {this.closeModal}
                            headingTxt = "New Location"
                            {...this.props}
                        />
                    )
                }
                {
                    this.state.openEditLocation && (
                        <EditLocationModel
                            defaultParticipant = {this.state.default_participant}
                            showModal = {this.state.openEditLocation}
                            closeModal = {this.closeEditLocationModal}
                            location_id = {this.state.location_id}
                            headingTxt = "Update Location"
                            {...this.props}
                        />
                    )
                }
            </React.Fragment>
        )
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Card
                        headerActions={<Button label="New" onClick={() => this.setState({ openCreateLocation: true }) }/>}
                        heading={Number(this.state.location_count) > 6 ? "Locations (6+)" : "Locations ("+this.state.location_count+")"}
                        className="slds-card-bor"
                        icon={<Icon category="standard" name="location" size="small" />}
                    >
                        {this.renderTable()}
                        {this.renderViewAll()}
                    </Card>
                    {this.renderModals()}
                </IconSettings>
            </React.Fragment>
        );
    }
}


// Defalut Prop
ReactTable.PropTypes = {
    defaultFiltered: PropTypes.object
}
export default LocationCard;
