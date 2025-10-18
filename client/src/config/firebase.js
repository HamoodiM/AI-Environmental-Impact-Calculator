/**
 * Firebase Configuration
 * 
 * This module initializes Firebase Authentication for the AI Environmental Impact Calculator.
 * Firestore is intentionally disabled to prevent connection issues and relies on the backend API
 * for data persistence instead.
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 1.0.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/**
 * Firebase project configuration
 * Uses environment variables with fallback to default values for development
 */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDz9HNmraeHan6cw8BTKOsm3xsK2QWWzxU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ai-eco-impact-calculator.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ai-eco-impact-calculator",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ai-eco-impact-calculator.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "501019016735",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:501019016735:web:0bc1a3ba62e77adbafdf2a"
};

// Initialize Firebase application
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication service
export const auth = getAuth(app);

/**
 * Firestore Database
 * 
 * Intentionally set to null to prevent connection issues.
 * All data persistence is handled by the backend API instead.
 * This approach provides better reliability and control over data management.
 */
export const db = null;

// Development emulator connection (optional)
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase Auth emulator');
  } catch (error) {
    console.log('Firebase Auth emulator already connected or not available');
  }
}

export default app;
