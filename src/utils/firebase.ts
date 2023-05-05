import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

/* `export const FIRESTORE = getFirestore();` is exporting a constant named `FIRESTORE` that is
initialized with the `getFirestore()` function from the Firebase library. This constant can be
imported and used in other parts of the code to interact with the Firestore database. */
export const FIRESTORE = getFirestore();

/* `export const AUTH = getAuth();` is exporting a constant named `AUTH` that is initialized with the
`getAuth()` function from the Firebase library. This constant can be imported and used in other
parts of the code to interact with the Firebase Authentication service. */
export const AUTH = getAuth();

/* `export const STORAGE = getStorage();` is initializing a constant named `STORAGE` with the
`getStorage()` function from the Firebase library. This constant can be imported and used in other
parts of the code to interact with the Firebase Storage service. */
export const STORAGE = getStorage();

/* `export const FUNCTIONS = getFunctions();` is initializing a constant named `FUNCTIONS` with the
`getFunctions()` function from the Firebase library. This constant can be imported and used in other
parts of the code to interact with the Firebase Cloud Functions service. */
export const FUNCTIONS = getFunctions();

/* `export const DATABASE = getDatabase();` is initializing a constant named `DATABASE` with the
`getDatabase()` function from the Firebase library. This constant can be imported and used in other
parts of the code to interact with the Firebase Realtime Database service. */
export const DATABASE = getDatabase();
