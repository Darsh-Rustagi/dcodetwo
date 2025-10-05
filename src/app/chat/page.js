'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, ChevronLeft, MoreVertical, Paperclip, Smile, MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// --- EDIT: Import Firebase dependencies ---
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient'; // Adjust path if necessary

// --- Mock Data ---
// This will be used as a fallback if no chats are stored locally.
const initialMessages = {
    1: [
        { id: 1, text: 'Hi Dr. Reed! I had a follow-up question about our last session.', sender: 'me', timestamp: '10:40 AM' },
        { id: 2, text: 'Of course, I\'m here to help. What\'s on your mind?', sender: 'mentor', timestamp: '10:41 AM' },
    ],
    3: [
        { id: 1, text: 'Hello Dr. Sharma, do you have a moment to chat?', sender: 'me', timestamp: '9:14 AM' },
    ],
};


// --- Main Chat Page Component ---
export default function ChatsPage() {
    // --- EDIT: The mentors list is now managed by state ---
    const [mentors, setMentors] = useState([]);
    const [messages, setMessages] = useState({});
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);
    
    // --- EDIT: Fetch mentors from Firestore and load messages on initial render ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch all users from the 'users' collection in Firestore
                const usersCollectionRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);
                const fetchedMentors = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || 'Unnamed User',
                    // Create a placeholder avatar from initials
                    avatar: `https://placehold.co/100x100/f59e0b/000000?text=${(doc.data().name || 'U').substring(0,2).toUpperCase()}`,
                    online: Math.random() > 0.5, // Mock online status
                    title: doc.data().style || 'Mentor', // Use 'style' field as title
                    ...doc.data(),
                }));
                setMentors(fetchedMentors);

                // 2. Load messages from localStorage
                const savedMessages = localStorage.getItem('mentoraChatMessages');
                const loadedMessages = savedMessages ? JSON.parse(savedMessages) : initialMessages;
                setMessages(loadedMessages);

                // 3. Set the initial selected chat after all data is loaded
                const firstMentorWithHistory = fetchedMentors.find(m => loadedMessages[m.id]);
                setSelectedChat(firstMentorWithHistory || null);

            } catch (error) {
                console.error("Error fetching user data:", error);
                // Handle error state if needed
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (Object.keys(messages).length > 0) {
            localStorage.setItem('mentoraChatMessages', JSON.stringify(messages));
        }
    }, [messages]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat, messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!selectedChat || newMessage.trim() === '') return;

        const newMsg = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const currentChatMessages = messages[selectedChat.id] || [];
        setMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...currentChatMessages, newMsg]
        }));
        setNewMessage('');
    };

    const filteredMentors = useMemo(() => {
        return mentors.filter(mentor =>
            mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, mentors]); // --- EDIT: Added mentors as a dependency
    
    const recentChats = useMemo(() => {
        return filteredMentors.filter(mentor => messages[mentor.id] && messages[mentor.id].length > 0);
    }, [filteredMentors, messages]);

    const otherMentors = useMemo(() => {
        return filteredMentors.filter(mentor => !messages[mentor.id] || messages[mentor.id].length === 0);
    }, [filteredMentors, messages]);


    return (
        <main className="font-sans bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
            <div className="h-screen w-full p-4 flex">
                <div className="flex w-full h-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-200/50 border border-white/50 overflow-hidden">
                    {/* --- Sidebar / Chat List --- */}
                    <aside className={`w-full md:w-1/3 lg:w-1/4 xl:w-1/5 bg-white/50 border-r border-amber-200/80 flex flex-col transition-all duration-300 ${selectedChat && 'hidden md:flex'}`}>
                        <div className="p-4 border-b border-amber-200/80">
                            <h2 className="text-3xl font-bold text-zinc-900">Chats</h2>
                            <div className="relative mt-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search mentors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-amber-50/50 border-2 border-amber-200/60 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-zinc-900"
                                />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {/* Recent Chats Section */}
                            {recentChats.length > 0 && <h3 className="px-4 py-2 text-sm font-semibold text-zinc-500">Recent Chats</h3>}
                            {recentChats.map(mentor => (
                                <ChatItem key={mentor.id} mentor={mentor} messages={messages} selectedChat={selectedChat} onSelect={() => setSelectedChat(mentor)} />
                            ))}

                            {/* Other Mentors Section */}
                            {otherMentors.length > 0 && <h3 className="px-4 py-2 mt-2 text-sm font-semibold text-zinc-500">All Mentors</h3>}
                            {otherMentors.map(mentor => (
                                <ChatItem key={mentor.id} mentor={mentor} messages={messages} selectedChat={selectedChat} onSelect={() => setSelectedChat(mentor)} />
                            ))}
                        </div>
                    </aside>

                    {/* --- Main Chat Window --- */}
                    <section className={`w-full flex flex-col bg-amber-100/30 transition-all duration-300 ${!selectedChat && 'hidden md:flex'}`}>
                        {selectedChat ? (
                            <ChatWindow selectedChat={selectedChat} messages={messages[selectedChat.id] || []} onSendMessage={handleSendMessage} newMessage={newMessage} setNewMessage={setNewMessage} onBack={() => setSelectedChat(null)} chatEndRef={chatEndRef} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center p-4">
                                <MessageSquarePlus size={48} className="mb-4 text-amber-400"/>
                                <h3 className="text-xl font-semibold">Welcome to Mentora Chat</h3>
                                <p>Select or search for a mentor to start a conversation.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

// --- Sub-component: ChatItem ---
const ChatItem = ({ mentor, messages, selectedChat, onSelect }) => {
    const lastMessage = messages[mentor.id]?.[messages[mentor.id].length - 1];
    return (
        <motion.div
            onClick={onSelect}
            className={`flex items-center p-4 cursor-pointer border-l-4 transition-colors ${selectedChat?.id === mentor.id ? 'bg-amber-100 border-amber-500' : 'border-transparent hover:bg-amber-100/50'}`}
            whileHover={{ scale: 1.02 }}
        >
            <div className="relative mr-4 flex-shrink-0">
                <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full" />
                {mentor.online && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>}
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-zinc-800 truncate">{mentor.name}</h3>
                    {lastMessage && <p className="text-xs text-zinc-500 flex-shrink-0 ml-2">{lastMessage.timestamp}</p>}
                </div>
                <p className="text-sm text-zinc-600 truncate">{lastMessage?.text || `Start chatting with ${mentor.title}`}</p>
            </div>
        </motion.div>
    );
};

// --- Sub-component: ChatWindow ---
const ChatWindow = ({ selectedChat, messages, onSendMessage, newMessage, setNewMessage, onBack, chatEndRef }) => {
    return (
        <>
            <header className="flex items-center p-4 bg-white/70 backdrop-blur-xl border-b border-amber-200/80 shadow-sm flex-shrink-0 z-10">
                <button onClick={onBack} className="md:hidden mr-4 text-zinc-600">
                    <ChevronLeft />
                </button>
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full mr-4" />
                <div>
                    <h3 className="font-bold text-zinc-900">{selectedChat.name}</h3>
                    <p className={`text-sm font-semibold ${selectedChat.online ? 'text-green-600' : 'text-zinc-500'}`}>{selectedChat.online ? 'Online' : 'Offline'}</p>
                </div>
                <div className="ml-auto"><button className="text-zinc-500 hover:text-zinc-800 p-2 rounded-full hover:bg-amber-100/50 transition-colors"><MoreVertical /></button></div>
            </header>

            <div className="flex-grow p-4 overflow-y-auto">
                <AnimatePresence>
                {messages.map((msg, index) => {
                    const showAvatar = msg.sender === 'mentor' && (!messages[index + 1] || messages[index + 1].sender !== 'mentor');
                    return (
                        <motion.div
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`flex items-end gap-2 my-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.sender === 'mentor' && (showAvatar ? <img src={selectedChat.avatar} className="w-7 h-7 rounded-full" alt={selectedChat.name} /> : <div className="w-7" />)}
                            <div className={`max-w-xs md:max-w-lg p-3 px-4 rounded-2xl shadow-md ${msg.sender === 'me' ? 'bg-zinc-900 text-white rounded-br-lg' : 'bg-white text-zinc-800 rounded-bl-lg'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
                <div ref={chatEndRef} />
            </div>

            <footer className="p-4 bg-white/70 backdrop-blur-xl border-t border-amber-200/80 flex-shrink-0">
                <form onSubmit={onSendMessage} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" className="p-2 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-amber-100/50 transition-colors"><Smile size={20} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" className="p-2 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-amber-100/50 transition-colors"><Paperclip size={20} /></motion.button>
                    </div>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full bg-amber-100/50 border-2 border-amber-200/60 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm text-zinc-900"
                    />
                    <motion.button type="submit" className="bg-zinc-900 text-white p-3 rounded-full hover:bg-zinc-800 transition-colors transform hover:scale-105" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Send size={20} />
                    </motion.button>
                </form>
            </footer>
        </>
    );
};

