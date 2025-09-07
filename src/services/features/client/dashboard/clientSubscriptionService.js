import ENDPOINTS from '@/services/config/endpoints.js';
import apiClient from '@/services/config/api.js';

export const subscriptionService = {
    getPayments: async (clientId, params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.CLIENT.PAYMENTS.LIST(clientId), { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération des paiements',
                details: error.response?.data?.errors || {}
            };
        }
    },
    sendPayment: async (paymentData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.CLIENT.PAYMENTS.SEND, paymentData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'envoi du paiement',
                details: error.response?.data?.errors || {}
            };
        }
    }
};