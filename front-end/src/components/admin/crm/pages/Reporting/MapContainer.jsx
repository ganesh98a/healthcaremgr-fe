import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import {mapApiKey} from '../../../../../config.js';

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    // this.onMarkerClick = this.onMarkerClick.bind(this);
    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      markers: props.markers, data: {}, filterr: parseInt(props.filter)
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ markers: nextProps.markers, filterr: parseInt(nextProps.filter), showingInfoWindow: false });
  }

  onMarkerClick = (props, marker, e) =>{
    this.setState({
      data: props.data,
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

  onInfoWindowOpen() {
    let divData = '';
    let stage1 = 0;
    let stage2 = 0;
    let stage3 = 0;
    let stage4 = 0;
    let week = 0;
    switch (this.state.filterr) {
      case 0:
        stage1 = typeof (this.state.data.stage1) != 'undefined' ? this.state.data.stage1 : 0;
        stage2 = typeof (this.state.data.stage2) != 'undefined' ? this.state.data.stage2 : 0;
        stage3 = typeof (this.state.data.stage3) != 'undefined' ? this.state.data.stage3 : 0;
        week = typeof (this.state.data.allcreatedinthisweek) != 'undefined' ? this.state.data.allcreatedinthisweek : 0;
        divData = (
          <div className="Map_design_1">
            <div className="Map_header"> Participant Overview </div>
            <div className="list_map Map-margin">
              <span>Total No. of participant in area :</span>
              <span>{parseInt(stage1) + parseInt(stage2) + parseInt(stage3)} </span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 1:</span>
              <span> {stage1}</span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 2: </span>
              <span>{stage2}</span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 3: </span>
              <span>{stage3}</span>
            </div>
            <div >
              <span className="list_map Map_footer"> New Participant This Week:</span>
              <span>{week}</span>
            </div>

          </div>



        );
        break;
      case 1:
        stage1 = typeof (this.state.data.stage1) != 'undefined' ? this.state.data.stage1 : 0;
        week = typeof (this.state.data.stage_count1) != 'undefined' ? this.state.data.stage_count1 : 0;
        divData = (
          <div className="Map_design_1">
            <div className="Map_header"> Participant Overview </div>
            <div className="list_map Map-margin">Total No. of participant in area :{stage1} </div>
            <div className="list_map"> Participant in Stage 1: {stage1}</div>
            <div >
              <span className="list_map Map_footer"> New Participant This Week:</span>
              <span>{week}</span>
            </div>
          </div>
        );
        break;
      case 2:
        stage1 = typeof (this.state.data.stage4) != 'undefined' ? this.state.data.stage4 : 0;
        stage2 = typeof (this.state.data.stage5) != 'undefined' ? this.state.data.stage5 : 0;
        stage3 = typeof (this.state.data.stage6) != 'undefined' ? this.state.data.stage6 : 0;
        stage4 = typeof (this.state.data.stage7) != 'undefined' ? this.state.data.stage7 : 0;
        week = typeof (this.state.data.stage_count) != 'undefined' ? this.state.data.stage_count : 0;
        divData = (

          <div className="Map_design_1">
            <div className="Map_header"> Participant Overview </div>
            <div className="list_map Map-margin">
              <span>Total No. of participant in area :</span> <span>{parseInt(stage1) + parseInt(stage2) + parseInt(stage3) + parseInt(stage4)} </span>
            </div>
            <div className="list_map">
              <span>Participant in Stage 2.1:</span>
              <span>{stage1}</span>
            </div>
            <div className="list_map">
              <span>Participant in Stage 2.2: </span>
              <span>{stage2}</span>
            </div>
            <div className="list_map">
              <span>Participant in Stage 2.3:</span>
              <span>{stage3}</span>
            </div>
            <div className="list_map">
              <span >Participant in Stage 2.4:</span>
              <span>{stage4}</span>
            </div>
            <div >
              <span className="list_map Map_footer"> New Participant This Week:</span>
              <span>{week}</span>
            </div>
          </div>

        );
        break;
      case 3:
        stage1 = typeof (this.state.data.stage8) != 'undefined' ? this.state.data.stage8 : 0;
        stage2 = typeof (this.state.data.stage9) != 'undefined' ? this.state.data.stage9 : 0;
        stage3 = typeof (this.state.data.stage10) != 'undefined' ? this.state.data.stage10 : 0;
        stage4 = typeof (this.state.data.stage11) != 'undefined' ? this.state.data.stage11 : 0;
        week = typeof (this.state.data.stage_count) != 'undefined' ? this.state.data.stage_count : 0;
        divData = (
          <div className="Map_design_1">
            <div className="Map_header"> Participant Overview </div>
            <div className="list_map Map-margin">
              <span>Total No. of participant in area :</span>
              <span>{parseInt(stage1) + parseInt(stage2) + parseInt(stage3) + parseInt(stage4)} </span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 3.1:</span>
              <span> {stage1}</span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 3.2: </span>
              <span>{stage2}</span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 3.3: </span>
              <span>{stage3}</span>
            </div>
            <div className="list_map">
              <span> Participant in Stage 3.4:</span>
              <span>{stage4}</span>
            </div>
            <div className="list_map">
              <span> New Participant This Week:</span>
              <span>{week}</span>
            </div>
          </div>
        );
        break;
    }
    return (<div>{divData}
    </div>);
    // ReactDOM.render(
    //   React.Children.only(divData),
    //   document.getElementById("iwc")
    // );
  }

  render() {
    let markerData = (this.state.markers != '') ? this.state.markers : [];

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
          <Map style={{ style }} google={this.props.google} zoom={5} location="Au" initialCenter={{
            lat: -25.778519,
            lng: 132.081807
          }}>

            {markerData.map((marker, i) => (
              <Marker
                position={{ lat: marker.latitude, lng: marker.longitude }}
                onClick={this.onMarkerClick}
                name={marker.title}
                data={marker}
                key={i}
                icon={{
                  url: "/assets/icons/map-icons_35.png",

                }}
              />
            ))}
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}

            >

              <div id="iwc" >{this.onInfoWindowOpen()}</div>
            </InfoWindow>
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
})(MapContainer);
