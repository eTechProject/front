import apiClient from '../config/api';
import ENDPOINTS from '../config/endpoints';

export const messageService = {
    sendMessage: async (messageData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.MESSAGE.SEND, messageData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de l\'envoi du message'
            };
        }
    },
    getMessages: async (encryptedOrderId, params = {}) => {
        try {
            const url = ENDPOINTS.MESSAGE.GET(encryptedOrderId);
            const response = await apiClient.get(url, { params });
            return {
                success: true,
                messages: response.data,
                ...response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de la récupération des messages'
            };
        }
    },
    getConversationMessages: async (senderId, receiverId, params = {}) => {
        try {
            const url = ENDPOINTS.MESSAGE.CONVERSATION(senderId, receiverId);
            const response = await apiClient.get(url, { params });
            return {
                success: true,
                messages: response.data,
                ...response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de la récupération des messages de la conversation'
            };
        }
    },
    getMercureToken: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.MESSAGE.MERCURE_TOKEN);
            return {
                success: true,
                token: response.data.mercureToken,
                topics: response.data.topics,
                expires_in: response.data.expires_in,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de la récupération du token Mercure'
            };
        }
    }
};