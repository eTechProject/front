import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const adminPaymentService = {

    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.PAYMENT_HISTORY.LIST, { params });
            return {
                success: true,
                data: response.data,
                pagination: response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement de l\'historique des paiements',
                details: error.response?.data?.errors || {},
            };
        }
    },

};