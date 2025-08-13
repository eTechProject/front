import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const adminPackService = {
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.PACKS.LIST, { params });
            return {
                success: true,
                data: response.data,
                pagination: response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des packs',
                details: error.response?.data?.errors || {},
            };
        }
    },

    getById: async (id) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.PACKS.PUBLIC_DETAIL(id));
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement du pack',
                details: error.response?.data?.errors || {},
            };
        }
    },

    create: async (packData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ADMIN.PACKS.CREATE, packData);
            return {
                success: true,
                data: response.data.pack,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la création du pack',
                details: error.response?.data?.errors || {},
            };
        }
    },

    update: async (id, packData) => {
        try {
            const response = await apiClient.put(ENDPOINTS.ADMIN.PACKS.DETAIL(id), packData);
            return {
                success: true,
                data: response.data.pack,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la modification du pack',
                details: error.response?.data?.errors || {},
            };
        }
    },

    remove: async (id) => {
        try {
            const response = await apiClient.delete(ENDPOINTS.ADMIN.PACKS.DETAIL(id));
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression du pack',
                details: error.response?.data?.errors || {},
            };
        }
    },
};