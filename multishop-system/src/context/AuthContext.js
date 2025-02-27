import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '../services/firebase';

// Create context
export const AuthContext = createContext();

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing login session on app load
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log('Failed to load user from storage:', e);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await firebase
          .firestore()
          .collection('users')
          .doc(firebaseUser.uid)
          .get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const fullUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData,
          };
          
          setUser(fullUserData);
          await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
        } else {
          // User document doesn't exist
          setUser(null);
          await AsyncStorage.removeItem('user');
        }
      } else {
        // No user is signed in
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });

    loadStoredUser();
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      await firebase.auth().signInWithEmailAndPassword(email, password);
      // Auth state listener will handle setting the user
    } catch (e) {
      setError(e.message);
      setLoading(false);
      throw e;
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Firebase Auth
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      
      // Add user data to Firestore
      await firebase
        .firestore()
        .collection('users')
        .doc(response.user.uid)
        .set({
          ...userData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      
      // Auth state listener will handle setting the user
    } catch (e) {
      setError(e.message);
      setLoading(false);
      throw e;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await firebase.auth().signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (e) {
      console.log('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await firebase.auth().sendPasswordResetEmail(email);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      // Update Firestore
      await firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .update(userData);
      
      // Update local state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager',
        isEmployee: user?.role === 'employee',
        isRider: user?.role === 'rider',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};