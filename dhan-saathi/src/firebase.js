import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQGEMxtaH4tMvOl8-MY4E8ulqXXJjX2Lw",
  authDomain: "dhansaathi-1e4f0.firebaseapp.com",
  projectId: "dhansaathi-1e4f0",
  storageBucket: "dhansaathi-1e4f0.firebasestorage.app",
  messagingSenderId: "468432619065",
  appId: "1:468432619065:web:2006ef81e60ec373b2afe8",
  measurementId: "G-Y1TFVVJ7RT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
