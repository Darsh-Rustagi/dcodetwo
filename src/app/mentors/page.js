'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Search, Loader2, UserCheck, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '../../lib/firebaseClient'; // Adjust path if necessary
import { findTopMentors } from '../../lib/matchingAlgorithm'; // Adjust path if necessary
import MentorCard from '../components/mentorcard/MentorCard';
 // Adjust path if necessary

export default function FindMentorPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const getLocalUser = async () => {
      const localId = localStorage.getItem('mentoraUserId');
      if (localId) {
        const userDocRef = doc(db, 'users', localId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setLocalUser({ id: userDocSnap.id, ...userDocSnap.data() });
        } else {
          localStorage.removeItem('mentoraUserId');
        }
      }
    };
    getLocalUser();
  }, []);

  const handleFindMentors = async () => {
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setMentors([]);

    try {
      const usersCollectionRef = collection(db, 'users');
      const allUsersSnapshot = await getDocs(usersCollectionRef);
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (allUsers.length < 2) {
        throw new Error("Not enough users in the database to run a match. Please add at least two profiles.");
      }
      
      let currentUserForMatch;
      const localId = localStorage.getItem('mentoraUserId');

      if (localId) {
        currentUserForMatch = allUsers.find(user => user.id === localId);
        if (!currentUserForMatch) {
            currentUserForMatch = allUsers[Math.floor(Math.random() * allUsers.length)];
            localStorage.setItem('mentoraUserId', currentUserForMatch.id);
        }
      } else {
        currentUserForMatch = allUsers[Math.floor(Math.random() * allUsers.length)];
        localStorage.setItem('mentoraUserId', currentUserForMatch.id);
      }
      
      setLocalUser(currentUserForMatch);

      const potentialMentors = allUsers.filter(user => user.id !== currentUserForMatch.id);

      const topMentors = findTopMentors(currentUserForMatch, potentialMentors);
      setMentors(topMentors);

    } catch (err) {
      console.error("Error finding mentors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 font-sans flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center"
            >
                <div className="inline-block bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-full mb-3 shadow-lg shadow-amber-500/30">
                    <Users className="text-white" size={32} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">Find Your Mentor</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600">
                    Click the button below to find mentor matches for your profile. If you're new, we'll assign you one to get started!
                </p>
                
                <AnimatePresence>
                {localUser && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg inline-flex items-center gap-2 border border-green-200"
                    >
                    <UserCheck size={18} />
                    <span className="font-semibold">Your current profile: {localUser.name}</span>
                    </motion.div>
                )}
                </AnimatePresence>

                <motion.button
                    onClick={handleFindMentors}
                    disabled={loading}
                    className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:from-amber-300 disabled:to-orange-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/40 transform hover:-translate-y-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    {loading ? 'Finding Your Match...' : 'Generate My Matches'}
                </motion.button>
            </motion.div>

            <div className="mt-12 max-w-3xl mx-auto">
            <AnimatePresence>
                {loading && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-zinc-600 font-semibold flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-amber-500" />
                        Fetching users and running algorithm...
                    </motion.div>
                )}
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center justify-center gap-2"
                    >
                        <AlertCircle />
                        <div>
                            <p className="font-bold">Oops! Something went wrong.</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </motion.div>
                )}

                {hasSearched && !loading && mentors.length === 0 && !error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-zinc-600 text-lg p-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg"
                    >
                        <p className="font-bold">No suitable mentors were found.</p>
                        <p className="text-base mt-1">Try adding more skills on the profile page to improve your matches!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!loading && mentors.length > 0 && localUser && (
                <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                <div className="p-4 bg-amber-200/50 rounded-lg text-center mb-6 border border-amber-200">
                    <p className="font-bold text-lg text-amber-900">Top matches for: {localUser.name}</p>
                    <p className="text-sm text-zinc-700">Wants to learn: {(localUser.skillsToLearn || []).map(s => s.name).join(', ') || 'N/A'}</p>
                </div>
                {mentors.map((mentor, index) => (
                    <MentorCard key={mentor.id} mentor={mentor} index={index} />
                ))}
                </motion.div>
            )}
            </div>
      </div>
    </main>
  );
}

