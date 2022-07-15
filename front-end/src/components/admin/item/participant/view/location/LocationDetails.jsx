import React, { Component } from 'react';
import 'react-select-plus/dist/react-select-plus.css';
import { Link } from 'react-router-dom';
import 'react-table/react-table.css'
import { css, postData, toastMessageShow, AjaxConfirm, queryOptionData } from 'service/common.js';
import _ from 'lodash';
import { connect } from 'react-redux'
import { ROUTER_PATH } from 'config.js';
import PropTypes from 'prop-types';
import moment from "moment";
import jQuery from 'jquery';
import { Redirect } from 'react-router';
import { 
    IconSettings, 
    PageHeader, 
    PageHeaderControl, 
    Icon, 
    ButtonGroup, 
    Button, 
    Tabs,
    TabsPanel,
} from '@salesforce/design-system-react';
import '../../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import '../../../../scss/components/admin/item/item.scss';
import EditLocationModel from './EditLocationModel.jsx';
import { GOOGLE_MAP_KEY } from 'config.js';
import {Map,Marker, GoogleApiWrapper} from 'google-maps-react';
import ReactHtmlParser from 'react-html-parser';
import {getAddressForViewPage} from '../../../../oncallui-react-framework/services/common';


/**
 * RequestData get the data of participant location
 * @param {int} locationId
 */
const requestParticipantLocationData = (locationId) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { location_id: locationId };
        postData('item/ParticipantLocation/get_participant_location_data_by_id', Request).then((result) => {
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
 * Class: LocationDetails
 */
class LocationDetails extends React.Component {

    static defaultProps = {
        /**
         * @type {string | React.ReactNode}
         */
        notAvailable: <span>&nbsp;</span>
    }

    constructor(props) {
        super(props);
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            participant_id: '',
            name: '',
            participant_name: '',
            active: '',
            created_by: '',
            created_at: '',
            updated_by: '',
            updated_at: '',
            contact: '',
            openEditLocation: false,
            participant_id: '',
            location: '',
            description: '',
            location_id: this.props.match.params.id,
            geometryLocation: '',
            lat: -33.8688,
            lng: 151.2195,
        }

        this.rootRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
        this.handleDetailsTab = this.renderDetailsTab.bind(this);
    }
 
    /**
     * When component is mounted, remove replace the parent element
     */
    componentDidMount() {
        const id = this.props.match.params.id;
        this.getPLDetails(id);
        jQuery(this.rootRef.current).parents('div').parent('.col-lg-11').removeClass('col-lg-11').addClass('col-lg-12')
    }

    componentWillUnmount() {
        jQuery(this.rootRef.current).parents('div').parent('.col-lg-12').removeClass('col-lg-12').addClass('col-lg-11')
    }

    /**
     * Call requestParticipantLocationData
     * @param {int} id
     */
    getPLDetails = (id) => {
        requestParticipantLocationData(
            id,
        ).then(res => {
            var raData = res.data;
            if (raData) {
                this.setState({
                    location_id: raData.location_id,
                    location_address_id: raData.location_address_id,
                    name: raData.name,
                    participant_id: raData.participant_id,
                    participant_name: raData.participant_name,
                    participant: { value: raData.participant_id, label: raData.participant_name },
                    description: raData.description,
                    geometryLocation: raData.lat && raData.lng ? { lat: raData.lat, lng: raData.lng } : '',
                    location: raData.address,
                    unit_number: raData.unit_number,
                    active: raData.active,
                    created_by: raData.created_by,
                    created_at: raData.created_at,
                    updated_by: raData.updated_by,
                    updated_at: raData.updated_at,
                });    
            }
            
        });
    }

    /**
     * Update the stage index
     * param {int} stage
     */
    handleClick = (stage) => {
        const state = this.state;
        state['stage_index'] = stage;
        this.setState(state);
    }

    /**
     * Renders link for related account. 
     * Account can link back to 'organisation' or 'contact'
     */
    renderRelatedParticipantLink() {
        const participant_name = _.get(this.state, 'participant_name')
        const participant_id = _.get(this.state, 'participant_id')
        let tooltip = undefined
        if (!participant_id) {
            return this.props.notAvailable
        }

        tooltip = `${participant_name} (participant)`

        return <Link to={ROUTER_PATH + `admin/item/participant/details/${participant_id}`} className="reset" style={{ color: '#006dcc' }} title={tooltip}>{participant_name}</Link>

    }

    /**
     * Renders the page header
     */
    renderPageHeader() {
        const header = {
            label: "Location",
            title: this.state.name || '',
            icon: {
                category: "standard",
                name: "location",
                label: "Location",
            },
            details: [
                {
                    label: 'Participant',
                    content: this.renderRelatedParticipantLink(),
                },
            ],
        }

        return (
            <PageHeader
                variant={"record-home"}
                title={header.title}
                icon={this.renderIcon(header.icon)}
                onRenderActions={this.renderActions}
                details={header.details}
                label={header.label}
            />
        )
    }

    /**
     * Render icon
     */
    renderIcon = ({ label, category, name }) => {
        return (
            <Icon
                assistiveText={{ label: label }}
                category={category}
                name={name}
            />
        );
    }

    /**
     * Render action for `<PageHeader />`
     */
    renderActions = () => {
        return (
            <PageHeaderControl>
                <ButtonGroup variant="list" id="button-group-page-header-actions">
                    <Button label="Edit" title={`Update Location`} onClick={() => this.showEditLocationModal(this.state.location_id)}/>
                    <Button label="Delete" title={`Delete Location`} onClick={() => this.handleOnArchiveLocation(this.state.location_id)}/>
                </ButtonGroup>
            </PageHeaderControl>
        )
    }

    /**
     * Render Left side tab
     */
    renderTab = () => {
        const tab = [
            {
                label: "Details",
                content: this.handleDetailsTab,
            }
        ]
        return (
            <Tabs>
                {
                    tab.map((tabbar, index) => {
                        return (
                            <TabsPanel label={tabbar.label} key={index}>
                                {tabbar.content()}
                            </TabsPanel>
                        )
                    })
                }
            </Tabs>
        );
    }

    /**
     * Renders the details tab
     */
    renderDetailsTab() {
        const notAvailable = 'N/A';
        const id = _.get(this.props, 'props.match.params.id');
        return (
            <div className="slds-detailed-tab container-fluid">
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Location Name</label>
                            <div className="slds-form-element__control">
                                {this.state.name || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Active</label>
                            <div className="slds-form-element__control">
                                {this.state.active || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Location</label>
                            <div className="slds-form-element__control">
                                {getAddressForViewPage(this.state.location, this.state.unit_number)}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Participant</label>
                            <div className="slds-form-element__control">
                                {this.state.participant_name || notAvailable}
                            </div>
                        </div>                    
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-12">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Description</label>
                            <div className="slds-form-element__control">
                                {ReactHtmlParser(this.state.description) || notAvailable}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Created By</label>
                            <div className="slds-form-element__control">
                                {this.state.created_by || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Created Date</label>
                            <div className="slds-form-element__control">
                                {
                                    moment(this.state.created_at).isValid() ? moment(this.state.created_at).format("DD/MM/YYYY") : notAvailable
                                }
                            </div>
                        </div>                    
                    </div>
                </div>
                <div className="row py-2">
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Last Modified By</label>
                            <div className="slds-form-element__control">
                                {this.state.updated_by || notAvailable}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="slds-form-element">
                            <label className="slds-form-element__label">Last Modified Date</label>
                            <div className="slds-form-element__control">
                                {                                    
                                    moment(this.state.updated_at).isValid() ? moment(this.state.updated_at).format("DD/MM/YYYY") : notAvailable
                                }
                            </div>
                        </div>                    
                    </div>
                </div>
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
            this.getPLDetails(this.state.location_id);
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
                this.setState({ redirectTo: 'admin/item/participant/locations/'+this.state.participant_id })
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

    renderMap = () => {
        return (
            <Map
                style={{width: '100%', height: '25rem', position: 'relative'}}
                containerStyle={{width: '100%', height: '100%', position: 'relative'}}
                google={this.props.google}
                initialCenter={{
                    lat:  this.state.geometryLocation ? this.state.geometryLocation.lat : this.state.lat,
                    lng: this.state.geometryLocation ? this.state.geometryLocation.lng : this.state.lng
                }}
                center={{
                    lat:  this.state.geometryLocation ? this.state.geometryLocation.lat : this.state.lat,
                    lng: this.state.geometryLocation ? this.state.geometryLocation.lng : this.state.lng
                }}
                zoom={15}
                >
                    {
                        this.state.geometryLocation && <Marker
                            position={{lat: this.state.geometryLocation.lat, lng: this.state.geometryLocation.lng}}
                        />
                    }                                                
            </Map>
        );
    }


    render() {
        // This will only run when you delete particpant
        if (this.state.redirectTo) {
            return <Redirect to={ROUTER_PATH + this.state.redirectTo} />
        }
        return (
            <div className="ParticpantDetails slds" ref={this.rootRef}>
                <IconSettings iconPath="/assets/salesforce-lightning-design-system/assets/icons">
                    <div className="slds-grid slds-grid_vertical">
                        <div className="slds-col custom_page_header">
                            {this.renderPageHeader()}
                        </div>
                        <div className="slds-col">
                            <div className="slds-grid slds-wrap slds-gutters_x-small">
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_7-of-12 slds-large-size_8-of-12 slds-p-right_small">
                                    <div className="white_bg_color slds-box">
                                        {this.renderTab()}
                                    </div>
                                </div>
                                <div className="slds-col slds-m-top_medium slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_4-of-12 ">
                                    <div className="white_bg_color slds-box">
                                        {this.renderMap()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderModals()}
                </IconSettings>
            </div>
        )
    };
};

export default GoogleApiWrapper({
    apiKey: (GOOGLE_MAP_KEY)
  })(LocationDetails)