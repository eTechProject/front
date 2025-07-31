import apiClient from '../config/api';
import ENDPOINTS from '../config/endpoints';

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

    logout: async () => {
        try {
            // await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUserRole: () => {
        const user = authService.getCurrentUser();
        return user && user.role ? user.role : null;
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};