import apiClient from '../config/api';
import ENDPOINTS from '../config/endpoints';

export const zoneService = {
    sendZone: async (zoneData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ZONE.SEND, zoneData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.message || 'Erreur lors de l\'envoi de la zone'
            };
        }
    },
    getZone: async (clientId) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ZONE.GET_BY_CLIENT(clientId));
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.message || 'Erreur lors de la récupération de la zone'
            }
        }
    }
};