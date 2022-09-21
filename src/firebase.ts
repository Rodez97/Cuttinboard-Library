import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

/**
 * Opciones con las que inicializar/configurar la app de Firebase
 */
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

// Inicializar la app de Firebase
export const App = initializeApp(FIREBASE_CONFIG);
/**
 * Instancia de Firestore
 */
export const Firestore = initializeFirestore(App, {
  ignoreUndefinedProperties: true,
});
/**
 * Instancia de Auth
 */
export const Auth = getAuth(App);
/**
 * Instancia de Storage
 */
export const Storage = getStorage(App);
/**
 * Instancia de Functions
 */
export const Functions = getFunctions(App);
/**
 * Instancia de Realtime Database
 */
export const Database = getDatabase(App);
