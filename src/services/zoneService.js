import apiClient from '../config/api';

export const zoneService = {
    sendZone: async (zoneData) => {
        try {
            await apiClient.post('/zones', zoneData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'envoi de la zone'
            };
        }
    }
};