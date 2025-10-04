'use client';

import React, { useState } from 'react';
// --- EDIT ---: Removed Firebase and algorithm imports as they are no longer needed on this page.
import { LayoutGrid, Users, MessageSquare, Calendar, Bell, Settings, LogOut, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Mock Data ---
// This data is now used for both the mentor dashboard and the student dashboard's static content.
const mentorData = {
  name: 'Dr. Evelyn Reed',
  avatar: 'https://placehold.co/100x100/f59e0b/000000?text=ER',
  stats: { activeStudents: 8, pendingRequests: 3, unreadMessages: 5 },
  upcomingSessions: [
    { id: 1, studentName: 'Alex Johnson', topic: 'Quantum Entanglement Basics', time: 'Today, 3:00 PM' },
    { id: 2, studentName: 'Priya Patel', topic: 'Reviewing Thesis Draft', time: 'Tomorrow, 10:00 AM' },
    { id: 3, studentName: 'Sam Chen', topic: 'Career Advice Session', time: 'Oct 7, 2:30 PM' },
  ],
  recentActivity: [
    { id: 1, type: 'message', from: 'Priya Patel', content: "Thanks for the feedback! I've updated the draft.", time: '25m ago' },
    { id: 2, type: 'request', from: 'Leo Martinez', content: 'New mentorship request.', time: '1h ago' },
    { id: 3, type: 'session', from: 'Alex Johnson', content: 'Session confirmed for today.', time: '3h ago' },
  ],
};

const studentData = {
  name: 'Alex Johnson',
  avatar: 'https://placehold.co/100x100/fb923c/000000?text=AJ',
  currentMentor: {
    name: 'Dr. Evelyn Reed',
    avatar: 'https://placehold.co/100x100/f59e0b/000000?text=ER',
    subject: 'Quantum Physics',
  },
  upcomingSessions: [
    { id: 1, mentorName: 'Dr. Evelyn Reed', topic: 'Quantum Entanglement Basics', time: 'Today, 3:00 PM' },
    { id: 2, mentorName: 'Dr. Evelyn Reed', topic: 'Follow-up on Qubits', time: 'Oct 8, 11:00 AM' },
  ],
  learningProgress: [
    { subject: 'Quantum Physics', progress: 75 },
    { subject: 'Calculus II', progress: 90 },
    { subject: 'Scientific Writing', progress: 60 },
  ],
  // --- EDIT ---: Restored the original mock recommendations. The real ones are on the /mentors page.
  recommendedMentors: [
    { id: 2, name: 'Marcus Vance', subject: 'Ancient History', avatar: 'https://placehold.co/100x100/4ade80/000000?text=MV' },
    { id: 4, name: 'Kenji Tanaka', subject: 'AI & Robotics', avatar: 'https://placehold.co/100x100/f472b6/000000?text=KT' },
  ],
};

// --- Main Component ---
export default function DashboardPage() {
  const [isMentor, setIsMentor] = useState(false); 

  return (
    <main className="bg-amber-100 min-h-screen font-sans text-zinc-900">
      <div className="flex">
        {/* --- Sidebar Navigation --- */}
        <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-amber-200/80 h-screen flex-col hidden lg:flex">
          <div className="p-6 flex items-center gap-3 border-b border-amber-200/80">
            <div className="text-2xl font-bold bg-zinc-900 text-white rounded-full w-10 h-10 flex items-center justify-center">M</div>
            <span className="text-2xl font-bold text-zinc-900">Mentora</span>
          </div>
          <nav className="flex-grow p-4">
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setIsMentor(!isMentor)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-200 text-amber-900 font-bold w-full text-left"
                >
                  <LayoutGrid size={20} /> {isMentor ? 'Mentor Dashboard' : 'Student Dashboard'}
                </button>
              </li>
              {isMentor ? (
                <>
                  <li className="mb-2"><a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><Users size={20} /> My Students</a></li>
                  <li className="mb-2"><a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><MessageSquare size={20} /> Messages</a></li>
                  <li className="mb-2"><a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><Calendar size={20} /> Calendar</a></li>
                </>
              ) : (
                <>
                  <li className="mb-2"><a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><Users size={20} /> My Mentors</a></li>
                  <li className="mb-2"><a href="/chats" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><MessageSquare size={20} /> Messages</a></li>
                  {/* --- EDIT ---: This link now correctly points to the separate page. */}
                  <li className="mb-2">
                    <a href="/mentors" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700">
                      <Clock size={20} /> Find a Mentor
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <div className="p-4 border-t border-amber-200/80">
            <a href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><Settings size={20} /> Settings</a>
            <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-200/50 font-medium text-zinc-700"><LogOut size={20} /> Logout</a>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <div className="flex-1">
          <header className="bg-amber-100/80 backdrop-blur-md border-b border-amber-200/80 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{isMentor ? 'Mentor Dashboard' : 'Student Dashboard'}</h1>
            <div className="flex items-center gap-4">
              <button className="relative text-zinc-600 hover:text-zinc-900"><Bell size={24} /></button>
              <div className="flex items-center gap-3">
                <img src={isMentor ? mentorData.avatar : studentData.avatar} alt={isMentor ? mentorData.name : studentData.name} className="w-10 h-10 rounded-full"/>
                <div>
                  <h3 className="font-bold">{isMentor ? mentorData.name : studentData.name}</h3>
                  <p className="text-sm text-zinc-600">{isMentor ? 'Mentor' : 'Student'}</p>
                </div>
              </div>
            </div>
          </header>
          <div className="p-8">
            {isMentor ? <MentorDashboardContent /> : <StudentDashboardContent />}
          </div>
        </div>
      </div>
    </main>
  );
}

// --- Stat Card ---
function StatCard({ icon, value, label }) {
  return (
    <motion.div
      className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm"
      whileHover={{ y: -5, scale: 1.05, boxShadow: '0px 10px 20px rgba(0,0,0,0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {icon}
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-zinc-600">{label}</p>
    </motion.div>
  );
}

// --- Mentor Dashboard Content ---
function MentorDashboardContent() {
  // This component is unchanged and still uses mentorData
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Users className="text-amber-600 mb-2" size={28} />} value={mentorData.stats.activeStudents} label="Active Students" />
        <StatCard icon={<MessageSquare className="text-amber-600 mb-2" size={28} />} value={mentorData.stats.unreadMessages} label="Unread Messages" />
        <StatCard icon={<Bell className="text-amber-600 mb-2" size={28} />} value={mentorData.stats.pendingRequests} label="Pending Requests" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2 bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {mentorData.upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-amber-100/70 rounded-lg">
                <div><p className="font-semibold">{session.topic}</p><p className="text-sm text-zinc-600">with {session.studentName}</p></div>
                <p className="text-sm font-medium text-amber-800">{session.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            {mentorData.recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-center gap-4 p-3 rounded-lg">
                <div className="bg-amber-100/80 p-2 rounded-full">
                  {activity.type === 'message' && <MessageSquare size={18} className="text-blue-500" />}
                  {activity.type === 'request' && <Bell size={18} className="text-amber-600" />}
                  {activity.type === 'session' && <Calendar size={18} className="text-green-500" />}
                </div>
                <div className="flex-grow"><p className="text-sm text-zinc-700 leading-tight"><span className="font-bold text-zinc-900">{activity.from}</span>: {activity.content}</p></div>
                <p className="text-xs text-zinc-500 flex-shrink-0">{activity.time}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
  );
}

// --- EDIT ---: Removed the MentorCard component from this file. It should be in src/components/MentorCard.js

// --- Student Dashboard Content ---
function StudentDashboardContent() {
  // --- EDIT ---: Removed all state management (useState) and the handleFindMentors function.
  // This component is now simple and only displays static data from the `studentData` object.
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Current Mentor */}
        <motion.div className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Your Current Mentor</h2>
          <div className="flex items-center gap-4 p-4 bg-amber-100/70 rounded-lg">
            <img src={studentData.currentMentor.avatar} alt={studentData.currentMentor.name} className="w-16 h-16 rounded-full" />
            <div className="flex-grow">
              <h3 className="text-lg font-bold">{studentData.currentMentor.name}</h3>
              <p className="text-sm text-amber-800 font-semibold">{studentData.currentMentor.subject}</p>
            </div>
          </div>
        </motion.div>
        {/* Upcoming Sessions */}
        <motion.div className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {studentData.upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-amber-100/70 rounded-lg">
                <div className="flex items-center gap-3"><Clock size={18} className="text-amber-700" />
                  <div><p className="font-semibold">{session.topic}</p><p className="text-sm text-zinc-600">with {session.mentorName}</p></div>
                </div>
                <p className="text-sm font-medium text-amber-800">{session.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {/* Right Column */}
      <div className="space-y-8">
        {/* Learning Progress */}
        <motion.div className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Learning Progress</h2>
          <div className="space-y-4">
            {studentData.learningProgress.map((item) => (
              <div key={item.subject}>
                <p className="text-sm font-semibold mb-1">{item.subject}</p>
                <div className="w-full bg-amber-200/50 rounded-full h-2.5"><div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div></div>
              </div>
            ))}
          </div>
        </motion.div>
        {/* --- EDIT ---: This section now shows the original static mock data. */}
        <motion.div className="bg-white/80 p-6 rounded-xl border border-amber-200/80 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
          <div className="space-y-4">
            {studentData.recommendedMentors.map((mentor) => (
              <div key={mentor.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold">{mentor.name}</p>
                    <p className="text-sm text-zinc-600">{mentor.subject}</p>
                  </div>
                </div>
                {/* This link can go to the mentors page or a specific mentor profile */}
                <a href="/mentors" className="p-2 rounded-full hover:bg-amber-100/80">
                  <ArrowRight size={18} />
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}