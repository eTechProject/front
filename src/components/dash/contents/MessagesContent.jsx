import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText } from "lucide-react";
import { useZone } from "../../../hooks/useZone.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useMessages } from "../../../hooks/useMessage.js";

export default function MessagesContent() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const { getZone } = useZone();
    const {
        messages,
        getMessages,
        sendMessage,
        isLoading: messagesLoading,
        error: messagesError,
        getConversationMessages
    } = useMessages();

    const [serviceOrder, setServiceOrder] = useState(null);
    const [assignedAgents, setAssignedAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchZone = async () => {
            try {
                setIsLoading(true);
                const result = await getZone(user.userId);
                if (result?.success) {
                    setServiceOrder(result.data.serviceOrder);
                    setAssignedAgents(result.data.assignedAgents);
                }
            } catch (error) {
                console.error("Erreur dans getZone:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchZone().then();
    }, [user.userId]);

    // Transform assigned agents into users format - ensure encryptedId exists!
    const agentUsers = assignedAgents.map(agent => ({
        user: {
            id: agent.agent.agentId,
            encryptedId: agent.agent.user.encryptedId, // ID chiffré pour POST
            username: agent.agent.user.name || 'Agent',
            isOnline: agent.status === 'actif',
            role: agent.agent.user.role,
            agentData: agent
        },
        lastMessage: null
    }));

    // Charger les messages de la conversation spécifique à chaque changement d'agent sélectionné
    useEffect(() => {
        if (selectedUser && user.userId && selectedUser.id) {
            getConversationMessages(user.userId, selectedUser.id, {page: 1, limit: 20}).then();
        }
    }, [selectedUser, user.userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUser]);

    const filteredUsers = agentUsers.filter(userData =>
        userData.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        await sendMessage({
            order_id: serviceOrder?.id,
            sender_id: user.userId,
            receiver_id: selectedUser.id,
            content: newMessage
        });
        setNewMessage('');
    };

    const isCurrentUserMessage = (message) => {
        if (!message) return false;
        return String(message.sender_id) === String(user.encryptedId);
    };

    return (
        <div className="flex p-2 h-full bg-[#f7f7f8] rounded-xl border border-gray-100 overflow-hidden">
            {/* Conversations list */}
            <div className="w-1/3 p-2 bg-white border-r border-gray-100 flex flex-col">
                <div className="border-b border-gray-100 bg-white">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquareText className="w-6 h-6"/>
                            Messagerie
                        </h1>
                        <p className="text-gray-600 mt-1">Gérez vos agents</p>
                    </div>
                    <div className="relative mt-3">
                        <input
                            type="text"
                            placeholder="Rechercher un agent..."
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
                    {isLoading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Chargement des agents...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                            {searchTerm ? 'Aucun agent ne correspond à votre recherche' : 'Aucun agent assigné'}
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
                                            <span className="text-sm font-medium text-gray-800 truncate">
                                                {userData.user.username}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                {userData.user.role}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500 truncate block mt-0.5">
                                            {userData.user.agentData.task?.description || 'Aucune tâche assignée'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-[#f7f7f8]">
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-14 w-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <h3 className="text-base font-medium text-gray-700 mb-1">Sélectionnez un agent</h3>
                            <p className="text-gray-400 text-sm">Choisissez un agent pour communiquer</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
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
                            {messagesLoading && (
                                <div className="flex items-center justify-center h-full text-gray-400 italic">
                                    Chargement...
                                </div>
                            )}
                            {messagesError && (
                                <div className="flex items-center justify-center h-full text-red-400 italic">
                                    {messagesError}
                                </div>
                            )}
                            {!messagesLoading && (!messages || messages.length === 0) && (
                                <div className="flex items-center justify-center h-full text-gray-300 italic">
                                    Aucun message pour l'instant...
                                </div>
                            )}
                            {(messages || []).filter(msg => !!msg).map((message,index) => {
                                const isFromCurrentUser = isCurrentUserMessage(message);
                                return (
                                    <div key={index}
                                         className={`flex mb-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm
                                            ${isFromCurrentUser
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-800 border border-gray-100'
                                        }`}>
                                            <div
                                                className="break-words whitespace-pre-wrap text-sm">{message.content}</div>
                                            <div className={`text-xs mt-1 text-right opacity-70`}>
                                                {message.sent_at
                                                    ? new Date(message.sent_at).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : ''
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}/>
                        </div>
                        {/* Message input */}
                        <div className="bg-white border-t border-gray-100 px-6 py-4">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez votre message..."
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