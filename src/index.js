import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Firebase from './services/firebase'
import registerServiceWorker from './registerServiceWorker';

Firebase.initFirebase()
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
