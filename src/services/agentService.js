import apiClient from '../config/api';
import ENDPOINTS from '../config/endpoints';

export const agentService = {
    // Liste tous les agents, avec params de filtre optionnels
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.AGENT.LIST, { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des agents',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Récupère un agent par son id
    get: async (id) => {
        try {
            const response = await apiClient.get(ENDPOINTS.AGENT.DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement de l\'agent',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Crée un nouvel agent
    create: async (agentData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.AGENT.CREATE, agentData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la création de l\'agent',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Met à jour un agent existant
    update: async (id, agentData) => {
        try {
            const response = await apiClient.put(ENDPOINTS.AGENT.DETAIL(id), agentData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la modification de l\'agent',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Supprime un agent
    remove: async (id) => {
        try {
            const response = await apiClient.delete(ENDPOINTS.AGENT.DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression de l\'agent',
                details: error.response?.data?.errors || {}
            };
        }
    },
    // Récupère les tâches assignées à un agent (clients à contacter)
    getAssignedTasks: async (agentId) => {
        try {
            const response = await apiClient.get(ENDPOINTS.AGENT.GET_TASKS_MESSAGE(agentId));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des tâches assignées',
                details: error.response?.data?.errors || {}
            };
        }
    },
};