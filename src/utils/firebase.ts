import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Initialize Firestore
export const FIRESTORE = getFirestore();

// Initialize Firebase Auth
export const AUTH = getAuth();

// Initialize Cloud Storage
export const STORAGE = getStorage();

// Initialize Cloud Functions
export const FUNCTIONS = getFunctions();

// Initialize Realtime Database
export const DATABASE = getDatabase();

// Initialize Firebase Analytics if the platform is browser react js, otherwise return null
export const ANALYTICS =
  typeof window?.document !== "undefined" ? getAnalytics() : null;
