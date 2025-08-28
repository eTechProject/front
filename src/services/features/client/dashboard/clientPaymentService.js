import ENDPOINTS from '@/services/config/endpoints.js';
import apiClient from '@/services/config/api.js';

export const paymentService = {
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
};