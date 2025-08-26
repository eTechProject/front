import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";
import { jwtDecode } from "jwt-decode";

export const authService = {
    register: async (userData) => {
        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'inscription',
                details: error.response?.data?.errors || {}
            };
        }
    },

    login: async (credentials) => {
        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            // Store refresh token and its expiration if present
            if (response.data.refresh_token) {
                localStorage.setItem('refresh_token', response.data.refresh_token);
            }
            if (response.data.refresh_token_expires_at) {
                localStorage.setItem('refresh_token_expires_at', response.data.refresh_token_expires_at);
            }
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la connexion',
                details: error.response?.data?.errors || {}
            };
        }
    },
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return { success: false, error: 'Aucun refresh token disponible' };
        }
        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
                refresh_token: refreshToken
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            if (response.data.refresh_token) {
                localStorage.setItem('refresh_token', response.data.refresh_token);
            }
            if (response.data.refresh_token_expires_at) {
                localStorage.setItem('refresh_token_expires_at', response.data.refresh_token_expires_at);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du rafraîchissement du token',
                details: error.response?.data?.errors || {}
            };
        }
    },

    logout: async () => {
        try {
            // await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('refresh_token_expires_at');
        }
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            // Token invalide
            localStorage.removeItem('token');
            return false;
        }
    },

    // Nouvelle méthode pour décoder le payload JWT
    getTokenPayload: () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // Vérifier si le token est encore valide
            if (decoded.exp <= currentTime) {
                localStorage.removeItem('token');
                return null;
            }

            return decoded;
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            localStorage.removeItem('token');
            return null;
        }
    },

    getUserRole: () => {
        const payload = authService.getTokenPayload();

        if (!payload || !payload.roles || !Array.isArray(payload.roles)) {
            return null;
        }

        const firstRole = payload.roles[0];
        if (!firstRole) return null;

        switch (firstRole) {
            case 'ROLE_ADMIN':
                return 'admin';
            case 'ROLE_AGENT':
                return 'agent';
            case 'ROLE_CLIENT':
                return 'client';
            default:
                return null;
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    refreshUserData: async (userId) => {
        try {
            const response = await apiClient.get(ENDPOINTS.USER.PROFILE(userId));
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return {
                success: true,
                user: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur de rafraîchissement'
            };
        }
    }
};