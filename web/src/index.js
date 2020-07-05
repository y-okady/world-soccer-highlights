import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/analytics';
import 'uikit/dist/css/uikit.min.css';

firebase.initializeApp({
  apiKey: "AIzaSyDpckha5K7f8mIFjD9gnN3zpyN2wdlHOek",
  authDomain: "world-soccer-highlights.firebaseapp.com",
  databaseURL: "https://world-soccer-highlights.firebaseio.com",
  projectId: "world-soccer-highlights",
  storageBucket: "world-soccer-highlights.appspot.com",
  messagingSenderId: "351334051556",
  appId: "1:351334051556:web:9c23d39cff1665f7fb06f1",
  measurementId: "G-Z6XTDCH3GQ"
});
firebase.analytics();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
