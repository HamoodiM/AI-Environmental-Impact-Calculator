/**
 * Authentication Context
 * 
 * Provides authentication functionality for the AI Environmental Impact Calculator.
 * Handles user registration, login, social authentication, and profile management
 * through Firebase Authentication and backend API integration.
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

// Create authentication context
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to child components.
 * Manages user authentication through Firebase Auth and profile data through backend API.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} AuthProvider component
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Register a new user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} name - User's display name
   * @returns {Promise<Object>} Firebase user creation result
   * @throws {Error} If registration fails
   */
  const signup = async (email, password, name) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name in Firebase Auth
      if (name && result.user && typeof result.user.updateProfile === 'function') {
        await result.user.updateProfile({ displayName: name });
      }
      
      // User profile will be created via backend API when they first access the dashboard
      console.log('User created successfully - profile will be created via backend API');
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Sign in user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Firebase sign-in result
   * @throws {Error} If sign-in fails
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Last login will be updated via backend API
      console.log('User logged in successfully');
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Sign in user with Google OAuth
   * 
   * @returns {Promise<Object>} Firebase sign-in result
   * @throws {Error} If sign-in fails
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // User profile will be created/updated via backend API
      console.log('Google sign-in successful - profile will be managed via backend API');
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Sign in user with GitHub OAuth
   * 
   * @returns {Promise<Object>} Firebase sign-in result
   * @throws {Error} If sign-in fails
   */
  const signInWithGithub = async () => {
    try {
      setError(null);
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // User profile will be created/updated via backend API
      console.log('GitHub sign-in successful - profile will be managed via backend API');
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Send password reset email to user
   * 
   * @param {string} email - User's email address
   * @returns {Promise<void>} Password reset email result
   * @throws {Error} If password reset fails
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      return await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Sign out current user
   * 
   * @returns {Promise<void>} Sign-out result
   * @throws {Error} If sign-out fails
   */
  const logout = async () => {
    try {
      setError(null);
      setUserProfile(null);
      setCurrentUser(null);
      
      // Clear localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('lastCalculation');
      localStorage.removeItem('userProfile');
      
      // Clear any other app-specific storage
      localStorage.removeItem('calculationHistory');
      localStorage.removeItem('userPreferences');
      
      return await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Fetch user profile from backend API
   * 
   * @param {Object} user - Firebase user object
   * @returns {Promise<void>}
   */
  const fetchUserProfile = useCallback(async (user) => {
    try {
      if (!user) {
        setUserProfile(null);
        return;
      }

      // In development mode, always use dev-token
      const token = process.env.REACT_APP_NODE_ENV === 'development' ? 'dev-token' : await user.getIdToken();
      
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
    }
  }, []);

  /**
   * Update user profile information
   * 
   * @param {Object} updates - Profile updates to apply
   * @returns {Promise<Object>} Updated profile data
   * @throws {Error} If update fails
   */
  const updateProfile = async (updates) => {
    try {
      if (!currentUser && process.env.REACT_APP_NODE_ENV !== 'development') {
        throw new Error('No user logged in');
      }
      
      // In development mode, always use dev-token
      const token = process.env.REACT_APP_NODE_ENV === 'development' ? 'dev-token' : await currentUser.getIdToken();
      
      const response = await api.put('/auth/profile', updates, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserProfile(response.data);
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Update user preferences
   * 
   * @param {Object} preferences - User preferences to update
   * @returns {Promise<Object>} Updated preferences
   * @throws {Error} If update fails
   */
  const updatePreferences = async (preferences) => {
    try {
      if (!currentUser && process.env.REACT_APP_NODE_ENV !== 'development') {
        throw new Error('No user logged in');
      }
      
      // In development mode, always use dev-token
      const token = process.env.REACT_APP_NODE_ENV === 'development' ? 'dev-token' : await currentUser.getIdToken();
      
      const response = await api.put('/auth/preferences', preferences, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserProfile(prev => ({
        ...prev,
        preferences: response.data
      }));
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Get user statistics from backend API
   * 
   * @returns {Promise<Object>} User statistics data
   * @throws {Error} If fetch fails
   */
  const getUserStats = useCallback(async () => {
    try {
      // In development mode, always use dev-token
      const token = process.env.REACT_APP_NODE_ENV === 'development' ? 'dev-token' : 
                   (currentUser ? await currentUser.getIdToken() : null);
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await api.get('/auth/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      setError(error.message);
      throw error;
    }
  }, [currentUser]);

  // Set up Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserProfile]);

  // Context value object
  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    error,
    
    // Authentication methods
    signup,
    login,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    logout,
    
    // Profile management
    updateProfile,
    updatePreferences,
    getUserStats,
    
    // Utility methods
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};