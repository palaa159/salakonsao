import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyBuOBAbRi3LE-P-Vdv3gQZFo7Cr52Am8M8",
  authDomain: "salakonsao-2db70.firebaseapp.com",
  databaseURL: "https://salakonsao-2db70.firebaseio.com",
  projectId: "salakonsao-2db70",
  storageBucket: "",
  messagingSenderId: "270132613991"
}

function initFirebase () {
  return firebase.initializeApp(config)
}

function getMarkers () {
  return firebase.database().ref('/markers')
}

function pushNewMarker ({ lat, lng, message = 'hello world', owner = '🎈', icon = null, reactions = {}, comments = {} }) {
  return firebase.database().ref('/markers').push({
    lat,
    lng,
    message,
    owner,
    icon,
    reactions,
    comments
  })
}

export default {
  initFirebase,
  getMarkers,
  pushNewMarker
}