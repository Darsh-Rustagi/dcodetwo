'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Book, Send, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient'; // Adjust path if necessary

export default function SchedulePage() {
    const [allMentors, setAllMentors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMentor, setSelectedMentor] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [topic, setTopic] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Fetch mentors from Firestore on component mount
    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const usersCollectionRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);
                const fetchedMentors = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || 'Unnamed User',
                }));
                setAllMentors(fetchedMentors);
            } catch (error) {
                console.error("Error fetching mentors: ", error);
                setMessage("Could not load mentors from the database.");
                setIsError(true);
            }
        };

        fetchMentors();
    }, []);

    // Filter mentors based on the search term
    const filteredMentors = useMemo(() => {
        if (!searchTerm) {
            return allMentors;
        }
        return allMentors.filter(mentor =>
            mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allMentors]);

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        if (!selectedMentor || !date || !time || !topic) {
            setMessage('Please fill out all fields.');
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setIsError(false);

        // Simulate an API call
        setTimeout(() => {
            setLoading(false);
            setMessage(`Meeting with ${selectedMentor} on ${date} at ${time} has been scheduled!`);
            setIsError(false);
            
            // Reset form
            setSelectedMentor('');
            setDate('');
            setTime('');
            setTopic('');
            setSearchTerm('');
        }, 1500);
    };

    const inputVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    };

    return (
        <main className="min-h-screen p-4 sm:p-8 font-sans flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
             <div className="h-20 flex-shrink-0"></div> {/* Spacer for Navbar */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-2xl bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-amber-200/50 border border-white/50"
            >
                <div className="text-center mb-8">
                    <div className="inline-block bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-full mb-3 shadow-lg shadow-amber-500/30">
                        <Calendar className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Schedule a Meeting</h1>
                    <p className="text-zinc-600 mt-2">Book a session with your chosen mentor.</p>
                </div>

                <motion.form 
                    onSubmit={handleScheduleSubmit} 
                    className="space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                >
                    <motion.div variants={inputVariants}>
                        <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="search"><Search size={16} className="mr-2 text-amber-600"/> Search Mentors</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Type to find a mentor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900"
                        />
                    </motion.div>

                    <motion.div variants={inputVariants}>
                        <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="mentor"><User size={16} className="mr-2 text-amber-600"/> Select Mentor</label>
                        <select id="mentor" value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900">
                            <option value="" disabled>Choose a mentor from the list...</option>
                            {filteredMentors.map(mentor => (
                                <option key={mentor.id} value={mentor.name}>{mentor.name}</option>
                            ))}
                        </select>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={inputVariants}>
                            <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="date"><Calendar size={16} className="mr-2 text-amber-600"/> Date</label>
                            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900"/>
                        </motion.div>
                        <motion.div variants={inputVariants}>
                            <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="time"><Clock size={16} className="mr-2 text-amber-600"/> Time</label>
                            <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900"/>
                        </motion.div>
                    </div>

                    <motion.div variants={inputVariants}>
                        <label className="flex items-center text-zinc-800 font-bold mb-2" htmlFor="topic"><Book size={16} className="mr-2 text-amber-600"/> Meeting Topic / Agenda</label>
                        <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-3 bg-white/50 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-zinc-900 placeholder:text-zinc-400" placeholder="e.g., Review thesis draft, Career advice..." rows="4"></textarea>
                    </motion.div>
                    
                    <motion.div variants={inputVariants}>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold py-4 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:from-amber-300 disabled:to-orange-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/40 transform hover:-translate-y-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                            {loading ? 'Scheduling...' : 'Schedule Meeting'}
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

