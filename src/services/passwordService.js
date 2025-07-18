import apiClient from '../config/api';

export const passwordService = {
    // Demande de réinitialisation
    requestReset: async (email) => {
        try {
            await apiClient.post('/public/request-reset-password', { email });
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
            await apiClient.post('/public/reset-password', { token, password: newPassword });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la réinitialisation'
            };
        }
    }
};