import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from "@/services/auth/authService.js";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    // États principaux - maintenant basés uniquement sur le token JWT
    const [user, setUser] = useState(authService.getCurrentUser());
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(authService.getUserRole());
    const [error, setError] = useState(null);
    // New state for intended URL
    const [intendedUrl, setIntendedUrl] = useState(null);

    const logoutTimerRef = useRef(null);

    /**
     * Met à jour l'état d'authentification en fonction du token JWT uniquement.
     * Appelé après login, logout ou synchronisation entre onglets.
     */
    const updateAuthState = useCallback(() => {
        const currentUser = authService.getCurrentUser();
        const authenticated = authService.isAuthenticated();
        const role = authService.getUserRole();

        setUser(currentUser);
        setIsAuthenticated(authenticated);
        setUserRole(role);
    }, []);

    /**
     * Programme une déconnexion automatique lorsque le token JWT expire.
     * Utilise directement le payload du token pour obtenir l'expiration.
     */
    const scheduleAutoLogout = useCallback(() => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }

        const payload = authService.getTokenPayload();
        if (payload && payload.exp) {
            const expireMs = payload.exp * 1000 - Date.now();
            if (expireMs > 0) {
                logoutTimerRef.current = setTimeout(() => {
                    logout();
                }, expireMs);
            } else {
                logout();
            }
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            scheduleAutoLogout();
        } else {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        }
        return () => {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        };
    }, [isAuthenticated, scheduleAutoLogout]);

    /**
     * Fonction de connexion utilisateur.
     * En cas de succès, met à jour l'état et programme la déconnexion automatique.
     */
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login(credentials);
            if (result.success) {
                updateAuthState();
                scheduleAutoLogout();
                const role = authService.getUserRole();
                return {
                    success: true,
                    data: result.data,
                    role: role
                };
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
    }, [updateAuthState, scheduleAutoLogout]);

    /**
     * Fonction d'inscription utilisateur (pas de login automatique ici).
     */
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

    /**
     * Fonction de déconnexion utilisateur.
     * Nettoie le localStorage (token uniquement), met à jour l'état et annule le timer.
     */
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            updateAuthState();
            setIntendedUrl(null);
        } finally {
            setIsLoading(false);
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        }
    }, [updateAuthState]);

    const clearError = useCallback(() => setError(null), []);

    const refreshTokenData = useCallback(() => {
        updateAuthState();
        scheduleAutoLogout();
    }, [updateAuthState, scheduleAutoLogout]);

    const setIntendedRedirect = useCallback((url) => {
        setIntendedUrl(url);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                updateAuthState();
                scheduleAutoLogout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [updateAuthState, scheduleAutoLogout]);

    useEffect(() => {
        updateAuthState();
    }, [updateAuthState]);

    const isAdmin = userRole === "admin";
    const isAgent = userRole === "agent";
    const isClient = userRole === "client";

    const getUserId = useCallback(() => {
        return authService.getUserId();
    }, []);

    const isTokenExpiringSoon = useCallback((minutes = 5) => {
        return authService.isTokenExpiringSoon(minutes);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isAdmin,
            isAgent,
            isClient,
            userRole,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError,
            getUserId,
            isTokenExpiringSoon,
            refreshTokenData,
            intendedUrl,
            setIntendedRedirect
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};