import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageSquareText, ArrowLeft, Search, Send, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useMessages } from "@/hooks/features/messaging/useMessage.js";
import { useAgentTasks } from "@/hooks/features/agent/useAgentTasks.js";
import useMercureSubscription from "@/hooks/features/messaging/useMercureSubscription.js";
import generateConversationTopic from "@/utils/generateConversationTopic.js";
import { useInfiniteScroll } from "@/hooks/features/messaging/useInfiniteScroll.js";
import toast from "react-hot-toast";

const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:8000/.well-known/mercure';
const MESSAGES_LIMIT = 20;
const TOKEN_REFRESH_BUFFER = 60;

// Nouveau composant pour l'indicateur de chargement
const LoadMoreIndicator = ({ isLoading, hasMore }) => {
    if (!hasMore) return null;

    return (
        <div className="flex justify-center py-2">
            {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Chargement des anciens messages...</span>
                </div>
            ) : null}
        </div>
    );
};

export default function MessagesContentAgent() {
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [mercureToken, setMercureToken] = useState(null);

    // Hooks
    const { user } = useAuth();
    const agentId = user?.userId;
    const { tasks, isLoading, error, fetchAssignedTasks } = useAgentTasks(agentId);
    const {
        messages,
        sendMessage,
        isLoading: messagesLoading,
        getConversationMessages,
        getMercureToken,
        addMercureMessage,
        isLoadingMore,
        hasMoreMessages,
        loadMoreMessages,
        resetConversation
    } = useMessages();

    // Hook pour l'infinite scroll
    const { containerRef, scrollToBottom } = useInfiniteScroll(
        loadMoreMessages,
        hasMoreMessages,
        isLoadingMore,
        [messages.length]
    );

    const addMercureMessageRef = useRef();

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

        // Réinitialiser la conversation avant de charger les nouveaux messages
        resetConversation();

        getConversationMessages(agentId, selectedClient.user.id, {
            page: 1,
            limit: MESSAGES_LIMIT
        }).then((result) => {
            if (result.success) {
                setTimeout(() => scrollToBottom('auto'), 100);
            }
        });
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
                toast.error('Erreur de connexion à la messagerie');
            }
        };

        fetchToken().then();
    }, [conversationTopic, mercureToken]);

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

    // Auto-scroll pour les nouveaux messages
    useEffect(() => {
        if (sortedMessages.length > 0) {
            // Vérifier si l'utilisateur est proche du bas avant de scroller
            const container = containerRef.current;
            if (container) {
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                if (isNearBottom) {
                    scrollToBottom('smooth');
                }
            }
        }
    }, [sortedMessages]);

    // Handlers
    const handleSelectClient = useCallback((userData) => {
        setSelectedClient(userData);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedClient(null);
        resetConversation();
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
            toast.error('Erreur lors de l\'envoi du message');
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedClient, sendingMessage, agentId, sendMessage]);

    // Composants utilitaires
    const ClientListSkeleton = () => (
        <div className="space-y-2 p-4">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border-b border-gray-50 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
            ))}
        </div>
    );

    const MessagesSkeleton = () => (
        <div className="space-y-3 px-4 lg:px-6 py-3 lg:py-4">
            {[...Array(4)].map((_, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className="max-w-[85%] lg:max-w-[80%] px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl bg-gray-200 animate-pulse">
                        <div className="h-4 w-40 bg-gray-300 rounded"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded mt-2"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const EmptyState = ({ message }) => (
        <div className="p-6 text-center text-gray-400 text-sm">{message}</div>
    );

    const MessageBubble = ({ message, isFromCurrentUser }) => (
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
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">Vos clients</p>
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
                        <ClientListSkeleton />
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

            {/* Zone de conversation */}
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
                                className="lg:hidden p-1.5 absolute z-[500] right-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-1"
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
                        </div>

                        {/* Messages avec infinite scroll */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-y-auto px-4 lg:px-6 py-3 lg:py-4 space-y-3"
                        >
                            {/* Indicateur de chargement en haut */}
                            <LoadMoreIndicator isLoading={isLoadingMore} hasMore={hasMoreMessages} />

                            {messagesLoading && !sortedMessages.length && (
                                <MessagesSkeleton />
                            )}
                            {!messagesLoading && sortedMessages.length === 0 && (
                                <div className="flex items-center justify-center h-full text-gray-300 italic text-sm">
                                    Aucun message pour l'instant...
                                </div>
                            )}

                            {sortedMessages.map((message, index) => {
                                const isFromCurrentUser = message.sender_id === agentId ||
                                    message._forceCurrentUser === true;

                                return (
                                    <MessageBubble
                                        key={message.id || `${message.sent_at}-${index}`}
                                        message={message}
                                        isFromCurrentUser={isFromCurrentUser}
                                    />
                                );
                            })}

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
                        </div>

                        {/* Input message */}
                        <div className="bg-white border-t flex justify-end border-gray-100 px-4 lg:px-6 py-3 lg:py-4">
                            <form onSubmit={handleSendMessage} className="flex w-[87%] lg:w-full gap-2 lg:gap-3">
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
                                    className="bg-gray-900 text-white rounded-lg px-3 lg:px-6 py-2 lg:py-2.5 font-medium shadow hover:bg-gray-800 transition disabled:bg-zinc-200 disabled:text-gray-400 text-sm lg:text-base flex-shrink-0"
                                >
                                    <span className="hidden sm:inline">
                                        {sendingMessage ? 'Envoi...' : 'Envoyer'}
                                    </span>
                                    <span className="sm:hidden">
                                        {sendingMessage ? '...' : <Send className="w-4 h-4"/>}
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