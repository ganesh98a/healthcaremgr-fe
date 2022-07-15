import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import {mapApiKey} from '../../../../../config.js';

export class MapServiceContainer extends Component {
  constructor(props) {
    super(props);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      markers:  props.markers,data:{}
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ markers: nextProps.markers,showingInfoWindow:false });
  }
  onMarkerClick(props, marker, e) {
    this.setState({
      data:props.data,
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

  onInfoWindowOpen() {
    let divData ='';
    let  stage1 =0 ;
    let  stage2 = 0;
    let  stage3 = 0;
    let  stage4 =0 ;
    let  week =0 ;

return (<div>{divData}
</div>);
    // ReactDOM.render(
    //   React.Children.only(divData),
    //   document.getElementById("iwc")
    // );
  }

  render() {

let markerData = typeof(this.props.markers!='undefined' || this.props.markers!='0')?this.props.markers:[];
    if (!this.props.google) {
      return <div>Loading...</div>;
    }
    const style = {
  width: '100%',
  height: '100%'
}


    //height: "calc(100vh - 20px)"
    return (
      <div>
        <div
          style={{
            position: "relative",
            height: "600px"
          }}
        >
          <Map style={{style}} google={this.props.google} zoom={5}  location="Au"  initialCenter={{
            lat: -25.778519,
            lng: 132.081807
          }}>

          {markerData.map(marker => (
            <Marker
              position={{ lat: marker.latitude, lng: marker.longitude }}
              onClick={this.onMarkerClick}
              name={marker.title}
              data={marker}
              icon={{
              url: "/assets/icons/map-icons_35.png",
              }}
            />
             ))}
             {
            // <InfoWindow
            //   marker={this.state.activeMarker}
            //   visible={this.state.showingInfoWindow}
            //
            // >
            //
            //   <div id="iwc" >{this.onInfoWindowOpen()}</div>
            // </InfoWindow>
          }
          {  // <InfoWindow
            //   marker={this.state.activeMarker}
            //   visible={this.state.showingInfoWindow}
            //   onOpen={e => {
            //     this.onInfoWindowOpen(this.props, e);
            //   }}
            // >
            //
            //   <div id="iwc" />
            // </InfoWindow>
          }
          </Map>
        </div>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: mapApiKey,
  v: "3.30"
})(MapServiceContainer);
