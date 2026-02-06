// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAQGEMxtaH4tMvOl8-MY4E8ulqXXJjX2Lw",
  authDomain: "dhansaathi-1e4f0.firebaseapp.com",
  projectId: "dhansaathi-1e4f0",
  storageBucket: "dhansaathi-1e4f0.firebasestorage.app",
  messagingSenderId: "468432619065",
  appId: "1:468432619065:web:2006ef81e60ec373b2afe8",
  measurementId: "G-Y1TFVVJ7RT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
// always show account chooser
googleProvider.setCustomParameters({ prompt: "select_account" });

// Analytics is optional + only supported in some environments
export let analytics = null;
isSupported()
  .then((ok) => {
    if (ok) analytics = getAnalytics(app);
  })
  .catch(() => {});

export default app;