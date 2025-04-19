import { initializeApp , getApps , getApp ,  } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB0YPxnXe3M42n-okDFfHoZ1KHsNwJ9B9I",
    authDomain: "e-com-19e6e.firebaseapp.com",
    projectId: "e-com-19e6e",
    storageBucket: "e-com-19e6e.firebasestorage.app",
    messagingSenderId: "96236818904",
    appId: "1:96236818904:web:1fb6b158c0c6c7fc02e2ad",
    measurementId: "G-BBS8KXEWCE"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app); 
