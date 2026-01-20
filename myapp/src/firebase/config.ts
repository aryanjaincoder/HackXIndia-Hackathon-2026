import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Aapka config object (yeh bilkul sahi hai)
const firebaseConfig = {
  apiKey: "AIzaSyB5VDEo4ewfFQbhj0tqMPAnwhza2fPICe8",
  authDomain: "zenithely.firebaseapp.com",
  projectId: "zenithely",
  storageBucket: "zenithely.firebasestorage.app",
  messagingSenderId: "1079569948368",
  appId: "1:1079569948368:web:de96220d769739c2d648d5",
  measurementId: "G-ETT007M5LV"
};

// --- Services ko Initialize aur Export karein ---

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize aur Export services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const analytics: Analytics = getAnalytics(app);

export default app;