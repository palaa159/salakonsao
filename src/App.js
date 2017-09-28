import React, { Component } from 'react'
import Firebase from './services/firebase'
import { compose, withProps, withStateHandlers } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps'
import './App.css'

let message = ''
let owner = ''

const MapWithInfoWindow = compose(
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    onClick={(evt) => {
      const { lat, lng } = evt.latLng
      props.onMapClick({ lat, lng })
      {/* props.onMapClick({ lat, lng }) */}
    }}
    defaultZoom={15}
    defaultCenter={{ lat: 13.746061, lng: 100.530683 }}
  >
    { props.newMarker && props.newMarker.lat &&
      <Marker
        position={{ lat: props.newMarker.lat, lng: props.newMarker.lng }}
        onClick={props.onToggleOpen}
      >
        <InfoWindow>
          <div>
            <h4>สร้างความทรงจำ:</h4>
            <textarea rows={4} type='text' placeholder='ใส่ความทรงจำ' onChange={(evt) => 
              message = evt.target.value} />
            <br/>
            <input type='text' placeholder='ชื่อคุณ' onChange={(evt) => owner = evt.target.value} />
            <br/>
            <button onClick={() => props.onNewMarkerSubmit()}>ส่ง</button>
            <h6>*ไม่ต้องห่วง ทุกอย่างเป็น Anonymous</h6>
          </div>
        </InfoWindow>
      </Marker>
    }
    { props.markers && Object.keys(props.markers).map((key, i) =>
      <Marker
        /* icon={{
          url: require('./assets/images/orange.jpg')
        }}
        */
        title={'test'}
        key={i}
        position={{ lat: props.markers[key].lat, lng: props.markers[key].lng }}
        onClick={(m) => props.onMarkerClick(key)}
      >
        {props.isOpen && 
          <InfoWindow onCloseClick={props.onToggleOpen}>
            <div>
              🎈
              <h3 style={{ marginTop: 5, marginBottom: 5, width: 220 }}>"lorem ipsum blah blah another hipster lipstick"</h3>
              <div style={{ marginTop: 5, flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  – Apon
                </div>
                <div style={{ flex: 1.5 }}>
                  ❤️ 28
                  💔 2
                  😆 8
                  😏 0
                </div>
              </div>
            </div>
          </InfoWindow>
        }
      </Marker>
      )
    }
  </GoogleMap>
)

class App extends Component {

  state = {
    markers: {},
    newMarker: {
      message: '',
      owner: ''
    }
  }

  componentDidMount() {
    console.log(this.state.newMarker)
    Firebase.getMarkers().on('value', (snapshot) => this.setState({ markers: snapshot.val() }))
  }
  
  _onMapClick ({ lat, lng }) {
    // Close all InfoWindows
    // Firebase.pushNewMarker({
    //   lat: lat(),
    //   lng: lng()
    // })
    this.setState({
      newMarker: {
        lat: lat(),
        lng: lng()
      }
    })
  }

  _onNewMarkerMessage (val) {
    console.log(val)
    this.setState({
      newMarker: {...this.state.newMarker, message: val}
    })
  }

  _onNewMarkerOwner (val) {
    this.setState({
      newMarker: {...this.state.newMarker, owner: val}
    })
  }

  _onNewMarkerSubmit () {
    // check for emptiness
    if (message.length > 2 && owner.length > 2) {
      // alert('submitting')
      Firebase.pushNewMarker({
        lat: this.state.newMarker.lat,
        lng: this.state.newMarker.lat,
        message,
        owner
      })
    } else {
      alert('พิมพ์น้อยจุง')
    }
  }

  render() {
    return (
      <div className="App">
        <MapWithInfoWindow
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `${window.innerHeight}px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          onMapClick={this._onMapClick.bind(this)}
          onNewMarkerMessage={this._onNewMarkerMessage.bind(this)}
          onNewMarkerOwner={this._onNewMarkerOwner.bind(this)}
          onNewMarkerSubmit={this._onNewMarkerSubmit.bind(this)}
          markers={this.state.markers}
          newMarker={this.state.newMarker}
          onMarkerClick={(key) => {
            let newObj = this.state.markers[key]
            newObj.isOpen = !newObj.isOpen || true
            this.setState({
              markers: {...this.state.markers, ...newObj}
            })
          }}
        />
      </div>
    );
  }
}

export default App;
