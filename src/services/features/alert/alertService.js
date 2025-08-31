import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const alertService = {
    createAlert: async (alertData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ALERT.SEND, {
                userId: alertData.userId,
                type: alertData.type
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la création de l'alerte",
                details: error.response?.data?.errors || {}
            };
        }
    }
};