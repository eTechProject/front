import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {MessageSquareText, ArrowLeft, Search} from "lucide-react";
import {useAuth} from "@/context/AuthContext.jsx";
import {useMessages} from "@/hooks/features/messaging/useMessage.js";
import {useAgentTasks} from "@/hooks/features/agent/useAgentTasks.js";
import useMercureSubscription from "@/hooks/features/messaging/useMercureSubscription.js";
import generateConversationTopic from "@/utils/generateConversationTopic.js";

const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:8000/.well-known/mercure';
const MESSAGES_LIMIT = 20;
const TOKEN_REFRESH_BUFFER = 60;

export default function MessagesContentAgent() {
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [mercureToken, setMercureToken] = useState(null);

    // Refs
    const messagesEndRef = useRef(null);
    const addMercureMessageRef = useRef();

    // Hooks
    const {user} = useAuth();
    const agentId = user?.userId;
    const {tasks, isLoading, error, fetchAssignedTasks} = useAgentTasks(agentId);
    const {
        messages,
        sendMessage,
        isLoading: messagesLoading,
        error: messagesError,
        getConversationMessages,
        getMercureToken,
        addMercureMessage
    } = useMessages();

    useEffect(() => {
        addMercureMessageRef.current = addMercureMessage;
    }, [addMercureMessage]);

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

    const conversationTopic = useMemo(() => {
        if (!selectedClient?.user.id || !agentId) return null;
        return generateConversationTopic(agentId, selectedClient.user.id);
    }, [selectedClient, agentId]);

    // Messages triés
    const sortedMessages = useMemo(() => {
        return (messages || []).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    }, [messages]);

    // Filtrage des clients
    const filteredClients = useMemo(() => {
        return clientUsers.filter(userData =>
            userData.user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clientUsers, searchTerm]);

    useEffect(() => {
        if (agentId) {
            fetchAssignedTasks().then();
        }
    }, [agentId, fetchAssignedTasks]);

    useEffect(() => {
        if (!selectedClient?.user.id || !agentId) {
            setMercureToken(null);
            return;
        }

        getConversationMessages(agentId, selectedClient.user.id, {
            page: 1,
            limit: MESSAGES_LIMIT
        }).then();
    }, [selectedClient, agentId]);

    // Gestion du token Mercure
    useEffect(() => {
        if (!conversationTopic || mercureToken) return;

        const fetchToken = async () => {
            try {
                const result = await getMercureToken();
                if (result.success) {
                    setMercureToken(result.token);

                    if (result.expires_in) {
                        const refreshTime = (result.expires_in - TOKEN_REFRESH_BUFFER) * 1000;
                        setTimeout(() => setMercureToken(null), refreshTime);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du token Mercure:', error);
            }
        };

        fetchToken().then();
    }, [conversationTopic, mercureToken,]);

    // Gestionnaire des messages Mercure
    const handleMercureMessage = useCallback((data) => {
        if (!data.content || !addMercureMessageRef.current) return;

        const messageWithUserInfo = {
            ...data,
            _forceCurrentUser: String(data.sender_id) === String(agentId)
        };
        addMercureMessageRef.current(messageWithUserInfo);
    }, [agentId]);

    // Abonnement Mercure
    useMercureSubscription({
        topic: conversationTopic,
        mercureUrl: MERCURE_URL,
        token: mercureToken,
        onMessage: handleMercureMessage
    });

    useEffect(() => {
        if (sortedMessages.length > 0) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }, [sortedMessages]);

    // Handlers
    const handleSelectClient = useCallback((userData) => {
        setSelectedClient(userData);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedClient(null);
    }, []);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedClient || sendingMessage) return;

        const messageContent = newMessage;
        setNewMessage('');
        setSendingMessage(true);

        try {
            await sendMessage({
                order_id: selectedClient.user.orderId,
                sender_id: agentId,
                receiver_id: selectedClient.user.id,
                content: messageContent
            }, false);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            setNewMessage(messageContent);
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedClient, sendingMessage, agentId, sendMessage]);

    // Composants utilitaires (similaires au composant client)
    const LoadingSpinner = () => (
        <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-gray-400 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Chargement des clients...</p>
        </div>
    );

    const EmptyState = ({message}) => (
        <div className="p-6 text-center text-gray-400 text-sm">{message}</div>
    );

    const MessageBubble = ({message, isFromCurrentUser}) => (
        <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[80%] px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl shadow-sm
                ${isFromCurrentUser
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-800 border border-gray-100'
            }`}>
                <div className="break-words whitespace-pre-wrap text-sm">
                    {message.content}
                </div>
                <div className="text-xs mt-1 text-right opacity-70">
                    {message.sent_at && new Date(message.sent_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 flex bg-[#f7f7f8] rounded-xl border border-gray-100 overflow-hidden">
            {/* Liste des clients */}
            <div className={`
                ${selectedClient ? 'hidden lg:flex' : 'flex lg:flex'}
                ${selectedClient ? 'lg:w-80 xl:w-96' : 'w-full lg:w-80 xl:w-96'}
                bg-white border-r border-gray-100 flex-col
            `}>
                {/* En-tête */}
                <div className="border-b border-gray-100 bg-white p-4 lg:p-6">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <MessageSquareText className="w-5 h-5 lg:w-6 lg:h-6"/>
                        Clients
                    </h1>
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">Gérez vos clients</p>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
                        />
                    </div>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <LoadingSpinner/>
                    ) : filteredClients.length === 0 ? (
                        <EmptyState
                            message={searchTerm
                                ? 'Aucun client ne correspond à votre recherche'
                                : 'Aucun client assigné'
                            }
                        />
                    ) : (
                        filteredClients.map((userData) => (
                            <div
                                key={userData.user.id}
                                className="cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSelectClient(userData)}
                            >
                                <div className="flex items-center gap-3 p-4">
                                    <div
                                        className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm flex-shrink-0">
                                        {userData.user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {userData.user.username}
                                            </span>
                                            <span
                                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex-shrink-0 ml-2">
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

            {/* Zone de conversation - Structure identique au composant client */}
            <div className={`
                ${!selectedClient ? 'hidden lg:flex' : 'flex'}
                flex-1 flex-col bg-[#f7f7f8] min-w-0
            `}>
                {!selectedClient ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <MessageSquareText className="mx-auto h-12 w-12 text-gray-200 mb-4"/>
                            <h3 className="text-base font-medium text-gray-700 mb-1">Sélectionnez un client</h3>
                            <p className="text-gray-400 text-sm">
                                Choisissez un client pour commencer à communiquer
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header conversation */}
                        <div
                            className="border-b border-gray-100 px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-3 bg-white">
                            <button
                                onClick={handleBackToList}
                                className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg -ml-1"
                            >
                                <ArrowLeft className="w-5 h-5"/>
                            </button>
                            <div
                                className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm lg:text-base shadow-sm flex-shrink-0">
                                {selectedClient.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm lg:text-base font-semibold text-gray-900 truncate">
                                    {selectedClient.user.username}
                                </div>
                                <div className="text-xs text-gray-400">{selectedClient.user.email}</div>
                            </div>
                            {conversationTopic && mercureToken && (
                                <div className="flex items-center text-xs text-green-500"
                                     title="Messages en temps réel activés">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                    <span className="hidden sm:inline">Temps réel</span>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-3 lg:py-4 space-y-3">
                            {messagesLoading && !sortedMessages.length && (
                                <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
                                    Chargement...
                                </div>
                            )}
                            {messagesError && !sortedMessages.length && (
                                <div className="flex items-center justify-center h-full text-red-400 italic text-sm">
                                    {messagesError}
                                </div>
                            )}
                            {!messagesLoading && !sortedMessages.length && (
                                <div className="flex items-center justify-center h-full text-gray-300 italic text-sm">
                                    Aucun message pour l'instant...
                                </div>
                            )}

                            {sortedMessages.map((message, index) => (
                                <MessageBubble
                                    key={message.id || index}
                                    message={message}
                                    isFromCurrentUser={
                                        message.sender_id === agentId || message._forceCurrentUser === true
                                    }
                                />
                            ))}

                            {sendingMessage && (
                                <div className="flex justify-end">
                                    <div
                                        className="max-w-[85%] lg:max-w-[80%] px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl shadow-sm bg-gray-200 text-gray-500 opacity-70">
                                        <div className="text-sm flex items-center gap-2">
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Envoi...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* Input message */}
                        <div className="bg-white border-t flex justify-end border-gray-100 px-4 lg:px-6 py-3 lg:py-4">
                            <form onSubmit={handleSendMessage} className="flex w-[85%] lg:w-full gap-2 lg:gap-3">
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