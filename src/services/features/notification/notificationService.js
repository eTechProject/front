import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const notificationService = {
    getNotification: async (userId, params = {}) => {
        try {
            const url = ENDPOINTS.NOTIFICATION.GET(userId);
            const response = await apiClient.get(url, { params });
            return {
                success: true,
                notifications: response.data,
                ...response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || "Erreur lors de la récupération des notifications"
            };
        }
    },

    getMercureToken: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.NOTIFICATION.MERCURE_TOKEN);
            return {
                success: true,
                token: response.data.mercureToken,
                topics: response.data.topics,
                expires_in: response.data.expires_in,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || "Erreur lors de la récupération du token Mercure pour les notifications"
            };
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            const url = ENDPOINTS.NOTIFICATION.MARK_READ(notificationId);
            const response = await apiClient.patch(url);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || "Erreur lors du marquage de la notification comme lue"
            };
        }
    },

    markAllNotificationsRead: async () => {
        try {
            const url = ENDPOINTS.NOTIFICATION.MARK_ALL_READ;
            const response = await apiClient.patch(url);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || "Erreur lors du marquage de toutes les notifications comme lues"
            };
        }
    },
};