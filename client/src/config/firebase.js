import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDz9HNmraeHan6cw8BTKOsm3xsK2QWWzxU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ai-eco-impact-calculator.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ai-eco-impact-calculator",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ai-eco-impact-calculator.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "501019016735",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:501019016735:web:0bc1a3ba62e77adbafdf2a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
