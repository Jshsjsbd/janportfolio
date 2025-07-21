// api/firebase.js
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyDWfUZfnQ2e2zFyxujBFT8nFOww4LgufYw",
  authDomain: "beacontracker-807fe.firebaseapp.com",
  databaseURL: "https://beacontracker-807fe-default-rtdb.firebaseio.com",
  projectId: "beacontracker-807fe",
  storageBucket: "beacontracker-807fe.appspot.com",
  messagingSenderId: "373190411333",
  appId: "1:373190411333:web:1f3000adfe70c9bec80f2c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { db }; 