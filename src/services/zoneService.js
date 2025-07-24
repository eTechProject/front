import apiClient from '../config/api';

export const zoneService = {
    sendZone: async (zoneData) => {
        try {
            const response = await apiClient.post('/service-orders', zoneData);
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
            const response = await apiClient.get(`/service-orders/client/${clientId}`);
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