import ENDPOINTS from '@/services/config/endpoints.js';
import apiClient from '@/services/config/api.js';

export const paymentHistoryService = {

    getPaymentHistory: async (clientId, params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.CLIENT.PAYMENTS.HISTORY(clientId), { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique des paiements',
                details: error.response?.data?.errors || {}
            };
        }
    },

    getPaymentById: async (clientId, paymentId) => {
        try {
            const response = await apiClient.get(ENDPOINTS.CLIENT.PAYMENTS.HISTORY_BY_ID(clientId, paymentId));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération du paiement',
                details: error.response?.data?.errors || {}
            };
        }
    },

    downloadInvoice: async (paymentHistoryId) => {
        try {
            const response = await apiClient.get(`/payment-history/${paymentHistoryId}/invoice`, {
                responseType: 'blob'
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du téléchargement de la facture',
                details: error.response?.data?.errors || {}
            };
        }
    }
};