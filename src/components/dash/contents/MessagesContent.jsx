import React, {useState, useRef, useEffect} from 'react';
import {MessageSquareText} from "lucide-react";

// Données fictives
const mockUsers = [
    {
        user: {
            id: 1,
            username: "Alice",
            isOnline: true,
        },
        lastMessage: {
            id: 101,
            content: "Salut, comment ça va ?",
            created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
            sender_id: 1,
        }
    },
    {
        user: {
            id: 2,
            username: "Bob",
            isOnline: false,
        },
        lastMessage: {
            id: 102,
            content: "À bientôt !",
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            sender_id: 2,
        }
    },
    {
        user: {
            id: 3,
            username: "Charly",
            isOnline: true,
        },
        lastMessage: null
    },
];

// Données fictives
const mockMessages = {
    1: [
        {
            id: 100,
            content: "Coucou Alice !",
            sender_id: 999,
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
            id: 101,
            content: "Salut, comment ça va ?",
            sender_id: 1,
            created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString()
        }
    ],
    2: [
        {
            id: 102,
            content: "À bientôt !",
            sender_id: 2,
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        }
    ],
    3: [],
};

const fakeCurrentUserId = 999;

export default function MessagesContent() {
    const [usersWithLastMessage] = useState(mockUsers);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser) {
            setMessages(mockMessages[selectedUser.id] || []);
        }
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, selectedUser]);

    const filteredUsers = usersWithLastMessage.filter(userData =>
        userData.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const fakeMessage = {
            id: Date.now(), // Un id unique temporaire
            content: newMessage,
            sender_id: fakeCurrentUserId,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, fakeMessage]);
        setNewMessage('');
    };

    // Fonction pour déterminer si un message est envoyé par l'utilisateur actuel
    const isCurrentUserMessage = (message) => {
        return String(message.sender_id) === String(fakeCurrentUserId);
    };

    return (
        <div className="flex p-2 h-full bg-[#f7f7f8] rounded-xl border border-gray-100 overflow-hidden">
            {/* Liste des conversations */}
            <div className="w-1/3 p-2 bg-white border-r border-gray-100 flex flex-col">
                <div className="border-b border-gray-100 bg-white">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquareText className="w-6 h-6"/>
                            Messagerie
                        </h1>
                        <p className="text-gray-600 mt-1">Gérez vos personnels</p>
                    </div>
                    <div className="relative mt-3">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                            Aucun résultat
                        </div>
                    ) : (
                        filteredUsers.map((userData) => (
                            <div
                                key={userData.user.id}
                                className={`cursor-pointer transition ${selectedUser?.id === userData.user.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedUser(userData.user)}
                            >
                                <div className="flex items-center gap-3 p-4">
                                    <div className="relative">
                                        <div
                                            className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-base shadow-sm ${selectedUser?.id === userData.user.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {userData.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span
                                            className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 border-2 border-white rounded-full ${userData.user.isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span
                                                className="text-sm font-medium text-gray-800 truncate">{userData.user.username}</span>
                                            {userData.lastMessage && (
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(userData.lastMessage.created_at).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        {userData.lastMessage ? (
                                            <span className="text-xs text-gray-500 truncate block mt-0.5">
                                                {userData.lastMessage.content}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300 italic block mt-0.5">Commencer une conversation</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Zone de chat */}
            <div className="flex-1 flex flex-col bg-[#f7f7f8]">
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-14 w-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <h3 className="text-base font-medium text-gray-700 mb-1">Sélectionnez une conversation</h3>
                            <p className="text-gray-400 text-sm">Choisissez quelqu'un pour discuter</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Entête du chat */}
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3 bg-white">
                            <div
                                className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-base shadow-sm">
                                {selectedUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-base font-semibold text-gray-900">{selectedUser.username}</div>
                                <div
                                    className={`text-xs ${selectedUser.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                    {selectedUser.isOnline ? 'En ligne' : 'Hors ligne'}
                                </div>
                            </div>
                        </div>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {messages.length === 0 && (
                                <div className="flex items-center justify-center h-full text-gray-300 italic">
                                    Aucun message pour l’instant...
                                </div>
                            )}
                            {messages.map((message) => {
                                const isFromCurrentUser = isCurrentUserMessage(message);
                                return (
                                    <div key={message.id}
                                         className={`flex mb-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm
                                            ${isFromCurrentUser
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-800 border border-gray-100'
                                        }`}>
                                            <div
                                                className="break-words whitespace-pre-wrap text-sm">{message.content}</div>
                                            <div className={`text-xs mt-1 text-right opacity-70`}>
                                                {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}/>
                        </div>
                        {/* Input */}
                        <div className="bg-white border-t border-gray-100 px-6 py-4">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez votre message…"
                                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium shadow hover:bg-gray-800 transition disabled:bg-gray-300 disabled:text-gray-400"
                                >
                                    Envoyer
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}