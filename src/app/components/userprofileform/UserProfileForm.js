// src/components/userprofileform/index.js
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebaseClient'; // Import the db instance
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

export default function UserProfileForm() {
  // State for simple fields
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [style, setStyle] = useState('1-on-1');

  // State for dynamic lists of skills (arrays of objects)
  const [skillsToTeach, setSkillsToTeach] = useState([{ name: '', level: 'Beginner' }]);
  const [skillsToLearn, setSkillsToLearn] = useState([{ name: '', level: 'Beginner' }]);

  // State to handle loading and messages
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Helper functions to manage the dynamic skill lists ---

  // Handles changes in a skill's name or level
  const handleSkillChange = (index, event, type) => {
    const list = type === 'teach' ? [...skillsToTeach] : [...skillsToLearn];
    list[index][event.target.name] = event.target.value;
    if (type === 'teach') setSkillsToTeach(list);
    else setSkillsToLearn(list);
  };

  // Adds a new empty skill object to the list
  const addSkill = (type) => {
    const list = type === 'teach' ? skillsToTeach : skillsToLearn;
    const setList = type === 'teach' ? setSkillsToTeach : setSkillsToLearn;
    setList([...list, { name: '', level: 'Beginner' }]);
  };

  // Removes a skill from the list by its index
  const removeSkill = (index, type) => {
    const list = type === 'teach' ? [...skillsToTeach] : [...skillsToLearn];
    list.splice(index, 1);
    if (type === 'teach') setSkillsToTeach(list);
    else setSkillsToLearn(list);
  };


  // --- Main submission handler ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const userId = "user_priya_singh_456"; // Placeholder ID

    try {
      // Filter out any skills that the user added but left blank
      const finalSkillsToTeach = skillsToTeach.filter(skill => skill.name.trim() !== '');
      const finalSkillsToLearn = skillsToLearn.filter(skill => skill.name.trim() !== '');

      // Construct the final data object to match your DB structure
      const userData = {
        name,
        capacity: Number(capacity),
        style,
        skillsToTeach: finalSkillsToTeach,
        skillsToLearn: finalSkillsToLearn,
        currentMentees: 0, // Set a default value for new profiles
        lastUpdated: new Date(),
      };

      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, userData, { merge: true });

      setMessage('Profile saved successfully!');
    } catch (error) {
      console.error("Error saving document: ", error);
      setMessage('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 p-8 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Info --- */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full input-style" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="capacity" className="block text-gray-700 font-semibold mb-2">Mentee Capacity</label>
            <input type="number" id="capacity" value={capacity} min="1" onChange={(e) => setCapacity(e.target.value)} className="w-full input-style" required/>
          </div>
          <div>
            <label htmlFor="style" className="block text-gray-700 font-semibold mb-2">Mentoring Style</label>
            <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full input-style">
              <option>1-on-1</option>
              <option>Group Sessions</option>
              <option>Mixed</option>
            </select>
          </div>
        </div>
        <hr className="border-amber-200" />
        
        {/* --- Skills to Teach --- */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills You Can Teach</h3>
          {skillsToTeach.map((skill, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input type="text" name="name" placeholder="Skill Name, e.g., React" value={skill.name} onChange={e => handleSkillChange(i, e, 'teach')} className="w-full input-style"/>
              <select name="level" value={skill.level} onChange={e => handleSkillChange(i, e, 'teach')} className="input-style">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
              <button type="button" onClick={() => removeSkill(i, 'teach')} className="p-2 text-red-500 hover:bg-red-100 rounded-full">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => addSkill('teach')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">+ Add Skill to Teach</button>
        </div>
        <hr className="border-amber-200" />
        
        {/* --- Skills to Learn --- */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills You Want to Learn</h3>
          {skillsToLearn.map((skill, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input type="text" name="name" placeholder="Skill Name, e.g., Python" value={skill.name} onChange={e => handleSkillChange(i, e, 'learn')} className="w-full input-style"/>
              <select name="level" value={skill.level} onChange={e => handleSkillChange(i, e, 'learn')} className="input-style">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <button type="button" onClick={() => removeSkill(i, 'learn')} className="p-2 text-red-500 hover:bg-red-100 rounded-full">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => addSkill('learn')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">+ Add Skill to Learn</button>
        </div>
        
        {/* --- Submission --- */}
        <button type="submit" disabled={isLoading} className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
}