import apiClient from '../config/api';
import ENDPOINTS from '../config/endpoints';

export const userService = {
    // Récupérer le profil utilisateur courant
    getProfile: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.USER.PROFILE);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors du chargement du profil",
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Mettre à jour le profil (nom, email, téléphone...)
    updateProfile: async (profile) => {
        try {
            const response = await apiClient.put(ENDPOINTS.USER.PROFILE, profile);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la mise à jour du profil",
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Mettre à jour l’avatar (upload image)
    updateAvatar: async (avatarFile) => {
        try {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            const response = await apiClient.post(ENDPOINTS.USER.AVATAR, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors du changement d’avatar",
                details: error.response?.data?.errors || {}
            };
        }
    }
};