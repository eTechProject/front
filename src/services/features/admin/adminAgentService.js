import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const adminAgentService = {
    // Liste tous les agents, avec params de pagination
    getAllAgents: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.AGENTS.LIST, { params });
            return {
                success: true,
                data: response.data,
                pagination: response.pagination
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des agents',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Recherche des agents
    searchAgents: async (params = {}) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.AGENTS.SEARCH, { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la recherche des agents',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Récupère un agent par son id
    getAgent: async (id) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.AGENTS.DETAIL(id));
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
    createAgent: async (agentData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ADMIN.AGENTS.CREATE, agentData);
            return {
                success: true,
                data: response.data,
                message: response.message
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
    updateAgent: async (id, agentData) => {
        try {
            const response = await apiClient.put(ENDPOINTS.ADMIN.AGENTS.DETAIL(id), agentData);
            return {
                success: true,
                data: response.data, // agent maj (objet)
                message: response.message
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
    removeAgent: async (id) => {
        try {
            const response = await apiClient.delete(ENDPOINTS.ADMIN.AGENTS.DETAIL(id));
            return {
                success: true,
                message: response.message,
                deletedUserRole: response.deletedUserRole
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression de l\'agent',
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Récupère les tâches assignées à un agent
    getAgentTasks: async (agentId) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.AGENTS.AGENT_TASKS(agentId));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des tâches de l\'agent',
                details: error.response?.data?.errors || {}
            };
        }
    }

};