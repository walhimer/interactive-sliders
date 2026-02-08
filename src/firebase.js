import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration - ready to use!
const firebaseConfig = {
  apiKey: "AIzaSyCoitCxaQI4StS6gxIXuJMB_wc2HV_BNA8",
  authDomain: "interactive-artwork.firebaseapp.com",
  databaseURL: "https://interactive-artwork-default-rtdb.firebaseio.com",
  projectId: "interactive-artwork",
  storageBucket: "interactive-artwork.firebasestorage.app",
  messagingSenderId: "164028022708",
  appId: "1:164028022708:web:9b9f644ae0bf19a818bcc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);
