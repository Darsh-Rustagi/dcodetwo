// src/app/mentors/page.js
"use client";

import React, { useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Search, Loader2 } from 'lucide-react';

import { db } from '../../lib/firebaseClient';
import { findTopMentors } from '../../lib/matchingAlgorithm';


// --- EDIT ---: Import our new useAuth hook
import { useAuth } from '../../context/AuthContext';
import MentorCard from '../components/mentorcard/MentorCard';

export default function FindMentorPage() {
  // --- EDIT ---: Use the auth hook to get user and loading state
  const { user, loading: authLoading } = useAuth();
  
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindMentors = async () => {
    // --- EDIT ---: Check if a user is logged in before searching
    if (!user) {
      setError("You must be logged in to find a mentor.");
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setMentors([]);

    try {
      // --- EDIT ---: Use the dynamic user ID from the auth context!
      const currentUserId = user.uid; // No more hardcoding!

      const userDocRef = doc(db, 'users', currentUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("Could not find your user profile. Please complete your profile first.");
      }
      const currentUser = { id: userDocSnap.id, ...userDocSnap.data() };

      const usersCollectionRef = collection(db, 'users');
      const allUsersQuery = query(usersCollectionRef, where('id', '!=', currentUserId));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const topMentors = findTopMentors(currentUser, allUsers);
      setMentors(topMentors);

    } catch (err) {
      console.error("Error finding mentors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // --- EDIT ---: Handle the initial authentication loading state
  if (authLoading) {
    return (
        <main className="bg-amber-100 min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-600" size={48} />
        </main>
    );
  }

  return (
    <main className="bg-amber-100 min-h-screen font-sans text-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-zinc-900">Find Your Perfect Mentor</h1>
          
          {/* --- EDIT ---: Show a different message if the user is not logged in */}
          {!user ? (
            <p className="mt-4 text-lg text-red-600 bg-red-100 p-4 rounded-lg">
              Please log in or sign up to get your personalized mentor recommendations.
            </p>
          ) : (
            <>
              <p className="mt-4 text-lg text-zinc-600">
                Our algorithm will match you with the best mentors based on the skills you want to learn, your interests, and their teaching style.
              </p>
              <button
                onClick={handleFindMentors}
                disabled={loading}
                className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-all transform hover:scale-105 disabled:bg-amber-300 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                {loading ? 'Analyzing Your Profile...' : 'Generate My Matches'}
              </button>
            </>
          )}
        </div>

        {/* The results section remains the same */}
        <div className="mt-12 max-w-3xl mx-auto">
            {/* ... rest of the JSX ... */}
        </div>
      </div>
    </main>
  );
}