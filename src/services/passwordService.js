import apiClient from '../config/api';
import ENDPOINTS from '../config/endpoints';

export const passwordService = {
    // Demande de réinitialisation
    requestReset: async (email) => {
        try {
            await apiClient.post(ENDPOINTS.PASSWORD.REQUEST_RESET, { email });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la demande'
            };
        }
    },
    // Réinitialisation effective
    resetPassword: async (token, newPassword) => {
        try {
            await apiClient.post(ENDPOINTS.PASSWORD.RESET, { token, password: newPassword });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la réinitialisation'
            };
        }
    }
};