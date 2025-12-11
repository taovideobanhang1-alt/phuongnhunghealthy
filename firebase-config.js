// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyA6bPO-ozAderQl_WyRDvr1FFtFmOV2whE",
  authDomain: "phuongnhung-healthy-dd33d.firebaseapp.com",
  databaseURL: "https://phuongnhung-healthy-dd33d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phuongnhung-healthy-dd33d",
  storageBucket: "phuongnhung-healthy-dd33d.appspot.com",
  messagingSenderId: "311311739084",
  appId: "1:311113370048:web:617722234cb411fae66025",
  measurementId: "G-G202GELR9J"
};

// init (compat)
firebase.initializeApp(firebaseConfig);

// export global FB object used by firebase-api.js and script.js
const FB = {
  app: firebase.app(),
  db: firebase.firestore(),
  storage: firebase.storage()
};
