import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "seanraynon",
  appId: "1:87757698965:web:f6ff5deafc8e2cf3a3689c",
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "seanraynon.firebaseapp.com",
  storageBucket: "seanraynon.firebasestorage.app",
  messagingSenderId: "87757698965",
  measurementId: "G-HQCCWRTQ7W",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
