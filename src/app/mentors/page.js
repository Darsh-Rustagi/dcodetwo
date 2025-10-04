// src/app/mentors/page.js
"use client";

import React, { useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Search, Loader2 } from 'lucide-react';

import { db } from '../../lib/firebaseClient'; // Adjust path if necessary
import { findTopMentors } from '../../lib/matchingAlgorithm'; // Adjust path if necessary
import MentorCard from '../components/mentorcard/MentorCard';
// import MentorCard from '../../components/mentorcard/MentorCard.js'; // Adjust path if necessary

export default function FindMentorPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);



  const handleFindMentors = async () => {
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setMentors([]);

    try {
      // IMPORTANT: In a real app, get this from your auth context (e.g., useAuth hook).
      // REPLACE 'student_user_id_1' with a real student ID from your Firestore 'users' collection for testing.
      const currentUserId = 'student_user_id_1';

      const userDocRef = doc(db, 'users', currentUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("Could not find your user profile. Please complete your profile first.");
      }
      const currentUser = { id: userDocSnap.id, ...userDocSnap.data() };

      const usersCollectionRef = collection(db, 'users');
      // Query to get all users EXCEPT the current one
      const allUsersQuery = query(usersCollectionRef, where('id', '!=', currentUserId));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Run the algorithm
      const topMentors = findTopMentors(currentUser, allUsers);
      setMentors(topMentors);

    } catch (err) {
      console.error("Error finding mentors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-amber-100 min-h-screen font-sans text-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-zinc-900">Find Your Perfect Mentor</h1>
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
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          {loading && (
            <p className="text-center text-zinc-500">Finding your perfect match...</p>
          )}
          
          {error && (
            <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p><strong>Oops! Something went wrong.</strong></p>
              <p>{error}</p>
            </div>
          )}

          {hasSearched && !loading && mentors.length === 0 && !error && (
            <p className="text-center text-zinc-600 text-lg p-8 bg-white/80 rounded-xl border border-amber-200/80">
              No suitable mentors were found at this time. You may want to update your profile with more skills or interests.
            </p>
          )}

          {!loading && mentors.length > 0 && (
            <div className="space-y-4">
              {mentors.map((mentor, index) => (
                <MentorCard key={mentor.id} mentor={mentor} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}