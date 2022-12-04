import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Firebase configuration object
export const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyAfvaqijLqBAj8dou3yTbbzrUbO-8jT32k",
  authDomain: "app.cuttinboard.com",
  databaseURL: "https://cuttinboard-2021-default-rtdb.firebaseio.com",
  projectId: "cuttinboard-2021",
  storageBucket: "cuttinboard-2021.appspot.com",
  messagingSenderId: "286988124291",
  appId: "1:286988124291:web:114898298b49f9ab949bb6",
  measurementId: "G-F2B7ZNZWD3",
};

// Initialize the Firebase app
export const App = initializeApp(FIREBASE_CONFIG);

// Initialize Firestore
export const Firestore = initializeFirestore(App, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
});

// Initialize Firebase Auth
export const Auth = getAuth(App);

// Initialize Cloud Storage
export const Storage = getStorage(App);

// Initialize Cloud Functions
export const Functions = getFunctions(App);

// Initialize Realtime Database
export const Database = getDatabase(App);
