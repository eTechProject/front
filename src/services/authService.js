import apiClient from '../config/api';

export const authService = {
    // Inscription
    register: async (userData) => {
        try {
            const response = await apiClient.post('/register', userData);
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

    // Connexion
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/login_check', credentials);
            // Stocker le token et les infos utilisateur
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

    // Déconnexion
    logout: async () => {
        try {
            //await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // Nettoyer le localStorage dans tous les cas
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Vérifier si l'utilisateur est connecté
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Obtenir l'utilisateur actuel
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};