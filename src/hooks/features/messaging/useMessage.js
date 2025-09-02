import { useState, useCallback } from 'react';
import { messageService } from '@/services/features/messaging/messageService.js';

export const useMessages = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [success, setSuccess] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [conversationParams, setConversationParams] = useState(null);

    const sendMessage = async (messageData, addToLocalState = false) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await messageService.sendMessage(messageData);
        setIsLoading(false);
        setSuccess(result.success);
        if (result.success && addToLocalState) {
            const newMessage = {
                ...result.data,
                _forceCurrentUser: true
            };
            setMessages(prev => [...(prev || []), newMessage]);
        } else if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const sendGroupMessage = async (messageData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await messageService.sendGroupMessage(messageData);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const getMessages = async (encryptedOrderId, params = {}) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await messageService.getMessages(encryptedOrderId, params);
        setIsLoading(false);
        setSuccess(result.success);
        if (result.success) {
            setMessages(result.messages || []);
            // Mettre à jour les métadonnées de pagination
            setCurrentPage(result.page || 1);
            setHasMoreMessages(result.page < result.pages);
        } else {
            setError(result.error);
        }
        return result;
    };

    const getConversationMessages = async (senderId, receiverId, params = {}) => {
        const isInitialLoad = !conversationParams ||
            conversationParams.senderId !== senderId ||
            conversationParams.receiverId !== receiverId;

        if (isInitialLoad) {
            setIsLoading(true);
            setMessages([]);
            setCurrentPage(1);
            setHasMoreMessages(true);
            setConversationParams({ senderId, receiverId });
        } else {
            setIsLoadingMore(true);
        }

        setError(null);
        setSuccess(false);

        const result = await messageService.getConversationMessages(senderId, receiverId, params);

        setIsLoading(false);
        setIsLoadingMore(false);
        setSuccess(result.success);

        if (result.success) {
            const messagesWithSenderInfo = (result.messages || []).map(message => {
                if (String(message.sender_id) === String(senderId)) {
                    return { ...message, _forceCurrentUser: true };
                }
                return message;
            });

            if (isInitialLoad) {
                setMessages(messagesWithSenderInfo);
            } else {
                // Pour l'infinite scroll, ajouter les anciens messages au début
                setMessages(prev => [...messagesWithSenderInfo, ...prev]);
            }

            setCurrentPage(result.page || 1);
            setHasMoreMessages(result.page < result.pages);
        } else {
            setError(result.error);
        }
        return result;
    };

    const loadMoreMessages = useCallback(async () => {
        if (!conversationParams || !hasMoreMessages || isLoadingMore) {
            return;
        }

        const nextPage = currentPage + 1;
        return getConversationMessages(
            conversationParams.senderId,
            conversationParams.receiverId,
            { page: nextPage, limit: 20 }
        );
    }, [conversationParams, hasMoreMessages, isLoadingMore, currentPage]);

    const getMercureToken = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await messageService.getMercureToken();
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    const addMercureMessage = (newMessage) => {
        setMessages(prevMessages => {
            const existingIds = (prevMessages || []).map(msg => msg.id);
            if (newMessage.id && !existingIds.includes(newMessage.id)) {
                const sortedMessages = [...(prevMessages || []), newMessage].sort((a, b) =>
                    new Date(a.sent_at) - new Date(b.sent_at)
                );
                return sortedMessages;
            } else if (!newMessage.id) {
                console.warn('Message received without ID:', newMessage);
                return [...(prevMessages || []), newMessage].sort((a, b) =>
                    new Date(a.sent_at) - new Date(b.sent_at)
                );
            }
            return prevMessages;
        });
    };

    // Fonction pour réinitialiser l'état lors du changement de conversation
    const resetConversation = useCallback(() => {
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
        setConversationParams(null);
        setError(null);
        setSuccess(false);
    }, []);

    return {
        isLoading,
        error,
        success,
        messages,
        isLoadingMore,
        hasMoreMessages,
        currentPage,
        loadMoreMessages,
        resetConversation,
        sendMessage,
        sendGroupMessage,
        getMessages,
        getConversationMessages,
        getMercureToken,
        addMercureMessage
    };
};