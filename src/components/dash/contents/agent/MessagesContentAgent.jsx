import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageSquareText, Menu, X } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { useMessages } from "../../../../hooks/useMessage.js";
import { useAgentTasks } from "../../../../hooks/useAgentTasks.js";

export default function MessagesContentAgent() {
    const { user } = useAuth();
    const agentId = user?.userId;
    const { tasks, isLoading, error, fetchAssignedTasks } = useAgentTasks(agentId);

    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef(null);

    const {
        messages,
        sendMessage,
        isLoading: messagesLoading,
        error: messagesError,
        getConversationMessages,
    } = useMessages();

    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Load agent tasks
    useEffect(() => {
        if (agentId) {
            fetchAssignedTasks();
        }
    }, [agentId, fetchAssignedTasks]);

    // Prepare client users list
    const clientUsers = useMemo(() => {
        return (tasks || []).map(task => ({
            user: {
                id: task.client.id,
                encryptedId: task.client.encryptedId,
                username: task.client.name || 'Client',
                email: task.client.email,
                orderId: task.orderId,
                status: task.status,
            },
            lastMessage: null
        }));
    }, [tasks]);

    // Load conversation messages when client is selected
    useEffect(() => {
        if (selectedClient && agentId && selectedClient.user.id) {
            console.log("Loading conversation between agent", agentId, "and client", selectedClient.user.id);
            getConversationMessages(agentId, selectedClient.user.id, { page: 1, limit: 20 });
        }
    }, [selectedClient, agentId]);

    // Combine API messages (plus de Mercure)
    const allMessages = useMemo(() => {
        return (messages || []).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    }, [messages]);

    // Auto-scroll to latest message
    useEffect(() => {
        if (allMessages?.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [allMessages]);

    // Responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setShowSidebar(true);
            } else {
                setShowSidebar(!selectedClient);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedClient]);

    // Filter clients by search term
    const filteredClients = clientUsers.filter(userData =>
        userData.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Client selection handler
    const handleSelectClient = useCallback((userData) => {
        setSelectedClient(userData);
        if (window.innerWidth < 1024) setShowSidebar(false);
    }, []);

    // Toggle sidebar
    const toggleSidebar = useCallback(() => {
        setShowSidebar(prev => !prev);
    }, []);

    // Send message handler
    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedClient || sendingMessage) return;

        const messageContent = newMessage;
        setNewMessage('');
        setSendingMessage(true);

        const messageData = {
            order_id: selectedClient.user.orderId,
            sender_id: agentId,
            receiver_id: selectedClient.user.id,
            content: messageContent
        };

        try {
            await sendMessage(messageData);
        } catch (error) {
            setNewMessage(messageContent);
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedClient, sendingMessage, agentId, sendMessage]);

    return (
        <div className="absolute inset-0 flex bg-[#f7f7f8] rounded-xl border border-gray-100 overflow-hidden">
            {/* Overlay for mobile */}
            {showSidebar && selectedClient && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar - Client list */}
            <div className={`
                ${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 
                ${selectedClient && window.innerWidth < 1024 ? 'fixed' : 'relative'} 
                lg:relative
                inset-y-0 left-0 z-50 
                w-full sm:w-80 lg:w-80 xl:w-96
                bg-white border-r border-gray-100 
                flex flex-col 
                transition-transform duration-300 ease-in-out
                ${!showSidebar && 'lg:flex'}
            `}>
                <div className="border-b border-gray-100 bg-white p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquareText className="w-5 h-5 lg:w-6 lg:h-6"/>
                            <span className="hidden sm:inline">Clients</span>
                            <span className="sm:hidden">Messages</span>
                        </h1>
                        {selectedClient && (
                            <button
                                onClick={() => setShowSidebar(false)}
                                className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">Gérez vos clients</p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 lg:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-gray-400 mx-auto"></div>
                            <p className="text-gray-500 mt-2 text-sm">Chargement des clients...</p>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                            {searchTerm ? 'Aucun client ne correspond à votre recherche' : 'Aucun client assigné'}
                        </div>
                    ) : (
                        filteredClients.map((userData) => (
                            <div
                                key={userData.user.id}
                                className={`cursor-pointer transition-colors ${selectedClient?.user?.id === userData.user.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                onClick={() => handleSelectClient(userData)}
                            >
                                <div className="flex items-center gap-3 p-4">
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-base shadow-sm ${selectedClient?.user?.id === userData.user.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {userData.user.username.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-800 truncate">
                                                {userData.user.username}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 flex-shrink-0 ml-2">
                                                {userData.user.status}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500 truncate block mt-0.5">
                                            {userData.user.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className={`
                flex-1 flex flex-col bg-[#f7f7f8] min-w-0
                ${showSidebar && selectedClient ? 'hidden lg:flex' : 'flex'}
            `}>
                {!selectedClient ? (
                    <div className="flex-1 flex flex-col">
                        <div className="lg:hidden border-b border-gray-100 px-4 py-3 flex items-center justify-between bg-white">
                            <span className="font-medium text-gray-900">Messages</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 lg:h-14 lg:w-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                                <h3 className="text-base font-medium text-gray-700 mb-1">Sélectionnez un client</h3>
                                <p className="text-gray-400 text-sm px-4 mb-4">
                                    Choisissez un client pour commencer à communiquer
                                </p>
                                {!showSidebar && (
                                    <button
                                        onClick={toggleSidebar}
                                        className="lg:hidden px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                    >
                                        Voir la liste des clients
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="border-b border-gray-100 px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-3 bg-white">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg -ml-1"
                            >
                                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <div
                                className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm lg:text-base shadow-sm flex-shrink-0">
                                {selectedClient.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm lg:text-base font-semibold text-gray-900 truncate">{selectedClient.user.username}</div>
                                <div className="text-xs text-gray-400">{selectedClient.user.email}</div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-3 lg:py-4 space-y-3">
                            {messagesLoading && allMessages?.length === 0 && (
                                <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
                                    Chargement...
                                </div>
                            )}
                            {messagesError && allMessages?.length === 0 && (
                                <div className="flex items-center justify-center h-full text-red-400 italic text-sm">
                                    {messagesError}
                                </div>
                            )}
                            {!messagesLoading && (!allMessages || allMessages.length === 0) && (
                                <div className="flex items-center justify-center h-full text-gray-300 italic text-sm">
                                    Aucun message pour l'instant...
                                </div>
                            )}
                            {allMessages && allMessages.map((message, index) => {
                                const isFromCurrentUser = message.sender_id === agentId ||
                                    (message._forceCurrentUser === true);
                                return (
                                    <div key={message.id || index} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl shadow-sm
                                            ${isFromCurrentUser
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-800 border border-gray-100'
                                        }`}>
                                            <div className="break-words whitespace-pre-wrap text-sm">
                                                {message.content}
                                            </div>
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
                            {sendingMessage && (
                                <div className="flex justify-end">
                                    <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl shadow-sm bg-gray-200 text-gray-500 opacity-70">
                                        <div className="text-sm flex items-center gap-2">
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Envoi en cours...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef}/>
                        </div>
                        <div className="bg-white border-t border-gray-100 px-4 lg:px-6 py-3 lg:py-4">
                            <form onSubmit={handleSendMessage} className="flex gap-2 lg:gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez votre message..."
                                    className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 lg:px-4 py-2 lg:py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
                                    autoComplete="off"
                                    disabled={sendingMessage}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendingMessage}
                                    className="bg-gray-900 text-white rounded-lg px-4 lg:px-6 py-2 lg:py-2.5 font-medium shadow hover:bg-gray-800 transition disabled:bg-gray-300 disabled:text-gray-400 text-sm lg:text-base flex-shrink-0"
                                >
                                    <span className="hidden sm:inline">
                                        {sendingMessage ? 'Envoi...' : 'Envoyer'}
                                    </span>
                                    <span className="sm:hidden">
                                        {sendingMessage ? '...' : '↗'}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}