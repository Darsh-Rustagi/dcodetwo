// src/app/profile/page.js
'use client'; // Required for useEffect and other hooks

import { useEffect } from 'react';
import UserProfileForm from '../components/userprofileform/UserProfileForm.js'; // Make sure this path is correct

// Import Firebase tools for the test
import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfilePage() {

  // This function will run once when the page loads
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        console.log("Running Firebase connection test...");
        
        // We try to read a document that doesn't exist.
        // If this command succeeds without a permission error, the connection is good.
        const testDocRef = doc(db, "_internal", "connection_test");
        await getDoc(testDocRef);

        console.log("%c✅ Firebase Connection Successful.", "color: green; font-weight: bold;");

      } catch (error) {
        console.error("%c❌ Firebase Connection Failed.", "color: red; font-weight: bold;");
        console.error("Error details:", error);
      }
    };

    testFirebaseConnection();
  }, []); // The empty array [] ensures this runs only once

  return (
    <main className="min-h-screen bg-amber-100 flex items-center justify-center p-4">
      <UserProfileForm />
    </main>
  );
}