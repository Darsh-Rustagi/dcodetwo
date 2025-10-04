// src/components/MentorMatcher.js
'use client';

import React, { useState, useEffect } from 'react';
import { findTopMentors } from '../lib/matchingAlgorithm';

export default function MentorMatcher() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error("Failed to fetch users");
        
        const data = await res.json();
        setAllUsers(data.users || []);
        
        // For this demo, we'll set the first user as the one looking for a mentor.
        // In a real app, this would be your logged-in user.
        if (data.users && data.users.length > 0) {
          setCurrentUser(data.users[0]);
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFindMatches = () => {
    if (currentUser && allUsers.length > 0) {
      const matches = findTopMentors(currentUser, allUsers);
      setTopMentors(matches);
    }
  };

  const ProfileCard = ({ person }) => (
     <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-bold text-gray-800">{person.name}</h3>
        <div className="mt-2 text-sm text-gray-700 space-y-2">
            <div>
                <p className="font-semibold">Wants to Learn:</p>
                <span>{person.skillsToLearn.map(s => `${s.name} (${s.level})`).join(', ')}</span>
            </div>
            <div>
                <p className="font-semibold">Can Teach:</p>
                <span>{person.skillsToTeach.map(s => `${s.name} (${s.level})`).join(', ')}</span>
            </div>
        </div>
    </div>
  );

  if (isLoading) return <div className="text-center p-10">Loading users from the database...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!currentUser) return <div className="text-center p-10">No users found in the database.</div>;

  return (
    <div className="p-4 sm:p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600">DCODE Peer Mentorship</h1>
      <p className="text-center text-gray-600 mt-2">Find a peer to help you learn and grow.</p>
      
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Current User Profile</h2>
          <ProfileCard person={currentUser} />
          <button
            onClick={handleFindMatches}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            ✨ Find My Mentors
          </button>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Peer Matches</h2>
          {topMentors.length > 0 ? (
            <div className="space-y-4">
              {topMentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center p-4 border rounded-lg shadow-sm bg-white">
                    <div className="flex-shrink-0 mr-4 h-16 w-16 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                        <span className="text-2xl font-bold">{mentor.matchScore}%</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{mentor.name}</h3>
                        <p className="text-sm text-gray-600">Can teach: {mentor.skillsToTeach.map(s => s.name).join(', ')}</p>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg bg-gray-100">
              <p className="text-gray-500">Click the button to find your matches!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}