import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const adminSubscriptionService = {

    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.LIST, { params });
            return {
                success: true,
                data: response.data,
                pagination: response.pagination
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des abonnements',
                details: error.response?.data?.errors || {},
            };
        }
    },

    getById: async (id) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.PAYMENTS.DETAIL(id));
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des détails de l\'abonnement',
                details: error.response?.data?.errors || {},
            };
        }
    },

    updateStatus: async (id, status) => {
        try {
            const response = await apiClient.put(ENDPOINTS.ADMIN.PAYMENTS.UPDATE_STATUS(id), { status });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la mise à jour du statut de l\'abonnement',
                details: error.response?.data?.errors || {},
            };
        }
    },
};