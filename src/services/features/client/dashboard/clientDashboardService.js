import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const clientDashboardService = {
    getDashboard: async (clientId, params = {}) => {
        try {
            let query = '';
            if (params.choice) {
                query = `?choice=${params.choice}`;
            } else if (params.dateStart && params.dateEnd) {
                query = `?dateStart=${params.dateStart}&dateEnd=${params.dateEnd}`;
            }

            const response = await apiClient.get(`${ENDPOINTS.CLIENT.DASHBOARD(clientId)}${query}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du chargement des données du tableau de bord',
                details: error.response?.data?.errors || {},
            };
        }
    },
};