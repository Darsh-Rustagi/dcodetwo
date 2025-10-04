'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, ChevronLeft, MoreVertical, Paperclip, Smile } from 'lucide-react';

// --- Mock Data ---
const mentors = [
    { id: 1, name: 'Dr. Evelyn Reed', avatar: 'https://placehold.co/100x100/f59e0b/000000?text=ER', online: true },
    { id: 2, name: 'Marcus Vance', avatar: 'https://placehold.co/100x100/4ade80/000000?text=MV', online: false },
    { id: 3, name: 'Dr. Aliza Sharma', avatar: 'https://placehold.co/100x100/60a5fa/000000?text=AS', online: true },
    { id: 4, name: 'Kenji Tanaka', avatar: 'https://placehold.co/100x100/f472b6/000000?text=KT', online: false },
    { id: 5, name: 'Sofia Rossi', avatar: 'https://placehold.co/100x100/fb923c/000000?text=SR', online: true },
];

const initialMessages = {
    1: [
        { id: 1, text: 'Hi Dr. Reed! I had a follow-up question about our last session.', sender: 'me', timestamp: '10:40 AM' },
        { id: 2, text: 'Of course, I\'m here to help. What\'s on your mind?', sender: 'mentor', timestamp: '10:41 AM' },
        { id: 3, text: 'Absolutely, let\'s discuss quantum states.', sender: 'mentor', timestamp: '10:42 AM' },
    ],
    3: [
        { id: 1, text: 'Hello Dr. Sharma, do you have a moment to chat?', sender: 'me', timestamp: '9:14 AM' },
        { id: 2, text: 'The hippocampus is fascinating, isn\'t it?', sender: 'mentor', timestamp: '9:15 AM' },
    ],
    5: [
        { id: 1, text: 'Good morning, Sofia!', sender: 'me', timestamp: '11:00 AM' },
        { id: 2, text: 'Yes, I can share some resources on Renaissance art.', sender: 'mentor', timestamp: '11:01 AM' },
    ]
};


// --- Main Chat Page Component ---
export default function ChatsPage() {
    const firstChatMentor = useMemo(() => mentors.find(m => initialMessages[m.id]), []);

    const [messages, setMessages] = useState({});
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);
    
    // Load messages from localStorage on initial render
    useEffect(() => {
        const savedMessages = localStorage.getItem('mentoraChatMessages');
        const loadedMessages = savedMessages ? JSON.parse(savedMessages) : initialMessages;
        setMessages(loadedMessages);

        // Set the initial selected chat based on loaded messages
        const firstMentorWithHistory = mentors.find(m => loadedMessages[m.id]);
        setSelectedChat(firstMentorWithHistory || null);
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        // We check if messages is not an empty object before saving
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

    const mentorsToDisplay = useMemo(() => {
        // If searching, filter all mentors
        if (searchTerm.trim() !== '') {
            return mentors.filter(mentor =>
                mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        // Otherwise, only show mentors with an existing conversation
        return mentors.filter(mentor => messages[mentor.id]);
    }, [searchTerm, messages]);

    return (
        <main className="bg-amber-100 font-sans">
            <div className="h-screen flex flex-col">
                 {/* Spacer for the fixed navbar */}
                 <div className="h-16 md:h-24 flex-shrink-0"></div>

                <div className="flex-grow flex min-h-0">
                    {/* --- Sidebar / Chat List --- */}
                    <aside className={`w-full md:w-1/3 lg:w-1/4 bg-white/80 border-r border-amber-200/80 flex flex-col transition-all duration-300 ${selectedChat && 'hidden md:flex'}`}>
                        <div className="p-4 border-b border-amber-200/80">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Chats</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search mentors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-amber-50/50 border border-amber-200/60 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {mentorsToDisplay.map(mentor => {
                                const lastMessage = messages[mentor.id]?.[messages[mentor.id].length - 1];
                                return (
                                <div
                                    key={mentor.id}
                                    onClick={() => setSelectedChat(mentor)}
                                    className={`flex items-center p-4 cursor-pointer border-l-4 transition-colors ${selectedChat?.id === mentor.id ? 'bg-amber-100 border-amber-500' : 'border-transparent hover:bg-amber-100/50'}`}
                                >
                                    <div className="relative mr-4 flex-shrink-0">
                                        <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-full" />
                                        {mentor.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>}
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-zinc-800 truncate">{mentor.name}</h3>
                                            {lastMessage && <p className="text-xs text-zinc-500 flex-shrink-0 ml-2">{lastMessage.timestamp}</p>}
                                        </div>
                                        <p className="text-sm text-zinc-600 truncate">{lastMessage?.text || 'Start a conversation'}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </aside>

                    {/* --- Main Chat Window --- */}
                    <section className={`w-full flex flex-col bg-amber-200/40 transition-all duration-300 ${!selectedChat && 'hidden md:flex'}`}>
                        {selectedChat ? (
                            <>
                                <header className="flex items-center p-4 bg-white/80 border-b border-amber-200/80 shadow-sm flex-shrink-0">
                                    <button onClick={() => setSelectedChat(null)} className="md:hidden mr-4 text-zinc-600">
                                        <ChevronLeft />
                                    </button>
                                    <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full mr-4" />
                                    <div>
                                        <h3 className="font-bold text-zinc-900">{selectedChat.name}</h3>
                                        <p className="text-sm text-green-600">{selectedChat.online ? 'Online' : 'Offline'}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <button className="text-zinc-500 hover:text-zinc-800 p-2 rounded-full hover:bg-amber-100/50 transition-colors">
                                            <MoreVertical />
                                        </button>
                                    </div>
                                </header>

                                <div className="flex-grow p-4 overflow-y-auto">
                                    {messages[selectedChat.id]?.map((msg, index) => {
                                        const chatMessages = messages[selectedChat.id] || [];
                                        const showAvatar = msg.sender === 'mentor' && (!chatMessages[index + 1] || chatMessages[index + 1].sender !== 'mentor');

                                        return (
                                            <div key={msg.id} className={`flex items-end gap-2 my-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.sender === 'mentor' && (
                                                    showAvatar ? 
                                                    <img src={selectedChat.avatar} className="w-7 h-7 rounded-full" alt={selectedChat.name} /> :
                                                    <div className="w-7" /> // Spacer for alignment
                                                )}
                                                <div className={`max-w-xs md:max-w-md p-3 px-4 rounded-2xl shadow-sm ${msg.sender === 'me' ? 'bg-zinc-900 text-white rounded-br-lg' : 'bg-white text-zinc-800 rounded-bl-lg'}`}>
                                                    <p className="text-sm">{msg.text}</p>
                                                    <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-zinc-400' : 'text-zinc-500'} text-right`}>{msg.timestamp}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                <footer className="p-4 bg-white/80 border-t border-amber-200/80 flex-shrink-0">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white border border-amber-200/60 rounded-full py-1 px-2 shadow-sm">
                                        <button type="button" className="p-2 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-amber-100/50 transition-colors">
                                            <Smile size={20} />
                                        </button>
                                         <button type="button" className="p-2 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-amber-100/50 transition-colors">
                                            <Paperclip size={20} />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="w-full bg-transparent focus:outline-none px-2 text-sm"
                                        />
                                        <button type="submit" className="bg-zinc-900 text-white p-2.5 rounded-full hover:bg-zinc-800 transition-colors transform hover:scale-105">
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </footer>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                <p>Select or search for a mentor to start chatting</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
