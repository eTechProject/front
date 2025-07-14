import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login(credentials);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error, details: result.details };
            }
        } catch (error) {
            const errorMessage = 'Erreur de connexion. Veuillez réessayer.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.register(userData);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error, details: result.details };
            }
        } catch (error) {
            const errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        login,
        register,
        logout,
        isLoading,
        error,
        clearError,
        isAuthenticated: authService.isAuthenticated(),
        currentUser: authService.getCurrentUser()
    };
};