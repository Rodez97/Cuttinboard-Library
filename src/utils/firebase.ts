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
export const APP = initializeApp(FIREBASE_CONFIG);

// Initialize Firestore
export const FIRESTORE = initializeFirestore(APP, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
});

// Initialize Firebase Auth
export const AUTH = getAuth(APP);

// Initialize Cloud Storage
export const STORAGE = getStorage(APP);

// Initialize Cloud Functions
export const FUNCTIONS = getFunctions(APP);

// Initialize Realtime Database
export const DATABASE = getDatabase(APP);
