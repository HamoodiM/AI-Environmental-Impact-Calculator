import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email/Password Authentication
  const signup = async (email, password, name) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (name) {
        await result.user.updateProfile({ displayName: name });
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Social Authentication
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      setError(null);
      const provider = new GithubAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    try {
      setError(null);
      return await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      setUserProfile(null);
      return await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Get user profile from backend
  const fetchUserProfile = async (user) => {
    try {
      if (!user) {
        setUserProfile(null);
        return;
      }

      const token = await user.getIdToken();
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
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      const token = await currentUser.getIdToken();
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

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      const token = await currentUser.getIdToken();
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

  // Get user statistics
  const getUserStats = async () => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      const token = await currentUser.getIdToken();
      const response = await api.get('/auth/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Set up auth state listener
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
  }, []);

  // Update API interceptor to include auth token
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        if (currentUser) {
          const token = await currentUser.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    logout,
    updateProfile,
    updatePreferences,
    getUserStats,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
