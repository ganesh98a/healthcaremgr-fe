import React, { Component } from 'react';
import jQuery from "jquery";
import Select from 'react-select-plus';
import BlockUi from 'react-block-ui';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-block-ui/style.css';
import 'service/jquery.validate.js';
import "service/custom_script.js";
import { checkItsNotLoggedIn, postData, toastMessageShow, queryOptionData } from 'service/common.js';
import '../../../../scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss';
import SLDSReactSelect from 'components/admin/salesforce/lightning/SLDSReactSelect.jsx';
import {
    Modal,
    Checkbox,
    Button,
    IconSettings, Textarea
} from '@salesforce/design-system-react';
import ReactGoogleAutocomplete from 'components/admin/externl_component/ReactGoogleAutocomplete';
import { GOOGLE_MAP_KEY } from 'config.js';

import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';
/**
 * Get person or organization as account
 * @param {obj} e 
 * @param {array} data 
 */
const getParticipantName = (e, data) => {
    return queryOptionData(e, "item/ParticipantLocation/get_participant_name_search", { query: e }, 2, 1);
}


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
 * Class: EditLocationModel
 */
class EditLocationModel extends Component {
    constructor(props) {
        super(props);
        // Check user is logged in or not
        checkItsNotLoggedIn();
        // Initialize state
        this.state = {
            loading: false,
            redirectPage: false,
            name: '',
            participant: { value: this.props.participant_id, label: this.props.participant_name },
            location: '',
            geometryLocation: '',
            description: '',
            active: false,
            lat: -33.8688,
            lng: 151.2195,
            location_id: props.location_id,
            location_address_id: ''
        }
    }

    componentWillMount() {
        requestParticipantLocationData(
            this.state.location_id,
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
                    active: raData.active === 'Yes' ? true : false,
                    unit_number: raData.unit_number
                });
            }

        });
    }

    /**
     * Update the state value of input 
     * @param {Obj} e
     */
    handleChange = (e) => {
        var state = {};
        this.setState({ error: '' });
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    /**
     * Update the state value of Select option
     * @param {Obj} selectedOption
     * @param {str} fieldname
     */
    selectChange = (selectedOption, fieldname) => {
        var state = {};
        state[fieldname] = selectedOption;
        state[fieldname + '_error'] = false;

        this.setState(state);
    }

    /**
     * Update the contact name
     * param {object} item
     */
    updateParticipantName = (item) => {
        var state = {};
        state['participant'] = item;
        this.setState(state);
    }

    /**
     * Call the update api when user save participant
     * Method - POST
     * @param {Obj} e
     */
    submit = (e) => {
        e.preventDefault();
        jQuery("#edit_location").validate({ /* */ });
        var url = 'item/ParticipantLocation/edit_participant_location';
        var validator = jQuery("#edit_location").validate({ ignore: [] });

        // Allow only validation is passed
        if (!this.state.loading && jQuery("#edit_location").valid()) {

            this.setState({ loading: true });
            var req = {
                ...this.state,
                active: this.state.active ? 1 : 0,
                participant_id: this.state.participant ? this.state.participant.value : '',
            };
            // Call Api
            postData(url, req).then((result) => {
                if (result.status) {
                    let msg = result.hasOwnProperty('msg') ? result.msg : '';
                    let participant_id = '';
                    if (result.data) {
                        let resultData = result.data;
                        participant_id = resultData.participant_id || '';
                    }
                    // Trigger success pop 
                    toastMessageShow(result.msg, 's');
                    this.props.closeModal(true);

                } else {
                    // Trigger error pop 
                    toastMessageShow(result.error, "e");
                }
                this.setState({ loading: false });
            });
        } else {
            // Validation is failed
            validator.focusInvalid();
        }
    }

    /**
     * Render the display content
     */
    render() {
        return (
            <React.Fragment>
                <IconSettings iconPath={"/assets/salesforce-lightning-design-system/assets/icons"}>
                    <Modal
                        isOpen={this.props.showModal}
                        footer={[
                            <Button disabled={this.state.loading} key={0} label="Cancel" onClick={() => this.props.closeModal(false)} />,
                            <Button disabled={this.state.loading} key={1} label="Save" variant="brand" onClick={this.submit} />,
                        ]}
                        heading={"Update Location"}
                        size="small"
                        className="slds-modal slds_custom_modal slds_custom_modal_cont_visible"
                        onRequestClose={() => this.props.closeModal(false)}
                        ariaHideApp={false}
                        dismissOnClickOutside={false}
                    >
                        <section className="manage_top" >
                            <div className="container-fluid">
                                <form id="edit_location" autoComplete="off" className="slds_form">
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                    <abbr className="slds-required" title="required">* </abbr>Location Name</label>
                                                <div className="slds-form-element__control">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder=""
                                                        required={true}
                                                        className="slds-input"
                                                        onChange={(value) => this.setState({ name: value.target.value })}
                                                        value={this.state.name || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-2">
                                                    <abbr className="slds-required" title="required"></abbr>Active</label>
                                                <div className="slds-form-element__control">
                                                    <Checkbox
                                                        assistiveText={{
                                                            label: '',
                                                        }}
                                                        id="active"
                                                        labels={{
                                                            label: '',
                                                        }}
                                                        name="active"
                                                        checked={this.state.active}
                                                        onChange={(value) => this.setState({ active: !this.state.active })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <div className="slds-form-element__control">
                                                    <label className="slds-form-element__label" htmlFor="text-input-id-1">
                                                        Apartment/Unit number</label>
                                                    <div className="slds-form-element__control">
                                                        <input type="text"
                                                            name="unit_number"
                                                            placeholder="Apartment/Unit number"
                                                            onChange={(value) => this.handleChange(value)}
                                                            value={this.state.unit_number || ''}
                                                            maxLength="30"
                                                            className="slds-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-3">
                                                    <abbr className="slds-required" title="required">* </abbr>Location</label>
                                                <div className="slds-form-element__control">
                                                    <ReactGoogleAutocomplete className="slds-input add_input mb-1"
                                                        placeholder="street, suburb state postcode, Country"
                                                        name={"location"}
                                                        onPlaceSelected={(place) => {
                                                            var geometryLocation = '';
                                                            if (place.geometry.location) {
                                                                var lat = place.geometry.location.lat();
                                                                var lng = place.geometry.location.lng();
                                                                geometryLocation = {
                                                                    lat: lat,
                                                                    lng: lng
                                                                };
                                                            }

                                                            this.setState({ location: place.formatted_address, geometryLocation: geometryLocation });
                                                        }}
                                                        types={['address']}
                                                        returntype={'array'}
                                                        value={this.state.location || ''}
                                                        onChange={(evt) => {
                                                            var geometryLocation = '';
                                                            this.setState({ location: evt.target.value, geometryLocation: geometryLocation })
                                                        }}
                                                        onKeyDown={(evt) => this.setState({ location: evt.target.value })}
                                                        componentRestrictions={{ country: "au" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-6">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-4">
                                                    <abbr className="slds-required" title="required">*</abbr>Participant</label>
                                                <div className="slds-form-element__control">
                                                    <SLDSReactSelect.Async
                                                        className="default_validation"
                                                        required={true}
                                                        name='participant'
                                                        loadOptions={(e) => getParticipantName(e, [])}
                                                        clearable={true}
                                                        placeholder='Search'
                                                        cache={false}
                                                        value={this.state.participant}
                                                        onChange={(e) => this.updateParticipantName(e)}
                                                        inputRenderer={(props) => <input  {...props} name={"participant"} />}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row py-2 px-2">
                                        <Map
                                            style={{ width: '100%', height: '150px', position: 'relative' }}
                                            containerStyle={{ width: '100%', height: '150px', position: 'relative' }}
                                            google={this.props.google}
                                            initialCenter={{
                                                lat: this.state.geometryLocation ? this.state.geometryLocation.lat : this.state.lat,
                                                lng: this.state.geometryLocation ? this.state.geometryLocation.lng : this.state.lng
                                            }}
                                            center={{
                                                lat: this.state.geometryLocation ? this.state.geometryLocation.lat : this.state.lat,
                                                lng: this.state.geometryLocation ? this.state.geometryLocation.lng : this.state.lng
                                            }}
                                            zoom={15}
                                        >
                                            {
                                                this.state.geometryLocation && <Marker
                                                    position={{ lat: this.state.geometryLocation.lat, lng: this.state.geometryLocation.lng }}
                                                />
                                            }
                                        </Map>
                                    </div>
                                    <div className="row py-2">
                                        <div className="col-sm-12">
                                            <div className="slds-form-element">
                                                <label className="slds-form-element__label" htmlFor="text-input-id-5">
                                                    <abbr className="slds-required" title="required"> </abbr>Description</label>
                                                <div className="slds-form-element__control">
                                                    <Textarea
                                                        type="text"
                                                        name="description"
                                                        placeholder=""
                                                        required={false}
                                                        className="slds-input slds-cus-textarea"
                                                        onChange={(value) => this.handleChange(value)}
                                                        value={this.state.description || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </Modal>
                </IconSettings>
            </React.Fragment>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: (GOOGLE_MAP_KEY)
})(EditLocationModel)
