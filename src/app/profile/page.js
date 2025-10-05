'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../lib/firebaseClient'; // Adjust path if necessary
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Users, Target, BookOpen, Sparkles, Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [currentMentees, setCurrentMentees] = useState(0);
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [skillsToTeach, setSkillsToTeach] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const parseSkills = (skillsString) => {
    if (!skillsString.trim()) return [];
    return skillsString.split(',')
      .map(pair => {
        const [skillName, level] = pair.split(':').map(s => s.trim());
        if (skillName && level) {
          return { name: skillName, level: level };
        }
        return null;
      })
      .filter(Boolean);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const newProfileData = {
        name,
        style,
        capacity: Number(capacity),
        currentMentees: Number(currentMentees),
        skillsToLearn: parseSkills(skillsToLearn),
        skillsToTeach: parseSkills(skillsToTeach),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "users"), newProfileData);
      setMessage(`New profile created successfully! ID: ${docRef.id}`);
      
      setName('');
      setStyle('');
      setCapacity(0);
      setCurrentMentees(0);
      setSkillsToLearn('');
      setSkillsToTeach('');

    } catch (error) {
      console.error("Error creating document: ", error);
      setMessage("Error creating document. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };
  
  return (
    <main className="min-h-screen p-4 sm:p-8 font-sans flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-amber-200/50 border border-white/50"
      >
        <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-full mb-3 shadow-lg shadow-amber-500/30">
                <User className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Create a New Profile</h1>
            <p className="text-zinc-600 mt-2">Add a new user document to the database.</p>
        </div>

        <motion.form 
            onSubmit={handleProfileSave} 
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <motion.div variants={inputVariants}>
            <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="name"><Briefcase size={16} className="mr-2 text-amber-600"/> Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900 placeholder:text-zinc-400" placeholder="e.g., Priya Singh"/>
          </motion.div>
          
          <motion.div variants={inputVariants}>
            <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="style"><Sparkles size={16} className="mr-2 text-amber-600"/> Teaching Style</label>
            <input id="style" type="text" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900 placeholder:text-zinc-400" placeholder="e.g., 1-on-1, Project-based"/>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={inputVariants}>
              <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="capacity"><Users size={16} className="mr-2 text-amber-600"/> Capacity</label>
              <input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900"/>
            </motion.div>
            <motion.div variants={inputVariants}>
              <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="currentMentees"><Target size={16} className="mr-2 text-amber-600"/> Current Mentees</label>
              <input id="currentMentees" type="number" value={currentMentees} onChange={(e) => setCurrentMentees(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900"/>
            </motion.div>
          </div>
          
          <motion.div variants={inputVariants}>
            <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="skillsToTeach"><BookOpen size={16} className="mr-2 text-amber-600"/> Skills to Teach</label>
            <textarea id="skillsToTeach" value={skillsToTeach} onChange={(e) => setSkillsToTeach(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900 placeholder:text-zinc-400" placeholder="e.g., React:Expert, Node.js:Intermediate" rows="3"></textarea>
            <p className="text-xs text-zinc-500 mt-1">Format: Skill:Level, anotherSkill:Level</p>
          </motion.div>

          <motion.div variants={inputVariants}>
            <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="skillsToLearn"><Sparkles size={16} className="mr-2 text-amber-600"/> Skills to Learn</label>
            <textarea id="skillsToLearn" value={skillsToLearn} onChange={(e) => setSkillsToLearn(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900 placeholder:text-zinc-400" placeholder="e.g., Python:Beginner, SQL:Beginner" rows="3"></textarea>
            <p className="text-xs text-zinc-500 mt-1">Format: Skill:Level, anotherSkill:Level</p>
          </motion.div>
          
          <motion.div variants={inputVariants}>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold py-4 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:from-amber-300 disabled:to-orange-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/40 transform hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Saving...' : 'Create New Profile'}
            </motion.button>
          </motion.div>
          
          <AnimatePresence>
            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-center mt-4 p-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}
                >
                    {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    <span>{message}</span>
                </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </main>
  );
}

