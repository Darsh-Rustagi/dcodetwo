'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Users, MessageSquare, Calendar, Bell, Settings, LogOut, Clock, ArrowRight, Edit, Trash2, Save, X, PlusCircle, User, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient';
import { findTopMentors } from '../../lib/matchingAlgorithm';


// --- DEFAULT DATA ---
const initialStudentData = {
  name: 'Alex Johnson',
  avatar: 'https://placehold.co/100x100/fb923c/000000?text=AJ',
  currentMentor: { name: 'Dr. Evelyn Reed', avatar: 'https://placehold.co/100x100/f59e0b/000000?text=ER', subject: 'Quantum Physics' },
  upcomingSessions: [
    { id: 1, mentorName: 'Dr. Evelyn Reed', topic: 'Quantum Entanglement Basics', time: 'Today, 3:00 PM' },
  ],
  learningProgress: [
    { id: 1, subject: 'Quantum Physics', progress: 75 },
    { id: 2, subject: 'Calculus II', progress: 90 },
  ],
  skillsToLearn: [],
  recommendedMentors: [],
};

const initialMentorData = {
    name: 'Dr. Evelyn Reed',
    avatar: 'https://placehold.co/100x100/f59e0b/000000?text=ER',
    stats: { activeStudents: 8, pendingRequests: 3, unreadMessages: 5 },
    upcomingSessions: [
        { id: 1, studentName: 'Alex Johnson', topic: 'Quantum Entanglement Basics', time: 'Today, 3:00 PM' },
    ],
    recentActivity: [
        { id: 1, type: 'message', from: 'Priya Patel', content: "Thanks for the feedback!", time: '25m ago' },
    ],
};


// --- Main Component ---
export default function DashboardPage() {
  const [isMentor, setIsMentor] = useState(false);
  const [activeProfile, setActiveProfile] = useState(initialStudentData);

  useEffect(() => {
    const key = isMentor ? 'mentoraMentorDashboardData' : 'mentoraStudentDashboardData';
    const defaultData = isMentor ? initialMentorData : initialStudentData;
    const savedData = localStorage.getItem(key);
    setActiveProfile(savedData ? JSON.parse(savedData) : defaultData);
  }, [isMentor]);

  const handleProfileUpdate = (newData) => {
    setActiveProfile(newData);
  };

  const handleResetData = () => {
    const key = isMentor ? 'mentoraMentorDashboardData' : 'mentoraStudentDashboardData';
    const viewName = isMentor ? 'mentor' : 'student';
    if (window.confirm(`Are you sure you want to reset your ${viewName} dashboard data?`)) {
      localStorage.removeItem(key);
      window.location.reload();
    }
  };

  return (
    <main className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 min-h-screen font-sans text-zinc-900">
      <div className="flex">
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-amber-200/80 h-screen flex-col hidden lg:flex shadow-lg">
          <div className="p-6 flex items-center gap-3 border-b border-amber-200/80">
            <div className="text-2xl font-bold bg-zinc-900 text-white rounded-full w-10 h-10 flex items-center justify-center">M</div>
            <span className="text-2xl font-bold text-zinc-900">Mentora</span>
          </div>
          <nav className="flex-grow p-4">
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setIsMentor(!isMentor)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-200 text-amber-900 font-bold w-full text-left transition-transform transform hover:scale-105"
                >
                  <LayoutGrid size={20} /> {isMentor ? 'Mentor View' : 'Student View'}
                </button>
              </li>
               {isMentor ? (
                <>
                  <li className="mb-2"><a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100/50 font-medium text-zinc-700"><Users size={20} /> My Students</a></li>
                </>
              ) : (
                <>
                  <li className="mb-2"><a href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100/50 font-medium text-zinc-700"><Settings size={20} /> Create Profile</a></li>
                  <li className="mb-2"><a href="/mentors" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100/50 font-medium text-zinc-700"><Clock size={20} /> Find a Mentor</a></li>
                </>
              )}
            </ul>
          </nav>
          <div className="p-4 border-t border-amber-200/80">
            <button onClick={handleResetData} className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-100/50 font-medium text-red-600 w-full text-left">
              <LogOut size={20} /> Reset Data
            </button>
          </div>
        </aside>

        <div className="flex-1">
            <header className="bg-white/50 backdrop-blur-lg border-b border-amber-200/80 p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold">{isMentor ? 'Mentor Dashboard' : 'Student Dashboard'}</h1>
                <div className="flex items-center gap-4">
                <button className="relative text-zinc-600 hover:text-zinc-900"><Bell size={24} /></button>
                <div className="flex items-center gap-3">
                    <img src={activeProfile.avatar} alt={activeProfile.name} className="w-10 h-10 rounded-full"/>
                    <div>
                    <h3 className="font-bold">{activeProfile.name}</h3>
                    <p className="text-sm text-zinc-600">{isMentor ? 'Mentor' : 'Student'}</p>
                    </div>
                </div>
                </div>
            </header>
            <div className="p-8">
                {isMentor ? <MentorDashboardContent onProfileUpdate={handleProfileUpdate} /> : <StudentDashboardContent onProfileUpdate={handleProfileUpdate} />}
            </div>
        </div>
      </div>
    </main>
  );
}

// --- Stat Card for Mentor View ---
function StatCard({ icon, value, label }) {
  return (
    <motion.div className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm" whileHover={{ y: -5, scale: 1.05, boxShadow: '0px 10px 20px rgba(0,0,0,0.05)' }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
      {icon}
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-zinc-600">{label}</p>
    </motion.div>
  );
}

// --- Fully Interactive Mentor Dashboard ---
function MentorDashboardContent({ onProfileUpdate }) {
    const [mentorData, setMentorData] = useState(initialMentorData);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: mentorData.name, avatar: mentorData.avatar });
    const [isEditingStats, setIsEditingStats] = useState(false);
    const [statsForm, setStatsForm] = useState(mentorData.stats);
    const [newSession, setNewSession] = useState({ studentName: '', topic: '', time: '' });

    useEffect(() => {
        const savedData = localStorage.getItem('mentoraMentorDashboardData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setMentorData(parsedData);
            setStatsForm(parsedData.stats);
            setProfileForm({ name: parsedData.name, avatar: parsedData.avatar });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('mentoraMentorDashboardData', JSON.stringify(mentorData));
        if (onProfileUpdate) {
            onProfileUpdate(mentorData);
        }
    }, [mentorData, onProfileUpdate]);

    const handleSaveProfile = () => {
        const initials = profileForm.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const newAvatar = `https://placehold.co/100x100/f59e0b/000000?text=${initials || 'M'}`;
        
        setMentorData(prev => ({ ...prev, name: profileForm.name, avatar: newAvatar }));
        setIsEditingProfile(false);
    };
    
    const handleSaveStats = () => {
        setMentorData(prev => ({ ...prev, stats: statsForm }));
        setIsEditingStats(false);
    };

    const handleAddSession = (e) => {
        e.preventDefault();
        if (!newSession.studentName || !newSession.topic || !newSession.time) return;
        const sessionToAdd = { id: Date.now(), ...newSession };
        setMentorData(prev => ({ ...prev, upcomingSessions: [...prev.upcomingSessions, sessionToAdd] }));
        setNewSession({ studentName: '', topic: '', time: '' });
    };

    const handleDeleteSession = (id) => {
        setMentorData(prev => ({ ...prev, upcomingSessions: prev.upcomingSessions.filter(s => s.id !== id) }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-3">
                <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Your Mentor Profile</h2>
                        {!isEditingProfile && <button onClick={() => { setProfileForm({ name: mentorData.name, avatar: mentorData.avatar }); setIsEditingProfile(true); }} className="p-2 rounded-full hover:bg-amber-100/80"><Edit size={18} /></button>}
                    </div>
                     <AnimatePresence mode="wait">
                        {isEditingProfile ? (
                             <motion.div key="edit-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div><label className="text-sm font-semibold">Your Name</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-2 mt-1 border-2 border-amber-200 rounded-lg"/></div>
                                <div className="sm:col-span-3 flex gap-2 justify-end"><button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-lg hover:bg-zinc-100"><X size={20}/></button><button onClick={handleSaveProfile} className="p-2 rounded-lg hover:bg-green-100 text-green-600"><Save size={20}/></button></div>
                            </motion.div>
                        ) : (
                             <motion.div key="view-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4 p-4 bg-amber-100/70 rounded-lg">
                                <img src={mentorData.avatar} alt={mentorData.name} className="w-16 h-16 rounded-full"/>
                                <div><h3 className="text-lg font-bold">{mentorData.name}</h3><p className="text-sm text-amber-800 font-semibold">Mentor</p></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
            <div className="lg:col-span-3">
                <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Your Stats</h2>
                        {!isEditingStats && <button onClick={() => { setStatsForm(mentorData.stats); setIsEditingStats(true); }} className="p-2 rounded-full hover:bg-amber-100/80"><Edit size={18} /></button>}
                    </div>
                    <AnimatePresence mode="wait">
                        {isEditingStats ? (
                             <motion.div key="edit-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div><label className="text-sm font-semibold">Active Students</label><input type="number" value={statsForm.activeStudents} onChange={e => setStatsForm({...statsForm, activeStudents: Number(e.target.value)})} className="w-full p-2 mt-1 border-2 border-amber-200 rounded-lg"/></div>
                                <div><label className="text-sm font-semibold">Pending Requests</label><input type="number" value={statsForm.pendingRequests} onChange={e => setStatsForm({...statsForm, pendingRequests: Number(e.target.value)})} className="w-full p-2 mt-1 border-2 border-amber-200 rounded-lg"/></div>
                                <div><label className="text-sm font-semibold">Unread Messages</label><input type="number" value={statsForm.unreadMessages} onChange={e => setStatsForm({...statsForm, unreadMessages: Number(e.target.value)})} className="w-full p-2 mt-1 border-2 border-amber-200 rounded-lg"/></div>
                                <div className="sm:col-span-3 flex gap-2 justify-end"><button onClick={() => setIsEditingStats(false)} className="p-2 rounded-lg hover:bg-zinc-100"><X size={20}/></button><button onClick={handleSaveStats} className="p-2 rounded-lg hover:bg-green-100 text-green-600"><Save size={20}/></button></div>
                            </motion.div>
                        ) : (
                            <motion.div key="view-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard icon={<Users className="text-amber-600 mb-2" size={28} />} value={mentorData.stats.activeStudents} label="Active Students" />
                                <StatCard icon={<Bell className="text-amber-600 mb-2" size={28} />} value={mentorData.stats.pendingRequests} label="Pending Requests" />
                                <StatCard icon={<MessageSquare className="text-amber-600 mb-2" size={28} />} value={mentorData.stats.unreadMessages} label="Unread Messages" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
            <div className="lg:col-span-3">
                <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {mentorData.upcomingSessions.map(session => (
                                <motion.div layout key={session.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex items-center justify-between p-3 bg-amber-100/70 rounded-lg group">
                                    <div><p className="font-semibold">{session.topic}</p><p className="text-sm text-zinc-600">with {session.studentName}</p></div>
                                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-amber-800">{session.time}</p><button onClick={() => handleDeleteSession(session.id)} className="p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button></div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                     <motion.form layout onSubmit={handleAddSession} className="mt-4 pt-4 border-t border-amber-200/80 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input type="text" placeholder="Student Name" value={newSession.studentName} onChange={e => setNewSession({ ...newSession, studentName: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg text-sm"/>
                            <input type="text" placeholder="Session Topic" value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg text-sm"/>
                            <input type="text" placeholder="Time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg text-sm"/>
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 text-sm"><PlusCircle size={16}/> Add Session</button>
                    </motion.form>
                </motion.div>
            </div>
        </div>
    );
}


// --- Interactive Student Dashboard ---
function StudentDashboardContent({ onProfileUpdate }) {
  const [studentData, setStudentData] = useState(initialStudentData);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    name: studentData.name, 
    avatar: studentData.avatar,
    skillsToLearn: (studentData.skillsToLearn || []).map(s => `${s.name}:${s.level}`).join(', ')
  });
  const [isEditingMentor, setIsEditingMentor] = useState(false);
  const [mentorForm, setMentorForm] = useState(studentData.currentMentor);
  const [newSession, setNewSession] = useState({ topic: '', time: '' });
  const [newProgress, setNewProgress] = useState({ subject: '', progress: 50 });
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('mentoraStudentDashboardData');
    const data = savedData ? JSON.parse(savedData) : initialStudentData;
    setStudentData(data);
    setMentorForm(data.currentMentor);
    setProfileForm({ 
        name: data.name, 
        avatar: data.avatar,
        skillsToLearn: (data.skillsToLearn || []).map(s => `${s.name}:${s.level}`).join(', ')
    });
  }, []);
  
  const getRecommendations = useCallback(async () => {
    if (!studentData || !studentData.skillsToLearn) {
        setRecommendedMentors([]);
        setLoadingRecs(false);
        return;
    }
    setLoadingRecs(true);
    try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const currentUser = { ...studentData, id: 'local' }; 
        const potentialMentors = allUsers.filter(user => user.name !== currentUser.name);
        if (potentialMentors.length > 0) {
          const topMentors = findTopMentors(currentUser, potentialMentors);
          setRecommendedMentors(topMentors.slice(0, 2));
        }
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
    } finally {
        setLoadingRecs(false);
    }
  }, [studentData]);

  useEffect(() => {
    getRecommendations();
  }, [getRecommendations]);

  useEffect(() => {
    localStorage.setItem('mentoraStudentDashboardData', JSON.stringify(studentData));
    if (onProfileUpdate) {
        onProfileUpdate(studentData);
    }
  }, [studentData, onProfileUpdate]);

  const parseSkills = (skillsString) => {
    if (!skillsString || !skillsString.trim()) return [];
    return skillsString.split(',')
      .map(pair => {
        const [skillName, level] = pair.split(':').map(s => s.trim());
        if (skillName && level) { return { name: skillName, level: level }; }
        return null;
      })
      .filter(Boolean);
  };

  const handleSaveProfile = () => {
    const initials = profileForm.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const newAvatar = `https://placehold.co/100x100/fb923c/000000?text=${initials || 'S'}`;
    setStudentData(prev => ({ 
        ...prev, 
        name: profileForm.name, 
        avatar: newAvatar,
        skillsToLearn: parseSkills(profileForm.skillsToLearn)
    }));
    setIsEditingProfile(false);
  };

  const handleSaveMentor = () => { setStudentData(prev => ({ ...prev, currentMentor: mentorForm })); setIsEditingMentor(false); };
  const handleAddSession = (e) => { e.preventDefault(); if (!newSession.topic || !newSession.time) return; const sessionToAdd = { id: Date.now(), mentorName: studentData.currentMentor.name, ...newSession }; setStudentData(prev => ({ ...prev, upcomingSessions: [...prev.upcomingSessions, sessionToAdd] })); setNewSession({ topic: '', time: '' }); };
  const handleDeleteSession = (id) => { setStudentData(prev => ({ ...prev, upcomingSessions: prev.upcomingSessions.filter(s => s.id !== id) })); };
  const handleAddProgress = (e) => { e.preventDefault(); if (!newProgress.subject) return; const progressToAdd = { id: Date.now(), ...newProgress }; setStudentData(prev => ({ ...prev, learningProgress: [...prev.learningProgress, progressToAdd] })); setNewProgress({ subject: '', progress: 50 }); };
  const handleUpdateProgress = (id, value) => { setStudentData(prev => ({ ...prev, learningProgress: prev.learningProgress.map(p => p.id === id ? { ...p, progress: parseInt(value, 10) } : p), })); };
  const handleDeleteProgress = (id) => { setStudentData(prev => ({ ...prev, learningProgress: prev.learningProgress.filter(p => p.id !== id) })); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Your Profile Card */}
        <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Profile</h2>
            {!isEditingProfile && <button onClick={() => { 
                setProfileForm({ 
                    name: studentData.name, 
                    avatar: studentData.avatar,
                    skillsToLearn: (studentData.skillsToLearn || []).map(s => `${s.name}:${s.level}`).join(', ')
                }); 
                setIsEditingProfile(true); 
            }} className="p-2 rounded-full hover:bg-amber-100/80"><Edit size={18} /></button>}
          </div>
          <AnimatePresence mode="wait">
            {isEditingProfile ? (
              <motion.div key="edit-student-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div><label className="text-sm font-semibold">Your Name</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full p-2 mt-1 border-2 border-amber-200 rounded-lg"/></div>
                <div>
                    <label className="text-sm font-semibold">Skills to Learn</label>
                    <textarea value={profileForm.skillsToLearn} onChange={e => setProfileForm({ ...profileForm, skillsToLearn: e.target.value })} className="w-full p-2 mt-1 border-2 border-amber-200 rounded-lg" rows="2" placeholder="e.g., Python:Beginner, React:Intermediate"></textarea>
                    <p className="text-xs text-zinc-500 mt-1">Format: Skill:Level, Skill2:Level</p>
                </div>
                <div className="flex gap-2 justify-end"><button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-lg hover:bg-zinc-100"><X size={20}/></button><button onClick={handleSaveProfile} className="p-2 rounded-lg hover:bg-green-100 text-green-600"><Save size={20}/></button></div>
              </motion.div>
            ) : (
              <motion.div key="view-student-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-4 p-4 bg-amber-100/70 rounded-lg">
                    <img src={studentData.avatar} alt={studentData.name} className="w-16 h-16 rounded-full"/>
                    <div><h3 className="text-lg font-bold">{studentData.name}</h3><p className="text-sm text-amber-800 font-semibold">Student</p></div>
                </div>
                {(studentData.skillsToLearn && studentData.skillsToLearn.length > 0) && (
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-zinc-700">Learning Goals:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {studentData.skillsToLearn.map(skill => (
                        <span key={skill.name} className="bg-amber-200 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full">{skill.name}: {skill.level}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* --- RESTORED: Your Current Mentor Card --- */}
        <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
          <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Your Current Mentor</h2>
            {!isEditingMentor && <button onClick={() => { setMentorForm(studentData.currentMentor); setIsEditingMentor(true); }} className="p-2 rounded-full hover:bg-amber-100/80"><Edit size={18} /></button>}
          </div>
          <AnimatePresence mode="wait">
            {isEditingMentor ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <input type="text" placeholder="Mentor's Name" value={mentorForm.name} onChange={e => setMentorForm({ ...mentorForm, name: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg"/>
                <input type="text" placeholder="Subject" value={mentorForm.subject} onChange={e => setMentorForm({ ...mentorForm, subject: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg"/>
                <div className="flex gap-2 justify-end"><button onClick={() => setIsEditingMentor(false)} className="p-2 rounded-lg hover:bg-zinc-100"><X size={20}/></button><button onClick={handleSaveMentor} className="p-2 rounded-lg hover:bg-green-100 text-green-600"><Save size={20}/></button></div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4 p-4 bg-amber-100/70 rounded-lg">
                <img src={studentData.currentMentor.avatar} alt={studentData.currentMentor.name} className="w-16 h-16 rounded-full"/>
                <div><h3 className="text-lg font-bold">{studentData.currentMentor.name}</h3><p className="text-sm text-amber-800 font-semibold">{studentData.currentMentor.subject}</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- RESTORED: Upcoming Sessions Card --- */}
        <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
            <AnimatePresence>
            {studentData.upcomingSessions.map(session => (
                <motion.div layout key={session.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex items-center justify-between p-3 bg-amber-100/70 rounded-lg group">
                    <div className="flex items-center gap-3"><Clock size={18} className="text-amber-700"/><div><p className="font-semibold">{session.topic}</p><p className="text-sm text-zinc-600">with {session.mentorName}</p></div></div>
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-amber-800">{session.time}</p><button onClick={() => handleDeleteSession(session.id)} className="p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button></div>
                </motion.div>
            ))}
            </AnimatePresence>
            </div>
            <motion.form layout onSubmit={handleAddSession} className="mt-4 pt-4 border-t border-amber-200/80 space-y-2">
                <div className="flex gap-2"><input type="text" placeholder="New session topic..." value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg text-sm"/><input type="text" placeholder="Time (e.g., Oct 10, 4 PM)" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg text-sm"/></div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 transition-colors text-sm"><PlusCircle size={16}/> Add Session</button>
            </motion.form>
        </motion.div>
      </div>
      <div className="space-y-8">
        <motion.div layout className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Learning Progress</h2>
            <div className="space-y-4">
            <AnimatePresence>
            {studentData.learningProgress.map(item => (
                <motion.div layout key={item.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="group">
                    <div className="flex justify-between items-center mb-1"><p className="text-sm font-semibold">{item.subject}</p><button onClick={() => handleDeleteProgress(item.id)} className="p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div>
                    <div className="flex items-center gap-2"><input type="range" min="0" max="100" value={item.progress} onChange={e => handleUpdateProgress(item.id, e.target.value)} className="w-full h-2.5 bg-amber-200/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full"/><span className="text-sm font-bold text-amber-800 w-10 text-right">{item.progress}%</span></div>
                </motion.div>
            ))}
            </AnimatePresence>
            </div>
            <motion.form layout onSubmit={handleAddProgress} className="mt-4 pt-4 border-t border-amber-200/80 space-y-2">
                <input type="text" placeholder="New subject to track..." value={newProgress.subject} onChange={e => setNewProgress({ ...newProgress, subject: e.target.value })} className="w-full p-2 border-2 border-amber-200 rounded-lg text-sm"/>
                <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 transition-colors text-sm"><PlusCircle size={16}/> Add Subject</button>
            </motion.form>
        </motion.div>

        <motion.div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recommended for You</h2>
            <motion.button onClick={getRecommendations} disabled={loadingRecs} className="p-2 rounded-full hover:bg-amber-100/80 disabled:opacity-50">
                <RefreshCw size={16} className={loadingRecs ? 'animate-spin' : ''} />
            </motion.button>
          </div>
          <div className="space-y-4">
            {loadingRecs ? (
                <div className="text-center text-zinc-500">Finding matches...</div>
            ) : recommendedMentors.length > 0 ? (
                <AnimatePresence>
                {recommendedMentors.map((mentor) => (
                <motion.div key={mentor.id} initial={{opacity:0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100/50">
                    <div className="flex items-center gap-3">
                    <img src={`https://placehold.co/100x100/4ade80/000000?text=${(mentor.name || 'M').substring(0,2).toUpperCase()}`} alt={mentor.name} className="w-10 h-10 rounded-full"/>
                    <div>
                        <p className="font-bold">{mentor.name}</p>
                        <p className="text-sm text-zinc-600">Match: <span className="font-bold text-amber-700">{mentor.matchScore}%</span></p>
                    </div>
                    </div>
                    <a href="/mentors" className="p-2 rounded-full hover:bg-amber-100/80"><ArrowRight size={18}/></a>
                </motion.div>
                ))}
                </AnimatePresence>
            ) : (
                <div className="text-center text-zinc-500 text-sm p-4 bg-amber-50 rounded-lg">No recommendations found. Try adding 'Skills to Learn' in your profile!</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

