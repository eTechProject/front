import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateAuthState = useCallback(() => {
        setUser(authService.getCurrentUser());
        setIsAuthenticated(authService.isAuthenticated());
    }, []);

    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login(credentials);
            if (result.success) {
                updateAuthState();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error, details: result.details };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur de connexion';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [updateAuthState]);

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
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
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
            updateAuthState();
        } finally {
            setIsLoading(false);
        }
    }, [updateAuthState]);

    const clearError = useCallback(() => setError(null), []);

    // Synchronisation entre onglets
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                updateAuthState();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [updateAuthState]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};