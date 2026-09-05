import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- ADD THIS

// Replace this with your actual Firebase config object

const firebaseConfig = {
  apiKey: "AIzaSyCfFDr7OI3BafyRAmlILOMwkKH-oPrn66A",
  authDomain: "mrgymunisex.firebaseapp.com",
  projectId: "mrgymunisex",
  storageBucket: "mrgymunisex.firebasestorage.app",
  messagingSenderId: "561515029190",
  appId: "1:561515029190:web:d30605dc64816b8421edc7",
  measurementId: "G-VEXSVPS5DG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- ADD THIS

export const COLLECTIONS = {
  ADMINS: 'admins',
  MEMBERS: 'members',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
} as const;


