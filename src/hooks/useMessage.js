import { useState } from 'react';
import { messageService } from '../services/messageService';

export const useMessages = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [success, setSuccess] = useState(false);

    const sendMessage = async (messageData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await messageService.sendMessage(messageData);
        setIsLoading(false);
        setSuccess(result.success);
        if (result.success) {
            setMessages(prev => [ ...(prev || []), result.data ]);
        } else {
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
            setMessages(result.messages || []);
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

    return {
        isLoading,
        error,
        success,
        messages,
        sendMessage,
        getMessages,
        getConversationMessages,
        getMercureToken
    };
};