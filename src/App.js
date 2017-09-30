/* global google */
import React, { Component } from 'react'
import Firebase from './services/firebase'
import { compose, withProps, withStateHandlers } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps'
import moment from 'moment'
import SearchBox from 'react-google-maps/lib/components/places/SearchBox'
import './App.css'

let message = ''
let owner = ''
const markerIcons = [
  {
    icon: 'love',
    title: 'แอปปี้ / อินเลิฟ'
  },
  {
    icon: 'broken',
    title: 'อกหัก / เศร้า'
  },
  {
    icon: 'seen',
    title: 'ฉันเห็น / ฉันเจอ'
  },
  {
    icon: 'forbidden',
    title: 'ไม่ไปเหยียบอีก'
  },
  {
    icon: 'nok',
    title: 'นก'
  },
  {
    icon:'memory',
    title: 'ความทรงจำครั้งเก่า'
  }
]

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
    defaultZoom={14}
    defaultCenter={{ lat: 13.746061, lng: 100.530683 }}
  >
    { props.newMarker && props.newMarker.lat &&
      <Marker
        animation={google.maps.Animation.DROP}
        icon={{
          url: require(`./assets/images/marker-icons/${props.newMarker.icon}.png`),
          scaledSize: new google.maps.Size(40, 40)
        }}
        position={{ lat: props.newMarker.lat, lng: props.newMarker.lng }}
      >
        <InfoWindow onCloseClick={props.onNewMarkerClose}>
          <div>
            <h4>สร้างความทรงจำ:</h4>
            <div>
              { markerIcons.map((x, i) => 
                <a href='#' title={x.title} key={i} onClick={() => props.onSelectPin(x.icon)}>
                  <img width={40} src={require(`./assets/images/marker-icons/${x.icon}.png`)} />
                </a>
                )
              }
            </div>
            <br />
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
        icon={{
          url: require(`./assets/images/marker-icons/${props.markers[key].icon || 'memory'}.png`),
          scaledSize: new google.maps.Size(40, 40)
        }}
        animation={google.maps.Animation.DROP}
        key={i}
        position={{ lat: props.markers[key].lat, lng: props.markers[key].lng }}
        onClick={(m) => props.onMarkerClick(key)}
      >
        {props.markers[key].isOpen && 
          <InfoWindow>
            <div>
              <h3 style={{ marginTop: 5, marginBottom: 5, width: 220 }}>{props.markers[key].message}</h3>
              <div style={{ marginTop: 5, flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  – {props.markers[key].owner}
                </div>
                <div style={{ flex: 1.5, textAlign: 'right' }}>
                  <span>
                    👍 <button onClick={() => props.reaction(key, 'love')}>{props.markers[key].reactions && props.markers[key].reactions.love || 0}</button>&nbsp;
                  </span>
                  <span>
                    👎 <button onClick={() => props.reaction(key, 'hate')}>{props.markers[key].reactions && props.markers[key].reactions.hate || 0}</button>&nbsp;
                  </span>
                  <button onClick={() => props.commenting(key)}>comments ({props.markers[key].comments && Object.keys(props.markers[key].comments).length || 0})</button>
                  <button onClick={() => props.onDeleteMarker(key)}>x</button>
                </div>
              </div>
              { props.markers[key].isCommenting &&
                <div>
                  <input style={{ width: '90%' }} maxLength={120} placeholder={'พิมพ์เลย ไม่เกิน 120 ตัว แล้วกด Enter'} onKeyUp={(evt) => {
                    if (evt.keyCode === 13 && evt.target.value.length) {
                      // this._send(evt.target.value)
                      props.onSubmitComment(key, evt.target.value)
                      // clear
                      evt.target.value = ''
                    }
                  }} />
                  <br />
                  { props.markers[key].comments && Object.keys(props.markers[key].comments).reverse().map((key1, i) => 
                    <div key={i} style={{ marginTop: 5, width: 220 }}>
                      {props.markers[key].comments[key1].content} <span style={{ fontSize: '0.7em', opacity: 0.5 }}>เมื่อ {moment(props.markers[key].comments[key1].createdAt).fromNow()}</span>
                    </div> 
                  )
                  }
                </div>
              }
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
    Firebase.getMarkers().on('value', (snapshot) => { 
      let xx = snapshot.val()
      for (let o in xx) {
        xx[o].isOpen = this.state.markers[o] && this.state.markers[o].isOpen || false
        xx[o].isCommenting = this.state.markers[o] && this.state.markers[o].isCommenting || false
      }
      this.setState({ markers: xx })
    })
    // SearchBox
  
  }
  
  _onMapClick ({ lat, lng }) {
    // reset newMarker
    this.setState({
      newMarker: {
        icon: 'memory'
      }
    })
    let yy = this.state.markers
    // reset isOpen
    for (let j in yy) {
      yy[j].isOpen = false
    }
    this.setState({
      markers: yy,
      newMarker: {
        lat: lat(),
        lng: lng(),
        icon: 'memory'
      }
    })
  }

  _onNewMarkerSubmit () {
    // check for emptiness
    if (message.length > 2 && owner.length > 2) {
      // alert('submitting')
      Firebase.pushNewMarker({
        lat: this.state.newMarker.lat,
        lng: this.state.newMarker.lng,
        message,
        owner,
        icon: this.state.newMarker.icon
      }).then(x => { 
        alert('ขอบคุณที่แชร์เรื่องราว') 
        this.setState({ newMarker: {} })
      })
    } else {
      alert('พิมพ์น้อยจุง')
    }
  }

  _reaction (key, action) {
    let prev = this.state.markers[key].reactions && this.state.markers[key].reactions[action] || 0
    Firebase.addReaction(key, action, prev + 1)
  }

  _submitComment (key, comment) {
    console.log('submitting to ' + key + ': ' + comment)
    Firebase.addComment(key, comment)
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <MapWithInfoWindow
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `${window.innerHeight}px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          onMapClick={this._onMapClick.bind(this)}
          onNewMarkerSubmit={this._onNewMarkerSubmit.bind(this)}
          onNewMarkerClose={() => this.setState({newMarker: {}})}
          markers={this.state.markers}
          newMarker={this.state.newMarker}
          onMarkerClick={(key) => {
            {/* console.log(key) */}
            let yy = this.state.markers
            // reset isOpen
            for (let j in yy) {
              yy[j].isOpen = false
            }
            yy[key].isOpen = !yy[key].isOpen || true
            this.setState({
              markers: yy
            })
          }}
          onSelectPin={(icon) => {
            this.setState({
              newMarker: {...this.state.newMarker, icon}
            })
          }}
          reaction={(key, action) => this._reaction(key, action)}
          commenting={(key) => {
            let yy = this.state.markers
            yy[key].isCommenting = true
            this.setState({
              markers: yy
            })
          }}
          onSubmitComment={(key, comment) => this._submitComment(key, comment)}
          onDeleteMarker={(key) => {
            let c = window.prompt('enter password to delete')
            if (c === 'tenten') Firebase.deleteMarker(key)
          }}
        />
      </div>
    );
  }
}

export default App;
