import apiClient from '../config/api';

export const zoneService = {
    sendZone: async (zoneData) => {
        try {
            await apiClient.post('/service-orders', zoneData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'envoi de la zone'
            };
        }
    },
    getZone: async (clientId) => {
        try {
            await apiClient.get(`/service-orders/${clientId}`);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'envoi de la zone'
            }
        }
    }
};