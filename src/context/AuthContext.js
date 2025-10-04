"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// --- EDIT ---: This import line was missing, which caused the error.
import { firebaseApp } from '../lib/firebaseClient'; // Make sure this path is correct

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Now that firebaseApp is imported, this line will work correctly.
    const auth = getAuth(firebaseApp);
    
    // This listener checks for login state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Will be the user object or null
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};
