import React, { Component } from 'react';
import moment from 'moment-timezone';

import Modal from 'react-bootstrap/lib/Modal';

import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";
import { custNumberLine,customHeading, customNavigation } from '../../../service/CustomContentLoader.js';
import { GOOGLE_MAP_KEY } from '../../../config.js';

import {Map,Marker, GoogleApiWrapper} from 'google-maps-react';
class UserLocation extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            loading: false,
            location: [],
            allocated_member: []
        }
    }

    componentWillReceiveProps(newProps) {
       if(newProps.location){
             this.setState(newProps.location);
        }
    }
    

    render() {
      
        return (
                <div>
            <Modal
               className={"Modal_A "+this.props.color+" width_700"}
               show={this.props.openLocation}
               onHide={this.handleHide}
               container={this}
               aria-labelledby="contained-modal-title"
             >
              <Modal.Body>
                <div className="dis_cell CSD_modal">
                <ReactPlaceholder showLoadingAnimation ={true}  customPlaceholder={ customHeading(40)} ready={!this.state.loading}>
                    <div className="text text-left Popup_h_er_1"><span>User Location</span>
                        <a onClick={this.props.closeModel} className="close_i"><i className="icon icon-cross-icons"></i></a>
                    </div>
                    </ReactPlaceholder>
                    <div className="row mt-5">
                        <Map
                            style={{width: '100%', height: '100%', position: 'relative'}}
                            google={this.props.google}
                            initialCenter={{lat: this.state.lat, lng: this.state.long}}
                            ><Marker
                                position={{lat: this.state.lat, lng: this.state.long}}
                            />
                        </Map>
                     </div>
                     <div className="row mt-5">
                            <a onClick={this.props.closeModel} className="close_i pull-right mt-1">Close</a>
                      </div>
                   </div>
               </Modal.Body>
            </Modal>
        </div>
        );
    }
}

export default GoogleApiWrapper({
  apiKey: (GOOGLE_MAP_KEY)
})(UserLocation)

