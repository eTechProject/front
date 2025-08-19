import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const locationService = {
    // Send location data to the server
    sendLocation: async (agentId, locationData) => {
        const endpoint = ENDPOINTS.AGENT.LOCATIONS(agentId);
        
        try {
            const response = await apiClient.post(endpoint, locationData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('LocationService - Error sending location:', error.response?.data?.message || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'envoi de la position',
                details: error.response?.data?.errors || {}
            };
        }
    }
};
