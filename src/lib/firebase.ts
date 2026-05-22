import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  projectId: "seanraynon",
  appId: "1:87757698965:web:f6ff5deafc8e2cf3a3689c",
  apiKey: firebaseApiKey ?? "",
  authDomain: "seanraynon.firebaseapp.com",
  storageBucket: "seanraynon.firebasestorage.app",
  messagingSenderId: "87757698965",
  measurementId: "G-HQCCWRTQ7W",
};

if (!firebaseConfig.apiKey) {
  throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
