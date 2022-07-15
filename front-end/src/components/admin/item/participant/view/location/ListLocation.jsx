import React, { Component } from 'react';
import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { css, postData, reFreashReactTable, toastMessageShow, AjaxConfirm, queryOptionData } from 'service/common.js';

import { connect } from 'react-redux'
import Pagination from "service/Pagination.js";
import { defaultSpaceInTable } from 'service/custom_value_data.js';
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import SLDSReactTable from '../../../../salesforce/lightning/SLDSReactTable'
import { Redirect } from 'react-router';
import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Icon, 
    ButtonGroup, 
    Button, 
    Dropdown, 
    DropdownTrigger,
    Input,
    InputIcon
} from '@salesforce/design-system-react';
import CreateLocationtModel from './CreateLocationModel.jsx';
import EditLocationModel from './EditLocationModel.jsx';
import '../../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
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
 * RequestData get the data of participant
 * @param {int} participantId
 */
const requestParticipantData = (participantId) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { participant_id: participantId };
        postData('item/Participant/get_participant_data_by_id', Request).then((result) => {
            if (result.status) {
                let resData = result.data;
                const res = {
                    data: resData,
                };
                resolve(res);
            } else {
                const res = {
                    data: []
                };
                resolve(res);
            }           
        });
    });
};
/**
 * Class: ListLocation
 */
class ListLocation extends Component {
    
    /**
     * Set visible columns of the table
     */
    static defaultProps = {
        displayed_columns: {
            'name': true,
            'address': true,
            'active': true,
            'action': true
        }
    }

    constructor(props) {
        super(props);

        const displayed_columns = Object.keys(props.displayed_columns).filter(k => !!props.displayed_columns[k])
        // Initialize state
        this.state = {
            searchVal: '',
            filterVal: '',
            locationList: [],
            contact_id: '',
            filter_status: 'all',
            default_displayed_columns: displayed_columns,
            displayed_columns: [...displayed_columns],
            openCreateLocation: false,
            openEditLocation: false,
            participant_id: this.props.match.params.id,
            participant_name: '',
            location_id: ''
        }
        // Initilize react table
        this.reactTable = React.createRef();
        this.rootRef = React.createRef()
    }

    /*
     * method runs after the component output has been rendered to the DOM
     */
    componentDidMount() {       
        jQuery(this.rootRef.current).parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12');
        requestParticipantData(
            this.state.participant_id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    participant_id: raData.participant_id,
                    participant_name: raData.name,
                    contact_id: raData.contact_id,
                    active: raData.active === 'Yes' ? true : false,
                });    
            }
            
        });
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }
   
    /**
     * Call the requestData
     * @param {temp} state 
     */
    fetchLocationData = (state, instance) => {
        this.setState({ loading: true });
        const id = this.props.match.params.id;
        requestData(
            id,
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
     * Get the list based on filter value
     * @param {str} key 
     * @param {str} value 
     */
    filterChange = (key, value) => {
        var state = {};
        state[key] = value;
        this.setState(state, () => {
            this.setTableParams();
        });
    }

    /**
     * Get the list based on Search value
     * @param {object} e 
     */
    submitSearch = (e) => {
        e.preventDefault();
        this.setTableParams();
    }

    /**
     * Set the data for fetching the list
     */
    setTableParams = () => {
        var search_re = { search: this.state.search, filter_status: this.state.filter_status };
        this.setState({ filtered: search_re });
    }

    /**
     * Render page header action
     */
    handleOnRenderActions = () => {
        const handleOnClickNewParticipant = e => {
            e.preventDefault()
            this.showCreateLocationModal();
        }

        return (
            <React.Fragment>
                <PageHeaderControl>
                    <Link to={ROUTER_PATH + `admin/item/participant_location/create`} className={`slds-button slds-button_neutral`} onClick={handleOnClickNewParticipant}>
                        New
                    </Link>
                </PageHeaderControl>
            </React.Fragment> 
        )
    }

    /**
     * Render search input form
     */
    renderSearchForm() {
        return (
            <form 
                autoComplete="off" 
                onSubmit={(e) => this.submitSearch(e)} 
                method="post" 
                className="slds-col_padded"
                style={{ display: 'block' }}
            >
                <Input
                    iconLeft={
                        <InputIcon
                            assistiveText={{
                                icon: 'Search',
                            }}
                            name="search"
                            category="utility"
                        />
                    }
                    onChange={(e) => this.setState({ search: e.target.value })}
                    id="Participant-search-1"
                    placeholder="Search Participant"
                />
            </form>
        )
    }

    /**
     * Render filter dropdown of status
     */
    renderStatusFilters() {
        let participantStatusFilter = [
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'InActive' },        
        ];
        return (
            <Dropdown
                align="right"
                checkmark
                assistiveText={{ icon: 'Filter by status' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={participantStatusFilter}
                onSelect={value => this.filterChange('filter_status', value.value)}
                length={null}
            >
                <DropdownTrigger title={`Filter by status`}>
                    <Button
                        assistiveText={{ icon: 'Filter' }}
                        iconCategory="utility"
                        iconName="filterList"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Handle the selected columns visible or not 
     */
    handleOnSelectColumnSelectorItem = option => {
        const value = option.value

        let cols = [...this.state.displayed_columns]
        if (cols.indexOf(value) >= 0) {
            cols = cols.filter(col => col !== value)
        } else {
            cols = [...this.state.displayed_columns, value]
        }

        this.setState({ displayed_columns: cols })
    }

    /**
     * Render table column dropdown
     * @param {object} param
     * @param {(import('react-table').Column & { _label: string })[]} [param.columns]
     */
    renderColumnSelector({ columns = [] }) {

        const mapColumnsToOptions = columns.map(col => ({ 
            value: 'id' in col ? col.id : col.accessor,
            label: col._label,
        }))

        return (
            <Dropdown
                align="right"
                checkmark
                multiple
                assistiveText={{ icon: 'More' }}
                iconCategory="utility"
                iconName="settings"
                iconVariant="more"
                options={mapColumnsToOptions}
                value={this.state.default_displayed_columns}
                onSelect={this.handleOnSelectColumnSelectorItem}
            >
                <DropdownTrigger>
                    <Button
                        title={`Show/hide columns`}
                        assistiveText={{ icon: 'Show/hide columns' }}
                        iconCategory="utility"
                        iconName="table"
                        iconVariant="more"
                        variant="icon"
                    />
                </DropdownTrigger>
            </Dropdown>
        )
    }

    /**
     * Render page header
     * @param {object} param
     * @param {import('react-table').Column[]} [param.columns]
     */
    handleOnRenderControls = ({ columns = [] }) => () => {
        return (
            <React.Fragment>
                <PageHeaderControl>
                    { this.renderSearchForm() }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderColumnSelector({ columns }) }
                </PageHeaderControl>
                <PageHeaderControl>
                    { this.renderStatusFilters() }
                </PageHeaderControl>
            </React.Fragment>
        )
    }

    /**
     * Show create location model
     */
    showCreateLocationModal = () => {
        this.setState({
            openCreateLocation: true,
        });
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
                            participant_name = {this.state.participant_name}
                            participant_id = {this.state.participant_id}
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
     * Table columns
     * @returns {(import('react-table').Column & { _label: string })[]}
     */
    determineColumns() {
        return [
            {
                _label: 'Location Name',
                accessor: "name",
                Header: ({ data, column }) => <div className="slds-truncate">{column._label}</div>,
                Cell: props => 
                <Link to={ROUTER_PATH + `admin/item/participant/locations/details/${props.original.location_id}`} className="reset" style={{ color: '#0070d2' }}>
                    {defaultSpaceInTable(props.value)}
                </Link>
                ,
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
                accessor: "action",
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
     * Render the display content
     */
    render() {
        // This will only run when user create participant
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        // table cloumns
        const columns = this.determineColumns();
        const displayedColumns = columns.filter(col => this.state.displayed_columns.indexOf(col.accessor || col.id) >= 0)
        const styles = css({
            root: {
                fontFamily: "Salesforce Sans, Arial, Helvetica, sans-serif",
                marginRight: -15,
            }
        })
        const trail = [
            <Link to={ROUTER_PATH + `admin/item/participant`} className="reset" style={{ color: '#0070d2' }}>
                {'Participants'}
            </Link>,
			<Link to={ROUTER_PATH + `admin/item/participant/details/${this.state.participant_id}`} className="reset" style={{ color: '#0070d2' }}>
                {this.state.participant_name}
            </Link>,
		];
        // return
        return (
            <React.Fragment>
                <div className="slds" style={styles.root} ref={this.rootRef}>
                    <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                        <PageHeader
                            onRenderActions={this.handleOnRenderActions}
                            onRenderControls={this.handleOnRenderControls({ columns })}
                            title="Locations"
					        trail={trail}
                            label={<span />}
                            truncate
                            variant="related-list"
                        />
                            <SLDSReactTable
                                PaginationComponent={() => false}
                                ref={this.reactTable}
                                manual="true"
                                loading={this.state.loading}
                                pages={this.state.pages}
                                onFetchData={this.fetchLocationData}
                                filtered={this.state.filtered}
                                defaultFiltered={{ filter_status: 'all' }}
                                columns={displayedColumns}
                                data={this.state.locationList}
                                defaultPageSize={9999}
                                minRows={1}
                                onPageSizeChange={this.onPageSizeChange}
                                noDataText="No Record Found"
                                collapseOnDataChange={true}
                                resizable={true}
                                getTableProps={() => ({ className: 'slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped slds-tbl-roles' })}                               
                            />
                        </IconSettings>
                </div>
                {this.renderModals()}
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

export default connect(mapStateToProps, mapDispatchtoProps)(ListLocation);
