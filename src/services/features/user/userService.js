import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";


export const userService = {
    // Récupérer le profil utilisateur
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

    // Mettre à jour le profil
    updateProfile: async (userId, profileData) => {
        try {
            const response = await apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE(userId), {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone
            });
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

    // Mettre à jour le mot de passe
    updatePassword: async (userId, passwordData) => {
        try {
            const response = await apiClient.put(
                ENDPOINTS.USER.UPDATE_PASSWORD(userId),
                {
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword
                }
            );
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors du changement de mot de passe",
                details: error.response?.data?.errors || {}
            };
        }
    },

    // Mettre à jour l'avatar
    updateAvatar: async (avatarFile) => {
        try {
            const formData = new FormData();
            formData.append("picture", avatarFile);
            const response = await apiClient.put(ENDPOINTS.USER.AVATAR, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors du changement d'avatar",
                details: error.response?.data?.errors || {}
            };
        }
    }
};