import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const adminClientService = {

    // Liste tous les clients avec pagination et filtres
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.CLIENTS.LIST, { params });
            return {
                success: true,
                data: response.data,
                pagination: response.pagination
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des clients',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Recherche de clients
    search: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.CLIENTS.SEARCH, { params });
            return {
                success: true,
                data: response.data,
                meta: response.data.meta
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la recherche des clients',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Crée un nouveau client
    create: async (clientData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ADMIN.CLIENTS.CREATE, clientData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la création du client',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Met à jour un client existant
    update: async (id, clientData) => {
        try {
            const response = await apiClient.put(ENDPOINTS.ADMIN.CLIENTS.DETAIL(id), clientData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la modification du client',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Supprime un client
    remove: async (id) => {
        try {
            const response = await apiClient.delete(ENDPOINTS.ADMIN.CLIENTS.DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression du client',
                details: error.response?.data?.errors || {}
            };
        }
    }
};