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

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.warn('Firebase configuration missing required fields:', missingFields);
    return false;
  }
  return true;
};

// Initialize Firebase application with error handling
let app;
try {
  if (validateFirebaseConfig(firebaseConfig)) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    throw new Error('Invalid Firebase configuration');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Create a mock app object to prevent crashes
  app = {
    name: 'mock-app',
    options: firebaseConfig
  };
}

// Initialize Firebase Authentication service with error handling
let auth;
try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.error('Firebase Auth initialization failed:', error);
  // Create a mock auth object to prevent crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase Auth not available')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase Auth not available')),
    signOut: () => Promise.reject(new Error('Firebase Auth not available')),
    sendPasswordResetEmail: () => Promise.reject(new Error('Firebase Auth not available')),
    signInWithPopup: () => Promise.reject(new Error('Firebase Auth not available'))
  };
}

export { auth };

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
