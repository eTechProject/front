import apiClient from "@/services/config/api.js";
import ENDPOINTS from "@/services/config/endpoints.js";

export const orderService = {
    cancelTask: async (taskId) => {
        try {
            const response = await apiClient.post(ENDPOINTS.CLIENT.CANCEL_TASK, {
                'taskId' : taskId
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de l'annulation de la tâche",
                details: error.response?.data?.errors || {}
            };
        }
    }
};