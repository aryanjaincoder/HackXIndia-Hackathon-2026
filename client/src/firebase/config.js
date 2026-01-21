<<<<<<< HEAD
// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Yahaan par Firebase config daalein ---
// (Yeh keys aapke pichhle conversation se hain)
const firebaseConfig = {
  apiKey: "AIzaSyB5VDEo4ewfFQbhj0tqMPAnwhza2fPICe8",
  authDomain: "zenithely.firebaseapp.com",
  projectId: "zenithely",
  storageBucket: "zenithely.firebasestorage.app",
  messagingSenderId: "1079569948368",
  appId: "1:1079569948368:web:de96220d769739c2d648d5",
  measurementId: "G-ETT007M5LV"
};

// --- Firebase services ko initialize karein ---
const app = initializeApp(firebaseConfig);

// Services ko export karein taaki poori app use kar sake
export const auth = getAuth(app);
export const db = getFirestore(app);
=======
// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);

>>>>>>> 2456ec264d991bff9cb8d8ee3f6e135ecaf2b092
