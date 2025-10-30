
// --- Example useAuth hook (hooks/useAuth.js) ---
// You need to implement this based on your Firebase setup (v8 compat)

import { useState, useEffect } from 'react';import { auth } from '@/firebaseConfig';
// --- Import the v9 User TYPE ---
import { User } from 'firebase/auth'; // Import User type directly from v9 auth

export function useAuth() {
 const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns the unsubscribe function
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: User | null) => {
      console.log("Auth state changed, user:", firebaseUser ? firebaseUser.uid : null);
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up auth subscription.");
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return { user, loading };
}