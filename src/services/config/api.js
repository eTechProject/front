import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur pour les requêtes (ajouter le token automatiquement)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour les réponses (gestion des erreurs globales)
apiClient.interceptors.response.use(
    (response) => {
        if (response.data && response.data.data) {
            const { total, page, pages } = response.data;
            const hasPagination = typeof total !== 'undefined' && typeof page !== 'undefined' && typeof pages !== 'undefined';
            return {
                ...response,
                data: response.data.data,
                ...(hasPagination && {
                    pagination: { total, page, pages }
                })
            };
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/auth';
        }

        // Gestion spécifique des erreurs 422 (validation)
        if (error.response?.status === 422) {
            return Promise.reject({
                ...error,
                response: {
                    ...error.response,
                    data: {
                        success: false,
                        message: error.response.data.message || 'Échec de la validation',
                        errors: error.response.data.errors || {}
                    }
                }
            });
        }

        // Gestion des autres erreurs
        return Promise.reject({
            ...error,
            response: {
                ...error.response,
                data: {
                    success: false,
                    message: error.response?.data?.message || 'Une erreur est survenue',
                    errors: error.response?.data?.errors || {}
                }
            }
        });
    }
);

export default apiClient;