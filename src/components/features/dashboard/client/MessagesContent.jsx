import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageSquareText, ArrowLeft, Search, Users, Send, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useMessages } from "@/hooks/features/messaging/useMessage.js";
import { useZone } from "@/hooks/features/zone/useZone.js";
import generateConversationTopic from "@/utils/generateConversationTopic.js";
import useMercureSubscription from "@/hooks/features/messaging/useMercureSubscription.js";
import toast from "react-hot-toast";
import {useInfiniteScroll} from "@/hooks/features/messaging/useInfiniteScroll.js";

const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:8000/.well-known/mercure';
const MESSAGES_LIMIT = 20;
const TOKEN_REFRESH_BUFFER = 60;

// Composant GroupComposer (inchangé)
const GroupComposer = React.memo(({
                                      selectedAgents,
                                      agentUsers,
                                      newMessage,
                                      setNewMessage,
                                      sendingMessage,
                                      onSendMessage,
                                      onClose
                                  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Message groupé
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Envoyé à {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''}
                </p>
            </div>

            <div className="p-4 max-h-32 overflow-y-auto">
                <div className="space-y-2">
                    {selectedAgents.map(agentId => {
                        const agent = agentUsers.find(a => a.user.id === agentId);
                        return agent ? (
                            <div key={agentId} className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                                    {agent.user.username.charAt(0).toUpperCase()}
                                </div>
                                <span>{agent.user.username}</span>
                            </div>
                        ) : null;
                    })}
                </div>
            </div>

            <form onSubmit={onSendMessage} className="p-4 border-t border-gray-100">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message groupé..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm resize-none"
                    rows={3}
                    disabled={sendingMessage}
                    autoFocus
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={sendingMessage}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-gray-900 text-white rounded-lg px-4 py-2 font-medium shadow hover:bg-gray-800 transition disabled:bg-gray-300 disabled:text-gray-400 text-sm flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {sendingMessage ? 'Envoi...' : 'Envoyer à tous'}
                    </button>
                </div>
            </form>
        </div>
    </div>
));

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

/**
 * Composant principal de messagerie avec infinite scroll
 */
export default function MessagesContent() {
    // États principaux
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceOrder, setServiceOrder] = useState(null);
    const [assignedAgents, setAssignedAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [mercureToken, setMercureToken] = useState(null);

    // États pour les messages groupés
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showGroupComposer, setShowGroupComposer] = useState(false);

    // Hooks
    const { user } = useAuth();
    const { getZone } = useZone();
    const {
        messages,
        sendMessage,
        sendGroupMessage,
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

    const agentUsers = useMemo(() => {
        return (assignedAgents || []).map(agent => ({
            user: {
                id: agent.agent.user.userId,
                encryptedId: agent.agent.user.encryptedId,
                username: agent.agent.user.name || 'Agent',
                isOnline: agent.status === 'actif',
                role: agent.agent.user.role,
                agentData: agent
            },
            lastMessage: null
        }));
    }, [assignedAgents]);

    const conversationTopic = useMemo(() => {
        if (!selectedUser?.user.agentData?.agent.user.userId || !user?.userId) {
            return null;
        }
        return generateConversationTopic(
            user.userId,
            selectedUser.user.agentData.agent.user.userId
        );
    }, [selectedUser, user?.userId]);

    const sortedMessages = useMemo(() => {
        return (messages || []).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    }, [messages]);

    const filteredAgents = useMemo(() => {
        return agentUsers.filter(userData =>
            userData.user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agentUsers, searchTerm]);

    // Chargement initial de la zone
    useEffect(() => {
        const loadZone = async () => {
            if (!user?.userId) return;

            try {
                setIsLoading(true);
                const result = await getZone(user.userId);
                if (result?.success) {
                    setServiceOrder(result.data.serviceOrder);
                    setAssignedAgents(result.data.assignedAgents || []);
                }
            } catch {
                setAssignedAgents([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadZone().then();
    }, [user?.userId]);

    // Chargement des messages de conversation
    useEffect(() => {
        if (!selectedUser?.user.agentData?.agent.user.userId || !user?.userId) {
            setMercureToken(null);
            return;
        }

        // Réinitialiser la conversation avant de charger les nouveaux messages
        resetConversation();

        getConversationMessages(
            user.userId,
            selectedUser.user.agentData.agent.user.userId,
            { page: 1, limit: MESSAGES_LIMIT }
        ).then((result) => {
            if (result.success) {
                setTimeout(() => scrollToBottom('auto'), 100);
            }
        });
    }, [selectedUser, user?.userId]);

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
                        setTimeout(() => {
                            setMercureToken(null);
                        }, refreshTime);
                    }
                }
            } catch (err) {
                console.error('Erreur lors de la récupération du token Mercure:', err);
            }
        };

        fetchToken().then();
    }, [conversationTopic, mercureToken]);

    // Gestionnaire des messages Mercure
    const handleMercureMessage = useCallback((data) => {
        if (!data.content || !addMercureMessageRef.current) return;

        const messageWithUserInfo = {
            ...data,
            _forceCurrentUser: String(data.sender_id) === String(user?.userId)
        };
        addMercureMessageRef.current(messageWithUserInfo);
    }, [user?.userId]);

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

    // Handlers pour les messages groupés (stabilisés avec useCallback)
    const handleToggleGroupMode = useCallback(() => {
        setIsGroupMode(!isGroupMode);
        setSelectedAgents([]);
        setShowGroupComposer(false);
    }, [isGroupMode]);

    const handleSelectAgent = useCallback((agentId) => {
        setSelectedAgents(prev => {
            if (prev.includes(agentId)) {
                return prev.filter(id => id !== agentId);
            } else {
                return [...prev, agentId];
            }
        });
    }, []);

    const handleSelectAllAgents = useCallback(() => {
        if (selectedAgents.length === agentUsers.length) {
            setSelectedAgents([]);
        } else {
            setSelectedAgents(agentUsers.map(agent => agent.user.id));
        }
    }, [selectedAgents.length, agentUsers]);

    const handleOpenGroupComposer = useCallback(() => {
        if (selectedAgents.length === 0) {
            toast.error('Veuillez sélectionner au moins un agent');
            return;
        }
        setShowGroupComposer(true);
    }, [selectedAgents.length]);

    const handleSendGroupMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || selectedAgents.length === 0 || sendingMessage) return;

        const messageContent = newMessage;
        setNewMessage('');
        setSendingMessage(true);

        try {
            const result = await sendGroupMessage({
                order_id: serviceOrder?.id,
                sender_id: user.userId,
                receiver_ids: selectedAgents,
                content: messageContent
            });

            if (result.success) {
                setShowGroupComposer(false);
                setSelectedAgents([]);
                setIsGroupMode(false);
            } else {
                setNewMessage(messageContent);
                toast.error(result.error || 'Erreur lors de l\'envoi du message groupé');
            }

        } catch (err) {
            console.error('Erreur lors de l\'envoi du message groupé:', err);
            setNewMessage(messageContent);
            toast.error('Erreur lors de l\'envoi du message groupé');
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedAgents, sendingMessage, serviceOrder, user, sendGroupMessage]);

    const handleCloseGroupComposer = useCallback(() => {
        setShowGroupComposer(false);
        setNewMessage('');
    }, []);

    // Handlers existants (stabilisés)
    const handleSelectUser = useCallback((userData) => {
        setSelectedUser(userData);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedUser(null);
        resetConversation();
    }, []);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || sendingMessage) return;

        const messageContent = newMessage;
        setNewMessage('');
        setSendingMessage(true);

        try {
            await sendMessage({
                order_id: serviceOrder?.id,
                sender_id: user.userId,
                receiver_id: selectedUser.user.agentData.agent.user.userId,
                content: messageContent
            }, false);

            setTimeout(() => scrollToBottom('smooth'), 100);
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message:', err);
            setNewMessage(messageContent);
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedUser, sendingMessage, serviceOrder, user, sendMessage, scrollToBottom]);

    const AgentListSkeleton = () => (
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
                {message.is_group_message && (
                    <div className="text-xs mt-1 opacity-60 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Message groupé
                    </div>
                )}
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
            {/* Liste des agents */}
            <div className={`
                ${selectedUser ? 'hidden lg:flex' : 'flex lg:flex'}
                ${selectedUser ? 'lg:w-80 xl:w-96' : 'w-full lg:w-80 xl:w-96'}
                bg-white border-r border-gray-100 flex-col
            `}>
                <div className="border-b border-gray-100 bg-white p-4 lg:p-6">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <MessageSquareText className="w-5 h-5 lg:w-6 lg:h-6"/>
                        <span>Messagerie</span>
                    </h1>

                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-600 text-sm lg:text-base">
                            {isGroupMode ? 'Sélectionnez les agents' : 'Gérez vos agents'}
                        </p>
                        <button
                            onClick={handleToggleGroupMode}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                isGroupMode
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Users className="w-3 h-3" />
                            {isGroupMode ? 'Annuler' : 'Groupé'}
                        </button>
                    </div>

                    {/* Contrôles pour le mode groupé */}
                    {isGroupMode && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''} sélectionné{selectedAgents.length > 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={handleSelectAllAgents}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    {selectedAgents.length === agentUsers.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                </button>
                            </div>
                            {selectedAgents.length > 0 && (
                                <button
                                    onClick={handleOpenGroupComposer}
                                    className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    Composer message
                                </button>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un agent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
                        />
                    </div>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <AgentListSkeleton />
                    ) : filteredAgents.length === 0 ? (
                        <EmptyState
                            message={searchTerm
                                ? 'Aucun agent ne correspond à votre recherche'
                                : 'Aucun agent assigné'
                            }
                        />
                    ) : (
                        filteredAgents.map((userData) => (
                            <div
                                key={userData.user.id}
                                className={`cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                                    isGroupMode
                                        ? selectedAgents.includes(userData.user.id)
                                            ? 'bg-blue-50 hover:bg-blue-100'
                                            : 'hover:bg-gray-50'
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => isGroupMode
                                    ? handleSelectAgent(userData.user.id)
                                    : handleSelectUser(userData)
                                }
                            >
                                <div className="flex items-center gap-3 p-4">
                                    {isGroupMode && (
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            selectedAgents.includes(userData.user.id)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-gray-300'
                                        }`}>
                                            {selectedAgents.includes(userData.user.id) && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                    <div className="relative flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                                            {userData.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-2 border-white rounded-full ${userData.user.isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {userData.user.username}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex-shrink-0 ml-2">
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

            {/* Zone de conversation */}
            <div className={`
                ${!selectedUser ? 'hidden lg:flex' : 'flex'}
                flex-1 flex-col bg-[#f7f7f8] min-w-0
            `}>
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <MessageSquareText className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                            <h3 className="text-base font-medium text-gray-700 mb-1">Sélectionnez un agent</h3>
                            <p className="text-gray-400 text-sm">
                                Choisissez un agent pour commencer à communiquer
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header conversation */}
                        <div className="border-b border-gray-100 px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-3 bg-white">
                            <button
                                onClick={handleBackToList}
                                className="lg:hidden p-1.5 absolute z-[500] right-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-1"
                            >
                                <ArrowLeft className="w-5 h-5"/>
                            </button>
                            <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm lg:text-base shadow-sm flex-shrink-0">
                                {selectedUser.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm lg:text-base font-semibold text-gray-900 truncate">
                                    {selectedUser.user.username}
                                </div>
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
                                const isFromCurrentUser = message.sender_id === user.userId ||
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
                                    <div className="max-w-[85%] lg:max-w-[80%] px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl shadow-sm bg-gray-200 text-gray-500 opacity-70">
                                        <div className="text-sm flex items-center gap-2">
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

            {/* Modal pour composer un message groupé */}
            {showGroupComposer && (
                <GroupComposer
                    selectedAgents={selectedAgents}
                    agentUsers={agentUsers}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    sendingMessage={sendingMessage}
                    onSendMessage={handleSendGroupMessage}
                    onClose={handleCloseGroupComposer}
                />
            )}
        </div>
    );
}