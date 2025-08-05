import { useState } from 'react';
import { messageService } from '../services/messageService';

export const useMessages = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [success, setSuccess] = useState(false);

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
            setMessages(prev => [ ...(prev || []), newMessage ]);
        } else if (!result.success) {
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
        } else {
            setError(result.error);
        }
        return result;
    };

    const getConversationMessages = async (senderId, receiverId, params = {}) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await messageService.getConversationMessages(senderId, receiverId, params);
        setIsLoading(false);
        setSuccess(result.success);
        if (result.success) {
            const messagesWithSenderInfo = (result.messages || []).map(message => {
                if (String(message.sender_id) === String(senderId)) {
                    return { ...message, _forceCurrentUser: true };
                }
                return message;
            });
            setMessages(messagesWithSenderInfo);
        } else {
            setError(result.error);
        }
        return result;
    };

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
            // Check if message already exists by ID
            if (newMessage.id && !existingIds.includes(newMessage.id)) {
                const sortedMessages = [...(prevMessages || []), newMessage].sort((a, b) => 
                    new Date(a.sent_at) - new Date(b.sent_at)
                );
                return sortedMessages;
            } else if (!newMessage.id) {
                // Handle messages without ID (should not happen but just in case)
                console.warn('Message received without ID:', newMessage);
                return [...(prevMessages || []), newMessage].sort((a, b) => 
                    new Date(a.sent_at) - new Date(b.sent_at)
                );
            }
            return prevMessages;
        });
    };

    return {
        isLoading,
        error,
        success,
        messages,
        sendMessage,
        getMessages,
        getConversationMessages,
        getMercureToken,
        addMercureMessage
    };
};